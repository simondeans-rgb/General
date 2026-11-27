-- ============================================================================
-- 0044 · Office fixes from the end-user panel review
-- ----------------------------------------------------------------------------
--   UR-18  enquiry → trial → enrolment stay linked
--   UR-19  waiting-list offers never promise more places than exist
--   UR-35  a readable history of changes, and of who opened health records
--   UR-39  a plan limit becomes a request to upgrade, not an error
--   UR-53  onboarding knows whether a school holds sample data (UR-11)
--   UR-54  trial outcomes wait for the trial (D9)
--   UR-57  duplicate families found, merged with a full trail, and undone
-- ============================================================================

-- ── Settings ───────────────────────────────────────────────────────────────
-- How long a family has to answer a waiting-list offer before it passes on.
alter table studio add column waitlist_offer_days integer not null default 3
  check (waitlist_offer_days between 1 and 30);
-- True only for a school created with the demo's sample records.
alter table studio add column sample_data boolean not null default false;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-19 · Waiting-list offers respect capacity
-- ════════════════════════════════════════════════════════════════════════════
-- A place is free when nobody holds it: not an active enrolment, and not an
-- offer still waiting for an answer. Lapsed offers no longer hold a place even
-- before the automation run marks them expired.
create or replace function app.class_live_offers(p_class uuid, p_except uuid default null) returns integer
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select count(*)::int from waitlist_entry
   where class_id = p_class and status = 'offered' and deleted_at is null
     and (offer_expires_at is null or offer_expires_at > now())
     and (p_except is null or id <> p_except)
$$;

create or replace function app.class_free_places(p_class uuid) returns integer
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce((select capacity from class where id = p_class), 0)
         - app.class_enrolled_count(p_class) - app.class_live_offers(p_class)
$$;

-- Offering: only into a free place, for the school's chosen number of days.
create or replace function app.offer_waitlist_place(p_id uuid, p_days integer default null)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare w record; days integer; out_now integer;
begin
  select * into w from waitlist_entry
   where id = p_id and status = 'waiting' and deleted_at is null;
  if w.id is null then return false; end if;
  if auth.uid() is not null and not app.is_admin(w.studio_id) then
    raise exception 'FORBIDDEN: only the office may offer a place' using errcode = 'insufficient_privilege';
  end if;
  if app.class_free_places(w.class_id) <= 0 then
    out_now := app.class_live_offers(w.class_id);
    raise exception 'NO_FREE_PLACE: There is no free place to offer%.',
      case when out_now = 1 then ' — 1 offer is already out'
           when out_now > 1 then format(' — %s offers are already out', out_now)
           else ': the class is full' end
      using errcode = 'check_violation';
  end if;
  days := greatest(1, coalesce(p_days, (select waitlist_offer_days from studio where id = w.studio_id), 3));

  update waitlist_entry
     set status = 'offered', offered_at = now(),
         offer_expires_at = now() + make_interval(days => days), updated_at = now()
   where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (w.studio_id, auth.uid(), 'offer', 'waitlist_entry', p_id,
          format('place offered, expires in %s days', days));
  return true;
end $$;

