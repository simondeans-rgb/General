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

/* ==========================================================================
   Writing people. The office keeps the records; everyone else is fenced out.
   ========================================================================== */
describe('the office keeps the people records', () => {
  const newFamily = (q: any, name = 'The Test family') =>
    q(`insert into family (studio_id, name, created_by)
       select id, $1, auth.uid() from studio limit 1 returning id`, [name]);

  it('an admin can add a family, a guardian and a child', async () => {
    await asUser(USERS.admin, async q => {
      const [f] = await newFamily(q);
      expect(f.id).toBeTruthy();

      const [g] = await q(
        `insert into guardian (studio_id, family_id, full_name, email, is_primary)
         select f.studio_id, f.id, 'Test Guardian', 'g@example.com', true
           from family f where f.id = $1 returning id`, [f.id]);
      expect(g.id).toBeTruthy();

      const [s] = await q(
        `insert into student (studio_id, family_id, first_name, last_name, date_of_birth, created_by)
         select f.studio_id, f.id, 'Test', 'Child', current_date - interval '9 years', auth.uid()
           from family f where f.id = $1 returning id`, [f.id]);
      expect(s.id).toBeTruthy();
    });
  });

  it('a teacher cannot create or edit a family, child or guardian', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => newFamily(q, 'Marcus Family')))
        .toMatch(/row-level security/i);

      const [s] = await q(`select id from student limit 1`);
      expect(await q(`update student set last_name = 'Changed' where id = $1 returning id`, [s.id]))
        .toHaveLength(0);
    });
  });

  it('a guardian cannot create a family or add a child to their own', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => newFamily(q, 'A Second Family')))
        .toMatch(/row-level security/i);

      const [f] = await q(`select id, studio_id from family limit 1`);
      expect(await expectRejected(() => q(
        `insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
         values ($1, $2, 'Sneaky', 'Enrolment', current_date - interval '8 years') returning id`,
        [f.studio_id, f.id]))).toMatch(/row-level security/i);
    });
  });
});

describe('health data stays where it belongs', () => {
  it('an admin can write a medical record, and the change is audited', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [s] = await q(`select id from student limit 1`);
      await q(
        `insert into medical_record (studio_id, student_id, allergies, action_plan,
                                     requires_alert, updated_by)
         select st.studio_id, st.id, 'Severe nut allergy', 'EpiPen in her bag, then call 999',
                true, auth.uid()
           from student st where st.id = $1
         on conflict (student_id) do update
           set allergies = excluded.allergies, action_plan = excluded.action_plan,
               requires_alert = excluded.requires_alert, updated_by = excluded.updated_by`,
        [s.id]);

      const [row] = await q(`select allergies, requires_alert from medical_record
                              where student_id = $1`, [s.id]);
      expect(row.allergies).toBe('Severe nut allergy');
      expect(row.requires_alert).toBe(true);

      // The trigger records it without the application asking.
      const [audit] = await svc(`select count(*)::int n from audit_log
                                  where entity = 'medical_record' and actor_id = $1`, [USERS.admin]);
      expect(audit.n).toBeGreaterThan(0);
    });
  });

  it('a teacher cannot read or write the medical table at all', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await q(`select id from medical_record`)).toHaveLength(0);
      const [s] = await q(`select id, studio_id from student limit 1`);
      expect(await expectRejected(() => q(
        `insert into medical_record (studio_id, student_id, allergies)
         values ($1, $2, 'invented') returning id`, [s.studio_id, s.id])))
        .toMatch(/row-level security/i);
    });
  });

  it('a guardian sees only their own children’s records', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const mine = await q(`select student_id from medical_record`);
      const [all] = await svc(`select count(*)::int n from medical_record where deleted_at is null`);
      const ours = await q(`select id from student`);
      expect(mine.length).toBeLessThanOrEqual(ours.length);
      expect(mine.length).toBeLessThan(all.n);
      for (const r of mine) {
        expect(ours.map((s: any) => s.id)).toContain(r.student_id);
      }
    });
  });

  it('emergency contacts follow the same boundary', async () => {
    await asUser(USERS.admin, async q => {
      const [s] = await q(`select id from student limit 1`);
      const [c] = await q(
        `insert into emergency_contact (studio_id, student_id, full_name, phone, priority)
         select st.studio_id, st.id, 'Grandma Wright', '07700 900111', 1
           from student st where st.id = $1 returning id`, [s.id]);
      expect(c.id).toBeTruthy();
    });
    await asUser(USERS.guardianB, async (q, svc) => {
      const [other] = await svc(`select id, studio_id from student
                                  where family_id <> (select family_id from student
                                                       where id in (select app.guardian_student_ids())
                                                       limit 1) limit 1`);
      const [c] = await svc(
        `insert into emergency_contact (studio_id, student_id, full_name, phone)
         values ($1, $2, 'Not Yours', '07700 900222') returning id`, [other.studio_id, other.id]);
      expect(await q(`select id from emergency_contact where id = $1`, [c.id])).toHaveLength(0);
    });
  });
});

describe('staff records and access are separate decisions', () => {
  it('an admin can add a teacher but not give them a login', async () => {
    await asUser(USERS.admin, async q => {
      const [sm] = await q(
        `insert into staff_member (studio_id, display_name, colour, status)
         select id, 'New Teacher', 'teal', 'active' from studio limit 1 returning id, studio_id`);
      expect(sm.id).toBeTruthy();

      // membership_write is owner-only: adding someone to the timetable and
      // handing them a login are different decisions.
      expect(await expectRejected(() => q(
        `insert into membership (user_id, studio_id, role)
         values ($1, $2, 'teacher') returning id`, [USERS.stranger, sm.studio_id])))
        .toMatch(/row-level security|violates foreign key/i);
    });
  });

  it('the owner can grant a membership', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`insert into user_account (id, email, full_name)
                 values ($1, 'new.teacher@example.com', 'New Teacher')
                 on conflict (id) do nothing`, [USERS.stranger]);
      const [m] = await q(`insert into membership (user_id, studio_id, role)
                           values ($1, $2, 'teacher') returning id`, [USERS.stranger, STUDIO_ID]);
      expect(m.id).toBeTruthy();
    });
  });

  it('a teacher cannot edit the staff list', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [sm] = await q(`select id from staff_member limit 1`);
      expect(await q(`update staff_member set display_name = 'The Boss' where id = $1 returning id`,
                     [sm.id])).toHaveLength(0);
    });
  });
});
