import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { Field, Switch } from './fields.js';
import {
  content, navigate, goBack, TopBar, FavStar, showDialog, useStore, formStore, openForm, updateForm,
  replaceForm, clearForm, toast,
} from './core.js';
import { prepFor } from '../content.js';
import { PrepButton } from './prep.js';
import {
  validateForm, activeFlags, isSectionVisible, isSectionIncluded, isFieldVisible, isFieldToggledOn,
  switchTemplate, isDirty, createFormState,
} from '../lib/engine.js';
import { hrAdviceEmail } from '../lib/email.js';
import { toggleFavourite } from '../prefs.js';
import { openMail } from '../platform.js';

export function Notice({ level, children, action }) {
  const icon = level === 3 ? 'alert' : level === 2 ? 'warning' : level === 1 ? 'info' : 'spark';
  return html`<div class=${`notice notice-${level}`} role=${level >= 2 ? 'alert' : undefined}>
    <${Icon} name=${icon} size=${22} class="notice-icon" />
    <div class="notice-body"><p>${children}</p>${action || null}</div>
  </div>`;
}

export function ContactHrButton({ title, prefs, label = S.contactHr }) {
  if (!prefs.hrContactEmail && !prefs.hrContactPhone) {
    return html`<a class="link" href="#/settings" onClick=${(e) => { e.preventDefault(); navigate('/settings'); }}>${S.addHrContact}</a>`;
  }
  return html`<div class="btn-row">
    ${prefs.hrContactEmail ? html`<button type="button" class="btn btn-small btn-secondary" onClick=${() => openMail(hrAdviceEmail(prefs.hrContactEmail, title))}><${Icon} name="mail" size=${18} /> ${label === S.contactHr ? S.emailHr : label}</button>` : null}
    ${prefs.hrContactPhone ? html`<a class="btn btn-small btn-secondary" href=${`tel:${prefs.hrContactPhone.replace(/[^\d+]/g, '')}`}><${Icon} name="phone" size=${18} /> ${S.callHr}</a>` : null}
  </div>`;
}

