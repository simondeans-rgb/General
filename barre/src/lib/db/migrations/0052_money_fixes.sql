-- ============================================================================
-- 0052 · Money follow-ons from the panel review (UR-52, UR-56, UR-17)
-- ----------------------------------------------------------------------------
-- 1. Moving a child to another class has an effective date (UR-52). Today by
--    default; a future date plans the move; a past date (the office only,
--    back to the start of the current term) records one that already
--    happened. Registers before the date keep the child in the old class,
--    from the date in the new one. Billing runs bill each class up to or from
--    the date, and app.move_preview gives the office a pro-rata note.
-- 2. Credit for reported absences (UR-56). A school setting, off by default:
--    when a family reports an absence in advance, the child's enrolled class
--    is credited on account (its per-session value, or a fixed amount), once
--    per child per session, and taken back if the report is withdrawn before
--    the class. A school offers make-ups for absences or credit, not both.
-- 3. Split billing between guardians (UR-17). Per family, the office chooses:
--    the whole family as today; one guardian; a percentage split between two;
--    or each child to a guardian. Billing runs raise one invoice per paying
--    guardian. A guardian sees only invoices addressed to them (or to the
--    family); the office sees all. The run guard counts each guardian's share
--    separately, so a split is never mistaken for billing a family twice.
-- ============================================================================

-- ── 1. Moves with an effective date (UR-52) ────────────────────────────────
-- moved_from: on the new place, the place it came from. moved_to: on the old
-- place, where the child went. A planned move leaves the old place active
-- with ended_on set to the move date until the date arrives.
alter table enrolment add column moved_from uuid references enrolment(id) on delete set null;
alter table enrolment add column moved_to   uuid references enrolment(id) on delete set null;
create index enrolment_moving on enrolment (ended_on) where moved_to is not null and status = 'active';

-- Is this place in the class on this day? Places that never moved keep the
-- old meaning (active = in the class), so nothing else changes for them.
create or replace function app.enrolment_on(p_status enrolment_status, p_started date, p_ended date,
                                            p_from uuid, p_to uuid, p_day date) returns boolean
  language sql immutable as $$
  select case
    when p_status = 'active' then (p_from is null or p_started <= p_day)
                              and (p_to is null or p_ended is null or p_day < p_ended)
    when p_status = 'left' then p_to is not null and p_ended is not null and p_day < p_ended
                            and (p_from is null or p_started <= p_day)
    else false end
$$;
grant execute on function app.enrolment_on(enrolment_status, date, date, uuid, uuid, date) to authenticated, service_role;

-- Teachers keep seeing a child who moved out recently, so the old class's
-- registers before the move still show them.
create or replace function app.teacher_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id from enrolment e
   where e.class_id in (select app.teacher_class_ids()) and e.deleted_at is null
     and (e.status = 'active' or (e.status = 'left' and e.moved_to is not null and e.ended_on > current_date - 60))
  union
  select t.student_id from trial t
   where t.class_id in (select app.teacher_class_ids()) and t.student_id is not null and t.deleted_at is null
     and t.status in ('booked', 'attended')
  union
  select d.student_id from drop_in_booking d join class_session cs on cs.id = d.session_id
   where cs.class_id in (select app.teacher_class_ids()) and d.status = 'booked'
     and cs.starts_at > now() - interval '30 days'
$$;

