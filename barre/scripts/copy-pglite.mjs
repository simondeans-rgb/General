/* PGlite ships an Emscripten build whose glue code does not survive the
   production bundler's minification ("m.instantiateWasm is not a function").
   Rather than fight the bundler, the prebuilt ESM is copied into public/ and
   imported at runtime from a URL the bundler never sees. It also means the
   16MB of wasm and filesystem data are plain static assets a CDN can cache. */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync, constants } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules/@electric-sql/pglite/dist');
const to = join(root, 'public/pglite');

rmSync(to, { recursive: true, force: true });
mkdirSync(to, { recursive: true });

// The runtime needs the ESM entry, its chunks, and the two big binaries.
// The bundled contrib extensions (~10MB of tarballs) are not used here.
const wanted = readdirSync(from).filter(f =>
  (f.endsWith('.js') && !f.endsWith('.map')) || f === 'pglite.wasm' || f === 'pglite.data' || f === 'initdb.wasm');

for (const f of wanted) cpSync(join(from, f), join(to, f));

// The two big files are also stored gzipped (10.1 + 6.3 MB become 3.4 + 1.9):
// the demo fetches these and unpacks them in the browser (DecompressionStream),
// so a first visit downloads a third as much even from a host that does not
// compress, and counts real bytes for its progress (lib/db/client.ts).
for (const f of ['pglite.wasm', 'pglite.data']) {
  writeFileSync(join(to, f + '.gz'), gzipSync(readFileSync(join(from, f)), { level: constants.Z_BEST_COMPRESSION }));
}
console.log(`copied ${wanted.length} pglite files to public/pglite, and gzipped the engine`);
