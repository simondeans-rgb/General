/* Reporting. Every number is a query over operational rows — enrolments,
   registers, the ledger — so it cannot disagree with the screens it summarises. */

export type Headline = {
  active_students: number; active_30d_ago: number; new_30d: number; leavers_30d: number;
  enrolled: number; capacity: number; waiting: number;
  attended_28d: number; marked_28d: number;
  enquiries: number; converted: number; trials_attended: number;
  outstanding_minor: string; collected_30d_minor: string; history_days: number;
  leavers_90d: number; active_90d_ago: number;
  issued_90d_minor: string; overdue_90d_minor: string;
};

export const HEADLINE = `
with active_now as (
  select distinct student_id from enrolment where status = 'active' and deleted_at is null
),
first_start as (
  select student_id, min(started_on) as first_on from enrolment where deleted_at is null group by student_id
),
active_on as (
  select d, count(distinct student_id)::int as n
    from (values (current_date - 30), (current_date - 90)) v(d)
    join enrolment e on e.deleted_at is null and e.started_on <= v.d
                    and (e.ended_on is null or e.ended_on > v.d) and e.status in ('active', 'left')
   group by d
),
left_since as (
  select e.student_id, max(e.ended_on) as last_end from enrolment e
   where e.deleted_at is null and e.status = 'left'
     and not exists (select 1 from active_now a where a.student_id = e.student_id)
   group by e.student_id
),
cls as (
  select coalesce(sum(capacity), 0)::int as capacity,
         coalesce(sum(app.class_enrolled_count(id)), 0)::int as enrolled,
         coalesce(sum(app.class_waitlist_count(id)), 0)::int as waiting
    from class where deleted_at is null
),
att as (
  select count(*) filter (where ar.status in ('present', 'late'))::int as attended,
         count(*) filter (where ar.status in ('present', 'late', 'absent'))::int as marked
    from attendance_record ar join class_session cs on cs.id = ar.session_id
   where ar.deleted_at is null and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()
)
select
  (select count(*)::int from active_now) as active_students,
  coalesce((select n from active_on where d = current_date - 30), 0) as active_30d_ago,
  coalesce((select n from active_on where d = current_date - 90), 0) as active_90d_ago,
  (select count(*)::int from first_start where first_on > current_date - 30) as new_30d,
  (select count(*)::int from left_since where last_end > current_date - 30) as leavers_30d,
  (select count(*)::int from left_since where last_end > current_date - 90) as leavers_90d,
  cls.enrolled, cls.capacity, cls.waiting,
  att.attended as attended_28d, att.marked as marked_28d,
  (select count(*)::int from enquiry where deleted_at is null) as enquiries,
  (select count(*)::int from enquiry where deleted_at is null and stage = 'enrolled') as converted,
  -- The same definitions as the Enrolment funnel (FUNNEL in classes.ts), so the
  -- two screens agree: came to a trial = reached "tried a class" or enrolled.
  (select count(*)::int from enquiry where deleted_at is null and stage in ('trial_attended','enrolled')) as trials_attended,
  coalesce((select sum(balance_minor) from family where deleted_at is null and balance_minor > 0), 0)::bigint as outstanding_minor,
  coalesce((select sum(amount_minor - refunded_minor) from payment where deleted_at is null
     and succeeded_at >= now() - interval '30 days' and method not in ('account','credit')), 0)::bigint as collected_30d_minor,
  coalesce((select sum(total_minor) from invoice where deleted_at is null and status <> 'void' and status <> 'draft'
     and issued_on > current_date - 90), 0)::bigint as issued_90d_minor,
  coalesce((select sum(total_minor - paid_minor) from invoice where deleted_at is null
     and status in ('issued','part_paid','refunded') and due_on < current_date and issued_on > current_date - 90), 0)::bigint as overdue_90d_minor,
  coalesce((select current_date - min(started_on) from enrolment where deleted_at is null), 0)::int as history_days
from cls, att`;

