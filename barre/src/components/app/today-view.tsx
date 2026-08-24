'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle, CreditCard, Users, UserPlus, TrendingDown, ChevronRight, CalendarX2,
} from 'lucide-react';
import { Shell } from './shell';
import { useRows, useRow } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { money, time, greeting, dayRange, dateLong, relativeDay } from '@/lib/format';
import { SessionRow as Row } from './session-row';

export function TodayView() {
  const { session } = useSession();
  const [from, to] = React.useMemo(() => dayRange(0), []);

  const counts = useRow<Q.TodayCounts>(['today-counts'], Q.TODAY_COUNTS);
  const sessions = useRows<Q.SessionRow>(['sessions', from], Q.SESSIONS_BETWEEN, [from, to]);
  const first = session?.name.split(' ')[0] ?? '';

  return (
    <Shell
      title={`${greeting()}, ${first}`}
      subtitle={dateLong(new Date())}
      allow={['owner', 'admin']}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <TodayStrip counts={counts.data} loading={counts.isLoading} />
        <NeedsAttention />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader
              title="Today's timetable"
              action={<Link href="/schedule" className="text-[13px] font-medium text-accent hover:underline">
                Full schedule
              </Link>} />
            {sessions.isLoading && <div className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
            {sessions.error && <div className="p-4"><ErrorState error={sessions.error} onRetry={() => sessions.refetch()} /></div>}
            {sessions.data && sessions.data.length === 0 && (
              <EmptyState icon={<CalendarX2 className="size-5" />} title="Nothing scheduled today"
                          body="Enjoy the quiet. Tomorrow's classes are on the schedule." />
            )}
            {sessions.data && sessions.data.length > 0 && (
              <ul className="divide-y divide-line">
                {sessions.data.map(s => <li key={s.id}><Row session={s} /></li>)}
              </ul>
            )}
          </Card>

          <div className="space-y-5">
            <RecentEnrolments />
            <UpcomingTrials />
            <RecentMessages />
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ── The strip of numbers that answers "what is happening today" ─────────── */
function TodayStrip({ counts, loading }: { counts?: Q.TodayCounts; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[0,1,2,3].map(i =>
    <Card key={i} className="p-4"><Skeleton className="h-7 w-12" /><Skeleton className="mt-2 h-3 w-20" /></Card>)}</div>;
  if (!counts) return null;

  const items: [number, string, string?][] = [
    [counts.classes, counts.classes === 1 ? 'class' : 'classes'],
    [counts.students_expected, 'students expected'],
    [counts.trials, counts.trials === 1 ? 'trial' : 'trials'],
  ];
  if (counts.cancelled > 0) items.push([counts.cancelled, counts.cancelled === 1 ? 'class cancelled' : 'classes cancelled', 'critical']);
  else if (counts.covered > 0) items.push([counts.covered, counts.covered === 1 ? 'class covered' : 'classes covered', 'caution']);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([n, label, tone], i) => (
        <Card key={i} className="p-4">
          <p className={`tnum text-[26px] font-semibold leading-none tracking-[-0.02em] ${
            tone === 'critical' ? 'text-critical' : tone === 'caution' ? 'text-caution' : ''}`}>{n}</p>
          <p className="mt-1.5 text-[13px] text-ink-2">{label}</p>
        </Card>
      ))}
    </div>
  );
}

/* ── Needs attention ─────────────────────────────────────────────────────
   Only genuine problems appear. When nothing is wrong the section says so
   rather than inventing filler to keep the layout balanced. */
function NeedsAttention() {
  const pay = useRow<{ failed: number; outstanding_minor: string; unpaid_invoices: number }>(
    ['att-pay'], Q.ATTENTION_PAYMENTS);
  const cap = useRows<{ id: string; name: string; capacity: number; enrolled: number; waiting: number; pct: number }>(
    ['att-cap'], Q.ATTENTION_CAPACITY);
  const trials = useRows<{ id: string; contact_name: string; child_name: string; class_name: string }>(
    ['att-trials'], Q.ATTENTION_TRIALS);
  const lapsed = useRows<{ id: string; first_name: string; last_name: string; class_name: string }>(
    ['att-lapsed'], Q.ATTENTION_LAPSED);

  const loading = pay.isLoading || cap.isLoading || trials.isLoading || lapsed.isLoading;
  if (loading) return <Card className="p-4"><Skeleton className="h-5 w-40" /><Skeleton className="mt-3 h-16" /></Card>;

  const cards: React.ReactNode[] = [];

  if (pay.data && (pay.data.failed > 0 || Number(pay.data.outstanding_minor) > 0)) {
    cards.push(
      <AttentionCard key="pay" href="/people?filter=owing" tone="critical" icon={<CreditCard className="size-4" />}
        headline={pay.data.failed > 0
          ? `${pay.data.failed} failed payment${pay.data.failed === 1 ? '' : 's'}`
          : `${pay.data.unpaid_invoices} unpaid invoices`}
        detail={`${money(pay.data.outstanding_minor)} outstanding across ${pay.data.unpaid_invoices} invoice${pay.data.unpaid_invoices === 1 ? '' : 's'}`} />);
  }
  cap.data?.forEach(c => cards.push(
    <AttentionCard key={c.id} href="/classes" tone={c.waiting > 0 ? 'caution' : 'neutral'} icon={<Users className="size-4" />}
      headline={c.name}
      detail={`${c.pct}% full · ${c.enrolled}/${c.capacity}${c.waiting > 0 ? ` · ${c.waiting} waiting` : ''}`} />));

  if (trials.data && trials.data.length > 0) {
    cards.push(
      <AttentionCard key="trials" href="/enrolment" tone="info" icon={<UserPlus className="size-4" />}
        headline={`${trials.data.length} trial${trials.data.length === 1 ? '' : 's'} attended, not yet enrolled`}
        detail={trials.data.slice(0, 3).map(t => t.child_name).join(', ') + (trials.data.length > 3 ? '…' : '')} />);
  }
  if (lapsed.data && lapsed.data.length > 0) {
    const students = new Set(lapsed.data.map(l => l.id));
    cards.push(
      <AttentionCard key="lapsed" href="/people?filter=lapsed" tone="caution" icon={<TrendingDown className="size-4" />}
        headline={`${students.size} student${students.size === 1 ? '' : 's'} missed three classes in a row`}
        detail={lapsed.data.slice(0, 3).map(l => `${l.first_name} ${l.last_name}`).join(', ') + (lapsed.data.length > 3 ? '…' : '')} />);
  }

  return (
    <Card>
      <CardHeader title="Needs attention"
        subtitle={cards.length === 0 ? undefined : `${cards.length} thing${cards.length === 1 ? '' : 's'} to look at`} />
      {cards.length === 0
        ? <EmptyState title="Nothing needs you right now"
                      body="No failed payments, no full classes with people waiting, and everyone is turning up." />
        : <ul className="divide-y divide-line">{cards.map((c, i) => <li key={i}>{c}</li>)}</ul>}
    </Card>
  );
}

