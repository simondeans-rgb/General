-- ============================================================================
-- 0054 · Multi-site schools and switching schools (round 2: UR-32, UR-33)
-- ----------------------------------------------------------------------------
-- UR-33 · Location-scoped roles
--   An administrator or teacher membership may be limited to one or more
--   locations (membership_location). Owners are never limited. A school with
--   one location, or with no limits set, behaves exactly as before.
--
--   The design is deny-by-default:
--     · app.has_role no longer counts a *limited* administrator membership as
--       'admin'. So app.is_admin(...) is false for them, and every existing
--       policy, RPC and guard that asks "is this the office?" refuses them —
--       nothing that was written for the whole school leaks to them.
--     · app.is_staff still counts them, so they keep what every member of
--       staff has (the staff list, notices to the school, the timetable).
--     · They then get read access, through new permissive policies, to the
--       records that belong to their locations: classes and sessions there;
--       enrolments, trials, waiting lists and registers for those classes; the
--       children in those classes with their emergency contacts, medical and
--       consent records; and those children's families, guardians, invoices
--       and payments. Reports read through the same rules, so they show only
--       those locations.
--     · A restrictive policy on class hides classes at other locations from
--       anyone whose every staff role is limited (scoped teachers included),
--       except classes they teach, cover, or their own child is in.
--   What a limited administrator cannot do yet (refused, never half-done):
--   change records, take payments, run billing, enrol, message families,
--   import, invite. Those stay with the owner and all-location administrators.
--
-- UR-33 · Billing lists by location: SQL in lib/repos/billing.ts (no schema).
--
-- UR-32 · History imports, all-or-nothing like the other importers:
--   · app.import_invoice_history(rows, commit): past invoices, kept apart from
--     the ledger in imported_invoice — read-only, labelled "Imported", never in
--     balances, aged debt, billing runs or the run guard.
--   · app.import_attendance_history(rows, commit): counts per child per term.
--   · app.import_exam_results(rows, commit): past exam results, as sat entries
--     on exam sessions (so they appear wherever results already appear).
-- UR-32 · Bulk invitations without email:
--   · app.bulk_invitations(reissue): a normal 14-day invitation for every
--     parent and teacher with an email and no login, returned once so the
--     school can send the links from its own mail tool.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- UR-33 · Location-scoped roles
-- ════════════════════════════════════════════════════════════════════════════

create table membership_location (
  membership_id uuid not null references membership(id) on delete cascade,
  -- restrict, not cascade: losing the last row would silently widen access.
  location_id   uuid not null references location(id) on delete restrict,
  studio_id     uuid not null references studio(id) on delete cascade,
  created_by    uuid references user_account(id) on delete set null,
  created_at    timestamptz not null default now(),
  primary key (membership_id, location_id)
);
create index membership_location_studio on membership_location (studio_id);

-- Only administrators and teachers can be limited, and only to their own
-- school's locations.
create or replace function app.membership_location_check() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m membership;
begin
  select * into m from membership where id = new.membership_id;
  if m.id is null or m.role not in ('admin', 'teacher') then
    raise exception 'INVALID: only administrators and teachers can be limited to locations' using errcode = 'check_violation';
  end if;
  if new.studio_id <> m.studio_id
     or not exists (select 1 from location l where l.id = new.location_id and l.studio_id = m.studio_id) then
    raise exception 'INVALID: that location is not this school''s' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger membership_location_check before insert or update on membership_location
  for each row execute function app.membership_location_check();

-- A change of role, or removing someone, starts them afresh: an owner is
-- never limited, and a limit chosen for one role is not silently carried to
-- another.
create or replace function app.membership_scope_reset() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if new.role is distinct from old.role or (new.deleted_at is not null and old.deleted_at is null) then
    delete from membership_location where membership_id = new.id;
  end if;
  return new;
end $$;
create trigger membership_scope_reset after update on membership
  for each row execute function app.membership_scope_reset();

alter table membership_location enable row level security;
alter table membership_location force row level security;
create policy membership_location_read on membership_location for select
  using (app.is_admin(studio_id)
         or membership_id in (select id from membership where user_id = auth.uid() and deleted_at is null));
grant select on membership_location to authenticated;
grant all on membership_location to service_role;

