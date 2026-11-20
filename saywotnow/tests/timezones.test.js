// AC-16: time zone converter, including daylight-saving edge cases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parts, offsetMinutes, wallToInstant, offsetLabel, band, dayOffset, describe, meetingGrid, summaryText, time24, abbreviation } from '../src/lib/calc/timezones.js';

const T = (s) => Date.parse(s);
const at = (tz, ms) => time24(parts(tz, ms));

test('tz 1: the seven default regions in winter', () => {
  const ms = T('2026-11-17T12:00:00Z');
  assert.equal(at('Europe/London', ms), '12:00');
  assert.equal(at('America/New_York', ms), '07:00');
  assert.equal(at('Europe/Paris', ms), '13:00');
  assert.equal(at('Asia/Dubai', ms), '16:00');
  assert.equal(at('Asia/Kolkata', ms), '17:30');
  assert.equal(at('Asia/Shanghai', ms), '20:00');
  assert.equal(at('Australia/Sydney', ms), '23:00');
  assert.equal(offsetMinutes('Australia/Sydney', ms), 660);
});

test('tz 2: summer time on both sides of the world', () => {
  const ms = T('2026-07-01T12:00:00Z');
  assert.equal(at('Europe/London', ms), '13:00');
  assert.equal(at('America/New_York', ms), '08:00');
  assert.equal(at('Australia/Sydney', ms), '22:00');
  assert.equal(abbreviation('Europe/London', ms), 'BST');
  assert.equal(abbreviation('Europe/London', T('2026-11-17T12:00:00Z')), 'GMT');
});

test('tz 3: setting a wall-clock time in another zone', () => {
  const ms = wallToInstant('America/New_York', 2026, 11, 17, 9, 0);
  assert.equal(new Date(ms).toISOString(), '2026-11-17T14:00:00.000Z');
  assert.equal(at('Asia/Kolkata', ms), '19:30');
});

test('tz 4: a time skipped when the clocks go forward moves past the change', () => {
  const ms = wallToInstant('Europe/London', 2026, 3, 29, 1, 30);
  assert.equal(at('Europe/London', ms), '02:30');
  const ok = wallToInstant('Europe/London', 2026, 3, 29, 3, 0);
  assert.equal(new Date(ok).toISOString(), '2026-03-29T02:00:00.000Z');
});

test('tz 5: a repeated time when the clocks go back still shows that time', () => {
  const ms = wallToInstant('Europe/London', 2026, 10, 25, 1, 30);
  assert.equal(at('Europe/London', ms), '01:30');
});

test('tz 6: day offsets', () => {
  assert.equal(dayOffset('Australia/Sydney', 'Europe/London', T('2026-11-17T14:00:00Z')), '+1 day');
  assert.equal(dayOffset('America/New_York', 'Europe/London', T('2026-11-17T02:00:00Z')), '−1 day');
  assert.equal(dayOffset('Europe/Paris', 'Europe/London', T('2026-11-17T12:00:00Z')), '');
});

test('tz 7: working-hours bands (green 08–18, amber 07–08 and 18–20, grey otherwise)', () => {
  const p = (h, mi, wd = 'Tue') => ({ h, mi, wd });
  assert.equal(band(p(6, 59)).level, 'off');
  assert.equal(band(p(7, 30)).level, 'edge');
  assert.equal(band(p(8, 0)).level, 'work');
  assert.equal(band(p(17, 59)).level, 'work');
  assert.equal(band(p(18, 0)).level, 'edge');
  assert.equal(band(p(19, 59)).level, 'edge');
  assert.equal(band(p(20, 0)).level, 'off');
  assert.deepEqual(band(p(10, 0, 'Sat')), { level: 'off', label: 'Weekend' });
});

test('tz 8: offset labels', () => {
  assert.equal(offsetLabel(0), 'UTC+0');
  assert.equal(offsetLabel(330), 'UTC+5:30');
  assert.equal(offsetLabel(-300), 'UTC−5');
  assert.equal(offsetLabel(345), 'UTC+5:45');
});

test('tz 9: meeting grid finds the shared working hours', () => {
  const g = meetingGrid('Europe/London', ['Europe/London', 'America/New_York'], T('2026-11-17T10:00:00Z'));
  assert.equal(g.length, 24);
  const shared = g.filter((c) => c.shared).map((c) => parts('Europe/London', c.instant).h);
  assert.deepEqual(shared, [13, 14, 15, 16, 17]);
  const none = meetingGrid('Europe/London', ['Europe/London', 'Australia/Sydney'], T('2026-11-17T10:00:00Z'));
  assert.equal(none.filter((c) => c.shared).length, 0);
});

test('tz 10: meeting grid has 23 or 25 hours on clock-change days', () => {
  assert.equal(meetingGrid('Europe/London', ['Europe/London'], T('2026-03-29T12:00:00Z')).length, 23);
  assert.equal(meetingGrid('Europe/London', ['Europe/London'], T('2026-10-25T12:00:00Z')).length, 25);
});

test('tz 11: describe and summary text', () => {
  const ms = T('2026-11-17T14:00:00Z');
  const d = describe('Australia/Sydney', 'Europe/London', ms);
  assert.equal(d.time, '01:00'); assert.equal(d.date, 'Wed 18 Nov'); assert.equal(d.dayOffset, '+1 day'); assert.equal(d.offset, 'UTC+11');
  const text = summaryText('Europe/London', ['America/New_York', 'Australia/Sydney'], ms, (tz) => ({ 'Europe/London': 'London', 'America/New_York': 'New York', 'Australia/Sydney': 'Sydney' })[tz]);
  assert.equal(text, '14:00 London time (Tuesday 17 Nov) is:\nNew York (EST): 09:00, Tue 17 Nov\nSydney (AEDT): 01:00, Wed 18 Nov (+1 day)');
});
