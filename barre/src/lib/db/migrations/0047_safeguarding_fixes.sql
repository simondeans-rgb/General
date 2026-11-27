-- ============================================================================
-- 0047 · Safeguarding fixes from the end-user panel review
--   UR-08  consent: capture, withdrawal and history; most restrictive wins
--   UR-09  office and DSL raise concerns, about a child, an adult or staff
--   UR-12  retention legal hold for safeguarding records
--   UR-28  the access log counts each opening once
--   UR-29  a DSL/owner-only safeguarding export, itself logged
--   UR-38  family data requests ("ask to delete")
--   UR-41  staff checks readable by admin and DSL; gaps on Today
--   UR-58  absence as a welfare signal, opt-in per child by the DSL
--
-- Note: new enum values ('video', 'data_request') may not be used as literals
-- in this file outside plpgsql bodies, because the migration runs as one
-- transaction and Postgres refuses a value added in the same transaction.
-- Kinds are therefore passed around as text and cast when written.
-- ============================================================================

-- ── UR-08 · Consent with history ───────────────────────────────────────────
alter type consent_kind add value if not exists 'video';

-- One row per change, never overwritten: the unique (student, kind) pair
-- made history impossible, so it goes. "Current" is always derived.
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'consent_record'::regclass and contype = 'u' loop
    execute format('alter table consent_record drop constraint %I', c);
  end loop;
end $$;
alter table consent_record add column source text check (source in ('family', 'office', 'paper', 'import'));
create index consent_student_kind on consent_record (student_id, kind, granted_at desc) where deleted_at is null;

-- Direct writes are for the office only (corrections, imports). Families
-- change consent through app.set_consent, which keeps the history and alerts
-- the office when guardians disagree.
drop policy if exists consent_write on consent_record;
create policy consent_admin_write on consent_record for all
  using (deleted_at is null and app.is_admin(studio_id))
  with check (app.is_admin(studio_id));

