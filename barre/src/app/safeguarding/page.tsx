'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Printer, ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { OutsideRoute, RaiseConcernSheet, StaffChecks, chronologyHtml, printPage } from '@/components/app/safeguarding';
import { Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton, Word } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import { cn } from '@/lib/cn';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort, relativeDay, time } from '@/lib/format';

const STATUS_TEXT: Record<string, string> = { open: 'text-critical', monitoring: 'text-caution', referred: 'text-info', closed: 'text-ink-3' };
const STATUS_WORD: Record<string, string> = { open: 'Open', monitoring: 'Monitoring', referred: 'Referred', closed: 'Closed' };

/** One id per look: re-reading after an action within the same look is not logged again (UR-28). */
function newOpening(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  const h = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** The safeguarding log (R-033). The owner and the named lead only; every look is recorded. */
export default function SafeguardingPage() {
  const { session } = useSession();
  const meQ = useRows<G.MyStudio>(['sg-me'], G.MY_STUDIO);
  const me = meQ.data?.[0];
  const opening = React.useMemo(newOpening, []);
  // Reading the log writes to the access log, so it runs as a (logged) write.
  const log = useQuery({ queryKey: ['sg-log', me?.id, opening], enabled: !!me?.can_read, staleTime: Infinity,
    queryFn: () => runAs(session, q => q<G.Concern>(G.LOG, [me!.id, opening])) });
  const holds = useRows<G.ConcernHold>(['sg-concern-holds', me?.id], G.CONCERN_HOLDS, [me?.id], { enabled: !!me?.can_read });
  const [open, setOpen] = React.useState<G.Concern | null>(null);
  const [raising, setRaising] = React.useState(false);
  const owner = session?.role === 'owner';
  const office = owner || session?.role === 'admin';
  return (
    <Shell title="Safeguarding" help={<>Concerns any member of staff raises go only to you and your safeguarding lead, and every time one is opened it is logged. An allegation about a member of staff is never shown to that person. Staff checks (DBS, training, first aid) remind you 30 days before they expire. Retention settings decide how long leavers’ details are kept; a legal hold stops a child’s details being anonymised.</>}
      subtitle="Concerns raised by staff" allow={['owner', 'admin', 'teacher']}
      actions={<Button size="sm" variant="primary" onClick={() => setRaising(true)}><ShieldAlert className="size-4" aria-hidden /> Record a concern</Button>}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-10">
        {meQ.isLoading && <div role="status" aria-label="Loading"><Skeleton className="h-24" /></div>}
        {meQ.error != null && <ErrorState error={meQ.error} onRetry={() => meQ.refetch()} />}
        {owner && me && !me.dsl_user_id && (
          <Notice word="Set up" tone="critical" title="Name your safeguarding lead"
            detail="Until you do, every concern comes only to you, and an allegation about you reaches nobody in the school. Staff are shown the contact outside the school below." />
        )}
        {me && !me.can_read && (
          <EmptyState title="Only the safeguarding lead and the owner read concerns"
            body="To record one — about a child, another adult or a member of staff — choose “Record a concern”. The lead and the owner are told at once."
            action={<Button onClick={() => setRaising(true)}>Record a concern</Button>} />
        )}
        {me?.can_read && (
          <Card>
            <CardHeader title="Concerns" subtitle="Each time this list or a concern is opened, it is recorded." />
            {log.isLoading && <div className="pt-3"><Skeleton className="h-24" /></div>}
            {log.error && <div className="pt-3"><ErrorState error={log.error} /></div>}
            {log.data?.length === 0 && <EmptyState title="No concerns recorded" body="When a member of staff raises one, it appears here for you and the lead." />}
            <ul className="divide-y divide-line">
              {log.data?.map(c => (
                <li key={c.id}>
                  <button onClick={() => setOpen(c)} className="block w-full py-3.5 text-left hover:bg-surface-2/60">
                    {c.immediate_risk && c.status !== 'closed' && (
                      <p className="mb-1 font-display text-[1.125rem] uppercase leading-none tracking-[-0.01em] text-critical [font-stretch:80%]">At risk</p>
                    )}
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold">{c.subject_name ?? c.student_name ?? 'Child'}</span>
                      {c.allegation && <Word tone="critical">Allegation · LADO</Word>}
                      {c.subject_kind === 'adult' && <span className="text-[0.8125rem] text-ink-3">adult</span>}
                      {holds.data?.some(h => h.concern_id === c.id) && <span className="text-[0.8125rem] font-semibold text-ink-2">On hold</span>}
                      <span className={cn('text-[0.8125rem] font-semibold', STATUS_TEXT[c.status] ?? 'text-ink-3')}>{STATUS_WORD[c.status] ?? c.status}</span>
                      <span className="ml-auto text-[0.8125rem] text-ink-3">{relativeDay(c.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.9062rem] text-ink-2">{c.summary}</p>
                    <p className="mt-1 text-[0.8125rem] text-ink-3">{G.CATEGORIES.find(x => x[0] === c.category)?.[1]} · raised by {c.raised_by} · {c.actions} action{c.actions === 1 ? '' : 's'}{c.children ? ` · children involved: ${c.children}` : ''}</p>
                    {c.routing_note && <p className={cn('mt-1 text-[0.8125rem]', c.routing_note.startsWith('Nobody') ? 'font-semibold text-critical' : 'text-ink-3')}>{c.routing_note}</p>}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {me?.can_read && <WatchCard studioId={me.id} />}
        {me?.can_read && <HoldsCard studioId={me.id} />}
        {me?.can_read && <StaffChecksCard studioId={me.id} owner={owner} />}
        {me && (owner || me.can_read) && <LeadCard me={me} owner={owner} />}
        {me && (office || me.can_read) && <MediaLinksCard me={me} canChange={owner || me.can_read} />}
        {me?.can_read && <AccessLog studioId={me.id} />}
        {me?.can_read && <ExportCard studioId={me.id} />}
      </div></div>
      {open && me && <ConcernSheet c={open} studioId={me.id} hold={holds.data?.find(h => h.concern_id === open.id) ?? null} onClose={() => setOpen(null)} />}
      {raising && <RaiseConcernSheet onClose={() => setRaising(false)} />}
    </Shell>
  );
}

function ConcernSheet({ c, hold, studioId, onClose }: { c: G.Concern; hold: G.ConcernHold | null; studioId: string; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const opening = React.useMemo(newOpening, []);
  const actions = useQuery({ queryKey: ['sg-actions', c.id, opening], staleTime: Infinity,
    queryFn: () => runAs(session, q => q<G.Action>(G.ACTIONS, [c.id, opening])) });
  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [ref, setRef] = React.useState({ to: '', on: '', ref: '', outcome: '' });
  const [saved, setSaved] = React.useState(false);
  const act = useMutation({
    mutationFn: () => runAs(session, q => q(G.RECORD_ACTION, [c.id, note, status || null,
      status === 'referred' ? ref.to : null, status === 'referred' && ref.on ? ref.on : null, status === 'referred' ? ref.ref : null, ref.outcome || null])),
    // The refresh reuses this opening, so it is not logged as another look.
    // The trail is re-read before "Saved" shows, so the new action is never missing (N-05).
    onSuccess: async () => {
      await actions.refetch();
      setNote(''); setStatus(''); setRef({ to: '', on: '', ref: '', outcome: '' }); setSaved(true);
      ['db', 'sg-log'].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
  const chronology = useMutation({
    mutationFn: async (purpose: 'print' | 'export') => ({ purpose, c: (await runAs(session, q => q<{ c: G.Chronology }>(G.CHRONOLOGY, [c.id, purpose])))[0]!.c }),
    onSuccess: ({ purpose, c: ch }) => {
      const html = chronologyHtml(ch, purpose);
      if (purpose === 'print') printPage(`Chronology ${ch.reference}`, html);
      else {
        const url = URL.createObjectURL(new Blob([`<!doctype html><meta charset="utf-8"><title>Chronology ${ch.reference}</title>${html}`], { type: 'text/html' }));
        const a = document.createElement('a');
        a.href = url; a.download = `chronology-${ch.reference}.html`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  const referring = status === 'referred';
  const canSave = note.trim().length > 2 && (!referring || ref.to.trim().length >= 2);
  return (
    <RecordSheet title={c.subject_name ?? c.student_name ?? 'Concern'} subtitle={`${dateShort(c.created_at)} · raised by ${c.raised_by}`} onClose={onClose}
      onSave={() => act.mutate()} saving={act.isPending} error={act.error ?? chronology.error} canSave={canSave} saveLabel="Record action">
      {c.allegation && (
        <p className="border-l-2 border-critical py-1 pl-3 text-[0.875rem]">
          <strong className="font-semibold text-critical">Allegation about a member of staff.</strong> Follow the LADO process: tell the local authority designated officer within one working day, and do not investigate or tell the person concerned. They cannot see this record.
        </p>
      )}
      {c.routing_note && <p className={cn('text-[0.8438rem]', c.routing_note.startsWith('Nobody') ? 'font-semibold text-critical' : 'text-ink-3')}>{c.routing_note}</p>}
      <p className="whitespace-pre-wrap border-l-2 border-ink py-1 pl-3 text-[0.9062rem]">{c.summary}</p>
      {c.subject_kind !== 'child' && <ConcernChildren concernId={c.id} names={c.children} studioId={studioId} />}
      <ol className="divide-y divide-line border-y border-line" aria-busy={actions.isFetching}>
        {actions.data?.map((a, i) => (
          <li key={i} className="py-2 text-[0.875rem]"><span className="text-[0.8125rem] text-ink-3">{dateShort(a.at)} {time(a.at)} · {a.by_name}{a.status_to ? ` · now ${a.status_to}` : ''}</span>
            <p>{a.note}</p>
            {a.referred_to && <p className="text-[0.8125rem] text-ink-2">Referred to {a.referred_to}{a.referred_on ? ` on ${dateShort(a.referred_on)}` : ''}{a.referral_ref ? ` · their reference ${a.referral_ref}` : ''}</p>}
            {a.outcome && <p className="text-[0.8125rem] text-ink-2">Outcome: {a.outcome}</p>}
          </li>
        ))}
        {actions.data?.length === 0 && <li className="py-2 text-[0.8125rem] text-ink-3">No actions yet.</li>}
      </ol>
      {saved && !act.isPending && <p role="status" className="text-[0.8125rem] font-semibold text-positive">Saved</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" loading={chronology.isPending && chronology.variables === 'print'} onClick={() => chronology.mutate('print')}>
          <Printer className="size-4" aria-hidden /> Print chronology
        </Button>
        <Button size="sm" variant="ghost" loading={chronology.isPending && chronology.variables === 'export'} onClick={() => chronology.mutate('export')}>Download chronology</Button>
        <span className="text-[0.75rem] text-ink-3">Printing and downloading are recorded in the access log.</span>
      </div>
      <ConcernHoldRow concernId={c.id} hold={hold} />
      <Field label="What was done" htmlFor="sg-n" required>
        <textarea id="sg-n" rows={3} value={note} onChange={e => { setNote(e.target.value); setSaved(false); }} className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <Field label="Status" htmlFor="sg-s">
        <Select id="sg-s" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Unchanged ({c.status})</option>
          <option value="monitoring">Monitoring</option><option value="referred">Referred</option><option value="closed">Closed</option><option value="open">Open</option>
        </Select>
      </Field>
      {referring && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Referred to" htmlFor="sg-rt" required hint="The agency, and who you spoke to.">
            <Input id="sg-rt" value={ref.to} onChange={e => setRef({ ...ref, to: e.target.value })} placeholder="e.g. Children’s services, MASH" />
          </Field>
          <Field label="Date referred" htmlFor="sg-ro" hint="Today if empty.">
            <Input id="sg-ro" type="date" value={ref.on} onChange={e => setRef({ ...ref, on: e.target.value })} />
          </Field>
          <Field label="Their reference" htmlFor="sg-rr">
            <Input id="sg-rr" value={ref.ref} onChange={e => setRef({ ...ref, ref: e.target.value })} />
          </Field>
        </div>
      )}
      <Field label="Outcome" htmlFor="sg-oc" hint="Optional. What the agency decided, when you hear.">
        <Input id="sg-oc" value={ref.outcome} onChange={e => setRef({ ...ref, outcome: e.target.value })} />
      </Field>
    </RecordSheet>
  );
}

/** Children involved in a concern about an adult or staff: the lead adds one later (N-04). */
function ConcernChildren({ concernId, names, studioId }: { concernId: string; names: string | null; studioId: string }) {
  const kids = useRows<{ id: string; name: string }>(['sg-kids', studioId], G.LEAD_CHILDREN, [studioId]);
  const link = useLeadWrite(G.LINK_CHILD);
  const [pick, setPick] = React.useState('');
  return (
    <div className="text-[0.875rem]">
      <p><span className="font-semibold">Children involved: </span>{names ?? 'none named'}</p>
      <div className="mt-1 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <Field label="Add a child involved" htmlFor={`sg-ci-${concernId}`} hint="Shown on the child’s record to you and the owner only. Logged.">
          <Select id={`sg-ci-${concernId}`} value={pick} onChange={e => setPick(e.target.value)}>
            <option value="">Choose a child</option>
            {kids.data?.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </Select>
        </Field>
        <Button size="sm" disabled={!pick} loading={link.isPending} onClick={() => link.mutate([concernId, pick, true], { onSuccess: () => setPick('') })}>Add</Button>
      </div>
      {link.error != null && <ErrorState error={link.error} />}
    </div>
  );
}

/** A legal hold on this one concern: retention never deletes it, and nothing
 *  about the person it concerns is anonymised, until it is released. */
function ConcernHoldRow({ concernId, hold }: { concernId: string; hold: G.ConcernHold | null }) {
  const set = useLeadWrite(G.SET_CONCERN_HOLD);
  const release = useLeadWrite(G.RELEASE_CONCERN_HOLD);
  const [reason, setReason] = React.useState('');
  return (
    <div className="border-b border-line pb-3">
      {hold ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[0.9062rem] font-semibold">Legal hold</span>
          <span className="text-[0.8125rem] text-ink-3">{hold.reason} · {hold.set_by}, {dateShort(hold.set_at)}</span>
          <Button size="sm" variant="ghost" className="ml-auto" loading={release.isPending} onClick={() => release.mutate([concernId])}>Release hold</Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <Field label="Legal hold on this concern" htmlFor={`sg-ch-${concernId}`} hint="Retention never deletes a held concern, including one about an adult or a member of staff. Logged.">
            <Input id={`sg-ch-${concernId}`} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. employment tribunal" />
          </Field>
          <Button size="sm" disabled={reason.trim().length < 3} loading={set.isPending}
            onClick={() => set.mutate([concernId, reason], { onSuccess: () => setReason('') })}>Place hold</Button>
        </div>
      )}
      {(set.error ?? release.error) != null && <ErrorState error={set.error ?? release.error} />}
    </div>
  );
}

function useLeadWrite(sql: string) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: unknown[]) => runAs(session, q => q(sql, params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
}

/** UR-58: attendance as a welfare signal, opt-in per child by the lead. */
function WatchCard({ studioId }: { studioId: string }) {
  const rows = useRows<G.Watch>(['sg-watch', studioId], G.WATCHES, [studioId]);
  const kids = useRows<{ id: string; name: string }>(['sg-kids', studioId], G.LEAD_CHILDREN, [studioId]);
  const set = useLeadWrite(G.SET_WATCH);
  const [pick, setPick] = React.useState('');
  const [note, setNote] = React.useState('');
  return (
    <Card>
      <CardHeader title="Watching attendance" subtitle={`Only children you choose. A run of ${G.STREAK_ALERT} or more unexplained absences is flagged; an excused absence ends the run.`} />
      {rows.error != null && <ErrorState error={rows.error} />}
      <ul className="divide-y divide-line">
        {rows.data?.map(w => (
          <li key={w.student_id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
            <span className="font-semibold">{w.name}</span>
            {w.streak >= G.STREAK_ALERT
              ? <Word tone="critical">{`${w.streak} missed in a row`}</Word>
              : <span className="text-[0.8125rem] text-ink-3">{w.streak ? `${w.streak} missed in a row` : 'No unexplained absences in a row'}</span>}
            <span className="text-[0.8125rem] text-ink-3">{w.last_present ? `Last here ${dateShort(w.last_present)}` : 'Not marked present yet'}</span>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => set.mutate([w.student_id, false, null])}>Stop watching</Button>
            {w.note && <p className="basis-full text-[0.8125rem] text-ink-3">{w.note}</p>}
          </li>
        ))}
        {rows.data?.length === 0 && <li className="py-3 text-[0.875rem] text-ink-3">No children are being watched.</li>}
      </ul>
      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Field label="Child" htmlFor="sg-w-kid">
          <Select id="sg-w-kid" value={pick} onChange={e => setPick(e.target.value)}>
            <option value="">Choose a child</option>
            {kids.data?.filter(k => !rows.data?.some(w => w.student_id === k.id)).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </Select>
        </Field>
        <Field label="Why (only you and the owner see this)" htmlFor="sg-w-note"><Input id="sg-w-note" value={note} onChange={e => setNote(e.target.value)} /></Field>
        <Button disabled={!pick} loading={set.isPending} onClick={() => set.mutate([pick, true, note], { onSuccess: () => { setPick(''); setNote(''); } })}>Watch</Button>
      </div>
      {set.error != null && <ErrorState error={set.error} />}
    </Card>
  );
}

/** UR-12: an explicit legal hold keeps a child's details from being anonymised. */
function HoldsCard({ studioId }: { studioId: string }) {
  const rows = useRows<G.Hold>(['sg-holds', studioId], G.HOLDS, [studioId]);
  const kids = useRows<{ id: string; name: string }>(['sg-kids', studioId], G.LEAD_CHILDREN, [studioId]);
  const set = useLeadWrite(G.SET_HOLD);
  const release = useLeadWrite(G.RELEASE_HOLD);
  const [pick, setPick] = React.useState('');
  const [reason, setReason] = React.useState('');
  return (
    <Card>
      <CardHeader title="Legal holds" subtitle="Retention never deletes or anonymises anything about a child with an open concern, or a closed one still kept, including their medical record. A hold does the same for any other reason, until you release it. To hold a concern about an adult or a member of staff, open the concern." />
      {rows.error != null && <ErrorState error={rows.error} />}
      <ul className="divide-y divide-line">
        {rows.data?.map(h => (
          <li key={h.student_id} className="flex flex-wrap items-baseline gap-x-3 py-2.5">
            <span className="font-semibold">{h.name}</span>
            <span className="text-[0.8125rem] text-ink-3">{h.reason} · {h.set_by}, {dateShort(h.set_at)}</span>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => release.mutate([h.student_id])}>Release</Button>
          </li>
        ))}
        {rows.data?.length === 0 && <li className="py-3 text-[0.875rem] text-ink-3">No holds.</li>}
      </ul>
      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Field label="Child" htmlFor="sg-h-kid">
          <Select id="sg-h-kid" value={pick} onChange={e => setPick(e.target.value)}>
            <option value="">Choose a child</option>
            {kids.data?.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </Select>
        </Field>
        <Field label="Reason" htmlFor="sg-h-r"><Input id="sg-h-r" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. police request to preserve" /></Field>
        <Button disabled={!pick || reason.trim().length < 3} loading={set.isPending}
          onClick={() => set.mutate([pick, reason], { onSuccess: () => { setPick(''); setReason(''); } })}>Place hold</Button>
      </div>
      {(set.error ?? release.error) != null && <ErrorState error={set.error ?? release.error} />}
      <HoldReviews studioId={studioId} />
    </Card>
  );
}

/** Each hold has a review date, so it is looked at again rather than kept for ever by default. */
function HoldReviews({ studioId }: { studioId: string }) {
  const rows = useRows<G.HoldReview>(['sg-hold-reviews', studioId], G.HOLD_REVIEWS, [studioId]);
  const review = useLeadWrite(G.REVIEW_HOLD);
  const nextYear = () => new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  if (!rows.data?.length) return null;
  return (
    <div className="mt-4 border-t border-line pt-3">
      <h3 className="text-[0.9062rem] font-semibold">Review dates</h3>
      <p className="text-[0.8125rem] text-ink-3">A hold keeps everything about that child, the medical record included. Review each one: keep it only while it is still needed.</p>
      <ul className="mt-1 divide-y divide-line text-[0.875rem]">
        {rows.data.map(h => (
          <li key={`${h.hold_kind}-${h.id}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            <span className="font-medium">{h.name}</span>
            {h.due ? <Word tone="critical">Review due</Word> : <span className="text-[0.8125rem] text-ink-3">Review by {dateShort(h.review_on)}</span>}
            <Button size="sm" variant="ghost" className="ml-auto" loading={review.isPending && review.variables?.[1] === h.id}
              onClick={() => review.mutate([h.hold_kind, h.id, nextYear()])}>Still needed: review in a year</Button>
          </li>
        ))}
      </ul>
      {review.error != null && <ErrorState error={review.error} />}
    </div>
  );
}

/** UR-41: who has no DBS on file, or a check running out. Everyone on the staff,
 *  the office and owners included (N-02); the owner records checks here too. */
function StaffChecksCard({ studioId, owner }: { studioId: string; owner: boolean }) {
  const rows = useRows<G.CheckGap>(['sg-checks', studioId], G.CHECK_SUMMARY, [studioId]);
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <Card>
      <CardHeader title="Staff checks" subtitle="Everyone on the staff, the office and the owner included." />
      {rows.isLoading && <div className="pt-3"><Skeleton className="h-16" /></div>}
      <ul className="divide-y divide-line text-[0.875rem]">
        {rows.data?.map(r => {
          const key = r.staff_id ?? r.user_id ?? r.name;
          return (
            <li key={key} className="py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-medium">{r.name}</span>
                {r.issue
                  ? <span className="font-semibold text-critical">{r.issue}{r.due ? ` · ${dateShort(r.due)}` : ''}</span>
                  : <span className="text-ink-3">DBS on file{r.dbs_expires ? ` · renew by ${dateShort(r.dbs_expires)}` : ''}</span>}
                <Button size="sm" variant="ghost" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>
                  {open === key ? 'Close' : owner ? 'Checks' : 'See checks'}
                </Button>
              </div>
              {open === key && (
                <div className="mt-2 pl-0 sm:pl-3">
                  <StaffChecks staffId={r.staff_id} userId={r.user_id} studioId={studioId} readOnly={!owner} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** UR-29: the safeguarding record, for the lead and the owner, logged. */
function ExportCard({ studioId }: { studioId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [sure, setSure] = React.useState(false);
  const exp = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ data: unknown }>(G.EXPORT, [studioId])))[0]!.data,
    onSuccess: data => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = `safeguarding-record-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSure(false);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  return (
    <Card>
      <CardHeader title="Export the safeguarding record" subtitle="Every concern and action, staff checks, legal holds, who has looked, and the audit trail, as one file. Not part of the school export." />
      <label className="mt-3 flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={sure} onChange={e => setSure(e.target.checked)} />
        I will store this file securely. The export is recorded in the access log.
      </label>
      {exp.error != null && <ErrorState error={exp.error} />}
      <Button disabled={!sure} loading={exp.isPending} onClick={() => exp.mutate()}>Download</Button>
    </Card>
  );
}

/** F1: the lead, the deputy and the route outside the school. The owner names
 *  the lead and the deputy; the owner or the lead records the outside contact. */
function LeadCard({ me, owner }: { me: G.MyStudio; owner: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const staff = useRows<{ user_id: string; full_name: string; role: string }>(['sg-staff', me.id], G.STAFF_LOGINS, [me.id], { enabled: owner });
  const write = useMutation({
    mutationFn: ({ sql, params }: { sql: string; params: unknown[] }) => runAs(session, q => q(sql, params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [route, setRoute] = React.useState<string | null>(null);
  const routeValue = route ?? me.safeguarding_outside_route ?? '';
  const role = (r: string) => r === 'admin' ? 'office' : r;
  return (
    <Card>
      <CardHeader title="Safeguarding setup" subtitle="Who reads concerns, and where staff go outside the school." />
      <div className="space-y-4 pt-3">
        {owner ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Designated Safeguarding Lead" htmlFor="sg-lead" hint="Reads and acts on every concern, alongside you.">
              <Select id="sg-lead" value={me.dsl_user_id ?? ''} onChange={e => write.mutate({ sql: G.SET_LEAD, params: [e.target.value || null] })}>
                <option value="">Not named: only owners</option>
                {staff.data?.map(s => <option key={s.user_id} value={s.user_id}>{s.full_name} ({role(s.role)})</option>)}
              </Select>
            </Field>
            <Field label="Deputy lead" htmlFor="sg-deputy" hint="Optional. Reads concerns too, so one about the lead still reaches someone.">
              <Select id="sg-deputy" value={me.dsl_deputy_user_id ?? ''} onChange={e => write.mutate({ sql: G.SET_DEPUTY, params: [e.target.value || null] })}>
                <option value="">None</option>
                {staff.data?.filter(s => s.user_id !== me.dsl_user_id).map(s => <option key={s.user_id} value={s.user_id}>{s.full_name} ({role(s.role)})</option>)}
              </Select>
            </Field>
          </div>
        ) : (
          <p className="text-[0.875rem] text-ink-2">The owner names the lead and the deputy.</p>
        )}
        {owner && !me.dsl_user_id && (
          <p className="text-[0.8125rem] text-ink-2">If you are the lead yourself, name yourself. An allegation about you then reaches only a deputy, so name one, and record the contact outside the school.</p>
        )}
        <div>
          <Field label="Contact outside the school" htmlFor="sg-route"
            hint="Your local authority designated officer (LADO) or children’s services: name, phone and email. Every member of staff sees this when they raise a concern.">
            <textarea id="sg-route" rows={2} value={routeValue} maxLength={600} onChange={e => setRoute(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
          {route !== null && route !== (me.safeguarding_outside_route ?? '') && (
            <Button size="sm" className="mt-2" loading={write.isPending}
              onClick={() => write.mutate({ sql: G.SET_OUTSIDE_ROUTE, params: [me.id, route] }, { onSuccess: () => setRoute(null) })}>Save contact</Button>
          )}
        </div>
        <OutsideRoute route={me.safeguarding_outside_route} className="border-l-2 border-line-strong py-1 pl-3" />
        {write.error != null && <ErrorState error={write.error} />}
      </div>
    </Card>
  );
}

/** N-06: material showing children cannot be an outside link while this is on (the default).
 *  Links already shared are listed here for the office, and hidden from families. */
function MediaLinksCard({ me, canChange }: { me: G.MyStudio; canChange: boolean }) {
  const rows = useRows<G.ChildMediaLink>(['sg-media-links', me.id], G.CHILD_MEDIA_LINKS, [me.id]);
  const set = useLeadWrite(G.SET_BLOCK_LINKS);
  return (
    <Card>
      <CardHeader title="Videos and photos of children" subtitle="A link to another site is only as private as that site. Uploaded files are shown only to families whose children all have consent." />
      <div className="space-y-3 pt-3">
        <label className="flex items-start gap-3 text-[0.9062rem]">
          <input type="checkbox" className="mt-0.5 size-5 accent-[var(--color-accent)]" checked={me.block_child_media_links} disabled={!canChange || set.isPending}
            onChange={e => set.mutate([me.id, e.target.checked])} />
          <span><span className="font-medium">Teachers upload material that shows children, never link to it</span>
            <span className="block text-[0.8125rem] text-ink-3">On by default. While it is on, links already shared that show children are hidden from families.{canChange ? '' : ' The owner or the safeguarding lead changes this.'}</span></span>
        </label>
        {set.error != null && <ErrorState error={set.error} />}
        {rows.data && rows.data.length > 0 && (
          <div>
            <p className="text-[0.9062rem]"><b>{rows.data.length}</b> link{rows.data.length === 1 ? '' : 's'} to another site marked as showing children:</p>
            <ul className="mt-1 divide-y divide-line text-[0.875rem]">
              {rows.data.map(r => (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-1.5">
                  <span className="min-w-0 font-medium">{r.title}</span>
                  <span className="text-[0.8125rem] text-ink-3">{r.added_by} · {dateShort(r.created_at)} · {r.hidden ? 'hidden from families' : 'families may see it'}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[0.8125rem] text-ink-3">Ask whoever added each one to upload the file instead, then remove the link from the class library.</p>
          </div>
        )}
        {rows.data?.length === 0 && <p className="text-[0.875rem] text-ink-3">No links to other sites show children.</p>}
      </div>
    </Card>
  );
}

function AccessLog({ studioId }: { studioId: string }) {
  const rows = useRows<{ who: string; what: string; at: string }>(['sg-access', studioId], G.ACCESS, [studioId]);
  return (
    <Card>
      <CardHeader title="Who has looked" subtitle="Every view, action and export, for the owner and the lead" />
      <ul className="max-h-72 divide-y divide-line overflow-y-auto text-[0.875rem]">
        {rows.data?.map((r, i) => <li key={i} className="flex justify-between gap-3 py-2"><span>{r.who} {r.what}</span>
          <span className="tnum shrink-0 text-[0.8125rem] text-ink-3">{dateShort(r.at)} {time(r.at)}</span></li>)}
        {rows.data?.length === 0 && <li className="py-3 text-ink-3">Nobody yet.</li>}
      </ul>
    </Card>
  );
}
