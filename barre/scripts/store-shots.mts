/**
 * App store images and the social/OG image, from the running app.
 *
 *   npx next dev --webpack -p 3000 &
 *   npx tsx scripts/store-shots.mts            (BASE_URL to point elsewhere)
 *
 * Each image is one product moment (GUIDELINES §8): a real screen of a demo
 * person, captured from the current app, set in a plain device frame with an
 * Archivo headline. Grounds alternate Count blue and studio white, and one
 * shot is a school in the dark Urban style ("looks like your school"). The
 * device is cropped tight (round-2 review): the top of the screen at about
 * 70% of the image height, so the product reads at store-thumbnail size.
 * The browser clock is fixed (STORE_NOW, default: next Tuesday 16:35), so
 * the dates and the class in progress are the same on every run.
 *
 * Output (public/brand/store/):
 *   01–05-*.png        phone, 1290 × 2796 (iPhone 6.7"; Google Play accepts it too)
 *   tablet-01–03-*.png tablet, 2048 × 2732 (iPad 12.9")
 *   feature-graphic.png  Google Play feature graphic, 1024 × 500
 *   og.png             social card, 1200 × 628
 * The composition is drawn inside the app's own /design page so the
 * self-hosted fonts and tokens are the real ones.
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
const strip = (s: string) => s.replace(/<title>.*?<\/title>/, '');
const LOGO_WHITE = strip(readFileSync(join(ROOT, 'public/brand/swayvo-logo-white.svg'), 'utf8'));
const LOGO_INK = strip(readFileSync(join(ROOT, 'public/brand/swayvo-logo.svg'), 'utf8'));

type Person = { userId: string; role: string; name: string; studio?: string };
const P: Record<string, Person> = {
  owner:   { userId: '00000002-0000-4000-8000-000000000001', role: 'owner', name: 'Freya Lindqvist' },
  teacher: { userId: '00000002-0000-4000-8000-000000000002', role: 'teacher', name: 'Marcus Bell' },
  parent:  { userId: '00000002-0000-4000-8000-000000000011', role: 'guardian', name: 'Hannah Wright' },
  student: { userId: '00000002-0000-4000-8000-000000000040', role: 'student', name: 'Amir Wright' },
  // Priya teaches at Kestrel too, which uses the dark Urban style.
  kestrel: { userId: '00000002-0000-4000-8000-000000000003', role: 'teacher', name: 'Priya Raman', studio: '00000001-0000-4000-8000-000000000003' },
};

type Ground = 'blue' | 'white' | 'urban';
/** One screenshot each. `path` 'register' is resolved from the teacher's Today. */
type Shot = { file: string; who: Person; path: string; headline: string; line: string; ground: Ground };
const SHOTS: Shot[] = [
  { file: '01-register', who: P.teacher, path: 'register', ground: 'blue', headline: 'Register in seconds.',
    line: 'One tap for each dancer. It works with no signal, and sends when it’s back.' },
  { file: '02-family', who: P.parent, path: '/family', ground: 'white', headline: 'Every change, said plainly.',
    line: 'Each child’s week, and the notices that matter.' },
  { file: '03-progress', who: P.student, path: '/learn/feedback', ground: 'blue', headline: 'Progress you can see.',
    line: 'Feedback from your teachers, skill by skill.' },
  { file: '04-your-school', who: P.kestrel, path: '/teach', ground: 'urban', headline: 'Looks like your school.',
    line: 'Your logo, your colours, a light or a dark style.' },
  { file: '05-classes', who: P.owner, path: '/classes', ground: 'white', headline: 'Your school’s week, on the count.',
    line: 'Every class, its teacher and room, and how full it is.' },
];
const TABLET: Shot[] = [
  { file: 'tablet-01-timetable', who: P.owner, path: '/schedule', ground: 'blue', headline: 'Your school’s week, on the count.',
    line: 'Every class, room and teacher in one place.' },
  { file: 'tablet-02-family', who: P.parent, path: '/family', ground: 'white', headline: 'Every change, said plainly.',
    line: 'Each child’s week, and the notices that matter.' },
  { file: 'tablet-03-register', who: P.teacher, path: 'register', ground: 'blue', headline: 'Register in seconds.',
    line: 'One tap for each dancer, with or without signal.' },
];

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

function nextTuesdayAt(h: number, m: number) {
  const d = new Date(); d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7 || 7));
  return d.toISOString();
}
const NOW = new Date(process.env.STORE_NOW ?? nextTuesdayAt(16, 35));
const KEY = process.env.SESSION_KEY ?? 'barre.session.v1';

