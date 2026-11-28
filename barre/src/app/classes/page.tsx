'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Pencil, UserMinus, Copy, CalendarPlus, ArrowRightLeft, ArrowUpRight } from 'lucide-react';
import { TimetableAdd, useAddParam } from '@/components/app/timetable-add';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { useRows } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { Beats, Button, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import { SectionHead, StyleMark, ViewTabs, Word } from '@/components/app/session-row';
import * as C from '@/lib/repos/classes';
import { ClassForm } from '@/components/app/class-form';
import { useLocationFilter } from '@/components/app/location-filter';
import { TermRollover, DuplicateClass } from '@/components/app/term-rollover';
import {
  EnrolSheet, WithdrawSheet, WaitlistActions, BookTrialSheet, MoveSheet,
} from '@/components/app/enrolment-actions';
import { money, ageFrom, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function ClassesPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Classes /></Suspense>;
}

function Classes() {
  const all = useRows<C.ClassRow>(['classes'], C.CLASSES);
  const terms = useRows<C.TermRow>(['term-tabs'], C.TERM_TABS);
  const { selected, select } = useSelection();
  const [adding, setAdding] = React.useState(false);
  useAddParam(k => { if (k === 'class') setAdding(true); });
  const [rolling, setRolling] = React.useState(false);
  const [termPick, setTermPick] = React.useState('');
  const termList = (terms.data ?? []).filter(t => t.classes > 0 || t.current);
  const term = termList.find(t => t.id === termPick) ?? termList.find(t => t.current) ?? termList[0];
  const place = useLocationFilter();
  const rows = { ...all, data: all.data?.filter(c => (!term || c.term_id === term.id) && place.keep(c.location)) };

  const byDay = React.useMemo(() => {
    const map = new Map<number, C.ClassRow[]>();
    (rows.data ?? []).forEach(c => map.set(c.day_of_week, [...(map.get(c.day_of_week) ?? []), c]));
    return [...map.entries()].sort((a, b) => ((a[0] + 6) % 7) - ((b[0] + 6) % 7));
  }, [rows.data]);

  const totals = React.useMemo(() => {
    const d = rows.data ?? [];
    const places = d.reduce((n, c) => n + c.capacity, 0);
    const taken = d.reduce((n, c) => n + c.enrolled, 0);
    return { classes: d.length, places, taken, pct: places ? Math.round((taken / places) * 100) : 0 };
  }, [rows.data]);

  return (
    <Shell title="Classes"
      subtitle={rows.data ? `${totals.classes} classes · ${totals.taken} of ${totals.places} places filled (${totals.pct}%)` : undefined}
      allow={['owner', 'admin']}
      actions={<div className="flex gap-2">
        {term && <Button size="sm" aria-label="Start next term" onClick={() => setRolling(true)}>
          <CalendarPlus className="size-4" aria-hidden /> <span className="hidden sm:inline">Start next term</span>
        </Button>}
        {term && <Link href="/reenrolment" aria-label="Re-enrol and move up" className="inline-flex"><Button size="sm" tabIndex={-1} aria-label="Re-enrol and move up">
          <ArrowUpRight className="size-4" aria-hidden /> <span className="hidden sm:inline">Re-enrol and move up</span>
        </Button></Link>}
        <TimetableAdd here="classes" onAdd={() => setAdding(true)} />
      </div>}>
      <div className="mx-auto max-w-[1240px]">
        {(termList.length > 1 || place.control) && (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            {termList.length > 1 ? (
              <ViewTabs label="Term" value={term?.id ?? ''} onChange={id => { setTermPick(id); select(null); }}
                options={termList.map(t => [t.id, `${t.name}${t.current ? ' · now' : ''}`] as [string, string])} />
            ) : <span />}
            {place.control}
          </div>
        )}
        <div className={cn('gap-x-10', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start' : 'block')}>
          <div className="min-w-0 space-y-10">
            {rows.isLoading && <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
            {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
            {rows.data?.length === 0 && <EmptyState title="No classes yet" body="Add a term in Settings, then create your first class."
              action={<Button variant="primary" onClick={() => setAdding(true)}>New class</Button>} />}
            {byDay.map(([day, list]) => (
              <section key={day}>
                <SectionHead title={DAYS[day]} meta={`${list.length} class${list.length === 1 ? '' : 'es'} · ${list.reduce((n, c) => n + c.enrolled, 0)} of ${list.reduce((n, c) => n + c.capacity, 0)} places`} />
                <ul className="divide-y divide-line">
                  {list.map(c => <li key={c.id}><ClassLine c={c} active={selected === c.id} onSelect={() => select(c.id)} /></li>)}
                </ul>
              </section>
            ))}
          </div>
          {selected && <ClassDetail id={selected} rows={rows.data ?? []} onClose={() => select(null)} />}
        </div>
      </div>
      {adding && <ClassForm onClose={() => setAdding(false)} />}
      {rolling && term && <TermRollover fromTerm={term} classes={rows.data ?? []} onClose={() => setRolling(false)} />}
    </Shell>
  );
}

function ClassLine({ c, active, onSelect }: { c: C.ClassRow; active: boolean; onSelect: () => void }) {
  const full = c.enrolled >= c.capacity;
  const nearly = !full && c.enrolled >= c.capacity - 2;
  return (
    <button onClick={onSelect} aria-current={active || undefined}
      className={cn('grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 text-left hover:bg-surface-2/60 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_5rem]',
        active && 'bg-surface-2 shadow-[inset_3px_0_0_var(--color-accent)]')}>
      <span className="font-display text-[1.1875rem] leading-none tnum">{c.start_time.slice(0,5)}</span>
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="truncate font-semibold">{c.name}</span>
          {c.style && <StyleMark colour={c.colour} name={c.style} className="text-[0.8125rem] text-ink-3" />}
        </span>
        <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">
          {[c.teacher, c.room, c.age_min != null ? `Ages ${c.age_max != null ? `${c.age_min}–${c.age_max}` : `${c.age_min}+`}` : null]
            .filter(Boolean).join(' · ')}
        </span>
      </span>
      {/* Capacity as beats and a number: never the meter alone. */}
      <Beats value={c.enrolled} max={c.capacity} tone={full || nearly ? 'caution' : 'accent'} label={`${c.enrolled} of ${c.capacity} places`} className="hidden sm:inline-flex" />
      <span className="text-right leading-tight">
        <span className={cn('block text-[0.8438rem] tnum', full || nearly ? 'font-semibold text-caution' : 'text-ink-2')}>{c.enrolled}/{c.capacity}</span>
        {c.waiting > 0 ? <span className="block text-[0.75rem] font-semibold text-critical">{c.waiting} waiting</span>
          : full ? <span className="block text-[0.75rem] text-caution">Full</span> : null}
      </span>
    </button>
  );
}

function ClassDetail({ id, rows, onClose }: { id: string; rows: C.ClassRow[]; onClose: () => void }) {
  const c = rows.find(r => r.id === id);
  const [editing, setEditing] = React.useState(false);
  const [duplicating, setDuplicating] = React.useState(false);
  const [enrolling, setEnrolling] = React.useState(false);
  const [trialling, setTrialling] = React.useState(false);
  const [moving, setMoving] = React.useState<{ id: string; name: string; age: number | null; family_id: string } | null>(null);
  const [withdrawing, setWithdrawing] = React.useState<
    { id: string; name: string } | null>(null);
  const full = !!c && c.enrolled >= c.capacity;
  const roster = useRows<{ id: string; enrolment_id: string; first_name: string; last_name: string;
                           date_of_birth: string; family_name: string; family_id: string; has_alert: boolean;
                           attendance_pct: number | null; leaving_on: string | null; leaving_to: string | null;
                           joining_on: string | null }>(
    ['roster', id], C.CLASS_ROSTER, [id]);
  const waitlist = useRows<{ id: string; position: number; status: string; first_name: string;
                             last_name: string; family_name: string; date_of_birth: string;
                             offer_expires_at: string | null }>(
    ['waitlist', id], C.CLASS_WAITLIST, [id]);
  const free = useRows<{ free: number; offers: number; offer_days: number }>(['class-free', id], C.CLASS_FREE, [id]).data?.[0];

  return (
    <DetailPanel open onClose={onClose} title={c?.name ?? 'Class'}
      subtitle={c ? `${DAYS[c.day_of_week]} ${c.start_time.slice(0,5)} · ${c.duration_min} min` : undefined}>
      {c && (
        <>
          <DetailSection title="Class">
            <KeyValue rows={[
              ['Teacher', c.teacher], ['Where', [c.location, c.room].filter(Boolean).join(' · ')],
              ['Ages', c.age_min != null ? (c.age_max != null ? `${c.age_min}–${c.age_max}` : `${c.age_min} and over`) : '—'],
              ['Price', `${money(c.price_minor)} per term`],
              ['Places', `${c.enrolled} of ${c.capacity}`],
              ['Sessions left', `${c.sessions_left}`],
              ['Trials', c.trials_enabled ? 'Open for trials' : 'Not taking trials'],
            ]} />
            <Link href={`/class/?id=${c.id}`}
                  className="mt-1 flex min-h-[44px] items-center gap-2 border-t border-line text-[0.875rem] font-semibold text-accent-text hover:underline">
              Videos, music and notes for this class
              <ChevronRight className="ml-auto size-4" aria-hidden />
            </Link>
          </DetailSection>

          <div className="mb-7 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setEnrolling(true)}>{full ? 'Add to waiting list' : 'Enrol a student'}</Button>
            <Button onClick={() => setTrialling(true)}>Book a trial</Button>
            <Button variant="ghost" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden /> Edit</Button>
            <Button variant="ghost" onClick={() => setDuplicating(true)}><Copy className="size-4" aria-hidden /> Duplicate</Button>
          </div>
          {full && (
            <p className="-mt-4 mb-7 text-[0.8125rem] text-ink-2"><Word tone="caution">Full</Word> New names join the waiting list and are offered the next place automatically.</p>
          )}

          <DetailSection title={`Register (${roster.data?.length ?? 0})`}>
            {roster.isLoading && <Skeleton className="h-20" />}
            {roster.data?.length === 0 && <p className="text-sm text-ink-3">Nobody enrolled yet.</p>}
            <ul className="divide-y divide-line">
              {roster.data?.map(s => (
                <li key={s.id} className="flex items-center gap-2 py-1.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[0.875rem] font-medium">{s.first_name} {s.last_name}</span>
                      {s.has_alert && <span className="shrink-0 text-[0.75rem] font-semibold text-critical">Medical</span>}
                    </span>
                    <span className="block truncate text-[0.7812rem] text-ink-3">{ageFrom(s.date_of_birth)} · {s.family_name}
                      {s.leaving_on && ` · moves to ${s.leaving_to ?? 'another class'} ${dateShort(s.leaving_on)}`}
                      {s.joining_on && ` · joins ${dateShort(s.joining_on)}`}</span>
                  </span>
                  {s.attendance_pct != null && (
                    <span className={cn('tnum shrink-0 text-[0.7812rem]',
                      s.attendance_pct >= 85 ? 'text-ink-3' : 'font-medium text-caution')}>{s.attendance_pct}%</span>
                  )}
                  <Button size="sm" variant="ghost"
                    aria-label={`Move ${s.first_name} ${s.last_name} to another class`}
                    onClick={() => setMoving({ id: s.enrolment_id, name: `${s.first_name} ${s.last_name}`,
                      age: ageFrom(s.date_of_birth), family_id: s.family_id })}>
                    <ArrowRightLeft className="size-4" aria-hidden />
                  </Button>
                  <Button size="sm" variant="ghost"
                    aria-label={`Withdraw ${s.first_name} ${s.last_name}`}
                    onClick={() => setWithdrawing({ id: s.enrolment_id,
                      name: `${s.first_name} ${s.last_name}` })}>
                    <UserMinus className="size-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </DetailSection>

          {(waitlist.data?.length ?? 0) > 0 && (
            <DetailSection title={`Waiting list (${waitlist.data!.length})`}>
              <ol className="divide-y divide-line">
                {waitlist.data!.map(w => (
                  <li key={w.id} className="py-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 shrink-0 font-display text-[1.0625rem] tnum">{w.position}</span>
                      <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium">{w.first_name} {w.last_name}
                        <span className="font-normal text-ink-3"> · {ageFrom(w.date_of_birth)}</span></span>
                      {w.status === 'offered' && <Word>Offered</Word>}
                      <span className="shrink-0 truncate text-[0.75rem] text-ink-3">{w.family_name}</span>
                    </div>
                    <WaitlistActions entry={w} free={free} />
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[0.8125rem] text-ink-3">
                When a place frees up, the family at position 1 is offered it first. One offer goes out per free place,
                and an offer lasts {free?.offer_days ?? 3} day{free?.offer_days === 1 ? '' : 's'} before passing to the next family.
              </p>
            </DetailSection>
          )}
        </>
      )}
      {editing && <ClassForm classId={id} onClose={() => setEditing(false)} />}
      {duplicating && c && <DuplicateClass c={c} onClose={() => setDuplicating(false)} />}
      {enrolling && c && (
        <EnrolSheet classId={id} className={c.name} full={full} onClose={() => setEnrolling(false)} />
      )}
      {trialling && c && (
        <BookTrialSheet classId={id} className={c.name} onClose={() => setTrialling(false)} />
      )}
      {moving && c && (
        <MoveSheet enrolmentId={moving.id} studentName={moving.name} age={moving.age} familyId={moving.family_id}
          from={{ id: c.id, name: c.name, price_minor: c.price_minor, pricing: c.pricing }} onClose={() => setMoving(null)} />
      )}
      {withdrawing && (
        <WithdrawSheet enrolmentId={withdrawing.id} name={withdrawing.name}
                       onClose={() => setWithdrawing(null)} />
      )}
    </DetailPanel>
  );
}
