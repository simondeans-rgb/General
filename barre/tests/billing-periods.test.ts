import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID, FAMILY } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const as = (svc: any, user: string) => svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated' })]);
const term = async (svc: any) => (await svc(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]))[0].id;
const nextDropIn = async (svc: any, n = 0) => (await svc(`select d.session_id from app.drop_in_sessions($1) d order by d.starts_at offset $2 limit 1`, [STUDIO_ID, n]))[0].session_id;

describe('monthly billing runs (R-050)', () => {
  it('term runs leave monthly classes out; a month run bills them once', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await term(svc);
      await svc(`update class set pricing = 'monthly', price_minor = 3000 where id = $1`, [CLASS.juniorTap]);
      const termLines = await q(`select * from app.billing_lines($1)`, [t]);
      expect(termLines.some((l: any) => l.class_id === CLASS.juniorTap)).toBe(false);
      const month = await q(`select * from app.billing_lines($1, current_date)`, [t]);
      expect(month.length).toBeGreaterThan(0);
      expect(month.every((l: any) => l.class_id === CLASS.juniorTap)).toBe(true);
      expect(month[0].description).toMatch(new RegExp(new Date().toLocaleString('en-GB', { month: 'long' })));
      const [{ run }] = await q(`select app.create_billing_run($1, null, current_date) run`, [t]);
      const [r] = await q(`select period_month, invoice_count from billing_run where id = $1`, [run]);
      expect(r.invoice_count).toBe(new Set(month.map((l: any) => l.family_id)).size);
      // The same month again raises nothing; the term run is unaffected.
      expect(await q(`select * from app.billing_lines($1, current_date)`, [t])).toHaveLength(0);
      expect(await expectRejected(() => q(`select app.create_billing_run($1, null, current_date)`, [t]))).toMatch(/already a draft run|already been invoiced/);
      expect((await q(`select * from app.billing_lines($1)`, [t])).length).toBe(termLines.length);
    });
  });
});

describe('family discounts (R-056)', () => {
  it('a bursary percentage and a fixed amount are applied, labelled discreetly', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await term(svc);
      await q(`insert into family_discount (family_id, kind, amount, reason, note) values ($1, 'percent', 50, 'bursary', 'Hardship fund')`, [FAMILY.a]);
      await q(`insert into family_discount (family_id, kind, amount, reason) values ($1, 'fixed', 1000, 'staff')`, [FAMILY.b]);
      const lines = await q(`select * from app.billing_lines($1)`, [t]);
      const a = lines.filter((l: any) => l.family_id === FAMILY.a);
      expect(a.length).toBeGreaterThan(0);
      for (const l of a) {
        expect(l.discount_minor).toBeGreaterThanOrEqual(Math.round(l.unit_minor * 0.5) - 1);
        expect(l.discount_reason).toMatch(/50% discount/);
        expect(l.discount_reason).not.toMatch(/bursary/i);
      }
      const [{ run }] = await q(`select app.create_billing_run($1) run`, [t]);
      const [inv] = await q(`select discount_minor from invoice where billing_run_id = $1 and family_id = $2`, [run, FAMILY.b]);
      expect(Number(inv.discount_minor)).toBe(1000);
    });
  });

  it('parents cannot see or add family discounts', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await q(`select 1 from family_discount`)).toHaveLength(0);
      await expectRejected(() => q(`insert into family_discount (family_id, kind, amount, reason) values ($1, 'percent', 100, 'other')`, [FAMILY.a]));
    });
  });
});

describe('aged debt (R-055)', () => {
  it('groups what is owed by age, for the office only', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [inv] = await svc(`select id from invoice where studio_id = $1 and status = 'issued' and total_minor > paid_minor limit 1`, [STUDIO_ID]);
      await svc(`update invoice set due_on = current_date - 75 where id = $1`, [inv.id]);
      const rows = await q(`select * from app.aged_debt($1)`, [STUDIO_ID]);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(Number(r.current_minor) + Number(r.d31_60) + Number(r.d61_90) + Number(r.d90_plus)).toBe(Number(r.total));
      expect(rows.some((r: any) => Number(r.d61_90) > 0)).toBe(true);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(`select * from app.aged_debt($1)`, [STUDIO_ID]))).toMatch(/FORBIDDEN/);
    });
  });
});

