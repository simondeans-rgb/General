-- ============================================================================
-- 0046 · Family fixes from the end-user panel review
-- ----------------------------------------------------------------------------
--   UR-03  Invitations link the guardian record the office already holds.
--   UR-05  A guardian edits only their own row, and only contact fields.
--   UR-06  A public adult drop-in books the adult, never a child; every
--          booking path enforces the class's age limits.
--   UR-16  Parents approve, or switch off, a teenager's own login; the
--          school sets the minimum age (13–18).
--   UR-17  Shared care: each guardian's messages to the studio are private
--          to them and the office; the office can restrict what a guardian
--          sees; each child has a collection list the teacher sees.
--   UR-21  Adult participants: a student row flagged as adult, linked to the
--          guardian row that is the same person. They sign in as that
--          guardian and use the family screens for their own bookings.
--   UR-54  Out-of-age class requests are refused with a clear reason.
-- ============================================================================

-- ── Columns ────────────────────────────────────────────────────────────────
alter table student add column is_adult boolean not null default false;
-- The guardian row that is this same person (an adult participant).
alter table student add column self_guardian_id uuid references guardian(id) on delete set null;
-- Who last switched a teenager's login off, and when (UR-16).
alter table student add column login_switched_off_by uuid references user_account(id) on delete set null;
alter table student add column login_switched_off_at timestamptz;
create unique index student_self_guardian_unique on student (self_guardian_id)
  where self_guardian_id is not null and deleted_at is null;

-- How a booking arrived, for the office (UR-06).
alter table drop_in_booking add column source_note text;

-- A direct message that belongs to one guardian's conversation with the
-- studio (UR-17). Null means the whole family sees it, as before.
alter table communication add column private_to uuid references user_account(id) on delete set null;

-- ── UR-06 · Age limits on every booking path ───────────────────────────────
create or replace function app.age_label(p_min smallint, p_max smallint) returns text
  language sql immutable as $$
  select case when p_min is not null and p_max is not null then 'ages ' || p_min || '–' || p_max
              when p_min is not null then 'ages ' || p_min || ' and over'
              else 'ages up to ' || p_max end
$$;

-- Raises when a person of this date of birth is outside the class's range on
-- the given day. Ages are whole years, as on the timetable.
--
-- p_office: the school office may place a child just outside a children's
-- range on purpose (moving up early, an imported history), but nobody puts
-- an under-18 into an adult class, or an adult into a children's class.
create or replace function app.check_class_age(p_class uuid, p_dob date, p_on date, p_name text, p_office boolean default false)
  returns void
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare c class; yrs int;
begin
  select * into c from class where id = p_class;
  if c.id is null or (c.age_min is null and c.age_max is null) or p_dob is null then return; end if;
  yrs := extract(year from age(coalesce(p_on, current_date), p_dob));
  if p_office and not ((c.age_min >= 18 and yrs < 18) or (c.age_max < 18 and yrs >= 18)) then return; end if;
  if (c.age_min is not null and yrs < c.age_min) or (c.age_max is not null and yrs > c.age_max) then
    raise exception 'INVALID: % is %, and % is for %', coalesce(p_name, 'This dancer'), yrs, c.name,
      app.age_label(c.age_min, c.age_max) using errcode = 'check_violation';
  end if;
end $$;

-- One trigger for enrolments, waiting lists, trials and drop-ins: every path,
-- whichever function or screen it comes from. Trusted server jobs
-- (service_role: the seed) are exempt; families, the public, students and
-- teachers are held to the class's range; the office to the adult boundary.
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
  perform app.check_class_age(cls, dob, on_day, nm, app.is_admin((select studio_id from class where id = cls)));
  return new;
end $$;

create trigger enrolment_age_check before insert or update of class_id, student_id, status on enrolment
  for each row execute function app.enforce_class_age();
create trigger waitlist_age_check before insert or update of class_id, student_id on waitlist_entry
  for each row execute function app.enforce_class_age();
create trigger trial_age_check before insert or update of class_id, student_id, session_id on trial
  for each row execute function app.enforce_class_age();
create trigger drop_in_age_check before insert on drop_in_booking
  for each row execute function app.enforce_class_age();

-- A request for a place is refused up front, with the same words (UR-54).
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
  perform app.check_class_age(c.id, s.date_of_birth, current_date, s.first_name);
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

