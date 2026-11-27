-- ============================================================================
-- 0053 · Accounts: finishing round-1 items (UR-21, UR-08, UR-55, UR-17)
-- ----------------------------------------------------------------------------
--   UR-55  "no own login under 13" is a database rule, not a default: the
--          school's minimum age is held to 13–18, and no invitation, account
--          link or approval can give an under-13 their own login.
--   UR-17  a guardian the office has restricted from medical details sees
--          none, on every path: the family screens, the safety brief view,
--          the privacy download (which reads the same tables), and medical
--          update requests about the child.
--   UR-21  an existing parent can "Book for myself": their own adult
--          participant record is made (or reused) without touching their
--          children. A restriction on a family never hides an adult's own
--          record from that adult.
--   UR-08  schools rename consent kinds and edit their plain explanations
--          (labels only; the kinds stay photography / video / social media),
--          and a student of 13 or over sees their own consents, read-only.
-- ============================================================================

-- ── UR-55 · No own login under 13, whatever the setting ────────────────────
do $$ declare c text; begin
  for c in select conname from pg_constraint
            where conrelid = 'studio'::regclass and contype = 'c'
              and pg_get_constraintdef(oid) like '%student_login_min_age%' loop
    execute format('alter table studio drop constraint %I', c);
  end loop;
end $$;
update studio set student_login_min_age = 13 where student_login_min_age < 13;
alter table studio alter column student_login_min_age set default 13;
alter table studio add constraint studio_student_login_min_age_range
  check (student_login_min_age between 13 and 18);

-- The guard on the student row. As before (0010) a login needs an account,
-- an approving guardian and the school's minimum age; now the age floor is 13
-- regardless, and an under-13 cannot even be linked to an account.
create or replace function app.check_student_login() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare min_age smallint; age_years integer;
begin
  age_years := extract(year from age(current_date, new.date_of_birth));
  if new.user_id is not null and not coalesce(new.is_adult, false) and age_years < 13
     and (tg_op = 'INSERT' or old.user_id is distinct from new.user_id or new.login_enabled) then
    raise exception 'STUDENT_LOGIN_TOO_YOUNG: % is % — students have their own login from 13; until then a parent or carer manages everything',
      new.first_name, age_years using errcode = 'check_violation';
  end if;
  if not new.login_enabled then
    return new;
  end if;
  if new.user_id is null then
    raise exception 'STUDENT_LOGIN_NO_ACCOUNT: enable a login only once an account exists'
      using errcode = 'check_violation';
  end if;
  if new.login_approved_by is null then
    raise exception 'STUDENT_LOGIN_UNAPPROVED: a guardian must approve this login'
      using errcode = 'check_violation';
  end if;
  select greatest(coalesce(student_login_min_age, 13), 13) into min_age from studio where id = new.studio_id;
  if age_years < coalesce(min_age, 13) and not coalesce(new.is_adult, false) then
    raise exception 'STUDENT_LOGIN_TOO_YOUNG: % is % and the studio requires %',
      new.first_name, age_years, min_age using errcode = 'check_violation';
  end if;
  if new.login_approved_at is null then new.login_approved_at := now(); end if;
  return new;
end $$;

-- No invitation to a login for an under-13, from the office or a parent.
create or replace function app.check_student_invitation() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s student; min_age int;
begin
  if new.role <> 'student' or new.student_id is null then return new; end if;
  select * into s from student where id = new.student_id;
  if s.id is null or s.is_adult then return new; end if;
  select greatest(coalesce(student_login_min_age, 13), 13) into min_age from studio where id = s.studio_id;
  if extract(year from age(current_date, s.date_of_birth)) < min_age then
    raise exception 'INVALID: % is under %, so has no login of their own — a parent or carer manages things for them',
      s.first_name, min_age using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists studio_invitation_student_age on studio_invitation;
create trigger studio_invitation_student_age before insert on studio_invitation
  for each row execute function app.check_student_invitation();

-- ── UR-17 / UR-21 · Restrictions never hide an adult's own record ──────────
create or replace function app.denied_student_ids(p_what text) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.family_id in (select app.denied_family_ids(p_what))
     and not exists (select 1 from guardian g where g.id = s.self_guardian_id and g.user_id = auth.uid())
