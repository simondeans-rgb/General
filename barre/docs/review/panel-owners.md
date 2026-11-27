# Panel report: school owners (personas 19–22)

> **These are simulated findings.** The four personas are composites invented to give professional judgement. They are not real users and this is not real user research. Every observation comes from driving the preview build (`/General/studio-next/`) with Playwright, or from reading the code, and each one is labelled to say which. Task times are not human task times. Where an elapsed time is given, the script measured it.

---

## 1. Method and limitations

**What was driven:**
- Headless Chromium through Playwright, in fresh browser contexts. Where a flow had to span several runs, a persistent profile kept the in-browser database between them.
- Personas used:
  - Freya Lindqvist (owner) for scenarios 32–38.
  - Jordan Ellis (platform admin) to create a new school.
  - The invitation link, opened signed out, to become that school's new owner ("Sam Okoye", Harbour Lane Dance) for scenario 31.
  - Nadia (admin) and Marcus (teacher), to check permission boundaries.
- Viewports: desktop 1440×900 for every scenario, plus a phone check at 390×844 of `/today` and `/reports`. Neither had horizontal overflow (scrollWidth was 390).
- Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/owners/`.
- Screenshots are saved as `docs/review/shots/owners-*.jpg`.
- Interaction counts are the clicks, fills and selects the scripts actually performed.

**What could not be tested:**
- Real sign-in (R-001), hosting and multi-device sync (R-002), email/SMS delivery (R-003) and card or Direct Debit payments (R-006). Invitation links have to be copied by hand.
- Charging schools for Swayvo plans: Stripe Billing is "not connected yet" according to `/platform/plans`.
- Offline behaviour. The demo database runs locally in the browser, so it "works offline" trivially. `ARCHITECTURE.md` describes a hosted Postgres/Supabase design, so in production an owner's dashboards would need a connection. This is an unverified inference.
- Multi-school consolidation. This was checked in code only: migration `0032_school_switch.sql` makes a user with several schools look at **one school at a time**, and `SchoolSwitcher` confirms it. No seeded owner owns two schools, so this was not driven in the browser.
- Competitor platforms. Nothing was verified. Comparisons in persona 22 are labelled as assumptions. WebSearch was not used.

**Caveat on the demo build:** in one run, a chaperone added right before the script closed the browser did not persist. It did persist on a re-run that waited longer. I attribute this to the in-browser database flushing asynchronously when the browser closes, not to a product defect.

---

## 2. Scenario results

### Scenario 31: Set up a new school and create its initial timetable
- **Persona:** 19, small independent owner, new to Swayvo. The platform side was run as Jordan.
- **Objective:** go from "school created" to a first class on the timetable.
- **Starting point:** `/platform`, then New school.
- **Outcome: Unable to complete.** Every step up to the first class worked. Creating the class fails with a database error, so the timetable stays empty.
- **Steps (32 interactions in total):**
  1. Platform side, 5 interactions: New school, school name, owner name, owner email, Create school. An invitation link appears (shot `owners-02-new-school-invite.jpg`).
  2. Owner side, 2 interactions: open the link signed out, Accept and join. This lands on `/onboarding` with "1 of 13 steps done". Studio details are pre-filled from the contact email (shot `owners-04-new-school-onboarding.jpg`).
  3. Locations, 5 interactions: "Add a location" link on the onboarding page opens `/studio#places`; Add a location; name; city; Save.
  4. Room, 3 interactions: Add a room, name, Save.
  5. Term, 6 interactions: Terms tab, Add a term, name, first day, last day, Save. The term saved as **Draft** with "0 classes".
  6. Style, 4 interactions: Teaching tab, Add a dance style, name, Save.
  7. Class, 7 interactions: `/classes`, New class, name, then day, time, places and price, then Create class. Style, term and location were pre-selected because each had only one option (shot `owners-06-new-class-form.jpg`).
  8. **Result:** the error "Something went wrong — column "pricing" specified more than once" appears at the bottom of the form. `/schedule` shows "No classes this week" (shot `owners-07-new-school-timetable.jpg`).
- **Observed difficulties:**
  - The onboarding wizard is a checklist of links into settings pages, not a guided flow. You come back to `/onboarding` by hand after each step.
  - Teachers can only be added through People, so the class form offered just "Not assigned yet".
  - The term defaults to Draft and nothing explains what Draft means for sessions being generated.
- **Unnecessary steps:** tab switching inside `/studio` (Places → Terms → Teaching) could be a single "first timetable" flow.
- **Missing functionality:** a "first timetable" quick-start that captures location, term and classes in one place, and a sample timetable to copy.
- **Errors and defects:** D1 (critical), D2, D3.
- **Clarity of outcome:** poor. The error sits below the fold, so the owner sees nothing happen.
- **Simulated satisfaction:** 1/5.
- **Suggested improvements:** fix D1 and add a regression test; scroll to or pin form errors; make the empty-school copy accurate; publish the term or explain Draft.

### Scenario 32: Identify classes running below capacity
- **Persona:** 20, growing owner.
- **Outcome: Completed with minor friction.**
- **Steps (1 interaction):** open `/reports`. The "Classes" section lists classes fullest-first with an `x of y` bar and four-week attendance. The emptiest classes are at the bottom: Contemporary Seniors 7/14, Pre-School Ballet 7/12 and Adult Contemporary (drop-in) 0/16 (shot `owners-09-reports.jpg`). `/classes` shows the same `x/y` figures, grouped by day.
- **Difficulties:**
  - There is no threshold filter (for example "under 60% full") and no sort by fill rate ascending.
  - Revenue lost to empty places is not shown.
  - The drop-in class shows "0 of 16 · No registers", which treats a drop-in class as an empty enrolled class. That is misleading if drop-ins are booked per session; I did not verify how drop-in bookings are counted.
  - There is no location filter, so a two-site owner cannot ask "which Blackheath classes are under-filled?"
- **Simulated satisfaction:** 4/5.
- **Improvements:** an "Under-filled" view with a threshold, per-location filter and the revenue gap; show drop-in classes by average bookings per session.

### Scenario 33: Understand student retention trends
- **Persona:** 20.
- **Outcome: Partially completed.**
- **Steps (1 interaction):** `/reports`.
  - Headline figures: Active students 45 ("up 9 vs 30 days ago"), New 30 days 12, Leavers 30 days 3.
  - "Six months" table (collected, joined, left) shows only Oct and Nov, because the seed has about 49 days of history.
  - Studio Pulse "Retention" shows "Not enough data" ("Needs 180 days of history … Swayvo has 49").
