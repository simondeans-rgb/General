// Quick Help: "I need help with a conversation" (P1.2).
// Two plain-language choices lead to a compact card built only from the matching
// guide and its 1-minute prep card (reviewed content, nothing generated). Choices
// live in the URL as content IDs only; nothing typed, nothing stored.
// A serious concern always routes to HR-first or urgent help, and a Level 3 guide
// always shows its full HR-first gate first, so Quick Help can't bypass it.
import { html } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { content, navigate, goBack, TopBar, FlagChip } from './core.js';
import { prepFor } from '../content.js';
import { ContactHrButton } from './form.js';
import { EscalationGate, DraftLabel } from './escalation.js';
import { QuoteCard } from './guide.js';
import { ReactChips } from './reactchips.js';

const Q = () => content().quickhelp;
const go = (e, to) => { e.preventDefault(); navigate(to); };
const unquote = (s) => {
  const m = /^(?:.*?:\s*)?"(.*)"$/.exec(String(s).trim());
  return m ? m[1] : s;
};

function Choice({ href, children, tone }) {
  return html`<li><a class=${`card card-link qh-choice ${tone || ''}`} href=${'#' + href} onClick=${(e) => go(e, href)}>
    <span class="card-title">${children}</span><${Icon} name="chevron" size=${18} />
  </a></li>`;
}

