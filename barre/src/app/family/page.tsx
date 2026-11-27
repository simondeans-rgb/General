'use client';

import { MySchoolHero } from '@/components/app/school-hero';
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { MakeUpOffers } from '@/components/app/absence-report';
import { useRows, useRow } from '@/lib/query';
import { Button, EmptyState, Skeleton, ErrorState, Notice } from '@/components/ui';
import * as F from '@/lib/repos/family';
import * as H from '@/lib/repos/hub';
import * as I from '@/lib/repos/inbox';
import { money, time, relativeDay, dateLong, dayRange, ageFrom } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PendingLogins } from '@/components/app/family-care';
import { SectionHead, StyleMark, dayDate, dueWord, useSessionChanges, type SessionChange } from './_parts/ui';
import { cardPaymentsEnabled } from '@/lib/payments/invoice-status';
import { useDueReminders } from '@/components/app/family-money';

type Child = { id: string; first_name: string; last_name: string; date_of_birth: string; class_names: string | null };
type Invoice = { id: string; number: string; status: string; issued_on: string; due_on: string; total_minor: number; paid_minor: number };

/**
 * A parent's week. What changed comes first, then each child's classes,
 * then what is owed, then the latest word from a teacher.
 */
export default function FamilyHome() {
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString(); }, [from]);
  const weekEnd = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 7); return d.getTime(); }, [from]);

  const schedule = useRows<F.NextClass>(['my-schedule', from], F.MY_SCHEDULE, [from, to]);
  const children = useRows<Child>(['my-children'], F.MY_CHILDREN);
  useDueReminders();
  const balance = useRow<{ name: string; balance_minor: string; unpaid: number; failed: number }>(['my-balance'], F.MY_BALANCE);
  const invoices = useRows<Invoice>(['my-invoices'], F.MY_INVOICES);
  const messages = useRows<{ id: string; kind: string; subject: string; body: string; sent_at: string; class_name: string | null }>(
    ['my-messages'], F.MY_MESSAGES);
  const notices = useRows<I.Broadcast>(['broadcasts'], I.BROADCASTS);
  const feedback = useRows<H.Feedback>(['feedback'], H.STUDENT_FEEDBACK);
  // A teenager's login waiting for a parent's approval (UR-16).
  const logins = useRows<F.ChildLogin>(['my-children-logins'], F.MY_CHILDREN_LOGINS);
  const pendingLogins = (logins.data ?? []).filter(l => l.state === 'pending').length;

  const rows = schedule.data ?? [];
  const changes = useSessionChanges(rows.map(r => r.id));

  // Each child's classes. A child with nothing this week shows their next one.
  const kids = React.useMemo(() => {
    const list = children.data ?? [];
    return list.map(c => {
      const mine = rows.filter(r => r.student_id === c.id);
      const week = mine.filter(r => new Date(r.starts_at).getTime() < weekEnd);
      return { child: c, week, later: week.length ? [] : mine.slice(0, 1) };
    });
  }, [children.data, rows, weekEnd]);

  // Changes worth a notice: moves and cover. One notice per session, even
  // when two children are in the same class.
  const changeNotices = React.useMemo(() => {
    const seen = new Map<string, { s: F.NextClass; kids: string[]; c: SessionChange }>();
    rows.forEach(s => {
      const c = changes.get(s.id);
      if (!c || s.status === 'cancelled' || !(c.original_starts_at || c.room_moved || c.covered)) return;
      const e = seen.get(s.id);
      if (e) e.kids.push(s.child); else seen.set(s.id, { s, kids: [s.child], c });
    });
    return [...seen.values()];
  }, [rows, changes]);

  const owes = !!balance.data && Number(balance.data.balance_minor) > 0;
  const unpaid = (invoices.data ?? []).filter(i => i.status === 'issued' || i.status === 'part_paid');
  const due = unpaid.map(i => i.due_on).filter(Boolean).sort()[0];
  const fresh = (notices.data ?? []).filter(n => !n.read_by_me && !n.scheduled);
  const loading = schedule.isLoading || children.isLoading;
  // Changes and money first; new notices fill what room is left, so the week stays near the top.
  const newShown = Math.min(2, Math.max(1, 4 - changeNotices.length - (owes ? 1 : 0)));

  return (
    <Shell title="This week" subtitle={dateLong(new Date())} allow={['guardian']}>
      <div className="mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0 space-y-10">
          {/* Notices: changes and dates nobody should miss. */}
          {(changeNotices.length > 0 || owes || fresh.length > 0 || pendingLogins > 0) && (
            <section aria-labelledby="notices-h">
              <SectionHead id="notices-h" title="Notices" />
              <ul className="on-count divide-y divide-line">
                <PendingLogins />
                {changeNotices.map(({ s, kids: who, c }) => (
                  <li key={s.id} className="py-3.5">
                    <Link href={`/class/?id=${s.class_id}`} className="block rounded-[var(--radius-sm)] hover:bg-surface-2/60">
                      <Notice
                        word={c.original_starts_at || c.room_moved ? 'Moved' : 'Changed'}
                        title={changeTitle(s, c)}
                        detail={[who.join(' and '), changeDetail(s, c)].filter(Boolean).join(' · ')} />
                    </Link>
                  </li>
                ))}
                {owes && (
                  <li className="py-3.5">
                    <Link href="/family/payments" className="block rounded-[var(--radius-sm)] hover:bg-surface-2/60">
                      <Notice tone="caution" word={due ? `Due ${dueWord(due)}` : 'Due'}
                        title={`${money(balance.data!.balance_minor)} to pay`}
                        detail={balance.data!.failed > 0
                          ? 'A card payment did not go through.'
                          : `${unpaid.length || balance.data!.unpaid} invoice${(unpaid.length || balance.data!.unpaid) === 1 ? '' : 's'}${unpaid[0] ? ` · ${unpaid.map(i => i.number).join(', ')}` : ''}`} />
                    </Link>
                  </li>
                )}
                {fresh.slice(0, newShown).map(n => (
                  <li key={n.id} className="py-3.5">
                    <Link href="/family/messages" className="block rounded-[var(--radius-sm)] hover:bg-surface-2/60">
                      <Notice word="New" title={n.subject || n.body}
                        detail={`${n.class_name ?? 'The studio'} · ${relativeDay(n.sent_at)}`} />
                    </Link>
                  </li>
                ))}
              </ul>
              {fresh.length > newShown && (
                <Link href="/family/messages" className="mt-1 inline-flex min-h-[44px] items-center gap-1 text-[0.8438rem] font-semibold text-accent-text hover:underline">
                  {fresh.length - newShown} more new notice{fresh.length - newShown === 1 ? '' : 's'}<ArrowRight className="size-3.5" aria-hidden />
                </Link>
              )}
            </section>
          )}

          {/* Each child's week. */}
          {loading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
          {schedule.error != null && <ErrorState error={schedule.error} onRetry={() => schedule.refetch()} />}
          {!loading && kids.length === 0 && (
            <EmptyState title="No children on your account yet"
              body="Add a child and choose their classes. Their week shows here."
              action={<Link href="/family/children"><Button tabIndex={-1}>Your family</Button></Link>} />
          )}
          {kids.map(({ child, week, later }) => {
            const age = ageFrom(child.date_of_birth);
            const live = week.filter(s => s.status !== 'cancelled').length;
            return (
              <section key={child.id} aria-labelledby={`kid-${child.id}`}>
                <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
                  <h2 id={`kid-${child.id}`} className="font-display text-[1.375rem] leading-none">{child.first_name}</h2>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink-3">
                    {age != null ? `${age} · ` : ''}{week.length
                      ? `${live} class${live === 1 ? '' : 'es'} this week`
                      : later.length ? 'Nothing this week' : 'No classes booked'}
                  </span>
                  <Link href="/family/schedule" className="shrink-0 text-[0.8125rem] font-semibold text-accent-text hover:underline">Schedule</Link>
                </div>
                {week.length === 0 && later.length === 0 ? (
                  <p className="py-3 text-[0.9062rem] text-ink-2">
                    {child.class_names ? 'No classes in the next two weeks.' : `${child.first_name} isn’t in a class yet. `}
                    {!child.class_names && <Link href="/family/children" className="font-semibold text-accent-text hover:underline">Find a class</Link>}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {[...week, ...later].map(s => <ClassRow key={`${s.id}-${s.student_id}`} s={s} c={changes.get(s.id)} later={!week.length} />)}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <div className="min-w-0 space-y-10">
          {/* Make-ups after a cancelled class or a reported absence (UR-56). */}
          <MakeUpOffers />
          {/* What is owed, and one way to pay it. */}
          <section aria-labelledby="pay-h">
            <SectionHead id="pay-h" title="Payments" href="/family/payments" link={owes ? 'Invoices' : 'History'} />
            {balance.isLoading && <Skeleton className="mt-3 h-16" />}
            {balance.data && (owes ? (
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3 pt-3">
                <div className="min-w-0 flex-1">
                  <p className="label">Due{due ? ` ${dueWord(due)}` : ''}</p>
                  <p className="stat-number mt-1 text-[2rem] leading-none tnum">{money(balance.data.balance_minor)}</p>
                  <p className="mt-1.5 text-[0.8125rem] text-ink-3">
                    {balance.data.failed > 0 ? 'A card payment did not go through.' : `${balance.data.unpaid} invoice${balance.data.unpaid === 1 ? '' : 's'} outstanding`}
                  </p>
                </div>
                {/* Nothing can be paid in the app until cards are connected, so the button
                    says where it goes (UR-11, parents D5). */}
                <Link href="/family/payments"><Button variant="primary" size="lg" tabIndex={-1}>
                  {cardPaymentsEnabled() ? `Pay ${money(balance.data.balance_minor)}` : 'See how to pay'}
                </Button></Link>
              </div>
            ) : (
              <p className="py-3 text-[0.9375rem] text-ink-2"><span className="font-semibold text-positive">Paid.</span> Nothing is due.</p>
            ))}
          </section>

          {/* The latest word from a teacher. */}
          {(feedback.data?.length ?? 0) > 0 && (() => {
            const f = feedback.data![0]!;
            return (
              <section aria-labelledby="fb-h">
                <SectionHead id="fb-h" title="Latest feedback" href={`/family/feedback?child=${f.student_id}`} link="All feedback" />
                <figure className="pt-3">
                  <blockquote className="text-[1rem] leading-snug text-ink">
                    “{f.going_well ?? f.headline}”
                  </blockquote>
                  <figcaption className="mt-1.5 text-[0.8125rem] text-ink-3">
                    {[f.author, `about ${f.student_name.split(' ')[0]}`, f.class_name, f.shared_at ? relativeDay(f.shared_at) : null].filter(Boolean).join(' · ')}
                  </figcaption>
                </figure>
              </section>
            );
          })()}

          <section aria-labelledby="studio-h">
            <SectionHead id="studio-h" title="From the studio" href="/family/messages" link="Messages" />
            {messages.isLoading && <Skeleton className="mt-3 h-16" />}
            {messages.data?.length === 0 && <p className="py-3 text-[0.9062rem] text-ink-3">Nothing from the studio yet.</p>}
            <ul className="divide-y divide-line">
              {messages.data?.filter(m => !fresh.slice(0, newShown).some(n => n.id === m.id)).slice(0, 3).map(m => (
                <li key={m.id} className="py-3">
                  <p className="font-semibold leading-snug">{m.subject}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.875rem] text-ink-2">{m.body}</p>
                  <p className="mt-1 text-[0.7812rem] text-ink-3">{m.class_name ? `${m.class_name} · ` : ''}{relativeDay(m.sent_at)}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Events and requests have no tab of their own (five is the most a
              bottom bar carries), so they get a way in from here. */}
          <nav aria-label="More" className="divide-y divide-line border-t border-line">
            {[
              ['/family/events', 'Shows and events', 'Shows, exams, competitions, privates'],
              ['/family/enquiries', 'Ask the studio', 'Questions, private lessons, medical updates'],
            ].map(([href, title, body]) => (
              <Link key={href} href={href!} className="group flex min-h-[56px] items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-[0.8125rem] text-ink-3">{body}</span>
                </span>
                <ArrowRight className="size-4 text-ink-3 group-hover:text-ink" aria-hidden />
              </Link>
            ))}
          </nav>

          <MySchoolHero />
        </div>
      </div>
    </Shell>
  );
}

function changeTitle(s: F.NextClass, c: SessionChange) {
  const when = dayDate(s.starts_at);
  if (c.original_starts_at && new Date(c.original_starts_at).getTime() !== new Date(s.starts_at).getTime())
    return dayDate(c.original_starts_at) === when
      ? `${s.name} on ${when} moves to ${time(s.starts_at)}`
      : `${s.name} on ${dayDate(c.original_starts_at)} moves to ${when}, ${time(s.starts_at)}`;
  if (c.room_moved && s.room) return `${s.name} on ${when} moves to ${s.room}`;
  if (c.covered && s.teacher) return `${s.teacher} teaches ${s.name} on ${when}`;
  return `${s.name} on ${when} has changed`;
}

function changeDetail(s: F.NextClass, c: SessionChange) {
  if (c.original_starts_at) return c.room_moved && s.room ? `In ${s.room}` : null;
  if (c.room_moved) return 'Same time';
  if (c.covered) return 'Cover teacher, same time and room';
  return null;
}

/** One class in a child's week: day and time in a fixed column, then what and where. */
function ClassRow({ s, c, later }: { s: F.NextClass; c?: SessionChange; later?: boolean }) {
  const cancelled = s.status === 'cancelled';
  const day = relativeDay(s.starts_at);
  const today = day === 'Today';
  const moved = !!c && (!!c.original_starts_at || c.room_moved);
  return (
    <li>
      <Link href={`/class/?id=${s.class_id}`} aria-label={`${s.name}, ${day} ${time(s.starts_at)}${cancelled ? ', cancelled' : ''}`}
        className="grid min-h-[56px] grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-4 py-3 hover:bg-surface-2/60">
        <span>
          <span className={cn('block text-[0.7812rem]', today ? 'font-semibold text-ink' : 'text-ink-3')}>
            {later ? dayDate(s.starts_at) : day.length > 9 ? day.slice(0, 3) : day}
          </span>
          <span className={cn('block font-display text-[1.1875rem] leading-tight tnum', cancelled && 'text-ink-3 line-through')}>{time(s.starts_at)}</span>
        </span>
        <span className="min-w-0">
          <span className={cn('block truncate font-semibold', cancelled && 'text-ink-3')}>{s.name}</span>
          {cancelled ? (
            <span className="mt-0.5 block text-[0.8125rem] text-ink-3">
              <span className="font-display text-[0.9375rem] uppercase leading-none tracking-[-0.01em] text-critical [font-stretch:80%]">Cancelled</span>
              {reasonOf(c)}
            </span>
          ) : (
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3">
              {moved && <span className="font-display text-[0.9375rem] uppercase leading-none tracking-[-0.01em] text-ink [font-stretch:80%]">Moved</span>}
              <span className="min-w-0 truncate">{[c?.covered && s.teacher ? `${s.teacher} (cover)` : s.teacher, s.room].filter(Boolean).join(' · ')}</span>
              <StyleMark style={s.style} colour={s.colour} className="hidden sm:inline-flex" />
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

const reasonOf = (c?: SessionChange) => c?.cancel_reason ? <> · {c.cancel_reason}</> : null;
