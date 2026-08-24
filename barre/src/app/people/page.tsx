'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Search, AlertTriangle, CameraOff, Users, ChevronRight, Mail, Phone } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { useRows, useRow } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { Badge, Card, Input, EmptyState, Skeleton, ErrorState, Button } from '@/components/ui';
import * as P from '@/lib/repos/people';
import { money, dateShort, ageFrom, initials } from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'families' | 'students' | 'staff';

export default function PeoplePage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><People /></Suspense>;
}

function People() {
  const [tab, setTab] = React.useState<Tab>('families');
  const [q, setQ] = React.useState('');
  const { selected, select } = useSelection();

  return (
    <Shell title="People" allow={['owner', 'admin']}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="People"
               className="inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5">
            {(['families','students','staff'] as Tab[]).map(t => (
              <button key={t} role="tab" aria-selected={tab === t}
                onClick={() => { setTab(t); select(null); }}
                className={cn('min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize',
                  tab === t ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:text-ink')}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <Input value={q} onChange={e => setQ(e.target.value)} className="pl-9"
              placeholder={`Search ${tab}`} aria-label={`Search ${tab}`} type="search" />
          </div>
        </div>

        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]' : 'block')}>
          <div className="min-w-0">
            {tab === 'families' && <FamilyList q={q} selected={selected} onSelect={select} />}
            {tab === 'students' && <StudentList q={q} selected={selected} onSelect={select} />}
            {tab === 'staff' && <StaffList q={q} />}
          </div>
          {selected && tab === 'families' && <FamilyDetail id={selected} onClose={() => select(null)} />}
          {selected && tab === 'students' && <StudentDetail id={selected} onClose={() => select(null)} />}
        </div>
      </div>
    </Shell>
  );
}

/* ── Families ────────────────────────────────────────────────────────────── */
function FamilyList({ q, selected, onSelect }: { q: string; selected: string | null; onSelect: (id: string) => void }) {
  const rows = useRows<P.FamilyRow>(['families'], P.FAMILIES);
  const filtered = React.useMemo(() => (rows.data ?? []).filter(f =>
    !q || `${f.name} ${f.primary_guardian ?? ''} ${f.child_names ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    [rows.data, q]);

  if (rows.isLoading) return <ListSkeleton />;
  if (rows.error) return <ErrorState error={rows.error} onRetry={() => rows.refetch()} />;
  if (filtered.length === 0) return <Card><EmptyState icon={<Users className="size-5" />}
    title={q ? 'No families match that search' : 'No families yet'}
    body={q ? 'Try a child’s first name or a surname.' : 'Families appear here once you add or import them.'} /></Card>;

  return (
    <Card>
      <ul className="divide-y divide-line">
        {filtered.map(f => {
          const owes = Number(f.balance_minor) > 0;
          return (
            <li key={f.id}>
              <button onClick={() => onSelect(f.id)}
                className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2',
                  selected === f.id && 'bg-accent-soft/50')}>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2">
                  {initials(f.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{f.name}</span>
                  <span className="block truncate text-[13px] text-ink-2">
                    {f.primary_guardian}{f.child_names ? ` · ${f.child_names}` : ''}
                  </span>
                </span>
                {f.failed_payments > 0 && <Badge tone="critical">Payment failed</Badge>}
                {owes && f.failed_payments === 0 && <Badge tone="caution">{money(f.balance_minor)} due</Badge>}
                <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function FamilyDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const family = useRow<{ id: string; name: string; address_line1: string; city: string; postcode: string; balance_minor: string; notes: string | null }>(
    ['family', id], P.FAMILY_DETAIL, [id]);
  const guardians = useRows<{ id: string; full_name: string; email: string; phone: string; relationship: string; is_primary: boolean; has_login: boolean }>(
    ['family-guardians', id], P.FAMILY_GUARDIANS, [id]);
  const students = useRows<{ id: string; first_name: string; last_name: string; date_of_birth: string; class_names: string | null; has_alert: boolean }>(
    ['family-students', id], P.FAMILY_STUDENTS, [id]);
  const invoices = useRows<{ id: string; number: string; status: string; total_minor: number; paid_minor: number; due_on: string }>(
    ['family-invoices', id], P.FAMILY_INVOICES, [id]);
  const messages = useRows<{ id: string; subject: string; body: string; sent_at: string }>(
    ['family-messages', id], P.FAMILY_MESSAGES, [id]);

  const f = family.data;
  return (
    <DetailPanel open onClose={onClose} title={f?.name ?? 'Family'}
      subtitle={f ? [f.address_line1, f.city, f.postcode].filter(Boolean).join(', ') : undefined}>
      {family.isLoading && <Skeleton className="h-24" />}
      {f && (
        <>
          <DetailSection title="Account">
            <KeyValue rows={[
              ['Balance', Number(f.balance_minor) > 0
                ? <span className="font-medium text-caution">{money(f.balance_minor)} outstanding</span>
                : <span className="text-positive">Up to date</span>],
            ]} />
          </DetailSection>

          <DetailSection title={`Guardians (${guardians.data?.length ?? 0})`}>
            <ul className="space-y-2">
              {guardians.data?.map(g => (
                <li key={g.id} className="rounded-[var(--radius-md)] border border-line p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.full_name}</span>
                    {g.is_primary && <Badge tone="accent">Primary</Badge>}
                    {g.has_login && <Badge tone="neutral">Has login</Badge>}
                  </div>
                  <div className="mt-1 space-y-0.5 text-[13px] text-ink-2">
                    {g.email && <a href={`mailto:${g.email}`} className="flex items-center gap-1.5 hover:text-ink">
                      <Mail className="size-3.5" aria-hidden />{g.email}</a>}
                    {g.phone && <a href={`tel:${g.phone}`} className="flex items-center gap-1.5 hover:text-ink">
                      <Phone className="size-3.5" aria-hidden />{g.phone}</a>}
                  </div>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title={`Children (${students.data?.length ?? 0})`}>
            <ul className="space-y-2">
              {students.data?.map(s => (
                <li key={s.id} className="rounded-[var(--radius-md)] border border-line p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                    <span className="text-[13px] text-ink-3">{ageFrom(s.date_of_birth)}</span>
                    {s.has_alert && <Badge tone="critical" icon={<AlertTriangle className="size-3" />}>Medical</Badge>}
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-2">{s.class_names ?? 'Not in any class'}</p>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Invoices">
            {invoices.data?.length === 0 && <p className="text-sm text-ink-3">No invoices yet.</p>}
            <ul className="space-y-1.5">
              {invoices.data?.map(i => (
                <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="tnum text-ink-2">{i.number}</span>
                  <span className="tnum">{money(i.total_minor)}</span>
                  <Badge tone={i.status === 'paid' ? 'positive' : i.status === 'part_paid' ? 'caution' : 'critical'}>
                    {i.status === 'part_paid' ? 'Part paid' : i.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Messages">
            {messages.data?.length === 0 && <p className="text-sm text-ink-3">No messages with this family.</p>}
            <ul className="space-y-2">
              {messages.data?.map(m => (
                <li key={m.id} className="rounded-[var(--radius-md)] bg-surface-2 p-3">
                  <p className="text-sm font-medium">{m.subject}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-2">{m.body}</p>
                  <p className="mt-1 text-[12px] text-ink-3">{dateShort(m.sent_at)}</p>
                </li>
              ))}
            </ul>
          </DetailSection>
        </>
      )}
    </DetailPanel>
  );
}

/* ── Students ────────────────────────────────────────────────────────────── */
function StudentList({ q, selected, onSelect }: { q: string; selected: string | null; onSelect: (id: string) => void }) {
  const rows = useRows<P.StudentRow>(['students'], P.STUDENTS);
  const filtered = React.useMemo(() => (rows.data ?? []).filter(s =>
    !q || `${s.first_name} ${s.last_name} ${s.family_name}`.toLowerCase().includes(q.toLowerCase())),
    [rows.data, q]);

  if (rows.isLoading) return <ListSkeleton />;
  if (rows.error) return <ErrorState error={rows.error} />;
  if (filtered.length === 0) return <Card><EmptyState title="No students match that search" /></Card>;

  return (
    <Card>
      <ul className="divide-y divide-line">
        {filtered.map(s => (
          <li key={s.id}>
            <button onClick={() => onSelect(s.id)}
              className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2',
                selected === s.id && 'bg-accent-soft/50')}>
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2">
                {initials(s.first_name, s.last_name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{s.preferred_name ?? s.first_name} {s.last_name}</span>
                  {s.has_alert && <AlertTriangle className="size-3.5 shrink-0 text-critical" aria-label="Has a medical alert" />}
                  {s.photo_consent === false && <CameraOff className="size-3.5 shrink-0 text-ink-3" aria-label="No photo consent" />}
                </span>
                <span className="block truncate text-[13px] text-ink-2">
                  {ageFrom(s.date_of_birth)} · {s.classes} class{s.classes === 1 ? '' : 'es'} · {s.family_name}
                </span>
              </span>
              {s.attendance_pct != null && (
                <Badge tone={s.attendance_pct >= 85 ? 'positive' : s.attendance_pct >= 70 ? 'caution' : 'critical'}>
                  {s.attendance_pct}%
                </Badge>
              )}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StudentDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const rows = useRows<P.StudentRow>(['students'], P.STUDENTS);
  const s = rows.data?.find(r => r.id === id);
  const safety = useRow<{ allergies: string | null; action_plan: string | null; requires_alert: boolean;
                          emergency_contact_name: string | null; emergency_contact_phone: string | null }>(
    ['safety', id], P.STUDENT_SAFETY, [id]);

  return (
    <DetailPanel open onClose={onClose}
      title={s ? `${s.preferred_name ?? s.first_name} ${s.last_name}` : 'Student'}
      subtitle={s ? `${ageFrom(s.date_of_birth)} years old · ${s.family_name}` : undefined}>
      {s && (
        <>
          {safety.data?.requires_alert && (
            <div role="alert" className="mb-5 rounded-[var(--radius-md)] border border-critical/25 bg-critical-soft p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-critical">
                <AlertTriangle className="size-4" aria-hidden /> Medical alert
              </p>
              {safety.data.allergies && <p className="mt-1 text-sm"><strong>Allergies:</strong> {safety.data.allergies}</p>}
              {safety.data.action_plan && <p className="mt-1 text-sm">{safety.data.action_plan}</p>}
            </div>
          )}
          <DetailSection title="Details">
            <KeyValue rows={[
              ['Date of birth', dateShort(s.date_of_birth)],
              ['Family', s.family_name],
              ['Classes', `${s.classes}`],
              ['Attendance', s.attendance_pct != null ? `${s.attendance_pct}%` : '—'],
              ['Photo consent', s.photo_consent === false
                ? <span className="font-medium text-critical">Not given — do not photograph</span>
                : s.photo_consent ? 'Given' : 'Not recorded'],
            ]} />
          </DetailSection>
          {safety.data?.emergency_contact_name && (
            <DetailSection title="Emergency contact">
              <KeyValue rows={[
                ['Name', safety.data.emergency_contact_name],
                ['Phone', safety.data.emergency_contact_phone
                  ? <a className="text-accent hover:underline" href={`tel:${safety.data.emergency_contact_phone}`}>
                      {safety.data.emergency_contact_phone}</a> : '—'],
              ]} />
            </DetailSection>
          )}
        </>
      )}
    </DetailPanel>
  );
}

/* ── Staff ───────────────────────────────────────────────────────────────── */
function StaffList({ q }: { q: string }) {
  const rows = useRows<{ id: string; display_name: string; email: string; phone: string; status: string;
                         bio: string; classes: number; students: number; has_login: boolean }>(['staff'], P.STAFF);
  const filtered = (rows.data ?? []).filter(s => !q || s.display_name.toLowerCase().includes(q.toLowerCase()));
  if (rows.isLoading) return <ListSkeleton />;
  if (filtered.length === 0) return <Card><EmptyState title="No staff match that search" /></Card>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {filtered.map(s => (
        <Card key={s.id} className="p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2">
              {initials(s.display_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{s.display_name}</p>
              <p className="text-[13px] text-ink-2">{s.classes} classes · {s.students} students</p>
            </div>
            {s.status !== 'active' && <Badge tone="neutral">Inactive</Badge>}
          </div>
          {s.bio && <p className="mt-3 text-[13px] text-ink-2">{s.bio}</p>}
          {s.email && <a href={`mailto:${s.email}`} className="mt-2 block truncate text-[13px] text-accent hover:underline">{s.email}</a>}
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return <Card className="divide-y divide-line">
    {[0,1,2,3,4].map(i => <div key={i} className="flex items-center gap-3 p-4">
      <Skeleton className="size-9 rounded-full" />
      <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div>
    </div>)}
  </Card>;
}