-- The current state of one consent for one child.
--   * Every row recorded by the office (on paper, at import, at the desk) is
--     the school's settled position and supersedes what came before.
--   * After it, each guardian's own latest choice counts. If any guardian has
--     withdrawn, consent is withdrawn (most restrictive), and if guardians
--     differ the state is "disputed" so the office can follow it up.
--   * No rows at all: null, shown as "Not recorded" and treated as no consent.
-- Internal: callable only from other definer functions.
create or replace function app.consent_effective(p_student uuid, p_kind text)
  returns table (granted boolean, disputed boolean, changed_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare fam uuid; o_granted boolean; o_at timestamptz; v record; n_yes int := 0; n_no int := 0; latest timestamptz;
begin
  select s.family_id into fam from student s where s.id = p_student;
  select c.granted, c.granted_at into o_granted, o_at from consent_record c
   where c.student_id = p_student and c.kind::text = p_kind and c.deleted_at is null
     and (c.expires_at is null or c.expires_at > now())
     and (c.granted_by is null or c.granted_by not in
            (select g.user_id from guardian g where g.family_id = fam and g.user_id is not null and g.deleted_at is null))
   order by c.granted_at desc, c.created_at desc limit 1;
  for v in select distinct on (c.granted_by) c.granted_by, c.granted, c.granted_at from consent_record c
            where c.student_id = p_student and c.kind::text = p_kind and c.deleted_at is null
              and (c.expires_at is null or c.expires_at > now())
              and c.granted_by in (select g.user_id from guardian g where g.family_id = fam and g.user_id is not null and g.deleted_at is null)
              and c.granted_at > coalesce(o_at, '-infinity'::timestamptz)
            order by c.granted_by, c.granted_at desc, c.created_at desc loop
    if v.granted then n_yes := n_yes + 1; else n_no := n_no + 1; end if;
    latest := greatest(latest, v.granted_at);
  end loop;
  if n_yes + n_no = 0 then
    granted := o_granted; disputed := false; changed_at := o_at;
  else
    granted := n_no = 0; disputed := n_yes > 0 and n_no > 0; changed_at := latest;
  end if;
  return next;
end $$;

-- Who may know a child's consent: the office, the child's guardians, the
-- child, and a teacher of the child (the same people as the safety brief).
create or replace function app.can_see_consent(p_student uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from student s where s.id = p_student and s.deleted_at is null
                   and not app.is_support_viewer(s.studio_id)
                   and (app.is_admin(s.studio_id)
                        or p_student in (select app.guardian_student_ids())
                        or p_student = app.student_self_id()
                        or (app.has_role(s.studio_id, 'teacher')
                            and (p_student in (select app.teacher_student_ids())
                                 or p_student in (select app.teacher_event_student_ids())))));
$$;

create or replace function app.consent_now(p_student uuid, p_kind text) returns boolean
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.can_see_consent(p_student) then return null; end if;
  return (select e.granted from app.consent_effective(p_student, p_kind) e);
end $$;

-- The kinds a family manages in the app. Schools may rename them later.
create or replace function app.consent_kinds() returns text[]
  language sql immutable as $$ select array['photography', 'video', 'social_media'] $$;

create or replace function app.consents(p_student uuid)
  returns table (kind text, granted boolean, disputed boolean, changed_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare k text;
begin
  if not app.can_see_consent(p_student) then return; end if;
  foreach k in array app.consent_kinds() loop
    kind := k;
    select e.granted, e.disputed, e.changed_at into granted, disputed, changed_at from app.consent_effective(p_student, k) e;
    return next;
  end loop;
end $$;

-- Every change, newest first, with who made it. Office and the family only.
create or replace function app.consent_history(p_student uuid)
  returns table (kind text, granted boolean, at timestamptz, by_name text, source text, note text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select s.studio_id into sid from student s where s.id = p_student and s.deleted_at is null;
  if sid is null or app.is_support_viewer(sid) or not (app.is_admin(sid) or p_student in (select app.guardian_student_ids())
                                                       or p_student is not distinct from app.student_self_id()) then
    return;
  end if;
  return query
  select c.kind::text, c.granted, c.granted_at, coalesce(u.full_name, case when c.source = 'import' or c.note = 'Imported' then 'Import' else 'The school' end),
         coalesce(c.source, case when c.note = 'Imported' then 'import' else 'office' end), c.note
    from consent_record c left join user_account u on u.id = c.granted_by
   where c.student_id = p_student and c.deleted_at is null
   order by c.granted_at desc, c.created_at desc;
end $$;

-- A guardian (in the app) or the office (in person, on paper) records a
-- choice. Each call adds a row; withdrawal takes effect at once.
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
  label := case p_kind when 'photography' then 'Photo' when 'video' then 'Video' else 'Social media' end;
  if after_.disputed and not coalesce(before_.disputed, false) then
    perform app.notify_admins(st.studio_id, 'consent', 'Guardians disagree: ' || lower(label) || ' consent for ' || st.first_name,
      'The most restrictive choice applies until you settle it with the family.', '/people?tab=students');
  elsif src = 'family' and after_.granted is distinct from before_.granted then
    perform app.notify_admins(st.studio_id, 'consent',
      label || ' consent ' || case when after_.granted then 'given' else 'withdrawn' end || ' for ' || st.first_name || ' ' || st.last_name,
      'Teachers see the change on their next load.', '/people?tab=students');
  end if;
end $$;

-- What a teacher sees changes only in how photo consent is worked out: the
-- latest settled state, most restrictive when guardians differ. Columns are
-- unchanged (the suite asserts them).
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
        or s.id in (select app.guardian_student_ids())
        or s.id = app.student_self_id());
grant select on student_safety_brief to authenticated, service_role;

-- Show programmes follow the same rule.
create or replace function app.has_consent(p_student uuid, p_kind consent_kind) returns boolean
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  return coalesce((select e.granted from app.consent_effective(p_student, p_kind::text) e), false);
end $$;

-- ── UR-09 · Concerns from anyone on the staff, about anyone ────────────────
alter table safeguarding_concern add column subject_kind text not null default 'child'
  check (subject_kind in ('child', 'adult', 'staff'));
alter table safeguarding_concern add column subject_staff_id uuid references staff_member(id) on delete set null;
alter table safeguarding_concern add column subject_text text;
alter table safeguarding_concern add column allegation boolean not null default false;
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'safeguarding_concern'::regclass and contype = 'c'
              and pg_get_constraintdef(oid) like '%category%' loop
    execute format('alter table safeguarding_concern drop constraint %I', c);
  end loop;
end $$;
alter table safeguarding_concern add constraint safeguarding_concern_category_check
  check (category in ('wellbeing', 'injury', 'disclosure', 'behaviour', 'attendance', 'online', 'allegation', 'other'));
alter table safeguarding_access add column opening uuid;
create index safeguarding_access_opening on safeguarding_access (user_id, opening) where opening is not null;

-- The lead and the owner read concerns, except one about themselves: an
-- allegation is never visible to the member of staff it concerns, whatever
-- their role.
create or replace function app.can_read_concern(p_concern uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from safeguarding_concern c
                  where c.id = p_concern and app.is_safeguarding_lead(c.studio_id)
                    and not exists (select 1 from staff_member sm where sm.id = c.subject_staff_id and sm.user_id = auth.uid()));
$$;

create or replace function app.raise_concern_about(
  p_studio uuid, p_subject_kind text, p_student uuid, p_staff uuid, p_subject_text text,
  p_category text, p_summary text, p_immediate boolean default false) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; cid uuid; u uuid; subject_user uuid; is_alleg boolean := false; t text;
begin
  if p_subject_kind = 'child' then
    select studio_id into sid from student where id = p_student and deleted_at is null;
  elsif p_subject_kind = 'staff' then
    select studio_id, user_id into sid, subject_user from staff_member where id = p_staff and deleted_at is null;
    is_alleg := true;
  elsif p_subject_kind = 'adult' then
    sid := p_studio;
    if length(btrim(coalesce(p_subject_text, ''))) < 2 then
      raise exception 'INVALID: say who the concern is about' using errcode = 'check_violation';
    end if;
  else
    raise exception 'INVALID: unknown subject' using errcode = 'check_violation';
  end if;
  if sid is null or not app.is_staff(sid) then
    raise exception 'FORBIDDEN: staff raise concerns at their own school' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_concern (studio_id, student_id, raised_by, category, summary, immediate_risk,
                                    subject_kind, subject_staff_id, subject_text, allegation)
  values (sid, case when p_subject_kind = 'child' then p_student end, auth.uid(),
          case when is_alleg and coalesce(p_category, 'other') in ('other', 'wellbeing') then 'allegation' else coalesce(p_category, 'other') end,
          btrim(p_summary), coalesce(p_immediate, false),
          p_subject_kind, case when p_subject_kind = 'staff' then p_staff end, nullif(btrim(p_subject_text), ''), is_alleg)
  returning id into cid;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), cid, 'raised a concern');
  t := case when is_alleg then 'Allegation about a member of staff: follow the LADO process'
            when p_immediate then 'URGENT safeguarding concern raised' else 'Safeguarding concern raised' end;
  if is_alleg and p_immediate then t := 'URGENT allegation about a member of staff: follow the LADO process'; end if;
  -- The lead and the owners hear at once; the notification names nobody. The
  -- subject of an allegation is never told, so a lead who is the subject is
  -- skipped and it goes to the owner.
  for u in select distinct x from (select s.dsl_user_id x from studio s where s.id = sid
                                   union select m.user_id from membership m where m.studio_id = sid and m.role = 'owner' and m.deleted_at is null) y
            where x is not null and x is distinct from subject_user loop
    perform app.notify_user(sid, u, 'safeguarding', t, 'Open the safeguarding log to read it.', '/safeguarding');
  end loop;
  return cid;
