/* One wording for an invoice's state, wherever it is shown — Billing, the
   family record and the family's own Payments page — so the office and a
   family never see two different answers for the same invoice (UR-54, D14). */
export { cardPaymentsEnabled } from './stripe';

export type InvoiceTone = 'positive' | 'caution' | 'critical' | 'neutral' | 'info';

const LABEL: Record<string, { label: string; tone: InvoiceTone }> = {
  draft:     { label: 'Draft',     tone: 'neutral' },
  issued:    { label: 'Due',       tone: 'caution' },
  part_paid: { label: 'Part paid', tone: 'caution' },
  paid:      { label: 'Paid',      tone: 'positive' },
  void:      { label: 'Void',      tone: 'neutral' },
  refunded:  { label: 'Refunded',  tone: 'info' },
};

export const isOpenInvoice = (status: string) => status === 'issued' || status === 'part_paid' || status === 'refunded';

/** yyyy-mm-dd from a date column, which arrives as a string or a Date. */
const day = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? '')).slice(0, 10);

/** Overdue once the due date has passed and something is still owed. */
export function isOverdue(i: { status: string; due_on?: unknown; total_minor?: unknown; paid_minor?: unknown }, today = new Date()) {
  if (!isOpenInvoice(i.status) || !i.due_on) return false;
  if (i.total_minor != null && i.paid_minor != null && Number(i.total_minor) <= Number(i.paid_minor)) return false;
  return day(i.due_on) < today.toISOString().slice(0, 10);
}

export function invoiceState(i: { status: string; due_on?: unknown; total_minor?: unknown; paid_minor?: unknown;
                                  credited_minor?: unknown; failed?: boolean; overdue?: boolean }, today = new Date()): { label: string; tone: InvoiceTone } {
  if (i.failed) return { label: 'Card declined', tone: 'critical' };
  // A credit note lowers what is owed; it is not a payment (round 2, U3). An
  // invoice only "part paid" by credit is simply due.
  const creditOnly = i.status === 'part_paid' && i.credited_minor != null && i.paid_minor != null
    && Number(i.paid_minor) <= Number(i.credited_minor);
  if (i.overdue ?? isOverdue(i, today)) return { label: i.status === 'part_paid' && !creditOnly ? 'Overdue · part paid' : 'Overdue', tone: 'caution' };
  if (creditOnly) return LABEL.issued!;
  return LABEL[i.status] ?? LABEL.draft!;
}
