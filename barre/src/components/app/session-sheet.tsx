'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CalendarClock, UserRoundCog, ClipboardCheck } from 'lucide-react';
import { RecordSheet } from './record-sheet';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, Field, Input, Notice, Select, StatusLine } from '@/components/ui';
import * as Q from '@/lib/repos/dashboard';
import { dateLong, time, isoDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type Mode = 'menu' | 'cancel' | 'move' | 'cover';

/**
 * Everything the office does to ONE session (R-004): cancel it, move it,
 * or put another teacher in front of it — and tell the people affected in
 * the same step. The message is pre-written and editable.
 */
export function SessionSheet({ session: s, onClose, initial = 'menu' }: { session: Q.SessionRow; onClose: () => void; initial?: Mode }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [mode, setMode] = React.useState<Mode>(initial);
  const [done, setDone] = React.useState<string | null>(null);
  const families = useRows<{ n: number }>(['session-families', s.id], Q.SESSION_FAMILIES, [s.id]).data?.[0]?.n ?? 0;
  const staff = useRows<{ id: string; display_name: string }>(['staff-options'], Q.STAFF_OPTIONS, [], { enabled: mode === 'cover' });
  const rooms = useRows<{ id: string; name: string }>(['room-options'], Q.ROOM_OPTIONS, [], { enabled: mode === 'move' });
  const when = `${s.name} on ${dateLong(s.starts_at)} at ${time(s.starts_at)}`;

  const [reason, setReason] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [notify, setNotify] = React.useState(true);
  const [date, setDate] = React.useState(isoDate(s.starts_at));
  const [start, setStart] = React.useState(time(s.starts_at));
  const [room, setRoom] = React.useState(s.room_id ?? '');
  const [teacher, setTeacher] = React.useState('');
  const [handover, setHandover] = React.useState('');
  const [override, setOverride] = React.useState(false);
  // Warn before a teacher is double-booked, travel between sites included (UR-27).
  const clashes = useRows<{ session_id: string; class_name: string; starts_at: string; ends_at: string; location: string | null; needs_travel: boolean }>(
    ['cover-clashes', s.id, teacher], Q.COVER_CLASHES, [s.id, teacher], { enabled: mode === 'cover' && !!teacher });
  const clash = clashes.data ?? [];
  React.useEffect(() => { setOverride(false); }, [teacher]);
  const savedHandover = useRows<{ handover_note: string | null }>(['session-handover', s.id], Q.SESSION_HANDOVER, [s.id], { enabled: mode === 'cover' }).data?.[0]?.handover_note;
  React.useEffect(() => { if (savedHandover) setHandover(h => h || savedHandover); }, [savedHandover]);
  const trials = s.trials ?? 0;

  React.useEffect(() => {
    if (mode === 'cancel') setMessage(`Sorry — ${when} is cancelled${reason ? ` (${reason.trim()})` : ''}. We will see you next week.`);
  }, [mode, reason, when]);
  React.useEffect(() => {
    if (mode === 'move') setMessage(`${when} is moving to ${date ? dateLong(date) : '…'} at ${start}${rooms.data?.find(r => r.id === room) ? `, ${rooms.data.find(r => r.id === room)!.name}` : ''}.`);
  }, [mode, date, start, room, rooms.data, when]);
  React.useEffect(() => {
    const who = staff.data?.find(x => x.id === teacher)?.display_name;
    if (mode === 'cover') setMessage(who ? `${who} will be teaching ${when}.` : '');
  }, [mode, teacher, staff.data, when]);

  const run = useMutation({
    mutationFn: async () => runAs(session, q => {
      if (mode === 'cancel') return q(Q.CANCEL_SESSION, [s.id, reason.trim(), message, notify]);
      if (mode === 'move') {
        // The studio's local time on the chosen date. The browser and studio share Europe/London in the demo.
        const local = new Date(`${date}T${start}:00`);
        return q(Q.MOVE_SESSION, [s.id, local.toISOString(), room || null, message, notify]);
      }
      return q(Q.COVER_SESSION, [s.id, teacher || null, message, notify, handover.trim() || null, override]);
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db'] });
      setDone(mode === 'cancel' ? `Cancelled.${notify ? ` ${families} famil${families === 1 ? 'y has' : 'ies have'} been told, and the teacher.` : ''}${trials ? ` ${trials} trial${trials === 1 ? ' needs' : 's need'} a new date — see Enrolment.` : ''}`
        : mode === 'move' ? `Moved.${notify ? ` ${families} famil${families === 1 ? 'y has' : 'ies have'} been told.` : ''}`
        : 'Cover arranged. The teacher has the register, safety notes and handover on their Today screen on the day.');
    },
  });

  if (done) {
    return (
      <RecordSheet title={s.name} onClose={onClose} onSave={onClose} saveLabel="Close">
        <StatusLine title={done} />
      </RecordSheet>
    );
  }

  if (mode === 'menu') {
    const cancelled = s.status === 'cancelled';
    return (
      <RecordSheet title={s.name} subtitle={`${dateLong(s.starts_at)} · ${time(s.starts_at)}–${time(s.ends_at)}${s.room ? ` · ${s.room}` : ''}`}
        onClose={onClose} onSave={onClose} saveLabel="Close">
        {cancelled && <Notice word="Cancelled" tone="critical" title={s.cancel_reason || 'This session will not run'} />}
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 text-[0.875rem]">
          {s.teacher && <><dt className="text-ink-3">Teacher</dt><dd>{s.teacher}{s.covered ? <span className="text-ink-3"> · covering for {s.usual_teacher}</span> : ''}</dd></>}
          <dt className="text-ink-3">Booked</dt>
          <dd className="flex items-center gap-2"><Beats value={s.enrolled} max={s.capacity} label={`${s.enrolled} of ${s.capacity} places`} />
            <span className="tnum">{s.enrolled} of {s.capacity}{s.trials ? ` · ${s.trials} trial${s.trials === 1 ? '' : 's'}` : ''}</span></dd>
        </dl>
        <ul className="divide-y divide-line border-y border-line">
          {[
            ['register', ClipboardCheck, 'Open the register', 'Mark attendance for this session'],
            ['cancel', Ban, 'Cancel this session', 'Just this one — the rest of the term is unchanged'],
            ['move', CalendarClock, 'Move this session', 'Another day, time or room'],
            ['cover', UserRoundCog, s.covered ? 'Change cover' : 'Arrange cover', 'Another teacher for this session only'],
          ].map(([key, Icon, label, hint]) => {
            const I = Icon as React.ElementType;
            const disabled = cancelled ? key !== 'register' : s.register_closed && key !== 'register';
            const inner = (
              <span className={cn('flex min-h-[56px] items-center gap-3 px-1 py-2.5 text-left', disabled && 'opacity-50')}>
                <I className={cn('size-4 shrink-0', key === 'cancel' ? 'text-critical' : 'text-ink-3')} aria-hidden />
                <span className="min-w-0 flex-1"><span className={cn('block text-[0.9375rem] font-semibold', key === 'cancel' && 'text-critical')}>{label as string}</span>
                  <span className="block text-[0.8125rem] text-ink-3">{hint as string}</span></span>
              </span>
            );
            return (
              <li key={key as string}>
                {key === 'register'
                  ? <Link href={`/teach/register/?session=${s.id}`} className="block hover:bg-surface-2">{inner}</Link>
                  : <button disabled={disabled} onClick={() => setMode(key as Mode)} className="block w-full hover:bg-surface-2 disabled:pointer-events-none">{inner}</button>}
              </li>
            );
          })}
        </ul>
        {s.register_closed && !cancelled && <p className="text-[0.7812rem] text-ink-3">This session has been taught, so it can no longer be changed.</p>}
      </RecordSheet>
    );
  }

  const title = mode === 'cancel' ? 'Cancel this session' : mode === 'move' ? 'Move this session' : 'Arrange cover';
  const valid = mode === 'cancel' ? reason.trim().length >= 3 : mode === 'move' ? !!date && /^\d{2}:\d{2}$/.test(start) : true;

  return (
    <RecordSheet title={title} subtitle={when} onClose={onClose} onSave={() => run.mutate()} saving={run.isPending}
      error={run.error} canSave={(valid && message.trim().length > 3 || (mode === 'cover' && !teacher && s.covered))
        && !(mode === 'cover' && teacher && (clashes.isLoading || (clash.length > 0 && !override)))}
      saveLabel={mode === 'cancel' ? (notify ? `Cancel and tell ${families} famil${families === 1 ? 'y' : 'ies'}` : 'Cancel session')
        : mode === 'move' ? (notify ? `Move and tell ${families} famil${families === 1 ? 'y' : 'ies'}` : 'Move session')
        : teacher || !s.covered ? 'Arrange cover' : 'Back to the usual teacher'}>
      {mode === 'cancel' && (
        <Field label="Reason" htmlFor="ss-reason" required hint="Families see this.">
          <Input id="ss-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Teacher unwell" maxLength={120} />
        </Field>
      )}
      {mode === 'move' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="ss-date" required><Input id="ss-date" type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
            <Field label="Starts" htmlFor="ss-time" required><Input id="ss-time" type="time" value={start} onChange={e => setStart(e.target.value)} /></Field>
          </div>
          <Field label="Room" htmlFor="ss-room">
            <Select id="ss-room" value={room} onChange={e => setRoom(e.target.value)}>
              <option value="">Same room</option>
              {rooms.data?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
          <p className="text-[0.7812rem] text-ink-3">The session keeps its length. Only this session moves.</p>
        </>
      )}
      {mode === 'cover' && (
        <Field label="Who will teach it" htmlFor="ss-teacher" hint="They get the register and the safety notes for this session's children.">
          <Select id="ss-teacher" value={teacher} onChange={e => setTeacher(e.target.value)}>
            <option value="">{s.covered ? `Back to ${s.usual_teacher ?? 'the usual teacher'}` : 'Choose a teacher…'}</option>
            {staff.data?.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
          </Select>
        </Field>
      )}
      {mode === 'cover' && teacher && clash.length > 0 && (
        <div className="space-y-2">
          <Notice word="Clash" tone="critical" title={`${staff.data?.find(x => x.id === teacher)?.display_name ?? 'This teacher'} is teaching then`}
            detail={clash.map(c => `${c.class_name} ${time(c.starts_at)}–${time(c.ends_at)}${c.location ? ` at ${c.location}` : ''}${c.needs_travel ? ' (another site: no time to travel)' : ''}`).join(' · ')} />
          <label className="flex min-h-[44px] items-start gap-3 text-[0.875rem]">
            <input type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)} className="mt-0.5 size-[18px] accent-[var(--color-accent)]" />
            <span>Assign anyway<span className="block text-[0.7812rem] text-ink-3">Only if this is planned, for example a shared class.</span></span>
          </label>
        </div>
      )}
      {mode === 'cover' && teacher && (
        <Field label="Handover for the cover teacher" htmlFor="ss-handover" hint="The plan, music, children to watch. Shown on their register.">
          <textarea id="ss-handover" rows={3} value={handover} onChange={e => setHandover(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
        </Field>
      )}
      <label className="flex min-h-[44px] items-start gap-3 text-[0.875rem]">
        <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="mt-0.5 size-[18px] accent-[var(--color-accent)]" />
        <span>{mode === 'cover' ? 'Tell the families too' : `Tell the ${families} famil${families === 1 ? 'y' : 'ies'} and the teacher`}
          <span className="block text-[0.7812rem] text-ink-3">{mode === 'cover' ? 'The covering teacher is always told.' : 'A class notice, plus a notification each.'}</span></span>
      </label>
      {(notify || mode === 'cover') && (
        <Field label="Message" htmlFor="ss-msg">
          <textarea id="ss-msg" rows={3} value={message} onChange={e => setMessage(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
        </Field>
      )}
      <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>← Other options</Button>
    </RecordSheet>
  );
}
