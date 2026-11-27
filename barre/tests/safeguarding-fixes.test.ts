import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, FAMILY } from './helpers';
import { STUDENTS, STUDENT_SAFETY } from '../src/lib/repos/people';
import { MY_CHILDREN } from '../src/lib/repos/family';
import { CONSENTS, CONSENT_HISTORY, SET_CONSENT, BRIEF_CONSENTS } from '../src/lib/repos/consent';
import { FAMILY_EXPORT, ASK_TO_DELETE } from '../src/lib/repos/privacy';
import * as G from '../src/lib/repos/safeguarding';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const SECOND_PARENT = '99999999-0000-4000-8000-000000000111';

/** A child of Hannah's family whom Marcus teaches. */
async function marcusChildOfHannah(svc: any): Promise<string> {
  const rows = await svc(`select s.id from student s where s.family_id = $1 and s.deleted_at is null
      and exists (select 1 from enrolment e join class c on c.id = e.class_id join staff_member sm on sm.id = c.teacher_id
                   where e.student_id = s.id and e.status = 'active' and sm.user_id = $2) limit 1`, [FAMILY.a, USERS.teacherTap]);
  if (rows[0]) return rows[0].id;
  // Fall back: enrol one of Hannah's children in a class Marcus teaches.
  const [kid] = await svc(`select id from student where family_id = $1 and deleted_at is null limit 1`, [FAMILY.a]);
  const [cls] = await svc(`select c.id from class c join staff_member sm on sm.id = c.teacher_id where sm.user_id = $1 and c.deleted_at is null limit 1`, [USERS.teacherTap]);
  await svc(`insert into enrolment (studio_id, class_id, student_id, status) values ($1, $2, $3, 'active')`, [STUDIO_ID, cls.id, kid.id]);
  return kid.id;
}

