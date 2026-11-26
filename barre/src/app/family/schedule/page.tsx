'use client';

import * as React from 'react';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadIcs } from '@/lib/ics';
import { RehearsalList } from '@/components/app/rehearsals';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { EmptyState, Skeleton, ErrorState } from '@/components/ui';
import { SectionHead, SessionRow, useSessionChanges } from '../_parts/ui';
import * as F from '@/lib/repos/family';
import { time, relativeDay, dateLong, isoDate, dayRange } from '@/lib/format';


export default function FamilySchedule() {
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 28); return d.toISOString(); }, [from]);
  const rows = useRows<F.NextClass>(['family-schedule', from], F.MY_SCHEDULE, [from, to]);

  const byDay = React.useMemo(() => {
    const map = new Map<string, F.NextClass[]>();
    (rows.data ?? []).forEach(s => {
      const k = isoDate(s.starts_at);
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()].sort();
  }, [rows.data]);

  const changes = useSessionChanges((rows.data ?? []).map(r => r.id));
  const several = new Set((rows.data ?? []).map(r => r.student_id)).size > 1;

  return (
    <Shell title="Schedule" subtitle="The next four weeks" allow={['guardian']}
      actions={<CalendarButton />}>
      <div className="mx-auto max-w-2xl space-y-10">
        <RehearsalList />
        {rows.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {byDay.length === 0 && !rows.isLoading && (
          <EmptyState title="Nothing scheduled" body="Classes show here once your child is enrolled." />
        )}
        {byDay.map(([day, list]) => {
          const rel = relativeDay(list[0]!.starts_at);
          const long = dateLong(list[0]!.starts_at);
          return (
            <section key={day} aria-label={long}>
              <SectionHead title={rel === 'Today' || rel === 'Tomorrow' ? rel : long} meta={rel === 'Today' || rel === 'Tomorrow' ? long : undefined} />
              <ul className="divide-y divide-line">
                {list.map(s => {
                  const c = changes.get(s.id);
                  return (
                    <SessionRow key={`${s.id}-${s.student_id}`} time={time(s.starts_at)} name={several ? `${s.child} · ${s.name}` : s.name}
                      href={`/class/?id=${s.class_id}`} cancelled={s.status === 'cancelled'} reason={c?.cancel_reason}
                      moved={!!c && (!!c.original_starts_at || c.room_moved)} style={s.style} colour={s.colour}
                      meta={[several ? null : s.child, c?.covered && s.teacher ? `${s.teacher} (cover)` : s.teacher, s.room]} />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

/** The term's classes as a calendar file, cancellations included (R-036). */
function CalendarButton() {
  const { session } = useSession();
  const go = async () => {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 16 * 7 * 86400_000);
    const rows = await readAs<F.NextClass>(session, F.MY_SCHEDULE, [from.toISOString(), to.toISOString()]);
    const byId = new Map<string, { s: F.NextClass; kids: string[] }>();
    rows.forEach(s => { const e = byId.get(s.id); if (e) e.kids.push(s.child); else byId.set(s.id, { s, kids: [s.child] }); });
    downloadIcs('dance-classes.ics', 'Dance classes', [...byId.values()].map(({ s, kids }) => ({
      id: s.id, title: `${s.name} (${kids.join(' & ')})`, starts_at: s.starts_at, ends_at: s.ends_at,
      location: [s.room, s.location].filter(Boolean).join(', '), cancelled: s.status === 'cancelled',
      description: s.teacher ? `With ${s.teacher}` : null,
    })));
  };
  return <CalendarSubscribe onDownload={go} />;
}
