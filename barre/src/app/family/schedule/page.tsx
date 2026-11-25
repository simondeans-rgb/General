'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarX2, ChevronRight, MapPin, User } from 'lucide-react';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadIcs } from '@/lib/ics';
import { RehearsalList } from '@/components/app/rehearsals';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Button, Card, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as F from '@/lib/repos/family';
import { time, relativeDay, dateLong, isoDate, dayRange } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONES: Record<string, Tone> = { violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

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

  return (
    <Shell title="Schedule" subtitle="The next four weeks" allow={['guardian']}
      actions={<CalendarButton />}>
      <div className="mx-auto max-w-lg space-y-4">
        <RehearsalList />
        {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-14" />)}</Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {byDay.length === 0 && !rows.isLoading && (
          <Card><EmptyState icon={<CalendarX2 className="size-5" />} title="Nothing scheduled"
            body="Classes appear here once your child is enrolled." /></Card>
        )}
        {byDay.map(([day, list]) => (
          <Card key={day}>
            <div className="flex items-baseline gap-2 border-b border-line px-4 py-2.5">
              <h2 className="font-semibold">{relativeDay(list[0]!.starts_at)}</h2>
              <span className="text-[13px] text-ink-3">{dateLong(list[0]!.starts_at)}</span>
            </div>
            <ul className="divide-y divide-line">
              {list.map(s => {
                const cancelled = s.status === 'cancelled';
                return (
                  <li key={`${s.id}-${s.student_id}`} className={cn(cancelled && 'opacity-60')}>
                    <Link href={`/class/?id=${s.class_id}`} aria-label={`${s.name}, open class`}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2">
                      <span className={cn('tnum w-14 shrink-0 font-semibold', cancelled && 'line-through')}>
                        {time(s.starts_at)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={cn('font-medium', cancelled && 'line-through')}>{s.name}</span>
                          {s.style && <Badge tone={TONES[s.colour ?? ''] ?? 'neutral'}>{s.style}</Badge>}
                          {cancelled && <Badge tone="critical">Cancelled</Badge>}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2">
                          <span>{s.child}</span>
                          {s.teacher && <span className="inline-flex items-center gap-1"><User className="size-3.5" aria-hidden />{s.teacher}</span>}
                          {s.room && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{s.room}</span>}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 self-center text-ink-3" aria-hidden />
                    </Link>
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
