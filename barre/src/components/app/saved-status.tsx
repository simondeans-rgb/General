'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { savedNotes, subscribeSaved } from '@/lib/saved';

/** Where "Saved …" lines appear (U5). Mounted once, beside the undo toasts. */
export function SavedStatus() {
  const list = React.useSyncExternalStore(subscribeSaved, savedNotes, savedNotes);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[79] flex flex-col items-center gap-2 px-4 sm:bottom-6"
         role="status" aria-live="polite">
      {list.map(n => (
        <p key={n.id} className="flex w-full max-w-sm items-center gap-2 rounded-[var(--radius-md)] bg-ink px-4 py-3 text-[0.875rem] text-ink-invert shadow-lg">
          <Check className="size-4 shrink-0" aria-hidden /> <span className="min-w-0 flex-1">{n.text}</span>
        </p>
      ))}
    </div>,
    document.body,
  );
}
