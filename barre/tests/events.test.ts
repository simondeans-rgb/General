import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);

describe('shows from the office (R-015)', () => {
  it('create, invite classes, families answer, rehearsals reach diaries, fees billed once', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: show }] = await q(`insert into studio_event (studio_id, kind, title, starts_at, venue, cost_minor, requests_open)
        values ($1, 'show', 'Winter Showcase', now() + interval '30 days', 'Greenwich Theatre', 2500, false) returning id`, [STUDIO_ID]);
      const [{ id: reh }] = await q(`insert into studio_event (studio_id, kind, title, starts_at, ends_at, parent_event_id)
        values ($1, 'rehearsal', 'Dress rehearsal', now() + interval '28 days', now() + interval '28 days 2 hours', $2) returning id`, [STUDIO_ID, show]);
      const n = (await q(`select app.invite_classes($1, $2::uuid[]) n`, [show, [CLASS.juniorTap]]))[0].n;
      expect(n).toBeGreaterThan(5);
      expect((await q(`select app.invite_classes($1, $2::uuid[]) n`, [show, [CLASS.juniorTap]]))[0].n).toBe(0);
      await q(`insert into event_routine (event_id, class_id, title, position, costume) values ($1, $2, 'Tap Happy', 1, 'Red waistcoat, black trousers')`, [show, CLASS.juniorTap]);
      await q(`insert into event_chaperone (event_id, name, phone, checked) values ($1, 'Sue Grant', '07700 900111', true)`, [show]);

      // A family in Junior Tap accepts.
      const [p] = await svc(`select p.id, g.user_id from event_participant p join student s on s.id = p.student_id
                              join guardian g on g.family_id = s.family_id and g.user_id is not null where p.event_id = $1 limit 1`, [show]);
      await as(svc, p.user_id);
      expect((await q(`select app.answer_invitation($1, true) r`, [p.id]))[0].r).toBe('confirmed');
      expect(await expectRejected(() => q(`select app.answer_invitation($1, false)`, [p.id]))).toMatch(/already been answered/);
      const mine = await q(`select * from app.my_rehearsals(now(), now() + interval '60 days')`);
      expect(mine.map((r: any) => r.id)).toContain(reh);
      expect(await q(`select 1 from event_chaperone`)).toHaveLength(0);       // phone numbers stay with staff
      expect((await q(`select costume from event_routine where event_id = $1`, [show]))[0].costume).toMatch(/waistcoat/);

      await as(svc, USERS.teacherTap);
      expect((await q(`select * from app.my_rehearsals(now(), now() + interval '60 days')`)).map((r: any) => r.id)).toContain(reh);
      expect(await q(`select 1 from event_chaperone`)).toHaveLength(1);

      await as(svc, USERS.admin);
      expect((await q(`select app.bill_event($1) n`, [show]))[0].n).toBe(1);
      expect((await q(`select app.bill_event($1) n`, [show]))[0].n).toBe(0);
      const [line] = await q(`select kind, unit_minor from invoice_item where event_id = $1`, [show]);
      expect(line).toEqual({ kind: 'show_fee', unit_minor: 2500 });
    });
  });
  it('another family cannot answer for a child that is not theirs', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: ev }] = await q(`insert into studio_event (studio_id, kind, title, starts_at) values ($1, 'workshop', 'Jazz day', now() + interval '10 days') returning id`, [STUDIO_ID]);
      await q(`select app.invite_classes($1, $2::uuid[])`, [ev, [CLASS.grade3Ballet]]);
      const [p] = await svc(`select p.id from event_participant p join student s on s.id = p.student_id
                              where p.event_id = $1 and s.family_id not in (select family_id from guardian where user_id = $2) limit 1`, [ev, USERS.guardianB]);
      await as(svc, USERS.guardianB);
      expect(await expectRejected(() => q(`select app.answer_invitation($1, true)`, [p.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('the events screen’s queries', () => {
  it('create, list, routines in order, rehearsal, chaperone', async () => {
    const E = await import('../src/lib/repos/events');
    await asUser(USERS.owner, async q => {
      const [{ id }] = await q(E.CREATE_EVENT, ['show', 'published', 'Spring Show', '', new Date(Date.now() + 9e8).toISOString(), null, 'Hall', 1500, null, null, false]);
      expect((await q(E.EVENTS)).some((e: any) => e.id === id)).toBe(true);
      for (const t of ['Opening', 'Tap number', 'Finale']) await q(E.ADD_ROUTINE, [id, null, t, '']);
      let r = await q(E.ROUTINES, [id]);
      await q(E.MOVE_ROUTINE, [r[2].id, -1]);
      r = await q(E.ROUTINES, [id]);
      expect(r.map((x: any) => x.title)).toEqual(['Opening', 'Finale', 'Tap number']);
      await q(E.ADD_REHEARSAL, [id, 'Tech run', new Date(Date.now() + 8e8).toISOString(), null, null]);
      expect(await q(E.REHEARSALS, [id])).toHaveLength(1);
      expect((await q(E.EVENTS)).some((e: any) => e.title === 'Tech run')).toBe(false);
      await q(E.ADD_CHAPERONE, [id, 'Sam', '0770', null, true]);
      expect(await q(E.CHAPERONES, [id])).toHaveLength(1);
      await q(E.UPDATE_EVENT, [id, 'show', 'published', 'Spring Showcase', '', new Date(Date.now() + 9e8).toISOString(), null, 'Hall', 1500, 100, null, true]);
    });
  });
});
