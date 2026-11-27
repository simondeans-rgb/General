'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Plus, Pencil, CalendarOff } from 'lucide-react';
import { StudentLoginAge } from '@/components/app/family-care';
import { Shell } from '@/components/app/shell';
import { FrameworkSettings, ChipSettings } from '@/components/app/progress-settings';
import { PackSettings } from '@/components/app/pack-settings';
import { BankDetailsSettings } from '@/components/app/bank-details';
import { RegisterSettings } from '@/components/app/register-settings';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows, useRow } from '@/lib/query';
import { resetDemo, runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Button, EmptyState, Field, Input, Select,
  Skeleton, ErrorState, type Tone,
} from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import * as S from '@/lib/repos/setup';
import { dateShort, toDateInput } from '@/lib/format';
import { cn } from '@/lib/cn';

const STYLE_TONES: Tone[] = ['violet', 'amber', 'teal', 'rose', 'indigo', 'lime'];
const STYLE_BG: Record<string, string> = { violet: 'bg-violet', amber: 'bg-amber', teal: 'bg-teal', rose: 'bg-rose', indigo: 'bg-indigo', lime: 'bg-lime' };
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

const TABS = [['school', 'School'], ['places', 'Places'], ['terms', 'Terms'], ['teaching', 'Teaching'], ['money', 'Money']] as const;
type Tab = typeof TABS[number][0];

/** Settings in five tabs, so each area is one tap away (R-053). */
export default function StudioSettings() {
  const [tab, setTab] = React.useState<Tab>('school');
  React.useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (TABS.some(t => t[0] === h)) setTab(h as Tab); };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const go = (t: Tab) => { setTab(t); history.replaceState(null, '', `#${t}`); };
  return (
    <Shell title="School settings" subtitle="Everything a timetable is built from"
           allow={['owner', 'admin']}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-8">
        <div role="tablist" aria-label="Settings" className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} aria-controls={`st-panel-${k}`} id={`st-tab-${k}`} onClick={() => go(k)}
              className={cn('-mb-px h-11 shrink-0 border-b-2 px-2 text-[14.5px] sm:px-3', tab === k ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-2 hover:text-ink')}>
              {l}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`st-panel-${tab}`} aria-labelledby={`st-tab-${tab}`} className="space-y-10">
          {tab === 'school' && <><StudioDetails /><WaitlistSettings /><StudentLoginAge /><AboutDemo /></>}
          {tab === 'places' && <><Locations /><Rooms /></>}
          {tab === 'terms' && <Terms />}
          {tab === 'teaching' && <>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2"><Styles /><Levels /></div>
            <FrameworkSettings />
            <ChipSettings />
            <RegisterSettings />
          </>}
          {tab === 'money' && <><BankDetailsSettings /><PackSettings /></>}
        </div>
      </div></div>
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
      {studio.isPending && <div className="pt-3"><Skeleton className="h-14" /></div>}
      {s && (
        <dl className="grid grid-cols-1 gap-x-6 divide-y divide-line text-[14.5px] sm:grid-cols-2 sm:divide-y-0">
          <Fact label="Name" value={s.name} />
          <Fact label="Timezone" value={s.timezone} />
          <Fact label="Email" value={s.contact_email ?? 'Not set'} />
          <Fact label="Phone" value={s.contact_phone ?? 'Not set'} />
          <Fact label="Privacy notice" value={s.privacy_notice_url ?? 'Not set — add it for your public booking page'} />
        </dl>
      )}
      {!isOwner && (
        <p className="pt-3 text-[13px] text-ink-3">
          Only the studio owner can change these. Administrators run everything else.
        </p>
      )}
      {editing && s && <StudioSheet studio={s} onClose={() => setEditing(false)} />}
    </Card>
  );
}

/** One setting: how long a family has to answer a waiting-list offer (UR-19). */
function WaitlistSettings() {
  const { session } = useSession();
  const row = useRow<{ id: string; waitlist_offer_days: number }>(['waitlist-setting'], S.WAITLIST_SETTING);
  const [days, setDays] = React.useState<string>('');
  const [saved, setSaved] = React.useState(false);
  const save = useSetupWrite(S.SET_WAITLIST_DAYS, () => setSaved(true));
  const isOwner = session?.role === 'owner';
  React.useEffect(() => { if (row.data && days === '') setDays(String(row.data.waitlist_offer_days)); }, [row.data, days]);
  const n = Number(days);
  const ok = Number.isInteger(n) && n >= 1 && n <= 30;
  return (
    <Card>
      <CardHeader title="Waiting lists" subtitle="One offer goes out for each free place" />
      {row.isPending && <div className="pt-3"><Skeleton className="h-14" /></div>}
      {row.data && (
        <div className="flex flex-wrap items-end gap-3 pt-3">
          <Field label="Offers stay open for" htmlFor="wl-days"
                 hint="Days. Then the offer lapses and the place goes to the next family." error={days && !ok ? 'Between 1 and 30 days.' : undefined}>
            <Input id="wl-days" type="number" inputMode="numeric" min={1} max={30} className="w-28" disabled={!isOwner}
                   value={days} onChange={e => { setDays(e.target.value); setSaved(false); }} />
          </Field>
          {isOwner && <Button size="sm" disabled={!ok || n === row.data.waitlist_offer_days} loading={save.isPending}
                              onClick={() => save.mutate([row.data!.id, n])}>{saved ? 'Saved' : 'Save'}</Button>}
        </div>
      )}
      {save.error != null && <div className="pt-3"><ErrorState error={save.error} /></div>}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-3 sm:border-b sm:border-line">
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{value}</dd>
    </div>
  );
}

