/**
 * App Store screenshots and the social/OG image, from the running app.
 *
 *   npx next dev -p 3000 &
 *   npx tsx scripts/store-shots.mts            (BASE_URL to point elsewhere)
 *
 * Each image is one product moment (GUIDELINES §8): a real phone screen of a
 * demo person, captured at 390 × 844 @3x, set in a plain device frame on Count
 * blue with an Archivo headline. The composition is drawn inside the app's own
 * /design page so the self-hosted fonts and tokens are the real ones.
 * Output: public/brand/store/*.png (1290 × 2796) and og.png (1200 × 628).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SWAYVO } from '../src/lib/swayvo-logo';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/brand/store');
const LOGO = readFileSync(join(ROOT, 'public/brand/swayvo-logo-white.svg'), 'utf8').replace(/<title>.*?<\/title>/, '');

type Person = { userId: string; role: string; name: string };
const P: Record<string, Person> = {
  owner:   { userId: '00000002-0000-4000-8000-000000000001', role: 'owner', name: 'Freya Lindqvist' },
  teacher: { userId: '00000002-0000-4000-8000-000000000002', role: 'teacher', name: 'Marcus Bell' },
  parent:  { userId: '00000002-0000-4000-8000-000000000011', role: 'guardian', name: 'Hannah Wright' },
  student: { userId: '00000002-0000-4000-8000-000000000040', role: 'student', name: 'Amir Wright' },
};

/** One screenshot each. `path` may be resolved from the teacher's Today. */
type Shot = { file: string; who: Person; path: string | 'register'; headline: string; line: string };
const SHOTS: Shot[] = [
  { file: '01-register', who: P.teacher, path: 'register', headline: 'Register in seconds.',
    line: 'One tap for each dancer. Medical notes beside the name.' },
  { file: '02-family', who: P.parent, path: '/family', headline: 'Every change, said plainly.',
    line: 'Each child’s week, and the notices that matter.' },
  { file: '03-progress', who: P.student, path: '/learn/feedback', headline: 'Progress you can see.',
    line: 'Feedback from your teachers, skill by skill.' },
  { file: '04-today', who: P.owner, path: '/today', headline: 'Your school’s day, on the count.',
    line: 'The next class, what needs you, and the money.' },
  { file: '05-teach', who: P.teacher, path: '/teach', headline: 'Five, six, seven, eight.',
    line: 'Your classes and registers, ready before the music starts.' },
];

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ── 1. Phone screens ──────────────────────────────────────────────────────
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const pg = await phone.newPage();
// The register reads best mid-class. The demo builds its term around the browser's clock, so set it
// to a moment when the teacher's Tuesday class is running (override with STORE_NOW).
await pg.clock.install({ time: new Date(process.env.STORE_NOW ?? nextTuesdayAt(16, 35)) });
function nextTuesdayAt(h: number, m: number) {
  const d = new Date(); d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7 || 7));
  return d.toISOString();
}
pg.setDefaultTimeout(240_000);   // a cold dev server compiles each route on first visit

async function ready() {
  await pg.waitForFunction(() => !/Setting up/.test(document.body.innerText) && !document.querySelector('.skeleton'), null, { timeout: 180_000, polling: 500 });
  await pg.waitForTimeout(900);                           // entrances on the count finish in 2 beats
  // The dev-server badge is not part of the product.
  await pg.evaluate(() => document.querySelectorAll('nextjs-portal').forEach(n => n.remove()));
}

const KEY = process.env.SESSION_KEY ?? 'barre.session.v1';
async function signIn(who: Person) {
  await pg.goto(BASE + '/');
  await pg.evaluate(([k, v]: string[]) => localStorage.setItem(k, v), [KEY, JSON.stringify(who)]);
}

const screens: Record<string, string> = {};
for (const s of SHOTS) {
  await signIn(s.who);
  let path = s.path;
  if (path === 'register') {
    await pg.goto(BASE + '/teach');
    await ready();
    const href = await pg.locator('a[href*="/teach/register/?session="]').first().getAttribute('href');
    if (!href) throw new Error('No “Open register” link on /teach');
    path = href.replace(new URL(BASE).pathname.replace(/\/$/, ''), '');   // links carry the base path
  }
  await pg.goto(BASE + path);
  await ready();
  if (s.path === 'register') {
    // A register mid-class reads better than an untouched one: four here, one absent.
    // Marking is only possible once the class has started (a future register is read-only),
    // so this is skipped when it is. The marks live only in this throwaway browser context.
    const marks: [RegExp, number][] = [[/^Here — /, 0], [/^Absent — /, 1], [/^Here — /, 2], [/^Here — /, 3], [/^Here — /, 4]];
    for (const [label, row] of marks) {
      const btn = pg.getByRole('button', { name: label }).nth(row);
      if (await btn.isEnabled().catch(() => false)) await btn.click().catch(() => {});
      await pg.waitForTimeout(250);
    }
    await pg.evaluate(() => window.scrollTo(0, 0));
    await ready();
  }
  screens[s.file] = (await pg.screenshot({ type: 'png' })).toString('base64');
  console.log(`screen ${s.file}  ${s.who.name}  ${path}`);
}
await phone.close();

