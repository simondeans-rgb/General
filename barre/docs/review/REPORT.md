# Swayvo: independent end-user panel review

**Product assessment and improvement plan** · 27 November 2026 · Reviewed build: preview `/General/studio-next/` (branch `studio` at merge 776ce1f)

> **Read this first.** The 24 panel members in this report are **simulated end users**. Their opinions are
> structured professional judgement, not feedback from real customers or research participants. The defects,
> however, are **observed**: each was reproduced in the running application, or confirmed in the source code,
> and is labelled as such. Votes and scores are simulated panel findings, **not market research**. No
> application code was changed during this review.

Supporting material, all in `barre/docs/review/`:

| File | Contents |
|---|---|
| `panel-students.md` | Personas 1–5 and 23, scenarios 1–7 and P1 |
| `panel-parents.md` | Personas 6–10, scenarios 8–15 |
| `panel-teachers.md` | Personas 11–15, scenarios 16–22 |
| `panel-admins.md` | Personas 16–18, scenarios 23–30 |
| `panel-owners.md` | Personas 19–22, scenarios 31–38 |
| `panel-safeguarding.md` | Persona 24, scenarios S1–S9, cross-cutting accessibility |
| `shots/` | 93 screenshots, named `<group>-NN-<finding>.jpg` |

Each panel file contains, for its group:
- the full scenario walk-throughs, step by step, with interaction counts;
- a feature status table and a defect list with reproduction steps;
- the **complete first-person assessment** of each panel member;
- vote tables, candidate recommendations and feature rationalisation.

This report consolidates them. Where it summarises, the panel file is the evidence.

---

## Contents
1. Executive summary
2. Application overview
3. Review methodology and limitations
4. End-user panel profiles
5. Overall product assessment
6. Consolidated product scorecard
7. Independent assessments from all 24 panel members
8. Consolidated student assessment
9. Consolidated parent and guardian assessment
10. Consolidated teacher assessment
11. Consolidated administrator assessment
12. Consolidated school owner assessment
13. Prospective customer assessment
14. Safeguarding and welfare assessment
15. Detailed feature and functionality assessment
16. Real-world scenario testing results
17. Feature demand and voting matrix
18. Missing functionality and unmet user needs
19. Feature rationalisation assessment
20. Adoption and retention assessment
21. Competitor switching and migration assessment
22. Panel consensus and disagreements
23. Prioritised product improvement register
24. Detailed functional specifications for priority improvements
25. Product improvement roadmap
26. Real-user validation plan
27. Final panel verdict

---

## 1. Executive summary

**What Swayvo is.** A single web app for a dance school: timetable, registers, enrolment, billing, messages, events and exams, safeguarding, and a student progress area that families can see. It serves owners, office staff, teachers, parents and students (13+), each with their own screens.

**Headline result.**
- **Weighted score: 53.8 / 100.** That puts Swayvo in the band *"product requiring substantial improvement before widespread adoption."*
- **Panel average: 5.4 / 10.** The 24 persona overall scores range from 3 to 7.

**What the panel valued.** The panel liked the *shape* of the product a great deal. Relevance scores averaged 8 / 10. Strengths it praised:
- **The register:** 9 taps for 12 children, with medical notes and emergency contacts beside the name.
- **Cancellations:** one action tells every affected family and updates their screens.
- **Teacher feedback and skills:** made visible to students and families.
- **Office tools:** the owner's "needs attention" list and the term billing run.
- **Family view:** the weekly family view.
- **Access control:** boundaries enforced by the database itself. Every attempt to see another family's or another teacher's data failed, as it should.

**Why the score is low.** The scores are dragged down by **observed defects in everyday tasks**, not by missing polish. Eight of them stop a core job outright or put data integrity or safety at risk:

| # | Observed defect (all reproduced or code-confirmed) | Who is blocked |
|---|---|---|
| 1 | **Creating a class always fails** ("column pricing specified more than once") | Every new school; any new class |
| 2 | **Editing any student crashes the screen** | Office: cannot correct a child's name or date of birth |
| 3 | **An invited parent already on the family record cannot accept the invitation** | Second parents, trial parents, adult drop-ins: no login possible |
| 4 | **Offline register: "Mark the rest" overwrote an absence** (all 12 shown present after reconnecting) | Teachers in studios with poor signal; fire-register accuracy |
| 5 | **A parent's absence report never reaches the teacher or register**, though the app promises it will | Parents, teachers |
| 6 | **Any guardian can change the other guardian's email and phone** | Separated families; safeguarding |
| 7 | **An adult drop-in booked with a parent's email books and bills their 15-year-old into an 18+ class** | Public booking integrity |
| 8 | **Billing integrity:** a billing run re-bills an already-invoiced term (27 drafts, £6,376); a partial refund reopens a paid invoice as overdue debt; ending a family discount silently does nothing | Finance, families |

**Missing everyday controls.** Beyond the defects, three everyday controls are missing:
- consent (e.g. photography) cannot be recorded or withdrawn anywhere in the app;
- office staff and the safeguarding lead cannot raise a concern;
- parents cannot approve or switch off their teenager's login, although the app says they must.

**Not yet connected.** Real sign-in, card or Direct Debit payments, and email/SMS/push delivery are not connected (decisions R-001, R-002, R-003, R-006). Without them no school can run on it.

**Verdict in one line.** Swayvo is **close to being ready for supervised real-user testing**: after the Phase 1 fixes (a short list, most extra-small to medium in size), it would be ready. It is **not ready for commercial launch**.

The foundations are better than its score suggests:
- the data model, permissions, ledger and safeguarding logging are solid;
- the student progress idea is a credible signature feature.

The work needed is mostly fixing and connecting, not rethinking. The panel recommends:
1. **Phase 1:** fix the defects above and add consent and concern entry.
2. Connect sign-in, email and payments.
3. **Then** run real sessions with 2–3 schools.
4. Only after that, invest in Phases 3–4: progress history, retention insight and multi-location.

---

## 2. Application overview

| Area | Who uses it | Main screens |
|---|---|---|
| Sign-in and public pages | Everyone | `/` (demo person picker), `/welcome` (marketing), `/join?school=…` (public trial and adult drop-in booking), `/invite` |
| Office | Owner, admin | `/today`, `/schedule` (week grid), `/classes`, `/events`, `/people`, `/enrolment` (pipeline and waiting lists), `/inbox`, `/requests`, `/billing`, `/reports`, `/studio` (settings), `/safeguarding`, `/account`, `/onboarding` |
| Teaching | Teachers | `/teach` (today), `/teach/register`, `/teach/students`, `/teach/feedback`, `/teach/messages`, `/teach/material`, `/teach/reports` |
| Family | Guardians | `/family` (home and notices), `/family/schedule`, `/family/children`, `/family/payments`, `/family/messages`, `/family/events`, `/family/feedback`, `/family/enquiries` |
| Student (13+) | Students | `/learn`, `/learn/timetable`, `/learn/feedback`, `/learn/library`, `/learn/events` |
| Platform | Swayvo staff | `/platform`, `/platform/plans`, `/platform/pilot` |

**Architecture as it affects users.**
- **Demo build:**
  - Postgres runs inside the browser, with synthetic data for "Northstar Dance Academy". Each browser has its own copy, so nothing is shared between devices.
  - Rules about who can see what are enforced by the database (row-level security), not just hidden in screens. There are 378 automated tests of these rules and of billing.
- **Hosted design:** described in `docs/ARCHITECTURE.md` (server Postgres, a sync queue for offline marks). It is not built or deployed yet.

**Not connected:**
- real sign-in (R-001);
- hosting (R-002);
- email, SMS and push delivery (R-003; notices exist only in-app);
- card payments and Direct Debit (R-006).

---

## 3. Review methodology and limitations

**How the review was run.**
1. Six independent reviewer agents each took one user group. They:
   - drove the running app in Chromium with Playwright, as the relevant demo people;
   - tested the 38 commissioned scenarios plus safeguarding scenarios S1–S9 and a prospective-customer journey;
   - used phone (390×844), tablet (820×1180) and desktop (1440×900) viewports;
   - inspected source code and database migrations to explain behaviour and to confirm defects;
   - wrote each panel member's assessment **independently, before** this consolidation.
2. The coordinator independently re-checked the most serious defects in the source:
   - class creation (`src/lib/repos/classes.ts:119`);
   - student edit (`people-sheets.tsx:143`);
   - invite linking (`0019_platform.sql:643` and `0023_operations.sql:333`);
   - guardian edit policy;
   - absence reports (`src/lib/repos/family.ts:94`);
   - refund arithmetic (`0016`, "paid net of refunds");
   - discount end (`billing.ts:151` with the `0039:37` policy).

   All were confirmed.
3. Interaction counts are those actually performed. Times are only those measured by scripts. No times were estimated.

**Status labels used throughout.**

| Label | Meaning |
|---|---|
| Fully implemented & tested | Driven in the browser and it worked as a user would need |
| Implemented, not testable here | Exists, but depends on something not connected (e.g. email delivery) |
| Partial | Some of the job can be done |
| Defective | Exists but fails or gives a wrong result |
| Missing | No way to do it |
| Low value | Works but delivers little to the user |

**Limitations.**
- All personas are simulated, and so are their satisfaction scores and votes. No real users, devices or assistive technologies (VoiceOver, TalkBack, NVDA) were used.
- **Not testable:**
  - card payments and Direct Debit;
  - email, SMS and push delivery;
  - real sign-in and password recovery;
  - the hosted (server) version, including its offline sync;
  - the live calendar feed.
- Offline findings were observed in the demo, where the database is in the browser. The hosted version's behaviour is **unverified**.
- Data was synthetic. Some oddities come from the seed rather than the product (e.g. two dates for the same show; possible duplicate family records). These are marked.
- Competitor products (ClassForKids, Class Manager, DanceBiz, Jackrabbit Dance, DanceStudio-Pro) were **not** examined. Any comparison is labelled as an assumption.
- Postgres for the test suite was down during the safeguarding review, so those tests were read, not run. The suite passed 378/378 the day before.

---

## 4. End-user panel profiles

| # | Panel member (simulated) | Role | Key traits | Report |
|---|---|---|---|---|
| 1 | Maya, 10 (with her dad) | Young recreational student, ballet and street | Under 13, so no login; sees progress through a parent | students |
| 2 | Amir, 15 | Teen competitive, street, tap and contemporary | Own login, busy diary, competitions | students |
| 3 | Gareth, 52 | Adult recreational, tap and contemporary | No guardian; wants simple bookings and packs | students |
| 4 | Priyanka, 34 | Adult beginner | Nervous, unfamiliar with terms | students |
| 5 | Sofia, 17 | Aspiring professional, vocational ballet and contemporary | Detailed goals, audition prep | students |
| 6 | Kemi | Parent of a 5-year-old (pre-school ballet, junior tap) | Wants reassurance and simplicity | parents |
| 7 | Hannah Wright | Parent of three across six classes | Busy; wants one family view | parents |
| 8 | Gareth | Father of a competitive 14-year-old | Privates, exams, competitions, costs | parents |
| 9 | Pauline, 58 | Adoptive parent with limited tech confidence | Large text, predictable steps | parents |
| 10 | Daniel | Separated father sharing care | Privacy between guardians | parents |
| 11 | Siân Morgan | Full-time teacher | Many classes; minimal admin | teachers |
| 12 | Priya Raman | Freelance contemporary teacher at two schools | Cross-school schedule, cover | teachers |
| 13 | Tomás Herrera | Competitive and exam coach | Detailed progress tracking | teachers |
| 14 | Gwen Pritchard | Teacher of 3–8 year olds | Simple registers, safety, parents | teachers |
| 15 | Maureen Hales | Tap teacher with limited tech confidence | No training time | teachers |
| 16 | Nadia Okafor | School administrator | Enquiries, enrolment, records | admins |
| 17 | Ruth Achterberg | Finance administrator | Accuracy, reconciliation | admins |
| 18 | Dev Bhattacharya | Reception / customer service | Quick look-ups on the desk phone | admins |
| 19 | Small-school owner | Teaches, does finance and admin | Affordability, time saved | owners |
| 20 | Growing-school owner | More staff and students | Insight without admin | owners |
| 21 | Multi-location owner | Several studios, a team | Oversight, permissions, scale | owners |
| 22 | Switching owner | Established on another platform | Migration risk | owners |
| 23 | Ruth, 39 | Prospective parent researching schools | Low vision; uses large text and high contrast | students |
| 24 | Safeguarding and welfare lead (DSL) | Welfare lead | Consent, boundaries, records | safeguarding |

**Diversity.** The panel covers:
- ages 5 to 58 (through parents for the youngest);
- every requested discipline: ballet, tap, contemporary, street/hip-hop, jazz, commercial, musical theatre, ballroom;
- recreational, exam and competitive participation;
- shared-care and multi-child families, and an adoptive parent;
- low vision (23) and low tech confidence (9, 15);
- phone-first (most families and teachers) and desktop-first (office) users;
- school sizes from one owner-teacher to multi-site.

---

## 5. Overall product assessment

**What works well (observed).**
- **The register** (`/teach/register`):
  - two large Here/Absent targets per child;
  - "Mark the rest here" for the remainder;
  - medical, allergy and emergency information beside the name;
  - late and excused one tap in;
  - 9 taps for a class of 12 (teachers scenario 16).
- **Cancelling a session** (`/schedule` → session sheet):
  - one form;
  - every enrolled family sees a CANCELLED notice on their home screen and in the bell (admins scenario 26, verified in the same database).
- **The owner's Today** (`/today`): the next class, then a short list of things needing a decision.
- **The family home** (`/family`): notices first, then each child's week. Hannah (three children) rated it 7/10.
- **Progress for students and families:**
  - teacher notes with "to work on";
  - skills shown as a count of eight;
  - goals, reflections, term-report drafting, milestones and a practice log.
- **Office capability:**
  - term billing runs, family discounts, aged-debt and accounting exports;
  - waiting lists;
  - a family CSV import with good validation;
  - full JSON export;
  - an events area with rehearsal registers and event fees.
- **Boundaries:**
  - teacher, parent, student and platform-admin boundaries all held under URL tampering and a spoofed role (safeguarding S4–S8);
  - support access is time-limited and logged;
  - safeguarding views are logged.

**What does not.** These defects sit in the jobs schools do most:
- creating classes;
- correcting records;
- inviting parents;
- taking registers on a poor connection;
- reporting an absence;
- refunds and billing runs.

On top of that:
- several safeguarding controls exist in the database but have **no screen**: consent records, office-raised concerns, student-login approval;
- the app **says things that are not true** in four places:
  - "The teacher will see it before class";
  - "Teachers see allergies and the emergency plan only";
  - "Pay £97.00" on a button that cannot pay;
  - "This school was created with sample data" shown to a new, empty school.

**The pattern.** The panel noticed that **the database is often ahead of the screens**:
- credit on account, enquiry-to-trial linking, consent records and the audit log are supported underneath but not exposed;
- student exam entries are readable by the student under the database rules, but not shown.

That makes much of Phase 1 and 2 smaller than it looks.

---

## 6. Consolidated product scorecard

Scores are the coordinator's synthesis of the six group reports. They are not an average of personas.

| Area | Weight | Score /10 | Weighted | Justification and evidence |
|---|---|---|---|---|
| Core functionality and completeness | 20% | 5.5 | 11.0 | Very broad scope across every role, but class creation, student editing and invitation linking are broken (owners D1, admins D1, parents D1). Sign-in, payments and message delivery are not connected. |
| Ease of use and task efficiency | 15% | 6.5 | 9.75 | Register: 9 taps for 12. Family home and Today are clear. But feedback for 12 children takes 41 interactions; enquiries are re-typed as trials; text ignores the user's font size (students D4); errors appear off-screen (owners D2). |
| Class scheduling and booking | 10% | 5.0 | 5.0 | The week grid with clash detection and cancellation notices work. Class creation is broken; no make-up classes; the waiting list can double-offer; the public page has no class description or ongoing price; students cannot cancel. |
| Payments and financial management | 10% | 4.0 | 4.0 | The ledger model, billing runs, discounts and exports are strong underneath. Not connected: card and Direct Debit. Defective: refunds reopen debt, billing runs can double-bill, ending a discount fails, bank details are missing for parents, no credit UI. |
| Student feedback and development | 15% | 6.0 | 9.0 | The signature area: notes, skills, goals, reflections, term reports, practice. But editing feedback erases saved content (teachers D4), there is no real history over time, levels publish on one tap, students cannot see their exams, and unassessed skill grids discourage young children. |
| Communication and engagement | 10% | 5.0 | 5.0 | In-app notices, cancellations and office-visible teacher threads are good. No email, SMS or push. Absence reports go nowhere; no invoice notifications; students have no bell; a co-parent's private messages are shared. |
| School administration and business value | 10% | 5.0 | 5.0 | Today's queue, reports, exports and import are good. Student edit crashes; enquiries are unlinked; no retention trend; reports are single-location; no audit-log screen; migration covers families only. |
| Safeguarding, accessibility and trust | 5% | 5.0 | 2.5 | Database-enforced boundaries and logged safeguarding views are a real strength. But consent cannot change; the office cannot raise concerns; a guardian can edit another guardian's details; teen-login approval is a dead end; retention can anonymise a child with an open concern; the medical-visibility text is wrong; sheets do not trap focus; text does not scale. |
| Adoption and continued-use potential | 5% | 5.0 | 2.5 | Panel adoption averaged about 5.2/10 and continued use about 5.6/10. Several personas would adopt quickly *once* the defects are fixed (Hannah 8, Amir 8 on adoption); switching and multi-site owners would not (2–3). |
| **Total** | 100% | | **53.75 → 53.8 / 100** | **Band 50–59: needs substantial improvement before widespread adoption** |

**Serious-concern override.** Under the commission's rules, the safeguarding and payment-integrity issues above also mean that the product **must not be used with real children's data or real money** until Phase 1 is complete. That holds whatever the score.

**Why this differs from the 84.6 brand and design score** (`docs/brand/FINAL-ASSESSMENT.md`). That assessment measured visual design, brand and design-system quality, and those findings stand. This review tests whether users can *complete their jobs*. Driving 46 real tasks end to end found defects that screen-by-screen design review did not.

**Panel scores by persona (simulated):**

