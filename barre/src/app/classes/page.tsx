'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { GraduationCap, AlertTriangle, Users, Clock, FolderOpen, ChevronRight,
         Plus, Pencil, UserPlus, UserMinus, Sparkles } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { useRows } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { Badge, Button, Card, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { ClassForm } from '@/components/app/class-form';
import {
  EnrolSheet, WithdrawSheet, WaitlistActions, BookTrialSheet,
} from '@/components/app/enrolment-actions';
import { money, ageFrom, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TONES: Record<string, Tone> = { violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

export default function ClassesPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Classes /></Suspense>;
}

function Classes() {
  const rows = useRows<C.ClassRow>(['classes'], C.CLASSES);
  const { selected, select } = useSelection();
  const [adding, setAdding] = React.useState(false);

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
      actions={<Button size="sm" variant="primary" onClick={() => setAdding(true)}>
        <Plus className="size-4" aria-hidden /> New class
      </Button>}>
      <div className="mx-auto max-w-6xl">
        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]' : 'block')}>
          <div className="min-w-0 space-y-4">
            {rows.isLoading && [0,1].map(i => <Card key={i} className="p-4"><Skeleton className="h-24" /></Card>)}
            {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
            {rows.data?.length === 0 && <Card><EmptyState icon={<GraduationCap className="size-5" />}
              title="No classes yet" body="Add a term, then create your first class." /></Card>}
            {byDay.map(([day, list]) => (
              <Card key={day}>
                <div className="flex items-baseline gap-2 border-b border-line px-4 py-2.5">
                  <h2 className="font-semibold">{DAYS[day]}</h2>
                  <span className="ml-auto text-[12.5px] text-ink-3">{list.length} class{list.length === 1 ? '' : 'es'}</span>
                </div>
                <ul className="divide-y divide-line">
                  {list.map(c => <li key={c.id}><ClassLine c={c} active={selected === c.id} onSelect={() => select(c.id)} /></li>)}
                </ul>
              </Card>
            ))}
          </div>
          {selected && <ClassDetail id={selected} rows={rows.data ?? []} onClose={() => select(null)} />}
        </div>
      </div>
      {adding && <ClassForm onClose={() => setAdding(false)} />}
    </Shell>
  );
}

function ClassLine({ c, active, onSelect }: { c: C.ClassRow; active: boolean; onSelect: () => void }) {
  const full = c.enrolled >= c.capacity;
  const nearly = !full && c.enrolled >= c.capacity - 2;
  return (
    <button onClick={onSelect}
      className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2', active && 'bg-accent-soft/50')}>
      <span className="tnum w-[52px] shrink-0 text-sm font-semibold">{c.start_time.slice(0,5)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{c.name}</span>
          {c.style && <Badge tone={TONES[c.colour ?? ''] ?? 'neutral'}>{c.style}</Badge>}
          {full && <Badge tone="caution">Full</Badge>}
          {c.waiting > 0 && <Badge tone="critical">{c.waiting} waiting</Badge>}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-2">
          {[c.teacher, c.room, c.age_min != null ? `Ages ${c.age_min}–${c.age_max}` : null]
            .filter(Boolean).join(' · ')}
        </span>
      </span>
      {/* Capacity is shown as a number and a bar: the bar alone would be
          colour-only information. */}
      <span className="w-24 shrink-0 text-right">
        <span className={cn('tnum text-[13px] font-medium', full ? 'text-caution' : nearly ? 'text-caution' : 'text-ink-2')}>
          {c.enrolled}/{c.capacity}
        </span>
        <span aria-hidden className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-3">
          <span className={cn('block h-full rounded-full', full ? 'bg-caution' : 'bg-accent')}
                style={{ width: `${Math.min(100, c.pct ?? 0)}%` }} />
        </span>
      </span>
    </button>
  );
}

function ClassDetail({ id, rows, onClose }: { id: string; rows: C.ClassRow[]; onClose: () => void }) {
  const c = rows.find(r => r.id === id);
  const [editing, setEditing] = React.useState(false);
  const [enrolling, setEnrolling] = React.useState(false);
  const [trialling, setTrialling] = React.useState(false);
  const [withdrawing, setWithdrawing] = React.useState<
    { id: string; name: string } | null>(null);
  const full = !!c && c.enrolled >= c.capacity;
  const roster = useRows<{ id: string; enrolment_id: string; first_name: string; last_name: string;
                           date_of_birth: string; family_name: string; has_alert: boolean;
                           attendance_pct: number | null }>(
    ['roster', id], C.CLASS_ROSTER, [id]);
  const waitlist = useRows<{ id: string; position: number; status: string; first_name: string;
                             last_name: string; family_name: string }>(
    ['waitlist', id], C.CLASS_WAITLIST, [id]);

  return (
    <DetailPanel open onClose={onClose} title={c?.name ?? 'Class'}
      subtitle={c ? `${DAYS[c.day_of_week]} ${c.start_time.slice(0,5)} · ${c.duration_min} min` : undefined}>
      {c && (
        <>
          <DetailSection title="Class">
            <KeyValue rows={[
              ['Teacher', c.teacher], ['Where', [c.location, c.room].filter(Boolean).join(' · ')],
              ['Ages', c.age_min != null ? `${c.age_min}–${c.age_max}` : '—'],
              ['Price', `${money(c.price_minor)} per term`],
              ['Places', `${c.enrolled} of ${c.capacity}`],
              ['Sessions left', `${c.sessions_left}`],
              ['Trials', c.trials_enabled ? 'Open for trials' : 'Not taking trials'],
            ]} />
          </DetailSection>

          <DetailSection title="Setup">
            <Button className="w-full" onClick={() => setEditing(true)}>
              <Pencil className="size-4" aria-hidden /> Edit this class
            </Button>
            <p className="mt-1.5 text-[12.5px] text-ink-3">
              Day, time, room, teacher, places and price. Moving the class rebuilds
              the sessions nobody has registered yet.
            </p>
          </DetailSection>

          <DetailSection title="Material">
            <Link href={`/class/?id=${c.id}`}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-line px-3 py-2.5
                             text-sm font-medium hover:bg-surface-2">
              <FolderOpen className="size-4 text-ink-3" aria-hidden />
              Videos, music and notes for this class
              <ChevronRight className="ml-auto size-4 text-ink-3" aria-hidden />
            </Link>
          </DetailSection>

          <DetailSection title="Places">
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setEnrolling(true)}>
                <UserPlus className="size-4" aria-hidden /> {full ? 'Waiting list' : 'Enrol'}
              </Button>
              <Button className="flex-1" onClick={() => setTrialling(true)}>
                <Sparkles className="size-4" aria-hidden /> Book a trial
              </Button>
            </div>
            {full && (
              <p className="mt-1.5 text-[12.5px] text-caution">
                Full. New names join the waiting list and are offered the next place automatically.
              </p>
            )}
          </DetailSection>

          <DetailSection title={`Register (${roster.data?.length ?? 0})`}>
            {roster.isLoading && <Skeleton className="h-20" />}
            {roster.data?.length === 0 && <p className="text-sm text-ink-3">Nobody enrolled yet.</p>}
            <ul className="divide-y divide-line rounded-[var(--radius-md)] border border-line">
              {roster.data?.map(s => (
                <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{s.first_name} {s.last_name}</span>
                      {s.has_alert && <AlertTriangle className="size-3.5 shrink-0 text-critical" aria-label="Medical alert" />}
                    </span>
                    <span className="block truncate text-[12px] text-ink-3">{ageFrom(s.date_of_birth)} · {s.family_name}</span>
                  </span>
                  {s.attendance_pct != null && (
                    <span className={cn('tnum shrink-0 text-[12.5px]',
                      s.attendance_pct >= 85 ? 'text-ink-3' : 'font-medium text-caution')}>{s.attendance_pct}%</span>
                  )}
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
              <ol className="divide-y divide-line rounded-[var(--radius-md)] border border-line">
                {waitlist.data!.map(w => (
                  <li key={w.id} className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="tnum grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink-2">
                        {w.position}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{w.first_name} {w.last_name}</span>
                      {w.status === 'offered' && <Badge tone="info">Offered</Badge>}
                      <span className="shrink-0 truncate text-[12px] text-ink-3">{w.family_name}</span>
                    </div>
                    <WaitlistActions entry={w} />
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[12.5px] text-ink-3">
                When a place frees up, the family at position 1 is offered it first.
              </p>
            </DetailSection>
          )}
        </>
      )}
      {editing && <ClassForm classId={id} onClose={() => setEditing(false)} />}
      {enrolling && c && (
        <EnrolSheet classId={id} className={c.name} full={full} onClose={() => setEnrolling(false)} />
      )}
      {trialling && c && (
        <BookTrialSheet classId={id} className={c.name} onClose={() => setTrialling(false)} />
      )}
      {withdrawing && (
        <WithdrawSheet enrolmentId={withdrawing.id} name={withdrawing.name}
                       onClose={() => setWithdrawing(null)} />
      )}
    </DetailPanel>
  );
}
