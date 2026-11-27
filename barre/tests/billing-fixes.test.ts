/* Billing fixes from the end-user panel review (migration 0045):
   UR-10 billing integrity, UR-22 payment instructions, UR-23 money
   notifications, UR-24 upcoming costs, UR-46 bulk reminders, UR-54. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import * as B from '../src/lib/repos/billing';
import * as D from '../src/lib/repos/dashboard';
import { invoiceState, isOverdue } from '../src/lib/payments/invoice-status';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const OYELARAN = uid(NS.family, 26);   // INV-1066, £54.00, issued, nothing paid
const FENWICK = uid(NS.family, 25);    // three children
const THAMES_VALLEY = uid(NS.event, 1); // competition, £35

/** Switch who the transaction is acting as, mid-test. */
const become = (svc: Q, user: string) =>
  svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const balance = async (q: Q, fam: string) =>
  Number((await q('select balance_minor from family where id = $1', [fam]))[0].balance_minor);
const termId = async (svc: Q) =>
  (await svc(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]))[0].id;
const items = (description: string, unit_minor: number) =>
  JSON.stringify([{ kind: 'workshop', description, unit_minor }]);
/** Deferred notifications (a new invoice) are written at commit; tests roll back, so fire them now. */
const flush = (q: Q) => q('set constraints all immediate');
const bell = (svc: Q, user: string) =>
  svc(`select kind, title, body, href from notification where user_id = $1 order by created_at, title`, [user]);

