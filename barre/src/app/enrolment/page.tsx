'use client';

import * as React from 'react';
import { Route, Phone, Mail, CalendarClock } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { dateShort, ageFrom } from '@/lib/format';
import { cn } from '@/lib/cn';

const STAGE: Record<string, { label: string; tone: Tone }> = {
  enquiry:         { label: 'Enquiry',        tone: 'neutral' },
  trial_requested: { label: 'Trial requested',tone: 'info' },
  trial_booked:    { label: 'Trial booked',   tone: 'info' },
  trial_attended:  { label: 'Trial attended', tone: 'accent' },
  trial_missed:    { label: 'Trial missed',   tone: 'caution' },
  follow_up:       { label: 'Follow up',      tone: 'caution' },
  enrolled:        { label: 'Enrolled',       tone: 'positive' },
  closed_lost:     { label: 'Closed',         tone: 'neutral' },
};

export default function EnrolmentPage() {
  const funnel = useRow<{ total: number; booked: number; attended: number; converted: number; lost: number }>(
    ['funnel'], C.FUNNEL);
  const enquiries = useRows<{ id: string; stage: string; contact_name: string; contact_email: string;
                              contact_phone: string; child_name: string; child_dob: string;
                              source: string; next_action_on: string | null; class_name: string | null }>(
    ['enquiries'], C.ENQUIRIES);

  const f = funnel.data;
  const rate = f && f.total > 0 ? Math.round((f.converted / f.total) * 1000) / 10 : null;

  return (
    <Shell title="Enrolment" subtitle="From first enquiry to a place in a class" allow={['owner', 'admin']}>
      <div className="mx-auto max-w-5xl space-y-5">
        <Card>
          <CardHeader title="Funnel" subtitle={rate != null ? `${rate}% of enquiries became enrolments` : undefined} />
          <div className="p-4">
            {funnel.isLoading && <Skeleton className="h-24" />}
            {f && <Funnel steps={[
              ['Enquiries', f.total], ['Trials booked', f.booked],
              ['Attended', f.attended], ['Enrolled', f.converted],
            ]} />}
          </div>
        </Card>

        <Card>
          <CardHeader title="Pipeline"
            subtitle="Ordered by what needs doing next, not by when it arrived" />
          {enquiries.isLoading && <div className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
          {enquiries.error && <div className="p-4"><ErrorState error={enquiries.error} /></div>}
          {enquiries.data?.length === 0 && <EmptyState icon={<Route className="size-5" />}
            title="No enquiries yet" body="New enquiries from your website or walk-ins will appear here." />}
          <ul className="divide-y divide-line">
            {enquiries.data?.map(e => {
              const stage = STAGE[e.stage] ?? STAGE.enquiry!;
              const overdue = e.next_action_on && new Date(e.next_action_on) < new Date();
              return (
                <li key={e.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{e.child_name}</span>
                        {e.child_dob && <span className="text-[13px] text-ink-3">{ageFrom(e.child_dob)}</span>}
                        <Badge tone={stage.tone}>{stage.label}</Badge>
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-2">
                        {e.class_name ?? 'No class chosen yet'} · via {e.source}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-3">
                        <span>{e.contact_name}</span>
                        {e.contact_email && <a href={`mailto:${e.contact_email}`}
                          className="inline-flex items-center gap-1 hover:text-ink"><Mail className="size-3" aria-hidden />{e.contact_email}</a>}
                        {e.contact_phone && <a href={`tel:${e.contact_phone}`}
                          className="inline-flex items-center gap-1 hover:text-ink"><Phone className="size-3" aria-hidden />{e.contact_phone}</a>}
                      </p>
                    </div>
                    {e.next_action_on && !['enrolled','closed_lost'].includes(e.stage) && (
                      <span className={cn('inline-flex shrink-0 items-center gap-1 text-[12.5px]',
                        overdue ? 'font-medium text-critical' : 'text-ink-3')}>
                        <CalendarClock className="size-3.5" aria-hidden />
                        {overdue ? 'Overdue' : 'Next'} {dateShort(e.next_action_on)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}

/** A funnel that is honest about proportion: each bar is scaled to the first
 *  step, so a narrow bar means a real drop-off rather than a design choice. */
function Funnel({ steps }: { steps: [string, number][] }) {
  const max = Math.max(...steps.map(s => s[1]), 1);
  return (
    <ol className="space-y-2.5">
      {steps.map(([label, n], i) => {
        const prev = i > 0 ? steps[i - 1]![1] : null;
        const drop = prev != null && prev > 0 ? Math.round(((prev - n) / prev) * 100) : null;
        return (
          <li key={label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[13px] text-ink-2">{label}</span>
            <span aria-hidden className="h-7 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2">
              <span className="block h-full rounded-[var(--radius-sm)] bg-accent/85"
                    style={{ width: `${Math.max(3, (n / max) * 100)}%` }} />
            </span>
            <span className="tnum w-8 shrink-0 text-right font-semibold">{n}</span>
            <span className="tnum w-16 shrink-0 text-right text-[12.5px] text-ink-3">
              {drop != null && drop > 0 ? `−${drop}%` : ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
