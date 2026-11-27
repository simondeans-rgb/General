'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeWithUndo, useRemoving } from '@/components/app/undo';
import { Megaphone, Send, Trash2, X, Pencil } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Button, ErrorState, Field, Input, Skeleton,
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
      <section id="notices" aria-labelledby="notices-h">
        <div className="mb-1 flex items-center gap-3 border-b-2 border-ink pb-2">
          <h2 id="notices-h" className="section-title min-w-0 flex-1">Notices</h2>
          {canPost
            ? <Button size="sm" onClick={() => setComposing(true)}>
                <Megaphone className="size-4" aria-hidden /> Post a notice
              </Button>
            : <span className="text-[0.8125rem] text-ink-3">From the teacher to the class</span>}
        </div>
        {canPost && <p className="pt-2 text-[0.8125rem] text-ink-3">Homework, kit, reminders. Everyone in the class and their parents see these.</p>}

        {rows.isPending && <div className="space-y-3 pt-3">{[0, 1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error && <div className="pt-3"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
        {!rows.isPending && rows.data?.length === 0 && (
          <p className="py-3 text-[0.9062rem] text-ink-3">{canPost
              ? 'No notices yet. Set homework, or tell the class what to bring next week.'
              : 'No notices yet. Anything the teacher sends the class shows here.'}</p>
        )}

        {(rows.data?.length ?? 0) > 0 && (
          <ul className="divide-y divide-line">
            {rows.data!.map(n => (
              <NoticeRow key={n.id} n={n} canManage={canPost && n.mine} onEdit={() => setEditing(n)} />
            ))}
          </ul>
        )}
      </section>

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
  const withdraw = () => removeWithUndo(n.id, n.subject ? `“${n.subject}”` : 'Notice', async () => {
    await runAs(session, q => q(T.WITHDRAW_NOTICE, [n.id]));
    qc.invalidateQueries({ queryKey: ['db'] });
  });
  const removing = useRemoving();
  if (removing(n.id)) return null;

  return (
    <li className="py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {n.subject && <p className="font-semibold">{n.subject}</p>}
          <p className="whitespace-pre-line text-[0.9062rem] leading-relaxed text-ink-2">{n.body}</p>
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            {n.sent_by_name ?? 'The studio'} · {relativeDay(n.sent_at)} at {time(n.sent_at)}
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" aria-label={`Edit ${n.subject ?? 'notice'}`} onClick={onEdit}>
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button size="sm" variant="ghost" aria-label={`Withdraw ${n.subject ?? 'notice'}`}
                    onClick={withdraw}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
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
            <h2 id="notice-t" className="text-[1.0625rem] font-semibold tracking-tight">
              {notice ? 'Edit notice' : 'Post a notice'}
            </h2>
            <p className="mt-0.5 text-[0.8125rem] text-ink-2">
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
                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
          <p className="text-[0.8125rem] text-ink-3">
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
