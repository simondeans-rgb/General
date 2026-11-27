'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import * as I from '@/lib/repos/inbox';
import { relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * A teacher's conversations with families (R-054). Only messages the teacher
 * started, and the replies to them, are here; everything is also in the
 * family's conversation with the office. Start a new one from a student.
 */
export default function TeacherMessages() {
  const rows = useRows<I.ThreadMsg>(['my-threads'], I.MY_THREADS);
  const threads = React.useMemo(() => {
    const byId = new Map((rows.data ?? []).map(m => [m.id, m]));
    const root = (m: I.ThreadMsg): string => { let x = m; while (x.reply_to && byId.has(x.reply_to)) x = byId.get(x.reply_to)!; return x.id; };
    const groups = new Map<string, I.ThreadMsg[]>();
    for (const m of rows.data ?? []) { const r = root(m); groups.set(r, [...(groups.get(r) ?? []), m]); }
    return [...groups.values()].sort((a, b) => +new Date(b.at(-1)!.sent_at) - +new Date(a.at(-1)!.sent_at));
  }, [rows.data]);

  return (
    <Shell title="Messages" subtitle="With families. The office can read these too." allow={['owner', 'admin', 'teacher']}>
      <div className="mx-auto max-w-2xl space-y-10">
        {rows.isLoading && <Skeleton className="h-32" />}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {rows.data?.length === 0 && (
          <EmptyState title="No conversations yet"
            body="Write to a family from a student’s page in Students. Their replies come here, and to the office." />
        )}
        {threads.map(t => <Thread key={t[0]!.id} msgs={t} />)}
      </div>
    </Shell>
  );
}

function Thread({ msgs }: { msgs: I.ThreadMsg[] }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [draft, setDraft] = React.useState('');
  const last = msgs.at(-1)!;
  const waiting = last.inbound;
  const send = useMutation({
    mutationFn: () => runAs(session, q => q(I.TEACHER_REPLY, [last.id, draft])),
    onSuccess: () => { setDraft(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  return (
    <section aria-labelledby={`th-${last.id}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 border-b-2 border-ink pb-2">
        <h2 id={`th-${last.id}`} className="section-title min-w-0 flex-1 truncate">{msgs[0]!.family_name}</h2>
        {waiting
          ? <span className="text-[0.8125rem] font-semibold text-caution">Waiting for your reply</span>
          : <span className="text-[0.8125rem] text-ink-3">Waiting for the family</span>}
      </div>
      {msgs[0]!.subject && <p className="pt-2 text-[0.8438rem] text-ink-3">{msgs[0]!.subject}</p>}
      <ul className="divide-y divide-line">
        {msgs.map(m => (
          <li key={m.id} className={cn('py-3', m.mine && 'pl-6 sm:pl-12')}>
            <p className="text-[0.8125rem] text-ink-3">
              <span className={cn('font-semibold', m.mine ? 'text-ink-2' : 'text-ink')}>{m.mine ? 'You' : m.sender ?? 'Family'}</span>
              {' · '}{relativeDay(m.sent_at)} {time(m.sent_at)}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-[0.9375rem] text-ink">{m.body}</p>
          </li>
        ))}
      </ul>
      {waiting && (
        <form className="flex items-end gap-2 border-t border-line pt-3" onSubmit={e => { e.preventDefault(); if (draft.trim()) send.mutate(); }}>
          <label htmlFor={`tr-${last.id}`} className="sr-only">Reply to the {msgs[0]!.family_name}</label>
          <textarea id={`tr-${last.id}`} rows={1} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Reply…"
            className="min-h-[44px] flex-1 resize-none rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem]
                       focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"
            style={{ fieldSizing: 'content' } as React.CSSProperties} />
          <Button type="submit" className="h-11 shrink-0" loading={send.isPending} disabled={!draft.trim()}>Send reply</Button>
        </form>
      )}
      {send.error != null && <div className="pt-3"><ErrorState error={send.error} /></div>}
    </section>
  );
}
