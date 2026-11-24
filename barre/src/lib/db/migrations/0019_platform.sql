-- ============================================================================
-- 0019 · The platform: many dance schools, one operator
-- ----------------------------------------------------------------------------
-- Barre is sold to many schools. This adds the layer above them:
--
--   platform_admin   people who run Barre itself
--   plan             what a school pays for, and its limits
--   studio.status    trialling · active · past_due · suspended · cancelled
--   studio_invitation  how anyone joins a school — owner, admin, teacher,
--                    parent or student — by a single-use link
--   support_access_grant / support_session
--                    how Barre staff see inside a school: only when its owner
--                    has granted it, only for a limited time, only read-only,
--                    never health records, and always on the school's record
--
-- Two principles carry the design:
--
-- 1. Barre staff are not studio members. Being a platform admin grants no
--    access to any school's families or children. The console reads
--    account-level facts through app.platform_* functions, which return
--    counts, plan and owner contact — never a child.
--
-- 2. "Read-only" is enforced by Postgres, not by hiding buttons. Reads run in
--    READ ONLY transactions (see lib/db/client.ts). Support access and a
--    suspended school's memberships exist only inside such a transaction, so
--    there is no write path for them to use — the database would refuse it
--    even if the application tried.
-- ============================================================================

-- ── Who runs Barre ─────────────────────────────────────────────────────────
create table platform_admin (
  user_id     uuid primary key references user_account(id) on delete cascade,
  role        text not null default 'support' check (role in ('super_admin', 'support')),
  created_at  timestamptz not null default now()
);

create or replace function app.is_platform_admin() returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from platform_admin where user_id = auth.uid())
$$;
create or replace function app.is_platform_super() returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select exists (select 1 from platform_admin where user_id = auth.uid() and role = 'super_admin')
$$;

-- ── Plans ──────────────────────────────────────────────────────────────────
create table plan (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique check (code ~ '^[a-z][a-z0-9_]*$'),
  name           text not null,
  price_minor    integer not null default 0 check (price_minor >= 0),   -- per month
  max_students   integer check (max_students > 0),                      -- null = unlimited
  max_locations  integer check (max_locations > 0),
  max_staff      integer check (max_staff > 0),
  is_trial       boolean not null default false,
  active         boolean not null default true,
  sort           smallint not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger plan_touch before update on plan for each row execute function app.touch_updated_at();

alter table studio
  add column plan_id         uuid references plan(id) on delete restrict,
  add column status          text not null default 'active'
                               check (status in ('trialling', 'active', 'past_due', 'suspended', 'cancelled')),
  add column trial_ends_on   date,
  add column status_reason   text,
  add column suspended_at    timestamptz,
  add column cancelled_at    timestamptz,
  add column data_deletion_due_on date,
  add column created_by      uuid references user_account(id) on delete set null;

-- ── Read-only when suspended or cancelled ──────────────────────────────────
-- A school that cannot write: suspended (unpaid) or cancelled (leaving, data
-- awaiting deletion). Its people can still sign in and read — and the owner
-- can export everything — but nothing changes.
create or replace function app.in_read_only_tx() returns boolean
  language sql stable as $$ select current_setting('transaction_read_only') = 'on' $$;

create or replace function app.studio_writable(p_studio uuid) returns boolean
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select app.in_read_only_tx()
      or exists (select 1 from studio where id = p_studio and deleted_at is null
                   and status in ('trialling', 'active', 'past_due'))
$$;

-- ── Support access ─────────────────────────────────────────────────────────
create table support_access_grant (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  granted_by   uuid references user_account(id) on delete set null,
  reason       text not null check (length(btrim(reason)) >= 3),
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  revoked_by   uuid references user_account(id) on delete set null,
  created_at   timestamptz not null default now(),
  check (expires_at > created_at),
  check (expires_at <= created_at + interval '7 days')
);
create index support_grant_live on support_access_grant (studio_id, expires_at) where revoked_at is null;

-- Which school a Barre admin is currently looking at. One at a time, so the
-- app's queries — which rely on RLS, not on a studio filter — never mix two.
create table support_session (
  user_id     uuid primary key references user_account(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  grant_id    uuid not null references support_access_grant(id) on delete cascade,
  started_at  timestamptz not null default now()
);

create or replace function app.support_studio_id() returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select ss.studio_id
    from support_session ss
    join support_access_grant g on g.id = ss.grant_id
   where ss.user_id = auth.uid()
     and app.in_read_only_tx()
     and g.revoked_at is null and g.expires_at > now()
     and exists (select 1 from platform_admin p where p.user_id = auth.uid())
$$;

create or replace function app.is_support_viewer(p_studio uuid) returns boolean
  language sql stable as $$ select app.support_studio_id() is not distinct from p_studio $$;

-- ── Membership resolution, now status- and support-aware ───────────────────
-- Every policy resolves through these, so changing them here changes the
-- whole permission model at once.
create or replace function app.memberships()
  returns table (studio_id uuid, role app_role)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select m.studio_id, m.role
    from membership m
   where m.user_id = auth.uid() and m.deleted_at is null and app.studio_writable(m.studio_id)
  union
  -- Barre support sees a school as an administrator would, read-only.
  select app.support_studio_id(), 'admin'::app_role
   where app.support_studio_id() is not null
$$;

create or replace function app.guardian_family_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select g.family_id from guardian g
   where g.user_id = auth.uid() and g.deleted_at is null and app.studio_writable(g.studio_id)
$$;

create or replace function app.teacher_class_ids() returns setof uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select c.id from class c
    join staff_member s on s.id in (c.teacher_id, c.assistant_id)
   where s.user_id = auth.uid() and s.deleted_at is null and c.deleted_at is null
     and app.studio_writable(c.studio_id)
$$;

create or replace function app.student_self_id() returns uuid
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id from student s
   where s.user_id = auth.uid() and s.login_enabled and s.deleted_at is null
     and app.studio_writable(s.studio_id)
   limit 1
$$;

-- Health records are the one thing support never sees, grant or no grant.
drop policy medical_read on medical_record;
create policy medical_read on medical_record for select
  using (deleted_at is null and not app.is_support_viewer(studio_id) and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())));
