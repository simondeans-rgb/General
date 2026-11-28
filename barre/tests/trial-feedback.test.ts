import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, CLASS } from './helpers';
import * as T from '../src/lib/repos/teaching';
import * as Q from '../src/lib/repos/dashboard';

type Run = (sql: string, params?: unknown[]) => Promise<any[]>;
const as = (svc: Run, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

beforeAll(rebuild);
afterAll(closeDb);

// A Junior Tap class (Marcus's) yesterday, with a child on trial who isn't enrolled.
async function trialSession(svc: Run) {
  const [{ id: sess }] = await svc(`insert into class_session (studio_id, class_id, starts_at, ends_at, status)
      values ($1, $2, now() - interval '1 day', now() - interval '1 day' + interval '45 minutes', 'scheduled') returning id`,
    [STUDIO_ID, CLASS.juniorTap]);
  const [{ id: child }] = await svc(`select s.id from student s where s.studio_id = $1 and s.deleted_at is null
      and s.id not in (select student_id from enrolment where class_id = $2) order by s.id limit 1`, [STUDIO_ID, CLASS.juniorTap]);
  const [{ id: trial }] = await svc(`insert into trial (studio_id, class_id, session_id, student_id, status)
      values ($1, $2, $3, $4, 'booked') returning id`, [STUDIO_ID, CLASS.juniorTap, sess, child]);
  return { sess, child, trial };
}

describe('the teacher’s view of a trial (0071)', () => {
  it('shows the trial on the register; the class’s teacher writes, the office is told and sees it', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const { sess, child, trial } = await trialSession(svc);
      const row = (await q(T.REGISTER, [sess])).find((r: any) => r.id === child || r.student_id === child);
      expect(row.is_trial).toBe(true);
      expect(row.trial_id).toBe(trial);
      expect(row.trial_recommendation).toBeNull();

      await q(T.SAVE_TRIAL_FEEDBACK, [trial, 'ready', 'Picked up the shuffle quickly, very confident.']);
      const after = (await q(T.REGISTER, [sess])).find((r: any) => r.trial_id === trial);
      expect(after.trial_recommendation).toBe('ready');
      expect(after.trial_comments).toMatch(/shuffle/);
      expect(after.trial_written_by).toBeTruthy();

      const told = await svc(`select n.title, n.body, n.href from notification n join membership m on m.user_id = n.user_id
          where m.studio_id = $1 and m.role in ('owner','admin') and n.kind = 'trial_feedback'`, [STUDIO_ID]);
      expect(told.length).toBeGreaterThan(0);
      expect(told[0].title).toMatch(/^Trial feedback: .+ — Ready to join$/);
      expect(told[0].body).toMatch(/Junior Tap: “Picked up the shuffle/);
      expect(told[0].href).toBe('/enrolment');

      // Updating it says so.
      await q(T.SAVE_TRIAL_FEEDBACK, [trial, 'other_class', 'Maybe the older group.']);
      expect((await svc(`select count(*)::int n from notification where kind = 'trial_feedback' and title like 'Trial feedback updated:%'`))[0].n).toBeGreaterThan(0);

      // The office reads it and has it on Today.
      await as(svc, USERS.admin);
      const [f] = await q(T.TRIAL_FEEDBACK, [trial]);
      expect(f.recommendation).toBe('other_class');
      const today = await q(Q.ATTENTION_TRIAL_FEEDBACK);
      expect(today.map((t: any) => t.trial_id)).toContain(trial);

      // Once decided (joined), it leaves Today.
      await svc(`update trial set status = 'converted' where id = $1`, [trial]);
      expect((await q(Q.ATTENTION_TRIAL_FEEDBACK)).map((t: any) => t.trial_id)).not.toContain(trial);
    });
  });

  it('a cover teacher for that class can write it', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      const { sess, trial } = await trialSession(svc);
      await svc(`update class_session set teacher_id = (select id from staff_member where user_id = $1 and studio_id = $2) where id = $3`,
        [USERS.teacherModern, STUDIO_ID, sess]);
      await q(T.SAVE_TRIAL_FEEDBACK, [trial, null, 'Lovely energy, needs work on timing.']);
      expect((await q(T.TRIAL_FEEDBACK, [trial]))[0].comments).toMatch(/timing/);
    });
  });

  it('other teachers, families and strangers can neither read nor write it', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const { trial } = await trialSession(svc);
      await q(T.SAVE_TRIAL_FEEDBACK, [trial, 'not_ready', 'Struggled to follow.']);
      for (const who of [USERS.teacherStreet, USERS.guardianA, USERS.guardianB, USERS.stranger]) {
        await as(svc, who);
        expect(await q(T.TRIAL_FEEDBACK, [trial])).toHaveLength(0);
        expect(await expectRejected(() => q(T.SAVE_TRIAL_FEEDBACK, [trial, 'ready', 'x']))).toMatch(/FORBIDDEN/);
        expect(await q(Q.ATTENTION_TRIAL_FEEDBACK)).toHaveLength(0);
      }
    });
  });

  it('needs a recommendation or a comment, and only known recommendations', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const { trial } = await trialSession(svc);
      expect(await expectRejected(() => q(T.SAVE_TRIAL_FEEDBACK, [trial, null, '  ']))).toMatch(/choose how it went/);
      expect(await expectRejected(() => q(T.SAVE_TRIAL_FEEDBACK, [trial, 'brilliant', null]))).toMatch(/unknown recommendation/);
    });
  });
});