describe('UR-10 · refunds are credit notes, and the invoice stays settled', () => {
  it('refund £10 on the paid INV-1066: still Paid, a £10 credit note, nothing owed (acceptance 1)', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [inv] = await q(`select id from invoice where number = 'INV-1066'`);
      const [{ id: pay }] = await q(B.RECORD_PAYMENT, [OYELARAN, 5400, 'cash', inv.id, null]);
      expect((await q(B.INVOICE, [inv.id]))[0].status).toBe('paid');

      await q(B.REFUND_PAYMENT, [pay, 1000, 'Class cancelled 1 Dec – teacher unwell', 'credit_note']);

      const [after] = await q(B.INVOICE, [inv.id]);
      expect(after.status).toBe('paid');
      expect(after.overdue).toBe(false);
      expect(await balance(q, OYELARAN)).toBe(0);
      const notes = await q(B.INVOICE_CREDIT_NOTES, [inv.id]);
      expect(notes).toHaveLength(1);
      expect(notes[0].number).toMatch(/^CN-\d{4}$/);
      expect(Number(notes[0].amount_minor)).toBe(1000);
      expect(Number(notes[0].refunded_minor)).toBe(1000);
      // The cash went back, and the refund is its own dated row.
      const [p] = await q(`select refunded_minor from payment where id = $1`, [pay]);
      expect(Number(p.refunded_minor)).toBe(1000);
      // The family statement shows every movement and ends at nothing owed.
      const st = await q(B.FAMILY_STATEMENT, [OYELARAN]);
      expect(st.map((l: any) => l.kind)).toEqual(['invoice', 'payment', 'credit_note', 'refund']);
      expect(Number(st.at(-1).balance_minor)).toBe(0);
      // Not chased: nothing overdue for this family.
      expect((await q(B.OVERDUE_FAMILIES)).some((f: any) => f.family_id === OYELARAN)).toBe(false);
      // Logged with who and why.
      const [log] = await svc(`select actor_id, summary from audit_log where action = 'credit' and entity_id = $1`, [inv.id]);
      expect(log.actor_id).toBe(USERS.admin);
      expect(log.summary).toMatch(/teacher unwell/);
      // It reaches the accountant as a credit note.
      const xero = await q(B.XERO_EXPORT);
      const cn = xero.find((r: any) => r['*InvoiceNumber'] === notes[0].number);
      expect(Number(cn['*UnitAmount'])).toBe(-10);
      expect(cn['Reference']).toBe('INV-1066');
    });
  });

  it('a credit note can be kept as credit on account instead, and goes off the next invoice', async () => {
    await asUser(USERS.owner, async q => {
      const [inv] = await q(`select id from invoice where number = 'INV-1066'`);
      await q(B.RECORD_PAYMENT, [OYELARAN, 5400, 'bank_transfer', inv.id, null]);
      await q(B.ISSUE_CREDIT_NOTE, [inv.id, 1000, 'Class cancelled', 'account']);
      expect((await q(B.INVOICE, [inv.id]))[0].status).toBe('paid');
      expect(await balance(q, OYELARAN)).toBe(-1000);
      const [acc] = await q(B.FAMILY_ACCOUNT, [OYELARAN]);
      expect(Number(acc.credit_minor)).toBe(1000);
      await q(`select app.create_invoice($1, $2::jsonb)`, [OYELARAN, items('Workshop', 2500)]);
      expect(await balance(q, OYELARAN)).toBe(1500);
    });
  });

  it('on an unpaid invoice a credit note lowers what is owed; it can never exceed the invoice', async () => {
    await asUser(USERS.owner, async q => {
      const [inv] = await q(`select id, total_minor from invoice where number = 'INV-1066'`);
      await q(B.ISSUE_CREDIT_NOTE, [inv.id, 1400, 'Missed two classes', 'account']);
      expect(await balance(q, OYELARAN)).toBe(4000);
      expect(await expectRejected(() => q(B.ISSUE_CREDIT_NOTE, [inv.id, 4001, 'Too much', 'account']))).toMatch(/at most £40\.00/);
      expect(await expectRejected(() => q(B.ISSUE_CREDIT_NOTE, [inv.id, 100, ' ', 'account']))).toMatch(/say why/);
      // Nothing was paid by transfer or cash, so no money can be handed back here.
      expect(await expectRejected(() => q(B.ISSUE_CREDIT_NOTE, [inv.id, 100, 'Refund', 'refund']))).toMatch(/only £0\.00/);
    });
  });

  it('a card-paid invoice can be credited to the account, but card money goes back through the provider', async () => {
    await asUser(USERS.owner, async q => {
      const [inv] = await q(`select id from invoice where number = 'INV-1041'`);   // paid by card
      expect(await expectRejected(() => q(B.ISSUE_CREDIT_NOTE, [inv.id, 500, 'Refund', 'refund']))).toMatch(/payment provider/);
      await q(B.ISSUE_CREDIT_NOTE, [inv.id, 500, 'Goodwill', 'account']);
      expect((await q(B.INVOICE, [inv.id]))[0].status).toBe('paid');
      expect(await balance(q, uid(NS.family, 1))).toBe(-500);
    });
  });

  it('a payment recorded by mistake can still be reversed, which reopens the invoice', async () => {
    await asUser(USERS.owner, async q => {
      const [inv] = await q(`select id from invoice where number = 'INV-1066'`);
      const [{ id }] = await q(B.RECORD_PAYMENT, [OYELARAN, 5400, 'cash', inv.id, null]);
      await q(B.REFUND_PAYMENT, [id, 5400, 'Recorded against the wrong family', 'mistake']);
      expect((await q(B.INVOICE, [inv.id]))[0].status).toBe('refunded');
      expect(await balance(q, OYELARAN)).toBe(5400);
      expect(await q(B.INVOICE_CREDIT_NOTES, [inv.id])).toHaveLength(0);
    });
  });

  it('parents and teachers cannot issue credit notes or credit', async () => {
    for (const who of [USERS.guardianA, USERS.teacherTap]) {
      await asUser(who, async (q, svc) => {
        const [inv] = await svc(`select id from invoice where number = 'INV-1041'`);
        expect(await expectRejected(() => q(B.ISSUE_CREDIT_NOTE, [inv.id, 100, 'x', 'account']))).toMatch(/FORBIDDEN/);
        expect(await expectRejected(() => q(B.ADD_FAMILY_CREDIT, [FAMILY.a, 100, 'x']))).toMatch(/FORBIDDEN/);
      });
    }
  });
});

