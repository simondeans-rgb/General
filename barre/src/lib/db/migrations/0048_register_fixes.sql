-- ============================================================================
-- 0048 · Register fixes from the end-user panel (UR-04, UR-07, UR-27, UR-36,
--        UR-37, UR-49, UR-54, UR-56)
-- ----------------------------------------------------------------------------
--  1. School settings: register window, travel between sites, make-ups.
--  2. Marks know what kind of mark they are, so a late "mark the rest" can
--     never overwrite a mark someone actually made (UR-04).
--  3. Registers can be changed only around the class; the office amends
--     later with a reason (UR-37).
--  4. Absence reports reach the session and the register (UR-07), and
--     students of 13 and over can report their own (UR-49).
--  5. Cancelling tells booked trial families before their trial is cancelled,
--     and asks the office to rebook (UR-36). Students hear about
--     cancellations and cover in their own bell (UR-49).
--  6. Cover: a clash check with travel time, a handover note, and access to
--     the children only on the day (UR-27).
--  7. Make-up offers after a cancellation or a reported absence (UR-56).
--  8. Small things: a session's state for a stale link, attendance "this
--     term" (UR-54).
-- ============================================================================

-- ── 1. Settings ────────────────────────────────────────────────────────────
alter table studio add column register_opens_before_min smallint not null default 30
  check (register_opens_before_min between 0 and 720);
alter table studio add column register_edit_days smallint not null default 7
  check (register_edit_days between 0 and 60);
alter table studio add column cover_travel_min smallint not null default 20
  check (cover_travel_min between 0 and 240);
-- off: no make-ups offered · cancelled: when the school cancels a class ·
-- cancelled_and_absence: also when a family reports an absence in advance.
alter table studio add column makeup_policy text not null default 'off'
  check (makeup_policy in ('off', 'cancelled', 'cancelled_and_absence'));
alter table studio add column makeup_window_days smallint not null default 28
  check (makeup_window_days between 1 and 120);

-- ── 2. What kind of mark ───────────────────────────────────────────────────
-- explicit: a teacher or the office tapped this child · reported: the family
-- said in advance · rest: "Mark the rest here". An explicit mark beats the
-- others whatever the clocks say; between marks of the same kind the later
-- device time wins (MARK_ATTENDANCE in lib/repos/teaching.ts).
alter table attendance_record add column mark_kind text not null default 'explicit'
  check (mark_kind in ('explicit', 'reported', 'rest'));

create or replace function app.mark_rank(p_kind text) returns int
  language sql immutable as $$
  select case p_kind when 'rest' then 0 when 'reported' then 1 else 2 end
$$;
grant execute on function app.mark_rank(text) to authenticated, service_role, anon;

