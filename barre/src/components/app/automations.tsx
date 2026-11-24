'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Mail, Zap, CheckCircle2 } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, EmptyState, ErrorState, Select, Skeleton } from '@/components/ui';
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
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Zap className="size-4 text-accent" aria-hidden />
          <p className="flex-1 text-[13px] text-ink-2">
            {due ? `${due} message${due === 1 ? '' : 's'} due to go` : 'Nothing due right now'}
          </p>
          <Button size="sm" variant={due ? 'primary' : 'secondary'} loading={run.isPending}
                  onClick={() => run.mutate()}>
            <Play className="size-3.5" aria-hidden /> Run now
          </Button>
        </div>
        {result !== null && (
          <p role="status" className="flex items-center gap-2 border-b border-line bg-positive-soft px-4 py-2 text-[13px]">
            <CheckCircle2 className="size-4 text-positive" aria-hidden />
            {result ? `${result} sent.` : 'Nothing new to send — everything due has already gone.'}
          </p>
        )}
        {run.error && <div className="p-3"><ErrorState error={run.error} /></div>}
        {rules.isLoading && <Skeleton className="m-3 h-24" />}
        <ul className="divide-y divide-line">
          {rules.data?.map(r => {
            const e = EVENTS[r.event] ?? { title: r.event, when: '' };
            return (
              <li key={r.id} className={cn('px-4 py-3', !r.enabled && 'bg-surface-2/50')}>
                <div className="flex items-start gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{e.title}</span>
                      {r.enabled && r.due > 0 && <Badge tone="accent">{r.due} due</Badge>}
                      {!r.enabled && <Badge tone="neutral">Off</Badge>}
                    </span>
                    <span className="block text-[12.5px] text-ink-3">
                      {e.when}{r.sent ? ` · ${r.sent} sent, last ${relativeDay(r.last_sent!)}` : ''}
                    </span>
                  </span>
                  {/* A real switch: role, state and label, not a coloured div. */}
                  <button role="switch" aria-checked={r.enabled} aria-label={`${e.title}: ${r.enabled ? 'on' : 'off'}`}
                    onClick={() => set.mutate({ id: r.id, enabled: !r.enabled, template_id: r.template_id })}
                    className={cn('relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors',
                      r.enabled ? 'bg-accent' : 'bg-line-strong')}>
                    <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow-xs transition-[left]',
                      r.enabled ? 'left-[18px]' : 'left-0.5')} />
                  </button>
                </div>
                <Select aria-label={`Template for ${e.title}`} className="mt-2 h-9 text-[13px]"
                  value={r.template_id ?? ''}
                  onChange={ev => set.mutate({ id: r.id, enabled: r.enabled, template_id: ev.target.value || null })}>
                  <option value="">No template — nothing will send</option>
                  {templates.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <p className="flex items-center gap-2 font-medium"><Mail className="size-4 text-ink-3" aria-hidden /> Email outbox</p>
          <p className="mt-0.5 text-[12.5px] text-ink-2">
            People without an account yet — usually someone booking a first trial — can only be reached by email.
            Email delivery is not connected in this build, so these wait here.
          </p>
        </div>
        {outbox.data?.length === 0 && <EmptyState title="Nothing queued" />}
        <ul className="divide-y divide-line">
          {outbox.data?.map(o => (
            <li key={o.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.subject}</span>
                <span className="block truncate text-[12.5px] text-ink-3">To {o.to_name ?? o.to_address} · {relativeDay(o.created_at)} {time(o.created_at)}</span>
              </span>
              <Badge tone={o.status === 'queued' ? 'caution' : o.status === 'sent' ? 'positive' : 'neutral'}>
                {o.status === 'queued' ? 'Waiting for email' : o.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
