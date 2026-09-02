/**
 * Studio setup: the things a studio must describe about itself before it can
 * run a timetable at all.
 *
 * These all sit behind the reference-table policies from migration 0006 —
 * readable by any member, writable only by an owner or admin. Removal goes
 * through app.retire_setup, which refuses while anything still depends on the
 * row rather than leaving a class pointing at a room that no longer exists.
 */

export type Location = {
  id: string; name: string; address_line1: string | null; address_line2: string | null;
  city: string | null; postcode: string | null; notes: string | null;
  rooms: number; classes: number;
};

export const LOCATIONS_FULL = `
select l.id, l.name, l.address_line1, l.address_line2, l.city, l.postcode, l.notes,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`;

export const CREATE_LOCATION = `
insert into location (studio_id, name, address_line1, address_line2, city, postcode, notes)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), nullif(btrim($6),'')
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_LOCATION = `
update location set name = $2, address_line1 = nullif(btrim($3),''),
       address_line2 = nullif(btrim($4),''), city = nullif(btrim($5),''),
       postcode = nullif(btrim($6),''), notes = nullif(btrim($7),''), updated_at = now()
 where id = $1 returning id`;

export type Room = {
  id: string; name: string; location_id: string; location: string;
  capacity: number | null; classes: number;
};

export const ROOMS_FULL = `
select r.id, r.name, r.location_id, r.capacity, l.name as location,
       (select count(*)::int from class c where c.room_id = r.id and c.deleted_at is null) as classes
  from room r join location l on l.id = r.location_id
 where r.deleted_at is null order by l.name, r.name`;

export const CREATE_ROOM = `
insert into room (studio_id, location_id, name, capacity)
select l.studio_id, l.id, $2, $3 from location l where l.id = $1
returning id`;

export const UPDATE_ROOM = `
update room set name = $2, capacity = $3, updated_at = now() where id = $1 returning id`;

export type Term = {
  id: string; name: string; starts_on: string; ends_on: string;
  status: string; classes: number; breaks: number;
};

export const TERMS_FULL = `
select t.id, t.name, t.starts_on, t.ends_on, t.status::text as status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes,
       (select count(*)::int from term_break b where b.term_id = t.id and b.deleted_at is null) as breaks
  from term t where t.deleted_at is null order by t.starts_on desc`;

export const CREATE_TERM = `
insert into term (studio_id, name, starts_on, ends_on, status)
select id, $1, $2::date, $3::date, $4::term_status
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_TERM = `
update term set name = $2, starts_on = $3::date, ends_on = $4::date,
       status = $5::term_status, updated_at = now()
 where id = $1 returning id`;

export type Break = { id: string; term_id: string; name: string; starts_on: string; ends_on: string };

export const BREAKS = `
select b.id, b.term_id, b.name, b.starts_on, b.ends_on
  from term_break b where b.deleted_at is null and b.term_id = $1
 order by b.starts_on`;

/** The generator skips these dates, so adding one is how a studio says
 *  "no classes that week" without cancelling each session by hand. */
export const CREATE_BREAK = `
insert into term_break (studio_id, term_id, name, starts_on, ends_on)
select t.studio_id, t.id, $2, $3::date, $4::date from term t where t.id = $1
returning id`;

export type Style = { id: string; name: string; colour: string; sort_order: number; classes: number };

export const STYLES_FULL = `
select s.id, s.name, s.colour, s.sort_order,
       (select count(*)::int from class c where c.dance_style_id = s.id and c.deleted_at is null) as classes
  from dance_style s where s.deleted_at is null order by s.sort_order, s.name`;

export const CREATE_STYLE = `
insert into dance_style (studio_id, name, colour, sort_order)
select id, $1, $2, coalesce((select max(sort_order) + 1 from dance_style where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_STYLE = `
update dance_style set name = $2, colour = $3, updated_at = now() where id = $1 returning id`;

export type Level = { id: string; name: string; sort_order: number; classes: number };

export const LEVELS_FULL = `
select lv.id, lv.name, lv.sort_order,
       (select count(*)::int from class c where c.level_id = lv.id and c.deleted_at is null) as classes
  from level lv where lv.deleted_at is null order by lv.sort_order, lv.name`;

export const CREATE_LEVEL = `
insert into level (studio_id, name, sort_order)
select id, $1, coalesce((select max(sort_order) + 1 from level where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`;

export const UPDATE_LEVEL = `
update level set name = $2, updated_at = now() where id = $1 returning id`;

/** Refuses while anything still points at the row. */
export const RETIRE_SETUP = `select app.retire_setup($1, $2) as ok`;

/* ── The studio itself ──────────────────────────────────────────────────── */
export type StudioRow = {
  id: string; name: string; timezone: string; currency: string;
  contact_email: string | null; contact_phone: string | null;
  onboarded_at: string | null;
};

export const STUDIO = `
select id, name, timezone, currency, contact_email, contact_phone, onboarded_at
  from studio where deleted_at is null limit 1`;

/** Owner only — studio_write is the one policy narrowed past is_admin. */
export const UPDATE_STUDIO = `
update studio set name = $2, timezone = $3, contact_email = nullif(btrim($4),''),
       contact_phone = nullif(btrim($5),''), updated_at = now()
 where id = $1 returning id`;
