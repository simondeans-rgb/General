import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asReader, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, FAMILY, uid, NS } from './helpers';
import * as G from '../src/lib/repos/safeguarding';
import * as H from '../src/lib/repos/hub';
import { CONSENT_SNAPSHOT } from '../src/lib/repos/consent';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const record = async (q: any, args: { kind: 'child' | 'adult' | 'staff'; student?: string; staff?: string; user?: string; who?: string;
  category?: string; summary?: string; children?: string[] }): Promise<G.Receipt> =>
  (await q(G.RECORD, [STUDIO_ID, args.kind, args.student ?? null, args.staff ?? null, args.user ?? null, args.who ?? null,
    args.category ?? 'other', args.summary ?? 'Something I saw that worried me today', false, args.children ?? null]))[0].r;
const ROUTE = 'LADO, Royal Greenwich: 020 8921 3930, lado@example.gov.uk';
const freyaStaff = uid(NS.staff, 1);

describe('F1 · no safeguarding lead named', () => {
  it('a concern goes to the owner, the receipt says so, and the outside route is shown', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      await svc(`update studio set safeguarding_outside_route = $2 where id = $1`, [STUDIO_ID, ROUTE]);
      const routing = (await q(G.ROUTING, [STUDIO_ID]))[0].r as G.Routing;
      expect(routing).toMatchObject({ lead: null, deputy: null, outside_route: ROUTE });
      expect(routing.owners.map(o => o.name)).toEqual(['Freya Lindqvist']);
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.a]);
      const r = await record(q, { kind: 'child', student: kid.id, category: 'wellbeing' });
      expect(r).toMatchObject({ no_lead: true, nobody: false, outside_route: ROUTE, not_told: [] });
      expect(r.told).toEqual([{ name: 'Freya Lindqvist', part: 'owner' }]);
      const [c] = await svc(`select told_user_ids, routing_note from safeguarding_concern where id = $1`, [r.id]);
      expect(c.told_user_ids).toEqual([USERS.owner]);
      expect(c.routing_note).toMatch(/No safeguarding lead named/);
    });
  });

  it('an allegation about the owner is recorded, nobody is told, the raiser gets the outside route, and a lead named later is told', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      await svc(`update studio set safeguarding_outside_route = $2 where id = $1`, [STUDIO_ID, ROUTE]);
      await svc(`delete from notification`);
      const r = await record(q, { kind: 'staff', staff: freyaStaff, summary: 'Freya grabbed a child by the arm in the corridor' });
      expect(r).toMatchObject({ nobody: true, no_lead: true, told: [], outside_route: ROUTE });
      expect(r.not_told).toEqual([{ name: 'Freya Lindqvist', part: 'owner', why: 'subject' }]);
      // Not silently dropped: the record exists, says who was not told, and the owner is not notified.
      const [c] = await svc(`select told_user_ids, routing_note, subject_user_id, allegation from safeguarding_concern where id = $1`, [r.id]);
      expect(c).toMatchObject({ told_user_ids: [], subject_user_id: USERS.owner, allegation: true });
      expect(c.routing_note).toMatch(/Nobody in the school was told.*Not told, because it is about them: Freya Lindqvist/);
      expect(await svc(`select 1 from notification where kind = 'safeguarding'`)).toHaveLength(0);
      expect(await svc(`select what from safeguarding_access where concern_id = $1`, [r.id]))
        .toEqual([{ what: 'raised a concern that nobody in the school could be told about' }]);
      // The owner cannot read it.
      await as(svc, USERS.owner);
      expect((await q(G.LOG, [STUDIO_ID, null])).some((x: any) => x.id === r.id)).toBe(false);
      // Naming a lead tells them it is waiting, and they can read it.
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);
      expect(await svc(`select title from notification where user_id = $1 and kind = 'safeguarding'`, [USERS.admin]))
        .toEqual([{ title: '1 concern was recorded when nobody could be told' }]);
      await as(svc, USERS.admin);
      expect((await q(G.LOG, [STUDIO_ID, null])).find((x: any) => x.id === r.id)).toMatchObject({ subject_name: 'Freya Lindqvist', allegation: true });
    });
  });
});

