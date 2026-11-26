# Swayvo — architecture

## What this is

A dance studio management platform: one product with three quite different
experiences sharing one database and one permission model.

- **Owner / admin** — a task-oriented command centre, at its best on a desktop.
- **Teacher** — their own day and a register built for one hand in a studio.
- **Parent** — a small consumer app: next class, what is owed, what the studio said.

A fourth `student` role is anticipated: `app_role` is an enum and every policy
resolves through `membership`, so adding it is a migration and a set of
policies, not a redesign.

## Two runtimes, one codebase

Queries are plain SQL executed through an adapter. The same migrations, the
same policies and the same seed run in both places:

| | Browser demo | Server |
|---|---|---|
| Engine | PGlite — Postgres compiled to WebAssembly | Postgres 16, or Supabase |
| Storage | IndexedDB, per browser | Managed volume |
| Identity | Pick a seeded person | Supabase Auth |
| Policies | Identical | Identical |

This is why the demo is worth trusting: it is not a mock with permissions
sketched in the interface. Sign in as the tap teacher and `select * from
medical_record` returns nothing, because the database refuses.

The demo is also why `output: 'export'` is set. Everything is prerendered and
runs client-side, which is what allows it to live on static hosting with no
backend at all.

### Moving to a server

Three things change, and nothing else:

1. `src/lib/auth/session.tsx` — swap the persona picker for Supabase Auth. The
   rest of the app only ever reads `session.userId`.
2. `src/lib/db/client.ts` — swap the PGlite adapter for `@supabase/supabase-js`
   or `pg`. `runAs`/`readAs` keep their signatures; the transaction wrapper that
   sets `request.jwt.claims` becomes Supabase's own per-request behaviour.
3. `next.config.ts` — drop `output: 'export'`.

Migrations move across as-is: `supabase db push` over `src/lib/db/migrations`.

## Why selection lives in the query string

Record detail is `?id=…` rather than `/families/[id]`. Three reasons, in order
of weight:

1. A static export must pre-render every dynamic segment, so `[id]` routes would
   have to enumerate the database at build time.
2. Master–detail is the better interface here anyway: a list beside a panel on
   desktop, a sheet on a phone, no full page transition either way.
3. It behaves identically after the move to a server.

## Data layer

```
src/lib/db/
  migrations/*.sql     source of truth, runnable through psql
  migrations/generated.ts   the same files bundled for the browser
  seed/data.ts         demo studio, generated relative to today
  client.ts            adapter, session wrapper, boot and reset
src/lib/repos/*.ts     SQL per screen, typed
src/lib/query.ts       useRows / useRow — every read carries the session
```

Every read goes through `useRows`, which goes through `readAs`, which opens a
transaction, sets the caller's claims, drops to the `authenticated` role and
rolls back. There is no code path that queries the database without a session
attached, which is the property that makes the permission model trustworthy.

Repository SQL is deliberately *not* filtered by tenant. `MY_INVOICES` is
`select … from invoice` with no `where family_id = …`, because row level
security has already limited the rows. Filtering again in the query would hide
a policy mistake rather than catch it.

## Schema decisions worth knowing

**`studio_id` is on every tenant table.** Denormalised on purpose. A policy
that needs a three-table join to establish tenancy is evaluated per row, and
that is the usual reason RLS gets switched off for being slow.

**The enquiry funnel is its own table.** Someone at "enquiry" or "trial booked"
holds no place in a class. Modelling them as enrolments with extra status
values would corrupt every capacity count, waiting list and register in the
system — and an enquiry has to exist before a `family` row does, which an
enrolment cannot.

**Health data is separate from `student`.** It is special-category data under
UK GDPR. Separating it lets a teacher have the roster without the diagnosis,
and gives the audit trigger one narrow table to watch.

**Attendance hangs off `class_session`, not `class`.** A cancelled week, a
covered teacher or a room change is a fact about that week only.

**Business rules live in the database.** Capacity, waitlist ordering and
session generation are triggers and functions, so they hold no matter which
client writes the row. The counting functions are `SECURITY DEFINER` so that a
reader who cannot see every enrolment still cannot squeeze a child into a full
class.

## Money adds up in the database

Invoice totals, amounts paid, invoice status and family balance are derived
by triggers (migration 0016) from the rows that justify them: items,
payments, refunds. Nothing writes those figures directly, so they cannot
disagree. Credit is money held on account and drawn down by `account`
allocation rows, oldest invoice first — every movement is a row, nothing is
edited to make a sum work. Bank transfers, cash, credits, refunds and voids
are `app.*` functions that check the caller is the office.

## Things that happen without anyone pressing a button

- **Notifications** (0017) are written by triggers when the event happens —
  a family message, a failed card, a trial booked, a waiting-list offer —
  never to the person who caused it, and not while a seed or import runs
  (`app.quiet`).
- **Automations** (0018) are rules: an event the studio cannot change and a
  template it can. One idempotent runner (`app.run_automations`) evaluates
  them; `automation_run` is unique per rule and subject, so a scheduler can
  call it every few minutes and nothing goes twice. A new automation is one
  enum value and one branch in `app.automation_candidates`.
- **Waiting-list offers expire** in the same runner and pass the place on.

## Offline registers

`attendance_record.client_marked_at` is the moment the teacher tapped, and a
conflicting write only lands if it is newer. `lib/offline/attendance-queue`
holds marks that could not be sent (one per child, latest tap wins) and
flushes them when the connection returns. The demo never goes offline — its
database is in the tab — but the server deployment will, and the rule that
makes late syncs safe is already in the SQL and tested.

## Seams that are deliberately open

| Seam | What exists | What plugs in |
|---|---|---|
| Card payments | `lib/payments/stripe.ts`: event mapping, signature check, Checkout params; `app.apply_provider_event` (service role only, idempotent) | Two server routes — see docs/PAYMENTS.md |
| Email / SMS / push | `comm_channel` on every message; `outbound_message` queue for people without accounts | A delivery worker that sends `queued` rows |
| Scheduler | `app.run_automations(studio)` | A cron calling it as `service_role` |
| AI assistant | `lib/assistant`: the `AssistantBackend` contract; Cmd-K routes questions to saved views | A backend whose every query runs through the caller's session |
| Studio Pulse | Five live component rates; `lib/pulse/score.ts` computes the composite and withholds it below 180 days of history | Nothing — it switches itself on |
| Mobile apps | Queries are plain SQL over one adapter; business rules live in Postgres; the offline queue takes injected storage | An Expo app reuses `lib/repos`, `lib/payments`, `lib/offline` |

Progression (`skill_assessment` with Not started / Developing / Secure /
Mastered), events, resources and student logins are modelled and partly
built (0003, 0010–0012). Shows-and-recitals entities beyond `studio_event`,
and the shop, are not modelled yet: no placeholder screens exist for them.
