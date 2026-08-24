# Barre — security and privacy model

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
| `teacher` | Their own classes, the students in them, and a narrow safety brief |
| `guardian` | Their own family: their children, invoices, messages |

Cross-tenant isolation is absolute. A user with memberships in two studios sees
each separately; a user with none sees nothing at all.

## Data minimisation in practice

A teacher genuinely needs to know that a child in the room carries an EpiPen.
They do not need the diagnosis, the medication list or the family doctor.

So `medical_record` is closed to teachers entirely — no policy grants them
`select`. What they get instead is `student_safety_brief`, a `SECURITY DEFINER`
view exposing exactly seven columns: name, allergies, action plan, an alert
flag and one emergency contact — and only for children in classes they teach.

This is tested by asserting the view's column list, so widening it later fails
the suite rather than quietly leaking.

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
reference and a failure code. Stripe integration, when added, uses hosted
checkout so a PAN never reaches this application.

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

40 tests run against a real Postgres 16. They cover cross-studio isolation,
unauthenticated access, guardian scoping, teacher scoping, the medical
boundary and the exact columns of the safety brief, capacity enforcement
including that it counts rows the caller cannot see, waitlist ordering,
session generation across a daylight-saving change, soft deletion and the
audit trail's immutability.

`npm test`