describe('F1 · with a lead and a deputy', () => {
  it('the deputy reads concerns; an allegation about the lead goes to the deputy and the owner, and the receipt says the lead was not told', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);
      await q(G.SET_DEPUTY, [USERS.teacherModern]);
      expect(await expectRejected(() => q(G.SET_DEPUTY, [USERS.admin]))).toMatch(/other than the lead/);
      expect(await expectRejected(() => q(G.SET_DEPUTY, [USERS.guardianA]))).toMatch(/member of staff/);
      await q(G.SET_OUTSIDE_ROUTE, [STUDIO_ID, ROUTE]);
      // Nadia (office) can be chosen: she is in the staff list though she has no timetable record.
      await as(svc, USERS.teacherTap);
      const staff = await q(G.STAFF_PICK, [STUDIO_ID]) as G.StaffPerson[];
      const nadia = staff.find(s => s.user_id === USERS.admin)!;
      expect(nadia).toMatchObject({ name: 'Nadia Okafor', role: 'admin', staff_id: null });
      expect(staff.find(s => s.user_id === USERS.owner)).toMatchObject({ role: 'owner', staff_id: freyaStaff });
      const r = await record(q, { kind: 'staff', user: USERS.admin, summary: 'Nadia shouted at a child at the front desk' });
      expect(r.nobody).toBe(false);
      expect(r.no_lead).toBe(false);
      expect(r.told.map(t => t.part)).toEqual(['deputy', 'owner']);
      expect(r.not_told).toEqual([{ name: 'Nadia Okafor', part: 'lead', why: 'subject' }]);
      // Nadia, the lead, never sees it; Priya, the deputy, does.
      await as(svc, USERS.admin);
      expect((await q(G.LOG, [STUDIO_ID, null])).some((x: any) => x.id === r.id)).toBe(false);
      expect(await expectRejected(() => q(G.CHRONOLOGY, [r.id, 'view']))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.teacherModern);
      expect((await q(`select app.is_safeguarding_lead($1) v`, [STUDIO_ID]))[0].v).toBe(true);
      expect((await q(G.LOG, [STUDIO_ID, null])).find((x: any) => x.id === r.id)).toMatchObject({ subject_name: 'Nadia Okafor', allegation: true });
    });
  });

  it('a parent learns nothing of the routing or the staff list', async () => {
    await asReader(USERS.guardianA, async q => {
      expect((await q(G.ROUTING, [STUDIO_ID]))[0].r).toBeNull();
      expect(await q(G.STAFF_PICK, [STUDIO_ID])).toHaveLength(0);
    });
  });
});

describe('Staff checks for every member of staff', () => {
  it('office staff appear in the summary and the owner can record their DBS', async () => {
    await asUser(USERS.owner, async q => {
      const before = await q(G.CHECK_SUMMARY, [STUDIO_ID]) as G.CheckGap[];
      expect(before.find(r => r.user_id === USERS.admin)).toMatchObject({ name: 'Nadia Okafor', issue: 'No DBS on file', staff_id: null });
      await q(G.ADD_CHECK, [null, USERS.admin, STUDIO_ID, 'dbs', '001234567890', '2026-01-10', '2029-01-10']);
      const after = await q(G.CHECK_SUMMARY, [STUDIO_ID]) as G.CheckGap[];
      expect(after.find(r => r.user_id === USERS.admin)).toMatchObject({ issue: null });
      expect(await q(G.CHECKS, [null, USERS.admin])).toHaveLength(1);
      // Teachers still work by their staff record.
      expect(after.find(r => r.staff_id === freyaStaff)).toBeTruthy();
      // A check cannot be pinned on someone who is not staff here.
      expect(await expectRejected(() => q(G.ADD_CHECK, [null, USERS.guardianA, STUDIO_ID, 'dbs', null, '2026-01-10', null]))).toMatch(/INVALID/);
    });
  });

  it('a check about to expire for office staff reminds the owner and the lead', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(`select app.set_safeguarding_lead($1)`, [USERS.teacherModern]);
      await q(G.ADD_CHECK, [null, USERS.admin, STUDIO_ID, 'first_aid', null, '2024-01-10', new Date(Date.now() + 10 * 86400_000).toISOString().slice(0, 10)]);
      await svc(`delete from notification`);
      expect((await q(`select app.remind_staff_checks($1) n`, [STUDIO_ID]))[0].n).toBeGreaterThanOrEqual(1);
      const n = await svc(`select user_id, title from notification where kind = 'staff_check_due' and title like '%Nadia Okafor%'`);
      // The lead is told (the owner ran it, and is not notified of their own action).
      expect(n.map((x: any) => x.user_id)).toContain(USERS.teacherModern);
    });
  });

  it('checks for someone who left are cleared under retention, unless a concern is about them', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(G.ADD_CHECK, [null, USERS.admin, STUDIO_ID, 'dbs', 'REF-1', '2020-01-10', null]);
      await svc(`update membership set deleted_at = now() - interval '30 months' where user_id = $1 and studio_id = $2`, [USERS.admin, STUDIO_ID]);
      await svc(`update retention_policy set staff_check_months = 12, staff_months = 60 where studio_id = $1`, [STUDIO_ID]);
      const preview = await q(G.PREVIEW_RETENTION, [STUDIO_ID]);
      expect(preview.find((p: any) => p.entity_id === USERS.admin)).toMatchObject({ step: 'staff_check', who: 'Nadia Okafor' });
      await q(G.RUN_RETENTION, [STUDIO_ID]);
      expect(await svc(`select reference from staff_check where user_id = $1`, [USERS.admin])).toEqual([{ reference: null }]);
      // With a concern about her, it is held instead.
      await svc(`insert into safeguarding_concern (studio_id, category, summary, subject_kind, subject_user_id, allegation)
                 values ($1, 'allegation', 'An allegation kept on file', 'staff', $2, true)`, [STUDIO_ID, USERS.admin]);
      await svc(`update staff_check set reference = 'REF-2' where user_id = $1`, [USERS.admin]);
      const held = (await q(G.PREVIEW_RETENTION, [STUDIO_ID])).find((p: any) => p.entity_id === USERS.admin);
      expect(held).toMatchObject({ step: 'held', reason: 'Safeguarding record about this member of staff still kept' });
    });
  });
});

