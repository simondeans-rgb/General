import { html, useState, useMemo, useRef, useEffect } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon, Logo } from './icons.js';
import { content, navigate, TopBar, FavStar, FlagChip, greeting } from './core.js';
import { toggleFavourite } from '../prefs.js';
import { lookupItem } from '../content.js';
import { buildIndex, search } from '../lib/search.js';

export function hrefFor(kind, id) {
  if (kind === 'template') return `/template/${id}`;
  if (kind === 'guide') return `/guide/${id}`;
  return `/tool/${id}`;
}

function go(e, to) {
  e.preventDefault();
  navigate(to);
}

export function tileHref(target, prefs) {
  switch (target.type) {
    case 'oneToOne': return `/template/${prefs.defaultOneToOneMode === 'quick' ? 'T02' : 'T01'}`;
    case 'template': return `/template/${target.id}`;
    case 'guide': return `/guide/${target.id}`;
    case 'tool': return `/tool/${target.id}`;
    case 'screen': return `/${target.id}`;
    default: return '/';
  }
}

/* ---------------- S02 Home ---------------- */

export function Home({ prefs }) {
  const c = content();
  const favs = prefs.favourites.map((id) => lookupItem(c, id)).filter(Boolean);
  return html`<div class="screen home">
    <header class="home-head">
      <div>
        <${Logo} size=${30} />
        <p class="greeting">${greeting()}</p>
      </div>
      <a href="#/settings" class="icon-btn" aria-label=${S.settings} onClick=${(e) => go(e, '/settings')}><${Icon} name="gear" /></a>
    </header>

    <a href="#/search" class="search-bar" onClick=${(e) => go(e, '/search')}>
      <${Icon} name="search" /><span>${S.searchPlaceholder}</span>
    </a>

    <section aria-labelledby="need-h">
      <h2 id="need-h" class="section-title">${c.home.sectionTitle}</h2>
      <ul class="tile-grid" role="list">
        ${c.home.tiles.map((t) => {
          const href = tileHref(t.target, prefs);
          return html`<li><a class="tile" href=${'#' + href} onClick=${(e) => go(e, href)}>
            <span class="tile-icon"><${Icon} name=${t.icon} /></span>
            <span class="tile-label">${t.label}</span>
          </a></li>`;
        })}
      </ul>
    </section>

    <section aria-labelledby="fav-h">
      <h2 id="fav-h" class="section-title">${c.home.favouritesTitle}</h2>
      ${favs.length ? html`<ul class="fav-row" role="list">
        ${favs.map((f) => html`<li><a class="fav-card" href=${'#' + hrefFor(f.kind, f.id)} onClick=${(e) => go(e, hrefFor(f.kind, f.id))}>
          <span class="fav-kind">${f.kind === 'template' ? 'Template' : f.kind === 'guide' ? 'Guide' : 'Tool'}</span>
          <span class="fav-title">${f.title}</span>
          ${f.flagLevel ? html`<${FlagChip} level=${f.flagLevel} small />` : null}
        </a></li>`)}
      </ul>` : html`<p class="hint"><${Icon} name="star" size=${18} /> ${c.home.favouritesHint}</p>`}
    </section>

    <p class="footer-link"><a href="#/page/disclaimer" onClick=${(e) => go(e, '/page/disclaimer')}>${S.disclaimerLink}</a></p>
  </div>`;
}

/* ---------------- S03 Search ---------------- */

export function Search() {
  const c = content();
  // The query lives only in this component's state. It's never stored or put in the URL.
  const [q, setQ] = useState('');
  const index = useMemo(() => buildIndex(c), [c]);
  const results = useMemo(() => search(index, q), [index, q]);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  const total = results.template.length + results.guide.length + results.tool.length;
  return html`<div class="screen">
    <${TopBar} title="Search" back=${() => navigate('/')} />
    <div class="search-field">
      <${Icon} name="search" />
      <input ref=${inputRef} type="search" value=${q} onInput=${(e) => setQ(e.target.value)}
        placeholder=${S.searchPlaceholder} aria-label=${S.searchPlaceholder}
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" />
    </div>
    <div aria-live="polite" class="sr-only">${q.trim() ? `${total} result${total === 1 ? '' : 's'}` : ''}</div>
    ${q.trim() && total === 0 ? html`<p class="empty">${S.searchEmpty}</p>` : null}
    ${['template', 'guide', 'tool'].map((k) => results[k].length ? html`<section key=${k}>
      <h2 class="section-title">${S.searchGroups[k]}</h2>
      <ul class="card-list" role="list">
        ${results[k].map((r) => html`<li><a class="card card-link" href=${'#' + hrefFor(r.kind, r.id)} onClick=${(e) => go(e, hrefFor(r.kind, r.id))}>
          <span class="card-title">${r.title}</span>
          <span class="card-sub clamp">${r.summary}</span>
          ${r.flagLevel ? html`<${FlagChip} level=${r.flagLevel} small />` : null}
        </a></li>`)}
      </ul>
    </section>` : null)}
  </div>`;
}

