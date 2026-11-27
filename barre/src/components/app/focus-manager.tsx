'use client';

import * as React from 'react';
import { FOCUSABLE, trapTarget, isCloseControl } from '@/lib/focus';

/**
 * One focus manager for every sheet and dialog in the app (UR-31). See
 * lib/focus.ts for the rules. A dialog counts as modal only while it sits in a
 * fixed layer: the desktop detail panel is a sticky side column, not a modal,
 * and Tab must be free to leave it.
 */
export function FocusManager() {
  React.useEffect(() => {
    const modals = () => [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(isModal);
    const top = () => { const m = modals(); return m[m.length - 1] ?? null; };
    const focusables = (el: HTMLElement) =>
      [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(x => x.offsetParent !== null || x === document.activeElement);

    // The last thing focused outside any modal: where focus goes back to.
    let opener: HTMLElement | null = document.activeElement as HTMLElement | null;
    const known = new Set<HTMLElement>();

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.('[aria-modal="true"]')) opener = t;
    };

    const onKey = (e: KeyboardEvent) => {
      const dlg = top();
      if (!dlg) return;
      if (e.key === 'Tab') {
        const list = focusables(dlg);
        const at = list.indexOf(document.activeElement as HTMLElement);
        const next = trapTarget(list.length, dlg.contains(document.activeElement) ? at : -1, e.shiftKey);
        if (next != null) { e.preventDefault(); list[next]?.focus(); }
      } else if (e.key === 'Escape') {
        // Most dialogs close themselves on Escape; give them the first go, then
        // close any that did not through their own close control.
        window.setTimeout(() => {
          if (!dlg.isConnected) return;
          const btn = [...dlg.querySelectorAll<HTMLElement>('button')]
            .find(b => isCloseControl(b.getAttribute('aria-label'), b.textContent));
          if (btn) btn.click();
          else if (dlg.parentElement && dlg.parentElement !== document.body) dlg.parentElement.click();
        }, 0);
      }
    };

    const sync = () => {
      const now = new Set(modals());
      for (const d of now) {
        if (known.has(d)) continue;
        known.add(d);
        // Moves focus inside on open, unless the dialog already did.
        window.setTimeout(() => {
          if (d.isConnected && !d.contains(document.activeElement)) {
            const first = focusables(d).find(x => !/^close/i.test(x.getAttribute('aria-label') ?? '')) ?? focusables(d)[0];
            if (first) first.focus(); else { d.tabIndex = -1; d.focus(); }
          }
        }, 0);
      }
      let closed = false;
      for (const d of [...known]) if (!now.has(d)) { known.delete(d); closed = true; }
      if (closed && now.size === 0) {
        window.setTimeout(() => {
          const a = document.activeElement;
          if ((!a || a === document.body || !a.isConnected) && opener?.isConnected) opener.focus();
        }, 0);
      }
    };

    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKey);
    return () => { mo.disconnect(); document.removeEventListener('focusin', onFocusIn); document.removeEventListener('keydown', onKey); };
  }, []);
  return null;
}

function isModal(el: HTMLElement): boolean {
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === 'fixed') return true;
  }
  return false;
}
