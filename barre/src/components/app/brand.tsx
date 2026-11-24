'use client';

import * as React from 'react';
import { BarreMark } from './database-gate';
import { cssVars, monogram, paletteFor } from '@/lib/brand';
import { schoolColours } from '@/lib/theme';
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
 * Applies a school's theme and colours to the whole interface: the theme as
 * <html data-theme>, the colours as CSS variables fitted to that theme's
 * surface. With no school (Barre's own console) both are removed.
 */
export function useSchoolTheme(school: { theme?: string | null; brand_colour?: string | null; brand_secondary?: string | null } | null) {
  const theme = school?.theme ?? null, accent = school?.brand_colour ?? null, secondary = school?.brand_secondary ?? null;
  const on = !!school;
  React.useEffect(() => {
    const root = document.documentElement;
    const keys = [...Object.keys(cssVars(paletteFor(null))), '--color-secondary'];
    if (!on) { keys.forEach(k => root.style.removeProperty(k)); delete root.dataset.theme; return; }
    const c = schoolColours(theme, accent, secondary);
    root.dataset.theme = c.theme.id;
    Object.entries(cssVars(paletteFor(c.accent, c.theme.surface))).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--color-secondary', c.secondary);
    const meta = document.querySelector('meta[name="theme-color"]') ?? Object.assign(document.createElement('meta'), { name: 'theme-color' });
    meta.setAttribute('content', c.theme.dark ? c.theme.canvas : c.theme.surface);
    if (!meta.parentNode) document.head.appendChild(meta);
  }, [on, theme, accent, secondary]);
}

/** Kept for callers that only know a colour. */
export function useBrandTheme(colour: string | null | undefined) {
  useSchoolTheme(colour ? { brand_colour: colour } : null);
}
