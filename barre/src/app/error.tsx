'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button, Card } from '@/components/ui';

/**
 * If a screen fails, this replaces it — not the whole app — and says what
 * happened in words someone can pass on. Nothing typed elsewhere is lost.
 */
export default function ScreenError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  React.useEffect(() => { console.error(error); }, [error]);
  const home = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`;
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <Card className="w-full max-w-md p-6" role="alert">
        <span className="mb-3 grid size-10 place-items-center rounded-full bg-critical-soft text-critical" aria-hidden>
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="text-[19px] font-semibold tracking-tight">This screen hit a problem</h1>
        <p className="mt-1 text-sm text-ink-2">
          Nothing has been lost. Try again, or go back to your home screen. If it keeps happening, the
          message below tells us exactly what went wrong.
        </p>
        <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-surface-2 p-3 text-[12px] text-ink-2">
          {error.message || 'Unknown error'}{error.digest ? ` (${error.digest})` : ''}
        </pre>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" variant="primary" onClick={() => retry()}>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </Button>
          <Button className="flex-1" onClick={() => { window.location.href = home; }}>
            <Home className="size-4" aria-hidden /> Home
          </Button>
        </div>
      </Card>
    </main>
  );
}
