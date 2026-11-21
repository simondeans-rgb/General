import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { createFormState } from '../src/lib/engine.js';
import { buildEmail, mailtoUrl, hrAdviceEmail, firstName, emailAsText } from '../src/lib/email.js';

const c = loadContentSync();
const NOW = new Date(2026, 10, 16, 9, 0);
const T = (id) => c.templateById[id];
const prefs = { emailFooterEnabled: true, hrContactEmail: 'hr@example.co.uk' };
function state(id, extra = {}, ctx = {}) {
  const s = createFormState(T(id), c.header, ctx, NOW);
  Object.assign(s.values, { employeeName: 'Sam Patel', employeeEmail: 'sam@example.co.uk', managerName: 'Jo Smith' }, extra);
  return s;
}

test('T01 email matches the spec example (8.2)', () => {
  const s = state('T01', {
    wellbeingRating: 4,
    wellbeingComments: 'Busy month but feeling positive.',
    wins: 'Launched the new onboarding process on time.',
    priorities: 'Finalise Q1 plan; recruit the new coordinator.',
    actions: [
      { action: 'Share draft Q1 plan', owner: 'Employee', due: '2026-11-23' },
      { action: 'Approve recruitment advert', owner: 'Manager', due: '2026-11-20' },
    ],
    nextDate: '2026-11-30',
  });
  // The spec example includes wellbeing, so this opts in (P0.5 leaves it out by default).
  const e = buildEmail(c, T('T01'), s, { prefs, includeSensitive: true });
  assert.equal(e.subject, '1:1 summary – Sam Patel – 16 Nov 2026');
  assert.deepEqual(e.to, ['sam@example.co.uk']);
  assert.deepEqual(e.cc, []);
  assert.equal(e.body, [
    'Hi Sam,',
    "Thanks for our 1:1 today. Here's a summary of what we discussed and agreed. If anything doesn't match your understanding, just reply and let me know.",
    'WELLBEING\n\nHow are you feeling at the moment? 4/5 – Good\n\nBusy month but feeling positive.',
    'WINS\n\nLaunched the new onboarding process on time.',
    'PRIORITIES\n\nFinalise Q1 plan; recruit the new coordinator.',
    'AGREED ACTIONS\n\n1. Share draft Q1 plan – Owner: Employee – Due: 23 Nov 2026\n2. Approve recruitment advert – Owner: Manager – Due: 20 Nov 2026',
    'Next 1:1: 30 Nov 2026',
    'Best wishes,\nJo Smith',
    '—\nSent from SayWotNow – practical people-management guidance for managers. This summary was not stored in the app.',
  ].join('\n\n'));
});

test('AC-06: empty fields and switched-off sections are left out', () => {
  const s = state('T01', { wins: 'A win', priorities: 'P', development: 'Course' });
  s.included.priorities = false;
  const e = buildEmail(c, T('T01'), s, { prefs });
  assert.match(e.body, /WINS/);
  assert.doesNotMatch(e.body, /PRIORITIES/);
  assert.doesNotMatch(e.body, /WELLBEING|BLOCKERS|FEEDBACK|AGREED ACTIONS|Next 1:1/);
  assert.match(e.body, /DEVELOPMENT\n\nCourse/);
});

test('footer can be switched off', () => {
  const e = buildEmail(c, T('T01'), state('T01'), { prefs: { emailFooterEnabled: false } });
  assert.doesNotMatch(e.body, /Sent from SayWotNow/);
  assert.match(e.body, /Best wishes,\nJo Smith$/);
});

test('CC and "Also send to HR"', () => {
  const s = state('T03', { cc: 'second@example.co.uk' });
  assert.deepEqual(buildEmail(c, T('T03'), s, { prefs }).cc, ['second@example.co.uk']);
  assert.deepEqual(buildEmail(c, T('T03'), s, { prefs, alsoHr: true }).cc, ['second@example.co.uk', 'hr@example.co.uk']);
  // T01 doesn't allow HR copies.
  assert.deepEqual(buildEmail(c, T('T01'), state('T01'), { prefs, alsoHr: true }).cc, []);
});

