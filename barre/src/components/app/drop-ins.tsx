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
export function DropIns({ children }: { children: { id: string; first_name: string }[] }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const sessions = useRows<F.DropInSession>(['drop-in-sessions'], F.DROP_IN_SESSIONS);
  const mine = useRows<F.MyDropIn>(['my-drop-ins'], F.MY_DROP_INS);
  const packs = useRows<F.Pack>(['packs'], F.PACKS);
  const myPacks = useRows<F.MyPack>(['my-packs'], F.MY_PACKS);
  const [who, setWho] = React.useState('');
  const kid = who || children[0]?.id || '';
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
        <span className="text-[13px] text-ink-3">Pay as you go, or buy a pack</span>
      </div>
      <div className="space-y-4 pt-3">
        {done && <p role="status" className="text-[14px]"><span className="font-semibold text-positive">Done.</span> {done}</p>}
        {act.error != null && <ErrorState error={act.error} />}
        {children.length > 1 && (
          <Select aria-label="Who is dancing" className="h-11 sm:max-w-xs" value={kid} onChange={e => setWho(e.target.value)}>
            {children.map(c => <option key={c.id} value={c.id}>{c.first_name}</option>)}
          </Select>
        )}
        {!!myPacks.data?.length && (
          <ul className="space-y-1 text-[14.5px]">{myPacks.data.map(p => (
            <li key={p.id}><span className="font-semibold">{p.first_name}: {p.remaining} class{p.remaining === 1 ? '' : 'es'} left</span>
              <span className="text-ink-3"> on {p.name} · until {dateShort(p.expires_on)}</span></li>))}</ul>
        )}
        {!!mine.data?.length && (
          <ul className="divide-y divide-line border-y border-line text-[14.5px]">
            {mine.data.map(b => (
              <li key={b.id} className="flex items-center gap-2 py-2.5">
                <span className="min-w-0 flex-1"><span className="font-semibold">{b.first_name} · {b.class_name}</span>
                  <span className="block text-[13px] text-ink-3">{dateLong(b.starts_at)} {time(b.starts_at)} · {b.paid_with === 'pack' ? 'from pack' : 'on account'}</span></span>
                <Button size="sm" variant="ghost" onClick={() => act.mutate({ sql: F.CANCEL_DROP_IN, params: [b.id],
                  ok: r => r.r === 'refunded' ? 'Cancelled, and you have not been charged.' : 'Cancelled. It was less than 24 hours away, so it is still charged.' })}>Cancel</Button>
              </li>
            ))}
          </ul>
        )}
        <ul className="divide-y divide-line text-sm">
          {sessions.data?.slice(0, 8).map(s => (
            <li key={s.session_id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1"><span className="font-semibold">{s.class_name}</span><span className="block text-[13px] text-ink-3">{dateLong(s.starts_at)} · {time(s.starts_at)} · {s.places_left} place{s.places_left === 1 ? '' : 's'} left</span></span>
              <span className="tnum text-[14px] font-semibold">{money(s.price_minor)}</span>
              <Button size="sm" disabled={!kid} loading={act.isPending && act.variables?.params[0] === s.session_id}
                onClick={() => act.mutate({ sql: F.BOOK_DROP_IN, params: [s.session_id, kid],
                  ok: r => `${name} is booked in. ${r.r.paid_with === 'pack' ? `${r.r.pack_left} left on the pack.` : 'Added to your account.'}` })}>Book</Button>
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
        <p className="text-[13px] text-ink-3">Cancel more than 24 hours ahead and you are not charged.</p>
      </div>
    </section>
  );
}
