# Round 2 panel review: students and prospective customers ("students" group)

> **Simulated panel.** The personas, their quotes and their scores are professional judgement by an AI reviewer. They are not real user research. All data is the synthetic Northstar Dance Academy seed. Email, SMS, push and card payments are not connected in this build (R-001, R-003, R-006), so nothing in this report says anything about them.
>
> Each finding is labelled **Observed** (driven in the browser), **Code** (read in the source, not run), **Opinion** (persona or reviewer judgement) or **Unverified**.

Same six people as round 1 (`docs/review/panel-students.md`, 27 Nov):

| # | Persona | Round 1 overall |
|---|---|---|
| 1 | Maya, 10, recreational ballet and street (seen through her dad) | 5 |
| 2 | Amir, 15, competitive street, tap and contemporary | 7 |
| 3 | Gareth, 52, adult tap and contemporary, dyslexic, larger default font | 3 |
| 4 | Priyanka, 34, adult beginner who has never danced | 5 |
| 5 | Sofia, 17, pre-professional, auditions next spring | 5.5 |
| 23 | Ruth, 39, choosing a school for her 10-year-old; low vision, large iOS text | 5.5 |

---

## 1. Method and limitations

**Driven with Playwright and Chromium** against the shared preview at `http://127.0.0.1:8080/General/studio-next/`, on 28 Nov 2026 (a Saturday). Phone 390×844 (isMobile, touch) unless stated. Each run used a fresh browser context.

| Script (in `scratchpad/panel2/students/`) | Who | What |
|---|---|---|
| `amir.cjs` | Amir (`uid(2,40)`) | `/learn`, the bell, "I can't make it", `/learn/timetable`, `/learn/feedback` with "Then and now" and the timeline, `/learn/library`, `/learn/events`, root font-size 200% on three screens, axe-core (WCAG 2.0/2.1/2.2 A and AA) on five screens, desktop 1440×900 feedback |
| `absence.cjs` | Amir, then Hannah in the same context | Sent an "I can't make it" for Friday 4 Dec Street Seniors, then checked `/learn`, `/learn/timetable` and Hannah's `/family` for a marker |
| `public.cjs` (2 runs) | Anonymous visitor (Ruth, Priyanka), then Nadia, then the new adult | `/join?school=northstar`: child path at age 10, trial booking to confirmation (13 interactions); `/join` at 200% text; adult path, drop-in booking as "Gareth Hughes"; a drop-in under Hannah's existing email; Nadia invited Gareth from `/account`; Gareth accepted and used `/family`, `/family/children` ("You"), `/family/schedule`, `/family/payments`, `/family/feedback` |
| `hannah.cjs` | Hannah (`uid(2,11)`) | `/family/feedback` for Nia (9) and Clara (5); `/family/children`; **Book for myself** sheet → "Add me" → the drop-in list; `/family/schedule` |
| `maya.cjs` | Hannah on a tablet (820×1180) | "Share with Nia", the child view |

Raw logs are next to the scripts (`*.log`, `*.out.txt`). There are 16 screenshots in `docs/review/round2/shots/students-*.jpg`.

**Code read:** `src/app/join/page.tsx`, `src/app/learn/**`, `src/app/invite/page.tsx`, `src/app/account/page.tsx` (InviteSheet), `src/components/app/{adult-self,absence-report,child-view,consents,progress,brand}.tsx`, migration `0053_accounts_fixes.sql`, seed `src/lib/db/seed/data.ts`, `docs/review/FIXES.md`, `public/brand/store/*.png`.

**Limitations**
- **Load.** The machine was shared with other panel groups (load average 28). First loads took 27–75 s and later screens 3–5 s. Do not read any timing here as product performance.
- **One database per context.** The in-browser database belongs to the context, so an action in one run is not visible in another. Cross-person checks (Amir's absence seen by Hannah; Gareth's invite) were done inside a single context.
- **Still no under-13 login.** This is deliberate and now a database rule (UR-55). Maya was assessed through Hannah's view of Nia (9) and the new child view.
- **Sofia was assessed on Amir's hub**, the closest seeded student. The seed has about one month of skill history, so "Then and now" over 3, 6 or 12 months could not be tested with real change.
- **Not tested:** Dark "Urban" style (no Kestrel student is seeded), screen readers, and real iOS Dynamic Type. Larger text was simulated by setting the root font-size to 200%, which approximates the browser's default-font setting.
- **Not re-checked in the UI:** whether Hannah's public drop-in under her own email created an adult record for her rather than booking Amir (round-1 D1). FIXES UR-06 says it now does. The public confirmation was correct, and the parent drop-in list now says "Not for Amir's age" (Observed), but I did not open Hannah's invoices in that context. This stays **Unverified**.

---

