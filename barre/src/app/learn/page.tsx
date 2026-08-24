'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays, PlayCircle, Trophy, MessageSquare, ChevronRight, Sparkles, MapPin, User,
} from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { time, greeting, relativeDay, dateLong, dayRange, money } from '@/lib/format';

const KIND_TONE: Record<string, Tone> = {
  competition: 'amber', show: 'violet', exam: 'critical',
  workshop: 'teal', private_lesson: 'indigo', rehearsal: 'neutral', social: 'lime',
};
const KIND_LABEL: Record<string, string> = {
  competition: 'Competition', show: 'Show', exam: 'Exam', workshop: 'Workshop',
  private_lesson: 'Private lesson', rehearsal: 'Rehearsal', social: 'Social',
};

export default function LearnHome() {
  const { session } = useSession();
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString(); }, [from]);

  const timetable = useRows<any>(['learn-timetable', from], H.MY_TIMETABLE, [from, to]);
  const feedback = useRows<H.Feedback>(['learn-feedback'], H.STUDENT_FEEDBACK);
  const events = useRows<H.EventRow>(['learn-events'], H.EVENTS);
  const resources = useRows<H.Resource>(['learn-resources'], H.RESOURCES);

  const upcoming = (timetable.data ?? []).filter(s => s.status !== 'cancelled');
  const next = upcoming[0];
  const latest = feedback.data?.[0];
  const myEvents = (events.data ?? []).filter(e => e.my_status === 'confirmed' || e.kind === 'private_lesson');

  return (
    <Shell title={`${greeting()}, ${session?.name.split(' ')[0] ?? ''}`}
           subtitle={dateLong(new Date())} allow={['student']}>
      <div className="mx-auto max-w-lg space-y-4">
        {timetable.isLoading && <Card className="p-4"><Skeleton className="h-24" /></Card>}
        {timetable.error && <ErrorState error={timetable.error} onRetry={() => timetable.refetch()} />}

        {next && (
          <Card className="overflow-hidden">
            <div className="bg-accent px-4 py-3 text-white">
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/75">
                {relativeDay(next.starts_at) === 'Today' ? 'Next up today' : 'Next'}
              </p>
              <p className="mt-0.5 text-[19px] font-semibold tracking-tight">{next.name}</p>
              <p className="mt-0.5 text-white/85">{relativeDay(next.starts_at)} at {time(next.starts_at)}</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 p-4 text-sm text-ink-2">
              {next.teacher && <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" aria-hidden />{next.teacher}</span>}
              {(next.room || next.location) && <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />{[next.location, next.room].filter(Boolean).join(' · ')}</span>}
            </div>
          </Card>
        )}
        {!next && !timetable.isLoading && (
          <Card><EmptyState icon={<CalendarDays className="size-5" />} title="Nothing coming up"
            body="Your classes will show here once the next term is published." /></Card>
        )}

        {latest && (
          <Card>
            <CardHeader title="Latest feedback"
              action={<Link href="/learn/feedback" className="text-[13px] font-medium text-accent hover:underline">All</Link>} />
            <div className="p-4">
              <p className="flex items-center gap-1.5 font-medium">
                <Sparkles className="size-4 text-accent" aria-hidden />{latest.headline}
              </p>
              {latest.going_well && <p className="mt-1.5 text-sm text-ink-2">{latest.going_well}</p>}
              {latest.work_on && (
                <p className="mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm">
                  <span className="font-medium">To work on: </span>{latest.work_on}
                </p>
              )}
              <p className="mt-2 text-[12px] text-ink-3">
                {latest.author}{latest.class_name ? ` · ${latest.class_name}` : ''} · {relativeDay(latest.shared_at!)}
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TileLink href="/learn/library" icon={<PlayCircle className="size-5" />}
            label="Videos and tracks" count={resources.data?.length} />
          <TileLink href="/learn/events" icon={<Trophy className="size-5" />}
            label="Competitions and events" count={events.data?.length} />
        </div>

        {myEvents.length > 0 && (
          <Card>
            <CardHeader title="You're down for" />
            <ul className="divide-y divide-line">
              {myEvents.slice(0, 4).map(e => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{e.title}</span>
                      <Badge tone={KIND_TONE[e.kind] ?? 'neutral'}>{KIND_LABEL[e.kind] ?? e.kind}</Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink-2">
                      {relativeDay(e.starts_at)} · {time(e.starts_at)}{e.venue ? ` · ${e.venue}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Shell>
  );
}

function TileLink({ href, icon, label, count }: {
  href: string; icon: React.ReactNode; label: string; count?: number;
}) {
  return (
    <Link href={href}
      className="card flex flex-col gap-2 p-4 transition-colors hover:bg-surface-2">
      <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent-ink" aria-hidden>{icon}</span>
      <span className="text-sm font-medium leading-tight">{label}</span>
      {count != null && <span className="text-[12.5px] text-ink-3">{count} available</span>}
    </Link>
  );
}
