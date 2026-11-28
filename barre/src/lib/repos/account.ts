/* A school's own account: its plan, who has access, Swayvo support, export. */

export type AccountRow = {
  id: string; name: string; status: string; status_reason: string | null; trial_ends_on: string | null;
  data_deletion_due_on: string | null; plan_name: string | null; price_minor: number | null;
  max_students: number | null; max_locations: number | null; max_staff: number | null;
  students: number; locations: number; staff: number; leavers: number;
};
export const ACCOUNT = `
select s.id, s.name, s.status, s.status_reason, s.trial_ends_on, s.data_deletion_due_on,
       p.name as plan_name, p.price_minor, p.max_students, p.max_locations, p.max_staff,
       -- Leavers are not on the plan (0062): only children in a class, trial or
       -- waiting list, or just added.
       app.plan_student_count(s.id) as students,
       (select count(*)::int from student x where x.studio_id = s.id and x.deleted_at is null) - app.plan_student_count(s.id) as leavers,
       (select count(*)::int from location x where x.studio_id = s.id and x.deleted_at is null) as locations,
       (select count(*)::int from staff_member x where x.studio_id = s.id and x.deleted_at is null) as staff
  from studio s left join plan p on p.id = s.plan_id
 order by s.created_at limit 1`;

export type Member = { id: string; user_id: string; role: string; full_name: string; email: string;
  detail: string | null; is_me: boolean; created_at: string };
export const MEMBERS = `
select m.id, m.user_id, m.role, u.full_name, u.email, m.created_at, (m.user_id = auth.uid()) as is_me,
       case m.role
         when 'guardian' then (select string_agg(f.name, ', ') from guardian g join family f on f.id = g.family_id
                                where g.user_id = m.user_id and g.studio_id = m.studio_id and g.deleted_at is null)
         when 'student' then (select s.first_name || ' ' || s.last_name from student s
                               where s.user_id = m.user_id and s.studio_id = m.studio_id and s.deleted_at is null limit 1)
       end as detail
  from membership m join user_account u on u.id = m.user_id
 where m.deleted_at is null
 order by array_position(array['owner','admin','teacher','guardian','student']::app_role[], m.role), u.full_name`;

export type Invitation = { id: string; email: string; full_name: string | null; role: string;
  created_at: string; expires_at: string; family_name: string | null; student_name: string | null;
  family_id: string | null; student_id: string | null };
export const INVITATIONS = `
select i.id, i.email, i.full_name, i.role, i.created_at, i.expires_at, i.family_id, i.student_id,
       f.name as family_name, s.first_name || ' ' || s.last_name as student_name
  from studio_invitation i
  left join family f on f.id = i.family_id
  left join student s on s.id = i.student_id
 where i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
 order by i.created_at desc`;

export const FAMILIES = `select id, name from family where deleted_at is null order by name`;
export const STUDENTS = `
select s.id, s.first_name || ' ' || s.last_name as name, f.name as family_name
  from student s join family f on f.id = s.family_id
 where s.deleted_at is null and s.user_id is null order by s.last_name, s.first_name`;

export const INVITE = `select app.create_invitation($1, $2, $3::app_role, $4, $5, $6) as token`;
export const REVOKE = `select app.revoke_invitation($1)`;
export const SET_ROLE = `select app.set_member_role($1, $2::app_role)`;
export const REMOVE = `select app.remove_member($1)`;

export type Grant = { id: string; reason: string; expires_at: string; revoked_at: string | null;
  created_at: string; granted_by: string | null; live: boolean };
export const GRANTS = `
select g.id, g.reason, g.expires_at, g.revoked_at, g.created_at, u.full_name as granted_by,
       (g.revoked_at is null and g.expires_at > now()) as live
  from support_access_grant g left join user_account u on u.id = g.granted_by
 order by g.created_at desc limit 10`;
export const SUPPORT_VISITS = `
select at, summary from audit_log where entity = 'support_session' order by at desc limit 10`;
export const GRANT = `select app.grant_support_access($1, $2, $3)`;
export const REVOKE_GRANT = `select app.revoke_support_access($1)`;

/** Everything a school holds, for its own export. Each runs under RLS as the owner. */
export const EXPORT_TABLES = [
  'studio', 'location', 'room', 'term', 'term_break', 'dance_style', 'level', 'staff_member',
  'family', 'guardian', 'student', 'emergency_contact', 'medical_record', 'consent_record',
  'class', 'class_session', 'enrolment', 'trial', 'waitlist_entry', 'enquiry', 'attendance_record',
  'invoice', 'invoice_item', 'payment', 'communication', 'communication_template',
  'studio_event', 'event_participant', 'studio_request', 'feedback_note', 'skill_assessment',
] as const;