## 2. What changed since round 1 (complaints re-checked)

| Round-1 complaint (persona) | Status now | Evidence |
|---|---|---|
| No adult account; the invite to an existing guardian failed with "only the office can change who is linked" (Gareth, D2) | **Fixed**, with copy gaps | Observed. Gareth booked a drop-in, Nadia invited him, he accepted and landed on `/family`, which now says "Your classes", "Your payments" and a "You" tab (`students-21`). Gaps: the invite says "invited as a parent in the Hughes (adult)"; "You" says "You're not in a class yet" while a drop-in is booked; and an "Add a child" button sits at the top (`students-22`) |
| Adult wording and "your child" everywhere (Gareth) | **Mostly fixed** | Observed: "Your classes", "Feedback from your teachers", "You". Still child-shaped: "Practice · Your teacher sees the weekly total" on a drop-in adult, "Add a child" |
| Parents who dance had no route (Hannah, raised by Gareth) | **Fixed** (new) | Observed: "Book for myself" → "Add me" (DOB or "18 or over", plus an emergency contact). Hannah becomes "Hannah Wright (you) · Adult student" with "Book a class"; packs are shown (5 for £50, 10 for £90) |
| Exam entries visible to the parent but not to the student (Amir, Sofia, D3) | **Fixed in code, not seen** | Code: `/learn/timetable` has an "Exams · Entries and results" section (`MY_EXAMS`). Amir has no seeded entry, so it did not render. Re-test with an entry |
| Rehearsals and events not in the timetable (Amir) | **Partly fixed** | Observed: the subtitle is now "Your classes, rehearsals, shows and exams", and "Add all to my calendar" exists. Amir's requested workshop and the show rehearsal still appear only on Events, because they are not yet confirmed (`students-05`, `students-09`) |
| No student absence reporting (Amir) | **Fixed** | Observed: "I can't make it" on `/learn` → tick classes (four weeks listed) → optional note → Send → "DONE · Your teacher will see this on the register… You can withdraw it here until the class starts" (`students-03`, `students-04`). Gap: no "reported absent" marker afterwards on `/learn`, `/learn/timetable` or Hannah's `/family` |
| No notifications for students (Amir, C2) | **Fixed**, with wrong empty copy | Observed: there is a bell. Its empty state reads "Payments, messages, trials and enrolments appear here", none of which a student gets (`students-02`) |
| Timeline of 21 identical rows; no progress history (Sofia, Amir) | **Fixed** | Observed: the timeline groups them into "24 Nov · 21 skills assessed" (expandable). New "Then and now" with a 1, 3, 6 or 12-month picker (`students-07`). Because of seed depth every row reads "New → Mastered" |
| Ballet skills orphaned (D6) | **Fixed** | Observed: a collapsed "Earlier styles · Ballet" |
| Unassessed skill grids for juniors (Maya) | **Fixed** | Observed: Nia's skills now read "No skills marked yet…", with "Prefer notes only? You can switch skill levels off for Nia" (`students-24`) |
| Nothing for the child herself (Maya) | **Fixed** (new) | Observed: "Share with Nia" opens a large-type "Well done, Nia" view with the note, "Next time, try:" and "Things you have done" (`students-28`) |
| Text ignores the user's font size (Gareth, Ruth, D4) | **Fixed for scaling; new layout breakages** | Observed: 36 of 37 sampled elements on `/learn` doubled, with no sideways scroll. But the `/join` slot rows collapse to one word per line, and the price text overlaps the class details (`students-18`). The app header takes about 30% of the screen, the bell icon does not scale, and the tab labels truncate ("Tim…", "Libr…", `students-11`) |
| "Your child's age" for adults; "No trial places" dead end (Priyanka, Gareth, C1) | **Fixed** | Observed: `/join` starts with "Who is the class for?" ("I'm booking for myself" / "For my child") |
| No class suitability or price on `/join` (Priyanka, Ruth) | **Fixed** | Observed: rows show level ("A year or more of dance"; "All levels, including complete beginners"), a description, "Free trial, then £54.00 a term" or "£12.00", and places left. Choosing a class adds Level, Ages, Wear or bring and Price |
| Thin confirmation (Priyanka, Ruth) | **Fixed**, two gaps | Observed: When (with end time), Where (full address and "Open in maps"), Wear or bring, Arriving, If you can't come (24 h, phone and email), What happens next (with term price) (`students-17`). Missing: a booking reference and add-to-calendar. The phone and email are plain text, not tappable |
| No allergy or medical questions at trial (Ruth) | **Fixed** | Observed: "For the teacher": allergies or medical needs (required yes/no), another emergency contact, and photo consent |
| `/welcome` not for families (Priyanka, Ruth) | **Not fixed** (by design) | Observed: still a business-to-business page, with "Book a demo" and "Try the demo" and no route to a school's `/join` |
| Practice log save feedback (Amir, D5) | **Not re-tested** | — |
| Packs not offered publicly (Gareth) | **Not fixed** | Observed: the public drop-in says "ask the school about a class pack". Packs are shown only once signed in |

