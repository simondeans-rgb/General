import { createHmac } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asService, asUser, closeDb, expectRejected, rebuild, USERS, uid, NS } from './helpers';
import {
  APPLY_EVENT_SQL, checkoutSessionParams, eventParams, toLedgerEvent, verifyStripeSignature,
} from '../src/lib/payments/stripe';

const INVOICE = uid(NS.invoice, 23);   // family 23, £90 outstanding
const FAMILY23 = uid(NS.family, 23);

describe('reading Stripe events', () => {
  const completed = {
    id: 'evt_1', type: 'checkout.session.completed',
    data: { object: { payment_status: 'paid', payment_intent: 'pi_123', amount_total: 9000,
                      metadata: { invoice_id: INVOICE } } },
  };

  it('turns a paid checkout into a succeeded payment', () => {
    expect(toLedgerEvent(completed)).toEqual({
      provider: 'stripe', ref: 'pi_123', invoiceId: INVOICE, amountMinor: 9000, outcome: 'succeeded' });
  });

  it('ignores events without our invoice id, and unpaid sessions', () => {
    expect(toLedgerEvent({ ...completed, data: { object: { ...completed.data.object, metadata: {} } } })).toBeNull();
    expect(toLedgerEvent({ ...completed, data: { object: { ...completed.data.object,
      metadata: { invoice_id: "x'; drop table payment;--" } } } })).toBeNull();
    expect(toLedgerEvent({ ...completed, data: { object: { ...completed.data.object, payment_status: 'unpaid' } } }))
      .toBeNull();
    expect(toLedgerEvent({ ...completed, type: 'customer.created' })).toBeNull();
  });

  it('carries the decline code of a failed payment', () => {
    const e = toLedgerEvent({ id: 'evt_2', type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_9', amount: 9000, metadata: { invoice_id: INVOICE },
                        last_payment_error: { code: 'card_declined' } } } });
    expect(e?.outcome).toBe('failed');
    expect(e?.failureCode).toBe('card_declined');
  });

  it('builds a checkout from the outstanding amount only', () => {
    const p = checkoutSessionParams({ id: INVOICE, number: 'INV-1063', outstanding_minor: 9000,
      family_id: FAMILY23, studio_name: 'Northstar' }, { success: 'https://x/ok', cancel: 'https://x/no' });
    expect(p.line_items[0].price_data.unit_amount).toBe(9000);
    expect(p.metadata.invoice_id).toBe(INVOICE);
    expect(() => checkoutSessionParams({ id: INVOICE, number: 'x', outstanding_minor: 0,
      family_id: FAMILY23, studio_name: 'N' }, { success: '', cancel: '' })).toThrow();
  });
});

describe('verifying the webhook signature', () => {
  const secret = 'whsec_test';
  const payload = '{"id":"evt_1"}';
  const now = 1_700_000_000_000;
  const sign = (t: number, body = payload, key = secret) =>
    `t=${t},v1=${createHmac('sha256', key).update(`${t}.${body}`).digest('hex')}`;

  it('accepts a genuine signature', async () => {
    expect(await verifyStripeSignature(payload, sign(now / 1000), secret, { now })).toBe(true);
  });
  it('rejects a tampered body, a wrong key, a stale timestamp and no header', async () => {
    expect(await verifyStripeSignature('{"id":"evt_2"}', sign(now / 1000), secret, { now })).toBe(false);
    expect(await verifyStripeSignature(payload, sign(now / 1000, payload, 'whsec_other'), secret, { now })).toBe(false);
    expect(await verifyStripeSignature(payload, sign(now / 1000 - 3600), secret, { now })).toBe(false);
    expect(await verifyStripeSignature(payload, null, secret, { now })).toBe(false);
  });
});

describe('applying provider events to the ledger', () => {
  beforeAll(async () => { await rebuild(); }, 60_000);
  afterAll(async () => { await closeDb(); });

  const ev = (outcome: 'succeeded' | 'failed' | 'refunded', extra = {}) => eventParams({
    provider: 'stripe', ref: 'pi_test_1', invoiceId: INVOICE, amountMinor: 9000, outcome, ...extra });

  it('a succeeded payment settles the invoice, and a replay changes nothing', async () => {
    await asService(async q => {
      await q(APPLY_EVENT_SQL, ev('succeeded'));
      await q(APPLY_EVENT_SQL, ev('succeeded'));
      const [inv] = await q('select status, paid_minor from invoice where id = $1', [INVOICE]);
      expect(inv.status).toBe('paid');
      expect(Number(inv.paid_minor)).toBe(9000);
      const [f] = await q('select balance_minor from family where id = $1', [FAMILY23]);
      expect(Number(f.balance_minor)).toBe(0);
    });
  });

  it('a refund reported by the provider reopens the invoice', async () => {
    await asService(async q => {
      await q(APPLY_EVENT_SQL, ev('succeeded'));
      await q(APPLY_EVENT_SQL, ev('refunded', { refundedMinor: 9000 }));
      await q(APPLY_EVENT_SQL, ev('refunded', { refundedMinor: 9000 }));
      const [inv] = await q('select status, paid_minor from invoice where id = $1', [INVOICE]);
      expect(inv.status).toBe('refunded');
      expect(Number(inv.paid_minor)).toBe(0);
    });
  });

  it('a failed payment is recorded but is not money', async () => {
    await asService(async q => {
      await q(APPLY_EVENT_SQL, ev('failed', { failureCode: 'insufficient_funds' }));
      const [inv] = await q('select status, paid_minor from invoice where id = $1', [INVOICE]);
      expect(inv.status).toBe('issued');
      const [p] = await q(`select failure_code from payment where provider_ref = 'pi_test_1'`);
      expect(p.failure_code).toBe('insufficient_funds');
    });
  });

  it('cannot be called by a signed-in user, however senior', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(APPLY_EVENT_SQL, ev('succeeded')))).toMatch(/permission denied/);
    });
  });
});
