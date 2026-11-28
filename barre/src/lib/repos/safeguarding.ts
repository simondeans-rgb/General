/* Safeguarding, staff checks and retention (migration 0030). */
export type Concern = { id: string; student_name: string | null; category: string; summary: string; immediate_risk: boolean;
  status: 'open' | 'monitoring' | 'referred' | 'closed'; raised_by: string; created_at: string; actions: number;
  subject_kind: 'child' | 'adult' | 'staff'; subject_name: string; allegation: boolean; student_id: string | null };
export const CATEGORIES: [string, string][] = [['wellbeing', 'Wellbeing'], ['injury', 'Injury or mark'], ['disclosure', 'Something they told me'],
  ['behaviour', 'Behaviour'], ['attendance', 'Attendance pattern'], ['online', 'Online'], ['allegation', 'Allegation about an adult'], ['other', 'Other']];
export const MY_STUDIO = `select s.id, s.dsl_user_id, app.is_safeguarding_lead(s.id) as can_read from studio s
  where s.id in (select app.studio_ids()) and s.deleted_at is null limit 1`;
export const RAISE = `select app.raise_concern($1, $2, $3, $4) as id`;
/** $1 studio, $2 the page opening — re-reading after an action is not a new look (UR-28). */
export const LOG = `select * from app.safeguarding_log($1, $2)`;
/** $1 concern, $2 this opening of the concern. */
export const ACTIONS = `select * from app.safeguarding_actions($1, $2)`;
/** Office and lead raise about a child, an adult or a member of staff (UR-09).
 *  $1 studio, $2 subject kind, $3 student, $4 staff member, $5 who (free text), $6 category, $7 summary, $8 urgent. */
export const RAISE_ABOUT = `select app.raise_concern_about($1, $2, $3, $4, $5, $6, $7, $8) as id`;
export const STAFF_PICK = `select id, display_name from staff_member where deleted_at is null order by display_name`;
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
export type CheckGap = { staff_id: string; name: string; dbs_expires: string | null; issue: string | null; due: string | null };
export const CHECK_SUMMARY = `select * from app.staff_check_summary($1)`;
export const CHECK_GAPS_TODAY = `select g.* from studio s, app.staff_check_summary(s.id) g
  where s.id in (select app.studio_ids()) and s.deleted_at is null and app.is_safeguarding_lead(s.id) and g.issue is not null`;
export const ACT = `select app.safeguarding_act($1, $2, $3)`;
export const ACCESS = `select * from app.safeguarding_access_log($1)`;
export const STAFF_LOGINS = `select m.user_id, u.full_name, m.role::text as role from membership m join user_account u on u.id = m.user_id
  where m.studio_id = $1 and m.role in ('owner','admin','teacher') and m.deleted_at is null order by u.full_name`;
export const SET_LEAD = `select app.set_safeguarding_lead($1)`;

export type Check = { id: string; staff_id: string; kind: string; reference: string | null; checked_on: string; expires_on: string | null };
export const CHECKS = `select id, staff_id, kind, reference, checked_on, expires_on from staff_check where staff_id = $1 order by checked_on desc`;
export const ADD_CHECK = `insert into staff_check (staff_id, kind, reference, checked_on, expires_on) values ($1, $2, nullif(btrim($3), ''), $4::date, $5::date) returning id`;
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