-- The write policy is `for all`, which covers SELECT too — it must say the
-- same, or it would quietly re-open what the read policy closes.
drop policy medical_write on medical_record;
create policy medical_write on medical_record for all
  using (deleted_at is null and not app.is_support_viewer(studio_id) and (
    app.is_admin(studio_id) or student_id in (select app.guardian_student_ids())))
  with check (app.is_admin(studio_id) or student_id in (select app.guardian_student_ids()));

-- Erasing a school deletes thousands of rows; auditing each one against a
-- studio that is itself being deleted would fail. Rows whose school no
-- longer exists are not audited individually; the erasure is recorded once,
-- as a whole (see platform_purge_studio). No session flag is involved: any
-- user can set a session flag, and none may switch auditing off.
create or replace function app.write_audit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare rec record; sid uuid;
begin
  rec := coalesce(new, old);
  begin sid := rec.studio_id; exception when others then sid := null; end;
  if sid is not null and not exists (select 1 from studio where id = sid) then return rec; end if;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (sid, auth.uid(), lower(tg_op), tg_table_name, rec.id,
          case tg_op when 'DELETE' then 'removed' when 'INSERT' then 'created'
                     else 'updated' end);
  return rec;
end $$;

-- ── Plan limits ────────────────────────────────────────────────────────────
create or replace function app.enforce_plan_limit() returns trigger
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare p plan; used integer; cap integer; what text;
begin
  if new.deleted_at is not null then return new; end if;
  select pl.* into p from studio s join plan pl on pl.id = s.plan_id where s.id = new.studio_id;
  if p.id is null then return new; end if;
  case tg_table_name
    when 'student' then
      cap := p.max_students; what := 'students';
      select count(*) into used from student where studio_id = new.studio_id and deleted_at is null;
    when 'location' then
      cap := p.max_locations; what := 'locations';
      select count(*) into used from location where studio_id = new.studio_id and deleted_at is null;
    when 'staff_member' then
      cap := p.max_staff; what := 'staff';
      select count(*) into used from staff_member where studio_id = new.studio_id and deleted_at is null;
  end case;
  if cap is not null and used >= cap then
    raise exception 'PLAN_LIMIT: The % plan includes up to % %. Ask Barre to move you to a larger plan.',
      p.name, cap, what using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger student_plan_limit before insert on student
  for each row execute function app.enforce_plan_limit();
create trigger location_plan_limit before insert on location
  for each row execute function app.enforce_plan_limit();
create trigger staff_plan_limit before insert on staff_member
  for each row execute function app.enforce_plan_limit();

-- ── Invitations ────────────────────────────────────────────────────────────
-- The link holds a random token; the database keeps only its hash, so a copy
-- of the table is not a set of working invitations.
create table studio_invitation (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  email        text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name    text,
  role         app_role not null,
  family_id    uuid references family(id) on delete cascade,
  student_id   uuid references student(id) on delete cascade,
  token_hash   text not null unique,
  invited_by   uuid references user_account(id) on delete set null,
  expires_at   timestamptz not null default now() + interval '14 days',
  accepted_at  timestamptz,
  accepted_by  uuid references user_account(id) on delete set null,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  check (role <> 'guardian' or family_id is not null),
  check (role <> 'student' or student_id is not null)
);
create index invitation_studio on studio_invitation (studio_id, created_at desc);

