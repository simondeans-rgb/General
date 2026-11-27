-- ============================================================================
-- 0050 · Public page, one diary, events, owner reports, migration toolkit
--        (UR-20, UR-42, UR-26, UR-50, UR-33, UR-34, UR-51, UR-32)
-- ----------------------------------------------------------------------------
-- Public page (/join)
--   · Each class can say what level it is in plain words and what to wear or
--     bring; with its description, ages and ongoing price these reach the
--     public page through app.public_class_info().
--   · The school's arrival advice and cancellation policy, and how to reach
--     it, come from app.public_school_info() (sensible defaults until a
--     school writes its own).
--   · A trial booking may carry the child's allergies or medical needs, a
--     second emergency contact and the family's photo choice. They are
--     written to the child's medical record, emergency contacts and
--     consent_record ('photography'), so the teacher's register brief shows
--     them for the trial exactly as for any other child.
--
-- One diary
--   · app.diary_items(user, from, to): every class, drop-in, rehearsal,
--     performance, competition, private lesson and exam a person's children
--     (or the student themselves) are down for, labelled by type. The
--     family schedule, the student timetable and the calendar feed all read
--     it, so the three cannot disagree.
--
-- Events
--   · app.event_places(event): places taken and left, counted past RLS, so a
--     parent sees the true number rather than only their own child.
--   · app.my_event_status(): each of my children's status on each event.
--   · Notices can name an event (communication.event_id).
--   · A simple helper rota: slots with a role, time and number needed;
--     guardians sign up and withdraw themselves; the office sees who.
--
-- Migration toolkit
--   · app.import_classes(rows, commit): a timetable CSV, all-or-nothing,
--     re-runnable without duplicates.
--   · app.import_opening_balances(rows, as_at, commit): per family, a clearly
--     labelled "Opening balance" invoice (money owed) or credit (money held),
--     once per family per import, so a later billing run does not bill the
--     same history again.
-- ============================================================================

-- ── Public page ────────────────────────────────────────────────────────────
alter table class add column level_note text check (level_note is null or length(level_note) <= 200);
alter table class add column what_to_bring text check (what_to_bring is null or length(what_to_bring) <= 400);
alter table studio add column public_arrival_note text check (public_arrival_note is null or length(public_arrival_note) <= 400);
alter table studio add column public_cancellation_note text check (public_cancellation_note is null or length(public_cancellation_note) <= 600);

