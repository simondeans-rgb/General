/* The design-system lint (round 2, U9 / F7). Stops the drift the brand
   panel measured: colours outside the tokens, px font sizes, hand-rolled tab
   lists and Notice words outside the agreed list. Run by the test suite
   (tests/design-system.test.ts) and on its own: `node scripts/design-lint.mjs`.

   Each rule says why it exists; see docs/brand/DESIGN-SYSTEM.md §11. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Files allowed to spell a colour, and why. Everything else uses a token. */
export const HEX_ALLOWED = {
  'src/app/globals.css': 'the tokens themselves',
  'src/app/design/page.tsx': 'sample school colours for the document previews',
  'src/components/app/brand-settings.tsx': 'an example hex code in the help text',
  'src/components/app/pwa.tsx': 'draws the home-screen icon on a canvas',
  'src/components/app/safeguarding.tsx': 'a standalone printable export opened in its own window',
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(p);
  }
  return out;
}

/** The allow-list, read from the source of truth (components/ui). */
export function noticeWords(root = ROOT) {
  const src = readFileSync(join(root, 'src/components/ui/index.tsx'), 'utf8');
  const m = src.match(/export const NOTICE_WORDS = \[([\s\S]*?)\] as const/);
  if (!m) throw new Error('NOTICE_WORDS not found in src/components/ui/index.tsx');
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
export const isAllowedWord = (w, words) => words.includes(w) || /^Due \S/.test(w);

/** The `word` attribute of every <Notice …> tag, as the string literals in it. */
function noticeWordLiterals(src) {
  const found = [];
  for (const m of src.matchAll(/<Notice\b/g)) {
    const rest = src.slice(m.index, m.index + 2000);
    const w = rest.match(/\sword=("([^"]*)"|\{)/);
    if (!w) continue;
    if (w[2] !== undefined) { found.push({ at: m.index, word: w[2] }); continue; }
    // An expression: take the balanced braces, then every quoted string inside.
    let i = rest.indexOf(w[0]) + w[0].length, depth = 1, expr = '';
    while (i < rest.length && depth) { const c = rest[i++]; if (c === '{') depth++; else if (c === '}') depth--; if (depth) expr += c; }
    for (const s of expr.matchAll(/'([^']*)'|"([^"]*)"|`([^`$]*)`/g)) {
      const word = s[1] ?? s[2] ?? s[3];
      // Comparisons inside the expression ("result === 'held'") are not words.
      const before = expr.slice(Math.max(0, s.index - 5), s.index);
      if (!/[=!]==?\s*$/.test(before)) found.push({ at: m.index, word });
    }
  }
  return found;
}

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

export function lint(root = ROOT) {
  const words = noticeWords(root);
  const problems = [];
  const files = [...walk(join(root, 'src/app')), ...walk(join(root, 'src/components'))];
  for (const file of files) {
    const rel = relative(root, file).split('\\').join('/');
    const src = readFileSync(file, 'utf8');
    const add = (index, rule, detail) => problems.push({ file: rel, line: lineOf(src, index), rule, detail });

    // 1. Colours come from tokens (globals.css), so school colours and the dark style work.
    if (!(rel in HEX_ALLOWED)) {
      for (const m of src.matchAll(/(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g)) {
        add(m.index, 'hex-colour', `${m[0]}: use a colour token (text-ink, bg-surface, var(--color-…))`);
      }
    }
    // 2. Text sizes are rem, so they follow the reader's text size (UR-30).
    for (const m of src.matchAll(/\btext-\[\d+(?:\.\d+)?px\]/g)) add(m.index, 'px-font', `${m[0]}: use rem`);
    if (rel.endsWith('.css')) {
      for (const m of src.matchAll(/font-size:\s*\d+(?:\.\d+)?px/g)) add(m.index, 'px-font', `${m[0]}: use rem`);
    }
    // 3. One tab component: ViewTabs/FilterTabs in components/ui.
    if (!rel.startsWith('src/components/ui/')) {
      for (const m of src.matchAll(/role=["']tablist["']/g)) add(m.index, 'tablist', 'use ViewTabs or FilterTabs from components/ui');
    }
    // 4. Notices only for changes and deadlines, from the agreed list.
    if (rel.endsWith('.tsx')) {
      for (const { at, word } of noticeWordLiterals(src)) {
        if (!isAllowedWord(word, words)) add(at, 'notice-word', `"${word}" is not a Notice word (${words.join(', ')}, Due {date}); confirmations are a StatusLine`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = lint();
  for (const p of problems) console.log(`${p.file}:${p.line}  ${p.rule}  ${p.detail}`);
  console.log(problems.length ? `\n${problems.length} design-system problem(s).` : 'Design system: no problems.');
  process.exit(problems.length ? 1 : 0);
}
