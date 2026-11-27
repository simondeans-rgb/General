'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Button, ErrorState, Input, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as P from '@/lib/repos/progress';

/**
 * A settings section: a heading on a 2px ink rule, an optional line beneath,
 * and an action on the right. Rules, not boxes (DESIGN-SYSTEM §1.2). Shared
 * by school settings, account and setup.
 */
export function SettingsSection({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <section {...rest} className={cn('min-w-0', className)}>{children}</section>;
}

export function SettingsHead({ title, subtitle, action, className }: {
  title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('border-b-2 border-ink pb-2', className)}>
      <div className="flex min-h-9 items-center gap-3">
        <h2 className="section-title min-w-0 flex-1">{title}</h2>
        {action}
      </div>
      {subtitle && <p className="text-[13px] text-ink-3">{subtitle}</p>}
    </div>
  );
}

const Card = SettingsSection, CardHeader = SettingsHead;

function useWrite() {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

/** The skills teachers assess, per style (R-020). Renaming keeps history; removing hides the skill going forward. */
export function FrameworkSettings() {
  const fws = useRows<P.Framework>(['frameworks'], P.FRAMEWORKS);
  const write = useWrite();
  const [adding, setAdding] = React.useState<Record<string, string>>({});
  return (
    <Card>
      <CardHeader title="Skills teachers assess" subtitle="One list per style. Teachers set each child’s level; families and students see it." />
      <SkillPublishSetting />
      {fws.isLoading && <div className="pt-3"><Skeleton className="h-24" /></div>}
      {write.error != null && <div className="pt-3"><ErrorState error={write.error} /></div>}
      <div className="grid gap-x-10 gap-y-6 pt-4 sm:grid-cols-2">
        {fws.data?.map(f => (
          <div key={f.id} className="min-w-0">
            <p className="border-b border-line pb-1.5 font-semibold">{f.style ?? f.name}</p>
            <ul className="divide-y divide-line">
              {f.skills.map(s => (
                <li key={s.id} className="group flex min-h-10 items-center gap-1 text-[14px]">
                  <input aria-label={`Rename ${s.name}`} defaultValue={s.name}
                    onBlur={e => e.target.value.trim() && e.target.value.trim() !== s.name && write.mutate({ sql: P.RENAME_SKILL, params: [s.id, e.target.value] })}
                    className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-1.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-line" />
                  <button aria-label={`Remove ${s.name}`} onClick={() => write.mutate({ sql: P.REMOVE_SKILL, params: [s.id] })}
                    className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical">
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <form className="mt-2 flex gap-1.5" onSubmit={e => { e.preventDefault(); const v = (adding[f.id] ?? '').trim();
              if (v) { write.mutate({ sql: P.ADD_SKILL, params: [f.id, v] }); setAdding(a => ({ ...a, [f.id]: '' })); } }}>
              <Input aria-label={`Add a skill to ${f.style}`} placeholder="Add a skill" value={adding[f.id] ?? ''}
                     onChange={e => setAdding(a => ({ ...a, [f.id]: e.target.value }))} className="h-9 text-[14px]" />
              <Button size="sm" type="submit" aria-label="Add"><Plus className="size-4" aria-hidden /></Button>
            </form>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** UR-48: do new skill levels reach families at once, or with the share step? */
function SkillPublishSetting() {
  const row = useRows<{ id: string; skill_publish: 'immediate' | 'with_share' }>(['skill-publish'], P.SKILL_PUBLISH);
  const write = useWrite();
  const cur = row.data?.[0];
  if (!cur) return null;
  return (
    <fieldset className="pt-4">
      <legend className="text-[14px] font-semibold">When families see a new level</legend>
      {write.error != null && <div className="pt-2"><ErrorState error={write.error} /></div>}
      {([['with_share', 'When the teacher shares it', 'Levels wait with the class feedback until the teacher taps Share. A mistake can be put right first.'],
         ['immediate', 'Straight away', 'Each level is visible to the family as soon as it is set.']] as const).map(([k, title, hint]) => (
        <label key={k} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
          <input type="radio" name="skill-publish" className="mt-1 size-4 accent-[var(--color-accent)]" checked={cur.skill_publish === k}
            onChange={() => write.mutate({ sql: P.SET_SKILL_PUBLISH, params: [cur.id, k] })} />
          <span><span className="block text-[15px] font-medium">{title}</span><span className="block text-[13px] text-ink-3">{hint}</span></span>
        </label>
      ))}
    </fieldset>
  );
}

/** The quick phrases teachers tap for class feedback (R-021). */
export function ChipSettings() {
  const chips = useRows<P.Chip>(['chips'], P.CHIPS);
  const write = useWrite();
  const [text, setText] = React.useState<Record<string, string>>({});
  return (
    <Card>
      <CardHeader title="Feedback phrases" subtitle="What teachers tap after class. Keep them short and kind. Teachers can keep their own set for a class." />
      {write.error != null && <div className="pt-3"><ErrorState error={write.error} /></div>}
      {(['standard', 'under_8'] as const).map(band => (
        <div key={band} className="pt-4">
          {band === 'under_8' && <p className="mb-1 text-[14px] font-semibold">For classes up to age 8 <span className="font-normal text-ink-3">· simple words, a sticker each</span></p>}
          <div className="grid gap-x-10 gap-y-6 pt-2 sm:grid-cols-2">
            {(['going_well', 'work_on'] as const).map(kind => {
              const key = `${band}-${kind}`;
              return (
                <div key={kind}>
                  <p className="mb-2 font-semibold">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {chips.data?.filter(c => c.kind === kind && (c.band ?? 'standard') === band).map(c => (
                      <span key={c.id} className="inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[14px]">
                        {c.sticker && <span aria-hidden className="mr-1">{c.sticker}</span>}{c.label}
                        <button aria-label={`Remove ${c.label}`} onClick={() => write.mutate({ sql: P.REMOVE_CHIP, params: [c.id] })}
                          className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical"><X className="size-3.5" aria-hidden /></button>
                      </span>
                    ))}
                  </div>
                  <form className="mt-2 flex gap-1.5" onSubmit={e => { e.preventDefault(); const v = (text[key] ?? '').trim();
                    if (v) { write.mutate(band === 'standard' ? { sql: P.ADD_CHIP, params: [kind, v] } : { sql: P.ADD_YOUNG_CHIP, params: [kind, v, ''] }); setText(t => ({ ...t, [key]: '' })); } }}>
                    <Input aria-label={`Add a ${kind === 'going_well' ? 'going well' : 'to work on'} phrase${band === 'under_8' ? ' for young classes' : ''}`} placeholder="Add a phrase" maxLength={40}
                           value={text[key] ?? ''} onChange={e => setText(t => ({ ...t, [key]: e.target.value }))} className="h-9 text-[14px]" />
                    <Button size="sm" type="submit" aria-label="Add"><Plus className="size-4" aria-hidden /></Button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Card>
  );
}
