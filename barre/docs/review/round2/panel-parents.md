# Round 2 panel report: Parents and guardians (group "parents")

> **Simulated panel.** The five people below are the same simulated personas as in round 1 (`docs/review/panel-parents.md`). Their voices are written by the reviewer. This is not real user research. Every behaviour reported here is either **observed** (driven in Chromium with Playwright against the static preview) or **code-verified** (read in the source, file named). Everything else is marked *opinion* or *unverified*. All data is synthetic.

---

## 1. Method and limitations

**Build and scripts**
- Build: preview at `http://127.0.0.1:8080/General/studio-next/`, in-browser PGlite seeded as "Northstar Dance Academy", 28 Nov 2026.
- Scripts: `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/parents/` (`e1`, `e2`, `s1`–`s3.cjs`; output in `s2.out` and `s3.out`).
- Each script used a fresh browser context, so each had its own database.

**Accounts**
- Hannah Wright (guardian, children Amir 15, Nia 9, Clara 5).
- Inês Wright: the second guardian already on the Wright family record. She joined through the real invitation flow; this stands in for Daniel's shared-care situation.
- Nadia (admin) and Freya (owner) created the triggers: billing an event fee, adding the school's bank details, sending the invitation and opening "Who pays".
- Priya (teacher) checked whether an absence report reached her.

**Viewports**
- Phone 390×844 (isMobile, touch) for everything.
- 200% root text on the phone for Home, Payments and Family.
- One desktop pass at 1440×900: Home, Payments, Family.

**Screens covered**
- `/family`, `/family/schedule`, `/family/children` (including the **Update details** sheet and **Consents**), `/family/payments` (including **Coming up**), `/family/messages`, `/family/events`, `/family/feedback`, `/family/enquiries` and `/family/privacy`.
- The bell and its notifications.

**Not tested**
- Card payments, Direct Debit, and email, SMS or push delivery. These are still waiting on decisions R-006 and R-003, so only the in-app bell could be seen.
- Real sign-in.
- **Split billing end to end.** No billing run was driven. The first attempt at the "Who pays" sheet failed because the panel was still loading. Split billing is therefore **code-verified only**: `src/components/app/billing-split.tsx`, `app.billing_payers` in `0052_money_fixes.sql`.
- The dark "Urban" style. No guardian account exists at Kestrel.
- Screen readers.
- Ticket and costume flows: there is no seed data for the Wrights.

**Seed quirks to keep separate from product findings**
- The attendance percentage on Amir's card was different in different fresh contexts (72%, 78% and 83% were seen). The seed appears to vary. It is not a product finding.
- The seeded enquiry "Could we book a private before the exam?" is tagged "about Amir", although the exam is Nia's.

---

## 2. What changed since round 1 (our complaints re-checked)

