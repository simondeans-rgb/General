# Payments

## What works today

- Invoices with typed lines (tuition, term fee, exam fee, show fee, costume…),
  line and invoice discounts, drafts, issuing, voiding with a reason.
- **Billing runs** for a term or a month. A run never bills a family twice for
  a period: lines that name the class are matched child by child (so a
  mid-term joiner is still billed), and a family that already has any other
  tuition invoice for the period — imported, hand-made — is skipped and listed
  as "Already billed for this period". The office can include a skipped family
  with a reason, which is logged against the family (migration 0045).
- **Discounts:** sibling and multi-class rules, and per-family bursaries or
  staff rates. Ending a family discount stops it applying to any later run;
  its history is kept.
- **Bank transfer and cash** recorded by the office, against an invoice or on
  account ("Record payment" on the family's account). Money on account is
  applied to the oldest open invoice; anything over is held as credit.
- **Goodwill credit:** "Add credit" on the family's account, with a reason.
  It comes off what they owe now, then their next invoices.
- **Credit notes:** "Credit note" on an issued invoice lowers what it charges,
  with a reason. The value either comes off what is still owed (any rest is
  held as credit for the next invoice) or is handed back as a refund. Credit
  notes are numbered CN-1001…, appear on the family statement and in the Xero
  export (as negative sales invoices, which Xero imports as credit notes).
- **Refunds of money the studio took itself** (transfer, cash). Refunding a
  payment on an invoice issues a credit note and the invoice **stays settled**:
  the family was charged less, so nothing becomes owed and nobody is chased.
  A payment that was recorded by mistake can instead be reversed, which
  reopens the invoice. Every refund is its own dated row.
- **Family statement:** invoices, payments, credit notes, goodwill credit and
  refunds, oldest first, with a running balance (family record → Statement).
- Family balance, outstanding, overdue and failed-payment views — all derived
  in the database (migrations 0016, 0045).
- **Paying by transfer:** the owner enters the school's bank details (payee,
  sort code, account number, optional IBAN) in Settings → Money. Families see
  them under Payments → How to pay, each with a Copy button, with the invoice
  number as the reference — or, for several invoices, one family reference
  (for example `WRIGHT-0001`) that the office matches when recording it.
- **Coming up:** families see each child's expected costs — next term's fees
  (an estimate from this term's prices), confirmed event, competition and exam
  fees, costumes and private lessons — with dates, a total, and whether each
  is Expected, Invoiced or Paid. A confirmed private lesson with a price
  raises a draft invoice for the office to check and send.
- **In-app notifications** (respecting each family's preferences): a new
  invoice, a payment received, an invoice due within three days, and a
  confirmed event place. Email and push follow once delivery is connected.
- **Payment reminders** to every overdue family at once, with a preview of
  exactly what each family will read; one message each, logged per family.
- Parents see every invoice sent to them (never drafts), its lines and what
  has been paid against it.

## What does not work yet

- **Card payments.** Nothing can be paid by card in the app until a payment
  provider is connected (below). Until then the family home says "See how to
  pay", not "Pay", and the office's failed-card figures offer "Show failed"
  rather than a retry that cannot happen. The seeded "card" payments in the
  demo are sample data.

## What needs a server: card payments with Stripe

No card data ever touches Swayvo. Parents pay on Stripe's hosted Checkout;
Stripe reports back; Swayvo records a provider reference.

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
- **Card refunds from Swayvo.** They are made in Stripe, and arrive here via
  the webhook, so the ledger can never claim a refund the bank has not made.
  A card-paid invoice can still be given a credit note held as credit on
  account. Linking provider refunds to credit notes comes with card payments.
- **Due-date reminders on a schedule.** `app.notify_invoices_due()` is
  idempotent. In the demo it runs when a family opens the app; a server
  deployment should also call it from its scheduled job (`app.tick`).
