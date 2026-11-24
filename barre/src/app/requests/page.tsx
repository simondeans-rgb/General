'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox, Check, X, MessageSquare, Trophy, CheckCircle2, HeartPulse, ClipboardPlus, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RecordSheet } from '@/components/app/record-sheet';
import * as P from '@/lib/repos/people';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { relativeDay, time, dateLong } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  question: 'Question', private_lesson: 'Private lesson', medical_update: 'Medical update',
  event_interest: 'Event', absence: 'Absence', other: 'Other',
};

/**
 * The studio's side of "request, then confirm". Everything a family has asked
 * for that nobody has answered yet, in one queue. Without this the family
 * hub's request buttons would send messages into a void.
 */
export default function RequestsPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const requests = useRows<H.PendingRequest>(['pending-requests'], H.PENDING_REQUESTS);
  const entries = useRows<any>(['pending-entries'], H.PENDING_ENTRIES);
  const [answering, setAnswering] = React.useState<any>(null);
  const [recording, setRecording] = React.useState<H.PendingRequest | null>(null);
  const [acked, setAcked] = React.useState<string | null>(null);

  // One tap: the parent gets a standard acknowledgement; the record is untouched.
  const ack = useMutation({
    mutationFn: async (r: H.PendingRequest) => runAs(session, q => q(H.ACK_MEDICAL, [r.id, null, null, null])),
    onSuccess: (_d, r) => {
      setAcked(`${r.guardian_name ?? r.family_name} has been told you received it. It is still to be added to ${r.student_name ?? 'the child'}’s record.`);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });

  const decide = useMutation({
    mutationFn: async (v: { id: string; status: 'confirmed' | 'declined' }) =>
      runAs(session, q => q(H.DECIDE_ENTRY, [v.id, v.status])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const total = (requests.data?.length ?? 0) + (entries.data?.length ?? 0);

  return (
    <Shell title="Requests" allow={['owner', 'admin']}
      subtitle={total ? `${total} waiting on you` : 'Nothing waiting'}>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card>
          <CardHeader title="From families" subtitle="Medical updates first — they are what a teacher needs before the next class" />
          {requests.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-20" />)}</div>}
          {requests.data?.length === 0 && !requests.isLoading && (
            <EmptyState icon={<Inbox className="size-5" />} title="Nothing unanswered"
              body="Questions from parents and students land here." />
          )}
          {acked && (
            <p role="status" className="flex items-center gap-2 border-b border-line bg-positive-soft px-4 py-2.5 text-[13px]">
              <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden /> {acked}
            </p>
          )}
          {ack.error != null && <div className="p-3"><ErrorState error={ack.error} /></div>}
          <ul className="divide-y divide-line">
            {requests.data?.map(r => {
              const medical = r.kind === 'medical_update';
              return (
                <li key={r.id} className={cn('px-4 py-3', medical && 'bg-caution-soft/40')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={medical ? 'critical' : 'neutral'}
                           icon={medical ? <HeartPulse className="size-3" aria-hidden /> : undefined}>
                      {KIND_LABEL[r.kind] ?? r.kind}
                    </Badge>
                    <span className="text-[12.5px] text-ink-3">
                      {r.guardian_name ?? r.family_name}{r.student_name ? ` · about ${r.student_name}` : ''}
                    </span>
                    <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(r.created_at)}</span>
                  </div>
                  <p className="mt-1.5 font-medium">{r.subject}</p>
                  <p className="mt-0.5 text-sm text-ink-2">{r.body}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {medical ? (
                      <>
                        <Button size="sm" variant="primary" onClick={() => setRecording(r)}>
                          <ClipboardPlus className="size-4" aria-hidden /> Acknowledge & add to record
                        </Button>
                        <Button size="sm" loading={ack.isPending && ack.variables?.id === r.id}
                                onClick={() => ack.mutate(r)}>
                          <Check className="size-4" aria-hidden /> Acknowledge
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAnswering(r)}>
                          <MessageSquare className="size-4" aria-hidden /> Reply
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => setAnswering(r)}>
                        <MessageSquare className="size-4" aria-hidden /> Reply
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Event and competition entries"
            subtitle="Nothing is in the diary until you confirm it" />
          {entries.isLoading && <div className="space-y-2 p-4">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
          {entries.error && <div className="p-4"><ErrorState error={entries.error} /></div>}
          {entries.data?.length === 0 && !entries.isLoading && (
            <EmptyState icon={<Trophy className="size-5" />} title="No entries waiting"
              body="Requests from families appear here." />
          )}
          <ul className="divide-y divide-line">
            {entries.data?.map(e => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{e.student_name}</span>
                  <span className="block truncate text-[13px] text-ink-2">
                    {e.event_title} · {dateLong(e.starts_at)}, {time(e.starts_at)}
                  </span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'declined' })}>
                    <X className="size-4" aria-hidden /> Decline
                  </Button>
                  <Button size="sm" variant="primary" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'confirmed' })}>
                    <Check className="size-4" aria-hidden /> Confirm
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Card>

      </div>

      {answering && <AnswerDialog request={answering} onClose={() => setAnswering(null)} />}
      {recording && <RecordUpdateSheet request={recording} onClose={() => setRecording(null)}
                      onDone={msg => { setRecording(null); setAcked(msg); }} />}
    </Shell>
  );
}

function AnswerDialog({ request, onClose }: { request: any; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [answer, setAnswer] = React.useState('');
  const [done, setDone] = React.useState(false);

  const send = useMutation({
    mutationFn: async () => runAs(session, q => q(H.ANSWER_REQUEST, [request.id, answer.trim()])),
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ans-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <CheckCircle2 className="size-5" />
            </span>
            <p id="ans-t" className="font-medium">Replied</p>
            <p className="mt-1 text-sm text-ink-2">The family sees your answer in their hub.</p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="ans-t" className="text-[17px] font-semibold tracking-tight">Reply</h2>
            <p className="mt-0.5 text-sm text-ink-2">{request.subject}</p>
            <p className="mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2">{request.body}</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
              aria-label="Your reply" placeholder="Write your reply…"
              className="mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
            {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                      disabled={answer.trim().length < 2} onClick={() => send.mutate()}>Send reply</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Acknowledge the parent and update the child's record in one step. The
 * parent's own words sit at the top; each field can take them with a tap,
 * and the office edits from there. Saving does both or neither (0021).
 */
function RecordUpdateSheet({ request: r, onClose, onDone }: {
  request: H.PendingRequest; onClose: () => void; onDone: (msg: string) => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [studentId, setStudentId] = React.useState(r.student_id ?? (r.children.length === 1 ? r.children[0]!.id : ''));
  const child = r.children.find(c => c.id === studentId);
  const current = useRows<P.Medical>(['medical', studentId], P.MEDICAL, [studentId], { enabled: !!studentId });
  const m = current.data?.[0];

  const [fields, setFields] = React.useState<Record<string, string>>({});
  const [urgent, setUrgent] = React.useState(false);
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!studentId || current.isPending || loadedFor === studentId) return;
    setFields({ allergies: m?.allergies ?? '', conditions: m?.conditions ?? '',
                medications: m?.medications ?? '', action_plan: m?.action_plan ?? '' });
    setUrgent(m?.requires_alert ?? false);
    setLoadedFor(studentId);
  }, [studentId, current.isPending, m, loadedFor]);

  const first = (child?.name ?? r.student_name ?? '').split(' ')[0] || 'your child';
  const parent = (r.guardian_name ?? '').split(' ')[0];
  const [message, setMessage] = React.useState('');
  React.useEffect(() => {
    setMessage(`Thank you${parent ? `, ${parent}` : ''} — we have updated ${first}'s medical record, and their teachers can now see it.`);
  }, [first, parent]);

  const save = useMutation({
    mutationFn: () => runAs(session, q => q(H.ACK_MEDICAL, [r.id,
      JSON.stringify({ ...fields, requires_alert: urgent }), message, r.student_id ? null : studentId])),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db'] });
      onDone(`${first}’s record is updated, ${r.guardian_name ?? 'the family'} has been told, and teachers can see it.`);
    },
  });

  const ready = !!studentId && loadedFor === studentId;
  const changed = ready && (urgent !== (m?.requires_alert ?? false) || (['allergies', 'conditions', 'medications', 'action_plan'] as const)
    .some(k => (fields[k] ?? '').trim() !== ((m?.[k] as string | null) ?? '').trim()));
  const take = (k: string) => setFields(f => ({ ...f, [k]: f[k]?.trim() ? `${f[k]!.trim()}\n${r.body}` : r.body }));

  const FIELDS: [string, string, string][] = [
    ['allergies', 'Allergies', 'Peanuts — carries an EpiPen'],
    ['conditions', 'Conditions', 'Asthma'],
    ['medications', 'Medication', 'Blue inhaler, front pocket of her bag'],
    ['action_plan', 'What to do in an emergency', 'Two puffs of the inhaler, sit her down, call home'],
  ];

  return (
    <RecordSheet title="Add to the medical record" subtitle={`${r.guardian_name ?? r.family_name}${child ? ` · ${child.name}` : ''}`}
      onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error}
      canSave={changed && message.trim().length > 3} saveLabel="Update record and tell the parent">
      <figure className="rounded-[var(--radius-md)] border-l-4 border-caution bg-caution-soft p-3">
        <figcaption className="text-[12px] font-medium text-ink-3">{r.guardian_name ?? 'The parent'} wrote · {r.subject}</figcaption>
        <blockquote className="mt-1 text-sm">{r.body}</blockquote>
      </figure>

      {!r.student_id && r.children.length > 1 && (
        <Field label="Which child" htmlFor="ru-child" required>
          <Select id="ru-child" value={studentId} onChange={e => setStudentId(e.target.value)}>
            <option value="">Choose…</option>
            {r.children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
      )}

      {studentId && !ready && <Skeleton className="h-40" />}
      {ready && (
        <>
          {FIELDS.map(([k, label, ph]) => (
            <Field key={k} label={label} htmlFor={`ru-${k}`}>
              <textarea id={`ru-${k}`} rows={2} value={fields[k] ?? ''} placeholder={ph}
                onChange={e => setFields(f => ({ ...f, [k]: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                           focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
              <button type="button" onClick={() => take(k)}
                className="mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-[12.5px] font-medium text-accent hover:bg-accent-soft">
                <CornerDownLeft className="size-3.5" aria-hidden /> Add the parent’s words here
              </button>
            </Field>
          ))}
          <label className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line p-3 text-sm">
            <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} className="mt-0.5 size-4" />
            <span>
              <span className="font-medium">Urgent — show a red alert</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-2">Teachers see every detail above either way.</span>
            </span>
          </label>
          <Field label="Message to the parent" htmlFor="ru-msg" required>
            <textarea id="ru-msg" rows={3} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
          </Field>
          {!changed && <p className="text-[12.5px] text-ink-3">Change the record above to save — or use Acknowledge if nothing needs changing.</p>}
        </>
      )}
    </RecordSheet>
  );
}
