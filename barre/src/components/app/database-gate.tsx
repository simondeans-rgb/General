'use client';

import { SwayvoLogo } from './swayvo';
import * as React from 'react';
import { getDb, onBootPhase, type BootPhase } from '@/lib/db/client';
import { ErrorState, Spinner } from '@/components/ui';

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
        <ErrorState error={error} onRetry={() => location.reload()} />
        <p className="mt-4 text-sm text-ink-2">
          Swayvo runs Postgres inside your browser for this demo. If it cannot start,
          it is usually private browsing or a browser that blocks storage.
        </p>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="w-full max-w-xs text-center">
          <SwayvoLogo className="mx-auto mb-4 h-9" />
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-2">
            <Spinner className="size-3.5" /> {COPY[phase]}…
          </p>
          <p className="mt-4 text-[12.5px] text-ink-3">
            Setting up a real Postgres database in your browser. Only the first load is slow.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
