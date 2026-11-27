'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import { Button, ErrorState, Input, SectionHead, Skeleton, Word } from '@/components/ui';
import * as A from '@/lib/repos/agenda';
import { time, isoDate, relativeDay, dateShort, dayName } from '@/lib/format';
import { cn } from '@/lib/cn';

type School = { studio_id: string; name: string; roles: Role[] };
const ORDER: Role[] = ['teacher', 'admin', 'owner'];

/** True when this person teaches or works at two or more schools. */
export function useStaffSchools() {
  const { session } = useSession();
  const q = useRows<School>(['staff-schools'], A.MY_STAFF_SCHOOLS, [], { enabled: !!session && !session.platform });
  return q.data ?? [];
}

/**
 * "My week across schools" (UR-47): only the teacher's own classes, from every
 * school she works at, in time order with the school on each row. A school
 * that shares busy times only shows "Busy"; one that opts out is not here.
 * Opening a row switches to that school first, so the register and the
 * children's details are read there, as they always are.
 */
export function CrossSchoolAgenda() {
  const { session, chooseSchool } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const schools = useStaffSchools();
  const [from, to] = React.useMemo(() => {
    const f = new Date(); f.setHours(0, 0, 0, 0);
    return [f.toISOString(), new Date(f.getTime() + 14 * 86400_000).toISOString()];
  }, []);
  const rows = useRows<A.AgendaRow>(['my-agenda', from], A.MY_AGENDA, [from, to]);

  const open = (r: A.AgendaRow) => {
    const href = `/teach/register/?session=${r.session_id}`;
    if (r.studio_id !== session?.studio) {
      const s = schools.find(x => x.studio_id === r.studio_id);
      const role = ORDER.find(x => s?.roles.includes(x)) ?? 'teacher';
      chooseSchool(r.studio_id, session?.role && s?.roles.includes(session.role) ? session.role : role);
      qc.invalidateQueries();
    }
    router.push(href);
  };

  const days = React.useMemo(() => {
    const m = new Map<string, A.AgendaRow[]>();
    for (const r of rows.data ?? []) {
      const k = isoDate(r.starts_at);
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    return [...m.entries()];
  }, [rows.data]);
  const clashes = (rows.data ?? []).filter(r => r.clash).length;

  return (
    <div className="mx-auto max-w-[760px] space-y-8">
      <div>
        <p className="text-[0.9062rem] text-ink-2">
          Your classes at every school for the next two weeks. Only you see this. Each school chooses whether its classes
          show here in full or as busy times.
        </p>
        {clashes > 0 && (
          <p className="mt-2 text-[0.9062rem]"><Word tone="critical" size="md">Clash</Word>{' '}
            <span className="font-semibold">{clashes} class{clashes === 1 ? '' : 'es'}</span> overlap, or leave too little time to travel.</p>
        )}
      </div>

      {rows.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
      {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
      {rows.data?.length === 0 && <p className="py-3 text-[0.9062rem] text-ink-3">Nothing on at any school for two weeks.</p>}

      {days.map(([day, list]) => (
        <section key={day} aria-labelledby={`ag-${day}`}>
          <SectionHead id={`ag-${day}`} title={dayTitle(list[0]!.starts_at)} meta={`${list.length} class${list.length === 1 ? '' : 'es'}`} />
          <ul className="divide-y divide-line">
            {list.map(r => <li key={r.session_id}><AgendaItem r={r} onOpen={() => open(r)} /></li>)}
          </ul>
        </section>
      ))}

      <TravelSetting />
    </div>
  );
}

const dayTitle = (v: A.AgendaRow['starts_at']) => {
  const r = relativeDay(v);
  return `${/^\d/.test(r) ? dayName(v) : r} ${dateShort(v)}`;
};

function AgendaItem({ r, onOpen }: { r: A.AgendaRow; onOpen: () => void }) {
  const busy = r.detail === 'busy';
  const off = r.status === 'cancelled' || r.status === 'covered';
  const word: [string, 'critical' | 'caution' | 'muted' | 'ink'] | null =
    r.status === 'cancelled' ? ['Cancelled', 'critical']
    : r.status === 'covered' ? ['Covered', 'muted']
    : r.clash ? ['Clash', 'critical']
    : r.status === 'moved' ? ['Moved', 'caution']
    : r.covering ? ['Cover', 'ink']
    : null;
  const place = [r.location, r.room].filter(Boolean).join(' · ');
  const label = `${busy ? 'Busy' : r.class_name}, ${r.school_name}, ${dayTitle(r.starts_at)} ${time(r.starts_at)} to ${time(r.ends_at)}`
    + (word ? `, ${word[0]}` : '') + (r.clash && r.clash_with ? ` with ${r.clash_with}` : '');
  return (
    <button type="button" onClick={onOpen} aria-label={`${label}. Open at ${r.school_name}`}
      className="grid min-h-14 w-full grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[var(--radius-sm)] py-3 text-left hover:bg-surface-2/60">
      <span className={cn('leading-tight tnum', off && 'text-ink-3')}>
        <span className={cn('block font-display text-[1.1875rem]', off && 'line-through')}>{time(r.starts_at)}</span>
        <span className="block text-[0.7812rem] text-ink-3">to {time(r.ends_at)}</span>
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate font-semibold', (off || busy) && 'text-ink-3')}>{busy ? 'Busy' : r.class_name}</span>
        <span className="block truncate text-[0.8125rem] text-ink-3">
          {word && <><Word tone={word[1]}>{word[0]}</Word><span aria-hidden> · </span></>}
          <span className="font-medium text-ink-2">{r.school_name}</span>
          {place && <> · {place}</>}
          {r.clash && r.clash_with && <> · with {r.clash_with}</>}
          {r.has_handover && <> · handover note</>}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
    </button>
  );
}

/** The teacher's own travel time between schools, used for clashes. */
function TravelSetting() {
  const { session } = useSession();
  const qc = useQueryClient();
  const saved = useRows<{ minutes: number | null }>(['agenda-travel'], A.MY_TRAVEL).data?.[0]?.minutes;
  const [v, setV] = React.useState<string | null>(null);
  React.useEffect(() => { if (saved != null && v == null) setV(String(saved)); }, [saved, v]);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(A.SET_TRAVEL, [Number(v)])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (v == null) return null;
  const n = Number(v);
  const ok = v !== '' && Number.isInteger(n) && n >= 0 && n <= 240;
  return (
    <section aria-labelledby="ag-travel" className="border-t border-line pt-6">
      <h2 id="ag-travel" className="section-title">Travel between schools</h2>
      <p className="mt-1 text-[0.8125rem] text-ink-3">Classes at different schools closer together than this are marked as a clash. The office arranging cover sees the same.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[0.9062rem]">
          <Input type="number" min={0} max={240} value={v} onChange={e => setV(e.target.value)} className="w-24" aria-label="Travel time between schools, minutes" />
          minutes
        </label>
        <Button size="sm" variant="primary" disabled={!ok || n === saved} loading={save.isPending} onClick={() => save.mutate()}>Save</Button>
      </div>
      {save.error != null && <ErrorState error={save.error} />}
    </section>
  );
}
