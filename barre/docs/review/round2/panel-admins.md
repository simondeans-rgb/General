# Round 2 panel report: office administrators (group "admins")

> **Simulated panel.** The three personas are fictional. They are the same people as in round 1 (`../panel-admins.md`): **16 Nadia Okafor** (school administrator), **17 Ruth Achterberg** (finance and payments) and **18 Dev Bhattacharya** (reception). Their views are professional judgement applied to what I drove in the browser on 28 Nov 2026. This is not real user research. All data is synthetic. No email, SMS or card payments are connected.
>
> Labels used below: **Observed** means I saw it in the browser. **Code-verified** means I read it in source but did not drive it. **Opinion** means persona judgement. **Unverified** means it is an assumption.

---

## 1. Method and limitations

- **Tool and app.** Playwright with Chromium, against the shared preview at `http://127.0.0.1:8080/General/studio-next/`.
- **Who I signed in as.** Mostly Nadia Okafor (admin). I used Freya (owner) for the owner-only history and for switching on absence credit, and Hannah (guardian) to report an absence. Each run used a fresh browser context. Where a flow needed several roles, I switched the session inside one context so they all shared the same in-browser database.
- **Scripts:** `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel2/admins/` (`a.cjs` … `p.cjs`, `w.cjs`).
- **Viewports.**
  - Desktop 1440×900 for every flow.
  - One phone pass at 390×844 (isMobile, touch): sideways-overflow check on 6 routes, plus the reception look-up.
  - I did not re-test 200% text or the dark Urban style for this group. Other groups cover those.
- **Interaction counts** are the clicks, fills and selects my scripts made. Elapsed times include fixed waits the scripts added, so treat them as upper bounds.

**Limitations**
- Each browser context has its own PGlite database, so I could not test two office users working at once.
- After a save, the demo often takes 1.5–4 s to refresh the open panel (see U1). Some of that may be the in-browser database rather than the UI design. This is unverified for a server-backed build.
- Card payments, real email/SMS delivery and real sign-in are still not built (decisions R-001/3/6), so I did not test them.
- I did not drive the scheduled jobs: waiting-list offer expiry and due-in-3-days reminders.
- Seed attendance percentages still vary between contexts. Clara Wright showed 72%, 83% and 78% in three runs.

---

## 2. What changed since round 1 (our complaints re-checked)

