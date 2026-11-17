import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { createFormState, validateForm, activeFlags, sendMode, activeFields, switchTemplate, isDirty, isValidEmail } from '../src/lib/engine.js';

const c = loadContentSync();
const NOW = new Date(2026, 10, 16, 9, 0);
const T = (id) => c.templateById[id];
function filled(id, extra = {}, ctx = {}) {
  const s = createFormState(T(id), c.header, ctx, NOW);
  Object.assign(s.values, { employeeName: 'Sam Patel', employeeEmail: 'sam@example.co.uk', managerName: 'Jo Smith' }, extra);
  return s;
}
const ids = (errs) => errs.map((e) => e.fieldId);

test('meeting date defaults to today and the form starts clean', () => {
  const s = createFormState(T('T01'), c.header, {}, NOW);
  assert.equal(s.values.meetingDate, '2026-11-16');
  assert.equal(isDirty(T('T01'), c.header, s), false);
});

test('AC-07: header fields are required and validated', () => {
  const s = createFormState(T('T01'), c.header, {}, NOW);
  assert.deepEqual(ids(validateForm(T('T01'), c.header, s)), ['employeeName', 'employeeEmail', 'managerName']);
  const ok = filled('T01');
  assert.deepEqual(validateForm(T('T01'), c.header, ok), []);
  ok.values.employeeEmail = 'not-an-email';
  ok.values.cc = 'also bad';
  assert.deepEqual(ids(validateForm(T('T01'), c.header, ok)), ['employeeEmail', 'cc']);
});

test('email validation', () => {
  for (const good of ['a@b.co', 'sam.patel@company.co.uk', 'x+y@d.org']) assert.ok(isValidEmail(good), good);
  for (const bad of ['', 'a@b', 'a b@c.com', '@c.com', 'a@b.c', 'a@b,c.com']) assert.ok(!isValidEmail(bad), bad);
});

test('length limits', () => {
  const s = filled('T01', { employeeName: 'x'.repeat(121), wins: 'y'.repeat(4001) });
  const errs = validateForm(T('T01'), c.header, s);
  assert.deepEqual(ids(errs), ['employeeName', 'wins']);
});

test('AC-08: T03 amber flag when related to work is Yes, and gone when cleared', () => {
  const s = filled('T03');
  assert.equal(activeFlags(T('T03'), s).length, 0);
  s.values.workRelated = 'Yes';
  const flags = activeFlags(T('T03'), s);
  assert.equal(flags.length, 1);
  assert.equal(flags[0].level, 2);
  s.values.workRelated = '';
  assert.equal(activeFlags(T('T03'), s).length, 0);
  for (const [f, v] of [['workRelated', 'Not sure'], ['fit', 'Not sure – seek advice'], ['trigger', 'Yes']]) {
    const x = filled('T03', { [f]: v });
    assert.equal(activeFlags(T('T03'), x).length, 1, `${f}=${v}`);
  }
});

test('T03 return date must be on or after first day of absence, and adjustments required if "with adjustments"', () => {
  const s = filled('T03', { absenceStart: '2026-11-10', returnDate: '2026-11-09', daysAbsent: '2.5', reason: 'Cold', fitNote: 'Provided', fit: 'Yes, with adjustments', workRelated: 'No' });
  const errs = validateForm(T('T03'), c.header, s);
  assert.deepEqual(ids(errs), ['returnDate', 'adjustments']);
  assert.match(errs[0].message, /first day of absence/);
  s.values.returnDate = '2026-11-12';
  s.values.adjustments = 'Phased return';
  assert.deepEqual(validateForm(T('T03'), c.header, s), []);
});

test('number fields: 0–365 in half steps', () => {
  const base = { absenceStart: '2026-11-10', returnDate: '2026-11-12', reason: 'Cold', fitNote: 'Provided', fit: 'Yes, fully fit', workRelated: 'No' };
  for (const [v, ok] of [['2.5', true], ['0', true], ['365', true], ['2.3', false], ['-1', false], ['366', false], ['abc', false]]) {
    const s = filled('T03', { ...base, daysAbsent: v });
    assert.equal(validateForm(T('T03'), c.header, s).length === 0, ok, v);
  }
});