| # | Round-1 complaint (defect id) | Status | Evidence |
|---|---|---|---|
| 1 | Absence report never reached the teacher (D2) | **Fixed** | Observed. The dialog now lists Nia's actual classes, grouped by day, with tick boxes; you tick several for a range (shot 05). After Send it says "Nia's teacher will see this on the register … You can withdraw it here until the class starts." Priya's `/teach` card for Tue 1 Dec Modern Juniors then read **"Nia — reported absent"**. The register pre-mark itself was not opened (FIXES UR-07). |
| 2 | No bank details (D4) | **Fixed, if the school fills them in** | Observed in both states. With none set: "The studio has not added its bank details here yet. Ask them…" (shot 08), which is honest. After Freya added them in Studio → Money: account name, sort code and account number, each with a Copy button (shot 09). |
| 2b | One transfer per invoice | **Not fixed** | Observed. The reference shown to parents is still the invoice number (INV-1071). The family reference "WRIGHT-0001" exists, but only on the admin family panel. |
| 3 | "Pay £97" button did not pay (D5) | **Fixed** | Observed. Home now says **"See how to pay"** (shot 07). |
| 4 | No notification for a new invoice (D6) | **Fixed in the app** | Observed. Bell shows "INVOICE · New invoice INV-1071 £62.00 due 10 Dec · RAD Grade 3 Ballet examinations — Nia" with an unread badge (shot 06). Home shows a "DUE 10 DEC" notice in amber. Out-of-app delivery is still not connected. |
| 5 | No upcoming-costs view | **Fixed, with polish needed** | Observed. Payments → "Coming up" groups by child. Each line is tagged EXPECTED or INVOICED (with the invoice number). It covers next-term fee estimates, the private lesson, the exam and the festival, with "Total coming up £707.00" (shot 08). See UI-6 and UI-7. |
| 6 | Confirmed £30 private lesson not reflected anywhere (D9) | **Fixed for visibility** | Observed. It appears in "Coming up" as EXPECTED £30, 1 Dec, and in the schedule as PRIVATE LESSON. No invoice was observed (the lesson is in the future). |
| 7 | Second guardian already on the record could not accept the invitation (D1) | **Fixed** | Observed. Inês accepted the invitation for `second.wright@example.com` and landed on `/family` signed in as herself. |
| 8 | A co-parent could edit the other guardian's details (D3) | **Fixed** | Observed as both guardians. Only your own row has a pencil. The other row says "Ask the office to change", with "You can change your own details. Only the office changes anyone else's." Inês had no "Edit Hannah" button (count 0). |
| 9 | Private messages visible to the co-parent | **Fixed for new messages; legacy gap** | Observed. Hannah sent "Private: please only discuss pick-up arrangements with me this term." Inês could **not** see it, and she did not see Hannah's requests (inhaler, shoes, private lesson) either. But Inês **could** see the seeded "Absence on Monday" message from Hannah and the office reply (shot 10). Code (`0046` `communication_privacy`) stamps privacy only when a row is inserted, so messages that already existed or were imported would stay shared. Whether imported data behaves like this seed is *unverified*. |
| 10 | No split billing | **Built, not driven** | Code-verified. Admin "Who pays" offers whole family, one guardian, % split, or each child to a guardian. It applies from the next billing run, and invoices addressed to the other payer are hidden (`payer_hidden_invoice_ids`). Nothing on the **parent** side explains the arrangement: no "your share" wording in `src/app/family/payments` (grep). FIXES itself notes that "Coming up" can show the other guardian's invoice number. |
| 11 | Events did not name the child; wrong "Places" count (D7, D8) | **Fixed** | Observed. Each event has a row per child ("Nia Confirmed", "Amir Requested — waiting on the studio"), an "Ask for another child too" button, and "Places 8 left of 14", which is now school-wide (shot 12). |
| 12 | Text ignored phone font size (D12) | **Mostly fixed** | Observed at 200%. Body text doubled (main paragraph 24–26px), with no sideways scroll (scrollWidth 390 = clientWidth). Remaining problems at that size: the bell icon stays small, the header title stacks above the bell and avatar and pushes content down, and the bottom tabs truncate to "Sch… Mes… Pay…" (shot 11). |
| 13 | Consent was read-only | **Fixed** | Observed. Each child has Allow / Don't allow for Photos, Video, and Social media and public use, with "Not recorded" shown honestly. A change confirms inline ("Video: allowed. Teachers see the change next time they open Amir's details."). "See changes" shows who changed what and when (see the safeguarding group's shot `safeguarding-06-parent-consent-history.jpg`; ours caught it still loading). |
| 14 | "All feedback" opened the wrong child (D14) | **Fixed** | Observed. It now opens a "Newest first" list across all the children, so Nia's note is at the top (shot 02). |
| 15 | Events and privates missing from the schedule; no child filter | **Fixed** | Observed. The schedule header reads "Classes, rehearsals, shows and exams". There are Everyone / Amir / Clara / Nia chips. Private lesson, EXAM and COMPETITION rows are merged in (shot 03). |
| 16 | Cancellation looked like an ordinary "NEW" notice and did not name the child | **Not fixed** | Observed: Clara's seeded cancellation ("Pre-School Ballet — CANCELLED · Teacher unwell") appears only inside Clara's block, the third child down. It is absent from Notices. Code-verified: `src/app/family/page.tsx:68` still skips `status === 'cancelled'` when building CHANGED notices. |
| 17 | Out-of-age class requests | **Partly fixed** | Observed on drop-ins only: "Not for Amir's age". The class-request sheet was not re-driven (FIXES UR-06 says age is enforced on every booking path). |

