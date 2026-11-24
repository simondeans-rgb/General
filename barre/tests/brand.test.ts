import { describe, expect, it } from 'vitest';
import { contrast, monogram, normaliseHex, paletteFor, PRESETS } from '../src/lib/brand';

describe('a school’s colour, made readable', () => {
  const awkward = ['#facc15', '#ffffff', '#a3e635', '#38bdf8', '#f9a8d4', '#000000', '#ff0000', '#777777'];

  it('always gives white button text and readable tinted text', () => {
    for (const c of [...awkward, ...PRESETS.map(p => p.hex)]) {
      const p = paletteFor(c);
      expect(contrast(p.accent, '#ffffff'), c).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.ink, p.soft), c).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.hover, '#ffffff'), c).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('leaves a colour that already works alone, and says when it changed one', () => {
    for (const p of PRESETS) {
      expect(paletteFor(p.hex)).toMatchObject({ accent: p.hex, adjusted: false });
    }
    expect(paletteFor('#facc15').adjusted).toBe(true);
  });

  it('keeps the hue of a pale colour when deepening it', () => {
    const p = paletteFor('#facc15');   // pale yellow becomes a gold, not a grey
    const [r, g, b] = [1, 3, 5].map(i => parseInt(p.accent.slice(i, i + 2), 16));
    expect(r!).toBeGreaterThan(b!);
    expect(g!).toBeGreaterThan(b!);
  });

  it('accepts the forms people type, refuses the rest', () => {
    expect(normaliseHex('0F766E')).toBe('#0f766e');
    expect(normaliseHex('#abc')).toBe('#aabbcc');
    expect(normaliseHex('teal')).toBeNull();
    expect(normaliseHex('#12345')).toBeNull();
    expect(paletteFor('nonsense').accent).toBe('#5b46d9');
  });

  it('makes a monogram from the distinctive words', () => {
    expect(monogram('Northstar Dance Academy')).toBe('N');
    expect(monogram('Kestrel Ballet School')).toBe('KB');
    expect(monogram('The Dance Studio')).toBe('TD');
  });
});
