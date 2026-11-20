import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';
import { content, navigate, TopBar, showDialog, useStore, formStore, clearForm, toast } from './core.js';
import { validateForm, sendMode } from '../lib/engine.js';
import { buildEmail, emailAsText } from '../lib/email.js';
import { openMail, canShare, shareEmail, copySensitive } from '../platform.js';
import { Notice } from './form.js';

function finish(message) {
  clearForm();
  navigate('/', { replace: true, skipGuard: true });
  toast(message);
}

async function askClearNow() {
  const yes = await showDialog({ title: S.clearNow, actions: [{ label: S.yes, value: true, primary: true }, { label: S.notYet, value: false }] });
  if (yes) finish('Form cleared.');
}

export async function showFallbacks(email) {
  const choice = await showDialog({
    title: S.noMail,
    body: 'Send the summary another way. Nothing is kept by SayWotNow.',
    sheet: true,
    actions: [
      ...(canShare() ? [{ label: S.share, value: 'share', primary: true }] : []),
      { label: S.copy, value: 'copy', primary: !canShare() },
      { label: S.cancel, value: null },
    ],
  });
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
  const waiting = useRef(false);
  const emailRef = useRef(null);

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
        content: (resolve) => html`<p class="dialog-extra"><button type="button" class="link-btn" onClick=${() => resolve('fallback')}>Mail didn't open?</button></p>`,
      });
      if (choice === 'sent') finish(S.sentToast);
      else if (choice === 'draft') finish(S.draftToast);
      else if (choice === 'fallback' && emailRef.current) showFallbacks(emailRef.current);
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
  const email = buildEmail(c, template, state, { prefs, alsoHr });
  emailRef.current = email;

  const send = (e) => {
    openMail(e);
    document.dispatchEvent(new CustomEvent('swn-mail-opened'));
  };

  const sendToEmployee = async () => {
    const ok = await showDialog({ title: S.sendToEmployeeTitle, body: S.sendToEmployeeBody, actions: [{ label: S.cancel, value: false, primary: true }, { label: S.sendAnyway, value: true, danger: true }] });
    if (ok) send(buildEmail(c, template, state, { prefs, alsoHr, forceEmployee: true }));
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

    <div class="email-body" tabindex="0" role="document" aria-label="Email body">${email.body}</div>

    <div class="sticky-cta">
      <button type="button" class="btn btn-primary btn-block" onClick=${() => send(email)}>
        <${Icon} name="mail" size=${20} /> ${email.mode === 'hrOnly' ? S.hrOnlySend : S.openMail}
      </button>
      <div class="cta-secondary">
        <button type="button" class="btn btn-secondary" onClick=${() => navigate(`/template/${id}`)}>${S.edit}</button>
        <button type="button" class="btn btn-ghost" onClick=${() => showFallbacks(email)}><${Icon} name="share" size=${18} /> ${S.noMail}</button>
      </div>
      ${email.mode === 'hrOnly' ? html`<button type="button" class="link-btn center" onClick=${sendToEmployee}>${S.sendToEmployee}</button>` : null}
    </div>
  </div>`;
}
