import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, STUDIO_ID, FAMILY } from './helpers';
import * as B from '../src/lib/repos/billing';
import * as R from '../src/lib/repos/reports';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/** Switch who the rest of this transaction runs as (fixtures stay in place). */
const become = (q: S, user: string) => q(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const LOC = { greenwich: uid(NS.location, 1), blackheath: uid(NS.location, 2) };
type S = (sql: string, params?: unknown[]) => Promise<any[]>;

const membership = async (svc: S, user: string, role: string) =>
  (await svc(`select id from membership where user_id = $1 and studio_id = $2 and role = $3::app_role`, [user, STUDIO_ID, role]))[0].id as string;

/** A family whose children are in classes at Blackheath only, with a medical
 *  record on one child, and a family with a child at Greenwich. */
async function fixtures(svc: S) {
  const [away] = await svc(`
    select f.id, min(s.id::text)::uuid as student from family f join student s on s.family_id = f.id and s.deleted_at is null
      join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null join class c on c.id = e.class_id
     where f.studio_id = $1
     group by f.id having bool_and(c.location_id = $2) order by f.id limit 1`, [STUDIO_ID, LOC.blackheath]);
  // Nothing else ties it to Greenwich: no trial or waiting-list place there.
  for (const t of ['trial', 'waitlist_entry']) {
    await svc(`update ${t} set deleted_at = now() where student_id in (select id from student where family_id = $1)
                 and class_id in (select id from class where location_id <> $2)`, [away.id, LOC.blackheath]);
  }
  await svc(`insert into medical_record (studio_id, student_id, allergies, requires_alert) select $1, $2, 'Wasps', true
              where not exists (select 1 from medical_record where student_id = $2)`, [STUDIO_ID, away.student]);
  const [home] = await svc(`
    select s.family_id as id, s.id as student from student s join enrolment e on e.student_id = s.id and e.status = 'active'
      join class c on c.id = e.class_id where c.location_id = $1 and s.family_id = $2 limit 1`, [LOC.greenwich, FAMILY.a]);
  await svc(`insert into medical_record (studio_id, student_id, allergies) select $1, $2, 'Dust'
              where not exists (select 1 from medical_record where student_id = $2)`, [STUDIO_ID, home.student]);
  return { away, home };
}

describe('location-scoped roles (UR-33)', () => {
  it('only an owner sets limits; owners are never limited', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const own = await membership(svc, USERS.owner, 'owner');
      expect(await expectRejected(() => q(`select app.set_member_locations($1, $2)`, [own, [LOC.greenwich]]))).toMatch(/owners always see every location/);
      const nadia = await membership(svc, USERS.admin, 'admin');
      await q(`select app.set_member_locations($1, $2)`, [nadia, [LOC.greenwich]]);
      const rows = await q(`select location_id from membership_location where membership_id = $1`, [nadia]);
      expect(rows.map(r => r.location_id)).toEqual([LOC.greenwich]);
      const [log] = await q(`select summary from audit_log where entity = 'membership' and entity_id = $1 order by at desc limit 1`, [nadia]);
      expect(log.summary).toMatch(/only Greenwich Studio/);
    });
    await asUser(USERS.admin, async (q, svc) => {
      const marcus = await membership(svc, USERS.teacherTap, 'teacher');
      expect(await expectRejected(() => q(`select app.set_member_locations($1, $2)`, [marcus, [LOC.greenwich]]))).toMatch(/only an owner/);
    });
  });

  it('an unlimited administrator sees every location, as before', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { away } = await fixtures(svc);
      expect((await q(`select app.is_admin($1) a`, [STUDIO_ID]))[0].a).toBe(true);
      expect(await q(`select id from family where id = $1`, [away.id])).toHaveLength(1);
      expect(await q(`select id from medical_record where student_id = $1`, [away.student])).toHaveLength(1);
      expect((await q(`select count(*)::int n from class where location_id = $1`, [LOC.blackheath]))[0].n).toBeGreaterThan(0);
    });
  });

  it('a limited administrator reads only their locations: no other family, invoice, medical record or class', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { away, home } = await fixtures(svc);
      await svc(`insert into membership_location (membership_id, location_id, studio_id) values ($1, $2, $3)`,
        [await membership(svc, USERS.admin, 'admin'), LOC.greenwich, STUDIO_ID]);

      expect((await q(`select app.is_admin($1) a, app.is_staff($1) s`, [STUDIO_ID]))[0]).toEqual({ a: false, s: true });
      // Out of scope: nothing at all.
      expect(await q(`select id from family where id = $1`, [away.id])).toHaveLength(0);
      expect(await q(`select id from guardian where family_id = $1`, [away.id])).toHaveLength(0);
      expect(await q(`select id from student where family_id = $1`, [away.id])).toHaveLength(0);
      expect(await q(`select id from invoice where family_id = $1`, [away.id])).toHaveLength(0);
      expect(await q(`select id from payment where family_id = $1`, [away.id])).toHaveLength(0);
      expect(await q(`select id from medical_record where student_id = $1`, [away.student])).toHaveLength(0);
      expect(await q(`select id from emergency_contact where student_id = $1`, [away.student])).toHaveLength(0);
      expect(await q(`select id from class where location_id = $1`, [LOC.blackheath])).toHaveLength(0);
      expect((await q(`select app.log_medical_view($1) v`, [away.student]))[0].v).toBe(false);
      // In scope: the family, its invoices, the child's medical record (and the opening is logged).
      expect(await q(`select id from family where id = $1`, [home.id])).toHaveLength(1);
      expect((await q(`select count(*)::int n from invoice where family_id = $1`, [home.id]))[0].n).toBeGreaterThan(0);
      expect(await q(`select id from medical_record where student_id = $1`, [home.student])).toHaveLength(1);
      expect((await q(`select app.log_medical_view($1) v`, [home.student]))[0].v).toBe(true);
      expect((await q(`select count(*)::int n from class where location_id = $1`, [LOC.greenwich]))[0].n).toBeGreaterThan(0);
      expect((await q(`select count(*)::int n from class_session cs join class c on c.id = cs.class_id where c.location_id = $1`, [LOC.greenwich]))[0].n).toBeGreaterThan(0);
      // Every family visible has a child at Greenwich.
      // Every family visible has a child in a class (or trialling, or waiting) at Greenwich.
      const visible = (await q(`select id from family`)).map((f: any) => f.id);
      const outside = await svc(`select f.id from family f where f.id = any($1) and not exists (
        select 1 from student s join (select student_id, class_id from enrolment where status = 'active' and deleted_at is null
                                      union select student_id, class_id from trial where deleted_at is null
                                      union select student_id, class_id from waitlist_entry where deleted_at is null) x on x.student_id = s.id
          join class c on c.id = x.class_id where s.family_id = f.id and c.location_id = $2)`, [visible, LOC.greenwich]);
      expect(visible.length).toBeGreaterThan(0);
      expect(outside).toHaveLength(0);
      // Reports read through the same rules: Blackheath shows nothing.
      const by = await q(R.BY_LOCATION);
      expect(by.find((l: any) => l.name === 'Blackheath Studio')?.classes ?? 0).toBe(0);
      expect(by.find((l: any) => l.name === 'Greenwich Studio')?.classes).toBeGreaterThan(0);

      // Read only: changes, billing, imports and invitations stay with the owner.
      expect(await q(`update family set notes = 'x' where id = $1 returning id`, [home.id])).toHaveLength(0);
      expect(await expectRejected(() => q(`select * from app.aged_debt($1)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.import_families('[{"parent_name":"x"}]'::jsonb, false)`))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select * from app.bulk_invitations(false)`))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.create_invitation($1, 'a@b.co', 'teacher')`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      // Still staff: the staff list is there.
      expect((await q(`select count(*)::int n from staff_member`))[0].n).toBeGreaterThan(0);
    });
  });

  it('a limited teacher sees classes at their locations and the ones they teach, nothing else; teachers otherwise unchanged', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const all = (await q(`select count(*)::int n from class`))[0].n;
      expect((await q(`select count(*)::int n from class where location_id = $1`, [LOC.blackheath]))[0].n).toBeGreaterThan(1);
      await svc(`insert into membership_location (membership_id, location_id, studio_id) values ($1, $2, $3)`,
        [await membership(svc, USERS.teacherTap, 'teacher'), LOC.greenwich, STUDIO_ID]);
      const seen = await q(`select c.name, c.location_id from class c`);
      expect(seen.length).toBeLessThan(all);
      // Senior Tap is at Blackheath but is his own class.
      expect(seen.filter((c: any) => c.location_id === LOC.blackheath).map((c: any) => c.name)).toEqual(['Senior Tap']);
      expect(seen.some((c: any) => c.name === 'Street Juniors')).toBe(false);
      // His own students and registers are unchanged.
      expect((await q(`select count(*)::int n from student`))[0].n).toBeGreaterThan(0);
    });
  });

  it('changing someone’s role clears their limit; an empty list means every location', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const nadia = await membership(svc, USERS.admin, 'admin');
      await q(`select app.set_member_locations($1, $2)`, [nadia, [LOC.greenwich]]);
      await q(`select app.set_member_locations($1, $2)`, [nadia, []]);
      expect(await q(`select 1 from membership_location where membership_id = $1`, [nadia])).toHaveLength(0);
      await q(`select app.set_member_locations($1, $2)`, [nadia, [LOC.blackheath]]);
      await svc(`update membership set role = 'teacher' where id = $1`, [nadia]);
      expect(await svc(`select 1 from membership_location where membership_id = $1`, [nadia])).toHaveLength(0);
      const own = await membership(svc, USERS.owner, 'owner');
      expect(await expectRejected(() => svc(`insert into membership_location (membership_id, location_id, studio_id)
        values ($1, $2, $3)`, [own, LOC.greenwich, STUDIO_ID]))).toMatch(/only administrators and teachers/);
    });
  });
});

