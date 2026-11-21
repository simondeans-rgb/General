// Service worker: caches the whole app on install so it works fully offline,
// and never talks to any other origin. Bump VERSION on every release.
const VERSION = 'saywotnow-1.6.0-1';

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/app.css',
  'assets/fonts/nunito-latin-400-normal.woff2',
  'assets/fonts/nunito-latin-600-normal.woff2',
  'assets/fonts/nunito-latin-700-normal.woff2',
  'assets/fonts/nunito-latin-800-normal.woff2',
  'assets/icons/favicon.svg',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'content/home.json',
  'content/templates.json',
  'content/guides.json',
  'content/reactions.json',
  'content/tools.json',
  'content/pages.json',
  'content/prep.json',
  'content/search.json',
  'content/quickhelp.json',
  'content/timezones.json',
  'content/currencies.json',
  'src/main.js',
  'src/content.js',
  'src/prefs.js',
  'src/strings.js',
  'src/platform.js',
  'src/vendor/preact-htm.js',
  'src/lib/dates.js',
  'src/lib/rules.js',
  'src/lib/engine.js',
  'src/lib/email.js',
  'src/lib/search.js',
  'src/lib/calc/holiday.js',
  'src/lib/calc/notice.js',
  'src/lib/calc/sbi.js',
  'src/lib/calc/timezones.js',
  'src/lib/calc/currency.js',
  'src/ui/core.js',
  'src/ui/icons.js',
  'src/ui/fields.js',
  'src/ui/lists.js',
  'src/ui/form.js',
  'src/ui/prep.js',
  'src/ui/escalation.js',
  'src/ui/quickhelp.js',
  'src/ui/reactchips.js',
  'src/ui/linked.js',
  'src/lib/placeholders.js',
  'src/ui/preview.js',
  'src/ui/guide.js',
  'src/ui/tools.js',
  'src/ui/settings.js',
  'src/ui/timezones.js',
  'src/ui/currency.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(event.request, { ignoreSearch: true });
    if (hit) return hit;
    if (event.request.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
    }
    return fetch(event.request);
  })());
});