test('subject placeholders from fields (T04, T05, T07)', () => {
  assert.equal(buildEmail(c, T('T04'), state('T04', { reviewType: 'Interim' }), { prefs }).subject, 'Probation review (Interim) – Sam Patel – 16 Nov 2026');
  assert.equal(buildEmail(c, T('T05'), state('T05', { reviewType: 'Mid-year' }), { prefs }).subject, 'Mid-year review – Sam Patel – 16 Nov 2026');
  assert.equal(buildEmail(c, T('T07'), state('T07', { checkpoint: 'Week 1' }), { prefs }).subject, 'Week 1 check-in – Sam Patel – 16 Nov 2026');
});

test('checklist output lists Done and Still to sort', () => {
  const s = state('T07', { checkpoint: 'Month 1', setupChecklist: ['Equipment working', 'System access'] });
  const e = buildEmail(c, T('T07'), s, { prefs });
  assert.match(e.body, /PRACTICAL SET-UP\n\nDone: Equipment working, System access\nStill to sort: Building access, Payroll and bank details submitted, Mandatory training started, Met key colleagues/);
});

test('repeater, date range, number and choice formats', () => {
  const s = state('T05', {
    reviewType: 'Annual', period: { from: '2026-01-01', to: '2026-12-31' },
    objectives: [{ objective: 'Launch app', rating: 'Exceeded', evidence: 'Shipped early' }, { objective: '', rating: '', evidence: '' }],
    overallRating: '4 Exceeds',
  });
  const e = buildEmail(c, T('T05'), s, { prefs });
  assert.match(e.body, /OBJECTIVES THIS PERIOD\n\n1\. Launch app – Rating: Exceeded\n   Shipped early/);
  assert.match(e.body, /Overall rating: 4 Exceeds/);
  s.toggles.overallRating = false;
  assert.doesNotMatch(buildEmail(c, T('T05'), s, { prefs }).body, /Overall rating/);
  const r = state('T03', { absenceStart: '2026-11-10', returnDate: '2026-11-12', daysAbsent: '2.5', reason: 'Cold / flu', fitNote: 'Provided', fit: 'Yes, fully fit', workRelated: 'No', referral: ['Occupational Health'] });
  const b = buildEmail(c, T('T03'), r, { prefs }).body;
  assert.match(b, /Working days absent: 2\.5/);
  assert.match(b, /First day of absence: 10 Nov 2026/);
  assert.match(b, /Referral offered: Occupational Health/);
});

test('T08 opener uses the topic in lower case, and adds the closing line', () => {
  const s = state('T08', { discussed: 'Start times' }, { topic: 'Lateness and timekeeping' });
  const e = buildEmail(c, T('T08'), s, { prefs });
  assert.equal(e.subject, 'Summary of our conversation – Sam Patel – 16 Nov 2026');
  assert.match(e.body, /our conversation about lateness and timekeeping\./);
  assert.match(e.body, /please reply within 5 working days/);
  assert.doesNotMatch(e.body, /Conversation topic/);
});

test('T04 "Not confirming" goes to HR only, unless forced or no HR email', () => {
  const s = state('T04', { startDate: '2026-06-01', probationEnd: '2026-12-01', reviewType: 'Final', outcome: 'Not confirming – contact HR' });
  const hr = buildEmail(c, T('T04'), s, { prefs });
  assert.equal(hr.mode, 'hrOnly');
  assert.deepEqual(hr.to, ['hr@example.co.uk']);
  assert.match(hr.subject, /^For HR advice – Probation review \(Final\)/);
  assert.equal(buildEmail(c, T('T04'), s, { prefs, forceEmployee: true }).to[0], 'sam@example.co.uk');
  assert.equal(buildEmail(c, T('T04'), s, { prefs: {} }).mode, 'normal');
});

test('AC-13: Contact HR email has no employee details', () => {
  const e = hrAdviceEmail('hr@example.co.uk', 'Lateness and timekeeping');
  assert.deepEqual(e.to, ['hr@example.co.uk']);
  assert.equal(e.subject, 'Advice needed – Lateness and timekeeping');
  assert.equal(e.body, "Hi, I'd like some advice about a lateness and timekeeping situation with a member of my team. Please could you get in touch? Thanks.");
});

