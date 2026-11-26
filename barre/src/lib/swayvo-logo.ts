/**
 * The Swayvo identity as geometry: one source for the in-app logo components
 * (src/components/app/swayvo.tsx) and the generated asset files
 * (scripts/brand-assets.mts → public/brand). Change it here only.
 * Guidelines: docs/brand/GUIDELINES.md.
 */

export const SWAYVO = {
  blue: '#2638F0',      // Count blue — brand ground, primary action, the "now" beat
  blueDeep: '#1A27B8',  // pressed
  peach: '#FFB089',     // Rosin peach — the downbeat on blue
  ink: '#121521',
  white: '#FFFFFF',
  studio: '#F4F5F8',
} as const;

/** The eight-count: two groups of four with a clear gap between them, beat 1
 *  full height (the downbeat), beat 5 lifted. 70 × 64 units. */
export const MARK_VIEWBOX = '0 0 70 64';
export const MARK_BARS: { x: number; y: number; h: number; downbeat?: boolean }[] = [
  { x: 0, y: 0, h: 64, downbeat: true }, { x: 8, y: 36, h: 28 }, { x: 16, y: 36, h: 28 }, { x: 24, y: 36, h: 28 },
  { x: 40, y: 16, h: 48 }, { x: 48, y: 36, h: 28 }, { x: 56, y: 36, h: 28 }, { x: 64, y: 36, h: 28 },
];
export const BAR_W = 6;

/** At 16px eight bars blur together; the favicon keeps beats 1, 2, 5, 6. */
export const SMALL_MARK_VIEWBOX = '0 0 16 16';
export const SMALL_MARK_BARS = [
  { x: 1, y: 1, w: 2, h: 14, downbeat: true }, { x: 5, y: 8, w: 2, h: 7 },
  { x: 9, y: 4, w: 2, h: 11 }, { x: 13, y: 8, w: 2, h: 7 },
];

/** The wordmark: one 14-unit monoline stroke leaning 10° forward, lowercase.
 *  Drawn as strokes (not a font) so it renders identically everywhere. */
export const WORD_VIEWBOX = '0 0 410 96';
export const WORD_TRANSFORM = 'translate(14 4) skewX(-10)';
export const WORD_STROKE = 14;
export const WORD_PATHS: { d: string; transform?: string }[] = [
  { d: 'M47 7H20Q8 7 8 17.5Q8 28 20 28H36Q48 28 48 38.5Q48 49 36 49H8' },                    // s
  { d: 'M5 0L17 49L31 12L45 49L57 0', transform: 'translate(62 0)' },                         // w
  { d: 'M49 28A21 21 0 1 1 49 27.9M49 0V56', transform: 'translate(132 0)' },                // a
  { d: 'M5 0L28.5 49M51 0L17 76', transform: 'translate(194 0)' },                           // y
  { d: 'M5 0L28 49L51 0', transform: 'translate(255 0)' },                                   // v
  { d: 'M49 28A21 21 0 1 1 49 27.9', transform: 'translate(318 0)' },                         // o
];

/** Horizontal lockup: mark, then the wordmark, sharing a baseline. */
export const LOCKUP = { width: 512, height: 96, markScale: 1.0625, markX: 8, markY: 4, wordX: 96, wordY: 3 } as const;

export type LogoTone = 'ink' | 'white' | 'blue';
/** Which colour each part takes, by background. */
export function logoColours(tone: LogoTone) {
  switch (tone) {
    case 'white': return { word: SWAYVO.white, bars: SWAYVO.white, downbeat: SWAYVO.peach };   // on blue or ink
    case 'blue':  return { word: SWAYVO.blue, bars: SWAYVO.blue, downbeat: SWAYVO.blue };      // single colour on light
    default:      return { word: SWAYVO.ink, bars: SWAYVO.ink, downbeat: SWAYVO.blue };        // on white / studio white
  }
}
