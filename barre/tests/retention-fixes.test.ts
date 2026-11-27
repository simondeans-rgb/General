import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asService, asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID } from './helpers';
import * as G from '../src/lib/repos/safeguarding';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

type Q = (sql: string, p?: unknown[]) => Promise<any[]>;
const as = (svc: Q, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);

/** The nth non-prospect child, made a leaver `days` ago, with a medical record. */
async function leaver(svc: Q, n: number, days = 1200): Promise<string> {
  const [kid] = await svc(`select s.id from student s join family f on f.id = s.family_id and not f.is_prospect
                            where s.deleted_at is null order by s.id offset $1 limit 1`, [n]);
  await svc(`update enrolment set status = 'left', ended_on = current_date - $2::int where student_id = $1`, [kid.id, days]);
  await svc(`update waitlist_entry set status = 'withdrawn' where student_id = $1`, [kid.id]);
  await svc(`update trial set status = 'cancelled' where student_id = $1`, [kid.id]);
  await svc(`insert into medical_record (studio_id, student_id, allergies) values ($1, $2, 'Peanuts') on conflict (student_id) do nothing`, [STUDIO_ID, kid.id]);
  return kid.id as string;
}
const stepsFor = (rows: any[], id: string) => rows.filter(r => r.student_id === id || r.entity_id === id).map(r => r.step);

describe('holds protect all of the child’s data', () => {
  it('a legal hold keeps the medical record, support note and attendance; releasing it lets them go', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 2);
      await svc(`insert into student_support_note (student_id, studio_id, note) values ($1, $2, 'Needs extra time')`, [kid, STUDIO_ID]);
      await q(G.SET_HOLD, [kid, 'Police asked us to preserve records']);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      expect(stepsFor(preview, kid)).toEqual(['held']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid])).toHaveLength(1);
      expect(await svc(`select 1 from student_support_note where student_id = $1`, [kid])).toHaveLength(1);
      await q(G.RELEASE_HOLD, [kid]);
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), kid)).toEqual(['medical', 'anonymise', 'support']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid])).toHaveLength(0);
      expect(await svc(`select 1 from student_support_note where student_id = $1`, [kid])).toHaveLength(0);
    });
  });
  it('an open concern keeps the medical record of a child whose only due item is medical', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 3, 500);   // past 12 months, not yet 36
      await q(`select app.raise_concern($1, 'wellbeing', 'Still being looked into by the lead', false)`, [kid]);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      expect(preview.filter((p: any) => p.student_id === kid).map((p: any) => [p.step, p.reason]))
        .toEqual([['held', 'Safeguarding concern still open']]);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid])).toHaveLength(1);
    });
  });
});

describe('soft-deleted rows are purged after their period', () => {
  it('a soft-deleted child is anonymised and their soft-deleted medical record deleted', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 4);
      await svc(`update medical_record set deleted_at = now() - interval '40 months' where student_id = $1`, [kid]);
      await svc(`update student set deleted_at = now() - interval '40 months' where id = $1`, [kid]);
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), kid)).toEqual(['medical', 'anonymise']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid])).toHaveLength(0);
      expect((await svc(`select first_name from student where id = $1`, [kid]))[0].first_name).toBe('Former');
    });
  });
  it('a recently soft-deleted child is not yet due, and a held one is kept', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const recent = await leaver(svc, 5);
      await svc(`update student set deleted_at = now() - interval '2 months' where id = $1`, [recent]);
      const held = await leaver(svc, 6);
      await q(G.SET_HOLD, [held, 'Court case pending']);
      await svc(`update student set deleted_at = now() - interval '40 months' where id = $1`, [held]);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      expect(stepsFor(preview, recent)).toEqual([]);
      expect(stepsFor(preview, held)).toEqual(['held']);
    });
  });
  it('a current child’s soft-deleted emergency contact and consent go after the period; recent ones stay', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select s.id from student s where s.deleted_at is null
                                 and exists (select 1 from enrolment e where e.student_id = s.id and e.status = 'active') order by s.id limit 1`);
      const [old] = await svc(`insert into emergency_contact (studio_id, student_id, full_name, phone, deleted_at)
                                values ($1, $2, 'Old Aunt', '0700', now() - interval '40 months') returning id`, [STUDIO_ID, kid.id]);
      const [fresh] = await svc(`insert into emergency_contact (studio_id, student_id, full_name, phone, deleted_at)
                                  values ($1, $2, 'New Aunt', '0701', now() - interval '1 month') returning id`, [STUDIO_ID, kid.id]);
      const [oldConsent] = await svc(`insert into consent_record (studio_id, student_id, kind, granted, deleted_at)
                                       values ($1, $2, 'photography', true, now() - interval '40 months') returning id`, [STUDIO_ID, kid.id]);
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), kid.id)).toEqual(['purge']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from emergency_contact where id = $1`, [old.id])).toHaveLength(0);
      expect(await svc(`select 1 from consent_record where id = $1`, [oldConsent.id])).toHaveLength(0);
      expect(await svc(`select 1 from emergency_contact where id = $1`, [fresh.id])).toHaveLength(1);
      expect((await svc(`select first_name from student where id = $1`, [kid.id]))[0].first_name).not.toBe('Former');
    });
  });
});

