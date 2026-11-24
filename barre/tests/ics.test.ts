import { describe, expect, it } from 'vitest';
import { toIcs } from '../src/lib/ics';

describe('calendar file (R-036)', () => {
  const ics = toIcs('Wright family — classes', [
    { id: 's1', title: 'Junior Tap', starts_at: '2026-12-01T16:30:00Z', ends_at: '2026-12-01T17:15:00Z', location: 'Studio Two, Blackheath' },
    { id: 's2', title: 'Grade 3 Ballet', starts_at: '2026-12-02T17:30:00Z', ends_at: '2026-12-02T18:30:00Z', cancelled: true,
      description: 'Teacher unwell; we are sorry for the late notice and will add a catch-up class at half term.' },
  ], new Date('2026-11-24T12:00:00Z'));
  it('is a valid calendar with stable ids and escaped text', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:s1@barre.app');
    expect(ics).toContain('DTSTART:20261201T163000Z');
    expect(ics).toContain('LOCATION:Studio Two\\, Blackheath');
  });
  it('marks a cancelled session as cancelled', () => {
    expect(ics).toContain('SUMMARY:Cancelled: Grade 3 Ballet\r\nSTATUS:CANCELLED');
  });
  it('folds long lines at 75 octets', () => {
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
