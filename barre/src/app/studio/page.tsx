'use client';

import * as React from 'react';
import { MapPin, CalendarRange, RotateCcw, Database, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { resetDemo } from '@/lib/db/client';
import { Badge, Button, Card, CardHeader, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { dateShort } from '@/lib/format';

const STYLE_TONES: Tone[] = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'];

export default function StudioSettings() {
  const locations = useRows<{ id: string; name: string; address_line1: string; city: string;
                              postcode: string; rooms: number; classes: number }>(['locations'], C.LOCATIONS);
  const terms = useRows<{ id: string; name: string; starts_on: string; ends_on: string;
                          status: string; classes: number }>(['terms'], C.TERMS);
  const styles = useRows<{ id: string; name: string; colour: string }>(['styles'],
    `select id, name, colour from dance_style where deleted_at is null order by sort_order`);
  const levels = useRows<{ id: string; name: string }>(['levels'],
    `select id, name from level where deleted_at is null order by sort_order`);

  return (
    <Shell title="Studio" subtitle="Northstar Dance Academy" allow={['owner', 'admin']}>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card>
          <CardHeader title="Locations" subtitle="Where classes happen" />
          {locations.isLoading && <div className="p-4"><Skeleton className="h-16" /></div>}
          {locations.error && <div className="p-4"><ErrorState error={locations.error} /></div>}
          <ul className="divide-y divide-line">
            {locations.data?.map(l => (
              <li key={l.id} className="flex items-start gap-3 px-4 py-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-[13px] text-ink-2">
                    {[l.address_line1, l.city, l.postcode].filter(Boolean).join(', ')}
                  </p>
                </div>
                <span className="shrink-0 text-[12.5px] text-ink-3">
                  {l.rooms} room{l.rooms === 1 ? '' : 's'} · {l.classes} classes
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Terms" subtitle="Class sessions are generated from these dates" />
          <ul className="divide-y divide-line">
            {terms.data?.map(t => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <CalendarRange className="size-4 shrink-0 text-ink-3" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-[13px] text-ink-2">{dateShort(t.starts_on)} – {dateShort(t.ends_on)}</p>
                </div>
                <Badge tone={t.status === 'published' ? 'positive' : 'neutral'}>{t.status}</Badge>
                <span className="shrink-0 text-[12.5px] text-ink-3">{t.classes} classes</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader title="Dance styles" />
            <div className="flex flex-wrap gap-2 p-4">
              {styles.data?.map(s => (
                <Badge key={s.id}
                  tone={STYLE_TONES.includes(s.colour as Tone) ? (s.colour as Tone) : 'neutral'}>
                  {s.name}
                </Badge>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Levels" />
            <div className="flex flex-wrap gap-2 p-4">
              {levels.data?.map(l => <Badge key={l.id}>{l.name}</Badge>)}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="About this demo" />
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink-2">
                Everything here lives in a Postgres database running inside this browser tab, built
                from the same migrations the production app uses. Nothing is sent anywhere.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink-2">
                Row level security is on and forced. Signed in as Marcus, the medical table returns
                no rows at all; signed in as Hannah, you get exactly one family. That is the
                database refusing, not this interface hiding.
              </p>
            </div>
            <ResetDemo />
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function ResetDemo() {
  const [state, setState] = React.useState<'idle' | 'confirm' | 'working'>('idle');
  const run = async () => { setState('working'); await resetDemo(); location.reload(); };

  if (state === 'confirm') {
    return (
      <div className="rounded-[var(--radius-md)] border border-caution/30 bg-caution-soft p-3">
        <p className="text-sm font-medium">Rebuild the demo studio?</p>
        <p className="mt-0.5 text-[13px] text-ink-2">
          Registers you have marked and absences you have reported will be discarded.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setState('idle')}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={run}>Yes, start again</Button>
        </div>
      </div>
    );
  }
  return (
    <Button size="sm" loading={state === 'working'} onClick={() => setState('confirm')}>
      <RotateCcw className="size-4" aria-hidden /> Reset demo data
    </Button>
  );
}
