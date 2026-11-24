import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, STUDIO_ID } from './helpers';
import { OTHER_STUDIOS } from '../src/lib/db/seed/data';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });
const pickSchool = (svc: any, user: string, studio: string | null) =>
  svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated', ...(studio ? { studio } : {}) })]);

describe('one login, two schools (R-031)', () => {
  it('lists both schools for the switcher', async () => {
    await asUser(USERS.teacherModern, async q => {
      const schools = await q(`select studio_id, name, roles from app.my_schools()`);
      expect(schools.map((s: any) => s.studio_id).sort()).toEqual([STUDIO_ID, OTHER_STUDIOS.kestrel].sort());
    });
  });
  it('with a school chosen, nothing from the other appears', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      const all = await q(`select distinct studio_id from class where id in (select app.teacher_class_ids())`);
      expect(all).toHaveLength(2);                                   // without a choice, both
      await pickSchool(svc, USERS.teacherModern, OTHER_STUDIOS.kestrel);
      const k = await q(`select distinct studio_id from class`);
      expect(k.map((r: any) => r.studio_id)).toEqual([OTHER_STUDIOS.kestrel]);
      await pickSchool(svc, USERS.teacherModern, STUDIO_ID);
      expect((await q(`select distinct studio_id from class`)).map((r: any) => r.studio_id)).toEqual([STUDIO_ID]);
    });
  });
  it('choosing a school you do not belong to shows nothing, never more', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await pickSchool(svc, USERS.guardianA, OTHER_STUDIOS.kestrel);
      expect(await q(`select 1 from student`)).toHaveLength(0);
      expect(await q(`select 1 from family`)).toHaveLength(0);
    });
  });
});
