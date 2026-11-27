# Panel report: safeguarding, privacy, trust and accessibility

**Group slug:** `safeguarding` · **Persona:** 24, a dance school safeguarding and welfare lead (everyday operational safeguarding) · **Cross-cutting role:** reviewer for safeguarding, privacy, trust and accessibility across the panel.

> This is a **simulated** professional review, not real user research. The persona, scores and opinions are judgement based on what I saw in the demo build. Nothing here is a legal opinion, a GDPR/DPA compliance assessment, a penetration test or a WCAG conformance claim.

---

## 1. Method and limitations

**What I drove (Playwright + Chromium, static preview at `http://127.0.0.1:8080/General/studio-next/`):**
- Five scripted runs, each in a fresh browser context with its own in-browser database. Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/safeguarding/` (`run1.cjs`, `run1b.cjs` to `run5.cjs`, raw output in `run*.json`).
- Identities used: Marcus Bell (teacher), Priya Raman (teacher; used to collect her register and student ids), Freya Lindqvist (owner), Nadia Okafor (admin, later named Designated Safeguarding Lead), Hannah Wright (guardian of Amir 15, Nia 9 and Clara 5), Amir Wright (student, 15), Jordan Ellis (platform admin), plus a **spoofed** session: Marcus's user id with `role: "owner"`.
- Viewports: desktop 1440×900 for the scenarios. 320×640 (phone, touch) and 640×450 (the CSS width that 200% zoom of a 1280px window gives) for reflow checks. `reducedMotion: 'reduce'` compared with `'no-preference'`.

**What I read:** `docs/SECURITY.md`, `ACCESSIBILITY.md`, `DECISIONS.md`. Migrations `0006_rls.sql`, `0010_hubs.sql` (student login guard), `0011_student_reads.sql`, `0019_platform.sql` (invitations), `0020_teacher_medical.sql`, `0023_operations.sql` (cover), `0026_self_service.sql`, `0030_safeguarding.sql`, `0032_school_switch.sql` (`teacher_class_ids`), `0033_dropin_credit.sql` (`teacher_student_ids`), `0040_public_safety_retention.sql` (retention). Screens `app/safeguarding`, `components/app/safeguarding.tsx`, `app/teach/students`, `app/family/children`, `components/app/family-details.tsx`, `app/family/enquiries`, `app/join`, `app/account`, `components/app/record-sheet.tsx`. Tests: `tests/safeguarding.test.ts`, `teacher-access.test.ts`, `permissions.test.ts`, `medical-requests.test.ts` (test names and assertions read only).

**Limitations:**
- **Postgres on port 5433 was not running**, so I did not run any vitest suite. I did not start or change anything. Test coverage is described from reading the tests.
- **Real sign-in is not connected (R-001).** The demo trusts whatever identity is in `localStorage`. I could only test what an identity can *see*, not whether someone can *become* that identity.
- Email, SMS and push are not connected (R-003), so I could not verify any notification delivery outside the app. I only saw the in-app bell count rise ("Notifications, 4 unread").
- The DB runs locally in the browser. Hosted behaviour (server-side RLS, scheduler for staff-check reminders and retention, backups, access logging at the edge) is **unverified**.
- **Session ids are generated per browser context.** A register URL from one context does not exist in another, so I ran every cross-boundary register test inside the same context where the id was collected.
- I used no screen reader (VoiceOver, TalkBack or NVDA). Keyboard and reflow checks were scripted, not done by a person with a disability. I did not run `npm run a11y`, which needs a dev server. It exists and runs axe-core over the main screens; ACCESSIBILITY.md says the last run had no serious or critical issues.
- Labels used below: **Confirmed (browser)** means I drove it. **Confirmed (code)** means I verified it by reading code, not in the UI. **Potential concern** is my professional judgement. **Needs specialist assessment** is for a lawyer, a DPO or a security tester.

---

## 2. Scenario results

### S1: A teacher raises a welfare concern after class and the lead reviews it
- **Persona:** Marcus Bell (teacher), then Freya Lindqvist (owner), then Nadia Okafor (admin named as DSL). Judged from the welfare lead's point of view.
- **Objective:** Record a disclosure plus a visible injury about Clara Wright (5) quickly. The lead reads it, records an action and changes the status, and access is logged.
- **Starting point:** Marcus at `/teach/students?id=<Clara>`.
- **Outcome:** **Completed with minor friction** for the teacher-to-lead path. The office-raised path is **Unable to complete** (see Missing).
- **Steps (teacher: 6 interactions):**
  1. Open the child from *My students* (1).
  2. Click **Raise a safeguarding concern** (1).
  3. Leave the category as *Wellbeing*. Type facts with time and date (1).
  4. Tick **The child may be at risk today** (1).
  5. Click **Send to the safeguarding lead** (1). The confirmation showed in about 0.6 s: "Concern recorded… You will not see it in the app again — that is deliberate. If a child is in immediate danger, call 999." (`safeguarding-03-raise-concern-sheet.jpg`, `safeguarding-04-concern-recorded.jpg`)
  6. **Done** (1).
- **Steps (lead: 6 interactions):**
  1. Freya opens Settings → **Safeguarding** (1). The list shows **AT RISK**, Clara Wright, **Open**, the summary, "raised by Marcus Bell · 0 actions" (`safeguarding-08-owner-safeguarding-log.jpg`).
  2. Open the concern (1).
  3. Type the action (1).
  4. Set the status to *Monitoring* (1).
  5. **Record action** (1). The action shows as "27 Nov 15:12 · Freya Lindqvist · now monitoring" (`safeguarding-09-owner-concern-action.jpg`).
  6. Name Nadia as DSL in the dropdown (1). Nadia then sees the log. The owner's **Who has looked** list shows "Nadia Okafor viewed the log", "Freya Lindqvist opened a concern", and so on (`safeguarding-11-owner-access-log.jpg`).
- **Observed difficulties:**
  - The access log shows **"Freya Lindqvist opened a concern" twice** for one opening. Recording an action refetches the action list, and that refetch writes another "opened" row. This inflates the audit trail and weakens it as evidence.
  - Only the owner sees **Who has looked**. The named DSL cannot see who else has read the log.
  - Marcus's `/safeguarding` page says only "Only the safeguarding lead and the owner read concerns". The teacher gets no reference number, no receipt of what they wrote, and no "lead has read this" acknowledgement.
- **Unnecessary steps:** none for the teacher. Six steps is good.
- **Missing functionality:**
  - **Office staff (admin) and the DSL cannot raise a concern.** The office student sheet has no raise option (`safeguarding-10-office-student-sheet.jpg`; the "safeguarding concern" text count there was 0), and `/safeguarding` has no "Record a concern" button. In practice, front-desk staff often take disclosures from parents or children.
  - No way to record a concern **about an adult or member of staff** (an allegation/LADO route). `raise_concern` needs a `student_id`.
  - The original summary cannot be amended or added to by the raiser.
  - No body-map or attachment, no chronology export or print for a referral, and no "referred to" fields (agency, reference, date).
  - No link between concerns and attendance patterns.
- **Errors/defects:** D-03 (duplicate access-log rows), D-01 (office cannot raise).
- **Clarity of outcome:** Good for the teacher. The 999 prompt and "in their words, do not investigate" are exactly right. Good for the lead: the **AT RISK** word, the status word and the action trail are clear.
- **Simulated satisfaction:** 4/5 for the teacher path, 3/5 for the lead tools.
- **Suggested improvements:** see R-01 (office/DSL raise and staff allegations), R-05 (access log de-duplicated, visible to the DSL, receipt to the raiser).

### S2: A parent withdraws photo consent
- **Persona:** Hannah Wright (guardian), then Nadia (admin).
- **Objective:** Withdraw photography consent for one child, and have the school and teachers act on it.
- **Starting point:** `/family/children`.
- **Outcome:** **Unable to complete** as a self-service or recorded action. A free-text workaround was **Partially completed**.
- **Steps (7 interactions):**
  1. `/family/children` shows **Photos: Permitted / Not permitted** as read-only text. There are no buttons labelled photo or consent (count 0) (`safeguarding-13-guardian-children.jpg`).
  2. Open **Requests** (1). Click **Ask a question** (1).
  3. The request types are only *A question / A private lesson / A medical or allergy update / A competition or event / Something else*. There is **no consent option**. Choose *Something else* (1), the child (1), and type a subject and message (2).
  4. Send (1). The request appears as "Other · Waiting on the studio" (`safeguarding-15-guardian-photo-withdrawal-request.jpg`).
  5. As Nadia, `/requests` lists it with only a **Reply** action. Medical updates get "Acknowledge & add to record"; consent requests get nothing like it.
  6. On the office side, **Photo consent: Given** is read-only on the student sheet. I could find no control anywhere in the UI to change it.
- **Observed difficulties:** The consent change cannot be recorded by anyone in the UI. **Confirmed (code):** `consent_record` is written only by the import wizard (`0027_import.sql`) and the seed. No screen in `app/` or `components/` writes it. A teacher's safety brief therefore keeps saying "Photos allowed" after a parent has asked them to stop.
- **Unnecessary steps:** the free-text detour.
- **Missing functionality:**
  - Per-purpose consent capture and withdrawal for parents and the office. The model already has the purposes: photography, social media, medical treatment, data processing, marketing, collection by another adult.
  - Consent at enrolment and on the public trial form.
  - A history of who changed consent and when. An audit trigger exists on `consent_record`, but there is no UI.
  - Downstream effects: teacher brief, show programme and library/demo material.
- **Errors/defects:** D-02 (no way to record consent), D-07 (latent query fault if a second consent row is ever added).
- **Clarity of outcome:** Poor. The parent cannot tell whether the change was made.
- **Simulated satisfaction:** 1/5.
- **Suggested improvements:** R-02.

### S3: A guardian asks to see, correct or delete their child's data
- **Persona:** Hannah Wright.
- **Objective:** See everything held, correct details, and ask for export or deletion.
- **Starting point:** `/family`.
- **Outcome:** **Partially completed.** Viewing and correction are partial. Export and erasure are **Unable to complete**.
- **Steps (about 9 interactions):**
  1. `/family/children` shows classes, attendance, photo status, the allergy line, exams, emergency contacts, practice and *Your details*.
  2. Emergency contacts can be added and edited directly. Medical changes go through a "medical update" request, which keeps an audit trail.
  3. *Your details*: Hannah could edit **Inês Wright**, the second guardian, who has no login. I changed Inês's mobile to "07000 000001" and it saved (`safeguarding-14-guardian-edits-other-parent.jpg`). Inês was not asked and has no login to notice.
  4. I searched `/family`, `/family/messages` and the more menu for *export / download / delete / erase / privacy*. Nothing was found. `/account` returns "Not part of your role".
  5. The child's own name and date of birth can only be corrected via *Something else*.
- **Observed difficulties:**
  - Medical text shown to the parent says **"Teachers see allergies and the emergency plan only, never the full record."** That is **inaccurate**. Marcus's view of a child showed conditions and medication ("Mild eczema; Emollient cream"), every emergency contact with a Call link, and photo status. SECURITY.md (migration 0020) confirms the widening. The office *People* help text repeats the outdated claim. (D-04)
  - Whole-school export exists for the owner only (`/account` → *Export everything*). **Confirmed (code):** it omits `safeguarding_concern`, `safeguarding_action`, `staff_check` and `audit_log` (`lib/repos/account.ts`, `EXPORT_TABLES`).
- **Missing functionality:** a per-family data download (subject access), a "request erasure / close account" request type, an office workflow for subject-access and erasure deadlines, and a privacy notice link inside the family app.
- **Errors/defects:** D-04, D-05.
- **Clarity of outcome:** A parent would not know how to ask.
- **Simulated satisfaction:** 2/5.
- **Suggested improvements:** R-03, R-04.

### S4 (boundary): Teacher Marcus tries another teacher's register, student and class by URL
- **Outcome:** **Successfully completed.** The boundary held.
- **Steps:** In one context I collected Priya's register URLs and student ids, then switched to Marcus.
  1. `/teach/register/?session=59d30025…` (Priya's) shows "Register · **Nobody on this register — No one is enrolled in this class yet.**" (`safeguarding-05-marcus-other-register.jpg`).
  2. `/teach/feedback/?session=…` shows "Nobody to give feedback to".
  3. `/teach/students?id=…000027` (in Priya's class, not Marcus's) shows "**Not one of your students** — You see children in classes you teach." (`safeguarding-06-marcus-non-taught-student.jpg`).
  4. `/people?tab=students` shows "Not part of your role".
- **Observed difficulty:** the register message is **misleading** (D-06). It claims the class has no one enrolled when the truth is "not your class". During cover arrangements, a teacher could believe a class is empty.
- **Satisfaction:** 4/5.

### S5 (boundary): Spoofed role, Marcus's user id with `role: "owner"`
- **Outcome:** **Successfully completed** (no data leaked). The UI shows owner chrome, but `/people?tab=students` shows "**No students yet**" and `/safeguarding` renders nothing (`safeguarding-07-marcus-spoofed-owner-role.jpg`). This shows the database, not the UI, decides what is visible. **Caveat:** with no sign-in (R-001), anyone can simply pick Freya's id. That is the real gap until Supabase Auth is connected.

### S6 (boundary): Guardian Hannah tries other areas and another family's child
- **Outcome:** **Successfully completed.**
  - `/teach/students?id=<Joseph Adeyemi's child>`, `/teach/register`, `/people`, `/safeguarding` all show "Not part of your role".
  - `/class?id=…009` (Street Primary, which none of her children attend) shows the class name, time, room, teacher and "Dancers 16 of 20", but **no names**. This is low sensitivity (it is timetable information), but note it.
  - Because no family screen takes a child id in the URL, I could not attempt a direct "other child by id" read in the UI. `tests/permissions.test.ts` asserts "cannot read another family's record even by asking for it directly" (code only).

