'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MedicalBrief, medicalLine } from '@/components/app/medical-brief';
import { LastFeedback } from '@/components/app/last-feedback';
import { TrialFeedbackBox } from '@/components/app/trial-feedback';
import { mergeView, restTargets } from '@/lib/offline/attendance-queue';
import { clearRejected, flushRegisterQueue, useOnline, useRegisterQueue, useSyncState } from '@/lib/offline/register-sync';
import { ArrowLeft, Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, EmptyState, Input, Notice, Skeleton, ErrorState, StatusLine } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { time, ageFrom, dateLong, dateShort, dayName, dayDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type Status = 'present' | 'absent' | 'late' | 'excused' | 'trial';
type Line = T.RegisterEntry & { waiting: boolean };

const isHere = (s: string | null) => s === 'present' || s === 'late' || s === 'trial';
const isAway = (s: string | null) => s === 'absent' || s === 'excused';
const firstName = (r: T.RegisterEntry) => r.preferred_name ?? r.first_name;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Large text (200%): the root font size is what the person chose, so read it
 * rather than a media query (which ignores it). The register then uses a
 * compact row, so at least one child is on the first screen (round 2, U1).
 */
function useLargeText(): boolean {
  const [big, setBig] = React.useState(false);
  React.useEffect(() => {
    const check = () => setBig(parseFloat(getComputedStyle(document.documentElement).fontSize) >= 24);
    check();
    window.addEventListener('resize', check);
    const t = setInterval(check, 2000);
    return () => { window.removeEventListener('resize', check); clearInterval(t); };
  }, []);
  return big;
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Register /></Suspense>;
}

function Register() {
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { session } = useSession();
  const qc = useQueryClient();
  const office = session?.role === 'owner' || session?.role === 'admin';

  const rows = useRows<T.RegisterEntry>(['register', sessionId ?? ''], T.REGISTER, [sessionId],
    { enabled: !!sessionId });
  const meta = useRows<T.TeachSession & { notes: string | null; handover_note: string | null }>(['session-meta', sessionId ?? ''],
    `select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
            ds.name as style, ds.colour, r.name as room, l.name as location,
            app.class_enrolled_count(c.id) as enrolled, c.capacity, 0 as trials, 0 as marked,
            cs.register_closed_at, cs.notes, cs.handover_note
       from class_session cs join class c on c.id = cs.class_id
       left join dance_style ds on ds.id = c.dance_style_id
       left join room r on r.id = c.room_id
       left join location l on l.id = c.location_id
      where cs.id = $1`, [sessionId], { enabled: !!sessionId });
  const big = useLargeText();
  // Last week's "to work on" for everyone on the roll, in one read (round 2 panel).
  const rollIds = (rows.data ?? []).map(r => r.student_id);
  const workingOn = useRows<T.WorkingOn>(['register-working-on', sessionId ?? '', rollIds.join(',')], T.REGISTER_WORKING_ON,
    [sessionId, rollIds], { enabled: !!sessionId && rollIds.length > 0 });
  const workBy = new Map((workingOn.data ?? []).map(w => [w.student_id, w]));
  const access = useRows<{ access: 'ok' | 'missing' | 'not_yours' | 'cover_later' }>(['session-access', sessionId ?? ''],
    T.SESSION_ACCESS, [sessionId], { enabled: !!sessionId });
  const windowRow = useRows<T.RegisterWindow>(['register-window', sessionId ?? ''], T.REGISTER_WINDOW, [sessionId],
    { enabled: !!sessionId, refetchInterval: 60_000 });

  // Every register write is kept on this phone the moment it is made, and
  // sent when the connection allows (lib/offline, UR-04).
  const queue = useRegisterQueue();
  const online = useOnline();
  const sync = useSyncState();
  const queued = sessionId ? queue.forSession(sessionId) : [];
  const closingHere = sessionId ? queue.closing(sessionId) : false;
  const send = React.useCallback(() => {
    if (navigator.onLine) flushRegisterQueue(session, () => qc.invalidateQueries({ queryKey: ['db'] })).catch(() => undefined);
  }, [session, qc]);
  const now = () => new Date().toISOString();

  // "All marks sent" for a few seconds after a send empties the queue.
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  const justSent = sync.sentAt != null && Date.now() - sync.sentAt < 6000 && queue.size === 0;
  React.useEffect(() => { if (!justSent) return; const t = setTimeout(tick, 6100); return () => clearTimeout(t); }, [justSent]);

  // The office amends a register after its window, saying why (UR-37).
  const [amendReason, setAmendReason] = React.useState('');
  const [amending, setAmending] = React.useState<'no' | 'asking' | 'yes'>('no');
  const stopAmending = () => { setAmending('no'); setAmendReason(''); };
  const amend = useMutation({
    mutationFn: async (v: { studentId: string; status: Status }) =>
      runAs(session, q => q(T.AMEND_ATTENDANCE, [sessionId, v.studentId, v.status, amendReason])),
    onSettled: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const reopen = useMutation({
    mutationFn: async () => runAs(session, q => q(T.REOPEN_REGISTER, [sessionId])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const m = meta.data?.[0];
  const win = windowRow.data?.[0];
  const state = win?.state ?? 'open';
  const amendMode = state === 'late' && office && amending === 'yes';
  const locked = state !== 'open' && !amendMode;

  // Marks just sent count as marks until the register has been re-read.
  const recent = sessionId ? queue.recent(sessionId) : [];
  const server = (rows.data ?? []).map(r => {
    const m = !r.status ? recent.find(x => x.studentId === r.student_id) : undefined;
    return m ? { ...r, status: m.status, mark_kind: m.kind ?? 'explicit' } : r;
  });
  const list: Line[] = mergeView(server, queued, sessionId ? queue.reasonsFor(sessionId) : []);
  const marked = list.filter(r => r.status).length;
  const here = list.filter(r => r.status === 'present' || r.status === 'trial').length;
  const late = list.filter(r => r.status === 'late').length;
  const absent = list.filter(r => r.status === 'absent').length;
  const excused = list.filter(r => r.status === 'excused').length;
  const unmarked = list.filter(r => !r.status);
  const flagged = list.filter(r => r.requires_alert || r.has_medical_need);
  const closed = !!m?.register_closed_at || closingHere;
  const complete = list.length > 0 && marked === list.length;
  const rejected = sync.rejected.filter(r => r.sessionId === sessionId);

  const onMark = (studentId: string, status: Status) => {
    if (amendMode) { amend.mutate({ studentId, status }); return; }
    queue.add({ sessionId: sessionId!, studentId, status, reason: null, clientMarkedAt: now(), kind: 'explicit', userId: session?.userId });
    send();
  };
  const markRest = () => {
    // Decided now, from what the server has and what is waiting here: only
    // children with no mark at all. A queued Absent is never overwritten.
    queue.markRest(sessionId!, restTargets(server, queued), now(), session?.userId);
    send();
  };
  const onReason = (studentId: string, reason: string) => {
    queue.setReason({ sessionId: sessionId!, studentId, reason, at: now(), userId: session?.userId });
    send();
  };
  const close = () => { queue.close({ sessionId: sessionId!, at: now(), userId: session?.userId }); send(); };

  if (!sessionId) {
    return <Shell title="Register" allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-2xl"><EmptyState title="No class chosen" body="Pick a class from Today."
        action={<Link href="/teach"><Button variant="primary">Back to Today</Button></Link>} /></div>
    </Shell>;
  }

  // A link that leads nowhere says why, rather than showing an empty class (UR-54).
  const why = access.data?.[0]?.access;
  if (why && why !== 'ok') {
    const back = <Link href="/teach"><Button variant="primary">Back to Today</Button></Link>;
    return <Shell title="Register" allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-2xl">
        {why === 'missing' && <EmptyState title="This class could not be found"
          body="The link may be out of date, or the class has been removed. Your classes are on Today." action={back} />}
        {why === 'not_yours' && <EmptyState title="This isn’t one of your classes"
          body="A register opens for the class’s own teachers and the office. If you are covering it, the office can add you." action={back} />}
        {why === 'cover_later' && <EmptyState title={`You are covering ${m?.name ?? 'this class'}${m ? ` on ${dateLong(m.starts_at)}` : ''}`}
          body="The register, the children’s safety notes and the handover open on the day of the class." action={back} />}
      </div>
    </Shell>;
  }

  const counts = [
    `${here} here`, late && `${late} late`, `${absent} absent`, excused && `${excused} excused`,
  ].filter(Boolean).join(' · ');

  // The action that moves the register on stays within thumb reach while marking.
  const bar = !closed && !locked && list.length > 0 && (unmarked.length > 0 || complete) && (
          // At large text the bar would cover the names, so it sits after the list instead.
          <div className={cn('z-20 -mx-4 border-t border-line bg-surface/95 px-4 backdrop-blur lg:mx-0 lg:rounded-[var(--radius-lg)] lg:border',
            big ? 'py-2' : 'sticky bottom-[calc(64px+env(safe-area-inset-bottom))] py-3 lg:bottom-4')}>
            {unmarked.length > 0 ? (
              <div className="flex items-center gap-3">
                <p className={cn('min-w-0 flex-1 text-[0.875rem] text-ink-3', big && 'sr-only')}>
                  <span className="font-semibold text-ink">{unmarked.length} to mark</span>
                  <span className="hidden sm:inline"> · {unmarked.slice(0, 3).map(r => `${firstName(r)}${r.is_trial ? ' (trial)' : ''}`).join(', ')}{unmarked.length > 3 ? ` and ${unmarked.length - 3} more` : ''}</span>
                </p>
                {!amendMode && <Button variant="primary" size={big ? 'md' : 'lg'} className={cn(big && 'w-full')} onClick={markRest}>Mark the rest here</Button>}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className={cn('min-w-0 flex-1 text-[0.875rem] text-ink-3', big && 'sr-only')}><span className="font-semibold text-ink">Everyone is marked.</span> <span className="hidden sm:inline">Closing tells the office.</span></p>
                {!amendMode && <Button variant="primary" size={big ? 'md' : 'lg'} className={cn(big && 'w-full')} onClick={close}>Close register</Button>}
              </div>
            )}
          </div>
        );

  return (
    <Shell
      title={m?.name ?? 'Register'}
      // The day and time in full, short enough never to be cut off on a phone; the
      // place goes under the header there, and stays in it on a wide screen (U14).
      subtitle={m ? <>
        <span className="block whitespace-normal">{dayDate(m.starts_at)} · {time(m.starts_at)}–{time(m.ends_at)}</span>
        {(m.location || m.room) && <span className="hidden whitespace-normal lg:block">{[m.location, m.room].filter(Boolean).join(' · ')}</span>}
      </> : undefined}
      allow={['owner','admin','teacher']}
      actionsInline noSchoolSwitch
      actions={<Link href="/teach" aria-label="Back to Today"
        className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
        <ArrowLeft className="size-5" aria-hidden /></Link>}
    >
      <div className={cn('mx-auto max-w-2xl', big ? 'space-y-4' : 'space-y-8')}>
        {m && (m.location || m.room) && !big && (
          <p className="-mt-2 text-[0.9375rem] text-ink-2 lg:hidden">{[m.location, m.room].filter(Boolean).join(' · ')}</p>
        )}
        {/* Where the marks are: on this phone, on their way, or sent. */}
        {!online ? (
          <div role="status" aria-live="polite">
            <Notice word="Offline" tone="caution"
              title={queued.length > 0
                ? `${plural(queued.length, 'mark')} saved on this phone, will send when connected`
                : 'Marks are saved on this phone and send when connected'}
              detail={closingHere ? 'The register will close once the marks have gone.' : 'Keep marking. Nothing is lost if the app closes.'} />
          </div>
        ) : queued.length > 0 ? (
          <div role="status" aria-live="polite"><StatusLine live={false} tone="ink" title={`Sending ${plural(queued.length, 'mark')}…`} /></div>
        ) : justSent ? (
          <div role="status" aria-live="polite"><StatusLine live={false} title="All marks sent" /></div>
        ) : null}
        {rejected.length > 0 && (
          <Notice word="Not saved" tone="critical"
            title={`${plural(rejected.length, 'change')} could not be saved`}
            detail={[...new Set(rejected.map(r => r.error.replace(/^[A-Z_]+:\s*/, '')))].join(' · ')}
            action={<Button size="sm" onClick={clearRejected}>Dismiss</Button>} />
        )}

        {/* Outside its window a register is read-only, and says why (UR-37). */}
        {win && state === 'early' && (
          <Notice word="Closed" tone="ink" title={`This register opens at ${time(win.opens_at)} on ${dateLong(win.opens_at)}`}
            detail={`Registers open ${win.before_min} minutes before the class, so a mark cannot land on the wrong day.`} />
        )}
        {win && state === 'late' && !amendMode && (
          <div className="space-y-3">
            <Notice word="Closed" tone="ink" title="This register can no longer be changed"
              detail={`Registers can be changed for ${plural(win.edit_days, 'day')} after the class.${office ? ' The office can amend it, giving a reason.' : ' Ask the office if something needs correcting.'}`}
              action={office && amending === 'no' ? <Button size="sm" onClick={() => setAmending('asking')}>Amend</Button> : undefined} />
            {office && amending === 'asking' && (
              <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (amendReason.trim().length >= 3) setAmending('yes'); }}>
                <div className="min-w-0 flex-1 basis-60">
                  <label htmlFor="amend-reason" className="mb-1 block text-[0.8125rem] font-semibold">Why is it being amended?</label>
                  <Input id="amend-reason" value={amendReason} onChange={e => setAmendReason(e.target.value)} placeholder="The paper register says Nia was here" />
                </div>
                <Button variant="primary" type="submit" disabled={amendReason.trim().length < 3}>Start amending</Button>
                <Button variant="ghost" type="button" onClick={stopAmending}>Cancel</Button>
              </form>
            )}
          </div>
        )}
        {amendMode && (
          <Notice word="Check" tone="caution" title="Changes are recorded with your reason"
            detail={amendReason} action={<Button size="sm" onClick={stopAmending}>Done</Button>} />
        )}
        {amend.isError && <ErrorState error={amend.error} />}

        {m?.handover_note && (
          <section aria-labelledby="handover-h">
            <div className="border-b-2 border-ink pb-2"><h2 id="handover-h" className="section-title">Handover</h2></div>
            <p className="whitespace-pre-line pt-3 text-[0.9375rem]">{m.handover_note}</p>
          </section>
        )}

        {/* Progress in words and beats, and the one action that moves the register on. */}
        {list.length > 0 && (!big || closed) && <section aria-label="Progress" className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b-2 border-ink pb-3">
            <p role="status" className="tnum text-[1rem] font-semibold">
              {counts}
              {!closed && <span className="font-normal text-ink-3"> · {unmarked.length} to mark</span>}
            </p>
            <Beats value={marked} max={list.length || 1} size="lg" tone={complete ? 'positive' : 'accent'} label={`${marked} of ${list.length} marked`} />
          </div>

          {closed ? (
            <>
              <Notice word="Closed" tone="positive" title="Everyone is accounted for"
                detail={closingHere ? 'Closed on this phone. It reaches the office once the marks have sent.' : 'Reopen the register if something needs changing.'}
                action={!closingHere && !locked ? <Button onClick={() => reopen.mutate()} loading={reopen.isPending}>Reopen</Button> : undefined} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/teach/feedback/?session=${sessionId}`} className="sm:flex-1">
                  <Button variant="primary" size="lg" className="w-full" tabIndex={-1}>Give class feedback</Button>
                </Link>
              </div>
            </>
          ) : null}
          {reopen.isError && <ErrorState error={reopen.error} />}
        </section>}

        {closed && !closingHere && <NextClass sessionId={sessionId} />}

        <section aria-labelledby="roll-h">
          <div className="flex items-baseline gap-3 border-b border-line pb-2">
            <h2 id="roll-h" className="section-title flex-1">Register{big && !closed && list.length > 0 && <span role="status" className="tnum font-normal text-ink-2"> · {marked}/{list.length}</span>}</h2>
            {!big && flagged.length > 0 && (
              <span className={cn('text-[0.8125rem] font-semibold', flagged.some(r => r.requires_alert) ? 'text-critical' : 'text-caution')}>
                {flagged.length} medical note{flagged.length === 1 ? '' : 's'} · tap a name
              </span>
            )}
          </div>
          {rows.isLoading && <div className="space-y-3 pt-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
          {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
          {rows.data?.length === 0 && <EmptyState title="Nobody on this register" body="No one is enrolled in this class yet." />}
          {list.length > 0 && (
            <ul className="divide-y divide-line">
              {list.map(r => (
                <li key={r.student_id}>
                  <RegisterLine entry={r} disabled={(closed && !amendMode) || locked} big={big}
                    workingOn={workBy.get(r.student_id)?.work_on ?? null}
                    trialFeedback={state !== 'early'}
                    onMark={s => onMark(r.student_id, s)}
                    onReason={reason => onReason(r.student_id, reason)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {big && bar}
        {m && <SessionNotes sessionId={sessionId} saved={m.notes ?? ''} />}
        {m?.class_id && <ClassLinks classId={m.class_id} name={m.name} />}

        {!big && bar}
      </div>
    </Shell>
  );
}

/**
 * What happened in the room.
 *
 * Kept apart from attendance on purpose: a register records who was there, and
 * this records how it went — what was covered, who to chase, what to bring
 * next week. The office can read it; families cannot.
 */
function SessionNotes({ sessionId, saved }: { sessionId: string; saved: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [text, setText] = React.useState(saved);
  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => { if (!touched) setText(saved); }, [saved, touched]);

  const save = useMutation({
    mutationFn: async () => runAs(session, q => q(T.SAVE_SESSION_NOTES, [sessionId, text])),
    onSuccess: () => { setTouched(false); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const dirty = touched && text !== saved;

  return (
    <section aria-labelledby="notes-h">
      <div className="mb-3 flex items-baseline gap-3 border-b-2 border-ink pb-2">
        <h2 id="notes-h" className="section-title flex-1"><label htmlFor="session-notes">Notes on this class</label></h2>
        <span className="text-[0.8125rem] text-ink-3">You and the office only</span>
      </div>
      <textarea id="session-notes" rows={3} value={text}
        onChange={e => { setText(e.target.value); setTouched(true); }}
        placeholder="Covered the first sixteen counts. Chase the missing exam forms."
        className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.9375rem]
                   focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      <div className="mt-2 flex items-center justify-end gap-2">
        {dirty && <Button variant="ghost" onClick={() => { setText(saved); setTouched(false); }}>Undo</Button>}
        <Button disabled={!dirty} loading={save.isPending} onClick={() => save.mutate()}>Save note</Button>
      </div>
      {save.isError && <div className="mt-2"><ErrorState error={save.error} /></div>}
    </section>
  );
}

/** From the register straight to the two things a teacher does next. */
function ClassLinks({ classId, name }: { classId: string; name: string }) {
  return (
    <section aria-labelledby="links-h">
      <div className="mb-1 border-b-2 border-ink pb-2"><h2 id="links-h" className="section-title">For {name}</h2></div>
      <ul className="divide-y divide-line">
        {[
          { href: `/class/?id=${classId}`, label: 'Videos, music and notes', hint: 'Shared with everyone in the class' },
          { href: `/class/?id=${classId}#notices`, label: 'Send a notice', hint: 'Homework, kit for next week, a reminder' },
        ].map(l => (
          <li key={l.href}>
            <Link href={l.href} className="flex min-h-14 items-center gap-3 py-3 hover:bg-surface-2/60">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.label}</span>
                <span className="block truncate text-[0.8125rem] text-ink-3">{l.hint}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One child: name and medical line in words on the left, two big targets on
 * the right. Here and Absent are the ninety-percent case; Late and Excused
 * sit one tap further in, under the name, with the medical brief.
 */
function RegisterLine({ entry: r, onMark, onReason, disabled, big, workingOn, trialFeedback }: {
  entry: Line; onMark: (s: Status) => void;
  onReason: (reason: string) => void; disabled?: boolean;
  /** Large text: name above, the two marks full width beneath. */
  big?: boolean;
  /** Last feedback's "to work on", compact on the row. */
  workingOn?: string | null;
  /** The class has started: the teacher can say how a trial went (0071). */
  trialFeedback?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const name = `${firstName(r)} ${r.last_name}`;
  const med = medicalLine(r);
  const here = isHere(r.status);
  const away = isAway(r.status);
  // A mark collapses the row again, so the list stays short mid-register (UR-54).
  const mark = (s: Status) => { onMark(s); setOpen(false); };

  // The family said in advance (UR-07). The teacher's own mark replaces it.
  const preMarked = !r.waiting && r.mark_kind === 'reported' && r.status === 'excused';
  const reporter = r.reported_by === 'student' ? firstName(r) : 'parent';

  // A reason only makes sense against an absence. Asking for one on every mark
  // would slow down the ninety percent of a register that is simply "present".
  const [reason, setReason] = React.useState(r.reason ?? '');
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => { if (!editing) setReason(r.reason ?? ''); }, [r.reason, editing]);

  return (
    <div className={cn(big ? 'py-2' : 'py-2.5',
      r.is_trial && 'border-l-4 border-peach bg-peach-soft/40 pl-3 pr-2')}>
      {r.is_trial && (
        <p className="pb-1 text-[0.75rem] font-semibold uppercase tracking-wide text-ink-2">Trial · first class with us</p>
      )}
      <div className={cn('grid items-center gap-x-3', big ? 'grid-cols-1 gap-y-1.5' : 'grid-cols-[minmax(0,1fr)_auto]')}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label={`${name}${r.is_trial ? ', trial' : ''}${med ? `, ${med}` : ''}${preMarked ? `, reported absent by ${reporter}` : ''}. Show details`}
          className="min-h-11 min-w-0 rounded-[var(--radius-md)] py-1 text-left">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[1.0625rem] font-semibold leading-tight">{name}</span>
            <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')} aria-hidden />
          </span>
          {med && (
            <span className={cn('mt-0.5 block text-[0.875rem] font-semibold leading-snug',
              r.requires_alert ? 'text-critical' : 'text-caution')}>{med}</span>
          )}
          {(r.reported_by || r.reported_note) && (
            <span className="mt-0.5 block text-[0.8438rem] leading-snug text-ink-2">
              <span className="font-semibold">{preMarked ? `Excused · reported by ${reporter}` : `Reported absent by ${reporter}`}</span>
              {r.reported_note && <span> — {r.reported_note}</span>}
            </span>
          )}
          {workingOn && !big && (
            <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3"><span className="font-semibold text-ink-2">Working on:</span> {workingOn}</span>
          )}
          <span className={cn('mt-0.5 block text-[0.8125rem] text-ink-3', big && !r.waiting && 'sr-only')}>
            {[ageFrom(r.date_of_birth) != null && `Age ${ageFrom(r.date_of_birth)}`,
              r.attendance_pct != null && `${r.attendance_pct}% this term`,
              r.waiting && 'Saved on this phone'].filter(Boolean).join(' · ')}
          </span>
        </button>

        {/* Two targets, each 48px tall; the state is a word and a tick, not colour alone. */}
        <div role="group" aria-label={`Mark ${name}`}
             className={cn('grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border-[1.5px]',
               big ? 'min-h-12 w-full' : 'h-12 w-[9.5rem] sm:w-44',
               here ? 'border-positive' : away ? 'border-critical' : 'border-line-strong',
               disabled && 'cursor-default')}>
          <button onClick={() => { if (!here) mark('present'); }} disabled={disabled} aria-pressed={here}
            aria-label={`${r.status === 'late' ? 'Late' : 'Here'} — ${name}`}
            className={cn('flex items-center justify-center gap-1 text-[0.9375rem] font-semibold transition-colors',
              here ? 'bg-positive-soft text-positive' : 'text-ink-2 hover:bg-surface-2')}>
            {here && <Check className="size-4" strokeWidth={2.5} aria-hidden />}{r.status === 'late' ? 'Late' : 'Here'}
          </button>
          <button onClick={() => { if (!away || preMarked) mark(preMarked ? 'excused' : 'absent'); }} disabled={disabled} aria-pressed={away}
            aria-label={`${r.status === 'excused' ? 'Excused' : 'Absent'} — ${name}`}
            className={cn('flex items-center justify-center gap-1 border-l-[1.5px] text-[0.9375rem] font-semibold transition-colors',
              here ? 'border-positive' : away ? 'border-critical' : 'border-line-strong',
              away ? 'bg-critical-soft text-critical' : 'text-ink-2 hover:bg-surface-2')}>
            {away && <X className="size-4" strokeWidth={2.5} aria-hidden />}{r.status === 'excused' ? 'Excused' : 'Absent'}
          </button>
        </div>
      </div>

      {away && !disabled && !preMarked && (
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`reason-${r.student_id}`} className="sr-only">Why {name} is away</label>
          <Input id={`reason-${r.student_id}`} value={reason}
                 placeholder={r.status === 'excused' ? 'Excused because…' : 'Reason, if you know it'}
                 onChange={e => { setReason(e.target.value); setEditing(true); }}
                 onBlur={() => { if (editing && reason !== (r.reason ?? '')) { onReason(reason); setEditing(false); } }} />
          {editing && reason !== (r.reason ?? '') && (
            <Button onClick={() => { onReason(reason); setEditing(false); }}>Save</Button>
          )}
        </div>
      )}
      {away && disabled && r.reason && !preMarked && (
        <p className="mt-1 text-[0.8438rem] text-ink-2">{r.reason}</p>
      )}

      {r.trial_id && !r.waiting && trialFeedback && (
        <TrialFeedbackBox trialId={r.trial_id} name={firstName(r)} recommendation={r.trial_recommendation}
          comments={r.trial_comments} writtenBy={r.trial_written_by} />
      )}

      {open && (
        <div className="mb-2 mt-3 space-y-4">
          {!disabled && (
            <div role="group" aria-label={`Other marks for ${name}`} className="flex flex-wrap gap-2">
              {([
                r.status !== 'late' && ['late', 'Late'],
                (r.status !== 'excused' || preMarked) && ['excused', preMarked ? 'Excused, confirmed' : 'Excused absence'],
                r.status === 'late' && ['present', 'Here, on time'],
                r.status === 'excused' && ['absent', 'Absent, not excused'],
              ].filter(Boolean) as [Status, string][]).map(([k, label]) => (
                <Button key={k + label} onClick={() => mark(k)} aria-label={`${label} — ${name}`}>{label}</Button>
              ))}
            </div>
          )}
          {/* Last feedback straight under the marks: what to look for in class. */}
          <LastFeedback studentId={r.student_id} name={firstName(r)} />
          <MedicalBrief brief={r} />
          {/* What a teacher can see is set by the database (student_safety_brief),
              not by this screen. The family doctor stays with the office. */}
          <p className="text-[0.8125rem] text-ink-3">GP details and the full record stay with the office.</p>
        </div>
      )}
    </div>
  );
}


/** After closing a register, the next class of the day is one tap away. */
function NextClass({ sessionId }: { sessionId: string }) {
  const next = useRows<{ id: string; name: string; starts_at: string }>(['next-session', sessionId], T.NEXT_SESSION, [sessionId]);
  const n = next.data?.[0];
  if (!n) return null;
  return (
    <Link href={`/teach/register/?session=${n.id}`}
      className="grid min-h-14 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-y border-line py-3 hover:bg-surface-2/60">
      <span className="font-display text-[1.1875rem] tnum">{time(n.starts_at)}</span>
      <span className="min-w-0"><span className="block text-[0.8125rem] text-ink-3">Next class</span>
        <span className="block truncate font-semibold">{n.name}</span></span>
      <span className="flex items-center gap-1 text-[0.8438rem] font-semibold text-accent-text">Register<ChevronRight className="size-4" aria-hidden /></span>
    </Link>
  );
}