export function QuickHelp({ parts, prefs }) {
  const [gid, step] = parts;
  const q = Q();
  const guide = gid ? content().guideById[gid] : null;
  if (gid && !guide) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/quick')} /><p class="empty">That situation doesn't exist.</p></div>`;

  // Step 1: what's happening?
  if (!guide) {
    return html`<div class="screen qh">
      <${TopBar} title=${q.title} sub="Step 1 of 2" back=${() => goBack('/')} />
      <p class="lede">${q.intro}</p>
      <h2 class="section-title">${q.situationQuestion}</h2>
      <ul class="card-list" role="list">${q.situations.map((s) => html`<${Choice} href=${`/quick/${s.guide}`}>${s.label}</${Choice}>`)}</ul>
      <p class="footer-link"><a href="#/conversations" onClick=${(e) => go(e, '/conversations')}>${S.allGuides}</a></p>
    </div>`;
  }

  // Step 2: any serious concern?
  if (!step) {
    return html`<div class="screen qh">
      <${TopBar} title=${q.title} sub="Step 2 of 2" back=${() => goBack('/quick')} />
      <h2 class="section-title">${q.seriousQuestion}</h2>
      <p class="muted">${q.seriousHelp}</p>
      <ul class="card-list" role="list">
        ${q.serious.map((s) => html`<${Choice} href=${`/quick/${gid}/${s.level}`} tone=${`qh-tone-${s.level}`}>${s.label}</${Choice}>`)}
        <${Choice} href=${`/quick/${gid}/card`}>${q.noneLabel}</${Choice}>
      </ul>
    </div>`;
  }

  if (step === 'urgent') return html`<${Urgent} guide=${guide} prefs=${prefs} />`;
  if (step === 'hr') return html`<${HrFirst} guide=${guide} prefs=${prefs} />`;
  return html`<${Card} guide=${guide} prefs=${prefs} />`;
}

function FullGuide({ guide }) {
  return html`<a class="btn btn-secondary btn-block" href=${`#/guide/${guide.id}`} onClick=${(e) => go(e, `/guide/${guide.id}`)}>
    ${Q().labels.full}: ${guide.title} <${Icon} name="chevron" size=${18} /></a>`;
}

function Urgent({ guide, prefs }) {
  const g06 = content().guideById.G06;
  return html`<div class="screen qh">
    <${TopBar} title=${Q().labels.urgentTitle} back=${() => goBack(`/quick/${guide.id}`)} />
    <div class="urgent-banner" role="alert">
      <${Icon} name="alert" size=${24} />
      <p>${content().search.riskyMessages.urgent}</p>
      <a class="btn btn-danger btn-small" href="tel:999"><${Icon} name="phone" size=${18} /> ${S.call999}</a>
    </div>
    <${ContactHrButton} title=${g06.title} prefs=${prefs} />
    <h2 class="section-title">${S.thenSee}</h2>
    <${FullGuide} guide=${g06} />
    ${guide.id !== 'G06' ? html`<${FullGuide} guide=${guide} />` : null}
  </div>`;
}

function HrFirst({ guide, prefs }) {
  // Uses the reviewed-content HR-first gate: the guide's own, or Behaviour and conduct's.
  const gateGuide = guide.escalation ? guide : content().guideById.G03;
  const e = gateGuide.escalation;
  const has = prefs.hrContactEmail || prefs.hrContactPhone;
  return html`<div class="screen qh">
    <${TopBar} title=${Q().labels.hrTitle} back=${() => goBack(`/quick/${guide.id}`)} />
    <section class="gate" role="region" aria-labelledby="qh-hr-h">
      <div class="gate-head"><${Icon} name="alert" size=${26} /><h2 id="qh-hr-h"><span class="sr-only">Warning: </span>${Q().labels.hrTitle}</h2></div>
      <p class="gate-stop">${e.ifYes}</p>
      ${has ? null : html`<p><strong>${S.contactHrOrAdviser}</strong></p>`}
      <${ContactHrButton} title=${guide.title} prefs=${prefs} />
      <p class="gate-note">${e.holdingIntro}</p>
      <ul class="gate-holding">${e.holding.map((h) => html`<li>${h}</li>`)}</ul>
      <${DraftLabel} status=${e.reviewStatus} />
    </section>
    <p class="muted">${S.qhPrepOnly}</p>
    <${FullGuide} guide=${gateGuide} />
    ${gateGuide.id !== guide.id ? html`<${FullGuide} guide=${guide} />` : null}
  </div>`;
}

function Card({ guide, prefs }) {
  const q = Q();
  const prep = prepFor(content(), 'guide', guide.id);
  const opening = unquote(guide.opening[0]);
  return html`<div class="screen qh qh-card" data-guide=${guide.id}>
    <${TopBar} title=${guide.title} sub=${q.title} back=${() => goBack(`/quick/${guide.id}`)} />
    <div class="guide-meta"><${FlagChip} level=${guide.flagLevel} /></div>
    <p class="scope-note"><span class="uk-chip">${S.ukGuidance}</span> ${S.ukScopeShort}</p>
    <${EscalationGate} guide=${guide} prefs=${prefs} />
    <section class="prep-block"><h2 class="prep-label">${q.labels.objective}</h2><p>${guide.whenToUse}</p></section>
    <h2 class="mini-title">${q.labels.opening}</h2>
    <ul class="quotes" role="list"><${QuoteCard} text=${opening} /></ul>
    ${prep ? html`<section class="prep-block"><h2 class="prep-label"><${Icon} name="chat" size=${20} /> ${q.labels.prompts}</h2>
      <ol class="prep-ask">${prep.ask.map((a) => html`<li>${a}</li>`)}</ol></section>
      <section class="prep-block prep-avoid"><h2 class="prep-label"><${Icon} name="warning" size=${20} /> ${q.labels.avoid}</h2><p>${prep.avoid}</p></section>` : null}
    <section class="prep-block prep-remember"><h2 class="prep-label"><${Icon} name="info" size=${20} /> ${q.labels.next}</h2><p>${guide.after[0]}</p></section>
    ${guide.flagLevel >= 2 && !guide.escalation ? html`<div class="qh-hr"><p>${S.qhHrNote}</p><${ContactHrButton} title=${guide.title} prefs=${prefs} /></div>` : null}
    <${ReactChips} />
    <${FullGuide} guide=${guide} />
  </div>`;
}
