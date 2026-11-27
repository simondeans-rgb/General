'use client';

import { DetailSection } from '@/components/app/detail-panel';
import { useRows } from '@/lib/query';
import { money, dateShort } from '@/lib/format';

/* What came across from the school's previous system (UR-32): a record only.
   Shown when there is some; nothing appears for a school that imported none. */

const INVOICES = `select id, number, issued_on, due_on, description, total_minor, paid_minor
  from imported_invoice where family_id = $1 order by issued_on desc, number desc`;
const ATTENDANCE = `select id, period, class_name, attended, absent
  from attendance_history where student_id = $1 order by created_at, period`;

export function ImportedInvoices({ familyId }: { familyId: string }) {
  const rows = useRows<{ id: string; number: string; issued_on: string; description: string | null; total_minor: string; paid_minor: string }>(
    ['imported-invoices', familyId], INVOICES, [familyId]);
  if (!rows.data?.length) return null;
  return (
    <DetailSection title="Earlier invoices">
      <p className="mb-1 text-[0.8125rem] text-ink-3">Imported from your previous system. A record only: what is still owed is in the opening balance.</p>
      <ul className="divide-y divide-line">
        {rows.data.map(i => (
          <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto_5.5rem] items-baseline gap-3 py-2 text-[0.875rem]">
            <span className="min-w-0">
              <span className="tnum text-ink-2">{i.number}</span> <span className="text-[0.8125rem] text-ink-3">· {dateShort(i.issued_on)}</span>
              {i.description && <span className="block truncate text-[0.8125rem] text-ink-3">{i.description}</span>}
            </span>
            <span className="tnum font-semibold">{money(i.total_minor)}</span>
            <span className="text-right text-[0.8125rem] text-ink-3">
              Imported{Number(i.paid_minor) >= Number(i.total_minor) ? ' · paid' : ` · ${money(i.paid_minor)} paid`}
            </span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

export function EarlierAttendance({ studentId }: { studentId: string }) {
  const rows = useRows<{ id: string; period: string; class_name: string; attended: number; absent: number }>(
    ['attendance-history', studentId], ATTENDANCE, [studentId]);
  if (!rows.data?.length) return null;
  return (
    <DetailSection title="Earlier attendance">
      <p className="mb-1 text-[0.8125rem] text-ink-3">Imported from your previous system.</p>
      <ul className="divide-y divide-line">
        {rows.data.map(r => (
          <li key={r.id} className="flex items-baseline justify-between gap-3 py-1.5 text-[0.875rem]">
            <span className="min-w-0 truncate">{r.period}{r.class_name ? ` · ${r.class_name}` : ''}</span>
            <span className="tnum shrink-0 text-ink-2">{r.attended} of {r.attended + r.absent}</span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}
