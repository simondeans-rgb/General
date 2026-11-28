# Swayvo — round 2 panel review

**Interface, improvements, new features and branding** · 28 November 2026 · reviewed build: preview `/General/studio-next/` at merge 038b9b9

> **Simulated panel.** The 24 end users are the same simulated personas as round 1. The 12 experts are simulated
> professional reviewers: they are the brand and visual team that built the identity, and a product and build
> team. Their opinions, scores and votes are structured judgement, not research with real people.
>
> **Observed findings.** Findings marked as observed were seen in the running app (Playwright, on phone, tablet
> and desktop) or confirmed in the code. No application code was changed in this review.

**Group reports** (in this folder):
- `panel-students.md`
- `panel-parents.md`
- `panel-teachers.md`
- `panel-admins.md`
- `panel-owners.md`
- `panel-safeguarding.md`
- `panel-brand-experts.md`
- `panel-product-experts.md`

**Screenshots:** about 120, in `shots/`.

---

## 1. Summary

**Users rate the app much higher than in round 1.** The mean persona score went from **5.4 to 7.0 / 10**, and every user group improved. The round-1 blockers were checked again in the app and most are fixed. Examples:
- creating a class;
- inviting a second parent;
- an offline register that keeps absences;
- absence reports reaching the teacher;
- refunds and billing runs;
- consent controls;
- feedback for a whole class in 4 taps.

| Scorecard | Round 1 | Round 2 | Source |
|---|---|---|---|
| End-user product scorecard (REPORT §6 weights) | 53.8 | **67.0 / 100** | Product experts' re-score |
| Brand and design scorecard (FINAL-ASSESSMENT weights) | 84.6 | **80.9 / 100** | Brand experts' re-score |

The product score is now in the band "credible product needing targeted work before broad adoption".

The brand and design score fell because the experts measured **design-system drift** that came with about 60 functional changes:
- eight hand-made tab styles;
- 47 status words where 7 were defined;
- an account settings page about 7,400 px long;
- design documents that are out of date.

The fall is not because the brand got weaker.

**The three things the panel most wants now:**
1. **Interface consistency and polish.** Large-text layout, very long pages, and confirmations that say exactly what happened.
2. **A marketing page and store images ready to sell from.** Today they have placeholder photo boxes and claims that aren't true yet.
3. **A short list of high-value features.** A single exam model; September re-enrolment and moving children up a grade; a school-branded home-screen icon; booking management for families; a required safeguarding-lead setup.

**Still blocked by your decisions:** sign-in, payments, and email/SMS/push.

**Branding verdict, all groups:** keep the identity and strategy, and refine the execution.
- The name, the counting in eights, the type, the notices and the voice are working.
- Parents in particular find the school-first layering ("Northstar, powered by swayvo") trustworthy.
- To fix:
  - the wordmark's tight "y–v" gap and the seam in the "o";
  - the outward-facing assets: the marketing page, store images, the printed show programme and the home-screen icon;
  - governance of the design system, so it stops drifting.

**One serious technical finding.** On a throttled phone, the **first visit takes 139–156 seconds** before the app is usable.

The cause is the demo design: it downloads about 18 MB (about 5.8 MB compressed), mostly the database that runs inside the browser. This matters when prospects try the demo. The hosted version will not work this way.

---

## 2. The panel

| Group | Members | Report |
|---|---|---|
| Students and prospects | Maya 10 (via her dad), Amir 15, Gareth 52, Priyanka 34, Sofia 17, Ruth 39 (low vision) | panel-students.md |
| Parents | Kemi, Hannah (three children), Gareth (competitive), Pauline (low tech confidence), Daniel (shared care) | panel-parents.md |
| Teachers | Siân, Priya (two schools), Tomás (coach), Gwen (3–8 year olds), Maureen (low tech confidence) | panel-teachers.md |
| Office | Nadia (administrator), Ruth (finance), Dev (reception) | panel-admins.md |
| Owners | Small, growing, multi-site, switching from another system | panel-owners.md |
| Safeguarding lead | Persona 24, also cross-cutting for privacy and trust | panel-safeguarding.md |
| Brand and visual experts | E1 creative director; E2 identity and type designer; E3 UI designer; E4 design-systems lead; E5 motion designer; E6 UX writer | panel-brand-experts.md |
| Product and build experts | P1 product designer; P2 accessibility specialist; P3 mobile and app-store specialist; P4 front-end and performance engineer; P5 SaaS product manager; P6 dance-education consultant | panel-product-experts.md |

**Method.**
- Every group drove the app in a browser:
  - phone (390), tablet (820) and desktop (1440);
  - the dark style;
  - 200% text;
  - offline.
