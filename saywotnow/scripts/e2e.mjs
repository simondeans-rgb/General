// End-to-end checks against the acceptance criteria (spec Section 16), in Chromium.
// Usage: node scripts/e2e.mjs [--shots <dir>]
// Needs Playwright with Chromium. Starts its own static server on a free port.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(root, p));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const results = [];
let failures = 0;

async function check(name, fn) {
  try { await fn(); results.push(`  ✓ ${name}`); }
  catch (e) { failures++; results.push(`  ✗ ${name}\n      ${String(e.message || e).split('\n').slice(0, 4).join('\n      ')}`); }
}

async function newApp({ dark = false, onboarded = true, prefs = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: dark ? 'dark' : 'light', permissions: ['clipboard-read', 'clipboard-write'], serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const log = { errors: [], external: [], mailto: [] };
  page.on('pageerror', (e) => log.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  ctx.on('request', (r) => { if (!r.url().startsWith(BASE)) log.external.push(r.url()); });
  // Capture mail hand-offs instead of opening a mail app.
  await page.exposeFunction('__mailto', (href) => log.mailto.push(href));
  await page.addInitScript((p) => {
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { if (/^(mailto|tel):/.test(this.href)) { window.__mailto(this.href); return; } return orig.call(this); };
    if (p) {
      try {
        if (!localStorage.getItem('saywotnow.prefs.v1')) localStorage.setItem('saywotnow.prefs.v1', JSON.stringify(p));
      } catch { /* ignore */ }
    }
  }, onboarded ? { onboardingComplete: true, disclaimerAcceptedVersion: '1.0', ...prefs } : null);
  await page.goto(BASE);
  await page.waitForSelector(onboarded ? '.tabbar' : '.onboarding');
  return { ctx, page, log };
}

async function shot(page, name) {
  if (shotsDir) await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: false });
}

async function fillHeader(page) {
  await page.fill('#f-employeeName', 'Sam Patel');
  await page.fill('#f-employeeEmail', 'sam@example.co.uk');
  await page.fill('#f-managerName', 'Jo Smith');
}

const pick = (page, field, option) => page.locator(`[data-field="${field}"]`).getByRole('radio', { name: option, exact: true }).check();

const dialog = (page) => page.locator('[role="dialog"], [role="alertdialog"]');

/* ------------------------------------------------------------------ */

await check('S01 onboarding: 3 pages then a disclaimer that must be accepted', async () => {
  const { ctx, page } = await newApp({ onboarded: false });
  await shot(page, '01-onboarding');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Before you start' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Skip' }).count(), 0, 'disclaimer page cannot be skipped');
  await shot(page, '02-disclaimer');
  await page.getByRole('button', { name: 'I understand' }).click();
  await page.waitForSelector('.tabbar');
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('saywotnow.prefs.v1')));
  assert.equal(prefs.onboardingComplete, true);
  assert.equal(prefs.disclaimerAcceptedVersion, '1.0');
  await page.reload(); await page.waitForSelector('.tabbar');
  await ctx.close();
});

