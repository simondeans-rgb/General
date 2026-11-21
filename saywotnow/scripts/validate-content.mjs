// Validates the content files before a release (spec Section 12):
//   1. each file against its JSON Schema in content/schema/
//   2. cross-references the schema can't express (ids exist, rules point at real fields, etc.)
//   3. the service worker's offline file list matches the files on disk
// Usage: node scripts/validate-content.mjs   Exits with code 1 on any problem.
// No dependencies: includes a small JSON Schema validator covering the keywords the schemas use.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { referencedFields } from '../src/lib/rules.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const fail = (file, path, msg) => problems.push(`${file}${path ? ` at ${path}` : ''}: ${msg}`);

/* ---------- Minimal JSON Schema (draft 2020-12 subset) ---------- */

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}

function check(schema, value, path, file, defs) {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    return check(defs[name], value, path, file, defs);
  }
  const t = typeOf(value);
  if (schema.type) {
    const ok = schema.type === t || (schema.type === 'number' && t === 'integer');
    if (!ok) return fail(file, path, `expected ${schema.type}, found ${t}`);
  }
  if (schema.enum && !schema.enum.includes(value)) return fail(file, path, `must be one of ${JSON.stringify(schema.enum)}, found ${JSON.stringify(value)}`);
  if (t === 'string') {
    if (schema.minLength && value.trim().length < schema.minLength) fail(file, path, 'must not be empty');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(file, path, `"${value}" doesn't match ${schema.pattern}`);
  }
  if (t === 'integer' || t === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) fail(file, path, `must be at least ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(file, path, `must be at most ${schema.maximum}`);
  }
  if (t === 'array') {
    if (schema.minItems && value.length < schema.minItems) fail(file, path, `needs at least ${schema.minItems} item(s)`);
    if (schema.maxItems && value.length > schema.maxItems) fail(file, path, `can have at most ${schema.maxItems} item(s)`);
    if (schema.items) value.forEach((v, i) => check(schema.items, v, `${path}[${i}]`, file, defs));
  }
  if (t === 'object') {
    for (const k of schema.required || []) if (!(k in value)) fail(file, path || '(top)', `missing "${k}"`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties && k in schema.properties) check(schema.properties[k], v, `${path}.${k}`, file, defs);
      else if (schema.additionalProperties === false) fail(file, path || '(top)', `unknown property "${k}" (check the spelling)`);
      else if (typeof schema.additionalProperties === 'object') check(schema.additionalProperties, v, `${path}.${k}`, file, defs);
    }
  }
}

/* ---------- Load and schema-check ---------- */

const NAMES = ['home', 'templates', 'guides', 'reactions', 'tools', 'pages', 'timezones', 'currencies', 'prep'];
const content = {};
for (const name of NAMES) {
  const file = `content/${name}.json`;
  let data;
  try { data = JSON.parse(readFileSync(join(root, file), 'utf8')); } catch (e) { fail(file, '', `isn't valid JSON (${e.message})`); continue; }
  const schema = JSON.parse(readFileSync(join(root, `content/schema/${name}.schema.json`), 'utf8'));
  check(schema, data, '', file, schema.$defs || {});
  content[name] = data;
}

/* ---------- Cross-reference checks ---------- */

function unique(file, list, what) {
  const seen = new Set();
  for (const id of list) { if (seen.has(id)) fail(file, '', `duplicate ${what} "${id}"`); seen.add(id); }
}

