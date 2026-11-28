'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarOff } from 'lucide-react';
import { useRows } from '@/lib/query';
import { Button, Word } from '@/components/ui';
import { SectionHead, dayDate } from '@/app/family/_parts/ui';
import { AbsenceForm } from '@/components/app/absence-report';
import * as F from '@/lib/repos/family';
import { time } from '@/lib/format';

/*
 * Pieces of the parent Home (round-2 panel U7, U8): the Coming up strip, the
 * clash notices, and "Report an absence" one tap from Home.
 */

const KIND_WORD: Record<F.ComingUpItem['kind'], string> = { show: 'Show', exam: 'Exam', costume: 'Costume', fee: 'Fee' };
const SHOW_WORD: Record<string, string> = { show: 'Show', competition: 'Competition', workshop: 'Workshop' };

/**
 * Per child, the next show, exam, costume deadline and fee, in date order.
 * One strip for everyone, so a parent of three sees the whole family at once.
 */
export function ComingUpStrip({ nameOf, solo }: { nameOf: (id: string, first: string) => string; solo: boolean }) {
  const rows = useRows<F.ComingUpItem>(['my-coming-up'], F.MY_COMING_UP);
  const at = (d: string | null) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);
  const list = React.useMemo(() => [...(rows.data ?? [])].sort((a, b) => at(a.on_date) - at(b.on_date)), [rows.data]);
  if (!list.length) return null;
  return (
    <section aria-labelledby="up-next-h">
      <SectionHead id="up-next-h" title="Coming up" href="/family/events" link="Shows and events" />
      <ul className="divide-y divide-line">
        {list.map(r => {
          const who = nameOf(r.student_id, r.child);
          const href = r.kind === 'fee' ? '/family/payments' : '/family/events';
          return (
            <li key={`${r.student_id}-${r.kind}`}>
              <Link href={href} className="grid min-h-[56px] grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-4 py-3 hover:bg-surface-2/60">
                <span className="text-[0.8125rem] text-ink-2">{r.on_date ? dayDate(r.on_date) : 'Date to be set'}</span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">
                    {solo ? r.title : <>{who === 'you' ? 'You' : who} · {r.title}</>}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-3">
                    <Word tone={r.kind === 'costume' && r.state === 'needed' ? 'caution' : r.kind === 'fee' && r.state === 'invoiced' ? 'caution' : 'ink'}>
                      {r.kind === 'fee' ? (r.state === 'invoiced' ? 'Invoiced' : 'Expected')
                        : r.kind === 'show' && r.state ? SHOW_WORD[r.state] ?? 'Show' : KIND_WORD[r.kind]}
                    </Word>
                    {r.detail && <span className="min-w-0">{r.detail}</span>}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Clashes in the next fortnight: the same child booked for two things at once.
 *  A weekly clash is one notice listing its dates, not one per week. */
export type ClashGroup = F.Clash & { dates: string[] };
export function useClashes(from: string, to: string) {
  const q = useRows<F.Clash>(['my-clashes', from], F.MY_CLASHES, [from, to]);
  const data = React.useMemo(() => {
    const m = new Map<string, ClashGroup>();
    (q.data ?? []).forEach(c => {
      const k = `${c.student_id}|${c.a_title}|${c.b_title}|${time(c.a_starts)}`;
      const e = m.get(k);
      if (e) e.dates.push(c.a_starts); else m.set(k, { ...c, dates: [c.a_starts] });
    });
    return [...m.values()];
  }, [q.data]);
  return { ...q, data };
}

const KIND_NAME: Record<string, string> = { private_lesson: 'private lesson', class: 'class', workshop: 'workshop',
  show: 'show', competition: 'competition', rehearsal: 'rehearsal' };

export function clashTitle(c: ClashGroup, who: string) {
  const name = who === 'you' ? 'You are' : `${who} is`;
  const days = c.dates.map(d => dayDate(d));
  const on = days.length === 1 ? days[0] : `${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}`;
  return `${name} booked for two things at ${time(c.a_starts)} on ${on}`;
}
export function clashDetail(c: F.Clash) {
  const one = (t: string, k: string) => (k === 'class' || t.toLowerCase().includes(KIND_NAME[k] ?? k) ? t : `${t} (${KIND_NAME[k] ?? k})`);
  return `${one(c.a_title, c.a_kind)} at ${time(c.a_starts)} and ${one(c.b_title, c.b_kind)} at ${time(c.b_starts)}. Ask the studio if one should move.`;
}

/**
 * "Report an absence" from Home. With one child (or an adult on their own)
 * it opens straight on the form; with several, it asks who first.
 */
export function ReportAbsence({ people, className }: {
  people: { id: string; first_name: string; is_me?: boolean }[]; className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [who, setWho] = React.useState<{ id: string; first_name: string; is_me?: boolean } | null>(null);
  const close = React.useCallback(() => { setOpen(false); setWho(null); }, []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);
  if (!people.length) return null;
  const chosen = who ?? (people.length === 1 ? people[0]! : null);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <CalendarOff className="size-4" aria-hidden /> Report an absence
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="home-absence-title" onClick={e => e.stopPropagation()}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
            <h2 id="home-absence-title" className="text-[1.0625rem] font-semibold tracking-tight">
              {chosen?.is_me ? 'I can’t make it' : 'Report an absence'}
            </h2>
            {!chosen ? (
              <fieldset className="mt-3">
                <legend className="text-[0.875rem] text-ink-2">Who will miss a class?</legend>
                <div className="mt-2 grid gap-2">
                  {people.map(p => (
                    <Button key={p.id} className="justify-start" onClick={() => setWho(p)}>
                      {p.is_me ? 'Me' : p.first_name}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" className="mt-3" onClick={close}>Cancel</Button>
              </fieldset>
            ) : (
              <>
                <p className="mb-3 mt-0.5 text-sm text-ink-2">
                  {chosen.is_me ? 'Your teacher and the office are told.' : `For ${chosen.first_name}`}
                  {people.length > 1 && <> · <button type="button" className="font-semibold text-accent-text hover:underline" onClick={() => setWho(null)}>Someone else</button></>}
                </p>
                <AbsenceForm studentId={chosen.id} firstName={chosen.first_name} self={!!chosen.is_me} onDone={close} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
