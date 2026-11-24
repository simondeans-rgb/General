# Sanaa — security and privacy model

This platform holds data about children. The security model is therefore in the
database, where it applies to every caller, rather than in the interface, where
it applies only to the paths someone remembered to guard.

## The shape of it

Every query runs as the `authenticated` role inside a transaction that sets
`request.jwt.claims` to the caller's identity. Access is then decided by row
level security. There is no "current studio" global and no service key in
client code.

```
runAs(session, …)
  └ begin
    └ set_config('request.jwt.claims', {sub: userId}, true)
    └ set local role authenticated      -- never a table owner
    └ …your query…                      -- RLS decides what exists
    └ commit / rollback
```

`ALTER TABLE … FORCE ROW LEVEL SECURITY` is set on all 31 tables. Without it,
the browser demo — which owns its own database — would bypass every policy and
demonstrate nothing.

## Roles

| Role | Sees |
|---|---|
| `owner` | Everything in their own studio, including studio settings |
| `admin` | Everything operational; not studio settings |
| `teacher` | Their own classes, the students in them, a narrow safety brief, notices for their classes and studio announcements. Not family conversations, not money |
| `guardian` | Their own family: their children, invoices, their conversation with the studio, notices for their children's classes |

Cross-tenant isolation is absolute. A user with memberships in two studios sees
each separately; a user with none sees nothing at all.

## Data minimisation in practice

A teacher in the room needs to know what a child's medical need is and what
to do about it. They do not need the family doctor, and they do not need
anything about children they do not teach.

So `medical_record` is closed to teachers entirely — no policy grants them
`select`. What they get instead is `student_safety_brief`, a `SECURITY DEFINER`
view, and only for children in classes they teach (or trial in, or take to
an event): allergies, conditions, medication, the emergency plan, an urgent
flag, a "need recorded" flag for the marker beside the name, every emergency
contact, and photo consent. GP details are not in it.

*This was widened by the studio owner's decision (migration 0020).* The first
version gave teachers only the allergy line and the plan, and only flagged
children marked urgent. In practice a teacher needs the asthma and the
inhaler as much as the allergy. The office's medical form says plainly what
teachers will see.

The view's column list is asserted in the test suite, so any further
widening fails the suite until it is a deliberate decision. Sanaa support
staff get no rows from the view at all.

## The audit trail

`audit_log` is append-only. `update` and `delete` are revoked from
`authenticated` at the grant level, so those statements are refused before any
row is considered — a harder stop than a policy that filters to zero rows.

Triggers write to it on `medical_record`, `consent_record`, `enrolment`,
`payment`, `membership` and `staff_member`: the tables where "who changed this,
and when" actually matters.

## Soft deletion

Deleting goes through `app.soft_delete(table, id)`, which checks the caller is
an owner or admin, sets `deleted_at`, and writes an audit row.

It works this way for a specific reason. Under `FORCE` row level security,
Postgres requires the row produced by an `UPDATE` to still satisfy the table's
`SELECT` policies — and those policies hide `deleted_at is not null`. A plain
`update … set deleted_at = now()` is therefore rejected outright.

The tempting fix is to stop hiding deleted rows in the policy and filter in
application queries instead. That moves a guarantee out of the database and
into whichever query somebody writes next. One authorised, audited entry point
is the better trade.

(A `RESTRICTIVE` select policy reads more tidily but cannot be used here:
Postgres applies restrictive policies to the *new* row on update, which makes
soft deletion impossible. This was established by experiment, not assumption.)

## Payments

No card data is stored, ever. `payment` holds a provider name, a provider
reference and a failure code. Card money can only enter the ledger through
`app.apply_provider_event`, which is executable by `service_role` alone (a
verified webhook), idempotent on the provider reference, and refuses
anything without our own invoice id. Users — the owner included — cannot
record a card payment by hand. Amounts for Checkout come from the database,
never from the browser. See docs/PAYMENTS.md.

Every billing change goes through an `app.*` function that checks the caller
is the office; the derived figures (totals, paid, balance) are written only
by triggers, and the recalculation functions are not callable by any user.

## Messages and notifications

