/**
 * The data layer.
 *
 * Two runtimes, one codebase. Queries are plain SQL executed through an
 * adapter, and every query runs inside a transaction that sets the caller's
 * claims and drops to the `authenticated` role — which is what makes row level
 * security do the work in both runtimes:
 *
 *   browser demo  PGlite (Postgres compiled to WASM), persisted to IndexedDB
 *   server        node-postgres against Postgres or Supabase
 *
 * The demo is therefore not a mock. It runs the same migrations and the same
 * policies, so a guardian genuinely cannot read another family's records —
 * the database refuses, not the interface.
 */
import type { PGlite } from '@electric-sql/pglite';
import { SCHEMA_HASH } from './migrations/fingerprint';

/** Where the prebuilt PGlite runtime is served from (see scripts/copy-pglite.mjs). */
const PGLITE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/pglite/index.js`;

export type Row = Record<string, unknown>;
export type Query = <T = Row>(sql: string, params?: unknown[]) => Promise<T[]>;

export type Session = { userId: string; role: string; studio?: string } | null;

// The live demo and the preview share one web address, so each keeps its own
// database; otherwise a preview with a newer schema would wipe the live one.
const SITE = process.env.NEXT_PUBLIC_SITE_KEY ?? '';
const STORAGE = `idb://barre-demo-v1${SITE ? '-' + SITE : ''}`;

/**
 * The demo database is persisted in the browser, so a returning visitor keeps
 * whatever they did last time — which is the point. It also means a schema or
 * seed change would otherwise leave them on a stale copy for ever, with new
 * screens querying tables that do not exist there yet.
 *
 * The fingerprint below changes whenever a migration or the seed changes, and
 * a mismatch rebuilds from scratch. Cheap, and it fails safe.
 */
const SEED_VERSION = 7;

function fingerprint(): string {
  return `${SCHEMA_HASH}.${SEED_VERSION}`;
}

let ready: Promise<PGlite> | null = null;

/**
 * Progress reporting, so a first load can say honestly what it is doing and
 * roughly how long is left.
 *
 *   downloading  the database engine (~16 MB): bytes counted as they arrive
 *   starting     opening the engine, and the database saved in this browser
 *   schema       creating the tables and rules: one step per migration
 *   seeding      adding the sample school (one statement; time estimated)
 *   ready
 *
 * A returning visitor skips schema and seeding: the database is kept in this
 * browser (IndexedDB) and only rebuilt when the app's schema or seed changes.
 */
