'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { relativeDay } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  question: 'Question', private_lesson: 'Private lesson', medical_update: 'Medical update',
  event_interest: 'Event', absence: 'Absence', other: 'Other',
};
const STATUS_TEXT: Record<string, string> = { caution: 'text-caution', info: 'text-info', positive: 'text-positive', neutral: 'text-ink-2' };
const STATUS: Record<string, { label: string; tone: Tone }> = {
  open:        { label: 'Waiting on the studio', tone: 'caution' },
  in_progress: { label: 'Being looked at',       tone: 'info' },
  answered:    { label: 'Answered',              tone: 'positive' },
  closed:      { label: 'Closed',                tone: 'neutral' },
};

export default function ParentEnquiries() {
  const requests = useRows<H.RequestRow>(['my-requests'], H.MY_REQUESTS);
  const [asking, setAsking] = React.useState(false);

  return (
    <Shell title="Ask the studio" allow={['guardian']}
      actions={<Button size="sm" variant="primary" onClick={() => setAsking(true)}>
        <MessageSquarePlus className="size-4" aria-hidden /> Ask a question
      </Button>}>
      <div className="mx-auto max-w-2xl">
        {requests.isLoading && <div className="space-y-3">{[0, 1].map(i => <Skeleton key={i} className="h-20" />)}</div>}
        {requests.error != null && <ErrorState error={requests.error} onRetry={() => requests.refetch()} />}
        {requests.data?.length === 0 && !requests.isLoading && (
          <EmptyState title="Nothing asked yet"
            body="Questions about classes, uniform, private lessons or medical details all go here."
            action={<Button onClick={() => setAsking(true)}>Ask a question</Button>} />
        )}

        {!!requests.data?.length && (
          <ul className="divide-y divide-line border-t-2 border-ink">
            {requests.data.map(r => {
              const s = STATUS[r.status] ?? STATUS.open!;
              return (
                <li key={r.id} className="py-4">
                  <p className="text-[13px] text-ink-3">
                    <span className="font-semibold text-ink-2">{KIND_LABEL[r.kind] ?? r.kind}</span>
                    {' · '}<span className={cn('font-semibold', STATUS_TEXT[s.tone])}>{s.label}</span>
                    {r.student_name && <> · about {r.student_name}</>}
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-3">
                    <h2 className="min-w-0 flex-1 font-semibold leading-snug">{r.subject}</h2>
                    <span className="shrink-0 text-[13px] text-ink-3">{relativeDay(r.created_at)}</span>
                  </div>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{r.body}</p>
                  {r.answer && (
                    <div className="mt-3 border-l-2 border-positive pl-3">
                      <p className="text-[13px] font-semibold text-positive">The studio replied</p>
                      <p className="mt-0.5 text-[15px]">{r.answer}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {asking && <AskDialog onClose={() => setAsking(false)} />}
    </Shell>
  );
}

function AskDialog({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const children = useRows<{ id: string; first_name: string; last_name: string }>(
    ['ask-children'], `select id, first_name, last_name from student where deleted_at is null order by date_of_birth`);
  const [studentId, setStudentId] = React.useState('');
  const [kind, setKind] = React.useState('question');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!studentId && children.data?.[0]) setStudentId(children.data[0].id);
  }, [children.data, studentId]);

  const send = useMutation({
    mutationFn: async () => runAs(session, q => q(H.RAISE_REQUEST, [studentId, kind, subject.trim(), body.trim()])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const valid = studentId && subject.trim().length >= 3 && body.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ask-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-2">
            <p className="font-display text-[22px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]">Sent</p>
            <p id="ask-t" className="mt-1.5 font-semibold">Sent to the studio</p>
            <p className="mt-1 text-sm text-ink-2">You will see the reply here.</p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="ask-t" className="text-[17px] font-semibold tracking-tight">Ask the studio</h2>
            <div className="mt-4 space-y-3">
              {(children.data?.length ?? 0) > 1 && (
                <Field label="About which child" htmlFor="ask-child">
                  <Select id="ask-child" value={studentId} onChange={e => setStudentId(e.target.value)}>
                    {children.data?.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </Select>
                </Field>
              )}
              <Field label="What is it about" htmlFor="ask-kind">
                <Select id="ask-kind" value={kind} onChange={e => setKind(e.target.value)}>
                  <option value="question">A question</option>
                  <option value="private_lesson">A private lesson</option>
                  <option value="medical_update">A medical or allergy update</option>
                  <option value="event_interest">A competition or event</option>
                  <option value="other">Something else</option>
                </Select>
              </Field>
              {kind === 'medical_update' && (
                <p className="border-l-2 border-caution pl-3 text-[13.5px] text-ink-2">
                  Studio staff update the medical record themselves, so there is a record of who
                  changed what. Tell them here and they’ll make the change.
                </p>
              )}
              <Field label="Subject" htmlFor="ask-subject" required>
                <Input id="ask-subject" value={subject} onChange={e => setSubject(e.target.value)}
                       placeholder="Shoes for the exam" />
              </Field>
              <Field label="Message" htmlFor="ask-body" required>
                <textarea id="ask-body" value={body} onChange={e => setBody(e.target.value)} rows={4}
                  placeholder="As much or as little as you like."
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>
            </div>
            {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                      disabled={!valid} onClick={() => send.mutate()}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