**Net:** 11 of our 17 round-1 issues are fixed, 3 are partly fixed, 1 is built but not driven, and 2 are not fixed (cancellation urgency, one family payment reference). We found no regressions.

---

## 3. UI review (phone first)

| ID | Screen | Observation | Sev | Shot | Concrete improvement |
|---|---|---|---|---|---|
| UI-1 | `/family` Notices | A same-day cancellation never reaches the top Notices list (code line 68). On a phone, Clara's struck-through row is about two screens down. "1 more new notice" hides the rest. | **High** | 01 | Add cancellations to the change notices as **"CANCELLED"** in Critical red, with child name, day and reason ("Clara · Pre-School Ballet · Mon 30 Nov · Teacher unwell"). Always place them first. Never fold them under "more". |
| UI-2 | `/family/schedule` | Nia's private lesson (Tue 1 Dec 16:00, Greenwich) is at the same time as her Modern Juniors class (16:00, Blackheath), and nothing flags it. The clash is in the seed, but the app gives no warning. | Medium | 03 | Show a "CLASH" notice on both rows ("Nia is booked for two things at 16:00"). Check for clashes when an office confirms a private lesson. |
| UI-3 | `/family/children` (phone) | Each child is a very long card: classes, attendance, 3 consent blocks with explanations, exams, contacts, collection, own login, 3 action buttons and practice. Three children make a long page. Consent controls appear both in the card and in the Update details sheet. | Medium | 04, 13 | Collapse each child into a summary row (photo consent state, contacts count, "Update details") that expands. Keep consent in **one** place, the sheet, and show a one-line summary on the card ("Photos: not allowed · Video: allowed · Social: not recorded"). |
| UI-4 | Update details sheet | Clear and honest. Name, pronouns, school, photos/video, then "Ask the studio to change" with a topic picker and an example placeholder. But the "Name they go by" field has focus and is empty, which can read as "her name is missing". The sheet has two save actions ("Send to the studio" and "Save details"). | Low | 04 | Pre-fill the field with a placeholder ("Nia") and don't auto-focus it. Make "Send to the studio" its own step or a separate sheet, so one sheet has one primary action. |
| UI-5 | `/family` (Pauline) | Report an absence is still three levels deep (Family → child → button). Home has no quick action. | Medium | 01 | Add a "Report an absence" row (and "See how to pay" when something is due) to the Home quick links, next to "Shows and events" and "Ask the studio". |
| UI-6 | Payments → Coming up | "Total coming up £707.00" includes the £62 already INVOICED, which is also the £62 balance at the top. Parents may add the two together. | Medium | 08 | Split the total into "Already invoiced £62" and "Expected £645". Or leave invoiced lines out of the total, with "(shown above)". |
| UI-7 | Payments → Coming up | Term fee estimates say "Date to be set". The list is ordered by child, not by date, so the question "what do I pay in December?" is hard to answer. | Low | 08 | Add a "By date" toggle with month subtotals. Show the next term's start date when it is known. |
| UI-8 | Payments | Each invoice has its own reference, and a family with two event fees still makes two transfers. | Medium | 09 | When more than one invoice is open, show "Pay everything: £X with reference WRIGHT-0001", using the family reference the office already has. |
| UI-9 | Header at 200% text | The bell stays tiny. The title, bell and avatar stack. The bottom tabs truncate to "Sch…", "Mes…" and "Pay…". | Medium | 11 | At large text sizes, use icon-only tabs with the label underneath on two lines, or a shorter tab set ("More"). Scale icons with `em`. Keep the header on one row and drop the date subtitle. |
| UI-10 | `/family` Notices | "Grade 3 Ballet — exam preparation" and other class notices don't say which child, even though the cover notice does ("Clara · …"). | Low | 01 | Prefix class notices with the child's name, as the CHANGED notice already does. |
| UI-11 | `/family/schedule` | Row reads "Private lesson — Nia" with the subline "Nia · Freya…". The name appears twice. | Low | 03 | Drop the child prefix from the subline when the title already names the child, or title privates "Private lesson". |
| UI-12 | `/family/messages` (second guardian) | Seeded messages from before the privacy rule are shared with the co-parent, while the footer promises "Only you and the office see what you send here". | Medium (shared care) | 10 | Run a one-off backfill that stamps `private_to = sent_by` on existing inbound family messages. Also apply it to imported history. |
| UI-13 | `/family/children` (Amir, 15) | The practice log is still on the parent's card for a teen with his own login. | Low | 13 | Hide practice from the parent card when the student has their own login, or show it read-only. |
| UI-14 | Desktop `/family` | Strong two-column layout. Payments, feedback and the studio are on the right. The quick links fill the empty space well. | Positive | 14 | Keep it. |
| UI-15 | Bell | The invoice notification is clear: amount, due date, what it is for, and the child. | Positive | 06 | Tapping it should open that invoice, expanded (*unverified*: we did not tap through). |
| UI-16 | `/family/privacy` | Plain-language table of who sees what, a JSON download, and a deletion request. Kemi and Daniel valued it. | Positive (Low on format) | — | Offer the download as a readable PDF or HTML summary as well as JSON. Pauline would not open a .json file. |

