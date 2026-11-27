import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, CLASS, STUDIO_ID, uid, NS } from './helpers';
import * as F from '../src/lib/repos/family';
import * as I from '../src/lib/repos/inbox';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/* Every test runs in one rolled-back transaction and changes who it is by
   setting the claims, so a whole journey (invite, accept, use) fits in one. */
type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const as = (svc: Q, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

const HANNAH_ROW = uid(NS.guardian, 1);
const INES_ROW = uid(NS.guardian, 2);            // second Wright guardian, no login
const EMMA_ROW = uid(NS.guardian, 5);            // second Doherty guardian, no login
const ADULT_CLASS = uid(NS.class, 191);          // Adult Contemporary (drop-in), 18+
const CONTEMPORARY = uid(NS.class, 8);           // Contemporary Seniors, 13–18

async function invite(q: Q, svc: Q, email: string, role: string, family: string | null = null, student: string | null = null) {
  await as(svc, USERS.admin);
  const [{ t }] = await q(`select app.create_invitation($1, $2, $3::app_role, null, $4, $5) t`, [STUDIO_ID, email, role, family, student]);
  return t as string;
}
async function accept(q: Q, svc: Q, token: string, name = 'New Person') {
  const me = randomUUID();
  await as(svc, me);
  const [r] = await q(`select * from app.accept_invitation($1, $2)`, [token, name]);
  return { me, role: r.role as string };
}
const nextDropIn = async (svc: Q, n = 0) =>
  (await svc(`select d.session_id from app.drop_in_sessions($1) d order by d.starts_at offset $2 limit 1`, [STUDIO_ID, n]))[0].session_id as string;

/* ── UR-03 ─────────────────────────────────────────────────────────────── */
describe('invitations link the guardian record the office already holds (UR-03)', () => {
  it('a second parent on file accepts, is linked to their own row, and sees the children', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
      const { me, role } = await accept(q, svc, token, 'Inês Wright');
      expect(role).toBe('guardian');
      const rows = await svc(`select id, user_id from guardian where family_id = $1 and lower(email) = 'second.wright@example.com'`, [FAMILY.a]);
      expect(rows).toEqual([{ id: INES_ROW, user_id: me }]);   // linked, not duplicated
      expect((await q(F.MY_CHILDREN)).map((c: any) => c.first_name).sort()).toEqual(['Amir', 'Clara', 'Nia']);
    });
  });

  it('matches the email whatever its case', async () => {
    await asUser(null, async (q, svc) => {
      await svc(`update guardian set email = 'Second.Wright@Example.COM' where id = $1`, [INES_ROW]);
      const token = await invite(q, svc, 'SECOND.wright@example.com', 'guardian', FAMILY.a);
      const { me } = await accept(q, svc, token);
      expect((await svc(`select user_id from guardian where id = $1`, [INES_ROW]))[0].user_id).toBe(me);
      expect(await svc(`select 1 from guardian where family_id = $1`, [FAMILY.a])).toHaveLength(2);
    });
  });

  it('refuses two unlinked rows with the same email, and tells the person to ask the office', async () => {
    await asUser(null, async (q, svc) => {
      await svc(`insert into guardian (studio_id, family_id, full_name, email) values ($1, $2, 'Inês W', 'second.wright@example.com')`, [STUDIO_ID, FAMILY.a]);
      const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
      expect(await expectRejected(() => accept(q, svc, token))).toMatch(/two records with this email.*office/);
    });
  });

  it('refuses an email that belongs to a guardian in another family', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'second.doherty@example.com', 'guardian', FAMILY.a);
      expect(await expectRejected(() => accept(q, svc, token))).toMatch(/another family/);
      expect((await svc(`select user_id from guardian where id = $1`, [EMMA_ROW]))[0].user_id).toBeNull();
    });
  });

  it('never re-links a row that already belongs to someone else', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'hannah.wright@example.com', 'guardian', FAMILY.a);
      expect(await expectRejected(() => accept(q, svc, token))).toMatch(/already has an account.*office/);
      expect((await svc(`select user_id from guardian where id = $1`, [HANNAH_ROW]))[0].user_id).toBe(USERS.guardianA);
    });
  });

  it('an invitation is single-use', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
      await accept(q, svc, token);
      expect(await expectRejected(() => accept(q, svc, token))).toMatch(/already been used/);
    });
  });

  it('a new email still gets a new guardian row', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'daniel.wright@example.com', 'guardian', FAMILY.a);
      const { me } = await accept(q, svc, token, 'Daniel Wright');
      expect(await svc(`select 1 from guardian where family_id = $1 and user_id = $2 and full_name = 'Daniel Wright'`, [FAMILY.a, me])).toHaveLength(1);
    });
  });

  it('the guard still refuses a parent linking, moving or deleting a row directly — even with the setting forged', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const stranger = randomUUID();
      await svc(`insert into user_account (id, email, full_name) values ($1, 'x@example.com', 'X')`, [stranger]);
      await q(`select set_config('app.accepting_invitation', $1, true)`, [HANNAH_ROW]);
      for (const set of [`user_id = '${stranger}'`, `user_id = null`, `family_id = '${FAMILY.b}'`,
                         `studio_id = studio_id, deleted_at = now()`]) {
        expect(await expectRejected(() => q(`update guardian set ${set} where id = $1`, [HANNAH_ROW]))).toMatch(/FORBIDDEN|row-level/);
      }
    });
  });

  it('an adult who booked publicly can be invited and accept (students D2)', async () => {
    await asUser(null, async (q, svc) => {
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [await nextDropIn(svc), JSON.stringify({
        name: 'Sam Adler', email: 'sam.adler@example.com', phone: '07700 900500', emergency_phone: '07700 900501',
        privacy_ack: true, adult_confirm: true })]);
      const [fam] = await svc(`select family_id from guardian where email = 'sam.adler@example.com'`);
      const token = await invite(q, svc, 'sam.adler@example.com', 'guardian', fam.family_id);
      const { me } = await accept(q, svc, token, 'Sam Adler');
      expect(await svc(`select 1 from guardian where family_id = $1 and user_id = $2`, [fam.family_id, me])).toHaveLength(1);
      expect(await svc(`select 1 from guardian where family_id = $1`, [fam.family_id])).toHaveLength(1);
    });
  });
});