-- ── 3. The register window ─────────────────────────────────────────────────
create or replace function app.register_window(p_session uuid)
  returns table (opens_at timestamptz, closes_at timestamptz, state text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select cs.starts_at - make_interval(mins => st.register_opens_before_min),
         cs.ends_at + make_interval(days => st.register_edit_days),
         case when now() < cs.starts_at - make_interval(mins => st.register_opens_before_min) then 'early'
              when now() > cs.ends_at + make_interval(days => st.register_edit_days) then 'late'
              else 'open' end
    from class_session cs join studio st on st.id = cs.studio_id
   where cs.id = p_session
$$;
revoke all on function app.register_window(uuid) from public;
grant execute on function app.register_window(uuid) to authenticated, service_role;

-- Writes outside the window are refused, for teachers and the office alike.
-- The office amends through app.amend_attendance, which records why.
-- Advance absence reports (mark_kind 'reported', before the class) and work
-- with no signed-in user or as the service role (the seed, imports, server
-- jobs) are not register-taking.
create or replace function app.guard_register_window() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare w record;
begin
  if auth.uid() is null or current_setting('role', true) = 'service_role' then return new; end if;
  -- Anyone else who may not write this register is refused by the policies.
  if not (app.is_admin(new.studio_id) or exists (select 1 from class_session cs where cs.id = new.session_id
            and cs.class_id in (select app.teacher_class_ids()))) and new.mark_kind <> 'reported' then
    return new;
  end if;
  select * into w from app.register_window(new.session_id);
  if w.state is null or w.state = 'open' then return new; end if;
  if new.mark_kind = 'reported' and w.state = 'early' then return new; end if;
  if app.is_admin(new.studio_id) and coalesce(current_setting('app.amend_reason', true), '') <> '' then return new; end if;
  if w.state = 'early' then
    raise exception 'REGISTER_LOCKED: this register opens at % — % minutes before the class',
      to_char(w.opens_at at time zone (select timezone from studio where id = new.studio_id), 'HH24:MI "on" FMDay FMDD FMMonth'),
      (select register_opens_before_min from studio where id = new.studio_id)
      using errcode = 'check_violation';
  end if;
  raise exception 'REGISTER_LOCKED: this register can no longer be changed — ask the office to amend it'
    using errcode = 'check_violation';
end $$;
create trigger attendance_window_guard before insert or update on attendance_record
  for each row execute function app.guard_register_window();

-- The office changes an old register, saying why. Audited.
create or replace function app.amend_attendance(p_session uuid, p_student uuid, p_status attendance_status, p_reason text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; lbl text;
begin
  select studio_id into sid from class_session where id = p_session and deleted_at is null;
  if sid is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(sid) then raise exception 'FORBIDDEN: only the office can amend a register' using errcode = 'insufficient_privilege'; end if;
  if coalesce(btrim(p_reason), '') = '' then raise exception 'INVALID: say why the register is being amended' using errcode = 'check_violation'; end if;
  perform set_config('app.amend_reason', btrim(p_reason), true);
  insert into attendance_record (studio_id, session_id, student_id, status, marked_by, client_marked_at, mark_kind)
  values (sid, p_session, p_student, p_status, auth.uid(), now(), 'explicit')
  on conflict (session_id, student_id) do update
    set status = excluded.status, reason = null, marked_by = excluded.marked_by, marked_at = now(),
        client_marked_at = excluded.client_marked_at, mark_kind = 'explicit', reported_by_guardian = false,
        updated_at = now();
  perform set_config('app.amend_reason', '', true);
  lbl := app.session_label(p_session);
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'amend_register', 'class_session', p_session,
          lbl || ': ' || (select first_name || ' ' || last_name from student where id = p_student)
              || ' → ' || p_status::text || ' (' || btrim(p_reason) || ')');
end $$;
revoke all on function app.amend_attendance(uuid, uuid, attendance_status, text) from public;
grant execute on function app.amend_attendance(uuid, uuid, attendance_status, text) to authenticated, service_role;

-- Closing follows the same window for teachers.
create or replace function app.close_register(p_session uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; unmarked integer; w record;
begin
  select cs.studio_id, cs.class_id into sid, cid
    from class_session cs where cs.id = p_session and cs.deleted_at is null;
  if sid is null then return false; end if;

  if not (app.is_admin(sid) or cid in (select app.teacher_class_ids())) then
    raise exception 'FORBIDDEN: not your class' using errcode = 'insufficient_privilege';
  end if;
  select * into w from app.register_window(p_session);
  if w.state <> 'open' and not app.is_admin(sid) then
    raise exception 'REGISTER_LOCKED: %', case w.state when 'early' then 'this class has not started yet'
      else 'this register can no longer be changed — ask the office' end using errcode = 'check_violation';
  end if;

  select count(*)::int into unmarked
    from enrolment e
   where e.class_id = cid and e.status = 'active' and e.deleted_at is null
     and not exists (select 1 from attendance_record ar
                      where ar.session_id = p_session and ar.student_id = e.student_id
                        and ar.deleted_at is null);
  if unmarked > 0 then
    raise exception 'REGISTER_INCOMPLETE: % still unmarked', unmarked
      using errcode = 'check_violation';
  end if;

  update class_session set register_closed_at = now(), updated_at = now() where id = p_session;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'close_register', 'class_session', p_session, 'register closed');
  return true;
end $$;

-- ── 4. Absence reports ─────────────────────────────────────────────────────
create table absence_report (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  session_id   uuid not null references class_session(id) on delete cascade,
  note         text,
  reporter     text not null check (reporter in ('guardian', 'student')),
  reported_by  uuid references user_account(id) on delete set null,
  status       text not null default 'active' check (status in ('active', 'withdrawn')),
  communication_id uuid references communication(id) on delete set null,
  created_at   timestamptz not null default now(),
  withdrawn_at timestamptz
);
create unique index absence_report_once on absence_report (session_id, student_id) where status = 'active';
create index absence_report_student on absence_report (student_id, created_at desc);
alter table absence_report enable row level security;
alter table absence_report force row level security;
-- Read: the office, the class's teachers (cover on the day), the child's own
-- guardians and the student. Writes go through the functions below.
create policy absence_report_read on absence_report for select using (
  studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or exists (select 1 from class_session cs where cs.id = absence_report.session_id
                 and cs.class_id in (select app.teacher_class_ids()))
    or student_id in (select app.guardian_student_ids())
    or student_id = app.student_self_id()));
grant select on absence_report to authenticated;
grant all on absence_report to service_role;

