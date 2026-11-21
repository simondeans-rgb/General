import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { createFormState, isDirty } from '../lib/engine.js';
import { S } from '../strings.js';
import { Icon } from './icons.js';

/* ------------------------------------------------------------------ */
/* Tiny event store                                                    */
/* ------------------------------------------------------------------ */

export function createStore(initial) {
  let value = initial;
  const subs = new Set();
  return {
    get: () => value,
    set(next) { value = typeof next === 'function' ? next(value) : next; subs.forEach((fn) => fn(value)); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export function useStore(store) {
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => force((n) => n + 1)), [store]);
  return store.get();
}

/* ------------------------------------------------------------------ */
/* Content (set once at start-up)                                      */
/* ------------------------------------------------------------------ */

let CONTENT = null;
export function setContent(c) { CONTENT = c; }
export function content() { return CONTENT; }

/* ------------------------------------------------------------------ */
/* Router. The hash holds screen names and content IDs only, never     */
/* anything the user typed (history is kept by the browser).           */
/* ------------------------------------------------------------------ */

export function parseHash(hash = location.hash) {
  const path = hash.replace(/^#\/?/, '');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { path: '/' + parts.join('/'), parts };
}

export const routeStore = createStore(parseHash());
let lastHash = location.hash || '#/';
let suppressNext = false;

/** Template routes that share one in-memory form: /template/:id and /template/:id/preview */
function formIdFor(parts) {
  return parts[0] === 'template' ? parts[1] : null;
}

async function confirmLeave(title = S.leaveTitle, body = S.leaveBody) {
  const choice = await showDialog({
    title,
    body,
    actions: [
      { label: S.keepEditing, value: 'keep', primary: true },
      { label: S.discard, value: 'discard', danger: true },
    ],
  });
  return choice === 'discard';
}

/**
 * Other screens that hold unsaved, in-memory work (the interview pack builder and
 * interview mode) register a guard: { owns(parts), dirty(), clear(), title, body }.
 * Leaving a screen it owns asks first if there's unsaved work, then clears it.
 */
const leaveGuards = [];
export function registerLeaveGuard(guard) { leaveGuards.push(guard); }
function guardLeaving(fromParts, toParts) {
  return leaveGuards.find((g) => g.owns(fromParts) && !g.owns(toParts)) || null;
}

function leavingDirtyForm(fromParts, toParts) {
  const form = formStore.get();
  if (!form) return false;
  const fromId = formIdFor(fromParts);
  if (!fromId || fromId !== form.template.id && !(form.pairIds || []).includes(fromId)) return false;
  const toId = formIdFor(toParts);
  if (toId && (toId === form.template.id || (form.pairIds || []).includes(toId))) return false;
  return isDirty(form.template, CONTENT.header, form.state);
}

export async function navigate(to, { replace = false, skipGuard = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to}`;
  const from = parseHash(location.hash);
  const toParsed = parseHash(target);
  if (!skipGuard && leavingDirtyForm(from.parts, toParsed.parts)) {
    if (!(await confirmLeave())) return false;
    clearForm();
  } else if (formIdFor(from.parts) && !formIdFor(toParsed.parts)) {
    // Leaving an empty form: drop it so the next visit starts fresh.
    if (!skipGuard) clearForm();
  }
  const guard = guardLeaving(from.parts, toParsed.parts);
  if (guard && !skipGuard) {
    if (guard.dirty() && !(await confirmLeave(guard.title, guard.body))) return false;
    guard.clear();
  }
  if (target !== location.hash) {
    suppressNext = true;
    if (replace) location.replace(target); else location.hash = target;
  }
  lastHash = target;
  routeStore.set(parseHash(target));
  return true;
}

export function goBack(fallback = '/') {
  const r = routeStore.get();
  if (history.length > 1 && r.path !== '/') {
    history.back();
  } else {
    navigate(fallback, { replace: true });
  }
}

window.addEventListener('hashchange', async () => {
  if (suppressNext) { suppressNext = false; if (location.hash === lastHash) return; }
  const from = parseHash(lastHash);
  const to = parseHash(location.hash);
  if (leavingDirtyForm(from.parts, to.parts)) {
    // Browser back/forward: put the form back, then ask.
    const wanted = location.hash;
    suppressNext = true;
    history.pushState(null, '', lastHash);
    routeStore.set(parseHash(lastHash));
    if (await confirmLeave()) {
      clearForm();
      navigate(wanted, { replace: true, skipGuard: true });
    }
    return;
  }
  if (formIdFor(from.parts) && !formIdFor(to.parts)) clearForm();
  const guard = guardLeaving(from.parts, to.parts);
  if (guard) {
    if (guard.dirty()) {
      const wanted = location.hash;
      suppressNext = true;
      history.pushState(null, '', lastHash);
      routeStore.set(parseHash(lastHash));
      if (await confirmLeave(guard.title, guard.body)) {
        guard.clear();
        navigate(wanted, { replace: true, skipGuard: true });
      }
      return;
    }
    guard.clear();
  }
  lastHash = location.hash || '#/';
  routeStore.set(to);
});

/* ------------------------------------------------------------------ */
/* The one active form, in memory only (P1).                           */
/* ------------------------------------------------------------------ */

export const formStore = createStore(null);

export function openForm(template, context = {}) {
  const current = formStore.get();
  if (current && current.template.id === template.id && !context.fresh) return current;
  const pair = template.pair ? Object.values(template.pair) : [];
  const form = { template, pairIds: pair, state: createFormState(template, CONTENT.header, context) };
  formStore.set(form);
  return form;
}

export function updateForm(fn) {
  formStore.set((f) => (f ? { ...f, state: fn(f.state) } : f));
}

export function replaceForm(form) { formStore.set(form); }

export function clearForm() {
  formStore.set(null);
}

/* ------------------------------------------------------------------ */
/* Dialogs, sheets and toasts                                          */
/* ------------------------------------------------------------------ */

const dialogStore = createStore([]);
let dialogSeq = 0;

/**
 * Opens a modal dialog. Resolves with the chosen action's value, or null if dismissed.
 * opts: { title, body, actions: [{label, value, primary, danger}], content, sheet, dismissable }
 */
export function showDialog(opts) {
  return new Promise((resolve) => {
    const id = ++dialogSeq;
    const opener = document.activeElement;
    dialogStore.set((list) => [...list, { id, opts, resolve: (v) => {
      dialogStore.set((l) => l.filter((d) => d.id !== id));
      resolve(v);
      if (opener && opener.focus && document.contains(opener)) setTimeout(() => opener.focus(), 0);
    } }]);
  });
}

function Dialog({ d }) {
  const ref = useRef(null);
  const { opts } = d;
  const titleId = `dlg-${d.id}-t`;
  const bodyId = `dlg-${d.id}-b`;
  useEffect(() => {
    const el = ref.current;
    const first = el.querySelector('[data-autofocus]') || el.querySelector('button, [href], input, select, textarea');
    first && first.focus();
    const onKey = (e) => {
      if (e.key === 'Tab') {
        const items = [...el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
        if (!items.length) return;
        const firstEl = items[0]; const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, []);
  return html`<div class="scrim" onClick=${(e) => { if (e.target === e.currentTarget && opts.dismissable !== false) d.resolve(null); }}>
    <div ref=${ref} class=${`dialog ${opts.sheet ? 'sheet' : ''}`} role=${opts.alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby=${titleId} aria-describedby=${opts.body ? bodyId : undefined}>
      <h2 id=${titleId} class="dialog-title">${opts.title}</h2>
      ${opts.body ? html`<p id=${bodyId} class="dialog-body">${opts.body}</p>` : null}
      ${opts.contentFirst && opts.content ? opts.content(d.resolve) : null}
      ${opts.actions && opts.actions.length ? html`<div class="dialog-actions">
        ${opts.actions.map((a, i) => html`<button type="button" class=${`btn ${a.primary ? 'btn-primary' : a.danger ? 'btn-danger' : 'btn-secondary'}`}
          data-autofocus=${i === 0 ? true : undefined} onClick=${() => d.resolve(a.value)}>${a.label}</button>`)}
      </div>` : null}
      ${!opts.contentFirst && opts.content ? opts.content(d.resolve) : null}
    </div>
  </div>`;
}

// Escape closes the topmost dialog, wherever focus is (focus may not have moved into it yet).
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const top = dialogStore.get().at(-1);
  if (!top || top.opts.dismissable === false) return;
  e.preventDefault();
  top.resolve(null);
});

export function DialogHost() {
  const list = useStore(dialogStore);
  useEffect(() => {
    const app = document.getElementById('app-shell');
    if (app) app.inert = list.length > 0;
  }, [list.length]);
  return list.map((d) => html`<${Dialog} key=${d.id} d=${d} />`);
}

const toastStore = createStore(null);
let toastTimer = null;
export function toast(message, ms = 3500) {
  clearTimeout(toastTimer);
  toastStore.set({ message, key: Date.now() });
  toastTimer = setTimeout(() => toastStore.set(null), ms);
}

export function ToastHost() {
  const t = useStore(toastStore);
  return html`<div class="toast-region" role="status" aria-live="polite">${t ? html`<div class="toast" key=${t.key}>${t.message}</div>` : null}</div>`;
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

export function TopBar({ title, back, right, sub }) {
  return html`<header class="topbar">
    ${back ? html`<button type="button" class="icon-btn" aria-label=${S.back} onClick=${back}><${Icon} name="back" /></button>` : html`<span class="icon-btn-spacer"></span>`}
    <div class="topbar-title"><h1>${title}</h1>${sub ? html`<p class="topbar-sub">${sub}</p>` : null}</div>
    <div class="topbar-right">${right}</div>
  </header>`;
}

export function FavStar({ id, favs, onToggle, title }) {
  const on = favs.includes(id);
  return html`<button type="button" class=${`icon-btn star ${on ? 'on' : ''}`} aria-pressed=${on}
    aria-label=${`${on ? S.unfavourite : S.favourite}${title ? `: ${title}` : ''}`}
    onClick=${(e) => { e.stopPropagation(); e.preventDefault(); onToggle(id); }}>
    <${Icon} name="star" filled=${on} />
  </button>`;
}

export function FlagChip({ level, small }) {
  const icon = { 1: 'info', 2: 'warning', 3: 'alert' }[level];
  return html`<span class=${`flag-chip flag-${level} ${small ? 'small' : ''}`}><${Icon} name=${icon} size=${small ? 16 : 18} />${S.flag[level]}</span>`;
}

export function Disclosure({ summary, children, open: initial = false, class: cls = '' }) {
  const [open, setOpen] = useState(initial);
  const id = useRef(`disc-${Math.random().toString(36).slice(2)}`).current;
  return html`<div class=${`disclosure ${open ? 'open' : ''} ${cls}`}>
    <button type="button" class="disclosure-btn" aria-expanded=${open} aria-controls=${id} onClick=${() => setOpen(!open)}>
      <span>${summary}</span><${Icon} name="down" class="chev" />
    </button>
    <div id=${id} class="disclosure-panel" hidden=${!open}>${open ? children : null}</div>
  </div>`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? S.greeting.morning : h < 18 ? S.greeting.afternoon : S.greeting.evening;
}
