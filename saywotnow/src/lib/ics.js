// Calendar export (P2.4): builds an iCalendar (.ics) file on the device for the
// dates agreed in a meeting. Nothing is synced, scheduled or stored by SayWotNow;
// once imported, the entries belong to the person's calendar provider.
// All-day events, so there are no time zone surprises.
import { isEmptyValue } from './rules.js';
import { activeFields } from './engine.js';
import { firstName } from './email.js';

const CRLF = '\r\n';

/** RFC 5545 text escaping. */
export function escapeText(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Folds a content line at 75 octets (UTF-8), never splitting a character. */
export function fold(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out = [];
  let cur = '';
  let limit = 75;
  for (const ch of line) {
    if (enc.encode(cur + ch).length > limit) { out.push(cur); cur = ''; limit = 74; }
    cur += ch;
  }
  out.push(cur);
  return out.join(`${CRLF} `);
}

const ymd = (iso) => iso.replace(/-/g, '');
function nextDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return t.toISOString().slice(0, 10);
}
const stamp = (now) => now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/**
 * The dates worth putting in a calendar for this form.
 * Default titles are generic (no names or action wording); detailed adds them.
 */
export function calendarEvents(template, state, { detailed = false } = {}) {
  const v = state.values;
  const who = detailed && v.employeeName ? ` – ${firstName(v.employeeName)}` : '';
  const events = [];
  for (const { field } of activeFields(template, state)) {
    const value = v[field.id];
    if (isEmptyValue(value)) continue;
    if (field.type === 'date' && field.calendar && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      events.push({ date: value, title: `${field.calendar}${who}`, description: `From your ${template.name} on SayWotNow.` });
    }
    if (field.type === 'actionList') {
      for (const r of value) {
        if (!r.due || !/^\d{4}-\d{2}-\d{2}$/.test(r.due) || isEmptyValue(r.action)) continue;
        events.push({
          date: r.due,
          title: detailed ? `Action due: ${String(r.action).trim()}${who}` : `Action due (${template.name})`,
          description: detailed && r.owner ? `Owner: ${r.owner}.` : `From your ${template.name} on SayWotNow.`,
        });
      }
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function buildIcs(events, { now = new Date(), uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}` } = {}) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SayWotNow//Meeting dates//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid()}@saywotnow.app`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(e.date))}`,
      `SUMMARY:${escapeText(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join(CRLF) + CRLF;
}
