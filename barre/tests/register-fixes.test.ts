/**
 * Register stream fixes from the end-user panel (migration 0048):
 * UR-04 conflict rules, UR-07 absence reports, UR-27 cover, UR-36 trial
 * cancellations, UR-37 register window, UR-49 students, UR-54, UR-56.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, CLASS, FAMILY, STUDIO_ID, type Q } from './helpers';
import * as T from '../src/lib/repos/teaching';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const MODERN_JUNIORS = uid(NS.class, 7);

/** Move a session so it starts `mins` from now, keeping its length. */
const startIn = (svc: Q, id: string, mins: number) =>
  svc(`update class_session set starts_at = now() + make_interval(mins => $2::int),
              ends_at = now() + make_interval(mins => $2::int) + (ends_at - starts_at), register_closed_at = null
        where id = $1`, [id, mins]);

const nextOf = async (svc: Q, classId: string) =>
  (await svc(`select id, starts_at, ends_at, studio_id from class_session where class_id = $1 and starts_at > now()
                and status = 'scheduled' and teacher_id is null order by starts_at limit 1`, [classId]))[0];

/** A child of Hannah's (guardian A) with a class, that class's next session and its teacher. */
async function hannahsChild(svc: Q) {
  const [row] = await svc(`
    select s.id student_id, s.first_name, e.class_id, sm.user_id teacher_user
      from student s join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
      join class c on c.id = e.class_id join staff_member sm on sm.id = c.teacher_id
     where s.family_id = $1 and sm.user_id is not null
     order by s.first_name, c.name limit 1`, [FAMILY.a]);
  const session = await nextOf(svc, row.class_id);
  return { ...row, session };
}

