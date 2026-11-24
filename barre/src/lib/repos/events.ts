/* The office's events: shows, exams, competitions, workshops (migration 0031). */
export type OfficeEvent = { id: string; kind: string; status: string; title: string; description: string | null;
  starts_at: string; ends_at: string | null; venue: string | null; cost_minor: number | null; capacity: number | null;
  entries_close_on: string | null; requests_open: boolean;
  invited: number; confirmed: number; requested: number; declined: number; billed: number };
export const EVENTS = `
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       count(p.*) filter (where p.status = 'invited')::int as invited,
       count(p.*) filter (where p.status = 'confirmed')::int as confirmed,
       count(p.*) filter (where p.status = 'requested')::int as requested,
       count(p.*) filter (where p.status = 'declined')::int as declined,
       (select count(distinct ii.student_id)::int from invoice_item ii where ii.event_id = e.id and ii.deleted_at is null) as billed
  from studio_event e left join event_participant p on p.event_id = e.id and p.deleted_at is null
 where e.deleted_at is null and e.parent_event_id is null and e.kind <> 'private_lesson'
 group by e.id order by (e.starts_at < now()), e.starts_at`;
export const CREATE_EVENT = `
insert into studio_event (studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, capacity, entries_close_on, requests_open, created_by)
select m.studio_id, $1::event_kind, $2::event_status, btrim($3), nullif(btrim($4), ''), $5::timestamptz, $6::timestamptz, nullif(btrim($7), ''),
       $8, $9, $10::date, $11, auth.uid()
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`;
export const UPDATE_EVENT = `
update studio_event set kind = $2::event_kind, status = $3::event_status, title = btrim($4), description = nullif(btrim($5), ''),
       starts_at = $6::timestamptz, ends_at = $7::timestamptz, venue = nullif(btrim($8), ''), cost_minor = $9, capacity = $10,
       entries_close_on = $11::date, requests_open = $12, updated_at = now() where id = $1 returning id`;

export type Participant = { id: string; status: string; student: string; class_name: string | null };
export const PARTICIPANTS = `
select p.id, p.status::text as status, s.first_name || ' ' || s.last_name as student, c.name as class_name
  from event_participant p join student s on s.id = p.student_id left join class c on c.id = p.invited_class_id
 where p.event_id = $1 and p.deleted_at is null order by p.status, s.first_name`;
export const INVITE_CLASSES = `select app.invite_classes($1, $2::uuid[]) as n`;
export const BILL_EVENT = `select app.bill_event($1) as n`;
export const SET_PARTICIPANT = `update event_participant set status = $2::participant_status, decided_by = auth.uid(), decided_at = now() where id = $1 returning id`;

export type Routine = { id: string; title: string; position: number; costume: string | null; music: string | null; class_name: string | null; class_id: string | null };
export const ROUTINES = `select r.id, r.title, r.position, r.costume, r.music, c.name as class_name, r.class_id
  from event_routine r left join class c on c.id = r.class_id where r.event_id = $1 and r.deleted_at is null order by r.position, r.title`;
export const ADD_ROUTINE = `insert into event_routine (event_id, class_id, title, costume, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`;
export const MOVE_ROUTINE = `
with me as (select id, event_id, position from event_routine where id = $1),
     other as (select r.id, r.position from event_routine r, me where r.event_id = me.event_id and r.deleted_at is null and r.id <> me.id
                 and case when $2 < 0 then r.position < me.position else r.position > me.position end
               order by case when $2 < 0 then -r.position else r.position end limit 1)
update event_routine r set position = case when r.id = (select id from me) then (select position from other) else (select position from me) end
 where r.id in ((select id from me), (select id from other)) returning r.id`;
export const REMOVE_ROUTINE = `delete from event_routine where id = $1`;

export type Rehearsal = { id: string; title: string; starts_at: string; ends_at: string | null; venue: string | null };
export const REHEARSALS = `select id, title, starts_at, ends_at, venue from studio_event where parent_event_id = $1 and deleted_at is null order by starts_at`;
export const ADD_REHEARSAL = `insert into studio_event (studio_id, kind, title, starts_at, ends_at, venue, parent_event_id, requests_open, created_by)
  select studio_id, 'rehearsal', btrim($2), $3::timestamptz, $4::timestamptz, nullif(btrim($5), ''), id, false, auth.uid() from studio_event where id = $1 returning id`;

export type Chaperone = { id: string; name: string; phone: string | null; role: string | null; checked: boolean };
export const CHAPERONES = `select id, name, phone, role, checked from event_chaperone where event_id = $1 and deleted_at is null order by name`;
export const ADD_CHAPERONE = `insert into event_chaperone (event_id, name, phone, role, checked) values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`;
export const REMOVE_CHAPERONE = `delete from event_chaperone where id = $1`;
