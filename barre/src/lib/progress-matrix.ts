import type { ProgressCell } from './repos/progress';

/** Rows of children, columns of skills, from the cells the database returns. */
export function matrixOf(cells: ProgressCell[]) {
  const skills = [...new Map(cells.map(c => [c.skill_id, { id: c.skill_id, name: c.skill, framework: c.framework, ord: c.ord }])).values()];
  const kids = [...new Map(cells.map(c => [c.student_id, { id: c.student_id, name: c.student_name }])).values()];
  const at = new Map(cells.map(c => [`${c.student_id}|${c.skill_id}`, c]));
  return { skills, kids, cell: (k: string, s: string) => at.get(`${k}|${s}`) };
}