test('mailto URL encoding', () => {
  const url = mailtoUrl({ to: ['sam@example.co.uk'], cc: ['a@b.co', 'hr@x.co.uk'], subject: '1:1 summary – Sam & Co', body: 'Hi Sam,\n\nLine 2' });
  assert.equal(url, 'mailto:sam@example.co.uk?cc=a@b.co,hr@x.co.uk&subject=1%3A1%20summary%20%E2%80%93%20Sam%20%26%20Co&body=Hi%20Sam%2C%0D%0A%0D%0ALine%202');
});

test('first name and share text', () => {
  assert.equal(firstName('  Sam   Patel '), 'Sam');
  assert.equal(emailAsText({ subject: 'S', body: 'B' }), 'Subject: S\n\nB');
});

test('P0.5 wellbeing and health details are left out of emails by default', () => {
  const s1 = state('T01', { wellbeingRating: 2, wellbeingComments: 'Struggling with sleep.', wins: 'Shipped the report.' });
  const e = buildEmail(c, T('T01'), s1, { prefs });
  assert.doesNotMatch(e.body, /WELLBEING|Struggling with sleep|2\/5/);
  assert.match(e.body, /WINS\n\nShipped the report\./);
  assert.deepEqual(e.withheld, ['wellbeingRating', 'wellbeingComments']);
  const s2 = state('T02', { wellbeingRating: 1, wellbeingComments: 'Bereavement in the family.', priorities: 'Cover rota.' });
  const e2 = buildEmail(c, T('T02'), s2, { prefs });
  assert.doesNotMatch(e2.body, /Bereavement|How are things/);
  assert.match(e2.body, /Cover rota/);
  const s3 = state('T03', { reason: 'Migraine', fitNote: 'Provided', absenceStart: '2026-11-10', returnDate: '2026-11-16', fit: 'Yes' });
  const e3 = buildEmail(c, T('T03'), s3, { prefs });
  assert.doesNotMatch(e3.body, /Migraine|Fit note/);
  assert.deepEqual(e3.withheld.sort(), ['fitNote', 'reason']);
});

test('P0.5 the manager can include them for one email; nothing withheld when empty', () => {
  const s1 = state('T01', { wellbeingRating: 4, wellbeingComments: 'Feeling positive.' });
  const e = buildEmail(c, T('T01'), s1, { prefs, includeSensitive: true });
  assert.match(e.body, /WELLBEING[\s\S]*Feeling positive\./);
  assert.deepEqual(e.withheld, []);
  const empty = buildEmail(c, T('T01'), state('T01', { wins: 'x' }), { prefs });
  assert.deepEqual(empty.withheld, [], 'empty sensitive fields are not reported as withheld');
  // Copy/share use the same text as the preview.
  assert.equal(emailAsText(buildEmail(c, T('T01'), s1, { prefs })).includes('Feeling positive'), false);
});

test('P2.3 the "Sent from SayWotNow" footer is never on formal records', () => {
  const footer = /Sent from SayWotNow/;
  for (const id of ['T03', 'T04', 'T05', 'T08']) {
    const s = state(id, { topic: 'Timekeeping', discussed: 'Start times.', reason: 'Cold', fitNote: 'Provided' });
    assert.doesNotMatch(buildEmail(c, T(id), s, { prefs }).body, footer, id);
  }
  assert.match(buildEmail(c, T('T01'), state('T01', { wins: 'x' }), { prefs }).body, footer);
  assert.doesNotMatch(buildEmail(c, T('T01'), state('T01', { wins: 'x' }), { prefs: { ...prefs, emailFooterEnabled: false } }).body, footer);
});

test('P2.3 T08 separates what the manager said from the employee\'s response', () => {
  const s = state('T08', { topic: 'Timekeeping', discussed: 'I explained the start time.', theirViews: 'They said the bus is unreliable.' });
  const body = buildEmail(c, T('T08'), s, { prefs }).body;
  assert.match(body, /What we discussed:?\s*\n?I explained the start time\./);
  assert.match(body, /Your response and the points you raised:?\s*\n?They said the bus is unreliable\./);
  assert.equal(T('T08').sections[0].fields.find((f) => f.id === 'theirViews').label, 'Their response');
});