- **Missing:**
  - A term-on-term retention rate.
  - A cohort view (of the students who started in September, how many remain).
  - Leavers by class, teacher or age, and leaving reasons.
  - "Missed three classes in a row" appears on `/today` as an at-risk list, which is useful, but it is not trended.
- **Clarity:** Pulse is honest about withholding its score, which I rate well. Owners still get no retention number for six months.
- **Simulated satisfaction:** 2/5.

### Scenario 34: Review business performance
- **Persona:** 21, large owner, and 19.
- **Outcome: Completed with minor friction** for a single-site snapshot. A multi-site owner would hit significant friction.
- **Steps (2 interactions):**
  1. `/today` shows Outstanding £612.00 and Collected 30 days £2,088.00 (shot `owners-08-owner-today.jpg`).
  2. `/reports` shows four KPIs (active students, attendance 90%, places filled 68%, trial conversion 58%), four secondary figures, attendance by week and a six-month money table.
  - Exports: Attendance, Class lists and Families as CSV. A Xero sales-invoice CSV exists on `/billing`; I checked that in code (`src/app/billing/page.tsx:255`) but did not drive it.
- **Missing:**
  - Revenue by class, teacher, style or location.
  - Comparison against the same term last year.
  - Forecast billing for next term.
  - A date-range picker.
  - Teacher cost or profitability. This is out of scope today, and payroll is absent.
- **Inconsistency:** `/account` shows "Students 64 of 300" while `/reports` shows "Active students 45". Both may be correct, but neither label explains the difference (D8).
- **Simulated satisfaction:** 3/5.

### Scenario 35: Open a second studio location
- **Persona:** 21.
- **Outcome: Partially completed.**
- **Steps:**
  1. Northstar already has two locations (Greenwich, Blackheath). On `/studio#places`: Add a location, name, city, Save (4 interactions). "Lewisham Community Hall" was created.
  2. Adding a fourth location: same 4 interactions, then **refused**. The dialog is headed "Something went wrong" and reads "The Studio plan includes up to 3 locations. Ask Swayvo to move you to a larger plan." (shot `owners-12-location-limit.jpg`). Plans are seeded as Trial and Starter with 1 location, Studio with 3, Academy unlimited (`/platform/plans`, shot `owners-18-platform-plans.jpg`).
  3. Add a room at the new location: Add a room, pick location, name, Save (4 interactions). This worked.
  4. Create a class at the new location (9 interactions): **fails** with the same D1 error (shot `owners-13-create-class-error.jpg`).
  5. **Workaround, 9 interactions:** open an existing class, Duplicate, Duplicate, Done, open the copy, Edit, rename, change Studio, Save. This worked, and the copy got 13 sessions.
  6. Multi-location reporting: `/schedule` has a "Room" view that groups the grid by room with each room's location. `/reports` has **no location dimension**: none of the queries in `src/lib/repos/reports.ts` reference `location`.
- **Missing:**
  - A location filter on Reports, Today, Billing and Classes.
  - Location-level managers. Permissions are school-wide, with no "admin for Blackheath only".
  - An in-app plan upgrade request.
  - A consolidated view across separate schools: the school switcher shows one school at a time (code).
- **Simulated satisfaction:** 2/5.

### Scenario 36: Migrate from an existing platform
- **Persona:** 22.
- **Outcome: Partially completed.** Families and children can be imported well. Nothing else can.
- **Steps:**
  1. Open `/people?import=1`. The Import families wizard says "One row per child, from a CSV file" and offers a Template download.
  2. **First file, with deliberate problems (3 interactions):** choose file, check mapping, Check the file. Columns were auto-mapped sensibly (Parent Name, Email, Mobile, DOB, Allergies, Photo permission, Class). Validation listed 3 row-level problems and **imported nothing** (shot `owners-11-import-errors.jpg`):
     - `"03/14/2016" — use DD/MM/YYYY`
     - `No class called "Ballet Grade 2"`
     - `Email "ola@example" is not valid`
     - It also warned that Grade 3 Ballet would overfill and the extras would go on its waiting list.
  3. **Corrected file (4 interactions):** choose file, Check, Import 4 children. Result: "3 new families and 4 children · 3 class places taken; 1 medical notes added to records". Siblings were grouped by email.
- **Problems:**
  - The source file's "Balance owed" and "Direct debit mandate" columns were **silently ignored**: no warning that data would be dropped (D5).
  - Code check (`0027_import.sql`): the import covers families, a second parent, children, emergency contact, allergies and medical notes, photo consent and class enrolment only. Nothing imports:
    - classes or timetable
    - staff
    - opening balances or credit
    - invoice or payment history
    - attendance history
    - progress or exam history
    - Direct Debit mandates
  - Limits: 2,000 rows per import, all-or-nothing, re-runnable without creating duplicates (good).
  - Outbound, the owner can export everything as JSON from `/account`, plus CSV lists. That is a reasonable exit route.
- **Staff and parent onboarding:** invitations must be created and the links sent by hand, because email is not connected (`InviteLink` says so). For a school of 150 families this is a major manual job.
- **Simulated satisfaction:** 3/5 for the families import itself; 1/5 for a full migration.

### Scenario 37: Understand which staff can access sensitive information
- **Persona:** 21.
- **Outcome: Completed with significant friction.**
- **Steps:**
  1. `/account`, "People with access" (1 interaction): grouped by role, each role with a plain description:
     - Owners: "Everything, including the account, billing and who has access"
     - Administrators: "Day-to-day running: people, classes, billing, messages"
     - Teachers: "Their own classes and registers, and a safety brief for their students"
     - A role selector per person (shot `owners-10-account-access.jpg`).
  2. Signed in as Marcus (teacher): `/people`, `/reports` and `/billing` all show "Not part of your role".
  3. Signed in as Nadia (admin): `/studio` shows "Only the studio owner can change these", and the brand on `/account` shows "Only the school's owner can change its brand".
  4. `/safeguarding` as owner: concerns, choosing the Designated Safeguarding Lead, and a "Who has looked" access log (shot `owners-15-safeguarding-owner.jpg`). In one run this page rendered **blank** for a few seconds after the rest of the app was ready (D6).
  5. Swayvo support access on `/account`: time-limited, "never includes health records", and each support visit is listed.
