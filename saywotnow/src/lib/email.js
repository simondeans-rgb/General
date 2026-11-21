// Builds the plain-text email summary from a template and its in-memory form state.

import { activeFields, filledRows, sendMode } from './engine.js';
import { isEmptyValue } from './rules.js';
import { formatShort } from './dates.js';

const NL = '\n';

export function firstName(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || '';
}

function lowerFirst(s) {
  if (!s) return '';
  if (/^[A-Z]{2}/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Joins a label and a value on one line: "Label: value", or "Question? value". */
function inline(label, value) {
  if (!label) return value;
  return /[?:]$/.test(label) ? `${label} ${value}` : `${label}: ${value}`;
}

function block(label, value) {
  if (!label) return value;
  return /[?:]$/.test(label) ? `${label}${NL}${value}` : `${label}:${NL}${value}`;
}

function cleanText(s) {
  return String(s).replace(/\r\n?/g, NL).replace(/[ \t]+$/gm, '').trim();
}

export function formatRating(value, labels) {
  const label = labels && labels[value - 1];
  return label ? `${value}/5 – ${label}` : `${value}/5`;
}

function formatNumber(v) {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : String(n).replace(/\.5$/, '.5');
}

function formatSubValue(field, value, ratingScales) {
  switch (field.type) {
    case 'date': return formatShort(value);
    case 'rating': return formatRating(value, ratingScales[field.scale]);
    case 'multiChoice': return value.join(', ');
    default: return cleanText(value);
  }
}

/** Formats one field into lines of text, or returns null if there's nothing to say. */
export function formatField(field, value, ratingScales = {}) {
  if (isEmptyValue(value)) return null;
  const label = field.emailLabel === false ? '' : (field.emailLabelText || field.label);
  switch (field.type) {
    case 'longText':
      return block(label, cleanText(value));
    case 'shortText':
    case 'email':
      return inline(label, cleanText(value));
    case 'number':
      return inline(label, formatNumber(value));
    case 'date':
      return inline(label, formatShort(value));
    case 'dateRange':
      if (!value.from && !value.to) return null;
      return inline(label, `${formatShort(value.from)} – ${formatShort(value.to)}`);
    case 'rating':
      return inline(label, formatRating(value, ratingScales[field.scale]));
    case 'singleChoice':
      return inline(label, value);
    case 'multiChoice':
      return inline(label, value.join(', '));
    case 'checklist': {
      const done = field.options.filter((o) => value.includes(o));
      const todo = field.options.filter((o) => !value.includes(o));
      const lines = [];
      if (label) lines.push(label);
      if (done.length) lines.push(`Done: ${done.join(', ')}`);
      if (todo.length) lines.push(`Still to sort: ${todo.join(', ')}`);
      return lines.join(NL);
    }
    case 'actionList': {
      const rows = filledRows(value);
      if (!rows.length) return null;
      const lines = rows.map((r, i) => {
        const parts = [cleanText(r.action)];
        if (r.owner) parts.push(`Owner: ${r.owner}`);
        if (r.due) parts.push(`Due: ${formatShort(r.due)}`);
        return `${i + 1}. ${parts.join(' – ')}`;
      });
      return label ? [label, ...lines].join(NL) : lines.join(NL);
    }
    case 'repeater': {
      const rows = filledRows(value);
      if (!rows.length) return null;
      const primary = field.fields.find((f) => f.primary) || field.fields[0];
      const items = rows.map((r, i) => {
        const head = [cleanText(r[primary.id])];
        const tail = [];
        for (const sf of field.fields) {
          if (sf === primary || isEmptyValue(r[sf.id])) continue;
          if (sf.type === 'longText') tail.push(cleanText(r[sf.id]).split(NL).map((l) => `   ${l}`).join(NL));
          else head.push(`${sf.label}: ${formatSubValue(sf, r[sf.id], ratingScales)}`);
        }
        return [`${i + 1}. ${head.join(' – ')}`, ...tail].join(NL);
      });
      return label ? [label, ...items].join(NL + NL) : items.join(NL + NL);
    }
    default:
      return null;
  }
}

function fillPlaceholders(pattern, state, template) {
  const v = state.values;
  return pattern.replace(/\{(\w+)\}/g, (_, key) => {
    if (key === 'employeeName') return cleanText(v.employeeName || '');
    if (key === 'meetingDate') return formatShort(v.meetingDate);
    if (key === 'firstName') return firstName(v.employeeName);
    if (key === 'topicLower') return lowerFirst(cleanText(v.topic || ''));
    if (key === 'templateName') return template.name;
    const val = v[key];
    return isEmptyValue(val) ? '' : String(val);
  });
}

/**
 * Builds { to, cc, subject, body, mode } for a form.
 * options: { prefs: { emailFooterEnabled, hrContactEmail }, alsoHr, forceEmployee, includeSensitive }
 * Returns withheld: ids of filled-in sensitive fields left out (P0.5).
 */
export function buildEmail(content, template, state, options = {}) {
  const { email: cfg, ratingScales } = content;
  const prefs = options.prefs || {};
  const v = state.values;
  const mode = options.forceEmployee ? 'normal' : sendMode(template, state);
  const hrEmail = (prefs.hrContactEmail || '').trim();
  const hrOnly = mode === 'hrOnly' && !!hrEmail;

  // Group live fields by section, in definition order.
  const parts = [];
  const withheld = [];
  let current = null;
  for (const { section, field } of activeFields(template, state)) {
    if (field.inEmail === false) continue;
    const text = formatField(field, v[field.id], ratingScales);
    if (!text) continue;
    // P0.5: wellbeing and health details stay out unless the manager includes them for this email.
    if (field.sensitive && !options.includeSensitive) { withheld.push(field.id); continue; }
    if (!current || current.section !== section) {
      current = { section, items: [] };
      parts.push(current);
    }
    current.items.push(text);
  }

  const paras = [];
  if (hrOnly) {
    paras.push('Hi,');
    paras.push(`I'd like your advice before I share this probation review outcome with ${cleanText(v.employeeName)}. Here's the draft summary I've prepared.`);
    paras.push('---');
  }
  paras.push(fillPlaceholders(cfg.greeting, state, template));
  paras.push(fillPlaceholders(template.intro, state, template));
  for (const p of parts) {
    const heading = p.section.emailHeading === false ? null : p.section.title.toUpperCase();
    paras.push(heading ? [heading, ...p.items].join(NL + NL) : p.items.join(NL + NL));
  }
  if (template.closing) paras.push(template.closing);
  paras.push(`${cfg.signOff}${NL}${cleanText(v.managerName || '')}`);
  // P2.3: never on formal records (return to work, probation, performance review, conversation summary).
  if (prefs.emailFooterEnabled !== false && !template.formalRecord) paras.push(`—${NL}${cfg.footer}`);

  const subjectBase = fillPlaceholders(template.subject, state, template).replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
  const subject = hrOnly ? `For HR advice – ${subjectBase}` : subjectBase;

  let to;
  const cc = [];
  if (hrOnly) {
    to = [hrEmail];
  } else {
    to = [cleanText(v.employeeEmail || '')];
    if (!isEmptyValue(v.cc)) cc.push(cleanText(v.cc));
    if (options.alsoHr && template.allowHrCc && hrEmail) cc.push(hrEmail);
  }
  return { to, cc: [...new Set(cc)].filter((x) => !to.includes(x)), subject, body: paras.join(NL + NL), mode: hrOnly ? 'hrOnly' : 'normal', withheld };
}

/** Text used by the Share and Copy fallbacks. */
export function emailAsText(email) {
  return `Subject: ${email.subject}${NL}${NL}${email.body}`;
}

function encodeAddresses(list) {
  return list.map((a) => encodeURIComponent(a).replace(/%40/g, '@')).join(',');
}

/** mailto: URL with CRLF line breaks, as RFC 6068 asks. */
export function mailtoUrl({ to = [], cc = [], subject = '', body = '' }) {
  const params = [];
  if (cc.length) params.push(`cc=${encodeAddresses(cc)}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`);
  return `mailto:${encodeAddresses(to)}${params.length ? '?' + params.join('&') : ''}`;
}

/** The generic "Advice needed" email for Contact HR buttons (no employee details). */
export function hrAdviceEmail(hrEmail, title) {
  return {
    to: [hrEmail],
    cc: [],
    subject: `Advice needed – ${title}`,
    body: `Hi, I'd like some advice about a ${title.toLowerCase()} situation with a member of my team. Please could you get in touch? Thanks.`,
  };
}
