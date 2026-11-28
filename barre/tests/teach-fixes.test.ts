/**
 * Round 4, teaching stream (round-2 panel: U6, U10, U11, U14, F9, F14;
 * migration 0063). Rules are checked in the database; the pure helpers the
 * screens use are checked here too.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, STUDIO_ID, type Q } from './helpers';
import { OTHER_STUDIOS } from '../src/lib/db/seed/data';
import * as T from '../src/lib/repos/teaching';
import * as P from '../src/lib/repos/progress';
import * as H from '../src/lib/repos/hub';
import { alsoTeaching, clashPairs, diaryClashes, diaryClashLine } from '../src/lib/clash';
import { readiness } from '../src/lib/offline/ready';
import { supportReasons } from '../src/lib/support';

import { matrixOf } from '../src/lib/progress-matrix';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const KESTREL = OTHER_STUDIOS.kestrel;
const KESTREL_CLASS = uid(NS.class, 190);
const SENIOR_TAP = uid(NS.class, 6);
const CLASHES = `select * from app.my_clashes(now(), now() + interval '14 days')`;

const choose = (q: Q, user: string, studio: string | null) =>
  q(`select set_config('request.jwt.claims', $1, true)`,
    [JSON.stringify({ sub: user, role: 'authenticated', ...(studio ? { studio } : {}) })]);

/** Two of Priya's own Northstar sessions, the second moved to overlap the first. */
async function priyaOverlap(svc: Q, offsetMin: number) {
  const rows = await svc(`select cs.id, cs.starts_at, cs.ends_at, c.name from class_session cs join class c on c.id = cs.class_id
                            join staff_member sm on sm.id = c.teacher_id
                           where sm.user_id = $1 and c.studio_id = $2 and cs.starts_at > now() + interval '1 day'
                             and cs.status = 'scheduled' and cs.teacher_id is null
                           order by cs.starts_at limit 2`, [USERS.teacherModern, STUDIO_ID]);
  const [a, b] = rows;
  await svc(`update class_session set starts_at = $2::timestamptz + make_interval(mins => $3::int),
                    ends_at = $2::timestamptz + make_interval(mins => $3::int + 45) where id = $1`, [b.id, a.starts_at, offsetMin]);
  return { a, b };
}

/* ── U6 · clashes on the teacher's list ─────────────────────────────────── */
describe('U6 my_clashes names the other booking', () => {
  it('two of my own classes that overlap name each other, same school', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const before = await q(CLASHES);
      const { a, b } = await priyaOverlap(svc, 15);
      const rows = (await q(CLASHES)).filter(r => !before.some(x => x.session_id === r.session_id && x.other_session_id === r.other_session_id));
      const ab = rows.find(r => r.session_id === a.id && r.other_session_id === b.id);
      const ba = rows.find(r => r.session_id === b.id && r.other_session_id === a.id);
      expect(ab).toMatchObject({ other_name: b.name, same_school: true });
      expect(ba).toMatchObject({ other_name: a.name, same_school: true });
      expect(clashPairs([ab!, ba!])).toBe(1);
    });
  });

  it('a class at another school clashes too, named when that school shares details', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const [k] = await svc(`select id, starts_at from class_session where class_id = $1 and starts_at > now() and status = 'scheduled'
                               order by starts_at limit 1`, [KESTREL_CLASS]);
      const [n] = await svc(`select cs.id from class_session cs join class c on c.id = cs.class_id join staff_member sm on sm.id = c.teacher_id
                              where sm.user_id = $1 and c.studio_id = $2 and cs.starts_at > now() + interval '1 day'
                                and cs.status = 'scheduled' and cs.teacher_id is null order by cs.starts_at limit 1`,
                            [USERS.teacherModern, STUDIO_ID]);
      await svc(`update class_session set starts_at = $2::timestamptz + interval '10 minutes', ends_at = $2::timestamptz + interval '55 minutes' where id = $1`,
                [n.id, k.starts_at]);
      const mine = (await q(CLASHES)).filter(r => r.session_id === n.id);
      expect(mine.find(r => r.other_session_id === k.id)).toMatchObject({ other_name: 'Kestrel Contemporary', same_school: false,
        other_school: 'Kestrel Ballet School' });
      // Looking from Kestrel, Northstar shares busy times only by default.
      await choose(q, USERS.teacherModern, KESTREL);
      const there = (await q(CLASHES)).find(r => r.session_id === k.id && r.other_session_id === n.id);
      expect(there).toMatchObject({ other_name: 'Busy', other_location: null });
    });
  });

  it('cancelled sessions never clash, and nobody sees another teacher’s clashes', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const { a, b } = await priyaOverlap(svc, 0);
      await svc(`update class_session set status = 'cancelled' where id = $1`, [b.id]);
      expect((await q(CLASHES)).some(r => r.session_id === a.id && r.other_session_id === b.id)).toBe(false);
    });
    await asUser(USERS.guardianA, async q => { expect(await q(CLASHES)).toEqual([]); });
    await asUser(USERS.teacherModern, async q => {
      expect(await expectRejected(() => q(`select * from app.my_clashes(now(), now() + interval '60 days')`))).toMatch(/35 days/);
    });
  });
});

