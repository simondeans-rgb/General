'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Receipt, Trash2 } from 'lucide-react';
import { useRows, useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { DetailSection } from '@/components/app/detail-panel';
import { CostumeSection } from '@/components/app/show-tools';
import { Button, ErrorState, Field, Input, Notice, Select, Word, StatusLine } from '@/components/ui';
import * as E from '@/lib/repos/events';
import * as C from '@/lib/repos/classes';
import * as S from '@/lib/repos/seasons';
import { dateShort, money, time, toDateInput } from '@/lib/format';
import { cn } from '@/lib/cn';

/*
 * The show production pack (round 2 F7), as components that slot into the
 * event page's tabs:
 *   <RunningOrder event />   Running order tab (or Participants)
 *   <CostumePlan event />    Costumes tab
 *   <LicenceTracker event /> Participants tab, for public performances
 * Helpers and chaperones per item reuse the helper rota (0050).
 */

type EventLike = { id: string; title: string; starts_at: string; kind?: string };

function useWrite(after?: (r: any) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { sql: string; params: unknown[] }) => (await runAs(session, q => q(v.sql, v.params)))[0],
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); after?.(r); },
  });
}
const iconBtn = 'grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-30';

/** Running order: items with class, music and running time, a quick-change
 *  warning when a dancer is in two items in a row, and who looks after each. */
export function RunningOrder({ event }: { event: EventLike }) {
  const rows = useRows<S.RunningItem>(['running-order', event.id], S.RUNNING_ORDER, [event.id]);
  const classes = useRows<{ id: string; name: string }>(['class-options'], C.CLASS_OPTIONS);
  const write = useWrite();
  const [open, setOpen] = React.useState<string | null>(null);
  const [f, setF] = React.useState({ title: '', cls: '', music: '', dur: '' });
  const items = rows.data ?? [];
  const total = items.reduce((n, r) => n + (r.duration_sec ?? 0), 0);
  const clashes = items.filter(r => r.quick_change_count > 0);
  const go = (sql: string, params: unknown[]) => write.mutate({ sql, params });
  return (
    <DetailSection title="Running order">
      {rows.error != null && <ErrorState error={rows.error} />}
      {write.error != null && <div className="mb-2"><ErrorState error={write.error} /></div>}
      {items.length > 0 && (
        <p className="mb-2 text-[0.8125rem] text-ink-3">
          {items.length} item{items.length === 1 ? '' : 's'}{total ? ` · ${S.clockTime(total)} of dancing` : ''}
          {clashes.length > 0 && <> · <span className="font-semibold text-caution">{clashes.length} quick change{clashes.length === 1 ? '' : 's'}</span></>}
        </p>
      )}
      <ol className="divide-y divide-line text-[0.875rem]">
        {items.map((r, i) => (
          <li key={r.id} className="py-2">
            <div className="flex items-start gap-1.5">
              <span className="w-6 shrink-0 pt-0.5 font-display text-[0.9375rem] tnum text-ink-3">{r.item_no}</span>
              <button className="min-w-0 flex-1 text-left" aria-expanded={open === r.id} onClick={() => setOpen(o => o === r.id ? null : r.id)}>
                <b>{r.title}</b>{r.class_name ? ` · ${r.class_name}` : ''}
                <span className="block text-[0.7812rem] text-ink-2">
                  {[r.music, r.duration_sec ? S.clockTime(r.duration_sec) : null, `${r.dancers} dancer${r.dancers === 1 ? '' : 's'}`,
                    r.duration_sec != null || r.starts_after_sec ? `starts ${S.clockTime(r.starts_after_sec)} in` : null].filter(Boolean).join(' · ')}
                </span>
                {r.quick_change_count > 0 && (
                  <span className="mt-0.5 block text-[0.7812rem]"><Word tone="caution">Quick change</Word> <span className="text-ink-2">{r.quick_change_count} also in item {r.item_no - 1}: {r.quick_change}</span></span>
                )}
                {r.helpers && <span className="mt-0.5 block text-[0.7812rem] text-ink-3">{r.helpers}</span>}
              </button>
              <button aria-label={`Move ${r.title} up`} disabled={i === 0} onClick={() => go(E.MOVE_ROUTINE, [r.id, -1])} className={iconBtn}><ArrowUp className="size-4" aria-hidden /></button>
              <button aria-label={`Move ${r.title} down`} disabled={i === items.length - 1} onClick={() => go(E.MOVE_ROUTINE, [r.id, 1])} className={iconBtn}><ArrowDown className="size-4" aria-hidden /></button>
              <button aria-label={`Remove ${r.title}`} onClick={() => go(E.REMOVE_ROUTINE, [r.id])} className={cn(iconBtn, 'hover:text-critical')}><Trash2 className="size-4" aria-hidden /></button>
            </div>
            {open === r.id && <ItemDetail event={event} item={r} classes={classes.data ?? []} />}
          </li>
        ))}
      </ol>
      {items.length === 0 && !rows.isLoading && <p className="py-2 text-[0.875rem] text-ink-3">No items yet. Add each dance in the order it is performed.</p>}
      <div className="mt-2 grid gap-1.5">
        <Input aria-label="Item name" placeholder="Item name" value={f.title} onChange={x => setF({ ...f, title: x.target.value })} />
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem] gap-1.5">
          <Select aria-label="Class dancing it" value={f.cls} onChange={x => setF({ ...f, cls: x.target.value })}>
            <option value="">Class…</option>{classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input aria-label="Music" placeholder="Music" value={f.music} onChange={x => setF({ ...f, music: x.target.value })} />
          <Input aria-label="Running time, minutes and seconds" placeholder="3:20" value={f.dur} onChange={x => setF({ ...f, dur: x.target.value })} />
        </div>
        <Button size="sm" disabled={!f.title.trim()} onClick={() => {
          go(S.ADD_ITEM, [event.id, f.cls || null, f.title, f.music, S.parseClock(f.dur)]); setF({ title: '', cls: '', music: '', dur: '' });
        }}>Add item</Button>
        <p className="text-[0.7812rem] text-ink-3">Dancers going to the show from the item’s class are added to it. Open an item to change who dances in it.</p>
      </div>
    </DetailSection>
  );
}

