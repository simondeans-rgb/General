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
export function TeacherWeek() {
  const router = useRouter();
  const [anchor, setAnchor] = React.useState(() => new Date());
  const [from, to] = React.useMemo(() => weekRange(anchor), [anchor]);
  const rows = useRows<T.TeachSession>(['my-sessions', from, 'week'], T.MY_SESSIONS, [from, to]);
  const thisWeek = new Date(from).toDateString() === new Date(weekRange(new Date())[0]).toDateString();
  const shift = (weeks: number) => { const n = new Date(anchor); n.setDate(n.getDate() + weeks * 7); setAnchor(n); };

  // The grid speaks the office's shape; fill it from the teacher's own sessions.
  const sessions: SessionRow[] = React.useMemo(() => (rows.data ?? []).map(s => ({
    id: s.id, class_id: s.class_id, name: s.name, starts_at: s.starts_at, ends_at: s.ends_at,
    status: s.status, style: s.style, colour: s.colour, level: null,
    teacher: s.covering ? 'You (cover)' : s.covered_by ? `Covered by ${s.covered_by}` : 'You',
    room: s.room, location: s.location,
    enrolled: s.enrolled, capacity: s.capacity, trials: s.trials,
    covered: s.covering || !!s.covered_by, cancel_reason: s.cancel_reason, moved: false,
    usual_teacher: null, room_id: null, register_closed: !!s.register_closed_at,
  })), [rows.data]);

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
        <div className="relative -mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <div className="min-w-[44rem] lg:min-w-0">
            <WeekGrid readOnly sessions={sessions} from={from}
              onOpen={s => router.push(`/teach/register/?session=${s.id}`)} />
          </div>
        </div>
      )}
      {sessions.length > 0 && (
        <p className="text-[0.8125rem] text-ink-3 lg:hidden">Swipe sideways to see the whole week. Tap a class to open its register.</p>
      )}
    </section>
  );
}
