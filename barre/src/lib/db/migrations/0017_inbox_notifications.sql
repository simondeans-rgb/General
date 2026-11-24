-- ============================================================================
-- 0017 · Conversations with families, and the notification centre
-- ----------------------------------------------------------------------------
-- 1. Close a leak. `comm_read` (0007) granted every member of staff read
--    access to every communication. 0013 added a narrower teacher policy but
--    left the broad one in place, and permissive policies are OR-ed — so a
--    teacher could still read every family's direct messages, payment
--    reminders included. Direct conversations belong to the office.
--
-- 2. A message knows which way it travelled. `inbound` is set by the
--    database from who is sending, and `sent_by` is always the caller: a
--    client cannot write a message that claims to be from someone else.
--
-- 3. Notifications are written by the database when something happens, not
--    by whichever screen happened to cause it. Nobody is notified of their
--    own action.
-- ============================================================================

-- ── 1. Who reads what ──────────────────────────────────────────────────────
drop policy comm_read on communication;
create policy comm_read on communication for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and (
    app.is_admin(studio_id)
    or kind = 'studio_announcement'
    or family_id in (select app.guardian_family_ids())
    or (kind = 'class_broadcast' and exists (
          select 1 from enrolment e where e.class_id = communication.class_id
            and e.deleted_at is null and e.status = 'active'
            and e.student_id in (select app.guardian_student_ids())))));

-- A guardian writes only into their own family's conversation. The studio is
-- taken from the family by the trigger below, so it cannot be pointed at a
-- different tenant either.
drop policy comm_guardian_insert on communication;
create policy comm_guardian_insert on communication for insert
  with check (kind = 'direct' and family_id in (select app.guardian_family_ids()));

-- ── 2. Direction and authorship ────────────────────────────────────────────
alter table communication add column inbound boolean not null default false;

create or replace function app.communication_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.family_id is not null then
    select studio_id into new.studio_id from family where id = new.family_id;
  end if;
  -- The automation runner sends as the studio itself, not as whoever ran it.
  if current_setting('app.sending_as_studio', true) = 'on' then
    new.sent_by := null; new.inbound := false;
  -- service_role is a trusted server job (an import, a webhook) and may
  -- write on someone's behalf. Everyone else writes as themselves.
  elsif auth.uid() is not null and current_setting('role', true) is distinct from 'service_role' then
    if new.sent_by is not null and new.sent_by <> auth.uid() then
      raise exception 'FORBIDDEN: a message is sent as yourself' using errcode = 'insufficient_privilege';
    end if;
    new.sent_by := auth.uid();
    new.inbound := not app.is_staff(new.studio_id);
  end if;
  if coalesce(btrim(new.body), '') = '' then
    raise exception 'INVALID: a message needs something in it' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger communication_stamp before insert on communication
  for each row execute function app.communication_stamp();

create index comm_inbound on communication (studio_id, sent_at desc)
  where deleted_at is null and inbound;

