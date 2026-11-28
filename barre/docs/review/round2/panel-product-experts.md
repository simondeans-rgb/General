# Round 2 panel: product and build experts (simulated)

Group slug: `product-experts`. Date: 28 November 2026. Preview: `http://127.0.0.1:8080/General/studio-next/` (static export, demo database in the browser, synthetic "Northstar Dance Academy" data).

All six panel members are **simulated professional perspectives**, written by one reviewer agent. They aren't real people, and their scores aren't real user data. Each finding is labelled:

- **[Observed]:** seen in the running app or measured by script.
- **[Code]:** confirmed by reading source.
- **[Opinion]:** professional judgement.
- **[Unverified]:** plausible but not tested here.

No competitor product was examined. Any comparison is labelled as an assumption.

| # | Panel member (simulated) | Lens |
|---|---|---|
| P1 | Senior product (UX) designer | Layout, hierarchy, consistency, interaction |
| P2 | Accessibility specialist | WCAG 2.2 AA, keyboard, text size, motion |
| P3 | Mobile and app-store specialist | PWA install, offline, home-screen icon, store readiness |
| P4 | Front-end and performance engineer | Bundle weight, time to usable, code structure (read only) |
| P5 | SaaS product manager | Information architecture, onboarding, gaps, pricing, monetisation |
| P6 | Dance-education consultant | Fit to how dance schools actually run |

---

## 1. Method and limitations