**Net:** 13 of the 17 round-1 complaints are fixed or mostly fixed, 2 are partly fixed, and 2 are not fixed. One new regression class appeared: the large-text layout on `/join` and the app header.

---

## 3. UI review (screen by screen)

### `/learn` (student home)
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| L1 | **Observed.** "NEXT · THURSDAY" and the list rows "Thursday" and "Friday" have no date. On a Saturday, "Thursday" means 3 Dec, and the fourth row switches to "10 Dec". The same list mixes two formats | Low | 01 | Always show weekday plus date ("Thu 3 Dec"), as the timetable does |
| L2 | **Observed.** After sending "I can't make it" for Fri 4 Dec, `/learn`, `/learn/timetable` and the parent's `/family` still list Street Seniors with no marker. "Withdraw it here" refers to a dialog Amir has already closed | Medium | 04 | Put a "REPORTED ABSENT · Withdraw" word on the row, using the existing Notice word pattern, in the student timetable, the `/learn` list and the parent's week |
| L3 | **Observed.** "I can't make it" appears about a second after the list renders (it was missing from the first screenshot), so the action row jumps | Low | 01 vs 02 | Reserve the space, or render the button disabled until the check resolves |
| L4 | **Observed.** The bell's empty state says "Payments, messages, trials and enrolments appear here" to a 15-year-old | Low | 02 | Give each role its own empty copy: "Cancellations, cover teachers and changes to your classes appear here" |
| L5 | **Observed, axe.** "definition-list" and "dlitem" are serious on `/learn`: the student's "Photos and filming" list nests `dt`/`dd` inside an extra `div` (`consents.tsx:235-246`). The other four student screens were clean | Medium (a11y) | — | Make each `div` a direct child of `dl` holding a `dt` and its `dd`s, and move the description into the same `dd` |
| L6 | **Opinion (Amir).** "Photos and filming" is a long block on the home screen, with three rows and descriptions. It is useful once and noise every day | Low | — | Collapse it to a single line ("Photos: not allowed · Video: not recorded · Details") or move it under the avatar |

### `/learn/timetable`
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| T1 | **Observed plus seed.** Thu 18:30 Senior Tap (60 min, **Blackheath**) and Thu 19:00 Contemporary Seniors (**Greenwich**) overlap by 30 minutes in different buildings. No end times are shown, so nothing tells Amir | Medium | 05 | Show end times ("18:30–19:30"). Flag overlaps and travel between sites in words ("Overlaps Senior Tap by 30 min, different studio"). Teachers got a cross-school clash check in round 2; students need the same in their own diary |
| T2 | **Observed.** The calendar action is an icon-only square in the header. Its name, "Add all to my calendar", is an accessible label, not visible text | Low | 05 | Add a visible "Calendar" label on phone, or a text link under the list |
| T3 | **Observed.** Requested events (the workshop) and the show's dress rehearsal are absent because they are unconfirmed | Low | 05/09 | Show "requested" items greyed, with the status word, so the diary is complete |

