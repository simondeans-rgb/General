'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Search, CameraOff, Plus, Pencil, HeartPulse, UserPlus, Upload, ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ImportWizard } from '@/components/app/import-wizard';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { ImportedInvoices, EarlierAttendance } from '@/components/app/imported-history';
import { FamilyAccount } from '@/components/app/family-account';
import { BillingSplit } from '@/components/app/billing-split';
import { invoiceState } from '@/lib/payments/invoice-status';
import { useRows, useRow } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { MedicalBrief, MedicalMarker } from '@/components/app/medical-brief';
import { OfficeConsents } from '@/components/app/consents';
import { ChildConcernLinks, RaiseConcernSheet } from '@/components/app/safeguarding';
import type { Brief } from '@/lib/repos/teaching';
import { useSearchParams } from 'next/navigation';
import { Input, EmptyState, Skeleton, ErrorState, Button, Select } from '@/components/ui';
import { ViewTabs, Word } from '@/components/app/session-row';
import * as P from '@/lib/repos/people';
import {
  FamilySheet, GuardianSheet, StudentSheet, MedicalSheet, StaffSheet,
} from '@/components/app/people-sheets';
import { money, dateShort, ageFrom } from '@/lib/format';
import { RecordHistory } from '@/components/app/record-history';
import { MoveSheet, usePipeline } from '@/components/app/enrolment-actions';
import * as C from '@/lib/repos/classes';
import { ArrowRightLeft, MessageSquare } from 'lucide-react';
import { BulkMessageSheet, DuplicatesSheet } from '@/components/app/family-tools';
import * as H from '@/lib/repos/office';
import { cn } from '@/lib/cn';
import { dateWithYear } from '@/lib/office-words';

type Tab = 'families' | 'students' | 'staff';

export default function PeoplePage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><People /></Suspense>;
}

