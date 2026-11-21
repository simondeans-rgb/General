// Preferences: only the allow-list is ever stored; retired keys are deleted on first load (P0.1).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPrefs, setPref, _resetPrefsCache, DEFAULTS } from '../src/prefs.js';

const KEY = 'saywotnow.prefs.v1';
function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}
beforeEach(() => { _resetPrefsCache(); });

test('retired interview packs and Bradford bands are deleted from the device on first load', () => {
  globalThis.localStorage = memoryStorage({ [KEY]: JSON.stringify({
    favourites: ['G02'], theme: 'dark',
    interviewPacks: [{ id: 'pack-1', role: 'Head of Product', panel: ['Jo Smith'] }],
    bradfordBands: [{ from: '0', to: '49', label: 'No action' }],
  }) });
  const p = loadPrefs();
  assert.deepEqual(p.favourites, ['G02']);
  assert.equal(p.theme, 'dark');
  const stored = JSON.parse(globalThis.localStorage.getItem(KEY));
  assert.equal('interviewPacks' in stored, false);
  assert.equal('bradfordBands' in stored, false);
  assert.ok(!JSON.stringify(stored).includes('Jo Smith'));
  assert.deepEqual(stored.favourites, ['G02']);
});

test('nothing is rewritten when there are no retired keys', () => {
  const s = memoryStorage({ [KEY]: JSON.stringify({ theme: 'light' }) });
  let writes = 0;
  const orig = s.setItem; s.setItem = (k, v) => { writes++; orig(k, v); };
  globalThis.localStorage = s;
  loadPrefs();
  assert.equal(writes, 0);
});

test('retired keys can no longer be written', () => {
  globalThis.localStorage = memoryStorage();
  assert.equal('interviewPacks' in DEFAULTS || 'bradfordBands' in DEFAULTS, false);
  assert.throws(() => setPref('interviewPacks', []), /not an allowed preference/);
  assert.throws(() => setPref('bradfordBands', []), /not an allowed preference/);
});
