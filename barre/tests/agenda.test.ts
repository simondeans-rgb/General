/**
 * UR-47: a teacher's own week across schools (migration 0055).
 * Priya teaches at Northstar and Kestrel; Marcus only at Northstar.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, CLASS, STUDIO_ID, type Q } from './helpers';
import { OTHER_STUDIOS } from '../src/lib/db/seed/data';
import * as T from '../src/lib/repos/teaching';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const KESTREL = OTHER_STUDIOS.kestrel;
const KESTREL_CLASS = uid(NS.class, 190);
const ELENA = uid(NS.user, 191);          // Kestrel's owner
const AGENDA = `select * from app.my_agenda(now(), now() + interval '14 days')`;

/** Look at the app as if this school were chosen in the switcher. */
const choose = (q: Q, user: string, studio: string | null) =>
  q(`select set_config('request.jwt.claims', $1, true)`,
    [JSON.stringify({ sub: user, role: 'authenticated', ...(studio ? { studio } : {}) })]);

const nextKestrel = async (svc: Q) =>
  (await svc(`select id, starts_at, ends_at from class_session where class_id = $1 and starts_at > now()
                and status = 'scheduled' order by starts_at limit 1`, [KESTREL_CLASS]))[0];

/** One of Priya's Northstar sessions, moved to start `offsetMin` from the next Kestrel class and last `lenMin`. */
async function priyaNorthstarNear(svc: Q, offsetMin: number, lenMin: number) {
  const k = await nextKestrel(svc);
  const [n] = await svc(`select cs.id from class_session cs join class c on c.id = cs.class_id
                           join staff_member sm on sm.id = c.teacher_id
                          where sm.user_id = $1 and c.studio_id = $2 and cs.starts_at > now() + interval '1 day'
                            and cs.status = 'scheduled' and cs.teacher_id is null
                          order by cs.starts_at limit 1`, [USERS.teacherModern, STUDIO_ID]);
  await svc(`update class_session set starts_at = $2::timestamptz + make_interval(mins => $3::int),
                    ends_at = $2::timestamptz + make_interval(mins => $3::int + $4::int) where id = $1`,
            [n.id, k.starts_at, offsetMin, lenMin]);
  return { northstar: n.id as string, kestrel: k.id as string };
}

