'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Undo2 } from 'lucide-react';

/**
 * Undo for removals (R-043). A removal is held for ten seconds: the item
 * disappears at once, a toast offers Undo, and only when the time is up is the
 * change actually written. Undo simply cancels it — nothing to restore, and
 * nothing written that has to be taken back. Closing the page inside the
 * window keeps the item, which is the safe way round.
 */
type Pending = { id: string; label: string; commit: () => Promise<unknown>; timer: ReturnType<typeof setTimeout>; error?: string };

const WINDOW_MS = 10_000;
let pending: Pending[] = [];
const subs = new Set<() => void>();
const emit = () => { pending = [...pending]; subs.forEach(f => f()); };

export function removeWithUndo(id: string, label: string, commit: () => Promise<unknown>) {
  const timer = setTimeout(async () => {
    try { await commit(); pending = pending.filter(p => p.id !== id); }
    catch (e) { const p = pending.find(x => x.id === id); if (p) p.error = e instanceof Error ? e.message : 'That could not be removed.'; }
    emit();
  }, WINDOW_MS);
  pending = [...pending.filter(p => p.id !== id), { id, label, commit, timer }];
  emit();
}

function undo(id: string) {
  const p = pending.find(x => x.id === id);
  if (p) clearTimeout(p.timer);
  pending = pending.filter(x => x.id !== id);
  emit();
}

function usePending() {
  return React.useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => pending, () => pending);
}

/** True while an item's removal is waiting out its undo window: hide it. */
export function useRemoving(): (id: string) => boolean {
  const list = usePending();
  return React.useCallback((id: string) => list.some(p => p.id === id && !p.error), [list]);
}

export function UndoToaster() {
  const list = usePending();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || list.length === 0) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
      {list.map(p => (
        <div key={p.id} role="status" className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[var(--radius-md)] bg-ink px-4 py-3 text-[14px] text-ink-invert shadow-lg">
          <span className="min-w-0 flex-1">{p.error ? `Could not remove: ${p.error}` : `${p.label} removed`}</span>
          <button onClick={() => undo(p.id)} className="inline-flex min-h-[40px] items-center gap-1.5 font-semibold underline-offset-2 hover:underline">
            <Undo2 className="size-4" aria-hidden /> {p.error ? 'Dismiss' : 'Undo'}
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
