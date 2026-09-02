'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ListPlus, Check, X, Clock } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Field, Input, Select, Skeleton } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { ageFrom, dateShort, time } from '@/lib/format';

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
  const candidates = useRows<Candidate>(
    ['enrollable', classId], C.ENROLLABLE_STUDENTS, [classId]);
  const [studentId, setStudentId] = React.useState('');
  const [q, setQ] = React.useState('');
  const [note, setNote] = React.useState('');
  const [mode, setMode] = React.useState<'enrol' | 'wait'>(full ? 'wait' : 'enrol');

  const list = (candidates.data ?? []).filter(c =>
    !q || `${c.first_name} ${c.last_name} ${c.family_name}`.toLowerCase().includes(q.toLowerCase()));

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
        <p className="rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink-2">
          This class is full. Enrolling will be refused — add them to the waiting
          list instead and they are offered the next place automatically.
        </p>
      )}

      <div role="tablist" aria-label="What to do"
           className="inline-flex rounded-[var(--radius-md)] border border-line bg-surface-2 p-0.5">
        {([['enrol', 'Give a place'], ['wait', 'Waiting list']] as const).map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={mode === m
              ? 'min-h-[34px] rounded-[7px] bg-surface px-3 text-[13px] font-medium text-ink shadow-xs'
              : 'min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium text-ink-2 hover:text-ink'}>
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
          {q ? 'Nobody matches that.' : 'Every child on your books is already in this class.'}
        </p>
      )}
      {list.length > 0 && (
        <Field label="Child" htmlFor="enrol-student" required
               hint={chosen ? `${ageFrom(chosen.date_of_birth)} years old · ${chosen.family_name}` : undefined}>
          <Select id="enrol-student" value={studentId} onChange={e => setStudentId(e.target.value)}
                  size={Math.min(6, Math.max(3, list.length))}>
            {list.slice(0, 200).map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} — {c.family_name}
              </option>
            ))}
          </Select>
        </Field>
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
  const [reason, setReason] = React.useState('');
  const [offered, setOffered] = React.useState<string | null | undefined>(undefined);
  const withdraw = usePipeline(C.WITHDRAW, rows => setOffered(rows?.[0]?.offered ?? null));

  if (offered !== undefined) {
    return (
      <RecordSheet title="Place given up" subtitle={name} onClose={onClose}
        onSave={onClose} saveLabel="Done" canSave>
        <p className="text-sm text-ink-2">
          {offered
            ? 'The place has been offered to the person who has waited longest. You will see them as “Offered” on the waiting list.'
            : 'Nobody is waiting for this class, so the place is simply open.'}
        </p>
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title="Withdraw from the class" subtitle={name} onClose={onClose}
      error={withdraw.error} saving={withdraw.isPending} canSave
      saveLabel="Withdraw" onSave={() => withdraw.mutate([enrolmentId, reason])}>
      <p className="text-[13px] text-ink-2">
        Their attendance history stays. The place is offered straight away to
        whoever has waited longest for this class.
      </p>
      <Field label="Reason" htmlFor="wd-reason" hint="Optional. Kept on the record.">
        <Input id="wd-reason" value={reason} onChange={e => setReason(e.target.value)}
               placeholder="Moving away" />
      </Field>
    </RecordSheet>
  );
}

/** The three things you can do to a waiting-list entry. */
export function WaitlistActions({ entry }: {
  entry: { id: string; status?: string; first_name: string; last_name: string };
}) {
  const offer = usePipeline(C.OFFER_PLACE);
  const accept = usePipeline(C.ACCEPT_PLACE);
  const decline = usePipeline(C.DECLINE_PLACE);
  const who = `${entry.first_name} ${entry.last_name}`;
  const err = offer.error ?? accept.error ?? decline.error;

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap gap-1.5">
        {entry.status !== 'offered' && (
          <Button size="sm" loading={offer.isPending} onClick={() => offer.mutate([entry.id, 3])}>
            <Clock className="size-3.5" aria-hidden /> Offer
          </Button>
        )}
        <Button size="sm" variant="primary" loading={accept.isPending}
                onClick={() => accept.mutate([entry.id])}>
          <Check className="size-3.5" aria-hidden /> Took it
        </Button>
        <Button size="sm" variant="danger" loading={decline.isPending}
                aria-label={`${who} declined`} onClick={() => decline.mutate([entry.id, null])}>
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
      {err != null && (
        <p role="alert" className="mt-1 text-[12px] text-critical">
          {/CLASS_FULL/.test(String((err as Error).message))
            ? 'The class is full again — withdraw someone first.'
            : (err as Error).message}
        </p>
      )}
    </div>
  );
}

