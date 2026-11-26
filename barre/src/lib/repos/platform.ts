/* The Swayvo console. Everything here is account-level: a school's plan,
   status, owner and counts. The database will not return a child to it. */

export type School = {
  id: string; name: string; slug: string; status: string; status_reason: string | null;
  plan_code: string | null; plan_name: string | null; price_minor: number | null;
  max_students: number | null; max_locations: number | null; max_staff: number | null;
  trial_ends_on: string | null; data_deletion_due_on: string | null; created_at: string;
  students: number; families: number; locations: number; staff: number;
  owners: number; admins: number; teachers: number; guardians: number; student_logins: number;
  owner_names: string | null; owner_emails: string | null; pending_invites: number;
  support_until: string | null; last_activity: string | null;
};
export const SCHOOLS = `select * from app.platform_studios()`;

export type Plan = { id: string; code: string; name: string; price_minor: number; max_students: number | null;
  max_locations: number | null; max_staff: number | null; is_trial: boolean; active: boolean };
export const PLANS = `select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;
export const AM_SUPER = `select app.is_platform_super() as yes`;

export type Event = { at: string; action: string; summary: string | null; actor: string | null };
export const EVENTS = `select * from app.platform_events($1)`;

export type Invite = { id: string; email: string; full_name: string | null; role: string; created_at: string;
  expires_at: string; accepted_at: string | null; revoked_at: string | null };
export const INVITES = `select * from app.platform_invitations($1)`;

export const CREATE_SCHOOL = `select * from app.platform_create_studio($1, $2, $3, $4, $5)`;
export const SET_PLAN = `select app.platform_set_plan($1, $2)`;
export const SET_STATUS = `select app.platform_set_status($1, $2, $3)`;
export const EXTEND_TRIAL = `select app.platform_extend_trial($1, $2)`;
export const PURGE = `select app.platform_purge_studio($1, $2)`;
export const INVITE = `select app.create_invitation($1, $2, $3::app_role, $4) as token`;
export const REVOKE_INVITE = `select app.revoke_invitation($1)`;
export const START_SUPPORT = `select app.start_support_session($1) as until`;
export const SET_PLAN_LIMITS = `select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)`;

/** The link someone opens to accept an invitation. */
export const inviteLink = (token: string) =>
  `${typeof window === 'undefined' ? '' : window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/invite/?token=${token}`;
