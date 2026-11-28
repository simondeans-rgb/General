# Swayvo: Data Retention Policy (DRAFT)

> **DRAFT FOR SPECIALIST REVIEW. NOT AN ADOPTED POLICY.**
>
> An engineer prepared this draft from the code on 27 November 2026, and updated it for migration 0058 (`0058_retention_fixes.sql`), which closed several of the gaps the first draft found, for migration 0059 (`0059_media_retention.sql`, videos and photos of children) and, on 28 November 2026, for migration 0065 (`0065_safeguarding_round4.sql`: hold review dates, children named in a concern, checks for office staff). It describes what the software **does today** and lists what each school and its adviser, DPO or legal specialist must decide. It is not legal advice.
>
> - It does **not** claim compliance with UK GDPR (including the storage limitation principle, Article 5(1)(e)), the Data Protection Act 2018, the ICO Children's Code, KCSIE, HMRC record-keeping rules or any other requirement.
> - Each dance school is the controller and owns its retention schedule. Swayvo, as processor, provides the tools. The periods below are the software's **defaults**. DECISIONS.md says they are "**To confirm with the school's adviser.**"
> - Every point the school or DPO must settle is marked **DECISION NEEDED**.
> - Companion document: `docs/compliance/DPIA-DRAFT.md`.

---

## 1. How retention works in the software today

### 1.1 The settings: `retention_policy`

There is one row per school. The row is created automatically when a school is created (trigger `studio_retention`, migration 0030). Only the **owner** can change it (policy `retention_owner`). Administrators can read it (`retention_admin_read`). The owner edits it on the Account page, under "Keeping data" (`src/components/app/safeguarding.tsx`).

| Column | Meaning | Default | Range the database allows | Migration |
|---|---|---|---|---|
| `medical_months` | Delete a leaver's medical record after this many months | **12** | 1–120 | 0030 |
| `personal_months` | Anonymise a leaver after this many months | **36** | 6–240 | 0030 |
| `financial_months` | Keep family names on invoices for this many months after the last invoice | **72** (6 years) | 12–240 | 0030 |
| `prospect_days` | Remove inactive enquiries and trial-only prospects after this many days | **90** | 30–730 | 0040 |
| `concern_months` | Delete closed safeguarding concerns after this many months | **none (keep)** | null, or 12–600 | 0040 |
| `support_months` | Delete a leaver's support note after this many months | **12** | 1–120 | 0058 |
| `attendance_months` | Delete a leaver's attendance, absence reports, imported attendance and make-up offers after this many months | **72** | 12–240 | 0058 |
| `message_months` | Delete messages (`communication`) this many months after they were sent | **36** | 6–120 | 0058 |
| `dsl_note_months` | Clear the lead's shared-care note (`guardian_access.dsl_note`) this many months after every child in the family has left | **72** | 12–300 | 0058 |
| `staff_check_months` | Clear certificate numbers and notes on a former member of staff's checks after this many months | **12** | 6–120 | 0058 |
| `staff_months` | Anonymise a former member of staff's record and delete their checks after this many months | **72** | 12–240 | 0058 |
| `audit_months` | Delete audit-log and safeguarding access-log entries older than this | **72** | 24–240 | 0058 |
| `media_months` | Delete videos and photos that show children this many months after the last child named in them has left (material naming nobody: after it was added) | **12** | 1–120 | 0059 |
| `auto_apply` | Apply the monthly preview automatically, 14 days after it is made | **off** | on / off | 0058 |
| `auto_preview_at`, `auto_preview_count`, `auto_preview_items`, `auto_applied_at` | The latest automatic preview: when, how many items, exactly which items, and when it was applied | | Written by the scheduler | 0058 |
| `last_run_at` | When retention was last applied | | | 0030 |

The settings screen is **Account, Keeping data** (`RetentionCard` in `src/components/app/safeguarding.tsx`). Every period added in 0058 is labelled there "Check with your data protection adviser". The defaults are deliberately long. They are starting points, not recommendations. **DECISION NEEDED:** each school confirms or changes every period.

### 1.2 Who counts as a leaver: `app.leaver_since` (0030), `app.retention_left_on` (0058)

