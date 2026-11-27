/* Money follow-ons from the panel review (migration 0052):
   UR-52 moves with an effective date, UR-56 credit for reported absences,
   UR-17 split billing between guardians. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import * as B from '../src/lib/repos/billing';
import * as C from '../src/lib/repos/classes';
import * as F from '../src/lib/repos/family';
import { REGISTER } from '../src/lib/repos/teaching';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const as = (svc: Q, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

const NIA = uid(NS.student, 3);                 // Wright family, 9
const CLARA = uid(NS.student, 2);
const AMIR = uid(NS.student, 1);
const NIA_GRADE3 = uid(NS.enrolment, 34);       // Nia's place in Grade 3 Ballet (Wednesdays)
const NIA_MODERN = uid(NS.enrolment, 70);       // joined Modern Juniors on 5 Nov
const GRADE3 = uid(NS.class, 4);
const SATURDAY = uid(NS.class, 12);             // Saturday Ballet Grade 1, places free
const HANNAH_ROW = uid(NS.guardian, 1);
const INES_ROW = uid(NS.guardian, 2);
const INES = '00000002-0000-4000-8000-0000000000e5';

const day = async (q: Q, offset: number) => (await q(`select (current_date + $1::int)::text d`, [offset]))[0].d as string;
/** The last session of a class before a day, and the first on or after it. */
const before = async (q: Q, cls: string, d: string) =>
  (await q(`select id from class_session where class_id = $1 and deleted_at is null and starts_at::date < $2::date
             order by starts_at desc limit 1`, [cls, d]))[0].id as string;
const onOrAfter = async (q: Q, cls: string, d: string, skip = 0) =>
  (await q(`select id from class_session where class_id = $1 and deleted_at is null and starts_at::date >= $2::date
             order by starts_at offset $3 limit 1`, [cls, d, skip]))[0].id as string;
const onRegister = async (q: Q, session: string, student = NIA) =>
  (await q(REGISTER, [session])).some((r: any) => r.student_id === student);
const termId = async (q: Q) =>
  (await q(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]))[0].id as string;
/** Date the seeded "Termly tuition" invoices last term, so this term's runs include their families. */
const commitFree = (svc: Q) => svc(`update invoice set issued_on = issued_on - 120, due_on = due_on - 120
                                     where number between 'INV-1041' and 'INV-1070'`);
const flush = (q: Q) => q('set constraints all immediate');

