'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { MessageSquarePlus, Mail, ShieldAlert } from 'lucide-react';
import { RaiseConcernSheet } from '@/components/app/safeguarding';
import { TeacherMessageSheet } from '@/components/app/teacher-message';
import { StudentExams } from '@/components/app/exams';
import { PracticeSummary } from '@/components/app/practice';
import { SkillsPanel, Goals, Reflections, Milestones, Timeline, ThenAndNow } from '@/components/app/progress';
import { LastFeedback } from '@/components/app/last-feedback';
import { SupportNote, supportReasons } from '@/components/app/support-needs';
import * as P from '@/lib/repos/progress';
import { useSession } from '@/lib/auth/session';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { MedicalBrief, medicalLine } from '@/components/app/medical-brief';
import { useRows } from '@/lib/query';
import { useSelection } from '@/lib/use-selection';
import { Beats, Button, EmptyState, Input, Skeleton, ErrorState, ViewTabs } from '@/components/ui';
import { FeedbackComposer } from '@/components/app/feedback-composer';
import * as T from '@/lib/repos/teaching';
import { ageFrom } from '@/lib/format';
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
  const [view, setView] = React.useState<'all' | 'support'>('all');
  const { session } = useSession();
  const office = session?.role === 'owner' || session?.role === 'admin';
  // UR-45: who may need support, from the database's view of the caller's own students.
  const support = useRows<P.SupportRow>(['support-needs'], P.SUPPORT_NEEDS);
  const supportBy = new Map((support.data ?? []).map(r => [r.student_id, r]));
  const [writing, setWriting] = React.useState<Row | null>(null);
  const [messaging, setMessaging] = React.useState<Row | null>(null);
  const [concern, setConcern] = React.useState<Row | null>(null);
  const { selected, select } = useSelection();
  const rows = useRows<Row>(['my-students'], T.MY_STUDENTS);
  const withNeeds = rows.data?.filter(s => s.has_medical_need).length ?? 0;
  const list = (rows.data ?? []).filter(s =>
    (!q || `${s.preferred_name ?? s.first_name} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase()))
    && (!onlyNeeds || s.has_medical_need)
    && (view === 'all' || supportReasons(supportBy.get(s.id), s).length > 0));
  const needing = (rows.data ?? []).filter(s => supportReasons(supportBy.get(s.id), s).length > 0).length;
  const current = rows.data?.find(s => s.id === selected);

  return (
    <Shell title="My students"
      subtitle={rows.data ? `${rows.data.length} across your classes` : undefined}
      allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-5xl">
        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]' : 'block')}>
          <div className="min-w-0 space-y-4">
            <div className="flex gap-2">
              <Input type="search" value={q} onChange={e => setQ(e.target.value)}
                     placeholder="Search by name" aria-label="Search your students" />
              {withNeeds > 0 && (
                <Button aria-pressed={onlyNeeds} onClick={() => setOnlyNeeds(v => !v)}
                        className={cn('shrink-0', onlyNeeds && 'border-ink bg-surface-2')}>
                  Medical notes <span className="tnum text-ink-3">{withNeeds}</span>
                </Button>
              )}
            </div>
            <ViewTabs label="Which students" value={view} onChange={setView}
              options={[['all', 'Everyone'], ['support', `May need support${support.data ? ` · ${needing}` : ''}`]]} />
            {view === 'support' && (
              <p className="text-[0.8125rem] text-ink-3">Absent two or more times in a row, skills marked not started, medical notes or a support note from the office. Staff only; families never see this list.</p>
            )}
            <section aria-labelledby="students-h">
              <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
                <h2 id="students-h" className="section-title flex-1">{view === 'support' ? 'May need support' : onlyNeeds ? 'With medical notes' : q ? 'Matching' : 'Everyone you teach'}</h2>
                {rows.data && <span className="text-[0.8125rem] text-ink-3">{list.length} · attendance this term</span>}
              </div>
              {rows.isLoading && <div className="space-y-3 pt-3">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
              {list.length === 0 && !rows.isLoading && (
                <EmptyState title={q ? `No one called “${q}”` : 'No students yet'}
                  body={onlyNeeds ? 'Nobody matching has medical information recorded.' : 'You see children in the classes you teach.'} />
              )}
              <ul className="divide-y divide-line">
                {list.map(s => {
                  const med = medicalLine(s);
                  const low = s.attendance_pct != null && s.attendance_pct < 70;
                  const why = view === 'support' ? supportReasons(supportBy.get(s.id), s).filter(r => r !== 'Medical notes') : [];
                  return (
                    <li key={s.id}>
                      <button onClick={() => select(s.id)} aria-current={selected === s.id || undefined}
                        className={cn('grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3 pl-1 text-left hover:bg-surface-2/60',
                          selected === s.id && 'bg-accent-soft/60 shadow-[inset_3px_0_0_var(--color-accent)]')}>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{s.preferred_name ?? s.first_name} {s.last_name}</span>
                          {med && <span className={cn('block truncate text-[0.8438rem] font-semibold', s.requires_alert ? 'text-critical' : 'text-caution')}>{med}</span>}
                          {why.length > 0 && <span className="block truncate text-[0.8438rem] text-ink-2">{why.join(' · ')}</span>}
                          <span className="block truncate text-[0.8125rem] text-ink-3">
                            {[ageFrom(s.date_of_birth) != null && `Age ${ageFrom(s.date_of_birth)}`, s.class_names].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        {s.attendance_pct != null && (
                          <span className="flex items-center gap-2">
                            <Beats value={s.attendance_pct} max={100} size="sm" tone={low ? 'caution' : 'ink'} label={`${s.attendance_pct}% attendance`} className="hidden sm:inline-flex" />
                            <span className={cn('tnum w-11 text-right text-[0.875rem]', low ? 'font-semibold text-caution' : 'text-ink-2')}>
                              {s.attendance_pct}%{low && <span className="sr-only"> attendance, low</span>}
                            </span>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
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
                    <p className="mt-3 text-[0.8125rem] text-ink-3">Kept up to date by the office. GP details stay with them.</p>
                  </DetailSection>
                  <DetailSection title="Last feedback">
                    <LastFeedback studentId={current.id} name={current.preferred_name ?? current.first_name} empty="No feedback written yet." />
                  </DetailSection>
                  {(office || supportBy.get(current.id)?.support_note) && (
                    <DetailSection title="Support">
                      <SupportNote studentId={current.id} note={supportBy.get(current.id)?.support_note ?? null} editable={office} />
                    </DetailSection>
                  )}
                  <DetailSection title="With you">
                    <KeyValue rows={[
                      ['Classes', current.class_names],
                      ['Attendance', current.attendance_pct != null ? `${current.attendance_pct}%` : null],
                    ]} />
                  </DetailSection>
                  <DetailSection title="Skills">
                    <SkillsPanel studentId={current.id} editable />
                  </DetailSection>
                  <DetailSection title="Then and now"><ThenAndNow studentId={current.id} /></DetailSection>
                  <DetailSection title="Goals this term">
                    <Goals studentId={current.id} mode="teacher" />
                  </DetailSection>
                  {(ageFrom(current.date_of_birth) ?? 0) >= 13 && (
                    <DetailSection title="Their reflections">
                      <Reflections studentId={current.id} />
                      <p className="mt-1.5 text-[0.8125rem] text-ink-3">Only you, their other teachers and the student see these. If one worries you, follow your safeguarding procedure.</p>
                    </DetailSection>
                  )}
                  <DetailSection title="Milestones"><Milestones studentId={current.id} /></DetailSection>
                  <DetailSection title="Exams"><StudentExams studentId={current.id} canEnter /></DetailSection>
                  <DetailSection title="Practice"><PracticeSummary studentId={current.id} /></DetailSection>
                  <DetailSection title="Timeline"><Timeline studentId={current.id} limit={8} /></DetailSection>
                  <Button className="w-full" variant="primary" onClick={() => setWriting(current)}>
                    <MessageSquarePlus className="size-4" aria-hidden /> Write feedback
                  </Button>
                  <Button className="mt-2 w-full" variant="ghost" onClick={() => setMessaging(current)}>
                    <Mail className="size-4" aria-hidden /> Message the family
                  </Button>
                  <Button className="mt-2 w-full" variant="ghost" onClick={() => setConcern(current)}>
                    <ShieldAlert className="size-4" aria-hidden /> Raise a safeguarding concern
                  </Button>
                </>
              )}
            </DetailPanel>
          )}
        </div>
      </div>
      {concern && <RaiseConcernSheet student={concern} onClose={() => setConcern(null)} />}
      {messaging && <TeacherMessageSheet student={messaging} onClose={() => setMessaging(null)} />}
      {writing && <FeedbackComposer student={writing} onClose={() => setWriting(null)} />}
    </Shell>
  );
}
