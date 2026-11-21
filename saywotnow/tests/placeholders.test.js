// P2.1 script personaliser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { findPlaceholders, fillText, fillParts, placeholderLabel } from '../src/lib/placeholders.js';

const c = loadContentSync();

test('finds each placeholder once, in order', () => {
  assert.deepEqual(findPlaceholders(['Late on [number] occasions over the last [period].', 'Since [period], [number]…']), ['number', 'period']);
  assert.deepEqual(findPlaceholders(['No blanks here.']), []);
});

test('fills what is given and leaves the rest showing', () => {
  const t = "You've been late on [number] occasions over the last [period].";
  assert.equal(fillText(t, { number: '6', period: 'four weeks' }), "You've been late on 6 occasions over the last four weeks.");
  assert.equal(fillText(t, { number: '6' }), "You've been late on 6 occasions over the last [period].");
  assert.equal(fillText(t, { number: '   ' }), t, 'blank input keeps the placeholder');
});

test('input is cleaned: no line breaks, trimmed, capped at 80 characters', () => {
  assert.equal(fillText('[x]!', { x: '  a\nb\tc  ' }), 'a b c!');
  assert.equal(fillText('[x]', { x: 'y'.repeat(200) }).length, 80);
});

test('parts mark filled and unfilled placeholders for display', () => {
  assert.deepEqual(fillParts('By [date], [team/process].', { date: 'Friday' }), [
    { text: 'By ' }, { name: 'date', value: 'Friday', filled: true }, { text: ', ' },
    { name: 'team/process', value: '[team/process]', filled: false }, { text: '.' },
  ]);
  assert.equal(placeholderLabel('team/process'), 'Team or process');
  assert.equal(placeholderLabel('how and when'), 'How and when');
});

test('every guide script placeholder is short and fillable', () => {
  for (const g of c.guides.guides) {
    const ph = findPlaceholders([...g.opening, ...(g.sayIt || []).map((x) => x.line)]);
    for (const p of ph) assert.ok(p.length <= 40 && !/[\[\]]/.test(p), `${g.id}: ${p}`);
  }
});
