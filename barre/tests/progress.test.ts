import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const AMIR = '00000002-0000-4000-8000-000000000040';   // student login, 15, in Senior Tap and Street Seniors
const amir = async (svc: any) => (await svc(`select id, family_id from student where user_id = $1`, [AMIR]))[0];
const skillFor = async (svc: any, style: string) => (await svc(
  `select fs.id from framework_skill fs join skill_framework f on f.id = fs.framework_id join dance_style d on d.id = f.dance_style_id
    where d.name = $1 order by fs.position limit 1`, [style]))[0].id;
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);

describe('skill frameworks (R-020)', () => {
  it('every style starts with a framework the office can edit', async () => {
    await asUser(USERS.owner, async q => {
      const fw = await q(`select f.name, count(fs.*)::int n from skill_framework f join framework_skill fs on fs.framework_id = f.id group by 1`);
      expect(fw.length).toBe(6);
      expect(fw.every((f: any) => f.n >= 4)).toBe(true);
      expect(await q(`update framework_skill set name = 'Spotting' where name = 'Pirouettes' returning id`)).toHaveLength(1);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await q(`update framework_skill set name = 'x' returning id`)).toHaveLength(0);
    });
  });

  it('a teacher records a level for their own student; the student sees the change', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const kid = await amir(svc);
      const tap = await skillFor(svc, 'Tap');
      await svc(`insert into skill_assessment (studio_id, student_id, skill, skill_id, level, assessed_on)
                 select studio_id, id, 'Shuffles', $2, 'developing', current_date - 1 from student where id = $1`, [kid.id, tap]);
      await q(`select app.record_skill($1, $2, 'secure')`, [kid.id, tap]);
      expect((await q(`select app.record_skill($1, $2, 'secure') id`, [kid.id, tap]))[0].id).toBeNull();   // no-op repeat
      const [row] = (await q(`select * from app.student_skills($1)`, [kid.id])).filter((r: any) => r.skill_id === tap);
      expect(row).toMatchObject({ level: 'secure', previous: 'developing' });
      await as(svc, AMIR);
      const tl = await q(`select * from app.student_timeline($1)`, [kid.id]);
      expect(tl.some((t: any) => t.kind === 'skill' && t.level === 'secure' && t.previous === 'developing')).toBe(true);
    });
  });

  it('a teacher cannot record for a child they do not teach', async () => {
    await asUser(USERS.teacherStreet, async (q, svc) => {
      const [other] = await svc(`select s.id from student s where s.id not in (
        select e.student_id from enrolment e join class c on c.id = e.class_id join staff_member sm on sm.id = c.teacher_id where sm.user_id = $1) limit 1`, [USERS.teacherStreet]);
      const sk = await skillFor(svc, 'Street');
      expect(await expectRejected(() => q(`select app.record_skill($1, $2, 'secure')`, [other.id, sk]))).toMatch(/FORBIDDEN/);
      const [st] = await svc(`select studio_id from student where id = $1`, [other.id]);
      await expectRejected(() => q(`insert into skill_assessment (studio_id, student_id, skill, level) values ($1, $2, 'x', 'secure')`, [st.studio_id, other.id]));
    });
  });
});

