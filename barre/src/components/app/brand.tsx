'use client';

import * as React from 'react';
import { BarreMark } from './database-gate';
import { cssVars, monogram, paletteFor } from '@/lib/brand';
import { cn } from '@/lib/cn';

/** The school's logo, or its monogram on its own colour when it has none. */
export function SchoolMark({ name, logo, className }: { name: string; logo: string | null; className?: string }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt={`${name} logo`} className={cn('shrink-0 rounded-lg object-contain', className)} />
    );
  }
  return (
    <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent', className)}>
      {monogram(name)}
    </span>
  );
}

/** The credit line. Small, quiet, always there. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <span className={cn('mt-0.5 flex items-center gap-1 text-[11px] text-ink-3', className)}>
      powered by <BarreMark className="size-3" aria-hidden /> <span className="font-medium">Barre</span>
    </span>
  );
}

/**
 * Re-colours the whole interface from one brand colour. Every accent in the
 * app reads four CSS variables; this sets them on <html>, and removes them
 * again when there is no school brand to show (Barre's own console).
 */
export function useBrandTheme(colour: string | null | undefined) {
  React.useEffect(() => {
    const root = document.documentElement;
    const vars = cssVars(paletteFor(colour));
    if (!colour) { Object.keys(vars).forEach(k => root.style.removeProperty(k)); return; }
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    const meta = document.querySelector('meta[name="theme-color"]') ?? Object.assign(document.createElement('meta'), { name: 'theme-color' });
    meta.setAttribute('content', vars['--color-accent']!);
    if (!meta.parentNode) document.head.appendChild(meta);
  }, [colour]);
}
