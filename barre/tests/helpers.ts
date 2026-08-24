import { Client } from 'pg';
import { migrations } from '../src/lib/db/migrations/generated';
import { buildSeedSql, uid, NS, STUDIO_ID } from '../src/lib/db/seed/data';

export { uid, NS, STUDIO_ID };

/** People in the seeded studio, by the role they hold. */
export const USERS = {
  owner:    uid(NS.user, 1),   // Freya Lindqvist
  admin:    uid(NS.user, 5),   // Nadia Okafor
  teacherBallet: uid(NS.user, 1), // Freya also teaches
  teacherTap:    uid(NS.user, 2), // Marcus Bell
  teacherModern: uid(NS.user, 3), // Priya Raman
  teacherStreet: uid(NS.user, 4), // Tomasz Wójcik
  guardianA: uid(NS.user, 11), // Hannah Wright   -> family 1
  guardianB: uid(NS.user, 12), // Joseph Adeyemi  -> family 2
  guardianC: uid(NS.user, 13), // Clare Doherty   -> family 3
  stranger:  '99999999-0000-4000-8000-000000000999',
} as const;

export const FAMILY = { a: uid(NS.family, 1), b: uid(NS.family, 2), c: uid(NS.family, 3) };
export const CLASS  = {
  preSchoolBallet: uid(NS.class, 1),
  grade3Ballet:    uid(NS.class, 4),
  juniorTap:       uid(NS.class, 5),
  streetSeniors:   uid(NS.class, 10),
};

let client: Client | null = null;

export async function db(): Promise<Client> {
  if (client) return client;
  client = new Client({
    connectionString: process.env.DATABASE_URL
      ?? 'postgresql://postgres@localhost:5433/barre_test',
  });
  await client.connect();
  return client;
}

export async function rebuild(): Promise<void> {
  const c = await db();
  await c.query(`
    drop schema if exists public cascade;
    drop schema if exists app cascade;
    drop schema if exists auth cascade;
    create schema public; grant all on schema public to public;`);
  for (const m of migrations) {
    try { await c.query(m.sql); }
    catch (e) { throw new Error(`${m.name}: ${(e as Error).message}`); }
  }
  await c.query('set role service_role');
  await c.query(buildSeedSql({}));
  await c.query('reset role');
}

export async function closeDb(): Promise<void> {
  if (client) { await client.end(); client = null; }
}

/**
 * Run a callback as a given user, exactly as the application does: claims set
 * for the transaction, role dropped to `authenticated`, everything rolled back
 * afterwards so tests cannot contaminate one another.
 */
export type Q = (sql: string, params?: unknown[]) => Promise<any[]>;

export async function asUser<T>(
  userId: string | null,
  /** `q` runs as the user; `svc` runs the same transaction with RLS bypassed,
   *  for arranging a fixture the user is not allowed to see. Nesting asService
   *  inside asUser cannot work — both would begin and roll back the same
   *  connection, leaving no transaction for the savepoints to sit in. */
  fn: (q: Q, svc: Q) => Promise<T>,
): Promise<T> {
  const c = await db();
  await c.query('begin');
  try {
    await c.query(`select set_config('request.jwt.claims', $1, true)`,
      [JSON.stringify(userId ? { sub: userId, role: 'authenticated' } : { role: 'anon' })]);
    await c.query('set local role authenticated');
    return await fn(savepointed(c), elevated(c));
  } finally {
    await c.query('rollback');
  }
}

/** Runs a statement as service_role inside the caller's transaction. */
function elevated(c: Client): Q {
  let n = 0;
  return async (sql, params) => {
    const sp = `el_${++n}`;
    await c.query(`savepoint ${sp}`);
    try {
      await c.query('set local role service_role');
      const r = await c.query(sql, params);
      return r.rows;
    } catch (err) {
      await c.query(`rollback to savepoint ${sp}`);
      throw err;
    } finally {
      await c.query('set local role authenticated');
    }
  };
}

/**
 * Every query runs inside its own savepoint. A statement refused by RLS
 * otherwise aborts the surrounding transaction, and the next assertion in the
 * test fails for a reason that has nothing to do with what it is testing.
 */
function savepointed(c: Client) {
  let n = 0;
  return async (sql: string, params?: unknown[]): Promise<any[]> => {
    const sp = `sp_${++n}`;
    await c.query(`savepoint ${sp}`);
    try {
      const r = await c.query(sql, params);
      await c.query(`release savepoint ${sp}`);
      return r.rows;
    } catch (err) {
      await c.query(`rollback to savepoint ${sp}`);
      throw err;
    }
  };
}

/** Run privileged setup (a second studio, say) the way a server job would. */
export async function asService<T>(fn: (q: (sql: string, p?: unknown[]) => Promise<any[]>) => Promise<T>): Promise<T> {
  const c = await db();
  await c.query('begin');
  try {
    await c.query('set local role service_role');
    return await fn(savepointed(c));
  } finally {
    await c.query('rollback');
  }
}

/** Assert a query is rejected by the database rather than silently allowed. */
export async function expectRejected(fn: () => Promise<unknown>): Promise<string> {
  try { await fn(); }
  catch (e) { return (e as Error).message; }
  throw new Error('expected the database to reject this, but it succeeded');
}