describe('UR-08 consent with history', () => {
  it('a parent withdraws; teachers see it on the next load; history keeps both rows; no query breaks with many rows', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kid = await marcusChildOfHannah(svc);
      await q(SET_CONSENT, [kid, 'photography', true, null, null]);
      await q(SET_CONSENT, [kid, 'photography', false, 'Please no photos this term', null]);
      const now = await q(CONSENTS, [kid]);
      expect(now.map((c: any) => c.kind)).toEqual(['photography', 'video', 'social_media']);
      expect(now.find((c: any) => c.kind === 'photography')).toMatchObject({ granted: false, disputed: false });
      expect(now.find((c: any) => c.kind === 'video').granted).toBeNull();
      const hist = await q(CONSENT_HISTORY, [kid]);
      const photo = hist.filter((h: any) => h.kind === 'photography');
      expect(photo.length).toBeGreaterThanOrEqual(2);
      expect(photo[0]).toMatchObject({ granted: false, by_name: 'Hannah Wright', source: 'family' });
      // The family page query survives several rows per kind.
      expect((await q(MY_CHILDREN)).find((c: any) => c.id === kid).photo_consent).toBe(false);
      // The office is told.
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'consent' and title like 'Photo consent withdrawn%'`, [USERS.admin])).toHaveLength(1);

      await as(svc, USERS.teacherTap);
      expect((await q(STUDENT_SAFETY, [kid]))[0].photo_consent).toBe(false);
      const [extra] = await q(BRIEF_CONSENTS, [kid]);
      expect(extra).toEqual({ video_consent: null, social_consent: null });   // "Not recorded", shown explicitly
      // A teacher cannot change consent, nor read the history.
      expect(await expectRejected(() => q(SET_CONSENT, [kid, 'photography', true, null, null]))).toMatch(/FORBIDDEN/);
      expect(await q(CONSENT_HISTORY, [kid])).toHaveLength(0);

      await as(svc, USERS.admin);
      expect((await q(STUDENTS)).find((s: any) => s.id === kid).photo_consent).toBe(false);
      // Paper consent recorded at the desk is the school's settled position.
      await q(SET_CONSENT, [kid, 'photography', true, 'Signed form, 27 Nov', true]);
      expect((await q(CONSENT_HISTORY, [kid]))[0]).toMatchObject({ source: 'paper', note: 'Signed form, 27 Nov', by_name: 'Nadia Okafor' });
      expect((await q(STUDENT_SAFETY, [kid]))[0].photo_consent).toBe(true);
    });
  });

  it('families cannot rewrite consent rows directly; outsiders cannot read or set', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.a]);
      await expectRejected(() => q(`insert into consent_record (studio_id, student_id, kind, granted) values ($1, $2, 'photography', true)`, [STUDIO_ID, kid.id]));
      expect(await q(`update consent_record set granted = true where student_id = $1 returning id`, [kid.id])).toHaveLength(0);
      await as(svc, USERS.guardianB);
      expect(await expectRejected(() => q(SET_CONSENT, [kid.id, 'photography', false, null, null]))).toMatch(/FORBIDDEN/);
      expect(await q(CONSENTS, [kid.id])).toHaveLength(0);
      expect((await q(`select app.consent_now($1, 'photography') v`, [kid.id]))[0].v).toBeNull();
      // A teacher who does not teach the child learns nothing.
      await as(svc, USERS.teacherStreet);
      const taught = await svc(`select 1 from enrolment e join class c on c.id = e.class_id join staff_member sm on sm.id = c.teacher_id
                                 where e.student_id = $1 and sm.user_id = $2`, [kid.id, USERS.teacherStreet]);
      if (taught.length === 0) expect((await q(`select app.consent_now($1, 'photography') v`, [kid.id]))[0].v).toBeNull();
    });
  });

  it('two guardians disagree: the most restrictive choice applies and the office is alerted', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.a]);
      await svc(`insert into user_account (id, email, full_name) values ($1, 'ines@example.test', 'Inês Wright')`, [SECOND_PARENT]);
      await svc(`insert into guardian (studio_id, family_id, user_id, full_name, relationship) values ($1, $2, $3, 'Inês Wright', 'Mother')`, [STUDIO_ID, FAMILY.a, SECOND_PARENT]);
      await q(SET_CONSENT, [kid.id, 'video', true, null, null]);
      await as(svc, SECOND_PARENT);
      await q(SET_CONSENT, [kid.id, 'video', false, null, null]);
      await as(svc, USERS.guardianA);
      await q(SET_CONSENT, [kid.id, 'video', true, null, null]);          // Hannah insists; Inês has not changed her mind
      const v = (await q(CONSENTS, [kid.id])).find((c: any) => c.kind === 'video');
      expect(v).toMatchObject({ granted: false, disputed: true });
      expect((await q(`select app.has_consent($1, 'video') v`, [kid.id]))[0].v).toBe(false);
      expect(await svc(`select 1 from notification where user_id = $1 and title like 'Guardians disagree%'`, [USERS.admin])).toHaveLength(1);
      // Inês agrees: consent is given and no longer disputed.
      await as(svc, SECOND_PARENT);
      await q(SET_CONSENT, [kid.id, 'video', true, null, null]);
      expect((await q(CONSENTS, [kid.id])).find((c: any) => c.kind === 'video')).toMatchObject({ granted: true, disputed: false });
    });
  });

  it('an office-created child can be given an initial state', async () => {
    await asUser(USERS.admin, async q => {
      const [{ id }] = await q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth) values ($1, $2, 'New', 'Child', '2018-01-01') returning id`, [STUDIO_ID, FAMILY.b]);
      expect((await q(CONSENTS, [id])).every((c: any) => c.granted === null)).toBe(true);
      await q(SET_CONSENT, [id, 'photography', false, 'Recorded when the child was added', null]);
      expect((await q(CONSENTS, [id]))[0].granted).toBe(false);
    });
  });
});

