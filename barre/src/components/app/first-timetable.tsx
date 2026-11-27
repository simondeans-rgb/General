'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Plus, X } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Notice, Select, Skeleton } from '@/components/ui';
import { SaveErrorSummary, useFirstErrorInView } from '@/components/app/form-error';
import { PlanLimitNotice, isPlanLimit } from '@/components/app/plan-limit';
import * as C from '@/lib/repos/classes';
import * as S from '@/lib/repos/setup';
import { toMinor } from '@/lib/format';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];

type Row = { key: number; name: string; style: string; day: number; start: string; minutes: string; places: string; price: string };
let next = 1;
const blank = (style = '', day = 1): Row => ({ key: next++, name: '', style, day, start: '17:00', minutes: '60', places: '16', price: '' });

/**
 * The first timetable, typed in one place (UR-53). A new school adds where it
 * teaches, its term and its first style only if they are missing, then a row
 * per class: name, day, time, length, places and price. "Copy to" repeats a
 * row on other days. Saving creates every class and its sessions in one go,
 * through the same statements as the class form.
 */
export function FirstTimetable({ onDone }: { onDone?: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const locations = useRows<{ id: string }>(['ft-locations'], C.LOCATIONS);
  const terms = useRows<{ id: string; name: string; starts_on: string; ends_on: string }>(['open-terms'], C.OPEN_TERMS);
  const styles = useRows<{ id: string; name: string }>(['styles'], C.STYLES);

  const [place, setPlace] = React.useState('');
  const [termName, setTermName] = React.useState('');
  const [termFrom, setTermFrom] = React.useState('');
  const [termTo, setTermTo] = React.useState('');
  const [styleName, setStyleName] = React.useState('');
  const [termId, setTermId] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>(() => [blank()]);
  const [done, setDone] = React.useState<{ classes: number; sessions: number } | null>(null);

  const ready = !!(locations.data && terms.data && styles.data);
  const needPlace = ready && locations.data!.length === 0;
  const needTerm = ready && terms.data!.length === 0;
  const needStyle = ready && styles.data!.length === 0;
  React.useEffect(() => { if (!termId && terms.data?.[0]) setTermId(terms.data[0].id); }, [terms.data, termId]);
  React.useEffect(() => {
    const first = styles.data?.[0]?.id;
    if (first) setRows(rs => rs.map(r => r.style ? r : { ...r, style: first }));
  }, [styles.data]);

  const set = (key: number, patch: Partial<Row>) => setRows(rs => rs.map(r => r.key === key ? { ...r, ...patch } : r));
  const copyTo = (r: Row, day: number) => setRows(rs => [...rs, { ...r, key: next++, day }]);
  const filled = rows.filter(r => r.name.trim());

  const rowProblem = (r: Row) =>
    r.name.trim().length < 2 ? 'a name' : !/^\d{2}:\d{2}$/.test(r.start) ? 'a start time'
    : !(Number(r.minutes) > 0) ? 'its length in minutes' : !(Number(r.places) > 0) ? 'the number of places'
    : r.price.trim() && toMinor(r.price) == null ? 'a price like 54 or 54.50' : null;
  const problem = !ready ? null
    : needPlace && place.trim().length < 2 ? 'Say where you teach.'
    : needTerm && (termName.trim().length < 2 || !termFrom || !termTo || termTo < termFrom) ? 'Add the term’s name, first day and last day.'
    : needStyle && styleName.trim().length < 2 ? 'Name a dance style.'
    : filled.length === 0 ? 'Type at least one class.'
    : (() => { const bad = filled.find(rowProblem); return bad ? `“${bad.name || 'A class'}” needs ${rowProblem(bad)}.` : null; })();

  const save = useMutation({
    mutationFn: () => runAs(session, async q => {
      const loc = needPlace
        ? (await q<{ id: string }>(S.CREATE_LOCATION, [place.trim(), '', '', '', '', '']))[0]!.id
        : locations.data![0]!.id;
      const term = needTerm
        ? (await q<{ id: string }>(S.CREATE_TERM, [termName.trim(), termFrom, termTo, 'published']))[0]!.id
        : termId;
      const style = needStyle
        ? (await q<{ id: string }>(S.CREATE_STYLE, [styleName.trim(), 'violet']))[0]!.id
        : null;
      let sessions = 0;
      for (const r of filled) {
        const [row] = await q<{ id: string }>(C.CREATE_CLASS, [term,
          style ?? r.style, null, loc, null, null, r.name.trim(), r.day, r.start,
          Number(r.minutes), Number(r.places), null, null, toMinor(r.price || '0') ?? 0, true, true, 'public',
          'term', null, null, '', '', false]);
        if (!row) throw new Error('A class could not be added to that term.');
        const [made] = await q<{ made: number }>(C.GENERATE_SESSIONS, [row.id]);
        sessions += made?.made ?? 0;
      }
      return { classes: filled.length, sessions };
    }),
    onSuccess: r => { setDone(r); qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(); },
  });

  const box = React.useRef<HTMLDivElement>(null);
  useFirstErrorInView(box, save.error);

  if (!ready) return <Skeleton className="h-40" />;
  if (done) {
    return (
      <div className="space-y-3">
        <Notice word="Added" tone="positive" title={`${done.classes} class${done.classes === 1 ? '' : 'es'} on your timetable`}
          detail={`${done.sessions} sessions were made for the term. Assign teachers, ages and descriptions from Classes when you are ready.`} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => { setDone(null); setRows([blank(styles.data?.[0]?.id ?? '')]); }}>Add more</Button>
          <a href="/schedule" className="inline-flex min-h-9 items-center text-[13.5px] font-semibold text-accent-text hover:underline">See the week</a>
        </div>
      </div>
    );
  }

  return (
    <div ref={box} className="space-y-5">
      {(needPlace || needTerm || needStyle) && (
        <div className="space-y-3">
          <p className="text-[14px] text-ink-2">First, the few things every class needs. You can add rooms, more places and breaks later in School settings.</p>
          {needPlace && (
            <Field label="Where do you teach?" htmlFor="ft-place" required hint="The hall or studio’s name.">
              <Input id="ft-place" value={place} onChange={e => setPlace(e.target.value)} placeholder="St Mary’s Hall" />
            </Field>
          )}
          {needTerm && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Term" htmlFor="ft-term" required>
                <Input id="ft-term" value={termName} onChange={e => setTermName(e.target.value)} placeholder="Spring term" />
              </Field>
              <Field label="First day" htmlFor="ft-from" required>
                <Input id="ft-from" type="date" value={termFrom} onChange={e => setTermFrom(e.target.value)} />
              </Field>
              <Field label="Last day" htmlFor="ft-to" required>
                <Input id="ft-to" type="date" value={termTo} onChange={e => setTermTo(e.target.value)} />
              </Field>
            </div>
          )}
          {needTerm && <p className="text-[12.5px] text-ink-3">The term is published straight away, so families see its classes. Add half-term breaks later; sessions in a break can be regenerated from the class.</p>}
          {needStyle && (
            <Field label="Dance style" htmlFor="ft-style" required hint="Add more styles later.">
              <Input id="ft-style" value={styleName} onChange={e => setStyleName(e.target.value)} placeholder="Ballet" />
            </Field>
          )}
        </div>
      )}

      {!needTerm && (terms.data?.length ?? 0) > 1 && (
        <Field label="Term" htmlFor="ft-term-pick">
          <Select id="ft-term-pick" value={termId} onChange={e => setTermId(e.target.value)}>
            {terms.data!.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
      )}

      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className="rounded-[var(--radius-md)] border border-line p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_6rem_5rem_5rem_6rem]">
              <Field label="Class" htmlFor={`ft-n-${r.key}`}>
                <Input id={`ft-n-${r.key}`} value={r.name} placeholder={i === 0 ? 'Baby Ballet' : ''}
                       aria-invalid={save.isError && !!r.name && !!rowProblem(r) ? true : undefined}
                       onChange={e => set(r.key, { name: e.target.value })} />
              </Field>
              <Field label="Day" htmlFor={`ft-d-${r.key}`}>
                <Select id={`ft-d-${r.key}`} value={String(r.day)} onChange={e => set(r.key, { day: Number(e.target.value) })}>
                  {WEEK.map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
                </Select>
              </Field>
              <Field label="Starts" htmlFor={`ft-s-${r.key}`}>
                <Input id={`ft-s-${r.key}`} type="time" value={r.start} onChange={e => set(r.key, { start: e.target.value })} />
              </Field>
              <Field label="Minutes" htmlFor={`ft-m-${r.key}`}>
                <Input id={`ft-m-${r.key}`} type="number" inputMode="numeric" min={15} step={5} value={r.minutes}
                       onChange={e => set(r.key, { minutes: e.target.value })} />
              </Field>
              <Field label="Places" htmlFor={`ft-p-${r.key}`}>
                <Input id={`ft-p-${r.key}`} type="number" inputMode="numeric" min={1} value={r.places}
                       onChange={e => set(r.key, { places: e.target.value })} />
              </Field>
              <Field label="£ a term" htmlFor={`ft-c-${r.key}`}>
                <Input id={`ft-c-${r.key}`} inputMode="decimal" value={r.price} placeholder="54"
                       onChange={e => set(r.key, { price: e.target.value })} />
              </Field>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(styles.data?.length ?? 0) > 1 && (
                <Select aria-label={`Style of ${r.name || 'this class'}`} value={r.style} className="h-9 w-auto text-[13.5px]"
                        onChange={e => set(r.key, { style: e.target.value })}>
                  {styles.data!.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              )}
              <label className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <Copy className="size-3.5" aria-hidden />
                <select aria-label={`Copy ${r.name || 'this class'} to another day`} value=""
                        onChange={e => { if (e.target.value !== '') copyTo(r, Number(e.target.value)); }}
                        className="h-9 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[13.5px] text-ink">
                  <option value="">Copy to…</option>
                  {WEEK.filter(d => d !== r.day).map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
                </select>
              </label>
              {rows.length > 1 && (
                <Button size="sm" variant="ghost" className="ml-auto" aria-label={`Remove ${r.name || 'this row'}`}
                        onClick={() => setRows(rs => rs.filter(x => x.key !== r.key))}>
                  <X className="size-4" aria-hidden /> Remove
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <Button size="sm" onClick={() => setRows(rs => [...rs, blank(rs[rs.length - 1]?.style ?? styles.data?.[0]?.id ?? '',
        rs[rs.length - 1]?.day ?? 1)])}>
        <Plus className="size-4" aria-hidden /> Add a class
      </Button>

      {save.error != null && (isPlanLimit(save.error) ? <PlanLimitNotice error={save.error} /> : <ErrorState error={save.error} />)}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <SaveErrorSummary error={save.error ?? undefined} reason={problem} />
        <Button variant="primary" disabled={!!problem} loading={save.isPending} onClick={() => save.mutate()}>
          Add {filled.length || ''} class{filled.length === 1 ? '' : 'es'} to the timetable
        </Button>
      </div>
    </div>
  );
}