/* ── UR-52 ─────────────────────────────────────────────────────────────── */
describe('moving class has an effective date (UR-52)', () => {
  it('today by default: registers before today keep the child in the old class, from today the new one', async () => {
    await asUser(USERS.admin, async q => {
      const today = await day(q, 0);
      const [{ id: placed }] = await q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, null]);
      const [old] = await q(`select status, ended_on::text, moved_to from enrolment where id = $1`, [NIA_GRADE3]);
      expect(old).toEqual({ status: 'left', ended_on: today, moved_to: placed });
      const [nw] = await q(`select status, started_on::text, moved_from from enrolment where id = $1`, [placed]);
      expect(nw).toEqual({ status: 'active', started_on: today, moved_from: NIA_GRADE3 });

      expect(await onRegister(q, await before(q, GRADE3, today))).toBe(true);
      expect(await onRegister(q, await onOrAfter(q, GRADE3, today))).toBe(false);
      expect(await onRegister(q, await before(q, SATURDAY, today))).toBe(false);
      expect(await onRegister(q, await onOrAfter(q, SATURDAY, today))).toBe(true);
    });
  });

  it('a future date plans the move: nothing changes until the day, then the tick completes it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const on = await day(q, 8);
      const [{ id: placed }] = await q(C.TRANSFER, [NIA_GRADE3, SATURDAY, 'Moving up', on]);
      const [old] = await q(`select status, ended_on::text from enrolment where id = $1`, [NIA_GRADE3]);
      expect(old).toEqual({ status: 'active', ended_on: on });

      expect(await onRegister(q, await before(q, GRADE3, on))).toBe(true);
      expect(await onRegister(q, await onOrAfter(q, GRADE3, on))).toBe(false);
      expect(await onRegister(q, await before(q, SATURDAY, on))).toBe(false);
      expect(await onRegister(q, await onOrAfter(q, SATURDAY, on))).toBe(true);

      // The office sees it on the record and the class list.
      const places = await q(C.STUDENT_PLACES, [NIA]);
      expect(places.find((p: any) => p.enrolment_id === NIA_GRADE3).leaving_on).toBeTruthy();
      expect(places.find((p: any) => p.enrolment_id === placed).joining_on).toBeTruthy();
      expect((await q(C.CLASS_ROSTER, [GRADE3])).find((r: any) => r.id === NIA).leaving_to).toBe('Saturday Ballet Grade 1');
      // One move at a time.
      expect(await expectRejected(() => q(C.TRANSFER, [NIA_GRADE3, uid(NS.class, 11), null, null]))).toMatch(/already planned/);

      // The day comes.
      await svc(`update enrolment set ended_on = current_date where id = $1`, [NIA_GRADE3]);
      await svc(`update enrolment set started_on = current_date where id = $1`, [placed]);
      expect((await svc(`select app.complete_class_moves() n`))[0].n).toBe(1);
      expect((await q(`select status from enrolment where id = $1`, [NIA_GRADE3]))[0].status).toBe('left');
      expect((await svc(`select summary from audit_log where entity_id = $1 and action = 'move'`, [NIA_GRADE3])).map((r: any) => r.summary).join('|'))
        .toMatch(/took effect/);
    });
  });

  it('a planned move can be called off before the day', async () => {
    await asUser(USERS.admin, async q => {
      const [{ id: placed }] = await q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, await day(q, 8)]);
      await q(C.CANCEL_MOVE, [placed]);
      expect((await q(`select status, ended_on, moved_to from enrolment where id = $1`, [NIA_GRADE3]))[0])
        .toEqual({ status: 'active', ended_on: null, moved_to: null });
      expect((await q(`select status from enrolment where id = $1`, [placed]))[0].status).toBe('cancelled');
    });
  });

  it('a past date is for the office only, within the current term, and not before the child joined', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, '2026-11-01']))).toMatch(/FORBIDDEN|only the office/);
    });
    await asUser(USERS.admin, async (q, svc) => {
      const termStart = (await q(`select app.current_term_start($1)::text d`, [STUDIO_ID]))[0].d;
      expect(await expectRejected(() => q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, '2026-09-01'])))
        .toMatch(/only to the start of this term/);
      expect(await expectRejected(() => q(C.TRANSFER, [NIA_MODERN, SATURDAY, null, termStart])))
        .toMatch(/only joined Modern Juniors/);

      const on = await day(q, -7);
      await q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, on]);
      expect(await onRegister(q, await before(q, GRADE3, on))).toBe(true);
      expect(await onRegister(q, await onOrAfter(q, GRADE3, on))).toBe(false);
      expect(await onRegister(q, await onOrAfter(q, SATURDAY, on))).toBe(true);
      expect((await svc(`select summary from audit_log where entity_id = $1 and action = 'move'`, [NIA_GRADE3]))[0].summary)
        .toMatch(/back-dated/);
    });
  });

  it('the old class’s teacher still sees the child on registers before a back-dated move', async () => {
    await asUser(null, async (q, svc) => {
      const CLARA_TAP = uid(NS.enrolment, 48), JUNIOR_TAP = uid(NS.class, 5), MODERN = uid(NS.class, 7);
      await as(svc, USERS.admin);
      const on = await day(q, -7);
      await q(C.TRANSFER, [CLARA_TAP, MODERN, null, on]);
      await as(svc, USERS.teacherTap);
      expect(await onRegister(q, await before(q, JUNIOR_TAP, on), CLARA)).toBe(true);
      expect(await onRegister(q, await onOrAfter(q, JUNIOR_TAP, on), CLARA)).toBe(false);
      await as(svc, USERS.teacherModern);
      expect(await onRegister(q, await onOrAfter(q, MODERN, on), CLARA)).toBe(true);
    });
  });

  it('the bill: a pro-rata note before the move, and runs bill each class up to or from the date', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await commitFree(svc);
      const on = await day(q, 7);
      const [p] = await q(C.MOVE_PREVIEW, [NIA_GRADE3, SATURDAY, on]);
      expect(p.from_total).toBe(13);
      expect(p.note).toMatch(/Planned for/);
      expect(p.note).toMatch(/Saturday Ballet Grade 1 pro rata: \d+ of \d+ classes, £/);

      await q(C.TRANSFER, [NIA_GRADE3, SATURDAY, null, on]);
      const lines = (await q(B.BILLING_LINES, [await termId(q), null, null])).filter((l: any) => l.student_id === NIA);
      const g3 = lines.find((l: any) => l.class_id === GRADE3);
      const sat = lines.find((l: any) => l.class_id === SATURDAY);
      expect(g3.description).toMatch(/of 13 classes until/);
      expect(sat.description).toMatch(/classes from/);
      expect(g3.unit_minor).toBeLessThan(6300);
      expect(sat.unit_minor).toBeLessThan(5400);
    });
  });
});