### S7 (boundary): Student Amir (15) tries to view other students
- **Outcome:** **Successfully completed.**
  - `/learn`, `/learn/feedback` and `/learn/library` show only his own feedback and class material.
  - `/teach/students`, `/family/children`, `/people` and `/safeguarding` show "Not part of your role".
  - `/class?id=<Pre-School Ballet>` (not his) shows timetable facts and a count only.
  - I saw no messaging surface for students. Teacher material is one-way, and students log practice but cannot upload video. That is consistent with DECISIONS.md.

### S8 (boundary): Platform admin Jordan
- **Outcome:** **Successfully completed.** `/platform` lists schools, plans and student **counts** (e.g. "Northstar… 64 / 300"). `/people` and `/safeguarding` show "Not part of your role". The owner's `/account` shows a seeded live grant: "**Support can look until 29 Nov 15:25 — Help setting up this term's invoices — End access now**". The read-only support view itself was not tested.

### S9: Accessibility spot checks
- **Outcome:** **Completed with minor friction.**
- **Keyboard-only register** (Marcus, desktop): Tab order is Back → Notifications → for each child "Sofia Ackah. Show details" → "Here — Sofia Ackah" → "Absent — Sofia Ackah". Every stop had a visible 2px outline. Space on *Absent* toggled `aria-pressed` from false to true, and focus stayed on the button (`safeguarding-19-register-keyboard-focus.jpg`). **Good.**
- **Sheet** (Hannah editing a guardian): focus moves into the first field on open, which is good. **Tab leaves the sheet** after *Save* and reaches page links behind it ("Teacher feedback", "Shows and events"…) even though the sheet has `aria-modal="true"`. After **Escape** the sheet closes, but **focus goes to `<body>`**, not back to the Edit button (D-08). ACCESSIBILITY.md's own manual check ("every dialog closes with Escape and returns focus") fails here.
- **Reflow:** at 320px and at 640px (200% zoom) I found **no horizontal overflow** on `/people`, `/safeguarding`, the register, `/teach/students`, `/family/children`, `/family/enquiries`, `/schedule` or `/today` (scrollWidth equalled clientWidth on every one). See `safeguarding-20-w320-register.jpg`.
- **Reduced motion:** sheet transitions were 0.1–0.15 s without the preference and collapsed to 0.00001 s with `reduce`. **Good.**
- **Colour-only status:**
  - The safeguarding log uses words (AT RISK, Open, Monitoring), which is good.
  - The office People table shows a visible **"Low"** word next to low attendance, which is good.
  - On `/teach/students`, low attendance is an **amber number only**. The words "attendance, low" exist only as screen-reader text. **Potential concern:** sighted colour-blind teachers lose the signal.
  - Form inputs show focus with a border colour change plus a 12%-opacity ring (`focus:ring-accent-line/12`). **Potential concern** under WCAG 2.2 Focus Appearance and non-text contrast; it needs measuring.
