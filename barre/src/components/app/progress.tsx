'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle2, ChevronDown, FileText, Flag, MessageSquareHeart, PlayCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Badge, Beats, Button, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as P from '@/lib/repos/progress';
import { dateShort, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';

const label = (l: P.Level | null) => P.LEVELS.find(x => x.key === l)?.label ?? 'Not yet assessed';

function useWrite() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

/** How far each level fills the eight-count meter. "Not started" is an empty meter, never a failure. */
const LEVEL_BEATS: Record<P.Level, number> = { not_started: 0, developing: 3, secure: 6, mastered: 8 };

/** A child's skills in the styles they dance. Teachers set a level in one tap (R-020). */
export function SkillsPanel({ studentId, editable, headingLevel = 3 }: { studentId: string; editable?: boolean; headingLevel?: 3 | 4 }) {
  const rows = useRows<P.SkillRow>(['skills', studentId], P.STUDENT_SKILLS, [studentId]);
  const demos = new Map((useRows<{ id: string; demo_url: string }>(['skill-demos'], P.SKILL_DEMOS).data ?? []).map(d => [d.id, d.demo_url]));
  const write = useWrite();
  const groups = React.useMemo(() => {
    const m = new Map<string, P.SkillRow[]>();
    (rows.data ?? []).forEach(r => m.set(r.framework, [...(m.get(r.framework) ?? []), r]));
    return [...m.entries()];
  }, [rows.data]);
  if (rows.isLoading) return <Skeleton className="h-24" />;
  if (!groups.length) return <p className="py-3 text-[14px] text-ink-3">No skills yet. They appear once the class starts.</p>;
  if (!editable) return <SkillsRead groups={groups} demos={demos} headingLevel={headingLevel} />;
  return (
    <div className="space-y-3">
      {write.error != null && <ErrorState error={write.error} />}
      {groups.map(([fw, list]) => (
        <div key={fw}>
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{fw}</p>
          <ul className="space-y-1.5">
            {list.map(s => (
              <li key={s.skill_id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">{s.skill}
                  {s.previous && s.level && s.previous !== s.level && <TrendingUp className="ml-1 inline size-3.5 text-positive" aria-label="Improved" />}
                  {demos.get(s.skill_id) && (
                    <a href={demos.get(s.skill_id)} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 text-[12px] font-medium text-accent-text underline">
                      <PlayCircle className="size-3.5" aria-hidden /> Watch
                    </a>
                  )}
                  <button className="ml-2 text-[11.5px] text-ink-3 underline" aria-label={`Demonstration link for ${s.skill}`}
                    onClick={() => { const u = window.prompt(`A secure link (https://) to a demonstration of ${s.skill}. Leave empty to remove.`, demos.get(s.skill_id) ?? '');
                      if (u !== null) write.mutate({ sql: P.SET_SKILL_DEMO, params: [s.skill_id, u] }); }}>
                    {demos.get(s.skill_id) ? 'change link' : 'add demo'}
                  </button>
                </span>
                <span role="radiogroup" aria-label={`${s.skill} level`} className="inline-flex rounded-[var(--radius-md)] border border-line p-0.5">
                  {P.LEVELS.slice(1).map(l => (
                    <button key={l.key} role="radio" aria-checked={s.level === l.key} title={l.label}
                      onClick={() => write.mutate({ sql: P.RECORD_SKILL, params: [studentId, s.skill_id, l.key, null] })}
                      className={cn('h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[12px]',
                        s.level === l.key ? 'bg-accent font-semibold text-on-accent' : 'text-ink-2 hover:bg-surface-2')}>
                      {l.short}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[12px] text-ink-3">D developing · S secure · M mastered. Families see levels straight away.</p>
    </div>
  );
}

/**
 * The family's view of skills: what the teacher has assessed, as beats, and
 * everything not yet assessed summarised in one line per style rather than a
 * wall of "not yet".
 */
function SkillsRead({ groups, demos, headingLevel }: {
  groups: [string, P.SkillRow[]][]; demos: Map<string, string>; headingLevel: 3 | 4;
}) {
  const H = headingLevel === 3 ? 'h3' : 'h4';
  const assessed = groups.reduce((n, [, l]) => n + l.filter(s => s.level && s.level !== 'not_started').length, 0);
  const total = groups.reduce((n, [, l]) => n + l.length, 0);
  return (
    <div className="space-y-6 pt-2">
      {assessed === 0 && (
        <p className="text-[14.5px] text-ink-2">
          No skills marked yet. As the teacher assesses each one it shows here as a count of eight:
          developing, secure, then mastered.
        </p>
      )}
      {groups.map(([fw, list]) => {
        const done = list.filter(s => s.level && s.level !== 'not_started');
        const notYet = list.filter(s => !s.level || s.level === 'not_started');
        return (
          <div key={fw}>
            <div className="flex items-baseline gap-3 border-b border-line pb-1.5">
              <H className="min-w-0 flex-1 font-semibold">{fw.replace(/ skills$/i, '')}</H>
              <span className="text-[13px] text-ink-3 tnum">{done.length} of {list.length} assessed</span>
            </div>
            {done.length > 0 && (
              <ul className="divide-y divide-line">
                {done.map(s => {
                  const up = s.previous && s.previous !== s.level && s.previous !== 'not_started';
                  return (
                    <li key={s.skill_id} className="flex min-h-[52px] items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium leading-snug">{s.skill}</span>
                        <span className="block text-[13px] text-ink-3">
                          <span className="font-semibold text-ink-2">{label(s.level)}</span>
                          {up && <span className="text-positive"> · up from {label(s.previous).toLowerCase()}</span>}
                          {demos.get(s.skill_id) && (
                            <> · <a href={demos.get(s.skill_id)} target="_blank" rel="noreferrer" className="font-semibold text-accent-text underline">Watch</a></>
                          )}
                        </span>
                      </span>
                      <Beats value={LEVEL_BEATS[s.level!]} max={8} label={`${s.skill}: ${label(s.level)}`}
                        tone={s.level === 'mastered' ? 'accent' : 'ink'} />
                    </li>
                  );
                })}
              </ul>
            )}
            {notYet.length > 0 && (
              <details className="group py-2.5">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 text-[14px] text-ink-2 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-ink">Not yet · {notYet.length} skill{notYet.length === 1 ? '' : 's'}</span>
                    <span className="block truncate text-[13px] text-ink-3">{notYet.map(s => s.skill).join(', ')}</span>
                  </span>
                  <Beats value={0} max={8} label="Not yet assessed" />
                  <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="mt-1 grid gap-x-6 gap-y-1 pl-0 text-[14px] text-ink-2 sm:grid-cols-2">
                  {notYet.map(s => (
                    <li key={s.skill_id} className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1">{s.skill}</span>
                      {demos.get(s.skill_id) && <a href={demos.get(s.skill_id)} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-accent-text underline">Watch</a>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      })}
      {assessed > 0 && assessed < total && (
        <p className="text-[13px] text-ink-3">“Not yet” means the teacher hasn’t assessed it — not that it’s gone badly.</p>
      )}
    </div>
  );
}

const KIND_ICON = { skill: TrendingUp, feedback: MessageSquareHeart, milestone: Award, goal: Flag, report: FileText } as const;

/** Everything about a child's progress, newest first (R-023). */
export function Timeline({ studentId, limit = 30 }: { studentId: string; limit?: number }) {
  const rows = useRows<P.TimelineItem>(['timeline', studentId], P.TIMELINE, [studentId]);
  const [more, setMore] = React.useState(false);
  const since = React.useMemo(() => {
    const cutoff = Date.now() - 90 * 86400_000;
    const items = (rows.data ?? []).filter(i => i.kind === 'skill' && new Date(i.at).getTime() > cutoff && i.previous && i.level !== i.previous);
    return items.length;
  }, [rows.data]);
  if (rows.isLoading) return <Skeleton className="h-24" />;
  if (!rows.data?.length) return <EmptyState title="Nothing yet" body="Skills, feedback and milestones appear here as they happen." />;
  const list = more ? rows.data : rows.data.slice(0, limit);
  return (
    <div>
      {since > 0 && (
        <p className="mb-3 text-[14px]">
          <span className="font-semibold text-positive">{since} skill{since === 1 ? '' : 's'} moved up</span> in the last three months.
        </p>
      )}
      <ol className="relative space-y-3 border-l border-line pl-4">
        {list.map((i, n) => {
          const Icon = KIND_ICON[i.kind] ?? Sparkles;
          return (
            <li key={n} className="relative">
              <span className="absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line">
                <Icon className="size-3 text-accent-text" aria-hidden />
              </span>
              <p className="text-[12px] text-ink-3">{relativeDay(i.at)}</p>
              <p className="text-sm font-medium">{i.title}
                {i.kind === 'skill' && <> — {i.previous ? `${label(i.previous)} → ` : ''}{label(i.level)}</>}
                {i.kind === 'goal' && i.detail && <Badge tone={i.detail === 'achieved' ? 'positive' : 'neutral'} className="ml-2">{i.detail}</Badge>}
              </p>
              {i.kind !== 'goal' && i.detail && <p className="text-[13px] text-ink-2">{i.detail}</p>}
            </li>
          );
        })}
      </ol>
      {!more && rows.data.length > limit && <Button size="sm" variant="ghost" className="mt-2" onClick={() => setMore(true)}>Show everything</Button>}
    </div>
  );
}

/** Milestones: what a child has done. Never what they missed, never a ranking (R-026). */
export function Milestones({ studentId, celebrate }: { studentId: string; celebrate?: boolean }) {
  const rows = useRows<P.Milestone>(['milestones', studentId], P.MILESTONES, [studentId]);
  if (!rows.data?.length) return null;
  const n = rows.data.length;
  if (!celebrate) return (
    <ul className="flex flex-wrap gap-2" aria-label="Milestones">
      {rows.data.map(m => (
        <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent-ink">
          <Award className="size-3.5" aria-hidden /> {m.title} <span className="text-[11.5px] opacity-70">{dateShort(m.reached_on)}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <p className="flex items-baseline gap-3">
        <span className="display-xl text-[56px] leading-none">{n}</span>
        <span className="text-[15px] font-semibold leading-snug">milestone{n === 1 ? '' : 's'} reached.
          <span className="block font-normal text-ink-3">{n >= 8 ? 'That’s a full count. Keep moving.' : `${8 - n} more to a full count.`}</span></span>
      </p>
      <Beats value={Math.min(n, 8)} max={8} size="lg" label={`${n} milestone${n === 1 ? '' : 's'}`} className="mt-3" />
      <ul className="mt-3 divide-y divide-line" aria-label="Milestones">
        {rows.data.map(m => (
          <li key={m.id} className="flex items-baseline gap-3 py-2.5">
            <span className="min-w-0 flex-1 font-medium">{m.title}</span>
            <span className="shrink-0 text-[13px] text-ink-3 tnum">{dateShort(m.reached_on)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Goals: one or two a term (R-024). Students propose; teachers agree and review. */
export function Goals({ studentId, mode }: { studentId: string; mode: 'student' | 'teacher' | 'family' }) {
  const rows = useRows<P.Goal>(['goals', studentId], P.GOALS, [studentId]);
  const write = useWrite();
  const [text, setText] = React.useState('');
  const live = (rows.data ?? []).filter(g => g.status === 'proposed' || g.status === 'agreed');
  const done = (rows.data ?? []).filter(g => g.status === 'achieved');
  return (
    <div className="space-y-2">
      {write.error != null && <ErrorState error={write.error} />}
      {live.length === 0 && done.length === 0 && <p className="py-2 text-[14px] text-ink-3">No goals this term{mode === 'student' ? ' yet. Pick one thing to get better at.' : '.'}</p>}
      <ul className={cn(mode === 'teacher' ? 'space-y-1.5' : 'divide-y divide-line')}>
        {live.map(g => (
          <li key={g.id} className={cn('flex flex-wrap items-center gap-2', mode === 'teacher' ? 'text-sm' : 'min-h-[44px] py-2.5')}>
            {mode === 'teacher' && <Flag className="size-3.5 text-accent-text" aria-hidden />}
            <span className="min-w-0 flex-1">{g.text}</span>
            {g.status === 'proposed' && (mode === 'teacher'
              ? <Badge tone="caution">Waiting for your teacher</Badge>
              : <span className="text-[13px] font-semibold text-caution">{mode === 'student' ? 'Waiting for your teacher' : 'Waiting for the teacher'}</span>)}
            {g.status === 'agreed' && mode !== 'teacher' && <span className="text-[13px] font-semibold text-ink-2">Agreed</span>}
            {mode === 'teacher' && g.status === 'proposed' && (
              <Button size="sm" onClick={() => write.mutate({ sql: P.SET_GOAL, params: [g.id, 'agreed', null] })}>Agree</Button>
            )}
            {mode === 'teacher' && g.status === 'agreed' && (
              <Button size="sm" variant="primary" onClick={() => write.mutate({ sql: P.SET_GOAL, params: [g.id, 'achieved', null] })}>
                <CheckCircle2 className="size-4" aria-hidden /> Achieved
              </Button>
            )}
            {mode === 'teacher' && (
              <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: P.SET_GOAL, params: [g.id, 'dropped', null] })}>Drop</Button>
            )}
          </li>
        ))}
        {done.slice(0, 3).map(g => (
          <li key={g.id} className={cn('flex items-center gap-2 text-ink-2', mode === 'teacher' ? 'text-sm' : 'min-h-[44px] py-2.5')}>
            {mode === 'teacher' ? <CheckCircle2 className="size-3.5 text-positive" aria-hidden /> : null}
            <span className="min-w-0 flex-1">{g.text}</span>
            {mode !== 'teacher' && <span className="text-[13px] font-semibold text-positive">Achieved</span>}
          </li>
        ))}
      </ul>
      {mode !== 'family' && live.length < 2 && (
        <form className="flex gap-2 pt-2" onSubmit={e => { e.preventDefault(); if (text.trim().length >= 3) {
          write.mutate({ sql: P.PROPOSE_GOAL, params: [studentId, text, mode === 'teacher' ? 'agreed' : 'proposed'] }); setText(''); } }}>
          <Input aria-label="A goal for this term" value={text} onChange={e => setText(e.target.value)} maxLength={200}
                 placeholder={mode === 'student' ? 'Something you want to get better at' : 'A goal for this term'} />
          <Button type="submit" disabled={text.trim().length < 3}>Add</Button>
        </form>
      )}
    </div>
  );
}

/** A term report, printable (R-022). */
export function ReportCard({ r }: { r: P.Report }) {
  const s = r.summary;
  return (
    <article className="space-y-2 text-sm print:break-inside-avoid">
      <header>
        <h3 className="font-semibold">{r.student_name} — {r.class_name}</h3>
        <p className="text-[12.5px] text-ink-3">{r.term_name}{r.shared_at ? ` · shared ${dateShort(r.shared_at)}` : ''}</p>
      </header>
      {s.attendance && s.attendance.of > 0 && <p>Came to {s.attendance.present} of {s.attendance.of} classes.</p>}
      {!!s.skills?.length && (
        <ul className="grid gap-1 sm:grid-cols-2">
          {s.skills.map(k => (
            <li key={k.skill} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1">
              <span>{k.skill}</span>
              <span className="text-[12.5px]">{k.from && k.from !== k.level ? `${label(k.from)} → ` : ''}<b>{label(k.level)}</b></span>
            </li>
          ))}
        </ul>
      )}
      {!!s.going_well?.length && <p><b>Going well:</b> {s.going_well.join(', ')}.</p>}
      {!!s.work_on?.length && <p><b>To work on:</b> {s.work_on.join(', ')}.</p>}
      {r.comment && <p className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-line p-2.5 italic">{r.comment}</p>}
    </article>
  );
}

/** Teachers see a student's reflections; parents never do (R-025). */
export function Reflections({ studentId }: { studentId: string }) {
  const rows = useRows<P.Reflection>(['reflections', studentId], P.REFLECTIONS, [studentId]);
  if (!rows.data?.length) return <p className="text-[13px] text-ink-3">No reflections.</p>;
  return (
    <ul className="space-y-1.5">
      {rows.data.map(r => (
        <li key={r.id} className="flex gap-2 text-sm">
          <span aria-label={`Mood ${r.mood} of 5`} className="text-base leading-5">{P.MOODS[r.mood - 1]}</span>
          <span className="min-w-0 flex-1">{r.text ?? <span className="text-ink-3">No words</span>}
            <span className="block text-[12px] text-ink-3">{r.class_name ?? ''} · {relativeDay(r.created_at)}</span></span>
        </li>
      ))}
    </ul>
  );
}
