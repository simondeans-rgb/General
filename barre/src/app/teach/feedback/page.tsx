'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, CheckCircle2, Send } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
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
      setDone(share ? 'Shared with families. They have been told.' : `${n} draft${n === 1 ? '' : 's'} saved — nothing is shared yet.`);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  const drafted = (kids.data ?? []).filter(k => k.going_well || k.work_on).length;
  const unshared = (kids.data ?? []).filter(k => (k.going_well || k.work_on) && !k.shared).length;

  return (
    <Shell title={m ? `Feedback: ${m.name}` : 'Class feedback'} subtitle={m ? `${dateLong(m.starts_at)} · ${time(m.starts_at)}` : undefined}
      allow={['owner', 'admin', 'teacher']}
      actions={<Link href={`/teach/register/?session=${sessionId}`} aria-label="Back to the register"
        className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><ArrowLeft className="size-4" aria-hidden /></Link>}>
      <div className="mx-auto max-w-2xl space-y-4">
        {done && <p role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]">
          <CheckCircle2 className="size-4 text-positive" aria-hidden /> {done}</p>}
        {save.error != null && <ErrorState error={save.error} />}
        {kids.isLoading && <Skeleton className="h-40" />}
        {kids.data && list.length === 0 && <Card><EmptyState title="Nobody to give feedback to" body="Take the register first." /></Card>}
        <Card>
          <ul className="divide-y divide-line">
            {list.map(k => {
              const d = drafts[k.student_id];
              const isOpen = open === k.student_id;
              const has = d && (d.going_well.length || d.work_on.length || d.note.trim() || Object.keys(d.skills).length);
              return (
                <li key={k.student_id}>
                  <button className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2', isOpen && 'bg-surface-2')}
                          aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k.student_id)}>
                    <span className="min-w-0 flex-1 font-medium">{k.first_name} {k.last_name}</span>
                    {has ? <Badge tone="info">Edited</Badge> : k.shared ? <Badge tone="positive">Shared</Badge>
                      : (k.going_well || k.work_on) ? <Badge tone="neutral">Draft</Badge> : null}
                  </button>
                  {isOpen && (
                    <div className="space-y-3 bg-surface-2/50 px-4 pb-4">
                      {(['going_well', 'work_on'] as const).map(kind => (
                        <div key={kind}>
                          <p className="mb-1 text-[12px] font-semibold text-ink-3">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {chips.data?.filter(c => c.kind === kind).map(c => {
                              const on = d?.[kind].includes(c.label);
                              return (
                                <button key={c.id} aria-pressed={!!on} onClick={() => toggle(k.student_id, kind, c.label)}
                                  className={cn('rounded-full border px-3 py-1 text-[13px]',
                                    on ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface hover:bg-surface-2')}>
                                  {on && <Check className="mr-1 inline size-3" aria-hidden />}{c.label}
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
        </Card>
        <div className="flex gap-2">
          <Button className="flex-1" disabled={!touched.length} loading={save.isPending && save.variables === false} onClick={() => save.mutate(false)}>
            Save {touched.length || ''} draft{touched.length === 1 ? '' : 's'}
          </Button>
          <Button className="flex-1" variant="primary" disabled={!touched.length && !unshared} loading={save.isPending && save.variables === true}
                  onClick={() => save.mutate(true)}>
            <Send className="size-4" aria-hidden /> Share with families
          </Button>
        </div>
        <p className="text-center text-[12.5px] text-ink-3">{drafted} of {list.length} have feedback for this class.</p>
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
        className="h-8 rounded-[var(--radius-md)] border border-line bg-surface px-2 text-[13px]">
        <option value="">Move a skill on…</option>
        {skills.data.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill}{s.level ? ` (${P.LEVELS.find(l => l.key === s.level)?.label})` : ''}</option>)}
      </select>
      {cur && P.LEVELS.slice(1).map(l => (
        <button key={l.key} aria-pressed={value[cur.skill_id] === l.key}
          onClick={() => onChange({ ...value, [cur.skill_id]: l.key })}
          className={cn('rounded-full border px-2.5 py-0.5 text-[12.5px]', value[cur.skill_id] === l.key ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface')}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
