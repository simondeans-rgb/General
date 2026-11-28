/**
 * Clashes in words (round 2 panel, U6): a teacher's list, a student's
 * timetable and a family's schedule all say when someone is booked into two
 * places at once, and with what.
 */
import { time, type Stamp } from './format';

const ms = (v: Stamp) => new Date(v).getTime();

/** "Junior Tap 16:30–17:15, Greenwich" — the other booking, briefly. */
export function otherLine(o: { name: string; starts_at: Stamp; ends_at: Stamp | null; place?: string | null; same_place?: boolean }): string {
  return `${o.name} ${time(o.starts_at)}${o.ends_at ? `–${time(o.ends_at)}` : ''}${o.place && !o.same_place ? `, ${o.place}` : ''}`;
}

/** How many distinct pairs clash, from rows naming each session's partner. */
export function clashPairs(rows: { session_id: string; other_session_id: string }[]): number {
  return new Set(rows.map(r => [r.session_id, r.other_session_id].sort().join('|'))).size;
}

export type DiaryLike = {
  uid: string; item_kind: string; title: string; starts_at: Stamp; ends_at: Stamp | null;
  location: string | null; status: string; student_id: string; child: string;
};

/** Exams are shown as all-day; a booking with no end is taken as an hour. */
const endOf = (r: DiaryLike) => (r.ends_at ? ms(r.ends_at) : ms(r.starts_at) + 3_600_000);

/**
 * For each diary line (keyed `${uid}|${student_id}`), what else that same
 * person is booked into at the same time. Cancelled items and all-day exams
 * never clash. The same item twice for one child is not a clash.
 */
export function diaryClashes<T extends DiaryLike>(rows: T[]): Map<string, { other: T; minutes: number; elsewhere: boolean }[]> {
  const out = new Map<string, { other: T; minutes: number; elsewhere: boolean }[]>();
  const live = rows.filter(r => r.status !== 'cancelled' && r.item_kind !== 'exam');
  const byStudent = new Map<string, T[]>();
  for (const r of live) byStudent.set(r.student_id, [...(byStudent.get(r.student_id) ?? []), r]);
  for (const list of byStudent.values()) {
    for (const a of list) for (const b of list) {
      if (a === b || a.uid === b.uid) continue;
      const overlap = Math.min(endOf(a), endOf(b)) - Math.max(ms(a.starts_at), ms(b.starts_at));
      if (overlap <= 0) continue;
      const k = `${a.uid}|${a.student_id}`;
      out.set(k, [...(out.get(k) ?? []), {
        other: b, minutes: Math.round(overlap / 60_000),
        elsewhere: !!a.location && !!b.location && a.location !== b.location,
      }]);
    }
  }
  return out;
}

/** "Overlaps Senior Tap by 30 min, at another studio". */
export function diaryClashLine(c: { other: DiaryLike; minutes: number; elsewhere: boolean }): string {
  return `Overlaps ${c.other.title} ${time(c.other.starts_at)}${c.other.ends_at ? `–${time(c.other.ends_at)}` : ''}`
    + ` by ${c.minutes} min${c.elsewhere ? `, at ${c.other.location}` : ''}`;
}

/** "Marcus also teaches Junior Tap", or on a teacher's own week "You're also teaching…" (U10). */
export function alsoTeaching(a: { teacher: string | null; location: string | null }, b: { name: string; starts_at: Stamp; ends_at: Stamp; location: string | null }): string {
  if (a.teacher === 'You') {
    return `You’re also teaching ${b.name} (${time(b.starts_at)}–${time(b.ends_at)}${b.location && b.location !== a.location ? `, ${b.location}` : ''})`;
  }
  return `${(a.teacher ?? '').split(' ')[0]} also teaches ${b.name}`;
}
