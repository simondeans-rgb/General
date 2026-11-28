/* Safeguarding, staff checks and retention (migration 0030). */
export type Concern = { id: string; student_name: string | null; category: string; summary: string; immediate_risk: boolean;
  status: 'open' | 'monitoring' | 'referred' | 'closed'; raised_by: string; created_at: string; actions: number;
  subject_kind: 'child' | 'adult' | 'staff'; subject_name: string; allegation: boolean; student_id: string | null;
  /** Children involved in a concern about an adult or staff (0065). */
  children: string | null; routing_note: string | null };
export const CATEGORIES: [string, string][] = [['wellbeing', 'Wellbeing'], ['injury', 'Injury or mark'], ['disclosure', 'Something they told me'],
  ['behaviour', 'Behaviour'], ['attendance', 'Attendance pattern'], ['online', 'Online'], ['allegation', 'Allegation about an adult'], ['other', 'Other']];
export const MY_STUDIO = `select s.id, s.dsl_user_id, s.dsl_deputy_user_id, s.safeguarding_outside_route, s.block_child_media_links,
  app.is_safeguarding_lead(s.id) as can_read from studio s
  where s.id in (select app.studio_ids()) and s.deleted_at is null limit 1`;
export type MyStudio = { id: string; dsl_user_id: string | null; dsl_deputy_user_id: string | null;
  safeguarding_outside_route: string | null; block_child_media_links: boolean; can_read: boolean };
export const RAISE = `select app.raise_concern($1, $2, $3, $4) as id`;
/** $1 studio, $2 the page opening — re-reading after an action is not a new look (UR-28). */
export const LOG = `select * from app.safeguarding_log($1, $2)`;
/** $1 concern, $2 this opening of the concern. */
export const ACTIONS = `select * from app.safeguarding_actions($1, $2)`;
/** Office and lead raise about a child, an adult or a member of staff (UR-09).
 *  $1 studio, $2 subject kind, $3 student, $4 staff member, $5 who (free text), $6 category, $7 summary, $8 urgent. */
export const RAISE_ABOUT = `select app.raise_concern_about($1, $2, $3, $4, $5, $6, $7, $8) as id`;
/** Everyone on the staff, office and owners included (0065). */
export type StaffPerson = { staff_id: string | null; user_id: string | null; name: string; role: string };
export const STAFF_PICK = `select * from app.safeguarding_staff($1)`;

/* Routing and the receipt (0065) */
export type Person = { user_id: string; name: string };
export type Routing = { lead: Person | null; deputy: Person | null; owners: Person[]; outside_route: string | null };
export const ROUTING = `select app.concern_routing($1) as r`;
export type Receipt = { id: string; told: { name: string; part: 'lead' | 'deputy' | 'owner' }[];
  not_told: { name: string; part: string; why: string }[]; no_lead: boolean; nobody: boolean; outside_route: string | null };
/** $1 studio, $2 subject kind, $3 student, $4 staff record, $5 staff login, $6 who (free text), $7 category, $8 summary,
 *  $9 urgent, $10 children involved (uuid[]). */
export const RECORD = `select app.record_concern($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::uuid[]) as r`;
export const SET_DEPUTY = `select app.set_safeguarding_deputy($1)`;
export const SET_OUTSIDE_ROUTE = `select app.set_safeguarding_outside_route($1, $2)`;
/** When nobody can be told, or as a second route: always shown with the school's own contact. */
export const NATIONAL_ROUTE = 'If you cannot reach your local authority designated officer (LADO), the NSPCC whistleblowing advice line is 0800 028 0285. If a child is in immediate danger, call 999.';

/* Children involved (0065) */
export type ChildConcern = { concern_id: string; created_at: string; subject_kind: string; subject_name: string;
  category: string; status: string; allegation: boolean; linked: boolean };
export const CHILD_CONCERNS = `select * from app.child_concerns($1)`;
export const LINK_CHILD = `select app.link_concern_child($1, $2, $3)`;

/* Referrals and the chronology (F13) */
export type Action = { note: string; status_to: string | null; by_name: string; at: string;
  referred_to: string | null; referred_on: string | null; referral_ref: string | null; outcome: string | null };