describe('Children involved in a concern about an adult', () => {
  it('links the child; the child record shows it to the lead and owner only; retention holds the child', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [clara] = await svc(`select id from student where family_id = $1 order by first_name limit 1`, [FAMILY.a]);
      const r = await record(q, { kind: 'adult', who: 'Man in a grey van', children: [clara.id],
        summary: 'Tried to collect Clara at pick-up; not on her list' });
      // A teacher (not the lead) sees nothing on the child record.
      expect(await q(G.CHILD_CONCERNS, [clara.id])).toHaveLength(0);
      await as(svc, USERS.owner);
      const mine = await q(G.CHILD_CONCERNS, [clara.id]) as G.ChildConcern[];
      expect(mine.find(c => c.concern_id === r.id)).toMatchObject({ linked: true, subject_kind: 'adult', subject_name: 'Man in a grey van' });
      expect((await q(G.LOG, [STUDIO_ID, null])).find((c: any) => c.id === r.id).children).toMatch(/\S+ \S+/);
      expect((await svc(`select app.retention_hold_reason($1, null) r`, [clara.id]))[0].r).toBe('Named in a safeguarding concern still kept');
      // The lead can unlink and link again; both are logged.
      await q(G.LINK_CHILD, [r.id, clara.id, false]);
      expect((await svc(`select app.retention_hold_reason($1, null) r`, [clara.id]))[0].r).toBeNull();
      await q(G.LINK_CHILD, [r.id, clara.id, true]);
      expect((await svc(`select count(*)::int n from safeguarding_access where concern_id = $1 and what like '%linked%'`, [r.id]))[0].n).toBe(2);
      // A parent cannot link or read.
      await as(svc, USERS.guardianA);
      expect(await q(G.CHILD_CONCERNS, [clara.id])).toHaveLength(0);
      expect(await expectRejected(() => q(G.LINK_CHILD, [r.id, clara.id, true]))).toMatch(/FORBIDDEN/);
    });
  });

  it('a child from another school cannot be linked', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [other] = await svc(`select id from student where studio_id <> $1 limit 1`, [STUDIO_ID]);
      if (!other) return;
      expect(await expectRejected(() => record(q, { kind: 'adult', who: 'Someone', children: [other.id] }))).toMatch(/INVALID/);
    });
  });
});

