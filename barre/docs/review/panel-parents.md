# Panel report: Parents and guardians (group "parents")

> **Simulated panel.** These findings are professional judgement written in the voices of simulated parents. They are not real user research. Every behaviour claimed below was either driven in the browser (Playwright, Chromium) against the static preview build, or checked in the code and marked **(code-verified)**. All data is synthetic, and nothing outbound (payments, email, SMS, push) is connected.

---

## 1. Method and limitations

**What was driven**
- Build: static preview at `http://127.0.0.1:8080/General/studio-next/`, with in-browser PGlite seeded as "Northstar Dance Academy". Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/parents/` (`s1`–`s6.cjs`).
- Accounts:
  - Hannah Wright (guardian, three children: Amir 15, Nia 9, Clara 5)
  - Joseph Adeyemi and Clare Doherty (guardians, used for payments and home only)
  - Nadia Okafor (admin): used to create the real-world triggers (bill event fees, cancel a session, invite a second guardian)
  - Priya Raman and Marcus Bell (teachers): used to check whether a parent's absence report reaches the teacher
  - A new second guardian, "Daniel Wright", created through the real invitation flow
- Admin and parent actions ran in the **same browser context**, so they shared one database: what the office did was then seen as the parent.
- Viewports: phone 390×844 (isMobile, touch) for everything. One desktop check at 1440×900 (`/family`, `/family/children`). A large-text check on the phone: the root font size was raised to 24px and the computed sizes were measured.
- Timings are wall-clock times measured by the script, including deliberate 600–800 ms waits. They are not human task times. Interaction counts are the clicks and fills the script performed.

**What could not be tested here**
- Card or Apple Pay (R-006 not connected; the UI says so honestly).
- Email, SMS and push delivery (R-003): only the in-app bell and notices could be observed.
- Real sign-in and password creation (R-001): the demo accept flow creates a session directly.
- Calendar subscription: in the demo the link is "made but not served". The `.ics` download button exists, but the file was not imported into a calendar app.
- Offline behaviour: the demo database is local, so it always "works offline". ARCHITECTURE.md describes an offline queue for **registers only**. The hosted parent screens would presumably need a connection (unverified assumption).
- Ticket booking and costume sizes: the seeded events have no ticket types or costumes for the Wright children, so neither section rendered.
- Real accessibility testing with assistive technology was not done. Only font scaling was measured.
- Seed realism: Hannah has one historical invoice (£54 for three children and 11 weekly classes). Payment-history findings are limited by that.

---

## 2. Scenario results

### Scenario 8: Register two children for different classes
- **Persona:** 7 (Hannah, three children). **Objective:** get Nia and Clara each into an additional class. **Start:** `/family/children`.
- **Outcome:** **Completed with minor friction**
- **Steps (8 interactions, 11.7 s script time):**
  1. Tap "Classes and trials" under Nia.
  2. All age-suitable classes already show "Nia is in this class", so tap "Show 8 more for other ages".
  3. Tap "Ask for a place" (the first one offered was **Pre-School Ballet, ages 3–5**, for a 9-year-old).
  4. Close.
  5. Tap "Classes and trials" under Clara.
  6. Tap "Show 10 more for other ages".
  7. Tap "Ask for a place" on Modern Juniors (ages 6–9, Clara is 5).
  8. Close.
- **Difficulties:**
  - It is a *request*, not a booking ("The office will confirm, and you'll get a notification"). That is honest, but parents used to instant online booking may not expect it.
  - Each child is handled in a separate sheet. There is no family basket and no combined total cost.
  - The "other ages" list lets a parent request a class outside the age range with no warning (shot `parents-01-ask-place-nia.jpg`).
- **Unnecessary steps:** reopening the sheet for each child.
- **Missing:**
  - A summary of what the new class adds to the termly bill (prices are shown per class, e.g. "£46.00 a term").
  - Sibling discount information.
  - Start date and pro-rata information.
- **Defects:** D10 (age range not enforced or warned).
- **Clarity of outcome:** good. The inline confirmation is clear, and the class then shows "Asked. The office will be in touch." The request appeared in the admin `/requests` with a "Give them a place" button.
- **Satisfaction:** 4/5.
- **Suggestions:** warn on out-of-age requests; show the projected termly total; let the parent request for several children in one flow.

### Scenario 9: See the complete family schedule for the coming week
- **Persona:** 7. **Start:** `/family`.
- **Outcome:** **Successfully completed**
- **Steps (1 interaction):** open `/family`. Each child has a block for "this week" (Amir 3, Nia 5, Clara 2 classes). Cover changes and cancellations are flagged inline. `/family/schedule` (1 tap) gives four weeks in date order, with each row prefixed by the child ("Nia · Jazz Intermediate").
- **Difficulties:**
  - On the phone, the home screen is a long scroll for three children (shot `parents-07b-home-amount-due.jpg`).
  - Schedule has no per-child filter and no compact week grid.
  - Events and rehearsals (exam, competition, private lesson) are **not** in the weekly schedule. Nia's confirmed private lesson on Monday 30 Nov at 16:00 appears only under Events.
- **Missing:** a merged schedule of classes, privates, rehearsals and events; a per-child filter.
- **Clarity:** high. Cancelled sessions are struck through with a reason; cover is labelled "(cover)".
- **Satisfaction:** 4/5.
- **Suggestions:** merge confirmed events and privates into the schedule; add child filter chips.

### Scenario 10: Understand an unexpected payment request
- **Persona:** 8 (competitive dancer) and 9 (low tech confidence). **Trigger:** the admin pressed "Bill the fee" on the RAD Grade 3 exam (£62) and the Thames Valley Dance Festival (£35). **Start:** `/family`.
- **Outcome:** **Partially completed.** The parent can see what is owed and why, but cannot pay in the app and has no bank details to pay by transfer.
- **Steps (2 interactions):**
  1. Home shows a "DUE 9 DEC · £97.00 to pay · 2 invoices · INV-1076, INV-1071" notice.
  2. Tap it, or "Pay £97.00", to reach `/family/payments`. That page shows a ledger per invoice, grouped by child: "NIA · RAD Grade 3 Ballet examinations — Nia £62.00".
- **Difficulties:**
  - **No notification** was raised when the invoices were issued. The bell said "Nothing new" (D6).
  - The "Pay £97.00" button only navigates; there is no payment action on the next page (D5).
  - "How to pay → Bank transfer" shows a reference only (INV-1076). There is **no payee name, sort code or account number** (D4).
  - Two invoices need two separate transfers ("pay each invoice with its own number").
  - The card option says it "Opens here once the studio connects its payment provider" (honest, but a dead end).
- **Missing:**
  - Receipts or PDF downloads.
  - Full history: the list is labelled "Latest eight".
  - A combined payment for several invoices.
  - Explanation of *why* a charge was raised: there is no link from the invoice line to the event.
- **Defects:** D4, D5, D6. Shots `parents-09-payments-due-phone.jpg`, `parents-07b-home-amount-due.jpg`.
- **Clarity:** what the charge is for: good. How to pay: poor.
- **Satisfaction:** 2/5.

### Scenario 11: Report that a child will miss a class
- **Persona:** 6 and 7. **Start:** `/family/children`.
- **Outcome:** **Completed with significant friction.** The parent flow is easy, but the message does not reach the teacher, despite the confirmation saying it will.
- **Steps (5 interactions, 2.7 s):**
  1. Tap "Report an absence" under Nia.
  2. Set the date (defaults to today) to 1 Dec.
  3. Type the reason.
  4. Send.
  5. Done.
- **Result:** "Sent. The studio has been told. Your message is in Nia's file. **The teacher will see it before class.**"
- **What actually happens:**
  - The report is a `direct` family message: "Absence: Nia — Tuesday 01 Dec — Dentist appointment after school". It appears in the admin `/inbox`.
  - Priya Raman teaches Nia's Modern Juniors that day. Her `/teach` card shows "12 booked" with no absence. Her `/teach/messages` has no absence. The register for that session shows Nia with plain Here / Absent buttons and no note (shot `parents-18-register-no-reported-absence.jpg`). This is defect D2.
- **Difficulties:**
  - You cannot pick which class. On 1 Dec Nia has two classes (Modern Juniors at 16:00 and Grade 2 Ballet at 17:30).
  - No date range for holidays.
  - Nothing stops you choosing a date with no class.
- **Missing:** link to the session and register as "expected absent / excused"; multi-day absence; class picker; credit or make-up eligibility.
- **Satisfaction:** 3/5 (the parent believes it worked).

### Scenario 12: Review the child's latest feedback
- **Persona:** 6. **Start:** `/family`.
- **Outcome:** **Completed with minor friction**
- **Steps (2 interactions):** home shows "Latest feedback" (a quote from Freya about Nia). Tapping "All feedback" opens `/family/feedback` on the **first child tab (Clara), which shows "No notes yet"**. You must tap "Nia" to see the note, the "To work on" line, skills (all "0 of 9 assessed"), milestones (25 classes) and goals.
- **Difficulties:**
  - "All feedback" is not linked to the child the feedback was about (D14).
  - Skills grids with nothing assessed take a lot of space, and the meaning of "Developing · secure · mastered … a count of eight" is unclear.
- **Missing:** a notification on new feedback. The settings have a "Progress" category, but no notification arrived in the session, which was not driven by a teacher, so delivery is unverified.
- **Satisfaction:** 4/5. Shot `parents-04-feedback-nia.jpg`.

### Scenario 13: Receive a last-minute cancellation notification
- **Persona:** 6 and 9. **Trigger:** the admin cancelled Clara's "Primary Ballet on Monday 30 November at 17:00" ("Heating failure in Studio One", "Cancel and tell 12 families").
- **Outcome:** **Completed with minor friction.** In-app only; email, SMS and push were not verifiable.
- **Observed:**
  - Bell: "CLASS CHANGE · Today · Cancelled: Primary Ballet on Monday 30 November at 17:00 · Sorry — … is cancelled (Heating failure in Studio One)".
  - Home notice "NEW Cancelled: …".
  - Clara's row struck through: "CANCELLED · Heating failure in Studio One".
  - `/family/messages` Class notices tab carries the same message.
  - Shots `parents-07-home-cancel-notice.jpg`, `parents-08-bell-after-cancel.jpg`.
- **Difficulties:**
  - The cancellation appears as a generic "NEW" notice. The "CHANGED/Moved" treatment used for cover and moves excludes cancellations (`src/app/family/page.tsx` changeNotices skips `status === 'cancelled'`), so the most urgent change is styled the same as "Summer show — save the date".
  - The notice names the class but not the child.
  - Notification settings say "Class changes: always on", and email and phone "start once connected". So **today a parent who is not looking at the app gets nothing.**
- **Satisfaction:** 3/5.

### Scenario 14: Two guardians need appropriate access to the same child
- **Persona:** 10 (shared care). **Start:** admin `/account` → Invite → Parent → Wright family.
- **Outcome:** **Partially completed**
- **Steps:**
  1. Admin invites `second.wright@example.com`. That address belongs to Inês Wright, who is already on the family record with no login.
  2. Open the link, enter a name, and tap "Accept and join". This **fails**: "Something went wrong — only the office can change who is linked to a family" (D1, shot `parents-10-invite-accept-error.jpg`).
  3. Admin invites a *new* address (`daniel.wright@example.com`). Accepting works and lands on `/family`.
- **What the second guardian sees and can do (driven as Daniel):**
  - Every invoice and the balance.
  - **Every private message Hannah has sent the studio**, including "Absence on Monday" and "New inhaler — please update her record" (shot `parents-15-messages-shared-family-thread.jpg`).
  - Medical alerts, emergency contacts, and Hannah's phone and email.
  - Daniel **edited Hannah's email address** to `hannah-changed-by-daniel@example.com` and the change saved (D3, shot `parents-11-coparent-edits-other-guardian.jpg`).
- **Model (code-verified):**
  - `student.family_id` is a single family, and `guardian` rows belong to a family (`0002_core.sql`).
  - Access is all-or-nothing per family through `app.guardian_family_ids()` (`0006_rls.sql:52`).
  - The `guardian.receives_billing` and `is_primary` columns exist but drive nothing in the parent UI or invoicing.
  - There are no per-guardian visibility settings, no split billing, and no "do not release to / contact restriction" record.
- **Satisfaction:** 1/5 for a separated family; 3/5 for a two-parent household.

### Scenario 15: Understand all upcoming dance-related expenses
- **Persona:** 8. **Start:** `/family`, then `/family/payments` and `/family/events`.
- **Outcome:** **Unable to complete** as one view; the parent can only piece it together.
- **Observed:**
  - Payments shows only *issued* invoices: £97 after billing, £0 before.
  - Events lists per-event costs: private lesson £30 (Confirmed), workshop £25 (Requested), exam £62 (Confirmed), competition £35 (Confirmed), show £18.
  - The **confirmed £30 private lesson never became an invoice and is not shown as owed** anywhere.
  - Termly class fees for next term are not forecast.
  - No costume costs or ticket purchases are visible for this family.
  - Confirmed entries for the exam and competition **do not say which child** (shot `parents-13-events-confirmed-no-child-name.jpg`, D8).
  - "Places 1 of 14" is shown to the parent while the office sees "6 going" (D7).
- **Missing:** an "Upcoming costs" ledger (confirmed but not yet invoiced, plus expected term fees, costumes, tickets and entries) with dates; a per-child breakdown.
- **Satisfaction:** 2/5.

**Outcome counts:**

| Outcome | Count |
|---|---|
| Successfully completed | 1 |
| Completed with minor friction | 3 |
| Completed with significant friction | 1 |
| Partially completed | 2 |
| Unable to complete | 1 |

---

## 3. Feature status (parent area)

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Family home: week per child, notices, balance, latest feedback | `/family` (`src/app/family/page.tsx`) | Fully implemented & tested | Driven; three children rendered with cover and cancel states |
| Four-week family schedule | `/family/schedule` | Fully implemented & tested | Child-prefixed rows; no events or privates merged |
| Calendar subscription (webcal) | `calendar-subscribe.tsx` | Implemented, not testable | "In this demo the link is made but not served" |
| Calendar .ics download | same | Implemented, not testable (file not imported) | Button present |
| Children: classes, attendance, photo consent, medical alert, emergency contacts | `/family/children` | Fully implemented & tested | Driven |
| Request a class place / trial / waiting list | `family-classes.tsx`, `app.request_class_place` | Partial | Works as a request; no age warning (D10); no cost summary |
| Add a child | `AddChildSheet` | Implemented, not driven | Code present |
| Report an absence | `AbsenceDialog`, `F.REPORT_ABSENCE` | Defective | Does not reach teacher or register (D2) |
| Payments: balance, ledger by child, history | `/family/payments` | Partial | No receipts, no full history ("Latest eight"), no bank details (D4) |
| Card / Apple Pay | `HowToPay`; PAYMENTS.md | Implemented, not testable (R-006) | Honest placeholder text |
| Bank transfer instructions | `HowToPay` | Defective | Reference only, no payee or account (D4) |
| Discounts / credit on account | Ledger (negative lines), "In credit" state | Implemented, not testable (no seeded discount for this family) | Code |
| Invoice-issued notification | `notify_*` | Missing | Bell empty after `bill_event` (D6) |
| Messages to studio and replies | `/family/messages` | Fully implemented & tested | Thread visible; shared by all guardians |
| Class notices | `/family/messages` tab | Fully implemented & tested | Cancellation notice received |
| In-app notification bell | `notifications.tsx` | Fully implemented & tested | Cancellation arrived |
| Notification preferences (in-app / email per category, digest, quiet hours) | `notification-settings.tsx`, `0028_comms.sql` | Implemented, not testable (email/push not connected) | Screen driven, shot 05 |
| Email / SMS / push delivery | R-003 | Missing (pending decision) | Settings text says so |
| Events: list, request, invite answer, cost | `events-view.tsx` | Partial | Child not named; places count wrong (D7, D8) |
| Costume sizes / tickets | `show-tools.tsx` | Implemented, not testable (no seed data for this family) | Code |
| Consent forms (beyond photo consent) | – | Missing | Only "Photos: Permitted / Not permitted" shown, read-only |
| Emergency contacts (add/edit/remove) | `family-details.tsx` | Fully implemented & tested (viewed; office notified on change, code) | Driven view |
| Medical info update | via `/family/enquiries` "tell the studio" | Partial (deliberate, audit-friendly) | Request appears in admin `/requests` with "Acknowledge & add to record" |
| Enquiries / requests | `/family/enquiries` | Fully implemented & tested | Statuses "Waiting on the studio" / "Answered" |
| Feedback, skills, milestones, goals, timeline | `/family/feedback` | Fully implemented & tested (sparse data) | Driven |
| Practice log | `PracticeLog` on children page | Implemented, not driven | Visible |
| Second guardian invite | `/account` invite, `app.accept_invitation` | Defective (existing row) / Partial (new email) | D1, D3 |
| Per-guardian visibility / split billing | – | Missing | `receives_billing` unused |
| Large-text support | global CSS | Partial | px font sizes ignore root font size; pinch-zoom allowed |

---

## 4. Defects found

**D1 (High): A second guardian already on the family record cannot accept their invitation**
- Repro:
  1. Admin `/account` → Invite → Parent → Wright family → email `second.wright@example.com`, the email of existing guardian row "Inês Wright".
  2. Open the link → enter a name → Accept and join.
- Expected: the login is linked to the existing guardian row.
- Actual: "Something went wrong — only the office can change who is linked to a family".
- Cause (code-verified):
  - `app.accept_invitation` runs `update guardian set user_id = me` for a matching unlinked row (`src/lib/db/migrations/0019_platform.sql:640-643`).
  - Trigger `guardian_self_edit_guard` rejects any `user_id` change when `auth.uid()` is not an admin (`0023_operations.sql:333-344`).
- Every family whose second parent the office entered first (the seed has these on every other family) hits this.
- Shot: `parents-10-invite-accept-error.jpg`.

**D2 (High): A reported absence never reaches the teacher or the register, despite the confirmation promising it**
- Repro: as Hannah, `/family/children` → Report an absence (Nia, 1 Dec) → Send. Then as Priya, `/teach` (Modern Juniors, Tue 1 Dec) → Open register.
- Expected: Nia is shown as reported absent (or pre-marked excused), with the note.
- Actual: no indication on the card, the register or `/teach/messages`. The note exists only as a family message in the admin `/inbox`.
- Code: `src/lib/repos/family.ts:94-101` inserts a `communication` row only. The dialog text "The teacher will see it before class" is in `src/app/family/children/page.tsx` (AbsenceDialog).
- Shot: `parents-18-register-no-reported-absence.jpg`.

**D3 (High, privacy and safeguarding): Any guardian can edit any other guardian's name, email and phone in the family**
- Repro: as second guardian Daniel, `/family/children` → Your details → "Edit Hannah Wright" → change email → Save. The change persists.
- Expected: a guardian edits only their own details; changes to others go through the office.
- Code:
  - `F.UPDATE_GUARDIAN` (`family.ts:108`) and the edit button for every row (`family-details.tsx:42`).
  - RLS `guardian_self_update` is family-wide (`0006_rls.sql:166`).
  - The guard's comment says parents must not "make themselves primary", but it only checks `user_id`, `family_id`, `studio_id` and `deleted_at`. `is_primary` and `receives_billing` are not guarded (code-verified, not driven).
- In a contested separation, one parent could redirect the other's contact details.
- Shot: `parents-11-coparent-edits-other-guardian.jpg`.

**D4 (Medium): Bank transfer instructions give no payee, sort code or account number**
- Repro: have an unpaid invoice, then open `/family/payments` → How to pay.
- Expected: the studio's bank details, or at least a pointer to them.
- Actual: only the reference (e.g. "INV-1071") with a Copy button.
- Code: `src/app/family/payments/page.tsx` `HowToPay`.
- Shot: `parents-09-payments-due-phone.jpg`.

**D5 (Medium): "Pay £97.00" button does not pay**
- The home primary button links to `/family/payments`, which has no pay action while card payments are not connected.
- Expected: a label such as "See how to pay", or a working payment.
- Code: `src/app/family/page.tsx` (Payments section).

**D6 (Medium): No notification when an invoice is issued**
- Repro: admin `/events` → Thames Valley → Bill the fee. Then as Hannah, open the bell.
- Expected: "New invoice INV-1071 £35 due 16 Dec".
- Actual: "Nothing new". The only signals are the home notice and the balance.
- The settings expose a "Payments: invoices and payment problems" category.

**D7 (Medium): The event "Places" count shown to parents counts only their own family**
- Hannah sees "RAD Grade 3 … Places 1 of 14". Admin `/events` shows "6 going".
- Code: `src/lib/repos/hub.ts:82-83` counts `event_participant` under RLS (`participant_family_read`). The `full` flag in `events-view.tsx` uses this count, so "This one is full" may never show to parents.

**D8 (Medium): Event status is per family, not per child**
- `my_status` and `my_student` use `limit 1` (`hub.ts:84-87`). With two children entered, one status is shown, picked arbitrarily.
- The confirmed exam and competition do not name the child (shot `parents-13-events-confirmed-no-child-name.jpg`).

**D9 (Medium): A confirmed priced private lesson is not reflected anywhere financially**
- "Private lesson — Nia · Confirmed · Cost £30.00" appears in Events, but there is no invoice, no pending charge and no balance change. The parent cannot tell whether or when they will be charged.

**D10 (Low): Out-of-age class requests are offered with no warning**
- Nia (9) could "Ask for a place" in Pre-School Ballet (ages 3–5) after "Show 8 more for other ages".
- File: `src/components/app/family-classes.tsx`.
- Shot: `parents-01-ask-place-nia.jpg`.

**D11 (Low): The absence form cannot target a class or a date range, and accepts days with no class**
- The date defaults to today. On a day with two classes, it is ambiguous which one is meant.

**D12 (Low, accessibility): Text does not scale with the browser or OS font-size setting**
- With the root font size at 24px, measured sizes stayed at 12/13/15px, because sizes are fixed pixels (e.g. `text-[13px]`).
- Pinch-zoom is allowed (viewport meta has no `maximum-scale`), which mitigates this.

**D13 (Low, content and seed): The same show has contradictory dates**
- The notice says "Summer show — save the date … Saturday 11 July at the Greenwich Theatre".
- Events says "Summer Show — Greenwich Theatre · Thursday 14 January".
- This is seed data, but nothing links a notice to its event, so parents cannot reconcile them.

**D14 (Low): "All feedback" opens the first child, not the child the feedback was about**
- From home (feedback about Nia), `/family/feedback` opens on Clara ("No notes yet").

---

## 5. Individual panel member reports

### Persona 6: Kemi, mother of a 5-year-old in Pre-School/Primary Ballet and Junior Tap

**User profile**
- Hospital pharmacist on rotating shifts.
- First child, first activity.
- Uses an iPhone constantly, but in two-minute bursts between tasks.
- Tech confidence: high.
- Needs: to know the class is on, what to bring, that her daughter is happy, and that the teacher knows about her daughter's needs.
- Frustration today: WhatsApp groups where the one message that matters is buried under 40 "thank you"s.

**Application experience**
- **First impressions:**
  - `/family` is calm and readable.
  - My daughter's week is right there, and the cancelled Monday class is struck through with the reason "Heating failure in Studio One". That is exactly what I want at 3pm on a shift.
  - The bell held the same message with an apology.
- **Most valuable:**
  - The cancellation showing in three places (bell, notice, class row).
  - Cover teacher labelled "(cover)".
  - The "Shows and events" entry point.
  - Being able to read the class notices without a group chat.
- **Least valuable for me:** the empty skills grids ("0 of 9 assessed") on `/family/feedback` for a five-year-old. They read like a report card she is failing.
- **Exceeded expectations:** the honest copy everywhere: "Email starts once the school connects an email service", "Nothing is booked until they do".
- **Failed expectations:**
  - I reported an absence and was told "The teacher will see it before class". The teacher's register showed nothing (D2). If I had said "she's had a tummy bug, please watch her", the teacher would never know.
  - Today a cancellation only reaches me if I open the app. There is no email or push yet.
- **Usability concerns:**
  - The cancellation notice looks the same as "save the date". It does not say *which of my children* or "today/Monday" in bold.
  - The Messages "The studio" thread mixes my enquiries with real conversations.
- **Missing:** a push or SMS for same-day cancellations; a "what to bring / what to wear" note per class; photo consent I can change myself (currently read-only "Permitted").
- **Simplify:** hide skills that have not been assessed for young children; show milestones instead.

**Recommendations**
1. Make absence reports reach the register.
2. Push or SMS for same-day cancellations.
3. Treat cancellations as urgent notices that name the child.
4. Let me manage photo and other consents.
5. Add a "what to bring" note on each class.
- Remove or simplify: empty skills grids for under-7s.
- Greatest impact: urgent cancellation delivery outside the app.

**Adoption verdict:** I would use it, and prefer it to WhatsApp for notices. I would recommend it once notifications actually leave the app. What would stop me: missing a cancellation because I didn't open it. What would keep me: the calm weekly view.

**Scores:**

| Measure | Score /10 |
|---|---|
| Relevance | 8 |
| Quality of existing functionality | 7 |
| Completeness | 5 |
| Ease of use | 8 |
| Efficiency of everyday tasks | 7 |
| Overall usefulness | 7 |
| Likelihood of adoption | 7 |
| Likelihood of continued use | 6 |
| **Overall** | **6.5** |

Reasoning: lovely and clear, but the two moments that matter most (an absence reaching the teacher, a cancellation reaching me) are broken or not connected yet.

### Persona 7: Hannah Wright, three children across six classes (Amir 15, Nia 9, Clara 5)

**User profile**
- Part-time bookkeeper. Runs the family logistics from a phone during the week and a laptop on Sunday evenings.
- Tech confidence: medium-high.
- Needs: one view of who is where and when, one bill, and fewer forms.
- Frustration today: three different class timetables, separate invoices, and remembering which child has which shoes.

**Application experience**
- **First impressions:**
  - `/family` shows each child with "3 / 5 / 2 classes this week". `/family/schedule` lists all of them by day, with the child's name first ("Clara · Junior Tap").
  - On desktop (`parents-16-home-desktop.jpg`) the two-column layout is excellent.
  - On the phone it is a long scroll.
- **Most valuable:**
  - The combined schedule.
  - The ledger grouped by child ("NIA · Thames Valley Dance Festival — Nia £35.00").
  - "Classes and trials" per child, with prices "£46.00 a term".
  - Enquiries with statuses.
- **Least valuable:** the practice log on every child card (for Amir at 15 it is noise).
- **Exceeded:** asking for a place was a two-tap job, and the office saw it immediately with "Give them a place".
- **Failed:**
  - Events are separate from the schedule. Nia's private lesson on Monday at 16:00 is not on my week.
  - Requesting a place for two children means two separate sheets and no idea what my termly bill becomes.
  - Two new invoices on the same day need two separate bank transfers.
  - There are no bank details to transfer to (D4).
- **Usability concerns:** "Show 8 more for other ages" let me request Pre-School Ballet for my 9-year-old without a warning (D10).
- **Missing:** a per-child filter; merged events and privates; a family termly cost forecast; sibling discount shown; one payment for all outstanding invoices.
- **Simplify:** put child filter chips on Schedule instead of the long per-child blocks on Home.

**Recommendations**
1. Merge events, privates and rehearsals into the schedule.
2. Show bank details and allow one combined reference.
3. Add an "Upcoming costs" view.
4. Add child filter chips.
5. Show the effect on the termly fee before asking for a place.
- Remove or simplify: the practice log for older students.
- Greatest impact: one merged family calendar, including events.

**Adoption verdict:** yes, I would use it; it already beats three timetables. I would recommend it once payments are payable. What would stop me: having to ring the office to find out bank details or what I owe next term. What would keep me: the family week view.

**Scores:**

| Measure | Score /10 |
|---|---|
| Relevance | 9 |
| Quality of existing functionality | 7 |
| Completeness | 5 |
| Ease of use | 7 |
| Efficiency of everyday tasks | 6 |
| Overall usefulness | 7 |
| Likelihood of adoption | 8 |
| Likelihood of continued use | 7 |
| **Overall** | **7** |

### Persona 8: Gareth, father of a competitive 14-year-old (classes, privates, exams, competitions)

**User profile**
- Self-employed electrician. Pays for everything, so budgets carefully.
- Uses Android and a laptop for invoices.
- Tech confidence: medium.
- Needs: dates as early as possible, and every cost before it lands (entries, privates, costumes, tickets, travel).
- Frustration: "surprise" costume and entry bills a week before the event.

**Application experience** (driven on the Wright account, where Nia has an exam, a competition and a private lesson)
- **First impressions:**
  - `/family/events` shows each event with its cost, the entries-close date and its status: "Exam · Confirmed £62.00", "Competition · Confirmed £35.00", "Private lesson · Confirmed £30.00".
  - That is the right raw information.
- **Most valuable:**
  - Entries-close dates.
  - Costs on the events.
  - The ledger saying exactly "RAD Grade 3 Ballet examinations — Nia £62.00".
  - Rehearsal listed under the show.
- **Least valuable:** the events "Places 1 of 14" counter, which is wrong for parents. The office sees 6 going (D7).
- **Exceeded:** "You will be invoiced only once the studio confirms." I like that rule.
- **Failed:**
  - There is no single place listing what I will spend.
  - The £30 private is "Confirmed" but on no invoice and no balance (D9). I do not know whether I owe it.
  - The exam and the competition say "Confirmed" without saying *which* child (D8). With two dancers in the same event, I'd see only one.
  - I got no notification when the £97 of invoices arrived (D6).
  - No costume costs or sizes showed for us (the seed has none, so this was not testable).
- **Usability concerns:** due dates differ: the exam was due 9 Dec, the competition 16 Dec. That was not obvious until I opened each invoice.
- **Missing:** an "Upcoming costs" timeline; a costume budget per routine; competition schedule details (running order, call times); receipts as PDFs for my records.
- **Simplify:** combine the Events list and the expected costs into one "Season" view.

**Recommendations**
1. An upcoming-costs ledger including confirmed-not-invoiced items.
2. Name the child on every entry.
3. Notify on new invoices.
4. Downloadable receipts and full history.
5. Costume and ticket costs shown before confirmation.
- Remove or simplify: the misleading "Places x of y" for parents.
- Greatest impact: financial forecast per child per term.

**Adoption verdict:** I would use it for dates. I would not yet trust it for money. I would recommend it to the studio, with caveats. What would stop me: a charge appearing that I did not see coming. What would keep me: a reliable cost forecast.

**Scores:**

| Measure | Score /10 |
|---|---|
| Relevance | 8 |
| Quality of existing functionality | 6 |
| Completeness | 4 |
| Ease of use | 7 |
| Efficiency of everyday tasks | 5 |
| Overall usefulness | 6 |
| Likelihood of adoption | 6 |
| Likelihood of continued use | 5 |
| **Overall** | **5.5** |

### Persona 9: Pauline, 58, adoptive parent with limited technical confidence

**User profile**
- Retired school cook. Uses a mid-range Android phone with the system font set large.
- Comfortable with WhatsApp and banking-app transfers, nothing else.
- Needs: big clear words, the same button in the same place, and telling her exactly what to do next.
- Frustration: apps that change layout and hide things behind icons.

**Application experience** (driven on the phone; font scaling measured)
- **First impressions:**
  - The bottom bar (Home, Schedule, Messages, Payments, Family) has words under the icons. Good.
  - The big "£35.00" on Payments is impossible to miss (`parents-09-payments-due-phone.jpg`).
- **Most valuable:**
  - "DUE 16 DEC £35.00 — 1 invoice outstanding."
  - The plain-English cancellation message.
  - The "Copy" button for the reference.
- **Least valuable:** the calendar subscribe dialog ("webcal", "private link"). I would not know what to do.
- **Exceeded:** the "Ask the studio" link describes itself: "Questions, private lessons, medical updates".
- **Failed:**
  - I pressed "Pay £97.00" and nothing let me pay (D5).
  - The page told me to transfer using a reference, but **not where to send it** (D4). I would have to phone.
  - My phone's larger-text setting made no difference. The small grey text (12–13px) stayed small (D12). I had to pinch-zoom, which then needs sideways scrolling.
- **Usability concerns:**
  - Grey-on-white secondary text at 12.5–13.5px is hard to read.
  - The Messages page has two tabs ("The studio", "Class notices") that look like headings.
  - Absence reporting is behind "Family" → the child → "Report an absence", not on Home.
- **Missing:** bank details; a "Ring the studio" phone link; a larger-text option inside the app.
- **Simplify:** put "Report an absence" and "Pay" as two large buttons on Home.

**Recommendations**
1. Show bank details or one clear way to pay.
2. Respect system font size (use rem).
3. Relabel "Pay £x" to what it really does until card payments exist.
4. Put "Report an absence" on Home.
5. Add a phone and contact link for the studio.
- Remove or simplify: the webcal subscribe as the first option (offer "Download" more simply).
- Greatest impact: text that grows with my phone settings.

**Adoption verdict:** I would use it if someone showed me once. I'd prefer it to the paper letters, but not to a phone call. Recommend: maybe. What would stop me: not being able to pay or read it. What would keep me: the cancellation messages.

**Scores:**

| Measure | Score /10 |
|---|---|
| Relevance | 7 |
| Quality of existing functionality | 6 |
| Completeness | 5 |
| Ease of use | 5 |
| Efficiency of everyday tasks | 5 |
| Overall usefulness | 6 |
| Likelihood of adoption | 5 |
| Likelihood of continued use | 5 |
| **Overall** | **5.5** |

### Persona 10: Daniel, separated father sharing care of three children

**User profile**
- Secondary-school teacher. Has the children alternate weeks and pays half the fees by agreement.
- Uses a laptop and iPhone.
- Tech confidence: high.
- Needs:
  - Equal access to schedules and feedback.
  - Billing that reflects our split.
  - Communications that stay private: my ex-partner's messages to the studio are hers, and mine are mine.
  - Assurance that the studio knows any collection restrictions.
- Frustration: being the "second parent" who hears about things last.

**Application experience** (driven via the real invite flow as "Daniel Wright")
- **First impressions:** once my invitation worked, I saw everything Hannah sees immediately: the week, invoices and balance.
- **Most valuable:** equal visibility of the schedule, cancellations and feedback. That really matters to me.
- **Least valuable:** the "Your details" list, because it lets me edit Hannah's details.
- **Exceeded:** the invitation links me to the family without me re-entering the children.
- **Failed:**
  - If the office had already entered me on the family record before inviting me, accepting **fails** with "only the office can change who is linked to a family" (D1). In the seed that is how most second parents are recorded.
  - Once in, I can read **every message Hannah has sent the studio**, including her medical update about Nia's inhaler and her absence notes (`parents-15-messages-shared-family-thread.jpg`).
  - I can **change Hannah's email address**, and it saved (D3). In a hostile separation that is a serious problem.
  - There is no way to split invoices or mark who pays. `receives_billing` exists in the database but does nothing.
  - There is no record of collection permissions or contact restrictions (code-verified: none in `0030_safeguarding.sql`).
- **Missing:**
  - Per-guardian message threads.
  - Per-guardian billing share.
  - "Guardian can see: schedule / feedback / payments / messages" settings controlled by the office.
  - A collection-authorisation list visible to teachers.
  - Notifying both guardians separately.
- **Simplify:** default all guardians to shared schedule and notices, and keep messages and billing per guardian.

**Recommendations**
1. Fix invitation linking for existing guardian rows.
2. Guardians can edit only their own details.
3. Private per-guardian message threads, with the office seeing both.
4. Split billing (percentage or per-item payer).
5. Collection permissions and contact restrictions on the child, visible on the register.
- Remove or simplify: the edit buttons on other guardians' rows.
- Greatest impact: per-guardian scoping of messages and billing.

**Adoption verdict:**
- In an amicable separation, yes. In a contested one, I would advise the studio not to invite both of us until the scoping exists.
- Prefer it to existing arrangements: for schedules, yes.
- Recommend: not yet, for shared care.
- What would stop me: my private messages being visible to my ex.
- What would keep me: equal, timely schedule and feedback access.

**Scores:**

| Measure | Score /10 |
|---|---|
| Relevance | 9 |
| Quality of existing functionality | 4 |
| Completeness | 3 |
| Ease of use | 7 |
| Efficiency of everyday tasks | 6 |
| Overall usefulness | 5 |
| Likelihood of adoption | 4 |
| Likelihood of continued use | 5 |
| **Overall** | **4.5** |

Reasoning: the access exists, but its boundaries are not safe for separated families.

---

## 6. Votes (machine-readable)

Ratings for missing features: E = Essential, HD = Highly desirable, U = Useful, N = Nice to have.

### Persona 6: Kemi (young dancer)

| Type | Item | Rating |
|---|---|---|
| Valuable | Cancellation notices | |
| Valuable | Family weekly view | |
| Valuable | Cover teacher labelling | |
| Valuable | Class notices | |
| Valuable | Enquiries to studio | |
| Frustration | Absence report not reaching teacher | |
| Frustration | No push/email notifications | |
| Frustration | Cancellation not marked urgent | |
| Frustration | Empty skills grids | |
| Frustration | Consent read-only | |
| Missing | Planned absence reporting (to register) | E |
| Missing | Push/SMS notifications | E |
| Missing | Consent management | HD |
| Missing | What to bring per class | U |
| Missing | Urgent notice styling | HD |
| Remove/simplify | Empty skills grids for young children | |
| Greatest impact | Push/SMS notifications | |

### Persona 7: Hannah (multiple children)

| Type | Item | Rating |
|---|---|---|
| Valuable | Family weekly view | |
| Valuable | Family schedule | |
| Valuable | Invoice ledger by child | |
| Valuable | Class place requests | |
| Valuable | Enquiries to studio | |
| Frustration | Events not in schedule | |
| Frustration | No bank details | |
| Frustration | One transfer per invoice | |
| Frustration | No termly cost forecast | |
| Frustration | No age warning on requests | |
| Missing | Merged family calendar | E |
| Missing | Bank transfer details | E |
| Missing | Upcoming costs forecast | HD |
| Missing | Child filter on schedule | U |
| Missing | Sibling discount visibility | U |
| Remove/simplify | Practice log for older students | |
| Greatest impact | Merged family calendar | |

### Persona 8: Gareth (competitive dancer)

| Type | Item | Rating |
|---|---|---|
| Valuable | Event costs and entry deadlines | |
| Valuable | Invoice ledger by child | |
| Valuable | Events list | |
| Valuable | Rehearsal listing | |
| Valuable | Invoice only after confirmation | |
| Frustration | No upcoming costs view | |
| Frustration | Confirmed private not billed | |
| Frustration | Event entry not naming child | |
| Frustration | No invoice notification | |
| Frustration | Wrong places count | |
| Missing | Upcoming costs forecast | E |
| Missing | Invoice notifications | HD |
| Missing | Receipts and full payment history | HD |
| Missing | Costume costs and sizes | HD |
| Missing | Competition running order | U |
| Remove/simplify | Places count for parents | |
| Greatest impact | Upcoming costs forecast | |

### Persona 9: Pauline (low tech confidence)

| Type | Item | Rating |
|---|---|---|
| Valuable | Big balance display | |
| Valuable | Labelled bottom navigation | |
| Valuable | Cancellation notices | |
| Valuable | Copy payment reference | |
| Valuable | Ask the studio | |
| Frustration | Pay button does not pay | |
| Frustration | No bank details | |
| Frustration | Text ignores phone font size | |
| Frustration | Small grey text | |
| Frustration | Absence buried in Family tab | |
| Missing | Bank transfer details | E |
| Missing | Large text support | E |
| Missing | Card payments | HD |
| Missing | Absence button on Home | HD |
| Missing | Call the studio link | U |
| Remove/simplify | Webcal subscription as first option | |
| Greatest impact | Large text support | |

### Persona 10: Daniel (shared care)

| Type | Item | Rating |
|---|---|---|
| Valuable | Second guardian access | |
| Valuable | Family schedule | |
| Valuable | Cancellation notices | |
| Valuable | Teacher feedback | |
| Valuable | Invoice ledger by child | |
| Frustration | Invite fails for existing guardian | |
| Frustration | Co-parent can edit my details | |
| Frustration | Shared private messages | |
| Frustration | No split billing | |
| Frustration | No collection restrictions | |
| Missing | Second guardian access (fixed linking) | E |
| Missing | Per-guardian message privacy | E |
| Missing | Split billing between guardians | HD |
| Missing | Collection permissions | E |
| Missing | Per-guardian visibility settings | HD |
| Remove/simplify | Editing other guardians' details | |
| Greatest impact | Per-guardian message privacy | |

---

## 7. Group consolidated view

**Principal needs**
- Reliable notice of changes (all five personas).
- Knowing what is owed and how to pay it.
- A single family timeline.
- Confidence that information they give (absence, medical) reaches the right adult.
- For shared care: safe boundaries between guardians.

**Most valuable functionality**
- Family weekly view and four-week schedule.
- In-app cancellation, cover and move notices.
- Invoice ledger grouped by child.
- Enquiries with statuses.
- Event costs and deadlines.
- Honest "not connected yet" copy.

**Frustrations**
- Payments cannot be completed in the app, and transfer details are missing.
- Absence reports go nowhere useful.
- No notifications beyond the app.
- Costs are scattered, and confirmed items go unbilled.
- Guardian privacy.

**Common themes**
- "The data is there but not joined up": events vs schedule, events vs invoices, absence vs register.
- Labels promise more than the system does ("Pay £97.00", "The teacher will see it before class").

**Missing functionality (priority order)**
1. Bank details or card payment.
2. Absence to register.
3. Push/SMS/email notifications.
4. Upcoming costs.
5. Per-guardian scoping and split billing.
6. Merged calendar.
7. Consent management.
8. Receipts.
9. Large text.

**Adoption barriers:** inability to pay; notifications only reach parents who open the app; shared-care privacy.

**Highest-priority improvements:** fix D1, D2 and D3; bank details plus honest Pay label; invoice notifications; upcoming costs view.

**Disagreements (kept)**
- Daniel wants each guardian's messages private. Hannah (an intact family) prefers one shared family thread so either parent can pick up a conversation. This needs a per-family setting, not one global rule.
- Gareth wants more detail (running orders, costume budgets). Pauline wants fewer elements per screen.
- Kemi would hide empty skill grids. Gareth values seeing the full syllabus ahead.

**Group scores (mean of personas)**

| Measure | Score /10 |
|---|---|
| Satisfaction | 5.8 |
| Adoption likelihood | 6.0 |
| Continued use likelihood | 5.6 |

**Where our improvements could hurt other groups**
- Absence reports pre-marking the register could confuse teachers if a child turns up anyway. It needs to show as "expected absent", not a final mark.
- Per-guardian message privacy adds office workload: two threads per family.
- Split billing complicates admin reconciliation and reports.
- Invoice notifications on bulk billing could generate support calls for owners.

---

## 8. Candidate recommendations

### R1: Fix invitation linking for existing guardian rows (D1). Priority P0
- **Screen/workflow:** `/invite` accept; `app.accept_invitation` (`0019_platform.sql:599-662`); trigger `app.guardian_self_edit_guard` (`0023_operations.sql:333`).
- **Problem:** a second parent already on the family record cannot accept. Driven: error "only the office can change who is linked to a family".
- **Proposal:**
  - Allow the `user_id` link inside `accept_invitation`, e.g. a transaction-local setting (`set_config('app.accepting_invitation', inv.id, true)`) that the guard honours only when `old.user_id is null` and `lower(old.email) = inv.email` and `new.user_id = auth.uid()`.
  - Alternatively, perform the link in the guard-exempt definer context by checking that a valid invitation for this row's email exists.
- **Groups and personas:** parents (10, 7); admins.
- **Complexity:** S (SQL migration plus a test).
- **Dependencies:** R-001 real sign-in uses the same function.
- **Risks:** weakening the guard. Keep the conditions strict.
- **Acceptance criteria:**
  - Inviting an email that matches an unlinked guardian in the chosen family, then accepting, links that row (no duplicate row) and lands on `/family`.
  - Changing `user_id` outside acceptance still raises FORBIDDEN.
  - An existing pgTAP or Vitest case covers both.
- **User story:** As a second parent the studio already has on file, I want my invitation to work first time, so that I see my children's schedule without calling the office.
- **Workflow:** office invites → parent opens link → accepts → linked.
- **Business rules:** the email must match; the row must be unlinked; the family must match the invitation.
- **Edge cases:**
  - Two unlinked rows with the same email: link the oldest.
  - The row was soft-deleted: create a new row.
  - The email differs in case only.

### R2: Absence reports reach the session and register (D2). Priority P0
- **Screen/workflow:** `/family/children` AbsenceDialog; `F.REPORT_ABSENCE` (`src/lib/repos/family.ts:94`); `/teach` card and `/teach/register` (`src/app/teach/register/page.tsx`); `attendance` table.
- **Problem:** the confirmation promises the teacher will see the absence. Driven: the teacher sees nothing.
- **Proposal:**
  - A new `planned_absence` table (or attendance pre-mark) keyed by `student_id` and `session_id`, with reason, `reported_by` and `reported_at`.
  - The dialog lists the child's sessions on the chosen date (or a date range) as checkboxes.
  - The register shows an "Away (reported by parent)" chip with the reason, defaulting the mark to *excused* but editable.
  - The teacher's `/teach` card shows "1 reported absence".
  - The office inbox message is kept.
  - If the parent selects a date with no sessions, say so.
- **Groups and personas:** parents (6, 7, 9); teachers; admins.
- **Complexity:** M (migration, RLS for guardian insert on own child's future sessions, teacher read, three UI touchpoints).
- **Dependencies:** make-up credit policies, if added later.
- **Risks:** a child who attends anyway. The teacher can override.
- **Acceptance criteria:**
  - Reporting for Nia on 1 Dec, ticking Modern Juniors, shows a chip on Priya's register for that session with the reason.
  - Grade 2 Ballet, not ticked, shows nothing.
  - Reports for past sessions are rejected.
  - A parent cannot report for another family's child (RLS test).
- **User story:** As a parent, I want to tell the teacher my child will miss a specific class, so that they do not wait for her or worry.
- **Business rules:** future sessions only; one report per student per session; editable or withdrawable until the session starts.
- **Edge cases:**
  - Session cancelled after the report.
  - Session moved to another day: carry the report.
  - Child in two sessions at once.

### R3: Guardians edit only their own details; protect billing and primary flags (D3). Priority P0
- **Screen/workflow:** `family-details.tsx:42`; `F.UPDATE_GUARDIAN`; RLS `guardian_self_update` (`0006_rls.sql:166`); guard (`0023_operations.sql:333`).
- **Problem:** driven: a second guardian changed the first guardian's email.
- **Proposal:**
  - Restrict the update policy to `user_id = auth.uid()`.
  - Have the guard also reject changes to `is_primary`, `receives_billing` and `relationship` by non-admins.
  - In the UI, show other guardians read-only, with a "Ask the studio to update" link.
- **Groups and personas:** parents (10); safeguarding leads.
- **Complexity:** S.
- **Risks:** a parent legitimately correcting an unlinked partner's phone. Route that via enquiry.
- **Acceptance criteria:**
  - As Daniel, there is no Edit button on Hannah's row.
  - A direct SQL update of Hannah's row as Daniel fails.
  - Hannah can still edit her own row.
  - Unlinked guardian rows are editable only by the office.
- **User story:** As a separated parent, I want my contact details to be changeable only by me or the studio, so that messages about my children keep reaching me.
- **Business rules:** office override retained and audited.
- **Edge cases:** an unlinked guardian row with no login, which only the office edits.

### R4: Per-guardian visibility, message privacy and split billing. Priority P1
- **Screen/workflow:** `/family/messages`; `/family/payments`; `guardian` table (`receives_billing`, `is_primary`); `communication` RLS (`0007_rls_operations.sql:121`); office `/people` guardian sheet (`people-sheets.tsx`).
- **Problem:** driven: Daniel reads all of Hannah's messages, invoices and medical notes. There is no split payment and no collection or contact restrictions.
- **Proposal:**
  - **Family setting "shared care"** (office-controlled). When on:
    - direct messages carry `guardian_id` and are visible to the sender guardian and the office only;
    - class notices and cancellations go to all guardians.
  - **Per-guardian access flags** (office-controlled): schedule, feedback, payments, messages, medical summary.
  - **Billing split:** `billing_share_pct` per guardian, or per-invoice payer. Invoices are issued per payer with their share. `receives_billing` drives who sees the invoices.
  - **Collection and contact list per child:** authorised collectors, and a "do not release to" list with an office-only note. Shown on the register as an icon only, not details.
- **Groups and personas:** parents (10, 7); admins; teachers; safeguarding.
- **Complexity:** L (uncertain): migrations on `communication`, `invoice` (payer), `guardian`; RLS rewrites; office UI; billing runs (`0024_billing_runs.sql`).
- **Dependencies:** R3; billing runs; reports.
- **Risks:**
  - Breaking intact families' shared thread: default off.
  - Accounting complexity.
  - Leaking the existence of a restriction.
- **Acceptance criteria:**
  - With shared care on, a message Hannah sends is invisible to Daniel and visible to the office.
  - A cancellation notice reaches both.
  - With a 50/50 split, a £62 exam fee produces two £31 invoices, each visible only to its payer.
  - With Daniel's payments flag off, `/family/payments` is hidden from him.
  - A "do not release" entry shows an icon on the register for staff only.
- **User story:** As a parent sharing care, I want my own messages and my share of the bill kept separate from my ex-partner's, so that I can use the app safely.
- **Workflow:** the office marks the family as shared care → sets each guardian's flags and billing share → guardians see only their scope.
- **Business rules:** the office sees everything; safety notices go to all guardians; one guardian's access may never exceed what the office grants.
- **Edge cases:**
  - Rounding odd pennies: to the primary guardian.
  - A guardian removed mid-term.
  - Credit belonging to one payer.

### R5: Make payment instructions complete and honest (D4, D5). Priority P1
- **Screen/workflow:** `HowToPay` in `src/app/family/payments/page.tsx`; home Payments section in `src/app/family/page.tsx`; studio settings (`/studio`, `studio` table).
- **Problem:** driven: no payee, sort code or account number. "Pay £97.00" does not pay.
- **Proposal:**
  - Add studio bank details (payee, sort code, account number, optional IBAN) in studio settings, and show them with copy buttons.
  - Offer **one reference for all outstanding invoices** (family reference), and record allocation oldest-first. This already exists for money on account, per PAYMENTS.md.
  - Rename the home button to "How to pay" until a provider is connected; with Stripe, it becomes "Pay £x by card".
  - Add a "Phone the studio" link.
- **Groups and personas:** parents (9, 7, 8); admins.
- **Complexity:** S–M (new studio columns, settings form, display).
- **Dependencies:** R-006 for card.
- **Risks:** showing bank details to anyone with a parent login is acceptable. Changing bank details must be owner-only and audited, as a fraud guard.
- **Acceptance criteria:**
  - With details set, `/family/payments` shows the payee, sort code and account number with copy buttons.
  - With two unpaid invoices, one family reference is offered.
  - Without a provider, no button says "Pay".
  - Only the owner can change bank details, and the change is audit-logged.
- **User story:** As a parent, I want to see exactly where to send money and one reference to use, so that I can pay from my banking app in one go.
- **Business rules:** bank-detail changes are notified to all admins.
- **Edge cases:** studio has no bank details set (show "Ask the studio how to pay").

### R6: Notifications for new invoices and new feedback, plus out-of-app delivery. Priority P1
- **Screen/workflow:** `app.create_invoice` / `bill_event`; `app.notify_family`; notification settings.
- **Problem:** driven: bell empty after billing.
- **Proposal:**
  - Notify the family on issue (kind `invoice_issued`, category Payments) with amount and due date, linking to `/family/payments`.
  - Batch bulk billing into one notification per family.
  - Deliver urgent "class change" notifications by push or SMS once R-003 is decided.
- **Complexity:** S (notification) / L (delivery, dependent on R-003).
- **Acceptance criteria:**
  - After "Bill the fee", each billed family has one unread notification with amount and due date.
  - Families with the Payments category off for in-app do not get it.

### R7: "Upcoming costs" view per family and child. Priority P1
- **Screen/workflow:** `/family/payments` (new section), using `event_participant` (confirmed, unbilled), `exam_entry`, `ticket_booking`, costume (`show-tools`), enrolments × class price for next term.
- **Problem:** driven: the confirmed £30 private and other confirmed entries are not visible as owed. There is no forecast.
- **Proposal:**
  - A dated list "Expected, not yet invoiced" grouped by child: event fees for confirmed entries, priced privates, costumes, tickets, and next-term tuition estimate (with any sibling discount).
  - A total, with each item marked "estimate" or "confirmed price".
  - When invoiced, the item moves to invoices.
- **Groups and personas:** parents (8, 7); admins (fewer queries).
- **Complexity:** M.
- **Dependencies:** pricing and discount rules.
- **Risks:** forecasts read as commitments. Label them clearly.
- **Acceptance criteria:**
  - Nia's confirmed private (£30), exam (£62, before billing) and competition (£35) appear with dates and a total.
  - After "Bill the fee", the exam leaves the list and appears as INV-xxxx.
- **User story:** As the parent of a competitive dancer, I want to see every cost coming this term, so that I can budget.
- **Business rules:** only confirmed or likely items; requests are shown separately as "if accepted".
- **Edge cases:** a cancelled event (remove); a fee change after confirmation.

### R8: Events name the child and count places correctly (D7, D8). Priority P2
- **Files:** `src/lib/repos/hub.ts:78-100`; `events-view.tsx`.
- **Proposal:**
  - Compute `going` through a security-definer count function.
  - Return per-child status (array) and render "Nia · Confirmed", "Amir · Requested".
- **Complexity:** S.
- **Acceptance criteria:**
  - A parent sees the same count as the office.
  - Two children in one event show two statuses.

### R9: Merge events, privates and rehearsals into the family schedule, with child filter. Priority P2
- **Files:** `/family/schedule`, `F.MY_SCHEDULE`, `RehearsalList`, ICS export.
- **Complexity:** M.
- **Acceptance criteria:**
  - Nia's private on 30 Nov at 16:00 appears on that day.
  - Filter chips show one child.
  - The ICS file includes events.

### R10: Scalable text and an urgent-notice style. Priority P2
- **Problem:** measured: px sizes ignore root font size (D12). Cancellations are styled like ordinary news.
- **Proposal:**
  - Convert typography to rem, or a CSS variable base honouring the user agent.
  - Add an in-app "Larger text" toggle.
  - Give cancellations a critical "CANCELLED" notice with the child's name, pinned above other notices.
- **Complexity:** M (wide CSS change).
- **Acceptance criteria:**
  - With the root at 20px, body text scales proportionally and there is no horizontal scroll at 390px.
  - A cancellation notice names the child and sorts first.

### R11: Consent management for parents. Priority P2
- **Problem:** only "Photos: Permitted" is shown, read-only. There are no other consents (performance, travel, first aid, social media).
- **Proposal:**
  - Consent list per child with grant and withdraw; studio-defined consent types; audit via `consent_record`.
- **Complexity:** M.
- **Acceptance criteria:**
  - A parent withdraws photo consent and the teacher roster shows "No photos".

### R12: Small fixes. Priority P3
- Warn on out-of-age class requests (D10).
- "All feedback" deep-links to the child (D14).
- Receipts as PDF and full history beyond "Latest eight".
- Link notices to their event (D13).

---

## 9. Feature rationalisation (parent area)

| Decision | Item | Reason |
|---|---|---|
| **Retain** | Family home weekly view | Core value; clear |
| Retain | Four-week schedule | Core value |
| Retain | Ledger by child | Clear about what each charge is |
| Retain | Enquiries with statuses | Works |
| Retain | Honest "not connected" copy | Builds trust |
| Retain | Medical changes via "tell the studio" | Sound audit rationale |
| **Refine** | Absence reporting | Must reach the register (R2) |
| Refine | How to pay | Needs bank details, one reference, honest label (R5) |
| Refine | Notifications | Invoice notifications, urgent cancellation style (R6, R10) |
| Refine | Events | Per-child status, correct counts (R8) |
| Refine | Class requests | Age warning, cost impact |
| **Redesign** | Guardian model | Per-guardian scope, privacy, split billing, collection permissions (R3, R4) |
| **Add** | Upcoming costs (R7) | |
| Add | Merged calendar with child filter (R9) | |
| Add | Consent management (R11) | |
| Add | Receipts | |
| Add | Scalable text (R10) | |
| **Consolidate** | Messages "The studio" thread and `/family/enquiries` | Enquiries currently appear in both. Show enquiries as threaded items in Messages, or keep them separate but not duplicated |
| **Remove / simplify** | "Pay £x" button with no payment behind it | Until card payments exist |
| Remove / simplify | Edit buttons on other guardians' rows | Privacy (R3) |
| Remove / simplify | Empty skills grids for very young children | Hide until assessed |
| Remove / simplify | Parent "Places x of y" counter | Until it is computed correctly |
| **Defer** | Practice log for older teens | Low value for this group |
| Defer | Webcal subscription | Until hosting (R-002) makes it real; keep the plain "Download" option |

### Screenshots (all in `/home/user/General/barre/docs/review/shots/`)
- `parents-01-ask-place-nia.jpg`
- `parents-01-ask-place-clara.jpg`
- `parents-03b-absence-sent.jpg`
- `parents-04-feedback-nia.jpg`
- `parents-05-notification-settings.jpg`
- `parents-06-calendar-subscribe.jpg`
- `parents-07-home-cancel-notice.jpg`
- `parents-07b-home-amount-due.jpg`
- `parents-08-bell-after-cancel.jpg`
- `parents-09-payments-due-phone.jpg`
- `parents-10-invite-accept-error.jpg`
- `parents-11-coparent-edits-other-guardian.jpg`
- `parents-12-second-guardian-home.jpg`
- `parents-13-events-confirmed-no-child-name.jpg`
- `parents-14-family-schedule-phone.jpg`
- `parents-15-messages-shared-family-thread.jpg`
- `parents-16-home-desktop.jpg`
- `parents-17-children-desktop.jpg`
- `parents-18-register-no-reported-absence.jpg`