A child is a leaver when they have **no** active enrolment, **no** waiting-list place that is waiting or offered, and **no** trial that is requested or booked. The leaving date is the latest enrolment end date. If there is none, it is the latest trial date, and failing that, the date the record was created.

Since 0058, a child the office soft-deleted (`student.deleted_at` set) is always a leaver. Their clock starts from the later of the leaving date and the deletion date.

A member of staff has left when their record is inactive or removed and they no longer have a staff login at the school. The leaving date is `staff_member.left_at`, stamped when the record is made inactive or removed (0058). Existing inactive records were given their last update date.

### 1.3 The run: `app.apply_retention(studio, apply)` (0058; extended by 0059 for media and 0065 for checks recorded by login)

- **Only the owner** can run it. Anyone else gets `FORBIDDEN: only the owner runs data retention`. The work itself is done by the internal `app.retention_run`, which no user can call.
- `apply = false` gives a **preview**: a list of what would happen, with names and, for anything held, the reason (`PREVIEW_RETENTION`, `src/lib/repos/safeguarding.ts`). Each row now carries an `entity_id`.
- `apply = true` carries it out. **Every step writes an `audit_log` row** with action `retention`.
- **Scheduling (0058).** `app.tick()` calls `app.retention_tick` for each school. Once a month it makes an automatic **preview**, records exactly which items were due, writes an audit row ("Automatic retention preview: N records due") and, if anything is due, notifies the owner: "N records are due under your retention policy — review and apply". The owner setting **"Apply automatically each month"** is **off by default**. When it is on, the scheduler applies the previewed items that are still due once the preview has been available for **14 days**. Anything that became due after the preview waits for the next month. The automatic apply is logged ("Automatic retention applied: N changes") and the owner is told. When the setting is off, nothing is ever applied without the owner pressing "Apply now". **DECISION NEEDED:** whether a school should turn automatic applying on, and whether 14 days' notice is right.

The steps, in order:

| Step | Applies to | What happens |
|---|---|---|
| `held` | Any child, family conversation, shared-care note or member of staff with something due, where a hold applies (see below) | **Nothing is changed**, the medical record included. Listed with the reason |
| `purge` | A child who is still coming, with medical rows soft-deleted more than `medical_months` ago, or emergency-contact or consent rows soft-deleted more than `personal_months` ago | Those soft-deleted rows are **hard-deleted** |
| `medical` | Leavers (not prospects), soft-deleted children included, whose leaving date is more than `medical_months` ago and who have a medical record, live or soft-deleted | The `medical_record` row is **hard-deleted** |
| `anonymise` | Leavers more than `personal_months` ago with no hold, soft-deleted children included | Deletes `emergency_contact` and `consent_record` (soft-deleted rows included), `student_reflection` and `welfare_watch`. Clears `feedback_note.private_note`, `going_well` and `work_on`. Sets the name to "Former student" and the DOB to 1 January of the birth year. Removes the login link (`user_id = null`, `login_enabled = false`) |
| `support` | Leavers more than `support_months` ago with a support note | The `student_support_note` row is **deleted** |
| `attendance` | Leavers more than `attendance_months` ago | Their `attendance_record`, `absence_report`, `attendance_history` and `makeup_offer` rows are **deleted** |
| `prospect` (enquiries) | Enquiries not at stage `enrolled` with no activity (update or trial) for `prospect_days` | The `enquiry` row is **deleted** |
| `prospect` (families) | Prospect families (`family.is_prospect`) older than `prospect_days`, with no recent trial, **no invoice**, and no held child | Deletes medical records and emergency contacts. Children, guardians and family are renamed "Former prospect", contact and address fields are cleared, and they are soft-deleted |
| `financial` | Non-prospect families whose children are **all** anonymised (soft-deleted children included) and whose last invoice is more than `financial_months` ago | Guardian names become "Former guardian" and email, phone and login link are cleared. The family name becomes "Former family" and the address and notes are cleared. **Invoices and amounts are kept** |
| `dsl_note` | Shared-care notes where every child in the family left more than `dsl_note_months` ago, and none is held | `guardian_access.dsl_note` is **cleared**. The restriction flags stay |
| `messages` | Messages sent more than `message_months` ago, grouped by family conversation (class notices and announcements together). A family with a held child keeps its messages | The `communication` rows are **deleted**, with their read receipts |
| `staff_check` | Former staff who left more than `staff_check_months` ago | Certificate numbers (`reference`) and notes on their checks are **cleared**. The kind and dates of each check stay |
| `staff` | Former staff who left more than `staff_months` ago | Their checks are **deleted**. The record is renamed "Former staff" and email, phone, bio, login link and DBS date are cleared. Anyone a safeguarding concern is about is **held** while that concern is kept. Since 0065 the same two steps cover checks recorded against a login (office staff and owners with no staff record), counted from when their last staff role at the school was removed |
| `media` | Material marked as showing children (`resource.shows_children`, not confirmed as having no identifiable child) whose last named child left more than `media_months` ago, and none of them held; material naming nobody, more than `media_months` after it was added (0059) | The `resource` row is **deleted**, with its files, assignments and named children. In hosted storage the object key is queued in `media_deletion` for the storage worker. If any named child is held, it is listed as `held` |
| `concern` | Only if `concern_months` is set: closed concerns last updated more than `concern_months` ago, where neither the child nor the concern is under a legal hold | The `safeguarding_concern` row is **deleted**, with its `safeguarding_action` rows. Its `safeguarding_access` rows are **kept**: detached, with the concern's id in `deleted_concern_id` and the note "concern deleted under retention on <date>" |
| `audit` | `audit_log` entries older than `audit_months`, except entries about a held child, a concern that is still kept or a member of staff a concern is about | **Deleted** (one preview line for the batch) |
| `access_log` | `safeguarding_access` entries not attached to a live concern, older than `audit_months` (detached rows are counted from when their concern was deleted) | **Deleted** (one preview line for the batch) |