- **Missing:**
  - **No audit-log screen.** RLS lets owners read `audit_log` (`0007_rls_operations.sql:145`), but the only UI is the support-session list (`src/lib/repos/account.ts:63`).
  - Reads of medical records are not logged. Per `SECURITY.md`, triggers log writes on `medical_record` and similar tables; only safeguarding logs views.
  - The role descriptions do not say explicitly that admins can read medical records and family messages.
  - No custom roles, no per-location scoping, and no "view-only admin".
- **Simulated satisfaction:** 3/5.

### Scenario 38: Organise an end-of-term performance
- **Persona:** 20.
- **Outcome: Completed with minor friction.**
- **Steps (17 interactions):** `/events`, then open "Summer Show — Greenwich Theatre", then:
  - Select Grade 2 Ballet and Junior Tap, then Invite 2 classes. Result: "19 dancers invited; their families have been told."
  - Routine name, class, costume, Add routine. The running order shows the costume, and Print programme appears.
  - Rehearsal date/time, Add rehearsal: "Rehearsal added to dancers' and teachers' diaries"; each rehearsal has a Register button.
  - Ticket price and seats, Add ticket type: "Adult £12.00 · 0 sold · 200 left".
  - Chaperone name, phone, "DBS or licence seen", Add chaperone (shot `owners-14-event-show-detail.jpg`).
- **Consent:** families accept or decline the invitation in their app. The programme names children only with photo consent, according to the help text, which I did not verify. Fees are billed in one step ("Bill the fee to N new dancers").
- **Friction:**
  - The new rehearsal and ticket type did not appear in the open panel within about 1.5 s. They were there after reopening. Possibly slow cache invalidation; not confirmed as a defect.
  - Every invited class appears as a long list of chips plus long dancer lists in one side panel. That is workable for one show but heavy for a show with 15 routines.
  - There is no volunteer rota (front of house, backstage parents); only chaperones.
  - There is no licensing or performance-hours tracking for child performers. Chaperones have only a single "DBS or licence seen" tick.
  - Tickets "go on their account until card payment is switched on".
  - `/events` shows "Exams · No exam sessions yet" directly below an event of kind **Exam** ("RAD Grade 3 Ballet examinations"). Two exam concepts sit side by side (D8).
- **Simulated satisfaction:** 4/5.

### Phone check: Today (owner)
`/today` at 390×844 loaded in about 15 s on first open, including database setup. The next class, "Needs attention" (7 items with counts and actions) and a bottom tab bar fit with no horizontal scroll (shot `owners-16-phone-today.jpg`). The header subtitle is cut off to "Friday 27 November · Curre" (D10).

---

## 3. Feature status table

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Create school and owner invitation | `/platform` New school | Fully implemented & tested | S31 steps 1–2, shot 02 |
| Accept invitation as new owner | `/invite` | Implemented, not testable (real sign-in) | Demo accept works; R-001 pending |
| Setup checklist | `/onboarding` | Partial | 13 derived steps, but a link list only; empty-school copy wrong (D3) |
| Locations and rooms | `/studio#places` | Fully implemented & tested | S35 |
| Plan limits (locations, students, staff) | DB trigger, `0019_platform.sql` | Fully implemented & tested | Fourth location refused, shot 12 |
| Plan upgrade by owner | `/account` Plan | Missing | "To change plan, contact Swayvo" |
| Terms and breaks | `/studio#terms` | Fully implemented & tested | S31 |
| Create class | `/classes` New class | **Defective** | D1, shot 13 |
| Duplicate and edit class | `/classes?id=` Duplicate | Fully implemented & tested | S35 workaround |
| Term rollover | `/classes` Start next term | Implemented, not tested here | Code `0025_term_rollover.sql` |
| Capacity and fill view | `/reports` Classes, `/classes` | Fully implemented & tested | S32 |
| Under-capacity filter or threshold | — | Missing | S32 |
| Retention reporting | `/reports` leavers and Pulse | Partial | S33; no cohort or term retention |
| Business KPIs | `/reports`, `/today` | Fully implemented & tested (single school) | S34 |
| Revenue by class, teacher or location | — | Missing | `reports.ts` |
| Location filter in reports | — | Missing | No `location` in `src/lib/repos/reports.ts` |
| Multi-school consolidated view | School switcher | Missing (one school at a time) | `0032_school_switch.sql`, code only |
| CSV exports (attendance, lists, contacts) | `/reports` Export | Implemented, not driven | `reports.ts` EXPORTS |
| Xero invoice export | `/billing` | Implemented, not driven | `billing/page.tsx:255` |
| Full JSON export | `/account` Your data | Implemented, not driven | Button seen |
| Families CSV import | `/people?import=1` | Fully implemented & tested | S36 |
| Import of classes, staff, balances, history, mandates | — | Missing | `0027_import.sql` |
| Role management | `/account` People with access | Fully implemented & tested (view) | Shot 10 |
| Role enforcement (teacher, admin) | Shell and RLS | Fully implemented & tested | S37 |
| Audit log viewer | — | Missing (data exists) | `account.ts:63` support sessions only |
| Medical read logging | — | Missing | `SECURITY.md` audit section |
| Safeguarding log, lead and access log | `/safeguarding` | Fully implemented & tested (empty data) | Shot 15 |
| Support access grant | `/account` | Fully implemented & tested (view) | S37 |
| Data retention settings | `/account` Keeping data | Implemented, not driven | Seen |
| Events: invites, consent, fees | `/events` | Fully implemented & tested | S38 |
| Running order, costumes, programme | `/events` panel | Fully implemented & tested | S38, shot 14 |
| Rehearsals with registers | `/events` panel | Fully implemented & tested (add) | S38 |
| Tickets | `/events` panel | Partial (no card payment) | S38 |
| Chaperones and DBS flag | `/events` panel | Fully implemented & tested | S38 re-run |
| Volunteer rota | — | Missing | S38 |
| Pilot activation tracker | `/platform/pilot` | Implemented (no cohort data) | "No pilot schools yet" |
| Plan pricing model | `/platform/plans` | Implemented; school billing missing | Stripe Billing not connected |

---

## 4. Defects found

**D1. Creating a class always fails. Severity: critical.**
- **Steps:** as owner (Northstar, or a new school) go to `/classes`, choose New class, fill the required fields and choose Create class.
- **Expected:** the class is created and its sessions generated.
- **Actual:** "Something went wrong — column "pricing" specified more than once". Nothing is created.
- **Cause:** `src/lib/repos/classes.ts:119–128` (`CREATE_CLASS`). The column list names `pricing` twice and has 25 columns for 24 values.
- **Impact:** a new school cannot build any timetable from the UI. Existing schools can only work around it by Duplicate and Edit.
- **Evidence:** shots `owners-13-create-class-error.jpg` and `owners-07-new-school-timetable.jpg`.

