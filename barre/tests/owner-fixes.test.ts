import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, STUDIO_ID } from './helpers';
import { PLATFORM_ADMIN } from '../src/lib/db/seed/data';
import * as R from '../src/lib/repos/reports';
import * as A from '../src/lib/repos/account';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

type S = (sql: string, params?: unknown[]) => Promise<any[]>;
const LOC = { greenwich: uid(NS.location, 1), blackheath: uid(NS.location, 2) };

const membership = async (svc: S, user: string, role: string) =>
  (await svc(`select id from membership where user_id = $1 and studio_id = $2 and role = $3::app_role`, [user, STUDIO_ID, role]))[0].id as string;

/** A family whose every live place is at one location (trials and waiting
 *  lists elsewhere are cleared), and one of its children. */
async function familyAt(svc: S, loc: string) {
  const [f] = await svc(`
    select f.id, min(s.id::text)::uuid as student from family f join student s on s.family_id = f.id and s.deleted_at is null
      join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null join class c on c.id = e.class_id
     where f.studio_id = $1 and f.deleted_at is null
     group by f.id having bool_and(c.location_id = $2) order by f.id limit 1`, [STUDIO_ID, loc]);
  for (const t of ['trial', 'waitlist_entry']) {
    await svc(`update ${t} set deleted_at = now() where student_id in (select id from student where family_id = $1)
                 and class_id in (select id from class where location_id <> $2)`, [f.id, loc]);
  }
  return f as { id: string; student: string };
}

/** A class at the location with room, suitable for the child's age when one is given. */
const classAt = async (svc: S, loc: string, student: string | null = null) =>
  (await svc(`select c.id from class c left join student s on s.id = $2::uuid
               where c.location_id = $1 and c.deleted_at is null and c.pricing <> 'drop_in'
                 and c.capacity > app.class_enrolled_count(c.id)
                 and (s.id is null or ((c.age_min is null or extract(year from age(s.date_of_birth)) >= c.age_min)
                                   and (c.age_max is null or extract(year from age(s.date_of_birth)) <= c.age_max)))
                 and (s.id is null or not exists (select 1 from enrolment e where e.class_id = c.id and e.student_id = s.id and e.status = 'active'))
               order by c.name limit 1`, [loc, student]))[0].id as string;

const pastSession = async (svc: S, loc: string) =>
  (await svc(`select cs.id from class_session cs join class c on c.id = cs.class_id
               where c.location_id = $1 and cs.deleted_at is null and cs.starts_at < now() - interval '1 day'
               order by cs.starts_at desc limit 1`, [loc]))[0].id as string;

/** Nadia becomes limited to Greenwich for the rest of the transaction. */
async function limitNadia(svc: S) {
  await svc(`insert into membership_location (membership_id, location_id, studio_id) values ($1, $2, $3)`,
    [await membership(svc, USERS.admin, 'admin'), LOC.greenwich, STUDIO_ID]);
}