-- The locations a limited administrator membership covers; null when the
-- caller's administrator role (if any) covers the whole school.
create or replace function app.admin_scope(p_studio uuid) returns uuid[]
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select array_agg(ml.location_id order by ml.location_id)
    from membership m join membership_location ml on ml.membership_id = m.id
   where m.user_id = auth.uid() and m.studio_id = p_studio and m.role = 'admin' and m.deleted_at is null
$$;

-- A limited administrator is not 'admin' to any existing rule.
create or replace function app.has_role(p_studio uuid, variadic p_roles app_role[])
  returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from app.memberships() m
                  where m.studio_id = p_studio and m.role = any(p_roles)
                    and (m.role <> 'admin' or not exists (
                          select 1 from membership mm join membership_location ml on ml.membership_id = mm.id
                           where mm.user_id = auth.uid() and mm.studio_id = p_studio
                             and mm.role = 'admin' and mm.deleted_at is null)))
$$;

-- A limited administrator: holds an administrator membership that is limited.
create or replace function app.is_scoped_admin(p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from app.memberships() m where m.studio_id = p_studio and m.role = 'admin')
     and app.admin_scope(p_studio) is not null
$$;

-- Still a member of staff.
create or replace function app.is_staff(p_studio uuid) returns boolean
  language sql stable as $$
  select app.has_role(p_studio, 'owner', 'admin', 'teacher') or app.is_scoped_admin(p_studio)
$$;

-- Schools where every staff role the caller holds is limited, with the
-- locations those roles cover between them. A school missing from this list
-- is not limited for the caller (owner, an unlimited role, or not staff).
create or replace function app.my_location_scope()
  returns table (studio_id uuid, location_id uuid)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  with mine as (
    select m.id, m.studio_id, m.role,
           exists (select 1 from membership_location ml where ml.membership_id = m.id) as limited
      from membership m
     where m.user_id = auth.uid() and m.deleted_at is null and m.role in ('owner', 'admin', 'teacher')
       and app.studio_writable(m.studio_id) and app.in_scope(m.studio_id)),
  limited_schools as (
    select mine.studio_id from mine group by mine.studio_id having bool_and(mine.limited and mine.role <> 'owner'))
  select distinct ml.studio_id, ml.location_id
    from membership_location ml join mine on mine.id = ml.membership_id
   where mine.studio_id in (select ls.studio_id from limited_schools ls)
$$;

-- What a limited administrator may read: classes at their locations, the
-- children in them, and those children's families.
create or replace function app.admin_scope_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id
    from membership m
    join membership_location ml on ml.membership_id = m.id
    join class c on c.studio_id = m.studio_id and c.location_id = ml.location_id and c.deleted_at is null
   where m.user_id = auth.uid() and m.role = 'admin' and m.deleted_at is null
     and app.studio_writable(m.studio_id) and app.in_scope(m.studio_id)
$$;

create or replace function app.admin_scope_session_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select cs.id from class_session cs where cs.class_id in (select app.admin_scope_class_ids()) and cs.deleted_at is null
$$;

create or replace function app.admin_scope_student_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select e.student_id from enrolment e
   where e.class_id in (select app.admin_scope_class_ids()) and e.status = 'active' and e.deleted_at is null
  union
  select t.student_id from trial t
   where t.class_id in (select app.admin_scope_class_ids()) and t.student_id is not null and t.deleted_at is null
     and t.status in ('requested', 'booked', 'attended')
  union
  select w.student_id from waitlist_entry w
   where w.class_id in (select app.admin_scope_class_ids()) and w.deleted_at is null
     and w.status in ('waiting', 'offered')
$$;

create or replace function app.admin_scope_family_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select distinct s.family_id from student s
   where s.id in (select app.admin_scope_student_ids()) and s.deleted_at is null
$$;

create or replace function app.admin_scope_invoice_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select i.id from invoice i where i.family_id in (select app.admin_scope_family_ids()) and i.deleted_at is null
$$;

grant execute on function app.admin_scope_session_ids(), app.admin_scope_invoice_ids() to authenticated;
grant execute on function app.admin_scope(uuid), app.is_scoped_admin(uuid), app.my_location_scope(),
  app.admin_scope_class_ids(), app.admin_scope_student_ids(), app.admin_scope_family_ids() to authenticated;