**What was run** (scripts in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/product-experts/`):

1. **`walk.js`: a Playwright walkthrough of 35 screens.** It used a fresh context per screen as:
   - the public;
   - owner Freya;
   - admin Nadia;
   - teachers Marcus and Priya (Priya at Northstar, and at Kestrel in the dark "Urban" style);
   - guardian Hannah;
   - student Amir;
   - platform admin Jordan.

   Viewports were phone 390×844 (touch) and desktop 1440×900. Each screen gave a screenshot, a text dump, a navigation list, a count of targets under 24px and under 44px, and a sideways-overflow check.
2. **`npx tsx scripts/a11y.mts`** (axe-core, WCAG 2.2 AA tags) on 31 routes × 2 viewports, including Urban. It reported 62 route checks "ok", 0 warnings, and *"No serious or critical issues"* (exit 0).
3. **`kbd.js`: keyboard and text checks.**
   - Tab order on `/people`, the skip link, and Ctrl+K.
   - Focus trap and Escape-return on the "New family" sheet.
   - Reduced-motion animation count.
   - Root text at 200% on teacher `/teach`, owner `/today` and guardian `/family/payments`.
4. **`perf.js`: Chrome DevTools Protocol throttling** (CPU ×4; network 1.6 Mbps down, 750 kbps up, 150 ms latency), cold (fresh context) and warm (reload), on `/welcome`, `/join`, `/teach`, `/family` and `/billing`. The same routes were also run unthrottled.
5. **Code reading** (no changes):
   - `src/app/**` and `src/components/**`;
   - `public/sw.js`, `src/app/manifest.ts`, `src/components/app/pwa.tsx`;
   - the plan seed in `0019_platform.sql`;
   - `week-grid.tsx`;
   - the table list across the 59 migrations.
6. **Static asset sizing** of `/home/user/General/studio-next/_next` and `pglite/`, with gzip -9 sizes computed locally.

**Limitations.**
- **No real devices or assistive technology.** There was no real phone, no VoiceOver, TalkBack or NVDA, and no real users.
- **"200% text" is simulated.** It overrides the root font size, which is close to Android Chrome's text-size setting. iOS Dynamic Type doesn't reach web content this way.
- **Compression.** The local server (`python -m http.server`) doesn't compress. The transfer sizes below are therefore uncompressed, with gzip estimates given beside them. GitHub Pages or a CDN would compress.
- **Demo database startup.** Load times include the demo's in-browser Postgres (PGlite) starting up, running migrations and seeding. A hosted deployment would not do this, so the times describe **the demo**, not the hosted product (which isn't built).
- **Reduced motion.** It was checked in code (the `@media (prefers-reduced-motion: reduce)` rule in `globals.css`). The animation count after settling was 0 in both modes, so the script couldn't prove motion is suppressed *during* entry.
- **Round-1 baseline.** There was no expert panel in round 1; round 1 was an end-user panel. Section 2 therefore checks the round-1 findings that fall within these experts' lenses, plus the remaining weaknesses in `docs/brand/FINAL-ASSESSMENT.md`. There are no round-1 expert overall scores to compare against; round-1 *product* scorecard numbers (REPORT §6) are compared in §8.

**Screenshots** (`docs/review/round2/shots/`). Full-page phone shots show the fixed bottom tab bar part-way down the image. That is an artefact of full-page capture, not a layout bug.

| File | Screen |
|---|---|
| `product-experts-01-welcome-desktop.jpg` | `/welcome`, full page |
| `product-experts-02-join-phone.jpg` | `/join?school=northstar` |
| `product-experts-03-owner-today-phone.jpg` | Owner `/today`, full page |
| `product-experts-04-owner-billing-desktop.jpg` | Owner `/billing` |
| `product-experts-05-admin-people-phone.jpg` | Admin `/people` on phone (header wrap) |
| `product-experts-06-platform-plans-desktop.jpg` | `/platform/plans` |
| `product-experts-07-teacher-today-phone.jpg` | Marcus `/teach` |
| `product-experts-08-teacher-weekgrid-desktop.jpg` | Priya, week grid, clash copy |
| `product-experts-09-urban-teach-phone.jpg` | Priya at Kestrel, Urban style |
| `product-experts-10-family-home-phone.jpg` | Hannah `/family`, full page |
| `product-experts-11-family-payments-200pct.jpg` | Hannah `/family/payments` at 200% text |
| `product-experts-12-student-learn-phone.jpg` | Amir `/learn`, full page |
| `product-experts-13-owner-today-reduced-motion-dark.jpg` | Owner `/today` with OS dark and reduced motion |
| `product-experts-14-teacher-200pct-phone.jpg` | Marcus `/teach` at 200% text |

---

## 2. What changed since round 1 (within these lenses)

| Round-1 item (REPORT / FINAL-ASSESSMENT) | Status now | Evidence |
|---|---|---|
| Text ignores the user's font size (UR-30, students D4) | **Fixed, with a new layout problem** | [Observed] Text grows at 200% with no sideways scroll (scrollWidth 390 on every screen). But the header grows to 304px (`/teach`) and 382px (`/today`) on an 844px screen. Bottom tab labels truncate ("Stud…", "Mes…", "Pay…"). The bell icon doesn't scale while the calendar icon does. Shots 11 and 14. |
| Sheets don't trap focus (UR-31) | **Fixed** | [Observed] "New family": focus stayed inside the dialog for 25 Tabs, and Escape closed it and returned focus to "New family". |
| Errors appear off-screen (UR-40) | Not re-tested | — |
| Automated accessibility | **Holds** | [Observed] a11y run: 0 serious or critical on 31 routes × 2 viewports, Urban included. |
| Skip link | **Works** | [Observed] The first Tab on `/today` is "Skip to content"; Enter then Tab lands on "Open register". The focus ring is a 2px outline on every element sampled. |
| Creating a class, editing a student, inviting a linked parent (UR-01/02/03) | Fixed per FIXES.md | Not re-driven by this group. The admin and owner groups cover them. |
| The app says untrue things (UR-11) | **Mostly fixed, two leftovers in the demo and marketing** | [Observed] "Card payments failed / £162.00 declined / See invoices" sits on owner Today and Billing, and "Card declined" on invoice rows, while card payments aren't connected (seed data). `/welcome` shows "Card payments failed … Retry" and "Pay by card or bank transfer". Store image 04 shows "Card payments failed … Retry". `/platform/plans` and Setup step 13 now state honestly that Stripe isn't connected. |
| Guided first timetable (UR-53) | **Fixed** | [Observed] `/onboarding` has a 13-step checklist with progress shown as a count ("9 of 13"). It lives under Settings → Setup (see §3, P5). |
| Plan limits as notices (UR-39) | Fixed | [Code] `/account` PlanCard. |
| `/join`: suitability, price, confirmation (UR-20) | **Improved** | [Observed] The first step asks who the class is for (myself or my child). [Code] Trial and ongoing price are shown per class (`join/page.tsx:354`). |
| Page weight "~230 KB per page" (FINAL-ASSESSMENT) | **Not comparable; the full first load is much larger** | [Observed] Measured transfers, uncompressed: `/welcome` 191–568 KB JS. App routes: 2.1–2.9 MB JS, plus 10.2 MB wasm and 6.1 MB data. The 230 KB figure probably excluded the database engine (see §3, P4). |
| "No AT review; emulated devices only" | Still open | — |

**New since round 1, checked by this group:**
- the teacher "Week grid" (shot 08);
- the parent "Update details" sheet (present on `/family/children` per child);
- student consent shown read-only on `/learn` (shot 12);
- the cross-school "All my schools" tab (shot 09).

---

## 3. UI review, screen by screen

Severity: H = blocks or misleads; M = slows or confuses; L = polish.

### Public

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U1 | `/welcome` | [Observed] The "For every style, and every age" section shows three empty grey boxes captioned "Photography: street class mid-routine, low side light…". These are art-direction notes shown to the public (`welcome/page.tsx:374–376`). | **H** | 01 | Ship real or licensed photography, or remove the row until it exists. Never show briefs publicly. |
| U2 | `/welcome` | [Observed] There's no pricing, no customer proof, and no self-serve start. The only call to action is "Book a demo", which leads to `hello@swayvo.example`. | M | 01 | Add a plain pricing band (Starter, Studio, Academy with "from £49 a month") and a "Try the demo" link next to "Book a demo". When a real school agrees, add one named quote. |
| U3 | `/welcome` | [Observed] The page is 6,852px tall on desktop and 10,583px on phone, across eight sections. | L | 01 | Cut to five sections on phone: hero, everything in one place, notices, progress, safe by design. Fold the style and "How it starts" sections into the demo. |
| U4 | `/join` | [Observed] It's clean, with a two-way choice. There's no school address, map, contact or class list before the visitor commits to a path. | M | 02 | Under the school name, add the location(s), phone, and a "See the timetable" link that browses without booking. |

### Owner and admin

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U5 | `/today` (phone) | [Observed] The "Needs attention" list has 8 rows. The number colours mix red (1, 4, 3), ink (4, 9) and amber (8, 9) with no legend. Long detail lines are cut off ("Teachers see the change once you…"). The page is 2,365px long. | M | 03 | Group rows under two subheads, "Today" (red) and "This week" (ink), and drop the amber. Let the detail wrap to two lines. Show the top 5 with "3 more". |
| U6 | Office screens on phone (`/people`) | [Observed] When the header has help, search and bell icons, the avatar ("NO") wraps onto its own line. The page actions ("Import", "New family") wrap onto a third line. Two tab rows follow (Families and students / Enrolment, then Families / Students / Staff), so about 300px goes before the first family. | **M–H** | 05 | Move the avatar into "More" on phone. Put the primary action as a floating "+" or in the title row. Merge the two tab rows into one segmented control. |
| U7 | `/people` list (phone) | [Observed] Each family row ends in a bare "—" with no label. The filters are full-width selects stacked one above the other. | L | 05 | Label the column ("Balance —") or remove it. Put the filters in one "Filter" sheet that shows a count of active filters. |
| U8 | `/billing` (desktop) | [Observed] The page is clear: four figures, then "Needs action 8". The content runs to 1,408px wide with no maximum line length, so the Family and Due columns drift far apart. | L | 04 | Cap the table at about 1,100px or add zebra hover. Already good otherwise. |
| U9 | `/enrolment` (desktop) | [Observed] The trial rows say "No date" for children who came, beside "CAME". The buttons "No show" and "Joining" are verbs that read like statuses. There are 76 interactive targets on one screen. | M | — | Show the trial date that was kept. Rename the buttons "Mark no-show" and "Enrol…". Collapse settled rows ("JOINED") into a "3 joined" summary. |
| U10 | `/onboarding` | [Observed] A good checklist ("9 of 13 steps done"; next: Privacy notice). It's reachable only via Settings → Setup. Step 13's copy says "once Stripe is connected on a hosted deployment", and the footnote reads "Card payments need Stripe". | M | — | For new schools, put a "Setup 9/13" card at the top of Today until it's done. Write the payment copy in owner language: "Card payments: coming soon. Families pay by bank transfer for now." |
| U11 | `/reports` | [Observed] The "By location" table shows "Billed, 30 days £0.00" for both locations beside "Collected, 30 days £2,088.00". | L | — | Explain the period ("Invoices raised in the last 30 days") or show term-to-date. |
| U12 | `/platform/plans` | [Observed] "Trial Trial": the plan name and badge repeat. "A month" is shown for the trial. There's no trial length, no annual price, no VAT note, and no feature differences: plans differ only by student, location and staff caps. | M | 06 | Drop the duplicate badge. Show "14 days" for the trial. Add an "includes" line per plan and the VAT basis. See P5 in §4 for packaging. |

### Teacher

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U13 | `/teach` week grid | [Observed] The clash text reads **"You also teaches Contemporary Seniors"**. [Code] `week-grid.tsx:42` builds `${teacher.split(' ')[0]} also teaches…`, and on the teacher's own view the teacher is "You". The banner says "Open a class to move it or arrange cover", which teachers can't do; it's office copy. It also doesn't say *why* two classes at different locations clash (overlap or travel time). | M | 08 | When the teacher is "You", write "You're also teaching Contemporary Seniors (19:00–20:15, Greenwich)". On the teacher view, say "Ask the office for cover" and add a button. |
| U14 | `/teach` (phone) | [Observed] Excellent hierarchy: time, class, then "Open register" full width. "Ask for cover" is a quiet link. | — | 07 | Keep. |
| U15 | Urban (Kestrel) | [Observed] The dark ground with lime primary reads well. The school switcher select sits under the header. | L | 09 | Fine. Consider showing the school's colour chip in the switcher on Northstar too. |
| U16 | `/teach` at 200% | [Observed] The header takes 304px. "Open register" falls below the fold. Tab labels truncate. | M | 14 | At large text, hide the date subtitle, put the icons in one row, and use icon-only tabs with accessible names (or allow two-line labels). |

### Parent

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U17 | `/family` | [Observed] Notices come first (CHANGED, NEW, NEW), then each child's week. "Shows and events", "Ask the studio" and "Classes for you" sit as plain links at the very bottom of a 2,465px page. Shows and exams are the most emotionally important things in a dance family's year. | M | 10 | Promote the next show or exam into a "Coming up" strip under Notices (date, child, what to bring, costume status). Keep the links at the bottom. |
| U18 | `/family/children` | [Observed] All three children are fully expanded on a 6,144px page. The three consent blocks repeat each description ("Photos taken in class or at shows…") three times. "Report an absence" sits at the bottom of each child's card. | **M–H** | — | One child at a time (child chips at top, as on Schedule). Show the description only on the first consent, or on tap. Move "Report an absence" and "Update details" to the top of each child. |
| U19 | `/family/events` vs `/family/children` | [Observed] On Events, Nia is "Confirmed" for "RAD Grade 3 Ballet examinations, 17 Dec". On Family, Nia's "Exams" says "No exams yet". [Code] Exams exist both as an event kind (`events/page.tsx:23`) and as `exam_session`/`exam_entry` (0042). | **H** (trust) | — | Make one source of truth: an exam event creates or links exam entries, and the child card reads from it. |
| U20 | `/family/payments` at 200% | [Observed] The header wraps into three rows (logo, title, icons). Only about 490px of content shows between the header and tabs. | M | 11 | Same pattern as U16. |
| U21 | `/family/events` (seed) | [Observed, seed] "Summer Show" is dated 15 January; a competition is on 24 December. This is a seed oddity, but these are the screens shown to prospects. | L | — | Fix the seed dates. Demo credibility matters (P5). |

### Student

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U22 | `/learn` | [Observed] Good order: next class, feedback, practice, milestones, goals. The "Photos and filming" consent block (three rows of legal-ish text) sits *above* "Videos and tracks" and "Shows and events" on a 15-year-old's home screen. "Not recorded, so not allowed" is awkward. The goal placeholder truncates ("Something you want to get better a"). | M | 12 | Move consent into a "Me" or "Privacy" sub-page with a one-line summary on home ("Photos: not allowed · change with your parent"). Use the placeholder "e.g. clean double pirouette". Move Videos and Events above Milestones. |
| U23 | `/learn` | [Observed] "I can't make it" is plain text beside "Full timetable", so it looks secondary for an important action. | L | 12 | Make it a secondary button. |

### Cross-cutting

| # | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U24 | All roles | [Observed] With OS dark mode the app stays light (shot 13). Only a school's "Urban" style is dark. | L | 13 | Optional: follow `prefers-color-scheme` for staff screens (not WCAG-required; it's a comfort setting for evening teachers). |
| U25 | Ctrl+K | [Observed] The placeholder says "Ask a question about the studio…", then the panel says "The studio assistant is not connected". | L | — | Use the placeholder "Find a family, student, class or invoice" until the assistant exists (UR-11 spirit). |
| U26 | Owner on phone | [Observed] Money and Settings are under "More". This is correct for phone frequency; it's noted for P5. | — | 03 | Keep. |

---

## 4. Feature and function ideas

Sizes: XS < 1 day, S ≤ 3 days, M ≤ 2 weeks, L ≤ 6 weeks, XL > 6 weeks (rough). The rating scale is from the brief.

### 4.1 Prioritised roadmap (P5 and P6 lead, other members' items folded in)

**Now (before a pilot school goes live).**

| # | Feature | Problem it solves, for whom | Rating | Size and area | Risk |
|---|---|---|---|---|---|
| F1 | **Connect sign-in, email delivery and payments (R-001/2/3/6)** | Nobody can run a school without them. Already on the register. The panel's view: this outranks every feature below. | Essential | XL · auth, delivery, payments | Scope; vendor choice |
| F2 | **One exam model, end to end** | Owners and parents. An exam is currently both an event and an exam entry, and they disagree (U19). Needs: entry list per exam body and grade, fee, the examiner visit timetable (candidate order, times, which studio), results and certificate received, and history on the child and student pages. RAD, ISTD and IDTA are named as examples only; the model should be body-agnostic. | Essential | M · `0042`, `events/page.tsx`, `exams.tsx`, `/family/children`, `/learn/timetable` | Data migration for existing event exams |
| F3 | **Re-enrolment and annual "move up"** | Owners and admins every summer. Most schools move children up a grade or class in September, not into the same class. Families must confirm places (and often pay a re-enrolment fee) before the new timetable is published. [Code] `term-rollover.tsx` copies enrolments into the *same* classes automatically. Needs: a progression map (Grade 2 → Grade 3), a parent "Confirm next year's classes" step with a deadline, and the unconfirmed going to the waiting list. | Essential | M–L · `term-rollover.tsx`, `classes` repo, a family screen, automation | Notification fatigue: one message per family, not per child |
| F4 | **Public timetable and booking widget for the school's website** | Owners, prospects. Schools want their own site to show live classes, prices and "Book a trial". Today they paste a link (`/enrolment` "Your trial booking page"). | Highly desirable | S–M · `/join`, a new `embed` route, static script | Cross-origin and styling |
| F5 | **Show (recital) production pack** | Owners and parents. Routines, chaperones, costumes and tickets already exist [Code]. Missing are: per-child "what to bring and where to be" sheets; a quick-change clash checker across the running order; costume payment and size collection deadlines with chasing; a dressing-room and chaperone rota. Also, for UK schools, child performance licence tracking for public shows (licence applied/granted per child, performance-day counts). That last one is a regulatory need in England and Wales for many paid public performances; the details need specialist confirmation. | Highly desirable | M · `show-tools.tsx`, `events-view.tsx`, a new `performance_licence` table | Safeguarding data; chaperone checks reuse `staff_check` |
| F6 | **Competition entries** | Competitive families and teachers. Entry per routine (solo, duet, troupe), festival section number, fees per entry, music file and timing, results and placings, and a festival-day schedule for families. Partly covered by events and routines. | Highly desirable | M · `event_routine`, `routine_dancer`, `/family/events`, `/learn/events` | Music file storage (copyright: store for rehearsal use only) |
| F7 | **Uniform and shop orders** | Parents and office. Each class has a uniform list (leotard colour, shoes, hair). Parents ask "what does she need?" (seen in seed: "Which shoes for Grade 3?"). Needs: a uniform list per class or level on the child card and the trial confirmation, then simple orders with sizes billed to the account (no stock control at first). | Highly desirable | S (list) / M (orders) · class settings, `/family/children`, billing items | Avoid becoming an e-commerce product |
| F8 | **Teacher hours and pay export** | Owners. Freelance teachers are paid per class taught or per hour. Registers already know who taught, including cover. A monthly "hours taught by teacher" CSV (and later self-billing invoices) saves an evening a month. [Code] No payroll or timesheet code exists. | Highly desirable | S · `reports`, `staff_member` rates | Pay rates are sensitive: owner only |
| F9 | **"Coming up" strip for families** | Parents (U17). One strip of the next show, exam, costume deadline and fee, per child. | Highly desirable | S · `/family`, existing repos | — |
| F10 | **Self-serve trial signup for schools** | P5 funnel. There's no "Start free trial" path: schools are created from the platform console (`platform/page.tsx:427`). Needs: signup, the 13-step setup on Today, sample-data toggle and a trial countdown. | Highly desirable (after F1) | M · `/welcome`, `/onboarding`, platform | Abuse; needs real auth |

**Next (first paid quarter).**

| # | Feature | Problem, who | Rating | Size and area | Risk |
|---|---|---|---|---|---|
| F11 | **Plan packaging by value, not only caps** | P5. Today plans differ only by students, locations and staff. Suggested packaging: Starter (core: timetable, register, billing, messages, progress). Studio adds shows and events, exams, make-ups, multi-location and reports. Academy adds a multi-school owner view, API and exports, priority support. Plus annual pricing (2 months free). **Also stop counting leavers toward the student cap.** [Observed] `/account`: "Students on the plan are every child record the school holds, including … those who have left." That penalises good record-keeping and drives schools to delete history. | Highly desirable | S · `plan` table, `/account`, `/platform/plans` | Re-pricing existing schools |
| F12 | **Card and Direct Debit add-on revenue** | P5. After F1: a small per-transaction margin or a "payments included" tier. This is the main monetisable lever in this category [assumption, not verified against competitors]. | Highly desirable | L · payments | Regulatory (payments provider) |
| F13 | **Class-level lesson plans and syllabus coverage** | Teachers and P6. Skills frameworks exist; add a term plan per class ("weeks 1–3: barre, pliés, port de bras") linked to skills, so cover teachers know where the class is. | Useful | M · `skill_framework`, `/class`, cover handover | — |
| F14 | **Parent newsletters and term letters** | Owners. Termly letter with dates, show info, uniform and fees; sent to filtered families. Bulk message exists; add templates and a scheduled send. | Useful | S · `inbox`, `communication_template` | Fatigue: respect notification preferences |
| F15 | **Feedback surveys (end of term)** | P5 retention. Two-question family pulse ("How is Nia finding Grade 3?"), shown to the owner beside the retention report. | Useful | S · new table, `/reports` | Survey fatigue: once a term at most |
| F16 | **Student certificates and awards** | P6. Printable "Grade passed", "100 classes", "Show performer" certificates in school branding from milestones and exam results. | Useful | S · `milestone`, exam results, a print view | — |
| F17 | **Install prompt and offline for parents** | P3. Add an in-app "Add to your home screen" guide (iOS steps; `beforeinstallprompt` on Android). Precache `/family/` and `/learn/` shells too. Today only teacher pages are precached (`sw.js` PRECACHE). | Useful | S · `pwa.tsx`, `sw.js` | — |
| F18 | **Studio and room hire** | Owners. Many schools sub-let studios; bookings sit on the same week grid, with an invoice to the hirer. | Nice to have | M · `room`, week grid, billing | Scope creep |
| F19 | **Livestream or on-demand classes** | Adults and remote. Library video exists; scheduled live links are a small extension. | Nice to have | S–M · `resource`, `/learn/library` | Safeguarding for under-18s: no 1:1 video |

**Later.**

| # | Feature | Rating | Size |
|---|---|---|---|
| F20 | Multi-school owner roll-up (UR-59, deferred) | Useful (Academy plan) | L |
| F21 | Native wrappers (TWA for Play; Capacitor for iOS) for store presence | Useful | M–L |
| F22 | Gift Aid or bursary reporting (charitable schools) | Nice to have | S |
| F23 | Welsh-language interface (schools in Wales) | Nice to have | M |

### 4.2 Things to remove or simplify
- Student home: move consent off it (U22).
- Plans: the duplicate "Trial" badge.
- Ctrl+K: the "Ask a question" framing until an assistant exists.
- Family children: collapse to one child at a time.
- Demo: remove seed "card declined" states, or label them "(demo)", until cards are connected.

---

## 5. Branding feedback (professional critique)

**Name: Swayvo.**
- [Opinion] Short, ownable, easy to say, and it doesn't box the product into ballet.
- P6 notes "sway" reads a little contemporary or ballroom and "vo" is arbitrary; P1 and P5 see that as fine for a SaaS mark.
- The name isn't trademark-cleared (GUIDELINES §9). That is the biggest brand risk, and it's procedural.

**Logo: the eight-count mark.**
- [Observed] The mark works at sidebar size and in the store images.
- At favicon sizes the four-beat form is sensible.
- P3: on a phone home screen the bars read as a signal-strength or equaliser icon even with the gap. The gap is subtle at 48–60dp. Test at actual launcher sizes on device [Unverified].

**Colour.**
- Count blue (#2638F0) with rosin peach is distinctive and confident in marketing (shot 01).
- In product it's disciplined (one blue action per screen).
- The school-colour layering works:
  - Northstar navy;
  - Kestrel Urban dark with lime (shot 09).
- P2: peach on blue is only used large (4.1:1), as the guidelines say.

**Type.**
- Archivo expanded for times and money is the strongest visual idea in the product (shots 03 and 07).
- Inter for UI is a safe, legible choice.
- P1: Archivo at expanded width for notices (CHANGED, CANCELLED) is very good at the top of the family home. It's overused on the welcome page, where every section headline is the same weight.

**Voice.**
- Mostly excellent: plain, specific, kind ("Paid. Nothing is due.", "Can't make one? Ask the office for cover from its row.").
- Lapses:
  - developer words reach owners ("Stripe", "hosted deployment", "sample data");
  - a grammar slip on the teacher grid ("You also teaches");
  - legal-ish consent copy on a teen's home screen;
  - "Not recorded, so not allowed".

**School branding layered on top.**
- [Observed] "powered by swayvo" in the sidebar and footer is the right volume.
- [Code] P3: the installed app *icon* stays the Swayvo icon even when a school is branded. `useBrandedManifest` swaps the name and theme colour but uses `/icons/icon-*.png`. The iOS `appleWebApp.title` is "Swayvo" and the apple-touch-icon is Swayvo's.
- Parents will therefore see a Swayvo icon labelled "Swayvo" on iPhone home screens, not their school. That clashes with "the school leads".
- `viewport.themeColor` is `#ffffff` while the manifest says `#2638f0`.

**`/welcome`.**
- Strong hero and product-at-real-size sections.
- Weakened by the photo placeholders (U1), no pricing (U2), and mock states that promise card payments.

**Store images** (`public/brand/store/`).
- [Observed] Five 1290×2796 portrait shots (an iPhone 6.7" size) plus `og.png` at 1200×628. They're consistent and well art-directed: one idea each, headline in Archivo.
- Gaps for a real listing:
  - no Android feature graphic (1024×500);
  - no tablet shots;
  - shot 04's header text is cut off ("Curre…");
  - shot 04 shows "Card payments failed … Retry";
  - all five are on the same blue, with no variety for the first-three-visible rule in store search [Opinion];
  - no listing copy, privacy labels or age rating prepared.
- A PWA isn't itself listable on the App Store; a wrapper is needed (F21). P3 warns that thin web wrappers can face App Store review rejection for minimum functionality [Opinion; review outcomes unverified].

**Consistency across screens.**
- [Observed] High: rules not boxes, the count device, notices, and the same header and tab patterns across all roles.
- Gaps: office screens wrap differently on phone (U6); large-text headers (U16, U20).

---

## 6. Individual panel member reports (simulated, first person)

### P1: Senior product (UX) designer

**What's better.** The product now has a real system. The time-as-hero pattern (owner Today, teacher Today, student Today) is consistent and instantly readable. Notices on the family home are the best-designed component in the app. Sheets behave properly. The week grid names clashes in words, not colour alone.

**What still frustrates me.**
- Long phone pages: the family home is 2,465px and Your family 6,144px.
- Office headers that wrap on phone.
- Two stacked tab rows on People.
- A "Needs attention" list whose number colours I couldn't decode without a legend.
- The welcome page showing placeholder art direction to the public. That would be the first thing a prospect screenshots.

**Top 5 UI improvements.**
1. One-child-at-a-time on `/family/children`, with consent descriptions collapsed (U18).
2. Phone office header: avatar into More, action in the title row, one tab row (U6).
3. "Coming up" strip on the family home for shows, exams and costumes (U17).
4. Group Today's attention list into Today and This week, with wrapping detail (U5).
5. Remove the photo placeholders from `/welcome` (U1).

**Top 3 feature requests.** F9 "Coming up" strip; F2 single exam model; F4 website widget.

**Branding view.** Archivo numerals and the notices are genuinely distinctive. Count blue is used with restraint. The marketing page overuses the display weight. The school-brand layering is correct in the app, but not on the home-screen icon.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 | 7 | 7 | 7 | 7 | 8 | 7 | 7 | 8 | 8 | **7.5** |

**Reasoning.** It's a well-crafted interface with a few long, repetitive phone pages and wrapping headers. Nothing structural is wrong. Round 1: none (not on that panel).

### P2: Accessibility specialist (WCAG 2.2 AA)

**What's better.**
- axe is clean on 31 routes × 2 viewports, including the dark Urban style.
- The skip link works and lands before the primary action.
- Every element I tabbed to had a 2px visible outline (2.4.7, and 2.4.11 likely met; I didn't measure contrast of the outline itself against all grounds).
- Focus is trapped in sheets and returns to the trigger on Escape (2.4.3).
- Text scales because sizes are in rem (1.4.4).
- Status is always in words (CANCELLED, Overdue), not colour alone (1.4.1).

**What still frustrates me.**
- At 200% text, chrome eats the screen: the owner Today header is 382px of 844, and tab labels truncate. Reflow (1.4.10) technically passes because there's no sideways scroll, but usability at large text is poor (U16, U20).
- The bell icon doesn't scale with text while neighbouring icons do.
- The number colours on Today have no legend. The numbers are in words, so it isn't a failure, but the colour meaning is hidden.
- [Unverified] Screen-reader reading order for the week grid (a table of rooms × days), and announcements when a register mark is saved. Neither is testable without real assistive technology.
- Ctrl+K: the input has no visible outline (the focus is shown by the panel itself, which is acceptable).

**Top 5 UI improvements.**
1. Compact the header at large text: hide the subtitle, keep one icon row, cap at about 25% of the viewport (U16, U20).
2. Bottom tabs at large text: two-line labels or icon-only with names; never truncate.
3. Scale all header icons in rem.
4. Add a legend or grouping for the attention-list number colours (U5).
5. Add a live region on register save ("Nell marked here") and confirm it in VoiceOver and TalkBack.

**Top 3 feature requests.**
1. A per-user "Larger text" and "Reduce motion" setting inside the app, for parents on shared or managed devices.
2. An accessible PDF or print view for term reports and certificates (F16).
3. Screen-reader-friendly list mode for the week grid ("Thursday: 19:00 Contemporary Seniors, Studio One, clash with…").

**Branding view.** The palette is AA-safe as specified. Peach-on-blue is correctly reserved for large text. The Urban lime-on-dark passed axe.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 7 | 7 | 7 | 7 | 8 | 7 | **7.0** |

**Reasoning.** It's automated-clean and keyboard-sound. The remaining risk is large-text ergonomics and the untested screen-reader experience. Round 1: none.

### P3: Mobile and app-store specialist

**What's better.**
- [Code] There's a real service worker. Teacher pages (Today, register, feedback, students) are precached on install, and register marks queue on the device.
- [Code] The manifest is complete: standalone, scope, 192, 512 and maskable icons.
- [Code] An apple-touch-icon exists.
- [Code] A branded manifest is swapped in at run time with the school's name and colour.
- [Observed] The store art is polished and on-brand.

**What still frustrates me.**
- **The school isn't on the home screen.** [Code] Icons stay Swayvo's in the branded manifest, and the iOS title is hard-coded "Swayvo". A parent at Northstar gets a blue Swayvo icon; a parent at two schools gets two identical icons.
- **First open on a phone is very heavy** (see P4): about 18 MB uncompressed (about 5.8 MB gzipped, estimated), and 2–2.5 minutes before the app is usable on a throttled phone, cold. In the demo that is the price of an in-browser database. For a parent tapping an invite link from a text message, it's a drop-off point.
- No install guidance anywhere.
- Parent and student pages aren't precached, so offline behaviour for them is [Unverified].
- `themeColor` (#ffffff) disagrees with the manifest (#2638f0).

**Top 5 UI improvements.**
1. Generate the school's own icon set (logo on school colour, maskable) when a logo is uploaded. Use it in the manifest and apple-touch-icon, and set the iOS title to the school's short name.
2. Add an "Add to home screen" card after first sign-in (platform-specific steps), dismissible.
3. Show a branded splash or skeleton with progress words during first load ("Getting Northstar ready… 2 of 3"), not "Setting up".
4. Align `themeColor` with the school colour.
5. Precache `/family/` and `/learn/` shells.

**Top 3 feature requests.** F17 (install and offline for parents); F21 (store wrappers, after hosting); push notifications for families once hosted (R-003).

**Branding view.**
- Store images: strong, but they need an Android feature graphic, tablet sizes, untruncated headers, no card-failure mock, and listing copy and privacy labels.
- The mark may read as a signal-strength icon at launcher size; test it on devices.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 6 | 5 | 7 | 5 | 7 | 5 | 7 | 8 | 7 | **6.0** |

**Reasoning.** The PWA basics are right. Install identity and first-load weight are the blockers for families. Round 1: none.

### P4: Front-end and performance engineer

**Measured** (phone 390×844; CPU ×4; 1.6 Mbps and 150 ms; local server uncompressed):

| Route | JS transferred (KB) | wasm (KB) | data (KB) | First content | Usable, cold | Usable, warm reload |
|---|---|---|---|---|---|---|
| `/welcome` | 191 | 0 | 0 | 3.1 s | 3.1 s | 0.8 s |
| `/join` | 2,772 | 10,238 | 6,148 | 2.9 s | **139 s** | 5.0 s |
| `/teach` | 2,430 | 10,238 | 6,148 | 2.8 s | **143 s** | 7.1 s |
| `/family` | 2,437 | 10,238 | 6,148 | 2.8 s | **155 s** | 19.1 s |
| `/billing` | 2,487 | 10,238 | 6,148 | 2.8 s | **156 s** | 15.8 s |

Unthrottled, the same routes become usable cold in 14–18 s and warm in 1.6–4.6 s; `/welcome` takes 0.18 s.

**gzip -9 of the heavy files** (computed locally):

| File | Size | gzipped |
|---|---|---|
| `pglite.wasm` | 10.1 MB | 3.4 MB |
| `pglite.data` | 6.3 MB | 1.9 MB |
| `pglite.js` + `index.js` | — | ~0.19 MB |
| Migrations chunk `2_5hlhbxlp5de.js` (all 59 SQL migrations as strings) | 1.1 MB | 223 KB |

So a compressed cold load would still be about 5.8 MB.

**What's better.**
- Marketing is light: `/welcome` needs no database.
- The assistant loads lazily (`next/dynamic`).
- The seed is split from the IDs so it isn't pulled into every page (`seed/ids.ts`).
- 590 tests pass per FIXES.md (not re-run here).
- No `dangerouslySetInnerHTML` or `eval` in `src` [Code].

**What frustrates me.**
1. **First load is dominated by the demo database.** That's acceptable for a demo, fatal for real parents. FINAL-ASSESSMENT's "~230 KB per page" understates what a user downloads. The hosted architecture (`docs/ARCHITECTURE.md`) removes most of this, which is one more reason R-002 is the gating decision.
2. **Warm reloads still take 7–19 s throttled.** [Unverified, inferred] The in-browser database appears to re-initialise on each full load.
3. **Code structure.** [Code]
   - `useWrite` is re-declared 8 times, and 25 modal overlays are hand-rolled with `fixed inset-0` across 24 files, beside a `RecordSheet` primitive. That means 25 places to keep focus, Escape and scroll-lock consistent; it works now (focus test passed) but is fragile.
   - Raw SQL strings are passed from components into a generic mutation (`people-sheets.tsx:21`, `useWrite(sql)`). Security rests on the database rules (which hold), but it couples UI to schema.
   - Large page files: `billing/page.tsx` 878 lines (50 KB), `studio/page.tsx` 653 lines, `people/page.tsx` 521 lines.
   - Duplicate components: `GuardianSheet`, `EmergencyContacts`, `InviteSheet` and `CalendarButton` each exist twice, with different props.
4. The migration chunk ships to every app route in the demo.

**Top 5 UI improvements.**
1. A first-load screen with real progress (bytes and steps) and a "Use while loading" path for public `/join`. Better still, render `/join` from a static JSON snapshot of the school's classes without the database.
2. Keep the database alive between page loads (avoid full reloads; persist an initialised database snapshot) [Unverified feasibility].
3. One `Dialog`/`Sheet` primitive for all 25 overlays.
4. Split `billing/page.tsx` into ledger, runs and settings modules.
5. Serve with Brotli where possible.

**Top 3 feature requests.**
1. Hosted mode (R-002) so families get a thin client.
2. A performance budget in CI: fail if route JS exceeds X KB gzip, excluding the demo engine.
3. Real-user monitoring of time-to-usable after launch.

**Branding view.** Self-hosted fonts (no third-party requests) is the right call for privacy and speed.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | 7 | 4 | 7 | 5 | 7 | 8 | 7 | **6.5** |

**Reasoning.** It's a sound codebase with a demo-only weight problem and growing duplication. Round 1: none.

### P5: SaaS product manager

**What's better.**
- The role-based information architecture is clean:
  - owner/admin: 6 areas, with Money and Settings under More on phone;
  - teacher: 5 tabs;
  - parent: 5 tabs;
  - student: 5 tabs;
  - platform: 3.
- Enrolment shows a real funnel: 18 enquiries → 14 trials → 11 attended → 7 enrolled, "38.9% of enquiries enrol".
- Reports show trial conversion (64%) and leavers.
- The onboarding checklist is the right shape.
- Plan limits act as notices and never delete data.

**What still frustrates me.**
- **No self-serve funnel.** `/welcome` has no pricing and no "Start free trial". "Book a demo" goes to an email address. Schools are created by the platform admin. Every acquisition goes through a sales conversation.
- **Packaging.** The four plans (Trial £0, Starter £49, Studio £99, Academy £179) differ only by caps, and the trial is labelled "Trial Trial" with no length. Counting leavers toward the cap is a pricing anti-pattern.
- **The onboarding checklist is hidden** under Settings → Setup.
- **The demo shows payment failures** for a payment method that doesn't exist yet.
- **Gaps that drive churn in this category** [assumption]: re-enrolment and progression (F3), exams done properly (F2), website booking widget (F4), teacher pay export (F8).

**Top 5 UI improvements.**
1. Pricing band and "Try the demo" on `/welcome` (U2).
2. Setup progress on Today for new schools (U10).
3. Fix "Trial Trial" and show the trial length (U12).
4. Owner-language payment copy (U10).
5. Remove or flag demo-only card failures (§2).

**Top 3 feature requests.** F3 re-enrolment and move-up (Essential); F10 self-serve trial signup (Highly desirable); F11 value-based plan packaging, with active-student counting (Highly desirable).

**Branding view.** The brand looks more premium than the category norm [assumption: from the strategy doc's earlier market review, not re-verified]. "More time for dance" is a sellable promise. The tagline "Five, six, seven, eight" is memorable but says nothing about software. Pair it with the proposition everywhere, as the hero does.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 | 7 | 6 | 7 | 7 | 8 | 5 | 7 | 8 | 8 | **7.0** |

**Reasoning.** It's the right product with a credible depth of features. Go-to-market (signup, pricing, packaging) and the three unconnected services hold adoption back. Round 1: none.

### P6: Dance-education consultant

**What's better.** This is clearly built by people who've seen a dance school's week:
- terms with half-term breaks;
- grades as levels;
- medical notes at the register;
- collection lists;
- chaperones with DBS or licence seen;
- costumes and sizes;
- running orders, rehearsal registers and show tickets;
- make-ups off by default;
- age-appropriate feedback chips.

The progress area (notes, "to work on", skills as a count, milestones) is what teachers wish they had between exams. The cover flow ("Priya Raman teaches Junior Tap on Tue 1 Dec") is how schools actually communicate.

**What still frustrates me.**
- **Exams are split in two** and disagree (U19). Exams are the spine of a graded school's year. Entries, fees, candidate timetables, results and certificates must be one thing.
- **September doesn't work.** Rollover copies children into the same class. Real schools move most children up and ask families to confirm.
- **Shows are buried** at the bottom of the family home. For many families the show *is* the year.
- **No uniform list**, though "Which shoes for Grade 3?" is in the seed inbox, as it is in every real school inbox.
- **No child performance licence tracking** for public shows [needs specialist confirmation of current rules].
- **No teacher pay export.**
- **Seed dates** (a "Summer Show" in January; a festival on Christmas Eve) would make a real owner smile and doubt.

**Top 5 UI improvements.**
1. "Coming up" strip with show, exam and costume per child (U17 and F9).
2. Exam status on the child card from the same data as Events (U19).
3. Uniform line on each class and on the trial confirmation.
4. Teacher grid copy that speaks to teachers (U13).
5. Move consent off the student home (U22).

**Top 3 feature requests.** F2 single exam model (Essential); F3 re-enrolment and progression (Essential); F5 show production pack, including licences and quick-change checks (Highly desirable).

**Branding view.** "The count" is authentic: every style counts in eights. It works for ballet and breaking alike. "Rosin peach" made me smile. Photography, when it comes, must show real non-ballet classes, as the guidelines say.

**Scores /10.**

| Relevance | Quality | Completeness | Ease | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 | 7 | 6 | 7 | 7 | 8 | 6 | 7 | 8 | 8 | **7.0** |

**Reasoning.** It fits how schools run better than generic class-booking tools [assumption]. Exams, September progression and uniform are the gaps a school owner would hit within the first year. Round 1: none.

---

## 7. Votes (machine-readable)

| Persona | UI #1 | UI #2 | UI #3 | Feature #1 (rating) | Feature #2 (rating) | Feature #3 (rating) | Remove or simplify | Greatest-impact change |
|---|---|---|---|---|---|---|---|---|
| P1 | family-children-one-child | office-phone-header | family-coming-up-strip | coming-up-strip (Highly desirable) | single-exam-model (Essential) | website-booking-widget (Highly desirable) | welcome-photo-placeholders | family-children-one-child |
| P2 | large-text-compact-header | tabbar-no-truncation | scale-header-icons | in-app-text-size-setting (Useful) | accessible-print-reports (Useful) | week-grid-list-mode (Useful) | ctrl-k-assistant-framing | large-text-compact-header |
| P3 | school-home-screen-icon | install-guide-card | branded-first-load-progress | parent-install-offline (Useful) | store-wrappers (Useful) | family-push-notifications (Essential) | demo-card-failure-states | school-home-screen-icon |
| P4 | first-load-progress-static-join | persist-db-between-loads | single-dialog-primitive | hosted-mode (Essential) | perf-budget-ci (Useful) | real-user-monitoring (Useful) | duplicate-usewrite-and-sheets | hosted-mode |
| P5 | welcome-pricing-and-demo | setup-on-today | plans-trial-label | reenrolment-move-up (Essential) | self-serve-school-signup (Highly desirable) | value-plan-packaging (Highly desirable) | leavers-count-toward-cap | self-serve-school-signup |
| P6 | family-coming-up-strip | exam-status-on-child | uniform-line-on-class | single-exam-model (Essential) | reenrolment-move-up (Essential) | show-production-pack (Highly desirable) | consent-on-student-home | single-exam-model |

---

## 8. Group summary

### Consensus
1. **The UI is now a coherent, well-crafted system.** Time-as-hero, notices, rules not boxes, and the school layering all work. axe is clean, keyboard focus is sound, and sheets trap focus.
2. **The worst remaining UI problems are length and chrome on phones:**
   - long, repetitive family and student pages;
   - office headers that wrap;
   - headers that eat the screen at large text.
3. **Demo truthfulness leftovers:** card-failure states in the seed, on `/welcome` and in a store image; photo placeholders on the public page.
4. **Feature priority after F1 (sign-in, delivery, payments):**
   - one exam model (F2);
   - September re-enrolment and progression (F3);
   - a website booking widget (F4);
   - the family "Coming up" strip (F9);
   - shows (F5);
   - competitions (F6);
   - uniform (F7);
   - teacher pay export (F8).
5. **Branding is strong.** The name works. "The count" is authentic. The type and colour are distinctive. School-first layering is right in the app but **not on the phone home screen**.

### Disagreements (kept)
- **Next build priority.** P4 and P3 want the hosted runtime and first-load weight fixed before any feature. P5 and P6 argue exams and re-enrolment decide whether a pilot school *renews*, so they should be built in parallel.
- **Name.** P6 finds "Swayvo" slightly genre-leaning (contemporary or ballroom); P1 and P5 don't.
- **Tagline.** P5 thinks "Five, six, seven, eight" must always be paired with the proposition. P1 thinks it can stand alone on the hero.
- **Dark mode.** P1 and P2 see following OS dark mode as optional comfort. P3 would ship it for evening teachers.

### Group scores (simulated)

| Persona | Rel | Qual | Comp | Ease | Eff | Useful | Adopt | Cont | Visual | Brand | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 UX | 9 | 7 | 7 | 7 | 7 | 8 | 7 | 7 | 8 | 8 | 7.5 |
| P2 A11y | 8 | 8 | 7 | 7 | 7 | 7 | 7 | 7 | 8 | 7 | 7.0 |
| P3 Mobile | 8 | 6 | 5 | 7 | 5 | 7 | 5 | 7 | 8 | 7 | 6.0 |
| P4 Perf | 8 | 7 | 7 | 7 | 4 | 7 | 5 | 7 | 8 | 7 | 6.5 |
| P5 PM | 9 | 7 | 6 | 7 | 7 | 8 | 5 | 7 | 8 | 8 | 7.0 |
| P6 Dance | 9 | 7 | 6 | 7 | 7 | 8 | 6 | 7 | 8 | 8 | 7.0 |
| **Mean** | **8.5** | **7.0** | **6.3** | **7.0** | **6.2** | **7.5** | **5.8** | **7.0** | **8.0** | **7.5** | **6.8** |

There was no round-1 expert panel. For comparison, the round-1 end-user panel mean overall was 5.4, with relevance 8.0 and completeness 4.5 (REPORT §6).

### Re-scored end-user product scorecard (REPORT §6 criteria, expert view)

| Area | Weight | Round 1 | Now (expert) | Why |
|---|---|---|---|---|
| Core functionality and completeness | 20% | 5.5 | **7.0** | The P0 defects are fixed per FIXES.md (not all re-driven here). Sign-in, payments and delivery are still not connected. |
| Ease of use and task efficiency | 15% | 6.5 | **7.0** | Feedback for 12 now takes 4 interactions (FIXES). Text scales. Long phone pages and large-text chrome remain. |
| Class scheduling and booking | 10% | 5.0 | **7.0** | Week grids for office and teacher, cross-school clashes, make-ups, safe waiting lists, `/join` with price and age. Teacher clash copy is wrong. |
| Payments and financial management | 10% | 4.0 | **5.5** | Ledger integrity fixed (credit notes, run guard, split billing). No card or Direct Debit. The demo still shows card failures. |
| Student feedback and development | 15% | 6.0 | **7.5** | History, draft levels, bulk chips, goals, milestones. The exam model is split and contradictory (U19). |
| Communication and engagement | 10% | 5.0 | **5.5** | Absence reports reach the register; there's a student bell and invoice notices. Still in-app only (R-003). |
| School administration and business value | 10% | 5.0 | **7.0** | Enquiry funnel, audit history, retention report, migration toolkit, location filters. No teacher pay; no September progression. |
| Safeguarding, accessibility and trust | 5% | 5.0 | **7.0** | Consent with history, concern entry, legal hold, axe clean, focus trap. Large-text ergonomics; no AT review. |
| Adoption and continued-use potential | 5% | 5.0 | **5.5** | Strong fit, but no self-serve signup, heavy first load, and no school home-screen identity. |
| **Weighted total** | 100% | **53.8** | **67.0 / 100** | Band 60–69: a credible product needing targeted work before broad adoption. |

The weighted total for "Now" is the sum of each score × weight:

| Area | Calculation | Contribution |
|---|---|---|
| Core functionality | 7.0 × 0.20 | 1.40 |
| Ease of use | 7.0 × 0.15 | 1.05 |
| Scheduling | 7.0 × 0.10 | 0.70 |
| Payments | 5.5 × 0.10 | 0.55 |
| Feedback | 7.5 × 0.15 | 1.125 |
| Communication | 5.5 × 0.10 | 0.55 |
| Administration | 7.0 × 0.10 | 0.70 |
| Safeguarding | 7.0 × 0.05 | 0.35 |
| Adoption | 5.5 × 0.05 | 0.275 |
| **Total** | | **6.70 → 67.0** |

### Top 10 UI improvements across the app (exact screens and changes)
1. **`/family/children`:** show one child at a time with child chips at the top. Put "Report an absence" and "Update details" at the top of each child. Show the consent descriptions once, or on tap. The page is 6,144px today.
2. **Office phone header** (`/people`, `/billing`, `/enrolment` and similar): move the avatar into "More", put the primary action in the title row or a "+" button, and merge the two tab rows into one.
3. **`/family` home:** add a "Coming up" strip under Notices with the next show, exam, costume deadline and fee per child. Keep the bottom links.
4. **Large text (all roles):** compact the header to at most 25% of the viewport. Bottom tabs get two-line labels and never truncate. Size header icons in rem (bell included).
5. **`/welcome`:**
   - remove the "Photography: …" placeholders;
   - add a pricing band and "Try the demo";
   - remove "Card payments failed / Retry" and "Pay by card" mocks until cards exist.
6. **`/today` (owner) "Needs attention":** group into Today and This week, drop the unexplained amber, let details wrap to two lines, show the top 5 with "N more".
7. **`/teach` week grid:**
   - fix "You also teaches" → "You're also teaching…";
   - show times, location and the reason;
   - replace "Open a class to move it" with "Ask the office for cover" and a button.
8. **`/family/children` and `/learn` exams:** read exam status from the same data as `/family/events`, so a confirmed exam never shows "No exams yet".
9. **`/learn`:** move the consent block into a Privacy sub-page with a one-line summary. Put Videos and Shows above Milestones. Use a short goal placeholder. Make "I can't make it" a secondary button.
10. **`/platform/plans` and `/onboarding`:**
    - fix "Trial Trial" and show the trial length;
    - show Setup progress on owner Today until complete;
    - replace "Stripe / hosted deployment" with owner language.
