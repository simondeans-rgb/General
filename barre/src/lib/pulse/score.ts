/**
 * Studio Pulse — how a 0–100 studio health score will be put together.
 *
 * Each component is a rate the studio already produces (see repos/reports).
 * The composite is withheld until there is enough history for the rates to
 * mean something: a retention figure over three weeks of a studio's life says
 * nothing about retention. Showing a confident "74" from that would be worse
 * than showing nothing.
 */
export type PulseComponent = {
  key: 'retention' | 'attendance' | 'payments' | 'capacity' | 'conversion';
  label: string;
  /** 0–1, or null when the studio has no data for it yet. */
  value: number | null;
  /** How much it counts in the composite. Weights sum to 1. */
  weight: number;
  definition: string;
  /** Rows the rate is based on — shown so a small sample reads as small. */
  basis: string;
};

export const MIN_HISTORY_DAYS = 180;      // about two terms
export const MIN_SAMPLE = 20;              // fewer observations than this and a rate is noise

export const WEIGHTS = {
  retention: 0.30, attendance: 0.20, payments: 0.20, capacity: 0.15, conversion: 0.15,
} as const;

export type PulseInputs = {
  active_90d_ago: number; leavers_90d: number;
  attended_28d: number; marked_28d: number;
  issued_90d_minor: number; overdue_90d_minor: number;
  enrolled: number; capacity: number;
  trials_attended: number; converted: number;
};

const rate = (num: number, den: number, min = MIN_SAMPLE): number | null =>
  den >= min ? Math.max(0, Math.min(1, num / den)) : null;

export function pulseComponents(i: PulseInputs): PulseComponent[] {
  return [
    { key: 'retention', label: 'Retention', weight: WEIGHTS.retention,
      value: rate(i.active_90d_ago - i.leavers_90d, i.active_90d_ago),
      definition: 'Students active 90 days ago who are still dancing.',
      basis: `${i.active_90d_ago} students 90 days ago, ${i.leavers_90d} have left` },
    { key: 'attendance', label: 'Attendance', weight: WEIGHTS.attendance,
      value: rate(i.attended_28d, i.marked_28d),
      definition: 'Present or late, out of every register mark in the last four weeks. Excused absences are left out.',
      basis: `${i.marked_28d} marks` },
    { key: 'payments', label: 'Payment health', weight: WEIGHTS.payments,
      value: i.issued_90d_minor > 0 ? 1 - Math.min(1, i.overdue_90d_minor / i.issued_90d_minor) : null,
      definition: 'Share of the last 90 days’ invoicing that is not overdue.',
      basis: i.issued_90d_minor > 0 ? 'Invoices issued in the last 90 days' : 'No invoices yet' },
    { key: 'capacity', label: 'Capacity', weight: WEIGHTS.capacity,
      value: rate(i.enrolled, i.capacity, 1),
      definition: 'Places taken across the timetable. Full is not always healthy, so this is capped in the score at 90%.',
      basis: `${i.enrolled} of ${i.capacity} places` },
    { key: 'conversion', label: 'Trial conversion', weight: WEIGHTS.conversion,
      value: rate(i.converted, i.trials_attended, 5),
      definition: 'Children who enrolled after attending a trial.',
      basis: `${i.converted} of ${i.trials_attended} attended trials` },
  ];
}

/** The composite, or the reason it cannot be given yet. */
export function pulseScore(components: PulseComponent[], historyDays: number):
  { score: number; reason?: undefined } | { score: null; reason: string } {
  if (historyDays < MIN_HISTORY_DAYS) {
    return { score: null, reason: `Needs ${MIN_HISTORY_DAYS} days of history to be meaningful. Barre has ${historyDays}.` };
  }
  const missing = components.filter(c => c.value === null);
  if (missing.length) {
    return { score: null, reason: `Not enough data yet for ${missing.map(c => c.label.toLowerCase()).join(', ')}.` };
  }
  const total = components.reduce((n, c) => {
    // A completely full timetable leaves no room for trials or growth: past
    // 90% it stops adding to health.
    const v = c.key === 'capacity' ? Math.min(c.value!, 0.9) / 0.9 : c.value!;
    return n + v * c.weight;
  }, 0);
  return { score: Math.round(total * 100) };
}