- Teachers moved the browser clock to real class times.
- Each persona re-checked their own round-1 complaints.

**Not tested:**
- real devices;
- screen readers;
- the hosted version;
- anything that needs sign-in, payments or message delivery.

---

## 3. Scores

### 3.1 End users, round 1 → round 2 (overall / 10)

| Group | Round 1 | Round 2 | Adoption, round 1 → 2 | Continued use, round 1 → 2 |
|---|---|---|---|---|
| Students and prospects (6) | 5.2 | **6.9** | — | — |
| Parents (5) | 5.8 | **7.3** | 6.0 → 7.8 | 5.6 → 7.0 |
| Teachers (5) | 5.8 | **7.3** | 5.4 → 7.4 | 5.4 → 7.2 |
| Office (3) | 5.8 | **7.3** | — | — |
| Owners (4) | 4.3 | **6.3** | 3.5 → 5.5 | 5.8 → 7.3 |
| Safeguarding lead (1) | 6.0 | **7.5** | 5 → 6 | 6 → 8 |
| **All 24, mean** | **5.4** | **7.0** | | |

**Persona movements.** The largest gains were for people who were blocked in round 1:
- Gareth, adult student: 3 → 6.5
- Priyanka, adult beginner: 5 → 7.5
- Small owner: 4 → 7
- Ruth, finance: 5 → 7

The lowest scores now belong to people who still depend on things not yet built:
- Switching owner, 5: needs Direct Debit migration and invitations sent by email.
- Multi-site owner, 6: needs money reported by location, and location-limited admins who can act.

### 3.2 Experts (overall / 10, no round 1)

| Brand and visual | Score | Product and build | Score |
|---|---|---|---|
| E1 creative director | 8.0 | P1 product designer | 7.5 |
| E2 identity and type | 7.5 | P2 accessibility | 7.0 |
| E3 UI designer | 7.5 | P3 mobile and app store | 6.0 |
| E4 design systems | 7.0 | P4 performance | 6.5 |
| E5 motion | 7.5 | P5 product manager | 7.0 |
| E6 UX writer | 8.0 | P6 dance-education consultant | 7.0 |
| **Mean** | **7.6** | **Mean** | **6.8** |

---

## 4. What the panel confirmed is better

All of these were seen working in the app:

- **Teachers**
  - The offline register shows marks in about 125 ms with an "Offline" banner. A child marked absent stayed absent after reconnecting.
  - Registers can't be marked on the wrong day.
  - Bulk feedback takes **4 taps for 11 children** (it was 41 for 12). Edits are kept and marked "edited".
  - Phrases are suitable for the child's age.
  - The "All my schools" agenda works, with travel time.
- **Parents**
  - A reported absence appears on the teacher's Today ("Nia — reported absent").
  - Bank details and "See how to pay".
  - Invoice notifications.
  - The "Coming up" costs list.
  - A second guardian can accept their invitation and can't edit the other parent's details.
  - Events are shown per child, with real place counts.
  - Parents manage consent.
  - Text scales.
- **Students and prospects**
  - Adult accounts and "Book for myself".
  - "I can't make it".
  - A student notification bell.
  - Class suitability and price on `/join`, and a fuller confirmation.
  - Medical questions at trial booking.
  - Progress history.
  - A "Share with my child" view.
- **Office**
  - Enquiry → trial takes **12 interactions, down from 24**. Chasing overdue invoices takes **2, down from about 32**.
  - Credit notes; the billing-run guard; ending discounts; goodwill credit; student edit; safe waiting lists.
- **Owners**
  - Class creation works.
  - Onboarding's "Your first timetable" built 4 classes in 27 steps.
  - The import warns about columns it can't use. Timetable, balances, history and invitation-link imports all work.
  - A plan limit now shows as a calm notice.
  - History screen; filter for under-filled classes; location filter.
- **Safeguarding**
  - Every round-1 defect (D-01 to D-11) is fixed in the interface.
  - Every boundary test by URL held, including two with a faked role.
  - The media consent rule works: withdrawing consent hides the media at once.
- **Accessibility**
  - axe finds no serious or critical issues on 31 routes, phone and desktop, dark style included.
  - Focus is held in sheets and returned when they close.

---

## 5. Interface: what to improve

The table merges overlapping findings from every group. "Groups" counts how many groups raised it independently. Priority uses the panel's severity (impact × how many people it affects).

