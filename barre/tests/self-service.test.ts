import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const myKid = async (q: any) => (await q(`select id, first_name from student order by date_of_birth desc limit 1`))[0];
// Every seeded Wright child is already in each class their age allows. These
// tests are about the request flow, not age limits (UR-06 has its own tests),
// so the chosen class is opened to all ages inside the rolled-back transaction.
const anyAge = (svc: any, cls: string) => svc(`update class set age_min = null, age_max = null where id = $1`, [cls]);
const notIn = async (svc: any, kid: string, full: boolean) => {
  const id = (await svc(
  `select c.id from class c where c.deleted_at is null and c.visibility <> 'private'
     and ${full ? '' : 'not'} (app.class_enrolled_count(c.id) >= c.capacity)
     and not exists (select 1 from enrolment e where e.class_id = c.id and e.student_id = $1 and e.status = 'active') limit 1`, [kid]))[0]?.id;
  if (id) await anyAge(svc, id);
  return id;
};

describe('a parent asks for a class place (R-014)', () => {
  it('the office approves in one step: a place if there is one', async () => {
    let req = '';
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await myKid(q);
      const cls = await notIn(svc, kid.id, false);
      [{ id: req }] = await q(`select app.request_class_place($1, $2, null) id`, [kid.id, cls]);
      expect(await expectRejected(() => q(`select app.request_class_place($1, $2, null)`, [kid.id, cls]))).toMatch(/already asked/);
      const told = await svc(`select 1 from notification where kind = 'request' and title like 'Place for%'`);
      expect(told.length).toBeGreaterThan(0);
      // …and the office approves inside the same rolled-back test transaction:
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      expect((await q(`select app.approve_class_request($1) o`, [req]))[0].o).toBe('enrolled');
      expect(await q(`select 1 from enrolment where student_id = $1 and class_id = $2 and status = 'active'`, [kid.id, cls])).toHaveLength(1);
    });
  });

  it('a full class puts the child on the waiting list instead', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await myKid(q);
      await anyAge(svc, CLASS.grade3Ballet);
      const [{ id }] = await q(`select app.request_class_place($1, $2, null) id`, [kid.id, CLASS.grade3Ballet]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      expect((await q(`select app.approve_class_request($1) o`, [id]))[0].o).toBe('waitlisted');
    });
  });

  it('a parent cannot ask for someone else’s child, nor approve their own request', async () => {
    await asUser(USERS.guardianB, async (q, svc) => {
      const [other] = await svc(`select s.id from student s join guardian g on g.family_id = s.family_id where g.user_id = $1 limit 1`, [USERS.guardianA]);
      expect(await expectRejected(() => q(`select app.request_class_place($1, $2)`, [other.id, CLASS.juniorTap]))).toMatch(/not your child/);
      const kid = await myKid(q);
      const cls = await notIn(svc, kid.id, false);
      const [{ id }] = await q(`select app.request_class_place($1, $2) id`, [kid.id, cls]);
      expect(await expectRejected(() => q(`select app.approve_class_request($1)`, [id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('a parent adds a child (R-014)', () => {
  it('goes to the office, who adds them with the parent as emergency contact', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(`select app.request_new_child($1::jsonb) id`, [JSON.stringify({ first_name: 'Ivy', date_of_birth: '2021-06-01' })]);
      expect(await q(`select 1 from student where first_name = 'Ivy'`)).toHaveLength(0);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      const [{ kid }] = await q(`select app.approve_new_child($1) kid`, [id]);
      const [s] = await q(`select s.last_name, (select count(*)::int from emergency_contact e where e.student_id = s.id) contacts
                             from student s where s.id = $1`, [kid]);
      expect(s).toEqual({ last_name: 'Wright', contacts: 1 });
    });
  });
  it('refuses an impossible date of birth', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(`select app.request_new_child($1::jsonb)`, [JSON.stringify({ first_name: 'X', date_of_birth: '2099-01-01' })])))
        .toMatch(/does not look right/);
    });
  });
});