/** Captures each shot's screen in a context of the given size. */
async function capture(shots: Shot[], viewport: { width: number; height: number }, scale: number, mobile: boolean) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, isMobile: mobile, hasTouch: true });
  const pg = await ctx.newPage();
  // The register reads best mid-class. The demo builds its term around the
  // browser's clock, so it is fixed to a moment when the teacher's Tuesday class is running.
  await pg.clock.install({ time: NOW });
  pg.setDefaultTimeout(240_000);   // a cold dev server compiles each route on first visit
  const ready = async () => {
    await pg.waitForFunction(() => !/Setting up/.test(document.body.innerText) && !document.querySelector('.skeleton'), null, { timeout: 180_000, polling: 500 });
    await pg.waitForTimeout(900);                           // entrances on the count finish in 2 beats
    await pg.evaluate(() => document.querySelectorAll('nextjs-portal').forEach(n => n.remove()));   // the dev badge
  };
  const out: Record<string, string> = {};
  for (const s of shots) {
    await pg.goto(BASE + '/');
    await pg.evaluate(([k, v]: string[]) => {
      localStorage.setItem(k!, v!);
      localStorage.setItem('barre.install-guide.dismissed.v1', '1');   // the install card is for a real phone
    }, [KEY, JSON.stringify(s.who)]);
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
      // Mid-class: four here, one absent. Marks live only in this throwaway browser context.
      const marks: [RegExp, number][] = [[/^Here — /, 0], [/^Absent — /, 1], [/^Here — /, 2], [/^Here — /, 3], [/^Here — /, 4]];
      for (const [label, row] of marks) {
        const btn = pg.getByRole('button', { name: label }).nth(row);
        if (await btn.isEnabled().catch(() => false)) await btn.click().catch(() => {});
        await pg.waitForTimeout(250);
      }
      await pg.evaluate(() => window.scrollTo(0, 0));
      await ready();
    }
    // Store images must not drift from the product: refuse known-stale states.
    const text = await pg.evaluate(() => document.body.innerText);
    for (const bad of [/Card payments failed/i, /\bRetry\b/, /Card declined/i]) {
      if (bad.test(text)) console.warn(`warning: ${s.file} shows "${bad.source}" — pick another screen`);
    }
    out[s.file] = (await pg.screenshot({ type: 'png' })).toString('base64');
    console.log(`screen ${s.file}  ${s.who.name}  ${path}`);
  }
  await ctx.close();
  return out;
}

const phone = await capture(SHOTS, { width: 390, height: 844 }, 3, true);
const tablet = await capture(TABLET, { width: 1024, height: 1366 }, 2, false);

// ── Compositions ──────────────────────────────────────────────────────────
const GROUNDS: Record<Ground, { bg: string; ink: string; sub: string; accent: string; bezel: string; logo: string }> = {
  blue:  { bg: SWAYVO.blue, ink: SWAYVO.white, sub: 'rgb(255 255 255 / 0.9)', accent: SWAYVO.peach, bezel: SWAYVO.ink, logo: LOGO_WHITE },
  white: { bg: SWAYVO.studio, ink: SWAYVO.ink, sub: '#3b4050', accent: SWAYVO.blue, bezel: SWAYVO.ink, logo: LOGO_INK },
  urban: { bg: '#0b0d16', ink: '#f3f4f8', sub: 'rgb(243 244 248 / 0.85)', accent: '#c6f432', bezel: '#2a2f45', logo: LOGO_WHITE },
};

/** The last word of a headline takes the ground's accent, as on the website. */
const headlineHtml = (h: string, accent: string) => {
  const i = h.trimEnd().lastIndexOf(' ');
  return `${h.slice(0, i + 1)}<span style="color:${accent}">${h.slice(i + 1)}</span>`;
};

/** Headline on top, then the device, cropped by the bottom edge. */
function compose(s: Shot, png: string, o: { W: number; H: number; pad: number; logoH: number; h1: number; line: number;
  screenW: number; ratio: number; bezel: number; radius: number; top: number }) {
  const g = GROUNDS[s.ground];
  const screenH = Math.round(o.screenW * o.ratio);
  return `
<div style="position:fixed;inset:0;width:${o.W}px;height:${o.H}px;background:${g.bg};color:${g.ink};overflow:hidden;font-family:var(--font-sans)">
  <div style="position:absolute;left:${o.pad}px;right:${o.pad}px;top:${Math.round(o.pad * 0.9)}px">
    ${g.logo.replace('<svg ', `<svg style="height:${o.logoH}px;width:auto;display:block" `)}
    <h1 style="margin:${Math.round(o.h1 * 0.5)}px 0 0;font-family:var(--font-display);font-weight:850;font-stretch:118%;font-size:${o.h1}px;line-height:0.94;letter-spacing:-0.025em;text-wrap:balance">${headlineHtml(s.headline, g.accent)}</h1>
    <p style="margin:${Math.round(o.line * 0.7)}px 0 0;font-size:${o.line}px;line-height:1.3;font-weight:500;color:${g.sub};text-wrap:balance">${s.line}</p>
  </div>
  <div style="position:absolute;left:${(o.W - o.screenW - o.bezel * 2) / 2}px;top:${o.top}px;width:${o.screenW + o.bezel * 2}px;height:${screenH + o.bezel * 2}px;background:${g.bezel};border-radius:${o.radius}px;padding:${o.bezel}px;box-sizing:border-box;box-shadow:0 40px 120px rgb(0 0 0 / ${s.ground === 'white' ? 0.18 : 0.35})">
    <img src="data:image/png;base64,${png}" style="display:block;width:${o.screenW}px;height:${screenH}px;border-radius:${o.radius - o.bezel}px;background:#fff" alt="">
  </div>
</div>`;
}