/** $1 concern, $2 note, $3 status, $4 referred to, $5 date, $6 their reference, $7 outcome. */
export const RECORD_ACTION = `select app.record_concern_action($1, $2, $3, $4, $5::date, $6, $7)`;
export type Chronology = { id: string; reference: string; school: string; prepared_at: string; prepared_by: string;
  created_at: string; status: string; category: string; immediate_risk: boolean; allegation: boolean; subject_kind: string;
  subject: string; children: string[]; raised_by: string | null; summary: string; routing_note: string | null;
  hold: { reason: string; set_at: string; review_on: string } | null;
  actions: { at: string; by: string | null; note: string; status_to: string | null; referred_to: string | null;
    referred_on: string | null; referral_ref: string | null; outcome: string | null }[] };
/** $1 concern, $2 'view' | 'print' | 'export'. Logged every time. */
export const CHRONOLOGY = `select app.concern_chronology($1, $2) as c`;

/* Hold reviews (0065) */
export type HoldReview = { hold_kind: 'child' | 'concern'; id: string; name: string; reason: string; set_at: string; review_on: string; due: boolean };
export const HOLD_REVIEWS = `select * from app.hold_reviews($1)`;
export const REVIEW_HOLD = `select app.review_hold($1, $2, $3::date)`;

/* Media of children on outside links (0065) */
export type ChildMediaLink = { id: string; title: string; kind: string; url: string; added_by: string; created_at: string; hidden: boolean };
export const CHILD_MEDIA_LINKS = `select * from app.child_media_links($1)`;
export const SET_BLOCK_LINKS = `select app.set_block_child_media_links($1, $2)`;
/** For Today: what the safeguarding setup still needs, for the owner, the lead and the office. */
export const SAFEGUARDING_TODAY = `select s.id,
  app.is_admin(s.id) and (app.concern_routing(s.id) ->> 'lead') is null as no_lead,
  (select count(*)::int from app.child_media_links(s.id)) as media_links,
  (select count(*)::int from app.hold_reviews(s.id) h where h.due) as holds_due
  from studio s where s.id in (select app.studio_ids()) and s.deleted_at is null limit 1`;
export const CHILD_PICK = `select id, first_name || ' ' || last_name as name from student where deleted_at is null order by last_name, first_name`;
export const LEAD_CHILDREN = `select * from app.safeguarding_students($1)`;

/* Legal hold (UR-12) */
export type Hold = { student_id: string; name: string; reason: string; set_by: string; set_at: string };
export const HOLDS = `select * from app.safeguarding_holds($1)`;
export const SET_HOLD = `select app.set_safeguarding_hold($1, $2)`;
export const RELEASE_HOLD = `select app.release_safeguarding_hold($1)`;
/** A hold on one concern, for concerns about adults and staff too (0058). */
export type ConcernHold = { concern_id: string; reason: string; set_by: string; set_at: string };
export const CONCERN_HOLDS = `select * from app.concern_holds($1)`;
export const SET_CONCERN_HOLD = `select app.set_concern_hold($1, $2)`;
export const RELEASE_CONCERN_HOLD = `select app.release_concern_hold($1)`;

/* Absence as a welfare signal (UR-58) */
export type Watch = { student_id: string; name: string; note: string | null; streak: number; last_absent: string | null; last_present: string | null };
export const WATCHES = `select * from app.welfare_absences($1)`;
export const SET_WATCH = `select app.set_welfare_watch($1, $2, $3)`;
export const STREAK_ALERT = 3;

/* Export (UR-29) */
export const EXPORT = `select app.safeguarding_export($1) as data`;

/* Staff check gaps (UR-41): owner, admin and lead. */
export type CheckGap = { staff_id: string | null; name: string; dbs_expires: string | null; issue: string | null; due: string | null; user_id: string | null };
export const CHECK_SUMMARY = `select * from app.staff_check_summary($1)`;
export const CHECK_GAPS_TODAY = `select g.* from studio s, app.staff_check_summary(s.id) g
  where s.id in (select app.studio_ids()) and s.deleted_at is null and app.is_safeguarding_lead(s.id) and g.issue is not null`;
export const ACT = `select app.safeguarding_act($1, $2, $3)`;
export const ACCESS = `select * from app.safeguarding_access_log($1)`;
export const STAFF_LOGINS = `select m.user_id, u.full_name, m.role::text as role from membership m join user_account u on u.id = m.user_id
  where m.studio_id = $1 and m.role in ('owner','admin','teacher') and m.deleted_at is null order by u.full_name`;