function ItemDetail({ event, item, classes }: { event: EventLike; item: S.RunningItem; classes: { id: string; name: string }[] }) {
  const dancers = useRows<S.ItemDancer>(['item-dancers', item.id], S.ITEM_DANCERS, [event.id, item.id]);
  const write = useWrite();
  const [f, setF] = React.useState({ title: item.title, cls: item.class_id ?? '', music: item.music ?? '', dur: S.clockTime(item.duration_sec), notes: item.notes ?? '' });
  const [slot, setSlot] = React.useState({ role: 'Chaperone', needed: '1' });
  const inItem = (dancers.data ?? []).filter(d => d.in_item);
  const others = (dancers.data ?? []).filter(d => !d.in_item);
  const [add, setAdd] = React.useState('');
  return (
    <div className="mt-2 min-w-0 space-y-3 border-l-2 border-line pl-3">
      {write.error != null && <ErrorState error={write.error} />}
      <div className="grid grid-cols-2 gap-1.5 [&>*]:min-w-0">
        <Field label="Name" htmlFor={`it-${item.id}`}><Input id={`it-${item.id}`} value={f.title} onChange={x => setF({ ...f, title: x.target.value })} /></Field>
        <Field label="Class" htmlFor={`ic-${item.id}`}><Select id={`ic-${item.id}`} value={f.cls} onChange={x => setF({ ...f, cls: x.target.value })}>
          <option value="">No class</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Music" htmlFor={`im-${item.id}`}><Input id={`im-${item.id}`} value={f.music} onChange={x => setF({ ...f, music: x.target.value })} /></Field>
        <Field label="Running time" htmlFor={`id-${item.id}`} hint="Minutes and seconds, like 3:20"><Input id={`id-${item.id}`} value={f.dur} onChange={x => setF({ ...f, dur: x.target.value })} /></Field>
        <Field label="Notes" htmlFor={`in-${item.id}`}><Input id={`in-${item.id}`} value={f.notes} placeholder="Props, entrances, lighting" onChange={x => setF({ ...f, notes: x.target.value })} /></Field>
        <div className="flex items-end"><Button size="sm" disabled={!f.title.trim()} onClick={() => write.mutate({ sql: S.UPDATE_ITEM,
          params: [item.id, f.title, f.cls || null, f.music, S.parseClock(f.dur), f.notes] })}>Save item</Button></div>
      </div>
      <div>
        <p className="text-[0.8125rem] font-semibold">Dancers ({inItem.length})</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {inItem.map(d => (
            <li key={d.student_id}>
              <button onClick={() => write.mutate({ sql: S.REMOVE_DANCER, params: [item.id, d.student_id] })} aria-label={`Take ${d.name} out of ${item.title}`}
                className="min-h-[36px] rounded-[var(--radius-sm)] border border-line-strong px-2 text-[0.8125rem] hover:border-critical">{d.name} ×</button>
            </li>
          ))}
        </ul>
        {others.length > 0 && (
          <div className="mt-1.5 flex gap-1.5">
            <Select aria-label={`Add a dancer to ${item.title}`} className="min-w-0 flex-1" value={add} onChange={x => setAdd(x.target.value)}>
              <option value="">Add a dancer going to the show…</option>{others.map(d => <option key={d.student_id} value={d.student_id}>{d.name}</option>)}
            </Select>
            <Button size="sm" disabled={!add} onClick={() => { write.mutate({ sql: S.ADD_DANCER, params: [item.id, add] }); setAdd(''); }}>Add</Button>
          </div>
        )}
      </div>
      <div>
        <p className="text-[0.8125rem] font-semibold">Chaperones and helpers for this item</p>
        <p className="text-[0.7812rem] text-ink-3">{item.helpers ?? 'None yet.'} Families sign up on their Events page; chaperones still need the office’s checks.</p>
        <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_4.5rem_auto] gap-1.5">
          <Input aria-label="Role" value={slot.role} onChange={x => setSlot({ ...slot, role: x.target.value })} />
          <Input aria-label="How many" type="number" min={1} max={50} value={slot.needed} onChange={x => setSlot({ ...slot, needed: x.target.value })} />
          <Button size="sm" disabled={slot.role.trim().length < 2} onClick={() => write.mutate({ sql: S.ITEM_SLOT,
            params: [event.id, item.id, `${slot.role.trim()} — ${item.title}`, Math.max(1, Number(slot.needed) || 1)] })}>Add slot</Button>
        </div>
      </div>
    </div>
  );
}

