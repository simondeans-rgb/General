import type { Stamp } from '@/lib/format';

/**
 * The guardian's view. Every one of these queries is unqualified by family —
 * there is no `where family_id = ?`, because row level security already limits
 * the rows to this guardian's own family. Adding the filter here would be
 * belt-and-braces on the wrong layer and would hide a policy mistake.
 */

export type NextClass = {
  id: string; class_id: string; name: string; starts_at: Stamp; ends_at: Stamp;
  status: string; style: string | null; colour: string | null;
  room: string | null; location: string | null; teacher: string | null;
  child: string; student_id: string;
};

export const MY_SCHEDULE = `
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       s.first_name as child, s.id as student_id
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  join student s on s.id = e.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name, ds.colour, coalesce(sr.name, r.name), l.name, coalesce(cover.display_name, st.display_name),
       s.first_name, s.id
  from drop_in_booking d
  join class_session cs on cs.id = d.session_id
  join class c on c.id = cs.class_id
  join student s on s.id = d.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where d.status = 'booked' and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by 4`;

export const MY_CHILDREN = `
select s.id, s.first_name, s.last_name, s.date_of_birth, s.is_adult,
       s.self_guardian_id in (select g.id from guardian g where g.user_id = auth.uid()) as is_me,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select m.allergies from medical_record m
         where m.student_id = s.id and m.deleted_at is null) as allergies,
       app.consent_now(s.id, 'photography') as photo_consent   -- latest settled choice, one row (UR-08)
  from student s
 where s.deleted_at is null
 order by s.date_of_birth`;

export const MY_BALANCE = `
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`;

export const MY_INVOICES = `
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null and i.status <> 'draft'   -- drafts are the office's until sent
 order by i.issued_on desc nulls last limit 8`;

export const MY_MESSAGES = `
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
   and not cm.inbound          -- only what the studio sent, never the family's own messages (R-047)
 order by cm.sent_at desc limit 8`;

/** A guardian reporting an absence in advance. Their own children only —
 *  enforced by the insert policy, not by this string. */
export const REPORT_ABSENCE = `
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select s.studio_id, 'direct', 'in_app', s.family_id,
       'Absence: ' || s.first_name || ' — ' || to_char($2::timestamptz, 'FMDay DD Mon'),
       $3, auth.uid()
  from student s where s.id = $1
returning id`;

/* ── Parents keep their own details current (R-016, migration 0023) ─────── */
export type Guardian = { id: string; full_name: string; email: string | null; phone: string | null; relationship: string | null; is_me: boolean };
export const MY_GUARDIANS = `
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`;
export const UPDATE_GUARDIAN = `
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`;

/** Office-set limits on what this guardian's account shows (UR-17). */
export type MyAccess = { see_schedule: boolean; see_payments: boolean; see_feedback: boolean; see_medical: boolean };
export const MY_ACCESS = `select * from app.my_access()`;
/** "Ask the office to change" another guardian's details (UR-05). */
export const ASK_TO_CHANGE_GUARDIAN = `select app.ask_to_change_guardian($1, $2) as id`;

/* ── Who may collect each child (UR-17). Parents keep the "may collect" list;
   a "may not collect" entry is the office's and is not shown here. ────── */
export type Collector = { id: string; student_id: string; full_name: string; relationship: string | null; phone: string | null };
export const MY_COLLECTORS = `
select c.id, c.student_id, c.full_name, c.relationship, c.phone from collection_permission c
 where c.deleted_at is null and c.allowed order by c.created_at`;
export const ADD_COLLECTOR = `
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), true) returning id`;
export const REMOVE_COLLECTOR = `select app.remove_collection_person($1)`;

/* ── A teenager's own login (UR-16) ─────────────────────────────────────── */
export type ChildLogin = { student_id: string; first_name: string; age: number; min_age: number;
  state: 'too_young' | 'none' | 'invited' | 'pending' | 'on' | 'off'; email: string | null };
export const MY_CHILDREN_LOGINS = `select * from app.my_children_logins()`;
export const SET_STUDENT_LOGIN = `select app.set_student_login($1, $2) as r`;
export const INVITE_STUDENT = `select app.guardian_invite_student($1, $2) as token`;

export type Contact = { id: string; student_id: string; full_name: string; relationship: string | null; phone: string };
export const MY_CONTACTS = `
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`;
export const ADD_CONTACT = `
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif($3, ''), $4,
       coalesce((select max(priority) + 1 from emergency_contact where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1`;
export const UPDATE_CONTACT = `
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`;
export const REMOVE_CONTACT = `select app.remove_emergency_contact($1)`;

/* ── Self-service: classes, trials, waiting lists, a new child (R-014) ───── */
export type ClassOption = {
  class_id: string; name: string; style: string | null; day_of_week: number; start_time: string;
  age_min: number | null; age_max: number | null; price_minor: number; pricing: string; trial_price_minor: number | null;
  prerequisites: string | null; enrolled: boolean; waiting: boolean; asked: boolean; trial_booked: boolean;
  full: boolean; waitlist_enabled: boolean; trials_enabled: boolean; age_fits: boolean;
  trial_sessions: { id: string; starts_at: string }[];
};
export const CLASS_OPTIONS = `select * from app.class_options_for_child($1)`;
export const REQUEST_PLACE = `select app.request_class_place($1, $2, $3) as id`;
export const BOOK_TRIAL = `select app.parent_book_trial($1, $2) as result`;
export const JOIN_WAITLIST = `select app.parent_join_waitlist($1, $2) as position`;
export const REQUEST_CHILD = `select app.request_new_child($1::jsonb) as id`;

/* ── Drop-ins and packs (migration 0033) ────────────────────────────────── */
export type DropInSession = { session_id: string; class_name: string; style: string | null; starts_at: string; ends_at: string;
  price_minor: number; places_left: number; age_min: number | null; age_max: number | null };
export const DROP_IN_SESSIONS = `select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at`;
export const BOOK_DROP_IN = `select app.book_drop_in($1, $2) as r`;
export const CANCEL_DROP_IN = `select app.cancel_drop_in($1) as r`;
export type MyDropIn = { id: string; student_id: string; first_name: string; class_name: string; starts_at: string; paid_with: string };
export const MY_DROP_INS = `
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`;
export type Pack = { id: string; name: string; classes: number; price_minor: number; valid_days: number };
export const PACKS = `select id, name, classes, price_minor, valid_days from class_pack where active order by classes`;
export const BUY_PACK = `select app.buy_pack($1, $2) as id`;
export type MyPack = { id: string; first_name: string; name: string; remaining: number; expires_on: string };
export const MY_PACKS = `select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;
