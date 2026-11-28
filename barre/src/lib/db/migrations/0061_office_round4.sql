-- ============================================================================
-- 0061 · Office fixes from the round-2 panel review
-- ----------------------------------------------------------------------------
--   F10  Enquiry notes (a call log) and follow-up dates the office can set,
--        which Today then reminds about.
--   F10  History the administrators can read: the school-wide history for
--        records they can access, with automatic rows marked so the screen
--        can hide them by default. Medical, safeguarding and access rows
--        stay with the owner.
-- ============================================================================

-- ── F10 · Enquiry notes ────────────────────────────────────────────────────
create table enquiry_note (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  enquiry_id  uuid not null references enquiry(id) on delete cascade,
  body        text not null check (length(btrim(body)) between 1 and 2000),
  created_by  uuid references user_account(id) on delete set null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index enquiry_note_enquiry_idx on enquiry_note (enquiry_id, created_at desc);

alter table enquiry_note enable row level security;
-- Notes are the office's: owners and administrators read them; writes go
-- through app.add_enquiry_note so each one is dated, signed and audited.
create policy enquiry_note_read on enquiry_note for select
  using (deleted_at is null and app.is_admin(studio_id));
grant select on enquiry_note to authenticated;

-- A note on an enquiry, optionally with the next follow-up date. The date is
-- what Today reminds about; passing null leaves it as it is.
create or replace function app.add_enquiry_note(p_enquiry uuid, p_body text, p_follow_up date default null)
  returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid; nid uuid; txt text := btrim(coalesce(p_body, ''));
begin
  select studio_id into sid from enquiry where id = p_enquiry and deleted_at is null;
  if sid is null or not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may add notes to an enquiry' using errcode = 'insufficient_privilege';
  end if;
  if txt = '' and p_follow_up is null then
    raise exception 'INVALID: write a note or choose a follow-up date' using errcode = 'check_violation';
  end if;
  if length(txt) > 2000 then
    raise exception 'INVALID: a note can be up to 2,000 characters' using errcode = 'check_violation';
  end if;
  if txt <> '' then
    -- clock_timestamp: two notes in one transaction still read in order.
    insert into enquiry_note (studio_id, enquiry_id, body, created_by, created_at)
    values (sid, p_enquiry, txt, auth.uid(), clock_timestamp()) returning id into nid;
  end if;
  if p_follow_up is not null then
    update enquiry set next_action_on = p_follow_up, updated_at = now() where id = p_enquiry;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'enquiry', p_enquiry,
          concat_ws(', ', case when txt <> '' then 'added a note' end,
                          case when p_follow_up is not null then 'follow up on ' || to_char(p_follow_up, 'FMDD Mon YYYY') end));
  return nid;
end $$;

-- Setting or clearing the follow-up date on its own.
create or replace function app.set_enquiry_follow_up(p_enquiry uuid, p_on date)
  returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from enquiry where id = p_enquiry and deleted_at is null;
  if sid is null or not app.is_admin(sid) then
    raise exception 'FORBIDDEN: only the office may change an enquiry' using errcode = 'insufficient_privilege';
  end if;
  update enquiry set next_action_on = p_on, updated_at = now() where id = p_enquiry;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'update', 'enquiry', p_enquiry,
          case when p_on is null then 'cleared the follow-up date' else 'follow up on ' || to_char(p_on, 'FMDD Mon YYYY') end);
  return true;
end $$;

-- ── F10 · History for administrators ───────────────────────────────────────
-- What an administrator (not the owner) may read in the school's history:
-- the records they work with every day. Medical records, safeguarding,
-- staff checks, access and retention changes, and medical-record views
-- remain the owner's.
create or replace function app.office_history_entity(p_entity text) returns boolean
  language sql immutable as $$
  select p_entity = any(array[
    'family', 'guardian', 'student', 'emergency_contact', 'consent_record', 'enrolment',
    'invoice', 'payment', 'credit_note', 'family_billing', 'family_discount', 'billing_run',
    'class', 'class_session', 'term', 'enquiry', 'trial', 'waitlist_entry', 'drop_in_booking',
    'studio', 'staff_member', 'attendance_record'])