// Phone: the screen starts at 30% and runs off the bottom, so the top ~70% of the image is product.
const phoneLayout = { W: 1290, H: 2796, pad: 96, logoH: 52, h1: 104, line: 40, screenW: 1080, ratio: 844 / 390, bezel: 24, radius: 130, top: 840 };
const tabletLayout = { W: 2048, H: 2732, pad: 140, logoH: 64, h1: 128, line: 48, screenW: 1720, ratio: 1366 / 1024, bezel: 30, radius: 80, top: 760 };

const feature = () => `
<div style="position:fixed;inset:0;width:1024px;height:500px;background:${SWAYVO.blue};color:${SWAYVO.white};overflow:hidden;font-family:var(--font-sans)">
  <div style="position:absolute;left:64px;top:56px">${LOGO_WHITE.replace('<svg ', '<svg style="height:34px;width:auto;display:block" ')}</div>
  <h1 style="position:absolute;left:64px;top:140px;width:520px;margin:0;font-family:var(--font-display);font-weight:850;font-stretch:118%;font-size:68px;line-height:0.92;letter-spacing:-0.025em">Five, six, seven, <span style="color:${SWAYVO.peach}">eight.</span></h1>
  <p style="position:absolute;left:64px;top:330px;width:500px;margin:0;font-family:var(--font-display);font-weight:800;font-stretch:112%;font-size:28px;line-height:1.1">More time for dance.</p>
  <p style="position:absolute;left:64px;top:374px;width:470px;margin:0;font-size:19px;line-height:1.4;color:rgb(255 255 255 / 0.88)">Classes, registers, payments, messages and progress for dance schools.</p>
  <div style="position:absolute;left:640px;top:56px;width:${320 + 24}px;height:${Math.round(320 * 844 / 390) + 24}px;background:${SWAYVO.ink};border-radius:50px;padding:12px;box-sizing:border-box">
    <img src="data:image/png;base64,${phone['01-register']}" style="display:block;width:320px;height:${Math.round(320 * 844 / 390)}px;border-radius:40px" alt="">
  </div>
</div>`;

const og = () => `
<div style="position:fixed;inset:0;width:1200px;height:628px;background:${SWAYVO.blue};color:${SWAYVO.white};overflow:hidden;font-family:var(--font-sans)">
  <div style="position:absolute;left:72px;top:64px;height:40px">${LOGO_WHITE.replace('<svg ', '<svg style="height:40px;width:auto;display:block" ')}</div>
  <h1 style="position:absolute;left:72px;top:176px;width:640px;margin:0;font-family:var(--font-display);font-weight:850;font-stretch:118%;font-size:84px;line-height:0.92;letter-spacing:-0.025em">Five, six, seven, <span style="color:${SWAYVO.peach}">eight.</span></h1>
  <p style="position:absolute;left:72px;top:390px;width:600px;margin:0;font-family:var(--font-display);font-weight:800;font-stretch:112%;font-size:34px;line-height:1.1">More time for dance.</p>
  <p style="position:absolute;left:72px;top:446px;width:600px;margin:0;font-size:22px;line-height:1.4;color:rgb(255 255 255 / 0.88)">Classes, registers, payments, messages and progress for dance schools.</p>
  <div style="position:absolute;left:800px;top:64px;width:${336 + 24}px;height:${Math.round(336 * 844 / 390) + 24}px;background:${SWAYVO.ink};border-radius:52px;padding:12px;box-sizing:border-box">
    <img src="data:image/png;base64,${phone['01-register']}" style="display:block;width:336px;height:${Math.round(336 * 844 / 390)}px;border-radius:42px" alt="">
  </div>
</div>`;

// One page for every composition, loaded once: /design may set up the
// in-browser database on a visit, so each image replaces the body instead of
// navigating again.
const docCtx = await browser.newContext({ deviceScaleFactor: 1 });
const page = await docCtx.newPage();
page.setDefaultTimeout(600_000);
await page.goto(BASE + '/design');
await page.getByRole('heading', { name: 'Design system' }).waitFor({ timeout: 600_000 });
async function render(html: string, w: number, h: number, file: string) {
  await page.setViewportSize({ width: w, height: h });
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
}

for (const s of SHOTS) await render(compose(s, phone[s.file]!, phoneLayout), phoneLayout.W, phoneLayout.H, s.file);
for (const s of TABLET) await render(compose(s, tablet[s.file]!, tabletLayout), tabletLayout.W, tabletLayout.H, s.file);
await render(feature(), 1024, 500, 'feature-graphic');
await render(og(), 1200, 628, 'og');
await browser.close();