// ── 2. Compositions ───────────────────────────────────────────────────────
/** The last word of a headline takes the downbeat colour, as on the website. */
const headlineHtml = (h: string) => {
  const i = h.trimEnd().lastIndexOf(' ');
  return `${h.slice(0, i + 1)}<span style="color:${SWAYVO.peach}">${h.slice(i + 1)}</span>`;
};

const W = 1290, H = 2796;
// Screen 912 wide keeps the 390 × 844 ratio (1974 tall); a 22px ink bezel.
const SW = 920, SH = Math.round(SW * 844 / 390), BZ = 22;
const store = (s: Shot) => `
<div style="position:fixed;inset:0;width:${W}px;height:${H}px;background:${SWAYVO.blue};color:${SWAYVO.white};overflow:hidden;font-family:var(--font-sans)">
  <div style="position:absolute;left:96px;right:96px;top:104px">
    ${LOGO.replace('<svg ', '<svg style="height:52px;width:auto;display:block" ')}
    <h1 style="margin:64px 0 0;font-family:var(--font-display);font-weight:850;font-stretch:118%;font-size:108px;line-height:0.94;letter-spacing:-0.025em;text-wrap:balance">${headlineHtml(s.headline)}</h1>
    <p style="margin:36px 0 0;font-size:40px;line-height:1.3;font-weight:500;color:rgb(255 255 255 / 0.9);text-wrap:balance">${s.line}</p>
  </div>
  <div style="position:absolute;left:${(W - SW - BZ * 2) / 2}px;top:${H - SH - BZ * 2 - 64}px;width:${SW + BZ * 2}px;height:${SH + BZ * 2}px;background:${SWAYVO.ink};border-radius:120px;padding:${BZ}px;box-sizing:border-box">
    <img src="data:image/png;base64,${screens[s.file]}" style="display:block;width:${SW}px;height:${SH}px;border-radius:98px;background:${SWAYVO.white}" alt="">
  </div>
</div>`;

const og = () => `
<div style="position:fixed;inset:0;width:1200px;height:628px;background:${SWAYVO.blue};color:${SWAYVO.white};overflow:hidden;font-family:var(--font-sans)">
  <div style="position:absolute;left:72px;top:64px;height:40px">${LOGO.replace('<svg ', '<svg style="height:40px;width:auto;display:block" ')}</div>
  <h1 style="position:absolute;left:72px;top:176px;width:640px;margin:0;font-family:var(--font-display);font-weight:850;font-stretch:118%;font-size:84px;line-height:0.92;letter-spacing:-0.025em">Five, six, seven, <span style="color:${SWAYVO.peach}">eight.</span></h1>
  <p style="position:absolute;left:72px;top:390px;width:600px;margin:0;font-family:var(--font-display);font-weight:800;font-stretch:112%;font-size:34px;line-height:1.1">More time for dance.</p>
  <p style="position:absolute;left:72px;top:446px;width:600px;margin:0;font-size:22px;line-height:1.4;color:rgb(255 255 255 / 0.88)">Classes, registers, payments, messages and progress for dance schools.</p>
  <div style="position:absolute;left:800px;top:64px;width:${336 + 24}px;height:${Math.round(336 * 844 / 390) + 24}px;background:${SWAYVO.ink};border-radius:52px;padding:12px;box-sizing:border-box">
    <img src="data:image/png;base64,${screens['01-register']}" style="display:block;width:336px;height:${Math.round(336 * 844 / 390)}px;border-radius:42px" alt="">
  </div>
</div>`;

async function render(html: string, w: number, h: number, file: string) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(240_000);
  await page.goto(BASE + '/design');
  await page.waitForFunction(() => !/Setting up/.test(document.body.innerText), null, { timeout: 180_000, polling: 500 });
  await page.evaluate((markup: string) => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('style');
    document.body.innerHTML = markup;
  }, html);
  await page.evaluate(async () => {
    await Promise.all(['850 112px "Archivo Variable"', '800 34px "Archivo Variable"', '500 40px "Inter Variable"']
      .map(f => document.fonts.load(f)));
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode()));
  });
  writeFileSync(join(OUT, `${file}.png`), await page.screenshot({ type: 'png' }));
  console.log(`wrote public/brand/store/${file}.png  ${w}×${h}`);
  await ctx.close();
}

for (const s of SHOTS) await render(store(s), W, H, s.file);
await render(og(), 1200, 628, 'og');
await browser.close();
