import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, uid, NS } from './helpers';
import * as P from '../src/lib/repos/progress';
import * as H from '../src/lib/repos/hub';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const AMIR = '00000002-0000-4000-8000-000000000040';
const SENIOR_TAP = uid(NS.class, 6);
const MODERN_JUNIORS = uid(NS.class, 7);
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const lastSession = async (svc: any, cls: string) => (await svc(
  `select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 1`, [cls]))[0].id as string;
const skillFor = async (svc: any, style: string, pos = 1) => (await svc(
  `select fs.id from framework_skill fs join skill_framework f on f.id = fs.framework_id join dance_style d on d.id = f.dance_style_id
    where d.name = $1 and fs.position = $2`, [style, pos]))[0].id as string;
const guardianOf = async (svc: any, student: string) => (await svc(
  `select g.user_id from student s join guardian g on g.family_id = s.family_id and g.user_id is not null where s.id = $1 limit 1`, [student]))[0]?.user_id as string;

describe('UR-25 feedback edits keep what was saved', () => {
  it('reopening shows the saved chips and note, and adding a chip keeps them (teachers-10)', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await lastSession(svc, SENIOR_TAP);
      const [{ student_id: kid }] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' order by student_id limit 1`, [SENIOR_TAP]);
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid, going_well: ['Great focus', 'Kind to others'],
        work_on: ['Pointed feet'], note: 'Loved the new routine' }]), false]);
      // The screen reads the parts back to pre-select them.
      const row = (await q(P.SESSION_FEEDBACK, [s])).find((r: any) => r.student_id === kid);
      expect(row).toMatchObject({ going_well_chips: ['Great focus', 'Kind to others'], work_on_chips: ['Pointed feet'], note: 'Loved the new routine' });
      // An older client that sends only the new tap still cannot wipe anything.
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid, going_well: [], work_on: ['Confidence'] }]), false]);
      const [f] = await svc(`select going_well, work_on, going_well_chips, work_on_chips, note from feedback_note where session_id = $1 and student_id = $2`, [s, kid]);
      expect(f.going_well).toBe('Great focus, Kind to others. Loved the new routine');
      expect(f.work_on).toBe('Pointed feet, Confidence');
      // The edited screen sends the whole state with replace: a chip deliberately removed goes.
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid, going_well: ['Great focus'], work_on: ['Pointed feet', 'Confidence'],
        note: 'Loved the new routine', replace: true }]), false]);
      expect((await svc(`select going_well from feedback_note where session_id = $1 and student_id = $2`, [s, kid]))[0].going_well)
        .toBe('Great focus. Loved the new routine');
    });
  });

  it('an edit to shared feedback is marked edited for the family; an unchanged save is not', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await lastSession(svc, SENIOR_TAP);
      const [{ student_id: kid }] = await svc(`select e.student_id from enrolment e join student st on st.id = e.student_id
          join guardian g on g.family_id = st.family_id and g.user_id is not null
         where e.class_id = $1 and e.status = 'active' order by e.student_id limit 1`, [SENIOR_TAP]);
      const item = { student_id: kid, going_well: ['Brilliant timing'], work_on: [], note: '' };
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([item]), false]);
      await q(P.SHARE_SESSION_FEEDBACK, [s]);
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([item]), false]);
      expect((await svc(`select edited_at from feedback_note where session_id = $1 and student_id = $2`, [s, kid]))[0].edited_at).toBeNull();
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ ...item, work_on: ['Confidence'] }]), false]);
      const [f] = await svc(`select id, edited_at, shared_at from feedback_note where session_id = $1 and student_id = $2`, [s, kid]);
      expect(f.edited_at).not.toBeNull();
      expect(f.shared_at).not.toBeNull();
      await as(svc, await guardianOf(svc, kid));
      const fam = (await q(H.STUDENT_FEEDBACK)).find((n: any) => n.id === f.id);
      expect(fam.edited_at).not.toBeNull();
      expect(fam.work_on).toBe('Confidence');
    });
  });

  it('notes written before the parts were kept are split into chips and words', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      const [{ studio_id, student_id }] = await svc(`select studio_id, student_id from enrolment limit 1`);
      const [f] = await svc(`insert into feedback_note (studio_id, student_id, going_well, work_on)
        values ($1, $2, 'Great focus, Lovely posture. Really strong week', 'Spot the turns') returning going_well_chips, note, work_on_chips, work_on_note`, [studio_id, student_id]);
      expect(f).toEqual({ going_well_chips: ['Great focus', 'Lovely posture'], note: 'Really strong week', work_on_chips: [], work_on_note: 'Spot the turns' });
    });
  });

  it('the last note for a child is there at the door (register and student panel)', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [prev, now] = (await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 2`, [SENIOR_TAP])).map((r: any) => r.id);
      const [{ student_id: kid }] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' order by student_id desc limit 1`, [SENIOR_TAP]);
      await q(P.SAVE_CLASS_FEEDBACK, [now, JSON.stringify([{ student_id: kid, going_well: ['Great focus'], work_on: ['Spotting in turns'] }]), false]);
      const [last] = await q(P.LAST_FEEDBACK, [kid, prev]);
      expect(last.work_on).toBe('Spotting in turns');
      expect(await q(P.LAST_FEEDBACK, [kid, now]).then(r => r.every((x: any) => x.work_on !== 'Spotting in turns' || x.id !== last.id))).toBe(true);
    });
  });
});

