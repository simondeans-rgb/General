'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell, CreditCard, MessageSquare, UserPlus, Sparkles, HeartPulse, ListOrdered, Inbox, GraduationCap, CheckCheck,
} from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import * as I from '@/lib/repos/inbox';
import { relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICON: Record<string, React.ElementType> = {
  message: MessageSquare, payment_failed: CreditCard, new_enquiry: Sparkles, new_trial: Sparkles,
  new_enrolment: UserPlus, waitlist: ListOrdered, waitlist_offer: ListOrdered,
  medical_updated: HeartPulse, request: Inbox, request_answered: MessageSquare, teacher_changed: GraduationCap,
};

/**
 * The notification centre. Notifications are written by the database when
 * something happens (migration 0017), so this only reads, opens and clears.
 * Preferences per kind are a planned addition; the `kind` column already
 * carries what they would key on.
 */
export function NotificationBell() {
  const { session } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const unread = useRows<{ n: number }>(['notif-unread'], I.UNREAD_NOTIFICATIONS, [],
    { refetchInterval: 30_000 }).data?.[0]?.n ?? 0;
  const list = useRows<I.Note>(['notifications'], I.NOTIFICATIONS, [], { enabled: open });
  const button = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const markRead = async (ids: string[] | null) => {
    await runAs(session, q => q(I.MARK_NOTIFICATIONS, [ids]));
    qc.invalidateQueries({ queryKey: ['db'] });
  };

  const openOne = async (n: I.Note) => {
    if (!n.read_at) await markRead([n.id]);
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  return (
    <>
      <button ref={button} onClick={() => setOpen(o => !o)} aria-haspopup="dialog" aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink">
        <Bell className="size-[18px]" aria-hidden />
        {unread > 0 && (
          <span aria-hidden className="tnum absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full
                                       bg-critical px-1 text-[10.5px] font-semibold leading-none text-white ring-2 ring-surface">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[60] bg-ink/30 sm:bg-transparent" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Notifications" onClick={e => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-hidden rounded-t-[var(--radius-xl)] border border-line
                       bg-surface shadow-lg sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-14 sm:w-[380px] sm:rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <h2 className="flex-1 font-semibold">Notifications</h2>
              {unread > 0 && (
                <Button size="sm" variant="ghost" onClick={() => markRead(null)}>
                  <CheckCheck className="size-4" aria-hidden /> Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-[calc(80dvh-56px)] overflow-y-auto pb-safe sm:max-h-[460px]">
              {list.isLoading && <div className="space-y-2 p-3">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {list.data?.length === 0 && <EmptyState icon={<Bell className="size-5" />} title="Nothing new"
                body={session?.role === 'guardian'
                  ? 'Replies from the studio, payment problems and waiting-list places appear here.'
                  : 'Payments, messages, trials and enrolments appear here as they happen.'} />}
              <ul className="divide-y divide-line">
                {list.data?.map(n => {
                  const Icon = ICON[n.kind] ?? Bell;
                  return (
                    <li key={n.id}>
                      <button onClick={() => openOne(n)}
                        className={cn('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2',
                          !n.read_at && 'bg-accent-soft/40')}>
                        <span aria-hidden className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                          n.kind === 'payment_failed' ? 'bg-critical-soft text-critical'
                            : n.kind === 'medical_updated' ? 'bg-caution-soft text-caution' : 'bg-surface-2 text-ink-2')}>
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-sm', !n.read_at && 'font-semibold')}>
                            {n.title}{!n.read_at && <span className="sr-only"> (unread)</span>}
                          </span>
                          {n.body && <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink-2">{n.body}</span>}
                          <span className="mt-0.5 block text-[12px] text-ink-3">
                            {relativeDay(n.created_at)}, {time(n.created_at)}
                          </span>
                        </span>
                        {!n.read_at && <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-accent" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
