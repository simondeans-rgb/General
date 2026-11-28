import type { Stamp } from '@/lib/format';
/**
 * Owner dashboard queries.
 *
 * Every number on the screen is a real aggregate over real rows. Where a
 * figure cannot be derived honestly from the data — a teacher absence, say,
 * which this schema does not yet model — the card is not shown at all rather
 * than filled with something plausible.
 */

export type TodayCounts = {
  classes: number; students_expected: number; trials: number;
  cancelled: number; covered: number;
};

export const TODAY_COUNTS = `
with todays as (
  select cs.* from class_session cs
   where cs.deleted_at is null
     and (cs.starts_at at time zone 'Europe/London')::date = (now() at time zone 'Europe/London')::date
)
select
  count(*) filter (where status <> 'cancelled')::int as classes,
  coalesce((select count(*) from enrolment e
             where e.status = 'active' and e.deleted_at is null
               and e.class_id in (select class_id from todays where status <> 'cancelled')), 0)::int
    as students_expected,
  coalesce((select count(*) from trial t
             where t.deleted_at is null and t.status = 'booked'
               and t.session_id in (select id from todays)), 0)::int as trials,
  count(*) filter (where status = 'cancelled')::int as cancelled,
  count(*) filter (where teacher_id is not null)::int as covered
from todays`;

export type AttentionRow = {
  kind: string; headline: string; detail: string; count: number; href: string;
};

/** Card 1 — money that has not arrived. */
export const ATTENTION_PAYMENTS = `
select
  (select count(*)::int from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed,
  -- What the declined cards were for, as Billing shows it (UR-54, admins D11).
  (select coalesce(sum(p.amount_minor), 0)::bigint from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed_minor,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`;

/** Card 2 — classes under pressure, and the queue behind them. */
export const ATTENTION_CAPACITY = `
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`;

/** Card 3 — trials that went well and then went quiet. */
export const ATTENTION_TRIALS = `
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`;

/**
 * Card 4 — children who have stopped coming.
 * Consecutive is judged per class, not across a whole timetable: missing three
 * ballet lessons in a row means something, missing one of each of three
 * different classes does not.
 */
export const ATTENTION_LAPSED = `
with marks as (
  select ar.student_id, cs.class_id, ar.status,
         row_number() over (partition by ar.student_id, cs.class_id order by cs.starts_at desc) as rn
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
   where ar.deleted_at is null and cs.starts_at < now()
),
runs as (
  select student_id, class_id
    from marks where rn <= 3
   group by student_id, class_id
  having count(*) = 3 and bool_and(status in ('absent'))
)
select s.id, s.first_name, s.last_name,
       min(c.name) as class_name,
       count(*)::int as classes_affected
  from runs r
  join student s on s.id = r.student_id
  join class c on c.id = r.class_id
 group by s.id, s.first_name, s.last_name
 order by s.last_name, s.first_name`;

export type SessionRow = {
  id: string; class_id: string; name: string; starts_at: Stamp; ends_at: Stamp;
  status: string; style: string | null; colour: string | null; level: string | null;
  teacher: string | null; room: string | null; location: string | null;
  enrolled: number; capacity: number; trials: number;
  covered: boolean; cancel_reason: string | null; moved: boolean;
  usual_teacher: string | null; room_id: string | null; register_closed: boolean;
};

/** Today's timetable, and the same shape reused by the schedule screen. */
export const SESSIONS_BETWEEN = `
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id as covered,
       cs.cancel_reason, cs.original_starts_at is not null as moved, st.display_name as usual_teacher,
       coalesce(cs.room_id, c.room_id) as room_id, cs.register_closed_at is not null as register_closed
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at, c.name`;

/** One session, in the same shape as the schedule rows (for the session sheet). */
export const SESSION_BY_ID = SESSIONS_BETWEEN
  .replace('and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz', 'and cs.id = $1');

export const RECENT_ENROLMENTS = `
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`;