describe('U6 diary clashes for students and families', () => {
  const row = (uid: string, title: string, start: string, end: string | null, loc: string | null, student = 's1', extra: object = {}) =>
    ({ uid, item_kind: 'class', title, starts_at: start, ends_at: end, location: loc, status: 'scheduled', student_id: student, child: 'Amir', ...extra });

  it('flags two bookings at once for one child, in words, with the minutes and the place', () => {
    const tap = row('a', 'Senior Tap', '2026-12-03T18:30:00Z', '2026-12-03T19:30:00Z', 'Blackheath');
    const contemp = row('b', 'Contemporary Seniors', '2026-12-03T19:00:00Z', '2026-12-03T20:15:00Z', 'Greenwich');
    const m = diaryClashes([tap, contemp]);
    expect(m.get('a|s1')).toHaveLength(1);
    expect(diaryClashLine(m.get('b|s1')![0]!)).toMatch(/^Overlaps Senior Tap .* by 30 min, at Blackheath$/);
  });

  it('back to back, different children, cancelled items and all-day exams are not clashes', () => {
    const a = row('a', 'Tap', '2026-12-03T18:00:00Z', '2026-12-03T19:00:00Z', 'X');
    const b = row('b', 'Ballet', '2026-12-03T19:00:00Z', '2026-12-03T20:00:00Z', 'X');
    const sib = row('c', 'Modern', '2026-12-03T18:15:00Z', '2026-12-03T19:00:00Z', 'X', 's2');
    const off = row('d', 'Jazz', '2026-12-03T18:15:00Z', '2026-12-03T19:00:00Z', 'X', 's1', { status: 'cancelled' });
    const exam = row('e', 'Grade 3', '2026-12-03T00:00:00Z', '2026-12-04T00:00:00Z', 'X', 's1', { item_kind: 'exam' });
    expect(diaryClashes([a, b, sib, off, exam]).size).toBe(0);
    // A private lesson at the same time as a class (the parents' case) is.
    const priv = row('p', 'Private lesson', '2026-12-03T18:00:00Z', null, 'Y', 's1', { item_kind: 'private_lesson' });
    expect(diaryClashes([a, priv]).get('p|s1')?.[0]).toMatchObject({ minutes: 60, elsewhere: true });
  });
});

/* ── U10 · the teacher's own grid ───────────────────────────────────────── */
describe('U10 week grid copy', () => {
  it('says "You’re also teaching" on a teacher’s own week, and names the office teacher otherwise', () => {
    const b = { name: 'Contemporary Seniors', starts_at: '2026-12-03T19:00:00Z', ends_at: '2026-12-03T20:15:00Z', location: 'Greenwich' };
    expect(alsoTeaching({ teacher: 'You', location: 'Blackheath' }, b)).toMatch(/^You’re also teaching Contemporary Seniors \(\d\d:\d\d–\d\d:\d\d, Greenwich\)$/);
    expect(alsoTeaching({ teacher: 'Marcus Bell', location: 'Blackheath' }, b)).toBe('Marcus also teaches Contemporary Seniors');
    expect(alsoTeaching({ teacher: 'You', location: 'Greenwich' }, b)).not.toMatch(/Greenwich\)/);
  });
});

