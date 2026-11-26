import { describe, expect, it } from 'vitest';
import { contrast, monogram, normaliseHex, paletteFor } from '../src/lib/brand';
import { THEMES } from '../src/lib/theme';
const PRESETS = Object.values(THEMES).flatMap(t => t.presets.map(p => ({ hex: p.accent })));

const awkward = ['#facc15', '#ffffff', '#a3e635', '#38bdf8', '#f9a8d4', '#000000', '#ff0000', '#777777', '#7a7a7a', '#1e3a8a'];

describe('a school’s exact colour, kept readable', () => {
  it('uses the exact hex for every surface — never a substitute', () => {
    for (const c of [...awkward, ...PRESETS.map(p => p.hex)]) expect(paletteFor(c).accent).toBe(c);
    expect(paletteFor('#FACC15').accent).toBe('#facc15');
  });

  it('puts white or black on it, whichever is readable', () => {
    for (const c of [...awkward, ...PRESETS.map(p => p.hex)]) {
      const p = paletteFor(c);
      expect(contrast(p.onAccent, p.accent), c).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.onAccent, p.hover), `${c} hover`).toBeGreaterThanOrEqual(4.5);
    }
    expect(paletteFor('#facc15')).toMatchObject({ onAccent: '#000000', darkText: true });
    expect(paletteFor('#1e3a8a')).toMatchObject({ onAccent: '#ffffff', darkText: false });
  });

  it('keeps text and outlines in the brand colour readable on white', () => {
    for (const c of awkward) {
      const p = paletteFor(c);
      expect(contrast(p.text, '#ffffff'), c).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.line, '#ffffff'), c).toBeGreaterThanOrEqual(3);
      expect(contrast(p.ink, p.soft), c).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('only deepens text when the exact colour would be too faint, keeping its hue', () => {
    for (const p of PRESETS.filter(x => contrast(x.hex, '#ffffff') >= 4.5)) expect(paletteFor(p.hex)).toMatchObject({ text: p.hex, textDeepened: false });
    expect(paletteFor('#0b3b34')).toMatchObject({ text: '#0b3b34', textDeepened: false });   // a deep school green
    const y = paletteFor('#facc15');
    expect(y.textDeepened).toBe(true);
    const [r, g, b] = [1, 3, 5].map(i => parseInt(y.text.slice(i, i + 2), 16));
    expect(r!).toBeGreaterThan(b!);
    expect(g!).toBeGreaterThan(b!);
  });

  it('accepts the forms people type, refuses the rest', () => {
    expect(normaliseHex('0F766E')).toBe('#0f766e');
    expect(normaliseHex(' #abc ')).toBe('#aabbcc');
    expect(normaliseHex('teal')).toBeNull();
    expect(normaliseHex('#12345')).toBeNull();
    expect(paletteFor('nonsense').accent).toBe('#2638f0');   // falls back to Swayvo blue
  });

  it('makes a monogram from the distinctive words', () => {
    expect(monogram('Northstar Dance Academy')).toBe('N');
    expect(monogram('Kestrel Ballet School')).toBe('KB');
    expect(monogram('The Dance Studio')).toBe('TD');
  });
});