$$;

-- ── UR-17 · Medical restriction on every path ──────────────────────────────
-- The medical record itself: reading and writing (a restricted guardian
-- cannot overwrite what they may not see). Replaces the read-only policy
-- from 0046 with one covering every command.
drop policy if exists medical_guardian_access on medical_record;
create policy medical_guardian_access on medical_record as restrictive for all
  using (student_id not in (select app.denied_student_ids('medical')))
  with check (student_id not in (select app.denied_student_ids('medical')));

-- Medical update requests about the child, other than the guardian's own.
drop policy if exists request_guardian_medical on studio_request;
create policy request_guardian_medical on studio_request as restrictive for select
  using (kind <> 'medical_update' or student_id is null or raised_by = auth.uid()
         or student_id not in (select app.denied_student_ids('medical')));

-- The safety brief view runs as its owner, so row level security on
-- medical_record does not reach it: the guardian path checks the restriction
-- itself. Columns unchanged from 0047.
create or replace view student_safety_brief
  with (security_invoker = false) as
select s.id as student_id,
       s.studio_id,
       s.first_name,
       s.last_name,
       m.allergies,
       m.action_plan,
       m.requires_alert,
       (select ec.full_name from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_name,
       (select ec.phone from emergency_contact ec
         where ec.student_id = s.id and ec.deleted_at is null
         order by ec.priority limit 1) as emergency_contact_phone,
       m.conditions,
       m.medications,
       coalesce(m.requires_alert, false)
         or coalesce(nullif(btrim(m.allergies), ''), nullif(btrim(m.conditions), ''),
                     nullif(btrim(m.medications), ''), nullif(btrim(m.action_plan), '')) is not null
         as has_medical_need,
       coalesce((select jsonb_agg(jsonb_build_object(
                   'name', ec.full_name, 'relationship', ec.relationship, 'phone', ec.phone)
                   order by ec.priority, ec.created_at)
                  from emergency_contact ec where ec.student_id = s.id and ec.deleted_at is null),
                '[]'::jsonb) as emergency_contacts,
       app.consent_now(s.id, 'photography') as photo_consent
  from student s
  left join medical_record m on m.student_id = s.id and m.deleted_at is null
 where s.deleted_at is null
   and not app.is_support_viewer(s.studio_id)
   and (app.is_admin(s.studio_id)
        or (app.has_role(s.studio_id, 'teacher')
            and (s.id in (select app.teacher_student_ids())
                 or s.id in (select app.teacher_event_student_ids())))
        or (s.id in (select app.guardian_student_ids())
            and s.id not in (select app.denied_student_ids('medical')))
        or s.id = app.student_self_id());
grant select on student_safety_brief to authenticated, service_role;

-- ── UR-21 · "Book for myself" for a parent already on the books ────────────
-- Makes (or finds) the signed-in guardian's own adult participant record in
-- their family, with someone to ring in an emergency (bookings need one).
-- Nothing about their children is read or changed.
create or replace function app.book_for_myself(p_dob date default null, p_adult_confirm boolean default false,
                                               p_emergency_name text default null, p_emergency_phone text default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g guardian; kid uuid;
begin
  select * into g from guardian
   where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id) and app.studio_writable(studio_id)
   order by created_at limit 1;
  if g.id is null then
    raise exception 'FORBIDDEN: only a parent or adult student on the school''s books can book for themselves'
      using errcode = 'insufficient_privilege';
  end if;
  select id into kid from student where self_guardian_id = g.id and deleted_at is null;
  if kid is null then
    if p_dob is not null and (p_dob > current_date or p_dob < current_date - interval '110 years') then
      raise exception 'INVALID: please check your date of birth' using errcode = 'check_violation';
    end if;
    if p_dob is not null and extract(year from age(current_date, p_dob)) < 18 then
      raise exception 'INVALID: booking for yourself is for adults (18 and over)' using errcode = 'check_violation';
    end if;
    if p_dob is null and not coalesce(p_adult_confirm, false) then
      raise exception 'INVALID: please confirm you are 18 or over, or give your date of birth' using errcode = 'check_violation';
    end if;
    kid := app.adult_participant_for(g.id, p_dob, p_emergency_name, p_emergency_phone);
    insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
    values (g.studio_id, auth.uid(), 'create', 'student', kid, g.full_name || ' added themselves as an adult student');
  elsif coalesce(btrim(p_emergency_phone), '') <> ''
        and not exists (select 1 from emergency_contact where student_id = kid and deleted_at is null) then
    insert into emergency_contact (studio_id, student_id, full_name, phone, priority)
    values (g.studio_id, kid, coalesce(nullif(btrim(p_emergency_name), ''), 'Emergency contact'), btrim(p_emergency_phone), 1);
  end if;
  return kid;
end $$;
revoke all on function app.book_for_myself(date, boolean, text, text) from public, anon;
grant execute on function app.book_for_myself(date, boolean, text, text) to authenticated;

-- ── UR-08 · Schools name their consents ────────────────────────────────────
create table if not exists consent_label (
  studio_id   uuid not null references studio(id) on delete cascade,
  kind        text not null check (kind in ('photography', 'video', 'social_media')),
  label       text not null check (length(btrim(label)) between 1 and 60),
  description text check (description is null or length(description) <= 400),
  updated_by  uuid references user_account(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (studio_id, kind)
);
alter table consent_label enable row level security;
alter table consent_label force row level security;
-- Read and written through the functions below.
grant select, insert, update, delete on consent_label to service_role;

create or replace function app.default_consent_label(p_kind text, out label text, out description text)
  language sql immutable as $$
  select case p_kind when 'photography' then 'Photos' when 'video' then 'Video' else 'Social media and public use' end,
         case p_kind
           when 'photography' then 'Photos taken in class or at shows, used by the school (noticeboards, records, programmes).'
           when 'video' then 'Video recorded in class or at shows, for teaching and for families of the class.'
           else 'Photos or video on the school’s website, social media, posters or in the press.' end
$$;

-- The school's words for each kind. Anyone in the school (staff, families,
-- students) may read them: they are the labels on screens, nothing more.
-- Which school: the student's, if given; else the one asked for; else the
-- caller's current school.
create or replace function app.consent_labels(p_studio uuid default null, p_student uuid default null)
  returns table (kind text, label text, description text, renamed boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare sid uuid; k text;
begin
  if p_student is not null then
    if not app.can_see_consent(p_student) then return; end if;
    select s.studio_id into sid from student s where s.id = p_student;
  elsif p_studio is not null then
    if p_studio not in (select app.studio_ids())
       and not exists (select 1 from guardian g where g.user_id = auth.uid() and g.studio_id = p_studio and g.deleted_at is null)
       and not exists (select 1 from student s where s.id = app.student_self_id() and s.studio_id = p_studio) then
      return;
    end if;
    sid := p_studio;
  else
    sid := coalesce((select x from app.studio_ids() x limit 1),
                    (select g.studio_id from guardian g where g.user_id = auth.uid() and g.deleted_at is null
                        and app.in_scope(g.studio_id) order by g.created_at limit 1),
                    (select s.studio_id from student s where s.id = app.student_self_id()));
    if sid is null then return; end if;
  end if;
  foreach k in array app.consent_kinds() loop
    return query
    select k, coalesce(l.label, d.label), coalesce(nullif(btrim(l.description), ''), d.description), l.kind is not null
      from app.default_consent_label(k) d
      left join consent_label l on l.studio_id = sid and l.kind = k;
  end loop;
end $$;
grant execute on function app.consent_labels(uuid, uuid), app.default_consent_label(text) to authenticated;

-- The office renames a kind or rewrites its explanation. An empty label goes
-- back to the standard wording.
create or replace function app.set_consent_label(p_studio uuid, p_kind text, p_label text, p_description text default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_admin(p_studio) or app.is_support_viewer(p_studio) then
    raise exception 'FORBIDDEN: only the office can change consent wording' using errcode = 'insufficient_privilege';
  end if;
  if not (p_kind = any(app.consent_kinds())) then
    raise exception 'INVALID: unknown consent' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_label), '') = '' then
    delete from consent_label where studio_id = p_studio and kind = p_kind;
  else
    if length(btrim(p_label)) > 60 then
      raise exception 'INVALID: keep the name to 60 characters' using errcode = 'check_violation';
    end if;
    if length(coalesce(p_description, '')) > 400 then
      raise exception 'INVALID: keep the explanation to 400 characters' using errcode = 'check_violation';
    end if;
    insert into consent_label (studio_id, kind, label, description, updated_by)
    values (p_studio, p_kind, btrim(p_label), nullif(btrim(p_description), ''), auth.uid())
    on conflict (studio_id, kind) do update
      set label = excluded.label, description = excluded.description, updated_by = auth.uid(), updated_at = now();
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'update', 'studio', p_studio,
          'Consent wording for ' || p_kind || ': ' || coalesce(nullif(btrim(p_label), ''), 'standard'));
