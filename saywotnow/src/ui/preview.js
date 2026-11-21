import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { content, navigate, TopBar, showDialog, useStore, formStore, clearForm, toast } from './core.js';
import { validateForm, sendMode } from '../lib/engine.js';
import { buildEmail, emailAsText } from '../lib/email.js';
import { openMail, canShare, shareEmail, copySensitive } from '../platform.js';
import { Notice } from './form.js';
import { Switch } from './fields.js';

function finish(message) {
  clearForm();
  navigate('/', { replace: true, skipGuard: true });
  toast(message);
}

async function askClearNow() {
  const yes = await showDialog({ title: S.clearNow, actions: [{ label: S.yes, value: true, primary: true }, { label: S.notYet, value: false }] });
  if (yes) finish('Form cleared.');
}

/**
 * "No mail app?" sheet. It never holds a copy of the summary: each action asks
 * getEmail() for the current one, which returns null once the form has been
 * discarded, so a stale sheet or callback can't recover the notes (P0.2).
 */
export async function showFallbacks(getEmail) {
  const choice = await showDialog({
    title: S.noMail,
    body: 'Send the summary another way. Nothing is kept by SayWotNow.',
    sheet: true,
    sensitive: true,
    actions: [
      ...(canShare() ? [{ label: S.share, value: 'share', primary: true }] : []),
      { label: S.copy, value: 'copy', primary: !canShare() },
      { label: S.cancel, value: null },
    ],
  });
  if (!choice) return;
  const email = getEmail();
  if (!email) { toast(S.summaryGone); return; }
  if (choice === 'share') {
    try { await shareEmail(email); } catch (e) { if (e && e.name === 'AbortError') return; toast("Couldn't open the share sheet."); return; }
    await askClearNow();
  } else if (choice === 'copy') {
    try { await copySensitive(emailAsText(email)); toast(S.copied, 6000); } catch { toast(S.copyFailed); return; }
    await askClearNow();
  }
}

