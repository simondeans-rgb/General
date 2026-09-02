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
import { migrations } from './migrations/generated';
import { buildSeedSql } from './seed/data';

/** Where the prebuilt PGlite runtime is served from (see scripts/copy-pglite.mjs). */
const PGLITE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/pglite/index.js`;

export type Row = Record<string, unknown>;
export type Query = <T = Row>(sql: string, params?: unknown[]) => Promise<T[]>;

export type Session = { userId: string; role: string } | null;

const STORAGE = 'idb://barre-demo-v1';

/**
 * The demo database is persisted in the browser, so a returning visitor keeps
 * whatever they did last time — which is the point. It also means a schema or
 * seed change would otherwise leave them on a stale copy for ever, with new
 * screens querying tables that do not exist there yet.
 *
 * The fingerprint below changes whenever a migration or the seed changes, and
 * a mismatch rebuilds from scratch. Cheap, and it fails safe.
 */
const SEED_VERSION = 5;

function fingerprint(): string {
  let h = 5381;
  for (const m of migrations) {
    for (let i = 0; i < m.sql.length; i++) h = ((h * 33) ^ m.sql.charCodeAt(i)) >>> 0;
  }
  return `${h.toString(36)}.${SEED_VERSION}`;
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

/** Wipe and rebuild — the demo's "start again" button. */
export async function resetDemo(): Promise<void> {
  const db = await getDb();
  await install(db, fingerprint());
}

/**
 * Run work as a given user. Claims and role are set for the transaction only,
 * exactly as Supabase does per request, so nothing leaks between callers.
 */
export async function runAs<T>(session: Session, fn: (q: Query) => Promise<T>): Promise<T> {
  const db = await getDb();
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(session ? { sub: session.userId, role: 'authenticated' } : { role: 'anon' }),
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

/** Read-only convenience: one statement, rolled back so nothing can persist. */
export async function readAs<T = Row>(session: Session, sql: string, params?: unknown[]): Promise<T[]> {
  const db = await getDb();
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(session ? { sub: session.userId, role: 'authenticated' } : { role: 'anon' }),
    ]);
    await db.exec('set local role authenticated');
    return (await db.query<T>(sql, params as any[])).rows;
  } finally {
    await db.exec('rollback');
  }
}
