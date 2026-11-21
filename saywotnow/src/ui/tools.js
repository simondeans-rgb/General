import { html, useState } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { content, navigate, goBack, TopBar, FavStar, Disclosure, toast } from './core.js';
import { DateInput, Switch } from './fields.js';
import { Notice } from './form.js';
import { toggleFavourite, setPref } from '../prefs.js';
import { calculateHoliday, NATIONS } from '../lib/calc/holiday.js';
import { calculateNotice } from '../lib/calc/notice.js';
import { buildSbi } from '../lib/calc/sbi.js';
import { formatWithDay, todayISO } from '../lib/dates.js';
import { copySensitive } from '../platform.js';
import { TimeZones } from './timezones.js';
import { Currency } from './currency.js';

const PRIVATE = { autocomplete: 'off', autocorrect: 'off', spellcheck: false };

function ToolShell({ tool, prefs, children }) {
  return html`<div class="screen tool-screen">
    <${TopBar} title=${tool.title} back=${() => goBack('/toolkit')}
      right=${html`<${FavStar} id=${tool.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${tool.title} />`} />
    ${tool.ukOnly ? html`<p class="scope-note"><span class="uk-chip">${S.ukRules}</span> ${S.ukToolScope}</p>` : null}
    ${tool.note && tool.noteFirst ? html`<${Notice} level=${tool.noteLevel || 1}>${tool.note}</${Notice}>` : null}
    ${tool.howItWorks ? html`<${Disclosure} summary=${S.howItWorks} class="how"><p>${tool.howItWorks}</p></${Disclosure}>` : null}
    ${children}
    ${tool.note && !tool.noteFirst ? html`<${Notice} level=${tool.noteLevel || 1}>${tool.note}</${Notice}>` : null}
  </div>`;
}

function NumField({ id, label, value, onChange, error, help, step = 'any', min, max, suffix }) {
  return html`<div class="field">
    <label class="field-label" for=${id}>${label}</label>
    ${help ? html`<p class="field-help" id=${id + '-h'}>${help}</p>` : null}
    <div class="with-suffix">
      <input id=${id} class="input input-short" type="number" inputmode="decimal" step=${step} min=${min} max=${max} value=${value} ...${PRIVATE}
        aria-invalid=${error ? 'true' : undefined} aria-describedby=${[help ? id + '-h' : '', error ? id + '-e' : ''].filter(Boolean).join(' ') || undefined}
        onInput=${(e) => onChange(e.target.value)} />
      ${suffix ? html`<span class="suffix">${suffix}</span>` : null}
    </div>
    ${error ? html`<p class="field-error" id=${id + '-e'} role="alert">${error}</p>` : null}
  </div>`;
}

function DateField({ id, label, value, onChange, error, help, optional }) {
  return html`<div class="field">
    <label class="field-label" for=${id}>${label}${optional ? html`<span class="opt"> (optional)</span>` : null}</label>
    ${help ? html`<p class="field-help" id=${id + '-h'}>${help}</p>` : null}
    <${DateInput} id=${id} value=${value} onChange=${onChange} invalid=${!!error} label=${label}
      describedby=${[help ? id + '-h' : '', error ? id + '-e' : ''].filter(Boolean).join(' ') || undefined} />
    ${error ? html`<p class="field-error" id=${id + '-e'} role="alert">${error}</p>` : null}
  </div>`;
}

function Segmented({ name, label, options, value, onChange }) {
  return html`<fieldset class="field"><legend class="field-label">${label}</legend>
    <div class="segmented" role="radiogroup">
      ${options.map(([v, l]) => html`<label class=${`choice ${value === v ? 'on' : ''}`}><input type="radio" name=${name} checked=${value === v} onChange=${() => onChange(v)} /><span>${l}</span></label>`)}
    </div></fieldset>`;
}

function ResultCard({ title, children }) {
  return html`<section class="result" aria-live="polite" aria-labelledby="result-h"><h2 id="result-h" class="mini-title">${title}</h2>${children}</section>`;
}

/* ---------------- Holiday ---------------- */

function Holiday({ tool, prefs }) {
  const [v, setV] = useState({ entitlement: '28', includesBankHolidays: true, fullTimeDays: '5', employeeDays: '', yearStart: '', startDate: '', leaveDate: '' });
  const [res, setRes] = useState(null);
  const set = (k) => (x) => { setV({ ...v, [k]: x }); setRes(null); };
  const errs = res && !res.ok ? res.errors : {};
  return html`<${ToolShell} tool=${tool} prefs=${prefs}>
    <form class="form tool-form" onSubmit=${(e) => { e.preventDefault(); setRes(calculateHoliday({ ...v, nation: prefs.holidayNation })); }} novalidate>
      <${NumField} id="h-ent" label="Full-time annual entitlement" suffix="days" value=${v.entitlement} onChange=${set('entitlement')} error=${errs.entitlement} />
      <${Segmented} name="nation" label="Where do they work?" options=${Object.entries(NATIONS).map(([k, n]) => [k, n.short])}
        value=${prefs.holidayNation} onChange=${(k) => { setPref('holidayNation', k); setRes(null); }} />
      <div class="field-toggle"><span id="h-bh">Includes bank holidays</span><${Switch} checked=${v.includesBankHolidays} onChange=${set('includesBankHolidays')} label="Entitlement includes bank holidays" /></div>
      <${NumField} id="h-ft" label="Full-time days per week" value=${v.fullTimeDays} step="0.5" min="0.5" max="7" onChange=${set('fullTimeDays')} error=${errs.fullTimeDays} />
      <${NumField} id="h-emp" label="Employee's days per week" help="0.5 to 7, in half days." value=${v.employeeDays} step="0.5" min="0.5" max="7" onChange=${set('employeeDays')} error=${errs.employeeDays} />
      <${Disclosure} summary="Part-year (joining or leaving this holiday year)" open=${!!(v.startDate || v.leaveDate)}>
        <${DateField} id="h-ys" label="Holiday year start date" value=${v.yearStart} onChange=${set('yearStart')} error=${errs.yearStart} help="e.g. 1 January or 1 April." />
        <${DateField} id="h-sd" label="Employee start date" optional value=${v.startDate} onChange=${set('startDate')} error=${errs.startDate} />
        <${DateField} id="h-ld" label="Employee leave date" optional value=${v.leaveDate} onChange=${set('leaveDate')} error=${errs.leaveDate} />
      </${Disclosure}>
      <button type="submit" class="btn btn-primary btn-block">${S.calculate}</button>
    </form>
    ${res && res.ok ? html`<${ResultCard} title="Holiday entitlement">
      <p class="big-number">${res.rounded} <span>days</span></p>
      <p class="muted">Exact figure: ${res.exact.toFixed(2)} days, rounded up to the nearest half day.${!v.includesBankHolidays ? ` Bank holidays are on top (${res.bankHolidays} a year in ${NATIONS[res.nation].label}).` : ''}</p>
      ${res.belowStatutory ? html`<${Notice} level=${3}>This is below the statutory minimum of ${res.statutory.toFixed(2)} days (including bank holidays). Check the entitlement with HR.</${Notice}>` : html`<p class="ok-line"><${Icon} name="check" size=${18} /> Meets the statutory minimum of ${res.statutory.toFixed(2)} days.</p>`}
      <h3 class="mini-title">The working</h3>
      <ol class="working">${res.steps.map((s) => html`<li>${s}</li>`)}</ol>
    </${ResultCard}>` : null}
  </${ToolShell}>`;
}

/* ---------------- Notice ---------------- */

function Notice_({ tool, prefs }) {
  const [v, setV] = useState({ who: 'Employer', startDate: '', noticeDate: todayISO(), contractAmount: '', contractUnit: 'weeks' });
  const [res, setRes] = useState(null);
  const set = (k) => (x) => { setV({ ...v, [k]: x }); setRes(null); };
  const errs = res && !res.ok ? res.errors : {};
  return html`<${ToolShell} tool=${tool} prefs=${prefs}>
    <form class="form tool-form" onSubmit=${(e) => { e.preventDefault(); setRes(calculateNotice({ ...v })); }} novalidate>
      <${Segmented} name="who" label="Who is giving notice?" options=${[['Employer', 'Employer'], ['Employee', 'Employee']]} value=${v.who} onChange=${set('who')} />
      <${DateField} id="n-sd" label="Employment start date" value=${v.startDate} onChange=${set('startDate')} error=${errs.startDate} />
      <${DateField} id="n-nd" label="Date notice is given" value=${v.noticeDate} onChange=${set('noticeDate')} error=${errs.noticeDate} />
      <fieldset class="field"><legend class="field-label">Contractual notice<span class="opt"> (optional)</span></legend>
        <div class="row-split tight">
          <div class="with-suffix"><input id="n-ca" class="input input-short" type="number" inputmode="numeric" min="0" step="1" value=${v.contractAmount} ...${PRIVATE}
            aria-label="Contractual notice amount" aria-invalid=${errs.contractAmount ? 'true' : undefined} onInput=${(e) => set('contractAmount')(e.target.value)} /></div>
          <div class="segmented small" role="radiogroup" aria-label="Unit">
            ${['weeks', 'months'].map((u) => html`<label class=${`choice ${v.contractUnit === u ? 'on' : ''}`}><input type="radio" name="unit" checked=${v.contractUnit === u} onChange=${() => set('contractUnit')(u)} /><span>${u}</span></label>`)}
          </div>
        </div>
        ${errs.contractAmount ? html`<p class="field-error" role="alert">${errs.contractAmount}</p>` : null}
      </fieldset>
      <button type="submit" class="btn btn-primary btn-block">${S.calculate}</button>
    </form>
    ${res && res.ok ? html`<${ResultCard} title="Notice period">
      <dl class="result-list">
        <div><dt>Completed years of service</dt><dd>${res.years}${res.years === 0 ? ` (${res.months} month${res.months === 1 ? '' : 's'})` : ''}</dd></div>
        <div><dt>Statutory minimum</dt><dd>${res.underOneMonth ? 'None (less than 1 month’s service)' : res.statutory}</dd></div>
        <div><dt>Contractual notice</dt><dd>${res.contractual || 'Not entered'}</dd></div>
        <div class="strong"><dt>Notice that applies</dt><dd>${res.applies}${res.basis === 'contractual' ? ' (contractual)' : res.basis === 'statutory' ? ' (statutory)' : ''}</dd></div>
        <div class="strong"><dt>Last day of employment</dt><dd>${formatWithDay(res.lastDay)}</dd></div>
      </dl>
      <p class="muted">Notice starts the day after it's given (${formatWithDay(res.noticeStarts)}).${v.who === 'Employee' && !res.contractual ? ' Check the contract: it usually sets a longer notice period for employees.' : ''}</p>
    </${ResultCard}>` : null}
  </${ToolShell}>`;
}

/* ---------------- SBI ---------------- */

function Sbi({ tool, prefs }) {
  const [v, setV] = useState({ type: 'Developmental', situation: '', behaviour: '', impact: '' });
  const out = buildSbi(v, tool.nextLine);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const area = (k, label, help) => html`<div class="field">
    <label class="field-label" for=${'sbi-' + k}>${label}</label><p class="field-help">${help}</p>
    <textarea id=${'sbi-' + k} class="input textarea short" rows="2" maxlength="500" placeholder=${tool.placeholders[k]} value=${v[k]} onInput=${set(k)} ...${PRIVATE}></textarea></div>`;
  return html`<${ToolShell} tool=${tool} prefs=${prefs}>
    <form class="form tool-form" onSubmit=${(e) => e.preventDefault()}>
      <${Segmented} name="type" label="Type of feedback" options=${[['Positive', 'Positive'], ['Developmental', 'Developmental']]} value=${v.type} onChange=${(x) => setV({ ...v, type: x })} />
      ${area('situation', 'Situation', 'When and where?')}
      ${area('behaviour', 'Behaviour', 'What did they say or do? Stick to what you saw or heard.')}
      ${area('impact', 'Impact', 'What was the effect on you, the team or the work?')}
    </form>
    <${ResultCard} title="Your feedback">
      ${out ? html`<blockquote class="sbi-out"><p>${out.statement}</p><p class="next-line">${out.next}</p></blockquote>
        <button type="button" class="btn btn-secondary" onClick=${async () => { try { await copySensitive(out.text); toast(S.copied, 6000); } catch { toast(S.copyFailed); } }}><${Icon} name="copy" size=${18} /> Copy</button>`
        : html`<p class="muted">Fill in all three boxes to build your feedback.</p>`}
    </${ResultCard}>
    <${Disclosure} summary="See examples">
      <ul class="examples" role="list">${tool.examples.map((x) => {
        const b = buildSbi(x, tool.nextLine);
        return html`<li><span class="badge">${x.type}</span><p>${b.statement} <em>${b.next}</em></p></li>`;
      })}</ul>
    </${Disclosure}>
  </${ToolShell}>`;
}

function TimeZoneTool({ tool, prefs }) {
  return html`<${ToolShell} tool=${tool} prefs=${prefs}><${TimeZones} tool=${tool} prefs=${prefs} /></${ToolShell}>`;
}

function CurrencyTool({ tool, prefs }) {
  return html`<${ToolShell} tool=${tool} prefs=${prefs}><${Currency} tool=${tool} prefs=${prefs} /></${ToolShell}>`;
}

const TOOLS = { holiday: Holiday, notice: Notice_, sbi: Sbi, timezones: TimeZoneTool, currency: CurrencyTool };

export function Tool({ id, prefs }) {
  const tool = content().toolById[id];
  if (!tool) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/toolkit')} /><p class="empty">That tool doesn't exist.</p></div>`;
  const C = TOOLS[id];
  if (!C) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/toolkit')} /><p class="empty">That tool doesn't exist.</p></div>`;
  // Keyed by id so inputs reset whenever you open a tool.
  return html`<${C} key=${id} tool=${tool} prefs=${prefs} />`;
}
