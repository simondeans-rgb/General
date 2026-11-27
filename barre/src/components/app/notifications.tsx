'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const NotificationSettings = dynamic(() => import('@/components/app/notification-settings').then(m => m.NotificationSettings), { ssr: false });
import { REMIND_CHECKS } from '@/lib/repos/safeguarding';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import * as I from '@/lib/repos/inbox';
import { relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

/** What kind of thing happened, in a word. Urgent kinds carry colour as well. */
const KIND: Record<string, string> = {
  message: 'Message', payment_failed: 'Payment failed', new_enquiry: 'Enquiry', new_trial: 'Trial',
  new_enrolment: 'Enrolment', waitlist: 'Waiting list', waitlist_offer: 'Place offered',
  medical_updated: 'Medical update', request: 'Request', request_answered: 'Answered', teacher_changed: 'Teacher change',
  schedule_change: 'Class change', cover_assigned: 'Cover', contact_updated: 'Contact details', message_reminder: 'Reminder', safeguarding: 'Safeguarding', staff_check_due: 'Check due', milestone: 'Milestone', feedback_published: 'Feedback', report_shared: 'Report', absence_reported: 'Absence', makeup_offer: 'Make-up',
  invoice_issued: 'Invoice', payment_received: 'Payment', event_invite: 'Event',
};
const URGENT: Record<string, string> = { payment_failed: 'text-critical', safeguarding: 'text-critical', medical_updated: 'text-caution', schedule_change: 'text-caution', staff_check_due: 'text-caution' };

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
  // Notifications follow the chosen school (R-051); the others wait behind a switch.
  const others = useRows<{ studio_id: string; name: string; unread: number }>(['notif-other'], I.OTHER_SCHOOL_NOTES, [],
    { enabled: open && !!session?.studio });
  const { chooseSchool } = useSession();
  const button = React.useRef<HTMLButtonElement>(null);
  const [settings, setSettings] = React.useState(false);

  // Scheduled messages go out when their time comes. With no server clock in
  // this build, the office's open app releases them (idempotent; R-037).
  const office = session?.role === 'owner' || session?.role === 'admin';
  React.useEffect(() => {
    if (!office || session?.support) return;
    // …and staff checks nearing expiry are flagged to the owner (R-035).
    const tick = () => runAs(session, async q => {
      const [a] = await q<{ n: number }>(I.RELEASE_SCHEDULED);
      const [b] = await q<{ n: number }>(REMIND_CHECKS);
      return (a?.n ?? 0) + (b?.n ?? 0);
    }).then(n => { if (n) qc.invalidateQueries({ queryKey: ['db'] }); }).catch(() => undefined);
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [office, session, qc]);

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
                                       bg-critical px-1 text-[10.5px] font-semibold leading-none text-ink-invert ring-2 ring-surface">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {settings && createPortal(<NotificationSettings onClose={() => setSettings(false)} />, document.body)}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] bg-ink/30 sm:bg-transparent" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Notifications" onClick={e => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-hidden rounded-t-[var(--radius-xl)] border border-line
                       bg-surface shadow-lg sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-14 sm:w-[380px] sm:rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-1 border-b-2 border-ink px-4 py-2.5">
              <h2 className="flex-1 font-display text-[19px] font-[800] [font-stretch:112%]">Notifications</h2>
              <Button size="sm" variant="ghost" aria-label="Notification settings" onClick={() => { setOpen(false); setSettings(true); }}>
                <Settings2 className="size-4" aria-hidden />
              </Button>
              {unread > 0 && (
                <Button size="sm" variant="ghost" onClick={() => markRead(null)}>
                  <CheckCheck className="size-4" aria-hidden /> Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-[calc(80dvh-56px)] overflow-y-auto pb-safe sm:max-h-[460px]">
              {others.data?.filter(o => o.unread > 0).map(o => (
                <button key={o.studio_id} className="flex min-h-11 w-full items-center gap-2 border-b border-line px-4 py-2.5 text-left text-[14px] hover:bg-surface-2"
                  onClick={() => { chooseSchool(o.studio_id, session!.role); qc.invalidateQueries(); setOpen(false); router.push('/'); }}>
                  <span className="min-w-0 flex-1"><b>{o.unread}</b> unread at {o.name}</span>
                  <span className="font-semibold text-accent-text">Switch school</span>
                </button>
              ))}
              {list.isLoading && <div className="space-y-2 p-3">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {list.data?.length === 0 && <EmptyState title="Nothing new"
                body={session?.role === 'guardian'
                  ? 'Replies from the studio, payment problems and waiting-list places appear here.'
                  : 'Payments, messages, trials and enrolments appear here as they happen.'} />}
              <ul className="divide-y divide-line">
                {list.data?.map(n => (
                  <li key={n.id}>
                    <button onClick={() => openOne(n)}
                      className={cn('relative block w-full py-3 pl-5 pr-4 text-left hover:bg-surface-2/70')}>
                      {!n.read_at && <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-[2px] bg-accent" />}
                      <span className="flex items-baseline gap-2 text-[12.5px]">
                        <span className={cn('font-semibold uppercase tracking-[0.05em]', URGENT[n.kind] ?? 'text-ink-3')}>{KIND[n.kind] ?? 'Update'}</span>
                        <span className="ml-auto shrink-0 text-ink-3">{relativeDay(n.created_at)}, {time(n.created_at)}</span>
                      </span>
                      <span className={cn('mt-0.5 block text-[14.5px] leading-snug', !n.read_at ? 'font-semibold text-ink' : 'text-ink-2')}>
                        {n.title}{!n.read_at && <span className="sr-only"> (unread)</span>}
                      </span>
                      {n.body && <span className="mt-0.5 line-clamp-2 block text-[13.5px] text-ink-3">{n.body}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
