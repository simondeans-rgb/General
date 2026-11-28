'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWrite } from '@/lib/write';
import { ArrowLeftRight, Undo2 } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Field, Input, Notice, Skeleton, StatusLine } from '@/components/ui';
import { SEND_DIRECT } from '@/lib/repos/inbox';
import * as H from '@/lib/repos/office';
import { dateShort } from '@/lib/format';

const textarea =
  'w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm ' +
  'focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12';

/** {{family}} becomes "the Wright family" in each copy. */
const merge = (text: string, family: string) => text.replace(/\{\{\s*family\s*\}\}/gi, family);

/**
 * One message to every family in a filtered list (UR-46), previewed before it
 * goes. Each family gets its own copy in its Messages, so each is logged on
 * that family's record. In-app only: email and text delivery are not connected.
 */
export function BulkMessageSheet({ families, filterLabel, onClose }: {
  families: { id: string; name: string }[]; filterLabel: string; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [step, setStep] = React.useState<'write' | 'preview'>('write');
  const [sent, setSent] = React.useState<number | null>(null);
  const send = useMutation({
    mutationFn: () => runAs(session, async q => {
      for (const f of families) await q(SEND_DIRECT, [f.id, merge(subject, f.name), merge(body, f.name)]);
      return families.length;
    }),
    onSuccess: n => { setSent(n); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  if (sent != null) {
    return (
      <RecordSheet title="Message families" onClose={onClose} onSave={onClose} saveLabel="Done">
        <StatusLine title={`Sent to ${sent} famil${sent === 1 ? 'y' : 'ies'}`}
          detail="Each family has its own copy in Messages, and it shows on their record." />
      </RecordSheet>
    );
  }

  const first = families[0];
  const ok = body.trim().length >= 2 && families.length > 0;
  return (
    <RecordSheet title="Message families" subtitle={`${families.length} famil${families.length === 1 ? 'y' : 'ies'} · ${filterLabel}`}
      onClose={onClose} error={send.error} saving={send.isPending}
      canSave={ok} saveHint={families.length === 0 ? 'No families match the filter.' : 'Write the message first.'}
      saveLabel={step === 'write' ? 'Preview' : `Send to ${families.length}`}
      onSave={() => step === 'write' ? setStep('preview') : send.mutate()}>
      {step === 'write' ? (
        <>
          <Field label="Subject" htmlFor="bm-subject">
            <Input id="bm-subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Costume fittings next week" />
          </Field>
          <Field label="Message" htmlFor="bm-body" required hint="Write {{family}} where the family’s name should go.">
            <textarea id="bm-body" rows={6} value={body} onChange={e => setBody(e.target.value)} className={textarea} />
          </Field>
          <p className="text-[0.8125rem] text-ink-3">Sent in the app. Families with email or text switched on are not emailed: delivery is not connected yet.</p>
        </>
      ) : (
        <>
          {first && (
            <div className="border-l-2 border-line-strong pl-3">
              <p className="label">As {first.name} will see it</p>
              {subject && <p className="mt-1 font-semibold">{merge(subject, first.name)}</p>}
              <p className="mt-1 whitespace-pre-wrap text-[0.875rem] text-ink-2">{merge(body, first.name)}</p>
            </div>
          )}
          <div>
            <p className="label">Going to</p>
            <p className="mt-1 text-[0.8438rem] text-ink-2">{families.map(f => f.name).join(', ')}</p>
          </div>
          <Button size="sm" variant="ghost" className="-ml-2" onClick={() => setStep('write')}>Change the message</Button>
        </>
      )}
    </RecordSheet>
  );
}

/**
 * Possible duplicate families, and merging them (UR-57). Nothing merges
 * without a preview of what moves; every moved row is recorded so the merge
 * can be undone for 30 days, and both families' histories say what happened.
 */
export function DuplicatesSheet({ onClose }: { onClose: () => void }) {
  const dups = useRows<H.Duplicate>(['family-duplicates'], H.FAMILY_DUPLICATES);
  const merges = useRows<{ id: string; merged_at: string; kept_name: string; merged_name: string; can_undo: boolean; undone_at: string | null }>(
    ['recent-merges'], H.RECENT_MERGES);
  const [pair, setPair] = React.useState<H.Duplicate | null>(null);
  const undo = useWrite(H.UNDO_MERGE);

  if (pair) return <MergeSheet pair={pair} onClose={onClose} onBack={() => setPair(null)} />;

  return (
    <RecordSheet title="Possible duplicates" subtitle="Families that may be the same household" onClose={onClose}
      onSave={onClose} saveLabel="Done" error={undo.error}>
      {dups.isPending && <Skeleton className="h-24" />}
      {dups.data?.length === 0 && <p className="text-[0.875rem] text-ink-3">No likely duplicates. Families are compared by guardian email and phone, children’s names and birthdays, and family name.</p>}
      <ul className="divide-y divide-line">
        {dups.data?.map(d => (
          <li key={d.keep_id + d.other_id} className="flex items-start gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{d.keep_name} and {d.other_name}</span>
              <span className="block text-[0.8125rem] text-ink-3">{d.reason}</span>
            </span>
            <Button size="sm" onClick={() => setPair(d)}>Compare</Button>
          </li>
        ))}
      </ul>
      {!!merges.data?.length && (
        <div>
          <p className="border-b border-ink pb-1 text-[0.875rem] font-semibold">Recent merges</p>
          <ul className="divide-y divide-line">
            {merges.data.map(m => (
              <li key={m.id} className="flex items-center gap-3 py-2 text-[0.8438rem]">
                <span className="min-w-0 flex-1">{m.merged_name} into {m.kept_name} · {dateShort(m.merged_at)}
                  {m.undone_at && <span className="text-ink-3"> · undone</span>}</span>
                {m.can_undo && (
                  <Button size="sm" variant="ghost" loading={undo.isPending} onClick={() => undo.mutate([m.id])}>
                    <Undo2 className="size-4" aria-hidden /> Undo
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </RecordSheet>
  );
}

function MergeSheet({ pair, onClose, onBack }: { pair: H.Duplicate; onClose: () => void; onBack: () => void }) {
  const [swap, setSwap] = React.useState(false);
  const keep = swap ? { id: pair.other_id, name: pair.other_name } : { id: pair.keep_id, name: pair.keep_name };
  const gone = swap ? { id: pair.keep_id, name: pair.keep_name } : { id: pair.other_id, name: pair.other_name };
  const preview = useRows<{ tbl: string; n: number }>(['merge-preview', keep.id, gone.id], H.MERGE_PREVIEW, [keep.id, gone.id]);
  const people = useRows<{ family_id: string; kind: string; name: string }>(['merge-people', keep.id, gone.id], `
    select g.family_id, 'Guardian' as kind, g.full_name || coalesce(' · ' || g.email, '') as name from guardian g
     where g.family_id in ($1, $2) and g.deleted_at is null
    union all
    select s.family_id, 'Child', s.first_name || ' ' || s.last_name || ' · born ' || to_char(s.date_of_birth, 'DD Mon YYYY') from student s
     where s.family_id in ($1, $2) and s.deleted_at is null
    order by 1, 2, 3`, [keep.id, gone.id]);
  const [done, setDone] = React.useState<string | null>(null);
  const mergeIt = useWrite(H.MERGE_FAMILIES, rows => setDone(rows[0]?.id ?? ''));
  const undo = useWrite(H.UNDO_MERGE, () => setDone(null));

  if (done != null) {
    return (
      <RecordSheet title="Merged" onClose={onClose} onSave={onClose} saveLabel="Done" error={undo.error}>
        <StatusLine title={`${gone.name} is now part of ${keep.name}`}
          detail="Everything that moved is recorded, and both families’ histories say so. You can undo this for 30 days." />
        <Button size="sm" variant="ghost" className="-ml-2" loading={undo.isPending} onClick={() => undo.mutate([done])}>
          <Undo2 className="size-4" aria-hidden /> Undo the merge
        </Button>
      </RecordSheet>
    );
  }

  const LABEL: Record<string, string> = { guardian: 'guardians', student: 'children', invoice: 'invoices', payment: 'payments',
    communication: 'messages', enquiry: 'enquiries', family_discount: 'discounts', pack_purchase: 'class packs',
    studio_request: 'requests', ticket_booking: 'ticket bookings', studio_invitation: 'invitations', automation_run: 'automatic messages' };
  const side = (f: { id: string; name: string }, title: string) => (
    <div className="min-w-0">
      <p className="label">{title}</p>
      <p className="mt-0.5 font-semibold">{f.name}</p>
      <ul className="mt-1 space-y-0.5 text-[0.8125rem] text-ink-2">
        {people.data?.filter(p => p.family_id === f.id).map((p, i) => <li key={i}><span className="text-ink-3">{p.kind}:</span> {p.name}</li>)}
      </ul>
    </div>
  );

  return (
    <RecordSheet title="Merge two families" subtitle={pair.reason} onClose={onBack}
      error={mergeIt.error} saving={mergeIt.isPending} canSave={!!preview.data}
      saveLabel={`Merge into ${keep.name}`} onSave={() => mergeIt.mutate([keep.id, gone.id])}>
      <div className="grid gap-4 sm:grid-cols-2">
        {side(keep, 'Keep')}
        {side(gone, 'Merge in, then hide')}
      </div>
      <Button size="sm" variant="ghost" className="-ml-2" onClick={() => setSwap(s => !s)}>
        <ArrowLeftRight className="size-4" aria-hidden /> Keep {gone.name} instead
      </Button>
      <div className="border-l-2 border-line-strong pl-3 text-[0.8438rem] text-ink-2">
        {preview.isPending ? 'Working out what moves…' : preview.data?.length
          ? <>Moves to {keep.name}: {preview.data.map(p => `${p.n} ${LABEL[p.tbl] ?? p.tbl.replace(/_/g, ' ')}`).join(', ')}.</>
          : <>{gone.name} has nothing attached; it is simply hidden.</>}
        {' '}Children are not merged with each other: if the same child is listed twice, remove one copy afterwards.
        The balance is worked out again. You can undo this for 30 days.
      </div>
    </RecordSheet>
  );
}