end $$;
grant execute on function app.set_consent_label(uuid, text, text, text) to authenticated;

-- set_consent as in 0047; the office alert now uses the school's own name
-- for the kind when it has one.
create or replace function app.set_consent(p_student uuid, p_kind text, p_granted boolean, p_note text default null, p_paper boolean default false)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare st record; src text; before_ record; after_ record; label text;
begin
  select s.id, s.studio_id, s.first_name, s.last_name into st from student s where s.id = p_student and s.deleted_at is null;
  if st.id is null then raise exception 'FORBIDDEN: not your child' using errcode = 'insufficient_privilege'; end if;
  if p_student in (select app.guardian_student_ids()) then src := 'family';
  elsif app.is_admin(st.studio_id) and not app.is_support_viewer(st.studio_id) then src := case when p_paper then 'paper' else 'office' end;
  else raise exception 'FORBIDDEN: only the child''s guardians or the office record consent' using errcode = 'insufficient_privilege';
  end if;
  if p_granted is null then raise exception 'INVALID: say whether consent is given' using errcode = 'check_violation'; end if;
  if not (p_kind = any(app.consent_kinds())) then raise exception 'INVALID: unknown consent' using errcode = 'check_violation'; end if;
  select * into before_ from app.consent_effective(p_student, p_kind);
  insert into consent_record (studio_id, student_id, kind, granted, granted_by, granted_at, note, source)
  values (st.studio_id, p_student, p_kind::consent_kind, p_granted, auth.uid(), clock_timestamp(), nullif(btrim(p_note), ''), src);
  select * into after_ from app.consent_effective(p_student, p_kind);
  label := coalesce((select l.label from consent_label l where l.studio_id = st.studio_id and l.kind = p_kind),
                    case p_kind when 'photography' then 'Photo' when 'video' then 'Video' else 'Social media' end);
  if after_.disputed and not coalesce(before_.disputed, false) then
    perform app.notify_admins(st.studio_id, 'consent', 'Guardians disagree: ' || lower(label) || ' consent for ' || st.first_name,
      'The most restrictive choice applies until you settle it with the family.', '/people?tab=students');
  elsif src = 'family' and after_.granted is distinct from before_.granted then
    perform app.notify_admins(st.studio_id, 'consent',
      label || ' consent ' || case when after_.granted then 'given' else 'withdrawn' end || ' for ' || st.first_name || ' ' || st.last_name,
      'Teachers see the change on their next load.', '/people?tab=students');
  end if;
end $$;

-- ── UR-08 · A student of 13+ sees their own consents, read-only ────────────
-- With who to ask to change them: their parents or carers, then the office.
create or replace function app.my_consents()
  returns table (kind text, label text, description text, granted boolean, disputed boolean,
                 changed_at timestamptz, ask text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare s student; who text;
begin
  select * into s from student st where st.id = app.student_self_id();
  if s.id is null or extract(year from age(current_date, s.date_of_birth)) < 13 then return; end if;
  select string_agg(g.full_name, ' or ' order by g.is_primary desc, g.full_name) into who
    from guardian g where g.family_id = s.family_id and g.deleted_at is null
     and g.id is distinct from s.self_guardian_id;
  return query
  select l.kind, l.label, l.description, e.granted, e.disputed, e.changed_at,
         case when s.is_adult then 'the school office'
              when who is null then 'your parent or carer, or the school office'
              else who || ', or the school office' end
    from app.consent_labels(null, s.id) l
    cross join lateral app.consent_effective(s.id, l.kind) e;
end $$;
grant execute on function app.my_consents() to authenticated;