await check('AC-01/06/07: run a 1:1, validation, preview content, send clears the form', async () => {
  const { ctx, page, log } = await newApp();
  await shot(page, '03-home');
  await page.getByRole('link', { name: 'Run a 1:1' }).click();
  await page.getByRole('heading', { name: '1:1 Meeting' }).waitFor();
  // AC-07: can't proceed, first invalid field focused. (aria-disabled, but still tappable to show errors.)
  await page.getByRole('button', { name: 'Preview & send' }).click({ force: true });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'f-employeeName');
  assert.ok(await page.locator('#f-employeeName-err').isVisible());
  assert.match(page.url(), /#\/template\/T01$/);
  await shot(page, '04-form-errors');
  await fillHeader(page);
  await page.getByRole('button', { name: '4 Good' }).click();
  await page.fill('#f-wins', 'Launched the new onboarding process on time.');
  await page.fill('#f-priorities', 'Finalise Q1 plan.');
  await page.getByRole('switch', { name: 'Include Priorities in the email' }).click();
  await page.getByRole('button', { name: 'Add an action' }).click();
  await page.fill('#f-actions-0-action', 'Share draft Q1 plan');
  await page.locator('.row-card').getByRole('radio', { name: 'Employee', exact: true }).check();
  await shot(page, '05-form-filled');
  await page.getByRole('button', { name: 'Preview & send' }).click();
  await page.getByRole('heading', { name: 'Check and send' }).waitFor();
  const body = await page.locator('.email-body').innerText();
  assert.match(body, /How are you feeling at the moment\? 4\/5 – Good/);
  assert.match(body, /WINS\n\nLaunched/);
  assert.doesNotMatch(body, /PRIORITIES|Finalise/, 'switched-off section left out');
  assert.doesNotMatch(body, /BLOCKERS|DEVELOPMENT|FEEDBACK/, 'empty sections left out');
  assert.match(body, /1\. Share draft Q1 plan – Owner: Employee/);
  await shot(page, '06-preview');
  await page.getByRole('button', { name: 'Open in Mail' }).click();
  await page.waitForTimeout(100);
  assert.equal(log.mailto.length, 1);
  assert.match(log.mailto[0], /^mailto:sam@example\.co\.uk\?subject=1%3A1%20summary/);
  await page.getByRole('alertdialog', { name: 'Did your email send?' }).or(dialog(page).filter({ hasText: 'Did your email send?' })).first().waitFor({ timeout: 5000 });
  await shot(page, '07-did-it-send');
  await page.getByRole('button', { name: 'Yes, clear the form' }).click();
  await page.getByText("Sent. SayWotNow hasn't kept a copy.").waitFor();
  assert.match(page.url(), /#\/$/);
  // AC-01: reopening shows an empty form.
  await page.getByRole('link', { name: 'Run a 1:1' }).click();
  assert.equal(await page.inputValue('#f-employeeName'), '');
  assert.equal(await page.inputValue('#f-wins'), '');
  assert.deepEqual(log.external, []);
  await ctx.close();
});

await check('AC-02: reload/force-quit loses form data; nothing typed is in storage or the URL', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T01');
  await fillHeader(page);
  await page.fill('#f-wins', 'SECRET-NOTE-123');
  const stored = await page.evaluate(() => JSON.stringify({ ls: { ...localStorage }, ss: { ...sessionStorage }, url: location.href, cookies: document.cookie }));
  assert.doesNotMatch(stored, /Sam Patel|SECRET-NOTE|sam@example/);
  await page.reload();
  await page.waitForSelector('.tabbar, .form-screen');
  await page.goto(BASE + '#/template/T01');
  assert.equal(await page.inputValue('#f-employeeName'), '');
  assert.equal(await page.inputValue('#f-wins'), '');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  assert.deepEqual(keys, ['saywotnow.prefs.v1']);
  await ctx.close();
});

await check('AC-03: privacy cover when the app goes to the background', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T01');
  await page.fill('#f-employeeName', 'Sam Patel');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.locator('.privacy-cover').waitFor();
  await shot(page, '08-privacy-cover');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.locator('.privacy-cover').waitFor({ state: 'detached' });
  await ctx.close();
});

await check('AC-08: T03 related to work shows the amber banner; clearing removes it', async () => {
  const { ctx, page } = await newApp();
  await page.getByRole('link', { name: 'Return to work' }).click();
  await pick(page, 'workRelated', 'Yes');
  await page.getByText('This return to work may need HR advice').waitFor();
  assert.ok(await page.locator('.notice-2').first().isVisible());
  await shot(page, '09-t03-flag');
  await pick(page, 'workRelated', 'No');
  assert.equal(await page.getByText('This return to work may need HR advice').count(), 0);
  await ctx.close();
});

