// Renders the PNG app icons from assets/icons/favicon.svg with Playwright.
// Usage: node scripts/render-icons.mjs   (needs Playwright + Chromium installed)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'assets/icons/favicon.svg'), 'utf8');
// Full-bleed version (no rounded corners) for platforms that apply their own mask.
const square = svg.replace('rx="15"', 'rx="0"');
// Maskable: content inside the 80% safe zone.
const maskable = square.replace('<path', '<g transform="translate(6.4 6.4) scale(.8)"><path').replace('</svg>', '</g></svg>');

const jobs = [
  ['icon-192.png', 192, svg],
  ['icon-512.png', 512, svg],
  ['apple-touch-icon.png', 180, square],
  ['maskable-512.png', 512, maskable],
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [name, size, source] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  const html = `<html><body style="margin:0;background:transparent">${source.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`;
  await page.setContent(html);
  await page.screenshot({ path: join(root, 'assets/icons', name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', name);
}
await browser.close();
