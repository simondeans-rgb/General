import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadContentSync() {
  const read = (n) => JSON.parse(readFileSync(join(root, 'content', `${n}.json`), 'utf8'));
  const c = { home: read('home'), templates: read('templates'), guides: read('guides'), reactions: read('reactions'), tools: read('tools'), pages: read('pages'), prep: read('prep'), search: read('search'), quickhelp: read('quickhelp') };
  return {
    ...c,
    header: c.templates.header,
    email: c.templates.email,
    ratingScales: c.templates.ratingScales,
    templateById: Object.fromEntries(c.templates.templates.map((t) => [t.id, t])),
    guideById: Object.fromEntries(c.guides.guides.map((g) => [g.id, g])),
    toolById: Object.fromEntries(c.tools.tools.map((t) => [t.id, t])),
  };
}

export const ROOT = root;
