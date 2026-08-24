-- ============================================================================
-- 0006 · Row level security
-- ----------------------------------------------------------------------------
-- Model
--   * every query runs as the `authenticated` role, never as a table owner
--   * FORCE row level security so even the owning role is subject to policy —
--     without it the browser demo (which owns its own database) would silently
--     bypass every rule here and prove nothing
--   * access resolves through membership; there is no "current studio" global,
--     so a user with two studios cannot leak one into the other
--   * helper functions are SECURITY DEFINER with a pinned search_path. They
--     read only the caller's own rows, and exist so a policy is one indexed
--     lookup rather than a correlated join evaluated per row
-- ============================================================================

-- NOTE ON `for all` WRITE POLICIES
-- Permissive policies are OR-ed, and `for all` covers SELECT too. A write
-- policy whose USING clause omitted `deleted_at is null` therefore re-exposed
-- soft-deleted rows through the back door, regardless of what the read policy
-- said. USING is evaluated against the OLD row, so adding the condition here
-- closes that hole while still allowing a row to be soft-deleted.
-- (A RESTRICTIVE select policy looks tidier but cannot be used: Postgres
-- applies it to the NEW row on UPDATE, which makes soft deletion impossible.)

create or replace function app.memberships()
  returns table (studio_id uuid, role app_role)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select m.studio_id, m.role
    from membership m
   where m.user_id = auth.uid() and m.deleted_at is null
$$;

create or replace function app.studio_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct studio_id from app.memberships()
$$;

create or replace function app.has_role(p_studio uuid, variadic p_roles app_role[])
  returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from app.memberships() m
                  where m.studio_id = p_studio and m.role = any(p_roles))
$$;

create or replace function app.is_admin(p_studio uuid) returns boolean
  language sql stable as $$ select app.has_role(p_studio, 'owner', 'admin') $$;

create or replace function app.is_staff(p_studio uuid) returns boolean
  language sql stable as $$ select app.has_role(p_studio, 'owner', 'admin', 'teacher') $$;

-- Families this user is a guardian of.
create or replace function app.guardian_family_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select g.family_id from guardian g
   where g.user_id = auth.uid() and g.deleted_at is null
$$;

-- Classes this user teaches or assists.
create or replace function app.teacher_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id from class c
    join staff_member s on s.id in (c.teacher_id, c.assistant_id)
   where s.user_id = auth.uid() and s.deleted_at is null and c.deleted_at is null
$$;

-- Students a teacher may legitimately see: enrolled in, or trialling, one of
-- their classes. Nothing wider.
create or replace function app.teacher_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id from enrolment e
   where e.class_id in (select app.teacher_class_ids())
     and e.status = 'active' and e.deleted_at is null
  union
  select t.student_id from trial t
   where t.class_id in (select app.teacher_class_ids())
     and t.student_id is not null and t.deleted_at is null
     and t.status in ('booked', 'attended')
$$;

-- Students in the current user's own family.
create or replace function app.guardian_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.family_id in (select app.guardian_family_ids()) and s.deleted_at is null
$$;

-- ---------------------------------------------------------------------------
-- Enable + force RLS on every tenant table
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'studio','user_account','membership','location','room','staff_member',
    'family','guardian','student','medical_record','emergency_contact','consent_record',
    'term','term_break','dance_style','level','class','class_session',
    'enrolment','trial','waitlist_entry','enquiry','attendance_record',
    'invoice','invoice_item','payment','communication','communication_read',
    'communication_template','notification','audit_log'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Studio-wide reference data: readable by any member, writable by admins.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['location','room','term','term_break','dance_style',
                           'level','communication_template'] loop
    execute format($f$
      create policy %1$s_read on %1$I for select
        using (deleted_at is null and studio_id in (select app.studio_ids()));
      create policy %1$s_write on %1$I for all
        using (deleted_at is null and studio_id in (select app.studio_ids()) and app.is_admin(studio_id))
        with check (studio_id in (select app.studio_ids()) and app.is_admin(studio_id));
    $f$, t);
  end loop;
end $$;

-- ── Studio, users, membership ──────────────────────────────────────────────
create policy studio_read on studio for select
  using (deleted_at is null and id in (select app.studio_ids()));
create policy studio_write on studio for update
  using (app.has_role(id, 'owner')) with check (app.has_role(id, 'owner'));

-- A user always sees their own record; staff see other users in their studio.
create policy user_self on user_account for select
  using (deleted_at is null and (
    id = auth.uid()
    or exists (select 1 from membership m
                where m.user_id = user_account.id and m.deleted_at is null
                  and app.is_staff(m.studio_id))));
create policy user_self_update on user_account for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy membership_read on membership for select
  using (deleted_at is null and (user_id = auth.uid() or app.is_admin(studio_id)));
create policy membership_write on membership for all
  using (deleted_at is null and app.has_role(studio_id, 'owner')) with check (app.has_role(studio_id, 'owner'));

create policy staff_read on staff_member for select
  using (deleted_at is null and studio_id in (select app.studio_ids()) and app.is_staff(studio_id));
create policy staff_write on staff_member for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

-- ── Families and students ──────────────────────────────────────────────────
create policy family_read on family for select
  using (deleted_at is null and (
    (app.is_admin(studio_id))
    or id in (select app.guardian_family_ids())));
create policy family_admin_write on family for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy family_guardian_update on family for update
  using (id in (select app.guardian_family_ids()))
  with check (id in (select app.guardian_family_ids()));

create policy guardian_read on guardian for select
  using (deleted_at is null and (
    app.is_admin(studio_id) or family_id in (select app.guardian_family_ids())));
create policy guardian_admin_write on guardian for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy guardian_self_update on guardian for update
  using (family_id in (select app.guardian_family_ids()))
  with check (family_id in (select app.guardian_family_ids()));

-- Teachers see a student only through a class they actually teach.
create policy student_read on student for select
  using (deleted_at is null and (
    app.is_admin(studio_id)
    or (app.has_role(studio_id, 'teacher') and id in (select app.teacher_student_ids()))
    or family_id in (select app.guardian_family_ids())));
create policy student_admin_write on student for all
  using (deleted_at is null and app.is_admin(studio_id)) with check (app.is_admin(studio_id));

create policy emergency_read on emergency_contact for select
  using (deleted_at is null and (
    app.is_admin(studio_id)
    or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()))
    or student_id in (select app.guardian_student_ids())));
create policy emergency_write on emergency_contact for all
  using (deleted_at is null and (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())))
  with check (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()));

-- Health data. Deliberately NOT readable by teachers through this table —
-- they get the narrow safety brief view below instead.
create policy medical_read on medical_record for select
  using (deleted_at is null and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())));
create policy medical_write on medical_record for all
  using (deleted_at is null and (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())))
  with check (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()));

create policy consent_read on consent_record for select
  using (deleted_at is null and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())));
create policy consent_write on consent_record for all
  using (deleted_at is null and (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())))
  with check (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()));