| # | Improvement | Where | What exactly to change | Groups | Priority |
|---|---|---|---|---|---|
| U1 | **Large text (200%)** | `shell.tsx` header and tab bar; `/join` rows; register | Keep the header to about a quarter of the screen. Give tab labels two lines and never truncate them. Size icons (bell included) in rem. Stack `/join` class rows so the price never overlaps. Use a compact register row so a child is visible on the first screen | students, parents, teachers, safeguarding, brand, product (6) | High |
| U2 | **Make the marketing page honest and ready to sell from** | `/welcome`, store images | Remove the "Photography: …" placeholder boxes, or use real photos. Remove or soften "the part nobody else does". Remove "Card payments failed / Retry" and card mocks until cards exist. Correct "only the lead reads the log". Remove the medical notes from the mock register. Add pricing, a "Try the demo" link and a route for families. Rebuild the store images from the current app | students, admins, owners, safeguarding, brand, product (6) | High |
| U3 | **Confirmations must say what actually happened** | Billing reminders; media upload; credit note; DSL receipt; demo card states | "Sent to 7 families" when none use the app → "7 can't be reached until email is connected". "Shared with Modern Juniors" when it is staff-only → say so. A credit note shows as "£10 of £54 paid" → show it as credit. A concern raised when no DSL is named says "the lead has been told" → say who was told. Remove failed-card states from the demo data | admins, teachers, safeguarding, product (4) | High |
| U4 | **Very long pages** | `/family/children` (about 6,100 px); `/account` (about 7,400 px); `/studio` | Family: one child at a time, chosen with child chips at the top. Put "Report an absence" and "Update details" at the top of each child. Show consent once, as a summary that expands. Account: split into Brand / People and access / Data and privacy / History, and hide automatic rows in History. Settings: one tab row, not two nested | parents, students, owners, brand, product (5) | High |
| U5 | **Save behaviour** | Office sheets: student edit, credit, "Who pays", discounts; feedback | Show the new value at once (optimistic update) plus a "Saved" line. Use one save model per sheet. Keep feedback order stable. Lock a child's feedback while a share is sending (one edit was lost once) | admins, teachers, brand (3) | High |
| U6 | **Clash warnings everywhere** | Teacher List view; student timetable; family schedule | The teacher List view warns about a cover clash (today only the grid and agenda do). Show end times and flag overlaps in the student and family diaries | teachers, students, parents (3) | High |
| U7 | **Parent Home** | `/family` | Same-day CANCELLED is always a top notice (`family/page.tsx:68` skips it today). Put "Report an absence" on Home. Add a "Coming up" strip of the next show, exam, costume deadline and fee per child | parents, brand, product (3) | High |
| U8 | **Data shown consistently** | Exams; billing totals; Coming up; search | Read exam status from one source, so "Confirmed" never appears next to "No exams yet". Billing totals follow the location filter. Coming up separates invoiced from expected. ⌘K ranks an exact invoice number first. Import summaries use correct plurals | product, owners, parents, admins (4) | Medium |
| U9 | **Design-system consolidation** | `components/ui` and about 15 screens | Add shared `FilterTabs`, `Choice`, `FileField` and `LocationSelect`, and replace the 8 hand-made tab sets. A selected choice is an ink outline with a tick, not accent-filled. Allow a fixed list of Notice words, with confirmations as a status line. Use one date-format rule ("Thu 3 Dec"). Update `/design` and DESIGN-SYSTEM.md. Add a lint check that stops drift | brand (E3, E4, E6), product (2) | Medium |
| U10 | **Phone layout for the office and teachers** | Office page headers; teacher week grid | Put the avatar in "More" and the primary action in the title row or a "+", and merge the two tab rows. On a phone, show the teacher's week as a list by default; open the grid on the next class. Fix "You also teaches", and replace office copy with "Ask the office for cover" | product, brand, teachers (3) | Medium |
| U11 | **Teacher support list** | `/teach/students` "May need support" | Give each child the reason in words (attendance 57%, medical, office note). Include children flagged for low attendance (today they are missing) | teachers (1) | Medium |
| U12 | **Wording for adult students and children** | `/family` for solo adults; invitation text; child view | No "Add a child" or "a parent in the Hughes (adult)" for a solo adult. List drop-ins under "You". Make the child view warmer (class colour, next class). Replace "New → Mastered" with "First assessed: Mastered" | students (1) | Medium |
| U13 | **Owner Today, needs attention** | `/today` | Group into Today and This week, explain or remove the unexplained amber, let lines wrap, and show the top 5 with "N more" | product (1) | Low |
| U14 | **Small fixes** | Various | `/join` for age 10 shows only "Show later dates" (give a message and the next dates). A semi-transparent header shows text behind it. Phone register header truncates the time and room. Display type is too loud inside form sheets. axe definition-list error on `/learn` (`consents.tsx:235`). Pipeline "Move to" menu on every card | students, owners, teachers, admins (4) | Low |