if (content.templates) {
  const f = 'content/templates.json';
  const T = content.templates;
  const scales = T.ratingScales || {};
  const headerIds = T.header.fields.map((x) => x.id);
  unique(f, T.templates.map((t) => t.id), 'template id');
  for (const t of T.templates) {
    const ids = [...headerIds];
    const fieldById = {};
    for (const s of t.sections) for (const fl of s.fields) { ids.push(fl.id); fieldById[fl.id] = fl; }
    unique(f, ids, `field id in ${t.id}`);
    unique(f, t.sections.map((s) => s.id), `section id in ${t.id}`);
    const known = new Set(ids);
    const where = (x) => `${t.id}.${x}`;
    const checkCond = (cond, at) => { for (const r of referencedFields(cond)) if (!known.has(r)) fail(f, where(at), `rule refers to unknown field "${r}"`); };
    for (const s of t.sections) {
      checkCond(s.showIf, s.id);
      for (const fl of s.fields) {
        checkCond(fl.showIf, fl.id); checkCond(fl.requiredIf, fl.id);
        if (fl.min && !known.has(fl.min.field)) fail(f, where(fl.id), `min refers to unknown field "${fl.min.field}"`);
        if (['singleChoice', 'multiChoice', 'checklist'].includes(fl.type) && !(fl.options && fl.options.length)) fail(f, where(fl.id), 'needs options');
        if (fl.type === 'rating' && !scales[fl.scale]) fail(f, where(fl.id), `unknown rating scale "${fl.scale}"`);
        if (fl.type === 'repeater' && !(fl.fields && fl.fields.length)) fail(f, where(fl.id), 'repeater needs sub-fields');
        if (fl.required && fl.showIf) fail(f, where(fl.id), 'a field with showIf should use requiredIf, not required');
      }
    }
    for (const fl of t.flags || []) checkCond(fl.when, 'flags');
    for (const r of t.sendRules || []) checkCond(r.when, 'sendRules');
    for (const m of t.subject.matchAll(/\{(\w+)\}/g)) {
      if (!['employeeName', 'meetingDate', 'firstName', 'topicLower', 'templateName'].includes(m[1]) && !known.has(m[1])) fail(f, where('subject'), `unknown placeholder {${m[1]}}`);
    }
    if (t.pair) for (const p of Object.values(t.pair)) if (!T.templates.some((x) => x.id === p)) fail(f, where('pair'), `unknown template "${p}"`);
  }
  if (!T.templates.some((t) => t.id === 'T08')) fail(f, '', 'T08 (Conversation Summary) is required by the guides');
}

if (content.guides) {
  const f = 'content/guides.json';
  unique(f, content.guides.guides.map((g) => g.id), 'guide id');
}
if (content.timezones) {
  const f = 'content/timezones.json';
  const valid = (tz) => { try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return true; } catch { return false; } };
  content.timezones.places.forEach((p, i) => { if (!valid(p.tz)) fail(f, `.places[${i}]`, `"${p.tz}" isn't a time zone this device knows`); });
  for (const tz of content.timezones.defaults) {
    if (!valid(tz)) fail(f, '.defaults', `"${tz}" isn't a valid time zone`);
    else if (!content.timezones.places.some((p) => p.tz === tz)) fail(f, '.defaults', `"${tz}" needs a matching entry in places`);
  }
  unique(f, content.timezones.places.map((p) => `${p.city}|${p.tz}`), 'place');
}
if (content.currencies && content.timezones) {
  const f = 'content/currencies.json';
  const C = content.currencies;
  if (C.bundledRates.rates.USD !== 1) fail(f, '.bundledRates', 'USD must be 1 (rates are per US dollar)');
  for (const [country, code] of Object.entries(C.countryCurrency)) {
    if (!(code in C.bundledRates.rates)) fail(f, `.countryCurrency.${country}`, `no bundled rate for ${code}`);
  }
  for (const k of C.defaults) {
    const [city, country] = k.split('|');
    if (!content.timezones.places.some((p) => p.city === city && p.country === country)) fail(f, '.defaults', `"${k}" isn't a place in timezones.json`);
    else if (!C.countryCurrency[country]) fail(f, '.defaults', `no currency for ${country}`);
  }
  const index = readFileSync(join(root, 'index.html'), 'utf8');
  if (!index.includes(new URL(C.source.endpoint).origin)) fail('index.html', '', `the Content Security Policy must allow ${new URL(C.source.endpoint).origin}`);
  const lib = readFileSync(join(root, 'src/lib/calc/currency.js'), 'utf8');
  if (!lib.includes(C.source.endpoint)) fail('src/lib/calc/currency.js', '', 'RATES_URL must match source.endpoint in currencies.json');
}
if (content.prep && content.templates && content.guides) {
  const f = 'content/prep.json';
  unique(f, content.prep.cards.map((p) => p.id), 'prep card id');
  const targets = content.prep.cards.map((p) => `${p.target.type}:${p.target.id || ''}`);
  unique(f, targets, 'prep target');
  for (const p of content.prep.cards) {
    const { type, id } = p.target;
    if (type === 'oneToOne' && id) fail(f, p.id, 'a oneToOne target has no id');
    if (type === 'template' && !content.templates.templates.some((t) => t.id === id)) fail(f, p.id, `unknown template "${id}"`);
    if (type === 'template' && content.templates.templates.find((t) => t.id === id)?.pair) fail(f, p.id, `${id} is part of the 1:1 pair: use a oneToOne target`);
    if (type === 'guide' && !content.guides.guides.some((g) => g.id === id)) fail(f, p.id, `unknown guide "${id}"`);
  }
  for (const g of content.guides.guides) if (!targets.includes(`guide:${g.id}`)) fail(f, '', `no prep card for ${g.id}`);
}
if (content.reactions) unique('content/reactions.json', content.reactions.reactions.map((r) => r.id), 'reaction id');
if (content.tools) unique('content/tools.json', content.tools.tools.map((t) => t.id), 'tool id');