-- Who may report for a child: their own guardians, or the student when 13+.
create or replace function app.may_report_absence(p_student uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case
    when p_student in (select app.guardian_student_ids()) then 'guardian'
    when p_student = app.student_self_id()
         and extract(year from age(current_date, (select date_of_birth from student where id = p_student))) >= 13 then 'student'
  end
$$;
grant execute on function app.may_report_absence(uuid) to authenticated;

-- The child's own classes still to come: enrolled classes, a booked trial,
-- drop-ins and make-ups. Only these days can be reported.
create or replace function app.absence_options(p_student uuid, p_days int default 42)
  returns table (session_id uuid, class_name text, starts_at timestamptz, ends_at timestamptz,
                 report_id uuid, note text, withdrawable boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if app.may_report_absence(p_student) is null then
    raise exception 'FORBIDDEN: only a child''s own family can report an absence' using errcode = 'insufficient_privilege';
  end if;
  return query
  with mine as (
    select cs.id from class_session cs
      join enrolment e on e.class_id = cs.class_id and e.student_id = p_student and e.status = 'active' and e.deleted_at is null
    union select t.session_id from trial t where t.student_id = p_student and t.status = 'booked' and t.deleted_at is null and t.session_id is not null
    union select d.session_id from drop_in_booking d where d.student_id = p_student and d.status = 'booked'
  )
  select cs.id, c.name, cs.starts_at, cs.ends_at, r.id, r.note, (r.id is not null and cs.starts_at > now())
    from mine join class_session cs on cs.id = mine.id
    join class c on c.id = cs.class_id
    left join absence_report r on r.session_id = cs.id and r.student_id = p_student and r.status = 'active'
   where cs.deleted_at is null and cs.status = 'scheduled'
     and cs.starts_at > now() and cs.starts_at < now() + make_interval(days => greatest(1, least(p_days, 180)))
   order by cs.starts_at;
end $$;
revoke all on function app.absence_options(uuid, int) from public;
grant execute on function app.absence_options(uuid, int) to authenticated;

-- One report per session. It pre-marks the register "excused" (reported), a
-- mark the teacher can change on the day; a copy goes to the office inbox.
create or replace function app.report_absence(p_student uuid, p_sessions uuid[], p_note text default null)
  returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare who text; s student; sess record; n int := 0; days text[] := '{}'; cid uuid; note text; policy text;
begin
  who := app.may_report_absence(p_student);
  if who is null then
    raise exception 'FORBIDDEN: only a child''s own family can report an absence' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(array_length(p_sessions, 1), 0) = 0 then
    raise exception 'INVALID: choose at least one class' using errcode = 'check_violation';
  end if;
  select * into s from student where id = p_student;
  note := nullif(btrim(coalesce(p_note, '')), '');
  for sess in
    select cs.id, cs.starts_at, c.name from class_session cs join class c on c.id = cs.class_id
     where cs.id = any (p_sessions) order by cs.starts_at
  loop
    if not exists (select 1 from app.absence_options(p_student, 180) o where o.session_id = sess.id) then
      raise exception 'INVALID: % on % is not a class % can be reported absent from — it has started, finished or is not theirs. Send a message instead.',
        sess.name, to_char(sess.starts_at, 'FMDD Mon'), s.first_name using errcode = 'check_violation';
    end if;
    insert into absence_report (studio_id, student_id, session_id, note, reporter, reported_by)
    values (s.studio_id, s.id, sess.id, note, who, auth.uid())
    on conflict (session_id, student_id) where status = 'active' do update set note = excluded.note;
    insert into attendance_record (studio_id, session_id, student_id, status, reason, reported_by_guardian,
                                   marked_by, client_marked_at, mark_kind)
    values (s.studio_id, sess.id, s.id, 'excused', note, true, auth.uid(), now(), 'reported')
    on conflict (session_id, student_id) do update
      set status = 'excused', reason = excluded.reason, reported_by_guardian = true, marked_by = excluded.marked_by,
          marked_at = now(), client_marked_at = excluded.client_marked_at, mark_kind = 'reported', updated_at = now()
      where app.mark_rank(attendance_record.mark_kind) <= 1;
    days := days || (sess.name || ' ' || to_char(sess.starts_at at time zone (select timezone from studio where id = s.studio_id), 'FMDy DD Mon'));
    n := n + 1;
  end loop;

  -- The office's copy, in the inbox as before.
  insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
  values (s.studio_id, 'direct', 'in_app', s.family_id,
          'Absence: ' || s.first_name || ' — ' || array_to_string(days, ', '),
          coalesce(note, s.first_name || ' will not be at class.')
            || case when who = 'student' then E'\n\nReported by ' || s.first_name || ' in the student app.' else '' end,
          auth.uid())
  returning id into cid;
  update absence_report set communication_id = cid
   where student_id = s.id and session_id = any (p_sessions) and status = 'active';

  -- A student's own report also tells their family (UR-49); the office hears
  -- through the inbox copy above, as for any message from a family.
  if who = 'student' then
    perform app.notify_family(s.family_id, 'absence_reported', s.first_name || ' can’t make ' || array_to_string(days, ', '),
      coalesce(note, 'Reported in the student app.'), '/family/children');
  end if;

  select makeup_policy into policy from studio where id = s.studio_id;
  if policy = 'cancelled_and_absence' then
    perform app.offer_makeup(s.id, x, 'absence') from unnest(p_sessions) x;
  end if;
  return n;
end $$;
revoke all on function app.report_absence(uuid, uuid[], text) from public;
grant execute on function app.report_absence(uuid, uuid[], text) to authenticated;

-- Changed their mind: allowed until the class starts.
create or replace function app.withdraw_absence(p_report uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r absence_report; starts timestamptz; lbl text;
begin
  select * into r from absence_report where id = p_report and status = 'active';
  if r.id is null then raise exception 'NOT_FOUND: that report' using errcode = 'no_data_found'; end if;
  if app.may_report_absence(r.student_id) is null then
    raise exception 'FORBIDDEN: not your report' using errcode = 'insufficient_privilege';
  end if;
  select starts_at into starts from class_session where id = r.session_id;
  if starts <= now() then
    raise exception 'INVALID: the class has started, so the teacher has the register now — send the studio a message instead'
      using errcode = 'check_violation';
  end if;
  update absence_report set status = 'withdrawn', withdrawn_at = now() where id = r.id;
  -- Only the family's pre-mark goes; a mark the teacher made stays.
  delete from attendance_record where session_id = r.session_id and student_id = r.student_id and mark_kind = 'reported';
  update makeup_offer set status = 'withdrawn', updated_at = now()
   where from_session_id = r.session_id and student_id = r.student_id and reason = 'absence' and status = 'open';
  lbl := app.session_label(r.session_id);
  insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by, reply_to)
  select r.studio_id, 'direct', 'in_app', s.family_id, 'Absence withdrawn: ' || s.first_name || ' — ' || lbl,
         s.first_name || ' will be at ' || lbl || ' after all.', auth.uid(), r.communication_id
    from student s where s.id = r.student_id;
end $$;
revoke all on function app.withdraw_absence(uuid) from public;
grant execute on function app.withdraw_absence(uuid) to authenticated;

-- ── 5. Cancelling: trial families first, then the office rebooks (UR-36) ──
-- Students with their own login hear about changes too (UR-49).
create or replace function app.announce_session(p_session uuid, p_subject text, p_body text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; fam uuid; u uuid;
begin
  select s.*, c.name, c.teacher_id as class_teacher into cs
    from class_session s join class c on c.id = s.class_id where s.id = p_session;
  insert into communication (studio_id, kind, channel, class_id, subject, body)
  values (cs.studio_id, 'class_broadcast', 'in_app', cs.class_id, p_subject, p_body);
  for fam in
    select distinct st.family_id from enrolment e join student st on st.id = e.student_id
     where e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
    union
    select distinct st.family_id from trial t join student st on st.id = t.student_id
     where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null
    union
    select distinct st.family_id from drop_in_booking d join student st on st.id = d.student_id
     where d.session_id = cs.id and d.status = 'booked'
  loop
    perform app.notify_family(fam, 'schedule_change', p_subject, left(p_body, 140), '/family/schedule');
  end loop;
  for u in
    select distinct st.user_id from student st
     where st.user_id is not null and st.login_enabled and st.deleted_at is null
       and (st.id in (select e.student_id from enrolment e where e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null)
            or st.id in (select d.student_id from drop_in_booking d where d.session_id = cs.id and d.status = 'booked'))
  loop
    perform app.notify_user(cs.studio_id, u, 'schedule_change', p_subject, left(p_body, 140), '/learn/timetable');
  end loop;
  for u in
    select distinct sm.user_id from staff_member sm
     where sm.id in (cs.class_teacher, cs.teacher_id) and sm.user_id is not null
  loop
    perform app.notify_user(cs.studio_id, u, 'schedule_change', p_subject, left(p_body, 140), '/teach');
  end loop;
end $$;

create or replace function app.cancel_session(p_session uuid, p_reason text, p_message text default null, p_notify boolean default true)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs class_session; lbl text; t record;
begin
  select * into cs from class_session where id = p_session and deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then raise exception 'FORBIDDEN: only the office can cancel a class' using errcode = 'insufficient_privilege'; end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: already cancelled' using errcode = 'check_violation'; end if;
  if cs.register_closed_at is not null then
    raise exception 'INVALID: this class has already been taught — its register is closed' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_reason), '') = '' then raise exception 'INVALID: give a reason' using errcode = 'check_violation'; end if;
  lbl := app.session_label(p_session);
  -- Tell everyone while the trials are still booked, so trial families are
  -- among those told (announce_session selects booked trials).
  if p_notify then
    perform app.announce_session(p_session, 'Cancelled: ' || lbl,
      coalesce(nullif(btrim(p_message), ''), 'Sorry — ' || lbl || ' is cancelled (' || btrim(p_reason) || ').'));
  end if;
  -- Each trial needs a new date: the office is asked to rebook it.
  for t in
    select tr.id, tr.enquiry_id, st.first_name, st.last_name, st.family_id from trial tr join student st on st.id = tr.student_id
     where tr.session_id = p_session and tr.status = 'booked' and tr.deleted_at is null
  loop
    -- A trial family often has no login yet: their copy goes by email.
    if p_notify then
      insert into outbound_message (studio_id, channel, to_name, to_address, subject, body, enquiry_id)
      select cs.studio_id, 'email', g.full_name, g.email, 'Cancelled: ' || lbl,
             coalesce(nullif(btrim(p_message), ''), 'Sorry — ' || lbl || ' is cancelled (' || btrim(p_reason) || ').')
               || E'\n\nWe will be in touch to find ' || t.first_name || ' another date for their trial.', t.enquiry_id
        from guardian g
       where g.family_id = t.family_id and g.deleted_at is null and g.user_id is null and coalesce(g.email, '') ~ '@';
    end if;
    perform app.notify_admins(cs.studio_id, 'new_trial', 'Rebook a trial: ' || t.first_name || ' ' || t.last_name,
      'Their trial at ' || lbl || ' was cancelled (' || btrim(p_reason) || '). Offer another date.', '/enrolment');
  end loop;
  update class_session set status = 'cancelled', cancel_reason = btrim(p_reason),
         changed_at = now(), changed_by = auth.uid(), updated_at = now() where id = p_session;
  update trial set status = 'cancelled', outcome_note = 'Session cancelled: ' || btrim(p_reason) || ' — to rebook', updated_at = now()
   where session_id = p_session and status = 'booked';
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'cancel', 'class_session', p_session, lbl || ': ' || btrim(p_reason));
end $$;

