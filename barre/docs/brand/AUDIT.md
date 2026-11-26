# Product and design audit (Phase one)

Date: 26 November 2026. Baseline: branch `sanaa-v1` (commit fb0866e), the version live at
`/General/studio/` before the brand and design transformation. All work since happens on `studio`.

Method: the app was run locally (Next.js dev server, in-browser Postgres with the Northstar sample school)
and every main route was captured for each role with Playwright at phone (390×844), tablet (820×1180) and
desktop (1440×900) sizes: 76 screenshots. Source was read for structure, tokens and components.
A handful of screens were captured while still loading (owner Today, parent home, student home); their
loaded states were reviewed in earlier sessions and in the phone set.

## What exists (and must be protected)

The functional foundation is broad and tested (378 automated tests over the database rules, 58 automated
accessibility checks). The redesign changes presentation, navigation and copy; it must not change:

- **Roles and permissions**: owner, admin, teacher, guardian (parent), student, platform staff; row-level
  security in the database; teachers see only their students; parents only their family.
- **Safeguarding and privacy**: concern log with access logging, no private staff–family channels,
  medical details shown to teachers only as allergies and emergency plan, retention, consent.
- **Money**: invoices, billing runs (term and month), discounts, credit, refunds, pay-before-use, exports.
- **Operations**: timetable, class changes with family notices, cover, registers (offline queue), enrolment
  pipeline, trials, waiting lists, events/shows, exams, messaging, notifications, multi-school accounts.
- **School branding**: each school's logo, colours and Classic/Urban style sit on top of the product brand.

## Screen inventory (43 routes)

| Area | Routes |
|---|---|
| Public | `/` (demo sign-in), `/join` (school booking page), `/invite` |
| Office | `/today`, `/schedule`, `/classes`, `/class`, `/events`, `/people`, `/enrolment`, `/inbox`, `/requests`, `/billing`, `/reports`, `/studio`, `/safeguarding`, `/account`, `/onboarding` |
| Teacher | `/teach`, `/teach/register`, `/teach/students`, `/teach/feedback`, `/teach/messages`, `/teach/material`, `/teach/reports` |
| Parent | `/family`, `/family/schedule`, `/family/messages`, `/family/payments`, `/family/children`, `/family/events`, `/family/feedback`, `/family/enquiries` |
| Student | `/learn`, `/learn/timetable`, `/learn/feedback`, `/learn/library`, `/learn/events` |
| Platform | `/platform`, `/platform/plans`, `/platform/pilot` |

Plus ~30 sheets and dialogs (billing runs, new invoice, session sheet, class form, import wizard, record
sheets, notifications, notification settings, calendar subscribe, register, feedback composer, etc.).

## Component inventory

- **Primitives** (`src/components/ui`): Button, Spinner, Card, CardHeader, Badge, Input, Select, Field,
  EmptyState, Skeleton, ErrorState.
- **App components** (`src/components/app`, 46 files): shell and navigation, detail panel, record sheet,
  session row/sheet, week grid, billing run, exams, show tools, progress, practice, notifications, etc.
- **Tokens**: `src/app/globals.css` (Tailwind 4 `@theme`), two school styles (Classic, Urban), school
  colours fitted for contrast (`src/lib/brand.ts`, `src/lib/theme.ts`).
- **Usage counts** (indicator of the visual pattern): `<Card>` 221 uses, `<Badge>` 121, `CardHeader` 86,
  `rounded-*` classes in 321 places.

## Findings

### Visual design
1. **Card-in-card everywhere.** Almost every screen is a stack of white rounded cards on a tinted ground,
   each with an uppercase micro-label header (`CardHeader`). Screens with different jobs (a register, a
   ledger, a progress story) look structurally identical. This is the clearest "generic SaaS" signal.
2. **Badge overload.** Style badges on every class, status badges on every row, counts in pills. Colour is
   doing work that hierarchy and typography should do.
3. **Weak typographic voice.** A display serif for page titles only; everything else is 12.5–15px grey
   Inter-like text. Numbers (times, money, counts) have no special treatment beyond tabular figures.
4. **The product brand is almost invisible.** "Powered by Sanaa" is a 10px credit; the school's navy and
   logo dominate. Fine for school branding, but the product itself has no recognisable identity.
5. **Desktop uses space poorly.** Most screens are a narrow column (max 640–960px) in a 1440px window;
   the owner sees less at once than the job needs.
6. **Decorative flourish.** A swirl graphic in every header; skeleton loading blocks; icon circles in empty
   states — generic.

### User experience
7. **Owner Today** is a list of cards (stats, timetable, attention items, recent activity). Good content,
   weak priority: "what needs me now" competes with counts.
8. **Teacher** flow is the strongest: today's classes, register, feedback. Register is fast. Header and
   cards still add chrome between the teacher and the list.
9. **Student skills** list repeats "Not yet assessed" up to 30 times — discouraging, and contrary to the
   product's own "never show not-yet as failure" principle.
10. **Parent home** mixes tiles ("Competitions and events", "Ask the studio") with lists; the week for each
    child is not the first thing seen.
11. **Phone header** carries title, help, search, bell and avatar; page actions now wrap to a second row.
    Workable but crowded; the bottom bar is good (≤5 items).
12. **Copy** is clear and kind, occasionally explanatory where the interface could speak for itself.
13. **Sign-in** is a demo person-picker; real sign-in and onboarding wait on decision R-001.

### Technical design debt
14. Styling is utility classes inline in pages; primitives exist but layout patterns (list rows, sections,
    ledgers, timelines) are re-implemented per screen.
15. Colour tokens are well structured (themes, school palettes, contrast-fitted) — **worth keeping** as
    the base of the new design system.
16. Accessibility foundations are good (automated checks clean, focus rings, labels, 16px inputs on phones)
    — **worth keeping**.

## Worth retaining
- The information architecture (five office areas + Settings, sub-tabs, role-specific bottom bars).
- The register, the week grid, billing runs and the enrolment board as interaction models.
- The token architecture and school-branding layer (schools keep their own logo and colours).
- Tone of voice: plain, kind, specific.

## Not accessed or not testable here
- Real sign-in, card payments, email/SMS/push delivery (not connected: decisions R-001, R-003, R-006).
- Real devices (iOS Safari, Android Chrome) — checks used Chromium device emulation only.
- Real users: all "user perspectives" in this work are simulated professional judgement, not research.