export const SET_LEAD = `select app.set_safeguarding_lead($1)`;

export type Check = { id: string; staff_id: string; kind: string; reference: string | null; checked_on: string; expires_on: string | null };
/** $1 staff record (may be null), $2 login (may be null): checks under either (0065). */
export const CHECKS = `select id, staff_id, kind, reference, checked_on, expires_on from staff_check
  where deleted_at is null and (staff_id = $1::uuid or ($2::uuid is not null and user_id = $2::uuid)) order by checked_on desc`;
/** $1 staff record or null, $2 login or null, $3 school (needed for a login-only person), then kind, reference, dates. */
export const ADD_CHECK = `insert into staff_check (staff_id, user_id, studio_id, kind, reference, checked_on, expires_on)
  values ($1::uuid, case when $1::uuid is null then $2::uuid end, $3::uuid, $4, nullif(btrim($5), ''), $6::date, $7::date) returning id`;
export const CHECK_LABEL: Record<string, string> = { dbs: 'DBS', safeguarding_training: 'Safeguarding training', first_aid: 'First aid', other: 'Other' };

export type Retention = { medical_months: number; personal_months: number; financial_months: number; prospect_days: number; concern_months: number | null;
  message_months: number; attendance_months: number; support_months: number; staff_months: number; staff_check_months: number;
  audit_months: number; dsl_note_months: number; media_months: number; auto_apply: boolean;
  auto_preview_at: string | null; auto_preview_count: number | null; auto_applied_at: string | null; last_run_at: string | null };
export const RETENTION = `select medical_months, personal_months, financial_months, prospect_days, concern_months,
  message_months, attendance_months, support_months, staff_months, staff_check_months, audit_months, dsl_note_months, media_months, auto_apply,
  auto_preview_at, auto_preview_count, auto_applied_at, last_run_at from retention_policy limit 1`;
export const SET_RETENTION = `update retention_policy set medical_months = $1, personal_months = $2, financial_months = $3, prospect_days = $4, concern_months = $5,
  message_months = $6, attendance_months = $7, support_months = $8, staff_months = $9, staff_check_months = $10, audit_months = $11,
  dsl_note_months = $12, auto_apply = $13, media_months = $14, updated_at = now() returning studio_id`;
/** Each period the owner can set, with the range the database allows (0030, 0040, 0058). */
export const RETENTION_FIELDS: { key: keyof Retention; label: string; unit: 'months' | 'days'; min: number; max: number; adviser?: boolean }[] = [
  { key: 'medical_months', label: 'Delete medical records after', unit: 'months', min: 1, max: 120 },
  { key: 'personal_months', label: 'Anonymise the child after', unit: 'months', min: 6, max: 240 },
  { key: 'financial_months', label: 'Keep family names on invoices for', unit: 'months', min: 12, max: 240 },
  { key: 'prospect_days', label: 'Remove enquiries with no activity after', unit: 'days', min: 30, max: 730 },
  { key: 'support_months', label: 'Delete support notes, after a child leaves', unit: 'months', min: 1, max: 120, adviser: true },
  { key: 'attendance_months', label: 'Delete attendance, after a child leaves', unit: 'months', min: 12, max: 240, adviser: true },
  { key: 'message_months', label: 'Delete messages, after sending', unit: 'months', min: 6, max: 120, adviser: true },
  { key: 'dsl_note_months', label: 'Clear shared-care notes, after a family leaves', unit: 'months', min: 12, max: 300, adviser: true },
  { key: 'staff_check_months', label: 'Clear certificate numbers, after staff leave', unit: 'months', min: 6, max: 120, adviser: true },
  { key: 'staff_months', label: 'Anonymise staff records, after staff leave', unit: 'months', min: 12, max: 240, adviser: true },
  { key: 'media_months', label: 'Delete videos and photos of children, after the last child shown leaves', unit: 'months', min: 1, max: 120, adviser: true },
  { key: 'audit_months', label: 'Delete audit and access logs, after', unit: 'months', min: 24, max: 240, adviser: true },
];
export const PREVIEW_RETENTION = `select * from app.apply_retention($1, false)`;
export const RUN_RETENTION = `select count(*)::int as n from app.apply_retention($1, true) where step <> 'held'`;
export const REMIND_CHECKS = `select app.remind_staff_checks(m.studio_id) as n from membership m
  where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`;