/* ── U11 · support list ─────────────────────────────────────────────────── */
describe('U11 May need support includes low attendance, with reasons in words', () => {
  it('support_needs carries this term’s attendance; a child below 70% has it as a reason', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await q(`select e.student_id from enrolment e where e.class_id = $1 and e.status = 'active' and e.deleted_at is null limit 1`, [SENIOR_TAP]);
      await svc(`update attendance_record a set status = 'absent' from class_session cs
                  where cs.id = a.session_id and a.student_id = $1 and cs.starts_at <= now()
                    and cs.starts_at >= app.current_term_start(cs.studio_id)`, [kid.student_id]);
      const [r] = (await q(P.SUPPORT_NEEDS)).filter(x => x.student_id === kid.student_id);
      expect(r).toBeTruthy();
      expect(r.attendance_pct).toBe(0);
      expect(supportReasons(r, { has_medical_need: false })).toContain('Attendance 0% this term');
    });
  });

  it('reasons are words for each cause, medical and the office note included', () => {
    const r = { student_id: 'x', absence_streak: 2, last_here: null, not_yet: 1, support_note: 'Sits near the front', attendance_pct: 57 };
    expect(supportReasons(r, { has_medical_need: true })).toEqual(
      ['Attendance 57% this term', 'Absent the last 2 classes', '1 skill not started', 'Medical notes', 'Office note']);
    expect(supportReasons({ ...r, absence_streak: 0, not_yet: 0, support_note: null, attendance_pct: 90 }, {})).toEqual([]);
  });

  it('families never get the list', async () => {
    await asUser(USERS.guardianA, async q => { expect(await q(P.SUPPORT_NEEDS)).toEqual([]); });
  });
});

