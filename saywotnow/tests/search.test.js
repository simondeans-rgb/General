import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { buildIndex, search, normalise, RESULT_KINDS } from '../src/lib/search.js';

const c = loadContentSync();
c.guideById = Object.fromEntries(c.guides.guides.map((g) => [g.id, g]));
const index = buildIndex(c);
const idsOf = (r, k) => r[k].map((x) => x.id);

test('AC-14: "late" returns G02', () => {
  assert.ok(idsOf(search(index, 'late'), 'guide').includes('G02'));
  assert.equal(search(index, 'late').guide[0].id, 'G02');
});
test('AC-14: "sick" returns G05 and T03', () => {
  const r = search(index, 'sick');
  assert.ok(idsOf(r, 'guide').includes('G05'));
  assert.ok(idsOf(r, 'template').includes('T03'));
});
test('case-insensitive, partial words, ignores apostrophes and hyphens', () => {
  assert.ok(idsOf(search(index, 'FEEDB'), 'guide').includes('G11'));
  assert.ok(idsOf(search(index, 'short-term'), 'guide').includes('G05'));
  assert.ok(idsOf(search(index, 'shortterm'), 'guide').includes('G05'));
  assert.ok(idsOf(search(index, 'dont want'), 'guide').length >= 0);
  assert.equal(normalise("Don't  Short-term"), 'dont shortterm');
});
test('tools are searchable; T08 is not listed', () => {
  assert.ok(idsOf(search(index, 'holiday'), 'tool').includes('holiday'));
  assert.equal(idsOf(search(index, 'bradford'), 'tool').length, 0, 'Bradford Factor was removed');
  assert.equal(idsOf(search(index, 'interview pack'), 'tool').length, 0, 'Interview Pack Builder was removed');
  assert.ok(!index.some((x) => x.id === 'T08'));
});
test('no results and empty query', () => {
  const r = search(index, 'zzzqqq');
  assert.equal(r.template.length + r.guide.length + r.tool.length, 0);
  assert.equal(search(index, '   ').guide.length, 0);
});

/* ---------- P1.1 everyday phrases, synonyms and safety ---------- */
const top = (r, kind) => (r[kind][0] || {}).id;

test('P1.1 panel examples: "always late", "crying", "bullying", "not pulling weight", "won\'t listen"', () => {
  let r = search(index, 'always late');
  assert.equal(top(r, 'guide'), 'G02');
  assert.ok(idsOf(r, 'prep').includes('P-G02'), 'and its 1-minute prep');
  r = search(index, 'my employee is crying');
  assert.ok(idsOf(r, 'reaction').includes('R01'));
  assert.ok(idsOf(r, 'guide').includes('G06'));
  r = search(index, 'bullying');
  assert.equal(top(r, 'guide'), 'G17');
  assert.ok(idsOf(r, 'guide').includes('G03'));
  assert.equal(r.risk, 'hr');
  r = search(index, 'not pulling their weight');
  assert.equal(top(r, 'guide'), 'G01');
  r = search(index, "won't listen");
  assert.ok(idsOf(r, 'guide').includes('G11') && idsOf(r, 'guide').includes('G03'));
});

test('P1.1 more everyday phrases', () => {
  assert.equal(top(search(index, 'off sick again'), 'guide'), 'G05');
  assert.equal(top(search(index, 'wants to work from home'), 'guide'), 'G13');
  assert.equal(top(search(index, 'asking for a pay rise'), 'guide'), 'G14');
  assert.equal(top(search(index, 'two people fell out'), 'guide'), 'G04');
  assert.equal(top(search(index, 'body odour'), 'guide'), 'G10');
  assert.ok(idsOf(search(index, 'back from sick'), 'template').includes('T03'));
  assert.ok(idsOf(search(index, 'feedback'), 'tool').includes('sbi'));
});

test('P1.1 full text: words only in the guide body are found', () => {
  // "trial period" appears in G13's text but not its title or keywords.
  assert.ok(idsOf(search(index, 'trial period'), 'guide').includes('G13'));
  // Word endings: "argued" finds conflict content.
  assert.ok(idsOf(search(index, 'argued'), 'guide').includes('G04'));
});

test('P1.1/P3.1 risky terms always surface HR-first or urgent help, specific guide first', () => {
  const expect = { harassment: 'G17', 'racist comments': 'G17', 'stealing from the till': 'G03', 'drunk at work': 'G18', 'thinking of dismissal': 'G03', 'raised a grievance': 'G16', 'at risk of redundancy': 'G19' };
  for (const [q, id] of Object.entries(expect)) {
    const r = search(index, q);
    assert.equal(r.risk, 'hr', q);
    assert.equal(top(r, 'guide'), id, q);
    assert.match(r.riskMessage, /HR/);
    assert.ok(c.guideById[top(r, 'guide')].escalation, `${q}: leads to a guide with an HR-first gate`);
  }
  for (const q of ['said they might self harm', 'suicidal']) {
    const r = search(index, q);
    assert.equal(r.risk, 'urgent', q);
    assert.equal(top(r, 'guide'), 'G06', q);
    assert.match(r.riskMessage, /999/);
  }
});

test('P1.1 false positives: ordinary words are not flagged as risky', () => {
  for (const q of ['feedback', 'always late', 'holiday', 'new starter', 'fire drill', 'pay rise']) assert.equal(search(index, q).risk, null, q);
  // "late" doesn't drag in unrelated guides at the top.
  assert.notEqual(top(search(index, 'late'), 'guide'), 'G09');
});

test('P1.1 spelling: one-letter typos are corrected only when nothing matches', () => {
  const r = search(index, 'menopase');
  assert.equal(r.corrected, 'menopause');
  assert.equal(top(r, 'guide'), 'G08');
  assert.equal(search(index, 'feedback').corrected, null);
});

test('P1.1 no results offer suggestions; nothing for empty queries', () => {
  const r = search(index, 'zzzqqq xxyy');
  assert.equal(RESULT_KINDS.reduce((n, k) => n + r[k].length, 0), 0);
  assert.ok(r.suggestions.length > 0);
  assert.equal(search(index, '   ').suggestions.length, 0);
});
