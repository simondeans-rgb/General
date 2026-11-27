'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ErrorState } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as P from '@/lib/repos/progress';

/**
 * Why a student may need support (UR-45), as plain words. Facts, not labels:
 * a run of absences, skills not started, medical notes, the office's note.
 */
export function supportReasons(r: P.SupportRow | undefined, s: { has_medical_need?: boolean | null }): string[] {
  const out: string[] = [];
  if (r && r.absence_streak >= 2) out.push(`Absent the last ${r.absence_streak} classes`);
  if (r && r.not_yet > 0) out.push(`${r.not_yet} skill${r.not_yet === 1 ? '' : 's'} not started`);
  if (s.has_medical_need) out.push('Medical notes');
  if (r?.support_note) out.push('Support note');
  return out;
}

/** The office writes it; teachers read it. Families never see it. */
export function SupportNote({ studentId, note, editable }: { studentId: string; note: string | null; editable: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [text, setText] = React.useState(note ?? '');
  React.useEffect(() => setText(note ?? ''), [note, studentId]);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(P.SET_SUPPORT_NOTE, [studentId, text])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!editable) return note ? <p className="whitespace-pre-wrap text-[0.9062rem]">{note}</p> : null;
  return (
    <div className="space-y-2">
      <label htmlFor={`support-${studentId}`} className="block text-[0.8125rem] text-ink-3">
        What helps this child in class. Their teachers see it; the family and the child do not.
      </label>
      <textarea id={`support-${studentId}`} rows={3} maxLength={500} value={text} onChange={e => setText(e.target.value)}
        className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.9375rem] focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      {save.error != null && <ErrorState error={save.error} />}
      <div className="flex items-center gap-3">
        <Button size="sm" loading={save.isPending} disabled={text.trim() === (note ?? '').trim()} onClick={() => save.mutate()}>
          {text.trim() ? 'Save support note' : 'Remove support note'}
        </Button>
        {save.isSuccess && text.trim() === (note ?? '').trim() && <span role="status" className="text-[0.8125rem] text-positive">Saved</span>}
      </div>
    </div>
  );
}
