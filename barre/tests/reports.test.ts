import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS } from './helpers';
import { pulseComponents, pulseScore, MIN_HISTORY_DAYS, WEIGHTS } from '../src/lib/pulse/score';

describe('Studio Pulse', () => {
  const healthy = {
    active_90d_ago: 100, leavers_90d: 8, attended_28d: 900, marked_28d: 1000,
    issued_90d_minor: 1_000_000, overdue_90d_minor: 50_000, enrolled: 180, capacity: 200,
    trials_attended: 20, converted: 12,
  };

  it('weights add up to one', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it('withholds the score without enough history, and says why', () => {
    const r = pulseScore(pulseComponents(healthy), MIN_HISTORY_DAYS - 1);
    expect(r.score).toBeNull();
    expect(r.reason).toMatch(/history/);
  });

  it('withholds it when a component has too small a sample', () => {
    const r = pulseScore(pulseComponents({ ...healthy, marked_28d: 5, attended_28d: 5 }), 400);
    expect(r.score).toBeNull();
    expect(r.reason).toMatch(/attendance/);
  });

  it('scores a healthy studio highly and a struggling one low', () => {
    const good = pulseScore(pulseComponents(healthy), 400).score!;
    const poor = pulseScore(pulseComponents({ ...healthy, leavers_90d: 45, attended_28d: 600,
      overdue_90d_minor: 400_000, enrolled: 90, converted: 3 }), 400).score!;
    expect(good).toBeGreaterThan(85);
    expect(poor).toBeLessThan(60);
  });

  it('does not reward a timetable past 90% full', () => {
    const at90 = pulseScore(pulseComponents({ ...healthy, enrolled: 180 }), 400).score!;
    const at100 = pulseScore(pulseComponents({ ...healthy, enrolled: 200 }), 400).score!;
    expect(at100).toBe(at90);
  });
});

describe('the reports screen’s queries', () => {
  beforeAll(async () => { await rebuild(); }, 60_000);
  afterAll(async () => { await closeDb(); });

  it('agree with the operational screens', async () => {
    const R = await import('../src/lib/repos/reports');
    const B = await import('../src/lib/repos/billing');
    await asUser(USERS.owner, async q => {
      const [h] = await q(R.HEADLINE);
      const [{ n }] = await q(`select count(distinct student_id)::int n from enrolment where status = 'active'`);
      expect(h.active_students).toBe(n);
      expect(h.leavers_30d + h.leavers_90d).toBeGreaterThan(0);   // the seed has leavers
      expect(h.capacity).toBeGreaterThan(h.enrolled - 1);
      expect(h.marked_28d).toBeGreaterThan(0);
      const [s] = await q(B.SUMMARY);
      expect(h.outstanding_minor).toBe(s.outstanding_minor);
      expect((await q(R.WEEKLY_ATTENDANCE))).toHaveLength(8);
      const classes = await q(R.CLASS_STATS);
      expect(classes.reduce((n: number, c: any) => n + c.enrolled, 0)).toBe(h.enrolled);
      expect(await q(R.MONTHS)).toHaveLength(6);
    });
  });

  it('a teacher sees only their own corner of the studio', async () => {
    const R = await import('../src/lib/repos/reports');
    await asUser(USERS.teacherTap, async q => {
      const [h] = await q(R.HEADLINE);
      expect(h.active_students).toBeLessThan(45);
      expect(Number(h.outstanding_minor)).toBe(0);
    });
  });
});