---

## 4. Feature and function ideas

| # | Feature | Problem it solves | Who | Rating | Size / area | Risk |
|---|---|---|---|---|---|---|
| F1 | Out-of-app delivery for cancellations, invoices and absence acknowledgements (push or SMS first; email digest for the rest) | Parents who don't open the app still learn nothing | All, especially Kemi and Pauline | **Essential** | L. Outbox worker, R-003, `notification-settings.tsx` | Notification fatigue. Default only "Class changes" to push; digest the rest. |
| F2 | Card / Direct Debit payment | You still can't pay in the app | Hannah, Gareth, Pauline | **Essential** | XL. R-006, `family/payments` | PCI handled by the provider. Refunds and credit-note flows. |
| F3 | "Pay everything" with one family reference | One transfer for several invoices | Hannah, Gareth | Highly desirable | S. `HowToPay` and family reference already present | Matching part-payments (bank-statement import is deferred, UR-61). |
| F4 | Urgent CANCELLED notice, plus home quick actions (Report absence, See how to pay) | The most time-critical change is buried | Kemi, Pauline | Highly desirable | XS–S. `src/app/family/page.tsx` | None. |
| F5 | "Your share" on split-billed families | Daniel can't see what he is responsible for, or why an invoice is missing | Daniel | Highly desirable | S. Payments header + `billing_payers` | Must not reveal the other guardian's amounts unless the office allows it. |
| F6 | Clash warnings in the family schedule and when a private lesson is confirmed | Double-booked child (privates vs classes, two schools) | Hannah, Gareth | Useful | S. Schedule query + events confirm | False positives for travel. Show as a notice, not a block. |
| F7 | Coming up "By date" view, with CSV/PDF export and a costume line per routine | Budgeting by month | Gareth | Highly desirable | M. `payments/page.tsx` Coming up | Estimates read as promises. Keep the "EXPECTED" wording. |
| F8 | Receipts (PDF) and full history beyond "Latest eight", including imported invoices | Records, tax-free childcare claims (*assumption*: some parents need proof of payment) | Gareth, Hannah | Highly desirable | M. Payments + invoice renderer | None. |
| F9 | "What to bring / wear" per class, shown on the schedule row | Kit reminders now arrive as one-off notices | Kemi, Hannah | Useful | S. Class record field + schedule | None. |
| F10 | In-app text size and "simple mode" (Home, Pay, Absence, Messages only) | Large-text layout strain | Pauline | Useful | M. Shell, tab bar | Two layouts to maintain. |
| F11 | Per-guardian notification preferences, with both guardians notified separately | Shared care: "I hear about things last" | Daniel | Highly desirable | S–M. Notification settings per user | None (settings may already be per user; *unverified*). |
| F12 | Readable data export (PDF/HTML) alongside JSON | Privacy rights usable by non-technical parents | Pauline | Nice to have | S. `family/privacy` | None. |

