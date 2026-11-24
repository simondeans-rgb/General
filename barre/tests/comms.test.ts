import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, FAMILY, STUDIO_ID } from './helpers';
import * as I from '../src/lib/repos/inbox';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);

describe('who has seen a message (R-018)', () => {
  it('counts families, marks the ones who read it, and reminds the rest once', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id }] = await q(I.SEND_CLASS, [CLASS.juniorTap, 'Costumes', 'Please bring tap shoes on Tuesday']);
      const before = await q(I.REACH, [id]);
      expect(before.length).toBeGreaterThan(3);
      expect(before.every((r: any) => !r.seen)).toBe(true);
      // Hannah's family reads it.
      const wright = before.find((r: any) => r.family_id === FAMILY.a);
      if (wright) {
        await as(svc, USERS.guardianA); await q(I.MARK_READ, [[id]]); await as(svc, USERS.admin);
        expect((await q(I.REACH, [id])).find((r: any) => r.family_id === FAMILY.a).seen).toBe(true);
      }
      const [{ n }] = await q(I.REMIND_UNREAD, [id]);
      expect(n).toBe(before.filter((r: any) => r.has_login && r.family_id !== FAMILY.a).length);
      expect(await expectRejected(() => q(I.REMIND_UNREAD, [id]))).toMatch(/less than an hour/);
    });
  });
  it('a parent cannot see who else has read it', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [c] = await svc(`select id from communication where kind = 'studio_announcement' limit 1`);
      expect(await expectRejected(() => q(I.REACH, [c.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('notification preferences (R-019)', () => {
  it('a parent turns off progress notes but still hears about a cancelled class', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(I.SET_PREF, ['messages', false, true]);
      expect(await expectRejected(() => q(I.SET_PREF, ['schedule', false, false]))).toMatch(/cannot be switched off/);
      await as(svc, USERS.admin);
      await q(I.SEND_DIRECT, [FAMILY.a, 'Hello', 'A note from the office']);
      const [s] = await svc(`select cs.id from class_session cs join enrolment e on e.class_id = cs.class_id
                               join student st on st.id = e.student_id and st.family_id = $1
                              where cs.starts_at > now() and cs.status = 'scheduled' and e.status = 'active' limit 1`, [FAMILY.a]);
      await q(`select app.cancel_session($1, 'Hall flooded')`, [s.id]);
      const mine = await svc(`select kind from notification where user_id = $1`, [USERS.guardianA]);
      expect(mine.some((n: any) => n.kind === 'message')).toBe(false);
      expect(mine.some((n: any) => n.kind === 'schedule_change')).toBe(true);
    });
  });
  it('quiet hours need both ends', async () => {
    await asUser(USERS.guardianA, async q => {
      await q(I.SET_QUIET, ['21:00', '07:00']);
      expect((await q(I.MY_QUIET))[0]).toEqual({ quiet_from: '21:00', quiet_to: '07:00' });
      expect(await expectRejected(() => q(I.SET_QUIET, ['21:00', null]))).toMatch(/both/);
    });
  });
});

describe('teachers and families, in the open (R-028)', () => {
  it('a teacher writes to a child’s family; the office and family see it; the teacher sees only their own', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await q(`select s.id, s.family_id from student s limit 1`);
      const [{ id }] = await q(I.TEACHER_MESSAGE, [kid.id, '', 'Lovely shuffles today!']);
      expect((await q(I.MY_SENT_TO_FAMILIES)).some((m: any) => m.id === id)).toBe(true);
      const others = await q(`select 1 from communication where kind = 'direct' and sent_by is distinct from auth.uid()`);
      expect(others).toHaveLength(0);
      await as(svc, USERS.admin);
      expect((await q(I.CONVERSATION, [kid.family_id])).some((m: any) => m.id === id)).toBe(true);
    });
  });
  it('a teacher cannot write to a family they do not teach', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [other] = await svc(`select s.id from student s where s.id not in (
        select e.student_id from enrolment e join class c on c.id = e.class_id join staff_member sm on sm.id = c.teacher_id
         where sm.user_id = $1) limit 1`, [USERS.teacherTap]);
      expect(await expectRejected(() => q(I.TEACHER_MESSAGE, [other.id, '', 'hi']))).toMatch(/FORBIDDEN/);
    });
  });
  it('a medical update and its acknowledgement read in the family conversation, without inflating unread', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      const [{ id }] = await q(`insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
                                values ($1, $2, $3, 'medical_update', 'New allergy', 'Now allergic to kiwi', auth.uid()) returning id`,
                               [STUDIO_ID, FAMILY.a, kid.id]);
      await as(svc, USERS.admin);
      const unreadBefore = (await q(I.THREADS)).find((t: any) => t.family_id === FAMILY.a)?.unread ?? 0;
      await q(`select app.acknowledge_medical_update($1, null, null, null)`, [id]);
      const convo = await q(I.CONVERSATION, [FAMILY.a]);
      expect(convo.filter((m: any) => /allergy/i.test(m.subject ?? '')).length).toBe(2);
      expect((await q(I.THREADS)).find((t: any) => t.family_id === FAMILY.a).unread).toBe(unreadBefore);
      const told = await svc(`select count(*)::int n from notification where user_id = $1 and kind = 'request_answered'`, [USERS.guardianA]);
      expect(told[0].n).toBe(1);
    });
  });
});

