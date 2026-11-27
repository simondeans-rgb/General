'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Notice, Select, Skeleton } from '@/components/ui';
import { SectionHead, Word } from './session-row';
import * as I from '@/lib/repos/inbox';
import { relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const EVENTS: Record<string, { title: string; when: string }> = {
  trial_booked:            { title: 'Trial confirmation', when: 'As soon as a trial is booked' },
  trial_reminder_48h:      { title: 'Trial reminder',     when: '48 hours before the class' },
  trial_reminder_same_day: { title: 'On the day',         when: 'The morning of the trial' },
  trial_attended:          { title: 'After the trial',    when: 'Once the register shows they came' },
  trial_missed:            { title: 'Missed trial',       when: 'When the register shows they did not' },
  waitlist_offer:          { title: 'Waiting-list place', when: 'When a place is offered, with the deadline' },
};

/**
 * Rules, not scripts: each automation is an event the studio cannot change
 * and a template it can. A scheduler runs them in production; here "Run now"
 * does the same thing, and running twice sends nothing twice.
 */
export function Automations() {
  const { session } = useSession();
  const qc = useQueryClient();
  const rules = useRows<I.Rule>(['rules'], I.RULES);
  const templates = useRows<I.Template>(['templates'], I.TEMPLATES);
  const outbox = useRows<I.Outbound>(['outbox'], I.OUTBOX);
  const [result, setResult] = React.useState<number | null>(null);

  const set = useMutation({
    mutationFn: (v: { id: string; enabled: boolean; template_id: string | null }) =>
      runAs(session, q => q(I.SET_RULE, [v.id, v.enabled, v.template_id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const run = useMutation({
    mutationFn: () => runAs(session, q => q<{ sent: number }>(I.RUN_AUTOMATIONS)),
    onSuccess: rows => { setResult(rows[0]?.sent ?? 0); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const due = rules.data?.reduce((n, r) => n + (r.enabled ? r.due : 0), 0) ?? 0;

  return (
    <div className="space-y-10">
      <section>
        <SectionHead title="Automatic messages"
          meta={due ? `${due} message${due === 1 ? '' : 's'} due to go` : 'Nothing due right now'}
          action={<Button size="sm" variant={due ? 'primary' : 'secondary'} loading={run.isPending}
                    onClick={() => run.mutate()}>
              <Play className="size-3.5" aria-hidden /> Run now
            </Button>} />
        {result !== null && (
          <div role="status" className="border-b border-line py-3">
            <Notice word={result ? 'Sent' : 'Nothing new'} tone={result ? 'positive' : 'ink'}
              title={result ? `${result} message${result === 1 ? '' : 's'} sent.` : 'Everything due has already gone.'} />
          </div>
        )}
        {run.error && <div className="pt-3"><ErrorState error={run.error} /></div>}
        {rules.isLoading && <Skeleton className="mt-3 h-24" />}
        <ul className="divide-y divide-line">
          {rules.data?.map(r => {
            const e = EVENTS[r.event] ?? { title: r.event, when: '' };
            return (
              <li key={r.id} className="grid gap-x-6 gap-y-2 px-1 py-3 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-center">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className={cn('font-semibold', !r.enabled && 'text-ink-3')}>{e.title}</span>
                    {r.enabled && r.due > 0 && <Word tone="caution">{r.due} due</Word>}
                    {!r.enabled && <Word tone="muted">Off</Word>}
                  </span>
                  <span className="block text-[0.8125rem] text-ink-3">
                    {e.when}{r.sent ? ` · ${r.sent} sent, last ${relativeDay(r.last_sent!)}` : ''}
                  </span>
                </span>
                <Select aria-label={`Template for ${e.title}`} className="h-9 text-[0.8125rem]"
                  value={r.template_id ?? ''}
                  onChange={ev => set.mutate({ id: r.id, enabled: r.enabled, template_id: ev.target.value || null })}>
                  <option value="">No template — nothing sends</option>
                  {templates.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
                {/* A real switch: role, state and label, not a coloured div. */}
                <button role="switch" aria-checked={r.enabled} aria-label={`${e.title}: ${r.enabled ? 'on' : 'off'}`}
                  onClick={() => set.mutate({ id: r.id, enabled: !r.enabled, template_id: r.template_id })}
                  className="row-start-1 flex min-h-[44px] items-center gap-2 justify-self-end text-[0.8125rem] text-ink-2 md:row-start-auto">
                  <span className="w-6 text-right">{r.enabled ? 'On' : 'Off'}</span>
                  <span className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors', r.enabled ? 'bg-ink' : 'bg-line-strong')}>
                    <span className={cn('absolute top-0.5 size-5 rounded-full bg-surface transition-[left]',
                      r.enabled ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionHead title="Email outbox" meta={outbox.data?.length ? `${outbox.data.length}` : undefined} />
        <p className="py-2 text-[0.8125rem] text-ink-3">
          People without an account yet, usually someone booking a first trial, can only be reached by email.
          Email delivery isn’t connected in this build, so these wait here.
        </p>
        {outbox.data?.length === 0 && <p className="py-3 text-[0.875rem] text-ink-3">Nothing queued.</p>}
        <ul className="divide-y divide-line border-t border-line">
          {outbox.data?.map(o => (
            <li key={o.id} className="flex items-center gap-3 px-1 py-2.5 text-[0.875rem]">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{o.subject}</span>
                <span className="block truncate text-[0.8125rem] text-ink-3">To {o.to_name ?? o.to_address} · {relativeDay(o.created_at)} {time(o.created_at)}</span>
              </span>
              <span className={cn('shrink-0 text-[0.8125rem]', o.status === 'queued' ? 'font-semibold text-caution' : o.status === 'sent' ? 'text-positive' : 'text-ink-3')}>
                {o.status === 'queued' ? 'Waiting for email' : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
