'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Master–detail. On a wide screen the detail sits beside the list; on a phone
 * it slides up as a sheet.
 *
 * Selection lives in the URL query string rather than a route segment. That
 * keeps every page statically renderable, makes a selection shareable and
 * survivable across reload, and behaves identically once this moves to a
 * server — a dynamic `[id]` route would have to be pre-generated per record.
 */
export function DetailPanel({
  open, onClose, title, subtitle, children, actions,
}: {
  open: boolean; onClose: () => void;
  title: React.ReactNode; subtitle?: React.ReactNode;
  children: React.ReactNode; actions?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Phone: a sheet over the list. */}
      <div className="fixed inset-0 z-40 bg-ink/25 lg:hidden" onClick={onClose} aria-hidden />
      <aside
        role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Details'}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)]',
          'border-t border-line bg-surface shadow-lg pb-safe',
          'lg:static lg:z-auto lg:max-h-none lg:rounded-[var(--radius-lg)] lg:border lg:shadow-none',
        )}
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-tight">{title}</h2>
            {subtitle && <div className="truncate text-[13px] text-ink-2">{subtitle}</div>}
          </div>
          {actions}
          <button onClick={onClose} aria-label="Close details"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </aside>
    </>
  );
}

export function DetailSection({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function KeyValue({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="space-y-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-3 text-sm">
          <dt className="w-28 shrink-0 text-ink-3">{k}</dt>
          <dd className="min-w-0 flex-1 break-words">{v ?? <span className="text-ink-3">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
