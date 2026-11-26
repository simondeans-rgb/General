'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timer } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Input } from '@/components/ui';
import { cn } from '@/lib/cn';
import * as E from '@/lib/repos/events';
import { dateShort } from '@/lib/format';

const thisWeek = (rows: E.PracticeWeek[] | undefined, id: string) => {
  const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return (rows ?? []).find(r => r.student_id === id && new Date(r.week_start).getTime() >= monday.getTime() - 86400_000);
};

/** A student (or parent) logs practice between classes (R-059). */
export function PracticeLog({ studentId, who = 'you', bare }: { studentId: string; who?: string; bare?: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const recent = useRows<{ id: string; practised_on: string; minutes: number; what: string | null }>(['practice', studentId], E.MY_PRACTICE, [studentId]);
  const weeks = useRows<E.PracticeWeek>(['practice-weekly'], E.PRACTICE_WEEKLY, [1]);
  const [mins, setMins] = React.useState('15');
  const [what, setWhat] = React.useState('');
  const log = useMutation({
    mutationFn: () => runAs(session, q => q(E.LOG_PRACTICE, [studentId, Number(mins), what])),
    onSuccess: () => { setWhat(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const w = thisWeek(weeks.data, studentId);
  const H = bare ? 'h3' : 'h2';
  return (
    <section aria-label={bare ? `Practice, ${who}` : undefined}>
      <div className={cn('flex items-baseline gap-3', bare ? 'pb-1' : 'mb-1 border-b-2 border-ink pb-2')}>
        <H className="section-title min-w-0 flex-1">Practice</H>
        <span className="text-[13px] text-ink-3">{who === 'you' ? 'Your teacher sees the weekly total' : 'The teacher sees the weekly total'}</span>
      </div>
      <p className="flex items-baseline gap-2 pt-2">
        <span className="stat-number text-[28px] leading-none tnum">{w?.minutes ?? 0}</span>
        <span className="text-[14px] text-ink-2">min this week{w && w.minutes > 0 ? (who === 'you' ? '. Well done.' : `. Nice work, ${who}.`) : ''}</span>
      </p>
      <form className="flex flex-wrap items-center gap-2 py-3" onSubmit={e => { e.preventDefault(); log.mutate(); }}>
        <label className="flex items-center gap-1.5 text-sm"><Timer className="size-4 text-ink-3" aria-hidden />
          <Input aria-label="Minutes" type="number" min={1} max={600} className="h-11 w-20" value={mins} onChange={e => setMins(e.target.value)} /> min</label>
        <Input aria-label="What was practised" className="h-11 min-w-0 flex-1 basis-40" placeholder="e.g. shuffles, splits" maxLength={200} value={what} onChange={e => setWhat(e.target.value)} />
        <Button type="submit" variant={bare ? 'secondary' : 'primary'} className="h-11" disabled={!(Number(mins) > 0)} loading={log.isPending}>Log</Button>
      </form>
      {log.error != null && <div className="pb-3"><ErrorState error={log.error} /></div>}
      {!!recent.data?.length && (
        <ul className="divide-y divide-line border-t border-line text-[14px]">
          {recent.data.slice(0, 4).map(r => (
            <li key={r.id} className="flex gap-3 py-2"><span className="w-16 shrink-0 text-ink-3 tnum">{dateShort(r.practised_on)}</span>
              <span className="min-w-0 flex-1 truncate">{r.what ?? 'Practice'}</span><span className="tnum">{r.minutes} min</span></li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** What a teacher sees: the last four weeks' totals for one student. */
export function PracticeSummary({ studentId }: { studentId: string }) {
  const weeks = useRows<E.PracticeWeek>(['practice-weekly-4'], E.PRACTICE_WEEKLY, [4]);
  const mine = (weeks.data ?? []).filter(w => w.student_id === studentId);
  if (!mine.length) return <p className="text-[13px] text-ink-3">No practice logged in the last four weeks.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {mine.map(w => <li key={w.week_start} className="flex justify-between"><span>Week of {dateShort(w.week_start)}</span>
        <span className="tnum">{w.minutes} min · {w.sessions}×</span></li>)}
    </ul>
  );
}
