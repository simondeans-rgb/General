/* Migration 0068 rewrote row-level security policies so that "is the caller an
   administrator / staff / <role> of this school" is asked once per query
   rather than once per row. This file proves the rewrite changed nothing
   about who sees what: for every table and every kind of person, the rows
   visible under the rewritten policies are exactly the rows visible under the
   originals, which are put back inside a transaction (from
   app.policy_rewrite) and rolled away afterwards. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';
import { asUser, closeDb, db, rebuild, uid, NS, USERS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const LOC_GREENWICH = uid(NS.location, 1);

type Who = { name: string; user: string | null; limitTo?: string };
export const PEOPLE: Who[] = [
  { name: 'owner', user: USERS.owner },
  { name: 'admin', user: USERS.admin },
  { name: 'location-limited admin', user: USERS.admin, limitTo: LOC_GREENWICH },
  { name: 'teacher', user: USERS.teacherTap },
  { name: 'cover teacher', user: USERS.teacherModern },
  { name: 'guardian', user: USERS.guardianA },
  { name: 'other guardian', user: USERS.guardianB },
  { name: 'student', user: uid(NS.user, 40) },
  { name: 'stranger', user: USERS.stranger },
  { name: 'public', user: null },
];

async function tables(c: Client): Promise<string[]> {
  const r = await c.query(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
                            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity order by 1`);
  return r.rows.map(x => x.relname);
}

async function as(c: Client, who: Who) {
  await c.query(`select set_config('request.jwt.claims', $1, true)`,
    [JSON.stringify(who.user ? { sub: who.user, role: 'authenticated' } : { role: 'anon' })]);
  await c.query(who.user ? 'set local role authenticated' : 'set local role anon');
}

/** Every visible row of every table, fingerprinted, as `who`. */
async function snapshot(c: Client, who: Who, names: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await as(c, who);
  for (const t of names) {
    await c.query('savepoint s');
    try {
      const r = await c.query(`select count(*)::int as n, md5(coalesce(string_agg(x::text, '|' order by x::text), '')) as h from ${t} x`);
      out[t] = `${r.rows[0].n}:${r.rows[0].h}`;
      await c.query('release savepoint s');
    } catch (e) {
      out[t] = 'error: ' + (e as Error).message;
      await c.query('rollback to savepoint s');
    }
  }
  await c.query('reset role');
  return out;
}

async function restoreOriginals(c: Client) {
  const r = await c.query(`select p.*, pp.roles::text[] as roles, pp.permissive, pp.cmd from app.policy_rewrite p
                             join pg_policies pp using (schemaname, tablename, policyname)`);
  for (const p of r.rows) {
    const roles = (p.roles as string[]).map(x => x === 'public' ? 'public' : `"${x}"`).join(', ');
    await c.query(`drop policy "${p.policyname}" on ${p.schemaname}."${p.tablename}"`);
    await c.query(`create policy "${p.policyname}" on ${p.schemaname}."${p.tablename}" as ${p.permissive} for ${p.cmd} to ${roles}`
      + (p.old_qual ? ` using (${p.old_qual})` : '') + (p.old_check ? ` with check (${p.old_check})` : ''));
  }
  return r.rows.length;
}

describe('the once-per-query policies (0068) show everyone exactly what the originals did', () => {
  it('rewrote the per-row checks, and kept every original', async () => {
    const c = await db();
    const r = await c.query(`select count(*)::int as n from app.policy_rewrite`);
    expect(r.rows[0].n).toBeGreaterThan(100);
    const left = await c.query(`select count(*)::int as n from pg_policies where schemaname = 'public'
       and coalesce(qual, '') || coalesce(with_check, '') ~ 'app\\.(is_admin|is_staff|has_role)\\((\\w+\\.)?\\w+[,)]'`);
    expect(left.rows[0].n).toBe(0);
  });

  for (const who of PEOPLE) {
    it(`${who.name}: the same rows in every table`, async () => {
      const c = await db();
      await c.query('begin');
      try {
        if (who.limitTo) {
          await c.query(`insert into membership_location (membership_id, location_id, studio_id)
                         select id, $2, studio_id from membership where user_id = $1 and studio_id = $3 and role = 'admin'`,
            [who.user, who.limitTo, STUDIO_ID]);
        }
        const names = await tables(c);
        const now = await snapshot(c, who, names);
        expect(await restoreOriginals(c)).toBeGreaterThan(100);
        const before = await snapshot(c, who, names);
        const differ = names.filter(t => now[t] !== before[t]).map(t => `${t}: now ${now[t]} / before ${before[t]}`);
        expect(differ).toEqual([]);
        // Sanity: the comparison is not vacuous.
        if (who.name === 'owner') expect(Number(now.attendance_record.split(':')[0])).toBeGreaterThan(100);
        if (who.name === 'public' || who.name === 'stranger') expect(now.attendance_record).toMatch(/^0:|^error: permission denied/);
      } finally {
        await c.query('rollback');
      }
    }, 120_000);
  }
});