describe('a hold on a single concern', () => {
  it('keeps a closed concern about a member of staff; lead and owner only; logged; release lets it go', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [marcus] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherTap]);
      const [{ id }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'staff', null, marcus.id, null, 'allegation', 'An allegation about conduct at a rehearsal', false]);
      await q(G.ACT, [id, 'Resolved after LADO advice', 'closed']);
      await svc(`update safeguarding_concern set updated_at = now() - interval '30 months' where id = $1`, [id]);
      await q(`update retention_policy set concern_months = 24`);
      expect((await q(G.PREVIEW_RETENTION, [STUDIO_ID])).some((p: any) => p.step === 'concern' && p.entity_id === id)).toBe(true);

      // An admin who is not the lead cannot hold it.
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(G.SET_CONCERN_HOLD, [id, 'Because']))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.owner);
      expect(await expectRejected(() => q(G.SET_CONCERN_HOLD, [id, '']))).toMatch(/INVALID/);
      await q(G.SET_CONCERN_HOLD, [id, 'Employment tribunal']);
      expect((await q(G.CONCERN_HOLDS, [STUDIO_ID])).map((h: any) => [h.concern_id, h.reason])).toEqual([[id, 'Employment tribunal']]);
      expect(await svc(`select 1 from safeguarding_access where concern_id = $1 and what like 'placed a legal hold%'`, [id])).toHaveLength(1);
      expect(await svc(`select 1 from audit_log where entity = 'safeguarding_concern_hold' and entity_id = $1`, [id])).toHaveLength(1);

      expect((await q(G.PREVIEW_RETENTION, [STUDIO_ID])).some((p: any) => p.step === 'concern' && p.entity_id === id)).toBe(false);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from safeguarding_concern where id = $1`, [id])).toHaveLength(1);
      // Marcus's staff record is kept too while the concern is.
      await svc(`update staff_member set status = 'inactive', updated_at = now() where id = $1`, [marcus.id]);

      await q(G.RELEASE_CONCERN_HOLD, [id]);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from safeguarding_concern where id = $1`, [id])).toHaveLength(0);
    });
  });
  it('a hold on a child’s concern holds the child', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 7);
      const [{ id }] = await q(`select app.raise_concern($1, 'wellbeing', 'Resolved concern from long ago', false) id`, [kid]);
      await q(G.ACT, [id, 'Closed', 'closed']);
      await svc(`update safeguarding_concern set updated_at = now() - interval '30 months' where id = $1`, [id]);
      await q(`update retention_policy set concern_months = 24`);
      await q(G.SET_CONCERN_HOLD, [id, 'Insurance claim']);
      const p = (await q(G.PREVIEW_RETENTION, [STUDIO_ID])).filter((r: any) => r.student_id === kid);
      expect(p.map((r: any) => [r.step, r.reason])).toEqual([['held', 'Legal hold on a safeguarding concern']]);
    });
  });
});