-- Planned moves whose day has come: the old place ends and its waiting list
-- is offered the place. Run by the scheduled tick, and before any new move.
create or replace function app.complete_class_moves(p_studio uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r record; n int := 0;
begin
  for r in select e.id, e.studio_id, e.class_id, (select c.name from enrolment x join class c on c.id = x.class_id where x.id = e.moved_to) to_name
             from enrolment e
            where e.status = 'active' and e.deleted_at is null and e.moved_to is not null
              and e.ended_on <= current_date and (p_studio is null or e.studio_id = p_studio)
            for update of e
  loop
    update enrolment set status = 'left', note = 'Moved to ' || coalesce(r.to_name, 'another class'), updated_at = now()
     where id = r.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (r.studio_id, auth.uid(), 'move', 'enrolment', r.id, 'planned move to ' || coalesce(r.to_name, 'another class') || ' took effect');
    perform app.offer_next_place(r.class_id);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function app.complete_class_moves(uuid) from public, authenticated, anon;
grant execute on function app.complete_class_moves(uuid) to service_role;

-- The move itself. p_on: the first day in the new class (default today).
drop function if exists app.transfer_enrolment(uuid, uuid, text);
create function app.transfer_enrolment(p_enrolment uuid, p_to_class uuid, p_note text default null, p_on date default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e enrolment; to_name text; from_name text; new_id uuid; d date := coalesce(p_on, current_date); t0 date;
begin
  select * into e from enrolment where id = p_enrolment and status = 'active' and deleted_at is null;
  if e.id is null then raise exception 'NOT_FOUND: an active place' using errcode = 'no_data_found'; end if;
  if not app.is_admin(e.studio_id) then raise exception 'FORBIDDEN: only the office can move a student' using errcode = 'insufficient_privilege'; end if;
  perform app.complete_class_moves(e.studio_id);
  select * into e from enrolment where id = p_enrolment for update;
  if e.status <> 'active' then raise exception 'NOT_FOUND: an active place' using errcode = 'no_data_found'; end if;
  if e.moved_to is not null then
    raise exception 'INVALID: a move is already planned for %. Cancel it first.', to_char(e.ended_on, 'FMDD Mon YYYY')
      using errcode = 'check_violation';
  end if;
  if p_to_class = e.class_id then raise exception 'INVALID: that is the same class' using errcode = 'check_violation'; end if;
  select name into to_name from class where id = p_to_class and studio_id = e.studio_id and deleted_at is null;
  if to_name is null then raise exception 'INVALID: choose a class at this school' using errcode = 'check_violation'; end if;
  select name into from_name from class where id = e.class_id;
  if d > current_date + 366 then
    raise exception 'INVALID: choose a date within the next year' using errcode = 'check_violation';
  end if;
  if d < current_date then
    t0 := app.current_term_start(e.studio_id);
    if t0 is null or d < t0 then
      raise exception 'INVALID: a move can be dated back only to the start of this term%',
        coalesce(' (' || to_char(t0, 'FMDD Mon') || ')', '') using errcode = 'check_violation';
    end if;
    if d < e.started_on then
      raise exception 'INVALID: they only joined % on %', from_name, to_char(e.started_on, 'FMDD Mon')
        using errcode = 'check_violation';
    end if;
  end if;

  -- Join first: if the new class is full, nothing changes.
  insert into enrolment (studio_id, class_id, student_id, status, started_on, created_by, note, price_minor, moved_from)
  values (e.studio_id, p_to_class, e.student_id, 'active', d, auth.uid(),
          coalesce(nullif(btrim(p_note), ''), 'Moved from ' || from_name), null, e.id)
  returning id into new_id;

  if d <= current_date then
    update enrolment set status = 'left', ended_on = d, moved_to = new_id, note = 'Moved to ' || to_name, updated_at = now()
     where id = e.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (e.studio_id, auth.uid(), 'move', 'enrolment', e.id,
            'moved to ' || to_name || case when d < current_date then ' from ' || to_char(d, 'FMDD Mon') || ' (back-dated)' else '' end);
    perform app.offer_next_place(e.class_id);
  else
    update enrolment set ended_on = d, moved_to = new_id, updated_at = now() where id = e.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (e.studio_id, auth.uid(), 'move', 'enrolment', e.id, 'move to ' || to_name || ' planned for ' || to_char(d, 'FMDD Mon YYYY'));
  end if;
  return new_id;
end $$;
revoke all on function app.transfer_enrolment(uuid, uuid, text, date) from public;
grant execute on function app.transfer_enrolment(uuid, uuid, text, date) to authenticated;

-- Calling off a planned move (either place may be named).
create or replace function app.cancel_class_move(p_enrolment uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare old_ enrolment;
begin
  select * into old_ from enrolment
   where (id = p_enrolment or moved_to = p_enrolment) and moved_to is not null and status = 'active' and deleted_at is null
   limit 1 for update;
  if old_.id is null then raise exception 'NOT_FOUND: a planned move' using errcode = 'no_data_found'; end if;
  if not app.is_admin(old_.studio_id) then raise exception 'FORBIDDEN: only the office can change a move' using errcode = 'insufficient_privilege'; end if;
  if old_.ended_on <= current_date then
    raise exception 'INVALID: that move has already happened' using errcode = 'check_violation';
  end if;
  update enrolment set status = 'cancelled', updated_at = now(), note = concat_ws(' · ', note, 'Planned move called off')
   where id = old_.moved_to;
  update enrolment set ended_on = null, moved_to = null, updated_at = now() where id = old_.id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (old_.studio_id, auth.uid(), 'move', 'enrolment', old_.id, 'planned move called off');
  perform app.offer_next_place((select class_id from enrolment where id = old_.moved_to));
end $$;
revoke all on function app.cancel_class_move(uuid) from public;
grant execute on function app.cancel_class_move(uuid) to authenticated;

-- What a move on a given day means for the bill, before it is made: classes
-- left in each class's term after the date, what is already invoiced for the
-- old class, and what the next billing run would charge for the new one.
create or replace function app.move_preview(p_enrolment uuid, p_to_class uuid, p_on date default null)
  returns table (on_day date, earliest date, from_left int, from_total int, from_price_minor int,
                 from_invoiced_minor bigint, from_unused_minor bigint, to_left int, to_total int,
                 to_price_minor int, to_charge_minor bigint, from_pricing text, to_pricing text, note text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare e enrolment; fc class; tc class; d date := coalesce(p_on, current_date);
        fl int; ft int; fp int; finv bigint; fun bigint; tl int; tt int; tch bigint; t0 date; msg text;
begin
  select * into e from enrolment where id = p_enrolment and deleted_at is null;
  if e.id is null or not app.is_admin(e.studio_id) then
    raise exception 'FORBIDDEN: only the office can move a student' using errcode = 'insufficient_privilege';
  end if;
  select * into fc from class where id = e.class_id;
  select * into tc from class where id = p_to_class and studio_id = e.studio_id;
  t0 := greatest(coalesce(app.current_term_start(e.studio_id), current_date), e.started_on);
  fp := coalesce(e.price_minor, fc.price_minor, 0);
  select count(*) filter (where cs.starts_at::date >= d), count(*) into fl, ft
    from class_session cs where cs.class_id = fc.id and cs.deleted_at is null and cs.status <> 'cancelled';
  select coalesce(sum(ii.total_minor), 0) into finv
    from invoice_item ii join invoice i on i.id = ii.invoice_id
   where ii.student_id = e.student_id and ii.class_id = fc.id and ii.deleted_at is null
     and i.deleted_at is null and i.status not in ('void', 'draft') and i.term_id is not distinct from fc.term_id;
  fun := case when fc.pricing = 'term' and ft > 0 and finv > 0 then least(finv, round(fp::numeric * fl / ft)::bigint) else 0 end;
  if tc.id is not null then
    select count(*) filter (where cs.starts_at::date >= d), count(*) into tl, tt
      from class_session cs where cs.class_id = tc.id and cs.deleted_at is null and cs.status <> 'cancelled';
    tch := case when tc.pricing = 'term' and tt > 0 then round(coalesce(tc.price_minor, 0)::numeric * tl / tt)::bigint
                when tc.pricing in ('one_off', 'monthly') then coalesce(tc.price_minor, 0) else 0 end;
  end if;
  msg := case when d > current_date then 'Planned for ' || to_char(d, 'FMDy FMDD Mon') || '. Until then they stay in ' || fc.name || '. '
              when d < current_date then 'Back-dated to ' || to_char(d, 'FMDy FMDD Mon') || '. Marks already made in ' || fc.name || ' after that stay as they are. '
              else 'From today. ' end
      || case when fc.pricing = 'term' and ft > 0 then
           fl || ' of ' || ft || ' ' || fc.name || ' classes are on or after the date'
           || case when finv > 0 then '; ' || app.gbp(fun) || ' of the ' || app.gbp(finv) || ' invoiced covers them. Issue a credit note for it if the family should not pay twice. '
                   else '. Nothing is invoiced for it yet, so the next billing run charges only the classes before the date. ' end
         else '' end
      || case when tc.id is null then ''
              when tc.pricing = 'term' and tt > 0 then
                'The next billing run charges ' || tc.name || ' pro rata: ' || tl || ' of ' || tt || ' classes, ' || app.gbp(tch) || '.'
              when tc.pricing = 'monthly' then tc.name || ' is charged monthly from the month of the move.'
              else '' end;
  return query select d, t0, fl, ft, fp, finv, fun, coalesce(tl, 0), coalesce(tt, 0), tc.price_minor,
                      coalesce(tch, 0), fc.pricing::text, tc.pricing::text, btrim(msg);
end $$;
revoke all on function app.move_preview(uuid, uuid, date) from public;
grant execute on function app.move_preview(uuid, uuid, date) to authenticated;

-- The tick finishes planned moves whose day has come (as 0051, plus moves).
create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
        due int := 0; offers int := 0; n int; moves int := 0;
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
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'invoices_due', due,
                            'offers_expired', offers, 'moves', moves, 'at', now());
end $$;

-- ── 3. Split billing between guardians (UR-17) ─────────────────────────────
-- No row, or mode 'family': invoices go to the family, as today.
-- 'one': every invoice to guardian_a. 'percent': guardian_a pays percent_a,
-- guardian_b the rest. 'per_child': each child to the guardian named in
-- family_billing_child, anyone not named to guardian_a.
-- Both tables carry an id, as every table with a family_id must for merging
-- duplicate families (0044).
create table family_billing (
  id          uuid not null default gen_random_uuid() unique,
  family_id   uuid primary key references family(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  mode        text not null check (mode in ('family', 'one', 'percent', 'per_child')),
  guardian_a  uuid references guardian(id) on delete set null,
  guardian_b  uuid references guardian(id) on delete set null,
  percent_a   smallint check (percent_a between 1 and 99),
  updated_by  uuid references user_account(id) on delete set null,
  updated_at  timestamptz not null default now()
);
create table family_billing_child (
  id          uuid not null default gen_random_uuid() unique,
  student_id  uuid primary key references student(id) on delete cascade,
  family_id   uuid not null references family(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  guardian_id uuid not null references guardian(id) on delete cascade
);
-- Merging two families that both have a setting keeps the kept family's.
create or replace function app.family_billing_merge_guard() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.family_id is distinct from old.family_id
     and exists (select 1 from family_billing where family_id = new.family_id) then
    return null;
  end if;
  return new;
end $$;
create trigger family_billing_merge before update of family_id on family_billing
  for each row execute function app.family_billing_merge_guard();

alter table family_billing enable row level security; alter table family_billing force row level security;
alter table family_billing_child enable row level security; alter table family_billing_child force row level security;
create policy family_billing_read on family_billing for select
  using (studio_id in (select app.studio_ids()) and (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
create policy family_billing_child_read on family_billing_child for select
  using (studio_id in (select app.studio_ids()) and (app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
grant select on family_billing, family_billing_child to authenticated;
grant all on family_billing, family_billing_child to service_role;

-- Who an invoice is addressed to: null is the whole family.
alter table invoice add column billed_guardian_id uuid references guardian(id) on delete set null;
create index invoice_billed_guardian on invoice (billed_guardian_id) where billed_guardian_id is not null;

-- Who pays a child's fees, and what share. ord 1 takes the rounded share,
-- ord 2 the remainder, so the shares always add up to the whole.
create or replace function app.billing_payers(p_family uuid, p_student uuid)
  returns table (guardian_id uuid, share_pct int, ord int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with fb as (
    select b.mode, ga.id ga, gb.id gb, b.percent_a,
           (select gc.id from family_billing_child x join guardian gc on gc.id = x.guardian_id and gc.deleted_at is null
             where x.student_id = p_student and gc.family_id = p_family) gchild
      from family_billing b
      left join guardian ga on ga.id = b.guardian_a and ga.deleted_at is null and ga.family_id = b.family_id
      left join guardian gb on gb.id = b.guardian_b and gb.deleted_at is null and gb.family_id = b.family_id
     where b.family_id = p_family)
  select null::uuid, 100, 1
   where not exists (select 1 from fb where fb.mode <> 'family')
  union all select fb.ga, 100, 1 from fb where fb.mode = 'one'
  union all select fb.ga, fb.percent_a, 1 from fb where fb.mode = 'percent' and fb.gb is not null
  union all select fb.gb, 100 - fb.percent_a, 2 from fb where fb.mode = 'percent' and fb.gb is not null
  union all select fb.ga, 100, 1 from fb where fb.mode = 'percent' and fb.gb is null
  union all select coalesce(fb.gchild, fb.ga), 100, 1 from fb where fb.mode = 'per_child'
$$;
revoke all on function app.billing_payers(uuid, uuid) from public, authenticated, anon;

-- Has this payer's share of a child's class for the period been billed? A
-- live invoice to the whole family covers every share; one to a guardian
-- covers that guardian's share (and a family-wide bill when no split is set).
create or replace function app.billing_share_covered(p_student uuid, p_class uuid, p_term uuid, p_pstart date,
                                                     p_monthly boolean, p_payer uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (
    select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id
     where ii.student_id = p_student and ii.class_id = p_class and ii.deleted_at is null
       and i.deleted_at is null and i.status not in ('void', 'refunded') and i.term_id = p_term
       and (not p_monthly or ii.period_start = p_pstart)
       and (i.billed_guardian_id is null or p_payer is null or i.billed_guardian_id = p_payer))
$$;
revoke all on function app.billing_share_covered(uuid, uuid, uuid, date, boolean, uuid) from public, authenticated, anon;

-- As 0045, with two changes: a place that moves during the period is billed
-- up to (or from) the move day; and each line is split between the family's
-- payers, one row per payer whose share is not yet billed.
drop function if exists app.billing_lines(uuid, date, uuid[]);
create function app.billing_lines(p_term uuid, p_month date default null, p_include uuid[] default null)
  returns table (family_id uuid, family_name text, student_id uuid, student_name text,
                 class_id uuid, class_name text, description text, quantity numeric,
                 unit_minor int, discount_minor int, discount_reason text, period_start date,
                 payer_guardian_id uuid, payer_name text, share_pct int)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid; t term; m0 date; m1 date; pstart date; skip uuid[];
begin
  select * into t from term where id = p_term and deleted_at is null;
  sid := t.studio_id;
  perform app.require_admin(sid);
  if p_month is not null then
    m0 := greatest(date_trunc('month', p_month)::date, t.starts_on);
    m1 := least((date_trunc('month', p_month) + interval '1 month - 1 day')::date, t.ends_on);
    if m0 > m1 then raise exception 'INVALID: that month is outside the term' using errcode = 'check_violation'; end if;
    pstart := date_trunc('month', p_month)::date;
  else
    m0 := t.starts_on; m1 := t.ends_on; pstart := t.starts_on;
  end if;
  skip := array(select g.family_id from app.billing_period_invoices(p_term, p_month) g
                 where not (g.family_id = any(coalesce(p_include, '{}'::uuid[]))));
  return query
  with places as (
    select e.*, greatest(e.started_on, m0) from_day,
           case when e.moved_to is not null and e.ended_on is not null then least(m1, e.ended_on - 1) else m1 end to_day
      from enrolment e
     where e.deleted_at is null and e.started_on <= m1
       and (e.status = 'active' or (e.status = 'left' and e.moved_to is not null and e.ended_on > m0))
  ),
  base as (
    select f.id fam, f.name fname, s.id stu, s.first_name || ' ' || s.last_name sname,
           c.id cls, c.name cname, c.pricing,
           coalesce(e.price_minor, c.price_minor) price, e.from_day, e.to_day,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null and cs.status <> 'cancelled'
              and cs.starts_at::date between m0 and m1) total_sessions,
           (select count(*) from class_session cs where cs.class_id = c.id and cs.deleted_at is null and cs.status <> 'cancelled'
              and cs.starts_at::date between e.from_day and e.to_day) left_sessions
      from places e
      join class c on c.id = e.class_id and c.deleted_at is null and c.term_id = t.id
      join student s on s.id = e.student_id and s.deleted_at is null
      join family f on f.id = s.family_id and f.deleted_at is null and not f.is_prospect
     where e.from_day <= e.to_day
       and coalesce(e.price_minor, c.price_minor) > 0
       and (case when p_month is null then c.pricing in ('term', 'one_off') else c.pricing = 'monthly' end)
       -- Already billed for this period by an invoice that does not name the class.
       and not (f.id = any(skip))
       -- Every payer's share already billed (a live invoice line for this child and class).
       and exists (select 1 from app.billing_payers(f.id, s.id) py
                    where not app.billing_share_covered(s.id, c.id, t.id, pstart, p_month is not null, py.guardian_id))
  ),
  priced as (
    select b.*, 1::numeric qty,
      case when b.pricing in ('term', 'monthly') and (b.from_day > m0 or b.to_day < m1) and b.total_sessions > 0
           then round(b.price::numeric * b.left_sessions / b.total_sessions)::int else b.price end unit,
      case when b.pricing = 'one_off' then b.cname || ' — course fee'
           when (b.from_day > m0 or b.to_day < m1) and b.total_sessions > 0
             then format('%s — %s, %s of %s classes %s', b.cname,
                         case when p_month is null then t.name else to_char(pstart, 'FMMonth YYYY') end,
                         b.left_sessions, b.total_sessions,
                         concat_ws(' ', case when b.from_day > m0 then 'from ' || to_char(b.from_day, 'FMDD Mon') end,
                                        case when b.to_day < m1 then 'until ' || to_char(b.to_day, 'FMDD Mon') end))
           else b.cname || ' — ' || case when p_month is null then t.name else to_char(pstart, 'FMMonth YYYY') end end descr
      from base b
  ),
  ranked as (
    select p.*,
      dense_rank() over (partition by p.fam order by child_total desc, p.stu) child_rank,
      row_number() over (partition by p.stu order by p.unit * p.qty desc, p.cls) class_rank
      from (select p.*, sum(p.unit * p.qty) over (partition by p.stu) child_total from priced p) p
  ),
  rules as (
    select (select percent from discount_rule where studio_id = sid and kind = 'sibling' and enabled and deleted_at is null) sib_pct,
           (select from_nth from discount_rule where studio_id = sid and kind = 'sibling' and enabled and deleted_at is null) sib_n,
           (select percent from discount_rule where studio_id = sid and kind = 'multi_class' and enabled and deleted_at is null) mc_pct,
           (select from_nth from discount_rule where studio_id = sid and kind = 'multi_class' and enabled and deleted_at is null) mc_n
  ),
  disc as (
    select r.*,
      case when rules.sib_pct is not null and r.child_rank >= rules.sib_n then rules.sib_pct else 0 end sib,
      case when rules.mc_pct is not null and r.class_rank >= rules.mc_n then rules.mc_pct else 0 end mc,
      (select fd.pct from app.family_discounts_on(r.fam, m0, m1) fd) fam_pct
      from ranked r, rules
  ),
  whole as (
    select d.*,
           round(d.unit * d.qty * (1 - (1 - greatest(d.sib, d.mc) / 100.0) * (1 - d.fam_pct / 100.0)))::int disc_minor,
           nullif(concat_ws(' + ',
             case when greatest(d.sib, d.mc) = 0 then null
                  when d.sib >= d.mc then d.sib || '% sibling discount' else d.mc || '% multi-class discount' end,
             case when d.fam_pct > 0 then d.fam_pct || '% discount' end), '') disc_reason
      from disc d
  )
  select w.fam, w.fname, w.stu, w.sname, w.cls, w.cname,
         case when py.share_pct < 100 then w.descr || ' (' || py.share_pct || '% share)' else w.descr end,
         w.qty,
         case when py.ord = 1 then round(w.unit * py.share_pct / 100.0)::int
              else w.unit - round(w.unit * (100 - py.share_pct) / 100.0)::int end,
         case when py.ord = 1 then round(w.disc_minor * py.share_pct / 100.0)::int
              else w.disc_minor - round(w.disc_minor * (100 - py.share_pct) / 100.0)::int end,
         w.disc_reason, pstart,
         py.guardian_id, g.full_name, py.share_pct
    from whole w
    cross join lateral app.billing_payers(w.fam, w.stu) py
    left join guardian g on g.id = py.guardian_id
   where not app.billing_share_covered(w.stu, w.cls, t.id, pstart, p_month is not null, py.guardian_id)
   order by w.fname, g.full_name nulls first, w.sname, w.cname;
end $$;

-- One invoice per family and paying guardian. A fixed family discount is
-- shared between the payers in proportion to what each is billed.
drop function if exists app.create_billing_run(uuid, date, date, uuid[], text);
create function app.create_billing_run(p_term uuid, p_due date default null, p_month date default null,
                                       p_include uuid[] default null, p_reason text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; run uuid; fam record; inv uuid; n int := 0; tot bigint := 0; fixed int; share int;
        pm date := date_trunc('month', p_month)::date; t term; inc uuid[]; o record;
begin
  select * into t from term where id = p_term and deleted_at is null;
  sid := t.studio_id;
  perform app.require_admin(sid);
  if not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from billing_run where term_id = p_term and status = 'draft' and period_month is not distinct from pm) then
    raise exception 'INVALID: there is already a draft run for this period — issue or discard it first' using errcode = 'check_violation';
  end if;
  -- Only families that really were skipped count as overrides.
  inc := array(select g.family_id from app.billing_period_invoices(p_term, pm) g
                where g.family_id = any(coalesce(p_include, '{}'::uuid[])));
  if cardinality(inc) > 0 and length(coalesce(btrim(p_reason), '')) < 3 then
    raise exception 'INVALID: say why these families should be billed again for this period' using errcode = 'check_violation';
  end if;

  insert into billing_run (studio_id, term_id, due_on, created_by, period_month)
  values (sid, p_term, coalesce(p_due, current_date + 14), auth.uid(), pm) returning id into run;

  for fam in
    select x.*, sum(x.sub) over (partition by x.family_id) fam_sub,
           sum(x.sub) over (partition by x.family_id order by x.payer_name nulls first, x.payer
                            rows unbounded preceding) cum_sub
      from (select l.family_id, l.payer_guardian_id payer, min(l.payer_name) payer_name,
                   jsonb_agg(jsonb_build_object(
                     'kind', 'tuition', 'description', l.description, 'quantity', l.quantity,
                     'unit_minor', l.unit_minor, 'discount_minor', l.discount_minor,
                     'student_id', l.student_id, 'class_id', l.class_id)) items,
                   min(l.period_start) ps,
                   sum(round(l.quantity * l.unit_minor) - l.discount_minor)::bigint sub
              from app.billing_lines(p_term, pm, inc) l group by l.family_id, l.payer_guardian_id) x
     order by x.family_id, x.payer_name nulls first
  loop
    select fd.fixed into fixed from app.family_discounts_on(fam.family_id, coalesce(pm, t.starts_on),
                                                         coalesce((pm + interval '1 month - 1 day')::date, t.ends_on)) fd;
    -- Telescoping shares, so the payers' parts add up to the whole discount.
    share := case when coalesce(fixed, 0) = 0 or fam.fam_sub <= 0 then 0
                  else (round(fixed::numeric * fam.cum_sub / fam.fam_sub) - round(fixed::numeric * (fam.cum_sub - fam.sub) / fam.fam_sub))::int end;
    inv := app.create_invoice(fam.family_id, fam.items, coalesce(p_due, current_date + 14),
                              case when fam.payer is not null then 'Billed to ' || fam.payer_name end,
                              least(share, greatest(fam.sub, 0))::int, false, p_term);
    update invoice set billing_run_id = run, billed_guardian_id = fam.payer where id = inv;
    update invoice_item set period_start = fam.ps where invoice_id = inv;
    n := n + 1;
    tot := tot + (select total_minor from invoice where id = inv);
  end loop;
  if n = 0 then
    delete from billing_run where id = run;
    raise exception 'INVALID: everyone has already been invoiced for this period' using errcode = 'check_violation';
  end if;
  update billing_run set invoice_count = n, total_minor = tot where id = run;
  for o in select g.family_id, g.numbers from app.billing_period_invoices(p_term, pm) g where g.family_id = any(inc) loop
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (sid, auth.uid(), 'override', 'family', o.family_id,
            'Billed again for ' || coalesce(to_char(pm, 'FMMonth YYYY'), t.name) || ' despite ' || o.numbers || ': ' || btrim(p_reason));
  end loop;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'create', 'billing_run', run, n || ' draft invoices' || coalesce(' for ' || to_char(pm, 'FMMonth YYYY'), ''));
  return run;
end $$;

revoke all on function app.billing_lines(uuid, date, uuid[]), app.create_billing_run(uuid, date, date, uuid[], text) from public;
grant execute on function app.billing_lines(uuid, date, uuid[]), app.create_billing_run(uuid, date, date, uuid[], text) to authenticated;

-- The office sets how a family's invoices are shared. p_children maps
-- student id → guardian id for 'per_child'.
create or replace function app.set_family_billing(p_family uuid, p_mode text, p_guardian_a uuid default null,
                                                  p_guardian_b uuid default null, p_percent_a int default null,
                                                  p_children jsonb default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare f family; k text; v text; summary text;
begin
  select * into f from family where id = p_family and deleted_at is null;
  if f.id is null then raise exception 'NOT_FOUND: family' using errcode = 'no_data_found'; end if;
  perform app.require_admin(f.studio_id);
  if p_mode not in ('family', 'one', 'percent', 'per_child') then
    raise exception 'INVALID: unknown way of sharing invoices' using errcode = 'check_violation';
  end if;
  if exists (select 1 from invoice i join billing_run r on r.id = i.billing_run_id
              where i.family_id = f.id and r.status = 'draft' and i.deleted_at is null) then
    raise exception 'INVALID: a draft billing run includes this family — issue or discard it first' using errcode = 'check_violation';
  end if;
  if p_mode <> 'family' then
    if p_guardian_a is null or not exists (select 1 from guardian where id = p_guardian_a and family_id = f.id and deleted_at is null) then
      raise exception 'INVALID: choose a guardian in this family' using errcode = 'check_violation';
    end if;
  end if;
  if p_mode = 'percent' then
    if p_guardian_b is null or p_guardian_b = p_guardian_a
       or not exists (select 1 from guardian where id = p_guardian_b and family_id = f.id and deleted_at is null) then
      raise exception 'INVALID: choose two different guardians in this family' using errcode = 'check_violation';
    end if;
    if p_percent_a is null or p_percent_a not between 1 and 99 then
      raise exception 'INVALID: the first guardian’s share must be between 1%% and 99%%' using errcode = 'check_violation';
    end if;
  end if;

  delete from family_billing_child where family_id = f.id;
  if p_mode = 'family' then
    delete from family_billing where family_id = f.id;
    summary := 'invoices to the whole family';
  else
    insert into family_billing (family_id, studio_id, mode, guardian_a, guardian_b, percent_a, updated_by, updated_at)
    values (f.id, f.studio_id, p_mode, p_guardian_a,
            case when p_mode = 'percent' then p_guardian_b end,
            case when p_mode = 'percent' then p_percent_a end, auth.uid(), now())
    on conflict (family_id) do update
      set mode = excluded.mode, guardian_a = excluded.guardian_a, guardian_b = excluded.guardian_b,
          percent_a = excluded.percent_a, updated_by = excluded.updated_by, updated_at = now();
    if p_mode = 'per_child' and p_children is not null then
      for k, v in select * from jsonb_each_text(p_children) loop
        continue when v is null or v = '';
        if not exists (select 1 from student where id = k::uuid and family_id = f.id and deleted_at is null) then
          raise exception 'INVALID: that child is not in this family' using errcode = 'check_violation';
        end if;
        if not exists (select 1 from guardian where id = v::uuid and family_id = f.id and deleted_at is null) then
          raise exception 'INVALID: choose a guardian in this family' using errcode = 'check_violation';
        end if;
        insert into family_billing_child (student_id, family_id, studio_id, guardian_id) values (k::uuid, f.id, f.studio_id, v::uuid);
      end loop;
    end if;
    summary := case p_mode
      when 'one' then 'invoices to ' || (select full_name from guardian where id = p_guardian_a)
      when 'percent' then 'invoices split ' || p_percent_a || '% ' || (select full_name from guardian where id = p_guardian_a)
                          || ', ' || (100 - p_percent_a) || '% ' || (select full_name from guardian where id = p_guardian_b)
      else 'invoices per child' end;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (f.studio_id, auth.uid(), 'update', 'family_billing', f.id, 'Billing: ' || summary);
end $$;
revoke all on function app.set_family_billing(uuid, text, uuid, uuid, int, jsonb) from public;
grant execute on function app.set_family_billing(uuid, text, uuid, uuid, int, jsonb) to authenticated;

-- Invoices addressed to another guardian are not this guardian's to see.
-- Restrictive, so it holds on every read path whatever else allows the row.
create or replace function app.payer_hidden_invoice_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select i.id from invoice i
   where i.billed_guardian_id is not null
     and i.family_id in (select app.guardian_family_ids())
     and not app.is_admin(i.studio_id)
     and not exists (select 1 from guardian g where g.id = i.billed_guardian_id and g.user_id = auth.uid())
$$;
grant execute on function app.payer_hidden_invoice_ids() to authenticated;

create policy invoice_payer_only on invoice as restrictive for select
  using (billed_guardian_id is null or id not in (select app.payer_hidden_invoice_ids()));
create policy invoice_item_payer_only on invoice_item as restrictive for select
  using (invoice_id not in (select app.payer_hidden_invoice_ids()));
create policy payment_payer_only on payment as restrictive for select
  using (invoice_id is null or invoice_id not in (select app.payer_hidden_invoice_ids()));
create policy credit_note_payer_only on credit_note as restrictive for select
  using (invoice_id not in (select app.payer_hidden_invoice_ids()));

-- Notices about an invoice go to whoever it is addressed to.
create or replace function app.notify_invoice_payer(p_invoice uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare i invoice; g record;
begin
  select * into i from invoice where id = p_invoice;
  if i.id is null then return; end if;
  if i.billed_guardian_id is null then
    perform app.notify_family(i.family_id, p_kind, p_title, p_body, p_href);
    return;
  end if;
  for g in select gd.studio_id, gd.user_id from guardian gd left join guardian_access a on a.guardian_id = gd.id
            where gd.id = i.billed_guardian_id and gd.user_id is not null and gd.deleted_at is null
              and a.may_contact is not false loop
    perform app.notify_user(g.studio_id, g.user_id, p_kind, p_title, p_body, p_href);
  end loop;
end $$;
revoke all on function app.notify_invoice_payer(uuid, text, text, text, text) from public, authenticated, anon;

create or replace function app.on_invoice_issued_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare i invoice; what text;
begin
  select * into i from invoice where id = new.id;
  if i.id is null or i.deleted_at is not null or i.status not in ('issued', 'part_paid', 'paid') then return null; end if;
  if coalesce(i.issued_on, current_date) < current_date - 1 then return null; end if;
  insert into invoice_notice (invoice_id, kind) values (i.id, 'issued') on conflict do nothing;
  if not found then return null; end if;
  select string_agg(description, ', ' order by created_at) into what from invoice_item
   where invoice_id = i.id and deleted_at is null;
  perform app.notify_invoice_payer(i.id, 'invoice_issued',
    'New invoice ' || i.number || ' ' || app.gbp(i.total_minor)
      || case when i.status = 'paid' then ', paid from your credit' else ' due ' || to_char(i.due_on, 'FMDD Mon') end,
    left(what, 140), '/family/payments');
  return null;
end $$;

create or replace function app.on_payment_received_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare num text;
begin
  if new.succeeded_at is null or new.method not in ('card', 'direct_debit', 'bank_transfer', 'cash') then return null; end if;
  if tg_op = 'UPDATE' and old.succeeded_at is not null then return null; end if;
  select number into num from invoice where id = new.invoice_id;
  if num is not null then
    perform app.notify_invoice_payer(new.invoice_id, 'payment_received', 'Payment received: ' || app.gbp(new.amount_minor),
      'Paid towards ' || num || '. Thank you.', '/family/payments');
  else
    perform app.notify_family(new.family_id, 'payment_received', 'Payment received: ' || app.gbp(new.amount_minor),
      'Held on your account for your next invoice. Thank you.', '/family/payments');
  end if;
  return null;
end $$;

create or replace function app.notify_invoices_due(p_studio uuid default null) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r record; g record; n int := 0;
begin
  for r in select i.* from invoice i
            where i.deleted_at is null and i.status in ('issued', 'part_paid') and i.total_minor > i.paid_minor
              and i.due_on between current_date and current_date + 3
              and (p_studio is null or i.studio_id = p_studio)
              and (auth.uid() is null or app.is_admin(i.studio_id) or i.family_id in (select app.guardian_family_ids()))
              and i.id not in (select app.payer_hidden_invoice_ids())
              and not exists (select 1 from invoice_notice x where x.invoice_id = i.id and x.kind = 'due_soon')
  loop
    insert into invoice_notice (invoice_id, kind) values (r.id, 'due_soon');
    for g in select gu.studio_id, gu.user_id from guardian gu
              where gu.family_id = r.family_id and gu.user_id is not null and gu.deleted_at is null
                and (r.billed_guardian_id is null or gu.id = r.billed_guardian_id) loop
      continue when not app.wants(g.user_id, 'invoice_issued', 'in_app');
      insert into notification (studio_id, user_id, kind, title, body, href)
      values (g.studio_id, g.user_id, 'invoice_issued',
              r.number || ' is due ' || case when r.due_on = current_date then 'today' when r.due_on = current_date + 1 then 'tomorrow'
                                             else 'on ' || to_char(r.due_on, 'FMDay DD Mon') end,
              app.gbp(r.total_minor - r.paid_minor) || ' to pay. Bank details are in Payments.', '/family/payments');
    end loop;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ── 2. Credit for reported absences (UR-56) ────────────────────────────────
-- off: nothing (default) · session: the class's per-session value ·
-- fixed: absence_credit_fixed_minor.
alter table studio add column absence_credit text not null default 'off'
  check (absence_credit in ('off', 'session', 'fixed'));
alter table studio add column absence_credit_fixed_minor integer not null default 0
  check (absence_credit_fixed_minor between 0 and 100000);

-- Make-ups for absences or credit, not both: whichever was just chosen wins.
create or replace function app.absence_remedy_one() returns trigger
  language plpgsql set search_path = public, app, pg_temp as $$
begin
  if new.absence_credit <> 'off' and new.makeup_policy = 'cancelled_and_absence' then
    if new.absence_credit is distinct from old.absence_credit then
      new.makeup_policy := 'cancelled';
    else
      new.absence_credit := 'off';
    end if;
  end if;
  return new;
end $$;
create trigger studio_absence_remedy before update of absence_credit, makeup_policy on studio
  for each row execute function app.absence_remedy_one();

create table absence_credit (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  report_id    uuid not null references absence_report(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  session_id   uuid not null references class_session(id) on delete cascade,
  family_id    uuid not null references family(id) on delete cascade,
  payment_id   uuid references payment(id) on delete set null,
  amount_minor integer not null check (amount_minor > 0),
  status       text not null default 'active' check (status in ('active', 'reversed')),
  created_at   timestamptz not null default now(),
  reversed_at  timestamptz
);
create unique index absence_credit_once on absence_credit (session_id, student_id) where status = 'active';
create index absence_credit_family on absence_credit (family_id, created_at desc);
alter table absence_credit enable row level security; alter table absence_credit force row level security;
create policy absence_credit_read on absence_credit for select using (
  studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()) or student_id = app.student_self_id()));
grant select on absence_credit to authenticated;
grant all on absence_credit to service_role;

-- What a reported absence is worth: the child's place in that class on that
-- day, priced by the term or month. Trials, drop-ins and make-ups get
-- nothing (a drop-in is cancelled instead). Null when nothing is due.
create or replace function app.absence_credit_value(p_student uuid, p_session uuid) returns int
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare st studio; cs class_session; c class; price int; per int;
begin
  select * into cs from class_session where id = p_session and deleted_at is null;
  select * into st from studio where id = cs.studio_id;
  if cs.id is null or st.absence_credit = 'off' or st.makeup_policy = 'cancelled_and_absence' or cs.status <> 'scheduled' then
    return null;
  end if;
  select * into c from class where id = cs.class_id;
  if c.pricing not in ('term', 'monthly') then return null; end if;
  select coalesce(e.price_minor, c.price_minor) into price from enrolment e
   where e.class_id = c.id and e.student_id = p_student and e.deleted_at is null
     and app.enrolment_on(e.status, e.started_on, e.ended_on, e.moved_from, e.moved_to, cs.starts_at::date)
   limit 1;
  if coalesce(price, 0) <= 0 then return null; end if;
  if st.absence_credit = 'fixed' then
    per := least(st.absence_credit_fixed_minor, price);
  elsif c.pricing = 'term' then
    per := round(price::numeric / greatest(1, (select count(*) from class_session x where x.class_id = c.id
                                                   and x.deleted_at is null and x.status <> 'cancelled')))::int;
  else
    per := round(price::numeric * 12 / 52)::int;
  end if;
  return nullif(per, 0);
end $$;
grant execute on function app.absence_credit_value(uuid, uuid) to authenticated;

-- Take back credit that has already been spent on invoices: the newest
-- allocations are undone first, so those invoices are owed again.
create or replace function app.unwind_family_credit(p_family uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare need bigint; p record; take bigint;
begin
  need := -app.family_available_credit(p_family);
  if need <= 0 then return; end if;
  for p in select * from payment where family_id = p_family and method = 'account' and invoice_id is not null
                                  and deleted_at is null and succeeded_at is not null
            order by created_at desc, id desc loop
    exit when need <= 0;
    take := least(need, p.amount_minor - p.refunded_minor);
    continue when take <= 0;
    if take >= p.amount_minor then
      update payment set deleted_at = now(), note = concat_ws(' · ', note, 'Credit taken back') where id = p.id;
    else
      update payment set amount_minor = amount_minor - take, note = concat_ws(' · ', note, 'Credit taken back: ' || app.gbp(take)) where id = p.id;
    end if;
    need := need - take;
  end loop;
end $$;
revoke all on function app.unwind_family_credit(uuid) from public, authenticated, anon;

create or replace function app.on_absence_report_credit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; amt int; pay uuid; lbl text; ac absence_credit;
begin
  if tg_op = 'INSERT' and new.status = 'active' then
    if exists (select 1 from absence_credit where session_id = new.session_id and student_id = new.student_id and status = 'active')
       or exists (select 1 from session_credit where session_id = new.session_id and student_id = new.student_id) then
      return null;
    end if;
    amt := app.absence_credit_value(new.student_id, new.session_id);
    if amt is null then return null; end if;
    select * into s from student where id = new.student_id;
    lbl := app.session_label(new.session_id);
    insert into payment (studio_id, family_id, amount_minor, method, provider, succeeded_at, note, recorded_by)
    values (new.studio_id, s.family_id, amt, 'credit', 'ledger', now(),
            'Absence credit: ' || s.first_name || ', ' || lbl, auth.uid())
    returning id into pay;
    insert into absence_credit (studio_id, report_id, student_id, session_id, family_id, payment_id, amount_minor)
    values (new.studio_id, new.id, s.id, new.session_id, s.family_id, pay, amt);
    perform app.allocate_account_credit_internal(s.family_id);
    perform app.recalc_family_balance(s.family_id);
    perform app.notify_family(s.family_id, 'payment_received', app.gbp(amt) || ' credit added',
      s.first_name || ' is reported absent from ' || lbl || '. The credit comes off your next invoice.', '/family/payments');
  elsif tg_op = 'UPDATE' and old.status = 'active' and new.status = 'withdrawn' then
    select * into ac from absence_credit where report_id = new.id and status = 'active';
    if ac.id is null then return null; end if;
    update absence_credit set status = 'reversed', reversed_at = now() where id = ac.id;
    update payment set deleted_at = now(), note = concat_ws(' · ', note, 'Taken back: absence withdrawn') where id = ac.payment_id;
    perform app.unwind_family_credit(ac.family_id);
    perform app.recalc_family_balance(ac.family_id);
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (ac.studio_id, auth.uid(), 'credit', 'family', ac.family_id,
            app.gbp(ac.amount_minor) || ' absence credit taken back: report withdrawn');
  end if;
  return null;
end $$;
create trigger absence_report_credit after insert or update of status on absence_report
  for each row execute function app.on_absence_report_credit();

-- A cancellation does not credit a child already credited for reporting the
-- same session absent (as 0033 otherwise).
create or replace function app.on_session_cancelled_credit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c class; per int; e record; pay uuid;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' then return null; end if;
  if not (select credit_cancelled_classes from studio where id = new.studio_id) then return null; end if;
  select * into c from class where id = new.class_id;
  if c.pricing not in ('term', 'monthly') then return null; end if;
  per := case c.pricing
    when 'term' then round(c.price_minor::numeric / greatest(1, (select count(*) from class_session x where x.class_id = c.id and x.deleted_at is null)))::int
    else round(c.price_minor::numeric * 12 / 52)::int end;
  if per <= 0 then return null; end if;
  for e in select s.id, s.family_id, s.first_name, coalesce(en.price_minor, c.price_minor) price from enrolment en join student s on s.id = en.student_id
            where en.class_id = c.id and en.status = 'active' and en.deleted_at is null loop
    continue when exists (select 1 from session_credit where session_id = new.id and student_id = e.id);
    continue when exists (select 1 from absence_credit where session_id = new.id and student_id = e.id and status = 'active');
    insert into payment (studio_id, family_id, amount_minor, method, succeeded_at, note, recorded_by)
    values (new.studio_id, e.family_id, per, 'credit', now(),
            'Credit: ' || c.name || ' cancelled ' || to_char(new.starts_at, 'FMDD Mon') || ' (' || e.first_name || ')', auth.uid())
    returning id into pay;
    insert into session_credit (session_id, student_id, payment_id, amount_minor) values (new.id, e.id, pay, per);
    perform app.allocate_account_credit(e.family_id);
    perform app.recalc_family_balance(e.family_id);
  end loop;
  return null;
end $$;

-- As 0048, with the place's dates (UR-52) and any credit given (UR-56).
drop function if exists app.absence_options(uuid, int);
create function app.absence_options(p_student uuid, p_days int default 42)
  returns table (session_id uuid, class_name text, starts_at timestamptz, ends_at timestamptz,
                 report_id uuid, note text, withdrawable boolean, credit_minor int)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if app.may_report_absence(p_student) is null then
    raise exception 'FORBIDDEN: only a child''s own family can report an absence' using errcode = 'insufficient_privilege';
  end if;
  return query
  with mine as (
    select cs.id from class_session cs
      join enrolment e on e.class_id = cs.class_id and e.student_id = p_student and e.deleted_at is null
                      and app.enrolment_on(e.status, e.started_on, e.ended_on, e.moved_from, e.moved_to, cs.starts_at::date)
    union select t.session_id from trial t where t.student_id = p_student and t.status = 'booked' and t.deleted_at is null and t.session_id is not null
    union select d.session_id from drop_in_booking d where d.student_id = p_student and d.status = 'booked'
  )
  select cs.id, c.name, cs.starts_at, cs.ends_at, r.id, r.note, (r.id is not null and cs.starts_at > now()),
         (select ac.amount_minor from absence_credit ac where ac.session_id = cs.id and ac.student_id = p_student and ac.status = 'active')
    from mine join class_session cs on cs.id = mine.id
    join class c on c.id = cs.class_id
    left join absence_report r on r.session_id = cs.id and r.student_id = p_student and r.status = 'active'
   where cs.deleted_at is null and cs.status = 'scheduled'
     and cs.starts_at > now() and cs.starts_at < now() + make_interval(days => greatest(1, least(p_days, 180)))
   order by cs.starts_at;
end $$;
revoke all on function app.absence_options(uuid, int) from public;
grant execute on function app.absence_options(uuid, int) to authenticated;