export type WeekRow = { week: string; attended: number; marked: number };
export const WEEKLY_ATTENDANCE = `
select to_char(w, 'YYYY-MM-DD') as week,
       count(*) filter (where ar.status in ('present', 'late'))::int as attended,
       count(*) filter (where ar.status in ('present', 'late', 'absent'))::int as marked
  from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') w
  left join class_session cs on cs.starts_at >= w and cs.starts_at < w + interval '1 week' and cs.starts_at < now()
  left join attendance_record ar on ar.session_id = cs.id and ar.deleted_at is null
 group by w order by w`;

export type ClassStat = { id: string; name: string; style: string | null; colour: string | null;
  enrolled: number; capacity: number; waiting: number; attended: number; marked: number };
export const CLASS_STATS = `
select c.id, c.name, ds.name as style, ds.colour, c.capacity,
       app.class_enrolled_count(c.id) as enrolled, app.class_waitlist_count(c.id) as waiting,
       coalesce(a.attended, 0) as attended, coalesce(a.marked, 0) as marked
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join lateral (
    select count(*) filter (where ar.status in ('present','late'))::int as attended,
           count(*) filter (where ar.status in ('present','late','absent'))::int as marked
      from class_session cs join attendance_record ar on ar.session_id = cs.id and ar.deleted_at is null
     where cs.class_id = c.id and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()) a on true
 where c.deleted_at is null
 order by (app.class_enrolled_count(c.id)::numeric / nullif(c.capacity, 0)) desc nulls last, c.name`;

export type MonthRow = { month: string; collected_minor: string; joined: number; left: number };
export const MONTHS = `
select to_char(m, 'YYYY-MM') as month,
       coalesce((select sum(amount_minor - refunded_minor) from payment p
                  where p.deleted_at is null and p.method not in ('account','credit')
                    and p.succeeded_at >= m and p.succeeded_at < m + interval '1 month'), 0)::bigint as collected_minor,
       (select count(*)::int from (select student_id, min(started_on) f from enrolment
                                    where deleted_at is null group by student_id) s
         where s.f >= m and s.f < m + interval '1 month') as joined,
       (select count(distinct student_id)::int from enrolment e
         where e.deleted_at is null and e.status = 'left' and e.ended_on >= m and e.ended_on < m + interval '1 month'
           and not exists (select 1 from enrolment x where x.student_id = e.student_id
                            and x.status = 'active' and x.deleted_at is null)) as left
  from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
 order by m`;

/* ── Spreadsheets for the office (R-012) ────────────────────────────────── */
// Medical details are deliberately not in any export: a spreadsheet leaves the
// app's access rules behind the moment it is downloaded.
export const EXPORTS = {
  attendance: {
    label: 'Attendance, this term', file: 'attendance',
    sql: `
select cs.starts_at::date as date, to_char(cs.starts_at, 'HH24:MI') as time, c.name as class,
       s.first_name || ' ' || s.last_name as student, a.status::text as status, a.reason as note
  from attendance_record a
  join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
  join term t on t.id = c.term_id and current_date between t.starts_on and t.ends_on
  join student s on s.id = a.student_id
 where a.deleted_at is null and cs.deleted_at is null
 order by cs.starts_at, c.name, s.last_name, s.first_name`,
  },
  classLists: {
    label: 'Class lists', file: 'class-lists',
    sql: `
select c.name as class, s.first_name, s.last_name, s.date_of_birth, e.started_on as joined,
       f.name as family
  from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
  join student s on s.id = e.student_id and s.deleted_at is null
  join family f on f.id = s.family_id
 where e.status = 'active' and e.deleted_at is null
 order by c.name, s.last_name, s.first_name`,
  },
  contacts: {
    label: 'Families and contacts', file: 'families',
    sql: `
select f.name as family, g.full_name as parent, g.relationship, g.phone, g.email, g.is_primary as main_contact,
       (select string_agg(s.first_name || ' ' || s.last_name, '; ' order by s.date_of_birth)
          from student s where s.family_id = f.id and s.deleted_at is null) as children
  from family f join guardian g on g.family_id = f.id and g.deleted_at is null
 where f.deleted_at is null and not f.is_prospect
 order by f.name, g.is_primary desc, g.full_name`,
  },
} as const;
