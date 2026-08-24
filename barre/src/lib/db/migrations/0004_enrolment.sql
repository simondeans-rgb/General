-- ============================================================================
-- 0004 · Enrolment, trials, waitlists, attendance
-- ----------------------------------------------------------------------------
-- Schema decision: the enquiry funnel lives in its own table rather than as
-- extra values on enrolment.status. A person at "enquiry" or "trial booked"
-- has no place in a class, and modelling them as enrolments would corrupt
-- every capacity count, waitlist calculation and register in the system.
-- `enquiry` also has to exist before a Family does, which an enrolment cannot.
-- ============================================================================

create table enrolment (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  class_id     uuid not null references class(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  status       enrolment_status not null default 'active',
  started_on   date not null default current_date,
  ended_on     date,
  price_minor  integer check (price_minor >= 0),   -- null = inherit class price
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references user_account(id) on delete set null,
  deleted_at   timestamptz
);

-- A student may hold only one live place in a class at a time. Partial index
-- so a student who left can be re-enrolled later without tripping over history.
create unique index enrolment_one_active_place
  on enrolment (class_id, student_id)
  where status = 'active' and deleted_at is null;

create table trial (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  class_id     uuid not null references class(id) on delete cascade,
  session_id   uuid references class_session(id) on delete set null,
  student_id   uuid references student(id) on delete cascade,
  enquiry_id   uuid,                                  -- fk added after enquiry
  status       trial_status not null default 'requested',
  price_minor  integer check (price_minor >= 0),
  attended_at  timestamptz,
  outcome_note text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references user_account(id) on delete set null,
  deleted_at   timestamptz,
  check (student_id is not null or enquiry_id is not null)
);

create table waitlist_entry (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  class_id     uuid not null references class(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  status       waitlist_status not null default 'waiting',
  position     integer not null,
  offered_at   timestamptz,
  offer_expires_at timestamptz,      -- reserved for automatic offers
  responded_at timestamptz,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create unique index waitlist_one_live_entry
  on waitlist_entry (class_id, student_id)
  where status in ('waiting', 'offered') and deleted_at is null;

create table enquiry (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  stage         enquiry_stage not null default 'enquiry',
  -- Free-text until the prospect becomes a real Family/Student record.
  contact_name  text not null,
  contact_email text,
  contact_phone text,
  child_name    text,
  child_dob     date,
  interest_class_id uuid references class(id) on delete set null,
  interest_style_id uuid references dance_style(id) on delete set null,
  source        text,
  family_id     uuid references family(id) on delete set null,
  student_id    uuid references student(id) on delete set null,
  enrolment_id  uuid references enrolment(id) on delete set null,
  closed_reason text,
  next_action_on date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references user_account(id) on delete set null,
  deleted_at    timestamptz
);

alter table trial add constraint trial_enquiry_fk
  foreign key (enquiry_id) references enquiry(id) on delete cascade;

create table attendance_record (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  session_id   uuid not null references class_session(id) on delete cascade,
  student_id   uuid not null references student(id) on delete cascade,
  status       attendance_status not null,
  reason       text,
  reported_by_guardian boolean not null default false,
  marked_by    uuid references user_account(id) on delete set null,
  marked_at    timestamptz not null default now(),
  -- Set by the client when a register is taken offline; lets a later sync
  -- resolve conflicts by intent rather than by whichever write landed last.
  client_marked_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (session_id, student_id)
);