| # | Round-1 complaint (persona) | Now | Evidence |
|---|---|---|---|
| D1 | Edit student crashed (16, 18) | **Fixed.** Clara's DOB and "Known as" were edited in 6 interactions and kept after reload. *New minor issue:* the open panel kept showing the old values until I closed and reopened it (U1). | `admins-03-student-history.jpg` |
| — | DOB shown without year (16) | **Not fixed.** The panel still reads "Date of birth 11 Feb". | `admins-03` |
| D3 | Enquiry not linked to trial; 6 fields re-typed (16, 18) | **Fixed.** "Book a trial now" on save, or "Book a trial" on the card. The trial sheet says "Filled in from the enquiry". The card moved to *Trial booked* on its own and the funnel went 18→19 / 14→15. Round 1 took 24 interactions; now it takes **12**. | `admins-06`, `admins-08` |
| — | Enquiry card can't be opened (16) | **Fixed.** The detail shows stage, contact, source, trial date and follow-up date, plus "Not joining — close it". *Still missing:* notes or a call log. | `admins-08-enquiry-detail.jpg` |
| — | Enquiries not in ⌘K (18) | **Fixed.** "Tayo" returns "Enquiry · Bola Adenuga". | log |
| — | ⌘K "INV-1065" returns the Rahman family (18) | **Not fixed, and now worse to read.** Rahman family is the *first* result. The invoice result says "issued" while Billing says "Overdue". | log |
| D9 | Trial outcome before the class (16) | **Fixed.** "Came or joining: after the class". | `admins-08` |
| D13 | Funnel figures unexplained (16) | **Fixed.** Explanatory sentence under the funnel. | Enrolment screen |
| D4 | Two offers for one place (16) | **Fixed.** With the class full, Offer is disabled ("No free place — the class is full"). After a withdrawal, exactly one offer went out, shown as "Offer open until 1 Dec". Every other row reads "1 offer already out". | `admins-11-waitlist-single-offer.jpg` |
| D10 | Waitlist picker lists everyone (16) | **Fixed.** It shows 4 in-range children by default, with "Include 38 children outside the age range". | log |
| — | Move hidden behind Withdraw (16) | **Fixed.** A separate ⇄ icon and "Move to another class" on the student record. The sheet shows ages, price difference, free places (counting outstanding offers), an effective date, "Tell the family in the app", and the pro-rata billing effect. | `admins-13` |
| D5 | Trial families not told of cancellation | **Fixed (code-verified).** Announcement happens before trials are cancelled. The office gets a "Rebook a trial" notice (`0048_register_fixes.sql`). | code |
| D6 | £10 refund reopened a paid invoice as debt (17) | **Fixed.** Refund now asks "They were charged too much" (credit note; invoice stays settled) or "Recorded by mistake". The £10 refund on a £72 cash payment left the invoice **Paid**, with CN-1001 and "Nothing owed". | `admins-20-refund-sheet.jpg` |
| D7 | No goodwill credit / payment on account (17) | **Fixed.** "Add credit" (amount and reason; the family sees "Credit from the studio"), "Credit note" on any invoice, and an on-screen "Statement" with a running balance. | `admins-18` |
| D2 | Ending a family discount did nothing (17) | **Fixed.** "Fenwick family's discount has ended. The next run charges the full price." It is still gone after reload. *Still not fixed:* discounts are not shown on the family record. | log |
| D8 | Billing run would double-bill 27 families (17) | **Fixed.** "Everyone is invoiced". 27 families are listed under "Already billed for this period — skipped", each with an "Include anyway" override. | `admins-15-billing-run.jpg` |
| — | No bulk chase (17) | **Fixed.** "Remind overdue": 7 families, previews, location filter, **2 interactions** instead of about 32. *But* all 7 recipients are labelled "not using the app yet" (U3). | `admins-21` |
| D11 | Today card mixed failed with outstanding (17) | **Fixed in the app** ("3 Card payments failed — £162.00 declined", "See invoices"). **Still wrong on /welcome and in store image `04-today.png`**: "£612.00 outstanding in all · Retry" (B2). | `admins-00`, store image |
| — | "Retry" only filters (17) | **Fixed in the app** (renamed "Show failed"). /welcome still promises "failed cards you can retry". | /welcome |
| D14 | Family panel status differs from Billing | **Fixed** (INV-1065 shows "Overdue" in both). | `admins-04` |
| — | No audit history (16, 17) | **Partly fixed.** Each student and family record has "Show history" ("Nadia Okafor changed Clara Wright — changed date of birth, preferred name"). The school-wide History with CSV is **owner-only**, so Ruth and Nadia cannot read the finance trail. Both views are cluttered with seed rows: "Swayvo (automatic) created …". | `admins-03` |
| D15 | Duplicate families, no merge (16, 18) | **Fixed as a tool; the data is still dirty.** A banner reads "3 possible duplicate families. Review". Compare shows a side-by-side and "Merge into …" with 30-day undo. The two "Sullivan family" records (same guardian email) are still in the seed, and pickers still show two identical "Haddad family" and "Osei family" names. | `admins-24` |
| — | No bulk messages from People (16) | **Fixed.** Filter by class or status, then "Message these 12". | log |
| — | Not notified on move; no effective date (16) | **Fixed.** "Plan the move" for 5 Dec: "The family has a message in the app." | log |

**Net:** of the 15 round-1 defects that affected us, **13 are fixed**. One is partly fixed (audit history). One is not fixed (the ⌘K invoice false positive). The "database ahead of the UI" theme from round 1 has largely closed.

---

## 3. UI review (screen by screen)

