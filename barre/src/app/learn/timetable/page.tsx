'use client';

import * as React from 'react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { EmptyState, Skeleton, ErrorState } from '@/components/ui';
import { SectionHead, SessionRow } from '@/app/family/_parts/ui';
import * as H from '@/lib/repos/hub';
import { time, relativeDay, dateLong, isoDate, dayRange } from '@/lib/format';


export default function StudentTimetable() {
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 28); return d.toISOString(); }, [from]);
  const rows = useRows<any>(['student-timetable', from], H.MY_TIMETABLE, [from, to]);

  const byDay = React.useMemo(() => {
    const map = new Map<string, any[]>();
    (rows.data ?? []).forEach(s => {
      const k = isoDate(s.starts_at);
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()].sort();
  }, [rows.data]);

  return (
    <Shell title="Timetable" subtitle="Your classes and anything you’re down for" allow={['student']}>
      <div className="mx-auto max-w-2xl space-y-10">
        {rows.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {byDay.length === 0 && !rows.isLoading && (
          <EmptyState title="Nothing scheduled" body="Your classes show here once you’re enrolled." />
        )}
        {byDay.map(([day, list]) => {
          const rel = relativeDay(list[0].starts_at);
          const long = dateLong(list[0].starts_at);
          return (
            <section key={day} aria-label={long}>
              <SectionHead title={rel === 'Today' || rel === 'Tomorrow' ? rel : long} meta={rel === 'Today' || rel === 'Tomorrow' ? long : undefined} />
              <ul className="divide-y divide-line">
                {list.map((s, i) => (
                  // A class row opens the class, where its videos, music and
                  // handouts live. An event has no class behind it.
                  <SessionRow key={`${s.id}-${i}`} time={time(s.starts_at)} name={s.name}
                    href={s.class_id ? `/class/?id=${s.class_id}` : undefined}
                    cancelled={s.status === 'cancelled'}
                    style={s.entry_kind === 'event' ? null : s.style} colour={s.colour}
                    meta={[s.entry_kind === 'event' ? 'Event' : null, s.teacher, [s.location, s.room].filter(Boolean).join(' · ')]} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
