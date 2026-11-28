/**
 * School setup as a count of eight (round-2 review, F16): the thirteen setup
 * steps on /onboarding, grouped into eight beats. Each beat fills as its
 * steps are done, so the count fills as the school takes shape.
 */
export const SETUP_COUNTS: { beat: number; label: string; steps: string[] }[] = [
  { beat: 1, label: 'Your school', steps: ['studio', 'privacy'] },
  { beat: 2, label: 'Your brand', steps: ['brand'] },
  { beat: 3, label: 'Safeguarding', steps: ['dsl'] },
  { beat: 4, label: 'Places', steps: ['locations'] },
  { beat: 5, label: 'Teaching', steps: ['styles', 'frameworks', 'terms'] },
  { beat: 6, label: 'Teachers', steps: ['staff'] },
  { beat: 7, label: 'Classes', steps: ['classes'] },
  { beat: 8, label: 'Families and fees', steps: ['families', 'discounts', 'payments'] },
];

export type Beat = { beat: number; label: string; done: number; total: number; complete: boolean; fill: number };

export function setupCount(done: ReadonlySet<string>): Beat[] {
  return SETUP_COUNTS.map(c => {
    const n = c.steps.filter(s => done.has(s)).length;
    return { beat: c.beat, label: c.label, done: n, total: c.steps.length, complete: n === c.steps.length, fill: n / c.steps.length };
  });
}

/** "Count 3 of 8 · Safeguarding next" — what the count says in words. */
export function countSummary(beats: Beat[]): string {
  const full = beats.filter(b => b.complete).length;
  const next = beats.find(b => !b.complete);
  return next ? `${full} of 8 counts full · ${next.label} next` : 'A full count: everything is set up';
}