/* ── UR-05 ─────────────────────────────────────────────────────────────── */
describe('guardians edit only their own details (UR-05)', () => {
  async function daniel(q: Q, svc: Q) {
    const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
    return (await accept(q, svc, token, 'Inês Wright')).me;
  }

  it('the second guardian cannot change the first guardian’s row; the database refuses', async () => {
    await asUser(null, async (q, svc) => {
      await daniel(q, svc);
      const changed = await q(`update guardian set email = 'changed@example.com' where id = $1 returning id`, [HANNAH_ROW]);
      expect(changed).toHaveLength(0);
      expect((await svc(`select email from guardian where id = $1`, [HANNAH_ROW]))[0].email).toBe('hannah.wright@example.com');
      const mine = await q(F.MY_GUARDIANS);
      expect(mine.find((g: any) => g.id === HANNAH_ROW).is_me).toBe(false);
    });
  });

  it('editing your own phone works, and the office is told', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(F.UPDATE_GUARDIAN, [HANNAH_ROW, 'Hannah Wright', 'hannah.wright@example.com', '07700 111222']);
      expect((await svc(`select phone from guardian where id = $1`, [HANNAH_ROW]))[0].phone).toBe('07700 111222');
      expect(await svc(`select 1 from notification where kind = 'contact_updated'`)).not.toHaveLength(0);
    });
  });

  it('a guardian cannot make themselves primary, take billing, or change a relationship', async () => {
    await asUser(null, async (q, svc) => {
      await daniel(q, svc);
      for (const set of ['is_primary = not is_primary', 'receives_billing = not receives_billing', `relationship = 'Mother'`]) {
        expect(await expectRejected(() => q(`update guardian set ${set} where id = $1`, [INES_ROW]))).toMatch(/FORBIDDEN/);
      }
    });
  });

  it('an unlinked guardian row is the office’s to edit', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await q(`update guardian set phone = '000' where id = $1 returning id`, [INES_ROW])).toHaveLength(0);
    });
    await asUser(USERS.admin, async q => {
      expect(await q(`update guardian set phone = '07700 000001', is_primary = true where id = $1 returning id`, [INES_ROW])).toHaveLength(1);
    });
  });

  it('“Ask the office to change” raises a request', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(`select app.ask_to_change_guardian($1, 'New mobile is 07700 123123')`, [INES_ROW]);
      const [r] = await svc(`select subject, body, raised_by from studio_request where subject like 'Change details for%'`);
      expect(r).toMatchObject({ subject: 'Change details for Inês Wright', raised_by: USERS.guardianA });
      expect(await expectRejected(() => q(`select app.ask_to_change_guardian($1, 'x')`, [uid(NS.guardian, 3)]))).toMatch(/FORBIDDEN/);
    });
  });
});

