'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, EmptyState, ErrorState, Input, Notice, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import * as T from '@/lib/repos/teaching';
import { time, dateLong } from '@/lib/format';
import { cn } from '@/lib/cn';

type Draft = { going_well: string[]; work_on: string[]; note: string; skills: Record<string, P.Level> };
const empty = (): Draft => ({ going_well: [], work_on: [], note: '', skills: {} });

export default function ClassFeedbackPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><ClassFeedback /></Suspense>;
}

/**
 * Feedback for a whole class in a few minutes (R-021): tap a child, tap the
 * phrases that fit, optionally a note or a skill, move to the next. Nothing
 * reaches a family until "Share with families".
 */
function ClassFeedback() {
  const sessionId = useSearchParams().get('session') ?? '';
  const { session } = useSession();
  const qc = useQueryClient();
  const meta = useRows<T.TeachSession>(['session-meta', sessionId], `select cs.id, c.name, cs.starts_at, c.dance_style_id
    from class_session cs join class c on c.id = cs.class_id where cs.id = $1`, [sessionId], { enabled: !!sessionId });
  const kids = useRows<P.FeedbackKid>(['session-feedback', sessionId], P.SESSION_FEEDBACK, [sessionId], { enabled: !!sessionId });
  const chips = useRows<P.Chip>(['chips'], P.CHIPS);
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});
  const [open, setOpen] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const m = meta.data?.[0];

  const list = (kids.data ?? []).filter(k => k.status !== 'absent' && k.status !== 'excused');
  const touched = Object.entries(drafts).filter(([, d]) => d.going_well.length || d.work_on.length || d.note.trim() || Object.keys(d.skills).length);
  const upd = (id: string, f: (d: Draft) => Draft) => setDrafts(x => ({ ...x, [id]: f(x[id] ?? empty()) }));
  const toggle = (id: string, kind: 'going_well' | 'work_on', label: string) =>
    upd(id, d => ({ ...d, [kind]: d[kind].includes(label) ? d[kind].filter(l => l !== label) : [...d[kind], label] }));

  const save = useMutation({
    mutationFn: async (share: boolean) => {
      const items = touched.map(([student_id, d]) => ({ student_id, going_well: d.going_well, work_on: d.work_on, note: d.note,
        skills: Object.entries(d.skills).map(([skill_id, level]) => ({ skill_id, level })) }));
      return runAs(session, async q => {
        const [r] = await q<{ n: number }>(P.SAVE_CLASS_FEEDBACK, [sessionId, JSON.stringify(items), false]);
        if (share) await q(P.SHARE_SESSION_FEEDBACK, [sessionId]);
        return { n: r?.n ?? 0, share };
      });
    },
    onSuccess: ({ n, share }) => {
      setDrafts({}); setOpen(null);
      setDone(share ? 'Families can see it now, and have been told.' : `${n} draft${n === 1 ? '' : 's'} saved — nothing is shared yet.`);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  const drafted = (kids.data ?? []).filter(k => k.going_well || k.work_on).length;
  const unshared = (kids.data ?? []).filter(k => (k.going_well || k.work_on) && !k.shared).length;

  return (
    <Shell title={m ? m.name : 'Class feedback'} subtitle={m ? `Feedback · ${dateLong(m.starts_at)} · ${time(m.starts_at)}` : undefined}
      allow={['owner', 'admin', 'teacher']}
      actions={<Link href={`/teach/register/?session=${sessionId}`} aria-label="Back to the register"
        className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><ArrowLeft className="size-5" aria-hidden /></Link>}>
      <div className="mx-auto max-w-2xl space-y-6">
        {done && <div role="status"><Notice word={done.includes('draft') ? 'Saved' : 'Shared'} tone="positive" title={done} /></div>}
        {save.error != null && <ErrorState error={save.error} />}
        {kids.isLoading && <Skeleton className="h-40" />}
        {kids.data && list.length === 0 && <EmptyState title="Nobody to give feedback to" body="Take the register first. Feedback is for the children who were there."
          action={<Link href={`/teach/register/?session=${sessionId}`}><Button tabIndex={-1}>Open register</Button></Link>} />}

        {list.length > 0 && (
          <section aria-labelledby="fb-h">
            <div className="mb-1 flex items-center gap-3 border-b-2 border-ink pb-2">
              <h2 id="fb-h" className="section-title flex-1">Tap a child, tap what fits</h2>
              <span className="tnum text-[13px] text-ink-3">{drafted} of {list.length} done</span>
              <Beats value={drafted} max={list.length} label={`${drafted} of ${list.length} have feedback`} />
            </div>
            <ul className="divide-y divide-line">
              {list.map(k => {
                const d = drafts[k.student_id];
                const isOpen = open === k.student_id;
                const has = d && (d.going_well.length || d.work_on.length || d.note.trim() || Object.keys(d.skills).length);
                const state = has ? ['Not saved yet', 'text-accent-text font-semibold'] : k.shared ? ['Shared', 'text-positive font-semibold']
                  : (k.going_well || k.work_on) ? ['Draft', 'text-ink-2'] : null;
                return (
                  <li key={k.student_id}>
                    <button className="flex min-h-14 w-full items-center gap-3 py-3 text-left hover:bg-surface-2/60"
                            aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k.student_id)}>
                      <span className="min-w-0 flex-1 text-[16px] font-semibold">{k.first_name} {k.last_name}</span>
                      {state && <span className={cn('text-[13px]', state[1])}>{state[0]}</span>}
                      <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="space-y-4 pb-5">
                        {(['going_well', 'work_on'] as const).map(kind => (
                          <div key={kind} role="group" aria-label={kind === 'going_well' ? 'Going well' : 'To work on'}>
                            <p className="mb-1.5 text-[13px] font-semibold text-ink-2">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
                            <div className="flex flex-wrap gap-2">
                              {chips.data?.filter(c => c.kind === kind).map(c => {
                                const on = d?.[kind].includes(c.label);
                                return (
                                  <button key={c.id} aria-pressed={!!on} onClick={() => toggle(k.student_id, kind, c.label)}
                                    className={cn('inline-flex min-h-10 items-center rounded-full border px-3.5 text-[14px] font-medium',
                                      on ? 'border-ink bg-ink text-surface' : 'border-line-strong bg-surface text-ink hover:bg-surface-2')}>
                                    {on && <Check className="mr-1 size-3.5" aria-hidden />}{c.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <Input aria-label={`A note for ${k.first_name}`} placeholder="Anything else (optional)" value={d?.note ?? ''}
                               onChange={e => upd(k.student_id, x => ({ ...x, note: e.target.value }))} />
                        <SkillPicker studentId={k.student_id} value={d?.skills ?? {}}
                                     onChange={sk => upd(k.student_id, x => ({ ...x, skills: sk }))} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {list.length > 0 && (
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button className="sm:flex-1" size="lg" disabled={!touched.length} loading={save.isPending && save.variables === false} onClick={() => save.mutate(false)}>
                Save {touched.length || ''} draft{touched.length === 1 ? '' : 's'}
              </Button>
              <Button className="sm:flex-1" size="lg" variant="primary" disabled={!touched.length && !unshared} loading={save.isPending && save.variables === true}
                      onClick={() => save.mutate(true)}>
                Share with families
              </Button>
            </div>
            <p className="text-[13px] text-ink-3">Nothing reaches a family until you share.{unshared ? ` ${unshared} saved draft${unshared === 1 ? '' : 's'} waiting.` : ''}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

/** One optional skill change per child, in two taps. */
function SkillPicker({ studentId, value, onChange }: { studentId: string; value: Record<string, P.Level>; onChange: (v: Record<string, P.Level>) => void }) {
  const skills = useRows<P.SkillRow>(['skills', studentId], P.STUDENT_SKILLS, [studentId]);
  const [skill, setSkill] = React.useState('');
  if (!skills.data?.length) return null;
  const cur = skills.data.find(s => s.skill_id === skill);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select aria-label="Skill" value={skill} onChange={e => setSkill(e.target.value)}
        className="h-10 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[14px]">
        <option value="">Move a skill on…</option>
        {skills.data.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill}{s.level ? ` (${P.LEVELS.find(l => l.key === s.level)?.label})` : ''}</option>)}
      </select>
      {cur && P.LEVELS.slice(1).map(l => (
        <button key={l.key} aria-pressed={value[cur.skill_id] === l.key}
          onClick={() => onChange({ ...value, [cur.skill_id]: l.key })}
          className={cn('inline-flex min-h-10 items-center rounded-full border px-3.5 text-[14px] font-medium', value[cur.skill_id] === l.key ? 'border-ink bg-ink text-surface' : 'border-line-strong bg-surface')}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