-- ── UR-06 / UR-21 · The public adult drop-in books the adult ───────────────
-- The adult participant for a guardian row: reuse it, or make it.
create or replace function app.adult_participant_for(p_guardian uuid, p_dob date, p_emergency_name text, p_emergency_phone text)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g guardian; kid uuid; nm text;
begin
  select * into g from guardian where id = p_guardian and deleted_at is null;
  if g.id is null then raise exception 'NOT_FOUND: guardian' using errcode = 'no_data_found'; end if;
  select id into kid from student where self_guardian_id = g.id and deleted_at is null;
  if kid is not null then
    if p_dob is not null then
      update student set date_of_birth = p_dob where id = kid and date_of_birth is distinct from p_dob;
    end if;
    return kid;
  end if;
  nm := btrim(g.full_name);
  insert into student (studio_id, family_id, first_name, last_name, date_of_birth, is_adult, self_guardian_id)
  values (g.studio_id, g.family_id, split_part(nm, ' ', 1),
          coalesce(nullif(regexp_replace(nm, '^\S+\s*', ''), ''), '—'),
          -- An adult who did not give a date of birth has confirmed they are
          -- 18 or over; the record says so without inventing a birthday.
          coalesce(p_dob, make_date(extract(year from current_date)::int - 18, 1, 1)), true, g.id)
  returning id into kid;
  if coalesce(btrim(p_emergency_phone), '') <> '' then
    insert into emergency_contact (studio_id, student_id, full_name, phone, priority)
    values (g.studio_id, kid, coalesce(nullif(btrim(p_emergency_name), ''), 'Emergency contact'), btrim(p_emergency_phone), 1);
  end if;
  return kid;
end $$;
revoke all on function app.adult_participant_for(uuid, date, text, text) from public, authenticated, anon;

create or replace function app.public_adult_drop_in(p_slug text, p_session uuid, p_form jsonb) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st studio; fam uuid; gid uuid; kid uuid; r jsonb; em text; dob date; famname text; cls class;
begin
  select * into st from studio where slug = lower(p_slug) and deleted_at is null;
  if st.id is null or not app.studio_writable(st.id) then raise exception 'NOT_FOUND: that school' using errcode = 'no_data_found'; end if;
  if coalesce(p_form ->> 'website', '') <> '' then return 'ok'; end if;
  if coalesce(btrim(p_form ->> 'name'), '') = '' or coalesce(btrim(p_form ->> 'phone'), '') = ''
     or coalesce(p_form ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or coalesce(btrim(p_form ->> 'emergency_phone'), '') = '' then
    raise exception 'INVALID: please give your name, email, phone and someone to ring in an emergency' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from app.drop_in_sessions(st.id) d where d.session_id = p_session) then
    raise exception 'INVALID: that class is full or no longer open — please pick another' using errcode = 'check_violation';
  end if;
  select c.* into cls from class c join class_session cs on cs.class_id = c.id where cs.id = p_session;
  begin
    dob := nullif(p_form ->> 'date_of_birth', '')::date;
  exception when others then
    raise exception 'INVALID: please check your date of birth' using errcode = 'check_violation';
  end;
  if dob is not null and (dob > current_date or dob < current_date - interval '110 years') then
    raise exception 'INVALID: please check your date of birth' using errcode = 'check_violation';
  end if;
  -- An adult class needs a date of birth or a plain "I am 18 or over".
  if coalesce(cls.age_min, 0) >= 18 and dob is null
     and coalesce(p_form ->> 'adult_confirm', '') not in ('true', 't', 'yes', 'on') then
    raise exception 'INVALID: please confirm you are 18 or over — this class is for adults' using errcode = 'check_violation';
  end if;
  perform app.public_guard(st.id, 'drop_in', p_form);
  em := lower(btrim(p_form ->> 'email'));
  -- The person is identified by their email. Prefer the row whose name also
  -- matches, so two adults sharing an address are kept apart.
  select g.id, g.family_id into gid, fam from guardian g
   where g.studio_id = st.id and lower(btrim(g.email)) = em and g.deleted_at is null
   order by (lower(btrim(g.full_name)) = lower(btrim(p_form ->> 'name'))) desc, g.created_at limit 1;
  if gid is null then
    insert into family (studio_id, name) values (st.id, regexp_replace(btrim(p_form ->> 'name'), '^.*\s', '') || ' (adult)') returning id into fam;
    insert into guardian (studio_id, family_id, full_name, email, phone, is_primary, relationship, marketing_consent)
    values (st.id, fam, btrim(p_form ->> 'name'), em, btrim(p_form ->> 'phone'), true, 'Self',
            coalesce(p_form ->> 'marketing', '') in ('true', 't', 'yes', 'on'))
    returning id into gid;
  else
    select name into famname from family where id = fam;
  end if;
  -- Never a child: the adult's own participant record.
  kid := app.adult_participant_for(gid, dob, p_form ->> 'emergency_name', p_form ->> 'emergency_phone');
  r := app.book_drop_in_unchecked(p_session, kid, true);
  update drop_in_booking set source_note = 'Booked by public form'
         || case when famname is not null then '; matched to existing family ' || famname else '' end
   where id = (r ->> 'id')::uuid;
  if famname is not null then
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (st.id, null, 'book', 'drop_in_booking', (r ->> 'id')::uuid,
            'Public adult drop-in for ' || btrim(p_form ->> 'name') || ' matched to existing family ' || famname);
  end if;
  return case when r ->> 'paid_with' = 'hold' then 'held' else 'ok' end;
end $$;
grant execute on function app.public_adult_drop_in(text, uuid, jsonb) to anon, authenticated;

-- ── UR-05 · Guardians edit only their own row ──────────────────────────────
drop policy if exists guardian_self_update on guardian;
create policy guardian_self_update on guardian for update
  using (deleted_at is null and user_id = auth.uid())
  with check (user_id = auth.uid());