describe('location-limited administrators who can act (F12)', () => {
  it('change people, enrolments, registers, messages and invoices for families wholly at their locations', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const home = await familyAt(svc, LOC.greenwich);
      await limitNadia(svc);
      expect((await q(`select app.is_admin($1) a`, [STUDIO_ID]))[0].a).toBe(false);

      // People
      expect(await q(`update family set notes = 'Prefers texts' where id = $1 returning id`, [home.id])).toHaveLength(1);
      expect(await q(`update student set notes = 'Left-handed' where id = $1 returning id`, [home.student])).toHaveLength(1);
      expect(await q(`insert into guardian (studio_id, family_id, full_name, relationship) values ($1, $2, 'Sam Carer', 'Grandparent') returning id`,
        [STUDIO_ID, home.id])).toHaveLength(1);
      const [ec] = await q(`insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
                             values ($1, $2, 'Ann Neighbour', 'Neighbour', '07700 900111', 3) returning id`, [STUDIO_ID, home.student]);
      expect((await q(`select app.soft_delete('emergency_contact', $1) ok`, [ec.id]))[0].ok).toBe(true);
      const [sib] = await q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
                              values ($1, $2, 'New', 'Sibling', '2017-05-01') returning id`, [STUDIO_ID, home.id]);

      // Enrolment: a place in a Greenwich class, then withdrawn
      const gw = await classAt(svc, LOC.greenwich);
      const [en] = await q(`insert into enrolment (studio_id, class_id, student_id, status, started_on) values ($1, $2, $3, 'active', current_date) returning id`,
        [STUDIO_ID, gw, sib.id]);
      await q(`select app.withdraw_enrolment($1, 'Moving away')`, [en.id]);
      expect((await svc(`select status from enrolment where id = $1`, [en.id]))[0].status).toBe('left');

      // Registers: amend a past Greenwich register, with a reason (audited)
      const gs = await pastSession(svc, LOC.greenwich);
      const [who] = await svc(`select e.student_id from enrolment e join class_session cs on cs.class_id = e.class_id
                                where cs.id = $1 and e.status = 'active' limit 1`, [gs]);
      await q(`select app.amend_attendance($1, $2, 'excused', 'Doctor''s note')`, [gs, who.student_id]);
      expect((await svc(`select status from attendance_record where session_id = $1 and student_id = $2`, [gs, who.student_id]))[0].status).toBe('excused');
      // …but the register window still applies to direct marking.
      await svc(`update studio set register_edit_days = 0 where id = $1`, [STUDIO_ID]);
      expect(await expectRejected(() => q(`insert into attendance_record (studio_id, session_id, student_id, status, marked_by, client_marked_at, mark_kind)
        values ($1, $2, $3, 'present', $4, now(), 'explicit') on conflict (session_id, student_id) do update set status = 'present'`,
        [STUDIO_ID, gs, who.student_id, USERS.admin]))).toMatch(/REGISTER_LOCKED/);

      // Messages: to the family, and a notice to a Greenwich class
      expect(await q(`insert into communication (studio_id, kind, channel, family_id, subject, body) values ($1, 'direct', 'in_app', $2, 'Hello', 'See you Saturday') returning id`,
        [STUDIO_ID, home.id])).toHaveLength(1);
      expect(await q(`insert into communication (studio_id, kind, channel, class_id, subject, body) values ($1, 'class_broadcast', 'in_app', $2, 'Hall change', 'Studio 2 this week') returning id`,
        [STUDIO_ID, gw])).toHaveLength(1);

      // Invoices and payments
      const [inv] = await q(`select app.create_invoice($1, '[{"description":"Costume","unit_minor":2500}]'::jsonb) as id`, [home.id]);
      expect(inv.id).toBeTruthy();
      await q(`select app.record_payment($1, 2500, 'cash', $2)`, [home.id, inv.id]);
      expect((await svc(`select status from invoice where id = $1`, [inv.id]))[0].status).toBe('paid');

      // The office's rights were for those calls only.
      expect((await q(`select app.is_admin($1) a`, [STUDIO_ID]))[0].a).toBe(false);
      expect(await svc(`select * from scope_grant`)).toHaveLength(0);
      const audit = await svc(`select action from audit_log where actor_id = $1 and at > now() - interval '1 minute'`, [USERS.admin]);
      expect(audit.map((a: any) => a.action)).toEqual(expect.arrayContaining(['amend_register']));
    });
  });

  it('refuses anything that touches another location, a family also elsewhere, billing runs and school-wide notices', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const home = await familyAt(svc, LOC.greenwich);
      const away = await familyAt(svc, LOC.blackheath);
      const bh = await classAt(svc, LOC.blackheath);
      // Any age, with room: so only the location can be the reason for a refusal.
      await svc(`update class set age_min = null, age_max = null, capacity = capacity + 5 where id = $1`, [bh]);
      const gw = await classAt(svc, LOC.greenwich);
      // A second family at Greenwich whose child also starts at Blackheath: now a mixed family.
      const [mixed] = await svc(`select f.id, s.id as student from family f join student s on s.family_id = f.id
                                   where f.id <> $1 and s.id in (select e.student_id from enrolment e join class c on c.id = e.class_id
                                                                 where c.location_id = $2 and e.status = 'active')
                                   order by f.id limit 1`, [home.id, LOC.greenwich]);
      await svc(`insert into enrolment (studio_id, class_id, student_id, status, started_on) values ($1, $2, $3, 'active', current_date)
                 on conflict do nothing`, [STUDIO_ID, bh, mixed.student]);
      const [bhEnrol] = await svc(`select id from enrolment where class_id = $1 and status = 'active' limit 1`, [bh]);
      const [gwEnrol] = await svc(`select e.id from enrolment e where e.class_id = $1 and e.status = 'active' limit 1`, [gw]);
      await limitNadia(svc);

      // People elsewhere, or in a family that is also elsewhere: not changed.
      expect(await q(`update family set notes = 'x' where id = $1 returning id`, [away.id])).toHaveLength(0);
      expect(await q(`update family set notes = 'x' where id = $1 returning id`, [mixed.id])).toHaveLength(0);
      expect(await q(`update student set notes = 'x' where id = $1 returning id`, [mixed.student])).toHaveLength(0);
      expect(await expectRejected(() => q(`insert into guardian (studio_id, family_id, full_name) values ($1, $2, 'X Y')`, [STUDIO_ID, mixed.id])))
        .toMatch(/row-level security/);
      expect(await expectRejected(() => q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth) values ($1, $2, 'A', 'B', '2016-01-01')`,
        [STUDIO_ID, away.id]))).toMatch(/row-level security/);

      // Enrolment: not into a Blackheath class, not a child also at Blackheath, not a move across sites.
      expect(await expectRejected(() => q(`insert into enrolment (studio_id, class_id, student_id, status, started_on) values ($1, $2, $3, 'active', current_date)`,
        [STUDIO_ID, bh, home.student]))).toMatch(/row-level security/);
      expect(await expectRejected(() => q(`insert into enrolment (studio_id, class_id, student_id, status, started_on) values ($1, $2, $3, 'active', current_date)`,
        [STUDIO_ID, gw, mixed.student]))).toMatch(/row-level security/);
      expect(await expectRejected(() => q(`select app.withdraw_enrolment($1)`, [bhEnrol.id]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.transfer_enrolment($1, $2)`, [gwEnrol.id, bh]))).toMatch(/FORBIDDEN/);

      // Registers at Blackheath
      const bs = await pastSession(svc, LOC.blackheath);
      expect(await expectRejected(() => q(`select app.amend_attendance($1, $2, 'excused', 'x')`, [bs, home.student]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.close_register($1)`, [bs]))).toMatch(/FORBIDDEN/);

      // Messages: not to a family elsewhere, not to the whole school
      expect(await expectRejected(() => q(`insert into communication (studio_id, kind, channel, family_id, subject, body) values ($1, 'direct', 'in_app', $2, 'Hi', 'x')`,
        [STUDIO_ID, away.id]))).toMatch(/row-level security/);
      expect(await expectRejected(() => q(`insert into communication (studio_id, kind, channel, subject, body) values ($1, 'studio_announcement', 'in_app', 'All', 'x')`,
        [STUDIO_ID]))).toMatch(/row-level security/);

      // Money: not for a family elsewhere or also elsewhere; never a billing run.
      expect(await expectRejected(() => q(`select app.create_invoice($1, '[{"description":"Fee","unit_minor":100}]'::jsonb)`, [away.id]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.create_invoice($1, '[{"description":"Fee","unit_minor":100}]'::jsonb)`, [mixed.id]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.record_payment($1, 100, 'cash')`, [mixed.id]))).toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select app.send_payment_reminders($1::uuid[], 'Reminder', 'Please pay')`, [[home.id, mixed.id]]))).toMatch(/FORBIDDEN/);
      const [term] = await svc(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]);
      expect(await expectRejected(() => q(`select app.create_billing_run($1)`, [term.id]))).toMatch(/FORBIDDEN/);

      // No client can hand itself the office's rights.
      expect(await expectRejected(() => q(`insert into scope_grant (studio_id, user_id) values ($1, $2)`, [STUDIO_ID, USERS.admin]))).toMatch(/permission denied/);
      expect(await expectRejected(() => q(`select app.scope_open($1, true)`, [STUDIO_ID]))).toMatch(/permission denied/);
      expect(await expectRejected(() => q(`select app.create_invoice_office($1, '[]'::jsonb)`, [home.id]))).toMatch(/permission denied/);
    });
  });

  it('owners and all-location administrators are unchanged', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const away = await familyAt(svc, LOC.blackheath);
      expect((await q(`select app.create_invoice($1, '[{"description":"Fee","unit_minor":100}]'::jsonb) id`, [away.id]))[0].id).toBeTruthy();
      expect(await q(`update family set notes = 'x' where id = $1 returning id`, [away.id])).toHaveLength(1);
    });
    await asUser(USERS.teacherTap, async q => {
      const fam = (await q(`select id from family limit 1`))[0];
      if (fam) expect(await expectRejected(() => q(`select app.create_invoice($1, '[{"description":"Fee","unit_minor":100}]'::jsonb)`, [fam.id]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('plans (F11)', () => {
  it('leavers do not count towards the student limit; a leaver coming back counts again', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const all = (await svc(`select count(*)::int n from student where studio_id = $1 and deleted_at is null`, [STUDIO_ID]))[0].n;
      const before = (await q(`select app.plan_student_count($1) n`, [STUDIO_ID]))[0].n;
      expect(before).toBeLessThanOrEqual(all);
      // Someone in a class leaves.
      const [leaver] = await svc(`select s.id, s.first_name from student s where s.studio_id = $1 and app.student_on_plan(s.id)
                                    and exists (select 1 from enrolment e where e.student_id = s.id and e.status = 'active') order by s.id limit 1`, [STUDIO_ID]);
      const places = await svc(`select id from enrolment where student_id = $1 and status = 'active'`, [leaver.id]);
      for (const p of places) await q(`select app.withdraw_enrolment($1, 'Left')`, [p.id]);
      for (const t of ['trial', 'waitlist_entry']) await svc(`update ${t} set deleted_at = now() where student_id = $1`, [leaver.id]);
      const after = (await q(`select app.plan_student_count($1) n`, [STUDIO_ID]))[0].n;
      expect(after).toBe(before - 1);
      expect((await q(A.ACCOUNT))[0].students).toBe(after);

      // A plan exactly full: a new child is refused, a leaver's return too.
      await svc(`insert into plan (code, name, price_minor, max_students, max_locations, max_staff, sort) values ('tight', 'Tight', 1000, $1, null, null, 9)`, [after]);
      await svc(`update studio set plan_id = (select id from plan where code = 'tight') where id = $1`, [STUDIO_ID]);
      const [fam] = await svc(`select family_id from student where id = $1`, [leaver.id]);
      expect(await expectRejected(() => q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
        values ($1, $2, 'One', 'More', '2017-01-01')`, [STUDIO_ID, fam.family_id]))).toMatch(/PLAN_LIMIT: The Tight plan includes up to/);
      const [cls] = await svc(`select class_id from enrolment where student_id = $1 limit 1`, [leaver.id]);
      expect(await expectRejected(() => q(`insert into enrolment (studio_id, class_id, student_id, status, started_on) values ($1, $2, $3, 'active', current_date)`,
        [STUDIO_ID, cls.class_id, leaver.id]))).toMatch(new RegExp(`PLAN_LIMIT: .*${leaver.first_name} has left`));
      // One more leaver makes room.
      const [other] = await svc(`select e.id from enrolment e join student s on s.id = e.student_id where e.status = 'active' and s.id <> $1
                                   and (select count(*) from enrolment x where x.student_id = s.id and x.status = 'active') = 1
                                   and not exists (select 1 from trial t where t.student_id = s.id and t.deleted_at is null and t.status in ('requested','booked'))
                                   and not exists (select 1 from waitlist_entry w where w.student_id = s.id and w.deleted_at is null and w.status in ('waiting','offered'))
                                 limit 1`, [leaver.id]);
      await q(`select app.withdraw_enrolment($1)`, [other.id]);
      expect(await q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
        values ($1, $2, 'One', 'More', '2017-01-01') returning id`, [STUDIO_ID, fam.family_id])).toHaveLength(1);
    });
  });

  it('an owner changes plan themselves; not to a plan too small, and not an administrator', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      expect((await q(`select app.change_plan('academy') n`))[0].n).toBe('Academy');
      const [s] = await svc(`select p.code from studio s join plan p on p.id = s.plan_id where s.id = $1`, [STUDIO_ID]);
      expect(s.code).toBe('academy');
      const [log] = await q(`select summary from audit_log where action = 'plan' order by at desc limit 1`);
      expect(log.summary).toMatch(/to Academy .*not connected/);
      expect(await expectRejected(() => q(`select app.change_plan('trial')`))).toMatch(/plans on offer/);
      await svc(`update plan set max_students = 5 where code = 'starter'`);
      expect(await expectRejected(() => q(`select app.change_plan('starter')`))).toMatch(/Starter is too small: the school has \d+ students/);
    });
    await asUser(USERS.admin, async q => {
      expect(await expectRejected(() => q(`select app.change_plan('academy')`))).toMatch(/only an owner/);
    });
  });

  it('anyone can start a school: a trial school and an owner invitation, limited and closable', async () => {
    await asUser(null, async (q, svc) => {
      expect((await q(`select * from app.public_plans()`)).map((p: any) => p.code)).toEqual(expect.arrayContaining(['trial', 'starter']));
      const [r] = await q(`select * from app.start_school('Riverside Dance', 'Ana Ruiz', 'Ana@Riverside.example')`);
      expect(r.invitation_token).toBeTruthy();
      const [st] = await svc(`select s.status, p.is_trial, s.trial_ends_on - current_date as days from studio s join plan p on p.id = s.plan_id where s.id = $1`, [r.studio_id]);
      expect(st).toEqual({ status: 'trialling', is_trial: true, days: 30 });
      const [inv] = await q(`select * from app.invitation_preview($1)`, [r.invitation_token]);
      expect(inv).toMatchObject({ studio_name: 'Riverside Dance', role: 'owner', email: 'ana@riverside.example' });
      expect(await expectRejected(() => q(`select * from app.start_school('Riverside Two', 'Ana Ruiz', 'ana@riverside.example')`))).toMatch(/started with this email today/);
      expect(await expectRejected(() => q(`select * from app.start_school('X', 'Ana Ruiz', 'a@b.co')`))).toMatch(/needs a name/);
      expect(await expectRejected(() => q(`select * from app.start_school('Good Name', 'Ana Ruiz', 'not-an-email')`))).toMatch(/email/);
      // The platform console sees it, as a school started online.
      const [ev] = await svc(`select summary from audit_log where studio_id = $1 and action = 'signup'`, [r.studio_id]);
      expect(ev.summary).toMatch(/started online/);
    });
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.platform_set_signups(false)`))).toMatch(/super admin/);
    });
    await asUser(PLATFORM_ADMIN, async (q, svc) => {
      await q(`select app.platform_set_signups(false)`);
      expect((await svc(`select open from platform_signup`))[0].open).toBe(false);
      expect(await expectRejected(() => q(`select * from app.start_school('Closed School', 'Ana Ruiz', 'c@d.co')`))).toMatch(/not being taken online/);
    });
  });
});