describe('billing lists by location (UR-33)', () => {
  it('invoices, overdue families and aged debt carry their locations', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const { away } = await fixtures(svc);
      const inv = (await q(B.INVOICES)).filter((i: any) => i.family_id === away.id);
      expect(inv.length).toBeGreaterThan(0);
      for (const i of inv) expect(i.locations).toEqual(['Blackheath Studio']);
      // Make one of its invoices overdue, so it appears in the reminder list and aged debt.
      await svc(`update invoice set status = 'issued', due_on = current_date - 40, paid_minor = 0 where id = $1`, [inv[0].id]);
      const over = (await q(B.OVERDUE_FAMILIES)).find((f: any) => f.family_id === away.id);
      expect(over.locations).toEqual(['Blackheath Studio']);
      const famName = over.family_name;
      expect((await q(B.AGED_DEBT_EXPORT, [null])).some((r: any) => r.family === famName)).toBe(true);
      expect((await q(B.AGED_DEBT_EXPORT, ['Blackheath Studio'])).some((r: any) => r.family === famName)).toBe(true);
      expect((await q(B.AGED_DEBT_EXPORT, ['Greenwich Studio'])).some((r: any) => r.family === famName)).toBe(false);
      const where = await q(B.CLASS_LOCATIONS);
      expect(new Set(where.map((c: any) => c.location))).toEqual(new Set(['Greenwich Studio', 'Blackheath Studio']));
    });
  });
});