-- Linking fields and the office's own fields are the office's. SECURITY
-- INVOKER, like the column guards in 0038: a person updating a row directly
-- runs as 'authenticated' and is checked here. A trusted function runs as its
-- owner and may change contact fields, but linking a login to a row is still
-- allowed only inside app.accept_invitation, for the person accepting, on an
-- unlinked row whose family and email match an invitation they accepted in
-- this very transaction (UR-03).
create or replace function app.guardian_self_edit_guard() returns trigger
  language plpgsql security invoker set search_path = public, app, pg_temp as $$
declare me uuid := auth.uid();
begin
  if me is null or app.is_admin(old.studio_id) then return new; end if;
  if new.user_id is distinct from old.user_id then
    if old.user_id is null and new.user_id = me
       and current_user <> 'authenticated'
       and current_setting('app.accepting_invitation', true) = old.id::text
       and new.family_id = old.family_id and new.studio_id = old.studio_id
       and new.deleted_at is not distinct from old.deleted_at
       and exists (select 1 from studio_invitation i
                    where i.accepted_by = me and i.accepted_at = now() and i.studio_id = old.studio_id
                      and i.email = lower(btrim(old.email))
                      and (i.family_id = old.family_id
                           or exists (select 1 from student s where s.id = i.student_id and s.family_id = old.family_id))) then
      return new;
    end if;
    raise exception 'FORBIDDEN: only the office can change who is linked to a family' using errcode = 'insufficient_privilege';
  end if;
  if new.family_id is distinct from old.family_id or new.studio_id is distinct from old.studio_id
     or new.deleted_at is distinct from old.deleted_at then
    raise exception 'FORBIDDEN: only the office can change who is linked to a family' using errcode = 'insufficient_privilege';
  end if;
  if current_user = 'authenticated' and (new.is_primary is distinct from old.is_primary
     or new.receives_billing is distinct from old.receives_billing
     or new.relationship is distinct from old.relationship) then
    raise exception 'FORBIDDEN: only the office can change the main contact, who receives invoices or a relationship'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- "Ask the office to change" another guardian's details (UR-05).
