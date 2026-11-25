import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });
const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const tapKid = async (svc: any) => (await svc(`select s.id, s.family_id, g.user_id guardian from enrolment e join student s on s.id = e.student_id
  join guardian g on g.family_id = s.family_id and g.user_id is not null where e.class_id = $1 and e.status = 'active' limit 1`, [CLASS.juniorTap]))[0];

describe('exams (R-058)', () => {
  it('a teacher enters a child, records a result, and a pass becomes a milestone the family sees', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: x }] = await q(`insert into exam_session (studio_id, board, title, exam_on, venue) values ($1, 'ISTD', 'Spring tap exams', current_date + 30, 'Studio 1') returning id`, [STUDIO_ID]);
      const kid = await tapKid(svc);
      await as(svc, USERS.teacherTap);
      const [{ id: entry }] = await q(`select app.enter_exam($1, $2, 'Grade 2', 4500) id`, [x, kid.id]);
      await as(svc, USERS.teacherStreet);
      expect(await expectRejected(() => q(`select app.exam_result($1, 'merit', 78)`, [entry]))).toMatch(/FORBIDDEN/);
      await as(svc, USERS.teacherTap);
      await q(`select app.exam_result($1, 'merit', 78)`, [entry]);
      await as(svc, USERS.admin);
      expect((await q(`select app.bill_exam($1) n`, [x]))[0].n).toBe(1);
      expect((await q(`select app.bill_exam($1) n`, [x]))[0].n).toBe(0);
      await as(svc, kid.guardian);
      const [e] = await q(`select result, mark, status from exam_entry where id = $1`, [entry]);
      expect(e).toEqual({ result: 'merit', mark: 78, status: 'sat' });
      expect((await q(`select title from milestone where student_id = $1 and kind like 'exam:%'`, [kid.id]))[0].title).toBe('ISTD Grade 2 — Merit');
    });
  });
});

describe('shows in depth (R-057)', () => {
  it('costume sizes, a rehearsal register with medical markers, a consent-aware programme and tickets', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: show }] = await q(`insert into studio_event (studio_id, kind, title, starts_at, requests_open) values ($1, 'show', 'Summer Show', now() + interval '40 days', false) returning id`, [STUDIO_ID]);
      const [{ id: reh }] = await q(`insert into studio_event (studio_id, kind, title, starts_at, ends_at, parent_event_id) values ($1, 'rehearsal', 'Tech run', now() + interval '38 days', now() + interval '38 days 2 hours', $2) returning id`, [STUDIO_ID, show]);
      await q(`select app.invite_classes($1, $2::uuid[])`, [show, [CLASS.juniorTap]]);
      await svc(`update event_participant set status = 'confirmed' where event_id = $1`, [show]);
      const [{ id: routine }] = await q(`insert into event_routine (event_id, class_id, title, position) values ($1, $2, 'Tap Happy', 1) returning id`, [show, CLASS.juniorTap]);
      await svc(`insert into routine_dancer (routine_id, student_id) select $1, student_id from event_participant where event_id = $2`, [routine, show]);
      const [{ id: item }] = await q(`insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, 'Red waistcoat', 1800) returning id`, [show, routine]);

      const kid = await tapKid(svc);
      await as(svc, kid.guardian);
      await q(`select app.set_costume_size($1, $2, 'Age 7–8')`, [item, kid.id]);
      expect(await expectRejected(() => q(`select app.set_costume_size($1, $2, 'XXL')`, [item, kid.id]))).toMatch(/sizes listed/);
      expect(await expectRejected(() => q(`select * from app.costume_list($1)`, [show]))).toMatch(/FORBIDDEN/);

      await as(svc, USERS.teacherTap);
      const list = await q(`select * from app.costume_list($1)`, [show]);
      expect(list.find((r: any) => r.student_id === kid.id).size).toBe('Age 7–8');
      const reg = await q(`select * from app.rehearsal_register($1)`, [reh]);
      expect(reg.length).toBe(list.length);
      expect(reg[0].routines).toBe('Tap Happy');
      expect(reg.some((r: any) => r.has_medical)).toBe(true);
      await q(`select app.mark_rehearsal($1, $2, 'present')`, [reh, kid.id]);
      expect((await q(`select * from app.rehearsal_register($1)`, [reh])).find((r: any) => r.student_id === kid.id).status).toBe('present');

      // Programme: only children with photography consent are named.
      await svc(`insert into consent_record (studio_id, student_id, kind, granted) select $1, student_id, 'photography', student_id = $3
                   from routine_dancer where routine_id = $2 on conflict (student_id, kind) do update set granted = excluded.granted`, [STUDIO_ID, routine, kid.id]);
      const [prog] = await q(`select * from app.event_programme($1)`, [show]);
      expect(prog.dancers.split(', ')).toHaveLength(1);
      expect(prog.unnamed).toBe(list.length - 1);

      // Tickets.
      await as(svc, USERS.admin);
      const [{ id: tt }] = await q(`insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, 'Adult', 1200, 3, 4) returning id`, [show]);
      await as(svc, kid.guardian);
      await q(`select app.book_tickets($1, 2)`, [tt]);
      expect(await expectRejected(() => q(`select app.book_tickets($1, 2)`, [tt]))).toMatch(/only 1 left/);
      const [b] = await q(`select quantity, invoice_id from ticket_booking`);
      expect(b.quantity).toBe(2);
      expect((await svc(`select total_minor from invoice where id = $1`, [b.invoice_id]))[0].total_minor).toBe('2400');
    });
  });
});

describe('practice (R-059)', () => {
  it('a student logs practice, their teacher sees the weekly total, others do not', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const kid = await tapKid(svc);
      await as(svc, kid.guardian);
      await q(`select app.log_practice($1, 20, 'Shuffles and flaps')`, [kid.id]);
      await q(`select app.log_practice($1, 15)`, [kid.id]);
      expect(await expectRejected(() => q(`select app.log_practice($1, 0)`, [kid.id]))).toBeTruthy();
      await as(svc, USERS.teacherTap);
      const [w] = (await q(`select * from app.practice_weekly(1)`)).filter((r: any) => r.student_id === kid.id);
      expect(w).toMatchObject({ minutes: 35, sessions: 2 });
      await as(svc, USERS.teacherStreet);
      expect((await q(`select * from app.practice_weekly(1)`)).filter((r: any) => r.student_id === kid.id)).toHaveLength(0);
      // A demonstration link on a skill.
      const [k] = await svc(`select id from framework_skill limit 1`);
      await as(svc, USERS.teacherTap);
      await q(`select app.set_skill_demo($1, 'https://example.com/shuffle')`, [k.id]);
      expect(await expectRejected(() => q(`select app.set_skill_demo($1, 'http://insecure')`, [k.id]))).toMatch(/https/);
      await as(svc, kid.guardian);
      expect(await expectRejected(() => q(`select app.set_skill_demo($1, 'https://x.io')`, [k.id]))).toMatch(/FORBIDDEN/);
    });
  });
});
