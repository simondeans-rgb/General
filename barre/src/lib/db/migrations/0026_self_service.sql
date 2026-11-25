-- ============================================================================
-- 0026 · Enquiries and parent self-service (R-014)
-- ----------------------------------------------------------------------------
-- Parents can now ask for things without a phone call:
--   · a place in a class for a child          → the office approves in one tap
--   · a new child on the account              → the office approves in one tap
--   · a trial for a child already on the books → booked at once, unless the
--                                               class says trials need approval
--   · a waiting-list spot for a full class    → added at once
-- Prospects can book a trial from the school's public page.
--
-- Every parent action is a security-definer function that checks the child is
-- theirs; parents still cannot write enrolment, student or trial rows directly.
-- Approvals reuse studio_request, so they arrive in Requests with a
-- notification exactly like any other request.
-- ============================================================================

alter table studio_request add column action text check (action in ('join_class', 'add_child', 'trial'));
alter table studio_request add column class_id uuid references class(id) on delete set null;
alter table studio_request add column payload jsonb;

-- A class the parent may ask about: live, in a term that has not ended, and
-- not private unless the child is already in it.
create or replace function app.class_open_to_family(p_class uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from class c join term t on t.id = c.term_id
                  where c.id = p_class and c.deleted_at is null and t.deleted_at is null
                    and t.ends_on >= current_date and c.visibility <> 'private');
$$;

create or replace function app.my_child(p_student uuid) returns student
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare s student;
begin
  select * into s from student where id = p_student and deleted_at is null
     and id in (select app.guardian_student_ids());
  if s.id is null then
    raise exception 'FORBIDDEN: that is not your child' using errcode = 'insufficient_privilege';
  end if;
  return s;
end $$;

