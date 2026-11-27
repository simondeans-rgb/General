'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, X } from 'lucide-react';
import { useRow, useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { money, dateShort } from '@/lib/format';

const FALLBACK = {
  subject: 'Payment reminder: {{invoice_number}}',
  body: 'Hello {{guardian_name}},\n\nThis is a reminder that {{amount}} has been due since {{due_date}} ({{invoice_number}}). '
      + 'You can see what it is for, and how to pay, in Payments in the app.\n\n'
      + 'If something has gone wrong with the payment, or you would like to talk about it, just reply to this message.',
};

/**
 * One reminder to each overdue family (UR-46). The same words for all, filled
 * in per family by the database from what they owe; the preview shows exactly
 * what the chosen family will read. Each reminder lands in the family's
 * messages and is logged against the family.
 */
export function PaymentRemindersSheet({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const fams = useRows<B.OverdueFamily>(['overdue-families'], B.OVERDUE_FAMILIES);
  const tpl = useRow<{ subject: string; body: string }>(['tpl-reminder'], B.REMINDER_TEMPLATE);
  const [subject, setSubject] = React.useState<string | null>(null);
  const [body, setBody] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<Set<string> | null>(null);
  const [previewFor, setPreviewFor] = React.useState<string>('');
  const [sent, setSent] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (subject !== null || tpl.isLoading) return;
    setSubject(tpl.data?.subject ?? FALLBACK.subject);
    setBody(tpl.data?.body ?? FALLBACK.body);
  }, [tpl.data, tpl.isLoading, subject]);
  React.useEffect(() => {
    if (picked || !fams.data) return;
    setPicked(new Set(fams.data.map(f => f.family_id)));
    setPreviewFor(fams.data[0]?.family_id ?? '');
  }, [fams.data, picked]);

  const chosen = (fams.data ?? []).filter(f => picked?.has(f.family_id));
  const total = chosen.reduce((n, f) => n + Number(f.overdue_minor), 0);
  const who = previewFor && picked?.has(previewFor) ? previewFor : chosen[0]?.family_id ?? '';
  const preview = useRow<{ subject: string; body: string }>(['reminder-preview', who, subject, body],
    B.REMINDER_PREVIEW, [who, subject ?? '', body ?? '']);

  const send = useMutation({
    mutationFn: () => runAs(session, q => q<{ sent: number }>(B.SEND_REMINDERS, [chosen.map(f => f.family_id), subject, body])),
    onSuccess: rows => { setSent(rows[0]?.sent ?? 0); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const toggle = (id: string) => setPicked(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="rem-t" onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3 border-b border-line p-4">
          <div className="min-w-0 flex-1">
            <h2 id="rem-t" className="font-display text-[1.25rem] font-[800] leading-tight [font-stretch:112%]">Remind overdue families</h2>
            <p className="text-[0.8125rem] text-ink-2">One message to each family, in the app, filled in with what they owe.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {sent !== null ? (
          <div className="space-y-4 p-4">
            <p role="status" className="flex items-center gap-2 border-l-2 border-positive py-1 pl-3 text-[0.9375rem]">
              <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden />
              Sent to {sent} famil{sent === 1 ? 'y' : 'ies'}. Each is in their messages and their history.
            </p>
            <Button variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
              {fams.isLoading && <Skeleton className="h-24" />}
              {fams.error != null && <ErrorState error={fams.error} />}
              {fams.data?.length === 0 && <EmptyState title="Nobody is overdue" body="There is no one to remind." />}
              {!!fams.data?.length && (
                <fieldset>
                  <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-2">
                    {chosen.length} of {fams.data.length} families · <span className="tnum">{money(total)}</span> overdue
                  </legend>
                  <ul className="max-h-60 divide-y divide-line overflow-y-auto border-y border-line">
                    {fams.data.map(f => (
                      <li key={f.family_id} className="flex items-center gap-3 py-2 text-sm">
                        <input type="checkbox" id={`rf-${f.family_id}`} checked={!!picked?.has(f.family_id)}
                               onChange={() => toggle(f.family_id)} className="size-5 accent-[var(--color-accent)]" />
                        <label htmlFor={`rf-${f.family_id}`} className="min-w-0 flex-1">
                          <span className="block font-medium">{f.family_name}</span>
                          <span className="block truncate text-[0.7812rem] text-ink-3">
                            {f.invoices} · due {dateShort(f.oldest_due)}
                            {f.last_reminded ? ` · last reminded ${dateShort(f.last_reminded)}` : ''}
                            {!f.uses_app ? ' · not using the app yet' : ''}
                          </span>
                        </label>
                        <span className="tnum font-medium">{money(f.overdue_minor)}</span>
                        <button type="button" onClick={() => setPreviewFor(f.family_id)}
                          className="min-h-10 rounded-[var(--radius-sm)] px-2 text-[0.8125rem] font-semibold text-accent-text hover:underline"
                          aria-label={`Preview the reminder for ${f.family_name}`}>Preview</button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}

              {body !== null && (
                <>
                  <Field label="Subject" htmlFor="rem-s">
                    <Input id="rem-s" value={subject ?? ''} onChange={e => setSubject(e.target.value)} />
                  </Field>
                  <Field label="Message" htmlFor="rem-b"
                         hint="{{guardian_name}}, {{amount}}, {{invoice_number}} and {{due_date}} are filled in for each family.">
                    <textarea id="rem-b" value={body} onChange={e => setBody(e.target.value)} rows={7}
                      className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                                 focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
                  </Field>
                </>
              )}

              {who && (
                <section aria-labelledby="rem-p" className="border-l-2 border-line-strong pl-3">
                  <h3 id="rem-p" className="label">
                    What {(fams.data ?? []).find(f => f.family_id === who)?.family_name ?? 'the family'} will read
                  </h3>
                  {preview.isLoading && <Skeleton className="mt-2 h-16" />}
                  {preview.error != null && <ErrorState error={preview.error} />}
                  {preview.data && (
                    <>
                      <p className="mt-1.5 text-[0.875rem] font-semibold">{preview.data.subject}</p>
                      <p className="mt-1 whitespace-pre-line text-[0.875rem] text-ink-2">{preview.data.body}</p>
                    </>
                  )}
                </section>
              )}
              {send.error != null && <ErrorState error={send.error} />}
            </div>
            <div className="flex gap-2 border-t border-line p-4 pb-safe">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                disabled={!chosen.length || !subject?.trim() || (body?.trim().length ?? 0) < 10}
                onClick={() => send.mutate()}>
                Send {chosen.length} reminder{chosen.length === 1 ? '' : 's'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
