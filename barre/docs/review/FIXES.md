# Panel review fixes: status

Status on branch `claude/hopeful-hamilton-jjchm9`, 27 November 2026, after two rounds. Item numbers refer to the improvement
register in `REPORT.md` §23.

**Round 2** finished the partial items, in four more workstreams: 0052 money, 0053 accounts, 0054 scale, 0055 cross-school agenda.

**How the work was built.**
- Seven parallel workstreams, each with its own database migration:
  - 0044 office
  - 0045 billing
  - 0046 family accounts
  - 0047 safeguarding
  - 0048 register
  - 0049 progress
  - 0050 public pages, schedules and reports
- Then 0051 to join them up, plus a final accessibility pass.

**Checks.**

| Check | Result |
|---|---|
| Automated tests | 590 / 590 pass (378 before; 212 new) |
| Type check | Clean |
| `npm run a11y` (axe, WCAG 2.2 AA, phone and desktop, both styles) | No serious or critical issues |
| Sideways overflow at 320px | None across all routes |
| Text at 200% | Grows on every screen checked, without sideways scrolling |
| Offline register | Driven with the network cut, against a static build: 13 / 13 checks pass |

## Status of every item

| ID | Item | Status | Notes |
|---|---|---|---|
| UR-01 | Class creation | Done | Duplicate column fixed. Tests use the form's own SQL; a new school builds a timetable |
| UR-02 | Student editing | Done | Shared `toDateInput()`; the same crash also fixed in the term editor and pilot dates |
| UR-03 | Invitations link existing guardians | Done | Narrow exception inside acceptance only; all edge cases tested |
| UR-04 | Offline-safe register | Done | Device queue that survives reloads. "Mark the rest" never overrides a mark. Explicit marks win on sync. Offline notice. Registers open offline. Sign-out guarded |
| UR-05 | Guardians edit only their own details | Done | Others read-only with "Ask the office to change" |
| UR-06 | Adult drop-in integrity and age limits | Done | Adult record, never a child. Age range enforced on every booking path (the office may place a child just outside a *children's* range; nobody can put an under-18 in an adult class) |
| UR-07 | Absence reports reach the register | Done | Pre-marked "Excused · reported by parent"; shown on teacher Today; withdrawable until start |
| UR-08 | Consent with history | Done | Parents and office; most restrictive wins if guardians disagree; teacher brief always states it. Round 2: students 13+ see their consents read-only on /learn; schools can rename consent kinds |
| UR-09 | Office and DSL raise concerns | Done | About children, adults or staff; allegations hidden from their subject |
| UR-10 | Billing integrity | Done | Credit notes; run guard by family and period (opening balances count); ending discounts; goodwill credit and payment on account |
| UR-11 | The app says only true things | Done | Absence text, medical visibility text, "See how to pay", onboarding copy, PAYMENTS.md |
| UR-12 | Safeguarding legal hold | Done | Needs specialist advice on retention periods |
| UR-13 | Real sign-in | **Not started: needs decisions R-001 and R-002** | |
| UR-14 | Email, SMS and push delivery | **Not started: needs decision R-003** | Messages are queued in the outbox as before |
| UR-15 | Card and Direct Debit payments | **Not started: needs decision R-006** | Labels no longer promise payment |
| UR-16 | Parents approve or switch off teen logins | Done | Minimum age setting (13–18) |
| UR-17 | Shared-care privacy | Done | Private guardian messages; office-set access per guardian; collection list on the register brief. Round 2: medical restriction enforced everywhere (incl. teacher brief view, privacy download); split billing (one guardian, % split, or per child), one invoice per payer. Small gaps: credit on account comes off the oldest invoice whichever guardian it's addressed to; "Coming up" can show the other guardian's invoice number |
| UR-18 | Enquiry → trial → enrolment | Done | Enquiries in search |
| UR-19 | Safe waiting-list offers | Done | Expiry setting; expired offers pass on automatically (scheduled job) |
| UR-20 | Class suitability, price and confirmation on `/join` | Done | Arrival and cancellation wording are defaults with no settings screen yet |
| UR-21 | Adult student accounts | Done | Adults invited, sign in, see and cancel bookings and payments. Round 2: adult wording ("Your classes", "You" tab), "Book for myself" for parents, adults see their own feedback |
| UR-22 | Bank details and family reference | Done | |
| UR-23 | Invoice and payment notifications | Done | Due-in-3-days runs on the scheduled job |
| UR-24 | Upcoming costs; privates billed | Done | Costumes are shown as Expected (never billed automatically) |
| UR-25 | Feedback edits keep saved content; last note at the door | Done | "Edited" shown to families |
| UR-26 | One diary | Done | Family schedule (child filter), student timetable with exams and results, calendar feed |
| UR-27 | Cover clash check and handover | Done | Clashes at a teacher's *other* school not checked (needs cross-school design) |
| UR-28 | Access log counts once | Done | |
| UR-29 | DSL-only safeguarding export | Done | Logged; admins cannot run it |
| UR-30 | Text scales with user settings | Done | All sizes in rem; header, tabs and hero numbers adapted for large text |
| UR-31 | Sheets trap and return focus | Done | Global focus manager for every modal |
| UR-32 | Migration toolkit | Done | Unmapped-column acknowledgement, timetable import, opening balances. Round 2: history imports (past invoices read-only, attendance counts, exam results) and a downloadable list of invitation links for the school's own mail tool. Gap: parents' payments page doesn't list imported past invoices yet |
| UR-33 | Location dimension | Partial | Filters and comparison on reports, classes, schedule and billing lists. Round 2: location-limited admins and teachers, enforced in the database. Gap: location-limited admins are read-only (changes stay with owners and all-location admins); cover isn't checked against a teacher's locations |
| UR-34 | Retention report | Done | |
| UR-35 | Audit and access history | Done | Owner-only history with CSV; medical reads by office logged |
| UR-36 | Trial families told of cancellations | Done | |
| UR-37 | Register date guard | Done | 30 min before to 7 days after (setting); admins amend with a reason |
| UR-38 | Privacy page and data requests | Done | Process still needs specialist review |
| UR-39 | Plan limits as notices | Done | |
| UR-40 | Visible form errors | Done | |
| UR-41 | Staff checks for DSL and admin | Done | |
| UR-42 | Trial safety capture | Done | |
| UR-43 | Progress history | Done | |
| UR-44 | Bulk, teacher and age-appropriate chips | Done | A class of 12: 4 interactions (was 41) |
| UR-45 | Support-needs view | Done | |
| UR-46 | Bulk actions | Done | Messages from filtered families; reminders from overdue list |
| UR-47 | Cross-school agenda | Done | Round 2: "My week across schools" for teachers in several schools; clashes across schools (own travel time); each school chooses details / busy only / hidden; cover check sees other schools as "Busy"; calendar feed can include all schools |
| UR-48 | Draft skill levels; taught styles only | Done | |
| UR-49 | Student "can't make it" and bell | Done | |
| UR-50 | Events: per child, places, helpers | Done | |
| UR-51 | Under-filled classes | Done | |
| UR-52 | Move to another class | Done | Round 2: effective date (future moves planned and completed on the day; past dates within the term, admins only); registers and pro-rata billing follow the date |
| UR-53 | Guided first timetable | Done | |
| UR-54 | Small fixes bundle | Done | All listed items |
| UR-55 | Tracking depth | Done | Round 2: no own login under 13 is now a database rule (minimum age 13–18) |
| UR-56 | Make-up classes | Done | Make-up offers (off by default). Round 2: credit for reported absences as a school setting (per-session price or fixed amount), reversed if the report is withdrawn; make-up or credit, not both |
| UR-57 | Duplicate families | Done | Merge with preview; undo for 30 days |
| UR-58 | Absence as a welfare signal | Done | Opt-in per child by the DSL |
| UR-59–61 | Multi-school owner view, video feedback, bank-statement import | Deferred | As recommended in the report |

**Totals across all 61 items (after round 2).**

| Status | Items |
|---|---|
| Done | 54 (UR-17 and UR-32 have the small gaps noted above) |
| Partial | 1 (UR-33: location-limited admins are read-only) |
| Not done | 0 |
| Waiting on decisions | 3 (UR-13, 14, 15) |
| Deferred | 3 (UR-59–61) |

## Behaviour changes worth knowing
- **Skill levels:** now reach families with the share step, by default. Change it in Settings → Teaching.
- **Registers:** can only be marked from 30 minutes before a class until 7 days after.
- **Refunds:** create a credit note by default. "Mistake" mode reverses a payment that should not have been recorded.
- **Billing runs:** skip families already billed for the period, with a per-family override and a reason.
- **Parents' invoices:** parents no longer see draft invoices.
- **Consent:** guardians record consent through the Consents controls, not by editing records.
- **Moves and credit (round 2):** moving a student takes an effective date. Credit for reported absences is a school setting, off by default.
- **Under-13 logins (round 2):** refused by the database whatever the school's setting.
- **Location limits (round 2):** an admin limited to locations can no longer act as a full admin anywhere; they read their locations only.
- **Seed data:** students who sign in have skills in the styles they dance; the seed school is marked as containing sample data.
