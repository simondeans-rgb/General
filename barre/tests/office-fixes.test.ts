import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, FAMILY, STUDIO_ID } from './helpers';
import * as C from '../src/lib/repos/classes';
import * as P from '../src/lib/repos/people';
import { toDateInput } from '../src/lib/format';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/* ── UR-01 class creation ───────────────────────────────────────────────── */
describe('creating a class (UR-01)', () => {
  /** The exact argument list ClassForm sends, in the same order. */
  const args = (over: Partial<C.ClassDraft> & { style: string; location: string }) => {
    const d = {
      level_id: null, room_id: null, teacher_id: null, name: 'Grade 4 Ballet', day_of_week: 2,
      start_time: '17:30', duration_min: 60, capacity: 12, age_min: 9, age_max: 12,
      price_minor: 5400, trials_enabled: true, waitlist_enabled: true, visibility: 'public',
      pricing: 'term', trial_price_minor: null, assistant_id: null, prerequisites: '', description: '',
      trial_needs_approval: false, ...over,
    } as any;
    return [over.style, d.level_id, over.location, d.room_id, d.teacher_id, d.name, d.day_of_week,
      d.start_time, d.duration_min, d.capacity, d.age_min, d.age_max, d.price_minor, d.trials_enabled,
      d.waitlist_enabled, d.visibility, d.pricing, d.trial_price_minor, d.assistant_id,
      d.prerequisites, d.description, d.trial_needs_approval];
  };

  const refs = async (svc: any) => {
    const [term] = await svc(`select id from term where deleted_at is null and status <> 'archived'
                               and ends_on > current_date order by starts_on limit 1`);
    const [style] = await svc(`select id from dance_style where deleted_at is null limit 1`);
    const [loc] = await svc(`select id from location where deleted_at is null limit 1`);
    return { term: term.id, style: style.id, location: loc.id };
  };

  for (const role of ['owner', 'admin'] as const) {
    it(`the form's SQL creates a class and its sessions, as ${role}`, async () => {
      await asUser(USERS[role], async (q, svc) => {
        const r = await refs(svc);
        const [row] = await q(C.CREATE_CLASS, [r.term, ...args({ style: r.style, location: r.location })]);
        expect(row.id).toBeTruthy();
        const [made] = await q(C.GENERATE_SESSIONS, [row.id]);
        expect(made.made).toBeGreaterThan(0);
        const listed = await q(C.CLASSES);
        expect(listed.some((c: any) => c.id === row.id && c.sessions_left > 0)).toBe(true);
        const [saved] = await q(C.CLASS_FOR_EDIT, [row.id]);
        expect(saved).toMatchObject({ pricing: 'term', visibility: 'public', capacity: 12 });
      });
    });
  }

  it('handles no room, trials off and pay-as-you-go with no price', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const r = await refs(svc);
      const [row] = await q(C.CREATE_CLASS, [r.term, ...args({ style: r.style, location: r.location,
        trials_enabled: false, pricing: 'drop_in', price_minor: 0, visibility: 'unlisted' })]);
      const [saved] = await q(C.CLASS_FOR_EDIT, [row.id]);
      expect(saved).toMatchObject({ pricing: 'drop_in', trials_enabled: false, room_id: null, visibility: 'unlisted' });
    });
  });
});

/* ── UR-02 dates into date inputs ───────────────────────────────────────── */
describe('date inputs (UR-02)', () => {
  it('toDateInput takes a Date, a string or nothing', () => {
    expect(toDateInput(null)).toBe('');
    expect(toDateInput(undefined)).toBe('');
    expect(toDateInput('')).toBe('');
    expect(toDateInput('2015-06-30')).toBe('2015-06-30');
    expect(toDateInput('2015-06-30T00:00:00.000Z')).toBe('2015-06-30');
    // PGlite: UTC midnight
    expect(toDateInput(new Date('2015-06-30'))).toBe('2015-06-30');
    // node-postgres: local midnight, in summer time
    expect(toDateInput(new Date(2015, 5, 30))).toBe('2015-06-30');
    expect(toDateInput(new Date(2015, 0, 1))).toBe('2015-01-01');
    expect(toDateInput(new Date('nonsense'))).toBe('');
  });

  it('a student’s details come back as a Date and round-trip through the edit form', async () => {
    await asUser(USERS.admin, async q => {
      const [s] = await q(`select id from student where deleted_at is null order by last_name limit 1`);
      const [row] = await q(P.STUDENT_DETAIL, [s.id]);
      expect(row.date_of_birth).toBeInstanceOf(Date);
      const dob = toDateInput(row.date_of_birth);
      expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await q(P.UPDATE_STUDENT, [s.id, 'Renamed', row.last_name, '', '2016-07-14', '', '', '', toDateInput(row.left_on) || null]);
      const [after] = await q(P.STUDENT_DETAIL, [s.id]);
      expect(after.first_name).toBe('Renamed');
      expect(toDateInput(after.date_of_birth)).toBe('2016-07-14');
    });
  });
});
