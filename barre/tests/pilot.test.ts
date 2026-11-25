import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID } from './helpers';
import { PLATFORM_ADMIN, OTHER_STUDIOS } from '../src/lib/db/seed/data';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('pilot activation (R-040)', () => {
  it('scores each school on what predicts staying, and says where it is stuck', async () => {
    await asUser(PLATFORM_ADMIN, async q => {
      await q(`select app.platform_set_pilot($1, 'Spring 2027', current_date - 30, 'Owner keen; uses spreadsheets today')`, [OTHER_STUDIOS.kestrel]);
      const rows = await q(`select * from app.platform_activation()`);
      const north = rows.find((r: any) => r.id === STUDIO_ID);
      expect(north.setup_done && north.families_in).toBe(true);
      expect(north.score).toBeGreaterThanOrEqual(50);
      const k = rows.find((r: any) => r.id === OTHER_STUDIOS.kestrel);
      expect(k).toMatchObject({ pilot_cohort: 'Spring 2027', days_in: 30, setup_done: false, stuck_on: 'Setting up classes' });
      expect(Object.keys(k).join()).not.toMatch(/email|first_name|full_name/);
    });
  });
  it('is for the platform team only', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select * from app.platform_activation()`))).toMatch(/FORBIDDEN|platform/i);
    });
  });
});
