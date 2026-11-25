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
export const RECORD_SKILL = `select app.record_skill($1, $2, $3::assessment_level, $4) as id`;

export type Chip = { id: string; kind: 'going_well' | 'work_on'; label: string; position: number };
export const CHIPS = `select id, kind, label, position from feedback_chip order by kind, position, label`;
export const ADD_CHIP = `
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`;
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

/** Who was in a session, for the class feedback grid. */
export type FeedbackKid = { student_id: string; first_name: string; last_name: string; status: string | null;
  going_well: string | null; work_on: string | null; shared: boolean | null };
export const SESSION_FEEDBACK = `
select s.id as student_id, s.first_name, s.last_name, a.status::text as status,
       f.going_well, f.work_on, f.shared_at is not null as shared
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
       and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  join student s on s.id = e.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
 where cs.id = $1
 order by (a.status in ('present', 'late')) desc nulls last, s.first_name`;
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
