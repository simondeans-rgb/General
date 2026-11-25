import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('school imagery (R-060)', () => {
  it('the owner sets a hero photo and a light logo; only image data or https is accepted', async () => {
    await asUser(USERS.owner, async q => {
      await q(`update studio set hero_url = 'data:image/jpeg;base64,AAAA', logo_light_url = 'https://cdn.example.com/light.png' where id = $1`, [STUDIO_ID]);
      expect(await expectRejected(() => q(`update studio set hero_url = 'javascript:alert(1)' where id = $1`, [STUDIO_ID]))).toMatch(/check/);
      expect(await expectRejected(() => q(`update studio set hero_url = 'data:image/svg+xml;base64,AAAA' where id = $1`, [STUDIO_ID]))).toMatch(/check/);
    });
  });
  it('the public page shows them; a parent cannot change them', async () => {
    await asUser(null as any, async (q, svc) => {
      await svc(`update studio set hero_url = 'https://cdn.example.com/hero.jpg' where id = $1`, [STUDIO_ID]);
      const [s] = await q(`select hero_url from app.public_school('northstar')`);
      expect(s.hero_url).toBe('https://cdn.example.com/hero.jpg');
    });
    await asUser(USERS.guardianA, async q => {
      const r = await q(`update studio set hero_url = null where id = $1 returning id`, [STUDIO_ID]).catch(() => []);
      expect(r).toHaveLength(0);
    });
  });
});
