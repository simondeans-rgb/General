'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Shell } from './shell';
import { useRows, useRow } from '@/lib/query';
import { Beats, Button, EmptyState, ErrorState, Skeleton, SectionHead } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { CHECK_GAPS_TODAY, SAFEGUARDING_TODAY, type CheckGap } from '@/lib/repos/safeguarding';
import { SUMMARY, type BillingSummary } from '@/lib/repos/billing';
import { money, time, dayRange, dateLong, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';
import { cardPaymentsEnabled } from '@/lib/payments/invoice-status';
import { groupAttention } from '@/lib/office-words';

/**
 * The owner's Today (reference screen for docs/brand/DESIGN-SYSTEM.md).
 * One hero — the next class — then what needs a decision, ordered by
 * consequence, then today's classes, then money. Rules and type, not boxes.
 */
export function TodayView() {
  const [from, to] = React.useMemo(() => dayRange(0), []);
  const sessions = useRows<Q.SessionRow>(['sessions', from], Q.SESSIONS_BETWEEN, [from, to]);
  const term = useRow<Q.TermNow>(['term-now'], Q.TERM_NOW);
  const t = term.data;
  const live = (sessions.data ?? []).filter(s => s.status !== 'cancelled');
  const next = live.find(s => new Date(s.ends_at) > new Date()) ?? null;

  return (
    <Shell title="Today" allow={['owner', 'admin']}
      subtitle={<span className="flex flex-wrap items-center gap-x-2">{dateLong(new Date())}{t && <>
        <span aria-hidden className="hidden sm:inline">·</span><span>{t.name}, week {t.week} of {t.weeks}</span>
        <Beats value={t.week} max={t.weeks} size="sm" label={`Week ${t.week} of ${t.weeks}`} className="hidden sm:inline-flex" /></>}</span>}>
      {/* Phone order: next class, what needs you, money, then the day's list. */}
      <div className="mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1"><NextClass s={next} loading={sessions.isLoading} /></div>
        <div className="min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <NeedsAttention />
          <Money />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <TodaysClasses rows={sessions.data} loading={sessions.isLoading} error={sessions.error} retry={() => sessions.refetch()} />
        </div>
        <div className="grid gap-x-12 gap-y-8 border-t border-line pt-8 md:grid-cols-3 lg:col-span-2 lg:row-start-3">
          <RecentEnrolments />
          <UpcomingTrials />
          <RecentMessages />
        </div>
      </div>
    </Shell>
  );
}


/* ── The next class: the one number worth making big ─────────────────────── */
function NextClass({ s, loading }: { s: Q.SessionRow | null; loading: boolean }) {
  if (loading) return <Skeleton className="h-36" />;
  if (!s) return (
    <div><p className="label">Next</p><p className="mt-2 font-display text-[1.75rem] leading-tight">No more classes today</p>
      <p className="mt-1 text-ink-3">Tomorrow’s timetable is on the schedule.</p></div>
  );
  const mins = Math.round((new Date(s.starts_at).getTime() - Date.now()) / 60000);
  const when = mins > 0 ? (mins < 90 ? `in ${mins} min` : `at ${time(s.starts_at)}`) : 'on now';
  return (
    <section aria-labelledby="next-h" className="flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-end">
      <div>
        <p className="label text-accent-text">Next · {when}</p>
        <p id="next-h" className="display-xl mt-1 text-[length:min(4.5rem,22vw)] text-ink sm:text-[length:min(5.5rem,22vw)]">{time(s.starts_at)}</p>
      </div>
      <div className="min-w-0 flex-1 sm:pb-1.5">
        <p className="font-display text-[1.5rem] leading-tight">{s.name}</p>
        <p className="mt-1 text-[0.875rem] text-ink-3">{[s.teacher, s.room, s.location].filter(Boolean).join(' · ')}</p>
        <p className="mt-1 flex items-center gap-2 text-[0.875rem] text-ink-2">
          <Beats value={s.enrolled} max={s.capacity} label={`${s.enrolled} of ${s.capacity} places`} />
          <span className="tnum">{s.enrolled} of {s.capacity}{s.trials ? ` · ${s.trials} trial${s.trials === 1 ? '' : 's'}` : ''}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/teach/register/?session=${s.id}`}><Button variant="primary" tabIndex={-1}>Open register</Button></Link>
          <Link href="/schedule"><Button tabIndex={-1}>Timetable</Button></Link>
        </div>
      </div>
    </section>
  );
}

/* ── Today's classes ─────────────────────────────────────────────────────── */
function TodaysClasses({ rows, loading, error, retry }: { rows?: Q.SessionRow[]; loading: boolean; error: unknown; retry: () => void }) {
  return (
    <section>
      <SectionHead title={rows ? `Today · ${rows.length} class${rows.length === 1 ? '' : 'es'}` : 'Today'} meta="Booked of capacity" href="/schedule" link="Full schedule" />
      {loading && <div className="space-y-3 pt-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
      {error != null && <ErrorState error={error} onRetry={retry} />}
      {rows?.length === 0 && <EmptyState title="Nothing on today" body="Enjoy the quiet. Tomorrow’s classes are on the schedule." />}
      <ul className="divide-y divide-line">
        {rows?.map(s => {
          const cancelled = s.status === 'cancelled';
          return (
            <li key={s.id}>
              <Link href={`/teach/register/?session=${s.id}`} className="grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.5rem]">
                <span className={cn('font-display text-[1.1875rem] tnum', cancelled && 'text-ink-3 line-through')}>{time(s.starts_at)}</span>
                <span className="min-w-0">
                  <span className={cn('block truncate font-semibold', cancelled && 'text-ink-3')}>{s.name}</span>
                  <span className="block truncate text-[0.8125rem] text-ink-3">
                    {cancelled ? <span className="font-semibold uppercase tracking-wide text-critical">Cancelled{s.cancel_reason ? ` · ${s.cancel_reason}` : ''}</span>
                      : [s.covered ? `${s.teacher} (cover)` : s.teacher, s.room].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {!cancelled && <Beats value={s.enrolled} max={s.capacity} label={`${s.enrolled} of ${s.capacity} places`} className="hidden sm:inline-flex" />}
                <span className="tnum text-right text-[0.8438rem] text-ink-2">{cancelled ? '' : `${s.enrolled}/${s.capacity}`}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Needs attention: a number, what it means, one action ─────────────────
   Only genuine problems, under Today and This week (round 2, U13). Red marks
   what is urgent; everything else is ink. When nothing is wrong the section
   says so. */
type Item = { key: string; n: number; when: 'today' | 'week'; urgent?: boolean; headline: string; detail: string; href: string; action: string };

function NeedsAttention() {
  const pay = useRow<{ failed: number; failed_minor: string; outstanding_minor: string; unpaid_invoices: number }>(['att-pay'], Q.ATTENTION_PAYMENTS);
  const cap = useRows<{ id: string; name: string; capacity: number; enrolled: number; waiting: number; pct: number }>(['att-cap'], Q.ATTENTION_CAPACITY);
  const trials = useRows<{ id: string; contact_name: string; child_name: string; class_name: string }>(['att-trials'], Q.ATTENTION_TRIALS);
  const lapsed = useRows<{ id: string; first_name: string; last_name: string; class_name: string }>(['att-lapsed'], Q.ATTENTION_LAPSED);
  const reqs = useRow<{ open_requests: number; pending_entries: number; medical_updates: number }>(['att-requests'], Q.ATTENTION_REQUESTS);
  const msgs = useRow<{ awaiting: number; names: string | null }>(['att-messages'], Q.ATTENTION_MESSAGES);
  const follow = useRows<Q.FollowUp>(['att-follow-ups'], Q.ATTENTION_FOLLOW_UPS);
  // Staff checks missing or running out (UR-41): shown to the owner and the safeguarding lead only.
  const checks = useRows<CheckGap>(['att-checks'], CHECK_GAPS_TODAY);
  // Safeguarding setup (F1, N-06): until a lead is named, and anything to review.
  const sg = useRow<{ no_lead: boolean; media_links: number; holds_due: number }>(['att-safeguarding'], SAFEGUARDING_TODAY);
  const [all, setAll] = React.useState(false);
  const loading = sg.isLoading || checks.isLoading || pay.isLoading || cap.isLoading || trials.isLoading || lapsed.isLoading || reqs.isLoading || msgs.isLoading || follow.isLoading;
  const names = (list: string[], max = 3) => list.slice(0, max).join(', ') + (list.length > max ? '…' : '');

  const items: Item[] = [];
  const r = reqs.data;
  if (r && r.medical_updates > 0) items.push({ key: 'med', n: r.medical_updates, when: 'today', urgent: true, href: '/requests', action: 'Review',
    headline: `Medical update${r.medical_updates === 1 ? '' : 's'} to acknowledge`, detail: 'Teachers see the change once you record it' });
  if (sg.data?.no_lead) items.push({ key: 'dsl', n: 1, when: 'today', urgent: true, href: '/safeguarding', action: 'Name your lead',
    headline: 'No safeguarding lead named', detail: 'Concerns come only to the owner, and one about the owner reaches nobody' });
  if (sg.data && sg.data.media_links > 0) items.push({ key: 'media-links', n: sg.data.media_links, when: 'week', href: '/safeguarding', action: 'See which',
    headline: `Link${sg.data.media_links === 1 ? '' : 's'} to another site showing children`, detail: 'Hidden from families. Upload the file instead' });
  if (sg.data && sg.data.holds_due > 0) items.push({ key: 'holds', n: sg.data.holds_due, when: 'week', href: '/safeguarding', action: 'Review',
    headline: `Legal hold${sg.data.holds_due === 1 ? '' : 's'} to review`, detail: 'Keep a hold only while it is still needed' });
  if (checks.data?.length) items.push({ key: 'checks', n: checks.data.length, when: 'today', urgent: true, href: '/safeguarding', action: 'See who',
    headline: 'Staff checks to sort', detail: checks.data.slice(0, 2).map(c => `${c.name}: ${c.issue}`).join(' · ') + (checks.data.length > 2 ? '…' : '') });
  // Card payments are not connected in this build, so a declined card cannot
  // happen for real: the demo's sample failures are not shown as live work (U3).
  if (cardPaymentsEnabled() && pay.data && pay.data.failed > 0) items.push({ key: 'pay', n: pay.data.failed, when: 'today', urgent: true, href: '/billing',
    action: 'Retry', headline: `Card payment${pay.data.failed === 1 ? '' : 's'} failed`, detail: `${money(pay.data.failed_minor)} declined` });
  const due = (follow.data ?? []).filter(f => f.due_now);
  const soon = (follow.data ?? []).filter(f => !f.due_now);
  if (due.length) items.push({ key: 'follow-now', n: due.length, when: 'today', href: '/enrolment', action: 'Follow up',
    headline: `Enquir${due.length === 1 ? 'y' : 'ies'} to follow up`, detail: names(due.map(f => f.child_name ?? f.contact_name)) });
  if (msgs.data && msgs.data.awaiting > 0) items.push({ key: 'msg', n: msgs.data.awaiting, when: 'today', href: '/inbox', action: 'Reply',
    headline: `Famil${msgs.data.awaiting === 1 ? 'y' : 'ies'} waiting for a reply`, detail: (msgs.data.names ?? '') + (msgs.data.awaiting > 3 ? '…' : '') });
  if (r && (r.open_requests > 0 || r.pending_entries > 0)) items.push({ key: 'req', n: r.open_requests + r.pending_entries, when: 'today', href: '/requests', action: 'Open',
    headline: 'Requests to answer', detail: [r.pending_entries ? `${r.pending_entries} event entr${r.pending_entries === 1 ? 'y' : 'ies'}` : '', r.open_requests ? `${r.open_requests} question${r.open_requests === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ') });
  if (soon.length) items.push({ key: 'follow-soon', n: soon.length, when: 'week', href: '/enrolment', action: 'See who',
    headline: `Enquiry follow-up${soon.length === 1 ? '' : 's'} later this week`, detail: soon.slice(0, 3).map(f => `${f.child_name ?? f.contact_name} (${relativeDay(f.next_action_on)})`).join(', ') + (soon.length > 3 ? '…' : '') });
  if (trials.data?.length) items.push({ key: 'trial', n: trials.data.length, when: 'week', href: '/enrolment', action: 'Follow up',
    headline: 'Trials attended, not enrolled', detail: names(trials.data.map(t => t.child_name)) });
  cap.data?.filter(c => c.waiting > 0).forEach(c => items.push({ key: c.id, n: c.waiting, when: 'week', href: '/classes', action: 'Waiting list',
    headline: `Waiting for ${c.name}`, detail: `Class full · ${c.enrolled} of ${c.capacity}` }));
  if (lapsed.data?.length) { const n = new Set(lapsed.data.map(l => l.id)).size; items.push({ key: 'lapsed', n, when: 'week', href: '/people?filter=lapsed', action: 'See who',
    headline: `Missed three classes in a row`, detail: lapsed.data.slice(0, 3).map(l => `${l.first_name} ${l.last_name}`).join(', ') + (n > 3 ? '…' : '') }); }

  const g = groupAttention(items, 5, all);
  const anyUrgent = items.some(i => i.urgent);
  const row = (i: Item) => (
    <li key={i.key}>
      <Link href={i.href} className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-3 py-3">
        <span className={cn('font-display text-[1.75rem] leading-none tnum', i.urgent ? 'text-critical' : 'text-ink')}>{i.n}</span>
        <span className="min-w-0">
          <span className="block font-semibold leading-snug">{i.headline}{i.urgent && <span className="sr-only"> (urgent)</span>}</span>
          {i.detail && <span className="line-clamp-2 text-[0.8125rem] text-ink-3">{i.detail}</span>}
        </span>
        <span className="flex items-center gap-1 pt-0.5 text-[0.8125rem] font-semibold text-accent-text group-hover:underline">{i.action}<ArrowRight className="size-3.5" aria-hidden /></span>
      </Link>
    </li>
  );
  const group = (label: string, list: Item[]) => list.length > 0 && (
    <div>
      <h3 className="label pt-3">{label}</h3>
      <ul className="on-count divide-y divide-line">{list.map(row)}</ul>
    </div>
  );

  return (
    <section>
      <SectionHead title="Needs attention" meta={loading ? undefined : items.length ? `${items.length} thing${items.length === 1 ? '' : 's'}` : undefined} />
      {loading && <div className="space-y-3 pt-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
      {!loading && items.length === 0 && <EmptyState title="Nothing needs you" body="No one waiting for a reply, no follow-ups due, and everyone is turning up." />}
      {group('Today', g.today)}
      {group('This week', g.week)}
      {!loading && anyUrgent && <p className="pt-2 text-[0.7812rem] text-ink-3">Red numbers are urgent: deal with them first.</p>}
      {g.hidden > 0 && (
        <Button size="sm" variant="ghost" className="-ml-2 mt-1" onClick={() => setAll(true)}>{g.hidden} more</Button>
      )}
      {all && items.length > 5 && (
        <Button size="sm" variant="ghost" className="-ml-2 mt-1" onClick={() => setAll(false)}>Show fewer</Button>
      )}
    </section>
  );
}

/* ── Money: two figures and where they lead ──────────────────────────────── */
function Money() {
  const s = useRow<BillingSummary>(['billing-summary'], SUMMARY).data;
  return (
    <section>
      <SectionHead title="Money" href="/billing" link="Billing" />
      {!s ? <Skeleton className="mt-3 h-16" /> : (
        <dl className="grid grid-cols-2 gap-6 pt-3">
          <div><dt className="label">Outstanding</dt><dd className="stat-number mt-1 text-[1.875rem] leading-none">{money(s.outstanding_minor)}</dd>
            <dd className="mt-1 text-[0.8125rem] text-ink-3">{s.owing_families} famil{s.owing_families === 1 ? 'y' : 'ies'}{Number(s.overdue_minor) > 0 ? ` · ${money(s.overdue_minor)} overdue` : ''}</dd></div>
          <div><dt className="label">Collected, 30 days</dt><dd className="stat-number mt-1 text-[1.875rem] leading-none">{money(s.collected_30d_minor)}</dd>
            <dd className="mt-1 text-[0.8125rem] text-ink-3">Card, transfer and cash</dd></div>
        </dl>
      )}
    </section>
  );
}

/* ── Recent activity: three short text lists, no boxes ──────────────────── */
function MiniList<T>({ title, rows, empty, render, href, link }: {
  title: string; rows: ReturnType<typeof useRows<T>>; empty: string; render: (r: T) => React.ReactNode; href?: string; link?: string;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-1 flex items-baseline gap-3"><h2 className="section-title flex-1">{title}</h2>
        {href && <Link href={href} className="text-[0.8125rem] font-semibold text-accent-text hover:underline">{link}</Link>}</div>
      {rows.isLoading && <Skeleton className="mt-2 h-20" />}
      {rows.data?.length === 0 && <p className="py-3 text-sm text-ink-3">{empty}</p>}
      <ul className="divide-y divide-line">{rows.data?.slice(0, 4).map((r, i) => <li key={i} className="py-2.5">{render(r)}</li>)}</ul>
    </section>
  );
}

function RecentEnrolments() {
  const rows = useRows<{ id: string; started_on: string; first_name: string; last_name: string; class_name: string }>(['recent-enrolments'], Q.RECENT_ENROLMENTS);
  return <MiniList title="New in class" rows={rows} empty="No new enrolments yet." render={r => (
    <div className="flex items-baseline justify-between gap-3"><span className="min-w-0"><span className="font-medium">{r.first_name} {r.last_name}</span>
      <span className="block truncate text-[0.8125rem] text-ink-3">{r.class_name}</span></span><span className="shrink-0 text-[0.7812rem] text-ink-3">{relativeDay(r.started_on)}</span></div>)} />;
}

function UpcomingTrials() {
  const rows = useRows<{ id: string; who: string; class_name: string; starts_at: string | null; status: string }>(['upcoming-trials'], Q.UPCOMING_TRIALS);
  return <MiniList title="Trials coming up" rows={rows} href="/enrolment" link="Enrolment" empty="No trials booked." render={r => (
    <div className="flex items-baseline justify-between gap-3"><span className="min-w-0"><span className="font-medium">{r.who}</span>
      <span className="block truncate text-[0.8125rem] text-ink-3">{r.class_name}</span></span>
      <span className="shrink-0 text-[0.7812rem] text-ink-3">{r.starts_at ? `${relativeDay(r.starts_at)} ${time(r.starts_at)}` : 'Not booked'}</span></div>)} />;
}

function RecentMessages() {
  const rows = useRows<{ id: string; kind: string; subject: string; body: string; family_name: string | null; class_name: string | null; sent_at: string }>(['recent-messages'], Q.RECENT_MESSAGES);
  const who = (r: { kind: string; family_name: string | null; class_name: string | null }) => r.kind === 'direct' ? r.family_name : r.kind === 'class_broadcast' ? r.class_name : 'Everyone';
  return <MiniList title="Recent messages" rows={rows} href="/inbox" link="Messages" empty="No messages yet." render={r => (
    <div><div className="flex items-baseline justify-between gap-3"><span className="min-w-0 truncate font-medium">{r.subject || r.body}</span>
      <span className="shrink-0 text-[0.7812rem] text-ink-3">{relativeDay(r.sent_at)}</span></div>
      <span className="block truncate text-[0.8125rem] text-ink-3">{who(r)}</span></div>)} />;
}