**What a hold keeps (0058).** `app.retention_hold_reason` finds a reason when a child has: a legal hold; a legal hold on any of their concerns; a concern that is not closed; a closed concern still inside `concern_months` (or kept indefinitely); or, since 0065, is named as a child involved in a concern about an adult or a member of staff that is still kept. A held child keeps **everything**: the medical record, support note, attendance, contacts, consents and details. Their family keeps its messages and shared-care note, and audit entries about them are kept. Before 0058 the medical record was deleted before the hold was checked.

---

## 2. Retention schedule

"Range in app" shows what the database will accept. "Trigger" is the event the clock starts from. "Gap" means the software has no rule today.

| Data | Default period | Range allowed in the app | Trigger | Action | Notes | DECISION NEEDED |
|---|---|---|---|---|---|---|
| Medical record (`medical_record`), special category | 12 months | 1–120 months | Child left (`retention_left_on`). For a soft-deleted medical row on a current child: its deletion date | **Delete** (hard) | **Kept while a hold applies** (0058). Soft-deleted rows are included (0058) | Period. Whether a recorded injury or incident should also keep it (personal injury claims for children can be brought until about age 21) |
| Child identity (`student`) | 36 months | 6–240 months | Child left, or for a soft-deleted child the later of leaving and deletion | **Anonymise** (name to "Former student", DOB to year only) | Soft-deleted children are included (0058) | Period |
| Emergency contacts (`emergency_contact`) | With the child: 36 months. A contact soft-deleted from a current child: 36 months after deletion | as above | Child left, or row deleted | **Delete** | Third-party data | Shorter period? |
| Collection list (`collection_permission`, 0046) | **Gap** | none | — | **Keep** (no rule) | Names and phone numbers of adults allowed or not allowed to collect | Period, and add to the run |
| Consent records (`consent_record`) | With the child: 36 months | as above | Child left | **Delete**, including history | This also deletes the evidence of consent for photos and videos already published | Whether consent history must outlive the child's anonymisation while related media exist |
| Student reflections (`student_reflection`) | 36 months | as above | Child left | **Delete** | | |
| Feedback text (`feedback_note`) | 36 months | as above | Child left | **Anonymise** (text fields cleared; the row stays) | `headline` is **not cleared** | Clear `headline` too? |
| Skills, progress reports, goals, milestones, practice logs, exam entries | **Gap** | none | — | **Keep**, linked to the anonymised child | Not touched by the run | Period, or anonymise with the child |
| Support notes (`student_support_note`, 0049) | 12 months (`support_months`) | 1–120 months | Child left | **Delete** | May be special category. Kept while a hold applies (0058) | Period. Default aligned with medical |
| Attendance (`attendance_record`, `absence_report`, `attendance_history`, `makeup_offer`) | 72 months (`attendance_months`) | 12–240 months | Child left | **Delete** | Absence reasons are free text. Kept while a hold applies, as attendance may be part of a safeguarding chronology (0058) | Period. Reports of past terms lose these children once deleted |
| Welfare watch (`welfare_watch`) | With the child: 36 months | as above | Child left | **Delete** | Skipped while a hold applies | |
| Photos and video of children (`resource` with `shows_children`, `resource_child`, `resource_file`) | **12 months** after the last named child leaves (unnamed: after it was added) | 1–120 months (`media_months`, 0059) | Last named child left | **Delete** the material and its files; hosted objects queued in `media_deletion` | Kept while any named child is still at the school, or held. Withdrawing consent hides it from families at once (0057) | Period. Whether withdrawing consent should delete rather than hide |
| Safeguarding concerns about a child | **Keep** (`concern_months` null) | null, or 12–600 months | Concern closed (measured from `updated_at`, which a later edit resets) | **Delete** if a period is set | Open or monitoring concerns are never deleted. A legal hold on the child blocks deletion | Period, from the school's safeguarding policy (DECISIONS notes "often until the child is 25"). Whether the trigger should be the child's date of birth rather than closure |
| Safeguarding concerns about adults or staff, including allegations | Keep, unless `concern_months` is set | as above | Concern closed | **Delete** if a period is set | **A legal hold on the concern itself now applies** (`safeguarding_concern_hold`, 0058): the DSL or owner places it from the concern, with a reason; it is logged, and a held concern is never deleted. Staff allegations often need longer retention under safeguarding guidance | Separate period for allegations |
| Safeguarding actions (`safeguarding_action`) | With the concern | — | Concern deleted | **Delete** (cascade) | | Whether a minimal summary should outlive the concern |
| Safeguarding access log (`safeguarding_access`) | 72 months (`audit_months`) | 24–240 months | Entry made; for a deleted concern's entries, the deletion | **Keep** with the concern; when the concern is deleted, **detach** (concern id and "concern deleted under retention on <date>" kept); **delete** after the period | Detached entries about an allegation stay hidden from the member of staff it concerned (0058) | Period |
| Legal hold on a child (`safeguarding_hold`, 0047) or on a concern (`safeguarding_concern_hold`, 0058) | Until released | — | Set or released by the DSL or owner | **Keep** | Logged in `safeguarding_access` and `audit_log` | Review cycle for holds |
| Shared-care restrictions and DSL note (`guardian_access`) | Note: 72 months (`dsl_note_months`) after every child in the family has left | 12–300 months | Last child left | **Clear** the note; the flags stay | The note may record a court order. Kept while any child in the family is held (0058) | Period. Whether the flags should go too |
| Guardian and family details | 72 months after the last invoice, once all children are anonymised | 12–240 months | Last invoice | **Anonymise** | A family that never had an invoice is anonymised once its children are | Period (see §4) |
| Invoices, payments, credit notes, refunds | **Kept indefinitely** | — | — | **Keep** (names removed by the step above) | Amounts and numbering stay intact for the accounts (DECISIONS) | Whether invoices are ever deleted |
| Bursaries and discounts (`family_discount`) | **Gap** | none | — | **Keep** | The reason may reveal circumstances | Period |
| Enquiries (`enquiry`) | 90 days without activity | 30–730 days | Last update or trial | **Delete** | Enquiries at stage `enrolled` are kept. Queued emails (`outbound_message`) linked to a deleted enquiry **stay**, with the address | Period. Clean up the outbox |
| Trial-only prospect families | 90 days | 30–730 days | Family created, with no recent trial | **Anonymise** and soft-delete | Skipped if the family has any invoice or a held child | |
| Public form log (`public_submission`: email, IP) | 1 day | fixed | Submission | **Delete** (on the next public submission, `app.public_guard`, 0040) | Used for rate limits | |
| Messages (`communication`, `communication_read`) | 36 months (`message_months`) | 6–120 months | Message sent | **Delete** | Conversations may name children and include health or welfare detail. A family with a held child keeps its messages (0058) | Period (see §5) |
| Requests (`studio_request`) | **Gap** | none | — | **Keep** | Includes `data_request` items | Period |
| Notifications, outbox, reminders (`notification`, `outbound_message`, `message_reminder`) | **Gap** | none | — | **Keep** | | Period |
| Staff checks (`staff_check`) | Certificate numbers and notes: 12 months (`staff_check_months`) after leaving. Whole check: with the staff record | 6–120 months | Staff member left (`left_at`) | **Clear** reference and note, then **delete** | DBS reference and dates, not the certificate | Period after staff leave (see §6) |
| Staff records (`staff_member`) | 72 months (`staff_months`) after leaving | 12–240 months | Staff member left (`left_at`) | **Anonymise** ("Former staff") | Held while any concern about them is kept (0058) | Period after staff leave (see §6) |
| Accounts and technical (`user_account`, `membership`, `push_subscription`, `calendar_token`, `notification_preference`) | **Gap** | none | — | **Keep** | Anonymisation clears `user_id` links but leaves the `user_account` row | Account deletion process (needs R-001) |
| Audit log (`audit_log`) | 72 months (`audit_months`) | 24–240 months | Entry made | **Delete** (users still cannot change or delete entries; only the retention run does) | Holds ids, actions, field names and short summaries (`SECURITY.md`). Entries about a held child, a kept concern or a member of staff a concern is about stay. Rows left after school erasure (`studio_id` null) are **not** touched | Period (see §7) |
| Events, costumes, tickets, helpers, chaperones | **Gap** | none | — | **Keep** | | Period |
| Offline register queue (teacher's device) | Until synced | — | Connection returns | **Delete** from the device once sent | `localStorage` key `barre.pending-marks.v1`. Sign-out is blocked while marks are unsent | Device policy |
| Support access grants and sessions | Grant lasts at most 7 days | 1–7 days | Granted | Expires. Rows **kept** | 0019 | Period for grant history |
| Backups | **Not built** | — | — | — | Depends on hosting (R-002) | See §8 |
| Whole school after cancellation | 30 days | fixed | School status set to `cancelled` | **Delete** everything (super admin, `app.platform_purge_studio`, 0019) | See §10 | Notice period, and safeguarding handover |

---

## 3. Safeguarding records and legal hold

**What is built:**
- **No default deletion.** DECISIONS: "Safeguarding record periods are a matter for the school's policy and legal advice (often until the child is 25)." The owner can set `concern_months` from 12 to 600 months.
- **Anonymisation stops for safeguarding.** A child is not anonymised while any of these applies (`app.retention_hold_reason`, 0047):
  - a legal hold;
  - a concern that is not closed;
  - a closed concern that is still kept.
  This fixed the panel's finding D-10 (`REPORT.md` §14, UR-12).
- **Legal hold.** The DSL or owner places it on a child with a reason (`app.set_safeguarding_hold`) and releases it (`app.release_safeguarding_hold`). Both actions are logged. Held children show in the preview with the reason.
- **Export.** `app.safeguarding_export` is for the owner or DSL only, and is itself logged.

- **Hold on a concern (0058).** The DSL or owner can hold a single concern, from the concern itself on the Safeguarding page (`app.set_concern_hold`, `app.release_concern_hold`). This covers concerns about adults and staff, which have no child to hold. A held concern is never deleted, and a hold on a child's concern also holds the child. Both actions are logged in `safeguarding_access` and `audit_log`. An allegation's hold is hidden from the member of staff it concerns, like the concern.
- **A hold keeps everything (0058).** A held child's medical record, support note, attendance, messages and shared-care note are kept, as well as their details.
- **The access log survives deletion (0058).** When a closed concern is deleted under retention, its access-log rows stay, detached, with the concern's id and "concern deleted under retention on <date>". They are deleted after `audit_months`, counted from the deletion.

- **Review dates (0065).** Every legal hold, on a child or on a concern, has a review date (a year after it is placed, by default). Holds due for review are listed on the Safeguarding page and on Today; the lead keeps a hold by setting the next review date (up to five years ahead), which is logged, or releases it. A review date does **not** release anything by itself.
- **Children involved (0065).** A concern about an adult or a member of staff can name the children involved (`safeguarding_concern_child`). Those children are held while the concern is kept.

**Fixed in 0058** (from the first draft's gap list): staff and adult concerns can now be held; deleting a concern no longer erases its access log; a hold now keeps the medical record and attendance.

**Over-retention: one closed concern keeps a child's whole record.** With `concern_months` empty (the default, "keep"), a single closed concern, however minor (for example, a wellbeing note closed the same week with no further action), keeps **everything** about that child (the medical record, support note, attendance, contacts, consents and the family's messages) for as long as the school has the software. The safeguarding chronology may need to be kept for a long time; the medical record and the rest probably do not need to be kept because of it. The software has not been changed here, because which records a kept concern should protect is a decision for the school's DSL and data protection adviser, and getting it wrong in either direction is harmful (deleting evidence a later investigation needs, or keeping health data for life). Options:
   - (a) a kept concern holds only the safeguarding record itself (the concern, its actions and the access log) and whatever the DSL explicitly holds, while medical, support and attendance follow their own periods;
   - (b) as (a), but attendance is kept with the concern, as it is often part of a chronology;
   - (c) as today, but only open concerns and explicit holds keep everything, and a closed concern keeps everything only until a review date the DSL sets when closing it.

   **DECISION NEEDED:** which of these (or another) applies. Until it is decided, explicit holds at least carry a review date (0065).

**Gaps for the specialist (DECISION NEEDED on each):**
1. **Periods.** Set periods for concerns about children, and separately for **allegations against staff**. Allegation records are often kept for much longer, under safeguarding guidance. Today there is one period for both.
2. **What survives a deleted concern.** Its action history is deleted with it; only the access-log rows and the audit entry "Closed concern deleted" remain. Decide whether a fuller minimal record should be kept.
3. **The trigger can drift.** The clock starts from `updated_at` on a closed concern, so a later edit restarts it. Decide whether it should run from closure, or from the child's date of birth (for example, age 25).
4. **Schools leaving.** When a school leaves the platform, its safeguarding records must be handed over before erasure (§10).
5. **Framework.** Decide which framework applies to each school: KCSIE, DfE guidance for out-of-school settings, or a national governing body's guidance.

---

## 4. Financial records

- **Built:** invoices are **never deleted** by the retention run. Family and guardian names are replaced after `financial_months` (default **72 months, six years**) once every child in the family is anonymised. Amounts, numbering and credit notes stay intact (DECISIONS: "Old families are anonymised, not deleted, once the financial period passes").
- The family "Ask to delete" text tells families that invoices are kept for six years (`app.request_family_erasure`, 0047; privacy page).
- UK businesses commonly keep accounting records for six years: for example, companies under the Companies Act 2006 and for HMRC purposes. Sole traders and partnerships have different minimums.
- **DECISION NEEDED:**
  - the period for each school's legal form (limited company, sole trader, charity);
  - whether anonymised invoices are ever deleted, and when;
  - how long to keep bursary reasons and discount records (`family_discount`);
  - imported invoice history (`imported_invoice`, 0054).

---

## 5. Prospects, enquiries and messages

- **Enquiries.** Deleted after `prospect_days` (default 90, range 30–730) with no activity (0040, DECISIONS). Enquiries that became enrolments are kept.
- **Prospect families made for trials.** Anonymised and soft-deleted after the same period, unless they have an invoice or a held child.
- **Gap: the outbox.** `outbound_message` rows, which hold prospects' email addresses, are not removed with the enquiry. **DECISION NEEDED.**
- **Messages (0058).** Messages are deleted `message_months` (default **36**, range 6–120) after they were sent, whether or not the family has left. A family with a child under a hold, or with an open or kept concern, keeps its messages. Class notices and announcements follow the same period.
- **Gap:** there is still no rule for `studio_request` or `notification`. **DECISION NEEDED:**
  - the message period, and whether it should run from the family leaving instead of from sending;
  - whether specific messages linked to a safeguarding concern must be kept with it (today the whole family conversation is kept while a child is held);
  - periods for requests and notifications.

---

## 6. Staff records and DBS checks

- **Built:** `staff_check` holds the kind of check (DBS, safeguarding training, first aid, other), a reference, the date checked, the expiry date and a note. It does not hold the certificate itself. Reminders go out before expiry (`app.remind_staff_checks`, 0047).
- **Built (0065):** checks can be recorded for **everyone** on the staff: teachers by their staff record, and office staff and owners, who have no timetable record, by their login. They appear in the Staff checks list on the Safeguarding page with "No DBS on file" until one is recorded, and their reminders reach the owner, the lead and the deputy.
- **Built (0058):** a leaving date (`staff_member.left_at`) is stamped when a record is made inactive or removed. Once a member of staff has left and has no staff login at the school:
  - after `staff_check_months` (default **12**, range 6–120), certificate numbers and notes on their checks are cleared. The kind and dates of each check stay, as a record that the check was done;
  - after `staff_months` (default **72**, range 12–240), their checks are deleted and the record is anonymised ("Former staff");
  - anyone a safeguarding concern is about, including an allegation, is held while that concern is kept.
- **DECISION NEEDED:**
  - confirm both periods;
  - DBS guidance limits keeping certificate information (commonly no longer than six months after the recruitment decision), but a record that a check was done, with its date and reference, is usually kept longer;
  - the interaction with allegations against staff (§3).

---

## 7. Audit and access logs

- **Built:** `audit_log` is **append-only**: `update` and `delete` are revoked from users (`SECURITY.md`). It records changes to key tables, office views of medical records (0044), retention steps, support access and exports. `safeguarding_access` records every safeguarding read (0030, 0047).
- **Built (0058):** `audit_months` (default **72**, range 24–240). The retention run deletes audit entries and safeguarding access-log entries older than that. Users still cannot update or delete log rows; only the run does, and it records what it deleted. Entries about a held child, a concern that is still kept, or a member of staff a concern is about are kept. Access-log entries attached to a live concern stay with it; entries of a deleted concern are counted from the deletion.
- **Gap:** audit rows survive school erasure with `studio_id` set to null (0005), and the run does not touch them. The erasure itself is logged with the school's slug (0019).
- **DECISION NEEDED:**
  - confirm the period, balancing accountability (Article 5(2)) against storage limitation;
  - whether rows left after a school's erasure should be deleted.

---

## 8. Backups

**Not built.** There is no hosting yet (R-002). The browser demo stores data only in the viewer's own browser.

**DECISION NEEDED,** with the hosting decision:
- backup frequency, retention period (for example a rolling 30 or 35 days), encryption and location (UK or EEA);
- how deletions and anonymisation reach backups. Usual practice: deleted data stays in backups until they expire, is never restored into live use, and if a restore happens the retention run is applied again before use;
- the point-in-time recovery window offered by the provider;
- documenting all of this in the processor agreement and the schools' privacy notices.

---

## 9. Family data requests and erasure

**Built (0047, UR-38):**
- **Privacy page** (`/family/privacy`). It shows "who sees what", taken from the RLS rules (`WHO_SEES` in `src/lib/repos/privacy.ts`), and how to correct data.
- **Download.** A JSON file of the family's records, read as the guardian so RLS limits it to their family. Office notes and teachers' private notes are **left out**, and the page says so.
- **"Ask to delete"** (`app.request_family_erasure`). This creates a `data_request` item in the office's request queue and notifies admins: "Reply within one month". The request text tells the office that invoices are kept for six years and safeguarding records as the school's policy requires, and that everything else should be deleted or anonymised.

**What is not built:**
- There is **no erasure function** that acts on a single family when asked. The office has to work it by hand (soft deletion through `app.soft_delete`, which hides records but does not delete them), or wait for the retention run.
- Soft-deleted children are now **included** by `app.apply_retention` (0058): they are anonymised, and their medical record deleted, once the period passes from the later of leaving and deletion. Soft-deleted medical, emergency-contact and consent rows on current children are purged after their period.
- Students aged 13 or over have no route of their own to request access or erasure.
- The process "still needs specialist review" (`FIXES.md` UR-38).

**DECISION NEEDED:**
- the erasure procedure: what is deleted at once, what is anonymised, and what is kept and why;
- identity checks, given that real sign-in is not built (R-001);
- how separated parents' requests are handled, where one guardian asks to delete and another objects;
- complete subject access responses, including office notes;
- requests made by children themselves.

---

## 10. A school leaving the platform

**Built (0019, `PLATFORM.md`, DECISIONS):**
- Swayvo sets a school to `cancelled`. It then becomes **read-only** for everyone, and `data_deletion_due_on` is set to **30 days** later.
- During that time the **owner can export everything as JSON** (Account page). The DSL or owner can export the safeguarding record (`app.safeguarding_export`).
- After 30 days, a **Swayvo super admin** can erase the school (`app.platform_purge_studio`). They must type the school's name to confirm. This deletes families, children, health records and money. One audit row records the erasure without the school.

**DECISION NEEDED:**
- whether 30 days is long enough, and what the processor agreement says about return and deletion;
- confirm that the owner's export contains everything the school needs, including safeguarding records, which have no table read policy and are exported separately;
- a **safeguarding handover check** before erasure: records about children must not simply disappear;
- how erasure reaches backups (§8) and sub-processors;
- whether to delete audit rows left behind with `studio_id` null (§7);
- whether to tell families when their school leaves.

---

## 11. Who runs retention, and how often

- **Who:** only the school's **owner** can change the settings or run retention (0030, 0047). The DSL controls legal holds.
- **How often (0058):** `app.tick()` makes an automatic preview **every month** and tells the owner what is due. The owner reviews and applies it. With "Apply automatically each month" turned on (off by default), the previewed items are applied **14 days** after the preview, unless the owner applied them first. **DECISION NEEDED:** whether schools should turn automatic applying on, and whether the owner should also review at least once a term and before the start of the school year.
- **Record-keeping:** each applied step is written to `audit_log`, and `retention_policy.last_run_at` is updated. Every automatic preview and every automatic apply also writes an `audit_log` row.

---

## 12. Review of this policy

| Item | Proposed | DECISION NEEDED |
|---|---|---|
| Review cycle | Every year, and whenever retention code changes (new tables, new steps), a new sub-processor is added, or guidance changes | Confirm |
| Reviewer | The school's DPO or adviser, its DSL for safeguarding items, and Swayvo for the technical description | Name them |
| Test | When this policy changes, check the software's defaults and ranges (0030, 0040) still match it | |

---

## 13. Summary of open decisions

1. Confirm or change the default periods for medical records (12 months), anonymisation (36 months), financial records (72 months) and enquiries (90 days), and the periods added in 0058: support notes (12), attendance (72), messages (36), shared-care notes (72), staff check references (12), staff records (72) and audit and access logs (72 months).
2. Set safeguarding periods, separately for concerns about children and allegations against staff. (Holds for staff and adult concerns, and keeping the access log, were added in 0058.)
3. Decide whether recorded injuries or incidents, as well as holds, should keep medical records. (Holds keep them since 0058.)
3a. Decide what a closed concern that is still kept should protect: today it keeps **all** of the child's records, the medical record included, indefinitely by default (§3, "Over-retention"). Decide too how often holds are reviewed (0065 defaults to yearly).
3b. Confirm the media period (`media_months`, default 12, 0059), and whether withdrawing consent should delete media rather than hide it.
4. Add rules for categories that still have none: collection lists, requests, notifications and the outbox, bursaries, skills and progress, accounts, events.
5. Decide the erasure-request procedure, and add a single-family erasure tool.
6. Decide whether automatic applying should be turned on, and how often the owner reviews retention.
7. Decide backups and how deletion reaches them (needs R-002).
8. Decide the school-exit notice period and the safeguarding handover.
