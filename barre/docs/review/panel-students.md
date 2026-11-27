# Panel review — Students and prospective customers ("students" group)

> Simulated end-user panel. Personas, quotes and satisfaction scores are professional judgement by an AI reviewer, not real user research. All data is synthetic (Northstar Dance Academy seed). No payments, emails or SMS are connected.

---

## 1. Method and limitations

**What was driven (Playwright + Chromium, against the static preview at `http://127.0.0.1:8080/General/studio-next/`):**

| Run | Viewport | Who | What |
|---|---|---|---|
| `amir.cjs` | Phone 390×844 (isMobile, touch) | Amir Wright, student, 15 (`uid(2,40)`) | `/learn`, `/learn/timetable`, `/class?id=` (Street Seniors), `/learn/feedback` + timeline, saved a reflection, proposed a goal, logged practice, `/learn/library`, `/learn/events`, tried 4 routes for other roles, recorded every button/link on 4 student screens, Tab order on `/learn`, root font-size 200%, axe-core (WCAG 2 A/AA, 2.1 AA) on 4 screens |
| `practice*.cjs` (6 runs) | Phone and desktop 1440×900 | Amir, and Hannah for a child | Repeated practice logging to pin down a save/feedback problem |
| `public.cjs` | Phone | Anonymous visitor, then Hannah, then Nadia (admin) | `/welcome`; `/join?school=northstar`: age filter 10, booked a trial for a 10-year-old (9 interactions), age 35, booked an adult drop-in as a new adult, booked an adult drop-in with an **existing parent's email**; Hannah's `/family/children`, `/family/payments`, `/family/feedback`, `/family/schedule`; Nadia's `/enrolment`; Nadia invited the new adult as a parent via `/account`; opened and tried to accept the invite at `/invite?token=` |
| `family.cjs` | Phone | Student logins `uid(2,41)`, `uid(2,42)`; Nadia; Amir; Hannah | Nadia created an exam session and entered Amir for "Grade 5"; checked all four student screens for it; Amir saved a reflection; repeated the existing-email drop-in; Hannah: payments, exam visibility, **Report an absence** for Amir (sent), schedule after absence, **Classes and trials** sheet for Nia (9), feedback tabs for Nia and Amir (checked whether Amir's reflection or practice shows to the parent) |
| `sheet.cjs` | Phone | Hannah | Re-ran the Classes and trials sheet with a longer wait to capture prices |

Scripts and raw logs: `/tmp/claude-0/-home-user-General/b4a48a5e-78db-50c3-ae22-e03d809e9579/scratchpad/panel/students/` (`*.cjs`, `amir.log`, `public.log`, `family.log`). Screenshots: `docs/review/shots/students-*.jpg` (15 files).

**Code inspected (findings marked "code-verified" were read, not run):** `src/app/learn/**`, `src/app/join/page.tsx`, `src/app/welcome/page.tsx`, `src/app/invite/page.tsx`, `src/app/account/page.tsx` (InviteSheet), `src/components/app/{practice,progress,events-view,exams,family-classes,drop-ins}.tsx`, `src/lib/repos/{hub,progress,events}.ts`, migrations `0010_hubs`, `0019_platform` (accept_invitation), `0023_operations` (guardian_self_edit_guard), `0029_progress`, `0033_dropin_credit`, `0040_public_safety_retention` (public_book_trial, public_adult_drop_in, book_drop_in_unchecked), `0042_exams_events_practice`, seed `src/lib/db/seed/data.ts`.

**Limitations:**
- **No younger (under-13) student login exists, and none can be made.** The database refuses a student login under `studio.student_login_min_age` (default 13) and without a named approving guardian (`app.check_student_login`, 0010). I tested persona 1 (aged 9 to 12) through the parent hub (Hannah's daughter Nia, 9) and through code.
- **No adult-student login exists in the seed.** An adult who books on `/join` gets a family named "<Surname> (adult)", a guardian row ("Self") and a student row, but no login. I tried to give the new adult a login with the office invite flow. **That failed with a database error** (Defect D2), so I could not test an adult's signed-in experience at all. Persona 3 was judged from the public flow, the code and the parent hub as Hannah.
- `uid(2,41)` and `uid(2,42)` also open a student hub (teenagers in families 2 and 3). I only checked that they load. I did not identify them further.
- Timings are wall-clock times for scripts on a shared, loaded machine, with an in-browser database. Treat them as indicative only. The first load of a fresh context took 13–16 s ("Setting up…"). Later screens took about 2–7 s.
- Not testable: emails, SMS and push (R-003), card payment (R-006), real sign-in (R-001), and offline use. Offline in the demo is moot because the database is local. ARCHITECTURE.md describes an offline queue for registers only, so I assume (unverified) that the hosted student and parent hubs need a connection.
- Screen readers were not tested. Keyboard and automated checks (axe-core) only. I simulated a larger text size by setting the root font-size to 200%. That approximates the browser's default-font-size setting, not page zoom.

---

## 2. Scenario results

### Scenario 1 — Find a suitable beginner class
- **Persona:** 4 (adult beginner, 41) for the adult path. 23 (parent of a 10-year-old) for the child path.
- **Objective:** Find a class that suits a beginner of my age.
- **Start:** `/join?school=northstar` (the school's public link, shown to the office in `/enrolment` as "Your trial booking page").
- **Outcome:** **Completed with significant friction.**
- **Steps (child path, 2 interactions):** (1) Typed 10 in "Your child's age", which left one class, "Jazz Intermediate, Ages 9–13", plus "Show later dates (2 more days)". (2) Read the row: time, name, ages, location, "Free", "4 places left".
- **Steps (adult path, 1 interaction):** (1) Typed 35 in "Your child's age". The result was "No trial places in the next three weeks — Please contact the school", with "Adults: drop in" below it: three dates of "Adult Contemporary (drop-in)", £12.00 (`students-13-join-adult-age35.jpg`).
- **Difficulties:**
  - The age field is labelled "Your child's age" even though the same page serves adults.
  - At age 35 the first message reads as a dead end, "No trial places…", although a suitable adult class is listed right below it.
  - The rows show no level (beginner, improver, intermediate), no description, no teacher, no length, no dress code and no "what to expect". The class table has a `description` column, and the seed's adult class has one ("For adults, all levels…"), but neither `public_trial_sessions` nor `public_drop_in_sessions` returns it.
  - Class names carry jargon ("Grade 2 Ballet", "Jazz Intermediate", "Modern Juniors") with no explanation.
- **Missing:** class suitability information (level, prior experience, what to wear); a page per class; a filter by style or day; a "beginners welcome" flag.
- **Defects:** none blocking. Copy issue C1 (age label).
- **Clarity of outcome:** OK for "when and where". Poor for "is this right for me".
- **Satisfaction:** 2/5 (adult), 3/5 (parent).
- **Improvements:** R4 and R5 below.

### Scenario 2 — Book a class and understand its cost
- **Personas:** 4 (adult beginner) for the drop-in. 23 (parent) for the trial.
- **Start:** `/join?school=northstar`.
- **Outcome:** Adult drop-in: **Completed with minor friction**. Trial: **Completed with significant friction** (the ongoing cost is never shown). Existing-parent email: **defective** (D1).
- **Steps, trial (9 interactions, about 18 s measured by the script from page load to confirmation):** age → pick slot → child name → date of birth → your name → email → mobile → privacy acknowledgement → "Book Jazz Intermediate, Saturday 28 November". Result: "BOOKED — Isla is coming to Jazz Intermediate… will be in touch by email with what to bring" (`students-12-join-trial-booked.jpg`). The trial appeared at once in Nadia's `/enrolment` as "Isla Morgan · TRIAL BOOKED · via website".
- **Steps, adult drop-in (9 interactions):** pick a date → name → email → mobile → emergency contact → their phone → privacy → "Book Adult Contemporary (drop-in), £12.00". Result: "BOOKED — See you at Adult Contemporary… £12.00 — pay on the night or online once the school sends your invoice."
- **Difficulties:**
  - The trial shows "Free", but nothing on the public page says what a term costs. Logged-in parents do see it ("£54.00 a term" in the Classes and trials sheet, `students-18-parent-classes-sheet.jpg`).
  - There is no cancellation policy before booking. "Cancel more than 24 hours ahead and you are not charged" exists only inside the logged-in drop-in panel (code-verified, `drop-ins.tsx:85`).
  - Class packs (5 for £50, 10 for £90) are seeded but not offered on the public page.
- **Defect D1 (high):** booking an adult drop-in with an email that already belongs to a parent books **that parent's first child** into the adult class and invoices the family. "Hannah Wright" booked for herself, and Hannah's `/family/payments` then showed "INV-1071 · AMIR · Adult Contemporary (drop-in) — 3 Dec — Amir £12.00" (`students-15-adult-dropin-billed-to-child.jpg`). Amir is 15 and the class's minimum age is 18. The public page still said "BOOKED — See you at…".
- **Missing:** term or monthly price on the public page; cancellation and refund terms before booking; a booking reference; add-to-calendar; a way to cancel or change without phoning.
- **Satisfaction:** 3/5 (adult drop-in), 2/5 (parent).

### Scenario 3 — View upcoming weekly schedule
- **Persona:** 2 (Amir, 15, competitive).
- **Start:** `/learn` → `/learn/timetable`.
- **Outcome:** **Successfully completed.**
- **Steps (1 interaction):** `/learn` shows "NEXT · TODAY 17:30 Street Seniors" in very large type, with teacher, room and studio, plus the next three sessions (`students-01-learn-home.jpg`). Tapping "Full timetable" gives four weeks grouped by day, with teacher, studio and room.
- **Difficulties:**
  - In the short list, "Thursday" means next week's Thursday (today is Friday), with no date beside it.
  - Events appear only once a place is confirmed, so the Summer Show dress rehearsal (11 Jan) and requested events are absent from the timetable. They appear only on `/learn/events`.
  - Students have no calendar export (parents have one, R-036, `/family/schedule`).
  - Students have no notification bell (`shell.tsx:208` hides it for students), so a cancelled class only shows up when Amir opens the app.
- **Satisfaction:** 4/5.

### Scenario 4 — Receive feedback and understand what to practise
- **Persona:** 2 (Amir), with persona 5 (advanced) reading the same screens.
- **Start:** `/learn` → `/learn/feedback`.
- **Outcome:** **Completed with minor friction.**
- **Steps (5 interactions):**
  1. `/learn`, "Latest from your teacher": headline, quote, "To work on: Spotting on the turns — pick one point on the back wall", teacher, class and date.
  2. "All feedback" shows two notes, then "Your skills" by style: Contemporary, Street and Tap, each "5 of 7 assessed", with Mastered, Secure or Developing per skill and "'Not yet' means the teacher hasn't assessed it — not that it's gone badly" (`students-04-feedback.jpg`).
  3. Reflection: chose "Good", typed a sentence, Save. Result: "Thanks — Your teacher will see it. Your parents won't." Verified: Hannah's `/family/feedback` Amir tab did not show it.
  4. Goal: typed one and pressed Enter. It showed "Waiting for your teacher".
  5. Practice: logged 30 minutes of "Pirouettes" (`students-06-practice-after-log.jpg`).
- **Difficulties:**
  - "To work on" is plain text. It is not linked to a video, a skill or the library, although the class page has "Videos, music and notes for this class".
  - Practice saving: in 4 of about 9 automated attempts the weekly total still read "0 min" 3–5 s after tapping Log, with no saving state shown. In one run a reload about 3 s after logging lost the entry. Other attempts showed the entry after about 2 s. This is probably the in-browser demo database being slow under load, but the UI gives no "Saved" acknowledgement (D5).
  - The goal input has no button text beyond "Add" and no character guidance.
  - The timeline lists 21 identical "23 Nov · <skill> — <level>" rows (`students-05-feedback-timeline.jpg`). It is noisy and not grouped.
  - Ballet skills appear in the timeline ("Port de bras — Mastered") but not in "Your skills", because Amir is in no ballet class (D6).
- **Satisfaction:** 4/5 (Amir). Persona 5: 3/5, wanting more depth.

### Scenario 5 — Review progress over the past three months
- **Personas:** 5 (advanced) and 2.
- **Start:** `/learn/feedback` → "Show the timeline".
- **Outcome:** **Partially completed.**
- **Steps (2 interactions):** opened feedback, then "Show the timeline".
- **What exists:**
  - A chronological list of feedback, skill levels with "previous → current", goals, milestones ("10 classes", "First class") and term reports. No report had been shared for Amir.
  - Skills show "up from …" when a level changes.
- **What is missing:**
  - No date range or style filter, and no "3 months ago vs now" view.
  - No attendance history for the student. The parent sees "83%" only.
  - No chart of skills over time.
  - No practice history beyond the last 4 entries. Teachers see 4 weeks.
  - No exam results in the student hub (see Scenario 7).
  - The seed holds only about 5 weeks of history, so a real 3-month view could not be exercised.
- **Satisfaction:** 2/5.

### Scenario 6 — Cancel or rearrange a class
- **Personas:** 2 (student). Parent action via Hannah for persona 1. Persona 3 (adult).
- **Outcome:** **Student: Unable to complete.** Parent: **Partially completed.** Adult: **Unable to complete** online.
- **Steps:**
  - Student: I recorded every control on `/learn`, `/learn/timetable`, `/learn/events` and `/learn/feedback`. None is an absence, cancellation, swap or make-up control. "Ask to take part" exists for events only.
  - Parent (5 interactions): `/family/children` → "Report an absence" (Amir) → date → "School trip" → Send. Result: "SENT — The studio has been told. Your message is in Amir's file. The teacher will see it before class." (`students-17-parent-absence-dialog.jpg`). `/family/schedule` afterwards still shows the class with no "away" marker.
  - Adult who booked publicly: has no login, and the confirmation text offers no cancel link. Logged-in drop-in cancellation with a 24-hour rule exists (code-verified, `drop-ins.tsx:58`, `CANCEL_DROP_IN`). It was not driven, because an adult can't get a login (D2).
- **Missing:** a student-side "I can't make it"; make-up or swap booking; an away marker on the schedule; trial cancel or reschedule for prospects.
- **Satisfaction:** 1/5 (student), 3/5 (parent), 1/5 (adult).

### Scenario 7 — Competitive dancer understands upcoming rehearsals and competitions
- **Persona:** 2 (Amir).
- **Start:** `/learn/events`.
- **Outcome:** **Completed with significant friction.**
- **Steps (1 interaction):** `/learn/events` lists:
  - Workshop, 9 Dec: "Requested — waiting on the studio… The studio has your request for Amir and will confirm."
  - RAD Grade 3 Ballet exam, 16 Dec.
  - Thames Valley Dance Festival, 23 Dec: cost £35, "Entries close 2 Dec", "Ask to take part".
  - Summer Show, 14 Jan, with "Summer Show — full dress rehearsal · Monday 11 January, 17:00" (`students-07-events.jpg`).
- **Then:** Nadia created "RAD · Grade 5 Ballet exams", 16 Dec, and entered Amir for Grade 5. **The entry appears nowhere in Amir's hub** (checked all four screens). Hannah's `/family/children` shows "Exams: RAD Grade 5 · 16 Dec · Entered" (D3).
- **Difficulties:**
  - Rehearsals sit inside the event card, not in the timetable or on "You're down for".
  - Routines and costumes show only after confirmation.
  - "Places 0 of 24" while Amir's own request is pending reads oddly.
  - An invited student cannot answer an invitation ("We'll be there" is parent-only). That is defensible for under-18s but is not explained to the student.
- **Satisfaction:** 2/5.

### Scenario P1 — Prospective customer journey (discover → suitability → register → trial → regular)
- **Persona:** 23 (parent researching schools), plus persona 4.
- **Outcome:** **Partially completed.**
- **Discover:** `/welcome` is Swayvo's sales page **for dance schools** ("Book a demo", "Try the demo" → `/`) (`students-09-welcome.jpg`). It has no content for a family choosing a school and no link to any school's `/join`. Prospective families can only arrive through a school's own website link.
- **Suitability:** see Scenario 1. There is a hero image, a logo and a list of trials, but no about-the-school, teachers, safeguarding statement, prices, address or map, FAQ or reviews.
- **Register and trial:** worked (Scenario 2). The privacy wording is clear and specific: "kept to arrange the class… If you don't join, they are deleted after 90 days". Marketing consent is a separate, optional, unticked box. A honeypot is used and no CAPTCHA was shown. No medical, allergy or photo-consent questions are asked at trial; the office collects these later (code: `ensure_trial_student`). That is lighter for the parent but a safeguarding gap at the first class.
- **After booking:** the confirmation says "will be in touch by email". Email is not connected (R-003), so nothing arrives in this build. There is no reference number, calendar file, "what to bring" or contact detail on the confirmation.
- **Becoming regular:** the office sees the trial in the `/enrolment` pipeline with "Came / No show / Joining". For the family to get a login, the office invites them from `/account`. **Inviting the adult who had booked, to their own "Adler (adult)" family, failed on acceptance with "Something went wrong — only the office can change who is linked to a family"** (`students-16-invite-accept-error.jpg`, D2). From the code, the same failure is expected for any invite where a guardian row with that email already exists unlinked. That includes every parent who booked a trial publicly, but I did not separately run a trial-parent invite.
- **Satisfaction:** 2/5.

### Outcome counts
| Outcome | Count |
|---|---|
| Successfully completed | 1 (S3) |
| Completed with minor friction | 1 (S4) |
| Completed with significant friction | 3 (S1, S2, S7) |
| Partially completed | 2 (S5, P1) |
| Unable to complete | 1 (S6, student path) |

---

## 3. Feature status table

| Feature | Where | Status | Evidence |
|---|---|---|---|
| Student home (next class, latest feedback, goals, practice) | `/learn` | Fully implemented and tested | `students-01` |
| Student timetable (4 weeks) | `/learn/timetable` | Fully implemented and tested | amir.log |
| Class page for students (notices, class resources) | `/class?id=` | Fully implemented and tested | `students-03` |
| Feedback notes ("going well" and "to work on") | `/learn/feedback` | Fully implemented and tested | `students-04` |
| Skills by style (developing, secure, mastered) | `progress.tsx` SkillsPanel | Fully implemented and tested; ballet skills orphaned (D6) | `students-04` |
| Progress timeline | `/learn/feedback` | Partial: no filter, grouping or range | `students-05` |
| Milestones | `/learn`, `/learn/feedback` | Fully implemented and tested | amir.log |
| Goals (student proposes, teacher agrees) | `Goals` | Implemented; student side tested, teacher agreement not driven | amir.log |
| Self-reflection, private from parents, 13+ only | `ReflectCard` | Fully implemented and tested | family.log |
| Practice log | `practice.tsx` | Implemented; weak save feedback (D5) | practice*.cjs |
| Library (videos, tracks, documents) | `/learn/library` | Fully implemented and tested (links are placeholders) | amir.log |
| Events and requests to take part | `/learn/events` | Implemented and tested | `students-07` |
| Rehearsals in the student timetable | `MY_TIMETABLE` | Missing (only confirmed events, and no rehearsal rows) | `hub.ts:129` |
| Exam entries visible to the student | — | Missing (parent and teacher only) | D3 |
| Student absence or cancel | — | Missing | Scenario 6 |
| Parent "Report an absence" | `/family/children` | Fully implemented and tested (message only) | `students-17` |
| Parent visibility of feedback and skills | `/family/feedback` | Fully implemented and tested | `students-19` |
| Student login under 13 | DB trigger `check_student_login` | Deliberately blocked (by design) | 0010 |
| Guardian approval of a teen login | DB columns `login_approved_by` | Partial: DB only, **no UI to approve** | grep: no UI writes `login_enabled` |
| Adult student login | — | Missing; invite path defective (D2) | `students-16` |
| Public trial booking | `/join` | Fully implemented and tested | `students-12` |
| Public adult drop-in booking | `/join` | Implemented; defective for existing emails (D1) | `students-15` |
| Class suitability info on public page | `/join` | Missing (description not returned) | `join/page.tsx` Slot type |
| Public price of regular classes | `/join` | Missing | — |
| Parent class browser with term prices | `ChildClassesSheet` | Fully implemented and tested | `students-18` |
| Drop-in cancel with 24-hour rule | `drop-ins.tsx` | Implemented, not driven | code |
| Booking confirmation email | — | Implemented in demo / not verifiable (R-003) | — |
| Consumer-facing discovery page | `/welcome` | Missing (page is B2B) | `students-09` |
| Larger-text support | global CSS | Defective: px-based type ignores root font-size (D4) | `students-08` |
| Keyboard access and focus visibility | `/learn` | Fully implemented and tested | amir.log tab order |
| Automated WCAG A/AA check | 4 student screens | No violations reported by axe-core | amir.log |

---

## 4. Defects found

**D1 — Adult drop-in booked under an existing parent's email books and bills the parent's first child instead. Severity: high.**
- **Repro:** `/join?school=northstar` → "Adults: drop in" → choose any date → Name "Hannah Wright", Email `hannah.wright@example.com`, phones → tick privacy → Book. Then sign in as Hannah → `/family/payments`.
- **Expected:** a booking for Hannah herself, or a prompt to sign in or choose who it is for.
- **Actual:** the public page says "BOOKED — See you at Adult Contemporary". The invoice reads "Adult Contemporary (drop-in) — 3 Dec — **Amir**", and a 15-year-old is booked into an 18+ class. No age check runs.
- **Cause:** `app.public_adult_drop_in` (0040) does `select id into kid from student where family_id = fam … order by created_at limit 1`. `book_drop_in_unchecked` does not check `age_min`.
- **Screenshot:** `students-15-adult-dropin-billed-to-child.jpg`.

**D2 — Accepting an invite fails when a guardian row with that email already exists. Severity: high (blocks converting any publicly booked adult or trial parent to a login).**
- **Repro:** book an adult drop-in as `sam.adler@example.com`. As Nadia, go to `/account` → Invite → Parent → family "Adler (adult)" → same email → Create invitation. Open the link → Accept and join.
- **Expected:** the account is linked to the existing guardian and the person lands in `/family`.
- **Actual:** "Something went wrong — only the office can change who is linked to a family".
- **Cause:** `app.accept_invitation` (0019, around line 640) runs `update guardian set user_id = me` for the matching unlinked row, and `app.guardian_self_edit_guard` (0023:333) rejects it because the accepting user is not an admin. `tests/platform.test.ts` only covers a new email (insert path).
- **Screenshot:** `students-16-invite-accept-error.jpg`.

**D3 — A student cannot see their own exam entries. Severity: medium.**
- **Repro:** as admin, `/events` → Exams → add a session → enter Amir, "Grade 5". Sign in as Amir and check `/learn`, `/learn/events`, `/learn/feedback` and `/learn/timetable`.
- **Expected:** "Grade 5, 16 Dec, entered", plus results later.
- **Actual:** nothing. The parent hub shows it.
- **Note:** RLS already allows the student to read it (`exam_entry_read` includes `student_self_id()`). Only the UI is missing.

**D4 — Text does not scale with the user's default font size. Severity: medium (accessibility, WCAG 1.4.4 risk).**
- **Repro:** on `/learn`, set `document.documentElement.style.fontSize = '200%'`, which equals the browser's "font size: very large".
- **Expected:** text grows.
- **Actual:** 0 of the 60 sampled text elements changed size, because sizes are fixed px (`text-[14px]`, `text-[13px]` and so on). Page zoom still works.
- **Screenshot:** `students-08-learn-root-font-200.jpg`.

**D5 — Practice log gives no saved acknowledgement and can appear not to save. Severity: low to medium (possibly demo-specific).**
- **Repro:** on a phone, `/learn` → enter minutes and what was practised → Log, immediately after the first load.
- **Actual:** in 4 of about 9 runs, "0 min this week" was unchanged 3–5 s later. In one run a reload about 3 s later lost the entry. In other runs it appeared after about 2 s. The "what" field clears instantly, which reads as "done" even before the total updates.
- **Expected:** an immediate optimistic total or a "Saved" toast.
- **Screenshot:** `students-06-practice-after-log.jpg`.

**D6 — Orphaned skills. Severity: low.**
- Assessments in a style the student does not take (the seeded ballet skills for Amir) appear in the timeline but not in "Your skills". The student sees a "Mastered" with nowhere to find it. (`students-05`)

**C1 — Copy: "Your child's age" filter on a page that also serves adults. Severity: low.**
- At age 35 the first message is "No trial places in the next three weeks". (`students-13`)

**C2 — Student hub has no notifications. Severity: low to medium.**
- Students get no bell (`shell.tsx:208`) and no messages area, so a cancellation or cover teacher is only seen if the student opens the timetable.

---

## 5. Individual panel member reports

### Persona 1 — "Maya", 10, recreational ballet and street (as seen by her and her dad)
**User profile:**
- Year 6. Does Grade 3 Ballet and Street Juniors because her friends do.
- Uses her dad's tablet. Reads well but gets bored by long pages.
- Has no login: the school's minimum age is 13, and the database refuses younger logins. I judged the experience through the parent hub (Hannah's 9-year-old, Nia) and the code.
- Primary needs: know what she is learning, feel proud, and not be graded in front of her parents.
- Frustrations: "everyone else gets told they're good".

**Application experience:**
- First impression (through Dad's phone): Nia's feedback tab opens with a lovely note, "Lovely week… the arms finally look unhurried", then a long block of "Not yet · 9 skills" under Ballet, Jazz, Modern and Street, all "0 of 7 assessed" (`students-19`).
- Most valuable: the teacher's own words, and milestones ("25 classes"). They feel like stickers.
- Least valuable: four grids of unassessed skills. For a 10-year-old that reads as a to-do list of failures, even with the "not that it's gone badly" line. That line also only appears once something has been assessed.
- Exceeded expectations: the database genuinely protects her. No login under 13, and reflections are only offered to 13+.
- Failed expectations: there is nothing she can do herself. She can't see the "Videos and tracks" for her own class unless Dad opens them, and she can't log practice. The parent can do that for her on `/family/children`.
- Missing: a child-friendly "my dancing" view on a parent's device (parent-supervised mode), and stickers or badges in plain words.

**Recommendations:**
1. Hide skill styles with 0 assessed for under-13s.
2. Add a parent-supervised child view of the library and practice.
3. Use friendlier skill words for juniors.
4. Show "Not yet" reassurance always.
5. Let the parent choose whether skill levels are shown at all.

Remove or simplify: the full unassessed skill grid. Greatest impact: a supervised child mode.

**Adoption verdict:** "It's Dad's app, not mine." Dad would use it for notes and milestones. It would not replace the WhatsApp video the teacher sends.

**Scores:** Relevance 6, Quality 7, Completeness 4, Ease 7, Efficiency 6, Usefulness 5, Adoption 5, Continued use 5. **Overall 5/10.** It is safe and kind, but under-13s are only spectators.

### Persona 2 — Amir, 15, competitive (street, tap, contemporary)
**User profile:**
- Three classes a week, requests competitions and workshops. Phone-only, Android, very confident with tech.
- Needs: the timetable, what to fix, music for practice, and competition dates and entry deadlines.
- Frustrations: hearing about rehearsals second-hand from Mum.

**Application experience:**
- First impression: "NEXT · TODAY 17:30" in huge type is the best thing in the app. I knew where I was going in one second (`students-01`).
- Most valuable: the feedback note with "To work on"; skills per style with "5 of 7 assessed"; the private reflection ("Your parents won't" see it, and I checked that Mum can't); and class videos and tracks on the class page.
- Least valuable: a timeline of 21 rows all dated 23 Nov.
- Exceeded expectations: privacy of reflections, and that I can propose my own goal.
- Failed expectations:
  - My Grade 5 exam entry is invisible to me but visible to Mum (D3).
  - The festival's "Entries close 2 Dec" sits in the events list, but I can only "Ask to take part".
  - The dress rehearsal is buried in the show card, not in my timetable.
  - I can't say I'll miss Friday. I have to ask Mum.
  - No notifications at all.
- Usability concerns: practice logging sometimes looked like it hadn't saved (D5).
- Opportunity to simplify: merge "Events" and "Timetable" into one diary with a filter.

**Recommendations:**
1. Put exams, rehearsals and confirmed events in my timetable.
2. Add "Can't make it" for 13+, which tells the parent and the studio.
3. Add notifications for changes.
4. Link "To work on" to a video or skill.
5. Show entry-deadline reminders.

Remove or simplify: the ungrouped timeline. Greatest impact: one diary with classes, rehearsals, competitions and exams.

**Adoption verdict:** "I'd use it before every class, but only because it's quicker than asking Mum." It would keep me if it pinged me about rehearsals.

**Scores:** Relevance 9, Quality 7, Completeness 5, Ease 8, Efficiency 7, Usefulness 7, Adoption 8, Continued use 6. **Overall 7/10.**

### Persona 3 — "Gareth", 52, adult recreational tap and contemporary, no guardian
**User profile:**
- Engineer who took up tap after retiring early from running. Desktop at home, phone at the studio.
- Has dyslexia: prefers short labels and a larger default font (set in browser settings), and dislikes dense grey text.
- Needs: book the classes he can make, pay, and cancel without phoning.

**Application experience:**
- Joining: the only route for me is "Adults: drop in" on `/join`. Booking was fine: £12, nine fields.
- I typed my age into "Your child's age" and was told "No trial places" before I saw the adult section (C1).
- There is no login for me afterwards. When the office tried to invite me, acceptance broke with "only the office can change who is linked to a family" (D2). So I have no account, no list of my bookings and no way to cancel. The 24-hour cancellation rule exists in the logged-in screen, but I can't reach it.
- Even if it worked, I would be a "parent" in a family called "Adler (adult)", in a hub that talks about "your child" and "the teacher sees the weekly total, nice work, Gareth".
- Accessibility: my browser's large-font setting does nothing here (D4), so I had to zoom, which wraps everything. The grey meta text (`text-ink-3`, 13px) is hard work, though axe found no contrast failures.
- Most valuable: the price is clear on the drop-in row, and packs exist in the system.
- Least valuable: everything child-oriented.

**Recommendations:**
1. Give adults a proper self-managed account (an adult student is their own guardian, with no approval step).
2. Fix D2.
3. Offer packs publicly.
4. Show "My bookings" with cancel.
5. Honour the browser font size.

Remove or simplify: the age filter for adults. Greatest impact: an adult account that works.

**Adoption verdict:** I would keep booking by text message. At present there is nothing to adopt after the first booking.

**Scores:** Relevance 5, Quality 5, Completeness 2, Ease 5, Efficiency 4, Usefulness 3, Adoption 3, Continued use 2. **Overall 3/10.**

### Persona 4 — "Priyanka", 34, adult beginner considering a first class
**User profile:**
- Accountant who has never danced and is nervous about being the only beginner. Researching on an iPhone at lunchtime.
- Needs: "Is this for complete beginners? What do I wear? Can I just watch? What if I hate it?"
- Frustrations: dance-school sites full of grade names.

**Application experience:**
- `/welcome` is not for me. It sells software to schools: "Book a demo" (`students-09`).
- `/join` looks clean and trustworthy (`students-10`). It has the school's photo and logo, and the privacy text is admirably plain.
- One adult class, "Adult Contemporary (drop-in)". No description, level, teacher, dress code or length. The words "all levels" exist in the database but aren't shown.
- I'd book, because £12 and "No commitment" is low-risk, but I'd want "beginners welcome" first.
- The confirmation promises an email. That would not arrive in this build, so I'd have no record except a screenshot.
- Exceeded expectations: no account needed, and my emergency contact is asked for, which feels safe.
- Failed expectations: no "what to expect at your first class", no map or address beyond the studio name, no contact number.

**Recommendations:**
1. Show class description, level and suitability.
2. Add "First class? What to wear and bring".
3. Show address and a map link.
4. Show the booking reference and an add-to-calendar on the confirmation.
5. Explain the cancellation policy up front.

Remove or simplify: nothing to remove; the page is already lean. Greatest impact: suitability info per class.

**Adoption verdict:** I'd try one class. Whether I return depends on the class, not the app.

**Scores:** Relevance 7, Quality 6, Completeness 4, Ease 8, Efficiency 8, Usefulness 5, Adoption 6, Continued use 4. **Overall 5/10.**

### Persona 5 — "Sofia", 17, aspiring professional (vocational ballet and contemporary auditions)
**User profile:**
- Classes six days a week, private lessons, RAD Advanced 1, auditions next spring. Laptop and phone. Tracks everything in a notes app and a spreadsheet.
- Needs: detailed corrections over time, a practice log that means something, exam and audition prep, and videos.
- Frustrations: corrections forgotten between lessons.

**Application experience (judged on Amir's hub as the closest available):**
- Feedback is two lines per note. It is good for recreational students but thin for me. There is no thread with the teacher, and I can't reply or ask "what do you mean by rolling through the foot?"
- Skills are four levels. "Developing → Secure" is too coarse for me.
- The timeline lists changes but offers no filtering by style or a chart over a term.
- The practice log stores minutes plus one line. My last 4 entries show; the teacher sees weekly totals.
- No exam entries or results in my hub (D3). No goal history with teacher comments shown back to me (review notes exist in the data, `review_note`).
- Term reports exist (print or save as PDF), but none was shared.
- Exceeded expectations: demo links can be attached to a skill (`set_skill_demo`), and reflections are private.
- Failed expectations: I can't upload my own video for feedback. The schema says "Students never upload video", which is a sensible safeguarding choice for minors, but a 17-year-old preparing auditions will miss it.

**Recommendations:**
1. A filterable progress history with "then vs now".
2. Show exam and audition entries and results.
3. Let a student reply to a feedback note.
4. Practice goals linked to skills, with weekly targets.
5. Optional finer-grained skill notes from the teacher.

Remove or simplify: none. Greatest impact: progress history over time with filters.

**Adoption verdict:** As a companion for corrections, yes. It won't replace my spreadsheet yet.

**Scores:** Relevance 8, Quality 6, Completeness 4, Ease 7, Efficiency 6, Usefulness 5, Adoption 6, Continued use 5. **Overall 5.5/10.**

### Persona 23 — "Ruth", 39, parent researching schools for a 10-year-old (low vision, uses large text and high contrast)
**User profile:**
- Moved to the area recently and is comparing three schools. Mostly on her phone, with the iOS text size set large.
- Needs: price, safeguarding, how trials work, and what happens after.
- Frustrations: schools that only answer by Facebook message.

**Application experience:**
- I found `/join` from the school's site. With age 10 there was exactly one option, "Jazz Intermediate, Ages 9–13, Free" (Scenario 1). I wanted to know whether "Intermediate" means my daughter needs experience. Nothing says.
- Booking took 9 taps and typed fields and worked first time (`students-12`). The privacy text told me exactly how long they keep my details, which was impressive.
- It didn't ask about allergies before the first class, which surprised me.
- There's no term price anywhere public. I only know the trial is free.
- My large text setting had no effect (D4). I had to pinch-zoom, which is fiddly on a booking form.
- After booking, I was told to expect an email. I'd like the details on screen: reference, address, what to bring.
- Becoming a regular: the office would invite me. From the code, that invite is likely to fail because my details are already on file from the trial (D2).
- Most valuable: the no-account trial and honest privacy text. Least valuable: `/welcome`, which is for schools, not me.

**Recommendations:**
1. Public price per class.
2. Class level and description.
3. Safeguarding and medical questions at trial (optional, short).
4. A useful confirmation screen.
5. Fix the invite-after-trial (D2), and honour text size.

Remove or simplify: none. Greatest impact: an "Is this right for my child?" panel per class (level, experience, price, what to wear).

**Adoption verdict:** I'd book the trial. Whether I choose this school depends on information the page doesn't give.

**Scores:** Relevance 8, Quality 6, Completeness 4, Ease 7, Efficiency 8, Usefulness 5, Adoption 6, Continued use 5. **Overall 5.5/10.**

---

## 6. Votes (machine-readable)

### Persona 1 (Maya, 10, via parent)
| Type | Item | Rating |
|---|---|---|
| Valuable | Teacher feedback notes | |
| Valuable | Milestones | |
| Valuable | Parent visibility of feedback | |
| Valuable | Practice log | |
| Valuable | Under-13 login protection | |
| Frustration | Unassessed skill grids | |
| Frustration | No child-facing view | |
| Frustration | Skill jargon | |
| Frustration | Library only via parent | |
| Frustration | Grading tone for juniors | |
| Missing | Supervised child mode | Highly desirable |
| Missing | Hide unassessed skills | Highly desirable |
| Missing | Tracking opt-out | Useful |
| Missing | Child-friendly language | Useful |
| Missing | Badges/stickers | Nice to have |
| Remove/simplify | Unassessed skill grid | |
| Greatest impact | Supervised child mode | |

### Persona 2 (Amir, 15, competitive)
| Type | Item | Rating |
|---|---|---|
| Valuable | Next class at a glance | |
| Valuable | Teacher feedback notes | |
| Valuable | Private self-reflection | |
| Valuable | Skills by style | |
| Valuable | Class resources | |
| Frustration | Exam entries hidden from student | |
| Frustration | Rehearsals not in timetable | |
| Frustration | No student absence reporting | |
| Frustration | No notifications | |
| Frustration | Practice log save feedback | |
| Missing | Unified diary (classes+events+exams) | Essential |
| Missing | Student exam view | Essential |
| Missing | Planned absence reporting | Highly desirable |
| Missing | Notification preferences | Highly desirable |
| Missing | Feedback linked to resources | Useful |
| Remove/simplify | Ungrouped timeline | |
| Greatest impact | Unified diary (classes+events+exams) | |

### Persona 3 (Gareth, 52, adult)
| Type | Item | Rating |
|---|---|---|
| Valuable | Adult drop-in booking | |
| Valuable | Clear drop-in price | |
| Valuable | Class packs | |
| Valuable | Drop-in cancellation rule | |
| Valuable | Privacy notice | |
| Frustration | No adult login | |
| Frustration | Invite acceptance error | |
| Frustration | Child-oriented wording | |
| Frustration | Text size ignored | |
| Frustration | No cancel without login | |
| Missing | Adult self-managed account | Essential |
| Missing | Fix invite for existing guardian | Essential |
| Missing | Text scaling | Highly desirable |
| Missing | Public class packs | Useful |
| Missing | My bookings list | Highly desirable |
| Remove/simplify | Child age filter for adults | |
| Greatest impact | Adult self-managed account | |

### Persona 4 (Priyanka, adult beginner)
| Type | Item | Rating |
|---|---|---|
| Valuable | No-account booking | |
| Valuable | Adult drop-in booking | |
| Valuable | Privacy notice | |
| Valuable | Places left | |
| Valuable | School branding | |
| Frustration | No class description | |
| Frustration | Welcome page not for customers | |
| Frustration | No what-to-expect | |
| Frustration | Thin confirmation | |
| Frustration | Child-oriented age label | |
| Missing | Class suitability info | Essential |
| Missing | First-class guide | Highly desirable |
| Missing | Booking confirmation details | Highly desirable |
| Missing | Cancellation policy upfront | Useful |
| Missing | Address/map | Useful |
| Remove/simplify | Child age filter for adults | |
| Greatest impact | Class suitability info | |

### Persona 5 (Sofia, 17, pre-professional)
| Type | Item | Rating |
|---|---|---|
| Valuable | Teacher feedback notes | |
| Valuable | Skills by style | |
| Valuable | Goals | |
| Valuable | Practice log | |
| Valuable | Term reports | |
| Frustration | Coarse skill levels | |
| Frustration | No reply to feedback | |
| Frustration | Exam entries hidden from student | |
| Frustration | Timeline unfiltered | |
| Frustration | Short practice history | |
| Missing | Progress history over time | Essential |
| Missing | Student exam view | Highly desirable |
| Missing | Feedback replies | Useful |
| Missing | Practice targets | Useful |
| Missing | Student video submission | Nice to have |
| Remove/simplify | Ungrouped timeline | |
| Greatest impact | Progress history over time | |

### Persona 23 (Ruth, prospective parent)
| Type | Item | Rating |
|---|---|---|
| Valuable | No-account trial booking | |
| Valuable | Privacy notice | |
| Valuable | Age filter | |
| Valuable | Places left | |
| Valuable | Trial pipeline for office | |
| Frustration | No public prices | |
| Frustration | No class description | |
| Frustration | Text size ignored | |
| Frustration | Thin confirmation | |
| Frustration | Invite acceptance error | |
| Missing | Class suitability info | Essential |
| Missing | Public class prices | Essential |
| Missing | Fix invite for existing guardian | Essential |
| Missing | Medical/consent at trial | Useful |
| Missing | Text scaling | Highly desirable |
| Remove/simplify | Welcome page for families | |
| Greatest impact | Class suitability info | |

---

## 7. Group consolidated view

- **Principal needs:**
  - Students: know where to be; know what to fix and practise; see progress; know about exams, rehearsals and competitions.
  - Prospects: judge whether a class suits them and what it costs, then book with confidence.
  - Adults: an account of their own.
- **Most valuable now:**
  - The `/learn` home (next class).
  - Feedback notes with "To work on".
  - Skills by style with reassuring "Not yet" copy.
  - Private reflections.
  - The no-account trial booking with exemplary privacy wording.
  - Database-level child safety (age 13+ and guardian approval).
- **Frustrations:**
  - Student hub: exams invisible; rehearsals and events separate from the timetable; no absence or cancel; no notifications.
  - Public page: no suitability info or prices.
  - Adults: no account at all.
  - Accessibility: browser text size ignored.
- **Common themes:**
  1. The student hub is a good read-only window but a weak place to act.
  2. The public page is fast but thin on information.
  3. Adults are an afterthought: the data model treats them as a family with a "Self" guardian.
  4. Progress is a snapshot, not a history.
- **Missing functionality:** unified diary; student exam view; adult accounts; class suitability info; public prices; student absence; progress over time; guardian UI to approve a teen login; notifications for students.
- **Adoption barriers:** D2 (no route from booking to login); D1 (wrong person billed); no adult accounts; information gaps for prospects.
- **Highest-priority improvements:** fix D1 and D2 (P0/P1); adult self-managed accounts; class suitability and price on `/join`; unified student diary with exams; text scaling.
- **Disagreements within the group (kept):**
  - Persona 1 (and many recreational dancers) want less tracking: hide grids and let parents opt out of skill levels. Persona 5 wants more granular tracking.
  - Persona 2 wants to answer event invitations himself. The parent persona (from the guardian group) would want to keep that decision.
  - Persona 5 wants to upload video. The school's safeguarding design ("Students never upload video") argues against it for minors.
- **Group satisfaction:** 5/10. **Adoption likelihood:** 5/10. **Continued use:** 4.5/10.
- **Where our improvements could hurt other groups:**
  - Student self-reporting of absence could bypass parents. Notify the guardian and keep it 13+ only.
  - Public prices may conflict with owners who prefer to discuss fees.
  - More granular skills add teacher workload. Make them optional per school.
  - Adult accounts touch the guardian and family model and billing (office and finance group).

---

## 8. Candidate recommendations

### R1 — Public adult booking must not attach to an existing child (fixes D1)
- **Screen/workflow:** `/join` → Adults: drop in. `app.public_adult_drop_in` (0040).
- **Problem and evidence:** an existing guardian email books the family's first student (Amir, 15) into an 18+ class and invoices it. `students-15`.
- **Proposal:**
  - When the email matches a guardian, do not book. Return a neutral message: "We'll email you a link to confirm this booking." This avoids revealing that the email exists.
  - Alternatively, book only a student whose name matches and who meets `age_min`/`age_max`.
  - Always enforce class age limits in `book_drop_in_unchecked`.
- **Groups:** prospects, families, office. **Personas:** 3, 4, 23.
- **Priority:** **P0**. It bills the wrong person, puts a minor in an adult class, and causes privacy confusion.
- **Complexity:** S (one SQL function plus a test). Tables: guardian, student, drop_in_booking, invoice.
- **Dependencies:** for the "email a link" variant, R-003 (email).
- **Risks:** blocking legitimate repeat adults until email exists. Interim option: create a separate adult student in the same family when the name differs.
- **User story:** As a parent who also dances, I want to book an adult class for myself without my child being booked or billed, so that my family's records stay correct.
- **Workflow:** enter details → system matches the email → books the matching adult student, or creates one → confirmation names the dancer.
- **Business rules:** never book a student outside the class's age range; the booking names the dancer; matching never reveals other family members.
- **Edge cases:** shared family email; adult with the same first name as a child; existing adult student already booked for that session.
- **Acceptance criteria:**
  - Booking with `hannah.wright@example.com` creates no booking or invoice for Amir.
  - A student under `age_min` cannot be booked via any drop-in path.
  - The confirmation shows the dancer's name.

### R2 — Invitation acceptance links an existing guardian row (fixes D2)
- **Screen/workflow:** `/account` invite → `/invite`. `app.accept_invitation` (0019) and `guardian_self_edit_guard` (0023).
- **Problem and evidence:** "only the office can change who is linked to a family" on acceptance. `students-16`.
- **Proposal:** in the guard, allow the `user_id` change when it happens inside `accept_invitation`. For example, set a transaction-local flag `app.accepting_invite`, or let the guard accept null → `auth.uid()` when a valid unaccepted invitation for that email and family exists. Add a test for the existing-guardian path.
- **Groups:** prospects, parents, adults, office. **Personas:** 3, 23.
- **Priority:** **P0**. It blocks converting trial and drop-in customers into account holders.
- **Complexity:** XS–S. Files: 0019 and 0023 equivalents (new migration), `tests/platform.test.ts`.
- **Dependencies:** none. **Risks:** loosening the guard. Scope it narrowly to null → self, with a matching invitation.
- **User story:** As a parent who booked a trial, I want the school's invitation to work, so that I can see my child's schedule and invoices.
- **Workflow:** office invites → parent opens link → names self → lands in `/family`.
- **Business rules:** only an unlinked guardian row whose email equals the invitation email can be linked, and only to the accepting user.
- **Edge cases:** two guardians share an email; the row is already linked to another user (must still refuse); expired invitation.
- **Acceptance criteria:**
  - Inviting `sam.adler@example.com` to "Adler (adult)" and accepting lands on `/family` with the drop-in visible.
  - The re-link attack is still refused (existing test).

### R3 — Adult students get a self-managed account
- **Screen/workflow:** `/join`, `/invite`, `/learn` versus `/family`.
- **Problem and evidence:** adults are modelled as a family with a "Self" guardian and no login. The parent hub speaks about "your child". No route to log in (D2).
- **Proposal:**
  - Mark a student as `is_adult` (18+) and let the account holder be guardian and student at once.
  - Show a merged "Me" hub: `/learn` plus bookings, packs, invoices and drop-in cancel, with no "Report an absence for X" wording.
  - Skip the guardian-approval step when the student is 18+ and the user is their own guardian. Keep the trigger for minors.
  - Offer "Create an account to manage your bookings" on the drop-in confirmation.
- **Groups:** adults, office. **Personas:** 3, 4.
- **Priority:** **P1**. Adult classes are a revenue line (packs exist) and no adult can self-serve.
- **Complexity:** L (roles in `session.tsx`, shell navigation, `check_student_login`, RLS for adult self, billing views). Uncertain.
- **Dependencies:** R2, R-001 sign-in. **Risks:** role confusion; GDPR differences for adults.
- **User story:** As an adult dancer, I want my own account showing my classes, bookings and payments, so that I can manage them without contacting the office.
- **Workflow:** book a drop-in → "Create an account" → email link → "Me" hub.
- **Business rules:** 18+ by date of birth; the adult is their own billing contact; no guardian approval needed.
- **Edge cases:** a parent who also dances (two roles, one login); a 17-year-old who turns 18 mid-term.
- **Acceptance criteria:**
  - An adult who booked publicly can sign in and see the booking, cancel it more than 24 h ahead, and see the invoice.
  - No child-oriented copy appears in the adult hub.

### R4 — Class suitability and price on the public page
- **Screen:** `/join`. `app.public_trial_sessions`, `public_drop_in_sessions`, `join/page.tsx`.
- **Problem and evidence:** no level, description, teacher, length, dress code or regular price. The age label says "child". Scenario 1 and P1.
- **Proposal:**
  - Return `description`, level name, style, duration, teacher display name, regular price and pricing basis.
  - Show an expandable "About this class" with "Beginners welcome" when the level is entry level.
  - Show "After the trial: £54 a term".
  - Rename the filter to "Age of dancer" and change the empty-state copy at adult ages to point to the adult section.
- **Groups:** prospects, office (fewer enquiry calls). **Personas:** 4, 23, 3.
- **Priority:** **P1**. It is the main conversion lever.
- **Complexity:** S–M (two SQL functions, the page, and a school setting to hide prices).
- **Dependencies:** none. **Risks:** owners who prefer not to publish prices. Add a setting.
- **User story:** As a parent comparing schools, I want to see what a class is, who it's for and what it costs after the trial, so that I can book with confidence.
- **Workflow:** filter by age → tap "About this class" → book.
- **Business rules:** show price only if the school allows it; show "all levels" or "beginners" from the level data.
- **Edge cases:** a class without a description; drop-in versus term pricing.
- **Acceptance criteria:**
  - Each slot can show a description, level, length and regular price.
  - At age 35 the copy directs the visitor to the adult section.

### R5 — Useful booking confirmation and first-class guide
- **Screen:** `/join` success notices.
- **Problem:** the confirmation relies on an email that is not connected. No reference, address or "what to bring".
- **Proposal:** show a reference, full address with a map link, a "what to wear and bring" text set by the school, an add-to-calendar (.ics), cancellation terms and a phone number. Optionally ask for allergies and photo consent at trial.
- **Groups and personas:** prospects; 4, 23.
- **Priority:** P2. **Complexity:** S (school settings field, .ics already exists for families: R-036).
- **Acceptance criteria:** the confirmation shows the reference, address, guide text and calendar download.

### R6 — Unified student diary with exams and rehearsals (fixes D3)
- **Screen:** `/learn`, `/learn/timetable`. `MY_TIMETABLE` (`hub.ts:129`), `exam_entry`, event rehearsals.
- **Problem and evidence:** exam entries are hidden from the student (D3). Rehearsals appear only inside event cards. Only confirmed events appear.
- **Proposal:**
  - Union exam entries ("RAD Grade 5 exam") and confirmed-event rehearsals into `MY_TIMETABLE`.
  - Add a "Coming up" strip on `/learn` with entry deadlines for requested or invited events.
  - Add `StudentExams` to `/learn/feedback`.
  - Offer an .ics export for students.
- **Groups and personas:** students; 2, 5.
- **Priority:** **P1**. This is the core need of competitive dancers.
- **Complexity:** S–M (SQL union, existing component reuse; RLS already allows it).
- **User story:** As a competitive student, I want one diary of classes, rehearsals, exams and competitions, so that I never miss a commitment.
- **Workflow:** open Timetable → see every commitment for 4 weeks.
- **Business rules:** show only confirmed participation and entered exams; requested items are shown separately as "pending".
- **Edge cases:** multi-day competitions; cancelled rehearsals; withdrawn exam entries.
- **Acceptance criteria:**
  - After an admin enters Amir for an exam, it appears in `/learn/timetable` on the exam date and in `/learn/feedback` under Exams.
  - Confirmed show rehearsals appear in the timetable.

### R7 — Student "can't make it" (13+), notifying guardian and studio
- **Screen:** `/learn/timetable` row action. Reuse `F.REPORT_ABSENCE`.
- **Problem:** students have no way to report an absence (Scenario 6).
- **Proposal:** add a row action "I can't make this", restricted to logins 13+. It creates the same absence request, notifies the guardian, and marks the session "Away" for the student and the parent.
- **Groups and personas:** students, parents; 2, 5.
- **Priority:** P2. **Complexity:** S–M (request kind exists; add a guardian notification and an away marker).
- **Risks:** bypassing parents. Mitigate by always notifying the guardian, with a school setting.
- **Acceptance criteria:** the report appears in the office requests and the parent's notifications, and the session shows "Away".

### R8 — Respect user text size (fixes D4)
- **Screen:** global; Tailwind arbitrary px sizes across `src/app/**`.
- **Proposal:** convert `text-[Npx]` to rem (or set the base so `1rem` follows the user setting), and test at 200% with no horizontal scroll.
- **Groups:** all. **Personas:** 3, 23.
- **Priority:** P2 (accessibility, WCAG 1.4.4). **Complexity:** M (many files; mechanical).
- **Acceptance criteria:** at root font-size 200%, body text at least 1.8× larger and no horizontal overflow at 390 px.

### R9 — Progress history over time
- **Screen:** `/learn/feedback` timeline. `app.student_timeline`.
- **Proposal:**
  - Group skill changes by date and style.
  - Add range filters (term, 3 months, all) and a style filter.
  - Add a "then vs now" summary per style (count at each level, start versus end of range).
  - Include attendance and exam results.
- **Personas:** 5, 2. **Priority:** P2. **Complexity:** M.
- **Acceptance criteria:** with 3 months of data, the student can filter to Contemporary and see level changes with dates in one grouped list.

### R10 — Tracking that fits recreational dancers
- **Screen:** `/family/feedback`, `/learn/feedback`.
- **Proposal:**
  - Hide styles with 0 assessed.
  - Show the "Not yet" reassurance always.
  - Add a family or student setting "Show skills: on/off" (notes and milestones stay).
  - Use friendlier labels for juniors (configurable).
- **Personas:** 1, 23. **Priority:** P3. **Complexity:** S.
- **Acceptance criteria:** Nia's tab shows no "0 of 9 assessed" blocks.

### R11 — Guardian approval UI for teen logins
- **Screen:** `/family/children`. Columns `login_enabled` and `login_approved_by` (0010). An office-created student invite currently says "A parent must approve", but there is no UI for it.
- **Proposal:**
  - Show a "Login for Amir — waiting for your approval: Approve / Decline" card to guardians.
  - Add "Invite <child> to their own login" for children 13+.
  - Add a revoke option.
- **Personas:** 1 (later), 2. **Priority:** P1. Without it, office-sent student invites can never activate.
- **Complexity:** S–M (a security-definer function `approve_student_login`, UI card, audit).
- **User story:** As a parent, I want to approve or refuse my teenager's own login, so that I stay in control of their access.
- **Business rules:** age at least the studio threshold; only a guardian of that family; audit logged; revocable.
- **Edge cases:** two guardians disagree; the child is below the threshold (button hidden, with an explanation).
- **Acceptance criteria:** after the office invites Nia's 13-year-old sibling and the child accepts, the guardian sees Approve; after approving, the child can open `/learn`.

### R12 — Practice log feedback (D5)
- **Proposal:** optimistic total update, a "Saved" toast, and the button busy state while pending.
- **Priority:** P3. **Complexity:** XS (`practice.tsx`).

---

## 9. Feature rationalisation

| Feature | Decision | Reason |
|---|---|---|
| `/learn` home with big next-class time | Retain | The clearest screen in the student hub |
| Feedback notes ("going well" and "to work on") | Refine | Link "to work on" to resources and skills; allow replies for 16+ (optional) |
| Skills panel | Refine | Hide unassessed styles; optional for recreational dancers |
| Timeline | Redesign | Grouping, filters, then-vs-now |
| Reflections (private, 13+) | Retain | Good safeguarding-aware design; verified hidden from parents |
| Goals | Retain | Show teacher review notes to the student |
| Practice log | Refine | Save feedback; link to goals |
| Events (student) | Consolidate | Into a unified diary with exams and rehearsals |
| Library | Retain | Works; placeholder links are seed data only |
| Public trial booking | Retain and Refine | Add suitability info, prices and a useful confirmation |
| Public adult drop-in | Refine (fix D1) | Correct dancer matching; offer packs |
| Adult model as "family (adult)" with a "Self" guardian | Redesign | Needs a first-class adult account (R3) |
| Guardian approval of student logins | Add (UI) | Exists in the database only |
| `/welcome` | Retain for schools; Add a family-facing school page | It is a B2B page; families need a school profile |
| Student-side absence | Add | Missing; 13+ with guardian notified |
| Student video upload | Defer | Safeguarding trade-off for minors |
