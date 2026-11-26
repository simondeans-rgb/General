'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Field, Select } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as C from '@/lib/repos/classes';

function useCopy(onDone: (r: C.CopyResult) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { ids: string[]; term: string; reenrol: boolean }) =>
      (await runAs(session, q => q<{ r: C.CopyResult }>(C.COPY_CLASSES, [v.ids, v.term, v.reenrol])))[0]!.r,
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); onDone(r); },
  });
}

function Result({ r }: { r: C.CopyResult }) {
  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-semibold text-positive">Done.</span>{' '}
        {r.classes} class{r.classes === 1 ? '' : 'es'} set up, with {r.sessions} sessions.
        {r.enrolled > 0 && ` ${r.enrolled} students carried over.`}</p>
      {r.skipped > 0 && <p className="text-ink-2">{r.skipped} were already in that term and were left alone.</p>}
      {r.not_fitted.length > 0 && (
        <div className="border-l-2 border-caution py-1 pl-3">
          <p className="font-semibold"><span className="text-caution">No room</span> for {r.not_fitted.length}:</p>
          <ul className="mt-1 list-disc pl-5 text-[13.5px] text-ink-2">
            {r.not_fitted.map((n, i) => <li key={i}>{n.student} — {n.class}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

/** "Start next term": copy the current term's classes into another, with their students. */
export function TermRollover({ fromTerm, classes, onClose }: { fromTerm: C.TermRow; classes: C.ClassRow[]; onClose: () => void }) {
  const terms = useRows<C.TermRow>(['term-tabs'], C.TERM_TABS);
  const targets = (terms.data ?? []).filter(t => t.id !== fromTerm.id && t.starts_on > fromTerm.starts_on);
  const [to, setTo] = React.useState('');
  const target = to || targets[0]?.id || '';
  const [picked, setPicked] = React.useState<Set<string>>(() => new Set(classes.map(c => c.id)));
  const [reenrol, setReenrol] = React.useState(true);
  const [result, setResult] = React.useState<C.CopyResult | null>(null);
  const copy = useCopy(setResult);
  if (result) return <RecordSheet title="Next term is ready" onClose={onClose} onSave={onClose} saveLabel="Done"><Result r={result} /></RecordSheet>;
  return (
    <RecordSheet title="Start next term" subtitle={`Copy classes from ${fromTerm.name}`} onClose={onClose}
      saving={copy.isPending} error={copy.error} canSave={!!target && picked.size > 0}
      saveLabel={`Copy ${picked.size} class${picked.size === 1 ? '' : 'es'}`}
      onSave={() => copy.mutate({ ids: [...picked], term: target, reenrol })}>
      {targets.length === 0 ? (
        <p className="text-sm text-ink-2">Add the next term first, in School settings → Terms, with its dates and breaks. Then come back here.</p>
      ) : (
        <>
          <Field label="Into" htmlFor="ro-term" hint="Sessions are laid down between its dates, skipping its breaks.">
            <Select id="ro-term" value={target} onChange={e => setTo(e.target.value)}>
              {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <label className="flex items-start gap-2.5 text-sm">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" checked={reenrol} onChange={e => setReenrol(e.target.checked)} />
            <span className="font-semibold">Carry the students over too<span className="block text-[13px] font-normal text-ink-3">Longest-standing first, never beyond a class’s places. Anyone who does not fit is listed.</span></span>
          </label>
          <fieldset>
            <legend className="w-full border-b-2 border-ink pb-1.5 text-[14px] font-semibold">Classes <span className="font-normal text-ink-3">{picked.size} of {classes.length} chosen</span></legend>
            <ul className="max-h-60 divide-y divide-line overflow-y-auto">
              {classes.map(c => (
                <li key={c.id}>
                  <label className="flex min-h-11 items-center gap-2.5 py-2 text-sm">
                    <input type="checkbox" className="size-5 shrink-0 accent-[var(--color-accent)]" checked={picked.has(c.id)}
                      onChange={e => setPicked(p => { const n = new Set(p); e.target.checked ? n.add(c.id) : n.delete(c.id); return n; })} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="tnum text-[13px] text-ink-3">{c.enrolled} students</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </>
      )}
    </RecordSheet>
  );
}

/** Duplicate one class into the same term (or another), without its students. */
export function DuplicateClass({ c, onClose }: { c: C.ClassRow; onClose: () => void }) {
  const terms = useRows<C.TermRow>(['term-tabs'], C.TERM_TABS);
  const [to, setTo] = React.useState(c.term_id);
  const [result, setResult] = React.useState<C.CopyResult | null>(null);
  const copy = useCopy(setResult);
  if (result) return <RecordSheet title="Duplicated" onClose={onClose} onSave={onClose} saveLabel="Done">
    <Result r={result} /><p className="text-[13px] text-ink-2">Edit the copy to change its day, time or name.</p></RecordSheet>;
  return (
    <RecordSheet title="Duplicate class" subtitle={c.name} onClose={onClose} saving={copy.isPending} error={copy.error}
      saveLabel="Duplicate" onSave={() => copy.mutate({ ids: [c.id], term: to, reenrol: false })}>
      <Field label="Into" htmlFor="dup-term" hint="Same teacher, room, price and settings. Nobody is enrolled.">
        <Select id="dup-term" value={to} onChange={e => setTo(e.target.value)}>
          {terms.data?.map(t => <option key={t.id} value={t.id}>{t.name}{t.id === c.term_id ? ' (this term)' : ''}</option>)}
        </Select>
      </Field>
    </RecordSheet>
  );
}
