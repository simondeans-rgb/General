/* The in-browser demo's own database paths (src/lib/db/client.ts), run in
   Node against PGlite exactly as the browser runs them: the first build (one
   PGlite transaction(), committing after each migration, so that PGlite does
   not copy the database to storage ~70 times), and reads and writes inside
   transaction(). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { forTests } from '../src/lib/db/client';
import { USERS } from './helpers';

let db: PGlite;
const owner = { userId: USERS.owner, role: 'owner' };
const teacher = { userId: USERS.teacherTap, role: 'teacher' };
const stranger = { userId: USERS.stranger, role: 'guardian' };

beforeAll(async () => {
  db = await PGlite.create();
  await forTests.install(db, 'test-build');
}, 120_000);
afterAll(async () => { await db?.close(); });

describe('the demo database in the browser engine', () => {
  it('builds every migration and the sample school, and records the build', async () => {
    expect((await db.query<{ value: string }>(`select value from app_meta where key = 'build'`)).rows[0]?.value).toBe('test-build');
    expect((await db.query<{ n: number }>(`select count(*)::int as n from app.policy_rewrite`)).rows[0]!.n).toBeGreaterThan(100);
    expect((await db.query<{ n: number }>(`select count(*)::int as n from student`)).rows[0]!.n).toBeGreaterThan(50);
    // The build leaves the session as it found it.
    expect((await db.query<{ u: string }>(`select current_user as u`)).rows[0]!.u).toBe('postgres');
  });

  it('reads as the person, read-only, and leave nothing behind', async () => {
    const mine = await forTests.readAsNow<{ n: number }>(db, owner, `select count(*)::int as n from attendance_record`);
    expect(mine[0]!.n).toBeGreaterThan(100);
    const none = await forTests.readAsNow<{ n: number }>(db, stranger, `select count(*)::int as n from attendance_record`);
    expect(none[0]!.n).toBe(0);
    const theirs = await forTests.readAsNow<{ n: number }>(db, teacher, `select count(*)::int as n from student`);
    expect(theirs[0]!.n).toBeGreaterThan(0);
    expect(theirs[0]!.n).toBeLessThan(mine[0]!.n);
    await expect(forTests.readAsNow(db, owner, `update studio set name = name`)).rejects.toThrow(/read-only/);
    expect((await db.query<{ u: string }>(`select current_user as u`)).rows[0]!.u).toBe('postgres');
    expect(db.isInTransaction()).toBe(false);
  });

  it('writes as the person and commits; a refused write changes nothing', async () => {
    const [before] = (await db.query<{ name: string }>(`select name from location order by name limit 1`)).rows;
    await forTests.runAsNow(db, owner, async q => {
      await q(`update location set name = name || ' (test)' where name = $1`, [before!.name]);
    });
    expect((await db.query(`select 1 from location where name = $1`, [before!.name + ' (test)'])).rows).toHaveLength(1);
    await expect(forTests.runAsNow(db, stranger, async q => {
      await q(`update location set name = 'x'`);
      throw new Error('stop');
    })).rejects.toThrow('stop');
    expect((await db.query(`select 1 from location where name = 'x'`)).rows).toHaveLength(0);
    expect(db.isInTransaction()).toBe(false);
  });
});
