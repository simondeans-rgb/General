'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { RecordSheet } from './record-sheet';
import { useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Field, Input, Skeleton } from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { dateShort } from '@/lib/format';

const STUDIO = `select id from studio where deleted_at is null limit 1`;

/**
 * Where families send money by bank transfer (UR-22). Shown to families on
 * Payments with a copy button for each line. Only the owner changes them:
 * someone who could change the account number could take the money.
 */
export function BankDetailsSettings() {
  const studio = useRow<{ id: string }>(['my-studio-id'], STUDIO);
  const sid = studio.data?.id ?? '';
  const bank = useRow<B.BankDetails>(['bank-details', sid], B.BANK_DETAILS, [sid]);
  const owner = useSession().session?.role === 'owner';
  const [editing, setEditing] = React.useState(false);
  const b = bank.data;
  return (
    <Card>
      <CardHeader title="Bank details for payments" subtitle="Families see these under Payments › How to pay"
        action={owner && sid ? <Button size="sm" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden /> {b ? 'Edit' : 'Add'}</Button> : undefined} />
      {(studio.isLoading || bank.isLoading) && <div className="pt-3"><Skeleton className="h-14" /></div>}
      {!bank.isLoading && !b && (
        <p className="pt-3 text-[0.875rem] text-ink-2">
          Not set yet. Families are shown their payment reference only, and asked to contact you for the account details.
        </p>
      )}
      {b && (
        <dl className="grid grid-cols-1 gap-x-6 divide-y divide-line text-[0.9062rem] sm:grid-cols-2 sm:divide-y-0">
          <Fact label="Account name" value={b.payee_name} />
          <Fact label="Sort code" value={b.sort_code} />
          <Fact label="Account number" value={b.account_number} />
          <Fact label="IBAN" value={b.iban ?? 'Not given'} />
        </dl>
      )}
      {b && <p className="pt-2 text-[0.7812rem] text-ink-3">Last changed {dateShort(b.updated_at)}. Every change is kept in the audit trail.</p>}
      {!owner && <p className="pt-2 text-[0.8125rem] text-ink-3">Only the studio owner can change these.</p>}
      {editing && sid && <BankSheet studioId={sid} current={b} onClose={() => setEditing(false)} />}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-3 sm:border-b sm:border-line">
      <dt className="text-[0.8125rem] text-ink-3">{label}</dt>
      <dd className="tnum mt-0.5 break-words font-medium">{value}</dd>
    </div>
  );
}

function BankSheet({ studioId, current, onClose }: { studioId: string; current?: B.BankDetails; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [payee, setPayee] = React.useState(current?.payee_name ?? '');
  const [sort, setSort] = React.useState(current?.sort_code ?? '');
  const [account, setAccount] = React.useState(current?.account_number ?? '');
  const [iban, setIban] = React.useState(current?.iban ?? '');
  const sortOk = sort.replace(/\D/g, '').length === 6;
  const accOk = account.replace(/\D/g, '').length === 8;
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(B.SET_BANK_DETAILS, [studioId, payee, sort, account, iban || null])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  return (
    <RecordSheet title="Bank details for payments" subtitle="Check them twice: families will send money to this account."
      onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error}
      canSave={payee.trim().length >= 2 && sortOk && accOk}>
      <Field label="Account name" htmlFor="bk-p" required hint="As it appears on the account, so the family's bank can confirm the payee.">
        <Input id="bk-p" value={payee} onChange={e => setPayee(e.target.value)} maxLength={140} autoComplete="off" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sort code" htmlFor="bk-s" required error={sort && !sortOk ? 'Six digits' : undefined}>
          <Input id="bk-s" inputMode="numeric" value={sort} onChange={e => setSort(e.target.value)} placeholder="12-34-56" className="tnum" autoComplete="off" />
        </Field>
        <Field label="Account number" htmlFor="bk-a" required error={account && !accOk ? 'Eight digits' : undefined}>
          <Input id="bk-a" inputMode="numeric" value={account} onChange={e => setAccount(e.target.value)} placeholder="12345678" className="tnum" autoComplete="off" />
        </Field>
      </div>
      <Field label="IBAN" htmlFor="bk-i" hint="Optional. For families paying from abroad.">
        <Input id="bk-i" value={iban} onChange={e => setIban(e.target.value)} className="tnum" autoComplete="off" />
      </Field>
    </RecordSheet>
  );
}
