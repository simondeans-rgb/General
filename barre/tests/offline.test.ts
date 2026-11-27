import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, CLASS } from './helpers';
import { AttendanceQueue, isOfflineError, mergeView, restTargets, supersedes, type QueueStorage, type PendingMark } from '../src/lib/offline/attendance-queue';
import { MARK_ATTENDANCE, REGISTER, CLOSE_REGISTER } from '../src/lib/repos/teaching';

const memory = (): QueueStorage & { v: string | null } => {
  const s = { v: null as string | null, get: () => s.v, set: (x: string) => { s.v = x; } };
  return s;
};
const mark = (studentId: string, status: string, at: string) =>
  ({ sessionId: 's1', studentId, status, reason: null, clientMarkedAt: at });

describe('the offline register queue', () => {
  it('keeps one entry per child — the latest tap', () => {
    const q = new AttendanceQueue(memory());
    q.add(mark('a', 'absent', '2026-01-01T10:00:00Z'));
    q.add(mark('a', 'present', '2026-01-01T10:00:05Z'));
    q.add(mark('a', 'late', '2026-01-01T10:00:01Z'));      // older, arriving late: ignored
    expect(q.pending).toHaveLength(1);
    expect(q.pending[0]!.status).toBe('present');
  });

  it('survives a reload', () => {
    const store = memory();
    new AttendanceQueue(store).add(mark('a', 'present', '2026-01-01T10:00:00Z'));
    expect(new AttendanceQueue(store).pending).toHaveLength(1);
  });

  it('shrugs off corrupt storage', () => {
    const store = memory(); store.v = '{not json';
    expect(new AttendanceQueue(store).pending).toHaveLength(0);
  });

  it('sends in tap order and keeps what fails', async () => {
    const q = new AttendanceQueue(memory());
    q.add(mark('b', 'present', '2026-01-01T10:00:02Z'));
    q.add(mark('a', 'present', '2026-01-01T10:00:01Z'));
    q.add(mark('c', 'present', '2026-01-01T10:00:03Z'));
    const order: string[] = [];
    const r = await q.flush(async m => { order.push(m.studentId); if (m.studentId === 'b') throw new Error('Failed to fetch'); });
    expect(order).toEqual(['a', 'b', 'c']);
    expect(r).toEqual({ sent: 2, failed: 1 });
    expect(q.pending.map(p => p.studentId)).toEqual(['b']);
  });

  it('tells "offline" from "refused"', () => {
    expect(isOfflineError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isOfflineError(new Error('new row violates row-level security policy'))).toBe(false);
  });
});

