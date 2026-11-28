import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, CLASS, FAMILY, STUDIO_ID } from './helpers';
import * as E from '../src/lib/repos/events';
import * as S from '../src/lib/repos/seasons';

/* Round 2 F2 (one exam model), F3 (re-enrolment and moving up), F7 (show
   production pack) and the uniform list per class — migration 0066. */

beforeAll(async () => { await rebuild(); }, 120_000);
afterAll(async () => { await closeDb(); });

const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const SEED_EXAM = uid(NS.event, 3);
const SHOW = uid(NS.event, 2);
const kidOf = async (svc: any, cls: string, offset = 0) => (await svc(`select s.id, s.first_name, s.family_id, g.user_id guardian from enrolment e join student s on s.id = e.student_id
  join guardian g on g.family_id = s.family_id and g.user_id is not null where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
  order by s.id offset $2 limit 1`, [cls, offset]))[0];

describe('F2 · one exam model', () => {
  it('the seeded exam event and its entries agree: Confirmed on Events is Confirmed on the child card', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [x] = await q(`select * from exam_session where event_id = $1`, [SEED_EXAM]);
      expect(x).toBeTruthy();
      expect(x.board).toBe('RAD');
      expect(x.fee_minor).toBe(6200);
      const going = await svc(`select student_id from event_participant where event_id = $1 and status = 'confirmed' and deleted_at is null`, [SEED_EXAM]);
      const entries = await svc(`select student_id, grade, confirmed_at from exam_entry where session_id = $1 and status <> 'withdrawn'`, [x.id]);
      expect(going.length).toBeGreaterThan(0);
      expect(entries.map((e: any) => e.student_id).sort()).toEqual(going.map((p: any) => p.student_id).sort());
      expect(entries.every((e: any) => e.grade === 'Grade 3' && e.confirmed_at)).toBe(true);
      // The parent of one of them sees the same on the child card.
      const [g] = await svc(`select s.id, g.user_id from student s join guardian g on g.family_id = s.family_id and g.user_id is not null where s.id = $1`, [going[0].student_id]);
      await as(svc, g.user_id);
      const card = await q(E.STUDENT_EXAMS, [g.id]);
      expect(card).toHaveLength(1);
      expect(S.examStage(card[0])).toBe('confirmed');
      // And "Coming up" counts the fee once, as an exam, not again as an event.
      const fam = (await svc(`select family_id from student where id = $1`, [g.id]))[0].family_id;
      const coming = (await q(`select * from app.upcoming_costs($1)`, [fam])).filter((r: any) => r.student_id === g.id && /exam/i.test(r.title + r.kind));
      expect(coming).toHaveLength(1);
      expect(coming[0].kind).toBe('exam');
    });
  });

  it('a session made in the office is in the diary; entering, accepting, sitting and a result follow one record', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: x }] = await q(`insert into exam_session (studio_id, board, title, exam_on, venue, fee_minor) values ($1, 'ISTD', 'Spring tap exams', current_date + 40, 'Studio 1', 4500) returning id`, [STUDIO_ID]);
      const [ev] = await q(`select e.* from studio_event e join exam_session x on x.event_id = e.id where x.id = $1`, [x]);
      expect(ev.kind).toBe('exam');
      expect(ev.title).toBe('ISTD Spring tap exams');
      expect(ev.cost_minor).toBe(4500);
      // Moving the session moves the diary entry.
      await q(`update exam_session set exam_on = exam_on + 2 where id = $1`, [x]);
      const [moved] = await q(`select starts_at from studio_event where id = $1`, [ev.id]);
      expect(new Date(moved.starts_at).getTime() - new Date(ev.starts_at).getTime()).toBe(2 * 86400_000);

      const kid = await kidOf(svc, CLASS.juniorTap);
      await as(svc, USERS.teacherTap);
      const [{ id: entry }] = await q(E.ENTER_EXAM, [x, kid.id, 'Grade 1', null]);
      expect((await q(`select fee_minor from exam_entry where id = $1`, [entry]))[0].fee_minor).toBe(4500);   // the session's fee
      // The family is asked to confirm on Events, and the child card says so.
      await as(svc, kid.guardian);
      const [p] = await q(`select id, status from event_participant where event_id = $1 and student_id = $2`, [ev.id, kid.id]);
      expect(p.status).toBe('invited');
      expect(S.examStage((await q(E.STUDENT_EXAMS, [kid.id]))[0])).toBe('entered');
      await q(`select app.answer_invitation($1, true)`, [p.id]);
      const [card] = await q(E.STUDENT_EXAMS, [kid.id]);
      expect(S.examStage(card)).toBe('confirmed');
      // A teacher can set the candidate time but not the fee.
      await as(svc, USERS.teacherTap);
      expect(await expectRejected(() => q(S.UPDATE_EXAM_ENTRY, [entry, 'Grade 1', 100, null]))).toMatch(/office sets exam fees/);
      await q(S.UPDATE_EXAM_ENTRY, [entry, 'Grade 1', 4500, new Date(Date.now() + 42 * 86400_000).toISOString()]);
      await q(E.EXAM_RESULT, [entry, 'merit', 81]);
      await as(svc, kid.guardian);
      const [done] = await q(E.STUDENT_EXAMS, [kid.id]);
      expect(S.examStage(done)).toBe('result');
      expect((await q(`select status from event_participant where event_id = $1 and student_id = $2`, [ev.id, kid.id]))[0].status).toBe('confirmed');
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(E.WITHDRAW_EXAM, [entry]))).toMatch(/has been sat/);
      expect((await q(`select status from exam_entry where id = $1`, [entry]))[0].status).toBe('sat');
    });
  });

  it('an Exam event made on the Events screen is a session; invited classes are entered; fees bill once from either screen', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: ev }] = await q(E.CREATE_EVENT, ['exam', 'published', 'IDTA Modern exams', '', new Date(Date.now() + 30 * 86400_000).toISOString(),
        null, 'Blackheath Studio', 3800, null, null, false]);
      const [x] = await q(`select * from exam_session where event_id = $1`, [ev]);
      expect(x.board).toBe('IDTA');
      expect(x.fee_minor).toBe(3800);
      const n = (await q(E.INVITE_CLASSES, [ev, [CLASS.juniorTap]]))[0].n;
      expect(n).toBeGreaterThan(0);
      const entries = await q(`select * from exam_entry where session_id = $1`, [x.id]);
      expect(entries).toHaveLength(n);
      expect(entries.every((e: any) => e.status === 'entered' && !e.confirmed_at && e.fee_minor === 3800)).toBe(true);
      // The office confirms one on the exam list; Events shows them going.
      await q(S.CONFIRM_EXAM_ENTRY, [entries[0].id, true]);
      expect((await q(`select status from event_participant where event_id = $1 and student_id = $2`, [ev, entries[0].student_id]))[0].status).toBe('confirmed');
      // A family declining on Events withdraws the entry.
      const other = entries[1];
      await svc(`update event_participant set status = 'declined' where event_id = $1 and student_id = $2`, [ev, other.student_id]);
      expect((await q(`select status from exam_entry where id = $1`, [other.id]))[0].status).toBe('withdrawn');
      // "Bill the fee" on the event bills the entries; the exam list then has nothing left.
      const billed = (await q(E.BILL_EVENT, [ev]))[0].n;
      expect(billed).toBe(n - 1);
      expect((await q(E.BILL_EXAM, [x.id]))[0].n).toBe(0);
      expect((await q(E.BILL_EVENT, [ev]))[0].n).toBe(0);
      const items = await svc(`select count(*)::int n from invoice_item where event_id = $1`, [ev]);
      expect(items[0].n).toBe(n - 1);
      // A billed fee is not changed silently.
      expect(await expectRejected(() => q(S.UPDATE_EXAM_ENTRY, [entries[0].id, entries[0].grade, 100, null]))).toMatch(/already billed/);
      // The family's Coming up shows it once, as invoiced.
      const fam = (await svc(`select family_id from student where id = $1`, [entries[0].student_id]))[0].family_id;
      const lines = (await q(`select * from app.upcoming_costs($1)`, [fam])).filter((r: any) => r.student_id === entries[0].student_id && r.kind === 'exam');
      expect(lines).toHaveLength(1);
      expect(lines[0].state).toBe('invoiced');
      // Moving the event's date moves the exam.
      await q(`update studio_event set starts_at = starts_at + interval '1 day' where id = $1`, [ev]);
      expect((await q(`select exam_on from exam_session where id = $1`, [x.id]))[0].exam_on.getTime()).toBeGreaterThan(x.exam_on.getTime());
    });
  });

  it('imported past results do not put old exams in the diary; only the office and the child’s teachers change entries', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: x }] = await q(`insert into exam_session (studio_id, board, title, exam_on, imported) values ($1, 'RAD', 'RAD exams', current_date - 200, true) returning id`, [STUDIO_ID]);
      expect((await q(`select event_id from exam_session where id = $1`, [x]))[0].event_id).toBeNull();
      const [{ id: x2 }] = await q(`insert into exam_session (studio_id, board, title, exam_on) values ($1, 'ISTD', 'Tap', current_date + 20) returning id`, [STUDIO_ID]);
      const kid = await kidOf(svc, CLASS.juniorTap, 1);
      const [{ id: entry }] = await q(E.ENTER_EXAM, [x2, kid.id, 'Grade 2', 3000]);
      const [stranger] = await svc(`select g.user_id from guardian g where g.user_id is not null and g.family_id <> $1 limit 1`, [kid.family_id]);
      await as(svc, stranger.user_id);
      expect(await expectRejected(() => q(S.CONFIRM_EXAM_ENTRY, [entry, true]))).toMatch(/FORBIDDEN/);
      await as(svc, kid.guardian);
      expect(await expectRejected(() => q(S.EXAM_CERTIFICATE, [entry, true]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`update exam_entry set confirmed_at = now() where id = $1 returning id`, [entry]))).toBeTruthy();
    });
  });
});

