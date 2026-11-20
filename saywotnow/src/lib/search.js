// Local, case-insensitive search across templates, guides and tools.
// Ignores apostrophes and hyphens and matches partial words. Nothing is stored.

export function normalise(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/['’‘`\-‐‑]/g, '')
    .replace(/[^a-z0-9:]+/g, ' ')
    .trim();
}

export function buildIndex(content) {
  const items = [];
  for (const t of content.templates.templates) {
    if (t.listed === false) continue;
    items.push({ kind: 'template', id: t.id, title: t.name, summary: t.purpose, keywords: t.keywords || [] });
  }
  for (const g of content.guides.guides) {
    items.push({ kind: 'guide', id: g.id, title: g.title, summary: g.whenToUse, keywords: g.keywords || [], flagLevel: g.flagLevel });
  }
  for (const t of content.tools.tools) {
    items.push({ kind: 'tool', id: t.id, title: t.title, summary: t.summary, keywords: t.keywords || [] });
  }
  return items.map((it) => ({
    ...it,
    _title: normalise(it.title),
    _hay: normalise([it.title, it.summary, ...it.keywords].join(' ')),
    _kw: normalise(it.keywords.join(' ')),
  }));
}

/** Returns { template: [...], guide: [...], tool: [...] } for a query. */
export function search(index, query) {
  const q = normalise(query);
  const groups = { template: [], guide: [], tool: [] };
  if (!q) return groups;
  const tokens = q.split(' ').filter(Boolean);
  const scored = [];
  for (const it of index) {
    if (!tokens.every((t) => it._hay.includes(t))) continue;
    let score = 0;
    for (const t of tokens) {
      if (it._title.includes(t)) score += 3;
      if (it._kw.includes(t)) score += 2;
      if (new RegExp(`(^|\\s)${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(it._hay)) score += 1;
    }
    scored.push({ it, score });
  }
  scored.sort((a, b) => b.score - a.score || a.it.title.localeCompare(b.it.title));
  for (const { it } of scored) groups[it.kind].push(it);
  return groups;
}