---

## 5. Branding feedback (end-user perception)

- **Name: Swayvo.** Parents barely meet it, and they think that is right. The school leads ("Northstar Dance Academy", its star mark at top left) and "powered by swayvo" is a quiet footer. Kemi and Hannah: "fine, friendly, sounds like dance". Pauline would search the app store for "Northstar", not "Swayvo". *Opinion:* the store listing and install prompts should say "Your school's app, by Swayvo", so a parent understands why they are installing something with a different name.
- **Notices (CHANGED / NEW / DUE 10 DEC).** The condensed uppercase words are the brand's best idea for parents. Instantly scannable, and the amber DUE is calm, not alarming. The gap is CANCELLED, which should be the loudest notice and is missing from that list (UI-1).
- **Colour.** On the Northstar school style the product is navy and quiet. Count blue appears once, as the main button. Parents like this restraint. The bright blue store image ("Every change, said plainly.", `public/brand/store/02-family.png`) speaks to parents well, and the line is true of the product now that the bell, DUE notices and the CANCELLED class rows exist. Peach on blue in "plainly." is cheerful. Pauline found the light-grey secondary text (slate on studio white) still faint at normal size. *Opinion:* she would prefer it slightly darker.
- **Type.** Archivo for times and money ("£62.00", "18:30") is strong and easy to read. The Inter body text is comfortable.
- **Voice.** Consistently honest and plain: "Not available yet: the studio has not connected card payments"; "You can change your own details. Only the office changes anyone else's."; "If someone must not collect Amir, tell the office". It earns trust, and it is the most improved part since round 1, because now the words match what happens.
- **/welcome** (perception only; it is aimed at schools). Kemi noticed the hero register mock-up shows children's names with medical notes ("Mild eczema; Emollient cream", "Allergy: Plasters (latex)"). The data is synthetic, but a parent's first reaction is "is that what the teacher's phone shows to anyone?" *Opinion:* fine for owners, but the parent-facing store image is the better first impression for families.
- **Consistency.** Same notice grammar, section rules and bottom bar across all `/family` routes. The desktop sidebar carries the school name with "powered by swayvo". Consistent.

---

## 6. Individual panel member reports (simulated)

### Persona 6: Kemi, mother of a 5-year-old (hospital pharmacist, iPhone, two-minute bursts)

**What's better**
- The absence report finally does what it says. I tick the actual class, and the teacher's screen shows "Nia — reported absent". I can withdraw it until class starts.
- I can set photo and video consent myself, and see who changed it.
- The privacy page tells me exactly who sees my child's allergies.

**What still frustrates me**
- A cancellation for my daughter still doesn't appear at the top of Home. I'd have to scroll to her block to see "CANCELLED · Teacher unwell".
- Nothing leaves the app yet, so at 3pm on a shift I still won't know.

**Top 5 UI improvements**
1. CANCELLED notice at the top, with the child's name.
2. Report absence on Home.
3. Child name on every class notice.
4. One-line consent summary on the card.
5. Shorter child cards.

