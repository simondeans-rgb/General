'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarCheck2, ChevronRight, CheckCircle2, MapPin, Users } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { time, greeting, dateLong, dayRange, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONES: Record<string, Tone> = { violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

export default function TeachToday() {
  const { session } = useSession();
  const [from] = React.useMemo(() => dayRange(0), []);
  // Today, plus the next six days, so a teacher can see what is coming.
  const to = React.useMemo(() => {
    const d = new Date(from); d.setDate(d.getDate() + 7); return d.toISOString();
  }, [from]);
  const sessions = useRows<T.TeachSession>(['my-sessions', from], T.MY_SESSIONS, [from, to]);

  const today = (sessions.data ?? []).filter(s =>
    new Date(s.starts_at).toDateString() === new Date().toDateString());
  const later = (sessions.data ?? []).filter(s =>
    new Date(s.starts_at).toDateString() !== new Date().toDateString());

  return (
    <Shell title={`${greeting()}, ${session?.name.split(' ')[0] ?? ''}`}
           subtitle={dateLong(new Date())} allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-2xl space-y-5">
        {sessions.isLoading && <Card className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-20" />)}</Card>}
        {sessions.error && <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />}

        {sessions.data && (
          <>
            <Card>
              <CardHeader title="Today"
                subtitle={today.length ? `${today.length} class${today.length === 1 ? '' : 'es'}` : undefined} />
              {today.length === 0
                ? <EmptyState icon={<CalendarCheck2 className="size-5" />} title="No classes today"
                    body="Your next class is further down." />
                : <ul className="divide-y divide-line">
                    {today.map(s => <li key={s.id}><TeachRow s={s} /></li>)}
                  </ul>}
            </Card>

            {later.length > 0 && (
              <Card>
                <CardHeader title="Coming up" />
                <ul className="divide-y divide-line">
                  {later.map(s => <li key={s.id}><TeachRow s={s} showDay /></li>)}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}

function TeachRow({ s, showDay }: { s: T.TeachSession; showDay?: boolean }) {
  const cancelled = s.status === 'cancelled';
  const expected = s.enrolled + s.trials;
  const done = s.marked >= expected && expected > 0;
  const started = new Date(s.starts_at) <= new Date();

  const inner = (
    <div className={cn('flex items-center gap-3 px-4 py-3.5', cancelled && 'opacity-60')}>
      <span aria-hidden className={cn('w-1 self-stretch rounded-full',
        { violet:'bg-violet', amber:'bg-amber', teal:'bg-teal', rose:'bg-rose', indigo:'bg-indigo', lime:'bg-lime' }[s.colour ?? ''] ?? 'bg-surface-3')} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tnum font-semibold">{showDay ? `${relativeDay(s.starts_at)} ` : ''}{time(s.starts_at)}</span>
          <span className="font-medium">{s.name}</span>
          {cancelled && <Badge tone="critical">Cancelled</Badge>}
          {!cancelled && done && <Badge tone="positive" icon={<CheckCircle2 className="size-3" />}>Register done</Badge>}
          {!cancelled && !done && started && <Badge tone="caution">Register due</Badge>}
          {!cancelled && s.trials > 0 && <Badge tone="info">{s.trials} trial{s.trials === 1 ? '' : 's'}</Badge>}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2">
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden />{expected} expected</span>
          {s.room && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{s.room}</span>}
        </span>
      </span>
      {!cancelled && <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />}
    </div>
  );

  if (cancelled) return inner;
  return <Link href={`/teach/register/?session=${s.id}`} className="block hover:bg-surface-2">{inner}</Link>;
}
