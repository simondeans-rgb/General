/* Progress: skills, quick feedback, reports, timeline, goals, reflections, milestones (migration 0029). */

export type SkillRow = { framework_id: string; framework: string; skill_id: string; skill: string; ord: number;
  level: Level | null; assessed_on: string | null; previous: Level | null };
export type Level = 'not_started' | 'developing' | 'secure' | 'mastered';
export const LEVELS: { key: Level; label: string; short: string }[] = [
  { key: 'not_started', label: 'Not started', short: '–' },
  { key: 'developing', label: 'Developing', short: 'D' },
  { key: 'secure', label: 'Secure', short: 'S' },
  { key: 'mastered', label: 'Mastered', short: 'M' },
];
export const STUDENT_SKILLS = `select * from app.student_skills($1)`;
export const SKILL_DEMOS = `select id, demo_url from framework_skill where demo_url is not null and deleted_at is null`;
export const SET_SKILL_DEMO = `select app.set_skill_demo($1, nullif(btrim($2), ''))`;
export const RECORD_SKILL = `select app.record_skill($1, $2, $3::assessment_level, $4) as id`;

export type Chip = { id: string; kind: 'going_well' | 'work_on'; label: string; position: number;
  band?: 'standard' | 'under_8'; sticker?: string | null };
/** The school's phrases (the office's settings), both age bands. */
export const CHIPS = `select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`;
export const ADD_CHIP = `
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`;
export const ADD_YOUNG_CHIP = `
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`;

/** UR-44: the phrases one class uses — the teacher's own set, or the school's for the class's age band. */
export type ClassChip = { id: string; kind: 'going_well' | 'work_on'; label: string; sticker: string | null; chip_position: number; own: boolean };
export const CLASS_CHIPS = `select * from app.class_chips($1)`;
export const ADD_CLASS_CHIP = `select app.add_class_chip($1, $2, $3, $4) as id`;
export const REMOVE_CLASS_CHIP = `select app.remove_class_chip($1, $2, $3) as ok`;
export const RESET_CLASS_CHIPS = `select app.reset_class_chips($1) as n`;

/** UR-55: how deeply a class tracks progress. */
export type Depth = 'notes' | 'notes_skills' | 'full';
export const DEPTHS: { key: Depth; label: string; hint: string }[] = [
  { key: 'notes', label: 'Notes', hint: 'Feedback notes only. No skill levels.' },
  { key: 'notes_skills', label: 'Notes and skills', hint: 'Notes and current skill levels.' },
  { key: 'full', label: 'Full', hint: 'Notes, skill levels and their history over time.' },
];
export const CLASS_DEPTH = `select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`;
export const SET_CLASS_DEPTH = `select app.set_class_depth($1, $2) as depth`;
export const SET_SKILL_TRACKING = `select app.set_skill_tracking($1, $2) as tracked`;

/** UR-48: do levels reach families at once, or with the share step? */
export const SKILL_PUBLISH = `select id, skill_publish from studio where id in (select app.studio_ids()) limit 1`;
export const SET_SKILL_PUBLISH = `select app.set_skill_publish($1, $2) as mode`;
export const UNSHARED_SKILLS = `select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null`;
export const SHARE_SKILLS = `select app.share_skills($1) as n`;

/** UR-43: every level, dated. */
export type HistoryRow = { skill_id: string | null; skill: string; style_id: string | null; style: string | null;
  level: Level; assessed_on: string; current_style: boolean; depth: Depth; published: boolean };
export const SKILL_HISTORY = `select * from app.skill_history($1)`;
export const REMOVE_CHIP = `select app.soft_delete('feedback_chip', $1)`;

export type Framework = { id: string; name: string; style: string | null; skills: { id: string; name: string; position: number }[] };
export const FRAMEWORKS = `
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`;
export const ADD_SKILL = `
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`;
export const RENAME_SKILL = `update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id`;
export const REMOVE_SKILL = `select app.soft_delete('framework_skill', $1)`;

/** Who was in a session, for the class feedback grid: the enrolled, and
 *  anyone trialling or dropping in (UR-54, teachers D12). The saved parts come
 *  back so reopening a child shows what was written (UR-25). */
export type FeedbackKid = { student_id: string; first_name: string; last_name: string; status: string | null;
  visiting: 'trial' | 'drop_in' | null;
  going_well: string | null; work_on: string | null; shared: boolean | null; edited_at: string | null;
  going_well_chips: string[] | null; work_on_chips: string[] | null; note: string | null; work_on_note: string | null;
  work_on_resource_id: string | null };
export const SESSION_FEEDBACK = `
with cs as (select * from class_session where id = $1),
kids as (
  select e.student_id, null::text as visiting, 0 as pri from cs
    join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
         and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  union all
  select t.student_id, 'trial', 1 from cs join trial t on t.session_id = cs.id and t.student_id is not null
         and t.deleted_at is null and t.status in ('booked', 'attended', 'converted')
  union all
  select d.student_id, 'drop_in', 2 from cs join drop_in_booking d on d.session_id = cs.id and d.status = 'booked'
),
one as (select distinct on (student_id) student_id, visiting from kids order by student_id, pri)
select s.id as student_id, s.first_name, s.last_name, a.status::text as status, one.visiting,
       f.going_well, f.work_on, f.shared_at is not null as shared, f.edited_at,
       f.going_well_chips, f.work_on_chips, f.note, f.work_on_note, f.work_on_resource_id
  from one
  join cs on true
  join student s on s.id = one.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
-- One order everywhere, the register's: by last name. It must not move
 -- between saves (round 2 panel), so nothing that changes is in it.
 order by s.last_name, s.first_name, s.id`;

