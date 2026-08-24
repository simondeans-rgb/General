'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox, Check, X, MessageSquare, Trophy, CheckCircle2 } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { relativeDay, time, dateLong } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  question: 'Question', private_lesson: 'Private lesson', medical_update: 'Medical update',
  event_interest: 'Event', absence: 'Absence', other: 'Other',
};

/**
 * The studio's side of "request, then confirm". Everything a family has asked
 * for that nobody has answered yet, in one queue. Without this the family
 * hub's request buttons would send messages into a void.
 */
export default function RequestsPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const requests = useRows<any>(['pending-requests'], H.PENDING_REQUESTS);
  const entries = useRows<any>(['pending-entries'], H.PENDING_ENTRIES);
  const [answering, setAnswering] = React.useState<any>(null);

  const decide = useMutation({
    mutationFn: async (v: { id: string; status: 'confirmed' | 'declined' }) =>
      runAs(session, q => q(H.DECIDE_ENTRY, [v.id, v.status])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const total = (requests.data?.length ?? 0) + (entries.data?.length ?? 0);

  return (
    <Shell title="Requests" allow={['owner', 'admin']}
      subtitle={total ? `${total} waiting on you` : 'Nothing waiting'}>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card>
          <CardHeader title="Event and competition entries"
            subtitle="Nothing is in the diary until you confirm it" />
          {entries.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
          {entries.error && <div className="p-4"><ErrorState error={entries.error} /></div>}
          {entries.data?.length === 0 && !entries.isLoading && (
            <EmptyState icon={<Trophy className="size-5" />} title="No entries waiting"
              body="Requests from families appear here." />
          )}
          <ul className="divide-y divide-line">
            {entries.data?.map(e => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{e.student_name}</span>
                  <span className="block truncate text-[13px] text-ink-2">
                    {e.event_title} · {dateLong(e.starts_at)}, {time(e.starts_at)}
                  </span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'declined' })}>
                    <X className="size-4" aria-hidden /> Decline
                  </Button>
                  <Button size="sm" variant="primary" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'confirmed' })}>
                    <Check className="size-4" aria-hidden /> Confirm
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Questions from families" />
          {requests.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-20" />)}</div>}
          {requests.data?.length === 0 && !requests.isLoading && (
            <EmptyState icon={<Inbox className="size-5" />} title="Nothing unanswered"
              body="Questions from parents and students land here." />
          )}
          <ul className="divide-y divide-line">
            {requests.data?.map(r => (
              <li key={r.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={r.kind === 'medical_update' ? 'critical' : 'neutral'}>
                    {KIND_LABEL[r.kind] ?? r.kind}
                  </Badge>
                  <span className="text-[12.5px] text-ink-3">
                    {r.family_name}{r.student_name ? ` · about ${r.student_name}` : ''}
                  </span>
                  <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(r.created_at)}</span>
                </div>
                <p className="mt-1.5 font-medium">{r.subject}</p>
                <p className="mt-0.5 text-sm text-ink-2">{r.body}</p>
                <Button size="sm" className="mt-2.5" onClick={() => setAnswering(r)}>
                  <MessageSquare className="size-4" aria-hidden /> Reply
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {answering && <AnswerDialog request={answering} onClose={() => setAnswering(null)} />}
    </Shell>
  );
}

function AnswerDialog({ request, onClose }: { request: any; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [answer, setAnswer] = React.useState('');
  const [done, setDone] = React.useState(false);

  const send = useMutation({
    mutationFn: async () => runAs(session, q => q(H.ANSWER_REQUEST, [request.id, answer.trim()])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ans-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <CheckCircle2 className="size-5" />
            </span>
            <p id="ans-t" className="font-medium">Replied</p>
            <p className="mt-1 text-sm text-ink-2">The family sees your answer in their hub.</p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="ans-t" className="text-[17px] font-semibold tracking-tight">Reply</h2>
            <p className="mt-0.5 text-sm text-ink-2">{request.subject}</p>
            <p className="mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2">{request.body}</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
              aria-label="Your reply" placeholder="Write your reply…"
              className="mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
            {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                      disabled={answer.trim().length < 2} onClick={() => send.mutate()}>Send reply</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