**D2. Class form errors appear below the fold. Severity: medium.**
- **Steps:** follow D1 without scrolling.
- **Expected:** the error is visible next to the button, or the form scrolls to it.
- **Actual:** the error renders at the bottom of the scrolling form body. Checked with Playwright: it was not in the viewport after the click, so the user sees no response.
- **Code:** `class-form.tsx` (`save.isError` block above the footer).

**D3. Onboarding says a brand-new school contains sample data. Severity: medium.**
- **Steps:** create a school on `/platform`, accept the invite, land on `/onboarding`.
- **Expected:** copy written for an empty school.
- **Actual:** "This school was created with sample data so you can see how everything fits together…", which is hard-coded at `src/app/onboarding/page.tsx:149–152`.
- **Evidence:** shot `owners-04`.

**D4. A plan limit is presented as an error. Severity: low–medium.**
- **Steps:** on the Studio plan, add a fourth location.
- **Expected:** a calm limit notice with an "ask to upgrade" action.
- **Actual:** the "Something went wrong" error state containing the plan message.
- **Evidence:** shot `owners-12`.

**D5. Import drops unmapped columns silently. Severity: medium.**
- **Steps:** import a CSV that has "Balance owed" and "Direct debit mandate" columns.
- **Expected:** a warning that these columns will not be imported.
- **Actual:** no mention. The import succeeds and the data is lost.
- **Code:** `src/components/app/import-wizard.tsx`.

**D6. Safeguarding page is blank while loading. Severity: low.**
- **Steps:** as owner, open `/safeguarding` on first load.
- **Expected:** a loading skeleton.
- **Actual:** in one run the main area was empty after the app was otherwise ready. The page renders nothing until the `me` query resolves (`src/app/safeguarding/page.tsx:20–36`).

**D7. Screen-reader attendance table reads "no registers%". Severity: low.**
- **Where:** `/reports`, the hidden attendance table: the "5 Oct" row reads "no registers%".
- **Code:** `src/app/reports/page.tsx`, `WeekBars`: `{pct(...) ?? 'no registers'}%`.

**D8. Figures and concepts are inconsistent. Severity: low.**
- `/account` shows "Students 64 of 300" while `/reports` shows "Active students 45", and neither definition is explained.
- `/events` shows "Exams · No exam sessions yet" while an Exam-kind event is listed above it.

**D9. Old product name in the import template. Severity: low.**
- The template downloads as `barre-import-template.csv` (`import-wizard.tsx:71`).

**D10. Phone Today subtitle is truncated. Severity: low.**
- At 390 px it reads "Friday 27 November · Curre" (shot `owners-16`).

---

## 5. Individual panel member reports

### Persona 19: Small independent school owner (simulated)

**User profile**
- I run a one-room ballet and tap school in a church hall: about 70 pupils, 9 classes, just me and one part-time assistant.
- I teach five evenings and Saturday mornings, and do the invoices and emails on Sunday nights.
- Tech confidence: moderate. I live in spreadsheets and a bank app, and I do admin on a laptop because the phone is too small for invoices.
- I am mildly dyslexic, so dense text tires me.
- **Primary needs:** less Sunday-night admin, chasing who has paid, a register I can't lose.
- **Existing frustrations:** three tools that don't talk to each other, and parents who don't read emails.

**Application experience**
- **First impressions:** the setup page (`/onboarding`) is clear, numbered and plain, and the "Next" box tells me what to do. Then I created my first class and got "column "pricing" specified more than once". I didn't even see it at first, because it was below the button. For me that is the end of the trial.
- **Most valuable:** `/today`'s "Needs attention" list (failed payments, families waiting, trials not enrolled) and term billing in one run.
- **Least valuable:** Studio Pulse. I'm not waiting 180 days for a score.
- **Exceeded expectations:**
  - The import found my bad dates and email and imported nothing until I fixed them.
  - The school details were already filled in from my email.
- **Failed expectations:**
  - I can't create a class.
  - Setup sends me around four tabs of Settings, and I go back to the checklist by hand each time.
  - "This school was created with sample data" on my empty school confused me.
- **Usability concerns:** errors off-screen; jargon ("Draft" term, "Unlisted"); long forms.
- **Missing:** a quick "set up my week" grid where I type my 9 classes in one go.
- **Simplify:** put Places, Terms and Styles into one first-timetable flow.

**Recommendations**
- **Top 5:**
  1. Fix class creation.
  2. A one-screen first-timetable setup.
  3. Show errors where I'm looking.
  4. Real email invitations.
  5. Card or Direct Debit payments.
- **Remove or simplify:** hide Studio Pulse until it has a score.
- **Greatest impact:** fix class creation and make setup a single guided flow.

**Adoption verdict**
- **Would I use it:** not today, because I can't build a timetable.
- **Prefer it to my current arrangements:** if the bug were fixed and payments connected, yes. The Today list and term billing would save my Sunday nights.
- **Recommend it:** not yet.
- **What would prevent adoption:** no way to take payment, and manual invite links.
- **What would keep me using it:** billing runs plus automatic reminders.

**Scores:** Relevance 9 · Quality 5 · Completeness 4 · Ease of use 6 · Efficiency 5 · Overall usefulness 5 · Likelihood of adoption 3 · Likelihood of continued use 6.
**Overall: 4/10.** The design fits my school well, but the one thing a new school must do first is broken, and money collection is not connected.

### Persona 20: Growing school owner (simulated)

**User profile**
- I co-own a school that has grown from 120 to 260 students in three years: 6 teachers, 28 classes, two halls in one building, and an annual show.
- My background is commercial dance and events management, not admin.
- Tech confidence: high. I use the desktop for planning and my phone between classes.
- **Primary needs:** know which classes to merge or market; keep retention up; run the show without twenty spreadsheets.
- **Existing frustrations:** the waiting lists and show logistics live in my head.

**Application experience**
- **First impressions:** `/reports` is clean. The four numbers I'd pick anyway, and every class with its fill and attendance. I spotted under-filled classes in seconds.
- **Most valuable:**
  - The Events panel: invite whole classes, running order with costumes, rehearsals with registers, tickets, chaperones and one-step fee billing. That is genuinely my show in one place.
  - Waiting lists on full classes.
- **Least valuable:** the six-month money table. It only has two months here and has no comparison.
- **Exceeded expectations:** rehearsals land in families' and teachers' diaries automatically; the programme respects photo consent (per the help text).
- **Failed expectations:**
  - Retention: there is no term-on-term figure and no cohort view, and Pulse says "Not enough data".
  - There is no "classes under 60%" filter.
  - New rehearsals and tickets did not show in the panel until I reopened it.
