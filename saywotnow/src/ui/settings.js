import { html, useState } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon, Logo, Mark } from './icons.js';
import { content, navigate, goBack, TopBar, toast } from './core.js';
import { Switch } from './fields.js';
import { setPref } from '../prefs.js';
import { isValidEmail } from '../lib/engine.js';
import { validateBands } from '../lib/calc/bradford.js';
import { formatLong } from '../lib/dates.js';
import { openMail } from '../platform.js';

export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';

function Row({ children, href, onClick, icon }) {
  const inner = html`${icon ? html`<${Icon} name=${icon} size=${20} />` : null}<span class="row-label">${children}</span><${Icon} name="chevron" size=${18} class="row-chev" />`;
  return href
    ? html`<a class="settings-row" href=${'#' + href} onClick=${(e) => { e.preventDefault(); navigate(href); }}>${inner}</a>`
    : html`<button type="button" class="settings-row" onClick=${onClick}>${inner}</button>`;
}

function HrContact({ prefs }) {
  const [email, setEmail] = useState(prefs.hrContactEmail);
  const [phone, setPhone] = useState(prefs.hrContactPhone);
  const [err, setErr] = useState({});
  const saveEmail = () => {
    const v = email.trim();
    if (v && !isValidEmail(v)) { setErr({ ...err, email: 'Enter a valid email address.' }); return; }
    setErr({ ...err, email: null });
    if (v !== prefs.hrContactEmail) { setPref('hrContactEmail', v); toast(v ? 'HR email saved.' : 'HR email removed.'); }
  };
  const savePhone = () => {
    const v = phone.trim();
    if (v && !/^[+\d][\d\s()-]{5,24}$/.test(v)) { setErr({ ...err, phone: 'Enter a valid phone number.' }); return; }
    setErr({ ...err, phone: null });
    if (v !== prefs.hrContactPhone) { setPref('hrContactPhone', v); toast(v ? 'HR phone number saved.' : 'HR phone number removed.'); }
  };
  return html`<div class="settings-group">
    <div class="field">
      <label class="field-label" for="hr-email">HR contact email</label>
      <p class="field-help" id="hr-email-h">Your HR team's business email, used by Contact HR buttons. Don't add personal email addresses.</p>
      <input id="hr-email" class="input" type="email" inputmode="email" autocomplete="off" autocapitalize="off" spellcheck="false" value=${email}
        aria-describedby=${`hr-email-h${err.email ? ' hr-email-e' : ''}`} aria-invalid=${err.email ? 'true' : undefined}
        onInput=${(e) => setEmail(e.target.value)} onBlur=${saveEmail} onKeyDown=${(e) => e.key === 'Enter' && e.target.blur()} placeholder="hr@company.co.uk" />
      ${err.email ? html`<p class="field-error" id="hr-email-e" role="alert">${err.email}</p>` : null}
    </div>
    <div class="field">
      <label class="field-label" for="hr-phone">HR contact phone</label>
      <input id="hr-phone" class="input" type="tel" inputmode="tel" autocomplete="off" value=${phone}
        aria-describedby=${err.phone ? 'hr-phone-e' : undefined} aria-invalid=${err.phone ? 'true' : undefined}
        onInput=${(e) => setPhone(e.target.value)} onBlur=${savePhone} onKeyDown=${(e) => e.key === 'Enter' && e.target.blur()} placeholder="020 7946 0000" />
      ${err.phone ? html`<p class="field-error" id="hr-phone-e" role="alert">${err.phone}</p>` : null}
    </div>
  </div>`;
}

function Bands({ prefs }) {
  const [bands, setBands] = useState(prefs.bradfordBands.length ? prefs.bradfordBands : []);
  const [error, setError] = useState(null);
  const update = (next) => { setBands(next); setError(null); };
  const save = () => {
    const msg = validateBands(bands);
    if (msg) { setError(msg); return; }
    setPref('bradfordBands', bands);
    toast(bands.length ? 'Bands saved.' : 'Bands removed.');
  };
  return html`<div class="settings-group">
    <p class="field-help">Use the trigger points from your company's absence policy. Leave "to" empty for "and above".</p>
    ${bands.length ? html`<ol class="bands" role="list">${bands.map((b, i) => html`<li class="band-row" key=${i}>
      <div><label class="sub-label" for=${`b-from-${i}`}>From</label><input id=${`b-from-${i}`} class="input" type="number" inputmode="numeric" min="0" value=${b.from} onInput=${(e) => update(bands.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))} /></div>
      <div><label class="sub-label" for=${`b-to-${i}`}>To</label><input id=${`b-to-${i}`} class="input" type="number" inputmode="numeric" min="0" value=${b.to} onInput=${(e) => update(bands.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} /></div>
      <div class="grow"><label class="sub-label" for=${`b-l-${i}`}>Label</label><input id=${`b-l-${i}`} class="input" type="text" maxlength="60" value=${b.label} placeholder="e.g. No action" onInput=${(e) => update(bands.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /></div>
      <button type="button" class="icon-btn" aria-label=${`Remove band ${i + 1}`} onClick=${() => update(bands.filter((_, j) => j !== i))}><${Icon} name="trash" size=${20} /></button>
    </li>`)}</ol>` : null}
    ${error ? html`<p class="field-error" role="alert">${error}</p>` : null}
    <div class="btn-row">
      ${bands.length < 5 ? html`<button type="button" class="btn btn-ghost" onClick=${() => update([...bands, { from: bands.length ? String(Number(bands[bands.length - 1].to || 0) + 1) : '0', to: '', label: '' }])}><${Icon} name="plus" size=${18} /> Add band</button>` : null}
      <button type="button" class="btn btn-secondary" onClick=${save}>Save bands</button>
    </div>
  </div>`;
}

