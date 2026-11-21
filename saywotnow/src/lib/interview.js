// Interview pack generator: pure logic shared by the screens, the Word export
// and the tests. Nothing here touches storage or the DOM.

export const MAX_PANEL = 5;
export const MAX_PACKS = 30;

const clip = (s, n) => String(s ?? '').slice(0, n);

/** A blank pack being built. `panel` is a list of interviewer names (may contain blanks while editing). */
export function newDraft() {
  return { id: null, role: '', func: '', seniority: '', description: '', panel: [''], competencies: [], choices: {} };
}

export function draftFromPack(pack) {
  return {
    id: pack.id,
    role: pack.role,
    func: pack.func || '',
    seniority: pack.seniority || '',
    description: pack.description || '',
    panel: pack.panel.length ? [...pack.panel] : [''],
    competencies: pack.competencies.map((c) => c.id),
    choices: Object.fromEntries(pack.competencies.map((c) => [c.id, { primary: c.primary, backup: c.backup }])),
  };
}

export function panelNames(panel) {
  return (panel || []).map((n) => String(n).trim()).filter(Boolean);
}

/** Who asks about the competency at position i. Questions rotate through the panel in order. */
export function assignee(panel, i) {
  const names = panelNames(panel);
  return names.length ? names[i % names.length] : 'Unassigned';
}

export function choiceComplete(choice) {
  return !!(choice && choice.primary && choice.backup && choice.primary !== choice.backup);
}

/** Sets the primary or backup question for a competency. Choosing the same question for both is not allowed. */
export function setChoice(choices, competencyId, slot, questionId) {
  const cur = choices[competencyId] || { primary: '', backup: '' };
  const other = slot === 'primary' ? 'backup' : 'primary';
  if (questionId && cur[other] === questionId) return choices;
  return { ...choices, [competencyId]: { ...cur, [slot]: questionId || '' } };
}

export function toggleCompetency(draft, id) {
  const on = draft.competencies.includes(id);
  return { ...draft, competencies: on ? draft.competencies.filter((c) => c !== id) : [...draft.competencies, id] };
}

/** Selected competency objects, in the order they were chosen. */
export function selectedCompetencies(library, draft) {
  const byId = Object.fromEntries(library.competencies.map((c) => [c.id, c]));
  return draft.competencies.map((id) => byId[id]).filter(Boolean);
}

export function dimensionsCovered(library, draft) {
  return new Set(selectedCompetencies(library, draft).map((c) => c.dimension));
}

/** Whether the builder can move on from a step (1 role & panel, 2 competencies, 3 questions). */
export function stepComplete(library, draft, step) {
  if (step === 1) return draft.role.trim().length > 0;
  if (step === 2) return selectedCompetencies(library, draft).length > 0;
  if (step === 3) return selectedCompetencies(library, draft).every((c) => choiceComplete(draft.choices[c.id]));
  return true;
}

/** The first incomplete competency index on step 3, or -1. */
export function firstIncomplete(library, draft) {
  return selectedCompetencies(library, draft).findIndex((c) => !choiceComplete(draft.choices[c.id]));
}

export function isDraftDirty(draft, original) {
  const norm = (d) => JSON.stringify({
    role: d.role.trim(), func: d.func.trim(), seniority: d.seniority.trim(), description: d.description.trim(),
    panel: panelNames(d.panel), competencies: d.competencies,
    choices: Object.fromEntries(d.competencies.map((id) => [id, d.choices[id] || {}])),
  });
  return norm(draft) !== norm(original || newDraft());
}

/** Turns a finished draft into the stored pack shape. Throws if a choice is incomplete. */
export function packFromDraft(library, draft, { id, now = new Date().toISOString(), createdAt } = {}) {
  const competencies = selectedCompetencies(library, draft).map((c) => {
    const ch = draft.choices[c.id];
    if (!choiceComplete(ch)) throw new Error(`Incomplete question selection for ${c.name}`);
    return { id: c.id, primary: ch.primary, backup: ch.backup };
  });
  return sanitisePack({
    id: id || draft.id,
    role: draft.role.trim(),
    func: draft.func.trim(),
    seniority: draft.seniority.trim(),
    description: draft.description.trim(),
    panel: panelNames(draft.panel),
    competencies,
    createdAt: createdAt || now,
    updatedAt: now,
  });
}

