'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { Notice } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/cn';

/* Location-scoped roles (UR-33). Only a school with more than one location
   sees any of this; with one, nothing on screen changes. */

const LOCATIONS = `select id, name from location where deleted_at is null order by name`;
const SCOPES = `select membership_id, location_id from membership_location`;
const SET = `select app.set_member_locations($1, $2::uuid[])`;
/** The caller's own limit, if every staff role they hold is limited. */
const MINE = `select l.name from app.my_location_scope() s join location l on l.id = s.location_id order by l.name`;
const MY_ADMIN_LIMIT = `select app.is_scoped_admin(s.id) as limited from studio s where s.deleted_at is null order by s.created_at limit 1`;

export type Loc = { id: string; name: string };

/** Locations, and who is limited to which. */
export function useRoleScopes() {
  const locations = useRows<Loc>(['scope-locations'], LOCATIONS);
  const scopes = useRows<{ membership_id: string; location_id: string }>(['member-scopes'], SCOPES);
  const list = locations.data ?? [];
  const byMember = React.useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of scopes.data ?? []) m.set(s.membership_id, [...(m.get(s.membership_id) ?? []), s.location_id]);
    return m;
  }, [scopes.data]);
  const names = (ids: string[]) => list.filter(l => ids.includes(l.id)).map(l => l.name);
  return { locations: list, multi: list.length > 1, scopeOf: (membershipId: string) => byMember.get(membershipId) ?? [], names };
}

/** What someone can actually do, in a line: their role, narrowed by any limit. */
export function effectiveAccess(role: string, places: string[]): string {
  const at = places.length ? `${places.join(' and ')} only` : 'every location';
  switch (role) {
    case 'owner': return 'Everything, at every location';
    case 'admin': return places.length
      ? `${at}: sees the families with a child there, their classes, registers, invoices and reports. Read-only — changes, billing, imports and invitations stay with an owner`
      : 'Day-to-day running at every location: people, classes, billing, messages';
    case 'teacher': return places.length
      ? `Their own classes and registers; sees the timetable at ${at}`
      : 'Their own classes and registers; sees the whole timetable';
    default: return '';
  }
}

/** The owner's control: which locations this administrator or teacher covers. */
export function ScopeButton({ membershipId, name, role, scope, locations }: {
  membershipId: string; name: string; role: string; scope: string[]; locations: Loc[];
}) {
  const [open, setOpen] = React.useState(false);
  const label = scope.length ? locations.filter(l => scope.includes(l.id)).map(l => l.name).join(', ') : 'Every location';
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={`Locations for ${name}: ${label}`}
        className="inline-flex min-h-[36px] max-w-[200px] items-center gap-1.5 rounded-[var(--radius-md)] border border-line px-2.5 text-[0.8125rem] hover:bg-surface-2">
        <MapPin className="size-3.5 shrink-0 text-ink-3" aria-hidden /> <span className="truncate">{label}</span>
      </button>
      {open && <ScopeSheet membershipId={membershipId} name={name} role={role} scope={scope} locations={locations} onClose={() => setOpen(false)} />}
    </>
  );
}

function ScopeSheet({ membershipId, name, role, scope, locations, onClose }: {
  membershipId: string; name: string; role: string; scope: string[]; locations: Loc[]; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [limited, setLimited] = React.useState(scope.length > 0);
  const [picked, setPicked] = React.useState<string[]>(scope);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(SET, [membershipId, limited ? picked : []])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  const places = limited ? locations.filter(l => picked.includes(l.id)).map(l => l.name) : [];
  return (
    <RecordSheet title={`Where ${name} works`} subtitle={role === 'admin' ? 'Administrator' : 'Teacher'}
      onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error}
      canSave={!limited || picked.length > 0} saveHint={limited && !picked.length ? 'Choose at least one location' : null}>
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-2">Locations</legend>
        {[[false, 'Every location', 'Including any you add later'], [true, 'Only some locations', 'Choose them below']].map(([v, l, d]) => (
          <label key={String(v)} className={cn('flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-2.5',
            limited === v ? 'border-accent-line bg-accent-soft/50' : 'border-line hover:bg-surface-2')}>
            <input type="radio" name="scope" checked={limited === v} onChange={() => setLimited(v as boolean)} className="mt-1 accent-[var(--color-accent)]" />
            <span><span className="block text-sm font-medium">{l as string}</span><span className="block text-[0.7812rem] text-ink-2">{d as string}</span></span>
          </label>
        ))}
      </fieldset>
      {limited && (
        <fieldset className="space-y-1">
          <legend className="sr-only">Which locations</legend>
          {locations.map(l => (
            <label key={l.id} className="flex min-h-[44px] items-center gap-2 text-[0.875rem]">
              <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={picked.includes(l.id)}
                onChange={e => setPicked(p => e.target.checked ? [...p, l.id] : p.filter(x => x !== l.id))} />
              {l.name}
            </label>
          ))}
        </fieldset>
      )}
      <div className="border-l-2 border-ink pl-3">
        <p className="text-[0.8125rem] font-semibold">What {name.split(' ')[0]} can do</p>
        <p className="text-[0.8438rem] text-ink-2">{effectiveAccess(role, places)}.</p>
      </div>
    </RecordSheet>
  );
}

/** A line for a limited administrator, on the office screens, so an empty
 *  list is never mistaken for an empty school. */
export function ScopeNotice() {
  const { session } = useSession();
  const admin = session?.role === 'admin' && !session.platform;
  const limited = useRows<{ limited: boolean }>(['my-admin-limit'], MY_ADMIN_LIMIT, [], { enabled: admin });
  const mine = useRows<{ name: string }>(['my-location-scope'], MINE, [], { enabled: admin && !!limited.data?.[0]?.limited });
  if (!admin || !limited.data?.[0]?.limited || !mine.data?.length) return null;
  return (
    <Notice word="Limited" tone="accent" className="mx-auto mb-6 max-w-[1240px]"
      title={`You see ${mine.data.map(m => m.name).join(' and ')} only`}
      detail="Families with a child in a class there, their classes, registers, invoices and reports. Changes, billing, imports and invitations are made by an owner." />
  );
}