---

## 6. New features and functions

Ranked by need and how many groups raised them. Ratings are the panel's: **E** Essential, **HD** Highly desirable, **U** Useful, **N** Nice to have.

### 6.1 Blocked by your decisions

| Feature | Rating | Groups | Decision |
|---|---|---|---|
| Email, SMS and push delivery, including invitations sent by Swayvo and urgent notices to both guardians | E | parents, admins, owners, product, students | R-003 |
| Card and Direct Debit payments, with migration of existing mandates | E | parents, owners | R-006 |
| Real sign-in | E | safeguarding (blocks real data) | R-001 |
| Hosted mode: server database, no 18 MB first load | E | product (P4) | R-002 |

### 6.2 Buildable now: highest value

| # | Feature | Problem it solves | Rating | Groups | Size |
|---|---|---|---|---|---|
| F1 | **Required safeguarding-lead setup, plus an allegations route outside the app** | With no DSL named, a concern about the owner reaches nobody | E | safeguarding | S–M |
| F2 | **One exam model, end to end** | Exam status contradicts itself between Events and child records; entries, results and grades should follow one record | E | product (P1, P6) | M |
| F3 | **September re-enrolment and moving children up a grade** | The busiest admin moment of a dance school's year isn't supported | E | product (P5, P6) | M–L |
| F4 | **School-branded home-screen icon and name** | A parent installs "Swayvo" with Swayvo's icon, but looks for their school | HD | brand (E1, E2), product (P3), parents | S–M |
| F5 | **Booking reference, add to calendar, and a manage-booking link** for drop-ins and trials | Adults and prospects can't find or change a booking | HD | students (3 personas) | S–M |
| F6 | **A public school profile or website booking widget** | Families find classes on the school's own site | HD | students, product | M |
| F7 | **Show production pack**: running order, costumes and budget, performer licences, consent snapshot per show, branded printable programme | Shows are the second-busiest workload. The printable programme still uses the old colours and has no school identity | HD | product, owners, parents, safeguarding, brand | M–L |
| F8 | **"Coming up" by month, with receipts and full payment history and an export** | Planning and records for families | HD | parents | S–M |
| F9 | **Class progress matrix** for coaches | Seeing a whole class's skills at once | HD | teachers | M |
| F10 | **Enquiry notes and follow-ups**, and an **admin-readable history** | Reception tracking; admins can't see history today | HD | admins | S |
| F11 | **Self-serve school signup and plan change**; leavers don't count towards the plan cap | Growth without manual setup | HD | owners, product | M |
| F12 | **Location-limited admins who can act**, and **money per location** | Multi-site schools | HD | owners | M–L |
| F13 | **Referral fields and a printable chronology** for concerns | Safeguarding records for referrals | HD | safeguarding | S–M |
| F14 | **"Ready offline" indicator and a register-only mode** | Confidence before class; a calm mode for low-confidence teachers | HD / U | teachers | S |
| F15 | **Branded email and notice templates** | Ready for when delivery is connected | E, once R-003 is decided | brand | S |
| F16 | **Onboarding polish**: the count fills as each setup step completes | First impression for new schools | HD | brand | S |

### 6.3 Useful later

- Deadline nudges for event entries, and a diary clash check (students).
- "Nothing suits? Tell us" enquiry (students).
- Retention figures from imported history (owners).
- Bank-statement import with matching (finance; was deferred).
- Refund and credit permissions (finance).
- Uniform list per class (product).
- Teacher pay export (product).
- Shareable term-end progress card (brand).
- Personal phrase bank (teachers).
- Headcount view for young classes (teachers).
- Text-size / simple mode inside the app (parents, accessibility).

### 6.4 Rejected or deferred by the panel itself

- **Video feedback and moderated student video:** "Nice to have", and needs safeguarding work first.
- **Badges or stickers beyond milestones:** nice to have.
- **Outside video links for footage of children:** the safeguarding lead would remove the option, not just warn.

---

## 7. Branding

**Verdict, all eight groups: KEEP. REFINE the execution. No rethink.**

### What works
- **End users (perception):**
  - The school leads ("Northstar Dance Academy, powered by swayvo"), and school colours switch cleanly.
  - Status words such as CHANGED, CANCELLED and DUE are clear.
  - The voice is kind and plain.
  - Parents and the safeguarding lead say this is what makes it feel trustworthy.
  - Teachers like the "five, six, seven, eight" voice.
