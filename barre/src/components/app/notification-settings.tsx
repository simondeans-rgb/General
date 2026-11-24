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
  const quiet = useRows<{ quiet_from: string | null; quiet_to: string | null }>(['my-quiet'], I.MY_QUIET);
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
        <thead><tr className="text-left text-[12px] text-ink-3"><th className="pb-1 font-medium">Tell me about</th>
          <th className="pb-1 text-center font-medium">In the app</th><th className="pb-1 text-center font-medium">Email</th></tr></thead>
        <tbody className="divide-y divide-line">
          {shown.map(c => {
            const p = get(c.key);
            return (
              <tr key={c.key}>
                <td className="py-2 pr-2"><span className="flex items-center gap-1 font-medium">{c.label}
                  {c.locked && <Lock className="size-3 text-ink-3" aria-label="Always on" />}</span>
                  <span className="block text-[12px] text-ink-3">{c.body}</span></td>
                {(['in_app', 'email'] as const).map(ch => (
                  <td key={ch} className="text-center">
                    <input type="checkbox" aria-label={`${c.label}: ${ch === 'in_app' ? 'in the app' : 'email'}`}
                      className="size-4 accent-[var(--accent)]" disabled={c.locked} checked={c.locked || p[ch]}
                      onChange={e => set.mutate({ ...p, [ch]: e.target.checked })} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[12.5px] text-ink-3">Class changes and safety notices always reach you. Email starts once the school connects an email service.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quiet from" htmlFor="qh-f"><Input id="qh-f" type="time" value={qFrom} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label="Until" htmlFor="qh-t"><Input id="qh-t" type="time" value={qTo} onChange={e => setTo(e.target.value)} /></Field>
      </div>
      <p className="text-[12.5px] text-ink-3">During quiet hours, emails and phone alerts wait until the morning. Leave both empty for none.</p>
    </RecordSheet>
  );
}