-- ── 6. Cover (UR-27) ───────────────────────────────────────────────────────
alter table class_session add column handover_note text;

create or replace function app.my_staff_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select id from staff_member where user_id = auth.uid() and deleted_at is null
$$;
grant execute on function app.my_staff_ids() to authenticated;

-- What the teacher is already doing around this session. Different sites
-- need travel time between them (studio.cover_travel_min).
create or replace function app.cover_clashes(p_session uuid, p_teacher uuid)
  returns table (session_id uuid, class_name text, starts_at timestamptz, ends_at timestamptz,
                 location text, needs_travel boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from class_session where id = p_session;
  if sid is null or not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office arranges cover' using errcode = 'insufficient_privilege';
  end if;
  return query
  select o.id, c2.name, o.starts_at, o.ends_at, l2.name, (c2.location_id is distinct from c.location_id)
    from class_session cs
    join class c on c.id = cs.class_id
    join studio st on st.id = cs.studio_id
    join class_session o on o.studio_id = cs.studio_id and o.id <> cs.id and o.deleted_at is null and o.status <> 'cancelled'
    join class c2 on c2.id = o.class_id and c2.deleted_at is null
    left join location l2 on l2.id = c2.location_id
   where cs.id = p_session
     and (coalesce(o.teacher_id, c2.teacher_id) = p_teacher or c2.assistant_id = p_teacher)
     and o.starts_at < cs.ends_at + case when c2.location_id is distinct from c.location_id
                                          then make_interval(mins => st.cover_travel_min) else interval '0' end
     and o.ends_at + case when c2.location_id is distinct from c.location_id
                          then make_interval(mins => st.cover_travel_min) else interval '0' end > cs.starts_at
   order by o.starts_at;
end $$;
revoke all on function app.cover_clashes(uuid, uuid) from public;
grant execute on function app.cover_clashes(uuid, uuid) to authenticated, service_role;

drop function if exists app.cover_session(uuid, uuid, text, boolean);
create function app.cover_session(p_session uuid, p_teacher uuid, p_message text default null,
                                  p_notify_families boolean default false, p_handover text default null,
                                  p_override boolean default false)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; who text; lbl text; u uuid; clash record; tz text;
begin
  select s.*, c.teacher_id as class_teacher into cs from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then raise exception 'FORBIDDEN: only the office can arrange cover' using errcode = 'insufficient_privilege'; end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: that class is cancelled' using errcode = 'check_violation'; end if;
  if p_teacher is not null then
    select display_name, user_id into who, u from staff_member
     where id = p_teacher and studio_id = cs.studio_id and status = 'active' and deleted_at is null;
    if who is null then raise exception 'INVALID: choose an active teacher at this school' using errcode = 'check_violation'; end if;
    if not p_override then
      select * into clash from app.cover_clashes(p_session, p_teacher) limit 1;
      if clash.session_id is not null then
        tz := (select timezone from studio where id = cs.studio_id);
        raise exception '%', 'CLASH: ' || who || ' teaches ' || clash.class_name || ' from '
          || to_char(clash.starts_at at time zone tz, 'HH24:MI') || ' to ' || to_char(clash.ends_at at time zone tz, 'HH24:MI')
          || coalesce(' at ' || clash.location, '')
          || case when clash.needs_travel then ', a different site, so there is no time to travel' else '' end
          using errcode = 'check_violation';
      end if;
    end if;
    if p_teacher = cs.class_teacher then p_teacher := null; end if;   -- back to the usual teacher
  end if;
  lbl := app.session_label(p_session);
  update class_session set teacher_id = p_teacher,
         handover_note = coalesce(nullif(btrim(p_handover), ''), handover_note),
         changed_at = now(), changed_by = auth.uid(), updated_at = now()
   where id = p_session;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (cs.studio_id, auth.uid(), 'cover', 'class_session', p_session,
          lbl || coalesce(': covered by ' || who, ': back to the usual teacher')
             || case when p_override then ' (clash accepted)' else '' end);
  if p_teacher is not null then
    perform app.notify_user(cs.studio_id, u, 'cover_assigned', 'You are covering ' || lbl,
      coalesce(nullif(btrim(p_message), ''), 'The register, safety notes and handover are on your Today screen on the day.'), '/teach');
  end if;
  if p_notify_families and p_teacher is not null then
    perform app.announce_session(p_session, 'Cover: ' || lbl,
      coalesce(nullif(btrim(p_message), ''), who || ' will be teaching ' || lbl || '.'));
  end if;
  update studio_request set status = 'answered', answer = coalesce('Covered by ' || who, 'No cover needed'),
         answered_by = auth.uid(), answered_at = now()
   where session_id = p_session and status in ('open', 'in_progress');
end $$;
revoke all on function app.cover_session(uuid, uuid, text, boolean, text, boolean) from public;
grant execute on function app.cover_session(uuid, uuid, text, boolean, text, boolean) to authenticated, service_role;

-- A teacher asking for cover can leave the handover with the request.
drop function if exists app.request_cover(uuid, text);
create function app.request_cover(p_session uuid, p_reason text, p_handover text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; rid uuid; me uuid;
begin
  select s.*, c.teacher_id as class_teacher into cs from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  select id into me from staff_member where user_id = auth.uid() and studio_id = cs.studio_id and deleted_at is null;
  if me is null or me <> coalesce(cs.teacher_id, cs.class_teacher) then
    raise exception 'FORBIDDEN: you can only ask for cover for a class you are teaching' using errcode = 'insufficient_privilege';
  end if;
  if cs.starts_at < now() then raise exception 'INVALID: that class has already started' using errcode = 'check_violation'; end if;
  insert into studio_request (studio_id, session_id, kind, subject, body, raised_by)
  values (cs.studio_id, p_session, 'other', 'Cover needed: ' || app.session_label(p_session),
          coalesce(nullif(btrim(p_reason), ''), 'Cover requested.')
            || coalesce(E'\n\nHandover: ' || nullif(btrim(p_handover), ''), ''), auth.uid())
  returning id into rid;
  if nullif(btrim(p_handover), '') is not null then
    update class_session set handover_note = btrim(p_handover), updated_at = now() where id = p_session;
  end if;
  return rid;
end $$;
revoke all on function app.request_cover(uuid, text, text) from public;
grant execute on function app.request_cover(uuid, text, text) to authenticated, service_role;

-- Cover gives the children's details on the session's day only (was two days
-- before to fourteen after). The covering teacher still sees the session
-- itself on their timetable ahead of time.
create or replace function app.teacher_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id from class c
    join staff_member s on s.id in (c.teacher_id, c.assistant_id)
   where s.user_id = auth.uid() and s.deleted_at is null and c.deleted_at is null
     and app.studio_writable(c.studio_id) and app.in_scope(c.studio_id)
  union
  select cs.class_id from class_session cs
    join staff_member s on s.id = cs.teacher_id
    join studio st on st.id = cs.studio_id
   where s.user_id = auth.uid() and s.deleted_at is null and cs.deleted_at is null
     and cs.status <> 'cancelled'
     and (cs.starts_at at time zone st.timezone)::date = (now() at time zone st.timezone)::date
     and app.studio_writable(cs.studio_id) and app.in_scope(cs.studio_id)
$$;

create policy session_cover_read on class_session for select
  using (deleted_at is null and teacher_id in (select app.my_staff_ids()) and app.in_scope(studio_id));

-- ── 7. Make-up offers (UR-56) ──────────────────────────────────────────────
-- Kept small: an offer per child per missed session, booked into a suitable
-- class with space as a free drop-in. Account credit for cancellations stays
-- with billing (studio.credit_cancelled_classes); when that is on, it is the
-- remedy and no make-up is offered for a cancellation.
create table makeup_offer (
  id               uuid primary key default gen_random_uuid(),
  studio_id        uuid not null references studio(id) on delete cascade,
  student_id       uuid not null references student(id) on delete cascade,
  from_session_id  uuid not null references class_session(id) on delete cascade,
  reason           text not null check (reason in ('cancelled', 'absence')),
  status           text not null default 'open' check (status in ('open', 'booked', 'declined', 'withdrawn')),
  booking_id       uuid references drop_in_booking(id) on delete set null,
  booked_session_id uuid references class_session(id) on delete set null,
  expires_on       date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (from_session_id, student_id)
);
alter table makeup_offer enable row level security;
alter table makeup_offer force row level security;
create policy makeup_offer_read on makeup_offer for select using (
  studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()) or student_id = app.student_self_id()));