create or replace function app.ask_to_change_guardian(p_guardian uuid, p_body text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g guardian; rid uuid;
begin
  select * into g from guardian where id = p_guardian and deleted_at is null
     and family_id in (select app.guardian_family_ids());
  if g.id is null then raise exception 'FORBIDDEN: that is not someone in your family' using errcode = 'insufficient_privilege'; end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'INVALID: say what should change' using errcode = 'check_violation';
  end if;
  insert into studio_request (studio_id, family_id, kind, subject, body, raised_by)
  values (g.studio_id, g.family_id, 'other', 'Change details for ' || g.full_name, btrim(p_body), auth.uid())
  returning id into rid;
  return rid;
end $$;
grant execute on function app.ask_to_change_guardian(uuid, text) to authenticated;

-- ── UR-03 / UR-16 / UR-21 · Accepting an invitation ────────────────────────
-- Links the guardian row for an invitation's family and email, or makes one.
-- Refuses rather than guesses: two unlinked rows with the same email, a row
-- already linked to someone else, or an email that belongs to another family.
-- p_dry: check only (run before anything is written, so the person sees the
-- reason rather than a clash further on).
create or replace function app.link_invited_guardian(p_inv studio_invitation, p_family uuid, p_me uuid, p_name text,
                                                     p_dry boolean default false)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare gid uuid; n_free int; n_taken int; n_other int;
begin
  select id into gid from guardian where family_id = p_family and user_id = p_me and deleted_at is null limit 1;
  if gid is not null then return gid; end if;
  select count(*) filter (where family_id = p_family and user_id is null),
         count(*) filter (where family_id = p_family and user_id is not null),
         count(*) filter (where family_id <> p_family)
    into n_free, n_taken, n_other
    from guardian where studio_id = p_inv.studio_id and deleted_at is null and lower(btrim(email)) = p_inv.email;
  if n_free > 1 then
    raise exception 'INVALID: the school has two records with this email in the family — ask the office to merge them, then try again'
      using errcode = 'check_violation';
  elsif p_dry and (n_free = 1 or (n_taken = 0 and n_other = 0)) then
    return null;
  elsif n_free = 1 then
    select id into gid from guardian where family_id = p_family and user_id is null and deleted_at is null
       and lower(btrim(email)) = p_inv.email;
    perform set_config('app.accepting_invitation', gid::text, true);
    update guardian set user_id = p_me, updated_at = now() where id = gid;
    perform set_config('app.accepting_invitation', '', true);
  elsif n_taken > 0 then
    raise exception 'INVALID: this person already has an account — ask the office' using errcode = 'check_violation';
  elsif n_other > 0 then
    raise exception 'INVALID: this email belongs to a parent in another family at this school — ask the office to check the invitation'
      using errcode = 'check_violation';
  else
    insert into guardian (studio_id, family_id, user_id, full_name, email)
    values (p_inv.studio_id, p_family, p_me, p_name, p_inv.email) returning id into gid;
  end if;
  return gid;
end $$;
revoke all on function app.link_invited_guardian(studio_invitation, uuid, uuid, text, boolean) from public, authenticated, anon;

create or replace function app.accept_invitation(p_token text, p_full_name text)
  returns table (studio_id uuid, role app_role)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare inv studio_invitation; me uuid := auth.uid(); claimed text := lower(auth.jwt() ->> 'email');
        nm text := btrim(coalesce(p_full_name, '')); gid uuid; s student; eff app_role; adult boolean := false;
        by_guardian boolean;
begin
  if me is null then raise exception 'FORBIDDEN: sign in to accept an invitation' using errcode = 'insufficient_privilege'; end if;
  select * into inv from studio_invitation where token_hash = app.hash_token(p_token) for update;
  if inv.id is null then raise exception 'INVALID: this invitation link is not valid' using errcode = 'check_violation'; end if;
  if inv.accepted_at is not null then raise exception 'INVALID: this invitation has already been used' using errcode = 'check_violation'; end if;
  if inv.revoked_at is not null then raise exception 'INVALID: this invitation was withdrawn' using errcode = 'check_violation'; end if;
  if inv.expires_at <= now() then raise exception 'INVALID: this invitation has expired — ask for a new one' using errcode = 'check_violation'; end if;
  if not exists (select 1 from studio s where s.id = inv.studio_id and s.status not in ('suspended', 'cancelled')) then
    raise exception 'INVALID: this school is not taking new members at the moment' using errcode = 'check_violation';
  end if;
  if claimed is not null and claimed <> inv.email then
    raise exception 'FORBIDDEN: this invitation was sent to %', inv.email using errcode = 'insufficient_privilege';
  end if;
  if length(nm) < 2 then nm := coalesce(inv.full_name, split_part(inv.email, '@', 1)); end if;

  eff := inv.role;
  if inv.role = 'student' then
    select * into s from student where id = inv.student_id and deleted_at is null;
    if s.id is null then raise exception 'INVALID: this login is for a student who is no longer on the books' using errcode = 'check_violation'; end if;
    if s.user_id is not null and s.user_id <> me then
      raise exception 'INVALID: this person already has an account — ask the office' using errcode = 'check_violation';
    end if;
    -- An adult manages their own account: no guardian approval, and they use
    -- the family screens for their bookings and payments (UR-21).
    adult := s.is_adult or extract(year from age(current_date, s.date_of_birth)) >= 18;
    if adult then eff := 'guardian'; end if;
  end if;

  if inv.role = 'guardian' then
    perform app.link_invited_guardian(inv, inv.family_id, me, nm, true);
  elsif adult and (s.self_guardian_id is null or exists (select 1 from guardian where id = s.self_guardian_id
                     and (deleted_at is not null or (user_id is not null and user_id <> me)))) then
    perform app.link_invited_guardian(inv, s.family_id, me, nm, true);
  end if;

  insert into user_account (id, email, full_name) values (me, inv.email, nm)
  on conflict (id) do nothing;

  -- Revive a removed membership rather than duplicating it.
  update membership set deleted_at = null, updated_at = now()
   where user_id = me and membership.studio_id = inv.studio_id and membership.role = eff;
  if not found then
    insert into membership (user_id, studio_id, role) values (me, inv.studio_id, eff)
    on conflict do nothing;
  end if;

  -- Marked accepted before any linking, so the guardian guard can see that
  -- this transaction is accepting this invitation (UR-03).
  update studio_invitation set accepted_at = now(), accepted_by = me where id = inv.id;

  if inv.role = 'teacher' then
    update staff_member set user_id = me
     where id = (select id from staff_member where staff_member.studio_id = inv.studio_id
                   and lower(email) = inv.email and user_id is null and deleted_at is null limit 1);
    if not found and not exists (select 1 from staff_member where staff_member.studio_id = inv.studio_id and user_id = me) then
      insert into staff_member (studio_id, user_id, display_name, email) values (inv.studio_id, me, nm, inv.email);
    end if;
  elsif inv.role = 'guardian' then
    perform app.link_invited_guardian(inv, inv.family_id, me, nm);
  elsif inv.role = 'student' and adult then
    gid := s.self_guardian_id;
    if gid is null or exists (select 1 from guardian where id = gid and (deleted_at is not null or (user_id is not null and user_id <> me))) then
      gid := app.link_invited_guardian(inv, s.family_id, me, nm);
    elsif exists (select 1 from guardian where id = gid and user_id is null) then
      perform set_config('app.accepting_invitation', gid::text, true);
      update guardian set user_id = me, updated_at = now() where id = gid;
      perform set_config('app.accepting_invitation', '', true);
    end if;
    update student set user_id = me, is_adult = true, self_guardian_id = gid, login_enabled = true,
           login_approved_by = me, login_approved_at = now(), login_switched_off_by = null, login_switched_off_at = null
     where id = s.id;
  elsif inv.role = 'student' then
    -- A child's login stays off until a guardian approves it — unless the
    -- invitation came from that child's guardian.
    by_guardian := exists (select 1 from guardian g where g.family_id = s.family_id
                             and g.user_id = inv.invited_by and g.deleted_at is null);
    update student set user_id = me, login_enabled = by_guardian,
           login_approved_by = case when by_guardian then inv.invited_by end,
           login_approved_at = case when by_guardian then now() end,
           login_switched_off_by = null, login_switched_off_at = null
     where id = s.id;
    if not by_guardian then
      perform app.notify_family(s.family_id, 'student_login', s.first_name || ' is waiting for your approval',
        s.first_name || ' has accepted the school''s invitation. Their login stays off until you approve it.', '/family/children');
    end if;
  end if;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (inv.studio_id, me, 'accept', 'membership', inv.id, inv.role || ' joined: ' || inv.email);
  return query select inv.studio_id, eff;
end $$;

-- ── UR-16 · Teenagers' own logins ──────────────────────────────────────────
-- Each child's login, for their guardians.
--   too_young  below the school's minimum age
--   none       no login and no invitation
--   invited    an invitation is out, not yet accepted
--   pending    accepted; waiting for a guardian to approve
--   on         approved and working
--   off        a guardian switched it off
create or replace function app.my_children_logins()
  returns table (student_id uuid, first_name text, age int, min_age int, state text, email text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.first_name, extract(year from age(current_date, s.date_of_birth))::int, st.student_login_min_age::int,
         case when s.login_enabled then 'on'
              when s.user_id is not null and s.login_switched_off_at is not null then 'off'
              when s.user_id is not null then 'pending'
              when extract(year from age(current_date, s.date_of_birth)) < st.student_login_min_age then 'too_young'
              when exists (select 1 from studio_invitation i where i.student_id = s.id and i.accepted_at is null
                             and i.revoked_at is null and i.expires_at > now()) then 'invited'
              else 'none' end,
         coalesce((select u.email from user_account u where u.id = s.user_id),
                  (select i.email from studio_invitation i where i.student_id = s.id and i.accepted_at is null
                     and i.revoked_at is null and i.expires_at > now() order by i.created_at desc limit 1))
    from student s join studio st on st.id = s.studio_id
   where s.id in (select app.guardian_student_ids()) and not s.is_adult and s.deleted_at is null
   order by s.date_of_birth
$$;
grant execute on function app.my_children_logins() to authenticated;

-- Turning on needs one guardian; either guardian (or the office) may turn
-- it off, and the student's access ends at once (app.student_self_id).
create or replace function app.set_student_login(p_student uuid, p_on boolean) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; mine boolean;
begin
  select * into s from student where id = p_student and deleted_at is null;
  mine := s.id is not null and s.id in (select app.guardian_student_ids());
  if s.id is null or not (mine or (not p_on and app.is_admin(s.studio_id))) then
    raise exception 'FORBIDDEN: only a parent or carer can decide this' using errcode = 'insufficient_privilege';
  end if;
  if s.is_adult then raise exception 'INVALID: an adult manages their own login' using errcode = 'check_violation'; end if;
  if p_on then
    if s.user_id is null then
      raise exception 'INVALID: % has not accepted an invitation yet — invite them first', s.first_name using errcode = 'check_violation';
    end if;
    update student set login_enabled = true, login_approved_by = auth.uid(), login_approved_at = now(),
           login_switched_off_by = null, login_switched_off_at = null, updated_at = now()
     where id = s.id;
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (s.studio_id, auth.uid(), 'approve', 'student_login', s.id, 'Login approved for ' || s.first_name);
    return 'on';
  end if;
  update student set login_enabled = false, login_approved_by = null, login_approved_at = null,
         login_switched_off_by = auth.uid(), login_switched_off_at = now(), updated_at = now()
   where id = s.id;
  -- An invitation not yet used is withdrawn too.
  update studio_invitation set revoked_at = now() where student_id = s.id and accepted_at is null and revoked_at is null;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (s.studio_id, auth.uid(), 'switch_off', 'student_login', s.id, 'Login switched off for ' || s.first_name);
  perform app.notify_family(s.family_id, 'student_login', s.first_name || '’s login is off',
    'A parent or carer switched off ' || s.first_name || '’s own login.', '/family/children');
  return 'off';
end $$;
grant execute on function app.set_student_login(uuid, boolean) to authenticated;

-- A guardian invites their own child: the login works as soon as it is
-- accepted, because the inviter is the approving guardian.
create or replace function app.guardian_invite_student(p_student uuid, p_email text) returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; tok text; em text := lower(btrim(coalesce(p_email, ''))); min_age int;
begin
  s := app.my_child(p_student);
  if s.is_adult then raise exception 'INVALID: an adult manages their own login' using errcode = 'check_violation'; end if;
  select student_login_min_age into min_age from studio where id = s.studio_id;
  if extract(year from age(current_date, s.date_of_birth)) < min_age then
    raise exception 'INVALID: the school gives students their own login from age %', min_age using errcode = 'check_violation';
  end if;
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID: that does not look like an email address' using errcode = 'check_violation';
  end if;
  if s.user_id is not null then
    raise exception 'INVALID: % already has a login — switch it on or off instead', s.first_name using errcode = 'check_violation';
  end if;
  update studio_invitation set revoked_at = now()
   where student_id = s.id and accepted_at is null and revoked_at is null;
  tok := app.new_token();
  insert into studio_invitation (studio_id, email, full_name, role, student_id, token_hash, invited_by)
  values (s.studio_id, em, s.first_name || ' ' || s.last_name, 'student', s.id, app.hash_token(tok), auth.uid());
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (s.studio_id, auth.uid(), 'invite', 'studio_invitation', s.id, 'Student login invited by a parent: ' || em);
  return tok;
end $$;
grant execute on function app.guardian_invite_student(uuid, text) to authenticated;

-- The school's minimum age for a student's own login (13–18).
create or replace function app.set_student_login_min_age(p_studio uuid, p_age int) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only an owner can change this' using errcode = 'insufficient_privilege';
  end if;
  if p_age is null or p_age < 13 or p_age > 18 then
    raise exception 'INVALID: choose an age from 13 to 18' using errcode = 'check_violation';
  end if;
  update studio set student_login_min_age = p_age, updated_at = now() where id = p_studio;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio, 'Student logins from age ' || p_age);
end $$;
grant execute on function app.set_student_login_min_age(uuid, int) to authenticated;

-- ── UR-17 · Message privacy ────────────────────────────────────────────────
-- A guardian's own message, a reply in their thread, and the mirror of a
-- request they raised belong to that guardian. Runs after communication_stamp
-- (trigger names fire in order), so sent_by and inbound are final.
create or replace function app.communication_privacy() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare raiser uuid; parent_private uuid;
begin
  if new.kind <> 'direct' or new.family_id is null then new.private_to := null; return new; end if;
  -- Only the office (or a trusted job) addresses a message to one guardian.
  if new.private_to is not null and auth.uid() is not null and not app.is_staff(new.studio_id)
     and coalesce(current_setting('role', true), 'none') in ('authenticated', 'anon') then
    new.private_to := null;
  end if;
  if new.private_to is not null and not exists (select 1 from guardian g where g.family_id = new.family_id
                                                  and g.user_id = new.private_to and g.deleted_at is null) then
    new.private_to := null;
  end if;
  if new.inbound and new.sent_by is not null and exists (select 1 from guardian g where g.family_id = new.family_id
                                                           and g.user_id = new.sent_by and g.deleted_at is null) then
    new.private_to := new.sent_by;
  elsif new.private_to is null and new.reply_to is not null then
    select private_to into parent_private from communication where id = new.reply_to;
    new.private_to := parent_private;
  elsif new.private_to is null and new.request_id is not null then
    select r.raised_by into raiser from studio_request r where r.id = new.request_id;
    if raiser is not null and exists (select 1 from guardian g where g.family_id = new.family_id
                                        and g.user_id = raiser and g.deleted_at is null) then
      new.private_to := raiser;
    end if;
  end if;
  return new;
end $$;
create trigger communication_to_guardian before insert on communication
  for each row execute function app.communication_privacy();

create policy comm_guardian_private on communication as restrictive for select
  using (private_to is null or private_to = auth.uid() or app.is_staff(studio_id));

-- Requests a guardian raised are theirs and the office's, like messages.
create or replace function app.other_guardian_user_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select g2.user_id from guardian g join guardian g2 on g2.family_id = g.family_id
   where g.user_id = auth.uid() and g.deleted_at is null and g2.deleted_at is null
     and g2.user_id is not null and g2.user_id <> auth.uid() and not app.is_staff(g.studio_id)
$$;
create policy request_guardian_private on studio_request as restrictive for select
  using (raised_by is null or raised_by not in (select app.other_guardian_user_ids()));

-- A private message notifies only its guardian.
create or replace function app.on_communication_notify() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare fam text;
begin
  if new.request_id is not null or new.sent_at > now() + interval '1 minute' then return null; end if;
  if new.inbound and new.family_id is not null then
    select name into fam from family where id = new.family_id;
    perform app.notify_admins(new.studio_id, 'message', 'Message from the ' || fam,
      coalesce(new.subject, left(new.body, 120)), '/inbox?family=' || new.family_id);
  elsif not new.inbound and new.kind = 'direct' and new.private_to is not null then
    if not exists (select 1 from guardian g left join guardian_access a on a.guardian_id = g.id
                    where g.family_id = new.family_id and g.user_id = new.private_to and g.deleted_at is null
                      and a.may_contact is false) then
      perform app.notify_user(new.studio_id, new.private_to, 'message',
        coalesce(new.subject, 'New message from the studio'), left(new.body, 120), '/family/messages');
    end if;
  elsif not new.inbound and new.kind = 'direct' then
    perform app.notify_family(new.family_id, 'message',
      coalesce(new.subject, 'New message from the studio'), left(new.body, 120), '/family/messages');
  end if;
  return null;
end $$;

-- ── UR-17 · Office-set restrictions per guardian ───────────────────────────
create table guardian_access (
  guardian_id  uuid primary key references guardian(id) on delete cascade,
  studio_id    uuid not null references studio(id) on delete cascade,
  see_schedule boolean not null default true,
  see_payments boolean not null default true,
  see_feedback boolean not null default true,
  see_medical  boolean not null default true,
  may_contact  boolean not null default true,
  may_collect  boolean not null default true,
  -- e.g. the court order behind a restriction. Read by the safeguarding lead only.
  dsl_note     text,
  updated_by   uuid references user_account(id) on delete set null,
  updated_at   timestamptz not null default now()
);
alter table guardian_access enable row level security;
alter table guardian_access force row level security;
-- No direct policies: read and written through the functions below, so the
-- note never reaches anyone but the safeguarding lead.
grant select, insert, update, delete on guardian_access to service_role;

create or replace function app.set_guardian_access(p_guardian uuid, p_flags jsonb, p_note text default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g guardian; dsl boolean;
begin
  select * into g from guardian where id = p_guardian and deleted_at is null;
  if g.id is null or not app.is_admin(g.studio_id) then
    raise exception 'FORBIDDEN: only the office can set what a guardian sees' using errcode = 'insufficient_privilege';
  end if;
  dsl := app.is_safeguarding_lead(g.studio_id);
  insert into guardian_access (guardian_id, studio_id) values (g.id, g.studio_id) on conflict (guardian_id) do nothing;
  update guardian_access set
    see_schedule = coalesce((p_flags ->> 'see_schedule')::boolean, see_schedule),
    see_payments = coalesce((p_flags ->> 'see_payments')::boolean, see_payments),
    see_feedback = coalesce((p_flags ->> 'see_feedback')::boolean, see_feedback),
    see_medical  = coalesce((p_flags ->> 'see_medical')::boolean, see_medical),
    may_contact  = coalesce((p_flags ->> 'may_contact')::boolean, may_contact),
    may_collect  = coalesce((p_flags ->> 'may_collect')::boolean, may_collect),
    dsl_note     = case when dsl and p_note is not null then nullif(btrim(p_note), '') else dsl_note end,
    updated_by   = auth.uid(), updated_at = now()
   where guardian_id = g.id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (g.studio_id, auth.uid(), 'update', 'guardian_access', g.id, 'Access set for ' || g.full_name);
end $$;
grant execute on function app.set_guardian_access(uuid, jsonb, text) to authenticated;

-- For the office: the flags, and the note when the reader is the DSL.
create or replace function app.guardian_access_for(p_guardian uuid)
  returns table (see_schedule boolean, see_payments boolean, see_feedback boolean, see_medical boolean,
                 may_contact boolean, may_collect boolean, has_note boolean, dsl_note text, can_note boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(a.see_schedule, true), coalesce(a.see_payments, true), coalesce(a.see_feedback, true),
         coalesce(a.see_medical, true), coalesce(a.may_contact, true), coalesce(a.may_collect, true),
         a.dsl_note is not null,
         case when app.is_safeguarding_lead(g.studio_id) then a.dsl_note end,
         app.is_safeguarding_lead(g.studio_id)
    from guardian g left join guardian_access a on a.guardian_id = g.id
   where g.id = p_guardian and g.deleted_at is null and app.is_admin(g.studio_id)
$$;
grant execute on function app.guardian_access_for(uuid) to authenticated;

-- For the guardian: what this account may see (no note).
create or replace function app.my_access()
  returns table (see_schedule boolean, see_payments boolean, see_feedback boolean, see_medical boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(bool_and(a.see_schedule), true), coalesce(bool_and(a.see_payments), true),
         coalesce(bool_and(a.see_feedback), true), coalesce(bool_and(a.see_medical), true)
    from guardian g left join guardian_access a on a.guardian_id = g.id
   where g.user_id = auth.uid() and g.deleted_at is null and app.in_scope(g.studio_id)
$$;
grant execute on function app.my_access() to authenticated;

-- Families and students this caller is a restricted guardian of, per area.
create or replace function app.denied_family_ids(p_what text) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select g.family_id from guardian g join guardian_access a on a.guardian_id = g.id
   where g.user_id = auth.uid() and g.deleted_at is null and not app.is_staff(g.studio_id)
     and case p_what when 'schedule' then not a.see_schedule when 'payments' then not a.see_payments
                     when 'feedback' then not a.see_feedback when 'medical' then not a.see_medical else false end
$$;
create or replace function app.denied_student_ids(p_what text) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s where s.family_id in (select app.denied_family_ids(p_what))
$$;
create or replace function app.denied_invoice_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select i.id from invoice i where i.family_id in (select app.denied_family_ids('payments'))
$$;
grant execute on function app.denied_family_ids(text), app.denied_student_ids(text), app.denied_invoice_ids() to authenticated;

-- Restrictive policies sit on top of every read policy, whoever owns it, so
-- a restriction holds on every path. Defaults (no row) restrict nothing.
create policy invoice_guardian_access on invoice as restrictive for select
  using (family_id is null or family_id not in (select app.denied_family_ids('payments')));
create policy payment_guardian_access on payment as restrictive for select
  using (family_id is null or family_id not in (select app.denied_family_ids('payments')));
create policy invoice_item_guardian_access on invoice_item as restrictive for select
  using (invoice_id not in (select app.denied_invoice_ids()));
create policy medical_guardian_access on medical_record as restrictive for select
  using (student_id not in (select app.denied_student_ids('medical')));
do $$
declare t text;
begin
  foreach t in array array['feedback_note', 'skill_assessment', 'progress_report', 'milestone'] loop
    execute format('create policy %I on %I as restrictive for select using (student_id not in (select app.denied_student_ids(''feedback'')))',
                   t || '_guardian_access', t);
  end loop;
  foreach t in array array['enrolment', 'waitlist_entry', 'drop_in_booking', 'attendance_record'] loop
    execute format('create policy %I on %I as restrictive for select using (student_id not in (select app.denied_student_ids(''schedule'')))',
                   t || '_guardian_access', t);
  end loop;
end $$;
create policy trial_guardian_access on trial as restrictive for select
  using (student_id is null or student_id not in (select app.denied_student_ids('schedule')));

-- "May not be contacted": the studio's notifications skip them.
create or replace function app.notify_family(
  p_family uuid, p_kind text, p_title text, p_body text, p_href text)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g record;
begin
  for g in select gd.studio_id, gd.user_id from guardian gd left join guardian_access a on a.guardian_id = gd.id
            where gd.family_id = p_family and gd.user_id is not null and gd.deleted_at is null
              and a.may_contact is not false
  loop
    perform app.notify_user(g.studio_id, g.user_id, p_kind, p_title, p_body, p_href);
  end loop;
end $$;
revoke execute on function app.notify_family(uuid, text, text, text, text) from public, authenticated, anon;

-- ── UR-17 · Who may collect each child ─────────────────────────────────────
create table collection_permission (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  full_name    text not null check (length(btrim(full_name)) > 1),
  relationship text,
  phone        text,
  allowed      boolean not null default true,
  added_by     uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index collection_student on collection_permission (student_id) where deleted_at is null;
alter table collection_permission enable row level security;
alter table collection_permission force row level security;
grant select, insert, update, delete on collection_permission to authenticated, service_role;

create policy collection_admin on collection_permission for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
-- Parents keep the list of people who may collect. A "may not collect" entry
-- is the office's, and parents do not see it.
create policy collection_guardian_read on collection_permission for select
  using (deleted_at is null and allowed and student_id in (select app.guardian_student_ids()));
create policy collection_guardian_write on collection_permission for insert
  with check (allowed and student_id in (select app.guardian_student_ids()));
create policy collection_guardian_update on collection_permission for update
  using (deleted_at is null and allowed and student_id in (select app.guardian_student_ids()))
  with check (allowed and student_id in (select app.guardian_student_ids()));

create or replace function app.collection_stamp() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  select studio_id into new.studio_id from student where id = new.student_id;
  if tg_op = 'INSERT' then new.added_by := coalesce(auth.uid(), new.added_by); end if;
  new.updated_at := now();
  return new;
end $$;
create trigger collection_stamp before insert or update on collection_permission
  for each row execute function app.collection_stamp();

create or replace function app.remove_collection_person(p_id uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c collection_permission;
begin
  select * into c from collection_permission where id = p_id and deleted_at is null;
  if c.id is null or not (app.is_admin(c.studio_id) or (c.allowed and c.student_id in (select app.guardian_student_ids()))) then
    raise exception 'FORBIDDEN: not yours to remove' using errcode = 'insufficient_privilege';
  end if;
  update collection_permission set deleted_at = now() where id = c.id;
end $$;
grant execute on function app.remove_collection_person(uuid) to authenticated;

-- The collection list for the register brief: names and whether they may
-- collect, never the reason. Guardians who may not collect are listed too.
-- Staff who can see the child get both lists; a guardian gets "may collect".
create or replace function app.collection_brief(p_student uuid) returns jsonb
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare s student; staff boolean;
begin
  select * into s from student where id = p_student and deleted_at is null;
  if s.id is null then return '[]'::jsonb; end if;
  staff := app.is_admin(s.studio_id) or (app.has_role(s.studio_id, 'teacher')
           and (s.id in (select app.teacher_student_ids()) or s.id in (select app.teacher_event_student_ids())));
  if not staff and s.id not in (select app.guardian_student_ids()) then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('name', x.name, 'relationship', x.relationship, 'allowed', x.allowed)
                     order by x.allowed desc, x.name)
      from (select c.full_name as name, c.relationship, c.allowed from collection_permission c
             where c.student_id = s.id and c.deleted_at is null and (c.allowed or staff)
            union all
            select g.full_name, g.relationship, false from guardian g join guardian_access a on a.guardian_id = g.id
             where staff and g.family_id = s.family_id and g.deleted_at is null and not a.may_collect) x), '[]'::jsonb);
end $$;
grant execute on function app.collection_brief(uuid) to authenticated;

grant execute on function app.check_class_age(uuid, date, date, text, boolean), app.age_label(smallint, smallint) to authenticated, anon;
