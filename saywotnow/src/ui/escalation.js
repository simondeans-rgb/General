// HR-first gate for "Contact HR first" (Level 3) guides (P0.3).
// Always shown above scripts and checklists. The triage questions only add
// guidance: no answer hides the warning or certifies that it's safe to go ahead,
// and the answers are held in this component only (never stored).
import { html, useState } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { navigate } from './core.js';
import { ContactHrButton } from './form.js';

export function DraftLabel({ status }) {
  if (status === 'approved') return null;
  return html`<p class="draft-label"><${Icon} name="info" size=${14} /> ${S.draftContent}</p>`;
}

function HrContact({ title, prefs }) {
  const has = prefs.hrContactEmail || prefs.hrContactPhone;
  return html`<div class="gate-contact">
    ${has ? null : html`<p><strong>${S.contactHrOrAdviser}</strong></p>`}
    <${ContactHrButton} title=${title} prefs=${prefs} />
  </div>`;
}

export function EscalationGate({ guide, prefs }) {
  const e = guide.escalation;
  const [answers, setAnswers] = useState({});
  if (!e) return null;
  const answered = e.triage.every((_, i) => answers[i]);
  const anyYes = e.triage.some((_, i) => answers[i] === 'yes');
  const id = `gate-${guide.id}`;
  return html`<section class="gate" role="region" aria-labelledby=${`${id}-h`}>
    <div class="gate-head">
      <${Icon} name="alert" size=${26} />
      <h2 id=${`${id}-h`}><span class="sr-only">Warning: </span>${e.headline}</h2>
    </div>
    <p class="gate-stop">${e.stop}</p>
    <${HrContact} title=${guide.title} prefs=${prefs} />
    <fieldset class="gate-triage">
      <legend>${S.gateCheck}</legend>
      <p class="gate-note">${e.triageIntro}</p>
      ${e.triage.map((q, i) => html`<div class="gate-q" role="radiogroup" aria-labelledby=${`${id}-q${i}`} key=${i}>
        <p id=${`${id}-q${i}`}>${q}</p>
        <div class="segmented small">
          ${[['yes', 'Yes or not sure'], ['no', 'No']].map(([v, l]) => html`<label class=${`choice ${answers[i] === v ? 'on' : ''}`}>
            <input type="radio" name=${`${id}-q${i}`} checked=${answers[i] === v} onChange=${() => setAnswers({ ...answers, [i]: v })} /><span>${l}</span></label>`)}
        </div>
      </div>`)}
    </fieldset>
    <div aria-live="polite">
      ${anyYes ? html`<div class="gate-result gate-yes"><p><strong>${e.ifYes}</strong></p>
        <p class="gate-note">${e.holdingIntro}</p>
        <ul class="gate-holding">${e.holding.map((h) => html`<li>${h}</li>`)}</ul></div>` : null}
      ${answered && !anyYes ? html`<div class="gate-result"><p>${e.ifNo}</p></div>` : null}
    </div>
    <${DraftLabel} status=${e.reviewStatus} />
  </section>`;
}

/** Compact reminder shown before scripts (During tab, prep cards) for Level 3 guides. */
export function GateReminder({ guide, linkToGuide = false }) {
  if (!guide || !guide.escalation) return null;
  return html`<div class="gate-mini" role="note">
    <${Icon} name="alert" size=${20} />
    <p><strong>${guide.escalation.headline}.</strong> ${guide.escalation.stop}
      ${linkToGuide ? html` <a class="link" href=${`#/guide/${guide.id}`} onClick=${(ev) => { ev.preventDefault(); navigate(`/guide/${guide.id}`); }}>${S.gateOpenGuide}</a>` : null}</p>
  </div>`;
}