/* ── My students and the register: whole-list summaries (0068) ────────────
   The reference queries are the screens' SQL as it was before 0068, which
   asked app.term_attendance_pct / app.collection_brief / app.consent_now /
   app.my_class_names_for once per child. */
import { asReader, commitService } from './helpers';
import * as T from '../src/lib/repos/teaching';

const OLD_BRIEF = `coalesce(b.requires_alert, false) as requires_alert,
       coalesce(b.has_medical_need, false) as has_medical_need,
       b.allergies, b.conditions, b.medications, b.action_plan,
       b.emergency_contact_name, b.emergency_contact_phone,
       coalesce(b.emergency_contacts, '[]'::jsonb) as emergency_contacts, b.photo_consent,
       app.collection_brief(b.student_id) as collection`;
const OLD_MY_STUDENTS = `
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       ${OLD_BRIEF},
       app.my_class_names_for(s.id) as class_names,
       app.term_attendance_pct(s.id) as attendance_pct
  from student s
  left join student_safety_brief b on b.student_id = s.id
 where s.deleted_at is null
 order by s.last_name, s.first_name`;
const OLD_REGISTER = T.REGISTER
  .replace(/^([\s\S]*?\n\))\nselect[\s\S]*$/, (_m, roll) => `${roll}
select roll.id as student_id, roll.first_name, roll.last_name, roll.preferred_name,
       roll.date_of_birth, roll.is_trial,
       ar.status, ar.reason, ar.mark_kind,
       rep.note as reported_note, rep.reporter as reported_by,
       ${OLD_BRIEF},
       app.term_attendance_pct(roll.id) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join absence_report rep on rep.student_id = roll.id and rep.session_id = $1 and rep.status = 'active'
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`);

const sorted = (rows: any[]) => JSON.stringify(rows.map(r => ({ ...r })).sort((a, b) =>
  JSON.stringify(a).localeCompare(JSON.stringify(b))));