/* ── UR-06 / UR-54 ─────────────────────────────────────────────────────── */
describe('public adult drop-ins book the adult; age limits hold on every path (UR-06)', () => {
  const hannahForm = { name: 'Hannah Wright', email: 'Hannah.Wright@example.com', phone: '07700 900001',
                       emergency_phone: '07700 900002', privacy_ack: true, adult_confirm: true };

  it('the students-15 repro books Hannah, not Amir, and says how it was matched', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc);
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify(hannahForm)]);
      const [b] = await svc(`select st.first_name, st.is_adult, st.self_guardian_id, st.family_id, d.source_note,
                                    (select string_agg(description, ',') from invoice_item where invoice_id = d.invoice_id) item
                               from drop_in_booking d join student st on st.id = d.student_id where d.session_id = $1`, [s]);
      expect(b).toMatchObject({ first_name: 'Hannah', is_adult: true, self_guardian_id: HANNAH_ROW, family_id: FAMILY.a });
      expect(b.source_note).toBe('Booked by public form; matched to existing family Wright family');
      expect(b.item).toMatch(/Hannah$/);
      // A second booking reuses the same adult record.
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [await nextDropIn(svc, 1), JSON.stringify(hannahForm)]);
      expect(await svc(`select 1 from student where self_guardian_id = $1`, [HANNAH_ROW])).toHaveLength(1);
      expect(await svc(`select 1 from drop_in_booking d join student st on st.id = d.student_id where st.first_name = 'Amir'`)).toHaveLength(0);
    });
  });

  it('two adults in one family keep separate records', async () => {
    await asUser(null, async (q, svc) => {
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [await nextDropIn(svc), JSON.stringify(hannahForm)]);
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [await nextDropIn(svc), JSON.stringify({
        ...hannahForm, name: 'Inês Wright', email: 'second.wright@example.com' })]);
      const adults = await svc(`select self_guardian_id from student where is_adult and family_id = $1 order by first_name`, [FAMILY.a]);
      expect(adults.map((a: any) => a.self_guardian_id)).toEqual([HANNAH_ROW, INES_ROW]);
    });
  });

  it('an adult class needs an 18+ confirmation or a date of birth, and refuses an under-18', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc);
      const form = { name: 'Teen Person', email: 'teen@example.com', phone: '07700 900300', emergency_phone: '07700 900301', privacy_ack: true };
      expect(await expectRejected(() => q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify(form)])))
        .toMatch(/confirm you are 18 or over/);
      const dob = new Date(Date.now() - 15 * 365.25 * 864e5).toISOString().slice(0, 10);
      expect(await expectRejected(() => q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify({ ...form, date_of_birth: dob })])))
        .toMatch(/Teen is 15, and Adult Contemporary \(drop-in\) is for ages 18 and over/);
    });
  });

  it('a parent cannot book a child into an adult drop-in, nor ask for, trial or wait for a class outside the age range', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [amir] = await q(`select id from student where first_name = 'Amir'`);
      const [clara] = await q(`select id from student where first_name = 'Clara'`);
      expect(await expectRejected(async () => q(F.BOOK_DROP_IN, [await nextDropIn(svc), amir.id])))
        .toMatch(/Amir is 15, and Adult Contemporary \(drop-in\) is for ages 18 and over/);
      // UR-54: the request for a place is refused up front.
      expect(await expectRejected(() => q(F.REQUEST_PLACE, [clara.id, CLASS.grade3Ballet, null]))).toMatch(/Clara is 5, and Grade 3 Ballet is for ages 9–12/);
      const [sess] = await svc(`select id from class_session where class_id = $1 and starts_at > now() + interval '1 day' and status = 'scheduled' order by starts_at limit 1`, [CONTEMPORARY]);
      await svc(`update class set trial_needs_approval = false where id = $1`, [CONTEMPORARY]);
      expect(await expectRejected(() => q(F.BOOK_TRIAL, [sess.id, clara.id]))).toMatch(/Clara is 5/);
      await svc(`update class set capacity = 1 where id = $1`, [CONTEMPORARY]);
      expect(await expectRejected(() => q(F.JOIN_WAITLIST, [CONTEMPORARY, clara.id]))).toMatch(/Clara is 5/);
    });
  });

  it('the office cannot put an under-18 in an adult class, but may place a child just outside a children’s range', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [amir] = await svc(`select id from student where first_name = 'Amir' and family_id = $1`, [FAMILY.a]);
      expect(await expectRejected(() => q(`insert into enrolment (studio_id, class_id, student_id) values ($1, $2, $3)`, [STUDIO_ID, ADULT_CLASS, amir.id])))
        .toMatch(/Amir is 15, and Adult Contemporary/);
      expect(await expectRejected(async () => q(`select app.book_drop_in($1, $2)`, [await nextDropIn(svc), amir.id]))).toMatch(/ages 18 and over/);
      const [nia] = await svc(`select id from student where first_name = 'Nia' and family_id = $1`, [FAMILY.a]);
      expect(await q(`insert into enrolment (studio_id, class_id, student_id) values ($1, $2, $3) returning id`, [STUDIO_ID, CLASS.juniorTap, nia.id])).toHaveLength(1);
    });
  });

  it('a public trial for a child of the wrong age is refused', async () => {
    await asUser(null, async (q, svc) => {
      const [slot] = await q(`select * from app.public_trial_sessions('northstar') where age_min >= 9 order by starts_at limit 1`);
      const r = await expectRejected(() => q(`select app.public_book_trial('northstar', $1, $2::jsonb)`, [slot.session_id, JSON.stringify({
        contact_name: 'Jo', contact_email: 'jo2@example.com', contact_phone: '07700 1', child_name: 'Tiny', child_dob: new Date(Date.now() - 4 * 365.25 * 864e5).toISOString().slice(0, 10), privacy_ack: true })]));
      expect(r).toMatch(/Tiny is 4/);
    });
  });
});

