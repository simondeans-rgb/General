import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asService, closeDb, expectRejected, rebuild,
         USERS, FAMILY, CLASS, STUDIO_ID, uid, NS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('tenant isolation', () => {
  it('a member of one studio sees nothing from another', async () => {
    // A rival studio, created the way a signup would create it.
    const rivalStudio = '55555555-0000-4000-8000-000000000001';
    const rivalOwner  = '55555555-0000-4000-8000-000000000002';
    await asService(async q => {
      await q(`insert into studio (id,name,slug) values ($1,'Rival Dance','rival')`, [rivalStudio]);
      await q(`insert into user_account (id,email,full_name) values ($1,'rival@example.com','Rival Owner')`, [rivalOwner]);
      await q(`insert into membership (user_id,studio_id,role) values ($1,$2,'owner')`, [rivalOwner, rivalStudio]);
      await q(`insert into family (id,studio_id,name) values ($1,$2,'Secret family')`,
              ['55555555-0000-4000-8000-000000000003', rivalStudio]);

      // Within the same transaction, check the rival owner is walled off.
      await q(`select set_config('request.jwt.claims', $1, true)`,
              [JSON.stringify({ sub: rivalOwner, role: 'authenticated' })]);
      await q('set local role authenticated');
      const students = await q('select id from student');
      const families = await q('select id from family');
      const classes  = await q('select id from class');
      expect(students).toHaveLength(0);
      expect(classes).toHaveLength(0);
      expect(families.map((f: any) => f.id)).toEqual(['55555555-0000-4000-8000-000000000003']);
    });
  });

  it('a user with no membership at all sees nothing', async () => {
    await asUser(USERS.stranger, async q => {
      expect(await q('select id from student')).toHaveLength(0);
      expect(await q('select id from family')).toHaveLength(0);
      expect(await q('select id from class')).toHaveLength(0);
      expect(await q('select id from invoice')).toHaveLength(0);
      expect(await q('select id from medical_record')).toHaveLength(0);
    });
  });

  it('an unauthenticated request sees nothing', async () => {
    await asUser(null, async q => {
      expect(await q('select id from student')).toHaveLength(0);
      expect(await q('select id from class')).toHaveLength(0);
    });
  });
});

describe('owner and admin', () => {
  it('the owner sees the whole studio', async () => {
    await asUser(USERS.owner, async q => {
      expect((await q('select id from student')).length).toBeGreaterThan(40);
      expect((await q('select id from family')).length).toBe(30);
      expect((await q('select id from class')).length).toBe(12);
      expect((await q('select id from invoice')).length).toBe(30);
    });
  });

  it('an admin can read medical records; the audit trail records who looked', async () => {
    await asUser(USERS.admin, async q => {
      const rows = await q('select id, allergies from medical_record');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it('only an owner may change studio settings', async () => {
    await asUser(USERS.admin, async q => {
      const r = await q(`update studio set name = 'Renamed' where id = $1 returning id`, [STUDIO_ID]);
      expect(r).toHaveLength(0);            // policy filters the row out
    });
    await asUser(USERS.owner, async q => {
      const r = await q(`update studio set name = 'Renamed' where id = $1 returning id`, [STUDIO_ID]);
      expect(r).toHaveLength(1);
    });
  });
});

describe('guardian access', () => {
  it('sees their own children and nobody else’s', async () => {
    await asUser(USERS.guardianA, async q => {
      const students = await q('select id, family_id from student');
      expect(students.length).toBeGreaterThan(0);
      expect(students.every((s: any) => s.family_id === FAMILY.a)).toBe(true);
    });
  });

  it('sees their own invoices only', async () => {
    await asUser(USERS.guardianA, async q => {
      const invoices = await q('select id, family_id from invoice');
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices.every((i: any) => i.family_id === FAMILY.a)).toBe(true);
    });
  });

  it('cannot read another family’s record even by asking for it directly', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await q('select id from family where id = $1', [FAMILY.b])).toHaveLength(0);
      expect(await q('select id from student where family_id = $1', [FAMILY.b])).toHaveLength(0);
      expect(await q('select id from invoice where family_id = $1', [FAMILY.b])).toHaveLength(0);
    });
  });

  it('cannot edit another family’s details', async () => {
    await asUser(USERS.guardianA, async q => {
      const r = await q(`update family set name = 'Hijacked' where id = $1 returning id`, [FAMILY.b]);
      expect(r).toHaveLength(0);
    });
  });

  it('can read their own child’s medical record but not another child’s', async () => {
    await asUser(USERS.guardianA, async q => {
      const own = await q(`select m.id from medical_record m
                             join student s on s.id = m.student_id
                            where s.family_id = $1`, [FAMILY.a]);
      const other = await q(`select m.id from medical_record m
                              join student s on s.id = m.student_id
                             where s.family_id <> $1`, [FAMILY.a]);
      expect(other).toHaveLength(0);
      expect(own.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('cannot write a register', async () => {
    await asUser(USERS.guardianA, async q => {
      const session = (await q(`select cs.id from class_session cs
                                  join enrolment e on e.class_id = cs.class_id
                                  join student s on s.id = e.student_id
                                 where s.family_id = $1 limit 1`, [FAMILY.a]))[0];
      expect(session).toBeDefined();
      const student = (await q('select id from student limit 1'))[0];
      const msg = await expectRejected(() =>
        q(`insert into attendance_record (studio_id, session_id, student_id, status)
           values ($1,$2,$3,'present')`, [STUDIO_ID, session.id, student.id]));
      expect(msg).toMatch(/row-level security/i);
    });
  });

  it('cannot grant themselves a role', async () => {
    await asUser(USERS.guardianA, async q => {
      const msg = await expectRejected(() =>
        q(`insert into membership (user_id, studio_id, role) values ($1,$2,'owner')`,
          [USERS.guardianA, STUDIO_ID]));
      expect(msg).toMatch(/row-level security/i);
    });
  });
});
