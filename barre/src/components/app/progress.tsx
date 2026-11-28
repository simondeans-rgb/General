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
  const history = useRows<P.HistoryRow>(['skill-history', studentId], P.SKILL_HISTORY, [studentId]);
  const publish = useRows<{ id: string; skill_publish: 'immediate' | 'with_share' }>(['skill-publish'], P.SKILL_PUBLISH, [], { enabled: !!editable });
  const unshared = useRows<{ n: number }>(['skills-unshared', studentId], P.UNSHARED_SKILLS, [studentId], { enabled: !!editable });
  const write = useWrite();
  const groups = React.useMemo(() => {
    const m = new Map<string, P.SkillRow[]>();
    (rows.data ?? []).forEach(r => m.set(r.framework, [...(m.get(r.framework) ?? []), r]));
    return [...m.entries()];
  }, [rows.data]);
  if (rows.isLoading) return <Skeleton className="h-24" />;
  const others = <OtherStyles history={history.data ?? []} headingLevel={headingLevel} />;
  if (!groups.length) return (
    <div>
      <p className="py-3 text-[0.875rem] text-ink-3">{editable ? 'No skill levels to record here: the class keeps notes only, or the family chose notes only.' : 'No skills yet. They appear once the class starts.'}</p>
      {others}
    </div>
  );
  if (!editable) return <><SkillsRead groups={groups} demos={demos} headingLevel={headingLevel} history={history.data ?? []} />{others}</>;
  const waiting = unshared.data?.[0]?.n ?? 0;
  const instant = publish.data?.[0]?.skill_publish === 'immediate';
  return (
    <div className="space-y-3">
      {write.error != null && <ErrorState error={write.error} />}
      {groups.map(([fw, list]) => (
        <div key={fw}>
          <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3">{fw}</p>
          <ul className="space-y-1.5">
            {list.map(s => (
              <li key={s.skill_id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">{s.skill}
                  {s.previous && s.level && s.previous !== s.level && <TrendingUp className="ml-1 inline size-3.5 text-positive" aria-label="Improved" />}
                  {demos.get(s.skill_id) && (
                    <a href={demos.get(s.skill_id)} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 text-[0.75rem] font-medium text-accent-text underline">
                      <PlayCircle className="size-3.5" aria-hidden /> Watch
                    </a>
                  )}
                  <button className="ml-2 text-[0.7188rem] text-ink-3 underline" aria-label={`Demonstration link for ${s.skill}`}
                    onClick={() => { const u = window.prompt(`A secure link (https://) to a demonstration of ${s.skill} by a teacher or professional, not a video of pupils (share those in the class library, where consent is checked). Leave empty to remove.`, demos.get(s.skill_id) ?? '');
                      if (u !== null) write.mutate({ sql: P.SET_SKILL_DEMO, params: [s.skill_id, u] }); }}>
                    {demos.get(s.skill_id) ? 'change link' : 'add demo'}
                  </button>
                </span>
                <span role="radiogroup" aria-label={`${s.skill} level`} className="inline-flex rounded-[var(--radius-md)] border border-line p-0.5">
                  {P.LEVELS.slice(1).map(l => (
                    <button key={l.key} role="radio" aria-checked={s.level === l.key} title={l.label}
                      onClick={() => write.mutate({ sql: P.RECORD_SKILL, params: [studentId, s.skill_id, l.key, null] })}
                      className={cn('h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[0.75rem]',
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
      <p className="text-[0.75rem] text-ink-3">D developing · S secure · M mastered.
        {instant ? ' Families see levels straight away.' : ' Families see levels once you share them.'}</p>
      {!instant && waiting > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-2">
          <span className="min-w-0 flex-1 text-[0.875rem]"><span className="font-semibold">{waiting} change{waiting === 1 ? '' : 's'}</span> not shared yet</span>
          <Button size="sm" variant="primary" loading={write.isPending} onClick={() => write.mutate({ sql: P.SHARE_SKILLS, params: [studentId] })}>Share with the family</Button>
        </div>
      )}
      {others}
    </div>
  );
}

/**
 * The family's view of skills: only what the teacher has assessed, as beats,
 * and a count of what is still to come (UR-55: never a grid of "not yet").
 * Where the class tracks in full, each skill opens to its dated history (UR-43).
 */
function SkillsRead({ groups, demos, headingLevel, history }: {
  groups: [string, P.SkillRow[]][]; demos: Map<string, string>; headingLevel: 3 | 4; history: P.HistoryRow[];
}) {
  const H = headingLevel === 3 ? 'h3' : 'h4';
  const assessed = groups.reduce((n, [, l]) => n + l.filter(s => s.level && s.level !== 'not_started').length, 0);
  const bySkill = React.useMemo(() => {
    const m = new Map<string, P.HistoryRow[]>();
    history.filter(h => h.skill_id && h.depth === 'full').forEach(h => m.set(h.skill_id!, [...(m.get(h.skill_id!) ?? []), h]));
    return m;
  }, [history]);
  if (assessed === 0) return (
    <p className="pt-2 text-[0.9062rem] text-ink-2">
      No skills marked yet. As the teacher assesses each one it shows here as a count of eight: developing, secure, then mastered.
    </p>
  );
  return (
    <div className="space-y-6 pt-2">
      {groups.map(([fw, list]) => {
        const done = list.filter(s => s.level && s.level !== 'not_started');
        const toCome = list.length - done.length;
        if (!done.length) return null;
        return (
          <div key={fw}>
            <div className="flex items-baseline gap-3 border-b border-line pb-1.5">
              <H className="min-w-0 flex-1 font-semibold">{fw.replace(/ skills$/i, '')}</H>
              <span className="text-[0.8125rem] text-ink-3 tnum">{done.length} assessed</span>
            </div>
            <ul className="divide-y divide-line">
              {done.map(s => {
                const up = s.previous && s.previous !== s.level && s.previous !== 'not_started';
                const past = bySkill.get(s.skill_id) ?? [];
                return (
                  <li key={s.skill_id} className="py-2.5">
                    <div className="flex min-h-[36px] items-center gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium leading-snug">{s.skill}</span>
                        <span className="block text-[0.8125rem] text-ink-3">
                          <span className="font-semibold text-ink-2">{label(s.level)}</span>
                          {up && <span className="text-positive"> · up from {label(s.previous).toLowerCase()}</span>}
                          {demos.get(s.skill_id) && (
                            <> · <a href={demos.get(s.skill_id)} target="_blank" rel="noreferrer" className="font-semibold text-accent-text underline">Watch</a></>
                          )}
                        </span>
                      </span>
                      <Beats value={LEVEL_BEATS[s.level!]} max={8} label={`${s.skill}: ${label(s.level)}`}
                        tone={s.level === 'mastered' ? 'accent' : 'ink'} />
                    </div>
                    {past.length > 1 && (
                      <details className="group mt-1">
                        <summary className="inline-flex min-h-[32px] cursor-pointer list-none items-center gap-1 text-[0.8125rem] font-semibold text-accent-text [&::-webkit-details-marker]:hidden">
                          History · {past.length} <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <ol className="mt-1 space-y-0.5 text-[0.8438rem] text-ink-2">
                          {past.map((h, i) => (
                            <li key={i} className="flex gap-3"><span className="w-20 shrink-0 tnum text-ink-3">{dateShort(h.assessed_on)}</span>{label(h.level)}</li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
            {toCome > 0 && <p className="pt-2 text-[0.8125rem] text-ink-3">{toCome} more to come as the teacher assesses them.</p>}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Levels in styles the child no longer dances (students D6): kept, and shown
 * here rather than lost. Latest level per skill.
 */
function OtherStyles({ history, headingLevel }: { history: P.HistoryRow[]; headingLevel: 3 | 4 }) {
  const H = headingLevel === 3 ? 'h3' : 'h4';
  const latest = React.useMemo(() => {
    const m = new Map<string, P.HistoryRow>();
    history.filter(h => !h.current_style && h.level !== 'not_started').forEach(h => m.set(`${h.style}|${h.skill}`, h));
    return [...m.values()];
  }, [history]);
  if (!latest.length) return null;
  const styles = [...new Set(latest.map(h => h.style ?? 'Other'))];
  return (
    <details className="group mt-6">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 border-b border-line pb-1.5 [&::-webkit-details-marker]:hidden">
        <H className="min-w-0 flex-1 font-semibold">Earlier styles</H>
        <span className="text-[0.8125rem] text-ink-3">{styles.join(', ')}</span>
        <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="divide-y divide-line">
        {latest.map(h => (
          <li key={`${h.style}|${h.skill}`} className="flex items-baseline gap-3 py-2 text-[0.875rem]">
            <span className="min-w-0 flex-1">{h.skill} <span className="text-ink-3">· {h.style}</span></span>
            <span className="font-semibold text-ink-2">{label(h.level)}</span>
            <span className="w-16 shrink-0 text-right text-[0.8125rem] text-ink-3 tnum">{dateShort(h.assessed_on)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * "Then and now" over a chosen period (UR-43): each skill whose level changed,
 * from where it was at the start to where it is today. Only where the class
 * tracks in full (UR-55); counts what moved, never what didn't.
 */
export function ThenAndNow({ studentId, name }: { studentId: string; name?: string }) {
  const history = useRows<P.HistoryRow>(['skill-history', studentId], P.SKILL_HISTORY, [studentId]);
  const [months, setMonths] = React.useState(3);
  const rows = React.useMemo(() => {
    const since = new Date(); since.setMonth(since.getMonth() - months);
    const cut = since.getTime();
    const m = new Map<string, { skill: string; style: string | null; then: P.Level | null; now: P.Level }>();
    (history.data ?? []).filter(h => h.depth === 'full' && h.current_style).forEach(h => {
      const k = h.skill_id ?? h.skill;
      const cur = m.get(k) ?? { skill: h.skill, style: h.style, then: null, now: h.level };
      if (new Date(h.assessed_on).getTime() <= cut) cur.then = h.level;
      cur.now = h.level;
      m.set(k, cur);
    });
    return [...m.values()].filter(r => r.then !== r.now && r.now !== 'not_started');
  }, [history.data, months]);
  if (history.isLoading) return null;
  if (!(history.data ?? []).some(h => h.depth === 'full' && h.current_style)) {
    return <p className="text-[0.8125rem] text-ink-3">Levels over time are kept for classes set to full tracking.</p>;
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <label htmlFor={`tn-${studentId}`} className="text-[0.875rem] text-ink-2">Over the last</label>
        <select id={`tn-${studentId}`} value={months} onChange={e => setMonths(Number(e.target.value))}
          className="h-10 rounded-[var(--radius-md)] border border-line-strong bg-surface px-2 text-[0.875rem]">
          {[1, 3, 6, 12].map(n => <option key={n} value={n}>{n === 12 ? 'year' : `${n} month${n === 1 ? '' : 's'}`}</option>)}
        </select>
      </div>
      {rows.length === 0 ? (
        <p className="text-[0.875rem] text-ink-3">No levels changed in this time{name ? ` for ${name}` : ''}. Steady work counts too.</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map(r => (
            <li key={`${r.style}|${r.skill}`} className="flex flex-wrap items-baseline gap-x-3 py-2.5">
              <span className="min-w-0 flex-1"><span className="font-medium">{r.skill}</span> <span className="text-[0.8125rem] text-ink-3">· {r.style}</span></span>
              <span className="text-[0.875rem]"><span className="text-ink-3">{r.then ? label(r.then) : 'New'}</span> → <span className="font-semibold">{label(r.now)}</span></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const dayKey = (v: string | Date) => { const d = new Date(v); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

/** Skill levels set on the same day arrive as one entry, not a wall of rows. */
function grouped(items: P.TimelineItem[]): P.TimelineItem[][] {
  const out: P.TimelineItem[][] = [];
  for (const i of items) {
    const last = out[out.length - 1];
    if (i.kind === 'skill' && last && last[0]!.kind === 'skill' && dayKey(last[0]!.at) === dayKey(i.at)) last.push(i);
    else out.push([i]);
  }
  return out;
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
        <p className="mb-3 text-[0.875rem]">
          <span className="font-semibold text-positive">{since} skill{since === 1 ? '' : 's'} moved up</span> in the last three months.
        </p>
      )}
      <ol className="relative space-y-3 border-l border-line pl-4">
        {grouped(list).map((g, n) => {
          const i = g[0]!;
          const Icon = KIND_ICON[i.kind] ?? Sparkles;
          return (
            <li key={n} className="relative">
              <span className="absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line">
                <Icon className="size-3 text-accent-text" aria-hidden />
              </span>
              <p className="text-[0.75rem] text-ink-3">{relativeDay(i.at)}</p>
              {g.length > 1 ? (
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {g.length} skills assessed <ChevronDown className="inline size-3.5 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <ul className="mt-1 space-y-0.5 text-[0.8125rem] text-ink-2">
                    {g.map((x, k) => <li key={k}>{x.title} — {x.previous ? `${label(x.previous)} → ` : ''}{label(x.level)}</li>)}
                  </ul>
                </details>
              ) : (
                <>
                  <p className="text-sm font-medium">{i.title}
                    {i.kind === 'skill' && <> — {i.previous ? `${label(i.previous)} → ` : ''}{label(i.level)}</>}
                    {i.kind === 'goal' && i.detail && <Badge tone={i.detail === 'achieved' ? 'positive' : 'neutral'} className="ml-2">{i.detail}</Badge>}
                  </p>
                  {i.kind !== 'goal' && i.detail && <p className="text-[0.8125rem] text-ink-2">{i.detail}</p>}
                </>
              )}
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
        <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[0.8125rem] text-accent-ink">
          <Award className="size-3.5" aria-hidden /> {m.title} <span className="text-[0.7188rem] opacity-70">{dateShort(m.reached_on)}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <p className="flex items-baseline gap-3">
        <span className="display-xl text-[length:min(3.5rem,22vw)] leading-none">{n}</span>
        <span className="text-[0.9375rem] font-semibold leading-snug">milestone{n === 1 ? '' : 's'} reached.
          <span className="block font-normal text-ink-3">{n >= 8 ? 'That’s a full count. Keep moving.' : `${8 - n} more to a full count.`}</span></span>
      </p>
      <Beats value={Math.min(n, 8)} max={8} size="lg" label={`${n} milestone${n === 1 ? '' : 's'}`} className="mt-3" />
      <ul className="mt-3 divide-y divide-line" aria-label="Milestones">
        {rows.data.map(m => (
          <li key={m.id} className="flex items-baseline gap-3 py-2.5">
            <span className="min-w-0 flex-1 font-medium">{m.title}</span>
            <span className="shrink-0 text-[0.8125rem] text-ink-3 tnum">{dateShort(m.reached_on)}</span>
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
      {live.length === 0 && done.length === 0 && <p className="py-2 text-[0.875rem] text-ink-3">No goals this term{mode === 'student' ? ' yet. Pick one thing to get better at.' : '.'}</p>}
      <ul className={cn(mode === 'teacher' ? 'space-y-1.5' : 'divide-y divide-line')}>
        {live.map(g => (
          <li key={g.id} className={cn('flex flex-wrap items-center gap-2', mode === 'teacher' ? 'text-sm' : 'min-h-[44px] py-2.5')}>
            {mode === 'teacher' && <Flag className="size-3.5 text-accent-text" aria-hidden />}
            <span className="min-w-0 flex-1">{g.text}</span>
            {g.status === 'proposed' && (mode === 'teacher'
              ? <Badge tone="caution">Waiting for your teacher</Badge>
              : <span className="text-[0.8125rem] font-semibold text-caution">{mode === 'student' ? 'Waiting for your teacher' : 'Waiting for the teacher'}</span>)}
            {g.status === 'agreed' && mode !== 'teacher' && <span className="text-[0.8125rem] font-semibold text-ink-2">Agreed</span>}
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
            {mode !== 'teacher' && <span className="text-[0.8125rem] font-semibold text-positive">Achieved</span>}
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
        <p className="text-[0.7812rem] text-ink-3">{r.term_name}{r.shared_at ? ` · shared ${dateShort(r.shared_at)}` : ''}</p>
      </header>
      {s.attendance && s.attendance.of > 0 && <p>Came to {s.attendance.present} of {s.attendance.of} classes.</p>}
      {!!s.skills?.length && (
        <ul className="grid gap-1 sm:grid-cols-2">
          {s.skills.map(k => (
            <li key={k.skill} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1">
              <span>{k.skill}</span>
              <span className="text-[0.7812rem]">{k.from && k.from !== k.level ? `${label(k.from)} → ` : ''}<b>{label(k.level)}</b></span>
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
  if (!rows.data?.length) return <p className="text-[0.8125rem] text-ink-3">No reflections.</p>;
  return (
    <ul className="space-y-1.5">
      {rows.data.map(r => (
        <li key={r.id} className="flex gap-2 text-sm">
          <span aria-label={`Mood ${r.mood} of 5`} className="text-base leading-5">{P.MOODS[r.mood - 1]}</span>
          <span className="min-w-0 flex-1">{r.text ?? <span className="text-ink-3">No words</span>}
            <span className="block text-[0.75rem] text-ink-3">{r.class_name ?? ''} · {relativeDay(r.created_at)}</span></span>
        </li>
      ))}
    </ul>
  );
}
