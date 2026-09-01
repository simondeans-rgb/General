'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Send, Trash2, X, Pencil } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, Skeleton,
} from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { relativeDay, time } from '@/lib/format';

/**
 * Class notices — the teacher's one-way channel.
 *
 * Deliberately not a conversation. Homework, kit for next week and "no class
 * on Thursday" are announcements, and giving them a reply box would open a
 * private line between a teacher and a child's family that nobody in the
 * office can see. Families reply through the studio, where it is on record.
 *
 * The database enforces the same thing: a teacher may only insert a
 * class_broadcast, only for a class they teach, and only under their own name.
 */
export function ClassNotices({ classId, className, canPost }: {
  classId: string; className: string; canPost: boolean;
}) {
  const rows = useRows<T.Notice>(['class-notices', classId], T.CLASS_NOTICES, [classId]);
  const [composing, setComposing] = React.useState(false);
  const [editing, setEditing] = React.useState<T.Notice | null>(null);

  return (
    <>
      <Card id="notices">
        <CardHeader
          title="Notices"
          subtitle={canPost ? 'Homework, kit, reminders — everyone in the class sees these.' : undefined}
          action={canPost
            ? <Button size="sm" variant="primary" onClick={() => setComposing(true)}>
                <Megaphone className="size-4" aria-hidden /> Post
              </Button>
            : undefined}
        />

        {rows.isPending && <div className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error && <div className="p-4"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
        {!rows.isPending && rows.data?.length === 0 && (
          <EmptyState icon={<Megaphone className="size-5" />} title="No notices"
            body={canPost
              ? 'Set homework, or tell the class what to bring next week.'
              : 'Anything your teacher sends the class will appear here.'} />
        )}

        {(rows.data?.length ?? 0) > 0 && (
          <ul className="divide-y divide-line">
            {rows.data!.map(n => (
              <NoticeRow key={n.id} n={n} canManage={canPost && n.mine} onEdit={() => setEditing(n)} />
            ))}
          </ul>
        )}
      </Card>

      {(composing || editing) && (
        <Compose classId={classId} className={className} notice={editing}
                 onClose={() => { setComposing(false); setEditing(null); }} />
      )}
    </>
  );
}

function NoticeRow({ n, canManage, onEdit }: {
  n: T.Notice; canManage: boolean; onEdit: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const withdraw = useMutation({
    mutationFn: async () => runAs(session, q => q(T.WITHDRAW_NOTICE, [n.id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  return (
    <li className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]
                                     bg-accent-soft text-accent-ink">
          <Megaphone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          {n.subject && <p className="font-medium">{n.subject}</p>}
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">{n.body}</p>
          <p className="mt-1 text-[12px] text-ink-3">
            {n.sent_by_name ?? 'The studio'} · {relativeDay(n.sent_at)} at {time(n.sent_at)}
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" aria-label={`Edit ${n.subject ?? 'notice'}`} onClick={onEdit}>
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button size="sm" variant="ghost" aria-label={`Withdraw ${n.subject ?? 'notice'}`}
                    loading={withdraw.isPending} onClick={() => withdraw.mutate()}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
      {withdraw.isError && <div className="mt-2"><ErrorState error={withdraw.error} /></div>}
    </li>
  );
}

function Compose({ classId, className, notice, onClose }: {
  classId: string; className: string; notice: T.Notice | null; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [subject, setSubject] = React.useState(notice?.subject ?? '');
  const [body, setBody] = React.useState(notice?.body ?? '');

  const send = useMutation({
    mutationFn: async () => runAs(session, q => notice
      ? q(T.EDIT_NOTICE, [notice.id, subject, body])
      : q(T.POST_NOTICE, [classId, subject, body])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });

  const valid = body.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="notice-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="notice-t" className="text-[17px] font-semibold tracking-tight">
              {notice ? 'Edit notice' : 'Post a notice'}
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-2">
              Goes to everyone in {className} and their parents.
            </p>
          </div>
          <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Subject" htmlFor="notice-subject" hint="Optional, but it helps them spot it.">
            <Input id="notice-subject" value={subject} onChange={e => setSubject(e.target.value)}
                   placeholder="Homework for Thursday" />
          </Field>
          <Field label="Message" htmlFor="notice-body" required>
            <textarea id="notice-body" rows={5} value={body} onChange={e => setBody(e.target.value)}
              placeholder="Practise the first eight counts every day this week. Bring tap shoes and a water bottle."
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
          </Field>
          <p className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-[12.5px] text-ink-2">
            Notices go one way. If a parent needs to reply they contact the studio, so
            the conversation stays on record.
          </p>
        </div>

        {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" variant="primary" disabled={!valid}
                  loading={send.isPending} onClick={() => send.mutate()}>
            <Send className="size-4" aria-hidden /> {notice ? 'Save' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