-- Offer the next free place, if there is one. Returns the entry offered.
create or replace function app.offer_next_place(p_class uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare nxt uuid;
begin
  if app.class_free_places(p_class) <= 0 then return null; end if;
  select id into nxt from waitlist_entry
   where class_id = p_class and status = 'waiting' and deleted_at is null
   order by position limit 1;
  if nxt is not null then perform app.offer_waitlist_place(nxt); end if;
  return nxt;
end $$;

create or replace function app.withdraw_enrolment(p_id uuid, p_reason text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid;
begin
  select studio_id, class_id into sid, cid
    from enrolment where id = p_id and status = 'active' and deleted_at is null;
  if sid is null then return null; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may withdraw a place'
      using errcode = 'insufficient_privilege';
  end if;

  update enrolment
     set status = 'left', ended_on = current_date,
         note = coalesce(nullif(btrim(p_reason), ''), note), updated_at = now()
   where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'withdraw', 'enrolment', p_id, coalesce(p_reason, 'place given up'));

  -- Offered only if the freed place is not already promised to someone.
  return app.offer_next_place(cid);
end $$;

-- Taking a place: an offered family always fits, because its offer held the
-- place. Taking one without an offer needs a place nobody else is holding.
create or replace function app.accept_waitlist_place(p_id uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare w record; new_id uuid; held boolean;
begin
  select * into w from waitlist_entry
   where id = p_id and status in ('waiting','offered') and deleted_at is null;
  if not found then return null; end if;
  if not app.is_admin(w.studio_id) then
    raise exception 'FORBIDDEN: only the office may accept a place'
      using errcode = 'insufficient_privilege';
  end if;
  held := w.status = 'offered' and (w.offer_expires_at is null or w.offer_expires_at > now());
  if not held and app.class_free_places(w.class_id) <= 0 then
    raise exception 'NO_FREE_PLACE: There is no free place%.',
      case when app.class_live_offers(w.class_id) > 0 then ' — the free places are held by families with an offer'
           else ': the class is full' end
      using errcode = 'check_violation';
  end if;

  insert into enrolment (studio_id, class_id, student_id, status, started_on, created_by, note)
  values (w.studio_id, w.class_id, w.student_id, 'active', current_date, auth.uid(), 'From the waiting list')
  returning id into new_id;

  update waitlist_entry set status = 'accepted', responded_at = now(), updated_at = now() where id = p_id;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (w.studio_id, auth.uid(), 'accept', 'waitlist_entry', p_id, 'place taken up');
  return new_id;
end $$;

create or replace function app.decline_waitlist_place(p_id uuid, p_note text default null)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid;
begin
  select studio_id, class_id into sid, cid from waitlist_entry
   where id = p_id and status in ('waiting','offered') and deleted_at is null;
  if sid is null then return false; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may close a waiting-list entry'
      using errcode = 'insufficient_privilege';
  end if;

  update waitlist_entry
     set status = 'declined', responded_at = now(),
         note = coalesce(nullif(btrim(p_note), ''), note), updated_at = now()
   where id = p_id;

  perform app.offer_next_place(cid);

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'decline', 'waitlist_entry', p_id, 'place declined');
  return true;
end $$;

create or replace function app.expire_waitlist_offers(p_studio uuid, p_now timestamptz default now())
  returns integer
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare e record; n integer := 0;
begin
  for e in select id, class_id from waitlist_entry
            where studio_id = p_studio and status = 'offered' and deleted_at is null
              and offer_expires_at is not null and offer_expires_at <= p_now
  loop
    update waitlist_entry set status = 'expired', responded_at = p_now where id = e.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (p_studio, auth.uid(), 'expire', 'waitlist_entry', e.id, 'offer lapsed unanswered');
    n := n + 1;
    perform app.offer_next_place(e.class_id);
  end loop;
  return n;
end $$;

-- A place held by an offer cannot be taken by a direct enrolment either, so
-- the family that was offered it can always take it up.
create or replace function app.enforce_capacity() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cap integer; taken integer; held integer;
begin
  if new.status <> 'active' or new.deleted_at is not null then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'active' and old.class_id = new.class_id then
    return new;
  end if;
  select capacity into cap from class where id = new.class_id;
  if cap is null then return new; end if;
  select count(*) into taken from enrolment
   where class_id = new.class_id and status = 'active' and deleted_at is null and id <> new.id;
  select count(*) into held from waitlist_entry
   where class_id = new.class_id and status = 'offered' and deleted_at is null
     and (offer_expires_at is null or offer_expires_at > now())
     and student_id <> new.student_id;
  if taken + held >= cap then
    raise exception 'CLASS_FULL: class % is at capacity (%/%)%', new.class_id, taken + held, cap,
      case when held > 0 then format(', %s held by an offer', held) else '' end
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- Who may be added to a class's waiting list, or enrolled: not already in it,
-- not already waiting, with their age and whether it suits the class.
create or replace function app.class_candidates(p_class uuid)
  returns table (id uuid, first_name text, last_name text, date_of_birth date, family_name text,
                 age integer, in_range boolean, enrolled boolean, waiting boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.first_name, s.last_name, s.date_of_birth, f.name,
         extract(year from age(current_date, s.date_of_birth))::int,
         (c.age_min is null or extract(year from age(current_date, s.date_of_birth)) >= c.age_min)
           and (c.age_max is null or extract(year from age(current_date, s.date_of_birth)) <= c.age_max),
         exists (select 1 from enrolment e where e.student_id = s.id and e.class_id = c.id
                   and e.status = 'active' and e.deleted_at is null),
         exists (select 1 from waitlist_entry w where w.student_id = s.id and w.class_id = c.id
                   and w.status in ('waiting','offered') and w.deleted_at is null)
    from class c
    join student s on s.studio_id = c.studio_id and s.deleted_at is null and s.left_on is null
    join family f on f.id = s.family_id and f.deleted_at is null
   where c.id = p_class and app.is_admin(c.studio_id)
   order by s.last_name, s.first_name
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-18 · Enquiry → trial → enrolment
-- ════════════════════════════════════════════════════════════════════════════
-- Booking a trial now carries its enquiry whichever child it is for, moves the
-- enquiry to "Trial booked", and refuses a second live trial for one enquiry.
create or replace function app.book_trial(p_session uuid, p_student uuid default null, p_child jsonb default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare cs record; kid uuid := p_student; fam uuid; tid uuid; enq uuid := nullif(p_child ->> 'enquiry_id', '')::uuid;
        ephone text; ename text;
begin
  select s.*, c.trial_price_minor, c.name as class_name into cs
    from class_session s join class c on c.id = s.class_id
   where s.id = p_session and s.deleted_at is null;
  if cs.id is null then raise exception 'NOT_FOUND: that session' using errcode = 'no_data_found'; end if;
  if not app.is_admin(cs.studio_id) then
    raise exception 'FORBIDDEN: only the office books trials here' using errcode = 'insufficient_privilege';
  end if;
  if cs.status = 'cancelled' then raise exception 'INVALID: that session is cancelled' using errcode = 'check_violation'; end if;

  if enq is not null then
    if not exists (select 1 from enquiry where id = enq and studio_id = cs.studio_id and deleted_at is null) then
      raise exception 'NOT_FOUND: that enquiry' using errcode = 'no_data_found';
    end if;
    if exists (select 1 from trial where enquiry_id = enq and deleted_at is null and status in ('requested','booked')) then
      raise exception 'ALREADY_BOOKED: this enquiry already has a trial booked' using errcode = 'check_violation';
    end if;
  end if;

  if kid is null then
    if p_child is null or coalesce(btrim(p_child ->> 'first_name'), '') = ''
       or (p_child ->> 'date_of_birth') is null or coalesce(btrim(p_child ->> 'contact_name'), '') = '' then
      raise exception 'INVALID: a new child needs a name, date of birth and a parent or carer' using errcode = 'check_violation';
    end if;
    ephone := coalesce(nullif(btrim(p_child ->> 'emergency_phone'), ''), nullif(btrim(p_child ->> 'contact_phone'), ''));
    if ephone is null then
      raise exception 'INVALID: a phone number to ring in an emergency is needed before a child joins a class'
        using errcode = 'check_violation';
    end if;
    insert into family (studio_id, name, is_prospect, created_by)
    values (cs.studio_id, coalesce(nullif(btrim(p_child ->> 'last_name'), ''), split_part(p_child ->> 'contact_name', ' ', 2), 'New') || ' family', true, auth.uid())
    returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary)
    values (cs.studio_id, fam, btrim(p_child ->> 'contact_name'), nullif(btrim(p_child ->> 'contact_email'), ''),
            nullif(btrim(p_child ->> 'contact_phone'), ''), true);
    insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
    values (cs.studio_id, fam, btrim(p_child ->> 'first_name'), coalesce(nullif(btrim(p_child ->> 'last_name'), ''), '—'),
            (p_child ->> 'date_of_birth')::date, auth.uid())
    returning id into kid;
    ename := coalesce(nullif(btrim(p_child ->> 'emergency_name'), ''), btrim(p_child ->> 'contact_name'));
    insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
    values (cs.studio_id, kid, ename, case when ename = btrim(p_child ->> 'contact_name') then 'Parent/carer' end, ephone, 1);
  else
    if not exists (select 1 from student where id = kid and studio_id = cs.studio_id and deleted_at is null) then
      raise exception 'NOT_FOUND: that child' using errcode = 'no_data_found';
    end if;
    if not exists (select 1 from emergency_contact where student_id = kid and deleted_at is null) then
      raise exception 'INVALID: % has no emergency contact — add one before they join a class',
        (select first_name from student where id = kid) using errcode = 'check_violation';
    end if;
    select family_id into fam from student where id = kid;
  end if;

  if enq is not null then
    update enquiry set family_id = coalesce(family_id, fam), student_id = coalesce(student_id, kid),
                       interest_class_id = coalesce(interest_class_id, cs.class_id),
                       stage = 'trial_booked', updated_at = now()
     where id = enq;
  end if;

  insert into trial (studio_id, class_id, session_id, student_id, enquiry_id, status, price_minor, created_by)
  values (cs.studio_id, cs.class_id, cs.id, kid, enq, 'booked', cs.trial_price_minor, auth.uid())
  returning id into tid;
  return tid;
end $$;

-- ── UR-54 (D9) · An outcome waits for the trial ────────────────────────────
-- "Came", "No show" and "Joining" describe a class that has happened. Before
-- the session starts, only cancelling is possible. Checked on the row itself,
-- so every path (record_trial_outcome, convert_trial, a future one) obeys it.
create or replace function app.guard_trial_outcome_time() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare starts timestamptz;
begin
  if new.status is distinct from old.status
     and new.status in ('attended', 'missed', 'converted')
     and old.status in ('requested', 'booked')
     and new.session_id is not null then
    select starts_at into starts from class_session where id = new.session_id;
    if starts is not null and starts > now() then
      raise exception 'TOO_EARLY: The trial is on %. Record how it went after the class.',
        to_char(starts at time zone coalesce((select timezone from studio where id = new.studio_id), 'Europe/London'),
                'FMDay FMDD FMMonth')
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger trial_outcome_time before update of status on trial
  for each row execute function app.guard_trial_outcome_time();

-- A trial that is cancelled or comes to nothing closes its enquiry with a reason.
create or replace function app.close_enquiry(p_id uuid, p_reason text) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from enquiry where id = p_id and deleted_at is null;
  if sid is null then return false; end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may close an enquiry' using errcode = 'insufficient_privilege';
  end if;
  update enquiry set stage = 'closed_lost', closed_reason = nullif(btrim(p_reason), ''), updated_at = now()
   where id = p_id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'close', 'enquiry', p_id, coalesce('closed: ' || nullif(btrim(p_reason), ''), 'closed'));
  return true;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-35 · History of changes and of health-record reads
-- ════════════════════════════════════════════════════════════════════════════
-- The trail now says which fields changed (never their values: the log holds
-- ids and names of columns, as SECURITY.md promises), and skips a write that
-- changed nothing but timestamps. A soft delete is logged by app.soft_delete.
create or replace function app.write_audit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare rec record; sid uuid; changed text;
begin
  rec := coalesce(new, old);
  begin sid := rec.studio_id; exception when others then sid := null; end;
  if sid is not null and not exists (select 1 from studio where id = sid) then return rec; end if;
  if tg_op = 'UPDATE' then
    select string_agg(n.key, ', ' order by n.key) into changed
      from jsonb_each(to_jsonb(new)) n
     where n.value is distinct from (to_jsonb(old) -> n.key)
       and n.key not in ('updated_at', 'updated_by', 'deleted_at', 'balance_minor');
    if changed is null then return rec; end if;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), lower(tg_op), tg_table_name, rec.id,
          case tg_op when 'DELETE' then 'removed' when 'INSERT' then 'created'
                     else 'changed ' || changed end);
  return rec;