describe('UR-07 absence reports reach the session, register and teacher', () => {
  it('a parent’s report pre-marks the register, shows on the teacher’s Today and copies the office', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const k = await hannahsChild(svc);
      const opts = await q(`select * from app.absence_options($1)`, [k.student_id]);
      expect(opts.some((o: any) => o.session_id === k.session.id)).toBe(true);
      const [{ n }] = await q(`select app.report_absence($1, $2::uuid[], 'Dentist after school') n`, [k.student_id, [k.session.id]]);
      expect(n).toBe(1);
      const [ar] = await svc(`select status, mark_kind, reported_by_guardian, reason from attendance_record
                               where session_id = $1 and student_id = $2`, [k.session.id, k.student_id]);
      expect(ar).toMatchObject({ status: 'excused', mark_kind: 'reported', reported_by_guardian: true, reason: 'Dentist after school' });
      const [copy] = await svc(`select inbound, subject from communication where family_id = $1
                                  and subject like 'Absence:%' order by sent_at desc limit 1`, [FAMILY.a]);
      expect(copy.inbound).toBe(true);
      expect(copy.subject).toContain(k.first_name);
      // The family sees the report against the class, withdrawable.
      const [again] = (await q(`select * from app.absence_options($1)`, [k.student_id])).filter((o: any) => o.session_id === k.session.id);
      expect(again.report_id).toBeTruthy();
      expect(again.withdrawable).toBe(true);

      // The class's teacher: on the register and on Today.
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: k.teacher_user, role: 'authenticated' })]);
      const reg = await q(T.REGISTER, [k.session.id]);
      const line = reg.find((r: any) => r.student_id === k.student_id);
      expect(line).toMatchObject({ status: 'excused', mark_kind: 'reported', reported_note: 'Dentist after school', reported_by: 'guardian' });
      const day = new Date(k.session.starts_at);
      const from = new Date(day); from.setHours(0, 0, 0, 0);
      const to = new Date(from.getTime() + 86400_000);
      const mine = await q(T.MY_SESSIONS, [from.toISOString(), to.toISOString()]);
      expect(mine.find((m: any) => m.id === k.session.id).reported_absent).toContain(k.first_name);
    });
  });

  it('the teacher can change the pre-mark on the day; "mark the rest" never does', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const k = await hannahsChild(svc);
      await startIn(svc, k.session.id, 10);
      await q(`select app.report_absence($1, $2::uuid[], 'Unwell')`, [k.student_id, [k.session.id]]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: k.teacher_user, role: 'authenticated' })]);
      const later = new Date(Date.now() + 3600_000).toISOString();
      await q(T.MARK_ATTENDANCE, [k.session.id, k.student_id, 'present', null, later, 'rest']);
      expect((await svc(`select status from attendance_record where session_id = $1 and student_id = $2`, [k.session.id, k.student_id]))[0].status).toBe('excused');
      await q(T.MARK_ATTENDANCE, [k.session.id, k.student_id, 'present', null, new Date().toISOString(), 'explicit']);
      const [r] = await svc(`select status, mark_kind, reported_by_guardian from attendance_record where session_id = $1 and student_id = $2`, [k.session.id, k.student_id]);
      expect(r).toMatchObject({ status: 'present', mark_kind: 'explicit', reported_by_guardian: false });
    });
  });

  it('withdrawal removes the pre-mark, until the class starts', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const k = await hannahsChild(svc);
      await q(`select app.report_absence($1, $2::uuid[], null)`, [k.student_id, [k.session.id]]);
      const [rep] = await q(`select id from absence_report where session_id = $1 and student_id = $2 and status = 'active'`, [k.session.id, k.student_id]);
      await q(`select app.withdraw_absence($1)`, [rep.id]);
      expect(await svc(`select 1 from attendance_record where session_id = $1 and student_id = $2`, [k.session.id, k.student_id])).toHaveLength(0);
      expect((await q(`select status from absence_report where id = $1`, [rep.id]))[0].status).toBe('withdrawn');

      await q(`select app.report_absence($1, $2::uuid[], null)`, [k.student_id, [k.session.id]]);
      const [rep2] = await q(`select id from absence_report where session_id = $1 and student_id = $2 and status = 'active'`, [k.session.id, k.student_id]);
      await startIn(svc, k.session.id, -5);
      expect(await expectRejected(() => q(`select app.withdraw_absence($1)`, [rep2.id]))).toMatch(/has started/);
    });
  });

  it('only the child’s own family can report, and never for a class that has passed', async () => {
    await asUser(USERS.guardianB, async (q, svc) => {
      const k = await hannahsChild(svc);
      expect(await expectRejected(() => q(`select app.report_absence($1, $2::uuid[], 'x')`, [k.student_id, [k.session.id]]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select * from app.absence_options($1)`, [k.student_id]))).toMatch(/FORBIDDEN/);
      // Nor can anyone write the register directly.
      expect(await expectRejected(() => q(`insert into attendance_record (studio_id, session_id, student_id, status, mark_kind)
                                            values ($1, $2, $3, 'excused', 'reported')`, [STUDIO_ID, k.session.id, k.student_id]))).toBeTruthy();
    });
    await asUser(USERS.guardianA, async (q, svc) => {
      const k = await hannahsChild(svc);
      await q(`select app.report_absence($1, $2::uuid[], 'x')`, [k.student_id, [k.session.id]]);
      const [past] = await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 1`, [k.class_id]);
      expect(await expectRejected(() => q(`select app.report_absence($1, $2::uuid[], 'x')`, [k.student_id, [past.id]]))).toMatch(/Send a message instead/);
    });
    // Another family cannot see Hannah's reports.
    await asUser(USERS.guardianB, async (q) => {
      expect(await q(`select 1 from absence_report r join student s on s.id = r.student_id
                       where s.family_id = $1`, [FAMILY.a])).toHaveLength(0);
    });
  });
});

describe('UR-49 students of 13 and over', () => {
  async function teen(svc: Q) {
    const [s] = await svc(`select s.id, s.user_id, s.family_id, e.class_id from student s
                             join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
                            where s.user_id is not null and s.login_enabled
                              and extract(year from age(current_date, s.date_of_birth)) >= 13 order by s.id limit 1`);
    return { ...s, session: await nextOf(svc, s.class_id) };
  }

  it('can say "I can’t make it", which tells their guardians and reaches the register', async () => {
    const [s] = await asUser(null, async (_q, svc) => [await teen(svc)]);
    await asUser(s.user_id, async (q, svc) => {
      await q(`select app.report_absence($1, $2::uuid[], 'Mock exams')`, [s.id, [s.session.id]]);
      expect((await svc(`select reporter from absence_report where session_id = $1 and student_id = $2`, [s.session.id, s.id]))[0].reporter).toBe('student');
      const told = await svc(`select n.user_id from notification n join guardian g on g.user_id = n.user_id
                               where g.family_id = $1 and n.kind = 'absence_reported'`, [s.family_id]);
      expect(told.length).toBeGreaterThan(0);
      expect(await svc(`select 1 from communication where family_id = $1 and subject like 'Absence:%' and inbound`, [s.family_id])).not.toHaveLength(0);
    });
  });

  it('a younger student cannot report for themselves', async () => {
    const [s] = await asUser(null, async (_q, svc) => [await teen(svc)]);
    await asUser(s.user_id, async (q, svc) => {
      // Since UR-55 (0053) an under-13 cannot have a login at all: a school
      // cannot set logins from 10, and an 11-year-old's login is refused. This
      // test used to arrange exactly that; it now checks the database refuses.
      expect(await expectRejected(() => svc(`update studio set student_login_min_age = 10 where id = $1`, [STUDIO_ID]))).toMatch(/check constraint/);
      expect(await expectRejected(() => svc(`update student set date_of_birth = current_date - interval '11 years' where id = $1`, [s.id])))
        .toMatch(/STUDENT_LOGIN_TOO_YOUNG/);
      // A thirteen-year-old still can.
      await q(`select app.report_absence($1, $2::uuid[], 'x')`, [s.id, [s.session.id]]);
    });
  });

  it('students hear about a cancelled class in their own bell', async () => {
    const [s] = await asUser(null, async (_q, svc) => [await teen(svc)]);
    await asUser(USERS.admin, async (q, svc) => {
      await q(`select app.cancel_session($1, 'Hall flooded')`, [s.session.id]);
      const [n] = await svc(`select href from notification where user_id = $1 and title like 'Cancelled:%'`, [s.user_id]);
      expect(n.href).toBe('/learn/timetable');
    });
  });
});

