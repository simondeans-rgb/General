'use client';

import * as React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button, ErrorState } from '@/components/ui';

/**
 * The shell every small editor in the app shares: a sheet on a phone, a dialog
 * on a desktop, scrollable, with one save and one cancel.
 *
 * Written as a shell rather than a form generator on purpose — the fields of a
 * term and the fields of a room have nothing in common, and a spec-driven form
 * would hide that behind a configuration language nobody can read.
 */
export function RecordSheet({
  title, subtitle, onClose, onSave, saving, error, canSave = true,
  saveLabel = 'Save', onRemove, removing, removeLabel = 'Remove', removeHint, children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  error?: unknown;
  canSave?: boolean;
  saveLabel?: string;
  onRemove?: () => void;
  removing?: boolean;
  removeLabel?: string;
  /** Why removal is unavailable. Shown instead of the button. */
  removeHint?: string | null;
  children: React.ReactNode;
}) {
  const titleId = React.useId();

  // Escape closes, and focus starts inside — a sheet that traps neither is a
  // sheet a keyboard user cannot leave.
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([aria-label="Close"])')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center"
         onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain
                   rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg
                   sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[17px] font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p>}
          </div>
          <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-4 space-y-3">{children}</div>

        {error != null && <div className="mt-3"><ErrorState error={error} /></div>}

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" variant="primary" disabled={!canSave}
                  loading={saving} onClick={onSave}>{saveLabel}</Button>
        </div>

        {onRemove && (
          <div className="mt-3 border-t border-line pt-3">
            {removeHint
              ? <p className="text-[12.5px] text-ink-3">{removeHint}</p>
              : <Button variant="danger" className="w-full" loading={removing} onClick={onRemove}>
                  <Trash2 className="size-4" aria-hidden /> {removeLabel}
                </Button>}
          </div>
        )}
      </div>
    </div>
  );
}