/* ── Trials ─────────────────────────────────────────────────────────────── */
export function BookTrialSheet({ classId, className, onClose }: {
  classId: string; className: string; onClose: () => void;
}) {
  const sessions = useRows<{ id: string; starts_at: string }>(
    ['sessions-ahead', classId], C.CLASS_SESSIONS_AHEAD, [classId]);
  const candidates = useRows<Candidate>(['enrollable', classId], C.ENROLLABLE_STUDENTS, [classId]);
  const [sessionId, setSessionId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const book = usePipeline(C.BOOK_TRIAL, onClose);

  React.useEffect(() => {
    if (!sessionId && sessions.data?.[0]) setSessionId(sessions.data[0].id);
    if (!studentId && candidates.data?.[0]) setStudentId(candidates.data[0].id);
  }, [sessions.data, candidates.data, sessionId, studentId]);

  return (
    <RecordSheet title="Book a trial" subtitle={className} onClose={onClose}
      error={book.error} saving={book.isPending} canSave={!!sessionId && !!studentId}
      saveLabel="Book them in" onSave={() => book.mutate([sessionId, studentId])}>
      {sessions.isPending && <Skeleton className="h-16" />}
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
      <Field label="Child" htmlFor="trial-student" required>
        <Select id="trial-student" value={studentId} onChange={e => setStudentId(e.target.value)}>
          {candidates.data?.map(c => (
            <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.family_name}</option>
          ))}
        </Select>
      </Field>
    </RecordSheet>
  );
}

const TRIAL_TONE: Record<string, 'neutral' | 'info' | 'accent' | 'caution' | 'positive'> = {
  requested: 'neutral', booked: 'info', attended: 'accent',
  missed: 'caution', converted: 'positive', cancelled: 'neutral',
};

/** What happened after a trial — the step the funnel most often loses. */
export function TrialActions({ trial }: { trial: C.TrialRow }) {
  const outcome = usePipeline(C.TRIAL_OUTCOME);
  const convert = usePipeline(C.CONVERT_TRIAL);
  const err = outcome.error ?? convert.error;
  const settled = trial.status === 'converted' || trial.status === 'cancelled';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={TRIAL_TONE[trial.status] ?? 'neutral'}>{trial.status}</Badge>
        {!settled && (
          <>
            {trial.status !== 'attended' && (
              <Button size="sm" loading={outcome.isPending}
                      onClick={() => outcome.mutate([trial.id, 'attended', null])}>Came</Button>
            )}
            {trial.status !== 'missed' && (
              <Button size="sm" loading={outcome.isPending}
                      onClick={() => outcome.mutate([trial.id, 'missed', null])}>No show</Button>
            )}
            <Button size="sm" variant="primary" loading={convert.isPending}
                    onClick={() => convert.mutate([trial.id, null])}>
              <UserPlus className="size-3.5" aria-hidden /> Joining
            </Button>
          </>
        )}
      </div>
      {err != null && (
        <p role="alert" className="mt-1 text-[12px] text-critical">
          {/NO_CHILD_DETAILS/.test(String((err as Error).message))
            ? 'The enquiry has no child name and date of birth, so there is nothing to build a record from.'
            : /CLASS_FULL/.test(String((err as Error).message))
            ? 'That class is full — free a place first.'
            : (err as Error).message}
        </p>
      )}
    </div>
  );
}
