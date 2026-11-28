'use client';

import * as React from 'react';
import { useRows } from '@/lib/query';
import { Beats, EmptyState, ErrorState, Field, Select, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import { cn } from '@/lib/cn';
import { matrixOf } from '@/lib/progress-matrix';

/** A level as a count of eight, the same as on a child's skills. */
export const LEVEL_BEATS: Record<P.Level, number> = { not_started: 0, developing: 3, secure: 6, mastered: 8 };
const label = (l: P.Level | null) => (l ? P.LEVELS.find(x => x.key === l)?.label ?? l : 'Not assessed');

type MyClass = { id: string; name: string; style: string | null; depth: P.Depth; has_skills: boolean };

/**
 * F9: a whole class's skills at once, for coaches. Read only: levels are
 * changed on a child, as before. It follows the class's tracking depth (no
 * matrix for a notes-only class) and marks levels not yet shared.
 */
export function ClassProgress() {
  const classes = useRows<MyClass>(['progress-classes'], P.MY_PROGRESS_CLASSES);
  const [style, setStyle] = React.useState('');
  const [classId, setClassId] = React.useState('');
  const styles = [...new Set((classes.data ?? []).map(c => c.style ?? 'Other'))];
  const shown = (classes.data ?? []).filter(c => !style || (c.style ?? 'Other') === style);
  const chosen = shown.find(c => c.id === classId) ?? shown.find(c => c.depth !== 'notes' && c.has_skills) ?? shown.find(c => c.depth !== 'notes') ?? shown[0];
  const cells = useRows<P.ProgressCell>(['class-progress', chosen?.id ?? ''], P.CLASS_PROGRESS, [chosen?.id], { enabled: !!chosen });
  const m = React.useMemo(() => matrixOf(cells.data ?? []), [cells.data]);
  const full = cells.data?.[0]?.depth === 'full';
  const drafts = (cells.data ?? []).filter(c => c.level && !c.published).length;

  if (classes.isLoading) return <Skeleton className="h-40" />;
  if (classes.error != null) return <ErrorState error={classes.error} onRetry={() => classes.refetch()} />;
  if (!classes.data?.length) return <EmptyState title="No classes yet" body="Your classes show here once the office adds them." />;

  return (
    <section aria-labelledby="cp-h" className="space-y-4">
      <h2 id="cp-h" className="sr-only">Class progress</h2>
      <div className="flex flex-wrap gap-3">
        {styles.length > 1 && (
          <Field label="Style" htmlFor="cp-style">
            <Select id="cp-style" value={style} onChange={e => { setStyle(e.target.value); setClassId(''); }}>
              <option value="">All styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Class" htmlFor="cp-class">
          <Select id="cp-class" value={chosen?.id ?? ''} onChange={e => setClassId(e.target.value)}>
            {shown.map(c => <option key={c.id} value={c.id}>{c.name}{c.style ? ` · ${c.style}` : ''}</option>)}
          </Select>
        </Field>
      </div>

      {chosen?.depth === 'notes' && (
        <EmptyState title={`${chosen.name} tracks notes only`}
          body="No skill levels are kept for this class, so there is nothing to show here. Change it under Phrases and tracking on the class feedback page." />
      )}
      {chosen && chosen.depth !== 'notes' && cells.isLoading && <Skeleton className="h-48" />}
      {cells.error != null && <ErrorState error={cells.error} onRetry={() => cells.refetch()} />}
      {chosen && chosen.depth !== 'notes' && cells.data && m.skills.length === 0 && (
        <EmptyState title="No skills to show" body={`There are no ${chosen.style ?? ''} skills set up yet, or no children in the class track skills.`} />
      )}

      {m.skills.length > 0 && m.kids.length > 0 && (
        <>
          <p className="text-[0.8125rem] text-ink-3">
            Each level is a count of eight: Developing three, Secure six, Mastered all eight. Read only; change a level from the child.
            {drafts > 0 && ` ${drafts} level${drafts === 1 ? ' is' : 's are'} not shared with families yet, shown faded.`}
          </p>
          <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <table className="border-collapse text-[0.8125rem]">
              <caption className="sr-only">Skills for {chosen?.name}: children down the side, skills across</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 min-w-36 border-b-2 border-ink bg-surface pb-2 pr-3 text-left align-bottom"><span className="label">Child</span></th>
                  {m.skills.map(s => (
                    <th key={s.id} scope="col" className="min-w-24 max-w-32 border-b-2 border-ink px-2 pb-2 text-left align-bottom font-semibold leading-tight text-ink-2">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.kids.map(k => (
                  <tr key={k.id}>
                    <th scope="row" className="sticky left-0 z-10 border-b border-line bg-surface py-2.5 pr-3 text-left font-semibold">{k.name}</th>
                    {m.skills.map(s => {
                      const c = m.cell(k.id, s.id);
                      const draft = !!c?.level && !c.published;
                      const was = full && c?.previous && c.previous !== c.level ? `, was ${label(c.previous)}` : '';
                      const text = `${k.name}, ${s.name}: ${label(c?.level ?? null)}${was}${draft ? ', not shared yet' : ''}`;
                      return (
                        <td key={s.id} className="border-b border-line px-2 py-2.5 align-middle">
                          {c?.level
                            ? <span className={cn('inline-flex flex-col gap-1', draft && 'opacity-55')} title={text}>
                                <Beats value={LEVEL_BEATS[c.level]} max={8} size="sm" tone={c.level === 'mastered' ? 'positive' : 'ink'} label={text} />
                                <span aria-hidden className="text-[0.7188rem] text-ink-3">{P.LEVELS.find(x => x.key === c.level)?.short}{was && ` · was ${P.LEVELS.find(x => x.key === c.previous)?.short}`}</span>
                              </span>
                            : <span className="text-ink-3"><span aria-hidden>·</span><span className="sr-only">{text}</span></span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
