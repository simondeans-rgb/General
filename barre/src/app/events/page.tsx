'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Plus, Receipt, Trash2, Users } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection } from '@/components/app/detail-panel';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton } from '@/components/ui';
import { SectionHead, Word } from '@/components/app/session-row';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import * as E from '@/lib/repos/events';
import * as C from '@/lib/repos/classes';
import { CostumeSection, ProgrammeButton, RehearsalRegisterButton, TicketSection } from '@/components/app/show-tools';
import { ConsentSnapshotButton } from '@/components/app/consent-snapshot';
import { ExamsCard } from '@/components/app/exams';
import { dateLong, money, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const KINDS: [string, string][] = [['show', 'Show'], ['exam', 'Exam'], ['competition', 'Competition'], ['workshop', 'Workshop'], ['social', 'Social']];
const PSTATUS: Record<string, 'ink' | 'positive' | 'caution' | 'muted'> = { invited: 'muted', confirmed: 'positive', requested: 'caution', declined: 'muted', waitlisted: 'caution', withdrawn: 'muted' };
const PWORD: Record<string, string> = { invited: 'Invited', confirmed: 'Going', requested: 'Asking', declined: 'Declined', waitlisted: 'Waiting', withdrawn: 'Withdrawn' };
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
    <Shell title="Events" help={<>Shows, competitions, workshops and exam sessions. Invite whole classes, and families accept in their app. Within a show: running order, costumes and sizes, rehearsals with registers, chaperones, a printable programme (children are named only with photo consent), tickets, and fees billed in one step.</>} subtitle="Shows, exams, competitions and workshops" allow={['owner', 'admin']}
      actions={<Button size="sm" variant="primary" onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> New event</Button>}>
      <div className="mx-auto max-w-[1240px]">
        <div className={cn('grid gap-x-12 gap-y-10', selected ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-start' : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]')}>
          <div className="min-w-0 space-y-10">
            {rows.isLoading && <Skeleton className="h-24" />}
            {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
            {rows.data?.length === 0 && <EmptyState title="No events yet" body="Add your end-of-term show or an exam session."
              action={<Button variant="primary" onClick={() => setEditing('new')}>New event</Button>} />}
            {rows.data && rows.data.length > 0 && (() => {
              const now = new Date();
              const upcoming = rows.data.filter(e => new Date(e.ends_at ?? e.starts_at) >= now);
              const past = rows.data.filter(e => new Date(e.ends_at ?? e.starts_at) < now);
              return [['Coming up', upcoming], ['Past', past]].filter(([, l]) => (l as E.OfficeEvent[]).length).map(([title, list]) => (
                <section key={title as string}>
                  <SectionHead title={title as string} meta={`${(list as E.OfficeEvent[]).length}`} />
                  <ul className="divide-y divide-line">
                    {(list as E.OfficeEvent[]).map(e => <EventLine key={e.id} e={e} active={selected === e.id} past={title === 'Past'} onSelect={() => select(e.id)} />)}
                  </ul>
                </section>
              ));
            })()}
          </div>
          {!selected && <div className="min-w-0"><ExamsCard /></div>}
          {selected && current && <EventDetail e={current} onEdit={() => setEditing(current)} onClose={() => select(null)} />}
        </div>
      </div>
      {editing && <EventSheet row={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onCreated={id => { setEditing(null); select(id); }} />}
    </Shell>
  );
}

function EventLine({ e, active, past, onSelect }: { e: E.OfficeEvent; active: boolean; past: boolean; onSelect: () => void }) {
  const d = new Date(e.starts_at);
  return (
    <li>
      <button onClick={onSelect} aria-current={active || undefined}
        className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 px-1 py-3 text-left hover:bg-surface-2/60',
          active && 'bg-surface-2 shadow-[inset_3px_0_0_var(--color-accent)]')}>
        <span className={cn('leading-none', past && 'text-ink-3')}>
          <span className="block font-display text-[1.5rem] tnum">{d.getDate()}</span>
          <span className="mt-1 block text-[0.7812rem] text-ink-3">{d.toLocaleDateString('en-GB', { month: 'short', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}</span>
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className={cn('font-semibold', past && 'text-ink-2')}>{e.title}</span>
            <span className="text-[0.8125rem] text-ink-3">{KINDS.find(k => k[0] === e.kind)?.[1] ?? e.kind}</span>
            {e.status === 'draft' && <Word tone="caution">Draft</Word>}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-ink-3">
            {dateLong(e.starts_at)}, {time(e.starts_at)}{e.venue ? ` · ${e.venue}` : ''}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-ink-2">
            <span className="font-semibold text-ink tnum">{e.confirmed}</span> going · {e.invited} yet to answer{e.requested ? <> · <span className="font-semibold text-caution">{e.requested} asking</span></> : ''}
            {e.cost_minor ? ` · ${money(e.cost_minor)} each, ${e.billed} billed` : ''}
          </span>
        </span>
      </button>
    </li>
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
      <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]"><input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={f.requests}
        onChange={e => setF(x => ({ ...x, requests: e.target.checked }))} /> Families may ask to take part (you still confirm)</label>
      <Field label="Details for families" htmlFor="ev-d">
        <textarea id="ev-d" rows={3} value={f.description} onChange={set('description')} className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
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
  const helpers = useRows<E.HelperSlot>(['helper-slots', e.id], E.HELPER_SLOTS, [e.id]);
  const [hs, setHs] = React.useState({ role: '', starts: '', needed: '2' });
  const [nt, setNt] = React.useState({ subject: '', body: '' });
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
      {done && <div role="status" className="mb-5 border-l-2 border-positive pl-3"><Notice word="Done" tone="positive" title={done} /></div>}
      {write.error != null && <div className="mb-5"><ErrorState error={write.error} /></div>}
      <dl className="mb-7 grid grid-cols-3 gap-4">
        <div><dt className="label">Going</dt><dd className="stat-number mt-1 text-[1.625rem] leading-none">{e.confirmed}</dd></div>
        <div><dt className="label">To answer</dt><dd className="stat-number mt-1 text-[1.625rem] leading-none">{e.invited}</dd></div>
        <div><dt className="label">Asking</dt><dd className={cn('stat-number mt-1 text-[1.625rem] leading-none', e.requested ? 'text-caution' : '')}>{e.requested}</dd></div>
      </dl>
      <Button className="mb-7" onClick={onEdit}>Edit details</Button>

      <DetailSection title="Invite classes">
        <div className="flex flex-wrap gap-1.5">
          {classes.data?.map(c => (
            <button key={c.id} aria-pressed={pick.includes(c.id)} onClick={() => setPick(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
              className={cn('min-h-[36px] rounded-[var(--radius-sm)] border px-2.5 text-[0.8125rem]', pick.includes(c.id) ? 'border-ink bg-ink font-semibold text-surface' : 'border-line-strong text-ink-2 hover:border-ink-3')}>{c.name}</button>
          ))}
        </div>
        <Button size="sm" className="mt-2" disabled={!pick.length} onClick={() => { go(E.INVITE_CLASSES, [e.id, pick], r => `${r.n} dancers invited; their families have been told.`); setPick([]); }}>
          <Users className="size-4" aria-hidden /> Invite {pick.length || ''} class{pick.length === 1 ? '' : 'es'}
        </Button>
      </DetailSection>

      <DetailSection title={`Dancers (${people.data?.length ?? 0})`}>
        <ul className="max-h-64 divide-y divide-line overflow-y-auto text-[0.875rem]">
          {people.data?.map(p => (
            <li key={p.id} className="flex min-h-[40px] items-center gap-2 py-1">
              <span className="min-w-0 flex-1 truncate">{p.student}{p.class_name ? <span className="text-ink-3"> · {p.class_name}</span> : ''}</span>
              <Word tone={PSTATUS[p.status] ?? 'muted'}>{PWORD[p.status] ?? p.status}</Word>
              {p.status === 'requested' && <Button size="sm" onClick={() => go(E.SET_PARTICIPANT, [p.id, 'confirmed'])}>Confirm</Button>}
            </li>
          ))}
        </ul>
        {!!people.data?.length && <ConsentSnapshotButton event={e} />}
        {!!e.cost_minor && (
          <Button size="sm" className="mt-2" disabled={!e.confirmed} onClick={() => go(E.BILL_EVENT, [e.id], r => r.n ? `${r.n} invoice${r.n === 1 ? '' : 's'} sent for the ${money(e.cost_minor)} fee.` : 'Everyone going has already been billed.')}>
            <Receipt className="size-4" aria-hidden /> Bill the fee to {e.confirmed - e.billed > 0 ? e.confirmed - e.billed : 0} new dancer{e.confirmed - e.billed === 1 ? '' : 's'}
          </Button>
        )}
      </DetailSection>

      <DetailSection title="Running order">
        <ol className="divide-y divide-line text-[0.875rem]">
          {routines.data?.map((r, i) => (
            <li key={r.id} className="flex items-start gap-1.5 py-1.5">
              <span className="w-6 shrink-0 font-display text-[0.9375rem] tnum text-ink-3">{i + 1}</span>
              <span className="min-w-0 flex-1"><b>{r.title}</b>{r.class_name ? ` · ${r.class_name}` : ''}{r.costume && <span className="block text-[0.7812rem] text-ink-2">Costume: {r.costume}</span>}</span>
              <button aria-label={`Move ${r.title} up`} disabled={i === 0} onClick={() => go(E.MOVE_ROUTINE, [r.id, -1])} className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowUp className="size-4" aria-hidden /></button>
              <button aria-label={`Move ${r.title} down`} disabled={i === (routines.data!.length - 1)} onClick={() => go(E.MOVE_ROUTINE, [r.id, 1])} className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowDown className="size-4" aria-hidden /></button>
              <button aria-label={`Remove ${r.title}`} onClick={() => go(E.REMOVE_ROUTINE, [r.id])} className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical"><Trash2 className="size-4" aria-hidden /></button>
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

      {routines.data && routines.data.length > 0 && <ProgrammeButton event={e} />}

      <CostumeSection eventId={e.id} routines={routines.data ?? []} />

      <DetailSection title="Rehearsals">
        <ul className="divide-y divide-line text-[0.875rem]">{rehearsals.data?.map(r => (
          <li key={r.id} className="flex min-h-[44px] items-center gap-2 py-1"><span className="min-w-0 flex-1"><b>{r.title}</b> · {dateLong(r.starts_at)}, {time(r.starts_at)}</span>
            <RehearsalRegisterButton rehearsal={r} /></li>))}</ul>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Input aria-label="Rehearsal name" value={rh.title} onChange={x => setRh({ ...rh, title: x.target.value })} />
          <Input aria-label="Rehearsal starts" type="datetime-local" value={rh.starts} onChange={x => setRh({ ...rh, starts: x.target.value })} />
        </div>
        <Button size="sm" className="mt-1.5" disabled={!rh.starts} onClick={() => { go(E.ADD_REHEARSAL, [e.id, rh.title, new Date(rh.starts).toISOString(), null, null],
          () => 'Rehearsal added to dancers’ and teachers’ diaries.'); setRh({ title: 'Rehearsal', starts: '', ends: '' }); }}>Add rehearsal</Button>
      </DetailSection>

      {(e.kind === 'show' || e.kind === 'competition') && <TicketSection eventId={e.id} />}

      <DetailSection title="Tell the families">
        <div className="grid gap-1.5">
          <Input aria-label="Notice subject" placeholder="Subject" value={nt.subject} onChange={x => setNt({ ...nt, subject: x.target.value })} />
          <textarea aria-label="Notice" rows={3} placeholder="Timings, what to bring, where to meet…" value={nt.body} onChange={x => setNt({ ...nt, body: x.target.value })}
            className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          <Button size="sm" disabled={!nt.body.trim()} onClick={() => { go(E.SEND_EVENT_NOTICE, [e.id, nt.subject, nt.body],
            r => r.n ? `Notice sent to ${r.n} famil${r.n === 1 ? 'y' : 'ies'}. It shows under this event in their app.` : 'No families are invited or going yet.'); setNt({ subject: '', body: '' }); }}>Send to families invited or going</Button>
        </div>
      </DetailSection>

      <DetailSection title="Helpers">
        <ul className="divide-y divide-line text-[0.875rem]">
          {helpers.data?.map(h => (
            <li key={h.id} className="flex min-h-[44px] items-center gap-2 py-1">
              <span className="min-w-0 flex-1"><b>{h.role}</b>{h.starts_at ? ` · ${time(h.starts_at)}` : ''}
                <span className="block text-[0.7812rem] text-ink-2">{h.helpers ?? 'Nobody yet'}</span></span>
              <Word tone={h.filled >= h.needed ? 'positive' : 'caution'}>{h.filled} of {h.needed}</Word>
              <button aria-label={`Remove ${h.role}`} onClick={() => go(E.REMOVE_HELPER_SLOT, [h.id])} className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical"><Trash2 className="size-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_5rem] gap-1.5">
          <Input aria-label="Helper role" placeholder="Front of house, backstage…" value={hs.role} onChange={x => setHs({ ...hs, role: x.target.value })} />
          <Input aria-label="Helpers needed" type="number" min={1} max={50} value={hs.needed} onChange={x => setHs({ ...hs, needed: x.target.value })} />
          <Input aria-label="Helper slot starts" type="datetime-local" className="col-span-2" value={hs.starts} onChange={x => setHs({ ...hs, starts: x.target.value })} />
        </div>
        <Button size="sm" className="mt-1.5" disabled={hs.role.trim().length < 2} onClick={() => { go(E.ADD_HELPER_SLOT, [e.id, hs.role, hs.starts ? new Date(hs.starts).toISOString() : null, Math.max(1, Number(hs.needed) || 1)],
          () => 'Slot added. Families see it on their Events page and can sign up.'); setHs({ role: '', starts: '', needed: '2' }); }}>Add helper slot</Button>
      </DetailSection>

      <DetailSection title="Chaperones">
        <ul className="divide-y divide-line text-[0.875rem]">
          {chaps.data?.map(c => (
            <li key={c.id} className="flex min-h-[44px] items-center gap-2"><span className="min-w-0 flex-1">{c.name}{c.phone ? <span className="text-ink-3"> · {c.phone}</span> : ''}</span>
              {c.checked ? <Word tone="positive">Checked</Word> : <Word tone="caution">Not checked</Word>}
              <button aria-label={`Remove ${c.name}`} onClick={() => go(E.REMOVE_CHAPERONE, [c.id])} className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical"><Trash2 className="size-4" aria-hidden /></button></li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Input aria-label="Chaperone name" placeholder="Name" value={ch.name} onChange={x => setCh({ ...ch, name: x.target.value })} />
          <Input aria-label="Chaperone phone" placeholder="Phone" value={ch.phone} onChange={x => setCh({ ...ch, phone: x.target.value })} />
        </div>
        <label className="mt-1 flex min-h-[44px] items-center gap-3 text-[0.875rem]"><input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={ch.checked}
          onChange={x => setCh({ ...ch, checked: x.target.checked })} /> DBS or licence seen</label>
        <Button size="sm" className="mt-1.5" disabled={!ch.name.trim()} onClick={() => { go(E.ADD_CHAPERONE, [e.id, ch.name, ch.phone, null, ch.checked]); setCh({ name: '', phone: '', checked: false }); }}>Add chaperone</Button>
      </DetailSection>
    </DetailPanel>
  );
}