create or replace function app.hash_token(p_token text) returns text
  language sql immutable as $$ select encode(sha256(convert_to(p_token, 'UTF8')), 'hex') $$;

create or replace function app.new_token() returns text
  language sql volatile as $$
  select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
$$;

-- ── Tables' row level security ─────────────────────────────────────────────
alter table platform_admin       enable row level security;
alter table platform_admin       force  row level security;
alter table plan                 enable row level security;
alter table plan                 force  row level security;
alter table support_access_grant enable row level security;
alter table support_access_grant force  row level security;
alter table support_session      enable row level security;
alter table support_session      force  row level security;
alter table studio_invitation    enable row level security;
alter table studio_invitation    force  row level security;

create policy platform_admin_read on platform_admin for select using (app.is_platform_admin());
create policy plan_read on plan for select using (auth.uid() is not null);
create policy plan_write on plan for update using (app.is_platform_super()) with check (app.is_platform_super());

-- A school sees its own grants; Barre sees every grant (that one exists is
-- account-level information — it is what lets support open the view).
create policy support_grant_read on support_access_grant for select
  using (app.has_role(studio_id, 'owner', 'admin') or app.is_platform_admin());
create policy support_session_own on support_session for select using (user_id = auth.uid());

create policy invitation_read on studio_invitation for select
  using (app.is_admin(studio_id) or app.is_platform_admin());

-- Barre sees the account row of every school (name, status, plan, contact),
-- which is what the console lists. Nothing below the studio row.
create policy studio_platform_read on studio for select using (app.is_platform_admin());

grant select on platform_admin, plan, support_access_grant, support_session, studio_invitation to authenticated;
grant update on plan to authenticated;
grant all on platform_admin, plan, support_access_grant, support_session, studio_invitation to service_role;

