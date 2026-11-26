'use client';

import * as React from 'react';
import { ChevronDown, Copy } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import * as B from '@/lib/repos/billing';
import { cn } from '@/lib/cn';
import { Button, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import * as F from '@/lib/repos/family';
import { money, dateShort } from '@/lib/format';
import { SectionHead, dueWord } from '../_parts/ui';

/** Status in words; colour only supports it. */
const STATUS: Record<string, { label: string; tone: string }> = {
  paid:      { label: 'Paid',      tone: 'text-positive' },
  issued:    { label: 'Due',       tone: 'text-caution' },
  part_paid: { label: 'Part paid', tone: 'text-caution' },
  draft:     { label: 'Draft',     tone: 'text-ink-3' },
  void:      { label: 'Void',      tone: 'text-ink-3' },
  refunded:  { label: 'Refunded',  tone: 'text-info' },
};

type Invoice = { id: string; number: string; status: string; issued_on: string;
                 due_on: string; total_minor: number; paid_minor: number };

/** Calm and exact: what is due, what it is for, how to pay it, and what has been paid. */
export default function ParentPayments() {
  const balance = useRow<{ name: string; balance_minor: string; unpaid: number; failed: number }>(
    ['my-balance'], F.MY_BALANCE);
  const invoices = useRows<Invoice>(['my-invoices'], F.MY_INVOICES);

  const owes = !!balance.data && Number(balance.data.balance_minor) > 0;
  const credit = !!balance.data && Number(balance.data.balance_minor) < 0;
  const unpaid = (invoices.data ?? []).filter(i => i.status === 'issued' || i.status === 'part_paid')
    .sort((a, b) => String(a.due_on).localeCompare(String(b.due_on)));
  const due = unpaid[0]?.due_on;

  return (
    <Shell title="Payments" allow={['guardian']}>
      <div className="mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0 space-y-10">
          {/* The amount: the one number on this screen worth making big. */}
          <section aria-labelledby="due-h">
            {balance.isLoading && <Skeleton className="h-28" />}
            {balance.error != null && <ErrorState error={balance.error} onRetry={() => balance.refetch()} />}
            {balance.data && (
              <>
                <p id="due-h" className={cn('label', owes && 'text-caution')}>
                  {owes ? (due ? `Due ${dueWord(due)}` : 'To pay') : credit ? 'In credit' : 'Balance'}
                </p>
                <p className="display-xl mt-1 text-[56px] leading-none sm:text-[72px]">
                  {owes ? money(balance.data.balance_minor) : credit ? money(-Number(balance.data.balance_minor)) : '£0.00'}
                </p>
                <p className="mt-2 text-[15px] text-ink-2">
                  {owes
                    ? balance.data.failed > 0
                      ? 'A card payment did not go through. Nothing was taken.'
                      : `${balance.data.unpaid} invoice${balance.data.unpaid === 1 ? '' : 's'} outstanding.`
                    : credit ? 'Credit on your account comes off the next invoice.'
                      : 'Everything is paid. Nothing is due.'}
                </p>
              </>
            )}
          </section>

          {/* What the amount is for, line by line. */}
          {unpaid.map(i => <Ledger key={i.id} i={i} />)}
        </div>

        <div className="min-w-0 space-y-10">
          {owes && <HowToPay reference={unpaid[0]?.number ?? balance.data?.name ?? ''} several={unpaid.length > 1} />}

          <section aria-labelledby="hist-h">
            <SectionHead id="hist-h" title="Invoices" meta={invoices.data?.length ? 'Latest eight' : undefined} />
            {invoices.isLoading && <div className="space-y-2 pt-3">{[0, 1].map(i => <Skeleton key={i} className="h-12" />)}</div>}
            {invoices.error != null && <ErrorState error={invoices.error} />}
            {invoices.data?.length === 0 && <EmptyState title="No invoices yet" body="They appear here as the studio issues them." />}
            <ul className="divide-y divide-line">
              {invoices.data?.map(i => <InvoiceLine key={i.id} i={i} />)}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}

/** An unpaid invoice as a ledger: each line, grouped by child, then the total. */
function Ledger({ i }: { i: Invoice }) {
  const items = useRows<B.ItemRow>(['invoice-items', i.id], B.INVOICE_ITEMS, [i.id]);
  const groups = React.useMemo(() => {
    const m = new Map<string, B.ItemRow[]>();
    (items.data ?? []).forEach(it => { const k = it.student_name ?? ''; m.set(k, [...(m.get(k) ?? []), it]); });
    return [...m.entries()];
  }, [items.data]);
  const left = Number(i.total_minor) - Number(i.paid_minor);
  return (
    <section aria-label={`Invoice ${i.number}`}>
      <SectionHead title={<span className="tnum">{i.number}</span>} meta={`Issued ${dateShort(i.issued_on)} · due ${dateShort(i.due_on)}`} />
      {items.isLoading && <Skeleton className="mt-3 h-20" />}
      <dl className="text-[14.5px]">
        {groups.map(([kid, list]) => (
          <div key={kid} className="border-b border-line py-2">
            {kid && <dt className="label pb-1 pt-1">{kid}</dt>}
            {list.map(it => (
              <dd key={it.id} className="flex gap-4 py-1">
                <span className="min-w-0 flex-1">{it.description}
                  {Number(it.quantity) > 1 && <span className="text-ink-3"> × {Number(it.quantity)}</span>}</span>
                <span className={cn('tnum', Number(it.total_minor) < 0 && 'text-positive')}>{money(it.total_minor)}</span>
              </dd>
            ))}
          </div>
        ))}
        {Number(i.paid_minor) > 0 && (
          <div className="flex gap-4 border-b border-line py-2 text-ink-2">
            <dt className="flex-1">Paid so far</dt><dd className="tnum">−{money(i.paid_minor)}</dd>
          </div>
        )}
        <div className="flex gap-4 pt-2.5 font-semibold">
          <dt className="flex-1">{Number(i.paid_minor) > 0 ? 'Left to pay' : 'Total'}</dt>
          <dd className="tnum">{money(left)}</dd>
        </div>
      </dl>
    </section>
  );
}

/** How to pay. Card payment is honest about not being connected yet. */
function HowToPay({ reference, several }: { reference: string; several: boolean }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <section aria-labelledby="how-h">
      <SectionHead id="how-h" title="How to pay" />
      <div className="divide-y divide-line">
        <div className="py-3">
          <p className="font-semibold">Bank transfer</p>
          <p className="mt-0.5 text-[13.5px] text-ink-3">Use this reference so the studio can match your payment{several ? ' (pay each invoice with its own number)' : ''}.</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-display text-[22px] leading-none tnum">{reference}</span>
            <Button size="sm" aria-label={`Copy reference ${reference}`}
              onClick={() => navigator.clipboard?.writeText(reference).then(() => setCopied(true)).catch(() => {})}>
              <Copy className="size-4" aria-hidden /> {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p role="status" className="sr-only">{copied ? 'Reference copied' : ''}</p>
        </div>
        <div className="py-3">
          <p className="font-semibold">Card or Apple Pay</p>
          <p className="mt-0.5 text-[13.5px] text-ink-3">
            Opens here once the studio connects its payment provider. Until then, pay by transfer or at the studio;
            they record it and it shows here straight away.
          </p>
        </div>
      </div>
    </section>
  );
}

const METHOD: Record<string, string> = {
  card: 'Card', direct_debit: 'Direct debit', bank_transfer: 'Bank transfer', cash: 'Cash',
  credit: 'Credit from the studio', account: 'Credit on your account',
};

/** Tap an invoice to see exactly what it is for and what has been paid. */
function InvoiceLine({ i }: { i: Invoice }) {
  const [open, setOpen] = React.useState(false);
  const items = useRows<B.ItemRow>(['invoice-items', i.id], B.INVOICE_ITEMS, [i.id], { enabled: open });
  const payments = useRows<B.PaymentRow>(['invoice-payments', i.id], B.INVOICE_PAYMENTS, [i.id], { enabled: open });
  const s = STATUS[i.status] ?? STATUS.draft!;
  const outstanding = Number(i.total_minor) - Number(i.paid_minor);
  return (
    <li>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="grid min-h-[56px] w-full grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-3 py-3 text-left hover:bg-surface-2/60">
        <span className="min-w-0">
          <span className="flex items-baseline gap-2">
            <span className="tnum font-semibold">{i.number}</span>
            <span className={cn('text-[13px] font-semibold', s.tone)}>{s.label}</span>
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-3">
            Issued {dateShort(i.issued_on)} · due {dateShort(i.due_on)}
          </span>
        </span>
        <span className="text-right">
          <span className="tnum block font-semibold">{money(i.total_minor)}</span>
          {outstanding > 0 && i.status !== 'void' && (
            <span className="tnum block text-[12.5px] text-caution">{money(outstanding)} left</span>
          )}
        </span>
        <ChevronDown className={cn('size-4 text-ink-3 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="space-y-3 pb-4 pl-3 text-[14px]">
          {items.isLoading && <Skeleton className="h-10" />}
          <ul className="space-y-1.5 border-l-2 border-line pl-3">
            {items.data?.map(it => (
              <li key={it.id} className="flex gap-3">
                <span className="min-w-0 flex-1">{it.student_name ? <span className="text-ink-3">{it.student_name} · </span> : null}{it.description}</span>
                <span className="tnum">{money(it.total_minor)}</span>
              </li>
            ))}
          </ul>
          {payments.data && payments.data.length > 0 && (
            <ul className="space-y-1.5 border-l-2 border-line pl-3 text-[13px] text-ink-2">
              {payments.data.map(p => (
                <li key={p.id} className="flex gap-3">
                  <span className="flex-1">
                    {p.succeeded_at ? `${METHOD[p.method] ?? p.method}, ${dateShort(p.succeeded_at)}`
                      : `${METHOD[p.method] ?? p.method} did not go through`}
                    {Number(p.refunded_minor) > 0 && ` · ${money(p.refunded_minor)} refunded`}
                  </span>
                  <span className={cn('tnum', !p.succeeded_at && 'line-through')}>{money(p.amount_minor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