await check('AC-09: T04 probation extended makes new end date visible and required', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T04');
  await fillHeader(page);
  assert.equal(await page.locator('[data-field="outcome"]').count(), 0);
  await pick(page, 'reviewType', 'Final');
  await pick(page, 'outcome', 'Probation extended');
  await page.locator('[data-field="newEnd"]').waitFor();
  await page.getByText('Contact HR before confirming this outcome').waitFor();
  await page.getByRole('button', { name: 'Preview & send' }).click({ force: true });
  await page.waitForTimeout(100);
  assert.ok(await page.locator('#f-startDate-err').isVisible());
  assert.ok(await page.locator('#f-newEnd-err').isVisible());
  await ctx.close();
});

await check('T04 "Not confirming" sends to HR only', async () => {
  const { ctx, page, log } = await newApp({ prefs: { hrContactEmail: 'hr@example.co.uk' } });
  await page.goto(BASE + '#/template/T04');
  await fillHeader(page);
  await page.fill('#f-startDate', '2026-06-01');
  await page.fill('#f-probationEnd', '2026-12-01');
  await pick(page, 'reviewType', 'Final');
  await pick(page, 'outcome', 'Not confirming – contact HR');
  await page.getByRole('button', { name: 'Preview & send' }).click();
  await page.getByRole('button', { name: 'Send to HR only' }).click();
  assert.match(log.mailto[0], /^mailto:hr@example\.co\.uk\?subject=For%20HR%20advice/);
  await ctx.close();
});

await check('AC-10: leaving a form with data asks; leaving an empty form does not', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T02');
  await page.getByRole('button', { name: 'Back' }).click();
  await page.waitForTimeout(150);
  assert.equal(await dialog(page).count(), 0);
  await page.goto(BASE + '#/template/T02');
  await page.fill('#f-employeeName', 'Sam');
  await page.getByRole('button', { name: 'Back' }).click();
  await dialog(page).filter({ hasText: 'Leave this form?' }).waitFor();
  await shot(page, '10-discard');
  await page.getByRole('button', { name: 'Keep editing' }).click();
  assert.equal(await page.inputValue('#f-employeeName'), 'Sam');
  // Browser back button is guarded too.
  await page.goBack();
  await dialog(page).filter({ hasText: 'Leave this form?' }).waitFor();
  await page.getByRole('button', { name: 'Discard' }).click();
  await page.waitForTimeout(150);
  assert.doesNotMatch(page.url(), /template/);
  await page.goto(BASE + '#/template/T02');
  assert.equal(await page.inputValue('#f-employeeName'), '');
  await ctx.close();
});

await check('Full/Quick switch keeps shared values', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T01');
  await page.fill('#f-employeeName', 'Sam Patel');
  await page.fill('#f-priorities', 'Q1');
  await page.locator('.mode-switch').getByRole('radio', { name: 'Quick' }).check();
  await page.getByRole('heading', { name: 'Quick Check-in' }).waitFor();
  assert.equal(await page.inputValue('#f-employeeName'), 'Sam Patel');
  assert.equal(await page.inputValue('#f-priorities'), 'Q1');
  await ctx.close();
});

await check('AC-11: Share/Copy fallbacks; copy then "Clear the form now?"', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/template/T02');
  await fillHeader(page);
  await page.getByRole('button', { name: 'Preview & send' }).click();
  await page.getByRole('button', { name: 'No mail app?' }).click();
  await shot(page, '11-fallbacks');
  await page.getByRole('button', { name: 'Copy to clipboard' }).click();
  await dialog(page).filter({ hasText: 'Clear the form now?' }).waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(clip, /^Subject: Check-in summary – Sam Patel/);
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.waitForTimeout(150);
  assert.match(page.url(), /#\/$/);
  await ctx.close();
});

