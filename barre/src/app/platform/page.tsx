'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Plus, Search, Copy, Check, ShieldCheck, ShieldOff, Users, MailPlus, Trash2, Clock,
} from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection, KeyValue } from '@/components/app/detail-panel';
import { RecordSheet } from '@/components/app/record-sheet';
import { InviteLink } from '@/components/app/invite-link';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as P from '@/lib/repos/platform';
import { money, dateShort, relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  trialling: { label: 'Trial', tone: 'info' },
  active:    { label: 'Active', tone: 'positive' },
  past_due:  { label: 'Payment overdue', tone: 'caution' },
  suspended: { label: 'Suspended', tone: 'critical' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

type Filter = 'all' | 'trialling' | 'active' | 'attention' | 'cancelled';

export default function PlatformPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Schools /></Suspense>;
}

function Schools() {
  const schools = useRows<P.School>(['schools'], P.SCHOOLS);
  const { selected, select } = useSelection();
  const [filter, setFilter] = React.useState<Filter>('all');
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const d = schools.data ?? [];
  const paying = d.filter(s => s.status === 'active' || s.status === 'past_due');
  const mrr = paying.reduce((n, s) => n + (s.price_minor ?? 0), 0);
  const trials = d.filter(s => s.status === 'trialling');
  const endingSoon = trials.filter(s => s.trial_ends_on && new Date(s.trial_ends_on) < new Date(Date.now() + 7 * 86_400_000));
  const attention = d.filter(s => s.status === 'past_due' || s.status === 'suspended');

  const shown = d.filter(s => {
    if (filter === 'trialling' && s.status !== 'trialling') return false;
    if (filter === 'active' && s.status !== 'active') return false;
    if (filter === 'attention' && !(s.status === 'past_due' || s.status === 'suspended')) return false;
    if (filter === 'cancelled' && s.status !== 'cancelled') return false;
    const q = query.trim().toLowerCase();
    return !q || `${s.name} ${s.owner_names ?? ''} ${s.owner_emails ?? ''}`.toLowerCase().includes(q);
  });

  return (
    <Shell title="Schools" subtitle="Every dance school on Swayvo" allow={['platform']}
      actions={<Button size="sm" variant="primary" onClick={() => setCreating(true)}>
        <Plus className="size-4" aria-hidden /> New school
      </Button>}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label="Schools" value={schools.isLoading ? null : String(d.length)} note={`${paying.length} paying`} />
          <Tile label="Monthly revenue" value={schools.isLoading ? null : money(mrr)} note="Active and overdue plans" />
          <Tile label="On trial" value={schools.isLoading ? null : String(trials.length)}
                note={endingSoon.length ? `${endingSoon.length} ending this week` : 'None ending this week'}
                onClick={() => setFilter('trialling')} />
          <Tile label="Need attention" value={schools.isLoading ? null : String(attention.length)}
                tone={attention.length ? 'caution' : undefined} note="Overdue or suspended"
                onClick={() => setFilter('attention')} />
        </div>

        <div className={cn('gap-5', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]' : 'block')}>
          <Card className="min-w-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
              <div role="tablist" aria-label="Show schools" className="-mx-1 flex gap-1 overflow-x-auto px-1">
                {([['all', 'All'], ['trialling', 'Trial'], ['active', 'Active'], ['attention', 'Need attention'], ['cancelled', 'Cancelled']] as const)
                  .map(([k, l]) => (
                    <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                      className={cn('h-9 shrink-0 rounded-full px-3 text-[13px]',
                        filter === k ? 'bg-ink font-medium text-surface' : 'text-ink-2 hover:bg-surface-2')}>{l}</button>
                  ))}
              </div>
              <label className="relative sm:ml-auto sm:w-60">
                <span className="sr-only">Search schools</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="School or owner" className="pl-9" />
              </label>
            </div>

            {schools.isLoading && <div className="space-y-2 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
            {schools.error && <div className="p-4"><ErrorState error={schools.error} onRetry={() => schools.refetch()} /></div>}
            {schools.data && shown.length === 0 && (
              <EmptyState icon={<Building2 className="size-5" />} title="No schools here"
                body={query ? 'Nothing matches that search.' : 'Schools you add appear here.'} />
            )}
            <ul className="divide-y divide-line">
              {shown.map(s => {
                const st = STATUS[s.status] ?? STATUS.active!;
                const over = s.max_students != null && s.students > s.max_students;
                return (
                  <li key={s.id}>
                    <button onClick={() => select(s.id)}
                      className={cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-surface-2 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_120px]',
                        selected === s.id && 'bg-accent-soft/50')}>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{s.name}</span>
                        <span className="block truncate text-[12.5px] text-ink-3">
                          {s.owner_names ?? (s.pending_invites ? 'Owner invited — not joined yet' : 'No owner')}
                        </span>
                      </span>
                      <span className="hidden min-w-0 text-[13px] text-ink-2 md:block">
                        {s.plan_name ?? '—'}{s.price_minor ? ` · ${money(s.price_minor)}/mo` : ''}
                      </span>
                      <span className={cn('tnum hidden text-[13px] md:block', over ? 'font-medium text-caution' : 'text-ink-2')}>
                        {s.students}{s.max_students ? ` / ${s.max_students}` : ''} students
                      </span>
                      <span className="flex justify-end">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {selected && <SchoolPanel id={selected} school={d.find(s => s.id === selected)} onClose={() => select(null)} />}
        </div>
      </div>
      {creating && <NewSchoolSheet onClose={() => setCreating(false)} onCreated={id => select(id)} />}
    </Shell>
  );
}

function Tile({ label, value, note, tone, onClick }: {
  label: string; value: string | null; note?: string; tone?: 'caution'; onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Card className="p-0">
      <Tag onClick={onClick} className={cn('block w-full rounded-[inherit] p-4 text-left', onClick && 'hover:bg-surface-2')}>
        <p className="text-[12.5px] text-ink-3">{label}</p>
        {value == null ? <Skeleton className="mt-2 h-7 w-20" /> :
          <p className={cn('tnum mt-1 text-[22px] font-semibold leading-tight tracking-[-0.02em]', tone === 'caution' && 'text-caution')}>{value}</p>}
        {note && <p className="mt-0.5 truncate text-[12.5px] text-ink-2">{note}</p>}
      </Tag>
    </Card>
  );
}

function useAction<T>(fn: (v: T) => (q: any) => Promise<unknown>, onDone?: (r: any) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: T) => runAs(session, fn(v)),
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(r); },
  });
}

// ── One school ───────────────────────────────────────────────────────────
function SchoolPanel({ id, school: s, onClose }: { id: string; school?: P.School; onClose: () => void }) {
  const router = useRouter();
  const { enterSupport } = useSession();
  const plans = useRows<P.Plan>(['plans'], P.PLANS);
  const events = useRows<P.Event>(['school-events', id], P.EVENTS, [id]);
  const invites = useRows<P.Invite>(['school-invites', id], P.INVITES, [id]);
  const amSuper = useRows<{ yes: boolean }>(['am-super'], P.AM_SUPER).data?.[0]?.yes;
  const [sheet, setSheet] = React.useState<null | 'suspend' | 'cancel' | 'erase' | 'invite'>(null);
  const [link, setLink] = React.useState<string | null>(null);

  const setPlan = useAction((code: string) => q => q(P.SET_PLAN, [id, code]));
  const setStatus = useAction((v: { status: string; reason?: string }) => q => q(P.SET_STATUS, [id, v.status, v.reason ?? null]));
  const extend = useAction((days: number) => q => q(P.EXTEND_TRIAL, [id, days]));
  const reissue = useAction((i: P.Invite) => q => q(P.INVITE, [id, i.email, i.role, i.full_name]),
    rows => setLink(P.inviteLink(rows[0].token)));
  const revoke = useAction((inviteId: string) => q => q(P.REVOKE_INVITE, [inviteId]));
  const support = useAction(() => q => q(P.START_SUPPORT, [id]), rows => {
    enterSupport({ studioId: id, studioName: s!.name, until: new Date(rows[0].until).toISOString() });
    router.push('/today');
  });

  if (!s) return <DetailPanel open onClose={onClose} title="School"><Skeleton className="h-40" /></DetailPanel>;
  const st = STATUS[s.status] ?? STATUS.active!;
  const error = setPlan.error ?? setStatus.error ?? extend.error ?? reissue.error ?? revoke.error ?? support.error;
  const liveInvites = invites.data?.filter(i => !i.accepted_at && !i.revoked_at && new Date(i.expires_at) > new Date()) ?? [];
  const canErase = s.status === 'cancelled' && s.data_deletion_due_on && new Date(s.data_deletion_due_on) <= new Date();

  return (
    <DetailPanel open onClose={onClose} title={s.name} subtitle={`${s.slug} · joined ${dateShort(s.created_at)}`}>
      <div className="mb-5 rounded-[var(--radius-lg)] bg-surface-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={st.tone}>{st.label}</Badge>
          {s.status === 'trialling' && s.trial_ends_on && <span className="text-[13px] text-ink-2">ends {dateShort(s.trial_ends_on)}</span>}
          {s.status === 'cancelled' && s.data_deletion_due_on && <span className="text-[13px] text-ink-2">data deleted from {dateShort(s.data_deletion_due_on)}</span>}
        </div>
        {s.status_reason && <p className="mt-2 text-sm text-ink-2">{s.status_reason}</p>}
        {/* The actions that make sense from where the account is now. */}
        <div className="mt-3 flex flex-wrap gap-2">
          {s.status === 'trialling' && <>
            <Button size="sm" variant="primary" loading={setStatus.isPending} onClick={() => setStatus.mutate({ status: 'active' })}>Start paid plan</Button>
            <Button size="sm" loading={extend.isPending} onClick={() => extend.mutate(14)}><Clock className="size-3.5" aria-hidden /> Extend trial 14 days</Button>
          </>}
          {s.status === 'active' && <Button size="sm" onClick={() => setStatus.mutate({ status: 'past_due' })}>Mark payment overdue</Button>}
          {s.status === 'past_due' && <Button size="sm" variant="primary" onClick={() => setStatus.mutate({ status: 'active' })}>Mark paid</Button>}
          {(s.status === 'suspended' || s.status === 'cancelled') &&
            <Button size="sm" variant="primary" loading={setStatus.isPending} onClick={() => setStatus.mutate({ status: 'active' })}>Reinstate</Button>}
          {['trialling', 'active', 'past_due'].includes(s.status) && <Button size="sm" variant="ghost" onClick={() => setSheet('suspend')}>Suspend</Button>}
          {s.status !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => setSheet('cancel')}>Cancel account</Button>}
          {canErase && amSuper && <Button size="sm" variant="danger" onClick={() => setSheet('erase')}><Trash2 className="size-3.5" aria-hidden /> Erase data</Button>}
        </div>
      </div>
      {error != null && <div className="mb-4"><ErrorState error={error} /></div>}

      <DetailSection title="Plan">
        <div className="flex gap-2">
          <Select aria-label="Plan" value={s.plan_code ?? ''} onChange={e => setPlan.mutate(e.target.value)} disabled={setPlan.isPending}>
            {plans.data?.filter(p => p.active).map(p => (
              <option key={p.code} value={p.code}>{p.name} — {p.price_minor ? `${money(p.price_minor)}/mo` : 'free'}</option>
            ))}
          </Select>
        </div>
        <div className="mt-3 space-y-2.5">
          <Usage label="Students" used={s.students} cap={s.max_students} />
          <Usage label="Locations" used={s.locations} cap={s.max_locations} />
          <Usage label="Staff" used={s.staff} cap={s.max_staff} />
        </div>
      </DetailSection>

      <DetailSection title="Owner">
        <KeyValue rows={[
          ['Name', s.owner_names],
          ['Email', s.owner_emails],
        ]} />
      </DetailSection>

      <DetailSection title="People with access" action={
        <Button size="sm" variant="ghost" onClick={() => setSheet('invite')}><MailPlus className="size-3.5" aria-hidden /> Invite owner or admin</Button>}>
        <p className="flex flex-wrap gap-1.5 text-sm">
          <Badge tone="accent">{s.owners} owner{s.owners === 1 ? '' : 's'}</Badge>
          <Badge tone="info">{s.admins} admin{s.admins === 1 ? '' : 's'}</Badge>
          <Badge tone="teal">{s.teachers} teacher{s.teachers === 1 ? '' : 's'}</Badge>
          <Badge tone="rose">{s.guardians} parent{s.guardians === 1 ? '' : 's'}</Badge>
          <Badge tone="amber">{s.student_logins} student{s.student_logins === 1 ? '' : 's'}</Badge>
        </p>
        <p className="mt-2 text-[12.5px] text-ink-3">
          Swayvo sees how many — the school manages who, from its Account page.
        </p>
        {liveInvites.length > 0 && (
          <ul className="mt-3 space-y-2">
            {liveInvites.map(i => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{i.full_name ?? i.email} <span className="text-ink-3">· invited as {i.role}</span></span>
                  <span className="block text-[12px] text-ink-3">{i.email} · sent {relativeDay(i.created_at)} · expires {dateShort(i.expires_at)}</span>
                </span>
                <Button size="sm" onClick={() => reissue.mutate(i)} loading={reissue.isPending}>New link</Button>
                <Button size="sm" variant="ghost" onClick={() => revoke.mutate(i.id)}>Withdraw</Button>
              </li>
            ))}
          </ul>
        )}
        {link && <InviteLink link={link} />}
      </DetailSection>

      <DetailSection title="Support access">
        {s.support_until ? (
          <div className="rounded-[var(--radius-md)] border border-positive/30 bg-positive-soft p-3">
            <p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-positive" aria-hidden />
              Granted by the owner until {dateShort(s.support_until)} {time(s.support_until)}</p>
            <p className="mt-1 text-[12.5px] text-ink-2">A read-only view of the school as an administrator sees it, without health records. Opening it is logged on the school’s record.</p>
            <Button size="sm" variant="primary" className="mt-2.5" loading={support.isPending} onClick={() => support.mutate(undefined)}>
              Open read-only view
            </Button>
          </div>
        ) : (
          <p className="flex items-start gap-2 text-sm text-ink-2">
            <ShieldOff className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
            Not granted. The owner can let Swayvo support in for up to a week from their Account page.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Account history">
        {events.data?.length === 0 && <p className="text-sm text-ink-3">Nothing yet.</p>}
        <ol className="space-y-2">
          {events.data?.map((e, n) => (
            <li key={n} className="text-sm">
              <span className="block">{e.summary ?? e.action}</span>
              <span className="block text-[12px] text-ink-3">{e.actor ?? 'System'} · {relativeDay(e.at)} {time(e.at)}</span>
            </li>
          ))}
        </ol>
      </DetailSection>

      {sheet === 'suspend' && <ReasonSheet title={`Suspend ${s.name}?`}
        body="Everyone at the school can still sign in and read, and the owner can export their data, but nothing can be changed until you reinstate them."
        label="Reason the owner will see" confirm="Suspend"
        onClose={() => setSheet(null)} onConfirm={reason => setStatus.mutateAsync({ status: 'suspended', reason }).then(() => setSheet(null))} />}
      {sheet === 'cancel' && <ReasonSheet title={`Cancel ${s.name}?`}
        body="The account becomes read-only. The owner has 30 days to export everything; after that the data can be erased."
        label="Reason" confirm="Cancel account"
        onClose={() => setSheet(null)} onConfirm={reason => setStatus.mutateAsync({ status: 'cancelled', reason }).then(() => setSheet(null))} />}
      {sheet === 'erase' && <EraseSheet school={s} onClose={() => { setSheet(null); onClose(); }} />}
      {sheet === 'invite' && <InviteSheet studioId={id} onClose={() => setSheet(null)} />}
    </DetailPanel>
  );
}

function Usage({ label, used, cap }: { label: string; used: number; cap: number | null }) {
  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const over = cap != null && used > cap;
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className={cn('tnum', over && 'font-medium text-caution')}>{used}{cap ? ` of ${cap}` : ' · no limit'}{over ? ' — over the limit' : ''}</span>
      </div>
      {cap != null && (
        <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-caution' : 'bg-accent')} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function ReasonSheet({ title, body, label, confirm, onClose, onConfirm }: {
  title: string; body: string; label: string; confirm: string; onClose: () => void; onConfirm: (r: string) => Promise<unknown>;
}) {
  const [reason, setReason] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  return (
    <RecordSheet title={title} subtitle={body} onClose={onClose} saveLabel={confirm} saving={busy} error={error}
      canSave={reason.trim().length >= 3}
      onSave={async () => { setBusy(true); try { await onConfirm(reason.trim()); } catch (e) { setError(e); } finally { setBusy(false); } }}>
      <Field label={label} htmlFor="rs-r" required>
        <Input id="rs-r" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} />
      </Field>
    </RecordSheet>
  );
}

function EraseSheet({ school, onClose }: { school: P.School; onClose: () => void }) {
  const [name, setName] = React.useState('');
  const erase = useAction(() => q => q(P.PURGE, [school.id, name]), onClose);
  return (
    <RecordSheet title={`Erase ${school.name}?`}
      subtitle="Every family, child, health record, register and invoice is deleted permanently. This cannot be undone."
      onClose={onClose} onSave={() => erase.mutate(undefined)} saving={erase.isPending} error={erase.error}
      canSave={name === school.name} saveLabel="Erase permanently">
      <Field label={`Type ${school.name} to confirm`} htmlFor="er-n" required>
        <Input id="er-n" value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
      </Field>
    </RecordSheet>
  );
}

function InviteSheet({ studioId, onClose }: { studioId: string; onClose: () => void }) {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'owner' | 'admin'>('owner');
  const [link, setLink] = React.useState<string | null>(null);
  const invite = useAction(() => q => q(P.INVITE, [studioId, email.trim(), role, name.trim() || null]),
    rows => setLink(P.inviteLink(rows[0].token)));
  if (link) {
    return <RecordSheet title="Invitation ready" onClose={onClose} onSave={onClose} saveLabel="Done"><InviteLink link={link} /></RecordSheet>;
  }
  return (
    <RecordSheet title="Invite an owner or administrator" onClose={onClose} onSave={() => invite.mutate(undefined)}
      saving={invite.isPending} error={invite.error} canSave={/^\S+@\S+\.\S+$/.test(email.trim())} saveLabel="Create invitation">
      <Field label="Role" htmlFor="iv-r">
        <Select id="iv-r" value={role} onChange={e => setRole(e.target.value as 'owner' | 'admin')}>
          <option value="owner">Owner — everything, including billing and who has access</option>
          <option value="admin">Administrator — day-to-day running</option>
        </Select>
      </Field>
      <Field label="Name" htmlFor="iv-n"><Input id="iv-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Email" htmlFor="iv-e" required>
        <Input id="iv-e" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

function NewSchoolSheet({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const plans = useRows<P.Plan>(['plans'], P.PLANS);
  const [name, setName] = React.useState('');
  const [owner, setOwner] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [plan, setPlan] = React.useState('trial');
  const [trial, setTrial] = React.useState('30');
  const [made, setMade] = React.useState<{ id: string; link: string } | null>(null);
  const create = useAction(() => q => q(P.CREATE_SCHOOL, [name.trim(), owner.trim(), email.trim(), plan, Number(trial)]),
    rows => setMade({ id: rows[0].studio_id, link: P.inviteLink(rows[0].invitation_token) }));

  if (made) {
    return (
      <RecordSheet title={`${name} is set up`} subtitle={`Send ${owner.split(' ')[0]} this link. They choose a password, then the setup wizard walks them through the rest.`}
        onClose={() => { onCreated(made.id); onClose(); }} onSave={() => { onCreated(made.id); onClose(); }} saveLabel="Done">
        <InviteLink link={made.link} />
      </RecordSheet>
    );
  }
  const valid = name.trim().length >= 2 && owner.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim());
  return (
    <RecordSheet title="New school" subtitle="Creates the account and an invitation for its owner."
      onClose={onClose} onSave={() => create.mutate(undefined)} saving={create.isPending} error={create.error}
      canSave={valid} saveLabel="Create school">
      <Field label="School name" htmlFor="ns-n" required><Input id="ns-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Owner’s name" htmlFor="ns-o" required><Input id="ns-o" value={owner} onChange={e => setOwner(e.target.value)} /></Field>
      <Field label="Owner’s email" htmlFor="ns-e" required><Input id="ns-e" type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Plan" htmlFor="ns-p">
          <Select id="ns-p" value={plan} onChange={e => setPlan(e.target.value)}>
            {plans.data?.filter(p => p.active).map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Free trial (days)" htmlFor="ns-t" hint="0 for none">
          <Input id="ns-t" type="number" min={0} max={90} value={trial} onChange={e => setTrial(e.target.value)} />
        </Field>
      </div>
    </RecordSheet>
  );
}
