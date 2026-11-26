'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { EmptyState, ErrorState, Field, Select, Skeleton } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import { cn } from '@/lib/cn';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort, relativeDay, time } from '@/lib/format';

const STATUS_TEXT: Record<string, string> = { open: 'text-critical', monitoring: 'text-caution', referred: 'text-info', closed: 'text-ink-3' };
const STATUS_WORD: Record<string, string> = { open: 'Open', monitoring: 'Monitoring', referred: 'Referred', closed: 'Closed' };

/** The safeguarding log (R-033). The owner and the named lead only; every look is recorded. */
export default function SafeguardingPage() {
  const { session } = useSession();
  const me = useRows<{ id: string; dsl_user_id: string | null; can_read: boolean }>(['sg-me'], G.MY_STUDIO).data?.[0];
  // Reading the log writes to the access log, so it runs as a (logged) write.
  const log = useQuery({ queryKey: ['sg-log', me?.id], enabled: !!me?.can_read, staleTime: Infinity,
    queryFn: () => runAs(session, q => q<G.Concern>(G.LOG, [me!.id])) });
  const [open, setOpen] = React.useState<G.Concern | null>(null);
  const owner = session?.role === 'owner';
  return (
    <Shell title="Safeguarding" help={<>Concerns any member of staff raises go only to you and your safeguarding lead, and every time one is opened it is logged. Staff checks (DBS, training, first aid) remind you 30 days before they expire. Retention settings decide how long leavers’ details are kept.</>} subtitle="Concerns raised by staff" allow={['owner', 'admin', 'teacher']}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-10">
        {me && !me.can_read && (
          <EmptyState title="Only the safeguarding lead and the owner read concerns"
            body="To raise one, open the child from your students and choose “Raise a safeguarding concern”." />
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
                      <p className="mb-1 font-display text-[18px] uppercase leading-none tracking-[-0.01em] text-critical [font-stretch:80%]">At risk</p>
                    )}
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold">{c.student_name ?? 'Child'}</span>
                      <span className={cn('text-[13px] font-semibold', STATUS_TEXT[c.status] ?? 'text-ink-3')}>{STATUS_WORD[c.status] ?? c.status}</span>
                      <span className="ml-auto text-[13px] text-ink-3">{relativeDay(c.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14.5px] text-ink-2">{c.summary}</p>
                    <p className="mt-1 text-[13px] text-ink-3">{G.CATEGORIES.find(x => x[0] === c.category)?.[1]} · raised by {c.raised_by} · {c.actions} action{c.actions === 1 ? '' : 's'}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {owner && me && <LeadCard studioId={me.id} lead={me.dsl_user_id} />}
        {owner && me && <AccessLog studioId={me.id} />}
      </div></div>
      {open && <ConcernSheet c={open} onClose={() => setOpen(null)} />}
    </Shell>
  );
}

function ConcernSheet({ c, onClose }: { c: G.Concern; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const actions = useQuery({ queryKey: ['sg-actions', c.id], staleTime: Infinity,
    queryFn: () => runAs(session, q => q<{ note: string; status_to: string | null; by_name: string; at: string }>(G.ACTIONS, [c.id])) });
  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState('');
  const act = useMutation({
    mutationFn: () => runAs(session, q => q(G.ACT, [c.id, note, status || null])),
    onSuccess: () => { setNote(''); setStatus(''); ['db', 'sg-log', 'sg-actions'].forEach(k => qc.invalidateQueries({ queryKey: [k] })); },
  });
  return (
    <RecordSheet title={c.student_name ?? 'Concern'} subtitle={`${dateShort(c.created_at)} · raised by ${c.raised_by}`} onClose={onClose}
      onSave={() => act.mutate()} saving={act.isPending} error={act.error} canSave={note.trim().length > 2} saveLabel="Record action">
      <p className="whitespace-pre-wrap border-l-2 border-ink py-1 pl-3 text-[14.5px]">{c.summary}</p>
      <ol className="divide-y divide-line border-y border-line">
        {actions.data?.map((a, i) => (
          <li key={i} className="py-2 text-[14px]"><span className="text-[13px] text-ink-3">{dateShort(a.at)} {time(a.at)} · {a.by_name}{a.status_to ? ` · now ${a.status_to}` : ''}</span>
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
      <CardHeader title="Who has looked" subtitle="Every view and action on the log" />
      <ul className="max-h-72 divide-y divide-line overflow-y-auto text-[14px]">
        {rows.data?.map((r, i) => <li key={i} className="flex justify-between gap-3 py-2"><span>{r.who} {r.what}</span>
          <span className="tnum shrink-0 text-[13px] text-ink-3">{dateShort(r.at)} {time(r.at)}</span></li>)}
        {rows.data?.length === 0 && <li className="py-3 text-ink-3">Nobody yet.</li>}
      </ul>
    </Card>
  );
}
