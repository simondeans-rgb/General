/**
 * Renders the wordmark and app icon large, with the letter-pair gaps marked,
 * for docs/brand/wordmark-v2.md. Run before and after a change to
 * src/lib/swayvo-logo.ts:  npx tsx scripts/wordmark-compare.mts <label>
 * Output: docs/brand/wordmark-v2/<label>-*.png
 */
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from '../src/lib/swayvo-logo';

const { BAR_W, MARK_BARS, SWAYVO, WORD_PATHS, WORD_STROKE, WORD_TRANSFORM } = L;
// Icon-specific spacing arrived with v2; before it the icon used the mark's bars.
const ICON_BARS = (L as Record<string, unknown>).ICON_BARS as typeof MARK_BARS | undefined;
const ICON_BAR_W = (L as Record<string, unknown>).ICON_BAR_W as number | undefined;

const label = process.argv[2] ?? 'after';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'docs/brand/wordmark-v2');
mkdirSync(OUT, { recursive: true });

const word = `<g transform="${WORD_TRANSFORM}" fill="none" stroke="${SWAYVO.ink}" stroke-width="${WORD_STROKE}" stroke-linejoin="bevel">${
  WORD_PATHS.map(p => `<path d="${p.d}"${p.transform ? ` transform="${p.transform}"` : ''}/>`).join('')}</g>`;
const iconBars = (ICON_BARS ?? MARK_BARS).map(b =>
  `<rect x="${b.x}" y="${b.y}" width="${ICON_BAR_W ?? BAR_W}" height="${b.h}" rx="1" fill="${b.downbeat ? SWAYVO.peach : SWAYVO.white}"/>`).join('');
const half = ICON_BAR_W ? 34.5 : 35;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="180" height="180"><rect width="100" height="100" fill="${SWAYVO.blue}"/><g transform="translate(${50 - half * 0.886} ${50 - 32 * 0.886}) scale(0.886)">${iconBars}</g></svg>`;

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.setViewportSize({ width: 1100, height: 280 });
await page.setContent(`<body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 96" width="1100" height="258" style="margin-top:11px">${word}</svg></body>`);
await page.screenshot({ path: join(OUT, `${label}-wordmark.png`) });
// The "yv" pair and the "o", magnified.
await page.setViewportSize({ width: 1100, height: 478 });
await page.setContent(`<body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" viewBox="180 -4 230 100" width="1100" height="478">${word}</svg></body>`);
await page.screenshot({ path: join(OUT, `${label}-yvo-detail.png`) });
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(`<body style="margin:0">${icon}</body>`);
await page.screenshot({ path: join(OUT, `${label}-icon-180.png`) });
await browser.close();
console.log(`wrote docs/brand/wordmark-v2/${label}-*.png`);
