import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID, FAMILY } from './helpers';
import { REGISTER } from '../src/lib/repos/teaching';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const nextDropIn = async (svc: any, n = 0) => (await svc(`select d.session_id from app.drop_in_sessions($1) d order by d.starts_at offset $2 limit 1`, [STUDIO_ID, n]))[0].session_id;

describe('drop-in and packs (R-034)', () => {
  it('an adult books from the public page, is invoiced, and is on the teacher’s register', async () => {
    await asUser(null as any, async (q, svc) => {
      const s = await nextDropIn(svc);
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify({
        name: 'Maya Fernandes', email: 'maya@example.com', phone: '07700 900321', emergency_name: 'Leo', emergency_phone: '07700 900322' })]);
      const [b] = await svc(`select d.student_id, d.invoice_id, d.price_minor, f.name from drop_in_booking d join student st on st.id = d.student_id
                              join family f on f.id = st.family_id where d.session_id = $1`, [s]);
      expect(b).toMatchObject({ price_minor: 1200, name: 'Fernandes (adult)' });
      expect(b.invoice_id).toBeTruthy();
      await as(svc, USERS.teacherModern);
      expect((await q(REGISTER, [s])).some((r: any) => r.student_id === b.student_id)).toBe(true);
    });
  });

  it('a pack pays for classes until it runs out; cancelling in time gives the class back', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await q(`select id from student order by date_of_birth limit 1`);
      const [pack] = await q(`select id from class_pack where classes = 5`);
      await q(`select app.buy_pack($1, $2)`, [pack.id, kid.id]);
      const [inv] = await q(`select i.total_minor from invoice i join invoice_item it on it.invoice_id = i.id where it.description like '5-class pack%'`);
      expect(Number(inv.total_minor)).toBe(5000);
      const s1 = await nextDropIn(svc, 1);
      const [{ r }] = await q(`select app.book_drop_in($1, $2) r`, [s1, kid.id]);
      expect(r).toMatchObject({ paid_with: 'pack', pack_left: 4 });
      expect(await expectRejected(() => q(`select app.book_drop_in($1, $2)`, [s1, kid.id]))).toMatch(/already booked/);
      const [bk] = await q(`select id from drop_in_booking where session_id = $1 and student_id = $2`, [s1, kid.id]);
      expect((await q(`select app.cancel_drop_in($1) r`, [bk.id]))[0].r).toBe('refunded');
      expect((await q(`select remaining from pack_purchase where student_id = $1`, [kid.id]))[0].remaining).toBe(5);
    });
  });

  it('term classes cannot be dropped into, and nobody books for someone else’s child', async () => {
    await asUser(USERS.guardianB, async (q, svc) => {
      const [termSession] = await svc(`select id from class_session where class_id = $1 and starts_at > now() limit 1`, [CLASS.juniorTap]);
      const [mine] = await q(`select id from student limit 1`);
      expect(await expectRejected(() => q(`select app.book_drop_in($1, $2)`, [termSession.id, mine.id]))).toMatch(/by the term/);
      const [other] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.a]);
      const di = await nextDropIn(svc);
      expect(await expectRejected(() => q(`select app.book_drop_in($1, $2)`, [di, other.id]))).toMatch(/FORBIDDEN/);
      await expectRejected(() => q(`select app.book_drop_in_unchecked($1, $2)`, [di, other.id]));
    });
  });
});

describe('credit when the school cancels a class', () => {
  it('off by default; when on, each enrolled child’s family gets the per-class value once', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const sessions = await svc(`select id from class_session where class_id = $1 and starts_at > now() and status = 'scheduled' order by starts_at limit 2`, [CLASS.juniorTap]);
      await q(`select app.cancel_session($1, 'Hall flooded')`, [sessions[0].id]);
      expect(await svc(`select 1 from session_credit`)).toHaveLength(0);
      await svc(`update studio set credit_cancelled_classes = true where id = $1`, [STUDIO_ID]);
      await q(`select app.cancel_session($1, 'Teacher unwell')`, [sessions[1].id]);
      const credits = await svc(`select sc.amount_minor, p.method, p.note from session_credit sc join payment p on p.id = sc.payment_id`);
      const [{ n }] = await svc(`select count(*)::int n from enrolment where class_id = $1 and status = 'active'`, [CLASS.juniorTap]);
      expect(credits).toHaveLength(n);
      expect(credits[0].method).toBe('credit');
      expect(credits[0].amount_minor).toBeGreaterThan(0);
      expect(credits[0].note).toMatch(/Junior Tap cancelled/);
    });
  });
});

describe('a family sees its drop-ins', () => {
  it('on its schedule and in its bookings', async () => {
    const F = await import('../src/lib/repos/family');
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await q(`select id from student order by date_of_birth limit 1`);
      const [s] = await q(F.DROP_IN_SESSIONS);
      await q(F.BOOK_DROP_IN, [s.session_id, kid.id]);
      expect((await q(F.MY_DROP_INS)).some((d: any) => d.student_id === kid.id)).toBe(true);
      const sched = await q(F.MY_SCHEDULE, [new Date().toISOString(), new Date(Date.now() + 40 * 864e5).toISOString()]);
      expect(sched.some((r: any) => r.id === s.session_id && r.student_id === kid.id)).toBe(true);
      expect((await q(F.PACKS)).length).toBe(2);
    });
  });
});