| ID | Screen | Observation (observed unless stated) | Sev. | Shot | Concrete improvement |
|---|---|---|---|---|---|
| U1 | Several sheets: student edit, credit note, Who pays, family discount | After Save, the sheet closes and the panel behind keeps the **old** values for 1.5–4 s. In one case it stayed stale until I reopened it (Clara still "23 Oct" after saving 11 Feb). Credit note: the invoice read "£54.00 still to pay" for about 1.5 s, then "£44.00". Who pays: "whole family" for about 2 s, then "50/50". There is no saved toast. A busy receptionist will save twice or doubt the system. | **High** | `admins-03`, log | Keep the sheet open with a "Saved" state until the refetch resolves, or update the cache optimistically. Always show a one-line confirmation ("Credit note CN-1001 issued, £10 off INV-1066"). |
| U2 | Classes → Move sheet | A 5-year-old moved to "Adult Contemporary (drop-in) 18+": the age notice says "**You can still move them if the teacher agrees**". Pressing Move then fails with "Nell is 5, and Adult Contemporary is for ages 18 and over". The copy contradicts the rule. The sheet's section labels "AGE" and "BILLING" use the huge display face, louder than the sheet title (which had scrolled off). | Medium | `admins-13` | Remove adult classes from the picker for under-18s, or disable them with "18+ only". Write the age notice from the rule (children's classes: "can move if the teacher agrees"; adult classes: "not allowed"). Use the small-caps label style for notice headings. |
| U3 | Billing → Remind overdue | All 7 families are marked "not using the app yet", and there is no email. "Send 7 reminders" still succeeds, with "Sent to 7 families", although nobody will see them. Template tokens `{{guardian_name}}` appear raw in the editable body. | **High** | `admins-21` | Put the reach in the button: "Send 7 · **0 will see it today**". Offer "Download letters / CSV for your mail tool" (the import wizard already exports invitation links). Show tokens as chips ("Guardian name"). |
| U4 | Billing → Location filter | Choosing Blackheath Studio filters the invoice list, but the four summary tiles still read £612 / 8 families. The absence-credit list below is not filtered either. | Medium | log | Make the tiles follow the filter and label them "Blackheath: £…". Or move the location filter to the page header so it is obviously global. |
| U5 | Invoice → Credit note | A credit note is reported as "£10.00 of £54.00 paid" and "part paid". Ruth: "A credit note is not a payment. My aged-debt report and the parent will both read this as cash received." | Medium | `admins-18` | Show "£54.00 · credited £10.00 · £44.00 to pay". Keep "paid" for money received. |
| U6 | Billing runs → Skipped list | Each skipped family shows two numbers side by side: "Billed on INV-1057 · £72.00 · Include anyway · £285.46". There is no label for what £285.46 is, and the gap is large (Lindgren £126 vs £24.50). | Medium | `admins-15` | Label it "This run would charge £285.46". Add a "Why different?" line (classes added since, pro-rata, discounts). |
| U7 | Billing runs → Family discounts | It is still the only place discounts live. The family record does not mention a discount. The family picker shows one "Haddad family" and one "Osei family", although there are two of each. Ending a discount is one click with no confirmation. | Medium | log | Add a "Discounts" line to the family Account section with Add/End. Disambiguate pickers with the guardian name ("Haddad family — Rana"). Confirm End, or offer Undo. |
| U8 | ⌘K search | "INV-1065" lists Rahman family *first*, then the invoice with status "issued" (Billing says Overdue). | Low | log | Rank exact invoice-number matches first. Use the same status word as Billing. |
| U9 | Class panel | When opened, it briefly shows "Register (0)" and no waiting list. Both appear about 2–3 s later. An admin can read this as "nobody is enrolled". | Low | log | Show a skeleton row and "Register (…)" until loaded. |
| U10 | Student panel | The DOB has no year ("11 Feb"), so the office can't check a birthday against a birth certificate without opening Edit. | Low | `admins-03` | Show "11 Feb 2021 (5)". |
| U11 | People → Duplicates | The banner loads about 5 s after the list. Compare names both sides "Sullivan family". The merge preview says "Moves… 1 guardians", and that guardian is the *same* Grace Sullivan (same email). After a merge she may appear twice. I did not merge, so this is unverified. | Low | `admins-24` | Label the sides "Sullivan family (Erin)" and "Sullivan family (Clara, Lily, Nia)". Fold guardians with the same email into one. Fix the plurals. |
| U12 | Record history | Each record's history is dominated by "Swayvo (automatic) created …" seed rows. The school-wide History is owner-only. | Medium | `admins-03` | Default the filter to "people's changes" and collapse system rows. Give admins a read-only finance and records history (see F3). |
| U13 | Absence-credit list (Billing) | The list works: "Wright family · Amir — Senior Tap 3 Dec — £5.00", and the "£5.00 held as credit" tile updated. But rows don't link to the family, there's no date range, and the list is capped at "latest 50". The credit is given automatically on the parent's report, with no office review. | Low | `admins-23` | Link the rows. Add a month filter and CSV. Add an optional "review before crediting" setting. |
| U14 | Phone (390 px) | No sideways overflow on /today, /people, /enrolment, /billing, /schedule or /inbox (scrollWidth 390). Family look-up took 3 taps, and the Account block (owes, reference, Record payment, Add credit, Who pays) is at the top. Guardian email and phone links are only 20 px tall. | Low | `admins-29` | Make contact rows 44 px tap targets, with call and email icons. |
| U15 | Today | Clear, unchanged structure. The failed-card line is now correct. The page is still dominated by the giant "09:15" clock, which matters less to the office than the attention list. | Low (opinion) | `admins-00` | For admin roles, put "Needs attention" first and shrink the next-class hero. |

