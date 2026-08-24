'use client';

import * as React from 'react';
import { MessageSquare, Sparkles, Target } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { relativeDay, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';

const LEVELS: Record<string, { label: string; tone: Tone; pct: number }> = {
  not_started: { label: 'Not started', tone: 'neutral', pct: 8 },
  developing:  { label: 'Developing',  tone: 'caution', pct: 40 },
  secure:      { label: 'Secure',      tone: 'info',    pct: 72 },
  mastered:    { label: 'Mastered',    tone: 'positive',pct: 100 },
};

/** Shared by the student hub and the parent hub. The parent version shows
 *  which child each note is about; the student's own name would be noise. */
export function FeedbackView({ allow, title, showStudent }: {
  allow: any; title: string; showStudent?: boolean;
}) {
  const notes = useRows<H.Feedback>(['feedback'], H.STUDENT_FEEDBACK);
  const skills = useRows<{ id: string; skill: string; level: string; assessed_on: string;
                           style: string | null; student_name: string }>(['assessments'], H.MY_ASSESSMENTS);

  return (
    <Shell title={title} allow={allow}>
      <div className="mx-auto max-w-2xl space-y-4">
        {notes.isLoading && <Card className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-24" />)}</Card>}
        {notes.error && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
        {notes.data?.length === 0 && !notes.isLoading && (
          <Card><EmptyState icon={<MessageSquare className="size-5" />} title="No feedback yet"
            body="Teachers share notes after class. They appear here once they do." /></Card>
        )}

        {notes.data?.map(n => (
          <Card key={n.id}>
            <div className="p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="font-semibold">{n.headline}</h2>
                {showStudent && <Badge tone="accent">{n.student_name.split(' ')[0]}</Badge>}
                <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(n.shared_at!)}</span>
              </div>
              {n.going_well && (
                <p className="mt-2.5 flex gap-2 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
                  <span>{n.going_well}</span>
                </p>
              )}
              {n.work_on && (
                <p className="mt-2 flex gap-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm">
                  <Target className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span><span className="font-medium">To work on: </span>{n.work_on}</span>
                </p>
              )}
              <p className="mt-2.5 text-[12px] text-ink-3">
                {n.author}{n.class_name ? ` · ${n.class_name}` : ''}
              </p>
            </div>
          </Card>
        ))}

        {(skills.data?.length ?? 0) > 0 && (
          <Card>
            <CardHeader title="Progress" subtitle="Where your teacher thinks you are with each skill" />
            <ul className="divide-y divide-line">
              {skills.data!.map(s => {
                const l = LEVELS[s.level] ?? LEVELS.not_started!;
                return (
                  <li key={s.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{s.skill}</span>
                        <span className="block text-[12px] text-ink-3">
                          {showStudent ? `${s.student_name} · ` : ''}{s.style} · {dateShort(s.assessed_on)}
                        </span>
                      </span>
                      <Badge tone={l.tone}>{l.label}</Badge>
                    </div>
                    {/* The bar repeats the badge rather than replacing it, so the
                        level is never carried by colour and width alone. */}
                    <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <span className={cn('block h-full rounded-full',
                        s.level === 'mastered' ? 'bg-positive'
                        : s.level === 'secure' ? 'bg-info'
                        : s.level === 'developing' ? 'bg-caution' : 'bg-surface-3')}
                        style={{ width: `${l.pct}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </Shell>
  );
}

export default function StudentFeedback() {
  return <FeedbackView allow={['student']} title="Your feedback" />;
}