/* ── UR-56 ─────────────────────────────────────────────────────────────── */
describe('credit for reported absences (UR-56)', () => {
  const report = (q: Q, session: string, note = 'Dentist') =>
    q(`select app.report_absence($1, array[$2]::uuid[], $3) n`, [NIA, session, note]);
  const reportId = async (q: Q, session: string) =>
    (await q(`select id from absence_report where session_id = $1 and student_id = $2 and status = 'active'`, [session, NIA]))[0].id;
  const balance = async (q: Q) => Number((await q(F.MY_BALANCE))[0].balance_minor);
  const setPolicy = (q: Q, mode: string, fixed = 0) => q(B.SET_ABSENCE_CREDIT, [STUDIO_ID, mode, fixed]);

  it('off by default: a report gives no credit', async () => {
    await asUser(USERS.guardianA, async q => {
      const s = await onOrAfter(q, GRADE3, await day(q, 1));
      await report(q, s);
      expect(await q(`select 1 from absence_credit`)).toHaveLength(0);
    });
  });

  it('per-session price: credit once per child per session, shown to the parent and to finance, taken back on withdrawal', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.owner);
      await setPolicy(q, 'session');
      await as(svc, USERS.guardianA);
      const s = await onOrAfter(q, GRADE3, await day(q, 1));
      expect(await balance(q)).toBe(0);
      await report(q, s);
      await report(q, s, 'Dentist, then home');            // the same session again: no second credit
      const credits = await q(`select amount_minor, status from absence_credit where student_id = $1`, [NIA]);
      expect(credits).toEqual([{ amount_minor: Math.round(6300 / 13), status: 'active' }]);
      expect(await balance(q)).toBe(-485);
      expect((await q(`select credit_minor from app.absence_options($1, 42) where session_id = $2`, [NIA, s]))[0].credit_minor).toBe(485);

      await as(svc, USERS.admin);
      const fin = await q(B.ABSENCE_CREDITS);
      expect(fin[0]).toMatchObject({ family_id: FAMILY.a, child: 'Nia', amount_minor: 485, status: 'active' });
      expect((await q(B.FAMILY_STATEMENT, [FAMILY.a])).some((l: any) => l.kind === 'credit' && /Absence credit: Nia/.test(l.detail))).toBe(true);

      await as(svc, USERS.guardianA);
      await q(`select app.withdraw_absence($1)`, [await reportId(q, s)]);
      expect((await q(`select status from absence_credit where student_id = $1`, [NIA]))[0].status).toBe('reversed');
      expect(await balance(q)).toBe(0);
      // Reported again later: credited again, still only once at a time.
      await report(q, s);
      expect(await q(`select 1 from absence_credit where student_id = $1 and status = 'active'`, [NIA])).toHaveLength(1);
    });
  });

  it('credit already spent on an invoice is taken back from that invoice', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.owner);
      await setPolicy(q, 'session');
      const [{ id: inv }] = await q(B.CREATE_INVOICE, [FAMILY.a, JSON.stringify([{ kind: 'workshop', description: 'Workshop', unit_minor: 1000 }]), null, null, 0, true]);
      await as(svc, USERS.guardianA);
      const s = await onOrAfter(q, GRADE3, await day(q, 1));
      await report(q, s);
      expect(Number((await svc(`select paid_minor from invoice where id = $1`, [inv]))[0].paid_minor)).toBe(485);
      expect(await balance(q)).toBe(1000 - 485);
      await q(`select app.withdraw_absence($1)`, [await reportId(q, s)]);
      expect(Number((await svc(`select paid_minor from invoice where id = $1`, [inv]))[0].paid_minor)).toBe(0);
      expect(await balance(q)).toBe(1000);
    });
  });

  it('a fixed amount, and make-ups or credit, never both', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.owner);
      await q(`update studio set makeup_policy = 'cancelled_and_absence' where id = $1`, [STUDIO_ID]);
      await setPolicy(q, 'fixed', 300);
      expect((await q(B.ABSENCE_CREDIT_SETTING))[0]).toMatchObject({ absence_credit: 'fixed', makeup_policy: 'cancelled' });

      await as(svc, USERS.guardianA);
      const s = await onOrAfter(q, GRADE3, await day(q, 1));
      await report(q, s);
      expect((await q(`select amount_minor from absence_credit where student_id = $1`, [NIA]))[0].amount_minor).toBe(300);
      expect(await q(`select 1 from makeup_offer where student_id = $1`, [NIA])).toHaveLength(0);

      // Choosing make-ups for absences switches the credit off.
      await as(svc, USERS.owner);
      await q(`update studio set makeup_policy = 'cancelled_and_absence' where id = $1`, [STUDIO_ID]);
      expect((await q(B.ABSENCE_CREDIT_SETTING))[0]).toMatchObject({ absence_credit: 'off', makeup_policy: 'cancelled_and_absence' });
      await as(svc, USERS.guardianA);
      const s2 = await onOrAfter(q, GRADE3, await day(q, 1), 1);
      await report(q, s2);
      expect(await q(`select 1 from absence_credit where session_id = $1`, [s2])).toHaveLength(0);
      expect(await q(`select 1 from makeup_offer where from_session_id = $1`, [s2])).toHaveLength(1);
    });
  });

  it('a class later cancelled does not credit the same child twice', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.owner);
      await setPolicy(q, 'session');
      await q(`update studio set credit_cancelled_classes = true where id = $1`, [STUDIO_ID]);
      await as(svc, USERS.guardianA);
      const s = await onOrAfter(q, GRADE3, await day(q, 1));
      await report(q, s);
      await as(svc, USERS.admin);
      await q(`select app.cancel_session($1, 'Teacher unwell', null, false)`, [s]);
      expect(await q(`select 1 from session_credit where session_id = $1 and student_id = $2`, [s, NIA])).toHaveLength(0);
      expect((await q(`select count(*)::int n from session_credit where session_id = $1`, [s]))[0].n).toBeGreaterThan(0);
    });
  });

  it('trials and drop-ins earn no credit; nor does a place priced as a drop-in', async () => {
    await asUser(USERS.owner, async q => {
      await setPolicy(q, 'session');
      const s = await onOrAfter(q, uid(NS.class, 191), await day(q, 1));
      expect((await q(`select app.absence_credit_value($1, $2) v`, [NIA, s]))[0].v).toBeNull();
      const g = await onOrAfter(q, GRADE3, await day(q, 1));
      expect((await q(`select app.absence_credit_value($1, $2) v`, [NIA, g]))[0].v).toBe(485);
      expect((await q(`select app.absence_credit_value($1, $2) v`, [CLARA, g]))[0].v).toBeNull();   // not in that class
    });
  });
});

