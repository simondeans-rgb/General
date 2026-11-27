import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import * as F from '../src/lib/repos/family';
import * as H from '../src/lib/repos/hub';
import * as C from '../src/lib/repos/consent';
import { FAMILY_EXPORT } from '../src/lib/repos/privacy';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/* Round 2, accounts stream (migration 0053). Every test runs in one
   rolled-back transaction and changes who it is by setting the claims. */
type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const as = (svc: Q, user: string | null) => svc(`select set_config('request.jwt.claims', $1, true)`,
  [JSON.stringify(user ? { sub: user, role: 'authenticated' } : { role: 'anon' })]);

const HANNAH_ROW = uid(NS.guardian, 1);
const INES_ROW = uid(NS.guardian, 2);            // second Wright guardian, no login
const ADULT_CLASS = uid(NS.class, 191);          // Adult Contemporary (drop-in), 18+
const AMIR = uid(NS.user, 40);                   // Amir Wright, 15, has a login

async function secondGuardian(q: Q, svc: Q) {
  await as(svc, USERS.admin);
  const [{ t }] = await q(`select app.create_invitation($1, 'second.wright@example.com', 'guardian', null, $2, null) t`, [STUDIO_ID, FAMILY.a]);
  const me = randomUUID();
  await as(svc, me);
  await q(`select * from app.accept_invitation($1, 'Inês Wright')`, [t]);
  return me;
}
const adultDropIn = async (svc: Q) =>
  (await svc(`select d.session_id from app.drop_in_sessions($1) d where d.age_min >= 18 order by d.starts_at limit 1`, [STUDIO_ID]))[0].session_id as string;
const child = async (svc: Q, name: string) => (await svc(`select * from student where first_name = $1 and family_id = $2`, [name, FAMILY.a]))[0];

/* ── UR-55 ─────────────────────────────────────────────────────────────── */
describe('no own login under 13 is a database rule (UR-55)', () => {
  it('the school minimum age is held to 13–18 by the table itself, not only the setting function', async () => {
    await asUser(null, async (_q, svc) => {
      expect(await expectRejected(() => svc(`update studio set student_login_min_age = 12 where id = $1`, [STUDIO_ID]))).toMatch(/check constraint/);
      expect(await expectRejected(() => svc(`update studio set student_login_min_age = 19 where id = $1`, [STUDIO_ID]))).toMatch(/check constraint/);
      await svc(`update studio set student_login_min_age = 13 where id = $1`, [STUDIO_ID]);
      expect((await svc(`select min(student_login_min_age)::int m from studio`))[0].m).toBeGreaterThanOrEqual(13);
    });
  });

  it('neither the office nor a parent can invite an under-13 to a login', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const nia = await child(svc, 'Nia');      // 9
      expect(await expectRejected(() => q(`select app.create_invitation($1, 'nia@example.com', 'student', null, null, $2)`, [STUDIO_ID, nia.id])))
        .toMatch(/Nia is under 13/);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(F.INVITE_STUDENT, [nia.id, 'nia@example.com']))).toMatch(/13/);
      // A 15-year-old can still be invited.
      const amir = await child(svc, 'Amir');
      await svc(`update student set user_id = null, login_enabled = false, login_approved_by = null where id = $1`, [amir.id]);
      expect((await q(F.INVITE_STUDENT, [amir.id, 'amir.new@example.com']))[0].token).toBeTruthy();
    });
  });

  it('an under-13 cannot be linked to an account or switched on, even by a trusted job', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const nia = await child(svc, 'Nia');
      await svc(`insert into user_account (id, email, full_name) values ($1, 'nia.forged@example.com', 'Nia')`, [uid(NS.user, 91)]);
      expect(await expectRejected(() => svc(`update student set user_id = $1 where id = $2`, [uid(NS.user, 91), nia.id])))
        .toMatch(/STUDENT_LOGIN_TOO_YOUNG/);
      expect(await expectRejected(() => svc(`update student set user_id = $1, login_enabled = true, login_approved_by = $2 where id = $3`,
        [uid(NS.user, 91), USERS.guardianA, nia.id]))).toMatch(/STUDENT_LOGIN_TOO_YOUNG/);
      expect(await expectRejected(() => q(F.SET_STUDENT_LOGIN, [nia.id, true]))).toMatch(/invite them first|TOO_YOUNG/);
      // The family screen still says "too young".
      expect((await q(F.MY_CHILDREN_LOGINS)).find((l: any) => l.student_id === nia.id).state).toBe('too_young');
    });
  });
});

