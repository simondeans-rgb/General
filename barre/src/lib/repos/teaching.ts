import type { Stamp } from '@/lib/format';
/** The teacher's day. Deliberately narrow: their classes, their students. */

export type TeachSession = {
  id: string; class_id: string; name: string; starts_at: Stamp; ends_at: Stamp;
  status: string; style: string | null; colour: string | null;
  room: string | null; location: string | null;
  enrolled: number; capacity: number; trials: number;
  marked: number; register_closed_at: string | null;
  covering: boolean; covered_by: string | null; cover_requested: boolean; cancel_reason: string | null;
  /** First names of children reported absent in advance, if any. */
  reported_absent?: string | null;
};

export const MY_SESSIONS = `
with me as (select id from staff_member where user_id = auth.uid() and deleted_at is null)
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at, cs.cancel_reason,
       -- Children whose family has said they will not be there (UR-07).
       (select string_agg(coalesce(st.preferred_name, st.first_name), ', ' order by st.first_name)
          from absence_report ab join student st on st.id = ab.student_id
         where ab.session_id = cs.id and ab.status = 'active') as reported_absent,
       (cs.teacher_id in (select id from me) and c.teacher_id not in (select id from me)) as covering,
       case when cs.teacher_id is not null and cs.teacher_id not in (select id from me)
            then (select display_name from staff_member where id = cs.teacher_id) end as covered_by,
       exists (select 1 from studio_request q where q.session_id = cs.id and q.status in ('open','in_progress')
                and q.deleted_at is null) as cover_requested
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
   -- Mine: classes I teach or assist, and sessions I am covering.
   and (c.teacher_id in (select id from me) or c.assistant_id in (select id from me) or cs.teacher_id in (select id from me))
 order by cs.starts_at`;

export type RegisterEntry = {
  student_id: string; first_name: string; last_name: string; preferred_name: string | null;
  date_of_birth: Stamp; status: string | null; reason: string | null;
  is_trial: boolean; attendance_pct: number | null;
  /** explicit | reported | rest — what kind of mark the server holds (0048). */
  mark_kind: string | null;
  /** An advance absence report, if the family or the student made one (UR-07). */
  reported_note: string | null; reported_by: 'guardian' | 'student' | null;
} & Brief;

/** What a teacher may know about a child's safety (migration 0020). */
export type Brief = {
  requires_alert: boolean; has_medical_need: boolean;
  allergies: string | null; conditions: string | null; medications: string | null; action_plan: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null;
  emergency_contacts: { name: string; relationship: string | null; phone: string | null }[];
  photo_consent: boolean | null;
  /** Who may, and may not, collect the child (UR-17). */
  collection?: { name: string; relationship: string | null; allowed: boolean }[];
};

const BRIEF_COLUMNS = `coalesce(b.requires_alert, false) as requires_alert,
       coalesce(b.has_medical_need, false) as has_medical_need,
       b.allergies, b.conditions, b.medications, b.action_plan,
       b.emergency_contact_name, b.emergency_contact_phone,
       coalesce(b.emergency_contacts, '[]'::jsonb) as emergency_contacts, b.photo_consent,
       app.collection_brief(b.student_id) as collection`;

/** Attendance this term (UR-54): sessions since the current term began, up
 *  to now. */
/** Attendance this term: one security check per child, then a plain count (0067). */
const TERM_ATTENDANCE = (student: string) => `app.term_attendance_pct(${student})`;

/**
 * The register for one session: everyone enrolled, plus anyone trialling.
 * Safety information comes from student_safety_brief, which is the only route
 * a teacher has to it — the medical table itself is closed to them.
 */
export const REGISTER = `
with roll as (
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, false as is_trial
    from enrolment e
    join student s on s.id = e.student_id
    join class_session cs on cs.id = $1 and cs.class_id = e.class_id
   -- A child moving class (UR-52) is on the old class's registers before the
   -- move day and on the new one's from it.
   where e.deleted_at is null
     and app.enrolment_on(e.status, e.started_on, e.ended_on, e.moved_from, e.moved_to, cs.starts_at::date)
  union all
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, true
    from trial t
    join student s on s.id = t.student_id
   where t.session_id = $1 and t.status in ('booked','attended') and t.deleted_at is null
  union all
  -- Drop-ins (migration 0033) are marked like anyone in the class.
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, false
    from drop_in_booking d
    join student s on s.id = d.student_id
   where d.session_id = $1 and d.status = 'booked'
)
select roll.id as student_id, roll.first_name, roll.last_name, roll.preferred_name,
       roll.date_of_birth, roll.is_trial,
       ar.status, ar.reason, ar.mark_kind,
       rep.note as reported_note, rep.reporter as reported_by,
       ${BRIEF_COLUMNS},
       ${TERM_ATTENDANCE('roll.id')} as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join absence_report rep on rep.student_id = roll.id and rep.session_id = $1 and rep.status = 'active'
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`;

/* $5 is when the teacher tapped, by the device's clock; $6 is the kind of
   mark: 'explicit' (a tap on this child) or 'rest' ("Mark the rest here").
   A mark taken offline and synced later must not overwrite what someone
   actually did since (UR-04), so:
     - an explicit mark beats a reported or "rest" mark, whatever the times;
     - between marks of the same kind the later device time wins, and when
       two device times are within two minutes of each other (clocks drift)
       the later arrival wins. */