describe('UR-09 office and DSL raise concerns, including about adults and staff', () => {
  it('Nadia raises about a child from the desk; the lead reads it; the access log shows her as raiser', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      const [{ id }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'child', kid.id, null, null, 'disclosure', 'Mum said at the desk that he is scared to go home', false]);
      await as(svc, USERS.owner);
      const log = await q(G.LOG, [STUDIO_ID, null]);
      expect(log.find((c: any) => c.id === id)).toMatchObject({ subject_kind: 'child', allegation: false, raised_by: 'Nadia Okafor' });
      const access = await q(G.ACCESS, [STUDIO_ID]);
      expect(access.some((a: any) => a.who === 'Nadia Okafor' && a.what === 'raised a concern')).toBe(true);
    });
  });

  it('a concern about an adult needs no child', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [{ id }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'adult', null, null, 'Man waiting outside in a grey van', 'other', 'Has been waiting outside at pick-up three weeks running', true]);
      await as(svc, USERS.owner);
      expect((await q(G.LOG, [STUDIO_ID, null])).find((c: any) => c.id === id)).toMatchObject({ subject_kind: 'adult', subject_name: 'Man waiting outside in a grey van', student_name: null });
      expect(await expectRejected(() => q(G.RAISE_ABOUT, [STUDIO_ID, 'adult', null, null, '', 'other', 'Long enough summary here', false]))).toMatch(/INVALID/);
    });
  });

  it('an allegation about a member of staff is never visible to them, even as the lead; it routes to the owner', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);           // Nadia is the DSL
      const [nadia] = await svc(`select id from staff_member where user_id = $1`, [USERS.admin]);
      const [marcus] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherTap]);
      let nadiaStaff = nadia?.id;
      if (!nadiaStaff) [{ id: nadiaStaff }] = await svc(`insert into staff_member (studio_id, user_id, display_name) values ($1, $2, 'Nadia Okafor') returning id`, [STUDIO_ID, USERS.admin]);
      await svc(`delete from notification`);
      await as(svc, USERS.teacherModern);
      const [{ id: aboutNadia }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'staff', null, nadiaStaff, null, 'other', 'Shouted at a child and grabbed her arm in the corridor', false]);
      const [{ id: aboutMarcus }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'staff', null, marcus.id, null, 'other', 'Messaged a student privately on social media', false]);
      // Nobody is named, the LADO route is; Nadia (the subject) is not told.
      const told = await svc(`select user_id, title from notification where kind = 'safeguarding'`);
      expect(told.every((n: any) => /LADO/.test(n.title))).toBe(true);
      expect(told.filter((n: any) => n.user_id === USERS.admin)).toHaveLength(1);        // only about Marcus
      expect(told.filter((n: any) => n.user_id === USERS.owner)).toHaveLength(2);
      // Nadia, the lead, sees the one about Marcus but not the one about herself.
      await as(svc, USERS.admin);
      const hers = await q(G.LOG, [STUDIO_ID, null]);
      expect(hers.map((c: any) => c.id)).toContain(aboutMarcus);
      expect(hers.map((c: any) => c.id)).not.toContain(aboutNadia);
      expect(await expectRejected(() => q(G.ACTIONS, [aboutNadia, null]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(G.ACT, [aboutNadia, 'Closing this', 'closed']))).toMatch(/FORBIDDEN/);
      expect((await q(G.ACCESS, [STUDIO_ID])).some((a: any) => a.concern === aboutNadia)).toBe(false);
      expect(JSON.stringify((await q(G.EXPORT, [STUDIO_ID]))[0].data)).not.toContain(aboutNadia);
      // Marcus, the subject of the other, cannot read the log at all.
      await as(svc, USERS.teacherTap);
      await expectRejected(() => q(G.LOG, [STUDIO_ID, null]));
      // The owner sees both, flagged as allegations.
      await as(svc, USERS.owner);
      const all = await q(G.LOG, [STUDIO_ID, null]);
      expect(all.find((c: any) => c.id === aboutNadia)).toMatchObject({ allegation: true, category: 'allegation', subject_name: 'Nadia Okafor' });
    });
  });

  it('a parent cannot raise through the new route either', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.a]);
      expect(await expectRejected(() => q(G.RAISE_ABOUT, [STUDIO_ID, 'child', kid.id, null, null, 'other', 'Something long enough here', false]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(G.RAISE_ABOUT, [STUDIO_ID, 'adult', null, null, 'Someone', 'other', 'Something long enough here', false]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-28 the access log counts each look once', () => {
  it('open → action → close produces exactly two rows', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      await as(svc, USERS.teacherTap);
      const [{ id }] = await q(`select app.raise_concern($1, 'wellbeing', 'Came in with a bruise on her cheek', false) id`, [kid.id]);
      await as(svc, USERS.owner);
      const opening = '11111111-2222-4333-8444-555555555555';
      await q(G.ACTIONS, [id, opening]);                       // open the sheet
      await q(G.ACT, [id, 'Spoke to mum at pick-up', 'monitoring']);
      await q(G.ACTIONS, [id, opening]);                       // the sheet refreshes after the action
      const rows = await svc(`select what from safeguarding_access where concern_id = $1 and user_id = $2 order by id`, [id, USERS.owner]);
      expect(rows.map((r: any) => r.what)).toEqual(['opened a concern', 'recorded an action']);
      // A new opening is a new look.
      await q(G.ACTIONS, [id, '11111111-2222-4333-8444-666666666666']);
      expect(await svc(`select 1 from safeguarding_access where concern_id = $1 and user_id = $2`, [id, USERS.owner])).toHaveLength(3);
      // The list, re-read within one page opening, is logged once.
      const page = '11111111-2222-4333-8444-777777777777';
      await q(G.LOG, [STUDIO_ID, page]); await q(G.LOG, [STUDIO_ID, page]);
      expect(await svc(`select 1 from safeguarding_access where opening = $1`, [page])).toHaveLength(1);
    });
  });
});