| # | Persona | Relevance | Quality | Complete | Ease | Efficiency | Useful | Adopt | Continue | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Maya, 10 (via parent) | 6 | 7 | 4 | 7 | 6 | 5 | 5 | 5 | **5** |
| 2 | Amir, 15 | 9 | 7 | 5 | 8 | 7 | 7 | 8 | 6 | **7** |
| 3 | Gareth, adult | 5 | 5 | 2 | 5 | 4 | 3 | 3 | 2 | **3** |
| 4 | Priyanka, beginner | 7 | 6 | 4 | 8 | 8 | 5 | 6 | 4 | **5** |
| 5 | Sofia, pre-pro | 8 | 6 | 4 | 7 | 6 | 5 | 6 | 5 | **5.5** |
| 6 | Kemi | 8 | 7 | 5 | 8 | 7 | 7 | 7 | 6 | **6.5** |
| 7 | Hannah | 9 | 7 | 5 | 7 | 6 | 7 | 8 | 7 | **7** |
| 8 | Gareth (comp. parent) | 8 | 6 | 4 | 7 | 5 | 6 | 6 | 5 | **5.5** |
| 9 | Pauline | 7 | 6 | 5 | 5 | 5 | 6 | 5 | 5 | **5.5** |
| 10 | Daniel (shared care) | 9 | 4 | 3 | 7 | 6 | 5 | 4 | 5 | **4.5** |
| 11 | Siân | 9 | 6 | 6 | 7 | 6 | 7 | 7 | 6 | **6.5** |
| 12 | Priya | 8 | 6 | 5 | 7 | 6 | 6 | 6 | 6 | **6** |
| 13 | Tomás | 8 | 5 | 5 | 6 | 5 | 6 | 5 | 5 | **5.5** |
| 14 | Gwen | 8 | 5 | 5 | 8 | 7 | 6 | 5 | 6 | **6** |
| 15 | Maureen | 7 | 5 | 6 | 7 | 7 | 6 | 4 | 4 | **5** |
| 16 | Nadia (admin) | 9 | 6 | 5 | 6 | 5 | 7 | 6 | 7 | **6** |
| 17 | Ruth (finance) | 9 | 5 | 5 | 6 | 4 | 6 | 4 | 5 | **5** |
| 18 | Dev (reception) | 8 | 7 | 5 | 7 | 5 | 7 | 7 | 7 | **6.5** |
| 19 | Small owner | 9 | 5 | 4 | 6 | 5 | 5 | 3 | 6 | **4** |
| 20 | Growing owner | 9 | 6 | 6 | 7 | 7 | 7 | 6 | 7 | **6** |
| 21 | Multi-site owner | 7 | 6 | 4 | 7 | 5 | 5 | 3 | 5 | **4** |
| 22 | Switching owner | 8 | 6 | 3 | 6 | 4 | 5 | 2 | 5 | **3** |
| 23 | Ruth, prospective parent | 8 | 6 | 4 | 7 | 8 | 5 | 6 | 5 | **5.5** |
| 24 | Safeguarding lead | 9 | 7 | 4 | 7 | 6 | 6 | 5 | 6 | **6** |
| | **Mean** | **8.0** | **5.9** | **4.5** | **6.8** | **5.8** | **5.8** | **5.3** | **5.4** | **5.4** |

**Reading the profile.** It has a clear shape:
- **relevance is high (8.0):** the product addresses the right jobs;
- **completeness is lowest (4.5):** too many jobs cannot be finished.

---

## 7. Independent assessments from all 24 panel members

The **complete individual assessments** are reproduced verbatim in the panel files. Each was written independently before consolidation. Each contains:
- the user profile;
- first impressions;
- most and least valuable functionality;
- what exceeded or failed expectations;
- usability concerns, missing functionality and simplification opportunities;
- five priorities, one feature to remove, and the single greatest impact;
- an adoption verdict and scores.

| # | Where | One-line position (in their words, condensed) |
|---|---|---|
| 1 | `panel-students.md` §5 Persona 1 | "It's safe and kind, but I'm only a spectator. Grey empty skill boxes make me feel behind." |
| 2 | `panel-students.md` §5 Persona 2 | "Next class and my teacher's notes are great. But my exams and rehearsals aren't in my timetable, and I can't say I'm off sick." |
| 3 | `panel-students.md` §5 Persona 3 | "Booking a drop-in was easy, then I could never get a login, and everything talks to me like a parent." |
| 4 | `panel-students.md` §5 Persona 4 | "Booking took a minute, but nothing told me what the class is like or what to wear." |
| 5 | `panel-students.md` §5 Persona 5 | "Notes and goals are useful; three skill levels are too coarse and I can't see how I've moved over months." |
| 6 | `panel-parents.md` §5 Persona 6 | "Lovely and clear, but my absence message didn't reach the teacher, and cancellations only reach me if I open the app." |
| 7 | `panel-parents.md` §5 Persona 7 | "The family week is the best thing I've used for three kids. Put shows and exams in it and give me bank details." |
| 8 | `panel-parents.md` §5 Persona 8 | "I need to know what this season will cost. A confirmed £30 private lesson appears nowhere in my money." |
| 9 | `panel-parents.md` §5 Persona 9 | "The big balance is clear, but 'Pay' doesn't pay, the bank details aren't there, and the text won't get bigger." |
| 10 | `panel-parents.md` §5 Persona 10 | "My ex can change my email and read my messages to the school. I can't use this as it stands." |
| 11 | `panel-teachers.md` §5 Persona 11 | "The register is excellent. Feedback is where the time goes, and it threw away what I'd saved." |
| 12 | `panel-teachers.md` §5 Persona 12 | "One tap switches school, but nothing stops the office booking me in two places at once." |
| 13 | `panel-teachers.md` §5 Persona 13 | "Skills publish the moment I tap; I want drafts, history and a class view." |
| 14 | `panel-teachers.md` §5 Persona 14 | "Medical notes on the register are what I need. Offline it silently failed — that's a safety register." |
| 15 | `panel-teachers.md` §5 Persona 15 | "Two buttons I can do. Too many tabs, no undo, and it let me close Tuesday's register on Friday." |
| 16 | `panel-admins.md` §5 Persona 16 | "Cancellations are excellent. I can't edit a child's details at all, and enquiries don't follow through to trials." |
| 17 | `panel-admins.md` §5 Persona 17 | "The ledger underneath is good; refunds, billing runs and discounts misbehave. Unsafe for money today." |
| 18 | `panel-admins.md` §5 Persona 18 | "Search and phone look-ups are fast. Intake is clumsy and enquiries aren't searchable." |
| 19 | `panel-owners.md` §5 Persona 19 | "It fits my school, but the first thing a new school must do — create a class — is broken." |
| 20 | `panel-owners.md` §5 Persona 20 | "Events and capacity are strong; I can't see whether students are staying term to term." |
| 21 | `panel-owners.md` §5 Persona 21 | "Strong security foundations, but it's built for one site: no location filters, no audit screen." |
| 22 | `panel-owners.md` §5 Persona 22 | "Families import well. Nothing else does: no balances, history or mandates. I wouldn't switch yet." |
| 23 | `panel-students.md` §5 Persona 23 | "I can book a trial without an account, but I can't see prices or what the class is like, and text doesn't enlarge." |
| 24 | `panel-safeguarding.md` §5 | "Better foundations than most, but consent changes, office-taken concerns and teen-login approval are impossible today." |

---

## 8. Consolidated student assessment
*Personas 1–5. Evidence: `panel-students.md`.*

**Principal needs.**
- Know what's next.
- Understand what to work on.
- See progress without feeling graded.
- Manage their own week; for adults, that means their own account.

**Most valuable existing functionality.**
- Teacher feedback notes with "to work on": `/learn/feedback`, shot `students-04`.
- Next class at a glance on `/learn`.
- Skills by style as a count of eight.
- Private self-reflection, goals and the practice log.
- Class resources (`/learn/library`).
- Milestones.

**Most significant frustrations.**
- **Adults can't get a login at all.**
  - Gareth (3) and Priyanka (4) can book but never manage bookings.
  - Invitation acceptance fails for anyone already on file (D2, shot `students-16`).
- **Exams and rehearsals are missing from the student's own view.**
  - Exam entries are invisible to the student, though the parent sees them (D3).
  - Rehearsals are not in `/learn/timetable`.
- **No way to say "I can't make it".**
- **Progress has no history over time.** The timeline is a flat list. Sofia (5) and Tomás (13) both rate this essential.
- **Young children see grids of empty "not yet" skills** (Maya, 1; also Kemi, 6).
- **Text ignores the user's font-size setting** (D4, shot `students-08`).

**Common themes.**
- The feedback *content* is valued.
- The *structure* around it (history, exams, diary) is thin.

**Missing functionality.**
- Adult self-managed account.
- Unified diary (classes, rehearsals, exams).
- Student absence reporting (13+).
- Notifications for students: there is no bell, so a cancellation is only seen by opening the timetable.
- Progress history.
- An opt-out from tracking for recreational dancers.
- A supervised child mode for under-13s.

**Adoption barriers.**
- No adult accounts.
- Teen logins can't be switched on by parents (dead end).
- No notifications.

**Highest-priority improvements.** UR-03, UR-06, UR-16, UR-21, UR-26; then progress history (UR-43).

**Disagreements (retained).**
- **Maya (1) vs Sofia (5) on tracking.**
  - Maya, a recreational 10-year-old, wants feedback as encouragement and no visible "not yet" grids.
  - Sofia, a pre-professional 17-year-old, wants *finer* levels, more history and practice targets.
  - Both are right for their context. The resolution is per-student or per-class tracking depth (see §22).
- **Amir (2) on parental visibility.** He values his private reflection being private. Parents in the parent group want to see more. See §22.

**Scores.**

| Measure | Score |
|---|---|
| Group satisfaction | 5/10 |
| Adoption | 5/10 |
| Continued use | 4.5/10 |

---

## 9. Consolidated parent and guardian assessment
*Personas 6–10. Evidence: `panel-parents.md`.*

**Principal needs.**
- One clear view of the family's week.
- Being told about changes (out of the app as well as in it).
- Knowing what is owed and how to pay.
- Reporting absences.
- Seeing how a child is progressing.
- Privacy between separated parents.

**Most valuable existing functionality.**
- Family weekly view and family schedule (`/family`, `/family/schedule`; shot `parents-14`).
- Cancellation notices (`parents-07`).
- Cover-teacher labelling.
- Invoice ledger by child.
- Event costs and entry deadlines.
- "Ask the studio" and enquiries.
- Big balance figure.
- Copyable payment reference.

**Most significant frustrations.**
- **Absence reports don't reach the teacher** (D2, shots `parents-03b` and `parents-18`).
- **Money:**
  - "Pay £97.00" doesn't pay, and no bank details are shown (D4, D5, `parents-09`);
  - no invoice notification (D6);
  - no forecast of upcoming costs;
  - a confirmed private lesson is never billed (D9).
- **Shared care:**
  - the second parent can't accept their invite (D1, `parents-10`);
  - a co-parent can edit the other's details (D3, `parents-11`);
  - private messages to the school are shared between guardians (`parents-15`).
- **The schedule** doesn't include events, rehearsals or private lessons.
- **Accessibility:** text doesn't scale, and small grey text is hard to read (Pauline, 9).

**Common themes.**
- The parent area is the clearest part of the product.
- It lets parents down at the moments of action: paying, reporting an absence, being alerted.

**Missing functionality.**
- Out-of-app notifications (push, SMS or email).
- Merged family calendar with a child filter.
- Upcoming-costs view.
- Complete bank details.
- Consent management.
- Per-guardian privacy, collection permissions and split billing.
- A "what to bring" note per class.

**Adoption barriers.**
- Payment not possible in the app.
- Shared-care privacy.
- No alerts outside the app.

**Highest-priority improvements.** UR-03, UR-05, UR-07, UR-22, UR-23, UR-24, UR-17.

**Disagreements (retained).**
- **Hannah (7) vs Daniel (10) on what guardians share.**
  - Hannah, in a together family, likes one shared family view and thread.
  - Daniel, separated, needs his messages to the school private, and control over what the other guardian can change.
  - Recommended approach: shared by default, with per-guardian privacy settings and office-controlled restrictions (UR-17).
- **Pauline (9) on the calendar subscription.** She would remove the webcal subscription as a first option because it confused her. Hannah values calendar sync. Recommended: keep it, behind a plain "Add to my phone's calendar" step with instructions.

**Scores.**

| Measure | Score |
|---|---|
| Group satisfaction | 5.8/10 |
| Adoption | 6.0/10 |
| Continued use | 5.6/10 |

---

## 10. Consolidated teacher assessment
*Personas 11–15. Evidence: `panel-teachers.md`.*

**Principal needs.**
- Take the register fast and reliably, even with bad signal.
- See safety information at the door.
- Give feedback without eating unpaid time.
- Know their schedule, including cover across schools.

**Most valuable existing functionality.**
- **The register.** It is the single most-praised feature in the whole panel:
  - two large buttons, "Mark the rest", medical notes, late and excused (shots `teachers-01`, `teachers-20`);
  - measured at 9 interactions for 12 children.
- After-class feedback prompt.
- Term reports auto-drafted (`teachers-18`).
- Ask for cover.
- School switcher: one tap.
- Messaging that the office can see.
- Raising a safeguarding concern (`teachers-16`).

**Most significant frustrations.**
- **Offline register fails** (D1–D3, shots `teachers-04` to `teachers-07`):
  - marks don't appear;
  - "Mark the rest" spins indefinitely;
  - one absence was overwritten to Here on reconnect;
  - "Open register" from cache goes to a browser error page.
- **Feedback effort.** 41 interactions for 12 children; at least 61 for 20, by arithmetic. There are no bulk actions.
- **Editing saved or shared feedback** shows empty chips and replaces what was saved (D4, `teachers-10`).
- **Previous feedback is not visible** at the point of teaching.
- **Fixed, studio-wide chips** that are not age-appropriate (Gwen, 14).
- **Cover can double-book a teacher across sites** (D5).
- **Wrong-day registers.** A register can be closed days early (D6).
- **Skill levels** publish on one tap and expose styles the teacher doesn't teach (D11).

**Common themes.**
- The register is the reason teachers would adopt.
- Feedback is the reason some would drift back to paper or WhatsApp.

**Missing functionality.**
- Offline-safe register.
- Bulk and teacher-owned feedback.
- Previous feedback on the register.
- Cover clash check and handover note.
- Cross-school personal agenda.
- Support-needs list.
- Simplified teacher mode.

**Adoption barriers.**
- Unreliable connectivity in studios: church halls, basements.
- Feedback workload: unpaid admin.

**Highest-priority improvements.** UR-04, UR-25, UR-27, UR-37, then UR-44 (bulk feedback).

**Disagreements (retained).**
- **Tomás (13) vs Gwen (14) and Maureen (15) on feedback depth.**
  - Tomás wants richer skill frameworks, drafts and a class progress matrix.
  - Gwen wants simple age-appropriate stickers or chips.
  - Maureen wants less.
  - This is a configurable-depth problem, not a single answer (§22).
- **Siân (11) on skill levels.** She is happy for levels to publish immediately. Tomás wants draft-then-publish. Recommended: a per-school setting, defaulting to draft for skill levels.

**Scores.**

| Measure | Score |
|---|---|
| Group satisfaction | 5.8/10 |
| Adoption | 5.4/10 |
| Continued use | 5.4/10 |

---

## 11. Consolidated administrator assessment
*Personas 16–18. Evidence: `panel-admins.md`.*

**Principal needs.**
- Accurate records.
- Quick look-ups.
- Enquiries that flow into trials and places.
- Billing that is right first time.
- Fewer repetitive steps.

**Most valuable existing functionality.**
- Session cancellation with parent notice (`admins-10`, `admins-11`).
- Today action queue.
- Requests inbox (medical updates).
- Schedule clash detection.
- Move student keeping history.
- Global search (⌘K) and phone family look-up (`admins-24`).
- Billing runs, aged-debt and accounting exports, payment reminders.

**Most significant frustrations.**
- **Editing a student crashes the screen** (D1, `admins-21`).
- **Enquiries are not linked to trials**, so details are re-typed and the pipeline is wrong (D3, `admins-03`, `admins-04b`).
- **Waiting list can offer one place twice** (D4, `admins-08`).
- **Money:**
  - a refund reopens a paid invoice as debt (D6, `admins-18`);
  - a billing run re-bills a term already invoiced (D8, `admins-15`);
  - ending a discount silently fails (D2, `admins-17`);
  - no screen for goodwill credit (D7).
- **Housekeeping:**
  - enquiries are not in search;
  - possible duplicate families with no merge;
  - no audit-trail view;
  - no bulk actions.

**Common themes.**
- The office tools are well chosen.
- Too many end in a wrong result rather than a visible error.

**Missing functionality.**
- Enquiry → trial → enrolment linkage.
- Credit notes and goodwill credit.
- Billing-run duplicate guard.
- Bulk reminders and messages.
- Record history.
- Bank reconciliation import.
- Duplicate detection and merge.

**Adoption barriers.**
- Finance would not trust the money screens yet (Ruth, 17: adoption 4).

**Highest-priority improvements.** UR-02, UR-10, UR-18, UR-19, UR-36, then UR-46 (bulk actions) and UR-35 (history).

**Disagreements (retained).**
- **Dev (18) vs Nadia (16) on the pipeline board.**
  - Dev would remove the pipeline "Move to" dropdown.
  - Nadia would simplify the drag board.
  - Both find the pipeline less useful than a linked enquiry record. Keep one board interaction, not two.

**Scores.**

| Measure | Score |
|---|---|
| Group satisfaction | 5.5/10 |
| Adoption | 5.5/10 |
| Continued use | 6.5/10 |

---

## 12. Consolidated school owner assessment
*Personas 19–22. Evidence: `panel-owners.md`.*

**Principal needs.**
- Time saved.
- Money collected.
- Students retained.
- A clear view of the business across sites.
- A safe migration.

**Most valuable existing functionality.**
- Needs-attention dashboard (`owners-08`).
- Term billing run.
- Families CSV import with validation (`owners-11`).
- Setup checklist.
- Show management with rehearsal registers and event fees (`owners-14`).
- Class capacity report.
- Role-based permissions with plain descriptions (`owners-10`).
- Safeguarding access log.
- Time-limited support access.
- Full data export.

