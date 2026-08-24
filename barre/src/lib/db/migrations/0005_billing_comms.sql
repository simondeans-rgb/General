-- ============================================================================
-- 0005 · Billing ledger, communications, notifications, audit
-- ----------------------------------------------------------------------------
-- Billing is modelled in full but not implemented in this iteration (deferred
-- by agreement). The shape matters now because family balance, invoice items
-- and refunds are painful to retrofit. No card data is stored anywhere: the
-- payment table holds a provider reference only.
-- ============================================================================

create table invoice (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  family_id     uuid not null references family(id) on delete restrict,
  term_id       uuid references term(id) on delete set null,
  number        text not null,
  status        invoice_status not null default 'draft',
  issued_on     date,
  due_on        date,
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  total_minor    bigint not null default 0,
  paid_minor     bigint not null default 0,
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references user_account(id) on delete set null,
  deleted_at    timestamptz,
  unique (studio_id, number)
);

create table invoice_item (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  invoice_id   uuid not null references invoice(id) on delete cascade,
  student_id   uuid references student(id) on delete set null,
  class_id     uuid references class(id) on delete set null,
  kind         charge_kind not null default 'tuition',
  description  text not null,
  quantity     numeric(8,2) not null default 1 check (quantity > 0),
  unit_minor   integer not null check (unit_minor >= 0),
  discount_minor integer not null default 0 check (discount_minor >= 0),
  total_minor  bigint generated always as
                 (round(quantity * unit_minor)::bigint - discount_minor) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table payment (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null references studio(id) on delete cascade,
  family_id     uuid not null references family(id) on delete restrict,
  invoice_id    uuid references invoice(id) on delete set null,
  amount_minor  bigint not null,
  method        text not null default 'card',
  -- Provider handle only. Never a PAN, never a CVC, never a raw token.
  provider      text,
  provider_ref  text,
  failure_code  text,
  succeeded_at  timestamptz,
  refunded_minor bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- ── Communications ─────────────────────────────────────────────────────────
create table communication (
  id           uuid primary key default gen_random_uuid(),
  studio_id    uuid not null references studio(id) on delete cascade,
  kind         comm_kind not null default 'direct',
  channel      comm_channel not null default 'in_app',
  family_id    uuid references family(id) on delete cascade,
  class_id     uuid references class(id) on delete cascade,
  subject      text,
  body         text not null,
  sent_by      uuid references user_account(id) on delete set null,
  sent_at      timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  -- A direct message needs a family; a class broadcast needs a class.
  check ((kind = 'direct' and family_id is not null)
      or (kind = 'class_broadcast' and class_id is not null)
      or (kind = 'studio_announcement'))
);

create table communication_read (
  id            uuid primary key default gen_random_uuid(),
  communication_id uuid not null references communication(id) on delete cascade,
  user_id       uuid not null references user_account(id) on delete cascade,
  read_at       timestamptz not null default now(),
  unique (communication_id, user_id)
);

create table communication_template (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  name        text not null,
  subject     text,
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table notification (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references studio(id) on delete cascade,
  user_id     uuid not null references user_account(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text,
  href        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ── Audit ──────────────────────────────────────────────────────────────────
-- Append only. No update or delete policy exists for any role, so the trail
-- cannot be rewritten from the application at all.
create table audit_log (
  id          bigserial primary key,
  studio_id   uuid references studio(id) on delete set null,
  actor_id    uuid references user_account(id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  summary     text,
  at          timestamptz not null default now()
);
