'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, CalendarRange, RotateCcw, Database, ShieldCheck, Plus, Pencil,
  DoorOpen, CalendarOff, Building2,
} from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows, useRow } from '@/lib/query';
import { resetDemo, runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, Field, Input, Select,
  Skeleton, ErrorState, type Tone,
} from '@/components/ui';
import * as S from '@/lib/repos/setup';
import { dateShort } from '@/lib/format';

const STYLE_TONES: Tone[] = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'];
const TIMEZONES = ['Europe/London', 'Europe/Dublin', 'Europe/Paris', 'America/New_York',
                   'America/Los_Angeles', 'Australia/Sydney'];

/** Every mutation on this page invalidates the same root, because setup feeds
 *  the class form, the schedule and the onboarding wizard alike. */
function useSetupWrite(sql: string, onDone?: () => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: unknown[]) => runAs(session, q => q(sql, params)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(); },
  });
}

export default function StudioSettings() {
  return (
    <Shell title="Studio" subtitle="Everything a timetable is built from"
           allow={['owner', 'admin']}>
      <div className="mx-auto max-w-3xl space-y-5">
        <StudioDetails />
        <Locations />
        <Rooms />
        <Terms />
        <div className="grid gap-5 sm:grid-cols-2">
          <Styles />
          <Levels />
        </div>
        <AboutDemo />
      </div>
    </Shell>
  );
}

