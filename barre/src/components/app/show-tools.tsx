'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, HeartPulse, Printer, Shirt, Ticket, X } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs, readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { DetailSection } from '@/components/app/detail-panel';
import { Badge, Button, ErrorState, Input, Select, type Tone } from '@/components/ui';
import * as E from '@/lib/repos/events';
import { dateLong, money, time } from '@/lib/format';
import { cn } from '@/lib/cn';

function useWrite() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { sql: string; params: unknown[] }) => (await runAs(session, q => q(v.sql, v.params)))[0],
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

const COSTUME_STATUS: [string, string, Tone][] = [['needed', 'Needed', 'caution'], ['ordered', 'Ordered', 'info'], ['arrived', 'Arrived', 'info'],
  ['given', 'With dancer', 'positive'], ['returned', 'Returned', 'neutral']];

/** Costumes per routine, each dancer's size and where the costume is (R-057). */
export function CostumeSection({ eventId, routines }: { eventId: string; routines: E.Routine[] }) {
  const rows = useRows<E.CostumeLine>(['costumes', eventId], E.COSTUME_LIST, [eventId]);
  const write = useWrite();
  const [f, setF] = React.useState({ name: '', routine: '', price: '' });
  const items = React.useMemo(() => {
    const m = new Map<string, { name: string; routine: string | null; lines: E.CostumeLine[] }>();
    for (const r of rows.data ?? []) m.set(r.item_id, { name: r.item, routine: r.routine, lines: [...(m.get(r.item_id)?.lines ?? []), r] });
    return [...m.entries()];
  }, [rows.data]);
  return (
    <DetailSection title="Costumes">
      {write.error != null && <ErrorState error={write.error} />}
      {items.map(([id, it]) => {
        const sized = it.lines.filter(l => l.size).length;
        return (
          <details key={id} className="mb-2 rounded-[var(--radius-md)] border border-line">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
              <Shirt className="size-4 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1"><b>{it.name}</b>{it.routine ? ` · ${it.routine}` : ''}</span>
              <span className="text-[12px] text-ink-3">{sized}/{it.lines.length} sizes</span>
            </summary>
            <ul className="divide-y divide-line border-t border-line text-[13px]">
              {it.lines.map(l => (
                <li key={l.student_id} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="min-w-0 flex-1 truncate">{l.dancer}</span>
                  <span className={cn('w-20 shrink-0', !l.size && 'text-ink-3')}>{l.size ?? 'No size'}</span>
                  <Select aria-label={`${it.name} for ${l.dancer}`} className="h-8 w-32 text-[12.5px]" value={l.status}
                    onChange={e => write.mutate({ sql: E.SET_COSTUME_STATUS, params: [id, l.student_id, e.target.value] })}>
                    {COSTUME_STATUS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      <p className="text-[12.5px] text-ink-3">Families give sizes from their app. Status here is for the office.</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Input aria-label="Costume item" placeholder="Item, e.g. Red waistcoat" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <Select aria-label="For routine" value={f.routine} onChange={e => setF({ ...f, routine: e.target.value })}>
          <option value="">Everyone in the show</option>
          {routines.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </Select>
      </div>
      <Button size="sm" className="mt-1.5" disabled={!f.name.trim()}
        onClick={() => { write.mutate({ sql: E.ADD_COSTUME, params: [eventId, f.routine || null, f.name, Math.round(Number(f.price || 0) * 100)] }); setF({ name: '', routine: '', price: '' }); }}>
        Add costume item
      </Button>
    </DetailSection>
  );
}

const MARKS: [string, string][] = [['present', 'Here'], ['late', 'Late'], ['absent', 'Absent']];

/** A rehearsal register, like a class register, with medical markers (R-057). */
export function RehearsalRegisterButton({ rehearsal }: { rehearsal: E.Rehearsal }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} aria-label={`Register for ${rehearsal.title}`}>
        <ClipboardCheck className="size-4" aria-hidden /> Register
      </Button>
      {open && createPortal(<RehearsalRegister rehearsal={rehearsal} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function RehearsalRegister({ rehearsal, onClose }: { rehearsal: E.Rehearsal; onClose: () => void }) {
  const rows = useRows<E.RehearsalRow>(['rehearsal-register', rehearsal.id], E.REHEARSAL_REGISTER, [rehearsal.id]);
  const write = useWrite();
  const marked = rows.data?.filter(r => r.status).length ?? 0;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="rr-t" onClick={e => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 id="rr-t" className="text-lg font-semibold">{rehearsal.title}</h2>
            <p className="text-[13px] text-ink-2">{dateLong(rehearsal.starts_at)}, {time(rehearsal.starts_at)} · {marked}/{rows.data?.length ?? 0} marked</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X className="size-4" aria-hidden /></button>
        </div>
        {write.error != null && <ErrorState error={write.error} />}
        {rows.error && <ErrorState error={rows.error} />}
        {rows.data?.length === 0 && <p className="text-sm text-ink-2">No confirmed dancers yet.</p>}
        <ul className="divide-y divide-line">
          {rows.data?.map(r => (
            <li key={r.student_id} className="flex items-center gap-2 py-2">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-medium">{r.first_name} {r.last_name}
                  {r.has_medical && <HeartPulse className={cn('size-3.5', r.requires_alert ? 'text-critical' : 'text-caution')}
                    aria-label={r.requires_alert ? 'Medical alert' : 'Medical information'} />}</span>
                {r.routines && <span className="block truncate text-[12px] text-ink-3">{r.routines}</span>}
              </span>
              <div role="group" aria-label={`Mark ${r.first_name}`} className="flex gap-1">
                {MARKS.map(([k, v]) => (
                  <button key={k} aria-pressed={r.status === k} onClick={() => write.mutate({ sql: E.MARK_REHEARSAL, params: [rehearsal.id, r.student_id, k] })}
                    className={cn('h-9 rounded-full border px-2.5 text-[12.5px]', r.status === k
                      ? k === 'absent' ? 'border-critical bg-critical-soft text-critical' : 'border-accent bg-accent text-on-accent' : 'border-line')}>{v}</button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A printable programme. Children without photography consent are counted, not named. */
export function ProgrammeButton({ event }: { event: { id: string; title: string; starts_at: string; venue: string | null } }) {
  const { session } = useSession();
  const print = async () => {
    const rows = await readAs<E.ProgrammeRow>(session, E.PROGRAMME, [event.id]);
    const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(event.title)} — programme</title>
<style>body{font:15px/1.5 Georgia,serif;max-width:640px;margin:40px auto;padding:0 16px;color:#14211e}h1{font-weight:400;font-size:32px;margin:0}
.sub{color:#5b645e;margin-bottom:28px}ol{padding:0;list-style:none}li{border-top:1px solid #e4dbcc;padding:12px 0}
.n{display:inline-block;width:2em;color:#5b645e}.d{color:#4e5a55;font-size:14px;margin-left:2em}</style>
<h1>${esc(event.title)}</h1><p class="sub">${esc(dateLong(event.starts_at))} · ${esc(time(event.starts_at))}${event.venue ? ' · ' + esc(event.venue) : ''}</p>
<ol>${rows.map((r, i) => `<li><span class="n">${i + 1}.</span><b>${esc(r.routine)}</b>${r.class_name ? ' — ' + esc(r.class_name) : ''}
<div class="d">${[r.dancers ? esc(r.dancers) : '', r.unnamed ? `${r.dancers ? 'and ' : ''}${r.unnamed} dancer${r.unnamed === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ')}</div></li>`).join('')}</ol>
<script>window.print()</script>`);
    w.document.close();
  };
  return <Button size="sm" variant="ghost" onClick={print}><Printer className="size-4" aria-hidden /> Print programme</Button>;
}

/** Audience tickets: types, prices, how many are left (R-057). */
export function TicketSection({ eventId }: { eventId: string }) {
  const rows = useRows<E.TicketType>(['ticket-types', eventId], E.TICKET_TYPES, [eventId]);
  const write = useWrite();
  const [f, setF] = React.useState({ name: 'Adult', price: '', cap: '', max: '6' });
  return (
    <DetailSection title="Tickets">
      {write.error != null && <ErrorState error={write.error} />}
      <ul className="space-y-1 text-sm">
        {rows.data?.map(t => (
          <li key={t.id} className="flex items-center gap-2">
            <Ticket className="size-4 text-ink-3" aria-hidden />
            <span className="min-w-0 flex-1">{t.name} · {money(t.price_minor)}</span>
            <span className="tnum text-[12.5px] text-ink-2">{t.sold} sold{t.left != null ? ` · ${t.left} left` : ''}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <Input aria-label="Ticket name" className="col-span-2" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <Input aria-label="Price in pounds" type="number" min={0} step={0.5} placeholder="£" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
        <Input aria-label="Seats" type="number" min={1} placeholder="Seats" value={f.cap} onChange={e => setF({ ...f, cap: e.target.value })} />
      </div>
      <Button size="sm" className="mt-1.5" disabled={!f.name.trim() || f.price === ''}
        onClick={() => { write.mutate({ sql: E.ADD_TICKET_TYPE, params: [eventId, f.name, Math.round(Number(f.price) * 100), f.cap ? Number(f.cap) : null, Number(f.max) || 6] }); setF({ name: 'Child', price: '', cap: '', max: '6' }); }}>
        Add ticket type
      </Button>
      <p className="mt-1 text-[12.5px] text-ink-3">Families book from their Events page; tickets go on their account until card payment is switched on.</p>
    </DetailSection>
  );
}

/** Ticket booking for a family, shown under a show they can see. */
export function BuyTickets({ eventId }: { eventId: string }) {
  const rows = useRows<E.TicketType>(['ticket-types', eventId], E.TICKET_TYPES, [eventId]);
  const mine = useRows<{ id: string; event_id: string; name: string; quantity: number }>(['my-tickets'], E.MY_TICKETS);
  const write = useWrite();
  const [n, setN] = React.useState<Record<string, number>>({});
  if (!rows.data?.length) return null;
  const have = (mine.data ?? []).filter(t => t.event_id === eventId);
  return (
    <div className="mt-3 space-y-2 rounded-[var(--radius-md)] bg-surface-2 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium"><Ticket className="size-4" aria-hidden /> Tickets for family and friends</p>
      {have.length > 0 && <p className="text-[13px] text-positive">You have {have.map(t => `${t.quantity} × ${t.name}`).join(', ')}.</p>}
      {rows.data.map(t => (
        <div key={t.id} className="flex items-center gap-2 text-sm">
          <span className="min-w-0 flex-1">{t.name} · {money(t.price_minor)}{t.left != null && t.left < 20 ? <Badge tone="caution">{t.left} left</Badge> : null}</span>
          <Input aria-label={`How many ${t.name} tickets`} type="number" min={1} max={t.per_family_max} className="h-9 w-16"
            value={n[t.id] ?? 1} onChange={e => setN({ ...n, [t.id]: Number(e.target.value) })} />
          <Button size="sm" disabled={t.left === 0} loading={write.isPending}
            onClick={() => write.mutate({ sql: E.BOOK_TICKETS, params: [t.id, n[t.id] ?? 1] })}>Book</Button>
        </div>
      ))}
      {write.error != null && <ErrorState error={write.error} />}
      <p className="text-[12px] text-ink-3">Added to your account to pay with your next invoice.</p>
    </div>
  );
}

/** A family gives their child's costume size (R-057). */
export function MyCostumes({ eventId }: { eventId: string }) {
  const rows = useRows<E.MyCostume>(['my-costumes', eventId], E.MY_COSTUMES, [eventId]);
  const write = useWrite();
  if (!rows.data?.length) return null;
  return (
    <div className="space-y-1.5 border-t border-line px-4 py-3 text-[13px]">
      <p className="flex items-center gap-1.5 font-medium"><Shirt className="size-4" aria-hidden /> Costume sizes</p>
      {rows.data.map(c => (
        <div key={c.id + c.student_id} className="flex items-center gap-2">
          <span className="min-w-0 flex-1">{c.first_name} · {c.name}
            {c.status && c.status !== 'needed' && <span className="text-ink-3"> · {COSTUME_STATUS.find(s => s[0] === c.status)?.[1]}</span>}</span>
          <Select aria-label={`${c.name} size for ${c.first_name}`} className="h-9 w-32 text-[13px]" value={c.size ?? ''}
            onChange={e => write.mutate({ sql: E.SET_COSTUME_SIZE, params: [c.id, c.student_id, e.target.value || null] })}>
            <option value="">Choose size…</option>
            {c.sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      ))}
      {write.error != null && <ErrorState error={write.error} />}
    </div>
  );
}
