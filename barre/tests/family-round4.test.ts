/* Family screens, round 4 (migration 0060): message privacy for older
   messages, adult-only invitations, booking references and the manage link
   (F5), "your share" for split billing, Coming up and clashes (U7, U8),
   payment history and receipts (F8). */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import * as F from '../src/lib/repos/family';
import * as I from '../src/lib/repos/inbox';
import * as B from '../src/lib/repos/billing';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const as = (svc: Q, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

const NIA = uid(NS.student, 3);
const AMIR = uid(NS.student, 1);
const HANNAH_ROW = uid(NS.guardian, 1);
const INES_ROW = uid(NS.guardian, 2);
const INES = '00000002-0000-4000-8000-0000000000e6';

/** Inês Wright, the second guardian on file, with her own login. */
async function ines(svc: Q) {
  await svc(`insert into user_account (id, email, full_name) values ($1, 'second.wright@example.com', 'Inês Wright')`, [INES]);
  await svc(`insert into membership (user_id, studio_id, role) values ($1, $2, 'guardian')`, [INES, STUDIO_ID]);
  await svc(`update guardian set user_id = $1 where id = $2`, [INES, INES_ROW]);
}
const slugOf = async (svc: Q) => (await svc(`select slug from studio where id = $1`, [STUDIO_ID]))[0].slug as string;
const nextDropIn = async (svc: Q, n = 0) =>
  (await svc(`select d.session_id from app.drop_in_sessions($1) d where d.starts_at > now() + interval '30 hours'
               order by d.starts_at offset $2 limit 1`, [STUDIO_ID, n]))[0].session_id as string;

/* ── Legacy message privacy ────────────────────────────────────────────── */
describe('guardian messages stay private however they were stored', () => {
  it('the seeded message from Hannah, and the office reply in her thread, are hidden from her co-parent', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await as(svc, INES);
      const theirs = await q(I.MY_CONVERSATION);
      expect(theirs.map((m: any) => m.subject)).not.toContain('Absence on Monday');
      expect(theirs.some((m: any) => /save her spot/.test(m.body))).toBe(false);
      await as(svc, USERS.guardianA);
      const hers = await q(I.MY_CONVERSATION);
      const absence = hers.find((m: any) => m.subject === 'Absence on Monday');
      expect(absence).toMatchObject({ private: true, mine: true, inbound: true });
      expect(hers.find((m: any) => /save her spot/.test(m.body))).toMatchObject({ private: true, mine: false });
    });
  });

  it('a sender filled in after the row was written (an import or a correction) makes it private', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      const [{ id }] = await svc(`insert into communication (studio_id, kind, channel, family_id, subject, body, inbound)
                                  values ($1, 'direct', 'in_app', $2, 'Imported', 'From the old system', true) returning id`, [STUDIO_ID, FAMILY.a]);
      expect((await svc(`select private_to from communication where id = $1`, [id]))[0].private_to).toBeNull();
      await svc(`update communication set sent_by = $1 where id = $2`, [USERS.guardianA, id]);
      expect((await svc(`select private_to from communication where id = $1`, [id]))[0].private_to).toBe(USERS.guardianA);
      await as(svc, INES);
      expect((await q(I.MY_CONVERSATION)).map((m: any) => m.id)).not.toContain(id);
    });
  });

  it('the office can re-apply the rule to everything stored; replies follow their thread; nobody else may', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      // As a message from before 0046: its sender is known but it was never stamped.
      const [{ id }] = await svc(`insert into communication (studio_id, kind, channel, family_id, subject, body, inbound, sent_by)
                                  values ($1, 'direct', 'in_app', $2, 'Old', 'Before private messages', true, $3) returning id`,
                                 [STUDIO_ID, FAMILY.a, USERS.guardianA]);
      const [{ id: reply }] = await svc(`insert into communication (studio_id, kind, channel, family_id, body, inbound, sent_by)
                                  values ($1, 'direct', 'in_app', $2, 'Old reply', false, $3) returning id`, [STUDIO_ID, FAMILY.a, USERS.admin]);
      await svc(`update communication set private_to = null where id = $1`, [id]);
      await svc(`update communication set reply_to = $1 where id = $2`, [id, reply]);
      await svc(`update communication set private_to = null where id = $1`, [reply]);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(`select app.restamp_message_privacy($1)`, [STUDIO_ID]))).toMatch(/only the office/);
      await as(svc, USERS.admin);
      const [{ n }] = await q(`select app.restamp_message_privacy($1) n`, [STUDIO_ID]);
      expect(n).toBeGreaterThanOrEqual(2);
      const rows = await svc(`select id, private_to from communication where id = any($1::uuid[])`, [[id, reply]]);
      expect(rows.every((r: any) => r.private_to === USERS.guardianA)).toBe(true);
    });
  });

  it('messages the studio sends to the whole family still reach both parents', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await as(svc, USERS.admin);
      const [{ id }] = await q(B.SEND_DIRECT, [FAMILY.a, 'Show tickets', 'Tickets go on sale on Monday.']);
      await as(svc, INES);
      expect((await q(I.MY_CONVERSATION)).find((m: any) => m.id === id)).toMatchObject({ private: false });
    });
  });
});

