'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Choice, ErrorState } from '@/components/ui';
import { Word } from '@/components/app/session-row';
import { useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/cn';
import * as T from '@/lib/repos/teaching';

const LABEL = Object.fromEntries(T.TRIAL_RECOMMENDATIONS) as Record<T.TrialRecommendation, string>;
const TONE: Record<T.TrialRecommendation, 'positive' | 'caution' | 'ink'> = { ready: 'positive', other_class: 'ink', not_ready: 'caution' };

/**
 * On the register, under a trial child: how did it go? Read only by the office and the
 * class's teachers, never the family (0071). Saving tells the office.
 */
export function TrialFeedbackBox({ trialId, name, recommendation, comments, writtenBy }: {
  trialId: string; name: string; recommendation?: T.TrialRecommendation | null; comments?: string | null; writtenBy?: string | null;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [rec, setRec] = React.useState<T.TrialRecommendation | null>(recommendation ?? null);
  const [text, setText] = React.useState(comments ?? '');
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => { setRec(recommendation ?? null); setText(comments ?? ''); }, [recommendation, comments]);
  const dirty = rec !== (recommendation ?? null) || text.trim() !== (comments ?? '').trim();
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(T.SAVE_TRIAL_FEEDBACK, [trialId, rec, text])),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['db'] }); setSaved(true); },
  });
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;

  return (
    <section aria-label={`How ${name}’s trial went`} className="mt-3 rounded-[var(--radius-md)] border border-peach bg-peach-soft/50 p-3">
      <h3 className="text-[0.9375rem] font-semibold">How did {name}’s trial go?</h3>
      <p className="text-[0.8125rem] text-ink-2">For the office’s decision about a place. The family doesn’t see this.</p>
      <Choice label="Your recommendation" className="mt-2" value={rec}
        options={T.TRIAL_RECOMMENDATIONS.map(([value, label]) => ({ value, label }))}
        onChange={v => { setRec(v); setSaved(false); }} />
      <label htmlFor={`trial-note-${trialId}`} className="mt-3 block text-[0.875rem] font-semibold">Comments</label>
      <textarea id={`trial-note-${trialId}`} rows={3} value={text} maxLength={2000}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="How they joined in, their level, confidence, anything the office should know."
        className="mt-1 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.9375rem]
                   focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      {save.error != null && <ErrorState error={save.error} />}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button onClick={() => save.mutate()} loading={save.isPending} disabled={!dirty || (!rec && !text.trim()) || offline}>
          {recommendation || comments ? 'Update' : 'Send to the office'}
        </Button>
        <span role="status" className="text-[0.8125rem] text-ink-3">
          {offline ? 'Needs a connection to send.'
            : saved && !dirty ? 'Sent. The office has been told.'
            : writtenBy && !dirty ? `Saved by ${writtenBy}.` : ''}
        </span>
      </div>
    </section>
  );
}

/** For the office, beside the trial: what the teacher said. */
export function TrialFeedbackView({ trialId }: { trialId: string }) {
  const f = useRow<{ recommendation: T.TrialRecommendation | null; comments: string | null; written_by_name: string | null; updated_at: string }>(
    ['trial-feedback', trialId], T.TRIAL_FEEDBACK, [trialId]);
  if (!f.data) return <p className="mt-1 text-[0.8125rem] text-ink-3">No word from the teacher yet.</p>;
  return (
    <div className="mt-1.5 border-l-2 border-peach pl-2.5 text-[0.8438rem]">
      <p>
        <span className="text-ink-3">Teacher’s view{f.data.written_by_name ? ` (${f.data.written_by_name})` : ''}: </span>
        {f.data.recommendation && <Word tone={TONE[f.data.recommendation]}>{LABEL[f.data.recommendation]}</Word>}
      </p>
      {f.data.comments && <p className="mt-0.5 text-ink-2">“{f.data.comments}”</p>}
    </div>
  );
}
