import type { SupportRow } from './repos/progress';

/** Below this, attendance this term is a reason to look (the amber on "Everyone"). */
export const LOW_ATTENDANCE = 70;

/**
 * Why a student may need support (UR-45, round 2 U11), as plain words. Facts,
 * not labels: low attendance this term, a run of absences, skills not
 * started, medical notes, the office's note.
 */
export function supportReasons(r: SupportRow | undefined,
  s: { has_medical_need?: boolean | null; attendance_pct?: number | null }): string[] {
  const out: string[] = [];
  const pct = r?.attendance_pct ?? s.attendance_pct ?? null;
  if (pct != null && pct < LOW_ATTENDANCE) out.push(`Attendance ${pct}% this term`);
  if (r && r.absence_streak >= 2) out.push(`Absent the last ${r.absence_streak} classes`);
  if (r && r.not_yet > 0) out.push(`${r.not_yet} skill${r.not_yet === 1 ? '' : 's'} not started`);
  if (s.has_medical_need) out.push('Medical notes');
  if (r?.support_note) out.push('Office note');
  return out;
}
