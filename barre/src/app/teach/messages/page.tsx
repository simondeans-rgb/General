'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CornerUpLeft, MessageSquare, Send } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
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
    <Shell title="Messages" subtitle="Your conversations with families. The office can read them too." allow={['owner', 'admin', 'teacher']}>
      <div className="mx-auto max-w-2xl space-y-4">
        {rows.isLoading && <Skeleton className="h-32" />}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {rows.data?.length === 0 && (
          <EmptyState icon={<MessageSquare className="size-5" />} title="No conversations yet"
            body="Write to a family from a student’s page. Their replies come here, and to the office." />
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
    <Card>
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="min-w-0 truncate font-semibold">{msgs[0]!.family_name}</h2>
        <span className="shrink-0 text-[12.5px] text-ink-3">{msgs[0]!.subject}</span>
      </div>
      <ul className="space-y-2 bg-surface-2/40 p-4">
        {msgs.map(m => (
          <li key={m.id} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-[14.5px] shadow-xs',
              m.mine ? 'rounded-br-sm bg-accent text-on-accent' : 'rounded-bl-sm border border-line bg-surface')}>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={cn('mt-1 text-[11.5px]', m.mine ? 'text-on-accent opacity-80' : 'text-ink-3')}>
                {m.mine ? 'You' : m.sender ?? 'Family'} · {relativeDay(m.sent_at)} {time(m.sent_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {waiting ? (
        <form className="flex items-end gap-2 border-t border-line p-3" onSubmit={e => { e.preventDefault(); if (draft.trim()) send.mutate(); }}>
          <label htmlFor={`tr-${last.id}`} className="sr-only">Reply to the {msgs[0]!.family_name}</label>
          <textarea id={`tr-${last.id}`} rows={1} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Reply…"
            className="min-h-[44px] flex-1 resize-none rounded-[22px] border border-line-strong bg-surface px-4 py-2.5 text-[15px]"
            style={{ fieldSizing: 'content' } as React.CSSProperties} />
          <Button type="submit" variant="primary" className="size-11 shrink-0 rounded-full p-0" aria-label="Send reply" loading={send.isPending} disabled={!draft.trim()}>
            {!send.isPending && <Send className="size-4" aria-hidden />}
          </Button>
        </form>
      ) : (
        <p className="flex items-center gap-1.5 border-t border-line px-4 py-2.5 text-[12.5px] text-ink-3">
          <CornerUpLeft className="size-3.5" aria-hidden /> Waiting for the family to reply.
        </p>
      )}
      {send.error != null && <div className="p-3"><ErrorState error={send.error} /></div>}
    </Card>
  );
}
