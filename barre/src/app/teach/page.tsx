'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, UserRoundX } from 'lucide-react';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { TeacherWeek } from '@/components/app/teacher-week';
import { CrossSchoolAgenda, useStaffSchools } from '@/components/app/cross-school-agenda';
import { downloadIcs } from '@/lib/ics';
import { RehearsalList } from '@/components/app/rehearsals';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Button, Field, Input, Skeleton, ErrorState, SectionHead, ViewTabs } from '@/components/ui';
import { RecordSheet } from '@/components/app/record-sheet';
import { medicalLine } from '@/components/app/medical-brief';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs, readAs } from '@/lib/db/client';
import * as T from '@/lib/repos/teaching';
import { time, dateLong, dateShort, dayRange, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';

const sameDay = (a: string | Date, b: Date) => new Date(a).toDateString() === b.toDateString();
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * A teacher's Today, read standing up between classes: the next class is the
 * hero (time, room, who needs watching), then the rest of today, a nudge to
 * give feedback after a class, and the fortnight ahead with cover requests.
 */
export default function TeachToday() {
  const { session } = useSession();
  const [from] = React.useMemo(() => dayRange(0), []);
  // Today, plus the next fortnight, so a teacher can see their week ahead.
  const to = React.useMemo(() => {
    const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString();
  }, [from]);
  const [asking, setAsking] = React.useState<T.TeachSession | null>(null);
  const sessions = useRows<T.TeachSession>(['my-sessions', from], T.MY_SESSIONS, [from, to]);
  // Teachers at two or more schools can see their week across all of them (UR-47).
  const schools = useStaffSchools();
  const multi = schools.length > 1;
  // List (the day and the fortnight ahead), the week as a grid, or every school at once.
  type View = 'list' | 'grid' | 'across';
  const [view, setView] = React.useState<View>('list');
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('barre.teach.view');
      if (v === 'grid' || v === 'across') setView(v); else if (v === 'week') setView('across');
    } catch {}
  }, []);
  const pick = (v: View) => { setView(v); try { localStorage.setItem('barre.teach.view', v); } catch {} };
  const week = multi && view === 'across';
  const grid = view === 'grid';

  const now = new Date();
  const all = sessions.data ?? [];
  const mine = (s: T.TeachSession) => s.status !== 'cancelled' && !s.covered_by;
  const next = all.find(s => mine(s) && new Date(s.ends_at) > now) ?? null;
  const today = all.filter(s => sameDay(s.starts_at, now) && s.id !== next?.id);
  const later = all.filter(s => !sameDay(s.starts_at, now) && s.id !== next?.id);
  // The most recent class of today that has finished: feedback while it's fresh.
  const finished = [...all].reverse().find(s => mine(s) && sameDay(s.starts_at, now) && new Date(s.ends_at) <= now) ?? null;

  return (
    <Shell title="Today" subtitle={dateLong(now)} allow={['owner','admin','teacher']}
           actionsInline actions={<CalendarSubscribe onDownload={() => downloadTeaching(session)} allSchools={multi} />}>
      <div className={cn('mx-auto mb-6', grid ? 'max-w-[1240px]' : 'max-w-[1040px]')}>
        <ViewTabs label="Show my classes as" value={week ? 'across' : grid ? 'grid' : 'list'} onChange={pick}
          options={multi
            ? [['list', 'List'], ['grid', 'Week grid'], ['across', 'All my schools']]
            : [['list', 'List'], ['grid', 'Week grid']]} />
      </div>
      {week ? <CrossSchoolAgenda /> : grid ? <div className="mx-auto max-w-[1240px]"><TeacherWeek /></div> : <div className="mx-auto grid max-w-[1040px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {sessions.isLoading && <div className="space-y-4"><Skeleton className="h-24 w-48" /><Skeleton className="h-28" /></div>}
        {sessions.error != null && <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />}

        {sessions.data && (
          <>
            <div className="min-w-0 space-y-10">
              <NextClass s={next} onAskCover={() => next && setAsking(next)} />
              {today.length > 0 && (
                <section aria-labelledby="today-h">
                  <SectionHead id="today-h" title={next && sameDay(next.starts_at, now) ? 'Later today' : 'Today'} meta={plural(today.length, 'class', 'classes')} />
                  <ul className="divide-y divide-line">
                    {today.map(s => <li key={s.id}><TeachRow s={s} onAskCover={() => setAsking(s)} /></li>)}
                  </ul>
                </section>
              )}
              <AfterClass done={finished} upcoming={next} />
            </div>

            <div className="min-w-0 space-y-10">
              <section aria-labelledby="fortnight-h">
                <SectionHead id="fortnight-h" title="Next two weeks" meta={later.length ? plural(later.length, 'class', 'classes') : undefined} />
                {later.length === 0
                  ? <p className="py-3 text-[0.9062rem] text-ink-3">Nothing else on your timetable for two weeks.</p>
                  : <ul className="divide-y divide-line">
                      {later.map(s => <li key={s.id}><TeachRow s={s} showDay onAskCover={() => setAsking(s)} /></li>)}
                    </ul>}
                {later.length > 0 && <p className="pt-3 text-[0.8125rem] text-ink-3">Can’t make one? Ask the office for cover from its row.</p>}
              </section>
              <RehearsalList days={21} />
            </div>
          </>
        )}
      </div>}
      {asking && <CoverRequestSheet s={asking} onClose={() => setAsking(null)} />}
    </Shell>
  );
}


