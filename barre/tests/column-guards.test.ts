import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, FAMILY } from './helpers';
import { PLATFORM_ADMIN, OTHER_STUDIOS } from '../src/lib/db/seed/data';
import * as F from '../src/lib/repos/family';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('an owner cannot change what Swayvo manages (R-045)', () => {
  const protectedCols: [string, string][] = [
    ['plan_id', `(select id from plan where code = 'academy')`], ['status', `'past_due'`], ['status_reason', `'x'`],
    ['trial_ends_on', `current_date + 365`], ['suspended_at', `now()`], ['cancelled_at', `now()`],
    ['data_deletion_due_on', `current_date + 999`], ['slug', `'other'`], ['currency', `'USD'`],
    ['pilot_cohort', `'VIP'`], ['deleted_at', `now()`],
  ];
  for (const [col, val] of protectedCols) {
    it(`refuses ${col}`, async () => {
      await asUser(USERS.owner, async q => {
        expect(await expectRejected(() => q(`update studio set ${col} = ${val} where id = $1`, [STUDIO_ID]))).toMatch(/managed by Swayvo/);
      });
    });
  }
  it('still saves the brand, style, contact details and settings', async () => {
    await asUser(USERS.owner, async q => {
      const r = await q(`update studio set name = 'Northstar', brand_colour = '#0b3b34', brand_secondary = '#c86a4f', theme = 'urban',
                           logo_url = null, contact_email = 'hi@x.io', timezone = 'Europe/London', credit_cancelled_classes = true,
                           onboarded_at = now() where id = $1 returning id`, [STUDIO_ID]);
      expect(r).toHaveLength(1);
    });
  });
  it('the platform can still change plans and status through its functions', async () => {
    await asUser(PLATFORM_ADMIN, async (q, svc) => {
      await q(`select app.platform_set_status($1, 'past_due', 'Card expired')`, [OTHER_STUDIOS.kestrel]);
      expect((await svc(`select status from studio where id = $1`, [OTHER_STUDIOS.kestrel]))[0].status).toBe('past_due');
    });
  });
});

describe('a parent cannot change the family balance (R-046)', () => {
  it('refuses balance, prospect flag and deletion; allows the family name', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(`update family set balance_minor = -50000 where id = $1`, [FAMILY.a]))).toMatch(/worked out from invoices/);
      expect(await expectRejected(() => q(`update family set is_prospect = true where id = $1`, [FAMILY.a]))).toMatch(/only the office/);
      expect(await expectRejected(() => q(`update family set deleted_at = now() where id = $1`, [FAMILY.a])));
      expect(await q(`update family set name = 'Wright-Ellis family' where id = $1 returning id`, [FAMILY.a])).toHaveLength(1);
    });
  });
  it('nobody writes the balance directly — not even the office — but payments still move it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      expect(await expectRejected(() => q(`update family set balance_minor = -12345 where id = $1`, [FAMILY.a]))).toMatch(/worked out from invoices/);
      const [{ id }] = await q(`select app.create_invoice($1, $2::jsonb) id`, [FAMILY.a, JSON.stringify([{ kind: 'other', description: 'Leotard', unit_minor: 2500 }])]);
      const before = Number((await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor);
      await q(`select app.record_payment($1, 2500, 'cash', $2, null)`, [FAMILY.a, id]);
      const after = Number((await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor);
      expect(after).toBe(before - 2500);
    });
  });
  it('a parent buying a pack still updates the balance through the system', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      const [pack] = await q(`select id from class_pack limit 1`);
      const before = Number((await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor);
      await q(`select app.buy_pack($1, $2)`, [pack.id, kid.id]);
      expect(Number((await svc(`select balance_minor from family where id = $1`, [FAMILY.a]))[0].balance_minor)).toBeGreaterThan(before);
    });
  });
});

describe('"From the studio" shows only the studio (R-047)', () => {
  it('a parent’s own messages and requests are not listed', async () => {
    await asUser(USERS.guardianA, async q => {
      await q(`insert into communication (studio_id, kind, family_id, subject, body) values ($1, 'direct', $2, 'My question', 'Is there class on Monday?')`, [STUDIO_ID, FAMILY.a]);
      const rows = await q(F.MY_MESSAGES);
      expect(rows.some((r: any) => r.subject === 'My question')).toBe(false);
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
