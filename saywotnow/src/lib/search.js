// Local, deterministic search (P1.1). Nothing leaves the device and nothing is stored.
//  - Indexes titles, summaries, keywords and the reviewed text of guides, templates,
//    1-minute prep cards, "If they react…" responses and tools.
//  - A curated phrase list (content/search.json) maps everyday words ("always late",
//    "crying", "bullying") to the right content.
//  - Risky terms (harassment, self-harm…) add a safety message and the HR-first or
//    urgent content, whatever else matches.
//  - Light, rule-based word endings ("argued" → "argu") and, only when nothing
//    matches, a one-letter spelling correction against words in the index.

export function normalise(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/['’‘`\-‐‑]/g, '')
    .replace(/[^a-z0-9:]+/g, ' ')
    .trim();
}

/** Strips common English endings so "arguing", "argued" and "argues" meet. Deliberately simple. */
export function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ied')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -1);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'my', 'i', 'me', 'they', 'them', 'their', 'theyre', 'he', 'she', 'his', 'her', 'with', 'to', 'of', 'and', 'or', 'for', 'in', 'on', 'at', 'it', 'its', 'be', 'been', 'being', 'was', 'were', 'do', 'does', 'how', 'what', 'who', 'when', 'about', 'someone', 'somebody', 'employee', 'staff', 'member', 'team', 'keeps', 'always', 'very', 'really', 'help']);

const words = (s) => normalise(s).split(' ').filter(Boolean);
const stems = (s) => words(s).map(stem);
const strip = (s) => String(s || '').replace(/^"|"$/g, '');

export function buildIndex(content) {
  const items = [];
  for (const t of content.templates.templates) {
    if (t.listed === false) continue;
    items.push({ kind: 'template', id: t.id, title: t.name, summary: t.purpose, keywords: t.keywords || [], body: [t.whenToUse] });
  }
  for (const g of content.guides.guides) {
    items.push({
      kind: 'guide', id: g.id, title: g.title, summary: g.whenToUse, keywords: g.keywords || [], flagLevel: g.flagLevel,
      body: [...g.before, ...g.opening.map(strip), ...(g.sayIt || []).map((x) => `${x.when} ${x.line}`), ...g.during,
        ...g.responses.map((r) => `${r.theySay} ${r.youCould}`), ...g.donts, ...g.after, ...g.hrTriggers],
    });
  }
  for (const p of content.prep?.cards || []) {
    items.push({ kind: 'prep', id: p.id, title: p.title, summary: p.ask[0], keywords: [], body: [...p.ask, p.avoid, p.remember || ''], target: p.target });
  }
  for (const r of content.reactions?.reactions || []) {
    items.push({ kind: 'reaction', id: r.id, title: `If they ${r.ifThey.charAt(0).toLowerCase()}${r.ifThey.slice(1)}`, summary: r.youCould, keywords: [], body: [] });
  }
  for (const t of content.tools.tools) {
    items.push({ kind: 'tool', id: t.id, title: t.title, summary: t.summary, keywords: t.keywords || [], body: [t.howItWorks || ''] });
  }
  const index = items.map((it) => ({
    ...it,
    _title: new Set(stems(it.title)),
    _kw: new Set(stems(it.keywords.join(' '))),
    _sum: new Set(stems(it.summary)),
    _body: new Set(stems(it.body.join(' '))),
  }));
  const S = content.search || { synonyms: [], risky: [], suggestions: [], riskyMessages: {} };
  index.synonyms = S.synonyms.map((g) => ({ phrases: g.phrases.map(normalise), targets: g.targets }));
  index.risky = S.risky.map((g) => ({ level: g.level, phrases: g.phrases.map(normalise), targets: g.targets }));
  index.messages = S.riskyMessages;
  index.suggestions = S.suggestions;
  index.vocab = [...new Set(index.flatMap((it) => [...it._title, ...it._kw, ...it._sum, ...it._body]))].filter((w) => w.length >= 4);
  return index;
}

/** Whole-word phrase match inside the normalised query. */
function hasPhrase(q, p) {
  return ` ${q} `.includes(` ${p} `);
}

function tokenScore(it, t) {
  // Prefix match on stemmed words, so partial words ("feedb") still work.
  const hit = (set) => { for (const w of set) if (w.startsWith(t)) return true; return false; };
  if (hit(it._title)) return 6;
  if (hit(it._kw)) return 4;
  if (hit(it._sum)) return 2;
  if (hit(it._body)) return 1;
  return 0;
}

function lev1(a, b) {
  // True if a and b differ by exactly one edit (insert, delete, substitute or swap).
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

function run(index, q) {
  const tokens = q.split(' ').filter(Boolean).map(stem);
  const meaningful = tokens.filter((t) => !STOP.has(t));
  const scores = new Map();
  const add = (it, n) => scores.set(it, (scores.get(it) || 0) + n);
  // Curated phrases first.
  for (const g of index.synonyms) {
    if (g.phrases.some((p) => hasPhrase(q, p))) for (const it of index) if (g.targets.includes(it.id)) add(it, 20);
  }
  // Every meaningful word must match somewhere in an item…
  const need = meaningful.length ? meaningful : tokens;
  for (const it of index) {
    let total = 0;
    let all = true;
    for (const t of need) { const s = tokenScore(it, t); if (!s) { all = false; break; } total += s; }
    if (all && need.length) add(it, total);
  }
  // …unless nothing matched at all: then rank by any word, for "did you mean" style help.
  if (!scores.size && meaningful.length > 1) {
    for (const it of index) {
      const total = meaningful.reduce((n, t) => n + tokenScore(it, t), 0);
      if (total >= 2) add(it, total);
    }
  }
  return scores;
}

/**
 * Returns { template, guide, prep, reaction, tool, risk, riskMessage, riskTargets, corrected, suggestions }.
 */
export function search(index, query) {
  const groups = { template: [], guide: [], prep: [], reaction: [], tool: [], risk: null, riskMessage: '', riskTargets: [], corrected: null, suggestions: [] };
  let q = normalise(query);
  if (!q) return groups;
  // Safety first: risky words always surface the right help.
  for (const level of ['urgent', 'hr']) {
    const hits = (index.risky || []).filter((g) => g.level === level && g.phrases.some((p) => hasPhrase(q, p)));
    if (hits.length && !groups.risk) {
      groups.risk = level;
      groups.riskMessage = index.messages?.[level] || '';
      groups.riskTargets = [...new Set(hits.flatMap((h) => h.targets))];
    }
  }
  let scores = run(index, q);
  if (!scores.size && index.vocab) {
    // One-letter spelling correction, only when nothing matched.
    const fixed = q.split(' ').map((w) => {
      const s = stem(w);
      if (s.length < 5 || index.vocab.some((v) => v.startsWith(s))) return w;
      return index.vocab.find((v) => lev1(s, v)) || w;
    }).join(' ');
    if (fixed !== q) {
      scores = run(index, fixed);
      if (scores.size) groups.corrected = fixed;
    }
  }
  for (const id of groups.riskTargets) {
    const it = index.find((x) => x.id === id);
    if (it) scores.set(it, (scores.get(it) || 0) + 100);
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].title.localeCompare(b[0].title));
  for (const [it] of ranked) groups[it.kind].push(it);
  if (!ranked.length) groups.suggestions = index.suggestions || [];
  return groups;
}

export const RESULT_KINDS = ['guide', 'prep', 'reaction', 'template', 'tool'];
