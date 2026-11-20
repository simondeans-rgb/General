// Time zone converter (spec Section 10.1). Ported from the Worldly Explorer
// "Seven-Zone Time Converter": the same Intl-based maths, so daylight saving
// comes from the platform's own time zone data and needs no network.

const partFormatters = new Map();

/** Wall-clock parts of an instant in a zone. */
export function parts(tz, ms) {
  let f = partFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric',
    });
    partFormatters.set(tz, f);
  }
  const o = {};
  for (const p of f.formatToParts(ms)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: (+o.hour) % 24, mi: +o.minute, wd: o.weekday };
}

/** Minutes the zone is ahead of UTC at an instant. */
export function offsetMinutes(tz, ms) {
  const p = parts(tz, ms);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi);
  return Math.round((asUtc - Math.floor(ms / 60000) * 60000) / 60000);
}

/**
 * The instant at which a zone's clock shows y-m-d h:mi. A time skipped when the
 * clocks go forward lands just after the change (e.g. 01:30 becomes 02:30 BST).
 */
export function wallToInstant(tz, y, m, d, h, mi) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const o1 = offsetMinutes(tz, guess);
  let t = guess - o1 * 60000;
  const o2 = offsetMinutes(tz, t);
  if (o2 !== o1) t = guess - o2 * 60000;
  return t;
}

export function isValidZone(tz) {
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return true; } catch { return false; }
}

export function deviceZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'; } catch { return 'Europe/London'; }
}

const abbrFormatters = new Map();
// As in the original tool, US and Australian zones only get their familiar
// abbreviations (EST, AEDT…) from their own locale.
function abbrLocale(tz) {
  if (tz.startsWith('America/') || tz === 'Pacific/Honolulu') return 'en-US';
  if (tz.startsWith('Australia/')) return 'en-AU';
  if (tz === 'Pacific/Auckland') return 'en-NZ';
  return 'en-GB';
}

/** Short name like "GMT", "BST", "CET", "EST"; falls back to the UTC offset. */
export function abbreviation(tz, ms) {
  let f = abbrFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat(abbrLocale(tz), { timeZone: tz, timeZoneName: 'short' });
    abbrFormatters.set(tz, f);
  }
  const v = f.formatToParts(ms).find((p) => p.type === 'timeZoneName')?.value || '';
  // Zones without a common abbreviation come back as "GMT+4": show the UTC offset instead.
  if (!v || /^(GMT|UTC)([+−-]|$)/.test(v) && !(v === 'GMT' && /^Europe\/(London|Dublin|Lisbon|Jersey|Guernsey|Isle_of_Man)$/.test(tz))) {
    return offsetLabel(offsetMinutes(tz, ms));
  }
  return v;
}

export function offsetLabel(min) {
  if (min === 0) return 'UTC+0';
  const sign = min > 0 ? '+' : '−';
  const a = Math.abs(min); const h = Math.floor(a / 60); const m = a % 60;
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

export const pad = (n) => String(n).padStart(2, '0');
export const floorMinute = (ms) => Math.floor(ms / 60000) * 60000;
export const time24 = (p) => `${pad(p.h)}:${pad(p.mi)}`;
const dayIndex = (p) => Date.UTC(p.y, p.m - 1, p.d) / 86400000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
export const shortDate = (p) => `${p.wd} ${p.d} ${MONTHS[p.m - 1]}`;
export const isoDate = (p) => `${p.y}-${pad(p.m)}-${pad(p.d)}`;

/**
 * Working-hours band (spec 10.1): green 08:00–18:00, amber 07:00–08:00 and
 * 18:00–20:00, grey otherwise. Weekends are grey too.
 */
export function band(p) {
  const mins = p.h * 60 + p.mi;
  if (p.wd === 'Sat' || p.wd === 'Sun') return { level: 'off', label: 'Weekend' };
  if (mins >= 8 * 60 && mins < 18 * 60) return { level: 'work', label: 'Working hours' };
  if (mins >= 7 * 60 && mins < 8 * 60) return { level: 'edge', label: 'Early' };
  if (mins >= 18 * 60 && mins < 20 * 60) return { level: 'edge', label: 'Evening' };
  return { level: 'off', label: 'Outside working hours' };
}

/** "+1 day", "−1 day" or "" relative to the reference zone's date. */
export function dayOffset(tz, refTz, ms) {
  const diff = dayIndex(parts(tz, ms)) - dayIndex(parts(refTz, ms));
  if (!diff) return '';
  return `${diff > 0 ? '+' : '−'}${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`;
}

/** One row of the comparison list. */
export function describe(tz, refTz, ms) {
  const p = parts(tz, ms);
  return {
    tz, p, time: time24(p), date: shortDate(p),
    abbr: abbreviation(tz, ms), offset: offsetLabel(offsetMinutes(tz, ms)),
    dayOffset: dayOffset(tz, refTz, ms), band: band(p),
  };
}

/**
 * The "Find a meeting time" grid: 24 hourly columns from midnight on the
 * reference zone's date. A column is shared when every zone is in working hours.
 */
export function meetingGrid(refTz, zones, ms) {
  const rp = parts(refTz, ms);
  const start = wallToInstant(refTz, rp.y, rp.m, rp.d, 0, 0);
  const columns = [];
  // 23 or 25 hours on clock-change days: step by real hours until the date changes.
  for (let t = start; ; t += 3600000) {
    const p = parts(refTz, t);
    if (columns.length && isoDate(p) !== isoDate(rp)) break;
    if (columns.length > 26) break;
    const cells = zones.map((tz) => {
      const zp = parts(tz, t);
      return { tz, p: zp, band: band(zp), dayOffset: dayOffset(tz, refTz, t) };
    });
    columns.push({ instant: t, cells, shared: cells.every((c) => c.band.level === 'work') });
  }
  return columns;
}

/** Plain-text summary for "Copy all times". */
export function summaryText(refTz, zones, ms, nameOf = (tz) => tz) {
  const rp = parts(refTz, ms);
  const lines = [`${time24(rp)} ${nameOf(refTz)} time (${DAY_NAMES[rp.wd]} ${rp.d} ${MONTHS[rp.m - 1]}) is:`];
  for (const tz of zones) {
    const d = describe(tz, refTz, ms);
    lines.push(`${nameOf(tz)} (${d.abbr}): ${d.time}, ${d.date}${d.dayOffset ? ` (${d.dayOffset})` : ''}`);
  }
  return lines.join('\n');
}

/** City name from an IANA id: "America/New_York" → "New York". */
export function cityFromZone(tz) {
  return tz.split('/').pop().replace(/_/g, ' ');
}
