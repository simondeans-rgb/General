'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { readAs, runAs } from '@/lib/db/client';
import { SchoolMark, PoweredBy, useSchoolTheme, logoFor } from '@/components/app/brand';
import { Button, EmptyState, ErrorState, Notice, Skeleton } from '@/components/ui';
import { addBookingToCalendar } from '@/components/app/bookings';
import { money, dateLong, time, dateShort } from '@/lib/format';

type Booking = { reference: string; kind: 'trial' | 'drop_in'; status: string; studio_name: string; studio_slug: string;
  class_name: string; starts_at: string; ends_at: string | null; location: string | null; address: string | null;
  dancer: string; price_minor: number | null; can_cancel: boolean; free_until: string | null;
  contact_email: string | null; contact_phone: string | null };
type School = { name: string; brand_colour: string | null; logo_url: string | null; theme: string; brand_secondary: string | null;
  logo_light_url: string | null };

export default function BookingPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><ManageBooking /></Suspense>;
}

/**
 * The manage-booking link from a trial or drop-in confirmation (F5). No
 * account needed: the link's secret token is the key, and it stops working a
 * day after the class. Shows the booking, adds it to a calendar, and cancels
 * it within the school's policy.
 */
function ManageBooking() {
  const token = useSearchParams().get('token') ?? '';
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['public-booking', token], enabled: !!token,
    queryFn: async () => (await readAs<Booking>(null, `select * from app.public_booking($1)`, [token]))[0] ?? null });
  const b = q.data;
  const school = useQuery({ queryKey: ['public-school', b?.studio_slug], enabled: !!b?.studio_slug,
    queryFn: async () => (await readAs<School>(null, `select * from app.public_school($1)`, [b!.studio_slug]))[0] ?? null });
  useSchoolTheme(school.data ?? null);
  const [sure, setSure] = React.useState(false);
  const cancel = useMutation({
    mutationFn: async () => (await runAs(null, x => x<{ r: string }>(`select app.public_cancel_booking($1) r`, [token])))[0]?.r,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['public-booking', token] }),
  });
  const charged = b?.kind === 'drop_in' && !!b.free_until && new Date(b.free_until).getTime() <= Date.now() && (b.price_minor ?? 0) > 0;
  const contact = [b?.contact_phone, b?.contact_email].filter(Boolean);

  return (
    <main id="main" className="min-h-dvh bg-surface px-4 pb-10 pt-6 sm:pt-10">
      <div className="mx-auto max-w-xl space-y-8">
        {!token && <EmptyState title="This link is missing its code" body="Open the manage-booking link exactly as it was given to you." />}
        {token && q.isLoading && <Skeleton className="h-40" />}
        {q.error != null && <ErrorState error={q.error} />}
        {token && q.data === null && (
          <EmptyState title="This link has expired or is not valid"
            body="Booking links stop working a day after the class. To change a booking, contact the school directly." />
        )}
        {b && (
          <>
            <header className="flex items-center gap-3">
              <SchoolMark name={b.studio_name} logo={school.data ? logoFor(school.data) : null} className="size-12" />
              <div className="min-w-0">
                <h1 className="font-display text-[1.625rem] font-[800] leading-tight [font-stretch:112%]">Your booking</h1>
                <p className="text-[0.9375rem] text-ink-2">{b.studio_name}</p>
              </div>
            </header>

            {cancel.isSuccess || b.status === 'cancelled' ? (
              <Notice word="Cancelled" tone="critical" title={`${b.class_name}, ${dateLong(b.starts_at)}`}
                detail={cancel.data === 'released'
                  ? 'The place is free for someone else. It was less than 24 hours away, so the class is still charged.'
                  : cancel.data === 'refunded' ? 'The place is free for someone else, and you have not been charged.'
                  : 'This booking is cancelled. The school has been told.'} />
            ) : (
              <Notice word={b.status === 'held' ? 'Held' : 'Booked'} tone={b.status === 'held' ? 'caution' : 'positive'}
                title={`${b.dancer} · ${b.class_name}`} detail={`${b.kind === 'trial' ? 'Trial class' : 'Drop-in class'} · reference ${b.reference}`} />
            )}

            <dl className="divide-y divide-line border-y border-line text-[0.9062rem]">
              {([
                ['Reference', <span key="r" className="tnum font-semibold">{b.reference}</span>],
                ['When', `${dateLong(b.starts_at)}, ${time(b.starts_at)}${b.ends_at ? `–${time(b.ends_at)}` : ''}`],
                ['Where', [b.location, b.address].filter(Boolean).join(', ') || null],
                ['Price', b.price_minor ? money(b.price_minor) : b.kind === 'trial' ? 'Free trial' : null],
                ['Questions', contact.length ? <span key="c">{b.contact_phone && <a className="font-medium text-accent-text underline" href={`tel:${b.contact_phone.replace(/\s/g, '')}`}>{b.contact_phone}</a>}
                  {b.contact_phone && b.contact_email ? ' or ' : ''}
                  {b.contact_email && <a className="font-medium text-accent-text underline" href={`mailto:${b.contact_email}`}>{b.contact_email}</a>}</span> : null],
              ] as [string, React.ReactNode][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="grid gap-x-4 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                  <dt className="font-semibold text-ink">{k}</dt><dd className="text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>

            {b.status !== 'cancelled' && !cancel.isSuccess && (
              <div className="space-y-4">
                <Button onClick={() => addBookingToCalendar({ ...b, location: [b.location, b.address].filter(Boolean).join(', ') }, b.studio_name)}>
                  <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                </Button>
                {b.can_cancel && (
                  <section aria-labelledby="cancel-h" className="border-t-2 border-ink pt-4">
                    <h2 id="cancel-h" className="section-title">Can’t come?</h2>
                    <p className="mt-1 text-[0.875rem] text-ink-2">
                      {b.kind === 'trial' ? 'You can cancel until the class starts. The place goes to someone else.'
                        : charged ? 'The class is less than 24 hours away: cancelling frees the place, but it is still charged.'
                        : `Cancel before ${dateShort(b.free_until)}, ${time(b.free_until!)} and you are not charged.`}
                    </p>
                    {cancel.error != null && <div className="mt-2"><ErrorState error={cancel.error} /></div>}
                    {!sure ? (
                      <Button className="mt-3" onClick={() => setSure(true)}>Cancel this booking</Button>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="danger" loading={cancel.isPending} onClick={() => cancel.mutate()}>Yes, cancel it</Button>
                        <Button variant="ghost" onClick={() => setSure(false)}>Keep it</Button>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
            <PoweredBy />
          </>
        )}
      </div>
    </main>
  );
}