**A leak that was closed.** The first communications policy let every member
of staff read every message. A narrower teacher policy was added later, but
the broad one stayed — and permissive policies are OR-ed, so teachers could
still read every family's private conversation with the office, payment
reminders included. Migration 0017 replaces it: direct conversations are
readable by the office and that family only, and `tests/inbox.test.ts`
asserts a teacher sees none.

This is also a safeguarding position, not just a privacy one: one-to-one
teacher–parent channels outside the office's view are what UK safeguarding
guidance warns against. Teachers post notices to their own classes; the
office holds conversations.

- **Nobody can send as someone else.** `sent_by` is set from the session;
  supplying another id is refused. The studio is taken from the family, so a
  message cannot be pointed at another tenant.
- **Names do not leak through the sender lookup.** `app.sender_name` returns
  staff names to anyone in the studio, but a guardian's name only to the
  office and their own family.
- **Notifications carry no health data.** A medical update produces "medical
  details updated", never the allergy. Tested.
- **Notifications cannot be forged.** No user can insert one; only database
  triggers write them, and the helpers are not executable by users.
- **The email outbox** (addresses of prospective families) is readable by the
  office only.

## Sanaa staff and the schools they serve

Sanaa's own staff are **not** members of any school. Being a platform admin
grants no access to a single child. The console reads account facts — plan,
status, owner contact, counts — through `app.platform_*` functions that
return nothing to anyone else, and the test suite asserts a platform admin
sees zero rows of every family-level table.

**Support access** is how they help. Only a school's owner can grant it, for
at most seven days, with a reason. While granted, a Sanaa admin may open a
view of that one school as an administrator would see it, except:

- **Read-only, enforced by Postgres.** Every read in Sanaa runs in a READ
  ONLY transaction, and the support membership exists only inside such a
  transaction. There is no write path for it to use.
- **No health records**, grant or no grant — both medical policies exclude a
  support viewer.
- **On the record.** Opening the view writes to the school's own audit log,
  shown on its Account page.
- **Ends instantly** when the owner revokes it or it expires.

**Suspended and cancelled schools** are read-only by the same mechanism.

**Invitation tokens** are stored only as SHA-256 hashes; links expire after 14
days, work once, and can be withdrawn.

**Session settings are not trusted.** Postgres lets any session set a custom
setting, so none is used as a permission. (Three were, and were removed: one
could have silenced the audit trail, one silenced notifications, one let a
message pass as sent by "the studio".)

**One transaction at a time in the browser.** The demo's single database
connection previously let a background read's ROLLBACK cut across a write in
progress, which then ran without the user's identity (and was refused).
Transactions are now serialised.

## School logos

A logo is user-supplied content shown to every family, so it is treated as
hostile: redrawn to PNG pixels on a canvas before saving (an SVG's scripts
cannot survive that), shown only in `<img>` (which never runs script), and
constrained in the database to raster data URLs or https links. Tested with
an SVG carrying both an `onload` handler and a `<script>` element: neither
ran, and what was stored was a PNG.

## What is NOT protected in this build

Being plain about it:

- **There is no password check.** The demo picks an identity from a list
  because there is no server to prove one to. What that identity may *see* is
  fully enforced; who they are is not verified. Supabase Auth replaces this,
  and nothing else changes.
- **The browser demo's data is local.** It lives in IndexedDB on the viewer's
  own machine, holds seeded fictional people, and is never transmitted.

## UK GDPR

- **Minimisation** — health data is separated and teachers get a narrow view.
- **Purpose limitation** — the role hierarchy matches the job each person does.
- **Accountability** — the audit trail is append-only and covers the
  special-category tables.
- **Erasure** — soft deletion hides a record from every read immediately; the
  audit trail is what remains, and holds ids rather than personal detail.
- **Consent** — `consent_record` is per student and per purpose (photography,
  social media, medical treatment, data processing, marketing, collection by
  another adult), with a grant timestamp and an optional expiry.

## Test coverage

Over 200 tests run against a real Postgres 16. They cover cross-studio isolation,
unauthenticated access, guardian scoping, teacher scoping, the medical
boundary and the exact columns of the safety brief, capacity enforcement
including that it counts rows the caller cannot see, waitlist ordering,
session generation across a daylight-saving change, soft deletion and the
audit trail's immutability.

`npm test`