describe('UR-54 small fixes', () => {
  it('trial and drop-in children on the register can receive class feedback (teachers D12)', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [t] = await svc(`select t.session_id, t.student_id from trial t where t.class_id = $1 and t.status = 'booked' and t.session_id is not null`, [CLASS.juniorTap]);
      const [other] = await svc(`select s.id, s.studio_id from student s where s.id not in (select student_id from enrolment where class_id = $1) and s.id <> $2 limit 1`, [CLASS.juniorTap, t.student_id]);
      await svc(`insert into drop_in_booking (studio_id, session_id, student_id)
                 select s.studio_id, $1, s.id from student s where s.id = $2`, [t.session_id, other.id]);
      const rows = await q(P.SESSION_FEEDBACK, [t.session_id]);
      expect(rows.find((r: any) => r.student_id === t.student_id)?.visiting).toBe('trial');
      expect(rows.find((r: any) => r.student_id === other.id)?.visiting).toBe('drop_in');
      expect(new Set(rows.map((r: any) => r.student_id)).size).toBe(rows.length);
      const n = (await q(P.SAVE_CLASS_FEEDBACK, [t.session_id, JSON.stringify([
        { student_id: t.student_id, going_well: ['Great focus'] }, { student_id: other.id, going_well: ['Kind to others'] }]), false]))[0].n;
      expect(n).toBe(2);
    });
  });

  it('the feedback notice opens the child it was about (parents D14)', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await lastSession(svc, SENIOR_TAP);
      const [{ student_id: kid }] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' order by student_id limit 1`, [SENIOR_TAP]);
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid, going_well: ['Great focus'] }]), true]);
      const links = await svc(`select href from notification where kind = 'feedback_published' and href like '/family/feedback%' order by created_at desc limit 1`);
      expect(links[0].href).toBe(`/family/feedback?child=${kid}`);
    });
  });
});

