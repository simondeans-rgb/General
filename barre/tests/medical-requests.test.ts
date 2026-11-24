import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, uid, NS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const REQ = uid(NS.request, 3);   // seeded: Clare Doherty's "New inhaler" update, open

const ack = (q: any, record: unknown = null, message: string | null = null, student: string | null = null) =>
  q(`select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)`,
    [REQ, record === null ? null : JSON.stringify(record), message, student]);

describe('acting on a parent’s medical update', () => {
  it('acknowledging tells the parent and leaves the record alone', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [r] = await svc(`select student_id from studio_request where id = $1`, [REQ]);
      const before = await svc(`select * from medical_record where student_id = $1`, [r.student_id]);
      await ack(q);
      const [after] = await svc(`select status, answer from studio_request where id = $1`, [REQ]);
      expect(after.status).toBe('answered');
      expect(after.answer).toMatch(/received your update about \w+/);
      expect(await svc(`select * from medical_record where student_id = $1`, [r.student_id])).toEqual(before);
      const told = await svc(`select user_id from notification where kind = 'request_answered'`);
      expect(told.length).toBeGreaterThan(0);
    });
  });

  it('acknowledging and recording updates only the fields sent, in the same step', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [r] = await svc(`select student_id from studio_request where id = $1`, [REQ]);
      await svc(`insert into medical_record (studio_id, student_id, allergies, conditions)
                 select studio_id, id, 'Kiwi', 'Asthma' from student where id = $1
                 on conflict (student_id) do update set allergies = 'Kiwi', conditions = 'Asthma'`, [r.student_id]);
      await ack(q, { medications: 'Blue inhaler, front pocket of her bag', action_plan: 'Two puffs, then call home' });
      const [m] = await svc(`select allergies, conditions, medications, action_plan, updated_by
                               from medical_record where student_id = $1`, [r.student_id]);
      expect(m).toEqual({ allergies: 'Kiwi', conditions: 'Asthma',
        medications: 'Blue inhaler, front pocket of her bag', action_plan: 'Two puffs, then call home',
        updated_by: USERS.admin });
      const [req] = await svc(`select status, answer from studio_request where id = $1`, [REQ]);
      expect(req.status).toBe('closed');
      expect(req.answer).toMatch(/updated \w+'s medical record/);
    });
  });

  it('creates the record when the child had none, and the teacher sees it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [r] = await svc(`select student_id from studio_request where id = $1`, [REQ]);
      await svc(`delete from medical_record where student_id = $1`, [r.student_id]);
      await ack(q, { conditions: 'Asthma', medications: 'Blue inhaler' }, 'All updated — thank you!');
      const [b] = await svc(`select has_medical_need, conditions from student_safety_brief where student_id = $1`, [r.student_id]);
      expect(b).toEqual({ has_medical_need: true, conditions: 'Asthma' });
      expect((await svc(`select answer from studio_request where id = $1`, [REQ]))[0].answer).toBe('All updated — thank you!');
    });
  });

  it('cannot be answered twice', async () => {
    await asUser(USERS.admin, async q => {
      await ack(q);
      expect(await expectRejected(() => ack(q))).toMatch(/already been answered/);
    });
  });

  it('only the office can do it', async () => {
    for (const who of [USERS.teacherTap, USERS.guardianA, USERS.guardianC]) {
      await asUser(who, async q => {
        expect(await expectRejected(() => ack(q, { conditions: 'x' }))).toMatch(/FORBIDDEN|NOT_FOUND/);
      });
    }
  });

  it('will not put an update on a child from another family', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await svc(`update studio_request set student_id = null where id = $1`, [REQ]);
      const [other] = await svc(`select s.id from student s where s.family_id <> (select family_id from studio_request where id = $1) limit 1`, [REQ]);
      expect(await expectRejected(() => ack(q, { conditions: 'x' }, null, other.id))).toMatch(/not in this family/);
      expect(await expectRejected(() => ack(q, { conditions: 'x' }))).toMatch(/choose which child/);
    });
  });

  it('the screen’s query lists the family’s children for a request', async () => {
    const H = await import('../src/lib/repos/hub');
    await asUser(USERS.admin, async q => {
      const rows = await q(H.PENDING_REQUESTS);
      const r = rows.find((x: any) => x.id === REQ);
      expect(r.kind).toBe('medical_update');
      expect(r.student_id).toBeTruthy();
      expect(r.children.length).toBeGreaterThan(0);
      expect(r.guardian_name).toBeTruthy();
    });
  });
});