-- Marking read is per person. One call marks a whole conversation.
create or replace function app.mark_read(p_ids uuid[]) returns integer
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
declare n integer;
begin
  insert into communication_read (communication_id, user_id)
  select c.id, auth.uid() from communication c where c.id = any(p_ids)
  on conflict (communication_id, user_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function app.mark_read(uuid[]) to authenticated;

-- ── 3. Notifications ───────────────────────────────────────────────────────
create or replace function app.notify_user(
  p_studio uuid, p_user uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if p_user is null or p_user is not distinct from auth.uid() then return; end if;
  -- A bulk import or the demo seed sets app.quiet so that loading a studio's
  -- history does not bury the owner in notifications about the past.
  if current_setting('app.quiet', true) = 'on' then return; end if;
  insert into notification (studio_id, user_id, kind, title, body, href)
  values (p_studio, p_user, p_kind, p_title, p_body, p_href);
end $$;

create or replace function app.notify_admins(
  p_studio uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare u uuid;
begin
  for u in select distinct m.user_id from membership m
            where m.studio_id = p_studio and m.role in ('owner', 'admin') and m.deleted_at is null
  loop
    perform app.notify_user(p_studio, u, p_kind, p_title, p_body, p_href);
  end loop;
end $$;

create or replace function app.notify_family(
  p_family uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g record;
begin
  for g in select studio_id, user_id from guardian
            where family_id = p_family and user_id is not null and deleted_at is null
  loop
    perform app.notify_user(g.studio_id, g.user_id, p_kind, p_title, p_body, p_href);
  end loop;
end $$;

revoke execute on function app.notify_user(uuid, uuid, text, text, text, text),
                           app.notify_admins(uuid, text, text, text, text),
                           app.notify_family(uuid, text, text, text, text)
  from public, authenticated, anon;

-- A message from a family
create or replace function app.on_communication_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fam text;
begin
  if new.inbound and new.family_id is not null then
    select name into fam from family where id = new.family_id;
    perform app.notify_admins(new.studio_id, 'message', 'Message from the ' || fam,
      coalesce(new.subject, left(new.body, 120)), '/inbox?family=' || new.family_id);
  elsif not new.inbound and new.kind = 'direct' then
    perform app.notify_family(new.family_id, 'message',
      coalesce(new.subject, 'New message from the studio'), left(new.body, 120), '/family/messages');
  end if;
  return null;
end $$;
create trigger communication_notify after insert on communication
  for each row execute function app.on_communication_notify();

-- A new enquiry or trial
create or replace function app.on_enquiry_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.notify_admins(new.studio_id, 'new_enquiry',
    'New enquiry' || coalesce(' for ' || new.child_name, ''),
    'From ' || new.contact_name || coalesce(' · via ' || new.source, ''), '/enrolment');
  return null;
end $$;
create trigger enquiry_notify after insert on enquiry
  for each row execute function app.on_enquiry_notify();

create or replace function app.on_trial_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cname text; child text; teacher uuid;
begin
  select c.name, sm.user_id into cname, teacher
    from class c left join staff_member sm on sm.id = c.teacher_id where c.id = new.class_id;
  select first_name into child from student where id = new.student_id;
  perform app.notify_admins(new.studio_id, 'new_trial', 'Trial booked: ' || cname,
    coalesce(child, 'A new child') || ' is coming to try a class.', '/enrolment');
  perform app.notify_user(new.studio_id, teacher, 'new_trial', 'Trial in ' || cname,
    coalesce(child, 'A new child') || ' is joining for a trial.', '/teach');
  return null;
end $$;
create trigger trial_notify after insert on trial
  for each row execute function app.on_trial_notify();

-- A new place taken. The class teacher hears too: it is their room.
create or replace function app.on_enrolment_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cname text; child text; teacher uuid;
begin
  if new.status <> 'active' then return null; end if;
  select c.name, sm.user_id into cname, teacher
    from class c left join staff_member sm on sm.id = c.teacher_id where c.id = new.class_id;
  select first_name || ' ' || last_name into child from student where id = new.student_id;
  perform app.notify_admins(new.studio_id, 'new_enrolment', child || ' joined ' || cname,
    null, '/classes?id=' || new.class_id);
  perform app.notify_user(new.studio_id, teacher, 'new_enrolment', 'New in ' || cname,
    child || ' joins your class.', '/teach');
  return null;
end $$;
create trigger enrolment_notify after insert on enrolment
  for each row execute function app.on_enrolment_notify();

-- A card that did not go through
create or replace function app.on_payment_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fam text;
begin
  if new.failure_code is null or new.succeeded_at is not null then return null; end if;
  if tg_op = 'UPDATE' and old.failure_code is not null then return null; end if;
  select name into fam from family where id = new.family_id;
  perform app.notify_admins(new.studio_id, 'payment_failed', 'Payment failed: ' || fam,
    replace(new.failure_code, '_', ' '),
    '/billing' || coalesce('?id=' || new.invoice_id, ''));
  perform app.notify_family(new.family_id, 'payment_failed', 'A payment did not go through',
    'Your card was declined. You can see what is owed in Payments.', '/family/payments');
  return null;
end $$;
create trigger payment_notify after insert or update of failure_code on payment
  for each row execute function app.on_payment_notify();

-- A waiting-list place offered
create or replace function app.on_waitlist_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cname text; child text; fam uuid;
begin
  if new.status <> 'offered' or old.status = 'offered' then return null; end if;
  select name into cname from class where id = new.class_id;
  select first_name, family_id into child, fam from student where id = new.student_id;
  perform app.notify_family(fam, 'waitlist_offer', 'A place in ' || cname,
    'We can hold it for ' || child || coalesce(' until ' || to_char(new.offer_expires_at, 'FMDay FMDD FMMonth'), '') || '.',
    '/family');
  perform app.notify_admins(new.studio_id, 'waitlist_offer', 'Place offered in ' || cname,
    child || ' was next on the waiting list.', '/classes?id=' || new.class_id);
  return null;
end $$;
create trigger waitlist_notify after update of status on waitlist_entry
  for each row execute function app.on_waitlist_notify();

-- Health details changed by a family. The notification says that it changed,
-- never what it says: notifications are not the place for health data.
create or replace function app.on_medical_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare child text;
begin
  if auth.uid() is null or app.is_staff(new.studio_id) then return null; end if;
  select first_name || ' ' || last_name into child from student where id = new.student_id;
  perform app.notify_admins(new.studio_id, 'medical_updated', 'Medical details updated',
    'A guardian updated ' || child || '’s health information.', '/people?tab=students&id=' || new.student_id);
  return null;
end $$;
create trigger medical_notify after insert or update on medical_record
  for each row execute function app.on_medical_notify();

-- A class handed to a different teacher
create or replace function app.on_class_teacher_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare who uuid;
begin
  if new.teacher_id is not distinct from old.teacher_id or new.teacher_id is null then return null; end if;
  select user_id into who from staff_member where id = new.teacher_id;
  perform app.notify_user(new.studio_id, who, 'teacher_changed', 'You are now teaching ' || new.name,
    to_char(new.start_time, 'HH24:MI') || ' on ' ||
    (array['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'])[new.day_of_week + 1],
    '/teach');
  return null;
end $$;
create trigger class_teacher_notify after update of teacher_id on class
  for each row execute function app.on_class_teacher_notify();

-- A request from a family
create or replace function app.on_request_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.notify_admins(new.studio_id, 'request', new.subject, left(new.body, 120), '/requests');
  return null;
end $$;
create trigger request_notify after insert on studio_request
  for each row execute function app.on_request_notify();

-- Reading and clearing your own notifications
create or replace function app.mark_notifications_read(p_ids uuid[] default null) returns integer
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
declare n integer;
begin
  update notification set read_at = now()
   where user_id = auth.uid() and read_at is null
     and (p_ids is null or id = any(p_ids));
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function app.mark_notifications_read(uuid[]) to authenticated;

create index notification_user_all on notification (user_id, created_at desc) where deleted_at is null;

-- Who a message is from, as the reader should see it. Staff names are shown
-- to anyone in the studio (families know their teachers). A guardian's name
-- is shown only to the office and to their own family — so this function
-- cannot be used to look people up.
create or replace function app.sender_name(p_user uuid, p_studio uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(
    (select sm.display_name from staff_member sm
      where sm.user_id = p_user and sm.studio_id = p_studio and sm.deleted_at is null limit 1),
    (select g.full_name from guardian g
      where g.user_id = p_user and g.studio_id = p_studio and g.deleted_at is null
        and (app.is_admin(p_studio) or g.family_id in (select app.guardian_family_ids()))
      limit 1),
    -- Office staff who do not teach have no staff_member row.
    (select u.full_name from user_account u
      where u.id = p_user and exists (select 1 from membership m where m.user_id = u.id
        and m.studio_id = p_studio and m.role in ('owner', 'admin') and m.deleted_at is null)))
  where p_studio in (select app.studio_ids())
$$;
grant execute on function app.sender_name(uuid, uuid) to authenticated;
