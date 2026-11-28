'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import { Button, ErrorState, Select } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as F from '@/lib/repos/family';
import { dateLong, money, time, dateShort } from '@/lib/format';

/**
 * Pay-as-you-go classes for a family (R-034): book a date, buy a pack, cancel
 * in good time. Shows nothing if the school runs no drop-in classes.
 */
export function DropIns({ children }: { children: { id: string; first_name: string; date_of_birth?: string; is_me?: boolean }[] }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const sessions = useRows<F.DropInSession>(['drop-in-sessions'], F.DROP_IN_SESSIONS);
  const mine = useRows<F.MyDropIn>(['my-drop-ins'], F.MY_DROP_INS);
  const packs = useRows<F.Pack>(['packs'], F.PACKS);
  const myPacks = useRows<F.MyPack>(['my-packs'], F.MY_PACKS);
  const [who, setWho] = React.useState('');
  // An adult booking for themselves starts on their own name (UR-21).
  const kid = who || children.find(c => c.is_me)?.id || children[0]?.id || '';
  const dob = children.find(c => c.id === kid)?.date_of_birth;
  const [done, setDone] = React.useState<string | null>(null);
  const act = useMutation({
    mutationFn: async (v: { sql: string; params: unknown[]; ok: (r: any) => string }) => v.ok((await runAs(session, q => q(v.sql, v.params)))[0]),
    onSuccess: m => { setDone(m); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (!sessions.data?.length && !mine.data?.length) return null;
  const name = children.find(c => c.id === kid)?.first_name ?? '';
  return (
    <section aria-labelledby="dropins-h">
      <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
        <h2 id="dropins-h" className="section-title min-w-0 flex-1">Drop-in classes</h2>
        <span className="text-[0.8125rem] text-ink-3">Pay as you go, or buy a pack</span>
      </div>
      <div className="space-y-4 pt-3">
        {done && <p role="status" className="text-[0.875rem]"><span className="font-semibold text-positive">Done.</span> {done}</p>}
        {act.error != null && <ErrorState error={act.error} />}
        {children.length > 1 && (
          <Select aria-label="Who is dancing" className="h-11 sm:max-w-xs" value={kid} onChange={e => setWho(e.target.value)}>
            {children.map(c => <option key={c.id} value={c.id}>{c.first_name}</option>)}
          </Select>
        )}
        {!!myPacks.data?.length && (
          <ul className="space-y-1 text-[0.9062rem]">{myPacks.data.map(p => (
            <li key={p.id}><span className="font-semibold">{p.first_name}: {p.remaining} class{p.remaining === 1 ? '' : 'es'} left</span>
              <span className="text-ink-3"> on {p.name} · until {dateShort(p.expires_on)}</span></li>))}</ul>
        )}
        {!!mine.data?.length && (
          <p className="text-[0.875rem] text-ink-2">
            {mine.data.length} drop-in{mine.data.length === 1 ? '' : 's'} booked. Each one is under the dancer’s name above, with its reference, calendar and Cancel.
          </p>
        )}
        <ul className="divide-y divide-line text-sm">
          {sessions.data?.slice(0, 8).map(s => (
            <li key={s.session_id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1"><span className="font-semibold">{s.class_name}</span><span className="block text-[0.8125rem] text-ink-3">{dateLong(s.starts_at)} · {time(s.starts_at)} · {s.places_left} place{s.places_left === 1 ? '' : 's'} left</span></span>
              <span className="tnum text-[0.875rem] font-semibold">{money(s.price_minor)}</span>
              {!fits(dob, s) ? <span className="max-w-[9rem] text-right text-[0.7812rem] font-semibold text-ink-2">Not for {name}’s age</span> :
              <Button size="sm" disabled={!kid} loading={act.isPending && act.variables?.params[0] === s.session_id}
                onClick={() => act.mutate({ sql: F.BOOK_DROP_IN, params: [s.session_id, kid],
                  ok: r => `${name} is booked in. ${r.r.paid_with === 'pack' ? `${r.r.pack_left} left on the pack.` : 'Added to your account.'}` })}>Book</Button>}
            </li>
          ))}
        </ul>
        {!!packs.data?.length && (
          <div className="flex flex-wrap gap-2">
            {packs.data.map(p => (
              <Button key={p.id} size="sm" disabled={!kid}
                onClick={() => act.mutate({ sql: F.BUY_PACK, params: [p.id, kid], ok: () => `${p.name} bought for ${name}: ${p.classes} classes, ${money(p.price_minor)} on your account.` })}>
                <Ticket className="size-4" aria-hidden /> {p.name} · {money(p.price_minor)}
              </Button>
            ))}
          </div>
        )}
        <p className="text-[0.8125rem] text-ink-3">Cancel more than 24 hours ahead and you are not charged.</p>
      </div>
    </section>
  );
}

/** Whether a dancer of this date of birth is within a session's age range on
 *  its day. The database refuses the booking either way (UR-06). */
function fits(dob: string | undefined, s: { starts_at: string; age_min: number | null; age_max: number | null }) {
  if (!dob || (s.age_min == null && s.age_max == null)) return true;
  const on = new Date(s.starts_at), b = new Date(dob);
  let age = on.getFullYear() - b.getFullYear();
  if (on.getMonth() < b.getMonth() || (on.getMonth() === b.getMonth() && on.getDate() < b.getDate())) age--;
  return (s.age_min == null || age >= s.age_min) && (s.age_max == null || age <= s.age_max);
}