**Top 3 feature requests**
1. Push or SMS for same-day changes (Essential).
2. What to bring per class (Useful).
3. Absence acknowledgement as a notification (Highly desirable).

**Branding:** "Every change, said plainly" is what I want. Make it true for cancellations too.

**Scores**

| Measure | /10 |
|---|---|
| Relevance | 8 |
| Quality | 8 |
| Completeness | 6 |
| Ease of use | 8 |
| Efficiency | 7 |
| Usefulness | 8 |
| Adoption | 8 |
| Continued use | 7 |
| Visual design/UI | 8 |
| Brand appeal | 7 |
| **Overall** | **7.5** (round 1: 6.5) |

**Reasoning:** the absence loop and consent are now real. The last gap is cancellation urgency and delivery outside the app.

### Persona 7: Hannah Wright, three children (bookkeeper, phone in the week, laptop on Sunday)

**What's better**
- The schedule has Everyone / Amir / Clara / Nia chips and includes Nia's private lesson, exam and competition. One diary at last.
- "Coming up" shows next term per child.
- "All feedback" opens a newest-first list.
- Inês and I each have our own login, and I can't edit hers.

**What still frustrates me**
- Two event fees means two transfers, each with its own reference. The family reference exists; just show it to me.
- The £707 "Total coming up" includes the £62 I'm already being asked for, so I double-counted at first.
- Nia is booked for her private lesson and Modern Juniors at 16:00 on the same day, and nothing told me.

**Top 5 UI improvements**
1. One family reference to pay everything.
2. Separate invoiced from expected in the total.
3. Clash warning.
4. Collapsible child cards.
5. Hide practice for Amir.

**Top 3 feature requests**
1. Card / Direct Debit (Essential).
2. Coming up by month with export (Highly desirable).
3. Receipts and full history (Highly desirable).

**Branding:** calm and grown-up on the laptop. The school's name leads, which is right.

**Scores**

| Measure | /10 |
|---|---|
| Relevance | 9 |
| Quality | 8 |
| Completeness | 7 |
| Ease of use | 8 |
| Efficiency | 7 |
| Usefulness | 8 |
| Adoption | 9 |
| Continued use | 8 |
| Visual design/UI | 8 |
| Brand appeal | 7 |
| **Overall** | **8** (round 1: 7) |

### Persona 8: Gareth, father of a competitive dancer (electrician, Android, budgets carefully)

**What's better**
- "Coming up" is the screen I asked for. Private lesson £30 EXPECTED, exam £62 INVOICED with its number, festival £35 EXPECTED, all under the child's name.
- The bell told me the moment the exam fee was billed: "New invoice INV-1071 £62.00 due 10 Dec".
- Events show the child on each entry and real place counts.

**What still frustrates me**
- I can't see costs by month.
- Next term says "Date to be set".
- There are no costume lines (none seeded, so untested), no receipts, and the history is still "Latest eight".
- I still can't pay by card.

**Top 5 UI improvements**
1. "By date" view with month subtotals.
2. Invoiced vs expected totals.
3. Clash warnings for privates.
4. Tap a notification to open the invoice.
5. Term start date on the fee estimate.

**Top 3 feature requests**
1. Receipts and full history (Highly desirable).
2. Costume and entry budget per routine (Highly desirable).
3. Card payments (Essential).

**Branding:** big money figures in that display font are clear. I don't care about the name, as long as the numbers are right.

**Scores**

| Measure | /10 |
|---|---|
| Relevance | 9 |
| Quality | 8 |
| Completeness | 6 |
| Ease of use | 8 |
| Efficiency | 7 |
| Usefulness | 8 |
| Adoption | 8 |
| Continued use | 7 |
| Visual design/UI | 7 |
| Brand appeal | 6 |
| **Overall** | **7.5** (round 1: 5.5) |

