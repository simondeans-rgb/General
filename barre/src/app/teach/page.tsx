'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarCheck2, ChevronRight, CheckCircle2, MapPin, Users, UserRoundX } from 'lucide-react';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { downloadIcs } from '@/lib/ics';
import { RehearsalList } from '@/components/app/rehearsals';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Skeleton, ErrorState, type Tone } from '@/components/ui';
import { RecordSheet } from '@/components/app/record-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs, readAs } from '@/lib/db/client';
import * as T from '@/lib/repos/teaching';
import { time, greeting, dateLong, dayRange, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONES: Record<string, Tone> = { violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

export default function TeachToday() {
  const { session } = useSession();
  const [from] = React.useMemo(() => dayRange(0), []);
  // Today, plus the next fortnight, so a teacher can see their week ahead.
  const to = React.useMemo(() => {
    const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString();
  }, [from]);
  const [asking, setAsking] = React.useState<T.TeachSession | null>(null);
  const sessions = useRows<T.TeachSession>(['my-sessions', from], T.MY_SESSIONS, [from, to]);

  const today = (sessions.data ?? []).filter(s =>
    new Date(s.starts_at).toDateString() === new Date().toDateString());
  const later = (sessions.data ?? []).filter(s =>
    new Date(s.starts_at).toDateString() !== new Date().toDateString());

  return (
    <Shell title={`${greeting()}, ${session?.name.split(' ')[0] ?? ''}`}
           subtitle={dateLong(new Date())} allow={['owner','admin','teacher']}
           actions={<CalendarSubscribe onDownload={() => downloadTeaching(session)} />}>
      <div className="mx-auto max-w-2xl space-y-5">
        <RehearsalList days={21} />
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
                    {today.map(s => <li key={s.id}><TeachRow s={s} onAskCover={() => setAsking(s)} /></li>)}
                  </ul>}
            </Card>

            {later.length > 0 && (
              <Card>
                <CardHeader title="Your next two weeks" subtitle="Ask the office for cover from any class here" />
                <ul className="divide-y divide-line">
                  {later.map(s => <li key={s.id}><TeachRow s={s} showDay onAskCover={() => setAsking(s)} /></li>)}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
      {asking && <CoverRequestSheet s={asking} onClose={() => setAsking(null)} />}
    </Shell>
  );
}

function CoverRequestSheet({ s, onClose }: { s: T.TeachSession; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [reason, setReason] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const ask = useMutation({
    mutationFn: () => runAs(session, q => q(T.REQUEST_COVER, [s.id, reason.trim()])),
    onSuccess: () => { setSent(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (sent) return <RecordSheet title="Asked" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">The office has your request and will let you know who is covering.</p></RecordSheet>;
  return (
    <RecordSheet title="Ask for cover" subtitle={`${s.name} · ${dateLong(s.starts_at)} at ${time(s.starts_at)}`}
      onClose={onClose} onSave={() => ask.mutate()} saving={ask.isPending} error={ask.error} canSave={reason.trim().length >= 3} saveLabel="Send to the office">
      <Field label="Why" htmlFor="cr-r" required hint="Only the office sees this.">
        <Input id="cr-r" value={reason} onChange={e => setReason(e.target.value)} placeholder="Hospital appointment" />
      </Field>
    </RecordSheet>
  );
}

function TeachRow({ s, showDay, onAskCover }: { s: T.TeachSession; showDay?: boolean; onAskCover?: () => void }) {
  const cancelled = s.status === 'cancelled';
  const coveredByOther = !!s.covered_by;
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
          {cancelled && <Badge tone="critical">Cancelled{s.cancel_reason ? ` · ${s.cancel_reason}` : ''}</Badge>}
          {s.covering && <Badge tone="info">You are covering</Badge>}
          {coveredByOther && <Badge tone="neutral">Covered by {s.covered_by}</Badge>}
          {s.cover_requested && !coveredByOther && <Badge tone="caution">Cover requested</Badge>}
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

  if (cancelled || coveredByOther) return inner;
  return (
    <div className="flex items-center">
      <Link href={`/teach/register/?session=${s.id}`} className="block min-w-0 flex-1 hover:bg-surface-2">{inner}</Link>
      {onAskCover && !started && !s.covering && !s.cover_requested && (
        <Button size="sm" variant="ghost" className="mr-2 shrink-0" onClick={onAskCover} aria-label={`Ask for cover for ${s.name}`}>
          <UserRoundX className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}

/** A teacher's classes for the coming term as a calendar file (R-036). */
async function downloadTeaching(session: ReturnType<typeof useSession>['session']) {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + 16 * 7 * 86400_000);
  const rows = await readAs<T.TeachSession>(session, T.MY_SESSIONS, [from.toISOString(), to.toISOString()]);
  downloadIcs('my-teaching.ics', 'Teaching', rows.filter(s => !s.covered_by).map(s => ({
    id: s.id, title: s.covering ? `${s.name} (cover)` : s.name, starts_at: s.starts_at, ends_at: s.ends_at,
    location: s.room ?? null, cancelled: s.status === 'cancelled',
  })));
}
