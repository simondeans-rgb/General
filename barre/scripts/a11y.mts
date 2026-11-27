/**
 * Accessibility checks (R-039): every main screen, for each role, through
 * axe-core in a real browser. Fails on serious or critical WCAG 2.2 AA
 * violations.
 *
 *   npx next dev -p 3000 &   (or serve the static export)
 *   BASE_URL=http://localhost:3000 npx tsx scripts/a11y.mts
 *
 * Automated checks find perhaps a third of real problems; the screen-reader
 * and keyboard review in docs/ACCESSIBILITY.md covers the rest.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { uid, NS, OTHER_STUDIOS } from '../src/lib/db/seed/data';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const ROUTES: [number | null, string, string, string[], string?][] = [
  [null, '', '', ['/', '/welcome', '/join?school=northstar']],
  [1, 'owner', 'Freya', ['/today', '/schedule', '/classes', '/events', '/people', '/enrolment', '/inbox', '/requests', '/billing',
                         '/reports', '/studio', '/safeguarding', '/account', '/onboarding']],
  [2, 'teacher', 'Marcus', ['/teach', '/teach/students', '/teach/messages', '/teach/material', '/teach/reports']],
  [11, 'guardian', 'Hannah', ['/family', '/family/schedule', '/family/messages', '/family/payments', '/family/children', '/family/events']],
  // The dark Urban style, through a teacher who also teaches at Kestrel.
  [3, 'teacher', 'Priya', ['/teach', '/teach/students', '/teach/messages'], OTHER_STUDIOS.kestrel],
];

const browser = await chromium.launch();
let serious = 0;
for (const mobile of [false, true]) {
  const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const [n, role, name, paths, studio] of ROUTES) {
    await page.goto(BASE + '/');
    await page.evaluate(([k, v]: string[]) => v ? localStorage.setItem(k, v) : localStorage.removeItem(k),
      [process.env.SESSION_KEY ?? 'barre.session.v1', n ? JSON.stringify({ userId: uid(NS.user, n), role, name, ...(studio ? { studio } : {}) }) : '']);
    for (const path of paths) {
      await page.goto(BASE + path);
      await page.waitForFunction(() => !/Setting up (Northstar|a real)/.test(document.body.innerText), null, { timeout: 120_000 });
      await page.waitForTimeout(1500);
      await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(async () => (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      }));
      const bad = res.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical');
      serious += bad.reduce((k: number, v: any) => k + v.nodes.length, 0);
      const label = `${mobile ? 'phone' : 'desktop'} ${role || 'public'}${studio ? ' (urban)' : ''} ${path}`;
      if (!res.violations.length) { console.log(`ok   ${label}`); continue; }
      for (const v of res.violations) {
        console.log(`${v.impact === 'serious' || v.impact === 'critical' ? 'FAIL' : 'warn'} ${label} — ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) console.log(`       ${node.target.join(' ')} ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
      }
    }
  }
  await ctx.close();
}
await browser.close();
console.log(serious ? `\n${serious} serious or critical issues` : '\nNo serious or critical issues');
process.exit(serious ? 1 : 0);
