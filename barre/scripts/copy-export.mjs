/* Publishes the static export into the repository root so GitHub Pages serves
   it alongside the existing site. Pages deploys from a branch here, so the
   built output is committed rather than produced by a workflow. */
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'out');
const to = join(root, '..', 'studio');

if (!existsSync(from)) {
  console.error('No out/ directory — run `next build` first.');
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
// Pages would otherwise run Jekyll over it and drop _next/.
writeFileSync(join(to, '.nojekyll'), '');
console.log(`published to ${to}`);
