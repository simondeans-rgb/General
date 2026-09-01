import type { Stamp } from '@/lib/format';
/** The teacher's day. Deliberately narrow: their classes, their students. */

export type TeachSession = {
  id: string; class_id: string; name: string; starts_at: Stamp; ends_at: Stamp;
  status: string; style: string | null; colour: string | null;
  room: string | null; location: string | null;
  enrolled: number; capacity: number; trials: number;
  marked: number; register_closed_at: string | null;
};

export const MY_SESSIONS = `
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at`;

export type RegisterEntry = {
  student_id: string; first_name: string; last_name: string; preferred_name: string | null;
  date_of_birth: Stamp; status: string | null; reason: string | null;
  requires_alert: boolean; allergies: string | null; action_plan: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null;
  is_trial: boolean; attendance_pct: number | null;
};

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
   where e.class_id = (select class_id from class_session where id = $1)
     and e.status = 'active' and e.deleted_at is null
  union all
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, true
    from trial t
    join student s on s.id = t.student_id
   where t.session_id = $1 and t.status in ('booked','attended') and t.deleted_at is null
)
select roll.id as student_id, roll.first_name, roll.last_name, roll.preferred_name,
       roll.date_of_birth, roll.is_trial,
       ar.status, ar.reason,
       coalesce(b.requires_alert, false) as requires_alert,
       b.allergies, b.action_plan, b.emergency_contact_name, b.emergency_contact_phone,
       (select round(100.0 * count(*) filter (where a2.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record a2 where a2.student_id = roll.id and a2.deleted_at is null) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`;

export const MARK_ATTENDANCE = `
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), now()
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at
returning id, status`;


/** Everyone a teacher may see, which is everyone in their own classes. */
export const MY_STUDENTS = `
select s.id, s.first_name, s.last_name, s.date_of_birth,
       coalesce(b.requires_alert, false) as requires_alert, b.allergies,
       (select string_agg(distinct c.name, ', ') from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null
           and c.id in (select app.teacher_class_ids())) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
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