- **Usability concerns:** the show panel becomes a very long scroll, and the class chips and dancer lists will be huge with 28 classes.
- **Missing:**
  - A volunteer rota for parents.
  - Performance licence or hours tracking.
  - Revenue per class.
- **Simplify:** split the event panel into tabs (Dancers, Running order, Costumes, Rehearsals, Tickets, Helpers).

**Recommendations**
- **Top 5:**
  1. A retention report (term-on-term, by class).
  2. An under-filled classes filter with the revenue gap.
  3. A volunteer and parent-helper rota.
  4. Event panel tabs.
  5. Card payment for tickets.
- **Remove or simplify:** the six-month table until there is enough history.
- **Greatest impact:** the retention report.

**Adoption verdict**
- **Would I use it:** yes, for shows and registers, once class creation works.
- **Prefer it to my current arrangements:** yes for events, but I'd keep my spreadsheet for retention analysis.
- **Recommend it:** to smaller peers, yes, cautiously.
- **What would prevent adoption:** no online payments, and the class-creation bug.
- **What would keep me using it:** if shows and billing become routine in it.

**Scores:** Relevance 9 · Quality 6 · Completeness 6 · Ease of use 7 · Efficiency 7 · Overall usefulness 7 · Likelihood of adoption 6 · Likelihood of continued use 7.
**Overall: 6/10.** Strong events and capacity views, weak retention insight, and one critical bug.

### Persona 21: Large multi-location owner (simulated)

**User profile**
- I own a group of four studios across two towns: about 900 students, 22 staff, and 2 office managers.
- I came from retail operations management.
- Tech confidence: high, and I'm desktop-first. I expect role-based access, audit trails and per-site P&L.
- I'm accountable to a business partner and to safeguarding inspectors.
- **Primary needs:** consistency across sites, oversight without micromanaging, and evidence of who accessed what.

**Application experience**
- **First impressions:** the permission model is serious. Teachers are refused billing and people, and admins can't touch studio settings. The safeguarding log records who looked. Then I tried to add my fourth studio and was told "Something went wrong — the Studio plan includes up to 3 locations".
- **Most valuable:**
  - Clear role descriptions on `/account`.
  - Support access that is time-limited, logged and excludes health records.
  - The safeguarding access log.
  - The retention-period settings.
- **Least valuable:** brand styling options. Nice, but not why I'd buy.
- **Exceeded expectations:** RLS-backed separation. The database enforces it, not just the UI (per `SECURITY.md`).
- **Failed expectations:**
  - Reports have no location filter, so I can't compare Blackheath with Greenwich.
  - There is no audit-log screen, even though the data exists.
  - Nobody logs who opened a child's medical record.
  - There are no location-scoped managers.
  - Creating a class at the new site failed, so I had to duplicate an existing class and edit it (9 interactions).
- **Usability concerns:** with 4 sites, the single class list sorted by day becomes unmanageable without location filters.
- **Missing:**
  - Per-site reports and P&L.
  - Cross-school consolidated view (the school switcher shows one school at a time).
  - Custom or scoped roles.
  - An audit viewer and export.
  - Owner-initiated plan upgrade.
- **Simplify:** nothing to remove. I need more, not less.

**Recommendations**
- **Top 5:**
  1. A location filter across Reports, Classes, Billing and Today.
  2. An audit and access log viewer, including medical-record reads.
  3. Location-scoped admin roles.
  4. Plan upgrade from within the app, with the limit shown as a notice rather than an error.
  5. Fix class creation.
- **Remove or simplify:** the Studio Pulse "Preview" on the main reports page; move it to a separate tab.
- **Greatest impact:** location dimension in reporting and permissions.

**Adoption verdict**
- **Would I use it:** not for a four-site group today.
- **Prefer it to my current arrangements:** not yet.
- **Recommend it:** only to single-site schools.
- **What would prevent adoption:** no per-site reporting or scoping, no audit UI, no payments.
- **What would keep me using it:** a reliable audit trail and per-site dashboards.

**Scores:** Relevance 7 · Quality 6 · Completeness 4 · Ease of use 7 · Efficiency 5 · Overall usefulness 5 · Likelihood of adoption 3 · Likelihood of continued use 5.
**Overall: 4/10.** Strong security foundations, but it is built for one site.

### Persona 22: Owner considering switching from an established platform (simulated)

**User profile**
- I've run a 300-student school for eleven years and have used an established class-management platform for six of them. I would rather not name it; my knowledge of it is not something this panel can verify.
- I'm a former primary teacher. Tech confidence: medium.
- I am cautious, because my last migration lost payment history.
- **Primary needs:** a migration that does not break Direct Debit collections or confuse 200 families.

**Application experience**
- **First impressions:** the families import is careful.
  - It auto-matched my column names.
  - It told me row 4 had an American-format date and a class name that doesn't exist, and row 5 a bad email.
  - It imported nothing until the file was clean.
  - It grouped siblings by parent email and can be run twice safely.
  - That is better than I feared.
- **Most valuable:**
  - The validate-before-import step.
  - The full JSON export, so I'm not locked in.
  - CSV and Xero exports. I saw the Xero export only in the code description, not driven.
- **Least valuable:** branding steps during migration week.
- **Exceeded expectations:** the waiting-list warning when the import would overfill a class.
- **Failed expectations:**
  - My "Balance owed" and "Direct debit mandate" columns were silently ignored.
  - There is no import for classes or timetable, staff, balances, invoice or payment history, attendance or exam results.
  - Payment mandates cannot move at all, because payments are not connected.
  - Parent and staff invitations are links I must send one by one.
- **Usability concerns:** I can't import my timetable, and I can't create classes by hand either (D1). So enrolment via import fails ("No class called …") until classes exist.
- **Missing:**
  - Timetable import.
  - Opening balances.
  - Bulk invitation emails.
  - A mandate migration path. **Assumption, not verified:** Direct Debit providers typically support bulk mandate transfers between platforms; I have not checked this for any named provider.
  - A parallel-running period checklist.
- **Simplify:** a single "Moving from another system" wizard instead of separate import, setup and invite steps.

**Recommendations**
- **Top 5:**
  1. Timetable import, or class creation that works.
  2. Opening balances and credit import.
  3. Warn on unmapped columns.
  4. Bulk email invitations with tracking.
  5. A payment-mandate migration plan (depends on R-006).