/* ── UR-16 ─────────────────────────────────────────────────────────────── */
describe('parents approve or switch off a teenager’s login (UR-16)', () => {
  const AMIR = uid(NS.user, 40);
  const selfId = async (q: Q) => (await q(`select app.student_self_id() id`))[0].id;

  it('Hannah switches Amir off — his access ends — and on again', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, AMIR);
      expect(await selfId(q)).not.toBeNull();
      await as(svc, USERS.guardianA);
      const [amir] = await q(`select student_id, state from app.my_children_logins() where first_name = 'Amir'`);
      expect(amir.state).toBe('on');
      expect((await q(`select app.set_student_login($1, false) r`, [amir.student_id]))[0].r).toBe('off');
      await as(svc, AMIR);
      expect(await selfId(q)).toBeNull();
      expect(await q(`select id from student`)).toHaveLength(0);
      await as(svc, USERS.guardianA);
      expect((await q(`select state from app.my_children_logins() where first_name = 'Amir'`))[0].state).toBe('off');
      await q(`select app.set_student_login($1, true)`, [amir.student_id]);
      await as(svc, AMIR);
      expect(await selfId(q)).toBe(amir.student_id);
    });
  });

  it('either guardian can switch it off; another family cannot', async () => {
    await asUser(null, async (q, svc) => {
      const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
      await accept(q, svc, token);
      const [amir] = await svc(`select id from student where user_id = $1`, [AMIR]);
      await q(`select app.set_student_login($1, false)`, [amir.id]);
      expect((await svc(`select login_enabled from student where id = $1`, [amir.id]))[0].login_enabled).toBe(false);
      await as(svc, USERS.guardianB);
      expect(await expectRejected(() => q(`select app.set_student_login($1, true)`, [amir.id]))).toMatch(/FORBIDDEN/);
    });
  });

  it('an office invitation waits for a parent’s approval, shown to the family', async () => {
    await asUser(null, async (q, svc) => {
      const [kai] = await svc(`select id from student where first_name = 'Kai' and family_id = $1`, [FAMILY.c]);
      await svc(`update student set user_id = null, login_enabled = false, login_approved_by = null where id = $1`, [kai.id]);
      const token = await invite(q, svc, 'kai@example.com', 'student', null, kai.id);
      await as(svc, USERS.guardianC);
      expect((await q(`select state from app.my_children_logins() where student_id = $1`, [kai.id]))[0].state).toBe('invited');
      const { me, role } = await accept(q, svc, token, 'Kai Doherty');
      expect(role).toBe('student');
      expect(await selfId(q)).toBeNull();                         // not yet
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'student_login'`, [USERS.guardianC])).toHaveLength(1);
      await as(svc, USERS.guardianC);
      expect((await q(`select state from app.my_children_logins() where student_id = $1`, [kai.id]))[0].state).toBe('pending');
      await q(`select app.set_student_login($1, true)`, [kai.id]);
      await as(svc, me);
      expect(await selfId(q)).toBe(kai.id);
    });
  });

  it('a parent can invite their own teenager, whose login then works straight away', async () => {
    await asUser(null, async (q, svc) => {
      const [idris] = await svc(`select id from student where first_name = 'Idris' and family_id = $1`, [FAMILY.b]);
      await svc(`update student set user_id = null, login_enabled = false, login_approved_by = null where id = $1`, [idris.id]);
      await as(svc, USERS.guardianB);
      const [{ t }] = await q(`select app.guardian_invite_student($1, 'idris@example.com') t`, [idris.id]);
      const { me } = await accept(q, svc, t, 'Idris Adeyemi');
      expect(await selfId(q)).toBe(idris.id);
      expect(me).toBeTruthy();
    });
  });

  it('respects the school’s minimum age, which only an owner sets, from 13 to 18', async () => {
    await asUser(null, async (q, svc) => {
      await as(svc, USERS.guardianA);
      const [nia] = await q(`select id from student where first_name = 'Nia'`);
      expect(await expectRejected(() => q(`select app.guardian_invite_student($1, 'nia@example.com')`, [nia.id]))).toMatch(/from age 13/);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(`select app.set_student_login_min_age($1, 16)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.owner);
      expect(await expectRejected(() => q(`select app.set_student_login_min_age($1, 12)`, [STUDIO_ID]))).toMatch(/13 to 18/);
      await q(`select app.set_student_login_min_age($1, 16)`, [STUDIO_ID]);
      await as(svc, USERS.guardianB);
      const [idris] = await q(`select id from student where first_name = 'Idris'`);
      await svc(`update student set user_id = null, login_enabled = false where id = $1`, [idris.id]);
      expect(await expectRejected(() => q(`select app.guardian_invite_student($1, 'idris@example.com')`, [idris.id]))).toMatch(/from age 16/);
      expect((await q(`select state from app.my_children_logins()`))[0].state).toBe('too_young');
    });
  });
});

