# Panel report: office administrators (group "admins")

> **Simulated panel.** The personas below are fictional. Their views are professional judgement applied to what I actually drove in the browser. This is not real user research. All data is synthetic. No email, SMS or card payments are connected, so nothing outbound could happen.

Personas: **16** Dance school administrator (driven as Nadia Okafor, admin) · **17** Finance and payments administrator · **18** Reception / customer service administrator.

---

## 1. Method and limitations

**How I drove it.** I used Playwright (Chromium) against the static preview at `http://127.0.0.1:8080/General/studio-next/`. I signed in as **Nadia Okafor (admin)** with the localStorage session, using a fresh browser context for each run. Scenario 26 needed the parent's view, so in the same context I switched the session to **Hannah Wright (guardian)**. That way the parent saw the same in-browser database the office had just changed. Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/admins/` (`s23.cjs` … `s33.cjs`).

- **Viewports:** desktop 1440×900 for every scenario. Phone 390×844 (isMobile, touch) for one reception look-up (People → search → family), plus checks of `/enrolment` and `/billing` for horizontal overflow.
- **Interaction counts** are the clicks, selects and field fills my scripts made, counted by a step counter. Elapsed times are what the scripts measured. They include fixed 0.5–1.5 s waits the script inserted, so treat them as upper bounds, not human task times.
- **Code checks** are labelled "(code-verified)". They cover migrations under `src/lib/db/migrations/`, repos under `src/lib/repos/`, and components.

**What I could not test**
- Real email, SMS or push delivery (R-003). In-app notices to parents were verified.
- Card payments, card retries and card refunds (R-006, Stripe). `PAYMENTS.md` documents them as needing a server.
- Real sign-in and per-user permissions (R-001). Roles are trusted from localStorage in the demo.
- Multi-user concurrency. Each browser context has its own database, so two office staff can't be simulated against shared data.
- Offline behaviour. `ARCHITECTURE.md` §"Offline registers" describes a queued attendance writer (`lib/offline/attendance-queue`). The demo never goes offline, and nothing in the office screens is described as working offline (unverified).
- Seeded attendance percentages change between browser contexts. For example, Elias Bennett showed 83% in one run and 100% in another, so the seed is not fully deterministic. Figures quoted below come from the run named.

---

## 2. Scenario results