end $$;

create or replace function app.raise_concern(p_student uuid, p_category text, p_summary text, p_immediate boolean default false)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  return app.raise_concern_about(null, 'child', p_student, null, null, p_category, p_summary, p_immediate);
end $$;

-- The log. p_opening identifies one look at the page: re-reading the list
-- after an action (same opening) is not a new look (UR-28).
drop function if exists app.safeguarding_log(uuid);
create function app.safeguarding_log(p_studio uuid, p_opening uuid default null)
  returns table (id uuid, student_name text, category text, summary text, immediate_risk boolean, status text,
                 raised_by text, created_at timestamptz, actions int, subject_kind text, subject_name text,
                 allegation boolean, student_id uuid)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  if p_opening is null or not exists (select 1 from safeguarding_access a where a.user_id = auth.uid() and a.opening = p_opening
                                                                          and a.what = 'viewed the log') then
    insert into safeguarding_access (studio_id, user_id, what, opening) values (p_studio, auth.uid(), 'viewed the log', p_opening);
  end if;
  return query
  select c.id, s.first_name || ' ' || s.last_name, c.category, c.summary, c.immediate_risk, c.status,
         coalesce(u.full_name, 'Unknown'), c.created_at, (select count(*)::int from safeguarding_action a where a.concern_id = c.id),
         c.subject_kind,
         case c.subject_kind when 'child' then s.first_name || ' ' || s.last_name
                             when 'staff' then coalesce(sm.display_name, c.subject_text, 'Member of staff')
                             else coalesce(c.subject_text, 'An adult') end,
         c.allegation, c.student_id
    from safeguarding_concern c left join student s on s.id = c.student_id left join user_account u on u.id = c.raised_by
    left join staff_member sm on sm.id = c.subject_staff_id
   where c.studio_id = p_studio
     and (sm.user_id is null or sm.user_id <> auth.uid())
   order by (c.status = 'closed'), c.immediate_risk desc, c.created_at desc;
end $$;

-- Opening a concern is logged once per opening (UR-28). The one-argument
-- form logs every call, as before.
drop function if exists app.safeguarding_actions(uuid);
create function app.safeguarding_actions(p_concern uuid, p_opening uuid default null)
  returns table (note text, status_to text, by_name text, at timestamptz)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select c.studio_id into sid from safeguarding_concern c where c.id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner can read concerns' using errcode = 'insufficient_privilege';
  end if;
  if p_opening is null or not exists (select 1 from safeguarding_access a where a.user_id = auth.uid() and a.opening = p_opening
                                                                          and a.concern_id = p_concern) then
    insert into safeguarding_access (studio_id, user_id, concern_id, what, opening) values (sid, auth.uid(), p_concern, 'opened a concern', p_opening);
  end if;
  return query select a.note, a.status_to, coalesce(u.full_name, 'Unknown'), a.at
    from safeguarding_action a left join user_account u on u.id = a.by_user where a.concern_id = p_concern order by a.at;