/* ── U12 · Invitations for an adult on their own ───────────────────────── */
describe('an adult on their own is invited to their own bookings (U12)', () => {
  it('says adult_only and never shows the "(adult)" family name', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc);
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify({
        name: 'Gareth Hughes', email: 'gareth@example.com', phone: '07700 900333', emergency_phone: '07700 900334',
        privacy_ack: true, adult_confirm: true })]);
      const [{ family_id }] = await svc(`select family_id from guardian where email = 'gareth@example.com'`);
      await as(svc, USERS.admin);
      const [{ t }] = await q(`select app.create_invitation($1, 'gareth@example.com', 'guardian', null, $2, null) t`, [STUDIO_ID, family_id]);
      const [{ t: t2 }] = await q(`select app.create_invitation($1, 'someone.new@example.com', 'guardian', null, $2, null) t`, [STUDIO_ID, FAMILY.a]);
      await as(svc, null);
      const [p] = await q(`select * from app.invitation_preview($1)`, [t]);
      expect(p).toMatchObject({ adult_only: true, family_name: 'Hughes' });
      const [p2] = await q(`select * from app.invitation_preview($1)`, [t2]);
      expect(p2.adult_only).toBe(false);
    });
  });
});

/* ── F5 · Booking references and the manage link ───────────────────────── */
describe('booking reference, calendar and manage link (F5)', () => {
  it('a public trial gets a reference and a link that shows and cancels it, once', async () => {
    await asUser(null, async (q, svc) => {
      const slug = await slugOf(svc);
      const [slot] = await q(`select * from app.public_trial_sessions($1) where starts_at > now() + interval '2 hours' order by starts_at limit 1`, [slug]);
      const [{ dob }] = await svc(`select to_char(current_date - make_interval(years => $1) - interval '1 month', 'YYYY-MM-DD') dob`, [slot.age_min ?? 9]);
      const form = { contact_name: 'Ruth Evans', contact_email: 'ruth@example.com', contact_phone: '07700 900444', child_name: 'Maya Evans',
        child_dob: dob, privacy_ack: true, has_medical: 'no', photo_consent: 'true' };
      const [{ r }] = await q(`select app.public_book_trial_ref($1, $2, $3::jsonb) r`, [slug, slot.session_id, JSON.stringify(form)]);
      expect(r.result).toBe('ok');
      expect(r.reference).toMatch(/^T-[0-9A-F]{6}$/);
      expect(r.token).toMatch(/^[0-9a-f]{64}$/);
      // The same details again (a double click, a moment later) give the reference, but no second link.
      await svc(`update trial set created_at = created_at - interval '1 minute' where session_id = $1`, [slot.session_id]);
      const [{ r: again }] = await q(`select app.public_book_trial_ref($1, $2, $3::jsonb) r`, [slug, slot.session_id, JSON.stringify(form)]);
      expect(again.reference).toBe(r.reference);
      expect(again.token).toBeNull();

      const [b] = await q(`select * from app.public_booking($1)`, [r.token]);
      expect(b).toMatchObject({ reference: r.reference, kind: 'trial', status: 'booked', dancer: 'Maya', can_cancel: true });
      expect(await q(`select * from app.public_booking('not-a-token')`)).toHaveLength(0);
      // The link table is not readable by anyone directly.
      expect(await expectRejected(() => q(`select * from booking_link`))).toMatch(/permission denied/);

      const [{ c }] = await q(`select app.public_cancel_booking($1) c`, [r.token]);
      expect(c).toBe('cancelled');
      expect((await q(`select status, can_cancel from app.public_booking($1)`, [r.token]))[0]).toMatchObject({ status: 'cancelled', can_cancel: false });
      expect(await expectRejected(() => q(`select app.public_cancel_booking($1)`, [r.token]))).toMatch(/not booked/);
      expect(await expectRejected(() => q(`select app.public_cancel_booking('nope')`))).toMatch(/expired or is not valid/);
      // The office is told.
      expect((await svc(`select count(*)::int n from notification where user_id = $1 and title like 'Trial cancelled: Maya%'`, [USERS.admin]))[0].n).toBe(1);
    });
  });

  it('a public drop-in cancelled more than 24 hours ahead is not charged', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc);
      const [{ r }] = await q(`select app.public_adult_drop_in_ref('northstar', $1, $2::jsonb) r`, [s, JSON.stringify({
        name: 'Priyanka Shah', email: 'priyanka@example.com', phone: '07700 900555', emergency_phone: '07700 900556',
        privacy_ack: true, adult_confirm: true })]);
      expect(r.reference).toMatch(/^D-[0-9A-F]{6}$/);
      const [b] = await q(`select * from app.public_booking($1)`, [r.token]);
      expect(b).toMatchObject({ kind: 'drop_in', dancer: 'Priyanka', can_cancel: true });
      const [{ invoice_id }] = await svc(`select invoice_id from drop_in_booking where session_id = $1 and status <> 'cancelled' order by created_at desc limit 1`, [s]);
      const [{ c }] = await q(`select app.public_cancel_booking($1) c`, [r.token]);
      expect(c).toBe('refunded');
      if (invoice_id) expect((await svc(`select status from invoice where id = $1`, [invoice_id]))[0].status).toBe('void');
    });
  });

  it('a family sees its trials and drop-ins with references, and cancels only its own trial', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc);
      // Hannah books for herself, then a drop-in.
      await as(svc, USERS.guardianA);
      const [{ id: me }] = await q(F.BOOK_FOR_MYSELF, [null, true, 'Inês Wright', '07700 900666']);
      await q(F.BOOK_DROP_IN, [s, me]);
      // A trial for Amir, made by the office.
      const [{ cls, sess }] = await svc(`select c.id cls, cs.id sess from class c join class_session cs on cs.class_id = c.id
          where c.studio_id = $1 and c.deleted_at is null and cs.starts_at > now() + interval '1 day' and cs.status = 'scheduled'
            and c.id not in (select class_id from enrolment where student_id = $2) order by cs.starts_at limit 1`, [STUDIO_ID, AMIR]);
      const [{ id: tid }] = await svc(`insert into trial (studio_id, class_id, session_id, student_id, status) values ($1, $2, $3, $4, 'booked') returning id`,
        [STUDIO_ID, cls, sess, AMIR]);
      const mine = await q(F.MY_BOOKINGS);
      expect(mine.find((b: any) => b.kind === 'drop_in' && b.student_id === me).reference).toMatch(/^D-/);
      expect(mine.find((b: any) => b.kind === 'trial').reference).toBe(`T-${(await svc(`select upper(left(md5($1::text), 6)) x`, [tid]))[0].x}`);

      await as(svc, USERS.guardianB);
      expect(await q(F.MY_BOOKINGS)).not.toContainEqual(expect.objectContaining({ id: tid }));
      expect(await expectRejected(() => q(F.CANCEL_TRIAL, [tid]))).toMatch(/not your booking/);
      await as(svc, USERS.guardianA);
      expect((await q(F.CANCEL_TRIAL, [tid]))[0].r).toBe('cancelled');
      expect((await q(F.MY_BOOKINGS)).some((b: any) => b.id === tid)).toBe(false);
    });
  });
});