describe('money per location (U8, F12)', () => {
  it('splits invoices and payments by location; the parts add up to the school; a limited administrator sees theirs', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const home = await familyAt(svc, LOC.greenwich);
      const away = await familyAt(svc, LOC.blackheath);
      const [g] = await q(`select app.create_invoice($1, '[{"description":"Costume","unit_minor":4000}]'::jsonb) id`, [home.id]);
      const [b] = await q(`select app.create_invoice($1, '[{"description":"Costume","unit_minor":3000}]'::jsonb) id`, [away.id]);
      await q(`select app.record_payment($1, 1000, 'cash', $2)`, [away.id, b.id]);
      const rows = await q(`select * from location_money`);
      const at = (l: string | null) => rows.filter((r: any) => r.location_id === l).reduce((a: number, r: any) => a + Number(r.outstanding_minor), 0);
      const open = (await q(`select coalesce(sum(total_minor - paid_minor), 0)::bigint n from invoice where deleted_at is null and status in ('issued', 'part_paid')`))[0].n;
      // Rounding per row can move a penny or two.
      expect(Math.abs(at(LOC.greenwich) + at(LOC.blackheath) + at(null) - Number(open))).toBeLessThanOrEqual(rows.length);
      expect(at(LOC.greenwich)).toBeGreaterThanOrEqual(4000);
      const col = rows.find((r: any) => r.location_id === LOC.blackheath);
      expect(Number(col.collected_30d_minor)).toBeGreaterThanOrEqual(1000);
      const by = await q(R.BY_LOCATION);
      expect(Number(by.find((l: any) => l.id === LOC.blackheath).collected_30d_minor)).toBeGreaterThanOrEqual(1000);
      const [hb] = await q(R.HEADLINE_AT, [LOC.blackheath]);
      expect(Number(hb.collected_30d_minor)).toBe(Number(col.collected_30d_minor));
      void g;

      await limitNadia(svc);
    });
    await asUser(USERS.admin, async (q, svc) => {
      await limitNadia(svc);
      const rows = await q(`select * from location_money`);
      expect(rows.filter((r: any) => r.location_id === LOC.blackheath)).toHaveLength(0);
      expect(rows.some((r: any) => r.location_id === LOC.greenwich)).toBe(true);
    });
  });
});