end $$;

create or replace function app.safeguarding_act(p_concern uuid, p_note text, p_status text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_concern where id = p_concern;
  if sid is null or not app.can_read_concern(p_concern) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner act on concerns' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_note), '') = '' then raise exception 'INVALID: record what was done' using errcode = 'check_violation'; end if;
  insert into safeguarding_action (concern_id, by_user, note, status_to) values (p_concern, auth.uid(), btrim(p_note), p_status);
  if p_status is not null then update safeguarding_concern set status = p_status, updated_at = now() where id = p_concern; end if;
  insert into safeguarding_access (studio_id, user_id, concern_id, what) values (sid, auth.uid(), p_concern, 'recorded an action');
end $$;

-- Who has looked: now for the lead as well as the owner, so each sees the
-- other's reads. Rows about a concern the viewer may not read are left out.
create or replace function app.safeguarding_access_log(p_studio uuid)
  returns table (who text, what text, concern uuid, at timestamptz)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the owner and the safeguarding lead review who has read the log' using errcode = 'insufficient_privilege';
  end if;
  return query select coalesce(u.full_name, 'Unknown'), a.what, a.concern_id, a.at from safeguarding_access a
    left join user_account u on u.id = a.user_id
   where a.studio_id = p_studio and (a.concern_id is null or app.can_read_concern(a.concern_id))
   order by a.at desc, a.id desc limit 500;
end $$;

-- Children a lead can pick for a hold or an absence watch (a lead may be a
-- teacher, who otherwise sees only their own students).
create or replace function app.safeguarding_students(p_studio uuid)
  returns table (id uuid, name text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then return; end if;
  return query select s.id, s.first_name || ' ' || s.last_name from student s
   where s.studio_id = p_studio and s.deleted_at is null and s.first_name <> 'Former' order by s.last_name, s.first_name;
end $$;

-- ── UR-12 · Legal hold ─────────────────────────────────────────────────────
create table safeguarding_hold (
  student_id  uuid primary key references student(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  reason      text not null check (length(btrim(reason)) >= 3),
  set_by      uuid references user_account(id) on delete set null,
  set_at      timestamptz not null default now()
);
alter table safeguarding_hold enable row level security; alter table safeguarding_hold force row level security;
grant all on safeguarding_hold to service_role;

create or replace function app.set_safeguarding_hold(p_student uuid, p_reason text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from student where id = p_student and deleted_at is null;
  if sid is null or not app.is_safeguarding_lead(sid) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner set a hold' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_hold (student_id, studio_id, reason, set_by) values (p_student, sid, btrim(p_reason), auth.uid())
  on conflict (student_id) do update set reason = excluded.reason, set_by = excluded.set_by, set_at = now();
  insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'placed a legal hold');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'safeguarding_hold', p_student, 'Legal hold placed');
end $$;

create or replace function app.release_safeguarding_hold(p_student uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from safeguarding_hold where student_id = p_student;
  if sid is null then return; end if;
  if not app.is_safeguarding_lead(sid) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner release a hold' using errcode = 'insufficient_privilege';
  end if;
  delete from safeguarding_hold where student_id = p_student;
  insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'released a legal hold');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'safeguarding_hold', p_student, 'Legal hold released');
end $$;

create or replace function app.safeguarding_holds(p_studio uuid)
  returns table (student_id uuid, name text, reason text, set_by text, set_at timestamptz)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner see holds' using errcode = 'insufficient_privilege';
  end if;
  return query select h.student_id, s.first_name || ' ' || s.last_name, h.reason, coalesce(u.full_name, 'Unknown'), h.set_at
    from safeguarding_hold h join student s on s.id = h.student_id left join user_account u on u.id = h.set_by
   where h.studio_id = p_studio order by h.set_at desc;
end $$;

-- Why a child's details must not be anonymised yet; null when nothing holds
-- them. Internal.
create or replace function app.retention_hold_reason(p_student uuid, p_concern_months smallint) returns text
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case
    when exists (select 1 from safeguarding_hold h where h.student_id = p_student) then 'Legal hold set by the safeguarding lead'
    when exists (select 1 from safeguarding_concern c where c.student_id = p_student and c.status <> 'closed') then 'Safeguarding concern still open'
    when exists (select 1 from safeguarding_concern c where c.student_id = p_student and c.status = 'closed'
                   and (p_concern_months is null or c.updated_at >= now() - make_interval(months => p_concern_months)))
      then 'Safeguarding record still kept'
  end;
$$;

-- As 0040, plus: a held child is listed with the reason and not anonymised;
-- a prospect family with a held child is not removed; a closed concern about
-- a child under an explicit hold is not deleted.
drop function if exists app.apply_retention(uuid, boolean);
create function app.apply_retention(p_studio uuid, p_apply boolean default false)
  returns table (step text, student_id uuid, who text, left_on date, reason text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record; held text;
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the owner runs data retention' using errcode = 'insufficient_privilege';
  end if;
  select * into pol from retention_policy where studio_id = p_studio;
  for r in select s.id, s.first_name || ' ' || s.last_name as who, app.leaver_since(s.id) as since,
                  exists (select 1 from medical_record m where m.student_id = s.id and m.deleted_at is null) as has_medical,
                  s.first_name = 'Former' as anonymised
             from student s join family f on f.id = s.family_id
            where s.studio_id = p_studio and s.deleted_at is null and not f.is_prospect loop
    continue when r.since is null;
    reason := null;
    if r.has_medical and r.since < current_date - make_interval(months => pol.medical_months) then
      step := 'medical'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from medical_record where medical_record.student_id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'medical_record', r.id, 'Medical record deleted: left ' || r.since);
      end if;
    end if;
    if not r.anonymised and r.since < current_date - make_interval(months => pol.personal_months) then
      held := app.retention_hold_reason(r.id, pol.concern_months);
      if held is not null then
        step := 'held'; student_id := r.id; who := r.who; left_on := r.since; reason := held; return next;
        reason := null;
        continue;
      end if;
      step := 'anonymise'; student_id := r.id; who := r.who; left_on := r.since; return next;
      if p_apply then
        delete from emergency_contact where emergency_contact.student_id = r.id;
        delete from consent_record where consent_record.student_id = r.id;
        delete from student_reflection where student_reflection.student_id = r.id;
        delete from welfare_watch where welfare_watch.student_id = r.id;
        update feedback_note set private_note = null, going_well = null, work_on = null where feedback_note.student_id = r.id;
        update student set first_name = 'Former', last_name = 'student',
               date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1), user_id = null, login_enabled = false,
               updated_at = now() where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'student', r.id, 'Details anonymised: left ' || r.since);
      end if;
    end if;
  end loop;
  reason := null;

  for r in select e.id, e.child_name, e.contact_name, greatest(e.updated_at, (select max(cs.starts_at) from trial t
                  join class_session cs on cs.id = t.session_id where t.enquiry_id = e.id))::date last_seen
             from enquiry e where e.studio_id = p_studio and e.deleted_at is null and e.stage <> 'enrolled' loop
    continue when r.last_seen >= current_date - pol.prospect_days;
    step := 'prospect'; student_id := null; who := coalesce(r.child_name, r.contact_name); left_on := r.last_seen; return next;
    if p_apply then
      delete from enquiry where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'enquiry', r.id, 'Enquiry removed: no activity since ' || r.last_seen);
    end if;
  end loop;
  for r in select f.id, f.name, f.created_at::date made from family f
            where f.studio_id = p_studio and f.deleted_at is null and f.is_prospect
              and f.created_at < now() - make_interval(days => pol.prospect_days)
              and not exists (select 1 from student s join trial t on t.student_id = s.id join class_session cs on cs.id = t.session_id
                               where s.family_id = f.id and cs.starts_at > now() - make_interval(days => pol.prospect_days))
              and not exists (select 1 from invoice i where i.family_id = f.id and i.deleted_at is null)
              and not exists (select 1 from student s where s.family_id = f.id
                                and app.retention_hold_reason(s.id, pol.concern_months) is not null) loop
    step := 'prospect'; student_id := null; who := r.name; left_on := r.made; return next;
    if p_apply then
      delete from emergency_contact where emergency_contact.student_id in (select id from student where family_id = r.id);
      delete from medical_record where medical_record.student_id in (select id from student where family_id = r.id);
      update student set first_name = 'Former', last_name = 'prospect', date_of_birth = make_date(extract(year from date_of_birth)::int, 1, 1),
             deleted_at = now() where family_id = r.id;
      update guardian set full_name = 'Former prospect', email = null, phone = null, user_id = null, deleted_at = now() where family_id = r.id;
      update family set name = 'Former prospect', address_line1 = null, address_line2 = null, city = null, postcode = null,
             notes = null, deleted_at = now() where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Prospect record removed');
    end if;
  end loop;

  for r in select f.id, f.name, (select max(coalesce(i.issued_on, i.created_at::date)) from invoice i where i.family_id = f.id) last_inv
             from family f where f.studio_id = p_studio and f.deleted_at is null and not f.is_prospect and f.name <> 'Former family'
              and exists (select 1 from student s where s.family_id = f.id)
              and not exists (select 1 from student s where s.family_id = f.id and s.deleted_at is null and s.first_name <> 'Former') loop
    continue when r.last_inv is not null and r.last_inv >= current_date - make_interval(months => pol.financial_months);
    step := 'financial'; student_id := null; who := r.name; left_on := r.last_inv; return next;
    if p_apply then
      update guardian set full_name = 'Former guardian', email = null, phone = null, user_id = null where family_id = r.id;
      update family set name = 'Former family', address_line1 = null, address_line2 = null, city = null, postcode = null, notes = null
       where id = r.id;
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'family', r.id, 'Family details anonymised; invoices kept');
    end if;
  end loop;

  if pol.concern_months is not null then
    for r in select c.id, c.updated_at::date closed from safeguarding_concern c
              where c.studio_id = p_studio and c.status = 'closed'
                and c.updated_at < now() - make_interval(months => pol.concern_months)
                and not exists (select 1 from safeguarding_hold h where h.student_id = c.student_id) loop
      step := 'concern'; student_id := null; who := 'Closed concern'; left_on := r.closed; return next;
      if p_apply then
        delete from safeguarding_concern where id = r.id;
        insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
        values (p_studio, auth.uid(), 'retention', 'safeguarding_concern', r.id, 'Closed concern deleted: closed ' || r.closed);
      end if;
    end loop;
  end if;

  if p_apply then update retention_policy set last_run_at = now() where studio_id = p_studio; end if;
