'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort } from '@/lib/format';

/** Any member of staff raises a concern about a child (R-033). */
export function RaiseConcernSheet({ student, onClose }: { student: { id: string; first_name: string }; onClose: () => void }) {
  const { session } = useSession();
  const [category, setCategory] = React.useState('wellbeing');
  const [summary, setSummary] = React.useState('');
  const [urgent, setUrgent] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const raise = useMutation({
    mutationFn: () => runAs(session, q => q(G.RAISE, [student.id, category, summary, urgent])),
    onSuccess: () => setSent(true),
  });
  if (sent) return <RecordSheet title="Concern recorded" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">The safeguarding lead and the owner have been told. You will not see it in the app again — that is deliberate. If a child is in immediate danger, call 999.</p>
  </RecordSheet>;
  return (
    <RecordSheet title="Raise a safeguarding concern" subtitle={`About ${student.first_name}`} onClose={onClose}
      saving={raise.isPending} error={raise.error} canSave={summary.trim().length >= 10} saveLabel="Send to the safeguarding lead"
      onSave={() => raise.mutate()}>
      <p className="border-l-2 border-critical py-1 pl-3 text-[14px]">
        <strong className="font-semibold text-critical">If a child is in immediate danger, call 999 first.</strong> Write what you saw or were told, in their words where you can. Do not investigate.
      </p>
      <Field label="What kind of concern" htmlFor="rc-c">
        <Select id="rc-c" value={category} onChange={e => setCategory(e.target.value)}>
          {G.CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </Field>
      <Field label="What happened" htmlFor="rc-s" required hint="Facts, dates and times. Only the lead and the owner will read this.">
        <textarea id="rc-s" rows={6} value={summary} onChange={e => setSummary(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={urgent} onChange={e => setUrgent(e.target.checked)} />
        The child may be at risk today
      </label>
    </RecordSheet>
  );
}

/** Staff checks, owner only (R-035). */
export function StaffChecks({ staffId }: { staffId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const rows = useRows<G.Check>(['staff-checks', staffId], G.CHECKS, [staffId]);
  const [f, setF] = React.useState({ kind: 'dbs', reference: '', checked: '', expires: '' });
  const add = useMutation({
    mutationFn: () => runAs(session, q => q(G.ADD_CHECK, [staffId, f.kind, f.reference, f.checked, f.expires || null])),
    onSuccess: () => { setF({ kind: 'dbs', reference: '', checked: '', expires: '' }); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const soon = (d: string | null) => d && new Date(d).getTime() < Date.now() + 30 * 86400_000;
  return (
    <div className="space-y-2">
      <ul className="divide-y divide-line">
        {rows.data?.map(c => (
          <li key={c.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>{G.CHECK_LABEL[c.kind]}{c.reference ? ` · ${c.reference}` : ''} · {dateShort(c.checked_on)}</span>
            {c.expires_on && <span className={soon(c.expires_on) ? 'shrink-0 text-[13px] font-semibold text-critical' : 'shrink-0 text-[13px] text-ink-3'}>{new Date(c.expires_on) < new Date() ? 'Expired' : 'Expires'} {dateShort(c.expires_on)}</span>}
          </li>
        ))}
        {rows.data?.length === 0 && <li className="text-[13px] text-ink-3">No checks recorded.</li>}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Select aria-label="Kind of check" value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>
          {Object.entries(G.CHECK_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
        <Input aria-label="Certificate number" placeholder="Certificate no." value={f.reference} onChange={e => setF({ ...f, reference: e.target.value })} />
        <Field label="Checked on" htmlFor={`ck-d-${staffId}`}><Input id={`ck-d-${staffId}`} type="date" value={f.checked} onChange={e => setF({ ...f, checked: e.target.value })} /></Field>
        <Field label="Expires" htmlFor={`ck-e-${staffId}`}><Input id={`ck-e-${staffId}`} type="date" value={f.expires} onChange={e => setF({ ...f, expires: e.target.value })} /></Field>
      </div>
      {add.error != null && <ErrorState error={add.error} />}
      <Button size="sm" disabled={!f.checked} loading={add.isPending} onClick={() => add.mutate()}>Add check</Button>
      <p className="text-[12px] text-ink-3">Only owners see these. You are told 30 days before anything expires.</p>
    </div>
  );
}

/** Data retention for leavers, owner only (R-041). */
export function RetentionCard({ studioId }: { studioId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const pol = useRows<G.Retention>(['retention'], G.RETENTION).data?.[0];
  const preview = useRows<{ step: string; student_id: string; who: string; left_on: string }>(['retention-preview'], G.PREVIEW_RETENTION, [studioId]);
  const [m, setM] = React.useState<Partial<G.Retention>>({});
  const v = { ...pol, ...m } as G.Retention;
  const [done, setDone] = React.useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(G.SET_RETENTION, [v.medical_months, v.personal_months, v.financial_months, v.prospect_days, v.concern_months || null])),
    onSuccess: () => { setM({}); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const run = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ n: number }>(G.RUN_RETENTION, [studioId])))[0]!.n,
    onSuccess: n => { setDone(`${n} change${n === 1 ? '' : 's'} made and recorded in the audit log.`); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (!pol) return <Card><Skeleton className="h-24" /></Card>;
  const count = (k: string) => (preview.data ?? []).filter(p => p.step === k).length;
  const med = count('medical'), anon = count('anonymise'), pros = count('prospect'), fin = count('financial'), con = count('concern');
  return (
    <Card>
      <CardHeader title="Keeping data" subtitle="How long details are kept after a child stops coming, and for enquiries that went nowhere. Check these with your own adviser." />
      <div className="space-y-4 pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {([['medical_months', 'Delete medical records after'], ['personal_months', 'Anonymise the child after'], ['financial_months', 'Keep invoices for']] as const).map(([k, l]) => (
            <Field key={k} label={l} htmlFor={`rt-${k}`} hint="months">
              <Input id={`rt-${k}`} type="number" min={1} max={240} value={v[k]} onChange={e => setM(x => ({ ...x, [k]: Number(e.target.value) }))} />
            </Field>
          ))}
          <Field label="Remove enquiries with no activity after" htmlFor="rt-pd" hint="days">
            <Input id="rt-pd" type="number" min={30} max={730} value={v.prospect_days} onChange={e => setM(x => ({ ...x, prospect_days: Number(e.target.value) }))} />
          </Field>
          <Field label="Delete closed safeguarding concerns after" htmlFor="rt-cm" hint="months — empty keeps them. Set from your safeguarding policy (often until the child is 25).">
            <Input id="rt-cm" type="number" min={12} max={600} value={v.concern_months ?? ''} placeholder="Keep"
                   onChange={e => setM(x => ({ ...x, concern_months: e.target.value ? Number(e.target.value) : null }))} />
          </Field>
        </div>
        {Object.keys(m).length > 0 && <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Save periods</Button>}
        {save.error != null && <ErrorState error={save.error} />}
        <p className="border-t border-line pt-3 text-[14.5px]">Due now: <b>{med}</b> medical record{med === 1 ? '' : 's'} to delete, <b>{anon}</b> child{anon === 1 ? '' : 'ren'} to anonymise,
          {' '}<b>{pros}</b> old enquir{pros === 1 ? 'y' : 'ies'} to remove, <b>{fin}</b> famil{fin === 1 ? 'y' : 'ies'} to anonymise on invoices
          {pol.concern_months ? <>, <b>{con}</b> closed concern{con === 1 ? '' : 's'} to delete</> : ''}.
          {pol.last_run_at ? ` Last run ${dateShort(pol.last_run_at)}.` : ''}</p>
        {done && <p role="status" className="text-sm text-positive">{done}</p>}
        {run.error != null && <ErrorState error={run.error} />}
        <Button size="sm" disabled={!med && !anon && !pros && !fin && !con} loading={run.isPending} onClick={() => run.mutate()}>Apply now</Button>
      </div>
    </Card>
  );
}