/* ---------------- S04 Meetings ---------------- */

export function Meetings({ prefs }) {
  const c = content();
  const list = c.templates.templates.filter((t) => t.listed !== false);
  return html`<div class="screen">
    <${TopBar} title=${S.tabs.meetings} />
    <p class="lede">Fill in a template during or after the meeting, then email the summary from your own mail app.</p>
    <ul class="card-list" role="list">
      ${list.map((t) => html`<li class="card has-star">
        <a class="card-link-cover" href=${'#/template/' + t.id} onClick=${(e) => go(e, '/template/' + t.id)}>
          <span class="card-title">${t.name}</span>
        </a>
        <span class="card-sub">${t.purpose}</span>
        <span class="card-meta"><${Icon} name="calendar" size=${16} /> ${t.length}</span>
        <${FavStar} id=${t.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${t.name} />
      </li>`)}
    </ul>
  </div>`;
}

/* ---------------- S07 Conversations ---------------- */

export function Conversations({ prefs }) {
  const c = content();
  const groups = ['performance', 'wellbeing', 'everyday'];
  return html`<div class="screen">
    <${TopBar} title=${S.tabs.conversations} />
    <a class="react-link" href="#/reactions" onClick=${(e) => go(e, '/reactions')}>
      <${Icon} name="conversations" /><span>${S.reactionsLink}</span><${Icon} name="chevron" size=${18} />
    </a>
    ${groups.map((g) => html`<section key=${g} aria-labelledby=${'cat-' + g}>
      <h2 id=${'cat-' + g} class="section-title">${S.categories[g]}</h2>
      <ul class="card-list" role="list">
        ${c.guides.guides.filter((x) => x.category === g).map((x) => html`<li class="card has-star">
          <a class="card-link-cover" href=${'#/guide/' + x.id} onClick=${(e) => go(e, '/guide/' + x.id)}>
            <span class="card-title">${x.title}</span>
          </a>
          <span class="card-sub clamp">${x.whenToUse}</span>
          <${FlagChip} level=${x.flagLevel} small />
          <${FavStar} id=${x.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${x.title} />
        </li>`)}
      </ul>
    </section>`)}
  </div>`;
}

/* ---------------- S09 Reactions ---------------- */

export function Reactions() {
  const r = content().reactions;
  const [open, setOpen] = useState(null);
  return html`<div class="screen">
    <${TopBar} title=${r.title} back=${() => history.length > 1 ? history.back() : navigate('/conversations')} />
    <p class="lede">${r.intro}</p>
    <ul class="accordion" role="list">
      ${r.reactions.map((x) => html`<li key=${x.id} class=${`acc-item ${open === x.id ? 'open' : ''}`}>
        <h2 class="acc-h"><button type="button" aria-expanded=${open === x.id} aria-controls=${'acc-' + x.id} onClick=${() => setOpen(open === x.id ? null : x.id)}>
          <span><span class="muted">If they…</span> ${x.ifThey.charAt(0).toLowerCase() + x.ifThey.slice(1)}</span><${Icon} name="down" class="chev" />
        </button></h2>
        <div id=${'acc-' + x.id} class="acc-panel" hidden=${open !== x.id}><p><strong>You could… </strong>${x.youCould}</p></div>
      </li>`)}
    </ul>
  </div>`;
}

/* ---------------- S10 Toolkit ---------------- */

export function Toolkit({ prefs }) {
  const c = content();
  return html`<div class="screen">
    <${TopBar} title=${S.tabs.toolkit} />
    <p class="lede">Quick tools that work offline. Anything you enter is cleared when you leave the tool.</p>
    <ul class="card-list" role="list">
      ${c.tools.tools.map((t) => html`<li class="card has-star tool-card">
        <span class="tool-icon"><${Icon} name=${t.icon} /></span>
        <a class="card-link-cover" href=${'#/tool/' + t.id} onClick=${(e) => go(e, '/tool/' + t.id)}>
          <span class="card-title">${t.title}</span>
        </a>
        <span class="card-sub">${t.summary}</span>
        <${FavStar} id=${t.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${t.title} />
      </li>`)}
    </ul>
  </div>`;
}
