import { html, useRef, useLayoutEffect } from '../vendor/preact-htm.js';
import { LIMITS, OWNERS, emptyValueFor, isRequired } from '../lib/engine.js';
import { formatShort, todayISO } from '../lib/dates.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';

// Attributes that stop browsers remembering, autofilling or sending typed text
// to cloud spellcheckers (P2/P7 equivalents on the web).
const PRIVATE_INPUT = { autocomplete: 'off', autocorrect: 'off', spellcheck: false, 'data-lpignore': 'true', 'data-1p-ignore': 'true', 'data-form-type': 'other' };

function moveToNext(e) {
  if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
  e.preventDefault();
  const form = e.target.closest('form') || document;
  const items = [...form.querySelectorAll('input:not([type=hidden]):not([disabled]), textarea, select')]
    .filter((x) => x.offsetParent !== null && x.type !== 'checkbox' && x.type !== 'radio');
  const i = items.indexOf(e.target);
  if (i >= 0 && items[i + 1]) items[i + 1].focus();
  else e.target.blur();
}

function Label({ field, forId, required, as = 'label' }) {
  const content = html`${field.label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : html`<span class="opt"> (optional)</span>`}`;
  return as === 'legend'
    ? html`<legend class="field-label">${content}</legend>`
    : html`<label class="field-label" for=${forId}>${content}</label>`;
}

function Help({ id, text }) {
  return text ? html`<p id=${id} class="field-help">${text}</p>` : null;
}

function ErrorText({ id, error }) {
  return error ? html`<p id=${id} class="field-error" role="alert"><${Icon} name="alert" size=${16} /> ${error}</p>` : null;
}

function describedBy(...ids) {
  const s = ids.filter(Boolean).join(' ');
  return s || undefined;
}

