// Date helpers. Dates are held as ISO strings ("2026-11-16") and handled in UTC
// so that daylight saving never shifts a day.

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isISODate(s) {
  if (typeof s !== 'string') return false;
  const m = ISO_RE.exec(s);
  if (!m) return false;
  const d = toDate(s);
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

export function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${String(y).padStart(4, '0')}-${m}-${d}`;
}

/** Today's date on the device, as an ISO string (local calendar date). */
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "16 Nov 2026" */
export function formatShort(iso) {
  if (!isISODate(iso)) return '';
  const d = toDate(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "16 November 2026" */
export function formatLong(iso) {
  if (!isISODate(iso)) return '';
  const d = toDate(iso);
  return `${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Monday 16 November 2026" */
export function formatWithDay(iso) {
  if (!isISODate(iso)) return '';
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][toDate(iso).getUTCDay()];
  return `${day} ${formatLong(iso)}`;
}

export function addDays(iso, n) {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fromDate(d);
}

/** Adds calendar months, clamping to the end of a shorter month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const total = (m - 1) + n;
  const ty = y + Math.floor(total / 12);
  const tm = ((total % 12) + 12) % 12;
  const last = daysInMonth(ty, tm);
  return fromDate(new Date(Date.UTC(ty, tm, Math.min(d, last))));
}

export function addYears(iso, n) {
  return addMonths(iso, n * 12);
}

export function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Signed difference in days: b - a. */
export function diffDays(a, b) {
  return Math.round((toDate(b) - toDate(a)) / 86400000);
}

/** Inclusive count of calendar days from a to b (a <= b). */
export function daysInclusive(a, b) {
  return diffDays(a, b) + 1;
}

export function compareISO(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function maxISO(a, b) { return compareISO(a, b) >= 0 ? a : b; }
export function minISO(a, b) { return compareISO(a, b) <= 0 ? a : b; }

/** Whole completed months between two dates (the anniversary day must be reached). */
export function completedMonths(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  let months = (ty - fy) * 12 + (tm - fm);
  // Anniversary day, clamped for short months.
  const anniversaryDay = Math.min(fd, daysInMonth(ty, tm - 1));
  if (td < anniversaryDay) months -= 1;
  return Math.max(0, months);
}
