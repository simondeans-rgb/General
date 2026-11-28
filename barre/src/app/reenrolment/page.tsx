'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shell } from '@/components/app/shell';
import { Beats, Button, EmptyState, ErrorState, Field, Input, Notice, SectionHead, Select, Skeleton, Word, StatusLine } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as C from '@/lib/repos/classes';
import * as S from '@/lib/repos/seasons';
import { dateLong, dateShort, toDateInput } from '@/lib/format';
import { cn } from '@/lib/cn';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_WORD: Record<string, [string, 'ink' | 'positive' | 'caution' | 'muted' | 'critical']> = {
  proposed: ['Waiting', 'caution'], confirmed: ['Confirmed', 'positive'], declined: ['Not returning', 'muted'],
  released: ['Released', 'muted'], placed: ['Placed', 'positive'], waitlisted: ['Waiting list', 'caution'],
};
const ROUND_WORD: Record<S.Round['status'], string> = {
  draft: 'Not sent yet', open: 'Families replying', closed: 'Replies closed', published: 'Published', cancelled: 'Cancelled',
};
const plus = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

function useWrite(after?: (r: any) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { sql: string; params: unknown[] }) => (await runAs(session, q => q(v.sql, v.params)))[0],
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); after?.(r); },
  });
}

/**
 * September re-enrolment and moving up (round 2 F3). The office picks the
 * next term; every child gets a proposed next class (the next level up that
 * fits their age, or the same class); the office edits proposals, sends them
 * to families, who confirm or opt out by a date. Nothing is enrolled until
 * the office publishes, so every step before that can be undone.
 */
