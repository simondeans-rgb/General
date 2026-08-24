'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { SessionRow } from '@/components/app/session-row';
import { useRows } from '@/lib/query';
import { Button, Card, EmptyState, Skeleton, ErrorState, Badge } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { weekRange, dateLong, dayName, isoDate, toDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type View = 'week' | 'day' | 'teacher' | 'room';

export default function SchedulePage() {
  const [anchor, setAnchor] = React.useState(() => new Date());
  const [view, setView] = React.useState<View>('week');
  const [from, to] = React.useMemo(() => weekRange(anchor), [anchor]);
  const sessions = useRows<Q.SessionRow>(['week', from], Q.SESSIONS_BETWEEN, [from, to]);

  const shift = (weeks: number) => {
    const next = new Date(anchor); next.setDate(next.getDate() + weeks * 7); setAnchor(next);
  };
  const thisWeek = new Date(from).toDateString() === new Date(weekRange(new Date())[0]).toDateString();

  return (
    <Shell
      title="Schedule"
      subtitle={`${dateLong(from)} – ${dateLong(new Date(new Date(to).getTime() - 86400000))}`}
      allow={['owner', 'admin']}
      actions={
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => shift(-1)} aria-label="Previous week">
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button size="sm" variant={thisWeek ? 'secondary' : 'primary'} onClick={() => setAnchor(new Date())}>
            {thisWeek ? 'This week' : 'Back to today'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shift(1)} aria-label="Next week">
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-4">
        <div role="tablist" aria-label="Schedule view"
             className="inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5">
          {(['week','day','teacher','room'] as View[]).map(v => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={cn('min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors',
                view === v ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:text-ink')}>
              {v === 'room' ? 'Room' : v}
            </button>
          ))}
        </div>

        {sessions.isLoading && <Card className="space-y-3 p-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</Card>}
        {sessions.error && <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />}
        {sessions.data && sessions.data.length === 0 && (
          <Card><EmptyState icon={<CalendarX2 className="size-5" />} title="No classes this week"
            body="Either the term has not started or this week falls in a break." /></Card>
        )}
        {sessions.data && sessions.data.length > 0 && (
          <Grouped sessions={sessions.data} view={view} />
        )}
      </div>
    </Shell>
  );
}

/** One grouping component for all four views: the axis changes, not the rows. */
function Grouped({ sessions, view }: { sessions: Q.SessionRow[]; view: View }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Q.SessionRow[]>();
    const keyOf = (s: Q.SessionRow) =>
      view === 'teacher' ? (s.teacher ?? 'Unassigned')
      : view === 'room' ? [s.location, s.room].filter(Boolean).join(' · ') || 'No room set'
      : `${isoDate(s.starts_at)}|${dayName(s.starts_at)}`;
    for (const s of sessions) {
      if (view === 'day' && isoDate(s.starts_at) !== isoDate(new Date())) continue;
      const k = keyOf(s);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [sessions, view]);

  if (groups.length === 0) {
    return <Card><EmptyState icon={<CalendarX2 className="size-5" />} title="Nothing today"
      body="Switch to the week view to see the rest of the timetable." /></Card>;
  }

  return (
    <div className="space-y-4">
      {groups.map(([key, rows]) => {
        const label = key.includes('|') ? key.split('|')[1]! : key;
        const date = key.includes('|') ? key.split('|')[0]! : null;
        const heads = rows.reduce((n, r) => n + (r.status === 'cancelled' ? 0 : r.enrolled), 0);
        return (
          <Card key={key}>
            <div className="flex items-baseline gap-2.5 border-b border-line px-4 py-2.5">
              <h2 className="font-semibold">{label}</h2>
              {date && <span className="text-[13px] text-ink-3">{dateLong(date)}</span>}
              <span className="ml-auto text-[12.5px] text-ink-3">
                {rows.length} class{rows.length === 1 ? '' : 'es'} · {heads} places
              </span>
            </div>
            <ul className="divide-y divide-line">
              {rows.map(s => <li key={s.id}><SessionRow session={s} /></li>)}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
