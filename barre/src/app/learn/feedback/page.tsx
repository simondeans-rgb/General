'use client';

import * as React from 'react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Skeleton, ErrorState } from '@/components/ui';
import { SectionHead } from '@/app/family/_parts/ui';
import * as H from '@/lib/repos/hub';
import * as P from '@/lib/repos/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Input } from '@/components/ui';
import { SkillsPanel, Goals, Milestones, Timeline, ReportCard } from '@/components/app/progress';
import { relativeDay, ageFrom } from '@/lib/format';
import { cn } from '@/lib/cn';


/** Shared by the student hub and the parent hub. The parent version shows
 *  which child each note is about; the student's own name would be noise. */
export function FeedbackView({ allow, title, showStudent }: {
  allow: any; title: string; showStudent?: boolean;
}) {
  const notes = useRows<H.Feedback>(['feedback'], H.STUDENT_FEEDBACK);
  const kids = useRows<{ id: string; first_name: string; date_of_birth: string }>(['progress-kids'],
    `select id, first_name, date_of_birth from student where deleted_at is null order by date_of_birth desc`);
  const [pick, setPick] = React.useState('');
  const kid = kids.data?.find(k => k.id === pick) ?? kids.data?.[0];
  const student = !showStudent;
  const several = showStudent && (kids.data?.length ?? 0) > 1;
  // With more than one child, the notes follow the chosen child.
  const shown = (notes.data ?? []).filter(n => !several || !kid || n.student_id === kid.id);

  return (
    <Shell title={title} allow={allow}>
      <div className="mx-auto max-w-[1080px]">
        {several && (
          <div role="tablist" aria-label="Child" className="-mt-1 mb-8 flex gap-6 border-b border-line">
            {kids.data!.map(k => (
              <button key={k.id} role="tab" aria-selected={k.id === kid?.id} onClick={() => setPick(k.id)}
                className={cn('-mb-px min-h-[44px] border-b-2 px-0.5 font-display text-[19px]',
                  k.id === kid?.id ? 'border-accent text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
                {k.first_name}
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0 space-y-10">
            {/* Notes first: the teacher's own words are the most encouraging thing here. */}
            <section aria-labelledby="notes-h">
              <SectionHead id="notes-h" title="Notes from class" />
              {notes.isLoading && <div className="space-y-3 pt-3">{[0, 1].map(i => <Skeleton key={i} className="h-24" />)}</div>}
              {notes.error != null && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
              {!notes.isLoading && shown.length === 0 && (
                <p className="py-3 text-[14.5px] text-ink-2">No notes yet. Teachers share a few lines after class, and they show here.</p>
              )}
              <ul className="divide-y divide-line">
                {shown.map(n => (
                  <li key={n.id} className="py-4">
                    <div className="flex items-baseline gap-3">
                      <h3 className="min-w-0 flex-1 font-semibold">{n.headline}</h3>
                      <span className="shrink-0 text-[13px] text-ink-3">{relativeDay(n.shared_at!)}</span>
                    </div>
                    {n.going_well && (
                      <blockquote className="mt-1.5 text-[16px] leading-snug text-ink">“{n.going_well}”</blockquote>
                    )}
                    {n.work_on && (
                      <p className="mt-2 border-l-2 border-accent pl-3 text-[14.5px] text-ink-2">
                        <span className="font-semibold text-ink">To work on: </span>{n.work_on}
                      </p>
                    )}
                    <p className="mt-2 text-[13px] text-ink-3">
                      {[n.author, n.class_name, showStudent && !several ? n.student_name.split(' ')[0] : null].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            {kid && <SkillsSection studentId={kid.id} name={kid.first_name} student={student} />}
          </div>
          <div className="min-w-0 space-y-10">
            {kid && <ProgressBlock studentId={kid.id} name={kid.first_name} dob={kid.date_of_birth} student={student} />}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SkillsSection({ studentId, name, student }: { studentId: string; name: string; student: boolean }) {
  return (
    <section aria-labelledby="skills-h">
      <SectionHead id="skills-h" title={student ? 'Your skills' : `${name}’s skills`} meta="Developing · secure · mastered" />
      <SkillsPanel studentId={studentId} />
    </section>
  );
}

/** Milestones, goals, reports, reflections and the timeline for one child. */
function ProgressBlock({ studentId, name, dob, student }: { studentId: string; name: string; dob: string; student: boolean }) {
  const reports = useRows<P.Report>(['my-reports'], P.MY_REPORTS);
  const mine = (reports.data ?? []).filter(r => r.student_id === studentId);
  const [showTimeline, setShowTimeline] = React.useState(false);
  const teen = (ageFrom(dob) ?? 0) >= 13;
  return (
    <>
      <MilestonesSection studentId={studentId} />
      {student && teen && <ReflectCard />}
      <section aria-labelledby="goals-h">
        <SectionHead id="goals-h" title="Goals this term" meta={student ? 'Your teacher agrees them with you' : undefined} />
        <Goals studentId={studentId} mode={student ? 'student' : 'family'} />
      </section>
      {mine.length > 0 && (
        <section aria-labelledby="reports-h">
          <SectionHead id="reports-h" title="Term reports"
            action={<button className="shrink-0 text-[13px] font-semibold text-accent-text hover:underline" onClick={() => window.print()}>Print or save as PDF</button>} />
          <div className="space-y-6 pt-3">{mine.map(r => <ReportCard key={r.id} r={r} />)}</div>
        </section>
      )}
      <section aria-labelledby="tl-h">
        <SectionHead id="tl-h" title="Timeline" meta={showTimeline ? undefined : 'Skills, feedback, goals, milestones'} />
        <div className="pt-3">
          {showTimeline ? <Timeline studentId={studentId} /> : <Button size="sm" onClick={() => setShowTimeline(true)}>Show the timeline{student ? '' : ` for ${name}`}</Button>}
        </div>
      </section>
    </>
  );
}

/** Milestones only appear once there is one to celebrate. */
function MilestonesSection({ studentId }: { studentId: string }) {
  const rows = useRows<P.Milestone>(['milestones', studentId], P.MILESTONES, [studentId]);
  if (!rows.data?.length) return null;
  return (
    <section aria-labelledby="ms-h">
      <SectionHead id="ms-h" title="Milestones" />
      <div className="pt-3"><Milestones studentId={studentId} celebrate /></div>
    </section>
  );
}

/** After class, a quick thought for the student and their teachers only (R-025). */
function ReflectCard() {
  const { session } = useSession();
  const qc = useQueryClient();
  const recent = useRows<{ id: string; name: string; starts_at: string }>(['reflect-classes'], P.MY_RECENT_CLASSES);
  const [mood, setMood] = React.useState(0);
  const [text, setText] = React.useState('');
  const [done, setDone] = React.useState(false);
  const c = recent.data?.[0];
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(P.ADD_REFLECTION, [c!.id, mood, text])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (!c && !done) return null;
  return (
    <section aria-labelledby="reflect-h">
      <SectionHead id="reflect-h" title={done ? 'Thanks' : `How did ${c!.name} go?`} />
      {!done && <p className="pt-2 text-[13px] text-ink-3">Only you and your teachers see this.</p>}
      {done ? <p className="pt-3 text-[15px]">Your teacher will see it. Your parents won’t.</p> : (
        <div className="space-y-3 pt-2">
          <div role="radiogroup" aria-label="How it went" className="grid grid-cols-5 gap-1.5">
            {P.MOODS.map((_, i) => (
              <button key={i} role="radio" aria-checked={mood === i + 1} aria-label={`${MOOD_WORDS[i]}, ${i + 1} of 5`} onClick={() => setMood(i + 1)}
                className={cn('flex min-h-[48px] items-center justify-center rounded-[var(--radius-md)] border text-[12.5px]',
                  mood === i + 1 ? 'border-accent bg-accent-soft font-semibold text-accent-ink' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-2')}>
                {MOOD_WORDS[i]}
              </button>
            ))}
          </div>
          <Input aria-label="One sentence (optional)" placeholder="One sentence (optional)" maxLength={280} value={text} onChange={e => setText(e.target.value)} />
          {save.error != null && <ErrorState error={save.error} />}
          <Button variant="primary" disabled={!mood} loading={save.isPending} onClick={() => save.mutate()}>Save</Button>
        </div>
      )}
    </section>
  );
}

const MOOD_WORDS = ['Hard', 'Tricky', 'OK', 'Good', 'Great'];

export default function StudentFeedback() {
  return <FeedbackView allow={['student']} title="Your feedback" />;
}