end $$;

-- ── UR-41 · Staff checks for the lead and the office ───────────────────────
-- The owner still records them; admins and the lead can read them.
create policy staff_check_read on staff_check for select
  using (deleted_at is null and (app.is_admin(studio_id) or app.is_safeguarding_lead(studio_id)));

-- Each active member of staff, their current DBS and anything due within 30
-- days. issue is null when nothing needs doing. Owner, admin and lead.
create or replace function app.staff_check_summary(p_studio uuid)
  returns table (staff_id uuid, name text, dbs_expires date, issue text, due date)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not (app.is_admin(p_studio) or app.is_safeguarding_lead(p_studio)) then return; end if;
  return query
  with latest as (
    select distinct on (k.staff_id, k.kind) k.staff_id, k.kind, k.checked_on, k.expires_on
      from staff_check k where k.studio_id = p_studio and k.deleted_at is null
     order by k.staff_id, k.kind, k.checked_on desc, k.created_at desc)
  select sm.id, sm.display_name, d.expires_on,
         case when d.staff_id is null then 'No DBS on file'
              when d.expires_on is not null and d.expires_on < current_date then 'DBS expired'
              when soon.kind is not null then
                case when soon.expires_on < current_date then 'Expired: ' else 'Expires soon: ' end ||
                case soon.kind when 'dbs' then 'DBS' when 'safeguarding_training' then 'safeguarding training'
                               when 'first_aid' then 'first aid' else 'a check' end
         end,
         coalesce(case when d.expires_on < current_date then d.expires_on end, soon.expires_on)
    from staff_member sm
    left join latest d on d.staff_id = sm.id and d.kind = 'dbs'
    left join lateral (select l.kind, l.expires_on from latest l where l.staff_id = sm.id and l.expires_on is not null
                         and l.expires_on <= current_date + 30 order by l.expires_on limit 1) soon on true
   where sm.studio_id = p_studio and sm.deleted_at is null and sm.status = 'active'
   order by (d.staff_id is null) desc, coalesce(soon.expires_on, d.expires_on) nulls last, sm.display_name;