describe('UR-44 chip sets', () => {
  it('a young class gets simple words with stickers; older classes the school set', async () => {
    await asUser(USERS.owner, async q => {
      const young = await q(P.CLASS_CHIPS, [CLASS.preSchoolBallet]);
      expect(young.length).toBeGreaterThanOrEqual(12);
      expect(young.every((c: any) => c.sticker && !c.own)).toBe(true);
      expect(young.map((c: any) => c.label)).toContain('Listened beautifully');
      const older = await q(P.CLASS_CHIPS, [SENIOR_TAP]);
      expect(older.map((c: any) => c.label)).toContain('Spotting in turns');
      expect(older.map((c: any) => c.label)).not.toContain('Listened beautifully');
    });
  });

  it('a teacher keeps their own set for their class; another teacher cannot touch it', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      await q(P.ADD_CLASS_CHIP, [SENIOR_TAP, 'going_well', 'Crisp heel drops', null]);
      await q(P.REMOVE_CLASS_CHIP, [SENIOR_TAP, 'work_on', 'Spotting in turns']);
      const mine = await q(P.CLASS_CHIPS, [SENIOR_TAP]);
      expect(mine.every((c: any) => c.own)).toBe(true);
      expect(mine.map((c: any) => c.label)).toContain('Crisp heel drops');
      expect(mine.map((c: any) => c.label)).not.toContain('Spotting in turns');
      // The school's set is untouched, and other classes still use it.
      expect((await q(P.CLASS_CHIPS, [CLASS.streetSeniors])).map((c: any) => c.label)).toContain('Spotting in turns');
      await as(svc, USERS.teacherStreet);
      expect(await expectRejected(() => q(P.ADD_CLASS_CHIP, [SENIOR_TAP, 'going_well', 'Nope', null]))).toMatch(/FORBIDDEN/);
      await expectRejected(() => q(`insert into feedback_chip (studio_id, class_id, kind, label) select studio_id, id, 'going_well', 'Nope' from class where id = $1`, [SENIOR_TAP]));
      await as(svc, USERS.teacherTap);
      await q(P.RESET_CLASS_CHIPS, [SENIOR_TAP]);
      expect((await q(P.CLASS_CHIPS, [SENIOR_TAP])).some((c: any) => c.own)).toBe(false);
    });
  });

  it('"same as last week" finds each child\'s phrases from the previous session', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [now, prev] = (await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 2`, [SENIOR_TAP])).map((r: any) => r.id);
      const kids = (await svc(`select student_id from enrolment where class_id = $1 and status = 'active'`, [SENIOR_TAP])).map((r: any) => r.student_id);
      await q(P.SAVE_CLASS_FEEDBACK, [prev, JSON.stringify(kids.map((k: string) => ({ student_id: k, going_well: ['Great focus'], work_on: ['Confidence'] }))), false]);
      const last = await q(P.PREVIOUS_SESSION_CHIPS, [now]);
      expect(last).toHaveLength(kids.length);
      expect(last[0]).toMatchObject({ going_well_chips: ['Great focus'], work_on_chips: ['Confidence'] });
    });
  });
});

describe('UR-48 skill levels publish with the share step by default', () => {
  it('a level is a draft for the family until shared; the immediate setting publishes at once', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select id from student where user_id = $1`, [AMIR]);
      const skill = await skillFor(svc, 'Tap', 7);
      await q(P.RECORD_SKILL, [kid.id, skill, 'developing', null]);
      expect((await q(P.UNSHARED_SKILLS, [kid.id]))[0].n).toBe(1);
      await as(svc, AMIR);
      expect((await q(P.STUDENT_SKILLS, [kid.id])).find((r: any) => r.skill_id === skill).level).toBeNull();
      expect((await q(`select 1 from skill_assessment where skill_id = $1 and student_id = $2`, [skill, kid.id]))).toHaveLength(0);
      await as(svc, USERS.teacherTap);
      await q(P.SHARE_SKILLS, [kid.id]);
      await as(svc, AMIR);
      expect((await q(P.STUDENT_SKILLS, [kid.id])).find((r: any) => r.skill_id === skill).level).toBe('developing');

      await as(svc, USERS.owner);
      const [{ studio_id }] = await svc(`select studio_id from student where id = $1`, [kid.id]);
      await q(P.SET_SKILL_PUBLISH, [studio_id, 'immediate']);
      await as(svc, USERS.teacherTap);
      const other = await skillFor(svc, 'Tap', 6);
      await q(P.RECORD_SKILL, [kid.id, other, 'secure', null]);
      await as(svc, AMIR);
      expect((await q(P.STUDENT_SKILLS, [kid.id])).find((r: any) => r.skill_id === other).level).toBe('secure');
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(P.SET_SKILL_PUBLISH, [studio_id, 'with_share']))).toMatch(/FORBIDDEN/);
    });
  });

  it('a teacher sees and records only the styles they teach the child (teachers D11)', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      const [lily] = await svc(`select s.id from student s where s.first_name = 'Lily' and s.last_name = 'Sullivan'`);
      const fws = new Set((await q(P.STUDENT_SKILLS, [lily.id])).map((r: any) => r.framework));
      expect([...fws]).toEqual(['Modern skills']);
      const ballet = await skillFor(svc, 'Ballet');
      expect(await expectRejected(() => q(P.RECORD_SKILL, [lily.id, ballet, 'secure', null]))).toMatch(/styles you teach/);
      await as(svc, USERS.owner);
      expect(new Set((await q(P.STUDENT_SKILLS, [lily.id])).map((r: any) => r.framework)).size).toBeGreaterThan(1);
    });
  });
});

