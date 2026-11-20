// SBI feedback builder (Section 10.6).

function tidy(s) {
  return String(s || '').trim().replace(/[.\s]+$/, '');
}

function lowerFirst(s) {
  if (/^(I\b|[A-Z]{2})/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function buildSbi({ type, situation, behaviour, impact }, nextLines) {
  const s = tidy(situation); const b = tidy(behaviour); const i = tidy(impact);
  if (!s || !b || !i) return null;
  const statement = `In ${lowerFirst(s)}, I noticed ${lowerFirst(b)}. The impact was ${lowerFirst(i)}.`;
  const next = (nextLines && nextLines[type]) || '';
  return { statement, next, text: next ? `${statement} ${next}` : statement };
}
