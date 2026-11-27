/**
 * Office tools from the panel review: record history (UR-35), asking for a
 * larger plan (UR-39), and duplicate families (UR-57). Each is a database
 * function that checks the caller's role itself.
 */

export type HistoryRow = {
  id: string; at: string | Date; actor_id?: string | null; actor: string; action: string;
  entity: string; entity_id?: string | null; record_label: string | null; summary: string | null;
};

/** The school's history, owner only. $1 person, $2 kind of record, $3 words
 *  in the record's name, $4 from, $5 to (dates), $6 how many. */
export const AUDIT_HISTORY = `select * from app.audit_history($1::uuid, $2, $3, $4::date, $5::date, $6)`;
export const AUDIT_ACTORS = `select * from app.audit_actors()`;
/** One family's or one child's history, for the office. */
export const RECORD_HISTORY = `select * from app.record_history($1, $2::uuid)`;
/** Silent: opening a child's full medical record, as the office. */
export const LOG_MEDICAL_VIEW = `select app.log_medical_view($1) as ok`;

export const REQUEST_UPGRADE = `select app.request_plan_upgrade($1) as ok`;

export type Duplicate = { keep_id: string; keep_name: string; other_id: string; other_name: string; reason: string };
export const FAMILY_DUPLICATES = `select * from app.family_duplicates()`;
export const MERGE_PREVIEW = `select * from app.family_merge_preview($1, $2)`;
export const MERGE_FAMILIES = `select app.merge_families($1, $2) as id`;
export const UNDO_MERGE = `select app.undo_family_merge($1) as ok`;
export const RECENT_MERGES = `
select m.id, m.merged_at, m.undone_at, k.name as kept_name, o.name as merged_name,
       m.merged_at > now() - interval '30 days' and m.undone_at is null as can_undo
  from family_merge m
  join family k on k.id = m.kept_id
  join lateral (select name from family where id = m.merged_id) o on true
 order by m.merged_at desc limit 10`;

/** Plain words for the action and kind of record a history row is about. */
export const ACTION_WORD: Record<string, string> = {
  insert: 'Created', update: 'Changed', delete: 'Removed', soft_delete: 'Removed',
  view_medical: 'Viewed', merge: 'Merged', unmerge: 'Unmerged', withdraw: 'Withdrew',
  offer: 'Offered', accept: 'Accepted', decline: 'Declined', expire: 'Expired', convert: 'Converted',
  close: 'Closed', upgrade_request: 'Asked', grant: 'Granted', import: 'Imported',
};
export const ENTITY_WORD: Record<string, string> = {
  family: 'Family', guardian: 'Guardian', student: 'Student', emergency_contact: 'Emergency contact',
  medical_record: 'Medical record', consent_record: 'Consent', enrolment: 'Class place', invoice: 'Invoice',
  payment: 'Payment', membership: 'Access and roles', studio: 'School settings', class: 'Class',
  staff_member: 'Staff', enquiry: 'Enquiry', waitlist_entry: 'Waiting list', trial: 'Trial',
};

/** "changed date_of_birth, first_name" → "changed date of birth, first name". */
export const readableSummary = (s: string | null) => (s ?? '').replace(/_/g, ' ');

/** What the /people family filters need (UR-46): classes, logins, prospects. */
export type FamilyFacts = { id: string; class_ids: string[]; has_login: boolean; is_prospect: boolean; has_contact: boolean };
export const FAMILY_FACTS = `
select f.id, f.is_prospect,
       coalesce((select array_agg(distinct e.class_id) from enrolment e join student s on s.id = e.student_id
                  where s.family_id = f.id and e.status = 'active' and e.deleted_at is null and s.deleted_at is null), '{}') as class_ids,
       exists (select 1 from guardian g where g.family_id = f.id and g.deleted_at is null and g.user_id is not null) as has_login,
       exists (select 1 from guardian g where g.family_id = f.id and g.deleted_at is null
                 and (g.email is not null or g.phone is not null)) as has_contact
  from family f where f.deleted_at is null`;