/* ── UR-17 ─────────────────────────────────────────────────────────────── */
describe('shared care: private messages, restrictions, collection (UR-17)', () => {
  async function second(q: Q, svc: Q) {
    const token = await invite(q, svc, 'second.wright@example.com', 'guardian', FAMILY.a);
    return (await accept(q, svc, token, 'Inês Wright')).me;
  }

  it('each guardian’s messages to the studio are theirs and the office’s; family messages reach both', async () => {
    await asUser(null, async (q, svc) => {
      const other = await second(q, svc);
      await as(svc, USERS.guardianA);
      const [{ id: mine }] = await q(I.SEND_TO_STUDIO, ['New inhaler', 'Please update Nia’s record', null]);
      await as(svc, other);
      expect((await q(I.MY_CONVERSATION)).some((m: any) => m.id === mine)).toBe(false);
      // The office reads it and answers in the thread: still Hannah's only.
      await as(svc, USERS.admin);
      expect((await q(I.CONVERSATION, [FAMILY.a])).some((m: any) => m.id === mine)).toBe(true);
      const [{ id: reply }] = await q(I.SEND_REPLY, [FAMILY.a, 'Thanks, updated', mine]);
      const [{ id: all }] = await q(I.SEND_DIRECT, [FAMILY.a, 'Show', 'Costumes on Friday']);
      expect(await svc(`select user_id from notification where title = 'New message from the studio' and body = 'Thanks, updated'`))
        .toEqual([{ user_id: USERS.guardianA }]);
      await as(svc, other);
      const seen = (await q(I.MY_CONVERSATION)).map((m: any) => m.id);
      expect(seen).toContain(all);
      expect(seen).not.toContain(reply);
      await as(svc, USERS.guardianA);
      expect((await q(I.MY_CONVERSATION)).map((m: any) => m.id)).toEqual(expect.arrayContaining([mine, reply, all]));
    });
  });

  it('a request one guardian raises is private to them and the office', async () => {
    await asUser(null, async (q, svc) => {
      const other = await second(q, svc);
      await as(svc, USERS.guardianA);
      const [nia] = await q(`select id from student where first_name = 'Nia'`);
      await q(`insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
               values ($1, $2, $3, 'medical_update', 'Inhaler', 'New inhaler', auth.uid())`, [STUDIO_ID, FAMILY.a, nia.id]);
      await as(svc, other);
      expect(await q(`select 1 from studio_request where subject = 'Inhaler'`)).toHaveLength(0);
      expect(await q(`select 1 from communication where subject = 'Inhaler'`)).toHaveLength(0);
      await as(svc, USERS.admin);
      expect(await q(`select 1 from studio_request where subject = 'Inhaler'`)).toHaveLength(1);
    });
  });

  it('the office restricts what one guardian sees; the other is unaffected; only the DSL reads the note', async () => {
    await asUser(null, async (q, svc) => {
      const other = await second(q, svc);
      await as(svc, other);
      const before = { inv: (await q(`select id from invoice`)).length, med: (await q(`select id from medical_record`)).length,
                       fb: (await q(`select id from feedback_note`)).length, enr: (await q(`select id from enrolment`)).length };
      expect(before.inv).toBeGreaterThan(0);
      expect(before.med).toBeGreaterThan(0);
      expect(before.enr).toBeGreaterThan(0);
      await expectRejected(() => q(`select app.set_guardian_access($1, '{"see_payments": false}'::jsonb)`, [INES_ROW]));
      await as(svc, USERS.admin);
      await q(`select app.set_guardian_access($1, $2::jsonb, 'Court order 2026/14')`, [INES_ROW,
        JSON.stringify({ see_payments: false, see_medical: false, see_feedback: false, see_schedule: false })]);
      const [a] = await q(`select * from app.guardian_access_for($1)`, [INES_ROW]);
      expect(a).toMatchObject({ see_payments: false, has_note: false, dsl_note: null, can_note: false });   // admin is not the DSL
      await as(svc, USERS.owner);
      await q(`select app.set_guardian_access($1, '{}'::jsonb, 'Court order 2026/14')`, [INES_ROW]);
      expect((await q(`select * from app.guardian_access_for($1)`, [INES_ROW]))[0]).toMatchObject({ has_note: true, dsl_note: 'Court order 2026/14' });
      await as(svc, other);
      for (const t of ['invoice', 'invoice_item', 'payment', 'medical_record', 'feedback_note', 'enrolment']) {
        expect(await q(`select 1 from ${t}`), t).toHaveLength(0);
      }
      expect(await q(F.MY_SCHEDULE, [new Date().toISOString(), new Date(Date.now() + 14 * 864e5).toISOString()])).toHaveLength(0);
      expect((await q(`select * from app.my_access()`))[0]).toMatchObject({ see_payments: false, see_medical: false });
      expect(await expectRejected(() => q(`select dsl_note from guardian_access`))).toMatch(/permission denied/);
      await as(svc, USERS.guardianA);
      expect((await q(`select id from invoice`)).length).toBe(before.inv);
      expect((await q(`select id from medical_record`)).length).toBe(before.med);
    });
  });

  it('“may not be contacted” stops the studio’s notifications to that guardian', async () => {
    await asUser(null, async (q, svc) => {
      const other = await second(q, svc);
      await as(svc, USERS.admin);
      await q(`select app.set_guardian_access($1, '{"may_contact": false}'::jsonb)`, [INES_ROW]);
      await q(I.SEND_DIRECT, [FAMILY.a, 'Hello', 'Term dates']);
      expect(await svc(`select 1 from notification where user_id = $1 and body = 'Term dates'`, [other])).toHaveLength(0);
      expect(await svc(`select 1 from notification where user_id = $1 and body = 'Term dates'`, [USERS.guardianA])).toHaveLength(1);
    });
  });

  it('the collection list: parents add who may collect, the office who may not, and the teacher sees both', async () => {
    await asUser(null, async (q, svc) => {
      await second(q, svc);
      await as(svc, USERS.guardianA);
      const [clara] = await q(`select id from student where first_name = 'Clara'`);
      await q(F.ADD_COLLECTOR, [clara.id, 'Grandma Jo', 'Grandmother', '07700 1']);
      expect(await expectRejected(() => q(`insert into collection_permission (student_id, full_name, allowed) values ($1, 'Someone', false)`, [clara.id])))
        .toMatch(/row-level security/);
      await as(svc, USERS.admin);
      await q(`insert into collection_permission (student_id, full_name, allowed) values ($1, 'Uncle Rob', false)`, [clara.id]);
      await q(`select app.set_guardian_access($1, '{"may_collect": false}'::jsonb)`, [INES_ROW]);
      // Clara is in Junior Tap, taught by Marcus.
      await as(svc, USERS.teacherTap);
      const brief = (await q(`select app.collection_brief($1) c`, [clara.id]))[0].c;
      expect(brief).toEqual([
        { name: 'Grandma Jo', relationship: 'Grandmother', allowed: true },
        { name: 'Inês Wright', relationship: 'Parent', allowed: false },
        { name: 'Uncle Rob', relationship: null, allowed: false },
      ]);
      // The register brief carries it.
      const [{ id: sess }] = await svc(`select id from class_session where class_id = $1 order by starts_at limit 1`, [CLASS.juniorTap]);
      const { REGISTER } = await import('../src/lib/repos/teaching');
      const row = (await q(REGISTER, [sess])).find((r: any) => r.student_id === clara.id);
      expect(row.collection).toHaveLength(3);
      // Another teacher sees nothing; the parent sees only "may collect".
      await as(svc, USERS.teacherStreet);
      expect((await q(`select app.collection_brief($1) c`, [clara.id]))[0].c).toEqual([]);
      await as(svc, USERS.guardianA);
      expect((await q(F.MY_COLLECTORS)).map((c: any) => c.full_name)).toEqual(['Grandma Jo']);
      expect((await q(`select app.collection_brief($1) c`, [clara.id]))[0].c).toHaveLength(1);
    });
  });
});

