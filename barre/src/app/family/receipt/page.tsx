'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import { useRows, useRow } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import * as F from '@/lib/repos/family';
import * as B from '@/lib/repos/billing';
import { money, dateLong, time } from '@/lib/format';

const METHOD: Record<string, string> = {
  card: 'Card', direct_debit: 'Direct debit', bank_transfer: 'Bank transfer', cash: 'Cash',
  credit: 'Credit from the studio', account: 'Credit on your account',
};

export default function ReceiptPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Receipt /></Suspense>;
}

/**
 * A printable receipt for one payment (F8): who paid, how much, when, how,
 * and what it was for. Plain page, no app chrome, so it prints or saves as a
 * PDF cleanly. Row level security decides whose receipts can be read.
 */
function Receipt() {
  const id = useSearchParams().get('id') ?? '';
  const { session } = useSession();
  const r = useRow<F.Receipt>(['receipt', id], F.MY_RECEIPT, [id]);
  const items = useRows<B.ItemRow>(['invoice-items', r.data?.invoice_id ?? ''], B.INVOICE_ITEMS, [r.data?.invoice_id ?? null],
    { enabled: !!r.data?.invoice_id });
  const p = r.data;
  return (
    <main id="main" className="min-h-dvh bg-surface px-4 pb-12 pt-6 print:p-0">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3 print:hidden">
          <Link href="/family/payments" className="text-[0.875rem] font-semibold text-accent-text hover:underline">Back to payments</Link>
          {p && <Button size="sm" className="ml-auto" onClick={() => window.print()}><Printer className="size-4" aria-hidden /> Print or save as PDF</Button>}
        </div>
        {!session && <EmptyState title="Sign in to see this receipt" body="Receipts are shown to the family who paid." />}
        {session && r.isLoading && <Skeleton className="h-64" />}
        {r.error != null && <ErrorState error={r.error} />}
        {session && !r.isLoading && !p && !r.error && (
          <EmptyState title="Receipt not found" body="It may belong to another account. Open it from your payments." />
        )}
        {p && (
          <article aria-labelledby="rc-h">
            <header className="border-b-2 border-ink pb-3">
              <p className="font-display text-[1.375rem] leading-tight">{p.studio_name}</p>
              <h1 id="rc-h" className="mt-3 text-[1.0625rem] font-semibold">Receipt <span className="tnum">{p.reference}</span></h1>
            </header>
            <dl className="divide-y divide-line text-[0.9375rem]">
              {([
                ['Amount received', <span key="a" className="stat-number text-[1.75rem] leading-none tnum">{money(p.amount_minor)}</span>],
                ['Date', `${dateLong(p.succeeded_at)}, ${time(p.succeeded_at)}`],
                ['Paid by', p.payer ?? p.family_name],
                ['Account', p.family_name],
                ['Method', METHOD[p.method] ?? p.method],
                ['For', p.invoice_number ? `Invoice ${p.invoice_number}` : 'Held on account for the next invoice'],
                ...(Number(p.refunded_minor) > 0 ? [['Refunded', money(p.refunded_minor)]] : []),
              ] as [string, React.ReactNode][]).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 py-2.5">
                  <dt className="text-ink-3">{k}</dt><dd className="min-w-0">{v}</dd>
                </div>
              ))}
            </dl>
            {!!items.data?.length && (
              <section aria-labelledby="rc-items" className="mt-6">
                <h2 id="rc-items" className="section-title border-b-2 border-ink pb-2">Invoice {p.invoice_number}</h2>
                <ul className="divide-y divide-line text-[0.9062rem]">
                  {items.data.map(it => (
                    <li key={it.id} className="flex gap-4 py-2">
                      <span className="min-w-0 flex-1">{it.student_name ? <span className="text-ink-3">{it.student_name} · </span> : null}{it.description}</span>
                      <span className="tnum">{money(it.total_minor)}</span>
                    </li>
                  ))}
                  <li className="flex gap-4 py-2 font-semibold"><span className="flex-1">Invoice total</span><span className="tnum">{money(p.invoice_total)}</span></li>
                  <li className="flex gap-4 py-2 text-ink-2">
                    <span className="flex-1">Left to pay on this invoice</span>
                    <span className="tnum">{money(Math.max(0, Number(p.invoice_total) - Number(p.invoice_paid)))}</span>
                  </li>
                </ul>
              </section>
            )}
            <p className="mt-8 text-[0.7812rem] text-ink-3">Issued by {p.studio_name} through Swayvo. Keep this receipt for your records.</p>
          </article>
        )}
      </div>
    </main>
  );
}
