'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { NewEnquirySheet } from '@/components/app/new-enquiry';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { Button, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import { SectionHead, ViewTabs, Word } from '@/components/app/session-row';
import * as C from '@/lib/repos/classes';
import { TrialActions } from '@/components/app/enrolment-actions';
import { EnquirySheet, canBookTrial } from '@/components/app/enquiry-sheet';
import { dateShort, ageFrom, time, relativeDay } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';

type Enq = C.EnquiryRow;
type Opened = { e: Enq; closing?: boolean; booking?: boolean } | null;
const COLUMNS: { key: string; label: string; stages: string[] }[] = [
  { key: 'enquiry', label: 'Enquiry', stages: ['enquiry'] },
  { key: 'trial_booked', label: 'Trial booked', stages: ['trial_requested', 'trial_booked'] },
  { key: 'trial_attended', label: 'Tried a class', stages: ['trial_attended'] },
  { key: 'follow_up', label: 'Follow up', stages: ['follow_up', 'trial_missed'] },
  { key: 'enrolled', label: 'Enrolled', stages: ['enrolled'] },
  { key: 'closed_lost', label: 'Closed', stages: ['closed_lost'] },
];

/** The pipeline as a board, by stage (R-032). */
function Board({ rows, onOpen }: { rows: Enq[]; onOpen: (o: Opened) => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [drag, setDrag] = React.useState<Enq | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  const move = useMutation({
    mutationFn: (v: { e: Enq; stage: string }) => runAs(session, q => q(C.SET_ENQUIRY_STAGE, [v.e.id, v.stage, v.e.next_action_on])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  // Closing asks why, so the funnel can say (UR-18).
  const moveTo = (e: Enq, stage: string) => stage === 'closed_lost' ? onOpen({ e, closing: true }) : move.mutate({ e, stage });
  return (
    <div className="pt-4">
      {move.error != null && <div className="mb-3"><ErrorState error={move.error} /></div>}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:px-0">
        {COLUMNS.map(col => {
          const list = rows.filter(r => col.stages.includes(r.stage));
          return (
            <section key={col.key} aria-label={`${col.label}, ${list.length}`}
              onDragOver={e => { if (drag) { e.preventDefault(); setOver(col.key); } }} onDragLeave={() => setOver(null)}
              onDrop={e => { e.preventDefault(); if (drag && !col.stages.includes(drag.stage)) moveTo(drag, col.key); setDrag(null); setOver(null); }}
              className={cn('flex w-56 shrink-0 flex-col rounded-[var(--radius-md)] lg:w-auto lg:min-w-0', over === col.key && 'bg-surface-2 ring-2 ring-accent-line')}>
              <h3 className="mb-2 flex items-baseline justify-between border-b-2 border-ink pb-1.5 text-[0.875rem] font-semibold">
                {col.label}<span className="font-display text-[1.0625rem] tnum">{list.length}</span>
              </h3>
              <ul className="space-y-2">
                {list.map(e => {
                  const overdue = e.next_action_on && new Date(e.next_action_on) < new Date() && !['enrolled', 'closed_lost'].includes(e.stage);
                  return (
                    <li key={e.id} draggable onDragStart={() => setDrag(e)} onDragEnd={() => { setDrag(null); setOver(null); }}
                      className={cn('cursor-grab rounded-[var(--radius-md)] border bg-surface p-2.5 active:cursor-grabbing', overdue ? 'border-critical/50' : 'border-line')}>
                      <button onClick={() => onOpen({ e })} className="block w-full text-left font-semibold leading-tight hover:underline">{e.child_name ?? e.contact_name}</button>
                      <p className="mt-0.5 truncate text-[0.7812rem] text-ink-3">{e.class_name ?? 'No class chosen'}</p>
                      <p className="truncate text-[0.7812rem] text-ink-3">{e.contact_name}</p>
                      {overdue && <p className="mt-1.5 leading-tight"><Word tone="critical">Overdue</Word> <span className="text-[0.75rem] text-critical">{dateShort(e.next_action_on!)}</span></p>}
                      {e.trial_starts_at && <p className="mt-1 text-[0.75rem] text-ink-3">Trial {dateShort(e.trial_starts_at)} {time(e.trial_starts_at)}</p>}
                      {canBookTrial(e) && <Button size="sm" className="mt-2 w-full" onClick={() => onOpen({ e, booking: true })}>Book a trial</Button>}
                      <label className="mt-2 flex items-center gap-1.5 text-[0.7812rem] text-ink-3">Move to
                        <select value={col.key} onChange={x => moveTo(e, x.target.value)}
                          className="h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[0.8438rem] text-ink lg:h-9">
                          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const STAGE: Record<string, { label: string; tone: 'ink' | 'caution' | 'positive' | 'muted' }> = {
  enquiry:         { label: 'Enquiry',        tone: 'ink' },
  trial_requested: { label: 'Trial requested',tone: 'ink' },
  trial_booked:    { label: 'Trial booked',   tone: 'ink' },
  trial_attended:  { label: 'Trial attended', tone: 'ink' },
  trial_missed:    { label: 'Trial missed',   tone: 'caution' },
  follow_up:       { label: 'Follow up',      tone: 'caution' },
  enrolled:        { label: 'Enrolled',       tone: 'positive' },
  closed_lost:     { label: 'Closed',         tone: 'muted' },
};

export default function EnrolmentPage() {
  const [newEnquiry, setNewEnquiry] = React.useState(false);
  const [view, setView] = React.useState<'board' | 'list'>('board');
  // The board needs width; a phone starts on the list.
  React.useEffect(() => { if (window.innerWidth < 768) setView('list'); }, []);
  const funnel = useRow<{ total: number; booked: number; attended: number; converted: number; lost: number }>(
    ['funnel'], C.FUNNEL);
  const enquiries = useRows<Enq>(['enquiries'], C.ENQUIRIES);
  const [opened, setOpened] = React.useState<Opened>(null);
  // A search result or link can open one enquiry: /enrolment?enquiry=<id>.
  const [asked, setAsked] = React.useState<{ id: string; booking?: boolean } | null>(null);
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('enquiry');
    if (id) setAsked({ id });
  }, []);
  React.useEffect(() => {
    const e = asked && enquiries.data?.find(x => x.id === asked.id);
    if (e) { setOpened({ e, booking: asked.booking }); setAsked(null); }
  }, [asked, enquiries.data]);

  const f = funnel.data;
  const rate = f && f.total > 0 ? Math.round((f.converted / f.total) * 1000) / 10 : null;

  return (
    <Shell title="Enrolment" help={<>Everyone who might join: enquiries, trial classes and waiting lists, by stage. Share your public booking link so families can book a trial themselves; you’re told when they do.</>} subtitle="From first enquiry to a place in a class" allow={['owner', 'admin']}
      actions={<Button size="sm" variant="primary" aria-label="New enquiry" onClick={() => setNewEnquiry(true)}>
        <Plus className="size-4" aria-hidden /> <span className="hidden sm:inline">New enquiry</span>
      </Button>}>
      {newEnquiry && <NewEnquirySheet onClose={() => setNewEnquiry(false)}
        onBook={id => { setNewEnquiry(false); setAsked({ id, booking: true }); }} />}
      {opened && <EnquirySheet key={opened.e.id} enquiry={opened.e} startClosing={opened.closing} startBooking={opened.booking}
        onClose={() => setOpened(null)} />}
      <div className="mx-auto max-w-[1240px] space-y-12">
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0"><Trials /></div>
          <div className="min-w-0 space-y-10">
            <section>
              <SectionHead title="Funnel" meta={rate != null ? `${rate}% of enquiries enrol` : undefined} />
              <div className="pt-3">
                {funnel.isLoading && <Skeleton className="h-24" />}
                {f && <Funnel steps={[
                  ['Enquiries', f.total], ['Trials booked', f.booked],
                  ['Attended', f.attended], ['Enrolled', f.converted],
                ]} />}
                {f && <p className="mt-3 text-[0.7812rem] text-ink-3">
                  Each line counts enquiries that reached that step, so every number is out of {f.total} enquiries.
                  {f.attended > 0 && ` Of the ${f.attended} who came to a trial, ${f.converted} enrolled (${Math.round((f.converted / f.attended) * 100)}%): the trial conversion shown in Reports.`}
                </p>}
              </div>
            </section>
            <PublicPageLink />
          </div>
        </div>

        <section>
          <SectionHead title="Pipeline"
            meta={view === 'board' ? 'Drag a card to move it on, or use its menu' : 'What needs doing next comes first'}
            action={<ViewTabs label="Pipeline view" value={view} onChange={setView} options={[['board', 'Board'], ['list', 'List']]} />} />
          {view === 'board' && enquiries.data && <Board rows={enquiries.data} onOpen={setOpened} />}
          {enquiries.isLoading && <div className="space-y-3 pt-3">{[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
          {enquiries.error && <div className="pt-3"><ErrorState error={enquiries.error} /></div>}
          {enquiries.data?.length === 0 && <EmptyState
            title="No enquiries yet" body="Enquiries from your booking page or the front desk land here." />}
          {view === 'list' && <ul className="divide-y divide-line">
            {enquiries.data?.map(e => {
              const stage = STAGE[e.stage] ?? STAGE.enquiry!;
              const open = !['enrolled','closed_lost'].includes(e.stage);
              const overdue = e.next_action_on && new Date(e.next_action_on) < new Date();
              return (
                <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 px-1 py-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem_7rem]">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <button onClick={() => setOpened({ e })} className="text-left font-semibold hover:underline">{e.child_name ?? e.contact_name}</button>
                      {e.child_dob && <span className="text-[0.8125rem] text-ink-3">{ageFrom(e.child_dob)}</span>}
                    </p>
                    {canBookTrial(e) && <Button size="sm" className="mt-1.5" onClick={() => setOpened({ e, booking: true })}>Book a trial</Button>}
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3">{e.class_name ?? 'No class chosen yet'} · via {e.source}</p>
                  </div>
                  <p className="order-last col-span-2 mt-1 flex min-w-0 flex-wrap gap-x-3 text-[0.8125rem] text-ink-2 md:order-none md:col-span-1 md:mt-0 md:block">
                    <span className="block">{e.contact_name}</span>
                    {e.contact_email && <a href={`mailto:${e.contact_email}`} className="block truncate text-accent-text hover:underline">{e.contact_email}</a>}
                    {e.contact_phone && <a href={`tel:${e.contact_phone}`} className="block tnum hover:text-ink">{e.contact_phone}</a>}
                  </p>
                  <span className="text-right md:text-left"><Word tone={stage.tone}>{stage.label}</Word></span>
                  <span className={cn('hidden text-right text-[0.8125rem] md:block', overdue && open ? 'font-semibold text-critical' : 'text-ink-3')}>
                    {e.next_action_on && open ? `${overdue ? 'Overdue' : 'Next'} ${dateShort(e.next_action_on)}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>}
        </section>
      </div>
    </Shell>
  );
}

/**
 * Trials, and the one question that decides the funnel: did they come, and are
 * they joining? Saying "joining" here builds the family, the child and the
 * place in one step — most trials arrive from an enquiry with no child record
 * behind them at all.
 */
function Trials() {
  const rows = useRows<C.TrialRow>(['trials'], C.TRIALS);
  const live = (rows.data ?? []).filter(t => !['converted', 'cancelled'].includes(t.status));
  const done = (rows.data ?? []).filter(t => t.status === 'converted');

  return (
    <section>
      <SectionHead title="Trials" meta={live.length ? `${live.length} to settle` : 'All settled'} />
      {rows.isPending && <div className="space-y-3 pt-3">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
      {rows.error && <div className="pt-3"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
      {!rows.isPending && rows.data?.length === 0 && (
        <EmptyState title="No trials booked"
          body="Book one from a class. The outcome lands here." />
      )}
      {(live.length > 0 || done.length > 0) && (
        <ul className="divide-y divide-line">
          {[...live, ...done.slice(0, 3)].map(t => (
            <li key={t.id} className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 gap-y-2 px-1 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto]">
              <span className="leading-none">
                {t.starts_at ? <>
                  <span className="block font-display text-[1.1875rem] tnum">{time(t.starts_at)}</span>
                  <span className="mt-1 block text-[0.7812rem] text-ink-3">{relativeDay(t.starts_at)}</span>
                </> : <span className="block pt-1 text-[0.8125rem] text-ink-3">No date</span>}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{t.student_name ?? t.contact_name ?? 'Someone'}</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">{t.class_name}{!t.student_id && ' · no child record yet'}</p>
              </div>
              <div className="col-start-2 sm:col-start-3"><TrialActions trial={t} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A funnel that is honest about proportion: each bar is scaled to the first
 *  step, so a narrow bar means a real drop-off rather than a design choice. */
function Funnel({ steps }: { steps: [string, number][] }) {
  const max = Math.max(...steps.map(s => s[1]), 1);
  return (
    <ol className="space-y-3">
      {steps.map(([label, n], i) => {
        const prev = i > 0 ? steps[i - 1]![1] : null;
        const drop = prev != null && prev > 0 ? Math.round(((prev - n) / prev) * 100) : null;
        return (
          <li key={label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[0.875rem] text-ink-2">{label}</span>
            <span aria-hidden className="h-5 flex-1 overflow-hidden rounded-[2px] bg-surface-2">
              <span className="block h-full rounded-[2px] bg-ink"
                    style={{ width: `${Math.max(3, (n / max) * 100)}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right font-display text-[1.1875rem] tnum">{n}</span>
            <span className="tnum w-12 shrink-0 text-right text-[0.8125rem] text-ink-3">
              {drop != null && drop > 0 ? `−${drop}%` : ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Where to send prospects: the school's own trial booking page (R-014). */
function PublicPageLink() {
  const slug = useRow<{ slug: string }>(['my-slug'], `select slug from studio where deleted_at is null and app.is_admin(id) limit 1`);
  const [copied, setCopied] = React.useState(false);
  if (!slug.data) return null;
  const path = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/join?school=${slug.data.slug}`;
  const url = typeof window === 'undefined' ? path : window.location.origin + path;
  return (
    <section>
      <SectionHead title="Your trial booking page" action={<a href={path} target="_blank" rel="noreferrer" className="text-[0.8125rem] font-semibold text-accent-text hover:underline">Open</a>} />
      <p className="pt-2 text-[0.875rem] text-ink-2">Put this on your website. Families book a trial, and it lands here and on the register.</p>
      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] bg-surface-2 px-2.5 py-2 text-[0.8125rem] text-ink-2">{url}</code>
        <Button size="sm" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
    </section>
  );
}
