/**
 * Stripe, as far as this codebase needs to know about it.
 *
 * Deliberately no SDK and no secret here: this module is pure, so it is
 * testable and safe to import anywhere. The server pieces that use it — a
 * route that creates a hosted Checkout Session and a webhook route — need a
 * server runtime, which the static demo does not have. docs/PAYMENTS.md walks
 * through wiring them up.
 *
 * Card details never touch this application. The parent pays on Stripe's
 * hosted page; Stripe tells us what happened; we record a provider reference.
 */

export type LedgerEvent = {
  provider: 'stripe';
  ref: string;
  invoiceId: string;
  amountMinor: number;
  outcome: 'succeeded' | 'failed' | 'refunded';
  failureCode?: string | null;
  refundedMinor?: number | null;
};

/** The SQL the webhook runs, as service_role, for a ledger event. */
export const APPLY_EVENT_SQL =
  'select app.apply_provider_event($1, $2, $3, $4, $5, $6, $7) as payment_id';

export const eventParams = (e: LedgerEvent) =>
  [e.provider, e.ref, e.invoiceId, e.amountMinor, e.outcome, e.failureCode ?? null, e.refundedMinor ?? null];

type StripeObject = Record<string, any>;
type StripeEvent = { id: string; type: string; data: { object: StripeObject } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Translate a verified Stripe event into a ledger movement, or null for the
 * many event types the ledger does not care about. Every event we act on must
 * carry our invoice id in metadata — set when the Checkout Session is created
 * — so a payment can never be attributed by guesswork.
 */
export function toLedgerEvent(event: StripeEvent): LedgerEvent | null {
  const o = event.data.object;
  const invoiceId = o.metadata?.invoice_id;
  if (typeof invoiceId !== 'string' || !UUID.test(invoiceId)) return null;

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (o.payment_status !== 'paid') return null;
      return { provider: 'stripe', ref: String(o.payment_intent), invoiceId,
               amountMinor: Number(o.amount_total), outcome: 'succeeded' };
    case 'checkout.session.async_payment_failed':
      return { provider: 'stripe', ref: String(o.payment_intent), invoiceId,
               amountMinor: Number(o.amount_total), outcome: 'failed', failureCode: 'async_payment_failed' };
    case 'payment_intent.payment_failed':
      return { provider: 'stripe', ref: String(o.id), invoiceId, amountMinor: Number(o.amount),
               outcome: 'failed', failureCode: o.last_payment_error?.code ?? 'payment_failed' };
    case 'charge.refunded':
      return { provider: 'stripe', ref: String(o.payment_intent), invoiceId,
               amountMinor: Number(o.amount), outcome: 'refunded',
               refundedMinor: Number(o.amount_refunded) };
    default:
      return null;
  }
}

/**
 * Verify a `Stripe-Signature` header (scheme v1: HMAC-SHA256 over
 * `${timestamp}.${payload}`) with Web Crypto, so it runs in Node and at the
 * edge alike. Rejects stale timestamps to blunt replay.
 */
export async function verifyStripeSignature(
  payload: string, header: string | null, secret: string,
  { toleranceSeconds = 300, now = Date.now() }: { toleranceSeconds?: number; now?: number } = {},
): Promise<boolean> {
  if (!header || !secret) return false;
  const fields = header.split(',').map(s => s.trim());
  const t = Number(fields.find(kv => kv.startsWith('t='))?.slice(2));
  const sigs = fields.filter(kv => kv.startsWith('v1=')).map(kv => kv.slice(3));
  if (!Number.isFinite(t) || sigs.length === 0) return false;
  if (Math.abs(now / 1000 - t) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`)));
  const expected = [...mac].map(b => b.toString(16).padStart(2, '0')).join('');
  return sigs.some(s => timingSafeEqual(s, expected));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/**
 * Parameters for a hosted Checkout Session. Amounts come from the database,
 * never from the client: the server looks the invoice up as the signed-in
 * guardian (so RLS proves it is theirs) and pays what is outstanding.
 */
export function checkoutSessionParams(inv: {
  id: string; number: string; outstanding_minor: number; family_id: string; studio_name: string;
}, urls: { success: string; cancel: string }) {
  if (!(inv.outstanding_minor > 0)) throw new Error('Nothing is outstanding on this invoice');
  return {
    mode: 'payment',
    success_url: urls.success,
    cancel_url: urls.cancel,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'gbp',
        unit_amount: inv.outstanding_minor,
        product_data: { name: `${inv.studio_name} — invoice ${inv.number}` },
      },
    }],
    metadata: { invoice_id: inv.id, family_id: inv.family_id },
    payment_intent_data: { metadata: { invoice_id: inv.id, family_id: inv.family_id } },
  } as const;
}

/** Whether this deployment can take card payments. The static demo cannot. */
export const cardPaymentsEnabled = () =>
  process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER === 'stripe';
