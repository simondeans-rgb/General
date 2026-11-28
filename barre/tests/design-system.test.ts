/* Round 2 design-system consolidation (U9, U1, brand panel governance):
   the lint that stops drift, and the one date rule. No database needed. */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error — a plain node script, without types
import { lint, noticeWords, isAllowedWord } from '../scripts/design-lint.mjs';
import { dayDate, dayDateTime, dayHeading, daysFromToday, relativeDay } from '../src/lib/format';

describe('design-system lint', () => {
  it('finds nothing in the app as it stands', () => {
    const problems = lint() as { file: string; line: number; rule: string; detail: string }[];
    expect(problems.map(p => `${p.file}:${p.line} ${p.rule} ${p.detail}`)).toEqual([]);
  });

  it('catches each kind of drift', () => {
    const root = mkdtempSync(join(tmpdir(), 'design-lint-'));
    mkdirSync(join(root, 'src/components/ui'), { recursive: true });
    mkdirSync(join(root, 'src/app/x'), { recursive: true });
    writeFileSync(join(root, 'src/components/ui/index.tsx'),
      readFileSync(join(__dirname, '../src/components/ui/index.tsx'), 'utf8'));
    writeFileSync(join(root, 'src/app/x/page.tsx'), [
      `export default function X() { return <div>`,
      `  <p style={{ color: '#ff0066' }} className="text-[13px]">Hi</p>`,
      `  <div role="tablist" aria-label="Tabs" />`,
      `  <Notice word="Done" title="Saved" />`,
      `  <Notice word={ok ? 'Moved' : 'Sorted'} title="x" />`,
      `  <Notice word="Due 4 Dec" title="Fees" />`,
      `  <Notice word={b.status === 'held' ? 'Held' : 'Booked'} title="ok" />`,
      `</div>; }`,
    ].join('\n'));
    const problems = lint(root) as { file: string; line: number; rule: string; detail: string }[];
    const got = problems.map(p => `${p.line} ${p.rule}`);
    expect(got).toEqual(expect.arrayContaining(['2 hex-colour', '2 px-font', '3 tablist', '4 notice-word', '5 notice-word']));
    // "Due 4 Dec", "Held", "Booked" and the compared 'held' are all fine.
    expect(problems.filter(p => p.rule === 'notice-word').map(p => p.detail.split('"')[1])).toEqual(['Done', 'Sorted']);
  });

  it('keeps the Notice words to changes and deadlines', () => {
    const words = noticeWords() as string[];
    expect(words).toEqual(expect.arrayContaining(['Moved', 'Cancelled', 'Changed', 'Clash', 'Due', 'New', 'Full', 'Paid', 'Offline']));
    for (const confirmation of ['Done', 'Saved', 'Sent', 'Imported', 'Shared', 'Added']) {
      expect(isAllowedWord(confirmation, words)).toBe(false);
    }
    expect(isAllowedWord('Due 10 Dec', words)).toBe(true);
    expect(words.length).toBeLessThanOrEqual(20);
  });
});

describe('the date rule', () => {
  // Saturday 28 November 2026, mid-morning in London.
  const now = new Date('2026-11-28T10:00:00Z');
  it('says Today, Tomorrow or Yesterday, otherwise the weekday and the date', () => {
    expect(relativeDay('2026-11-28T18:30:00Z', now)).toBe('Today');
    expect(relativeDay('2026-11-29T09:00:00Z', now)).toBe('Tomorrow');
    expect(relativeDay('2026-11-27T09:00:00Z', now)).toBe('Yesterday');
    // Thursday is five days away: never a bare "Thursday" (this week or next?).
    expect(relativeDay('2026-12-03T18:30:00Z', now)).toBe('Thu 3 Dec');
    expect(relativeDay('2026-12-10T18:30:00Z', now)).toBe('Thu 10 Dec');
    expect(relativeDay(new Date('2026-11-20T12:00:00Z'), now)).toBe('Fri 20 Nov');
  });
  it('adds the year only in another year, and the time after a comma', () => {
    expect(dayDate('2027-01-08T18:30:00Z', now)).toBe('Fri 8 Jan 2027');
    expect(dayDate('2026-12-03T18:30:00Z', now)).toBe('Thu 3 Dec');
    expect(dayDateTime('2026-12-03T18:30:00Z', now)).toBe('Thu 3 Dec, 18:30');
    expect(dayDateTime('2026-11-28T17:00:00Z', now)).toBe('Today, 17:00');
    expect(dayHeading('2026-11-29T17:00:00Z', now)).toBe('Tomorrow · 29 Nov');
  });
  it('counts days in the studio’s timezone, not the device’s', () => {
    // 23:30 UTC on 15 June 2026 is 00:30 on Tuesday 16 June in London (summer time).
    expect(daysFromToday('2026-06-15T23:30:00Z', new Date('2026-06-15T12:00:00Z'))).toBe(1);
    expect(relativeDay('2026-06-15T23:30:00Z', new Date('2026-06-15T12:00:00Z'))).toBe('Tomorrow');
  });
});