/* ── Your share ────────────────────────────────────────────────────────── */
describe('"your share" for a split-billed family', () => {
  it('each guardian sees their own share and what the other covers, never the other’s invoices', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await as(svc, USERS.admin);
      await q(B.SET_FAMILY_BILLING, [FAMILY.a, 'percent', HANNAH_ROW, INES_ROW, 60, null]);
      // An event fee addressed to Inês alone.
      const [ev] = await svc(`select ev.id, ev.title from studio_event ev join event_participant p on p.event_id = ev.id
         where p.student_id = $1 and p.status = 'confirmed' and coalesce(ev.cost_minor, 0) > 0 and ev.kind <> 'private_lesson'
           and ev.starts_at > now() limit 1`, [NIA]);

      await as(svc, USERS.guardianA);
      expect((await q(F.MY_BILLING_SHARE))[0]).toMatchObject({ mode: 'percent', my_pct: 60, other_pct: 40, other_name: 'Inês' });
      const before = await q(B.UPCOMING_COSTS, [null]);
      const terms = before.filter((r: any) => r.kind === 'term' && r.state === 'expected');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every((r: any) => / \(your 60%\)$/.test(r.title))).toBe(true);
      await as(svc, INES);
      expect((await q(F.MY_BILLING_SHARE))[0]).toMatchObject({ my_pct: 40, other_pct: 60, other_name: 'Hannah' });
      const hers = await q(B.UPCOMING_COSTS, [null]);
      const sum = (rows: any[]) => rows.filter((r: any) => r.kind === 'term' && r.state === 'expected').reduce((n: number, r: any) => n + Number(r.amount_minor), 0);
      // The two shares add up to about the whole (rounded per line).
      await as(svc, USERS.admin);
      const whole = sum(await q(B.UPCOMING_COSTS, [FAMILY.a]));
      expect(Math.abs(sum(before) + sum(hers) - whole)).toBeLessThanOrEqual(terms.length);

      expect(ev).toBeTruthy();
      {
        const [{ id: inv, number }] = await svc(`insert into invoice (studio_id, family_id, number, status, issued_on, due_on, total_minor, billed_guardian_id)
            values ($1, $2, 'INV-9001', 'issued', current_date, current_date + 14, 1000, $3) returning id, number`, [STUDIO_ID, FAMILY.a, INES_ROW]);
        await svc(`insert into invoice_item (studio_id, invoice_id, kind, description, quantity, unit_minor, student_id, event_id)
                   values ($1, $2, 'show_fee', $3, 1, 1000, $4, $5)`, [STUDIO_ID, inv, ev.title, NIA, ev.id]);
        await as(svc, USERS.guardianA);
        expect((await q(B.UPCOMING_COSTS, [null])).map((r: any) => r.invoice_number)).not.toContain(number);
        await as(svc, INES);
        expect((await q(B.UPCOMING_COSTS, [null])).map((r: any) => r.invoice_number)).toContain(number);
      }
    });
  });

  it('per child: names whose fees are whose; no share at all for a family that pays together', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await as(svc, USERS.guardianA);
      expect(await q(F.MY_BILLING_SHARE)).toHaveLength(0);
      await as(svc, USERS.admin);
      await q(B.SET_FAMILY_BILLING, [FAMILY.a, 'per_child', HANNAH_ROW, null, null, JSON.stringify({ [AMIR]: INES_ROW })]);
      await as(svc, USERS.guardianA);
      const [s] = await q(F.MY_BILLING_SHARE);
      expect(s.mode).toBe('per_child');
      expect([...s.my_children].sort()).toEqual(['Clara', 'Nia']);
      expect(s.other_children).toEqual(['Amir']);
      expect(s.other_name).toBe('Inês');
      // Amir's class fees are not in Hannah's Coming up.
      expect((await q(B.UPCOMING_COSTS, [null])).some((r: any) => r.student_id === AMIR && ['term', 'month'].includes(r.kind))).toBe(false);
    });
  });
});

