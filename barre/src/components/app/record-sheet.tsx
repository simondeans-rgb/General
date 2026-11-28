'use client';

import * as React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button, ErrorState } from '@/components/ui';
import { SaveErrorSummary, useFirstErrorInView } from '@/components/app/form-error';
import { PlanLimitNotice, isPlanLimit } from '@/components/app/plan-limit';

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
  saveLabel = 'Save', onRemove, removing, removeLabel = 'Remove', removeHint, saveHint, children,
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
  /** Why Save is unavailable, shown beside it while canSave is false. */
  saveHint?: string | null;
  children: React.ReactNode;
}) {
  const titleId = React.useId();

  // Escape closes, and focus starts inside — a sheet that traps neither is a
  // sheet a keyboard user cannot leave.
  const ref = React.useRef<HTMLDivElement>(null);
  // Callers pass onClose inline, so it is a new function on every render of
  // the screen behind. Keyed on it, this effect re-ran whenever that screen
  // refreshed — and yanked focus (and, on a phone, the scroll position and
  // keyboard) back to the first field mid-edit. Focus once, on open.
  const close = React.useRef(onClose);
  close.current = onClose;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([aria-label="Close"])')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // A failed save scrolls its error into view and says so beside the button (UR-40).
  const body = React.useRef<HTMLDivElement>(null);
  useFirstErrorInView(body, error);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6"
         onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden
                   rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg
                   sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[1.0625rem] font-semibold leading-tight tracking-[-0.01em]">{title}</h2>
            {subtitle && <p className="mt-1 text-[0.8438rem] text-ink-3">{subtitle}</p>}
          </div>
          <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1">
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div ref={body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="space-y-4">{children}</div>
          {error != null && <div className="mt-4">{isPlanLimit(error) ? <PlanLimitNotice error={error} /> : <ErrorState error={error} />}</div>}
          {onRemove && (
            <div className="mt-6 border-t border-line pt-4">
              {removeHint
                ? <p className="text-[0.8125rem] text-ink-3">{removeHint}</p>
                : <Button variant="danger" size="sm" loading={removing} onClick={onRemove}>
                    <Trash2 className="size-4" aria-hidden /> {removeLabel}
                  </Button>}
            </div>
          )}
        </div>

        {/* One footer everywhere: cancel, then the one primary action on the right. */}
        <div className="flex flex-wrap gap-2 border-t border-line bg-surface px-5 py-3 pb-safe sm:flex-nowrap sm:justify-end">
          <SaveErrorSummary error={error ?? undefined} reason={!canSave ? saveHint : null} />
          {/* A sheet that only reports something has nothing to cancel. */}
          {onSave !== onClose && <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onClose}>Cancel</Button>}
          <Button className="flex-[2] sm:flex-none" variant="primary" disabled={!canSave}
                  loading={saving} onClick={onSave}>{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}
