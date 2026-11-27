/* Swayvo service worker (R-017, UR-04).
   - Keeps the app shell and the in-browser database files so the app opens
     with no signal; register marks wait on the device (lib/offline).
   - Shows push notifications and opens the right screen when tapped. */
const SHELL = 'barre-shell-v2';
const scope = self.registration.scope;

// Pages a teacher needs with no signal (UR-04): Today, the register and
// feedback. Their shells are fetched on install, so "Open register" works
// offline even before that screen was visited on this device; the data comes
// from the database in the browser.
const PRECACHE = ['', 'teach/', 'teach/register/', 'teach/feedback/', 'teach/students/'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(PRECACHE.map(p => precache(c, scope + p)))));
});

// A page and the scripts and styles it names, so it can start with no signal.
async function precache(c, href) {
  try {
    const r = await fetch(new Request(href, { credentials: 'same-origin' }));
    if (!r.ok) return;
    const html = await r.clone().text();
    await c.put(pageKey(href), r);
    const assets = new Set();
    for (const m of html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)) assets.add(new URL(m[1].replace(/&amp;/g, '&'), href).href);
    await Promise.all([...assets].map(a => c.match(a).then(hit => hit || fetch(a).then(x => { if (x.ok) return c.put(a, x); })).catch(() => undefined)));
  } catch { /* offline during install: pages are cached as they are visited */ }
}
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* Record detail lives in the query string (?session=…): the page is the same
   whatever the query, so pages are cached by path alone. A register visited
   for one class then opens offline for any other. */
function pageKey(href) {
  const u = new URL(href);
  u.search = ''; u.hash = '';
  if (!u.pathname.endsWith('/')) u.pathname += '/';
  return u.href;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(scope)) return;
  const url = new URL(req.url);
  const immutable = url.pathname.includes('/_next/static/') || url.pathname.includes('/pglite/') || url.pathname.includes('/icons/');
  const rsc = req.headers.get('RSC') === '1' || url.searchParams.has('_rsc');
  if (immutable) {
    e.respondWith(caches.open(SHELL).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
  } else if (rsc) {
    // A client-side navigation's payload. Offline, fail fast: the router then
    // falls back to a full page load, which the cached page shell answers.
    e.respondWith(fetch(req).catch(() => Response.error()));
  } else if (req.mode === 'navigate') {
    // Network first for pages, falling back to the last copy of that page
    // (whatever its query string), then to the app's start page.
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put(pageKey(req.url), copy)); }
      return r;
    }).catch(async () => (await caches.match(pageKey(req.url)))
      || (await caches.match(req, { ignoreSearch: true }))
      || (await caches.match(pageKey(scope)))
      || Response.error()));
  }
});

// The page lists the scripts, styles and database files it has loaded, so
// they are kept even when they were first fetched before this worker took
// control (the first visit) or by a route that has not been precached.
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type !== 'warm' || !Array.isArray(d.urls)) return;
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(d.urls
    .filter(u => typeof u === 'string' && u.startsWith(scope) && /\/(_next\/static|pglite|icons)\//.test(u))
    .map(u => c.match(u).then(hit => hit || fetch(u).then(r => { if (r.ok) return c.put(u, r); })).catch(() => undefined)))));
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Your dance school', {
    body: d.body || '', tag: d.tag, data: { href: d.href || '' }, icon: scope + 'icons/icon-192.png', badge: scope + 'icons/icon-192.png',
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.href || '').replace(/^\//, ''), scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = all.find(c => c.url.startsWith(scope));
    if (open) { await open.focus(); return open.navigate(target); }
    return self.clients.openWindow(target);
  })());
});