export type BootPhase = 'downloading' | 'starting' | 'schema' | 'seeding' | 'ready';
export type BootProgress = {
  phase: BootPhase;
  /** True when the database is being built here for the first time (or rebuilt). */
  building: boolean;
  /** Bytes of the engine downloaded so far, and in all (0 when not known). */
  loaded: number; total: number;
  /** Migrations done / in all, while creating the schema. */
  step: number; steps: number;
  /** Seconds left, roughly, or null when there is nothing honest to say. */
  secondsLeft: number | null;
};
type ProgressFn = (p: BootProgress) => void;
let listeners: ProgressFn[] = [];
let progress: BootProgress = { phase: 'downloading', building: false, loaded: 0, total: 0, step: 0, steps: 0, secondsLeft: null };
/** Subscribe to boot progress; returns an unsubscribe. Called at once with the current state. */
export function onBootProgress(fn: ProgressFn): () => void {
  listeners.push(fn); fn(progress);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
/** Kept for callers that only want the phase. */
export function onBootPhase(fn: (p: BootPhase) => void) { return onBootProgress(p => fn(p.phase)); }
function report(p: Partial<BootProgress>) {
  progress = { ...progress, ...p };
  for (const l of listeners) l(progress);
}

/** Timings of the last boot (ms since navigation start), for diagnosing a slow
 *  first load from devtools or a test browser: globalThis.__barreBoot. */
const marks: Record<string, number> = {};
function mark(name: string) {
  marks[name] = Math.round(performance.now());
  (globalThis as { __barreBoot?: Record<string, number> }).__barreBoot = marks;
}

/* Remembered between visits, so the loader knows before the engine starts
   whether this browser already holds the current database. Only a hint: the
   database's own app_meta row is what decides whether to rebuild. */
const BUILT_KEY = `barre.db.built${SITE ? '.' + SITE : ''}`;
function builtHere(): string | null {
  try { return localStorage.getItem(BUILT_KEY); } catch { return null; }
}
function rememberBuilt(v: string) {
  try { localStorage.setItem(BUILT_KEY, v); } catch { /* storage blocked: the loader just knows less */ }
}

/* What public/db-preload.js started: it runs before the app's JavaScript, so
   the engine downloads while the app itself does. Same shape as download(). */
type Download = { loaded: number; total: number; gz: boolean; done: Promise<Blob> };
type Preload = { files: { wasm?: Download; data?: Download } };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Fetch one of the engine's files, counting bytes as they arrive. Where the
 *  browser can unpack gzip itself, the gzipped copy is fetched (a third of the
 *  size; scripts/copy-pglite.mjs makes it). */
function download(url: string): Download {
  const gz = typeof DecompressionStream === 'function';
  const d: Download = { loaded: 0, total: 0, gz, done: null as unknown as Promise<Blob> };
  d.done = fetch(url + (gz ? '.gz' : '')).then(async res => {
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    // A response the server compressed again arrives unpacked, longer than its length.
    d.total = res.headers.get('content-encoding') ? 0 : Number(res.headers.get('content-length')) || 0;
    if (!res.body) return res.blob();
    const reader = res.body.getReader();
    const chunks: BlobPart[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); d.loaded += value.byteLength;
    }
    return new Blob(chunks);
  });
  return d;
}

/** The bytes as the engine needs them: unpacked when they are gzip (checked by
 *  the gzip signature, so a host that unpacked them already is fine too). */
async function unpacked(d: Download): Promise<Blob> {
  const blob = await d.done;
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob;
  return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
}

function engineFiles(): { wasm: Download; data: Download } {
  const pre = (globalThis as { __barreDb?: Preload }).__barreDb?.files ?? {};
  return {
    wasm: pre.wasm ?? download(`${BASE}/pglite/pglite.wasm`),
    data: pre.data ?? download(`${BASE}/pglite/pglite.data`),
  };
}

/* Adding the sample school is one long statement, so its progress cannot be
   watched; it takes about as long as SEED_STEPS migrations do on the same
   device (measured in Chrome, desktop and 4x-throttled phone alike). The
   estimate is therefore built from this device's own speed at the migrations. */
const SEED_STEPS = 40;
const secs = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

export function getDb(): Promise<PGlite> {
  ready ??= boot();
  return ready;
}

