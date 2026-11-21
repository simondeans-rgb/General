// 1-minute prep cards and "Say it like this" lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.js';
import { prepFor } from '../src/content.js';

const c = loadContentSync();

test('prep: every guide has its own card with three questions', () => {
  for (const g of c.guides.guides) {
    const card = prepFor(c, 'guide', g.id);
    assert.ok(card, `no card for ${g.id}`);
    assert.equal(card.target.id, g.id);
    assert.equal(card.ask.length, 3);
    assert.ok(card.avoid.length > 0);
  }
});
test('prep: the full and quick 1:1 share the 1:1 card', () => {
  assert.equal(prepFor(c, 'template', 'T01').id, 'P-1to1');
  assert.equal(prepFor(c, 'template', 'T02').id, 'P-1to1');
});
test('prep: other meetings have cards, the summary template does not', () => {
  for (const id of ['T03', 'T04', 'T05', 'T06', 'T07']) assert.equal(prepFor(c, 'template', id)?.target.id, id);
  assert.equal(prepFor(c, 'template', 'T08'), null);
  assert.equal(prepFor(c, 'guide', 'G99'), null);
});
test('say it: every guide has copy-ready lines without stray quote marks', () => {
  for (const g of c.guides.guides) {
    assert.ok(g.sayIt && g.sayIt.length >= 2, `${g.id} needs lines`);
    for (const x of g.sayIt) {
      assert.ok(x.when.trim() && x.line.trim());
      assert.doesNotMatch(x.line, /^["“]|["”]$/, `${g.id}: the app adds the quote marks`);
    }
  }
});
test('say it: placeholders use [square brackets] only', () => {
  for (const g of c.guides.guides) for (const x of g.sayIt) assert.doesNotMatch(x.line, /[{}<>]/);
});