**Reasoning:** I now trust it to warn me about costs. Paying and keeping records are the gaps.

### Persona 9: Pauline, 58, low technical confidence (large system font, mid-range Android)

**What's better**
- My phone's big-text setting now works: the words got bigger and nothing slid sideways.
- The button says "See how to pay", and the page gives me the account name, sort code and account number with Copy buttons. I can do that in my banking app.
- "Ask the office to change" tells me what to do.

**What still frustrates me**
- With big text the little bell stays tiny, and the bottom words become "Sch…", "Mes…", "Pay…". I don't know what "Mes…" is.
- Reporting an absence is still hidden under Family and then the child.
- The data download is a ".json" file, and I wouldn't know what to do with it.

**Top 5 UI improvements**
1. Readable tabs at large text.
2. Report absence on Home.
3. Bigger bell.
4. Darker grey text.
5. One primary button per sheet.

**Top 3 feature requests**
1. Card payments (Essential).
2. In-app text size / simple mode (Useful).
3. Readable data copy (Nice to have).

**Branding:** I see "Northstar", which is my school, so I trust it. I wouldn't know to look for "Swayvo" in the shop.

**Scores**

| Measure | /10 |
|---|---|
| Relevance | 7 |
| Quality | 7 |
| Completeness | 6 |
| Ease of use | 6 |
| Efficiency | 6 |
| Usefulness | 7 |
| Adoption | 7 |
| Continued use | 6 |
| Visual design/UI | 6 |
| Brand appeal | 6 |
| **Overall** | **6.5** (round 1: 5.5) |

**Reasoning:** I can now pay by transfer without phoning. Large text works but is cramped.

### Persona 10: Daniel, separated father sharing care (teacher, laptop and iPhone)

Driven as Inês, the second guardian.

**What's better**
- An invitation for a parent the office already had on file now works.
- I can't change my ex-partner's details, and she can't change mine.
- A new private message from her did not appear in my Messages.
- The office can restrict what each guardian sees (code-verified), and there is a "Who may collect" list that the teacher sees at the register.

**What still frustrates me**
- I could still read an older message she sent about Clara missing a class, while the footer tells me "Only you and the office see what you send here". If the school imports old messages, that promise is broken.
- Split billing exists for the office, but nothing on my Payments page says "you pay 50%" or why an invoice isn't mine.

**Top 5 UI improvements**
1. Backfill privacy on old messages.
2. "Your share" line on Payments.
3. Tell me when the office restricts or changes my access.
4. Separate notification preferences per guardian.
5. Show which guardian reported an absence.

**Top 3 feature requests**
1. "Your share" on split billing (Highly desirable).
2. Per-guardian notification preferences (Highly desirable).
3. Out-of-app delivery to both parents (Essential).

**Branding:** the plain, neutral copy ("Only the office changes anyone else's") is exactly the tone a separated parent needs: no drama, clear rules.

**Scores**

| Measure | /10 |
|---|---|
| Relevance | 9 |
| Quality | 7 |
| Completeness | 6 |
| Ease of use | 8 |
| Efficiency | 7 |
| Usefulness | 7 |
| Adoption | 7 |
| Continued use | 7 |
| Visual design/UI | 7 |
| Brand appeal | 6 |
| **Overall** | **7** (round 1: 4.5) |

**Reasoning:** the boundaries are now mostly safe. The legacy-message gap and the invisible split are what keep me from a full recommendation for contested separations.

---

## 7. Votes (machine-readable)

