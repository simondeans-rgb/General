'use client';

import * as React from 'react';

/* Settings are one row of tabs (U4). Some tabs are sections of one page,
   addressed by the hash ("/studio#places"), so the page keeps its state and
   a section can still be linked to. */

const subscribe = (fn: () => void) => {
  window.addEventListener('hashchange', fn);
  window.addEventListener('popstate', fn);
  return () => { window.removeEventListener('hashchange', fn); window.removeEventListener('popstate', fn); };
};

/** The current hash, without "#"; empty on the server. */
export function useLocationHash(): string {
  return React.useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => '');
}

/** The section a page shows: the hash when it names one, else the first. */
export function useSection<T extends string>(sections: readonly T[], aliases: Record<string, T> = {}): T {
  const h = useLocationHash();
  const named = (aliases[h] ?? h) as T;
  return sections.includes(named) ? named : sections[0]!;
}

const split = (href: string) => { const [path, frag = ''] = href.split('#'); return { path: path!, frag }; };

/** Whether a tab is the current one. A tab without a hash is current when no
 *  sibling tab on the same page names the hash. */
export function sectionActive(siblings: { href: string }[], href: string, pathname: string, hash: string): boolean {
  const { path, frag } = split(href);
  if (pathname.replace(/\/$/, '') !== path) return false;
  if (frag) return frag === hash;
  return !siblings.some(s => { const o = split(s.href); return o.path === path && o.frag && o.frag === hash; });
}

/** A tab on the page already open changes the hash in place (which a Link
 *  would not announce); anywhere else the Link navigates as usual. */
export function onSectionClick(e: React.MouseEvent, href: string, pathname: string) {
  const { path, frag } = split(href);
  if (pathname.replace(/\/$/, '') !== path || (!frag && !window.location.hash)) return;
  e.preventDefault();
  if (frag) window.location.hash = frag;
  else if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
  window.scrollTo({ top: 0 });
}