-- ── A place in a class ─────────────────────────────────────────────────────
create or replace function app.request_class_place(p_student uuid, p_class uuid, p_note text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; c class; rid uuid;
begin
  s := app.my_child(p_student);
  select * into c from class where id = p_class and studio_id = s.studio_id;
  if c.id is null or not app.class_open_to_family(p_class) then
    raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found';
  end if;
  if exists (select 1 from enrolment where student_id = s.id and class_id = c.id and status = 'active' and deleted_at is null) then
    raise exception 'INVALID: % is already in %', s.first_name, c.name using errcode = 'check_violation';
  end if;
  if exists (select 1 from studio_request where student_id = s.id and class_id = c.id and action = 'join_class'
              and status in ('open', 'in_progress') and deleted_at is null) then
    raise exception 'INVALID: you have already asked for this — the office will be in touch' using errcode = 'check_violation';
  end if;
  insert into studio_request (studio_id, family_id, student_id, class_id, kind, action, subject, body, raised_by)
  values (s.studio_id, s.family_id, s.id, c.id, 'other', 'join_class',
          'Place for ' || s.first_name || ' in ' || c.name,
          coalesce(nullif(btrim(p_note), ''), 'Please could ' || s.first_name || ' join ' || c.name || '?'), auth.uid())
  returning id into rid;
  return rid;
end $$;

-- The office says yes: a place if there is one, otherwise the waiting list.
create or replace function app.approve_class_request(p_request uuid, p_message text default null)
  returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r studio_request; c class; outcome text; msg text;
begin
  select * into r from studio_request where id = p_request and action = 'join_class'
     and status in ('open', 'in_progress') and deleted_at is null;
  if r.id is null then raise exception 'INVALID: that request is not waiting' using errcode = 'check_violation'; end if;
  perform app.require_admin(r.studio_id);
  select * into c from class where id = r.class_id;
  if app.class_enrolled_count(c.id) < c.capacity then
    insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
    values (r.studio_id, c.id, r.student_id, 'active', greatest(current_date, (select starts_on from term where id = c.term_id)),
            'Requested by the family', auth.uid());
    outcome := 'enrolled';
    msg := coalesce(nullif(btrim(p_message), ''), 'Good news — there is a place in ' || c.name || '. See you in class!');
  elsif c.waitlist_enabled then
    insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
    values (r.studio_id, c.id, r.student_id, 'waiting', 0, 'Requested by the family');
    outcome := 'waitlisted';
    msg := coalesce(nullif(btrim(p_message), ''), c.name || ' is full just now, so we have put your child on the waiting list. We will be in touch as soon as a place comes up.');
  else
    raise exception 'INVALID: % is full and has no waiting list — reply to the family instead', c.name
      using errcode = 'check_violation';
  end if;
  update studio_request set status = 'answered', answer = msg, answered_by = auth.uid(), answered_at = now()
   where id = r.id;
  return outcome;
end $$;

-- ── A new child on the account ─────────────────────────────────────────────
-- p_child: {first_name, last_name, date_of_birth, emergency_name?, emergency_phone?, notes?}
create or replace function app.request_new_child(p_child jsonb) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g guardian; rid uuid;
begin
  select * into g from guardian where user_id = auth.uid() and deleted_at is null limit 1;
  if g.id is null then raise exception 'FORBIDDEN: only a parent can add a child' using errcode = 'insufficient_privilege'; end if;
  if coalesce(btrim(p_child ->> 'first_name'), '') = '' or (p_child ->> 'date_of_birth') is null then
    raise exception 'INVALID: a name and date of birth are needed' using errcode = 'check_violation';
  end if;
  if (p_child ->> 'date_of_birth')::date > current_date or (p_child ->> 'date_of_birth')::date < current_date - interval '100 years' then
    raise exception 'INVALID: that date of birth does not look right' using errcode = 'check_violation';
  end if;
  insert into studio_request (studio_id, family_id, kind, action, subject, body, payload, raised_by)
  values (g.studio_id, g.family_id, 'other', 'add_child',
          'New child: ' || btrim(p_child ->> 'first_name') || ' ' || coalesce(btrim(p_child ->> 'last_name'), ''),
          g.full_name || ' would like to add ' || btrim(p_child ->> 'first_name') || ', born '
            || to_char((p_child ->> 'date_of_birth')::date, 'FMDD Month YYYY') || '.'
            || coalesce(E'\n\n' || nullif(btrim(p_child ->> 'notes'), ''), ''),
          p_child, auth.uid())
  returning id into rid;
  return rid;
end $$;

create or replace function app.approve_new_child(p_request uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r studio_request; p jsonb; kid uuid; g guardian;
begin
  select * into r from studio_request where id = p_request and action = 'add_child'
     and status in ('open', 'in_progress') and deleted_at is null;
  if r.id is null then raise exception 'INVALID: that request is not waiting' using errcode = 'check_violation'; end if;
  perform app.require_admin(r.studio_id);
  p := r.payload;
  insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
  values (r.studio_id, r.family_id, btrim(p ->> 'first_name'),
          coalesce(nullif(btrim(p ->> 'last_name'), ''), (select split_part(name, ' ', 1) from family where id = r.family_id)),
          (p ->> 'date_of_birth')::date, auth.uid())
  returning id into kid;
  -- Someone to ring from day one: the named contact, else the parent who asked.
  select * into g from guardian where family_id = r.family_id and deleted_at is null
   order by (user_id = r.raised_by) desc nulls last, is_primary desc limit 1;
  if coalesce(nullif(btrim(p ->> 'emergency_phone'), ''), g.phone) is not null then
    insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
    values (r.studio_id, kid, coalesce(nullif(btrim(p ->> 'emergency_name'), ''), g.full_name),
            case when nullif(btrim(p ->> 'emergency_name'), '') is null then 'Parent/carer' end,
            coalesce(nullif(btrim(p ->> 'emergency_phone'), ''), g.phone), 1);
  end if;
  update studio_request set status = 'answered', student_id = kid, answered_by = auth.uid(), answered_at = now(),
         answer = btrim(p ->> 'first_name') || ' is on your account now. You can book a trial or ask for a class place from their card.'
   where id = r.id;
  return kid;
end $$;

-- ── A trial for a child already on the books ───────────────────────────────
create or replace function app.parent_book_trial(p_session uuid, p_student uuid) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; cs record;
begin
  s := app.my_child(p_student);
  select x.*, c.name cname, c.trials_enabled, c.trial_needs_approval, c.trial_price_minor, c.capacity
    into cs from class_session x join class c on c.id = x.class_id
   where x.id = p_session and x.deleted_at is null and c.studio_id = s.studio_id;
  if cs.id is null or not app.class_open_to_family(cs.class_id) then
    raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found';
  end if;
  if not cs.trials_enabled then raise exception 'INVALID: % is not taking trials just now', cs.cname using errcode = 'check_violation'; end if;
  if cs.status <> 'scheduled' or cs.starts_at < now() then
    raise exception 'INVALID: that session is not open for booking' using errcode = 'check_violation';
  end if;
  if exists (select 1 from enrolment where student_id = s.id and class_id = cs.class_id and status = 'active' and deleted_at is null) then
    raise exception 'INVALID: % is already in %', s.first_name, cs.cname using errcode = 'check_violation';
  end if;
  if exists (select 1 from trial where student_id = s.id and class_id = cs.class_id and status in ('booked', 'requested') and deleted_at is null) then
    raise exception 'INVALID: % already has a trial booked in %', s.first_name, cs.cname using errcode = 'check_violation';
  end if;
  if not exists (select 1 from emergency_contact where student_id = s.id and deleted_at is null) then
    raise exception 'INVALID: add an emergency contact for % first — it is on their card', s.first_name using errcode = 'check_violation';
  end if;
  if app.class_enrolled_count(cs.class_id)
     + (select count(*) from trial where session_id = cs.id and status = 'booked' and deleted_at is null) >= cs.capacity then
    raise exception 'INVALID: that session is full — try another date' using errcode = 'check_violation';
  end if;
  if cs.trial_needs_approval then
    insert into studio_request (studio_id, family_id, student_id, class_id, kind, action, subject, body, payload, raised_by)
    values (s.studio_id, s.family_id, s.id, cs.class_id, 'other', 'trial',
            'Trial for ' || s.first_name || ' in ' || cs.cname,
            'Asked for ' || to_char(cs.starts_at at time zone (select timezone from studio where id = s.studio_id), 'FMDay DD Month, HH24:MI'),
            jsonb_build_object('session_id', cs.id), auth.uid());
    return 'requested';
  end if;
  insert into trial (studio_id, class_id, session_id, student_id, status, price_minor, created_by)
  values (s.studio_id, cs.class_id, cs.id, s.id, 'booked', cs.trial_price_minor, auth.uid());
  return 'booked';
end $$;

create or replace function app.approve_trial_request(p_request uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare r studio_request; tid uuid;
begin
  select * into r from studio_request where id = p_request and action = 'trial'
     and status in ('open', 'in_progress') and deleted_at is null;
  if r.id is null then raise exception 'INVALID: that request is not waiting' using errcode = 'check_violation'; end if;
  perform app.require_admin(r.studio_id);
  tid := app.book_trial((r.payload ->> 'session_id')::uuid, r.student_id, null);
  update studio_request set status = 'answered', answered_by = auth.uid(), answered_at = now(),
         answer = 'The trial is booked — see you there.' where id = r.id;
  return tid;
end $$;

-- ── The waiting list for a full class ──────────────────────────────────────
create or replace function app.parent_join_waitlist(p_class uuid, p_student uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; c class; pos int;
begin
  s := app.my_child(p_student);
  select * into c from class where id = p_class and studio_id = s.studio_id;
  if c.id is null or not app.class_open_to_family(p_class) then
    raise exception 'NOT_FOUND: that class' using errcode = 'no_data_found';
  end if;
  if not c.waitlist_enabled then raise exception 'INVALID: % does not keep a waiting list', c.name using errcode = 'check_violation'; end if;
  if app.class_enrolled_count(c.id) < c.capacity then
    raise exception 'INVALID: % has a place — ask for it instead', c.name using errcode = 'check_violation';
  end if;
  if exists (select 1 from waitlist_entry where class_id = c.id and student_id = s.id and status in ('waiting', 'offered') and deleted_at is null) then
    raise exception 'INVALID: % is already on the list', s.first_name using errcode = 'check_violation';
  end if;
  insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
  values (s.studio_id, c.id, s.id, 'waiting', 0, 'Joined by the family')
  returning position into pos;
  return pos;
end $$;

-- ── The school's public page ───────────────────────────────────────────────
-- What a prospect sees: the school, and upcoming sessions with room for a
-- trial. No names, no numbers beyond "places left".
create or replace function app.public_trial_sessions(p_slug text)
  returns table (studio_name text, session_id uuid, class_name text, style text, starts_at timestamptz,
                 ends_at timestamptz, age_min smallint, age_max smallint, location text,
                 trial_price_minor int, places_left int)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select st.name, cs.id, c.name, ds.name, cs.starts_at, cs.ends_at, c.age_min, c.age_max, l.name,
         c.trial_price_minor,
         (c.capacity - app.class_enrolled_count(c.id)
            - (select count(*) from trial t where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null))::int
    from studio st
    join class c on c.studio_id = st.id and c.deleted_at is null and c.visibility = 'public' and c.trials_enabled
    join class_session cs on cs.class_id = c.id and cs.deleted_at is null and cs.status = 'scheduled'
         and cs.starts_at between now() + interval '12 hours' and now() + interval '21 days'
    left join dance_style ds on ds.id = c.dance_style_id
    left join location l on l.id = c.location_id
   where st.slug = lower(p_slug) and st.deleted_at is null and app.studio_writable(st.id)
     and c.capacity - app.class_enrolled_count(c.id)
         - (select count(*) from trial t where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) > 0
   order by cs.starts_at;
$$;

-- A prospect books. Creates the enquiry (source 'website') and the trial; the
-- child gets a record and an emergency contact so they are on the register.
-- p_form: {contact_name, contact_email, contact_phone, child_name, child_dob, website?}
-- `website` is a honeypot: people never fill it in, form-filling bots do.
create or replace function app.public_book_trial(p_slug text, p_session uuid, p_form jsonb) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; cs record; enq uuid; tid uuid; dob date;
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
  insert into enquiry (studio_id, stage, contact_name, contact_email, contact_phone, child_name, child_dob,
                       interest_class_id, source)
  values (st.id, 'trial_booked', btrim(p_form ->> 'contact_name'), lower(btrim(p_form ->> 'contact_email')),
          btrim(p_form ->> 'contact_phone'), btrim(p_form ->> 'child_name'), dob, cs.class_id, 'website')
  returning id into enq;
  insert into trial (studio_id, class_id, session_id, enquiry_id, status, price_minor)
  values (st.id, cs.class_id, cs.id, enq, 'booked', cs.trial_price_minor)
  returning id into tid;
  perform app.ensure_trial_student(tid);
  return 'ok';
end $$;

revoke all on function app.class_open_to_family(uuid), app.my_child(uuid), app.request_class_place(uuid, uuid, text),
  app.approve_class_request(uuid, text), app.request_new_child(jsonb), app.approve_new_child(uuid),
  app.parent_book_trial(uuid, uuid), app.approve_trial_request(uuid), app.parent_join_waitlist(uuid, uuid),
  app.public_trial_sessions(text), app.public_book_trial(text, uuid, jsonb) from public;
grant execute on function app.request_class_place(uuid, uuid, text), app.approve_class_request(uuid, text),
  app.request_new_child(jsonb), app.approve_new_child(uuid), app.parent_book_trial(uuid, uuid),
  app.approve_trial_request(uuid), app.parent_join_waitlist(uuid, uuid) to authenticated;
grant execute on function app.public_trial_sessions(text), app.public_book_trial(text, uuid, jsonb) to authenticated, anon;
grant execute on function app.class_open_to_family(uuid) to authenticated;

-- What a parent can do for one child, class by class: already in it, a place
-- to ask for, a waiting list to join, and the next sessions open for a trial.
create or replace function app.class_options_for_child(p_student uuid)
  returns table (class_id uuid, name text, style text, day_of_week smallint, start_time time,
                 age_min smallint, age_max smallint, price_minor int, pricing text, trial_price_minor int,
                 prerequisites text, enrolled boolean, waiting boolean, asked boolean, trial_booked boolean,
                 full boolean, waitlist_enabled boolean, trials_enabled boolean, age_fits boolean, trial_sessions jsonb)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare s student; age int;
begin
  s := app.my_child(p_student);
  age := extract(year from age(current_date, s.date_of_birth));
  return query
  select c.id, c.name, ds.name, c.day_of_week, c.start_time, c.age_min, c.age_max, c.price_minor, c.pricing::text,
         c.trial_price_minor, c.prerequisites,
         exists (select 1 from enrolment e where e.class_id = c.id and e.student_id = s.id and e.status = 'active' and e.deleted_at is null),
         exists (select 1 from waitlist_entry w where w.class_id = c.id and w.student_id = s.id and w.status in ('waiting', 'offered') and w.deleted_at is null),
         exists (select 1 from studio_request r where r.class_id = c.id and r.student_id = s.id and r.status in ('open', 'in_progress') and r.deleted_at is null),
         exists (select 1 from trial t where t.class_id = c.id and t.student_id = s.id and t.status in ('booked', 'requested') and t.deleted_at is null),
         app.class_enrolled_count(c.id) >= c.capacity, c.waitlist_enabled, c.trials_enabled,
         (c.age_min is null or age >= c.age_min) and (c.age_max is null or age <= c.age_max),
         coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'starts_at', x.starts_at) order by x.starts_at)
                     from (select cs.id, cs.starts_at from class_session cs
                            where cs.class_id = c.id and cs.deleted_at is null and cs.status = 'scheduled'
                              and cs.starts_at > now() + interval '12 hours'
                              and app.class_enrolled_count(c.id) + (select count(*) from trial t where t.session_id = cs.id
                                    and t.status = 'booked' and t.deleted_at is null) < c.capacity
                            order by cs.starts_at limit 3) x), '[]'::jsonb)
    from class c left join dance_style ds on ds.id = c.dance_style_id
   where c.studio_id = s.studio_id and app.class_open_to_family(c.id)
   order by (c.age_min is null or age >= c.age_min) and (c.age_max is null or age <= c.age_max) desc,
            c.day_of_week, c.start_time;
end $$;
revoke all on function app.class_options_for_child(uuid) from public;
grant execute on function app.class_options_for_child(uuid) to authenticated;

-- When the office answers a family's request, the family hears about it.
-- (Medical updates notify from their own function, so they are left out.)
create or replace function app.on_request_answered() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.status in ('answered', 'closed') and old.status in ('open', 'in_progress')
     and new.family_id is not null and new.kind <> 'medical_update' and new.answer is not null then
    perform app.notify_family(new.family_id, 'request_answered', 'The studio replied: ' || new.subject,
                              left(new.answer, 120), '/family/enquiries');
  end if;
  return null;
end $$;
create trigger request_answered after update of status on studio_request
  for each row execute function app.on_request_answered();

-- The school's name and look, for its public page. Nothing else.
create or replace function app.public_school(p_slug text)
  returns table (name text, brand_colour text, logo_url text, open boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, s.brand_colour, s.logo_url, app.studio_writable(s.id)
    from studio s where s.slug = lower(p_slug) and s.deleted_at is null;
$$;
revoke all on function app.public_school(text) from public;
grant execute on function app.public_school(text) to authenticated, anon;