describe('My students and the register give the same rows and values as the per-child queries did', () => {
  let session: string;          // one of Marcus's past registers, with marks
  let otherSession: string;     // a register at the other location, not his

  beforeAll(async () => {
    session = (await commitService(`
      select cs.id from class_session cs join class c on c.id = cs.class_id join staff_member sm on sm.id = c.teacher_id
       where sm.user_id = $1 and cs.starts_at < now() and exists (select 1 from attendance_record a where a.session_id = cs.id)
       order by cs.starts_at desc limit 1`, [USERS.teacherTap]))[0].id;
    otherSession = (await commitService(`
      select cs.id from class_session cs join class c on c.id = cs.class_id join staff_member sm on sm.id = c.teacher_id
       where sm.user_id <> $1 and c.studio_id = $2 and c.location_id <> (select location_id from class c2 join class_session s2 on s2.class_id = c2.id where s2.id = $3)
         and cs.starts_at < now() and exists (select 1 from attendance_record a where a.session_id = cs.id)
         and not exists (select 1 from class_session x join staff_member xs on xs.id = x.teacher_id
                          where x.class_id = c.id and xs.user_id = $1)
       order by cs.starts_at desc limit 1`, [USERS.teacherTap, STUDIO_ID, session]))[0].id;
  });

  // The test database is shared by the file: the snapshot tests above roll back.
  const ROLES: Who[] = PEOPLE.filter(p => !p.limitTo);

  /** Collection permissions on two of Marcus's children (one allowed, one
   *  not) and a guardian who may not collect, so the collection column is
   *  exercised for staff (who see refusals) and families (who do not). */
  async function collectionFixture(svc: (sql: string, p?: unknown[]) => Promise<any[]>, who: Who) {
    // Rows are stamped with the person adding them: add them as the owner.
    const claims = (u: string | null) => JSON.stringify(u ? { sub: u, role: 'authenticated' } : { role: 'anon' });
    await svc(`select set_config('request.jwt.claims', $1, true)`, [claims(USERS.owner)]);
    const kids = await svc(`select s.id, s.studio_id, s.family_id from student s
       where s.id in (select e.student_id from enrolment e join class c on c.id = e.class_id
                       join staff_member sm on sm.id = c.teacher_id where sm.user_id = $1 and e.status = 'active')
         and s.family_id = $2 order by s.id limit 1`, [USERS.teacherTap, uid(NS.family, 1)]);
    const other = await svc(`select s.id, s.studio_id from student s
       where s.id in (select e.student_id from enrolment e join class c on c.id = e.class_id
                       join staff_member sm on sm.id = c.teacher_id where sm.user_id = $1 and e.status = 'active')
         and s.family_id <> $2 order by s.id limit 1`, [USERS.teacherTap, uid(NS.family, 1)]);
    for (const k of [...kids, ...other]) {
      await svc(`insert into collection_permission (studio_id, student_id, full_name, relationship, allowed, added_by)
                 values ($1, $2, 'Aunt Rosa', 'aunt', true, $3), ($1, $2, 'Mr Smith', 'neighbour', false, $3)`, [k.studio_id, k.id, USERS.owner]);
    }
    if (kids[0]) await svc(`update guardian_access set may_collect = false where guardian_id =
                              (select id from guardian where family_id = $1 and not is_primary order by id limit 1)`, [kids[0].family_id]);
    await svc(`select set_config('request.jwt.claims', $1, true)`, [claims(who.user)]);
    return kids.length + other.length;
  }

  it('My students: every role, same rows and values (non-trivially)', async () => {
    for (const who of ROLES) {
      const [now, before] = await asUser(who.user, async (q, svc) => {
        expect(await collectionFixture(svc, who)).toBe(2);
        return [await q(T.MY_STUDENTS), await q(OLD_MY_STUDENTS)];
      });
      expect(sorted(now as any[]), who.name).toBe(sorted(before as any[]));
      if (who.name === 'teacher' || who.name === 'guardian') {
        const rows = now as any[];
        expect(rows.length).toBeGreaterThan(who.name === 'teacher' ? 5 : 0);
        expect(rows.some(r => r.attendance_pct !== null)).toBe(true);
        expect(rows.some(r => (r.collection as unknown[]).length > 0)).toBe(true);
        expect(rows.some(r => r.photo_consent !== null)).toBe(true);
        if (who.name === 'teacher') expect(rows.some(r => r.class_names)).toBe(true);
      }
    }
  });

  it('the register: every role, own and other sessions, same rows and values', async () => {
    for (const who of ROLES) for (const s of [session, otherSession]) {
      const [now, before] = await asReader(who.user, async q => [await q(T.REGISTER, [s]), await q(OLD_REGISTER, [s])]);
      expect(sorted(now), `${who.name} ${s}`).toBe(sorted(before));
    }
    const mine = await asReader(USERS.teacherTap, q => q(T.REGISTER, [session]));
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.some(r => r.attendance_pct !== null)).toBe(true);
  });

  it('the list functions tell nobody about a child they cannot see', async () => {
    const all = (await commitService(`select array_agg(id) as ids from student where studio_id = $1`, [STUDIO_ID]))[0].ids as string[];
    const familyA = (await commitService(`select array_agg(id) as ids from student where family_id = $1`, [uid(NS.family, 1)]))[0].ids as string[];
    const fns = (ids: string[]) => [
      ['visible_student_ids', `select * from app.visible_student_ids($1::uuid[])`],
      ['term_attendance_pcts', `select * from app.term_attendance_pcts($1::uuid[])`],
      ['collection_briefs', `select * from app.collection_briefs($1::uuid[]) where brief <> '[]'::jsonb`],
      ['consents_now', `select * from app.consents_now($1::uuid[], 'photography')`],
      ['my_class_names', `select * from app.my_class_names($1::uuid[])`],
    ].map(([n, sql]) => [n, sql, [ids]] as const);

    // Another family's guardian learns nothing about family A's children.
    await asReader(USERS.guardianB, async q => {
      for (const [n, sql, p] of fns(familyA)) expect(await q(sql, p), n).toEqual([]);
    });
    // A stranger, nothing about anyone.
    await asReader(USERS.stranger, async q => {
      for (const [n, sql, p] of fns(all)) expect(await q(sql, p), n).toEqual([]);
    });
    // A teacher hears only about the children in their own classes, exactly
    // the children app.can_see_student allows.
    await asReader(USERS.teacherTap, async q => {
      const allowed = (await q(`select id from unnest($1::uuid[]) id where app.can_see_student(id) order by 1`, [all])).map(r => r.id);
      expect(allowed.length).toBeGreaterThan(0);
      expect(allowed.length).toBeLessThan(all.length);
      const seen = (await q(`select * from app.visible_student_ids($1::uuid[]) id order by 1`, [all])).map(r => r.id);
      expect(seen).toEqual(allowed);
      for (const [n, sql, p] of fns(all)) {
        for (const r of await q(sql, p)) expect(allowed, n).toContain(r.student_id ?? r.id ?? r.visible_student_ids);
      }
    });
    // A location-limited administrator: only children placed at their location.
    await asUser(USERS.admin, async (q, svc) => {
      await svc(`insert into membership_location (membership_id, location_id, studio_id)
                 select id, $2, studio_id from membership where user_id = $1 and studio_id = $3 and role = 'admin'`,
        [USERS.admin, LOC_GREENWICH, STUDIO_ID]);
      const allowed = (await q(`select id from unnest($1::uuid[]) id where app.can_see_student(id) order by 1`, [all])).map(r => r.id);
      const seen = (await q(`select * from app.visible_student_ids($1::uuid[]) id order by 1`, [all])).map(r => r.id);
      expect(seen).toEqual(allowed);
      expect(seen.length).toBeLessThan(all.length);
    });
  });
});