/* ── The next class: time, place, who to watch, one button ──────────────── */
function NextClass({ s, onAskCover }: { s: T.TeachSession | null; onAskCover: () => void }) {
  const roll = useRows<T.RegisterEntry>(['register', s?.id ?? ''], T.REGISTER, [s?.id], { enabled: !!s });
  if (!s) return (
    <section aria-labelledby="next-h">
      <p className="label">Next</p>
      <h2 id="next-h" className="mt-2 font-display text-[1.75rem] leading-tight">Nothing on for two weeks</h2>
      <p className="mt-1 text-ink-3">New classes and cover appear here as soon as the office adds them.</p>
    </section>
  );

  const now = Date.now();
  const mins = Math.round((new Date(s.starts_at).getTime() - now) / 60000);
  const isToday = sameDay(s.starts_at, new Date());
  const whenLabel = !isToday ? `${relativeDay(s.starts_at)}${/^\d/.test(relativeDay(s.starts_at)) ? '' : ` ${dateShort(s.starts_at)}`}`
    : mins <= 0 ? 'on now' : mins < 90 ? `in ${mins} min` : `at ${time(s.starts_at)}`;
  const flagged = (roll.data ?? []).filter(r => r.requires_alert || r.has_medical_need)
    .sort((a, b) => Number(b.requires_alert) - Number(a.requires_alert));
  const urgent = flagged.some(r => r.requires_alert);
  const started = new Date(s.starts_at).getTime() <= now;
  const canAsk = !started && !s.covering && !s.cover_requested;

  return (
    <section aria-labelledby="next-h">
      <p className="label text-accent-text">Next · {whenLabel}</p>
      <p className="display-xl mt-1 text-[length:min(5rem,22vw)] text-ink sm:text-[length:min(6rem,22vw)]">{time(s.starts_at)}</p>
      <h2 id="next-h" className="mt-3 font-display text-[1.625rem] leading-tight">{s.name}</h2>
      <p className="mt-1 text-[0.9375rem] text-ink-3">
        {[s.location, s.room,
          `${s.enrolled} booked${s.trials ? ` + ${plural(s.trials, 'trial')}` : ''}`].filter(Boolean).join(' · ')}
      </p>
      {s.reported_absent && (
        <p className="mt-1 text-[0.9375rem] text-ink-2"><span className="font-semibold">{s.reported_absent}</span> — reported absent</p>
      )}
      {(s.covering || s.cover_requested) && (
        <p className="mt-1 text-[0.875rem] font-semibold text-ink-2">{s.covering ? 'You are covering this class' : 'Cover requested · the office will confirm'}</p>
      )}

      {flagged.length > 0 && (
        <div role="note" className={cn('mt-4 border-l-4 py-0.5 pl-3', urgent ? 'border-critical' : 'border-caution')}>
          <p className={cn('text-[0.9375rem] font-semibold', urgent ? 'text-critical' : 'text-caution')}>
            {plural(flagged.length, 'medical note')}
          </p>
          <ul className="mt-0.5 space-y-0.5 text-[0.9375rem] text-ink">
            {flagged.slice(0, 4).map(r => (
              <li key={r.student_id}>
                <span className="font-semibold">{r.preferred_name ?? r.first_name} {r.last_name}</span>
                {' — '}{medicalLine(r)}
              </li>
            ))}
            {flagged.length > 4 && <li className="text-ink-3">and {flagged.length - 4} more on the register</li>}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={`/teach/register/?session=${s.id}`} className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-56" tabIndex={-1}>Open register</Button>
        </Link>
        {canAsk && (
          <Button variant="ghost" onClick={onAskCover} className="text-ink-2">
            <UserRoundX className="size-4" aria-hidden /> Ask for cover
          </Button>
        )}
      </div>
    </section>
  );
}

/* ── After class: two lines of feedback while it's fresh ─────────────────── */
function AfterClass({ done, upcoming }: { done: T.TeachSession | null; upcoming: T.TeachSession | null }) {
  const s = done ?? (upcoming && sameDay(upcoming.starts_at, new Date()) ? upcoming : null);
  if (!s) return null;
  return (
    <section aria-labelledby="after-h" className="rounded-[var(--radius-lg)] bg-surface-2 p-4">
      <h2 id="after-h" className="section-title">After class</h2>
      <p className="mt-1 text-[0.9375rem] text-ink-2">
        {done ? `${s.name} is done. Two lines of feedback while it’s fresh?`
              : `When ${s.name} finishes, tap a child and what fits. Families see it once you share.`}
      </p>
      {done && (
        <Link href={`/teach/feedback/?session=${s.id}`}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-accent-text hover:underline">
          Give feedback for {s.name} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}

function CoverRequestSheet({ s, onClose }: { s: T.TeachSession; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [reason, setReason] = React.useState('');
  const [handover, setHandover] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const ask = useMutation({
    mutationFn: () => runAs(session, q => q(T.REQUEST_COVER_HANDOVER, [s.id, reason.trim(), handover.trim() || null])),
    onSuccess: () => { setSent(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (sent) return <RecordSheet title="Asked" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">The office has your request and will tell you who is covering.</p></RecordSheet>;
  return (
    <RecordSheet title="Ask for cover" subtitle={`${s.name} · ${dateLong(s.starts_at)} at ${time(s.starts_at)}`}
      onClose={onClose} onSave={() => ask.mutate()} saving={ask.isPending} error={ask.error} canSave={reason.trim().length >= 3} saveLabel="Send to the office">
      <Field label="Why" htmlFor="cr-r" required hint="Only the office sees this.">
        <Input id="cr-r" value={reason} onChange={e => setReason(e.target.value)} placeholder="Hospital appointment" />
      </Field>
      <Field label="Handover for whoever covers" htmlFor="cr-h" hint="Optional. The plan, music, children to watch. Shown on their register.">
        <textarea id="cr-h" rows={3} value={handover} onChange={e => setHandover(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.9375rem] focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
    </RecordSheet>
  );
}

/** One class in a list: time, name, place, and at most one status in words. */
function TeachRow({ s, showDay, onAskCover }: { s: T.TeachSession; showDay?: boolean; onAskCover?: () => void }) {
  const cancelled = s.status === 'cancelled';
  const coveredByOther = !!s.covered_by;
  const expected = s.enrolled + s.trials;
  const done = s.marked >= expected && expected > 0;
  const started = new Date(s.starts_at) <= new Date();

  // One status, most important first; colour only backs up the word.
  const status: [string, string] | null =
    cancelled ? [`Cancelled${s.cancel_reason ? ` · ${s.cancel_reason}` : ''}`, 'text-critical font-semibold']
    : coveredByOther ? [`Covered by ${s.covered_by}`, 'text-ink-2']
    : s.covering ? ['You are covering', 'text-ink font-semibold']
    : s.cover_requested ? ['Cover requested', 'text-caution font-semibold']
    : done ? ['Register done', 'text-positive font-semibold']
    : started ? ['Register due', 'text-caution font-semibold']
    : null;
  const meta = [s.room, `${expected} expected${s.trials ? ` · ${plural(s.trials, 'trial')}` : ''}`,
    s.reported_absent && `${s.reported_absent} — reported absent`].filter(Boolean).join(' · ');

  const inner = (
    <div className="grid min-h-14 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3">
      <span className={cn('leading-tight', cancelled && 'text-ink-3')}>
        {showDay && <span className="block text-[0.7812rem] text-ink-3">{dayLabel(s.starts_at)}</span>}
        <span className={cn('font-display text-[1.1875rem] tnum', cancelled && 'line-through')}>{time(s.starts_at)}</span>
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate font-semibold', (cancelled || coveredByOther) && 'text-ink-3')}>{s.name}</span>
        <span className="block truncate text-[0.8125rem] text-ink-3">
          {status && <span className={status[1]}>{status[0]}</span>}
          {status && !cancelled && !coveredByOther && <span aria-hidden> · </span>}
          {!cancelled && !coveredByOther && meta}
        </span>
      </span>
      {!cancelled && !coveredByOther ? <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden /> : <span />}
    </div>
  );

  if (cancelled || coveredByOther) return inner;
  return (
    <div className="flex items-center gap-1">
      <Link href={`/teach/register/?session=${s.id}`} className="block min-w-0 flex-1 rounded-[var(--radius-sm)] hover:bg-surface-2/60">{inner}</Link>
      {onAskCover && !started && !s.covering && !s.cover_requested && (
        <Button size="sm" variant="ghost" className="size-11 shrink-0 p-0" onClick={onAskCover}
                aria-label={`Ask for cover for ${s.name}, ${dayLabel(s.starts_at)} ${time(s.starts_at)}`} title="Ask for cover">
          <UserRoundX className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}

const dayLabel = (v: string | Date) => {
  const r = relativeDay(v);
  return /^\d/.test(r) ? r : r.length > 9 ? r.slice(0, 3) + ' ' + dateShort(v) : r;
};

/** A teacher's classes for the coming term as a calendar file (R-036). */
async function downloadTeaching(session: ReturnType<typeof useSession>['session']) {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + 16 * 7 * 86400_000);
  const rows = await readAs<T.TeachSession>(session, T.MY_SESSIONS, [from.toISOString(), to.toISOString()]);
  downloadIcs('my-teaching.ics', 'Teaching', rows.filter(s => !s.covered_by).map(s => ({
    id: s.id, title: s.covering ? `${s.name} (cover)` : s.name, starts_at: s.starts_at, ends_at: s.ends_at,
    location: [s.room, s.location].filter(Boolean).join(', ') || null, cancelled: s.status === 'cancelled',
  })));
}
