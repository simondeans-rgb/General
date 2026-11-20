// Bradford Factor (Section 10.5): B = S² × D.

/** spells: array of day counts. Blank entries are ignored. */
export function bradford(spells) {
  const days = spells.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const S = days.length;
  const D = days.reduce((a, b) => a + b, 0);
  return { spells: S, days: Math.round(D * 10) / 10, score: Math.round(S * S * D * 10) / 10 };
}

/** bands: [{ from, to, label }]. Returns the matching band or null. */
export function bandFor(score, bands) {
  if (!Array.isArray(bands)) return null;
  return bands.find((b) => {
    const from = Number(b.from);
    const to = b.to === '' || b.to === null || b.to === undefined ? Infinity : Number(b.to);
    return Number.isFinite(from) && score >= from && score <= to;
  }) || null;
}

/** Checks a set of bands from Settings. Returns an error message or null. */
export function validateBands(bands) {
  if (bands.length > 5) return 'You can add up to 5 bands.';
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    const from = Number(b.from);
    const to = b.to === '' ? Infinity : Number(b.to);
    if (b.from === '' || !Number.isFinite(from) || from < 0) return `Band ${i + 1}: enter a "from" score.`;
    if (!(to >= from)) return `Band ${i + 1}: "to" must be the same as or higher than "from".`;
    if (!String(b.label || '').trim()) return `Band ${i + 1}: add a label, e.g. "No action".`;
  }
  return null;
}