describe('UR-36 trial families are told when their session is cancelled', () => {
  it('tells the trial family before the trial is cancelled, and asks the office to rebook', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [t] = await svc(`select t.id, t.session_id, st.family_id from trial t join student st on st.id = t.student_id
                              where t.status = 'booked' and t.session_id is not null order by t.id limit 1`);
      // One guardian with a login, so both routes are exercised.
      const guardians = await svc(`select id, user_id, email from guardian where family_id = $1 and deleted_at is null`, [t.family_id]);
      expect(guardians.length).toBeGreaterThan(0);
      const parent = 'a1a1a1a1-0000-4000-8000-000000000001';
      await svc(`insert into user_account (id, email, full_name) values ($1, 'trial.login@example.com', 'Trial Parent')`, [parent]);
      await svc(`update guardian set user_id = $2 where id = $1`, [guardians[0].id, parent]);
      await q(`select app.cancel_session($1, 'Teacher unwell')`, [t.session_id]);
      const told = await svc(`select title from notification where user_id = $1 and title like 'Cancelled:%'`, [parent]);
      expect(told).toHaveLength(1);
      if (guardians.length > 1 && guardians[1].email) {
        expect(await svc(`select 1 from outbound_message where to_address = $1 and subject like 'Cancelled:%'`, [guardians[1].email])).toHaveLength(1);
      }
      const [after] = await svc(`select status, outcome_note from trial where id = $1`, [t.id]);
      expect(after.status).toBe('cancelled');
      expect(after.outcome_note).toMatch(/to rebook/);
      const rebook = await svc(`select 1 from notification where user_id = $1 and title like 'Rebook a trial:%'`, [USERS.owner]);
      expect(rebook).toHaveLength(1);
    });
  });

  it('a trial family with no login gets the cancellation by email', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [t] = await svc(`select t.session_id, st.family_id from trial t join student st on st.id = t.student_id
                              where t.status = 'booked' and t.session_id is not null order by t.id limit 1`);
      await svc(`update guardian set user_id = null, email = 'trial.parent@example.com' where family_id = $1`, [t.family_id]);
      await q(`select app.cancel_session($1, 'Teacher unwell')`, [t.session_id]);
      expect(await svc(`select 1 from outbound_message where to_address = 'trial.parent@example.com' and subject like 'Cancelled:%'`)).not.toHaveLength(0);
    });
  });
});

