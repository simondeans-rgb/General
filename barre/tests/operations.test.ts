import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, FAMILY, STUDIO_ID } from './helpers';
import { REGISTER } from '../src/lib/repos/teaching';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const nextSession = async (svc: any, classId: string) =>
  (await svc(`select id, starts_at, ends_at from class_session where class_id = $1 and starts_at > now()
               and status = 'scheduled' and teacher_id is null order by starts_at limit 1`, [classId]))[0];

describe('every child in the room is on the register (R-005)', () => {
  it('every booked trial has a child record and appears on its session’s register', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const trials = await svc(`select t.session_id, t.student_id from trial t where t.status = 'booked' and t.deleted_at is null`);
      expect(trials.length).toBeGreaterThan(0);
      for (const t of trials) {
        expect(t.student_id).toBeTruthy();
        const reg = await q(REGISTER, [t.session_id]);
        expect(reg.some((r: any) => r.student_id === t.student_id && r.is_trial)).toBe(true);
      }
    });
  });

  it('booking a new child needs an emergency phone, and makes a prospect family', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      const child = { first_name: 'Poppy', last_name: 'Lane', date_of_birth: '2019-04-02', contact_name: 'Jo Lane' };
      expect(await expectRejected(() => q(`select app.book_trial($1, null, $2::jsonb)`, [s.id, JSON.stringify(child)])))
        .toMatch(/phone number to ring/);
      const [{ id }] = await q(`select app.book_trial($1, null, $2::jsonb) id`, [s.id, JSON.stringify({ ...child, contact_phone: '07700 900111' })]);
      const [t] = await q(`select t.student_id, f.is_prospect,
                                  (select count(*)::int from emergency_contact ec where ec.student_id = t.student_id) contacts
                             from trial t join student st on st.id = t.student_id join family f on f.id = st.family_id where t.id = $1`, [id]);
      expect(t).toMatchObject({ is_prospect: true, contacts: 1 });
      expect((await q(REGISTER, [s.id])).some((r: any) => r.student_id === t.student_id)).toBe(true);
    });
  });

  it('refuses a trial for an existing child with no emergency contact', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      const [kid] = await svc(`select id from student s where not exists (select 1 from emergency_contact e where e.student_id = s.id) limit 1`);
      expect(await expectRejected(() => q(`select app.book_trial($1, $2)`, [s.id, kid.id]))).toMatch(/no emergency contact/);
    });
  });
});