/** Costumes: the list per item with each dancer's size (from show-tools),
 *  plus price per costume, who pays, the budget and billing families once. */
export function CostumePlan({ event }: { event: EventLike }) {
  const routines = useRows<E.Routine>(['routines', event.id], E.ROUTINES, [event.id]);
  const items = useRows<S.CostumeItemRow>(['costume-items', event.id], S.COSTUME_ITEMS, [event.id]);
  const budget = useRow<S.CostumeBudget>(['costume-budget', event.id], S.COSTUME_BUDGET, [event.id]);
  const [done, setDone] = React.useState<string | null>(null);
  const write = useWrite();
  const [b, setB] = React.useState<string | null>(null);
  const [f, setF] = React.useState({ name: '', routine: '', price: '', charge: true });
  const bd = budget.data;
  const total = Number(bd?.total_minor ?? 0);
  const over = bd?.budget_minor != null && total > bd.budget_minor;
  return (
    <>
      <DetailSection title="Costume budget">
        {done && <div role="status" className="mb-2"><StatusLine live={false} title={done} /></div>}
        {write.error != null && <div className="mb-2"><ErrorState error={write.error} /></div>}
        <dl className="grid grid-cols-2 gap-3 text-[0.875rem]">
          <div><dt className="label">Costumes cost</dt><dd className={cn('stat-number mt-1 text-[1.25rem]', over && 'text-caution')}>{money(total)}</dd></div>
          <div><dt className="label">Budget</dt><dd className="stat-number mt-1 text-[1.25rem]">{bd?.budget_minor != null ? money(bd.budget_minor) : '—'}</dd></div>
          <div><dt className="label">Families pay</dt><dd className="stat-number mt-1 text-[1.25rem]">{money(bd?.families_minor ?? 0)}</dd></div>
          <div><dt className="label">School pays</dt><dd className="stat-number mt-1 text-[1.25rem]">{money(bd?.school_minor ?? 0)}</dd></div>
        </dl>
        {over && <p className="mt-2 text-[0.8125rem] font-semibold text-caution">{money(total - (bd!.budget_minor ?? 0))} over budget.</p>}
        <p className="mt-2 text-[0.8125rem] text-ink-3">{bd ? `${bd.sized} of ${bd.lines} sizes in · ${money(bd.billed_minor)} billed` : ''}</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <Field label="Budget (£)" htmlFor={`cb-${event.id}`}>
            <Input id={`cb-${event.id}`} className="w-28" type="number" min={0} step={1} value={b ?? (bd?.budget_minor != null ? String(bd.budget_minor / 100) : '')} onChange={x => setB(x.target.value)} />
          </Field>
          <Button size="sm" disabled={b == null} onClick={() => { write.mutate({ sql: S.SET_COSTUME_BUDGET, params: [event.id, b ? Math.round(Number(b) * 100) : null] }); setB(null); }}>Save budget</Button>
          {!!bd?.to_bill && (
            <Button size="sm" onClick={() => write.mutate({ sql: S.BILL_COSTUMES, params: [event.id] }, { onSuccess: r => setDone(`${r?.n ?? 0} famil${r?.n === 1 ? 'y' : 'ies'} billed for costumes. Each costume is billed once.`) })}>
              <Receipt className="size-4" aria-hidden /> Bill {bd.to_bill} costume charge{bd.to_bill === 1 ? '' : 's'}
            </Button>
          )}
        </div>
        <ul className="mt-3 divide-y divide-line border-t border-line text-[0.875rem]">
          {items.data?.map(i => <CostumePrice key={i.id} item={i} onSave={(price, charge) => write.mutate({ sql: S.UPDATE_COSTUME_ITEM, params: [i.id, price, charge] })} />)}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Input aria-label="Costume item" placeholder="Item, e.g. Red waistcoat" value={f.name} onChange={x => setF({ ...f, name: x.target.value })} />
          <Select aria-label="For item" value={f.routine} onChange={x => setF({ ...f, routine: x.target.value })}>
            <option value="">Everyone in the show</option>{routines.data?.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </Select>
          <Input aria-label="Price per costume in pounds" type="number" min={0} step={0.5} placeholder="Price £" value={f.price} onChange={x => setF({ ...f, price: x.target.value })} />
          <label className="flex min-h-[40px] items-center gap-2 text-[0.8125rem]"><input type="checkbox" className="size-[18px] accent-[var(--color-accent)]"
            checked={f.charge} onChange={x => setF({ ...f, charge: x.target.checked })} /> Families pay</label>
        </div>
        <Button size="sm" className="mt-1.5" disabled={!f.name.trim()} onClick={() => {
          write.mutate({ sql: S.ADD_COSTUME_ITEM, params: [event.id, f.routine || null, f.name, Math.round(Number(f.price || 0) * 100), f.charge] });
          setF({ name: '', routine: '', price: '', charge: true });
        }}>Add costume item</Button>
      </DetailSection>
      <CostumeSection eventId={event.id} routines={routines.data ?? []} hideAdd />
    </>
  );
}

function CostumePrice({ item, onSave }: { item: S.CostumeItemRow; onSave: (price: number, charge: boolean) => void }) {
  const [p, setP] = React.useState(String(item.price_minor / 100));
  return (
    <li className="flex flex-wrap items-center gap-2 py-1.5">
      <span className="min-w-0 flex-1"><b className="font-semibold">{item.name}</b>{item.routine ? <span className="text-ink-3"> · {item.routine}</span> : ''}</span>
      <Input aria-label={`Price of ${item.name} in pounds`} className="h-9 w-20" type="number" min={0} step={0.5} value={p} onChange={x => setP(x.target.value)}
        onBlur={() => Math.round(Number(p || 0) * 100) !== item.price_minor && onSave(Math.round(Number(p || 0) * 100), item.charge_families)} />
      <Select aria-label={`Who pays for ${item.name}`} className="h-9 w-32 text-[0.8125rem]" value={item.charge_families ? 'family' : 'school'}
        onChange={x => onSave(item.price_minor, x.target.value === 'family')}>
        <option value="family">Families pay</option><option value="school">School pays</option>
      </Select>
    </li>
  );
}

const FLAG: Record<S.LicenceRow['flag'], [string, 'positive' | 'caution' | 'critical' | 'muted' | 'ink']> = {
  ok: ['Licence issued', 'positive'], missing: ['Licence needed', 'caution'], expired: ['Expires before the show', 'critical'],
  refused: ['Refused', 'critical'], decide: ['To decide', 'muted'], not_needed: ['Not needed', 'muted'],
};

/** Child performance licences, per dancer: needed or not (the school's
 *  decision), applied, issued, expiry and performance days. UK-specific. */
export function LicenceTracker({ event }: { event: EventLike }) {
  const rows = useRows<S.LicenceRow>(['licences', event.id], S.LICENCES, [event.id]);
  const write = useWrite();
  const [open, setOpen] = React.useState<string | null>(null);
  const list = rows.data ?? [];
  const count = (k: S.LicenceRow['flag']) => list.filter(r => r.flag === k).length;
  return (
    <DetailSection title="Performance licences (UK)">
      <p className="text-[0.8125rem] text-ink-2">
        In England and Wales, children of school age often need a performance licence from their local council for public shows, unless an
        exemption applies. Whether this show needs them is your school’s decision; check with your council. Swayvo only keeps track.
      </p>
      {write.error != null && <div className="mt-2"><ErrorState error={write.error} /></div>}
      {list.length > 0 && (
        <p className="mt-2 text-[0.8125rem] text-ink-3">
          {count('ok')} issued · <span className={cn(count('missing') && 'font-semibold text-caution')}>{count('missing')} still needed</span>
          {count('expired') > 0 && <> · <span className="font-semibold text-critical">{count('expired')} expire before the show</span></>}
          {count('decide') > 0 && ` · ${count('decide')} to decide`}
        </p>
      )}
      {list.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: S.SET_LICENCE_ALL, params: [event.id, 'needed'] })}>Everyone needs one</Button>
          <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: S.SET_LICENCE_ALL, params: [event.id, 'not_needed'] })}>No licences needed</Button>
        </div>
      )}
      <ul className="mt-2 divide-y divide-line text-[0.875rem]">
        {list.map(r => (
          <li key={r.student_id} className="py-1.5">
            <button className="flex min-h-[40px] w-full items-center gap-2 text-left" aria-expanded={open === r.student_id} onClick={() => setOpen(o => o === r.student_id ? null : r.student_id)}>
              <span className="min-w-0 flex-1 truncate">{r.dancer}<span className="text-ink-3">{r.age_on_day != null ? ` · ${r.age_on_day} on the day` : ''}{r.expires_on ? ` · to ${dateShort(r.expires_on)}` : ''}</span></span>
              <Word tone={FLAG[r.flag][1]}>{FLAG[r.flag][0]}</Word>
            </button>
            {open === r.student_id && <LicenceForm event={event} row={r} onSave={params => write.mutate({ sql: S.SET_LICENCE, params }, { onSuccess: () => setOpen(null) })} />}
          </li>
        ))}
      </ul>
      {list.length === 0 && !rows.isLoading && <p className="mt-2 text-[0.875rem] text-ink-3">Nobody is confirmed for this show yet.</p>}
    </DetailSection>
  );
}