describe('UR-10 · billing runs never bill a family twice for a period', () => {
  it('Current Term on seeded data raises nothing for families already invoiced, and lists them (acceptance 2)', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const t = await termId(svc);
      const skipped = await q(B.BILLING_SKIPPED, [t, null]);
      expect(skipped.length).toBeGreaterThan(20);
      const skippedIds = new Set(skipped.map((s: any) => s.family_id));
      for (const s of skipped) {
        expect(s.invoices).toMatch(/INV-10[4-7]\d/);
        expect(Number(s.would_raise_minor)).toBeGreaterThan(0);
      }
      const lines = await q(B.BILLING_LINES, [t, null, null]);
      expect(lines.filter((l: any) => skippedIds.has(l.family_id))).toHaveLength(0);
      // Raising the run: no draft for any family already invoiced.
      const run = await q(B.CREATE_BILLING_RUN, [t, null, null, null, null]).catch((e: Error) => e);
      if (run instanceof Error) expect(run.message).toMatch(/already been invoiced/);
      const drafts = await q(`select family_id from invoice where status = 'draft'`);
      expect(drafts.filter((d: any) => skippedIds.has(d.family_id))).toHaveLength(0);
    });
  });

  it('the office can include a skipped family, with a reason, and it is logged', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const t = await termId(svc);
      const [first] = await q(B.BILLING_SKIPPED, [t, null]);
      expect(await expectRejected(() => q(B.CREATE_BILLING_RUN, [t, null, null, [first.family_id], ''])))
        .toMatch(/say why/);
      const [{ id: run }] = await q(B.CREATE_BILLING_RUN, [t, null, null, [first.family_id], 'Old invoice was for last term']);
      const invs = await q(`select family_id, total_minor from invoice where billing_run_id = $1`, [run]);
      expect(invs.map((i: any) => i.family_id)).toContain(first.family_id);
      expect(Number(invs.find((i: any) => i.family_id === first.family_id).total_minor)).toBe(Number(first.would_raise_minor));
      const [log] = await svc(`select summary from audit_log where action = 'override' and entity_id = $1`, [first.family_id]);
      expect(log.summary).toMatch(/last term/);
      // A second run includes them no more: their run invoice now names each class.
      await q(B.ISSUE_BILLING_RUN, [run]);
      expect((await q(B.BILLING_LINES, [t, null, [first.family_id]])).filter((l: any) => l.family_id === first.family_id)).toHaveLength(0);
    });
  });

  it('a hand-made monthly invoice that names the month skips that family for that month only', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await termId(svc);
      const [e] = await svc(`select s.family_id, c.id from enrolment e join class c on c.id = e.class_id
                               join student s on s.id = e.student_id where e.status = 'active' and c.term_id = $1 limit 1`, [t]);
      await svc(`update class set pricing = 'monthly', price_minor = 3000 where id = $1`, [e.id]);
      const month = new Date().toLocaleString('en-GB', { month: 'long' });
      const before = await q(B.BILLING_LINES, [t, new Date().toISOString().slice(0, 10), null]);
      expect(before.some((l: any) => l.family_id === e.family_id)).toBe(true);
      await q(`select app.create_invoice($1, $2::jsonb)`,
        [e.family_id, JSON.stringify([{ kind: 'tuition', description: `Tap — ${month}`, unit_minor: 3000 }])]);
      const after = await q(B.BILLING_LINES, [t, new Date().toISOString().slice(0, 10), null]);
      expect(after.some((l: any) => l.family_id === e.family_id)).toBe(false);
    });
  });
});

