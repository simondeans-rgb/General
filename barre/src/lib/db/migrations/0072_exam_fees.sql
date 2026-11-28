-- ============================================================================
-- 0072 · Exam fees: billing on entry, the exam-day register, unpaid reminders
-- ----------------------------------------------------------------------------
-- An exam session already has a fee per entry (0066), and "Bill N fees"
-- invoices the families (app.bill_exam). This adds:
--
--   1. Invoice on entry (optional, per exam): entering a child sends the
--      family an invoice for that child's fee straight away, whoever entered
--      them (the office or the child's teacher).
--   2. The exam-day register: each candidate in time order with whether
--      their fee is paid (Paid · Part paid · Unpaid · Not billed · No fee),
--      and Here / Absent for the day. For the office and the child's teachers.
--   3. Unpaid reminders: 24 hours before a candidate's exam (their time on
--      the examiner's timetable, or 09:00 on the day when none is set), if
--      the fee is not paid, the family is told and the office is told once
--      for that exam with who is unpaid. Each entry is reminded once. Runs
--      from app.tick. The office's Today shows unpaid fees for exams in the
--      next week.
-- ============================================================================

alter table exam_session add column if not exists bill_on_entry boolean not null default false;
alter table exam_entry
  add column if not exists attendance text check (attendance in ('here', 'absent')),
  add column if not exists attendance_at timestamptz,
  add column if not exists unpaid_reminded_at timestamptz;

-- When a candidate's exam starts, for reminders: their own time, else 09:00 school time on the day.
create or replace function app.exam_entry_starts_at(p_sits_at timestamptz, p_exam_on date, p_tz text) returns timestamptz
  language sql immutable as $$
  select coalesce(p_sits_at, (p_exam_on + time '09:00') at time zone coalesce(p_tz, 'Europe/London'));
$$;

-- The fee's state, in one word the screens share.
create or replace function app.exam_fee_state(p_fee int, p_invoice_status invoice_status, p_has_invoice boolean) returns text
  language sql immutable as $$
  select case
    when coalesce(p_fee, 0) = 0 then 'none'
    when not p_has_invoice or p_invoice_status in ('void', 'refunded') then 'unbilled'
    when p_invoice_status = 'paid' then 'paid'
    when p_invoice_status = 'part_paid' then 'part_paid'
    else 'unpaid' end;
$$;

-- Invoice-on-entry bills on the school's behalf when a teacher enters a child.
-- Only definer code in this migration can write this marker (nobody is granted
-- it), it lives for the one transaction, and it is removed straight after.
create table if not exists app.system_billing (tx bigint primary key);
revoke all on app.system_billing from public, authenticated, anon;

create or replace function app.require_admin(p_studio uuid) returns void
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if p_studio is null or not app.is_admin(p_studio) then
    if p_studio is not null and exists (select 1 from app.system_billing where tx = txid_current()) then return; end if;
    raise exception 'FORBIDDEN: only the studio office may change billing'
      using errcode = 'insufficient_privilege';
  end if;
end $$;

-- Billing, without the office check: used by "Bill N fees" and by invoice-on-entry.
create or replace function app.bill_exam_entries(p_session uuid, p_entry uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; f record; inv uuid; n int := 0;
begin
  select * into x from exam_session where id = p_session;
  for f in select s.family_id, jsonb_agg(jsonb_build_object('kind', 'exam_fee', 'description', x.board || ' ' || e.grade || ' — ' || s.first_name,
                    'quantity', 1, 'unit_minor', e.fee_minor, 'student_id', s.id)) items, array_agg(e.id) ids
             from exam_entry e join student s on s.id = e.student_id
            where e.session_id = x.id and e.status <> 'withdrawn' and e.fee_minor > 0
              and (e.invoice_id is null
                   or exists (select 1 from invoice i where i.id = e.invoice_id and i.status in ('void', 'refunded')))
              and (p_entry is null or e.id = p_entry)
            group by s.family_id loop
    inv := app.create_invoice(f.family_id, f.items,
             greatest(least(coalesce(x.entries_close_on, x.exam_on - 7), x.exam_on - 2), current_date + 1), null, 0, true, null);
    update exam_entry set invoice_id = inv where id = any(f.ids);
    if x.event_id is not null then update invoice_item set event_id = x.event_id where invoice_id = inv; end if;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function app.bill_exam_entries(uuid, uuid) from public, authenticated, anon;

create or replace function app.bill_exam(p_session uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session;
begin
  select * into x from exam_session where id = p_session;
  perform app.require_admin(x.studio_id);
  return app.bill_exam_entries(p_session, null);
end $$;

-- The office sets whether entering a child invoices the family straight away.
create or replace function app.set_exam_billing(p_session uuid, p_bill_on_entry boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session;
begin
  select * into x from exam_session where id = p_session and deleted_at is null;
  if x.id is null then raise exception 'NOT_FOUND: that exam' using errcode = 'no_data_found'; end if;
  perform app.require_admin(x.studio_id);
  update exam_session set bill_on_entry = coalesce(p_bill_on_entry, false) where id = x.id;
end $$;

-- Entering a child (as 0066), then the invoice when the exam asks for it.
create or replace function app.enter_exam(p_session uuid, p_student uuid, p_grade text, p_fee int default null, p_framework uuid default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare x exam_session; s student; eid uuid;
begin
  select * into x from exam_session where id = p_session and deleted_at is null;
  select * into s from student where id = p_student and deleted_at is null;
  if x.id is null or s.id is null or s.studio_id <> x.studio_id then raise exception 'NOT_FOUND: that exam' using errcode = 'no_data_found'; end if;
  if not (app.is_admin(x.studio_id) or (app.has_role(x.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: you can enter children you teach' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_grade), '') = '' then raise exception 'INVALID: which grade?' using errcode = 'check_violation'; end if;
  if x.entries_close_on is not null and x.entries_close_on < current_date and not app.is_admin(x.studio_id) then
    raise exception 'INVALID: entries for this exam have closed — ask the office' using errcode = 'check_violation';
  end if;
  insert into exam_entry (studio_id, session_id, student_id, grade, fee_minor, framework_id, entered_by)
  values (x.studio_id, x.id, s.id, btrim(p_grade), greatest(coalesce(p_fee, x.fee_minor, 0), 0), p_framework, auth.uid())
  on conflict (session_id, student_id, grade) do update set status = 'entered' returning id into eid;
  perform app.notify_family(s.family_id, 'milestone', s.first_name || ' is entered for ' || x.board || ' ' || btrim(p_grade),
                            to_char(x.exam_on, 'FMDay DD FMMonth') || coalesce(' at ' || x.venue, '') || ' · please confirm in Shows and events',
                            '/family/events');
  if x.bill_on_entry then
    insert into app.system_billing values (txid_current()) on conflict do nothing;
    perform app.bill_exam_entries(x.id, eid);
    delete from app.system_billing where tx = txid_current();
  end if;
  return eid;
end $$;

-- The exam-day register: candidates in time order, with the fee's state.
create or replace function app.exam_register(p_session uuid)
  returns table (entry_id uuid, student_id uuid, student text, grade text, sits_at timestamptz, status text,
                 attendance text, fee_minor int, fee_state text, due_on date, paid_minor int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.id, s.id, coalesce(s.preferred_name, s.first_name) || ' ' || s.last_name, e.grade, e.sits_at, e.status,
         e.attendance, e.fee_minor, app.exam_fee_state(e.fee_minor, i.status, i.id is not null), i.due_on,
         case when i.status in ('paid') then e.fee_minor end
    from exam_session x
    join exam_entry e on e.session_id = x.id and e.status <> 'withdrawn'
    join student s on s.id = e.student_id
    left join invoice i on i.id = e.invoice_id and i.deleted_at is null
   where x.id = p_session and x.deleted_at is null
     and not app.is_support_viewer(x.studio_id)
     and (app.is_admin(x.studio_id)
          or (app.has_role(x.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids())))
   order by e.sits_at nulls last, e.grade, s.last_name, s.first_name;
$$;

create or replace function app.mark_exam_attendance(p_entry uuid, p_mark text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e exam_entry;
begin
  select * into e from exam_entry where id = p_entry;
  if e.id is null or not (app.is_admin(e.studio_id) or (app.has_role(e.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: not your student' using errcode = 'insufficient_privilege';
  end if;
  if p_mark is not null and p_mark not in ('here', 'absent') then
    raise exception 'INVALID: mark here or absent' using errcode = 'check_violation';
  end if;
  if e.status = 'withdrawn' then raise exception 'INVALID: this entry was withdrawn' using errcode = 'check_violation'; end if;
  update exam_entry set attendance = p_mark, attendance_at = case when p_mark is null then null else now() end where id = e.id;
end $$;

-- Exams on or after today, for the teacher's and office's register link.
create or replace function app.my_exam_days(p_from date default current_date, p_to date default current_date + 7)
  returns table (session_id uuid, board text, title text, exam_on date, venue text, candidates int, unpaid int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select x.id, x.board, x.title, x.exam_on, x.venue, count(*)::int,
         count(*) filter (where app.exam_fee_state(e.fee_minor, i.status, i.id is not null) in ('unpaid', 'part_paid', 'unbilled'))::int
    from exam_session x
    join exam_entry e on e.session_id = x.id and e.status <> 'withdrawn'
    left join invoice i on i.id = e.invoice_id and i.deleted_at is null
   where x.deleted_at is null and x.exam_on between p_from and p_to
     and x.studio_id in (select app.studio_ids()) and not app.is_support_viewer(x.studio_id)
     and (app.is_admin(x.studio_id)
          or (app.has_role(x.studio_id, 'teacher') and e.student_id in (select app.teacher_student_ids())))
   group by x.id
   order by x.exam_on, x.title;
$$;

-- 24 hours before: one pass for one school. Returns how many notices went out.
create or replace function app.exam_fee_reminders(p_studio uuid, p_now timestamptz default now()) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; r record; ex record; n int := 0; owed text; tz text;
begin
  select * into st from studio where id = p_studio and deleted_at is null;
  if st.id is null then return 0; end if;
  tz := coalesce(st.timezone, 'Europe/London');
  create temporary table if not exists _exam_unpaid (session_id uuid, child text, grade text, fee int, state text) on commit drop;
  delete from _exam_unpaid;
  for r in
    select e.id, e.session_id, e.fee_minor, s.family_id, coalesce(s.preferred_name, s.first_name) child, s.last_name, e.grade,
           x.board, x.exam_on, x.venue, app.exam_entry_starts_at(e.sits_at, x.exam_on, tz) starts,
           app.exam_fee_state(e.fee_minor, i.status, i.id is not null) state, i.id invoice_id
      from exam_entry e
      join exam_session x on x.id = e.session_id and x.deleted_at is null
      join student s on s.id = e.student_id and s.deleted_at is null
      left join invoice i on i.id = e.invoice_id and i.deleted_at is null
     where e.studio_id = p_studio and e.status = 'entered' and e.fee_minor > 0 and e.unpaid_reminded_at is null
       and x.exam_on between (p_now at time zone tz)::date - 1 and (p_now at time zone tz)::date + 2
  loop
    continue when r.state not in ('unpaid', 'part_paid', 'unbilled');
    continue when not (p_now >= r.starts - interval '24 hours' and p_now < r.starts);
    owed := to_char(r.fee_minor / 100.0, 'FM£999,990.00');
    perform app.notify_family(r.family_id, 'exam_fee_unpaid',
      r.child || '’s exam fee is unpaid: ' || r.board || ' ' || r.grade,
      case r.state when 'unbilled' then 'The ' || owed || ' fee for ' || to_char(r.starts at time zone tz, 'FMDay DD FMMonth "at" HH24:MI')
                                         || ' has not been paid yet. Please contact the school before the exam.'
                   when 'part_paid' then 'Part of the ' || owed || ' fee is still owed for the exam on '
                                         || to_char(r.starts at time zone tz, 'FMDay DD FMMonth "at" HH24:MI') || '. Please pay before the exam.'
                   else 'The ' || owed || ' fee for the exam on ' || to_char(r.starts at time zone tz, 'FMDay DD FMMonth "at" HH24:MI')
                        || ' has not been paid. Please pay before the exam.' end,
      case when r.invoice_id is not null then '/family/payments' else '/family/events' end);
    update exam_entry set unpaid_reminded_at = p_now where id = r.id;
    insert into _exam_unpaid values (r.session_id, r.child || ' ' || r.last_name, r.grade, r.fee_minor, r.state);
    n := n + 1;
  end loop;
  -- The office: once per exam per pass, with who is unpaid.
  for ex in select u.session_id, xs.board, xs.title, xs.exam_on, count(*)::int k,
                  string_agg(u.child || ' (' || u.grade || case u.state when 'unbilled' then ', not billed' when 'part_paid' then ', part paid' else '' end || ')',
                             ', ' order by u.child) who
             from _exam_unpaid u join exam_session xs on xs.id = u.session_id group by u.session_id, xs.board, xs.title, xs.exam_on loop
    perform app.notify_admins(p_studio, 'exam_fee_unpaid',
      'Exam fees unpaid: ' || ex.k || ' for ' || case when ex.title ilike '%' || ex.board || '%' then ex.title else ex.board || ' ' || ex.title end
        || ', ' || to_char(ex.exam_on, 'FMDy DD FMMon'),
      left(ex.who, 400) || '. The families have been reminded.',
      '/exams/register/?session=' || ex.session_id);
    n := n + 1;
  end loop;
  return n;
end $$;

-- For the office's Today: unpaid exam fees for exams in the coming week.
create or replace function app.exam_fees_unpaid(p_studio uuid)
  returns table (session_id uuid, title text, exam_on date, unpaid int, unbilled int, owed_minor int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select x.id, case when x.title ilike '%' || x.board || '%' then x.title else x.board || ' ' || x.title end, x.exam_on,
         count(*) filter (where st in ('unpaid', 'part_paid'))::int, count(*) filter (where st = 'unbilled')::int, sum(fee)::int
    from (select e.session_id, e.fee_minor fee, app.exam_fee_state(e.fee_minor, i.status, i.id is not null) st
            from exam_entry e left join invoice i on i.id = e.invoice_id and i.deleted_at is null
           where e.studio_id = p_studio and e.status = 'entered') q
    join exam_session x on x.id = q.session_id and x.deleted_at is null
   where app.is_admin(p_studio) and q.st in ('unpaid', 'part_paid', 'unbilled')
     and x.exam_on between current_date and current_date + 7
   group by x.id order by x.exam_on;
$$;

revoke all on function app.exam_fee_reminders(uuid, timestamptz) from public, authenticated, anon;
grant execute on function app.exam_fee_reminders(uuid, timestamptz) to service_role;
revoke all on function app.set_exam_billing(uuid, boolean), app.exam_register(uuid), app.mark_exam_attendance(uuid, text),
                       app.my_exam_days(date, date), app.exam_fees_unpaid(uuid) from public;
grant execute on function app.set_exam_billing(uuid, boolean), app.exam_register(uuid), app.mark_exam_attendance(uuid, text),
                          app.my_exam_days(date, date), app.exam_fees_unpaid(uuid),
                          app.exam_fee_state(int, invoice_status, boolean), app.exam_entry_starts_at(timestamptz, date, text) to authenticated;

-- The scheduled tick (as in 0070) also sends exam fee reminders.
create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
        due int := 0; offers int := 0; n int; moves int := 0; ret int := 0; regs int := 0; exams int := 0;
begin
  holds := app.expire_held_drop_ins();
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
    -- Waiting-list offers past their expiry go to the next family (UR-19).
    begin
      n := app.expire_waitlist_offers(s.id);
      offers := offers + coalesce(n, 0);
    exception when others then null;   -- one school's data must not stop the rest
    end;
    -- Planned class moves whose day has come (UR-52).
    begin
      moves := moves + coalesce(app.complete_class_moves(s.id), 0);
    exception when others then null;
    end;
    due := due + coalesce(app.notify_invoices_due(s.id), 0);
    -- Monthly retention preview, and the opt-in automatic apply.
    begin
      if app.retention_tick(s.id) is not null then ret := ret + 1; end if;
    exception when others then null;
    end;
    -- Registers left incomplete: the teacher, then the office (0070).
    begin
      regs := regs + coalesce(app.register_reminders(s.id), 0);
    exception when others then null;
    end;
    -- Exam fees unpaid 24 hours before the exam: the family and the office (0072).
    begin
      exams := exams + coalesce(app.exam_fee_reminders(s.id), 0);
    exception when others then null;
    end;
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'invoices_due', due,
                            'offers_expired', offers, 'moves', moves, 'retention', ret,
                            'register_reminders', regs, 'exam_fee_reminders', exams, 'at', now());
end $$;

-- Policies added since 0068 (register_reminder in 0070) ask the office check
-- once per query too.
select app.speed_up_policies();
