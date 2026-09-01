/** Classes, capacity and the enquiry funnel. */

export type ClassRow = {
  id: string; name: string; style: string | null; colour: string | null; level: string | null;
  teacher: string | null; location: string | null; room: string | null;
  day_of_week: number; start_time: string; duration_min: number;
  capacity: number; enrolled: number; waiting: number; pct: number | null;
  age_min: number | null; age_max: number | null; price_minor: number;
  trials_enabled: boolean; sessions_left: number;
};

export const CLASSES = `
select c.id, c.name, ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, l.name as location, r.name as room,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity,0))::int as pct,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null
           and cs.starts_at > now() and cs.status = 'scheduled') as sessions_left
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join location l on l.id = c.location_id
  left join room r on r.id = c.room_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`;

export const CLASS_ROSTER = `
select s.id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
       f.name as family_name,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar
          join class_session cs on cs.id = ar.session_id and cs.class_id = e.class_id
         where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from enrolment e
  join student s on s.id = e.student_id
  join family f on f.id = s.family_id
 where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
 order by s.last_name, s.first_name`;

export const CLASS_WAITLIST = `
select w.id, w.position, w.status, s.first_name, s.last_name, f.name as family_name
  from waitlist_entry w
  join student s on s.id = w.student_id
  join family f on f.id = s.family_id
 where w.class_id = $1 and w.status in ('waiting','offered') and w.deleted_at is null
 order by w.position`;

/* ── Enquiry funnel ─────────────────────────────────────────────────────── */
export type FunnelRow = { stage: string; n: number };

export const FUNNEL = `
select
  count(*)::int as total,
  count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int as booked,
  count(*) filter (where stage in ('trial_attended','enrolled'))::int as attended,
  count(*) filter (where stage = 'enrolled')::int as converted,
  count(*) filter (where stage = 'closed_lost')::int as lost
from enquiry where deleted_at is null`;

export const ENQUIRIES = `
select e.id, e.stage, e.contact_name, e.contact_email, e.contact_phone,
       e.child_name, e.child_dob, e.source, e.next_action_on, e.created_at,
       c.name as class_name, ds.colour
  from enquiry e
  left join class c on c.id = e.interest_class_id
  left join dance_style ds on ds.id = c.dance_style_id
 where e.deleted_at is null
 order by
   array_position(array['trial_attended','follow_up','trial_booked','trial_requested',
                        'enquiry','trial_missed','enrolled','closed_lost']::text[], e.stage::text),
   e.next_action_on nulls last`;

export const TERMS = `
select t.id, t.name, t.starts_on, t.ends_on, t.status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null order by t.starts_on desc`;

export const LOCATIONS = `
select l.id, l.name, l.address_line1, l.city, l.postcode,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`;

/* ── Building the timetable ─────────────────────────────────────────────── */

/** Everything the class form needs to offer, in one round trip each. */
export const STYLES    = `select id, name, colour from dance_style where deleted_at is null order by name`;
export const LEVELS    = `select id, name from level where deleted_at is null order by sort_order, name`;
export const ROOMS     = `select r.id, r.name, r.location_id, r.capacity, l.name as location
                            from room r join location l on l.id = r.location_id
                           where r.deleted_at is null order by l.name, r.name`;
export const TEACHERS  = `select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`;
export const OPEN_TERMS = `select id, name, starts_on, ends_on from term
                            where deleted_at is null and status <> 'archived'
                            order by starts_on desc`;

export type ClassDraft = {
  id?: string;
  name: string; term_id: string; dance_style_id: string; level_id: string | null;
  location_id: string; room_id: string | null; teacher_id: string | null;
  day_of_week: number; start_time: string; duration_min: number;
  capacity: number; age_min: number | null; age_max: number | null;
  price_minor: number; trials_enabled: boolean; waitlist_enabled: boolean;
  visibility: 'public' | 'unlisted' | 'private';
};

export const CREATE_CLASS = `
insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id,
                   teacher_id, name, day_of_week, start_time, duration_min, capacity,
                   age_min, age_max, price_minor, pricing, trials_enabled, waitlist_enabled,
                   visibility)
select t.studio_id, t.id, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11,
       $12, $13, $14, 'term', $15, $16, $17::class_visibility
  from term t where t.id = $1
returning id`;

export const UPDATE_CLASS = `
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, updated_at = now()
 where id = $1
returning id`;

/** Lay the term's sessions down for a brand new class. */
export const GENERATE_SESSIONS = `select app.generate_class_sessions($1) as made`;

/** Rebuild the untouched future sessions after a class moves day or time.
 *  Sessions with a register already taken are left where they are. */
export const RESCHEDULE_CLASS = `select app.reschedule_class($1) as net`;

/** The saved shape of one class, for the edit form. */
export const CLASS_FOR_EDIT = `
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`;
