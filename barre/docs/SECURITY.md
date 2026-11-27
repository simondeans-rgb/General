# Swayvo — security and privacy model

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
widening fails the suite until it is a deliberate decision. Swayvo support
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

## Swayvo staff and the schools they serve

Swayvo's own staff are **not** members of any school. Being a platform admin
grants no access to a single child. The console reads account facts — plan,
status, owner contact, counts — through `app.platform_*` functions that
return nothing to anyone else, and the test suite asserts a platform admin
sees zero rows of every family-level table.

**Support access** is how they help. Only a school's owner can grant it, for
at most seven days, with a reason. While granted, a Swayvo admin may open a
view of that one school as an administrator would see it, except:

- **Read-only, enforced by Postgres.** Every read in Swayvo runs in a READ
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

## Media of children

Videos and photos of pupils are the most sensitive thing a dance school
shares, so who may see them is decided in the database (migration 0057), not
in the screens.

**Teachers see their own classes' material.** A teacher reads library
material pinned to a class they teach, assist or cover (from the day before a
covered session to a fortnight ahead), to a level they teach, or to one of
their pupils; plus anything they added themselves and the studio-wide pages
the office marks *for all staff*. Owners and administrators read everything,
as before. Files and assignments follow the resource they belong to. Only the
office can mark something for all staff.

**Media that shows children needs every named child's consent.** A resource
can say it shows children (`resource.shows_children`, asked on every video or
photo upload) and name them (`resource_child`, picked from the class, with
each child's current consent shown). Families and students can read it only
while every named child currently has the matching consent: video consent for
video and audio, photography consent for photos and documents. "Not recorded"
counts as no. It is worked out on every read, through the same
`app.consent_effective` the rest of the app uses (most restrictive guardian
wins), so withdrawing consent hides it on the next read and granting it shows
it again, with nothing to re-run. Staff still see it, with "Hidden from
families: consent not given for N children".

- Marked as showing children with nobody named, it stays staff-only until the
  children are named or the office confirms no child can be identified
  (`no_identifiable_children`, recorded with who and when).
- Media of children never reaches families as "studio-wide": it must be
  pinned to a class, level or child, and a family sees it only through a
  child of theirs in that class (and with the consents above).
- Once something is marked as showing children, only the office can take
  that back. A teacher names only children they teach, on their own material.
- Families never read `resource_child`; staff status comes from
  `app.resource_child_status`, which returns nothing to a family.

The rule lives in `app.resource_ids_for_student` and the guardian and student
policies on `resource`; `resource_file` and the bucket check below inherit it.
Tests: `tests/video-access.test.ts`.

**No permanent URLs.** The demo stores files in the in-browser database and
plays them from a `blob:` URL that is minted only after the read passed row
level security and is revoked when the row closes. The hosted adapter
(`src/lib/storage-hosted.ts`, wired up in `src/lib/storage.ts`) uses a
**private** Supabase Storage bucket and signs a URL per Play that expires in
60 seconds (never more than 5 minutes). It signs only after
`app.can_read_media(object_key)` says yes, and refuses anything that comes
back as an `/object/public/` URL. A link that has been handed out expires on
its own soon after consent is withdrawn; a new one cannot be minted. The
bucket's own policies call the same function, so the storage API itself
refuses a direct read:

```sql
-- Supabase: run once per project. The bucket must be private.
insert into storage.buckets (id, name, public) values ('media', 'media', false);
create policy media_read on storage.objects for select to authenticated
  using (bucket_id = 'media' and app.can_read_media(name));
create policy media_write on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and app.is_staff(((storage.foldername(name))[1])::uuid));
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and app.is_admin(((storage.foldername(name))[1])::uuid));
```

`app.can_read_media` is `security invoker` on purpose: it reads
`resource_file` under the caller's own policies. Objects whose row never
committed (an upload that failed half way) are unreachable and should be
removed by a nightly sweep. The hosted path has not been run against a real
project from this build; its URL handling is unit-tested with a stubbed fetch.

**View, not download.** For families and students, media showing children
has no download link: video plays with `controlslist="nodownload"`, no
picture-in-picture and no right-click menu, and a photo is shown inline
rather than offered as a file. This is a courtesy, not a control. Nothing in
a browser can stop a screenshot, a screen recording or a phone pointed at the
screen; that is why the consent rule above is enforced before the file is
ever sent.

**Links.** A resource that is a link to another site (YouTube, Vimeo) is only
as private as that site's settings, and its URL is permanent. The upload form
says so when a video link is marked as showing children: upload the file
instead. Skill demonstration links (`framework_skill.demo_url`) are for staff
or professional demonstrations, not footage of pupils.

## What is NOT protected in this build

Being plain about it:

- **There is no password check.** The demo picks an identity from a list
  because there is no server to prove one to. What that identity may *see* is
  fully enforced; who they are is not verified. Supabase Auth replaces this,
  and nothing else changes.
- **The browser demo's data is local.** It lives in IndexedDB on the viewer's
  own machine, holds seeded fictional people, and is never transmitted.
- **Media cannot be protected from screen capture.** See "Media of children".

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
