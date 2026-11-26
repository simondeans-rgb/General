import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { contrast, paletteFor } from '../src/lib/brand';
import { THEMES, schoolColours } from '../src/lib/theme';
import { asUser, closeDb, rebuild, USERS, STUDIO_ID } from './helpers';

// The text colours each theme defines in globals.css, against its surfaces.
const TEXT = {
  classic: { surface: '#fffdf8', canvas: '#f6f2ea', s2: '#efe9de', s3: '#e7dfd1', ink: '#14211e', ink2: '#4e5a55', ink3: '#5b645e' },
  urban:   { surface: '#18122f', canvas: '#0d0a1c', s2: '#211a40', s3: '#2c2452', ink: '#f6f4ff', ink2: '#c3bce3', ink3: '#9a92c4' },
};

describe('themes stay readable', () => {
  for (const [id, t] of Object.entries(TEXT)) {
    it(`${id}: body and secondary text pass AA on every surface`, () => {
      for (const bg of [t.surface, t.canvas, t.s2, t.s3]) {
        expect(contrast(t.ink, bg)).toBeGreaterThanOrEqual(7);
        expect(contrast(t.ink2, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(t.ink3, bg)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
  it('every preset, and awkward custom colours, give readable links and button text on their theme', () => {
    for (const th of Object.values(THEMES)) {
      const colours = [...th.presets.map(p => p.accent), '#ffff00', '#000080', '#777777', '#ff0000'];
      for (const c of colours) {
        const p = paletteFor(c, th.surface);
        expect(p.accent).toBe(c);                                   // the school's colour, exactly
        expect(contrast(p.text, th.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.ink, p.soft)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it('Swayvo is the default: Count blue and Rosin peach on Classic', () => {
    expect(schoolColours(null)).toMatchObject({ accent: '#2638f0', secondary: '#ffb089' });
    expect(THEMES.classic.presets[0]!.name).toBe('Swayvo');
  });
  it('a school without its own colours gets its theme’s', () => {
    expect(schoolColours('urban')).toMatchObject({ accent: '#c6f432', secondary: '#8b5cf6' });
    expect(schoolColours('classic', '#1e3a8a').accent).toBe('#1e3a8a');
    expect(schoolColours('nonsense').theme.id).toBe('classic');
  });
});

describe('saving a theme', () => {
  beforeAll(async () => { await rebuild(); }, 60_000);
  afterAll(async () => { await closeDb(); });
  it('the owner switches style and second colour; nonsense is refused', async () => {
    await asUser(USERS.owner, async q => {
      await q(`update studio set theme = 'urban', brand_secondary = '#22d3ee' where id = $1`, [STUDIO_ID]);
      expect((await q(`select theme, brand_secondary from studio where id = $1`, [STUDIO_ID]))[0]).toEqual({ theme: 'urban', brand_secondary: '#22d3ee' });
      await expect(q(`update studio set theme = 'disco' where id = $1`, [STUDIO_ID])).rejects.toThrow();
    });
    await asUser(USERS.admin, async q => {
      expect(await q(`update studio set theme = 'classic' where id = $1 returning id`, [STUDIO_ID])).toHaveLength(0);
    });
  });
});