end $$;

-- The reminder now reaches the lead as well as the owner.
create or replace function app.remind_staff_checks(p_studio uuid) returns int
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare c record; n int := 0; u uuid;
begin
  if auth.uid() is not null and not app.is_staff(p_studio) then return 0; end if;
  for c in select k.*, sm.display_name from staff_check k join staff_member sm on sm.id = k.staff_id and sm.deleted_at is null and sm.status = 'active'
            where k.studio_id = p_studio and k.deleted_at is null and k.reminded_at is null
              and k.expires_on is not null and k.expires_on <= current_date + 30
              and not exists (select 1 from staff_check newer where newer.staff_id = k.staff_id and newer.kind = k.kind
                                and newer.deleted_at is null and newer.checked_on > k.checked_on) loop
    for u in select distinct x from (select m.user_id x from membership m where m.studio_id = p_studio and m.role = 'owner' and m.deleted_at is null
                                     union select s.dsl_user_id from studio s where s.id = p_studio) y where x is not null loop
      perform app.notify_user(p_studio, u, 'staff_check_due',
        case when c.expires_on < current_date then 'Expired: ' else 'Due soon: ' end || c.display_name || '’s ' ||
        replace(case c.kind when 'dbs' then 'DBS check' else c.kind end, '_', ' '),
        'Expires ' || to_char(c.expires_on, 'FMDD Month YYYY'), '/people?tab=staff');
    end loop;
    update staff_check set reminded_at = now() where id = c.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ── UR-58 · Absence as a welfare signal ────────────────────────────────────