**Most significant frustrations.**
- **Class creation is broken** (D1, `owners-13`). This blocks a new school completely (scenario 31: 32 interactions, then a dead end).
- **No retention trend.**
- **No location filter or comparison** in reports.
- **No audit-log screen.** Medical record views are not logged.
- **Plan limit shown as an error** (`owners-12`).
- **Onboarding tells an empty school it has sample data** (D3, `owners-04`).
- **Migration covers families only.** The import silently drops columns it can't map, such as balances and mandates (D5).

**Common themes.**
- Small and growing owners see clear value once it works.
- Multi-site and switching owners see a product built for one site, without a migration path.

**Missing functionality.**
- Retention report.
- Location dimension in reports and roles.
- Migration toolkit:
  - timetable;
  - opening balances;
  - Direct Debit mandates;
  - a warning on unmapped columns.
- Email invitations.
- Card payments.
- Volunteer rota.
- Revenue by class.

**Adoption barriers.**
- Card and Direct Debit payments not connected.
- Migration effort.
- Manual invite links for 150 families.

**Highest-priority improvements.** UR-01, UR-13, UR-14, UR-15, UR-32, UR-35, UR-33, UR-34.

**Disagreements (retained).**
- **Small owner (19) vs multi-site owner (21) on Studio Pulse.**
  - The small owner would hide the "Studio Pulse" score until it has data.
  - The multi-site owner would move it off the main report.
  - Both judge it low value today.
- **Small owner (19) vs multi-site owner (21) on configuration.**
  - The small owner fears complexity.
  - The multi-site owner needs location-scoped roles and filters.
  - Recommended: location features appear only when a school has more than one location.

**Scores.**

| Measure | Score |
|---|---|
| Group satisfaction | 4/10 |
| Adoption | 3.5/10 |
| Continued use | 6/10 |

---

## 13. Prospective customer assessment
*Personas 23 and 4; also persona 3. Evidence: `panel-students.md` scenario P1.*

**The journey.** `/welcome` → `/join?school=northstar` → choose a trial or an adult drop-in → details and privacy confirmation → "BOOKED" → *(no account, no follow-up unless the office acts)*.

**What works.**
- Booking without an account takes about a minute (`students-10`, `students-12`).
- Places left are shown.
- The privacy notice is clear.
- The age filter works.
- The school's branding is used.

**What fails.**
- **Suitability.** There is no class description, level explanation or "what to expect". "Your child's age" is the first question even for adults (`students-13`).
- **Price.** The ongoing price is not shown for trials (persona 23: "Essential").
- **Confirmation.** It is thin: no address or map, what to wear, cancellation policy, or what happens next.
- **Becoming a regular.** Moving from trial to regular depends on the office. The invitation then fails for anyone whose details were captured at booking (UR-03).
- **Public marketing page.** `/welcome` is written for school owners, not families. Persona 23 found it confusing as a parent.
- **Text size.** Text does not enlarge with her accessibility settings (low vision).
- **Adult drop-in integrity.** The defect UR-06 makes this unsafe for any family that already exists.

**Scores.**

| Measure | Score |
|---|---|
| Satisfaction | 5.5/10 |
| Adoption | 6/10 |
| Continued use | 4.5/10 |

---

## 14. Safeguarding and welfare assessment
*Persona 24 plus cross-cutting review. Evidence: `panel-safeguarding.md`.*

**Confirmed strengths, observed.**
- **Teacher boundary.** A teacher could not open another teacher's register or a student they don't teach by URL (S4, `safeguarding-05`, `safeguarding-06`).
- **Spoofed role.** A teacher session with a spoofed "owner" role saw the owner chrome but **no data** (S5, `safeguarding-07`).
- **Guardian boundary.** A guardian could not reach another family (S6).
- **Student boundary.** A student could not see other students (S7).
- **Platform admin.** Sees counts, never children's records (S8).
- **Concern log.** Teachers can raise concerns. Only the lead and the owner read them, and every view is logged (S1, `safeguarding-03`, `safeguarding-04`, `safeguarding-08`, `safeguarding-11`).
- **Staff checks.** Recorded with expiry dates (`safeguarding-12`).
- **No private channel.** There is no private teacher–family channel; the office sees everything.

**Confirmed issues, observed or code-confirmed.**
1. **Consent.** No screen records or withdraws consent. Teachers keep seeing "Photos allowed" after a parent asks to stop (D-02, S2: unable to complete, `safeguarding-15`).
2. **Concerns.** Office staff and the DSL cannot raise a concern, and there is no route for concerns about adults or staff (D-01, `safeguarding-10`).
3. **Teen logins.** The app says a parent must approve a student login, but parents have no screen to approve it or switch it off. The age threshold has no settings screen (D-09).
4. **Guardian edits.** Any guardian can edit another guardian's contact details (D-11, `safeguarding-14`). The same defect as UR-05.
5. **Medical-visibility text.** Parent-facing and office text says teachers see "allergies and the emergency plan only". Teachers actually also see conditions, medication and all emergency contacts (D-04).
6. **Access log.** It double-counts opens (D-03).
7. **Export.** The school export omits safeguarding records, staff checks and the audit trail (D-05).
8. **Keyboard focus.** Sheets do not trap focus or return it on close (D-08, accessibility).

**Potential concerns needing specialist assessment.** Not claims of non-compliance:
- **Retention and safeguarding (D-10).** The data-keeping run would anonymise a child ("Former student") even while a safeguarding concern about them is held or open. That would make the chronology unattributable. Needs a legal hold, and advice on retention periods.
- **Latent consent fault (D-07).** A second photography consent row would make People and family pages error ("more than one row"). It becomes live as soon as consent changes are built.
- **Policy questions** for a DPO or legal adviser:
  - the student-login minimum age (default 13);
  - the accuracy of privacy notices;
  - subject access, correction and erasure processes;
  - logging of medical-record reads.
- **Security of real sign-in (R-001).** Not built, so it could not be assessed. No real children's data should be used until it exists and has been reviewed.

**Scenario outcomes.**
- **S1 (teacher concern to lead):** completed with minor friction. The office route is unable to complete.
- **S2 (photo consent withdrawal):** unable to complete.
- **S3 (see, correct or delete data):** partially completed. Export and erasure for families: unable to complete.
- **S4–S8 (boundary tests):** all held.
- **S9 (accessibility spot checks):** minor friction.
  - Keyboard use of the register worked (`safeguarding-19`).
  - 320px reflow was fine (`safeguarding-20`).
  - Status is never shown by colour alone.
  - Failures: focus trap; text scaling.

**Persona 24 overall.** 6/10. Satisfaction 6, adoption 5, continued use 6.

---

## 15. Detailed feature and functionality assessment

Status key:
- **✓** Fully implemented and tested
- **○** Implemented, not testable here
- **◐** Partial
- **✗** Defective
- **—** Missing
- **↓** Low value

| Area | Feature | Status | Evidence / note |
|---|---|---|---|
| A. Scheduling | View timetable (office week grid, clashes, today marked) | ✓ | `/schedule`; `teachers-21` |
| | Create class | ✗ | Always fails (owners D1) |
| | Edit or duplicate class | ✓ | Workaround for create (9 interactions) |
| | Recurring sessions and terms | ✓ | Generated from class and term |
| | Multiple locations and rooms | ◐ | Exist, but no location filter in reports or roles; plan limit shown as an error |
| | Teacher allocation and cover | ◐ | Ask-for-cover works; no clash check (teachers D5) |
| | Capacity and waiting lists | ◐ | Waiting list can double-offer (admins D4) |
| | Cancel session with notice | ✓ | `admins-10/11`; trial families missed (admins D5, code) |
| | Private lessons | ◐ | Requestable and confirmable; never billed (parents D9) |
| | Rehearsals, competitions, performances, workshops | ◐ | Events, rehearsal registers and fees exist; not in family or student schedules |
| | Holiday schedules | ◐ | Terms with breaks; not separately reviewed |
| | Calendar sync | ○ | Subscription link exists; live feed not testable |
| B. Registration | Public trial booking | ✓ | `/join`; no description or ongoing price |
| | Adult drop-in | ✗ | Attaches to an existing child (students D1) |
| | Family registration and multiple children | ✓ | Office creates; families import |
| | Enrolment and class transfer | ✓ | Move keeps history; buried under withdraw |
| | Make-up classes | — | None |
| | Consent forms | — | Read-only display; no capture or withdrawal |
| | Emergency contacts and medical | ✓ | Parent requests and office approval (requests inbox) |
| | Invitations and accounts | ✗ | Fails for existing guardian rows (UR-03); links sent by hand (no email) |
| C. Attendance | Register (online) | ✓ | 9 taps / 12 children |
| | Register (offline) | ✗ | Marks lost or overwritten (teachers D1–D3) |
| | Late and excused | ✓ | One tap in; rows stay expanded (minor) |
| | Planned absence from parents | ✗ | Promise broken (parents D2) |
| | Attendance history and trends | ◐ | Per-student percentage is all-time, mislabelled "this term" (teachers D8); reports by week |
| | Missed-class or absence alerts | — | Not a welfare signal yet |
| D. Payments | Term billing runs | ✗ | Can re-bill an invoiced term (admins D8) |
| | Monthly billing, drop-ins, packs | ✓ | Migration 0039 |
| | Family and sibling discounts | ✗ | Apply works; end fails (admins D2) |
| | Invoices, receipts, history for parents | ◐ | Ledger by child; no receipts download; no invoice notification |
| | Card and Direct Debit payments | ○/— | Not connected (R-006) |
| | Bank transfer instructions | ✗ | Reference only, no bank details (parents D4) |
| | Refunds | ✗ | Reopen invoice as debt (admins D6) |
| | Credit on account | ◐ | Database yes; no UI (admins D7) |
| | Failed payments and reminders | ◐ | Reminders exist; Today card mislabels the amount |
| | Aged debt and accounting export | ✓ | Finance's top-valued features |
| | Event, costume and competition fees | ◐ | Event fees billed; costumes no data in this family |
| E. Feedback and development | Teacher notes with "to work on" | ✓ | Students' top feature |
| | Quick chips after class | ◐ | Fixed studio-wide; no bulk; editing erases (teachers D4) |
| | Skills as a count of eight | ◐ | Publish on one tap; all frameworks shown; empty grids for young children |
| | Goals and reflections | ✓ | Private reflection valued |
| | Progress over time | ◐ | Flat timeline; no trend or history view |
| | Term reports | ✓ | Auto-drafted; valued by teachers |
| | Practice log | ◐ | No saved acknowledgement (students D5) |
| | Exams | ◐ | Office and parent yes; student cannot see (students D3) |
| | Learning resources | ✓ | `/learn/library`; not linked to feedback |
| | Milestones | ✓ | Celebrated without grading |
| F. Communication | In-app notices and bell | ✓ | Family; students have no bell |
| | Email, SMS, push | ○ | Not connected (R-003) |
| | Teacher–family messages (office-visible) | ✓ | Safeguarding strength |
| | Notification preferences | ○ | Settings exist; delivery not testable (`parents-05`) |
| | Invoice and feedback notifications | — | Not generated (parents D6) |
| | Read acknowledgements | — | None |
| | Urgent styling | ◐ | Cancellations use Notices but are not marked urgent |
| G. Events | Shows, rehearsals, tickets, costumes, exams | ◐ | Rich office side; parent places count wrong, not per child (parents D7, D8) |
| | Volunteers | — | No rota |
| H. Administration | Today queue, search, people, requests | ✓ | |
| | Edit student | ✗ | Crash (admins D1) |
| | Enquiries pipeline | ◐ | Not linked to trials (admins D3) |
| | Reports: capacity, attendance, conversion | ◐ | No retention trend; inconsistent funnel numbers; no location filter |
| | Data export | ✓ | Full JSON plus CSV; omits safeguarding (D-05) |
| | Data import | ◐ | Families only; drops unmapped columns silently |
| | Audit history view | — | Database has it; no screen |
| I. Accounts and permissions | Roles: owner, admin, teacher, guardian, student, platform | ✓ | Boundaries held |
| | Multiple schools per person (switcher) | ✓ | One tap; no combined agenda |
| | Second guardian | ✗ | Invite fails; edit and message privacy issues |
| | Teen login approval by parent | — | Dead end (D-09) |
| | Adult student accounts | — | Not supported |
| | Password recovery and real sign-in | ○ | R-001 |
| | Location-scoped roles | — | |

---

## 16. Real-world scenario testing results

Outcome key:
- **SC**: Successfully completed
- **Minor**: Completed with minor friction
- **Sig**: Completed with significant friction
- **Part**: Partially completed
- **Unable**: Unable to complete
- **UV**: Unable to verify

Interaction counts and step-by-step detail for each scenario are in the panel files.

| # | Scenario | Persona | Outcome | Key observation | Main improvement |
|---|---|---|---|---|---|
| 1 | Find a suitable beginner class | 4 | Sig | Age filter only; no description or level meaning | UR-20 |
| 2 | Book a class and understand its cost | 3, 23 | Minor (adult) / Sig (trial) / ✗ existing email | Drop-in price clear; ongoing price never shown; D1 mis-booking | UR-06, UR-20 |
| 3 | View weekly schedule | 2 | SC | `/learn/timetable` clear | UR-26 (include rehearsals) |
| 4 | Understand feedback and what to practise | 2 | Minor | Notes clear; not linked to resources | UR-43 |
| 5 | Review progress over three months | 5 | Part | Flat timeline; no history | UR-43 |
| 6 | Cancel or rearrange a class | 2, 3 | Unable (student and adult) / Part (parent) | No student absence; parent absence goes nowhere | UR-07, UR-49 |
| 7 | Understand upcoming rehearsals and competitions | 2 | Sig | Not in timetable; exams invisible | UR-26 |
| P1 | Prospective journey | 23 | Part | Books fast; no suitability, price or account path | UR-20, UR-03 |
| 8 | Register two children | 7 | Minor | Out-of-age requests not warned | UR-54 |
| 9 | Family schedule for the week | 7 | SC | Best-rated parent screen; no events | UR-26 |
| 10 | Understand an unexpected payment request | 9 | Part | Can see it; can't pay; no bank details | UR-22 |
| 11 | Report a child will miss a class | 6 | Sig | Message never reaches teacher | UR-07 |
| 12 | Review child's latest feedback | 6 | Minor | Opens wrong child from "All feedback" | UR-54 |
| 13 | Last-minute cancellation notification | 6 | Minor | In-app only (email, SMS, push not verifiable) | UR-14 |
| 14 | Two guardians' access | 10 | Part | Invite fails; edit and message privacy issues | UR-03, UR-05, UR-17 |
| 15 | All upcoming dance expenses | 8 | Unable | No forecast; private lesson unbilled | UR-24 |
| 16 | Record attendance quickly | 11 | Minor | 9 interactions / 12 children | Retain; UR-37 |
| 17 | Feedback for 20 students | 11 | Sig | 41 interactions for 12; ≥61 for 20 (arithmetic) | UR-44 |
| 18 | Review previous feedback | 13 | Sig | Not at point of teaching; editing erases | UR-25 |
| 19 | Freelance cross-school schedule | 12 | Part | Switcher fine; no combined agenda | UR-47 |
| 20 | Identify students needing support | 14 | Part | No support-needs view | UR-45 |
| 21 | Cover teacher gets class info | 12 | Minor | Info right; no clash check or handover | UR-27 |
| 22 | Unreliable internet | 14 | Unable (demo) | Marks lost or overwritten; error page | UR-04 |
| 23 | Enquiry from prospect | 18 | Sig | Re-typing; not linked | UR-18 |
| 24 | Move student to another class | 16 | Minor | Hidden behind withdraw | UR-52 |
| 25 | Manage waiting list | 16 | Sig | Double offer for one place | UR-19 |
| 26 | Cancel class and inform everyone | 16 | SC | Families notified; trial families missed (code) | UR-36 |
| 27 | Reconcile overdue payments | 17 | Minor | Aged debt good; no bulk reminders | UR-46 |
| 28 | Apply family discount | 17 | Part | Ending fails | UR-10 |
| 29 | Correct student info | 16 | Unable | Crash | UR-02 |
| 30 | Refund or credit | 17 | Sig | Refund reopens debt; no credit UI | UR-10 |
| 31 | New school and first timetable | 19 | Unable | Class create fails after 32 interactions | UR-01, UR-53 |
| 32 | Classes below capacity | 20 | Minor | Capacity report; no filter | UR-51 |
| 33 | Retention trends | 20 | Part | No trend | UR-34 |
| 34 | Business performance | 19, 20 | Minor (single site) | Multi-site: significant friction | UR-33 |
| 35 | Second location | 21 | Part | No location dimension; plan limit as error | UR-33 |
| 36 | Migrate platform | 22 | Part | Families only | UR-32 |
| 37 | Who can access sensitive info | 21 | Sig | Roles clear; no audit screen; medical reads unlogged | UR-35 |
| 38 | End-of-term performance | 20 | Minor | Strong; long panel; no volunteer rota | UR-50 |
| S1 | Teacher concern → lead | 24 | Minor (office route: Unable) | | UR-09 |
| S2 | Parent withdraws photo consent | 24 | Unable | | UR-08 |
| S3 | See, correct or delete child's data | 24 | Part | | UR-38 |
| S4–S8 | Boundary tests | 24 | SC (all held) | | Retain |
| S9 | Accessibility spot checks | 24 | Minor | Focus trap; text scaling | UR-30, UR-31 |

**Totals across 48 scenario outcomes.** Split scenarios (2, 6) are counted by their main outcome:

| Outcome | Count |
|---|---|
| SC | 8 (5 of them boundary tests) |
| Minor | 13 |
| Sig | 10 |
| Part | 11 |
| Unable | 6 |
| UV | 0 |

Scenarios needing email, SMS or card payment were tested up to the point of delivery and marked accordingly.

---

## 17. Feature demand and voting matrix

> **Simulated panel findings, not market research.**

**How votes were counted.** Each of the 24 members voted independently, in the "Votes" section of their panel file:
- five most valuable existing features;
- five frustrations;
- five missing features or improvements, each rated Essential (E), Highly desirable (HD), Useful (U) or Nice to have (N);
- one feature to remove or simplify;
- one single greatest-impact improvement (GI).

Synonymous items were merged. A member counts as "supporting" an improvement if they listed it as missing, as their greatest impact, or as a frustration describing the same need.

**Votes are not the priority.**
- Several items with one vote (billing integrity, real sign-in, office-raised concerns) are **P0**, because a whole school depends on them.
- Payment integrity, safeguarding and accessibility were not deprioritised for low vote counts.

