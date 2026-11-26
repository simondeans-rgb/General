'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardHeader, ErrorState, Input } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { money } from '@/lib/format';

const PACKS = `select id, name, classes, price_minor, valid_days, active from class_pack order by classes`;
const ADD = `insert into class_pack (studio_id, name, classes, price_minor, valid_days)
  select m.studio_id, btrim($1), $2, $3, $4 from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`;
const TOGGLE = `update class_pack set active = $2 where id = $1 returning id`;
const CREDIT = `select id, credit_cancelled_classes, pay_before_use, account_limit_minor from studio where id in (select app.studio_ids()) limit 1`;
const SET_PAY_FIRST = `update studio set pay_before_use = $2, account_limit_minor = $3 where id = $1 returning id`;
const SET_CREDIT = `update studio set credit_cancelled_classes = $2 where id = $1 returning id`;

function useWrite() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

/** Pay-as-you-go packs, and whether families are credited when you cancel a class. */
export function PackSettings() {
  const packs = useRows<{ id: string; name: string; classes: number; price_minor: number; valid_days: number; active: boolean }>(['packs-admin'], PACKS);
  const credit = useRows<{ id: string; credit_cancelled_classes: boolean; pay_before_use: boolean; account_limit_minor: number }>(['credit-setting'], CREDIT).data?.[0];
  const [limit, setLimit] = React.useState<string | null>(null);
  const write = useWrite();
  const owner = useSession().session?.role === 'owner';
  const [f, setF] = React.useState({ name: '', classes: '5', price: '', days: '90' });
  return (
    <Card>
      <CardHeader title="Pay as you go" subtitle="Class packs for drop-in classes, and credit for classes you cancel" />
      <div className="space-y-3 px-4 pb-4">
        {write.error != null && <ErrorState error={write.error} />}
        <ul className="space-y-1 text-sm">
          {packs.data?.map(p => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">{p.name} · {p.classes} classes · {money(p.price_minor)} · {p.valid_days} days</span>
              <label className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={p.active}
                onChange={e => write.mutate({ sql: TOGGLE, params: [p.id, e.target.checked] })} /> On sale</label>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Input aria-label="Pack name" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <Input aria-label="Classes in the pack" type="number" min={1} value={f.classes} onChange={e => setF({ ...f, classes: e.target.value })} />
          <Input aria-label="Price in pounds" type="number" min={0} step={0.5} placeholder="£" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
          <Input aria-label="Valid for days" type="number" min={7} value={f.days} onChange={e => setF({ ...f, days: e.target.value })} />
        </div>
        <Button size="sm" disabled={!f.name.trim() || !f.price} onClick={() => { write.mutate({ sql: ADD, params: [f.name, Number(f.classes), Math.round(Number(f.price) * 100), Number(f.days)] }); setF({ name: '', classes: '5', price: '', days: '90' }); }}>Add pack</Button>
        {credit && owner && (
          <label className="flex items-start gap-2.5 border-t border-line pt-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]" checked={credit.credit_cancelled_classes}
              onChange={e => write.mutate({ sql: SET_CREDIT, params: [credit.id, e.target.checked] })} />
            <span>Credit families when we cancel a class
              <span className="block text-[12.5px] text-ink-3">Each child enrolled gets that class’s per-session value back on their account, once. Off: you decide case by case.</span></span>
          </label>
        )}
        {credit && owner && (
          <div className="space-y-2 border-t border-line pt-3 text-sm">
            <label className="flex items-start gap-2.5">
              <input type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]" checked={credit.pay_before_use}
                onChange={e => write.mutate({ sql: SET_PAY_FIRST, params: [credit.id, e.target.checked, credit.account_limit_minor] })} />
              <span>Pay before use
                <span className="block text-[12.5px] text-ink-3">Packs work once paid, and drop-ins need paying first — unless the family owes less than the limit below. Bookings from the public page are held for 30 minutes until paid.</span></span>
            </label>
            {credit.pay_before_use && (
              <label className="ml-6 flex items-center gap-2 text-[13px]">On-account limit £
                <Input aria-label="On-account limit in pounds" className="w-24" type="number" min={0} step={1}
                  value={limit ?? String(credit.account_limit_minor / 100)} onChange={e => setLimit(e.target.value)}
                  onBlur={() => { if (limit != null) { write.mutate({ sql: SET_PAY_FIRST, params: [credit.id, true, Math.max(0, Math.round(Number(limit) * 100))] }); setLimit(null); } }} />
                <span className="text-ink-3">0 = always pay first</span>
              </label>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
