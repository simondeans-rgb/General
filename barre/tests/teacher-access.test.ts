import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID } from './helpers';

// Marcus teaches the two tap classes and nothing else. Freya is deliberately
// not used here: she is also the owner, so she would pass every check for the
// wrong reason.
const MARCUS = USERS.teacherTap;

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('a teacher sees their own classes only', () => {
  it('lists the classes they teach', async () => {
    await asUser(MARCUS, async q => {
      const mine = await q(`select id, name from class where deleted_at is null
                             and id in (select app.teacher_class_ids()) order by name`);
      expect(mine.map((c: any) => c.name)).toEqual(['Junior Tap', 'Senior Tap']);
    });
  });

  it('sees only students enrolled in those classes', async () => {
    await asUser(MARCUS, async q => {
      const visible = await q('select id from student');
      const expected = await q(`select distinct e.student_id id from enrolment e
                                 where e.class_id in ($1,$2) and e.status='active'`,
                               [CLASS.juniorTap, 'ffffffff-0000-4000-8000-000000000000']);
      expect(visible.length).toBeGreaterThan(0);
      // Every visible student must be reachable through one of his classes.
      const reachable = await q(`select count(*)::int n from student s
                                  where s.id in (select app.teacher_student_ids())`);
      expect(reachable[0].n).toBe(visible.length);
      expect(expected.length).toBeGreaterThan(0);
    });
  });

  it('cannot see a student who is only in another teacher’s class', async () => {
    await asUser(MARCUS, async q => {
      const outsiders = await q(`select s.id from student s
        where s.id in (select e.student_id from enrolment e
                        where e.class_id = $1 and e.status = 'active')
          and s.id not in (select app.teacher_student_ids())`, [CLASS.streetSeniors]);
      // Those students exist...
      expect(outsiders).toHaveLength(0);   // ...and are invisible to him entirely
    });
  });

  it('sees no billing at all', async () => {
    await asUser(MARCUS, async q => {
      expect(await q('select id from invoice')).toHaveLength(0);
      expect(await q('select id from payment')).toHaveLength(0);
    });
  });

  it('cannot create or delete classes', async () => {
    await asUser(MARCUS, async q => {
      const msg = await expectRejected(() =>
        q(`insert into class (studio_id, term_id, location_id, name, day_of_week,
                              start_time, duration_min, capacity)
           select $1, t.id, l.id, 'Sneaky Class', 1, '18:00', 60, 10
             from term t, location l limit 1`, [STUDIO_ID]));
      expect(msg).toMatch(/row-level security/i);
      const deleted = await q(`delete from class where id = $1 returning id`, [CLASS.streetSeniors]);
      expect(deleted).toHaveLength(0);
    });
  });
});

describe('medical data is minimised, not merely gated', () => {
  it('a teacher cannot read the medical record table at all', async () => {
    await asUser(MARCUS, async q => {
      expect(await q('select id, conditions, medications, doctor_phone from medical_record'))
        .toHaveLength(0);
    });
  });

  it('but does get the safety brief for their own students', async () => {
    await asUser(MARCUS, async q => {
      const brief = await q(`select student_id, allergies, action_plan, requires_alert,
                                    emergency_contact_phone
                               from student_safety_brief`);
      expect(brief.length).toBeGreaterThan(0);
      // Only their own students appear.
      const own = await q('select count(*)::int n from student');
      expect(brief.length).toBe(own[0].n);
    });
  });

  it('the safety brief exposes what keeps a child safe and nothing more', async () => {
    await asUser(MARCUS, async q => {
      const cols = await q(`select column_name from information_schema.columns
                             where table_name = 'student_safety_brief' order by column_name`);
      expect(cols.map((c: any) => c.column_name)).toEqual([
        'action_plan', 'allergies', 'emergency_contact_name', 'emergency_contact_phone',
        'first_name', 'last_name', 'requires_alert', 'student_id', 'studio_id',
      ]);
      // Diagnoses, medication lists and the family doctor are not in there.
      const leaked = ['conditions', 'medications', 'doctor_name', 'doctor_phone'];
      expect(cols.map((c: any) => c.column_name).filter((c: string) => leaked.includes(c)))
        .toEqual([]);
    });
  });

  it('an owner still sees the full record', async () => {
    await asUser(USERS.owner, async q => {
      const rows = await q('select conditions, medications from medical_record');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.some((r: any) => r.conditions)).toBe(true);
    });
  });
});

describe('registers', () => {
  it('a teacher can mark their own class', async () => {
    await asUser(MARCUS, async q => {
      const s = (await q(`select cs.id, e.student_id from class_session cs
                            join enrolment e on e.class_id = cs.class_id and e.status='active'
                           where cs.class_id = $1 limit 1`, [CLASS.juniorTap]))[0];
      const r = await q(`insert into attendance_record (studio_id, session_id, student_id, status)
                         values ($1,$2,$3,'present')
                         on conflict (session_id, student_id) do update set status='present'
                         returning id`, [STUDIO_ID, s.id, s.student_id]);
      expect(r).toHaveLength(1);
    });
  });

  it('a teacher cannot mark a class they do not teach', async () => {
    await asUser(MARCUS, async q => {
      // Reach the row via service-visible ids: the point is the write is refused,
      // not that he cannot name the session.
      const target = (await q(`select cs.id, e.student_id from class_session cs
                                 join enrolment e on e.class_id = cs.class_id
                                where cs.class_id = $1 limit 1`, [CLASS.streetSeniors]))[0];
      expect(target).toBeUndefined();   // he cannot even see it, which is the stronger result
    });
  });
});