function SectionCard({ section, state, errors, showErrors, scales, onValue, onInclude, onToggle }) {
  const included = isSectionIncluded(section, state);
  const headId = `sec-${section.id}`;
  const fields = section.fields.filter((f) => isFieldVisible(f, state));
  return html`<section class=${`form-section ${included ? '' : 'excluded'}`} aria-labelledby=${headId}>
    <div class="form-section-head">
      <h2 id=${headId}>${section.title}</h2>
      ${section.optional ? html`<label class="include">
        <span class="include-label">${included ? 'Included' : 'Left out'}</span>
        <${Switch} checked=${included} onChange=${(v) => onInclude(section.id, v)} label=${`Include ${section.title} in the email`} />
      </label>` : null}
    </div>
    ${included ? html`<div class="form-section-body">
      ${section.notice ? html`<${Notice} level=${0}>${section.notice}</${Notice}>` : null}
      ${fields.map((f) => {
        const on = isFieldToggledOn(f, state);
        const toggle = f.toggle ? html`<div class="field-toggle"><span id=${`tg-${f.id}`}>${f.toggle}</span>
          <${Switch} checked=${on} onChange=${(v) => onToggle(f.id, v)} label=${f.toggle} /></div>` : null;
        return html`<div key=${f.id}>${toggle}${on ? html`<${Field} field=${f} value=${state.values[f.id]} values=${state.values}
          scales=${scales} error=${showErrors ? errors[f.id] : null}
          placeholderOverride=${f.id === 'discussed' ? state.context.prompt : undefined}
          onChange=${(v) => onValue(f.id, v)} />` : null}</div>`;
      })}
    </div>` : html`<p class="excluded-note">This section won't appear in the email.</p>`}
  </section>`;
}

export function TemplateForm({ id, prefs }) {
  const c = content();
  const template = c.templateById[id];
  const form = useStore(formStore);
  const [showErrors, setShowErrors] = useState(false);
  const liveRef = useRef(null);

  // Open (or keep) the in-memory form for this template.
  if (template && (!form || (form.template.id !== id))) {
    const isPairSwitch = form && template.pair && Object.values(template.pair).includes(form.template.id);
    if (isPairSwitch) {
      replaceForm({ ...form, template, state: switchTemplate(form.state, template, c.header) });
    } else {
      openForm(template, {});
    }
  }
  const current = formStore.get();
  if (!template) return html`<div class="screen"><${TopBar} title="Not found" back=${() => navigate('/meetings')} /><p class="empty">That template doesn't exist.</p></div>`;
  if (!current) return null;
  const { state } = current;

  const errorsList = validateForm(template, c.header, state);
  const errors = Object.fromEntries(errorsList.map((e) => [e.fieldId, e.message]));
  const flags = activeFlags(template, state);

  const onValue = (fid, v) => updateForm((s) => ({ ...s, values: { ...s.values, [fid]: v } }));
  const onInclude = (sid, v) => updateForm((s) => ({ ...s, included: { ...s.included, [sid]: v } }));
  const onToggle = (fid, v) => updateForm((s) => ({ ...s, toggles: { ...s.toggles, [fid]: v } }));

  const preview = () => {
    if (errorsList.length) {
      setShowErrors(true);
      if (liveRef.current) liveRef.current.textContent = S.fixErrors(errorsList.length);
      setTimeout(() => {
        const first = errorsList[0].fieldId;
        const wrap = document.querySelector(`[data-field="${first}"]`);
        const el = document.getElementById(`f-${first}`) || (wrap && wrap.querySelector('input, textarea, button'));
        if (wrap) wrap.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        if (el) el.focus({ preventScroll: true });
      }, 30);
      return;
    }
    navigate(`/template/${id}/preview`);
  };

  const menu = async () => {
    const choice = await showDialog({
      title: template.name,
      sheet: true,
      actions: [
        { label: S.clearForm, value: 'clear' },
        { label: S.aboutTemplate, value: 'about' },
        { label: S.cancel, value: null },
      ],
    });
    if (choice === 'clear') {
      if (isDirty(template, c.header, state)) {
        const ok = await showDialog({ title: S.clearTitle, body: S.clearBody, actions: [{ label: S.cancel, value: false }, { label: S.clear, value: true, danger: true }] });
        if (!ok) return;
      }
      replaceForm({ ...current, state: createFormState(template, c.header, state.context) });
      setShowErrors(false);
      toast('Form cleared.');
    } else if (choice === 'about') {
      showDialog({ title: template.name, body: `${template.purpose} ${template.whenToUse} Typical length: ${template.length}.`, actions: [{ label: 'OK', value: true, primary: true }] });
    }
  };

  const pair = template.pair;
  const ctx = state.context;
  const headerFields = c.header.fields;

  return html`<div class="screen form-screen">
    <${TopBar} title=${template.name} sub=${ctx.guideTitle ? `From: ${ctx.guideTitle}` : null}
      back=${() => goBack(ctx.guideId ? `/guide/${ctx.guideId}` : '/meetings')}
      right=${html`${template.listed !== false ? html`<${FavStar} id=${template.id} favs=${prefs.favourites} onToggle=${toggleFavourite} title=${template.name} />` : null}
        <button type="button" class="icon-btn" aria-label="More options" onClick=${menu}><${Icon} name="more" /></button>`} />

    <form class="form" onSubmit=${(e) => { e.preventDefault(); preview(); }} autocomplete="off" novalidate>
      ${pair ? html`<div class="segmented mode-switch" role="radiogroup" aria-label="1:1 format">
        ${[['full', S.full], ['quick', S.quick]].map(([k, label]) => html`<label class=${`choice ${pair[k] === id ? 'on' : ''}`}>
          <input type="radio" name="mode" checked=${pair[k] === id} onChange=${() => navigate(`/template/${pair[k]}`, { replace: true })} /><span>${label}</span></label>`)}
      </div>` : null}

      ${ctx.guideId ? null : html`<${PrepButton} card=${prepFor(c, 'template', template.id)} />`}
      ${flags.map((f) => html`<${Notice} level=${f.level} action=${f.contactHr ? html`<${ContactHrButton} title=${template.name} prefs=${prefs} />` : null}>${f.text}</${Notice}>`)}
      ${(template.notices || []).map((n) => html`<${Notice} level=${n.level}>${n.text}</${Notice}>`)}
      ${ctx.formNote ? html`<${Notice} level=${1}>${ctx.formNote}</${Notice}>` : null}

      <section class="form-section" aria-labelledby="sec-header">
        <div class="form-section-head"><h2 id="sec-header">${c.header.title}</h2></div>
        <div class="form-section-body">
          ${headerFields.map((f) => html`<${Field} key=${f.id} field=${f} value=${state.values[f.id]} values=${state.values} scales=${c.ratingScales}
            error=${showErrors ? errors[f.id] : null} onChange=${(v) => onValue(f.id, v)} />`)}
        </div>
      </section>

      ${template.sections.filter((s) => isSectionVisible(s, state)).map((s) => html`<${SectionCard} key=${s.id} section=${s} state=${state}
        errors=${errors} showErrors=${showErrors} scales=${c.ratingScales} onValue=${onValue} onInclude=${onInclude} onToggle=${onToggle} />`)}

      <p class="privacy-line"><${Icon} name="lock" size=${16} /> Nothing here is saved. It's cleared when you send or leave.</p>

      <div class="sticky-cta">
        <div ref=${liveRef} class="sr-only" aria-live="assertive"></div>
        ${showErrors && errorsList.length ? html`<p class="cta-errors">${S.fixErrors(errorsList.length)}</p>` : null}
        <button type="submit" class=${`btn btn-primary btn-block ${errorsList.length ? 'is-disabled' : ''}`} aria-disabled=${errorsList.length ? 'true' : undefined}>
          ${S.previewSend}
        </button>
      </div>
    </form>
  </div>`;
}

/** Opens T08 from a guide, showing the guide's notice first if it has one. */
export async function startSummary(guide) {
  const c = content();
  const s = guide.summary;
  if (s.notice) {
    const ok = await showDialog({ title: S.writeSummary, body: s.notice, actions: [{ label: S.continue, value: true, primary: true }, { label: S.notNow, value: false }] });
    if (!ok) return;
  }
  const t = c.templateById.T08;
  const existing = formStore.get();
  if (existing && existing.template.id === 'T08' && existing.state.context.guideId === guide.id) {
    navigate('/template/T08');
    return;
  }
  if (existing && isDirty(existing.template, c.header, existing.state)) {
    const ok = await showDialog({ title: S.leaveTitle, body: `You have an unsent ${existing.template.name}. ${S.leaveBody}`, actions: [{ label: S.keepEditing, value: false, primary: true }, { label: S.discard, value: true, danger: true }] });
    if (!ok) return;
  }
  clearForm();
  openForm(t, { fresh: true, topic: s.topic, prompt: s.prompt, formNote: s.formNote, short: !!s.short, guideId: guide.id, guideTitle: guide.title });
  navigate('/template/T08', { skipGuard: true });
}
