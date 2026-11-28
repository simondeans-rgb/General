'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, MessageSquare, ClipboardPlus, CornerDownLeft, UserRoundCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RecordSheet } from '@/components/app/record-sheet';
import * as P from '@/lib/repos/people';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Button, EmptyState, ErrorState, Field, Notice, Select, Skeleton, StatusLine
} from '@/components/ui';
import { SectionHead, Word } from '@/components/app/session-row';
import * as H from '@/lib/repos/hub';
import * as D from '@/lib/repos/dashboard';
import { SessionSheet } from '@/components/app/session-sheet';
import { readAs } from '@/lib/db/client';
import { relativeDay, time, dateLong } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  question: 'Question', private_lesson: 'Private lesson', medical_update: 'Medical update',
  event_interest: 'Event', absence: 'Absence', data_request: 'Data request', other: 'Other',
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
  const [covering, setCovering] = React.useState<D.SessionRow | null>(null);
  const openCover = useMutation({
    mutationFn: async (id: string) => (await readAs<D.SessionRow>(session, D.SESSION_BY_ID, [id]))[0],
    onSuccess: s => s && setCovering(s),
  });

  // One tap: the parent gets a standard acknowledgement; the record is untouched.
  const ack = useMutation({
    mutationFn: async (r: H.PendingRequest) => runAs(session, q => q(H.ACK_MEDICAL, [r.id, null, null, null])),
    onSuccess: (_d, r) => {
      setAcked(`${r.guardian_name ?? r.family_name} has been told you received it. It is still to be added to ${r.student_name ?? 'the child'}’s record.`);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });

  // One tap for what families asked for: a place, a new child, a trial.
  const approve = useMutation({
    mutationFn: async (r: H.PendingRequest) => {
      const sql = r.action === 'join_class' ? H.APPROVE_PLACE : r.action === 'add_child' ? H.APPROVE_CHILD : H.APPROVE_TRIAL;
      const rows = await runAs(session, q => q<{ outcome?: string }>(sql, r.action === 'join_class' ? [r.id, null] : [r.id]));
      return { r, outcome: rows[0]?.outcome };
    },
    onSuccess: ({ r, outcome }) => {
      setAcked(r.action === 'join_class'
        ? (outcome === 'enrolled' ? `Done — enrolled in ${r.class_name}, and the family has been told.`
                                  : `${r.class_name} is full, so they are on the waiting list. The family has been told.`)
        : r.action === 'add_child' ? 'Added to the family, with the parent as emergency contact. They have been told.'
        : 'Trial booked and the family told.');
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
      <div className="mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="min-w-0">
          <SectionHead title="From families" meta={requests.data?.length ? `${requests.data.length} · medical updates first` : undefined} />
          {requests.isLoading && <div className="space-y-2 pt-3">{[0,1].map(i => <Skeleton key={i} className="h-20" />)}</div>}
          {requests.data?.length === 0 && !requests.isLoading && (
            <EmptyState title="Nothing unanswered"
              body="Questions and updates from parents and students land here." />
          )}
          {acked && (
            <div role="status" className="border-b border-line py-3">
              <StatusLine title={acked} />
            </div>
          )}
          {ack.error != null && <div className="pt-3"><ErrorState error={ack.error} /></div>}
          {approve.error != null && <div className="pt-3"><ErrorState error={approve.error} /></div>}
          <ul className="divide-y divide-line">
            {requests.data?.map((r, i) => {
              const medical = r.kind === 'medical_update';
              // One primary action on the screen: the first request's.
              const lead = i === 0 ? 'primary' : 'secondary';
              return (
                <li key={r.id} className={cn('px-1 py-4', medical && 'border-l-2 border-critical pl-3')}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Word tone={medical ? 'critical' : 'ink'}>{KIND_LABEL[r.kind] ?? r.kind}</Word>
                    <span className="text-[0.8125rem] text-ink-3">
                      {r.guardian_name ?? r.family_name}{r.student_name ? ` · about ${r.student_name}` : ''}
                    </span>
                    <span className="ml-auto text-[0.7812rem] text-ink-3">{relativeDay(r.created_at)}</span>
                  </div>
                  <p className="mt-1.5 font-semibold">{r.subject}</p>
                  <p className="mt-0.5 text-[0.9062rem] text-ink-2">{r.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {medical ? (
                      <>
                        <Button size="sm" variant={lead} onClick={() => setRecording(r)}>
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
                    ) : r.action ? (
                      <>
                        <Button size="sm" variant={lead} loading={approve.isPending && approve.variables?.id === r.id}
                                onClick={() => approve.mutate(r)}>
                          <Check className="size-4" aria-hidden />
                          {r.action === 'join_class' ? 'Give them a place' : r.action === 'add_child' ? 'Add to the family' : 'Book the trial'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAnswering(r)}>
                          <MessageSquare className="size-4" aria-hidden /> Reply instead
                        </Button>
                      </>
                    ) : r.session_id ? (
                      <>
                        <Button size="sm" variant={lead} loading={openCover.isPending && openCover.variables === r.session_id}
                                onClick={() => openCover.mutate(r.session_id!)}>
                          <UserRoundCheck className="size-4" aria-hidden /> Arrange cover
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
        </section>
        <section className="min-w-0">
          <SectionHead title="Event and competition entries" meta={entries.data?.length ? `${entries.data.length}` : undefined} />
          <p className="py-2 text-[0.8125rem] text-ink-3">Nothing is in the diary until you confirm it.</p>
          {entries.isLoading && <div className="space-y-2">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
          {entries.error && <ErrorState error={entries.error} />}
          {entries.data?.length === 0 && !entries.isLoading && (
            <p className="border-t border-line py-3 text-[0.875rem] text-ink-3">No entries waiting.</p>
          )}
          <ul className="divide-y divide-line border-t border-line">
            {entries.data?.map(e => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{e.student_name}</span>
                  <span className="block text-[0.8125rem] text-ink-3">
                    {e.event_title} · {dateLong(e.starts_at)}, {time(e.starts_at)}
                  </span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'declined' })}>
                    <X className="size-4" aria-hidden /> Decline
                  </Button>
                  <Button size="sm" loading={decide.isPending}
                          onClick={() => decide.mutate({ id: e.id, status: 'confirmed' })}>
                    <Check className="size-4" aria-hidden /> Confirm
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {covering && <SessionSheet session={covering} initial="cover" onClose={() => setCovering(null)} />}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ans-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <>
            <div className="px-5 py-6">
              <h2 id="ans-t" className="sr-only">Replied</h2>
              <StatusLine title={request.subject} detail="The family sees your answer in their hub." />
            </div>
            <div className="flex border-t border-line px-5 py-3 pb-safe sm:justify-end">
              <Button className="w-full sm:w-auto" variant="primary" onClick={onClose}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-line px-5 pb-3 pt-4">
              <h2 id="ans-t" className="font-display text-[1.25rem] leading-tight">Reply</h2>
              <p className="mt-1 text-[0.8438rem] text-ink-3">{request.subject}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <blockquote className="border-l-2 border-line-strong pl-3 text-[0.9062rem] text-ink-2">{request.body}</blockquote>
              <label htmlFor="ans-body" className="mt-4 block text-[0.8125rem] font-medium text-ink-2">Your reply</label>
              <textarea id="ans-body" value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
                placeholder="Write your reply…"
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end">
              <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button className="flex-[2] sm:flex-none" variant="primary" loading={send.isPending}
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
      <figure className="border-l-2 border-critical pl-3">
        <figcaption className="text-[0.8125rem] text-ink-3">{r.guardian_name ?? 'The parent'} wrote · {r.subject}</figcaption>
        <blockquote className="mt-1 text-[0.9375rem] font-medium">{r.body}</blockquote>
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
                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              <button type="button" onClick={() => take(k)}
                className="mt-1 inline-flex min-h-[36px] items-center gap-1 text-[0.8125rem] font-semibold text-accent-text hover:underline">
                <CornerDownLeft className="size-3.5" aria-hidden /> Add the parent’s words here
              </button>
            </Field>
          ))}
          <label className="flex min-h-[44px] items-start gap-3 text-[0.875rem]">
            <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} className="mt-0.5 size-[18px] accent-[var(--color-accent)]" />
            <span>
              <span className="font-semibold">Urgent — show a red alert</span>
              <span className="mt-0.5 block text-[0.8125rem] text-ink-3">Teachers see every detail above either way.</span>
            </span>
          </label>
          <Field label="Message to the parent" htmlFor="ru-msg" required>
            <textarea id="ru-msg" rows={3} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
          {!changed && <p className="text-[0.7812rem] text-ink-3">Change the record above to save — or use Acknowledge if nothing needs changing.</p>}
        </>
      )}
    </RecordSheet>
  );
}
