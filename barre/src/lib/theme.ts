/**
 * School themes. A theme sets the canvas — surfaces, text, type, corners,
 * shadows — and a starting pair of colours. The school's own colours and logo
 * then go on top (lib/brand.ts), so two schools on the same theme still look
 * like themselves.
 *
 *   classic — Sanaa's own look and the default: eucalyptus, ivory and
 *             terracotta, Fraunces headings, soft corners.
 *   urban   — street, commercial, contemporary: deep violet dark mode, a
 *             bold wide sans, a neon accent with a second colour for glow.
 *
 * Sanaa's own screens (the platform console) keep the neutral base theme.
 */
import { normaliseHex } from './brand';

export type ThemeId = 'classic' | 'urban';

export type Theme = {
  id: ThemeId; name: string; tagline: string;
  /** The surface the accent sits on — palettes are fitted to it. */
  surface: string; canvas: string; ink: string;
  dark: boolean;
  accent: string; secondary: string;
  presets: { name: string; accent: string; secondary: string }[];
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: 'classic', name: 'Classic', tagline: 'Elegant and calm — ivory, serif headings, soft edges',
    surface: '#fffdf8', canvas: '#f6f2ea', ink: '#14211e', dark: false,
    accent: '#0b3b34', secondary: '#c86a4f',
    presets: [
      { name: 'Sanaa', accent: '#0b3b34', secondary: '#c86a4f' },
      { name: 'Terracotta', accent: '#c86a4f', secondary: '#0b3b34' },
      { name: 'Charcoal & blush', accent: '#2b2b2b', secondary: '#d9a89a' },
      { name: 'Midnight', accent: '#1e3a8a', secondary: '#c9a227' },
      { name: 'Plum', accent: '#6b2155', secondary: '#e3a1b9' },
      { name: 'Rose', accent: '#b0304f', secondary: '#f2b5a7' },
    ],
  },
  urban: {
    id: 'urban', name: 'Urban', tagline: 'Bold and electric — dark mode, wide type, neon accents',
    surface: '#18122f', canvas: '#0d0a1c', ink: '#f6f4ff', dark: true,
    accent: '#c6f432', secondary: '#8b5cf6',
    presets: [
      { name: 'Volt & violet', accent: '#c6f432', secondary: '#8b5cf6' },
      { name: 'Cyan & magenta', accent: '#22d3ee', secondary: '#d946ef' },
      { name: 'Hot pink', accent: '#ff3d8b', secondary: '#7c3aed' },
      { name: 'Blaze', accent: '#ff7a1a', secondary: '#e11d48' },
      { name: 'Electric blue', accent: '#3b82f6', secondary: '#22d3ee' },
      { name: 'Gold', accent: '#fbbf24', secondary: '#f97316' },
    ],
  },
};

export const themeOf = (id: string | null | undefined): Theme => THEMES[(id === 'urban' ? 'urban' : 'classic')];

/** The colours a school actually shows: its own, else its theme's. */
export function schoolColours(theme: string | null | undefined, accent?: string | null, secondary?: string | null) {
  const t = themeOf(theme);
  return { theme: t, accent: normaliseHex(accent) ?? t.accent, secondary: normaliseHex(secondary) ?? t.secondary };
}