- **Remove or simplify:** the separate onboarding "Prices and discounts" step during migration; it could be deferred.
- **Greatest impact:** a guided migration wizard covering classes, families, balances and invites.

**Adoption verdict**
- **Would I use it:** not this year. Switching would mean asking every family to re-set up payments, and payments aren't connected.
- **Prefer it to my current arrangements:** the families import is good, but a full migration is not possible.
- **Recommend it:** no.
- **What would prevent adoption:** mandate migration, history import, manual invitations.
- **What would keep me using it:** reliable exports and the permission model.

**Scores:** Relevance 8 · Quality 6 · Completeness 3 · Ease of use 6 · Efficiency 4 · Overall usefulness 5 · Likelihood of adoption 2 · Likelihood of continued use 5.
**Overall: 3/10.** The migration story covers families only, and the money side, which is what I would most fear losing, is absent.

---

## 6. Votes (machine-readable)

**Persona 19 (small owner)**

| Type | Item | Rating |
|---|---|---|
| Valuable | Needs-attention dashboard | |
| Valuable | Term billing run | |
| Valuable | Families CSV import | |
| Valuable | Setup checklist | |
| Valuable | Payment reminders | |
| Frustration | Class creation broken | |
| Frustration | Setup scattered across settings tabs | |
| Frustration | Errors off-screen | |
| Frustration | Manual invite links | |
| Frustration | Card payments not connected | |
| Missing | Class creation fix | Essential |
| Missing | Card payments | Essential |
| Missing | Guided first timetable | Highly desirable |
| Missing | Email invitations | Highly desirable |
| Missing | Inline form errors | Highly desirable |
| Remove/simplify | Studio Pulse (hide until score) | |
| Greatest impact | Class creation fix | |

**Persona 20 (growing owner)**

| Type | Item | Rating |
|---|---|---|
| Valuable | Show management | |
| Valuable | Class capacity report | |
| Valuable | Waiting list | |
| Valuable | Rehearsal registers | |
| Valuable | Event fee billing | |
| Frustration | No retention trend | |
| Frustration | No under-capacity filter | |
| Frustration | Long event panel | |
| Frustration | Event lists not refreshing | |
| Frustration | Class creation broken | |
| Missing | Retention report | Essential |
| Missing | Under-capacity filter | Highly desirable |
| Missing | Volunteer rota | Highly desirable |
| Missing | Ticket card payments | Useful |
| Missing | Revenue by class | Useful |
| Remove/simplify | Six-month table (until history) | |
| Greatest impact | Retention report | |

**Persona 21 (multi-location owner)**

| Type | Item | Rating |
|---|---|---|
| Valuable | Role-based permissions | |
| Valuable | Safeguarding access log | |
| Valuable | Support access control | |
| Valuable | Data retention settings | |
| Valuable | Full data export | |
| Frustration | No location filter in reports | |
| Frustration | No audit log viewer | |
| Frustration | Plan limit shown as error | |
| Frustration | No location-scoped roles | |
| Frustration | Class creation broken | |
| Missing | Multi-location reporting | Essential |
| Missing | Audit log viewer | Essential |
| Missing | Location-scoped roles | Highly desirable |
| Missing | Medical access logging | Highly desirable |
| Missing | Multi-school consolidated view | Useful |
| Remove/simplify | Studio Pulse preview on main reports | |
| Greatest impact | Multi-location reporting | |

**Persona 22 (switching owner)**

| Type | Item | Rating |
|---|---|---|
| Valuable | Families CSV import | |
| Valuable | Import validation | |
| Valuable | Full data export | |
| Valuable | Accounting export | |
| Valuable | Waiting list | |
| Frustration | Unmapped columns dropped silently | |
| Frustration | No timetable import | |
| Frustration | No balance/history import | |
| Frustration | Manual invite links | |
| Frustration | No payment mandates | |
| Missing | Data import/migration | Essential |
| Missing | Direct Debit mandate migration | Essential |
| Missing | Opening balances import | Highly desirable |
| Missing | Email invitations | Highly desirable |
| Missing | Unmapped column warning | Highly desirable |
| Remove/simplify | Prices and discounts step during migration (defer) | |
| Greatest impact | Data import/migration | |

---

## 7. Group consolidated view (owners)

- **Principal needs:** a working first timetable; money collected; insight into fill and retention; trust and oversight (permissions and audit); a credible migration route.
- **Most valuable functionality:**
  - The `/today` Needs-attention list.
  - `/reports` capacity per class.
  - Events and show tools.
  - The permission model with safeguarding and support-access logs.
  - The families import with validation.
  - Full exports.
- **Frustrations:**
  - Class creation is broken (all four personas).
  - Payments and email are not connected.
  - Reporting is shallow: no retention trend, no location dimension, no revenue by class.
  - No audit screen.
- **Common themes:** the foundations (RLS, ledger, events) are stronger than the surface workflows; it is built for a single site; there is a lot of honest "not connected yet" messaging.
- **Missing functionality:**
  - Card and Direct Debit payments.
  - Email invitations.
  - Retention report.
  - Location filter and scoped roles.
  - Audit viewer.
  - Timetable and balance import.
  - Volunteer rota.
- **Adoption barriers:** D1; no payment collection (R-006); manual invitations (R-003); no multi-site reporting; no mandate migration.
- **Highest-priority improvements:** fix D1 (P0); multi-location reporting; migration toolkit; retention report; audit viewer.
- **Disagreements within the group:**
  - Persona 19 wants less (one guided setup, hide Pulse). Persona 21 wants more depth (scoped roles, P&L).
  - Persona 20 values the rich event panel. Persona 19 would find it overwhelming.
  - Persona 22 sees branding as noise during migration. Persona 19 likes that the app looks like her school.
- **Group scores (simulated):** satisfaction **4/10**; adoption likelihood **3.5/10**; continued-use likelihood **6/10**.
- **Improvements that could hurt other groups:**
  - Location-scoped roles and location filters add selectors that single-site owners and admins don't need. Hide them when there is only one location.
  - Logging medical-record reads adds friction for admins and teachers if it shows as a warning wall. Keep it silent.
  - Bulk email invitations could spam parents who are mid-migration if they are sent before the school is ready. Needs scheduling.

**Commercial value (simulated judgement, no prices invented):**
- The seeded plan table shows Trial, Starter, Studio and Academy tiers with demo prices. Those are seed data, not market evidence.
- **Would these owners pay?** Persona 20 most likely; persona 19 once payments and setup work; persona 21 only once multi-site features exist; persona 22 only with a migration path.
- **Essential before adopting:** working class creation, payment collection, email invitations, and for switchers a timetable and balance import.
- **What blocks renewal:** no retention or revenue insight that grows with history; the location cap per plan without self-serve upgrade; no audit trail for inspections.