test('AC-09: T04 "Probation extended" makes new end date visible and required', () => {
  const base = { startDate: '2026-06-01', probationEnd: '2026-12-01', reviewType: 'Final' };
  const s = filled('T04', base);
  const isLive = (st, id) => activeFields(T('T04'), st).some((x) => x.field.id === id);
  assert.equal(isLive(s, 'newEnd'), false);
  assert.deepEqual(ids(validateForm(T('T04'), c.header, s)), ['outcome']);
  s.values.outcome = 'Probation extended';
  assert.equal(isLive(s, 'newEnd'), true);
  assert.deepEqual(ids(validateForm(T('T04'), c.header, s)), ['newEnd', 'extensionImprove']);
  assert.equal(activeFlags(T('T04'), s)[0].level, 3);
  // Interim reviews hide the outcome section completely.
  const interim = filled('T04', { ...base, reviewType: 'Interim', outcome: 'Probation extended' });
  assert.equal(isLive(interim, 'outcome'), false);
  assert.deepEqual(validateForm(T('T04'), c.header, interim), []);
  assert.equal(activeFlags(T('T04'), interim).length, 0);
});

test('T04 "Not confirming" switches to HR-only sending', () => {
  const s = filled('T04', { startDate: '2026-06-01', probationEnd: '2026-12-01', reviewType: 'Final', outcome: 'Not confirming – contact HR' });
  assert.equal(sendMode(T('T04'), s), 'hrOnly');
  s.values.outcome = 'Probation passed';
  assert.equal(sendMode(T('T04'), s), 'normal');
});

test('action list: rows need an action; blank rows are ignored; max 15', () => {
  const s = filled('T01', { actions: [{ action: '', owner: '', due: '' }, { action: 'Do it', owner: 'Manager', due: '' }] });
  assert.deepEqual(validateForm(T('T01'), c.header, s), []);
  s.values.actions.push({ action: '', owner: 'Both', due: '' });
  assert.match(validateForm(T('T01'), c.header, s)[0].message, /Action 3/);
  s.values.actions = Array.from({ length: 16 }, () => ({ action: 'x', owner: '', due: '' }));
  assert.match(validateForm(T('T01'), c.header, s)[0].message, /up to 15/);
});

test('switched-off sections are not validated', () => {
  const s = filled('T01', { actions: [{ action: '', owner: 'Both', due: '' }] });
  assert.equal(validateForm(T('T01'), c.header, s).length, 1);
  s.included.actions = false;
  assert.equal(validateForm(T('T01'), c.header, s).length, 0);
});

test('Full/Quick switch keeps values in shared fields', () => {
  const s = filled('T01', { wellbeingRating: 4, priorities: 'Q1 plan', wins: 'Launched' });
  const q = switchTemplate(s, T('T02'), c.header);
  assert.equal(q.templateId, 'T02');
  assert.equal(q.values.employeeName, 'Sam Patel');
  assert.equal(q.values.wellbeingRating, 4);
  assert.equal(q.values.priorities, 'Q1 plan');
  assert.equal('wins' in q.values, false);
});

test('isDirty notices typing but ignores the default date and pre-filled topic', () => {
  const s = createFormState(T('T08'), c.header, { topic: 'Lateness and timekeeping' }, NOW);
  assert.equal(s.values.topic, 'Lateness and timekeeping');
  assert.equal(isDirty(T('T08'), c.header, s), false);
  s.values.discussed = 'x';
  assert.equal(isDirty(T('T08'), c.header, s), true);
  const t = createFormState(T('T01'), c.header, {}, NOW);
  t.values.actions = [{ action: '', owner: '', due: '' }];
  assert.equal(isDirty(T('T01'), c.header, t), false);
});

test('T08 short mode (bereavement) hides everything except the essentials', () => {
  const s = filled('T08', { discussed: 'Leave agreed' }, { short: true, topic: 'Bereavement' });
  const live = activeFields(T('T08'), s).map((x) => x.field.id);
  assert.deepEqual(live, ['topic', 'discussed']);
});
