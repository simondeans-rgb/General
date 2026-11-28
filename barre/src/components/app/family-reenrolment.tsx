'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, SectionHead, Word } from '@/components/ui';
import * as S from '@/lib/repos/seasons';
import { dateLong, money } from '@/lib/format';

const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const PER: Record<string, string> = { term: 'a term', monthly: 'a month', one_off: 'for the course' };

/**
 * "Next term's classes" on the family home (round 2 F3): each child's
 * proposed class, to confirm or opt out of by the school's date. Shown only
 * while the school has re-enrolment open, and for a month after it publishes.
 */
export function FamilyReenrolment() {
  const rows = useRows<S.FamilyOffer>(['family-reenrolment'], S.FAMILY_REENROLMENT);
  const { session } = useSession();
  const qc = useQueryClient();
  const answer = useMutation({
    mutationFn: async (v: { id: string; yes: boolean }) => (await runAs(session, q => q(S.ANSWER_REENROLMENT, [v.id, v.yes])))[0],
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [changing, setChanging] = React.useState<string | null>(null);
  const [all, setAll] = React.useState(false);
  const list = rows.data ?? [];
  if (!list.length) return null;
  const first = list[0]!;
  const open = first.round_status === 'open';
  const late = open && new Date(first.respond_by) < new Date(new Date().toDateString());
  const waiting = list.filter(o => o.status === 'proposed' && o.class_id).length;
  return (
    <section aria-labelledby="reenrol-h">
      <SectionHead id="reenrol-h" title={`${first.term_name} classes`}
        meta={open ? (late ? 'The reply date has passed' : `Please reply by ${dateLong(first.respond_by)}`) : first.round_status === 'published' ? 'Booked' : 'Replies closed'} />
      {open && waiting > 0 && !late && (
        <p className="py-2 text-[0.875rem] text-ink-2">
          Here is the class we suggest for {waiting === 1 ? 'the next term' : 'each of your children next term'}. Confirm to keep the place; places not confirmed by {dateLong(first.respond_by)} are offered to other families.
        </p>
      )}
      {open && !late && waiting > 1 && (
        <Button variant="primary" className="mb-2" loading={all}
          onClick={async () => {
            setAll(true);
            try { for (const o of list.filter(x => x.status === 'proposed' && x.class_id)) await answer.mutateAsync({ id: o.offer_id, yes: true }); }
            finally { setAll(false); }
          }}>Confirm all {waiting} places</Button>
      )}
      {answer.error != null && <ErrorState error={answer.error} />}
      <ul className="divide-y divide-line">
        {list.map(o => {
          const settled = o.status === 'placed' || o.status === 'waitlisted' || o.status === 'released';
          const canAnswer = open && !late && !settled;
          const showButtons = canAnswer && (o.status === 'proposed' || changing === o.offer_id);
          return (
            <li key={o.offer_id} className="py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{o.child} · {o.class_name ?? 'The office will be in touch'}</span>
                  <span className="block text-[0.8438rem] text-ink-3">
                    {[o.class_name && o.day_of_week != null && `${DAYS[o.day_of_week]} ${o.start_time?.slice(0, 5)}`, o.location,
                      o.price_minor ? `${money(o.price_minor)} ${PER[o.pricing ?? ''] ?? ''}`.trim() : null,
                      o.from_class && (o.reason === 'moves_up' ? `moving up from ${o.from_class}` : o.reason === 'stays' ? 'same class' : `now in ${o.from_class}`)]
                      .filter(Boolean).join(' · ')}
                  </span>
                  {!!o.uniform?.length && <span className="block text-[0.8125rem] text-ink-3">Uniform: {o.uniform.join(', ')}</span>}
                </span>
                {!showButtons && <Word size="md" tone={o.status === 'confirmed' || o.status === 'placed' ? 'positive' : o.status === 'waitlisted' ? 'caution' : 'muted'}>
                  {{ proposed: 'Not answered', confirmed: 'Confirmed', declined: 'Not returning', released: 'Released', placed: 'Booked', waitlisted: 'Waiting list' }[o.status] ?? o.status}
                </Word>}
              </div>
              {showButtons && o.class_id && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button loading={answer.isPending && answer.variables?.id === o.offer_id}
                    onClick={() => answer.mutate({ id: o.offer_id, yes: true }, { onSuccess: () => setChanging(null) })}>Confirm {o.child}’s place</Button>
                  <Button variant="ghost" onClick={() => answer.mutate({ id: o.offer_id, yes: false }, { onSuccess: () => setChanging(null) })}>Not next term</Button>
                </div>
              )}
              {canAnswer && !showButtons && (o.status === 'confirmed' || o.status === 'declined') && (
                <button className="mt-1 min-h-[44px] text-[0.8438rem] font-semibold text-accent-text hover:underline" onClick={() => setChanging(o.offer_id)}>Change answer</button>
              )}
              {o.status === 'waitlisted' && <p className="mt-1 text-[0.8438rem] text-ink-2">The class is full, so {o.child} is on its waiting list. We will offer a place as soon as one is free.</p>}
            </li>
          );
        })}
      </ul>
      {late && <p className="text-[0.8438rem] text-ink-2">To change anything now, send the studio a message.</p>}
    </section>
  );
}
