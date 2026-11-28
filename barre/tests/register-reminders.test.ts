import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, STUDIO_ID, CLASS } from './helpers';
import * as Q from '../src/lib/repos/dashboard';

beforeAll(rebuild);
afterAll(closeDb);

// A class two days ago at 16:30 school time, with its register left open.
async function openSession(svc: any, opts: { closed?: boolean; cancelled?: boolean; start?: string } = {}) {
  const [s] = await svc(`insert into class_session (studio_id, class_id, starts_at, ends_at, status, register_closed_at)
      values ($1, $2, ((current_date - 2) + $5::time) at time zone 'Europe/London',
                      ((current_date - 2) + $5::time + interval '45 minutes') at time zone 'Europe/London',
              $3::session_status, case when $4 then now() end)
      returning id`, [STUDIO_ID, CLASS.juniorTap, opts.cancelled ? 'cancelled' : 'scheduled', !!opts.closed, opts.start ?? '16:30']);
  return s.id as string;
}
// School-time instants relative to that class's day.
const at = async (svc: any, dayOffset: number, hhmm: string) =>
  (await svc(`select (((current_date - 2) + $1::int) + $2::time) at time zone 'Europe/London' as t`, [dayOffset, hhmm]))[0].t;
const run = (svc: any, now: string) => svc(`select app.register_reminders($1, $2::timestamptz) n`, [STUDIO_ID, now]);
const marcus = async (svc: any) => (await svc(`select user_id from staff_member where id = (select teacher_id from class where id = $1)`, [CLASS.juniorTap]))[0].user_id;

describe('reminders for registers left incomplete (0070)', () => {
  it('reminds the teacher the morning after, once, then tells the office the next morning, once', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      const sid = await openSession(svc);
      const teacher = await marcus(svc);
      const mine = () => svc(`select * from register_reminder where session_id = $1`, [sid]);
      const notes = (user: string) => svc(`select title from notification where user_id = $1 and kind = 'register_overdue' and title like 'Register not completed: Junior Tap%'`, [user]);

      await run(svc, await at(svc, 1, '07:30'));             // before 08:00 the morning after: nothing
      expect(await mine()).toHaveLength(0);

      await run(svc, await at(svc, 1, '08:05'));             // the teacher is reminded
      expect((await mine())[0].teacher_reminded_at).toBeTruthy();
      expect(await notes(teacher)).toHaveLength(1);
      await run(svc, await at(svc, 1, '09:00'));             // not twice
      expect(await notes(teacher)).toHaveLength(1);
      expect((await mine())[0].escalated_at).toBeNull();     // office not yet told

      await run(svc, await at(svc, 2, '08:10'));             // 24 hours after the reminder: the office
      expect((await mine())[0].escalated_at).toBeTruthy();
      const office = await svc(`select n.body from notification n join membership m on m.user_id = n.user_id
                                  where m.studio_id = $1 and m.role in ('owner','admin') and n.kind = 'register_overdue'
                                    and n.title like 'Incomplete register: Junior Tap%'`, [STUDIO_ID]);
      expect(office.length).toBeGreaterThan(0);
      expect(office[0].body).toMatch(/was reminded/);
      const before = office.length;
      await run(svc, await at(svc, 2, '12:00'));             // not twice
      expect((await svc(`select count(*)::int n from notification where kind = 'register_overdue' and title like 'Incomplete register: Junior Tap%'`))[0].n).toBe(before);
    });
  });

  it('a closed or cancelled class never triggers a reminder', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      const closed = await openSession(svc, { closed: true });
      const cancelled = await openSession(svc, { cancelled: true, start: '16:40' });
      await run(svc, await at(svc, 2, '09:00'));
      expect(await svc(`select 1 from register_reminder where session_id = any($1)`, [[closed, cancelled]])).toHaveLength(0);
    });
  });

  it('closing the register after the reminder stops the office being told', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      const sid = await openSession(svc);
      await run(svc, await at(svc, 1, '08:05'));
      await svc(`update class_session set register_closed_at = now() where id = $1`, [sid]);
      await run(svc, await at(svc, 2, '09:00'));
      expect((await svc(`select escalated_at from register_reminder where session_id = $1`, [sid]))[0].escalated_at).toBeNull();
    });
  });

  it('follows the school’s settings, and can be switched off', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      await svc(`update studio set register_reminder_hour = 10 where id = $1`, [STUDIO_ID]);
      const sid = await openSession(svc);
      await run(svc, await at(svc, 1, '09:30'));
      expect(await svc(`select 1 from register_reminder where session_id = $1`, [sid])).toHaveLength(0);
      await svc(`update studio set register_reminders = false where id = $1`, [STUDIO_ID]);
      expect((await run(svc, await at(svc, 1, '11:00')))[0].n).toBe(0);
    });
  });

  it('the office sees overdue registers on Today; a teacher does not, and cannot run reminders', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const sid = await openSession(svc);
      await run(svc, await at(svc, 1, '08:05'));
      await run(svc, await at(svc, 2, '08:10'));
      expect((await q(Q.ATTENTION_REGISTERS)).some((r: any) => r.session_id === sid)).toBe(true);
    });
    await asUser(USERS.teacherTap, async (q) => {
      expect(await q(Q.ATTENTION_REGISTERS)).toHaveLength(0);
      await expect(q(`select app.register_reminders($1)`, [STUDIO_ID])).rejects.toThrow();
    });
  });
});