await check('AC-12/13: G02 Write summary opens T08 pre-filled; Email HR has no employee details', async () => {
  const { ctx, page, log } = await newApp({ prefs: { hrContactEmail: 'hr@example.co.uk', hrContactPhone: '020 7946 0000' } });
  await page.getByRole('link', { name: 'Conversations' }).click();
  await page.getByRole('link', { name: 'Lateness and timekeeping' }).click();
  await shot(page, '12-guide-before');
  await page.getByRole('tab', { name: 'During' }).click();
  await shot(page, '13-guide-during');
  await page.getByRole('button', { name: 'Email HR' }).click();
  assert.equal(log.mailto[0], 'mailto:hr@example.co.uk?subject=Advice%20needed%20%E2%80%93%20Lateness%20and%20timekeeping&body=Hi%2C%20I%27d%20like%20some%20advice%20about%20a%20lateness%20and%20timekeeping%20situation%20with%20a%20member%20of%20my%20team.%20Please%20could%20you%20get%20in%20touch%3F%20Thanks.');
  await page.getByRole('tab', { name: 'After' }).click();
  await page.getByRole('button', { name: 'Write summary' }).click();
  await page.getByRole('heading', { name: 'Conversation Summary' }).waitFor();
  assert.equal(await page.inputValue('#f-topic'), 'Lateness and timekeeping');
  assert.match(await page.getAttribute('#f-discussed', 'placeholder'), /expected start\/finish times/);
  await shot(page, '14-t08');
  await ctx.close();
});

await check('G06 shows the urgent 999 banner; G03 shows a notice before the summary', async () => {
  const { ctx, page } = await newApp();
  await page.goto(BASE + '#/guide/G06');
  await page.getByRole('tab', { name: 'During' }).click();
  await page.getByText('If someone is at risk of harming themselves or others, call 999.').waitFor();
  assert.equal(await page.getByRole('link', { name: 'Call 999' }).getAttribute('href'), 'tel:999');
  await page.goto(BASE + '#/guide/G03');
  await page.getByRole('tab', { name: 'After' }).click();
  await page.getByRole('button', { name: 'Write summary' }).click();
  await dialog(page).filter({ hasText: 'If this matter may become formal' }).waitFor();
  await page.getByRole('button', { name: 'Not now' }).click();
  assert.match(page.url(), /guide\/G03/);
  await ctx.close();
});

await check('AC-14: search "late" → G02, "sick" → G05 and T03', async () => {
  const { ctx, page } = await newApp();
  await page.getByRole('link', { name: 'Search guides, templates and tools' }).click();
  await page.fill('input[type=search]', 'late');
  await page.getByRole('link', { name: /Lateness and timekeeping/ }).waitFor();
  await page.fill('input[type=search]', 'sick');
  await page.getByRole('link', { name: /Frequent short-term sickness absence/ }).waitFor();
  await page.getByRole('link', { name: /Return to Work/ }).waitFor();
  await shot(page, '15-search');
  await page.fill('input[type=search]', 'qqqzzz');
  await page.getByText('No results.').waitFor();
  assert.doesNotMatch(page.url(), /sick|qqq/);
  await ctx.close();
});

