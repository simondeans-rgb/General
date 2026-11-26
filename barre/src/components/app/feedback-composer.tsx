'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Notice } from '@/components/ui';
import * as H from '@/lib/repos/hub';

/**
 * Writing feedback.
 *
 * Two things are deliberate. Sharing is a decision, not a default — a note can
 * be saved as a draft and shared later. And the private note is labelled as
 * staff-only on the screen, because a teacher needs to trust that distinction
 * before they will write anything candid in it.
 */
export function FeedbackComposer({
  student, classId, onClose,
}: {
  student: { id: string; first_name: string; last_name: string };
  classId?: string | null;
  onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [headline, setHeadline] = React.useState('');
  const [goingWell, setGoingWell] = React.useState('');
  const [workOn, setWorkOn] = React.useState('');
  const [privateNote, setPrivateNote] = React.useState('');
  const [share, setShare] = React.useState(true);
  const [done, setDone] = React.useState(false);

  const save = useMutation({
    mutationFn: async () => runAs(session, q => q(H.WRITE_FEEDBACK, [
      student.id, classId ?? null, headline.trim(), goingWell.trim() || null,
      workOn.trim() || null, privateNote.trim() || null, share,
    ])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const valid = headline.trim().length >= 3 && (goingWell.trim() || workOn.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="fb-title" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-2" role="status">
            <h2 id="fb-title" className="sr-only">{share ? 'Shared with the family' : 'Saved as a draft'}</h2>
            <Notice word={share ? 'Shared' : 'Saved'} tone="positive"
              title={share ? `${student.first_name} and their guardians can see this now.` : 'Saved as a draft'}
              detail={share ? undefined : 'Only studio staff can see it until you share it.'} />
            <Button className="mt-5 w-full" variant="primary" size="lg" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="fb-title" className="font-display text-[20px] leading-tight">
              Feedback for {student.first_name}
            </h2>
            <div className="mt-4 space-y-3">
              <Field label="Headline" htmlFor="fb-head" required
                     hint="What this week was about, in a few words.">
                <Input id="fb-head" value={headline} onChange={e => setHeadline(e.target.value)}
                       placeholder="Lovely week" maxLength={80} />
              </Field>
              <Field label="Going well" htmlFor="fb-well">
                <textarea id="fb-well" rows={3} value={goingWell} onChange={e => setGoingWell(e.target.value)}
                  placeholder="Be specific — it means more than 'good work'."
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[15px]
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>
              <Field label="To work on" htmlFor="fb-work">
                <textarea id="fb-work" rows={3} value={workOn} onChange={e => setWorkOn(e.target.value)}
                  placeholder="One thing to practise before next week."
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[15px]
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>
              <Field label="Private note" htmlFor="fb-priv"
                     hint="Studio staff only. Never shown to the family, whatever you choose below.">
                <textarea id="fb-priv" rows={2} value={privateNote} onChange={e => setPrivateNote(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface-2 p-3 text-[15px]
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 border-t border-line pt-3">
                <input type="checkbox" checked={share} onChange={e => setShare(e.target.checked)}
                       className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" />
                <span>
                  <span className="block text-[15px] font-semibold">
                    Share with {student.first_name} and their guardians
                  </span>
                  <span className="mt-0.5 block text-[13.5px] text-ink-3">
                    {share
                      ? 'They will see it as soon as you save.'
                      : 'Saved as a draft. Nothing reaches the family until you share it.'}
                  </span>
                </span>
              </label>
            </div>
            {save.isError && <div className="mt-3"><ErrorState error={save.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={save.isPending}
                      disabled={!valid} onClick={() => save.mutate()}>
                {share ? 'Save and share' : 'Save draft'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