-- ── The console's view of a school: account facts, never children ──────────
create or replace function app.platform_studios()
  returns table (
    id uuid, name text, slug text, status text, status_reason text, plan_code text, plan_name text,
    price_minor integer, max_students integer, max_locations integer, max_staff integer,
    trial_ends_on date, data_deletion_due_on date, created_at timestamptz,
    students integer, families integer, locations integer, staff integer,
    owners integer, admins integer, teachers integer, guardians integer, student_logins integer,
    owner_names text, owner_emails text, pending_invites integer,
    support_until timestamptz, last_activity timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.id, s.name, s.slug, s.status, s.status_reason, p.code, p.name, p.price_minor,
         p.max_students, p.max_locations, p.max_staff, s.trial_ends_on, s.data_deletion_due_on, s.created_at,
         (select count(*)::int from student x where x.studio_id = s.id and x.deleted_at is null),
         (select count(*)::int from family x where x.studio_id = s.id and x.deleted_at is null),
         (select count(*)::int from location x where x.studio_id = s.id and x.deleted_at is null),
         (select count(*)::int from staff_member x where x.studio_id = s.id and x.deleted_at is null),
         (select count(*)::int from membership m where m.studio_id = s.id and m.deleted_at is null and m.role = 'owner'),
         (select count(*)::int from membership m where m.studio_id = s.id and m.deleted_at is null and m.role = 'admin'),
         (select count(*)::int from membership m where m.studio_id = s.id and m.deleted_at is null and m.role = 'teacher'),
         (select count(*)::int from membership m where m.studio_id = s.id and m.deleted_at is null and m.role = 'guardian'),
         (select count(*)::int from membership m where m.studio_id = s.id and m.deleted_at is null and m.role = 'student'),
         (select string_agg(u.full_name, ', ' order by u.full_name) from membership m join user_account u on u.id = m.user_id
           where m.studio_id = s.id and m.deleted_at is null and m.role = 'owner'),
         (select string_agg(u.email, ', ' order by u.full_name) from membership m join user_account u on u.id = m.user_id
           where m.studio_id = s.id and m.deleted_at is null and m.role = 'owner'),
         (select count(*)::int from studio_invitation i where i.studio_id = s.id
            and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()),
         (select max(g.expires_at) from support_access_grant g where g.studio_id = s.id
            and g.revoked_at is null and g.expires_at > now()),
         (select max(a.at) from audit_log a where a.studio_id = s.id)
    from studio s left join plan p on p.id = s.plan_id
   where s.deleted_at is null and app.is_platform_admin()
   order by s.created_at desc
$$;

-- Account history for the console: what happened to the account, by whom.
create or replace function app.platform_events(p_studio uuid)
  returns table (at timestamptz, action text, summary text, actor text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select a.at, a.action, a.summary, u.full_name
    from audit_log a left join user_account u on u.id = a.actor_id
   where a.studio_id = p_studio and a.entity in ('studio', 'studio_invitation', 'support_access_grant', 'support_session', 'membership')
     -- Decisions about the account, not the row-level trail every insert leaves.
     and a.action not in ('insert', 'update', 'delete')
     and app.is_platform_admin()
   order by a.at desc limit 30
$$;

-- Pending invitations for a school, as the console may see them.
create or replace function app.platform_invitations(p_studio uuid)
  returns table (id uuid, email text, full_name text, role app_role, created_at timestamptz,
                 expires_at timestamptz, accepted_at timestamptz, revoked_at timestamptz)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select i.id, i.email, i.full_name, i.role, i.created_at, i.expires_at, i.accepted_at, i.revoked_at
    from studio_invitation i
   where i.studio_id = p_studio and i.role in ('owner', 'admin') and app.is_platform_admin()
   order by i.created_at desc
$$;

-- ── Platform actions ───────────────────────────────────────────────────────
create or replace function app.require_platform_admin() returns void
  language plpgsql stable security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_platform_admin() then
    raise exception 'FORBIDDEN: only Barre platform staff can do this' using errcode = 'insufficient_privilege';
  end if;
end $$;

create or replace function app.platform_log(p_studio uuid, p_action text, p_entity text, p_id uuid, p_summary text)
  returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (p_studio, auth.uid(), p_action, p_entity, p_id, p_summary)
$$;

-- A new school and an invitation for its owner. Returns the token once —
-- the only time it exists in the clear.
create or replace function app.platform_create_studio(
  p_name text, p_owner_name text, p_owner_email text, p_plan_code text, p_trial_days integer default 30)
  returns table (studio_id uuid, invitation_token text)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare sid uuid; pid uuid; slug_ text; n int := 1; tok text;
begin
  perform app.require_platform_admin();
  if length(btrim(coalesce(p_name, ''))) < 2 then
    raise exception 'INVALID: the school needs a name' using errcode = 'check_violation';
  end if;
  if length(btrim(coalesce(p_owner_name, ''))) < 2 then
    raise exception 'INVALID: the owner needs a name' using errcode = 'check_violation';
  end if;
  select id into pid from plan where code = p_plan_code and active;
  if pid is null then raise exception 'INVALID: unknown plan %', p_plan_code using errcode = 'check_violation'; end if;
  if coalesce(p_trial_days, 0) < 0 or p_trial_days > 90 then
    raise exception 'INVALID: a trial is between 0 and 90 days' using errcode = 'check_violation';
  end if;

  slug_ := trim(both '-' from regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g'));
  if slug_ = '' then slug_ := 'school'; end if;
  while exists (select 1 from studio where slug = case when n = 1 then slug_ else slug_ || '-' || n end) loop
    n := n + 1;
  end loop;
  if n > 1 then slug_ := slug_ || '-' || n; end if;

  insert into studio (name, slug, plan_id, status, trial_ends_on, contact_email, created_by)
  values (btrim(p_name), slug_, pid,
          case when p_trial_days > 0 then 'trialling' else 'active' end,
          case when p_trial_days > 0 then current_date + p_trial_days end,
          lower(btrim(p_owner_email)), auth.uid())
  returning id into sid;

  tok := app.new_token();
  insert into studio_invitation (studio_id, email, full_name, role, token_hash, invited_by)
  values (sid, lower(btrim(p_owner_email)), btrim(p_owner_name), 'owner', app.hash_token(tok), auth.uid());

  perform app.platform_log(sid, 'create', 'studio', sid, 'School created by Barre; owner invited: ' || lower(btrim(p_owner_email)));
  return query select sid, tok;
end $$;

create or replace function app.platform_set_plan(p_studio uuid, p_plan_code text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare pid uuid; pname text; students_ int; cap int;
begin
  perform app.require_platform_admin();
  select id, name, max_students into pid, pname, cap from plan where code = p_plan_code and active;
  if pid is null then raise exception 'INVALID: unknown plan %', p_plan_code using errcode = 'check_violation'; end if;
  select count(*) into students_ from student where studio_id = p_studio and deleted_at is null;
  -- Moving down a plan never deletes anything; it just stops new additions.
  update studio set plan_id = pid, updated_at = now() where id = p_studio;
  perform app.platform_log(p_studio, 'plan', 'studio', p_studio, 'Plan changed to ' || pname ||
    case when cap is not null and students_ > cap then format(' (over its %s-student limit: %s)', cap, students_) else '' end);
end $$;

create or replace function app.platform_set_status(p_studio uuid, p_status text, p_reason text default null)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare old_status text;
begin
  perform app.require_platform_admin();
  select status into old_status from studio where id = p_studio and deleted_at is null;
  if old_status is null then raise exception 'NOT_FOUND: school' using errcode = 'no_data_found'; end if;
  if p_status not in ('trialling', 'active', 'past_due', 'suspended', 'cancelled') then
    raise exception 'INVALID: unknown status %', p_status using errcode = 'check_violation';
  end if;
  if p_status in ('suspended', 'cancelled') and length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'INVALID: say why — the school''s owner will see it' using errcode = 'check_violation';
  end if;
  update studio set
    status = p_status,
    status_reason = nullif(btrim(coalesce(p_reason, '')), ''),
    suspended_at = case when p_status = 'suspended' then now() when p_status in ('active','trialling','past_due') then null else suspended_at end,
    cancelled_at = case when p_status = 'cancelled' then now() when p_status <> 'cancelled' then null else cancelled_at end,
    -- 30 days to export before data is deleted, as the school's contract will say.
    data_deletion_due_on = case when p_status = 'cancelled' then current_date + 30 else null end,
    trial_ends_on = case when p_status = 'trialling' then coalesce(trial_ends_on, current_date + 14) else trial_ends_on end,
    updated_at = now()
   where id = p_studio;
  perform app.platform_log(p_studio, 'status', 'studio', p_studio,
    old_status || ' → ' || p_status || coalesce(': ' || nullif(btrim(coalesce(p_reason, '')), ''), ''));
end $$;

create or replace function app.platform_extend_trial(p_studio uuid, p_days integer) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  perform app.require_platform_admin();
  if p_days not between 1 and 60 then
    raise exception 'INVALID: extend by 1 to 60 days' using errcode = 'check_violation';
  end if;
  update studio set trial_ends_on = greatest(coalesce(trial_ends_on, current_date), current_date) + p_days,
                    status = 'trialling', updated_at = now()
   where id = p_studio and status in ('trialling', 'past_due');
  if not found then raise exception 'INVALID: only a school on trial can have it extended' using errcode = 'check_violation'; end if;
  perform app.platform_log(p_studio, 'trial', 'studio', p_studio, format('Trial extended by %s days', p_days));
end $$;

-- Erasure, once a cancelled school's notice period has passed. Super admins
-- only, and it takes everything: families, children, health records, money.
create or replace function app.platform_purge_studio(p_studio uuid, p_confirm_name text) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare s studio;
begin
  if not app.is_platform_super() then
    raise exception 'FORBIDDEN: only a Barre super admin can erase a school' using errcode = 'insufficient_privilege';
  end if;
  select * into s from studio where id = p_studio;
  if s.id is null then raise exception 'NOT_FOUND: school' using errcode = 'no_data_found'; end if;
  if s.status <> 'cancelled' or s.data_deletion_due_on is null or s.data_deletion_due_on > current_date then
    raise exception 'INVALID: a school can be erased only once cancelled and its notice period (until %) has passed',
      coalesce(s.data_deletion_due_on::text, 'not set') using errcode = 'check_violation';
  end if;
  if p_confirm_name is distinct from s.name then
    raise exception 'INVALID: type the school''s name exactly to confirm' using errcode = 'check_violation';
  end if;
  -- Children of the studio reference each other with RESTRICT (an invoice
  -- holds its family); clear the money first so the cascade can run.
  delete from payment where studio_id = p_studio;
  delete from invoice_item where studio_id = p_studio;
  delete from invoice where studio_id = p_studio;
  delete from attendance_record where studio_id = p_studio;
  delete from enrolment where studio_id = p_studio;
  delete from class_session where studio_id = p_studio;
  delete from class where studio_id = p_studio;
  delete from student where studio_id = p_studio;
  delete from studio where id = p_studio;
  -- The erasure itself is recorded without the school: studio_id is gone.
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (null, auth.uid(), 'purge', 'studio', p_studio, 'School erased after cancellation: ' || s.slug);
end $$;

create or replace function app.platform_set_plan_limits(
  p_code text, p_name text, p_price_minor integer, p_students integer, p_locations integer, p_staff integer)
  returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.is_platform_super() then
    raise exception 'FORBIDDEN: only a Barre super admin can change plans' using errcode = 'insufficient_privilege';
  end if;
  update plan set name = btrim(p_name), price_minor = p_price_minor, max_students = p_students,
                  max_locations = p_locations, max_staff = p_staff
   where code = p_code;
  if not found then raise exception 'NOT_FOUND: plan %', p_code using errcode = 'no_data_found'; end if;
end $$;

-- ── Inviting people into a school ──────────────────────────────────────────
-- Owners invite anyone. Admins invite teachers, parents and students, not
-- other admins or owners. Barre invites owners (and admins) when setting a
-- school up.
create or replace function app.create_invitation(
  p_studio uuid, p_email text, p_role app_role, p_full_name text default null,
  p_family uuid default null, p_student uuid default null)
  returns text
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare tok text; is_owner boolean; is_admin_ boolean; platform boolean;
begin
  is_owner := app.has_role(p_studio, 'owner');
  is_admin_ := app.is_admin(p_studio);
  platform := app.is_platform_admin() and p_role in ('owner', 'admin');
  if not (is_owner or (is_admin_ and p_role not in ('owner', 'admin')) or platform) then
    raise exception 'FORBIDDEN: %', case when is_admin_ then 'only an owner can invite owners and administrators'
                                         else 'only the school office can invite people' end
      using errcode = 'insufficient_privilege';
  end if;
  if not app.studio_writable(p_studio) then
    raise exception 'FORBIDDEN: this school''s account is read-only' using errcode = 'insufficient_privilege';
  end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID: that does not look like an email address' using errcode = 'check_violation';
  end if;
  if p_role = 'guardian' and not exists (select 1 from family where id = p_family and studio_id = p_studio and deleted_at is null) then
    raise exception 'INVALID: choose the family this parent belongs to' using errcode = 'check_violation';
  end if;
  if p_role = 'student' and not exists (select 1 from student where id = p_student and studio_id = p_studio and deleted_at is null) then
    raise exception 'INVALID: choose the student this login is for' using errcode = 'check_violation';
  end if;
  -- One live invitation per person and role: a re-invite replaces the old link.
  update studio_invitation set revoked_at = now()
   where studio_id = p_studio and lower(email) = lower(btrim(p_email)) and role = p_role
     and accepted_at is null and revoked_at is null;

  tok := app.new_token();
  insert into studio_invitation (studio_id, email, full_name, role, family_id, student_id, token_hash, invited_by)
  values (p_studio, lower(btrim(p_email)), nullif(btrim(coalesce(p_full_name, '')), ''), p_role,
          case when p_role = 'guardian' then p_family end, case when p_role = 'student' then p_student end,
          app.hash_token(tok), auth.uid());
  perform app.platform_log(p_studio, 'invite', 'studio_invitation', null, p_role || ' invited: ' || lower(btrim(p_email)));
  return tok;
end $$;

create or replace function app.revoke_invitation(p_id uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare inv studio_invitation;
begin
  select * into inv from studio_invitation where id = p_id;
  if inv.id is null then raise exception 'NOT_FOUND: invitation' using errcode = 'no_data_found'; end if;
  if not (app.has_role(inv.studio_id, 'owner')
          or (app.is_admin(inv.studio_id) and inv.role not in ('owner', 'admin'))
          or (app.is_platform_admin() and inv.role in ('owner', 'admin'))) then
    raise exception 'FORBIDDEN: you cannot withdraw this invitation' using errcode = 'insufficient_privilege';
  end if;
  update studio_invitation set revoked_at = now() where id = p_id and accepted_at is null;
  perform app.platform_log(inv.studio_id, 'revoke', 'studio_invitation', p_id, inv.role || ' invitation withdrawn: ' || inv.email);
end $$;

-- What an invitation link says, before anyone signs in. Only the token's
-- holder can ask, and the answer is the school's name, the role and whether
-- the link still works.
create or replace function app.invitation_preview(p_token text)
  returns table (studio_name text, role app_role, email text, full_name text, family_name text,
                 student_name text, state text)
  language sql stable security definer set search_path = public, app, pg_temp as $$
  select s.name, i.role, i.email, i.full_name, f.name, st.first_name,
         case when i.accepted_at is not null then 'accepted'
              when i.revoked_at is not null then 'revoked'
              when i.expires_at <= now() then 'expired'
              when s.status in ('suspended', 'cancelled') then 'unavailable'
              else 'valid' end
    from studio_invitation i
    join studio s on s.id = i.studio_id
    left join family f on f.id = i.family_id
    left join student st on st.id = i.student_id
   where i.token_hash = app.hash_token(p_token)
$$;

-- Accepting. Runs as the person who has just signed in (in production,
-- Supabase Auth has created their auth user; here, the demo has). When the
-- session carries an email claim it must match the invitation's.
create or replace function app.accept_invitation(p_token text, p_full_name text)
  returns table (studio_id uuid, role app_role)
  language plpgsql security definer set search_path = public, app, pg_temp as $$
#variable_conflict use_column
declare inv studio_invitation; me uuid := auth.uid(); claimed text := lower(auth.jwt() ->> 'email');
        nm text := btrim(coalesce(p_full_name, '')); gid uuid; sid_ uuid;
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

  insert into user_account (id, email, full_name) values (me, inv.email, nm)
  on conflict (id) do nothing;

  -- Revive a removed membership rather than duplicating it.
  update membership set deleted_at = null, updated_at = now()
   where user_id = me and membership.studio_id = inv.studio_id and membership.role = inv.role;
  if not found then
    insert into membership (user_id, studio_id, role) values (me, inv.studio_id, inv.role)
    on conflict do nothing;
  end if;

  if inv.role = 'teacher' then
    -- Link the teacher record the office already made, or make one.
    update staff_member set user_id = me
     where id = (select id from staff_member where staff_member.studio_id = inv.studio_id
                   and lower(email) = inv.email and user_id is null and deleted_at is null limit 1);
    if not found and not exists (select 1 from staff_member where staff_member.studio_id = inv.studio_id and user_id = me) then
      insert into staff_member (studio_id, user_id, display_name, email) values (inv.studio_id, me, nm, inv.email);
    end if;
  elsif inv.role = 'guardian' then
    select id into gid from guardian where family_id = inv.family_id and deleted_at is null
       and user_id is null and lower(email) = inv.email limit 1;
    if gid is not null then
      update guardian set user_id = me where id = gid;
    elsif not exists (select 1 from guardian where family_id = inv.family_id and user_id = me) then
      insert into guardian (studio_id, family_id, user_id, full_name, email)
      values (inv.studio_id, inv.family_id, me, nm, inv.email);
    end if;
  elsif inv.role = 'student' then
    -- The account is linked, but a child's login stays off until a guardian
    -- approves it — unless the invitation came from that child's guardian.
    update student set user_id = me,
           login_enabled = exists (select 1 from guardian g where g.family_id = student.family_id
                                     and g.user_id = inv.invited_by and g.deleted_at is null),
           login_approved_by = case when exists (select 1 from guardian g where g.family_id = student.family_id
                                     and g.user_id = inv.invited_by and g.deleted_at is null) then inv.invited_by end
     where id = inv.student_id;
  end if;

  update studio_invitation set accepted_at = now(), accepted_by = me where id = inv.id;
  insert into audit_log (studio_id, actor_id, action, entity, entity_id, summary)
  values (inv.studio_id, me, 'accept', 'membership', inv.id, inv.role || ' joined: ' || inv.email);
  return query select inv.studio_id, inv.role;
end $$;

-- ── Managing who has access ────────────────────────────────────────────────
create or replace function app.set_member_role(p_membership uuid, p_role app_role) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m membership;
begin
  select * into m from membership where id = p_membership and deleted_at is null;
  if m.id is null then raise exception 'NOT_FOUND: member' using errcode = 'no_data_found'; end if;
  if not app.has_role(m.studio_id, 'owner') then
    raise exception 'FORBIDDEN: only an owner can change someone''s role' using errcode = 'insufficient_privilege';
  end if;
  if m.role not in ('owner', 'admin', 'teacher') or p_role not in ('owner', 'admin', 'teacher') then
    raise exception 'INVALID: parents and students are linked to a family or child — invite them in that role instead'
      using errcode = 'check_violation';
  end if;
  if m.role = 'owner' and p_role <> 'owner' and
     (select count(*) from membership where studio_id = m.studio_id and role = 'owner' and deleted_at is null) <= 1 then
    raise exception 'INVALID: a school must keep at least one owner' using errcode = 'check_violation';
  end if;
  if exists (select 1 from membership where user_id = m.user_id and studio_id = m.studio_id and role = p_role
               and deleted_at is null and id <> m.id) then
    update membership set deleted_at = now() where id = m.id;
  else
    update membership set role = p_role, updated_at = now() where id = m.id;
  end if;
  if p_role = 'teacher' and not exists (select 1 from staff_member where studio_id = m.studio_id and user_id = m.user_id and deleted_at is null) then
    insert into staff_member (studio_id, user_id, display_name, email)
    select m.studio_id, u.id, u.full_name, u.email from user_account u where u.id = m.user_id;
  end if;
  perform app.platform_log(m.studio_id, 'role', 'membership', m.id, m.role || ' → ' || p_role);
end $$;

create or replace function app.remove_member(p_membership uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare m membership;
begin
  select * into m from membership where id = p_membership and deleted_at is null;
  if m.id is null then raise exception 'NOT_FOUND: member' using errcode = 'no_data_found'; end if;
  if not (app.has_role(m.studio_id, 'owner') or (app.is_admin(m.studio_id) and m.role in ('teacher', 'guardian', 'student'))) then
    raise exception 'FORBIDDEN: you cannot remove this person' using errcode = 'insufficient_privilege';
  end if;
  if m.role = 'owner' and (select count(*) from membership where studio_id = m.studio_id and role = 'owner' and deleted_at is null) <= 1 then
    raise exception 'INVALID: a school must keep at least one owner' using errcode = 'check_violation';
  end if;
  update membership set deleted_at = now(), updated_at = now() where id = m.id;
  -- Their records stay (a teacher's registers, a parent's family); only the
  -- ability to sign in to this school goes.
  if m.role = 'guardian' then
    update guardian set user_id = null where studio_id = m.studio_id and user_id = m.user_id;
  elsif m.role = 'student' then
    update student set login_enabled = false where studio_id = m.studio_id and user_id = m.user_id;
  elsif m.role = 'teacher' then
    update staff_member set user_id = null where studio_id = m.studio_id and user_id = m.user_id;
  end if;
  perform app.platform_log(m.studio_id, 'remove', 'membership', m.id, m.role || ' access removed');
end $$;

-- ── Granting and using support access ──────────────────────────────────────
create or replace function app.grant_support_access(p_studio uuid, p_hours integer, p_reason text) returns uuid
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare gid uuid;
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the school''s owner can let Barre support in' using errcode = 'insufficient_privilege';
  end if;
  if p_hours not between 1 and 168 then
    raise exception 'INVALID: access lasts between 1 hour and 7 days' using errcode = 'check_violation';
  end if;
  update support_access_grant set revoked_at = now(), revoked_by = auth.uid()
   where studio_id = p_studio and revoked_at is null and expires_at > now();
  insert into support_access_grant (studio_id, granted_by, reason, expires_at)
  values (p_studio, auth.uid(), btrim(p_reason), now() + make_interval(hours => p_hours))
  returning id into gid;
  perform app.platform_log(p_studio, 'grant', 'support_access_grant', gid,
    format('Barre support may view the account, read-only, for %s hours: %s', p_hours, btrim(p_reason)));
  return gid;
end $$;

create or replace function app.revoke_support_access(p_studio uuid) returns void
  language plpgsql security definer set search_path = public, app, pg_temp as $$
begin
  if not app.has_role(p_studio, 'owner') then
    raise exception 'FORBIDDEN: only the school''s owner can change support access' using errcode = 'insufficient_privilege';
  end if;
  update support_access_grant set revoked_at = now(), revoked_by = auth.uid()
   where studio_id = p_studio and revoked_at is null and expires_at > now();
  delete from support_session where studio_id = p_studio;
  perform app.platform_log(p_studio, 'revoke', 'support_access_grant', null, 'Support access ended by the owner');
end $$;

create or replace function app.start_support_session(p_studio uuid) returns timestamptz
  language plpgsql security definer set search_path = public, app, pg_temp as $$
declare g support_access_grant;
begin
  perform app.require_platform_admin();
  select * into g from support_access_grant
   where studio_id = p_studio and revoked_at is null and expires_at > now()
   order by expires_at desc limit 1;
  if g.id is null then
    raise exception 'FORBIDDEN: the school''s owner has not granted support access' using errcode = 'insufficient_privilege';
  end if;
  insert into support_session (user_id, studio_id, grant_id) values (auth.uid(), p_studio, g.id)
  on conflict (user_id) do update set studio_id = excluded.studio_id, grant_id = excluded.grant_id, started_at = now();
  -- On the school's own record, where its owner can see it.
  perform app.platform_log(p_studio, 'view', 'support_session', g.id, 'Barre support opened a read-only view');
  return g.expires_at;
end $$;

create or replace function app.end_support_session() returns void
  language sql security definer set search_path = public, app, pg_temp as $$
  delete from support_session where user_id = auth.uid()
$$;

-- ── Grants ─────────────────────────────────────────────────────────────────
revoke execute on function app.platform_log(uuid, text, text, uuid, text) from public, authenticated, anon;
grant execute on function
  app.is_platform_admin(), app.is_platform_super(), app.platform_studios(), app.platform_events(uuid),
  app.platform_invitations(uuid),
  app.platform_create_studio(text, text, text, text, integer), app.platform_set_plan(uuid, text),
  app.platform_set_status(uuid, text, text), app.platform_extend_trial(uuid, integer),
  app.platform_purge_studio(uuid, text), app.platform_set_plan_limits(text, text, integer, integer, integer, integer),
  app.create_invitation(uuid, text, app_role, text, uuid, uuid), app.revoke_invitation(uuid),
  app.invitation_preview(text), app.accept_invitation(text, text),
  app.set_member_role(uuid, app_role), app.remove_member(uuid),
  app.grant_support_access(uuid, integer, text), app.revoke_support_access(uuid),
  app.start_support_session(uuid), app.end_support_session()
  to authenticated;
grant execute on function app.invitation_preview(text) to anon;

-- ── Plans every installation starts with ───────────────────────────────────
insert into plan (code, name, price_minor, max_students, max_locations, max_staff, is_trial, sort) values
  ('trial',   'Trial',   0,     50,   1,    5,    true,  0),
  ('starter', 'Starter', 4900,  100,  1,    5,    false, 1),
  ('studio',  'Studio',  9900,  300,  3,    20,   false, 2),
  ('academy', 'Academy', 17900, null, null, null, false, 3);
