'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { RaiseConcernSheet } from '@/components/app/safeguarding';
import { Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, Word } from '@/components/ui';
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
  const meQ = useRows<{ id: string; dsl_user_id: string | null; can_read: boolean }>(['sg-me'], G.MY_STUDIO);
  const me = meQ.data?.[0];
  const opening = React.useMemo(newOpening, []);
  // Reading the log writes to the access log, so it runs as a (logged) write.
  const log = useQuery({ queryKey: ['sg-log', me?.id, opening], enabled: !!me?.can_read, staleTime: Infinity,
    queryFn: () => runAs(session, q => q<G.Concern>(G.LOG, [me!.id, opening])) });
  const [open, setOpen] = React.useState<G.Concern | null>(null);
  const [raising, setRaising] = React.useState(false);
  const owner = session?.role === 'owner';
  return (
    <Shell title="Safeguarding" help={<>Concerns any member of staff raises go only to you and your safeguarding lead, and every time one is opened it is logged. An allegation about a member of staff is never shown to that person. Staff checks (DBS, training, first aid) remind you 30 days before they expire. Retention settings decide how long leavers’ details are kept; a legal hold stops a child’s details being anonymised.</>}
      subtitle="Concerns raised by staff" allow={['owner', 'admin', 'teacher']}
      actions={<Button size="sm" variant="primary" onClick={() => setRaising(true)}><ShieldAlert className="size-4" aria-hidden /> Record a concern</Button>}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-10">
        {meQ.isLoading && <div role="status" aria-label="Loading"><Skeleton className="h-24" /></div>}
        {meQ.error != null && <ErrorState error={meQ.error} onRetry={() => meQ.refetch()} />}
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
                      <span className={cn('text-[0.8125rem] font-semibold', STATUS_TEXT[c.status] ?? 'text-ink-3')}>{STATUS_WORD[c.status] ?? c.status}</span>
                      <span className="ml-auto text-[0.8125rem] text-ink-3">{relativeDay(c.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.9062rem] text-ink-2">{c.summary}</p>
                    <p className="mt-1 text-[0.8125rem] text-ink-3">{G.CATEGORIES.find(x => x[0] === c.category)?.[1]} · raised by {c.raised_by} · {c.actions} action{c.actions === 1 ? '' : 's'}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {me?.can_read && <WatchCard studioId={me.id} />}
        {me?.can_read && <HoldsCard studioId={me.id} />}
        {me?.can_read && <StaffChecksCard studioId={me.id} />}
        {owner && me && <LeadCard studioId={me.id} lead={me.dsl_user_id} />}
        {me?.can_read && <AccessLog studioId={me.id} />}
        {me?.can_read && <ExportCard studioId={me.id} />}
      </div></div>
      {open && <ConcernSheet c={open} onClose={() => setOpen(null)} />}
      {raising && <RaiseConcernSheet onClose={() => setRaising(false)} />}
    </Shell>
  );
}

function ConcernSheet({ c, onClose }: { c: G.Concern; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const opening = React.useMemo(newOpening, []);
  const actions = useQuery({ queryKey: ['sg-actions', c.id, opening], staleTime: Infinity,
    queryFn: () => runAs(session, q => q<{ note: string; status_to: string | null; by_name: string; at: string }>(G.ACTIONS, [c.id, opening])) });
  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState('');
  const act = useMutation({
    mutationFn: () => runAs(session, q => q(G.ACT, [c.id, note, status || null])),
    // The refresh reuses this opening, so it is not logged as another look.
    onSuccess: () => { setNote(''); setStatus(''); ['db', 'sg-log', 'sg-actions'].forEach(k => qc.invalidateQueries({ queryKey: [k] })); },
  });
  return (
    <RecordSheet title={c.subject_name ?? c.student_name ?? 'Concern'} subtitle={`${dateShort(c.created_at)} · raised by ${c.raised_by}`} onClose={onClose}
      onSave={() => act.mutate()} saving={act.isPending} error={act.error} canSave={note.trim().length > 2} saveLabel="Record action">
      {c.allegation && (
        <p className="border-l-2 border-critical py-1 pl-3 text-[0.875rem]">
          <strong className="font-semibold text-critical">Allegation about a member of staff.</strong> Follow the LADO process: tell the local authority designated officer within one working day, and do not investigate or tell the person concerned. They cannot see this record.
        </p>
      )}
      <p className="whitespace-pre-wrap border-l-2 border-ink py-1 pl-3 text-[0.9062rem]">{c.summary}</p>
      <ol className="divide-y divide-line border-y border-line">
        {actions.data?.map((a, i) => (
          <li key={i} className="py-2 text-[0.875rem]"><span className="text-[0.8125rem] text-ink-3">{dateShort(a.at)} {time(a.at)} · {a.by_name}{a.status_to ? ` · now ${a.status_to}` : ''}</span>
            <p>{a.note}</p></li>
        ))}
      </ol>
      <Field label="What was done" htmlFor="sg-n" required>
        <textarea id="sg-n" rows={3} value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <Field label="Status" htmlFor="sg-s">
        <Select id="sg-s" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Unchanged ({c.status})</option>
          <option value="monitoring">Monitoring</option><option value="referred">Referred</option><option value="closed">Closed</option><option value="open">Open</option>
        </Select>
      </Field>
    </RecordSheet>
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
      <CardHeader title="Legal holds" subtitle="Retention never anonymises a child with an open concern, or a closed one still kept. A hold does the same for any other reason, until you release it." />
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
    </Card>
  );
}

/** UR-41: who has no DBS on file, or a check running out. */
function StaffChecksCard({ studioId }: { studioId: string }) {
  const rows = useRows<G.CheckGap>(['sg-checks', studioId], G.CHECK_SUMMARY, [studioId]);
  return (
    <Card>
      <CardHeader title="Staff checks" subtitle="The owner records checks on each person’s staff record." />
      {rows.isLoading && <div className="pt-3"><Skeleton className="h-16" /></div>}
      <ul className="divide-y divide-line text-[0.875rem]">
        {rows.data?.map(r => (
          <li key={r.staff_id} className="flex flex-wrap justify-between gap-x-3 py-2">
            <span className="font-medium">{r.name}</span>
            {r.issue
              ? <span className="font-semibold text-critical">{r.issue}{r.due ? ` · ${dateShort(r.due)}` : ''}</span>
              : <span className="text-ink-3">DBS on file{r.dbs_expires ? ` · renew by ${dateShort(r.dbs_expires)}` : ''}</span>}
          </li>
        ))}
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

function LeadCard({ studioId, lead }: { studioId: string; lead: string | null }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const staff = useRows<{ user_id: string; full_name: string; role: string }>(['sg-staff', studioId], G.STAFF_LOGINS, [studioId]);
  const set = useMutation({
    mutationFn: (u: string | null) => runAs(session, q => q(G.SET_LEAD, [u])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  return (
    <Card>
      <CardHeader title="Safeguarding lead" />
      <div className="pt-3" />
      <Field label="Designated Safeguarding Lead" htmlFor="sg-lead" hint="Reads and acts on every concern, alongside you.">
        <Select id="sg-lead" value={lead ?? ''} onChange={e => set.mutate(e.target.value || null)}>
          <option value="">Not named — only owners</option>
          {staff.data?.map(s => <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>)}
        </Select>
      </Field>
      {set.error != null && <ErrorState error={set.error} />}
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
