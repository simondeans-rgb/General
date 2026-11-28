'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TimetableAdd, useAddParam } from '@/components/app/timetable-add';
import { Shell } from '@/components/app/shell';
import { SessionRow, SectionHead, ViewTabs } from '@/components/app/session-row';
import { SessionSheet } from '@/components/app/session-sheet';
import { ClassForm } from '@/components/app/class-form';
import { WeekGrid } from '@/components/app/week-grid';
import { useLocationFilter } from '@/components/app/location-filter';
import { useRows } from '@/lib/query';
import { Button, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { weekRange, dateLong, dayName, isoDate, toDate } from '@/lib/format';

type View = 'grid' | 'week' | 'day' | 'teacher' | 'room';

export default function SchedulePage() {
  const [anchor, setAnchor] = React.useState(() => new Date());
  const [adding, setAdding] = React.useState(false);
  useAddParam(k => { if (k === 'class') setAdding(true); });
  const [view, setView] = React.useState<View>('grid');
  const [open, setOpen] = React.useState<Q.SessionRow | null>(null);
  // The grid needs width; a phone starts on the list.
  React.useEffect(() => { if (window.innerWidth < 768) setView('week'); }, []);
  const [from, to] = React.useMemo(() => weekRange(anchor), [anchor]);
  const all = useRows<Q.SessionRow>(['week', from], Q.SESSIONS_BETWEEN, [from, to]);
  const place = useLocationFilter();
  const sessions = { ...all, data: all.data?.filter(s => place.keep(s.location)) };

  const shift = (weeks: number) => {
    const next = new Date(anchor); next.setDate(next.getDate() + weeks * 7); setAnchor(next);
  };
  const thisWeek = new Date(from).toDateString() === new Date(weekRange(new Date())[0]).toDateString();

  return (
    <Shell
      help={<>Every class session, week by week. The week grid shows rooms side by side and names any clash; drag a class to another day to move that week’s session. Tap a class to cancel it, move it or arrange cover — families are told.</>}
      title="Schedule"
      subtitle={`${dateLong(from)} – ${dateLong(new Date(new Date(to).getTime() - 86400000))}`}
      allow={['owner', 'admin']}
      actions={
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => shift(-1)} aria-label="Previous week">
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button size="sm" variant={thisWeek ? "ghost" : "secondary"} onClick={() => setAnchor(new Date())}
                  disabled={thisWeek}>
            {thisWeek ? 'This week' : <><span className="sm:hidden">Today</span><span className="hidden sm:inline">Back to today</span></>}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shift(1)} aria-label="Next week">
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <TimetableAdd here="schedule" onAdd={() => setAdding(true)} />
        </div>
      }
    >
      <div className="mx-auto max-w-[1240px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <ViewTabs label="Schedule view" value={view} onChange={setView}
            options={[['grid', 'Week grid'], ['week', 'List'], ['day', 'Day'], ['teacher', 'Teacher'], ['room', 'Room']]} />
          {place.control}
        </div>

        {sessions.isLoading && <div className="space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {sessions.error && <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />}
        {sessions.data && sessions.data.length === 0 && <EmptyWeek after={to} onGo={d => setAnchor(d)} />}
        {sessions.data && sessions.data.length > 0 && (view === 'grid'
          ? <WeekGrid sessions={sessions.data} from={from} onOpen={setOpen} />
          : <Grouped sessions={sessions.data} view={view} />)}
        {open && <SessionSheet session={open} onClose={() => setOpen(null)} />}
      </div>
      {adding && <ClassForm onClose={() => setAdding(false)} />}
    </Shell>
  );
}

/** One grouping component for all four views: the axis changes, not the rows. */
function Grouped({ sessions, view }: { sessions: Q.SessionRow[]; view: View }) {
  const [open, setOpen] = React.useState<Q.SessionRow | null>(null);
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
    return <EmptyState title="Nothing on today"
      body="The rest of the week is in the list and the grid." />;
  }

  return (
    <div className="space-y-10">
      {open && <SessionSheet session={open} onClose={() => setOpen(null)} />}
      {groups.map(([key, rows]) => {
        const label = key.includes('|') ? key.split('|')[1]! : key;
        const date = key.includes('|') ? key.split('|')[0]! : null;
        const heads = rows.reduce((n, r) => n + (r.status === 'cancelled' ? 0 : r.enrolled), 0);
        const isToday = date === isoDate(new Date());
        return (
          <section key={key}>
            <SectionHead title={<>{date ? dateLong(date) : label}{isToday && <span className="ml-2 text-[0.8125rem] font-semibold text-accent-text">Today</span>}</>}
              meta={`${rows.length} class${rows.length === 1 ? '' : 'es'} · ${heads} booked`} />
            <ul className="divide-y divide-line">
              {rows.map(s => <li key={s.id}><SessionRow session={s} onSelect={() => setOpen(s)} /></li>)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * An empty week says where the classes are (owners U7): a new school whose
 * term starts in January lands on a blank week, with one step to its first.
 */
function EmptyWeek({ after, onGo }: { after: string | Date; onGo: (d: Date) => void }) {
  const next = useRows<{ starts_at: string; term_name: string | null; term_start: boolean }>(['next-class-week', String(after)], Q.NEXT_CLASS_WEEK,
    [toDate(after).toISOString()]).data?.[0];
  return (
    <EmptyState title="No classes this week"
      body={next ? `The next class is on ${dateLong(next.starts_at)}${next.term_name ? `, ${next.term_start ? 'when' : 'in'} ${next.term_name}${next.term_start ? ' starts' : ''}` : ''}.`
        : 'The term hasn’t started yet, or this week falls in a break.'}
      action={next && <Button size="sm" onClick={() => onGo(toDate(next.starts_at))}>
        {next.term_name && next.term_start ? `Go to the first week of ${next.term_name}` : 'Go to the next week with classes'}
      </Button>} />
  );
}
