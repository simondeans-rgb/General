'use client';

import { SwayvoLogo } from './swayvo';
import * as React from 'react';
import { getDb, onBootProgress, type BootPhase, type BootProgress } from '@/lib/db/client';
import { Beats, ErrorState } from '@/components/ui';

/* The stages a first visit goes through, in order, as the database reports
   them (lib/db/client.ts). A return visit only has "starting". */
const STAGES: { phase: BootPhase; label: string }[] = [
  { phase: 'downloading', label: 'Downloading the database engine' },
  { phase: 'starting',    label: 'Starting the database' },
  { phase: 'schema',      label: 'Creating the tables and access rules' },
  { phase: 'seeding',     label: 'Adding the sample school, Northstar Dance Academy' },
];

const mb = (n: number) => (n / 1048576).toFixed(1);

function detail(p: BootProgress): string | null {
  if (p.phase === 'downloading') {
    if (!p.loaded) return null;
    return p.total ? `${mb(p.loaded)} of ${mb(p.total)} MB` : `${mb(p.loaded)} MB`;
  }
  if (p.phase === 'schema' && p.steps) return `${p.step} of ${p.steps}`;
  return null;
}

function timeLeft(s: number | null, phase: BootPhase): string | null {
  if (s == null || phase === 'ready') return null;
  const t = s < 60 ? `${s} second${s === 1 ? '' : 's'}` : `${Math.round(s / 60)} minute${Math.round(s / 60) === 1 ? '' : 's'}`;
  return phase === 'downloading' ? `About ${t} left to download` : `About ${t} left`;
}

export function DatabaseGate({ children }: { children: React.ReactNode }) {
  const [p, setP] = React.useState<BootProgress | null>(null);
  const [state, setState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    let live = true;
    const off = onBootProgress(x => { if (live) setP(x); });
    getDb()
      .then(() => { if (live) setState('ready'); })
      .catch(err => { if (live) { setError(err); setState('error'); } });
    return () => { live = false; off(); };
  }, []);

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-lg p-6">
        <SwayvoLogo className="mb-6 h-7" />
        <ErrorState error={error} onRetry={() => location.reload()} />
        <p className="mt-4 text-[0.875rem] text-ink-2">
          Swayvo runs Postgres inside your browser for this demo. If it cannot start,
          it is usually private browsing or a browser that blocks storage.
        </p>
      </div>
    );
  }

  if (state === 'loading') {
    const phase = p?.phase ?? 'starting';
    const first = !!p?.building;
    const known = !!p;     // before the loader has reported (the prerendered page), say only what is true of both visits
    const stages = first ? STAGES : STAGES.filter(x => x.phase === 'starting');
    const at = Math.max(0, stages.findIndex(x => x.phase === phase));
    // Each stage fills its share of the beats; within a stage, by bytes or steps where known.
    const within = phase === 'downloading' && p?.total ? p.loaded / p.total
      : phase === 'schema' && p?.steps ? p.step / p.steps : 0;
    const value = ((at + within) / stages.length) * 8;
    const left = timeLeft(p?.secondsLeft ?? null, phase);
    const now = detail(p ?? { phase, building: first, loaded: 0, total: 0, step: 0, steps: 0, secondsLeft: null });
    return (
      <main id="main" className="grid min-h-dvh place-items-center bg-surface p-6">
        <div className="w-full max-w-xs">
          <SwayvoLogo className="h-8" />
          <div className="mt-8" role="status" aria-live="polite">
            <Beats value={value} max={8} size="lg" label={first ? `Step ${at + 1} of ${stages.length}` : 'Opening'} className="on-count" />
            {first ? (
              <ol className="mt-4 space-y-1.5 text-[0.875rem]">
                {stages.map((x, i) => (
                  <li key={x.phase} className={i === at ? 'font-semibold text-ink' : i < at ? 'text-ink-3' : 'text-ink-3/70'}
                      aria-current={i === at ? 'step' : undefined}>
                    {x.label}{i === at ? '…' : ''}
                    {i === at && now && <span className="ml-1 font-normal tabular-nums text-ink-2">{now}</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-[0.9375rem] font-semibold text-ink">
                {known ? 'Opening the demo saved in this browser…' : 'Starting the database…'}
              </p>
            )}
            {left && <p className="mt-3 text-[0.8125rem] tabular-nums text-ink-2">{left}</p>}
          </div>
          <p className="mt-4 text-[0.8125rem] text-ink-3">
            {first || !known
              ? 'This demo runs a real Postgres database in your browser. It is set up once and kept here, so coming back is much quicker.'
              : 'Kept in this browser from your last visit, with whatever you changed.'}
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