### `/learn/feedback`
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| F1 | **Observed.** "Then and now" lists 15 rows reading "New → Mastered", "New → Secure" and so on. "New" means "not assessed before the window", which reads like a level | Medium | 07 | Say "First assessed 24 Nov: Mastered". Show "→" only when there is a real earlier level, and sort real changes first |
| F2 | **Observed.** On a phone the page is very long: notes, three styles × five skills, Then and now (15 rows), milestones, reflection, goals, timeline. The full-page capture is about 4,000 px | Medium | 07 | Give styles a header with the counts (Mastered 1 · Secure 2 · Developing 2) and collapse each style by default; put Then and now behind a tab or a "Compare" toggle |
| F3 | **Observed.** "2 more to come as the teacher assesses them" is kind and clear (fixes Maya's round-1 complaint) | Positive | 06/07 | Keep |
| F4 | **Observed, 200%.** At 200% text the header (logo, title, bell, avatar) stacks over about 260 px, the bell icon stays tiny, and the bottom tabs truncate ("Tim…", "Libr…", "Fee…", "Eve…") | Medium | 11 | At large text, keep the header to one row (title only, actions in a menu), scale the icons in `rem`, and use icon-only tabs with a visible active label |

### `/learn/library`, `/learn/events`
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| E1 | **Observed.** Events offers Amir "Ask to take part" for the "RAD Grade 3 Ballet examinations", although he takes no ballet | Low | 09 | Offer exam sessions only to students in that style or class; others see "For ballet students" |
| E2 | **Observed.** "Entries close 29 Nov" (tomorrow) and "Entries close 3 Dec" are shown in the same weight as everything else | Medium (Amir) | 09 | Highlight a close within 7 days ("Closes tomorrow") in the caution colour, and put it in the bell |
| E3 | **Observed.** Library tabs include "Videos 0", an empty filter shown as a tab | Low | — | Hide zero-count filters |
| E4 | **Observed.** The workshop row says "Amir · Requested — waiting on the studio". Using his own name on his own screen reads oddly | Low | 09 | Say "You · Requested" on the student hub |

### `/join` (public trial and drop-in)
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| J1 | **Observed.** Child, age 10: the page shows only a "Show later dates (2 more days)" button. There is no class, no message, and no explanation that nothing is on in the next 7 days (today's 10:30 class has passed) | **High** (conversion) | 15 | When the first week is empty, show the later dates automatically, or say "Nothing for age 10 in the next 7 days. Next: Sat 5 Dec" |
| J2 | **Observed, 200% text (Ruth).** Slot rows use a fixed three-column grid (`4.25rem / 1fr / auto`). At 200% the middle column becomes one word per line ("Ages / 9– / 13 / · / A / year…") and the price column overlaps it (`students-18`) | **High** (a11y, the persona's core need) | 18 | Below roughly 30 rem of available width, stack the row: time on its own line, class and details full width, then price and places as a line beneath. Test at 200% in CI, not just for sideways overflow |
| J3 | **Observed.** At age 10 the only class is "Jazz Intermediate · A year or more of dance". A beginner 10-year-old has no option and no route to enquire | Medium | 15 | When no class suits, offer "Tell the school about your child" (the enquiry flow exists for the office, UR-18) with age and experience |
| J4 | **Observed.** Before choosing a path there is nothing about the school: no address, contact, photo (no hero is set in this seed), safeguarding statement or "how trials work" | Medium (Ruth) | 15 (top of page) | Add a short "About" strip under the name: area or studios, phone, "DBS-checked teachers · first-aiders on site" (from staff-check data), and a three-step "Trial → we call you → join" |
| J5 | **Observed.** Adult drop-in facts read "Price · then £12.00 a class". "then" has no preceding trial | Low | — | Drop "then" when there is no trial price (`ClassFacts` in `join/page.tsx`) |
| J6 | **Observed.** The confirmation has a full address and maps, but no booking reference, no add-to-calendar (.ics), and the phone and email are plain text. "If you can't come" repeats as its own first words | Medium | 17 | Add a reference (the trial id, shortened), ".ics" and `tel:`/`mailto:` links, and drop the repeated words |
| J7 | **Observed.** Adult path: "No adult trial classes in the next three weeks. Drop in to a class below instead." This is better than round 1, but the first thing Priyanka reads is still a "no" | Low | — | When there are no adult trials, hide "Try a class" and lead with "Drop in · no commitment" |
| J8 | **Observed.** The public drop-in confirmation says "pay on the night or online once the school sends your invoice". Card payment is not connected (Gareth's payments page says "Not available yet") | Low | — | Use the school's actual options ("pay at the studio or by bank transfer") until cards are connected |

### Adult views in `/family` (Gareth, and Hannah's "Book for myself")
| # | Observation | Sev. | Shot | Improvement |
|---|---|---|---|---|
| A1 | **Observed.** Invite page: "You have been invited as a parent in the Hughes (adult)." | Medium | — | For a family whose only student is the adult: "You've been invited to manage your own bookings at Northstar". Give the office an "Adult student" choice in the invite sheet rather than "Parent" plus a family |
| A2 | **Observed.** The "You" tab (`/family/children`) says "Classes · You're not in a class yet" while Home and Schedule show his booked drop-in on Thu 3 Dec | Medium | 21/22 | List drop-ins under Classes ("Adult Contemporary · drop-in, Thu 3 Dec · Cancel"); keep term classes and single bookings in one list |
| A3 | **Observed.** "Add a child" is the only header action on a solo adult's "Your details" page. Practice ("Your teacher sees the weekly total") and three consent rows with six buttons fill the first screen | Medium (Gareth) | 22 | Solo adults: move "Add a child" into a menu, and lead with My bookings, Book a class, Cancel. Group consent into one "Photos and video: not recorded · Choose" line that expands |
| A4 | **Observed.** A parent's drop-in list, before "Book for myself", defaults the person picker to Amir and shows "Not for Amir's age" on every row | Medium | 25 | Default to the signed-in adult. If they have no adult record yet, show the "Book for myself" button inline in that list instead of a list of refusals |
| A5 | **Observed.** "Book for myself" is quick: one sheet, DOB optional or "18 or over", and an emergency contact required. The result reads "Done. You're on the account as an adult student." | Positive | 25 | Keep. Scroll the person to "Classes for you" after "Add me" |
| A6 | **Observed.** The `/family/children` page for Hannah on a phone is very long: three children, each with three consent rows, contacts, collection list, login, absence, update and practice | Medium | — | One collapsed card per person with status chips; open one at a time |

---

## 4. Feature and function ideas

| Idea | Problem it solves | Who | Rating | Size and area | Risk |
|---|---|---|---|---|---|
| **Absence and status markers in every diary** | A reported absence disappears from view (L2) | Amir, Hannah, Gareth | Essential | S: `components/app/diary.tsx`, `MY_DIARY`, family week list | None |
| **Student diary clash and travel check** | Back-to-back classes at different studios go unflagged (T1) | Amir, Sofia | Highly desirable | S–M: diary query (end times, location), shared with the teacher clash logic (UR-47) | False positives if the room changes |
| **Deadline nudges for entries** | Competition and exam entries close silently (E2) | Amir, Sofia | Highly desirable | S: events view plus scheduled job into the bell | Notification fatigue: limit to one nudge, 7 days out |
| **Public school profile on `/join`** | Prospects can't judge the school (J4) | Ruth, Priyanka | Highly desirable | M: `join/page.tsx`, a public view of studio info, staff-check counts | Exposing staff data: counts only, no names |
| **"Nothing suits? Tell us" enquiry from `/join`** | Dead end for beginners outside the classes on offer (J3) | Ruth, Priyanka | Highly desirable | S: reuse the UR-18 enquiry RPC | Spam: reuse the honeypot |
| **Booking reference, .ics and manage-booking link on confirmations** | No record or self-service after booking (J6) | Priyanka, Ruth, Gareth | Highly desirable | S–M: `Confirmation`, signed link to cancel a trial or drop-in | Link security: single-use token, short expiry |
| **"Adult student" invite and solo-adult layout** | Adults are framed as parents (A1–A3) | Gareth | Highly desirable | M: `account/page.tsx` InviteSheet, `invite/page.tsx`, `adult-self.tsx`, `/family/children` | Low |
| **Packs on the public page** | Regular adults must ask for packs | Gareth, Priyanka | Useful | S: `public_drop_in_sessions` plus pack list | Payment not connected: show as "buy at the studio" |
| **Reply to a feedback note (16+, visible to the teacher and the office)** | No dialogue on corrections (Sofia, round 1, still open) | Sofia | Useful | M: feedback thread table, RLS, teacher inbox | Safeguarding: never private staff–student; office-visible; optional per school |
| **Practice goals linked to skills, with a weekly target** | The practice log is a number, not a plan | Sofia, Amir | Useful | M: `practice.tsx`, goals | Pressure on young dancers: opt-in, 13+ |
| **Child view extras: class tracks and stickers** | The child view shows notes only; the library is still parent-only | Maya | Useful | S: `child-view.tsx` adds "Music for your class" | Links must open inside the parent's session |
| **Student video submission (16+, office-moderated)** | Audition prep (Sofia) | Sofia | Nice to have | L: storage, retention (0054 retention rules), consent | High safeguarding: keep deferred unless moderated and 16+ only |

---

## 5. Branding feedback

**Perception from end users** (Opinion, simulated):
- **School first, Swayvo second, works.** Every screen Amir, Gareth and Ruth saw leads with the Northstar star mark and name; "powered by swayvo" sits quietly at the foot. Ruth: "It felt like the school's page, not an app's." Nobody asked what Swayvo was, which is the intended layering.
- **The Notice words land.** BOOKED, DONE and DUE 3 DEC in heavy caps are the most memorable thing for Gareth ("I can't miss it") and Priyanka. The colour-plus-word pairing keeps status readable at large text.
- **The big time ("18:30") is still Amir's favourite piece of the brand.** The wide display face in the time and the headings feels "sporty, not twee".
- **Tone is plain and kind.** Examples: "Nothing is booked beyond this class until you say yes", "Your parents won't", "2 more to come as the teacher assesses them". Priyanka: "It talks like a person." One misstep in tone: "Well done, Nia" in the child view is lovely, but the screen is grey and bare for a 10-year-old. Maya (through her dad): "It's nice but it looks like homework." A little school colour or a sticker would help.
- **`/join` feels thin before you choose.** No photo (this seed has no hero image set), no colour band, and only the logo and "Book a trial class". Ruth compared it to "a form, not a school". The structure is right; it needs the school's own imagery and a sentence about who they are.

**Reviewer critique** (Opinion):
- **Name.** "Swayvo" is easy to say and type. To families it is invisible, which is correct for a white-label layer. No change.
- **Mark and logo.** The beat-bars mark next to "swayvo" is legible at footer size. In the store images (`public/brand/store/02-family.png`, `03-progress.png`) it is distinctive against Count blue.
- **Store images.** `03-progress.png` ("Progress you can see") is the strongest for this group, a real student screen with the quote and count bars. But it shows "Contemporary · 5 of 7 assessed", and the live app now says "5 assessed / 2 more to come". The `/welcome` mock also still shows "3 of 4 assessed" and a "Not yet" row that the app no longer shows. Refresh both so marketing matches the product.
- **`/welcome`.** "Five, six, seven, eight." is a strong opener. Two cautions:
  1. "the part nobody else does: each student's progress" is a competitor claim this panel cannot verify. Some competitors are believed to offer progress tracking (Unverified assumption). Soften it to "the part most tools leave out", or evidence it.
  2. The hero register mock shows children's medical notes ("Mild eczema; Emollient cream", "Allergy: Plasters (latex)") on a public sales page. They are synthetic, but Ruth flagged them as uncomfortable. Swap them for a neutral note, or label the mock "sample data".
- **There is still no family-facing door.** A one-line "Looking for a class? Ask your school for its booking link" on `/welcome` costs nothing and stops prospective families bouncing.
- **Consistency.** Status words, section rules and the big times are consistent across `/learn`, `/family` and `/join`. The inconsistency is in date formats ("Thursday", "10 Dec", "Thu 3 Dec", "Thursday 3 December" across screens). Pick one short and one long form.

---

## 6. Individual panel member reports

### Persona 1: Maya, 10 (with her dad)
**What's better.** The page about me doesn't list nine "Not yet" skills any more. It just says nothing is marked yet, and Dad can switch skills off and have notes only. "Share with Nia" (for me it would be "Share with Maya") opens a big "Well done" page with what my teacher said and "Next time, try:". I liked reading that myself.
**What still frustrates.** The well-done page is grey and plain, like a worksheet. I still can't play my class music unless Dad finds it. If there's nothing to say, there's nothing for me to look at.
**Top 5 UI improvements:**
1. Colour and the school star on the child view.
2. Stickers or badges on milestones.
3. My class music inside the child view.
4. Make the "Done" button bigger for me.
5. Show the next class ("Wednesday, Street Juniors") on it.

**Top 3 features:**
1. Class tracks in the child view (Useful).
2. Milestone stickers (Nice to have).
3. A countdown to the show (Nice to have).

**Branding.** Dad: "It looks like the school's app, which is right. The child view could borrow their colours."
**Scores:** Relevance 7, Quality 7, Completeness 6, Ease 8, Efficiency 7, Usefulness 6, Adoption 7, Continued use 6, Visual design 6, Brand appeal 6. **Overall 6.5/10** (round 1: 5). Safe and kind as before, and now she is in it, a little.

### Persona 2: Amir, 15, competitive
**What's better.** I can say I can't make it myself. I ticked Friday, typed "competition", and got "DONE, your teacher will see this on the register" in about three seconds. I've got a bell. The timeline isn't 21 rows of the same date any more, and Ballet is tucked under "Earlier styles". "Add all to my calendar" means my phone has my week.
**What still frustrates.**
- After I said I can't make it, nothing on my timetable shows it. Friday looks the same, so did it send?
- My Thursday has Tap at Blackheath until 19:30 and Contemporary at Greenwich at 19:00. The app shows the start times, not that they overlap.
- The workshop entry closes tomorrow and it's in the same grey as everything else.
- I'm offered a ballet exam I don't do.
- The bell says it's for "payments and enrolments".

**Top 5 UI improvements:**
1. A "reported absent" marker on the row.
2. End times and a clash warning.
3. "Closes tomorrow" highlighted.
4. Hide exams for styles I don't take.
5. A bell message that's about me.

**Top 3 features:**
1. Deadline nudges (Highly desirable).
2. Diary clash and travel check (Highly desirable).
3. Requested events shown in the diary (Useful).

**Branding.** The huge "18:30" is still the best thing. BOOKED and DONE in caps look like a scoreboard, which I like.
**Scores:** Relevance 9, Quality 8, Completeness 7, Ease 8, Efficiency 8, Usefulness 8, Adoption 9, Continued use 8, Visual design 8, Brand appeal 8. **Overall 8/10** (round 1: 7).

### Persona 3: Gareth, 52, adult
**What's better.** Night and day. I booked a drop-in, the office invited me, I accepted, and I'm in. It says "Your classes" and "Your payments", the tab is "You", and my invoice has a reference to copy and says plainly that card payment isn't available yet. My browser's larger font now actually makes the app bigger.
**What still frustrates.**
- The invitation called me "a parent in the Hughes (adult)".
- My "You" page says "You're not in a class yet" while my home page shows Thursday's class.
- The first thing on "You" is a big "Add a child" button, then six Allow/Don't allow buttons. For someone with dyslexia that's a wall before I find "Book a class".
- On the public page I still had to ask about packs.

**Top 5 UI improvements:**
1. Show my drop-ins on "You", each with Cancel.
2. Drop "Add a child" for solo adults.
3. Collapse the consent rows.
4. Correct the invite wording.
5. Show packs publicly.

**Top 3 features:**
1. Solo-adult layout and "Adult student" invite (Highly desirable).
2. Manage-booking link from the confirmation (Highly desirable).
3. Public packs (Useful).

**Branding.** Plain words and big status words suit me. The grey secondary text is still a bit faint, but at my font size it's fine.
**Scores:** Relevance 8, Quality 7, Completeness 6, Ease 6, Efficiency 6, Usefulness 7, Adoption 7, Continued use 6, Visual design 7, Brand appeal 6. **Overall 6.5/10** (round 1: 3). The biggest jump on the panel: there is now something to adopt.

### Persona 4: Priyanka, 34, adult beginner
**What's better.** The first question is "Who is the class for?", so I'm not typing my age into "Your child's age". The drop-in says "All levels, including complete beginners", what to wear ("bare feet or socks, bring water") and £12. The confirmation has the address with a map, "arrive 10 minutes early, the teacher will meet you at the door", and the 24-hour rule. That was exactly my anxiety list.
**What still frustrates.**
- The adult page opens with "No adult trial classes", a "no" before a "yes".
- No booking reference and no "add to calendar", so I screenshotted it again.
- "Price: then £12.00 a class": then after what?
- It says I can pay online, but nothing tells me how.

**Top 5 UI improvements:**
1. Lead with Drop in when there are no adult trials.
2. A reference and .ics on the confirmation.
3. Tappable phone and email.
4. Fix "then £12".
5. A school photo and a line about the teacher.

**Top 3 features:**
1. A manage or cancel link (Highly desirable).
2. A school profile (Highly desirable).
3. A "first class nerves" FAQ (Useful).

**Branding.** Calm, clean, trustworthy. BOOKED in green felt good. The page itself is a bit bare without a photo.
**Scores:** Relevance 8, Quality 8, Completeness 7, Ease 9, Efficiency 8, Usefulness 7, Adoption 8, Continued use 6, Visual design 7, Brand appeal 7. **Overall 7.5/10** (round 1: 5).

### Persona 5: Sofia, 17, pre-professional (judged on Amir's hub)
**What's better.** "Then and now" with 1, 3, 6 and 12 months is exactly what I asked for. The timeline groups an assessment day into one line. Exams now have a home in the timetable (I couldn't see an entry in the demo). Skills I no longer take are kept, not lost.
**What still frustrates.**
- Every "Then and now" row says "New → Mastered". I can't tell first assessments from real progress.
- The feedback page is endless on my phone.
- I still can't reply to a note to ask what "rolling through the foot" means.
- Practice is still minutes and a line.

**Top 5 UI improvements:**
1. Say "first assessed" instead of "New →".
2. Collapse styles, with counts in the header.
3. Put Then and now behind a toggle.
4. Highlight entry deadlines.
5. Show end times.

**Top 3 features:**
1. Reply to a feedback note, office-visible (Useful).
2. Practice goals linked to skills (Useful).
3. Student video submission, moderated, 16+ (Nice to have).

**Branding.** Grown-up enough for me. The count bars are clever once you get them.
**Scores:** Relevance 8, Quality 7, Completeness 6, Ease 7, Efficiency 6, Usefulness 7, Adoption 7, Continued use 6, Visual design 7, Brand appeal 7. **Overall 6.5/10** (round 1: 5.5). Better, but not yet a replacement for my spreadsheet.

### Persona 23: Ruth, 39, prospective parent, low vision
**What's better.** Prices at last: "Free trial, then £54.00 a term". A level that warns me ("A year or more of dance"). It asked about allergies and photos before the first class. The confirmation gave me the address, a map, what to bring and who to ring. And with my large text set, the words actually get bigger now.
**What still frustrates.**
- With large text the list of classes falls apart. One word per line, and the price prints on top of the class details. I couldn't read it without turning large text off, which is the opposite of what I need.
- When I typed 10, all I got was a "Show later dates" button and no class.
- My daughter is a beginner and the only option needs a year's experience, and there's no "ask us" route.
- There's still nothing about the school itself: who teaches, safeguarding, where.
- The Swayvo page shows children's medical notes in its demo, which gave me a jolt even though it's made up.

**Top 5 UI improvements:**
1. Stack the class rows at large text.
2. Show the next dates instead of an empty list.
3. An "about the school" strip with safeguarding.
4. Tappable phone and email.
5. A booking reference.

**Top 3 features:**
1. A public school profile (Highly desirable).
2. A "Nothing suits? Tell us" enquiry (Highly desirable).
3. Manage my booking (Highly desirable).

**Branding.** The school's own logo first feels right. The page needs the school's photos and colour to feel like a place.
**Scores:** Relevance 8, Quality 6, Completeness 7, Ease 6, Efficiency 7, Usefulness 7, Adoption 7, Continued use 6, Visual design 6, Brand appeal 6. **Overall 6.5/10** (round 1: 5.5). Content gains were large. The large-text breakage cost the most for me personally.

---

## 7. Votes (machine-readable)

| Persona | UI 1 | UI 2 | UI 3 | Feature 1 (rating) | Feature 2 (rating) | Feature 3 (rating) | Remove or simplify | Greatest impact |
|---|---|---|---|---|---|---|---|---|
| 1 Maya | Child view colour and stickers | Class music in child view | Next class in child view | Child view class tracks (Useful) | Milestone stickers (Nice to have) | Show countdown (Nice to have) | Grey plain child view | Child view class tracks |
| 2 Amir | Absence marker in diary | End times and clash flag | Entry deadline highlight | Deadline nudges (Highly desirable) | Diary clash check (Highly desirable) | Requested events in diary (Useful) | Photos and filming block on home | Absence marker in diary |
| 3 Gareth | Drop-ins listed on You | Solo-adult layout | Collapse consent rows | Adult student invite and layout (Highly desirable) | Manage booking link (Highly desirable) | Public packs (Useful) | Add a child button for solo adults | Adult student invite and layout |
| 4 Priyanka | Lead with drop-in for adults | Confirmation reference and .ics | Tappable contact details | Manage booking link (Highly desirable) | Public school profile (Highly desirable) | First class FAQ (Useful) | "No adult trial classes" message | Manage booking link |
| 5 Sofia | "First assessed" not "New →" | Collapse styles with counts | Then-and-now toggle | Feedback replies 16+ (Useful) | Practice goals linked to skills (Useful) | Moderated video 16+ (Nice to have) | Long feedback page | "First assessed" not "New →" |
| 23 Ruth | Stack join rows at large text | Show next dates when week empty | About-the-school strip | Public school profile (Highly desirable) | Nothing-suits enquiry (Highly desirable) | Manage booking link (Highly desirable) | Medical notes in welcome mock | Stack join rows at large text |

---

## 8. Group summary

**Consensus**
- Round 2 fixed most of what this group asked for: adult accounts, student absence, a bell, class suitability and price on `/join`, a useful confirmation, medical questions at trial, kinder skills for juniors, a child view, progress history, and text scaling.
- What remains is **finishing** rather than missing features:
  - status markers after an action (absence; drop-ins on "You");
  - large-text layouts (`/join` rows, the app header and tabs);
  - copy that still assumes the wrong person (invite "as a parent", the bell's empty state, "Add a child", "then £12");
  - the empty first week on `/join`.
- Everyone wants a **manage-booking link** and a **reference** after booking.

**Disagreements (kept)**
- **Long feedback page.** Sofia wants more depth on `/learn/feedback` (finer levels, replies). Amir wants less on screen: "collapse it, I only read the note".
- **Video.** Sofia wants video submission. Ruth (as a parent) and the reviewer want it kept deferred for safeguarding; at most, moderated and 16+.
- **Consent rows.** Gareth would collapse them. Ruth values seeing them in full, because it shows the school takes consent seriously.
- **Large text.** Ruth rates the large-text breakage as the most serious issue. Amir, who doesn't use large text, rates the clash and deadline issues higher.

**Group scores (overall /10)**

| Persona | Round 1 | Round 2 | Change |
|---|---|---|---|
| 1 Maya | 5 | 6.5 | +1.5 |
| 2 Amir | 7 | 8 | +1 |
| 3 Gareth | 3 | 6.5 | +3.5 |
| 4 Priyanka | 5 | 7.5 | +2.5 |
| 5 Sofia | 5.5 | 6.5 | +1 |
| 23 Ruth | 5.5 | 6.5 | +1 |
| **Mean** | **5.2** | **6.9** | **+1.7** |

**Top five actions for this group, in order:**
1. Fix the `/join` rows at large text (J2).
2. Fill or explain an empty first week on `/join` (J1).
3. Show absence and drop-in status wherever the class is listed (L2, A2).
4. Adult-student invite wording and a solo-adult "You" layout (A1, A3).
5. Add a booking reference, .ics and a manage link to confirmations (J6).
