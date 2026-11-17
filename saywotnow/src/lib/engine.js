// Template engine: works out which sections and fields are visible, validates
// the form and decides which HR flags apply. Pure functions over plain objects,
// so it can be unit tested without a browser.
//
// Form state shape (held in memory only, never persisted):
//   {
//     templateId,
//     values:   { [fieldId]: value },   // header and template fields share one map
//     included: { [sectionId]: bool },  // optional-section toggles (default true)
//     toggles:  { [fieldId]: bool },    // per-field include toggles (default true)
//     context:  { short: bool, guideId, prompt, formNote }
//   }

import { evaluate, isEmptyValue } from './rules.js';
import { isISODate, todayISO, compareISO } from './dates.js';

export const LIMITS = {
  shortText: 120,
  longText: 4000,
  longTextCounterFrom: 3500,
  actionList: 15,
  numberMin: 0,
  numberMax: 365,
  numberStep: 0.5,
};

export const OWNERS = ['Employee', 'Manager', 'Both'];

const EMAIL_RE = /^[^\s@,;<>()"]+@[^\s@,;<>()"]+\.[^\s@,;<>()".]{2,}$/;

export function isValidEmail(s) {
  return typeof s === 'string' && EMAIL_RE.test(s.trim());
}

export function emptyValueFor(field) {
  switch (field.type) {
    case 'multiChoice':
    case 'checklist':
    case 'actionList':
    case 'repeater':
      return [];
    case 'dateRange':
      return { from: '', to: '' };
    case 'rating':
      return null;
    default:
      return '';
  }
}

export function createFormState(template, header, context = {}, now = new Date()) {
  const values = {};
  for (const f of header.fields) {
    values[f.id] = f.default === 'today' ? todayISO(now) : emptyValueFor(f);
  }
  for (const s of template.sections) for (const f of s.fields) values[f.id] = emptyValueFor(f);
  if (context.topic && 'topic' in values) values.topic = context.topic;
  // Pre-filled values, so isDirty can tell them apart from typing.
  const initial = { meetingDate: values.meetingDate, topic: values.topic };
  return { templateId: template.id, values, included: {}, toggles: {}, context: { ...context }, initial };
}

/**
 * Switch a 1:1 form between Full (T01) and Quick (T02), keeping values in
 * fields the two templates share.
 */
export function switchTemplate(state, toTemplate, header) {
  const next = createFormState(toTemplate, header, state.context);
  next.initial = { ...next.initial, ...state.initial };
  for (const id of Object.keys(next.values)) {
    if (id in state.values) next.values[id] = state.values[id];
  }
  return next;
}

export function isSectionVisible(section, state) {
  if (section.hideInShort && state.context.short) return false;
  return evaluate(section.showIf, state.values);
}

export function isSectionIncluded(section, state) {
  if (!section.optional) return true;
  return state.included[section.id] !== false;
}

export function isFieldVisible(field, state) {
  if (field.hideInShort && state.context.short) return false;
  return evaluate(field.showIf, state.values);
}

export function isFieldToggledOn(field, state) {
  if (!field.toggle) return true;
  return state.toggles[field.id] !== false;
}

/** Fields that are live: in a visible, included section, visible and toggled on. */
export function activeFields(template, state) {
  const out = [];
  for (const section of template.sections) {
    if (!isSectionVisible(section, state) || !isSectionIncluded(section, state)) continue;
    for (const field of section.fields) {
      if (isFieldVisible(field, state) && isFieldToggledOn(field, state)) out.push({ section, field });
    }
  }
  return out;
}

export function isRequired(field, values) {
  if (field.required) return true;
  if (field.requiredIf) return evaluate(field.requiredIf, values);
  return false;
}

function rowHasData(row) {
  return Object.values(row || {}).some((v) => !isEmptyValue(v));
}

/** Rows the user has actually used (blank rows are ignored). */
export function filledRows(rows) {
  return (rows || []).filter(rowHasData);
}

/**
 * Validates one field. Returns an error string or null.
 * `allFields` lets min-date rules find the label of the field they refer to.
 */
export function validateField(field, value, values, lookupLabel = (id) => id) {
  const required = isRequired(field, values);
  const empty = isEmptyValue(value);
  if (field.type === 'dateRange') {
    const v = value || {};
    if (required && (!v.from || !v.to)) return 'Enter both dates.';
    if ((v.from && !isISODate(v.from)) || (v.to && !isISODate(v.to))) return 'Enter a valid date.';
    if (v.from && v.to && compareISO(v.to, v.from) < 0) return 'The end date must be on or after the start date.';
    return null;
  }
  if (field.type === 'actionList') {
    const rows = value || [];
    if (rows.length > LIMITS.actionList) return `You can add up to ${LIMITS.actionList} actions.`;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (rowHasData(r) && isEmptyValue(r.action)) return `Action ${i + 1}: describe the action, or remove the row.`;
      if (r.action && r.action.length > LIMITS.shortText * 2) return `Action ${i + 1} is too long (maximum ${LIMITS.shortText * 2} characters).`;
    }
    if (required && filledRows(rows).length === 0) return 'Add at least one action.';
    return null;
  }
  if (field.type === 'repeater') {
    const rows = value || [];
    if (field.max && rows.length > field.max) return `You can add up to ${field.max}.`;
    const primary = field.fields.find((f) => f.primary) || field.fields[0];
    for (let i = 0; i < rows.length; i++) {
      if (rowHasData(rows[i]) && isEmptyValue(rows[i][primary.id])) {
        return `${field.itemLabel || 'Item'} ${i + 1}: fill in "${primary.label}", or remove it.`;
      }
    }
    if (required && filledRows(rows).length === 0) return 'Add at least one.';
    return null;
  }
  if (empty) return required ? requiredMessage(field) : null;

  switch (field.type) {
    case 'shortText':
      if (value.length > LIMITS.shortText) return `Keep this under ${LIMITS.shortText} characters.`;
      return null;
    case 'longText':
      if (value.length > LIMITS.longText) return `Keep this under ${LIMITS.longText.toLocaleString('en-GB')} characters.`;
      return null;
    case 'email':
      return isValidEmail(value) ? null : 'Enter a valid email address, like name@company.co.uk.';
    case 'date': {
      if (!isISODate(value)) return 'Enter a valid date.';
      if (field.min && field.min.field) {
        const other = values[field.min.field];
        if (isISODate(other) && compareISO(value, other) < 0) {
          return `This must be on or after the ${lowerFirst(lookupLabel(field.min.field))}.`;
        }
      }
      return null;
    }
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) return 'Enter a number.';
      if (n < LIMITS.numberMin || n > LIMITS.numberMax) return `Enter a number from ${LIMITS.numberMin} to ${LIMITS.numberMax}.`;
      if (Math.round(n / LIMITS.numberStep) * LIMITS.numberStep !== n) return 'Use whole or half days, e.g. 2.5.';
      return null;
    }
    case 'rating':
      return Number.isInteger(value) && value >= 1 && value <= 5 ? null : 'Choose a rating from 1 to 5.';
    case 'singleChoice':
      return field.options.includes(value) ? null : 'Choose an option.';
    default:
      return null;
  }
}

