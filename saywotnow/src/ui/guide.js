import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon, FLAG_ICON } from './icons.js';
import { content, navigate, goBack, TopBar, FavStar, FlagChip, toast, showDialog } from './core.js';
import { prepFor } from '../content.js';
import { PrepButton } from './prep.js';
import { toggleFavourite } from '../prefs.js';
import { copyText } from '../platform.js';
import { ContactHrButton, startSummary } from './form.js';

function stripQuotes(s) {
  const m = /^"(.*)"$/.exec(s.trim());
  return m ? { quote: true, text: m[1] } : { quote: false, text: s };
}

function showLarge(lead, text) {
  return showDialog({
    title: lead || S.sayIt,
    sheet: true,
    contentFirst: true,
    content: () => html`<p class="say-large">${text}</p>`,
    actions: [{ label: S.done, value: true, primary: true }],
  });
}

function QuoteCard({ lead, text }) {
  return html`<li class="quote-card">
    ${lead ? html`<p class="quote-lead">${lead}:</p>` : null}
    <blockquote><p>${text}</p></blockquote>
    <div class="quote-actions">
      <button type="button" class="icon-btn small" aria-label=${`${S.showLarge}: ${text}`} onClick=${() => showLarge(lead, text)}>
        <${Icon} name="expand" size=${20} />
      </button>
      <button type="button" class="icon-btn small" aria-label=${`${S.copyLine}: ${text}`}
        onClick=${async () => { try { await copyText(text); toast(S.lineCopied, 1500); } catch { toast(S.copyFailed); } }}>
        <${Icon} name="copy" size=${20} />
      </button>
    </div>
  </li>`;
}

function OpeningLine({ line }) {
  // Lines can be "Context: "quote"" or a plain quote.
  const m = /^(.*?):\s*"(.*)"$/.exec(line);
  const { text } = m ? { text: m[2] } : stripQuotes(line);
  return html`<${QuoteCard} lead=${m ? m[1] : null} text=${text} />`;
}

function HrPanel({ guide, prefs }) {
  return html`<aside class=${`hr-panel flag-${guide.flagLevel}`} aria-labelledby="hr-h">
    <div class="hr-panel-head">
      <${Icon} name=${FLAG_ICON[guide.flagLevel]} size=${22} />
      <h2 id="hr-h">${S.whenToInvolveHr}</h2>
      <span class="hr-level">Level ${guide.flagLevel}: ${S.flag[guide.flagLevel]}</span>
    </div>
    <ul>${guide.hrTriggers.map((t) => html`<li class=${/^URGENT/.test(t) ? 'urgent' : ''}>${t}</li>`)}</ul>
    <${ContactHrButton} title=${guide.title} prefs=${prefs} />
  </aside>`;
}