describe('UR-29 safeguarding export', () => {
  it('the lead and owner can export concerns, actions, staff checks and audit; it is logged; an admin cannot', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      const [{ id }] = await q(`select app.raise_concern($1, 'injury', 'Fell and hit her head, no adult saw', false) id`, [kid.id]);
      await q(G.ACT, [id, 'Called home', null]);
      const [st] = await svc(`select id from staff_member limit 1`);
      await q(`insert into staff_check (staff_id, kind, checked_on) values ($1, 'dbs', current_date - 30)`, [st.id]);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(G.EXPORT, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.owner);
      const [{ data }] = await q(G.EXPORT, [STUDIO_ID]);
      const c = data.concerns.find((x: any) => x.id === id);
      expect(c.actions[0].note).toBe('Called home');
      expect(data.staff_checks.length).toBeGreaterThan(0);
      expect(data.audit_log.length).toBeGreaterThan(0);
      expect(data.access_log.length).toBeGreaterThan(0);
      expect((await q(G.ACCESS, [STUDIO_ID]))[0].what).toBe('exported the safeguarding record');
      // Named as lead, Nadia can export.
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);
      await as(svc, USERS.admin);
      expect((await q(G.EXPORT, [STUDIO_ID]))[0].data.concerns.length).toBeGreaterThan(0);
    });
  });
});

