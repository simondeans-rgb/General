'use client';

import * as React from 'react';
import { SwayvoLogo } from './swayvo';
import { cssVars, monogram, paletteFor } from '@/lib/brand';
import { schoolColours } from '@/lib/theme';
import { THEME_COLOR } from '@/lib/swayvo-logo';
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
    <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-lg bg-accent text-[0.8125rem] font-semibold text-on-accent', className)}>
      {monogram(name)}
    </span>
  );
}

/** The credit line. Small, quiet, always there. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <span className={cn('mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-3', className)}>
      powered by
      {/* Always Swayvo’s own logo: ink on light styles, white on dark. */}
      <SwayvoLogo className="swayvo-on-light h-[0.95em] translate-y-[0.06em]" tone="ink" title="Swayvo" />
      <SwayvoLogo className="swayvo-on-dark h-[0.95em] translate-y-[0.06em]" tone="white" title={null} />
    </span>
  );
}

/**
 * Applies a school's theme and colours to the whole interface: the theme as
 * <html data-theme>, the colours as CSS variables fitted to that theme's
 * surface. With no school (Swayvo's own console) both are removed.
 */
export function useSchoolTheme(school: { theme?: string | null; brand_colour?: string | null; brand_secondary?: string | null } | null) {
  const theme = school?.theme ?? null, accent = school?.brand_colour ?? null, secondary = school?.brand_secondary ?? null;
  const on = !!school;
  React.useEffect(() => {
    const root = document.documentElement;
    const keys = [...Object.keys(cssVars(paletteFor(null))), '--color-secondary'];
    if (!on) {
      keys.forEach(k => root.style.removeProperty(k)); delete root.dataset.theme;
      // Swayvo's own pages: back to the one browser-chrome colour.
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR);
      return;
    }
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

/** The light logo suits the dark Urban style; otherwise the usual one (R-060). */
export const logoFor = (s: { theme?: string | null; logo_url: string | null; logo_light_url?: string | null }) =>
  s.theme === 'urban' && s.logo_light_url ? s.logo_light_url : s.logo_url;

/** The school's own photograph across the top of a home screen (R-060). */
export function SchoolHero({ src, name, children }: { src: string | null | undefined; name: string; children?: React.ReactNode }) {
  if (!src) return null;
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${name}`} className="aspect-[16/7] w-full object-cover" />
      {children && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">{children}</div>}
    </div>
  );
}
