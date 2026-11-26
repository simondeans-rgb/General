-- ============================================================================
-- 0041 · Teacher threads, notifications per school, daily digest, calendar
--        subscription (R-054, R-051, R-037, R-036)
-- ----------------------------------------------------------------------------
-- Teacher threads: a family replying to a teacher's message marks it as a
-- reply. The teacher who wrote the original reads that reply (and can answer
-- it); the office reads everything in the family's conversation as before.
-- There is still no private channel: every message sits in the family's
-- conversation with the studio.
--
-- Notifications follow the chosen school. People in two schools see a count
-- for the other one instead, and switch to read it.
--
-- Digest: someone who prefers fewer emails gets one a day, at 5pm school
-- time, listing what is new. Urgent notices (a class cancelled today, a
-- safeguarding alert) still go straight away.
--
-- Calendar: each person can make a private subscription link. The link
-- carries a random token, not who they are; making a new link retires the
-- old one. The hosted server renders the feed (server/calendar-feed.mts)
-- from app.calendar_feed().
-- ============================================================================

-- ── Teacher threads ────────────────────────────────────────────────────────
alter table communication add column reply_to uuid references communication(id) on delete set null;
create index communication_reply_to on communication (reply_to) where reply_to is not null;

-- Messages a teacher wrote, through any number of replies, stay theirs to read.
create or replace function app.my_thread_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with recursive t(id) as (
    select c.id from communication c where c.kind = 'direct' and c.sent_by = auth.uid() and c.deleted_at is null
       and app.in_scope(c.studio_id) and app.is_staff(c.studio_id)
    union
    select c.id from communication c join t on c.reply_to = t.id where c.deleted_at is null
  )
  select id from t;
$$;
create policy comm_teacher_thread on communication for select
  using (deleted_at is null and kind = 'direct' and id in (select app.my_thread_ids()));