export function Settings({ prefs }) {
  const c = content();
  const support = c.pages.supportEmail;
  return html`<div class="screen settings">
    <${TopBar} title=${S.settings} back=${() => goBack('/')} />

    <h2 class="section-title">HR contact</h2>
    <${HrContact} prefs=${prefs} />

    <h2 class="section-title">Preferences</h2>
    <div class="settings-group">
      <fieldset class="field"><legend class="field-label">Default 1:1 format</legend>
        <div class="segmented" role="radiogroup">
          ${[['full', S.full], ['quick', S.quick]].map(([k, l]) => html`<label class=${`choice ${prefs.defaultOneToOneMode === k ? 'on' : ''}`}><input type="radio" name="d11" checked=${prefs.defaultOneToOneMode === k} onChange=${() => setPref('defaultOneToOneMode', k)} /><span>${l}</span></label>`)}
        </div>
      </fieldset>
      <div class="field-toggle"><span id="footer-l">Add "Sent from SayWotNow" to emails</span><${Switch} checked=${prefs.emailFooterEnabled} onChange=${(v) => setPref('emailFooterEnabled', v)} label='Add "Sent from SayWotNow" to emails' /></div>
      <fieldset class="field"><legend class="field-label">Appearance</legend>
        <div class="segmented" role="radiogroup">
          ${[['system', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => html`<label class=${`choice ${prefs.theme === k ? 'on' : ''}`}><input type="radio" name="theme" checked=${prefs.theme === k} onChange=${() => setPref('theme', k)} /><span>${l}</span></label>`)}
        </div>
      </fieldset>
    </div>

    <h2 class="section-title">Bradford Factor bands</h2>
    <${Bands} prefs=${prefs} />

    <h2 class="section-title">About</h2>
    <nav class="settings-group list" aria-label="About SayWotNow">
      <${Row} icon="spark" onClick=${() => navigate('/onboarding/replay')}>Show introduction</${Row}>
      <${Row} icon="info" href="/page/about">About</${Row}>
      <${Row} icon="warning" href="/page/disclaimer">Disclaimer</${Row}>
      <${Row} icon="lock" href="/page/privacy">Privacy statement</${Row}>
      <${Row} icon="doc" href="/page/content">Content information</${Row}>
      ${support ? html`<${Row} icon="mail" onClick=${() => openMail({ to: [support], subject: `SayWotNow feedback (v${APP_VERSION})`, body: '' })}>Send feedback</${Row}>` : null}
    </nav>
    <p class="version">Version ${APP_VERSION} (build ${APP_BUILD}) · Content ${c.contentVersion}</p>
  </div>`;
}

export function StaticPage({ id }) {
  const c = content();
  const p = c.pages;
  let title; let body;
  if (id === 'disclaimer') { title = 'Disclaimer'; body = [p.disclaimer.text]; }
  else if (id === 'privacy') { title = p.privacy.title; body = [...p.privacy.text, p.supportEmail ? `Contact: ${p.supportEmail}` : null].filter(Boolean); }
  else if (id === 'about') { title = p.about.title; body = p.about.text; }
  else if (id === 'content') {
    title = p.contentInfo.title;
    body = [`Content version ${c.contentVersion}, last reviewed ${formatLong(c.lastReviewed)}.`, p.contentInfo.text];
  } else { title = 'Not found'; body = ["That page doesn't exist."]; }
  return html`<div class="screen page">
    <${TopBar} title=${title} back=${() => goBack('/settings')} />
    ${id === 'about' ? html`<div class="about-logo"><${Logo} size=${40} tagline /></div>` : null}
    <div class="prose">${body.map((t) => html`<p>${t}</p>`)}</div>
  </div>`;
}

/* ---------------- S01 Onboarding ---------------- */