describe('F3 · re-enrolment and moving up', () => {
  const nextTerm = async (svc: any) => (await svc(`insert into term (studio_id, name, starts_on, ends_on, status) values ($1, 'Next year autumn', current_date + 120, current_date + 200, 'published') returning id`, [STUDIO_ID]))[0].id;
  const fromTerm = async (svc: any) => (await svc(`select term_id from class where id = $1`, [CLASS.grade3Ballet]))[0].term_id;

  it('proposes each child’s next class by level and age, copying the classes in, and keeps it all a draft', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const to = await nextTerm(svc); const from = await fromTerm(svc);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(S.START_REENROLMENT, [from, to, null]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.admin);
      expect(await expectRejected(() => q(S.START_REENROLMENT, [from, to, '2000-01-01']))).toMatch(/reply date/);
      const [{ id: round }] = await q(S.START_REENROLMENT, [from, to, new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10)]);
      // Next term's classes were laid down from this term's (not the drop-in).
      const next = await q(`select c.name, c.uniform from class c where c.term_id = $1 and c.deleted_at is null`, [to]);
      expect(next.length).toBe(12);
      expect(next.find((c: any) => c.name === 'Grade 3 Ballet').uniform.length).toBeGreaterThan(0);   // uniform carried over
      const offers = await q(`select o.*, fc.level_id from_level, fc.dance_style_id from_style, c.level_id to_level, c.dance_style_id to_style,
                                     c.age_min, c.age_max, extract(year from age(t.starts_on, s.date_of_birth))::int yrs, fc.name from_name, c.name to_name
                                from reenrolment_offer o join class fc on fc.id = o.from_class_id left join class c on c.id = o.class_id
                                join term t on t.id = $2 join student s on s.id = o.student_id where o.round_id = $1`, [round, to]);
      expect(offers.length).toBeGreaterThan(100);
      const up = offers.filter((o: any) => o.reason === 'moves_up');
      expect(up.some((o: any) => o.from_name === 'Grade 2 Ballet' && o.to_name === 'Grade 3 Ballet')).toBe(true);
      for (const o of offers.filter((o: any) => o.class_id)) {
        expect(o.to_style).toBe(o.from_style);
        expect(o.age_min == null || o.yrs >= o.age_min).toBe(true);
        expect(o.age_max == null || o.yrs <= o.age_max).toBe(true);
      }
      // Nobody is enrolled into next term yet, and families see nothing in a draft.
      expect((await q(`select count(*)::int n from enrolment e join class c on c.id = e.class_id where c.term_id = $1`, [to]))[0].n).toBe(0);
      await as(svc, USERS.guardianA);
      expect(await q(S.FAMILY_REENROLMENT)).toHaveLength(0);
      expect(await q(`select * from reenrolment_offer`)).toHaveLength(0);
    });
  });

  it('a level’s "moves up to" changes the proposal; the office can change any proposal', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const to = await nextTerm(svc); const from = await fromTerm(svc);
      const lv = await q(`select id, name from level order by sort_order`);
      const g2 = lv.find((l: any) => l.name === 'Grade 2').id, inter = lv.find((l: any) => l.name === 'Intermediate').id;
      await q(S.SET_NEXT_LEVEL, [g2, inter]);   // no Intermediate ballet class: Grade 2 children cannot "move up" to it
      const [{ id: round }] = await q(S.START_REENROLMENT, [from, to, new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10)]);
      const g2offers = await q(`select o.* from reenrolment_offer o where o.round_id = $1 and o.from_class_id = $2`, [round, uid(NS.class, 3)]);
      expect(g2offers.length).toBeGreaterThan(0);
      expect(g2offers.some((o: any) => o.reason === 'moves_up')).toBe(false);
      const g3next = (await q(`select id from class where term_id = $1 and name = 'Grade 3 Ballet'`, [to]))[0].id;
      await q(S.SET_REENROLMENT_CLASS, [g2offers[0].id, g3next]);
      const [o] = await q(`select class_id, reason from reenrolment_offer where id = $1`, [g2offers[0].id]);
      expect(o).toEqual({ class_id: g3next, reason: 'office' });
      expect(await expectRejected(() => q(S.SET_REENROLMENT_CLASS, [g2offers[0].id, CLASS.grade3Ballet]))).toMatch(/new term/);
    });
  });

  it('families confirm or opt out by the date; publishing enrols, waitlists the over-full and offers spare places; it can be undone before', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const to = await nextTerm(svc); const from = await fromTerm(svc);
      const today = new Date().toISOString().slice(0, 10);
      const [{ id: round }] = await q(S.START_REENROLMENT, [from, to, today]);
      const sent = (await q(S.OPEN_REENROLMENT, [round]))[0].n;
      expect(sent).toBeGreaterThan(10);
      // One message per family, however many children.
      const notes = await svc(`select count(*)::int n from notification where user_id = $1 and title like 'Confirm %'`, [USERS.guardianA]);
      expect(notes[0].n).toBe(1);

      await as(svc, USERS.guardianA);
      const mine = await q(S.FAMILY_REENROLMENT);
      expect(mine.length).toBeGreaterThan(0);
      expect(mine.every((m: any) => m.round_status === 'open')).toBe(true);
      const kidsA = (await svc(`select id from student where family_id = $1`, [FAMILY.a])).map((r: any) => r.id);
      expect(mine.every((m: any) => kidsA.includes(m.student_id))).toBe(true);
      const withClass = mine.filter((m: any) => m.class_id);
      await q(S.ANSWER_REENROLMENT, [withClass[0].offer_id, true]);
      if (withClass[1]) await q(S.ANSWER_REENROLMENT, [withClass[1].offer_id, false]);
      // Not another family's child.
      const [otherOffer] = await svc(`select o.id from reenrolment_offer o join student s on s.id = o.student_id where o.round_id = $1 and s.family_id <> $2 limit 1`, [round, FAMILY.a]);
      expect(await expectRejected(() => q(S.ANSWER_REENROLMENT, [otherOffer.id, true]))).toMatch(/FORBIDDEN/);

      // The office confirms most of the rest (as it would after phone calls), leaving some unanswered.
      await as(svc, USERS.admin);
      await svc(`update reenrolment_offer set status = 'confirmed', answered_at = now()
                  where round_id = $1 and status = 'proposed' and class_id is not null and (hashtext(id::text) % 5) <> 0`, [round]);
      // A spare place in a small class, with someone waiting for it.
      const pre = (await q(`select id, capacity from class where term_id = $1 and name = 'Pre-School Ballet'`, [to]))[0];
      const waiter = (await svc(`select s.id from student s where s.studio_id = $1 and s.deleted_at is null
         and not exists (select 1 from reenrolment_offer o where o.student_id = s.id and o.class_id = $2) limit 1`, [STUDIO_ID, pre.id]))[0].id;
      await svc(`insert into waitlist_entry (studio_id, class_id, student_id, status, position) values ($1, $2, $3, 'waiting', 0)`, [STUDIO_ID, pre.id, waiter]);

      // Not before the date unless replies are closed early.
      await svc(`update reenrolment_round set respond_by = current_date + 3 where id = $1`, [round]);
      expect(await expectRejected(() => q(S.PUBLISH_REENROLMENT, [round]))).toMatch(/close replies early/);
      expect(await expectRejected(() => q(S.CLOSE_REENROLMENT, [round, false]))).toMatch(/until/);
      const released = (await q(S.CLOSE_REENROLMENT, [round, true]))[0].n;
      expect(released).toBeGreaterThan(0);
      // Reversible: reopen puts released places back.
      await q(S.REOPEN_REENROLMENT, [round, null]);
      expect((await q(`select count(*)::int n from reenrolment_offer where round_id = $1 and status = 'released'`, [round]))[0].n).toBe(0);
      // After the date the family can no longer answer; the office still can.
      await svc(`update reenrolment_round set respond_by = current_date - 1 where id = $1`, [round]);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(S.ANSWER_REENROLMENT, [withClass[0].offer_id, false]))).toMatch(/reply date has passed/);
      await as(svc, USERS.admin);

      // A small class next year, so some confirmed children cannot all fit.
      await svc(`update class set capacity = 4 where term_id = $1 and name = 'Grade 3 Ballet'`, [to]);
      const confirmed = await q(`select o.class_id, o.student_id from reenrolment_offer o where o.round_id = $1 and o.status = 'confirmed'`, [round]);
      const r = (await q(S.PUBLISH_REENROLMENT, [round]))[0].r as S.PublishResult;
      expect(r.placed + r.waitlisted).toBe(confirmed.length);
      expect(r.released).toBeGreaterThan(0);
      // Never beyond a class's places; the over-full are on its waiting list.
      const load = await q(`select c.id, c.capacity, app.class_enrolled_count(c.id) n from class c where c.term_id = $1`, [to]);
      expect(load.every((c: any) => c.n <= c.capacity)).toBe(true);
      const placed = await q(`select o.*, e.started_on, e.class_id e_class from reenrolment_offer o join enrolment e on e.id = o.enrolment_id where o.round_id = $1`, [round]);
      expect(placed.length).toBe(r.placed);
      expect(placed.every((p: any) => p.e_class === p.class_id)).toBe(true);
      const wl = await q(`select o.* from reenrolment_offer o join waitlist_entry w on w.id = o.waitlist_id where o.round_id = $1`, [round]);
      expect(wl.length).toBe(r.waitlisted);
      expect(r.waitlisted).toBeGreaterThan(0);   // Grade 3 Ballet holds 4
      // The spare place went to whoever was waiting.
      expect((await q(`select status from waitlist_entry where class_id = $1 and student_id = $2`, [pre.id, waiter]))[0].status).toBe('offered');
      // Published means published.
      expect(await expectRejected(() => q(S.CANCEL_REENROLMENT, [round]))).toMatch(/already published/);
      // One summary for the rest of the office (the owner), not one per child.
      const admin = await svc(`select count(*)::int n from notification where user_id = $1 and kind = 'new_enrolment' and created_at > now() - interval '1 minute'`, [USERS.owner]);
      expect(admin[0].n).toBe(1);
    });
  });

  it('cancelling before publishing leaves nobody enrolled', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const to = await nextTerm(svc); const from = await fromTerm(svc);
      const [{ id: round }] = await q(S.START_REENROLMENT, [from, to, new Date().toISOString().slice(0, 10)]);
      await q(S.OPEN_REENROLMENT, [round]);
      await svc(`update reenrolment_offer set status = 'confirmed' where round_id = $1 and class_id is not null`, [round]);
      await q(S.CANCEL_REENROLMENT, [round]);
      expect((await q(`select count(*)::int n from enrolment e join class c on c.id = e.class_id where c.term_id = $1`, [to]))[0].n).toBe(0);
      await as(svc, USERS.guardianA);
      expect(await q(S.FAMILY_REENROLMENT)).toHaveLength(0);
      // A new round can start again.
      await as(svc, USERS.admin);
      expect((await q(S.START_REENROLMENT, [from, to, new Date().toISOString().slice(0, 10)]))[0].id).toBeTruthy();
    });
  });
});