/* ── UR-17 (medical) ───────────────────────────────────────────────────── */
describe('a medical restriction holds everywhere the guardian could see health data (UR-17)', () => {
  async function restrictInes(q: Q, svc: Q) {
    const ines = await secondGuardian(q, svc);
    await as(svc, USERS.admin);
    await q(`select app.set_guardian_access($1, '{"see_medical": false}'::jsonb)`, [INES_ROW]);
    return ines;
  }

  it('the restricted guardian sees no medical details on the family screens or the safety brief; the other guardian does', async () => {
    await asUser(null, async (q, svc) => {
      const ines = await restrictInes(q, svc);
      const nia = await child(svc, 'Nia');
      await svc(`update medical_record set allergies = 'Peanuts', requires_alert = true where student_id = $1`, [nia.id]);
      await as(svc, ines);
      expect(await q(`select 1 from medical_record`)).toHaveLength(0);
      expect(await q(`select allergies from student_safety_brief where student_id = $1`, [nia.id])).toHaveLength(0);
      const mine = (await q(F.MY_CHILDREN)).find((c: any) => c.id === nia.id);
      expect(mine).toMatchObject({ allergies: null, has_alert: false });
      // Everything else about Nia is still there.
      expect(mine.first_name).toBe('Nia');
      await as(svc, USERS.guardianA);
      expect((await q(`select allergies from student_safety_brief where student_id = $1`, [nia.id]))[0].allergies).toBe('Peanuts');
      expect((await q(F.MY_CHILDREN)).find((c: any) => c.id === nia.id)).toMatchObject({ allergies: 'Peanuts', has_alert: true });
      // Teachers and the office are unaffected.
      await as(svc, USERS.admin);
      expect((await q(`select allergies from student_safety_brief where student_id = $1`, [nia.id]))[0].allergies).toBe('Peanuts');
    });
  });

  it('the privacy download leaves medical details out for the restricted guardian only', async () => {
    await asUser(null, async (q, svc) => {
      const ines = await restrictInes(q, svc);
      const medical = FAMILY_EXPORT.find(([n]) => n === 'medical')![1];
      await as(svc, ines);
      expect(await q(medical)).toHaveLength(0);
      expect((await q(FAMILY_EXPORT.find(([n]) => n === 'children')![1])).length).toBeGreaterThan(0);
      await as(svc, USERS.guardianA);
      expect((await q(medical)).length).toBeGreaterThan(0);
    });
  });

  it('the restricted guardian cannot write the record, nor read medical updates others raised; their own stay theirs', async () => {
    await asUser(null, async (q, svc) => {
      const ines = await restrictInes(q, svc);
      const nia = await child(svc, 'Nia');
      const clara = await child(svc, 'Clara');
      await svc(`insert into studio_request (studio_id, family_id, student_id, kind, subject, body)
                 values ($1, $2, $3, 'medical_update', 'Recorded at the desk', 'Epipen in bag')`, [STUDIO_ID, FAMILY.a, nia.id]);
      await as(svc, ines);
      expect(await q(`update medical_record set allergies = 'None' where student_id = $1 returning id`, [nia.id])).toHaveLength(0);
      expect(await expectRejected(() => q(`insert into medical_record (studio_id, student_id, allergies) values ($1, $2, 'x')`, [STUDIO_ID, clara.id])))
        .toMatch(/row-level security/);
      expect(await q(`select 1 from studio_request where subject = 'Recorded at the desk'`)).toHaveLength(0);
      // They may still tell the school something new, and see what they sent.
      await q(`insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
               values ($1, $2, $3, 'medical_update', 'From Ines', 'New inhaler', auth.uid())`, [STUDIO_ID, FAMILY.a, nia.id]);
      expect(await q(`select 1 from studio_request where subject = 'From Ines'`)).toHaveLength(1);
      await as(svc, USERS.guardianA);
      expect(await q(`select 1 from studio_request where subject = 'Recorded at the desk'`)).toHaveLength(1);
      expect((await svc(`select allergies from medical_record where student_id = $1`, [nia.id]))[0].allergies).not.toBe('None');
    });
  });
});