describe('UR-47 the agenda', () => {
  it('Priya sees both schools’ sessions, with the school on each row', async () => {
    await asUser(USERS.teacherModern, async (q) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const rows = await q(AGENDA);
      const schools = new Set(rows.map(r => r.school_name));
      expect(schools).toEqual(new Set(['Northstar Dance Academy', 'Kestrel Ballet School']));
      // Kestrel shares class details; Northstar is the school she is looking at.
      expect(rows.find(r => r.studio_id === KESTREL)).toMatchObject({ class_name: 'Kestrel Contemporary', location: 'Kestrel Hall', detail: 'full' });
      expect(rows.filter(r => r.studio_id === STUDIO_ID).every(r => r.detail === 'full' && r.class_name)).toBe(true);
      const times = rows.map(r => new Date(r.starts_at).getTime());
      expect([...times].sort((a, b) => a - b)).toEqual(times);
    });
  });

  it('Northstar’s default (times only) shows as Busy when Priya is looking at Kestrel', async () => {
    await asUser(USERS.teacherModern, async (q) => {
      await choose(q, USERS.teacherModern, KESTREL);
      const rows = await q(AGENDA);
      const ns = rows.filter(r => r.studio_id === STUDIO_ID);
      expect(ns.length).toBeGreaterThan(0);
      for (const r of ns) {
        expect(r).toMatchObject({ detail: 'busy', class_name: null, location: null, room: null, covering: false, has_handover: false,
                                  school_name: 'Northstar Dance Academy' });
        expect(['scheduled']).toContain(r.status);
      }
      expect(rows.find(r => r.studio_id === KESTREL)?.detail).toBe('full');
    });
  });

  it('a school that opts out is left out entirely; times-only shows Busy', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      await svc(`update studio set staff_timetable_sharing = 'times' where id = $1`, [KESTREL]);
      const busy = (await q(AGENDA)).filter(r => r.studio_id === KESTREL);
      expect(busy.length).toBeGreaterThan(0);
      expect(busy.every(r => r.detail === 'busy' && r.class_name === null)).toBe(true);
      await svc(`update studio set staff_timetable_sharing = 'none' where id = $1`, [KESTREL]);
      expect((await q(AGENDA)).filter(r => r.studio_id === KESTREL)).toHaveLength(0);
      // Looking at Kestrel itself still shows Kestrel in full.
      await choose(q, USERS.teacherModern, KESTREL);
      expect((await q(AGENDA)).find(r => r.studio_id === KESTREL)?.class_name).toBe('Kestrel Contemporary');
    });
  });

  it('Marcus (one school) sees just his own classes, in full, with no school chosen', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const rows = await q(AGENDA);
      const [{ n }] = await svc(`select count(*)::int n from class_session cs join class c on c.id = cs.class_id
                                   join staff_member sm on sm.id in (c.teacher_id, c.assistant_id, cs.teacher_id)
                                  where sm.user_id = $1 and cs.deleted_at is null
                                    and cs.starts_at >= now() and cs.starts_at < now() + interval '14 days'`, [USERS.teacherTap]);
      expect(rows.length).toBe(n);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every(r => r.studio_id === STUDIO_ID && r.detail === 'full' && !r.clash)).toBe(true);
      expect(rows.some(r => /Kestrel|Modern/.test(r.class_name))).toBe(false);
      expect(rows.every(r => r.clash_with === null)).toBe(true);
    });
  });

  it('flags a clash between schools, counting the teacher’s own travel time', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      // Northstar class ends 10 minutes before Kestrel starts: a clash with 30 minutes' travel.
      const { northstar, kestrel } = await priyaNorthstarNear(svc, -55, 45);
      await choose(q, USERS.teacherModern, STUDIO_ID);
      let rows = await q(AGENDA);
      expect(rows.find(r => r.session_id === northstar)).toMatchObject({ clash: true, clash_with: 'Kestrel Ballet School' });
      expect(rows.find(r => r.session_id === kestrel)).toMatchObject({ clash: true, clash_with: 'Northstar Dance Academy' });
      await q(`select app.set_agenda_travel(5)`);
      expect((await q(`select app.my_agenda_travel() m`))[0].m).toBe(5);
      rows = await q(AGENDA);
      expect(rows.find(r => r.session_id === northstar)?.clash).toBe(false);
      expect(await expectRejected(() => q(`select app.set_agenda_travel(999)`))).toMatch(/INVALID/);
      // A cancelled session never clashes.
      await q(`select app.set_agenda_travel(30)`);
      await svc(`update class_session set status = 'cancelled' where id = $1`, [kestrel]);
      rows = await q(AGENDA);
      expect(rows.find(r => r.session_id === northstar)?.clash).toBe(false);
      expect(rows.find(r => r.session_id === kestrel)).toMatchObject({ status: 'cancelled', clash: false });
    });
  });

  it('a clash inside one school is flagged without naming a school', async () => {
    await asUser(USERS.teacherModern, async (q) => {
      // Seeded: Modern Juniors 16:00–16:45 and covering Junior Tap 16:30 on the same Tuesday (D5).
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const tue = (await q(AGENDA)).filter(r => r.class_name === 'Modern Juniors' && r.clash);
      expect(tue.length).toBeGreaterThan(0);
      expect(tue[0].clash_with).toBeNull();
    });
  });

  it('a busy-only row still clashes, but says only the school', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      const { northstar } = await priyaNorthstarNear(svc, 15, 30);
      await choose(q, USERS.teacherModern, KESTREL);
      const rows = await q(AGENDA);
      const ns = rows.find(r => r.session_id === northstar);
      expect(ns).toMatchObject({ detail: 'busy', class_name: null, clash: true, clash_with: 'Kestrel Ballet School' });
    });
  });
});