- **Experts:**
  - The name, the counting in eights, Archivo for numbers and Inter for text, Count blue as "the now", and the notice style are distinctive and have held up well.
  - Layering school colours on top works.
  - Tokens have held: no new hard-coded colours in screens.

### What to refine, in priority order

1. **Marketing page and store images:**
   - placeholder photo boxes;
   - over-claims;
   - store images are all one template, out of date (they show the clipped "Curre" header and "£612 · Retry"), have no Android feature graphic, and no tablet sizes.
2. **Home-screen identity:** the installed app keeps Swayvo's icon and, on iPhone, the name "Swayvo". Parents look for their school (F4).
3. **Wordmark:** two measurable flaws.
   - The **y–v gap is 1 unit**, against 4–6 for the other letter pairs.
   - The **"o" has a visible seam**.
   - The icon's bar spacing needs tightening.

   Respace, then regenerate all brand assets (`swayvo-logo.ts`, `brand-assets.mts`).
4. **Printed programme:** still the old Sanaa palette and Georgia, with no school name or logo. Make it a branded programme (F7).
5. **Governance:** the design system has drifted (§5 U9). The `/design` showcase and DESIGN-SYSTEM.md haven't changed since 26 November.
6. **Copy rules:**
   - one date format;
   - Notice words only for changes and deadlines;
   - one data-adviser caveat instead of eight;
   - display type quieter inside form sheets.
7. **Marketing message:** the page doesn't mention that **the register works with no signal**, which is now teachers' strongest reason to like it.

### Dissent (kept)
- Owners say the in-app interface already looks like a paid product, but the public face doesn't. Experts agree, but rank the wordmark refinement above store images. Owners rank it the other way round.
- One parent worried families will search the app store for their school, not "Swayvo". That favours school-branded installs (F4) over pushing the Swayvo name.

---

## 8. Technical and accessibility notes (experts)

- **First load:**
  - **139–156 s** on a throttled phone profile, the first time.
  - About 18 MB uncompressed (5.8 MB compressed), mostly the database that runs inside the browser.
  - The earlier "~230 KB per page" figure didn't include it.
  - This affects the demo only; the hosted design (R-002) removes it.
  - Until then: show clear first-load progress, keep the database between visits, and load it in the background.
- **Accessibility:**
  - axe is clean, keyboard use works, and the skip link works.
  - Large-text ergonomics are the main gap (U1).
  - There has still been no review with real assistive technology.
- **Code structure:** some duplicated save hooks and sheet components (`useWrite`, several dialog primitives). A single dialog primitive would also help U5.
- **Mobile and app store:** a PWA install guide card is needed, plus the icon and name points above. Store listing assets are incomplete (no Android feature graphic, no tablet sizes).

---

## 9. Where the panel disagrees

| Topic | Positions | Suggested approach |
|---|---|---|
| Week grid on a phone | Teachers who chose it like it. The experts say a mostly empty grid at 390 px is the wrong default | Default to a list on phones; offer the grid as a choice; open on the next class |
| Notice words | Experts want a fixed list. Parents like seeing DUE and PAID clearly | Keep words for changes, deadlines and status. Use a quieter status line for confirmations |
| How much to show parents | The UX designer wants one child at a time. Hannah (three children) likes seeing everyone at once on Home | One child at a time on the Family page. Keep the all-children summary on Home |
| What to fix first in branding | Owners: the public page. Brand experts: governance and the wordmark | Do the public page and store images first (they're commercial), then the wordmark and governance |
| Simplicity vs power | Maureen wants a register-only mode. Tomás wants a class progress matrix | Both, as separate optional views; neither changes the default |

---

## 10. Recommended next steps

1. **Quick, high-impact interface work**, mostly small:
   - U3 truthful confirmations;
   - U7 parent Home;
   - U6 clash warnings;
   - U5 save feedback;
   - U1 large-text header, tabs and `/join`;
   - U14 small fixes.
2. **Public face:**
   - U2 marketing page and store-image rebuild;
   - F4 school-branded install;
   - wordmark refinement and asset regeneration.
3. **Design-system consolidation:**
   - U9 shared components, word list and date rule, `/design` and docs, lint;
   - U4 page splits;
   - U10 phone layouts.
4. **Features:**
   - F1 DSL setup and allegations route (safeguarding, so first);
   - F2 one exam model;
   - F3 September re-enrolment;
   - F5 booking management;
   - F7 show production pack.

   Then F8–F16 as capacity allows.
5. **Decisions:** R-001 sign-in, R-002 hosting, R-003 delivery, R-006 payments. These unlock the remaining essentials, the hosted performance fix, and real-user testing.

*Simulated panel; observed findings. No application code was changed during this review.*
