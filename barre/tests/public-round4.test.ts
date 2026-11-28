/**
 * Round 4, public stream: the public face from the round-2 panel review
 * (docs/review/round2/REPORT.md): /welcome (U2), store images, the
 * school-branded install (F4), the wordmark (§7), the printed programme (F7),
 * email and notice templates (F15) and the onboarding count (F16).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { asUser, closeDb, rebuild, USERS } from './helpers';
import { MARK_BARS, ICON_BARS, ICON_BAR_W, BAR_W, THEME_COLOR, WORD_PATHS, WORD_STROKE, SWAYVO } from '../src/lib/swayvo-logo';
import { CONTACT_EMAIL, DEMO_PLANS, validEmail } from '../src/lib/site';
import {
  iconLayout, installIdentity, installPlatform, installSteps, manifestFor, shortNameFor, SWAYVO_IDENTITY,
} from '../src/lib/install-identity';
import {
  TEMPLATE_LABELS, dancersLine, esc, programmeHtml, renderMessage, safeImage, sampleMessage, type TemplateKind,
} from '../src/lib/branded-print';
import { SETUP_COUNTS, countSummary, setupCount } from '../src/lib/setup-count';
import { contrast } from '../src/lib/brand';

const ROOT = join(__dirname, '..');
const src = (p: string) => readFileSync(join(ROOT, p), 'utf8');

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/* ── Wordmark v2 ───────────────────────────────────────────────────────── */
describe('wordmark v2: the y–v gap, the o seam, the icon bars (REPORT §7.3)', () => {
  const dx = (i: number) => Number(/translate\(([\d.]+)/.exec(WORD_PATHS[i]!.transform ?? 'translate(0')![1]);
  // x of each stroke at the top of the x-height (y = 0), from the path data.
  const topXs = (i: number) => [...WORD_PATHS[i]!.d.matchAll(/[ML]([\d.]+) 0(?![\d.])/g)].map(m => Number(m[1]) + dx(i));

  it('the y–v pair is no tighter than the other pairs (5 units, was 1)', () => {
    const yRight = Math.max(...topXs(3)), vLeft = Math.min(...topXs(4));
    const yv = vLeft - yRight - WORD_STROKE;
    expect(yv).toBeGreaterThanOrEqual(4);
    // a–y for comparison: the a's stem at x 49, the y's first stroke at 5.
    const ay = Math.min(...topXs(3)) - (49 + dx(2)) - WORD_STROKE;
    expect(Math.abs(yv - ay)).toBeLessThanOrEqual(1);
    // v–o: the o's left edge is its centre minus the radius.
    const vo = (28 - 21 + dx(5)) - Math.max(...topXs(4)) - WORD_STROKE;
    expect(vo).toBeGreaterThanOrEqual(4);
  });

  it('bowls are closed half-circles, not one arc that stops short (no seam)', () => {
    for (const i of [2, 5]) {
      expect(WORD_PATHS[i]!.d).not.toMatch(/27\.9/);
      expect(WORD_PATHS[i]!.d).toMatch(/A21 21 0 0 1 7 28A21 21 0 0 1 49 28Z/);
    }
  });

  it('the app icon opens the gap between bars to 3 units; the in-app mark keeps 2', () => {
    const gap = (bars: typeof MARK_BARS, w: number) => Math.min(...[1, 2, 3, 5, 6, 7].map(i => bars[i]!.x - bars[i - 1]!.x - w));
    expect(gap(MARK_BARS, BAR_W)).toBe(2);
    expect(gap(ICON_BARS, ICON_BAR_W)).toBe(3);
    const svg = readFileSync(join(ROOT, 'public/brand/swayvo-app-icon.svg'), 'utf8');
    expect(svg).toContain(`width="${ICON_BAR_W}"`);
  });

  it('every generated asset carries the new geometry', () => {
    for (const f of ['swayvo-logo.svg', 'swayvo-wordmark.svg', 'swayvo-logo-white.svg', 'swayvo-logo-on-blue.svg']) {
      const svg = readFileSync(join(ROOT, 'public/brand', f), 'utf8');
      expect(svg, f).toContain('translate(259 0)');
      expect(svg, f).not.toContain('27.9');
    }
  });

  it('one browser-chrome colour: layout and manifest both use THEME_COLOR', () => {
    expect(THEME_COLOR).toBe(SWAYVO.white);
    expect(src('src/app/layout.tsx')).toMatch(/themeColor: THEME_COLOR/);
    expect(src('src/app/manifest.ts')).toMatch(/theme_color: THEME_COLOR/);
    expect(src('src/app/manifest.ts')).not.toMatch(/#2638f0/i);
  });
});

/* ── /welcome ──────────────────────────────────────────────────────────── */
describe('/welcome says only what is true (U2)', () => {
  const page = src('src/app/welcome/page.tsx') + src('src/app/welcome/parts.tsx');

  it('has no photo placeholders, card-payment claims, absolute claims or made-up address', () => {
    for (const bad of [/Photography:/, /nobody else/i, /\bRetry\b/, /Pay by card/i, /failed cards/i, /Card payments failed/i,
      /swayvo\.example/, /Only the school’s safeguarding lead can read/]) expect(page, bad.source).not.toMatch(bad);
  });

  it('shows no medical notes in the sample register', () => {
    for (const bad of [/eczema/i, /Allergy/i, /latex/i, /Emollient/i]) expect(src('src/app/welcome/parts.tsx'), bad.source).not.toMatch(bad);
  });

  it('adds Try the demo, a way in for families, the no-signal register and the owner reading the log', () => {
    expect(page).toMatch(/Try the demo/);
    expect(page).toMatch(/Looking for classes\?/);
    expect(page).toMatch(/href="\/join"/);
    expect(page).toMatch(/no signal/);
    expect(page).toMatch(/safeguarding lead and its owner can read the log/);
    expect(page).toMatch(/Demo pricing/);
  });

  it('the contact address is a setting; placeholder domains never show', () => {
    expect(validEmail('hello@swayvo.example')).toBeNull();
    expect(validEmail('  ')).toBeNull();
    expect(validEmail('not an address')).toBeNull();
    expect(validEmail('hello@swayvo.co.uk')).toBe('hello@swayvo.co.uk');
    expect(CONTACT_EMAIL).toBeNull();   // no address decided in this build
  });

  it('the pricing band shows the same plans the platform sets up', async () => {
    await asUser(null, async (_q, svc) => {
      const rows = await svc(`select code, name, price_minor, max_students, max_locations, max_staff from plan where not is_trial order by sort`);
      expect(rows.map((r: any) => ({ ...r }))).toEqual(DEMO_PLANS);
    });
  });
});

/* ── School-branded install ────────────────────────────────────────────── */
describe('the installed app is the school’s (F4)', () => {
  it('short names fit under a home-screen icon', () => {
    expect(shortNameFor('Northstar Dance Academy')).toBe('Northstar');
    expect(shortNameFor('The Kestrel Ballet School')).toBe('Kestrel');
    expect(shortNameFor('Hollybrook School of Dance')).toBe('Hollybrook');
    expect(shortNameFor('Pointe & Flex Dance Co')).toBe('Pointe');
    expect(shortNameFor('Ballet Barn')).toBe('Ballet Barn');
    expect(shortNameFor('Supercalifragilistic Dance')).toHaveLength(12);
  });

  it('a school gets its name, colour and initials; no school gets Swayvo', () => {
    expect(installIdentity(null)).toBe(SWAYVO_IDENTITY);
    expect(installIdentity({ name: '  ' })).toBe(SWAYVO_IDENTITY);
    const ns = installIdentity({ name: 'Northstar Dance Academy', brand_colour: '#1e3a8a', logo_url: 'data:image/png;base64,AAA', theme: 'classic' });
    expect(ns).toMatchObject({ school: true, shortName: 'Northstar', themeColor: '#ffffff', icon: { ground: '#1e3a8a', ink: '#ffffff', logo: 'data:image/png;base64,AAA', initials: 'N' } });
    const k = installIdentity({ name: 'Kestrel Ballet School', brand_colour: '#c6f432', theme: 'urban' });
    expect(k.themeColor).toBe('#0b0d16');           // the dark style's own chrome, as the page's meta uses
    expect(k.icon.ink).toBe('#000000');             // dark initials on lime
    expect(contrast(k.icon.ink, k.icon.ground)).toBeGreaterThanOrEqual(4.5);
    expect(k.icon.logo).toBeNull();
  });

  it('the manifest is standalone, scoped to the app, with a per-school id', () => {
    const icons = [{ src: 'data:image/png;base64,x', sizes: '192x192', type: 'image/png' }];
    const a = manifestFor(installIdentity({ name: 'Northstar Dance Academy' }), 'https://x.test', '/General', icons);
    const b = manifestFor(installIdentity({ name: 'Kestrel Ballet School' }), 'https://x.test', '/General', icons);
    expect(a).toMatchObject({ name: 'Northstar Dance Academy', short_name: 'Northstar', display: 'standalone',
      start_url: 'https://x.test/General/', scope: 'https://x.test/General/', icons });
    expect(a.id).not.toBe(b.id);
  });

  it('a maskable icon keeps the logo inside the safe circle', () => {
    for (const size of [180, 192, 512]) {
      const L = iconLayout(size, true);
      const r = Math.hypot(L.plate.size / 2, L.plate.size / 2);   // corner of the plate, from the centre
      expect(r).toBeLessThanOrEqual(size * 0.4 + 1);
      expect(L.logo.size).toBeLessThan(L.plate.size);
    }
  });

  it('install steps follow the phone', () => {
    const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
    const ipad = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15';
    expect(installPlatform(iphone)).toBe('ios');
    expect(installPlatform(ipad, 5)).toBe('ios');
    expect(installPlatform(ipad, 0)).toBe('desktop');
    expect(installPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile')).toBe('android');
    expect(installSteps('ios', 'Northstar').join(' ')).toMatch(/Share.*Add to Home Screen.*Northstar/);
    expect(installSteps('android', 'Northstar').join(' ')).toMatch(/Chrome.*Install app/);
    expect(installSteps('android', 'Northstar', true)[0]).toMatch(/below/);
  });

  it('a parent can read their school’s name, colour and logo for the install guide (RLS)', async () => {
    await asUser(USERS.guardianA, async q => {
      const rows = await q(`select name, brand_colour, logo_url, theme, brand_secondary from studio order by created_at limit 1`);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Northstar Dance Academy');
      expect(installIdentity(rows[0]).shortName).toBe('Northstar');
    });
  });

  it('the shell hands the chosen school to the install hook, and /family shows the guide', () => {
    expect(src('src/components/app/shell.tsx')).toMatch(/useBrandedInstall\(branded \? studio : null\)/);
    expect(src('src/app/family/page.tsx')).toMatch(/<InstallGuide \/>/);
    const pwa = src('src/components/app/pwa.tsx');
    for (const s of ['link[rel="manifest"]', 'link[rel="apple-touch-icon"]', 'meta[name="apple-mobile-web-app-title"]']) expect(pwa).toContain(s);
  });
});

/* ── The printed programme ─────────────────────────────────────────────── */
describe('the printed programme is the school’s (F7)', () => {
  const school = { name: 'Northstar Dance Academy', brand_colour: '#1e3a8a', logo_url: 'data:image/svg+xml;base64,PHN2Zy8+' };
  const html = programmeHtml({ school, autoPrint: false,
    event: { title: 'Summer <Showcase>', when: 'Saturday 11 July · 14:00', venue: 'Blackheath Halls' },
    rows: [{ routine: 'Shim Sham', class_name: 'Junior Tap', dancers: 'Nia Doherty', unnamed: 2 }] });

  it('carries the school name, logo and colour, Archivo and Inter, and the Swayvo sign-off', () => {
    expect(html).toContain('Northstar Dance Academy');
    expect(html).toContain(`src="${school.logo_url}"`);
    expect(html).toContain('#1e3a8a');
    expect(html).toMatch(/Archivo Variable/);
    expect(html).toMatch(/Inter Variable/);
    expect(html).toMatch(/powered by <svg[^>]+aria-label="Swayvo"/);
  });

  it('has none of the old palette or Georgia, here or in the button', () => {
    for (const s of [html, src('src/components/app/show-tools.tsx')]) {
      expect(s).not.toMatch(/Georgia/);
      expect(s).not.toMatch(/#14211e|#e4dbcc|#5b645e|#4e5a55/i);
    }
  });

  it('escapes what people typed and still only counts dancers without consent', () => {
    expect(html).toContain('Summer &lt;Showcase&gt;');
    expect(html).not.toContain('<Showcase>');
    expect(html).toContain('Nia Doherty and 2 dancers');
    expect(dancersLine({ dancers: null, unnamed: 1 })).toBe('1 dancer');
    expect(dancersLine({ dancers: null, unnamed: 0 })).toBe('');
    expect(html).not.toContain('<script>');
    expect(programmeHtml({ school, event: { title: 'x', when: 'y', venue: null }, rows: [] })).toMatch(/window\.print/);
  });

  it('without a logo it uses the school’s initials; a script URL is never used as a logo', () => {
    const plain = programmeHtml({ school: { name: 'Hollybrook School of Dance', brand_colour: '#6b2155', logo_url: 'javascript:alert(1)' },
      autoPrint: false, event: { title: 'x', when: 'y', venue: null }, rows: [] });
    expect(plain).not.toContain('javascript:');
    expect(plain).toMatch(/>H<\/span>/);
    expect(safeImage('https://cdn.test/logo.png')).toBe('https://cdn.test/logo.png');
    expect(safeImage('data:text/html,<b>')).toBeNull();
  });
});

/* ── Email and notice templates ────────────────────────────────────────── */
describe('branded email and notice templates (F15)', () => {
  const school = { name: 'Northstar Dance Academy', brand_colour: '#1e3a8a', contact_email: 'office@northstar.test' };
  const kinds = Object.keys(TEMPLATE_LABELS) as TemplateKind[];

  it('every template renders, school name first, the Notice word leading the subject', () => {
    expect(kinds).toHaveLength(6);
    for (const k of kinds) {
      const m = renderMessage(sampleMessage(k, school));
      expect(m.subject, k).toMatch(/^[A-Z][A-Z ]+(\d+ [A-Z]+)?: /);
      expect(m.text.split('\n')[0], k).toBe('Northstar Dance Academy');
      expect(m.html.indexOf('Northstar Dance Academy'), k).toBeLessThan(m.html.indexOf('Hi Hannah'));
      expect(m.html, k).toMatch(/Sent with Swayvo/);
      expect(m.html, k).not.toMatch(/!<|!\s*$/m);   // no exclamation marks in system text
    }
    expect(renderMessage(sampleMessage('class_moved', school)).subject).toMatch(/^MOVED: Grade 2 Ballet/);
    expect(renderMessage(sampleMessage('fee_due', school)).subject).toMatch(/^DUE 4 DEC: /);
    expect(renderMessage(sampleMessage('class_cancelled', school)).subject).toMatch(/^CANCELLED: /);
  });

  it('uses the school’s colour with readable text on its button, and escapes content', () => {
    const lime = renderMessage({ kind: 'invitation', school: { name: 'Kestrel Ballet School', brand_colour: '#c6f432' }, to: '<Elena>',
      title: 'Join & dance', detail: 'x', action: { label: 'Accept', url: 'https://k.test/invite?a=1&b=2' } });
    expect(lime.html).toContain('background:#c6f432;color:#000000');
    expect(contrast('#000000', '#c6f432')).toBeGreaterThanOrEqual(4.5);
    expect(lime.html).toContain('Hi &lt;Elena&gt;');
    expect(lime.html).toContain('Join &amp; dance');
    expect(lime.html).toContain('href="https://k.test/invite?a=1&amp;b=2"');
    expect(esc(`"'`)).toBe('&quot;&#39;');
  });

  it('no card-payment promises in sample content', () => {
    for (const k of kinds) expect(renderMessage(sampleMessage(k, school)).text).not.toMatch(/card/i);
  });
});

/* ── Onboarding count ──────────────────────────────────────────────────── */
describe('onboarding fills a count of eight (F16)', () => {
  const keys = [...src('src/app/onboarding/page.tsx').matchAll(/\{ key: '([a-z]+)'/g)].map(m => m[1]!);

  it('every setup step belongs to exactly one of the eight beats', () => {
    expect(SETUP_COUNTS).toHaveLength(8);
    const grouped = SETUP_COUNTS.flatMap(c => c.steps);
    expect(grouped.sort()).toEqual([...keys].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it('a beat fills in proportion and is full only when all its steps are done', () => {
    const none = setupCount(new Set());
    expect(none.every(b => b.fill === 0 && !b.complete)).toBe(true);
    expect(countSummary(none)).toBe('0 of 8 counts full · Your school next');
    const some = setupCount(new Set(['studio', 'brand', 'styles']));
    expect(some[0]).toMatchObject({ done: 1, total: 2, fill: 0.5, complete: false });
    expect(some[1]!.complete).toBe(true);
    expect(some[4]!.fill).toBeCloseTo(1 / 3);
    expect(countSummary(setupCount(new Set(keys)))).toMatch(/full count/);
  });
});

/* ── Store images ──────────────────────────────────────────────────────── */
describe('store images are current and complete (U2, REPORT §7.1)', () => {
  const dir = join(ROOT, 'public/brand/store');
  const size = (f: string) => { const b = readFileSync(join(dir, f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  const files = readdirSync(dir);

  it('phone, tablet, Android feature graphic and social sizes', () => {
    const phone = files.filter(f => /^0\d-.*\.png$/.test(f));
    const tablet = files.filter(f => /^tablet-.*\.png$/.test(f));
    expect(phone.length).toBeGreaterThanOrEqual(5);
    expect(tablet.length).toBeGreaterThanOrEqual(3);
    for (const f of phone) expect(size(f), f).toEqual([1290, 2796]);
    for (const f of tablet) expect(size(f), f).toEqual([2048, 2732]);
    expect(size('feature-graphic.png')).toEqual([1024, 500]);
    expect(size('og.png')).toEqual([1200, 628]);
  });

  it('the stale Today image is gone, and one image is the dark Urban style', () => {
    expect(existsSync(join(dir, '04-today.png'))).toBe(false);
    const script = src('scripts/store-shots.mts');
    expect(script).toMatch(/ground: 'urban'/);
    expect(script).toMatch(/ground: 'white'/);
    expect(script).toMatch(/clock\.install/);
    expect(script).toMatch(/Card payments failed/);   // the guard that warns about stale states
  });
});

