'use client';

/**
 * Credit for reported absences (UR-56, migration 0052). The owner chooses
 * whether a family reporting an absence in advance gets credit on account:
 * the class's per-session value or a fixed amount. Make-ups for absences and
 * credit for them are either-or. The office sees every credit in Billing.
 */
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ErrorState, Input, Select } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as B from '@/lib/repos/billing';
import { cn } from '@/lib/cn';
import { dateShort, money } from '@/lib/format';

type Setting = { id: string; absence_credit: 'off' | 'session' | 'fixed'; absence_credit_fixed_minor: number;
  makeup_policy: 'off' | 'cancelled' | 'cancelled_and_absence' };

export function AbsenceCreditSettings() {
  const { session } = useSession();
  const qc = useQueryClient();
  const row = useRows<Setting>(['absence-credit-setting'], B.ABSENCE_CREDIT_SETTING).data?.[0];
  const owner = session?.role === 'owner';
  const [mode, setMode] = React.useState<Setting['absence_credit'] | null>(null);
  const [fixed, setFixed] = React.useState<string | null>(null);
  const save = useMutation({
    mutationFn: (v: { mode: string; fixed: number }) => runAs(session, q => q(B.SET_ABSENCE_CREDIT, [row!.id, v.mode, v.fixed])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); setMode(null); setFixed(null); },
  });
  if (!row) return null;
  const m = mode ?? row.absence_credit;
  const f = fixed ?? String(row.absence_credit_fixed_minor / 100);
  const fixedMinor = Math.max(0, Math.round(Number(f) * 100));
  const dirty = m !== row.absence_credit || (m === 'fixed' && fixedMinor !== row.absence_credit_fixed_minor);
  const makeups = row.makeup_policy === 'cancelled_and_absence';
  return (
    <Card>
      <CardHeader title="Credit for reported absences" subtitle="When a family tells you in advance that a child will miss a class" />
      <div className="space-y-3 pt-3 text-[0.9062rem]">
        <label className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
          <span><span className="font-semibold">Credit on their account</span>
            <span className="block text-[0.8125rem] text-ink-3">Once per child per class, for term and monthly classes. It is taken back if they withdraw the report before the class.</span></span>
          <Select aria-label="Credit for reported absences" value={m} disabled={!owner}
                  onChange={e => setMode(e.target.value as Setting['absence_credit'])}>
            <option value="off">No credit</option>
            <option value="session">The class’s per-session price</option>
            <option value="fixed">A fixed amount</option>
          </Select>
        </label>
        {m === 'fixed' && (
          <label className="flex flex-wrap items-center gap-2 text-[0.8125rem]">Amount £
            <Input aria-label="Fixed credit in pounds" className="w-24" type="number" min={0} step={0.5} value={f}
                   disabled={!owner} onChange={e => setFixed(e.target.value)} />
            <span className="text-ink-3">never more than the class’s own price</span>
          </label>
        )}
        {makeups && m === row.absence_credit && m === 'off' && (
          <p className="text-[0.8125rem] text-ink-3">Make-ups are offered for reported absences (Registers settings). Choosing credit here replaces them: families get one or the other.</p>
        )}
        {makeups && m !== 'off' && m !== row.absence_credit && (
          <p className="text-[0.8125rem] text-caution">Saving switches make-ups for reported absences off. Make-ups after a cancellation stay as they are.</p>
        )}
        {save.error != null && <ErrorState error={save.error} />}
        {owner
          ? <Button size="sm" variant="primary" disabled={!dirty} loading={save.isPending}
                    onClick={() => save.mutate({ mode: m, fixed: m === 'fixed' ? fixedMinor : row.absence_credit_fixed_minor })}>Save</Button>
          : <p className="text-[0.8125rem] text-ink-3">Only the owner can change this.</p>}
      </div>
    </Card>
  );
}

/** For the office: every credit given for a reported absence, and any taken back. */
export function AbsenceCredits() {
  const rows = useRows<B.AbsenceCreditRow>(['absence-credits'], B.ABSENCE_CREDITS);
  if (!rows.data?.length) return null;
  const live = rows.data.filter(r => r.status === 'active').reduce((t, r) => t + Number(r.amount_minor), 0);
  return (
    <section aria-labelledby="absence-credit-h" className="mt-10 min-w-0">
      <div className="flex items-baseline gap-3 border-b-2 border-ink pb-2">
        <h2 id="absence-credit-h" className="section-title flex-1">Credit for reported absences</h2>
        <span className="tnum text-[0.8125rem] text-ink-3">{money(live)} given, latest 50</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.data.map(r => (
          <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2.5 text-[0.875rem]">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{r.family_name} · {r.child}</span>
              <span className="block truncate text-[0.8125rem] text-ink-3">{r.session_label} · reported {dateShort(r.created_at)}</span>
            </span>
            <span className="text-right">
              <span className={cn('tnum block', r.status === 'reversed' && 'text-ink-3 line-through')}>{money(r.amount_minor)}</span>
              {r.status === 'reversed' && <span className="block text-[0.75rem] text-ink-3">Taken back</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
