/**
 * "Ready offline" (round 2 panel, F14): is this phone actually able to open
 * today's registers with no signal? It must be true, so it is checked, not
 * assumed: the service worker is in charge of the page, the Today and
 * register pages and the database runtime are in its cache, and each of
 * today's registers (with the children's safety notes) has just been read
 * from the database on this device.
 */

export const SHELL_CACHE = 'barre-shell-v2';
/** The pages a teacher needs in a basement, by the worker's cache key. */
export const OFFLINE_PAGES = ['teach/', 'teach/register/'];

export type OfflineChecks = {
  /** A service worker controls this page. */
  worker: boolean;
  /** Today and the register page are cached. */
  pages: boolean;
  /** The in-browser database runtime is cached. */
  runtime: boolean;
  /** Today's registers read from this device, of how many. */
  registersRead: number; registersTotal: number;
};

export type Readiness =
  | { state: 'ready'; registers: number }
  | { state: 'not_ready'; reason: 'app' | 'registers' };

/** The verdict, from what was checked. Pure, so it can be tested. */
export function readiness(c: OfflineChecks): Readiness {
  if (!c.worker || !c.pages || !c.runtime) return { state: 'not_ready', reason: 'app' };
  if (c.registersRead < c.registersTotal) return { state: 'not_ready', reason: 'registers' };
  return { state: 'ready', registers: c.registersTotal };
}

/** What the worker has cached on this device. Browser only; false when unsure. */
export async function checkAppCache(): Promise<Pick<OfflineChecks, 'worker' | 'pages' | 'runtime'>> {
  const none = { worker: false, pages: false, runtime: false };
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || typeof caches === 'undefined') return none;
    const worker = !!navigator.serviceWorker.controller;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!worker || !reg) return { ...none, worker };
    const cache = await caches.open(SHELL_CACHE);
    const pages = (await Promise.all(OFFLINE_PAGES.map(p => cache.match(reg.scope + p)))).every(Boolean);
    const runtime = (await cache.keys()).some(k => k.url.includes('/pglite/'));
    return { worker, pages, runtime };
  } catch {
    return none;
  }
}