export const MARK_ATTENDANCE = `
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at, mark_kind)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), coalesce($5::timestamptz, now()), coalesce($6::text, 'explicit')
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at, mark_kind = excluded.mark_kind,
      reported_by_guardian = false, updated_at = now()
  where attendance_record.client_marked_at is null
     or app.mark_rank(excluded.mark_kind) > app.mark_rank(attendance_record.mark_kind)
     or (app.mark_rank(excluded.mark_kind) = app.mark_rank(attendance_record.mark_kind)
         and excluded.client_marked_at >= attendance_record.client_marked_at - interval '2 minutes')
returning id, status`;

/** The office changing a register after its window, with a reason (UR-37). */
export const AMEND_ATTENDANCE = `select app.amend_attendance($1, $2, $3::attendance_status, $4)`;

/** Whether a register can be marked now (UR-37), and why a link shows nothing (UR-54). */
export type RegisterWindow = { opens_at: Stamp; closes_at: Stamp; state: 'open' | 'early' | 'late'; edit_days: number; before_min: number };
export const REGISTER_WINDOW = `
select w.opens_at, w.closes_at, w.state, st.register_edit_days as edit_days, st.register_opens_before_min as before_min
  from app.register_window($1) w, class_session cs join studio st on st.id = cs.studio_id
 where cs.id = $1`;
export const SESSION_ACCESS = `select app.session_access($1) as access`;


/** Everyone a teacher may see, which is everyone in their own classes. */
export const MY_STUDENTS = `
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       ${BRIEF_COLUMNS},
       app.my_class_names_for(s.id) as class_names,
       ${TERM_ATTENDANCE('s.id')} as attendance_pct
  from student s
  left join student_safety_brief b on b.student_id = s.id
 where s.deleted_at is null
 order by s.last_name, s.first_name`;

/* ── Running the room: notes, register close, class notices ─────────────── */

/** What the teacher wrote about how the session went. */
export const SESSION_NOTES = `
select cs.id, cs.notes, cs.register_closed_at, cs.status, cs.class_id
  from class_session cs where cs.id = $1 and cs.deleted_at is null`;

export const SAVE_SESSION_NOTES = `
update class_session set notes = nullif(btrim($2), ''), updated_at = now()
 where id = $1
returning id, notes`;

/** MARK_ATTENDANCE clears the reason along with the mark, which is right: a
 *  child marked present has no absence to explain. This sets the reason on a
 *  mark already made, without disturbing it. */
export const SET_REASON = `
update attendance_record set reason = nullif(btrim($3), ''), updated_at = now()
 where session_id = $1 and student_id = $2 and deleted_at is null
returning id, reason`;

/** Refuses while anyone is unmarked, so "closed" always means complete. */
export const CLOSE_REGISTER = `select app.close_register($1) as ok`;

export const REOPEN_REGISTER = `
update class_session set register_closed_at = null, updated_at = now()
 where id = $1
returning id`;

export type Notice = {
  id: string; subject: string | null; body: string; sent_at: Stamp;
  sent_by_name: string | null; class_name: string | null; mine: boolean;
};

/** Notices pinned to one class, newest first. RLS decides who sees them. */
export const CLASS_NOTICES = `
select cm.id, cm.subject, cm.body, cm.sent_at,
       coalesce(sm.display_name, u.full_name) as sent_by_name,
       c.name as class_name,
       (cm.sent_by = auth.uid()) as mine
  from communication cm
  left join class c on c.id = cm.class_id
  left join user_account u on u.id = cm.sent_by
  left join staff_member sm on sm.user_id = cm.sent_by and sm.deleted_at is null
 where cm.deleted_at is null and cm.kind = 'class_broadcast' and cm.class_id = $1
 order by cm.sent_at desc`;

export const POST_NOTICE = `
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_by)
select c.studio_id, 'class_broadcast', 'in_app', c.id, nullif(btrim($2), ''), btrim($3), auth.uid()
  from class c where c.id = $1
returning id`;

export const EDIT_NOTICE = `
update communication set subject = nullif(btrim($2), ''), body = btrim($3), updated_at = now()
 where id = $1
returning id`;

export const WITHDRAW_NOTICE = `select app.withdraw_notice($1) as ok`;

/** Everything a teacher has sent lately, across all their classes. */
export const MY_NOTICES = `
select cm.id, cm.subject, cm.body, cm.sent_at, c.name as class_name,
       (cm.sent_by = auth.uid()) as mine,
       (select count(*)::int from enrolment e
         where e.class_id = cm.class_id and e.status = 'active' and e.deleted_at is null) as reaches
  from communication cm
  join class c on c.id = cm.class_id
 where cm.deleted_at is null and cm.kind = 'class_broadcast'
 order by cm.sent_at desc
 limit 40`;

export const REQUEST_COVER = `select app.request_cover($1, $2) as id`;
/** With a handover note for whoever covers (UR-27). */
export const REQUEST_COVER_HANDOVER = `select app.request_cover($1, $2, $3) as id`;
/** The teacher's next session after this one today, for "Next class". */
export const NEXT_SESSION = `
with me as (select id from staff_member where user_id = auth.uid() and deleted_at is null),
     this as (select starts_at from class_session where id = $1)
select cs.id, c.name, cs.starts_at from class_session cs join class c on c.id = cs.class_id
 where cs.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at > (select starts_at from this)
   and cs.starts_at < date_trunc('day', (select starts_at from this)) + interval '1 day'
   and (c.teacher_id in (select id from me) or c.assistant_id in (select id from me) or cs.teacher_id in (select id from me))
 order by cs.starts_at limit 1`;