| Persona | UI improvement 1 | UI improvement 2 | UI improvement 3 | Feature 1 (rating) | Feature 2 (rating) | Feature 3 (rating) | Remove / simplify | Greatest-impact change |
|---|---|---|---|---|---|---|---|---|
| 6 Kemi | Urgent cancelled notice | Absence on Home | Child name on notices | Push/SMS delivery (E) | Absence acknowledgement notification (HD) | What to bring per class (U) | Duplicate consent controls | Urgent cancelled notice + push |
| 7 Hannah | One family payment reference | Invoiced vs expected total | Schedule clash warning | Card/Direct Debit (E) | Coming up by month + export (HD) | Receipts and full history (HD) | Practice log for teens with own login | One family payment reference |
| 8 Gareth | Coming up by date | Invoiced vs expected total | Notification opens invoice | Card/Direct Debit (E) | Receipts and full history (HD) | Costume and entry budget (HD) | "Date to be set" without term date | Coming up by date |
| 9 Pauline | Large-text tab bar | Absence on Home | Darker secondary text | Card/Direct Debit (E) | Text size / simple mode (U) | Readable data export (N) | Two primary buttons in Update details sheet | Large-text tab bar |
| 10 Daniel | Legacy message privacy backfill | Your share on Payments | Access-change notice | Out-of-app delivery to both guardians (E) | Your share on split billing (HD) | Per-guardian notification preferences (HD) | Shared legacy messages | Legacy message privacy backfill |

---

## 8. Group summary

**Consensus**
- Round 2 fixed nearly everything that broke trust in round 1: absence reports reach the teacher; payment wording is honest, with bank details; invoice notifications; Coming up; second-guardian invitation; co-parent edit lock; per-child events; consent; text scaling.
- The family area now does what its words say.
- The two remaining blockers sit outside the UI: real payments (R-006) and delivery outside the app (R-003).
- In the UI, the top shared ask is to **make cancellations the loudest notice** and to **put "Report an absence" on Home**.

**Disagreements (kept)**
- *Density.* Gareth wants more money detail (by month, costumes, export). Pauline wants fewer elements and a simple mode.
- *Shared vs private messages.* Hannah, in an intact family, is happy for Inês to see the old shared thread. Daniel wants every guardian-sent message private, legacy included. The per-message privacy rule suits Daniel. Hannah would accept a per-family "share our messages" switch.
- *Consent placement.* Kemi likes consent visible on the card. Pauline and Hannah want it only in the Update details sheet, to shorten the page.

**Group scores (mean of the five personas)**

| Measure | Round 1 | Round 2 |
|---|---|---|
| Overall | 5.8 | **7.3** |
| Adoption likelihood | 6.0 | **7.8** |
| Continued use | 5.6 | **7.0** |
| Ease of use | 6.8 | 7.6 |
| Completeness | 4.4 | 6.2 |
| Visual design/UI | — | 7.2 |
| Brand appeal | — | 6.4 |

Round 1's "Overall" uses the persona overalls (6.5, 7, 5.5, 5.5, 4.5 → 5.8).

### Screenshots (`/home/user/General/barre/docs/review/round2/shots/`)
- `parents-01-home-phone.jpg`: Home, notices and the first child.
- `parents-02-feedback-from-home.jpg`: "All feedback", newest first.
- `parents-03-schedule-child-filter.jpg`: child chips, private lesson merged, 16:00 clash.
- `parents-04-update-details-sheet.jpg`: new Update details sheet.
- `parents-05-absence-class-picker.jpg`: absence class picker.
- `parents-06-bell-new-invoice.jpg`: invoice notification.
- `parents-07-home-see-how-to-pay.jpg`: "See how to pay" and the Clara cancellation in her block.
- `parents-08-payments-no-bank-coming-up.jpg`: no bank details yet, and Coming up with £707 total (full page; the bottom bar shows mid-page because of the full-page capture).
- `parents-09-payments-bank-details.jpg`: bank details with Copy buttons.
- `parents-10-second-guardian-messages.jpg`: Inês sees a legacy message from Hannah.
- `parents-11-home-200pct.jpg`: 200% text: header stacking, truncated tabs.
- `parents-12-events-per-child.jpg`: per-child event status and places.
- `parents-13-children-desktop.jpg`: Family on desktop.
- `parents-14-home-desktop.jpg`: Home on desktop.
