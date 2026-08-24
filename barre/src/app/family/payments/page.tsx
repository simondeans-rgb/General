'use client';

import * as React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as F from '@/lib/repos/family';
import { money, dateShort } from '@/lib/format';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  paid:      { label: 'Paid',      tone: 'positive' },
  issued:    { label: 'Due',       tone: 'caution' },
  part_paid: { label: 'Part paid', tone: 'caution' },
  draft:     { label: 'Draft',     tone: 'neutral' },
  void:      { label: 'Void',      tone: 'neutral' },
  refunded:  { label: 'Refunded',  tone: 'info' },
};

export default function ParentPayments() {
  const balance = useRow<{ name: string; balance_minor: string; unpaid: number; failed: number }>(
    ['my-balance'], F.MY_BALANCE);
  const invoices = useRows<{ id: string; number: string; status: string; issued_on: string;
                             due_on: string; total_minor: number; paid_minor: number }>(
    ['my-invoices'], F.MY_INVOICES);

  const owes = balance.data && Number(balance.data.balance_minor) > 0;

  return (
    <Shell title="Payments" allow={['guardian']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <div className="p-4">
            {balance.isLoading && <Skeleton className="h-12" />}
            {balance.data && (
              <>
                <p className="text-[13px] text-ink-3">Balance</p>
                <p className={`tnum mt-0.5 text-[30px] font-semibold leading-none tracking-[-0.02em] ${
                  owes ? 'text-caution' : 'text-positive'}`}>
                  {owes ? money(balance.data.balance_minor) : '£0.00'}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-2">
                  {owes ? (
                    <>
                      <AlertTriangle className="size-4 text-caution" aria-hidden />
                      {balance.data.failed > 0
                        ? 'A card payment did not go through.'
                        : `${balance.data.unpaid} invoice${balance.data.unpaid === 1 ? '' : 's'} outstanding.`}
                    </>
                  ) : (
                    <><CheckCircle2 className="size-4 text-positive" aria-hidden /> Everything is paid.</>
                  )}
                </p>
              </>
            )}
          </div>
          {/* Card payments are not built yet. Saying so is better than a button
              that looks live and does nothing. */}
          <div className="flex items-start gap-2.5 border-t border-line bg-surface-2 p-3">
            <CreditCard className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
            <p className="text-[13px] text-ink-2">
              Paying by card in the app is coming. For now the studio will tell you how
              they would like to be paid — and everything you owe is itemised below.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Invoices" />
          {invoices.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-12" />)}</div>}
          {invoices.error && <div className="p-4"><ErrorState error={invoices.error} /></div>}
          {invoices.data?.length === 0 && <EmptyState icon={<FileText className="size-5" />}
            title="No invoices yet" body="They will appear here as the studio issues them." />}
          <ul className="divide-y divide-line">
            {invoices.data?.map(i => {
              const s = STATUS[i.status] ?? STATUS.draft!;
              const outstanding = Number(i.total_minor) - Number(i.paid_minor);
              return (
                <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="tnum font-medium">{i.number}</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-2">
                      Issued {dateShort(i.issued_on)} · due {dateShort(i.due_on)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tnum block font-medium">{money(i.total_minor)}</span>
                    {outstanding > 0 && (
                      <span className="tnum block text-[12px] text-caution">{money(outstanding)} left</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