-- ── Classes at other locations are out of sight for limited staff ─────────
-- Classes a limited person still sees wherever they are: one they cover, or
-- one their own child is in. Read past RLS so the policy below never
-- consults another table's policies.
create or replace function app.scope_exempt_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select cs.class_id from class_session cs
   where cs.deleted_at is null and cs.teacher_id in (select app.my_staff_ids())
  union
  select e.class_id from enrolment e
   where e.deleted_at is null and e.student_id in (select app.guardian_student_ids())
$$;
grant execute on function app.scope_exempt_class_ids() to authenticated;

create policy class_location_scope on class as restrictive for select
  using (
    studio_id not in (select s.studio_id from app.my_location_scope() s)
    or location_id in (select s.location_id from app.my_location_scope() s)
    or id in (select app.teacher_class_ids())
    or id in (select app.scope_exempt_class_ids()));

-- ── What a limited administrator reads ─────────────────────────────────────
create policy session_scoped_admin_read on class_session for select
  using (deleted_at is null and class_id in (select app.admin_scope_class_ids()));
create policy enrolment_scoped_admin_read on enrolment for select
  using (deleted_at is null and class_id in (select app.admin_scope_class_ids()));
create policy trial_scoped_admin_read on trial for select
  using (deleted_at is null and class_id in (select app.admin_scope_class_ids()));
create policy waitlist_scoped_admin_read on waitlist_entry for select
  using (deleted_at is null and class_id in (select app.admin_scope_class_ids()));
create policy attendance_scoped_admin_read on attendance_record for select
  using (deleted_at is null and session_id in (select app.admin_scope_session_ids()));
create policy student_scoped_admin_read on student for select
  using (deleted_at is null and id in (select app.admin_scope_student_ids()));
create policy emergency_scoped_admin_read on emergency_contact for select
  using (deleted_at is null and student_id in (select app.admin_scope_student_ids()));
create policy medical_scoped_admin_read on medical_record for select
  using (deleted_at is null and student_id in (select app.admin_scope_student_ids()));
create policy consent_scoped_admin_read on consent_record for select
  using (deleted_at is null and student_id in (select app.admin_scope_student_ids()));
create policy family_scoped_admin_read on family for select
  using (deleted_at is null and id in (select app.admin_scope_family_ids()));
create policy guardian_scoped_admin_read on guardian for select
  using (deleted_at is null and family_id in (select app.admin_scope_family_ids()));
create policy invoice_scoped_admin_read on invoice for select
  using (deleted_at is null and family_id in (select app.admin_scope_family_ids()));
create policy invoice_item_scoped_admin_read on invoice_item for select
  using (deleted_at is null and invoice_id in (select app.admin_scope_invoice_ids()));
create policy payment_scoped_admin_read on payment for select
  using (deleted_at is null and family_id in (select app.admin_scope_family_ids()));

-- Opening a child's medical record is logged for a limited administrator too.
create or replace function app.log_medical_view(p_student uuid) returns boolean
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select studio_id into sid from student where id = p_student and deleted_at is null;
  if sid is null or auth.uid() is null
     or not (app.is_admin(sid) or p_student in (select app.admin_scope_student_ids())) then
    return false;
  end if;
  if exists (select 1 from audit_log where actor_id = auth.uid() and entity = 'student' and entity_id = p_student
               and action = 'view_medical' and at > now() - interval '1 hour') then
    return false;
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'view_medical', 'student', p_student, 'opened the medical record');
  return true;
end $$;

-- ── The owner sets the limits ──────────────────────────────────────────────
-- An empty list (or null) means every location, including ones added later.
create or replace function app.set_member_locations(p_member uuid, p_locations uuid[]) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m membership; names text; who text;
begin
  select * into m from membership where id = p_member and deleted_at is null;
  if m.id is null then raise exception 'NOT_FOUND: that person no longer has access' using errcode = 'no_data_found'; end if;
  if not app.has_role(m.studio_id, 'owner') then
    raise exception 'FORBIDDEN: only an owner can choose who sees which locations' using errcode = 'insufficient_privilege';
  end if;
  if not app.studio_writable(m.studio_id) or app.in_read_only_tx() then
    raise exception 'FORBIDDEN: this school''s account is read-only' using errcode = 'insufficient_privilege';
  end if;
  if m.role not in ('admin', 'teacher') then
    raise exception 'INVALID: owners always see every location' using errcode = 'check_violation';
  end if;
  if exists (select 1 from unnest(coalesce(p_locations, '{}')) x
              where not exists (select 1 from location l where l.id = x and l.studio_id = m.studio_id and l.deleted_at is null)) then
    raise exception 'INVALID: that location is not this school''s' using errcode = 'check_violation';
  end if;
  delete from membership_location where membership_id = m.id;
  insert into membership_location (membership_id, location_id, studio_id, created_by)
  select m.id, x, m.studio_id, auth.uid() from (select distinct unnest(coalesce(p_locations, '{}')) x) d;

  select string_agg(l.name, ', ' order by l.name) into names from location l where l.id = any(coalesce(p_locations, '{}'));
  select full_name into who from user_account where id = m.user_id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (m.studio_id, auth.uid(), 'update', 'membership', m.id,
          coalesce(who, 'Someone') || ' (' || m.role || '): ' || coalesce('only ' || names, 'every location'));
