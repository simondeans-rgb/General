'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRows } from '@/lib/query';
import { cn } from '@/lib/cn';

/*
 * Small pieces shared by the parent and student screens. They follow the
 * reference screen (today-view.tsx): a section title over a 2px ink rule,
 * then hairline-divided rows. Kept here rather than in components/ui so the
 * shared primitives stay few.
 */

export { SectionHead } from '@/components/ui';
import { StyleMark, Word } from '@/components/ui';

export { StyleMark } from '@/components/ui';

/** Day and date in the short form used in time columns: "Tue 1". */
export function dayShort(v: string | Date) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'Europe/London' }).format(new Date(v));
}

/** "Tue 1 Dec" — for notices. */
export function dayDate(v: string | Date) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(new Date(v));
}

/** "10 DEC" style date for DUE notices. */
export function dueWord(v: string | Date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(new Date(v));
}

/**
 * What changed about a session after the timetable was published: moved to
 * another time or room, or covered by another teacher. Read-only, and limited
 * by the same row level security as the schedule itself.
 */
export type SessionChange = {
  id: string; original_starts_at: string | null; room_moved: boolean; covered: boolean;
  cancel_reason: string | null; changed_at: string | null;
};
const SESSION_CHANGES = `
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;

export function useSessionChanges(ids: string[]) {
  const key = [...new Set(ids)].sort();
  const q = useRows<SessionChange>(['session-changes', key.join(',')], SESSION_CHANGES, [key], { enabled: key.length > 0 });
  return React.useMemo(() => new Map((q.data ?? []).map(c => [c.id, c])), [q.data]);
}

/** A change word in a family's row (CANCELLED, MOVED): the shared Word at row size. */
export function ChangeWord({ word, tone = 'ink' }: { word: string; tone?: 'ink' | 'critical' }) {
  return <Word size="md" tone={tone}>{word}</Word>;
}

/** A class or event on a day list: time in a fixed column, then what, who and where. */
export function SessionRow({ time: t, until, name, meta, href, cancelled, reason, moved, style, colour, extra, clash }: {
  time: string; name: string; meta: (string | null | undefined)[]; href?: string; cancelled?: boolean;
  reason?: string | null; moved?: boolean; style?: string | null; colour?: string | null; extra?: React.ReactNode;
  /** The end time, under the start (U6). */
  until?: string | null;
  /** Booked into something else at the same time, in words (U6). */
  clash?: string | null;
}) {
  const body = (
    <>
      <span className={cn('leading-tight tnum', cancelled && 'text-ink-3')}>
        <span className={cn('block font-display text-[1.1875rem]', cancelled && 'line-through')}>{t}</span>
        {until && <span className="block text-[0.7812rem] text-ink-3">to {until}</span>}
      </span>
      <span className="min-w-0">
        <span className={cn('block font-semibold leading-snug', cancelled && 'text-ink-3')}>{name}</span>
        {clash && !cancelled && (
          <span className="mt-0.5 block text-[0.8125rem] font-semibold text-critical"><ChangeWord word="Clash" tone="critical" /> {clash}</span>
        )}
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3">
          {cancelled && <ChangeWord word="Cancelled" tone="critical" />}
          {!cancelled && moved && <ChangeWord word="Moved" />}
          {cancelled && reason ? <span>{reason}</span>
            : <span className="min-w-0">{meta.filter(Boolean).join(' · ')}</span>}
          {!cancelled && <StyleMark style={style ?? null} colour={colour} />}
          {extra}
        </span>
      </span>
    </>
  );
  const cls = 'grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3';
  return (
    <li>
      {href
        ? <Link href={href} aria-label={`${name}, ${t}${until ? ` to ${until}` : ''}${cancelled ? ', cancelled' : ''}${moved ? ', moved' : ''}${clash && !cancelled ? `, clash: ${clash}` : ''}`} className={cn(cls, 'hover:bg-surface-2/60')}>{body}</Link>
        : <div className={cls}>{body}</div>}
    </li>
  );
}

