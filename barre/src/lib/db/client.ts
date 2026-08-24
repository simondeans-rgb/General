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

export type Row = Record<string, unknown>;
export type Query = <T = Row>(sql: string, params?: unknown[]) => Promise<T[]>;

export type Session = { userId: string; role: string } | null;

const STORAGE = 'idb://barre-demo-v1';

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
  const { PGlite: PG } = await import('@electric-sql/pglite');
  const db = await PG.create(STORAGE);

  const installed = await db.query<{ n: number }>(
    `select count(*)::int n from information_schema.tables
      where table_schema = 'public' and table_name = 'studio'`);

  if (!installed.rows[0]?.n) {
    onPhase('schema');
    for (const m of migrations) {
      try { await db.exec(m.sql); }
      catch (e) { throw new Error(`${m.name}: ${(e as Error).message}`); }
    }
    onPhase('seeding');
    await db.exec('set role service_role');
    await db.exec(buildSeedSql({}));
    await db.exec('reset role');
  }
  onPhase('ready');
  return db;
}

/** Wipe and rebuild — the demo's "start again" button. */
export async function resetDemo(): Promise<void> {
  const db = await getDb();
  await db.exec(`drop schema if exists public cascade;
                 drop schema if exists app cascade;
                 drop schema if exists auth cascade;
                 create schema public;`);
  for (const m of migrations) await db.exec(m.sql);
  await db.exec('set role service_role');
  await db.exec(buildSeedSql({}));
  await db.exec('reset role');
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