describe('access-log rows survive a concern’s deletion', () => {
  it('are detached with the concern id and a marker, shown in the log, and purged only after the audit period', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ id }] = await q(G.RAISE_ABOUT, [STUDIO_ID, 'adult', null, null, 'A visiting parent', 'other', 'Something said at the door last term', false]);
      await q(G.ACTIONS, [id, '00000000-0000-4000-8000-00000000aaaa']);   // a logged look
      await q(G.ACT, [id, 'No further action', 'closed']);
      const before = (await svc(`select count(*)::int n from safeguarding_access where concern_id = $1`, [id]))[0].n;
      expect(before).toBeGreaterThan(0);
      await svc(`update safeguarding_concern set updated_at = now() - interval '30 months' where id = $1`, [id]);
      await q(`update retention_policy set concern_months = 24`);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from safeguarding_concern where id = $1`, [id])).toHaveLength(0);
      const kept = await svc(`select concern_id, deleted_concern_id, retention_note from safeguarding_access where deleted_concern_id = $1`, [id]);
      expect(kept).toHaveLength(before);
      expect(kept[0].concern_id).toBeNull();
      expect(kept[0].retention_note).toMatch(/^concern deleted under retention on \d+ \w+ \d{4}$/);
      const log = await q(G.ACCESS, [STUDIO_ID]);
      expect(log.filter((l: any) => l.concern === id && /concern deleted under retention/.test(l.what))).toHaveLength(before);

      // Still there just inside the audit period, counted from the deletion.
      await svc(`update safeguarding_access set at = now() - interval '100 months', detached_at = now() - interval '71 months' where deleted_concern_id = $1`, [id]);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from safeguarding_access where deleted_concern_id = $1`, [id])).toHaveLength(before);
      await svc(`update safeguarding_access set detached_at = now() - interval '73 months' where deleted_concern_id = $1`, [id]);
      expect((await q(G.PREVIEW_RETENTION, [STUDIO_ID])).some((p: any) => p.step === 'access_log')).toBe(true);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from safeguarding_access where deleted_concern_id = $1`, [id])).toHaveLength(0);
    });
  });
});

describe('new retention categories', () => {
  it('has conservative defaults, enforced ranges, and only the owner changes them', async () => {
    await asUser(USERS.owner, async q => {
      const [p] = await q(G.RETENTION);
      expect([p.message_months, p.attendance_months, p.support_months, p.staff_months, p.staff_check_months, p.audit_months, p.dsl_note_months, p.auto_apply])
        .toEqual([36, 72, 12, 72, 12, 72, 72, false]);
      await expectRejected(() => q(`update retention_policy set audit_months = 1`));
      await expectRejected(() => q(`update retention_policy set message_months = 500`));
    });
    await asUser(USERS.admin, async q => {
      expect(await q(`update retention_policy set message_months = 6 returning 1`)).toHaveLength(0);
    });
  });
  it('deletes old messages, keeping a held family’s; deletes leavers’ attendance after its period', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 8, 2300);   // over 72 months
      const [fam] = await svc(`select family_id from student where id = $1`, [kid]);
      const [m1] = await svc(`insert into communication (studio_id, kind, family_id, body, sent_at) values ($1, 'direct', $2, 'Old message', now() - interval '40 months') returning id`, [STUDIO_ID, fam.family_id]);
      const [m2] = await svc(`insert into communication (studio_id, kind, family_id, body, sent_at) values ($1, 'direct', $2, 'New message', now() - interval '2 months') returning id`, [STUDIO_ID, fam.family_id]);
      const [ann] = await svc(`insert into communication (studio_id, kind, body, sent_at) values ($1, 'studio_announcement', 'Old notice', now() - interval '40 months') returning id`, [STUDIO_ID]);
      // Sending stamps the time, so the age is set afterwards.
      await svc(`update communication set sent_at = now() - interval '40 months' where id = any($1)`, [[m1.id, ann.id]]);
      await svc(`update communication set sent_at = now() - interval '2 months' where id = $1`, [m2.id]);
      const [sess] = await svc(`select id from class_session limit 1`);
      await svc(`insert into attendance_record (studio_id, session_id, student_id, status) values ($1, $2, $3, 'present') on conflict do nothing`, [STUDIO_ID, sess.id, kid]);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      expect(preview.some((p: any) => p.step === 'messages' && p.entity_id === fam.family_id)).toBe(true);
      expect(preview.some((p: any) => p.step === 'messages' && p.entity_id === null)).toBe(true);
      expect(stepsFor(preview, kid)).toContain('attendance');

      // A hold on the child keeps the family's messages and the attendance.
      await q(G.SET_HOLD, [kid, 'Police request']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from communication where id = $1`, [m1.id])).toHaveLength(1);
      expect(await svc(`select 1 from attendance_record where student_id = $1`, [kid])).not.toHaveLength(0);
      expect(await svc(`select 1 from communication where id = $1`, [ann.id])).toHaveLength(0);
      await q(G.RELEASE_HOLD, [kid]);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from communication where id = $1`, [m1.id])).toHaveLength(0);
      expect(await svc(`select 1 from communication where id = $1`, [m2.id])).toHaveLength(1);
      expect(await svc(`select 1 from attendance_record where student_id = $1`, [kid])).toHaveLength(0);
      expect(await svc(`select 1 from audit_log where action = 'retention' and entity = 'attendance_record' and entity_id = $1`, [kid])).toHaveLength(1);
    });
  });
  it('clears check references, then anonymises staff who left; keeps anyone a concern is about', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [gone] = await svc(`insert into staff_member (studio_id, display_name, email, status) values ($1, 'Lena Old', 'lena@example.com', 'inactive') returning id`, [STUDIO_ID]);
      await svc(`insert into staff_check (studio_id, staff_id, kind, reference, checked_on) values ($1, $2, 'dbs', '001234567890', current_date - 2000)`, [STUDIO_ID, gone.id]);
      await svc(`update staff_member set left_at = now() - interval '20 months' where id = $1`, [gone.id]);
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), gone.id)).toEqual(['staff_check']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      const [chk] = await svc(`select reference from staff_check where staff_id = $1`, [gone.id]);
      expect(chk.reference).toBeNull();

      await svc(`update staff_member set left_at = now() - interval '80 months' where id = $1`, [gone.id]);
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), gone.id)).toEqual(['staff']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      const [sm] = await svc(`select display_name, email from staff_member where id = $1`, [gone.id]);
      expect(sm).toEqual({ display_name: 'Former staff', email: null });
      expect(await svc(`select 1 from staff_check where staff_id = $1`, [gone.id])).toHaveLength(0);

      const [other] = await svc(`insert into staff_member (studio_id, display_name, status) values ($1, 'Kit Gone', 'inactive') returning id`, [STUDIO_ID]);
      await q(G.RAISE_ABOUT, [STUDIO_ID, 'staff', null, other.id, null, 'allegation', 'An allegation that was looked into', false]);
      await svc(`update staff_member set left_at = now() - interval '80 months' where id = $1`, [other.id]);
      const held = (await q(G.PREVIEW_RETENTION, [STUDIO_ID])).filter((p: any) => p.entity_id === other.id);
      expect(held.map((p: any) => p.step)).toEqual(['held']);
    });
  });
  it('clears the lead’s shared-care note once the family has been gone for the period', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 9, 2300);
      const [g] = await svc(`select g.id from guardian g join student s on s.family_id = g.family_id where s.id = $1 limit 1`, [kid]);
      await svc(`insert into guardian_access (guardian_id, studio_id, may_collect, dsl_note) values ($1, $2, false, 'Court order 2019')
                 on conflict (guardian_id) do update set dsl_note = excluded.dsl_note`, [g.id, STUDIO_ID]);
      const others = await svc(`select s.id from student s where s.family_id = (select family_id from student where id = $1) and s.id <> $1`, [kid]);
      for (const o of others) {
        await svc(`update enrolment set status = 'left', ended_on = current_date - 2300 where student_id = $1`, [o.id]);
        await svc(`update waitlist_entry set status = 'withdrawn' where student_id = $1`, [o.id]);
        await svc(`update trial set status = 'cancelled' where student_id = $1`, [o.id]);
      }
      expect(stepsFor(await q(G.PREVIEW_RETENTION, [STUDIO_ID]), g.id)).toEqual(['dsl_note']);
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect((await svc(`select dsl_note, may_collect from guardian_access where guardian_id = $1`, [g.id]))[0]).toEqual({ dsl_note: null, may_collect: false });
    });
  });
  it('deletes audit entries older than the period, except a held child’s', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 10, 100);
      await q(G.SET_HOLD, [kid, 'Kept for an inquiry']);
      const [old] = await svc(`insert into audit_log (studio_id, action, entity, entity_id, summary, at) values ($1, 'update', 'family', null, 'old', now() - interval '80 months') returning id`, [STUDIO_ID]);
      const [heldRow] = await svc(`insert into audit_log (studio_id, action, entity, entity_id, summary, at) values ($1, 'update', 'student', $2, 'old', now() - interval '80 months') returning id`, [STUDIO_ID, kid]);
      const [recent] = await svc(`insert into audit_log (studio_id, action, entity, summary, at) values ($1, 'update', 'family', 'recent', now() - interval '10 months') returning id`, [STUDIO_ID]);
      expect((await q(G.PREVIEW_RETENTION, [STUDIO_ID])).find((p: any) => p.step === 'audit').who).toBe('1 audit log entry');
      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      const left = (await svc(`select id from audit_log where id = any($1)`, [[old.id, heldRow.id, recent.id]])).map((r: any) => r.id);
      expect(left.sort()).toEqual([heldRow.id, recent.id].sort());
    });
  });
});

describe('monthly automatic preview and opt-in apply', () => {
  it('previews monthly and tells the owner; applies only when the setting is on, 14 days later, only what was previewed', async () => {
    await asService(async svc => {
      const kid = await leaver(svc, 11);
      const notes = async () => (await svc(`select title, body from notification where user_id = $1 and kind like 'retention%' order by created_at`, [USERS.owner]));

      // app.tick runs the preview.
      const [{ t }] = await svc(`select app.tick() t`);
      expect(t.retention).toBeGreaterThan(0);
      let [pol] = await svc(`select * from retention_policy where studio_id = $1`, [STUDIO_ID]);
      expect(pol.auto_preview_at).not.toBeNull();
      expect(pol.auto_preview_items).toContain(`anonymise:${kid}`);
      const [first] = await notes();
      expect(first.title).toMatch(/^\d+ records? (is|are) due under your retention policy — review and apply$/);
      expect(Number(first.title.split(' ')[0])).toBe(pol.auto_preview_count);
      // Nothing applied.
      expect((await svc(`select first_name from student where id = $1`, [kid]))[0].first_name).not.toBe('Former');
      // Not again within the month.
      expect(await svc(`select app.retention_tick($1) r`, [STUDIO_ID])).toEqual([{ r: null }]);

      // Setting off: 15 days later nothing is applied.
      await svc(`update retention_policy set auto_preview_at = now() - interval '15 days' where studio_id = $1`, [STUDIO_ID]);
      expect(await svc(`select app.retention_tick($1) r`, [STUDIO_ID])).toEqual([{ r: null }]);
      expect((await svc(`select first_name from student where id = $1`, [kid]))[0].first_name).not.toBe('Former');

      // Setting on: applies, but a child who became due after the preview waits for the next one.
      const late = await leaver(svc, 12);
      await svc(`update retention_policy set auto_apply = true where studio_id = $1`, [STUDIO_ID]);
      expect(await svc(`select app.retention_tick($1) r`, [STUDIO_ID])).toEqual([{ r: 'applied' }]);
      expect((await svc(`select first_name from student where id = $1`, [kid]))[0].first_name).toBe('Former');
      expect((await svc(`select first_name from student where id = $1`, [late]))[0].first_name).not.toBe('Former');
      expect(await svc(`select app.retention_tick($1) r`, [STUDIO_ID])).toEqual([{ r: null }]);
      const n = await notes();
      expect(n[n.length - 1].title).toMatch(/handled under your retention policy/);

      // Every automatic run is logged.
      const logs = await svc(`select summary from audit_log where studio_id = $1 and entity = 'retention_policy' and action = 'retention' order by id`, [STUDIO_ID]);
      expect(logs.map((l: any) => l.summary.split(':')[0])).toEqual(['Automatic retention preview', 'Automatic retention applied']);

      // A month on, the next preview picks up the late leaver.
      await svc(`update retention_policy set auto_preview_at = now() - interval '32 days' where studio_id = $1`, [STUDIO_ID]);
      expect(await svc(`select app.retention_tick($1) r`, [STUDIO_ID])).toEqual([{ r: 'preview' }]);
      [pol] = await svc(`select * from retention_policy where studio_id = $1`, [STUDIO_ID]);
      expect(pol.auto_preview_items).toContain(`anonymise:${late}`);
      expect(pol.auto_applied_at).toBeNull();
    });
  });
  it('the scheduled functions are not callable by users', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.retention_tick($1)`, [STUDIO_ID]))).toMatch(/permission denied/);
      expect(await expectRejected(() => q(`select * from app.retention_run($1, true)`, [STUDIO_ID]))).toMatch(/permission denied/);
    });
  });
});
