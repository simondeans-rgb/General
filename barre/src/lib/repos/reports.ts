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

/** $1 (when `at`) is a location id, or null for the whole school. A student
 *  counts at a location when enrolled in any class there; "All" counts each
 *  student once (UR-33). Money stays school-wide: payments are not tied to a
 *  site, so the per-location comparison shows what was billed instead. */
const headline = (at: boolean) => {
  const inLoc = (col: string) => at ? ` and ${col} in (select id from class where $1::uuid is null or location_id = $1::uuid)` : '';
  return `
with active_now as (
  select distinct student_id from enrolment where status = 'active' and deleted_at is null${inLoc('class_id')}
),
first_start as (
  select student_id, min(started_on) as first_on from enrolment where deleted_at is null${inLoc('class_id')} group by student_id
),
active_on as (
  select d, count(distinct student_id)::int as n
    from (values (current_date - 30), (current_date - 90)) v(d)
    join enrolment e on e.deleted_at is null and e.started_on <= v.d
                    and (e.ended_on is null or e.ended_on > v.d) and e.status in ('active', 'left')${inLoc('e.class_id')}
   group by d
),
left_since as (
  select e.student_id, max(e.ended_on) as last_end from enrolment e
   where e.deleted_at is null and e.status = 'left'${inLoc('e.class_id')}
     and not exists (select 1 from active_now a where a.student_id = e.student_id)
   group by e.student_id
),
cls as (
  select coalesce(sum(capacity), 0)::int as capacity,
         coalesce(sum(app.class_enrolled_count(id)), 0)::int as enrolled,
         coalesce(sum(app.class_waitlist_count(id)), 0)::int as waiting
    from class where deleted_at is null${inLoc('id')}
),
att as (
  select count(*) filter (where ar.status in ('present', 'late'))::int as attended,
         count(*) filter (where ar.status in ('present', 'late', 'absent'))::int as marked
    from attendance_record ar join class_session cs on cs.id = ar.session_id
   where ar.deleted_at is null and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()${inLoc('cs.class_id')}
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
};
export const HEADLINE = headline(false);
export const HEADLINE_AT = headline(true);

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

/* ── Locations (UR-33) ──────────────────────────────────────────────────── */
export type Location = { id: string; name: string };
/** Someone limited to some locations (UR-33) sees only theirs. */
const IN_MY_SCOPE = `(l.studio_id not in (select studio_id from app.my_location_scope())
       or l.id in (select location_id from app.my_location_scope()))`;
export const LOCATIONS = `select l.id, l.name from location l where l.deleted_at is null and ${IN_MY_SCOPE} order by l.name`;

export const WEEKLY_ATTENDANCE_AT = `
select to_char(w, 'YYYY-MM-DD') as week,
       count(ar.*) filter (where ar.status in ('present', 'late'))::int as attended,
       count(ar.*) filter (where ar.status in ('present', 'late', 'absent'))::int as marked
  from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') w
  left join class_session cs on cs.starts_at >= w and cs.starts_at < w + interval '1 week' and cs.starts_at < now()
       and cs.class_id in (select id from class where $1::uuid is null or location_id = $1::uuid)
  left join attendance_record ar on ar.session_id = cs.id and ar.deleted_at is null
 group by w order by w`;

/** Class figures, optionally for one location, with what an owner needs to
 *  spot an under-filled class: fill now and four weeks ago, the waiting list,
 *  and the money the empty places leave on the table (UR-51). */
export type ClassStatAt = ClassStat & { location_id: string; location: string | null; pricing: string; price_minor: number;
  enrolled_4w_ago: number };
export const CLASS_STATS_AT = `
select c.id, c.name, ds.name as style, ds.colour, c.capacity, c.location_id, l.name as location,
       c.pricing::text as pricing, c.price_minor,
       app.class_enrolled_count(c.id) as enrolled, app.class_waitlist_count(c.id) as waiting,
       (select count(distinct e.student_id)::int from enrolment e
         where e.class_id = c.id and e.deleted_at is null and e.status in ('active', 'left')
           and e.started_on <= current_date - 28 and (e.ended_on is null or e.ended_on > current_date - 28)) as enrolled_4w_ago,
       coalesce(a.attended, 0) as attended, coalesce(a.marked, 0) as marked
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join location l on l.id = c.location_id
  left join lateral (
    select count(*) filter (where ar.status in ('present','late'))::int as attended,
           count(*) filter (where ar.status in ('present','late','absent'))::int as marked
      from class_session cs join attendance_record ar on ar.session_id = cs.id and ar.deleted_at is null
     where cs.class_id = c.id and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()) a on true
 where c.deleted_at is null and ($1::uuid is null or c.location_id = $1::uuid)
 order by (app.class_enrolled_count(c.id)::numeric / nullif(c.capacity, 0)) desc nulls last, c.name`;

/** Below the threshold (a percentage). Drop-in classes are booked per session,
 *  so their enrolled count says nothing about how full they are. */
export function underFilled(c: { enrolled: number; capacity: number; pricing?: string }, pct: number): boolean {
  return c.pricing !== 'drop_in' && c.capacity > 0 && c.enrolled / c.capacity < pct / 100;
}

/** Side by side, one row per location: students counted once per site. */
export type LocationRow = { id: string; name: string; classes: number; students: number; enrolled: number; capacity: number;
  attended: number; marked: number; billed_30d_minor: string; fees_term_minor: string };
export const BY_LOCATION = `
select l.id, l.name,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes,
       (select count(distinct e.student_id)::int from enrolment e join class c on c.id = e.class_id
         where c.location_id = l.id and c.deleted_at is null and e.status = 'active' and e.deleted_at is null) as students,
       coalesce((select sum(app.class_enrolled_count(c.id)) from class c where c.location_id = l.id and c.deleted_at is null), 0)::int as enrolled,
       coalesce((select sum(c.capacity) from class c where c.location_id = l.id and c.deleted_at is null), 0)::int as capacity,
       (select count(*) filter (where ar.status in ('present','late'))::int from attendance_record ar
          join class_session cs on cs.id = ar.session_id join class c on c.id = cs.class_id
         where c.location_id = l.id and ar.deleted_at is null and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()) as attended,
       (select count(*) filter (where ar.status in ('present','late','absent'))::int from attendance_record ar
          join class_session cs on cs.id = ar.session_id join class c on c.id = cs.class_id
         where c.location_id = l.id and ar.deleted_at is null and cs.starts_at >= now() - interval '28 days' and cs.starts_at < now()) as marked,
       coalesce((select sum(ii.total_minor) from invoice_item ii join invoice i on i.id = ii.invoice_id join class c on c.id = ii.class_id
         where c.location_id = l.id and ii.deleted_at is null and i.deleted_at is null and i.status not in ('draft', 'void')
           and i.issued_on > current_date - 30), 0)::bigint as billed_30d_minor,
       coalesce((select sum(coalesce(e.price_minor, c.price_minor)) from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
          join term t on t.id = c.term_id and current_date between t.starts_on and t.ends_on
         where c.location_id = l.id and e.status = 'active' and e.deleted_at is null and c.pricing in ('term', 'one_off')), 0)::bigint as fees_term_minor
  from location l where l.deleted_at is null and ${IN_MY_SCOPE} order by l.name`;

/* ── Retention, term on term (UR-34) ──────────────────────────────────────── */
// $1 is the term; the term before it is the one that started most recently
// before it. A student is "in" a term when enrolled (then or since left) in
// any of its classes; moving class within the school is not leaving.
const TERMS = `
with t as (select id, studio_id, name, starts_on from term where id = $1::uuid),
p as (select pt.id, pt.name from term pt, t where pt.studio_id = t.studio_id and pt.deleted_at is null and pt.id <> t.id
        and pt.starts_on < t.starts_on order by pt.starts_on desc limit 1),
roll as (
  select case when c.term_id = (select id from t) then 'c' else 'p' end as src, e.student_id, c.id as class_id, c.name as class_name,
         coalesce(ds.name, 'No style') as style, e.started_on, e.ended_on, s.date_of_birth
    from enrolment e join class c on c.id = e.class_id and c.deleted_at is null
    join student s on s.id = e.student_id and s.deleted_at is null
    left join dance_style ds on ds.id = c.dance_style_id
   where e.deleted_at is null and e.status <> 'cancelled'
     and (c.term_id = (select id from t) or c.term_id = (select id from p))
),
cur as (select distinct student_id from roll where src = 'c'),
prv as (select distinct student_id from roll where src = 'p')`;

export type RetentionSummary = { current_term: string; previous_term: string | null; previous: number; current: number;
  continuing: number; lapsed: number; new: number };
export const RETENTION_SUMMARY = `${TERMS}
select (select name from t) as current_term, (select name from p) as previous_term,
       (select count(*)::int from prv) as previous, (select count(*)::int from cur) as current,
       (select count(*)::int from prv where student_id in (select student_id from cur)) as continuing,
       (select count(*)::int from prv where student_id not in (select student_id from cur)) as lapsed,
       (select count(*)::int from cur where student_id not in (select student_id from prv)) as new`;

/** $2: 'class' | 'style' | 'age'. Leavers and stayers are counted against what
 *  they did last term; new students against what they do this term. */
export type RetentionRow = { label: string; previous: number; continuing: number; lapsed: number; new: number };
export const RETENTION_BY = `${TERMS},
keyed as (
  select distinct src, student_id,
         case $2::text when 'class' then class_name when 'style' then style
           else case when extract(year from age((select starts_on from t), date_of_birth)) < 5 then 'Under 5'
                     when extract(year from age((select starts_on from t), date_of_birth)) < 8 then '5 to 7'
                     when extract(year from age((select starts_on from t), date_of_birth)) < 11 then '8 to 10'
                     when extract(year from age((select starts_on from t), date_of_birth)) < 14 then '11 to 13'
                     when extract(year from age((select starts_on from t), date_of_birth)) < 18 then '14 to 17'
                     else 'Adults' end end as label
    from roll
)
select label,
       count(*) filter (where src = 'p')::int as previous,
       count(*) filter (where src = 'p' and student_id in (select student_id from cur))::int as continuing,
       count(*) filter (where src = 'p' and student_id not in (select student_id from cur))::int as lapsed,
       count(*) filter (where src = 'c' and student_id not in (select student_id from prv))::int as new
  from keyed group by label
 order by count(*) filter (where src = 'p') desc, label`;

/** Who to contact: last term's students with nothing this term. */
export type LapsedRow = { student_id: string; student: string; family_id: string; family: string; last_class: string;
  last_on: string | null; contact: string | null; phone: string | null; email: string | null };
export const LAPSED = `${TERMS}
select distinct on (r.student_id) r.student_id, s.first_name || ' ' || s.last_name as student, f.id as family_id, f.name as family,
       r.class_name as last_class, coalesce(r.ended_on, r.started_on) as last_on,
       g.full_name as contact, g.phone, g.email
  from roll r join student s on s.id = r.student_id join family f on f.id = s.family_id
  left join lateral (select full_name, phone, email from guardian g where g.family_id = f.id and g.deleted_at is null
                      order by g.is_primary desc limit 1) g on true
 where r.src = 'p' and r.student_id not in (select student_id from cur)
 order by r.student_id, coalesce(r.ended_on, r.started_on) desc nulls last`;

export const TERMS_LIST = `select id, name, starts_on from term where deleted_at is null order by starts_on desc`;

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
