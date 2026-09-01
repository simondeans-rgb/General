'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, CalendarClock, AlertTriangle } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { cn } from '@/lib/cn';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

type Ref = { id: string; name: string };
type Room = Ref & { location_id: string; location: string; capacity: number };
type Term = Ref & { starts_on: string; ends_on: string };

const EMPTY: C.ClassDraft = {
  name: '', term_id: '', dance_style_id: '', level_id: null, location_id: '',
  room_id: null, teacher_id: null, day_of_week: 1, start_time: '17:00',
  duration_min: 60, capacity: 16, age_min: null, age_max: null,
  price_minor: 5400, trials_enabled: true, waitlist_enabled: true, visibility: 'public',
};

/**
 * Setting up a class.
 *
 * The form writes the class and then lays down the term's sessions, because a
 * class with no sessions is not yet a class — nobody can be marked present at
 * it and it appears nowhere on the schedule. On an edit that moves the day or
 * the time, the untouched future sessions are rebuilt; any session with a
 * register already taken is left exactly where it is.
 */
export function ClassForm({ classId, onClose }: { classId?: string; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const editing = !!classId;

  const styles   = useRows<Ref & { colour: string }>(['styles'], C.STYLES);
  const levels   = useRows<Ref>(['levels'], C.LEVELS);
  const rooms    = useRows<Room>(['rooms'], C.ROOMS);
  const teachers = useRows<{ id: string; display_name: string }>(['teachers'], C.TEACHERS);
  const terms    = useRows<Term>(['open-terms'], C.OPEN_TERMS);
  const existing = useRows<C.ClassDraft & { future_sessions: number }>(
    ['class-edit', classId ?? ''], C.CLASS_FOR_EDIT, [classId], { enabled: editing });

  const [draft, setDraft] = React.useState<C.ClassDraft>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const set = <K extends keyof C.ClassDraft>(k: K, v: C.ClassDraft[K]) =>
    setDraft(d => ({ ...d, [k]: v }));

  // Seed the form once: from the saved class, or from sensible defaults.
  React.useEffect(() => {
    if (loaded) return;
    if (editing) {
      const row = existing.data?.[0];
      if (!row) return;
      setDraft({ ...row, start_time: String(row.start_time).slice(0, 5) });
      setLoaded(true);
    } else if (terms.data?.[0] && styles.data?.[0] && rooms.data?.[0]) {
      setDraft(d => ({ ...d, term_id: terms.data![0]!.id,
        dance_style_id: styles.data![0]!.id, location_id: rooms.data![0]!.location_id }));
      setLoaded(true);
    }
  }, [editing, existing.data, terms.data, styles.data, rooms.data, loaded]);

  // Nothing is editable until the saved values are in the form. Showing the
  // blank defaults first invites someone to type over a class before its own
  // settings have arrived — and then save them.
  const refsReady = !!(styles.data && levels.data && rooms.data && teachers.data && terms.data);
  const ready = refsReady && loaded && (!editing || !!existing.data?.[0]);
  const loadError = styles.error ?? rooms.error ?? terms.error ?? existing.error;

  const roomsHere = (rooms.data ?? []).filter(r => r.location_id === draft.location_id);
  const locations = [...new Map((rooms.data ?? []).map(r =>
    [r.location_id, { id: r.location_id, name: r.location }])).values()];

  // Only a change of day or time needs the sessions rebuilding.
  const original = existing.data?.[0];
  const movesSessions = editing && !!original &&
    (original.day_of_week !== draft.day_of_week
     || String(original.start_time).slice(0, 5) !== draft.start_time
     || original.duration_min !== draft.duration_min);

  const save = useMutation({
    mutationFn: async () => {
      const args = [
        draft.dance_style_id, draft.level_id, draft.location_id, draft.room_id,
        draft.teacher_id, draft.name.trim(), draft.day_of_week, draft.start_time,
        draft.duration_min, draft.capacity, draft.age_min, draft.age_max,
        draft.price_minor, draft.trials_enabled, draft.waitlist_enabled, draft.visibility,
      ];
      return runAs(session, async q => {
        if (editing) {
          const [row] = await q<{ id: string }>(C.UPDATE_CLASS, [classId, ...args]);
          if (!row) throw new Error('That class could not be saved.');
          if (movesSessions) {
            const [r] = await q<{ net: number }>(C.RESCHEDULE_CLASS, [classId]);
            return `Saved. The timetable was rebuilt from the new time${
              (r?.net ?? 0) ? '' : ' — sessions with a register taken were left alone'}.`;
          }
          return 'Saved.';
        }
        const [row] = await q<{ id: string }>(C.CREATE_CLASS, [draft.term_id, ...args]);
        if (!row) throw new Error('You cannot add a class to that term.');
        const [made] = await q<{ made: number }>(C.GENERATE_SESSIONS, [row.id]);
        return `Added, with ${made?.made ?? 0} session${made?.made === 1 ? '' : 's'} in the term.`;
      });
    },
    onSuccess: msg => { setDone(msg); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const valid = draft.name.trim().length >= 2 && draft.term_id && draft.dance_style_id
    && draft.location_id && draft.capacity > 0 && draft.duration_min > 0
    && /^\d{2}:\d{2}$/.test(draft.start_time)
    && (draft.age_min == null || draft.age_max == null || draft.age_max >= draft.age_min);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="class-form-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <Check className="size-5" />
            </span>
            <p id="class-form-t" className="font-medium">{draft.name}</p>
            <p className="mt-1 text-sm text-ink-2">{done}</p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 id="class-form-t" className="text-[17px] font-semibold tracking-tight">
                  {editing ? 'Edit class' : 'New class'}
                </h2>
                <p className="mt-0.5 text-[13px] text-ink-2">
                  {editing ? 'Changes apply from here on.' : 'The term’s sessions are created for you.'}
                </p>
              </div>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose}>
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            {!ready && !loadError && (
              <div className="mt-4 space-y-3" aria-busy="true">
                <p className="text-[13px] text-ink-3">Loading the studio’s styles, rooms and terms…</p>
                {[0,1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            )}
            {loadError && <div className="mt-4"><ErrorState error={loadError} /></div>}

            <div className={cn('mt-4 space-y-3', !ready && 'hidden')}>
              <Field label="Name" htmlFor="cf-name" required>
                <Input id="cf-name" value={draft.name} onChange={e => set('name', e.target.value)}
                       placeholder="Grade 4 Ballet" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Style" htmlFor="cf-style" required>
                  <Select id="cf-style" value={draft.dance_style_id}
                          onChange={e => set('dance_style_id', e.target.value)}>
                    {styles.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
                <Field label="Level" htmlFor="cf-level">
                  <Select id="cf-level" value={draft.level_id ?? ''}
                          onChange={e => set('level_id', e.target.value || null)}>
                    <option value="">No level</option>
                    {levels.data?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </Field>
              </div>

              {!editing && (
                <Field label="Term" htmlFor="cf-term" required
                       hint="Sessions are generated between this term’s dates, skipping its breaks.">
                  <Select id="cf-term" value={draft.term_id} onChange={e => set('term_id', e.target.value)}>
                    {terms.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Studio" htmlFor="cf-loc" required>
                  <Select id="cf-loc" value={draft.location_id}
                          onChange={e => { set('location_id', e.target.value); set('room_id', null); }}>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </Field>
                <Field label="Room" htmlFor="cf-room">
                  <Select id="cf-room" value={draft.room_id ?? ''}
                          onChange={e => set('room_id', e.target.value || null)}>
                    <option value="">Any room</option>
                    {roomsHere.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Teacher" htmlFor="cf-teacher"
                     hint="They will see this class on their own Today screen and can take its register.">
                <Select id="cf-teacher" value={draft.teacher_id ?? ''}
                        onChange={e => set('teacher_id', e.target.value || null)}>
                  <option value="">Not assigned yet</option>
                  {teachers.data?.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                </Select>
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Day" htmlFor="cf-day" required>
                  <Select id="cf-day" value={String(draft.day_of_week)}
                          onChange={e => set('day_of_week', Number(e.target.value))}>
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </Select>
                </Field>
                <Field label="Starts" htmlFor="cf-time" required>
                  <Input id="cf-time" type="time" value={draft.start_time}
                         onChange={e => set('start_time', e.target.value)} />
                </Field>
                <Field label="Minutes" htmlFor="cf-mins" required>
                  <Input id="cf-mins" type="number" inputMode="numeric" min={15} max={240} step={5}
                         value={draft.duration_min}
                         onChange={e => set('duration_min', Number(e.target.value))} />
                </Field>
              </div>

              {movesSessions && (
                <p className="flex gap-2 rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink-2">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden />
                  <span>
                    This moves the class. Future sessions will be rebuilt at the new time.
                    Any session whose register has already been taken stays where it is.
                  </span>
                </p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Field label="Places" htmlFor="cf-cap" required>
                  <Input id="cf-cap" type="number" inputMode="numeric" min={1} max={100}
                         value={draft.capacity} onChange={e => set('capacity', Number(e.target.value))} />
                </Field>
                <Field label="Youngest" htmlFor="cf-agemin">
                  <Input id="cf-agemin" type="number" inputMode="numeric" min={2} max={99}
                         value={draft.age_min ?? ''}
                         onChange={e => set('age_min', e.target.value === '' ? null : Number(e.target.value))} />
                </Field>
                <Field label="Oldest" htmlFor="cf-agemax">
                  <Input id="cf-agemax" type="number" inputMode="numeric" min={2} max={99}
                         value={draft.age_max ?? ''}
                         onChange={e => set('age_max', e.target.value === '' ? null : Number(e.target.value))} />
                </Field>
              </div>

              <Field label="Price per term" htmlFor="cf-price" hint="In pounds.">
                <Input id="cf-price" type="number" inputMode="decimal" min={0} step={0.5}
                       value={(draft.price_minor / 100).toFixed(2)}
                       onChange={e => set('price_minor', Math.round(Number(e.target.value) * 100))} />
              </Field>

              <fieldset className="rounded-[var(--radius-md)] border border-line p-3">
                <legend className="px-1 text-[13px] font-medium text-ink-2">How families find it</legend>
                {([
                  ['trials_enabled', 'Taking trial bookings'],
                  ['waitlist_enabled', 'Keep a waiting list when it is full'],
                ] as const).map(([k, label]) => (
                  <label key={k} className="flex min-h-[36px] items-center gap-2.5 text-sm">
                    <input type="checkbox" checked={draft[k]} className="size-4 accent-[var(--accent)]"
                           onChange={e => set(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
                <div className="mt-2">
                  <Select aria-label="Who can see this class" value={draft.visibility}
                          onChange={e => set('visibility', e.target.value as C.ClassDraft['visibility'])}>
                    <option value="public">Listed publicly</option>
                    <option value="unlisted">Unlisted — only by direct link</option>
                    <option value="private">Private — staff and enrolled families only</option>
                  </Select>
                </div>
              </fieldset>

              {draft.age_min != null && draft.age_max != null && draft.age_max < draft.age_min && (
                <p role="alert" className="flex items-center gap-1.5 text-[12.5px] text-critical">
                  <AlertTriangle className="size-3.5" aria-hidden /> The oldest age cannot be below the youngest.
                </p>
              )}
            </div>

            {save.isError && <div className="mt-3"><ErrorState error={save.error} /></div>}

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" disabled={!ready || !valid}
                      loading={save.isPending} onClick={() => save.mutate()}>
                {editing ? 'Save changes' : 'Create class'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
