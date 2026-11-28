/* The office's events: shows, exams, competitions, workshops (migration 0031). */
export type OfficeEvent = { id: string; kind: string; status: string; title: string; description: string | null;
  starts_at: string; ends_at: string | null; venue: string | null; cost_minor: number | null; capacity: number | null;
  entries_close_on: string | null; requests_open: boolean;
  /** For an exam: the session's examining body and invoice-on-entry (0073). */
  exam_board?: string | null; exam_bill_on_entry?: boolean | null;
  invited: number; confirmed: number; requested: number; declined: number; billed: number };
export const EVENTS = `
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       (select xs.board from exam_session xs where xs.event_id = e.id and xs.deleted_at is null) as exam_board,
       (select xs.bill_on_entry from exam_session xs where xs.event_id = e.id and xs.deleted_at is null) as exam_bill_on_entry,
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

/* ── Costumes, rehearsal registers, programme, tickets (migration 0042) ──── */
export type CostumeLine = { item_id: string; item: string; routine: string | null; student_id: string; dancer: string; size: string | null; status: string; sizes: string[] };
export const COSTUME_LIST = `select * from app.costume_list($1)`;
export const ADD_COSTUME = `insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, btrim($3), $4) returning id`;
export const SET_COSTUME_STATUS = `
insert into costume_order (item_id, student_id, status) values ($1, $2, $3)
on conflict (item_id, student_id) do update set status = excluded.status, updated_at = now() returning item_id`;
export const SET_COSTUME_SIZE = `select app.set_costume_size($1, $2, $3)`;

export type RehearsalRow = { student_id: string; first_name: string; last_name: string; routines: string | null; status: string | null; has_medical: boolean; requires_alert: boolean };
export const REHEARSAL_REGISTER = `select * from app.rehearsal_register($1)`;
export const MARK_REHEARSAL = `select app.mark_rehearsal($1, $2, $3::attendance_status)`;

export type ProgrammeRow = { running_order: number; routine: string; class_name: string | null; dancers: string | null; unnamed: number };
export const PROGRAMME = `select * from app.event_programme($1)`;

export type TicketType = { id: string; name: string; price_minor: number; capacity: number | null; per_family_max: number; left: number | null; sold: number };
export const TICKET_TYPES = `
select t.id, t.name, t.price_minor, t.capacity, t.per_family_max, app.tickets_left(t.id) as left,
       coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0)::int as sold
  from ticket_type t where t.event_id = $1 and t.deleted_at is null order by t.price_minor desc, t.name`;
export const ADD_TICKET_TYPE = `insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, btrim($2), $3, $4, $5) returning id`;
export const BOOK_TICKETS = `select app.book_tickets($1, $2) as id`;
export const MY_TICKETS = `select b.id, t.event_id, t.name, b.quantity from ticket_booking b join ticket_type t on t.id = b.ticket_type_id where b.status = 'booked'`;

/* ── Exams (migration 0042) ──────────────────────────────────────────────── */
export type ExamSession = { id: string; board: string; title: string; exam_on: string; venue: string | null; entries_close_on: string | null;
  entries: number; results: number; unbilled: number; fee_minor?: number; event_id?: string | null; bill_on_entry?: boolean };
export const EXAM_SESSIONS = `
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on, x.fee_minor, x.event_id, x.bill_on_entry,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.deleted_at is null group by x.id order by (x.exam_on < current_date), x.exam_on`;
export const ADD_EXAM_SESSION = `
insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on, fee_minor, bill_on_entry)
select m.studio_id, btrim($1), btrim($2), $3::date, nullif(btrim($4), ''), $5::date, coalesce($6::int, 0), coalesce($7::boolean, false)
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null and app.in_scope(m.studio_id) limit 1 returning id`;
export type ExamEntry = { id: string; session_id: string; student_id: string; student: string; grade: string; fee_minor: number; status: string;
  result: string | null; mark: number | null; board: string; exam_title: string; exam_on: string;
  /* 0066: one exam model — entered → confirmed → sat → result. */
  confirmed_at: string | null; sits_at: string | null; certificate_received: boolean; invoice_id: string | null; venue: string | null };
const ENTRY_COLS = `e.id, e.session_id, e.student_id, s.first_name || ' ' || s.last_name as student, e.grade, e.fee_minor, e.status, e.result, e.mark,
       x.board, x.title as exam_title, x.exam_on, e.confirmed_at, e.sits_at, e.certificate_received, e.invoice_id, x.venue`;
export const EXAM_ENTRIES = `
select ${ENTRY_COLS} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.session_id = $1 order by e.sits_at nulls last, e.grade, s.first_name`;
export const STUDENT_EXAMS = `
select ${ENTRY_COLS} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.student_id = $1 and e.status <> 'withdrawn' order by x.exam_on desc`;
export const MY_EXAMS = `
select ${ENTRY_COLS} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.status <> 'withdrawn' order by x.exam_on desc`;
export const UPCOMING_EXAMS = `select id, board, title, exam_on from exam_session where deleted_at is null and exam_on >= current_date order by exam_on`;
export const ENTER_EXAM = `select app.enter_exam($1, $2, $3, $4::int) as id`;
export const EXAM_RESULT = `select app.exam_result($1, $2, $3)`;
export const WITHDRAW_EXAM = `select app.withdraw_exam($1)`;
export const BILL_EXAM = `select app.bill_exam($1) as n`;
export const SET_EXAM_DETAILS = `select app.set_exam_details($1, $2, $3)`;

/* ── Exam fees and the exam-day register (0072) ─────────────────────────── */
export type ExamFeeState = 'none' | 'unbilled' | 'unpaid' | 'part_paid' | 'paid';
export const FEE_WORD: Record<ExamFeeState, string> = { none: 'No fee', unbilled: 'Not billed', unpaid: 'Unpaid', part_paid: 'Part paid', paid: 'Paid' };
export const FEE_TONE: Record<ExamFeeState, 'positive' | 'critical' | 'caution' | 'muted'> = { none: 'muted', unbilled: 'caution', unpaid: 'critical', part_paid: 'caution', paid: 'positive' };
export type ExamRegisterRow = { entry_id: string; student_id: string; student: string; grade: string; sits_at: string | null; status: string;
  attendance: 'here' | 'absent' | null; fee_minor: number; fee_state: ExamFeeState; due_on: string | null };
export const EXAM_REGISTER = `select * from app.exam_register($1)`;
export const EXAM_SESSION_ONE = `select id, board, title, exam_on, venue, fee_minor, bill_on_entry from exam_session where id = $1 and deleted_at is null`;
export const MARK_EXAM_ATTENDANCE = `select app.mark_exam_attendance($1, $2)`;
export const SET_EXAM_BILLING = `select app.set_exam_billing($1, $2)`;
export type ExamDay = { session_id: string; board: string; title: string; exam_on: string; venue: string | null; candidates: number; unpaid: number };
export const MY_EXAM_DAYS = `select * from app.my_exam_days(current_date, current_date + 7)`;
export const STUDENT_PICK = `select id, first_name || ' ' || last_name as name from student where deleted_at is null order by first_name, last_name`;
export const RESULTS: [string, string][] = [['distinction', 'Distinction'], ['merit', 'Merit'], ['pass', 'Pass'],
  ['highly_commended', 'Highly commended'], ['commended', 'Commended'], ['not_yet', 'Not yet']];

/* ── Practice (migration 0042) ───────────────────────────────────────────── */
export type PracticeWeek = { student_id: string; student_name: string; week_start: string; minutes: number; sessions: number };
export const PRACTICE_WEEKLY = `select * from app.practice_weekly($1)`;
export const LOG_PRACTICE = `select app.log_practice($1, $2, $3) as id`;
export const MY_PRACTICE = `select id, practised_on, minutes, what from practice_log where student_id = $1 order by practised_on desc, created_at desc limit 10`;
/** A family's costume lines: RLS on student keeps it to their own children. */
export type MyCostume = { id: string; name: string; sizes: string[]; student_id: string; first_name: string; size: string | null; status: string | null };
export const MY_COSTUMES = `
select i.id, i.name, i.sizes, s.id as student_id, s.first_name, o.size, o.status
  from costume_item i
  join student s on s.id in (select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
                             union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
                                     and p.status = 'confirmed' and p.deleted_at is null)
  left join costume_order o on o.item_id = i.id and o.student_id = s.id
 where i.event_id = $1 and i.deleted_at is null and s.deleted_at is null
 order by i.name, s.first_name`;

/* ── Notices and helpers (UR-50, migration 0050) ─────────────────────────── */
export const SEND_EVENT_NOTICE = `select app.send_event_notice($1, $2, $3) as n`;
export type HelperSlot = { id: string; role: string; starts_at: string | null; ends_at: string | null; needed: number; note: string | null;
  filled: number; mine: boolean; helpers: string | null };
export const HELPER_SLOTS = `select * from app.helper_slots($1)`;
export const ADD_HELPER_SLOT = `insert into event_helper_slot (studio_id, event_id, role, starts_at, needed)
  select studio_id, id, btrim($2), $3::timestamptz, $4 from studio_event where id = $1 returning id`;
export const REMOVE_HELPER_SLOT = `update event_helper_slot set deleted_at = now() where id = $1 returning id`;
