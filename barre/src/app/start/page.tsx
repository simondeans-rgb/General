'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readAs, runAs } from '@/lib/db/client';
import { SwayvoLogo } from '@/components/app/swayvo';
import { useSchoolTheme } from '@/components/app/brand';
import { Button, ErrorState, Field, Input, Notice, Skeleton } from '@/components/ui';
import { money, dateShort } from '@/lib/format';

type Plan = { code: string; name: string; price_minor: number; max_students: number | null;
  max_locations: number | null; max_staff: number | null; is_trial: boolean };
type Started = { studio_id: string; invitation_token: string; trial_ends_on: string };

const cap = (n: number | null, one: string, many: string) =>
  n == null ? `Any number of ${many}` : `Up to ${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;

/**
 * Start your school (F11): a new school on the free trial and an invitation
 * for its owner, the same pair the platform console makes (app.start_school).
 * Email is not connected, so the owner's link is shown here, once.
 */
export default function StartPage() {
  useSchoolTheme(null);
  const plans = useQuery({ queryKey: ['public-plans'], queryFn: () => readAs<Plan>(null, `select * from app.public_plans()`) });
  const open = useQuery({ queryKey: ['signups-open'], queryFn: () => readAs<{ open: boolean }>(null, `select app.signups_open() as open`) });
  const [school, setSchool] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const start = useMutation({
    mutationFn: async () => (await runAs(null, q => q<Started>(`select * from app.start_school($1, $2, $3)`,
      [school.trim(), name.trim(), email.trim()])))[0]!,
  });
  const trial = plans.data?.find(p => p.is_trial);
  const paid = (plans.data ?? []).filter(p => !p.is_trial);
  const valid = school.trim().length >= 2 && name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim());
  const done = start.data;

  return (
    <main id="main" className="min-h-dvh bg-surface px-4 pb-12 pt-8 sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/welcome" aria-label="Swayvo home"><SwayvoLogo className="mb-10 h-7" /></Link>

        {done ? (
          <section aria-labelledby="st-done">
            <p className="label text-accent-text">Your school is ready</p>
            <h1 id="st-done" className="mt-1 font-display text-[1.875rem] font-[800] leading-[1.05] [font-stretch:112%]">{school.trim()}</h1>
            <p className="mt-2 text-[0.9375rem] text-ink-2">
              Free trial until {dateShort(done.trial_ends_on)}. Nothing to pay, and no card asked for.
            </p>
            <div className="mt-6 border-t-2 border-ink pt-5">
              <Notice word="Your link" tone="accent" title="Open your owner invitation to sign in"
                detail="Swayvo does not send email yet, so this is the only place the link is shown. Open it now, or copy it somewhere safe; it works for 14 days." />
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/invite?token=${encodeURIComponent(done.invitation_token)}`}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-ink px-4 text-[0.9375rem] font-semibold text-surface hover:opacity-90">
                  Open my invitation
                </Link>
                <Button variant="ghost" onClick={() => navigator.clipboard?.writeText(
                  `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/invite?token=${encodeURIComponent(done.invitation_token)}`)}>
                  Copy the link
                </Button>
              </div>
              <p className="mt-4 text-[0.8125rem] text-ink-3">
                After signing in you land on Setup: your first timetable, your brand and your families, one step at a time.
              </p>
            </div>
          </section>
        ) : (
          <>
            <p className="label text-accent-text">Start your school</p>
            <h1 className="mt-1 font-display text-[1.875rem] font-[800] leading-[1.05] [font-stretch:112%]">Try Swayvo free for 30 days</h1>
            <p className="mt-2 text-[0.9375rem] text-ink-2">
              Your own school, empty and ready for your timetable. No card is needed. Before the trial ends, choose a plan
              in Settings › Plan.
            </p>

            {open.data?.[0]?.open === false ? (
              <div className="mt-6 border-t-2 border-ink pt-5">
                <Notice word="Closed" tone="caution" title="New schools are not being taken online at the moment"
                  detail="Contact Swayvo and we will set your school up for you." />
              </div>
            ) : (
              <form className="mt-6 space-y-4 border-t-2 border-ink pt-5" onSubmit={e => { e.preventDefault(); if (valid) start.mutate(); }}>
                <Field label="School name" htmlFor="st-school" required>
                  <Input id="st-school" value={school} onChange={e => setSchool(e.target.value)} maxLength={120} autoComplete="organization" />
                </Field>
                <Field label="Your name" htmlFor="st-name" required hint="You will be the school's owner.">
                  <Input id="st-name" value={name} onChange={e => setName(e.target.value)} maxLength={120} autoComplete="name" />
                </Field>
                <Field label="Your email" htmlFor="st-email" required>
                  <Input id="st-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} autoComplete="email" />
                </Field>
                {start.error && <ErrorState error={start.error} />}
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={start.isPending} disabled={!valid}>
                  Start my school
                </Button>
                <p className="text-center text-[0.8125rem] text-ink-3">Demo: no password is needed. In the live service you create your login first.</p>
              </form>
            )}

            <section aria-labelledby="st-plans" className="mt-12">
              <h2 id="st-plans" className="border-b-2 border-ink pb-2 section-title">Plans after the trial</h2>
              {plans.isLoading && <Skeleton className="mt-3 h-24" />}
              {plans.error && <ErrorState error={plans.error} />}
              <ul className="divide-y divide-line">
                {trial && (
                  <li className="flex flex-wrap items-baseline gap-x-4 py-3">
                    <span className="min-w-0 flex-1"><span className="block font-semibold">Free trial · 30 days</span>
                      <span className="block text-[0.8125rem] text-ink-2">
                        {cap(trial.max_students, 'student', 'students')}, {cap(trial.max_locations, 'location', 'locations').toLowerCase()}, {cap(trial.max_staff, 'member of staff', 'staff').toLowerCase()}</span></span>
                    <span className="stat-number text-[1.125rem]">Free</span>
                  </li>
                )}
                {paid.map(p => (
                  <li key={p.code} className="flex flex-wrap items-baseline gap-x-4 py-3">
                    <span className="min-w-0 flex-1"><span className="block font-semibold">{p.name}</span>
                      <span className="block text-[0.8125rem] text-ink-2">
                        {cap(p.max_students, 'student', 'students')}, {cap(p.max_locations, 'location', 'locations').toLowerCase()}, {cap(p.max_staff, 'member of staff', 'staff').toLowerCase()}</span></span>
                    <span className="stat-number text-[1.125rem]">{money(p.price_minor)}<span className="font-sans text-[0.8125rem] font-normal text-ink-3"> a month</span></span>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-[0.8125rem] text-ink-3">
                Children who have left are kept and never count towards a plan. You can change plan yourself from Settings › Plan.
                Card payment for plans is not connected yet: Swayvo invoices the school.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
