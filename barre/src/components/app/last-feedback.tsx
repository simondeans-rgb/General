'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { useRows } from '@/lib/query';
import * as P from '@/lib/repos/progress';
import { relativeDay } from '@/lib/format';

/**
 * The last thing written for a child, at the point of teaching (UR-25):
 * "to work on" on the summary line, the rest one tap further in. Collapsed by
 * default so a register stays a fast list. Renders nothing when there is no
 * earlier note. `exceptSession` leaves out the session being written now.
 */
export function LastFeedback({ studentId, exceptSession, name, empty }: { studentId: string; exceptSession?: string | null; name?: string; empty?: string }) {
  const rows = useRows<P.LastNote>(['last-feedback', studentId, exceptSession ?? ''], P.LAST_FEEDBACK, [studentId, exceptSession ?? null]);
  const n = rows.data?.[0];
  if (!n) return empty && rows.data ? <p className="text-[13px] text-ink-3">{empty}</p> : null;
  return (
    <details className="group border-l-2 border-line-strong pl-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[14px] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] text-ink-3">Last feedback{name ? <span className="sr-only"> for {name}</span> : null} · {relativeDay(n.at)}{n.class_name ? ` · ${n.class_name}` : ''}</span>
          {n.work_on
            ? <span className="block truncate"><span className="font-semibold">To work on:</span> {n.work_on}</span>
            : <span className="block truncate text-ink-2">{n.going_well}</span>}
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-1 pb-2 text-[14px]">
        {n.going_well && <p><span className="font-semibold">Going well:</span> {n.going_well}</p>}
        {n.work_on && <p><span className="font-semibold">To work on:</span> {n.work_on}{n.resource_title ? ` · ${n.resource_title}` : ''}</p>}
        <p className="text-[13px] text-ink-3">{n.shared ? 'Shared with the family' : 'Draft, not shared yet'}</p>
      </div>
    </details>
  );
}