describe('UR-10 · ending a family discount', () => {
  it('End the Fenwick discount: gone on reload and not applied in the preview (acceptance 3)', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const t = await termId(svc);
      const [{ id }] = await q(B.ADD_FAMILY_DISCOUNT, [FENWICK, 'percent', 15, 'bursary', 'Hardship fund', null, null]);
      expect((await q(B.FAMILY_DISCOUNTS)).map((d: any) => d.id)).toContain(id);
      const with15 = await q(B.BILLING_LINES, [t, null, [FENWICK]]);
      expect(with15.filter((l: any) => l.family_id === FENWICK).every((l: any) => /15% discount/.test(l.discount_reason))).toBe(true);

      await q(B.END_FAMILY_DISCOUNT, [id]);
      expect((await q(B.FAMILY_DISCOUNTS)).map((d: any) => d.id)).not.toContain(id);
      const without = (await q(B.BILLING_LINES, [t, null, [FENWICK]])).filter((l: any) => l.family_id === FENWICK);
      expect(without.length).toBeGreaterThan(0);
      expect(without.some((l: any) => /15% discount/.test(l.discount_reason ?? ''))).toBe(false);
      // History is kept, and who ended it is logged.
      const [row] = await svc(`select ended_at, ended_by, deleted_at from family_discount where id = $1`, [id]);
      expect(row.ended_at).not.toBeNull();
      expect(row.ended_by).toBe(USERS.admin);
      expect(row.deleted_at).toBeNull();
      expect(await svc(`select 1 from audit_log where entity = 'family_discount' and entity_id = $1`, [id])).toHaveLength(1);
      // A failed end says so, rather than failing silently.
      expect(await expectRejected(() => q(B.END_FAMILY_DISCOUNT, [id]))).toMatch(/already ended/);
    });
  });

  it('only the office can end a discount', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ id }] = await q(B.ADD_FAMILY_DISCOUNT, [FENWICK, 'fixed', 1000, 'staff', '', null, null]);
      await become(svc, USERS.guardianA);
      expect(await expectRejected(() => q(B.END_FAMILY_DISCOUNT, [id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-10 · goodwill credit and payment on account', () => {
  it('Add £5 credit: the next invoice is reduced by £5 (acceptance 4)', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      expect(await balance(q, FAMILY.a)).toBe(0);
      await q(B.ADD_FAMILY_CREDIT, [FAMILY.a, 500, 'Sorry for the mix-up at the show']);
      expect(await balance(q, FAMILY.a)).toBe(-500);
      const [{ id }] = await q(B.CREATE_INVOICE, [FAMILY.a, items('Summer workshop', 3000), null, null, 0, true]);
      const [inv] = await q(B.INVOICE, [id]);
      expect(Number(inv.total_minor) - Number(inv.paid_minor)).toBe(2500);
      expect(await balance(q, FAMILY.a)).toBe(2500);
      const st = await q(B.FAMILY_STATEMENT, [FAMILY.a]);
      expect(st.some((l: any) => l.kind === 'credit' && Number(l.amount_minor) === -500)).toBe(true);
      expect(await svc(`select 1 from audit_log where action = 'credit' and entity = 'family' and entity_id = $1`, [FAMILY.a])).toHaveLength(1);
      expect(await expectRejected(() => q(B.ADD_FAMILY_CREDIT, [FAMILY.a, 500, '']))).toMatch(/say why/);
    });
  });

  it('a payment can be recorded without an invoice and is applied oldest first', async () => {
    await asUser(USERS.admin, async q => {
      const [inv] = await q(`select id from invoice where number = 'INV-1066'`);
      await q(B.RECORD_PAYMENT, [OYELARAN, 2000, 'bank_transfer', null, 'OYELARAN-0026']);
      const [after] = await q(B.INVOICE, [inv.id]);
      expect(Number(after.paid_minor)).toBe(2000);
      expect(after.status).toBe('part_paid');
    });
  });
});

