-- ============================================================================
-- 0059 · Keeping data: videos and photos that show children
-- ----------------------------------------------------------------------------
-- Material marked as showing children (0057) is deleted a set time after the
-- LAST child it names has left the school, unless any of them is held
-- (legal hold, or a safeguarding concern still kept: 0047, 0058). A single
-- child cannot be cut out of a video, so it stays while any named child is
-- still dancing here, and goes when the last one's period ends.
--
-- Material marked as showing children but naming nobody is staff-only
-- (0057); it is deleted the same period after it was added, unless the
-- office confirmed no child can be identified in it.
--
-- In the hosted version the file itself lives in private storage (0057,
-- storage-hosted.ts). Deleting the row cannot reach the bucket, so the
-- object key is queued in media_deletion for the storage worker, which
-- deletes the object and stamps done_at.
--
-- How: the whole run (0058, app.retention_run) is kept as it is under a new
-- name, and a wrapper adds this step, so the owner's preview, the manual run
-- and the monthly automatic run all include it.
-- ============================================================================

alter table retention_policy
  add column if not exists media_months smallint not null default 12 check (media_months between 1 and 120);

create table if not exists media_deletion (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  object_key  text not null,
  queued_at   timestamptz not null default now(),
  done_at     timestamptz
);
alter table media_deletion enable row level security;
alter table media_deletion force row level security;
grant select, insert, update, delete on media_deletion to service_role;

alter function app.retention_run(uuid, boolean, text[], timestamptz) rename to retention_run_core;

create or replace function app.retention_run(p_studio uuid, p_apply boolean, p_only text[] default null,
                                             p_as_of timestamptz default now())
  returns table (step text, student_id uuid, who text, left_on date, reason text, entity_id uuid)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pol retention_policy; r record; cut date; held text;
begin
  return query select * from app.retention_run_core(p_studio, p_apply, p_only, p_as_of);

  select * into pol from retention_policy rp where rp.studio_id = p_studio;
  if pol.studio_id is null then return; end if;
  cut := current_date - make_interval(months => pol.media_months);

  for r in
    select res.id, res.title,
           (select max(app.retention_left_on(rc.student_id)) from resource_child rc where rc.resource_id = res.id) as last_left,
           (select bool_or(app.retention_left_on(rc.student_id) is null) from resource_child rc where rc.resource_id = res.id) as someone_still_here,
           exists (select 1 from resource_child rc where rc.resource_id = res.id) as names_children,
           res.created_at::date as added
      from resource res
     where res.studio_id = p_studio and res.shows_children and not res.no_identifiable_children
  loop
    -- Named children: wait for the last one to leave, then the period.
    if r.names_children then
      continue when r.someone_still_here or r.last_left is null or r.last_left >= cut;
      select app.retention_hold_reason(rc.student_id, pol.concern_months) into held
        from resource_child rc where rc.resource_id = r.id
         and app.retention_hold_reason(rc.student_id, pol.concern_months) is not null limit 1;
      if held is not null then
        step := 'held'; student_id := null; who := 'Video or photo: ' || r.title; left_on := r.last_left;
        reason := held; entity_id := r.id; return next; reason := null; held := null;
        continue;
      end if;
      left_on := r.last_left;
    else
      -- Nobody named: staff-only material, kept the same period from when it was added.
      continue when r.added >= cut;
      left_on := r.added;
    end if;

    continue when p_only is not null and not (app.retention_key('media', r.id) = any(p_only));
    step := 'media'; student_id := null; who := 'Video or photo: ' || r.title; reason := null; entity_id := r.id;
    return next;
    if p_apply then
      insert into media_deletion (studio_id, object_key)
        select p_studio, f.object_key from resource_file f where f.resource_id = r.id and f.object_key is not null;
      delete from resource where id = r.id;   -- files, assignments and named children go with it
      insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
      values (p_studio, auth.uid(), 'retention', 'resource', r.id,
              'Video or photo of children deleted: ' || case when r.names_children then 'last child left ' else 'added ' end || left_on);
    end if;
  end loop;
end $$;

revoke all on function app.retention_run_core(uuid, boolean, text[], timestamptz) from public, authenticated, anon;
revoke all on function app.retention_run(uuid, boolean, text[], timestamptz) from public, authenticated, anon;
grant execute on function app.retention_run(uuid, boolean, text[], timestamptz) to service_role;
