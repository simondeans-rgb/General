'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, EmptyState, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as F from '@/lib/repos/family';
import { money, dateLong, time } from '@/lib/format';

const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const PER: Record<string, string> = { term: 'a term', monthly: 'a month', one_off: 'for the course', drop_in: 'a class' };

/**
 * Everything a parent can do about classes for one child (R-014): see what
 * suits their age, ask for a place, book a trial, or join a waiting list.
 */
export function ChildClassesSheet({ child, onClose }: { child: { id: string; first_name: string }; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const opts = useRows<F.ClassOption>(['class-options', child.id], F.CLASS_OPTIONS, [child.id]);
  const [all, setAll] = React.useState(false);
  const [trialFor, setTrialFor] = React.useState<F.ClassOption | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const act = useMutation({
    mutationFn: async (v: { sql: string; params: unknown[]; ok: (r: any) => string }) =>
      v.ok((await runAs(session, q => q(v.sql, v.params)))[0]),
    onSuccess: msg => { setDone(msg); setTrialFor(null); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const list = (opts.data ?? []).filter(o => all || o.age_fits || o.enrolled);
  const hidden = (opts.data ?? []).length - list.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="cc-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="cc-t" className="text-lg font-semibold tracking-tight">Classes for {child.first_name}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {done && (
          <p role="status" className="mb-3 border-l-2 border-positive pl-3 text-[14px]">
            <span className="font-semibold text-positive">Done. </span>{done}
          </p>
        )}
        {act.error != null && <div className="mb-3"><ErrorState error={act.error} /></div>}
        {opts.isLoading && <Skeleton className="h-32" />}
        {opts.error && <ErrorState error={opts.error} />}
        {opts.data && list.length === 0 && <EmptyState title="No classes for this age just now" body="Ask the studio. New classes open each term." />}
        <ul className="divide-y divide-line">
          {list.map(o => (
            <li key={o.class_id} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{o.name}</span>
                <span className="tnum shrink-0 text-[13px] text-ink-2">{money(o.price_minor)} {PER[o.pricing]}</span>
              </div>
              <p className="text-[13px] text-ink-2">
                {DAYS[o.day_of_week]} at {o.start_time.slice(0, 5)}
                {o.age_min != null && ` · ages ${o.age_min}${o.age_max != null ? `–${o.age_max}` : '+'}`}
                {o.trials_enabled && ` · trial ${o.trial_price_minor ? money(o.trial_price_minor) : 'free'}`}
              </p>
              {o.prerequisites && <p className="text-[12.5px] text-ink-3">Before joining: {o.prerequisites}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {o.pricing === 'drop_in' ? <span className="text-[13.5px] font-semibold text-ink-2">Pay as you go. Book a date under Drop-in classes.</span>
                  : o.enrolled ? <span className="text-[13.5px] font-semibold text-positive">{child.first_name} is in this class</span>
                  : o.waiting ? <span className="text-[13.5px] font-semibold text-info">On the waiting list</span>
                  : o.asked ? <span className="text-[13.5px] font-semibold text-caution">Asked. The office will be in touch.</span>
                  // Shown for information only: the school refuses out-of-age requests (UR-54).
                  : !o.age_fits ? <span className="text-[13.5px] font-semibold text-ink-2">
                      Not for {child.first_name}’s age{o.age_min != null || o.age_max != null ? ` (${o.age_min ?? 0}${o.age_max != null ? `–${o.age_max}` : '+'})` : ''}. Ask the office if you think it should be.
                    </span>
                  : (
                    <>
                      {!o.full && (
                        <Button size="sm" loading={act.isPending && (act.variables?.params[1] === o.class_id)}
                          onClick={() => act.mutate({ sql: F.REQUEST_PLACE, params: [child.id, o.class_id, null],
                            ok: () => `Asked for a place in ${o.name}. The office will confirm, and you’ll get a notification.` })}>
                          Ask for a place
                        </Button>
                      )}
                      {o.full && o.waitlist_enabled && (
                        <Button size="sm" onClick={() => act.mutate({ sql: F.JOIN_WAITLIST, params: [o.class_id, child.id],
                          ok: r => `${child.first_name} is number ${r.position} on the waiting list for ${o.name}.` })}>
                          Join the waiting list
                        </Button>
                      )}
                      {o.full && !o.waitlist_enabled && <span className="text-[13.5px] font-semibold text-ink-2">Full</span>}
                      {o.trials_enabled && !o.trial_booked && o.trial_sessions.length > 0 && (
                        <Button size="sm" variant="ghost" onClick={() => setTrialFor(o)}>Book a trial</Button>
                      )}
                      {o.trial_booked && <span className="text-[13.5px] font-semibold text-info">Trial booked</span>}
                    </>
                  )}
              </div>
            </li>
          ))}
        </ul>
        {hidden > 0 && !all && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAll(true)}>
            Show {hidden} more for other ages (to look at only)
          </Button>
        )}
      </div>
      {trialFor && <TrialSheet o={trialFor} name={child.first_name} pending={act.isPending} error={act.error}
        onClose={() => setTrialFor(null)}
        onBook={sid => act.mutate({ sql: F.BOOK_TRIAL, params: [sid, child.id],
          ok: r => r.result === 'booked' ? `Trial booked in ${trialFor.name}. It is in your schedule.`
                                         : `The teacher likes to agree trials first — the office has your request and will confirm.` })} />}
    </div>
  );
}