**What works well (observed):** the trial sheet prefilled from an enquiry; the waiting-list guard wording ("No free place — 1 offer already out"); the move sheet's billing explanation; the refund "what is this refund for?" choice; the Statement; the skipped-family list in billing runs; and filter-then-message in People.

---

## 4. Feature and function ideas

| # | Feature | Problem it solves | Who | Rating | Size / area | Risk |
|---|---|---|---|---|---|---|
| F1 | **Email/SMS delivery** (R-003), plus a "reach" count on every send | Reminders, offers and move notices go to families who aren't on the app (7 of 7 overdue families) | All three | **Essential** | L, `lib/outbox`, provider | Cost; quiet hours; consent |
| F2 | **Bank-statement CSV import with matching** (UR-61, deferred) | Ruth still matches bank lines by hand; payment references (FENWICK-0025) already exist to match on | 17 | **Highly desirable** | M, `billing`, new import sheet | Mis-matches need review |
| F3 | **Admin-readable finance and records history** (role-scoped, with CSV) | Finance can't audit refunds, credits and discount changes without the owner | 16, 17 | **Highly desirable** | S, `history-card.tsx`, RLS on `audit_log` | Must still hide medical and safeguarding rows |
| F4 | **Refund, credit and void permissions** (for example "Finance" role, or a limit above £x needing owner approval) | Any admin can credit or refund unlimited amounts | 17 (16 disagrees) | Highly desirable | M, roles, `0052` money functions | Slows the desk |
| F5 | **Enquiry notes / call log and follow-up reminders on Today** | Callbacks are lost; the card has no notes | 18, 16 | Highly desirable | S, `enquiry` table, enrolment card | — |
| F6 | **"Which class fits?" finder** (age + day + free places), with "Book trial" | Reception answering "my 7-year-old, Tuesdays?" | 18 | Useful | S, `/enrolment` or ⌘K | — |
| F7 | **On-screen aged debt** (0–30/31–60/60+) with bulk select | Aged debt is still CSV only | 17 | Useful | S, `/billing` | — |
| F8 | **Printable / PDF statement and invoice** | Families without the app; Ruth's month-end | 17 | Useful | S, statement component | — |
| F9 | **Discounts on the family record**, with an expiry reminder | Bursaries are forgotten or never ended | 17, 16 | Useful | XS–S, `people/page.tsx` Account | — |
| F10 | **Undo toast for one-click actions** (end discount, decline waitlist, confirm event entry) | Mis-clicks at the desk | 16, 18 | Nice to have | S, shared toast | — |

---

## 5. Branding feedback (end-user perception, office view)

- **Name and lockup (opinion).** "Northstar Dance Academy, powered by swayvo" in the sidebar is right for us. Parents and staff see *our* school first. Nadia: "I don't need to know the software's name to do my job, and it's there if I need support." The small wordmark is fine at that size.
- **Colour and type (observed).** The navy action colour, red/amber status numbers and "Overdue/Card declined" words are clear. Ruth, who is dyslexic, likes that statuses are words with icons, not colour alone. The display face is heavy. It is good for the "09:15" hero, but too loud when it leaks into form notices ("AGE", "BILLING" in the move sheet, `admins-13`).
- **Voice (observed).** Mostly plain and honest. Examples: "No free place — 1 offer already out"; "Hand the money back first — this records that you have"; "Existing invoices are not changed". The voice falls short where the copy promises more than the system does (U2 age copy, U3 "Sent to 7 families").
- **/welcome and store images (observed).**
  - Both still show the round-1 defect: "3 Card payments failed — £612.00 outstanding in all · **Retry**".
  - /welcome's Money line says "failed cards you can retry". Cards aren't connected, and the app itself now says "Show failed".
  - Ruth: "If I saw that on the website and then in the app, I'd wonder which one is lying."
  - Regenerate both from the current app, and drop "retry" until R-006.
