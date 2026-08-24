/* Local Postgres helpers. Used by the reset/seed scripts and the test suite. */
import { Client } from 'pg';
import { migrations } from '../src/lib/db/migrations/generated.js';
import { buildSeedSql } from '../src/lib/db/seed/data.js';

export const CONNECTION =
  process.env.DATABASE_URL ?? 'postgresql://postgres@localhost:5433/barre_dev';

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: CONNECTION });
  await client.connect();
  return client;
}

export async function resetSchema(client: Client): Promise<void> {
  await client.query(`
    drop schema if exists public cascade;
    drop schema if exists app cascade;
    drop schema if exists auth cascade;
    create schema public;
    grant all on schema public to public;
  `);
  for (const m of migrations) {
    try {
      await client.query(m.sql);
    } catch (err) {
      throw new Error(`migration ${m.name} failed: ${(err as Error).message}`);
    }
  }
}

export async function seed(client: Client, today?: Date): Promise<void> {
  // Seeding writes across every tenant table, so it runs with RLS bypassed —
  // the same privilege a migration or a trusted server job would use, and one
  // that no client-side code ever holds.
  await client.query('set role service_role');
  await client.query(buildSeedSql({ today }));
  await client.query('reset role');
}