end $$;
revoke all on function app.set_member_locations(uuid, uuid[]) from public;
grant execute on function app.set_member_locations(uuid, uuid[]) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-32 · History imports
-- ════════════════════════════════════════════════════════════════════════════

-- Past invoices from the previous system: a record, not money. They are
-- never part of the ledger, balances, aged debt or billing runs — the money
-- still owed comes in once, as the opening balance.
create table imported_invoice (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  family_id    uuid not null references family(id) on delete cascade,
  number       text not null check (length(number) between 1 and 60),
  issued_on    date not null,
  due_on       date,
  description  text check (description is null or length(description) <= 500),
  total_minor  bigint not null check (total_minor >= 0),
  paid_minor   bigint not null default 0 check (paid_minor >= 0),
  imported_by  uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (family_id, number)
);
create index imported_invoice_family on imported_invoice (family_id, issued_on desc);

-- Attendance kept by the previous system: one line per child, term and class.
create table attendance_history (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  period       text not null check (length(period) between 1 and 80),
  class_name   text not null default '' check (length(class_name) <= 120),
  attended     integer not null check (attended >= 0),
  absent       integer not null default 0 check (absent >= 0),
  imported_by  uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (student_id, period, class_name)
);
create index attendance_history_student on attendance_history (student_id);

alter table exam_session add column imported boolean not null default false;

alter table imported_invoice enable row level security;   alter table imported_invoice force row level security;
alter table attendance_history enable row level security; alter table attendance_history force row level security;
-- Read-only for everyone: written only by the importers below.
create policy imported_invoice_read on imported_invoice for select
  using (app.is_admin(studio_id)
         or family_id in (select app.guardian_family_ids())
         or family_id in (select app.admin_scope_family_ids()));
create policy attendance_history_read on attendance_history for select
  using (app.is_admin(studio_id)
         or student_id in (select app.guardian_student_ids())
         or student_id = app.student_self_id()
         or (app.has_role(studio_id, 'teacher') and student_id in (select app.teacher_student_ids()))
         or student_id in (select app.admin_scope_student_ids()));
grant select on imported_invoice, attendance_history to authenticated;
grant all on imported_invoice, attendance_history to service_role;

-- The family a history row belongs to: parent email, else family name.
create or replace function app.import_find_family(p_studio uuid, r jsonb) returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(
    (select g.family_id from guardian g join family f on f.id = g.family_id and f.deleted_at is null
      where g.studio_id = p_studio and g.deleted_at is null and nullif(btrim(r ->> 'parent_email'), '') is not null
        and lower(g.email) = lower(btrim(r ->> 'parent_email')) limit 1),
    (select f.id from family f where f.studio_id = p_studio and f.deleted_at is null and nullif(btrim(r ->> 'family'), '') is not null
        and (lower(f.name) = lower(btrim(r ->> 'family')) or lower(f.name) = lower(btrim(r ->> 'family')) || ' family')
      order by f.created_at limit 1))
$$;

-- The children a history row could mean: first name, and whichever of last
-- name, date of birth and parent email the file gives. The caller insists on
-- exactly one.
create or replace function app.import_find_students(p_studio uuid, r jsonb, p_dob date) returns uuid[]
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select coalesce(array_agg(s.id), '{}') from student s
   where s.studio_id = p_studio and s.deleted_at is null
     and lower(s.first_name) = lower(btrim(coalesce(r ->> 'child_first_name', '')))
     and (nullif(btrim(r ->> 'child_last_name'), '') is null or lower(s.last_name) = lower(btrim(r ->> 'child_last_name')))
     and (p_dob is null or s.date_of_birth = p_dob)
     and (nullif(btrim(r ->> 'parent_email'), '') is null or exists (
           select 1 from guardian g where g.family_id = s.family_id and g.deleted_at is null
              and lower(g.email) = lower(btrim(r ->> 'parent_email'))))