---

## 8. Candidate recommendations

### R1. Fix class creation — P0
- **Screen/workflow:** `/classes` New class (`ClassForm`), `CREATE_CLASS` in `src/lib/repos/classes.ts`.
- **Problem and evidence:** D1. Every new-class save fails, which blocks scenario 31 and the new-location class in scenario 35 (shots 07 and 13).
- **Proposed improvement:**
  - Remove the duplicate `pricing` column so the column and value lists match.
  - Add an integration test that runs `CREATE_CLASS` through `runAs` as owner and admin. The `tests/` directory has DB tests.
  - Show the save error next to the footer buttons and scroll it into view (D2).
- **User groups:** owners, admins. **Supporting personas:** 19, 20, 21, 22.
- **Priority:** P0, because it blocks the core setup path for every new customer.
- **Complexity:** XS for the fix; S with the test and error placement.
- **Dependencies:** none. **Risks:** none significant.
- **User story:** As a new owner, I want to add my first class so that my timetable and sessions exist before families join.
- **Workflow:** New class, fill required fields, Create class. The class appears in `/classes` and `/schedule`, with sessions generated for the term.
- **Business rules:** pricing defaults to term; sessions are generated within the term, skipping breaks; plan limits are unchanged.
- **Edge cases:** Draft term; no rooms; no teacher; drop-in pricing.
- **Acceptance criteria:**
  1. Creating a class with only the required fields succeeds for owner and admin.
  2. Each pricing model (term, monthly, one-off, drop-in) saves the chosen value.
  3. A forced DB error is visible without scrolling.
  4. The test suite has a regression test for `CREATE_CLASS`.

### R2. Location dimension in reporting and lists — P1
- **Screen/workflow:** `/reports`, `/classes`, `/today`, `/billing`. Files: `src/lib/repos/reports.ts`, `src/app/reports/page.tsx`. Tables: `class.location_id`, `location`.
- **Problem:** no location filter in any report query (S35). Multi-site owners cannot compare sites.
- **Proposed improvement:**
  - A location selector, shown only when there is more than one location, saved in the query string as per ARCHITECTURE.md.
  - Every headline and class statistic filtered by `class.location_id`.
  - A "By location" table: students, fill %, attendance %, collected in 30 days, outstanding.
  - Location name shown on class rows.
- **User groups:** owners, admins. **Supporting personas:** 21, 20.
- **Priority:** P1. Blocks adoption by multi-site schools and the higher-tier plan.
- **Complexity:** M. Revenue per location needs invoice items mapped to classes; the item-to-class link is uncertain.
- **Dependencies:** none. **Risks:** slower queries in PGlite; use indexes.
- **User story:** As a multi-site owner, I want to see each studio's numbers so that I can manage site performance.
- **Workflow:** Reports, choose a location, all figures update; "All locations" adds the comparison table.
- **Business rules:**
  - A student counts at a location if enrolled in any class there.
  - Students at two sites count once in "All".
  - A class with no location goes under "Unassigned".
- **Edge cases:** a class that moves location mid-term; deleted locations; a single location (selector hidden).
- **Acceptance criteria:**
  1. With at least two locations, the selector appears and is hidden otherwise.
  2. Figures for a location equal the sum over its classes.
  3. The "All" totals de-duplicate students.
  4. The selected location persists in the URL.

### R3. Migration toolkit — P1
- **Screen/workflow:** `/people?import=1` (`import-wizard.tsx`), `0027_import.sql`, a new `import_classes` and opening-balance import.
- **Problem:** S36. Only families and children can be imported; unmapped columns are silently dropped (D5); no timetable, balances or history can be brought in.
- **Proposed improvement:**
  - (a) List unmapped source columns with "will not be imported" and require a tick to proceed.
  - (b) Class/timetable CSV import: name, style, day, time, minutes, location, room, capacity, price, term. Missing styles, locations and rooms are created after confirmation.
  - (c) Opening-balance import per family as a ledger adjustment with a reason ("Balance brought forward"), following PAYMENTS.md ledger rules.
  - (d) Import order guidance: classes, then families, then balances, then invitations.
  - (e) Store an external reference (old-system ID) per family for reconciliation.
- **User groups:** owners, admins, platform onboarding. **Supporting personas:** 22, 19.
- **Priority:** P1. The main barrier to switching.
- **Complexity:** L.
- **Dependencies:** R1. Mandate migration depends on R-006 (payments provider).
- **Risks:** importing incorrect balances. Mitigate with a dry run (the existing `p_commit=false` pattern) and an audit row.
- **User story:** As an owner switching systems, I want to bring my timetable, families and balances in one guided sequence so that I can go live without retyping or losing money owed.
- **Workflow:** Moving from another system: upload classes, check, import; upload families, check, import; upload balances, check, import; review summary, then invite.
- **Business rules:** all-or-nothing per file; re-runnable without duplicates; balances posted once per family per import key.
- **Edge cases:** class names that differ only in case; negative balances (credit); duplicate families across files; over-capacity classes.
- **Acceptance criteria:**
  1. Unmapped columns are listed before import.
  2. A 30-class CSV creates 30 classes with sessions.
  3. A balance import posts ledger lines visible on the family's account and is audited.
  4. Re-running a file creates no duplicates.

### R4. Retention report — P1
- **Screen/workflow:** `/reports`, a new section "Retention". Tables: `enrolment` (`started_on`, `ended_on`, status), `term`.
- **Problem:** S33. Only leavers in the last 30 days, and Pulse withholds retention.
- **Proposed improvement:**
  - Term-on-term retention: students active at the end of the previous term who are active now, as a percentage.
  - Retention by class, style and teacher.
  - A leavers list with reason. This needs a reason field captured on unenrol.
  - The "missed three in a row" at-risk list trended over time.
- **Supporting personas:** 20, 21, 19.
- **Priority:** P1. Owners renew on insight; this grows more valuable with history.
- **Complexity:** M.
- **Dependencies:** a leaving-reason field (a small schema change).
- **Risks:** misleading figures for the first term. Show "first term, no comparison yet".
- **User story:** As a growing owner, I want term-on-term retention by class so that I can see where students drop out.
- **Workflow:** Reports, Retention, choose a term, see the figure and the per-class table, drill into the leavers list.
- **Business rules:** transfers between classes are not leavers; a student who pauses and returns within N weeks is retained.
- **Edge cases:** students graduating out of the age range; mid-term joiners.
- **Acceptance criteria:**
  1. With two terms of data, retention % equals hand-computed seed values.
  2. Transfers are excluded.
  3. A leaving reason can be recorded and appears in the list.

