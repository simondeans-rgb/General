'use client';

import * as React from 'react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { useWrite } from '@/lib/write';
import { Button, Field, Input, Select } from '@/components/ui';
import * as B from '@/lib/repos/billing';

type Mode = 'family' | 'one' | 'percent' | 'per_child';
const MODES: [Mode, string][] = [
  ['family', 'The whole family'],
  ['one', 'One guardian'],
  ['percent', 'Split by percentage'],
  ['per_child', 'Each child to a guardian'],
];

/**
 * Who a family's invoices go to (UR-17). The default is the whole family, as
 * before. Billing runs raise one invoice per paying guardian, and each
 * guardian sees only the invoices addressed to them.
 */
export function BillingSplit({ familyId }: { familyId: string }) {
  const split = useRows<B.FamilyBilling>(['family-billing', familyId], B.FAMILY_BILLING, [familyId]).data?.[0];
  const guardians = useRows<{ id: string; full_name: string }>(['family-guardians', familyId], B.FAMILY_GUARDIANS, [familyId]);
  const [open, setOpen] = React.useState(false);
  if (!split) return null;
  const name = (id: string | null) => guardians.data?.find(g => g.id === id)?.full_name ?? 'a guardian';
  const summary = split.mode === 'one' ? `Invoices go to ${name(split.guardian_a)}.`
    : split.mode === 'percent' ? `Invoices are split: ${split.percent_a}% ${name(split.guardian_a)}, ${100 - (split.percent_a ?? 0)}% ${name(split.guardian_b)}.`
    : split.mode === 'per_child' ? 'Each child’s fees go to the guardian chosen for them.'
    : 'Invoices go to the whole family.';
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="text-[0.875rem]">{summary}</p>
      {(guardians.data?.length ?? 0) > 1 || split.mode !== 'family' ? (
        <Button size="sm" variant="ghost" className="-ml-2 mt-1" onClick={() => setOpen(true)}>Change who pays</Button>
      ) : null}
      {open && <SplitSheet familyId={familyId} split={split} guardians={guardians.data ?? []} onClose={() => setOpen(false)} />}
    </div>
  );
}

function SplitSheet({ familyId, split, guardians, onClose }: {
  familyId: string; split: B.FamilyBilling; guardians: { id: string; full_name: string }[]; onClose: () => void;
}) {
  const children = useRows<{ id: string; first_name: string; guardian_id: string | null }>(
    ['family-billing-children', familyId], B.FAMILY_BILLING_CHILDREN, [familyId]);
  const [mode, setMode] = React.useState<Mode>(split.mode);
  const [a, setA] = React.useState(split.guardian_a ?? guardians[0]?.id ?? '');
  const [b, setB] = React.useState(split.guardian_b ?? guardians.find(g => g.id !== (split.guardian_a ?? guardians[0]?.id))?.id ?? '');
  const [pct, setPct] = React.useState(String(split.percent_a ?? 50));
  const [kids, setKids] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (children.data) setKids(Object.fromEntries(children.data.map(c => [c.id, c.guardian_id ?? ''])));
  }, [children.data]);

  // One save model (U5): the family record shows the new split before this closes.
  const write = useWrite(B.SET_FAMILY_BILLING, { onDone: onClose, saved: 'Saved who pays' });
  const save = { ...write, mutate: () => write.mutate(
      [familyId, mode, mode === 'family' ? null : a || null, mode === 'percent' ? b || null : null,
       mode === 'percent' ? Number(pct) : null, mode === 'per_child' ? JSON.stringify(kids) : null]) };
  const n = Number(pct);
  const ok = mode === 'family' || (!!a && (mode !== 'percent' || (!!b && b !== a && n >= 1 && n <= 99)));

  return (
    <RecordSheet title="Who pays" subtitle="Applies to invoices from the next billing run" onClose={onClose}
      onSave={() => save.mutate()} saving={save.isPending} error={save.error} canSave={ok}
      saveHint={!ok ? (mode === 'percent' ? 'Choose two different guardians and a share between 1% and 99%.' : 'Choose a guardian.') : null}>
      <Field label="Invoices go to" htmlFor="bs-mode">
        <Select id="bs-mode" value={mode} onChange={e => setMode(e.target.value as Mode)}>
          {MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </Field>
      {mode !== 'family' && (
        <Field label={mode === 'per_child' ? 'Anyone not chosen below' : mode === 'percent' ? 'First guardian' : 'Guardian'} htmlFor="bs-a">
          <Select id="bs-a" value={a} onChange={e => setA(e.target.value)}>
            {guardians.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
          </Select>
        </Field>
      )}
      {mode === 'percent' && (
        <>
          <Field label="Their share (%)" htmlFor="bs-pct" hint={n >= 1 && n <= 99 ? `The other guardian pays ${100 - n}%.` : 'Between 1 and 99.'}>
            <Input id="bs-pct" type="number" min={1} max={99} value={pct} onChange={e => setPct(e.target.value)} className="w-24" />
          </Field>
          <Field label="Second guardian" htmlFor="bs-b">
            <Select id="bs-b" value={b} onChange={e => setB(e.target.value)}>
              <option value="">Choose…</option>
              {guardians.filter(g => g.id !== a).map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
            </Select>
          </Field>
        </>
      )}
      {mode === 'per_child' && children.data?.map(c => (
        <Field key={c.id} label={c.first_name} htmlFor={`bs-k-${c.id}`}>
          <Select id={`bs-k-${c.id}`} value={kids[c.id] ?? ''} onChange={e => setKids(k => ({ ...k, [c.id]: e.target.value }))}>
            <option value="">The guardian above</option>
            {guardians.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
          </Select>
        </Field>
      ))}
      <p className="text-[0.8125rem] text-ink-2">
        Each paying guardian gets their own invoice and sees only that. You see all of them. Invoices already raised stay as they are.
      </p>
    </RecordSheet>
  );
}
