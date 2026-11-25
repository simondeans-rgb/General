'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Button, Card, CardHeader, ErrorState, Input, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as P from '@/lib/repos/progress';

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
      {fws.isLoading && <div className="p-4"><Skeleton className="h-24" /></div>}
      {write.error != null && <div className="px-4"><ErrorState error={write.error} /></div>}
      <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2">
        {fws.data?.map(f => (
          <div key={f.id} className="rounded-[var(--radius-md)] border border-line p-3">
            <p className="mb-2 font-medium">{f.style ?? f.name}</p>
            <ul className="space-y-1">
              {f.skills.map(s => (
                <li key={s.id} className="group flex items-center gap-1 text-sm">
                  <input aria-label={`Rename ${s.name}`} defaultValue={s.name}
                    onBlur={e => e.target.value.trim() && e.target.value.trim() !== s.name && write.mutate({ sql: P.RENAME_SKILL, params: [s.id, e.target.value] })}
                    className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-0.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none" />
                  <button aria-label={`Remove ${s.name}`} onClick={() => write.mutate({ sql: P.REMOVE_SKILL, params: [s.id] })}
                    className="grid size-6 place-items-center rounded text-ink-3 opacity-60 hover:bg-surface-2 hover:text-critical group-hover:opacity-100">
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <form className="mt-2 flex gap-1.5" onSubmit={e => { e.preventDefault(); const v = (adding[f.id] ?? '').trim();
              if (v) { write.mutate({ sql: P.ADD_SKILL, params: [f.id, v] }); setAdding(a => ({ ...a, [f.id]: '' })); } }}>
              <Input aria-label={`Add a skill to ${f.style}`} placeholder="Add a skill" value={adding[f.id] ?? ''}
                     onChange={e => setAdding(a => ({ ...a, [f.id]: e.target.value }))} className="h-8 text-[13px]" />
              <Button size="sm" type="submit" aria-label="Add"><Plus className="size-4" aria-hidden /></Button>
            </form>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** The quick phrases teachers tap for class feedback (R-021). */
export function ChipSettings() {
  const chips = useRows<P.Chip>(['chips'], P.CHIPS);
  const write = useWrite();
  const [text, setText] = React.useState<Record<string, string>>({});
  return (
    <Card>
      <CardHeader title="Feedback phrases" subtitle="What teachers tap after class. Keep them short and kind." />
      {write.error != null && <div className="px-4"><ErrorState error={write.error} /></div>}
      <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2">
        {(['going_well', 'work_on'] as const).map(kind => (
          <div key={kind}>
            <p className="mb-2 text-[13px] font-medium text-ink-2">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
            <div className="flex flex-wrap gap-1.5">
              {chips.data?.filter(c => c.kind === kind).map(c => (
                <span key={c.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[13px]">
                  {c.label}
                  <button aria-label={`Remove ${c.label}`} onClick={() => write.mutate({ sql: P.REMOVE_CHIP, params: [c.id] })}
                    className="text-ink-3 hover:text-critical"><X className="size-3" aria-hidden /></button>
                </span>
              ))}
            </div>
            <form className="mt-2 flex gap-1.5" onSubmit={e => { e.preventDefault(); const v = (text[kind] ?? '').trim();
              if (v) { write.mutate({ sql: P.ADD_CHIP, params: [kind, v] }); setText(t => ({ ...t, [kind]: '' })); } }}>
              <Input aria-label={`Add a ${kind === 'going_well' ? 'going well' : 'to work on'} phrase`} placeholder="Add a phrase" maxLength={40}
                     value={text[kind] ?? ''} onChange={e => setText(t => ({ ...t, [kind]: e.target.value }))} className="h-8 text-[13px]" />
              <Button size="sm" type="submit" aria-label="Add"><Plus className="size-4" aria-hidden /></Button>
            </form>
          </div>
        ))}
      </div>
    </Card>
  );
}