-- Opt-in per child, by the lead: only watched children are looked at.
create table welfare_watch (
  student_id  uuid primary key references student(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  note        text,
  set_by      uuid references user_account(id) on delete set null,
  set_at      timestamptz not null default now()
);
alter table welfare_watch enable row level security; alter table welfare_watch force row level security;
grant all on welfare_watch to service_role;

create or replace function app.set_welfare_watch(p_student uuid, p_on boolean, p_note text default null) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from student where id = p_student and deleted_at is null;
  if sid is null or not app.is_safeguarding_lead(sid) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner watch attendance' using errcode = 'insufficient_privilege';
  end if;
  if p_on then
    insert into welfare_watch (student_id, studio_id, note, set_by) values (p_student, sid, nullif(btrim(p_note), ''), auth.uid())
    on conflict (student_id) do update set note = excluded.note;
    insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'started watching a child’s attendance');
  else
    delete from welfare_watch where student_id = p_student;
    insert into safeguarding_access (studio_id, user_id, what) values (sid, auth.uid(), 'stopped watching a child’s attendance');
  end if;
end $$;

-- For each watched child: how many of their most recent sessions in a row
-- were missed without explanation ('absent'; 'excused' breaks the run).
create or replace function app.welfare_absences(p_studio uuid)
  returns table (student_id uuid, name text, note text, streak int, last_absent date, last_present date)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner see this' using errcode = 'insufficient_privilege';
  end if;
  return query
  select w.student_id, s.first_name || ' ' || s.last_name, w.note,
         coalesce((select count(*)::int from (
                     select ar.status, row_number() over (order by cs.starts_at desc) rn
                       from attendance_record ar join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
                      where ar.student_id = w.student_id and ar.deleted_at is null and cs.starts_at < now()) m
                   where m.status = 'absent'
                     and m.rn < coalesce((select min(m2.rn) from (
                            select ar.status, row_number() over (order by cs.starts_at desc) rn
                              from attendance_record ar join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
                             where ar.student_id = w.student_id and ar.deleted_at is null and cs.starts_at < now()) m2
                          where m2.status <> 'absent'), 2147483647)), 0),
         (select max(cs.starts_at)::date from attendance_record ar join class_session cs on cs.id = ar.session_id
           where ar.student_id = w.student_id and ar.deleted_at is null and ar.status = 'absent'),
         (select max(cs.starts_at)::date from attendance_record ar join class_session cs on cs.id = ar.session_id
           where ar.student_id = w.student_id and ar.deleted_at is null and ar.status in ('present', 'late'))
    from welfare_watch w join student s on s.id = w.student_id and s.deleted_at is null
   where w.studio_id = p_studio
   order by 4 desc, 2;
end $$;

-- ── UR-29 · Safeguarding export ────────────────────────────────────────────
-- For the lead and the owner only; an admin who is not the lead is refused.
-- The export is itself recorded in the access log and the audit trail.
create or replace function app.safeguarding_export(p_studio uuid) returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare out jsonb;
begin
  if not app.is_safeguarding_lead(p_studio) then
    raise exception 'FORBIDDEN: only the safeguarding lead and the owner export safeguarding records' using errcode = 'insufficient_privilege';
  end if;
  insert into safeguarding_access (studio_id, user_id, what) values (p_studio, auth.uid(), 'exported the safeguarding record');
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), 'export', 'safeguarding', p_studio, 'Safeguarding record exported');
  select jsonb_build_object(
    'exported_at', now(),
    'exported_by', (select full_name from user_account where id = auth.uid()),
    'concerns', coalesce((select jsonb_agg(jsonb_build_object(
        'id', c.id, 'created_at', c.created_at, 'status', c.status, 'category', c.category, 'immediate_risk', c.immediate_risk,
        'subject_kind', c.subject_kind, 'allegation', c.allegation,
        'child', case when s.id is not null then s.first_name || ' ' || s.last_name end, 'child_id', c.student_id,
        'staff_member', sm.display_name, 'subject_text', c.subject_text,
        'summary', c.summary, 'raised_by', ru.full_name,
        'actions', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'by', au.full_name, 'note', a.note, 'status_to', a.status_to) order by a.at)
                               from safeguarding_action a left join user_account au on au.id = a.by_user where a.concern_id = c.id), '[]'::jsonb))
        order by c.created_at)
      from safeguarding_concern c left join student s on s.id = c.student_id left join staff_member sm on sm.id = c.subject_staff_id
      left join user_account ru on ru.id = c.raised_by
     where c.studio_id = p_studio and (sm.user_id is null or sm.user_id <> auth.uid())), '[]'::jsonb),
    'staff_checks', coalesce((select jsonb_agg(jsonb_build_object('staff_member', sm.display_name, 'kind', k.kind, 'reference', k.reference,
        'checked_on', k.checked_on, 'expires_on', k.expires_on, 'note', k.note) order by sm.display_name, k.checked_on)
      from staff_check k join staff_member sm on sm.id = k.staff_id where k.studio_id = p_studio and k.deleted_at is null), '[]'::jsonb),
    'legal_holds', coalesce((select jsonb_agg(jsonb_build_object('child', s.first_name || ' ' || s.last_name, 'reason', h.reason, 'set_at', h.set_at))
      from safeguarding_hold h join student s on s.id = h.student_id where h.studio_id = p_studio), '[]'::jsonb),
    'access_log', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'who', u.full_name, 'what', a.what, 'concern_id', a.concern_id) order by a.at, a.id)
      from safeguarding_access a left join user_account u on u.id = a.user_id
     where a.studio_id = p_studio and (a.concern_id is null or app.can_read_concern(a.concern_id))), '[]'::jsonb),
    'audit_log', coalesce((select jsonb_agg(jsonb_build_object('at', l.at, 'who', u.full_name, 'action', l.action, 'entity', l.entity,
        'entity_id', l.entity_id, 'summary', l.summary) order by l.at, l.id)
      from audit_log l left join user_account u on u.id = l.actor_id where l.studio_id = p_studio), '[]'::jsonb)
  ) into out;
  return out;