### 17.1 Most valuable existing features (mentions out of 24)

| Existing feature | Mentions | Groups |
|---|---|---|
| Register: two buttons, "Mark the rest", medical notes beside the name | 6 | Teachers (all 5), safeguarding |
| Teacher feedback notes, skills by style, goals and reflection | 6 | Students (1, 2, 5), teachers (13), parents (10) |
| Cancellation notices and the family weekly view and schedule | 6 | Parents (6, 7, 9, 10), admin (16), reception (18) |
| Invoice ledger by child, big balance, copyable reference | 4 | Parents (7, 8, 9, 10) |
| Billing runs, payment reminders, aged-debt and accounting exports | 4 | Finance (17), owners (19, 22) |
| No-account public trial and drop-in booking, privacy notice, places left | 4 | Prospects (3, 4, 23), reception (18) |
| Term reports auto-draft | 2 | Teachers (11, 13) |
| Families CSV import with validation; full data export | 3 | Owners (19, 21, 22) |
| Safeguarding log with logged access; teacher sees own students only; no private channel | 3 | Safeguarding (24), owner (21), teacher (14) |
| Ask for cover; school switcher | 2 | Teachers (12, 15) |
| Today action queue and needs-attention dashboard | 2 | Admin (16), owner (19) |
| Show management, rehearsal registers, event fees | 2 | Owner (20), parent (8) |

### 17.2 Improvement demand matrix

| Improvement (register ID) | Support | % of 24 | Supporting groups (members) | Strength | Frequency of use | Impact | Opposing views |
|---|---|---|---|---|---|---|---|
| Email, SMS and push delivery, plus email invitations (UR-14) | 7 | 29% | Parents 6, 8; student 2; reception 18; owners 19, 22; admin (frustration) | E (6: GI) | Daily | Very high | Pauline (9) worries about too many messages: needs preferences and a digest |
| Offline-safe register (UR-04) | 4 | 17% | Teachers 11, 12, 14 (GI), 15 (GI) | E | Every class | Very high (safety register) | None |
| Planned absence reaching the register, incl. students 13+ (UR-07, UR-49) | 4 | 17% | Parents 6, 9; teacher 14; student 2 | E | Weekly | High | None |
| Fix invitation for existing guardian records (UR-03) | 4 | 17% | Students 3, 23; parent 10; safeguarding 24 | E | Every onboarding | Very high | None |
| Class suitability info and public prices (UR-20) | 4 | 17% | Prospects 4 (GI), 23 (GI); admin 16; reception 18 | E | Every new customer | High | None |
| Card / Direct Debit payments (UR-15) | 4 | 17% | Parent 9; finance 17; owners 19, 20 | E/HD | Monthly or termly | Very high | None; some families prefer bank transfer (keep it) |
| Class creation fix (UR-01) | 3 | 13% | Owners 19 (GI), 20, 21 | E | Setup, termly | Blocking | None |
| Text scales with user settings (UR-30) | 3 | 13% | Parent 9 (GI); students 3, 23 | E/HD | Every visit | High for affected users | None |
| Unified diary / merged family calendar; student exam view (UR-26) | 3 | 13% | Students 2 (GI), 5; parent 7 (GI) | E | Weekly | High | None |
| Hide unassessed skills; tracking depth for young and recreational (UR-55) | 3 | 13% | Student 1; parent 6; teacher 14 | HD | Weekly | Medium | Sofia (5) and Tomás (13) want *more* detail: make it configurable |
| Collection and pick-up permissions (UR-17) | 3 | 13% | Parent 10; teacher 14; safeguarding 24 | E/HD | Every class (young) | High (safety) | None |
| Progress history over time (UR-43) | 2 | 8% | Student 5 (GI); teacher 13 (GI) | E | Monthly | High (differentiator) | Maya (1): not wanted for young recreational dancers |
| Enquiry → trial → enrolment linkage (UR-18) | 2 | 8% | Admin 16 (GI); reception 18 (GI) | E | Daily (office) | High | None |
| Consent management (UR-08) | 2 | 8% | Parent 6; safeguarding 24 (GI) | E | Occasional; critical | Very high (safeguarding) | None |
| Upcoming-costs forecast (UR-24) | 2 | 8% | Parents 7, 8 (GI) | E | Monthly | High | None |
| Complete bank-transfer details (UR-22) | 2 | 8% | Parents 7, 9 | E | Each invoice | High | None |
| Previous feedback at point of teaching; edits preserve (UR-25) | 2 | 8% | Teachers 11, 13 | HD | Every class | Medium–high | None |
| Bulk, teacher-owned and age-appropriate feedback chips (UR-44) | 2 | 8% | Teachers 11 (GI), 14 | E/HD | Every class | High (teacher time) | Tomás prefers individual depth to bulk |
| Office bulk actions (UR-46) | 2 | 8% | Admin 16; finance 17 | HD | Weekly | Medium | None |
| Audit / access history screen (UR-35) | 2 | 8% | Admin 16; owner 21 | E/HD | Occasional | Medium–high | None |
| Guardians edit only their own details; shared-care privacy (UR-05, UR-17) | 2 | 8% | Parent 10 (GI); safeguarding 24 | E | Rare but severe | Very high (safety) | Hannah (7) likes a shared family view (keep it as the default) |
| Video feedback / student video submission (UR-60) | 2 | 8% | Teacher 13; student 5 | N | — | Low now | Safeguarding concerns about children's video |
| Refunds, credit notes, billing-run guard (UR-10) | 1 | 4% | Finance 17 (GI) | E | Monthly | Very high (payment integrity) | None |
| Fix student editing (UR-02) | 1 | 4% | Admin 16 | E | Weekly | Blocking | None |
| Migration toolkit (UR-32) | 1 | 4% | Owner 22 (GI) | E | Once per school | Decisive for switchers | Small owner fears complexity |
| Multi-location reporting and roles (UR-33) | 1 | 4% | Owner 21 (GI) | E | Weekly | High for multi-site | Small owner: hide for single-site |
| Retention report (UR-34) | 1 | 4% | Owner 20 (GI) | E | Termly | High | None |
| Cover clash check (UR-27) | 1 | 4% | Teacher 12 (GI) | E | Weekly | Medium | None |
| Adult self-managed accounts (UR-21) | 1 | 4% | Student 3 (GI) | E | Weekly | High for adult schools | None |
| Real sign-in (UR-13) | 1 | 4% | Safeguarding 24 | E | Every visit | Blocking for real use | None |
| Office / DSL concern entry (UR-09) | 1 | 4% | Safeguarding 24 | E | Rare; critical | Very high | None |
| Guardian approval of teen login (UR-16) | 1 | 4% | Safeguarding 24 | HD | Once per teen | High | Amir (2) wants autonomy (allowed *after* approval) |
| Supervised child mode for under-13s (UR-55) | 1 | 4% | Student 1 (GI) | HD | Weekly | Medium | Safeguarding: keep under-13s without own login (a parent-controlled view only) |
| Wrong-day register guard (UR-37) | 1 | 4% | Teacher 15 | HD | Rare; integrity | Medium | None |
| Draft-then-publish skill levels (UR-48) | 1 | 4% | Teacher 13 | HD | Weekly | Medium | Siân (11) is fine with instant publish (make it a setting) |
| Volunteer rota (UR-50) | 1 | 4% | Owner 20 | HD | Per show | Medium | None |
| Badges / stickers | 1 | 4% | Student 1 | N | — | Low | Panel view: milestones suffice |

### 17.3 "Remove or simplify" votes (one per member)

| Item | Votes | Who |
|---|---|---|
| Unassessed or empty skill grids for young children; skill picker for pre-school | 3 | 1, 6, 14 |
| Guardian editing another guardian's details | 2 | 10, 24 |
| "Your child's age" filter shown to adults | 2 | 3, 4 |
| Ungrouped progress timeline | 2 | 2, 5 |
| Studio Pulse score while it has no data (hide or move) | 2 | 19, 21 |
| Pipeline: drag board / Move-to dropdown (keep one) | 2 | 16, 18 |
| All-framework skill wall for teachers | 1 | 13 |
| Practice and milestones inside the teacher view | 1 | 15 |
| Practice log for older students | 1 | 7 |
| Student panel on phone (too dense) | 1 | 11 |
| Cover access window (too wide) | 1 | 12 |
| Places count shown to parents | 1 | 8 |
| Webcal subscription as the first calendar option | 1 | 9 |
| "Retry" label on failed card payments (misleading while cards are not connected) | 1 | 17 |
| Six-month table until history exists | 1 | 20 |
| Prices and discounts step during migration (defer) | 1 | 22 |
| `/welcome` shown to families (it is for school owners) | 1 | 23 |

---

## 18. Missing functionality and unmet user needs

Needs come first; a needed feature is not always the answer to one.

| Unmet need (observed or voiced) | Who | Already partly there? | Answer |
|---|---|---|---|
| "Tell me when something changes, even when I'm not in the app" | Parents, students, prospects | In-app notices and bell; preferences exist | Connect delivery (UR-14), not new features |
| "Let me pay without hunting for details" | Parents | Ledger and reference | Bank details plus honest label now (UR-22); cards later (UR-15) |
| "Make sure the teacher knows my child is off" | Parents, teachers | Message exists | Route it to the session (UR-07): **extend**, not add |
| "Never lose a register mark" | Teachers, DSL | Offline queue code exists but never runs | **Fix** (UR-04) |
| "See every commitment in one place" | Parents, students | Events, exams, rehearsals all stored | **Connect** them into the existing schedules (UR-26) |
| "Know what this season will cost" | Competitive parents | Event fees, invoices | A forecast view built from existing data (UR-24) |
| "Give feedback in less unpaid time" | Teachers | Chips, prompt | Bulk and teacher-owned chips (UR-44), keep saved state (UR-25) |
| "See how I have grown" | Older students, coaches | Assessments are timestamped | History view from existing rows (UR-43) |
| "Know whether students are staying" | Owners | Enrolments with dates | Report from existing data (UR-34) |
| "Bring my school across without losing money history" | Switching owners | Families import | Extend import (UR-32) |
| "Change consent; raise a concern at the desk" | DSL, office, parents | Database tables and functions exist | Screens only (UR-08, UR-09) |
| "Keep my messages private from my ex" | Shared-care parents | Office-visible threads | Per-guardian scoping (UR-17) |
| "Let me book as an adult and manage it" | Adult students | Adult drop-ins | Adult account type (UR-21) |
| "Make-up a missed or cancelled class" | Parents, admins | Drop-ins, credit model | Make-up offers (UR-56) |
| Things still done outside the app | All | — | WhatsApp for urgent same-day changes (until UR-14), paper registers where signal is poor (until UR-04), spreadsheets for costs (UR-24), accounting software (exports exist; keep it there) |

---

## 19. Feature rationalisation assessment

| Classification | Features |
|---|---|
| **Retain** | Two-button register with "Mark the rest" and medical notes. Cancellation with automatic notices. Family weekly view. Owner Today. Teacher notes with "to work on". Term-report drafting. Database-enforced permissions. Logged safeguarding access. Office-visible messaging (no private channel). Families import validation. Full data export. Aged debt and accounting export. School switcher. Ask-for-cover. |
| **Refine** | Skills (draft option, scope to the style taught, hide unassessed for the young). Feedback chips (teacher-owned, bulk, age sets). Public join page (suitability, price, confirmation). Waiting list (capacity-safe offers). Events for parents (per child, correct counts). Practice log (saved state). Reports (consistent definitions, location filter). Calendar subscription (plain-language setup). Today card wording. |
| **Redesign** | Offline register behaviour (a queue that actually engages, conflict-safe). Refunds (credit notes, not reopened debt). Guardian model for shared care (per-guardian permissions). Invitation linking (existing records). Billing-run duplicate detection (by period and family, not class link). |
| **Add** | Consent capture and withdrawal. Office and DSL concern entry. Parent approval of teen logins. Adult accounts. Unified diary. Upcoming costs. Progress history. Retention report. Audit-history screen. Make-up offers. Cover clash check. Out-of-app delivery (connect). |
| **Consolidate** | Pipeline drag board and "Move to" dropdown (keep one). Enquiries, trials and enrolment into one record. Student timeline grouped by style and date. Notices that duplicate an event (link a notice to its event). |
| **Remove / hide** | Studio Pulse until it has enough data. "Your child's age" for adult classes. Empty skill grids for children not being tracked. Misleading "Retry" and "Pay" labels while payments are not connected. Hard-coded "sample data" onboarding text for new schools. |
| **Defer** | Video feedback and submissions. Badges. Multi-school consolidated owner view. Bank-reconciliation import. Custom roles. Competition running orders. |

**Looks attractive but is unlikely to be valued yet.** Studio Pulse composite score, the six-month trend table, and video feedback. Each adds complexity before the basics work; the panel would not miss them now.

---

## 20. Adoption and retention assessment

| Group | Would adopt? | Would continue? | What would stop them | What would keep them |
|---|---|---|---|---|
| Students (13+) | Amir: yes (8). Sofia: probably (6). Adults: no, there is no account | Medium: a diary and notifications are needed to bring them back | Nothing new between classes; exams missing | Feedback and goals; unified diary; progress history |
| Parents | Most yes (Hannah 8, Kemi 7); Daniel no (4) | Medium | No alerts outside the app; can't pay; shared-care privacy | Family week; cancellations; costs forecast |
| Teachers | Yes for the register (5–7); Maureen hesitant (4) | Medium | Offline failure; feedback workload | Register; quick, bulk feedback; cover |
| Administrators | Yes in principle (6–7); finance no (4) until money is fixed | Good (5–7) once it works | Student edit crash; billing errors | Today queue; search; linked enquiries |
| Owners | Small 3, growing 6, multi-site 3, switching 2 | 5–7 | Class creation; payments not connected; migration; single-site reports | Time saved by billing runs, Today, family self-service |

**Would owners pay?**
- **Not yet.** The panel would not pay for the current build.
- **After Phases 1–2, plus payments and email connected:** small and growing owners said they would trial it seriously.
- **Multi-site and switching owners** need Phase 4 (location reporting, migration) first.

No price or willingness-to-pay figures were collected; plan prices in `/platform/plans` are demo values.

---

## 21. Competitor switching and migration assessment

**Verified and unverified.** No competitor product was examined. Statements about what established platforms do are **assumptions**, and none are used to justify a recommendation.

**What Swayvo replaces today, after Phase 1.**

| Current tool | Replace? | Notes |
|---|---|---|
| Paper registers | Yes where online | Not where signal is poor, until UR-04 |
| Spreadsheets of families and classes | Yes | Import exists for families; classes must be created by hand (and creation is broken: UR-01) |
| WhatsApp groups | Partly | In-app notices replace announcements, but only once delivery is connected (UR-14). Same-day urgent changes will stay on WhatsApp until push or SMS works |
| Email | Partly | Same dependency |
| Accounting software | No (by design) | Accounting export feeds it |
| Calendar apps | Feeds them | Calendar subscription; plain-language setup needed |
| Existing management platform | Not yet | See barriers below |

**Switching barriers (from scenario 36, observed).**
- **Families import.** Only families, children, a second parent, emergency contact, medical, photo consent and class enrolment are imported. Limit: 2,000 rows; all-or-nothing.
- **Not imported:**
  - timetable;
  - staff;
  - opening balances and credit;
  - invoice and payment history;
  - attendance;
  - progress and exams;
  - Direct Debit mandates.
- **Silent data loss.** Unmapped columns (e.g. balance owed, mandate) are dropped without warning.
- **Manual invitations.** Invitations for staff and parents must be sent by hand: no email.
- **Payment arrangements.** Recurring payment arrangements cannot be carried over (no Direct Debit).

**Minimum capabilities to make switching practical.** In order:
1. Class creation works (UR-01).
2. Timetable import (UR-32).
3. Opening balances and credit import (UR-32).
4. Unmapped-column warning (UR-32).
5. Email invitations in bulk (UR-14).
6. Direct Debit mandate migration or re-collection flow (UR-15; depends on provider, R-006).
7. Attendance and progress history import: optional, can follow.

**Exit route.** The full export (JSON plus CSV) is a reasonable exit route, and switching owners valued it. It should include safeguarding records for the DSL (UR-29).

---

## 22. Panel consensus and disagreements

**Strong agreement (all groups).**
1. The register and cancellation flows are the best things in the product. Protect them.
2. The app must stop saying things that are not true: absence promise, "Pay", medical-visibility text, onboarding copy.
3. Out-of-app delivery is a precondition for replacing WhatsApp and email.
4. Defects that silently give a wrong result are worse than missing features. Examples: refund debt, overwritten absence, discount that won't end.

**Partial agreement.**
- **Progress tracking is the differentiator.** Students 2 and 5, coach 13 and parents 6 and 7 agree; owners see it as a selling point. But depth must vary by age and ambition.
- **Payments:** everyone wants cards or Direct Debit. Several parents also want bank transfer kept.

**Significant disagreements.**

| Topic | Perspectives | Why they differ | Underlying need | Recommended approach |
|---|---|---|---|---|
| **Depth of progress tracking** | Sofia (5) and Tomás (13) want finer levels, history and drafts. Maya (1), Gwen (14) and Maureen (15) want less, or none, for young or recreational dancers | Ambition and age differ | Encouragement for all; detail for some | Per-class "tracking depth": Notes only / Notes + skills / Full (skills, goals, history). Default by class age band. Never show empty grids |
| **Parental visibility vs teen privacy** | Parents want to see everything about their child. Amir (2) values private reflection | Autonomy at 15–17 vs parental responsibility | Safety and support for parents; ownership for teens | Keep: teacher feedback and attendance visible to guardians; student reflections private by default (current). Add: parents approve or switch off teen logins (UR-16) |
| **Shared family view vs per-guardian privacy** | Hannah (7) wants one shared view. Daniel (10) needs privacy from his ex | Family circumstances | Convenience vs safety | Shared by default. Each guardian's messages to the school private by default. Office can set restrictions (no contact, collection not permitted) per guardian (UR-17) |
| **Instant vs draft publishing of skills** | Siân (11): instant is fine. Tomás (13): drafts | Workflow style; fear of public mistakes | Speed vs accuracy | School setting; default "draft, publish with the share step" (UR-48) |
| **Notifications: more vs fewer** | Kemi (6) wants push for everything urgent. Pauline (9) fears overload | Tech comfort | Not missing urgent things | Urgent always pushed; everything else follows preferences and a daily digest (digest already exists in 0041) |
| **Simplicity vs multi-site configuration** | Small owner (19) vs multi-site owner (21) | School size | Fit for purpose | Location features appear only when a school has more than one location; no new settings for single-site schools |
| **Volume vs quality of teacher feedback** | Owners want more feedback shared. Teachers fear unpaid admin | Different incentives | Visible value without extra hours | Bulk chips and term-report drafting first (UR-44); never require per-child notes; show the time saved |