async function boot(): Promise<PGlite> {
  mark('boot');
  const want = fingerprint();
  const building = builtHere() !== want;
  report({ phase: building ? 'downloading' : 'starting', building });

  // Everything that does not depend on anything else starts now, together:
  // the engine's files and its JavaScript, and on a first visit the schema and
  // the sample school, which a return visit does not need.
  const files = engineFiles();
  const modP = import(/* webpackIgnore: true */ /* @vite-ignore */ `${PGLITE_URL}`);
  const installP = building ? loadInstall() : null;
  installP?.catch(() => undefined);
  // The engine is compiled as soon as it has arrived, while the rest downloads.
  const wasmP = unpacked(files.wasm).then(async b => WebAssembly.compile(await b.arrayBuffer()));
  const dataP = unpacked(files.data);
  wasmP.catch(() => undefined); dataP.catch(() => undefined);

  // Download progress, with the time left at the speed so far.
  const t0 = performance.now();
  const tick = setInterval(() => {
    const loaded = files.wasm.loaded + files.data.loaded;
    const total = files.wasm.total && files.data.total ? files.wasm.total + files.data.total : 0;
    const rate = loaded / Math.max(1, performance.now() - t0);   // bytes per ms so far
    // The download only: how long setting up takes on this device is not
    // known until it starts, and the loader says so rather than guess.
    report({ loaded, total, secondsLeft: building && total && rate > 0 ? secs((total - loaded) / rate) : null });
  }, 500);
  try {
    await Promise.all([files.wasm.done, files.data.done]);
  } finally { clearInterval(tick); }
  mark('downloaded');

  report({ phase: 'starting', loaded: files.wasm.loaded + files.data.loaded, secondsLeft: null });
  // Loaded from a URL, not an import specifier: the bundler's minifier breaks
  // the Emscripten glue inside this package. webpackIgnore keeps it out of the
  // graph in dev, and the template literal keeps Turbopack from resolving it.
  const [mod, wasmModule, dataBlob] = await Promise.all([modP, wasmP, dataP]);
  mark('compiled');
  const PG = (mod as { PGlite: typeof PGlite }).PGlite;
  const db = await PG.create(STORAGE, { pgliteWasmModule: wasmModule, fsBundle: dataBlob });
  mark('opened');

  let have: string | null = null;
  try {
    const r = await db.query<{ value: string }>(`select value from app_meta where key = 'build'`);
    have = r.rows[0]?.value ?? null;
  } catch { /* first run: the table does not exist yet */ }

  if (have !== want) {
    report({ phase: 'schema', building: true });
    await install(db, want, installP ?? loadInstall());
    mark('installed');
  }
  rememberBuilt(want);
  report({ phase: 'ready', secondsLeft: 0 });
  mark('ready');
  return db;
}

type InstallFiles = [typeof import('./migrations/generated'), typeof import('./seed/data')];
function loadInstall(): Promise<InstallFiles> {
  return Promise.all([import('./migrations/generated'), import('./seed/data')]);
}

async function install(db: PGlite, version: string, files: Promise<InstallFiles> = loadInstall()): Promise<void> {
  // Only a first visit (or a new version) needs the schema and the sample
  // school, so they are fetched here rather than shipped with every page.
  const [{ migrations }, { buildSeedSql }] = await files;
  // One PGlite transaction() around the whole build, committing after each
  // migration ("commit; begin"): every migration still commits on its own (an
  // enum value one adds must be committed before the next can use it), but
  // PGlite does not copy the growing database to IndexedDB after each of the
  // ~70 statements, only once at the end.
  await db.transaction(async tx => {
    // reset role first: a previous attempt may have left the session as
    // service_role. Recreating `public` also drops its default grants, which is
    // what "permission denied for schema public" was — the node reset path had
    // this line and the browser path did not.
    await tx.exec(`reset role;
                   drop schema if exists public cascade;
                   drop schema if exists app cascade;
                   drop schema if exists auth cascade;
                   create schema public;
                   grant all on schema public to public;`);
    await tx.exec('commit; begin');
    const t0 = performance.now();
    report({ phase: 'schema', step: 0, steps: migrations.length });
    for (let i = 0; i < migrations.length; i++) {
      const m = migrations[i]!;
      try { await tx.exec(m.sql); await tx.exec('commit; begin'); }
      catch (e) { throw new Error(`${m.name}: ${(e as Error).message}`); }
      const per = (performance.now() - t0) / (i + 1);
      // After a few steps the speed of this device is known well enough.
      report({ step: i + 1, secondsLeft: i >= 4 ? secs((migrations.length - i - 1 + SEED_STEPS) * per) : null });
    }
    const per = (performance.now() - t0) / Math.max(1, migrations.length);
    report({ phase: 'seeding', secondsLeft: secs(SEED_STEPS * per) });
    mark('schema');
    // The estimate counts down while the one long statement runs.
    const seedStart = performance.now();
    const tick = setInterval(() => report({ secondsLeft: secs(SEED_STEPS * per - (performance.now() - seedStart)) }), 1000);
    try {
      await tx.exec('set role service_role');
      await tx.exec(buildSeedSql({}));
      await tx.exec(`create table if not exists app_meta (key text primary key, value text not null);`);
      await tx.query(`insert into app_meta (key, value) values ('build', $1)
                      on conflict (key) do update set value = excluded.value`, [version]);
      await tx.exec('reset role');
    } finally { clearInterval(tick); }
  });
  mark('seeded');
  await persist(db);
}