if (content.home && content.templates && content.guides && content.tools) {
  const f = 'content/home.json';
  const screens = ['conversations', 'meetings', 'toolkit', 'reactions', 'settings', 'search', 'prep'];
  for (const tile of content.home.tiles) {
    const { type, id } = tile.target;
    const ok = type === 'oneToOne'
      || (type === 'template' && content.templates.templates.some((t) => t.id === id))
      || (type === 'guide' && content.guides.guides.some((g) => g.id === id))
      || (type === 'tool' && content.tools.tools.some((t) => t.id === id))
      || (type === 'screen' && screens.includes(id));
    if (!ok) fail(f, tile.id, `tile points at unknown ${type} "${id}"`);
  }
  const icons = readFileSync(join(root, 'src/ui/icons.js'), 'utf8');
  for (const name of [...content.home.tiles.map((t) => t.icon), ...content.tools.tools.map((t) => t.icon)]) {
    if (!new RegExp(`^\\s+${name}: '`, 'm').test(icons)) fail('content', '', `icon "${name}" doesn't exist in src/ui/icons.js`);
  }
}

/* ---------- Offline file list ---------- */

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [relative(root, p).split('\\').join('/')];
  });
}
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const listed = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]).filter((p) => p !== './');
for (const p of listed) if (!existsSync(join(root, p))) fail('sw.js', '', `lists "${p}", which doesn't exist`);
const needed = [
  'index.html', 'manifest.webmanifest',
  ...walk(join(root, 'src')).filter((p) => p.endsWith('.js')),
  ...walk(join(root, 'content')).filter((p) => p.endsWith('.json') && !p.includes('/schema/')),
  ...walk(join(root, 'assets')).filter((p) => /\.(css|woff2|png|svg)$/.test(p)),
];
for (const p of needed) if (!listed.includes(p)) fail('sw.js', '', `"${p}" isn't in the offline file list`);

/* ---------- Result ---------- */

if (problems.length) {
  console.error(`Content check failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):`);
  for (const p of problems) console.error(`  • ${p}`);
  process.exit(1);
}
const counts = content.templates ? `${content.templates.templates.length} templates, ${content.guides.guides.length} guides, ${content.reactions.reactions.length} reactions, ${content.tools.tools.length} tools` : '';
console.log(`Content OK: ${counts}. Offline list covers ${listed.length} files.`);
