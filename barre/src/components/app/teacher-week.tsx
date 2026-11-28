'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekGrid } from '@/components/app/week-grid';
import { useRows } from '@/lib/query';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import type { SessionRow } from '@/lib/repos/dashboard';
import { weekRange, dateLong } from '@/lib/format';

/**
 * A teacher's own week as the office's visual grid: their classes and any
 * they cover, by room and day. Look and open only: tapping a class opens its
 * register; nothing can be dragged or moved from here.
 */
export function TeacherWeek({ onAskCover }: { onAskCover?: (s: T.TeachSession) => void } = {}) {
  const router = useRouter();
  const [anchor, setAnchor] = React.useState(() => new Date());
  // Open on the week of the next class, not a week that is over (U10).
  const [soon] = React.useState(() => { const f = new Date(); return [f.toISOString(), new Date(f.getTime() + 28 * 86400_000).toISOString()]; });
  const upcoming = useRows<T.TeachSession>(['my-sessions', soon[0], 'next'], T.MY_SESSIONS, soon);
  const moved = React.useRef(false);
  React.useEffect(() => {
    if (moved.current || !upcoming.data) return;
    moved.current = true;
    const n = upcoming.data.find(s => s.status !== 'cancelled' && !s.covered_by && new Date(s.ends_at) > new Date());
    if (n) setAnchor(new Date(n.starts_at));
  }, [upcoming.data]);
  const frame = React.useRef<HTMLDivElement>(null);
  const [from, to] = React.useMemo(() => weekRange(anchor), [anchor]);
  const rows = useRows<T.TeachSession>(['my-sessions', from, 'week'], T.MY_SESSIONS, [from, to]);
  const thisWeek = new Date(from).toDateString() === new Date(weekRange(new Date())[0]).toDateString();
  const shift = (weeks: number) => { moved.current = true; const n = new Date(anchor); n.setDate(n.getDate() + weeks * 7); setAnchor(n); };

  // The grid speaks the office's shape; fill it from the teacher's own sessions.
  const sessions: SessionRow[] = React.useMemo(() => (rows.data ?? []).map(s => ({
    id: s.id, class_id: s.class_id, name: s.name, starts_at: s.starts_at, ends_at: s.ends_at,
    status: s.status, style: s.style, colour: s.colour, level: null,
    // Own classes and covers are both "You", so a cover that overlaps her own class is a clash.
    teacher: s.covered_by ? `Covered by ${s.covered_by}` : 'You',
    room: s.room, location: s.location,
    enrolled: s.enrolled, capacity: s.capacity, trials: s.trials,
    covered: s.covering || !!s.covered_by, cancel_reason: s.cancel_reason, moved: false,
    usual_teacher: null, room_id: null, register_closed: !!s.register_closed_at,
  })), [rows.data]);

  // On a phone the grid scrolls sideways: bring the next class into view.
  React.useEffect(() => {
    const box = frame.current; const el = box?.querySelector<HTMLElement>('[data-next]');
    if (!box || !el) return;
    // Whichever frames scroll sideways between the class and this section.
    for (let p: HTMLElement | null = el.parentElement; p && box.contains(p); p = p.parentElement) {
      if (p.scrollWidth > p.clientWidth + 1) p.scrollLeft += el.getBoundingClientRect().left - p.getBoundingClientRect().left - 96;
    }
  }, [sessions]);

  return (
    <section aria-labelledby="tw-h" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="tw-h" className="section-title">
          {dateLong(from)} – {dateLong(new Date(new Date(to).getTime() - 86400000))}
        </h2>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => shift(-1)} aria-label="Previous week">
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setAnchor(new Date())} disabled={thisWeek}>
            {thisWeek ? 'This week' : 'Back to this week'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shift(1)} aria-label="Next week">
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      {rows.isLoading && <Skeleton className="h-64" />}
      {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
      {rows.data && sessions.length === 0 && (
        <EmptyState title="No classes this week" body="Nothing on your timetable, or this week falls in a break." />
      )}
      {sessions.length > 0 && (
        // On a phone the week is wider than the screen: it scrolls sideways in its own frame.
        <div ref={frame} className="relative -mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <div className="min-w-[44rem] lg:min-w-0">
            <WeekGrid readOnly sessions={sessions} from={from}
              onOpen={s => router.push(`/teach/register/?session=${s.id}`)}
              onAskCover={onAskCover ? s => { const t = rows.data?.find(x => x.id === s.id); if (t && !t.covering && !t.cover_requested) onAskCover(t); } : undefined} />
          </div>
        </div>
      )}
      {sessions.length > 0 && (
        <p className="text-[0.8125rem] text-ink-3 lg:hidden">Swipe sideways to see the whole week. Tap a class to open its register.</p>
      )}
    </section>
  );
}
