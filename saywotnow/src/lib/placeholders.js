// Script personaliser (P2.1): local, deterministic substitution of [placeholders]
// in reviewed scripts. Nothing is generated, saved or sent. Empty fields leave the
// [placeholder] showing, so a script never reads as if it were complete.

const PH = /\[([^\]\n]{1,40})\]/g;

/** Unique placeholders, in the order they first appear across the given texts. */
export function findPlaceholders(texts) {
  const out = [];
  for (const t of texts) for (const m of String(t).matchAll(PH)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

const clean = (v) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

/** Text with filled placeholders substituted; unfilled ones stay as [name]. */
export function fillText(text, values = {}) {
  return String(text).replace(PH, (whole, name) => clean(values[name]) || whole);
}

/** Text split into parts for display: { text } or { name, value, filled }. */
export function fillParts(text, values = {}) {
  const parts = [];
  let last = 0;
  for (const m of String(text).matchAll(PH)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    const v = clean(values[m[1]]);
    parts.push({ name: m[1], value: v || m[0], filled: !!v });
    last = m.index + m[0].length;
  }
  if (last < String(text).length) parts.push({ text: String(text).slice(last) });
  return parts;
}

/** Human label for a placeholder box, e.g. "team/process" → "Team or process". */
export function placeholderLabel(name) {
  const s = name.replace('/', ' or ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
