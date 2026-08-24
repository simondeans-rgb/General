'use client';

import * as React from 'react';
import { CalendarX2, MapPin, User } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { time, relativeDay, dateLong, isoDate, dayRange } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONES: Record<string, Tone> = {
  violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

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
    <Shell title="Timetable" subtitle="Your classes and anything you're down for" allow={['student']}>
      <div className="mx-auto max-w-lg space-y-4">
        {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-14" />)}</Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {byDay.length === 0 && !rows.isLoading && (
          <Card><EmptyState icon={<CalendarX2 className="size-5" />} title="Nothing scheduled"
            body="Your classes will show here once you're enrolled." /></Card>
        )}
        {byDay.map(([day, list]) => (
          <Card key={day}>
            <div className="flex items-baseline gap-2 border-b border-line px-4 py-2.5">
              <h2 className="font-semibold">{relativeDay(list[0].starts_at)}</h2>
              <span className="text-[13px] text-ink-3">{dateLong(list[0].starts_at)}</span>
            </div>
            <ul className="divide-y divide-line">
              {list.map((s, i) => {
                const cancelled = s.status === 'cancelled';
                const isEvent = s.entry_kind === 'event';
                return (
                  <li key={`${s.id}-${i}`} className={cn('flex items-start gap-3 px-4 py-3', cancelled && 'opacity-60')}>
                    <span className={cn('tnum w-14 shrink-0 font-semibold', cancelled && 'line-through')}>
                      {time(s.starts_at)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn('font-medium', cancelled && 'line-through')}>{s.name}</span>
                        {isEvent
                          ? <Badge tone="indigo">Event</Badge>
                          : s.style && <Badge tone={TONES[s.colour] ?? 'neutral'}>{s.style}</Badge>}
                        {cancelled && <Badge tone="critical">Cancelled</Badge>}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2">
                        {s.teacher && <span className="inline-flex items-center gap-1">
                          <User className="size-3.5" aria-hidden />{s.teacher}</span>}
                        {(s.room || s.location) && <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden />{[s.location, s.room].filter(Boolean).join(' · ')}</span>}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