function TrialSheet({ o, name, onClose, onBook, pending, error }: {
  o: F.ClassOption; name: string; onClose: () => void; onBook: (session: string) => void; pending: boolean; error: unknown;
}) {
  const [sid, setSid] = React.useState(o.trial_sessions[0]?.id ?? '');
  return (
    <RecordSheet title={`Trial in ${o.name}`} subtitle={`For ${name}`} onClose={onClose} saving={pending} error={error}
      saveLabel="Book the trial" canSave={!!sid} onSave={() => onBook(sid)}>
      <Field label="Which class" htmlFor="tr-s">
        <Select id="tr-s" value={sid} onChange={e => setSid(e.target.value)}>
          {o.trial_sessions.map(s => <option key={s.id} value={s.id}>{dateLong(s.starts_at)} at {time(s.starts_at)}</option>)}
        </Select>
      </Field>
      <p className="text-[13px] text-ink-2">{o.trial_price_minor ? `The trial is ${money(o.trial_price_minor)}, added to your next invoice.` : 'The trial is free.'}</p>
    </RecordSheet>
  );
}

/** A parent asks for another child to be added to the account. */
export function AddChildSheet({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [first, setFirst] = React.useState('');
  const [last, setLast] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const send = useMutation({
    mutationFn: () => runAs(session, q => q(F.REQUEST_CHILD, [JSON.stringify({ first_name: first.trim(), last_name: last.trim(), date_of_birth: dob, notes })])),
    onSuccess: () => { setSent(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (sent) return <RecordSheet title="Sent to the studio" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">The office will add {first} to your account and let you know. You can then ask for classes or book a trial.</p>
  </RecordSheet>;
  return (
    <RecordSheet title="Add a child" subtitle="The studio adds them to your account" onClose={onClose}
      saving={send.isPending} error={send.error} saveLabel="Send to the studio"
      canSave={first.trim().length > 0 && !!dob} onSave={() => send.mutate()}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="ac-f" required><Input id="ac-f" value={first} onChange={e => setFirst(e.target.value)} /></Field>
        <Field label="Last name" htmlFor="ac-l"><Input id="ac-l" value={last} onChange={e => setLast(e.target.value)} /></Field>
      </div>
      <Field label="Date of birth" htmlFor="ac-d" required><Input id="ac-d" type="date" value={dob} onChange={e => setDob(e.target.value)} /></Field>
      <Field label="Anything the studio should know" htmlFor="ac-n" hint="Health needs are added to their record by the office.">
        <Input id="ac-n" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Has done two years of ballet before" />
      </Field>
    </RecordSheet>
  );
}
