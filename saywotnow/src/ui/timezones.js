// S11a Time zone converter. Ported from the Worldly Explorer "Seven-Zone Time
// Converter": live "now", set the time in any zone, nudge by 15 minutes or an
// hour, copy all times, and a 24-hour planner you can tap. Values live in this
// screen only; the chosen comparison zones are saved as a preference.

import { html, useState, useEffect, useMemo, useRef } from '../vendor/preact-htm.js';
import { Icon } from './icons.js';
import { content, showDialog, toast } from './core.js';
import { setPref } from '../prefs.js';
import { copyText } from '../platform.js';
import { DateInput } from './fields.js';
import {
  parts, wallToInstant, describe, meetingGrid, summaryText, deviceZone, isValidZone,
  floorMinute, time24, isoDate, pad, cityFromZone, DAY_NAMES,
} from '../lib/calc/timezones.js';

export const MAX_ZONES = 6;

function placeFor(tz) {
  return content().timezones.places.find((p) => p.tz === tz) || null;
}

export function zoneName(tz) {
  const p = placeFor(tz);
  return p ? p.city : cityFromZone(tz);
}

function zoneSub(tz) {
  const p = placeFor(tz);
  if (!p) return tz;
  return p.note ? `${p.country} · ${p.note}` : p.country;
}

function abbrFor(tz, d) {
  const p = placeFor(tz);
  return (p && p.abbr) || d.abbr;
}

/** Comparison zones: the saved preference, else the original tool's regions. */
export function initialZones(saved, from) {
  const list = (saved && saved.length ? saved : content().timezones.defaults).filter(isValidZone);
  return [...new Set(list)].filter((tz) => tz !== from).slice(0, MAX_ZONES);
}

function normalise(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[_/'’-]/g, ' ');
}

function searchPlaces(q, exclude) {
  const places = content().timezones.places;
  const n = normalise(q).trim();
  const seen = new Set();
  const out = [];
  const push = (city, sub, tz) => {
    const key = `${city}|${tz}`;
    if (seen.has(key) || exclude.includes(tz)) return;
    seen.add(key);
    out.push({ city, sub, tz });
  };
  for (const p of places) {
    const hay = normalise(`${p.city} ${p.country} ${p.note || ''} ${p.tz} ${p.abbr || ''}`);
    if (!n || n.split(/\s+/).every((t) => hay.includes(t))) push(p.city, p.note ? `${p.country} · ${p.note}` : p.country, p.tz);
  }
  // Anything else the device knows about, by IANA name.
  if (n && typeof Intl.supportedValuesOf === 'function') {
    for (const tz of Intl.supportedValuesOf('timeZone')) {
      if (normalise(tz).includes(n)) push(cityFromZone(tz), tz, tz);
    }
  }
  return out.slice(0, 40);
}

function ZonePicker({ onPick, exclude }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => searchPlaces(q, exclude), [q]);
  const now = Date.now();
  return html`<div class="zone-picker">
    <div class="search-field compact">
      <${Icon} name="search" />
      <input type="search" value=${q} onInput=${(e) => setQ(e.target.value)} placeholder="City or country" aria-label="Search by city or country"
        autocomplete="off" autocorrect="off" spellcheck="false" data-autofocus />
    </div>
    <p class="sr-only" aria-live="polite">${results.length} result${results.length === 1 ? '' : 's'}</p>
    ${results.length ? html`<ul class="zone-results" role="list">
      ${results.map((r) => {
        const d = describe(r.tz, r.tz, now);
        return html`<li><button type="button" class="zone-result" onClick=${() => onPick(r.tz)}>
          <span><strong>${r.city}</strong><span class="muted"> · ${r.sub}</span></span>
          <span class="mono muted">${d.time} ${abbrFor(r.tz, d)}</span>
        </button></li>`;
      })}
    </ul>` : html`<p class="empty">No matches. Try a capital city nearby.</p>`}
  </div>`;
}

export async function pickZone(title, exclude = []) {
  return showDialog({
    title,
    sheet: true,
    contentFirst: true,
    content: (resolve) => html`<${ZonePicker} onPick=${resolve} exclude=${exclude} />`,
    actions: [{ label: 'Cancel', value: null }],
  });
}

