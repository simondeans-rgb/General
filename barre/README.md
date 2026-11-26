# Swayvo

**The operating system for running a dance studio.**

One product, three experiences, one permission model: a command centre for the
studio owner, a register a teacher can work one-handed, and a small consumer
app for parents.

Built for this brief as a first slice — schema, security and the owner and
teacher core, with a focused parent experience so all three roles are real.

## Try it

**[simondeans-rgb.github.io/General/studio](https://simondeans-rgb.github.io/General/studio/)**

Pick any of the four people on the sign-in screen. They are seeded staff and
parents of Northstar Dance Academy, a fictional studio in south-east London
with 30 families, 50 students and 12 classes.

Worth doing in this order:

1. **Freya (owner)** — Today shows what is on and what needs attention. Grade 3
   Ballet is full with eight children waiting; three card payments have failed.
   - **Billing**: open a declined invoice, send the family a reminder drafted
     from the studio's template, or record a bank transfer and watch the
     balance move. **New invoice** adds a family's term fees in one tap.
   - **Inbox**: three families are waiting for a reply. **Automations** shows
     trial confirmations and reminders due; **Run now** sends them, and
     running it again sends nothing twice.
   - **Reports**: attendance by week, places filled, conversion — and Studio
     Pulse, which shows its parts but withholds the score until there is
     enough history to trust it.
   - **Requests**: Hannah has sent a medical update about Nia. **Acknowledge**
     tells her it arrived; **Acknowledge & add to record** puts her words on
     Nia's record and tells her, in one step — and Nia's teachers see it.
   - **Account → Your brand**: Northstar's navy and star logo are what every
     parent sees, "powered by Swayvo". Try another colour or upload a logo —
     the preview updates before anyone else sees it.
   - Press **⌘K** for the questions the assistant will answer, and the screens
     that answer them today.
2. **Marcus (teacher)** — open a class and take the register. Four taps per
   child, or "all present" for the usual case. Try navigating to `/people` —
   he is refused.
3. **Hannah (parent)** — her next class, what she owes, what the studio said.
   She can see three children, which are hers, and no others. **Messages** is
   her conversation with the studio; tap an invoice in **Payments** to see its
   lines.

4. **Jordan (Swayvo platform admin)** — first on the sign-in page under "You,
   running Swayvo", or via **Switch person** at the bottom of the sidebar.
   Every school on Swayvo: plans, status, usage, revenue. **New school** creates an account and an owner invitation
   link; open it (signed out, or in a private window) to join as that owner.
   Northstar's owner has allowed support access: open its read-only view
   from Northstar's panel. Pointe & Flex is suspended — sign in as its owner
   from the switcher to see what that means.

## The demo runs a real database

Postgres is compiled to WebAssembly and runs in the browser tab, created from
the same migrations the production app uses and governed by the same row level
security policies. First load takes about three seconds while it starts and
seeds; after that it is instant, and your changes persist.

So when Marcus cannot see another teacher's students, that is the database
refusing him — not this interface choosing not to render them. `Studio → Reset
demo data` puts it back.

## Versions and previews

- **Live demo** — `/General/studio/`, built from the default branch. Changes reach it only by merging.
- **Preview** — `/General/studio-next/`, the work in progress on the `studio` branch. It keeps its own
  demo database and sign-in, so trying the preview never disturbs the live demo. Build it with
  `NEXT_PUBLIC_BASE_PATH=/General/studio-next NEXT_PUBLIC_SITE_KEY=next npm run build && node scripts/copy-export.mjs studio-next`.
- **`sanaa-v1`** — a frozen branch marking the version that was live before the next round of
  significant changes. Nothing is pushed to it; compare against it or restore from it.

## Running it locally

```bash
npm install
npm run dev              # http://localhost:3000
```

Against a real Postgres, for the schema and the tests:

```bash
createdb barre_dev
export DATABASE_URL=postgresql://postgres@localhost:5432/barre_dev
npm run db:reset         # migrations + demo data
npm test                 # ~190 permission, ledger and business-rule tests
```

```bash
npm run build            # static export into out/
npm run export:demo      # and publish it to ../studio for GitHub Pages
```

## Stack

TypeScript · Next.js 16 · React 19 · Tailwind 4 · TanStack Query · Postgres 16
· PGlite · Vitest. No extensions are required by the schema, so it runs
unchanged on Supabase, a plain server, or in the browser.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the two runtimes share one
  codebase, why selection lives in the query string, and the schema decisions
  that would be expensive to change later.
- [docs/SECURITY.md](docs/SECURITY.md) — the permission model, why teachers
  cannot read the medical table or family conversations, and what is
  deliberately *not* protected in this build.
- [docs/PLATFORM.md](docs/PLATFORM.md) — running Swayvo for many schools: the
  console, plans, invitations, support access and an account's lifecycle.
- [docs/DECISIONS.md](docs/DECISIONS.md) — where the build departs from the brief, and why.
- [docs/PAYMENTS.md](docs/PAYMENTS.md) — the ledger, and the two server routes
  that switch on card payments with Stripe.
- [docs/brand/GUIDELINES.md](docs/brand/GUIDELINES.md) — the Swayvo brand: logo, colour, type, voice.
- [docs/brand/DESIGN-SYSTEM.md](docs/brand/DESIGN-SYSTEM.md) — the rules every screen follows; live at `/design`.
- [docs/brand/FINAL-ASSESSMENT.md](docs/brand/FINAL-ASSESSMENT.md) — what was tested and the quality scorecard.
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — the automated checks
  (`npm run a11y`) and the manual screen-reader review still to do.

## What is built, and what is not

**Built and working:** the platform console (schools, plans, status,
invitations, read-only support access), each school's Account page (access by
role, invitations, support, export), schema, role routing, studio
setup, locations, terms, styles and levels, staff, families and students,
classes with roster and waiting list, the timetable in four views, the
enquiry funnel, the teacher register (with an offline queue), the parent app,
student logins and hubs, billing (invoices, transfers, cash, credit, refunds,
voids, reminders), the inbox (family conversations, class and studio
broadcasts, templates), the notification centre, trial and waiting-list
automations, and reports.