- **Consistency.** The app is consistent across office screens. The marketing material is behind the product.

---

## 6. Individual panel member reports

### Persona 16: Nadia Okafor, school administrator (simulated)

- **What's better.**
  - I fixed Clara's birthday in six clicks. Round 1 crashed the screen.
  - The enquiry I typed came straight into the trial sheet, and the card moved itself to "Trial booked". That's the one I cared most about.
  - Waiting lists can't promise one place twice any more. The screen says why.
  - Moving a child is its own button. It tells me the price difference, what the next bill will do, and it messages the family.
- **What still frustrates.**
  - After I press Save, the panel still shows the old date for a while. Once it never updated until I closed it. I re-checked everything twice.
  - The move sheet told me a 5-year-old "can still" go into an adult class, then refused when I pressed Move.
  - I can see a child's history, but not the school's.
  - Most of the history is "Swayvo (automatic) created…".
- **Top 5 UI improvements.**
  1. Saved confirmations and an instant panel refresh (U1).
  2. Remove adult classes from children's move and enrol pickers (U2).
  3. DOB with year (U10).
  4. Hide the system rows in history (U12).
  5. Attention list first on my Today (U15).
- **Top 3 feature requests.**
  1. Email/SMS delivery (F1, Essential).
  2. Enquiry notes and follow-ups on Today (F5, Highly desirable).
  3. Admin history view (F3, Highly desirable).
- **Branding.** Our name leads, which is what I want. The big clock is lovely for teachers; I'd rather see my list first. The heavy capitals inside forms look shouty.
- **Scores.**

| Relevance | Quality | Completeness | Ease of use | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 7 | 8 | 8 | 8 | 7 | 8 | 7 | 7 |

**Overall: 7.5/10 (round 1: 6).** Every blocker I raised is fixed. What holds it back is the stale-after-save feeling, and parents who won't see in-app messages.

### Persona 17: Ruth Achterberg, finance and payments (simulated)

- **What's better.**
  - Refunds finally ask what they're for. "Charged too much" issued CN-1001 and the invoice stayed Paid.
  - Credit notes, goodwill credit and a running Statement exist.
  - The billing run listed 27 families as already billed and charged nobody. That's the double-billing risk gone.
  - Ending the Fenwick bursary worked.
  - Reminding seven overdue families took two clicks.
- **What still frustrates.**
  - A credit note is shown as "£10.00 of £54.00 paid". It isn't paid; it's reduced.
  - The location filter changes the list but not the totals above it.
  - The run's skipped list shows £72.00 next to £285.46 with no label.
  - I still can't read the finance history myself. It's owner-only.
  - All seven reminders went to families "not using the app yet", and the screen still said "Sent".
  - The website still advertises card retries.
- **Top 5 UI improvements.**
  1. Credit shown as credit, not "paid" (U5).
  2. Totals follow the location filter (U4).
  3. Label run amounts and explain differences (U6).
  4. Reminder reach and a letter/CSV fallback (U3).
  5. Discounts on the family record (U7).
- **Top 3 feature requests.**
  1. Bank-statement import with matching (F2, Highly desirable).
  2. Refund, credit and void permissions (F4, Highly desirable).
  3. Admin finance history with CSV (F3, Highly desirable).
- **Branding.** Status words are clear and accessible. The marketing still shows the old wrong Today card. Fix that before a bookkeeper sees it.
- **Scores.**

| Relevance | Quality | Completeness | Ease of use | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 7 | 7 | 7 | 8 | 8 | 7 | 7 | 7 | 6 |

**Overall: 7/10 (round 1: 5).** The ledger is now safe. Wording and reporting details, plus no bank import, keep me exporting to Xero for reconciliation.

### Persona 18: Dev Bhattacharya, reception (simulated)

- **What's better.**
  - At the desk: "New enquiry", then "Book a trial now", and everything's filled in. 12 taps instead of 24.
  - Search finds enquiries.
  - On my phone, the family opens with "Owes £126.00", the payment reference and "Record payment" right at the top.
  - The duplicates banner means I can stop guessing which Sullivan is which.
