import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);

describe('safeguarding concerns (R-033)', () => {
  it('a teacher raises one; only the owner and the lead read it; every read is logged', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      const [{ id }] = await q(`select app.raise_concern($1, 'wellbeing', 'Seemed very withdrawn and said she is not eating', true) id`, [kid.id]);
      expect(await expectRejected(() => q(`select * from app.safeguarding_log($1)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      await expectRejected(() => q(`select 1 from safeguarding_concern`));   // no direct access at all
      const told = await svc(`select user_id, title from notification where kind = 'safeguarding'`);
      expect(told.map((n: any) => n.user_id)).toContain(USERS.owner);
      expect(told[0].title).toMatch(/URGENT/);
      expect(told.some((n: any) => /withdrawn/.test(n.title))).toBe(false);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(`select * from app.safeguarding_log($1)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      // The owner names Nadia as lead; now she can read and act.
      await as(svc, USERS.owner);
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);
      await as(svc, USERS.admin);
      const log = await q(`select * from app.safeguarding_log($1)`, [STUDIO_ID]);
      expect(log[0]).toMatchObject({ id, immediate_risk: true, status: 'open' });
      await q(`select app.safeguarding_act($1, 'Spoke with mum; referred to school nurse', 'referred')`, [id]);
      expect((await q(`select * from app.safeguarding_actions($1)`, [id]))[0].status_to).toBe('referred');
      await as(svc, USERS.owner);
      const access = await q(`select * from app.safeguarding_access_log($1)`, [STUDIO_ID]);
      expect(access.map((a: any) => a.what)).toEqual(expect.arrayContaining(['viewed the log', 'opened a concern', 'recorded an action']));
    });
  });
  it('a parent cannot raise or read', async () => {
    await asUser(USERS.guardianA, async q => {
      const [kid] = await q(`select id from student limit 1`);
      expect(await expectRejected(() => q(`select app.raise_concern($1, 'other', 'Something long enough here')`, [kid.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('staff checks (R-035)', () => {
  it('owner only, and the owner hears once, 30 days before expiry', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [st] = await q(`select id from staff_member where user_id = $1`, [USERS.teacherTap]);
      await q(`insert into staff_check (staff_id, kind, reference, checked_on, expires_on) values ($1, 'dbs', '001234567890', current_date - 1000, current_date + 20)`, [st.id]);
      await q(`insert into staff_check (staff_id, kind, checked_on, expires_on) values ($1, 'first_aid', current_date - 10, current_date + 900)`, [st.id]);
      await as(svc, USERS.admin);
      expect(await q(`select 1 from staff_check`)).toHaveLength(0);
      expect((await q(`select app.remind_staff_checks($1) n`, [STUDIO_ID]))[0].n).toBe(1);
      expect((await q(`select app.remind_staff_checks($1) n`, [STUDIO_ID]))[0].n).toBe(0);
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'staff_check_due' and title like '%DBS%'`, [USERS.owner])).toHaveLength(1);
    });
  });
});

describe('leaver retention (R-041)', () => {
  it('previews, then deletes medical records and anonymises long-gone leavers, audited', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select s.id from student s join medical_record m on m.student_id = s.id limit 1`);
      await svc(`update enrolment set status = 'left', ended_on = current_date - 800 where student_id = $1`, [kid.id]);
      await svc(`update waitlist_entry set status = 'withdrawn' where student_id = $1`, [kid.id]);
      await svc(`update trial set status = 'cancelled' where student_id = $1`, [kid.id]);
      const preview = await q(`select * from app.apply_retention($1, false) where student_id = $2`, [STUDIO_ID, kid.id]);
      expect(preview.map((p: any) => p.step)).toEqual(['medical']);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid.id])).toHaveLength(1);
      await q(`update retention_policy set personal_months = 24`);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid.id])).toHaveLength(0);
      expect((await svc(`select first_name from student where id = $1`, [kid.id]))[0].first_name).toBe('Former');
      expect((await svc(`select count(*)::int n from audit_log where action = 'retention'`))[0].n).toBeGreaterThanOrEqual(2);
    });
    await asUser(USERS.admin, async q => {
      expect(await expectRejected(() => q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
    });
  });
});