$$;

-- Whether the caller may read one history row. Owners read everything of
-- their school. Administrators read the office's records. An administrator
-- limited to some locations reads the families, children and invoices they
-- can open.
create or replace function app.can_read_history(p_studio uuid, p_entity text, p_id uuid, p_action text)
  returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select case
    when app.has_role(p_studio, 'owner') then true
    when p_action = 'view_medical' or not app.office_history_entity(p_entity) then false
    when app.is_admin(p_studio) then true
    when app.is_scoped_admin(p_studio) then
      (p_entity in ('family') and p_id in (select app.admin_scope_family_ids()))
      or (p_entity in ('student') and p_id in (select app.admin_scope_student_ids()))
      or (p_entity in ('invoice') and p_id in (select app.admin_scope_invoice_ids()))
      or (p_entity = 'guardian' and exists (select 1 from guardian g where g.id = p_id
            and g.family_id in (select app.admin_scope_family_ids())))
    else false end
$$;

-- The school's history as the owner or an administrator may read it. The
-- same filters as app.audit_history, plus p_people_only, which leaves out
-- rows written by Swayvo itself (the seed, imports, scheduled jobs).
-- `automatic` marks those rows so a screen can fold them away.
create or replace function app.office_history(p_actor uuid default null, p_entity text default null,
                                              p_text text default null, p_from date default null,
                                              p_to date default null, p_limit integer default 200,
                                              p_people_only boolean default false)
  returns table (id bigint, at timestamptz, actor_id uuid, actor text, action text, entity text,
                 entity_id uuid, record_label text, summary text, automatic boolean)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select * from (
    select a.id, a.at, a.actor_id,
           coalesce(u.full_name, case when a.actor_id is null then 'Swayvo (automatic)' else 'Former staff' end) as actor,
           a.action, a.entity, a.entity_id, app.audit_record_label(a.entity, a.entity_id) as record_label, a.summary,
           a.actor_id is null as automatic
      from audit_log a left join user_account u on u.id = a.actor_id
     where a.studio_id in (select m.studio_id from app.memberships() m where m.role in ('owner', 'admin'))
       and app.can_read_history(a.studio_id, a.entity, a.entity_id, a.action)
       and (p_actor is null or a.actor_id = p_actor)
       and (p_entity is null or a.entity = p_entity)
       and (p_from is null or a.at >= p_from)
       and (p_to is null or a.at < p_to + 1)
       and (not coalesce(p_people_only, false) or a.actor_id is not null)
     order by a.at desc, a.id desc
     limit 2000) h
   where p_text is null or btrim(p_text) = '' or lower(coalesce(h.record_label, '')) like '%' || lower(btrim(p_text)) || '%'
   limit greatest(1, least(coalesce(p_limit, 200), 1000))
$$;

-- People in the history the caller may read, for the filter.
create or replace function app.office_history_actors()
  returns table (id uuid, name text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct u.id, u.full_name from audit_log a join user_account u on u.id = a.actor_id
   where a.studio_id in (select m.studio_id from app.memberships() m where m.role in ('owner', 'admin'))
     and app.can_read_history(a.studio_id, a.entity, a.entity_id, a.action)
   order by u.full_name
$$;

-- ── Grants ─────────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'add_enquiry_note(uuid, text, date)', 'set_enquiry_follow_up(uuid, date)',
    'can_read_history(uuid, text, uuid, text)',
    'office_history(uuid, text, text, date, date, integer, boolean)', 'office_history_actors()'] loop
    execute format('revoke all on function app.%s from public', f);
    execute format('grant execute on function app.%s to authenticated, service_role', f);
  end loop;
end $$;
