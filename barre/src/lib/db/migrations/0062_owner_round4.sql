-- ============================================================================
-- 0062 · Owners and multi-site schools (round 4: F12, F11, U8, retention)
-- ----------------------------------------------------------------------------
-- F12 · Location-limited administrators who can act
--   0054 made a limited administrator read-only. They now make the changes
--   the office makes every day, but only where every row the change touches
--   belongs to their locations:
--     · people: a family whose children are all in classes at their
--       locations (or in none), and those children — details, parents,
--       emergency contacts, medical records; a new child in such a family;
--     · enrolment: places in classes at their locations, for a child with
--       nothing at another location; withdrawals, class moves (both classes
--       theirs), waiting-list offers;
--     · registers: marking, closing and amending registers of sessions at
--       their locations, inside the same register window as everyone;
--     · messages: to a family with a child at their locations, or a notice
--       to one of their classes;
--     · invoices and payments: for a family wholly at their locations —
--       create, issue, void, credit, record a payment, payment reminders.
--   Everything else stays with the owner and all-location administrators:
--   billing runs, imports, invitations, settings, school-wide notices, a
--   family that is also at another location.
--
--   How: the direct writes get permissive policies limited to those rows.
--   The office's functions keep their own checks and are wrapped: the
--   wrapper checks that every row the call touches is in the caller's
--   locations and only then lets the function run with the office's rights,
--   for that one call (a row in scope_grant that no client can write, which
--   never outlives the call and is never committed). A wrapper that cannot
--   prove the call is in scope passes it through unchanged, so the function
--   refuses it exactly as before.
--
-- F11 · Plans
--   · Leavers no longer count towards the plan's student limit
--     (app.student_on_plan, app.plan_student_count). A leaver who comes back
--     counts again, so re-enrolling one checks the limit.
--   · Owners change plan themselves (app.change_plan); payment for plans is
--     not connected, so Swayvo invoices the school, as before.
--   · A public "Start your school" signup (app.start_school): a school on
--     the trial plan and an owner invitation, the same shape the platform
--     console makes. The platform can close signups (app.platform_set_signups).
--
-- U8 · Money per location: location_money (security invoker, so it shows
--   only what the reader may see). Invoices are split across locations by
--   their class lines; an invoice with none follows the family's classes.
--
-- Retention from imported history: app.period_rank orders the free-text
--   term names of imported attendance (reports.ts uses it).
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- F12 · Location-limited administrators who can act
-- ════════════════════════════════════════════════════════════════════════════

-- The studios where the caller holds a limited administrator membership.
create or replace function app.scoped_admin_studio_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct m.studio_id
    from membership m join membership_location ml on ml.membership_id = m.id
   where m.user_id = auth.uid() and m.role = 'admin' and m.deleted_at is null
     and app.studio_writable(m.studio_id) and app.in_scope(m.studio_id)
$$;

-- Children a limited administrator sees: those in a class, trial or waiting
-- list at their locations (as 0054), plus a brother or sister in the same
-- family who is in nothing anywhere — nothing ties them to another location,
-- and this is the office that would enrol them.
create or replace function app.admin_scope_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with placed as (
    select e.student_id from enrolment e
     where e.class_id in (select app.admin_scope_class_ids()) and e.status = 'active' and e.deleted_at is null
    union
    select t.student_id from trial t
     where t.class_id in (select app.admin_scope_class_ids()) and t.student_id is not null and t.deleted_at is null
       and t.status in ('requested', 'booked', 'attended')
    union
    select w.student_id from waitlist_entry w
     where w.class_id in (select app.admin_scope_class_ids()) and w.deleted_at is null
       and w.status in ('waiting', 'offered'))
  select student_id from placed
  union
  select s.id from student s
   where s.deleted_at is null
     and s.family_id in (select s2.family_id from student s2 where s2.id in (select student_id from placed))
     and not exists (select 1 from enrolment e where e.student_id = s.id and e.status = 'active' and e.deleted_at is null)
     and not exists (select 1 from trial t where t.student_id = s.id and t.deleted_at is null and t.status in ('requested', 'booked'))
     and not exists (select 1 from waitlist_entry w where w.student_id = s.id and w.deleted_at is null and w.status in ('waiting', 'offered'))
$$;

-- Children who are also somewhere else: a live place, trial or waiting-list
-- entry at a location the caller does not cover.
create or replace function app.admin_outside_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id from enrolment e
   where e.studio_id in (select app.scoped_admin_studio_ids()) and e.status = 'active' and e.deleted_at is null
     and e.class_id not in (select app.admin_scope_class_ids())
  union
  select t.student_id from trial t
   where t.studio_id in (select app.scoped_admin_studio_ids()) and t.student_id is not null and t.deleted_at is null
     and t.status in ('requested', 'booked') and t.class_id not in (select app.admin_scope_class_ids())
  union
  select w.student_id from waitlist_entry w
   where w.studio_id in (select app.scoped_admin_studio_ids()) and w.deleted_at is null
     and w.status in ('waiting', 'offered') and w.class_id not in (select app.admin_scope_class_ids())
