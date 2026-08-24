-- ============================================================================
-- 0003 · Curriculum and scheduling
-- ============================================================================

create table term (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  starts_on   date not null,
  ends_on     date not null,
  status      term_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check (ends_on >= starts_on)
);

-- Half-terms, bank holidays, studio closures. Session generation skips these.
create table term_break (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  term_id     uuid not null references term(id) on delete cascade,
  name        text not null,
  starts_on   date not null,
  ends_on     date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check (ends_on >= starts_on)
);

create table dance_style (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  colour      text not null default 'violet',
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table level (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table class (
  id             uuid primary key default gen_random_uuid(),
  studio_id      uuid not null references studio(id) on delete cascade,
  term_id        uuid not null references term(id) on delete restrict,
  dance_style_id uuid references dance_style(id) on delete set null,
  level_id       uuid references level(id) on delete set null,
  location_id    uuid not null references location(id) on delete restrict,
  room_id        uuid references room(id) on delete set null,
  teacher_id     uuid references staff_member(id) on delete set null,
  assistant_id   uuid references staff_member(id) on delete set null,
  name           text not null,
  description    text,
  day_of_week    smallint not null check (day_of_week between 0 and 6),  -- 0 = Sunday
  start_time     time not null,
  duration_min   smallint not null check (duration_min between 15 and 300),
  capacity       smallint not null check (capacity > 0),
  age_min        smallint check (age_min >= 0),
  age_max        smallint check (age_max >= 0),
  price_minor    integer not null default 0 check (price_minor >= 0),
  pricing        pricing_model not null default 'term',
  trial_price_minor integer check (trial_price_minor >= 0),
  trials_enabled boolean not null default true,
  trial_needs_approval boolean not null default false,
  waitlist_enabled boolean not null default true,
  visibility     class_visibility not null default 'public',
  prerequisites  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references user_account(id) on delete set null,
  deleted_at     timestamptz,
  check (age_max is null or age_min is null or age_max >= age_min),
  check (assistant_id is null or assistant_id <> teacher_id)
);

-- One row per occurrence. Attendance hangs off the session, not the class, so
-- a cancelled week or a one-off room change is a fact about that week only.
create table class_session (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  class_id      uuid not null references class(id) on delete cascade,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        session_status not null default 'scheduled',
  -- Per-session overrides. Null means "inherit from the class".
  room_id       uuid references room(id) on delete set null,
  teacher_id    uuid references staff_member(id) on delete set null,
  cancel_reason text,
  notes         text,
  register_closed_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (ends_at > starts_at)
);