describe('class feedback in one go (R-021)', () => {
  it('drafts a note per child from chips, records skills, and shares only when asked', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 1`, [CLASS.juniorTap]);
      const kids = (await svc(`select student_id from enrolment where class_id = $1 and status = 'active' limit 3`, [CLASS.juniorTap])).map((r: any) => r.student_id);
      const tap = await skillFor(svc, 'Tap');
      const items = kids.map((k: string, i: number) => ({ student_id: k, going_well: ['Great focus'], work_on: i ? ['Pointed feet'] : [],
        note: i === 0 ? 'Loved the new routine' : null, skills: i === 0 ? [{ skill_id: tap, level: 'mastered' }] : [] }));
      expect((await q(`select app.save_class_feedback($1, $2::jsonb, false) n`, [s.id, JSON.stringify(items)]))[0].n).toBe(3);
      const notes = await svc(`select student_id, going_well, work_on, shared_at from feedback_note where session_id = $1`, [s.id]);
      expect(notes).toHaveLength(3);
      expect(notes.every((n: any) => n.shared_at === null)).toBe(true);
      expect(notes.find((n: any) => n.student_id === kids[0]).going_well).toBe('Great focus. Loved the new routine');
      // Save again: still three notes.
      await q(`select app.save_class_feedback($1, $2::jsonb, false)`, [s.id, JSON.stringify(items)]);
      expect(await svc(`select 1 from feedback_note where session_id = $1`, [s.id])).toHaveLength(3);
      const before = (await svc(`select count(*)::int n from notification where kind = 'feedback_published'`))[0].n;
      expect((await q(`select app.share_session_feedback($1) n`, [s.id]))[0].n).toBe(3);
      expect((await svc(`select count(*)::int n from notification where kind = 'feedback_published'`))[0].n).toBeGreaterThan(before);
    });
  });
  it('a teacher of another class cannot write feedback for this one', async () => {
    await asUser(USERS.teacherStreet, async (q, svc) => {
      const [s] = await svc(`select id from class_session where class_id = $1 limit 1`, [CLASS.preSchoolBallet]);
      expect(await expectRejected(() => q(`select app.save_class_feedback($1, '[]'::jsonb)`, [s.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('term reports (R-022)', () => {
  it('drafts one per child, and families see it only once shared', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const n = (await q(`select app.draft_class_reports($1) n`, [CLASS.juniorTap]))[0].n;
      expect(n).toBeGreaterThan(5);
      const reports = await q(`select id, student_id, summary from progress_report where class_id = $1`, [CLASS.juniorTap]);
      expect(reports[0].summary).toHaveProperty('attendance');
      const [r] = reports;
      await q(`update progress_report set comment = 'A lovely term' where id = $1`, [r.id]);
      const [fam] = await svc(`select g.user_id from student s join guardian g on g.family_id = s.family_id and g.user_id is not null where s.id = $1 limit 1`, [r.student_id]);
      if (fam) {
        await as(svc, fam.user_id);
        expect(await q(`select 1 from progress_report where id = $1`, [r.id])).toHaveLength(0);
        await as(svc, USERS.teacherTap);
        await q(`select app.share_reports(array[$1]::uuid[])`, [r.id]);
        await as(svc, fam.user_id);
        expect(await q(`select comment from progress_report where id = $1`, [r.id])).toEqual([{ comment: 'A lovely term' }]);
      }
    });
  });
});

describe('goals (R-024)', () => {
  it('a student proposes, the teacher agrees, the family sees it; two at a time at most', async () => {
    await asUser(AMIR, async (q, svc) => {
      const kid = await amir(svc);
      const [{ id }] = await q(`insert into student_goal (student_id, text, status, proposed_by) values ($1, 'Land a clean double pirouette', 'proposed', auth.uid()) returning id`, [kid.id]);
      await q(`insert into student_goal (student_id, text, status, proposed_by) values ($1, 'Learn the paradiddle', 'proposed', auth.uid())`, [kid.id]);
      expect(await expectRejected(() => q(`insert into student_goal (student_id, text, status, proposed_by) values ($1, 'A third', 'proposed', auth.uid())`, [kid.id]))).toMatch(/plenty/);
      await as(svc, USERS.guardianA);
      expect(await q(`select 1 from student_goal where id = $1`, [id])).toHaveLength(0);   // not agreed yet
      await as(svc, USERS.teacherTap);
      await q(`update student_goal set status = 'agreed' where id = $1`, [id]);
      await as(svc, USERS.guardianA);
      expect(await q(`select status from student_goal where id = $1`, [id])).toEqual([{ status: 'agreed' }]);
    });
  });
});

describe('reflections (R-025)', () => {
  it('a 13+ student reflects; their teacher sees it, their parent does not', async () => {
    await asUser(AMIR, async (q, svc) => {
      const kid = await amir(svc);
      const [sess] = await svc(`select a.session_id from attendance_record a where a.student_id = $1 and a.status = 'present' limit 1`, [kid.id]);
      const [{ id }] = await q(`select app.add_reflection($1, 4, 'Finally got the timestep') id`, [sess.session_id]);
      await as(svc, USERS.guardianA);
      expect(await q(`select 1 from student_reflection where id = $1`, [id])).toHaveLength(0);
      const [t] = await svc(`select sm.user_id from class_session cs join class c on c.id = cs.class_id join staff_member sm on sm.id = c.teacher_id where cs.id = $1`, [sess.session_id]);
      await as(svc, t.user_id);
      expect(await q(`select mood from student_reflection where id = $1`, [id])).toEqual([{ mood: 4 }]);
    });
  });
});

describe('milestones (R-026)', () => {
  it('counts classes attended, never absences, and has no leaderboard', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await amir(svc);
      const have = await q(`select kind from milestone where student_id = $1`, [kid.id]);
      expect(have.map((m: any) => m.kind)).toContain('first_class');
      const [{ n }] = await svc(`select count(*)::int n from attendance_record where student_id = $1 and status in ('present','late')`, [kid.id]);
      for (const k of [10, 25, 50]) expect(have.some((m: any) => m.kind === `classes_${k}`)).toBe(n >= k);
    });
  });
  it('a class reaching a round number congratulates the family once', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select s.id, s.family_id, count(a.*)::int n from student s join attendance_record a on a.student_id = s.id and a.status in ('present','late')
                                 join guardian g on g.family_id = s.family_id and g.user_id is not null
                                group by s.id having count(a.*) = 9 limit 1`);
      if (!kid) return;
      const [sess] = await svc(`select cs.id from class_session cs join enrolment e on e.class_id = cs.class_id and e.student_id = $1
                                 where not exists (select 1 from attendance_record a where a.session_id = cs.id and a.student_id = $1) limit 1`, [kid.id]);
      await q(`insert into attendance_record (studio_id, session_id, student_id, status) select studio_id, $1, $2, 'present' from student where id = $2`, [sess.id, kid.id]);
      expect(await svc(`select 1 from milestone where student_id = $1 and kind = 'classes_10'`, [kid.id])).toHaveLength(1);
      expect((await svc(`select count(*)::int n from notification where kind = 'milestone' and title like '%10 classes'`))[0].n).toBeGreaterThan(0);
    });
  });
});

describe('the office edits frameworks and phrases', () => {
  it('adds, renames and removes a skill and a phrase', async () => {
    const P = await import('../src/lib/repos/progress');
    await asUser(USERS.owner, async q => {
      const [fw] = await q(P.FRAMEWORKS);
      const [{ id }] = await q(P.ADD_SKILL, [fw.id, 'Spotting']);
      await q(P.RENAME_SKILL, [id, 'Spotting in turns']);
      await q(P.REMOVE_SKILL, [id]);
      expect((await q(P.FRAMEWORKS)).find((f: any) => f.id === fw.id).skills.some((s: any) => s.id === id)).toBe(false);
      const [{ id: chip }] = await q(P.ADD_CHIP, ['going_well', 'Super smile']);
      await q(P.REMOVE_CHIP, [chip]);
      expect((await q(P.CHIPS)).some((c: any) => c.id === chip)).toBe(false);
    });
  });
});