$$;

-- One child for a row, or a message saying why not.
create or replace function app.import_student_or_error(p_studio uuid, r jsonb, out student_id uuid, out message text)
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare dob date; ids uuid[]; who text;
begin
  who := btrim(coalesce(r ->> 'child_first_name', '') || ' ' || coalesce(r ->> 'child_last_name', ''));
  if coalesce(btrim(r ->> 'child_first_name'), '') = '' then message := 'No child first name'; return; end if;
  begin
    dob := app.parse_date(r ->> 'child_dob');
  exception when others then
    message := 'Cannot read the date of birth "' || (r ->> 'child_dob') || '" — use DD/MM/YYYY'; return;
  end;
  ids := app.import_find_students(p_studio, r, dob);
  if cardinality(ids) = 0 then
    message := 'No child called ' || who || ' matches — import families first, or check the name and date of birth';
  elsif cardinality(ids) > 1 then
    message := 'More than one child called ' || who || ' — add their date of birth or a parent email';
  else
    student_id := ids[1];
  end if;
end $$;

-- An amount like "45", "£45.00" or "1,045.50", in pence. Null when blank.
create or replace function app.import_money(p text) returns bigint
  language plpgsql immutable as $$
declare t text := regexp_replace(coalesce(p, ''), '[£,\s]', '', 'g');
begin
  if t = '' then return null; end if;
  if t !~ '^-?\d+(\.\d{1,2})?$' then raise exception 'unreadable amount'; end if;
  return round(t::numeric * 100)::bigint;
end $$;

create or replace function app.import_count(p text) returns integer
  language plpgsql immutable as $$
declare t text := btrim(coalesce(p, ''));
begin
  if t = '' then return null; end if;
  if t !~ '^\d{1,4}$' then raise exception 'unreadable count'; end if;
  return t::int;
end $$;

-- The school an import is for: the one the caller runs as owner or
-- all-location administrator. Refused otherwise.
create or replace function app.import_school(p_commit boolean) returns uuid
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
declare sid uuid;
begin
  select id into sid from studio where deleted_at is null and app.is_admin(id) and app.in_scope(id) order by created_at limit 1;
  if sid is null then
    raise exception 'FORBIDDEN: only the school office can import' using errcode = 'insufficient_privilege';
  end if;
  if p_commit and not app.studio_writable(sid) then
    raise exception 'FORBIDDEN: this school is read-only' using errcode = 'insufficient_privilege';
  end if;
  return sid;
end $$;

create or replace function app.import_rows_ok(p_rows jsonb, p_max int) returns void
  language plpgsql immutable as $$
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'INVALID: the file has no rows' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(p_rows) > p_max then
    raise exception 'INVALID: import at most % rows at a time', p_max using errcode = 'check_violation';
  end if;
end $$;