describe('UR-55 tracking depth', () => {
  it('defaults by age band; a notes-only class records no levels; the teacher can change it', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      expect((await q(P.CLASS_DEPTH, [CLASS.preSchoolBallet]))[0]).toMatchObject({ depth: 'notes', tracking_depth: null });
      expect((await q(P.CLASS_DEPTH, [CLASS.grade3Ballet]))[0].depth).toBe('notes_skills');
      expect((await q(P.CLASS_DEPTH, [SENIOR_TAP]))[0].depth).toBe('full');
      const [kid] = await svc(`select e.student_id id from enrolment e where e.class_id = $1 and e.status = 'active'
          and not exists (select 1 from enrolment e2 join class c on c.id = e2.class_id where e2.student_id = e.student_id
                           and e2.status = 'active' and c.dance_style_id = (select dance_style_id from class where id = $1) and e2.class_id <> $1) limit 1`, [CLASS.preSchoolBallet]);
      const ballet = await skillFor(svc, 'Ballet');
      expect(await expectRejected(() => q(P.RECORD_SKILL, [kid.id, ballet, 'secure', null]))).toMatch(/notes only/);
      expect(await q(P.STUDENT_SKILLS, [kid.id])).toHaveLength(0);
      await as(svc, USERS.teacherBallet);
      expect((await q(P.SET_CLASS_DEPTH, [CLASS.preSchoolBallet, 'notes_skills']))[0].depth).toBe('notes_skills');
      await q(P.RECORD_SKILL, [kid.id, ballet, 'secure', null]);
      await as(svc, USERS.teacherStreet);
      expect(await expectRejected(() => q(P.SET_CLASS_DEPTH, [CLASS.preSchoolBallet, 'full']))).toMatch(/FORBIDDEN/);
    });
  });

  it('a family can opt a child out of skill tracking; notes carry on', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select id from student where user_id = $1`, [AMIR]);
      const guardian = await guardianOf(svc, kid.id);
      expect(await expectRejected(() => q(P.SET_SKILL_TRACKING, [kid.id, false]))).toMatch(/FORBIDDEN/);
      await as(svc, guardian);
      await q(P.SET_SKILL_TRACKING, [kid.id, false]);
      expect(await q(P.STUDENT_SKILLS, [kid.id])).toHaveLength(0);
      expect((await q(`select * from app.student_timeline($1)`, [kid.id])).some((t: any) => t.kind === 'skill')).toBe(false);
      await as(svc, USERS.teacherTap);
      expect(await q(P.STUDENT_SKILLS, [kid.id])).toHaveLength(0);
      const tapSkill = await skillFor(svc, 'Tap');
      expect(await expectRejected(() => q(P.RECORD_SKILL, [kid.id, tapSkill, 'mastered', null]))).toMatch(/chosen not/);
      const s = await lastSession(svc, SENIOR_TAP);
      expect((await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid.id, going_well: ['Great focus'],
        skills: [{ skill_id: await skillFor(svc, 'Tap'), level: 'mastered' }] }]), false]))[0].n).toBe(1);
      await as(svc, guardian);
      await q(P.SET_SKILL_TRACKING, [kid.id, true]);
      expect((await q(P.STUDENT_SKILLS, [kid.id])).length).toBeGreaterThan(0);
    });
  });
});

describe('UR-43 progress history', () => {
  it('after three assessments of one skill over time, the student sees all three with dates', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select id, studio_id from student where user_id = $1`, [AMIR]);
      const skill = await skillFor(svc, 'Tap', 6);
      for (const [lvl, days] of [['developing', 90], ['secure', 40]] as const) {
        await svc(`insert into skill_assessment (studio_id, student_id, dance_style_id, skill, skill_id, level, assessed_on)
                   select $1, $2, f.dance_style_id, fs.name, fs.id, $4::assessment_level, current_date - $5::int
                     from framework_skill fs join skill_framework f on f.id = fs.framework_id where fs.id = $3`, [kid.studio_id, kid.id, skill, lvl, days]);
      }
      await q(P.RECORD_SKILL, [kid.id, skill, 'mastered', null]);
      await q(P.SHARE_SKILLS, [kid.id]);
      await as(svc, AMIR);
      const h = (await q(P.SKILL_HISTORY, [kid.id])).filter((r: any) => r.skill_id === skill);
      expect(h.map((r: any) => r.level)).toEqual(['developing', 'secure', 'mastered']);
      expect(h.every((r: any) => r.assessed_on && r.depth === 'full' && r.current_style)).toBe(true);
      // D6: assessments in a style Amir no longer takes are still there, marked as such.
      expect((await q(P.SKILL_HISTORY, [kid.id])).some((r: any) => r.style === 'Ballet' && !r.current_style)).toBe(true);
    });
  });

  it('"to work on" can link to class material, which the family sees with the note', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await lastSession(svc, SENIOR_TAP);
      const [{ student_id: kid }] = await svc(`select e.student_id from enrolment e join student st on st.id = e.student_id
          join guardian g on g.family_id = st.family_id and g.user_id is not null
         where e.class_id = $1 and e.status = 'active' order by e.student_id limit 1`, [SENIOR_TAP]);
      const [res] = await svc(`insert into resource (studio_id, kind, title, url) select studio_id, 'video', 'Paradiddle drill', 'https://example.org/v'
                                 from class where id = $1 returning id`, [SENIOR_TAP]);
      await q(P.SAVE_CLASS_FEEDBACK, [s, JSON.stringify([{ student_id: kid, work_on: ['Practise at home'], work_on_resource_id: res.id }]), true]);
      await as(svc, await guardianOf(svc, kid));
      const n = (await q(H.STUDENT_FEEDBACK)).find((x: any) => x.student_id === kid && x.resource_title);
      expect(n).toMatchObject({ resource_title: 'Paradiddle drill', resource_url: 'https://example.org/v', style: 'Tap' });
    });
  });
});

