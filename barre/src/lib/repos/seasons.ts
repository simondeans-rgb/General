/* Seasons (migration 0066): one exam model, re-enrolment and moving up,
   the show production pack, and the uniform list per class. */

/* ── Exams ───────────────────────────────────────────────────────────────── */
/** The session behind an "Exam" event. */
export const SESSION_FOR_EVENT = `
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on, x.fee_minor, x.event_id, x.bill_on_entry,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.event_id = $1 and x.deleted_at is null group by x.id`;
export const CONFIRM_EXAM_ENTRY = `select app.confirm_exam_entry($1, $2)`;
export const UPDATE_EXAM_ENTRY = `select app.update_exam_entry($1, $2, $3, $4::timestamptz)`;
export const EXAM_CERTIFICATE = `select app.exam_certificate($1, $2)`;

export type ExamStage = 'withdrawn' | 'entered' | 'confirmed' | 'sat' | 'result';
/** Entered → confirmed → sat → result, from one entry. */
export function examStage(e: { status: string; confirmed_at?: string | null; result?: string | null }): ExamStage {
  if (e.status === 'withdrawn') return 'withdrawn';
  if (e.result) return 'result';
  if (e.status === 'sat') return 'sat';
  return e.confirmed_at ? 'confirmed' : 'entered';
}
export const STAGE_WORD: Record<ExamStage, string> = {
  withdrawn: 'Withdrawn', entered: 'Entered', confirmed: 'Confirmed', sat: 'Sat', result: 'Result',
};

/* ── Re-enrolment ────────────────────────────────────────────────────────── */
export type Round = { id: string; from_term_id: string; to_term_id: string; from_term: string; to_term: string; to_starts: string;
  respond_by: string; status: 'draft' | 'open' | 'closed' | 'published' | 'cancelled'; offers: number; confirmed: number;
  declined: number; proposed: number; released: number; placed: number; waitlisted: number; no_class: number };
export const ROUNDS = `
select r.id, r.from_term_id, r.to_term_id, ft.name as from_term, tt.name as to_term, tt.starts_on as to_starts, r.respond_by, r.status,
       count(o.*)::int as offers,
       count(o.*) filter (where o.status = 'confirmed')::int as confirmed,
       count(o.*) filter (where o.status = 'declined')::int as declined,
       count(o.*) filter (where o.status = 'proposed')::int as proposed,
       count(o.*) filter (where o.status = 'released')::int as released,
       count(o.*) filter (where o.status = 'placed')::int as placed,
       count(o.*) filter (where o.status = 'waitlisted')::int as waitlisted,
       count(o.*) filter (where o.class_id is null and o.status not in ('placed', 'waitlisted'))::int as no_class
  from reenrolment_round r join term ft on ft.id = r.from_term_id join term tt on tt.id = r.to_term_id
  left join reenrolment_offer o on o.round_id = r.id
 group by r.id, ft.name, tt.name, tt.starts_on order by r.created_at desc`;

export type Offer = { id: string; student_id: string; student: string; age: number | null; from_class: string | null;
  class_id: string | null; class_name: string | null; reason: string; status: string; answered_at: string | null };
export const OFFERS = `
select o.id, o.student_id, s.first_name || ' ' || s.last_name as student,
       extract(year from age(t.starts_on, s.date_of_birth))::int as age,
       fc.name as from_class, o.class_id, c.name as class_name, o.reason, o.status, o.answered_at
  from reenrolment_offer o join reenrolment_round r on r.id = o.round_id join term t on t.id = r.to_term_id
  join student s on s.id = o.student_id
  left join class fc on fc.id = o.from_class_id left join class c on c.id = o.class_id
 where o.round_id = $1
 order by fc.day_of_week, fc.start_time, fc.name, s.first_name, s.last_name`;
export type NextClass = { id: string; name: string; level: string | null; age_min: number | null; age_max: number | null;
  capacity: number; day_of_week: number; start_time: string; proposed: number; confirmed: number };
export const NEXT_TERM_CLASSES = `
select c.id, c.name, l.name as level, c.age_min, c.age_max, c.capacity, c.day_of_week, c.start_time::text,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status not in ('declined', 'released')) as proposed,
       (select count(*)::int from reenrolment_offer o where o.round_id = $2 and o.class_id = c.id and o.status in ('confirmed', 'placed')) as confirmed
  from class c left join level l on l.id = c.level_id
 where c.term_id = $1 and c.deleted_at is null and c.pricing <> 'drop_in'
 order by c.day_of_week, c.start_time, c.name`;
export type LevelRow = { id: string; name: string; sort_order: number; next_level_id: string | null };
export const LEVELS = `select id, name, sort_order, next_level_id from level where deleted_at is null order by sort_order, name`;
export const SET_NEXT_LEVEL = `update level set next_level_id = $2, updated_at = now() where id = $1 returning id`;
export const START_REENROLMENT = `select app.start_reenrolment($1, $2, $3::date) as id`;
export const SET_REENROLMENT_CLASS = `select app.set_reenrolment_class($1, $2)`;
export const OPEN_REENROLMENT = `select app.open_reenrolment($1) as n`;
export const ANSWER_REENROLMENT = `select app.answer_reenrolment($1, $2) as r`;
export const CLOSE_REENROLMENT = `select app.close_reenrolment($1, $2) as n`;
export const REOPEN_REENROLMENT = `select app.reopen_reenrolment($1, $2::date)`;
export const CANCEL_REENROLMENT = `select app.cancel_reenrolment($1)`;
export const PUBLISH_REENROLMENT = `select app.publish_reenrolment($1) as r`;
export type PublishResult = { placed: number; waitlisted: number; released: number; offered: number };

