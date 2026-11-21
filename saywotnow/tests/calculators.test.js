// AC-16: at least 5 test cases per calculator, including edge cases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateHoliday, roundUpHalf } from '../src/lib/calc/holiday.js';
import { calculateNotice, statutoryWeeks, noticeEnd } from '../src/lib/calc/notice.js';
import { buildSbi } from '../src/lib/calc/sbi.js';
import { completedMonths, addMonths } from '../src/lib/dates.js';

const H = (o) => calculateHoliday({ entitlement: 28, includesBankHolidays: true, fullTimeDays: 5, employeeDays: 5, ...o });

test('holiday 1: full time, full year', () => {
  const r = H({});
  assert.equal(r.exact, 28); assert.equal(r.rounded, 28); assert.equal(r.statutory, 28); assert.equal(r.belowStatutory, false);
});
test('holiday 2: 3 days a week, rounded up to the half day', () => {
  const r = H({ employeeDays: 3 });
  assert.equal(r.exact, 16.8); assert.equal(r.rounded, 17); assert.equal(r.statutory, 16.8); assert.equal(r.belowStatutory, false);
});
test('holiday 3: joiner part way through, bank holidays on top', () => {
  const r = H({ entitlement: 25, includesBankHolidays: false, yearStart: '2026-01-01', startDate: '2026-07-01' });
  assert.equal(r.partYear, true);
  assert.equal(r.exact, 12.6); assert.equal(r.rounded, 13);
  assert.equal(r.statutory, 14.12); assert.equal(r.bankHolidaysOnTop, 4.03); assert.equal(r.belowStatutory, false);
});
test('holiday 4: below the statutory minimum is flagged', () => {
  const r = H({ entitlement: 20 });
  assert.equal(r.belowStatutory, true);
  assert.equal(H({ entitlement: 20, includesBankHolidays: false }).belowStatutory, false); // 20 + 8 = 28
});
test('holiday 5: statutory minimum is capped at 28 days', () => {
  const r = H({ entitlement: 33, fullTimeDays: 6, employeeDays: 6 });
  assert.equal(r.statutory, 28); assert.equal(r.exact, 33);
});
test('holiday 6: leaver, April holiday year', () => {
  const r = H({ yearStart: '2026-04-01', leaveDate: '2026-09-30' });
  assert.equal(r.exact, 14.04); assert.equal(r.rounded, 14.5);
});
test('holiday 8: bank holidays on top depend on the UK nation', () => {
  const base = { entitlement: 25, includesBankHolidays: false, yearStart: '2026-01-01', startDate: '2026-07-01' };
  assert.equal(H({ ...base }).bankHolidaysOnTop, 4.03); // default: England and Wales, 8
  assert.equal(H({ ...base, nation: 'sc' }).bankHolidaysOnTop, 4.54); // Scotland, 9
  assert.equal(H({ ...base, nation: 'ni' }).bankHolidaysOnTop, 5.04); // Northern Ireland, 10
  assert.equal(H({ ...base, nation: 'xx' }).nation, 'ew'); // unknown falls back
});
test('holiday 9: the nation can decide the statutory check', () => {
  const base = { entitlement: 19, includesBankHolidays: false };
  assert.equal(H({ ...base, nation: 'ew' }).belowStatutory, true); // 19 + 8 = 27 < 28
  assert.equal(H({ ...base, nation: 'sc' }).belowStatutory, false); // 19 + 9 = 28
  assert.equal(H({ ...base, nation: 'ni' }).belowStatutory, false); // 19 + 10 = 29
  assert.match(H({ ...base, nation: 'sc' }).steps.join(' '), /9 bank holidays in Scotland/);
  assert.equal(H({ ...base, includesBankHolidays: true, entitlement: 28, nation: 'ni' }).bankHolidaysOnTop, 0);
});
test('holiday 7: invalid inputs', () => {
  assert.ok(H({ employeeDays: 8 }).errors.employeeDays);
  assert.ok(H({ employeeDays: 2.3 }).errors.employeeDays);
  assert.ok(H({ fullTimeDays: 4, employeeDays: 5 }).errors.employeeDays);
  assert.ok(H({ entitlement: '' }).errors.entitlement);
  assert.ok(H({ startDate: '2026-02-01' }).errors.yearStart);
  assert.ok(H({ yearStart: '2026-01-01', startDate: '2026-06-01', leaveDate: '2026-05-01' }).errors.leaveDate);
});
test('rounding up to the nearest half day', () => {
  assert.equal(roundUpHalf(17), 17); assert.equal(roundUpHalf(16.01), 16.5); assert.equal(roundUpHalf(16.5), 16.5); assert.equal(roundUpHalf(16.51), 17);
});

const N = (o) => calculateNotice({ who: 'Employer', startDate: '2020-01-15', noticeDate: '2026-11-16', ...o });

