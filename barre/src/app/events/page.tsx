'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, CheckCircle2, Plus, Receipt, Trash2, Trophy, Users } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection } from '@/components/app/detail-panel';
import { RecordSheet } from '@/components/app/record-sheet';
import { Badge, Button, Card, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import * as E from '@/lib/repos/events';
import * as C from '@/lib/repos/classes';
import { dateLong, money, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const KINDS: [string, string][] = [['show', 'Show'], ['exam', 'Exam'], ['competition', 'Competition'], ['workshop', 'Workshop'], ['social', 'Social']];
const PSTATUS: Record<string, Tone> = { invited: 'info', confirmed: 'positive', requested: 'caution', declined: 'neutral', waitlisted: 'caution', withdrawn: 'neutral' };
const local = (iso?: string | null) => iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';

function useWrite(after?: (r: unknown) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { sql: string; params: unknown[] }) => (await runAs(session, q => q(v.sql, v.params)))[0],
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); after?.(r); },
  });
}

export default function EventsPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Events /></Suspense>;
}

/** Shows, exams, competitions and workshops, run from the office (R-015). */
function Events() {
  const rows = useRows<E.OfficeEvent>(['office-events'], E.EVENTS);
  const { selected, select } = useSelection();
  const [editing, setEditing] = React.useState<E.OfficeEvent | 'new' | null>(null);
  const current = rows.data?.find(e => e.id === selected);
  return (
    <Shell title="Events" subtitle="Shows, exams, competitions and workshops" allow={['owner', 'admin']}
      actions={<Button size="sm" variant="primary" onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> New event</Button>}>
      <div className="mx-auto max-w-6xl">
        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]' : 'block')}>
          <Card className="min-w-0 overflow-hidden">
            {rows.isLoading && <div className="p-4"><Skeleton className="h-24" /></div>}
            {rows.data?.length === 0 && <EmptyState icon={<Trophy className="size-5" />} title="No events yet" body="Add your end-of-term show or an exam session." />}
            <ul className="divide-y divide-line">
              {rows.data?.map(e => (
                <li key={e.id}>
                  <button onClick={() => select(e.id)} className={cn('block w-full px-4 py-3 text-left hover:bg-surface-2', selected === e.id && 'bg-accent-soft/50',
                    new Date(e.starts_at) < new Date() && 'opacity-60')}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="violet">{KINDS.find(k => k[0] === e.kind)?.[1] ?? e.kind}</Badge>
                      {e.status === 'draft' && <Badge tone="neutral">Draft</Badge>}
                      <span className="font-medium">{e.title}</span>
                      <span className="ml-auto text-[12.5px] text-ink-3">{dateLong(e.starts_at)}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-ink-2">{e.confirmed} going · {e.invited} yet to answer{e.requested ? ` · ${e.requested} asking` : ''}
                      {e.cost_minor ? ` · ${money(e.cost_minor)} each, ${e.billed} billed` : ''}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          {selected && current && <EventDetail e={current} onEdit={() => setEditing(current)} onClose={() => select(null)} />}
        </div>
      </div>
      {editing && <EventSheet row={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onCreated={id => { setEditing(null); select(id); }} />}
    </Shell>
  );
}

function EventSheet({ row, onClose, onCreated }: { row: E.OfficeEvent | null; onClose: () => void; onCreated: (id: string) => void }) {
  const [f, setF] = React.useState({
    kind: row?.kind ?? 'show', status: row?.status ?? 'published', title: row?.title ?? '', description: row?.description ?? '',
    starts: local(row?.starts_at), ends: local(row?.ends_at), venue: row?.venue ?? '',
    cost: row?.cost_minor != null ? String(row.cost_minor / 100) : '', capacity: row?.capacity != null ? String(row.capacity) : '',
    closes: row?.entries_close_on ?? '', requests: row?.requests_open ?? false,
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const save = useWrite(r => row ? onClose() : onCreated((r as { id: string }).id));
  const iso = (v: string) => v ? new Date(v).toISOString() : null;
  const args = [f.kind, f.status, f.title, f.description, iso(f.starts), iso(f.ends), f.venue,
    f.cost ? Math.round(Number(f.cost) * 100) : null, f.capacity ? Number(f.capacity) : null, f.closes || null, f.requests];
  return (
    <RecordSheet title={row ? 'Edit event' : 'New event'} onClose={onClose} saving={save.isPending} error={save.error}
      canSave={f.title.trim().length > 2 && !!f.starts} onSave={() => save.mutate({ sql: row ? E.UPDATE_EVENT : E.CREATE_EVENT, params: row ? [row.id, ...args] : args })}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kind" htmlFor="ev-k"><Select id="ev-k" value={f.kind} onChange={set('kind')}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
        <Field label="Visible to families" htmlFor="ev-s"><Select id="ev-s" value={f.status} onChange={set('status')}>
          <option value="published">Yes</option><option value="draft">Not yet (draft)</option></Select></Field>
      </div>
      <Field label="Title" htmlFor="ev-t" required><Input id="ev-t" value={f.title} onChange={set('title')} placeholder="Summer Showcase" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts" htmlFor="ev-st" required><Input id="ev-st" type="datetime-local" value={f.starts} onChange={set('starts')} /></Field>
        <Field label="Ends" htmlFor="ev-en"><Input id="ev-en" type="datetime-local" value={f.ends} onChange={set('ends')} /></Field>
      </div>
      <Field label="Venue" htmlFor="ev-v"><Input id="ev-v" value={f.venue} onChange={set('venue')} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Fee (£)" htmlFor="ev-c" hint="Per dancer"><Input id="ev-c" type="number" min={0} step={0.5} value={f.cost} onChange={set('cost')} /></Field>
        <Field label="Places" htmlFor="ev-cap"><Input id="ev-cap" type="number" min={1} value={f.capacity} onChange={set('capacity')} /></Field>
        <Field label="Entries close" htmlFor="ev-cl"><Input id="ev-cl" type="date" value={f.closes} onChange={set('closes')} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={f.requests}
        onChange={e => setF(x => ({ ...x, requests: e.target.checked }))} /> Families may ask to take part (you still confirm)</label>
      <Field label="Details for families" htmlFor="ev-d">
        <textarea id="ev-d" rows={3} value={f.description} onChange={set('description')} className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm" />
      </Field>
    </RecordSheet>
  );
}

function EventDetail({ e, onEdit, onClose }: { e: E.OfficeEvent; onEdit: () => void; onClose: () => void }) {
  const people = useRows<E.Participant>(['event-people', e.id], E.PARTICIPANTS, [e.id]);
  const classes = useRows<{ id: string; name: string }>(['class-options'], C.CLASS_OPTIONS);
  const routines = useRows<E.Routine>(['routines', e.id], E.ROUTINES, [e.id]);
  const rehearsals = useRows<E.Rehearsal>(['rehearsals', e.id], E.REHEARSALS, [e.id]);
  const chaps = useRows<E.Chaperone>(['chaperones', e.id], E.CHAPERONES, [e.id]);
  const [done, setDone] = React.useState<string | null>(null);
  const write = useWrite();
  const [pick, setPick] = React.useState<string[]>([]);
  const [rt, setRt] = React.useState({ title: '', cls: '', costume: '' });
  const [rh, setRh] = React.useState({ title: 'Rehearsal', starts: '', ends: '' });
  const [ch, setCh] = React.useState({ name: '', phone: '', checked: false });
  const go = (sql: string, params: unknown[], msg?: (r: any) => string) =>
    write.mutate({ sql, params }, { onSuccess: r => msg && setDone(msg(r)) });
  return (
    <DetailPanel open onClose={onClose} title={e.title} subtitle={`${dateLong(e.starts_at)} · ${time(e.starts_at)}${e.venue ? ` · ${e.venue}` : ''}`}>
      {done && <p role="status" className="mb-2 flex items-center gap-2 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]"><CheckCircle2 className="size-4 text-positive" aria-hidden /> {done}</p>}
      {write.error != null && <ErrorState error={write.error} />}
      <Button className="w-full" onClick={onEdit}>Edit details</Button>

      <DetailSection title="Invite classes">
        <div className="flex flex-wrap gap-1.5">
          {classes.data?.map(c => (
            <button key={c.id} aria-pressed={pick.includes(c.id)} onClick={() => setPick(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
              className={cn('rounded-full border px-2.5 py-1 text-[12.5px]', pick.includes(c.id) ? 'border-accent bg-accent text-on-accent' : 'border-line')}>{c.name}</button>
          ))}
        </div>
        <Button size="sm" className="mt-2" disabled={!pick.length} onClick={() => { go(E.INVITE_CLASSES, [e.id, pick], r => `${r.n} dancers invited; their families have been told.`); setPick([]); }}>
          <Users className="size-4" aria-hidden /> Invite {pick.length || ''} class{pick.length === 1 ? '' : 'es'}
        </Button>
      </DetailSection>

      <DetailSection title={`Dancers (${people.data?.length ?? 0})`}>
        <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {people.data?.map(p => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{p.student}{p.class_name ? <span className="text-ink-3"> · {p.class_name}</span> : ''}</span>
              <Badge tone={PSTATUS[p.status] ?? 'neutral'}>{p.status}</Badge>
              {p.status === 'requested' && <Button size="sm" onClick={() => go(E.SET_PARTICIPANT, [p.id, 'confirmed'])}>Confirm</Button>}
            </li>
          ))}
        </ul>
        {!!e.cost_minor && (
          <Button size="sm" className="mt-2" disabled={!e.confirmed} onClick={() => go(E.BILL_EVENT, [e.id], r => r.n ? `${r.n} invoice${r.n === 1 ? '' : 's'} sent for the ${money(e.cost_minor)} fee.` : 'Everyone going has already been billed.')}>
            <Receipt className="size-4" aria-hidden /> Bill the fee to {e.confirmed - e.billed > 0 ? e.confirmed - e.billed : 0} new dancer{e.confirmed - e.billed === 1 ? '' : 's'}
          </Button>
        )}
      </DetailSection>

      <DetailSection title="Running order">
        <ol className="space-y-1.5 text-sm">
          {routines.data?.map((r, i) => (
            <li key={r.id} className="flex items-start gap-1.5">
              <span className="w-5 shrink-0 text-ink-3">{i + 1}.</span>
              <span className="min-w-0 flex-1"><b>{r.title}</b>{r.class_name ? ` · ${r.class_name}` : ''}{r.costume && <span className="block text-[12.5px] text-ink-2">Costume: {r.costume}</span>}</span>
              <button aria-label={`Move ${r.title} up`} disabled={i === 0} onClick={() => go(E.MOVE_ROUTINE, [r.id, -1])} className="p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
              <button aria-label={`Move ${r.title} down`} disabled={i === (routines.data!.length - 1)} onClick={() => go(E.MOVE_ROUTINE, [r.id, 1])} className="p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
              <button aria-label={`Remove ${r.title}`} onClick={() => go(E.REMOVE_ROUTINE, [r.id])} className="p-1 text-ink-3 hover:text-critical"><Trash2 className="size-3.5" /></button>
            </li>
          ))}
        </ol>
        <div className="mt-2 grid gap-1.5">
          <Input aria-label="Routine name" placeholder="Routine name" value={rt.title} onChange={x => setRt({ ...rt, title: x.target.value })} />
          <div className="grid grid-cols-2 gap-1.5">
            <Select aria-label="Class dancing it" value={rt.cls} onChange={x => setRt({ ...rt, cls: x.target.value })}>
              <option value="">Class…</option>{classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input aria-label="Costume" placeholder="Costume" value={rt.costume} onChange={x => setRt({ ...rt, costume: x.target.value })} />
          </div>
          <Button size="sm" disabled={!rt.title.trim()} onClick={() => { go(E.ADD_ROUTINE, [e.id, rt.cls || null, rt.title, rt.costume]); setRt({ title: '', cls: '', costume: '' }); }}>Add routine</Button>
        </div>
      </DetailSection>

      <DetailSection title="Rehearsals">
        <ul className="space-y-1 text-sm">{rehearsals.data?.map(r => <li key={r.id}><b>{r.title}</b> · {dateLong(r.starts_at)}, {time(r.starts_at)}</li>)}</ul>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Input aria-label="Rehearsal name" value={rh.title} onChange={x => setRh({ ...rh, title: x.target.value })} />
          <Input aria-label="Rehearsal starts" type="datetime-local" value={rh.starts} onChange={x => setRh({ ...rh, starts: x.target.value })} />
        </div>
        <Button size="sm" className="mt-1.5" disabled={!rh.starts} onClick={() => { go(E.ADD_REHEARSAL, [e.id, rh.title, new Date(rh.starts).toISOString(), null, null],
          () => 'Rehearsal added to dancers’ and teachers’ diaries.'); setRh({ title: 'Rehearsal', starts: '', ends: '' }); }}>Add rehearsal</Button>
      </DetailSection>

      <DetailSection title="Chaperones">
        <ul className="space-y-1 text-sm">
          {chaps.data?.map(c => (
            <li key={c.id} className="flex items-center gap-2"><span className="min-w-0 flex-1">{c.name}{c.phone ? ` · ${c.phone}` : ''}</span>
              {c.checked ? <Badge tone="positive">Checked</Badge> : <Badge tone="caution">Not checked</Badge>}
              <button aria-label={`Remove ${c.name}`} onClick={() => go(E.REMOVE_CHAPERONE, [c.id])} className="p-1 text-ink-3 hover:text-critical"><Trash2 className="size-3.5" /></button></li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Input aria-label="Chaperone name" placeholder="Name" value={ch.name} onChange={x => setCh({ ...ch, name: x.target.value })} />
          <Input aria-label="Chaperone phone" placeholder="Phone" value={ch.phone} onChange={x => setCh({ ...ch, phone: x.target.value })} />
        </div>
        <label className="mt-1.5 flex items-center gap-2 text-[13px]"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={ch.checked}
          onChange={x => setCh({ ...ch, checked: x.target.checked })} /> DBS or licence seen</label>
        <Button size="sm" className="mt-1.5" disabled={!ch.name.trim()} onClick={() => { go(E.ADD_CHAPERONE, [e.id, ch.name, ch.phone, null, ch.checked]); setCh({ name: '', phone: '', checked: false }); }}>Add chaperone</Button>
      </DetailSection>
    </DetailPanel>
  );
}