describe('UR-47 nothing else crosses', () => {
  it('returns no student, family, medical or other-teacher columns', async () => {
    await asUser(USERS.teacherModern, async (q) => {
      const [{ cols }] = await q(`select pg_get_function_result('app.my_agenda(timestamptz, timestamptz)'::regprocedure) cols`);
      expect(cols).not.toMatch(/student|child|family|guardian|medical|allerg|condition|enrol|attendance|teacher|covered_by|note/i);
      const rows = await q(AGENDA);
      const keys = Object.keys(rows[0]);
      expect(keys.sort()).toEqual(['class_name', 'clash', 'clash_with', 'covering', 'detail', 'ends_at', 'has_handover', 'location',
                                   'room', 'school_name', 'session_id', 'starts_at', 'status', 'studio_id'].sort());
    });
  });

  it('the internal reader that trusts a user id cannot be called', async () => {
    await asUser(USERS.teacherTap, async (q) => {
      expect(await expectRejected(() => q(`select * from app.agenda_rows($1, now(), now() + interval '14 days')`, [USERS.teacherModern])))
        .toMatch(/permission denied/);
      expect(await expectRejected(() => q(`select app.agenda_home($1)`, [USERS.teacherModern]))).toMatch(/permission denied/);
      // Marcus's own agenda has none of Priya's sessions.
      expect((await q(AGENDA)).some(r => r.studio_id === KESTREL)).toBe(false);
    });
  });

  it('an owner at the other school, and the office, see nothing of Priya’s', async () => {
    await asUser(ELENA, async (q) => {
      expect(await q(AGENDA)).toHaveLength(0);
      expect(await q(`select 1 from class_session cs join class c on c.id = cs.class_id where c.studio_id = $1`, [STUDIO_ID])).toHaveLength(0);
    });
    await asUser(USERS.admin, async (q) => {
      expect(await q(`select 1 from class_session where studio_id = $1`, [KESTREL])).toHaveLength(0);
      expect(await q(AGENDA)).toHaveLength(0);   // Nadia teaches nothing
    });
  });

  it('every other path still keeps Kestrel out while Priya is at Northstar', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      for (const t of ['class_session', 'class', 'student', 'enrolment', 'family', 'location']) {
        expect(await q(`select 1 from ${t} where studio_id = $1`, [KESTREL])).toHaveLength(0);
      }
      const [s] = await q(`select app.session_access($1) a`, [(await nextKestrel(svc)).id]);
      expect(s.a).toBe('not_yours');
      expect(await q(T.REGISTER, [(await nextKestrel(svc)).id])).toHaveLength(0);
      // And the office tools at Kestrel are not hers.
      const k = (await q(AGENDA)).find(r => r.studio_id === KESTREL);
      expect(await expectRejected(() => q(`select * from app.cover_clashes($1, $2)`, [k.session_id, uid(NS.staff, 190)])))
        .toMatch(/FORBIDDEN/);
    });
  });

  it('only the owner chooses what the school shares', async () => {
    await asUser(USERS.admin, async (q) => {
      expect(await expectRejected(() => q(`select app.set_timetable_sharing($1, 'none')`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
    });
    await asUser(ELENA, async (q) => {
      expect(await expectRejected(() => q(`select app.set_timetable_sharing($1, 'details')`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
    });
    await asUser(USERS.owner, async (q, svc) => {
      await q(`select app.set_timetable_sharing($1, 'none')`, [STUDIO_ID]);
      expect((await svc(`select staff_timetable_sharing s from studio where id = $1`, [STUDIO_ID]))[0].s).toBe('none');
      expect(await expectRejected(() => q(`select app.set_timetable_sharing($1, 'everything')`, [STUDIO_ID]))).toMatch(/INVALID/);
    });
  });
});

describe('UR-47 cover check sees other schools as busy', () => {
  /** A Junior Tap session moved on top of Priya's next Kestrel class. */
  async function tapOnKestrel(svc: Q) {
    const k = await nextKestrel(svc);
    const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now() and teacher_id is null
                             and status = 'scheduled' order by starts_at limit 1`, [CLASS.juniorTap]);
    await svc(`update class_session set starts_at = $2::timestamptz - interval '15 minutes', ends_at = $2::timestamptz + interval '30 minutes'
                where id = $1`, [s.id, k.starts_at]);
    const [p] = await svc(`select id from staff_member where user_id = $1 and studio_id = $2`, [USERS.teacherModern, STUDIO_ID]);
    // Make sure no Northstar class of Priya's is near, so only Kestrel can clash.
    await svc(`update class_session cs set status = 'cancelled' from class c
                where c.id = cs.class_id and c.teacher_id = $1 and cs.starts_at between $2::timestamptz - interval '4 hours' and $2::timestamptz + interval '4 hours'`,
              [p.id, k.starts_at]);
    return { session: s.id as string, priya: p.id as string };
  }

  it('warns of a cross-school overlap without naming the class, school or place', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { session, priya } = await tapOnKestrel(svc);
      const clashes = await q(`select * from app.cover_clashes($1, $2)`, [session, priya]);
      expect(clashes).toHaveLength(1);
      expect(clashes[0]).toMatchObject({ session_id: null, class_name: 'Busy at another school', location: null, needs_travel: true });
      const msg = await expectRejected(() => q(`select app.cover_session($1, $2)`, [session, priya]));
      expect(msg).toMatch(/CLASH: Priya Raman is busy at another school/);
      expect(msg).not.toMatch(/Kestrel|Contemporary|Hall/);
      await q(`select app.cover_session($1, $2, null, false, null, true)`, [session, priya]);   // the office may still assign
    });
  });

  it('uses the teacher’s own travel time between schools', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { session, priya } = await tapOnKestrel(svc);
      const k = await nextKestrel(svc);
      // Ends 20 minutes before Kestrel: clashes with the default 30, not with 10.
      await svc(`update class_session set starts_at = $2::timestamptz - interval '65 minutes', ends_at = $2::timestamptz - interval '20 minutes' where id = $1`,
                [session, k.starts_at]);
      expect(await q(`select 1 from app.cover_clashes($1, $2)`, [session, priya])).toHaveLength(1);
      await svc(`update user_account set agenda_travel_min = 10 where id = $1`, [USERS.teacherModern]);
      expect(await q(`select 1 from app.cover_clashes($1, $2)`, [session, priya])).toHaveLength(0);
    });
  });

  it('a school that opts out is not checked at all', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { session, priya } = await tapOnKestrel(svc);
      await svc(`update studio set staff_timetable_sharing = 'none' where id = $1`, [KESTREL]);
      expect(await q(`select * from app.cover_clashes($1, $2)`, [session, priya])).toHaveLength(0);
      await q(`select app.cover_session($1, $2)`, [session, priya]);
    });
  });
});

describe('UR-47 calendar link across schools', () => {
  it('stays one school until asked, then adds the others as each allows', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await choose(q, USERS.teacherModern, STUDIO_ID);
      const [{ t }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      const feed = (tok: string) => svc(`select * from app.calendar_feed($1)`, [tok]);
      const one = await feed(t);
      expect(one.some(r => /Kestrel/.test(r.title))).toBe(false);
      expect(one[0].calendar_name).toBe('Northstar Dance Academy');

      await q(`select app.set_calendar_all_schools($1, true)`, [STUDIO_ID]);
      const all = await feed(t);
      expect(all.length).toBeGreaterThan(one.length);
      expect(all.find(r => /Kestrel Contemporary/.test(r.title))).toMatchObject({
        title: 'Kestrel Contemporary — Kestrel Ballet School', location: expect.stringMatching(/Kestrel Hall, Kestrel Ballet School/),
        calendar_name: 'Teaching, all schools' });
      expect(all.find(r => !/Kestrel/.test(r.title))?.location).toMatch(/Northstar Dance Academy$/);

      await svc(`update studio set staff_timetable_sharing = 'times' where id = $1`, [KESTREL]);
      const busy = (await feed(t)).filter(r => /Kestrel/.test(r.title));
      expect(busy.length).toBeGreaterThan(0);
      expect(busy.every(r => r.title === 'Busy — Kestrel Ballet School' && r.location === 'Kestrel Ballet School')).toBe(true);

      await svc(`update studio set staff_timetable_sharing = 'none' where id = $1`, [KESTREL]);
      expect((await feed(t)).some(r => /Kestrel/.test(r.title))).toBe(false);

      // A new link keeps the choice.
      const [{ t: t2 }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      expect((await svc(`select all_schools from calendar_token where token = $1`, [t2]))[0].all_schools).toBe(true);
    });
  });

  it('families cannot turn it on, and Marcus’s feed is unchanged by it', async () => {
    await asUser(USERS.guardianA, async (q) => {
      expect(await expectRejected(() => q(`select app.set_calendar_all_schools($1, true)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
    });
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [{ t }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      const before = await svc(`select uid from app.calendar_feed($1)`, [t]);
      await q(`select app.set_calendar_all_schools($1, true)`, [STUDIO_ID]);
      const after = await svc(`select uid from app.calendar_feed($1)`, [t]);
      expect(after.map(r => r.uid).sort()).toEqual(before.map(r => r.uid).sort());
    });
  });
});