-- The threads, with the family's name (teachers cannot read the family table).
create or replace function app.my_threads()
  returns table (id uuid, reply_to uuid, family_id uuid, family_name text, subject text, body text,
                 sent_at timestamptz, inbound boolean, sender text, mine boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id, c.reply_to, c.family_id, f.name, c.subject, c.body, c.sent_at, c.inbound,
         app.sender_name(c.sent_by, c.studio_id), c.sent_by = auth.uid()
    from communication c join family f on f.id = c.family_id
   where c.id in (select app.my_thread_ids()) order by c.sent_at;
$$;

-- A family's reply must answer a message in their own conversation.
create or replace function app.check_reply_to() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.reply_to is null then return new; end if;
  if not exists (select 1 from communication p where p.id = new.reply_to and p.family_id is not distinct from new.family_id and p.kind = 'direct') then
    raise exception 'INVALID: that reply does not belong to this conversation' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger communication_reply_check before insert on communication for each row execute function app.check_reply_to();

-- The teacher hears about a reply.
create or replace function app.on_reply_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p communication; fam text;
begin
  if new.reply_to is null or not new.inbound then return null; end if;
  select * into p from communication where id = new.reply_to;
  if p.sent_by is null or not app.is_staff_user(p.sent_by, p.studio_id) or app.is_admin_user(p.sent_by, p.studio_id) then return null; end if;
  select name into fam from family where id = new.family_id;
  insert into notification (studio_id, user_id, kind, title, body, href)
  values (new.studio_id, p.sent_by, 'message', 'Reply from the ' || coalesce(fam, 'family'), left(new.body, 140), '/teach/messages');
  return null;
end $$;
create trigger communication_reply_notify after insert on communication for each row execute function app.on_reply_notify();

create or replace function app.is_staff_user(p_user uuid, p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from membership m where m.user_id = p_user and m.studio_id = p_studio and m.deleted_at is null
                   and m.role in ('owner', 'admin', 'teacher'));
$$;
create or replace function app.is_admin_user(p_user uuid, p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from membership m where m.user_id = p_user and m.studio_id = p_studio and m.deleted_at is null
                   and m.role in ('owner', 'admin'));
$$;

-- A teacher answers a reply in the same thread.
create or replace function app.teacher_reply(p_to uuid, p_body text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r communication; mid uuid;
begin
  select * into r from communication where id = p_to and deleted_at is null;
  if r.id is null or not (r.id in (select app.my_thread_ids())) or not app.is_staff(r.studio_id) then
    raise exception 'FORBIDDEN: you can answer replies to your own messages' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'INVALID: a message needs something in it' using errcode = 'check_violation'; end if;
  insert into communication (studio_id, kind, family_id, subject, body, sent_by, reply_to)
  values (r.studio_id, 'direct', r.family_id, case when r.subject is null then null when r.subject ~ '^Re: ' then r.subject else 'Re: ' || r.subject end,
          btrim(p_body), auth.uid(), r.id)
  returning id into mid;
  return mid;
end $$;

-- ── Notifications follow the chosen school ─────────────────────────────────
drop policy notification_own on notification;
create policy notification_own on notification for select
  using (deleted_at is null and user_id = auth.uid() and app.in_scope(studio_id));
drop policy notification_own_update on notification;
create policy notification_own_update on notification for update
  using (user_id = auth.uid() and app.in_scope(studio_id)) with check (user_id = auth.uid());

create or replace function app.other_school_notifications()
  returns table (studio_id uuid, name text, unread int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select n.studio_id, s.name, count(*)::int from notification n join studio s on s.id = n.studio_id
   where n.user_id = auth.uid() and n.deleted_at is null and n.read_at is null and not app.in_scope(n.studio_id)
   group by n.studio_id, s.name order by s.name;
$$;

-- ── Daily digest ───────────────────────────────────────────────────────────
alter table user_account add column email_digest boolean not null default false;
alter table user_account add column last_digest_at timestamptz;

create or replace function app.set_email_digest(p_on boolean) returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  update user_account set email_digest = p_on, last_digest_at = coalesce(last_digest_at, now()) where id = auth.uid();
$$;

create or replace function app.on_notification_email() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare u user_account; urgent boolean;
begin
  if current_setting('app.quiet', true) = 'on' then return null; end if;
  select * into u from user_account where id = new.user_id and deleted_at is null;
  if u.id is null or coalesce(u.email, '') !~ '@' then return null; end if;
  if not app.wants(new.user_id, new.kind, 'email') then return null; end if;
  urgent := new.kind in ('schedule_change', 'safeguarding') and new.title ~* '^(cancelled|urgent)';
  if u.email_digest and not urgent then return null; end if;      -- waits for the day's digest
  insert into outbound_message (studio_id, channel, to_name, to_address, subject, body, user_id, notification_id, not_before)
  values (new.studio_id, 'email', u.full_name, u.email, new.title,
          coalesce(new.body, '') || E'\n\nOpen Swayvo to see more.', u.id, new.id,
          case when urgent then now() else app.after_quiet(u.id, new.studio_id) end);
  return null;
end $$;

-- One email per person per school per day, from 5pm school time, listing
-- what arrived since the last one and is still unread.
create or replace function app.send_digests() returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r record; n int := 0;
begin
  for r in
    select u.id, u.full_name, u.email, x.studio_id, st.name school,
           string_agg('• ' || x.title || coalesce(' — ' || left(x.body, 120), ''), E'\n' order by x.created_at) lines, count(*) k
      from user_account u
      join notification x on x.user_id = u.id and x.deleted_at is null and x.read_at is null
                          and x.created_at > coalesce(u.last_digest_at, now() - interval '1 day')
      join studio st on st.id = x.studio_id
     where u.email_digest and u.deleted_at is null and coalesce(u.email, '') ~ '@'
       and (now() at time zone coalesce(st.timezone, 'Europe/London'))::time >= time '17:00'
       and coalesce((u.last_digest_at at time zone coalesce(st.timezone, 'Europe/London'))::date, date '2000-01-01')
           < (now() at time zone coalesce(st.timezone, 'Europe/London'))::date
       and app.wants(u.id, x.kind, 'email')
     group by u.id, u.full_name, u.email, x.studio_id, st.name
  loop
    insert into outbound_message (studio_id, channel, to_name, to_address, subject, body, user_id, not_before)
    values (r.studio_id, 'email', r.full_name, r.email, r.school || ': ' || r.k || ' update' || case when r.k = 1 then '' else 's' end || ' today',
            'Here is what is new today:' || E'\n\n' || r.lines || E'\n\nOpen Swayvo to see more. You chose one email a day; change this in your notification settings.',
            r.id, app.after_quiet(r.id, r.studio_id));
    update user_account set last_digest_at = now() where id = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function app.tick() returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s record; auto int := 0; released int := 0; checks int := 0; holds int; digests int;
begin
  holds := app.expire_held_drop_ins();
  for s in select id from studio where deleted_at is null and app.studio_writable(id) loop
    auto := auto + coalesce(app.run_automations(s.id), 0);
    released := released + app.release_scheduled(s.id);
    checks := checks + app.remind_staff_checks(s.id);
    perform app.award_event_milestones(s.id);
  end loop;
  digests := app.send_digests();
  return jsonb_build_object('automations', auto, 'released', released, 'staff_checks', checks,
                            'holds_lapsed', holds, 'digests', digests, 'at', now());
end $$;

-- ── Calendar subscription ─────────────────────────────────────────────────
create table calendar_token (
  token      text primary key,
  user_id    uuid not null references user_account(id) on delete cascade,
  studio_id  uuid not null references studio(id) on delete cascade,
  role       text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
create unique index calendar_token_live on calendar_token (user_id, studio_id) where revoked_at is null;
alter table calendar_token enable row level security; alter table calendar_token force row level security;
create policy calendar_token_own on calendar_token for select using (user_id = auth.uid() and revoked_at is null);
grant select on calendar_token to authenticated;
grant all on calendar_token to service_role;

-- A new link (and the old one stops working).
create or replace function app.issue_calendar_token(p_studio uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tok text; r text;
begin
  r := case when app.is_staff(p_studio) then 'staff'
            when exists (select 1 from guardian g where g.user_id = auth.uid() and g.studio_id = p_studio and g.deleted_at is null) then 'guardian'
            when exists (select 1 from student s where s.user_id = auth.uid() and s.studio_id = p_studio and s.deleted_at is null) then 'student' end;
  if auth.uid() is null or r is null then raise exception 'FORBIDDEN: not a member of that school' using errcode = 'insufficient_privilege'; end if;
  update calendar_token set revoked_at = now() where user_id = auth.uid() and studio_id = p_studio and revoked_at is null;
  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into calendar_token (token, user_id, studio_id, role) values (tok, auth.uid(), p_studio, r);
  return tok;
end $$;

create or replace function app.revoke_calendar_token(p_studio uuid) returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  update calendar_token set revoked_at = now() where user_id = auth.uid() and studio_id = p_studio and revoked_at is null;
$$;

-- The feed: the next 120 days and the last 14, cancellations included so a
-- calendar app can mark them. Only ever what that person could see in the app.
create or replace function app.calendar_feed(p_token text)
  returns table (uid text, title text, starts_at timestamptz, ends_at timestamptz, location text, status text, description text, calendar_name text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t calendar_token; sname text;
begin
  select * into t from calendar_token where token = p_token and revoked_at is null;
  if t.token is null then raise exception 'NOT_FOUND: that calendar link has been replaced or turned off' using errcode = 'no_data_found'; end if;
  update calendar_token set last_used_at = now() where token = p_token;
  select name into sname from studio where id = t.studio_id;
  return query
  with mine as (
    -- Staff: classes they teach or cover.
    select cs.id sid, null::text who from class_session cs join class c on c.id = cs.class_id
      join staff_member sm on sm.id = coalesce(cs.teacher_id, c.teacher_id)
     where t.role = 'staff' and sm.user_id = t.user_id and c.studio_id = t.studio_id
    union
    -- Families: each child's classes, and their drop-ins.
    select cs.id, s.first_name from class_session cs join enrolment e on e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
      join student s on s.id = e.student_id and s.deleted_at is null
      join guardian g on g.family_id = s.family_id and g.user_id = t.user_id and g.deleted_at is null
     where t.role = 'guardian' and s.studio_id = t.studio_id
    union
    select d.session_id, s.first_name from drop_in_booking d join student s on s.id = d.student_id
      join guardian g on g.family_id = s.family_id and g.user_id = t.user_id and g.deleted_at is null
     where t.role = 'guardian' and d.status = 'booked' and s.studio_id = t.studio_id
    union
    select cs.id, null from class_session cs join enrolment e on e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
      join student s on s.id = e.student_id and s.user_id = t.user_id and s.deleted_at is null
     where t.role = 'student' and s.studio_id = t.studio_id
  )
  select cs.id::text || '@sanaa', c.name || coalesce(' — ' || string_agg(distinct m.who, ', '), ''),
         cs.starts_at, cs.ends_at, coalesce(r.name || ', ', '') || coalesce(l.name, ''),
         case when cs.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
         case when cs.status = 'cancelled' then 'This class is cancelled.' else null end, sname
    from mine m join class_session cs on cs.id = m.sid and cs.deleted_at is null
    join class c on c.id = cs.class_id
    left join room r on r.id = coalesce(cs.room_id, c.room_id)
    left join location l on l.id = c.location_id
   where cs.starts_at between now() - interval '14 days' and now() + interval '120 days'
   group by cs.id, c.name, cs.starts_at, cs.ends_at, r.name, l.name, cs.status
   order by cs.starts_at;
end $$;

revoke all on function app.my_thread_ids(), app.my_threads(), app.teacher_reply(uuid, text), app.other_school_notifications(),
  app.set_email_digest(boolean), app.send_digests(), app.issue_calendar_token(uuid), app.revoke_calendar_token(uuid),
  app.calendar_feed(text), app.is_staff_user(uuid, uuid), app.is_admin_user(uuid, uuid) from public;
grant execute on function app.my_thread_ids(), app.my_threads(), app.teacher_reply(uuid, text), app.other_school_notifications(),
  app.set_email_digest(boolean), app.issue_calendar_token(uuid), app.revoke_calendar_token(uuid) to authenticated;
grant execute on function app.calendar_feed(text) to anon, authenticated, service_role;
grant execute on function app.send_digests() to service_role;
