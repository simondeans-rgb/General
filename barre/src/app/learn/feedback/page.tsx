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
import { SkillsPanel, Goals, Milestones, Timeline, ReportCard, ThenAndNow } from '@/components/app/progress';
import { ChildView } from '@/components/app/child-view';
import { ViewTabs } from '@/components/ui';
import { relativeDay, ageFrom, dateShort, time } from '@/lib/format';
import { cn } from '@/lib/cn';


/** Shared by the student hub and the parent hub. The parent version shows
 *  which child each note is about; the student's own name would be noise. */
export function FeedbackView({ allow, title, showStudent }: {
  allow: any; title: string; showStudent?: boolean;
}) {
  const notes = useRows<H.Feedback>(['feedback'], H.STUDENT_FEEDBACK);
  const kids = useRows<{ id: string; first_name: string; date_of_birth: string; skill_tracking_opt_out: boolean }>(['progress-kids'],
    `select id, first_name, date_of_birth, skill_tracking_opt_out from student where deleted_at is null order by date_of_birth desc`);
  const [pick, setPick] = React.useState('');
  // A notice about one child opens on that child (parents D14).
  React.useEffect(() => {
    try { const c = new URLSearchParams(window.location.search).get('child'); if (c) setPick(c); } catch { /* no URL, no preference */ }
  }, []);
  const [view, setView] = React.useState<'recent' | 'style'>('recent');
  const [childView, setChildView] = React.useState(false);
  const kid = kids.data?.find(k => k.id === pick) ?? kids.data?.[0];
  const student = !showStudent;
  const several = showStudent && (kids.data?.length ?? 0) > 1;
  // With more than one child, the notes follow the chosen child.
  const shown = (notes.data ?? []).filter(n => !several || !kid || n.student_id === kid.id);
  const styles = [...new Set(shown.map(n => n.style ?? 'Other'))];
  const sections: [string | null, H.Feedback[]][] = view === 'style' && styles.length > 1
    ? styles.map(st => [st, shown.filter(n => (n.style ?? 'Other') === st)]) : [[null, shown]];
  const young = kid ? (ageFrom(kid.date_of_birth) ?? 99) < 13 : false;

  return (
    <Shell title={title} allow={allow}>
      <div className="mx-auto max-w-[1080px]">
        {several && (
          <div role="tablist" aria-label="Child" className="-mt-1 mb-8 flex gap-6 border-b border-line">
            {kids.data!.map(k => (
              <button key={k.id} role="tab" aria-selected={k.id === kid?.id} onClick={() => setPick(k.id)}
                className={cn('-mb-px min-h-[44px] border-b-2 px-0.5 font-display text-[1.1875rem]',
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
              <SectionHead id="notes-h" title="Notes from class"
                action={showStudent && kid && young && shown.length > 0
                  ? <Button size="sm" onClick={() => setChildView(true)}>Share with {kid.first_name}</Button> : undefined} />
              {styles.length > 1 && (
                <ViewTabs label="Arrange notes" value={view} onChange={setView} className="pt-2"
                  options={[['recent', 'Newest first'], ['style', 'By style']]} />
              )}
              {notes.isLoading && <div className="space-y-3 pt-3">{[0, 1].map(i => <Skeleton key={i} className="h-24" />)}</div>}
              {notes.error != null && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
              {!notes.isLoading && shown.length === 0 && (
                <p className="py-3 text-[0.9062rem] text-ink-2">No notes yet. Teachers share a few lines after class, and they show here.</p>
              )}
              {sections.map(([st, items]) => (
                <div key={st ?? 'all'}>
                  {st && <h3 className="pt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-ink-3">{st}</h3>}
                  <ul className="divide-y divide-line">
                    {items.map(n => (
                      <li key={n.id} className="py-4">
                        <div className="flex items-baseline gap-3">
                          <h3 className="min-w-0 flex-1 font-semibold">{n.headline}</h3>
                          <span className="shrink-0 text-[0.8125rem] text-ink-3">{relativeDay(n.shared_at!)}</span>
                        </div>
                        {n.going_well && (
                          <blockquote className="mt-1.5 text-[1rem] leading-snug text-ink">“{n.going_well}”</blockquote>
                        )}
                        {n.work_on && (
                          <p className="mt-2 border-l-2 border-accent pl-3 text-[0.9062rem] text-ink-2">
                            <span className="font-semibold text-ink">To work on: </span>{n.work_on}
                            {n.resource_title && (
                              <> · <a className="font-semibold text-accent-text underline" target={n.resource_url ? '_blank' : undefined} rel="noreferrer"
                                href={n.resource_url ?? `/class?id=${n.class_id}`}>{n.resource_title}</a></>
                            )}
                          </p>
                        )}
                        <p className="mt-2 text-[0.8125rem] text-ink-3">
                          {[n.author, n.class_name, showStudent && !several ? n.student_name.split(' ')[0] : null].filter(Boolean).join(' · ')}
                          {n.edited_at && <span className="font-semibold text-ink-2"> · Edited {dateShort(n.edited_at)}, {time(n.edited_at)}</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            {kid && <SkillsSection studentId={kid.id} name={kid.first_name} student={student} optedOut={kid.skill_tracking_opt_out} />}
          </div>
          <div className="min-w-0 space-y-10">
            {kid && <ProgressBlock studentId={kid.id} name={kid.first_name} dob={kid.date_of_birth} student={student} />}
          </div>
        </div>
      </div>
      {childView && kid && <ChildView student={kid} notes={shown} onClose={() => setChildView(false)} />}
    </Shell>
  );
}

function SkillsSection({ studentId, name, student, optedOut }: { studentId: string; name: string; student: boolean; optedOut?: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const set = useMutation({
    mutationFn: (tracked: boolean) => runAs(session, q => q(P.SET_SKILL_TRACKING, [studentId, tracked])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  // Families choose whether skill levels are kept at all (UR-55). Notes and milestones carry on.
  const choice = !student && (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[0.875rem]">
      <span className="min-w-0 flex-1 text-ink-2">
        {optedOut ? `You chose notes only for ${name}. Teachers do not record skill levels.` : `Prefer notes only? You can switch skill levels off for ${name}.`}
      </span>
      <Button size="sm" variant="ghost" loading={set.isPending} onClick={() => set.mutate(!!optedOut)}>
        {optedOut ? 'Switch skill levels on' : 'Notes only'}
      </Button>
      {set.error != null && <ErrorState error={set.error} />}
    </div>
  );
  return (
    <>
      <section aria-labelledby="skills-h">
        <SectionHead id="skills-h" title={student ? 'Your skills' : `${name}’s skills`} meta={optedOut ? undefined : 'Developing · secure · mastered'} />
        {!optedOut && <SkillsPanel studentId={studentId} />}
        <div className="pt-4">{choice}</div>
      </section>
      {!optedOut && <ThenAndNowSection studentId={studentId} name={name} student={student} />}
    </>
  );
}

/** "Then and now" appears only where the class tracks in full (UR-43, UR-55). */
function ThenAndNowSection({ studentId, name, student }: { studentId: string; name: string; student: boolean }) {
  const history = useRows<P.HistoryRow>(['skill-history', studentId], P.SKILL_HISTORY, [studentId]);
  if (!(history.data ?? []).some(h => h.depth === 'full' && h.current_style)) return null;
  return (
    <section aria-labelledby="tn-h">
      <SectionHead id="tn-h" title="Then and now" meta={student ? 'How your levels have moved' : `How ${name}’s levels have moved`} />
      <div className="pt-3"><ThenAndNow studentId={studentId} name={student ? undefined : name} /></div>
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
            action={<button className="shrink-0 text-[0.8125rem] font-semibold text-accent-text hover:underline" onClick={() => window.print()}>Print or save as PDF</button>} />
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
      {!done && <p className="pt-2 text-[0.8125rem] text-ink-3">Only you and your teachers see this.</p>}
      {done ? <p className="pt-3 text-[0.9375rem]">Your teacher will see it. Your parents won’t.</p> : (
        <div className="space-y-3 pt-2">
          <div role="radiogroup" aria-label="How it went" className="grid grid-cols-5 gap-1.5">
            {P.MOODS.map((_, i) => (
              <button key={i} role="radio" aria-checked={mood === i + 1} aria-label={`${MOOD_WORDS[i]}, ${i + 1} of 5`} onClick={() => setMood(i + 1)}
                className={cn('flex min-h-[48px] items-center justify-center rounded-[var(--radius-md)] border text-[0.7812rem]',
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