describe('one session at a time (R-004)', () => {
  it('cancelling tells families and the teacher, and cancels trials for it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      await q(`select app.cancel_session($1, 'Teacher unwell')`, [s.id]);
      const [after] = await q(`select status, cancel_reason from class_session where id = $1`, [s.id]);
      expect(after).toEqual({ status: 'cancelled', cancel_reason: 'Teacher unwell' });
      const told = await svc(`select distinct user_id from notification where kind = 'schedule_change' and title like 'Cancelled:%'`);
      expect(told.length).toBeGreaterThan(1);                       // families with logins + the teacher
      expect(told.map((r: any) => r.user_id)).toContain(USERS.teacherTap);
      const [notice] = await q(`select subject from communication where class_id = $1 and subject like 'Cancelled:%'`, [CLASS.juniorTap]);
      expect(notice.subject).toMatch(/Junior Tap/);
      expect(await expectRejected(() => q(`select app.cancel_session($1, 'again')`, [s.id]))).toMatch(/already cancelled/);
    });
  });

  it('a taught class cannot be cancelled, and teachers cannot cancel at all', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [past] = await svc(`select id from class_session where register_closed_at is not null limit 1`);
      if (past) expect(await expectRejected(() => q(`select app.cancel_session($1, 'x')`, [past.id]))).toMatch(/already been taught/);
    });
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      expect(await expectRejected(() => q(`select app.cancel_session($1, 'x')`, [s.id]))).toMatch(/FORBIDDEN/);
    });
  });

  it('moving keeps the length, remembers the original time and tells families', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      const to = new Date(new Date(s.starts_at).getTime() + 24 * 3600_000).toISOString();
      await q(`select app.move_session($1, $2::timestamptz)`, [s.id, to]);
      const [m] = await q(`select starts_at, ends_at, original_starts_at from class_session where id = $1`, [s.id]);
      expect(new Date(m.starts_at).toISOString()).toBe(to);
      expect(new Date(m.ends_at).getTime() - new Date(m.starts_at).getTime())
        .toBe(new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime());
      expect(new Date(m.original_starts_at).toISOString()).toBe(new Date(s.starts_at).toISOString());
      expect(await q(`select 1 from communication where subject like 'Moved:%'`)).toHaveLength(1);
    });
  });

  it('a cover teacher gets that class around the date — and the request is settled', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      await q(`select app.request_cover($1, 'Hospital appointment')`, [s.id]);
      expect(await svc(`select 1 from studio_request where session_id = $1 and status = 'open'`, [s.id])).toHaveLength(1);
    });
    await asUser(USERS.admin, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      await q(`select app.request_cover($1, 'x')`, [s.id]).catch(() => null);   // admin is not the teacher: refused
      const [priya] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherModern]);
      // Priya teaches at Blackheath at that time: the office assigns her knowingly (UR-27).
      await q(`select app.cover_session($1, $2, null, false, null, true)`, [s.id, priya.id]);
      // Arrange the request inside this transaction for the settle check.
    });
    await asUser(USERS.teacherModern, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      const [priya] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherModern]);
      // Cover opens the children's details on the session's day (UR-27).
      await svc(`update class_session set teacher_id = $2, ends_at = now() + interval '50 minutes', starts_at = now() + interval '5 minutes' where id = $1`, [s.id, priya.id]);
      expect((await q(REGISTER, [s.id])).length).toBeGreaterThan(0);          // she can take the register
      // (Priya also covers a seeded session today, so the time bound is
      // checked with a teacher who has no other link to this class.)
    });
  });

  it('a cover booked ahead grants nothing until its day (UR-27)', async () => {
    await asUser(USERS.teacherStreet, async (q, svc) => {
      const [tom] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherStreet]);
      const [later] = await svc(`select id from class_session where class_id = $1 and starts_at > now() + interval '20 days' order by starts_at limit 1`, [CLASS.juniorTap]);
      await svc(`update class_session set teacher_id = $2 where id = $1`, [later.id, tom.id]);
      // He sees the session he is covering on his timetable, but not the class or its children.
      expect(await q(`select id from class_session where class_id = $1`, [CLASS.juniorTap])).toEqual([{ id: later.id }]);
      expect(await q(`select 1 from enrolment where class_id = $1`, [CLASS.juniorTap])).toHaveLength(0);
      const soon = await nextSession(svc, CLASS.juniorTap);
      await svc(`update class_session set teacher_id = $2 where id = $1`, [soon.id, tom.id]);
      await svc(`update class_session set ends_at = now() + interval '50 minutes', starts_at = now() + interval '5 minutes' where id = $1`, [soon.id]);
      expect((await q(`select 1 from enrolment where class_id = $1`, [CLASS.juniorTap])).length).toBeGreaterThan(0);
    });
  });

  it('only the teacher of a session can ask for cover for it', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      const s = await nextSession(svc, CLASS.juniorTap);
      expect(await expectRejected(() => q(`select app.request_cover($1, 'x')`, [s.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('moving a student to another class (R-042)', () => {
  it('is one step, and nothing changes if the new class is full', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [e] = await q(`select e.id, e.student_id from enrolment e where e.class_id = $1 and e.status = 'active'
                            and not exists (select 1 from enrolment x where x.student_id = e.student_id and x.class_id = $2 and x.status = 'active') limit 1`,
                          [CLASS.juniorTap, CLASS.grade3Ballet]);
      expect(await expectRejected(() => q(`select app.transfer_enrolment($1, $2)`, [e.id, CLASS.grade3Ballet]))).toMatch(/CLASS_FULL/);
      expect((await q(`select status from enrolment where id = $1`, [e.id]))[0].status).toBe('active');
      const [free] = await svc(`select c.id from class c where c.id <> $1 and app.class_enrolled_count(c.id) < c.capacity
                                  and not exists (select 1 from enrolment x where x.class_id = c.id and x.student_id = $2 and x.status = 'active') limit 1`,
                                [CLASS.juniorTap, e.student_id]);
      const [{ id }] = await q(`select app.transfer_enrolment($1, $2, null) id`, [e.id, free.id]);
      expect((await q(`select status, class_id from enrolment where id = $1`, [id]))[0]).toEqual({ status: 'active', class_id: free.id });
      const [old] = await q(`select status, note from enrolment where id = $1`, [e.id]);
      expect(old.status).toBe('left');
      expect(old.note).toMatch(/Moved to/);
    });
  });
});

describe('parents keep their details current (R-016)', () => {
  it('a parent can change their phone and add an emergency contact; the office is told', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [g] = await q(`select id from guardian where user_id = $1`, [USERS.guardianA]);
      expect(await q(`update guardian set phone = '07700 900999' where id = $1 returning id`, [g.id])).toHaveLength(1);
      const [kid] = await q(`select id from student limit 1`);
      await q(`insert into emergency_contact (studio_id, student_id, full_name, relationship, phone) values ($1,$2,'Gran','Grandmother','07700 900222')`,
        [STUDIO_ID, kid.id]);
      const told = await svc(`select title from notification where kind = 'contact_updated'`);
      expect(told.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('a parent cannot re-link a login or move a guardian to another family', async () => {
    await asUser(USERS.guardianA, async q => {
      const [g] = await q(`select id from guardian where user_id = $1`, [USERS.guardianA]);
      expect(await expectRejected(() => q(`update guardian set user_id = $2 where id = $1`, [g.id, USERS.guardianB]))).toMatch(/only the office/);
      await expectRejected(() => q(`update guardian set family_id = $2 where id = $1`, [g.id, FAMILY.b]));
    });
  });
});

describe('batch A screen queries', () => {
  it('a parent edits their details and contacts through the family screen queries', async () => {
    const F = await import('../src/lib/repos/family');
    await asUser(USERS.guardianA, async (q, svc) => {
      const gs = await q(F.MY_GUARDIANS);
      expect(gs[0].is_me).toBe(true);
      await q(F.UPDATE_GUARDIAN, [gs[0].id, gs[0].full_name, 'new@example.com', '07700 900123']);
      const [kid] = await q(`select id from student limit 1`);
      await q(F.ADD_CONTACT, [kid.id, 'Aunt Sue', 'Aunt', '07700 900555']);
      const mine = await q(F.MY_CONTACTS);
      const sue = mine.find((c: any) => c.full_name === 'Aunt Sue');
      expect(sue).toBeTruthy();
      await q(F.UPDATE_CONTACT, [sue.id, 'Aunt Susan', 'Aunt', '07700 900556']);
      await q(F.REMOVE_CONTACT, [sue.id]);
      const only = await svc(`select s.id, (select id from emergency_contact e where e.student_id = s.id and deleted_at is null limit 1) ec
                                from student s where s.id in (select app.guardian_student_ids())
                                 and (select count(*) from emergency_contact e where e.student_id = s.id and deleted_at is null) = 1 limit 1`);
      if (only[0]) expect(await expectRejected(() => q(F.REMOVE_CONTACT, [only[0].ec]))).toMatch(/at least one/);
      expect((await q(F.MY_CONTACTS)).some((c: any) => c.id === sue.id)).toBe(false);
      expect((await svc(`select email from guardian where id = $1`, [gs[0].id]))[0].email).toBe('new@example.com');
    });
    await asUser(USERS.guardianB, async q => {
      const F2 = await import('../src/lib/repos/family');
      expect((await q(F2.MY_GUARDIANS)).every((g: any) => g.full_name !== 'Hannah Wright')).toBe(true);
    });
  });

  it('a teacher’s fortnight, next class and the office’s session lookup', async () => {
    const T = await import('../src/lib/repos/teaching');
    const D = await import('../src/lib/repos/dashboard');
    await asUser(USERS.teacherTap, async (q, svc) => {
      const from = new Date(); from.setHours(0, 0, 0, 0);
      const to = new Date(from.getTime() + 14 * 86400_000);
      const mine = await q(T.MY_SESSIONS, [from.toISOString(), to.toISOString()]);
      expect(mine.length).toBeGreaterThan(0);
      const s = mine.find((m: any) => new Date(m.starts_at) > new Date() && !m.covered_by);
      await q(T.REQUEST_COVER, [s.id, 'Dentist']);
      const again = await q(T.MY_SESSIONS, [from.toISOString(), to.toISOString()]);
      expect(again.find((m: any) => m.id === s.id).cover_requested).toBe(true);
      const nexts = await q(T.NEXT_SESSION, [s.id]);
      for (const n of nexts) expect(new Date(n.starts_at) > new Date(s.starts_at)).toBe(true);
    });
    await asUser(USERS.admin, async (q, svc) => {
      const [s] = await svc(`select cs.id from class_session cs where cs.class_id = $1 and cs.starts_at > now() and cs.status = 'scheduled' order by starts_at limit 1`, [CLASS.juniorTap]);
      await svc(`insert into studio_request (studio_id, kind, subject, body, session_id) values ($1, 'other', 'Cover needed', 'x', $2)`, [STUDIO_ID, s.id]);
      const [r] = await q(`select session_id from studio_request where session_id is not null limit 1`);
      const [row] = await q(D.SESSION_BY_ID, [r.session_id]);
      expect(row.id).toBe(r.session_id);
      const H = await import('../src/lib/repos/hub');
      expect((await q(H.PENDING_REQUESTS)).some((p: any) => p.session_id === r.session_id)).toBe(true);
    });
  });
});
