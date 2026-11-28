'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { Button, ErrorState, Word } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadIcs } from '@/lib/ics';
import * as F from '@/lib/repos/family';
import { dateLong, time, dateShort } from '@/lib/format';

/*
 * Trials and drop-ins a family has booked (F5): each with its booking
 * reference, a calendar file, and Cancel within the school's policy.
 */

/** The bookings for one person, or for everyone when no student is given. */
export function useBookings(studentId?: string) {
  const rows = useRows<F.Booking>(['my-bookings'], F.MY_BOOKINGS);
  return { ...rows, data: (rows.data ?? []).filter(b => !studentId || b.student_id === studentId) };
}

/** One booking as a calendar file, named by its reference. */
export function addBookingToCalendar(b: { reference: string; class_name: string; starts_at: string; ends_at: string | null;
  location?: string | null; kind: string }, school?: string) {
  downloadIcs(`${b.reference}.ics`, b.class_name, [{
    id: `booking-${b.reference}`, title: `${b.kind === 'trial' ? 'Trial: ' : ''}${b.class_name}`,
    starts_at: b.starts_at, ends_at: b.ends_at ?? b.starts_at, location: b.location ?? null,
    description: `Booking reference ${b.reference}${school ? ` at ${school}` : ''}.`,
  }]);
}

/** What cancelling costs, in words, before anyone presses the button. */
export function cancelRule(b: { kind: string; free_until: string | null; paid_with?: string }) {
  if (b.kind === 'trial') return 'You can cancel until the class starts.';
  if (b.paid_with === 'free') return 'You can cancel until the class starts.';
  if (b.free_until && new Date(b.free_until).getTime() > Date.now())
    return `Free to cancel until ${dateShort(b.free_until)}, ${time(b.free_until)}.`;
  return 'Less than 24 hours to go: cancelling frees the place, but the class is still charged.';
}

export function BookingList({ studentId, who }: { studentId: string; who: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const rows = useBookings(studentId);
  const [done, setDone] = React.useState<string | null>(null);
  const cancel = useMutation({
    mutationFn: async (b: F.Booking) => {
      const r = await runAs(session, q => q<{ r: string }>(b.kind === 'trial' ? F.CANCEL_TRIAL : F.CANCEL_DROP_IN, [b.id]));
      return { b, r: r[0]?.r };
    },
    onSuccess: ({ b, r }) => {
      setDone(`${b.class_name} on ${dateLong(b.starts_at)} is cancelled${r === 'refunded' ? ', and you have not been charged' : r === 'released' ? '. It was less than 24 hours away, so it is still charged' : ''}.`);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  if (!rows.data.length && !done) return null;
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Bookings</dt>
      <dd className="min-w-0">
        {done && <p role="status" className="mb-2 text-[0.875rem]"><span className="font-semibold text-positive">Done.</span> {done}</p>}
        {cancel.error != null && <ErrorState error={cancel.error} />}
        <ul className="divide-y divide-line">
          {rows.data.map(b => (
            <li key={b.id} className="py-2 first:pt-0">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{b.class_name}</span>
                <Word tone="ink">{b.kind === 'trial' ? 'Trial' : 'Drop-in'}</Word>
                {b.status === 'held' && <Word tone="caution">Held</Word>}
              </p>
              <p className="text-[0.8125rem] text-ink-3">
                {dateLong(b.starts_at)}, {time(b.starts_at)}{b.ends_at ? `–${time(b.ends_at)}` : ''}{b.location ? ` · ${b.location}` : ''}
              </p>
              <p className="text-[0.8125rem] text-ink-3">Reference <span className="tnum font-semibold text-ink-2">{b.reference}</span> · {cancelRule(b)}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => addBookingToCalendar(b)}>
                  <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                </Button>
                <Button size="sm" variant="ghost" loading={cancel.isPending && cancel.variables?.id === b.id}
                  aria-label={`Cancel ${b.class_name} on ${dateLong(b.starts_at)} for ${who}`}
                  onClick={() => cancel.mutate(b)}>Cancel</Button>
              </div>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}
