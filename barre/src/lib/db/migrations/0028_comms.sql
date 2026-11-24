-- ============================================================================
-- 0028 · Communication: who has seen it, what people want to hear about,
--        teachers writing to families, requests in the conversation, and
--        messages sent later (R-018, R-019, R-028, R-037)
-- ============================================================================

-- ── R-018 · Who has seen a message ─────────────────────────────────────────
-- One row per family the message reached. "Seen" means any parent or carer
-- in that family opened it. Families with nobody signed up cannot see
-- anything in the app, and say so rather than counting as "not seen".
-- Only the office, or the person who sent it, may ask.
create or replace function app.message_reach(p_comm uuid)
  returns table (family_id uuid, family_name text, has_login boolean, seen boolean, seen_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare c communication;
begin
  select * into c from communication where id = p_comm and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or c.sent_by = auth.uid()) then
    raise exception 'FORBIDDEN: only the sender or the office can see who has read this' using errcode = 'insufficient_privilege';
  end if;
  return query
  with reached as (
    select f.id, f.name from family f
     where f.studio_id = c.studio_id and f.deleted_at is null and not f.is_prospect and (
           (c.kind = 'direct' and f.id = c.family_id)
        or (c.kind = 'studio_announcement')
        or (c.kind = 'class_broadcast' and exists (
              select 1 from enrolment e join student s on s.id = e.student_id
               where e.class_id = c.class_id and s.family_id = f.id and e.deleted_at is null
                 and (e.status = 'active' or (e.ended_on is not null and e.ended_on >= c.sent_at::date)))))
  )
  select r.id, r.name,
         exists (select 1 from guardian g where g.family_id = r.id and g.user_id is not null and g.deleted_at is null),
         exists (select 1 from communication_read cr join guardian g on g.user_id = cr.user_id
                  where cr.communication_id = c.id and g.family_id = r.id),
         (select min(cr.read_at) from communication_read cr join guardian g on g.user_id = cr.user_id
           where cr.communication_id = c.id and g.family_id = r.id)
    from reached r order by 4, r.name;
end $$;

-- Nudge everyone who has not opened it yet. Once per message per hour, so a
-- nervous double-tap does not send two.
create table message_reminder (
  id uuid primary key default gen_random_uuid(),
  communication_id uuid not null references communication(id) on delete cascade,
  sent_by uuid references user_account(id) on delete set null,
  families int not null,
  sent_at timestamptz not null default now()
);
alter table message_reminder enable row level security;
alter table message_reminder force row level security;
create policy message_reminder_read on message_reminder for select
  using (exists (select 1 from communication c where c.id = communication_id and (app.is_admin(c.studio_id) or c.sent_by = auth.uid())));
grant select on message_reminder to authenticated;
grant all on message_reminder to service_role;

create or replace function app.remind_unread(p_comm uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c communication; f record; n int := 0;
begin
  select * into c from communication where id = p_comm and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or c.sent_by = auth.uid()) then
    raise exception 'FORBIDDEN: only the sender or the office can send a reminder' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from message_reminder where communication_id = c.id and sent_at > now() - interval '1 hour') then
    raise exception 'INVALID: a reminder went less than an hour ago' using errcode = 'check_violation';
  end if;
  for f in select * from app.message_reach(p_comm) r where not r.seen and r.has_login loop
    perform app.notify_family(f.family_id, 'message_reminder', 'Reminder: ' || coalesce(c.subject, 'a message from the studio'),
                              left(c.body, 120), case when c.kind = 'direct' then '/family/messages' else '/family' end);
    n := n + 1;
  end loop;
  insert into message_reminder (communication_id, sent_by, families) values (c.id, auth.uid(), n);
  return n;
end $$;

-- ── R-019 · What each person wants to hear about ───────────────────────────
-- Categories group the notification kinds. Two can never be switched off
-- in the app: schedule changes (a cancelled class) and safety (medical and
-- emergency-contact changes reaching the office).
create or replace function app.notification_category(p_kind text) returns text
  language sql immutable as $$
  select case
    when p_kind in ('message', 'message_reminder', 'request', 'request_answered') then 'messages'
    when p_kind in ('payment_failed', 'invoice_issued', 'payment_received') then 'payments'
    when p_kind in ('schedule_change', 'cover_assigned') then 'schedule'
    when p_kind in ('feedback', 'feedback_published', 'milestone', 'report_shared') then 'progress'
    when p_kind in ('new_enquiry', 'new_trial', 'new_enrolment', 'waitlist', 'waitlist_offer', 'teacher_changed') then 'enrolment'
    when p_kind in ('medical_updated', 'contact_updated', 'safeguarding', 'staff_check_due') then 'safety'
    else 'other' end;