describe('F7 · show production pack', () => {
  it('running order: running times, quick changes between consecutive items, helpers per item', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const items = await q(S.RUNNING_ORDER, [SHOW]);
      expect(items.map((i: any) => i.title)).toEqual(['Tap Happy', 'Waltz of the Flowers', 'Mazurka', 'Level Up']);
      expect(items.map((i: any) => i.starts_after_sec)).toEqual([0, 190, 430, 580]);
      const maz = items.find((i: any) => i.title === 'Mazurka');
      expect(maz.quick_change_count).toBe(maz.dancers);   // the same class straight after
      expect(items[0].quick_change_count).toBe(0);
      expect(items[1].helpers).toMatch(/Chaperone, dressing room 2: nobody yet/);
      // Moving Mazurka last takes the Grade 3 quick change away.
      await q(E.MOVE_ROUTINE, [maz.id, 1]);
      const after = await q(S.RUNNING_ORDER, [SHOW]);
      expect(after.find((i: any) => i.title === 'Mazurka').quick_change_count).toBeLessThan(maz.dancers);
      // Families and teachers outside staff cannot read it.
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(S.RUNNING_ORDER, [SHOW]))).toMatch(/FORBIDDEN/);
    });
  });

  it('dancers follow the item’s class; a dancer who drops out leaves their items', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: item }] = await q(S.ADD_ITEM, [SHOW, CLASS.juniorTap, 'Tap finale', '', 95]);
      const dancers = await q(S.ITEM_DANCERS, [SHOW, item]);
      const inIt = dancers.filter((d: any) => d.in_item);
      expect(inIt.length).toBeGreaterThan(0);
      await q(S.ADD_DANCER, [item, inIt[0].student_id]);   // twice is fine
      await svc(`update event_participant set status = 'withdrawn' where event_id = $1 and student_id = $2`, [SHOW, inIt[0].student_id]);
      expect((await q(`select count(*)::int n from routine_dancer where student_id = $1`, [inIt[0].student_id]))[0].n).toBe(0);
    });
  });

  it('costume budget and charges: families billed once, school-paid costumes never billed, Coming up shows invoiced', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [b] = await q(S.COSTUME_BUDGET, [SHOW]);
      expect(b.budget_minor).toBe(120000);
      expect(Number(b.total_minor)).toBe(Number(b.families_minor) + Number(b.school_minor));
      expect(b.to_bill).toBeGreaterThan(0);
      const n = (await q(S.BILL_COSTUMES, [SHOW]))[0].n;
      expect(n).toBeGreaterThan(0);
      expect((await q(S.BILL_COSTUMES, [SHOW]))[0].n).toBe(0);
      const [b2] = await q(S.COSTUME_BUDGET, [SHOW]);
      expect(b2.to_bill).toBe(0);
      expect(Number(b2.billed_minor)).toBe(Number(b.families_minor));
      const skirt = await svc(`select count(*)::int n from costume_order o join costume_item i on i.id = o.item_id where i.name = 'Character skirt' and o.invoice_id is not null`);
      expect(skirt[0].n).toBe(0);
      const [line] = await svc(`select s.family_id, s.id from costume_order o join student s on s.id = o.student_id where o.invoice_id is not null limit 1`);
      const coming = (await q(`select * from app.upcoming_costs($1)`, [line.family_id])).filter((r: any) => r.kind === 'costume' && r.student_id === line.id);
      expect(coming.length).toBeGreaterThan(0);
      expect(coming.every((c: any) => c.state === 'invoiced' && c.invoice_number)).toBe(true);
    });
  });

  it('performer licences: the school decides; expiry before the show is flagged; staff read, only the office writes', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const rows = await q(S.LICENCES, [SHOW]);
      expect(rows.length).toBeGreaterThan(10);
      expect(rows.every((r: any) => r.flag === 'decide')).toBe(true);
      const kid = rows[0].student_id;
      expect(await expectRejected(() => q(S.SET_LICENCE, [SHOW, kid, 'needed', 'issued', 'Greenwich', 'PL-1', null, null, 2, '']))).toMatch(/date the licence was issued/);
      await q(S.SET_LICENCE, [SHOW, kid, 'needed', 'issued', 'Greenwich', 'PL-1', new Date().toISOString().slice(0, 10),
        new Date(Date.now() + 5 * 86400_000).toISOString().slice(0, 10), 2, '']);
      expect((await q(S.LICENCES, [SHOW])).find((r: any) => r.student_id === kid).flag).toBe('expired');   // the show is weeks away
      const n = (await q(S.SET_LICENCE_ALL, [SHOW, 'not_needed']))[0].n;
      expect(n).toBe(rows.length);
      expect((await q(S.LICENCES, [SHOW])).every((r: any) => r.flag === 'not_needed')).toBe(true);
      await as(svc, USERS.teacherTap);
      expect((await q(S.LICENCES, [SHOW])).length).toBe(rows.length);
      expect(await expectRejected(() => q(S.SET_LICENCE_ALL, [SHOW, 'needed']))).toMatch(/FORBIDDEN|admin/i);
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(S.LICENCES, [SHOW]))).toMatch(/FORBIDDEN/);
      expect(await q(`select * from performer_licence`)).toHaveLength(0);
    });
  });
});