describe('pay before use (R-049)', () => {
  it('an unpaid pack cannot be used, and nothing more goes on account past the limit', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await svc(`update studio set pay_before_use = true, account_limit_minor = 0 where id = $1`, [STUDIO_ID]);
      const [kid] = await svc(`select s.id from student s where s.family_id = $1 and exists (select 1 from emergency_contact e where e.student_id = s.id) limit 1`, [FAMILY.a]);
      const [pack] = await svc(`select id from class_pack where studio_id = $1 and active limit 1`, [STUDIO_ID]);
      await as(svc, USERS.guardianA);
      await q(`select app.buy_pack($1, $2)`, [pack.id, kid.id]);
      const s = await nextDropIn(svc);
      expect(await expectRejected(() => q(`select app.book_drop_in($1, $2)`, [s, kid.id]))).toMatch(/PAY_FIRST/);
      // Everything paid: the pack is used.
      await svc(`update invoice set paid_minor = total_minor, status = 'paid' where family_id = $1 and status in ('issued', 'part_paid')`, [FAMILY.a]);
      const [{ r }] = await q(`select app.book_drop_in($1, $2) r`, [s, kid.id]);
      expect(r.paid_with).toBe('pack');
    });
  });

  it('a public booking is held until its invoice is paid, and a lapsed hold frees the place', async () => {
    await asUser(null as any, async (q, svc) => {
      await svc(`update studio set pay_before_use = true, account_limit_minor = 0 where id = $1`, [STUDIO_ID]);
      const s = await nextDropIn(svc, 1);
      const form = { name: 'Rui Costa', email: 'rui@example.com', phone: '07700 900111', emergency_phone: '07700 900112', privacy_ack: true };
      const [{ r }] = await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb) r`, [s, JSON.stringify(form)]);
      expect(r).toBe('held');
      const [b] = await svc(`select id, status, invoice_id from drop_in_booking where session_id = $1 and status <> 'cancelled' order by created_at desc limit 1`, [s]);
      expect(b.status).toBe('held');
      await svc(`update invoice set paid_minor = total_minor, status = 'paid' where id = $1`, [b.invoice_id]);
      expect((await svc(`select status from drop_in_booking where id = $1`, [b.id]))[0].status).toBe('booked');

      const s2 = await nextDropIn(svc, 2);
      await q(`select app.public_adult_drop_in('northstar', $1, $2::jsonb)`, [s2, JSON.stringify({ ...form, email: 'ana@example.com', name: 'Ana Costa' })]);
      const [h] = await svc(`select id, invoice_id from drop_in_booking where session_id = $1 and status = 'held'`, [s2]);
      await svc(`update drop_in_booking set held_until = now() - interval '1 minute' where id = $1`, [h.id]);
      await svc(`select app.expire_held_drop_ins()`);
      expect((await svc(`select status from drop_in_booking where id = $1`, [h.id]))[0].status).toBe('cancelled');
      expect((await svc(`select status from invoice where id = $1`, [h.invoice_id]))[0].status).toBe('void');
    });
  });
});

describe('public forms (R-048)', () => {
  it('need the privacy confirmation, record contact consent, and are rate limited', async () => {
    await asUser(null as any, async (q, svc) => {
      const [{ slug }] = await svc(`select slug from studio where id = $1`, [STUDIO_ID]);
      // A class with room for six bookings, so the rate limit (five) is what refuses the sixth.
      const [slot] = await q(`select * from app.public_trial_sessions($1) where places_left >= 6 order by starts_at limit 1`, [slug]);
      const base = { contact_name: 'Jo Bloggs', contact_email: 'jo@example.com', contact_phone: '07700 900222', child_dob: '2017-05-05' };
      expect(await expectRejected(() => q(`select app.public_book_trial($1, $2, $3::jsonb)`,
        [slug, slot.session_id, JSON.stringify({ ...base, child_name: 'Kid Zero' })]))).toMatch(/privacy|how the school uses/);
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, slot.session_id, JSON.stringify({ ...base, child_name: 'Kid One', privacy_ack: true, marketing: true })]);
      expect((await svc(`select marketing_consent from enquiry where child_name = 'Kid One'`))[0].marketing_consent).toBe(true);
      for (const n of ['Two', 'Three', 'Four', 'Five'])
        await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, slot.session_id, JSON.stringify({ ...base, child_name: 'Kid ' + n, privacy_ack: true })]);
      expect(await expectRejected(() => q(`select app.public_book_trial($1, $2, $3::jsonb)`,
        [slug, slot.session_id, JSON.stringify({ ...base, child_name: 'Kid Six', privacy_ack: true })]))).toMatch(/RATE_LIMITED/);
      expect(await expectRejected(() => q(`select 1 from public_submission`))).toMatch(/permission denied/);   // nobody reads the log
    });
  });
});

describe('retention completeness (R-052)', () => {
  it('removes stale prospects, anonymises old families, and deletes closed concerns only once a period is set', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [enq] = await svc(`insert into enquiry (studio_id, stage, contact_name, child_name, created_at, updated_at)
                                values ($1, 'enquiry', 'Old Enquirer', 'Old Child', now() - interval '120 days', now() - interval '120 days') returning id`, [STUDIO_ID]);
      const [fam] = await svc(`insert into family (studio_id, name) values ($1, 'Gone family') returning id`, [STUDIO_ID]);
      await svc(`insert into guardian (studio_id, family_id, full_name, email) values ($1, $2, 'Gone Parent', 'gone@example.com')`, [STUDIO_ID, fam.id]);
      await svc(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth) values ($1, $2, 'Former', 'student', '2010-01-01')`, [STUDIO_ID, fam.id]);
      const [con] = await svc(`insert into safeguarding_concern (studio_id, category, summary, status, updated_at)
                                values ($1, 'wellbeing', 'Resolved concern from long ago', 'closed', now() - interval '3 years') returning id`, [STUDIO_ID]);

      let steps = await q(`select * from app.apply_retention($1, false)`, [STUDIO_ID]);
      expect(steps.some((s: any) => s.step === 'prospect' && s.who === 'Old Child')).toBe(true);
      expect(steps.some((s: any) => s.step === 'financial' && s.who === 'Gone family')).toBe(true);
      expect(steps.some((s: any) => s.step === 'concern')).toBe(false);

      await q(`update retention_policy set concern_months = 24 where studio_id = $1`, [STUDIO_ID]);
      steps = await q(`select * from app.apply_retention($1, false)`, [STUDIO_ID]);
      expect(steps.some((s: any) => s.step === 'concern')).toBe(true);

      await q(`select * from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from enquiry where id = $1`, [enq.id])).toHaveLength(0);
      expect(await svc(`select 1 from safeguarding_concern where id = $1`, [con.id])).toHaveLength(0);
      expect((await svc(`select name from family where id = $1`, [fam.id]))[0].name).toBe('Former family');
      expect((await svc(`select email from guardian where family_id = $1`, [fam.id]))[0].email).toBeNull();
    });
  });
});