-- ── Past invoices ──────────────────────────────────────────────────────────
-- Keys (text): parent_email or family*, number*, issued_on*, due_on,
-- description, total*, paid.
create or replace function app.import_invoice_history(p_rows jsonb, p_commit boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid := app.import_school(p_commit); r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  fam uuid; issued date; due date; total bigint; paid bigint; seen text[] := '{}'; k text; num text;
  n_new int := 0; n_skip int := 0;
begin
  perform app.import_rows_ok(p_rows, 5000);
  for pass in 1..2 loop
    exit when pass = 2 and (not p_commit or jsonb_array_length(errs) > 0);
    i := 0; seen := '{}';
    for r in select * from jsonb_array_elements(p_rows) loop
      i := i + 1;
      fam := app.import_find_family(sid, r);
      num := btrim(coalesce(r ->> 'number', ''));
      begin
        issued := app.parse_date(r ->> 'issued_on');
        due := app.parse_date(r ->> 'due_on');
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Cannot read a date on this row — use DD/MM/YYYY'); end if;
        continue;
      end;
      begin
        total := app.import_money(r ->> 'total');
        paid := coalesce(app.import_money(r ->> 'paid'), 0);
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Total and paid must be amounts, like 45.00'); end if;
        continue;
      end;
      if pass = 1 then
        if fam is null then
          errs := errs || jsonb_build_object('row', i, 'message', 'No family with ' ||
            coalesce('the email "' || nullif(btrim(r ->> 'parent_email'), '') || '"', 'the name "' || coalesce(r ->> 'family', '') || '"') || ' — import families first');
        end if;
        if num = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No invoice number'); end if;
        if issued is null then errs := errs || jsonb_build_object('row', i, 'message', 'No invoice date');
        elsif issued > current_date then errs := errs || jsonb_build_object('row', i, 'message', 'The invoice date is in the future'); end if;
        if total is null then errs := errs || jsonb_build_object('row', i, 'message', 'No total');
        elsif total < 0 then errs := errs || jsonb_build_object('row', i, 'message', 'The total cannot be negative'); end if;
        if paid < 0 then errs := errs || jsonb_build_object('row', i, 'message', 'Paid cannot be negative'); end if;
        k := coalesce(fam::text, '') || '|' || lower(num);
        if fam is not null and num <> '' then
          if k = any(seen) then errs := errs || jsonb_build_object('row', i, 'message', 'Invoice ' || num || ' is in the file twice for this family'); end if;
          seen := seen || k;
          if exists (select 1 from imported_invoice x where x.family_id = fam and lower(x.number) = lower(num)) then
            warns := warns || jsonb_build_object('message', 'Row ' || i || ': invoice ' || num || ' is already here and will be left alone');
          end if;
        end if;
        continue;
      end if;
      if exists (select 1 from imported_invoice x where x.family_id = fam and lower(x.number) = lower(num)) then
        n_skip := n_skip + 1; continue;
      end if;
      insert into imported_invoice (studio_id, family_id, number, issued_on, due_on, description, total_minor, paid_minor, imported_by)
      values (sid, fam, num, issued, due, nullif(btrim(coalesce(r ->> 'description', '')), ''), total, paid, auth.uid());
      n_new := n_new + 1;
    end loop;
  end loop;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs) using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns);
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'invoice', null, format('Imported %s past invoices as history; %s already here', n_new, n_skip));
  return jsonb_build_object('ok', true, 'rows', i, 'invoices', n_new, 'skipped', n_skip, 'errors', '[]'::jsonb, 'warnings', warns);
end $$;

-- ── Attendance summaries ───────────────────────────────────────────────────
-- Keys: child_first_name*, child_last_name, child_dob, parent_email,
-- period* (a term name), class, attended*, absent.
create or replace function app.import_attendance_history(p_rows jsonb, p_commit boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid := app.import_school(p_commit); r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  found record; att int; abs_ int; per text; cls text; seen text[] := '{}'; k text; n_new int := 0; n_skip int := 0;
begin
  perform app.import_rows_ok(p_rows, 5000);
  for pass in 1..2 loop
    exit when pass = 2 and (not p_commit or jsonb_array_length(errs) > 0);
    i := 0; seen := '{}';
    for r in select * from jsonb_array_elements(p_rows) loop
      i := i + 1;
      found := app.import_student_or_error(sid, r);
      per := btrim(coalesce(r ->> 'period', ''));
      cls := btrim(coalesce(r ->> 'class', ''));
      begin
        att := app.import_count(r ->> 'attended');
        abs_ := coalesce(app.import_count(r ->> 'absent'), 0);
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Attended and absent must be whole numbers'); end if;
        continue;
      end;
      if pass = 1 then
        if found.message is not null then errs := errs || jsonb_build_object('row', i, 'message', found.message); end if;
        if per = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No term'); end if;
        if att is null then errs := errs || jsonb_build_object('row', i, 'message', 'No attended count'); end if;
        if found.student_id is not null and per <> '' then
          k := found.student_id::text || '|' || lower(per) || '|' || lower(cls);
          if k = any(seen) then errs := errs || jsonb_build_object('row', i, 'message', 'This child, term and class are in the file twice'); end if;
          seen := seen || k;
          if exists (select 1 from attendance_history h where h.student_id = found.student_id
                       and lower(h.period) = lower(per) and lower(h.class_name) = lower(cls)) then
            warns := warns || jsonb_build_object('message', 'Row ' || i || ': this term is already here for this child and will be left alone');
          end if;
        end if;
        continue;
      end if;
      if exists (select 1 from attendance_history h where h.student_id = found.student_id
                   and lower(h.period) = lower(per) and lower(h.class_name) = lower(cls)) then
        n_skip := n_skip + 1; continue;
      end if;
      insert into attendance_history (studio_id, student_id, period, class_name, attended, absent, imported_by)
      values (sid, found.student_id, per, cls, att, abs_, auth.uid());
      n_new := n_new + 1;
    end loop;
  end loop;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs) using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns);
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'student', null, format('Imported %s attendance summaries; %s already here', n_new, n_skip));
  return jsonb_build_object('ok', true, 'rows', i, 'records', n_new, 'skipped', n_skip, 'errors', '[]'::jsonb, 'warnings', warns);