describe('uniform per class', () => {
  it('the office sets it; the public page, the class and the child card show it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      expect(await expectRejected(() => q(S.SET_CLASS_UNIFORM, [CLASS.juniorTap, ['Tap shoes'], 'http://shop.example.com']))).toMatch(/https/);
      await q(S.SET_CLASS_UNIFORM, [CLASS.juniorTap, [' Black tap shoes ', '', 'School T-shirt'], 'https://shop.example.com/tap']);
      expect((await q(S.CLASS_UNIFORM, [CLASS.juniorTap]))[0]).toEqual({ uniform: ['Black tap shoes', 'School T-shirt'], uniform_url: 'https://shop.example.com/tap' });
      await as(svc, USERS.guardianA);
      expect(await expectRejected(() => q(S.SET_CLASS_UNIFORM, [CLASS.juniorTap, ['Anything'], null]))).toMatch(/FORBIDDEN|admin/i);
      // The child card: own children only.
      const kid = await kidOf(svc, CLASS.juniorTap);
      await as(svc, kid.guardian);
      expect((await q(S.CHILD_UNIFORM, [kid.id])).find((r: any) => r.class_id === CLASS.juniorTap).uniform).toEqual(['Black tap shoes', 'School T-shirt']);
      const other = await svc(`select g.user_id from guardian g where g.user_id is not null and g.family_id <> $1 limit 1`, [kid.family_id]);
      await as(svc, other[0].user_id);
      expect(await q(S.CHILD_UNIFORM, [kid.id])).toHaveLength(0);
    });
    // The public page, with no sign-in.
    const slug = (await asUser(USERS.admin, async (_q, svc) => (await svc(`select slug from studio where id = $1`, [STUDIO_ID]))[0].slug)) as string;
    await asUser(null, async q => {
      const pub = await q(S.PUBLIC_UNIFORM, [slug]);
      const g3 = pub.find((r: any) => r.class_name === 'Grade 3 Ballet');
      expect(g3.uniform).toContain('Black character shoes and skirt');
      expect(g3.uniform_url).toBe('https://example.com/shop/ballet');
      expect(pub.find((r: any) => r.class_name === 'Senior Tap')).toBeUndefined();   // none listed
    });
  });
});