export function Preview({ id, prefs }) {
  const c = content();
  const form = useStore(formStore);
  const [alsoHr, setAlsoHr] = useState(false);
  // P0.5: off every time the preview opens; never remembered.
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const waiting = useRef(false);
  const optsRef = useRef({ alsoHr: false, prefs, includeSensitive: false });
  // The summary as it stands now, or null if the form has gone (sent, discarded or reloaded).
  const currentEmail = () => {
    const f = formStore.get();
    if (!f || f.template.id !== id) return null;
    return buildEmail(content(), f.template, f.state, optsRef.current);
  };

  const template = c.templateById[id];
  const valid = form && form.template.id === id && validateForm(template, c.header, form.state).length === 0;

  useEffect(() => {
    // Nothing to preview (e.g. the page was reloaded, which clears the form): go back to the form.
    if (!valid) navigate(`/template/${id}`, { replace: true, skipGuard: true });
  }, [valid]);

  useEffect(() => {
    // After handing off to the mail app, ask what happened when the user comes back.
    let timer = null;
    const ask = async () => {
      if (!waiting.current) return;
      waiting.current = false;
      clearTimeout(timer);
      const choice = await showDialog({
        title: S.didSend,
        body: S.didSendBody,
        actions: [
          { label: S.yesClear, value: 'sent', primary: true },
          { label: S.savedDraft, value: 'draft' },
          { label: S.noBack, value: 'back' },
        ],
        dismissable: false,
        sensitive: true,
        content: (resolve) => html`<p class="dialog-extra"><button type="button" class="link-btn" onClick=${() => resolve('fallback')}>Mail didn't open?</button></p>`,
      });
      if (choice === 'sent') finish(S.sentToast);
      else if (choice === 'draft') finish(S.draftToast);
      else if (choice === 'fallback') showFallbacks(currentEmail);
    };
    const onVis = () => { if (document.visibilityState === 'visible') setTimeout(ask, 400); };
    const onFocus = () => setTimeout(ask, 400);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    const startWait = () => { waiting.current = true; timer = setTimeout(ask, 2500); };
    document.addEventListener('swn-mail-opened', startWait);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('swn-mail-opened', startWait);
      clearTimeout(timer);
    };
  }, []);

  if (!valid) return null;
  const { state } = form;
  const mode = sendMode(template, state);
  const hasHr = !!prefs.hrContactEmail;
  optsRef.current = { prefs, alsoHr, includeSensitive };
  const email = buildEmail(c, template, state, optsRef.current);

  const send = (e) => {
    openMail(e);
    document.dispatchEvent(new CustomEvent('swn-mail-opened'));
  };

  const sendToEmployee = async () => {
    const ok = await showDialog({ title: S.sendToEmployeeTitle, body: S.sendToEmployeeBody, actions: [{ label: S.cancel, value: false, primary: true }, { label: S.sendAnyway, value: true, danger: true }] });
    if (ok) send(buildEmail(c, template, state, { ...optsRef.current, forceEmployee: true }));
  };

  return html`<div class="screen preview-screen">
    <${TopBar} title=${S.previewTitle} sub=${template.name} back=${() => navigate(`/template/${id}`)} />

    ${mode === 'hrOnly' && hasHr ? html`<${Notice} level=${3}>This outcome goes to HR first, so it isn't emailed to the employee before HR has advised.</${Notice}>` : null}
    ${mode === 'hrOnly' && !hasHr ? html`<${Notice} level=${3} action=${html`<a class="link" href="#/settings" onClick=${(ev) => { ev.preventDefault(); navigate('/settings'); }}>Go to Settings</a>`}>${S.hrOnlyNoEmail}</${Notice}>` : null}

    <dl class="email-meta">
      <div><dt>${S.to}</dt><dd>${email.to.join(', ')}</dd></div>
      ${email.cc.length ? html`<div><dt>${S.cc}</dt><dd>${email.cc.join(', ')}</dd></div>` : null}
      <div><dt>${S.subject}</dt><dd>${email.subject}</dd></div>
    </dl>

    ${template.allowHrCc && hasHr && email.mode === 'normal' ? html`<label class="choice check also-hr">
      <input type="checkbox" checked=${alsoHr} onChange=${(e) => setAlsoHr(e.target.checked)} /><span>${S.alsoHr} <span class="muted">(${prefs.hrContactEmail})</span></span>
    </label>` : null}

    ${email.withheld.length || includeSensitive ? html`<div class=${`sensitive-box ${includeSensitive ? 'on' : ''}`}>
      <div class="field-toggle"><span id="inc-sens">${S.includeSensitive}</span>
        <${Switch} checked=${includeSensitive} onChange=${setIncludeSensitive} label=${S.includeSensitive} describedby="inc-sens-h" /></div>
      <p class="field-help" id="inc-sens-h">${includeSensitive ? S.sensitiveOn : S.sensitiveOff}</p>
    </div>` : null}

    <div class="email-body" tabindex="0" role="document" aria-label="Email body">${email.body}</div>
    <p class="privacy-line"><${Icon} name="lock" size=${16} /> ${S.leavesApp}</p>

    <div class="sticky-cta">
      <button type="button" class="btn btn-primary btn-block" onClick=${() => send(email)}>
        <${Icon} name="mail" size=${20} /> ${email.mode === 'hrOnly' ? S.hrOnlySend : S.openMail}
      </button>
      <div class="cta-secondary">
        <button type="button" class="btn btn-secondary" onClick=${() => navigate(`/template/${id}`)}>${S.edit}</button>
        <button type="button" class="btn btn-ghost" onClick=${() => showFallbacks(currentEmail)}><${Icon} name="share" size=${18} /> ${S.noMail}</button>
      </div>
      ${email.mode === 'hrOnly' ? html`<button type="button" class="link-btn center" onClick=${sendToEmployee}>${S.sendToEmployee}</button>` : null}
    </div>
  </div>`;
}