describe('UR-37 the register window', () => {
  it('opens 30 minutes before and stays open for 7 days; outside it the office amends with a reason', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.juniorTap]);
      const sessions = await svc(`select id from class_session where class_id = $1 order by starts_at`, [CLASS.juniorTap]);
      const [a, b, c, d] = sessions.map((s: any) => s.id);
      const mark = (id: string) => q(T.MARK_ATTENDANCE, [id, kid.student_id, 'present', null, new Date().toISOString(), 'explicit']);

      await startIn(svc, a, 60 * 24 * 4);             // Tuesday's class, seen on Friday
      expect(await expectRejected(() => mark(a))).toMatch(/REGISTER_LOCKED: this register opens/);
      expect(await expectRejected(() => q(`select app.close_register($1)`, [a]))).toMatch(/REGISTER_LOCKED/);
      expect((await q(T.REGISTER_WINDOW, [a]))[0].state).toBe('early');

      await startIn(svc, b, 20);                       // within 30 minutes of the start
      expect(await mark(b)).toHaveLength(1);
      await startIn(svc, c, -60 * 24 * 3);             // last Tuesday's
      expect(await mark(c)).toHaveLength(1);
      await startIn(svc, d, -60 * 24 * 9);             // more than a week ago
      expect(await expectRejected(() => mark(d))).toMatch(/can no longer be changed/);
      expect((await q(T.REGISTER_WINDOW, [d]))[0].state).toBe('late');
    });
  });

  it('the office amends an old register only with a reason, and it is audited', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [kid] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.juniorTap]);
      const [s] = await svc(`select id from class_session where class_id = $1 order by starts_at limit 1`, [CLASS.juniorTap]);
      await startIn(svc, s.id, -60 * 24 * 10);
      expect(await expectRejected(() => q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'absent', null, null, 'explicit']))).toMatch(/REGISTER_LOCKED/);
      expect(await expectRejected(() => q(T.AMEND_ATTENDANCE, [s.id, kid.student_id, 'absent', ' ']))).toMatch(/say why/);
      await q(T.AMEND_ATTENDANCE, [s.id, kid.student_id, 'absent', 'Paper register said absent']);
      expect((await svc(`select status from attendance_record where session_id = $1 and student_id = $2`, [s.id, kid.student_id]))[0].status).toBe('absent');
      const [log] = await svc(`select summary from audit_log where action = 'amend_register' and entity_id = $1`, [s.id]);
      expect(log.summary).toMatch(/Paper register said absent/);
    });
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.juniorTap]);
      const [s] = await svc(`select id from class_session where class_id = $1 order by starts_at limit 1`, [CLASS.juniorTap]);
      expect(await expectRejected(() => q(T.AMEND_ATTENDANCE, [s.id, kid.student_id, 'absent', 'x']))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-04 conflict rules on the server', () => {
  it('an explicit mark beats "rest" whatever the clocks; between explicit marks the later device time wins', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await nextOf(svc, CLASS.juniorTap);
      await startIn(svc, s.id, -10);
      const [kid] = await svc(`select student_id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.juniorTap]);
      const status = async () => (await svc(`select status from attendance_record where session_id = $1 and student_id = $2`, [s.id, kid.student_id]))[0].status;
      // Offline: Absent at 10:00, then "mark the rest" at 10:01. The rest arrives first…
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'present', null, '2026-01-01T10:01:00Z', 'rest']);
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'absent', null, '2026-01-01T10:00:00Z', 'explicit']);
      expect(await status()).toBe('absent');
      // …or second: either way the explicit Absent stands.
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'present', null, '2026-01-01T10:30:00Z', 'rest']);
      expect(await status()).toBe('absent');
      // Two explicit marks: the later device time wins…
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'late', null, '2026-01-01T10:20:00Z', 'explicit']);
      expect(await status()).toBe('late');
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'present', null, '2026-01-01T10:05:00Z', 'explicit']);
      expect(await status()).toBe('late');
      // …unless the two device times are within two minutes: then the later arrival wins.
      await q(T.MARK_ATTENDANCE, [s.id, kid.student_id, 'absent', null, '2026-01-01T10:19:00Z', 'explicit']);
      expect(await status()).toBe('absent');
    });
  });
});

describe('UR-27 cover', () => {
  async function juniorTapOnPriyasDay(svc: Q) {
    // A Junior Tap (Greenwich 16:30) on a Tuesday when Priya teaches Modern Juniors (Blackheath 16:00–16:45).
    const [s] = await svc(`select cs.id from class_session cs
                             where cs.class_id = $1 and cs.starts_at > now() and cs.teacher_id is null and cs.status = 'scheduled'
                               and exists (select 1 from class_session m where m.class_id = $2 and m.starts_at::date = cs.starts_at::date)
                             order by cs.starts_at limit 1`, [CLASS.juniorTap, MODERN_JUNIORS]);
    const [priya] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherModern]);
    return { session: s.id, priya: priya.id };
  }

  it('warns of a clash, including travel between sites, and lets the office assign anyway', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { session, priya } = await juniorTapOnPriyasDay(svc);
      const clashes = await q(`select * from app.cover_clashes($1, $2)`, [session, priya]);
      expect(clashes[0]).toMatchObject({ class_name: 'Modern Juniors', location: expect.stringMatching(/Blackheath/), needs_travel: true });
      expect(await expectRejected(() => q(`select app.cover_session($1, $2)`, [session, priya]))).toMatch(/CLASH: Priya.*Modern Juniors/);
      await q(`select app.cover_session($1, $2, null, false, 'Warm-up from week 3. Watch Jonah’s latex allergy.', true)`, [session, priya]);
      const [cs] = await svc(`select teacher_id, handover_note from class_session where id = $1`, [session]);
      expect(cs).toMatchObject({ teacher_id: priya, handover_note: expect.stringMatching(/Warm-up/) });
    });
  });

  it('counts travel time only between different sites', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const { session, priya } = await juniorTapOnPriyasDay(svc);
      // Move Modern Juniors to finish 10 minutes before Junior Tap: still a clash with 20 minutes' travel…
      await svc(`update class_session m set starts_at = cs.starts_at - interval '55 minutes', ends_at = cs.starts_at - interval '10 minutes'
                   from class_session cs where cs.id = $1 and m.class_id = $2 and m.starts_at::date = cs.starts_at::date`, [session, MODERN_JUNIORS]);
      expect(await q(`select 1 from app.cover_clashes($1, $2)`, [session, priya])).toHaveLength(1);
      // …and not with travel set to 5 minutes.
      await svc(`update studio set cover_travel_min = 5 where id = $1`, [STUDIO_ID]);
      expect(await q(`select 1 from app.cover_clashes($1, $2)`, [session, priya])).toHaveLength(0);
    });
  });

  it('gives the covering teacher the children only on the day, and shows the session ahead of time', async () => {
    await asUser(USERS.teacherStreet, async (q, svc) => {
      const [tom] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherStreet]);
      const s = await nextOf(svc, CLASS.juniorTap);
      await svc(`update class_session set teacher_id = $2, handover_note = 'Plan in the blue folder' where id = $1`, [s.id, tom.id]);
      await startIn(svc, s.id, 60 * 24 * 3);
      expect(await q(`select handover_note from class_session where id = $1`, [s.id])).toEqual([{ handover_note: 'Plan in the blue folder' }]);
      expect(await q(T.REGISTER, [s.id])).toHaveLength(0);
      expect((await q(T.SESSION_ACCESS, [s.id]))[0].access).toBe('cover_later');
      await startIn(svc, s.id, 5);
      expect((await q(T.REGISTER, [s.id])).length).toBeGreaterThan(0);
      expect((await q(T.SESSION_ACCESS, [s.id]))[0].access).toBe('ok');
    });
  });

  it('a teacher asking for cover can leave a handover note', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await nextOf(svc, CLASS.juniorTap);
      await q(T.REQUEST_COVER_HANDOVER, [s.id, 'Hospital appointment', 'Music is on the class page']);
      expect((await svc(`select handover_note from class_session where id = $1`, [s.id]))[0].handover_note).toBe('Music is on the class page');
    });
  });
});

describe('UR-56 make-up classes', () => {
  it('offers a make-up in a suitable class with space after a cancellation, and books it free', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await svc(`update studio set makeup_policy = 'cancelled', credit_cancelled_classes = false where id = $1`, [STUDIO_ID]);
      const k = await hannahsChild(svc);
      await q(`select app.cancel_session($1, 'Hall flooded')`, [k.session.id]);
      const [offer] = await svc(`select id, reason, status from makeup_offer where from_session_id = $1 and student_id = $2`, [k.session.id, k.student_id]);
      expect(offer).toMatchObject({ reason: 'cancelled', status: 'open' });
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianA, role: 'authenticated' })]);
      const options = await q(`select * from app.makeup_options($1)`, [offer.id]);
      // Fit is the family's problem only if there is nothing; when there is, it is the same style with space.
      for (const o of options) {
        const [ok] = await svc(`select c1.dance_style_id = c2.dance_style_id same, (select capacity from class where id = c2.id) - app.session_taken($2) spaces
                                  from class_session a join class c1 on c1.id = a.class_id,
                                       class_session b join class c2 on c2.id = b.class_id
                                 where a.id = $1 and b.id = $2`, [k.session.id, o.session_id]);
        expect(ok.same).toBe(true);
        expect(ok.spaces).toBeGreaterThan(0);
      }
      if (options.length) {
        await q(`select app.book_makeup($1, $2)`, [offer.id, options[0].session_id]);
        const [b] = await svc(`select price_minor, status from drop_in_booking where session_id = $1 and student_id = $2`, [options[0].session_id, k.student_id]);
        expect(b).toMatchObject({ price_minor: 0, status: 'booked' });
        expect((await svc(`select status from makeup_offer where id = $1`, [offer.id]))[0].status).toBe('booked');
        expect(await expectRejected(() => q(`select app.book_makeup($1, $2)`, [offer.id, options[0].session_id]))).toMatch(/already been used/);
      }
    });
  });

  it('only the child’s family (or the office) can see and book an offer', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await svc(`update studio set makeup_policy = 'cancelled', credit_cancelled_classes = false where id = $1`, [STUDIO_ID]);
      const k = await hannahsChild(svc);
      await q(`select app.cancel_session($1, 'Hall flooded')`, [k.session.id]);
      const [offer] = await svc(`select id from makeup_offer where from_session_id = $1 and student_id = $2`, [k.session.id, k.student_id]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianB, role: 'authenticated' })]);
      expect(await q(`select 1 from makeup_offer where id = $1`, [offer.id])).toHaveLength(0);
      expect(await expectRejected(() => q(`select * from app.makeup_options($1)`, [offer.id]))).toMatch(/FORBIDDEN/);
    });
  });

  it('no offer when the policy is off, or when the school gives credit for cancellations instead', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const k = await hannahsChild(svc);
      await q(`select app.cancel_session($1, 'Hall flooded')`, [k.session.id]);
      expect(await svc(`select 1 from makeup_offer`)).toHaveLength(0);
      await svc(`update studio set makeup_policy = 'cancelled', credit_cancelled_classes = true where id = $1`, [STUDIO_ID]);
      const second = (await svc(`select id from class_session where class_id = $1 and starts_at > now() and status = 'scheduled' order by starts_at limit 1`, [k.class_id]))[0];
      await q(`select app.cancel_session($1, 'Hall flooded')`, [second.id]);
      expect(await svc(`select 1 from makeup_offer`)).toHaveLength(0);
    });
  });

  it('a reported absence earns an offer when the policy says so; withdrawing takes it back', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await svc(`update studio set makeup_policy = 'cancelled_and_absence' where id = $1`, [STUDIO_ID]);
      const k = await hannahsChild(svc);
      await q(`select app.report_absence($1, $2::uuid[], 'Holiday')`, [k.student_id, [k.session.id]]);
      const [offer] = await q(`select id, reason, status from makeup_offer where from_session_id = $1`, [k.session.id]);
      expect(offer).toMatchObject({ reason: 'absence', status: 'open' });
      const [rep] = await q(`select id from absence_report where session_id = $1 and status = 'active'`, [k.session.id]);
      await q(`select app.withdraw_absence($1)`, [rep.id]);
      expect((await q(`select status from makeup_offer where id = $1`, [offer.id]))[0].status).toBe('withdrawn');
    });
  });
});

describe('UR-54 small register fixes', () => {
  it('a stale link is "missing", someone else’s class is "not yours"', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      expect((await q(T.SESSION_ACCESS, ['5e55a000-0000-4000-8000-000000000000']))[0].access).toBe('missing');
      const [other] = await svc(`select id from class_session where class_id = $1 limit 1`, [CLASS.streetSeniors]);
      expect((await q(T.SESSION_ACCESS, [other.id]))[0].access).toBe('not_yours');
      const [own] = await svc(`select id from class_session where class_id = $1 limit 1`, [CLASS.juniorTap]);
      expect((await q(T.SESSION_ACCESS, [own.id]))[0].access).toBe('ok');
    });
  });

  it('"attendance this term" ignores registers from before the term', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const before = await q(T.MY_STUDENTS);
      const kid = before.find((s: any) => s.attendance_pct != null);
      const [{ start }] = await svc(`select app.current_term_start($1) start`, [STUDIO_ID]);
      // A register from last term, all absent.
      const [old] = await svc(`insert into class_session (studio_id, class_id, starts_at, ends_at)
                               values ($1, $2, $3::date - interval '30 days' + interval '16 hours', $3::date - interval '30 days' + interval '17 hours')
                               returning id`, [STUDIO_ID, CLASS.juniorTap, start]);
      await svc(`insert into attendance_record (studio_id, session_id, student_id, status) values ($1, $2, $3, 'absent')`, [STUDIO_ID, old.id, kid.id]);
      const after = await q(T.MY_STUDENTS);
      expect(after.find((s: any) => s.id === kid.id).attendance_pct).toBe(kid.attendance_pct);
    });
  });
});
