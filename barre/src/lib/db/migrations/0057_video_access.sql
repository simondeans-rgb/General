-- ============================================================================
-- 0057 · Who sees library material, and media that shows children
-- ----------------------------------------------------------------------------
-- 1. Teachers read library material for the classes they teach or cover (and
--    their own uploads), plus studio-wide material the office marks "for all
--    staff". Until now any teacher could read every resource in the school,
--    including videos of other teachers' pupils. Assignments follow the
--    resource; files already did (0012 file_read).
--
-- 2. Media that shows children. A resource can say it shows children and name
--    them (resource_child). Families and students see it only when EVERY named
--    child currently has the matching consent (video for video and audio,
--    photography for photos and documents). It is worked out at read time, so
--    a withdrawal hides it immediately and a later grant shows it again with
--    nothing to re-run. Marked as showing children with nobody named, it stays
--    staff-only until the office names them or confirms there are no
--    identifiable children. Media showing children also never reaches families
--    as "studio-wide": it has to be pinned to a class, level or child.
--
-- 3. Hosted storage: resource_file can point at an object in a private bucket
--    instead of holding the bytes, and app.can_read_media(object) is the one
--    check the bucket's policy calls (see docs/SECURITY.md, "Media of children").
-- ============================================================================

-- ── Columns ────────────────────────────────────────────────────────────────
alter table resource
  add column if not exists for_all_staff boolean not null default false,
  add column if not exists shows_children boolean not null default false,
  add column if not exists no_identifiable_children boolean not null default false,
  add column if not exists children_checked_by uuid references user_account(id) on delete set null,
  add column if not exists children_checked_at timestamptz;

-- What everyone in the school could read before stays readable by staff: the
-- studio-wide pages (uniform, exam day) are for all staff.
update resource r set for_all_staff = true
 where r.deleted_at is null
   and (not exists (select 1 from resource_assignment a where a.resource_id = r.id and a.deleted_at is null)
        or exists (select 1 from resource_assignment a where a.resource_id = r.id and a.deleted_at is null and a.scope = 'studio'));

