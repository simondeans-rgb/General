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

Files are the one place a fourth swap is needed: set `storage` in
`src/lib/storage.ts` to `hostedStorageAdapter({...})`, which keeps uploads in a
private Supabase Storage bucket and plays them through signed URLs that expire
in 60 seconds. `resource_file` then holds the object key instead of the bytes.
The bucket policies are in docs/SECURITY.md, "Media of children". No public
bucket, and no permanent URL for a child's video, anywhere.

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

## Performance budget

Every main screen's queries must answer in under **500 ms** on the test
database, each run as the person who uses that screen (owner, administrator,
location-limited administrator, teacher, cover teacher, guardian, student).
`tests/perf-budget.test.ts` holds the list, taken from the queries the demo
actually issues when each screen and tab is opened, uses the exported SQL from
`src/lib/repos/*.ts` with the parameters the screens pass, and fails the suite
when one goes over. It prints the slowest, so a creeping query is visible
before it fails. 500 ms is generous on purpose (a busy CI machine must not
flake it); typical times are 5–200 ms, so a 10× regression is caught. The
in-browser demo runs the same SQL roughly 5–10× slower than server Postgres,
which is the other reason the budget is not looser.

What made screens slow, and the rules that keep them fast:

- **Ask "may the caller…" once per query, not once per row.** A policy such as
  `app.is_admin(studio_id)` runs a security-definer function for every row it
  filters (~0.2 ms each: memberships, school status, chosen school, location
  limits). Migration 0068 rewrote every such call to the set form
  `coalesce(studio_id in (select app.admin_studio_ids()), false)`, which
  Postgres evaluates once (a hashed subplan). Write new policies that way, or
  call `select app.speed_up_policies()` at the end of a migration that adds
  policies in the old style; it records each original in `app.policy_rewrite`,
  and `tests/perf-access.test.ts` restores the originals in a transaction and
  checks every table shows every role exactly the same rows.
- **No per-child functions in a list.** A function that checks access for one
  child (`app.can_see_student`, `app.consent_now`, `app.collection_brief`)
  rebuilds the caller's whole set of visible children each time. For a list,
  use a whole-list function that checks once and aggregates:
  `app.visible_student_ids`, `app.term_attendance_pcts`, `app.collection_briefs`,
  `app.consents_now`, `app.my_class_names` (each takes `uuid[]`; a child the
  caller cannot see has no row).
- **JIT is off** (`alter database … set jit = off`, migration 0068). Row-level
  security inflates cost estimates, so Postgres was compiling 20 ms queries to
  machine code for 0.4–6 s. On a hosted database where a migration may not
  change this, set `jit = off` in the service's settings.
- Index before you trust a sequential scan on a large table; at demo scale the
  tables are small enough that every remaining plan was dominated by policy
  work, not scans.

### First load of the demo

The demo downloads Postgres itself and, the first time only, builds the schema
(one step per migration) and the sample school. So:

- The engine's two big files are also published gzipped by
  `scripts/copy-pglite.mjs` (10.1 + 6.3 MB become 3.4 + 2.1 MB) and unpacked in
  the browser with `DecompressionStream`, so even a host that does not compress
  sends a third of the bytes. Browsers without it fetch the plain files.
- `public/db-preload.js`, an async script in the head (`app/layout.tsx`),
  starts those downloads while the page is still being read, in parallel with
  the app shell's JavaScript. Not on `/welcome`.
- The loader (`components/app/database-gate.tsx`) shows the real stages from
  `lib/db/client.ts` (`onBootProgress`): megabytes downloaded, migrations done
  out of all, and a time left measured from this device's own speed.
- The database is kept in IndexedDB and only rebuilt when the schema or seed
  fingerprint changes; a return visit skips the schema and the sample school.
- Every read and write goes through PGlite's `transaction()`: outside it,
  PGlite copies the database to IndexedDB after every statement (five times
  per read, each a walk over ~1,600 files). A write is copied once, after it
  commits, before `runAs` returns. Building the schema is one `transaction()`
  that commits after each migration, copied once at the end.
- `globalThis.__barreBoot` holds the timings of the last boot;
  `globalThis.__barreQueryLog = []` records every read with its time.

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

## The school on the home screen

`app/manifest.ts` is Swayvo's, written once at build time: the demo is a
static export, so there is no request to vary it by. Signed in to a school,
`useBrandedInstall` (`components/app/pwa.tsx`, rules in
`lib/install-identity.ts`) makes that school's version in the browser: icons
drawn on a canvas (the logo on a white plate on the school's colour, or its
initials), a manifest served as a `blob:` URL with those icons as `data:`
URLs, and the iOS pieces Safari reads when "Add to Home Screen" is tapped
(`apple-touch-icon`, `apple-mobile-web-app-title`). Each school's manifest has
its own `id`, so a parent at two schools can install both. Signing out puts
Swayvo's back. `/family` shows an install guide with the steps for the phone
in hand. A hosted deployment can serve the same thing from a per-school route
(`/s/<slug>/manifest.webmanifest`) built from the same `installIdentity()`.
Checked in headless Chromium (the page's manifest link resolves to the
school's name, colour and icons); not yet checked on real iPhones and Android
launchers, so treat install on devices as unverified until it is.

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