/** Saved packs hold no candidate information. This keeps stored data to the expected shape and sizes. */
export function sanitisePack(p) {
  if (!p || typeof p !== 'object') return null;
  const id = /^[A-Za-z0-9-]{4,40}$/.test(p.id) ? p.id : null;
  const role = clip(p.role, 80).trim();
  if (!id || !role) return null;
  const competencies = Array.isArray(p.competencies)
    ? p.competencies.slice(0, 35)
      .filter((c) => c && /^[a-z0-9-]{1,60}$/.test(c.id) && /^[a-z0-9-]{1,60}$/.test(c.primary) && /^[a-z0-9-]{1,60}$/.test(c.backup) && c.primary !== c.backup)
      .map((c) => ({ id: c.id, primary: c.primary, backup: c.backup }))
    : [];
  if (!competencies.length) return null;
  return {
    id,
    role,
    func: clip(p.func, 80).trim(),
    seniority: clip(p.seniority, 80).trim(),
    description: clip(p.description, 2000).trim(),
    panel: Array.isArray(p.panel) ? p.panel.map((n) => clip(n, 60).trim()).filter(Boolean).slice(0, MAX_PANEL) : [],
    competencies,
    createdAt: clip(p.createdAt, 30),
    updatedAt: clip(p.updatedAt, 30),
  };
}

/** Resolves a stored pack against the library (drops competencies or questions the library no longer has). */
export function resolvePack(library, pack) {
  const byId = Object.fromEntries(library.competencies.map((c) => [c.id, c]));
  const items = pack.competencies.flatMap((ref) => {
    const c = byId[ref.id];
    if (!c) return [];
    const primary = c.questions.find((q) => q.id === ref.primary);
    const backup = c.questions.find((q) => q.id === ref.backup);
    return primary && backup ? [{ ...c, primary, backup }] : [];
  });
  return { ...pack, items };
}

export function duplicatePack(pack, newId, now = new Date().toISOString()) {
  return { ...pack, id: newId, role: clip(`${pack.role} — Copy`, 80), createdAt: now, updatedAt: now };
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------------- Interview session (memory only) ---------------- */

export function newSession(resolved, candidate, date) {
  return {
    pack: resolved,
    candidate: candidate.trim(),
    date,
    records: resolved.items.map((c) => ({ id: c.id, notes: '', rating: null, backupUsed: false })),
    index: 0,
    status: 'active',
  };
}

export function ratedCount(session) {
  return session.records.filter((r) => r.rating).length;
}

export function sessionDirty(session) {
  return !!session && session.records.some((r) => r.notes.trim() || r.rating || r.backupUsed);
}

export function ratingLabel(library, value) {
  const r = library.ratingScale.find((x) => x.value === value);
  return r ? `${value} — ${r.label}` : 'Not rated';
}

/** Plain-text interview record, for email or copying. */
export function recordText(library, session, formatDate) {
  const lines = [
    `Interview record: ${session.pack.role}`,
    `Candidate: ${session.candidate}`,
    `Interview date: ${formatDate(session.date)}`,
    `Competencies rated: ${ratedCount(session)} of ${session.records.length}`,
    '',
  ];
  session.pack.items.forEach((c, i) => {
    const r = session.records[i];
    const dim = library.dimensions.find((d) => d.id === c.dimension);
    lines.push(`${(dim ? dim.name : c.dimension).toUpperCase()} · ${c.name}`);
    lines.push(`Assigned interviewer: ${assignee(session.pack.panel, i)}`);
    lines.push(`Question asked: ${c.primary.text}`);
    if (r.backupUsed) lines.push(`Backup question used: ${c.backup.text}`);
    lines.push(`Evidence notes: ${r.notes.trim() || 'No notes recorded.'}`);
    lines.push(`Rating: ${ratingLabel(library, r.rating)}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}

/** Simple search over competency names and definitions. */
export function matchCompetency(c, q) {
  const s = q.trim().toLowerCase();
  return !s || c.name.toLowerCase().includes(s) || c.definition.toLowerCase().includes(s);
}
