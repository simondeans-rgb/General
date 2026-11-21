// P2.4 calendar export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { createFormState } from '../src/lib/engine.js';
import { buildIcs, calendarEvents, escapeText, fold } from '../src/lib/ics.js';

const c = loadContentSync();
const T = (id) => c.templateById[id];
const NOW = new Date(Date.UTC(2026, 10, 21, 9, 30, 0));
function state(id, extra = {}) {
  const s = createFormState(T(id), c.header, {}, NOW);
  Object.assign(s.values, { employeeName: 'Sam Patel', employeeEmail: 'sam@example.co.uk', managerName: 'Jo Smith' }, extra);
  return s;
}
let n = 0;
const uid = () => `u${++n}`;

test('agreed dates and action due dates become all-day events, in date order', () => {
  const s = state('T01', { nextDate: '2026-12-07', actions: [{ action: 'Share the Q1 plan', owner: 'Employee', due: '2026-11-28' }, { action: 'No date', owner: '', due: '' }] });
  const ev = calendarEvents(T('T01'), s);
  assert.deepEqual(ev.map((e) => [e.date, e.title]), [['2026-11-28', 'Action due (1:1 Meeting)'], ['2026-12-07', '1:1']]);
});

test('by default there are no names or action wording; detailed adds them', () => {
  const s = state('T01', { nextDate: '2026-12-07', actions: [{ action: 'Book first-aid course', owner: 'Employee', due: '2026-11-28' }] });
  const plain = JSON.stringify(calendarEvents(T('T01'), s));
  assert.doesNotMatch(plain, /Sam|Patel|first-aid/);
  const detailed = calendarEvents(T('T01'), s, { detailed: true });
  assert.equal(detailed[0].title, 'Action due: Book first-aid course – Sam');
  assert.equal(detailed[1].title, '1:1 – Sam');
});

test('a valid VCALENDAR: CRLF line ends, all-day dates, end is the next day (month and year ends)', () => {
  const ics = buildIcs([{ date: '2026-12-31', title: 'Review', description: 'x' }, { date: '2028-02-28', title: 'Leap', description: '' }], { now: NOW, uid });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.doesNotMatch(ics.replace(/\r\n/g, ''), /\n/, 'only CRLF line breaks');
  assert.match(ics, /DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101/);
  assert.match(ics, /DTSTART;VALUE=DATE:20280228\r\nDTEND;VALUE=DATE:20280229/);
  assert.match(ics, /DTSTAMP:20261121T093000Z/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.match(ics, /UID:u\d+@saywotnow\.app/);
});

test('text is escaped and long lines are folded at 75 octets without breaking characters', () => {
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\;c\\\\d\\ne');
  const long = `SUMMARY:${'Action due: '.padEnd(70, 'é')}`;
  const folded = fold(long);
  for (const line of folded.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
  assert.equal(folded.replace(/\r\n /g, ''), long);
});

test('dates come from content: every template with a follow-up date offers it', () => {
  assert.equal(calendarEvents(T('T03'), state('T03', { followUp: '2026-12-01', reason: 'x', fitNote: 'Provided' }))[0].title, 'Return to work follow-up');
  assert.equal(calendarEvents(T('T08'), state('T08', { topic: 't', discussed: 'd', reviewDate: '2027-01-10' }))[0].title, 'Review of agreed points');
  assert.deepEqual(calendarEvents(T('T06'), state('T06', {})), []);
});