/**
 * One connection, one transaction at a time.
 *
 * The browser has a single PGlite connection. Without this, a background read
 * (the notification bell's refresh, say) could BEGIN while a write was in the
 * middle of its transaction — and that read's ROLLBACK would discard the
 * write's claims and role, so the rest of the write ran as nobody and was
 * refused. A server deployment gets this for free from a connection pool.
 */
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  queue = run.catch(() => undefined);
  return run;
}

/** Wipe and rebuild — the demo's "start again" button. */
export async function resetDemo(): Promise<void> {
  const db = await getDb();
  await exclusive(() => install(db, fingerprint()));
}

/**
 * Run work as a given user. Claims and role are set for the transaction only,
 * exactly as Supabase does per request, so nothing leaks between callers.
 */
export async function runAs<T>(session: Session, fn: (q: Query) => Promise<T>): Promise<T> {
  const db = await getDb();
  return exclusive(() => runAsNow(db, session, fn));
}

const claims = (session: Session) => JSON.stringify(session
  ? { sub: session.userId, role: 'authenticated', ...(session.studio ? { studio: session.studio } : {}) }
  : { role: 'anon' });

/* Transactions go through PGlite's own transaction(), not separate BEGIN and
   COMMIT statements. Outside it, PGlite copies the database to IndexedDB after
   every statement, which cost ~5 copies per screen read (begin, claims, role,
   query, rollback), each a walk over ~1,000 files: most of the time a screen
   took to load in the demo. Inside it, the statements run without copying, and
   a write is copied once, after it commits, before runAs returns. */
async function runAsNow<T>(db: PGlite, session: Session, fn: (q: Query) => Promise<T>): Promise<T> {
  const result = await db.transaction(async tx => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [claims(session)]);
    await tx.exec('set local role authenticated');
    const q: Query = async <T,>(sql: string, params?: unknown[]) =>
      (await tx.query<T>(sql, params as any[])).rows;
    return fn(q);
  });
  await persist(db);
  return result;
}

/** Copy what was written to IndexedDB, and wait for it, so a write that has
 *  returned survives the tab closing. */
async function persist(db: PGlite) {
  await (db as unknown as { syncToFs?: () => Promise<void> }).syncToFs?.();
}

/** Opt-in timing log for diagnosing slow screens: set
 *  `globalThis.__barreQueryLog = []` (in devtools, or a test browser) and every
 *  read is appended with its time in the database. Off unless asked for. */
function logQuery(session: Session, sql: string, params: unknown[] | undefined, ms: number, rows: number) {
  const log = (globalThis as { __barreQueryLog?: unknown[] }).__barreQueryLog;
  if (Array.isArray(log)) log.push({ userId: session?.userId ?? null, role: session?.role ?? null, sql, params, ms, rows });
}

/** Reads: one statement in a READ ONLY transaction, then rolled back.
 *
 *  Read-only is not just tidiness. Two kinds of access exist only inside a
 *  read-only transaction (migration 0019): Swayvo support viewing a school,
 *  and the members of a suspended school. Postgres refuses any write in such a
 *  transaction, so neither has a path to change anything. */
export async function readAs<T = Row>(session: Session, sql: string, params?: unknown[]): Promise<T[]> {
  const db = await getDb();
  return exclusive(() => readAsNow<T>(db, session, sql, params));
}

async function readAsNow<T>(db: PGlite, session: Session, sql: string, params?: unknown[]): Promise<T[]> {
  return db.transaction(async tx => {
    await tx.exec('set transaction read only');
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [claims(session)]);
    await tx.exec('set local role authenticated');
    const t0 = performance.now();
    const rows = (await tx.query<T>(sql, params as any[])).rows;
    logQuery(session, sql, params, performance.now() - t0, rows.length);
    await tx.rollback();
    return rows;
  });
}

/** The browser's build, read and write paths against a PGlite you supply:
 *  for tests/demo-db.test.ts, which runs them in Node. */
export const forTests = { install, readAsNow, runAsNow };
