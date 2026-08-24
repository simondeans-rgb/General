import type { Stamp } from '@/lib/format';

/**
 * Student and Parent hubs.
 *
 * These queries carry no `where student_id = ?` clause. Row level security has
 * already narrowed the rows to the signed-in person, and repeating the filter
 * here would mask a policy mistake rather than defend against one.
 *
 * One exception is deliberate: feedback_note.private_note is never selected.
 * It is a staff-only field on a row a family is allowed to read, so the column
 * is withheld by every query that a family can reach. There is a test that
 * fails if it ever appears here.
 */

export type Resource = {
  id: string; kind: 'video' | 'audio' | 'document' | 'link';
  title: string; description: string | null; category: string | null;
  url: string | null; poster_url: string | null; duration_sec: number | null;
  scope_label: string | null;
};

export const RESOURCES = `
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`;

export type Feedback = {
  id: string; headline: string | null; going_well: string | null; work_on: string | null;
  created_at: Stamp; shared_at: Stamp | null;
  class_name: string | null; author: string | null;
  student_name: string; student_id: string;
};

/** Shared notes only — the policy enforces it, and the column list withholds
 *  the staff-only note regardless. */
export const STUDENT_FEEDBACK = `
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`;

export const MY_ASSESSMENTS = `
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`;

export type EventRow = {
  id: string; kind: string; title: string; description: string | null;
  starts_at: Stamp; ends_at: Stamp | null; venue: string | null;
  cost_minor: number | null; capacity: number | null; entries_close_on: string | null;
  requests_open: boolean; teacher: string | null; student_id: string | null;
  going: number; my_status: string | null; my_student: string | null;
};

export const EVENTS = `
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day'
 order by ev.starts_at`;

export const REQUEST_PLACE = `
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`;

export type RequestRow = {
  id: string; kind: string; status: string; subject: string; body: string;
  answer: string | null; created_at: Stamp; answered_at: Stamp | null;
  student_name: string | null; family_name: string | null;
};

export const MY_REQUESTS = `
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`;

export const RAISE_REQUEST = `
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`;

/** The student's own timetable, including events they are confirmed for. */
export const MY_TIMETABLE = `
select cs.id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       'class' as entry_kind
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select ev.id, ev.title, ev.starts_at, ev.ends_at, 'scheduled',
       ev.kind::text, 'indigo', null, ev.venue, sm.display_name, 'event'
  from studio_event ev
  join event_participant p on p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at >= $1::timestamptz and ev.starts_at < $2::timestamptz
 order by starts_at`;

/* ── Staff side ─────────────────────────────────────────────────────────── */

export const WRITE_FEEDBACK = `
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`;

export const PENDING_REQUESTS = `
select r.id, r.kind, r.status, r.subject, r.body, r.created_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by r.created_at`;

export const PENDING_ENTRIES = `
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`;

export const DECIDE_ENTRY = `
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`;

export const ANSWER_REQUEST = `
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`;
