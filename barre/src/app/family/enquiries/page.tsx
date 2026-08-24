'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus, Check, Clock, CheckCircle2, HeartPulse } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { relativeDay } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  question: 'Question', private_lesson: 'Private lesson', medical_update: 'Medical update',
  event_interest: 'Event', absence: 'Absence', other: 'Other',
};
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
        <MessageSquarePlus className="size-4" aria-hidden /> New
      </Button>}>
      <div className="mx-auto max-w-2xl space-y-4">
        {requests.isLoading && <Card className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-20" />)}</Card>}
        {requests.error && <ErrorState error={requests.error} onRetry={() => requests.refetch()} />}
        {requests.data?.length === 0 && !requests.isLoading && (
          <Card><EmptyState icon={<MessageSquarePlus className="size-5" />} title="Nothing asked yet"
            body="Questions about classes, uniform, private lessons or medical details all go here."
            action={<Button variant="primary" onClick={() => setAsking(true)}>Ask a question</Button>} /></Card>
        )}

        {requests.data?.map(r => {
          const s = STATUS[r.status] ?? STATUS.open!;
          return (
            <Card key={r.id}>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{KIND_LABEL[r.kind] ?? r.kind}</Badge>
                  <Badge tone={s.tone}>{s.label}</Badge>
                  {r.student_name && <span className="text-[12.5px] text-ink-3">about {r.student_name}</span>}
                  <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(r.created_at)}</span>
                </div>
                <h2 className="mt-2 font-semibold">{r.subject}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{r.body}</p>
                {r.answer && (
                  <div className="mt-3 rounded-[var(--radius-md)] border-l-2 border-positive bg-positive-soft/50 p-3">
                    <p className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.05em] text-positive">
                      <CheckCircle2 className="size-3.5" aria-hidden /> The studio replied
                    </p>
                    <p className="mt-1 text-sm">{r.answer}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
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
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <Check className="size-5" />
            </span>
            <p id="ask-t" className="font-medium">Sent to the studio</p>
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
                <p className="flex gap-2 rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink-2">
                  <HeartPulse className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden />
                  <span>Studio staff update the medical record themselves so there is a record of who
                  changed what. Tell them here and they will make the change.</span>
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
                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
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
