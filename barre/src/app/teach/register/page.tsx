'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MedicalBrief, medicalLine } from '@/components/app/medical-brief';
import { LastFeedback } from '@/components/app/last-feedback';
import { AttendanceQueue, localQueueStorage, isOfflineError } from '@/lib/offline/attendance-queue';
import { ArrowLeft, Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, EmptyState, Input, Notice, Skeleton, ErrorState } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { time, ageFrom, dateLong } from '@/lib/format';
import { cn } from '@/lib/cn';

type Status = 'present' | 'absent' | 'late' | 'excused' | 'trial';

const isHere = (s: string | null) => s === 'present' || s === 'late' || s === 'trial';
const isAway = (s: string | null) => s === 'absent' || s === 'excused';
const firstName = (r: T.RegisterEntry) => r.preferred_name ?? r.first_name;

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Register /></Suspense>;
}

function Register() {
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { session } = useSession();
  const qc = useQueryClient();

  const rows = useRows<T.RegisterEntry>(['register', sessionId ?? ''], T.REGISTER, [sessionId],
    { enabled: !!sessionId });
  const meta = useRows<T.TeachSession>(['session-meta', sessionId ?? ''],
    `select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
            ds.name as style, ds.colour, r.name as room, l.name as location,
            app.class_enrolled_count(c.id) as enrolled, c.capacity, 0 as trials, 0 as marked,
            cs.register_closed_at, cs.notes
       from class_session cs join class c on c.id = cs.class_id
       left join dance_style ds on ds.id = c.dance_style_id
       left join room r on r.id = c.room_id
       left join location l on l.id = c.location_id
      where cs.id = $1`, [sessionId], { enabled: !!sessionId });

  // Marks that cannot reach the server wait on the device (lib/offline).
  const queue = React.useMemo(() => new AttendanceQueue(localQueueStorage()), []);
  const [waiting, setWaiting] = React.useState(0);
  const sync = React.useCallback(async () => {
    if (!queue.pending.length) return;
    await queue.flush(m => runAs(session, q => q(T.MARK_ATTENDANCE,
      [m.sessionId, m.studentId, m.status, m.reason, m.clientMarkedAt])).then(() => undefined));
    setWaiting(queue.pending.length);
    qc.invalidateQueries({ queryKey: ['db'] });
  }, [queue, session, qc]);
  React.useEffect(() => {
    setWaiting(queue.pending.length);
    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [queue, sync]);

  const mark = useMutation({
    mutationFn: async (v: { studentId: string; status: Status }) => {
      const at = new Date().toISOString();
      try {
        return await runAs(session, q => q(T.MARK_ATTENDANCE, [sessionId, v.studentId, v.status, null, at]));
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        queue.add({ sessionId: sessionId!, studentId: v.studentId, status: v.status, reason: null, clientMarkedAt: at });
        setWaiting(queue.pending.length);
        return [];
      }
    },
    // Optimistic: a register must feel instant, and the write is local anyway.
    onMutate: async v => {
      const key = ['db', session?.userId ?? 'anon', 'register', sessionId ?? ''];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T.RegisterEntry[]>(key);
      qc.setQueryData<T.RegisterEntry[]>(key, old =>
        (old ?? []).map(r => r.student_id === v.studentId ? { ...r, status: v.status } : r));
      return { key, prev };
    },
    onError: (_e, _v, ctx) => { if (ctx) qc.setQueryData(ctx.key, ctx.prev); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const markAllPresent = useMutation({
    mutationFn: async () => {
      const unmarked = (rows.data ?? []).filter(r => !r.status);
      await runAs(session, async q => {
        for (const r of unmarked) {
          await q(T.MARK_ATTENDANCE, [sessionId, r.student_id, r.is_trial ? 'trial' : 'present', null, new Date().toISOString()]);
        }
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const setReason = useMutation({
    mutationFn: async (v: { studentId: string; reason: string }) =>
      runAs(session, q => q(T.SET_REASON, [sessionId, v.studentId, v.reason])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const closeRegister = useMutation({
    mutationFn: async () => runAs(session, q => q(T.CLOSE_REGISTER, [sessionId])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const reopen = useMutation({
    mutationFn: async () => runAs(session, q => q(T.REOPEN_REGISTER, [sessionId])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const m = meta.data?.[0] as (T.TeachSession & { notes: string | null }) | undefined;
  const list = rows.data ?? [];
  const marked = list.filter(r => r.status).length;
  const here = list.filter(r => r.status === 'present' || r.status === 'trial').length;
  const late = list.filter(r => r.status === 'late').length;
  const absent = list.filter(r => r.status === 'absent').length;
  const excused = list.filter(r => r.status === 'excused').length;
  const unmarked = list.filter(r => !r.status);
  const flagged = list.filter(r => r.requires_alert || r.has_medical_need);
  const closed = !!m?.register_closed_at;
  const complete = list.length > 0 && marked === list.length;

  if (!sessionId) {
    return <Shell title="Register" allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-2xl"><EmptyState title="No class chosen" body="Pick a class from Today."
        action={<Link href="/teach"><Button variant="primary">Back to Today</Button></Link>} /></div>
    </Shell>;
  }

  const counts = [
    `${here} here`, late && `${late} late`, `${absent} absent`, excused && `${excused} excused`,
  ].filter(Boolean).join(' · ');

  return (
    <Shell
      title={m?.name ?? 'Register'}
      subtitle={m ? [`${dateLong(m.starts_at)} · ${time(m.starts_at)}`, m.location, m.room].filter(Boolean).join(' · ') : undefined}
      allow={['owner','admin','teacher']}
      actionsInline
      actions={<Link href="/teach" aria-label="Back to Today"
        className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
        <ArrowLeft className="size-5" aria-hidden /></Link>}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Progress in words and beats, and the one action that moves the register on. */}
        {list.length > 0 && <section aria-label="Progress" className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b-2 border-ink pb-3">
            <p role="status" className="tnum text-[16px] font-semibold">
              {counts}
              {!closed && <span className="font-normal text-ink-3"> · {unmarked.length} to mark</span>}
            </p>
            <Beats value={marked} max={list.length || 1} size="lg" tone={complete ? 'positive' : 'accent'} label={`${marked} of ${list.length} marked`} />
          </div>

          {waiting > 0 && (
            <Notice word="Offline" tone="caution"
              title={`${waiting} mark${waiting === 1 ? '' : 's'} waiting for a connection`}
              detail="They send on their own when you are back online. Keep marking." />
          )}

          {closed ? (
            <>
              <Notice word="Closed" tone="positive" title="Everyone is accounted for"
                detail="Reopen the register if something needs changing."
                action={<Button onClick={() => reopen.mutate()} loading={reopen.isPending}>Reopen</Button>} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/teach/feedback/?session=${sessionId}`} className="sm:flex-1">
                  <Button variant="primary" size="lg" className="w-full" tabIndex={-1}>Give class feedback</Button>
                </Link>
              </div>
            </>
          ) : null}
          {markAllPresent.isError && <ErrorState error={markAllPresent.error} />}
          {closeRegister.isError && <ErrorState error={closeRegister.error} />}
          {reopen.isError && <ErrorState error={reopen.error} />}
        </section>}

        {closed && <NextClass sessionId={sessionId} />}

        <section aria-labelledby="roll-h">
          <div className="flex items-baseline gap-3 border-b border-line pb-2">
            <h2 id="roll-h" className="section-title flex-1">Register</h2>
            {flagged.length > 0 && (
              <span className={cn('text-[13px] font-semibold', flagged.some(r => r.requires_alert) ? 'text-critical' : 'text-caution')}>
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
                  <RegisterLine entry={r} disabled={closed}
                    onMark={s => mark.mutate({ studentId: r.student_id, status: s })}
                    onReason={reason => setReason.mutate({ studentId: r.student_id, reason })}
                    saving={setReason.isPending} />
                </li>
              ))}
            </ul>
          )}
          {mark.isError && <ErrorState error={mark.error} />}
          {setReason.isError && <ErrorState error={setReason.error} />}
        </section>

        {m && <SessionNotes sessionId={sessionId} saved={m.notes ?? ''} />}
        {m?.class_id && <ClassLinks classId={m.class_id} name={m.name} />}

        {/* The action that moves the register on stays within thumb reach while marking. */}
        {!closed && list.length > 0 && (unmarked.length > 0 || complete) && (
          <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:bottom-4 lg:mx-0 lg:rounded-[var(--radius-lg)] lg:border">
            {unmarked.length > 0 ? (
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-[14px] text-ink-3">
                  <span className="font-semibold text-ink">{unmarked.length} to mark</span>
                  <span className="hidden sm:inline"> · {unmarked.slice(0, 3).map(r => `${firstName(r)}${r.is_trial ? ' (trial)' : ''}`).join(', ')}{unmarked.length > 3 ? ` and ${unmarked.length - 3} more` : ''}</span>
                </p>
                <Button variant="primary" size="lg" onClick={() => markAllPresent.mutate()} loading={markAllPresent.isPending}>Mark the rest here</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-[14px] text-ink-3"><span className="font-semibold text-ink">Everyone is marked.</span> <span className="hidden sm:inline">Closing tells the office.</span></p>
                <Button variant="primary" size="lg" onClick={() => closeRegister.mutate()} loading={closeRegister.isPending}>Close register</Button>
              </div>
            )}
          </div>
        )}
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
        <span className="text-[13px] text-ink-3">You and the office only</span>
      </div>
      <textarea id="session-notes" rows={3} value={text}
        onChange={e => { setText(e.target.value); setTouched(true); }}
        placeholder="Covered the first sixteen counts. Chase the missing exam forms."
        className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[15px]
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
                <span className="block truncate text-[13px] text-ink-3">{l.hint}</span>
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
function RegisterLine({ entry: r, onMark, onReason, disabled, saving }: {
  entry: T.RegisterEntry; onMark: (s: Status) => void;
  onReason: (reason: string) => void; disabled?: boolean; saving?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const name = `${firstName(r)} ${r.last_name}`;
  const med = medicalLine(r);
  const here = isHere(r.status);
  const away = isAway(r.status);

  // A reason only makes sense against an absence. Asking for one on every mark
  // would slow down the ninety percent of a register that is simply "present".
  const [reason, setReason] = React.useState(r.reason ?? '');
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => { if (!editing) setReason(r.reason ?? ''); }, [r.reason, editing]);

  return (
    <div className="py-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label={`${name}${r.is_trial ? ', trial' : ''}${med ? `, ${med}` : ''}. Show details`}
          className="min-h-11 min-w-0 rounded-[var(--radius-md)] py-1 text-left">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[17px] font-semibold leading-tight">{name}</span>
            <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')} aria-hidden />
          </span>
          {med && (
            <span className={cn('mt-0.5 block text-[14px] font-semibold leading-snug',
              r.requires_alert ? 'text-critical' : 'text-caution')}>{med}</span>
          )}
          <span className="mt-0.5 block text-[13px] text-ink-3">
            {r.is_trial && <span className="mr-1.5 rounded-[var(--radius-sm)] bg-peach-soft px-1.5 py-px font-semibold text-ink">Trial</span>}
            {[ageFrom(r.date_of_birth) != null && `Age ${ageFrom(r.date_of_birth)}`,
              r.attendance_pct != null && `${r.attendance_pct}% attendance`].filter(Boolean).join(' · ')}
          </span>
        </button>

        {/* Two targets, each 48px tall; the state is a word and a tick, not colour alone. */}
        <div role="group" aria-label={`Mark ${name}`}
             className={cn('grid h-12 w-[9.5rem] grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border-[1.5px] sm:w-44',
               here ? 'border-positive' : away ? 'border-critical' : 'border-line-strong',
               disabled && 'cursor-default')}>
          <button onClick={() => { if (!here) onMark('present'); }} disabled={disabled} aria-pressed={here}
            aria-label={`${r.status === 'late' ? 'Late' : 'Here'} — ${name}`}
            className={cn('flex items-center justify-center gap-1 text-[15px] font-semibold transition-colors',
              here ? 'bg-positive-soft text-positive' : 'text-ink-2 hover:bg-surface-2')}>
            {here && <Check className="size-4" strokeWidth={2.5} aria-hidden />}{r.status === 'late' ? 'Late' : 'Here'}
          </button>
          <button onClick={() => { if (!away) onMark('absent'); }} disabled={disabled} aria-pressed={away}
            aria-label={`${r.status === 'excused' ? 'Excused' : 'Absent'} — ${name}`}
            className={cn('flex items-center justify-center gap-1 border-l-[1.5px] text-[15px] font-semibold transition-colors',
              here ? 'border-positive' : away ? 'border-critical' : 'border-line-strong',
              away ? 'bg-critical-soft text-critical' : 'text-ink-2 hover:bg-surface-2')}>
            {away && <X className="size-4" strokeWidth={2.5} aria-hidden />}{r.status === 'excused' ? 'Excused' : 'Absent'}
          </button>
        </div>
      </div>

      {away && !disabled && (
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`reason-${r.student_id}`} className="sr-only">Why {name} is away</label>
          <Input id={`reason-${r.student_id}`} value={reason}
                 placeholder={r.status === 'excused' ? 'Excused because…' : 'Reason, if you know it'}
                 onChange={e => { setReason(e.target.value); setEditing(true); }}
                 onBlur={() => { if (editing && reason !== (r.reason ?? '')) { onReason(reason); setEditing(false); } }} />
          {editing && reason !== (r.reason ?? '') && (
            <Button loading={saving} onClick={() => { onReason(reason); setEditing(false); }}>Save</Button>
          )}
        </div>
      )}
      {away && disabled && r.reason && (
        <p className="mt-1 text-[13.5px] text-ink-2">{r.reason}</p>
      )}

      {open && (
        <div className="mb-2 mt-3 space-y-4">
          {!disabled && (
            <div role="group" aria-label={`Other marks for ${name}`} className="flex flex-wrap gap-2">
              {([
                r.status !== 'late' && ['late', 'Late'],
                r.status !== 'excused' && ['excused', 'Excused absence'],
                r.status === 'late' && ['present', 'Here, on time'],
                r.status === 'excused' && ['absent', 'Absent, not excused'],
              ].filter(Boolean) as [Status, string][]).map(([k, label]) => (
                <Button key={k} onClick={() => onMark(k)} aria-label={`${label} — ${name}`}>{label}</Button>
              ))}
            </div>
          )}
          <MedicalBrief brief={r} />
          <LastFeedback studentId={r.student_id} name={firstName(r)} />
          {/* What a teacher can see is set by the database (student_safety_brief),
              not by this screen. The family doctor stays with the office. */}
          <p className="text-[13px] text-ink-3">GP details and the full record stay with the office.</p>
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
      <span className="font-display text-[19px] tnum">{time(n.starts_at)}</span>
      <span className="min-w-0"><span className="block text-[13px] text-ink-3">Next class</span>
        <span className="block truncate font-semibold">{n.name}</span></span>
      <span className="flex items-center gap-1 text-[13.5px] font-semibold text-accent-text">Register<ChevronRight className="size-4" aria-hidden /></span>
    </Link>
  );
}