end $$;

-- ── Exam results ───────────────────────────────────────────────────────────
-- Keys: child_first_name*, child_last_name, child_dob, parent_email, board*,
-- grade*, exam_date*, result, mark, title.
create or replace function app.import_result(p text) returns text
  language sql immutable as $$
  select case regexp_replace(lower(btrim(coalesce(p, ''))), '[^a-z]', '', 'g')
    when '' then null
    when 'distinction' then 'distinction' when 'merit' then 'merit' when 'pass' then 'pass'
    when 'commended' then 'commended' when 'highlycommended' then 'highly_commended'
    when 'notyet' then 'not_yet' when 'notyetachieved' then 'not_yet' when 'fail' then 'not_yet'
    else '?' end
$$;

create or replace function app.import_exam_results(p_rows jsonb, p_commit boolean default false)
  returns jsonb
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare
  sid uuid := app.import_school(p_commit); r jsonb; i int := 0; errs jsonb := '[]'::jsonb; warns jsonb := '[]'::jsonb;
  found record; on_ date; res text; mk int; brd text; grd text; sess uuid; seen text[] := '{}'; k text;
  n_new int := 0; n_skip int := 0; n_sess int := 0;
begin
  perform app.import_rows_ok(p_rows, 5000);
  for pass in 1..2 loop
    exit when pass = 2 and (not p_commit or jsonb_array_length(errs) > 0);
    i := 0; seen := '{}';
    for r in select * from jsonb_array_elements(p_rows) loop
      i := i + 1;
      found := app.import_student_or_error(sid, r);
      brd := btrim(coalesce(r ->> 'board', ''));
      grd := btrim(coalesce(r ->> 'grade', ''));
      res := app.import_result(r ->> 'result');
      begin
        on_ := app.parse_date(r ->> 'exam_date');
        mk := app.import_count(r ->> 'mark');
      exception when others then
        if pass = 1 then errs := errs || jsonb_build_object('row', i, 'message', 'Cannot read the exam date or mark on this row'); end if;
        continue;
      end;
      if pass = 1 then
        if found.message is not null then errs := errs || jsonb_build_object('row', i, 'message', found.message); end if;
        if brd = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No exam board'); end if;
        if grd = '' then errs := errs || jsonb_build_object('row', i, 'message', 'No grade'); end if;
        if on_ is null then errs := errs || jsonb_build_object('row', i, 'message', 'No exam date');
        elsif on_ > current_date then errs := errs || jsonb_build_object('row', i, 'message', 'The exam date is in the future — results are for exams already taken'); end if;
        if res = '?' then errs := errs || jsonb_build_object('row', i, 'message',
          'Result "' || (r ->> 'result') || '" is not one of distinction, merit, pass, highly commended, commended or not yet'); end if;
        if mk is not null and mk > 100 then errs := errs || jsonb_build_object('row', i, 'message', 'A mark is out of 100'); end if;
        if found.student_id is not null and on_ is not null and grd <> '' then
          k := found.student_id::text || '|' || lower(brd) || '|' || on_::text || '|' || lower(grd);
          if k = any(seen) then errs := errs || jsonb_build_object('row', i, 'message', 'This child''s result is in the file twice'); end if;
          seen := seen || k;
        end if;
        continue;
      end if;

      select id into sess from exam_session where studio_id = sid and deleted_at is null and lower(board) = lower(brd) and exam_on = on_
        order by created_at limit 1;
      if sess is null then
        insert into exam_session (studio_id, board, title, exam_on, created_by, imported)
        values (sid, brd, coalesce(nullif(btrim(coalesce(r ->> 'title', '')), ''), brd || ' exams'), on_, auth.uid(), true)
        returning id into sess;
        n_sess := n_sess + 1;
      end if;
      if exists (select 1 from exam_entry e where e.session_id = sess and e.student_id = found.student_id and lower(e.grade) = lower(grd)) then
        n_skip := n_skip + 1; continue;
      end if;
      insert into exam_entry (studio_id, session_id, student_id, grade, status, result, mark, entered_by)
      values (sid, sess, found.student_id, grd, 'sat', res, mk, auth.uid());
      n_new := n_new + 1;
    end loop;
  end loop;

  if not p_commit or jsonb_array_length(errs) > 0 then
    if p_commit then
      raise exception 'INVALID: % row(s) need fixing before anything is imported', jsonb_array_length(errs) using errcode = 'check_violation';
    end if;
    return jsonb_build_object('ok', jsonb_array_length(errs) = 0, 'rows', i, 'errors', errs, 'warnings', warns);
  end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'import', 'student', null, format('Imported %s past exam results (%s exam sessions); %s already here', n_new, n_sess, n_skip));
  return jsonb_build_object('ok', true, 'rows', i, 'results', n_new, 'sessions', n_sess, 'skipped', n_skip, 'errors', '[]'::jsonb, 'warnings', warns);
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- UR-32 · Bulk invitation links
-- ════════════════════════════════════════════════════════════════════════════
-- Every parent and teacher with an email and no login gets a normal
-- invitation (14 days, one use). The links come back once — only their hash
-- is kept — for the school to send from its own mail tool. Someone with a
-- live invitation keeps it unless p_reissue, which replaces it (the old link
-- stops working). People without an email are listed, without a link.
create or replace function app.bulk_invitations(p_reissue boolean default false)
  returns table (role text, full_name text, email text, family_name text, token text, expires_at timestamptz, note text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare sid uuid := app.import_school(true); p record; seen text[] := '{}'; tok text; n int := 0;
begin
  for p in
    select 'teacher'::text as r, s.display_name as nm, nullif(lower(btrim(s.email)), '') as em, null::uuid as fam, null::text as fam_name, 0 as ord
      from staff_member s
     where s.studio_id = sid and s.deleted_at is null and s.user_id is null and s.status = 'active'
    union all
    select 'guardian', g.full_name, nullif(lower(btrim(g.email)), ''), g.family_id, f.name, 1
      from guardian g join family f on f.id = g.family_id and f.deleted_at is null
     where g.studio_id = sid and g.deleted_at is null and g.user_id is null
    order by 6, 5, 2
  loop
    role := p.r; full_name := p.nm; email := p.em; family_name := p.fam_name; token := null; expires_at := null; note := null;
    if p.em is null or p.em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      note := 'No email address — add one, then make the links again';
    elsif (p.r || '|' || p.em) = any(seen) then
      note := 'Same email as another ' || case when p.r = 'teacher' then 'teacher' else 'parent' end || ' above';
    elsif not p_reissue and exists (select 1 from studio_invitation i where i.studio_id = sid and lower(i.email) = p.em
                                      and i.role = p.r::app_role and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()) then
      note := 'Already invited — the earlier link still works';
    else
      tok := app.create_invitation(sid, p.em, p.r::app_role, p.nm, p.fam, null);
      token := tok;
      expires_at := (select i.expires_at from studio_invitation i where i.token_hash = app.hash_token(tok));
      n := n + 1;
    end if;
    if p.em is not null then seen := seen || (p.r || '|' || p.em); end if;
    return next;
  end loop;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), 'invite', 'studio_invitation', null, format('Made %s invitation links to send by the school''s own email', n));
end $$;

revoke all on function app.import_invoice_history(jsonb, boolean), app.import_attendance_history(jsonb, boolean),
  app.import_exam_results(jsonb, boolean), app.bulk_invitations(boolean), app.import_find_family(uuid, jsonb),
  app.import_find_students(uuid, jsonb, date), app.import_student_or_error(uuid, jsonb), app.import_school(boolean) from public;
grant execute on function app.import_invoice_history(jsonb, boolean), app.import_attendance_history(jsonb, boolean),
  app.import_exam_results(jsonb, boolean), app.bulk_invitations(boolean) to authenticated;
grant execute on function app.import_money(text), app.import_count(text), app.import_result(text), app.import_rows_ok(jsonb, int) to authenticated;
