import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, CLASS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const nextTerm = async (q: any) => (await q(`insert into term (studio_id, name, starts_on, ends_on, status)
  values ($1, 'Spring Term', '2027-01-25', '2027-04-02', 'draft') returning id`, [STUDIO_ID]))[0].id;

describe('duplicating classes and rolling a term over (R-008)', () => {
  it('duplicates one class in its own term, with sessions, and nobody enrolled', async () => {
    await asUser(USERS.owner, async q => {
      const [{ r }] = await q(`select app.copy_classes(array[$1]::uuid[], (select term_id from class where id = $1), true) r`, [CLASS.juniorTap]);
      expect(r).toMatchObject({ classes: 1, enrolled: 0 });
      expect(r.sessions).toBeGreaterThan(5);
      const [copy] = await q(`select id, name from class where copied_from = $1`, [CLASS.juniorTap]);
      expect(copy.name).toBe('Junior Tap (copy)');
    });
  });

  it('carries every class and its students into next term, skipping breaks, and only once', async () => {
    await asUser(USERS.owner, async q => {
      const t = await nextTerm(q);
      await q(`insert into term_break (studio_id, term_id, name, starts_on, ends_on) values ($1, $2, 'Half term', '2027-02-15', '2027-02-19')`, [STUDIO_ID, t]);
      const ids = (await q(`select id from class where term_id <> $1`, [t])).map((r: any) => r.id);
      const active = (await q(`select count(*)::int n from enrolment where status = 'active' and class_id = any($1::uuid[])`, [ids]))[0].n;
      const [{ r }] = await q(`select app.copy_classes($1::uuid[], $2, true) r`, [ids, t]);
      expect(r.classes).toBe(ids.length);
      expect(r.enrolled + r.not_fitted.length).toBe(active);
      expect(await q(`select 1 from class_session cs join class c on c.id = cs.class_id
                       where c.term_id = $1 and cs.starts_at::date between '2027-02-15' and '2027-02-19'`, [t])).toHaveLength(0);
      const [{ r: again }] = await q(`select app.copy_classes($1::uuid[], $2, true) r`, [ids, t]);
      expect(again).toMatchObject({ classes: 0, enrolled: 0, skipped: ids.length });
    });
  });

  it('never overfills: a class shrunk below its roll reports who did not fit', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await nextTerm(q);
      const [{ n }] = await q(`select count(*)::int n from enrolment where class_id = $1 and status = 'active'`, [CLASS.grade3Ballet]);
      await svc(`update class set capacity = $2 where id = $1`, [CLASS.grade3Ballet, n - 2]);
      const [{ r }] = await q(`select app.copy_classes(array[$1]::uuid[], $2, true) r`, [CLASS.grade3Ballet, t]);
      expect(r.enrolled).toBe(n - 2);
      expect(r.not_fitted).toHaveLength(2);
    });
  });

  it('only the office can copy classes', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(`select app.copy_classes(array[$1]::uuid[], (select term_id from class where id = $1))`, [CLASS.juniorTap])))
        .toMatch(/FORBIDDEN|permission/);
    });
  });
});