$$;

-- What a limited administrator may change: a child wholly at their
-- locations, and a family all of whose children are.
create or replace function app.admin_write_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select x from app.admin_scope_student_ids() x
  except
  select y from app.admin_outside_student_ids() y
$$;

create or replace function app.admin_write_family_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select f from app.admin_scope_family_ids() f
   where f not in (select s.family_id from student s where s.id in (select app.admin_outside_student_ids()))
$$;

grant execute on function app.scoped_admin_studio_ids(), app.admin_outside_student_ids(),
  app.admin_write_student_ids(), app.admin_write_family_ids() to authenticated;

-- ── One call with the office's rights ──────────────────────────────────────
-- Rows exist only inside the call that made them (deleted before it returns,
-- discarded with it if it fails). No grant to any client role, so nothing
-- outside these functions can read or write it.
create table scope_grant (
  studio_id uuid not null references studio(id) on delete cascade,
  user_id   uuid not null,
  primary key (studio_id, user_id)
);
alter table scope_grant enable row level security;
alter table scope_grant force row level security;
revoke all on scope_grant from public;
grant all on scope_grant to service_role;

-- A limited administrator counts as the office while a wrapper below has
-- proved the call is within their locations. Otherwise as 0054.
create or replace function app.has_role(p_studio uuid, variadic p_roles app_role[])
  returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from app.memberships() m
                  where m.studio_id = p_studio and m.role = any(p_roles)
                    and (m.role <> 'admin'
                         or not exists (
                           select 1 from membership mm join membership_location ml on ml.membership_id = mm.id
                            where mm.user_id = auth.uid() and mm.studio_id = p_studio
                              and mm.role = 'admin' and mm.deleted_at is null)
                         or exists (select 1 from scope_grant g where g.studio_id = p_studio and g.user_id = auth.uid())))
$$;

-- Opens the office's rights for this call when the caller is a limited
-- administrator and the call is in scope. Returns the studio when it did.
create or replace function app.scope_open(p_studio uuid, p_in_scope boolean) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if p_studio is null or not coalesce(p_in_scope, false) or auth.uid() is null then return null; end if;
  if app.in_read_only_tx() or not app.studio_writable(p_studio) then return null; end if;
  -- An owner or all-location administrator needs nothing; inside an open
  -- call this is already true, so nested calls leave the grant alone.
  if app.is_admin(p_studio) or not app.is_scoped_admin(p_studio) then return null; end if;
  insert into scope_grant (studio_id, user_id) values (p_studio, auth.uid()) on conflict do nothing;
  return p_studio;
end $$;

