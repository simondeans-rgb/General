'use client';

/**
 * Reporting an absence in advance (UR-07), for a parent and for a student of
 * 13 or over (UR-49). It reaches the session itself: the register is
 * pre-marked "Excused · reported by parent", the teacher sees it on Today,
 * and the office gets a copy in its inbox. It can be withdrawn until the
 * class starts. Make-up offers (UR-56) are listed with MakeUpOffers.
 */
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Notice, Skeleton, StatusLine } from '@/components/ui';
import { dateLong, money, time } from '@/lib/format';
import { cn } from '@/lib/cn';

type Option = { session_id: string; class_name: string; starts_at: string; ends_at: string; report_id: string | null; note: string | null; withdrawable: boolean;
                credit_minor: number | null };

export const ABSENCE_OPTIONS = `select * from app.absence_options($1, 42)`;
export const REPORT_ABSENCE = `select app.report_absence($1, $2::uuid[], $3) as n`;
export const WITHDRAW_ABSENCE = `select app.withdraw_absence($1)`;
/** Credit the school's policy gave for these reports (UR-56). */
export const ABSENCE_CREDIT_FOR = `
select coalesce(sum(amount_minor), 0)::int as credit_minor from absence_credit
 where student_id = $1 and session_id = any($2::uuid[]) and status = 'active'`;