grant select on makeup_offer to authenticated;
grant all on makeup_offer to service_role;

create or replace function app.offer_makeup(p_student uuid, p_from uuid, p_reason text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; s student; oid uuid; lbl text;
begin
  select x.* into st from studio x join class_session cs on cs.studio_id = x.id where cs.id = p_from;
  select * into s from student where id = p_student and deleted_at is null;
  if st.id is null or s.id is null or st.makeup_policy = 'off' then return null; end if;
  if p_reason = 'absence' and st.makeup_policy <> 'cancelled_and_absence' then return null; end if;
  insert into makeup_offer (studio_id, student_id, from_session_id, reason, expires_on)
  values (st.id, s.id, p_from, p_reason, current_date + st.makeup_window_days)
  on conflict (from_session_id, student_id) do update set status = 'open', reason = excluded.reason, updated_at = now()
    where makeup_offer.status in ('withdrawn', 'declined')
  returning id into oid;
  if oid is not null then
    lbl := app.session_label(p_from);
    perform app.notify_family(s.family_id, 'makeup_offer', 'A make-up class for ' || s.first_name,
      'Instead of ' || lbl || ', choose another class with space by ' || to_char(current_date + st.makeup_window_days, 'FMDD Mon') || '.',
      '/family');
  end if;
  return oid;
end $$;
revoke all on function app.offer_makeup(uuid, uuid, text) from public, authenticated, anon;

create or replace function app.on_session_cancelled_makeup() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; e record;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' then return null; end if;
  select * into st from studio where id = new.studio_id;
  if st.makeup_policy = 'off' or st.credit_cancelled_classes then return null; end if;
  for e in select en.student_id from enrolment en
            where en.class_id = new.class_id and en.status = 'active' and en.deleted_at is null loop
    perform app.offer_makeup(e.student_id, new.id, 'cancelled');
  end loop;
  return null;
end $$;
create trigger session_cancelled_makeup after update of status on class_session
  for each row execute function app.on_session_cancelled_makeup();

create or replace function app.may_book_makeup(p_offer uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from makeup_offer o where o.id = p_offer and (
    app.is_admin(o.studio_id) or o.student_id in (select app.guardian_student_ids()) or o.student_id = app.student_self_id()))
$$;

-- Suitable: the same dance style, the child's age fits, still to come before
-- the offer runs out, a place free, and not a class they are already in.
create or replace function app.makeup_options(p_offer uuid)
  returns table (session_id uuid, class_name text, starts_at timestamptz, location text, spaces int)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare o makeup_offer; src record; dob date;
begin
  if not app.may_book_makeup(p_offer) then
    raise exception 'FORBIDDEN: not your offer' using errcode = 'insufficient_privilege';
  end if;
  select * into o from makeup_offer where id = p_offer;
  select c.dance_style_id into src from class_session cs join class c on c.id = cs.class_id where cs.id = o.from_session_id;
  select date_of_birth into dob from student where id = o.student_id;
  return query
  select cs.id, c.name, cs.starts_at, l.name, (c.capacity - app.session_taken(cs.id))::int
    from class_session cs join class c on c.id = cs.class_id and c.deleted_at is null
    left join location l on l.id = c.location_id
   where cs.studio_id = o.studio_id and cs.deleted_at is null and cs.status = 'scheduled'
     and cs.id <> o.from_session_id
     and cs.starts_at > now() and (cs.starts_at)::date <= o.expires_on
     and c.dance_style_id is not distinct from src.dance_style_id
     and (c.age_min is null or extract(year from age(cs.starts_at::date, dob)) >= c.age_min)
     and (c.age_max is null or extract(year from age(cs.starts_at::date, dob)) <= c.age_max)
     and app.session_taken(cs.id) < c.capacity
     and not exists (select 1 from enrolment e where e.class_id = c.id and e.student_id = o.student_id
                       and e.status = 'active' and e.deleted_at is null)
     and not exists (select 1 from drop_in_booking d where d.session_id = cs.id and d.student_id = o.student_id
                       and d.status in ('booked', 'held'))
   order by cs.starts_at
   limit 8;
end $$;
revoke all on function app.makeup_options(uuid) from public;
grant execute on function app.makeup_options(uuid) to authenticated;

create or replace function app.book_makeup(p_offer uuid, p_session uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare o makeup_offer; bid uuid; lbl text; s student;
begin
  if not app.may_book_makeup(p_offer) then
    raise exception 'FORBIDDEN: not your offer' using errcode = 'insufficient_privilege';
  end if;
  select * into o from makeup_offer where id = p_offer for update;
  if o.status <> 'open' then raise exception 'INVALID: this make-up has already been used' using errcode = 'check_violation'; end if;
  if o.expires_on < current_date then raise exception 'INVALID: this make-up offer has run out' using errcode = 'check_violation'; end if;
  if not exists (select 1 from app.makeup_options(p_offer) x where x.session_id = p_session) then
    raise exception 'INVALID: that class is not open for a make-up — it may have filled' using errcode = 'check_violation';
  end if;
  insert into drop_in_booking (studio_id, session_id, student_id, price_minor, booked_by)
  values (o.studio_id, p_session, o.student_id, 0, auth.uid())
  returning id into bid;
  update makeup_offer set status = 'booked', booking_id = bid, booked_session_id = p_session, updated_at = now()
   where id = o.id;
  select * into s from student where id = o.student_id;
  lbl := app.session_label(p_session);
  perform app.notify_admins(o.studio_id, 'new_enrolment', 'Make-up booked: ' || s.first_name || ' ' || s.last_name,
    lbl || ', instead of ' || app.session_label(o.from_session_id) || '.', '/schedule');
  return bid;
end $$;
revoke all on function app.book_makeup(uuid, uuid) from public;
grant execute on function app.book_makeup(uuid, uuid) to authenticated;

create or replace function app.decline_makeup(p_offer uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.may_book_makeup(p_offer) then
    raise exception 'FORBIDDEN: not your offer' using errcode = 'insufficient_privilege';
  end if;
  update makeup_offer set status = 'declined', updated_at = now() where id = p_offer and status = 'open';
end $$;
revoke all on function app.decline_makeup(uuid) from public;
grant execute on function app.decline_makeup(uuid) to authenticated;

-- A make-up booking that is cancelled gives the offer back.
create or replace function app.on_makeup_booking_cancelled() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update makeup_offer set status = 'open', booking_id = null, booked_session_id = null, updated_at = now()
     where booking_id = new.id and status = 'booked';
  end if;
  return null;
end $$;
create trigger makeup_booking_cancelled after update of status on drop_in_booking
  for each row execute function app.on_makeup_booking_cancelled();

-- ── 8. Small things (UR-54) ────────────────────────────────────────────────
-- Why a register link shows nothing: it does not exist, it is someone else's
-- class, or it is a cover that opens on the day. Says no more than that.
create or replace function app.session_access(p_session uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case
    when cs.id is null then 'missing'
    when app.is_admin(cs.studio_id) then 'ok'
    when not app.in_scope(cs.studio_id) then 'not_yours'
    when cs.class_id in (select app.teacher_class_ids()) then 'ok'
    when cs.teacher_id in (select app.my_staff_ids()) then 'cover_later'
    else 'not_yours' end
    from (select 1) one
    left join class_session cs on cs.id = p_session and cs.deleted_at is null
$$;
revoke all on function app.session_access(uuid) from public;
grant execute on function app.session_access(uuid) to authenticated;

-- "This term": from the start of the term the school is in now (or the most
-- recent one) to today.
create or replace function app.current_term_start(p_studio uuid) returns date
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select max(starts_on) from term where studio_id = p_studio and deleted_at is null and starts_on <= current_date
$$;
grant execute on function app.current_term_start(uuid) to authenticated;