await check('AC-15: favourites persist after restart and appear on Home', async () => {
  const { ctx, page } = await newApp();
  await page.getByRole('link', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Add to favourites: Giving feedback' }).click();
  await page.getByRole('link', { name: 'Meetings' }).click();
  await page.getByRole('button', { name: 'Add to favourites: Stay Interview' }).click();
  await page.goto(BASE + '#/');
  await page.reload();
  await page.waitForSelector('.tabbar');
  await page.locator('.fav-card', { hasText: 'Giving feedback' }).waitFor();
  await page.locator('.fav-card', { hasText: 'Stay Interview' }).waitFor();
  await shot(page, '16-home-favourites');
  await ctx.close();
});

await check('Tools: holiday, notice, Bradford, SBI work; inputs clear on leaving', async () => {
  const { ctx, page } = await newApp({ prefs: { bradfordBands: [{ from: '0', to: '49', label: 'No action' }, { from: '50', to: '', label: 'Review' }] } });
  await page.goto(BASE + '#/tool/holiday');
  await page.fill('#h-emp', '3');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await page.locator('.big-number', { hasText: '17' }).waitFor();
  await shot(page, '17-holiday');
  await page.goto(BASE + '#/tool/notice');
  await page.fill('#n-sd', '2020-01-15');
  await page.fill('#n-nd', '2026-11-16');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await page.getByText('Monday 28 December 2026').waitFor();
  await page.goto(BASE + '#/tool/bradford');
  await page.fill('#sp-0', '1');
  await page.getByRole('button', { name: 'Add a spell' }).click();
  await page.fill('#sp-1', '2');
  await page.getByText('Band: 0–49: No action').waitFor();
  await page.locator('.big-number', { hasText: '12' }).waitFor();
  await shot(page, '18-bradford');
  await page.goto(BASE + '#/tool/sbi');
  await page.fill('#sbi-situation', 'the team meeting');
  await page.fill('#sbi-behaviour', 'you interrupted Priya');
  await page.fill('#sbi-impact', 'she stopped contributing');
  await page.getByText('In the team meeting, I noticed you interrupted Priya. The impact was she stopped contributing.').waitFor();
  await page.goto(BASE + '#/tool/holiday');
  assert.equal(await page.inputValue('#h-emp'), '');
  await ctx.close();
});

await check('AC-04/05: works offline after first load; no external requests', async () => {
  const { ctx, page, log } = await newApp();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); // page is now controlled by the service worker
  await page.waitForSelector('.tabbar');
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('.tabbar');
  for (const path of ['#/template/T05', '#/guide/G15', '#/reactions', '#/tool/notice', '#/page/privacy', '#/settings']) {
    await page.goto(BASE + path);
    await page.locator('#main h1').first().waitFor();
  }
  assert.deepEqual(log.external, []);
  assert.deepEqual(log.errors.filter((e) => !/Failed to load resource/.test(e)), []);
  await ctx.close();
});

await check('AC-18: dark mode renders (screenshots)', async () => {
  const { ctx, page } = await newApp({ dark: true });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(bg, 'rgb(22, 13, 31)');
  await shot(page, '19-dark-home');
  await page.goto(BASE + '#/guide/G05');
  await page.getByRole('tab', { name: 'During' }).click();
  await shot(page, '20-dark-guide');
  await page.goto(BASE + '#/template/T03');
  await pick(page, 'workRelated', 'Not sure');
  await shot(page, '21-dark-form');
  await page.goto(BASE + '#/settings');
  await shot(page, '22-dark-settings');
  await ctx.close();
});

await check('Accessibility basics: every input has a label; buttons have names', async () => {
  const { ctx, page } = await newApp();
  for (const path of ['#/template/T01', '#/template/T03', '#/template/T05', '#/tool/holiday', '#/tool/notice', '#/settings', '#/guide/G01']) {
    await page.goto(BASE + path);
    await page.locator('#main h1').first().waitFor();
    const missing = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('input:not([type=hidden]), textarea, select, button')) {
        const name = el.getAttribute('aria-label') || (el.labels && [...el.labels].map((l) => l.textContent).join('')) || el.textContent || el.getAttribute('aria-labelledby');
        if (!name || !name.trim()) bad.push(el.outerHTML.slice(0, 80));
      }
      return bad;
    });
    assert.deepEqual(missing, [], path);
  }
  await ctx.close();
});

await check('No console errors during a full session', async () => {
  const { ctx, page, log } = await newApp();
  for (const path of ['#/', '#/meetings', '#/conversations', '#/toolkit', '#/search', '#/template/T06', '#/template/T07', '#/guide/G07', '#/tool/timezones', '#/page/about', '#/page/content', '#/onboarding/replay']) {
    await page.goto(BASE + path);
    await page.waitForTimeout(80);
  }
  assert.deepEqual(log.errors, []);
  assert.deepEqual(log.external, []);
  await ctx.close();
});

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(failures ? `\n${failures} check(s) failed.` : '\nAll end-to-end checks passed.');
process.exit(failures ? 1 : 0);
