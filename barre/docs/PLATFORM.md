# Running Barre for many schools

Barre is sold to dance schools. Each school is a separate account (a
`studio`) with its own people in five roles — owner, administrator, teacher,
parent, student. Above them sits the **platform**: Barre's own staff, who set
schools up, manage plans and status, and help when asked.

## Who can do what

| | Barre staff | Owner | Administrator | Teacher | Parent / student |
|---|---|---|---|---|---|
| Create a school, invite its owner | ✓ | | | | |
| Change a school's plan or status | ✓ | | | | |
| Edit plan prices and limits | super admin | | | | |
| Erase a cancelled school | super admin, after 30 days | | | | |
| Invite owners and administrators | ✓ (when setting up) | ✓ | | | |
| Invite teachers, parents, students | | ✓ | ✓ | | |
| Change staff roles | | ✓ | | | |
| Remove someone's access | | ✓ | teachers, parents, students | | |
| Let Barre support in | | ✓ | | | |
| Export all the school's data | | ✓ | | | |
| See inside a school | only with the owner's grant, read-only, no health records | ✓ | ✓ | own classes | own family |

## Each school's brand

Every school shows its own **name, logo and colour** to its owner, staff,
parents and students, with a small "powered by Barre" credit (under the
name in the sidebar; at the foot of each page on a phone). Barre's own
console keeps Barre's colours. The owner sets it under **Account → Your
brand**, with a live preview; it is also a step in Setup.

- **One colour.** The school picks a preset or any colour; every shade the
  interface needs is derived from it (`lib/brand.ts`). A colour too pale for
  white text is deepened — keeping its hue — so buttons and tinted text
  always meet WCAG AA contrast, and the owner is told when that happened.
- **Logo upload.** Any PNG, JPG, WebP or SVG up to 5 MB. It is redrawn in the
  browser to a PNG no larger than 256 px before it is saved, so scripts in an
  SVG, photo metadata and huge originals never reach the database. The
  database also refuses anything but a PNG/JPEG/WebP data URL (the demo) or an
  https link (file storage, in production).
- Only the owner can change the brand, and not while the account is paused.

## The console (`/platform`)

- **Schools** — every school with its owner, plan, status and usage against
  the plan's limits; monthly revenue from paying plans; trials ending soon;
  schools overdue or suspended.
- **A school** — change plan; extend a trial; mark paid or overdue; suspend
  or cancel (with a reason the owner sees); reinstate; erase once a
  cancellation's notice period is over. Counts of people by role, never
  names. Owner and administrator invitations, with fresh links. Open a
  read-only support view when the owner has allowed it. The account's
  history.
- **Plans** — price and limits for each plan. Moving a school down a plan
  never deletes anything; it only stops additions over the new limit.

## A school's Account page (`/account`)

Plan and usage; everyone with access, grouped by role, with role changes and
removal; pending invitations; Barre support access (owner only); export
everything as JSON (owner only).

## Lifecycle

```
created ──▶ trialling ──▶ active ◀──▶ past_due
                │            │            │
                └────────────┴──▶ suspended ──▶ cancelled ──(30 days)──▶ erased
                                      ▲  reinstate  │
                                      └─────────────┘
```

Suspended and cancelled schools are **read-only**: everyone can still sign in
and look, the owner can export, nothing can change. This is enforced by
Postgres — their memberships only exist inside read-only transactions.

## Invitations

Single-use links valid for 14 days. The database stores a SHA-256 hash, not
the token, so the link is shown once when created ("New link" makes another
and withdraws the old). In production the person creates their login with
Supabase Auth first; if their sign-in email differs from the invited
address, acceptance is refused. A parent is invited into a specific family; a
student's login stays off until a parent approves it.

## What is not built yet

- **Taking payment from schools.** Plans drive limits and the revenue
  figure; charging schools (Stripe Billing subscriptions) is next. When it
  arrives, a failed subscription payment moves a school to `past_due` and,
  after a grace period, `suspended` — the statuses already exist.
- **Sending invitation emails.** Links are copied by hand today.
- **Self-serve sign-up.** Chosen against for now: Barre creates schools.
- **Automatic trial expiry.** Trials show their end date; moving an expired
  trial on is a manual decision in the console.
