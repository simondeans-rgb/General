'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Users, MessageSquarePlus, HeartPulse } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { MedicalBrief, MedicalMarker } from '@/components/app/medical-brief';
import { useRows } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { Badge, Button, Card, EmptyState, Input, Skeleton, ErrorState } from '@/components/ui';
import { FeedbackComposer } from '@/components/app/feedback-composer';
import * as T from '@/lib/repos/teaching';
import { ageFrom, initials } from '@/lib/format';
import { cn } from '@/lib/cn';

type Row = {
  id: string; first_name: string; last_name: string; preferred_name: string | null; date_of_birth: string;
  class_names: string | null; attendance_pct: number | null;
} & T.Brief;

export default function MyStudentsPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><MyStudents /></Suspense>;
}

function MyStudents() {
  const [q, setQ] = React.useState('');
  const [onlyNeeds, setOnlyNeeds] = React.useState(false);
  const [writing, setWriting] = React.useState<Row | null>(null);
  const { selected, select } = useSelection();
  const rows = useRows<Row>(['my-students'], T.MY_STUDENTS);
  const withNeeds = rows.data?.filter(s => s.has_medical_need).length ?? 0;
  const list = (rows.data ?? []).filter(s =>
    (!q || `${s.preferred_name ?? s.first_name} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase()))
    && (!onlyNeeds || s.has_medical_need));
  const current = rows.data?.find(s => s.id === selected);

  return (
    <Shell title="My students"
      subtitle={rows.data ? `${rows.data.length} across your classes${withNeeds ? ` · ${withNeeds} with medical information` : ''}` : undefined}
      allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-5xl">
        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]' : 'block')}>
          <div className="min-w-0 space-y-3">
            <div className="flex gap-2">
              <Input type="search" value={q} onChange={e => setQ(e.target.value)}
                     placeholder="Search your students" aria-label="Search your students" />
              {withNeeds > 0 && (
                <Button aria-pressed={onlyNeeds} onClick={() => setOnlyNeeds(v => !v)}
                        className={cn('shrink-0', onlyNeeds && 'border-caution bg-caution-soft')}>
                  <HeartPulse className="size-4 text-caution" aria-hidden /> Medical <span className="tnum">{withNeeds}</span>
                </Button>
              )}
            </div>
            {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</Card>}
            {rows.error && <ErrorState error={rows.error} />}
            {list.length === 0 && !rows.isLoading && (
              <Card><EmptyState icon={<Users className="size-5" />} title="No students found"
                body={onlyNeeds ? 'Nobody matching has medical information recorded.' : 'You only see children in classes you teach.'} /></Card>
            )}
            {list.length > 0 && (
              <Card>
                <ul className="divide-y divide-line">
                  {list.map(s => (
                    <li key={s.id}>
                      <button onClick={() => select(s.id)} aria-current={selected === s.id || undefined}
                        className={cn('flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2',
                          selected === s.id && 'bg-accent-soft/50')}>
                        <span aria-hidden className={cn('grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold',
                          s.requires_alert ? 'bg-critical-soft text-critical' : s.has_medical_need ? 'bg-caution-soft text-caution' : 'bg-surface-2 text-ink-2')}>
                          {initials(s.first_name, s.last_name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate font-medium">{s.preferred_name ?? s.first_name} {s.last_name}</span>
                            <MedicalMarker brief={s} />
                          </span>
                          <span className="block truncate text-[12.5px] text-ink-2">
                            {ageFrom(s.date_of_birth)} · {s.class_names ?? '—'}
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
            )}
          </div>

          {selected && (
            <DetailPanel open onClose={() => select(null)}
              title={current ? `${current.preferred_name ?? current.first_name} ${current.last_name}` : 'Student'}
              subtitle={current ? `${ageFrom(current.date_of_birth)} years old` : undefined}>
              {!current && rows.isLoading && <Skeleton className="h-40" />}
              {!current && !rows.isLoading && <EmptyState title="Not one of your students" body="You see children in classes you teach." />}
              {current && (
                <>
                  <DetailSection title="Safety">
                    <MedicalBrief brief={current} layout="stack" />
                    <p className="mt-2 text-[12px] text-ink-3">Kept up to date by the office. GP details stay with them.</p>
                  </DetailSection>
                  <DetailSection title="With you">
                    <KeyValue rows={[
                      ['Classes', current.class_names],
                      ['Attendance', current.attendance_pct != null ? `${current.attendance_pct}%` : null],
                    ]} />
                  </DetailSection>
                  <Button className="w-full" onClick={() => setWriting(current)}>
                    <MessageSquarePlus className="size-4" aria-hidden /> Write feedback
                  </Button>
                </>
              )}
            </DetailPanel>
          )}
        </div>
      </div>
      {writing && <FeedbackComposer student={writing} onClose={() => setWriting(null)} />}
    </Shell>
  );
}