- `npm run a11y` exists (axe-core across main screens). I did not run or change it.

---

## 3. Feature status table

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Teacher raises safeguarding concern | `/teach/students` → sheet; `app.raise_concern` | Fully implemented & tested | S1; `tests/safeguarding.test.ts` |
| Office/DSL raises a concern | People sheet, `/safeguarding` | **Missing** | S1; there is no Raise button outside `app/teach/students` |
| Concern about an adult or staff member | `safeguarding_concern.student_id` | **Missing** | `0030_safeguarding.sql` |
| Safeguarding log restricted to owner + DSL, read via logging functions | `/safeguarding`; `app.safeguarding_log` | Fully implemented & tested | S1; Marcus sees an empty state; spoof shows nothing |
| Actions and status trail on a concern | Concern sheet | Fully implemented & tested | S1 |
| Access log ("Who has looked") | `/safeguarding` (owner only) | **Partial / Defective** | Duplicate rows (D-03); hidden from DSL; capped at 200 rows |
| Urgent concern notification to lead and owner, no child named | `notify_user` in `raise_concern` | Implemented, not testable beyond in-app bell | Bell rose to 4 unread; email/SMS not connected |
| Name the DSL | `/safeguarding` lead card | Fully implemented & tested | S1 |
| Staff checks (DBS, training, first aid) with 30-day reminder | Staff sheet; `staff_check` | Partial | Owner only. Admin/DSL cannot see them (count 0). No "unchecked staff" warning: Marcus is active with "No checks recorded" (`safeguarding-12-staff-checks.jpg`) |
| Teacher sees only own students, cover by session | `teacher_student_ids`, `teacher_class_ids` | Fully implemented & tested | S4; `teacher-access.test.ts`. Cover grants the **whole class** from 2 days before to 14 days after the covered session (code) |
| Teacher safety brief (medical, contacts, photo) | `/teach/students`, register | Fully implemented & tested | S1 detail; `0020` column test |
| Parent-facing explanation of what teachers see | `/family/children`, People help | **Defective** (inaccurate) | D-04 |
| Medical record changes via parent request | `/family/enquiries` → `/requests` | Fully implemented & tested | Seeded "New inhaler" request with Acknowledge & add to record |
| Photo/other consent capture and withdrawal | none in UI | **Missing** | S2 |
| Consent on public trial form (photo, medical, emergency) | `/join` | **Missing** | Only parent mobile ("Rung in an emergency") plus privacy acknowledgement (`app/join/page.tsx`) |
| Student login needs guardian approval and age threshold | DB trigger `check_student_login` | Partial | DB enforces it. **No guardian UI to approve or switch off a login.** Office invite text says "stays off until a parent approves it" but there is no approval path (D-09). The age threshold (default 13, allowed 0–18) has no settings UI |
| Second guardian / shared care | `guardian` rows, *Your details* | Partial | The second guardian exists without a login. Any guardian can edit the other's contact details (S3). No collection permissions or court-order flags |
| No private teacher–child or teacher–parent channel | DECISIONS; inbox RLS (0017) | Implemented (code/tests); not fully driven | Students have no messaging surface (S7) |
| Student media | Library, skill demo links | Implemented | Students never upload; teacher links only |
| Attendance as a welfare signal | Teacher list amber %, office "Low" | Partial | No unexplained-absence alert, no pattern prompt to the DSL; automations cover trials only (`0018`) |
| Feedback privacy | `feedback_note.private_note`, share flags | Implemented, not tested here | Code only |
| Role permissions explained to users | Help texts | Partial | No single "who can see what" page. Existing texts are partly wrong (D-04) |
| Account security (sign-in) | Demo picker | **Missing (R-001)** | SECURITY.md "There is no password check" |
| Data correction by family | Contacts direct; medical by request | Partial | Child name and DOB only via free text |
| Subject access export per family | — | **Missing** | S3 |
| School export | `/account` | Partial | Excludes safeguarding, staff checks and audit (D-05) |
| Retention (medical, anonymise, invoices, enquiries, closed concerns) | `/account` *Keeping data* | Partial / Needs specialist review | Anonymisation ignores open concerns (D-10) |
| Platform/support access | `/platform`, owner grant | Implemented (code/tests); console verified | S8 |
| Keyboard register | `/teach/register` | Fully implemented & tested | S9 |
| Dialog focus management | `components/app/record-sheet.tsx` | **Defective** | D-08 |
| Reflow at 320px / 200% | 8 screens | Fully implemented & tested (spot check) | S9 |
| Reduced motion | global | Fully implemented & tested (spot check) | S9 |

