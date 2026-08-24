-- ============================================================================
-- 0002 · Core tables
-- ----------------------------------------------------------------------------
-- Conventions
--   * uuid primary keys, defaulted in the database
--   * created_at / updated_at on every table; created_by where a human acted
--   * deleted_at for soft deletion — every RLS policy filters on it, so a
--     soft-deleted row is invisible rather than merely flagged
--   * every tenant-scoped table carries studio_id directly. Denormalised on
--     purpose: RLS on a deep table would otherwise need a multi-join subquery
--     on every row, which is the usual reason RLS gets abandoned for speed.
--   * foreign keys state their delete behaviour explicitly. Real-world records
--     (attendance, invoices) restrict; structural children cascade.
-- ============================================================================

-- ── Tenancy ────────────────────────────────────────────────────────────────
create table studio (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) between 2 and 120),
  slug          text not null unique check (slug = lower(slug)),
  timezone      text not null default 'Europe/London',
  currency      char(3) not null default 'GBP',
  logo_url      text,
  brand_hue     smallint default 265 check (brand_hue between 0 and 360),
  contact_email text,
  contact_phone text,
  onboarding_step  smallint not null default 0,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- One row per human. Mirrors auth.users in Supabase; id matches the auth id.
create table user_account (
  id            uuid primary key,
  email         text not null,
  full_name     text not null,
  avatar_url    text,
  phone         text,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- The join that makes this multi-tenant. A user may hold roles in several
-- studios; every policy resolves access through here.
create table membership (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references user_account(id) on delete cascade,
  studio_id   uuid not null references studio(id) on delete cascade,
  role        app_role not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (user_id, studio_id, role)
);

create table location (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  address_line1 text, address_line2 text, city text, postcode text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table room (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  location_id uuid not null references location(id) on delete cascade,
  name        text not null,
  capacity    smallint check (capacity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table staff_member (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  user_id       uuid references user_account(id) on delete set null,
  display_name  text not null,
  email         text,
  phone         text,
  bio           text,
  colour        text,
  status        staff_status not null default 'active',
  dbs_checked_on date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ── People ─────────────────────────────────────────────────────────────────
create table family (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  name          text not null,
  address_line1 text, address_line2 text, city text, postcode text,
  notes         text,
  balance_minor bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references user_account(id) on delete set null,
  deleted_at    timestamptz
);

create table guardian (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  family_id     uuid not null references family(id) on delete cascade,
  user_id       uuid references user_account(id) on delete set null,
  full_name     text not null,
  email         text,
  phone         text,
  relationship  text,
  is_primary    boolean not null default false,
  receives_billing boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table student (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  family_id     uuid not null references family(id) on delete restrict,
  first_name    text not null,
  last_name     text not null,
  preferred_name text,
  date_of_birth date not null,
  pronouns      text,
  avatar_url    text,
  school        text,
  joined_on     date not null default current_date,
  left_on       date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references user_account(id) on delete set null,
  deleted_at    timestamptz
);

-- Held apart from `student` deliberately. Health data is special-category
-- under UK GDPR; separating it lets RLS grant the roster without the medical
-- detail, and lets the audit trigger watch one narrow table.
create table medical_record (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  student_id    uuid not null unique references student(id) on delete cascade,
  allergies     text,
  conditions    text,
  medications   text,
  action_plan   text,          -- what a teacher must do in an emergency
  requires_alert boolean not null default false,
  doctor_name   text,
  doctor_phone  text,
  updated_by    uuid references user_account(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table emergency_contact (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  full_name   text not null,
  relationship text,
  phone       text not null,
  priority    smallint not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table consent_record (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  student_id  uuid not null references student(id) on delete cascade,
  kind        consent_kind not null,
  granted     boolean not null,
  granted_by  uuid references user_account(id) on delete set null,
  granted_at  timestamptz not null default now(),
  expires_at  timestamptz,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (student_id, kind)
);