/* ── UR-21 ─────────────────────────────────────────────────────────────── */
describe('adult student accounts (UR-21)', () => {
  it('Gareth books, accepts an invitation, sees and cancels his booking, and the invoice is voided per policy', async () => {
    await asUser(null, async (q, svc) => {
      const s = await nextDropIn(svc, 2);        // more than 24 hours away
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s, JSON.stringify({
        name: 'Gareth Hughes', email: 'gareth@example.com', phone: '07700 900700', emergency_phone: '07700 900701',
        privacy_ack: true, adult_confirm: true, date_of_birth: '1974-05-01' })]);
      const [st] = await svc(`select id, is_adult, date_of_birth::text dob from student where first_name = 'Gareth'`);
      expect(st).toMatchObject({ is_adult: true, dob: '1974-05-01' });
      // The office invites him to his own login, as a student.
      const token = await invite(q, svc, 'gareth@example.com', 'student', null, st.id);
      const { me, role } = await accept(q, svc, token, 'Gareth Hughes');
      expect(role).toBe('guardian');                         // he manages his own account
      expect((await svc(`select user_id, login_enabled from student where id = $1`, [st.id]))[0]).toEqual({ user_id: me, login_enabled: true });
      const [b] = await q(F.MY_DROP_INS);
      expect(b).toMatchObject({ first_name: 'Gareth', student_id: st.id });
      expect(await q(`select 1 from invoice where status = 'issued'`)).toHaveLength(1);
      expect((await q(F.CANCEL_DROP_IN, [b.id]))[0].r).toBe('refunded');
      expect(await q(`select 1 from invoice where status = 'void'`)).toHaveLength(1);
      expect(await q(F.MY_DROP_INS)).toHaveLength(0);
    });
  });
});