**Unintended-consequence watch.**
- **More parent visibility** could deter honest teacher notes. Keep "to work on" language encouraging.
- **Push for every notice** risks fatigue. Default to urgent-only push.
- **Location-scoped roles** risk misconfiguration. Owners should see an "effective access" summary.

---

## 23. Prioritised product improvement register

**Priority levels.**
- **P0:** prevents safe, reliable or effective use.
- **P1:** significant need or adoption barrier.
- **P2:** valuable enhancement.
- **P3:** optional or later.

**Complexity.** Sizes run XS / S / M / L / XL. They are estimated from the existing code; "?" marks uncertainty. No time estimates are given.

**Supporters.** Panel members who raised the underlying problem. Reviewer-found defects count the persona whose scenario exposed them.

**Specifications.** For P0 and P1 items, detailed functional requirements, workflow, business rules, edge cases and acceptance criteria are in **§24**. The register gives the remaining fields.

### 23.1 Summary

| ID | Title | Area / screen | P | Size | Groups | Supporters (n) |
|---|---|---|---|---|---|---|
| UR-01 | Class creation works | `/classes` New class; `repos/classes.ts` | P0 | XS | Owners, admins | 19, 20, 21 (3) |
| UR-02 | Student details can be edited | `/people` student sheet; `people-sheets.tsx` | P0 | XS–S | Admins | 16 (1) |
| UR-03 | Invitations link existing guardian records | `/invite`; `accept_invitation` | P0 | S | Parents, students, admins | 3, 10, 23, 24 (4) |
| UR-04 | Offline-safe register | `/teach/register`; `providers.tsx`; `sw.js` | P0 | M | Teachers, DSL | 11, 12, 14, 15 (4) |
| UR-05 | Guardians edit only their own details | `/family/children` Your details; RLS | P0 | S | Parents, DSL | 10, 24 (2) |
| UR-06 | Public adult booking never attaches to a child; age limits enforced | `/join` adult drop-in; `public_adult_drop_in` | P0 | S | Prospects, parents, finance | 3, 23 (2) |
| UR-07 | Absence reports reach the session, register and teacher | `/family/children` absence; `/teach` | P0 | M | Parents, teachers | 6, 9, 14, 2 (4) |
| UR-08 | Consent capture and withdrawal with history | Family, office, teacher brief | P0 | M | DSL, parents | 6, 24 (2) |
| UR-09 | Office and DSL can raise concerns, incl. about adults | `/people` student sheet, `/safeguarding` | P0 | S–M | DSL, admins | 24 (1) |
| UR-10 | Billing integrity: credit notes, run guard, discount end, credit UI | `/billing` | P0 | M–L | Finance, parents | 17 (1) |
| UR-11 | The app says only true things | Several screens | P0 | XS | All | 6, 9, 19, 24 (4) |
| UR-12 | Safeguarding legal hold in retention | `apply_retention` (0040) | P1 | S (+specialist) | DSL | 24 (1) |
| UR-13 | Real sign-in and account recovery | Platform (R-001, R-002) | P0 for real use | L | All | 24 + all implicitly |
| UR-14 | Out-of-app delivery: email invitations, notices, push | Notifications (R-003) | P1 | L | All | 2, 6, 8, 18, 19, 22 (+16) (7) |
| UR-15 | Card and Direct Debit payments | `/family/payments`, billing (R-006) | P1 | L–XL | Parents, finance, owners | 9, 17, 19, 20 (4) |
| UR-16 | Parents approve or switch off teen logins; age setting | `/family/children`, `/studio` | P1 | S–M | DSL, parents, students | 24, 1, 2 (3) |
| UR-17 | Shared-care privacy and collection permissions | Family model, messages | P1 | L | Parents, DSL, teachers | 10, 14, 24 (3) |
| UR-18 | Enquiry → trial → enrolment linked | `/enrolment`, trial booking | P1 | S–M | Admins | 16, 18 (2) |
| UR-19 | Waiting-list offers respect capacity | `/enrolment` waiting list | P1 | S | Admins | 16 (1) |
| UR-20 | Class suitability, price and confirmation on `/join` | `/join` | P1 | M | Prospects, reception | 4, 16, 18, 23 (4) |
| UR-21 | Adult student accounts | Accounts, `/learn` | P1 | L | Adult students | 3, 4 (2) |
| UR-22 | Complete payment instructions; honest "Pay" | `/family/payments`, `/family` | P1 | XS–S | Parents | 7, 9 (2) |
| UR-23 | In-app notifications for invoices and new feedback | Bell, notifications | P1 | S | Parents | 6, 8 (2) |
| UR-24 | Upcoming costs per family and child; privates billed | `/family/payments`, events | P1 | M | Parents | 7, 8 (2) |
| UR-25 | Feedback edits keep saved content; previous feedback at the door | `/teach/feedback`, register | P1 | S–M | Teachers, students | 11, 13 (2) |
| UR-26 | One diary: classes, rehearsals, events, exams (family and student) | `/family/schedule`, `/learn/timetable` | P1 | M | Students, parents | 2, 5, 7 (3) |
| UR-27 | Cover clash check and handover note | Session sheet, `cover_session` | P1 | M | Teachers, admins | 12 (1) |
| UR-28 | Safeguarding access log counts each look once | `/safeguarding` | P1 | XS–S | DSL, owners | 24 (1) |
| UR-29 | DSL-only safeguarding export | `/account` export | P2 | S | DSL, owners | 24, 22 (2) |
| UR-30 | Text scales with the user's settings | Global styles | P1 | M | Accessibility | 3, 9, 23 (3) |
| UR-31 | Sheets trap and return keyboard focus | `record-sheet.tsx` | P1 | S | Accessibility | 24 (1) |
| UR-32 | Migration toolkit: timetable, balances, unmapped warning | `/people?import=1` | P1 | L | Switching owners | 22 (1) |
| UR-33 | Location dimension in reports, lists and roles | `/reports`, `/classes`, roles | P2 | M–L | Multi-site owners | 21 (1) |
| UR-34 | Term-on-term retention report | `/reports` | P2 | M | Owners | 20 (1) |
| UR-35 | Audit and access history screen; log medical reads | `/account`, records | P1 | S–M | Owners, admins, DSL | 16, 21 (2) |
| UR-36 | Trial families told when their session is cancelled | `cancel_session` | P1 | XS | Prospects, admins | 16 (1) |
| UR-37 | Register date guard | Register, `close_register` | P1 | XS–S | Teachers | 15 (1) |
| UR-38 | "Who can see what" page and family data requests | `/family`, `/account` | P1 | M | DSL, parents | 24 (1) |
| UR-39 | Plan limits as notices with an upgrade request | `/studio` locations etc. | P2 | XS | Owners | 21 (1) |
| UR-40 | Form errors visible where the user is looking | Class form and sheets | P2 | XS–S | Owners, admins | 19 (1) |
| UR-41 | Staff checks visible to DSL and admin; "no check" warning | `/account` staff checks | P2 | S | DSL | 24 (1) |
| UR-42 | Medical and consent capture at trial booking | `/join` | P2 | S–M | DSL, teachers | 23, 24 (2) |
| UR-43 | Progress history over time; feedback linked to resources | `/learn/feedback`, `/family/feedback` | P2 | M | Students, teachers | 5, 13, 2 (3) |
| UR-44 | Bulk, teacher-owned and age-appropriate feedback chips | `/teach/feedback` | P2 | M | Teachers | 11, 14 (2) |
| UR-45 | Support-needs view for teachers | `/teach/students` | P2 | M | Teachers | 11, 14 (2) |
| UR-46 | Bulk actions from filtered lists (reminders, messages) | `/billing`, `/people` | P2 | M | Admins, finance | 16, 17 (2) |
| UR-47 | Cross-school personal agenda | `/teach` | P2 | M–L? | Freelance teachers | 12 (1) |
| UR-48 | Draft-then-publish skill levels; scope to style taught | Skill panel | P2 | S | Teachers | 13 (1) |
| UR-49 | Student "can't make it" (13+) and student bell | `/learn` | P2 | S | Students | 2 (1) |
| UR-50 | Events: per-child status, correct places, volunteer rota | `/events`, `/family/events` | P2 | M | Parents, owners | 8, 20 (2) |
| UR-51 | Under-filled classes view | `/reports` or `/classes` | P2 | S | Owners | 20 (1) |
| UR-52 | "Move to another class" as a first-class action | Student sheet | P2 | S | Admins | 16 (1) |
| UR-53 | Guided first timetable for new schools | `/onboarding` | P2 | S | Owners | 19 (1) |
| UR-54 | Small correctness and copy fixes bundle | Various | P3 | S | All | Many |
| UR-55 | Tracking depth per class; hide unassessed; under-13 parent-led view | Progress | P2 | S–M | Students, parents, teachers | 1, 6, 14 (3) |
| UR-56 | Make-up classes and cancellation follow-ups | Sessions, credit | P2 | M–L | Parents, admins | 6, 16 (2) |
| UR-57 | Duplicate family detection and merge | `/people` | P2 | M | Admins | 18 (1) |
| UR-58 | Absence as a welfare signal | `/safeguarding`, reports | P2 | M | DSL | 24 (1) |
| UR-59 | Multi-school consolidated owner view | Platform/owner | P3 | L | Multi-site owners | 21 (1) |
| UR-60 | Video feedback and submissions | Progress | P3 (defer) | XL? | Students, coaches | 5, 13 (2) |
| UR-61 | Bank-reconciliation import | `/billing` | P3 (defer) | L? | Finance | 17 (1) |

### 23.2 Register detail (fields not covered in §24)

For each P0 and P1 item below, the fields are:
- **Issue / evidence**
- **Benefit (user / business)**
- **Frequency**
- **Dependencies**
- **Risks**

Functional requirements and acceptance criteria are in §24.

**UR-01 Class creation works.**
- **Issue / evidence:** `CREATE_CLASS` names `pricing` twice (25 columns for 24 values), so every create fails with "column pricing specified more than once" (owners D1; `owners-13`; scenario 31 dead end after 32 interactions). Coordinator confirmed at `src/lib/repos/classes.ts:119–128`.
- **Benefit:** a new school can build a timetable at all; existing schools stop duplicating classes as a workaround.
- **Frequency:** setup and every term.
- **Dependencies:** none.
- **Risks:** none. There is no test covering the UI create path, so add one.

**UR-02 Student details can be edited.**
- **Issue / evidence:** "Edit details" crashes: `row?.date_of_birth?.slice is not a function`. The database returns a Date object (admins D1; `admins-21`; `people-sheets.tsx:143`; `left_on` has the same pattern).
- **Benefit:** records can be corrected, which is a GDPR accuracy duty.
- **Frequency:** weekly.
- **Dependencies:** none.
- **Risks:** other `.slice` calls on date fields elsewhere; audit them all.

**UR-03 Invitations link existing guardian records.**
- **Issue / evidence:** `app.accept_invitation` (0019:640–643) updates `guardian.user_id`, which the `guardian_self_edit_guard` trigger (0023:333–344) forbids for non-admins. So any parent, trial parent or adult already on file cannot accept (parents D1, students D2; `parents-10`, `students-16`).
- **Benefit:** second parents and every converted trial or adult get a login.
- **Frequency:** every onboarding.
- **Dependencies:** UR-14 (email) for scale.
- **Risks:** loosening the guard too far. The exception must be limited to the invitation path.

**UR-04 Offline-safe register.**
- **Issue / evidence:** offline marks don't show and the queue never engages. "Mark the rest" later overwrote an absence. Opening a register offline ends on an error page (teachers D1–D3; `teachers-04` to `teachers-07`; `providers.tsx:12–16`, `register/page.tsx:66–101`, `public/sw.js:24–27`).
- **Benefit:** a trustworthy safety register in poor-signal venues.
- **Frequency:** every class.
- **Dependencies:** hosted sync design (ARCHITECTURE.md). Verify again once hosted.
- **Risks:** conflict rules must be explicit (§24).

**UR-05 Guardians edit only their own details.**
- **Issue / evidence:** RLS `guardian_self_update` is family-wide (0006:166). The edit button shows for every guardian (`family-details.tsx:42`). `is_primary` and `receives_billing` are not guarded (parents D3, DSL D-11; `parents-11`, `safeguarding-14`).
- **Benefit:** separated families are safe.
- **Frequency:** rare, but the harm is severe.
- **Dependencies:** none.
- **Risks:** families who relied on one parent updating both records. Route those changes through a request instead.

**UR-06 Public adult booking integrity.**
- **Issue / evidence:** `public_adult_drop_in` (0040) attaches the booking to the *first child* of a family matched by email. `book_drop_in_unchecked` ignores `age_min`. A 15-year-old was booked into an 18+ class and invoiced (students D1; `students-15`).
- **Benefit:** correct bookings and bills; child safety in adult classes.
- **Frequency:** every adult booking.
- **Dependencies:** UR-21 for the long-term adult model.
- **Risks:** duplicate adult records. Prefer an "adult participant" record over reusing children.

**UR-07 Absence reports reach the session.**
- **Issue / evidence:** `REPORT_ABSENCE` (`family.ts:94`) inserts a message only. The dialog promises "The teacher will see it before class" (parents D2; `parents-03b`, `parents-18`). Coordinator confirmed.
- **Benefit:** teachers know who's missing; fewer welfare false alarms; registers are pre-filled.
- **Frequency:** weekly per family.
- **Dependencies:** none (attendance status `excused` exists).
- **Risks:** a parent reports the wrong date. Allow the parent to withdraw the report before class.

**UR-08 Consent management.**
- **Issue / evidence:** no screen writes `consent_record`. Children added via the UI stay "Not recorded" for ever. Teachers keep seeing "Photos allowed" after a withdrawal request (DSL D-02; `safeguarding-15`). There is also a latent subquery fault (D-07).
- **Benefit:** a lawful, safe photo and video practice.
- **Frequency:** at joining and occasionally after.
- **Dependencies:** fix D-07 in the same change.
- **Risks:** consent kinds vary by school. Make them configurable later; start with photography, video, social media and trial medical.

**UR-09 Office and DSL can raise concerns.**
- **Issue / evidence:** `RaiseConcernSheet` is used only on teacher pages (`teach/students/page.tsx:146`). `app.raise_concern` already allows any staff member. There is no route for concerns about adults or staff (DSL D-01; `safeguarding-10`).
- **Benefit:** disclosures at the desk are recorded properly.
- **Frequency:** rare; critical when it happens.
- **Dependencies:** none.
- **Risks:** allegations about staff need restricted visibility (§24).

**UR-10 Billing integrity.**
- **Issue / evidence:** (admins D2, D6, D7, D8; `admins-15`, `admins-17`, `admins-18`; coordinator confirmed the refund arithmetic and the discount policy.)
  - A refund reopens a paid invoice as overdue debt.
  - A billing run re-bills an already-invoiced term (27 drafts, £6,376.33) because the duplicate check relies on class-linked invoice lines.
  - Ending a discount fails silently, because the RLS `using (deleted_at is null)` blocks the RETURNING clause.
  - No UI exists for goodwill credit, which `PAYMENTS.md` claims.
- **Benefit:** trustworthy money; finance would adopt.
- **Frequency:** termly runs; monthly refunds.
- **Dependencies:** UR-15 later (card refunds).
- **Risks:** migrating existing refund semantics. Write data-correction notes.

**UR-11 The app says only true things.**
- **Issue / evidence:** four false statements:
  - "The teacher will see it before class" (until UR-07 ships);
  - "Teachers see allergies and the emergency plan only" (`family/children/page.tsx`, `people/page.tsx:43`; DSL D-04);
  - "Pay £97.00" on a button that cannot pay (parents D5);
  - "This school was created with sample data" shown to a new school (`onboarding/page.tsx:149–152`; owners D3).

  Also: `PAYMENTS.md` claims goodwill credit works.
- **Benefit:** trust; possible privacy-notice accuracy.
- **Frequency:** constant.
- **Dependencies:** none.
- **Risks:** none.

**UR-12 Safeguarding legal hold.**
- **Issue / evidence:** `apply_retention` (0040) anonymises leavers after the retention period without checking `safeguarding_concern` (DSL D-10, code-confirmed).
- **Benefit:** the chronology stays attributable.
- **Frequency:** periodic job.
- **Dependencies:** specialist advice on periods.
- **Risks:** over-retention. Make the hold explicit and reviewable.

**UR-13 Real sign-in.**
- **Issue / evidence:** the demo person picker only. R-001 and R-002 are undecided.
- **Benefit:** any real use at all.
- **Dependencies:** owner decisions on provider and hosting.
- **Risks:** account recovery for low-confidence users. Email-link sign-in suits them best.

**UR-14 Out-of-app delivery.**
- **Issue / evidence:** notices are in-app only; invitations are links copied by hand (`InviteLink` says so); preferences and a daily digest exist but cannot deliver (R-003).
- **Benefit:** this is what replaces WhatsApp and email.
- **Frequency:** daily.
- **Dependencies:** R-003 provider; UR-13.
- **Risks:** notification fatigue. Default push to urgent only.

**UR-15 Payments.**
- **Issue / evidence:** cards and Direct Debit are not connected (R-006); "Retry" labels mislead.
- **Benefit:** collection rates; this is the main reason owners pay.
- **Dependencies:** R-006; UR-10 first.
- **Risks:** money movement. Test mode first; approval before live.

**UR-16 Teen login approval.**
- **Issue / evidence:** the office invite says "login stays off until a parent approves", but no parent UI exists. Parents also cannot switch a login off. `student_login_min_age` has no settings UI (DSL D-09).
- **Dependencies:** UR-14 for invitations.
- **Risks:** families disagreeing. Either guardian can switch it off; turning it on needs one guardian.

