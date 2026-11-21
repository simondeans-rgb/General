// Turns references like "the Flexible working guide (G13)" into descriptive links (P1.3).
// The code in brackets is never shown; the link text says where it goes.
import { html } from '../vendor/preact-htm.js';
import { content, navigate } from './core.js';

const REF = /([A-Z][A-Za-z' &-]*? guide) \((G\d{2})\)|\((G\d{2}|T\d{2})\)/g;

export function linkTargets(text) {
  return [...String(text).matchAll(REF)].map((m) => m[2] || m[3]);
}

export function Linked({ text }) {
  const c = content();
  const out = [];
  let last = 0;
  for (const m of String(text).matchAll(REF)) {
    const id = m[2] || m[3];
    const item = id.startsWith('G') ? c.guideById[id] : c.templateById[id];
    if (!item) continue;
    const href = id.startsWith('G') ? `/guide/${id}` : `/template/${id}`;
    const label = m[1] || (id.startsWith('G') ? `${item.title} guide` : `${item.name} template`);
    out.push(String(text).slice(last, m.index));
    out.push(html`<a class="link" href=${'#' + href} aria-label=${`Open the ${id.startsWith('G') ? item.title : item.name} ${id.startsWith('G') ? 'guide' : 'template'}`}
      onClick=${(e) => { e.preventDefault(); navigate(href); }}>${label}</a>`);
    last = m.index + m[0].length;
  }
  out.push(String(text).slice(last));
  return out;
}

/** "Related" links for a guide: other guides, templates and tools (content: guide.related). */
export function Related({ guide }) {
  const c = content();
  const items = (guide.related || []).map((r) => {
    if (r.type === 'guide') { const g = c.guideById[r.id]; return g && { href: `/guide/${g.id}`, title: g.title, kind: 'Guide' }; }
    if (r.type === 'template') { const t = c.templateById[r.id]; return t && { href: `/template/${t.id}`, title: t.name, kind: 'Meeting template' }; }
    if (r.type === 'tool') { const t = c.toolById[r.id]; return t && { href: `/tool/${t.id}`, title: t.title, kind: 'Tool' }; }
    return null;
  }).filter(Boolean);
  if (!items.length) return null;
  return html`<section class="related" aria-labelledby="rel-h">
    <h2 id="rel-h" class="mini-title">Related</h2>
    <ul class="card-list" role="list">${items.map((i) => html`<li><a class="card card-link" href=${'#' + i.href} onClick=${(e) => { e.preventDefault(); navigate(i.href); }}>
      <span class="card-sub">${i.kind}</span><span class="card-title">${i.title}</span></a></li>`)}</ul>
  </section>`;
}
