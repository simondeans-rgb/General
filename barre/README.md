# Barre

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
   - Press **⌘K** for the questions the assistant will answer, and the screens
     that answer them today.
2. **Marcus (teacher)** — open a class and take the register. Four taps per
   child, or "all present" for the usual case. Try navigating to `/people` —
   he is refused.
3. **Hannah (parent)** — her next class, what she owes, what the studio said.
   She can see three children, which are hers, and no others. **Messages** is
   her conversation with the studio; tap an invoice in **Payments** to see its
   lines.

## The demo runs a real database

Postgres is compiled to WebAssembly and runs in the browser tab, created from
the same migrations the production app uses and governed by the same row level
security policies. First load takes about three seconds while it starts and
seeds; after that it is instant, and your changes persist.

So when Marcus cannot see another teacher's students, that is the database
refusing him — not this interface choosing not to render them. `Studio → Reset
demo data` puts it back.

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
- [docs/DECISIONS.md](docs/DECISIONS.md) — where the build departs from the brief, and why.
- [docs/PAYMENTS.md](docs/PAYMENTS.md) — the ledger, and the two server routes
  that switch on card payments with Stripe.

## What is built, and what is not

**Built and working:** schema (42 tables, 115 policies), role routing, studio
setup, locations, terms, styles and levels, staff, families and students,
classes with roster and waiting list, the timetable in four views, the
enquiry funnel, the teacher register (with an offline queue), the parent app,
student logins and hubs, billing (invoices, transfers, cash, credit, refunds,
voids, reminders), the inbox (family conversations, class and studio
broadcasts, templates), the notification centre, trial and waiting-list
automations, and reports.

**Built, waiting on a server:** card payments (Stripe module and webhook
entry point written and tested — docs/PAYMENTS.md), email/SMS delivery
(messages queue for a provider), the automations scheduler (the runner is
callable; nothing calls it on a timer yet), real sign-in (Supabase Auth
replaces the person picker; nothing else changes).

**Designed, not built:** the AI assistant (interface and Cmd-K routing to
saved views; no generated answers), Studio Pulse's composite score (computed
once there are 180 days of history), shows and recitals beyond events,
costumes and the shop.