**UR-17 Shared-care privacy.**
- **Issue / evidence:**
  - Daniel can read Hannah's private messages to the studio (`parents-15`).
  - Daniel cannot be given restricted access.
  - There are no collection permissions.
  - There is no split billing.

  (parents R4; DSL notes.)
- **Dependencies:** UR-03, UR-05.
- **Risks:** complexity for ordinary families. Defaults must stay as today.

**UR-18 Enquiry linkage.**
- **Issue / evidence:** `app.book_trial` accepts `enquiry_id`, but no UI passes it (admins D3).
- **Benefit:** no re-typing; a true funnel.
- **Frequency:** daily.

**UR-19 Safe waiting-list offers.**
- **Issue / evidence:** two offers can be outstanding for one place (admins D4; `offer_waitlist_place` 0015:51). The picker lists all students, including the wrong age (D10).
- **Frequency:** weekly at busy times.

**UR-20 Public suitability and price.**
- **Issue / evidence:**
  - no description or "what to expect";
  - no ongoing price;
  - a thin confirmation;
  - an adult sees "Your child's age" (`students-13`).
- **Benefit:** conversion and fewer phone calls.
- **Frequency:** every new customer.

**UR-21 Adult accounts.**
- **Issue / evidence:** adults are modelled only as guardians or drop-in families. There is no login path (UR-03) and no "my bookings".
- **Dependencies:** UR-03, UR-06, UR-13.
- **Risks:** data model change. Size uncertain (L?).

**UR-22 Payment instructions.**
- **Issue / evidence:** the reference is shown without payee, sort code or account (parents D4).
- **Frequency:** every invoice.

**UR-23 Invoice and feedback notifications.**
- **Issue / evidence:** billing an event fee produced "Nothing new" in the parent's bell (parents D6).

**UR-24 Upcoming costs.**
- **Issue / evidence:** there is no forecast, and a confirmed £30 private lesson was never billed (parents D9).
- **Dependencies:** event fees, privates, costumes.

**UR-25 Feedback editing and history at the door.**
- **Issue / evidence:** reopening saved or shared feedback shows empty chips, and saving replaces the earlier content (teachers D4; `teachers-10`; `0029:193–196`). Previous notes are not visible from the register.
- **Risks:** families see silently changed shared text. Mark edits as edited.

**UR-26 One diary.**
- **Issue / evidence:**
  - rehearsals, events and exams are absent from `/learn/timetable` and `/family/schedule`;
  - students cannot see exam entries, although RLS allows it (students D3);
  - "All feedback" opens the wrong child (parents D14).
- **Frequency:** weekly.

**UR-27 Cover clash check.**
- **Issue / evidence:** `cover_session` has no availability check. Priya was seeded covering 16:30 Greenwich while teaching 16:00–16:45 Blackheath, with no warning (teachers D5).

**UR-28 Access log integrity.**
- **Issue / evidence:** one open is logged twice after an action (DSL D-03; `safeguarding-11`).

**UR-30 Text scaling.**
- **Issue / evidence:** fixed px sizes. With the root font at 200%, 0 of 60 sampled elements changed (students D4, parents D12; `students-08`). This is a WCAG 1.4.4 risk.
- **Frequency:** every visit for affected users.
- **Risks:** layout overflow. Re-run the 320px and 360px overflow checks.

**UR-31 Focus management.**
- **Issue / evidence:** sheets don't contain focus, and Escape leaves focus on `<body>` (DSL D-08; `record-sheet.tsx:36–56`).

**UR-32 Migration toolkit.**
- **Issue / evidence:** the import covers families only; unmapped columns are dropped silently (owners D5; scenario 36).
- **Frequency:** once per school, but decisive for switching.
- **Risks:** mapping errors. Validate everything; all-or-nothing, as today.

**UR-35 Audit and access history.**
- **Issue / evidence:** owners can read `audit_log` under RLS, but there is no screen; medical reads are not logged (owners scenario 37).

**UR-36 Trial families notified of cancellations.**
- **Issue / evidence:** `cancel_session` sets trials to cancelled *before* `announce_session` selects booked trials (admins D5; 0023:156, 192–193). Code-confirmed, not driven.

**UR-37 Register date guard.**
- **Issue / evidence:** Tuesday's register was marked and closed on Friday (teachers D6).

**UR-38 Who can see what and data requests.**
- **Issue / evidence:** there is no accurate visibility explanation, and no family data download or erasure request (DSL S3: partial).
- **Dependencies:** UR-11 copy fixes; specialist review of the process.

### 23.3 P2 and P3 details

Each entry gives: issue → improvement · groups · benefit · frequency · dependencies · risks · acceptance.

- **UR-29 DSL-only safeguarding export.**
  - **Issue → improvement:** the school export omits concerns, actions, staff checks and audit (D-05) → add a separate export, available only to the DSL and owner, that is itself logged.
  - **Benefit:** leaving schools keep their chronology.
  - **Frequency:** rare.
  - **Risks:** data leakage. Log it and require re-confirmation.
  - **Acceptance:** an export by the DSL includes all four record types; the export is listed in the access log; an admin cannot run it.
- **UR-33 Location dimension.**
  - **Improvement:** a location filter on `/reports`, `/classes`, `/schedule` and billing; per-location comparison (fill, attendance, revenue); optional location-scoped admin and teacher roles.
  - **Groups:** multi-site owners.
  - **Risks:** clutter for single-site schools. Show only when there is more than one location.
  - **Acceptance:** with 2+ locations, every report can be filtered and compared; with one location, there is no visible change.
- **UR-34 Retention report.**
  - **Improvement:** term-on-term continuing, new and lapsed students, by class, style and age band, with a list of lapsed students to contact.
  - **Data:** enrolment start and end dates already exist.
  - **Acceptance:** the numbers reconcile with enrolment records for a seeded term; lapsed students are listed with their last class.
- **UR-39 Plan limits as notices.**
  - **Improvement:** a plan limit shows a calm notice with "Ask to upgrade" instead of the error state (`owners-12`).
  - **Acceptance:** adding a location over the limit shows the notice, with no error styling.
- **UR-40 Visible form errors.**
  - **Improvement:** scroll to the first error and show it beside the action button (owners D2).
  - **Acceptance:** after a failing Save, the error is visible in the viewport without scrolling.
- **UR-41 Staff checks for DSL and admin.**
  - **Improvement:** read access for the DSL; a "No DBS on file" or "expires in 30 days" warning on Today.
  - **Acceptance:** the DSL sees the list; expiring checks appear on Today for the owner and DSL.
- **UR-42 Trial safety capture.**
  - **Improvement:** `/join` asks for allergies or medical info and an emergency contact for the child, plus photo consent; the teacher's brief shows them for trials.
  - **Acceptance:** a trial booked with an allergy shows it on the register.
- **UR-43 Progress history.**
  - **Improvement:**
    - per skill, a dated history of levels;
    - per student, a "Then and now" over a chosen period (e.g. 3 months);
    - notes grouped by style;
    - "to work on" items can link to library resources.
  - **Groups:** students 13+, coaches, parents.
  - **Risks:** turning dance into grades. Respect UR-55 tracking depth.
  - **Acceptance:** after three assessments of one skill over time, the student sees all three with dates.
- **UR-44 Feedback chips.**
  - **Improvement:**
    - teachers keep their own chip set per class;
    - age-band presets (stickers and simple words for under-8s);
    - "apply to selected children";
    - "same as last week".
  - **Acceptance:** a class of 12 can receive the same chip set in at most 5 interactions; target ≥50% fewer interactions than today's 41.
- **UR-45 Support-needs view.**
  - **Improvement:** a teacher list of their students filtered by recent absence streaks, "not yet" skills, medical flags and SEN notes (office-set).
  - **Risks:** labelling children. Keep it private to staff.
- **UR-46 Bulk actions.**
  - **Improvement:** from a filtered list (overdue, class, lapsed), send a reminder or message to all, with a preview.
  - **Acceptance:** 10 overdue families receive one reminder each, logged per family.
- **UR-47 Cross-school agenda.**
  - **Improvement:** one personal agenda across schools where the teacher has accepted each school's role, showing school name and site, with no data crossing between schools.
  - **Size:** uncertain (needs a cross-tenant query design).
- **UR-48 Draft skills.**
  - **Improvement:** a school setting for skill levels to publish immediately or with the share step (default: with share); the panel shows only styles the teacher teaches (D11).
- **UR-49 Student "can't make it" and bell.**
  - **Improvement:** students 13+ report an absence, which notifies guardians and the studio; students get a bell for cancellations and cover.
- **UR-50 Events.**
  - **Improvement:**
    - per-child status;
    - correct places count (via a security-definer count function);
    - the child named on entries;
    - a volunteer rota with sign-up slots;
    - notices linked to events.
- **UR-51 Under-filled classes.**
  - **Improvement:** a filter "below X% full", with trend and waiting-list size.
- **UR-52 Move student.**
  - **Improvement:** "Move to another class" as its own action, with notice to the family and a billing hint (pro-rata note).
- **UR-53 Guided first timetable.**
  - **Improvement:** onboarding step "Add your first classes", with a weekly grid entry and a copy-week function.
  - **Acceptance:** a new school creates 5 classes from onboarding without visiting `/classes`.
- **UR-54 Small fixes bundle.**
  - **Fixes:**
    - out-of-age class requests warned (parents D10);
    - "All feedback" opens the right child (D14);
    - "no registers%" (owners D7);
    - import template name `barre-` → `swayvo-` (owners D9);
    - truncated phone headers (owners D10, teachers D10);
    - stale session link message (teachers D7, DSL D-06);
    - attendance "this term" label (teachers D8);
    - Today failed-card label (admins D11);
    - funnel definitions (admins D13);
    - invoice status consistency (admins D14);
    - practice-log saved state (students D5);
    - safeguarding loading state (owners D6);
    - trial outcomes not recordable before the trial (admins D9);
    - late or excused rows collapse after marking (teachers D13);
    - trial and drop-in children can receive class feedback (teachers D12).
  - **Acceptance:** each item is reproduced as fixed.
- **UR-55 Tracking depth.**
  - **Improvement:**
    - per-class depth setting: Notes / Notes + skills / Full;
    - never show grids of unassessed skills, only assessed ones plus "more to come";
    - under-13s get a parent-led "share with my child" view, not their own login;
    - families can opt a child out of skill tracking.
  - **Risks:** lost differentiation if overused. The default by age band handles this.
- **UR-56 Make-up classes.**
  - **Improvement:** when a session is cancelled or a child is reported absent (UR-07), offer a make-up in a suitable class with space, or credit, per school policy.
  - **Size:** M–L (policy rules).
- **UR-57 Duplicate families.**
  - **Improvement:** detect likely duplicates (email, phone, surname and children) and offer a merge with a preview.
  - **Risks:** a wrong merge. Make it reversible within 30 days.
- **UR-58 Absence as a welfare signal.**
  - **Improvement:** the DSL can see unexplained absence streaks (e.g. 3 consecutive) for children flagged as monitored.
  - **Risks:** over-surveillance. Make it opt-in per child, by the DSL.
- **UR-59 Multi-school consolidated owner view (P3).** One owner across several schools sees combined Today and reports.
- **UR-60 Video feedback (P3, defer).** Needs consent (UR-08) and a storage and safeguarding policy first.
- **UR-61 Bank-reconciliation import (P3, defer).** Import a bank CSV and match it to references. Value depends on R-006: if Direct Debit is adopted, the need shrinks.

---

## 24. Detailed functional specifications for priority improvements

**Applies to every spec below.**
- Specs describe behaviour, not architecture.
- File names are where the current behaviour lives, as found in this review.
- Every change must keep the database-enforced permission model: rules go in the database (RLS and `app.*` functions), not only in screens.
- Every change adds automated tests in `barre/tests/`.

### UR-01 Class creation works (P0, XS)

**Problem.** Every attempt to create a class fails with a database error. A new school cannot build a timetable (scenario 31).

**User story.** As a school owner, I want to create a class, so that I can build my timetable.

**Functional requirements.**
1. `CREATE_CLASS` (`src/lib/repos/classes.ts`) inserts each column once, and the column list matches the value list.
2. The created class generates its sessions for the term, exactly as Duplicate does today.
3. Errors from the form are shown in view (see UR-40).

**Business rules.** Unchanged: capacity, age range, pricing model and visibility, as in the form.

**Edge cases.**
- A class with no room.
- Trials disabled.
- Pricing "drop_in" with no term price.

**Acceptance criteria.**
- In the owner and admin roles, New class → fill required fields → Create class succeeds, the class appears in `/classes` and its sessions appear in `/schedule`.
- An automated test creates a class through the same SQL string the UI uses.
- A brand-new school (`/platform` → invite → `/onboarding`) can create its first class.

**Outcome.** Schools can start; the Duplicate-and-Edit workaround is no longer needed.

### UR-02 Student details can be edited (P0, XS–S)

**Problem.** Opening "Edit details" on any student crashes. Office staff cannot correct names or dates of birth.

**User story.** As an administrator, I want to correct a student's details, so that our records are accurate.

**Functional requirements.**
1. Date fields from the database are converted to `YYYY-MM-DD` strings before use, whether they arrive as `Date` objects or strings. Covers `date_of_birth` and `left_on` in `people-sheets.tsx` and any similar code.
2. Audit the codebase for `.slice(` on date-typed fields, and use one shared helper (e.g. `toDateInput()` in `lib/format.ts`).

**Edge cases.**
- Null date of birth.
- Dates near midnight in UK summer time: no off-by-one.

**Acceptance criteria.**
- Edit details opens for every seeded student.
- Changing a name and date of birth saves, and the change is shown on reload.
- A unit test covers `toDateInput` for Date, string and null.

### UR-03 Invitations link existing guardian records (P0, S)

**Problem.** A parent whose record the office already holds (a second parent, a trial parent, an adult drop-in) gets "only the office can change who is linked to a family" when accepting their invitation.

**User story.** As a second parent, I want to accept my invitation, so that I can see my children's information.

**Functional requirements.**
1. `app.accept_invitation` links the accepting user to the matching unlinked guardian row (same studio, family and email) without being blocked by `guardian_self_edit_guard`.
2. The exception is narrow: only inside `accept_invitation`, only for setting `user_id` from null to the accepting user, and only where the invitation's family and email match.
   - Implementation option: a transaction-local setting checked by the guard.
3. If no matching row exists, keep today's insert path.
4. After acceptance, the person lands in `/family` (or `/learn` for students) and sees the right children.

**Business rules.**
- One user per guardian row.
- An invitation is single-use and expires as today.
- A row already linked to a different user is never re-linked. Show "This person already has an account; ask the office".

**Edge cases.**
- Email case differences: match case-insensitively.
- Two unlinked rows with the same email: refuse and tell the office.
- The invite is for family A but the email belongs to a guardian in family B: refuse.

**Dependencies.** UR-14 to send invitations by email.

**Acceptance criteria.**
- The scenario in `parents-10` and `students-16` succeeds.
- The guard still rejects a parent changing `user_id`, `family_id`, `studio_id` or `deleted_at` directly.
- Tests cover all the edge cases above.

### UR-04 Offline-safe register (P0, M)

**Problem.** With no connection, register taps show nothing, "Mark the rest" spins, and after reconnecting a queued "Mark the rest" overwrote an absence. A child not in the building was shown as present. Opening a register offline fails to an error page.

**User story.** As a teacher in a hall with no signal, I want every mark I make to show immediately and be kept exactly as I made it, so that the register is a reliable safety record.

**Functional requirements.**
1. **Immediate feedback.** Every Here, Absent, Late or Excused tap shows instantly on screen, online or offline.
2. **Visible state.** When offline, a persistent notice reads: "Offline — n marks saved on this phone, will send when connected". When the marks are sent: "All marks sent".
3. **Durable queue.** Marks are stored on the device (the existing `barre.pending-marks.v1` design) the moment they are made, and survive a reload or app restart.
   - Data-fetching library mutations must not be "paused" silently: use an offline-first network mode for register writes, or bypass the library for them.
4. **"Mark the rest here"** applies only to children with **no mark at all**, including queued marks. It never changes an explicit mark.
5. **Conflict rule on sync.**
   - An explicit mark always beats a "rest" mark, whatever the timestamps.
   - Between two explicit marks, the later device time wins.
   - Each queued item records `marked_at` (device time) and `kind: explicit | rest`.
6. **Opening offline.** `/teach` and today's registers open offline if visited earlier that day.
   - The service worker caches the teacher route shells and needed payloads, and keys navigations correctly with query strings (`public/sw.js`).
7. **"Close register"** while marks are queued: allowed. Closing is itself queued and sent after the marks.

**Business rules.** Attendance statuses as today. Medical notes and emergency contacts must also be available offline for today's classes.

**Edge cases.**
- The same register is marked on two devices (teacher and cover).
- The phone clock is wrong: use the server's received order as a tiebreak when device times are within 2 minutes.
- Connection flaps mid-sync.
- The teacher signs out with marks pending: warn and block sign-out.

**Dependencies.** The hosted sync design (`ARCHITECTURE.md`). Re-verify against the hosted build.

**Acceptance criteria.** Each of these is an automated Playwright test with `context.setOffline(true)`:
1. Mark 2 Here online, go offline, mark 1 Absent, tap Mark the rest, reconnect: 1 Absent and 11 Here on the server.
2. Offline taps are visible within 100 ms.
3. The offline notice shows the pending count.
4. After a reload while offline, pending marks are still there.
5. Opening `/teach` and today's register offline works after an earlier online visit.

**Outcome.** Teachers can rely on Swayvo in any venue, and the fire register is accurate.

### UR-05 Guardians edit only their own details (P0, S)

**Problem.** Any guardian can change another guardian's name, email and phone, and could set the billing and primary flags. In separated families this is a safeguarding risk.

**User story.** As a separated parent, I want only me and the office to be able to change my contact details, so that my ex cannot redirect messages about our children.

**Functional requirements.**
1. Guardians can update **only their own** guardian row (`user_id = auth.uid()`), and only contact fields: name, phone, email, address.
2. `is_primary`, `receives_billing`, `family_id`, `user_id` and `studio_id` are office-only.
3. In `/family/children` → Your details, other guardians are shown read-only, with "Ask the office to change" (creates a request in `/requests`).
4. The office is notified of any contact change a guardian makes to their own record (already designed; verify).

**Edge cases.**
- A guardian without a login, edited by the office only.
- A family with one guardian: unchanged experience.