function StudioSheet({ studio, onClose }: { studio: S.StudioRow; onClose: () => void }) {
  const [name, setName] = React.useState(studio.name);
  const [tz, setTz] = React.useState(studio.timezone);
  const [email, setEmail] = React.useState(studio.contact_email ?? '');
  const [phone, setPhone] = React.useState(studio.contact_phone ?? '');
  const [privacy, setPrivacy] = React.useState(studio.privacy_notice_url ?? '');
  const save = useSetupWrite(S.UPDATE_STUDIO, onClose);

  return (
    <RecordSheet title="Studio details" onClose={onClose} error={save.error}
      saving={save.isPending} canSave={name.trim().length >= 2 && (!privacy.trim() || /^https?:\/\//.test(privacy.trim()))}
      onSave={() => save.mutate([studio.id, name.trim(), tz, email, phone, privacy])}>
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
      <Field label="Privacy notice link" htmlFor="st-privacy"
             hint="Shown on your public booking page, where families give their details.">
        <Input id="st-privacy" type="url" value={privacy} onChange={e => setPrivacy(e.target.value)}
               placeholder="https://yourstudio.co.uk/privacy" />
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
        action={<Button size="sm" aria-label="Add a location"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="pt-3"><Skeleton className="h-16" /></div>}
      {rows.error && <div className="pt-3"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState title="No locations yet"
          body="Add the building your classes run in. Rooms go inside it." />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(l => (
          <li key={l.id}>
            <button onClick={() => setOpen(l)}
              className="flex min-h-12 w-full items-baseline gap-3 py-3 text-left hover:bg-surface-2/60">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.name}</span>
                <span className="block text-[13px] text-ink-3">
                  {[l.address_line1, l.city, l.postcode].filter(Boolean).join(', ') || 'No address'}
                </span>
              </span>
              <span className="tnum shrink-0 text-[13px] text-ink-2">
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
        action={<Button size="sm" disabled={!hasLocation}
                        aria-label="Add a room" onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="pt-3"><Skeleton className="h-14" /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState title="No rooms yet"
          body={hasLocation ? 'Add a room to a location.' : 'Add a location first — rooms live inside one.'} />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(r => (
          <li key={r.id}>
            <button onClick={() => setOpen(r)}
              className="flex min-h-12 w-full items-baseline gap-3 py-3 text-left hover:bg-surface-2/60">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.name}</span>
                <span className="block text-[13px] text-ink-3">{r.location}</span>
              </span>
              <span className="tnum shrink-0 text-[13px] text-ink-2">
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
        action={<Button size="sm" aria-label="Add a term"
                        onClick={() => setOpen('new')}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>} />
      {rows.isPending && <div className="pt-3"><Skeleton className="h-14" /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState title="No terms yet"
          body="A class needs a term: it is what tells the generator which weeks to lay down." />
      )}
      <ul className="divide-y divide-line">
        {rows.data?.map(t => (
          <li key={t.id} className="flex min-h-14 items-center gap-3 py-2">
            <button onClick={() => setOpen(t)} className="min-w-0 flex-1 py-1 text-left hover:underline">
              <span className="block font-semibold">{t.name}</span>
              <span className="block text-[13px] text-ink-3">
                {dateShort(t.starts_on)} – {dateShort(t.ends_on)} · {t.classes} classes
              </span>
            </button>
            <span className={cn('text-[13px] font-semibold', t.status === 'published' ? 'text-positive' : 'text-ink-3')}>
              {t.status === 'published' ? 'Live' : t.status === 'draft' ? 'Draft' : 'Archived'}
            </span>
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
  const [from, setFrom] = React.useState(toDateInput(row?.starts_on));
  const [to, setTo] = React.useState(toDateInput(row?.ends_on));
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
        <ul className="divide-y divide-line border-y border-line">
          {rows.data!.map(b => (
            <li key={b.id} className="flex items-center gap-2 py-2">
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
      {rows.isPending && <div className="pt-3"><Skeleton className="h-10" /></div>}
      <div className="flex flex-wrap gap-2 pt-3">
        {rows.data?.map(s => (
          <button key={s.id} onClick={() => setOpen(s)} aria-label={`Edit ${s.name}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[14px] font-medium hover:border-ink-3">
            <span aria-hidden className={cn('size-2.5 rounded-[2px]', STYLE_BG[s.colour] ?? 'bg-ink-3')} />{s.name}
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
        <span className="text-[13px] text-ink-3">Preview</span>
        <span className="inline-flex items-center gap-2 text-[14px] font-medium"><span aria-hidden className={cn('size-2.5 rounded-[2px]', STYLE_BG[colour] ?? 'bg-ink-3')} />{name.trim() || 'Style'}</span>
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
      {rows.isPending && <div className="pt-3"><Skeleton className="h-10" /></div>}
      <div className="flex flex-wrap gap-2 pt-3">
        {rows.data?.map(l => (
          <button key={l.id} onClick={() => setOpen(l)} aria-label={`Edit ${l.name}`}
            className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[14px] font-medium hover:border-ink-3">
            {l.name}
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
      <div className="max-w-2xl space-y-3 pt-3">
        <p className="text-[14px] leading-relaxed text-ink-2">
          This demo runs a real database inside your browser, with the same rules as the live product. Nothing is sent anywhere.
        </p>
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
      <div className="border-l-2 border-caution py-1 pl-3">
        <p className="text-sm font-semibold">Rebuild the demo school?</p>
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
