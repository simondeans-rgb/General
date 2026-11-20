// Currency converter: conversion maths, formatting and rate handling.
// Rates are "units per 1 USD", as the Exchange Rate API returns them.

export const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
export const REFRESH_AFTER_MS = 60 * 60 * 1000; // at most one request an hour
export const STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // warn when rates are over 3 days old

const CODE_RE = /^[A-Z]{3}$/;

/** Parses "1,234.50", "£1234", " 12.3 " → number, or null. */
export function parseAmount(text) {
  if (text === null || text === undefined) return null;
  const s = String(text).replace(/[\s,£$€¥₹]/g, '').replace(/^[A-Z]{3}/i, '');
  if (s === '' || !/^\d*\.?\d*$/.test(s) || s === '.') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 1e12 ? n : null;
}

/** Converts an amount between two currencies using USD-based rates. */
export function convert(amount, from, to, rates) {
  if (amount === null || !rates[from] || !rates[to]) return null;
  return (amount / rates[from]) * rates[to];
}

/** 1 `from` = x `to`. */
export function unitRate(from, to, rates) {
  return convert(1, from, to, rates);
}

const fmtCache = new Map();
function formatter(code, opts = {}) {
  const key = code + JSON.stringify(opts);
  if (!fmtCache.has(key)) fmtCache.set(key, new Intl.NumberFormat('en-GB', { style: 'currency', currency: code, ...opts }));
  return fmtCache.get(key);
}

export function formatMoney(amount, code) {
  if (amount === null || !Number.isFinite(amount)) return '–';
  return formatter(code).format(amount);
}

/** A rate with enough significant figures to be useful (0.0106, 93.96, 1,234.5). */
export function formatRate(x) {
  if (x === null || !Number.isFinite(x)) return '–';
  const digits = x >= 100 ? 2 : x >= 1 ? 4 : 4;
  return new Intl.NumberFormat('en-GB', { maximumSignificantDigits: x >= 100 ? undefined : 4, maximumFractionDigits: digits }).format(x);
}

export function currencyName(code) {
  try { return new Intl.DisplayNames('en-GB', { type: 'currency' }).of(code) || code; } catch { return code; }
}

export function decimalsFor(code) {
  try { return formatter(code).resolvedOptions().maximumFractionDigits; } catch { return 2; }
}

/**
 * Checks an API response and returns clean rates, or throws. Only 3-letter
 * codes with positive finite numbers are kept; USD must be 1.
 */
export function parseRatesResponse(json, now = Date.now()) {
  if (!json || json.result !== 'success' || json.base_code !== 'USD' || typeof json.rates !== 'object') throw new Error('Unexpected response');
  const rates = {};
  for (const [k, v] of Object.entries(json.rates)) {
    if (CODE_RE.test(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) rates[k] = v;
  }
  if (rates.USD !== 1 || Object.keys(rates).length < 20) throw new Error('Incomplete rates');
  const updated = Date.parse(json.time_last_update_utc);
  return { base: 'USD', rates, updated: Number.isFinite(updated) ? updated : now, fetched: now };
}

/** Fetches live rates. Sends nothing but the fixed URL: no amounts, no locations. */
export async function fetchRates(fetchFn = fetch, { timeoutMs = 8000 } = {}) {
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetchFn(RATES_URL, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctrl?.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseRatesResponse(await res.json());
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Picks the best rates available: the cached live rates if present and newer
 * than the bundled ones, else the bundled rates.
 * Returns { rates, updated, kind: 'live' | 'cached' | 'bundled' }.
 */
export function bestRates(cached, bundled) {
  const bundledTime = Date.parse(`${bundled.asOf}T00:00:00Z`);
  if (cached && cached.rates && cached.updated >= bundledTime) return { rates: cached.rates, updated: cached.updated, fetched: cached.fetched, kind: 'cached' };
  return { rates: bundled.rates, updated: bundledTime, kind: 'bundled' };
}

export function needsRefresh(cached, now = Date.now()) {
  return !cached || !cached.fetched || now - cached.fetched > REFRESH_AFTER_MS;
}

export function isStale(updated, now = Date.now()) {
  return now - updated > STALE_AFTER_MS;
}
