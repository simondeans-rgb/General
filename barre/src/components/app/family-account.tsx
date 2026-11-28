'use client';

import * as React from 'react';
import { Banknote, ChevronDown, Gift } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRow, useRows } from '@/lib/query';
import { useWrite } from '@/lib/write';
import { Button, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { money, dateShort, toMinor } from '@/lib/format';
import { cn } from '@/lib/cn';

const KIND_WORD: Record<B.StatementLine['kind'], string> = {
  invoice: 'Invoice', payment: 'Payment', credit: 'Credit', credit_note: 'Credit note', refund: 'Refund',
};
const METHOD: Record<string, string> = {
  card: 'Card', direct_debit: 'Direct debit', bank_transfer: 'Bank transfer', cash: 'Cash',
};

/**
 * A family's account as the office sees it (UR-10): what they owe or hold in
 * credit, goodwill credit, money received without an invoice, and the
 * statement of every movement. Shown on the family record and on an invoice.
 */
export function FamilyAccount({ familyId }: { familyId: string }) {
  const acc = useRow<B.FamilyAccount>(['family-account', familyId], B.FAMILY_ACCOUNT, [familyId]);
  const [sheet, setSheet] = React.useState<null | 'credit' | 'pay'>(null);
  const [statement, setStatement] = React.useState(false);
  const a = acc.data;
  const bal = Number(a?.balance_minor ?? 0);

  return (
    <div>
      {acc.isLoading && <Skeleton className="h-10" />}
      {acc.error != null && <ErrorState error={acc.error} />}
      {a && (
        <>
          <p className="text-sm">
            {bal > 0 && <>Owes <span className="tnum font-medium">{money(bal)}</span> in total.</>}
            {bal === 0 && 'Nothing owed.'}
            {bal < 0 && <>In credit by <span className="tnum font-medium">{money(-bal)}</span>. It comes off their next invoice.</>}
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-ink-3">
            Payment reference <span className="tnum font-medium text-ink-2">{a.reference}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setSheet('pay')}><Banknote className="size-4" aria-hidden /> Record payment</Button>
            <Button size="sm" variant="ghost" onClick={() => setSheet('credit')}><Gift className="size-4" aria-hidden /> Add credit</Button>
            <Button size="sm" variant="ghost" aria-expanded={statement} onClick={() => setStatement(s => !s)}>
              Statement <ChevronDown className={cn('size-4 transition-transform', statement && 'rotate-180')} aria-hidden />
            </Button>
          </div>
          {statement && <Statement familyId={familyId} />}
        </>
      )}
      {a && sheet === 'credit' && <AddCreditSheet account={a} onClose={() => setSheet(null)} />}
      {a && sheet === 'pay' && <PaymentOnAccountSheet account={a} onClose={() => setSheet(null)} />}
    </div>
  );
}