create table if not exists resource_child (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  resource_id uuid not null references resource(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  added_by    uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (resource_id, student_id)
);
create index if not exists resource_child_student on resource_child (student_id);

alter table resource_child enable row level security;
alter table resource_child force row level security;
grant select, insert, delete on resource_child to authenticated, service_role;

-- Hosted storage keeps the bytes in a private bucket; the row keeps the key.
alter table resource_file alter column bytes drop not null;
alter table resource_file add column if not exists object_key text;
alter table resource_file drop constraint if exists resource_file_has_bytes;
alter table resource_file add constraint resource_file_has_bytes check (bytes is not null or object_key is not null);
create unique index if not exists resource_file_object_key on resource_file (object_key) where object_key is not null;

-- ── Which consent a piece of media needs ───────────────────────────────────
create or replace function app.media_consent_kind(p_kind resource_kind) returns text
  language sql immutable as $$
  select case when p_kind in ('video', 'audio') then 'video' else 'photography' end
$$;

-- Internal: may families and students see this resource as far as the
-- children in it are concerned? (Assignment and the visible_to_* flags are
-- checked separately.) Definer so it can read consent the caller cannot.
create or replace function app.resource_family_visible(p_resource uuid) returns boolean
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare r record; named int;
begin
  select id, kind, shows_children, no_identifiable_children into r from resource where id = p_resource;
  if r.id is null then return false; end if;
  if not r.shows_children then return true; end if;
  select count(*) into named from resource_child rc where rc.resource_id = p_resource;
  if named = 0 then return r.no_identifiable_children; end if;
  return not exists (
    select 1 from resource_child rc
     where rc.resource_id = p_resource
       and coalesce((select e.granted from app.consent_effective(rc.student_id, app.media_consent_kind(r.kind)) e), false) is not true);
end $$;

-- For staff screens: how many named, how many without consent, and whether
-- families can currently see it. Nothing for anyone who is not staff.
create or replace function app.resource_child_status(p_resource uuid)
  returns table (named int, without_consent int, family_visible boolean, consent_kind text, needs_names boolean)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare r record;
begin
  select id, studio_id, kind, shows_children, no_identifiable_children into r
    from resource where id = p_resource and deleted_at is null;
  if r.id is null or not app.is_staff(r.studio_id) then return; end if;
  consent_kind := app.media_consent_kind(r.kind);
  select count(*)::int,
         count(*) filter (where coalesce((select e.granted from app.consent_effective(rc.student_id, consent_kind) e), false) is not true)::int
    into named, without_consent
    from resource_child rc where rc.resource_id = p_resource;
  family_visible := app.resource_family_visible(p_resource);
  needs_names := r.shows_children and named = 0 and not r.no_identifiable_children;
  return next;
end $$;

-- ── Resources reaching a student, now consent-aware ───────────────────────
-- As 0010, with two changes: media showing children is never "studio-wide"
-- for families, and it is dropped unless every named child has consent.
create or replace function app.resource_ids_for_student(p_student uuid) returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select x.id from (
    select r.id from resource r
     where r.deleted_at is null and not r.shows_children
       and not exists (select 1 from resource_assignment a
                        where a.resource_id = r.id and a.deleted_at is null)
    union
    select a.resource_id from resource_assignment a
     where a.deleted_at is null and (
       a.scope = 'studio'
       or (a.scope = 'student' and a.student_id = p_student)
       or (a.scope = 'class' and a.class_id in (
             select e.class_id from enrolment e
              where e.student_id = p_student and e.status = 'active' and e.deleted_at is null))
       or (a.scope = 'level' and a.level_id in (
             select c.level_id from enrolment e join class c on c.id = e.class_id
              where e.student_id = p_student and e.status = 'active' and e.deleted_at is null)))
  ) x
  join resource r on r.id = x.id and r.deleted_at is null
  where not r.shows_children
     or (app.resource_family_visible(r.id)
         and exists (select 1 from resource_assignment a
                      where a.resource_id = r.id and a.deleted_at is null and a.scope <> 'studio'
                        and (a.scope <> 'student' or a.student_id = p_student)
                        and (a.scope <> 'class' or a.class_id in (
                              select e.class_id from enrolment e
                               where e.student_id = p_student and e.status = 'active' and e.deleted_at is null))
                        and (a.scope <> 'level' or a.level_id in (
                              select c.level_id from enrolment e join class c on c.id = e.class_id
                               where e.student_id = p_student and e.status = 'active' and e.deleted_at is null))))
$$;

-- ── Teachers: their classes (taught or covered), their pupils, their own ──
-- Cover counts from the day before to a fortnight ahead, so a covering
-- teacher can watch the routine before the class, not only on the day.
create or replace function app.teacher_library_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select app.teacher_class_ids()
  union
  select cs.class_id from class_session cs
    join staff_member s on s.id = cs.teacher_id
   where s.user_id = auth.uid() and s.deleted_at is null and cs.deleted_at is null
     and cs.status <> 'cancelled'
     and cs.starts_at between now() - interval '1 day' and now() + interval '14 days'
     and app.in_scope(cs.studio_id)
$$;

create or replace function app.teacher_resource_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select a.resource_id from resource_assignment a
   where a.deleted_at is null and (
     (a.scope = 'class' and a.class_id in (select app.teacher_library_class_ids()))
     or (a.scope = 'level' and a.level_id in (select c.level_id from class c
                                               where c.id in (select app.teacher_library_class_ids())))
     or (a.scope = 'student' and a.student_id in (select app.teacher_student_ids())))
$$;

-- Was: any teacher reads everything (0010).
drop policy if exists resource_teacher_read on resource;
create policy resource_teacher_read on resource for select
  using (deleted_at is null and app.has_role(studio_id, 'teacher')
         and (created_by = auth.uid() or for_all_staff
              or id in (select app.teacher_resource_ids())));

-- Families and students: as 0010, plus the children-in-it check. The function
-- already applies it; repeating it here keeps the rule visible in the policy.
drop policy if exists resource_student_read on resource;
create policy resource_student_read on resource for select
  using (deleted_at is null and visible_to_students
         and (not shows_children or app.resource_family_visible(id))
         and id in (select app.resource_ids_for_student(app.student_self_id())));
drop policy if exists resource_guardian_read on resource;
create policy resource_guardian_read on resource for select
  using (deleted_at is null and visible_to_guardians
         and (not shows_children or app.resource_family_visible(id))
         and exists (select 1 from unnest(array(select app.guardian_student_ids())) as g(sid)
                      where id in (select app.resource_ids_for_student(g.sid))));

-- Assignments are visible exactly when their resource is (the EXISTS runs
-- under the caller's own policies on resource). A family never learns which
-- other child something was pinned to.
drop policy if exists assignment_read on resource_assignment;
create policy assignment_read on resource_assignment for select
  using (deleted_at is null and studio_id in (select app.studio_ids())
         and exists (select 1 from resource r where r.id = resource_assignment.resource_id)
         and (scope <> 'student' or app.is_staff(studio_id)
              or student_id = app.student_self_id()
              or student_id in (select app.guardian_student_ids())));

-- ── Naming the children in a piece of media ────────────────────────────────
create policy resource_child_admin on resource_child for all
  using (app.is_admin(studio_id)) with check (app.is_admin(studio_id));
create policy resource_child_teacher_read on resource_child for select
  using (app.has_role(studio_id, 'teacher')
         and exists (select 1 from resource r where r.id = resource_child.resource_id)
         and (student_id in (select app.teacher_student_ids())
              or exists (select 1 from resource r where r.id = resource_child.resource_id and r.created_by = auth.uid())));
create policy resource_child_teacher_write on resource_child for insert
  with check (app.has_role(studio_id, 'teacher')
              and student_id in (select app.teacher_student_ids())
              and exists (select 1 from resource r where r.id = resource_child.resource_id and r.created_by = auth.uid()));
create policy resource_child_teacher_delete on resource_child for delete
  using (app.has_role(studio_id, 'teacher')
         and exists (select 1 from resource r where r.id = resource_child.resource_id and r.created_by = auth.uid()));

create or replace function app.resource_child_guard() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not exists (select 1 from resource r where r.id = new.resource_id and r.studio_id = new.studio_id)
     or not exists (select 1 from student s where s.id = new.student_id and s.studio_id = new.studio_id) then
    raise exception 'INVALID: that child and that material are not in the same school' using errcode = 'check_violation';
  end if;
  new.added_by := coalesce(new.added_by, auth.uid());
  return new;
end $$;
drop trigger if exists resource_child_guard on resource_child;
create trigger resource_child_guard before insert on resource_child
  for each row execute function app.resource_child_guard();

-- Only the office marks something for all staff, confirms there are no
-- identifiable children, or takes back "shows children" once it is set.
-- Server jobs (no signed-in user) are trusted, as elsewhere.
create or replace function app.resource_media_guard() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare office boolean := auth.uid() is null or app.is_admin(new.studio_id);
begin
  if not office then
    if new.for_all_staff and (tg_op = 'INSERT' or not old.for_all_staff) then
      raise exception 'FORBIDDEN: only the office shares material with all staff' using errcode = 'insufficient_privilege';
    end if;
    if new.no_identifiable_children and (tg_op = 'INSERT' or not old.no_identifiable_children) then
      raise exception 'FORBIDDEN: only the office can confirm no children can be identified' using errcode = 'insufficient_privilege';
    end if;
    if tg_op = 'UPDATE' and old.shows_children and not new.shows_children then
      raise exception 'FORBIDDEN: only the office can say this no longer shows children' using errcode = 'insufficient_privilege';
    end if;
  end if;
  if tg_op = 'INSERT' or new.no_identifiable_children is distinct from old.no_identifiable_children then
    if new.no_identifiable_children then
      new.children_checked_by := auth.uid(); new.children_checked_at := now();
    elsif tg_op = 'UPDATE' then
      new.children_checked_by := null; new.children_checked_at := null;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists resource_media_guard on resource;
create trigger resource_media_guard before insert or update on resource
  for each row execute function app.resource_media_guard();

-- ── Hosted storage: the one check a private bucket's policy calls ─────────
-- SECURITY INVOKER on purpose: it reads resource_file under the caller's own
-- row level security, so "may this person fetch this object" is decided by
-- the same policies as everything above.
create or replace function app.can_read_media(p_object text) returns boolean
  language sql stable security invoker set search_path = public, app, pg_temp as $$
  select exists (select 1 from resource_file f
                  where f.object_key = p_object and f.deleted_at is null)
$$;

revoke all on function app.resource_family_visible(uuid) from public;
grant execute on function app.resource_family_visible(uuid) to authenticated, service_role;
revoke all on function app.resource_child_status(uuid), app.teacher_resource_ids(), app.teacher_library_class_ids() from public;
grant execute on function app.resource_child_status(uuid), app.teacher_resource_ids(), app.teacher_library_class_ids(),
  app.can_read_media(text), app.media_consent_kind(resource_kind) to authenticated, service_role;
