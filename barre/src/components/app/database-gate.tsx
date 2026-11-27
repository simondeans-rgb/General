'use client';

import { SwayvoLogo } from './swayvo';
import * as React from 'react';
import { getDb, onBootPhase, type BootPhase } from '@/lib/db/client';
import { Beats, ErrorState } from '@/components/ui';

const COPY: Record<BootPhase, string> = {
  starting: 'Starting the database',
  schema:   'Creating the schema',
  seeding:  'Setting up Northstar Dance Academy',
  ready:    'Ready',
};

/**
 * The demo carries its own Postgres, compiled to WebAssembly and stored in the
 * browser. First load has to fetch and start it, so say so plainly instead of
 * showing an empty screen for three seconds.
 */
export function DatabaseGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = React.useState<BootPhase>('starting');
  const [state, setState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    let live = true;
    onBootPhase(p => { if (live) setPhase(p); });
    getDb()
      .then(() => { if (live) setState('ready'); })
      .catch(err => { if (live) { setError(err); setState('error'); } });
    return () => { live = false; };
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
    const step = (['starting', 'schema', 'seeding', 'ready'] as BootPhase[]).indexOf(phase) + 1;
    return (
      <main id="main" className="grid min-h-dvh place-items-center bg-surface p-6">
        <div className="w-full max-w-xs">
          <SwayvoLogo className="h-8" />
          <div className="mt-8" role="status" aria-live="polite">
            <Beats value={step * 2} max={8} size="lg" label={`Step ${step} of 4`} className="on-count" />
            <p className="mt-3 text-[0.9375rem] font-semibold text-ink">{COPY[phase]}…</p>
          </div>
          <p className="mt-2 text-[0.8125rem] text-ink-3">
            Setting up a real Postgres database in your browser. Only the first load is slow.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