**Acceptance criteria.**
- As Daniel, editing Hannah's row is not offered, and a direct database update attempt is refused.
- Editing his own phone succeeds.
- `is_primary` cannot be changed by a guardian.
- Tests cover all of these.

### UR-06 Public adult booking integrity (P0, S)

**Problem.** An adult drop-in booked with an email that matches a family books and bills that family's first child. A 15-year-old was booked into an 18+ class.

**User story.** As an adult booking a drop-in, I want the booking to be for me, so that I'm the one booked and billed.

**Functional requirements.**
1. `app.public_adult_drop_in` never attaches a booking to an existing child.
   - If the email matches an existing family, create or reuse an **adult participant** record for that person (see UR-21; until then, a student row flagged as adult, linked to the guardian).
2. Every booking path enforces the class's age limits on the participant's age: drop-in, trial, enrolment and waiting list.
3. The office sees "Booked by public form; matched to existing family X" on the booking.

**Edge cases.**
- Two adults in the same family.
- An adult whose date of birth is unknown: ask for it on the public form for adult classes (18+ confirmation is enough).

**Acceptance criteria.**
- The repro in `students-15` creates a booking for Hannah, not Amir.
- Booking any under-18 into an 18+ class is refused with a clear message.
- Tests cover all of these.

### UR-07 Absence reports reach the session, register and teacher (P0, M)

**Problem.** Parents are told "The teacher will see it before class", but the report is only a message to the office.

**User story.** As a parent, I want my absence report to reach my child's teacher and register, so that nobody worries or waits for my child.

**Functional requirements.**
1. The absence form asks for **child**, **date or date range** and, if there is more than one class that day, **which class**. Only days with classes are offered.
2. Submitting creates an `excused` (pre-reported) attendance for each matching session, with the parent's note.
   - It shows on the teacher's Today card: "Nia — reported absent".
   - It shows on the register, pre-marked "Excused · reported by parent", which the teacher can change.
3. A copy goes to the office inbox, as today.
4. The parent can withdraw the report until the session starts.
5. Confirmation text: "Done. Nia's teacher will see this on the register."

**Business rules.**
- Only the child's own guardians, or the student if 13+ (UR-49), can report.
- Reports for past sessions are not allowed. Use the message instead.

**Edge cases.**
- A session cancelled after the report.
- The child moved class.
- A cover teacher: sees the same pre-mark.

**Acceptance criteria.**
- The `parents-18` repro shows Nia pre-marked on Priya's register, with the note.
- The teacher's Today shows the count.
- Withdrawal removes it.
- Tests cover RLS for reporters.

### UR-08 Consent capture and withdrawal with history (P0, M)

**Problem.** No one can record or withdraw consent in the app. Teachers keep seeing "Photos allowed" after a parent withdraws.

**User story.** As a parent, I want to give or withdraw photo consent for my child at any time, so that the school respects my choice immediately.

**Functional requirements.**
1. Consent kinds to start with: photography (school use), video, social media / public use. Schools can rename them.
2. **Parent:** `/family/children` → child → Consents: a toggle per kind, with a plain explanation.
   - Each change creates a timestamped `consent_record` row (granted or withdrawn, by whom).
   - Withdrawal takes effect immediately.
3. **Office:** the student sheet shows the current consents and their history, and can record a consent given on paper (with a note).
4. **Teachers:** the safety brief and register show the *current* state ("No photos").
   - "Not recorded" is shown explicitly, never hidden (`medical-brief.tsx:103` currently hides null).
5. Fix the latent subquery fault: every "current consent" query uses latest-row-wins (`order by granted_at desc limit 1`) — `people.ts:46`, `family.ts:64`.
6. Joining flows (family import, office-created child, UR-42 trial) set an initial state or "Not recorded".

**Edge cases.**
- Two guardians disagree: the most restrictive current state applies, and the office is alerted.
- A student aged 13+: show their own view read-only. Policy question flagged for the DSL.

**Acceptance criteria.**
- Withdrawal by Hannah updates the teacher's brief on the next load.
- History shows both rows.
- No query errors with multiple rows.
- Tests cover RLS for each role.

### UR-09 Office and DSL can raise concerns, including about adults (P0, S–M)

**Problem.** Disclosures often happen at the desk, but only teachers can raise a concern. There is no route for concerns about staff or other adults.

**User story.** As a receptionist, I want to record a concern a parent tells me about, so that the safeguarding lead sees it straight away.

**Functional requirements.**
1. "Raise a concern" is available from the office student sheet, from `/safeguarding`, and from the staff record. It reuses `RaiseConcernSheet` and `app.raise_concern`.
2. The subject can be a child, an adult (free text) or a staff member.
3. **Concerns about staff (allegations):**
   - visible only to the DSL and the owner;
   - never to the staff member concerned, even if they are an admin;
   - flagged "allegation — LADO process" (UK wording configurable).
4. The DSL gets an immediate in-app alert, and a push alert once UR-14 is connected.

**Edge cases.**
- The DSL is the subject: route to the owner, or a deputy DSL setting.
- The reporter is not staff (e.g. a parent): use a contact-the-DSL message, not concern entry.

**Acceptance criteria.**
- As Nadia, raise a concern about a child; the DSL sees it and the access log records it.
- An allegation about Marcus is invisible to Marcus and to other admins.
- Tests cover all of these.

### UR-10 Billing integrity (P0, M–L)

**Problem.** Four money defects:
- a refund turns a paid invoice into overdue debt;
- a billing run can bill a term twice;
- ending a discount fails silently;
- goodwill credit has no screen.

**User stories.**
- As a finance administrator, I want refunds to reduce what a family was charged without creating debt, so that statements are right.
- As a finance administrator, I want a billing run to refuse to bill families twice for the same term.

**Functional requirements.**

1. **Refund or credit note.**
   - A refund on a paid invoice creates a **credit note** linked to the invoice (amount, reason).
   - The invoice stays settled.
   - Money returned is recorded as a refund payment out.
   - Alternatively, the refund can go **to credit on account** (choose at refund time).
   - The family statement shows invoice, payment, credit note and refund lines.
2. **Billing-run duplicate guard.**
   - Before raising drafts, detect existing invoices for the same family and the same **billing period** (term or month), regardless of class links.
   - Show them as "Already billed for this period — skipped (view)".
   - The finance user can override per family, with a reason.
3. **End discount.**
   - Ending a family discount works: fix the RLS or RETURNING conflict on `family_discount` (0039:37; `billing.ts:151`).
   - Show an error if it fails.
   - `FAMILY_DISCOUNTS` excludes ended discounts.
4. **Goodwill credit and payment on account.**
   - "Add credit" on the family record (amount, reason).
   - "Record payment" can be left unallocated.
   - Credit is applied automatically to the next invoices (database support exists, 0016).
5. **Documentation.** `PAYMENTS.md` must match the behaviour.

**Business rules.**
- Credit notes can't exceed the invoice total less earlier credits.
- All actions are logged with user and reason.
- Billing runs are idempotent per family and period.

**Edge cases.**
- Partial refunds.
- Refund of a card payment (later, UR-15).
- An invoice with mixed class and manual lines.
- An imported historical invoice (no class link).

**Acceptance criteria.**
1. Refund £10 on the paid INV-1066 → the invoice stays Paid, a credit note of £10 exists, and the family balance does not show £10 owed.
2. Run Current Term billing on seeded data → 0 new drafts for families already invoiced for that term (and a list of the skipped ones).
3. End the Fenwick discount → gone on reload, and not applied in the preview.
4. Add £5 credit → the next invoice is reduced by £5.

Tests cover all four.

### UR-11 The app says only true things (P0, XS)

**Functional requirements.**
1. **Absence dialog text:** "The office will pass this on" until UR-07 ships; then the UR-07 text.
2. **Medical visibility text** in `/family/children` and the `/people` help: state exactly what teachers see — allergies, conditions, medication, emergency plan, emergency contacts and photo consent — and that it is for their own students, on class days.
3. **Home "Pay £x" button** → "See how to pay" while cards are not connected.
4. **Onboarding:** show the sample-data sentence only when the school actually has sample data.
5. **`PAYMENTS.md`:** correct the goodwill-credit claim, or ship UR-10.

**Acceptance criteria.** Each string is verified on screen. The DSL signs off the medical wording.

### UR-12 Safeguarding legal hold in retention (P1, S, needs specialist advice)

**Problem.** The retention job could anonymise a child whose safeguarding record is still held or open.

**Functional requirements.**
1. `apply_retention` skips anonymising any student with an open or monitoring concern, or with a closed concern still inside its retention period.
2. The DSL can set an explicit legal hold on a child.
3. The retention preview lists the children held, and why.

**Acceptance criteria.** A seeded leaver with a closed concern is not anonymised. A child without concerns is anonymised as configured. Tests cover both.

### UR-13 Real sign-in and account recovery (P0 for real-world use, L; decision R-001 and R-002)

**Functional requirements.**
1. Sign-in by email link (recommended for low-confidence users), optionally with a password and/or Google/Apple.
2. Account recovery without contacting the school.
3. Session timeout appropriate to shared family devices.
4. Students 13+ sign in only after guardian approval (UR-16).
5. Staff accounts: optional second factor for owners and DSL.
6. Mapping to the existing user ids and roles, so every database policy keeps working.

**Acceptance criteria.**
- A new parent receives an invitation, signs in by email link and sees only their family.
- Recovery works.
- A security review is completed before real data is used.

### UR-14 Out-of-app delivery (P1, L; decision R-003)

**Functional requirements.**
1. Email for invitations (single and bulk), invoices and receipts, and the daily digest (0041 already composes it).
2. Push (PWA) and/or SMS for **urgent** notices: same-day cancellation, cover change, safeguarding alert to the DSL.
3. Preferences per person per category (the settings screen exists). Urgent is always on.
4. A delivery log per message, so the office can see "delivered / failed".

**Acceptance criteria.**
- Cancelling today's session sends push or SMS to affected guardians within 1 minute (test mode).
- Bulk invitation of 150 families sends 150 emails with unique links.

### UR-15 Card and Direct Debit payments (P1, L–XL; decision R-006)

**Functional requirements.**
1. Pay an invoice by card from `/family/payments`, with a receipt.
2. Direct Debit mandates for recurring term or monthly fees.
3. Failed payment handling feeding the existing failed-payment states.
4. Refunds through the provider, linked to the UR-10 credit notes.
5. Test mode first; live only with explicit owner approval.

**Acceptance criteria.** In test mode, pay INV-x by card → the invoice is Paid with a receipt; a failed DD shows as failed with a retry.

### UR-16 Parents approve or switch off teen logins (P1, S–M)

**Functional requirements.**
1. `/family/children` → child 13+ → "Their own login":
   - Off / Invite them (sends to the child's email) / On.
   - Either guardian can switch it off at any time.
2. An office-sent student invitation creates a pending approval that guardians see on `/family` ("Amir has been invited — approve?").
3. `/studio` → the minimum student login age setting (13–18, default 13), with guidance.
4. When a login is switched off, the student's sessions end.

**Acceptance criteria.** Hannah approves Amir and he can sign in; she switches it off and he is signed out. Tests cover all of this.

### UR-17 Shared-care privacy and collection permissions (P1, L)

**Functional requirements.**
1. **Message privacy.** Each guardian's messages to the studio are private to that guardian and the office by default. Studio messages to "the family" go to all guardians.
2. **Office-set restrictions per guardian:**
   - can see schedule, payments, feedback, medical;
   - can be contacted;
   - **may collect**.

   Defaults are all allowed, as today.
3. **Collection list per child.** Who may collect, and who may not, shown on the teacher's register brief.
4. **Split billing (P2 follow-on).** Assign invoices or percentages to a guardian.

**Edge cases.**
- Court orders: the office records restrictions with a note visible to the DSL only.
- Restrictions apply immediately to sessions.

**Acceptance criteria.**
- Daniel's private message is invisible to Hannah.
- A "may not collect" flag appears on the register brief.
- RLS tests cover all of this.

### UR-18 Enquiry → trial → enrolment linked (P1, S–M)

**Functional requirements.**
1. From an enquiry card, "Book a trial" opens the trial sheet prefilled with the child's and contact details, and passes `enquiry_id` (supported by `app.book_trial`).
2. The enquiry moves automatically: Enquiry → Trial booked → Attended → Enrolled (or Lost, with a reason).
3. Enquiries are included in global search.

**Acceptance criteria.** A new enquiry → book trial (no retyping) → mark attended and joining → the pipeline card shows Enrolled and the funnel counts it.

### UR-19 Waiting-list offers respect capacity (P1, S)

**Functional requirements.**
1. Only one outstanding offer per free place. Auto-offer is skipped while an offer is pending.
2. Offers expire after a set number of days (school setting, default 3); the next person is offered automatically.
3. The picker shows only children in the age range who are not already enrolled or waiting, with age shown.

**Acceptance criteria.** The `admins-08` repro can no longer produce two offers for one place. Tests cover the database function.

### UR-20 Class suitability, price and confirmation on `/join` (P1, M)

**Functional requirements.**
1. Each class shows:
   - a description;
   - the level in plain words ("No experience needed");
   - what to wear or bring;
   - age range;
   - the **ongoing price** (per term or month) next to the trial price.
2. The adult path doesn't ask "Your child's age". An "I'm booking for myself" choice comes first.
3. The confirmation screen (and email once UR-14 ships) gives:
   - date, time, address with a map link;
   - what to bring;
   - arrival advice;
   - cancellation policy;
   - what happens next ("After the class we'll invite you to join").

**Acceptance criteria.** For each seeded class, description, level and ongoing price are visible on `/join`. Adult booking never shows the child-age question.

### UR-21 Adult student accounts (P1, L, size uncertain)

**Functional requirements.**
1. An adult participant type with their own login (no guardian).
2. They see:
   - their bookings, packs and drop-ins (cancel within policy);
   - payments;
   - feedback (if tracking is enabled);
   - messages.
3. Public adult bookings link to this record (UR-06).

**Acceptance criteria.** Gareth (52) books a drop-in, accepts an invitation, signs in, sees and cancels his booking, and sees the credit or refund per policy.

### UR-22 Complete payment instructions and honest "Pay" (P1, XS–S)

**Functional requirements.**
1. `/studio` → Payments: the school enters payee name, sort code, account number and (optional) IBAN.
2. `/family/payments` → How to pay shows them with the invoice reference. Each field has a Copy button.
3. One combined reference for paying several invoices at once (e.g. the family code), with allocation by the office.
4. Labels per UR-11.

**Acceptance criteria.** Pauline (9) can complete a bank transfer using only the screen.

### UR-23 In-app notifications for invoices and new feedback (P1, S)

**Functional requirements.** Notifications in the bell (and by delivery, once UR-14 ships) for:
- a new invoice issued;
- a payment received;
- an invoice due in 3 days;
- new shared feedback;
- an exam or event entry confirmed.

All respect preferences.

**Acceptance criteria.** Billing the Thames Valley fee shows "New invoice INV-x £35 due 16 Dec" in Hannah's bell.

### UR-24 Upcoming costs per family and child (P1, M)

**Functional requirements.**
1. `/family/payments` → "Coming up": a list per child of:
   - known future charges: next term fees, confirmed event and exam fees, costumes, privates;
   - with expected dates;
   - and a total.
2. Confirmed private lessons with a cost create a charge: a draft invoice line or a pending charge (fixes parents D9).
3. Clear labelling: "Expected", "Invoiced", "Paid".

**Acceptance criteria.** After confirming a £30 private lesson and a £35 competition, both appear under Coming up with dates. The total matches.

### UR-25 Feedback edits keep saved content; previous feedback at the point of teaching (P1, S–M)

**Functional requirements.**
1. Reopening a child's feedback pre-selects the saved chips and note. Saving merges, never silently replaces.
2. Edits to already-shared feedback are marked "Edited" for families, with the time.
3. The register row and student panel show the **last note and "to work on"** for that child, collapsed by default.

**Acceptance criteria.** The `teachers-10` repro keeps the earlier chips and adds "Confidence". The family view shows "Edited". The register shows last week's "to work on".

### UR-26 One diary for families and students (P1, M)

**Functional requirements.**
1. `/family/schedule` and `/learn/timetable` include, each labelled by type:
   - classes;
   - rehearsals and performances the child is in;
   - exams entered;
   - competitions and events entered;
   - confirmed private lessons.
2. A filter by child (family). An "Add all to my calendar" option (the existing calendar feed includes the same items).
3. Students see their exam entries and results (RLS already permits).
4. "All feedback" opens the child the notice was about.

**Acceptance criteria.**
- Amir's timetable shows his Grade 5 exam and the show rehearsals.
- Hannah's schedule shows Nia's competition.
- The calendar feed contains the same items.

### UR-27 Cover clash check and handover note (P1, M)

**Functional requirements.**
1. When the office assigns cover, warn if the teacher has an overlapping session, including travel between locations (configurable minutes) and sessions at their other school if they have shared availability.
2. The cover request can include a handover note: plan, music, children to watch. It shows on the cover teacher's register.
3. Cover access is limited to the session's day (narrower than today's window).

**Acceptance criteria.** Assigning Priya to Junior Tap 16:30 Greenwich while she teaches 16:00–16:45 Blackheath shows a clash warning. The handover note appears on her register.

### UR-28 Safeguarding access log counts each look once (P1, XS–S)

**Functional requirements.** Log "opened" once per opening of a concern. Refreshing actions after a change does not log a new opening; log "recorded an action" instead.

**Acceptance criteria.** The open → action → close sequence produces exactly two log rows.

### UR-30 Text scales with the user's settings (P1, M)

**Functional requirements.**
1. Font sizes use relative units (rem) based on the user's browser and OS setting, replacing fixed px classes such as `text-[13px]`, `text-[15px]`.
2. Layouts reflow without horizontal scrolling at 200% text.

**Acceptance criteria.**
- With the root font at 200%, the sampled text elements double.
- No sideways overflow at 320px.
- `npm run a11y` stays clean.

### UR-31 Sheets trap and return focus (P1, S)

**Functional requirements.** Every sheet or dialog (`record-sheet.tsx` and similar):
- moves focus inside on open;
- keeps Tab within;
- closes on Escape;
- returns focus to the control that opened it.

**Acceptance criteria.** The keyboard test from DSL D-08 passes for the family, office and teacher sheets.

### UR-32 Migration toolkit (P1, L)

