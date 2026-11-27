'use client';

import * as React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui';
import { SwayvoLogo } from '@/components/app/swayvo';

/**
 * If a screen fails, this replaces it — not the whole app — and says what
 * happened in words someone can pass on. Nothing typed elsewhere is lost.
 */
export default function ScreenError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  React.useEffect(() => { console.error(error); }, [error]);
  const home = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`;
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-surface p-5">
      <div className="w-full max-w-md" role="alert">
        <SwayvoLogo className="mb-8 h-7" />
        <p className="font-display text-[1.375rem] uppercase leading-none tracking-[-0.01em] text-critical [font-stretch:80%]">Stopped</p>
        <h1 className="mt-1.5 font-display text-[1.5rem] font-[800] leading-tight [font-stretch:112%]">This screen hit a problem</h1>
        <p className="mt-2 text-[0.9375rem] text-ink-2">
          Nothing has been lost. Try again, or go back to your home screen. If it keeps happening, the
          message below tells us exactly what went wrong.
        </p>
        <pre className="mt-4 max-h-32 overflow-auto whitespace-pre-wrap border-l-2 border-line-strong py-1 pl-3 text-[0.7812rem] text-ink-2">
          {error.message || 'Unknown error'}{error.digest ? ` (${error.digest})` : ''}
        </pre>
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" variant="primary" onClick={() => retry()}>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </Button>
          <Button className="flex-1" onClick={() => { window.location.href = home; }}>
            <Home className="size-4" aria-hidden /> Home
          </Button>
        </div>
      </div>
    </main>
  );
}
