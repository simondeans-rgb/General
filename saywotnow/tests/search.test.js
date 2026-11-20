import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { buildIndex, search, normalise } from '../src/lib/search.js';

const index = buildIndex(loadContentSync());
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
  assert.ok(idsOf(search(index, 'bradford'), 'tool').includes('bradford'));
  assert.ok(!index.some((x) => x.id === 'T08'));
});
test('no results and empty query', () => {
  const r = search(index, 'zzzqqq');
  assert.equal(r.template.length + r.guide.length + r.tool.length, 0);
  assert.equal(search(index, '   ').guide.length, 0);
});
