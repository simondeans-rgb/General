'use client';

import * as React from 'react';
import { MessageSquare, Sparkles, Target } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, CardHeader, EmptyState, Skeleton, ErrorState, type Tone } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import * as P from '@/lib/repos/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Input } from '@/components/ui';
import { SkillsPanel, Goals, Milestones, Timeline, ReportCard } from '@/components/app/progress';
import { relativeDay, dateShort, ageFrom } from '@/lib/format';
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

  return (
    <Shell title={title} allow={allow}>
      <div className="mx-auto max-w-2xl space-y-4">
        {showStudent && (kids.data?.length ?? 0) > 1 && (
          <div role="tablist" aria-label="Child" className="flex gap-1 overflow-x-auto">
            {kids.data!.map(k => (
              <button key={k.id} role="tab" aria-selected={k.id === kid?.id} onClick={() => setPick(k.id)}
                className={cn('shrink-0 rounded-full px-3 py-1.5 text-sm', k.id === kid?.id ? 'bg-ink text-surface' : 'bg-surface-2 text-ink-2')}>
                {k.first_name}
              </button>
            ))}
          </div>
        )}
        {kid && <ProgressBlock studentId={kid.id} name={kid.first_name} dob={kid.date_of_birth} student={student} />}
        <h2 className="pt-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-3">Notes from class</h2>
        {notes.isLoading && <Card className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-24" />)}</Card>}
        {notes.error && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
        {notes.data?.length === 0 && !notes.isLoading && (
          <Card><EmptyState icon={<MessageSquare className="size-5" />} title="No feedback yet"
            body="Teachers share notes after class. They appear here once they do." /></Card>
        )}

        {notes.data?.map(n => (
          <Card key={n.id}>
            <div className="p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="font-semibold">{n.headline}</h2>
                {showStudent && <Badge tone="accent">{n.student_name.split(' ')[0]}</Badge>}
                <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(n.shared_at!)}</span>
              </div>
              {n.going_well && (
                <p className="mt-2.5 flex gap-2 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
                  <span>{n.going_well}</span>
                </p>
              )}
              {n.work_on && (
                <p className="mt-2 flex gap-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm">
                  <Target className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
                  <span><span className="font-medium">To work on: </span>{n.work_on}</span>
                </p>
              )}
              <p className="mt-2.5 text-[12px] text-ink-3">
                {n.author}{n.class_name ? ` · ${n.class_name}` : ''}
              </p>
            </div>
          </Card>
        ))}

      </div>
    </Shell>
  );
}

/** Milestones, skills, goals, reports, reflections and the timeline for one child. */
function ProgressBlock({ studentId, name, dob, student }: { studentId: string; name: string; dob: string; student: boolean }) {
  const reports = useRows<P.Report>(['my-reports'], P.MY_REPORTS);
  const mine = (reports.data ?? []).filter(r => r.student_id === studentId);
  const [showTimeline, setShowTimeline] = React.useState(false);
  const teen = (ageFrom(dob) ?? 0) >= 13;
  return (
    <>
      <Milestones studentId={studentId} />
      <Card>
        <CardHeader title={student ? 'Your skills' : `${name}’s skills`} subtitle="Where the teacher thinks each skill is" />
        <div className="px-4 pb-4"><SkillsPanel studentId={studentId} /></div>
      </Card>
      <Card>
        <CardHeader title="Goals this term" subtitle={student ? 'Suggest one — your teacher agrees it with you' : undefined} />
        <div className="px-4 pb-4"><Goals studentId={studentId} mode={student ? 'student' : 'family'} /></div>
      </Card>
      {student && teen && <ReflectCard />}
      {mine.length > 0 && (
        <Card>
          <CardHeader title="Term reports" action={<Button size="sm" variant="ghost" onClick={() => window.print()}>Print or save as PDF</Button>} />
          <div className="space-y-4 px-4 pb-4">{mine.map(r => <ReportCard key={r.id} r={r} />)}</div>
        </Card>
      )}
      <Card>
        <CardHeader title="Timeline" subtitle="Skills, feedback, goals and milestones over time" />
        <div className="px-4 pb-4">
          {showTimeline ? <Timeline studentId={studentId} /> : <Button size="sm" onClick={() => setShowTimeline(true)}>Show the timeline</Button>}
        </div>
      </Card>
    </>
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
    <Card className="p-4">
      {done ? <p className="text-sm">Thanks — your teacher will see it. Only you and your teachers can.</p> : (
        <div className="space-y-2">
          <p className="font-medium">How did {c!.name} go?</p>
          <div role="radiogroup" aria-label="How it went" className="flex gap-2">
            {P.MOODS.map((m, i) => (
              <button key={i} role="radio" aria-checked={mood === i + 1} aria-label={`${i + 1} of 5`} onClick={() => setMood(i + 1)}
                className={cn('grid size-10 place-items-center rounded-full text-xl', mood === i + 1 ? 'bg-accent-soft ring-2 ring-accent' : 'bg-surface-2')}>{m}</button>
            ))}
          </div>
          <Input aria-label="One sentence (optional)" placeholder="One sentence (optional)" maxLength={280} value={text} onChange={e => setText(e.target.value)} />
          {save.error != null && <ErrorState error={save.error} />}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" disabled={!mood} loading={save.isPending} onClick={() => save.mutate()}>Save</Button>
            <span className="text-[12px] text-ink-3">Only you and your teachers see this — not your parents.</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function StudentFeedback() {
  return <FeedbackView allow={['student']} title="Your feedback" />;
}