function Art({ kind }) {
  // Simple line illustrations in brand colours.
  const common = { fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  if (kind === 'pocket') {
    return html`<svg viewBox="0 0 160 140" class="art" aria-hidden="true">
      <path d="M30 40h100v50a40 40 0 0 1-40 40H70a40 40 0 0 1-40-40z" stroke="var(--plum)" ...${common} />
      <path d="M30 40c20 18 80 18 100 0" stroke="var(--plum)" ...${common} />
      <rect x="62" y="12" width="36" height="46" rx="8" fill="var(--surface)" stroke="var(--teal-ink)" ...${common} />
      <path d="M70 26h20M70 34h14" stroke="var(--teal-ink)" ...${common} />
      <path d="M112 18l-3-10M122 24l8-6M126 34l10-2" stroke="var(--amber)" ...${common} stroke-width="5" />
    </svg>`;
  }
  if (kind === 'lock') {
    return html`<svg viewBox="0 0 160 140" class="art" aria-hidden="true">
      <rect x="45" y="60" width="70" height="58" rx="12" stroke="var(--plum)" ...${common} />
      <path d="M58 60V45a22 22 0 0 1 44 0v15" stroke="var(--plum)" ...${common} />
      <circle cx="80" cy="86" r="7" stroke="var(--teal-ink)" ...${common} />
      <path d="M80 93v10" stroke="var(--teal-ink)" ...${common} />
      <path d="M118 40l-3-10M128 46l8-6M132 56l10-2" stroke="var(--amber)" ...${common} stroke-width="5" />
    </svg>`;
  }
  return html`<svg viewBox="0 0 160 140" class="art" aria-hidden="true">
    <path d="M30 30h70a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H58l-18 14V86H30a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z" stroke="var(--plum)" ...${common} />
    <path d="M52 52h36M52 64h22" stroke="var(--plum)" ...${common} />
    <path d="M100 96h22a8 8 0 0 0 8-8V70" stroke="var(--teal-ink)" ...${common} />
    <path d="M118 112c-14 0-28-14-28-28l8-6 8 10-4 6c2 4 6 8 10 10l6-4 10 8z" stroke="var(--teal-ink)" ...${common} />
    <path d="M124 26l-3-10M134 32l8-6M138 42l10-2" stroke="var(--amber)" ...${common} stroke-width="5" />
  </svg>`;
}

export function Onboarding({ onDone, replay }) {
  const p = content().pages;
  const [i, setI] = useState(0);
  const pages = p.onboarding;
  const isDisclaimer = i >= pages.length;
  const page = pages[i];
  const touch = { x: null };
  return html`<div class="onboarding" onTouchStart=${(e) => { touch.x = e.touches[0].clientX; }}
      onTouchEnd=${(e) => { if (touch.x === null || isDisclaimer) return; const dx = e.changedTouches[0].clientX - touch.x; if (dx < -50) setI(i + 1); if (dx > 50 && i > 0) setI(i - 1); touch.x = null; }}>
    <div class="ob-top">
      ${i > 0 ? html`<button type="button" class="link-btn" onClick=${() => setI(i - 1)}>${S.back}</button>` : html`<span></span>`}
      ${!isDisclaimer ? html`<button type="button" class="link-btn" onClick=${() => setI(pages.length)}>${S.skip}</button>` : replay ? html`<button type="button" class="link-btn" onClick=${() => onDone(false)}>Close</button>` : html`<span></span>`}
    </div>
    ${!isDisclaimer ? html`<div class="ob-page" key=${i} aria-live="polite">
      ${i === 0 ? html`<div class="ob-logo"><${Logo} size=${44} tagline /></div>` : null}
      <${Art} kind=${page.art} />
      <h1>${page.heading}</h1>
      <p>${page.text}</p>
      ${i === 1 ? html`<p class="muted small">${p.onboardingNote}</p>` : null}
    </div>` : html`<div class="ob-page disclaimer" key="d">
      <div class="ob-mark"><${Mark} size=${72} /></div>
      <h1>${p.disclaimer.title}</h1>
      <div class="prose"><p>${p.disclaimer.text}</p></div>
    </div>`}
    <div class="ob-bottom">
      <div class="dots" aria-label=${`Page ${Math.min(i + 1, pages.length + 1)} of ${pages.length + 1}`} role="img">
        ${[...pages, null].map((_, j) => html`<span class=${`dot ${j === i ? 'on' : ''}`}></span>`)}
      </div>
      ${!isDisclaimer ? html`<button type="button" class="btn btn-primary btn-block" onClick=${() => setI(i + 1)}>${S.next}</button>`
        : html`<button type="button" class="btn btn-primary btn-block" onClick=${() => onDone(true)}>${S.understand}</button>`}
    </div>
  </div>`;
}