describe('UR-12 retention legal hold', () => {
  async function leaver(svc: any, n: number) {
    const [kid] = await svc(`select s.id from student s join family f on f.id = s.family_id and not f.is_prospect
                              where s.deleted_at is null order by s.id offset $1 limit 1`, [n]);
    await svc(`update enrolment set status = 'left', ended_on = current_date - 1200 where student_id = $1`, [kid.id]);
    await svc(`update waitlist_entry set status = 'withdrawn' where student_id = $1`, [kid.id]);
    await svc(`update trial set status = 'cancelled' where student_id = $1`, [kid.id]);
    return kid.id as string;
  }
  it('a leaver with a closed concern, an open concern or a hold is held, with the reason; one without is anonymised', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const closed = await leaver(svc, 3), open = await leaver(svc, 4), held = await leaver(svc, 5), plain = await leaver(svc, 6);
      const [{ id: c1 }] = await q(`select app.raise_concern($1, 'wellbeing', 'Long ago concern, now resolved', false) id`, [closed]);
      await q(G.ACT, [c1, 'Resolved with family', 'closed']);
      await q(`select app.raise_concern($1, 'wellbeing', 'Still being looked into by the lead', false)`, [open]);
      await q(G.SET_HOLD, [held, 'Police request to preserve records']);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      const step = (id: string) => preview.filter((p: any) => p.student_id === id && p.step !== 'medical').map((p: any) => [p.step, p.reason]);
      expect(step(closed)).toEqual([['held', 'Safeguarding record still kept']]);
      expect(step(open)).toEqual([['held', 'Safeguarding concern still open']]);
      expect(step(held)).toEqual([['held', 'Legal hold set by the safeguarding lead']]);
      expect(step(plain)).toEqual([['anonymise', null]]);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      const names = await svc(`select id, first_name from student where id = any($1)`, [[closed, open, held, plain]]);
      const first = (id: string) => names.find((n: any) => n.id === id).first_name;
      expect(first(plain)).toBe('Former');
      expect([first(closed), first(open), first(held)]).not.toContain('Former');
      expect((await q(G.HOLDS, [STUDIO_ID])).map((h: any) => h.student_id)).toEqual([held]);
      // After the closed concern's period passes, the child is no longer held.
      await q(`update retention_policy set concern_months = 12`);
      await svc(`update safeguarding_concern set updated_at = now() - interval '13 months' where id = $1`, [c1]);
      expect((await q(G.PREVIEW_RETENTION, [STUDIO_ID])).find((p: any) => p.student_id === closed && p.step !== 'medical').step).toBe('anonymise');
    });
  });
  it('only the lead and owner set a hold', async () => {
    await asUser(USERS.admin, async q => {
      const [kid] = await q(`select id from student limit 1`);
      expect(await expectRejected(() => q(G.SET_HOLD, [kid.id, 'Because']))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-41 staff checks for the DSL and the office', () => {
  it('admin and lead read checks; gaps are listed for Today; only the owner writes', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [marcus] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherTap]);
      const [priya] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherModern]);
      await q(`insert into staff_check (staff_id, kind, checked_on, expires_on) values ($1, 'dbs', current_date - 1000, current_date + 10)`, [priya.id]);
      const sum = await q(G.CHECK_SUMMARY, [STUDIO_ID]);
      expect(sum.find((s: any) => s.staff_id === marcus.id).issue).toBe('No DBS on file');
      expect(sum.find((s: any) => s.staff_id === priya.id).issue).toBe('Expires soon: DBS');
      expect((await q(G.CHECK_GAPS_TODAY)).length).toBeGreaterThan(0);
      // A teacher who is not the lead sees nothing; named as lead, she sees the checks.
      await as(svc, USERS.teacherModern);
      expect(await q(`select 1 from staff_check`)).toHaveLength(0);
      expect(await q(G.CHECK_SUMMARY, [STUDIO_ID])).toHaveLength(0);
      await as(svc, USERS.owner);
      await q(`select app.set_safeguarding_lead($1)`, [USERS.teacherModern]);
      await as(svc, USERS.teacherModern);
      expect((await q(`select 1 from staff_check`)).length).toBeGreaterThan(0);
      expect((await q(G.CHECK_GAPS_TODAY)).length).toBeGreaterThan(0);
      await expectRejected(() => q(`insert into staff_check (staff_id, kind, checked_on) values ($1, 'dbs', current_date)`, [marcus.id]));
      // The admin reads them but Today's warning is for the owner and the lead.
      await as(svc, USERS.admin);
      expect((await q(`select 1 from staff_check`)).length).toBeGreaterThan(0);
      expect(await q(G.CHECK_GAPS_TODAY)).toHaveLength(0);
      // The lead is reminded too.
      await svc(`delete from notification`);
      await q(`select app.remind_staff_checks($1)`, [STUDIO_ID]);
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'staff_check_due'`, [USERS.teacherModern])).toHaveLength(1);
    });
  });
});

describe('UR-58 absence as a welfare signal', () => {
  it('the lead watches a child and sees a run of unexplained absences; others cannot', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [e] = await svc(`select e.student_id, e.class_id from enrolment e where e.status = 'active' limit 1`);
      const sessions = await svc(`select id from class_session where class_id = $1 and starts_at < now() order by starts_at desc limit 4`, [e.class_id]);
      expect(sessions.length).toBe(4);
      await svc(`delete from attendance_record where student_id = $1`, [e.student_id]);
      const mark = (i: number, st: string) => svc(`insert into attendance_record (studio_id, session_id, student_id, status) values ($1, $2, $3, $4)`, [STUDIO_ID, sessions[i].id, e.student_id, st]);
      await mark(0, 'absent'); await mark(1, 'absent'); await mark(2, 'absent'); await mark(3, 'present');
      expect(await q(G.WATCHES, [STUDIO_ID])).toHaveLength(0);       // opt-in: nobody is watched by default
      await q(G.SET_WATCH, [e.student_id, true, 'Agreed with social worker']);
      const [w] = await q(G.WATCHES, [STUDIO_ID]);
      expect(w).toMatchObject({ student_id: e.student_id, streak: 3, note: 'Agreed with social worker' });
      // An excused absence is explained: it ends the run.
      await svc(`update attendance_record set status = 'excused' where session_id = $1 and student_id = $2`, [sessions[1].id, e.student_id]);
      expect((await q(G.WATCHES, [STUDIO_ID]))[0].streak).toBe(1);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(G.WATCHES, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(G.SET_WATCH, [e.student_id, false, null]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('UR-38 family privacy: download and ask to delete', () => {
  it('the download holds only this family’s records', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const kids = (await svc(`select id from student where family_id = $1`, [FAMILY.a])).map((r: any) => r.id);
      const invoices = (await svc(`select id from invoice where family_id = $1`, [FAMILY.a])).map((r: any) => r.id);
      let total = 0;
      for (const [name, sql] of FAMILY_EXPORT) {
        const rows = await q(sql);
        total += rows.length;
        for (const r of rows) {
          if ('family_id' in r && r.family_id !== null) expect(r.family_id, name).toBe(FAMILY.a);
          if ('student_id' in r && r.student_id !== null) expect(kids, name).toContain(r.student_id);
          if ('invoice_id' in r && r.invoice_id !== null) expect(invoices, name).toContain(r.invoice_id);
          if (name === 'family') expect(r.id).toBe(FAMILY.a);
          if (name === 'children') expect(kids).toContain(r.id);
        }
      }
      expect(total).toBeGreaterThan(5);
    });
  });
  it('"ask to delete" lands in the office queue with the retention explanation', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ id }] = await q(ASK_TO_DELETE, ['We are moving away']);
      await as(svc, USERS.admin);
      const [r] = await q(`select kind::text, family_id, subject, body from studio_request where id = $1`, [id]);
      expect(r).toMatchObject({ kind: 'data_request', family_id: FAMILY.a });
      expect(r.body).toMatch(/moving away/);
      expect(r.body).toMatch(/six years/);
      expect(await svc(`select 1 from notification where user_id = $1 and kind = 'request' and title like '%deleted%'`, [USERS.admin])).toHaveLength(1);
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(ASK_TO_DELETE, [null]))).toMatch(/FORBIDDEN/);
    });
  });
});
