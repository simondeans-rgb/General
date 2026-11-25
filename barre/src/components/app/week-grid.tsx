'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { ErrorState } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { isoDate, time, dayName } from '@/lib/format';
import { cn } from '@/lib/cn';

const overlaps = (a: Q.SessionRow, b: Q.SessionRow) =>
  new Date(a.starts_at) < new Date(b.ends_at) && new Date(b.starts_at) < new Date(a.ends_at);

/**
 * The week as a grid: rooms down the side, days across (R-029). Two classes
 * in one room at once, or one teacher in two places, are marked as clashes.
 * Drag a class to another day to move that week's session (families are told).
 */
export function WeekGrid({ sessions, from, onOpen }: { sessions: Q.SessionRow[]; from: string | Date; onOpen: (s: Q.SessionRow) => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const days = React.useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(from); d.setDate(d.getDate() + i); return d; }), [from]);
  const live = sessions.filter(s => s.status !== 'cancelled');
  const shownDays = days.filter((d, i) => i < 5 || live.some(s => isoDate(s.starts_at) === isoDate(d)));
  const rooms = [...new Set(sessions.map(s => [s.location, s.room].filter(Boolean).join(' · ') || 'No room set'))].sort();
  const roomOf = (s: Q.SessionRow) => [s.location, s.room].filter(Boolean).join(' · ') || 'No room set';
  const clash = React.useMemo(() => {
    const ids = new Map<string, string>();
    for (const a of live) for (const b of live) {
      if (a.id >= b.id || !overlaps(a, b)) continue;
      if (a.room_id && a.room_id === b.room_id) { ids.set(a.id, `Same room as ${b.name}`); ids.set(b.id, `Same room as ${a.name}`); }
      else if (a.teacher && a.teacher === b.teacher) { ids.set(a.id, `${a.teacher} also teaches ${b.name}`); ids.set(b.id, `${b.teacher} also teaches ${a.name}`); }
    }
    return ids;
  }, [live]);
  const move = useMutation({
    mutationFn: (v: { s: Q.SessionRow; day: Date }) => {
      const start = new Date(v.s.starts_at); const next = new Date(v.day);
      next.setHours(start.getHours(), start.getMinutes(), 0, 0);
      return runAs(session, q => q(Q.MOVE_SESSION, [v.s.id, next.toISOString(), null, null, true]));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [dragging, setDragging] = React.useState<Q.SessionRow | null>(null);

  return (
    <div className="space-y-2">
      {clash.size > 0 && (
        <p role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-critical-soft px-3 py-2 text-[13px] text-critical">
          <AlertTriangle className="size-4" aria-hidden /> {clash.size} class{clash.size === 1 ? '' : 'es'} clash this week — marked in red.
        </p>
      )}
      {move.error != null && <ErrorState error={move.error} />}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-[12.5px]">
          <caption className="sr-only">Classes by room and day. Drag a class to another day to move it.</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 border-b border-line p-2 text-left font-medium text-ink-3">Room</th>
              {shownDays.map(d => (
                <th key={d.toISOString()} scope="col" className={cn('border-b border-l border-line p-2 text-left font-medium',
                  isoDate(d) === isoDate(new Date()) ? 'text-accent-text' : 'text-ink-2')}>
                  {dayName(d).slice(0, 3)} {d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r}>
                <th scope="row" className="border-b border-line p-2 text-left align-top font-medium">{r}</th>
                {shownDays.map(d => {
                  const here = sessions.filter(s => roomOf(s) === r && isoDate(s.starts_at) === isoDate(d))
                    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
                  return (
                    <td key={d.toISOString()} className={cn('border-b border-l border-line p-1 align-top', dragging && 'bg-surface-2/60')}
                      onDragOver={e => { if (dragging) e.preventDefault(); }}
                      onDrop={e => { e.preventDefault(); if (dragging && isoDate(dragging.starts_at) !== isoDate(d)) {
                        if (window.confirm(`Move ${dragging.name} to ${dayName(d)}? Families in the class will be told.`)) move.mutate({ s: dragging, day: d }); }
                        setDragging(null); }}>
                      <ul className="space-y-1">
                        {here.map(s => (
                          <li key={s.id}>
                            <button draggable={s.status !== 'cancelled'} onDragStart={() => setDragging(s)} onDragEnd={() => setDragging(null)}
                              onClick={() => onOpen(s)} title={clash.get(s.id)}
                              aria-label={`${s.name}, ${time(s.starts_at)}${s.teacher ? `, ${s.teacher}` : ''}${s.status === 'cancelled' ? ', cancelled' : ''}${clash.has(s.id) ? `, clash: ${clash.get(s.id)}` : ''}`}
                              className={cn('block w-full rounded-[var(--radius-sm)] border-l-[3px] bg-surface-2 px-1.5 py-1 text-left hover:bg-surface-3',
                                s.status === 'cancelled' && 'bg-surface-3 text-ink-2 line-through', clash.has(s.id) && 'ring-2 ring-critical')}
                              style={{ borderLeftColor: s.colour ?? 'var(--color-accent)' }}>
                              <span className="block font-medium leading-tight">{s.name}</span>
                              <span className={cn('block', s.status === 'cancelled' ? 'text-ink-2' : 'text-ink-3')}>{time(s.starts_at)}{s.teacher ? ` · ${s.teacher.split(' ')[0]}` : ''}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