/* ── UR-21 ─────────────────────────────────────────────────────────────── */
describe('a parent books for themselves (UR-21)', () => {
  it('makes their own adult record once, reuses it, and leaves the children alone', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const before = await svc(`select * from student where family_id = $1 order by id`, [FAMILY.a]);
      expect(await expectRejected(() => q(F.BOOK_FOR_MYSELF, [null, false, null, null]))).toMatch(/18 or over/);
      const sixteen = new Date(Date.now() - 16 * 365.25 * 864e5).toISOString().slice(0, 10);
      expect(await expectRejected(() => q(F.BOOK_FOR_MYSELF, [sixteen, true, null, null]))).toMatch(/adults/);
      const [{ id }] = await q(F.BOOK_FOR_MYSELF, ['1985-03-02', false, null, null]);
      expect((await q(F.BOOK_FOR_MYSELF, [null, false, null, null]))[0].id).toBe(id);
      expect((await q(F.MY_SELF_RECORD))[0]).toEqual({ id, has_contact: false });
      // Asked again with someone to ring, the same record gains the contact.
      expect((await q(F.BOOK_FOR_MYSELF, [null, false, 'Ines Wright', '07700 900123']))[0].id).toBe(id);
      expect((await q(F.MY_SELF_RECORD))[0]).toEqual({ id, has_contact: true });
      const [me] = await svc(`select * from student where id = $1`, [id]);
      expect(me).toMatchObject({ is_adult: true, self_guardian_id: HANNAH_ROW, family_id: FAMILY.a, first_name: 'Hannah' });
      const after = await svc(`select * from student where family_id = $1 and id <> $2 order by id`, [FAMILY.a, id]);
      expect(after).toEqual(before);
      expect((await q(F.MY_CHILDREN)).find((c: any) => c.id === id)).toMatchObject({ is_me: true, is_adult: true });
      // Hannah's own record never appears in the teenage-login list.
      expect((await q(F.MY_CHILDREN_LOGINS)).some((l: any) => l.student_id === id)).toBe(false);
    });
  });

  it('the adult record books an adult drop-in; a child still cannot', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(F.BOOK_FOR_MYSELF, [null, true, 'Ines Wright', '07700 900123']);
      const s = await adultDropIn(svc);
      await q(F.BOOK_DROP_IN, [s, id]);
      expect((await q(F.MY_DROP_INS)).some((b: any) => b.student_id === id)).toBe(true);
      const amir = await child(svc, 'Amir');
      expect(await expectRejected(() => q(F.BOOK_DROP_IN, [s, amir.id]))).toMatch(/18 and over/);
    });
  });

  it('only a guardian with a login can do it', async () => {
    await asUser(USERS.teacherTap, async (q) => {
      expect(await expectRejected(() => q(F.BOOK_FOR_MYSELF, [null, true, 'Ines Wright', '07700 900123']))).toMatch(/FORBIDDEN/);
    });
    await asUser(AMIR, async (q) => {
      expect(await expectRejected(() => q(F.BOOK_FOR_MYSELF, [null, true, 'Ines Wright', '07700 900123']))).toMatch(/FORBIDDEN/);
    });
  });

  it('a restriction on the family never hides the adult’s own bookings or feedback', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(F.BOOK_FOR_MYSELF, [null, true, 'Ines Wright', '07700 900123']);
      await q(F.BOOK_DROP_IN, [await adultDropIn(svc), id]);
      await svc(`insert into feedback_note (studio_id, student_id, class_id, going_well, shared_at, share_with_guardian)
                 values ($1, $2, $3, 'Lovely lines', now(), true)`, [STUDIO_ID, id, ADULT_CLASS]);
      await as(svc, USERS.admin);
      await q(`select app.set_guardian_access($1, '{"see_schedule": false, "see_feedback": false}'::jsonb)`, [HANNAH_ROW]);
      await as(svc, USERS.guardianA);
      expect((await q(F.MY_DROP_INS)).map((b: any) => b.student_id)).toEqual([id]);
      expect((await q(H.STUDENT_FEEDBACK)).map((f: any) => f.student_id)).toEqual([id]);
      expect(await q(`select 1 from enrolment e join student s on s.id = e.student_id where s.id <> $1`, [id])).toHaveLength(0);
    });
  });

  it('an adult sees their own feedback, and their skills only when the class tracks them', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(F.BOOK_FOR_MYSELF, [null, true, 'Ines Wright', '07700 900123']);
      await svc(`insert into enrolment (studio_id, class_id, student_id) values ($1, $2, $3)`, [STUDIO_ID, ADULT_CLASS, id]);
      await svc(`insert into feedback_note (studio_id, student_id, class_id, going_well, shared_at, share_with_guardian)
                 values ($1, $2, $3, 'Strong turns', now(), true)`, [STUDIO_ID, id, ADULT_CLASS]);
      expect((await q(H.STUDENT_FEEDBACK)).find((f: any) => f.student_id === id)?.going_well).toBe('Strong turns');
      await svc(`update class set tracking_depth = 'notes' where id = $1`, [ADULT_CLASS]);
      expect(await q(`select * from app.student_skills($1)`, [id])).toHaveLength(0);
      await svc(`update class set tracking_depth = 'full' where id = $1`, [ADULT_CLASS]);
      expect((await q(`select * from app.student_skills($1)`, [id])).length).toBeGreaterThan(0);
    });
  });
});