describe('UR-22 · paying by bank transfer', () => {
  it('the owner sets the bank details; families read them with their reference', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(B.SET_BANK_DETAILS, [STUDIO_ID, 'Greenwich Dance Ltd', '12 34 56', '12345678', 'gb29 nwbk 6016 1331 9268 19']);
      const [b] = await q(B.BANK_DETAILS, [STUDIO_ID]);
      expect(b).toMatchObject({ payee_name: 'Greenwich Dance Ltd', sort_code: '12-34-56', account_number: '12345678', iban: 'GB29NWBK60161331926819' });
      expect(await expectRejected(() => q(B.SET_BANK_DETAILS, [STUDIO_ID, 'X Ltd', '1234', '12345678', null]))).toMatch(/six digits/);
      expect(await expectRejected(() => q(B.SET_BANK_DETAILS, [STUDIO_ID, 'X Ltd', '123456', '1234', null]))).toMatch(/eight digits/);

      await become(svc, USERS.admin);
      expect(await expectRejected(() => q(B.SET_BANK_DETAILS, [STUDIO_ID, 'Someone else', '65-43-21', '87654321', null])))
        .toMatch(/only the studio owner/);

      await become(svc, USERS.guardianA);
      const [info] = await q(B.MY_PAYMENT_INFO);
      expect(info).toMatchObject({ family_id: FAMILY.a, payee_name: 'Greenwich Dance Ltd', sort_code: '12-34-56', account_number: '12345678' });
      expect(info.reference).toMatch(/^WRIGHT-[0-9A-F]{4}$/);
      expect(info.reference.length).toBeLessThanOrEqual(18);
      // Nobody can write the table directly.
      await expectRejected(() => q(`insert into studio_bank_details (studio_id, payee_name, sort_code, account_number)
                                    values ($1, 'Fraud Ltd', '00-00-00', '00000000')`, [STUDIO_ID]));
    });
  });
});