/* ── The studio itself ──────────────────────────────────────────────────── */
function StudioDetails() {
  const { session } = useSession();
  const studio = useRow<S.StudioRow>(['studio'], S.STUDIO);
  const [editing, setEditing] = React.useState(false);
  const isOwner = session?.role === 'owner';

  const s = studio.data;
  return (
    <Card>
      <CardHeader title="Studio details" subtitle={s?.name}
        action={isOwner && s
          ? <Button size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-4" aria-hidden /> Edit
            </Button>
          : undefined} />
      {studio.isPending && <div className="p-4"><Skeleton className="h-14" /></div>}
      {s && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-[13px]">
          <Fact label="Name" value={s.name} />
          <Fact label="Timezone" value={s.timezone} />
          <Fact label="Email" value={s.contact_email ?? 'Not set'} />
          <Fact label="Phone" value={s.contact_phone ?? 'Not set'} />
        </dl>
      )}
      {!isOwner && (
        <p className="px-4 pb-4 text-[12.5px] text-ink-3">
          Only the studio owner can change these. Administrators run everything else.
        </p>
      )}
      {editing && s && <StudioSheet studio={s} onClose={() => setEditing(false)} />}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-3">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

function StudioSheet({ studio, onClose }: { studio: S.StudioRow; onClose: () => void }) {
  const [name, setName] = React.useState(studio.name);
  const [tz, setTz] = React.useState(studio.timezone);
  const [email, setEmail] = React.useState(studio.contact_email ?? '');
  const [phone, setPhone] = React.useState(studio.contact_phone ?? '');
  const save = useSetupWrite(S.UPDATE_STUDIO, onClose);

  return (
    <RecordSheet title="Studio details" onClose={onClose} error={save.error}
      saving={save.isPending} canSave={name.trim().length >= 2}
      onSave={() => save.mutate([studio.id, name.trim(), tz, email, phone])}>
      <Field label="Name" htmlFor="st-name" required>
        <Input id="st-name" value={name} onChange={e => setName(e.target.value)} />
      </Field>
      <Field label="Timezone" htmlFor="st-tz"
             hint="Class times are generated in this zone, so changing it moves the timetable.">
        <Select id="st-tz" value={tz} onChange={e => setTz(e.target.value)}>
          {TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </Select>
      </Field>
      <Field label="Contact email" htmlFor="st-email">
        <Input id="st-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
               placeholder="hello@yourstudio.co.uk" />
      </Field>
      <Field label="Contact phone" htmlFor="st-phone">
        <Input id="st-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

/* ── Locations ──────────────────────────────────────────────────────────── */
function Locations() {
  const rows = useRows<S.Location>(['locations-full'], S.LOCATIONS_FULL);
  const [open, setOpen] = React.useState<S.Location | 'new' | null>(null);

  return (
    <Card>
      <CardHeader title="Locations" subtitle="Where classes happen"
        action={<Button size="sm" variant="primary" aria-label="Add a location"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="p-4"><Skeleton className="h-16" /></div>}
      {rows.error && <div className="p-4"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState icon={<Building2 className="size-5" />} title="No locations yet"
          body="Add the building your classes run in. Rooms go inside it." />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(l => (
          <li key={l.id}>
            <button onClick={() => setOpen(l)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{l.name}</span>
                <span className="block text-[13px] text-ink-2">
                  {[l.address_line1, l.city, l.postcode].filter(Boolean).join(', ') || 'No address'}
                </span>
              </span>
              <span className="shrink-0 text-[12.5px] text-ink-3">
                {l.rooms} room{l.rooms === 1 ? '' : 's'} · {l.classes} classes
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <LocationSheet row={open === 'new' ? null : open} onClose={() => setOpen(null)} />}
    </Card>
  );
}

function LocationSheet({ row, onClose }: { row: S.Location | null; onClose: () => void }) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [line1, setLine1] = React.useState(row?.address_line1 ?? '');
  const [city, setCity] = React.useState(row?.city ?? '');
  const [postcode, setPostcode] = React.useState(row?.postcode ?? '');
  const save = useSetupWrite(row ? S.UPDATE_LOCATION : S.CREATE_LOCATION, onClose);
  const remove = useSetupWrite(S.RETIRE_SETUP, onClose);
  const inUse = (row?.classes ?? 0) + (row?.rooms ?? 0) > 0;

  return (
    <RecordSheet title={row ? 'Edit location' : 'New location'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending}
      canSave={name.trim().length >= 2}
      onSave={() => save.mutate(row
        ? [row.id, name.trim(), line1, '', city, postcode, '']
        : [name.trim(), line1, '', city, postcode, ''])}
      onRemove={row ? () => remove.mutate(['location', row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && inUse
        ? `In use by ${row.rooms} room${row.rooms === 1 ? '' : 's'} and ${row.classes} class${row.classes === 1 ? '' : 'es'}. Move or remove those first.`
        : null}>
      <Field label="Name" htmlFor="loc-name" required>
        <Input id="loc-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="Greenwich Studio" />
      </Field>
      <Field label="Address" htmlFor="loc-line1">
        <Input id="loc-line1" value={line1} onChange={e => setLine1(e.target.value)}
               placeholder="14 Creek Road" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Town or city" htmlFor="loc-city">
          <Input id="loc-city" value={city} onChange={e => setCity(e.target.value)} />
        </Field>
        <Field label="Postcode" htmlFor="loc-postcode">
          <Input id="loc-postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
        </Field>
      </div>
    </RecordSheet>
  );
}

/* ── Rooms ──────────────────────────────────────────────────────────────── */
function Rooms() {
  const rows = useRows<S.Room>(['rooms-full'], S.ROOMS_FULL);
  const locations = useRows<S.Location>(['locations-full'], S.LOCATIONS_FULL);
  const [open, setOpen] = React.useState<S.Room | 'new' | null>(null);
  const hasLocation = (locations.data?.length ?? 0) > 0;

  return (
    <Card>
      <CardHeader title="Rooms" subtitle="A class is taught in one of these"
        action={<Button size="sm" variant="primary" disabled={!hasLocation}
                        aria-label="Add a room" onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="p-4"><Skeleton className="h-14" /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState icon={<DoorOpen className="size-5" />} title="No rooms yet"
          body={hasLocation ? 'Add a room to a location.' : 'Add a location first — rooms live inside one.'} />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(r => (
          <li key={r.id}>
            <button onClick={() => setOpen(r)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2">
              <DoorOpen className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{r.name}</span>
                <span className="block text-[13px] text-ink-2">{r.location}</span>
              </span>
              <span className="shrink-0 text-[12.5px] text-ink-3">
                {r.capacity ? `holds ${r.capacity}` : 'no limit'} · {r.classes} classes
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <RoomSheet row={open === 'new' ? null : open}
                          locations={locations.data ?? []} onClose={() => setOpen(null)} />}
    </Card>
  );
}

function RoomSheet({ row, locations, onClose }: {
  row: S.Room | null; locations: S.Location[]; onClose: () => void;
}) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [locationId, setLocationId] = React.useState(row?.location_id ?? locations[0]?.id ?? '');
  const [capacity, setCapacity] = React.useState(row?.capacity != null ? String(row.capacity) : '');
  const save = useSetupWrite(row ? S.UPDATE_ROOM : S.CREATE_ROOM, onClose);
  const remove = useSetupWrite(S.RETIRE_SETUP, onClose);
  const cap = capacity === '' ? null : Number(capacity);

  return (
    <RecordSheet title={row ? 'Edit room' : 'New room'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending}
      canSave={name.trim().length >= 1 && !!locationId && (cap == null || cap > 0)}
      onSave={() => save.mutate(row ? [row.id, name.trim(), cap] : [locationId, name.trim(), cap])}
      onRemove={row ? () => remove.mutate(['room', row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && row.classes > 0
        ? `${row.classes} class${row.classes === 1 ? '' : 'es'} still taught here. Move them first.`
        : null}>
      {!row && (
        <Field label="Location" htmlFor="room-loc" required>
          <Select id="room-loc" value={locationId} onChange={e => setLocationId(e.target.value)}>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        </Field>
      )}
      <Field label="Name" htmlFor="room-name" required>
        <Input id="room-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="Studio One" />
      </Field>
      <Field label="Capacity" htmlFor="room-cap" hint="Optional. How many dancers fit safely.">
        <Input id="room-cap" type="number" inputMode="numeric" min={1} max={200} value={capacity}
               onChange={e => setCapacity(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

/* ── Terms and breaks ───────────────────────────────────────────────────── */
function Terms() {
  const rows = useRows<S.Term>(['terms-full'], S.TERMS_FULL);
  const [open, setOpen] = React.useState<S.Term | 'new' | null>(null);
  const [breaksFor, setBreaksFor] = React.useState<S.Term | null>(null);

  return (
    <Card>
      <CardHeader title="Terms" subtitle="Class sessions are generated between these dates"
        action={<Button size="sm" variant="primary" aria-label="Add a term"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="p-4"><Skeleton className="h-14" /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState icon={<CalendarRange className="size-5" />} title="No terms yet"
          body="A class needs a term: it is what tells the generator which weeks to lay down." />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(t => (
          <li key={t.id} className="flex items-center gap-2 px-4 py-3">
            <CalendarRange className="size-4 shrink-0 text-ink-3" aria-hidden />
            <button onClick={() => setOpen(t)} className="min-w-0 flex-1 text-left">
              <span className="block font-medium">{t.name}</span>
              <span className="block text-[13px] text-ink-2">
                {dateShort(t.starts_on)} – {dateShort(t.ends_on)} · {t.classes} classes
              </span>
            </button>
            <Badge tone={t.status === 'published' ? 'positive' : 'neutral'}>{t.status}</Badge>
            <Button size="sm" variant="ghost" onClick={() => setBreaksFor(t)}
                    aria-label={`Breaks in ${t.name} — ${t.breaks} set`}>
              <CalendarOff className="size-4" aria-hidden />
              <span className="tnum" aria-hidden>{t.breaks}</span>
            </Button>
          </li>
        ))}
      </ul>
      {open && <TermSheet row={open === 'new' ? null : open} onClose={() => setOpen(null)} />}
      {breaksFor && <BreaksSheet term={breaksFor} onClose={() => setBreaksFor(null)} />}
    </Card>
  );
}

function TermSheet({ row, onClose }: { row: S.Term | null; onClose: () => void }) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [from, setFrom] = React.useState(row?.starts_on?.slice(0, 10) ?? '');
  const [to, setTo] = React.useState(row?.ends_on?.slice(0, 10) ?? '');
  const [status, setStatus] = React.useState(row?.status ?? 'draft');
  const save = useSetupWrite(row ? S.UPDATE_TERM : S.CREATE_TERM, onClose);
  const remove = useSetupWrite(S.RETIRE_SETUP, onClose);
  const ok = name.trim().length >= 2 && !!from && !!to && to >= from;

  return (
    <RecordSheet title={row ? 'Edit term' : 'New term'} onClose={onClose}
      subtitle={row ? undefined : 'Sessions are generated between these dates when you add a class.'}
      error={save.error ?? remove.error} saving={save.isPending} canSave={ok}
      onSave={() => save.mutate(row ? [row.id, name.trim(), from, to, status]
                                    : [name.trim(), from, to, status])}
      onRemove={row ? () => remove.mutate(['term', row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && row.classes > 0
        ? `${row.classes} class${row.classes === 1 ? '' : 'es'} run in this term. Remove those first.`
        : null}>
      <Field label="Name" htmlFor="term-name" required>
        <Input id="term-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="Autumn 2026" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First day" htmlFor="term-from" required>
          <Input id="term-from" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </Field>
        <Field label="Last day" htmlFor="term-to" required
               error={from && to && to < from ? 'The term cannot end before it starts.' : undefined}>
          <Input id="term-to" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </Field>
      </div>
      <Field label="Status" htmlFor="term-status"
             hint="Draft terms are yours to plan with; published ones are the live timetable.">
        <Select id="term-status" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </Field>
    </RecordSheet>
  );
}

function BreaksSheet({ term, onClose }: { term: S.Term; onClose: () => void }) {
  const rows = useRows<S.Break>(['breaks', term.id], S.BREAKS, [term.id]);
  const [name, setName] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const add = useSetupWrite(S.CREATE_BREAK, () => { setName(''); setFrom(''); setTo(''); });
  const remove = useSetupWrite(S.RETIRE_SETUP);
  const ok = name.trim().length >= 2 && !!from && !!to && to >= from;

  return (
    <RecordSheet title="Breaks" subtitle={`No classes on these dates in ${term.name}.`}
      onClose={onClose} error={add.error ?? remove.error} saving={add.isPending} canSave={ok}
      saveLabel="Add break"
      onSave={() => add.mutate([term.id, name.trim(), from, to])}>
      {rows.isPending && <Skeleton className="h-12" />}
      {!rows.isPending && rows.data?.length === 0 && (
        <p className="text-[13px] text-ink-3">
          None yet. Half-terms and bank holidays go here, and the generator skips them.
        </p>
      )}
      {(rows.data?.length ?? 0) > 0 && (
        <ul className="divide-y divide-line rounded-[var(--radius-md)] border border-line">
          {rows.data!.map(b => (
            <li key={b.id} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{b.name}</span>
                <span className="block text-[12.5px] text-ink-2">
                  {dateShort(b.starts_on)} – {dateShort(b.ends_on)}
                </span>
              </span>
              <Button size="sm" variant="ghost" aria-label={`Remove ${b.name}`}
                      onClick={() => remove.mutate(['term_break', b.id])}>×</Button>
            </li>
          ))}
        </ul>
      )}
      <p className="pt-1 text-[12.5px] text-ink-3">
        Adding a break does not remove sessions already generated — regenerate the
        class from its edit form to apply it.
      </p>
      <Field label="Name" htmlFor="brk-name" required>
        <Input id="brk-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="October half term" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" htmlFor="brk-from" required>
          <Input id="brk-from" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="brk-to" required>
          <Input id="brk-to" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </Field>
      </div>
    </RecordSheet>
  );
}

/* ── Styles and levels ──────────────────────────────────────────────────── */
function Styles() {
  const rows = useRows<S.Style>(['styles-full'], S.STYLES_FULL);
  const [open, setOpen] = React.useState<S.Style | 'new' | null>(null);

  return (
    <Card>
      <CardHeader title="Dance styles"
        action={<Button size="sm" variant="ghost" aria-label="Add a dance style"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden />
        </Button>} />
      {rows.isPending && <div className="p-4"><Skeleton className="h-10" /></div>}
      <div className="flex flex-wrap gap-2 p-4">
        {rows.data?.map(s => (
          <button key={s.id} onClick={() => setOpen(s)} className="rounded-full">
            <Badge tone={STYLE_TONES.includes(s.colour as Tone) ? (s.colour as Tone) : 'neutral'}>
              {s.name}
            </Badge>
          </button>
        ))}
        {!rows.isPending && rows.data?.length === 0 &&
          <p className="text-[13px] text-ink-3">Ballet, tap, street — however you group your teaching.</p>}
      </div>
      {open && <StyleSheet row={open === 'new' ? null : open} onClose={() => setOpen(null)} />}
    </Card>
  );
}

function StyleSheet({ row, onClose }: { row: S.Style | null; onClose: () => void }) {
  const [name, setName] = React.useState(row?.name ?? '');
  const [colour, setColour] = React.useState(row?.colour ?? 'violet');
  const save = useSetupWrite(row ? S.UPDATE_STYLE : S.CREATE_STYLE, onClose);
  const remove = useSetupWrite(S.RETIRE_SETUP, onClose);

  return (
    <RecordSheet title={row ? 'Edit style' : 'New style'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending} canSave={name.trim().length >= 2}
      onSave={() => save.mutate(row ? [row.id, name.trim(), colour] : [name.trim(), colour])}
      onRemove={row ? () => remove.mutate(['dance_style', row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && row.classes > 0
        ? `${row.classes} class${row.classes === 1 ? '' : 'es'} use this style.` : null}>
      <Field label="Name" htmlFor="style-name" required>
        <Input id="style-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="Contemporary" />
      </Field>
      <Field label="Colour" htmlFor="style-colour"
             hint="Used on the timetable so a style is recognisable at a glance.">
        <Select id="style-colour" value={colour} onChange={e => setColour(e.target.value)}>
          {STYLE_TONES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[12.5px] text-ink-3">Preview</span>
        <Badge tone={colour as Tone}>{name.trim() || 'Style'}</Badge>
      </div>
    </RecordSheet>
  );
}

function Levels() {
  const rows = useRows<S.Level>(['levels-full'], S.LEVELS_FULL);
  const [open, setOpen] = React.useState<S.Level | 'new' | null>(null);

  return (
    <Card>
      <CardHeader title="Levels"
        action={<Button size="sm" variant="ghost" aria-label="Add a level"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden />
        </Button>} />
      {rows.isPending && <div className="p-4"><Skeleton className="h-10" /></div>}
      <div className="flex flex-wrap gap-2 p-4">
        {rows.data?.map(l => (
          <button key={l.id} onClick={() => setOpen(l)} className="rounded-full">
            <Badge>{l.name}</Badge>
          </button>
        ))}
        {!rows.isPending && rows.data?.length === 0 &&
          <p className="text-[13px] text-ink-3">Primary, Grade 1, Intermediate — your progression.</p>}
      </div>
      {open && <LevelSheet row={open === 'new' ? null : open} onClose={() => setOpen(null)} />}
    </Card>
  );
}

function LevelSheet({ row, onClose }: { row: S.Level | null; onClose: () => void }) {
  const [name, setName] = React.useState(row?.name ?? '');
  const save = useSetupWrite(row ? S.UPDATE_LEVEL : S.CREATE_LEVEL, onClose);
  const remove = useSetupWrite(S.RETIRE_SETUP, onClose);

  return (
    <RecordSheet title={row ? 'Edit level' : 'New level'} onClose={onClose}
      error={save.error ?? remove.error} saving={save.isPending} canSave={name.trim().length >= 1}
      onSave={() => save.mutate(row ? [row.id, name.trim()] : [name.trim()])}
      onRemove={row ? () => remove.mutate(['level', row.id]) : undefined}
      removing={remove.isPending}
      removeHint={row && row.classes > 0
        ? `${row.classes} class${row.classes === 1 ? '' : 'es'} use this level.` : null}>
      <Field label="Name" htmlFor="level-name" required>
        <Input id="level-name" value={name} onChange={e => setName(e.target.value)}
               placeholder="Grade 4" />
      </Field>
    </RecordSheet>
  );
}

/* ── The demo itself ────────────────────────────────────────────────────── */
function AboutDemo() {
  return (
    <Card>
      <CardHeader title="About this demo" />
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
          <p className="text-[13px] leading-relaxed text-ink-2">
            Everything here lives in a Postgres database running inside this browser tab, built
            from the same migrations the production app uses. Nothing is sent anywhere.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
          <p className="text-[13px] leading-relaxed text-ink-2">
            Row level security is on and forced. Signed in as Marcus, the medical table returns
            no rows at all; signed in as Hannah, you get exactly one family. That is the
            database refusing, not this interface hiding.
          </p>
        </div>
        <ResetDemo />
      </div>
    </Card>
  );
}

function ResetDemo() {
  const [state, setState] = React.useState<'idle' | 'confirm' | 'working'>('idle');
  const run = async () => { setState('working'); await resetDemo(); location.reload(); };

  if (state === 'confirm') {
    return (
      <div className="rounded-[var(--radius-md)] border border-caution/30 bg-caution-soft p-3">
        <p className="text-sm font-medium">Rebuild the demo studio?</p>
        <p className="mt-0.5 text-[13px] text-ink-2">
          Everything you have changed — registers, classes, setup — will be discarded.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setState('idle')}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={run}>Yes, start again</Button>
        </div>
      </div>
    );
  }
  return (
    <Button size="sm" loading={state === 'working'} onClick={() => setState('confirm')}>
      <RotateCcw className="size-4" aria-hidden /> Reset demo data
    </Button>
  );
}