export type FamilyOffer = { offer_id: string; round_id: string; student_id: string; child: string; from_class: string | null;
  class_id: string | null; class_name: string | null; day_of_week: number | null; start_time: string | null; location: string | null;
  price_minor: number | null; pricing: string | null; reason: string; status: string; respond_by: string; term_name: string;
  term_starts: string; round_status: string; uniform: string[] | null };
export const FAMILY_REENROLMENT = `select * from app.family_reenrolment()`;

export const REASON: Record<string, string> = {
  moves_up: 'Moves up', stays: 'Same class', by_age: 'By age', office: 'Chosen by the office', none: 'No class proposed',
};

/* ── Production pack ─────────────────────────────────────────────────────── */
export type RunningItem = { id: string; item_no: number; title: string; class_id: string | null; class_name: string | null;
  music: string | null; costume: string | null; notes: string | null; duration_sec: number | null; starts_after_sec: number;
  dancers: number; quick_change: string | null; quick_change_count: number; helpers: string | null };
export const RUNNING_ORDER = `select * from app.running_order($1)`;
export const ADD_ITEM = `insert into event_routine (event_id, class_id, title, music, duration_sec, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), $5, coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`;
export const UPDATE_ITEM = `update event_routine set title = btrim($2), class_id = $3, music = nullif(btrim($4), ''), duration_sec = $5,
  notes = nullif(btrim($6), ''), updated_at = now() where id = $1 returning id`;
export type ItemDancer = { student_id: string; name: string; in_item: boolean };
/** Everyone going to the show, and whether they dance in this item. */
export const ITEM_DANCERS = `
select s.id as student_id, s.first_name || ' ' || s.last_name as name,
       exists (select 1 from routine_dancer d where d.routine_id = $2 and d.student_id = s.id) as in_item
  from event_participant p join student s on s.id = p.student_id and s.deleted_at is null
 where p.event_id = $1 and p.status = 'confirmed' and p.deleted_at is null order by s.first_name, s.last_name`;
export const ADD_DANCER = `insert into routine_dancer (routine_id, student_id) values ($1, $2)`;
export const REMOVE_DANCER = `delete from routine_dancer where routine_id = $1 and student_id = $2`;
export const ITEM_SLOT = `insert into event_helper_slot (studio_id, event_id, role, needed, routine_id)
  select e.studio_id, e.id, btrim($3), $4, $2 from studio_event e where e.id = $1 returning id`;

export type CostumeBudget = { budget_minor: number | null; total_minor: string; families_minor: string; school_minor: string;
  billed_minor: string; to_bill: number; lines: number; sized: number };
export const COSTUME_BUDGET = `select * from app.costume_budget($1)`;
export const SET_COSTUME_BUDGET = `update studio_event set costume_budget_minor = $2, updated_at = now() where id = $1 returning id`;
export const ADD_COSTUME_ITEM = `insert into costume_item (event_id, routine_id, name, price_minor, charge_families) values ($1, $2, btrim($3), $4, $5) returning id`;
export const UPDATE_COSTUME_ITEM = `update costume_item set price_minor = $2, charge_families = $3 where id = $1 returning id`;
export type CostumeItemRow = { id: string; name: string; routine: string | null; price_minor: number; charge_families: boolean };
export const COSTUME_ITEMS = `select i.id, i.name, r.title as routine, i.price_minor, i.charge_families
  from costume_item i left join event_routine r on r.id = i.routine_id where i.event_id = $1 and i.deleted_at is null order by r.position nulls first, i.name`;
export const BILL_COSTUMES = `select app.bill_costumes($1) as n`;

export type LicenceRow = { student_id: string; dancer: string; age_on_day: number | null; items: number; needed: string; status: string;
  authority: string | null; reference: string | null; issued_on: string | null; expires_on: string | null;
  performance_days: number | null; note: string | null; flag: 'ok' | 'missing' | 'expired' | 'refused' | 'decide' | 'not_needed' };
export const LICENCES = `select * from app.licence_tracker($1)`;
export const SET_LICENCE = `select app.set_licence($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10)`;
export const SET_LICENCE_ALL = `select app.set_licence_needed_all($1, $2) as n`;

/* ── Uniform ─────────────────────────────────────────────────────────────── */
export type Uniform = { uniform: string[]; uniform_url: string | null };
export const CLASS_UNIFORM = `select uniform, uniform_url from class where id = $1`;
export const SET_CLASS_UNIFORM = `select app.set_class_uniform($1, $2::text[], $3)`;
export type ChildUniformRow = { class_id: string; class_name: string; uniform: string[]; uniform_url: string | null };
export const CHILD_UNIFORM = `select * from app.child_uniform($1)`;
export type PublicUniform = { class_name: string; uniform: string[]; uniform_url: string | null };
export const PUBLIC_UNIFORM = `select * from app.public_class_uniform($1)`;

/** "3:20" from seconds; "" when unknown. */
export const clockTime = (sec: number | null | undefined) =>
  sec == null ? '' : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
/** Seconds from "3:20", "3m 20", or "200". */
export function parseClock(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d+)\s*[:m.]\s*(\d{1,2})\s*s?$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return /^\d+$/.test(t) ? Number(t) : null;
}