describe('a late sync cannot undo a correction', () => {
  beforeAll(async () => { await rebuild(); }, 60_000);
  afterAll(async () => { await closeDb(); });

  it('the newest tap wins, whatever order they arrive in', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      // A class that is on now: registers can only be marked around the class (UR-37).
      const [s] = await q(`select cs.id, e.student_id from class_session cs
                             join enrolment e on e.class_id = cs.class_id and e.status = 'active'
                            where cs.class_id = $1 and cs.starts_at > now() and cs.teacher_id is null order by cs.starts_at limit 1`, [CLASS.juniorTap]);
      await svc(`update class_session set ends_at = now() + (ends_at - starts_at) - interval '5 minutes', starts_at = now() - interval '5 minutes' where id = $1`, [s.id]);
      // Online correction at 10:05 lands first…
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'present', null, '2026-01-01T10:05:00Z', 'explicit']);
      // …then the offline mark from 10:00 syncs.
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'absent', null, '2026-01-01T10:00:00Z', 'explicit']);
      const [r] = await q(`select status from attendance_record where session_id = $1 and student_id = $2`,
        [s.id, s.student_id]);
      expect(r.status).toBe('present');
      // A genuinely newer tap still changes it.
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'late', null, '2026-01-01T10:06:00Z', 'explicit']);
      const [r2] = await q(`select status from attendance_record where session_id = $1 and student_id = $2`,
        [s.id, s.student_id]);
      expect(r2.status).toBe('late');
    });
  });

  it('UR-04 acceptance 1 against the database: 2 Here online, offline Absent and "Mark the rest", reconnect → 1 absent, 11 here', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now() and teacher_id is null
                              and status = 'scheduled' order by starts_at limit 1`, [CLASS.juniorTap]);
      await svc(`update class_session set ends_at = now() + (ends_at - starts_at) - interval '5 minutes', starts_at = now() - interval '5 minutes' where id = $1`, [s.id]);
      const roll = await q(REGISTER, [s.id]);
      expect(roll.length).toBeGreaterThanOrEqual(4);
      const t = (sec: number) => new Date(Date.UTC(2026, 0, 1, 16, 30, sec)).toISOString();
      // Online: two marked Here, straight to the server.
      for (const r of roll.slice(0, 2)) await q(MARK_ATTENDANCE, [s.id, r.student_id, 'present', null, t(1), 'explicit']);
      // Offline: Absent for the third child, then "Mark the rest here", then Close.
      const queue = new AttendanceQueue(memory());
      const server = await q(REGISTER, [s.id]);
      queue.add({ sessionId: s.id, studentId: roll[2].student_id, status: 'absent', reason: null, clientMarkedAt: t(10), kind: 'explicit' });
      queue.markRest(s.id, restTargets(server, queue.forSession(s.id)), t(20));
      queue.close({ sessionId: s.id, at: t(21) });
      expect(queue.forSession(s.id)).toHaveLength(roll.length - 2);
      // Reconnect.
      const r = await queue.flush({
        mark: async m => { await q(MARK_ATTENDANCE, [m.sessionId, m.studentId, m.status, m.reason, m.clientMarkedAt, m.kind]); },
        close: async c => { await q(CLOSE_REGISTER, [c.sessionId]); },
      });
      expect(queue.size).toBe(0);
      expect(r.failed).toBe(0);
      const after = await q(REGISTER, [s.id]);
      expect(after.filter((x: any) => x.status === 'absent').map((x: any) => x.student_id)).toEqual([roll[2].student_id]);
      expect(after.filter((x: any) => x.status === 'present' || x.status === 'trial')).toHaveLength(roll.length - 1);
      expect((await svc(`select register_closed_at from class_session where id = $1`, [s.id]))[0].register_closed_at).not.toBeNull();
    });
  });
});

describe('the offline register: merge rules (UR-04)', () => {
  const m = (studentId: string, status: string, at: string, kind?: 'explicit' | 'rest'): PendingMark =>
    ({ sessionId: 's1', studentId, status, reason: null, clientMarkedAt: at, kind });

  it('an explicit mark beats "rest" whatever the clocks; between explicit marks the later tap wins', () => {
    expect(supersedes(m('a', 'absent', '10:00', 'explicit'), m('a', 'present', '10:05', 'rest'))).toBe(true);
    expect(supersedes(m('a', 'present', '10:05', 'rest'), m('a', 'absent', '10:00', 'explicit'))).toBe(false);
    expect(supersedes(m('a', 'late', '10:06'), m('a', 'absent', '10:00'))).toBe(true);
    expect(supersedes(m('a', 'late', '09:59'), m('a', 'absent', '10:00'))).toBe(false);
    const q = new AttendanceQueue(memory());
    q.add(m('a', 'absent', '2026-01-01T10:00:00Z', 'explicit'));
    expect(q.add(m('a', 'present', '2026-01-01T10:05:00Z', 'rest'))).toBe(false);
    expect(q.pending[0]!.status).toBe('absent');
  });

  it('"Mark the rest" covers only children with no mark at all, counting queued marks, and is fixed when tapped', () => {
    const rows = [
      { student_id: 'a', status: 'present' }, { student_id: 'b', status: 'present' },
      { student_id: 'c', status: null }, { student_id: 'd', status: null }, { student_id: 'e', status: null, is_trial: true },
    ];
    const q = new AttendanceQueue(memory());
    q.add(m('c', 'absent', '2026-01-01T10:00:00Z'));
    const targets = restTargets(rows, q.forSession('s1'));
    expect(targets).toEqual([{ studentId: 'd', status: 'present' }, { studentId: 'e', status: 'trial' }]);
    expect(q.markRest('s1', targets, '2026-01-01T10:01:00Z')).toBe(2);
    // A later tap on a child the rest covered is explicit, so it wins.
    q.add(m('d', 'absent', '2026-01-01T10:00:30Z'));
    const view = mergeView(rows, q.forSession('s1'));
    expect(view.map(v => v.status)).toEqual(['present', 'present', 'absent', 'absent', 'trial']);
    expect(view.filter(v => v.waiting).map(v => v.student_id)).toEqual(['c', 'd', 'e']);
    // The rest is never re-run: a child added to the server roll later is not swept in.
    expect(q.forSession('s1').map(x => x.studentId).sort()).toEqual(['c', 'd', 'e']);
  });

  it('marks, reasons and a queued close survive a reload', () => {
    const store = memory();
    const q = new AttendanceQueue(store);
    q.add(m('a', 'absent', '2026-01-01T10:00:00Z'));
    q.setReason({ sessionId: 's1', studentId: 'b', reason: 'Unwell', at: '2026-01-01T10:01:00Z' });
    q.close({ sessionId: 's1', at: '2026-01-01T10:02:00Z' });
    const again = new AttendanceQueue(store);
    expect(again.pending).toHaveLength(1);
    expect(again.pendingReasons).toHaveLength(1);
    expect(again.closing('s1')).toBe(true);
    expect(again.size).toBe(3);
  });

  it('reads a queue saved by the previous version', () => {
    const store = memory();
    store.v = JSON.stringify([{ sessionId: 's1', studentId: 'a', status: 'present', reason: null, clientMarkedAt: '2026-01-01T10:00:00Z' }]);
    const q = new AttendanceQueue(store);
    expect(q.pending).toHaveLength(1);
    expect(supersedes(m('a', 'present', '2026-01-01T11:00:00Z', 'rest'), q.pending[0]!)).toBe(false);   // old marks count as explicit
  });

  it('a reason typed against a waiting mark goes with that mark', () => {
    const q = new AttendanceQueue(memory());
    q.add(m('a', 'absent', '2026-01-01T10:00:00Z'));
    q.setReason({ sessionId: 's1', studentId: 'a', reason: 'Dentist', at: '2026-01-01T10:01:00Z' });
    expect(q.pending[0]!.reason).toBe('Dentist');
    expect(q.pendingReasons).toHaveLength(0);
  });

  it('closing is sent after the marks, and waits while any mark for that register cannot be sent', async () => {
    const q = new AttendanceQueue(memory());
    q.add(m('a', 'absent', '2026-01-01T10:00:00Z'));
    q.close({ sessionId: 's1', at: '2026-01-01T10:02:00Z' });
    const order: string[] = [];
    let up = false;
    const send = {
      mark: async (x: PendingMark) => { if (!up) throw new TypeError('Failed to fetch'); order.push('mark ' + x.studentId); },
      close: async () => { if (!up) throw new TypeError('Failed to fetch'); order.push('close'); },
    };
    expect(await q.flush(send)).toEqual({ sent: 0, failed: 2 });
    expect(q.size).toBe(2);
    up = true;
    expect(await q.flush(send)).toEqual({ sent: 2, failed: 0 });
    expect(order).toEqual(['mark a', 'close']);
  });

  it('a write the server refuses is dropped and reported, not retried for ever', async () => {
    const q = new AttendanceQueue(memory());
    q.add(m('a', 'absent', '2026-01-01T10:00:00Z'));
    q.add(m('b', 'present', '2026-01-01T10:00:01Z'));
    await q.flush(async x => { if (x.studentId === 'a') throw new Error('REGISTER_LOCKED: this register can no longer be changed'); });
    expect(q.size).toBe(0);
    expect(q.lastRejected).toEqual([{ what: 'mark', sessionId: 's1', studentId: 'a', error: expect.stringMatching(/REGISTER_LOCKED/) }]);
  });

  it('only sends the signed-in person’s own marks', async () => {
    const q = new AttendanceQueue(memory());
    q.add({ ...m('a', 'absent', '2026-01-01T10:00:00Z'), userId: 'u1' });
    q.add({ ...m('b', 'absent', '2026-01-01T10:00:00Z'), userId: 'u2' });
    const sent: string[] = [];
    await q.flush(async x => { sent.push(x.studentId); }, u => u === 'u1');
    expect(sent).toEqual(['a']);
    expect(q.pending.map(x => x.studentId)).toEqual(['b']);
  });
});
