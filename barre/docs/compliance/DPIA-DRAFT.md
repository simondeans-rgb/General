# Swayvo: Data Protection Impact Assessment (DRAFT)

> **DRAFT FOR SPECIALIST REVIEW. NOT A COMPLETED DPIA.**
>
> An engineer prepared this draft from the code and design documents on 27 November 2026, and updated it the same day for the retention changes in migration 0058 (`0058_retention_fixes.sql`). It is a starting point for a qualified data protection specialist or Data Protection Officer (DPO). It is not legal advice.
>
> - It does **not** claim that Swayvo, or any school using it, complies with UK GDPR, the Data Protection Act 2018 (DPA 2018), the ICO Age Appropriate Design Code (the Children's Code), Keeping Children Safe in Education (KCSIE) or any other guidance. It shows where each one is relevant and what the specialist has to decide.
> - Statements about the system cite the file, migration number, table or function they come from (migrations live in `src/lib/db/migrations/`). Anything not found in the code is labelled **not built**.
> - Every decision the school or DPO must make is marked **DECISION NEEDED**.
> - Each school is expected to be the controller (§4). This draft therefore works in two ways: as Swayvo's own assessment of the product, and as a template each school completes for its own use of it.
> - Swayvo is a pre-production build. No real children's data should be entered until the actions in §10 are done.

| | |
|---|---|
| Product | Swayvo: management software for dance schools, covering several schools (`studio` tenants) |
| Code reviewed | `barre/` (Next.js app), migrations 0001–0056, docs listed in §12 |
| Not reviewed | Migration 0057 (student video access), which is being written now and was not visible to the author |
| Draft version | 0.1, 27 November 2026 |
| Owner of this document | **DECISION NEEDED:** name the Swayvo person responsible, and the DPO or specialist reviewer |

---

## 1. Why a DPIA is needed

Article 35 of UK GDPR requires a DPIA when processing is likely to result in a high risk. The ICO's list of processing that needs a DPIA, and standard 2 of the Children's Code, point the same way here. These features of Swayvo are why:

| Factor | Evidence in the system |
|---|---|
| Children's data at scale, across many schools | `student` (0002) holds name and date of birth for every child at every school. The product is sold to many schools (`PLATFORM.md`) |
| Special category health data | `medical_record` (0002): allergies, conditions, medications, emergency action plan, GP name and phone |
| Safeguarding records, including allegations against staff | `safeguarding_concern`, `safeguarding_action`, `safeguarding_access` (0030, 0047), `safeguarding_hold`, `welfare_watch` (0047) |
| Criminal records information | `staff_check` (0030) records DBS checks (reference, date checked, expiry). `staff_member.dbs_checked_on` (0002) |
| Shared-care and court-order information | `guardian_access.dsl_note` (0046): "e.g. the court order behind a restriction" |
| Online service used directly by children | Students aged 13 or over may have their own login (`student_login_min_age`, 13–18, 0046/0053). Under-13 logins are refused by the database (0053) |
| Monitoring | Attendance is tracked as a welfare signal for watched children (`welfare_watch`, `app.welfare_absences`, 0047). Teachers assess skills (`skill_assessment`, 0010/0029/0049) |
| Photographs and video of children | Media can be held in `resource` and `resource_file` (0010, 0012). See §8.1, which must be confirmed against 0057 |
| New technology and unresolved infrastructure | Sign-in, hosting, delivery and payments are not built (R-001, R-002, R-003, R-006) |

**Initial view:** likely high risk. A full DPIA is needed before any school uses real data. The DPO decides whether the remaining risk is high enough to require prior consultation with the ICO (Article 36). **DECISION NEEDED.**

---

## 2. Description of the processing

### 2.1 Nature: what the system does

Swayvo runs the day-to-day work of a dance school (`ARCHITECTURE.md`). It has three main experiences:

- **Office (owner and administrators):** families, students, classes, enrolment, enquiries and trials, billing, messages, reports and safeguarding.
- **Teacher:** their own timetable, registers that work offline, a safety brief for each child, feedback and skills.
- **Family and student:** schedule, messages with the office, invoices, consents, privacy page, and a student area for children aged 13 or over (`/learn`).

Above the schools sits **Swayvo's platform console** (`/platform`, `PLATFORM.md`). Swayvo staff use it to set up schools and manage plans. They see counts of a school's people, never names.

**How access is controlled.** Every query runs as the `authenticated` database role, with the caller's identity set for the transaction (`runAs`/`readAs` in `src/lib/db/client.ts`). Postgres row-level security (RLS), with `FORCE ROW LEVEL SECURITY` set, decides which rows exist for that caller (`SECURITY.md`). Repository SQL deliberately does not filter by tenant, so a missing policy shows up as a fault rather than being hidden (`ARCHITECTURE.md`).

**Two runtimes.** Today the product runs as a browser demo. Postgres runs inside the browser (PGlite) and data is stored in IndexedDB on the viewer's own machine, using fictional seeded people. The intended production target is Postgres 16 or Supabase, with Supabase Auth (`ARCHITECTURE.md`). **Hosting is not decided (R-002).**

### 2.2 Scope: data inventory

"Access" summarises the RLS policies and `SECURITY DEFINER` functions. Role shorthand used in the table:

- **Owner:** has the `owner` membership.
- **Admin:** an administrator with no location limit (`app.is_admin`).
- **Loc-admin:** an administrator limited to certain locations through `membership_location` (0054). Read-only for records at their own locations. `app.is_admin` is false for them.
- **Teacher:** sees students returned by `app.teacher_student_ids()` (latest version in 0052). That means active enrolments in classes they teach or assist, children moved out of those classes in the last 60 days, booked or attended trials, and drop-ins in the last 30 days. It also includes children at events they attend (`app.teacher_event_student_ids`).
- **Cover:** a teacher covering a session sees those children on the session's day only (0048, `app.teacher_class_ids`).
- **Guardian:** sees their own family (`app.guardian_student_ids`), subject to any per-guardian restrictions in `guardian_access` (0046, enforced on every read path by 0053).
- **Student 13+:** sees their own records (`app.student_self_id`).
- **DSL:** the Designated Safeguarding Lead (`studio.dsl_user_id`, 0030).
- **Support:** a Swayvo support viewer during an owner's grant (0019). The grant is read-only, lasts at most 7 days, is logged, and never includes health records.

| # | Data category | Main tables / source of truth | Source of the data | Who can access (from RLS and functions) | Where stored | Retention as built (see `RETENTION-POLICY-DRAFT.md`) |
|---|---|---|---|---|---|---|
| 1 | **Child identity**: legal and preferred name, pronouns, date of birth, school attended, notes, avatar, adult flag | `student` (0002, 0046, 0056) | Parents, office, imports (0027), public trial form (0050). Parents can edit preferred name, pronouns and school directly. Legal name and DOB stay with the office (0056) | Owner and admin: all. Loc-admin: their locations. Teacher: own students. Cover: on the day. Guardian: own children. Student 13+: self. Support: read-only during a grant | Postgres (hosting TBD) | Anonymised `personal_months` (default 36) after the child leaves. Names become "Former student" and DOB becomes 1 January of the birth year (`app.apply_retention`, 0047) |
| 2 | **Health (special category)**: allergies, conditions, medications, action plan, urgent flag, GP name and phone | `medical_record` (0002). Teacher view `student_safety_brief` (0020, 0047) | Parents (through requests), office, public trial form (0050) | Owner and admin (`medical_read`, 0019). Loc-admin: their locations (0054). Guardian: own children unless `see_medical` is off (0046/0053). **Teacher and cover:** only the safety brief, which leaves out GP details. **Student 13+:** own brief. **Support: never** (0019). Office views are logged (`app.log_medical_view`, 0044) | Postgres | Hard-deleted `medical_months` (default 12) after leaving, soft-deleted rows included. **Kept while a legal hold or safeguarding record applies** (0058) |
| 3 | **Emergency contacts and collection list** (third parties) | `emergency_contact` (0002), `collection_permission` (0046) | Parents, office, trial form | Office. Loc-admin. Teacher and cover via the brief and register. Guardian: own children. Student: own brief | Postgres | Emergency contacts deleted at anonymisation; ones soft-deleted from a current child are purged after `personal_months` (0058). **Collection list: no retention rule** |
| 4 | **Consent records**: photography, video, social media (managed in the app), plus enum values `medical_treatment`, `data_processing`, `marketing`, `collection_by_other`. History is kept, and the most restrictive choice wins when guardians disagree | `consent_record` (0002, 0047), `consent_label` (0053), `guardian.marketing_consent`, `enquiry.marketing_consent` (0040) | Guardians through `app.set_consent`. Office (desk or paper). Imports | `app.can_see_consent`: office, guardians, the child, the child's teachers. History (`app.consent_history`): office, guardians, the child. Never support | Postgres | Deleted at anonymisation |
| 5 | **Family and guardian contact details**: names, email, phone, address, relationship, notes, billing flags | `family`, `guardian` (0002) | Parents, office, imports, invitations | Office. Loc-admin (their locations). Guardian: own family, and can edit only their own row (0046). Teachers do not see addresses (privacy page, `src/lib/repos/privacy.ts`) | Postgres | Anonymised once every child is anonymised **and** the last invoice is older than `financial_months` (default 72) |
| 6 | **Shared-care restrictions**: per-guardian visibility flags and DSL note (for example, a court order) | `guardian_access` (0046) | Office or DSL | Flags are applied by policy. The note is readable by the DSL only. No direct table policy; access is through functions | Postgres | DSL note cleared `dsl_note_months` (default 72) after every child in the family has left, unless a child is held (0058). The restriction flags have **no retention rule** |
| 7 | **Attendance and absence** | `attendance_record` (0004, 0048), `absence_report` (0048), `attendance_history` (imports, 0054), `makeup_offer` (0048) | Teacher registers (including the offline queue), parents' and students' absence reports | Teacher and cover: own sessions. Office. Guardian: own children unless `see_schedule` is off. Student 13+: self | Postgres. **Also the teacher's device while offline** (row 17) | Deleted `attendance_months` (default 72) after the child leaves, unless held (0058) |
| 8 | **Feedback, skills and progress** | `feedback_note` (including `private_note`), `skill_assessment`, `progress_report`, `student_goal`, `student_reflection` (13+), `milestone`, `practice_log`, `exam_entry` (0010, 0029, 0042, 0049) | Teachers. Students aged 13 or over (reflections, practice) | Teacher: own students. Office. Guardian: shared items, unless `see_feedback` is off. Student: shared items. Families can opt a child out of skill tracking (0049) | Postgres | At anonymisation, reflections are deleted and feedback text fields are cleared. **`skill_assessment`, `progress_report`, `student_goal`, `milestone`, `practice_log` and `exam_entry` are not touched** |
| 9 | **Support needs** (may reveal disability or health: special category) | `student_support_note` (0049) | Office | Office (`support_admin`). Teacher: own students (`support_teacher_read`) | Postgres | Deleted `support_months` (default 12) after the child leaves, unless held (0058) |
| 10 | **Photos and video of children**: see §8.1 | `resource` (scope `student`), `resource_file` (0010, 0012), `student.avatar_url`. Show programmes name children only with photo consent (`app.has_consent`, DECISIONS) | Teachers and office upload. **Students never upload video** (DECISIONS) | **Being tightened. Confirm against migration 0057** (§8.1) | Demo: bytes in Postgres (`resource_file.bytes`). Production: private storage with signed links (planned, §8.1) | **No retention rule** for media |
| 11 | **Safeguarding concerns** about children, adults or staff, including allegations, actions, legal holds and attendance watches | `safeguarding_concern`, `safeguarding_action`, `safeguarding_hold`, `welfare_watch` (0030, 0047) | Any member of staff raises a concern (`app.raise_concern_about`) | **No table read policy.** Read only through functions that check `app.is_safeguarding_lead` (owner or DSL) and write to the access log. An allegation is never visible to the staff member it is about (`app.can_read_concern`). Admins who are not the DSL cannot read or export | Postgres | Kept indefinitely unless the owner sets `concern_months` (12–600). Closed concerns are then deleted unless the child or the concern itself is under a legal hold (0047, 0058). Concerns about adults and staff can be held (0058) |
| 12 | **Staff records and checks**: name, contact, bio, DBS date, check reference, expiry, note, training and first aid | `staff_member` (0002), `staff_check` (0030) | Owner | Owner writes. Admin and DSL read (0047). Teachers see the staff list (`app.is_staff`) | Postgres | After a member of staff leaves: certificate numbers cleared after `staff_check_months` (default 12), record anonymised and checks deleted after `staff_months` (default 72). Held while a concern about them is kept (0058) |
| 13 | **Money**: invoices, lines, payments, credit notes, refunds, discounts and bursaries, split billing, opening balances, imported history, the school's bank details | `invoice`, `invoice_item`, `payment`, `credit_note`, `refund`, `family_discount`, `family_billing`, `opening_balance`, `imported_invoice`, `studio_bank_details` (0005, 0016, 0039, 0045, 0050, 0052, 0054) | Office. Billing runs. Payment provider webhook (not built, R-006) | Office. Loc-admin read (their locations). Guardian: own family's invoices, or only invoices addressed to them under split billing (0052), unless `see_payments` is off. **Teachers: none.** **No card data is stored** (`SECURITY.md`) | Postgres | Invoices kept. Family names and contacts anonymised after `financial_months` (default 72) once all children are anonymised |
| 14 | **Messages, requests and notifications** | `communication` (with `private_to`, 0046), `communication_read`, `studio_request` (including `data_request`, 0047), `notification`, `outbound_message`, `message_reminder` | Families, office, teachers, automations | Direct conversations: office and that family only (0017). Private guardian messages: that guardian and the office (0046). A teacher's message to a family lands in the family conversation, visible to the office (DECISIONS). Class notices go to the class. Notifications carry no health detail (`SECURITY.md`). The outbox is office-only | Postgres. Email and SMS are **not sent** (R-003) | Messages deleted `message_months` (default 36) after sending, unless a child in the family is held (0058). Requests, notifications and the outbox: **no retention rule** |
| 15 | **Enquiries, prospects and trials**, including child name and DOB, contact details, and public form logs (email, IP address) | `enquiry`, `trial` (0004), `public_submission` (0040) | Public forms on `/join` (privacy notice must be acknowledged, marketing is a separate unticked choice, 0040). Office | Office. No user reads `public_submission` | Postgres | Enquiries with no activity are removed after `prospect_days` (default 90). `public_submission` rows are deleted after 1 day |
| 16 | **Accounts and technical data**: login identity, memberships, location limits, notification preferences, quiet hours, push subscriptions, calendar tokens, invitations (stored as hashes) | `user_account`, `membership`, `membership_location`, `notification_preference`, `push_subscription`, `calendar_token`, `studio_invitation` (0002, 0019, 0028, 0035, 0041, 0054) | The user. Invitations | The user. The office for memberships. Swayvo staff see counts by role only | Postgres. Auth provider TBD (R-001) | **No retention rule** |
| 17 | **Offline register queue** on the teacher's phone: session id, student id, mark, reason, time, user id | `localStorage` key `barre.pending-marks.v1` (`src/lib/offline/attendance-queue.ts`) | Teacher | Anyone with access to the unlocked device and browser profile | Teacher's device | Until synced. Sign-out is blocked while marks are unsent (`register-sync.tsx`) |
| 18 | **Audit log**: who changed what, opened medical records, ran retention, used support access | `audit_log` (0005, 0044), `app.write_audit` triggers | Database triggers and functions | Owner (history screen with CSV, UR-35). Append-only: `update` and `delete` are revoked (`SECURITY.md`) | Postgres | Deleted by the retention run after `audit_months` (default 72), except entries about held children, kept concerns or staff a concern is about (0058). After a school is erased, rows survive with `studio_id` set to null (`on delete set null`, 0005) and are not touched |
| 19 | **Access logs**: safeguarding reads, exports, holds | `safeguarding_access` (0030, 0047) | Functions | Owner and DSL (`app.safeguarding_access_log`) | Postgres | Kept with the concern. When a concern is deleted under retention, its rows are kept, detached and marked "concern deleted under retention on <date>", and deleted `audit_months` (default 72) later (0058) |
| 20 | **Platform and support records** | `platform_admin`, `support_access_grant`, `support_session`, plan and status columns on `studio` (0019) | Swayvo staff and the owner | Swayvo staff (account facts only). The owner (grants) | Postgres | No rule beyond school erasure |
| 21 | **Events, shows and costumes**: participants, routines, chaperones, helpers, costume sizes, tickets | `event_participant`, `routine_dancer`, `event_chaperone`, `event_helper_signup`, `costume_order`, `ticket_booking` (0010, 0031, 0042, 0050) | Office, families | Office. Teachers for their events. Guardians for their own children | Postgres | **No retention rule** |

**Volume.** **DECISION NEEDED:** estimate the number of schools, children per school, and the youngest age (classes commonly start at 2–3 years; the seed data includes "Age 3–4" costume sizes, 0042).

### 2.3 Context

- **The people.** Most data subjects are children, many under 13. Parents and carers may be in separated or shared-care arrangements (0046 exists because of this). Staff include self-employed teachers who work at several schools (0055).
- **What people expect.** Parents expect the school to hold medical and emergency details and to keep them from other families. They may not expect teachers at other schools, Swayvo staff or third parties to see anything. The privacy page (`src/app/family/privacy/page.tsx`, `WHO_SEES` in `src/lib/repos/privacy.ts`) explains who sees what, in terms taken from the RLS rules.
- **Children's control.** Children under 13 have no login. A child of 13 or over gets a login only after a parent approves it, and a parent can switch it off again (0046, UR-16). Students aged 13 or over see their own consents read-only (0053).
- **Public concern.** Children's images, health data and safeguarding are high-sensitivity areas. The ICO has published guidance on children's data and the Children's Code.
- **Relevant codes and guidance:**
  - **Children's Code.** Applies to "information society services likely to be accessed by children". **DECISION NEEDED:** whether the family and student app is in scope. Given the student login, assume it is unless advised otherwise.
  - **KCSIE.** Statutory guidance for schools and colleges in England. A private dance school may not be directly bound by it. The DfE's guidance for out-of-school settings and the school's own safeguarding policy are likely the relevant frameworks. **DECISION NEEDED:** which safeguarding framework each school follows. This drives safeguarding retention and the handling of allegations (the app already labels staff allegations "follow the LADO process", 0047).
  - **PECR.** Applies to marketing email and SMS once delivery exists.

### 2.4 Purposes

| # | Purpose | Main data categories (row numbers from §2.2) |
|---|---|---|
| P1 | Running classes: timetable, enrolment, registers, cover, waiting lists | 1, 5, 7, 16, 17 |
| P2 | Keeping children safe in class: medical needs, emergencies, collection | 2, 3, 4 (photo), 6 |
| P3 | Safeguarding: concerns, allegations, welfare watch, staff checks | 6, 7, 11, 12, 19 |
| P4 | Teaching and progress: feedback, skills, exams, practice | 8, 9 |
| P5 | Billing and accounts | 5, 13 |
| P6 | Communication with families: messages, notices, notifications | 5, 14, 16 |
| P7 | Admissions: enquiries and trials | 15 |
| P8 | Photos and video for teaching, shows and promotion | 4, 10 |
| P9 | Marketing (only with separate consent) | 4, 5, 15 |
| P10 | Accountability and security: audit, access logs, support access | 18, 19, 20 |
| P11 | Running the platform: plans, school lifecycle | 20 |

---

## 3. Consultation

**DECISION NEEDED** for each row: who is consulted, when, and how the result is recorded.

| Who | Status | Notes |
|---|---|---|
| End-user panel (24 simulated personas: owners, admins, teachers, parents, students, safeguarding) | Done as a design review (`docs/review/REPORT.md`, panel-*.md). **These were simulated reviewers, not real data subjects** | Many privacy fixes came from it (UR-08, 09, 12, 16, 17, 38) |
| Real parents and carers | Not done | Recommended before launch. `REPORT.md` §26 has a validation plan |
| Children and young people, in age-appropriate form | Not done | Children's Code standard 2 expects children's views to be considered where appropriate |
| Each school's DSL | Not done | Must confirm the safeguarding workflow, retention periods and the "who sees what" text |
| Swayvo DPO or specialist | Not done | This document |
| Information security reviewer or pen tester | Not done | Required before real data (§10) |
| Processors and sub-processors | Not chosen | Depends on R-001, R-002, R-003, R-006 |

---

## 4. Controller and processor roles

| Party | Proposed role | Evidence and notes |
|---|---|---|
| Each dance school | **Controller** for its families', children's and staff data | DECISIONS: "Under UK GDPR Swayvo is the schools' data processor." Each school sets its own retention, consents, DSL and privacy notice URL (`studio.privacy_notice_url`, 0040) |
| Swayvo | **Processor** for school data | Platform staff cannot see family-level data without a grant (`SECURITY.md`, 0019). **DECISION NEEDED:** Swayvo is likely a **controller** for its own data, such as school account contacts, billing of schools, platform logs and security monitoring. Confirm where that line falls |
| Hosting / database provider | Sub-processor | **Not chosen (R-002).** Supabase is the planned target (`ARCHITECTURE.md`) |
| Authentication provider | Sub-processor | **Not built (R-001).** Supabase Auth is planned |
| Email and SMS providers | Sub-processor | **Not built (R-003).** The worker supports Postmark, Resend and Twilio (`DELIVERY.md`) |
| Push notification services | Browser vendors' push services receive encrypted payloads | `web-push` dependency, `push_subscription` (0035). **DECISION NEEDED:** confirm the payload content (notifications carry no health detail, `SECURITY.md`) |
| Payment provider | **Independent controller for card data** (usually), processor for some flows | **Not built (R-006).** Stripe Checkout is planned (`PAYMENTS.md`). No card data reaches Swayvo |

**DECISION NEEDED:**
- Draft a data processing agreement (Article 28) between Swayvo and each school, covering instructions, confidentiality, security, sub-processor approval, assistance with rights and DPIAs, breach notice, deletion or return at the end (§9 of the retention policy), and audits.
- Publish a sub-processor list and a change-notice process.

---

## 5. Lawful basis

These are suggested options only. The controller (each school), advised by the DPO, chooses and records the basis. **DECISION NEEDED** on every row. Where a DPA 2018 Schedule 1 condition is relied on, an Appropriate Policy Document is likely required (Schedule 1 Part 4).

| Purpose | Article 6 options to consider | Article 9 / Article 10 options to consider | Points for the specialist |
|---|---|---|---|
| P1 Running classes | 6(1)(b) contract with the parent. 6(1)(f) legitimate interests for some elements | n/a | The contract is with the parent, not the child. Check how this applies to the child's data |
| P2 Medical needs and emergencies | 6(1)(b) or 6(1)(f). 6(1)(d) vital interests in an emergency | 9(2)(a) explicit consent. DPA 2018 Sch 1 para 18 (safeguarding of children and individuals at risk). 9(2)(c) vital interests only where consent cannot be given | Explicit consent can be withdrawn. Decide what happens to a child who attends if it is. The teacher brief was widened by the owner's decision (0020), so check proportionality (§6) |
| P3 Safeguarding concerns and allegations | 6(1)(f) legitimate interests. 6(1)(c) where a legal duty applies. 6(1)(d) | DPA 2018 Sch 1 para 18. Article 10 and DPA s.10(5) for allegations involving offences | Not consent-based. Families are not told about concerns in the app (privacy page) |
| P3 Staff DBS and checks | 6(1)(b) or (c) or (f) | Article 10 with DPA 2018 Sch 1 Part 1 para 1 (employment), or para 18 | DBS code of practice limits keeping certificate information. The app stores a reference and dates, not the certificate (`staff_check`) |
| P4 Feedback and progress | 6(1)(b) or (f) | Support notes may be health data: Art 9 condition needed | Profiling of children is relevant to Children's Code standard 12 (§7) |
| P5 Billing | 6(1)(b). 6(1)(c) for keeping accounting records | n/a | Retention under tax and company law. See the retention policy |
| P6 Communication | 6(1)(b) or (f) | n/a | Teachers write into the family conversation, visible to the office (DECISIONS) |
| P7 Enquiries and trials | 6(1)(b) (steps before a contract) or (f) | Trial medical details (0050): as P2 | |
| P8 Photos and video | 6(1)(a) consent is the likely basis for publication. 6(1)(f) may suit internal teaching use | n/a (photos are not biometric unless processed as such) | Consent is per child and per kind, with history. The most restrictive choice wins when guardians disagree (0047) |
| P9 Marketing | 6(1)(a) consent, plus PECR | n/a | Already a separate unticked choice on public forms (0040, DECISIONS) |
| P10 Audit and security | 6(1)(c) (Art 5(2), 32) or (f) | As for the data logged | |
| P11 Running the platform | 6(1)(b) contract with the school. 6(1)(f) | n/a | Swayvo as controller (§4) |

**Children's own consent.** If any processing offered directly to a child relies on consent, Article 8 and DPA 2018 s.9 set the age at 13. The app's minimum login age (13, raisable to 18, 0053) is consistent with this, but the lawful basis for student logins is still **DECISION NEEDED**.

---

## 6. Necessity and proportionality

Evidence from the design that data is minimised and access limited:

| Principle | Evidence |
|---|---|
| Minimisation: health | Health data is held apart from `student` (0002). Teachers have no `select` on `medical_record`. They get `student_safety_brief`, without GP details, and only for children they teach, cover or take to events (0020, 0047). The suite asserts the view's columns, so widening it needs a deliberate decision (`SECURITY.md`) |
| Minimisation: cover | A covering teacher sees the children on the session's day only, down from 2 days before to 14 days after (0048) |
| Minimisation: platform | Swayvo staff see account facts and counts by role, never names (0019, DECISIONS). Support access must be granted by the owner, is read-only, lasts at most 7 days, is logged, and never includes health records |
| Minimisation: notifications | Notifications say *that* health details changed, never what (DECISIONS, tested). Safeguarding notifications name nobody (0047) |
| Minimisation: third parties | Fonts are self-hosted: no third-party requests from families' phones (DECISIONS). No analytics library is listed in `package.json` dependencies |
| Minimisation: logos | Logos are redrawn to PNG, which strips metadata and scripts (DECISIONS, `SECURITY.md`) |
| Minimisation: calendars | Calendar links carry random tokens, not identities (0041, DECISIONS) |
| Purpose limitation | Role model matches each job. Teachers see no money and no family conversations (`SECURITY.md`). A school sees nothing of another school (0032 `app.in_scope`). Only the teacher's own timetable crosses schools, and only as "busy" by default (0055) |
| Shared care | Per-guardian restrictions on schedule, payments, feedback, medical, contact and collection are enforced by restrictive policies on every read path (0046, 0053). Each guardian's messages are private to them and the office (0046) |
| Accuracy | Parents correct everyday details themselves (0056). Legal name, DOB and medical changes go through the office, with an audit trail (0044, 0056). Consent history is kept (0047) |
| Storage limitation | `retention_policy` and `app.apply_retention` (0030, 0040, 0047). Gaps are listed in the retention policy |
| Transparency | The privacy page explains who sees what (`WHO_SEES`). Public forms require acknowledging the school's privacy notice (0040) |
| Rights | Family data download as JSON. "Ask to delete" (`app.request_family_erasure`, 0047) creates a request with a one-month reply reminder |
| Accountability | Append-only `audit_log`. Medical views by the office are logged (0044). Safeguarding reads and exports are logged (0047) |

**Points for the specialist to weigh. DECISION NEEDED on each:**
- **Teacher brief.** It includes conditions and medications, not just allergies (owner's decision, 0020). Is this proportionate for every teacher of the child?
- **Medical records for location-limited admins.** These admins can read medical records at their locations (0054). Is that necessary?
- **Family download.** It leaves out office notes and teachers' private notes (`src/lib/repos/privacy.ts`). A complete subject access response must come from the office.
- **Retention gaps.** 0058 added rules for attendance, support notes, staff, messages, audit and access logs and the DSL note, with long defaults the school must confirm. Categories still without a rule: the collection list (row 3), shared-care flags (row 6), progress records (row 8), media (row 10), requests and notifications (row 14), accounts (row 16) and events (row 21) in §2.2.

---

## 7. Children's Code: standards and where they touch Swayvo

This section does not claim conformance. It maps the 15 standards to the product so the specialist can assess them.

| Standard | Where it touches Swayvo | Status / DECISION NEEDED |
|---|---|---|
| 1 Best interests of the child | Design choices such as no leaderboards or streaks (DECISIONS) and no student-uploaded video | Specialist to assess |
| 2 DPIA | This document | In progress |
| 3 Age-appropriate application | Under-13s have no login (0053). 13+ need parent approval (0046). An under-8 preset exists for feedback chips (0049) | **DECISION NEEDED:** age bands for privacy information |
| 4 Transparency | The privacy page is written for parents | **Not built:** a child-friendly privacy notice for students aged 13 or over. **Action** (§10) |
| 5 Detrimental use | Milestones celebrate without pressure, and absences never take anything away (DECISIONS) | Specialist to assess |
| 6 Policies and community standards | Schools set their own policies | **DECISION NEEDED** |
| 7 Default settings | Skill levels reach families with the share step by default (0049). Marketing is off by default (0040). Consent with no record means no consent (0047) | Review each default |
| 8 Data minimisation | §6 | Gaps in §6 |
| 9 Data sharing | No sharing between schools except a teacher's own timetable (0055) | Sub-processors TBD |
| 10 Geolocation | No geolocation found in the code reviewed | Confirm |
| 11 Parental controls | Parents see children's attendance, feedback and messages | **DECISION NEEDED:** how a 13+ student is told what their parents can see |
| 12 Profiling | Skill assessments and the attendance welfare watch (opt-in per child by the DSL, 0047) | **DECISION NEEDED:** whether these count as profiling and what safeguards apply |
| 13 Nudge techniques | No streaks (DECISIONS) | Review notification prompts |
| 14 Connected toys and devices | n/a | |
| 15 Online tools | Data download and "ask to delete" are for guardians only (0047) | **DECISION NEEDED:** whether students aged 13 or over need their own route to exercise rights |

---

## 8. Risk register

**Scoring.** Likelihood: Remote / Possible / Probable. Severity: Minimal / Significant / Severe. Overall: Low / Medium / High, combined in the usual ICO way. The scores are the author's first view. **DECISION NEEDED:** the DPO confirms or changes every score.

| # | Risk to individuals | Likelihood | Severity | Inherent | Measures already in place (cite) | Residual (draft) |
|---|---|---|---|---|---|---|
| R1 | **One family sees another family's data**, or one school sees another's | Possible | Severe | High | RLS with `FORCE` on all tables (`SECURITY.md`). No tenant filter in queries, so a policy gap shows up as a fault (`ARCHITECTURE.md`). School scope helper (0032). Over 590 tests covering cross-studio and guardian scoping (`FIXES.md`) | Medium. **Needs an independent security review** |
| R2 | **Teacher sees more than needed**: other classes, full medical record, money, family messages | Possible | Significant | Medium | No teacher policy on `medical_record`. Brief limited to own students (0047). Cover limited to the day (0048). Moved students limited to 60 days, drop-ins to 30 days (0052). Messages leak closed (0017). Location-scoped teachers (0054) | Low–Medium. **Teacher brief widening (0020) to be confirmed** |
| R3 | **Separated parents**: a restricted parent sees the child's medical record, schedule or location, or the other parent's invoices or messages | Possible | Severe | High | `guardian_access` flags enforced by restrictive policies on every path, including the brief and the download (0046, 0053). Private guardian messages (0046). Split billing (0052). Collection list on the register (0046). Court-order note readable by the DSL only. **Known gaps:** credit on account comes off the oldest invoice whichever guardian it is addressed to, and "Coming up" can show the other guardian's invoice number (`FIXES.md` UR-17). Restrictions depend on the office setting them | Medium |
| R4 | **Child login misused**: an under-13 has an account, a teen is pressured, or a shared device exposes data | Possible | Significant | Medium | Database refuses logins under 13 (0053). Parent approval and switch-off (0046). Students see only their own data, no invoices or messages (privacy page). **Real sign-in, session timeout and recovery are not built (R-001)** | Medium until R-001 |
| R5 | **Media of children** exposed to the wrong families, kept without consent, or leaked through public links | Possible | Severe | High | Students never upload video (DECISIONS). Programmes name a child only with photo consent. Consent history, with the most restrictive choice winning (0047). **Being tightened: confirm against migration 0057** (§8.1). No retention rule for media | High until 0057 is confirmed and storage is decided |
| R6 | **Safeguarding records exposed** to the wrong staff, including the subject of an allegation | Remote–Possible | Severe | High | No table read policy. Function-only access, owner and DSL only. Every look is logged, once per opening (0030, 0047). Allegations hidden from their subject, and notifications skip the subject (0047). Export only by owner or DSL, and logged (0047) | Medium. **The owner always has access, so a concern about the owner has no route that excludes them.** DECISION NEEDED |
| R7 | **Safeguarding records deleted too early**, or the chronology lost | Possible | Severe | High | Concerns kept indefinitely unless the owner sets `concern_months`. A child with an open concern, a held concern or a legal hold is not anonymised (0047). A hold on a single concern covers concerns about adults and staff; a held concern is never deleted. A held child keeps everything, the medical record included. A deleted concern's access-log rows are kept, detached and marked (all 0058). **Gaps:** (a) one period for concerns about children and allegations against staff. (b) Deleting a concern still deletes its action history. (c) Erasing a school deletes its safeguarding records (0019) | Medium–High until periods are set and the school-exit handover exists |
| R8 | **Weak authentication**: anyone can pick an identity in the demo | Certain in the demo | Severe | High | Explicitly **not built (R-001)**. Who a user *is* is not verified, but what an identity sees is enforced (`SECURITY.md`). Invitation tokens are hashed, expire after 14 days and work once (0019) | **High. Blocks real use** |
| R9 | **Offline register data on teachers' phones**: a lost or shared phone exposes children's ids and absence reasons | Possible | Minimal–Significant | Medium | The queue holds ids, not names (`attendance-queue.ts`). Marks are sent only as the user who made them. Sign-out is blocked until marks are sent (`register-sync.tsx`). **Not encrypted at rest in `localStorage`. The cached app may hold other data** | Medium. **DECISION NEEDED:** device policy for staff |
| R10 | **Breach at hosting or a sub-processor** | Possible | Severe | High | No card data stored (`SECURITY.md`). Provider keys only in the worker environment (`DELIVERY.md`). **Hosting, backups, encryption at rest, monitoring and breach procedure are not built (R-002)** | High until R-002 |
| R11 | **International transfers** (outside the UK) | Probable if US-based providers are chosen | Significant | Medium–High | None yet. Providers named in docs (Supabase, Postmark, Resend, Twilio, Stripe) are not chosen. **DECISION NEEDED:** UK or EEA hosting region, and transfer mechanism (adequacy, the UK–US data bridge, IDTA or Addendum) with a transfer risk assessment | Unknown |
| R12 | **Inaccurate data**, such as a wrong allergy or a stale emergency contact, causing harm | Possible | Severe | High | Medical changes go through the office with an audit trail (0044, 0056). Medical update requests (0021). Parents manage emergency contacts and consents. **No periodic "check your details" prompt found** | Medium. **DECISION NEEDED:** annual review prompt |
| R13 | **Retention failures**: kept too long, or deleted wrongly | Probable | Significant | High | `app.apply_retention` with preview, audit and holds (0047, 0058). A monthly automatic preview from `app.tick` tells the owner what is due; an opt-in setting (off by default) applies the previewed items 14 days later, and every automatic run is logged. Soft-deleted children and rows are included. Messages, attendance, support notes, staff, logs and the DSL note have rules (0058). **Gaps:** media, collection lists, requests, notifications, accounts and events have no rule; the periods are defaults the school has not confirmed (see retention policy) | Medium until the periods are confirmed and the remaining categories have rules |
| R14 | **Swayvo platform staff access** | Remote | Severe | Medium | Platform admins see zero family-level rows (tested). Support is owner-granted, at most 7 days, read-only by transaction, logged in the school's audit log, and never includes medical (0019). Only a super admin can erase, and only after a 30-day notice (0019). **Database administrators at the hosting level bypass RLS** | Low–Medium. **DECISION NEEDED:** privileged-access controls at the hosting level |
| R15 | **Messages create private staff–child channels** | Remote | Severe | Medium | No private teacher–parent threads. Teacher messages are visible to the office (DECISIONS, 0017). **DECISION NEEDED:** confirm what messaging, if any, students aged 13 or over can use | Low |
| R16 | **Email or SMS sent to the wrong person, or containing sensitive detail** (once built) | Possible | Significant | Medium | **Not built (R-003).** The queue design respects preferences, quiet hours and retries (`DELIVERY.md`). Notifications carry no health data | Unknown until R-003 |
| R17 | **Payments**: card data exposure, wrong charges | Remote | Significant | Medium | **Not built (R-006).** Hosted Checkout is planned. The amount comes from the database. Webhooks are verified and idempotent (`PAYMENTS.md`) | Low once built as designed |
| R18 | **Rights requests mishandled**: no reply within one month, or an incomplete download | Possible | Significant | Medium | Download and "ask to delete" (0047). The request reminds the office to reply within one month. **The process needs specialist review** (`FIXES.md` UR-38). The download leaves out office notes | Medium |
| R19 | **Location-limited admin over-access** | Possible | Significant | Medium | Deny-by-default; read-only at their own locations (0054) | Low–Medium. Confirm medical access is needed |

### 8.1 Student video and photo access (cross-reference for R5)

> **CONFIRM AGAINST MIGRATION 0057.** Another engineer is changing this now. The author has not seen it.

Student video and photo access is **being tightened**:

- teachers are limited to their own classes' material;
- media showing children are hidden from families unless every named child has video or photo consent;
- media move to private storage with short-lived signed links.

What is visible today: media are `resource` rows (scopes `studio`, `class`, `level`, `student`) with flags `visible_to_students` and `visible_to_guardians` (0010). Uploaded bytes are in `resource_file` and inherit the resource's visibility (0012). In the demo, files are stored in Postgres. `storage_path` is reserved for hosted storage. Consent kinds `photography`, `video` and `social_media` are managed with history (0047).

**DECISION NEEDED:** retention periods for media; whether withdrawing consent removes existing media; and how media already shared outside Swayvo is handled.

---

## 9. Measures to reduce risk further

| Risk | Proposed measure | Effect | Residual after | Approved? |
|---|---|---|---|---|
| R8 | Build real sign-in (R-001): email link, recovery, session timeout for shared family devices, second factor for owner and DSL (`REPORT.md` UR-13) | Reduces | Medium | DECISION NEEDED |
| R10, R11 | Choose UK or EEA hosting (R-002). Encryption at rest. Backups with defined retention. Least-privilege database access | Reduces | Medium | DECISION NEEDED |
| R7 | Set safeguarding periods, separately for allegations. Require safeguarding export or transfer before a school is erased. (Built in 0058: holds on staff and adult concerns, access-log rows kept on deletion, holds keep the medical record) | Reduces | Medium | DECISION NEEDED |
| R13 | Confirm the periods added in 0058 and whether to turn automatic applying on. Add rules for the categories that still have none. (Built in 0058: monthly preview from `app.tick`, opt-in automatic apply, soft-deleted rows included, rules for messages, attendance, support notes, staff, logs and the DSL note) | Reduces | Medium | DECISION NEEDED |
| R5 | Confirm 0057. Media retention. Signed-link expiry | Reduces | Medium | DECISION NEEDED |
| R9 | Staff device policy: screen lock, no shared browser profiles. Consider clearing cached data on sign-out | Reduces | Low | DECISION NEEDED |
| R6 | A route for concerns about the owner, for example to the DSL only or out of the app | Reduces | Low–Medium | DECISION NEEDED |
| R12 | Termly or annual "check your child's details" prompt | Reduces | Low–Medium | DECISION NEEDED |
| R1–R3 | Independent penetration test and RLS review | Reduces | Low–Medium | DECISION NEEDED |

---

## 10. Actions before onboarding any real school

| # | Action | Owner | Status |
|---|---|---|---|
| A1 | Build and security-review real sign-in and account recovery (R-001, UR-13) | Swayvo | **Not built** |
| A2 | Decide hosting provider and region, backups, encryption, logging and monitoring (R-002) | Swayvo | **Not decided** |
| A3 | Decide email, SMS and push providers. Review message content and PECR (R-003) | Swayvo | **Not built** |
| A4 | Decide card and Direct Debit provider (R-006). Confirm the controller/processor position | Swayvo | **Not built** |
| A5 | Data processing agreement with each school. Sub-processor list. International transfer assessment | Swayvo + DPO | Not started |
| A6 | Breach procedure: detection, triage, 72-hour ICO notification by the controller, processor notice to schools without undue delay, a log of incidents | Swayvo + schools | Not started |
| A7 | Privacy notices: (a) Swayvo's own; (b) a template for each school's parents (`studio.privacy_notice_url`, 0040); (c) **an age-appropriate notice for students aged 13 or over**, and a simpler explainer for younger children if they use the app | Schools + DPO | Not started |
| A8 | Retention periods agreed with each school's adviser. Close the remaining gaps in `RETENTION-POLICY-DRAFT.md` | Schools + Swayvo | Defaults only. Several gaps closed in 0058 |
| A9 | Confirm student video access against migration 0057 | Swayvo | In progress |
| A10 | Independent security review and penetration test, including RLS, support access and the platform console | Swayvo | Not started |
| A11 | Appropriate Policy Document(s) where DPA 2018 Schedule 1 conditions are relied on | Schools + DPO | Not started |
| A12 | Rights-request process for access, rectification, erasure and objection, including for students aged 13 or over (UR-38: "process still needs specialist review") | Schools + DPO | Partly built |
| A13 | DSL review of the safeguarding workflow and of the privacy page text against the RLS rules | Each DSL | Not started |
| A14 | Staff training and device policy | Schools | Not started |
| A15 | DPO sign-off of this DPIA. Decide on ICO prior consultation (Art 36) | DPO | Not started |
| A16 | Set a review date for this DPIA and triggers for re-review (new features, new sub-processors, incidents) | DPO | Not started |

---

## 11. Sign-off

| Item | Name / date | Notes |
|---|---|---|
| Measures approved by | | |
| Residual risks approved by | | If any residual risk is high, consider ICO consultation before going ahead |
| DPO advice provided | | |
| Summary of DPO advice | | |
| DPO advice accepted or overruled by | | If overruled, give reasons |
| Consultation responses reviewed by | | |
| This DPIA will be kept under review by | | |
| Next review date | | |

---

## 12. Sources

- `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/PAYMENTS.md`, `docs/PLATFORM.md`, `docs/DELIVERY.md`, `docs/review/REPORT.md`, `docs/review/FIXES.md`
- Migrations 0002 (core), 0005 (audit, communication), 0006/0019 (RLS, platform, support), 0010/0012 (resources), 0017 (inbox), 0020 (teacher medical brief), 0030 (safeguarding, retention), 0040 (public forms, retention), 0044 (audit history, medical view log), 0046 (family and shared care), 0047 (consent, safeguarding, legal hold, erasure request), 0048 (register, cover), 0049 (progress, support notes), 0052 (teacher scope, split billing), 0053 (accounts, under-13 rule), 0054 (locations), 0055 (cross-school agenda), 0056 (parent-edited details), 0058 (retention fixes)
- `src/lib/repos/privacy.ts`, `src/app/family/privacy/page.tsx`, `src/lib/offline/attendance-queue.ts`, `src/lib/offline/register-sync.tsx`, `src/components/app/safeguarding.tsx`
- Companion: `docs/compliance/RETENTION-POLICY-DRAFT.md`
