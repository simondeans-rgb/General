'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Field, Input } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as I from '@/lib/repos/inbox';

/** A teacher writes to a child's family, in the open (R-028). */
export function TeacherMessageSheet({ student, onClose }: { student: { id: string; first_name: string }; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const send = useMutation({
    mutationFn: () => runAs(session, q => q(I.TEACHER_MESSAGE, [student.id, subject, body])),
    onSuccess: () => { setSent(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (sent) return <RecordSheet title="Sent" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">It is in the family’s conversation with the studio. Their reply comes to you in Messages, and the office can read it too.</p>
  </RecordSheet>;
  return (
    <RecordSheet title={`Message ${student.first_name}’s family`} onClose={onClose} saving={send.isPending} error={send.error}
      canSave={body.trim().length >= 3} saveLabel="Send" onSave={() => send.mutate()}>
      <p className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px] text-ink-2">
        The office can see this message and any reply — there are no private channels between staff and families.
      </p>
      <Field label="Subject" htmlFor="tm-s"><Input id="tm-s" value={subject} onChange={e => setSubject(e.target.value)} placeholder={`About ${student.first_name}`} /></Field>
      <Field label="Message" htmlFor="tm-b" required>
        <textarea id="tm-b" rows={5} value={body} onChange={e => setBody(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm" />
      </Field>
    </RecordSheet>
  );
}