function LicenceForm({ event, row, onSave }: { event: EventLike; row: S.LicenceRow; onSave: (params: unknown[]) => void }) {
  const [f, setF] = React.useState({ needed: row.needed, status: row.status, authority: row.authority ?? '', reference: row.reference ?? '',
    issued: toDateInput(row.issued_on), expires: toDateInput(row.expires_on), days: row.performance_days != null ? String(row.performance_days) : '', note: row.note ?? '' });
  const set = (k: keyof typeof f) => (x: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: x.target.value });
  const id = `lic-${row.student_id}`;
  return (
    <div className="mt-1 grid grid-cols-2 gap-2 border-l-2 border-line pb-2 pl-3 [&>*]:min-w-0">
      <Field label="Licence needed?" htmlFor={`${id}-n`}><Select id={`${id}-n`} value={f.needed} onChange={set('needed')}>
        <option value="unknown">Not decided</option><option value="needed">Needed</option><option value="not_needed">Not needed</option></Select></Field>
      <Field label="Status" htmlFor={`${id}-s`}><Select id={`${id}-s`} value={f.status} onChange={set('status')} disabled={f.needed !== 'needed'}>
        <option value="not_applied">Not applied for</option><option value="applied">Applied</option><option value="issued">Issued</option><option value="refused">Refused</option></Select></Field>
      {f.needed === 'needed' && <>
        <Field label="Council" htmlFor={`${id}-a`}><Input id={`${id}-a`} value={f.authority} onChange={set('authority')} /></Field>
        <Field label="Licence reference" htmlFor={`${id}-r`}><Input id={`${id}-r`} value={f.reference} onChange={set('reference')} /></Field>
        <Field label="Issued" htmlFor={`${id}-i`}><Input id={`${id}-i`} type="date" value={f.issued} onChange={set('issued')} /></Field>
        <Field label="Expires" htmlFor={`${id}-e`} hint={`Show: ${dateShort(event.starts_at)}, ${time(event.starts_at)}`}><Input id={`${id}-e`} type="date" value={f.expires} onChange={set('expires')} /></Field>
        <Field label="Performance days" htmlFor={`${id}-d`}><Input id={`${id}-d`} type="number" min={0} max={366} value={f.days} onChange={set('days')} /></Field>
      </>}
      <Field label="Note" htmlFor={`${id}-t`}><Input id={`${id}-t`} value={f.note} onChange={set('note')} /></Field>
      <div className="col-span-2">
        <Button size="sm" onClick={() => onSave([event.id, row.student_id, f.needed, f.needed === 'needed' ? f.status : 'not_applied', f.authority, f.reference,
          f.issued || null, f.expires || null, f.days ? Number(f.days) : null, f.note])}>Save licence</Button>
      </div>
    </div>
  );
}
