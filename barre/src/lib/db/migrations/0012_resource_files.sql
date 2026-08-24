-- ============================================================================
-- 0012 · Uploaded files, and teachers owning their own class resources
-- ----------------------------------------------------------------------------
-- Two changes.
--
-- 1. Teachers can create resources for the classes they teach. Until now only
--    an owner or admin could, which made the whole library an admin chore —
--    exactly the wrong person to be uploading last night's routine video.
--
-- 2. A resource can be an uploaded file rather than a link. The bytes live in
--    resource_file, behind a storage adapter (see src/lib/storage.ts), so the
--    browser demo stores them in Postgres and a hosted deployment can put them
--    in Supabase Storage without a schema change: resource.storage_path is the
--    handle either way.
-- ============================================================================

create table resource_file (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  resource_id  uuid not null unique references resource(id) on delete cascade,
  file_name    text not null,
  mime_type    text not null,
  size_bytes   integer not null check (size_bytes > 0),
  bytes        bytea not null,
  uploaded_by  uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index resource_file_resource on resource_file (resource_id) where deleted_at is null;

alter table resource_file enable row level security;
alter table resource_file force row level security;

-- The file inherits the visibility of the resource it belongs to. The EXISTS
-- runs under the caller's own policies on `resource`, so there is exactly one
-- place where "who may see this" is decided.
create policy file_read on resource_file for select
  using (deleted_at is null
         and exists (select 1 from resource r where r.id = resource_file.resource_id));

create policy file_write on resource_file for all
  using (deleted_at is null and app.is_staff(studio_id)
         and exists (select 1 from resource r where r.id = resource_file.resource_id))
  with check (app.is_staff(studio_id)
              and exists (select 1 from resource r where r.id = resource_file.resource_id));

-- ── Teachers may build the library for their own classes ───────────────────
create policy resource_teacher_create on resource for insert
  with check (app.has_role(studio_id, 'teacher') and created_by = auth.uid());

-- Only what they put there themselves. A teacher cannot edit the studio's
-- uniform guide, or another teacher's exam music.
create policy resource_teacher_manage on resource for update
  using (deleted_at is null and app.has_role(studio_id, 'teacher') and created_by = auth.uid())
  with check (app.has_role(studio_id, 'teacher') and created_by = auth.uid());

create policy resource_teacher_delete on resource for delete
  using (app.has_role(studio_id, 'teacher') and created_by = auth.uid());

-- ...and may attach them to classes they actually teach, and nowhere else.
create policy assignment_teacher_write on resource_assignment for insert
  with check (app.has_role(studio_id, 'teacher')
              and scope = 'class'
              and class_id in (select app.teacher_class_ids()));

create policy assignment_teacher_delete on resource_assignment for delete
  using (app.has_role(studio_id, 'teacher')
         and class_id in (select app.teacher_class_ids())
         and exists (select 1 from resource r
                      where r.id = resource_assignment.resource_id and r.created_by = auth.uid()));

grant select, insert, update, delete on resource_file to authenticated, service_role;

-- ── Two constraints that assumed a resource was always a link ──────────────
-- A resource created for an upload has neither a url nor a storage_path until
-- the bytes land a statement later, which the original check forbade. What
-- actually matters is narrower: a link has to point somewhere.
alter table resource drop constraint resource_check;
alter table resource add constraint resource_has_target
  check (kind <> 'link' or url is not null);

-- A parent could not see who teaches their child's class: staff_member was
-- readable by staff and, since 0011, by students — but never by guardians.
-- Same shape as the student rule, and the repositories select display_name
-- and nothing else.
create policy staff_guardian_read on staff_member for select
  using (deleted_at is null and status = 'active'
         and studio_id in (select app.studio_ids())
         and exists (select 1 from guardian g
                      where g.user_id = auth.uid() and g.deleted_at is null));

-- ── Retiring a resource ────────────────────────────────────────────────────
-- app.soft_delete deliberately requires owner or admin, and a teacher taking
-- back last week's video is not that. This is the narrow exception, written as
-- its own function rather than as a hole in the general one — and it clears
-- the assignments and the bytes at the same time, which the generic version
-- would have left behind.
create or replace function app.retire_resource(p_id uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; author uuid;
begin
  select studio_id, created_by into sid, author
    from resource where id = p_id and deleted_at is null;
  if sid is null then return false; end if;            -- absent or already gone

  if not (app.is_admin(sid)
          or (app.has_role(sid, 'teacher') and author = auth.uid())) then
    raise exception 'FORBIDDEN: only the office, or whoever added it, may remove a resource'
      using errcode = 'insufficient_privilege';
  end if;

  update resource set deleted_at = now(), updated_at = now() where id = p_id;
  update resource_assignment set deleted_at = now(), updated_at = now()
   where resource_id = p_id and deleted_at is null;
  update resource_file set deleted_at = now(), updated_at = now()
   where resource_id = p_id and deleted_at is null;

  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'soft_delete', 'resource', p_id, 'resource retired');
  return true;
end $$;

revoke all on function app.retire_resource(uuid) from public;
grant execute on function app.retire_resource(uuid) to authenticated, service_role;