describe('UR-23 · families hear about money in the bell', () => {
  it('billing the Thames Valley fee shows "New invoice INV-x £35.00 due …" in Hannah’s bell', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      // One of Hannah's children is going (as Nia was in the panel's run).
      const [kid] = await svc(`select id from student where family_id = $1 order by id limit 1`, [FAMILY.a]);
      await svc(`update event_participant set status = 'declined' where event_id = $1
                   and student_id in (select id from student where family_id = $2)`, [THAMES_VALLEY, FAMILY.a]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed')
                 on conflict (event_id, student_id) do update set status = 'confirmed'`, [STUDIO_ID, THAMES_VALLEY, kid.id]);
      await q(`select app.bill_event($1)`, [THAMES_VALLEY]);
      await flush(q);
      const [inv] = await q(`select number, due_on from invoice where family_id = $1 order by number desc limit 1`, [FAMILY.a]);
      const day = new Date(inv.due_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      const titles = (await bell(svc, USERS.guardianA)).map((n: any) => n.title);
      expect(titles).toContain(`New invoice ${inv.number} £35.00 due ${day}`);
      // Paying it says so too.
      const [i] = await q(`select id from invoice where number = $1`, [inv.number]);
      await q(B.RECORD_PAYMENT, [FAMILY.a, 3500, 'bank_transfer', i.id, null]);
      expect((await bell(svc, USERS.guardianA)).some((n: any) => n.kind === 'payment_received' && n.title === 'Payment received: £35.00')).toBe(true);
    });
  });

  it('a draft says nothing until it is issued; history and credit moves say nothing', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ id }] = await q(B.CREATE_INVOICE, [FAMILY.a, items('Draft thing', 1000), null, null, 0, false]);
      await flush(q);
      expect((await bell(svc, USERS.guardianA)).filter((n: any) => n.kind === 'invoice_issued')).toHaveLength(0);
      await q(B.ADD_FAMILY_CREDIT, [FAMILY.a, 300, 'Goodwill']);
      expect((await bell(svc, USERS.guardianA)).filter((n: any) => n.kind === 'payment_received')).toHaveLength(0);
      await q(B.ISSUE_INVOICE, [id]);
      await flush(q);
      expect((await bell(svc, USERS.guardianA)).filter((n: any) => n.kind === 'invoice_issued')).toHaveLength(1);
    });
  });

  it('respects a family’s choice to turn payment notifications off', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(`select app.set_notification_preference('payments', false, true)`);
      await become(svc, USERS.owner);
      await q(B.CREATE_INVOICE, [FAMILY.a, items('Workshop', 1000), null, null, 0, true]);
      await flush(q);
      expect((await bell(svc, USERS.guardianA)).filter((n: any) => n.kind === 'invoice_issued')).toHaveLength(0);
    });
  });

  it('an invoice due within three days is mentioned once', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ id }] = await q(B.CREATE_INVOICE, [FAMILY.a, items('Exam fee', 6200), null, null, 0, true]);
      const [inv] = await q(`select number from invoice where id = $1`, [id]);
      await svc(`update invoice set due_on = current_date + 2 where id = $1`, [id]);
      await become(svc, USERS.guardianA);
      expect((await q(B.NOTIFY_DUE))[0].n).toBe(1);
      expect((await q(B.NOTIFY_DUE))[0].n).toBe(0);
      const due = (await bell(svc, USERS.guardianA)).filter((n: any) => n.title.startsWith(`${inv.number} is due`));
      expect(due).toHaveLength(1);
      expect(due[0].body).toMatch(/£62\.00 to pay/);
      // A family only ever touches its own invoices.
      await become(svc, USERS.guardianB);
      expect((await q(B.NOTIFY_DUE))[0].n).toBe(0);
    });
  });

  it('a confirmed event place, shared feedback and an exam entry each reach the family', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select id, first_name from student where family_id = $1 order by id limit 1`, [FAMILY.a]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'requested')
                 on conflict (event_id, student_id) do update set status = 'requested'`, [STUDIO_ID, uid(NS.event, 4), kid.id]);
      await q(`update event_participant set status = 'confirmed' where event_id = $1 and student_id = $2`, [uid(NS.event, 4), kid.id]);
      const titles = (await bell(svc, USERS.guardianA)).map((n: any) => n.title);
      expect(titles.some((t: string) => t.startsWith(`${kid.first_name}’s place is confirmed`))).toBe(true);
      // Feedback and exam entries were already announced by 0029 and 0042.
      const kinds = await svc(`select app.notification_category('feedback_published') f, app.notification_category('invoice_issued') i`);
      expect(kinds[0]).toEqual({ f: 'progress', i: 'payments' });
    });
  });
});

describe('UR-24 · what is coming up, and privates are charged', () => {
  it('a confirmed £30 private and a £35 competition both appear with dates, and the total matches', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select id, first_name from student where family_id = $1 order by id limit 1`, [FAMILY.a]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed')
                 on conflict (event_id, student_id) do update set status = 'confirmed'`, [STUDIO_ID, THAMES_VALLEY, kid.id]);
      const [{ id: ev }] = await q(`insert into studio_event (studio_id, kind, status, title, starts_at, student_id, cost_minor, requests_open)
                                    values ($1, 'private_lesson', 'published', 'Private lesson', now() + interval '5 days', $2, 3000, false)
                                    returning id`, [STUDIO_ID, kid.id]);
      // The private raised a draft invoice line for the office.
      const [line] = await q(`select ii.kind, ii.unit_minor, i.status from invoice_item ii join invoice i on i.id = ii.invoice_id
                                where ii.event_id = $1`, [ev]);
      expect(line).toMatchObject({ kind: 'private_lesson', unit_minor: 3000, status: 'draft' });

      await become(svc, USERS.guardianA);
      const up = await q(B.UPCOMING_COSTS, [null]);
      const priv = up.find((r: any) => r.kind === 'private_lesson');
      const comp = up.find((r: any) => r.title === 'Thames Valley Dance Festival' && r.student_id === kid.id);
      expect(priv).toMatchObject({ amount_minor: '3000', state: 'expected', child: kid.first_name });
      expect(priv.due_on).not.toBeNull();
      expect(comp).toMatchObject({ amount_minor: '3500', state: 'expected' });
      expect(comp.due_on).not.toBeNull();
      const total = up.reduce((n: number, r: any) => n + Number(r.amount_minor), 0);
      expect(total).toBeGreaterThanOrEqual(6500);

      // Billed, the competition reads Invoiced; the family cannot look at another family's costs.
      await become(svc, USERS.owner);
      await q(`select app.bill_event($1)`, [THAMES_VALLEY]);
      await become(svc, USERS.guardianA);
      const again = await q(B.UPCOMING_COSTS, [null]);
      expect(again.find((r: any) => r.title === 'Thames Valley Dance Festival' && r.student_id === kid.id).state).toBe('invoiced');
      expect(await expectRejected(() => q(B.UPCOMING_COSTS, [FAMILY.b]))).toMatch(/FORBIDDEN/);
      expect(again.every((r: any) => r.family_id === FAMILY.a)).toBe(true);

      // A cancelled private takes its draft away.
      await become(svc, USERS.owner);
      await q(`update studio_event set status = 'cancelled' where id = $1`, [ev]);
      expect(await q(`select 1 from invoice_item ii join invoice i on i.id = ii.invoice_id where ii.event_id = $1`, [ev])).toHaveLength(0);
    });
  });

  it('families never see a draft invoice in their list', async () => {
    const F = await import('../src/lib/repos/family');
    await asUser(USERS.owner, async (q, svc) => {
      await q(B.CREATE_INVOICE, [FAMILY.a, items('Not sent yet', 1000), null, null, 0, false]);
      await become(svc, USERS.guardianA);
      expect((await q(F.MY_INVOICES)).some((i: any) => i.status === 'draft')).toBe(false);
    });
  });
});

describe('UR-46 · reminders to every overdue family at once', () => {
  it('10 overdue families receive one reminder each, logged per family', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      for (const fam of [FAMILY.a, FAMILY.b]) {
        await q(B.CREATE_INVOICE, [fam, items('Costume', 2400), new Date(Date.now() - 5 * 86400_000).toISOString().slice(0, 10), null, 0, true]);
      }
      const overdue = await q(B.OVERDUE_FAMILIES);
      expect(overdue).toHaveLength(10);
      const ids = overdue.map((f: any) => f.family_id);
      const subject = 'Payment reminder: {{invoice_number}}';
      const body = 'Hello {{guardian_name}}, {{amount}} has been due since {{due_date}}. Thank you.';
      const [preview] = await q(B.REMINDER_PREVIEW, [FAMILY.a, subject, body]);
      expect(preview.subject).toMatch(/^Payment reminder: INV-\d{4}$/);
      expect(preview.body).toMatch(/^Hello Hannah, £24\.00 has been due since \d+ \w{3}\. Thank you\.$/);

      const [{ sent }] = await q(B.SEND_REMINDERS, [ids, subject, body]);
      expect(sent).toBe(10);
      const msgs = await svc(`select family_id, count(*)::int n from communication where family_id = any($1::uuid[])
                                and subject like 'Payment reminder:%' group by family_id`, [ids]);
      expect(msgs).toHaveLength(10);
      expect(msgs.every((m: any) => m.n === 1)).toBe(true);
      const logs = await svc(`select entity_id from audit_log where action = 'remind'`);
      expect(new Set(logs.map((l: any) => l.entity_id))).toEqual(new Set(ids));
      expect((await q(B.OVERDUE_FAMILIES)).every((f: any) => f.last_reminded !== null)).toBe(true);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(B.SEND_REMINDERS, [[FAMILY.a], 'Pay up', 'Please pay what you owe.']))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-54 · the same numbers and words everywhere', () => {
  it('Today’s failed-card card pairs the count with the declined amount, as Billing does (admins D11)', async () => {
    await asUser(USERS.admin, async q => {
      const [today] = await q(D.ATTENTION_PAYMENTS);
      const [billing] = await q(B.SUMMARY);
      expect(today.failed).toBe(billing.failed_payments);
      expect(Number(today.failed_minor)).toBe(Number(billing.failed_minor));
      expect(Number(today.failed_minor)).toBeLessThan(Number(today.outstanding_minor));
    });
  });

  it('an issued invoice past its due date reads Overdue on the family record too (admins D14)', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    const inv = { status: 'issued', due_on: '2026-11-20', total_minor: 12600, paid_minor: 0 };
    expect(isOverdue(inv, now)).toBe(true);
    expect(invoiceState(inv, now).label).toBe('Overdue');
    expect(invoiceState({ ...inv, due_on: new Date('2026-12-01T00:00:00Z') }, now).label).toBe('Due');
    expect(invoiceState({ ...inv, status: 'paid', paid_minor: 12600 }, now).label).toBe('Paid');
    expect(invoiceState({ ...inv, failed: true }, now).label).toBe('Card declined');
  });
});
