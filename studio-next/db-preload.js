/* Swayvo demo: start fetching the in-browser database the moment the page
   starts, in parallel with the app's own JavaScript (which is ~2.5 MB and
   would otherwise have to arrive, start and render before the database's
   engine was even asked for).

   It only fetches, and counts bytes for the loader's progress. The engine's
   two big files are fetched gzipped where the browser can unpack them
   (DecompressionStream): 5.5 MB instead of 16 MB. src/lib/db/client.ts picks
   up what this started from window.__barreDb, unpacks it, and fetches for
   itself if this did not run. Nothing is fetched on the marketing page. */
(function () {
  try {
    var el = document.currentScript || document.querySelector('script[data-barre-preload]');
    var base = (el && el.getAttribute('data-base')) || '';
    var path = location.pathname.slice(base.length).replace(/\/$/, '');
    if (path === '/welcome' || window.__barreDb) return;
    var gz = typeof DecompressionStream === 'function';

    function count(url) {
      var d = { loaded: 0, total: 0, gz: gz };
      d.done = fetch(url + (gz ? '.gz' : '')).then(function (res) {
        if (!res.ok) throw new Error(url + ': ' + res.status);
        // A response the server compressed again is unpacked by the browser,
        // and its length is no longer the length of what is read.
        d.total = res.headers.get('content-encoding') ? 0 : Number(res.headers.get('content-length')) || 0;
        if (!res.body || !res.body.getReader) return res.blob();
        var reader = res.body.getReader(), chunks = [];
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return new Blob(chunks);
            chunks.push(r.value); d.loaded += r.value.byteLength;
            return pump();
          });
        }
        return pump();
      });
      d.done.catch(function () { /* the loader reports it */ });
      return d;
    }
    window.__barreDb = { files: { wasm: count(base + '/pglite/pglite.wasm'), data: count(base + '/pglite/pglite.data') } };

    var l = document.createElement('link');
    l.rel = 'modulepreload';
    l.href = base + '/pglite/index.js';
    document.head.appendChild(l);
  } catch (e) { /* the loader fetches for itself */ }
})();