- **What still frustrates.**
  - Typing an invoice number still shows the wrong family first.
  - Pickers show "Haddad family" twice with nothing to tell them apart.
  - The phone numbers on the family card are tiny links.
  - There's nowhere to note "called back, wants Saturdays".
  - Confirmations still can't go by text.
- **Top 5 UI improvements.**
  1. Exact invoice match first in ⌘K (U8).
  2. Guardian name in family pickers (U7/U11).
  3. Big call and text buttons on phone (U14).
  4. Saved confirmations (U1).
  5. A loading state on the class panel (U9).
- **Top 3 feature requests.**
  1. Email/SMS (F1, Essential).
  2. Enquiry notes and follow-ups (F5, Highly desirable).
  3. Class finder (F6, Useful).
- **Branding.** It looks modern and calm, and parents see our star logo. The store pictures look great, but they show an old screen.
- **Scores.**

| Relevance | Quality | Completeness | Ease of use | Efficiency | Usefulness | Adoption | Continued use | Visual/UI | Brand appeal |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 | 7 |

**Overall: 7.5/10 (round 1: 6.5).** Intake is now as quick as look-ups. Text confirmations are the gap.

---

## 7. Votes (machine-readable)

| Persona | Top UI 1 | Top UI 2 | Top UI 3 | Feature 1 (rating) | Feature 2 (rating) | Feature 3 (rating) | Remove / simplify | Greatest impact |
|---|---|---|---|---|---|---|---|---|
| 16 Nadia | Saved confirmation and refresh | Age-safe move picker | DOB with year | Email/SMS delivery (Essential) | Enquiry notes and follow-ups (Highly desirable) | Admin history view (Highly desirable) | System rows in history | Saved confirmation and refresh |
| 17 Ruth | Credit shown as credit | Totals follow location filter | Label billing-run amounts | Bank statement import (Highly desirable) | Refund/credit permissions (Highly desirable) | Admin history view (Highly desirable) | "Retry" claims on /welcome and store images | Bank statement import |
| 18 Dev | Invoice search ranking | Disambiguate family pickers | Phone call/text targets | Email/SMS delivery (Essential) | Enquiry notes and follow-ups (Highly desirable) | Class finder (Useful) | Pipeline "Move to" menu on every card | Email/SMS delivery |

---

## 8. Group summary

**Consensus**
- Round 2 fixed nearly everything we raised: student edit, enquiry→trial, safe waiting-list offers, credit notes and refunds, the billing-run guard, ending discounts, goodwill credit, bulk reminders and messages, per-record history, and duplicate merge.
- The remaining UI problems are about **trust in feedback**:
  - stale panels after save (U1);
  - "sent" messages that no one can receive (U3);
  - copy that contradicts the rule (U2);
  - "paid" used for credit (U5).
- The marketing assets lag the product (B2: /welcome and `04-today.png` still show "£612 outstanding in all · Retry").

**Disagreements (kept)**
- **Refund/credit permissions.** Ruth wants refunds and credits above a threshold to need the owner or a finance role. Nadia wants to settle a parent's complaint at the desk without waiting.
- **History.** Ruth wants the full school history for admins. Nadia only needs per-record history, but without system noise. Both agree medical and safeguarding rows must stay hidden.
- **Board vs list.** Dev still finds the per-card "Move to" menu redundant now that cards move themselves. Nadia likes the board for a stage overview.

**Group scores (mean of the three personas)**

| Measure | Round 1 | Round 2 |
|---|---|---|
| Overall | 5.8 | **7.3** |
| Ease of use | 6.3 | 7.7 |
| Efficiency | 4.7 | 8.0 |
| Completeness | 5.0 | 7.0 |
| Adoption likelihood | 5.7 | 7.3 |
| Continued use | 6.3 | 7.7 |
| Visual design/UI | — | 7.3 |
| Brand appeal | — | 6.7 |

**Screenshots** (`shots/`): admins-00-today-desktop, 03-student-history, 04-family-record, 06-book-trial-from-enquiry, 08-enquiry-detail, 11-waitlist-single-offer, 13-move-under5-to-adult-warning, 15-billing-run, 18-invoice-after-credit-note, 20-refund-sheet, 21-remind-overdue-bulk, 23-absence-credit-list, 24-possible-duplicates, 29-phone-family-lookup.