function AutoTextarea(props) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight + 2, 96)}px`;
  }, [props.value]);
  return html`<textarea ref=${ref} ...${props} />`;
}

export function DateInput({ id, value, onChange, required, invalid, describedby, label, min }) {
  const ref = useRef(null);
  const open = () => {
    const el = ref.current;
    if (el && typeof el.showPicker === 'function') { try { el.showPicker(); } catch { /* ignore */ } }
  };
  return html`<div class=${`date-input ${invalid ? 'invalid' : ''}`}>
    <span class=${`date-display ${value ? '' : 'placeholder'}`} aria-hidden="true">${value ? formatShort(value) : 'Choose a date'}</span>
    <${Icon} name="calendar" size=${20} class="date-icon" />
    <input ref=${ref} id=${id} type="date" value=${value || ''} min=${min || undefined} required=${required}
      aria-invalid=${invalid ? 'true' : undefined} aria-describedby=${describedby} aria-label=${label}
      onClick=${open} onChange=${(e) => onChange(e.target.value)} onInput=${(e) => onChange(e.target.value)} onKeyDown=${moveToNext} />
    ${value && !required ? html`<button type="button" class="date-clear" aria-label=${`Clear ${label || 'date'}`} onClick=${() => onChange('')}><${Icon} name="close" size=${16} /></button>` : null}
  </div>`;
}

/** Renders any field type from its definition. */
export function Field({ field, value, values, onChange, error, scales, placeholderOverride }) {
  const id = `f-${field.id}`;
  const helpId = field.helper ? `${id}-help` : null;
  const errId = error ? `${id}-err` : null;
  const required = isRequired(field, values);
  const desc = describedBy(helpId, errId);
  const invalid = !!error;

  switch (field.type) {
    case 'shortText':
    case 'email':
      return html`<div class="field" data-field=${field.id}>
        <${Label} field=${field} forId=${id} required=${required} />
        <${Help} id=${helpId} text=${field.helper} />
        <input id=${id} class="input" type=${field.type === 'email' ? 'email' : 'text'} inputmode=${field.type === 'email' ? 'email' : undefined}
          value=${value} maxlength=${field.type === 'shortText' ? LIMITS.shortText : 254} placeholder=${field.placeholder || ''}
          autocapitalize=${field.type === 'email' ? 'off' : 'sentences'} enterkeyhint="next" ...${PRIVATE_INPUT}
          aria-invalid=${invalid ? 'true' : undefined} aria-describedby=${desc} aria-required=${required ? 'true' : undefined}
          onInput=${(e) => onChange(e.target.value)} onKeyDown=${moveToNext} />
        <${ErrorText} id=${errId} error=${error} />
      </div>`;

    case 'longText': {
      const len = (value || '').length;
      return html`<div class="field" data-field=${field.id}>
        <${Label} field=${field} forId=${id} required=${required} />
        <${Help} id=${helpId} text=${field.helper} />
        <${AutoTextarea} id=${id} class="input textarea" value=${value} maxlength=${LIMITS.longText}
          placeholder=${placeholderOverride || field.placeholder || ''} autocapitalize="sentences" ...${PRIVATE_INPUT}
          aria-invalid=${invalid ? 'true' : undefined} aria-describedby=${desc} aria-required=${required ? 'true' : undefined}
          onInput=${(e) => onChange(e.target.value)} />
        ${len >= LIMITS.longTextCounterFrom ? html`<p class="counter" aria-live="polite">${S.chars(len, LIMITS.longText)}</p>` : null}
        <${ErrorText} id=${errId} error=${error} />
      </div>`;
    }

    case 'number':
      return html`<div class="field" data-field=${field.id}>
        <${Label} field=${field} forId=${id} required=${required} />
        <${Help} id=${helpId} text=${field.helper} />
        <input id=${id} class="input input-short" type="number" inputmode="decimal" min=${LIMITS.numberMin} max=${LIMITS.numberMax} step=${LIMITS.numberStep}
          value=${value} enterkeyhint="next" ...${PRIVATE_INPUT}
          aria-invalid=${invalid ? 'true' : undefined} aria-describedby=${desc} aria-required=${required ? 'true' : undefined}
          onInput=${(e) => onChange(e.target.value)} onKeyDown=${moveToNext} />
        <${ErrorText} id=${errId} error=${error} />
      </div>`;

    case 'date':
      return html`<div class="field" data-field=${field.id}>
        <${Label} field=${field} forId=${id} required=${required} />
        <${Help} id=${helpId} text=${field.helper} />
        <${DateInput} id=${id} value=${value} onChange=${onChange} required=${required} invalid=${invalid} describedby=${desc} label=${field.label}
          min=${field.min && field.min.field ? values[field.min.field] : undefined} />
        <${ErrorText} id=${errId} error=${error} />
      </div>`;

    case 'dateRange': {
      const v = value || { from: '', to: '' };
      return html`<fieldset class="field" data-field=${field.id}>
        <${Label} field=${field} required=${required} as="legend" />
        <${Help} id=${helpId} text=${field.helper} />
        <div class="range">
          <div><label class="sub-label" for=${id}>From</label>
            <${DateInput} id=${id} value=${v.from} onChange=${(x) => onChange({ ...v, from: x })} required=${required} invalid=${invalid} describedby=${desc} label="From" /></div>
          <div><label class="sub-label" for=${id + '-to'}>To</label>
            <${DateInput} id=${id + '-to'} value=${v.to} min=${v.from} onChange=${(x) => onChange({ ...v, to: x })} required=${required} invalid=${invalid} describedby=${desc} label="To" /></div>
        </div>
        <${ErrorText} id=${errId} error=${error} />
      </fieldset>`;
    }

    case 'rating': {
      const labels = scales[field.scale] || [];
      return html`<fieldset class="field" data-field=${field.id}>
        <${Label} field=${field} required=${required} as="legend" />
        <${Help} id=${helpId} text=${field.helper} />
        <div class="rating" role="group" aria-describedby=${desc}>
          ${[1, 2, 3, 4, 5].map((n) => html`<button type="button" id=${n === 1 ? id : undefined} class=${`chip rating-chip ${value === n ? 'on' : ''}`} aria-pressed=${value === n}
            onClick=${() => onChange(value === n ? null : n)}>
            <span class="rating-n">${n}</span><span class="rating-l">${labels[n - 1] || ''}</span>
          </button>`)}
        </div>
        <${ErrorText} id=${errId} error=${error} />
      </fieldset>`;
    }

    case 'singleChoice': {
      const segmented = field.options.length <= 3 && field.options.every((o) => o.length <= 14);
      return html`<fieldset class="field" data-field=${field.id}>
        <${Label} field=${field} required=${required} as="legend" />
        <${Help} id=${helpId} text=${field.helper} />
        <div class=${segmented ? 'segmented' : 'choice-list'} role="radiogroup" aria-describedby=${desc} aria-invalid=${invalid ? 'true' : undefined} aria-required=${required ? 'true' : undefined}>
          ${field.options.map((o, i) => html`<label class=${`choice ${value === o ? 'on' : ''}`}>
            <input type="radio" id=${i === 0 ? id : undefined} name=${id} value=${o} checked=${value === o}
              onClick=${() => { if (value === o && !required) onChange(''); }}
              onChange=${() => onChange(o)} />
            <span>${o}</span>
          </label>`)}
        </div>
        <${ErrorText} id=${errId} error=${error} />
      </fieldset>`;
    }

    case 'multiChoice':
    case 'checklist': {
      const arr = value || [];
      return html`<fieldset class="field" data-field=${field.id}>
        <${Label} field=${field} required=${required} as="legend" />
        <${Help} id=${helpId} text=${field.helper} />
        <div class="choice-list">
          ${field.options.map((o, i) => html`<label class=${`choice check ${arr.includes(o) ? 'on' : ''}`}>
            <input type="checkbox" id=${i === 0 ? id : undefined} checked=${arr.includes(o)} aria-describedby=${desc}
              onChange=${(e) => onChange(e.target.checked ? field.options.filter((x) => x === o || arr.includes(x)) : arr.filter((x) => x !== o))} />
            <span>${o}</span>
          </label>`)}
        </div>
        <${ErrorText} id=${errId} error=${error} />
      </fieldset>`;
    }

    case 'actionList':
      return html`<${ActionList} field=${field} id=${id} value=${value || []} onChange=${onChange} error=${error} errId=${errId} helpId=${helpId} />`;

    case 'repeater':
      return html`<${Repeater} field=${field} id=${id} value=${value || []} onChange=${onChange} error=${error} errId=${errId} helpId=${helpId} scales=${scales} />`;

    default:
      return null;
  }
}

function ActionList({ field, id, value, onChange, error, errId, helpId }) {
  const rows = value.length ? value : [];
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () => {
    onChange([...rows, { action: '', owner: '', due: '' }]);
    setTimeout(() => { const el = document.getElementById(`${id}-${rows.length}-action`); el && el.focus(); }, 30);
  };
  return html`<fieldset class="field" data-field=${field.id}>
    <legend class="field-label">${field.label}<span class="opt"> (optional)</span></legend>
    <${Help} id=${helpId} text=${field.helper} />
    <ol class="rows" role="list">
      ${rows.map((r, i) => html`<li class="row-card" key=${i}>
        <div class="row-head"><span class="row-n">${S.action} ${i + 1}</span>
          <button type="button" class="link-btn danger" onClick=${() => onChange(rows.filter((_, j) => j !== i))} aria-label=${`${S.removeRow} action ${i + 1}`}><${Icon} name="trash" size=${18} /> ${S.removeRow}</button></div>
        <label class="sub-label" for=${`${id}-${i}-action`}>${S.action}</label>
        <input id=${`${id}-${i}-action`} class="input" type="text" value=${r.action} maxlength=${LIMITS.shortText * 2} enterkeyhint="next" ...${PRIVATE_INPUT}
          onInput=${(e) => set(i, { action: e.target.value })} onKeyDown=${moveToNext} />
        <div class="row-split owner-row">
          <fieldset class="owner"><legend class="sub-label">${S.owner}</legend>
            <div class="segmented small" role="radiogroup">
              ${OWNERS.map((o) => html`<label class=${`choice ${r.owner === o ? 'on' : ''}`}>
                <input type="radio" name=${`${id}-${i}-owner`} checked=${r.owner === o} onClick=${() => { if (r.owner === o) set(i, { owner: '' }); }} onChange=${() => set(i, { owner: o })} /><span>${o}</span></label>`)}
            </div>
          </fieldset>
          <div><label class="sub-label" for=${`${id}-${i}-due`}>${S.due}</label>
            <${DateInput} id=${`${id}-${i}-due`} value=${r.due} onChange=${(x) => set(i, { due: x })} label=${`Due date for action ${i + 1}`} min=${todayISO()} /></div>
        </div>
      </li>`)}
    </ol>
    ${rows.length < LIMITS.actionList ? html`<button type="button" class="btn btn-ghost add-btn" id=${rows.length ? undefined : id} onClick=${add}><${Icon} name="plus" size=${20} /> ${S.addAction}</button>` : null}
    <${ErrorText} id=${errId} error=${error} />
  </fieldset>`;
}

function Repeater({ field, id, value, onChange, error, errId, helpId, scales }) {
  const rows = value;
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const blank = () => Object.fromEntries(field.fields.map((f) => [f.id, emptyValueFor(f)]));
  const add = () => {
    onChange([...rows, blank()]);
    setTimeout(() => { const el = document.getElementById(`${id}-${rows.length}-${field.fields[0].id}`); el && el.focus(); }, 30);
  };
  const noun = field.itemLabel || 'Item';
  return html`<fieldset class="field" data-field=${field.id}>
    <legend class="field-label">${field.label}<span class="opt"> (optional)</span></legend>
    <${Help} id=${helpId} text=${field.helper} />
    <ol class="rows" role="list">
      ${rows.map((r, i) => html`<li class="row-card" key=${i}>
        <div class="row-head"><span class="row-n">${noun} ${i + 1}</span>
          <button type="button" class="link-btn danger" onClick=${() => onChange(rows.filter((_, j) => j !== i))} aria-label=${`${S.removeRow} ${noun.toLowerCase()} ${i + 1}`}><${Icon} name="trash" size=${18} /> ${S.removeRow}</button></div>
        ${field.fields.map((sf) => html`<${Field} key=${sf.id} field=${{ ...sf, id: `${field.id}-${i}-${sf.id}`, label: sf.label }}
          value=${r[sf.id]} values=${{}} scales=${scales} onChange=${(x) => set(i, { [sf.id]: x })} />`)}
      </li>`)}
    </ol>
    ${rows.length < (field.max || 10) ? html`<button type="button" class="btn btn-ghost add-btn" id=${rows.length ? undefined : id} onClick=${add}><${Icon} name="plus" size=${20} /> Add ${noun.toLowerCase()}</button>` : null}
    <${ErrorText} id=${errId} error=${error} />
  </fieldset>`;
}

/** An accessible on/off switch. */
export function Switch({ id, checked, onChange, label, describedby }) {
  return html`<button type="button" id=${id} class=${`switch ${checked ? 'on' : ''}`} role="switch" aria-checked=${checked}
    aria-label=${label} aria-describedby=${describedby} onClick=${() => onChange(!checked)}><span class="knob"></span></button>`;
}
