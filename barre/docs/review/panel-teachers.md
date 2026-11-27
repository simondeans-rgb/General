# Panel review — Teachers (simulated)

> **This is a simulated end-user panel.** The five "teachers" below are personas written by a reviewer who drove the Swayvo demo build. Their opinions are simulated professional judgement, not real user research. Every observation is tied to something driven in the browser or read in the code, and each one says which. The demo database is synthetic and runs in the browser.

Group slug: `teachers` · Personas 11–15 · Scenarios 16–22 · Reviewed 27 Nov 2026 (a Friday, so the next real class was Tue 1 Dec).

---

## 1. Method & limitations

**What was driven.** Playwright with Chromium against the static preview build at `http://127.0.0.1:8080/General/studio-next/`. Every run used a fresh browser context. Scripts are in `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/teachers/` (`s16.cjs`, `s17.cjs`, `s18.cjs`, `s19.cjs`, `s21.cjs`, `s22*.cjs`, `s_tab.cjs`).
- **Accounts:** Priya Raman (teacher at Northstar and Kestrel, and covering one of Marcus's classes), Marcus Bell (teacher, Today screen only), and Nadia Okafor (admin, office schedule clash check only).
- **Viewports:** mostly phone (390×844, touch). Tablet (820×1180) was used for the Today screen and for the medical brief on the register. Desktop (1440×900) was used once, for the office schedule.
- **Screens driven:** `/teach`, `/teach/register`, `/teach/feedback`, `/teach/students` (detail panel, message sheet, safeguarding sheet), `/teach/messages`, `/teach/material` → `/class`, `/teach/reports`, the school switcher, the ask-for-cover sheet, and `/schedule` as the office.
- **Offline:** `context.setOffline(true)` mid-register, offline reload, cold offline load, and reconnecting.

**Code inspected (labelled "code-verified" where used):**
- `src/app/teach/**`, `src/app/providers.tsx`
- `src/lib/offline/attendance-queue.ts`, `public/sw.js`
- `src/lib/repos/teaching.ts`, `progress.ts`, `inbox.ts`
- Migrations `0013`, `0023` (cover), `0028` (teacher messaging), `0029` (feedback and skills), `0032` (school switch)
- `components/app/school-switcher.tsx`, `session-sheet.tsx`, `week-grid.tsx`

**Limitations:**
- **Timings come from scripts, not people.** Playwright's actionability waits make them roughly 1 s per tap. I report interaction counts and script-measured elapsed time only. Neither is a human task time.
- **No seeded class has 20 children.** The largest Priya teaches is Modern Juniors with 12. Feedback effort was measured on 12 children and only *arithmetically* extrapolated to 20.
- **Seeded attendance is random per context.** The same child shows different percentages in different runs (for example, Elias Bennett at 85%, 92% and 100%). Seeded session ids are also regenerated per context.
- **Today had no classes.** Registers were taken for Tuesday's class four days early. That this is possible is itself a finding (D6).
- **Offline in the demo is different from offline in the hosted product.** In the demo the database lives in the tab, so "offline" only affects TanStack Query's network detection and the service worker. Conclusions about the hosted (Supabase) version are **unverified** and come from `docs/ARCHITECTURE.md` §Offline registers plus code.
- **Not testable:** push, email and SMS delivery (R-003), real sign-in (R-001), how a parent actually receives shared feedback, and real devices or screen readers.
- **Not covered:** a younger-children class taught by a teacher account. Pre-School Ballet is taught by the owner. Junior Tap (ages 5–8, Marcus's class covered by Priya) stood in for it.

---

## 2. Scenario results

### Scenario 16 — Arrive at a studio and record attendance quickly (phone)
- **Personas:** 11, 14, 15
- **Objective:** mark a full register of 12, including one late, one excused with a reason, and one absent, then close it.
- **Starting point:** `/teach` → Modern Juniors (Tue 16:00, 12 children, 2 medical notes).
- **Outcome:** **Completed with minor friction**

**Steps — Path A, "exceptions then mark the rest": 9 interactions**
1. Open register (1).
2. Absent on Rosa (1).
3. Tap Nia D.'s name to expand, then Late (2).
4. Tap Zara's name to expand, then "Excused absence" (2).
5. Type "Ill" in the reason field. It saves on blur (1).
6. Mark the rest here (1). This marked 9 present.
7. Close register (1). Result: "9 here · 1 late · 1 absent · 1 excused", then CLOSED.

The register opened 474 ms after the tap, in an already-warm context. Script-measured time for steps 2–7 was 8.8 s, of which about 3.3 s were fixed waits the script added.

**Path B, tapping Here for every child:** 12 taps, 13.5 s script time. That figure mostly reflects Playwright's per-click waits, not human time.

**Difficulties:**
- Late and Excused sit behind the name. Each exception costs 2 taps, and the row stays expanded afterwards, so the medical brief and emergency contacts push the list down (`teachers-02-register-late-excused-expanded.jpg`).
- On the phone the header subtitle truncates the time and room: "Tuesday 1 December · 16:…" (`teachers-04-offline-marks-not-shown.jpg`).

**Unnecessary steps:** none for the common case. "Mark the rest here" is an excellent shortcut.

**Missing functionality:**
- No time guard. Tuesday's register was marked and closed on Friday.
- No headcount or fire-register view.
- No quick way to see "reported absent by parent" before marking. The field `reported_by_guardian` exists but the register does not show it.

**Defects:** D6 (a future register can be marked and closed), D10 (truncated header), D13 (expanded rows stay open).

**Clarity of outcome:** very good. There is a counts line, a "beats" progress bar, a "Closed — Everyone is accounted for" notice, and a "Next class" link.

**Simulated satisfaction:** 4/5.

**Improvements:**
- Swipe or long-press for Late.
- Collapse a row after a mark.
- Show parent-reported absences pre-filled.
- Block or warn when marking more than about 30 minutes before the start time.

### Scenario 17 — Personalised feedback for 20 students after class
- **Personas:** 11, 13, 14
- **Objective:** give each child feedback and share it with families.
- **Starting point:** closed register → "Give class feedback".
- **Outcome:** **Completed with significant friction**

**Steps (12 present children):** for each child, open (1) + one "Going well" chip (1) + one "To work on" chip (1). Every third child also got a typed note (4 notes in total). Then "Share with families" (1).
- **Total: 41 interactions.** Script time 4.1–5.7 s.
- **Arithmetic extrapolation to 20 children, not measured:** at least 3 taps per child + 1 = **61 interactions**, plus any typed notes and skill moves.

**Difficulties:**
1. **There is no bulk action.** No "apply to all", no multi-select, and no class-wide note. Every child needs at least 3 taps even when the message is the same.
2. **The chip set is fixed and studio-wide**: six Going well and six To work on chips (`teachers-08-feedback-child-open.jpg`). Teachers cannot add chips. Only the office can (`progress.ts` ADD_CHIP, `0029` policy `chip_admin`). There are no chips by age or style. For a 5-year-old "Spotting in turns" is meaningless.
3. **Reopening a saved draft or a shared note shows empty chips and an empty note** (`teachers-10-feedback-shared-reopen-empty.jpg`). Any new tap then **replaces** what was saved (D4, verified).
4. **The skill picker lists every framework for every style the child takes**, for example ballet skills inside a Modern class (code-verified, `app.student_skills`).
5. For about 4 s after sharing, the page still read "0 of 12 done" with no per-child status (D9).

**Missing functionality:**
- Bulk or class-level feedback.
- Teacher-owned chip sets.
- Viewing or editing what was already written.
- Feedback for trial and drop-in children. They are excluded because `SESSION_FEEDBACK` joins on enrolment only (code-verified).

**Clarity:** the draft-versus-share split is clear: "Nothing reaches a family until you share."

**Satisfaction:** 2.5/5.

**Improvements:** see R3 and R6.

### Scenario 18 — Review previous feedback before teaching a student
- **Personas:** 11, 13
- **Objective:** before class, see what I last told a child to work on.
- **Starting point:** register or feedback page; then `/teach/students`.
- **Outcome:** **Completed with significant friction**

**Steps:**
1. On the register, tapping a name shows only medical details, emergency contacts and photo consent. There is no feedback.
2. On the feedback page, the child's row shows no history either.
3. `/teach/students` → tap the child (2 taps). The detail panel shows the Safety, With you, Skills, Goals, Milestones, Exams, Practice and Timeline sections. Skills alone covered four frameworks, about 30 rows, for Elias Bennett.
4. Scroll to Timeline. It read "Today · Modern Juniors · Next: Confidence" (`teachers-11-student-panel-phone.jpg`). Only the "To work on" text is surfaced, and the going-well chips and note had already been lost to D4.

**Unnecessary steps:** scrolling past every framework of every style the child takes.

**Missing:**
- A "last feedback / current focus" line on the register and on the feedback row.
- A list of feedback across a class.
- A view of feedback written by other teachers.

**Clarity:** poor. The information exists but is buried.

**Satisfaction:** 2/5.

### Scenario 19 — Freelance teacher views schedule across schools
- **Persona:** 12 (Priya Raman)
- **Objective:** see the week across Northstar and Kestrel.
- **Outcome:** **Partially completed**

**Steps:**
1. `/teach` shows a "Northstar Dance Academy" select under the header (`teachers-13-priya-today-switcher-phone.jpg`).
2. Choosing Kestrel Ballet School took 1 interaction and about 2.0 s script time. The app reloaded `/teach`, showing "Next · Wednesday 2 Dec 18:00 Kestrel Contemporary · Kestrel Hall · 1 booked".
3. Switching back to Northstar took 1 interaction.

**Difficulties:**
- **There is no combined view, by design.** Migration `0032` narrows every query to the selected school, and `school-switcher.tsx` says "no screen ever mixes two schools' data".
- "Add to calendar" exports only the current school's classes. The ICS `location` is the room only, with no site or school (`teach/page.tsx` downloadTeaching).
- Clashes between schools cannot be seen anywhere.

**Defect seen in passing:** Priya is booked at 16:00–16:45 Modern Juniors (Blackheath) **and** at 16:30 Junior Tap cover (Greenwich) on the same Tuesday. Her Today screen lists both without a warning (D5).

**Missing:**
- A personal agenda across all memberships.
- ICS feeds that include the site, or one subscribable feed per school.

**Satisfaction:** 2.5/5.

### Scenario 20 — Identify students needing extra support
- **Personas:** 11, 13, 14
- **Starting point:** `/teach/students`
- **Outcome:** **Partially completed**

**Steps:**
1. Open Students (1). The list shows 24 children with age, classes and an attendance percentage.
2. Below 70%, the figure turns amber with an sr-only "attendance, low". Two children were flagged: Jonah Grant at 69% and Lily Sullivan at 57%.
3. The "Medical notes 3" toggle filters to children with medical notes.

**Difficulties:**
- **Attendance is the only support signal.** You cannot sort or filter by it.
- The "· attendance this term" label is wrong. The percentage is all-time across all classes (D8, code-verified in `MY_STUDENTS`).
- There are no trends, such as consecutive absences or a decline.
- Nothing aggregates repeated "To work on" chips or flags children with no feedback for N weeks.
- Reflections (13+) and Goals are per-child only.

**Missing:** a "needs attention" list.

**Satisfaction:** 2.5/5.

### Scenario 21 — Substitute/cover teacher accesses appropriate class information
- **Persona:** 12, covering Marcus's Junior Tap
- **Outcome:** **Completed with minor friction.** The information is appropriate, but the cover logic has gaps.

**Steps:**
1. The Today row reads "Junior Tap — You are covering · Studio Two · 12 expected · 1 trial".
2. Tapping it opens a register with all 12 children, including the trial Fionn Kelleher, and 2 medical notes (Nell Ackah: eczema; Jonah Grant: latex allergy). Tapping a name shows the safety brief and emergency phone numbers.
3. The register links to the class's material (3 items).

**Code-verified rules (`0023_operations.sql`, `0032`):**
- `app.teacher_class_ids()` grants the covering teacher the **whole class** from 2 days before to 14 days after each covered session. A comment says this stops a one-off cover becoming a standing view.
- During that window Priya's "My students" listed all of Junior Tap. She could message their families, raise concerns, edit skill levels (which families see instantly), and read the full timeline. That is broader than a single session needs.
- Only the office can assign cover (`app.cover_session`). The covering teacher is notified with "The register and safety notes for this class are on your Today screen."

**Missing:**
- A **handover note**. The usual teacher's previous "Notes on this class" are not shown to the cover teacher. Each session's notes box starts empty.
- No lesson plan or recent feedback summary.
- `app.cover_session` has **no availability or clash check**, and neither does the office cover sheet (`session-sheet.tsx`). The office week grid does flag the clash, showing "2 classes clash this week" (`teachers-21-office-schedule-clash-check.jpg`), but only on the office side. The seeded clash was written directly by the seed, not through the cover sheet.

**Ask-for-cover (driven):** row icon → reason → "Send to the office" → Done: **4 interactions**. The row then shows "Cover requested". This works well.

**Satisfaction:** 3.5/5.

### Scenario 22 — Teaching with unreliable internet
- **Personas:** all five, most acutely 14 and 15
- **Outcome:** **Unable to complete** offline in the demo. Offline marks silently fail to apply and one was **lost** on reconnect. Conclusions about the hosted version are unverified.

**What happened (driven, 4 runs):**
1. Online, with 2 children marked Here, I called `setOffline(true)` (`navigator.onLine` = false). I then tapped Absent (Nia Doherty) and Here (Zara Ellery). **Nothing changed on screen.** The buttons stayed unpressed and the counts still read "2 here · 0 absent · 10 to mark". No "Offline — waiting for a connection" notice appeared, and the queue key `barre.pending-marks.v1` stayed `null` (`teachers-04-offline-marks-not-shown.jpg`).
2. "Mark the rest here" then showed a spinner indefinitely (`aria-busy=true`), and so did "Save note" (`teachers-05-offline-mark-rest-spinning.jpg`). "Close register" never appeared.
3. On reconnecting, nothing changed at +2 s. By +10 s the register showed **"12 here · 0 absent"**. **Nia Doherty, tapped Absent offline, was recorded as Here.** The paused "Mark the rest" ran after her mark with a newer timestamp and overwrote it (D1). In a separate run with only one offline mark and no "Mark the rest", that mark applied about 1 s after reconnecting.
4. The service worker was registered and controlling the page. Reloading the register offline gave `net::ERR_FAILED`.
5. A cold offline load of `/teach/` **did** work. The service worker served the cached page, the PGlite files were cached, and the database came from IndexedDB, so Today rendered (`teachers-06-offline-cold-load-teach.jpg`). Tapping "Open register" then failed with "Failed to fetch RSC payload … Falling back to browser navigation" and landed on a Chrome error page (`teachers-07-offline-open-register.jpg`, blank).

**Why (code-verified):**
- `providers.tsx` creates `QueryClient` with TanStack Query's default `networkMode: 'online'`, so mutations **pause** rather than fail while offline.
- The register only queues a mark when `runAs` *throws* an offline error (`register/page.tsx` 66–90). A paused mutation never throws, so the purpose-built `AttendanceQueue` and its "Offline" notice are never used.
- `markAllPresent` takes its "unmarked" list from the screen at the moment of the tap, without the offline marks, and stamps `new Date()` when it eventually runs. The "newest tap wins" rule in `MARK_ATTENDANCE` then lets it overwrite the earlier Absent.
- `sw.js` caches navigations only after they have been visited, keyed by the full URL including `?session=`. Its fallback, `caches.match(scope)`, misses when the root was first loaded before the service worker took control.

**Hosted version (unverified):** `ARCHITECTURE.md` says the server deployment "will" go offline and that the newest-tap rule is in SQL and tested. The same client code would run there. The queue would engage only for fetch errors that are thrown, not for mutations paused by `navigator.onLine`. The overwrite risk in D1 applies equally.

**Satisfaction:** 1/5.

---

## 3. Feature status table

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Teacher Today (next class hero, medical summary, two-week list) | `/teach` | Fully implemented & tested | Driven, phone and tablet; shot 13 |
| Register: Here/Absent two-button, Late/Excused behind name | `/teach/register` | Fully implemented & tested | Path A/B, shots 01–02 |
| "Mark the rest here" | same | Fully implemented & tested online; **Defective offline** | D1 |
| Absence reasons | same | Fully implemented & tested | "Ill" persisted after close |
| Close/reopen register | same | Implemented & tested; no time guard (**Partial**) | D6 |
| Medical brief on register (allergy, action plan, emergency call) | register name expand | Fully implemented & tested | shot 20 (tablet) |
| Session notes ("You and the office only") | register | Implemented & tested online; not shown to cover teacher (**Partial**) | S21 |
| Offline register queue | `lib/offline/attendance-queue.ts` | **Defective** (never engages; marks lost) | S22, D1–D3 |
| PWA / service worker app shell | `public/sw.js` | **Partial** (cold load of a visited page works; register route fails) | S22 step 5 |
| Class feedback with chips | `/teach/feedback` | Implemented & tested; **Defective** on re-edit | S17, D4 |
| Bulk feedback | — | **Missing** | S17 |
| Teacher-defined chips | `feedback_chip` (admin only) | **Missing** for teachers | code `0029` |
| Previous feedback at point of teaching | register / feedback | **Missing**; only in student Timeline | S18 |
| Student detail (skills, goals, reflections, exams, practice, timeline) | `/teach/students` panel | Implemented & tested; overloaded (Low value on phone) | shot 11 |
| Skill levels (D/S/M, families see instantly) | student panel / feedback | Implemented; scoping too broad (**Partial**) | S18, code `student_skills` |
| Support-needs identification | `/teach/students` | **Partial** (attendance < 70% highlight, medical filter) | S20, D8 |
| Term reports (auto-draft, comment, share, print) | `/teach/reports` | Implemented & tested; thin without feedback | shot 18 |
| Messaging families (office-visible, no private channel) | Students → Message the family; `/teach/messages` | Fully implemented & tested (in-app only; email/SMS not connected) | 4 interactions |
| Safeguarding concern | Students → Raise a concern | Implemented & tested (sheet opened, not submitted) | shot 16 |
| Ask for cover | `/teach` row icon / hero | Fully implemented & tested | 4 interactions |
| Cover access (time-boxed class access) | `app.teacher_class_ids` | Implemented, code-verified; broad scope | S21 |
| Cover clash check | `app.cover_session`, session sheet | **Missing** | D5 |
| Multi-school switch | header select | Fully implemented & tested | S19 |
| Combined cross-school schedule | — | **Missing** (deliberately excluded) | S19 |
| Calendar export (ICS) | `/teach` "Add to calendar" | Implemented, not opened in a calendar app; location = room only (**Partial**) | code |
| Class material / notices | `/teach/material` → `/class` | Implemented (Add material in header, Post a notice); upload not driven | S21 |
| Push notifications | `sw.js`, `pwa.tsx` | Implemented, not testable | R-003 pending |

---

## 4. Defects found

**D1 — Offline: "Mark the rest" overwrites an absence tapped offline (data integrity, safeguarding) — Critical**
- **Repro:** Open register → mark 2 Here → go offline → tap Absent on child 3 → tap "Mark the rest here" → reconnect → wait about 10 s.
- **Expected:** child 3 absent, 9 others present.
- **Actual:** all 12 "Here", including the child marked Absent. A child who is not in the building is shown as present on the fire or safety register.
- **Location:** `src/app/providers.tsx:12-16` (default `networkMode`), `src/app/teach/register/page.tsx:92-101` (`markAllPresent` uses a stale `rows.data` and a fresh `new Date()`), `src/lib/repos/teaching.ts` `MARK_ATTENDANCE` (newest tap wins).
- **Screenshots:** shots 04–05.

**D2 — Offline taps give no feedback and the offline queue never engages — High**
- **Repro:** go offline mid-register and tap marks.
- **Expected:** the mark shows immediately, plus an "Offline — n marks waiting" notice (the code has this).
- **Actual:** no visual change, no notice, `barre.pending-marks.v1` stays null, and "Mark the rest" and "Save note" spin indefinitely.
- **Location:** `register/page.tsx:66-90`; paused mutations never throw, so `isOfflineError` is never reached.
- **Screenshots:** shots 04–05.

**D3 — Opening a register while offline fails to a browser error page — High** (for real studios; demo-specific details unverified for hosted)
- **Repro:** load `/teach/` online, go offline, reload `/teach/` (this works), tap "Open register".
- **Expected:** the register opens from cache and the local database.
- **Actual:** "Failed to fetch RSC payload" and then a Chrome error page. A direct reload of a register URL gives `net::ERR_FAILED`.
- **Location:** `public/sw.js:24-27` (no precache of route shells or RSC payloads; navigation cache keyed with query string).
- **Screenshot:** shot 07.

**D4 — Re-editing feedback silently replaces what was saved or shared — Medium-High**
- **Repro:** give a child "Great focus", "Kind to others", "Pointed feet" and a note → Save draft → reload → open the child (no chips are pre-selected and the note is empty) → tap "Confidence" → Save.
- **Expected:** "Confidence" is added to the saved feedback.
- **Actual:** the timeline shows only "Next: Confidence". The earlier chips and note are gone. The same happens after sharing: `shared_at` is kept, so families see the changed text without notice.
- **Location:** `src/app/teach/feedback/page.tsx` (draft state starts empty), `0029_progress.sql:193-196` (update replaces `going_well` and `work_on`).
- **Screenshot:** shot 10.

**D5 — Cover can double-book a teacher across sites with no warning to the office or teacher — Medium**
- **Evidence:** Priya has Modern Juniors 16:00–16:45 at Blackheath and covers Junior Tap 16:30 at Greenwich on Tue 1 Dec. Her Today screen shows both with no warning (shot 13). After closing Modern Juniors, the "Next class" link points to Junior Tap at 16:30.
- **Location:** `0023_operations.sql:230-265`, `cover_session`, has no availability check; `components/app/session-sheet.tsx` has no clash UI. The office week grid does show "Clash" (shot 21).
- **Note:** the seeded clash bypassed the cover sheet. That the function and sheet lack a check is code-verified.

**D6 — Registers can be marked and closed days in advance — Low-Medium**
- **Repro:** on Friday, open Tuesday's register → Mark the rest → Close.
- **Expected:** blocked, or a warning ("This class is on Tuesday").
- **Actual:** it closes ("Everyone is accounted for"). An accidental tap on the wrong row produces a false register.
- **Location:** `MARK_ATTENDANCE` and `app.close_register` have no time check.

**D7 — An unknown or stale session link says "No one is enrolled in this class yet." — Low**
- **Repro:** open `/teach/register/?session=<id from another device or a deleted session>`.
- **Expected:** "This class could not be found".
- **Actual:** the title is "Register" and the body says nobody is enrolled. A teacher may think the class is empty.

**D8 — "attendance this term" label shows an all-time, all-class figure — Low**
- **Location:** `teaching.ts` `MY_STUDENTS` and `REGISTER` `attendance_pct` have no term or date filter; the label is in `teach/students/page.tsx`.

**D9 — The feedback page shows "0 of 12 done" for about 4 s after "Shared" — Low**
- The query is refetched late (driven: "0 of 12" immediately after sharing, "12 of 12 · Shared" at +4 s).

**D10 — The phone register header truncates the time and room — Low**
- It reads "Tuesday 1 December · 16:…" (shot 04).

**D11 — The skill panel exposes every framework the child takes, and levels publish to families on a single tap — Low-Medium (design)**
- Priya, who teaches modern, could edit Ballet, Jazz, Street and Tap levels for Lily Sullivan.
- **Location:** `app.student_skills` scopes by all of the child's active enrolments. The panel states "Families see levels straight away".

**D12 — Trial and drop-in children cannot receive class feedback — Low** (code-verified)
- `SESSION_FEEDBACK` joins on `enrolment` only, so trial Fionn Kelleher, who is on the Junior Tap register, would not appear on that class's feedback list.

**D13 — Late or excused rows stay expanded after marking — Low**
- The medical brief and emergency contacts stay open and lengthen the list mid-register (shot 02).

---

## 5. Individual panel member reports

### Persona 11 — Siân Morgan, full-time dance teacher (simulated)

**User profile:**
- Teaches 17 classes a week at one school: jazz, modern and musical theatre, ages 7–18.
- Uses a mid-range Android phone between classes.
- Tech confidence: comfortable.
- Needs fast registers, feedback that doesn't eat my evenings, and seeing who's slipping.
- Frustrations today: a paper register that the office retypes, and feedback written at 11 pm in a notes app.

**Application experience:**
- **First impressions:** `/teach` is what I'd want between classes: next class in huge type, medical notes underneath, and one blue button.
- **Most valuable:** the register. Exceptions first and then "Mark the rest here" took me 9 taps for 12 children, including a late, an excused with a reason, and a close.
- **Least valuable:** the student detail panel on my phone. To find the one line I wrote last week I scrolled past four skill frameworks I don't teach.
- **Exceeded expectations:** the closed register links straight to "Give class feedback" and to my next class.
- **Failed expectations:**
  - Feedback has no bulk option. 12 children took 41 taps, so 20 children means 60+ taps every class, five times a day.
  - When I reopened a draft, my chips were gone, and adding one more wiped the rest.
- **Usability concerns:**
  - Late and Excused are two taps away.
  - Expanded rows stay open.
- **Missing:**
  - "Apply to everyone who was here".
  - My own chip phrases.
  - Last week's "work on" next to each name.
- **Simplify:** collapse rows after marking, and drop Practice and Milestones from the phone panel.

**Recommendations:**
- **Top 5:**
  1. Bulk feedback.
  2. Keep and show saved feedback when editing.
  3. Last focus line on the register.
  4. Teacher chip sets.
  5. Collapse after mark.
- **Remove or simplify:** the eight-section student panel on phone.
- **Greatest impact:** bulk feedback with saved content preserved.

**Adoption verdict:**
- I'd use the register tomorrow and prefer it to paper.
- I'd recommend it with a caveat about feedback.
- **Would prevent adoption:** losing feedback I've written (D4).
- **Would keep me:** the register and the "after class" nudge.

**Scores:** Relevance 9 · Quality 6 · Completeness 6 · Ease 7 · Efficiency 6 · Usefulness 7 · Adoption 7 · Continued use 6 — **Overall 6.5/10.** The register is excellent. Feedback is where my unpaid admin hours go, and that is the weakest part.

### Persona 12 — Priya Raman, freelance contemporary instructor across schools (simulated, using the seeded account)

**User profile:**
- Teaches at Northstar (four classes plus cover) and Kestrel (one class). Elsewhere I use other systems.
- Uses an iPhone and has high tech confidence.
- Needs one view of my week, accurate cover, and no mixing of schools' data.
- Frustration: three calendars and a WhatsApp group per school.

**Application experience:**
- **First impressions:** one login for two schools is real. The select under the header switched me to Kestrel in one tap, in about 2 s, and showed only Kestrel's class and one student.
- **Most valuable:**
  - Ask for cover: 4 taps, "Cover requested" on the row.
  - Office-visible messaging, which protects me.
- **Least valuable:** "Add to calendar" exports one school at a time and the location is just "Studio One", with no site.
- **Exceeded expectations:** as cover I got the register with safety notes and the trial child, with no fuss.
- **Failed expectations:**
  - I'm booked at 16:00 at Blackheath and covering 16:30 at Greenwich on the same Tuesday. Nothing warned me or the office's cover tool.
  - There's no handover from Marcus: the notes box was empty.
- **Concerns:**
  - As cover I could see and edit a whole class's skill levels for over two weeks.
  - Offline, the register silently ignored my taps.
- **Missing:**
  - A personal agenda across schools.
  - A clash warning.
  - A handover note.

**Recommendations:**
- **Top 5:**
  1. Cover clash check.
  2. Handover note.
  3. Cross-school agenda (read-only).
  4. ICS with site and school.
  5. Narrower cover permissions (that session's children, no skill edits).
- **Simplify:** the cover access window.
- **Greatest impact:** clash detection on cover and on my Today screen.

**Adoption verdict:**
- Yes for schools that use it, but it won't replace my own calendar.
- **Would prevent adoption:** double bookings and having to switch to see my day.
- **Would keep me:** fast cover requests and a clean register.

**Scores:** Relevance 8 · Quality 6 · Completeness 5 · Ease 7 · Efficiency 6 · Usefulness 6 · Adoption 6 · Continued use 6 — **Overall 6/10.** The separation between schools is right for privacy but wrong for my diary.

### Persona 13 — Tomás Herrera, competitive and exam coach (simulated)

**User profile:**
- Ballet and lyrical coach, 45. Prepares students for grade exams and regional competitions.
- Uses an iPad in the studio, has medium-high tech confidence, and writes detailed notes.
- Needs progress over time, exam entries, and specific technical feedback.
- Frustration: progress lives in my head and in spreadsheets.

**Application experience:**
- **First impressions:** promising. Skills use Developing / Secure / Mastered levels, and the student panel has Goals, Exams, Practice, Milestones and a Timeline.
- **Most valuable:** term reports that draft themselves, with a comment box, select-all, share and print.
- **Least valuable:**
  - The fixed chip phrases. "Big improvement" tells a competition parent nothing.
  - Reports drafted without feedback said only "Came to 6 of 6 classes."
- **Exceeded expectations:** reflections from students aged 13 and over, and a timeline with skill movements.
- **Failed expectations:**
  - Feedback history isn't shown when I'm about to coach the child.
  - Saved feedback disappears from view when edited, then gets overwritten.
  - Nothing shows trends: no chart, no "skills moved this term" across the class.
- **Concerns:** one tap on D/S/M publishes to families instantly. I want to assess quietly and release after a review.
- **Missing:**
  - Class-level progress matrix.
  - Assessment drafts before publishing.
  - Competition and exam preparation notes per routine.
  - Video feedback per child.

**Recommendations:**
- **Top 5:**
  1. Progress history across the class (a matrix).
  2. Draft-then-publish skill levels.
  3. Previous feedback on the register.
  4. Free-text feedback that is preserved.
  5. Per-style frameworks only.
- **Simplify:** the four-framework skill wall.
- **Greatest impact:** progress history over time with a review step.

**Adoption verdict:**
- I'd trial it.
- I'd keep a spreadsheet until the class-level view exists.
- **Would prevent adoption:** instant publishing and lost notes.
- **Would keep me:** reports and the timeline.

**Scores:** Relevance 8 · Quality 5 · Completeness 5 · Ease 6 · Efficiency 5 · Usefulness 6 · Adoption 5 · Continued use 5 — **Overall 5.5/10.**

### Persona 14 — Gwen Pritchard, teacher of 3–8 year olds (simulated)

**User profile:**
- Teaches pre-school ballet, tap and creative movement. Has moderate dyslexia.
- Uses a phone held in one hand while holding a child's hand.
- Needs headcounts, allergies at a glance, simple parent updates, and safeguarding.
- Frustration: forms in small text.

**Application experience:**
- **First impressions:** big 48 px Here/Absent buttons with words and ticks, not just colour. The Today hero said "2 medical notes" before I opened anything.
- **Most valuable:** the medical brief. Nia's EpiPen instructions, "in the red pouch in her bag. Use it, then call 999", had a Call button for her aunt (tablet, shot 20).
- **Least valuable:** chips like "Spotting in turns" and "Using the whole space" are not for 4-year-olds, and I can't add my own.
- **Exceeded expectations:** the safeguarding sheet says "If a child is in immediate danger, call 999 first" and asks for their words, not investigation (shot 16).
- **Failed expectations:**
  - When I tested with no signal, my Absent tap did nothing. After reconnecting, the child I marked absent showed as Here. With little ones that is a safety problem, not an inconvenience.
- **Concerns:**
  - The truncated header hides the room.
  - Nothing shows that a parent has already reported an absence.
- **Missing:**
  - Pick-up/collection notes (who collects).
  - Age-appropriate chip sets ("Listened beautifully", "Tried something new").
  - A sticker/emoji style for under-7s.
- **Simplify:** hide the skill picker for pre-school classes.

**Recommendations:**
- **Top 5:**
  1. A safe offline register.
  2. Age-appropriate chips.
  3. Parent-reported absences on the register.
  4. Collection and pick-up info.
  5. Headcount display.
- **Remove:** the skill picker in pre-school feedback.
- **Greatest impact:** a safe offline register.

**Adoption verdict:**
- Yes, if offline is fixed.
- **Would prevent adoption:** a wrong register.
- **Would keep me:** the medical brief and the big buttons.

**Scores:** Relevance 8 · Quality 5 · Completeness 5 · Ease 8 · Efficiency 7 · Usefulness 6 · Adoption 5 · Continued use 6 — **Overall 6/10.**

### Persona 15 — Maureen Hales, low-tech-confidence tap teacher (simulated)

**User profile:**
- Retired professional, 63. Teaches three evenings a week.
- Uses an older tablet with reading glasses.
- Prefers paper and will not attend training.
- Needs it to "just work" and not interrupt the class.

**Application experience:**
- **First impressions:** I understood Today without help: the time, "Open register", and the words "Here" and "Absent".
- **Most valuable:** "Mark the rest here". I only tap the few who aren't there.
- **Least valuable:** Students, Material and Reports in the bottom bar. I would never open them.
- **Exceeded expectations:** the "Ask for cover" wording is plain and the reason is private to the office.
- **Failed expectations:**
  - The spinner that never stopped when the Wi-Fi dropped. I'd have assumed it was broken and gone back to paper.
  - I could close next Tuesday's register by mistake today.
- **Concerns:**
  - Tapping a name opens a big panel of medical details I didn't ask for, and it stays open.
  - There's no plain "Undo".
- **Missing:**
  - A clear "No signal: your marks are saved on this tablet" message.
  - A warning when it's not the class's day.
- **Simplify:** Late and Excused could be a long-press on the Absent button rather than opening the name.

**Recommendations:**
- **Top 5:**
  1. Clear offline state.
  2. Block registers on the wrong day.
  3. Collapse rows.
  4. Bigger subtitle that wraps.
  5. An optional simplified teacher mode (Today + Register only).
- **Remove:** Practice and Milestones from the teacher view.
- **Greatest impact:** an offline register that tells me it's safe.

**Adoption verdict:**
- Only if the office insists. I'd go back to paper the first time it spins.
- **Would keep me:** speed when it works.

**Scores:** Relevance 7 · Quality 5 · Completeness 6 · Ease 7 · Efficiency 7 · Usefulness 6 · Adoption 4 · Continued use 4 — **Overall 5/10.**

---

## 6. Votes (machine-readable)

### Persona 11 — Siân Morgan
| Type | Item | Rating |
|---|---|---|
| Valuable | Mark the rest | — |
| Valuable | Two-button register | — |
| Valuable | Medical notes on register | — |
| Valuable | After-class feedback prompt | — |
| Valuable | Term reports auto-draft | — |
| Frustration | No bulk feedback | — |
| Frustration | Feedback edits overwrite saved | — |
| Frustration | Previous feedback hidden | — |
| Frustration | Fixed studio-wide chips | — |
| Frustration | Overloaded student panel | — |
| Missing | Bulk feedback | Essential |
| Missing | Previous feedback on register | Highly desirable |
| Missing | Teacher chip sets | Highly desirable |
| Missing | Support-needs list | Useful |
| Missing | Offline register | Highly desirable |
| Remove/simplify | Student panel on phone | — |
| Greatest impact | Bulk feedback | — |

### Persona 12 — Priya Raman
| Type | Item | Rating |
|---|---|---|
| Valuable | Ask for cover | — |
| Valuable | School switcher | — |
| Valuable | Office-visible teacher messaging | — |
| Valuable | Cover register with safety notes | — |
| Valuable | Mark the rest | — |
| Frustration | Cover clash not detected | — |
| Frustration | No cross-school schedule | — |
| Frustration | No cover handover note | — |
| Frustration | Calendar export lacks site | — |
| Frustration | Offline register fails silently | — |
| Missing | Cover clash check | Essential |
| Missing | Cross-school schedule | Highly desirable |
| Missing | Cover handover note | Highly desirable |
| Missing | Calendar feed with location | Useful |
| Missing | Narrower cover access | Useful |
| Remove/simplify | Cover access window | — |
| Greatest impact | Cover clash check | — |

### Persona 13 — Tomás Herrera
| Type | Item | Rating |
|---|---|---|
| Valuable | Term reports auto-draft | — |
| Valuable | Skill levels | — |
| Valuable | Student timeline | — |
| Valuable | Exams on student record | — |
| Valuable | Student reflections | — |
| Frustration | Skill levels publish instantly | — |
| Frustration | Previous feedback hidden | — |
| Frustration | Feedback edits overwrite saved | — |
| Frustration | Fixed studio-wide chips | — |
| Frustration | All frameworks shown | — |
| Missing | Progress history over time | Essential |
| Missing | Draft-then-publish skills | Highly desirable |
| Missing | Previous feedback on register | Highly desirable |
| Missing | Class progress matrix | Highly desirable |
| Missing | Video feedback | Nice to have |
| Remove/simplify | All-framework skill wall | — |
| Greatest impact | Progress history over time | — |

### Persona 14 — Gwen Pritchard
| Type | Item | Rating |
|---|---|---|
| Valuable | Medical notes on register | — |
| Valuable | Two-button register | — |
| Valuable | Safeguarding concern | — |
| Valuable | Mark the rest | — |
| Valuable | Office-visible teacher messaging | — |
| Frustration | Offline register fails silently | — |
| Frustration | Offline marks overwritten | — |
| Frustration | Chips not age-appropriate | — |
| Frustration | Parent-reported absence not shown | — |
| Frustration | Truncated register header | — |
| Missing | Offline register | Essential |
| Missing | Age-appropriate chips | Highly desirable |
| Missing | Planned absence reporting on register | Highly desirable |
| Missing | Collection/pick-up info | Useful |
| Missing | Headcount view | Useful |
| Remove/simplify | Skill picker for pre-school | — |
| Greatest impact | Offline register | — |

### Persona 15 — Maureen Hales
| Type | Item | Rating |
|---|---|---|
| Valuable | Mark the rest | — |
| Valuable | Two-button register | — |
| Valuable | Ask for cover | — |
| Valuable | Teacher Today screen | — |
| Valuable | Medical notes on register | — |
| Frustration | Offline register fails silently | — |
| Frustration | Future register can be closed | — |
| Frustration | Rows stay expanded | — |
| Frustration | Too many teacher tabs | — |
| Frustration | No undo | — |
| Missing | Offline register | Essential |
| Missing | Wrong-day register guard | Highly desirable |
| Missing | Simplified teacher mode | Useful |
| Missing | Long-press Late/Excused | Nice to have |
| Missing | Larger register header | Useful |
| Remove/simplify | Practice and milestones in teacher view | — |
| Greatest impact | Offline register | — |

---

## 7. Group consolidated view

**Principal needs:**
- A register that is fast, correct and works without signal.
- Safety information at the point of teaching.
- Feedback that takes minutes, not evenings.
- Seeing who needs help.
- Cover that is safe and well-informed.

**Most valuable functionality:**
- The two-button register with "Mark the rest here" (named by 5 of 5).
- The medical brief on the register (4/5).
- Ask for cover (2/5).
- Office-visible messaging (2/5).
- Term report drafting (2/5).

**Frustrations:**
- Offline failure and the lost absence (3/5 name it as their top frustration).
- No bulk feedback, and feedback that is overwritten or hidden (3/5).
- Previous feedback is invisible where it is needed (2/5).
- Cover clashes and no handover (1/5, high severity).

**Common themes:**
- "Fast when it works, scary when it doesn't."
- The office-safe design (no private channels, the medical table closed to teachers, data scoped per school) is valued.
- Progress tools exist but are buried in an overloaded panel.

**Missing functionality:**
- Offline register.
- Bulk feedback.
- Previous feedback on the register.
- Teacher or age-specific chips.
- Cover clash check and handover.
- Cross-school schedule.
- Support-needs list.
- Draft-then-publish skills.
- Wrong-day guard.

**Adoption barriers:**
- Loss of trust after one silent offline failure (personas 14, 15).
- Feedback data loss (11, 13).
- No single diary (12).

**Highest-priority improvements:**
1. Make the offline register safe (D1–D3).
2. Preserve and show feedback (D4 and the "last focus" line).
3. Bulk and teacher-owned feedback chips.
4. Cover clash check and handover.
5. A support-needs view.

**Disagreements, kept:**
- Tomás wants *richer* progress tooling, with matrices, drafts and video. Maureen wants *fewer* tabs and a register-only mode. Gwen wants skills hidden for pre-school.
- Priya wants a cross-school view. That conflicts with the deliberate per-school scoping in migration `0032`, which the others implicitly benefit from for privacy.
- Siân wants a class-wide "apply to all". Tomás fears it would encourage generic, meaningless feedback.

**Scores:** Group satisfaction **5.8/10** · adoption likelihood **5.4/10** · continued-use likelihood **5.4/10**.

**Where our improvements could hurt other groups:**
- **Cross-school schedule:** could leak one school's class names to another school's office if it is built as shared data rather than a private teacher view. Owners and admins and the safeguarding leads would object.
- **Bulk feedback:** could reduce the personal quality parents value (parents group).
- **Narrower cover access:** might frustrate the office if the cover teacher can't message families about a cancelled class.
- **Wrong-day register guard:** the office sometimes enters late or backdated registers. The guard must apply to teachers only, or allow an override.

---

## 8. Candidate recommendations

### R1 — Offline-safe register (P0, M)
- **Screen/workflow:** `/teach/register`, the attendance queue, the query client.
- **Problem:** D1–D2. Offline taps do nothing visible, "Mark the rest" and "Save note" spin, and on reconnect a queued "Mark the rest" overwrote an absence. Driven in four runs (S22).
- **Proposal:**
  1. Register writes must never depend on `navigator.onLine` in the demo. Use `networkMode: 'always'` or `'offlineFirst'` for local mutations. In the hosted build, every register write goes through `AttendanceQueue`: marks, reasons, "Mark the rest", close and notes.
  2. Show each mark on screen immediately, and make sure the optimistic update key matches the `useRows` key.
  3. "Mark the rest" must capture the **explicit list of student ids that are unmarked at tap time, counting queued marks**, with the tap timestamp. It must never re-evaluate when it eventually runs.
  4. A persistent banner: "No signal — n marks saved on this phone; they will send automatically". Show a per-row "waiting" dot.
  5. "Close register" works offline as a queued intent. The server validates completeness on sync.
  6. On sync conflict (someone else marked differently), show "Office changed Nia to Present at 16:05 — keep yours?".
- **Files:** `src/app/providers.tsx`, `src/app/teach/register/page.tsx`, `src/lib/offline/attendance-queue.ts` (add kinds: reason, close, bulk), `src/lib/repos/teaching.ts` (`MARK_ATTENDANCE`), `attendance_record.client_marked_at`.
- **User groups:** teachers, office.
- **Supporting personas:** 11, 12, 14, 15.
- **Priority reason:** a safety register that records an absent child as present is a safeguarding risk.
- **Complexity:** M (the queue exists; the work is wiring and the "mark the rest" semantics).
- **Dependencies:** R-002 hosting, for real network behaviour.
- **Risks:** clock skew between devices under the newest-tap rule. Consider a server-received tie-break and show the device time.
- **Acceptance criteria:**
  1. Offline, tapping Absent shows it within 100 ms and the banner shows "1 waiting".
  2. Offline: Absent on A, then "Mark the rest" → on reconnect A is absent and the others are present.
  3. A reload while offline keeps the queued marks.
  4. Tests cover the bulk-plus-individual ordering.
- **User story:** As a teacher in a basement studio, I want my register taps to stick and show immediately with no signal, so that the register is always right for a fire drill.
- **Workflow:** open register → signal drops → keep tapping → banner → signal returns → banner clears → close.
- **Business rules:**
  - The newest tap per child wins.
  - A bulk action applies only to the ids it listed.
  - Close only when all are marked.
- **Edge cases:**
  - Two teachers marking the same register.
  - A tap on a cancelled session.
  - The child is unenrolled before the sync.
  - localStorage is full (fall back to in-memory with a warning).

### R2 — Offline app shell for teacher routes (P1, S–M)
- **Problem:** D3. "Open register" offline ends on a Chrome error page; `sw.js` caches only visited URLs, keyed with the query string.
- **Proposal:**
  - Precache `/teach/`, `/teach/register/` and `/teach/feedback/` (HTML plus RSC payloads) on service worker install.
  - Match navigations ignoring search (`ignoreSearch: true`).
  - Prefetch the next 7 days of registers and safety briefs into local storage or IndexedDB in the hosted build.
  - Add an offline fallback page.
- **Files:** `public/sw.js`, `components/app/pwa.tsx`.
- **Personas:** 12, 14, 15.
- **Priority reason:** without it, R1 only helps when the register is already open.
- **Risks:** stale safety briefs. Show "Medical info as of <time>".
- **Acceptance criteria:**
  - Cold offline load → Today → Open register renders the cached register with medical notes.
  - The navigation cache hits with any `?session=`.
- **User story:** As a teacher who arrives at a venue with no signal, I want to open today's register, so that I can start class on time.
- **Workflow:** open the app (cached) → Today → register.
- **Business rules:** cache the briefs only for the teacher's own sessions within 7 days; purge on sign-out.
- **Edge cases:** cover assigned while offline; the session moved.

### R3 — Preserve and show saved feedback when editing (P1, S)
- **Problem:** D4 (verified data loss, shot 10).
- **Proposal:**
  - Preload saved chips, note and skills into the draft when a child is opened.
  - Edits merge rather than replace.
  - Editing *shared* feedback asks "Update what the family sees?" and records `updated_at`, with optional notification.
  - Show the text the family will see.
- **Files:** `src/app/teach/feedback/page.tsx`, `lib/repos/progress.ts` (`SESSION_FEEDBACK` must return the note separately from `going_well`, since `save_class_feedback` concatenates them), `0029` `save_class_feedback`.
- **Personas:** 11, 13.
- **Complexity:** S. It needs a schema split of the note from `going_well` or parsing, so S–M if split.
- **Acceptance criteria:**
  - Save A+B → reopen → A and B are pressed → add C → saved = A+B+C.
  - Editing a shared note prompts, and the family view updates with an "edited" marker.
- **User story:** As a teacher, I want to see and extend what I already wrote, so that I never lose feedback.
- **Business rules:** one note per child per session; shared edits are audited.
- **Edge cases:** two devices editing; a note from the office.

### R4 — Previous feedback at the point of teaching (P1, S–M)
- **Problem:** S18. History is only in the student panel timeline, after the skills wall.
- **Proposal:**
  - On the register name expand, and on each feedback row, show "Last time (date): Going well … / Work on …" and current goals. Show up to 2 entries, from any teacher.
  - Add a "Class focus" view listing each child's current work-on.
- **Files:** a new query on `feedback_note` and `student_goal` in `teaching.ts`; `register/page.tsx` `RegisterLine`; `feedback/page.tsx`.
- **Personas:** 11, 13, 12 as cover.
- **Acceptance criteria:**
  - Expanding a child shows their latest feedback within 1 tap.
  - It respects RLS: a cover teacher sees it only within the cover window.
- **User story:** As a coach, I want each child's last focus when I open the register, so that I can follow up in class.
- **Edge cases:** no feedback yet; feedback from a different style or class (label the class).

### R5 — Cover clash check and handover (P1, M)
- **Problem:** D5. There's no availability check in `app.cover_session` or the session sheet, and the cover teacher gets no handover.
- **Proposal:**
  1. `cover_session` returns or raises a warning when the teacher has an overlapping session, including a travel buffer between locations. The office must confirm an override.
  2. The teacher's Today shows a "Clash" word on overlapping rows.
  3. The cover teacher sees the usual teacher's last 3 session notes plus a "handover note" field on the cover request or assignment.
  4. Narrow cover access to the covered session's register, briefs and history, and make skill edits read-only for cover.
- **Files:** `0023_operations.sql` (`cover_session`, `teacher_class_ids`), `components/app/session-sheet.tsx`, `app/teach/page.tsx`, `studio_request`.
- **Personas:** 12, plus the office groups.
- **Complexity:** M.
- **Risks:** the office may need to over-assign deliberately, so allow an override.
- **Acceptance criteria:**
  - Assigning Priya to Junior Tap 16:30 while she teaches 16:00–16:45 shows a warning.
  - Priya's Today flags the clash.
  - The cover register shows Marcus's last notes.
- **User story:** As a freelance teacher, I want to be warned before I'm double-booked, so that no class is left untaught.
- **Business rules:**
  - The overlap counts start to end plus a configurable buffer between locations.
  - Only sessions in the same school are checked; cross-school is out of scope unless R8 is built.
- **Edge cases:** the teacher is an assistant in one class; a cancelled session.

### R6 — Bulk and teacher-owned feedback (P2, M)
- **Problem:** S17. 41 taps for 12 children, an estimated 61 or more for 20, and a fixed studio-wide chip set.
- **Proposal:**
  - "Apply to all present / selected" for a chip or a class note, then tweak per child.
  - Teacher-owned chip sets per class or age group, added inline.
  - Age bands hide technical chips and skills for under-7s.
- **Files:** `feedback/page.tsx`, `feedback_chip` (add `owner_staff_id` and `class_id`, and change the RLS policy `chip_admin`).
- **Personas:** 11, 14 (13 is cautious).
- **Acceptance criteria:**
  - 20 children with the same going-well chip plus individual work-on takes no more than 22 interactions.
  - A teacher can add a chip without the office.

### R7 — Support-needs view (P2, M)
- **Problem:** S20. The only signal is all-time attendance under 70%, and it is mislabelled (D8).
- **Proposal:** a "Needs attention" filter. Flag a child for any of:
  - 2+ consecutive absences;
  - a falling attendance trend over the last 6 weeks;
  - the same work-on 3+ times;
  - no feedback in 4 weeks;
  - a reflection mood of 1–2.

  Show reasons in words, and fix the label to "this term" with a real term filter.
- **Files:** `teaching.ts` `MY_STUDENTS`, `teach/students/page.tsx`.
- **Personas:** 11, 13, 14.

### R8 — Cross-school personal agenda (P2, M–L, uncertain)
- **Problem:** S19. You have to switch schools to see each day, and the ICS covers one school only.
- **Proposal:**
  - A read-only "My week" listing only the teacher's own sessions across memberships: time, school, site, room, class name. No student data.
  - A clash flag across schools.
  - ICS that includes the location and school.
- **Files:** a new `security definer` function bypassing `in_scope` for own sessions only; `0032` design review.
- **Personas:** 12.
- **Risks:** this conflicts with the `0032` principle; it needs a security review.

### R9 — Register time guard (P2, XS–S)
- **Problem:** D6.
- **Proposal:** teachers can mark from 60 minutes before the start until 7 days after. Outside that window, a confirm says "This class is on Tue 1 Dec". The office is exempt.
- **Files:** `MARK_ATTENDANCE` / a trigger, `register/page.tsx`.
- **Acceptance criteria:** on Friday, marking Tuesday's register prompts a confirm.

### R10 — Small register and feedback polish (P3, XS)
- D7: a not-found state for unknown sessions.
- D8: the label.
- D10: wrap the subtitle.
- D13: collapse a row after a mark.
- D9: an optimistic "Shared" state.
- Same ordering on register and feedback (last name).
- D12: include trial and drop-in children in feedback.

### R11 — Scoped, reviewable skill levels (P2, S)
- **Problem:** D11.
- **Proposal:**
  - Default to the frameworks of the class being taught, with "show all" available.
  - Level changes stay draft until "share levels", or the release is batched with feedback sharing.
- **Files:** `app.student_skills` (take `class_id`), `components/app/progress.tsx` `SkillsPanel`.
- **Personas:** 13, 14.

---

## 9. Feature rationalisation (teacher area)

| Feature | Decision | Reason |
|---|---|---|
| Two-button register + "Mark the rest" | **Retain** | The best-liked feature across all five personas; 9 interactions for 12 children. |
| Offline queue / service worker | **Redesign** | The design is sound on paper (newest tap wins) but it never engages and loses data (D1–D3). |
| Medical brief on register and Today | **Retain** | A clear safety win. Collapse after marking (D13). |
| Class feedback chips | **Refine** | Preserve edits (R3), add bulk (R6), teacher and age chip sets. |
| Student detail panel (8 sections) | **Consolidate** | Put a "current focus" summary first. Fold Practice and Milestones into the Timeline on phone. |
| Skill levels | **Refine** | Scope to the class style and add a review step (R11). |
| Term reports | **Retain / Refine** | Useful, but drafts are thin without feedback. Warn "No feedback recorded this term for 12 children". |
| Ask for cover | **Retain** | 4 interactions, clear status. |
| Cover access and assignment | **Refine** | Clash check, handover, narrower scope (R5). |
| School switcher | **Retain**; **Add** a cross-school agenda later | Privacy is right; the diary is missing (R8). |
| Teacher messaging (office-visible) | **Retain** | Good boundary: "There are no private channels between staff and families". |
| Safeguarding concern sheet | **Retain** | Good guidance text. |
| Session notes | **Refine** | Surface them to the cover teacher and the next session. |
| Support-needs signals | **Add** | R7. |
| Practice and Milestones in teacher view | **Defer / Remove from phone** | Low value for the teacher's daily job (personas 11, 15). |
| Calendar export | **Refine** | Add location and school. |