end $$;

do $$
declare t text;
begin
  foreach t in array array['family', 'guardian', 'student', 'emergency_contact', 'studio', 'class'] loop
    execute format('drop trigger if exists %1$s_audit on %1$I', t);
    execute format(
      'create trigger %1$s_audit after insert or update or delete on %1$I
         for each row execute function app.write_audit()', t);
  end loop;
end $$;

-- Opening a child's full medical record, as the owner or an administrator,
-- leaves a "viewed" entry. Teachers' safety briefs are not logged here: they
-- are the point of the brief. One entry per person, child and hour.
create or replace function app.log_medical_view(p_student uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from student where id = p_student and deleted_at is null;
  if sid is null or auth.uid() is null or not app.is_admin(sid) then return false; end if;
  if exists (select 1 from audit_log where actor_id = auth.uid() and entity = 'student' and entity_id = p_student
               and action = 'view_medical' and at > now() - interval '1 hour') then
    return false;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'view_medical', 'student', p_student, 'opened the medical record');
  return true;
end $$;

-- A name for whatever a log row is about, worked out at read time.
create or replace function app.audit_record_label(p_entity text, p_id uuid) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case p_entity
    when 'family'            then (select name from family where id = p_id)
    when 'student'           then (select first_name || ' ' || last_name from student where id = p_id)
    when 'guardian'          then (select g.full_name || ' (' || f.name || ')' from guardian g join family f on f.id = g.family_id where g.id = p_id)
    when 'emergency_contact' then (select 'Emergency contact for ' || s.first_name || ' ' || s.last_name
                                     from emergency_contact e join student s on s.id = e.student_id where e.id = p_id)
    when 'medical_record'    then (select 'Medical record of ' || s.first_name || ' ' || s.last_name
                                     from medical_record m join student s on s.id = m.student_id where m.id = p_id)
    when 'consent_record'    then (select 'Consent for ' || s.first_name || ' ' || s.last_name
                                     from consent_record c join student s on s.id = c.student_id where c.id = p_id)
    when 'enrolment'         then (select s.first_name || ' ' || s.last_name || ' in ' || c.name
                                     from enrolment e join student s on s.id = e.student_id join class c on c.id = e.class_id where e.id = p_id)
    when 'invoice'           then (select number from invoice where id = p_id)
    when 'payment'           then (select 'Payment from ' || f.name from payment p join family f on f.id = p.family_id where p.id = p_id)
    when 'class'             then (select name from class where id = p_id)
    when 'studio'            then 'School settings'
    when 'membership'        then (select 'Access for ' || u.full_name from membership m join user_account u on u.id = m.user_id where m.id = p_id)
    when 'staff_member'      then (select display_name from staff_member where id = p_id)
    when 'enquiry'           then (select 'Enquiry from ' || contact_name from enquiry where id = p_id)
    when 'waitlist_entry'    then (select 'Waiting list: ' || s.first_name || ' ' || s.last_name
                                     from waitlist_entry w join student s on s.id = w.student_id where w.id = p_id)
    else null end
$$;

-- The school's history, for the owner: filter by who, by kind of record, by
-- a word in the record's name, and by date.
create or replace function app.audit_history(p_actor uuid default null, p_entity text default null,
                                             p_text text default null, p_from date default null,
                                             p_to date default null, p_limit integer default 200)
  returns table (id bigint, at timestamptz, actor_id uuid, actor text, action text, entity text,
                 entity_id uuid, record_label text, summary text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select * from (
    select a.id, a.at, a.actor_id,
           coalesce(u.full_name, case when a.actor_id is null then 'Swayvo (automatic)' else 'Former staff' end) as actor,
           a.action, a.entity, a.entity_id, app.audit_record_label(a.entity, a.entity_id) as record_label, a.summary
      from audit_log a left join user_account u on u.id = a.actor_id
     where a.studio_id in (select m.studio_id from app.memberships() m where m.role = 'owner')
       and (p_actor is null or a.actor_id = p_actor)
       and (p_entity is null or a.entity = p_entity)
       and (p_from is null or a.at >= p_from)
       and (p_to is null or a.at < p_to + 1)
     order by a.at desc, a.id desc
     limit 2000) h
   where p_text is null or btrim(p_text) = '' or lower(coalesce(h.record_label, '')) like '%' || lower(btrim(p_text)) || '%'
   limit greatest(1, least(coalesce(p_limit, 200), 1000))
$$;

-- One record's history, for the office: a family with its guardians and
-- children, or a child with their health record, contacts and places. Reads of
-- health records are shown to the owner only.
create or replace function app.record_history(p_entity text, p_id uuid)
  returns table (id bigint, at timestamptz, actor text, action text, entity text, record_label text, summary text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare sid uuid; is_owner boolean; ids uuid[];
begin
  if p_entity = 'family' then
    select studio_id into sid from family where family.id = p_id;
    ids := array[p_id]
      || coalesce((select array_agg(g.id) from guardian g where g.family_id = p_id), '{}')
      || coalesce((select array_agg(s.id) from student s where s.family_id = p_id), '{}')
      || coalesce((select array_agg(i.id) from invoice i where i.family_id = p_id), '{}')
      || coalesce((select array_agg(p.id) from payment p where p.family_id = p_id), '{}');
  elsif p_entity = 'student' then
    select studio_id into sid from student where student.id = p_id;
    ids := array[p_id]
      || coalesce((select array_agg(m.id) from medical_record m where m.student_id = p_id), '{}')
      || coalesce((select array_agg(e.id) from emergency_contact e where e.student_id = p_id), '{}')
      || coalesce((select array_agg(c.id) from consent_record c where c.student_id = p_id), '{}')
      || coalesce((select array_agg(e.id) from enrolment e where e.student_id = p_id), '{}');
  else
    raise exception 'INVALID: history is kept for families and students' using errcode = 'check_violation';
  end if;
  if sid is null or not app.is_admin(sid) then return; end if;
  is_owner := app.has_role(sid, 'owner');
  return query
    select a.id, a.at,
           coalesce(u.full_name, case when a.actor_id is null then 'Swayvo (automatic)' else 'Former staff' end),
           a.action, a.entity, app.audit_record_label(a.entity, a.entity_id), a.summary
      from audit_log a left join user_account u on u.id = a.actor_id
     where a.studio_id = sid and a.entity_id = any(ids)
       and (is_owner or a.action <> 'view_medical')
     order by a.at desc, a.id desc
     limit 200;
end $$;

-- People who appear in the owner's history, for the filter.
create or replace function app.audit_actors()
  returns table (id uuid, name text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct u.id, u.full_name from audit_log a join user_account u on u.id = a.actor_id
   where a.studio_id in (select m.studio_id from app.memberships() m where m.role = 'owner')
   order by u.full_name
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-39 · Asking to upgrade
-- ════════════════════════════════════════════════════════════════════════════
-- Recorded on the school's account history, which the platform console reads
-- (app.platform_events shows every account decision). Once a day is enough.
create or replace function app.request_plan_upgrade(p_reason text) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select m.studio_id into sid from app.memberships() m where m.role in ('owner', 'admin') limit 1;
  if sid is null then
    raise exception 'FORBIDDEN: only the office can ask for a larger plan' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from audit_log where studio_id = sid and action = 'upgrade_request' and at > now() - interval '1 day') then
    return false;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'upgrade_request', 'studio', sid,
          'Asked for a larger plan: ' || coalesce(nullif(btrim(p_reason), ''), 'plan limit reached'));
  return true;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-57 · Duplicate families
-- ════════════════════════════════════════════════════════════════════════════
-- Likely duplicates: the same guardian email or phone in two families, a child
-- of the same first name and birthday, or simply the same family name.
create or replace function app.family_duplicates()
  returns table (keep_id uuid, keep_name text, other_id uuid, other_name text, reason text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with mine as (select f.* from family f where f.deleted_at is null and app.is_admin(f.studio_id)),
  g as (select g.family_id, lower(btrim(g.email)) as email,
               nullif(right(regexp_replace(coalesce(g.phone, ''), '\D', '', 'g'), 10), '') as phone
          from guardian g join mine on mine.id = g.family_id where g.deleted_at is null),
  pairs as (
    select a.family_id as x, b.family_id as y, 'Same email: ' || a.email as reason
      from g a join g b on a.email = b.email and a.family_id < b.family_id where a.email is not null and a.email <> ''
    union all
    select a.family_id, b.family_id, 'Same phone number'
      from g a join g b on a.phone = b.phone and a.family_id < b.family_id where a.phone is not null and length(a.phone) >= 7
    union all
    select s1.family_id, s2.family_id, 'A child called ' || s1.first_name || ' with the same birthday'
      from student s1 join student s2 on s1.family_id < s2.family_id and s1.studio_id = s2.studio_id
       and lower(s1.first_name) = lower(s2.first_name) and s1.date_of_birth = s2.date_of_birth
      join mine f1 on f1.id = s1.family_id join mine f2 on f2.id = s2.family_id
     where s1.deleted_at is null and s2.deleted_at is null
    union all
    select f1.id, f2.id, 'Same family name'
      from mine f1 join mine f2 on f1.id < f2.id and f1.studio_id = f2.studio_id
       and lower(btrim(f1.name)) = lower(btrim(f2.name))
  ),
  grouped as (select x, y, string_agg(distinct reason, '; ') as reason from pairs group by x, y)
  -- Keep the older record: it is the one invoices and logins most likely point at.
  select case when fx.created_at <= fy.created_at then fx.id else fy.id end,
         case when fx.created_at <= fy.created_at then fx.name else fy.name end,
         case when fx.created_at <= fy.created_at then fy.id else fx.id end,
         case when fx.created_at <= fy.created_at then fy.name else fx.name end,
         g.reason
    from grouped g join mine fx on fx.id = g.x join mine fy on fy.id = g.y
   where fx.studio_id = fy.studio_id
   order by 2
$$;

-- Every row a merge moved, so it can be put back.
create table family_merge (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  kept_id     uuid not null references family(id) on delete cascade,
  merged_id   uuid not null references family(id) on delete cascade,
  moved       jsonb not null default '{}'::jsonb,   -- { table: [ids] }
  merged_by   uuid references user_account(id) on delete set null,
  merged_at   timestamptz not null default now(),
  undone_at   timestamptz,
  undone_by   uuid references user_account(id) on delete set null
);
alter table family_merge enable row level security;
alter table family_merge force row level security;
create policy family_merge_read on family_merge for select using (app.is_admin(studio_id));
grant select on family_merge to authenticated;
grant all on family_merge to service_role;

-- What a merge would move, without moving it.
create or replace function app.family_merge_preview(p_keep uuid, p_merge uuid)
  returns table (tbl text, n integer)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare t text; sid uuid; c integer;
begin
  select studio_id into sid from family where id = p_merge and deleted_at is null;
  if sid is null or not app.is_admin(sid)
     or not exists (select 1 from family where id = p_keep and studio_id = sid and deleted_at is null) then
    raise exception 'FORBIDDEN: choose two families at your school' using errcode = 'insufficient_privilege';
  end if;
  for t in select table_name from information_schema.columns
            where table_schema = 'public' and column_name = 'family_id' and table_name <> 'family_merge'
            order by table_name loop
    execute format('select count(*)::int from %I where family_id = $1', t) into c using p_merge;
    if c > 0 then tbl := t; n := c; return next; end if;
  end loop;
end $$;

create or replace function app.merge_families(p_keep uuid, p_merge uuid) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare t text; sid uuid; moved jsonb := '{}'::jsonb; ids jsonb; mid uuid; kname text; mname text;
begin
  if p_keep = p_merge then raise exception 'INVALID: choose two different families' using errcode = 'check_violation'; end if;
  select studio_id, name into sid, mname from family where id = p_merge and deleted_at is null;
  select name into kname from family where id = p_keep and studio_id = sid and deleted_at is null;
  if sid is null or kname is null then
    raise exception 'NOT_FOUND: both families must exist at the same school' using errcode = 'no_data_found';
  end if;
  if not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may merge families' using errcode = 'insufficient_privilege';
  end if;

  for t in select table_name from information_schema.columns
            where table_schema = 'public' and column_name = 'family_id' and table_name <> 'family_merge'
            order by table_name loop
    execute format('with m as (update %I set family_id = $1 where family_id = $2 returning id)
                    select coalesce(jsonb_agg(id), ''[]''::jsonb) from m', t)
      into ids using p_keep, p_merge;
    if jsonb_array_length(ids) > 0 then moved := moved || jsonb_build_object(t, ids); end if;
  end loop;

  -- One main contact is enough; the kept family's stays.
  if exists (select 1 from guardian where family_id = p_keep and is_primary and deleted_at is null
               and id::text not in (select jsonb_array_elements_text(coalesce(moved -> 'guardian', '[]')))) then
    update guardian set is_primary = false
     where id::text in (select jsonb_array_elements_text(coalesce(moved -> 'guardian', '[]'))) and is_primary;
  end if;

  update family set deleted_at = now(),
         notes = concat_ws(E'\n', notes, 'Merged into ' || kname || ' on ' || to_char(now(), 'DD Mon YYYY'))
   where id = p_merge;
  update family set is_prospect = false where id = p_keep and is_prospect
     and exists (select 1 from family where id = p_merge and not is_prospect);
  perform app.recalc_family_balance(p_keep);

  insert into family_merge (studio_id, kept_id, merged_id, moved, merged_by)
  values (sid, p_keep, p_merge, moved, auth.uid()) returning id into mid;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'merge', 'family', p_keep, format('merged %s into this family (%s records moved)', mname,
          (select coalesce(sum(jsonb_array_length(v)), 0) from jsonb_each(moved) e(k, v))));
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'merge', 'family', p_merge, 'merged into ' || kname);
  return mid;
end $$;

-- Undo, within 30 days: the merged family comes back with exactly the rows that
-- were moved. Anything created since stays with the family that was kept.
create or replace function app.undo_family_merge(p_merge uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m family_merge; t text; ids jsonb;
begin
  select * into m from family_merge where id = p_merge;
  if m.id is null then raise exception 'NOT_FOUND: that merge' using errcode = 'no_data_found'; end if;
  if not app.is_admin(m.studio_id) then
    raise exception 'FORBIDDEN: only the office may undo a merge' using errcode = 'insufficient_privilege';
  end if;
  if m.undone_at is not null then return false; end if;
  if m.merged_at < now() - interval '30 days' then
    raise exception 'TOO_LATE: a merge can be undone for 30 days' using errcode = 'check_violation';
  end if;
  update family set deleted_at = null,
         notes = nullif(regexp_replace(coalesce(notes, ''), E'\\n?Merged into [^\\n]*$', ''), '')
   where id = m.merged_id;
  for t, ids in select key, value from jsonb_each(m.moved) loop
    execute format('update %I set family_id = $1 where family_id = $2 and id::text in (select jsonb_array_elements_text($3))', t)
      using m.merged_id, m.kept_id, ids;
  end loop;
  perform app.recalc_family_balance(m.kept_id);
  perform app.recalc_family_balance(m.merged_id);
  update family_merge set undone_at = now(), undone_by = auth.uid() where id = p_merge;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (m.studio_id, auth.uid(), 'unmerge', 'family', m.merged_id, 'merge undone: records returned to this family');
  return true;
end $$;

-- ── Grants ─────────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'class_live_offers(uuid, uuid)', 'class_free_places(uuid)', 'offer_waitlist_place(uuid, integer)',
    'offer_next_place(uuid)', 'withdraw_enrolment(uuid, text)', 'accept_waitlist_place(uuid)',
    'decline_waitlist_place(uuid, text)', 'class_candidates(uuid)', 'book_trial(uuid, uuid, jsonb)',
    'close_enquiry(uuid, text)', 'log_medical_view(uuid)', 'audit_record_label(text, uuid)',
    'audit_history(uuid, text, text, date, date, integer)', 'record_history(text, uuid)', 'audit_actors()',
    'request_plan_upgrade(text)', 'family_duplicates()', 'family_merge_preview(uuid, uuid)',
    'merge_families(uuid, uuid)', 'undo_family_merge(uuid)'] loop
    execute format('revoke all on function app.%s from public', f);
    execute format('grant execute on function app.%s to authenticated, service_role', f);
  end loop;
end $$;
