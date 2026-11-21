// 1-minute prep: three questions to ask, one thing to avoid, one thing to remember.
// Read-only content from content/prep.json. Nothing here is stored.
import { html } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { content, navigate, goBack, TopBar, showDialog } from './core.js';
import { tileHref } from './lists.js';

function targetLabel(card) {
  return card.target.type === 'guide' ? S.prepOpenGuide : S.prepStartMeeting;
}

export function PrepBody({ card, headingLevel = 2 }) {
  const { labels } = content().prep;
  const H = `h${headingLevel}`;
  return html`<div class="prep-card">
    <section class="prep-block">
      <${H} class="prep-label"><${Icon} name="chat" size=${20} /> ${labels.ask}</${H}>
      <ol class="prep-ask">${card.ask.map((q) => html`<li>${q}</li>`)}</ol>
    </section>
    <section class="prep-block prep-avoid">
      <${H} class="prep-label"><${Icon} name="warning" size=${20} /> ${labels.avoid}</${H}>
      <p>${card.avoid}</p>
    </section>
    ${card.remember ? html`<section class="prep-block prep-remember">
      <${H} class="prep-label"><${Icon} name="info" size=${20} /> ${labels.remember}</${H}>
      <p>${card.remember}</p>
    </section>` : null}
  </div>`;
}

/** Shows a prep card over the current screen (used from guides and templates, so a form isn't lost). */
export function showPrep(card) {
  return showDialog({
    title: `${content().prep.title}: ${card.title}`,
    sheet: true,
    contentFirst: true,
    content: () => html`<${PrepBody} card=${card} headingLevel=${3} />`,
    actions: [{ label: S.done, value: true, primary: true }],
  });
}

export function PrepButton({ card }) {
  if (!card) return null;
  return html`<button type="button" class="btn btn-secondary btn-small prep-btn" onClick=${() => showPrep(card)}>
    <${Icon} name="hourglass" size=${18} /> ${content().prep.title}
  </button>`;
}

export function PrepList({ prefs }) {
  const P = content().prep;
  const groups = [
    ['meetings', P.cards.filter((c) => c.target.type !== 'guide')],
    ['conversations', P.cards.filter((c) => c.target.type === 'guide')],
  ];
  const go = (e, href) => { e.preventDefault(); navigate(href); };
  return html`<div class="screen prep-list">
    <${TopBar} title=${P.title} back=${() => goBack('/')} />
    <p class="lede">${P.intro}</p>
    ${groups.map(([key, cards]) => html`<section aria-labelledby=${`prep-${key}`}>
      <h2 id=${`prep-${key}`} class="section-title">${P.groups[key]}</h2>
      <ul class="card-list" role="list">
        ${cards.map((c) => html`<li><a class="card card-link" href=${`#/prep/${c.id}`} onClick=${(e) => go(e, `/prep/${c.id}`)}>
          <span class="card-title">${c.title}</span>
          <span class="card-sub clamp">${c.ask[0]}</span>
        </a></li>`)}
      </ul>
    </section>`)}
  </div>`;
}

export function PrepCard({ id, prefs }) {
  const c = content();
  const card = c.prepById[id];
  if (!card) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/prep')} /><p class="empty">That prep card doesn't exist.</p></div>`;
  const href = tileHref(card.target, prefs);
  return html`<div class="screen prep-screen">
    <${TopBar} title=${card.title} sub=${c.prep.title} back=${() => goBack('/prep')} />
    <${PrepBody} card=${card} />
    <a class="btn btn-primary btn-block" href=${'#' + href} onClick=${(e) => { e.preventDefault(); navigate(href); }}>
      ${targetLabel(card)} <${Icon} name="chevron" size=${18} />
    </a>
  </div>`;
}