**Added after the expert review** (the report's R-numbers in brackets):
one-off changes to a single class — cancel, move, cover — with families told
(R-004); every trial child on the register (R-005); teachers' fortnight and
cover requests (R-030); class transfers (R-042); parents editing their own
details and emergency contacts (R-016); class pricing models, trial prices and
assistants (R-009); term billing runs with sibling and multi-class discounts
(R-010, R-011); CSV exports (R-012); duplicating classes and rolling a term
over (R-008); spreadsheet import (R-013); office enquiries, parent
self-service and a public trial-booking page per school (R-014); ⌘K search
across people and invoices (R-044); read receipts and reminders (R-018);
notification preferences and quiet hours (R-019); teachers writing to
families in the open, and requests in the family conversation (R-028);
scheduled messages (R-037); calendar downloads (R-036); undo for removals
(R-043); skill frameworks, class feedback in minutes, term reports, a
progress timeline, goals, reflections and milestones (R-020 – R-026); shows
and events with invitations, running order, rehearsals, chaperones and fees
(R-015); a safeguarding concern log (R-033); staff DBS and training expiry
(R-035); leaver data retention (R-041); and one login across several
schools (R-031). Then: drop-in classes, class packs and adults booking for
themselves (R-034); optional credit when the school cancels a class; email,
text and push delivery with a safe queue and a scheduler (R-003, R-017,
docs/DELIVERY.md); an installable app; and pilot activation tracking in the
platform console (R-040).

**Added after the second review:** monthly billing runs alongside term runs
(R-050); per-family discounts such as bursaries and staff rates, shown to
families only as "Discount" (R-056); an aged-debt report and a Xero
sales-invoice export (R-055); an optional pay-before-use rule for packs and
drop-ins, with an on-account limit, and public bookings held until paid
(R-049); a privacy notice, consent and rate limits on the public pages
(R-048); retention for stale enquiries, old families' invoices and closed
concerns (R-052); teacher–family reply threads the office can read (R-054);
notifications that follow the chosen school (R-051); a daily email digest
(R-037); private calendar subscription links (R-036); exam sessions, entries
and results that become milestones (R-058); costume sizes, rehearsal
registers, a consent-aware programme and audience tickets (R-057); a
practice log and demonstration links on skills (R-059); five-area office
navigation and settings in tabs (R-027, R-053); a refreshed Setup and
in-screen help (R-061); a week grid by room with clashes (R-029); an
enrolment board (R-032); a school hero photo and light logo (R-060);
automated accessibility checks with every serious finding fixed (R-039); and
a lighter first load (R-062).

**Built, waiting on a server:** the delivery worker (`scripts/deliver.mts` —
needs provider keys and a scheduler), phone notifications (need VAPID keys
and HTTPS hosting), card payments (Stripe module and webhook
entry point written and tested — docs/PAYMENTS.md), email/SMS delivery
(messages queue for a provider), the automations scheduler (the runner is
callable; nothing calls it on a timer yet), real sign-in (Supabase Auth
replaces the person picker; nothing else changes), the calendar feed
(`scripts/calendar-feed.mts`), per-address rate limits on the public pages
(the server passes the caller's address), and card payment for held
bookings and tickets.

**Designed, not built:** the AI assistant (interface and Cmd-K routing to
saved views; no generated answers), Studio Pulse's composite score (computed
once there are 180 days of history), ordering costumes from suppliers, and the shop.
