import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, uid, NS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/** Seeded: families 1–22 paid in full, 23–27 owe a whole invoice, 28–30 paid
 *  half and then had a card declined. */
const OWES = uid(NS.family, 23);        // INV-1063, £90.00, nothing paid
const PART = uid(NS.family, 28);        // half paid, card declined

type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const balance = async (q: Q, fam: string) =>
  Number((await q('select balance_minor from family where id = $1', [fam]))[0].balance_minor);
const invoiceOf = async (q: Q, fam: string) =>
  (await q(`select * from invoice where family_id = $1 order by number desc limit 1`, [fam]))[0];

const items = (...lines: [string, number, number?][]) => JSON.stringify(
  lines.map(([description, unit_minor, discount_minor]) =>
    ({ kind: 'workshop', description, unit_minor, discount_minor: discount_minor ?? 0 })));

describe('the seeded ledger agrees with itself', () => {
  it('derives every balance from invoices and payments', async () => {
    await asUser(USERS.owner, async q => {
      expect(await balance(q, FAMILY.a)).toBe(0);
      expect(await balance(q, OWES)).toBe(9000);
      const inv = await invoiceOf(q, PART);
      expect(inv.status).toBe('part_paid');
      expect(await balance(q, PART)).toBe(Number(inv.total_minor) - Number(inv.paid_minor));
      // A declined card is not money: it must not count towards paid.
      const [failed] = await q(`select sum(amount_minor)::int s from payment
                                 where family_id = $1 and failure_code is not null`, [PART]);
      expect(Number(inv.paid_minor)).toBe(Number(inv.total_minor) - failed.s);
    });
  });
});