/* ── UR-08 ─────────────────────────────────────────────────────────────── */
describe('consent wording and a student’s own view (UR-08)', () => {
  it('the office renames a kind and rewrites its explanation; families, teachers and the office all see the new words', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const defaults = await q(C.CONSENT_LABELS, [STUDIO_ID, null]);
      expect(defaults.map((l: any) => l.label)).toEqual(['Photos', 'Video', 'Social media and public use']);
      await q(C.SET_CONSENT_LABEL, [STUDIO_ID, 'photography', 'Photographs in school', 'Photos for our noticeboard only.']);
      const nia = await child(svc, 'Nia');
      for (const who of [USERS.admin, USERS.guardianA, USERS.teacherModern]) {
        await as(svc, who);
        const [l] = await q(C.CONSENT_LABELS, [null, nia.id]);
        expect(l, who).toMatchObject({ kind: 'photography', label: 'Photographs in school', description: 'Photos for our noticeboard only.', renamed: true });
      }
      // The underlying kind is unchanged: consent is still recorded and read as photography.
      await as(svc, USERS.guardianA);
      await q(C.SET_CONSENT, [nia.id, 'photography', false, null, false]);
      expect((await q(C.CONSENTS, [nia.id]))[0]).toMatchObject({ kind: 'photography', granted: false });
      expect(await svc(`select title from notification where title = 'Photographs in school consent withdrawn for Nia Wright'`)).not.toHaveLength(0);
      // An empty name goes back to the standard wording.
      await as(svc, USERS.admin);
      await q(C.SET_CONSENT_LABEL, [STUDIO_ID, 'photography', '', null]);
      expect((await q(C.CONSENT_LABELS, [STUDIO_ID, null]))[0]).toMatchObject({ label: 'Photos', renamed: false });
    });
  });

  it('only the office changes the wording, and only for its own kinds', async () => {
    for (const who of [USERS.guardianA, USERS.teacherTap, AMIR]) {
      await asUser(who, async (q) => {
        expect(await expectRejected(() => q(C.SET_CONSENT_LABEL, [STUDIO_ID, 'photography', 'Pics', null]))).toMatch(/FORBIDDEN/);
      });
    }
    await asUser(USERS.admin, async (q) => {
      expect(await expectRejected(() => q(C.SET_CONSENT_LABEL, [STUDIO_ID, 'tattoos', 'Tattoos', null]))).toMatch(/unknown consent/);
    });
    // Someone with no place in a school cannot read its words.
    await asUser(USERS.guardianB, async (q) => {
      expect(await q(C.CONSENT_LABELS, ['00000001-0000-4000-8000-000000000002', null])).toHaveLength(0);
    });
  });

  it('a student of 13+ sees their own consents read-only, with who to ask', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const amir = await child(svc, 'Amir');
      await q(C.SET_CONSENT_LABEL, [STUDIO_ID, 'video', 'Filming', null]);
      await q(C.SET_CONSENT, [amir.id, 'photography', true, 'Signed form', true]);
      await as(svc, AMIR);
      const mine = await q(C.MY_CONSENTS);
      expect(mine.map((c: any) => [c.kind, c.label, c.granted])).toEqual([
        ['photography', 'Photos', true], ['video', 'Filming', null], ['social_media', 'Social media and public use', null],
      ]);
      expect(mine[0].ask).toMatch(/Hannah Wright.*school office/);
      // Read-only: the student cannot change them.
      expect(await expectRejected(() => q(C.SET_CONSENT, [amir.id, 'video', true, null, false]))).toMatch(/FORBIDDEN/);
      // Nobody else gets a "my consents" list.
      await as(svc, USERS.guardianA);
      expect(await q(C.MY_CONSENTS)).toHaveLength(0);
    });
  });
});
