/**
 * Generates the Swayvo asset files from src/lib/swayvo-logo.ts:
 *   public/brand/*.svg          logo, mark, wordmark, mono and on-colour variants
 *   public/brand/*.png          the same at useful sizes (transparent)
 *   public/icons/*.png          app icons, apple-touch-icon, maskable icon
 *   src/app/icon.svg            favicon
 * Run: npx tsx scripts/brand-assets.mts   (needs Playwright's Chromium for PNGs)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BAR_W, ICON_BARS, ICON_BAR_W, ICON_MARK_SIZE, LOCKUP, MARK_BARS, MARK_VIEWBOX, SMALL_MARK_BARS, SWAYVO, WORD_PATHS, WORD_STROKE, WORD_TRANSFORM,
  logoColours, type LogoTone,
} from '../src/lib/swayvo-logo';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = join(root, 'public/brand');
const ICONS = join(root, 'public/icons');
mkdirSync(BRAND, { recursive: true }); mkdirSync(ICONS, { recursive: true });

const bars = (tone: LogoTone, mono = false) => MARK_BARS.map(b =>
  `<rect x="${b.x}" y="${b.y}" width="${BAR_W}" height="${b.h}" rx="1" fill="${b.downbeat && !mono ? logoColours(tone).downbeat : logoColours(tone).bars}"/>`).join('');
const word = (tone: LogoTone) => `<g transform="${WORD_TRANSFORM}" fill="none" stroke="${logoColours(tone).word}" stroke-width="${WORD_STROKE}" stroke-linejoin="bevel">${
  WORD_PATHS.map(p => `<path d="${p.d}"${p.transform ? ` transform="${p.transform}"` : ''}/>`).join('')}</g>`;
const svg = (vb: string, body: string, title = 'Swayvo') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><title>${title}</title>${body}</svg>\n`;
const lockup = (tone: LogoTone, mono = false, bg?: string) => svg(`0 0 ${LOCKUP.width} ${LOCKUP.height}`,
  `${bg ? `<rect width="${LOCKUP.width}" height="${LOCKUP.height}" fill="${bg}"/>` : ''}<g transform="translate(${LOCKUP.markX} ${LOCKUP.markY}) scale(${LOCKUP.markScale})">${bars(tone, mono)}</g><g transform="translate(${LOCKUP.wordX} ${LOCKUP.wordY})">${word(tone)}</g>`);
// The icon draws its own, more open count (ICON_BARS) so the bars stay apart at 180px.
const iconBars = () => ICON_BARS.map(b =>
  `<rect x="${b.x}" y="${b.y}" width="${ICON_BAR_W}" height="${b.h}" rx="0.8" fill="${b.downbeat ? SWAYVO.peach : SWAYVO.white}"/>`).join('');
const icon = (radius: number, inset = 1) => svg('0 0 100 100',
  `<rect width="100" height="100" rx="${radius}" fill="${SWAYVO.blue}"/><g transform="translate(${50 - ICON_MARK_SIZE.width / 2 * 0.886 * inset} ${50 - ICON_MARK_SIZE.height / 2 * 0.886 * inset}) scale(${0.886 * inset})">${iconBars()}</g>`, 'Swayvo app icon');
const favicon = svg('0 0 16 16', `<rect width="16" height="16" rx="3.5" fill="${SWAYVO.blue}"/>${SMALL_MARK_BARS.map(b =>
  `<rect x="${b.x + 0}" y="${b.y}" width="${b.w}" height="${b.h - 0}" fill="${b.downbeat ? SWAYVO.peach : SWAYVO.white}" transform="translate(0 0) scale(1)"/>`).join('')}`, 'Swayvo');

const files: Record<string, string> = {
  'swayvo-logo.svg': lockup('ink'),
  'swayvo-logo-white.svg': lockup('white'),
  'swayvo-logo-on-blue.svg': lockup('white', false, SWAYVO.blue),
  'swayvo-logo-mono-ink.svg': lockup('ink', true),
  'swayvo-logo-mono-white.svg': lockup('white', true),
  'swayvo-logo-mono-blue.svg': lockup('blue', true),
  'swayvo-wordmark.svg': svg('0 0 410 96', word('ink')),
  'swayvo-wordmark-white.svg': svg('0 0 410 96', word('white')),
  'swayvo-mark.svg': svg(MARK_VIEWBOX, bars('ink')),
  'swayvo-mark-white.svg': svg(MARK_VIEWBOX, bars('white')),
  'swayvo-mark-blue.svg': svg(MARK_VIEWBOX, bars('blue', true)),
  'swayvo-app-icon.svg': icon(22),
  'swayvo-app-icon-square.svg': icon(0),
  'swayvo-favicon.svg': favicon,
};
for (const [n, c] of Object.entries(files)) writeFileSync(join(BRAND, n), c);
writeFileSync(join(root, 'src/app/icon.svg'), favicon);

// PNG renders.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function png(svgText: string, w: number, h: number, out: string) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svgText.replace('<svg ', `<svg width="${w}" height="${h}" `)}</body></html>`);
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}
await png(icon(0), 1024, 1024, join(BRAND, 'swayvo-app-icon-1024.png'));
await png(icon(0), 512, 512, join(ICONS, 'icon-512.png'));
await png(icon(0), 192, 192, join(ICONS, 'icon-192.png'));
await png(icon(0), 180, 180, join(ICONS, 'apple-touch-icon.png'));
await png(icon(0, 0.72), 512, 512, join(ICONS, 'maskable-512.png'));   // safe zone for Android masks
await png(favicon, 32, 32, join(BRAND, 'swayvo-favicon-32.png'));
await png(favicon, 16, 16, join(BRAND, 'swayvo-favicon-16.png'));
for (const [n, w] of [['swayvo-logo', 1024], ['swayvo-logo-white', 1024], ['swayvo-logo-on-blue', 1024]] as const)
  await png(files[`${n}.svg`]!, w, Math.round(w * LOCKUP.height / LOCKUP.width), join(BRAND, `${n}.png`));
await browser.close();
console.log(`wrote ${Object.keys(files).length} SVGs and PNG renders`);