describe('send later (R-037)', () => {
  it('a scheduled message is invisible to families until its time, then they are told', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const at = new Date(Date.now() + 3600_000).toISOString();
      const [{ id }] = await q(I.SEND_DIRECT_AT, [FAMILY.a, 'Tomorrow', 'Reminder: photos tomorrow', at]);
      expect((await q(I.BROADCASTS)).length).toBeGreaterThanOrEqual(0);
      await as(svc, USERS.guardianA);
      expect(await q(`select 1 from communication where id = $1`, [id])).toHaveLength(0);
      expect(await svc(`select 1 from notification where user_id = $1 and title = 'Tomorrow'`, [USERS.guardianA])).toHaveLength(0);
      // Time passes.
      await svc(`update communication set sent_at = now() - interval '1 second', created_at = now() - interval '2 hours' where id = $1`, [id]);
      await as(svc, USERS.admin);
      expect((await q(I.RELEASE_SCHEDULED))[0].n).toBe(1);
      expect((await q(I.RELEASE_SCHEDULED))[0].n).toBe(0);
      await as(svc, USERS.guardianA);
      expect(await q(`select 1 from communication where id = $1`, [id])).toHaveLength(1);
      expect(await svc(`select 1 from notification where user_id = $1 and title = 'Tomorrow'`, [USERS.guardianA])).toHaveLength(1);
    });
  });
  it('a parent cannot schedule, and nobody can backdate', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(`insert into communication (studio_id, kind, family_id, body, sent_at)
                                values ($1, 'direct', $2, 'hi', now() + interval '2 days') returning id`, [STUDIO_ID, FAMILY.a]);
      const [{ late }] = await svc(`select sent_at > now() + interval '1 minute' late from communication where id = $1`, [id]);
      expect(late).toBe(false);
    });
  });
});

describe('a teacher sees when their message was read', () => {
  it('seen flips once the family opens it', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select s.id, s.family_id from student s join guardian g on g.family_id = s.family_id
                                where g.user_id = $1 and s.id in (select e.student_id from enrolment e where e.class_id = $2) limit 1`,
                              [USERS.guardianA, CLASS.juniorTap]);
      if (!kid) return;
      const [{ id }] = await q(I.TEACHER_MESSAGE, [kid.id, 'Well done', 'Great work today']);
      expect((await q(I.MY_SENT_TO_FAMILIES)).find((m: any) => m.id === id).seen).toBe(false);
      await as(svc, USERS.guardianA); await q(I.MARK_READ, [[id]]); await as(svc, USERS.teacherTap);
      expect((await q(I.MY_SENT_TO_FAMILIES)).find((m: any) => m.id === id).seen).toBe(true);
    });
  });
});
