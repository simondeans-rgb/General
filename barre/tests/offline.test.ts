import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, CLASS } from './helpers';
import { AttendanceQueue, isOfflineError, type QueueStorage } from '../src/lib/offline/attendance-queue';
import { MARK_ATTENDANCE } from '../src/lib/repos/teaching';

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
    await asUser(USERS.teacherTap, async q => {
      const [s] = await q(`select cs.id, e.student_id from class_session cs
                             join enrolment e on e.class_id = cs.class_id and e.status = 'active'
                            where cs.class_id = $1 order by cs.starts_at desc limit 1`, [CLASS.juniorTap]);
      // Online correction at 10:05 lands first…
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'present', null, '2026-01-01T10:05:00Z']);
      // …then the offline mark from 10:00 syncs.
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'absent', null, '2026-01-01T10:00:00Z']);
      const [r] = await q(`select status from attendance_record where session_id = $1 and student_id = $2`,
        [s.id, s.student_id]);
      expect(r.status).toBe('present');
      // A genuinely newer tap still changes it.
      await q(MARK_ATTENDANCE, [s.id, s.student_id, 'late', null, '2026-01-01T10:06:00Z']);
      const [r2] = await q(`select status from attendance_record where session_id = $1 and student_id = $2`,
        [s.id, s.student_id]);
      expect(r2.status).toBe('late');
    });
  });
});