/** "Same as last week" (UR-44): each child's phrases from this class's last session with feedback. */
export type PreviousChips = { student_id: string; going_well_chips: string[] | null; work_on_chips: string[] | null; starts_at: string };
export const PREVIOUS_SESSION_CHIPS = `
select f.student_id, f.going_well_chips, f.work_on_chips, p.starts_at
  from class_session me
  join lateral (select cs.id, cs.starts_at from class_session cs
                 where cs.class_id = me.class_id and cs.starts_at < me.starts_at and cs.deleted_at is null
                   and exists (select 1 from feedback_note f2 where f2.session_id = cs.id and f2.deleted_at is null)
                 order by cs.starts_at desc limit 1) p on true
  join feedback_note f on f.session_id = p.id and f.deleted_at is null
 where me.id = $1`;

/** The last thing written for a child, other than for this session (UR-25: at the door). */
export type LastNote = { id: string; going_well: string | null; work_on: string | null; at: string; class_name: string | null;
  shared: boolean; resource_title: string | null };
export const LAST_FEEDBACK = `
select f.id, f.going_well, f.work_on, coalesce(cs.starts_at, f.shared_at, f.created_at) as at, c.name as class_name,
       f.shared_at is not null as shared, r.title as resource_title
  from feedback_note f
  left join class_session cs on cs.id = f.session_id
  left join class c on c.id = f.class_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
 where f.student_id = $1 and f.deleted_at is null and (f.going_well is not null or f.work_on is not null)
   and f.session_id is distinct from $2::uuid
 order by coalesce(cs.starts_at, f.created_at) desc limit 1`;

/** UR-45: a teacher's own students who may need support. Staff only. */
export type SupportRow = { student_id: string; absence_streak: number; last_here: string | null; not_yet: number; support_note: string | null;
  /** This term, present or late (0063). */
  attendance_pct?: number | null };
export const SUPPORT_NEEDS = `select * from app.support_needs()`;
export const SET_SUPPORT_NOTE = `select app.set_support_note($1, $2) as ok`;
export const SAVE_CLASS_FEEDBACK = `select app.save_class_feedback($1, $2::jsonb, $3) as n`;
export const SHARE_SESSION_FEEDBACK = `select app.share_session_feedback($1) as n`;

export type Report = { id: string; student_id: string; student_name: string; class_name: string | null; term_name: string;
  summary: { attendance?: { present: number; of: number }; going_well?: string[]; work_on?: string[];
             skills?: { skill: string; level: Level; from: Level | null }[] };
  comment: string | null; status: 'draft' | 'shared'; shared_at: string | null };
export const DRAFT_REPORTS = `select app.draft_class_reports($1) as n`;
export const CLASS_REPORTS = `
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`;
export const MY_REPORTS = `
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`;
export const SET_REPORT_COMMENT = `update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id`;
export const SHARE_REPORTS = `select app.share_reports($1::uuid[]) as n`;

export type TimelineItem = { at: string; kind: 'skill' | 'feedback' | 'milestone' | 'goal' | 'report'; title: string;
  detail: string | null; level: Level | null; previous: Level | null };
export const TIMELINE = `select * from app.student_timeline($1) limit 200`;

export type Goal = { id: string; student_id: string; text: string; status: 'proposed' | 'agreed' | 'achieved' | 'dropped';
  review_note: string | null; created_at: string };
export const GOALS = `select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`;
export const PROPOSE_GOAL = `insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id`;
export const SET_GOAL = `update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id`;

export type Reflection = { id: string; mood: number; text: string | null; created_at: string; class_name: string | null };
export const REFLECTIONS = `
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`;
export const ADD_REFLECTION = `select app.add_reflection($1, $2, $3) as id`;
export const MY_RECENT_CLASSES = `
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;

export type Milestone = { id: string; kind: string; title: string; reached_on: string };
export const MILESTONES = `select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc`;

export const MOODS = ['😣', '😕', '😐', '🙂', '🤩'];

/** F9: a class's children × skills (0063). Read only; drafts flagged. */
export type ProgressCell = { student_id: string; student_name: string; framework_id: string; framework: string;
  skill_id: string; skill: string; ord: number; level: Level | null; assessed_on: string | null; published: boolean;
  previous: Level | null; depth: Depth };
export const CLASS_PROGRESS = `select * from app.class_progress($1)`;
/** The classes a teacher may see a matrix for, with their style. */
export const MY_PROGRESS_CLASSES = `
select c.id, c.name, ds.name as style, app.class_depth(c.id) as depth,
       exists (select 1 from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
                where f.deleted_at is null and f.dance_style_id = c.dance_style_id)
       and exists (select 1 from enrolment e where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as has_skills
  from class c left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by ds.name nulls last, c.name`;
