'use client';

import * as React from 'react';
import { CalendarPlus } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { BookTrialSheet, usePipeline } from '@/components/app/enrolment-actions';
import { Button, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { useWrite } from '@/lib/write';
import { Word } from '@/components/app/session-row';
import * as C from '@/lib/repos/classes';
import { ageFrom, dateShort, time, toDateInput } from '@/lib/format';

export const STAGE_LABEL: Record<string, string> = {
  enquiry: 'Enquiry', trial_requested: 'Trial requested', trial_booked: 'Trial booked',
  trial_attended: 'Tried a class', trial_missed: 'Missed the trial', follow_up: 'Follow up',
  enrolled: 'Enrolled', closed_lost: 'Closed',
};

/** Whether an enquiry can have a trial booked from it now. */
export const canBookTrial = (e: C.EnquiryRow) =>
  !e.live_trial && !['enrolled', 'closed_lost'].includes(e.stage);

/**
 * One enquiry, opened (UR-18): who, how to reach them, where it stands, and
 * the next step — book a trial without retyping anything, or close it with a
 * reason so the funnel knows why.
 */
export function EnquirySheet({ enquiry: e, onClose, startClosing = false, startBooking = false }: {
  enquiry: C.EnquiryRow; onClose: () => void; startClosing?: boolean; startBooking?: boolean;
}) {
  const [booking, setBooking] = React.useState(startBooking);
  const [closing, setClosing] = React.useState(startClosing);
  const [reason, setReason] = React.useState('');
  const close = usePipeline(C.CLOSE_ENQUIRY, onClose);

  if (booking) return <BookTrialSheet enquiry={e} onClose={onClose} />;

  const age = e.child_dob ? ageFrom(e.child_dob) : null;
  const open = !['enrolled', 'closed_lost'].includes(e.stage);

  return (
    <RecordSheet title={e.child_name ?? e.contact_name}
      subtitle={[age != null ? `${age} years old` : null, e.class_name ?? 'No class chosen yet'].filter(Boolean).join(' · ')}
      onClose={onClose}
      error={close.error} saving={close.isPending}
      saveLabel={closing ? 'Close the enquiry' : canBookTrial(e) ? 'Book a trial' : 'Done'}
      canSave={!closing || reason.trim().length >= 2}
      saveHint={closing ? 'Say briefly why, so the funnel shows it.' : null}
      onSave={() => closing ? close.mutate([e.id, reason.trim()])
        : canBookTrial(e) ? setBooking(true) : onClose()}>
      <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-[0.875rem]">
        <dt className="text-ink-3">Stage</dt>
        <dd><Word tone={e.stage === 'enrolled' ? 'positive' : e.stage === 'closed_lost' ? 'muted' : 'ink'}>{STAGE_LABEL[e.stage] ?? e.stage}</Word>
          {e.closed_reason && <span className="ml-2 text-ink-2">{e.closed_reason}</span>}</dd>
        <dt className="text-ink-3">Contact</dt>
        <dd className="min-w-0">
          <span className="block font-medium">{e.contact_name}</span>
          {e.contact_phone && <a href={`tel:${e.contact_phone}`} className="block min-h-[24px] tnum text-accent-text hover:underline">{e.contact_phone}</a>}
          {e.contact_email && <a href={`mailto:${e.contact_email}`} className="block min-h-[24px] truncate text-accent-text hover:underline">{e.contact_email}</a>}
        </dd>
        {e.source && <><dt className="text-ink-3">Came via</dt><dd>{e.source}</dd></>}
        <dt className="text-ink-3">Received</dt><dd>{dateShort(e.created_at)}</dd>
        {e.trial_starts_at && <><dt className="text-ink-3">Trial</dt>
          <dd>{dateShort(e.trial_starts_at)} at {time(e.trial_starts_at)}</dd></>}
      </dl>

      {open && !closing && <FollowUpAndNotes e={e} />}

      {e.live_trial && open && (
        <p className="text-[0.8125rem] text-ink-3">
          A trial is booked. Mark Came or No show under Trials after the class, and Joining when they take a place.
          The enquiry moves on by itself.
        </p>
      )}

      {open && !closing && (
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          {canBookTrial(e) && (
            <Button size="sm" onClick={() => setBooking(true)}>
              <CalendarPlus className="size-4" aria-hidden /> Book a trial
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setClosing(true)}>Not joining — close it</Button>
        </div>
      )}
      {closing && (
        <Field label="Why are they not joining?" htmlFor="enq-reason" required
               hint="For example: chose another school, times don’t suit, too young yet.">
          <Input id="enq-reason" value={reason} onChange={x => setReason(x.target.value)} />
        </Field>
      )}
    </RecordSheet>
  );
}

/**
 * Reception's call log for one enquiry (F10): what was said, by whom and
 * when, and the date to follow up, which Today reminds about.
 */
function FollowUpAndNotes({ e }: { e: C.EnquiryRow }) {
  const notes = useRows<C.EnquiryNote>(['enquiry-notes', e.id], C.ENQUIRY_NOTES, [e.id]);
  const [body, setBody] = React.useState('');
  const [on, setOn] = React.useState(toDateInput(e.next_action_on));
  // The enquiry passed in is the row as opened; what was saved since lives here.
  const [savedOn, setSavedOn] = React.useState(toDateInput(e.next_action_on));
  const who = e.child_name ?? e.contact_name;
  const add = useWrite(C.ADD_ENQUIRY_NOTE, { onDone: () => { setBody(''); if (on) setSavedOn(on); }, saved: `Note added to ${who}’s enquiry` });
  const date = useWrite(C.SET_ENQUIRY_FOLLOW_UP, { onDone: () => setSavedOn(on), saved: () => on ? `Follow up with ${who} on ${dateShort(on)}` : `Follow-up date cleared` });
  const dateChanged = on !== savedOn;
  return (
    <section aria-labelledby={`enq-notes-${e.id}`} className="space-y-3 border-t border-line pt-3">
      <h3 id={`enq-notes-${e.id}`} className="text-[0.875rem] font-semibold">Follow-up and notes</h3>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Follow up by" htmlFor="enq-on" hint="Today reminds you on the day.">
          <Input id="enq-on" type="date" value={on} onChange={x => setOn(x.target.value)} className="w-44" />
        </Field>
        {dateChanged && (
          <Button size="sm" loading={date.isPending} onClick={() => date.mutate([e.id, on || null])} className="mb-6">
            {on ? 'Save date' : 'Clear date'}
          </Button>
        )}
      </div>
      <Field label="Add a note" htmlFor="enq-note" hint="For example: called back, wants Saturdays. Families never see notes.">
        <textarea id="enq-note" rows={2} value={body} onChange={x => setBody(x.target.value)} maxLength={2000}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <Button size="sm" disabled={!body.trim()} loading={add.isPending}
              onClick={() => add.mutate([e.id, body.trim(), dateChanged && on ? on : null])}>Add note</Button>
      {(add.error ?? date.error) != null && <ErrorState error={add.error ?? date.error} />}
      {notes.isPending && <Skeleton className="h-10" />}
      {notes.data?.length === 0 && <p className="text-[0.8125rem] text-ink-3">No notes yet.</p>}
      {!!notes.data?.length && (
        <ol className="divide-y divide-line border-y border-line">
          {notes.data.map(n => (
            <li key={n.id} className="py-2 text-[0.875rem]">
              <p className="whitespace-pre-line">{n.body}</p>
              <p className="mt-0.5 text-[0.7812rem] text-ink-3">{n.author ?? 'Former staff'} · {dateShort(n.created_at)} {time(n.created_at)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