function requiredMessage(field) {
  switch (field.type) {
    case 'singleChoice':
    case 'multiChoice':
    case 'rating':
      return 'Choose an option.';
    case 'date':
      return 'Enter a date.';
    default:
      return `Enter ${lowerFirst(field.label).replace(/\s*\(.*\)$/, '')}.`;
  }
}

function lowerFirst(s) {
  if (!s) return s;
  // Keep acronyms and "1:1" as written.
  if (/^[A-Z]{2}/.test(s) || /^\d/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Validates the header and all live template fields.
 * Returns an ordered list of { fieldId, message } (display order).
 */
export function validateForm(template, header, state) {
  const labels = {};
  for (const f of header.fields) labels[f.id] = f.label;
  for (const s of template.sections) for (const f of s.fields) labels[f.id] = f.label;
  const lookup = (id) => labels[id] || id;
  const errors = [];
  for (const f of header.fields) {
    const msg = validateField(f, state.values[f.id], state.values, lookup);
    if (msg) errors.push({ fieldId: f.id, message: msg });
  }
  for (const { field } of activeFields(template, state)) {
    const msg = validateField(field, state.values[field.id], state.values, lookup);
    if (msg) errors.push({ fieldId: field.id, message: msg });
  }
  return errors;
}

export function activeFlags(template, state) {
  return (template.flags || []).filter((f) => evaluate(f.when, state.values));
}

/** "normal" or "hrOnly" (T04 "Not confirming"). */
export function sendMode(template, state) {
  const rule = (template.sendRules || []).find((r) => evaluate(r.when, state.values));
  return rule ? rule.mode : 'normal';
}

/** True if the user has typed or chosen anything (used for the discard check). */
export function isDirty(template, header, state) {
  const initial = state.initial || {};
  for (const [id, v] of Object.entries(state.values)) {
    if (id in initial) {
      if ((v || '') !== (initial[id] || '')) return true;
      continue;
    }
    if (Array.isArray(v) && v.length && v.every((x) => x && typeof x === 'object')) {
      if (filledRows(v).length) return true;
      continue;
    }
    if (!isEmptyValue(v)) return true;
  }
  return false;
}