test('notice 1: employer, 6 years, statutory beats 4 weeks contractual', () => {
  const r = N({ contractAmount: 4, contractUnit: 'weeks' });
  assert.equal(r.years, 6); assert.equal(r.statutory, '6 weeks'); assert.equal(r.applies, '6 weeks'); assert.equal(r.basis, 'statutory');
  assert.equal(r.lastDay, '2026-12-28'); assert.equal(r.noticeStarts, '2026-11-17');
});
test('notice 2: employer, contractual 3 months beats statutory', () => {
  const r = N({ contractAmount: 3, contractUnit: 'months' });
  assert.equal(r.applies, '3 months'); assert.equal(r.basis, 'contractual'); assert.equal(r.lastDay, '2027-02-16');
});
test('notice 3: employer, 18 months service is 1 week', () => {
  const r = N({ startDate: '2025-05-16' });
  assert.equal(r.months, 18); assert.equal(r.statutoryWeeks, 1); assert.equal(r.lastDay, '2026-11-23');
});
test('notice 4: employer, capped at 12 weeks', () => {
  const r = N({ startDate: '2011-01-01' });
  assert.equal(r.years, 15); assert.equal(r.statutoryWeeks, 12); assert.equal(r.lastDay, '2027-02-08');
});
test('notice 5: under one month, no statutory notice', () => {
  const r = N({ startDate: '2026-11-01' });
  assert.equal(r.underOneMonth, true); assert.equal(r.statutoryWeeks, 0); assert.equal(r.lastDay, '2026-11-16');
});
test('notice 6: employee gives notice', () => {
  assert.equal(N({ who: 'Employee' }).applies, '1 week');
  const r = N({ who: 'Employee', contractAmount: 1, contractUnit: 'months' });
  assert.equal(r.applies, '1 month'); assert.equal(r.lastDay, '2026-12-16');
});
test('notice 7: the two-year boundary', () => {
  assert.equal(N({ startDate: '2024-11-16' }).statutoryWeeks, 2);
  assert.equal(N({ startDate: '2024-11-17' }).statutoryWeeks, 1);
  assert.equal(statutoryWeeks('Employer', 11), 1);
  assert.equal(statutoryWeeks('Employee', 200), 1);
});
test('notice 8: month-end clamping and validation', () => {
  assert.equal(noticeEnd('2026-01-31', 1, 'months'), '2026-02-28');
  assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(completedMonths('2026-01-31', '2026-02-28'), 1);
  assert.ok(N({ noticeDate: '2019-01-01' }).errors.noticeDate);
  assert.ok(N({ contractAmount: 1.5 }).errors.contractAmount);
});

test('sbi feedback', () => {
  const next = { Developmental: 'How did you see it?', Positive: 'Thank you – please keep doing that.' };
  const r = buildSbi({ type: 'Developmental', situation: "Tuesday's client call", behaviour: 'You joined late.', impact: 'We ran out of time' }, next);
  assert.equal(r.statement, "In Tuesday's client call, I noticed you joined late. The impact was that we ran out of time.");
  assert.equal(r.text, `${r.statement} How did you see it?`);
  assert.equal(buildSbi({ type: 'Positive', situation: 'the QBR', behaviour: 'I saw your slides', impact: 'clear' }, next).next, 'Thank you – please keep doing that.');
  assert.equal(buildSbi({ type: 'Positive', situation: '', behaviour: 'x', impact: 'y' }, next), null);
});
test('P2.2 sbi: no doubled prepositions; leading time words are used as written', () => {
  const b = (situation) => buildSbi({ type: 'Developmental', situation, behaviour: 'you interrupted Priya', impact: 'she stopped contributing' }, {}).statement;
  assert.equal(b("in this morning's update"), "In this morning's update, I noticed you interrupted Priya. The impact was that she stopped contributing.");
  assert.equal(b('In the team meeting'), 'In the team meeting, I noticed you interrupted Priya. The impact was that she stopped contributing.');
  assert.equal(b('during the call'), 'During the call, I noticed you interrupted Priya. The impact was that she stopped contributing.');
  assert.equal(b('yesterday'), 'Yesterday, I noticed you interrupted Priya. The impact was that she stopped contributing.');
  assert.equal(b('the weekly stand-up'), 'In the weekly stand-up, I noticed you interrupted Priya. The impact was that she stopped contributing.');
});
test('P2.2 sbi: names and days keep capitals; "I" stays upper case; noun-phrase impacts read naturally', () => {
  const r = buildSbi({ type: 'Positive', situation: 'Monday', behaviour: 'Priya and I saw you coach the new starter', impact: 'a much smoother first week for her' }, {});
  assert.equal(r.statement, 'On Monday, I noticed Priya and I saw you coach the new starter. The impact was a much smoother first week for her.');
  const s = buildSbi({ type: 'Positive', situation: 'the QBR', behaviour: 'your slides were clear', impact: 'The client signed off the plan' }, {});
  assert.equal(s.statement, 'In the QBR, I noticed your slides were clear. The impact was that the client signed off the plan.');
});
test('P2.2 sbi: punctuation, whitespace and the optional request', () => {
  const r = buildSbi({ type: 'Developmental', situation: '  the last three weekly reports.  ', behaviour: 'the figures arrived after noon..', impact: 'I had to delay the summary!', request: 'could you send them by Friday noon' }, { Developmental: 'How did you see it?' });
  assert.equal(r.statement, 'In the last three weekly reports, I noticed the figures arrived after noon. The impact was that I had to delay the summary.');
  assert.equal(r.request, 'Could you send them by Friday noon?');
  const q = buildSbi({ type: 'Developmental', situation: 'the call', behaviour: 'you joined late', impact: 'we ran over', request: 'Could you let us know next time?' }, {});
  assert.equal(q.request, 'Could you let us know next time?');
  assert.equal(q.text, 'In the call, I noticed you joined late. The impact was that we ran over. Could you let us know next time?');
  assert.equal(buildSbi({ type: 'Positive', situation: 'the call', behaviour: 'x', impact: 'y', request: '   ' }, {}).request, '');
});