function People() {
  // Links from elsewhere (a notification, the inbox) can open a tab directly.
  const params = useSearchParams();
  const asked = params.get('tab');
  const [tab, setTab] = React.useState<Tab>(
    asked === 'students' || asked === 'staff' ? asked : 'families');
  const [q, setQ] = React.useState('');
  const { selected, select } = useSelection();

  const [adding, setAdding] = React.useState(false);
  const [importing, setImporting] = React.useState(params.get('import') === '1');
  const ADD_LABEL: Record<Tab, string> = {
    families: 'New family', students: 'Add a child', staff: 'Add a teacher' };

  return (
    <Shell title="People" help={<>Families, students and staff. Import a spreadsheet to get started, then invite families to the app. For the children they teach, teachers see allergies, conditions, medication, the emergency plan, emergency contacts and photo consent — never the family doctor or the rest of the record.</>} allow={['owner', 'admin']}
      actions={<div className="flex gap-2">
        {tab !== 'staff' && <Button size="sm" aria-label="Import" onClick={() => setImporting(true)}>
          <Upload className="size-4" aria-hidden /> <span className="hidden sm:inline">Import</span>
        </Button>}
        <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden /> {ADD_LABEL[tab]}
        </Button>
      </div>}>
      {importing && <ImportWizard onClose={() => setImporting(false)} />}
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-line">
          <ViewTabs label="People" value={tab} onChange={t => { setTab(t); select(null); }} className="-mb-px"
            options={[['families', 'Families'], ['students', 'Students'], ['staff', 'Staff']]} />
          <div className="relative mb-2 min-w-[220px] flex-1 sm:max-w-sm sm:ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <Input value={q} onChange={e => setQ(e.target.value)} className="pl-9"
              placeholder={`Search ${tab}`} aria-label={`Search ${tab}`} type="search" />
          </div>
        </div>

        <div className={cn('gap-x-10', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start' : 'block')}>
          <div className="min-w-0">
            {tab === 'families' && <FamilyList q={q} selected={selected} onSelect={select} />}
            {tab === 'students' && <StudentList q={q} selected={selected} onSelect={select} />}
            {tab === 'staff' && <StaffList q={q} />}
          </div>
          {selected && tab === 'families' && <FamilyDetail id={selected} onClose={() => select(null)} />}
          {selected && tab === 'students' && <StudentDetail id={selected} onClose={() => select(null)} />}
        </div>
      </div>

      {adding && tab === 'families' && <FamilySheet row={null} onClose={() => setAdding(false)} />}
      {adding && tab === 'students' && <StudentSheet row={null} onClose={() => setAdding(false)} />}
      {adding && tab === 'staff' && <StaffSheet row={null} onClose={() => setAdding(false)} />}
    </Shell>
  );
}

/* ── Families ────────────────────────────────────────────────────────────── */
type FamilyFilter = { cls: string; who: '' | 'owes' | 'app' | 'no_app' | 'prospect' };
const WHO_LABEL: Record<FamilyFilter['who'], string> = {
  '': 'All families', owes: 'Owe money', app: 'Use the app', no_app: 'Not using the app yet', prospect: 'Prospects (trial only)' };

function FamilyList({ q, selected, onSelect }: { q: string; selected: string | null; onSelect: (id: string) => void }) {
  const rows = useRows<P.FamilyRow>(['families'], P.FAMILIES);
  const facts = useRows<H.FamilyFacts>(['family-facts'], H.FAMILY_FACTS);
  const classes = useRows<{ id: string; name: string }>(['class-options'], C.CLASS_OPTIONS);
  const dups = useRows<H.Duplicate>(['family-duplicates'], H.FAMILY_DUPLICATES);
  const [filter, setFilter] = React.useState<FamilyFilter>({ cls: '', who: '' });
  const [messaging, setMessaging] = React.useState(false);
  const [reviewing, setReviewing] = React.useState(false);
  const factBy = React.useMemo(() => new Map((facts.data ?? []).map(f => [f.id, f])), [facts.data]);
  const filtered = React.useMemo(() => (rows.data ?? []).filter(f => {
    if (q && !`${f.name} ${f.primary_guardian ?? ''} ${f.child_names ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
    const x = factBy.get(f.id);
    if (filter.cls && !x?.class_ids.includes(filter.cls)) return false;
    if (filter.who === 'owes' && !(Number(f.balance_minor) > 0)) return false;
    if (filter.who === 'app' && !x?.has_login) return false;
    if (filter.who === 'no_app' && x?.has_login) return false;
    if (filter.who === 'prospect' && !x?.is_prospect) return false;
    return true;
  }), [rows.data, q, filter, factBy]);
  const filtering = !!(q || filter.cls || filter.who);
  const filterLabel = [filter.cls ? `in ${classes.data?.find(c => c.id === filter.cls)?.name ?? 'a class'}` : null,
    filter.who ? WHO_LABEL[filter.who].toLowerCase() : null, q ? `matching “${q}”` : null].filter(Boolean).join(', ') || 'every family';

  if (rows.isLoading) return <ListSkeleton />;
  if (rows.error) return <ErrorState error={rows.error} onRetry={() => rows.refetch()} />;

  return (
    <div>
      {!!dups.data?.length && (
        <p className="mb-3 border-l-2 border-caution py-1 pl-3 text-[0.875rem]">
          <span className="font-semibold">{dups.data.length} possible duplicate famil{dups.data.length === 1 ? 'y' : 'ies'}.</span>{' '}
          <button className="font-semibold text-accent-text hover:underline" onClick={() => setReviewing(true)}>Review</button>
        </p>
      )}
      {reviewing && <DuplicatesSheet onClose={() => setReviewing(false)} />}
      {/* Filter, then act on everyone the filter shows (UR-46). */}
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <Select aria-label="Filter by class" value={filter.cls} className="h-10 w-auto min-w-0 max-w-[14rem] text-[0.875rem]"
                onChange={e => setFilter(f => ({ ...f, cls: e.target.value }))}>
          <option value="">Any class</option>
          {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select aria-label="Filter families" value={filter.who} className="h-10 w-auto min-w-0 text-[0.875rem]"
                onChange={e => setFilter(f => ({ ...f, who: e.target.value as FamilyFilter['who'] }))}>
          {Object.entries(WHO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Button size="sm" className="sm:ml-auto" disabled={filtered.length === 0} onClick={() => setMessaging(true)}>
          <MessageSquare className="size-4" aria-hidden /> Message {filtering ? `these ${filtered.length}` : `all ${filtered.length}`}
        </Button>
      </div>
      {messaging && <BulkMessageSheet families={filtered.map(f => ({ id: f.id, name: f.name }))} filterLabel={filterLabel}
                                      onClose={() => setMessaging(false)} />}
      {filtered.length === 0 && <EmptyState
        title={filtering ? 'No families match' : 'No families yet'}
        body={filtering ? 'Try a child’s first name, a surname, or fewer filters.' : 'Families appear here once you add or import them.'} />}
      {filtered.length > 0 && <>
      <div aria-hidden className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_8rem] gap-x-4 border-b-2 border-ink px-1 pb-2 md:grid">
        <span className="label">Family</span><span className="label">Children</span><span className="label text-right">Balance</span>
      </div>
      <p className="px-1 pt-2 text-[0.8125rem] text-ink-3 md:hidden">{filtered.length} famil{filtered.length === 1 ? 'y' : 'ies'}</p>
      <ul className="divide-y divide-line border-b border-line">
        {filtered.map(f => {
          const owes = Number(f.balance_minor) > 0;
          return (
            <li key={f.id}>
              <button onClick={() => onSelect(f.id)} aria-current={selected === f.id || undefined}
                className={cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 text-left transition-colors hover:bg-surface-2/60 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_8rem]',
                  selected === f.id && 'bg-surface-2 shadow-[inset_3px_0_0_var(--color-accent)]')}>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{f.name}</span>
                  <span className="block truncate text-[0.8125rem] text-ink-3">{f.primary_guardian}<span className="md:hidden">{f.child_names ? ` · ${f.child_names}` : ''}</span></span>
                </span>
                <span className="hidden truncate text-[0.875rem] text-ink-2 md:block">{f.child_names ?? <span className="text-ink-3">No children yet</span>}</span>
                <span className="text-right text-[0.875rem] tnum">
                  {f.failed_payments > 0 ? <span className="font-semibold text-critical">Payment failed</span>
                    : owes ? <span className="font-semibold text-caution">{money(f.balance_minor)}<span className="block text-[0.75rem] font-normal">due</span></span>
                    : <span className="text-ink-3" aria-label="Paid up">—</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      </>}
    </div>
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

  const [editing, setEditing] = React.useState(false);
  const [guardian, setGuardian] = React.useState<any | 'new' | null>(null);
  const [child, setChild] = React.useState<'new' | null>(null);

  const f = family.data;
  return (
    <DetailPanel open onClose={onClose} title={f?.name ?? 'Family'}
      subtitle={f ? [f.address_line1, f.city, f.postcode].filter(Boolean).join(', ') : undefined}>
      {family.isLoading && <Skeleton className="h-24" />}
      {f && (
        <>
          <DetailSection title="Account">
            <FamilyAccount familyId={f.id} />
            <BillingSplit familyId={f.id} />
            {f.notes && <p className="mt-2 border-l-2 border-line-strong pl-3 text-[0.875rem] text-ink-2">{f.notes}</p>}
            <Button size="sm" variant="ghost" className="-ml-2 mt-2" onClick={() => setEditing(true)}>
              <Pencil className="size-4" aria-hidden /> Edit family
            </Button>
          </DetailSection>

          <DetailSection title={`Guardians (${guardians.data?.length ?? 0})`}
            action={<Button size="sm" variant="ghost" onClick={() => setGuardian('new')}><UserPlus className="size-4" aria-hidden /> Add</Button>}>
            <ul className="divide-y divide-line">
              {guardians.data?.map(g => (
                <li key={g.id} className="flex items-start gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.full_name}</p>
                    {(g.is_primary || g.has_login) && <p className="text-[0.8125rem] text-ink-3">{[g.is_primary && 'Primary contact', g.has_login && 'Uses the app'].filter(Boolean).join(' · ')}</p>}
                    {g.email && <a href={`mailto:${g.email}`} className="block truncate text-[0.8438rem] text-accent-text hover:underline">{g.email}</a>}
                    {g.phone && <a href={`tel:${g.phone}`} className="block text-[0.8438rem] text-ink-2 tnum hover:text-ink">{g.phone}</a>}
                  </div>
                  <Button size="sm" variant="ghost" aria-label={`Edit ${g.full_name}`} onClick={() => setGuardian(g)}>
                    <Pencil className="size-4" aria-hidden /> Edit
                  </Button>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title={`Children (${students.data?.length ?? 0})`}
            action={<Button size="sm" variant="ghost" onClick={() => setChild('new')}><Plus className="size-4" aria-hidden /> Add a child</Button>}>
            <ul className="divide-y divide-line">
              {students.data?.map(s => (
                <li key={s.id} className="py-2.5">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{s.first_name} {s.last_name}</span>
                    <span className="text-[0.8125rem] text-ink-3">{ageFrom(s.date_of_birth)}</span>
                    {s.has_alert && <Word tone="critical">Medical alert</Word>}
                  </p>
                  <p className="mt-0.5 text-[0.8438rem] text-ink-2">{s.class_names ?? 'Not in any class'}</p>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Invoices">
            {invoices.data?.length === 0 && <p className="text-[0.875rem] text-ink-3">No invoices yet.</p>}
            <ul className="divide-y divide-line">
              {invoices.data?.map(i => (
                <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto_5.5rem] items-baseline gap-3 py-2 text-[0.875rem]">
                  <span className="tnum text-ink-2">{i.number}</span>
                  <span className="tnum font-semibold">{money(i.total_minor)}</span>
                  {/* The same words as Billing (UR-54, admins D14). */}
                  {(() => { const st = invoiceState(i); return (
                    <span className={cn('text-right text-[0.8125rem] font-semibold', st.tone === 'positive' ? 'text-positive' : st.tone === 'caution' ? 'text-caution' : st.tone === 'critical' ? 'text-critical' : 'text-ink-3')}>
                      {st.label}
                    </span>); })()}
                </li>
              ))}
            </ul>
          </DetailSection>
          <ImportedInvoices familyId={f.id} />

          <DetailSection title="Messages">
            {messages.data?.length === 0 && <p className="text-[0.875rem] text-ink-3">No messages with this family.</p>}
            <ul className="divide-y divide-line">
              {messages.data?.map(m => (
                <li key={m.id} className="py-2.5">
                  <p className="flex items-baseline justify-between gap-3"><span className="min-w-0 truncate text-[0.875rem] font-semibold">{m.subject}</span>
                    <span className="shrink-0 text-[0.7812rem] text-ink-3">{dateShort(m.sent_at)}</span></p>
                  <p className="mt-0.5 line-clamp-2 text-[0.8438rem] text-ink-2">{m.body}</p>
                </li>
              ))}
            </ul>
          </DetailSection>
        </>
      )}

      {f && (
        <DetailSection title="History">
          <RecordHistory entity="family" id={f.id} />
        </DetailSection>
      )}
      {editing && f && <FamilySheet row={f as any} onClose={() => setEditing(false)} />}
      {guardian && f && (
        <GuardianSheet familyId={f.id} row={guardian === 'new' ? null : guardian}
                       onClose={() => setGuardian(null)} />
      )}
      {child && f && (
        <StudentSheet familyId={f.id} familyName={f.name} row={null}
                      onClose={() => setChild(null)} />
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
  if (filtered.length === 0) return <EmptyState title={q ? 'No students match that search' : 'No students yet'}
    body={q ? 'Try a first name or the family’s surname.' : 'Add a child to a family, or import a spreadsheet.'} />;

  return (
    <div>
      <div aria-hidden className="hidden grid-cols-[minmax(0,1.3fr)_3.5rem_minmax(0,1fr)_4.5rem_5rem] gap-x-4 border-b-2 border-ink px-1 pb-2 md:grid">
        <span className="label">Student</span><span className="label">Age</span><span className="label">Family</span>
        <span className="label text-right">Classes</span><span className="label text-right">Attends</span>
      </div>
      <p className="px-1 pt-2 text-[0.8125rem] text-ink-3 md:hidden">{filtered.length} student{filtered.length === 1 ? '' : 's'}</p>
      <ul className="divide-y divide-line border-b border-line">
        {filtered.map(s => (
          <li key={s.id}>
            <button onClick={() => onSelect(s.id)} aria-current={selected === s.id || undefined}
              className={cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 text-left hover:bg-surface-2/60 md:grid-cols-[minmax(0,1.3fr)_3.5rem_minmax(0,1fr)_4.5rem_5rem]',
                selected === s.id && 'bg-surface-2 shadow-[inset_3px_0_0_var(--color-accent)]')}>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{s.preferred_name ?? s.first_name} {s.last_name}</span>
                  <MedicalMarker brief={{ requires_alert: s.has_alert, has_medical_need: s.has_need }} className="size-3.5" />
                  {s.photo_consent === false && <CameraOff className="size-3.5 shrink-0 text-ink-3" aria-label="No photo consent" />}
                </span>
                <span className="block truncate text-[0.8125rem] text-ink-3 md:hidden">
                  {ageFrom(s.date_of_birth)} · {s.classes} class{s.classes === 1 ? '' : 'es'} · {s.family_name}
                </span>
              </span>
              <span className="hidden text-[0.875rem] text-ink-2 tnum md:block">{ageFrom(s.date_of_birth)}</span>
              <span className="hidden truncate text-[0.875rem] text-ink-2 md:block">{s.family_name}</span>
              <span className="hidden text-right text-[0.875rem] text-ink-2 tnum md:block">{s.classes}</span>
              <span className={cn('text-right text-[0.875rem] tnum', s.attendance_pct == null ? 'text-ink-3'
                : s.attendance_pct >= 85 ? 'text-ink-2' : s.attendance_pct >= 70 ? 'font-semibold text-caution' : 'font-semibold text-critical')}>
                {s.attendance_pct != null ? `${s.attendance_pct}%` : '—'}
                {s.attendance_pct != null && s.attendance_pct < 70 && <span className="block text-[0.75rem] font-normal">Low</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const rows = useRows<P.StudentRow>(['students'], P.STUDENTS);
  const detail = useRow<P.StudentDetail>(['student-detail', id], P.STUDENT_DETAIL, [id]);
  const [editing, setEditing] = React.useState(false);
  const [medical, setMedical] = React.useState(false);
  const [concern, setConcern] = React.useState(false);
  const s = rows.data?.find(r => r.id === id);
  const safety = useRow<Brief>(['safety', id], P.STUDENT_SAFETY, [id]);
  const places = useRows<{ enrolment_id: string; class_id: string; name: string; day_of_week: number;
                           start_time: string; price_minor: number; pricing: string;
                           leaving_on: string | null; joining_on: string | null }>(['student-places', id], C.STUDENT_PLACES, [id]);
  const cancelMove = usePipeline(C.CANCEL_MOVE);
  const [moving, setMoving] = React.useState<{ enrolment_id: string; class_id: string; name: string; price_minor: number; pricing: string } | null>(null);

  return (
    <DetailPanel open onClose={onClose}
      title={s ? `${s.preferred_name ?? s.first_name} ${s.last_name}` : 'Student'}
      subtitle={s ? `${ageFrom(s.date_of_birth)} years old · ${s.family_name}` : undefined}>
      {s && (
        <>
          <DetailSection title="Details">
            <KeyValue rows={[
              ['Date of birth', s.date_of_birth ? `${dateWithYear(s.date_of_birth)} (${ageFrom(s.date_of_birth)})` : '—'],
              ['Family', s.family_name],
              ['Classes', `${s.classes}`],
              ['Attendance', s.attendance_pct != null ? `${s.attendance_pct}%` : '—'],
              ['Photo consent', s.photo_consent === false
                ? <span className="font-medium text-critical">Not given — do not photograph</span>
                : s.photo_consent ? 'Given' : 'Not recorded'],
            ]} />
          </DetailSection>
          <DetailSection title="Record">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setMedical(true)}>
                <HeartPulse className="size-4" aria-hidden /> Medical and emergency contacts
              </Button>
              <Button variant="ghost" onClick={() => setEditing(true)}>
                <Pencil className="size-4" aria-hidden /> Edit details
              </Button>
            </div>
            <p className="mt-2 text-[0.8125rem] text-ink-3">
              Health data is held separately and every change is recorded against your name.
            </p>
          </DetailSection>

          <DetailSection title={`Classes (${places.data?.length ?? 0})`}>
            {places.data?.length === 0 && <p className="text-[0.875rem] text-ink-3">Not in any class.</p>}
            <ul className="divide-y divide-line">
              {places.data?.map(p => (
                <li key={p.enrolment_id} className="flex items-center gap-2 py-1.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium">{p.name}</span>
                    <span className="block text-[0.7812rem] text-ink-3">{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][p.day_of_week]} {String(p.start_time).slice(0, 5)}
                      {p.leaving_on && ` · leaves ${dateShort(p.leaving_on)} (planned move)`}
                      {p.joining_on && ` · joins ${dateShort(p.joining_on)}`}</span>
                  </span>
                  {p.leaving_on ? (
                    <Button size="sm" variant="ghost" loading={cancelMove.isPending} onClick={() => cancelMove.mutate([p.enrolment_id])}>
                      Call off the move
                    </Button>
                  ) : !p.joining_on && (
                    <Button size="sm" variant="ghost" onClick={() => setMoving(p)}>
                      <ArrowRightLeft className="size-4" aria-hidden /> Move to another class
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {cancelMove.error != null && <ErrorState error={cancelMove.error} />}
          </DetailSection>

          <EarlierAttendance studentId={id} />

          <DetailSection title="Consent">
            <OfficeConsents studentId={id} name={s.preferred_name ?? s.first_name} />
          </DetailSection>

          <DetailSection title="Safeguarding">
            <ChildConcernLinks studentId={id} />
            <Button className="mt-2" onClick={() => setConcern(true)}>
              <ShieldAlert className="size-4" aria-hidden /> Raise a safeguarding concern
            </Button>
            <p className="mt-2 text-[0.8125rem] text-ink-3">For something you saw, or a parent or child told you. It goes only to the safeguarding lead and the owner.</p>
          </DetailSection>

          {safety.data && (
            <DetailSection title="Safety — what this child’s teachers see">
              <MedicalBrief brief={safety.data} layout="stack" />
            </DetailSection>
          )}
        </>
      )}

      {s && (
        <DetailSection title="History">
          <RecordHistory entity="student" id={id} />
        </DetailSection>
      )}
      {moving && s && (
        <MoveSheet enrolmentId={moving.enrolment_id} studentName={`${s.preferred_name ?? s.first_name} ${s.last_name}`}
          age={ageFrom(s.date_of_birth)} familyId={s.family_id}
          from={{ id: moving.class_id, name: moving.name, price_minor: moving.price_minor, pricing: moving.pricing }}
          onClose={() => setMoving(null)} />
      )}
      {editing && detail.data && (
        <StudentSheet row={detail.data} familyName={detail.data.family_name}
                      onClose={() => setEditing(false)} />
      )}
      {concern && s && <RaiseConcernSheet student={{ id, first_name: s.preferred_name ?? s.first_name }} onClose={() => setConcern(false)} />}
      {medical && s && (
        <MedicalSheet studentId={id} studentName={`${s.preferred_name ?? s.first_name} ${s.last_name}`}
                      onClose={() => setMedical(false)} />
      )}
    </DetailPanel>
  );
}

/* ── Staff ───────────────────────────────────────────────────────────────── */
function StaffList({ q }: { q: string }) {
  const rows = useRows<P.StaffRow & { students: number; has_login: boolean }>(['staff-full'], P.STAFF_FULL);
  const [editing, setEditing] = React.useState<P.StaffRow | null>(null);
  const filtered = (rows.data ?? []).filter(s =>
    !q || s.display_name.toLowerCase().includes(q.toLowerCase()));

  if (rows.isPending) return <ListSkeleton />;
  if (filtered.length === 0) {
    return <EmptyState
      title={q ? 'No staff match that search' : 'No teachers yet'}
      body={q ? undefined : 'Add the people who take your classes. They appear on the timetable straight away.'} />;
  }
  return (
    <>
      <div aria-hidden className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_5rem_6rem] gap-x-4 border-b-2 border-ink px-1 pb-2 md:grid">
        <span className="label">Name</span><span className="label">Email</span><span className="label text-right">Classes</span><span className="label text-right">App</span>
      </div>
      <ul className="divide-y divide-line border-b border-line">
        {filtered.map(s => (
          <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_5rem_6rem]">
            <button onClick={() => setEditing(s)} aria-label={`Edit ${s.display_name}`}
              className="group min-w-0 text-left">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold group-hover:underline">{s.display_name}</span>
                {s.status !== 'active' && <Word tone="muted">Inactive</Word>}
                <Pencil className="size-3.5 shrink-0 text-ink-3 opacity-0 group-hover:opacity-100" aria-hidden />
              </span>
              {s.bio && <span className="block truncate text-[0.8125rem] text-ink-3">{s.bio}</span>}
            </button>
            <span className="hidden min-w-0 md:block">{s.email && <a href={`mailto:${s.email}`}
              className="block truncate text-[0.875rem] text-accent-text hover:underline">{s.email}</a>}</span>
            <span className="text-right text-[0.875rem] tnum text-ink-2">{s.classes}<span className="md:hidden"> class{s.classes === 1 ? '' : 'es'}</span></span>
            <span className={cn('hidden text-right text-[0.8125rem] md:block', s.user_id ? 'text-ink-2' : 'text-ink-3')}>{s.user_id ? 'Signed up' : 'No login'}</span>
          </li>
        ))}
      </ul>
      {editing && <StaffSheet row={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ListSkeleton() {
  return <div className="divide-y divide-line">
    {[0,1,2,3,4].map(i => <div key={i} className="space-y-1.5 py-3">
      <Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" />
    </div>)}
  </div>;
}
