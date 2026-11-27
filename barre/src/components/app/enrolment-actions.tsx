'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ListPlus, Check, X, Clock } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Field, Input, Notice, Select, Skeleton, errorText } from '@/components/ui';
import { Word } from './session-row';
import * as C from '@/lib/repos/classes';
import { ageFrom, dateShort, time, toDateInput } from '@/lib/format';

export function usePipeline(sql: string, onDone?: (rows: any[]) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: unknown[]) => runAs(session, q => q(sql, params)),
    onSuccess: rows => { qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(rows as any[]); },
  });
}

type Candidate = {
  id: string; first_name: string; last_name: string;
  date_of_birth: string; family_name: string;
};

/**
 * Giving a child a place.
 *
 * The class may be full, and the database is the thing that knows: capacity is
 * enforced by a trigger, not by this form. So the form does not try to predict
 * the answer — it offers the waiting list as soon as the class looks full, and
 * if an enrolment is refused anyway the message says exactly why.
 */
export function EnrolSheet({ classId, className, full, onClose }: {
  classId: string; className: string; full: boolean; onClose: () => void;
}) {
  // Only children who can join: not in the class, not already waiting, and
  // by default only those the class's age range suits (UR-19, admins D10).
  const candidates = useRows<C.Candidate>(
    ['class-candidates', classId], C.CLASS_CANDIDATES, [classId]);
  const [studentId, setStudentId] = React.useState('');
  const [q, setQ] = React.useState('');
  const [note, setNote] = React.useState('');
  const [anyAge, setAnyAge] = React.useState(false);
  const [mode, setMode] = React.useState<'enrol' | 'wait'>(full ? 'wait' : 'enrol');

  const outside = (candidates.data ?? []).filter(c => !c.in_range).length;
  const list = (candidates.data ?? []).filter(c => (anyAge || c.in_range) &&
    (!q || `${c.first_name} ${c.last_name} ${c.family_name}`.toLowerCase().includes(q.toLowerCase())));

  React.useEffect(() => {
    if (studentId && !list.some(c => c.id === studentId)) setStudentId('');
  }, [list, studentId]);

  React.useEffect(() => {
    if (!studentId && list[0]) setStudentId(list[0].id);
  }, [list, studentId]);

  const enrol = usePipeline(C.ENROL, onClose);
  const wait = usePipeline(C.JOIN_WAITLIST, onClose);
  const busy = enrol.isPending || wait.isPending;
  const chosen = list.find(c => c.id === studentId);

  return (
    <RecordSheet
      title={mode === 'enrol' ? 'Enrol a child' : 'Add to the waiting list'}
      subtitle={className}
      onClose={onClose} error={enrol.error ?? wait.error} saving={busy}
      canSave={!!studentId}
      saveLabel={mode === 'enrol' ? 'Give them a place' : 'Add to the list'}
      onSave={() => mode === 'enrol'
        ? enrol.mutate([classId, studentId, null, note])
        : wait.mutate([classId, studentId, note])}>

      {full && mode === 'enrol' && (
        <Notice word="Full" tone="caution" title="Enrolling will be refused"
          detail="Add them to the waiting list instead. They are offered the next place automatically." />
      )}

      <div role="tablist" aria-label="What to do"
           className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
        {([['enrol', 'Give a place'], ['wait', 'Waiting list']] as const).map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={mode === m
              ? 'min-h-[40px] rounded-[calc(var(--radius-md)-2px)] border border-line-strong bg-surface px-3 text-[14px] font-semibold text-ink'
              : 'min-h-[40px] rounded-[calc(var(--radius-md)-2px)] px-3 text-[14px] text-ink-2 hover:text-ink'}>
            {label}
          </button>
        ))}
      </div>

      <Field label="Search" htmlFor="enrol-search">
        <Input id="enrol-search" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Name or family" />
      </Field>

      {candidates.isPending && <Skeleton className="h-24" />}
      {!candidates.isPending && list.length === 0 && (
        <p className="text-[13px] text-ink-3">
          {q ? 'Nobody matches that.' : outside && !anyAge
            ? 'Nobody else of the right age. Include other ages below if you mean to.'
            : 'Every child on your books is already in this class or waiting for it.'}
        </p>
      )}
      {list.length > 0 && (
        <Field label="Child" htmlFor="enrol-student" required
               hint={chosen ? `${chosen.age} years old · ${chosen.family_name}${chosen.in_range ? '' : ' · outside this class’s age range'}` : undefined}>
          <Select id="enrol-student" value={studentId} onChange={e => setStudentId(e.target.value)}
                  size={Math.min(6, Math.max(3, list.length))}>
            {list.slice(0, 200).map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}, {c.age} — {c.family_name}{c.in_range ? '' : ' (other age)'}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {outside > 0 && (
        <label className="flex min-h-[44px] items-center gap-3 text-[14px]">
          <input type="checkbox" checked={anyAge} className="size-[18px] accent-[var(--color-accent)]"
                 onChange={e => setAnyAge(e.target.checked)} />
          Include {outside} child{outside === 1 ? '' : 'ren'} outside the age range
        </label>
      )}

      <Field label="Note" htmlFor="enrol-note" hint="Optional. Why, or anything to remember.">
        <Input id="enrol-note" value={note} onChange={e => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

/** Withdrawing says who gets the place, because that is the consequence. */
export function WithdrawSheet({ enrolmentId, name, onClose }: {
  enrolmentId: string; name: string; onClose: () => void;
}) {
  const [mode, setMode] = React.useState<'leave' | 'move'>('leave');
  const [reason, setReason] = React.useState('');
  const [toClass, setToClass] = React.useState('');
  const [offered, setOffered] = React.useState<string | null | undefined>(undefined);
  const [moved, setMoved] = React.useState<string | null>(null);
  const classes = useRows<{ id: string; name: string; enrolled: number; capacity: number }>(
    ['class-options'], C.CLASS_OPTIONS, [], { enabled: mode === 'move' });
  const withdraw = usePipeline(C.WITHDRAW, rows => setOffered(rows?.[0]?.offered ?? null));
  const transfer = usePipeline(C.TRANSFER, () => setMoved(classes.data?.find(c => c.id === toClass)?.name ?? 'the new class'));

  if (moved) {
    return (
      <RecordSheet title={name} onClose={onClose} onSave={onClose} saveLabel="Done" canSave>
        <Notice word="Moved" title={`${name} is now in ${moved}`}
          detail="Their history comes with them. The place they left goes to the waiting list, if anyone is waiting." />
      </RecordSheet>
    );
  }
  if (offered !== undefined) {
    return (
      <RecordSheet title={name} onClose={onClose}
        onSave={onClose} saveLabel="Done" canSave>
        <Notice word="Withdrawn" title="The place is free"
          detail={offered
            ? 'It has been offered to whoever has waited longest. They show as Offered on the waiting list.'
            : 'Nobody is waiting for this class, so the place is open.'} />
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title={mode === 'move' ? 'Move to another class' : 'Withdraw from the class'} subtitle={name} onClose={onClose}
      error={withdraw.error ?? transfer.error} saving={withdraw.isPending || transfer.isPending}
      canSave={mode === 'leave' || !!toClass}
      saveLabel={mode === 'move' ? 'Move' : 'Withdraw'}
      onSave={() => mode === 'move' ? transfer.mutate([enrolmentId, toClass, reason || null]) : withdraw.mutate([enrolmentId, reason])}>
      <div role="radiogroup" aria-label="What is happening" className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
        {([['leave', 'Leaving this class'], ['move', 'Moving to another']] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)}
            className={`min-h-[40px] rounded-[calc(var(--radius-md)-2px)] text-[14px] ${mode === k ? 'border border-line-strong bg-surface font-semibold text-ink' : 'text-ink-2 hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      {mode === 'move' && (
        <Field label="New class" htmlFor="wd-to" required hint="If it is full, nothing changes.">
          <Select id="wd-to" value={toClass} onChange={e => setToClass(e.target.value)}>
            <option value="">Choose a class…</option>
            {classes.data?.map(c => <option key={c.id} value={c.id} disabled={c.enrolled >= c.capacity}>
              {c.name} — {c.enrolled}/{c.capacity}{c.enrolled >= c.capacity ? ' (full)' : ''}</option>)}
          </Select>
        </Field>
      )}
      <p className="text-[13px] text-ink-2">
        Their attendance and feedback history stays with them. The place they leave is offered straight away to
        whoever has waited longest for this class.
      </p>
      <Field label={mode === 'move' ? 'Note' : 'Reason'} htmlFor="wd-reason" hint="Optional. Kept on the record.">
        <Input id="wd-reason" value={reason} onChange={e => setReason(e.target.value)}
               placeholder={mode === 'move' ? 'Moving up a grade' : 'Moving away'} />
      </Field>
    </RecordSheet>
  );
}

/** The three things you can do to a waiting-list entry. Offer and "Took it"
 *  without an offer need a free place: capacity, less active places, less
 *  offers already out (UR-19). The database refuses otherwise; this says why first. */
export function WaitlistActions({ entry, free }: {
  entry: { id: string; status?: string; first_name: string; last_name: string; offer_expires_at?: string | Date | null };
  free?: { free: number; offers: number } | null;
}) {
  const offer = usePipeline(C.OFFER_PLACE);
  const accept = usePipeline(C.ACCEPT_PLACE);
  const decline = usePipeline(C.DECLINE_PLACE);
  const who = `${entry.first_name} ${entry.last_name}`;
  const err = offer.error ?? accept.error ?? decline.error;
  const offered = entry.status === 'offered'
    && (!entry.offer_expires_at || new Date(entry.offer_expires_at) > new Date());
  const noPlace = !!free && free.free <= 0;
  const why = noPlace
    ? (free!.offers > 0 ? `No free place — ${free!.offers} offer${free!.offers === 1 ? '' : 's'} already out` : 'No free place — the class is full')
    : null;

  return (
    <div className="mt-1.5">
      {offered && entry.offer_expires_at && (
        <p className="mb-1.5 text-[12.5px] text-ink-3">Offer open until {dateShort(entry.offer_expires_at)}, then it passes to the next family.</p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {!offered && (
          <Button size="sm" loading={offer.isPending} disabled={noPlace}
                  onClick={() => offer.mutate([entry.id, null])}>
            <Clock className="size-3.5" aria-hidden /> Offer
          </Button>
        )}
        <Button size="sm" loading={accept.isPending} disabled={!offered && noPlace}
                onClick={() => accept.mutate([entry.id])}>
          <Check className="size-3.5" aria-hidden /> Took it
        </Button>
        <Button size="sm" variant="ghost" loading={decline.isPending}
                aria-label={`${who} declined`} onClick={() => decline.mutate([entry.id, null])}>
          <X className="size-3.5" aria-hidden /> Declined
        </Button>
        {!offered && why && <span className="text-[12px] text-ink-3">{why}</span>}
      </div>
      {err != null && (
        <p role="alert" className="mt-1 text-[12px] text-critical">
          {/CLASS_FULL/.test(String((err as Error).message))
            ? 'The class is full again — withdraw someone first.'
            : errorText(err)}
        </p>
      )}
    </div>
  );
}

/* ── Trials ─────────────────────────────────────────────────────────────── */
/** Splits "Efua Mensah" into a first and last name, for prefilling. */
function splitName(full: string | null | undefined): [string, string] {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [parts[0] ?? '', ''];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]!];
}

/**
 * Booking a trial. From a class, or from an enquiry (UR-18): then the child and
 * contact come from the enquiry, nothing is typed twice, and the enquiry moves
 * to "Trial booked" with the trial linked to it.
 */
export function BookTrialSheet({ classId: fixedClass, className, enquiry, onClose }: {
  classId?: string; className?: string; enquiry?: C.EnquiryRow; onClose: () => void;
}) {
  const classes = useRows<{ id: string; name: string; enrolled: number; capacity: number }>(
    ['class-options'], C.CLASS_OPTIONS, [], { enabled: !fixedClass });
  const [classId, setClassId] = React.useState(fixedClass ?? enquiry?.interest_class_id ?? '');
  React.useEffect(() => {
    if (!classId && classes.data?.[0]) setClassId(classes.data[0].id);
  }, [classes.data, classId]);
  const sessions = useRows<{ id: string; starts_at: string }>(
    ['sessions-ahead', classId], C.CLASS_SESSIONS_AHEAD, [classId], { enabled: !!classId });
  const candidates = useRows<Candidate>(['enrollable', classId], C.ENROLLABLE_STUDENTS, [classId], { enabled: !!classId });
  const [mode, setMode] = React.useState<'new' | 'existing'>(enquiry?.student_id ? 'existing' : 'new');
  const [sessionId, setSessionId] = React.useState('');
  const [studentId, setStudentId] = React.useState(enquiry?.student_id ?? '');
  const [first, last] = splitName(enquiry?.child_name);
  const [child, setChild] = React.useState({ first_name: first, last_name: last || splitName(enquiry?.contact_name)[1],
    date_of_birth: toDateInput(enquiry?.child_dob), contact_name: enquiry?.contact_name ?? '',
    contact_email: enquiry?.contact_email ?? '', contact_phone: enquiry?.contact_phone ?? '',
    emergency_name: '', emergency_phone: '' });
  const set = (k: keyof typeof child) => (e: React.ChangeEvent<HTMLInputElement>) => setChild(c => ({ ...c, [k]: e.target.value }));
  const [booked, setBooked] = React.useState(false);
  const book = usePipeline(C.BOOK_TRIAL, () => enquiry ? setBooked(true) : onClose());

  React.useEffect(() => { setSessionId(''); }, [classId]);
  React.useEffect(() => {
    if (!sessionId && sessions.data?.[0]) setSessionId(sessions.data[0].id);
    if (!studentId && candidates.data?.[0]) setStudentId(candidates.data[0].id);
  }, [sessions.data, candidates.data, sessionId, studentId]);

  const newValid = child.first_name.trim() && child.date_of_birth && child.contact_name.trim()
    && (child.contact_phone.trim().length >= 6 || child.emergency_phone.trim().length >= 6);
  const link = enquiry ? { enquiry_id: enquiry.id } : {};
  const title = className ?? classes.data?.find(c => c.id === classId)?.name;
  const chosen = sessions.data?.find(s => s.id === sessionId);

  if (booked) {
    return (
      <RecordSheet title="Book a trial" onClose={onClose} onSave={onClose} saveLabel="Done">
        <Notice word="Booked" tone="positive" title={`${child.first_name || enquiry?.child_name || 'They'} ${chosen ? `on ${dateShort(chosen.starts_at)} at ${time(chosen.starts_at)}` : ''}`}
          detail="The enquiry has moved to Trial booked. Record how it went after the class, from Trials." />
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title="Book a trial" subtitle={enquiry ? `For ${enquiry.child_name ?? enquiry.contact_name} · from their enquiry` : title}
      onClose={onClose} error={book.error} saving={book.isPending}
      canSave={!!sessionId && (mode === 'existing' ? !!studentId : !!newValid)}
      saveHint={!sessionId ? 'Choose a session.' : mode === 'new' && !newValid
        ? 'Add the child’s first name, date of birth, a parent or carer and a phone number.' : null}
      saveLabel="Book them in"
      onSave={() => book.mutate(mode === 'existing'
        ? [sessionId, studentId, JSON.stringify(link)]
        : [sessionId, null, JSON.stringify({ ...child, ...link })])}>
      {!fixedClass && (
        <Field label="Class" htmlFor="trial-class" required>
          <Select id="trial-class" value={classId} onChange={e => setClassId(e.target.value)}>
            {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name} — {c.enrolled}/{c.capacity}</option>)}
          </Select>
        </Field>
      )}
      {sessions.isPending && !!classId && <Skeleton className="h-16" />}
      {!sessions.isPending && sessions.data?.length === 0 && (
        <p className="text-[13px] text-ink-3">
          This class has no scheduled sessions ahead, so there is nothing to try.
        </p>
      )}
      {(sessions.data?.length ?? 0) > 0 && (
        <Field label="Which session" htmlFor="trial-session" required>
          <Select id="trial-session" value={sessionId} onChange={e => setSessionId(e.target.value)}>
            {sessions.data!.map(s => (
              <option key={s.id} value={s.id}>{dateShort(s.starts_at)} at {time(s.starts_at)}</option>
            ))}
          </Select>
        </Field>
      )}
      <div role="radiogroup" aria-label="Which child" className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
        {([['new', 'A new child'], ['existing', 'Already at the school']] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={mode === k} onClick={() => setMode(k)}
            className={`min-h-[40px] rounded-[calc(var(--radius-md)-2px)] text-[14px] ${mode === k ? 'border border-line-strong bg-surface font-semibold text-ink' : 'text-ink-2 hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      {mode === 'existing' ? (
        <Field label="Child" htmlFor="trial-student" required hint="They need an emergency contact on record.">
          <Select id="trial-student" value={studentId} onChange={e => setStudentId(e.target.value)}>
            {candidates.data?.map(c => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.family_name}</option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          {enquiry && <p className="text-[13px] text-ink-3">Filled in from the enquiry. Check the details, then book.</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Child’s first name" htmlFor="tn-f" required><Input id="tn-f" value={child.first_name} onChange={set('first_name')} /></Field>
            <Field label="Last name" htmlFor="tn-l"><Input id="tn-l" value={child.last_name} onChange={set('last_name')} /></Field>
          </div>
          <Field label="Date of birth" htmlFor="tn-d" required
                 hint={enquiry && !enquiry.child_dob ? 'The enquiry did not include it. Ask, then add it here.' : undefined}>
            <Input id="tn-d" type="date" value={child.date_of_birth} onChange={set('date_of_birth')} />
          </Field>
          <Field label="Parent or carer" htmlFor="tn-c" required><Input id="tn-c" value={child.contact_name} onChange={set('contact_name')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" htmlFor="tn-p" required><Input id="tn-p" type="tel" value={child.contact_phone} onChange={set('contact_phone')} /></Field>
            <Field label="Email" htmlFor="tn-e"><Input id="tn-e" type="email" value={child.contact_email} onChange={set('contact_email')} /></Field>
          </div>
          <p className="text-[13px] text-ink-3">
            The phone number is used as the emergency contact unless you add a different one below. The child appears on the
            teacher’s register, with this contact, from the moment they are booked.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency contact (if different)" htmlFor="tn-en"><Input id="tn-en" value={child.emergency_name} onChange={set('emergency_name')} /></Field>
            <Field label="Their phone" htmlFor="tn-ep"><Input id="tn-ep" type="tel" value={child.emergency_phone} onChange={set('emergency_phone')} /></Field>
          </div>
        </>
      )}
    </RecordSheet>
  );
}

const TRIAL_TONE: Record<string, 'ink' | 'muted' | 'caution' | 'positive'> = {
  requested: 'muted', booked: 'ink', attended: 'ink',
  missed: 'caution', converted: 'positive', cancelled: 'muted',
};
const TRIAL_WORD: Record<string, string> = {
  requested: 'Requested', booked: 'Booked', attended: 'Came', missed: 'No show', converted: 'Joined', cancelled: 'Cancelled',
};

/** What happened after a trial — the step the funnel most often loses. */
export function TrialActions({ trial }: { trial: C.TrialRow }) {
  const outcome = usePipeline(C.TRIAL_OUTCOME);
  const convert = usePipeline(C.CONVERT_TRIAL);
  const err = outcome.error ?? convert.error;
  const settled = trial.status === 'converted' || trial.status === 'cancelled';
  // An outcome describes a class that has happened (UR-54, admins D9).
  const ahead = !!trial.starts_at && new Date(trial.starts_at) > new Date()
    && (trial.status === 'booked' || trial.status === 'requested');

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Word tone={TRIAL_TONE[trial.status] ?? 'muted'} className="mr-1 inline-block w-[4.75rem]">{TRIAL_WORD[trial.status] ?? trial.status}</Word>
        {!settled && ahead && (
          <>
            <span className="text-[12.5px] text-ink-3">Came or joining: after the class</span>
            <Button size="sm" variant="ghost" loading={outcome.isPending}
                    onClick={() => outcome.mutate([trial.id, 'cancelled', null])}>Cancel trial</Button>
          </>
        )}
        {!settled && !ahead && (
          <>
            {trial.status !== 'attended' && (
              <Button size="sm" loading={outcome.isPending}
                      onClick={() => outcome.mutate([trial.id, 'attended', null])}>Came</Button>
            )}
            {trial.status !== 'missed' && (
              <Button size="sm" loading={outcome.isPending}
                      onClick={() => outcome.mutate([trial.id, 'missed', null])}>No show</Button>
            )}
            <Button size="sm" loading={convert.isPending}
                    onClick={() => convert.mutate([trial.id, null])}>
              <UserPlus className="size-3.5" aria-hidden /> Joining
            </Button>
          </>
        )}
      </div>
      {err != null && (
        <p role="alert" className="mt-1 text-[12px] text-critical">
          {/TOO_EARLY/.test(String((err as Error).message))
            ? errorText(err)
            : /NO_CHILD_DETAILS/.test(String((err as Error).message))
            ? 'The enquiry has no child name and date of birth, so there is nothing to build a record from.'
            : /CLASS_FULL/.test(String((err as Error).message))
            ? 'That class is full — free a place first.'
            : (err as Error).message}
        </p>
      )}
    </div>
  );
}