$$;

create table notification_preference (
  user_id   uuid not null references user_account(id) on delete cascade,
  category  text not null check (category in ('messages', 'payments', 'schedule', 'progress', 'enrolment', 'safety', 'other')),
  in_app    boolean not null default true,
  email     boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, category),
  -- What cannot be switched off.
  check (category not in ('schedule', 'safety') or (in_app and email))
);
alter table notification_preference enable row level security;
alter table notification_preference force row level security;
create policy notification_preference_own on notification_preference for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on notification_preference to authenticated;
grant all on notification_preference to service_role;

-- Quiet hours: when push and email (once connected) wait until morning. The
-- in-app list is silent anyway, so it is not affected.
alter table user_account add column quiet_from time;
alter table user_account add column quiet_to time;

create or replace function app.wants(p_user uuid, p_kind text, p_channel text default 'in_app') returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select case when p_channel = 'email' then p.email else p.in_app end
                     from notification_preference p
                    where p.user_id = p_user and p.category = app.notification_category(p_kind)), true);
$$;

create or replace function app.notify_user(
  p_studio uuid, p_user uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if p_user is null or p_user is not distinct from auth.uid() then return; end if;
  if auth.uid() is null and current_setting('app.quiet', true) = 'on' then return; end if;
  if not app.wants(p_user, p_kind, 'in_app') then return; end if;
  insert into notification (studio_id, user_id, kind, title, body, href)
  values (p_studio, p_user, p_kind, p_title, p_body, p_href);
end $$;
revoke execute on function app.notify_user(uuid, uuid, text, text, text, text) from public, authenticated, anon;

create or replace function app.set_notification_preference(p_category text, p_in_app boolean, p_email boolean) returns void
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
begin
  if p_category in ('schedule', 'safety') and not (p_in_app and p_email) then
    raise exception 'INVALID: changes to classes and safety notices cannot be switched off' using errcode = 'check_violation';
  end if;
  insert into notification_preference (user_id, category, in_app, email)
  values (auth.uid(), p_category, p_in_app, p_email)
  on conflict (user_id, category) do update set in_app = excluded.in_app, email = excluded.email, updated_at = now();
end $$;

create or replace function app.set_quiet_hours(p_from time, p_to time) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if (p_from is null) <> (p_to is null) then
    raise exception 'INVALID: give both a start and an end, or neither' using errcode = 'check_violation';
  end if;
  update user_account set quiet_from = p_from, quiet_to = p_to, updated_at = now() where id = auth.uid();
end $$;

-- ── R-028 · Teachers write to families; requests live in the conversation ──
-- A teacher may write to the family of a child they teach. The message sits
-- in the family's conversation, so the office sees it — there are no private
-- channels between staff and children's families. Replies come to the office.
alter table communication add column request_id uuid references studio_request(id) on delete set null;

create or replace function app.teacher_message_family(p_student uuid, p_subject text, p_body text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; mid uuid;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null or not (app.is_admin(s.studio_id)
       or (app.has_role(s.studio_id, 'teacher') and s.id in (select app.teacher_student_ids()))) then
    raise exception 'FORBIDDEN: you can write to the families of children you teach' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'INVALID: a message needs something in it' using errcode = 'check_violation'; end if;
  insert into communication (studio_id, kind, family_id, subject, body, sent_by)
  values (s.studio_id, 'direct', s.family_id, coalesce(nullif(btrim(p_subject), ''), 'About ' || s.first_name), btrim(p_body), auth.uid())
  returning id into mid;
  return mid;
end $$;

-- A teacher reads what they sent (and can see it was read); nothing else
-- in a family's conversation.
create policy comm_teacher_own_direct on communication for select
  using (deleted_at is null and kind = 'direct' and sent_by = auth.uid());

-- Requests appear in the family's conversation too, so the story of a
-- medical update and its acknowledgement reads in one place. The copy is
-- marked with request_id: it is handled in Requests, so it never counts as
-- an unread message for the office.
create or replace function app.on_request_mirror() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.family_id is null then return null; end if;
  if tg_op = 'INSERT' and new.raised_by is not null and not app.is_staff(new.studio_id) then
    insert into communication (studio_id, kind, family_id, subject, body, sent_by, inbound, request_id)
    values (new.studio_id, 'direct', new.family_id, new.subject, new.body, coalesce(auth.uid(), new.raised_by), true, new.id);
  elsif tg_op = 'UPDATE' and new.answer is not null and new.answer is distinct from old.answer then
    insert into communication (studio_id, kind, family_id, subject, body, sent_by, inbound, request_id)
    values (new.studio_id, 'direct', new.family_id, 'Re: ' || new.subject, new.answer, coalesce(auth.uid(), new.answered_by), false, new.id);
  end if;
  return null;
end $$;
create trigger request_mirror after insert or update of answer on studio_request
  for each row execute function app.on_request_mirror();

-- The mirror must not notify twice: the request already notified the office,
-- and the answer already notified the family.
create or replace function app.on_communication_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fam text;
begin
  if new.request_id is not null or new.sent_at > now() + interval '1 minute' then return null; end if;
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

-- The stamp trigger normally forces sent_by to the caller; the mirror writes
-- as the parent who raised the request (or the person who answered), so it
-- runs with no user and is trusted. Allow that one path explicitly.
create or replace function app.communication_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.family_id is not null then
    select studio_id into new.studio_id from family where id = new.family_id;
  end if;
  if pg_trigger_depth() > 1 and new.request_id is not null then
    null;   -- written by app.on_request_mirror as the caller (see there)
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

-- ── R-037 · Send later ─────────────────────────────────────────────────────
-- A message with sent_at in the future is scheduled. Until then only the
-- office and its author can see it; a restrictive policy applies on top of
-- every read policy, so no other path can reveal it early.
create policy comm_not_before_time on communication as restrictive for select
  using (sent_at <= now() or app.is_admin(studio_id) or sent_by = auth.uid());

create table scheduled_release (
  communication_id uuid primary key references communication(id) on delete cascade,
  released_at timestamptz not null default now()
);
alter table scheduled_release enable row level security;
alter table scheduled_release force row level security;
grant all on scheduled_release to service_role;

-- Tell people about scheduled messages whose time has come. Called by the
-- automation runner and whenever the office opens the app; idempotent.
create or replace function app.release_scheduled(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c communication; n int := 0; u uuid;
begin
  if not app.is_staff(p_studio) and auth.uid() is not null then return 0; end if;
  for c in select * from communication x where x.studio_id = p_studio and x.deleted_at is null
             and x.sent_at <= now() and x.sent_at > x.created_at + interval '1 minute'
             and not exists (select 1 from scheduled_release r where r.communication_id = x.id) loop
    insert into scheduled_release (communication_id) values (c.id);
    if c.kind = 'direct' and not c.inbound then
      perform app.notify_family(c.family_id, 'message', coalesce(c.subject, 'New message from the studio'), left(c.body, 120), '/family/messages');
    elsif c.kind = 'class_broadcast' then
      for u in select distinct g.user_id from enrolment e join student s on s.id = e.student_id
                 join guardian g on g.family_id = s.family_id and g.user_id is not null and g.deleted_at is null
                where e.class_id = c.class_id and e.status = 'active' and e.deleted_at is null loop
        perform app.notify_user(c.studio_id, u, 'message', coalesce(c.subject, 'A notice from your class'), left(c.body, 120), '/family');
      end loop;
    elsif c.kind = 'studio_announcement' then
      for u in select distinct g.user_id from guardian g join family f on f.id = g.family_id and not f.is_prospect
                where g.studio_id = c.studio_id and g.user_id is not null and g.deleted_at is null loop
        perform app.notify_user(c.studio_id, u, 'message', coalesce(c.subject, 'News from the studio'), left(c.body, 120), '/family');
      end loop;
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Scheduling is a staff thing, and only into the future.
create or replace function app.check_schedule() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.sent_at > now() + interval '1 minute' then
    if not app.is_staff(new.studio_id) and auth.uid() is not null then new.sent_at := now(); end if;
    if new.sent_at > now() + interval '60 days' then
      raise exception 'INVALID: schedule a message at most 60 days ahead' using errcode = 'check_violation';
    end if;
  elsif new.sent_at < now() - interval '1 minute' and auth.uid() is not null then
    new.sent_at := now();
  end if;
  return new;
end $$;
create trigger communication_schedule before insert on communication
  for each row execute function app.check_schedule();

revoke all on function app.message_reach(uuid), app.remind_unread(uuid), app.teacher_message_family(uuid, text, text),
  app.release_scheduled(uuid), app.set_quiet_hours(time, time) from public;
grant execute on function app.message_reach(uuid), app.remind_unread(uuid), app.teacher_message_family(uuid, text, text),
  app.release_scheduled(uuid), app.set_notification_preference(text, boolean, boolean), app.set_quiet_hours(time, time),
  app.notification_category(text) to authenticated;
