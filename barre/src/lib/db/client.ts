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

/** Progress reporting, so a first load can say what it is doing. */
export type BootPhase = 'starting' | 'schema' | 'seeding' | 'ready';
let onPhase: (p: BootPhase) => void = () => {};
export function onBootPhase(fn: (p: BootPhase) => void) { onPhase = fn; }

export function getDb(): Promise<PGlite> {
  ready ??= boot();
  return ready;
}

async function boot(): Promise<PGlite> {
  onPhase('starting');
  // Loaded from a URL, not an import specifier: the bundler's minifier breaks
  // the Emscripten glue inside this package. webpackIgnore keeps it out of the
  // graph in dev, and the template literal keeps Turbopack from resolving it.
  const mod = await import(/* webpackIgnore: true */ /* @vite-ignore */ `${PGLITE_URL}`);
  const PG = (mod as { PGlite: typeof PGlite }).PGlite;
  const db = await PG.create(STORAGE);

  const want = fingerprint();
  let have: string | null = null;
  try {
    const r = await db.query<{ value: string }>(`select value from app_meta where key = 'build'`);
    have = r.rows[0]?.value ?? null;
  } catch { /* first run: the table does not exist yet */ }

  if (have !== want) {
    onPhase('schema');
    await install(db, want);
  }
  onPhase('ready');
  return db;
}

async function install(db: PGlite, version: string): Promise<void> {
  // Only a first visit (or a new version) needs the schema and the sample
  // school, so they are fetched here rather than shipped with every page.
  const [{ migrations }, { buildSeedSql }] = await Promise.all([import('./migrations/generated'), import('./seed/data')]);
  // reset role first: a previous attempt may have left the session as
  // service_role. Recreating `public` also drops its default grants, which is
  // what "permission denied for schema public" was — the node reset path had
  // this line and the browser path did not.
  await db.exec(`reset role;
                 drop schema if exists public cascade;
                 drop schema if exists app cascade;
                 drop schema if exists auth cascade;
                 create schema public;
                 grant all on schema public to public;`);
  for (const m of migrations) {
    try { await db.exec(m.sql); }
    catch (e) { throw new Error(`${m.name}: ${(e as Error).message}`); }
  }
  onPhase('seeding');
  await db.exec('set role service_role');
  await db.exec(buildSeedSql({}));
  await db.exec(`create table if not exists app_meta (key text primary key, value text not null);`);
  await db.query(`insert into app_meta (key, value) values ('build', $1)
                  on conflict (key) do update set value = excluded.value`, [version]);
  await db.exec('reset role');
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

async function runAsNow<T>(db: PGlite, session: Session, fn: (q: Query) => Promise<T>): Promise<T> {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(session ? { sub: session.userId, role: 'authenticated', ...(session.studio ? { studio: session.studio } : {}) } : { role: 'anon' }),
    ]);
    await db.exec('set local role authenticated');
    const q: Query = async <T,>(sql: string, params?: unknown[]) =>
      (await db.query<T>(sql, params as any[])).rows;
    const result = await fn(q);
    await db.exec('commit');
    return result;
  } catch (err) {
    await db.exec('rollback');
    throw err;
  }
}

/** Reads: one statement in a READ ONLY transaction, then rolled back.
 *
 *  Read-only is not just tidiness. Two kinds of access exist only inside a
 *  read-only transaction (migration 0019): Sanaa support viewing a school,
 *  and the members of a suspended school. Postgres refuses any write in such a
 *  transaction, so neither has a path to change anything. */
export async function readAs<T = Row>(session: Session, sql: string, params?: unknown[]): Promise<T[]> {
  const db = await getDb();
  return exclusive(() => readAsNow<T>(db, session, sql, params));
}

async function readAsNow<T>(db: PGlite, session: Session, sql: string, params?: unknown[]): Promise<T[]> {
  await db.exec('begin transaction read only');
  try {
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(session ? { sub: session.userId, role: 'authenticated', ...(session.studio ? { studio: session.studio } : {}) } : { role: 'anon' }),
    ]);
    await db.exec('set local role authenticated');
    return (await db.query<T>(sql, params as any[])).rows;
  } finally {
    await db.exec('rollback');
  }
}
