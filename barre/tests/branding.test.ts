import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asReader, closeDb, expectRejected, rebuild, USERS, STUDIO_ID } from './helpers';
import { OTHER_STUDIOS } from '../src/lib/db/seed/data';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==';
const SET = `update studio set brand_colour = $2, logo_url = $3 where id = $1 returning id`;

describe('a school’s brand', () => {
  it('its owner sets the colour and logo', async () => {
    await asUser(USERS.owner, async q => {
      expect(await q(SET, [STUDIO_ID, '#0f766e', PNG])).toHaveLength(1);
    });
  });

  it('nobody else at the school can change it', async () => {
    for (const who of [USERS.admin, USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => { expect(await q(SET, [STUDIO_ID, '#000000', null])).toHaveLength(0); });
    }
  });

  it('everyone at the school can see it — parents included', async () => {
    for (const who of [USERS.guardianA, USERS.teacherTap]) {
      await asReader(who, async q => {
        const [s] = await q(`select name, brand_colour, logo_url from studio`);
        expect(s.name).toBe('Northstar Dance Academy');
        expect(s.brand_colour).toMatch(/^#[0-9a-f]{6}$/);
        expect(s.logo_url).toMatch(/^data:image\/png/);
      });
    }
  });

  it('refuses a malformed colour and anything but a raster image or https link', async () => {
    await asUser(USERS.owner, async q => {
      for (const bad of ['blue', '#12345', '#GGGGGG', 'red; background:url(x)']) {
        await expectRejected(() => q(SET, [STUDIO_ID, bad, null]));
      }
      for (const bad of [
        'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+',   // an SVG can carry script
        'javascript:alert(1)', 'http://insecure.example/logo.png', 'data:text/html;base64,PGgxPg==',
        'data:image/png;base64,' + 'A'.repeat(400_001),
      ]) {
        await expectRejected(() => q(SET, [STUDIO_ID, '#0f766e', bad]));
      }
      expect(await q(SET, [STUDIO_ID, '#0f766e', 'https://cdn.example/logo.png'])).toHaveLength(1);
    });
  });

  it('a suspended school cannot change its brand', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`update studio set status = 'suspended' where id = $1`, [STUDIO_ID]);
      expect(await q(SET, [STUDIO_ID, '#000000', null])).toHaveLength(0);
    });
  });

  it('one school’s brand is not another’s to read or change', async () => {
    await asUser(USERS.owner, async q => {
      expect(await q(SET, [OTHER_STUDIOS.kestrel, '#000000', null])).toHaveLength(0);
      expect(await q(`select id from studio where id = $1`, [OTHER_STUDIOS.kestrel])).toHaveLength(0);
    });
  });
});