describe('a parent books a trial or joins a waiting list (R-014)', () => {
  it('books straight in, once, and it is on the register', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await myKid(q);
      const cls = await notIn(svc, kid.id, false);
      await svc(`update class set trial_needs_approval = false, trials_enabled = true where id = $1`, [cls]);
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now() and status = 'scheduled' order by starts_at limit 1`, [cls]);
      expect((await q(`select app.parent_book_trial($1, $2) r`, [s.id, kid.id]))[0].r).toBe('booked');
      expect(await expectRejected(() => q(`select app.parent_book_trial($1, $2)`, [s.id, kid.id]))).toMatch(/already has a trial/);
      expect(await svc(`select 1 from trial where session_id = $1 and student_id = $2 and status = 'booked'`, [s.id, kid.id])).toHaveLength(1);
    });
  });
  it('a class needing approval sends a request instead; the office books it', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await myKid(q);
      const cls = await notIn(svc, kid.id, false);
      await svc(`update class set trial_needs_approval = true, trials_enabled = true where id = $1`, [cls]);
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now() and status = 'scheduled' order by starts_at limit 1`, [cls]);
      expect((await q(`select app.parent_book_trial($1, $2) r`, [s.id, kid.id]))[0].r).toBe('requested');
      const [r] = await q(`select id from studio_request where action = 'trial' and student_id = $1`, [kid.id]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      await q(`select app.approve_trial_request($1)`, [r.id]);
      expect(await svc(`select 1 from trial where session_id = $1 and student_id = $2`, [s.id, kid.id])).toHaveLength(1);
    });
  });
  it('joins the waiting list of a full class, but not one with space', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await myKid(q);
      await anyAge(svc, CLASS.grade3Ballet);
      const pos = (await q(`select app.parent_join_waitlist($1, $2) p`, [CLASS.grade3Ballet, kid.id]))[0].p;
      expect(pos).toBeGreaterThan(8);
      const open = await notIn(svc, kid.id, false);
      expect(await expectRejected(() => q(`select app.parent_join_waitlist($1, $2)`, [open, kid.id]))).toMatch(/has a place/);
    });
  });
});

describe('the public trial page (R-014)', () => {
  it('lists sessions with room, and a prospect books onto the register', async () => {
    await asUser(null as any, async (q, svc) => {
      const [{ slug }] = await svc(`select slug from studio where id = $1`, [STUDIO_ID]);
      const list = await q(`select * from app.public_trial_sessions($1)`, [slug]);
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((r: any) => r.places_left > 0)).toBe(true);
      const form = { contact_name: 'Sam Patel', contact_email: 'sam@example.com', contact_phone: '07700 900800',
                     child_name: 'Asha Patel', child_dob: '2018-03-03', privacy_ack: true };
      // A class whose age range suits the child (classes are age-limited, so "the first one" depends on the date).
      const [fit] = await svc(`select cs.id from class_session cs join class c on c.id = cs.class_id
                                where cs.id = any($1) and coalesce(c.age_min, 0) <= extract(year from age(date '2018-03-03'))
                                  and coalesce(c.age_max, 99) >= extract(year from age(date '2018-03-03'))
                                order by cs.starts_at limit 1`, [list.map((r: any) => r.session_id)]);
      expect(fit).toBeTruthy();
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, fit.id, JSON.stringify(form)]);
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, fit.id, JSON.stringify(form)]);   // double click
      const trials = await svc(`select t.student_id, e.source from trial t join enquiry e on e.id = t.enquiry_id where e.contact_email = 'sam@example.com'`);
      expect(trials).toHaveLength(1);
      expect(trials[0].source).toBe('website');
      expect(trials[0].student_id).toBeTruthy();
      // A bot fills the honeypot: nothing is created.
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, fit.id, JSON.stringify({ ...form, contact_email: 'bot@x.io', website: 'http://spam' })]);
      expect(await svc(`select 1 from enquiry where contact_email = 'bot@x.io'`)).toHaveLength(0);
    });
  });
  it('an anonymous visitor still cannot read anything else', async () => {
    await asUser(null as any, async q => {
      expect(await q(`select 1 from student`)).toHaveLength(0);
      expect(await q(`select 1 from enquiry`)).toHaveLength(0);
      await expectRejected(() => q(`select app.request_class_place($1, $2)`, [CLASS.juniorTap, CLASS.juniorTap]));
    });
  });
});

describe('answers reach the family', () => {
  it('approving a request notifies the parent', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(`select app.request_new_child($1::jsonb) id`, [JSON.stringify({ first_name: 'Rae', date_of_birth: '2020-02-02' })]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      await q(`select app.approve_new_child($1)`, [id]);
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'request_answered' and title like '%Rae%'`, [USERS.guardianA])).toHaveLength(1);
    });
  });
});