/* ── Feedback order and the register's "working on" ─────────────────────── */
describe('feedback order is stable, and last feedback reaches the register', () => {
  it('the class feedback list is in last-name order, the same as the register, whatever is marked', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 1`, [SENIOR_TAP]);
      const one = (await q(P.SESSION_FEEDBACK, [s.id])).map(k => k.student_id);
      // Marking someone absent, then present, does not move anyone.
      await svc(`update attendance_record set status = 'absent' where session_id = $1 and student_id = $2`, [s.id, one[0]]);
      const two = (await q(P.SESSION_FEEDBACK, [s.id])).map(k => k.student_id);
      expect(two).toEqual(one);
      const reg = (await q(T.REGISTER, [s.id])).map(r => r.student_id).filter(id => one.includes(id));
      expect(one.filter(id => reg.includes(id))).toEqual(reg);
    });
  });

  it('REGISTER_WORKING_ON gives each child their latest note from another session, in one query', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const sess = await svc(`select id, starts_at from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 2`, [SENIOR_TAP]);
      const [kid] = await q(`select student_id from enrolment where class_id = $1 and status = 'active' and deleted_at is null limit 1`, [SENIOR_TAP]);
      await svc(`delete from feedback_note where student_id = $1`, [kid.student_id]);
      await svc(`insert into feedback_note (studio_id, session_id, class_id, student_id, work_on, going_well)
                 values ($1, $2, $3, $4, 'Spotting in turns', 'Great focus')`, [STUDIO_ID, sess[1].id, SENIOR_TAP, kid.student_id]);
      const rows = await q(T.REGISTER_WORKING_ON, [sess[0].id, [kid.student_id]]);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ student_id: kid.student_id, work_on: 'Spotting in turns' });
      // On that session's own register, it is not "last" feedback.
      expect(await q(T.REGISTER_WORKING_ON, [sess[1].id, [kid.student_id]])).toHaveLength(0);
    });
    await asUser(USERS.guardianB, async (q, svc) => {
      const [kid] = await svc(`select student_id from feedback_note where work_on = 'Spotting in turns' limit 1`);
      // Other families read nothing (feedback_note RLS).
      if (kid) expect(await q(T.REGISTER_WORKING_ON, [null, [kid.student_id]])).toEqual([]);
    });
  });
});

/* ── U14 · media consent ────────────────────────────────────────────────── */
describe('U14 ask families for media consent', () => {
  /** A Senior Tap video showing three children of three families. */
  async function video(svc: Q) {
    const kids = await svc(`select distinct on (s.family_id) s.id, s.family_id, coalesce(s.preferred_name, s.first_name) as name
                              from enrolment e join student s on s.id = e.student_id
                             where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
                               and exists (select 1 from guardian g where g.family_id = s.family_id and g.user_id is not null and g.deleted_at is null)
                             order by s.family_id, s.id limit 3`, [SENIOR_TAP]);
    const [r] = await svc(`insert into resource (studio_id, kind, title, storage_path, created_by, shows_children)
                           values ($1, 'video', 'Routine', 'local:pending', $2, true) returning id`, [STUDIO_ID, USERS.teacherTap]);
    await svc(`insert into resource_assignment (studio_id, resource_id, scope, class_id) values ($1, $2, 'class', $3)`, [STUDIO_ID, r.id, SENIOR_TAP]);
    for (const k of kids) await svc(`insert into resource_child (studio_id, resource_id, student_id) values ($1, $2, $3)`, [STUDIO_ID, r.id, k.id]);
    await svc(`delete from consent_record where student_id = any($1::uuid[]) and kind = 'video'`, [kids.map((k: any) => k.id)]);
    // One given, one declined by the office on the family's word, one never recorded.
    await svc(`insert into consent_record (studio_id, student_id, kind, granted) values ($1, $2, 'video', true), ($1, $3, 'video', false)`,
              [STUDIO_ID, kids[0].id, kids[1].id]);
    return { id: r.id as string, kids };
  }

  it('asks only the family with nothing recorded, in the app, and only once a fortnight', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const v = await video(svc);
      const [status] = await q(H.RESOURCE_CHILD_STATUS, [v.id]);
      expect(status).toMatchObject({ named: 3, without_consent: 2, family_visible: false });
      const [res] = await q(H.REQUEST_MEDIA_CONSENT, [v.id]);
      expect(res).toEqual({ asked: 1, families: 1, already_asked: 0, declined: 1, unreachable: 0 });
      const told = await svc(`select n.user_id, n.title, n.body, n.href from notification n
                               join guardian g on g.user_id = n.user_id and g.family_id = $1
                              where n.kind = 'consent_request'`, [v.kids[2].family_id]);
      expect(told.length).toBeGreaterThan(0);
      expect(told[0].title).toBe(`Video consent for ${v.kids[2].name}`);
      expect(told[0].body).toMatch(/either answer is fine/);
      const others = await svc(`select 1 from notification n join guardian g on g.user_id = n.user_id
                                 where n.kind = 'consent_request' and g.family_id = any($1::uuid[])`, [[v.kids[0].family_id, v.kids[1].family_id]]);
      expect(others).toHaveLength(0);
      const [again] = await q(H.REQUEST_MEDIA_CONSENT, [v.id]);
      expect(again).toMatchObject({ asked: 0, already_asked: 1, declined: 1 });
      expect((await svc(`select count(*)::int n from audit_log where entity = 'media_consent_request'`))[0].n).toBe(1);
    });
  });

  it('families and teachers who do not teach with it cannot ask', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const v = await video(svc);
      await choose(q, USERS.guardianA, null);
      expect(await expectRejected(() => q(H.REQUEST_MEDIA_CONSENT, [v.id]))).toMatch(/FORBIDDEN/);
      await choose(q, USERS.teacherStreet, null);
      expect(await expectRejected(() => q(H.REQUEST_MEDIA_CONSENT, [v.id]))).toMatch(/FORBIDDEN/);
      await choose(q, USERS.admin, null);
      expect((await q(H.REQUEST_MEDIA_CONSENT, [v.id]))[0].asked).toBe(1);
    });
  });
});

/* ── F9 · class progress matrix ─────────────────────────────────────────── */
describe('F9 class progress matrix', () => {
  async function tapClass(svc: Q) {
    const [c] = await svc(`select id, dance_style_id from class where id = $1`, [SENIOR_TAP]);
    const [sk] = await svc(`select fs.id, fs.name from framework_skill fs join skill_framework f on f.id = fs.framework_id
                             where f.dance_style_id = $1 and fs.deleted_at is null order by fs.position limit 1`, [c.dance_style_id]);
    return { c, sk };
  }

  it('children × skills of the class’s style, drafts flagged, for its teacher only', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const { c, sk } = await tapClass(svc);
      await svc(`update class set tracking_depth = 'full' where id = $1`, [SENIOR_TAP]);
      const [kid] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' and deleted_at is null limit 1`, [SENIOR_TAP]);
      await svc(`delete from skill_assessment where student_id = $1 and skill_id = $2`, [kid.student_id, sk.id]);
      await svc(`insert into skill_assessment (studio_id, student_id, skill_id, dance_style_id, skill, level, assessed_on, published_at)
                 values ($1, $2, $3, $4, $5, 'developing', current_date - 30, now() - interval '30 days'),
                        ($1, $2, $3, $4, $5, 'secure', current_date, null)`, [STUDIO_ID, kid.student_id, sk.id, c.dance_style_id, sk.name]);
      const cells = await q(P.CLASS_PROGRESS, [SENIOR_TAP]);
      const kids = await svc(`select count(distinct e.student_id)::int n from enrolment e join student s on s.id = e.student_id
                               where e.class_id = $1 and e.status = 'active' and e.deleted_at is null and not s.skill_tracking_opt_out`, [SENIOR_TAP]);
      const m = matrixOf(cells);
      expect(m.kids).toHaveLength(kids[0].n);
      expect(m.skills.length).toBeGreaterThan(0);
      expect(cells.length).toBe(m.kids.length * m.skills.length);
      expect(m.cell(kid.student_id, sk.id)).toMatchObject({ level: 'secure', published: false, previous: 'developing', depth: 'full' });
      // Skills from other styles are not columns.
      const other = await svc(`select fs.id from framework_skill fs join skill_framework f on f.id = fs.framework_id
                                where f.dance_style_id <> $1 limit 1`, [c.dance_style_id]);
      expect(cells.some(x => x.skill_id === other[0]?.id)).toBe(false);
    });
    for (const who of [USERS.teacherStreet, USERS.guardianA]) {
      await asUser(who, async q => { expect(await q(P.CLASS_PROGRESS, [SENIOR_TAP])).toEqual([]); });
    }
  });

  it('respects tracking depth: nothing for notes only, no "then" without full tracking, opted-out children left out', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      await svc(`update class set tracking_depth = 'notes' where id = $1`, [SENIOR_TAP]);
      expect(await q(P.CLASS_PROGRESS, [SENIOR_TAP])).toEqual([]);
      await svc(`update class set tracking_depth = 'notes_skills' where id = $1`, [SENIOR_TAP]);
      const cells = await q(P.CLASS_PROGRESS, [SENIOR_TAP]);
      expect(cells.length).toBeGreaterThan(0);
      expect(cells.every(x => x.previous === null && x.depth === 'notes_skills')).toBe(true);
      const kid = cells[0].student_id;
      await svc(`update student set skill_tracking_opt_out = true where id = $1`, [kid]);
      expect((await q(P.CLASS_PROGRESS, [SENIOR_TAP])).some(x => x.student_id === kid)).toBe(false);
      expect((await q(P.MY_PROGRESS_CLASSES)).map(x => x.id)).toContain(SENIOR_TAP);
    });
  });
});

