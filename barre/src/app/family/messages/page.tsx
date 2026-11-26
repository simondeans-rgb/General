'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CornerUpLeft, Send, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import * as I from '@/lib/repos/inbox';
import { relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'studio' | 'notices';

/**
 * A parent's messages: one conversation with the studio, and the notices
 * sent to their children's classes. Like a messaging app, not an email client.
 */
export default function FamilyMessages() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = React.useState<Tab>('studio');
  const conv = useRows<I.Message>(['my-conversation'], I.MY_CONVERSATION);
  const notices = useRows<I.Broadcast>(['broadcasts'], I.BROADCASTS);
  const [draft, setDraft] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<I.Message | null>(null);
  const box = React.useRef<HTMLTextAreaElement>(null);
  const end = React.useRef<HTMLDivElement>(null);

  const unreadConv = conv.data?.filter(m => !m.inbound && !m.read_by_me) ?? [];
  const unreadNotices = notices.data?.filter(n => !n.read_by_me) ?? [];

  // What is on screen has been read.
  const visible = (tab === 'studio' ? unreadConv : unreadNotices).map(m => m.id).join(',');
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      runAs(session, q => q(I.MARK_READ, [visible.split(',')]))
        .then(() => qc.invalidateQueries({ queryKey: ['db'] }));
    }, 800);
    return () => clearTimeout(t);
  }, [visible, session, qc]);

  React.useEffect(() => {
    if (tab === 'studio') end.current?.scrollIntoView({ block: 'end' });
  }, [conv.data?.length, tab]);

  const send = useMutation({
    mutationFn: () => runAs(session, q => q(I.SEND_TO_STUDIO, [replyTo?.subject ? (replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`) : '', draft, replyTo?.id ?? null])),
    onSuccess: () => { setDraft(''); setReplyTo(null); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <Shell title="Messages" allow={['guardian']}>
      <div className="mx-auto max-w-lg">
        <div role="tablist" aria-label="Messages" className="mb-4 flex gap-6 border-b border-line">
          {([['studio', 'The studio', unreadConv.length], ['notices', 'Class notices', unreadNotices.length]] as const).map(([k, l, n]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={cn('-mb-px flex min-h-[44px] items-center gap-1.5 border-b-2 px-0.5 text-[15px]',
                tab === k ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
              {l}
              {n > 0 && <span className="tnum text-[13px] font-semibold text-ink">
                {n}<span className="sr-only"> unread</span></span>}
            </button>
          ))}
        </div>

        {tab === 'studio' && (
          <Card className="flex h-[calc(100dvh-226px-env(safe-area-inset-bottom))] min-h-[360px] flex-col overflow-hidden lg:h-[calc(100dvh-170px)]">
            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
              {conv.isLoading && <Skeleton className="h-24" />}
              {conv.error && <ErrorState error={conv.error} onRetry={() => conv.refetch()} />}
              {conv.data?.length === 0 && (
                <EmptyState title="Ask the studio anything"
                  body="Questions, changes of plan, a heads-up about an absence. The office replies here." />
              )}
              {conv.data?.map((m, n) => {
                const prev = conv.data![n - 1];
                const newDay = !prev || relativeDay(prev.sent_at) !== relativeDay(m.sent_at);
                // From the parent's side, their own messages sit on the right.
                const mine = m.inbound;
                return (
                  <React.Fragment key={m.id}>
                    {newDay && <p className="pt-1 text-center text-[12.5px] font-semibold text-ink-3">{relativeDay(m.sent_at)}</p>}
                    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-[15px]',
                        mine ? 'rounded-br-sm bg-accent-soft text-ink' : 'rounded-bl-sm border border-line bg-surface')}>
                        {m.subject && <p className="mb-1 font-medium">{m.subject}</p>}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={cn('mt-1.5 flex items-center gap-2 text-[11.5px]', 'text-ink-3')}>
                          <span>{mine ? (m.sender ?? 'You') : (m.sender ?? 'The studio')} · {time(m.sent_at)}</span>
                          {!mine && !m.is_request && (
                            <button type="button" onClick={() => { setReplyTo(m); box.current?.focus(); }}
                              className="ml-auto inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 font-semibold text-accent-text hover:bg-surface-3"
                              aria-label={`Reply to ${m.sender ?? 'the studio'}`}>
                              <CornerUpLeft className="size-3" aria-hidden /> Reply
                            </button>
                          )}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={end} />
            </div>
            <form className="border-t border-line bg-surface p-3"
                  onSubmit={e => { e.preventDefault(); if (draft.trim()) send.mutate(); }}>
              {send.error && <div className="mb-2"><ErrorState error={send.error} /></div>}
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-[var(--radius-md)] bg-surface-2 px-3 py-1.5 text-[12.5px] text-ink-2">
                  <CornerUpLeft className="size-3.5 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">Replying to {replyTo.sender ?? 'the studio'}: {replyTo.subject ?? replyTo.body}</span>
                  <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="grid size-6 place-items-center rounded-full hover:bg-surface-3"><X className="size-3.5" aria-hidden /></button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <label htmlFor="to-studio" className="sr-only">Message the studio</label>
                <textarea id="to-studio" ref={box} value={draft} onChange={e => setDraft(e.target.value)} rows={1}
                  placeholder="Message the studio…"
                  className="max-h-40 min-h-[44px] flex-1 resize-none rounded-[22px] border border-line-strong bg-surface px-4 py-2.5 text-[15px]
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"
                  style={{ fieldSizing: 'content' } as React.CSSProperties} />
                <Button type="submit" variant="primary" className="size-11 shrink-0 rounded-full p-0"
                        aria-label="Send" loading={send.isPending} disabled={!draft.trim()}>
                  {!send.isPending && <Send className="size-4" aria-hidden />}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {tab === 'notices' && (
          <div>
            {notices.isLoading && <div className="space-y-3">{[0, 1].map(i => <Skeleton key={i} className="h-20" />)}</div>}
            {notices.data?.length === 0 && <EmptyState
              title="No notices" body="Announcements to your children’s classes show here." />}
            <ul className="divide-y divide-line border-t-2 border-ink">
              {notices.data?.map(b => (
                <li key={b.id} className="py-4">
                  {!b.read_by_me && <p className="mb-1 font-display text-[15px] uppercase leading-none tracking-[-0.01em] text-accent-text [font-stretch:80%]">New</p>}
                  <div className="flex items-baseline gap-3">
                    <h2 className="min-w-0 flex-1 font-semibold leading-snug">{b.subject || (b.kind === 'studio_announcement' ? 'From the studio' : b.class_name)}</h2>
                    <span className="shrink-0 text-[13px] text-ink-3">{relativeDay(b.sent_at)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] text-ink-2">{b.body}</p>
                  <p className="mt-2 text-[13px] text-ink-3">
                    {[b.kind === 'studio_announcement' ? 'Everyone at the studio' : b.class_name, b.sender].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Shell>
  );
}
