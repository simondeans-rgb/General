'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, Check, Phone, CheckCheck, Lock, LockOpen,
         NotebookPen, FolderOpen, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, EmptyState, Input, Skeleton, ErrorState } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { time, ageFrom, dateLong } from '@/lib/format';
import { cn } from '@/lib/cn';

type Status = 'present' | 'absent' | 'late' | 'excused' | 'trial';

const MARKS: { key: Status; label: string; short: string; tone: string }[] = [
  { key: 'present', label: 'Present', short: 'P', tone: 'bg-positive text-white border-positive' },
  { key: 'late',    label: 'Late',    short: 'L', tone: 'bg-caution text-white border-caution' },
  { key: 'absent',  label: 'Absent',  short: 'A', tone: 'bg-critical text-white border-critical' },
  { key: 'excused', label: 'Excused', short: 'E', tone: 'bg-info text-white border-info' },
];

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

  const mark = useMutation({
    mutationFn: async (v: { studentId: string; status: Status }) =>
      runAs(session, q => q(T.MARK_ATTENDANCE, [sessionId, v.studentId, v.status, null])),
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
          await q(T.MARK_ATTENDANCE, [sessionId, r.student_id, r.is_trial ? 'trial' : 'present', null]);
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
  const alerts = list.filter(r => r.requires_alert);
  const closed = !!m?.register_closed_at;
  const complete = list.length > 0 && marked === list.length;

  if (!sessionId) {
    return <Shell title="Register" allow={['owner','admin','teacher']}>
      <Card><EmptyState title="No class chosen" body="Pick a class from Today."
        action={<Link href="/teach"><Button variant="primary">Back to today</Button></Link>} /></Card>
    </Shell>;
  }

  return (
    <Shell
      title={m?.name ?? 'Register'}
      subtitle={m ? `${dateLong(m.starts_at)} · ${time(m.starts_at)}` : undefined}
      allow={['owner','admin','teacher']}
      actions={<Link href="/teach" aria-label="Back to today"
        className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
        <ArrowLeft className="size-4" aria-hidden /></Link>}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Progress, and the one action that finishes a register in a tap. */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{marked} of {list.length} marked</p>
            <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent transition-[width] duration-200"
                   style={{ width: `${list.length ? (marked / list.length) * 100 : 0}%` }} />
            </div>
          </div>
          {!closed && marked < list.length && (
            <Button variant="primary" size="sm" onClick={() => markAllPresent.mutate()}
                    loading={markAllPresent.isPending}>
              <CheckCheck className="size-4" aria-hidden /> All present
            </Button>
          )}
          {!closed && complete && (
            <Button variant="primary" size="sm" onClick={() => closeRegister.mutate()}
                    loading={closeRegister.isPending}>
              <Lock className="size-4" aria-hidden /> Close register
            </Button>
          )}
          {closed && (
            <Button size="sm" onClick={() => reopen.mutate()} loading={reopen.isPending}>
              <LockOpen className="size-4" aria-hidden /> Reopen
            </Button>
          )}
        </div>

        {closed && (
          <p className="flex items-center gap-2 rounded-[var(--radius-md)] border border-positive/30
                        bg-positive-soft px-3 py-2 text-[13px] text-ink-2">
            <Lock className="size-3.5 shrink-0 text-positive" aria-hidden />
            Register closed. Everyone is accounted for — reopen it if something needs changing.
          </p>
        )}
        {closeRegister.isError && <ErrorState error={closeRegister.error} />}

        {alerts.length > 0 && (
          <div role="note" className="rounded-[var(--radius-lg)] border border-caution/30 bg-caution-soft p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-caution">
              <AlertTriangle className="size-4" aria-hidden />
              {alerts.length} child{alerts.length === 1 ? '' : 'ren'} in this class need{alerts.length === 1 ? 's' : ''} attention
            </p>
            <p className="mt-0.5 text-[13px] text-ink-2">Tap a name to see what to do.</p>
          </div>
        )}

        {rows.isLoading && <Card className="divide-y divide-line">
          {[0,1,2,3].map(i => <div key={i} className="p-4"><Skeleton className="h-10" /></div>)}</Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {rows.data?.length === 0 && <Card><EmptyState title="Nobody on this register"
          body="No one is enrolled in this class yet." /></Card>}

        {list.length > 0 && (
          <Card>
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
          </Card>
        )}

        {mark.isError && <ErrorState error={mark.error} />}

        {m && <SessionNotes sessionId={sessionId} saved={m.notes ?? ''} />}
        {m?.class_id && <ClassLinks classId={m.class_id} name={m.name} />}
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
    <Card className="p-4">
      <label htmlFor="session-notes" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
        <NotebookPen className="size-4 text-ink-3" aria-hidden /> Notes on this session
      </label>
      <textarea id="session-notes" rows={3} value={text}
        onChange={e => { setText(e.target.value); setTouched(true); }}
        placeholder="Covered the first sixteen counts. Nadia to chase the missing exam forms."
        className="mt-2 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                   focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
      <div className="mt-2 flex items-center gap-2">
        <p className="flex-1 text-[12.5px] text-ink-3">
          Seen by you and the office. Not shared with families.
        </p>
        {dirty && <Button size="sm" onClick={() => { setText(saved); setTouched(false); }}>Undo</Button>}
        <Button size="sm" variant="primary" disabled={!dirty}
                loading={save.isPending} onClick={() => save.mutate()}>Save note</Button>
      </div>
      {save.isError && <div className="mt-2"><ErrorState error={save.error} /></div>}
    </Card>
  );
}

/** From the register straight to the two things a teacher does next. */
function ClassLinks({ classId, name }: { classId: string; name: string }) {
  return (
    <Card>
      <ul className="divide-y divide-line">
        {[
          { href: `/class/?id=${classId}`, icon: FolderOpen,
            label: 'Videos, music and notes', hint: `Shared with everyone in ${name}` },
          { href: `/class/?id=${classId}#notices`, icon: MessageSquarePlus,
            label: 'Send a notice', hint: 'Homework, kit for next week, a reminder' },
        ].map(l => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2">
              <l.icon className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{l.label}</span>
                <span className="block truncate text-[12.5px] text-ink-2">{l.hint}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RegisterLine({ entry: r, onMark, onReason, disabled, saving }: {
  entry: T.RegisterEntry; onMark: (s: Status) => void;
  onReason: (reason: string) => void; disabled?: boolean; saving?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const name = `${r.preferred_name ?? r.first_name} ${r.last_name}`;

  // A reason only makes sense against an absence. Asking for one on every mark
  // would slow down the ninety percent of a register that is simply "present".
  const wantsReason = r.status === 'absent' || r.status === 'excused';
  const [reason, setReason] = React.useState(r.reason ?? '');
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => { if (!editing) setReason(r.reason ?? ''); }, [r.reason, editing]);

  return (
    <div className={cn('px-3 py-2.5 transition-colors', r.status && 'bg-surface-2/60')}>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius-md)] py-1.5 text-left">
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-medium">{name}</span>
              {r.requires_alert && <AlertTriangle className="size-3.5 shrink-0 text-critical" aria-label="Medical alert" />}
              {r.is_trial && <Badge tone="info">Trial</Badge>}
            </span>
            <span className="block text-[12px] text-ink-3">
              {ageFrom(r.date_of_birth)}
              {r.attendance_pct != null && ` · ${r.attendance_pct}% attendance`}
            </span>
          </span>
        </button>

        {/* Four targets, each at least 44px, labelled with a letter as well as
            a colour so the state is never colour-only. */}
        <div role="group" aria-label={`Mark ${name}`} className="flex shrink-0 gap-1">
          {MARKS.map(mk => {
            const active = r.status === mk.key || (r.status === 'trial' && mk.key === 'present');
            return (
              <button key={mk.key}
                onClick={() => onMark(mk.key)}
                disabled={disabled}
                aria-pressed={active}
                aria-label={`${mk.label} — ${name}`}
                title={mk.label}
                className={cn(
                  'grid size-11 place-items-center rounded-[var(--radius-md)] border text-[13px] font-semibold transition-all',
                  active ? mk.tone : 'border-line-strong bg-surface text-ink-3 hover:bg-surface-2 hover:text-ink',
                  disabled && 'opacity-50 pointer-events-none')}>
                {active ? <Check className="size-4" aria-hidden /> : mk.short}
              </button>
            );
          })}
        </div>
      </div>

      {wantsReason && !disabled && (
        <div className="mb-1 ml-1 mt-2 flex items-center gap-2">
          <label htmlFor={`reason-${r.student_id}`} className="sr-only">Why {name} is away</label>
          <Input id={`reason-${r.student_id}`} value={reason} className="h-9 text-[13px]"
                 placeholder={r.status === 'excused' ? 'Excused because…' : 'Reason, if you know it'}
                 onChange={e => { setReason(e.target.value); setEditing(true); }}
                 onBlur={() => { if (editing && reason !== (r.reason ?? '')) { onReason(reason); setEditing(false); } }} />
          {editing && reason !== (r.reason ?? '') && (
            <Button size="sm" variant="primary" loading={saving}
                    onClick={() => { onReason(reason); setEditing(false); }}>Save</Button>
          )}
        </div>
      )}
      {wantsReason && disabled && r.reason && (
        <p className="mb-1 ml-1 mt-1.5 text-[12.5px] text-ink-2">{r.reason}</p>
      )}

      {open && (
        <div className="mb-1 ml-1 mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px]">
          {r.requires_alert ? (
            <>
              {r.allergies && <p><span className="font-semibold text-critical">Allergies:</span> {r.allergies}</p>}
              {r.action_plan && <p className="mt-1">{r.action_plan}</p>}
            </>
          ) : (
            <p className="text-ink-2">No medical alerts recorded.</p>
          )}
          {r.emergency_contact_phone && (
            <p className="mt-2">
              <a href={`tel:${r.emergency_contact_phone}`}
                 className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
                <Phone className="size-3.5" aria-hidden />
                {r.emergency_contact_name ?? 'Emergency contact'} · {r.emergency_contact_phone}
              </a>
            </p>
          )}
          {/* What a teacher can see is limited by the database, not by this
              screen — the full medical record is not readable by them at all. */}
          <p className="mt-2 text-[12px] text-ink-3">
            Studio staff hold the full medical record. This is the part you need in the room.
          </p>
        </div>
      )}
    </div>
  );
}
