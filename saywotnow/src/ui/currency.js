// S11g Currency converter. Pick locations and see an amount in each one's
// local currency. Rates come from the Exchange Rate API when online (the
// app's only network request: a fixed URL, with no amounts or locations),
// fall back to the last rates downloaded, then to rates bundled with the app.

import { html, useState, useEffect, useMemo } from '../vendor/preact-htm.js';
import { Icon } from './icons.js';
import { content, showDialog, toast } from './core.js';
import { setPref } from '../prefs.js';
import { copyText } from '../platform.js';
import {
  parseAmount, convert, unitRate, formatMoney, formatRate, currencyName, fetchRates, bestRates, needsRefresh, isStale,
} from '../lib/calc/currency.js';

export const MAX_PLACES = 8;

const keyOf = (p) => `${p.city}|${p.country}`;

function allPlaces() {
  const c = content();
  const map = c.currencies.countryCurrency;
  const seen = new Set();
  const out = [];
  for (const p of c.timezones.places) {
    const code = map[p.country];
    if (!code) continue;
    const k = keyOf(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ key: k, city: p.city, country: p.country, code });
  }
  return out;
}

function placeByKey(k) {
  return allPlaces().find((p) => p.key === k) || null;
}

export function initialPlaces(saved) {
  const list = (saved && saved.length ? saved : content().currencies.defaults).filter((k) => placeByKey(k));
  return [...new Set(list)].slice(0, MAX_PLACES);
}

function norm(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function PlacePicker({ onPick, exclude }) {
  const [q, setQ] = useState('');
  const places = useMemo(allPlaces, []);
  const n = norm(q).trim();
  const results = places.filter((p) => !exclude.includes(p.key)
    && (!n || n.split(/\s+/).every((t) => norm(`${p.city} ${p.country} ${p.code} ${currencyName(p.code)}`).includes(t)))).slice(0, 40);
  return html`<div class="zone-picker">
    <div class="search-field compact">
      <${Icon} name="search" />
      <input type="search" value=${q} onInput=${(e) => setQ(e.target.value)} placeholder="City, country or currency" aria-label="Search by city, country or currency"
        autocomplete="off" autocorrect="off" spellcheck="false" data-autofocus />
    </div>
    <p class="sr-only" aria-live="polite">${results.length} result${results.length === 1 ? '' : 's'}</p>
    ${results.length ? html`<ul class="zone-results" role="list">
      ${results.map((p) => html`<li><button type="button" class="zone-result" onClick=${() => onPick(p.key)}>
        <span><strong>${p.city}</strong><span class="muted"> · ${p.country}</span></span>
        <span class="muted"><span class="mono">${p.code}</span> ${currencyName(p.code)}</span>
      </button></li>`)}
    </ul>` : html`<p class="empty">No matches. Try the country or currency name.</p>`}
  </div>`;
}

function pickPlace(title, exclude) {
  return showDialog({
    title, sheet: true, contentFirst: true,
    content: (resolve) => html`<${PlacePicker} onPick=${resolve} exclude=${exclude} />`,
    actions: [{ label: 'Cancel', value: null }],
  });
}

function fmtWhen(ms) {
  if (!ms) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(ms);
}
function fmtDay(ms) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(ms);
}

