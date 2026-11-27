import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY } from './helpers';
import * as F from '../src/lib/repos/family';

beforeAll(rebuild);
afterAll(closeDb);

const childOf = async (svc: any, family: string) =>
  (await svc(`select id, first_name, last_name, date_of_birth from student where family_id = $1 and not is_adult and deleted_at is null order by date_of_birth limit 1`, [family]))[0];

describe('parents keep their child’s everyday details current (0056)', () => {
  it('a parent changes the name they go by, pronouns and school; the office is told', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await childOf(svc, FAMILY.a);
      await q(F.UPDATE_CHILD_DETAILS, [kid.id, ' Nia-Rose ', 'she/her', 'Greenwich Primary']);
      const [s] = await svc(`select preferred_name, pronouns, school, first_name, last_name, date_of_birth from student where id = $1`, [kid.id]);
      expect(s).toMatchObject({ preferred_name: 'Nia-Rose', pronouns: 'she/her', school: 'Greenwich Primary',
                                first_name: kid.first_name, last_name: kid.last_name });
      const [n] = await svc(`select title, body from notification where title = $1 order by created_at desc limit 1`, [`Details updated for ${kid.first_name}`]);
      expect(n.body).toMatch(/name they go by.*pronouns.*school/);
      // The page shows them back to the parent.
      const mine = await q(F.MY_CHILDREN);
      expect(mine.find((c: any) => c.id === kid.id)).toMatchObject({ preferred_name: 'Nia-Rose' });
    });
  });

  it('nothing changes and nobody is told when nothing was edited', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await childOf(svc, FAMILY.a);
      const [s] = await svc(`select preferred_name, pronouns, school from student where id = $1`, [kid.id]);
      const before = (await svc(`select count(*)::int n from notification`))[0].n;
      await q(F.UPDATE_CHILD_DETAILS, [kid.id, s.preferred_name ?? '', s.pronouns ?? '', s.school ?? '']);
      expect((await svc(`select count(*)::int n from notification`))[0].n).toBe(before);
    });
  });

  it('only their own children, and not teachers', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const other = await childOf(svc, FAMILY.b);
      expect(await expectRejected(() => q(F.UPDATE_CHILD_DETAILS, [other.id, 'X', '', '']))).toMatch(/FORBIDDEN/);
    });
    await asUser(USERS.teacherTap, async (q, svc) => {
      const kid = await childOf(svc, FAMILY.a);
      expect(await expectRejected(() => q(F.UPDATE_CHILD_DETAILS, [kid.id, 'X', '', '']))).toMatch(/FORBIDDEN/);
    });
  });

  it('refuses overlong values', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await childOf(svc, FAMILY.a);
      expect(await expectRejected(() => q(F.UPDATE_CHILD_DETAILS, [kid.id, 'x'.repeat(61), '', '']))).toMatch(/INVALID/);
    });
  });
});
