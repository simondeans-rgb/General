/* Safeguarding, staff checks and retention (migration 0030). */
export type Concern = { id: string; student_name: string | null; category: string; summary: string; immediate_risk: boolean;
  status: 'open' | 'monitoring' | 'referred' | 'closed'; raised_by: string; created_at: string; actions: number };
export const CATEGORIES: [string, string][] = [['wellbeing', 'Wellbeing'], ['injury', 'Injury or mark'], ['disclosure', 'Something they told me'],
  ['behaviour', 'Behaviour'], ['attendance', 'Attendance pattern'], ['online', 'Online'], ['other', 'Other']];
export const MY_STUDIO = `select s.id, s.dsl_user_id, app.is_safeguarding_lead(s.id) as can_read from studio s
  where s.id in (select app.studio_ids()) and s.deleted_at is null limit 1`;
export const RAISE = `select app.raise_concern($1, $2, $3, $4) as id`;
export const LOG = `select * from app.safeguarding_log($1)`;
export const ACTIONS = `select * from app.safeguarding_actions($1)`;
export const ACT = `select app.safeguarding_act($1, $2, $3)`;
export const ACCESS = `select * from app.safeguarding_access_log($1)`;
export const STAFF_LOGINS = `select m.user_id, u.full_name, m.role::text as role from membership m join user_account u on u.id = m.user_id
  where m.studio_id = $1 and m.role in ('owner','admin','teacher') and m.deleted_at is null order by u.full_name`;
export const SET_LEAD = `select app.set_safeguarding_lead($1)`;

export type Check = { id: string; staff_id: string; kind: string; reference: string | null; checked_on: string; expires_on: string | null };
export const CHECKS = `select id, staff_id, kind, reference, checked_on, expires_on from staff_check where staff_id = $1 order by checked_on desc`;
export const ADD_CHECK = `insert into staff_check (staff_id, kind, reference, checked_on, expires_on) values ($1, $2, nullif(btrim($3), ''), $4::date, $5::date) returning id`;
export const CHECK_LABEL: Record<string, string> = { dbs: 'DBS', safeguarding_training: 'Safeguarding training', first_aid: 'First aid', other: 'Other' };

export type Retention = { medical_months: number; personal_months: number; financial_months: number; last_run_at: string | null };
export const RETENTION = `select medical_months, personal_months, financial_months, last_run_at from retention_policy limit 1`;
export const SET_RETENTION = `update retention_policy set medical_months = $1, personal_months = $2, financial_months = $3, updated_at = now() returning studio_id`;
export const PREVIEW_RETENTION = `select * from app.apply_retention($1, false)`;
export const RUN_RETENTION = `select count(*)::int as n from app.apply_retention($1, true)`;
export const REMIND_CHECKS = `select app.remind_staff_checks(m.studio_id) as n from membership m
  where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`;