export const UPCOMING_TRIALS = `
select t.id, t.status, cs.starts_at, c.name as class_name,
       coalesce(eq.child_name, s.first_name || ' ' || s.last_name) as who,
       eq.contact_name
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join enquiry eq on eq.id = t.enquiry_id
  left join student s on s.id = t.student_id
 where t.deleted_at is null and t.status in ('requested','booked')
 order by cs.starts_at nulls last
 limit 6`;

export const OUTSTANDING_FAMILIES = `
select f.id, f.name, f.balance_minor,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.failure_code is not null
           and p.succeeded_at is null and p.deleted_at is null) as failed_payments
  from family f
 where f.deleted_at is null and f.balance_minor > 0
 order by f.balance_minor desc
 limit 6`;

export const RECENT_MESSAGES = `
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`;

/** Families whose latest message is theirs: the studio owes them a reply. */
export const ATTENTION_MESSAGES = `
select count(*)::int as awaiting,
       string_agg(name, ', ' order by last_at) filter (where rn <= 3) as names
  from (select f.name, last.sent_at as last_at, row_number() over (order by last.sent_at) rn
          from family f
          join lateral (select inbound, sent_at from communication c
                         where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                         order by c.sent_at desc limit 1) last on last.inbound
         where f.deleted_at is null) t`;

/** Card 5 — families waiting on the studio to answer or confirm. */
export const ATTENTION_REQUESTS = `
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`;

/* ── One session at a time (migration 0023) ─────────────────────────────── */
export const CANCEL_SESSION = `select app.cancel_session($1, $2, $3, $4)`;
export const MOVE_SESSION = `select app.move_session($1, $2::timestamptz, $3, $4, $5)`;
/** $5 handover note for the cover teacher, $6 assign despite a clash (UR-27). */
export const COVER_SESSION = `select app.cover_session($1, $2, $3, $4, $5, $6)`;
/** What the teacher is already doing around this session, with travel time between sites. */
export const COVER_CLASHES = `select session_id, class_name, starts_at, ends_at, location, needs_travel from app.cover_clashes($1, $2)`;
export const SESSION_HANDOVER = `select handover_note from class_session where id = $1`;
export const STAFF_OPTIONS = `select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name`;
export const ROOM_OPTIONS = `select r.id, l.name || ' · ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`;
export const SESSION_FAMILIES = `
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`;

/** The term running today, and how far through it we are (Today's header). */
export type TermNow = { name: string; week: number; weeks: number };
export const TERM_NOW = `
select t.name, (current_date - t.starts_on) / 7 + 1 as week, (t.ends_on - t.starts_on) / 7 + 1 as weeks
  from term t where t.deleted_at is null and current_date between t.starts_on and t.ends_on
 order by t.starts_on desc limit 1`;

/**
 * Enquiry follow-ups for Today (F10): open enquiries whose follow-up date is
 * due within the week. due_now is today or already past.
 */
export type FollowUp = { id: string; stage: string; contact_name: string; child_name: string | null;
  next_action_on: string; due_now: boolean };
export const ATTENTION_FOLLOW_UPS = `
select e.id, e.stage::text as stage, e.contact_name, e.child_name, e.next_action_on,
       e.next_action_on <= current_date as due_now
  from enquiry e
 where e.deleted_at is null and e.stage not in ('enrolled', 'closed_lost')
   and e.next_action_on is not null and e.next_action_on < current_date + 7
 order by e.next_action_on, e.created_at`;

/** The first class after a moment, and its term: where an empty week's "Go to first week" leads. */
export const NEXT_CLASS_WEEK = `
select cs.starts_at, t.name as term_name,
       not exists (select 1 from class_session e join class ec on ec.id = e.class_id
                    where ec.term_id = c.term_id and e.deleted_at is null and e.starts_at < cs.starts_at) as term_start
  from class_session cs join class c on c.id = cs.class_id
  left join term t on t.id = c.term_id
 where cs.deleted_at is null and c.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at >= $1::timestamptz
 order by cs.starts_at limit 1`;
