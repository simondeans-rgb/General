'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRows, useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, SectionHead } from '@/components/ui';
import * as S from '@/lib/repos/seasons';

/** What to wear, as a plain list, with the shop link when there is one. */
export function UniformList({ items, url, className }: { items: string[]; url?: string | null; className?: string }) {
  if (!items.length && !url) return null;
  return (
    <span className={className}>
      {items.join(', ')}
      {url && <>{items.length ? ' · ' : ''}<a href={url} target="_blank" rel="noreferrer" className="font-medium text-accent-text underline">Where to buy it</a></>}
    </span>
  );
}

/** The class page: the uniform for this class; the office edits it here. */
export function ClassUniform({ classId, canEdit }: { classId: string; canEdit: boolean }) {
  const u = useRow<S.Uniform>(['class-uniform', classId], S.CLASS_UNIFORM, [classId]);
  const { session } = useSession();
  const qc = useQueryClient();
  const [editing, setEditing] = React.useState(false);
  const [f, setF] = React.useState({ items: '', url: '' });
  const save = useMutation({
    mutationFn: async () => runAs(session, q => q(S.SET_CLASS_UNIFORM, [classId, f.items.split('\n').map(x => x.trim()).filter(Boolean), f.url])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); setEditing(false); },
  });
  const items = u.data?.uniform ?? [];
  if (!u.data || (!items.length && !u.data.uniform_url && !canEdit)) return null;
  return (
    <section aria-labelledby="uniform-h">
      <SectionHead id="uniform-h" title="Uniform"
        action={canEdit && !editing && <Button size="sm" variant="ghost" onClick={() => { setF({ items: items.join('\n'), url: u.data?.uniform_url ?? '' }); setEditing(true); }}>Edit</Button>} />
      {!editing && (items.length
        ? <ul className="divide-y divide-line text-[0.9062rem]">{items.map(i => <li key={i} className="py-2">{i}</li>)}</ul>
        : <p className="py-2 text-[0.875rem] text-ink-3">{canEdit ? 'No uniform listed. Families see it on the joining page and their child’s card.' : ''}</p>)}
      {!editing && u.data.uniform_url && (
        <p className="py-2 text-[0.875rem]"><a href={u.data.uniform_url} target="_blank" rel="noreferrer" className="font-semibold text-accent-text underline">Where to buy it</a></p>
      )}
      {editing && (
        <div className="space-y-3 py-3">
          <Field label="What to wear" htmlFor="uni-items" hint="One item per line, for example Pink ballet shoes">
            <textarea id="uni-items" rows={5} value={f.items} onChange={e => setF({ ...f, items: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
          <Field label="Shop link (optional)" htmlFor="uni-url" hint="Starts with https://">
            <Input id="uni-url" type="url" value={f.url} placeholder="https://" onChange={e => setF({ ...f, url: e.target.value })} />
          </Field>
          {save.error != null && <ErrorState error={save.error} />}
          <div className="flex gap-2">
            <Button variant="primary" loading={save.isPending} onClick={() => save.mutate()}>Save uniform</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </section>
  );
}

/** A family's child card: the uniform for each class the child is in. */
export function ChildUniform({ studentId, wrap }: { studentId: string; wrap: (content: React.ReactNode) => React.ReactNode }) {
  const rows = useRows<S.ChildUniformRow>(['child-uniform', studentId], S.CHILD_UNIFORM, [studentId]);
  if (!rows.data?.length) return null;
  return <>{wrap(
    <ul className="space-y-1.5">
      {rows.data.map(r => (
        <li key={r.class_id}><span className="font-semibold">{r.class_name}:</span> <UniformList items={r.uniform} url={r.uniform_url} className="text-ink-2" /></li>
      ))}
    </ul>,
  )}</>;
}
