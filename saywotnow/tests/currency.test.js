// Currency converter: conversion, formatting and rate handling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROOT } from './helpers.js';
import { parseAmount, convert, unitRate, formatMoney, formatRate, parseRatesResponse, fetchRates, bestRates, needsRefresh, isStale, RATES_URL, currencyName } from '../src/lib/calc/currency.js';

const R = { USD: 1, GBP: 0.758255, EUR: 0.908584, AED: 3.6725, INR: 93.959855, CNY: 6.679257, AUD: 1.483068, JPY: 155.2, KWD: 0.307 };
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('currency 1: USD to each default currency', () => {
  near(convert(100, 'USD', 'GBP', R), 75.8255);
  near(convert(100, 'USD', 'AED', R), 367.25);
  near(convert(100, 'USD', 'INR', R), 9395.9855);
});
test('currency 2: cross rates go through USD', () => {
  near(convert(100, 'GBP', 'EUR', R), 100 / 0.758255 * 0.908584);
  near(convert(1, 'AUD', 'CNY', R), 6.679257 / 1.483068);
  near(unitRate('EUR', 'EUR', R), 1);
});
test('currency 3: a round trip gets back the same amount', () => {
  near(convert(convert(1234.56, 'GBP', 'INR', R), 'INR', 'GBP', R), 1234.56, 1e-9);
});
test('currency 4: unknown currency or no amount gives null', () => {
  assert.equal(convert(10, 'GBP', 'XXX', R), null);
  assert.equal(convert(null, 'GBP', 'USD', R), null);
  near(convert(0, 'GBP', 'USD', R), 0);
});
test('currency 5: parsing amounts', () => {
  assert.equal(parseAmount('1,250.50'), 1250.5);
  assert.equal(parseAmount(' £100 '), 100);
  assert.equal(parseAmount('GBP 12.3'), 12.3);
  assert.equal(parseAmount('.5'), 0.5);
  for (const bad of ['', 'abc', '1.2.3', '-5', '.', null]) assert.equal(parseAmount(bad), null, String(bad));
});
test('currency 6: formatting uses each currency\'s own decimals and symbol', () => {
  assert.equal(formatMoney(1234.5, 'GBP'), '£1,234.50');
  assert.equal(formatMoney(1234.5, 'JPY'), 'JP¥1,235');
  assert.match(formatMoney(1234.5, 'KWD'), /^KWD\s1,234\.500$/);
  assert.equal(formatMoney(null, 'GBP'), '–');
  assert.equal(formatRate(93.959855), '93.96');
  assert.equal(formatRate(0.758255), '0.7583');
  assert.equal(currencyName('AED'), 'United Arab Emirates Dirham');
});

const apiJson = { result: 'success', base_code: 'USD', time_last_update_utc: 'Tue, 17 Nov 2026 00:02:31 +0000', rates: { ...R, BAD: -1, lower: 2, XAU: 'x', ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`Z${String.fromCharCode(65 + i)}A`, i + 1])) } };

test('currency 7: API responses are checked and cleaned', () => {
  const r = parseRatesResponse(apiJson, 5);
  assert.equal(r.rates.GBP, 0.758255);
  assert.equal('BAD' in r.rates || 'lower' in r.rates || 'XAU' in r.rates, false);
  assert.equal(r.updated, Date.parse('2026-11-17T00:02:31Z'));
  assert.equal(r.fetched, 5);
  assert.throws(() => parseRatesResponse({ result: 'error' }));
  assert.throws(() => parseRatesResponse({ ...apiJson, base_code: 'EUR' }));
  assert.throws(() => parseRatesResponse({ ...apiJson, rates: { USD: 1 } }));
});
test('currency 8: the request is a fixed URL with no user data, and failures throw', async () => {
  const calls = [];
  const ok = await fetchRates(async (url, opts) => { calls.push([url, opts]); return { ok: true, json: async () => apiJson }; });
  assert.equal(ok.rates.AED, 3.6725);
  assert.equal(calls[0][0], 'https://open.er-api.com/v6/latest/USD');
  assert.equal(calls[0][1].credentials, 'omit');
  await assert.rejects(fetchRates(async () => ({ ok: false, status: 503 })));
});
test('currency 9: best rates prefers newer downloaded rates over the bundled ones', () => {
  const bundled = { asOf: '2026-11-17', rates: { USD: 1, GBP: 0.7 } };
  assert.equal(bestRates(null, bundled).kind, 'bundled');
  assert.equal(bestRates({ rates: { USD: 1 }, updated: Date.parse('2026-11-10T00:00:00Z') }, bundled).kind, 'bundled');
  assert.equal(bestRates({ rates: { USD: 1 }, updated: Date.parse('2026-11-18T00:00:00Z'), fetched: 1 }, bundled).kind, 'cached');
});
test('currency 10: refresh at most hourly; stale after 3 days', () => {
  const now = Date.parse('2026-11-17T12:00:00Z');
  assert.equal(needsRefresh(null, now), true);
  assert.equal(needsRefresh({ fetched: now - 30 * 60000 }, now), false);
  assert.equal(needsRefresh({ fetched: now - 61 * 60000 }, now), true);
  assert.equal(isStale(now - 2 * 86400000, now), false);
  assert.equal(isStale(now - 4 * 86400000, now), true);
});
test('currency 11: bundled rates cover the seven defaults', () => {
  const c = JSON.parse(readFileSync(`${ROOT}/content/currencies.json`, 'utf8'));
  for (const code of ['USD', 'GBP', 'EUR', 'AED', 'INR', 'CNY', 'AUD']) assert.ok(c.bundledRates.rates[code] > 0, code);
  assert.equal(RATES_URL, c.source.endpoint);
});