export function AbsenceForm({ studentId, firstName, self = false, onDone }: {
  studentId: string; firstName: string; self?: boolean; onDone: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const options = useRows<Option>(['absence-options', studentId], ABSENCE_OPTIONS, [studentId]);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [note, setNote] = React.useState('');
  const [done, setDone] = React.useState<{ n: number; credit: number } | null>(null);

  const send = useMutation({
    mutationFn: async () => runAs(session, async q => {
      const r = await q<{ n: number }>(REPORT_ABSENCE, [studentId, [...picked], note.trim() || null]);
      const c = await q<{ credit_minor: number }>(ABSENCE_CREDIT_FOR, [studentId, [...picked]]);
      return { n: r[0]?.n ?? picked.size, credit: Number(c[0]?.credit_minor ?? 0) };
    }),
    onSuccess: r => { setDone(r); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const withdraw = useMutation({
    mutationFn: async (id: string) => runAs(session, q => q(WITHDRAW_ABSENCE, [id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  if (done != null) {
    return (
      <div className="py-2">
        <StatusLine
          title={self ? 'Your teacher will see this on the register.' : `${firstName}’s teacher will see this on the register.`}
          detail={`${done.n === 1 ? 'The class is' : `${done.n} classes are`} marked “reported absent”. ${self ? 'Your family and the office have' : 'The office has'} a copy too. You can withdraw it here until the class starts.`} />
        {done.credit > 0 && (
          <p className="mt-3 text-[0.9062rem]"><span className="font-semibold">{money(done.credit)} credit added</span> to {self ? 'your family’s' : 'your'} account.
            It comes off the next invoice. Withdrawing the report takes it back.</p>
        )}
        <Button className="mt-4 w-full" variant="primary" onClick={onDone}>Close</Button>
      </div>
    );
  }

  // Only days with classes are offered, grouped by day; a range is several ticks.
  const list = options.data ?? [];
  const days = new Map<string, Option[]>();
  for (const o of list) { const k = dateLong(o.starts_at); days.set(k, [...(days.get(k) ?? []), o]); }
  const toggle = (id: string) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-4">
      {options.isLoading && <Skeleton className="h-32" />}
      {options.error != null && <ErrorState error={options.error} />}
      {options.data && list.length === 0 && (
        <p className="text-[0.9062rem] text-ink-2">{self ? 'You have' : `${firstName} has`} no classes in the next six weeks. For anything else, send the studio a message.</p>
      )}
      {list.length > 0 && (
        <fieldset>
          <legend className="text-[0.875rem] font-semibold">Which classes{self ? ' can’t you make' : ` will ${firstName} miss`}?</legend>
          <p className="text-[0.8125rem] text-ink-3">Tick each class. For several days in a row, tick each one.</p>
          <ul className="mt-2 max-h-[40dvh] divide-y divide-line overflow-y-auto border-y border-line">
            {[...days.entries()].map(([day, items]) => (
              <li key={day} className="py-2">
                <p className="text-[0.8125rem] font-semibold text-ink-3">{day}</p>
                {items.map(o => o.report_id ? (
                  <div key={o.session_id} className="flex min-h-11 items-center gap-3">
                    <span className="min-w-0 flex-1 text-[0.9062rem]">
                      <span className="tnum">{time(o.starts_at)}</span> {o.class_name}
                      <span className="block text-[0.8125rem] text-ink-3">Reported absent{o.note ? ` — ${o.note}` : ''}
                        {o.credit_minor ? ` · ${money(o.credit_minor)} credit added` : ''}</span>
                    </span>
                    {o.withdrawable && (
                      <Button size="sm" variant="ghost" loading={withdraw.isPending && withdraw.variables === o.report_id}
                        onClick={() => withdraw.mutate(o.report_id!)}>Withdraw</Button>
                    )}
                  </div>
                ) : (
                  <label key={o.session_id} className="flex min-h-11 items-center gap-3 text-[0.9062rem]">
                    <input type="checkbox" checked={picked.has(o.session_id)} onChange={() => toggle(o.session_id)}
                      className="size-[18px] shrink-0 accent-[var(--color-accent)]" />
                    <span className={cn('min-w-0 flex-1')}><span className="tnum">{time(o.starts_at)}</span> {o.class_name}</span>
                  </label>
                ))}
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      {list.length > 0 && (
        <Field label="Anything the teacher should know" htmlFor="absence-reason" hint="Optional. The teacher and the office see this.">
          <Input id="absence-reason" value={note} onChange={e => setNote(e.target.value)}
                 placeholder="School trip, unwell, family holiday…" />
        </Field>
      )}
      {send.isError && <ErrorState error={send.error} />}
      {withdraw.isError && <ErrorState error={withdraw.error} />}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onDone}>Cancel</Button>
        <Button className="flex-1" variant="primary" loading={send.isPending} disabled={picked.size === 0}
                onClick={() => send.mutate()}>Send</Button>
      </div>
    </div>
  );
}

/** A plain dialog around the form, for the family and student screens. */
export function AbsenceDialog({ studentId, firstName, self, onClose }: { studentId: string; firstName: string; self?: boolean; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="absence-title"
           onClick={e => e.stopPropagation()}
           className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <h2 id="absence-title" className="text-[1.0625rem] font-semibold tracking-tight">{self ? 'I can’t make it' : 'Report an absence'}</h2>
        {!self && <p className="mb-3 mt-0.5 text-sm text-ink-2">For {firstName}</p>}
        {self && <p className="mb-3 mt-0.5 text-sm text-ink-2">Your teacher, your family and the office are told.</p>}
        <AbsenceForm studentId={studentId} firstName={firstName} self={self} onDone={onClose} />
      </div>
    </div>
  );
}

type Offer = { id: string; student_id: string; first_name: string; reason: string; from_label: string; expires_on: string };
const OPEN_OFFERS = `
select o.id, o.student_id, s.first_name, o.reason, o.expires_on,
       c.name || ', ' || to_char(cs.starts_at at time zone 'Europe/London', 'FMDy FMDD Mon') as from_label
  from makeup_offer o join student s on s.id = o.student_id
  join class_session cs on cs.id = o.from_session_id join class c on c.id = cs.class_id
 where o.status = 'open' and o.expires_on >= current_date
 order by o.created_at`;
type Slot = { session_id: string; class_name: string; starts_at: string; location: string | null; spaces: number };

/** Make-up classes on offer after a cancellation or a reported absence (UR-56). */
export function MakeUpOffers() {
  const offers = useRows<Offer>(['makeup-offers'], OPEN_OFFERS);
  if (!offers.data?.length) return null;
  return (
    <section aria-labelledby="makeup-h" className="space-y-3">
      <div className="border-b-2 border-ink pb-2"><h2 id="makeup-h" className="section-title">Make-up classes</h2></div>
      <ul className="divide-y divide-line">{offers.data.map(o => <li key={o.id}><OfferRow o={o} /></li>)}</ul>
    </section>
  );
}

function OfferRow({ o }: { o: Offer }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const slots = useRows<Slot>(['makeup-options', o.id], `select * from app.makeup_options($1)`, [o.id], { enabled: open });
  const book = useMutation({
    mutationFn: async (sid: string) => runAs(session, q => q(`select app.book_makeup($1, $2)`, [o.id, sid])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const decline = useMutation({
    mutationFn: async () => runAs(session, q => q(`select app.decline_makeup($1)`, [o.id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  return (
    <div className="py-3">
      <p className="font-semibold">{o.first_name}: instead of {o.from_label}</p>
      <p className="text-[0.8125rem] text-ink-3">{o.reason === 'cancelled' ? 'The studio cancelled it.' : 'Reported absent.'} Choose a class with space by {dateLong(o.expires_on)}.</p>
      {!open ? (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="primary" onClick={() => setOpen(true)}>See classes</Button>
          <Button size="sm" variant="ghost" loading={decline.isPending} onClick={() => decline.mutate()}>No thanks</Button>
        </div>
      ) : (
        <div className="mt-2">
          {slots.isLoading && <Skeleton className="h-16" />}
          {slots.data?.length === 0 && <p className="text-[0.875rem] text-ink-2">No suitable class has space before then. The office can help — send them a message.</p>}
          <ul className="divide-y divide-line">
            {slots.data?.map(sl => (
              <li key={sl.session_id} className="flex min-h-12 items-center gap-3 py-2">
                <span className="min-w-0 flex-1 text-[0.9062rem]">
                  <span className="block font-semibold">{sl.class_name}</span>
                  <span className="block text-[0.8125rem] text-ink-3">{dateLong(sl.starts_at)} · {time(sl.starts_at)}{sl.location ? ` · ${sl.location}` : ''} · {sl.spaces} space{sl.spaces === 1 ? '' : 's'}</span>
                </span>
                <Button size="sm" loading={book.isPending && book.variables === sl.session_id} onClick={() => book.mutate(sl.session_id)}>Book</Button>
              </li>
            ))}
          </ul>
          {book.isError && <ErrorState error={book.error} />}
        </div>
      )}
    </div>
  );
}