describe('F13 · referrals and the chronology', () => {
  it('a referral needs who it went to; the fields come back; printing and exporting are logged', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.b]);
      const r = await record(q, { kind: 'child', student: kid.id, category: 'disclosure' });
      expect(await expectRejected(() => q(G.RECORD_ACTION, [r.id, 'Phoned the front door', 'referred', null, null, null, null]))).toMatch(/who it was referred to/);
      expect(await expectRejected(() => q(G.RECORD_ACTION, [r.id, 'Phoned', 'referred', 'Children’s services', '2099-01-01', null, null]))).toMatch(/future/);
      await q(G.RECORD_ACTION, [r.id, 'Phoned the MASH', 'referred', 'Greenwich MASH', '2026-11-27', 'MASH-4471', null]);
      await q(G.RECORD_ACTION, [r.id, 'MASH called back', null, null, null, null, 'No further action; early help offered']);
      const actions = await q(G.ACTIONS, [r.id, null]) as G.Action[];
      expect(actions[0]).toMatchObject({ status_to: 'referred', referred_to: 'Greenwich MASH', referral_ref: 'MASH-4471' });
      expect(String(actions[0]!.referred_on)).toMatch(/2026|Nov/);
      expect(actions[1]).toMatchObject({ outcome: 'No further action; early help offered' });
      const c = (await q(G.CHRONOLOGY, [r.id, 'view']))[0].c as G.Chronology;
      expect(c).toMatchObject({ reference: r.id.slice(0, 8).toUpperCase(), prepared_by: 'Freya Lindqvist', status: 'referred' });
      expect(c.actions.map(a => a.referred_to)).toEqual(['Greenwich MASH', null]);
      await q(G.CHRONOLOGY, [r.id, 'print']);
      await q(G.CHRONOLOGY, [r.id, 'export']);
      const log = (await svc(`select what from safeguarding_access where concern_id = $1 order by id`, [r.id])).map((x: any) => x.what);
      expect(log).toEqual(expect.arrayContaining(['opened the chronology to print', 'printed the chronology', 'exported the chronology']));
      // The old three-argument action still works, and a teacher cannot print.
      await q(G.ACT, [r.id, 'Closed after review', 'closed']);
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(G.CHRONOLOGY, [r.id, 'print']))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('Outside links for media of children', () => {
  const show = uid(NS.resource, 3);   // seeded: shows children, on a public video site

  it('blocked by default: a teacher cannot add one; uploads still work; the office sees the existing one', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [cls] = await svc(`select c.id from class c join staff_member sm on sm.id = c.teacher_id where sm.user_id = $1 limit 1`, [USERS.teacherTap]);
      expect(await expectRejected(() => q(H.CREATE_RESOURCE, [cls.id, 'video', 'Show run', null, null, 'https://vimeo.com/1', null, true, true, true, false])))
        .toMatch(/Upload the file instead/);
      // A link that does not show children is fine, and so is an upload that does.
      expect(await q(H.CREATE_RESOURCE, [cls.id, 'video', 'Technique', null, null, 'https://vimeo.com/2', null, true, true, false, false])).toHaveLength(1);
      expect(await q(H.CREATE_RESOURCE, [cls.id, 'video', 'Show run', null, null, null, null, true, true, true, false])).toHaveLength(1);
      expect(await q(G.CHILD_MEDIA_LINKS, [STUDIO_ID])).toHaveLength(0);   // teachers are not the office
      await as(svc, USERS.admin);
      const flagged = await q(G.CHILD_MEDIA_LINKS, [STUDIO_ID]) as G.ChildMediaLink[];
      expect(flagged.map(f => f.id)).toContain(show);
      expect(flagged.find(f => f.id === show)!.hidden).toBe(true);
    });
  });

  it('while blocked, an existing link of children never reaches families, even with consent; the owner can turn it off', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kids = await svc(`select student_id from resource_child where resource_id = $1`, [show]);
      for (const k of kids) {
        await svc(`insert into consent_record (studio_id, student_id, kind, granted, source) values ($1, $2, 'video', true, 'office')`, [STUDIO_ID, k.student_id]);
      }
      expect((await svc(`select app.resource_family_visible($1) v`, [show]))[0].v).toBe(false);
      await q(G.SET_BLOCK_LINKS, [STUDIO_ID, false]);
      expect((await svc(`select app.resource_family_visible($1) v`, [show]))[0].v).toBe(true);
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(G.SET_BLOCK_LINKS, [STUDIO_ID, true]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('Hold review dates', () => {
  it('a hold has a review date; when due it is listed; the lead keeps it with a new date', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select id from student where family_id = $1 limit 1`, [FAMILY.c]);
      await q(G.SET_HOLD, [kid.id, 'Police asked us to preserve']);
      let rows = await q(G.HOLD_REVIEWS, [STUDIO_ID]) as G.HoldReview[];
      expect(rows.find(h => h.id === kid.id)).toMatchObject({ hold_kind: 'child', due: false });
      await svc(`update safeguarding_hold set review_on = current_date - 1 where student_id = $1`, [kid.id]);
      rows = await q(G.HOLD_REVIEWS, [STUDIO_ID]);
      expect(rows.find(h => h.id === kid.id)!.due).toBe(true);
      expect(await expectRejected(() => q(G.REVIEW_HOLD, ['child', kid.id, '2020-01-01']))).toMatch(/INVALID/);
      const next = new Date(Date.now() + 200 * 86400_000).toISOString().slice(0, 10);
      await q(G.REVIEW_HOLD, ['child', kid.id, next]);
      expect((await q(G.HOLD_REVIEWS, [STUDIO_ID])).find((h: any) => h.id === kid.id).due).toBe(false);
      await as(svc, USERS.teacherTap);
      expect(await q(G.HOLD_REVIEWS, [STUDIO_ID])).toHaveLength(0);
    });
  });
});

describe('Event consent snapshot', () => {
  it('lists everyone going with consent as at the chosen time; office and the event teacher only', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [kid] = await svc(`select id, first_name || ' ' || last_name as name from student where family_id = $1 limit 1`, [FAMILY.a]);
      const [tap] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherTap]);
      const [ev] = await svc(`insert into studio_event (studio_id, kind, title, starts_at, teacher_id) values ($1, 'show', 'Winter show', now() + interval '10 days', $2) returning id`,
        [STUDIO_ID, tap.id]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed')`, [STUDIO_ID, ev.id, kid.id]);
      await svc(`delete from consent_record where student_id = $1`, [kid.id]);
      await svc(`insert into consent_record (studio_id, student_id, kind, granted, granted_at, source) values
                 ($1, $2, 'photography', true, now() - interval '10 days', 'office'),
                 ($1, $2, 'photography', false, now() - interval '2 days', 'office'),
                 ($1, $2, 'video', true, now() - interval '10 days', 'office')`, [STUDIO_ID, kid.id]);
      const nowRows = await q(CONSENT_SNAPSHOT, [ev.id, null]);
      expect(nowRows.find((r: any) => r.student_id === kid.id)).toMatchObject({ photography: false, video: true, social_media: null, participation: 'confirmed' });
      const before = await q(CONSENT_SNAPSHOT, [ev.id, new Date(Date.now() - 5 * 86400_000).toISOString()]);
      expect(before.find((r: any) => r.student_id === kid.id)).toMatchObject({ photography: true, video: true });
      const ancient = await q(CONSENT_SNAPSHOT, [ev.id, '2000-01-01T00:00:00Z']);
      expect(ancient.find((r: any) => r.student_id === kid.id)).toMatchObject({ photography: null, video: null });
      // A future time is read as now.
      const future = await q(CONSENT_SNAPSHOT, [ev.id, '2099-01-01T00:00:00Z']);
      expect(future[0].photography).toBe(false);
      // The event's teacher may print it; another teacher and a parent may not.
      await as(svc, USERS.teacherTap);
      expect(await q(CONSENT_SNAPSHOT, [ev.id, null])).toHaveLength(1);
      await as(svc, USERS.teacherStreet);
      expect(await expectRejected(() => q(CONSENT_SNAPSHOT, [ev.id, null]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(CONSENT_SNAPSHOT, [ev.id, null]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('Today shows what the safeguarding setup still needs', () => {
  it('no lead, outside links of children, holds to review', async () => {
    await asReader(USERS.owner, async q => {
      const [t] = await q(G.SAFEGUARDING_TODAY);
      expect(t).toMatchObject({ no_lead: true });
      expect(t.media_links).toBeGreaterThanOrEqual(1);
    });
    await asUser(USERS.owner, async q => {
      await q(`select app.set_safeguarding_lead($1)`, [USERS.admin]);
      expect((await q(G.SAFEGUARDING_TODAY))[0].no_lead).toBe(false);
    });
    await asReader(USERS.teacherTap, async q => {
      const [t] = await q(G.SAFEGUARDING_TODAY);
      expect(t).toMatchObject({ no_lead: false, media_links: 0, holds_due: 0 });
    });
  });
});
