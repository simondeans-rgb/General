'use client';

import { MySchoolHero } from '@/components/app/school-hero';
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { AbsenceDialog, MakeUpOffers } from '@/components/app/absence-report';
import { Button } from '@/components/ui';
import { useRows } from '@/lib/query';
import { PracticeLog } from '@/components/app/practice';
import { StudentConsents } from '@/components/app/consents';
import { Goals, Milestones } from '@/components/app/progress';
import { EmptyState, Skeleton, ErrorState } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import * as P from '@/lib/repos/progress';
import { time, relativeDay, dateLong, dayRange } from '@/lib/format';
import { SectionHead, dayDate } from '@/app/family/_parts/ui';

const KIND_LABEL: Record<string, string> = {
  competition: 'Competition', show: 'Show', exam: 'Exam', workshop: 'Workshop',
  private_lesson: 'Private lesson', rehearsal: 'Rehearsal', social: 'Social',
};

/**
 * A student's home: the next class, the teacher's latest words, what they
 * have reached, what they are working towards and their practice.
 */
export default function LearnHome() {
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + 14); return d.toISOString(); }, [from]);

  const timetable = useRows<any>(['learn-timetable', from], H.MY_TIMETABLE, [from, to]);
  const feedback = useRows<H.Feedback>(['learn-feedback'], H.STUDENT_FEEDBACK);
  const events = useRows<H.EventRow>(['learn-events'], H.EVENTS);
  const resources = useRows<H.Resource>(['learn-resources'], H.RESOURCES);
  const me = useRows<{ id: string }>(['student-self'], `select app.student_self_id() as id`);
  const myId = me.data?.[0]?.id;
  const milestones = useRows<P.Milestone>(['milestones', myId], P.MILESTONES, [myId], { enabled: !!myId });
  // Students of 13 and over can say they can't make a class (UR-49).
  const canReport = useRows<{ who: string | null }>(['may-report', myId], `select app.may_report_absence($1) as who`, [myId], { enabled: !!myId }).data?.[0]?.who === 'student';
  const myName = useRows<{ first_name: string }>(['student-name', myId], `select coalesce(preferred_name, first_name) as first_name from student where id = $1`, [myId], { enabled: !!myId }).data?.[0]?.first_name ?? '';
  const [reporting, setReporting] = React.useState(false);

  const upcoming = (timetable.data ?? []).filter(s => s.status !== 'cancelled');
  const next = upcoming[0];
  const after = upcoming.slice(1, 4);
  const latest = feedback.data?.[0];
  const myEvents = (events.data ?? []).filter(e => e.my_status === 'confirmed' || e.kind === 'private_lesson');

  return (
    <Shell title="Today" subtitle={dateLong(new Date())} allow={['student']}>
      <div className="mx-auto grid max-w-[1080px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0 space-y-10">
          {/* The next class: the one number worth making big. */}
          {timetable.isLoading && <Skeleton className="h-36" />}
          {timetable.error != null && <ErrorState error={timetable.error} onRetry={() => timetable.refetch()} />}
          {next && (
            <section aria-labelledby="next-h">
              <p className="label text-accent-text">Next · {relativeDay(next.starts_at)}</p>
              <p id="next-h" className="display-xl mt-1 text-[length:min(4.5rem,22vw)] text-ink sm:text-[length:min(5.5rem,22vw)]">{time(next.starts_at)}</p>
              <p className="mt-1 font-display text-[1.5rem] leading-tight">{next.name}</p>
              <p className="mt-1 text-[0.875rem] text-ink-3">{[next.teacher, next.room, next.location].filter(Boolean).join(' · ')}</p>
              {next.class_id && (
                <Link href={`/class/?id=${next.class_id}`}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[0.9062rem] font-semibold text-accent-text hover:underline">
                  Videos, music and notes for this class <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
              {after.length > 0 && (
                <ul className="mt-4 divide-y divide-line border-t border-line">
                  {after.map((s, i) => (
                    <li key={`${s.id}-${i}`} className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-baseline gap-x-4 py-2.5">
                      <span>
                        <span className="block text-[0.7812rem] text-ink-3">{relativeDay(s.starts_at).length > 9 ? dayDate(s.starts_at) : relativeDay(s.starts_at)}</span>
                        <span className="block font-display text-[1.0625rem] tnum">{time(s.starts_at)}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{s.name}</span>
                        <span className="block truncate text-[0.8125rem] text-ink-3">{[s.teacher, s.room].filter(Boolean).join(' · ')}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-4">
                <Link href="/learn/timetable" className="inline-flex min-h-[44px] items-center text-[0.8125rem] font-semibold text-accent-text hover:underline">Full timetable</Link>
                {canReport && myId && <Button size="sm" variant="ghost" onClick={() => setReporting(true)}>I can’t make it</Button>}
              </div>
            </section>
          )}
          {reporting && myId && <AbsenceDialog studentId={myId} firstName={myName} self onClose={() => setReporting(false)} />}
          <MakeUpOffers />
          {!next && !timetable.isLoading && (
            <EmptyState title="Nothing coming up" body="Your classes show here once the next term is published." />
          )}

          {/* The teacher's latest words, as they wrote them. */}
          {latest && (
            <section aria-labelledby="fb-h">
              <SectionHead id="fb-h" title="Latest from your teacher" href="/learn/feedback" link="All feedback" />
              <figure className="pt-3">
                {latest.headline && <p className="font-semibold">{latest.headline}</p>}
                {latest.going_well && <blockquote className="mt-1 text-[1.0625rem] leading-snug">“{latest.going_well}”</blockquote>}
                {latest.work_on && (
                  <p className="mt-2.5 border-l-2 border-accent pl-3 text-[0.9062rem] text-ink-2">
                    <span className="font-semibold text-ink">To work on: </span>{latest.work_on}
                  </p>
                )}
                <figcaption className="mt-2 text-[0.8125rem] text-ink-3">
                  {[latest.author, latest.class_name, relativeDay(latest.shared_at!)].filter(Boolean).join(' · ')}
                </figcaption>
              </figure>
            </section>
          )}

          {myId && <PracticeLog studentId={myId} />}
        </div>

        <div className="min-w-0 space-y-10">
          {myId && (milestones.data?.length ?? 0) > 0 && (
            <section aria-labelledby="ms-h">
              <SectionHead id="ms-h" title="Milestones" href="/learn/feedback" link="Skills and progress" />
              <div className="pt-3"><Milestones studentId={myId} celebrate /></div>
            </section>
          )}

          {myId && (
            <section aria-labelledby="goals-h">
              <SectionHead id="goals-h" title="Goals this term" meta="Your teacher agrees them with you" />
              <Goals studentId={myId} mode="student" />
            </section>
          )}

          {myEvents.length > 0 && (
            <section aria-labelledby="down-h">
              <SectionHead id="down-h" title="You’re down for" href="/learn/events" link="Events" />
              <ul className="divide-y divide-line">
                {myEvents.slice(0, 4).map(e => (
                  <li key={e.id} className="py-3">
                    <p className="font-semibold leading-snug">{e.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                      {[KIND_LABEL[e.kind] ?? e.kind, `${relativeDay(e.starts_at)} ${time(e.starts_at)}`, e.venue].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Their own consents, read-only (UR-08); shown from 13. */}
          <StudentConsents />

          <nav aria-label="More" className="divide-y divide-line border-t border-line">
            {([
              ['/learn/library', 'Videos and tracks', resources.data ? `${resources.data.length} to watch and practise with` : 'Practise between classes'],
              ['/learn/events', 'Shows and events', events.data ? `${events.data.length} coming up` : 'Shows, exams, competitions'],
            ] as const).map(([href, title, body]) => (
              <Link key={href} href={href} className="group flex min-h-[56px] items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-[0.8125rem] text-ink-3">{body}</span>
                </span>
                <ArrowRight className="size-4 text-ink-3 group-hover:text-ink" aria-hidden />
              </Link>
            ))}
          </nav>

          <MySchoolHero />
        </div>
      </div>
    </Shell>
  );
}