### R5. Audit and access log viewer — P1
- **Screen/workflow:** `/account`, new "Activity" section. `audit_log` is already readable by owners (`0007_rls_operations.sql:145`); add medical-read logging through a security-definer accessor, like `app.safeguarding_log` in `0030`.
- **Problem:** S37. The data exists but there is no UI; medical reads are not logged.
- **Proposed improvement:**
  - A filterable list (who, what, when, entity) with CSV export.
  - Owner only.
  - Log opening a child's medical record by admins.
  - A per-person "what this role can see" matrix on `/account`.
- **Supporting personas:** 21, 22.
- **Priority:** P1. Safeguarding and GDPR accountability matter for a product holding children's data.
- **Complexity:** S for the viewer; M for read logging.
- **Dependencies:** none. **Risks:** log volume; personal data in summaries. Keep ids, as SECURITY.md does.
- **User story:** As an owner, I want to see who changed or viewed sensitive records so that I can answer an inspector or a parent.
- **Workflow:** Account, Activity, filter by person, record type or date, export.
- **Business rules:** append-only; visible to owners only; health-record views logged; support views flagged.
- **Edge cases:** deleted users (show "former staff"); support sessions.
- **Acceptance criteria:**
  1. An owner sees audit rows for enrolment, payment and medical changes.
  2. An admin cannot open the Activity section.
  3. An admin opening a medical record creates a log row.
  4. The CSV export matches the on-screen filter.

### R6. Under-filled classes view — P2
- **Where:** `/reports` Classes.
- **Problem:** S32, no threshold.
- **Proposed improvement:** a toggle to sort by fill ascending and a "Below X%" filter (default 60%). Show the revenue gap, (capacity − enrolled) × price per term, and show drop-in classes by average bookings per session.
- **Personas:** 20, 21.
- **Priority:** P2. **Complexity:** S (`reports.ts` CLASS_STATS plus UI).
- **Acceptance criteria:** the filter shows only classes under the threshold; the revenue gap is computed from `price_minor`.

### R7. Plan limits as notices, with an upgrade request — P2
- **Where:** `/studio#places`, `/account` Plan; trigger messages in `0019_platform.sql`.
- **Problem:** D4.
- **Proposed improvement:** detect limit errors and render an info notice with "Ask Swayvo to upgrade", which creates a request visible on `/platform` for that school. Show "2 of 3 locations" on the Add button.
- **Personas:** 21, 20.
- **Priority:** P2. **Complexity:** S–M.
- **Acceptance criteria:** the limit message is not headed "Something went wrong"; the request appears in the platform console.

### R8. Guided first timetable and accurate onboarding — P2
- **Where:** `/onboarding`, `src/app/onboarding/page.tsx`.
- **Problem:** S31 friction and D3.
- **Proposed improvement:**
  - Show copy that depends on whether the school has seed data.
  - An inline "first timetable" step: one location, one room, term dates and a grid to type classes, which calls R1.
  - Return to `/onboarding` after each step's Save.
  - Explain the term Draft status.
- **Personas:** 19, 22.
- **Priority:** P2. **Complexity:** M.
- **Acceptance criteria:** a new school reaches its first class in a single page; there is no sample-data copy on an empty school.

### R9. Event helpers rota and panel tabs — P2
- **Where:** `/events` panel (`events/page.tsx`, `show-tools.tsx`; `event_chaperone` table).
- **Problem:** S38. Chaperones only; the panel is very long.
- **Proposed improvement:**
  - Generalise chaperones into helpers with roles: chaperone, front of house, backstage, costume.
  - Parents volunteer from their Events page.
  - Shift times, and a DBS-checked flag for chaperone roles.
  - Split the panel into tabs.
  - Invalidate the rehearsal and ticket queries on write.
- **Personas:** 20.
- **Priority:** P2. **Complexity:** M.
- **Acceptance criteria:** a parent can volunteer for a shift; the office sees filled and unfilled roles; added rehearsals appear without reopening the panel.

### R10. Multi-school consolidated view — P3
- **Where:** a new owner overview across `app.my_schools()`.
- **Problem:** separate schools can only be seen one at a time (code, `0032`).
- **Proposed improvement:** a read-only summary page of headline KPIs per school the user owns. Keep the existing switch for drill-down.
- **Personas:** 21.
- **Priority:** P3, because most multi-site schools would use locations within one school (R2 first).
- **Complexity:** M. Each school's query must be run with a separate scope; uncertain.

### Small fixes (P3)
D6 safeguarding skeleton; D7 the "no registers%" label; D8 explain the student counts and merge the two Exams concepts; D9 template filename; D10 phone subtitle truncation. Each is XS.

---

## 9. Feature rationalisation (owner area)

| Decision | Feature | Reason |
|---|---|---|
| Retain | Today Needs-attention | Most-cited value; works on phone |
| Retain | Permission model, safeguarding log, support access | Trust foundation, differentiating |
| Retain | Families import validation | Careful, all-or-nothing, re-runnable |
| Retain | Events: invites, running order, costumes, rehearsals, fees | Covers a real annual pain |
| Refine | Class creation (fix D1, D2) | Broken core path |
| Refine | Reports | Add location filter, retention, under-filled filter |
| Refine | Plan-limit messaging | Not an error; add upgrade request |
| Refine | Import | Warn on unmapped columns |
| Redesign | Onboarding | From a link checklist to a guided first-timetable flow; correct empty-school copy |
| Redesign | Event detail panel | Tabs, not one long scroll |
| Add | Retention report | Essential for growth and renewal |
| Add | Audit and access viewer | Essential for oversight; data already exists |
| Add | Migration toolkit (timetable, balances, external IDs) | Essential for switchers |
| Add | Location-scoped roles | For multi-site owners |
| Add | Helpers/volunteer rota | For shows |
| Consolidate | "Exams" section and Exam-kind events | Two concepts on one page |
| Consolidate | Student counts on Account and Reports | Show one definition, or label both |
| Defer | Studio Pulse composite | Withheld for 180 days anyway; move off the main report until it has a score |
| Defer | Multi-school consolidated view | After the location dimension (R2) |
| Remove | Nothing outright | No owner feature judged low value enough to remove |
