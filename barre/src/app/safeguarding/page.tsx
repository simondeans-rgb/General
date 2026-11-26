'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Lock } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { Badge, Card, CardHeader, EmptyState, ErrorState, Field, Select, Skeleton, type Tone } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort, relativeDay, time } from '@/lib/format';

const STATUS_TONE: Record<string, Tone> = { open: 'critical', monitoring: 'caution', referred: 'info', closed: 'neutral' };

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
      <div className="mx-auto max-w-3xl space-y-5">
        {me && !me.can_read && (
          <Card><EmptyState icon={<Lock className="size-5" />} title="Only the safeguarding lead and the owner can read concerns"
            body="To raise one, open the child from your students and choose “Raise a safeguarding concern”." /></Card>
        )}
        {me?.can_read && (
          <Card>
            <CardHeader title="Concerns" subtitle="Each time this list or a concern is opened, it is recorded." />
            {log.isLoading && <div className="p-4"><Skeleton className="h-24" /></div>}
            {log.error && <div className="p-4"><ErrorState error={log.error} /></div>}
            {log.data?.length === 0 && <EmptyState icon={<ShieldCheck className="size-5" />} title="No concerns recorded" />}
            <ul className="divide-y divide-line">
              {log.data?.map(c => (
                <li key={c.id}>
                  <button onClick={() => setOpen(c)} className="block w-full px-4 py-3 text-left hover:bg-surface-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {c.immediate_risk && c.status !== 'closed' && <Badge tone="critical">At risk</Badge>}
                      <Badge tone={STATUS_TONE[c.status] ?? 'neutral'}>{c.status}</Badge>
                      <span className="font-medium">{c.student_name ?? 'Child'}</span>
                      <span className="ml-auto text-[12.5px] text-ink-3">{relativeDay(c.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-2">{c.summary}</p>
                    <p className="mt-1 text-[12px] text-ink-3">{G.CATEGORIES.find(x => x[0] === c.category)?.[1]} · raised by {c.raised_by} · {c.actions} action{c.actions === 1 ? '' : 's'}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {owner && me && <LeadCard studioId={me.id} lead={me.dsl_user_id} />}
        {owner && me && <AccessLog studioId={me.id} />}
      </div>
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
      <p className="whitespace-pre-wrap rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm">{c.summary}</p>
      <ol className="space-y-2">
        {actions.data?.map((a, i) => (
          <li key={i} className="text-sm"><span className="text-[12px] text-ink-3">{dateShort(a.at)} {time(a.at)} · {a.by_name}{a.status_to ? ` · now ${a.status_to}` : ''}</span>
            <p>{a.note}</p></li>
        ))}
      </ol>
      <Field label="What was done" htmlFor="sg-n" required>
        <textarea id="sg-n" rows={3} value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm" />
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
    <Card className="p-4">
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
      <ul className="max-h-64 divide-y divide-line overflow-y-auto text-sm">
        {rows.data?.map((r, i) => <li key={i} className="flex justify-between px-4 py-2"><span>{r.who} {r.what}</span>
          <span className="text-[12.5px] text-ink-3">{dateShort(r.at)} {time(r.at)}</span></li>)}
        {rows.data?.length === 0 && <li className="px-4 py-3 text-ink-3">Nobody yet.</li>}
      </ul>
    </Card>
  );
}