create or replace function app.scope_close(p_studio uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if p_studio is not null then
    delete from scope_grant where studio_id = p_studio and user_id = auth.uid();
  end if;
end $$;

-- In scope, by the row a call is about.
create or replace function app.scope_open_class(p_class uuid) returns uuid
  language sql security definer set search_path = public, app, pg_temp as $$
  select app.scope_open((select studio_id from class where id = p_class),
                        p_class in (select app.admin_scope_class_ids()))
$$;
create or replace function app.scope_open_session(p_session uuid) returns uuid
  language sql security definer set search_path = public, app, pg_temp as $$
  select app.scope_open((select studio_id from class_session where id = p_session),
                        p_session in (select app.admin_scope_session_ids()))
$$;
create or replace function app.scope_open_family(p_family uuid) returns uuid
  language sql security definer set search_path = public, app, pg_temp as $$
  select app.scope_open((select studio_id from family where id = p_family),
                        p_family in (select app.admin_write_family_ids()))
$$;
create or replace function app.scope_open_invoice(p_invoice uuid) returns uuid
  language sql security definer set search_path = public, app, pg_temp as $$
  select app.scope_open_family((select family_id from invoice where id = p_invoice))
$$;

revoke all on function app.scope_open(uuid, boolean), app.scope_close(uuid), app.scope_open_class(uuid),
  app.scope_open_session(uuid), app.scope_open_family(uuid), app.scope_open_invoice(uuid) from public;

-- ── Direct writes ──────────────────────────────────────────────────────────
-- A family wholly at their locations: every child in it (a child just added
-- included, so the insert can return it).
create policy student_scoped_family_read on student for select
  using (deleted_at is null and family_id in (select app.admin_write_family_ids()));
create policy student_scoped_admin_insert on student for insert
  with check (family_id in (select app.admin_write_family_ids()));
create policy student_scoped_admin_update on student for update
  using (deleted_at is null and id in (select app.admin_write_student_ids()))
  with check (id in (select app.admin_write_student_ids()) and family_id in (select app.admin_scope_family_ids()));

create policy family_scoped_admin_update on family for update
  using (deleted_at is null and id in (select app.admin_write_family_ids()))
  with check (id in (select app.admin_write_family_ids()));

create policy guardian_scoped_admin_insert on guardian for insert
  with check (family_id in (select app.admin_write_family_ids()));
create policy guardian_scoped_admin_update on guardian for update
  using (deleted_at is null and family_id in (select app.admin_write_family_ids()))
  with check (family_id in (select app.admin_write_family_ids()));

create policy emergency_scoped_admin_write on emergency_contact for all
  using (deleted_at is null and student_id in (select app.admin_write_student_ids()))
  with check (student_id in (select app.admin_write_student_ids()));
create policy medical_scoped_admin_write on medical_record for all
  using (deleted_at is null and student_id in (select app.admin_write_student_ids()))
  with check (student_id in (select app.admin_write_student_ids()));

-- A place in one of their classes, for a child with nothing elsewhere.
create policy enrolment_scoped_admin_insert on enrolment for insert
  with check (class_id in (select app.admin_scope_class_ids()) and student_id in (select app.admin_write_student_ids()));
create policy enrolment_scoped_admin_update on enrolment for update
  using (deleted_at is null and class_id in (select app.admin_scope_class_ids()))
  with check (class_id in (select app.admin_scope_class_ids()));

create policy attendance_scoped_admin_write on attendance_record for all
  using (deleted_at is null and session_id in (select app.admin_scope_session_ids()))
  with check (session_id in (select app.admin_scope_session_ids()));

-- Messages: the conversation with a family at their locations, and notices
-- to their classes. Not school-wide announcements.
create policy comm_scoped_admin_read on communication for select
  using (deleted_at is null and (family_id in (select app.admin_scope_family_ids())
         or (kind = 'class_broadcast' and class_id in (select app.admin_scope_class_ids()))));
create policy comm_scoped_admin_insert on communication for insert
  with check ((kind = 'direct' and family_id in (select app.admin_scope_family_ids()))
           or (kind = 'class_broadcast' and class_id in (select app.admin_scope_class_ids())));

-- The register window applies to a limited administrator as to the office
-- (0048 let anyone the policies refused through untouched; they are no
-- longer refused). Otherwise unchanged.
create or replace function app.guard_register_window() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare w record;
begin
  if auth.uid() is null or current_setting('role', true) = 'service_role' then return new; end if;
  -- Anyone else who may not write this register is refused by the policies.
  if not (app.is_admin(new.studio_id)
          or new.session_id in (select app.admin_scope_session_ids())
          or exists (select 1 from class_session cs where cs.id = new.session_id
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

-- A limited administrator places children in their own classes with the
-- office's judgement on age (0046), not the families' rule. Otherwise unchanged.
create or replace function app.enforce_class_age() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; on_day date; cls uuid; dob date; nm text;
begin
  if coalesce(current_setting('role', true), 'none') not in ('authenticated', 'anon') then return new; end if;
  if tg_table_name <> 'drop_in_booking' then cls := new.class_id; end if;
  if tg_table_name = 'enrolment' then
    if new.status <> 'active' then return new; end if;
    if tg_op = 'UPDATE' and new.class_id = old.class_id and new.student_id = old.student_id and old.status = 'active' then
      return new;
    end if;
    on_day := greatest(coalesce(new.started_on, current_date), current_date);
  elsif tg_table_name = 'waitlist_entry' then
    if new.status not in ('waiting', 'offered') then return new; end if;
    if tg_op = 'UPDATE' and new.class_id = old.class_id and new.student_id = old.student_id then return new; end if;
    on_day := current_date;
  elsif tg_table_name = 'trial' then
    if new.status not in ('requested', 'booked') then return new; end if;
    if tg_op = 'UPDATE' and new.class_id = old.class_id and new.student_id is not distinct from old.student_id
       and new.session_id is not distinct from old.session_id then return new; end if;
    select starts_at::date into on_day from class_session where id = new.session_id;
  else -- drop_in_booking
    if new.status not in ('booked', 'held') then return new; end if;
    select cs.class_id, cs.starts_at::date into cls, on_day from class_session cs where cs.id = new.session_id;
  end if;
  if tg_table_name = 'trial' and new.student_id is null then
    select e.child_dob, e.child_name into dob, nm from enquiry e where e.id = new.enquiry_id;
  else
    select * into s from student where id = new.student_id;
    dob := s.date_of_birth; nm := s.first_name;
  end if;
  perform app.check_class_age(cls, dob, on_day, nm, app.is_admin((select studio_id from class where id = cls))
                                                     or cls in (select app.admin_scope_class_ids()));
  return new;
end $$;

-- ── The office's functions, for rows in scope ──────────────────────────────
-- Each original keeps its body and checks under a new name, callable only
-- from here. Functions defined later with the same name replace a wrapper,
-- which only takes the extra reach away again (fails safe).

alter function app.withdraw_enrolment(uuid, text) rename to withdraw_enrolment_office;
create function app.withdraw_enrolment(p_id uuid, p_reason text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r uuid;
begin
  g := app.scope_open_class((select class_id from enrolment where id = p_id));
  r := app.withdraw_enrolment_office(p_id, p_reason);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.transfer_enrolment(uuid, uuid, text, date) rename to transfer_enrolment_office;
create function app.transfer_enrolment(p_enrolment uuid, p_to_class uuid, p_note text default null, p_on date default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r uuid;
begin
  -- Both classes must be theirs.
  if p_to_class in (select app.admin_scope_class_ids()) then
    g := app.scope_open_class((select class_id from enrolment where id = p_enrolment));
  end if;
  r := app.transfer_enrolment_office(p_enrolment, p_to_class, p_note, p_on);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.cancel_class_move(uuid) rename to cancel_class_move_office;
create function app.cancel_class_move(p_enrolment uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid;
begin
  g := app.scope_open((select studio_id from enrolment where id = p_enrolment),
         (select bool_and(x.class_id in (select app.admin_scope_class_ids())) from enrolment x
           where x.id = p_enrolment or x.moved_to = p_enrolment
              or x.id = (select moved_to from enrolment where id = p_enrolment)));
  perform app.cancel_class_move_office(p_enrolment);
  perform app.scope_close(g);
end $$;

alter function app.offer_waitlist_place(uuid, integer) rename to offer_waitlist_place_office;
create function app.offer_waitlist_place(p_id uuid, p_days integer default null) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r boolean;
begin
  g := app.scope_open_class((select class_id from waitlist_entry where id = p_id));
  r := app.offer_waitlist_place_office(p_id, p_days);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.close_register(uuid) rename to close_register_office;
create function app.close_register(p_session uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r boolean;
begin
  g := app.scope_open_session(p_session);
  r := app.close_register_office(p_session);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.amend_attendance(uuid, uuid, attendance_status, text) rename to amend_attendance_office;
create function app.amend_attendance(p_session uuid, p_student uuid, p_status attendance_status, p_reason text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid;
begin
  g := app.scope_open_session(p_session);
  perform app.amend_attendance_office(p_session, p_student, p_status, p_reason);
  perform app.scope_close(g);
end $$;

alter function app.create_invoice(uuid, jsonb, date, text, bigint, boolean, uuid) rename to create_invoice_office;
create function app.create_invoice(
  p_family uuid, p_items jsonb, p_due date default null, p_note text default null,
  p_discount_minor bigint default 0, p_issue boolean default true, p_term uuid default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r uuid;
begin
  g := app.scope_open_family(p_family);
  r := app.create_invoice_office(p_family, p_items, p_due, p_note, p_discount_minor, p_issue, p_term);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.issue_invoice(uuid) rename to issue_invoice_office;
create function app.issue_invoice(p_invoice uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid;
begin
  g := app.scope_open_invoice(p_invoice);
  perform app.issue_invoice_office(p_invoice);
  perform app.scope_close(g);
end $$;

alter function app.void_invoice(uuid, text) rename to void_invoice_office;
create function app.void_invoice(p_invoice uuid, p_reason text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid;
begin
  g := app.scope_open_invoice(p_invoice);
  perform app.void_invoice_office(p_invoice, p_reason);
  perform app.scope_close(g);
end $$;

alter function app.issue_credit_note(uuid, bigint, text, text) rename to issue_credit_note_office;
create function app.issue_credit_note(p_invoice uuid, p_amount bigint, p_reason text, p_settle text default 'account') returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r uuid;
begin
  g := app.scope_open_invoice(p_invoice);
  r := app.issue_credit_note_office(p_invoice, p_amount, p_reason, p_settle);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.record_payment(uuid, bigint, text, uuid, text) rename to record_payment_office;
create function app.record_payment(
  p_family uuid, p_amount_minor bigint, p_method text, p_invoice uuid default null, p_note text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r uuid;
begin
  if p_invoice is null or (select family_id from invoice where id = p_invoice) = p_family then
    g := app.scope_open_family(p_family);
  end if;
  r := app.record_payment_office(p_family, p_amount_minor, p_method, p_invoice, p_note);
  perform app.scope_close(g);
  return r;
end $$;

alter function app.send_payment_reminders(uuid[], text, text) rename to send_payment_reminders_office;
create function app.send_payment_reminders(p_families uuid[], p_subject text, p_body text) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r int; sid uuid;
begin
  select min(f.studio_id::text)::uuid into sid from family f where f.id = any(coalesce(p_families, '{}'));
  g := app.scope_open(sid, cardinality(coalesce(p_families, '{}')) > 0
         and not exists (select 1 from unnest(p_families) x where x not in (select app.admin_write_family_ids())));
  r := app.send_payment_reminders_office(p_families, p_subject, p_body);
  perform app.scope_close(g);
  return r;
end $$;

-- Removing a parent, an emergency contact, a medical record, a place, or a
-- message — each judged by the row it removes.
alter function app.soft_delete(text, uuid) rename to soft_delete_office;
create function app.soft_delete(p_table text, p_id uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g uuid; r boolean; sid uuid; ok boolean := false;
begin
  if p_table = 'guardian' then
    select studio_id, family_id in (select app.admin_write_family_ids()) into sid, ok from guardian where id = p_id;
  elsif p_table = 'emergency_contact' then
    select studio_id, student_id in (select app.admin_write_student_ids()) into sid, ok from emergency_contact where id = p_id;
  elsif p_table = 'medical_record' then
    select studio_id, student_id in (select app.admin_write_student_ids()) into sid, ok from medical_record where id = p_id;
  elsif p_table = 'enrolment' then
    select studio_id, class_id in (select app.admin_scope_class_ids()) into sid, ok from enrolment where id = p_id;
  elsif p_table = 'communication' then
    select studio_id, (family_id in (select app.admin_scope_family_ids())
                       or (kind = 'class_broadcast' and class_id in (select app.admin_scope_class_ids())))
      into sid, ok from communication where id = p_id;
  end if;
  g := app.scope_open(sid, ok);
  r := app.soft_delete_office(p_table, p_id);
  perform app.scope_close(g);
  return r;
end $$;

revoke all on function app.withdraw_enrolment_office(uuid, text), app.transfer_enrolment_office(uuid, uuid, text, date),
  app.cancel_class_move_office(uuid), app.offer_waitlist_place_office(uuid, integer), app.close_register_office(uuid),
  app.amend_attendance_office(uuid, uuid, attendance_status, text),
  app.create_invoice_office(uuid, jsonb, date, text, bigint, boolean, uuid), app.issue_invoice_office(uuid),
  app.void_invoice_office(uuid, text), app.issue_credit_note_office(uuid, bigint, text, text),
  app.record_payment_office(uuid, bigint, text, uuid, text), app.send_payment_reminders_office(uuid[], text, text),
  app.soft_delete_office(text, uuid) from public, authenticated, anon;

revoke all on function app.withdraw_enrolment(uuid, text), app.transfer_enrolment(uuid, uuid, text, date),
  app.cancel_class_move(uuid), app.offer_waitlist_place(uuid, integer), app.close_register(uuid),
  app.amend_attendance(uuid, uuid, attendance_status, text),
  app.create_invoice(uuid, jsonb, date, text, bigint, boolean, uuid), app.issue_invoice(uuid),
  app.void_invoice(uuid, text), app.issue_credit_note(uuid, bigint, text, text),
  app.record_payment(uuid, bigint, text, uuid, text), app.send_payment_reminders(uuid[], text, text),
  app.soft_delete(text, uuid) from public;
grant execute on function app.withdraw_enrolment(uuid, text), app.transfer_enrolment(uuid, uuid, text, date),
  app.cancel_class_move(uuid), app.offer_waitlist_place(uuid, integer), app.close_register(uuid),
  app.amend_attendance(uuid, uuid, attendance_status, text),
  app.create_invoice(uuid, jsonb, date, text, bigint, boolean, uuid), app.issue_invoice(uuid),
  app.void_invoice(uuid, text), app.issue_credit_note(uuid, bigint, text, text),
  app.record_payment(uuid, bigint, text, uuid, text), app.send_payment_reminders(uuid[], text, text),
  app.soft_delete(text, uuid) to authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════════
-- F11 · Plans
-- ════════════════════════════════════════════════════════════════════════════

-- On the plan: a child in a class, trial or waiting list now, or a record
-- just added and not placed yet. Not on it: a leaver — someone who was
-- placed before and is in nothing now, or whose leaving date has passed.
create or replace function app.student_on_plan(p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.deleted_at is null and (
           exists (select 1 from enrolment e where e.student_id = s.id and e.status = 'active' and e.deleted_at is null)
        or exists (select 1 from trial t where t.student_id = s.id and t.status in ('requested', 'booked') and t.deleted_at is null)
        or exists (select 1 from waitlist_entry w where w.student_id = s.id and w.status in ('waiting', 'offered') and w.deleted_at is null)
        or ((s.left_on is null or s.left_on > current_date)
            and not exists (select 1 from enrolment e where e.student_id = s.id and e.deleted_at is null and e.status <> 'cancelled')
            and not exists (select 1 from trial t where t.student_id = s.id and t.deleted_at is null)
            and not exists (select 1 from waitlist_entry w where w.student_id = s.id and w.deleted_at is null)))
    from student s where s.id = p_student
$$;

create or replace function app.plan_student_count(p_studio uuid) returns integer
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select count(*)::int from student s where s.studio_id = p_studio and s.deleted_at is null and app.student_on_plan(s.id)
$$;
grant execute on function app.student_on_plan(uuid), app.plan_student_count(uuid) to authenticated;

create or replace function app.enforce_plan_limit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p plan; used integer; cap integer; what text;
begin
  if new.deleted_at is not null then return new; end if;
  select pl.* into p from studio s join plan pl on pl.id = s.plan_id where s.id = new.studio_id;
  if p.id is null then return new; end if;
  case tg_table_name
    when 'student' then
      cap := p.max_students; what := 'students';
      used := app.plan_student_count(new.studio_id);
    when 'location' then
      cap := p.max_locations; what := 'locations';
      select count(*) into used from location where studio_id = new.studio_id and deleted_at is null;
    when 'staff_member' then
      cap := p.max_staff; what := 'staff';
      select count(*) into used from staff_member where studio_id = new.studio_id and deleted_at is null;
  end case;
  if cap is not null and used >= cap then
    raise exception 'PLAN_LIMIT: The % plan includes up to % %. Ask Swayvo to move you to a larger plan.',
      p.name, cap, what using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- A leaver coming back counts again, so their return is checked too.
create or replace function app.enforce_plan_on_return() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p plan;
begin
  if new.student_id is null or new.deleted_at is not null then return new; end if;
  -- Statuses as text: one function serves two tables with different enums.
  if new.status::text not in ('active', 'waiting', 'offered') then return new; end if;
  if tg_op = 'UPDATE' and old.student_id is not distinct from new.student_id and old.deleted_at is null
     and old.status::text in ('active', 'waiting', 'offered') then
    return new;
  end if;
  if app.student_on_plan(new.student_id) then return new; end if;
  select pl.* into p from studio s join plan pl on pl.id = s.plan_id where s.id = new.studio_id;
  if p.id is not null and p.max_students is not null and app.plan_student_count(new.studio_id) >= p.max_students then
    raise exception 'PLAN_LIMIT: The % plan includes up to % students, and % has left, so coming back would go over it. Ask Swayvo to move you to a larger plan.',
      p.name, p.max_students, (select first_name from student where id = new.student_id) using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger enrolment_plan_return before insert or update of status, student_id, deleted_at on enrolment
  for each row execute function app.enforce_plan_on_return();
create trigger waitlist_plan_return before insert or update of status, student_id, deleted_at on waitlist_entry
  for each row execute function app.enforce_plan_on_return();

-- ── Plans anyone may see (the signup page), without the internals ─────────
create or replace function app.public_plans()
  returns table (code text, name text, price_minor integer, max_students integer, max_locations integer,
                 max_staff integer, is_trial boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select p.code, p.name, p.price_minor, p.max_students, p.max_locations, p.max_staff, p.is_trial
    from plan p where p.active order by p.sort, p.price_minor
$$;
grant execute on function app.public_plans() to anon, authenticated;

-- ── An owner changes plan ─────────────────────────────────────────────────
-- Payments for plans are not connected: the change takes effect now, and
-- Swayvo invoices the school as before. Moving to a plan smaller than what
-- the school already uses is refused rather than leaving it over the limit.
create or replace function app.change_plan(p_plan_code text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; st studio; np plan; op plan; n_students int; n_loc int; n_staff int; too text[] := '{}';
begin
  select m.studio_id into sid from app.memberships() m where m.role = 'owner' limit 1;
  if sid is null then
    raise exception 'FORBIDDEN: only an owner can change the plan' using errcode = 'insufficient_privilege';
  end if;
  if app.in_read_only_tx() then
    raise exception 'FORBIDDEN: read-only' using errcode = 'insufficient_privilege';
  end if;
  select * into st from studio where id = sid;
  if st.status not in ('trialling', 'active') then
    raise exception 'INVALID: this account is %; Swayvo changes its plan', replace(st.status, '_', ' ') using errcode = 'check_violation';
  end if;
  select * into np from plan where code = p_plan_code and active;
  if np.id is null or np.is_trial then
    raise exception 'INVALID: choose one of the plans on offer' using errcode = 'check_violation';
  end if;
  select * into op from plan where id = st.plan_id;
  if op.id = np.id then return np.name; end if;
  n_students := app.plan_student_count(sid);
  select count(*) into n_loc from location where studio_id = sid and deleted_at is null;
  select count(*) into n_staff from staff_member where studio_id = sid and deleted_at is null;
  if np.max_students is not null and n_students > np.max_students then too := too || format('%s students', n_students); end if;
  if np.max_locations is not null and n_loc > np.max_locations then too := too || format('%s locations', n_loc); end if;
  if np.max_staff is not null and n_staff > np.max_staff then too := too || format('%s staff', n_staff); end if;
  if cardinality(too) > 0 then
    raise exception 'INVALID: % is too small: the school has % now', np.name, array_to_string(too, ', ') using errcode = 'check_violation';
  end if;
  update studio set plan_id = np.id, updated_at = now() where id = sid;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'plan', 'studio', sid,
          format('Plan changed by the owner from %s to %s (%s a month). Swayvo invoices the school; card payment for plans is not connected',
                 coalesce(op.name, 'none'), np.name, '£' || to_char(np.price_minor / 100.0, 'FM999,990.00')));
  return np.name;
end $$;
revoke all on function app.change_plan(text) from public;
grant execute on function app.change_plan(text) to authenticated;

-- ── Start your school ──────────────────────────────────────────────────────
create table platform_signup (
  id         boolean primary key default true check (id),
  open       boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into platform_signup (id, open) values (true, true);
alter table platform_signup enable row level security;
alter table platform_signup force row level security;
create policy platform_signup_read on platform_signup for select using (app.is_platform_admin());
grant select on platform_signup to authenticated;
grant all on platform_signup to service_role;

create or replace function app.signups_open() returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select open from platform_signup), false)
$$;
grant execute on function app.signups_open() to anon, authenticated;

create or replace function app.platform_set_signups(p_open boolean) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_platform_super() then
    raise exception 'FORBIDDEN: only a Swayvo super admin can open or close signups' using errcode = 'insufficient_privilege';
  end if;
  update platform_signup set open = coalesce(p_open, false), updated_at = now();
end $$;
revoke all on function app.platform_set_signups(boolean) from public;
grant execute on function app.platform_set_signups(boolean) to authenticated;

-- A new school on the trial plan, and its owner's invitation, as the
-- platform console makes them. The token is returned once. Anyone may call
-- it, so it is limited: one start per email a day, and a ceiling per hour.
create or replace function app.start_school(p_name text, p_owner_name text, p_owner_email text)
  returns table (studio_id uuid, invitation_token text, trial_ends_on date)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare sid uuid; pid uuid; slug_ text; n int := 1; tok text; em text := lower(btrim(coalesce(p_owner_email, ''))); ends date;
begin
  if not app.signups_open() then
    raise exception 'UNAVAILABLE: new schools are not being taken online at the moment. Contact Swayvo to start one' using errcode = 'insufficient_privilege';
  end if;
  if length(btrim(coalesce(p_name, ''))) not between 2 and 120 then
    raise exception 'INVALID: the school needs a name' using errcode = 'check_violation';
  end if;
  if length(btrim(coalesce(p_owner_name, ''))) not between 2 and 120 then
    raise exception 'INVALID: say who you are' using errcode = 'check_violation';
  end if;
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(em) > 254 then
    raise exception 'INVALID: that email address does not look right' using errcode = 'check_violation';
  end if;
  if exists (select 1 from studio_invitation i join audit_log a on a.entity_id = i.studio_id and a.action = 'signup'
              where i.email = em and i.role = 'owner' and i.created_at > now() - interval '1 day') then
    raise exception 'INVALID: a school was started with this email today. Use the link you were given, or contact Swayvo' using errcode = 'check_violation';
  end if;
  if (select count(*) from audit_log where action = 'signup' and at > now() - interval '1 hour') >= 20 then
    raise exception 'UNAVAILABLE: a lot of schools are starting right now. Try again in an hour' using errcode = 'check_violation';
  end if;
  select id into pid from plan where is_trial and active order by sort limit 1;
  if pid is null then
    raise exception 'UNAVAILABLE: there is no trial plan to start on. Contact Swayvo' using errcode = 'check_violation';
  end if;

  slug_ := trim(both '-' from regexp_replace(lower(btrim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if slug_ = '' then slug_ := 'school'; end if;
  while exists (select 1 from studio where slug = case when n = 1 then slug_ else slug_ || '-' || n end) loop
    n := n + 1;
  end loop;
  if n > 1 then slug_ := slug_ || '-' || n; end if;

  ends := current_date + 30;
  insert into studio (name, slug, plan_id, status, trial_ends_on, contact_email)
  values (btrim(p_name), slug_, pid, 'trialling', ends, em)
  returning id into sid;

  tok := app.new_token();
  insert into studio_invitation (studio_id, email, full_name, role, token_hash)
  values (sid, em, btrim(p_owner_name), 'owner', app.hash_token(tok));

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, null, 'signup', 'studio', sid, 'School started online by its owner; owner invited: ' || em);
  return query select sid, tok, ends;
end $$;
revoke all on function app.start_school(text, text, text) from public;
grant execute on function app.start_school(text, text, text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- U8 · Money per location
-- ════════════════════════════════════════════════════════════════════════════
-- Each issued invoice is shared between locations by the value of its class
-- lines; lines with no class (a registration fee, a discount) follow the
-- same shares. An invoice with no class lines at all follows the family's
-- current classes. Payments follow their invoice, or the family's classes
-- when they are not against one. Anything that cannot be placed is shown
-- with no location. security_invoker: the reader's own access rules apply.
create view location_money with (security_invoker = true) as
with fam as (
  select s.family_id, c.location_id, count(*)::numeric as w
    from enrolment e join student s on s.id = e.student_id join class c on c.id = e.class_id
   where e.status = 'active' and e.deleted_at is null and c.deleted_at is null
   group by s.family_id, c.location_id
),
fam_share as (
  select family_id, location_id, w / sum(w) over (partition by family_id) as share from fam
),
inv as (
  select i.* from invoice i where i.deleted_at is null and i.status not in ('draft', 'void')
),
lines as (
  select ii.invoice_id, c.location_id, sum(greatest(ii.total_minor, 0))::numeric as w
    from invoice_item ii join class c on c.id = ii.class_id
   where ii.deleted_at is null
   group by ii.invoice_id, c.location_id
),
inv_share as (
  select l.invoice_id, l.location_id, l.w / nullif(sum(l.w) over (partition by l.invoice_id), 0) as share
    from lines l where l.w > 0
  union all
  select inv.id, fs.location_id, fs.share from inv join fam_share fs on fs.family_id = inv.family_id
   where not exists (select 1 from lines l where l.invoice_id = inv.id and l.w > 0)
),
inv_placed as (
  select inv.studio_id, inv.id, s.location_id, coalesce(s.share, 1) as share, inv.total_minor, inv.paid_minor,
         inv.status, inv.issued_on, inv.due_on
    from inv left join inv_share s on s.invoice_id = inv.id
),
pay as (
  select p.studio_id, coalesce(isr.location_id, fs.location_id) as location_id,
         coalesce(isr.share, fs.share, 1) * (p.amount_minor - p.refunded_minor) as amount
    from payment p
    left join inv_share isr on isr.invoice_id = p.invoice_id
    left join fam_share fs on p.invoice_id is null and fs.family_id = p.family_id
   where p.deleted_at is null and p.succeeded_at >= now() - interval '30 days' and p.method not in ('account', 'credit')
),
figures as (
  select studio_id, location_id,
         share * total_minor * (issued_on > current_date - 30)::int as billed_30d,
         share * (total_minor - paid_minor) * (status in ('issued', 'part_paid'))::int as outstanding,
         share * (total_minor - paid_minor) * (status in ('issued', 'part_paid') and due_on < current_date)::int as overdue,
         0::numeric as collected_30d
    from inv_placed
  union all
  select studio_id, location_id, 0, 0, 0, amount from pay
)
select m.studio_id, m.location_id, l.name as location,
       round(sum(m.billed_30d))::bigint as billed_30d_minor,
       round(sum(m.outstanding))::bigint as outstanding_minor,
       round(sum(m.overdue))::bigint as overdue_minor,
       round(sum(m.collected_30d))::bigint as collected_30d_minor
  from figures m left join location l on l.id = m.location_id
 group by m.studio_id, m.location_id, l.name;
grant select on location_money to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Retention from imported history
-- ════════════════════════════════════════════════════════════════════════════
-- Imported terms are free text ("Summer 2025", "Autumn term 2024"). Ranked by
-- the year in the name, then the season, so the most recent can be found.
create or replace function app.period_rank(p_period text) returns integer
  language sql immutable as $$
  select coalesce((select max(m[1]::int) from regexp_matches(coalesce(p_period, ''), '((?:19|20)\d\d)', 'g') m), 0) * 10
       + case when p_period ~* '(autumn|fall|michaelmas|sep|oct|nov|dec)' then 3
              when p_period ~* '(summer|trinity|may|jun|jul|aug)' then 2
              when p_period ~* '(spring|easter|lent|feb|mar|apr)' then 1
              else 0 end
$$;
grant execute on function app.period_rank(text) to authenticated;