export default function ReenrolmentPage() {
  const rounds = useRows<S.Round>(['reenrol-rounds'], S.ROUNDS);
  const live = (rounds.data ?? []).filter(r => r.status !== 'cancelled' && r.status !== 'published');
  const past = (rounds.data ?? []).filter(r => r.status === 'cancelled' || r.status === 'published');
  const [pick, setPick] = React.useState<string | null>(null);
  const current = (rounds.data ?? []).find(r => r.id === pick) ?? live[0];
  return (
    <Shell title="Re-enrolment" subtitle="Move children up and confirm next term’s places" allow={['owner', 'admin']}
      help={<>Proposals follow each level’s “moves up to” and the age range of the next term’s classes. Families reply from their home screen. Nobody is enrolled until you publish: before that you can change proposals, close or reopen replies, or cancel.</>}>
      <div className="mx-auto max-w-[1080px] space-y-10">
        {rounds.isLoading && <Skeleton className="h-32" />}
        {rounds.error != null && <ErrorState error={rounds.error} onRetry={() => rounds.refetch()} />}
        {rounds.data && live.length === 0 && <StartRound />}
        {current && <RoundView r={current} />}
        {past.length > 0 && (
          <section aria-labelledby="past-h">
            <SectionHead id="past-h" title="Earlier" />
            <ul className="divide-y divide-line text-[0.875rem]">
              {past.map(r => (
                <li key={r.id}>
                  <button className="flex min-h-[48px] w-full items-center gap-3 py-2 text-left hover:bg-surface-2/60" aria-current={current?.id === r.id || undefined} onClick={() => setPick(r.id)}>
                    <span className="min-w-0 flex-1"><b>{r.from_term} → {r.to_term}</b><span className="block text-[0.8125rem] text-ink-3">{r.placed} placed · {r.waitlisted} waiting list · {r.released + r.declined} not returning</span></span>
                    <Word tone={r.status === 'published' ? 'positive' : 'muted'}>{ROUND_WORD[r.status]}</Word>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Shell>
  );
}

function StartRound() {
  const terms = useRows<C.TermRow>(['term-tabs'], C.TERM_TABS);
  const list = [...(terms.data ?? [])].sort((a, b) => toDateInput(a.starts_on).localeCompare(toDateInput(b.starts_on)));
  const from = list.find(t => t.current) ?? list.find(t => t.classes > 0);
  const later = list.filter(t => from && toDateInput(t.starts_on) > toDateInput(from.starts_on));
  const [to, setTo] = React.useState('');
  const target = later.find(t => t.id === to) ?? later[0];
  const [by, setBy] = React.useState(plus(21));
  const start = useWrite();
  if (terms.isLoading) return <Skeleton className="h-24" />;
  if (!from) return <EmptyState title="No term to re-enrol from" body="Add a term with classes first." />;
  return (
    <section aria-labelledby="start-h">
      <SectionHead id="start-h" title="Start re-enrolment" meta={`From ${from.name}`} />
      {later.length === 0 ? (
        <p className="py-3 text-[0.9062rem] text-ink-2">Add the next term first, in <Link href="/studio" className="font-semibold text-accent-text underline">School settings</Link>, with its dates and breaks. Its classes can be copied from {from.name} in the next step.</p>
      ) : (
        <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <Field label="Into" htmlFor="re-to" hint={target && target.classes === 0 ? `${from.name}’s classes are copied in first` : undefined}>
            <Select id="re-to" value={target?.id ?? ''} onChange={e => setTo(e.target.value)}>
              {later.map(t => <option key={t.id} value={t.id}>{t.name} · from {dateShort(t.starts_on)}</option>)}
            </Select>
          </Field>
          <Field label="Families reply by" htmlFor="re-by" hint="Unanswered places are released after this date">
            <Input id="re-by" type="date" value={by} min={plus(0)} max={target ? toDateInput(target.starts_on) : undefined} onChange={e => setBy(e.target.value)} />
          </Field>
          <Button variant="primary" loading={start.isPending} disabled={!target || !by}
            onClick={() => start.mutate({ sql: S.START_REENROLMENT, params: [from.id, target!.id, by] })}>Propose next classes</Button>
          {start.error != null && <div className="sm:col-span-3"><ErrorState error={start.error} /></div>}
        </div>
      )}
    </section>
  );
}

function RoundView({ r }: { r: S.Round }) {
  const offers = useRows<S.Offer>(['reenrol-offers', r.id], S.OFFERS, [r.id]);
  const classes = useRows<S.NextClass>(['reenrol-classes', r.to_term_id, r.id], S.NEXT_TERM_CLASSES, [r.to_term_id, r.id]);
  const [done, setDone] = React.useState<string | null>(null);
  const write = useWrite();
  const go = (sql: string, params: unknown[], msg?: (x: any) => string) => write.mutate({ sql, params }, { onSuccess: x => msg && setDone(msg(x)) });
  const editable = r.status === 'draft' || r.status === 'open' || r.status === 'closed';
  const pastDeadline = new Date(r.respond_by) < new Date(new Date().toDateString());
  const byClass = React.useMemo(() => {
    const m = new Map<string, S.Offer[]>();
    for (const o of offers.data ?? []) m.set(o.from_class ?? 'No class', [...(m.get(o.from_class ?? 'No class') ?? []), o]);
    return [...m.entries()];
  }, [offers.data]);
  return (
    <>
      <section aria-labelledby="round-h">
        <SectionHead id="round-h" title={`${r.from_term} → ${r.to_term}`} meta={`${ROUND_WORD[r.status]} · reply by ${dateLong(r.respond_by)}`} />
        {done && <div role="status" className="py-3"><StatusLine live={false} title={done} /></div>}
        {write.error != null && <div className="py-3"><ErrorState error={write.error} /></div>}
        <dl className="grid grid-cols-3 gap-4 py-4 sm:grid-cols-6">
          {([['Children', r.offers], ['Confirmed', r.confirmed + r.placed], ['Waiting to reply', r.proposed], ['Not returning', r.declined + r.released],
             ['Waiting list', r.waitlisted], ['No class proposed', r.no_class]] as [string, number][]).map(([k, v]) => (
            <div key={k}><dt className="label">{k}</dt><dd className={cn('stat-number mt-1 text-[1.625rem] leading-none', k === 'No class proposed' && v > 0 && 'text-caution')}>{v}</dd></div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          {r.status === 'draft' && <Button variant="primary" onClick={() => go(S.OPEN_REENROLMENT, [r.id], x => `Sent to ${x.n} famil${x.n === 1 ? 'y' : 'ies'}, one message each. They reply from their home screen.`)}>Send to families</Button>}
          {r.status === 'open' && (pastDeadline
            ? <Button variant="primary" onClick={() => go(S.CLOSE_REENROLMENT, [r.id, false], x => `Replies closed. ${x.n} unanswered place${x.n === 1 ? '' : 's'} released.`)}>Close replies and release unanswered places</Button>
            : <Button onClick={() => go(S.CLOSE_REENROLMENT, [r.id, true], x => `Replies closed early. ${x.n} unanswered place${x.n === 1 ? '' : 's'} released.`)}>Close replies early</Button>)}
          {r.status === 'closed' && <>
            <Button variant="primary" onClick={() => go(S.PUBLISH_REENROLMENT, [r.id], x => {
              const p = x.r as S.PublishResult;
              return `${r.to_term} is published: ${p.placed} placed, ${p.waitlisted} on waiting lists, ${p.offered} place${p.offered === 1 ? '' : 's'} offered from waiting lists.`;
            })}>Publish {r.to_term} places</Button>
            <Button onClick={() => go(S.REOPEN_REENROLMENT, [r.id, null], () => 'Replies reopened. Released places are proposed again.')}>Reopen replies</Button>
          </>}
          {editable && <Button variant="ghost" onClick={() => go(S.CANCEL_REENROLMENT, [r.id], () => 'Cancelled. Nobody was enrolled; you can start again.')}>Cancel re-enrolment</Button>}
        </div>
        {r.status === 'published' && <p className="pt-3 text-[0.875rem] text-ink-2">Next term’s enrolments are made. Change a place from <Link href="/classes" className="font-semibold text-accent-text underline">Classes</Link>.</p>}
      </section>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-labelledby="offers-h" className="min-w-0">
          <SectionHead id="offers-h" title="Each child’s next class" meta={editable ? 'Change any proposal' : undefined} />
          {offers.isLoading && <Skeleton className="h-40" />}
          {byClass.map(([from, list]) => (
            <div key={from} className="mt-4">
              <h3 className="text-[0.875rem] font-semibold">From {from} <span className="font-normal text-ink-3">· {list.length}</span></h3>
              <ul className="divide-y divide-line">
                {list.map(o => (
                  <li key={o.id} className="grid gap-x-3 gap-y-1 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] sm:items-center">
                    <span className="min-w-0 text-[0.875rem]"><b className="font-semibold">{o.student}</b>{o.age != null && <span className="text-ink-3"> · age {o.age} next term</span>}
                      <span className="block text-[0.7812rem] text-ink-3">{S.REASON[o.reason] ?? o.reason}</span></span>
                    {editable && !['placed', 'waitlisted'].includes(o.status) ? (
                      <Select aria-label={`Next class for ${o.student}`} className="h-9 text-[0.8125rem]" value={o.class_id ?? ''}
                        onChange={e => go(S.SET_REENROLMENT_CLASS, [o.id, e.target.value || null])}>
                        <option value="">No class</option>
                        {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name} · {DAYS[c.day_of_week]} {c.start_time.slice(0, 5)}</option>)}
                      </Select>
                    ) : <span className="text-[0.875rem]">{o.class_name ?? 'No class'}</span>}
                    <span className="flex items-center gap-1.5">
                      <Word tone={STATUS_WORD[o.status]?.[1] ?? 'muted'}>{STATUS_WORD[o.status]?.[0] ?? o.status}</Word>
                      {editable && r.status !== 'draft' && o.class_id && o.status !== 'confirmed' &&
                        <Button size="sm" variant="ghost" aria-label={`Confirm for ${o.student}`} onClick={() => go(S.ANSWER_REENROLMENT, [o.id, true])}>Confirm</Button>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <aside className="min-w-0 space-y-10">
          <section aria-labelledby="load-h">
            <SectionHead id="load-h" title={`${r.to_term} classes`} meta="Confirmed of places" />
            <ul className="divide-y divide-line text-[0.875rem]">
              {classes.data?.map(c => (
                <li key={c.id} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1"><b className="font-semibold">{c.name}</b><span className="block text-[0.7812rem] text-ink-3">{DAYS[c.day_of_week]} {c.start_time.slice(0, 5)}{c.age_min != null ? ` · ages ${c.age_min}${c.age_max != null ? `–${c.age_max}` : '+'}` : ''} · {c.proposed} proposed</span></span>
                  <Beats value={Math.min(c.confirmed, c.capacity)} max={c.capacity} label={`${c.confirmed} of ${c.capacity} places confirmed`} />
                  <span className={cn('w-14 text-right tnum', c.proposed > c.capacity && 'font-semibold text-caution')}>{c.confirmed}/{c.capacity}</span>
                </li>
              ))}
            </ul>
          </section>
          {editable && <Progression />}
        </aside>
      </div>
    </>
  );
}

/** "Moves up to": each level's next level. Blank follows the level order. */
function Progression() {
  const levels = useRows<S.LevelRow>(['levels-progression'], S.LEVELS);
  const write = useWrite();
  return (
    <section aria-labelledby="prog-h">
      <SectionHead id="prog-h" title="Moves up to" />
      <p className="py-2 text-[0.8125rem] text-ink-3">Used for new proposals. Blank means the next level in your list.</p>
      {write.error != null && <ErrorState error={write.error} />}
      <ul className="divide-y divide-line text-[0.875rem]">
        {levels.data?.map(l => (
          <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 py-1.5">
            <span>{l.name}</span>
            <Select aria-label={`${l.name} moves up to`} className="h-9 text-[0.8125rem]" value={l.next_level_id ?? ''}
              onChange={e => write.mutate({ sql: S.SET_NEXT_LEVEL, params: [l.id, e.target.value || null] })}>
              <option value="">Next in the list</option>
              {levels.data.filter(x => x.id !== l.id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </Select>
          </li>
        ))}
      </ul>
    </section>
  );
}