describe('raising invoices', () => {
  it('totals lines, line discounts and an invoice discount', async () => {
    await asUser(USERS.owner, async q => {
      const before = await balance(q, FAMILY.a);
      const [{ id }] = await q(`select app.create_invoice($1, $2::jsonb, null, 'Summer extras', 500) id`,
        [FAMILY.a, items(['Summer workshop', 4500, 500], ['Show costume', 3000])]);
      const [inv] = await q('select * from invoice where id = $1', [id]);
      expect(Number(inv.subtotal_minor)).toBe(7000);
      expect(Number(inv.total_minor)).toBe(6500);
      expect(inv.status).toBe('issued');
      expect(inv.number).toMatch(/^INV-\d{4}$/);
      expect(await balance(q, FAMILY.a)).toBe(before + 6500);
    });
  });

  it('numbers invoices sequentially', async () => {
    await asUser(USERS.owner, async q => {
      const a = await q(`select app.create_invoice($1, $2::jsonb) id`, [FAMILY.a, items(['A', 100])]);
      const b = await q(`select app.create_invoice($1, $2::jsonb) id`, [FAMILY.a, items(['B', 100])]);
      const nums = await q(`select number from invoice where id in ($1, $2) order by number`, [a[0].id, b[0].id]);
      const [x, y] = nums.map(n => Number(n.number.slice(4)));
      expect(y! - x!).toBe(1);
    });
  });

  it('refuses an empty invoice, a blank line and a line discount bigger than the line', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.create_invoice($1, '[]'::jsonb)`, [FAMILY.a])))
        .toMatch(/at least one line/);
      expect(await expectRejected(() => q(`select app.create_invoice($1, $2::jsonb)`,
        [FAMILY.a, items(['  ', 100])]))).toMatch(/description/);
      expect(await expectRejected(() => q(`select app.create_invoice($1, $2::jsonb)`,
        [FAMILY.a, items(['Too generous', 100, 500])]))).toMatch(/discount/);
    });
  });

  it('refuses a line about somebody else’s child', async () => {
    await asUser(USERS.owner, async q => {
      const [other] = await q('select id from student where family_id = $1 limit 1', [FAMILY.b]);
      const msg = await expectRejected(() => q(`select app.create_invoice($1, $2::jsonb)`, [FAMILY.a,
        JSON.stringify([{ kind: 'exam_fee', description: 'Exam', unit_minor: 3500, student_id: other.id }])]));
      expect(msg).toMatch(/outside this family/);
    });
  });

  it('keeps a draft off the balance until it is issued', async () => {
    await asUser(USERS.owner, async q => {
      const before = await balance(q, FAMILY.a);
      const [{ id }] = await q(`select app.create_invoice($1, $2::jsonb, null, null, 0, false) id`,
        [FAMILY.a, items(['Private lesson', 4000])]);
      expect(await balance(q, FAMILY.a)).toBe(before);
      await q('select app.issue_invoice($1)', [id]);
      expect(await balance(q, FAMILY.a)).toBe(before + 4000);
    });
  });
});

describe('taking payment', () => {
  it('part payment, then the rest, moves an invoice to paid', async () => {
    await asUser(USERS.owner, async q => {
      const inv = await invoiceOf(q, OWES);
      await q(`select app.record_payment($1, 4000, 'bank_transfer', $2)`, [OWES, inv.id]);
      expect((await invoiceOf(q, OWES)).status).toBe('part_paid');
      expect(await balance(q, OWES)).toBe(5000);
      await q(`select app.record_payment($1, 5000, 'cash', $2)`, [OWES, inv.id]);
      expect((await invoiceOf(q, OWES)).status).toBe('paid');
      expect(await balance(q, OWES)).toBe(0);
    });
  });

  it('refuses more than the invoice still wants', async () => {
    await asUser(USERS.owner, async q => {
      const inv = await invoiceOf(q, OWES);
      expect(await expectRejected(() =>
        q(`select app.record_payment($1, 9001, 'cash', $2)`, [OWES, inv.id]))).toMatch(/still owed/);
    });
  });

  it('will not record card money by hand', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() =>
        q(`select app.record_payment($1, 100, 'card')`, [OWES]))).toMatch(/provider/);
    });
  });

  it('puts unallocated money on account and applies it to the oldest invoice', async () => {
    await asUser(USERS.owner, async q => {
      await q(`select app.record_payment($1, 12000, 'bank_transfer')`, [OWES]);
      expect((await invoiceOf(q, OWES)).status).toBe('paid');
      // £120 paid against £90 owed: £30 in credit, shown as a negative balance.
      expect(await balance(q, OWES)).toBe(-3000);
      const [{ c }] = await q('select app.family_available_credit($1) c', [OWES]);
      expect(Number(c)).toBe(3000);

      // The next invoice is settled from that credit as soon as it is issued.
      await q(`select app.create_invoice($1, $2::jsonb)`, [OWES, items(['Exam fee', 2500])]);
      const next = await invoiceOf(q, OWES);
      expect(next.status).toBe('paid');
      expect(await balance(q, OWES)).toBe(-500);
    });
  });

  it('a goodwill credit reduces what is owed', async () => {
    await asUser(USERS.owner, async q => {
      await q(`select app.record_payment($1, 1500, 'credit', null, 'Cancelled class')`, [OWES]);
      expect(await balance(q, OWES)).toBe(7500);
      expect((await invoiceOf(q, OWES)).status).toBe('part_paid');
    });
  });
});

describe('refunds and voids', () => {
  it('refunding a manual payment reopens the invoice', async () => {
    await asUser(USERS.owner, async q => {
      const inv = await invoiceOf(q, OWES);
      const [{ id }] = await q(`select app.record_payment($1, 9000, 'cash', $2) id`, [OWES, inv.id]);
      await q(`select app.refund_payment($1, 9000, 'Duplicate payment')`, [id]);
      expect((await invoiceOf(q, OWES)).status).toBe('refunded');
      expect(await balance(q, OWES)).toBe(9000);
      expect(await expectRejected(() => q(`select app.refund_payment($1, 1, 'again')`, [id])))
        .toMatch(/not already refunded/);
    });
  });

  it('leaves card refunds to the provider', async () => {
    await asUser(USERS.owner, async q => {
      const [p] = await q(`select id from payment where method = 'card' and succeeded_at is not null limit 1`);
      expect(await expectRejected(() => q(`select app.refund_payment($1, 100, 'x')`, [p.id])))
        .toMatch(/provider/);
    });
  });

  it('voids an unpaid invoice but not one with money against it', async () => {
    await asUser(USERS.owner, async q => {
      const inv = await invoiceOf(q, OWES);
      await q(`select app.void_invoice($1, 'Raised twice')`, [inv.id]);
      expect((await invoiceOf(q, OWES)).status).toBe('void');
      expect(await balance(q, OWES)).toBe(0);

      const part = await invoiceOf(q, PART);
      expect(await expectRejected(() => q(`select app.void_invoice($1, 'x')`, [part.id])))
        .toMatch(/refund them first/);
    });
  });

  it('records every void in the audit trail', async () => {
    await asUser(USERS.owner, async q => {
      const inv = await invoiceOf(q, OWES);
      await q(`select app.void_invoice($1, 'Wrong family')`, [inv.id]);
      const log = await q(`select summary from audit_log where entity = 'invoice' and entity_id = $1`, [inv.id]);
      expect(log.at(-1)?.summary).toMatch(/Wrong family/);
    });
  });
});

describe('who may touch the ledger', () => {
  it('admins can bill; teachers and guardians cannot', async () => {
    await asUser(USERS.admin, async q => {
      await q(`select app.create_invoice($1, $2::jsonb)`, [OWES, items(['Workshop', 1000])]);
    });
    for (const who of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => {
        expect(await expectRejected(() =>
          q(`select app.create_invoice($1, $2::jsonb)`, [FAMILY.a, items(['x', 1])]))).toMatch(/FORBIDDEN/);
        expect(await expectRejected(() =>
          q(`select app.record_payment($1, 100, 'cash')`, [FAMILY.a]))).toMatch(/FORBIDDEN/);
      });
    }
  });

  it('a guardian cannot write a payment row directly either', async () => {
    await asUser(USERS.guardianA, async q => {
      await expectRejected(() => q(`insert into payment (studio_id, family_id, amount_minor, method, succeeded_at)
        select studio_id, id, 100000, 'cash', now() from family where id = $1`, [FAMILY.a]));
    });
  });

  it('the internal recalculation is not callable', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q('select app.recalc_family_balance($1)', [FAMILY.a])))
        .toMatch(/permission denied/);
    });
  });
});

describe('the billing screen’s queries', () => {
  it('run for the office and agree with the ledger', async () => {
    const B = await import('../src/lib/repos/billing');
    await asUser(USERS.owner, async q => {
      const [s] = await q(B.SUMMARY);
      expect(s.owing_families).toBe(8);
      expect(s.failed_payments).toBe(3);
      const list = await q(B.INVOICES);
      expect(list).toHaveLength(30);
      const inv = list.find((r: any) => r.family_id === OWES);
      const [d] = await q(B.INVOICE, [inv.id]);
      expect(Number(d.family_balance_minor)).toBe(9000);
      expect(await q(B.INVOICE_ITEMS, [inv.id])).toHaveLength(1);
      await q(B.INVOICE_PAYMENTS, [inv.id]);
      expect((await q(B.FAMILY_OPTIONS)).length).toBe(30);
      expect((await q(B.FAMILY_BILLABLE, [FAMILY.a])).length).toBeGreaterThan(0);
      expect(await q(B.REMINDER_TEMPLATE)).toHaveLength(1);
      expect(await q(B.PRIMARY_GUARDIAN, [OWES])).toHaveLength(1);
      expect(await q(B.SEND_DIRECT, [OWES, 'Reminder', 'Please pay'])).toHaveLength(1);
    });
  });

  it('show a guardian only their own family’s invoices', async () => {
    const B = await import('../src/lib/repos/billing');
    await asUser(USERS.guardianA, async q => {
      const rows = await q(B.INVOICES);
      expect(rows.every((r: any) => r.family_id === FAMILY.a)).toBe(true);
    });
  });
});
