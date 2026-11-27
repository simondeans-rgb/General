'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { Shell } from './shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import {
  Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { BuyTickets, MyCostumes } from '@/components/app/show-tools';
import { money, time, relativeDay, dateLong, dateShort } from '@/lib/format';

const KIND_LABEL: Record<string, string> = {
  competition: 'Competition', show: 'Show', exam: 'Exam', workshop: 'Workshop',
  private_lesson: 'Private lesson', rehearsal: 'Rehearsal', social: 'Social',
};
const STATUS: Record<string, { label: string; tone: Tone }> = {
  requested: { label: 'Requested — waiting on the studio', tone: 'caution' },
  confirmed: { label: 'Confirmed', tone: 'positive' },
  invited:   { label: 'Invited', tone: 'info' },
  declined:  { label: 'Not this time', tone: 'neutral' },
  waitlisted:{ label: 'Waiting list', tone: 'caution' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' },
};

/**
 * Events for a family or a student. Asking to take part is a request, never a
 * booking — the studio confirms, which is both how studios work and the only
 * way to avoid two families claiming the same private lesson slot.
 */
export function EventsView({ allow, title }: { allow: Role[]; title: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const events = useRows<H.EventRow>(['events'], H.EVENTS);
  const children = useRows<{ id: string; first_name: string; last_name: string }>(
    ['event-children'], `select id, first_name, last_name from student where deleted_at is null order by date_of_birth`);
  const [asking, setAsking] = React.useState<H.EventRow | null>(null);
  const answer = useMutation({
    mutationFn: (v: { id: string; yes: boolean }) => runAs(session, q => q(H.ANSWER_INVITE, [v.id, v.yes])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  return (
    <Shell title={title} subtitle="Competitions, shows, exams and private lessons" allow={allow}>
      <div className="mx-auto max-w-2xl">
        {events.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-24" />)}</div>}
        {events.error != null && <ErrorState error={events.error} onRetry={() => events.refetch()} />}
        {events.data?.length === 0 && !events.isLoading && (
          <EmptyState title="Nothing in the diary"
            body="Competitions, shows and workshops show here when the studio adds them." />
        )}

        <ul className="divide-y divide-line border-t-2 border-ink">
        {events.data?.map(e => {
          // Each child on this event with their own status (UR-50).
          const entries = e.mine ?? [];
          const notOn = (children.data ?? []).filter(c => !entries.some(m => m.student_id === c.id));
          const closed = e.entries_close_on && new Date(e.entries_close_on) < new Date();
          const full = e.capacity != null && e.going >= e.capacity;
          const d = new Date(e.starts_at);
          return (
            <li key={e.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 py-5">
              <p aria-hidden className="text-center leading-none">
                <span className="block font-display text-[30px] tnum">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'Europe/London' }).format(d)}</span>
                <span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Europe/London' }).format(d)}</span>
              </p>
              <article className="min-w-0 space-y-3">
                <div>
                  <p className="text-[13px] text-ink-3">
                    <span className="font-semibold text-ink-2">{KIND_LABEL[e.kind] ?? e.kind}</span>
                  </p>
                  <h2 className="mt-0.5 font-display text-[19px] leading-tight">{e.title}</h2>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {['Today', 'Tomorrow'].includes(relativeDay(e.starts_at)) ? `${relativeDay(e.starts_at)}, ` : ''}{dateLong(e.starts_at)} · {time(e.starts_at)}{e.venue ? ` · ${e.venue}` : ''}
                  </p>
                  {e.description && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{e.description}</p>}
                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
                    {e.cost_minor != null && (
                      <div><dt className="inline text-ink-3">Cost </dt>
                        <dd className="inline font-semibold tnum">{money(e.cost_minor)}</dd></div>)}
                    {e.capacity != null && (
                      <div><dt className="inline text-ink-3">Places </dt>
                        <dd className="inline font-semibold tnum">{Math.max(0, e.capacity - e.going)} left of {e.capacity}{full ? ' · full' : ''}</dd></div>)}
                    {e.entries_close_on && (
                      <div><dt className="inline text-ink-3">Entries close </dt>
                        <dd className="inline font-semibold">{dateShort(e.entries_close_on)}</dd></div>)}
                    {e.teacher && (
                      <div><dt className="inline text-ink-3">With </dt>
                        <dd className="inline font-semibold">{e.teacher}</dd></div>)}
                  </dl>
                </div>

                {entries.length > 0 && (
                  <ul className="space-y-2 border-t border-line pt-3" aria-label="Your entries">
                    {entries.map(m => {
                      const st = STATUS[m.status];
                      return (
                        <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px]">
                          <span className="font-semibold">{m.first_name}</span>
                          <span className={cn('font-semibold', STATUS_TEXT[st?.tone ?? 'neutral'])}>{st?.label ?? m.status}</span>
                          {m.status === 'invited' && allow.includes('guardian') && (
                            <span className="flex gap-2">
                              <Button size="sm" variant="primary" onClick={() => answer.mutate({ id: m.id, yes: true })}>{m.first_name} will be there</Button>
                              <Button size="sm" variant="ghost" onClick={() => answer.mutate({ id: m.id, yes: false })}>Not this time</Button>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {answer.error != null && <ErrorState error={answer.error} />}
                {e.kind !== 'private_lesson' && notOn.length > 0 && (
                  !e.requests_open || closed || full ? (
                    entries.length === 0 && <p className="text-[13.5px] text-ink-3">
                      {full ? 'This one is full.' : closed ? 'Entries have closed.' : 'Not taking requests.'}
                      {' '}Message the studio if you’d still like to be considered.
                    </p>
                  ) : (
                    <Button onClick={() => setAsking(e)}>{entries.length ? `Ask for ${notOn.length === 1 ? notOn[0]!.first_name : 'another child'} too` : 'Ask to take part'}</Button>
                  )
                )}
                {!!e.notices?.length && (
                  <div className="space-y-2 border-t border-line pt-3">
                    <h3 className="text-[13px] font-semibold text-ink-2">Notices about this</h3>
                    {e.notices.map((n, i) => (
                      <div key={i} className="border-l-2 border-ink pl-3 text-[14px]">
                        <p className="font-semibold">{n.subject} <span className="font-normal text-ink-3">· {dateShort(n.sent_at)}</span></p>
                        <p className="whitespace-pre-line text-ink-2">{n.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(e.rehearsals?.length || (e.my_status === 'confirmed' && e.routines?.length)) ? (
                  <ul className="space-y-1 border-t border-line pt-3 text-[14px]">
                    {e.rehearsals?.map((r, i) => <li key={i}><span className="font-semibold">{r.title}</span> <span className="text-ink-3">· {dateLong(r.starts_at)}, {time(r.starts_at)}</span></li>)}
                    {e.my_status === 'confirmed' && e.routines?.map((r, i) => (
                      <li key={i}>Dance {r.position}: <span className="font-semibold">{r.title}</span>{r.costume ? <span className="text-ink-3"> · costume: {r.costume}</span> : ''}</li>
                    ))}
                  </ul>
                ) : null}
                {allow.includes('guardian') && e.my_status === 'confirmed' && <MyCostumes eventId={e.id} />}
                {allow.includes('guardian') && new Date(e.starts_at) > new Date() && <HelperRota eventId={e.id} />}
                {allow.includes('guardian') && (e.kind === 'show' || e.kind === 'competition') && new Date(e.starts_at) > new Date() && (
                  <BuyTickets eventId={e.id} />
                )}
              </article>
            </li>
          );
        })}
        </ul>
      </div>

      {asking && (
        <RequestDialog event={asking} children={(children.data ?? []).filter(c => !(asking.mine ?? []).some(m => m.student_id === c.id))}
          onClose={() => setAsking(null)}
          onDone={() => { setAsking(null); qc.invalidateQueries({ queryKey: ['db'] }); }} />
      )}
    </Shell>
  );
}

const STATUS_TEXT: Record<string, string> = {
  caution: 'text-caution', positive: 'text-positive', info: 'text-info', neutral: 'text-ink-2',
};

function RequestDialog({ event, children, onClose, onDone }: {
  event: H.EventRow; children: { id: string; first_name: string; last_name: string }[];
  onClose: () => void; onDone: () => void;
}) {
  const { session } = useSession();
  const [studentId, setStudentId] = React.useState(children[0]?.id ?? '');
  const [note, setNote] = React.useState('');
  const [done, setDone] = React.useState(false);

  const send = useMutation({
    mutationFn: async () => runAs(session, q => q(H.REQUEST_PLACE, [event.id, studentId, note.trim() || null])),
    onSuccess: () => setDone(true),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ask-title" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-2">
            <p className="font-display text-[22px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]">Sent</p>
            <p id="ask-title" className="mt-1.5 font-semibold">Request sent</p>
            <p className="mt-1 text-sm text-ink-2">
              The studio will confirm. Nothing is booked until they do.
            </p>
            <Button className="mt-4 w-full" variant="primary" onClick={onDone}>Done</Button>
          </div>
        ) : (
          <>
            <h2 id="ask-title" className="text-[17px] font-semibold tracking-tight">Ask to take part</h2>
            <p className="mt-0.5 text-sm text-ink-2">{event.title}</p>
            <div className="mt-4 space-y-3">
              {children.length > 1 && (
                <Field label="Who for" htmlFor="ask-student">
                  <Select id="ask-student" value={studentId} onChange={e => setStudentId(e.target.value)}>
                    {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </Select>
                </Field>
              )}
              <Field label="Anything the studio should know" htmlFor="ask-note"
                     hint="Optional. Availability, which piece, that sort of thing.">
                <Input id="ask-note" value={note} onChange={e => setNote(e.target.value)}
                       placeholder="Free most evenings except Thursday" />
              </Field>
              {event.cost_minor != null && (
                <p className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px] text-ink-2">
                  This costs {money(event.cost_minor)}. You will be invoiced only once the studio confirms.
                </p>
              )}
            </div>
            {send.isError && <div className="mt-3"><ErrorState error={send.error} /></div>}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" loading={send.isPending}
                      disabled={!studentId} onClick={() => send.mutate()}>Send request</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type Slot = { id: string; role: string; starts_at: string | null; ends_at: string | null; needed: number; note: string | null; filled: number; mine: boolean };

/** Helping out at a show: the slots the studio needs filled, and a sign-up (UR-50). */
function HelperRota({ eventId }: { eventId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const slots = useRows<Slot>(['helper-slots', eventId], `select * from app.helper_slots($1)`, [eventId]);
  const act = useMutation({
    mutationFn: (v: { id: string; on: boolean }) => runAs(session, q => q(`select app.volunteer($1, $2)`, [v.id, v.on])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!slots.data?.length) return null;
  return (
    <div className="space-y-2 border-t border-line pt-3">
      <h3 className="text-[13px] font-semibold text-ink-2">Helpers needed</h3>
      <ul className="divide-y divide-line text-[14px]">
        {slots.data.map(sl => {
          const left = sl.needed - sl.filled;
          return (
            <li key={sl.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{sl.role}</span>
                <span className="text-ink-3">{sl.starts_at ? ` · ${time(sl.starts_at)}${sl.ends_at ? `–${time(sl.ends_at)}` : ''}` : ''} · {left > 0 ? `${left} more needed` : 'filled'}</span>
                {sl.note && <span className="block text-[13px] text-ink-3">{sl.note}</span>}
              </span>
              {sl.mine
                ? <Button size="sm" variant="ghost" loading={act.isPending} onClick={() => act.mutate({ id: sl.id, on: false })}>You’re helping · drop out</Button>
                : left > 0 && <Button size="sm" loading={act.isPending} onClick={() => act.mutate({ id: sl.id, on: true })}>I can help</Button>}
            </li>
          );
        })}
      </ul>
      {act.error != null && <ErrorState error={act.error} />}
    </div>
  );
}
