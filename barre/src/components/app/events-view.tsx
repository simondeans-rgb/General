'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, MapPin, Clock, Check, CalendarClock, Users } from 'lucide-react';
import { Shell } from './shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { money, time, relativeDay, dateLong, dateShort } from '@/lib/format';

const KIND_TONE: Record<string, Tone> = {
  competition: 'amber', show: 'violet', exam: 'critical',
  workshop: 'teal', private_lesson: 'indigo', rehearsal: 'neutral', social: 'lime',
};
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

  return (
    <Shell title={title} subtitle="Competitions, shows, exams and private lessons" allow={allow}>
      <div className="mx-auto max-w-2xl space-y-4">
        {events.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-24" />)}</Card>}
        {events.error && <ErrorState error={events.error} onRetry={() => events.refetch()} />}
        {events.data?.length === 0 && !events.isLoading && (
          <Card><EmptyState icon={<Trophy className="size-5" />} title="Nothing in the diary"
            body="Competitions, shows and workshops will appear here when the studio adds them." /></Card>
        )}

        {events.data?.map(e => {
          const mine = e.my_status ? STATUS[e.my_status] : null;
          const closed = e.entries_close_on && new Date(e.entries_close_on) < new Date();
          const full = e.capacity != null && e.going >= e.capacity;
          return (
            <Card key={e.id}>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={KIND_TONE[e.kind] ?? 'neutral'}>{KIND_LABEL[e.kind] ?? e.kind}</Badge>
                  {mine && <Badge tone={mine.tone}>{mine.label}</Badge>}
                </div>
                <h2 className="mt-2 text-[17px] font-semibold tracking-tight">{e.title}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-2">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" aria-hidden />
                    {relativeDay(e.starts_at)}, {dateLong(e.starts_at)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />{time(e.starts_at)}
                  </span>
                  {e.venue && <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />{e.venue}</span>}
                </p>
                {e.description && <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{e.description}</p>}

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                  {e.cost_minor != null && (
                    <div><dt className="inline text-ink-3">Cost </dt>
                      <dd className="inline font-medium">{money(e.cost_minor)}</dd></div>)}
                  {e.capacity != null && (
                    <div><dt className="inline text-ink-3">Places </dt>
                      <dd className="inline font-medium">{e.going} of {e.capacity}</dd></div>)}
                  {e.entries_close_on && (
                    <div><dt className="inline text-ink-3">Entries close </dt>
                      <dd className="inline font-medium">{dateShort(e.entries_close_on)}</dd></div>)}
                  {e.teacher && (
                    <div><dt className="inline text-ink-3">With </dt>
                      <dd className="inline font-medium">{e.teacher}</dd></div>)}
                </dl>
              </div>

              {e.kind !== 'private_lesson' && !mine && (
                <div className="border-t border-line p-3">
                  {!e.requests_open || closed || full ? (
                    <p className="text-[13px] text-ink-3">
                      {full ? 'This one is full.' : closed ? 'Entries have closed.' : 'Not taking requests.'}
                      {' '}Message the studio if you would still like to be considered.
                    </p>
                  ) : (
                    <Button size="sm" onClick={() => setAsking(e)}>Ask to take part</Button>
                  )}
                </div>
              )}
              {mine?.tone === 'caution' && e.my_status === 'requested' && (
                <p className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-3">
                  The studio has your request{e.my_student ? ` for ${e.my_student}` : ''} and will confirm.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {asking && (
        <RequestDialog event={asking} children={children.data ?? []}
          onClose={() => setAsking(null)}
          onDone={() => { setAsking(null); qc.invalidateQueries({ queryKey: ['db'] }); }} />
      )}
    </Shell>
  );
}

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
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <Check className="size-5" />
            </span>
            <p id="ask-title" className="font-medium">Request sent</p>
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
                     hint="Optional — availability, which piece, that sort of thing.">
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
