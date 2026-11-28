import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, CLASS } from './helpers';
import * as E from '../src/lib/repos/events';
import * as Q from '../src/lib/repos/dashboard';

type Run = (sql: string, params?: unknown[]) => Promise<any[]>;
const as = (svc: Run, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

beforeAll(rebuild);
afterAll(closeDb);

// An exam the day after tomorrow, £45 an entry.
async function exam(svc: Run, billOnEntry = false) {
  const [{ id }] = await svc(`insert into exam_session (studio_id, board, title, exam_on, fee_minor, bill_on_entry)
      values ($1, 'ISTD', 'Tap exams', current_date + 2, 4500, $2) returning id`, [STUDIO_ID, billOnEntry]);
  return id as string;
}
// Two Junior Tap children (Marcus teaches them) from different families.
async function tapKids(svc: Run) {
  return (await svc(`select distinct on (s.family_id) s.id, s.family_id from enrolment e join student s on s.id = e.student_id
      where e.class_id = $1 and e.deleted_at is null and e.status = 'active' order by s.family_id, s.id limit 2`, [CLASS.juniorTap]))
    .map((r: any) => ({ id: r.id as string, family: r.family_id as string }));
}
// Pay an entry's invoice in full, as the office would record it.
const pay = async (q: Run, svc: Run, entry: string) => {
  const [i] = await svc(`select i.id, i.family_id, i.total_minor - i.paid_minor owed from invoice i
      where i.id = (select invoice_id from exam_entry where id = $1)`, [entry]);
  await q(`select app.record_payment($1, $2, 'bank_transfer', $3)`, [i.family_id, i.owed, i.id]);
};
const familyNotes = (svc: Run, family: string) => svc(`select n.title, n.body, n.href from notification n
    join guardian g on g.user_id = n.user_id and g.family_id = $1 where n.kind = 'exam_fee_unpaid'`, [family]);
const officeNotes = (svc: Run) => svc(`select distinct n.title, n.body, n.href from notification n join membership m on m.user_id = n.user_id
    where m.studio_id = $1 and m.role in ('owner','admin') and n.kind = 'exam_fee_unpaid'`, [STUDIO_ID]);

describe('exam fees (0072)', () => {
  it('the exam’s price is each entry’s fee; with invoice-on-entry the family is billed when the teacher enters the child', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const x = await exam(svc, true);
      const [kid] = await tapKids(svc);
      const [{ id: entry }] = await q(E.ENTER_EXAM, [x, kid!.id, 'Grade 2', null]);
      const [e] = await svc(`select e.fee_minor, e.invoice_id, i.family_id, i.status, ii.unit_minor, ii.kind
          from exam_entry e join invoice i on i.id = e.invoice_id join invoice_item ii on ii.invoice_id = i.id where e.id = $1`, [entry]);
      expect(e.fee_minor).toBe(4500);
      expect(e.family_id).toBe(kid!.family);
      expect(e.unit_minor).toBe(4500);
      expect(e.kind).toBe('exam_fee');
      expect(e.status).toBe('issued');
    });
  });

  it('without it, nothing is billed until the office bills the fees; a teacher cannot', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const x = await exam(svc, false);
      const [a, b] = await tapKids(svc);
      await q(E.ENTER_EXAM, [x, a!.id, 'Grade 2', null]);
      await q(E.ENTER_EXAM, [x, b!.id, 'Grade 3', 5000]);
      expect(await svc(`select 1 from exam_entry where session_id = $1 and invoice_id is not null`, [x])).toHaveLength(0);
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(E.BILL_EXAM, [x]))).toMatch(/admin|office|FORBIDDEN/i);
      await as(svc, USERS.admin);
      expect((await q(E.BILL_EXAM, [x]))[0].n).toBe(2);
      expect((await q(E.BILL_EXAM, [x]))[0].n).toBe(0);             // once per entry
      // The office can switch invoice-on-entry for an exam; a teacher can't.
      await q(E.SET_EXAM_BILLING, [x, true]);
      expect((await svc(`select bill_on_entry from exam_session where id = $1`, [x]))[0].bill_on_entry).toBe(true);
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(E.SET_EXAM_BILLING, [x, false]))).toBeTruthy();
    });
  });

  it('the exam-day register shows whether each fee is paid, and takes Here / Absent', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const x = await exam(svc, true);
      const [a, b] = await tapKids(svc);
      const [{ id: ea }] = await q(E.ENTER_EXAM, [x, a!.id, 'Grade 2', null]);
      const [{ id: eb }] = await q(E.ENTER_EXAM, [x, b!.id, 'Grade 3', null]);
      await pay(q, svc, ea);
      const [{ id: free }] = await svc(`insert into exam_entry (studio_id, session_id, student_id, grade, fee_minor)
          values ($1, $2, $3, 'Grade 4', 0) returning id`, [STUDIO_ID, x, a!.id]);
      const state = async () => Object.fromEntries((await q(E.EXAM_REGISTER, [x])).map((r: any) => [r.entry_id, r.fee_state]));
      expect(await state()).toEqual({ [ea]: 'paid', [eb]: 'unpaid', [free]: 'none' });
      await svc(`update invoice set status = 'void' where id = (select invoice_id from exam_entry where id = $1)`, [eb]);
      expect((await state())[eb]).toBe('unbilled');

      // The children's teacher sees the same and marks the day; a family sees nothing and cannot mark.
      await as(svc, USERS.teacherTap);
      expect(Object.keys(await state())).toHaveLength(3);
      await q(E.MARK_EXAM_ATTENDANCE, [ea, 'here']);
      await q(E.MARK_EXAM_ATTENDANCE, [eb, 'absent']);
      expect((await q(E.EXAM_REGISTER, [x])).find((r: any) => r.entry_id === ea).attendance).toBe('here');
      expect((await q(E.MY_EXAM_DAYS)).find((d: any) => d.session_id === x)).toMatchObject({ candidates: 3, unpaid: 1 });
      // Another teacher sees only the candidates they teach, and marks only those.
      for (const t of [USERS.teacherStreet, USERS.teacherModern]) {
        await as(svc, t);
        const mine = new Set((await q(`select app.teacher_student_ids() id`)).map((r: any) => r.id));
        const seen = await q(E.EXAM_REGISTER, [x]);
        expect(seen.every((r: any) => mine.has(r.student_id))).toBe(true);
        if (!mine.has(a!.id)) expect(await expectRejected(() => q(E.MARK_EXAM_ATTENDANCE, [ea, 'absent']))).toMatch(/FORBIDDEN/);
      }
      await as(svc, USERS.stranger);
      expect(await q(E.EXAM_REGISTER, [x])).toHaveLength(0);
      expect(await expectRejected(() => q(E.MARK_EXAM_ATTENDANCE, [ea, 'absent']))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.guardianA);
      expect(await q(E.EXAM_REGISTER, [x])).toHaveLength(0);
      expect(await q(Q.ATTENTION_EXAM_FEES)).toHaveLength(0);
    });
  });

  it('24 hours before, an unpaid fee tells the family and the office, once; a paid fee tells nobody', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const x = await exam(svc, true);
      const [a, b] = await tapKids(svc);
      await as(svc, USERS.admin);
      const [{ id: ea }] = await q(E.ENTER_EXAM, [x, a!.id, 'Grade 2', null]);
      const [{ id: eb }] = await q(E.ENTER_EXAM, [x, b!.id, 'Grade 3', null]);
      // Both sit at the same time, 30 hours from now; b's family has paid.
      await svc(`update exam_entry set sits_at = now() + interval '30 hours' where session_id = $1`, [x]);
      await pay(q, svc, eb);
      const run = (offset: string) => svc(`select app.exam_fee_reminders($1, now() + $2::interval) n`, [STUDIO_ID, offset]);

      expect((await run('5 hours'))[0].n).toBe(0);                     // 25 hours before: not yet
      expect(await familyNotes(svc, a!.family)).toHaveLength(0);
      const sent = (await run('7 hours'))[0].n;                         // 23 hours before
      expect(sent).toBe(2);                                             // the family, and the office once
      const fam = await familyNotes(svc, a!.family);
      expect(fam).toHaveLength(1);
      expect(fam[0].title).toMatch(/exam fee is unpaid: ISTD Grade 2/);
      expect(fam[0].body).toMatch(/£45\.00/);
      expect(fam[0].href).toBe('/family/payments');
      expect(await familyNotes(svc, b!.family)).toHaveLength(0);        // paid: nothing
      const office = await officeNotes(svc);
      expect(office).toHaveLength(1);
      expect(office[0].title).toMatch(/^Exam fees unpaid: 1 for ISTD Tap exams/);
      expect(office[0].href).toBe(`/exams/register/?session=${x}`);
      expect((await run('8 hours'))[0].n).toBe(0);                      // not twice
      expect((await svc(`select unpaid_reminded_at from exam_entry where id = $1`, [ea]))[0].unpaid_reminded_at).toBeTruthy();

      // The office's Today lists what is still owed for the coming week.
      const today = await q(Q.ATTENTION_EXAM_FEES);
      expect(today.find((t: any) => t.session_id === x)).toMatchObject({ unpaid: 1, unbilled: 0, owed_minor: 4500 });
    });
  });

  it('an entry with no time set is checked against 09:00 on the exam day; the tick runs it', async () => {
    await asUser(USERS.owner, async (_q, svc) => {
      const [{ id: x }] = await svc(`insert into exam_session (studio_id, board, title, exam_on, fee_minor)
          values ($1, 'RAD', 'Ballet exams', current_date + 1, 3000) returning id`, [STUDIO_ID]);
      const [a] = await tapKids(svc);
      await svc(`insert into exam_entry (studio_id, session_id, student_id, grade, fee_minor) values ($1, $2, $3, 'Grade 1', 3000)`, [STUDIO_ID, x, a!.id]);
      const at = async (hhmm: string, day: number) => (await svc(`select ((current_date + $1::int) + $2::time) at time zone 'Europe/London' t`, [day, hhmm]))[0].t;
      expect((await svc(`select app.exam_fee_reminders($1, $2::timestamptz) n`, [STUDIO_ID, await at('08:30', 0)]))[0].n).toBe(0);
      expect((await svc(`select app.exam_fee_reminders($1, $2::timestamptz) n`, [STUDIO_ID, await at('09:30', 0)]))[0].n).toBe(2);
      const office = await officeNotes(svc);
      expect(office.some((o: any) => /RAD Ballet exams/.test(o.title) && /not billed/.test(o.body))).toBe(true);
      expect(((await svc(`select app.tick() r`))[0].r as any)).toHaveProperty('exam_fee_reminders');
    });
  });
});
