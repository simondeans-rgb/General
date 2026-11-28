/**
 * What a phone's home screen shows for this app (round-2 review, F4).
 *
 * Signed in to a school, the installed app is the school's: its short name
 * under the icon, an icon made from its logo (or, with no logo, its initials)
 * on its own colour, and browser chrome in its theme's colour. Signed out, or
 * on Swayvo's own console, it is Swayvo's.
 *
 * Pure: no DOM. The browser side (components/app/pwa.tsx) draws the icons and
 * swaps the manifest, the apple-touch-icon and the iOS title at run time,
 * because this demo is a static export: app/manifest.ts is written once at
 * build time, so a per-school manifest has to be made in the browser.
 */
import { monogram, normaliseHex, paletteFor } from './brand';
import { SWAYVO, THEME_COLOR } from './swayvo-logo';
import { schoolColours } from './theme';

export type InstallSchool = {
  name: string;
  brand_colour?: string | null;
  logo_url?: string | null;
  theme?: string | null;
  brand_secondary?: string | null;
};

export type InstallIdentity = {
  /** Full name, for the install dialog and the manifest. */
  name: string;
  /** Under the icon: about 12 characters is all a home screen shows. */
  shortName: string;
  /** Browser chrome (status bar, title bar). The same value the page's theme-color meta uses. */
  themeColor: string;
  /** The splash screen behind the icon on Android. */
  backgroundColor: string;
  /** The icon: its ground, what sits on it, and either a logo or initials. */
  icon: { ground: string; ink: string; logo: string | null; initials: string };
  /** False for Swayvo's own identity: the static manifest and icons apply. */
  school: boolean;
};

const GENERIC = /^(the|school|academy|studio|studios|dance|dancers|ballet|of|and|&|co|centre|center)$/i;

/** "Northstar Dance Academy" → "Northstar"; "The Kestrel Ballet School" → "Kestrel"; short names stay whole. */
export function shortNameFor(name: string, max = 12): string {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const words = clean.split(' ');
  const first = words.find(w => !GENERIC.test(w)) ?? words[0]!;
  return first.length <= max ? first : first.slice(0, max);
}

export const SWAYVO_IDENTITY: InstallIdentity = {
  name: 'Swayvo', shortName: 'Swayvo', themeColor: THEME_COLOR, backgroundColor: SWAYVO.studio,
  icon: { ground: SWAYVO.blue, ink: SWAYVO.white, logo: null, initials: '' }, school: false,
};

export function installIdentity(school: InstallSchool | null | undefined): InstallIdentity {
  if (!school?.name?.trim()) return SWAYVO_IDENTITY;
  const c = schoolColours(school.theme, school.brand_colour, school.brand_secondary);
  const ground = normaliseHex(school.brand_colour) ?? c.accent;
  return {
    name: school.name.trim(),
    shortName: shortNameFor(school.name),
    // Matches what useSchoolTheme puts in <meta name="theme-color">: one value.
    themeColor: c.theme.dark ? c.theme.canvas : c.theme.surface,
    backgroundColor: c.theme.canvas,
    icon: { ground, ink: paletteFor(ground).onAccent, logo: school.logo_url ?? null, initials: monogram(school.name) },
    school: true,
  };
}

/**
 * Where things sit on a square icon of `size` pixels. A logo goes on a white
 * plate (most school logos are drawn for white paper, and a plate keeps a
 * low-contrast logo readable on any colour). A maskable icon keeps everything
 * inside the central 80% circle Android may crop to.
 */
export function iconLayout(size: number, maskable: boolean) {
  const safe = maskable ? 0.8 : 1;
  const plate = Math.round(size * 0.74 * safe);
  const logoBox = Math.round(plate * 0.78);
  return {
    size,
    plate: { x: Math.round((size - plate) / 2), y: Math.round((size - plate) / 2), size: plate, radius: Math.round(plate * 0.22) },
    logo: { x: Math.round((size - logoBox) / 2), y: Math.round((size - logoBox) / 2), size: logoBox },
    initials: { fontSize: Math.round(size * 0.42 * safe), x: size / 2, y: size / 2 },
  };
}

/** The manifest for this identity. Icons are passed in (data: URLs drawn in the browser). */
export function manifestFor(id: InstallIdentity, origin: string, base: string,
  icons: { src: string; sizes: string; type: string; purpose?: string }[]) {
  return {
    name: id.name,
    short_name: id.shortName,
    description: id.school ? `${id.name}: classes, messages and payments, powered by Swayvo.` : 'Your dance school, on the count.',
    start_url: `${origin}${base}/`,
    scope: `${origin}${base}/`,
    // A different id per school, so a parent at two schools can install both.
    id: id.school ? `${base}/?school=${encodeURIComponent(id.shortName.toLowerCase())}` : `${base}/`,
    display: 'standalone',
    background_color: id.backgroundColor,
    theme_color: id.themeColor,
    icons,
  };
}

export type InstallPlatform = 'ios' | 'android' | 'desktop';

/** Which "add to home screen" steps to show. iPadOS reports itself as a Mac with a touch screen. */
export function installPlatform(ua: string, maxTouchPoints = 0): InstallPlatform {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** The steps, in the words each phone uses on its own buttons. */
export function installSteps(platform: InstallPlatform, shortName: string, canPrompt = false): string[] {
  switch (platform) {
    case 'ios': return [
      'Open this page in Safari.',
      'Tap the Share button (the square with an arrow pointing up).',
      'Scroll down and tap “Add to Home Screen”.',
      `Check the name says ${shortName}, then tap Add.`,
    ];
    case 'android': return canPrompt
      ? [`Tap “Add to home screen” below, then Install.`, `${shortName} appears with your other apps.`]
      : ['Open this page in Chrome.', 'Tap the menu (three dots, top right).', 'Tap “Add to Home screen” or “Install app”.', `Check the name says ${shortName}, then tap Add.`];
    default: return canPrompt
      ? [`Click “Add to home screen” below, then Install.`, `${shortName} opens in its own window.`]
      : ['In Chrome or Edge, click the install icon at the right of the address bar.', 'Click Install.'];
  }
}
