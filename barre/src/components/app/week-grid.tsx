'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { ErrorState, Notice } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { isoDate, time, dayName } from '@/lib/format';
import { cn } from '@/lib/cn';
import { StyleMark, Word, styleColour } from './session-row';

const overlaps = (a: Q.SessionRow, b: Q.SessionRow) =>
  new Date(a.starts_at) < new Date(b.ends_at) && new Date(b.starts_at) < new Date(a.ends_at);

/**
 * The week as a grid: rooms down the side, days across (R-029). Two classes
 * in one room at once, or one teacher in two places, are marked as clashes —
 * in words, not only in red. Drag a class to another day to move that week's
 * session (families are told). Today's column carries the accent.
 */
export function WeekGrid({ sessions, from, onOpen }: { sessions: Q.SessionRow[]; from: string | Date; onOpen: (s: Q.SessionRow) => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const days = React.useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(from); d.setDate(d.getDate() + i); return d; }), [from]);
  const live = sessions.filter(s => s.status !== 'cancelled');
  const shownDays = days.filter((d, i) => i < 5 || live.some(s => isoDate(s.starts_at) === isoDate(d)));
  const roomOf = (s: Q.SessionRow) => [s.location, s.room].filter(Boolean).join(' · ') || 'No room set';
  const rooms = [...new Map(sessions.map(s => [roomOf(s), s])).entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const today = isoDate(new Date());
  const now = Date.now();
  const next = live.filter(s => new Date(s.ends_at).getTime() > now).sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];
  const clash = React.useMemo(() => {
    const ids = new Map<string, string>();
    for (const a of live) for (const b of live) {
      if (a.id >= b.id || !overlaps(a, b)) continue;
      if (a.room_id && a.room_id === b.room_id) { ids.set(a.id, `Same room as ${b.name}`); ids.set(b.id, `Same room as ${a.name}`); }
      else if (a.teacher && a.teacher === b.teacher) { ids.set(a.id, `${a.teacher.split(' ')[0]} also teaches ${b.name}`); ids.set(b.id, `${b.teacher.split(' ')[0]} also teaches ${a.name}`); }
    }
    return ids;
  }, [live]);
  const clashing = live.filter(s => clash.has(s.id));
  const styles = [...new Map(sessions.filter(s => s.style).map(s => [s.style!, s.colour])).entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const move = useMutation({
    mutationFn: (v: { s: Q.SessionRow; day: Date }) => {
      const start = new Date(v.s.starts_at); const next = new Date(v.day);
      next.setHours(start.getHours(), start.getMinutes(), 0, 0);
      return runAs(session, q => q(Q.MOVE_SESSION, [v.s.id, next.toISOString(), null, null, true]));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [dragging, setDragging] = React.useState<Q.SessionRow | null>(null);
  // Compact: one line per class (time and name) — for busy weeks and clash-heavy days.
  const busiest = React.useMemo(() => {
    const n = new Map<string, number>(); for (const s of sessions) { const k = `${s.room_id ?? s.location}|${new Date(s.starts_at).toDateString()}`; n.set(k, (n.get(k) ?? 0) + 1); }
    return Math.max(0, ...n.values());
  }, [sessions]);
  const [compact, setCompact] = React.useState<boolean | null>(null);
  const isCompact = compact ?? busiest >= 3;

  return (
    <div className="space-y-5">
      {clashing.length > 0 && (
        <div role="status" className="border-l-2 border-critical pl-3">
          <Notice word="Clash" tone="critical"
            title={`${clashing.length} class${clashing.length === 1 ? '' : 'es'} clash this week`}
            detail={clashing.slice(0, 5).map(s => `${dayName(s.starts_at).slice(0, 3)} ${time(s.starts_at)} ${s.name}`).join(' · ') + (clashing.length > 5 ? ' …' : '') + '. Open a class to move it or arrange cover.'} />
        </div>
      )}
      {move.error != null && <ErrorState error={move.error} />}
      <label className="flex items-center gap-2 text-[13.5px] text-ink-2">
        <input type="checkbox" className="size-4 accent-[var(--color-accent)]" checked={isCompact} onChange={e => setCompact(e.target.checked)} />
        Compact view — time and name only
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed border-collapse text-[13px]">
          <caption className="sr-only">Classes by room and day. Drag a class to another day to move it.</caption>
          <thead>
            <tr>
              <th scope="col" className="w-44 border-b-2 border-ink pb-2 pr-3 text-left align-bottom"><span className="label">Room</span></th>
              {shownDays.map(d => {
                const isToday = isoDate(d) === today;
                return (
                  <th key={d.toISOString()} scope="col" aria-current={isToday ? 'date' : undefined}
                    className={cn('border-b-2 border-ink px-2 pb-2 text-left align-bottom font-normal', isToday && 'bg-surface-2/70')}>
                    {isToday && <span aria-hidden className="mb-2 block h-[3px] w-6 bg-accent" />}
                    <span className={cn('block text-[13px] font-semibold', isToday ? 'text-accent-text' : 'text-ink-2')}>
                      {dayName(d).slice(0, 3)}{isToday && <span className="sr-only"> (today)</span>}
                    </span>
                    <span className={cn('block font-display text-[22px] leading-none', isToday ? 'text-accent-text' : 'text-ink')}>{d.getDate()}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map(([r, sample]) => (
              <tr key={r}>
                <th scope="row" className="border-b border-line py-3 pr-3 text-left align-top font-normal">
                  <span className="block font-semibold leading-snug text-ink">{sample.room ?? r}</span>
                  {sample.room && sample.location && <span className="block text-[12.5px] text-ink-3">{sample.location}</span>}
                </th>
                {shownDays.map(d => {
                  const isToday = isoDate(d) === today;
                  const here = sessions.filter(s => roomOf(s) === r && isoDate(s.starts_at) === isoDate(d))
                    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
                  return (
                    <td key={d.toISOString()} className={cn('border-b border-l border-line p-1.5 align-top', isToday && 'bg-surface-2/70', dragging && 'bg-surface-2')}
                      onDragOver={e => { if (dragging) e.preventDefault(); }}
                      onDrop={e => { e.preventDefault(); if (dragging && isoDate(dragging.starts_at) !== isoDate(d)) {
                        if (window.confirm(`Move ${dragging.name} to ${dayName(d)}? Families in the class will be told.`)) move.mutate({ s: dragging, day: d }); }
                        setDragging(null); }}>
                      <ul className="space-y-1.5">
                        {here.map(s => {
                          const cancelled = s.status === 'cancelled';
                          const clashed = clash.has(s.id);
                          const isNext = next?.id === s.id;
                          return (
                            <li key={s.id}>
                              <button draggable={!cancelled} onDragStart={() => setDragging(s)} onDragEnd={() => setDragging(null)}
                                onClick={() => onOpen(s)} title={clash.get(s.id)}
                                aria-label={`${s.name}, ${time(s.starts_at)}${s.teacher ? `, ${s.teacher}` : ''}${cancelled ? ', cancelled' : ''}${clashed ? `, clash: ${clash.get(s.id)}` : ''}${isNext ? ', next class' : ''}`}
                                className={cn('block w-full rounded-[var(--radius-sm)] border border-l-[3px] bg-surface px-2 py-1.5 text-left transition-colors hover:bg-surface-2',
                                  clashed ? 'border-critical' : isNext ? 'border-accent-line' : 'border-line',
                                  cancelled && 'bg-transparent')}
                                style={{ borderLeftColor: cancelled ? 'var(--color-line-strong)' : clashed ? 'var(--color-critical)' : styleColour(s.colour) }}>
                                <span className={cn('flex items-baseline gap-1.5 font-display text-[14px] leading-tight tnum', cancelled ? 'text-ink-3 line-through' : isNext ? 'text-accent-text' : 'text-ink')}>
                                  {time(s.starts_at)}{isNext && <span className="font-sans text-[11.5px] font-semibold no-underline">next</span>}
                                </span>
                                <span className={cn('mt-0.5 block font-semibold leading-tight', cancelled ? 'text-ink-3 line-through' : 'text-ink')}>{s.name}</span>
                                {!isCompact && <span className="mt-0.5 block truncate text-[12px] text-ink-3">
                                  {[s.teacher?.split(' ')[0], s.style].filter(Boolean).join(' · ')}
                                </span>}
                                {cancelled && <span className="mt-1 block leading-tight"><Word tone="critical">Cancelled</Word>
                                  {s.cancel_reason && !isCompact && <span className="block text-[12px] text-ink-2">{s.cancel_reason}</span>}</span>}
                                {!cancelled && clashed && <span className="mt-1 block leading-tight"><Word tone="critical">Clash</Word>
                                  {!isCompact && <span className="block text-[12px] text-critical">{clash.get(s.id)}</span>}</span>}
                                {!cancelled && !clashed && (s.moved || s.covered) && <span className="mt-1 flex gap-2 leading-tight">
                                  {s.moved && <Word>Moved</Word>}{s.covered && <Word tone="caution">Cover</Word>}</span>}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {styles.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-3">
          {styles.map(([name, colour]) => <StyleMark key={name} colour={colour} name={name} />)}
          <span className="sm:ml-auto">Drag a class to another day to move it. Families are told.</span>
        </div>
      )}
    </div>
  );
}
