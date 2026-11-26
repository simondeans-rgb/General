'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle2, FileText, Flag, MessageSquareHeart, PlayCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Badge, Button, EmptyState, ErrorState, Input, Skeleton, type Tone } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as P from '@/lib/repos/progress';
import { dateShort, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';

const LEVEL_TONE: Record<P.Level, Tone> = { not_started: 'neutral', developing: 'caution', secure: 'info', mastered: 'positive' };
const label = (l: P.Level | null) => P.LEVELS.find(x => x.key === l)?.label ?? 'Not yet assessed';

function useWrite() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

/** A child's skills in the styles they dance. Teachers set a level in one tap (R-020). */
export function SkillsPanel({ studentId, editable }: { studentId: string; editable?: boolean }) {
  const rows = useRows<P.SkillRow>(['skills', studentId], P.STUDENT_SKILLS, [studentId]);
  const demos = new Map((useRows<{ id: string; demo_url: string }>(['skill-demos'], P.SKILL_DEMOS).data ?? []).map(d => [d.id, d.demo_url]));
  const write = useWrite();
  const groups = React.useMemo(() => {
    const m = new Map<string, P.SkillRow[]>();
    (rows.data ?? []).forEach(r => m.set(r.framework, [...(m.get(r.framework) ?? []), r]));
    return [...m.entries()];
  }, [rows.data]);
  if (rows.isLoading) return <Skeleton className="h-24" />;
  if (!groups.length) return <p className="text-[13px] text-ink-3">No skills yet — they appear once the child is in a class.</p>;
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
                  {editable && (
                    <button className="ml-2 text-[11.5px] text-ink-3 underline" aria-label={`Demonstration link for ${s.skill}`}
                      onClick={() => { const u = window.prompt(`A secure link (https://) to a demonstration of ${s.skill}. Leave empty to remove.`, demos.get(s.skill_id) ?? '');
                        if (u !== null) write.mutate({ sql: P.SET_SKILL_DEMO, params: [s.skill_id, u] }); }}>
                      {demos.get(s.skill_id) ? 'change link' : 'add demo'}
                    </button>
                  )}
                </span>
                {editable ? (
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
                ) : <Badge tone={s.level ? LEVEL_TONE[s.level] : 'neutral'}>{label(s.level)}</Badge>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {editable && <p className="text-[12px] text-ink-3">D developing · S secure · M mastered. Families see levels straight away.</p>}
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
        <p className="mb-2 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]">
          <TrendingUp className="size-4 text-positive" aria-hidden /> {since} skill{since === 1 ? '' : 's'} moved up in the last three months.
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
export function Milestones({ studentId }: { studentId: string }) {
  const rows = useRows<P.Milestone>(['milestones', studentId], P.MILESTONES, [studentId]);
  if (!rows.data?.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Milestones">
      {rows.data.map(m => (
        <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent-ink">
          <Award className="size-3.5" aria-hidden /> {m.title} <span className="text-[11.5px] opacity-70">{dateShort(m.reached_on)}</span>
        </li>
      ))}
    </ul>
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
      {live.length === 0 && done.length === 0 && <p className="text-[13px] text-ink-3">No goals this term.</p>}
      <ul className="space-y-1.5">
        {live.map(g => (
          <li key={g.id} className="flex flex-wrap items-center gap-2 text-sm">
            <Flag className="size-3.5 text-accent-text" aria-hidden />
            <span className="min-w-0 flex-1">{g.text}</span>
            {g.status === 'proposed' && <Badge tone="caution">Waiting for your teacher</Badge>}
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
          <li key={g.id} className="flex items-center gap-2 text-sm text-ink-2">
            <CheckCircle2 className="size-3.5 text-positive" aria-hidden /> {g.text}
          </li>
        ))}
      </ul>
      {mode !== 'family' && live.length < 2 && (
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (text.trim().length >= 3) {
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
