/**
 * A school's brand, made safe to use — without changing it.
 *
 * The school's exact colour is used for every coloured surface: buttons,
 * active tabs, badges. What changes to keep things readable is what sits ON
 * that colour (white or black text, whichever reads better — one of the two
 * always reaches WCAG AA), and the thin details drawn in the brand colour on
 * white (links, focus outlines), which are deepened only if the exact colour
 * would be too faint to read.
 */
export type Palette = {
  /** The school's exact colour. Surfaces. */
  accent: string;
  /** Text and icons on the brand colour: white or black. */
  onAccent: string;
  hover: string;
  /** A light tint for backgrounds, and readable text on that tint. */
  soft: string; ink: string;
  /** The brand colour as text on white (4.5:1) and as a line or outline (3:1). */
  text: string; line: string;
  /** True when text on the brand colour is dark rather than white. */
  darkText: boolean;
  /** True when links and outlines use a deeper shade than the exact colour. */
  textDeepened: boolean;
};

export const DEFAULT_BRAND = '#0b3b34';   // Sanaa eucalyptus


export function normaliseHex(v: string | null | undefined): string | null {
  if (!v) return null;
  let s = v.trim().toLowerCase();
  if (!s.startsWith('#')) s = `#${s}`;
  if (/^#[0-9a-f]{3}$/.test(s)) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

type RGB = [number, number, number];
const toRgb = (hex: string): RGB => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const toHex = (rgb: RGB) => `#${rgb.map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

function toHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function fromHsl([h, s, l]: [number, number, number]): string {
  if (s === 0) return toHex([l * 255, l * 255, l * 255]);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return toHex([f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]);
}

/** Darken (keeping hue and saturation) until `on` reads at `ratio` against it. */
function deepen(hex: string, against: string, ratio: number): string {
  let [h, s, l] = toHsl(toRgb(hex));
  let out = hex;
  while (contrast(out, against) < ratio && l > 0) { l = Math.max(0, l - 0.01); out = fromHsl([h, s, l]); }
  return out;
}

const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a), y = toRgb(b);
  return toHex([0, 1, 2].map(i => x[i]! * (1 - t) + y[i]! * t) as RGB);
};

/** Lighten (keeping hue and saturation) until it reads at `ratio` against a dark `against`. */
function lighten(hex: string, against: string, ratio: number): string {
  let [h, s, l] = toHsl(toRgb(hex));
  let out = hex;
  while (contrast(out, against) < ratio && l < 1) { l = Math.min(1, l + 0.01); out = fromHsl([h, s, l]); }
  return out;
}

export const isDark = (hex: string) => luminance(normaliseHex(hex) ?? '#ffffff') < 0.18;

/**
 * Everything the interface needs from one brand colour, for a given surface.
 * On a light surface thin details are deepened; on a dark one (the Urban
 * theme) they are lightened. The colour itself, on buttons and tabs, is
 * always exact.
 */
export function paletteFor(input: string | null | undefined, surface = '#ffffff'): Palette {
  const accent = normaliseHex(input) ?? DEFAULT_BRAND;
  const dark = isDark(surface);
  const darkText = contrast(accent, '#ffffff') < 4.5;
  const onAccent = darkText ? '#000000' : '#ffffff';
  // Hover moves away from the text colour, so it only ever gets more readable.
  const [h, s, l] = toHsl(toRgb(accent));
  const hover = fromHsl([h, s, darkText ? Math.min(1, l + 0.08) : Math.max(0, l - 0.07)]);
  const soft = mix(accent, surface, dark ? 0.82 : 0.9);
  const fit = (c: string, against: string, r: number) => dark ? lighten(c, against, r) : deepen(c, against, r);
  const ink = fit(accent, soft, 4.5);
  const text = fit(accent, surface, 4.5);
  const line = fit(accent, surface, 3);
  return { accent, onAccent, hover, soft, ink, text, line, darkText, textDeepened: text !== accent };
}

/** CSS custom properties the whole interface reads its accent from. */
export const cssVars = (p: Palette): Record<string, string> => ({
  '--color-accent': p.accent, '--color-accent-hover': p.hover, '--color-on-accent': p.onAccent,
  '--color-accent-soft': p.soft, '--color-accent-ink': p.ink,
  '--color-accent-text': p.text, '--color-accent-line': p.line,
});

/** Two letters for a school without a logo: "Northstar Dance Academy" → "ND". */
export const monogram = (name: string) =>
  name.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi, ' ').trim().split(/\s+/)
    .filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
  || name.trim().split(/\s+/).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');