export function Currency({ tool, prefs }) {
  const c = content();
  const bundled = c.currencies.bundledRates;
  const source = c.currencies.source;
  const [places, setPlaces] = useState(() => initialPlaces(prefs.savedCurrencyPlaces));
  const [fromKey, setFromKey] = useState(() => initialPlaces(prefs.savedCurrencyPlaces)[0]);
  const [amountText, setAmountText] = useState('100');
  const [status, setStatus] = useState('idle'); // idle | loading | live | failed
  const best = bestRates(prefs.currencyRates, bundled);
  const { rates } = best;

  const refresh = async ({ manual = false } = {}) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus('failed'); if (manual) toast("You're offline. Using the last rates saved."); return; }
    setStatus('loading');
    try {
      const fresh = await fetchRates();
      setPref('currencyRates', fresh);
      setStatus('live');
      if (manual) toast('Rates updated.', 1800);
    } catch {
      setStatus('failed');
      if (manual) toast("Couldn't update the rates. Using the last rates saved.");
    }
  };

  // Fetch live rates when the page opens (at most once an hour).
  useEffect(() => {
    if (needsRefresh(prefs.currencyRates)) refresh();
    else setStatus('live');
  }, []);

  const save = (next) => { setPlaces(next); setPref('savedCurrencyPlaces', next); };
  const from = placeByKey(fromKey) || placeByKey(places[0]) || allPlaces()[0];
  const amount = parseAmount(amountText);
  const others = places.filter((k) => k !== from.key).map(placeByKey).filter(Boolean);

  const changeFrom = async () => {
    const k = await pickPlace('Convert from…', []);
    if (!k) return;
    if (!places.includes(k)) save([k, ...places].slice(0, MAX_PLACES));
    setFromKey(k);
  };
  const add = async () => {
    const k = await pickPlace('Add a location', places);
    if (k) save([...places, k]);
  };
  const remove = (k) => {
    const next = places.filter((x) => x !== k);
    save(next);
    if (k === from.key && next.length) setFromKey(next[0]);
  };
  const makeFrom = (p) => {
    // Keep the same value: the converted amount becomes the new amount.
    const v = convert(amount, from.code, p.code, rates);
    if (v !== null) setAmountText(String(Math.round(v * 100) / 100));
    setFromKey(p.key);
  };
  const copyAll = async () => {
    const lines = [`${formatMoney(amount, from.code)} (${from.city}, ${from.country}) is:`,
      ...others.map((p) => `${p.city}, ${p.country}: ${formatMoney(convert(amount, from.code, p.code, rates), p.code)}`),
      `Rates as at ${best.kind === 'bundled' ? fmtDay(best.updated) : fmtWhen(best.updated)}. ${source.attribution}.`];
    try { await copyText(lines.join('\n')); toast('Amounts copied.', 1800); } catch { toast("Couldn't copy."); }
  };

  const stale = isStale(best.updated);
  const statusLine = status === 'loading' ? 'Updating rates…'
    : best.kind === 'cached' ? `Rates updated ${fmtWhen(best.updated)}`
      : `Using rates built into the app, as at ${fmtDay(best.updated)}`;

  return html`<div class="cur-tool">
    <section class="tz-from" aria-labelledby="cur-from-h">
      <div class="tz-from-head">
        <h2 id="cur-from-h" class="mini-title">Convert</h2>
        <span class=${`live ${best.kind === 'cached' && status !== 'failed' && !stale ? 'on' : ''}`}><span class="dot"></span>${best.kind === 'cached' && status !== 'failed' ? 'Live rates' : 'Offline rates'}</span>
      </div>
      <div class="cur-amount">
        <label class="sub-label" for="cur-amount">Amount in ${from.code}</label>
        <div class="cur-amount-field">
          <span class="cur-code" aria-hidden="true">${from.code}</span>
          <input id="cur-amount" class="input" type="text" inputmode="decimal" value=${amountText} autocomplete="off" autocorrect="off" spellcheck="false"
            aria-invalid=${amountText && amount === null ? 'true' : undefined} aria-describedby=${amountText && amount === null ? 'cur-amount-e' : undefined}
            onInput=${(e) => setAmountText(e.target.value)} onFocus=${(e) => e.target.select()} />
        </div>
        ${amountText && amount === null ? html`<p id="cur-amount-e" class="field-error" role="alert">Enter an amount, like 250 or 1,250.50.</p>` : null}
      </div>
      <button type="button" class="zone-btn" onClick=${changeFrom} aria-label=${`Converting from ${from.city}, ${currencyName(from.code)}. Change`}>
        <span class="zone-btn-text"><strong>${from.city}</strong>
          <span class="muted small">${from.country} · <span class="mono">${from.code}</span> ${currencyName(from.code)}</span></span>
        <${Icon} name="down" size=${20} />
      </button>
    </section>

    <ul class="tz-list cur-list" role="list" aria-label="Converted amounts">
      ${others.map((p) => {
        const v = convert(amount, from.code, p.code, rates);
        const r = unitRate(from.code, p.code, rates);
        return html`<li class="tz-row" key=${p.key}>
          <div class="tz-who">
            <span class="tz-name">${p.city}</span>
            <span class="tz-sub">${p.country}</span>
            <span class="muted small"><span class="mono">${p.code}</span> · ${currencyName(p.code)}</span>
          </div>
          <div class="tz-when">
            <button type="button" class="tz-big cur-big" onClick=${() => makeFrom(p)} aria-label=${`${formatMoney(v, p.code)} in ${p.city}. Convert from ${p.code} instead`}>${formatMoney(v, p.code)}</button>
            <span class="tz-date mono">1 ${from.code} = ${formatRate(r)} ${p.code}</span>
          </div>
          <div class="tz-state">
            <span></span>
            <button type="button" class="icon-btn small" aria-label=${`Remove ${p.city}`} onClick=${() => remove(p.key)}><${Icon} name="trash" size=${18} /></button>
          </div>
        </li>`;
      })}
    </ul>
    ${others.length === 0 ? html`<p class="empty">Add a location to convert to.</p>` : null}
    <div class="btn-row">
      ${places.length < MAX_PLACES ? html`<button type="button" class="btn btn-ghost" onClick=${add}><${Icon} name="plus" size=${18} /> Add a location</button>` : html`<p class="muted small">You can compare up to ${MAX_PLACES} locations.</p>`}
      ${others.length ? html`<button type="button" class="btn btn-ghost" onClick=${copyAll}><${Icon} name="copy" size=${18} /> Copy all amounts</button>` : null}
    </div>
    <p class="muted small">Tap an amount to convert from that currency instead.</p>

    <div class="rates-status" role="status">
      <p><${Icon} name=${status === 'loading' ? 'hourglass' : best.kind === 'cached' ? 'check' : 'info'} size=${18} /> ${statusLine}.
        ${status === 'failed' ? ' Couldn’t reach the rates service, so these may be out of date.' : ''}
        ${stale && status !== 'loading' ? ' These rates are more than 3 days old.' : ''}</p>
      <div class="btn-row">
        <button type="button" class="btn btn-small btn-secondary" disabled=${status === 'loading'} onClick=${() => refresh({ manual: true })}>
          <${Icon} name="globe" size=${18} /> Update rates</button>
        <a class="link small" href=${source.url} target="_blank" rel="noopener noreferrer">${source.attribution}</a>
      </div>
    </div>
  </div>`;
}