-- What a prospect needs to choose a class. Only public classes with a session
-- in the next three weeks, one row per class name.
create or replace function app.public_class_info(p_slug text)
  returns table (class_name text, style text, description text, level text, level_note text, what_to_bring text,
                 age_min smallint, age_max smallint, price_minor int, pricing text, trial_price_minor int,
                 prerequisites text, location text, address text, postcode text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct on (c.name)
         c.name, ds.name, c.description, lv.name,
         coalesce(c.level_note, case when c.prerequisites is null and (lv.name is null or lv.name ~* 'beginner|open|pre|intro|baby|tots|1$')
                                     then 'No experience needed' end),
         c.what_to_bring, c.age_min, c.age_max, c.price_minor, c.pricing::text, c.trial_price_minor,
         c.prerequisites, l.name,
         nullif(concat_ws(', ', nullif(btrim(l.address_line1), ''), nullif(btrim(l.address_line2), ''), nullif(btrim(l.city), '')), ''),
         l.postcode
    from studio st
    join class c on c.studio_id = st.id and c.deleted_at is null and c.visibility = 'public'
    join class_session cs on cs.class_id = c.id and cs.deleted_at is null and cs.status = 'scheduled'
         and cs.starts_at between now() and now() + interval '21 days'
    left join dance_style ds on ds.id = c.dance_style_id
    left join level lv on lv.id = c.level_id
    left join location l on l.id = c.location_id
   where st.slug = lower(p_slug) and st.deleted_at is null and app.studio_writable(st.id)
   order by c.name, cs.starts_at;
$$;

create or replace function app.public_school_info(p_slug text)
  returns table (contact_email text, contact_phone text, arrival_note text, cancellation_note text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.contact_email, s.contact_phone,
         coalesce(s.public_arrival_note, 'Please arrive 10 minutes early. The teacher will meet you at the door and show you where to change.'),
         coalesce(s.public_cancellation_note, 'If you can’t come, please let the school know at least 24 hours before, so the place can go to someone else.')
    from studio s where s.slug = lower(p_slug) and s.deleted_at is null and app.studio_writable(s.id);
$$;
revoke all on function app.public_class_info(text), app.public_school_info(text) from public;
grant execute on function app.public_class_info(text), app.public_school_info(text) to authenticated, anon, service_role;

-- The 0040 booking, plus the child's safety details (UR-42).
-- Extra p_form keys, all optional: allergies, medical, emergency_name,
-- emergency_phone, emergency_relationship, photo_consent ('true' | 'false').
create or replace function app.public_book_trial(p_slug text, p_session uuid, p_form jsonb) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; cs record; enq uuid; tid uuid; dob date; kid uuid;
        v_all text := nullif(btrim(p_form ->> 'allergies'), ''); v_med text := nullif(btrim(p_form ->> 'medical'), '');
        v_en text := nullif(btrim(p_form ->> 'emergency_name'), ''); v_ep text := nullif(btrim(p_form ->> 'emergency_phone'), '');
        v_photo text := nullif(p_form ->> 'photo_consent', '');
begin
  select * into st from studio where slug = lower(p_slug) and deleted_at is null;
  if st.id is null or not app.studio_writable(st.id) then
    raise exception 'NOT_FOUND: that school' using errcode = 'no_data_found';
  end if;
  if coalesce(p_form ->> 'website', '') <> '' then return 'ok'; end if;   -- quietly drop bots
  if coalesce(btrim(p_form ->> 'contact_name'), '') = '' or coalesce(btrim(p_form ->> 'child_name'), '') = ''
     or coalesce(btrim(p_form ->> 'contact_phone'), '') = '' or coalesce(p_form ->> 'contact_email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID: please give your name, email, a phone number and your child''s name' using errcode = 'check_violation';
  end if;
  dob := (p_form ->> 'child_dob')::date;
  if dob is null or dob > current_date or dob < current_date - interval '100 years' then
    raise exception 'INVALID: please check your child''s date of birth' using errcode = 'check_violation';
  end if;
  if length(coalesce(v_all, '')) > 500 or length(coalesce(v_med, '')) > 1000 or length(coalesce(v_en, '')) > 120 or length(coalesce(v_ep, '')) > 40 then
    raise exception 'INVALID: please shorten the medical or emergency details' using errcode = 'check_violation';
  end if;
  if (v_en is null) <> (v_ep is null) then
    raise exception 'INVALID: please give both a name and a phone number for the emergency contact' using errcode = 'check_violation';
  end if;
  select s.id, s.class_id, c.trial_price_minor into cs
    from app.public_trial_sessions(p_slug) p join class_session s on s.id = p.session_id
    join class c on c.id = s.class_id where p.session_id = p_session;
  if cs.id is null then
    raise exception 'INVALID: that class is full or no longer open for trials — please pick another' using errcode = 'check_violation';
  end if;
  -- One booking per email per session, so a double-click is not two trials.
  if exists (select 1 from trial t join enquiry e on e.id = t.enquiry_id
              where t.session_id = cs.id and lower(e.contact_email) = lower(btrim(p_form ->> 'contact_email'))
                and lower(e.child_name) = lower(btrim(p_form ->> 'child_name')) and t.deleted_at is null) then
    return 'ok';
  end if;
  perform app.public_guard(st.id, 'trial', p_form);
  insert into enquiry (studio_id, stage, contact_name, contact_email, contact_phone, child_name, child_dob,
                       interest_class_id, source, marketing_consent)
  values (st.id, 'trial_booked', btrim(p_form ->> 'contact_name'), lower(btrim(p_form ->> 'contact_email')),
          btrim(p_form ->> 'contact_phone'), btrim(p_form ->> 'child_name'), dob, cs.class_id, 'website',
          coalesce(p_form ->> 'marketing', '') in ('true', 't', 'yes', 'on'))
  returning id into enq;
  insert into trial (studio_id, class_id, session_id, enquiry_id, status, price_minor)
  values (st.id, cs.class_id, cs.id, enq, 'booked', cs.trial_price_minor)
  returning id into tid;
  kid := app.ensure_trial_student(tid);

  -- The safety details go where the register brief already looks.
  if kid is not null then
    if v_all is not null or v_med is not null then
      insert into medical_record (studio_id, student_id, allergies, conditions)
      values (st.id, kid, v_all, v_med)
      on conflict (student_id) do update set allergies = coalesce(excluded.allergies, medical_record.allergies),
             conditions = coalesce(excluded.conditions, medical_record.conditions), updated_at = now();
    end if;
    if v_ep is not null then
      insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
      values (st.id, kid, v_en, coalesce(nullif(btrim(p_form ->> 'emergency_relationship'), ''), 'Emergency contact'), v_ep, 2);
    end if;
    if v_photo in ('true', 'false') then
      insert into consent_record (studio_id, student_id, kind, granted, note)
      -- Consent is a history (0047): each choice is a new row; the latest wins.
      values (st.id, kid, 'photography', v_photo = 'true', 'Given on the trial booking form');
    end if;
  end if;
  return 'ok';
end $$;

-- ── One diary (UR-26) ──────────────────────────────────────────────────────
-- Not callable directly: it trusts p_user. app.my_diary and app.calendar_feed
-- are the two ways in.
create or replace function app.diary_items(p_user uuid, p_from timestamptz, p_to timestamptz)
  returns table (uid text, item_kind text, title text, starts_at timestamptz, ends_at timestamptz,
                 location text, status text, student_id uuid, child text, class_id uuid, ref_id uuid,
                 style text, colour text, teacher text, detail text, studio_id uuid)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with kids as (
    select s.id, s.first_name, s.studio_id from student s
     where s.deleted_at is null and (
           s.family_id in (select g.family_id from guardian g where g.user_id = p_user and g.deleted_at is null)
        or (s.user_id = p_user and s.login_enabled))
  ),
  shows as (   -- events each child has a confirmed place on
    select p.event_id, k.id as kid from event_participant p join kids k on k.id = p.student_id
     where p.status = 'confirmed' and p.deleted_at is null
  )
  -- Classes
  select cs.id::text, 'class', c.name, cs.starts_at, cs.ends_at,
         nullif(concat_ws(', ', coalesce(sr.name, r.name), l.name), ''),
         cs.status::text, k.id, k.first_name, c.id, cs.id, ds.name, ds.colour,
         coalesce(cover.display_name, tm.display_name), null::text, c.studio_id
    from kids k
    join enrolment e on e.student_id = k.id and e.status = 'active' and e.deleted_at is null
    join class c on c.id = e.class_id
    join class_session cs on cs.class_id = c.id and cs.deleted_at is null
    left join dance_style ds on ds.id = c.dance_style_id
    left join staff_member tm on tm.id = c.teacher_id
    left join staff_member cover on cover.id = cs.teacher_id
    left join room r on r.id = c.room_id
    left join room sr on sr.id = cs.room_id
    left join location l on l.id = c.location_id
   where cs.starts_at >= p_from and cs.starts_at < p_to
  union all
  -- Drop-ins
  select cs.id::text, 'class', c.name, cs.starts_at, cs.ends_at,
         nullif(concat_ws(', ', coalesce(sr.name, r.name), l.name), ''),
         cs.status::text, k.id, k.first_name, c.id, cs.id, ds.name, ds.colour,
         coalesce(cover.display_name, tm.display_name), 'Drop-in', c.studio_id
    from kids k
    join drop_in_booking d on d.student_id = k.id and d.status = 'booked'
    join class_session cs on cs.id = d.session_id and cs.deleted_at is null
    join class c on c.id = cs.class_id
    left join dance_style ds on ds.id = c.dance_style_id
    left join staff_member tm on tm.id = c.teacher_id
    left join staff_member cover on cover.id = cs.teacher_id
    left join room r on r.id = c.room_id
    left join room sr on sr.id = cs.room_id
    left join location l on l.id = c.location_id
   where cs.starts_at >= p_from and cs.starts_at < p_to
  union all
  -- Shows, competitions, workshops, exam days and private lessons with a
  -- confirmed place
  select ev.id::text, ev.kind::text, ev.title, ev.starts_at, ev.ends_at,
         coalesce(ev.venue, l.name), ev.status::text, k.id, k.first_name, null::uuid, ev.id, null, null,
         tm.display_name, null, ev.studio_id
    from shows sh join kids k on k.id = sh.kid
    join studio_event ev on ev.id = sh.event_id and ev.deleted_at is null and ev.parent_event_id is null
         and ev.status in ('published', 'cancelled')
    left join location l on l.id = ev.location_id
    left join staff_member tm on tm.id = ev.teacher_id
   where ev.starts_at >= p_from and ev.starts_at < p_to
  union all
  -- Rehearsals for those shows
  select r.id::text, 'rehearsal', r.title, r.starts_at, r.ends_at,
         coalesce(r.venue, sh_ev.venue), r.status::text, k.id, k.first_name, null::uuid, r.id, null, null,
         null, sh_ev.title, r.studio_id
    from shows sh join kids k on k.id = sh.kid
    join studio_event sh_ev on sh_ev.id = sh.event_id and sh_ev.deleted_at is null
    join studio_event r on r.parent_event_id = sh_ev.id and r.deleted_at is null and r.status in ('published', 'cancelled')
   where r.starts_at >= p_from and r.starts_at < p_to
  union all
  -- Exams entered (a day, not a time: shown from 09:00 in the school's zone)
  select 'exam-' || en.id::text, 'exam', x.title || ' — ' || en.grade,
         (x.exam_on + time '09:00') at time zone st.timezone, (x.exam_on + time '17:00') at time zone st.timezone,
         x.venue, case en.status when 'withdrawn' then 'cancelled' else 'scheduled' end,
         k.id, k.first_name, null::uuid, x.id, null, null, null,
         nullif(concat_ws(' · ', x.board, case when en.result is not null then initcap(replace(en.result, '_', ' ')) end), ''),
         x.studio_id
    from kids k
    join exam_entry en on en.student_id = k.id and en.status <> 'withdrawn'
    join exam_session x on x.id = en.session_id and x.deleted_at is null
    join studio st on st.id = x.studio_id
   where (x.exam_on + time '09:00') at time zone st.timezone >= p_from
     and (x.exam_on + time '09:00') at time zone st.timezone < p_to;
$$;
revoke all on function app.diary_items(uuid, timestamptz, timestamptz) from public, authenticated, anon;

create or replace function app.my_diary(p_from timestamptz, p_to timestamptz)
  returns table (uid text, item_kind text, title text, starts_at timestamptz, ends_at timestamptz,
                 location text, status text, student_id uuid, child text, class_id uuid, ref_id uuid,
                 style text, colour text, teacher text, detail text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select d.uid, d.item_kind, d.title, d.starts_at, d.ends_at, d.location, d.status, d.student_id, d.child,
         d.class_id, d.ref_id, d.style, d.colour, d.teacher, d.detail
    from app.diary_items(auth.uid(), p_from, p_to) d
   where auth.uid() is not null and app.studio_writable(d.studio_id) and app.in_scope(d.studio_id)
   order by d.starts_at, d.child;
$$;
revoke all on function app.my_diary(timestamptz, timestamptz) from public;
grant execute on function app.my_diary(timestamptz, timestamptz) to authenticated;

-- The calendar feed: staff unchanged; families and students read the diary.
create or replace function app.calendar_feed(p_token text)
  returns table (uid text, title text, starts_at timestamptz, ends_at timestamptz, location text, status text, description text, calendar_name text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t calendar_token; sname text;
begin
  select * into t from calendar_token where token = p_token and revoked_at is null;
  if t.token is null then raise exception 'NOT_FOUND: that calendar link has been replaced or turned off' using errcode = 'no_data_found'; end if;
  update calendar_token set last_used_at = now() where token = p_token;
  select name into sname from studio where id = t.studio_id;
  if t.role = 'staff' then
    return query
    select cs.id::text || '@sanaa', c.name, cs.starts_at, cs.ends_at, coalesce(r.name || ', ', '') || coalesce(l.name, ''),
           case when cs.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
           case when cs.status = 'cancelled' then 'This class is cancelled.' else null end, sname
      from class_session cs join class c on c.id = cs.class_id
      join staff_member sm on sm.id = coalesce(cs.teacher_id, c.teacher_id)
      left join room r on r.id = coalesce(cs.room_id, c.room_id)
      left join location l on l.id = c.location_id
     where sm.user_id = t.user_id and c.studio_id = t.studio_id and cs.deleted_at is null
       and cs.starts_at between now() - interval '14 days' and now() + interval '120 days'
     order by cs.starts_at;
    return;
  end if;
  return query
  select d.uid || '@sanaa',
         case d.item_kind when 'class' then '' when 'rehearsal' then 'Rehearsal: ' when 'exam' then 'Exam: '
              when 'competition' then 'Competition: ' when 'show' then 'Show: ' when 'private_lesson' then ''
              else initcap(replace(d.item_kind, '_', ' ')) || ': ' end
           || d.title || coalesce(' — ' || string_agg(distinct d.child, ', '), ''),
         d.starts_at, d.ends_at, d.location,
         case when d.status = 'cancelled' then 'CANCELLED' else 'CONFIRMED' end,
         case when d.status = 'cancelled' then 'This is cancelled.' else max(d.detail) end, sname
    from app.diary_items(t.user_id, now() - interval '14 days', now() + interval '120 days') d
   where d.studio_id = t.studio_id
   group by d.uid, d.item_kind, d.title, d.starts_at, d.ends_at, d.location, d.status
   order by d.starts_at;
end $$;

-- ── Events (UR-50) ─────────────────────────────────────────────────────────
-- Places taken, counted past RLS: a parent otherwise counts only their own
-- children and never sees "full".
create or replace function app.event_places(p_event uuid) returns int
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select count(*)::int from event_participant p join studio_event e on e.id = p.event_id
   where p.event_id = p_event and p.status = 'confirmed' and p.deleted_at is null
     and e.studio_id in (select app.studio_ids());
$$;
revoke all on function app.event_places(uuid) from public;
grant execute on function app.event_places(uuid) to authenticated;

-- Notices about an event go to the families of everyone invited or going.
alter table communication add column event_id uuid references studio_event(id) on delete set null;
create index communication_event on communication (event_id) where event_id is not null;

create or replace function app.send_event_notice(p_event uuid, p_subject text, p_body text) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare ev studio_event; n int;
begin
  select * into ev from studio_event where id = p_event and deleted_at is null;
  if ev.id is null or not app.is_admin(ev.studio_id) then
    raise exception 'FORBIDDEN: only the office can send event notices' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'INVALID: write the notice first' using errcode = 'check_violation'; end if;
  insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by, event_id)
  select distinct ev.studio_id, 'direct'::comm_kind, 'in_app'::comm_channel, s.family_id,
         coalesce(nullif(btrim(p_subject), ''), ev.title), btrim(p_body), auth.uid(), ev.id
    from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
   where p.event_id = ev.id and p.deleted_at is null and p.status in ('invited', 'confirmed', 'requested');
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function app.send_event_notice(uuid, text, text) from public;
grant execute on function app.send_event_notice(uuid, text, text) to authenticated;

-- A helper rota: front of house, backstage, costumes, chaperones…
create table event_helper_slot (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  event_id    uuid not null references studio_event(id) on delete cascade,
  role        text not null check (length(btrim(role)) between 2 and 80),
  starts_at   timestamptz,
  ends_at     timestamptz,
  needed      smallint not null default 1 check (needed between 1 and 50),
  note        text check (note is null or length(note) <= 300),
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create table event_helper_signup (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references event_helper_slot(id) on delete cascade,
  user_id     uuid not null references user_account(id) on delete cascade,
  name        text not null,
  phone       text,
  created_at  timestamptz not null default now(),
  unique (slot_id, user_id)
);
alter table event_helper_slot enable row level security;   alter table event_helper_slot force row level security;
alter table event_helper_signup enable row level security; alter table event_helper_signup force row level security;
create policy helper_slot_read on event_helper_slot for select using (deleted_at is null and studio_id in (select app.studio_ids()));
create policy helper_slot_admin on event_helper_slot for all using (app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy helper_signup_read on event_helper_signup for select using (
  user_id = auth.uid() or exists (select 1 from event_helper_slot sl where sl.id = slot_id and app.is_staff(sl.studio_id)));
create policy helper_signup_admin on event_helper_signup for delete using (
  exists (select 1 from event_helper_slot sl where sl.id = slot_id and app.is_admin(sl.studio_id)));
grant select, insert, update, delete on event_helper_slot to authenticated;
grant select, delete on event_helper_signup to authenticated;
grant all on event_helper_slot, event_helper_signup to service_role;

-- Slot fill counts for anyone in the school; names only for staff.
create or replace function app.helper_slots(p_event uuid)
  returns table (id uuid, role text, starts_at timestamptz, ends_at timestamptz, needed int, note text,
                 filled int, mine boolean, helpers text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select sl.id, sl.role, sl.starts_at, sl.ends_at, sl.needed::int, sl.note,
         (select count(*)::int from event_helper_signup u where u.slot_id = sl.id),
         exists (select 1 from event_helper_signup u where u.slot_id = sl.id and u.user_id = auth.uid()),
         case when app.is_staff(sl.studio_id) then
           (select string_agg(u.name || coalesce(' (' || u.phone || ')', ''), ', ' order by u.created_at)
              from event_helper_signup u where u.slot_id = sl.id) end
    from event_helper_slot sl
   where sl.event_id = p_event and sl.deleted_at is null and sl.studio_id in (select app.studio_ids())
   order by sl.starts_at nulls first, sl.role;
$$;

-- A parent signs up (or drops out). Full slots refuse; one sign-up per person.
create or replace function app.volunteer(p_slot uuid, p_on boolean) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sl event_helper_slot; g guardian; taken int;
begin
  select * into sl from event_helper_slot where id = p_slot and deleted_at is null for update;
  if sl.id is null then raise exception 'NOT_FOUND: that helper slot' using errcode = 'no_data_found'; end if;
  select * into g from guardian where user_id = auth.uid() and studio_id = sl.studio_id and deleted_at is null
   order by is_primary desc limit 1;
  if g.id is null and not app.is_staff(sl.studio_id) then
    raise exception 'FORBIDDEN: only families and staff of the school can help' using errcode = 'insufficient_privilege';
  end if;
  if not p_on then
    delete from event_helper_signup where slot_id = sl.id and user_id = auth.uid();
  else
    select count(*) into taken from event_helper_signup where slot_id = sl.id;
    if not exists (select 1 from event_helper_signup where slot_id = sl.id and user_id = auth.uid()) then
      if taken >= sl.needed then raise exception 'INVALID: that slot is already filled — thank you for offering' using errcode = 'check_violation'; end if;
      insert into event_helper_signup (slot_id, user_id, name, phone)
      values (sl.id, auth.uid(), coalesce(g.full_name, (select full_name from user_account where id = auth.uid()), 'Helper'), g.phone);
    end if;
  end if;
  return (select count(*)::int from event_helper_signup where slot_id = sl.id);
end $$;
revoke all on function app.helper_slots(uuid), app.volunteer(uuid, boolean) from public;
grant execute on function app.helper_slots(uuid), app.volunteer(uuid, boolean) to authenticated;

-- ── Migration toolkit (UR-32) ──────────────────────────────────────────────
-- Day names as schools type them: Monday, mon, Mon., 1 (Monday) … 0/7 Sunday.
create or replace function app.parse_weekday(p text) returns smallint
  language sql immutable as $$
  select case
    when btrim(coalesce(p, '')) ~ '^[0-7]$' then (btrim(p)::int % 7)::smallint
    else (array_position(array['su','mo','tu','we','th','fr','sa'], left(lower(btrim(coalesce(p, ''))), 2)) - 1)::smallint end;
$$;

-- A timetable, one row per class. Keys (all text):
--   name*, style*, level, day*, time*, duration (minutes, default 60), location,
--   room, teacher, capacity*, age_min, age_max, price (pounds), pricing
--   (term | monthly | one_off | drop_in), term (name; default the newest open term)
-- Styles and rooms that do not exist yet are created (and listed as warnings);
-- a teacher not on the staff list is left unassigned with a warning. A class
-- with the same name, term, day and time is already here and is skipped.
create or replace function app.import_classes(p_rows jsonb, p_commit boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  v_day smallint; v_time time; v_dur int; v_cap int; v_amin int; v_amax int; v_price numeric;
  v_term uuid; v_style uuid; v_level uuid; v_loc uuid; v_room uuid; v_teacher uuid; v_pricing text;
  cid uuid; n_new int := 0; n_skip int := 0; n_sessions int := 0; made int;
  new_styles text[] := '{}'; new_rooms text[] := '{}'; no_teacher text[] := '{}';
begin
  select id into sid from studio where deleted_at is null and app.is_admin(id) and app.in_scope(id) limit 1;
  perform app.require_admin(sid);
  if p_commit and not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'INVALID: the file has no rows' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(p_rows) > 500 then
    raise exception 'INVALID: import at most 500 classes at a time' using errcode = 'check_violation';
  end if;

  for pass in 1..2 loop
    exit when pass = 2 and (not p_commit or jsonb_array_length(errs) > 0);
    i := 0;
    for r in select * from jsonb_array_elements(p_rows) loop
      i := i + 1;
      if pass = 1 then
        if coalesce(btrim(r ->> 'name'), '') = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No class name'); end if;
        if coalesce(btrim(r ->> 'style'), '') = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No dance style'); end if;
      end if;
      v_day := app.parse_weekday(r ->> 'day');
      if v_day is null and pass = 1 then
        errs := errs || jsonb_build_object('row', i, 'message', 'Cannot read the day "' || coalesce(r ->> 'day', '') || '" — use Monday, Tuesday…'); end if;
      begin v_time := nullif(btrim(r ->> 'time'), '')::time;
      exception when others then v_time := null; end;
      if v_time is null and pass = 1 then
        errs := errs || jsonb_build_object('row', i, 'message', 'Cannot read the time "' || coalesce(r ->> 'time', '') || '" — use 17:30'); end if;
      begin
        v_dur := coalesce(nullif(btrim(r ->> 'duration'), '')::int, 60);
        v_cap := nullif(btrim(r ->> 'capacity'), '')::int;
        v_amin := nullif(btrim(r ->> 'age_min'), '')::int;
        v_amax := nullif(btrim(r ->> 'age_max'), '')::int;
        v_price := coalesce(nullif(regexp_replace(coalesce(r ->> 'price', ''), '[£,\s]', '', 'g'), '')::numeric, 0);
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Duration, places, ages and price must be numbers'); end if;
        continue;
      end;
      if pass = 1 then
        if v_dur not between 15 and 300 then errs := errs || jsonb_build_object('row', i, 'message', 'Duration must be 15 to 300 minutes'); end if;
        if v_cap is null or v_cap < 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Places must be 1 or more'); end if;
        if v_amin is not null and v_amax is not null and v_amax < v_amin then errs := errs || jsonb_build_object('row', i, 'message', 'The oldest age is below the youngest'); end if;
        if v_price < 0 then errs := errs || jsonb_build_object('row', i, 'message', 'Price cannot be negative'); end if;
      end if;
      v_pricing := coalesce(nullif(lower(replace(btrim(r ->> 'pricing'), ' ', '_')), ''), 'term');
      if v_pricing in ('per_term', 'termly') then v_pricing := 'term'; elsif v_pricing in ('per_month', 'month') then v_pricing := 'monthly';
      elsif v_pricing in ('drop-in', 'per_class', 'payg') then v_pricing := 'drop_in'; elsif v_pricing in ('course', 'one-off') then v_pricing := 'one_off'; end if;
      if v_pricing not in ('term', 'monthly', 'one_off', 'drop_in') and pass = 1 then
        errs := errs || jsonb_build_object('row', i, 'message', 'Pricing "' || (r ->> 'pricing') || '" — use term, monthly, one-off or drop-in'); end if;

      v_term := null;
      if nullif(btrim(r ->> 'term'), '') is not null then
        select id into v_term from term where studio_id = sid and deleted_at is null and lower(name) = lower(btrim(r ->> 'term'))
         order by starts_on desc limit 1;
        if v_term is null and pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'No term called "' || (r ->> 'term') || '"'); end if;
      else
        select id into v_term from term where studio_id = sid and deleted_at is null and status <> 'archived' order by starts_on desc limit 1;
        if v_term is null and pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Add a term first, so the classes have dates'); end if;
      end if;

      v_loc := null;
      if nullif(btrim(r ->> 'location'), '') is not null then
        select id into v_loc from location where studio_id = sid and deleted_at is null and lower(name) = lower(btrim(r ->> 'location')) limit 1;
        if v_loc is null and pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'No location called "' || (r ->> 'location') || '" — add it in Studio first'); end if;
      else
        select id into v_loc from location where studio_id = sid and deleted_at is null order by created_at limit 1;
        if v_loc is null and pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Add a location first'); end if;
      end if;

      select id into v_style from dance_style where studio_id = sid and deleted_at is null and lower(name) = lower(btrim(r ->> 'style')) limit 1;
      if v_style is null and nullif(btrim(r ->> 'style'), '') is not null and not (initcap(btrim(r ->> 'style')) = any(new_styles)) then
        new_styles := new_styles || initcap(btrim(r ->> 'style'));
      end if;
      select id into v_level from level where studio_id = sid and deleted_at is null and lower(name) = lower(btrim(r ->> 'level')) limit 1;
      v_room := null;
      if nullif(btrim(r ->> 'room'), '') is not null and v_loc is not null then
        select id into v_room from room where location_id = v_loc and deleted_at is null and lower(name) = lower(btrim(r ->> 'room')) limit 1;
        if v_room is null and not (btrim(r ->> 'room') = any(new_rooms)) then new_rooms := new_rooms || btrim(r ->> 'room'); end if;
      end if;
      v_teacher := null;
      if nullif(btrim(r ->> 'teacher'), '') is not null then
        select id into v_teacher from staff_member where studio_id = sid and deleted_at is null and lower(display_name) = lower(btrim(r ->> 'teacher')) limit 1;
        if v_teacher is null and not (btrim(r ->> 'teacher') = any(no_teacher)) then no_teacher := no_teacher || btrim(r ->> 'teacher'); end if;
      end if;

      if pass = 2 then
        if exists (select 1 from class where studio_id = sid and deleted_at is null and term_id = v_term
                     and lower(name) = lower(btrim(r ->> 'name')) and day_of_week = v_day and start_time = v_time) then
          n_skip := n_skip + 1; continue;
        end if;
        if v_style is null then
          insert into dance_style (studio_id, name) values (sid, initcap(btrim(r ->> 'style'))) returning id into v_style;
        end if;
        if v_room is null and nullif(btrim(r ->> 'room'), '') is not null then
          insert into room (studio_id, location_id, name) values (sid, v_loc, btrim(r ->> 'room')) returning id into v_room;
        end if;
        insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id, teacher_id, name,
                           day_of_week, start_time, duration_min, capacity, age_min, age_max, price_minor, pricing, created_by)
        values (sid, v_term, v_style, v_level, v_loc, v_room, v_teacher, btrim(r ->> 'name'), v_day, v_time, v_dur, v_cap,
                v_amin, v_amax, round(v_price * 100)::int, v_pricing::pricing_model, auth.uid())
        returning id into cid;
        made := app.generate_class_sessions(cid);
        n_new := n_new + 1; n_sessions := n_sessions + coalesce(made, 0);
      end if;
    end loop;
  end loop;

  if array_length(new_styles, 1) > 0 then warns := warns || jsonb_build_object('message', 'New dance styles will be added: ' || array_to_string(new_styles, ', ')); end if;
  if array_length(new_rooms, 1) > 0 then warns := warns || jsonb_build_object('message', 'New rooms will be added: ' || array_to_string(new_rooms, ', ')); end if;
  if array_length(no_teacher, 1) > 0 then warns := warns || jsonb_build_object('message', 'Not on your staff list, so left without a teacher: ' || array_to_string(no_teacher, ', ')); end if;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs) using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns);
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'class', null, format('Imported %s classes with %s sessions; %s already here', n_new, n_sessions, n_skip));
  return jsonb_build_object('ok', true, 'rows', i, 'classes', n_new, 'sessions', n_sessions, 'skipped', n_skip,
                            'errors', '[]'::jsonb, 'warnings', warns);
end $$;

-- Opening balances. One per family, ever: re-running a file skips families
-- that already have one.
create table opening_balance (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  family_id   uuid not null unique references family(id) on delete cascade,
  as_at       date not null,
  owed_minor  bigint not null default 0 check (owed_minor >= 0),
  credit_minor bigint not null default 0 check (credit_minor >= 0),
  invoice_id  uuid references invoice(id) on delete set null,
  payment_id  uuid references payment(id) on delete set null,
  term_id     uuid references term(id) on delete set null,
  imported_by uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table opening_balance enable row level security; alter table opening_balance force row level security;
create policy opening_balance_read on opening_balance for select using (app.is_admin(studio_id));
grant select on opening_balance to authenticated;
grant all on opening_balance to service_role;

-- Keys (all text): parent_email or family (one of them*), balance (pounds owed;
-- a negative figure is credit), credit (pounds held, optional).
-- p_term: when the old system had already billed that term, the term whose
-- fees are covered — each child's classes that term get a £0 line on the
-- opening-balance invoice, which is what a billing run looks for when it
-- decides who has already been billed. Leave it null otherwise.
create or replace function app.import_opening_balances(p_rows jsonb, p_as_at date, p_commit boolean default false, p_term uuid default null)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid; r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  fam uuid; owed numeric; cred numeric; seen uuid[] := '{}'; inv uuid; pay uuid; items jsonb;
  n_inv int := 0; n_cred int := 0; n_skip int := 0; total_owed bigint := 0; total_cred bigint := 0; lbl text;
begin
  select id into sid from studio where deleted_at is null and app.is_admin(id) and app.in_scope(id) limit 1;
  perform app.require_admin(sid);
  if p_commit and not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  if p_as_at is null or p_as_at > current_date then
    raise exception 'INVALID: give the date the balances are "as at" — today or earlier' using errcode = 'check_violation';
  end if;
  if p_term is not null and not exists (select 1 from term where id = p_term and studio_id = sid and deleted_at is null) then
    raise exception 'INVALID: that term is not this school''s' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'INVALID: the file has no rows' using errcode = 'check_violation';
  end if;
  lbl := 'Opening balance as at ' || to_char(p_as_at, 'FMDD Mon YYYY');

  for pass in 1..2 loop
    exit when pass = 2 and (not p_commit or jsonb_array_length(errs) > 0);
    i := 0; seen := '{}';
    for r in select * from jsonb_array_elements(p_rows) loop
      i := i + 1;
      fam := null;
      if nullif(btrim(r ->> 'parent_email'), '') is not null then
        select g.family_id into fam from guardian g join family f on f.id = g.family_id and f.deleted_at is null
         where g.studio_id = sid and g.deleted_at is null and lower(g.email) = lower(btrim(r ->> 'parent_email')) limit 1;
      end if;
      if fam is null and nullif(btrim(r ->> 'family'), '') is not null then
        select id into fam from family where studio_id = sid and deleted_at is null
           and (lower(name) = lower(btrim(r ->> 'family')) or lower(name) = lower(btrim(r ->> 'family')) || ' family');
      end if;
      begin
        owed := coalesce(nullif(regexp_replace(coalesce(r ->> 'balance', ''), '[£,\s]', '', 'g'), '')::numeric, 0);
        cred := coalesce(nullif(regexp_replace(coalesce(r ->> 'credit', ''), '[£,\s]', '', 'g'), '')::numeric, 0);
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Balance and credit must be amounts, like 45.00'); end if;
        continue;
      end;
      if owed < 0 then cred := cred - owed; owed := 0; end if;
      if pass = 1 then
        if fam is null then
          errs := errs || jsonb_build_object('row', i, 'message', 'No family with ' ||
            coalesce('the email "' || nullif(btrim(r ->> 'parent_email'), '') || '"', 'the name "' || coalesce(r ->> 'family', '') || '"') || ' — import families first');
        elsif fam = any(seen) then
          errs := errs || jsonb_build_object('row', i, 'message', 'This family is in the file twice');
        end if;
        if cred < 0 then errs := errs || jsonb_build_object('row', i, 'message', 'Credit cannot be negative'); end if;
        if fam is not null and exists (select 1 from opening_balance where family_id = fam) then
          warns := warns || jsonb_build_object('message', 'Row ' || i || ': this family already has an opening balance and will be left alone');
        end if;
        seen := seen || fam;
        continue;
      end if;

      -- pass 2: write
      if exists (select 1 from opening_balance where family_id = fam) then n_skip := n_skip + 1; continue; end if;
      inv := null; pay := null;
      if owed > 0 or p_term is not null then
        items := jsonb_build_array(jsonb_build_object('kind', 'other', 'description', lbl || ' (brought forward from your previous system)',
                                                      'unit_minor', round(owed * 100)::int));
        if p_term is not null then
          items := items || coalesce((select jsonb_agg(jsonb_build_object('kind', 'tuition', 'student_id', s.id, 'class_id', c.id, 'unit_minor', 0,
                      'description', c.name || ' — ' || t.name || ' fees, billed in your previous system (' || s.first_name || ')'))
                     from enrolment e join class c on c.id = e.class_id and c.term_id = p_term and c.deleted_at is null
                     join term t on t.id = c.term_id
                     join student s on s.id = e.student_id and s.family_id = fam and s.deleted_at is null
                    where e.status = 'active' and e.deleted_at is null), '[]'::jsonb);
        end if;
        if owed > 0 or jsonb_array_length(items) > 1 then
          inv := app.create_invoice_internal(fam, items, greatest(current_date, p_as_at + 14), lbl, 0, true, p_term);
          update invoice set issued_on = p_as_at where id = inv;
          update invoice_item set period_start = date_trunc('month', p_as_at)::date
           where invoice_id = inv and class_id is not null
             and (select pricing from class where id = invoice_item.class_id) = 'monthly';
          n_inv := n_inv + 1; total_owed := total_owed + round(owed * 100)::bigint;
        end if;
      end if;
      if cred > 0 then
        insert into payment (studio_id, family_id, amount_minor, method, succeeded_at, note, recorded_by)
        values (sid, fam, round(cred * 100)::bigint, 'credit', p_as_at::timestamptz, 'Opening credit as at ' || to_char(p_as_at, 'FMDD Mon YYYY') || ' (brought forward)', auth.uid())
        returning id into pay;
        perform app.allocate_account_credit_internal(fam);
        n_cred := n_cred + 1; total_cred := total_cred + round(cred * 100)::bigint;
      end if;
      perform app.recalc_family_balance(fam);
      insert into opening_balance (studio_id, family_id, as_at, owed_minor, credit_minor, invoice_id, payment_id, term_id, imported_by)
      values (sid, fam, p_as_at, round(owed * 100)::bigint, round(cred * 100)::bigint, inv, pay, p_term, auth.uid());
    end loop;
  end loop;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs) using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns);
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'invoice', null,
          format('%s: %s families owe £%s, %s hold £%s credit; %s already had one', lbl, n_inv, to_char(total_owed / 100.0, 'FM999999990.00'),
                 n_cred, to_char(total_cred / 100.0, 'FM999999990.00'), n_skip));
  return jsonb_build_object('ok', true, 'rows', i, 'invoices', n_inv, 'credits', n_cred, 'skipped', n_skip,
                            'owed_minor', total_owed, 'credit_minor', total_cred, 'errors', '[]'::jsonb, 'warnings', warns);
end $$;

revoke all on function app.import_classes(jsonb, boolean), app.import_opening_balances(jsonb, date, boolean, uuid), app.parse_weekday(text) from public;
grant execute on function app.import_classes(jsonb, boolean), app.import_opening_balances(jsonb, date, boolean, uuid), app.parse_weekday(text) to authenticated;
