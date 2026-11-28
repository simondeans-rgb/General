'use client';

import { useRows } from '@/lib/query';
import { dateShort, dayName, time, dayDate } from '@/lib/format';

type R = { id: string; title: string; show_title: string; starts_at: string; venue: string | null; child: string | null };

/** Rehearsals for shows a family's child (or a teacher's class) is in (R-015). */
export function RehearsalList({ days = 42 }: { days?: number }) {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + days * 86400_000);
  const rows = useRows<R>(['my-rehearsals', from.toISOString()], `select * from app.my_rehearsals($1, $2)`, [from.toISOString(), to.toISOString()]);
  if (!rows.data?.length) return null;
  return (
    <section aria-labelledby="rehearsals-h">
      <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
        <h2 id="rehearsals-h" className="section-title flex-1">Rehearsals</h2>
        <span className="text-[0.8125rem] text-ink-3">For the shows coming up</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.data.map(r => (
          <li key={r.id} className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 py-3">
            <span className="leading-tight">
              <span className="block text-[0.7812rem] text-ink-3">{dayDate(r.starts_at)}</span>
              <span className="font-display text-[1.1875rem] tnum">{time(r.starts_at)}</span>
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{r.title}</span>
              <span className="block text-[0.8125rem] text-ink-3">{[r.show_title, r.child, r.venue].filter(Boolean).join(' · ')}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