### Scenario 23: Receive an enquiry from a prospective customer and follow it through
- **Persona:** 18 Reception (and 16)
- **Objective:** Log a phone enquiry (Grace Mensah, child Efua, interested in Junior Tap), book a trial, record the outcome and enrol.
- **Starting point:** `/enrolment`
- **Outcome:** **Completed with significant friction**
- **Steps (24 interactions, about 51 s measured including waits):**
  1. Clicked **New enquiry**.
  2–7. Typed Who, Phone, Email, Child and DOB, and chose class "Junior Tap" (6).
  8. Clicked Save. The sheet said: "Grace Mensah is in the pipeline. Book their trial from the class when you're ready."
  9. Clicked Done. The card appeared in the **Enquiry** column.
  10. Switched to List view to see the contact details (the board cards don't show phone or email).
  11–12. Went to Timetable → Classes and opened Junior Tap.
  13. Clicked **Book a trial**. The form opened empty, with no way to choose the enquiry.
  14–19. **Re-typed** first name, last name, DOB, parent, phone and email (6 fields that were already captured).
  20. Clicked **Book them in**. Efua appeared under Trials (BOOKED, Tuesday 16:30).
  21. Went back to Enrolment. The pipeline card was **still in "Enquiry"**. The Trial booked column still read 2 and the funnel's "Trials booked" stayed at 14.
  22–23. Clicked **Came**, then **Joining**. The trial showed JOINED, but the pipeline card was still in "Enquiry" (`admins-04b-pipeline-not-linked.jpg`).
  24. Checked People. A new "Mensah family" existed, so the prospect family was created.
- **Difficulties:**
  - Enquiries and trials are two disconnected records.
  - There is no "Book trial" action on an enquiry card.
  - Board cards show no phone or email, and a card can't be opened to see detail, notes or history.
- **Unnecessary steps:** 6 re-typed fields, 2 navigations to another screen, and a manual stage move I would have had to make (not made, to show the defect).
- **Missing:**
  - Notes or call log on an enquiry.
  - A confirmation to the parent. A trial confirmation can't be sent from here: no email is connected, and a prospect has no login.
  - Duplicate check when the same family enquires twice. The Sullivan and Haddad families each appear twice in pickers (see the Defects section).
- **Defects:**
  - D3: enquiry not linked to the trial (`admins-03-book-trial-reentry.jpg`, `admins-04b-pipeline-not-linked.jpg`).
  - D9: "Came" and "Joining" were accepted for a trial session that is still in the future (Tuesday 1 Dec, marked on Friday 27 Nov).
- **Clarity of outcome:** Each sheet gives a clear message. The overall state is contradictory: Trials says JOINED while the Pipeline says Enquiry.
- **Satisfaction:** 2/5
- **Suggested improvements:**
  - "Book a trial" from the enquiry card, prefilled from the enquiry, passing `enquiry_id`. `app.book_trial` already accepts it (0023_operations.sql:66), but the UI never sends it.
  - Trial outcome moves the enquiry stage automatically.
  - Enquiry detail panel with notes and contact links.

### Scenario 24: Move a student to another class
- **Persona:** 16
- **Objective:** Move Nell Ackah (5) from Junior Tap to Saturday Ballet Grade 1.
- **Starting point:** `/classes`
- **Outcome:** **Completed with minor friction**
- **Steps (6 interactions, about 5.2 s):**
  1. Opened Junior Tap.
  2. Clicked the person-minus icon labelled "Withdraw Nell Ackah". This is the only route to a move.
  3. Chose "Moving to another".
  4. Picked "Saturday Ballet Grade 1 — 11/14".
  5. Clicked Move. The sheet said: "Nell Ackah is now in Saturday Ballet Grade 1. Their history comes with them…"
  6. Clicked Done. The Saturday roster then showed 12 of 14, and Junior Tap 10 of 16.
- **Difficulties:**
  - The move is hidden behind a "Withdraw" icon (`admins-05-move-student-sheet.jpg`).
  - The class list includes the class the child is already in (Junior Tap) and shows no age ranges. A 5-year-old went into an "Ages 6–8" class with no warning.
- **Missing (code-verified, `app.transfer_enrolment`, 0023_operations.sql:307):**
  - No age or level check.
  - No price-difference or pro-rata billing adjustment. Junior Tap is £46 and Saturday Ballet is a different price.
  - **The family is not notified.** `on_enrolment_notify` (0017:177) tells admins and the new teacher only.
  - No effective date: the move is always "today".
- **Clarity of outcome:** Good. The confirmation names both classes.
- **Satisfaction:** 3/5
- **Suggested improvements:**
  - "Move" as its own action on the roster row and the student record.
  - Show ages and price difference in the picker.
  - Optional "tell the family" step.
  - Optional effective date.

### Scenario 25: Manage a waiting list
- **Persona:** 16
- **Objective:** Add a child to the Grade 3 Ballet waiting list, offer a place, free a place and confirm the take-up.
- **Starting point:** `/classes` → Grade 3 Ballet (14/14, 8 waiting)
- **Outcome:** **Completed with significant friction (defect found)**
- **Steps (9 interactions, about 22–32 s including waits):**
  1. Opened Grade 3 Ballet.
  2. Clicked **Add to waiting list**. The picker listed all 50 students A–Z with no ages. It included children already on this list (Sofia Dlamini, Lily Fenwick), and a 5-year-old was offered for a 9–12 class.
  3. Picked a child.
  4. Clicked **Add to the list**. The list went to (9).
  5. Clicked **Offer** on #1 Bea Petrov. Bea showed OFFERED, **even though the class was full**.
  6–7. Withdrew Sofia Ackah: "The place is free. It has been offered to whoever has waited longest." The system then **also** offered the place to #2 Reuben Haddad. Two open offers now existed for one place.
  8. Clicked Done.
  9. Clicked **Took it** on Bea. The class went to 14/14. Reuben still showed **OFFERED**. Clicking his "Took it" gave the red error "The class is full again — withdraw someone first." (`admins-08-second-offer-class-full.jpg`)
- **Defects:**
  - D4: Offer is allowed when the class is full, and auto-offer ignores existing outstanding offers. Two offers for one place leave a family promised a place that doesn't exist.
  - D10: The waitlist picker doesn't exclude children already listed or enrolled, and gives no age guidance.
- **Missing:**
  - Offer expiry is not visible in the panel. The code sets 3 days (`offer_waitlist_place(p_id, 3)`) and expiry runs via automations (0018:183).
  - No reorder or priority control.
  - "Took it" is available without an offer, so a child can jump the queue silently with no note.
  - The parent sees the offer in-app (code-verified: `notify_family 'waitlist_offer'`, 0017:220). Email is not connected.
- **Clarity of outcome:** Muddled once two offers exist. After acceptance, the positions are not renumbered (the list starts at "2").
- **Satisfaction:** 2/5
- **Suggested improvements:**
  - Block or warn on Offer when there are no free places, counting outstanding offers.
  - Show offer expiry with a countdown.
  - Filter the picker by age and exclude current members.

### Scenario 26: Cancel a class and inform everyone affected
- **Persona:** 16
- **Objective:** Cancel Junior Tap on Tue 1 Dec ("Teacher unwell") and check what parents see.
- **Starting point:** `/schedule` → Next week
- **Outcome:** **Successfully completed** for enrolled families. There is a gap for trial families (code-verified).
- **Steps (5 interactions, about 5.7 s):**
  1. Clicked Next week.
  2. Clicked the Junior Tap tile. The tile itself warned: "clash: Priya also teaches Modern Juniors", a seeded cover clash, which is useful.
  3. Clicked **Cancel this session**.
  4. Typed reason "Teacher unwell". The message was prefilled.
  5. Clicked **Cancel and tell 11 families**. The sheet said: "Cancelled. 11 families have been told, and the teacher." (`admins-10-cancel-session-form.jpg`)
- **Parent check (Hannah Wright, same database):**
  - `/family` showed the notice "NEW · Cancelled: Junior Tap on Tuesday 1 December at 16:30".
  - Clara's card showed "Junior Tap — CANCELLED · Teacher unwell".
  - `/family/schedule` showed "Clara · Junior Tap CANCELLED Teacher unwell" on 1 Dec, and 8 Dec unchanged (`admins-11-parent-home-after-cancel.jpg`).
- **Who is notified (code-verified, `app.announce_session`, 0023:142):**
  - A class broadcast (`communication`, in_app).
  - A notification to each family with an active enrolment.
  - The class teacher and any covering teacher.
- **Defect D5:** `app.cancel_session` sets booked trials to `cancelled` (0023:192) *before* calling `announce_session`. `announce_session` looks for trials with `status = 'booked'` (0023:156), so **families with a trial booked on that session are never told**. In this session that was Fionn Kelleher's family, with "1 trial" shown on the session sheet. The trial is silently cancelled with no rebooking prompt for the office.
- **Missing:**
  - No credit, refund or make-up offer for the lost session. The term fee is unchanged.
  - The office can't see per-family read status for this notice from the sheet. Group broadcasts do have "Open one to see who has read it" in Inbox → Groups.
  - Email/SMS is "not connected yet", so in reality only families who use the app would know.
- **Satisfaction:** 4/5
- **Suggested improvements:**
  - Fix the notification order.
  - List the affected trials and offer "rebook trial".
  - Optional "add a make-up session" or "credit each family £x" step.

### Scenario 27: Identify and reconcile overdue payments
- **Persona:** 17
- **Objective:** Find overdue invoices, chase one, record a bank transfer against another.
- **Starting point:** `/billing` (Outstanding £612; Overdue £612, 8 invoices; Failed 3, £162)
- **Outcome:** **Completed with minor friction**
- **Steps (10 interactions, about 9.3 s):**
  1. Clicked **Chase**. It filtered to "Needs action".
  2. Opened INV-1067 (Mackenzie, overdue £72).
  3. Clicked **Send reminder**. The subject and message were prefilled from a template.
  4. Clicked Send: "It is in Mackenzie family's messages and their communication history."
  5. Clicked Done.
  6. Opened INV-1065 (Fenwick £126).
  7. Clicked **Record payment**. Only two methods were offered: Bank transfer and Cash.
  8–9. Typed £100 and reference "FENWICK REF 2211".
  10. Clicked Record payment. The invoice showed "Overdue · part paid, £26 still to pay".
- **Other checks:**
  - "Retry" on Failed payments only filters the list. It cannot retry a card (R-006). The failed invoice INV-1070 shows "Ask for a new card" (`admins-14-failed-card-invoice.jpg`).
  - **Exports:** Aged debt CSV, Payments CSV and Xero sales-invoices CSV all downloaded.
- **Difficulties:**
  - **No bulk chase.** The invoice list has 0 checkboxes, so 8 overdue invoices mean 8 × 4 interactions.
  - No aged-debt view on screen. It is CSV only.
  - The Today card reads "3 Card payments failed — £612.00 outstanding in all". It mixes the failed count with total outstanding (£162 is failed).
  - The family panel shows INV-1065 as "Issued" while Billing says "Overdue".
- **Missing:**
  - Bank-statement import or matching for reconciliation.
  - Payment against the family account rather than one invoice. The DB supports `p_invoice null` (0016:335), but the UI always records against an invoice.
  - Reminder schedules exist only as automations. Not verified.
- **Satisfaction:** 3/5
- **Suggested improvements:**
  - Bulk-select plus "send reminder to all overdue".
  - On-screen aged debt.
  - Statement CSV import with suggested matches by reference and amount.

### Scenario 28: Apply a family discount
- **Persona:** 17
- **Objective:** Give the Fenwick family (3 children) 15% and check it applies. Then end it.
- **Starting point:** `/billing` → **Billing runs** (the only place family discounts live)
- **Outcome:** **Partially completed**. Applying works. Ending is defective.
- **Steps (6 interactions, about 4 s):**
  1. Clicked Billing runs.
  2. Clicked Add (Family discounts).
  3. Chose Fenwick family.
  4. Typed 15. The type defaulted to percentage; reasons offered are Bursary, Staff family, Loyalty, Other.
  5. Typed an office note.
  6. Clicked **Save discount**. The row appeared: "Fenwick family · Bursary · 15%" (`admins-16-family-discount-after-save.jpg`). The run preview then showed "· 15% discount" on each Fenwick line.
- **End discount:** Clicked the bin icon "End discount for Fenwick family", then reloaded and reopened. **The discount is still listed and still applied to the preview** (`admins-17-family-discount-after-end.jpg`). No error is shown. This is D2.
- **Other observations:**
  - The discount affects only *future* billing runs. Fenwick's existing open invoice INV-1065 (£126) was unchanged, and there is no "apply to open invoices" option.
  - The sibling (2nd+, 10%) and multi-class (3rd+, 15%) rules exist but are **off by default** (checkboxes unticked).
  - The discount is not visible on the family's People record.
- **Satisfaction:** 2/5
- **Suggested improvements:**
  - Fix End.
  - Show and manage discounts on the family record.
  - Offer "apply to open invoices" with a credit note.

### Scenario 29: Correct inaccurate student information
- **Persona:** 16 / 18
- **Objective:** Correct Clara Wright's date of birth and preferred name.
- **Starting point:** `/people` → Students
- **Outcome:** **Unable to complete**
- **Steps (3 interactions to failure):**
  1. Students tab.
  2. Clicked Clara Wright. The panel shows DOB as "22 Oct" with no year.
  3. Clicked **Edit details**. The whole screen was replaced by "STOPPED — This screen hit a problem — `l?.date_of_birth?.slice is not a function`" (`admins-21-edit-student-crash.jpg`). I repeated it with Idris Adeyemi and got the same crash.
- **Cause (code-verified):** `components/app/people-sheets.tsx:143` calls `row?.date_of_birth?.slice(0, 10)`. `STUDENT_DETAIL` returns `date_of_birth` as a Date object from PGlite, not a string. The family panel offers only "Add a child", so there is **no working path to edit any existing student's name, DOB, pronouns, school or notes**.
- **What still works:**
  - **Medical and emergency contacts** opens and edits fine.
  - Guardian **Edit** on the family panel is available.
  - Edit family is available.
- **Audit trail:** None visible. `audit_log` exists and is append-only (SECURITY.md "The audit trail"). The only office UI that reads it is the support-session list on `/account` (`lib/repos/account.ts:63`). The medical sheet says "every change is recorded against your name", but nobody in the office can see that record.
- **Satisfaction:** 1/5
- **Suggested improvement:** Fix the crash with `String(...)` or `to_char` in SQL. Add a "History" section to student and family records, reading from `audit_log`.

### Scenario 30: Process a refund or credit
- **Persona:** 17
- **Objective:** Refund £10 for a cancelled lesson, or give the family a credit.
- **Starting point:** `/billing`
- **Outcome:** **Completed with significant friction.** The refund is recorded, but the result is wrong for the purpose. Credit is missing in the UI.
- **Steps (9 interactions, about 5.8 s):**
  - All 22 seeded paid invoices were paid by card. A card refund can't be made in Swayvo ("Card payments are refunded from the payment provider"). So I first recorded a cash payment:
    1. Opened INV-1066 Oyelaran.
    2. Clicked Record payment.
    3. Chose Cash.
    4. Typed £54.
    5. Recorded it. The invoice showed Paid.
  - Then the refund:
    6. Clicked the refund icon.
    7. Typed £10.
    8. Typed the reason "Class cancelled 1 Dec – teacher unwell".
    9. Clicked **Record refund** (`admins-18-refund-sheet.jpg`).
- **Result:** The invoice **reopened as "Overdue · part paid — £10 still to pay; Owes £10 in total"**. Refunding a goodwill amount turns into a debt that the Chase list will now pursue. This is D6.
- **Credit:**
  - No UI anywhere. "Record payment" offers Bank transfer and Cash only, and there is no "Add credit" or credit-note action.
  - The database supports goodwill credit (`method = 'credit'`, 0016:28–31, 311) and allocation to the oldest invoice (0016:163).
  - `PAYMENTS.md` lists "Goodwill credit" under "What works today". That isn't true of the UI.
- **Missing:**
  - Credit notes or invoice adjustments (reduce what is owed, rather than un-pay).
  - Partial-line refund.
  - Refund approval or permissions: any admin can refund or void.
- **Satisfaction:** 2/5

**Outcome counts:**

| Outcome | Count | Scenarios |
|---|---|---|
| Successfully completed | 1 | 26 |
| Completed with minor friction | 2 | 24, 27 |
| Completed with significant friction | 3 | 23, 25, 30 |
| Partially completed | 1 | 28 |
| Unable to complete | 1 | 29 |

---

## 3. Feature status table (office administration)

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Today "Needs attention" queue | `/today` | Fully implemented & tested | 7 actionable items with deep links; the failed-card card mislabels the amount (D11) |
| Family records (guardians, address, notes, invoices, messages) | `/people` family panel | Fully implemented & tested | Edit family, Edit guardian, Add child present; phone verified at 390 px with no overflow |
| Student record view | `/people` Students → panel | Partial | Shows age, classes, attendance, consent and contacts; DOB has no year |
| Edit student details | `people-sheets.tsx:131` | **Defective** | Crash for every student (D1) |
| Medical & emergency contacts | Student panel | Fully implemented & tested | Sheet opens; office-only GP fields |
| Global search (⌘K "Ask or jump") | Shell | Fully implemented & tested | Finds families, students, invoices, phone numbers; "INV-1065" also returned the Rahman family (false positive); no enquiries in results |
| List filtering | `/people` | Partial | Only "Search families"; no filter by class, balance, status, age or medical |
| Bulk actions | People, Billing | **Missing** | 0 checkboxes on the invoice list; no bulk message from People |
| Enquiry capture | `/enrolment` New enquiry | Fully implemented & tested | 8 interactions |
| Enquiry → trial linkage | `/enrolment`, `/classes` | **Defective** | D3 |
| Pipeline board / list | `/enrolment` | Partial | Board has no contact details, card detail or notes; list view has phone and email |
| Public trial booking link | `/join?school=northstar` | Implemented, not tested by me | Link shown on `/enrolment` |
| Trial outcomes (Came / No show / Joining) | `/enrolment` | Partial | Works; allowed before the session date (D9) |
| Move student | `/classes` roster → Withdraw icon | Partial | Works; hidden, no age, price or family notice |
| Waiting list | `/classes` class panel | **Defective** | Double offer for one place (D4) |
| Cancel / move / cover a session | `/schedule` session sheet | Fully implemented & tested | Parent sees it immediately; trial families missed (D5, code-verified) |
| Clash detection | Schedule tile | Fully implemented & tested | "clash: Priya also teaches Modern Juniors" |
| Inbox (families, groups, templates, automations) | `/inbox` | Fully implemented & tested (in-app) | Group broadcasts with read tracking; "Email and text delivery aren't connected yet" |
| Requests (medical updates, events, privates) | `/requests` | Fully implemented & tested | "Acknowledge & add to record" in one click |
| Invoices: create / issue / void / record payment | `/billing` | Fully implemented & tested | Bank transfer and cash only |
| Payment reminders | Invoice → Send reminder | Fully implemented & tested (in-app) | Template prefilled; one invoice at a time |
| Card payments / retries | Billing | Implemented, not testable | R-006; "Retry" only filters |
| Refunds | Invoice → payment refund icon | Defective (semantics) | D6 |
| Goodwill credit / payment on account | — | **Missing in UI** (DB has it) | D7 |
| Family discounts | Billing runs sheet | **Defective** (cannot end) | D2 |
| Sibling / multi-class rules | Billing runs sheet | Implemented, off by default | Checkboxes unticked |
| Billing runs (term / monthly) | Billing runs sheet | Defective (risk) | Raised 27 drafts (£6,376.33) for a term already invoiced (D8) |
| Exports (aged debt, payments, invoices, Xero; attendance, class lists, families) | Billing, Reports | Fully implemented & tested | 3 billing CSVs downloaded; reports menu lists 3 CSVs |
| Reports dashboard | `/reports` | Partial | Useful; "no registers%" label bug (D12); funnel figures disagree between screens |
| Term rollover | `/classes` Start next term | Partial | Dead end until a term exists: "Add the next term first, in School settings → Terms" |
| Audit trail visible to office | — | **Missing** (recorded, not shown) | Only support sessions shown on `/account` |
| Duplicate detection / merge | — | **Missing** | Two "Sullivan family" and two "Haddad family" records in pickers |
| Admin vs owner permissions | `/account`, `/studio` | Partial | Owner-only: branding, support access, retention, full export, staff roles; admin has full money powers with no finer role |
| Phone layout (office) | People, Enrolment, Billing | Fully implemented & tested | scrollWidth 390; enrolment defaults to list on phone |

---

## 4. Defects found

**D1. Editing any student crashes the screen. Severity: Critical.**
- **Reproduce:** `/people` → Students → any student → **Edit details**.
- **Expected:** The edit sheet opens.
- **Actual:** Full-screen error "`l?.date_of_birth?.slice is not a function`".
- **Evidence:** `admins-21-edit-student-crash.jpg`; `src/components/app/people-sheets.tsx:143`; `STUDENT_DETAIL` in `src/lib/repos/people.ts:151` returns a Date object.
- **Impact:** No office user can correct a child's name or DOB.

**D2. Ending a family discount does nothing. Severity: High.**
- **Reproduce:** Billing runs → Family discounts → Add Fenwick 15% → Save → bin icon "End discount for Fenwick family" → reload.
- **Expected:** The discount disappears and stops applying.
- **Actual:** It is still listed and still applied in the run preview. No error is shown.
- **Evidence:** `admins-17-family-discount-after-end.jpg`.
- **Likely cause (code-verified, not proven):**
  - `END_FAMILY_DISCOUNT` is `update … set deleted_at = now() … returning id` (`billing.ts:151`).
  - The RLS policy is `using (deleted_at is null …)` (`0039_billing_periods.sql:37`), so the updated row fails the policy on RETURNING.
  - The mutation has no error display (`billing-run.tsx` `end`).
  - `FAMILY_DISCOUNTS` also doesn't filter `deleted_at is null`.
- **Impact:** A bursary can't be stopped and keeps going into every future run.

**D3. Enquiry is not linked to the trial booked for it. Severity: High.**
- **Reproduce:** New enquiry → book a trial for the same child from the class → mark Came and Joining.
- **Expected:** The enquiry moves to Trial booked, then Enrolled, with details prefilled.
- **Actual:** Details are re-typed, the card stays in "Enquiry", and the funnel doesn't count it.
- **Evidence:** `admins-03-book-trial-reentry.jpg`, `admins-04b-pipeline-not-linked.jpg`. `app.book_trial` supports `p_child.enquiry_id` (0023:66, 99–101), but no UI passes it (`grep enquiry_id` in `src/app` and `src/components` returns nothing).

**D4. Two offers for one waiting-list place. Severity: High.**
- **Reproduce:** Grade 3 Ballet (full) → Offer #1 → withdraw any child → #2 is auto-offered → Took it on #1 → #2 still "OFFERED"; their Took it fails with "The class is full again".
- **Expected:** Offer refused or warned when there is no free place, and auto-offer skipped when an offer is outstanding.
- **Evidence:** `admins-08-second-offer-class-full.jpg`; `offer_waitlist_place` (0015_pipeline.sql:51).

**D5. Trial families are not told when their session is cancelled. Severity: Medium (code-verified).**
- **Detail:** `app.cancel_session` sets trials `cancelled` (0023:192–193) before `announce_session` selects `status = 'booked'` trials (0023:156).
- **Expected:** The trial family is notified and the office is prompted to rebook.

**D6. Refunding part of a paid invoice reopens it as overdue debt. Severity: High.**
- **Reproduce:** Record £54 cash on INV-1066 → refund £10 with reason "class cancelled".
- **Expected:** The family's net charge goes down, the invoice stays settled, and a credit note is issued.
- **Actual:** "Overdue · part paid — £10 still to pay"; the family "Owes £10".
- **Evidence:** `admins-18-refund-sheet.jpg` (before) plus the script log. Design gap: there is no credit note or adjustment.

**D7. Goodwill credit and payment on account have no UI. Severity: Medium.**
- **Detail:** The Record payment method list is `['Bank transfer','Cash']`. The DB supports `credit` and unallocated payments (0016:28–31, 304–335). `PAYMENTS.md` claims "Goodwill credit" works today.

**D8. A billing run re-bills a term that already has invoices. Severity: High (risk; seed contributes).**
- **Reproduce:** Billing runs → Current Term → "Raise 27 draft invoices" (£6,376.33), although 30 "Termly tuition" invoices for the term already exist (22 paid). Needs action then jumped from 8 to 35.
- **Cause:** Dedupe relies on `invoice_item.student_id/class_id` (0024:121). Seeded invoices (`seed/data.ts:485`) and any **manual** invoice from New invoice carry no class link.
- **Impact:** Imported or hand-made termly invoices will be billed again with no warning.
- **Evidence:** `admins-15-billing-run.jpg`.

**D9. Trial outcomes can be recorded before the trial has happened. Severity: Low.**
- **Detail:** On 27 Nov, Came and Joining were accepted for Efua's 1 Dec trial.

**D10. Waiting-list / enrol picker lists every student. Severity: Low.**
- **Detail:** All 50 students appear A–Z, including those already waiting, with no age shown. A 5-year-old was offered for a 9–12 class.

**D11. Today card mislabels failed payments. Severity: Low.**
- **Detail:** "3 Card payments failed — £612.00 outstanding in all" pairs the failed count with total outstanding. Billing shows the failed amount is £162.

**D12. Reports table prints "no registers%". Severity: Low.**
- **Detail:** `src/app/reports/page.tsx:184` appends "%" after the fallback text (week of 5 Oct).

**D13. Funnel numbers disagree between screens. Severity: Low.**
- **Detail:** Enrolment funnel shows "38.9% enrol" (7 of 18 enquiries, attended 11). Reports shows "Trial conversion 58%, 7 enrolled of 12 trialled". The denominators are not explained.

**D14. Invoice status differs between panels. Severity: Low.**
- **Detail:** The family panel shows INV-1065 "Issued" while Billing shows "Overdue".

**D15. Possible duplicate family records with no merge tool. Severity: Low (seed / data quality).**
- **Detail:** The invoice family picker lists two "Haddad family" (Rana; Nadia). ⌘K "grace" returned two "Sullivan family" records. Nothing in the UI flags or merges duplicates.

---

## 5. Individual panel member reports

### Persona 16: Nadia Okafor, school administrator (simulated)

**User profile**
- **Role:** Office administrator at a three-studio school, 4 days a week.
- **Background:** Ex-retail operations supervisor. Joined the school when her twins started tap. Fluent in spreadsheets. Moderately confident with web apps.
- **Typical activities:** Registrations, timetable changes, chasing forms, answering parents, cover arrangements.
- **Accessibility:** Uses a 27" screen at 125% zoom and prefers a keyboard.
- **Primary needs:** One place for families and classes, fewer re-typed details, confidence that parents have been told.
- **Existing frustrations:** Copying details between the enquiry email, the register spreadsheet and the billing sheet.

**Application experience**
- **First impressions:** The Today screen is the best "start of day" view I've seen in a demo. "7 things", each with a button that takes me straight there: Review, Reply, Waiting list, See who.
- **Most valuable:**
  - Cancelling a class: 5 clicks, and Hannah's home screen said "CANCELLED · Teacher unwell" under Clara's Junior Tap straight away.
  - The clash warning on the schedule tile.
  - "Acknowledge & add to record" for the inhaler update in `/requests`.
- **Least valuable:** The drag-and-drop pipeline. The cards hold three lines, I can't open them, and they don't move when the real thing (the trial) happens.
- **Exceeded expectations:** Moving Nell kept her history and freed the place to the waiting list automatically.
- **Failed expectations:**
  - **I could not correct a child's date of birth.** "Edit details" stopped the whole screen. That is a daily job.
  - The enquiry I typed had to be typed again when I booked the trial.
- **Usability concerns:**
  - "Move to another class" is hidden behind a Withdraw icon. I would never guess it, and I'm nervous clicking "Withdraw" on a child.
  - The waiting list let me promise one place to two families.
- **Missing:** A change history on a child or family ("who changed this, when"). Bulk messages from a filtered People list. A move that tells the family.
- **Opportunities to simplify:** Book the trial from the enquiry card. Show the age range next to every class in every picker.

**Recommendations**
- **5 highest-priority improvements:**
  1. Fix student editing.
  2. Link enquiry → trial → enrolment.
  3. A safe waiting-list offer.
  4. A separate "Move" action with family notification.
  5. Visible record history.
- **Feature to simplify:** The drag-and-drop board. Make the list the default and the board optional.
- **Greatest-impact improvement:** Enquiry-to-enrolment as one connected record.

**Adoption verdict**
- **Would I use it?** Yes, for timetable, cancellations and messaging, once D1 is fixed.
- **Prefer to existing arrangements?** Yes for cancellations and requests. Not yet for enquiries.
- **Would I recommend it?** Only after D1, D3 and D4 are fixed.
- **What would prevent adoption:** Not being able to edit children, and no email delivery (R-003). Half our parents won't open an app.
- **What would keep me using it:** The Today queue and the parent-side visibility.

**Scores (/10)**

| Measure | Score |
|---|---|
| Relevance | 9 |
| Quality of existing functionality | 6 |
| Completeness | 5 |
| Ease of use | 6 |
| Efficiency of everyday tasks | 5 |
| Overall usefulness | 7 |
| Likelihood of adoption | 6 |
| Likelihood of continued use | 7 |

**Overall: 6/10.** The structure is right and cancellations are excellent. A crash on the most basic edit, plus disconnected enquiry records, keeps it below "ready".

### Persona 17: Finance and payments administrator, "Ruth Achterberg" (simulated)

**User profile**
- **Role:** Part-time bookkeeper. Does fees, reconciliation and the monthly Xero hand-off for this school and two other small businesses.
- **Background:** AAT-qualified. Very high tech confidence in accounting tools, low patience for apps that blur debt and refunds.
- **Situation:** Works from home on a laptop, mostly Monday mornings. Dyslexic, so prefers tables with clear status words over icons.
- **Primary needs:** An accurate ledger, a quick overdue list, clean exports, and refunds or credits that net off correctly.
- **Existing frustrations:** Matching bank lines to families by hand. Discounts agreed verbally and never written down.

**Application experience**
- **First impressions:** The Billing header (Outstanding / Overdue / Failed / Collected) is honest and the status words are clear. INV-1070 shows the declined card struck through next to the successful one. Good.
- **Most valuable:**
  - Xero sales-invoices CSV.
  - Aged-debt CSV.
  - Payment note "A bank reference helps at reconciliation".
  - Void with a mandatory reason.
- **Least valuable:** "Retry" on failed payments. It only filters, because cards aren't connected.
- **Exceeded expectations:** Family discounts with a reason category and an office-only note. Families see only "Discount".
- **Failed expectations:**
  - **A £10 refund made a paid invoice overdue again.** If I refund for a cancelled class, the family doesn't owe us £10. I need a credit note, not an un-payment.
  - There is no way to give goodwill credit, although the docs say there is.
  - I couldn't end a bursary: I clicked the bin and it stayed.
  - The billing run offered to bill £6,376.33 for a term that is already invoiced. I would have double-billed 27 families with one click.
- **Usability concerns:** No bulk reminders. Eight overdue invoices meant eight separate sheets. No on-screen aged debt.
- **Missing:**
  - Credit notes.
  - Payment on account.
  - Bank CSV import with matching.
  - Refund and void permissions separate from general admin.
  - A finance audit log I can read.
- **Opportunities to simplify:** Discounts should live on the family record, not inside the "Billing runs" sheet.

**Recommendations**
- **5 highest-priority improvements:**
  1. Credit notes and correct refund semantics.
  2. Billing-run duplicate guard.
  3. Fix discount ending.
  4. Bulk reminders.
  5. Bank reconciliation import.
- **Feature to simplify:** The "Retry" label. Rename it to "Show failed" until cards are connected.
- **Greatest-impact improvement:** Credit notes and adjustments that keep the ledger true.

**Adoption verdict**
- **Would I use it?** For invoicing and exports, yes. For refunds, no: I'd keep doing them in Xero.
- **Prefer to existing arrangements?** Partly.
- **Would I recommend it?** Not to another finance person yet.
- **What would prevent adoption:** D6 and D8. A ledger that can double-bill or misstate debt is a reputational risk with parents.
- **What would keep me using it:** The Xero export, the billing runs with pro-rata lines ("12 of 13 classes from 22 Oct"), and the family discount model once fixed.

**Scores (/10)**

| Measure | Score |
|---|---|
| Relevance | 9 |
| Quality of existing functionality | 5 |
| Completeness | 5 |
| Ease of use | 6 |
| Efficiency of everyday tasks | 4 |
| Overall usefulness | 6 |
| Likelihood of adoption | 4 |
| Likelihood of continued use | 5 |

**Overall: 5/10.** The ledger model in the database is better than the screens expose. Three money defects make it unsafe today.

*(Persona name is fictional.)*

### Persona 18: Reception / customer service, "Dev Bhattacharya" (simulated)

**User profile**
- **Role:** Front desk on weekday evenings and Saturday mornings. Answers the phone and the door, books trials, helps parents find things.
- **Background:** Drama graduate, 24, very comfortable on a phone and less so with dense desktop screens. Mostly uses the studio's tablet or own phone while standing at the desk.
- **Primary needs:** Instant look-up by name or phone number, quick trial booking, and the ability to answer "what time is…" and "have I paid?" in seconds.
- **Existing frustrations:** Callers who give only a surname or a mobile number. Writing enquiries on paper that never get typed up.

**Application experience**
- **First impressions:** ⌘K "Ask or jump" is great. Typing the mobile number 07911179639 found the Haddad family, and "nia" listed six Nias with their families.
- **Phone experience:** On the phone (390 px), People → search "Fenwick" → family took **3 taps**. It showed both guardians' numbers, the three children and their classes, and "£126.00 outstanding" (`admins-24-phone-family-lookup.jpg`), with no sideways scrolling.
- **Most valuable:**
  - Search by phone number.
  - The family panel.
  - The New enquiry sheet ("A phone call, an email or someone at the door").
  - The public trial link to text to callers.
- **Least valuable:** The board view of enquiries on the phone. It sensibly defaults to the list there.
- **Exceeded expectations:** The search admits what it can't do: "The studio assistant is not connected", instead of pretending.
- **Failed expectations:**
  - Search doesn't find enquiries. A caller who rang last week can't be found by name until they've booked a trial.
  - Booking a trial meant typing the parent's details a second time.
  - "INV-1065" also brought up the Rahman family.
  - Two "Sullivan family" results. Which one do I pick?
- **Usability concerns:** Booking a trial means leaving Enrolment and finding the class under Timetable → Classes. At the desk with a parent waiting, that's slow.
- **Missing:**
  - Enquiries in search.
  - Tap-to-call/email on the enquiry board cards.
  - A "which class suits a 7-year-old on Tuesdays?" finder.
  - Sending the trial confirmation by text. Not connected (R-003).
- **Opportunities to simplify:** One "New trial" button on Enrolment that asks the class and session and prefills from the enquiry.

**Recommendations**
- **5 highest-priority improvements:**
  1. Enquiry → trial prefill.
  2. Enquiries in ⌘K.
  3. Class finder by age and day.
  4. SMS/email confirmations.
  5. Duplicate-family warning.
- **Feature to simplify:** The pipeline "Move to" dropdown on every card. One action button would be enough.
- **Greatest-impact improvement:** Book a trial directly from an enquiry in one sheet.

**Adoption verdict**
- **Would I use it?** Yes, especially on the phone for look-ups.
- **Prefer to existing arrangements?** Yes, over the paper enquiry pad.
- **Would I recommend it?** Yes, with caveats.
- **What would prevent adoption:** Re-typing and no text confirmations.
- **What would keep me using it:** Search, and the parent-facing schedule that I can point parents to.

**Scores (/10)**

| Measure | Score |
|---|---|
| Relevance | 8 |
| Quality of existing functionality | 7 |
| Completeness | 5 |
| Ease of use | 7 |
| Efficiency of everyday tasks | 5 |
| Overall usefulness | 7 |
| Likelihood of adoption | 7 |
| Likelihood of continued use | 7 |

**Overall: 6.5/10.** Look-ups are fast and phone-friendly. Intake is clumsy.

---

## 6. Votes (machine-readable)

### Persona 16: School administrator

| Type | Item | Rating |
|---|---|---|
| Valuable | Session cancellation with parent notice | |
| Valuable | Today action queue | |
| Valuable | Requests inbox (medical updates) | |
| Valuable | Schedule clash detection | |
| Valuable | Move student keeps history | |
| Frustration | Edit student crash | |
| Frustration | Enquiry not linked to trial | |
| Frustration | Waiting list double offer | |
| Frustration | Move hidden behind withdraw | |
| Frustration | No audit trail view | |
| Missing | Edit student details (fix) | Essential |
| Missing | Enquiry-to-enrolment linkage | Essential |
| Missing | Audit trail view | Highly desirable |
| Missing | Bulk actions | Highly desirable |
| Missing | Class suitability info | Useful |
| Remove / simplify | Pipeline drag board | |
| Greatest impact | Enquiry-to-enrolment linkage | |

### Persona 17: Finance administrator

| Type | Item | Rating |
|---|---|---|
| Valuable | Accounting export | |
| Valuable | Aged debt export | |
| Valuable | Billing runs | |
| Valuable | Family discounts | |
| Valuable | Payment reminders | |
| Frustration | Refund reopens invoice as debt | |
| Frustration | Billing run double-bills | |
| Frustration | Cannot end family discount | |
| Frustration | No bulk reminders | |
| Frustration | No goodwill credit UI | |
| Missing | Refunds and credits | Essential |
| Missing | Billing-run duplicate guard | Essential |
| Missing | Bulk actions | Highly desirable |
| Missing | Bank reconciliation import | Highly desirable |
| Missing | Card payments | Highly desirable |
| Remove / simplify | Retry label on failed payments | |
| Greatest impact | Refunds and credits | |

### Persona 18: Reception

| Type | Item | Rating |
|---|---|---|
| Valuable | Global search | |
| Valuable | Family record look-up on phone | |
| Valuable | New enquiry capture | |
| Valuable | Public trial booking link | |
| Valuable | Parent schedule view | |
| Frustration | Enquiry not linked to trial | |
| Frustration | Enquiries not in search | |
| Frustration | Duplicate family records | |
| Frustration | Trial booking buried in class panel | |
| Frustration | No text/email confirmations | |
| Missing | Enquiry-to-enrolment linkage | Essential |
| Missing | Enquiries in search | Highly desirable |
| Missing | Class suitability info | Highly desirable |
| Missing | Email/SMS delivery | Highly desirable |
| Missing | Duplicate detection and merge | Useful |
| Remove / simplify | Pipeline Move-to dropdown | |
| Greatest impact | Enquiry-to-enrolment linkage | |

---

## 7. Group consolidated view

**Principal needs**
- Correct records that can be edited.
- One connected journey from enquiry to paying student.
- A ledger that never overstates debt.
- Fewer repeated actions.

**Most valuable functionality**
- Today queue.
- Session cancel/move/cover with instant parent visibility.
- Requests inbox.
- ⌘K search (including phone numbers).
- Xero and aged-debt exports.
- Billing runs with pro-rata lines.
- Phone-friendly family look-up.

**Frustrations**
- D1 edit-student crash.
- D3 enquiry/trial disconnect.
- D4 double offers.
- D6 refund semantics.
- D8 re-billing risk.
- D2 discount can't be ended.
- No bulk actions.

**Common themes**
- The **database is ahead of the UI**. Enquiry linkage, goodwill credit, payment on account and the audit log all exist in SQL but are not reachable or visible.
- **Actions are per-row only.**
- **Notifications are in-app only** (R-003).

**Missing functionality**
- Credit notes.
- Bulk reminders and messages from filtered lists.
- Audit history view.
- Duplicate detection.
- Bank reconciliation.
- Enquiries in search.
- Family notice on a class move.
- Make-up or credit on a cancellation.

**Adoption barriers**
- Inability to edit students.
- Money defects (D6, D8, D2).
- No email/SMS.
- No real sign-in (R-001) or card payments (R-006).

**Highest-priority improvements:** Fix D1 → fix D8 and D6 with credit notes → link enquiry/trial (D3) → safe waitlist offers (D4) → bulk reminders → audit history view.

**Disagreements within the group (kept)**
- Reception wants the board replaced by a list. The school administrator likes seeing stages at a glance but wants cards that move automatically.
- Finance wants refund/void restricted to an owner or finance role. The school administrator wants to resolve parent issues at the desk without waiting for the owner.
- Finance wants discounts on the family record. Admin is fine with them in Billing runs as long as they are visible on the family.

**Group scores**

| Measure | Score |
|---|---|
| Satisfaction | 5.5/10 |
| Adoption likelihood | 5.5/10 |
| Continued-use likelihood | 6.5/10 |

**Where our improvements could hurt other groups**
- Restricting refunds to the owner adds owner workload (owner group).
- Auto-notifying families on every move or offer could add noise for parents, so it needs notification preferences.
- Showing an audit history of medical edits must respect the teacher/office visibility split (safeguarding).
- Bulk messaging raises over-messaging risk for parents and needs quiet hours (already in `SET_QUIET`).

---

## 8. Candidate recommendations

### R1. Fix student editing (P0)
- **Screen:** `/people` student panel → Edit details (`components/app/people-sheets.tsx:131–200`, `lib/repos/people.ts:151`).
- **Problem:** Every edit crashes (D1).
- **Proposal:**
  - Coerce `date_of_birth` and `left_on` to strings: `to_char(s.date_of_birth,'YYYY-MM-DD')` in `STUDENT_DETAIL`, or `String()` / an `isoDate()` helper in the sheet.
  - Add a regression test that opens the sheet for a seeded student.
  - Show DOB with the year in the panel.
- **User story:** As an administrator, I want to correct a child's details, so that registers, ages and safeguarding records are accurate.
- **Workflow:** Student → Edit details → change → Save → confirmation → the panel shows the new values.
- **Business rules:**
  - DOB can't be in the future.
  - A change of name or DOB is logged in `audit_log`.
- **Edge cases:** Null `left_on`; a student with no family; a date at a timezone boundary.
- **Groups:** admins, owners. **Personas:** 16, 18.
- **Complexity:** XS.
- **Dependencies:** None.
- **Risks:** Other `.slice` calls on dates. Grep `date_of_birth?.slice` and `_on?.slice`.
- **Acceptance criteria:**
  1. Edit details opens for every seeded student.
  2. Saving a new DOB updates the age shown in the list.
  3. No console errors.

### R2. Credit notes and correct refund semantics; expose goodwill credit (P1)
- **Screen:** Invoice panel (`app/billing/page.tsx:408–445`, 528–540); `app.refund_payment`, `app.record_payment` (0016).
- **Problem:** A refund reopens the invoice as overdue (D6). Goodwill credit has no UI (D7).
- **Proposal:**
  - Add "Adjust / credit note" on an invoice: a negative line with a reason that reduces the total and keeps status Paid if fully covered.
  - Split the refund flow into two choices:
    - "Return money and reduce what they owe" (credit note plus refund).
    - "Return an overpayment" (refund only).
  - Add "Add credit to account" (`method='credit'`, `p_invoice null`) and "Payment on account" in Record payment.
  - Show family credit on the People family panel.
- **User story:** As a finance administrator, I want to refund or credit a family for a cancelled lesson, so that the ledger shows they owe nothing and they aren't chased.
- **Workflow:** Invoice → Credit/Refund → choose type → amount, reason → (if money returned) method → Save → invoice Paid, family balance shows any credit.
- **Business rules:**
  - Credit notes can't exceed the invoice total.
  - Refunds can't exceed money received.
  - Card refunds still come from the provider.
  - Every credit or refund needs a reason and is audited.
- **Edge cases:** Partial-paid invoices; credit larger than open balance (held on account); voided invoices.
- **Groups:** admins, owners, parents (they see a credit line). **Personas:** 17, 16.
- **Complexity:** M.
- **Dependencies:** Xero export must include credit notes (`XERO_EXPORT`).
- **Risks:** Ledger maths. Extend the existing billing tests.
- **Acceptance criteria:**
  1. A £10 credit note on a £54 paid invoice leaves it Paid, with family credit £10 or refunded £10.
  2. No Chase entry is created.
  3. Credit appears in the Xero CSV.

### R3. Billing-run duplicate guard (P1)
- **Screen:** Billing runs (`components/app/billing-run.tsx`; `app.billing_lines`, `app.create_billing_run`, 0039).
- **Problem:** A run proposed £6,376.33 for a term already invoiced (D8).
- **Proposal:**
  - Before raising, detect families with any non-void invoice issued in the term window that has tuition/term-fee lines not linked to a class.
  - Warn: "27 families already have an invoice dated in this term (30 invoices, £…). Exclude them / Include anyway".
  - Let New invoice optionally link tuition lines to a student and class.
- **User story:** As a finance administrator, I want the run to warn me about families already invoiced, so that nobody is double-billed.
- **Workflow:** Open run → warning panel listing families → choose exclude (default) → raise drafts.
- **Business rules:** The default is to exclude. "Include anyway" requires a typed confirmation.
- **Edge cases:** Monthly classes; families who joined mid-term; imported invoices.
- **Groups:** admins, owners. **Persona:** 17.
- **Complexity:** S–M.
- **Dependencies:** Data import (0027) should set the class link.
- **Risks:** False positives for non-tuition invoices.
- **Acceptance criteria:** On seeded data the run lists 27 families as "already invoiced" and raises 0 by default.

### R4. Fix ending a family discount; show discounts on the family record (P1)
- **Screen:** `billing-run.tsx:269–340`; `billing.ts:144–151`; 0039:37.
- **Problem:** End doesn't work, fails silently, and the list ignores `deleted_at` (D2).
- **Proposal:**
  - Use `set ends_on = current_date - 1` (or a security-definer `app.end_family_discount`) instead of an RLS-hiding soft delete with RETURNING.
  - Filter `deleted_at is null`.
  - Render `end.error`.
  - Show active discounts on the family panel with an End button.
- **User story:** As a finance administrator, I want to end a bursary on a date, so that the next run charges the full price.
- **Business rules:**
  - Ending sets an end date. History is kept.
  - Runs for periods after the end date don't apply it.
- **Edge cases:** An end date in the past; two discounts of the same kind.
- **Groups:** admins, owners. **Persona:** 17.
- **Complexity:** XS–S.
- **Acceptance criteria:**
  1. After End, the discount disappears from the active list.
  2. The run preview drops "15% discount".
  3. An error is shown if the write fails.

### R5. Link enquiry → trial → enrolment (P1)
- **Screen:** `/enrolment` Board/List (`app/enrolment/page.tsx:30–80`), `BookTrialSheet` (`enrolment-actions.tsx:225`), `app.book_trial` (0023:63), `app.convert_trial` (0015:143).
- **Problem:** Re-typing, and stale pipeline stages (D3).
- **Proposal:**
  - Add a "Book trial" action on each enquiry card or row. It opens the trial sheet with class and session chosen and child and contact prefilled, and passes `enquiry_id`.
  - Trial outcome updates the enquiry stage (Came → Tried a class; Joining → Enrolled; No show → Follow up).
  - Open an enquiry detail panel on click, with notes and tap-to-call/email.
  - Include enquiries in ⌘K search.
- **User story:** As reception, I want to book a trial from an enquiry without re-typing, so that the pipeline and funnel stay accurate.
- **Workflow:** Enquiry card → Book trial → pick session → Book → card moves to Trial booked → Came/Joining moves it on.
- **Business rules:**
  - An enquiry can have at most one active trial.
  - The trial carries `enquiry_id`.
  - A manual stage move still works.
- **Edge cases:** Enquiry without DOB (prompt for it); enquiry for an existing family (offer an existing-child choice); a cancelled session.
- **Groups:** admins, owners. **Personas:** 16, 18.
- **Complexity:** S. The backend already supports it.
- **Acceptance criteria:**
  1. A new enquiry booked via its card needs 0 re-typed fields.
  2. The card is in Trial booked.
  3. The funnel's "Trials booked" increments.
  4. After Joining, the card is in Enrolled.

### R6. Safe waiting-list offers (P1)
- **Screen:** `WaitlistActions` (`enrolment-actions.tsx:186`); `offer_waitlist_place` (0015:51), `withdraw_enrolment` auto-offer.
- **Problem:** Double offers, and offers on a full class (D4).
- **Proposal:**
  - Free places = capacity − active − outstanding offers.
  - Disable Offer when free places ≤ 0, with the explanation "No free place — 1 offer already out".
  - Auto-offer only when free places > 0.
  - Show the offer expiry ("expires Mon 30 Nov").
  - Exclude enrolled and already-waiting children, and children outside the age range (with an override), from the add picker.
  - Renumber positions after take-up.
- **User story:** As an administrator, I want only as many offers out as there are places, so that no family is promised a place that doesn't exist.
- **Business rules:**
  - Offers expire after N days and then pass to the next family.
  - "Took it" without an offer requires a note.
- **Edge cases:** Capacity reduced while offers are out; a sibling-priority policy.
- **Groups:** admins, parents. **Persona:** 16.
- **Complexity:** S.
- **Acceptance criteria:**
  1. With a full class, Offer is disabled.
  2. Freeing one place with one outstanding offer creates no new offer.
  3. Accepting never fails with "class full" for an offered family.

### R7. Bulk actions: reminders and messages from filtered lists (P2)
- **Screen:** `/billing` invoice list; `/people`.
- **Problem:** 4 interactions × N overdue invoices; no filters beyond name search.
- **Proposal:**
  - Checkboxes plus "Send reminder to selected" (template, per-family merge).
  - People filters by class, balance, medical alert, has-login and status; "Message selected".
- **Groups:** admins. **Personas:** 17, 16.
- **Complexity:** M.
- **Acceptance criteria:**
  1. Selecting 8 overdue invoices sends 8 reminders in ≤ 4 interactions.
  2. Each is logged in the family's history.

### R8. Record history (audit trail) on family, student and invoice (P2)
- **Screen:** People panels and invoice panel; `audit_log`.
- **Problem:** Changes are recorded but invisible to the office.
- **Proposal:**
  - A "History" section reading `audit_log` for the entity: who, when, summary.
  - Medical-detail diffs visible to the office only.
- **Complexity:** S–M (RLS read policy for admins).
- **Groups:** admins, owners, safeguarding.
- **Acceptance criteria:** Editing a guardian phone number shows "Nadia Okafor changed phone · 27 Nov 14:02".

### R9. Move student as a first-class action with notice and billing hint (P2)
- **Screen:** Roster row and student panel; `app.transfer_enrolment` (0023:307).
- **Problem:** Hidden behind Withdraw; no age, price or family notice.
- **Proposal:**
  - A separate "Move" icon or menu item.
  - Picker shows ages, price and free places, and excludes the current class.
  - Optional effective date.
  - Option to tell the family (in-app notice).
  - Show the price difference and an "adjust invoice" shortcut.
- **Complexity:** S.
- **Persona:** 16.

### R10. Cancellation follow-ups: trial families, make-up or credit (P2)
- **Screen:** Session sheet; `app.cancel_session` (0023:175).
- **Problem:** Trial families aren't notified (D5), and there's no compensation path.
- **Proposal:**
  - Announce before cancelling the trials.
  - List affected trials with "Rebook".
  - After cancelling, offer "Add a make-up session" or "Credit each family £x" (uses R2).
- **Complexity:** S (fix) + M (credit).
- **Persona:** 16.

### R11. Small correctness fixes (P3)
- **Items:**
  - D9: block outcomes before the session.
  - D11: Today failed-payment label.
  - D12: "no registers%".
  - D13: explain funnel denominators.
  - D14: family panel invoice status.
  - D15: duplicate-family warning on create (match by guardian email or phone).
- **Complexity:** XS each, except duplicates (S).

---

## 9. Feature rationalisation (office area)

| Feature | Verdict | Reason |
|---|---|---|
| Today action queue | **Retain** | Highest-value office screen; fix the D11 label |
| Session cancel / move / cover | **Retain** | Fast and visible to parents; fix D5 |
| Requests inbox | **Retain** | One-click acknowledge-and-record |
| ⌘K search | **Refine** | Add enquiries, fix the invoice-number false positive |
| Pipeline board | **Refine** | Make cards actionable and auto-advancing; list as default for reception |
| Enquiry → trial | **Redesign** | One connected record (R5) |
| Waiting list | **Refine** | Capacity-aware offers, expiry visible (R6) |
| Move student | **Refine** | Separate action, notice, age and price (R9) |
| Student edit | **Refine** (fix) | P0 crash (R1) |
| Refunds | **Redesign** | Credit-note model (R2) |
| Goodwill credit / payment on account | **Add** (UI only) | Backend exists |
| Family discounts | **Refine and consolidate** | Fix End; show on the family record (R4) |
| Billing runs | **Refine** | Duplicate guard (R3); turn sibling rules on during setup |
| "Retry" failed payments | **Remove / relabel** until cards are connected | Misleading |
| Exports (Xero, aged debt, CSVs) | **Retain** | Works; add an on-screen aged-debt table |
| Bulk actions | **Add** | Biggest efficiency gain (R7) |
| Audit history view | **Add** | Data already recorded (R8) |
| Duplicate detection / merge | **Add** (P3) | Seed already shows duplicate-looking families |
| Term rollover | **Refine** | Let the term be created inline instead of a dead-end message |
| Studio Pulse (Reports) | **Defer** | "Needs 180 days of history"; low value for the office today |
