# Payments

## What works today

- Invoices with typed lines (tuition, term fee, exam fee, show fee, costume…),
  line and invoice discounts, drafts, issuing, voiding with a reason.
- Bank transfer and cash recorded by the office, against an invoice or on
  account. Money on account is applied to the oldest open invoice.
- Goodwill credit. Refunds of money the studio took itself.
- Family balance, outstanding, overdue and failed-payment views — all derived
  in the database (migration 0016).
- Parents see every invoice, its lines and what has been paid against it.

## What needs a server: card payments with Stripe

No card data ever touches Barre. Parents pay on Stripe's hosted Checkout;
Stripe reports back; Barre records a provider reference.

The pure parts are written and tested (`src/lib/payments/stripe.ts`,
`tests/stripe.test.ts`). The static demo cannot host the two routes that
use them. On a server deployment (drop `output: 'export'`):

**1. `POST /api/pay/[invoiceId]` — create a Checkout Session**

```ts
// Read the invoice AS THE SIGNED-IN GUARDIAN, so RLS proves it is theirs.
const [inv] = await readAs(session, `
  select i.id, i.number, i.family_id, i.total_minor - i.paid_minor as outstanding_minor,
         s.name as studio_name
    from invoice i join studio s on s.id = i.studio_id where i.id = $1`, [invoiceId]);
if (!inv) return new Response(null, { status: 404 });
const checkout = await stripe.checkout.sessions.create(
  checkoutSessionParams(inv, { success: `${origin}/family/payments?paid=1`, cancel: `${origin}/family/payments` }),
  { idempotencyKey: `${inv.id}:${inv.outstanding_minor}` });
return Response.redirect(checkout.url!, 303);
```

The amount comes from the database, never from the request.

**2. `POST /api/stripe/webhook`**

```ts
const body = await req.text();
if (!await verifyStripeSignature(body, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET!))
  return new Response('bad signature', { status: 400 });
const ev = toLedgerEvent(JSON.parse(body));
if (ev) await asServiceRole(q => q(APPLY_EVENT_SQL, eventParams(ev)));
return new Response('ok');
```

`app.apply_provider_event` is executable by `service_role` only, and is
idempotent on `(provider, provider_ref)` — Stripe retries webhooks, and a
retry must not take money twice. Refunds are recorded from `charge.refunded`
as the cumulative refunded amount, so replays change nothing.

**Environment:** `STRIPE_SECRET_KEY` (server only), `STRIPE_WEBHOOK_SECRET`
(server only), `NEXT_PUBLIC_PAYMENTS_PROVIDER=stripe`. Use test mode keys
(`sk_test_…`) until the studio has been through Stripe's onboarding.

## Deliberately not built

- **Direct debit / recurring billing.** Monthly pricing exists on classes;
  automatic monthly invoicing is the next step and belongs in the scheduler.
- **Card refunds from Barre.** They are made in Stripe, and arrive here via
  the webhook, so the ledger can never claim a refund the bank has not made.