/* ── U7 / U8 · Coming up and clashes ───────────────────────────────────── */
describe('Home: Coming up per child, and clashes (U7, U8)', () => {
  it('lists the next show, exam and fee for each of the family’s children only', async () => {
    await asUser(USERS.guardianA, async (q) => {
      const rows = await q(F.MY_COMING_UP);
      expect(rows.length).toBeGreaterThan(0);
      const ids = new Set((await q(F.MY_CHILDREN)).map((c: any) => c.id));
      expect(rows.every((r: any) => ids.has(r.student_id))).toBe(true);
      // At most one of each kind per child.
      const keys = rows.map((r: any) => `${r.student_id}|${r.kind}`);
      expect(new Set(keys).size).toBe(keys.length);
      expect(rows.some((r: any) => r.kind === 'fee')).toBe(true);
      // An exam day Nia has a confirmed place on is her next exam; a competition is her next show.
      expect(rows.find((r: any) => r.student_id === NIA && r.kind === 'exam')?.title).toMatch(/Grade 3/i);
      expect(rows.find((r: any) => r.student_id === NIA && r.kind === 'show')?.state).toBe('competition');
    });
    await asUser(null, async (q) => { expect(await q(F.MY_COMING_UP)).toHaveLength(0); });
  });

  it('a costume still needed shows with its show', async () => {
    await asUser(null, async (q, svc) => {
      const [ev] = await svc(`select id, title from studio_event where studio_id = $1 and kind = 'show' and starts_at > now() and parent_event_id is null order by starts_at limit 1`, [STUDIO_ID]);
      const [{ id: item }] = await svc(`insert into costume_item (studio_id, event_id, name, price_minor) values ($1, $2, 'Blue tutu', 2500) returning id`, [STUDIO_ID, ev.id]);
      await svc(`insert into costume_order (item_id, student_id, status) values ($1, $2, 'needed')`, [item, NIA]);
      await as(svc, USERS.guardianA);
      const c = (await q(F.MY_COMING_UP)).find((r: any) => r.kind === 'costume' && r.student_id === NIA);
      expect(c).toMatchObject({ title: `Blue tutu for ${ev.title}`, detail: 'Still needed' });
    });
  });

  it('a private lesson at the same time as a class is a clash; moved away, it is not', async () => {
    await asUser(null, async (q, svc) => {
      const [cs] = await svc(`select cs.starts_at, cs.ends_at, c.name from class_session cs join class c on c.id = cs.class_id
          join enrolment e on e.class_id = c.id and e.student_id = $1 and e.status = 'active' and e.deleted_at is null
         where cs.starts_at > now() + interval '1 day' and cs.status = 'scheduled' and cs.deleted_at is null order by cs.starts_at limit 1`, [NIA]);
      // Nothing else for Nia at that time in the seed.
      await svc(`update studio_event set deleted_at = now() where kind = 'private_lesson' and student_id = $1`, [NIA]);
      const [{ id: ev }] = await svc(`insert into studio_event (studio_id, kind, status, title, starts_at, ends_at, student_id, cost_minor)
          values ($1, 'private_lesson', 'published', 'Private lesson — Nia', $2::timestamptz + interval '15 minutes', $2::timestamptz + interval '45 minutes', $3, 3000) returning id`,
        [STUDIO_ID, cs.starts_at, NIA]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed')`, [STUDIO_ID, ev, NIA]);
      const from = new Date().toISOString(), to = new Date(Date.now() + 35 * 86400_000).toISOString();
      await as(svc, USERS.guardianA);
      const clashes = (await q(F.MY_CLASHES, [from, to])).filter((c: any) => c.student_id === NIA);
      expect(clashes).toHaveLength(1);
      expect([clashes[0].a_kind, clashes[0].b_kind].sort()).toEqual(['class', 'private_lesson']);
      expect([clashes[0].a_title, clashes[0].b_title]).toContain(cs.name);
      await svc(`update studio_event set starts_at = starts_at + interval '3 hours', ends_at = ends_at + interval '3 hours' where id = $1`, [ev]);
      expect((await q(F.MY_CLASHES, [from, to])).filter((c: any) => c.student_id === NIA)).toHaveLength(0);
      // Another family sees none of Nia's.
      await as(svc, USERS.guardianB);
      expect((await q(F.MY_CLASHES, [from, to])).some((c: any) => c.student_id === NIA)).toBe(false);
    });
  });
});

/* ── F8 · Full history and receipts ────────────────────────────────────── */
describe('payment history and receipts (F8)', () => {
  it('lists every invoice and payment, and a receipt for one of the family’s own payments only', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.guardianA);
      const all = await q(F.MY_ALL_INVOICES);
      const latest = await q(F.MY_INVOICES);
      expect(all.length).toBeGreaterThanOrEqual(latest.length);
      const pays = await q(F.MY_PAYMENTS);
      expect(pays.length).toBeGreaterThan(0);
      expect(pays.every((p: any) => p.succeeded_at)).toBe(true);
      const [r] = await q(F.MY_RECEIPT, [pays[0].id]);
      expect(r).toMatchObject({ reference: pays[0].reference, studio_name: expect.any(String), payer: 'Hannah Wright' });
      await as(svc, USERS.guardianB);
      expect(await q(F.MY_RECEIPT, [pays[0].id])).toHaveLength(0);
      expect((await q(F.MY_PAYMENTS)).some((p: any) => p.id === pays[0].id)).toBe(false);
    });
  });
});
