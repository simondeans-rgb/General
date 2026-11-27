'use client';

import * as React from 'react';
import { CalendarPlus } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { BookTrialSheet, usePipeline } from '@/components/app/enrolment-actions';
import { Button, Field, Input } from '@/components/ui';
import { Word } from '@/components/app/session-row';
import * as C from '@/lib/repos/classes';
import { ageFrom, dateShort, time } from '@/lib/format';

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
      <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-[14px]">
        <dt className="text-ink-3">Stage</dt>
        <dd><Word tone={e.stage === 'enrolled' ? 'positive' : e.stage === 'closed_lost' ? 'muted' : 'ink'}>{STAGE_LABEL[e.stage] ?? e.stage}</Word>
          {e.closed_reason && <span className="ml-2 text-ink-2">{e.closed_reason}</span>}</dd>
        <dt className="text-ink-3">Contact</dt>
        <dd className="min-w-0">
          <span className="block font-medium">{e.contact_name}</span>
          {e.contact_phone && <a href={`tel:${e.contact_phone}`} className="block tnum text-accent-text hover:underline">{e.contact_phone}</a>}
          {e.contact_email && <a href={`mailto:${e.contact_email}`} className="block truncate text-accent-text hover:underline">{e.contact_email}</a>}
        </dd>
        {e.source && <><dt className="text-ink-3">Came via</dt><dd>{e.source}</dd></>}
        <dt className="text-ink-3">Received</dt><dd>{dateShort(e.created_at)}</dd>
        {e.trial_starts_at && <><dt className="text-ink-3">Trial</dt>
          <dd>{dateShort(e.trial_starts_at)} at {time(e.trial_starts_at)}</dd></>}
        {open && e.next_action_on && <><dt className="text-ink-3">Follow up by</dt><dd>{dateShort(e.next_action_on)}</dd></>}
      </dl>

      {e.live_trial && open && (
        <p className="text-[13px] text-ink-3">
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