export function Guide({ id, prefs }) {
  const c = content();
  const guide = c.guideById[id];
  const [tab, setTab] = useState('before');
  // Checklist ticks are held for this visit only (never stored).
  const [ticks, setTicks] = useState({});
  const [openResp, setOpenResp] = useState(null);
  const tabRefs = useRef({});
  useEffect(() => { setTab('before'); setTicks({}); }, [id]);
  if (!guide) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/conversations')} /><p class="empty">That guide doesn't exist.</p></div>`;

  const tabs = [['before', S.before], ['during', S.during], ['after', S.after]];
  const onTabKey = (e) => {
    const i = tabs.findIndex(([k]) => k === tab);
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); setTab(tabs[n][0]); tabRefs.current[tabs[n][0]].focus(); }
  };
  const done = Object.values(ticks).filter(Boolean).length;
  const summaryLabel = guide.summary.recommended ? S.writeSummary : S.writeSummaryOptional;

  return html`<div class="screen guide-screen">
    <${TopBar} title=${guide.title} back=${() => goBack('/conversations')}
      right=${html`<${FavStar} id=${guide.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${guide.title} />`} />

    <div class="guide-meta">
      <span>${S.categories[guide.category]}</span><span aria-hidden="true">·</span><span><${Icon} name="calendar" size=${16} /> ${guide.length}</span>
      <${FlagChip} level=${guide.flagLevel} />
    </div>
    <${PrepButton} card=${prepFor(c, 'guide', guide.id)} />

    <section class="when" aria-labelledby="when-h">
      <h2 id="when-h" class="mini-title">${S.whenToUse}</h2>
      <p>${guide.whenToUse}</p>
    </section>

    <div class="tabs" role="tablist" aria-label="Guide stages" onKeyDown=${onTabKey}>
      ${tabs.map(([k, label]) => html`<button type="button" role="tab" id=${`tab-${k}`} ref=${(el) => { tabRefs.current[k] = el; }}
        aria-selected=${tab === k} aria-controls=${`panel-${k}`} tabindex=${tab === k ? 0 : -1} class=${tab === k ? 'on' : ''}
        onClick=${() => setTab(k)}>${label}</button>`)}
    </div>

    <div id=${`panel-${tab}`} role="tabpanel" aria-labelledby=${`tab-${tab}`} class="tab-panel" tabindex="0">
      ${tab === 'before' ? html`
        <p class="progress-line">${done} of ${guide.before.length} done · <span class="muted">${S.checklistNote}</span></p>
        <ul class="checklist" role="list">
          ${guide.before.map((item, i) => html`<li><label class=${`choice check ${ticks[i] ? 'on' : ''}`}>
            <input type="checkbox" checked=${!!ticks[i]} onChange=${(e) => setTicks({ ...ticks, [i]: e.target.checked })} /><span>${item}</span>
          </label></li>`)}
        </ul>` : null}

      ${tab === 'during' ? html`
        ${guide.urgentBanner ? html`<div class="urgent-banner" role="alert">
          <${Icon} name="alert" size=${24} />
          <p>${S.urgent}</p>
          <a class="btn btn-danger btn-small" href="tel:999"><${Icon} name="phone" size=${18} /> ${S.call999}</a>
        </div>` : null}
        <h2 class="mini-title">${S.opening}</h2>
        <ul class="quotes" role="list">${guide.opening.map((l) => html`<${OpeningLine} line=${l} />`)}</ul>
        ${guide.sayIt ? html`<h2 class="mini-title">${S.sayIt}</h2>
          <p class="muted say-note">${S.sayItNote}</p>
          <ul class="quotes" role="list">${guide.sayIt.map((x) => html`<${QuoteCard} lead=${x.when} text=${x.line} />`)}</ul>` : null}
        <h2 class="mini-title">${S.keyQuestions}</h2>
        <ul class="bullets">${guide.during.map((l) => html`<li>${l}</li>`)}</ul>
        <h2 class="mini-title">${S.likelyResponses}</h2>
        <ul class="accordion" role="list">
          ${guide.responses.map((r, i) => html`<li class=${`acc-item ${openResp === i ? 'open' : ''}`}>
            <h3 class="acc-h"><button type="button" aria-expanded=${openResp === i} aria-controls=${`resp-${i}`} onClick=${() => setOpenResp(openResp === i ? null : i)}>
              <span><span class="muted">${S.ifTheySay}</span> ${r.theySay}</span><${Icon} name="down" class="chev" />
            </button></h3>
            <div id=${`resp-${i}`} class="acc-panel" hidden=${openResp !== i}><p><strong>${S.youCould} </strong>${r.youCould}</p></div>
          </li>`)}
        </ul>
        <a class="react-link" href="#/reactions" onClick=${(e) => { e.preventDefault(); navigate('/reactions'); }}>
          <${Icon} name="conversations" /><span>${S.reactionsLink}</span><${Icon} name="chevron" size=${18} />
        </a>
        <h2 class="mini-title">${S.donts}</h2>
        <ul class="bullets donts">${guide.donts.map((l) => html`<li>${l}</li>`)}</ul>` : null}

      ${tab === 'after' ? html`
        <ul class="bullets">${guide.after.map((l) => html`<li>${l}</li>`)}</ul>
        <button type="button" class=${`btn btn-block ${guide.summary.recommended ? 'btn-primary' : 'btn-secondary'}`} onClick=${() => startSummary(guide)}>
          <${Icon} name="doc" size=${20} /> ${summaryLabel}
        </button>` : null}
    </div>

    <${HrPanel} guide=${guide} prefs=${prefs} />
  </div>`;
}
