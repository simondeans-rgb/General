/* Seed identifiers, kept apart from the seed itself so that screens which
   need a known id (the demo's person switcher) do not pull the whole sample
   school into every page's JavaScript. */
/** Deterministic, valid v4-shaped uuid: one stable namespace per entity type.
 *  The namespace occupies the first group and the ordinal the last, so a
 *  student id can never collide with a studio id — they did when both groups
 *  were derived from the same zero-padded number. */
export const uid = (ns: number, n: number) =>
  `${String(ns).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const NS = {
  studio: 1, user: 2, membership: 3, location: 4, room: 5, staff: 6,
  family: 7, guardian: 8, student: 9, medical: 10, emergency: 11, consent: 12,
  term: 13, break: 14, style: 15, level: 16, class: 17,
  enrolment: 18, trial: 19, waitlist: 20, enquiry: 21,
  invoice: 22, item: 23, payment: 24, comm: 25, notification: 26,
  resource: 27, assignment: 28, feedback: 29, assessment: 30,
  event: 31, participant: 32, request: 33, file: 34,
} as const;

export const STUDIO_ID = uid(NS.studio, 1);
export const OTHER_STUDIOS = { riverside: uid(NS.studio, 2), kestrel: uid(NS.studio, 3), pointe: uid(NS.studio, 4) };
