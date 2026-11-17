// Evaluates showIf / requiredIf / flag conditions from content files.
// A condition is one of:
//   { field, equals }       value equals (or, for multi-choice, includes) the given value
//   { field, in: [...] }    value is one of the list
//   { field, notEmpty: true }
//   { any: [cond, ...] } / { all: [cond, ...] } / { not: cond }

export function isEmptyValue(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.values(value).every(isEmptyValue);
  return false;
}

export function evaluate(cond, values) {
  if (!cond) return true;
  if (Array.isArray(cond.any)) return cond.any.some((c) => evaluate(c, values));
  if (Array.isArray(cond.all)) return cond.all.every((c) => evaluate(c, values));
  if (cond.not) return !evaluate(cond.not, values);
  const v = values[cond.field];
  if ('equals' in cond) return Array.isArray(v) ? v.includes(cond.equals) : v === cond.equals;
  if (Array.isArray(cond.in)) return Array.isArray(v) ? v.some((x) => cond.in.includes(x)) : cond.in.includes(v);
  if (cond.notEmpty) return !isEmptyValue(v);
  return false;
}

/** Field ids a condition depends on (used by the content validator). */
export function referencedFields(cond, out = []) {
  if (!cond) return out;
  if (cond.any) cond.any.forEach((c) => referencedFields(c, out));
  if (cond.all) cond.all.forEach((c) => referencedFields(c, out));
  if (cond.not) referencedFields(cond.not, out);
  if (cond.field) out.push(cond.field);
  return out;
}