**Functional requirements.**
1. **Unmapped columns.** Before import, list every source column not mapped, and require acknowledgement ("These will not be imported").
2. **Timetable import.** A CSV of classes: name, style, level, day, time, duration, room, teacher, capacity, ages, price.
3. **Opening balances and credit import** per family, with an "as at" date. Creates opening-balance lines, so billing runs (UR-10) don't double-bill.
4. **Optional history imports:**
   - previous invoices (read-only);
   - attendance summary;
   - exam results.
5. **Bulk invitations** after import (UR-14).

**Acceptance criteria.**
- A sample migration file set (families, timetable, balances) imports in at most 10 interactions.
- Unmapped columns are listed.
- Balances appear on family records.
- The next billing run skips already-billed families.

### UR-35 Audit and access history screen; log medical reads (P1, S–M)

**Functional requirements.**
1. `/account` → History: filterable by person, record and date. Shows changes to families, students, invoices, roles and settings (`audit_log` exists).
2. Each record (family, student, invoice) has a "History" tab.
3. Log reads of full medical records by office roles (teacher briefs excluded, or summarised daily).

**Acceptance criteria.** Changing a student's date of birth appears in History with user and time. Opening a medical record as an admin creates a read entry visible to the owner.

### UR-36 Trial families told when their session is cancelled (P1, XS)

**Functional requirements.** `cancel_session` notifies booked trial families *before* changing their trial status, and prompts the office to rebook.

**Acceptance criteria.** Cancelling a session with a booked trial creates a notice for the trial family. Test it.

### UR-37 Register date guard (P1, XS–S)

**Functional requirements.**
1. Registers can be marked from 30 minutes before the start until 7 days after (school setting). Outside that window the register is read-only, with an explanation.
2. Admins can amend later, with a reason.

**Acceptance criteria.** On Friday, Tuesday's (future) register is read-only. Last Tuesday's is editable. Test it.

### UR-38 "Who can see what" page and family data requests (P1, M; process needs specialist review)

**Functional requirements.**
1. `/family` → Privacy: a plain table of who sees what about my child (teacher, office, DSL, Swayvo support) generated from the actual role model, plus how to correct data.
2. "Download my family's data" (JSON or PDF).
3. "Ask to delete" creates an office request with the retention explanation.

**Acceptance criteria.** The page's statements match the RLS rules (reviewed by the DSL). A download contains the family's records only.

### UR-40 Visible form errors (P2, XS–S)

Included here because it supports UR-01.

**Functional requirements.** After a failing save, scroll to and focus the first error. Show a summary next to the primary button.

**Acceptance criteria.** The class form error is visible after clicking Create class.

---

## 25. Product improvement roadmap

**Quick wins.** Extra-small to small, high benefit; do these first:

| Quick win | What it fixes |
|---|---|
| UR-01 | Class creation |
| UR-02 | Student edit |
| UR-11 | True statements |
| UR-36 | Trial cancellation notice |
| UR-37 | Register date guard |
| UR-28 | Access log |
| UR-22 | Bank details and honest Pay |
| UR-39 | Plan-limit notice |
| UR-40 | Visible errors |
| UR-54 | Small fixes, in part: out-of-age warning, "no registers%", template name, truncated headers |

### Phase 1: essential fixes and adoption barriers

| | |
|---|---|
| **Items** | UR-01, UR-02, UR-03, UR-04, UR-05, UR-06, UR-07, UR-08, UR-09, UR-10, UR-11, UR-12, UR-28, UR-30, UR-31, UR-36, UR-37; then connect **UR-13** (sign-in) once R-001 and R-002 are decided |
| **Rationale** | Each either blocks a core job, gives a wrong result silently, or is a safeguarding, accessibility or payment-integrity requirement |
| **User benefit** | Schools can set up, correct records, invite parents and take reliable registers. Families' absences, consents and privacy are respected. Money is right |
| **Business benefit** | Makes real-user testing possible and safe; removes the finance and DSL vetoes |
| **Dependencies** | Owner decisions R-001 and R-002 for UR-13; specialist advice for UR-12 |
| **Complexity** | Mostly XS–M; UR-10 M–L; UR-13 L |
| **Measures of success** | Scenarios 6, 11, 14, 22, 28, 29, 30 and 31 and S1, S2 move to "Completed with minor friction" or better. Automated tests for every defect. Zero silent-wrong-result defects open |

### Phase 2: everyday efficiency

| | |
|---|---|
| **Items** | UR-14 (delivery, after R-003). UR-15 (payments, after R-006). UR-16, UR-17, UR-18, UR-19, UR-20, UR-22, UR-23, UR-24, UR-25, UR-26, UR-27, UR-35, UR-38, UR-46, UR-52, UR-56 |
| **Rationale** | Reduces repetitive office work, unpaid teacher time and parent mental load; replaces WhatsApp and email |
| **User benefit** | No re-typing of enquiries. One family diary. Costs known in advance. Alerts outside the app. Pay in the app |
| **Business benefit** | Collection rate, trial conversion, office hours saved; it becomes worth paying for |
| **Dependencies** | R-003, R-006 decisions; Phase 1 done |
| **Complexity** | S–L |
| **Measures of success** | Enquiry→enrolment with zero re-typing. Absence reports seen by teachers before class in 100% of tests. Parent "upcoming costs" matches invoices. Office time per new family (to be measured with real users) |

### Phase 3: student experience and development

| | |
|---|---|
| **Items** | UR-43 (progress history), UR-44 (bulk and teacher chips), UR-45 (support needs), UR-48 (draft skills), UR-49 (student absence and bell), UR-55 (tracking depth), UR-21 (adult accounts), UR-42 (trial safety capture) |
| **Rationale** | Builds the signature feature without turning dance into grades; respects different ambitions and ages |
| **User benefit** | Students see growth. Teachers give feedback in far fewer taps. Parents understand progress |
| **Business benefit** | Retention and differentiation |
| **Dependencies** | Phase 1 (UR-25 feedback integrity) |
| **Complexity** | S–L |
| **Measures of success** | Feedback interactions per class at least halved vs 41 for 12. Share of classes with feedback each week (real users). Students opening `/learn` between classes (real users) |

### Phase 4: business growth and differentiation

| | |
|---|---|
| **Items** | UR-32 (migration), UR-33 (locations), UR-34 (retention report), UR-41, UR-47, UR-50, UR-51, UR-53, UR-57, UR-58, UR-29; later UR-59, UR-60, UR-61 |
| **Rationale** | Opens multi-site and switching schools; gives owners insight |
| **User benefit** | Owners see retention and capacity by site; switching becomes practical |
| **Business benefit** | Larger customers; competitive switching |
| **Dependencies** | Phases 1–2; real-user validation of demand (§26) |
| **Complexity** | M–L |
| **Measures of success** | A switching school migrates families, timetable and balances in one day. Multi-site owners can compare sites |

**Not recommended now.** Video feedback, badges, a consolidated multi-school owner view, bank-reconciliation import and custom roles. Revisit them after real-user evidence.

---

## 26. Real-user validation plan

**Who.** 2–3 pilot schools: one small (owner-teacher), one growing, one multi-site if possible. From each:
- the owner;
- 1 admin or finance person;
- 2–3 teachers, including one low-tech;
- 5–8 parents, including multi-child, shared-care and low-tech;
- 3–5 students aged 13–17;
- 1–2 adult students;
- the DSL.

Include participants with access needs: low vision, dyslexia, motor.

**Can be implemented confidently now, based on observed defects.** UR-01 to UR-11, UR-28, UR-30, UR-31, UR-36, UR-37 and the UR-54 bundle. These are defects, not opinions.

**Validate before significant investment.**

| Assumption | Why it may be wrong | How to test |
|---|---|---|
| Progress history is the signature feature (UR-43) | Simulated enthusiasm; recreational families may not care | Demand test: show a prototype to 10 families and 5 teachers; measure use in the pilot |
| Teachers will give weekly feedback if it's fast (UR-44) | Unpaid-time concerns could persist | Pilot with bulk chips; count feedback per class over 4 weeks |
| Per-guardian privacy is needed widely (UR-17) | One persona (shared care); proportion unknown | Ask pilot schools how many families have restrictions |
| Adult accounts matter (UR-21) | Depends on the school's mix of adult classes | Ask schools their adult share |
| Multi-location reporting and migration (UR-32, UR-33) | Market segment size unknown | Interviews with 3 multi-site and 3 switching owners |
| Upcoming-costs forecast (UR-24) | Competitive parents only? | Pilot parents: card sort of money needs |
| Push vs SMS vs email preference | Varies by audience | Pilot opt-in rates |

**Findings particularly vulnerable to bias.**
- Persona scores and votes: simulated by agents who also inspected the code, so they may over-weight technical defects.
- Task frequencies.
- Willingness to adopt.
- The relative appeal of progress features.
- Any comparison with competitors: none was verified.

### Interview questions and usability tasks

**Owners.**
- Interview:
  - Walk me through your week: where does admin time go?
  - What would make you switch systems, and what would stop you?
  - How do you know whether students are staying?
- Tasks:
  - set up a term and 5 classes;
  - find under-filled classes;
  - see who can read medical records.

**Administrators and finance.**
- Interview:
  - Which tasks do you repeat most?
  - Where do mistakes happen?
  - How do you handle refunds and credit today?
- Tasks:
  - log an enquiry and book a trial;
  - move a student;
  - run term billing;
  - refund £10;
  - end a discount;
  - correct a date of birth.

**Teachers.**
- Interview:
  - What happens when you arrive at a class?
  - How do you give feedback now?
  - What would make you stop using an app?
- Tasks:
  - take a 12-child register on your own phone, including one with no signal;
  - give feedback to the class;
  - check last week's note for a child;
  - ask for cover.

**Parents.**
- Interview:
  - How do you keep track of dance commitments and costs?
  - What do you do when your child is ill?
  - For separated families: what must the other parent not see or change?
- Tasks:
  - report an absence;
  - find this term's total costs;
  - pay an invoice;
  - withdraw photo consent;
  - see next week for all children.

**Students (13+ and adults).**
- Interview:
  - What would make you open the app between classes?
  - Does feedback feel encouraging?
- Tasks:
  - find your next rehearsal and exam;
  - read your latest feedback and say what you'll practise;
  - say you can't make Tuesday.

**DSL.**
- Interview:
  - How are concerns recorded now?
  - Who should see what?
  - How long do you keep records?
- Tasks:
  - record a concern disclosed at reception;
  - check who has viewed it;
  - change a child's consent;
  - check staff DBS expiries.

**Accessibility.**
- Tasks with VoiceOver, TalkBack and NVDA, at 200% text, and keyboard-only:
  - register;
  - pay;
  - report an absence;
  - read feedback.

---

## 27. Final panel verdict

**Answers to the 25 questions.** All are simulated panel judgement grounded in observed behaviour.

**1. Would students willingly use this application?**
- **Teens with a login: yes, conditionally** (Amir 8/10 on adoption). They'd come for feedback and next-class info, and need a diary and notifications to come back between classes.
- **Under-13s:** no login by design; parents would share with them.
- **Adults:** not today, because no adult account exists.

**2. Would parents prefer it to their existing arrangements?**
- Most would prefer the family week and cancellation notices to WhatsApp and email (Hannah 8, Kemi 7), **once** messages reach them outside the app and they can pay.
- Shared-care parents would not, until privacy is fixed.

**3. Would teachers welcome its introduction?**
- **Yes, for the register.** It is the most-praised feature.
- They are wary of offline failure and unpaid feedback time.
- With UR-04, UR-25 and UR-44, most would welcome it.

**4. Would administrators experience a meaningful reduction in workload?**
- **Yes, potentially.** Today's queue, cancellations, search and billing runs save time.
- **But today**, the student-edit crash, re-typed enquiries and billing errors *add* work and risk.
- After Phase 1 and 2: yes.

**5. Would school owners pay for the application?**
- **Not the current build.**
- Small and growing owners would trial seriously after Phases 1–2 with payments and email connected.
- Multi-site and switching owners need Phase 4.

**6. Would a school on a competitor platform consider switching?**
- **Not yet.** Migration covers families only; there are no balances, history or mandates, and invitations are manual.
- They would consider it after UR-32, UR-14 and UR-15. This is unverified against any competitor.

**7. Ten most valuable existing features.**
1. The two-button register with "Mark the rest" and medical notes.
2. Cancellation with automatic family notices.
3. Family weekly view.
4. Teacher notes with "to work on".
5. Owner Today and its needs-attention list.
6. Term billing runs with aged-debt and accounting exports.
7. Database-enforced permissions with logged safeguarding access.
8. Term-report drafting.
9. Families import with validation, plus full export.
10. No-account trial booking.

**8. Ten most important missing or underdeveloped features.**
1. Out-of-app delivery.
2. Card and Direct Debit payments.
3. Offline-safe register.
4. Consent management.
5. Absence reports to the register.
6. Shared-care privacy.
7. Unified family and student diary.
8. Billing integrity (credit notes, run guard).
9. Class suitability and price on `/join`.
10. Progress history over time.

**9. Five most significant frustrations.**
1. Core actions fail: class creation, student edit, invitation acceptance.
2. Offline marks lost or overwritten.
3. Absence reports go nowhere despite a promise.
4. Money: refunds create debt, "Pay" doesn't pay, no bank details.
5. A co-parent can change your details and read your messages.

**10. Five biggest barriers to adoption.**
1. Sign-in, payments and message delivery not connected.
2. Defects in core jobs.
3. Safeguarding gaps: consent, office concerns, teen-login approval.
4. Migration covers families only.
5. Feedback workload for teachers.

**11. Existing features providing insufficient value.**
- Studio Pulse (no data yet).
- The six-month table.
- Empty skill grids for young children.
- The pipeline's two parallel interactions.
- "Retry" on failed card payments while cards are not connected.

**12. Simplify, consolidate or remove.**
- Consolidate enquiries, trials and enrolment into one record.
- Keep one pipeline interaction.
- Group the student timeline.
- Hide Studio Pulse until it has data.
- Remove the child-age question for adults.
- Never show unassessed skill grids.
- Show location features only to multi-site schools.

**13. Five quickest improvements with the greatest benefit.**
1. UR-01 class creation.
2. UR-02 student edit.
3. UR-11 truthful statements.
4. UR-22 bank details and an honest Pay button.
5. UR-36 and UR-37: trial cancellation notice and register date guard.

UR-03 (invitations) is close behind.

**14. What would make students engage regularly.**
- One diary with rehearsals and exams.
- Notifications when something changes.
- Seeing their progress over time.
- "To work on" linked to a practice video.
- Saying "I can't make it" themselves.

**15. What would make teachers use feedback consistently.**
- Feedback for a class in a handful of taps: bulk and their own chips.
- Never losing what they saved.
- Seeing last week's note at the door.
- Term reports that write themselves from the weekly notes.
- No obligation to write per-child prose.

**16. What would make parents feel organised and informed.**
- One calendar for all children with every commitment.
- Alerts outside the app.
- Knowing what the term will cost.
- Paying in two taps.
- Absences that reach the teacher.

**17. What would make administrators more efficient.**
- Linked enquiries.
- Editable records.
- Billing that is right first time.
- Bulk reminders.
- Record history.
- Bulk email invitations.

**18. What would make owners perceive greater commercial value.**
- Collection through cards and Direct Debit.
- A retention report.
- Under-filled class insight.
- Migration in a day.
- Multi-site comparison.
- Visible time saved.

**19. The signature feature.**
- **Progress families can see:** the teacher's "to work on" note plus skills as a count of eight, carried over time.
- It is already distinctive in tone: encouraging, never "failed".
- It needs history, tracking depth by age, and low teacher effort to become the reason schools choose Swayvo.

**20. The single most impactful improvement for each group.**

| Group | Improvement |
|---|---|
| Students | Unified diary with exams and rehearsals (UR-26) |
| Parents | Out-of-app alerts (UR-14), with absence reports to the register (UR-07) close behind |
| Teachers | Offline-safe register (UR-04) |
| Administrators | Enquiry → trial → enrolment linkage (UR-18), after the edit fix |
| Owners | Working class creation, then payments connected (UR-01, UR-15) |
| Prospective customers | Class suitability and price on `/join` (UR-20) |
| Safeguarding | Consent management (UR-08) |

**21. What would make it indispensable.**
- When the register, the family diary, payment collection and progress are all trustworthy and connected, a school can stop using:
  - WhatsApp for changes;
  - spreadsheets for costs;
  - paper for registers.
- Then a parent's whole dance life is in one place.

**22. What would make users recommend it.**
- Parents: "I never miss a change and I know what it costs."
- Teachers: "The register takes ten seconds and works in the basement."
- Owners: "Fees come in and I can see who's staying."

**23. Is it ready for real-world customer testing?**
- **Not yet.** It will be ready after the Phase 1 fixes, which are mostly small.
- Moderated sessions with synthetic data could start now. Use them to validate §26 while Phase 1 is built.
- **Do not** put real children's data in it until real sign-in (UR-13) exists and Phase 1 safeguarding items are done.

**24. Is it ready for commercial launch?**
- **No.** Launch needs:
  - Phase 1;
  - sign-in, payments and delivery connected (R-001, R-002, R-003, R-006);
  - Phase 2's everyday-efficiency items;
  - real-user validation;
  - a security and privacy review by qualified specialists.

**25. What would it take to become the preferred platform for dance schools?**
- Reliability first: Phase 1.
- Then connection: payments and delivery.
- Then the signature: progress families can see, with very little teacher effort.
- Then a migration path that lets an established school move in a day.

The panel believes the foundations (data model, permissions, ledger, tone) are strong enough to get there. The gap is execution, not concept.

### Final recommendation

**Proceed, but fix before you test.**
1. Implement Phase 1: the observed defects and safeguarding controls. Each has acceptance criteria in §24.
2. Decide R-001, R-002, R-003 and R-006 in parallel.
3. Run moderated sessions with 2–3 pilot schools using synthetic data, following the §26 plan.
4. Fund Phases 3–4 only on that evidence.

**Reasoning.**
- The panel's relevance score (8.0/10) shows the product targets the right jobs.
- Its completeness score (4.5/10) and the observed defects show it cannot yet be trusted with them.
- Most of the fixes are small, and much of the hard work (permissions, ledger, safeguarding logs) already exists underneath.

*End of report. Simulated panel; observed defects. No application code was changed during this review.*
