'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { ErrorState, Field, Input } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as I from '@/lib/repos/inbox';
import { PushToggle } from '@/components/app/pwa';

const CATEGORIES: { key: string; label: string; body: string; locked?: boolean; roles?: string[] }[] = [
  { key: 'schedule', label: 'Class changes', body: 'Cancellations, moves and cover', locked: true },
  { key: 'safety', label: 'Safety', body: 'Medical and emergency-contact changes', locked: true, roles: ['owner', 'admin'] },
  { key: 'messages', label: 'Messages', body: 'Messages, replies and reminders' },
  { key: 'payments', label: 'Payments', body: 'Invoices and payment problems' },
  { key: 'progress', label: 'Progress', body: 'Feedback, milestones and reports' },
  { key: 'enrolment', label: 'Enrolment', body: 'Enquiries, trials, waiting lists' },
];

/** What a person wants to hear about (R-019). Class changes and safety stay on. */
export function NotificationSettings({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const prefs = useRows<I.Pref>(['my-prefs'], I.MY_PREFS);
  const quiet = useRows<{ quiet_from: string | null; quiet_to: string | null; email_digest: boolean }>(['my-quiet'], I.MY_QUIET);
  const digest = useMutation({
    mutationFn: (on: boolean) => runAs(session, q => q(I.SET_DIGEST, [on])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [from, setFrom] = React.useState<string | null>(null);
  const [to, setTo] = React.useState<string | null>(null);
  const q0 = quiet.data?.[0];
  const qFrom = from ?? q0?.quiet_from ?? '';
  const qTo = to ?? q0?.quiet_to ?? '';
  const get = (k: string) => prefs.data?.find(p => p.category === k) ?? { category: k, in_app: true, email: true };
  const set = useMutation({
    mutationFn: (p: I.Pref) => runAs(session, q => q(I.SET_PREF, [p.category, p.in_app, p.email])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const saveQuiet = useMutation({
    mutationFn: () => runAs(session, q => q(I.SET_QUIET, [qFrom || null, qTo || null])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  const shown = CATEGORIES.filter(c => !c.roles || c.roles.includes(session?.role ?? ''));
  return (
    <RecordSheet title="Notification settings" onClose={onClose} onSave={() => saveQuiet.mutate()} saving={saveQuiet.isPending}
      error={saveQuiet.error} saveLabel="Done" canSave={!qFrom === !qTo}>
      {set.error != null && <ErrorState error={set.error} />}
      <table className="w-full text-sm">
        <thead className="border-b-2 border-ink"><tr className="text-left"><th scope="col" className="label pb-2 font-semibold">Tell me about</th>
          <th scope="col" className="label w-20 pb-2 text-center font-semibold">In app</th><th scope="col" className="label w-16 pb-2 text-center font-semibold">Email</th></tr></thead>
        <tbody className="divide-y divide-line">
          {shown.map(c => {
            const p = get(c.key);
            return (
              <tr key={c.key}>
                <td className="py-2.5 pr-2"><span className="block font-semibold">{c.label}
                  {c.locked && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[12.5px] font-medium text-ink-3"><Lock className="size-3" aria-hidden />Always on</span>}</span>
                  <span className="block text-[13px] text-ink-3">{c.body}</span></td>
                {(['in_app', 'email'] as const).map(ch => (
                  <td key={ch} className="text-center">
                    <input type="checkbox" aria-label={`${c.label}: ${ch === 'in_app' ? 'in the app' : 'email'}`}
                      className="size-5 accent-[var(--color-accent)]" disabled={c.locked} checked={c.locked || p[ch]}
                      onChange={e => set.mutate({ ...p, [ch]: e.target.checked })} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[13px] text-ink-3">Class changes and safety notices always reach you. Email starts once the school connects an email service.</p>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" checked={!!q0?.email_digest}
          onChange={e => digest.mutate(e.target.checked)} />
        <span className="font-semibold">One email a day instead
          <span className="block text-[13px] font-normal text-ink-3">A summary at 5pm of anything you haven’t seen. Urgent notices — a class cancelled today, a safety alert — still come straight away.</span></span>
      </label>
      <PushToggle />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quiet from" htmlFor="qh-f"><Input id="qh-f" type="time" value={qFrom} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label="Until" htmlFor="qh-t"><Input id="qh-t" type="time" value={qTo} onChange={e => setTo(e.target.value)} /></Field>
      </div>
      <p className="text-[13px] text-ink-3">During quiet hours, emails and phone alerts wait until the morning. Leave both empty for none.</p>
    </RecordSheet>
  );
}