describe('UR-45 support needs', () => {
  it('a teacher sees their own students only, with absence streaks and office notes; families never see the notes', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ student_id: kid }] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' order by student_id limit 1`, [MODERN_JUNIORS]);
      await q(P.SET_SUPPORT_NOTE, [kid, 'Finds loud music hard; a quiet corner helps']);
      // Three absences in a row, most recently.
      const sessions = (await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 3`, [MODERN_JUNIORS])).map((r: any) => r.id);
      for (const sid of sessions) {
        await svc(`insert into attendance_record (studio_id, session_id, student_id, status) select studio_id, $1, $2, 'absent' from student where id = $2
                   on conflict (session_id, student_id) do update set status = 'absent'`, [sid, kid]);
      }
      await as(svc, USERS.teacherModern);
      const rows = await q(P.SUPPORT_NEEDS);
      const me = rows.find((r: any) => r.student_id === kid);
      expect(me).toMatchObject({ support_note: 'Finds loud music hard; a quiet corner helps' });
      expect(me.absence_streak).toBeGreaterThanOrEqual(3);
      const theirs = new Set((await svc(`select * from app.teacher_student_ids()`)).map((r: any) => r.teacher_student_ids));
      expect(rows.every((r: any) => theirs.has(r.student_id))).toBe(true);
      expect(await expectRejected(() => q(P.SET_SUPPORT_NOTE, [kid, 'x']))).toMatch(/FORBIDDEN/);
      await as(svc, await guardianOf(svc, kid));
      expect(await q(`select * from student_support_note`)).toHaveLength(0);
      expect((await q(P.SUPPORT_NEEDS)).length).toBe(0);
    });
  });
});