---

## 4. Defects found

**D-01: Office staff and the DSL cannot raise a safeguarding concern. Severity: High.**
- **Reproduction:** As Nadia (admin), open `/people?tab=students`, then any child. As Freya, open `/safeguarding`.
- **Expected:** a "Raise a concern" option, because parents and children often disclose at the desk.
- **Actual:** no option anywhere. `RaiseConcernSheet` is used only in `app/teach/students/page.tsx:146` (`safeguarding-10-office-student-sheet.jpg`). The database function `app.raise_concern` already lets any staff member raise one.

**D-02: Photography (and any) consent cannot be recorded or withdrawn in the UI. Severity: High.**
- **Reproduction:** As Hannah, open `/family/children` (Photos shows as read-only text), then *Requests* (no consent type). As Nadia, open the student sheet ("Photo consent: Given" is read-only).
- **Expected:** a parent can withdraw, or the office records the withdrawal, and teachers' briefs update.
- **Actual:** only free text. Confirmed (code): no screen writes `consent_record`; only `0027_import.sql` and the seed do. Children added through the UI stay "Not recorded" for ever, and the teacher brief shows nothing for them because `medical-brief.tsx:103` hides a null value. `safeguarding-13`, `safeguarding-15`.

**D-03: The safeguarding access log records duplicate "opened a concern" entries. Severity: Medium.**
- **Reproduction:** As owner, open a concern, record an action, then check *Who has looked*.
- **Expected:** one "opened" and one "recorded an action".
- **Actual:** two "opened a concern" rows at 15:12 for a single opening. Invalidating `sg-actions` after the action re-runs `app.safeguarding_actions`, which logs again. Files: `app/safeguarding/page.tsx` (ConcernSheet `onSuccess`) and `0030_safeguarding.sql` `safeguarding_actions`. `safeguarding-11-owner-access-log.jpg`.

