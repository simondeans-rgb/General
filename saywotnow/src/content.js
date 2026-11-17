// Loads the bundled content files. They're served from the app's own origin and
// cached by the service worker, so this works offline.

export const CONTENT_FILES = ['home', 'templates', 'guides', 'reactions', 'tools', 'pages', 'timezones', 'currencies'];

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
    contentVersion: c.templates.contentVersion,
    lastReviewed: CONTENT_FILES.map((n) => c[n].lastReviewed).sort().pop(),
  };
}

/** Finds any content item by id for favourites and search results. */
export function lookupItem(content, id) {
  if (content.templateById[id]) return { kind: 'template', id, title: content.templateById[id].name, summary: content.templateById[id].purpose };
  if (content.guideById[id]) return { kind: 'guide', id, title: content.guideById[id].title, summary: content.guideById[id].whenToUse, flagLevel: content.guideById[id].flagLevel };
  if (content.toolById[id]) return { kind: 'tool', id, title: content.toolById[id].title, summary: content.toolById[id].summary };
  return null;
}
