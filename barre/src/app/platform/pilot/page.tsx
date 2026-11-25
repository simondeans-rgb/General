'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Minus } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { Badge, Card, CardHeader, EmptyState, ErrorState, Field, Input, Skeleton, type Tone } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';

type Row = { id: string; name: string; status: string; pilot_cohort: string | null; pilot_started_on: string | null; days_in: number;
  classes: number; families: number; parents_signed_in_pct: number | null; registers_7d: number; registers_28d: number;
  invoices_sent: number; messages_28d: number; feedback_shared_28d: number;
  setup_done: boolean; families_in: boolean; registers_weekly: boolean; parents_on: boolean; billing_on: boolean; talking: boolean;
  score: number; stuck_on: string | null };

const STEPS: [keyof Row, string, (r: Row) => string][] = [
  ['setup_done', 'Classes set up', r => `${r.classes} classes`],
  ['families_in', 'Families in', r => `${r.families} families`],
  ['registers_weekly', 'Registers weekly', r => `${r.registers_7d} this week · ${r.registers_28d} in 4 weeks`],
  ['parents_on', 'Parents signed in', r => `${r.parents_signed_in_pct ?? 0}% of families`],
  ['billing_on', 'Invoices sent', r => `${r.invoices_sent} sent`],
  ['talking', 'Messaging families', r => `${r.messages_28d} in 4 weeks`],
];
const tone = (n: number): Tone => n >= 83 ? 'positive' : n >= 50 ? 'caution' : 'critical';

/** The pilot (R-040): which schools are in it and how far each has got. Counts only — never names. */
export default function PilotPage() {
  const rows = useRows<Row>(['activation'], `select * from app.platform_activation()`);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [all, setAll] = React.useState(false);
  const list = (rows.data ?? []).filter(r => all || r.pilot_cohort);
  return (
    <Shell title="Pilot" subtitle="How far each school has got with what keeps schools on Sanaa" allow={['platform']}>
      <div className="mx-auto max-w-6xl space-y-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={all} onChange={e => setAll(e.target.checked)} /> Show every school, not only pilot schools</label>
        {rows.isLoading && <Skeleton className="h-40" />}
        {rows.error && <ErrorState error={rows.error} />}
        {rows.data && list.length === 0 && <Card><EmptyState title="No pilot schools yet" body="Tick “Show every school”, then add one to a cohort." /></Card>}
        {list.map(r => (
          <Card key={r.id}>
            <CardHeader title={r.name}
              subtitle={r.pilot_cohort ? `${r.pilot_cohort} · day ${r.days_in}${r.pilot_started_on ? ` (from ${dateShort(r.pilot_started_on)})` : ''}` : 'Not in a pilot'}
              action={<div className="flex items-center gap-2"><Badge tone={tone(r.score)}>{r.score}% active</Badge>
                <button className="text-sm text-accent-text hover:underline" onClick={() => setEditing(r)}>{r.pilot_cohort ? 'Edit' : 'Add to pilot'}</button></div>} />
            <ul className="grid gap-2 px-4 pb-3 sm:grid-cols-3 lg:grid-cols-6">
              {STEPS.map(([k, label, note]) => (
                <li key={k} className={cn('rounded-[var(--radius-md)] border p-2.5 text-sm', r[k] ? 'border-positive/30 bg-positive-soft' : 'border-line')}>
                  <span className="flex items-center gap-1.5 font-medium">{r[k] ? <Check className="size-3.5 text-positive" aria-hidden /> : <Minus className="size-3.5 text-ink-3" aria-hidden />}{label}</span>
                  <span className="block text-[12px] text-ink-2">{note(r)}</span>
                </li>
              ))}
            </ul>
            {r.stuck_on && <p className="px-4 pb-4 text-[13px] text-ink-2">Next step to help with: <b>{r.stuck_on}</b></p>}
          </Card>
        ))}
      </div>
      {editing && <PilotSheet r={editing} onClose={() => setEditing(null)} />}
    </Shell>
  );
}

function PilotSheet({ r, onClose }: { r: Row; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [cohort, setCohort] = React.useState(r.pilot_cohort ?? '');
  const [started, setStarted] = React.useState(r.pilot_started_on ?? '');
  const [notes, setNotes] = React.useState('');
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(`select app.platform_set_pilot($1, $2, $3::date, $4)`, [r.id, cohort, started || null, notes])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  return (
    <RecordSheet title={r.name} subtitle="Pilot" onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error}>
      <Field label="Cohort" htmlFor="pl-c" hint="Leave empty to take the school out of the pilot."><Input id="pl-c" value={cohort} onChange={e => setCohort(e.target.value)} placeholder="Spring 2027" /></Field>
      <Field label="Started" htmlFor="pl-s"><Input id="pl-s" type="date" value={started} onChange={e => setStarted(e.target.value)} /></Field>
      <Field label="Notes" htmlFor="pl-n"><Input id="pl-n" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What they use today, who to talk to" /></Field>
    </RecordSheet>
  );
}
