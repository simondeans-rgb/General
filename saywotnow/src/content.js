// Loads the bundled content files. They're served from the app's own origin and
// cached by the service worker, so this works offline.

export const CONTENT_FILES = ['home', 'templates', 'guides', 'reactions', 'tools', 'pages', 'timezones', 'currencies', 'prep'];

export async function loadContent(base = './content/') {
  const entries = await Promise.all(
    CONTENT_FILES.map(async (name) => {
      const res = await fetch(`${base}${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Couldn't load ${name}.json`);
      return [name, await res.json()];
    }),
  );
  const c = Object.fromEntries(entries);
  const tpl = c.templates;
  return {
    ...c,
    header: tpl.header,
    email: tpl.email,
    ratingScales: tpl.ratingScales,
    templateById: Object.fromEntries(tpl.templates.map((t) => [t.id, t])),
    guideById: Object.fromEntries(c.guides.guides.map((g) => [g.id, g])),
    toolById: Object.fromEntries(c.tools.tools.map((t) => [t.id, t])),
    prepById: Object.fromEntries(c.prep.cards.map((p) => [p.id, p])),
    contentVersion: c.templates.contentVersion,
    // Review status of the UK guidance (P0.4): approved only if every UK file is approved.
    reviewStatus: CONTENT_FILES.filter((n) => c[n].review.jurisdiction === 'UK').every((n) => c[n].review.reviewStatus === 'approved') ? 'approved' : 'draft',
    reviewers: [...new Set(CONTENT_FILES.map((n) => c[n].review).filter((r) => r.reviewStatus === 'approved').map((r) => `${r.reviewedBy} (${r.reviewedOn})`))],
  };
}

/** Finds any content item by id for favourites and search results. */
export function lookupItem(content, id) {
  if (content.templateById[id]) return { kind: 'template', id, title: content.templateById[id].name, summary: content.templateById[id].purpose };
  if (content.guideById[id]) return { kind: 'guide', id, title: content.guideById[id].title, summary: content.guideById[id].whenToUse, flagLevel: content.guideById[id].flagLevel };
  if (content.toolById[id]) return { kind: 'tool', id, title: content.toolById[id].title, summary: content.toolById[id].summary };
  return null;
}

/** The 1-minute prep card for a guide or template, if there is one. T01/T02 share the 1:1 card. */
export function prepFor(content, kind, id) {
  const pair = kind === 'template' && content.templateById[id]?.pair;
  return content.prep.cards.find((p) => (pair ? p.target.type === 'oneToOne' : p.target.type === kind && p.target.id === id)) || null;
}