end $$;

-- ── UR-38 · "Ask to delete" ────────────────────────────────────────────────
alter type request_kind add value if not exists 'data_request';

create or replace function app.request_family_erasure(p_note text default null) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare f record; rid uuid;
begin
  select fm.id, fm.studio_id into f from family fm where fm.id in (select app.guardian_family_ids()) and fm.deleted_at is null limit 1;
  if f.id is null then raise exception 'FORBIDDEN: only a parent or carer can ask' using errcode = 'insufficient_privilege'; end if;
  insert into studio_request (studio_id, family_id, kind, subject, body, raised_by)
  values (f.studio_id, f.id, 'data_request'::text::request_kind, 'Please delete our family’s data',
          coalesce(nullif(btrim(p_note), '') || E'\n\n', '') ||
          'Asked from the Privacy page. Reply within one month. Some records must be kept for a set time (invoices for six years; '
          || 'safeguarding records as the school’s policy requires); everything else should be deleted or anonymised.',
          auth.uid())
  returning id into rid;
  perform app.notify_admins(f.studio_id, 'request', 'A family asked for their data to be deleted', 'Reply within one month.', '/requests');
  return rid;
end $$;

-- ── Grants ─────────────────────────────────────────────────────────────────
revoke all on function app.consent_effective(uuid, text), app.retention_hold_reason(uuid, smallint) from public;
revoke all on function app.can_see_consent(uuid), app.consent_now(uuid, text), app.consents(uuid), app.consent_history(uuid),
  app.set_consent(uuid, text, boolean, text, boolean), app.has_consent(uuid, consent_kind),
  app.can_read_concern(uuid), app.raise_concern_about(uuid, text, uuid, uuid, text, text, text, boolean), app.raise_concern(uuid, text, text, boolean),
  app.safeguarding_log(uuid, uuid), app.safeguarding_actions(uuid, uuid), app.safeguarding_act(uuid, text, text), app.safeguarding_access_log(uuid),
  app.safeguarding_students(uuid), app.set_safeguarding_hold(uuid, text), app.release_safeguarding_hold(uuid), app.safeguarding_holds(uuid),
  app.apply_retention(uuid, boolean), app.staff_check_summary(uuid), app.remind_staff_checks(uuid),
  app.set_welfare_watch(uuid, boolean, text), app.welfare_absences(uuid), app.safeguarding_export(uuid), app.request_family_erasure(text) from public;
grant execute on function app.can_see_consent(uuid), app.consent_now(uuid, text), app.consent_kinds(), app.consents(uuid), app.consent_history(uuid),
  app.set_consent(uuid, text, boolean, text, boolean), app.has_consent(uuid, consent_kind),
  app.can_read_concern(uuid), app.raise_concern_about(uuid, text, uuid, uuid, text, text, text, boolean), app.raise_concern(uuid, text, text, boolean),
  app.safeguarding_log(uuid, uuid), app.safeguarding_actions(uuid, uuid), app.safeguarding_act(uuid, text, text), app.safeguarding_access_log(uuid),
  app.safeguarding_students(uuid), app.set_safeguarding_hold(uuid, text), app.release_safeguarding_hold(uuid), app.safeguarding_holds(uuid),
  app.apply_retention(uuid, boolean), app.staff_check_summary(uuid), app.remind_staff_checks(uuid),
  app.set_welfare_watch(uuid, boolean, text), app.welfare_absences(uuid), app.safeguarding_export(uuid), app.request_family_erasure(text) to authenticated;
