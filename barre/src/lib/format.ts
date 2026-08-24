/** Formatting used across the app. Money is stored in minor units and only
 *  ever divided here; times are rendered in the studio's timezone. */
const TZ = 'Europe/London';

/** Postgres timestamps arrive as Date objects through the driver and as ISO
 *  strings through JSON. Everything below goes through here so neither shape
 *  can reach a string method that only one of them has. */
export type Stamp = string | Date;
export const toDate = (v: Stamp): Date => (v instanceof Date ? v : new Date(v));
/** yyyy-mm-dd in the studio's timezone — safe for grouping and sorting. */
export const isoDate = (v: Stamp): string => {
  const d = toDate(v);
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const money = (minor: number | string | null | undefined) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
    .format(Number(minor ?? 0) / 100);

export const time = (v: Stamp) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
    .format(toDate(v));

export const dayName = (v: Stamp) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: TZ }).format(toDate(v));

export const dateLong = (v: Stamp) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })
    .format(toDate(v));

export const dateShort = (v: Stamp | null | undefined) =>
  v ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: TZ })
    .format(toDate(v)) : '—';

export function relativeDay(v: Stamp): string {
  const d = toDate(v);
  const today = new Date();
  const days = Math.round(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
     Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1 && days < 7) return dayName(d);
  return dateShort(d);
}

export const initials = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).map(p => p!.trim()[0]?.toUpperCase() ?? '').join('').slice(0, 2);

export function ageFrom(dob: Stamp | null | undefined): number | null {
  if (!dob) return null;
  const d = toDate(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Start and end of the local day, as UTC instants for a timestamptz range. */
export function dayRange(offsetDays = 0): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()];
}

export function weekRange(anchor: Date): [string, string] {
  const start = new Date(anchor);
  const dow = (start.getDay() + 6) % 7;              // Monday-first
  start.setDate(start.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return [start.toISOString(), end.toISOString()];
}

export const greeting = (): string => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
