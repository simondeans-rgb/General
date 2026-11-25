'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, MessageSquare, Send, Users } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
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
    mutationFn: () => runAs(session, q => q(I.SEND_TO_STUDIO, ['', draft])),
    onSuccess: () => { setDraft(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <Shell title="Messages" allow={['guardian']}>
      <div className="mx-auto max-w-lg">
        <div role="tablist" aria-label="Messages" className="mb-3 grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
          {([['studio', 'The studio', unreadConv.length], ['notices', 'Class notices', unreadNotices.length]] as const).map(([k, l, n]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={cn('flex min-h-[40px] items-center justify-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] text-sm',
                tab === k ? 'bg-surface font-medium shadow-xs' : 'text-ink-2')}>
              {l}
              {n > 0 && <span className="tnum rounded-full bg-accent px-1.5 text-[11px] font-semibold text-on-accent">
                {n}<span className="sr-only"> unread</span></span>}
            </button>
          ))}
        </div>

        {tab === 'studio' && (
          <Card className="flex h-[calc(100dvh-218px-env(safe-area-inset-bottom))] min-h-[360px] flex-col overflow-hidden lg:h-[calc(100dvh-170px)]">
            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface-2/40 p-4" aria-live="polite">
              {conv.isLoading && <Skeleton className="h-24" />}
              {conv.error && <ErrorState error={conv.error} onRetry={() => conv.refetch()} />}
              {conv.data?.length === 0 && (
                <EmptyState icon={<MessageSquare className="size-5" />} title="Ask the studio anything"
                  body="Questions, changes of plan, a heads-up about an absence — the office replies here." />
              )}
              {conv.data?.map((m, n) => {
                const prev = conv.data![n - 1];
                const newDay = !prev || relativeDay(prev.sent_at) !== relativeDay(m.sent_at);
                // From the parent's side, their own messages sit on the right.
                const mine = m.inbound;
                return (
                  <React.Fragment key={m.id}>
                    {newDay && <p className="pt-1 text-center text-[11.5px] font-medium uppercase tracking-[0.06em] text-ink-3">{relativeDay(m.sent_at)}</p>}
                    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-[15px] shadow-xs',
                        mine ? 'rounded-br-sm bg-accent text-on-accent' : 'rounded-bl-sm border border-line bg-surface')}>
                        {m.subject && <p className="mb-1 font-medium">{m.subject}</p>}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={cn('mt-1.5 text-[11.5px]', mine ? 'text-on-accent opacity-80' : 'text-ink-3')}>
                          {mine ? (m.sender ?? 'You') : (m.sender ?? 'Northstar Dance')} · {time(m.sent_at)}
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
              <div className="flex items-end gap-2">
                <label htmlFor="to-studio" className="sr-only">Message the studio</label>
                <textarea id="to-studio" value={draft} onChange={e => setDraft(e.target.value)} rows={1}
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
          <div className="space-y-3">
            {notices.isLoading && [0,1].map(i => <Skeleton key={i} className="h-24" />)}
            {notices.data?.length === 0 && <Card><EmptyState icon={<Megaphone className="size-5" />}
              title="No notices" body="Announcements and messages to your children’s classes appear here." /></Card>}
            {notices.data?.map(b => (
              <Card key={b.id} className="p-4">
                <div className="flex items-center gap-2">
                  {b.kind === 'studio_announcement'
                    ? <Badge tone="violet" icon={<Megaphone className="size-3" aria-hidden />}>Studio</Badge>
                    : <Badge tone="info" icon={<Users className="size-3" aria-hidden />}>{b.class_name}</Badge>}
                  {!b.read_by_me && <Badge tone="accent">New</Badge>}
                  <span className="ml-auto text-[12px] text-ink-3">{relativeDay(b.sent_at)}</span>
                </div>
                {b.subject && <h2 className="mt-2 font-semibold">{b.subject}</h2>}
                <p className="mt-1 whitespace-pre-wrap text-[15px] text-ink-2">{b.body}</p>
                {b.sender && <p className="mt-2 text-[12.5px] text-ink-3">{b.sender}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
