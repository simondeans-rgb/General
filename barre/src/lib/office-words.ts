/**
 * Small rules the office screens share (round 2 panel, U3/U8/U13). Kept free
 * of React and the database so they can be tested on their own.
 */

/** "1 family", "2 families". Give the plural when it is not the word plus s. */
export function plural(n: number | string | null | undefined, one: string, many?: string): string {
  const k = Number(n ?? 0);
  return `${k.toLocaleString('en-GB')} ${k === 1 ? one : many ?? one + 's'}`;
}

/** A date of birth with its year, as the office checks it against a certificate: "11 Feb 2021". */
export function dateWithYear(v: string | Date | null | undefined): string {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(String(v).length === 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' }).format(d);
}

/**
 * Whether the office may move or enrol a child of this age into a class,
 * written from the same rule the database enforces (0046 check_class_age with
 * p_office): just outside a children's range is allowed if the teacher agrees;
 * an under-18 never goes into an adult class, nor an adult into a children's one.
 */
export type AgeFit = 'fits' | 'teacher' | 'never';
export function officeAgeFit(age: number | null | undefined,
                             cls: { age_min: number | null; age_max: number | null }): AgeFit {
  if (age == null || (cls.age_min == null && cls.age_max == null)) return 'fits';
  if (cls.age_min != null && cls.age_min >= 18 && age < 18) return 'never';
  if (cls.age_max != null && cls.age_max < 18 && age >= 18) return 'never';
  if ((cls.age_min != null && age < cls.age_min) || (cls.age_max != null && age > cls.age_max)) return 'teacher';
  return 'fits';
}

/**
 * Picker labels that tell two records with the same name apart (U8). A name
 * used once is shown as it is; a repeated name gets the children, else the
 * guardian, else the postcode: "Haddad family (Rana; Omar, Lina)".
 */
export function pickerLabels<T extends { id: string; name: string; guardian?: string | null;
  children?: string | null; postcode?: string | null }>(rows: T[]): Map<string, string> {
  const count = new Map<string, number>();
  for (const r of rows) count.set(r.name.trim().toLowerCase(), (count.get(r.name.trim().toLowerCase()) ?? 0) + 1);
  const out = new Map<string, string>();
  for (const r of rows) {
    if ((count.get(r.name.trim().toLowerCase()) ?? 0) < 2) { out.set(r.id, r.name); continue; }
    const bits = [r.guardian, r.children, r.postcode].map(b => b?.trim()).filter(Boolean);
    out.set(r.id, bits.length ? `${r.name} (${bits.join('; ')})` : r.name);
  }
  return out;
}

/**
 * Owner Today "Needs attention" (U13): rows are grouped under Today and This
 * week, Today first, and only the first few are shown until asked for more.
 */
export type AttentionItem = { key: string; when: 'today' | 'week' };
export function groupAttention<T extends AttentionItem>(items: T[], top = 5, expanded = false) {
  const ordered = [...items.filter(i => i.when === 'today'), ...items.filter(i => i.when === 'week')];
  const shown = expanded ? ordered : ordered.slice(0, top);
  return {
    today: shown.filter(i => i.when === 'today'),
    week: shown.filter(i => i.when === 'week'),
    hidden: ordered.length - shown.length,
  };
}

/**
 * Who a bulk reminder actually reaches (U3). Messages land in the app, so a
 * family with nobody signed in sees nothing until email is connected.
 */
export function reminderReach<T extends { uses_app: boolean; family_name: string }>(chosen: T[]) {
  const reached = chosen.filter(f => f.uses_app);
  const unreached = chosen.filter(f => !f.uses_app);
  return { reached, unreached };
}

/** A credit note lowers what is owed; it is not money received (U3). */
export function paidAndCredited(i: { total_minor: string | number; paid_minor: string | number; credited_minor?: string | number | null }) {
  const credited = Math.max(0, Number(i.credited_minor ?? 0));
  const paid = Math.max(0, Number(i.paid_minor) - credited);
  const toPay = Math.max(0, Number(i.total_minor) - Number(i.paid_minor));
  return { total: Number(i.total_minor), credited, paid, toPay };
}

/** "will be added" becomes "were added" once an import has run (U8). */
export function pastTense(message: string): string {
  return message.replace(/\bwill be\b/g, 'were');
}