describe('retention from imported history (UR-34)', () => {
  it('orders imported term names by year and season', async () => {
    await asUser(USERS.owner, async q => {
      const [r] = await q(`select app.period_rank('Summer 2025') a, app.period_rank('Autumn term 2024') b, app.period_rank('Spring 2025') c, app.period_rank('x') d`);
      expect(r.a).toBeGreaterThan(r.c);
      expect(r.c).toBeGreaterThan(r.b);
      expect(r.d).toBe(0);
    });
  });

  it('before a second term in Swayvo, compares with the latest imported term, labelled as imported', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [term] = await svc(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]);
      // Only one term in Swayvo for this test.
      await svc(`update term set deleted_at = now() where studio_id = $1 and id <> $2`, [STUDIO_ID, term.id]);
      const before = (await q(R.RETENTION_SUMMARY, [term.id]))[0];
      expect(before.previous_term).toBeNull();
      // Three children came last term: two are in a class now, one is not.
      const staying = await svc(`select distinct on (e.student_id) e.student_id, c.name from enrolment e join class c on c.id = e.class_id
                                  where c.term_id = $1 and e.status = 'active' order by e.student_id, c.name limit 2`, [term.id]);
      const [gone] = await svc(`select s.id from student s where s.studio_id = $1 and not exists
                                  (select 1 from enrolment e join class c on c.id = e.class_id where e.student_id = s.id and c.term_id = $2 and e.status <> 'cancelled')
                                limit 1`, [STUDIO_ID, term.id]);
      const rows = [...staying.map((s: any) => [s.student_id, s.name]), [gone.id, 'Old Jazz']];
      for (const [sid, cls] of rows) {
        await svc(`insert into attendance_history (studio_id, student_id, period, class_name, attended) values ($1, $2, 'Summer 2025', $3, 9)`, [STUDIO_ID, sid, cls]);
      }
      await svc(`insert into attendance_history (studio_id, student_id, period, class_name, attended) values ($1, $2, 'Spring 2025', 'Old Jazz', 5)`, [STUDIO_ID, gone.id]);

      const [s] = await q(R.RETENTION_SUMMARY, [term.id]);
      expect(s).toMatchObject({ previous_term: 'Summer 2025', imported: true, previous: 3, continuing: 2, lapsed: 1 });
      const lapsed = await q(R.LAPSED, [term.id]);
      expect(lapsed.map((l: any) => l.student_id)).toEqual([gone.id]);
      expect(lapsed[0].last_class).toBe('Old Jazz');
      const by = await q(R.RETENTION_BY, [term.id, 'class']);
      expect(by.find((r: any) => r.label === 'Old Jazz')).toMatchObject({ previous: 1, lapsed: 1 });
      // By location: imported classes count where a class of that name is.
      const [g] = await q(R.RETENTION_SUMMARY_AT, [term.id, LOC.greenwich]);
      const [bh] = await q(R.RETENTION_SUMMARY_AT, [term.id, LOC.blackheath]);
      expect(g.previous + bh.previous).toBe(2);
    });
  });
});

describe('account history (U4)', () => {
  it('shows changes made by people unless automatic ones are asked for', async () => {
    await asUser(USERS.owner, async q => {
      await q(`update family set notes = 'Owner was here' where id = (select id from family order by id limit 1)`);
      const people = await q(A.PEOPLE_HISTORY, [null, null, null, null, null, 50, false]);
      expect(people.length).toBeGreaterThan(0);
      expect(people.every((r: any) => r.actor_id != null)).toBe(true);
      const all = await q(A.PEOPLE_HISTORY, [null, null, null, null, null, 200, true]);
      expect(all.some((r: any) => r.actor_id == null)).toBe(true);
    });
  });
});
