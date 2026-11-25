/**
 * Calendar files (R-036). Each class session becomes an event with a stable
 * UID, so importing a fresh file updates events instead of duplicating them,
 * and a cancelled session arrives as STATUS:CANCELLED. A subscribable feed
 * (a private URL that calendars poll) needs the hosted service; this file is
 * the same content, downloaded.
 */
export type CalEvent = { id: string; title: string; starts_at: string | Date; ends_at: string | Date; location?: string | null;
  description?: string | null; cancelled?: boolean };

const stamp = (iso: string | Date) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 octets are folded, as RFC 5545 requires. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 75) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
}

export function toIcs(name: string, events: CalEvent[], now = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sanaa//Classes//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.id}@sanaa.app`, `DTSTAMP:${stamp(now.toISOString())}`,
      `DTSTART:${stamp(e.starts_at)}`, `DTEND:${stamp(e.ends_at)}`, `SUMMARY:${esc(e.cancelled ? `Cancelled: ${e.title}` : e.title)}`,
      `STATUS:${e.cancelled ? 'CANCELLED' : 'CONFIRMED'}`);
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(filename: string, name: string, events: CalEvent[]) {
  const url = URL.createObjectURL(new Blob([toIcs(name, events)], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
