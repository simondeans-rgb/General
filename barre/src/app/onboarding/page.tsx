'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, Skeleton, ErrorState } from '@/components/ui';
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
  { key: 'brand', title: 'Your style and brand', blurb: 'Choose Classic or Urban, then add your logo and colours, so the app looks like yours to every family.',
    count: `select (brand_colour is not null or logo_url is not null)::int n from studio`,
    href: '/account#brand', cta: 'Choose a style' },
  { key: 'privacy', title: 'Privacy notice', blurb: 'A link to your privacy notice, shown wherever families give their details.',
    count: `select (privacy_notice_url is not null)::int n from studio`,
    href: '/studio', cta: 'Add the link' },
  { key: 'dsl', title: 'Safeguarding lead', blurb: 'Name who reads safeguarding concerns with you, and record staff DBS checks.',
    count: `select (dsl_user_id is not null)::int n from studio`,
    href: '/safeguarding', cta: 'Name your lead' },
  { key: 'locations', title: 'Locations and rooms', blurb: 'Where classes happen, and which room each uses.',
    count: `select count(*)::int n from location where deleted_at is null`,
    href: '/studio#places', cta: 'Add a location' },
  { key: 'styles', title: 'Dance styles and levels', blurb: 'Ballet, tap, grades — how you group your teaching.',
    count: `select count(*)::int n from dance_style where deleted_at is null`,
    href: '/studio#teaching', cta: 'Add styles' },
  { key: 'frameworks', title: 'Skills and feedback phrases', blurb: 'The skills you track for each style, and the quick phrases teachers use after class.',
    count: `select count(*)::int n from framework_skill where deleted_at is null`,
    href: '/studio#teaching', cta: 'Review skills' },
  { key: 'terms', title: 'Terms', blurb: 'Term dates and half-term breaks, so sessions generate correctly.',
    count: `select count(*)::int n from term where deleted_at is null`,
    href: '/studio#terms', cta: 'Add a term' },
  { key: 'staff', title: 'Teachers', blurb: 'Who teaches what. They get their own simplified app.',
    count: `select count(*)::int n from staff_member where deleted_at is null`,
    href: '/people', cta: 'Add teachers' },
  { key: 'classes', title: 'Classes', blurb: 'Day, time, capacity and price. Sessions are generated for you.',
    count: `select count(*)::int n from class where deleted_at is null`,
    href: '/classes', cta: 'Create a class' },
  { key: 'families', title: 'Families', blurb: 'Import a spreadsheet you already keep, or add families one by one. Then invite them to the app.',
    count: `select count(*)::int n from family where deleted_at is null`,
    href: '/people?import=1', cta: 'Import or add families' },
  { key: 'discounts', title: 'Prices and discounts', blurb: 'Sibling and multi-class discounts, bursaries, class packs for drop-ins, and whether families pay before they book.',
    count: `select count(*)::int n from discount_rule where enabled and deleted_at is null`,
    href: '/studio#money', cta: 'Set discounts' },
  { key: 'payments', title: 'Term billing', blurb: 'Raise every family’s invoice for the term (or month) in one run, check them, then send. Card payments start once Stripe is connected on a hosted deployment.',
    count: `select count(*)::int n from billing_run`,
    href: '/billing', cta: 'Run term billing' },
];

export default function Onboarding() {
  const rows = useRows<{ key: string; n: number }>(['onboarding'],
    STEPS.map(s => `select '${s.key}' as key, n from (${s.count}) x`).join('\nunion all\n'));

  const doneKeys = new Set((rows.data ?? []).filter(r => r.n > 0).map(r => r.key));
  const done = STEPS.filter(s => doneKeys.has(s.key)).length;
  const next = STEPS.find(s => !doneKeys.has(s.key));

  return (
    <Shell title="Set up your school" subtitle="Pick up wherever you left off" allow={['owner', 'admin']}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-2xl space-y-10">
        <section aria-labelledby="ob-progress" className="flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:items-end">
          <div>
            <p className="label">Progress</p>
            <p id="ob-progress" className="mt-1 flex items-baseline gap-2">
              <span className="display-xl text-[64px]">{rows.data ? done : '–'}</span>
              <span className="text-[15px] text-ink-2">of {STEPS.length} steps done</span>
            </p>
            <Beats value={done} max={STEPS.length} size="lg" label={`${done} of ${STEPS.length} steps done`} className="mt-3" />
          </div>
          <div className="min-w-0 flex-1 sm:pb-1">
            {next ? (
              <>
                <p className="label text-accent-text">Next</p>
                <p className="mt-1 font-display text-[22px] font-[800] leading-tight [font-stretch:112%]">{next.title}</p>
                <p className="mt-1 text-[14px] text-ink-3">{next.blurb}</p>
                <Link href={next.href} className="mt-3 inline-block"><Button variant="primary" tabIndex={-1}>{next.cta}</Button></Link>
              </>
            ) : (
              <p className="font-display text-[22px] font-[800] leading-tight text-positive [font-stretch:112%]">Everything is set up. You are live.</p>
            )}
          </div>
        </section>

        {rows.isLoading && <Skeleton className="h-40" />}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}

        {rows.data && (
          <section aria-labelledby="ob-steps">
            <div className="flex items-baseline gap-3 border-b-2 border-ink pb-2">
              <h2 id="ob-steps" className="section-title flex-1">Every step</h2>
              <span className="text-[13px] text-ink-3">In order, but any order works</span>
            </div>
            <ol className="divide-y divide-line">
              {STEPS.map((s, i) => {
                const complete = doneKeys.has(s.key);
                const count = rows.data!.find(r => r.key === s.key)?.n ?? 0;
                return (
                  <li key={s.key} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 py-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]">
                    <span aria-hidden className={cn('font-display text-[22px] leading-none tnum', complete ? 'text-ink-3' : 'text-ink')}>
                      {complete ? <Check className="mt-0.5 size-5 text-positive" strokeWidth={2.4} /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{s.title}
                        <span className="sr-only">{complete ? ' (done)' : ' (to do)'}</span></span>
                      <span className="mt-0.5 block text-[14px] text-ink-3">{s.blurb}</span>
                      {(complete || s.key === 'payments') && (
                        <span className="mt-1 block text-[13px]">
                          {complete && <span className="font-semibold text-positive">Done{count > 1 ? ` · ${count} added` : ''}</span>}
                          {complete && s.key === 'payments' && <span className="text-ink-3"> · </span>}
                          {s.key === 'payments' && <span className="text-ink-3">Card payments need Stripe</span>}
                        </span>
                      )}
                    </span>
                    <Link href={s.href}
                      className="col-start-2 inline-flex min-h-10 shrink-0 items-center gap-0.5 justify-self-start sm:col-start-auto sm:justify-self-auto text-[13.5px] font-semibold text-accent-text hover:underline [@media(pointer:fine)]:min-h-0 [@media(pointer:fine)]:pt-0.5">
                      {complete ? 'Review' : s.cta}
                      <ChevronRight className="size-3.5" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <p className="text-[13px] text-ink-3">
          This school was created with sample data so you can see how everything fits together.
          Starting fresh, every step would be empty and this page would walk you through them in order.
        </p>
      </div></div>
    </Shell>
  );
}
