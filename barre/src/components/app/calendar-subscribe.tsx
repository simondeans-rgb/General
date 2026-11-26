'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Copy, Download, RefreshCw, X } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState } from '@/components/ui';

const MY_TOKEN = `select token from calendar_token where studio_id = (select id from studio where app.in_scope(id) and id in (select app.studio_ids()) order by name limit 1)`;
const STUDIO = `select id from studio where app.in_scope(id) and id in (select app.studio_ids()) order by name limit 1`;

/** Where the hosted feed answers (scripts/calendar-feed.mts). */
const feedUrl = (token: string) => {
  const host = typeof window === 'undefined' ? 'swayvo.app' : window.location.host;
  return `webcal://${host}/calendar/${token}.ics`;
};

/**
 * Add classes to a calendar (R-036): a private link that calendar apps keep
 * up to date, or a one-off file. Making a new link retires the old one.
 */
export function CalendarSubscribe({ onDownload, label = 'Add to calendar' }: { onDownload: () => void; label?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} aria-label={label}>
        <CalendarPlus className="size-4" aria-hidden /> <span className="hidden sm:inline">{label}</span>
      </Button>
      {open && createPortal(<Sheet onClose={() => setOpen(false)} onDownload={onDownload} />, document.body)}
    </>
  );
}

function Sheet({ onClose, onDownload }: { onClose: () => void; onDownload: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const tok = useRows<{ token: string }>(['cal-token'], MY_TOKEN).data?.[0]?.token;
  const [copied, setCopied] = React.useState(false);
  const act = useMutation({
    mutationFn: (fn: 'app.issue_calendar_token' | 'app.revoke_calendar_token') =>
      runAs(session, async q => { const [s] = await q<{ id: string }>(STUDIO); await q(`select ${fn}($1)`, [s!.id]); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const url = tok ? feedUrl(tok) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="cal-t" onClick={e => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-t-[var(--radius-xl)] border border-line bg-surface p-5 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-center justify-between">
          <h2 id="cal-t" className="text-lg font-semibold">Add to your calendar</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X className="size-4" aria-hidden /></button>
        </div>
        <section className="space-y-2">
          <h3 className="font-medium">Keep it up to date</h3>
          <p className="text-[13px] text-ink-2">A private link for Apple, Google or Outlook calendar. Changes and cancellations appear on their own. Anyone with the link can see these classes, so keep it to yourself.</p>
          {url ? (
            <>
              <div className="flex gap-2">
                <input readOnly value={url} aria-label="Calendar link" onFocus={e => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-line bg-surface-2 px-3 py-2 font-mono text-[12px]" />
                <Button size="sm" aria-label="Copy link" onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true))}>
                  <Copy className="size-4" aria-hidden />
                </Button>
              </div>
              {copied && <p role="status" className="text-[12.5px] text-positive">Copied. Paste it into your calendar app’s “subscribe” option.</p>}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={() => { window.location.href = url; }}>Subscribe</Button>
                <Button size="sm" variant="ghost" loading={act.isPending} onClick={() => act.mutate('app.issue_calendar_token')}>
                  <RefreshCw className="size-4" aria-hidden /> New link
                </Button>
                <Button size="sm" variant="ghost" loading={act.isPending} onClick={() => act.mutate('app.revoke_calendar_token')}>Turn off</Button>
              </div>
            </>
          ) : (
            <Button size="sm" variant="primary" loading={act.isPending} onClick={() => act.mutate('app.issue_calendar_token')}>Make my link</Button>
          )}
          <p className="text-[12px] text-ink-3">In this demo the link is made but not served; it starts working once Swayvo is hosted.</p>
          {act.error != null && <ErrorState error={act.error} />}
        </section>
        <section className="space-y-2 border-t border-line pt-4">
          <h3 className="font-medium">Or download a copy</h3>
          <p className="text-[13px] text-ink-2">The next 16 weeks as a file. It won’t change if the timetable does.</p>
          <Button size="sm" onClick={onDownload}><Download className="size-4" aria-hidden /> Download</Button>
        </section>
      </div>
    </div>
  );
}