function BandChip({ band }) {
  const icon = band.level === 'work' ? 'check' : band.level === 'edge' ? 'sun' : 'hourglass';
  return html`<span class=${`band-chip band-${band.level}`}><${Icon} name=${icon} size=${14} />${band.label}</span>`;
}

function Planner({ from, zones, instant, onPick }) {
  const all = [from, ...zones];
  const cols = meetingGrid(from, all, instant);
  const sel = cols.findIndex((c, i) => instant >= c.instant && (i === cols.length - 1 || instant < cols[i + 1].instant));
  const shared = cols.filter((c) => c.shared);
  const fp = parts(from, instant);
  const range = shared.length
    ? (() => {
      // Group consecutive shared hours into ranges, in the "from" zone's time.
      const groups = [];
      cols.forEach((c, i) => {
        if (!c.shared) return;
        const last = groups[groups.length - 1];
        if (last && last.end === i - 1) last.end = i; else groups.push({ start: i, end: i });
      });
      return groups.map((g) => {
        const s = parts(from, cols[g.start].instant);
        const e = parts(from, cols[g.end].instant + 3600000);
        return `${time24(s)}–${time24(e)}`;
      }).join(' and ');
    })()
    : null;
  const wrapRef = useRef(null);
  useEffect(() => {
    // Bring the selected hour into view.
    const el = wrapRef.current && wrapRef.current.querySelector('.tz-cell.sel');
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [from, isoDate(fp)]);

  return html`<div>
    <p class="planner-sub">${DAY_NAMES[fp.wd]} ${fp.d} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][fp.m - 1]} in ${zoneName(from)}. Tap an hour to set every zone to it.</p>
    <div class=${`overlap ${shared.length ? 'yes' : 'no'}`} role="status">
      <${Icon} name=${shared.length ? 'check' : 'info'} size=${20} />
      <p>${shared.length
        ? html`Everyone is in working hours from <strong>${range}</strong> ${zoneName(from)} time.`
        : 'There’s no hour on this day when everyone is in working hours. Try another day, or fewer zones.'}</p>
    </div>
    <div class="tz-grid-wrap" ref=${wrapRef} tabindex="0" role="region" aria-label="Hour-by-hour planner">
      <table class="tz-grid">
        <thead><tr><th scope="col"><span class="sr-only">Zone</span></th>
          ${cols.map((c, i) => html`<th scope="col" class=${c.shared ? 'shared' : ''}>${c.shared ? html`<${Icon} name="check" size=${16} label="Everyone in working hours" />` : html`<span class="sr-only">Hour ${i + 1}</span>`}</th>`)}
        </tr></thead>
        <tbody>
          ${all.map((tz, r) => html`<tr class=${r === 0 ? 'ref' : ''}>
            <th scope="row"><span class="tz-row-name">${zoneName(tz)}</span><span class="tz-row-abbr">${abbrFor(tz, describe(tz, from, instant))}</span></th>
            ${cols.map((c, i) => {
              const cell = c.cells[r];
              const newDay = cell.dayOffset && (i === 0 || c.cells[r].p.d !== cols[i - 1].cells[r].p.d);
              return html`<td><button type="button" class=${`tz-cell band-${cell.band.level} ${i === sel ? 'sel' : ''} ${c.shared ? 'shared' : ''}`}
                aria-label=${`${time24(cell.p)} ${DAY_NAMES[cell.p.wd]} in ${zoneName(tz)}, ${cell.band.label.toLowerCase()}${c.shared ? ', everyone in working hours' : ''}`}
                aria-current=${i === sel ? 'time' : undefined} onClick=${() => onPick(c.instant)}>
                ${pad(cell.p.h)}${cell.p.mi ? html`<small>:${pad(cell.p.mi)}</small>` : null}
                ${newDay ? html`<small class="nd">${cell.p.wd}</small>` : null}
              </button></td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>
    <div class="tz-legend" aria-hidden="true">
      <span><i class="sw band-work"></i>Working hours, 08:00–18:00</span>
      <span><i class="sw band-edge"></i>07:00–08:00 and 18:00–20:00</span>
      <span><i class="sw band-off"></i>Outside working hours or weekend</span>
      <span><${Icon} name="check" size=${14} /> Everyone in working hours</span>
    </div>
  </div>`;
}

export function TimeZones({ tool, prefs }) {
  const [from, setFrom] = useState(() => deviceZone());
  const [instant, setInstant] = useState(() => floorMinute(Date.now()));
  const [live, setLive] = useState(true);
  const [skipped, setSkipped] = useState(null);
  const [zones, setZones] = useState(() => initialZones(prefs.savedTimeZones, from));
  const [tab, setTab] = useState('compare');

  // Tick while showing "now".
  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => {
      const now = floorMinute(Date.now());
      setInstant((cur) => (cur === now ? cur : now));
    }, 1000);
    return () => clearInterval(id);
  }, [live]);

  const saveZones = (next) => { setZones(next); setPref('savedTimeZones', next); };
  const fp = parts(from, instant);

  const setWall = (dateStr, timeStr) => {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    const t = /^(\d{2}):(\d{2})/.exec(timeStr);
    if (!d || !t) return;
    const ms = wallToInstant(from, +d[1], +d[2], +d[3], +t[1], +t[2]);
    const shown = time24(parts(from, ms));
    setSkipped(shown !== `${t[1]}:${t[2]}` ? { asked: `${t[1]}:${t[2]}`, shown } : null);
    setInstant(ms); setLive(false);
  };
  const shift = (mins) => { setInstant(instant + mins * 60000); setLive(false); setSkipped(null); };
  const backToNow = () => { setInstant(floorMinute(Date.now())); setLive(true); setSkipped(null); };

  const changeFrom = async () => {
    const tz = await pickZone('Set the time in…', []);
    if (!tz) return;
    // Keep the same moment; swap the old "from" zone into the list if it's not there.
    const next = zones.filter((z) => z !== tz);
    if (!next.includes(from) && next.length < MAX_ZONES) next.unshift(from);
    setFrom(tz); saveZones(next); setSkipped(null);
  };
  const makeFrom = (tz) => {
    const next = zones.map((z) => (z === tz ? from : z));
    setFrom(tz); saveZones(next); setSkipped(null);
    toast(`Now setting the time in ${zoneName(tz)}.`, 2000);
  };
  const add = async () => {
    const tz = await pickZone('Add a time zone', [from, ...zones]);
    if (tz) saveZones([...zones, tz]);
  };
  const remove = (tz) => saveZones(zones.filter((z) => z !== tz));

  const copyAll = async () => {
    try { await copyText(summaryText(from, zones, instant, zoneName)); toast('Times copied.', 1800); } catch { toast("Couldn't copy."); }
  };

  const fromD = describe(from, from, instant);
  const tabs = [['compare', 'Compare'], ['planner', 'Find a meeting time']];

  return html`<div class="tz-tool">
    <section class="tz-from" aria-labelledby="tz-from-h">
      <div class="tz-from-head">
        <h2 id="tz-from-h" class="mini-title">Time in</h2>
        <span class=${`live ${live ? 'on' : ''}`}><span class="dot"></span>${live ? 'Live: the time now' : 'Time you’ve set'}</span>
      </div>
      <button type="button" class="zone-btn" onClick=${changeFrom} aria-label=${`Time zone: ${zoneName(from)}. Change`}>
        <span class="zone-btn-text"><strong>${zoneName(from)}</strong>
          <span class="muted small">${zoneSub(from)} · <span class="mono">${abbrFor(from, fromD)}, ${fromD.offset}</span></span></span>
        <${Icon} name="down" size=${20} />
      </button>
      <div class="tz-inputs">
        <div><label class="sub-label" for="tz-time">Time</label>
          <input id="tz-time" class="input tz-time" type="time" value=${time24(fp)} onChange=${(e) => setWall(isoDate(fp), e.target.value)} onInput=${(e) => setWall(isoDate(fp), e.target.value)} /></div>
        <div><label class="sub-label" for="tz-date">Date <span class="muted">(${fp.wd})</span></label>
          <${DateInput} id="tz-date" value=${isoDate(fp)} required label="Date" onChange=${(v) => setWall(v, time24(fp))} /></div>
      </div>
      ${skipped ? html`<p class="field-help tz-skip"><${Icon} name="info" size=${16} /> ${skipped.asked} doesn't exist on this date because the clocks go forward, so it's showing ${skipped.shown}.</p>` : null}
      <div class="tz-shift" role="group" aria-label="Shift the time">
        <button type="button" class="btn btn-small btn-ghost" onClick=${() => shift(-60)} aria-label="Back 1 hour">−1 h</button>
        <button type="button" class="btn btn-small btn-ghost" onClick=${() => shift(-15)} aria-label="Back 15 minutes">−15 m</button>
        <button type="button" class="btn btn-small btn-ghost" onClick=${() => shift(15)} aria-label="Forward 15 minutes">+15 m</button>
        <button type="button" class="btn btn-small btn-ghost" onClick=${() => shift(60)} aria-label="Forward 1 hour">+1 h</button>
        ${live ? null : html`<button type="button" class="btn btn-small btn-secondary" onClick=${backToNow}>Now</button>`}
      </div>
    </section>

    <div class="tabs tz-tabs" role="tablist" aria-label="View">
      ${tabs.map(([k, label]) => html`<button type="button" role="tab" id=${`tzt-${k}`} aria-selected=${tab === k} aria-controls=${`tzp-${k}`}
        tabindex=${tab === k ? 0 : -1} class=${tab === k ? 'on' : ''} onClick=${() => setTab(k)}
        onKeyDown=${(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tab === 'compare' ? 'planner' : 'compare'; setTab(n); document.getElementById(`tzt-${n}`)?.focus(); } }}>${label}</button>`)}
    </div>

    <div id=${`tzp-${tab}`} role="tabpanel" aria-labelledby=${`tzt-${tab}`} class="tab-panel">
      ${tab === 'compare' ? html`
        <ul class="tz-list" role="list">
          ${zones.map((tz) => {
            const d = describe(tz, from, instant);
            return html`<li class="tz-row" key=${tz}>
              <div class="tz-who">
                <span class="tz-name">${zoneName(tz)}</span>
                <span class="tz-sub">${zoneSub(tz)}</span>
                <span class="mono muted small">${abbrFor(tz, d)} · ${d.offset}</span>
              </div>
              <div class="tz-when">
                <button type="button" class="tz-big" onClick=${() => makeFrom(tz)} aria-label=${`${d.time} on ${DAY_NAMES[d.p.wd]} in ${zoneName(tz)}. Set the time here instead`}>${d.time}</button>
                <span class="tz-date">${d.date}${d.dayOffset ? html` <span class="day-chip">${d.dayOffset}</span>` : null}</span>
              </div>
              <div class="tz-state">
                <${BandChip} band=${d.band} />
                <button type="button" class="icon-btn small" aria-label=${`Remove ${zoneName(tz)}`} onClick=${() => remove(tz)}><${Icon} name="trash" size=${18} /></button>
              </div>
            </li>`;
          })}
        </ul>
        ${zones.length === 0 ? html`<p class="empty">Add a time zone to compare.</p>` : null}
        <div class="btn-row">
          ${zones.length < MAX_ZONES ? html`<button type="button" class="btn btn-ghost" onClick=${add}><${Icon} name="plus" size=${18} /> Add a time zone</button>` : html`<p class="muted small">You can compare up to ${MAX_ZONES} zones.</p>`}
          ${zones.length ? html`<button type="button" class="btn btn-ghost" onClick=${copyAll}><${Icon} name="copy" size=${18} /> Copy all times</button>` : null}
        </div>
        <p class="muted small">Tap a time to set the time in that zone instead.</p>`
      : html`<${Planner} from=${from} zones=${zones} instant=${instant} onPick=${(ms) => { setInstant(ms); setLive(false); setSkipped(null); }} />`}
    </div>
  </div>`;
}