**D-04: Parent- and office-facing text misstates what teachers see of medical data. Severity: Medium-High** (transparency; possible privacy-notice inaccuracy, which needs a DPO's view).
- **Reproduction:** As Hannah, open `/family/children` and look at Nia's medical row: "Teachers see allergies and the emergency plan only, never the full record." The People page help says "Medical details are shown to teachers only as allergies and the emergency plan."
- **Actual:** the teacher sees conditions, medication, the plan, all emergency contacts and photo status (S1 detail; migration 0020; SECURITY.md).
- **Files:** `app/family/children/page.tsx` (Medical row), `app/people/page.tsx:43`.

**D-05: The school "Export everything" omits safeguarding records, staff checks and the audit trail. Severity: Medium** (confirmed by code).
- **Expected:** a leaving school can take its safeguarding chronology and DBS records, which DECISIONS.md says it may do.
- **Actual:** `lib/repos/account.ts` `EXPORT_TABLES` has none of `safeguarding_concern`, `safeguarding_action`, `staff_check`, `audit_log`. A safeguarding export should probably be a separate, DSL-only, logged export.

**D-06: A cross-boundary register shows a misleading empty state. Severity: Low-Medium.**
- **Reproduction:** As Marcus, open Priya's `/teach/register/?session=…`.
- **Expected:** "This isn't one of your classes".
- **Actual:** "Nobody on this register — No one is enrolled in this class yet." `safeguarding-05`.

**D-07: Latent fault: the photo-consent subquery has no `limit 1`. Severity: Low now, Medium once D-02 is fixed** (confirmed by code).
- `lib/repos/people.ts:46` and `lib/repos/family.ts:64` use `(select cr.granted from consent_record cr where … kind='photography' and deleted_at is null)`.
- The moment a second photography row exists (e.g. a withdrawal recorded as a new row, which the timestamped model implies), Postgres raises "more than one row returned by a subquery" and the People and family pages break. The safety brief (`0020`) correctly uses `order by granted_at desc limit 1`.

**D-08: Sheets do not trap focus and do not return focus on close. Severity: Medium** (WCAG 2.4.3 focus order; aria-modal semantics).
- **Reproduction:** As Hannah, focus *Edit Inês Wright* and press Enter, then Tab five times.
- **Actual:** focus reaches background links. Press Escape: focus lands on `<body>`.
- **Expected:** focus is contained while the sheet is open and returns to the trigger.
- **File:** `components/app/record-sheet.tsx:36-56` (the comment says it focuses inside and closes on Escape; neither trapping nor return is implemented).

**D-09: The student login approval path is a dead end. Severity: High** (age-appropriate access control; confirmed by code).
- **Reproduction:** `/account` invite with role Student says "Their login stays off until a parent approves it." Guardians have no screen to approve and no permission to update `student` (`student_admin_write` is admin only).
- **Actual:** the only ways to enable a student login are a guardian-sent invitation (no guardian invite UI exists) or a direct DB update. Equally, a parent **cannot switch off** their child's login.
- The age threshold `student_login_min_age` (0–18, default 13) has no settings UI. **Specialist:** check against the school's policy and age-appropriate design expectations.

**D-10: Retention anonymises a child even when a safeguarding concern about them is still held, or still open. Severity: High (needs specialist review; confirmed by code).**
- `0040_public_safety_retention.sql`, `apply_retention`: the "anonymise" step (default 36 months after leaving, configurable down to 6) renames the student to "Former student" and truncates the DOB. It never checks `safeguarding_concern`.
- Closed concerns are kept by default ("often until the child is 25"), but they would then show as "Former student". The chronology becomes unattributable while the concern record itself survives. Open or monitoring concerns are not exempt either.
- No legal hold exists.

**D-11: A guardian can change the other guardian's contact details. Severity: Medium (potential safeguarding risk in separated families).**
- **Reproduction:** As Hannah, open *Your details* → *Edit Inês Wright* → change the mobile → Save. It saved (`safeguarding-14`).
- Inês has no login and is not told by the app. The office is said to be told, which I could not verify.
- Policy `guardian_self_update` allows any guardian in the family to update any guardian row (`0006_rls.sql`).

---

## 5. Individual panel member report: persona 24, safeguarding and welfare lead

**User profile.** I'm the welfare officer and Designated Safeguarding Lead at a mid-sized dance school, with around 300 pupils aged 3 to 18 across two sites. Before dance I was a primary teaching assistant, so I know CPOMS-style logging from the school side. Here I do it on paper forms and a locked spreadsheet.

- **Typical activities:** taking concerns from teachers after evening classes, chasing DBS renewals, checking photo-consent lists before shows, dealing with separated parents who disagree about collection, and answering parents who want to know "what you hold on my daughter".
- **Tech confidence:** moderate. I mostly use a laptop for records, and my phone when I'm at the studio door at 6pm.
- **Primary needs:** a single, private, auditable concern log; consent I can trust at a glance; knowing who can see what; and staff checks that never lapse.
- **Existing frustrations:** concerns get written on scraps and handed over in corridors; the consent spreadsheet is always out of date by show week; and I can never prove who opened the safeguarding folder.

**Application experience.**
- **First impressions:** this was built by people who have read the guidance. The concern sheet opens with "If a child is in immediate danger, call 999 first… in their words… Do not investigate." That is the best wording I have seen in a general-purpose school system. The log is closed to everyone but me and the owner, and the database enforces that: I tried a teacher pretending to be the owner and got "No students yet".
- **Most valuable:**
  - The concern path from *My students*: six clicks and under a second.
  - The read-logging design.
  - **AT RISK** as a word, not a colour.
  - Teachers seeing only their own children. Marcus got "Not one of your students" for a child in Priya's class.
  - No private teacher–parent or teacher–child channel.
  - Notifications that never name the child or the health detail.
- **Least valuable:** the "Who has looked" list as it stands. Only the owner sees it, it double-counts, and it caps at 200 rows. If I am the DSL I need it, and the owner's own reading should be visible to someone other than the owner.
- **Exceeded expectations:**
  - The register works perfectly from the keyboard, with clear "Here — Sofia Ackah" labels.
  - The screens reflow down to 320px.
  - The trust model for Swayvo's own support staff: time-limited, owner-granted, no health records, logged.
- **Failed expectations:**
  - **I cannot record a concern myself.** If a mum tells Nadia at reception about a court order, or a child tells me at the door, there is nowhere to put it except by finding a teacher's screen. I also cannot log an allegation about a member of staff.
  - **Photo consent cannot be changed by anyone.** Hannah asked to stop photos and the request sat there with only a "Reply" button, while the teacher's card still said "Photos allowed". Show week would go wrong.
  - Parents are told teachers see "allergies and the emergency plan only". In fact teachers see conditions, medication and every emergency number. I'd be the one fielding that complaint.
  - The public trial form takes no allergy, medical or photo information, so a trial child arrives with a blank safety card.
- **Significant usability concerns:**
  - Marcus gets no receipt or reference, so he can't tell me "I raised it at 6:05". He also can't add the second thing the child says the following week.
  - Sheets let keyboard focus wander behind them and drop focus to the page top on close.
  - On *My students*, low attendance is amber colour only.
- **Missing functionality:**
  - Office/DSL concern entry, and an allegations-against-staff route.
  - Consent management with history.
  - Parent approval and switch-off of their teenager's login.
  - Collection permissions and court-order or "do not release to" flags.
  - An unexplained-absence prompt.
  - A DSL-only, logged chronology export for referrals.
  - Per-family data download and an erasure request type.
  - DBS and training visible to the DSL and admin, not only the owner, with a "no check on file" warning.
- **Opportunities to simplify:** put consent on the same "request → acknowledge & add to record" rail the medical updates already use. Parents then use one familiar flow and the office gets one button.

**Recommendations.**
- **Five highest priority:**
  1. Let office staff and the DSL raise concerns, including about adults.
  2. Consent capture and withdrawal (parent request plus office record), feeding the teacher brief.
  3. A guardian approval and switch-off screen for student logins.
  4. Fix the "what teachers see" text and add a plain "who can see what" page.
  5. A retention legal hold on any child with a safeguarding record.
- **One to remove or simplify:** don't let one guardian edit another guardian's contact details. Each adult edits their own, and the office edits the rest.
- **Greatest impact:** consent you can trust, recorded and withdrawn in-app and reflected on every teacher's card.

**Adoption verdict.**
- **Would I use it?** For the concern log, yes, alongside paper for office-taken concerns until D-01 is fixed.
- **Prefer it to what I have?** For confidentiality and audit, yes. For consent, no: my spreadsheet at least changes.
- **Would I recommend it?** Conditionally, after D-01, D-02 and D-09.
- **What would prevent adoption:** real sign-in being absent (R-001). I could not put real children's data behind a person-picker. Also inaccurate privacy wording, and no consent editing.
- **What would keep me using it:** the read-logged log, the minimal teacher safety brief, and staff-check reminders, if I could see them as DSL.

**Scores (/10):**
- Relevance 9
- Quality of existing functionality 7
- Completeness 4
- Ease of use 7
- Efficiency of everyday tasks 6
- Overall usefulness 6
- Likelihood of adoption 5
- Likelihood of continued use 6

**Overall: 6/10.** The foundations are better than most (database-enforced boundaries, read logging, careful wording), but three everyday safeguarding jobs are impossible today: consent changes, office-taken concerns and parent control of teen logins. One parent-facing statement about medical visibility is wrong.

---

## 6. Votes (machine-readable)

**Persona 24: Safeguarding and welfare lead**

| Type | Item | Rating |
|---|---|---|
| Most valuable | Safeguarding concern log | — |
| Most valuable | Logged access to safeguarding records | — |
| Most valuable | Teacher sees own students only | — |
| Most valuable | Teacher safety brief | — |
| Most valuable | No private teacher–family channel | — |
| Frustration | Consent cannot be changed | — |
| Frustration | Office cannot raise concerns | — |
| Frustration | Inaccurate "what teachers see" text | — |
| Frustration | Staff checks owner-only | — |
| Frustration | Dialog focus not trapped/returned | — |
| Missing/improve | Consent management | Essential |
| Missing/improve | Real sign-in | Essential |
| Missing/improve | Office/DSL concern entry and staff allegations | Essential |
| Missing/improve | Guardian approval of student login | Highly desirable |
| Missing/improve | Retention legal hold for safeguarding | Highly desirable |
| Remove/simplify | Guardian editing other guardian's details | — |
| Greatest impact | Consent management | — |

Further missing items, ranked lower: Second guardian access (Highly desirable), Subject access export (Highly desirable), Collection permissions (Highly desirable), Absence alerts (Useful), Trial medical/consent capture (Highly desirable), Who-can-see-what page (Useful).

---

## 7. Group consolidated view (single-persona group, plus cross-cutting notes)

- **Principal needs:**
  - Confidential, auditable concern recording by anyone on staff.
  - Consent that is current.
  - Clear and truthful explanations of who sees what.
  - Parental control over children's accounts.
  - Records that survive leaving and retention.
- **Most valuable:** database-enforced boundaries (verified in four boundary scenarios, S4–S8), the concern sheet's wording, read logging, the minimal teacher safety brief, and platform-staff restraint.
- **Frustrations:** consent, office-taken concerns, owner-only staff checks and access log, inaccurate medical text, focus management.
- **Common themes:** the data model is often ahead of the UI. Consent purposes, the student-login guard and audit triggers all exist with no screens to use them.
- **Missing:** consent UI, office/DSL concern entry, staff allegations, guardian login approval, collection permissions, subject-access export, erasure requests, absence alerts, trial health capture, real sign-in.
- **Adoption barriers:** R-001 sign-in (absolute for real data), consent, and accurate privacy text.
- **Highest priority improvements:** R-01, R-02, R-03, R-04, R-06 (see section 8).
- **Disagreements kept:** none within the group (one persona). Cross-cutting tensions:
  - **Owners** may want the full log and every DBS record visible only to themselves. I'm asking for the DSL and admin to see staff checks.
  - **Teachers** (persona-wise) may want to see their own raised concerns. Some DSLs prefer that raisers *don't* see the record after submission. The current "you will not see it again" is a defensible choice. I'd add a receipt, not access.
  - **Parents** may want consent toggles that take effect instantly. The office may want to acknowledge first, as medical updates do. I recommend the parent's withdrawal takes effect **immediately** (withdrawal must be at least as easy as giving consent), and the office acknowledges after.
- **Where my improvements could hurt others:**
  - A focus trap could annoy power users if done badly.
  - Adding medical and photo questions to `/join` lengthens the trial form (a growth-team concern).
  - Restricting guardian edits adds office work for separated families.
- **Group scores:** satisfaction 6/10, adoption likelihood 5/10, continued use 6/10.

---

## 8. Candidate recommendations

### R-01: Concern entry for office and DSL, including allegations about adults (P0)
- **Screen/workflow:** `/safeguarding`, People student sheet, a new "Record a concern" button.
- **Problem and evidence:** D-01. In S1 there was no raise option for Nadia, and `raise_concern` requires `student_id`.
- **Proposal:**
  - A "Record a concern" button on `/safeguarding` and on the office student sheet.
  - A subject selector: *a child* (search) or *an adult / member of staff* (free text, plus a link to a staff member).
  - Category list extended with "allegation about staff/volunteer".
  - Allegation concerns are visible to the owner only when the DSL is the subject, and to the DSL only when the owner is the subject. Escalation text points to the local authority designated officer (LADO); wording to be checked by specialists.
  - The raiser gets a reference number and timestamp receipt, and can **add a follow-up note** (append-only) to a concern they raised, without reading others.
- **Users:** DSL, admin, owner, teachers. **Personas:** 24.
- **Priority:** P0. Disclosures at the desk are routine and currently unrecordable.
- **Complexity:** M. Files: `components/app/safeguarding.tsx`, `app/safeguarding/page.tsx`, `components/app/people-sheets.tsx`, a new migration altering `safeguarding_concern` (subject_kind, subject_staff_id, subject_text) and `app.raise_concern`, and new `app.add_concern_note`.
- **Dependencies:** none. **Risks:** routing allegations wrongly when the owner is the subject.
- **Acceptance criteria:**
  - Admin raises a concern from the student sheet. It appears in the DSL log. The access log shows the admin as raiser, not reader.
  - Raising about an adult needs no `student_id`.
  - The raiser sees a reference and can append a note but cannot open the log.
  - Tests: admin raise succeeds; guardian raise refused; a raiser append does not log as a read.
- **User story:** As a DSL, I want any member of staff, including office staff, to record a concern about a child or an adult, so that disclosures made at the desk are captured the same day.
- **Workflow:** Desk → student or "adult" → facts → urgent? → submit → receipt → DSL notified.
- **Business rules:** at least 10 characters; urgent flag notifies at once; no read-back for the raiser.
- **Edge cases:** child not yet on the books (trial or enquiry); the raiser is the DSL; the subject is the owner.

### R-02: Consent management with withdrawal and history (P0)
- **Screen/workflow:** `/family/children` Photos row → "Change"; `/family/enquiries` new type "Consent"; office student sheet "Consents" section; teacher brief.
- **Problem and evidence:** D-02, D-07; S2 unable to complete.
- **Proposal:**
  - Per-purpose toggles (photography, social media, medical treatment, collection by another adult) on the family app.
  - **Withdrawal takes effect immediately.** Granting may be immediate, or require office acknowledgement if the school chooses.
  - Each change inserts a new `consent_record` row (granted, by, at, source) rather than updating in place, so history stays.
  - Every read uses the latest row (fix the subqueries with `order by granted_at desc limit 1`).
  - Office sees the history and can record consent given on paper.
  - Teacher brief shows "No photos" **and** "Not recorded" distinctly. Unrecorded is treated as no consent for programmes, which is already true.
  - A pre-show "consent list" print for a class or event.
- **Users:** parents, office, teachers, DSL.
- **Priority:** P0. Legal-basis and safeguarding risk at every show.
- **Complexity:** M. Files: `app/family/children/page.tsx`, `components/app/people-sheets.tsx`, `lib/repos/people.ts:46`, `lib/repos/family.ts:64`, `components/app/medical-brief.tsx:103`, `0020` view, a new `app.set_consent` function, `consent_record` (already audited).
- **Dependencies:** none. **Risks:** students aged 13+ may have their own say on some purposes; needs specialist input.
- **Acceptance criteria:**
  - A parent withdraws photography and the teacher brief shows "No photos" on the next load.
  - People and family pages still render with two or more consent rows.
  - The history lists both rows with who and when.
  - The programme omits the name.
- **User story:** As a parent, I want to withdraw photo consent in the app, so that the school stops photographing my child straight away.
- **Workflow:** Family → child → Photos → Change → choose → confirm → teacher/office notified ("consent changed", no detail).
- **Business rules:** withdrawal must be no harder than granting; never delete old rows except by retention.
- **Edge cases:** two guardians disagree; a 16-year-old's own view; consent imported as "No"; a show already printed.

### R-03: Guardian control of student logins, and second-guardian invitation (P1)
- **Screen:** `/family/children` per child: "App login for Amir: On/Off · Approve request". *Your details*: "Invite the other parent".
- **Problem:** D-09, D-11. The office invite promises parent approval that cannot happen.
- **Proposal:**
  - New functions `app.guardian_set_student_login(student, enabled)` (checks guardian of family and age ≥ threshold) and `app.guardian_invite_guardian(email)`.
  - The school threshold is editable by the owner in settings (bounded at 13 minimum unless the owner confirms a reason; specialist input needed).
  - A guardian may edit only their own guardian row.
  - The office is notified of any change to another adult's details.
- **Priority:** P1. **Complexity:** M. Files: `0010_hubs.sql` trigger (reuse), `0019_platform.sql` invitations, `0006_rls.sql` `guardian_self_update` (narrow to `user_id = auth.uid()`), `components/app/family-details.tsx`.
- **Acceptance criteria:**
  - Hannah can switch Amir's login off, and Amir's next load shows no data.
  - Hannah can no longer edit Inês's phone.
  - An office student invite is approved by the guardian and then the login works.
- **User story:** As a parent of a teenager, I want to approve or switch off their app login, so that I stay in control of their access.
- **Business rules:** any one guardian may switch off; turning on requires a guardian and age ≥ threshold.
- **Edge cases:** guardians disagree; the student turns 18; the second guardian has no login.

### R-04: Truthful "who can see what" and family data rights (P1)
- **Screen:** new `/family/privacy` (and a staff equivalent in Help). Fix the texts in `app/family/children/page.tsx` and `app/people/page.tsx:43`.
- **Problem:** D-04; S3 export and erasure unable.
- **Proposal:**
  - A table generated from one source of truth: role → what they see, including the exact safety-brief columns that the test suite already asserts.
  - "Download our data" (family-scoped JSON/PDF via existing RLS as the guardian).
  - "Ask to correct / delete" request types routed to `/requests` with a due-date counter (one month; specialist to confirm).
- **Priority:** P1. **Complexity:** S–M. Files: `app/family/*`, `lib/repos/account.ts` (reuse export loop under the guardian session), `studio_request` kinds.
- **Acceptance criteria:**
  - Text matches the `student_safety_brief` columns.
  - A guardian download contains only their family's rows.
  - An erasure request appears in the office queue with a due date.

### R-05: Safeguarding access log integrity (P1)
- **Problem:** D-03; owner-only visibility.
- **Proposal:**
  - Log reads once per sheet open (do not re-log on refetch after an action; e.g. split "list actions" from "log open").
  - DSL and owner both see the access log, and each one's own reads are visible to the other.
  - Pagination beyond 200 rows.
  - Add the concern's child name or reference to each access row.
- **Priority:** P1. **Complexity:** S. Files: `app/safeguarding/page.tsx`, `0030_safeguarding.sql` (`safeguarding_actions`, `safeguarding_access_log`).
- **Acceptance criteria:** opening once and acting once produces exactly two rows. The DSL sees the log. A test asserts no duplicate.
- **User story:** As a DSL, I want an accurate record of who has read each concern, so that I can evidence confidentiality.

### R-06: Retention legal hold for safeguarding (P1, needs specialist assessment)
- **Problem:** D-10.
- **Proposal:**
  - Skip the "anonymise" step (and medical deletion, subject to advice) for any student with a safeguarding concern not yet past `concern_months`.
  - Show "held: safeguarding record" in the preview.
  - Never anonymise while a concern is open, monitoring or referred.
  - Optional manual hold on any child.
- **Priority:** P1. **Complexity:** S. File: `0040_public_safety_retention.sql` `apply_retention`; `components/app/safeguarding.tsx` RetentionCard preview.
- **Acceptance criteria:** a leaver with a closed concern inside the period is listed as held, not anonymised. A test covers it.

### R-07: Staff checks visible to the DSL and admin, plus a "no check on file" warning (P2)
- **Problem:** Marcus is an active teacher with "No checks recorded" and no warning. Admin sees none.
- **Proposal:** a read policy for the DSL and admin (certificate number masked for admin); a red marker on the staff list for active teaching staff without a current DBS or safeguarding training.
- **Complexity:** S. Files: `0030` `staff_check` policy, `components/app/safeguarding.tsx` `StaffChecks`, `app/people` staff tab.

### R-08: Trial safety capture (P2)
- **Proposal:** on `/join`, optional allergy/medical line, photo consent (default no), and a separate emergency contact. These feed the trial child's teacher brief.
- **Complexity:** S–M. Files: `app/join/page.tsx`, `app.public_book_trial` (`0040`).
- **Risk:** longer form.

### R-09: Dialog focus trap and return (P2)
- **Problem:** D-08.
- **Proposal:** trap Tab and Shift+Tab inside `role=dialog`; store `document.activeElement` on open and restore it on close.
- **Complexity:** XS–S. File: `components/app/record-sheet.tsx`.
- **Acceptance criteria:** Tab cycles inside the sheet; after Escape, focus is on the trigger; `npm run a11y` passes.

### R-10: Absence as a welfare signal (P2)
- **Proposal:** an office rule for N unexplained absences in a row (no parent-reported absence) that prompts the office to contact the family and offers "Raise a concern (attendance)". A visible "Low" word on the teacher list.
- **Complexity:** M. Files: `0018_automations.sql`, `app/teach/students/page.tsx`.

### R-11: Clear cross-boundary message (P3)
- **Problem:** D-06.
- **Proposal:** "This isn't one of your classes" when the session exists but is not visible. Use a `exists`-style security-definer check that returns a boolean only.
- **Complexity:** XS.

---

## 9. Feature rationalisation (safeguarding, privacy, trust and accessibility)

| Feature | Verdict | Reason |
|---|---|---|
| Concern log with read logging | **Retain / Refine** | Strong design. Fix duplicates and DSL visibility (R-05) |
| Concern entry | **Redesign** | Extend to office, DSL and adult subjects (R-01) |
| Teacher safety brief | **Retain** | Right scope. Make the descriptions truthful (R-04) |
| Consent model | **Add** | UI for capture and withdrawal (R-02) |
| Student login guard | **Refine** | Add guardian approval and switch-off (R-03) |
| Guardian editing all guardians | **Remove / Simplify** | Self-only edits (R-03) |
| Staff checks | **Refine** | DSL/admin visibility and warnings (R-07) |
| Retention | **Refine** | Legal hold; specialist review (R-06) |
| School export | **Refine** | Add a separate DSL-only safeguarding export (D-05) |
| Family data rights | **Add** | Download and requests (R-04) |
| Platform/support access | **Retain** | Owner-granted, time-limited, no health data. Model practice |
| Absence signals | **Add** | R-10 |
| Dialog focus | **Refine** | R-09 |
| Public class pages with counts | **Retain** | Counts only; no names exposed |
| Real sign-in (R-001) | **Add (blocking)** | No real child data before it |

### Items needing specialist legal or technical assessment (not claims of compliance)
- Accuracy of privacy information given to parents (D-04) and the lawful basis for teacher access to conditions and medication.
- Retention periods for medical, child and safeguarding records, and the interaction with anonymisation (D-10).
- Student login age threshold, and how far a 13–17-year-old controls their own consents.
- Subject-access and erasure handling times and exemptions (safeguarding records are often exempt from disclosure to parents).
- Security of hosted RLS, authentication (R-001), session handling and support-access implementation. This needs a penetration test once hosted.
- A full WCAG 2.2 AA audit with assistive-technology users (my checks were scripted spot checks only).
