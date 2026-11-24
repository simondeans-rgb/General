/* Barre service worker (R-017).
   - Keeps the app shell and the in-browser database files so the app opens
     with no signal (registers taken offline already queue — see
     lib/offline/attendance-queue).
   - Shows push notifications and opens the right screen when tapped. */
const SHELL = 'barre-shell-v1';
const scope = self.registration.scope;

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(scope)) return;
  const url = new URL(req.url);
  const immutable = url.pathname.includes('/_next/static/') || url.pathname.includes('/pglite/') || url.pathname.includes('/icons/');
  if (immutable) {
    e.respondWith(caches.open(SHELL).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
  } else if (req.mode === 'navigate') {
    // Network first for pages, falling back to the last copy when offline.
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put(req, copy)); return r; })
      .catch(async () => (await caches.match(req)) || (await caches.match(scope)) || Response.error()));
  }
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
