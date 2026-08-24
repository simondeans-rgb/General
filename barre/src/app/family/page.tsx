'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, User, CreditCard, Megaphone, CheckCircle2,
         Trophy, MessageSquarePlus } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, Button, type Tone } from '@/components/ui';
import * as F from '@/lib/repos/family';
import { money, time, greeting, relativeDay, dateShort, dayRange } from '@/lib/format';

const TONES: Record<string, Tone> = { violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

export default function FamilyHome() {
  const { session } = useSession();
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString(); }, [from]);

  const schedule = useRows<F.NextClass>(['my-schedule', from], F.MY_SCHEDULE, [from, to]);
  const balance = useRow<{ name: string; balance_minor: string; unpaid: number; failed: number }>(['my-balance'], F.MY_BALANCE);
  const messages = useRows<{ id: string; kind: string; subject: string; body: string; sent_at: string; class_name: string | null }>(
    ['my-messages'], F.MY_MESSAGES);

  const upcoming = (schedule.data ?? []).filter(s => s.status !== 'cancelled');
  const next = upcoming[0];
  const today = upcoming.filter(s => relativeDay(s.starts_at) === 'Today');
  const owes = balance.data && Number(balance.data.balance_minor) > 0;

  return (
    <Shell title={`${greeting()}, ${session?.name.split(' ')[0] ?? ''}`} allow={['guardian']}>
      <div className="mx-auto max-w-lg space-y-4">
        {schedule.isLoading && <Card className="p-4"><Skeleton className="h-24" /></Card>}
        {schedule.error && <ErrorState error={schedule.error} onRetry={() => schedule.refetch()} />}

        {/* The one thing a parent opens the app to find out. */}
        {next && (
          <Card className="overflow-hidden">
            <div className="bg-accent px-4 py-3 text-white">
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/75">
                {relativeDay(next.starts_at) === 'Today' ? "Next up today" : 'Next class'}
              </p>
              <p className="mt-0.5 text-[19px] font-semibold tracking-tight">{next.child} · {next.name}</p>
              <p className="mt-0.5 text-white/85">
                {relativeDay(next.starts_at)} at {time(next.starts_at)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm">
              {next.teacher && <div><dt className="text-ink-3">Teacher</dt><dd className="font-medium">{next.teacher}</dd></div>}
              {next.room && <div><dt className="text-ink-3">Where</dt>
                <dd className="font-medium">{[next.location, next.room].filter(Boolean).join(' · ')}</dd></div>}
            </dl>
          </Card>
        )}

        {!next && !schedule.isLoading && (
          <Card><EmptyState icon={<CalendarDays className="size-5" />} title="No classes coming up"
            body="When your child is enrolled in a class, it will appear here." /></Card>
        )}

        {today.length > 1 && (
          <Card>
            <CardHeader title="Also today" />
            <ul className="divide-y divide-line">
              {today.slice(1).map(s => (
                <li key={`${s.id}-${s.student_id}`} className="flex items-center gap-3 px-4 py-3">
                  <span className="tnum w-14 shrink-0 font-semibold">{time(s.starts_at)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="block truncate text-[13px] text-ink-2">{s.child}{s.room ? ` · ${s.room}` : ''}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Money. Shown plainly whether or not anything is owed. */}
        <Card>
          <CardHeader title="Payments" />
          <div className="p-4">
            {balance.isLoading && <Skeleton className="h-10" />}
            {balance.data && (
              owes ? (
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-caution-soft text-caution" aria-hidden>
                    <CreditCard className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{money(balance.data.balance_minor)} due</p>
                    <p className="text-[13px] text-ink-2">
                      {balance.data.failed > 0
                        ? 'A card payment did not go through.'
                        : `${balance.data.unpaid} invoice${balance.data.unpaid === 1 ? '' : 's'} outstanding.`}
                    </p>
                  </div>
                  {/* Honest about what is not built yet, rather than a button
                      that does nothing when tapped. */}
                  <Badge tone="neutral">Card payments coming soon</Badge>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-positive">
                  <CheckCircle2 className="size-4" aria-hidden /> Everything is paid. Nothing due.
                </p>
              )
            )}
          </div>
        </Card>

        {/* Events and enquiries have no tab of their own — five is the most a
            bottom bar can carry — so they get a way in from here. */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/family/events"
                className="card flex flex-col gap-2 p-4 transition-colors hover:bg-surface-2">
            <span className="grid size-9 place-items-center rounded-full bg-amber-soft text-amber" aria-hidden>
              <Trophy className="size-5" />
            </span>
            <span className="text-sm font-medium leading-tight">Competitions and events</span>
            <span className="text-[12.5px] text-ink-3">Shows, exams, privates</span>
          </Link>
          <Link href="/family/enquiries"
                className="card flex flex-col gap-2 p-4 transition-colors hover:bg-surface-2">
            <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent-ink" aria-hidden>
              <MessageSquarePlus className="size-5" />
            </span>
            <span className="text-sm font-medium leading-tight">Ask the studio</span>
            <span className="text-[12.5px] text-ink-3">Questions and updates</span>
          </Link>
        </div>

        <Card>
          <CardHeader title="From the studio" />
          {messages.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-12" />)}</div>}
          {messages.data?.length === 0 && <EmptyState title="No messages yet" />}
          <ul className="divide-y divide-line">
            {messages.data?.map(m => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-ink-3" aria-hidden>
                    <Megaphone className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{m.subject}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{m.body}</p>
                    <p className="mt-1 text-[12px] text-ink-3">
                      {m.class_name ? `${m.class_name} · ` : ''}{relativeDay(m.sent_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
