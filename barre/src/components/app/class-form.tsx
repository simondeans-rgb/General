'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Notice, Select, Skeleton, StatusLine } from '@/components/ui';
import * as C from '@/lib/repos/classes';
import { cn } from '@/lib/cn';
import { SaveErrorSummary, useFirstErrorInView } from '@/components/app/form-error';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

type Ref = { id: string; name: string };
type Room = Ref & { location_id: string; location: string; capacity: number };
type Term = Ref & { starts_on: string; ends_on: string };

const EMPTY: C.ClassDraft = {
  name: '', term_id: '', dance_style_id: '', level_id: null, location_id: '',
  room_id: null, teacher_id: null, day_of_week: 1, start_time: '17:00',
  duration_min: 60, capacity: 16, age_min: null, age_max: null,
  price_minor: 5400, trials_enabled: true, waitlist_enabled: true, visibility: 'public',
  pricing: 'term', trial_price_minor: null, assistant_id: null, prerequisites: null, description: null,
  trial_needs_approval: false,
};

const PRICE_LABEL: Record<C.ClassDraft['pricing'], string> = {
  term: 'Price per term', monthly: 'Price per month', one_off: 'Price for the course', drop_in: 'Price per class',
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
  // Level in plain words and what to bring, for the public page (UR-20).
  const extraRow = useRows<C.ClassPublicExtra>(['class-public-extra', classId ?? ''], C.CLASS_PUBLIC_EXTRA, [classId], { enabled: editing });
  const [extra, setExtra] = React.useState<C.ClassPublicExtra>({ level_note: null, what_to_bring: null });
  React.useEffect(() => { if (extraRow.data?.[0]) setExtra(extraRow.data[0]); }, [extraRow.data]);
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
        draft.pricing, draft.trial_price_minor, draft.assistant_id, draft.prerequisites ?? '',
        draft.description ?? '', draft.trial_needs_approval,
      ];
      return runAs(session, async q => {
        if (editing) {
          const [row] = await q<{ id: string }>(C.UPDATE_CLASS, [classId, ...args]);
          if (!row) throw new Error('That class could not be saved.');
          await q(C.SET_CLASS_PUBLIC_EXTRA, [classId, extra.level_note ?? '', extra.what_to_bring ?? '']);
          if (movesSessions) {
            const [r] = await q<{ net: number }>(C.RESCHEDULE_CLASS, [classId]);
            return `Saved. The timetable was rebuilt from the new time${
              (r?.net ?? 0) ? '' : ' — sessions with a register taken were left alone'}.`;
          }
          return 'Saved.';
        }
        const [row] = await q<{ id: string }>(C.CREATE_CLASS, [draft.term_id, ...args]);
        if (!row) throw new Error('You cannot add a class to that term.');
        await q(C.SET_CLASS_PUBLIC_EXTRA, [row.id, extra.level_note ?? '', extra.what_to_bring ?? '']);
        const [made] = await q<{ made: number }>(C.GENERATE_SESSIONS, [row.id]);
        return `Added, with ${made?.made ?? 0} session${made?.made === 1 ? '' : 's'} in the term.`;
      });
    },
    onSuccess: msg => { setDone(msg); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const valid = draft.name.trim().length >= 2 && draft.term_id && draft.dance_style_id
    && draft.location_id && draft.capacity > 0 && draft.duration_min > 0
    && /^\d{2}:\d{2}$/.test(draft.start_time)
    && (draft.age_min == null || draft.age_max == null || draft.age_max >= draft.age_min)
    && (!draft.assistant_id || draft.assistant_id !== draft.teacher_id);

  // Why "Create class" is not available yet, said beside the button rather
  // than left as a greyed-out mystery (UR-40).
  const missing = !ready ? null
    : draft.name.trim().length < 2 ? 'Add a name of at least two letters.'
    : !draft.term_id ? 'Choose a term. Add one in Studio settings first if there is none.'
    : !draft.dance_style_id ? 'Choose a style.'
    : !draft.location_id ? 'Choose where it happens.'
    : !/^\d{2}:\d{2}$/.test(draft.start_time) ? 'Add a start time.'
    : !(draft.duration_min > 0) ? 'Add how many minutes it lasts.'
    : !(draft.capacity > 0) ? 'Add how many places there are.'
    : draft.age_min != null && draft.age_max != null && draft.age_max < draft.age_min ? 'The oldest age cannot be below the youngest.'
    : draft.assistant_id && draft.assistant_id === draft.teacher_id ? 'The assistant must be someone other than the teacher.'
    : null;

  const body = React.useRef<HTMLDivElement>(null);
  useFirstErrorInView(body, save.error);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="class-form-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <>
            <div className="px-5 py-6">
              <h2 id="class-form-t" className="sr-only">{draft.name}</h2>
              <StatusLine title={draft.name} detail={done} />
            </div>
            <div className="flex border-t border-line px-5 py-3 pb-safe sm:justify-end">
              <Button className="w-full sm:w-auto" variant="primary" onClick={onClose}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
              <div className="min-w-0 flex-1">
                <h2 id="class-form-t" className="font-display text-[1.25rem] leading-tight">
                  {editing ? 'Edit class' : 'New class'}
                </h2>
                <p className="mt-1 text-[0.8438rem] text-ink-3">
                  {editing ? 'Changes apply from here on.' : 'The term’s sessions are created for you.'}
                </p>
              </div>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1">
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div ref={body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {!ready && !loadError && (
              <div className="space-y-3" aria-busy="true">
                <p className="text-[0.8125rem] text-ink-3">Loading the studio’s styles, rooms and terms…</p>
                {[0,1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            )}
            {loadError && <ErrorState error={loadError} />}

            <div className={cn('space-y-4', !ready && 'hidden')}>
              <FormPart title="The class" />
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

              <FormPart title="When and where" />
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

              <Field label="Assistant" htmlFor="cf-assist" hint="Can take the register and see the class, like the teacher.">
                <Select id="cf-assist" value={draft.assistant_id ?? ''}
                        onChange={e => set('assistant_id', e.target.value || null)}>
                  <option value="">No assistant</option>
                  {teachers.data?.filter(t => t.id !== draft.teacher_id)
                    .map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
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
                <Notice word="Moved" tone="caution" title="Future sessions move to the new time"
                  detail="Any session whose register has been taken stays where it is." />
              )}

              <FormPart title="Places and price" />
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

              <div className="grid grid-cols-2 gap-3">
                <Field label="Charged" htmlFor="cf-pricing">
                  <Select id="cf-pricing" value={draft.pricing}
                          onChange={e => set('pricing', e.target.value as C.ClassDraft['pricing'])}>
                    <option value="term">By the term</option>
                    <option value="monthly">Monthly</option>
                    <option value="one_off">One-off course</option>
                    <option value="drop_in">Pay as you go</option>
                  </Select>
                </Field>
                <Field label={PRICE_LABEL[draft.pricing]} htmlFor="cf-price" hint="In pounds.">
                  <Input id="cf-price" type="number" inputMode="decimal" min={0} step={0.5}
                         value={(draft.price_minor / 100).toFixed(2)}
                         onChange={e => set('price_minor', Math.round(Number(e.target.value) * 100))} />
                </Field>
              </div>
              <Field label="Trial price" htmlFor="cf-trial" hint="Leave empty for a free trial.">
                <Input id="cf-trial" type="number" inputMode="decimal" min={0} step={0.5}
                       value={draft.trial_price_minor == null ? '' : (draft.trial_price_minor / 100).toFixed(2)}
                       onChange={e => set('trial_price_minor', e.target.value === '' ? null : Math.round(Number(e.target.value) * 100))} />
              </Field>
              <FormPart title="What families read" />
              <Field label="Before joining" htmlFor="cf-prereq" hint="Families see this, e.g. ‘Grade 2 passed, or teacher’s invitation’.">
                <Input id="cf-prereq" value={draft.prerequisites ?? ''} maxLength={200}
                       onChange={e => set('prerequisites', e.target.value)} />
              </Field>
              <Field label="Level in plain words" htmlFor="cf-levelnote" hint="For example ‘No experience needed’ or ‘A year of tap’.">
                <Input id="cf-levelnote" value={extra.level_note ?? ''} maxLength={200}
                       onChange={e => setExtra(x => ({ ...x, level_note: e.target.value }))} />
              </Field>
              <Field label="What to wear or bring" htmlFor="cf-bring" hint="Shown to families booking a trial.">
                <Input id="cf-bring" value={extra.what_to_bring ?? ''} maxLength={400}
                       onChange={e => setExtra(x => ({ ...x, what_to_bring: e.target.value }))} />
              </Field>
              <Field label="About the class" htmlFor="cf-desc">
                <textarea id="cf-desc" rows={3} value={draft.description ?? ''} maxLength={1000}
                  onChange={e => set('description', e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>

              <fieldset className="space-y-1">
                <legend className="mb-2 w-full border-b border-ink pb-1.5 text-[0.875rem] font-semibold">How families find it</legend>
                {([
                  ['trials_enabled', 'Taking trial bookings'],
                  ['trial_needs_approval', 'Trials need the teacher’s say-so first'],
                  ['waitlist_enabled', 'Keep a waiting list when it is full'],
                ] as const).map(([k, label]) => (
                  <label key={k} className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
                    <input type="checkbox" checked={draft[k]} className="size-[18px] accent-[var(--color-accent)]"
                           onChange={e => set(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
                <div className="pt-2">
                  <Select aria-label="Who can see this class" value={draft.visibility}
                          onChange={e => set('visibility', e.target.value as C.ClassDraft['visibility'])}>
                    <option value="public">Listed publicly</option>
                    <option value="unlisted">Unlisted — only by direct link</option>
                    <option value="private">Private — staff and enrolled families only</option>
                  </Select>
                </div>
              </fieldset>

              {draft.age_min != null && draft.age_max != null && draft.age_max < draft.age_min && (
                <p role="alert" className="flex items-center gap-1.5 text-[0.7812rem] text-critical">
                  <AlertTriangle className="size-3.5" aria-hidden /> The oldest age cannot be below the youngest.
                </p>
              )}
            </div>

              {save.isError && <div className="mt-4"><ErrorState error={save.error} /></div>}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3 pb-safe sm:flex-nowrap sm:justify-end">
              <SaveErrorSummary error={save.error ?? undefined} reason={missing} />
              <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button className="flex-[2] sm:flex-none" variant="primary" disabled={!ready || !valid}
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

function FormPart({ title }: { title: string }) {
  return <h3 className="border-b border-ink pb-1.5 pt-2 text-[0.875rem] font-semibold first:pt-0">{title}</h3>;
}