function AttentionCard({ href, tone, icon, headline, detail }: {
  href: string; tone: 'critical' | 'caution' | 'info' | 'neutral';
  icon: React.ReactNode; headline: string; detail: string;
}) {
  const ring = {
    critical: 'bg-critical-soft text-critical',
    caution: 'bg-caution-soft text-caution',
    info: 'bg-info-soft text-info',
    neutral: 'bg-surface-2 text-ink-2',
  }[tone];
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2">
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${ring}`} aria-hidden>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{headline}</span>
        <span className="block truncate text-[13px] text-ink-2">{detail}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}

/* ── Side columns ────────────────────────────────────────────────────────── */
function MiniList<T>({ title, rows, empty, render, href, linkLabel }: {
  title: string; rows: ReturnType<typeof useRows<T>>; empty: string;
  render: (r: T) => React.ReactNode; href?: string; linkLabel?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} action={href && (
        <Link href={href} className="text-[13px] font-medium text-accent hover:underline">{linkLabel}</Link>)} />
      {rows.isLoading && <div className="space-y-2.5 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-8" />)}</div>}
      {rows.error && <div className="p-4"><ErrorState error={rows.error} /></div>}
      {rows.data && rows.data.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-3">{empty}</p>}
      {rows.data && rows.data.length > 0 && (
        <ul className="divide-y divide-line">{rows.data.map((r, i) => <li key={i} className="px-4 py-2.5">{render(r)}</li>)}</ul>
      )}
    </Card>
  );
}

function RecentEnrolments() {
  const rows = useRows<{ id: string; started_on: string; first_name: string; last_name: string; class_name: string }>(
    ['recent-enrolments'], Q.RECENT_ENROLMENTS);
  return <MiniList title="Recent enrolments" rows={rows} empty="No new enrolments yet."
    render={r => (
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0"><span className="font-medium">{r.first_name} {r.last_name}</span>
          <span className="block truncate text-[13px] text-ink-2">{r.class_name}</span></span>
        <span className="shrink-0 text-[12.5px] text-ink-3">{relativeDay(r.started_on)}</span>
      </div>)} />;
}

function UpcomingTrials() {
  const rows = useRows<{ id: string; who: string; class_name: string; starts_at: string | null; status: string }>(
    ['upcoming-trials'], Q.UPCOMING_TRIALS);
  return <MiniList title="Upcoming trials" rows={rows} href="/enrolment" linkLabel="Pipeline"
    empty="No trials booked."
    render={r => (
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0"><span className="font-medium">{r.who}</span>
          <span className="block truncate text-[13px] text-ink-2">{r.class_name}</span></span>
        <span className="shrink-0 text-[12.5px] text-ink-3">
          {r.starts_at ? `${relativeDay(r.starts_at)} ${time(r.starts_at)}` : 'Not booked'}
        </span>
      </div>)} />;
}

function RecentMessages() {
  const rows = useRows<{ id: string; kind: string; subject: string; body: string; family_name: string | null; class_name: string | null; sent_at: string }>(
    ['recent-messages'], Q.RECENT_MESSAGES);
  const label = (r: { kind: string; family_name: string | null; class_name: string | null }) =>
    r.kind === 'direct' ? r.family_name : r.kind === 'class_broadcast' ? r.class_name : 'Everyone';
  return <MiniList title="Recent messages" rows={rows} empty="No messages yet."
    render={r => (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate font-medium">{r.subject}</span>
          <span className="shrink-0 text-[12.5px] text-ink-3">{relativeDay(r.sent_at)}</span>
        </div>
        <span className="block truncate text-[13px] text-ink-2">{label(r)}</span>
      </div>)} />;
}