describe('history imports (UR-32)', () => {
  const kid = async (svc: S) => (await svc(`
    select s.first_name, s.last_name, to_char(s.date_of_birth, 'DD/MM/YYYY') dob, s.id, s.family_id,
           (select g.email from guardian g where g.family_id = s.family_id and g.email is not null limit 1) email
      from student s where s.family_id = $1 and s.deleted_at is null order by s.first_name limit 1`, [FAMILY.a]))[0];

  it('past invoices: checked first, all or nothing, kept out of the ledger and billing runs, read-only', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const k = await kid(svc);
      const before = (await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor;
      const skippedBefore = await q(`select count(*)::int n from invoice`);
      const rows = [
        { parent_email: k.email, number: 'OLD-101', issued_on: '01/09/2025', due_on: '15/09/2025', description: 'Autumn fees', total: '£120.00', paid: '120' },
        { parent_email: k.email, number: 'OLD-102', issued_on: '05/01/2026', total: '96.50', paid: '' },
        { family: 'Nobody Here', number: 'X1', issued_on: '01/01/2026', total: '10' },
        { parent_email: k.email, number: 'OLD-101', issued_on: 'soon', total: 'lots' },
      ];
      const [{ r }] = await q(`select app.import_invoice_history($1::jsonb, false) r`, [JSON.stringify(rows)]);
      expect(r.ok).toBe(false);
      expect(r.errors.map((e: any) => e.row)).toEqual([3, 4]);
      expect(await expectRejected(() => q(`select app.import_invoice_history($1::jsonb, true)`, [JSON.stringify(rows)]))).toMatch(/need fixing/);
      expect(await q(`select 1 from imported_invoice`)).toHaveLength(0);

      const [{ r: done }] = await q(`select app.import_invoice_history($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(done).toMatchObject({ invoices: 2, skipped: 0 });
      const got = await q(`select number, total_minor::int t, paid_minor::int p, issued_on::text d from imported_invoice where family_id = $1 order by number`, [FAMILY.a]);
      expect(got).toEqual([{ number: 'OLD-101', t: 12000, p: 12000, d: '2025-09-01' }, { number: 'OLD-102', t: 9650, p: 0, d: '2026-01-05' }]);
      // History only: the ledger, balance and invoice list do not change.
      expect((await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor).toBe(before);
      expect(await q(`select count(*)::int n from invoice`)).toEqual(skippedBefore);
      // Again: nothing new.
      const [{ r: again }] = await q(`select app.import_invoice_history($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(again).toMatchObject({ invoices: 0, skipped: 2 });
      // Read-only for everyone.
      expect(await expectRejected(() => q(`update imported_invoice set total_minor = 1`))).toMatch(/permission denied/);
      await become(q, USERS.guardianA);
      expect(await q(`select number from imported_invoice order by number`)).toHaveLength(2);
      await become(q, USERS.guardianB);
      expect(await q(`select number from imported_invoice where family_id = $1`, [FAMILY.a])).toHaveLength(0);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(`select app.import_invoice_history('[{"family":"x"}]'::jsonb, false)`))).toMatch(/FORBIDDEN/);
    });
  });

  it('attendance summaries per child and term; an ambiguous or unknown child is refused', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const k = await kid(svc);
      const rows = [
        { child_first_name: k.first_name, child_last_name: k.last_name, child_dob: k.dob, period: 'Autumn 2025', class: 'Ballet', attended: '11', absent: '1' },
        { child_first_name: k.first_name, parent_email: k.email, period: 'Spring 2026', attended: '9' },
        { child_first_name: 'Zebedee', period: 'Autumn 2025', attended: '3' },
        { child_first_name: k.first_name, child_last_name: k.last_name, period: 'Autumn 2025', class: 'Ballet', attended: 'ten' },
      ];
      const [{ r }] = await q(`select app.import_attendance_history($1::jsonb, false) r`, [JSON.stringify(rows)]);
      expect(r.errors.map((e: any) => e.row)).toEqual([3, 4]);
      expect(r.errors[0].message).toMatch(/No child called Zebedee/);
      const [{ r: done }] = await q(`select app.import_attendance_history($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(done).toMatchObject({ records: 2 });
      expect(await q(`select period, class_name, attended, absent from attendance_history where student_id = $1 order by period`, [k.id]))
        .toEqual([{ period: 'Autumn 2025', class_name: 'Ballet', attended: 11, absent: 1 }, { period: 'Spring 2026', class_name: '', attended: 9, absent: 0 }]);
      const [{ r: again }] = await q(`select app.import_attendance_history($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(again).toMatchObject({ records: 0, skipped: 2 });
      // Two children with the same first name and no other detail: refused, not guessed.
      const [twin] = await svc(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
        values ($1, $2, $3, 'Twin', '2016-01-01') returning id`, [STUDIO_ID, FAMILY.b, k.first_name]);
      const [{ r: amb }] = await q(`select app.import_attendance_history($1::jsonb, false) r`,
        [JSON.stringify([{ child_first_name: k.first_name, period: 'Summer 2025', attended: '2' }])]);
      expect(amb.errors[0].message).toMatch(/More than one child/);
      expect(twin.id).toBeTruthy();
    });
  });

  it('exam results become sat entries on an imported exam session', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const k = await kid(svc);
      const rows = [
        { child_first_name: k.first_name, child_last_name: k.last_name, board: 'RAD', grade: 'Grade 2', exam_date: '20/06/2025', result: 'Highly Commended', mark: '78' },
        { child_first_name: k.first_name, child_last_name: k.last_name, board: 'RAD', grade: 'Grade 1', exam_date: '20/06/2024', result: 'Merit' },
        { child_first_name: k.first_name, child_last_name: k.last_name, board: 'RAD', grade: 'Grade 3', exam_date: '20/06/2025', result: 'Brilliant' },
        { child_first_name: k.first_name, child_last_name: k.last_name, board: '', grade: 'Grade 3', exam_date: '01/01/2099' },
      ];
      const [{ r }] = await q(`select app.import_exam_results($1::jsonb, false) r`, [JSON.stringify(rows)]);
      expect(r.errors.map((e: any) => e.row)).toEqual([3, 4, 4]);
      expect(await expectRejected(() => q(`select app.import_exam_results($1::jsonb, true)`, [JSON.stringify(rows)]))).toMatch(/need fixing/);
      const [{ r: done }] = await q(`select app.import_exam_results($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(done).toMatchObject({ results: 2, sessions: 2 });
      const got = await q(`select e.grade, e.status, e.result, e.mark, s.imported, s.title from exam_entry e join exam_session s on s.id = e.session_id
                            where e.student_id = $1 order by e.grade`, [k.id]);
      expect(got).toEqual([
        { grade: 'Grade 1', status: 'sat', result: 'merit', mark: null, imported: true, title: 'RAD exams' },
        { grade: 'Grade 2', status: 'sat', result: 'highly_commended', mark: 78, imported: true, title: 'RAD exams' },
      ]);
      const [{ r: again }] = await q(`select app.import_exam_results($1::jsonb, true) r`, [JSON.stringify(rows.slice(0, 2))]);
      expect(again).toMatchObject({ results: 0, sessions: 0, skipped: 2 });
      await become(q, USERS.guardianA);
      expect((await q(`select count(*)::int n from exam_entry where student_id = $1 and status = 'sat'`, [k.id]))[0].n).toBe(2);
    });
  });
});

