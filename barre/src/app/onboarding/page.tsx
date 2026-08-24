'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, Field, Input, Select, Skeleton, ErrorState } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Studio setup.
 *
 * Each step is a fact about the studio that can be checked in the database, so
 * progress is derived rather than stored as a number that can drift out of
 * step with reality. Leave halfway through, come back next week, and the wizard
 * knows exactly what is still missing.
 */
type Step = {
  key: string;
  title: string;
  blurb: string;
  count: string;          // returns { n } — non-zero means the step is done
  href: string;
  cta: string;
};

const STEPS: Step[] = [
  { key: 'studio', title: 'Studio details', blurb: 'Name, timezone and how families reach you.',
    count: `select count(*)::int n from studio where contact_email is not null and deleted_at is null`,
    href: '/studio', cta: 'Studio settings' },
  { key: 'locations', title: 'Locations and rooms', blurb: 'Where classes happen, and which room each uses.',
    count: `select count(*)::int n from location where deleted_at is null`,
    href: '/studio', cta: 'Add a location' },
  { key: 'styles', title: 'Dance styles and levels', blurb: 'Ballet, tap, grades — how you group your teaching.',
    count: `select count(*)::int n from dance_style where deleted_at is null`,
    href: '/studio', cta: 'Add styles' },
  { key: 'terms', title: 'Terms', blurb: 'Term dates and half-term breaks, so sessions generate correctly.',
    count: `select count(*)::int n from term where deleted_at is null`,
    href: '/studio', cta: 'Add a term' },
  { key: 'staff', title: 'Teachers', blurb: 'Who teaches what. They get their own simplified app.',
    count: `select count(*)::int n from staff_member where deleted_at is null`,
    href: '/people', cta: 'Add teachers' },
  { key: 'classes', title: 'Classes', blurb: 'Day, time, capacity and price. Sessions are generated for you.',
    count: `select count(*)::int n from class where deleted_at is null`,
    href: '/classes', cta: 'Create a class' },
  { key: 'families', title: 'Families', blurb: 'Invite them, or import a spreadsheet you already keep.',
    count: `select count(*)::int n from family where deleted_at is null`,
    href: '/people', cta: 'Add families' },
  { key: 'payments', title: 'Payments', blurb: 'Connect Stripe so families can pay from the app.',
    count: `select 0::int n`,
    href: '/studio', cta: 'Not set up yet' },
];

export default function Onboarding() {
  const rows = useRows<{ key: string; n: number }>(['onboarding'],
    STEPS.map(s => `select '${s.key}' as key, n from (${s.count}) x`).join('\nunion all\n'));

  const doneKeys = new Set((rows.data ?? []).filter(r => r.n > 0).map(r => r.key));
  const done = STEPS.filter(s => doneKeys.has(s.key)).length;
  const pct = Math.round((done / STEPS.length) * 100);
  const next = STEPS.find(s => !doneKeys.has(s.key));

  return (
    <Shell title="Set up your studio" subtitle="Pick up wherever you left off" allow={['owner', 'admin']}>
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium">{done} of {STEPS.length} done</p>
            <p className="tnum text-[13px] text-ink-3">{pct}%</p>
          </div>
          <div aria-hidden className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          {next
            ? <p className="mt-3 text-sm text-ink-2">Next: <strong className="font-medium text-ink">{next.title}</strong></p>
            : <p className="mt-3 flex items-center gap-1.5 text-sm text-positive">
                <Sparkles className="size-4" aria-hidden /> Everything is set up. You are live.
              </p>}
        </Card>

        {rows.isLoading && <Card className="p-4"><Skeleton className="h-40" /></Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}

        {rows.data && (
          <Card>
            <ol className="divide-y divide-line">
              {STEPS.map((s, i) => {
                const complete = doneKeys.has(s.key);
                const count = rows.data!.find(r => r.key === s.key)?.n ?? 0;
                return (
                  <li key={s.key} className="flex items-start gap-3 px-4 py-3.5">
                    <span aria-hidden className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold',
                      complete ? 'bg-positive text-white' : 'border border-line-strong bg-surface text-ink-3')}>
                      {complete ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn('font-medium', complete && 'text-ink-2')}>{s.title}</span>
                        {complete && count > 0 && <Badge tone="positive">{count} added</Badge>}
                        {s.key === 'payments' && <Badge tone="neutral">Coming soon</Badge>}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-ink-2">{s.blurb}</span>
                    </span>
                    {s.key !== 'payments' && (
                      <Link href={s.href}
                        className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-accent hover:underline">
                        {complete ? 'Review' : s.cta}
                        <ChevronRight className="size-3.5" aria-hidden />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>
        )}

        <p className="px-1 text-[12.5px] text-ink-3">
          This studio was created with sample data so you can see how everything fits together.
          Starting fresh, every step above would be empty and the wizard would walk you through them
          in order.
        </p>
      </div>
    </Shell>
  );
}