/* ── UR-17 ─────────────────────────────────────────────────────────────── */
describe('split billing between guardians (UR-17)', () => {
  /** Inês Wright, the second guardian on file, with her own login. */
  async function ines(svc: Q) {
    await svc(`insert into user_account (id, email, full_name) values ($1, 'second.wright@example.com', 'Inês Wright')`, [INES]);
    await svc(`insert into membership (user_id, studio_id, role) values ($1, $2, 'guardian')`, [INES, STUDIO_ID]);
    await svc(`update guardian set user_id = $1 where id = $2`, [INES, INES_ROW]);
  }
  const familyA = (rows: any[]) => rows.filter((l: any) => l.family_id === FAMILY.a);
  const total = (rows: any[]) => rows.reduce((t, l) => t + Math.round(Number(l.quantity) * l.unit_minor) - l.discount_minor, 0);
  const runInvoices = (svc: Q, run: string) =>
    svc(`select id, number, billed_guardian_id, total_minor::int total from invoice where billing_run_id = $1 and family_id = $2
          order by billed_guardian_id`, [run, FAMILY.a]);

  it('50/50: one invoice per guardian, shares add up to the whole, each sees only their own', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await commitFree(svc);
      await as(svc, USERS.admin);
      const t = await termId(q);
      const whole = total(familyA(await q(B.BILLING_LINES, [t, null, null])));
      expect(whole).toBeGreaterThan(0);

      await q(B.SET_FAMILY_BILLING, [FAMILY.a, 'percent', HANNAH_ROW, INES_ROW, 50, null]);
      const lines = familyA(await q(B.BILLING_LINES, [t, null, null]));
      expect(new Set(lines.map((l: any) => l.payer_guardian_id))).toEqual(new Set([HANNAH_ROW, INES_ROW]));
      expect(lines.every((l: any) => / \(50% share\)$/.test(l.description))).toBe(true);
      expect(total(lines)).toBe(whole);

      const [{ id: run }] = await q(B.CREATE_BILLING_RUN, [t, null, null, null, null]);
      const invs = await runInvoices(svc, run);
      expect(invs).toHaveLength(2);
      expect(invs.map((i: any) => i.billed_guardian_id).sort()).toEqual([HANNAH_ROW, INES_ROW].sort());
      expect(invs[0].total + invs[1].total).toBe(whole);
      expect(Math.abs(invs[0].total - invs[1].total)).toBeLessThanOrEqual(lines.length);
      await q(B.ISSUE_BILLING_RUN, [run]);
      await flush(q);
      const hannahs = invs.find((i: any) => i.billed_guardian_id === HANNAH_ROW);
      const ineses = invs.find((i: any) => i.billed_guardian_id === INES_ROW);
      // The office sees both, with who each is addressed to.
      expect((await q(B.INVOICE, [ineses.id]))[0].billed_to).toBe('Inês Wright');

      // Each guardian sees their own invoice and the family-wide ones, not the other's.
      await as(svc, USERS.guardianA);
      let mine = (await q(F.MY_INVOICES)).map((i: any) => i.id);
      expect(mine).toContain(hannahs.id);
      expect(mine).not.toContain(ineses.id);
      expect(await q(B.INVOICE_ITEMS, [ineses.id])).toHaveLength(0);
      expect(Number((await q(F.MY_BALANCE))[0].balance_minor)).toBe(hannahs.total);
      await as(svc, INES);
      mine = (await q(F.MY_INVOICES)).map((i: any) => i.id);
      expect(mine).toContain(ineses.id);
      expect(mine).not.toContain(hannahs.id);
      expect(Number((await q(F.MY_BALANCE))[0].balance_minor)).toBe(ineses.total);

      // Each hears about their own invoice only.
      const bell = async (u: string) => (await svc(`select title from notification where user_id = $1 and kind = 'invoice_issued'`, [u])).map((n: any) => n.title).join('|');
      expect(await bell(INES)).toContain(ineses.number);
      expect(await bell(INES)).not.toContain(hannahs.number);
      expect(await bell(USERS.guardianA)).not.toContain(ineses.number);
    });
  });

  it('the run guard counts each share: no double billing, and a voided share alone is billed again', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await commitFree(svc);
      await as(svc, USERS.admin);
      const t = await termId(q);
      await q(B.SET_FAMILY_BILLING, [FAMILY.a, 'percent', HANNAH_ROW, INES_ROW, 50, null]);
      const [{ id: run }] = await q(B.CREATE_BILLING_RUN, [t, null, null, null, null]);
      await q(B.ISSUE_BILLING_RUN, [run]);
      // The split is not taken for an earlier bill: nobody is skipped, nothing is left to bill.
      expect((await q(B.BILLING_SKIPPED, [t, null])).some((s: any) => s.family_id === FAMILY.a)).toBe(false);
      expect(familyA(await q(B.BILLING_LINES, [t, null, null]))).toHaveLength(0);
      expect(await expectRejected(() => q(B.CREATE_BILLING_RUN, [t, null, null, null, null]))).toMatch(/already been invoiced/);

      const ineses = (await runInvoices(svc, run)).find((i: any) => i.billed_guardian_id === INES_ROW);
      await q(B.VOID_INVOICE, [ineses.id, 'Wrong address']);
      const again = familyA(await q(B.BILLING_LINES, [t, null, null]));
      expect(again.length).toBeGreaterThan(0);
      expect(again.every((l: any) => l.payer_guardian_id === INES_ROW)).toBe(true);
      expect(total(again)).toBe(ineses.total);
    });
  });

  it('per child: each child’s fees go to the guardian chosen for them', async () => {
    await asUser(null, async (q, svc) => {
      await ines(svc);
      await commitFree(svc);
      await as(svc, USERS.admin);
      const t = await termId(q);
      await q(B.SET_FAMILY_BILLING, [FAMILY.a, 'per_child', HANNAH_ROW, null, null, JSON.stringify({ [AMIR]: INES_ROW })]);
      const [{ id: run }] = await q(B.CREATE_BILLING_RUN, [t, null, null, null, null]);
      await q(B.ISSUE_BILLING_RUN, [run]);
      const invs = await runInvoices(svc, run);
      expect(invs).toHaveLength(2);
      const kids = async (inv: string) => new Set((await svc(`select student_id from invoice_item where invoice_id = $1`, [inv])).map((r: any) => r.student_id));
      const hannahs = invs.find((i: any) => i.billed_guardian_id === HANNAH_ROW);
      const ineses = invs.find((i: any) => i.billed_guardian_id === INES_ROW);
      expect(await kids(ineses.id)).toEqual(new Set([AMIR]));
      expect([...(await kids(hannahs.id))].sort()).toEqual([CLARA, NIA].sort());

      await as(svc, INES);
      expect((await q(F.MY_INVOICES)).map((i: any) => i.id)).not.toContain(hannahs.id);
      expect((await q(B.INVOICE_ITEMS, [ineses.id])).length).toBeGreaterThan(0);
      await as(svc, USERS.guardianA);
      expect((await q(F.MY_INVOICES)).map((i: any) => i.id)).not.toContain(ineses.id);
      expect(await q(`select 1 from invoice where id = $1`, [ineses.id])).toHaveLength(0);
    });
  });

  it('single-payer families are unchanged; only the office sets a split, and only with the family’s own guardians', async () => {
    await asUser(null, async (q, svc) => {
      await commitFree(svc);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(B.SET_FAMILY_BILLING, [FAMILY.a, 'one', HANNAH_ROW, null, null, null]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(B.SET_FAMILY_BILLING, [FAMILY.a, 'percent', HANNAH_ROW, uid(NS.guardian, 4), 50, null])))
        .toMatch(/two different guardians in this family/);
      expect(await expectRejected(() => q(B.SET_FAMILY_BILLING, [FAMILY.a, 'percent', HANNAH_ROW, INES_ROW, 100, null])))
        .toMatch(/between 1% and 99%/);
      const [{ id: run }] = await q(B.CREATE_BILLING_RUN, [await termId(q), null, null, null, null]);
      await q(B.ISSUE_BILLING_RUN, [run]);
      const [b] = await svc(`select id, billed_guardian_id from invoice where billing_run_id = $1 and family_id = $2`, [run, FAMILY.b]);
      expect(b.billed_guardian_id).toBeNull();
      await as(svc, USERS.guardianB);
      expect((await q(F.MY_INVOICES)).map((i: any) => i.id)).toContain(b.id);
    });
  });
});