describe('invitation links without email (UR-32)', () => {
  it('every parent and teacher without a login gets a working link, once; no email is listed; reissue replaces', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      // A parent without an email, and a teacher without a login.
      await svc(`insert into guardian (studio_id, family_id, full_name) values ($1, $2, 'No Email Parent')`, [STUDIO_ID, FAMILY.c]);
      await svc(`insert into staff_member (studio_id, display_name, email) values ($1, 'New Teacher', 'new.teacher@example.com')`, [STUDIO_ID]);
      const expected = (await svc(`select count(*)::int n from guardian g join family f on f.id = g.family_id and f.deleted_at is null
        where g.studio_id = $1 and g.deleted_at is null and g.user_id is null`, [STUDIO_ID]))[0].n;

      const rows = await q(`select * from app.bulk_invitations(false)`);
      expect(rows.filter((r: any) => r.role === 'guardian')).toHaveLength(expected);
      const teacher = rows.find((r: any) => r.full_name === 'New Teacher');
      expect(teacher).toMatchObject({ role: 'teacher', email: 'new.teacher@example.com' });
      expect(teacher.token).toBeTruthy();
      const none = rows.find((r: any) => r.full_name === 'No Email Parent');
      expect(none.token).toBeNull();
      expect(none.note).toMatch(/No email/);
      const linked = rows.filter((r: any) => r.token);
      expect(linked.length).toBeGreaterThan(1);
      // Each is a normal invitation: 14 days, and it opens.
      for (const r of linked.slice(0, 3)) {
        const days = (new Date(r.expires_at).getTime() - Date.now()) / 86400_000;
        expect(days).toBeGreaterThan(13.9);
        const [p] = await q(`select * from app.invitation_preview($1)`, [r.token]);
        expect(p).toBeTruthy();
      }
      // Running it again does not replace links already out.
      const again = await q(`select * from app.bulk_invitations(false)`);
      expect(again.filter((r: any) => r.token)).toHaveLength(0);
      expect(again.find((r: any) => r.full_name === 'New Teacher').note).toMatch(/Already invited/);
      // Reissue: new links, the old ones stop working.
      const fresh = await q(`select * from app.bulk_invitations(true)`);
      expect(fresh.filter((r: any) => r.token)).toHaveLength(linked.length);
      const old = await q(`select revoked_at from studio_invitation where token_hash = app.hash_token($1)`, [teacher.token]);
      expect(old[0].revoked_at).not.toBeNull();
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(`select * from app.bulk_invitations(false)`))).toMatch(/FORBIDDEN/);
    });
  });
});