/* ── F14 · register-only mode and "ready offline" ───────────────────────── */
describe('F14 register-only mode, per teacher', () => {
  it('a teacher turns it on for herself; it is off by default and for everyone else', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect((await q(T.MY_REGISTER_ONLY))[0].on).toBe(false);
      expect((await q(T.SET_REGISTER_ONLY, [true]))[0].on).toBe(true);
      expect((await q(T.MY_REGISTER_ONLY))[0].on).toBe(true);
      await choose(q, USERS.teacherModern, null);
      expect((await q(T.MY_REGISTER_ONLY))[0].on).toBe(false);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(T.SET_REGISTER_ONLY, [true]))).toMatch(/FORBIDDEN/);
      expect((await q(T.MY_REGISTER_ONLY))[0].on).toBe(false);
    });
  });

  it('a teacher cannot change it by writing the column for someone else', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      await q(`update staff_member set register_only = true where user_id = $1`, [USERS.teacherModern]).catch(() => undefined);
      const [r] = await svc(`select bool_or(register_only) as on from staff_member where user_id = $1`, [USERS.teacherModern]);
      expect(r.on).toBe(false);
    });
  });
});

describe('F14 "Ready offline" is only said when it is true', () => {
  const ok = { worker: true, pages: true, runtime: true, registersRead: 3, registersTotal: 3 };
  it('ready when the app is cached and every one of today’s registers was read', () => {
    expect(readiness(ok)).toEqual({ state: 'ready', registers: 3 });
    expect(readiness({ ...ok, registersRead: 0, registersTotal: 0 })).toEqual({ state: 'ready', registers: 0 });
  });
  it('not ready without the worker, the pages or the database runtime, or with a register unread', () => {
    expect(readiness({ ...ok, worker: false })).toEqual({ state: 'not_ready', reason: 'app' });
    expect(readiness({ ...ok, pages: false })).toEqual({ state: 'not_ready', reason: 'app' });
    expect(readiness({ ...ok, runtime: false })).toEqual({ state: 'not_ready', reason: 'app' });
    expect(readiness({ ...ok, registersRead: 2 })).toEqual({ state: 'not_ready', reason: 'registers' });
  });
});