/** Every movement, oldest first, with the running balance. */
export function Statement({ familyId }: { familyId: string }) {
  const rows = useRows<B.StatementLine>(['family-statement', familyId], B.FAMILY_STATEMENT, [familyId]);
  if (rows.isLoading) return <Skeleton className="mt-3 h-24" />;
  if (rows.error) return <div className="mt-3"><ErrorState error={rows.error} /></div>;
  if (!rows.data?.length) return <p className="mt-3 text-[0.8438rem] text-ink-3">Nothing on this account yet.</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-[0.8438rem]">
        <caption className="sr-only">Statement</caption>
        <thead className="border-b border-line text-left">
          <tr>
            <th scope="col" className="label py-1.5 pr-2 font-semibold">Date</th>
            <th scope="col" className="label px-2 py-1.5 font-semibold">What</th>
            <th scope="col" className="label px-2 py-1.5 text-right font-semibold">Amount</th>
            <th scope="col" className="label py-1.5 pl-2 text-right font-semibold">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.data.map((l, n) => {
            const amt = Number(l.amount_minor);
            const detail = l.kind === 'payment' ? METHOD[l.detail ?? ''] ?? l.detail : l.detail;
            return (
              <tr key={n} className="align-top">
                <td className="tnum whitespace-nowrap py-1.5 pr-2 text-ink-2">{dateShort(l.on_date)}</td>
                <td className="min-w-0 px-2 py-1.5">
                  <span className="font-medium">{KIND_WORD[l.kind]}</span>
                  {l.ref && <span className="tnum text-ink-2"> {l.ref}</span>}
                  {detail && <span className="block text-[0.7812rem] text-ink-3">{detail}</span>}
                </td>
                <td className={cn('tnum whitespace-nowrap px-2 py-1.5 text-right', amt < 0 && 'text-positive')}>
                  {amt < 0 ? `−${money(-amt)}` : money(amt)}
                </td>
                <td className="tnum whitespace-nowrap py-1.5 pl-2 text-right font-medium">
                  {Number(l.balance_minor) < 0 ? `${money(-Number(l.balance_minor))} credit` : money(l.balance_minor)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


/** Goodwill credit: held on the account and taken off the next invoices. */
function AddCreditSheet({ account, onClose }: { account: B.FamilyAccount; onClose: () => void }) {
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const minor = toMinor(amount);
  const save = useWrite(B.ADD_FAMILY_CREDIT, { onDone: onClose, saved: () => `Added ${money(minor)} credit for ${account.name}` });
  return (
    <RecordSheet title="Add credit" subtitle={`${account.name}. It comes off what they owe now, then their next invoices.`}
      onClose={onClose} onSave={() => save.mutate([account.id, minor, reason.trim()])} saving={save.isPending} error={save.error}
      canSave={minor != null && minor > 0 && reason.trim().length >= 3} saveLabel="Add credit">
      <Field label="Amount" htmlFor="cr-a" required error={amount && minor == null ? 'Enter an amount like 5.00' : undefined}>
        <Input id="cr-a" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="tnum" />
      </Field>
      <Field label="Why" htmlFor="cr-r" required hint="Kept in the account history. The family sees “Credit from the studio”.">
        <Input id="cr-r" value={reason} onChange={e => setReason(e.target.value)} maxLength={200}
               placeholder="Class cancelled 1 Dec" />
      </Field>
    </RecordSheet>
  );
}

/** Money received without saying which invoice: applied oldest first, the rest held as credit. */
function PaymentOnAccountSheet({ account, onClose }: { account: B.FamilyAccount; onClose: () => void }) {
  const [amount, setAmount] = React.useState(Number(account.open_minor) > 0 ? (Number(account.open_minor) / 100).toFixed(2) : '');
  const [method, setMethod] = React.useState('bank_transfer');
  const [note, setNote] = React.useState('');
  const minor = toMinor(amount);
  const save = useWrite(B.RECORD_PAYMENT, { onDone: onClose, saved: () => `Recorded ${money(minor)} from ${account.name}` });
  return (
    <RecordSheet title="Record a payment"
      subtitle={`${account.name}. Applied to their oldest open invoices first; anything over is held as credit.`}
      onClose={onClose} onSave={() => save.mutate([account.id, minor, method, null, note || null])}
      saving={save.isPending} error={save.error} canSave={minor != null && minor > 0} saveLabel="Record payment">
      <Field label="Amount" htmlFor="poa-a" required error={amount && minor == null ? 'Enter an amount like 45.00' : undefined}>
        <Input id="poa-a" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className="tnum" />
      </Field>
      <Field label="How it was paid" htmlFor="poa-m">
        <Select id="poa-m" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
        </Select>
      </Field>
      <Field label="Note" htmlFor="poa-n" hint={`Their reference is ${account.reference}.`}>
        <Input id="poa-n" value={note} onChange={e => setNote(e.target.value)} maxLength={200} />
      </Field>
    </RecordSheet>
  );
}
