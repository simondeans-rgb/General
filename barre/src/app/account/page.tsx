'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, MailPlus, ShieldOff, UserMinus, CheckCircle2 } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RetentionCard } from '@/components/app/safeguarding';
import { HistoryCard } from '@/components/app/history-card';
import { RecordSheet } from '@/components/app/record-sheet';
import { InviteLink } from '@/components/app/invite-link';
import { BrandSettings, ImagerySettings } from '@/components/app/brand-settings';
import { useRows } from '@/lib/query';
import { runAs, readAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import {
  Beats, Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import * as A from '@/lib/repos/account';
import { inviteLink } from '@/lib/repos/platform';
import { money, dateShort, relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';

const ROLE: Record<string, { label: string; plural: string; tone: Tone; does: string }> = {
  owner:    { label: 'Owner', plural: 'Owners', tone: 'accent', does: 'Everything, including the account, billing and who has access' },
  admin:    { label: 'Administrator', plural: 'Administrators', tone: 'info', does: 'Day-to-day running: people, classes, billing, messages' },
  teacher:  { label: 'Teacher', plural: 'Teachers', tone: 'teal', does: 'Their own classes and registers, and a safety brief for their students' },
  guardian: { label: 'Parent', plural: 'Parents', tone: 'rose', does: 'Their own family: children, schedule, payments, messages' },
  student:  { label: 'Student', plural: 'Students', tone: 'amber', does: 'Their own timetable, feedback and class material' },
};

const STATUS: Record<string, string> = {
  trialling: 'Free trial', active: 'Active', past_due: 'Payment overdue', suspended: 'Paused', cancelled: 'Closed',
};

/**
 * The school's own account: what it is on, who can get in, whether Swayvo
 * support may look, and its data to take away. Owners and administrators.
 */
export default function AccountPage() {
  const { session } = useSession();
  const acct = useRows<A.AccountRow>(['account'], A.ACCOUNT).data?.[0];
  const isOwner = session?.role === 'owner';

  return (
    <Shell title="Account" subtitle={acct ? `${acct.name} · ${STATUS[acct.status] ?? acct.status}` : undefined}
      allow={['owner', 'admin']}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-12">
        <BrandSettings canEdit={isOwner && !session?.platform} />
        <ImagerySettings canEdit={isOwner && !session?.platform} />
        <PlanCard acct={acct} />
        <Team isOwner={isOwner} studioId={acct?.id} />
        {isOwner && !session?.platform && <HistoryCard />}
        {isOwner && !session?.platform && acct && <SupportCard studioId={acct.id} />}
        {isOwner && !session?.platform && acct && <RetentionCard studioId={acct.id} />}
        {isOwner && !session?.platform && <ExportCard name={acct?.name} />}
      </div></div>
    </Shell>
  );
}

function PlanCard({ acct }: { acct?: A.AccountRow }) {
  if (!acct) return <Card><Skeleton className="h-24" /></Card>;
  const rows: [string, number, number | null][] = [
    ['Students', acct.students, acct.max_students],
    ['Locations', acct.locations, acct.max_locations],
    ['Staff', acct.staff, acct.max_staff],
  ];
  return (
    <Card>
      <CardHeader title="Plan" subtitle={acct.plan_name
        ? `${acct.plan_name}${acct.price_minor ? ` · ${money(acct.price_minor)} a month` : ''}` : 'No plan set'} />
      <div className="space-y-4 pt-3">
        {acct.status === 'trialling' && acct.trial_ends_on && (
          <p className="text-[0.9062rem] text-ink-2">Your free trial runs until <strong className="font-semibold text-ink">{dateShort(acct.trial_ends_on)}</strong>.</p>
        )}
        {acct.status_reason && (acct.status === 'suspended' || acct.status === 'cancelled' || acct.status === 'past_due') && (
          <p className="border-l-2 border-caution py-1 pl-3 text-[0.9062rem]"><strong className="font-semibold text-caution">{STATUS[acct.status]}.</strong> {acct.status_reason}</p>
        )}
        <dl className="grid grid-cols-3 gap-4">
          {rows.map(([label, used, cap]) => {
            const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;
            return (
              <div key={label} className="min-w-0">
                <dt className="label">{label}</dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="stat-number text-[1.625rem] leading-none">{used}</span>
                  <span className="tnum text-[0.8125rem] text-ink-3">{cap ? `of ${cap}` : 'no limit'}</span>
                </dd>
                {cap != null && <dd className="mt-2"><Beats value={used} max={cap} tone={pct >= 90 ? 'caution' : 'accent'} label={`${used} of ${cap} ${label.toLowerCase()}`} />
                  {pct >= 90 && <span className="ml-2 text-[0.8125rem] font-semibold text-caution">Nearly full</span>}</dd>}
              </div>
            );
          })}
        </dl>
        <p className="text-[0.8125rem] text-ink-3">Students on the plan are every child record the school holds, including trial children and those who have left; Reports counts only those in a class now.</p>
        <p className="text-[0.8125rem] text-ink-3">To change plan, contact Swayvo. Nothing is ever deleted for being over a limit — you just cannot add more.</p>
      </div>
    </Card>
  );
}

// ── Who has access ───────────────────────────────────────────────────────
function Team({ isOwner, studioId }: { isOwner: boolean; studioId?: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const members = useRows<A.Member>(['members'], A.MEMBERS);
  const invites = useRows<A.Invitation>(['invitations'], A.INVITATIONS);
  const [inviting, setInviting] = React.useState(false);
  const [removing, setRemoving] = React.useState<A.Member | null>(null);
  const [tab, setTab] = React.useState<'staff' | 'families'>('staff');
  const [link, setLink] = React.useState<string | null>(null);

  const act = useMutation({
    mutationFn: (fn: (q: any) => Promise<unknown>) => runAs(session, fn),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const reissue = useMutation({
    mutationFn: (i: A.Invitation) => runAs(session, q => q<{ token: string }>(A.INVITE,
      [studioId, i.email, i.role, i.full_name, i.family_id, i.student_id])),
    onSuccess: rows => { setLink(inviteLink(rows[0]!.token)); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const staffRoles = ['owner', 'admin', 'teacher'];
  const shown = (members.data ?? []).filter(m => (tab === 'staff') === staffRoles.includes(m.role));
  const groups = Object.keys(ROLE).map(r => [r, shown.filter(m => m.role === r)] as const).filter(([, l]) => l.length);
  const canRemove = (m: A.Member) => !m.is_me && (isOwner || ['teacher', 'guardian', 'student'].includes(m.role));
  const count = (roles: string[]) => members.data?.filter(m => roles.includes(m.role)).length ?? 0;

  return (
    <Card>
      <CardHeader title="People with access" subtitle="Everyone who can sign in to this school, and what their role lets them do"
        action={!session?.platform && <Button size="sm" onClick={() => setInviting(true)}>
          <MailPlus className="size-4" aria-hidden /> Invite
        </Button>} />
      <div role="tablist" aria-label="People with access" className="flex gap-1 border-b border-line">
        {([['staff', 'Staff', count(staffRoles)], ['families', 'Parents and students', count(['guardian', 'student'])]] as const).map(([k, l, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn('-mb-px h-11 border-b-2 px-2.5 text-[0.875rem]', tab === k ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-2 hover:text-ink')}>
            {l} <span className="tnum text-[0.75rem] text-ink-3">{n}</span>
          </button>
        ))}
      </div>
      {act.error != null && <div className="pt-3"><ErrorState error={act.error} /></div>}
      {members.isLoading && <div className="space-y-2 pt-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
      {members.data && shown.length === 0 && <EmptyState title="Nobody here yet"
        body={tab === 'families' ? 'Invite parents from here, or from a family’s record.' : 'Invite your team.'} />}
      {groups.map(([role, list]) => (
        <section key={role} aria-label={ROLE[role]!.plural}>
          <div className="mt-5 border-b border-line pb-1.5">
            <h3 className="text-[0.875rem] font-semibold">{ROLE[role]!.plural} <span className="tnum font-normal text-ink-3">{list.length}</span></h3>
            <p className="text-[0.8125rem] text-ink-3">{ROLE[role]!.does}</p>
          </div>
          <ul className="divide-y divide-line">
            {list.map(m => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{m.full_name}{m.is_me && <span className="font-normal text-ink-3"> (you)</span>}</span>
                  <span className="block truncate text-[0.8125rem] text-ink-3">{m.email}{m.detail ? ` · ${m.detail}` : ''}</span>
                </span>
                {isOwner && staffRoles.includes(m.role) && !session?.platform ? (
                  <Select aria-label={`Role for ${m.full_name}`} className="h-9 w-[150px] text-[0.8125rem]" value={m.role}
                    onChange={e => act.mutate(q => q(A.SET_ROLE, [m.id, e.target.value]))}>
                    <option value="owner">Owner</option>
                    <option value="admin">Administrator</option>
                    <option value="teacher">Teacher</option>
                  </Select>
                ) : <span className="text-[0.8125rem] text-ink-2">{ROLE[m.role]!.label}</span>}
                {canRemove(m) && !session?.platform && (
                  <Button size="sm" variant="ghost" aria-label={`Remove ${m.full_name}’s access`} onClick={() => setRemoving(m)}>
                    <UserMinus className="size-4" aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!!invites.data?.length && (
        <div className="mt-6">
          <h3 className="border-b border-line pb-1.5 text-[0.875rem] font-semibold">Invited, not joined yet <span className="tnum font-normal text-ink-3">{invites.data.length}</span></h3>
          <ul className="divide-y divide-line">
            {invites.data.map(i => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate"><span className="font-semibold">{i.full_name ?? i.email}</span> <span className="text-[0.8125rem] text-ink-2">· {ROLE[i.role]?.label ?? i.role}</span></span>
                  <span className="block truncate text-[0.8125rem] text-ink-3">
                    {i.email}{i.family_name ? ` · ${i.family_name}` : ''}{i.student_name ? ` · for ${i.student_name}` : ''} · expires {dateShort(i.expires_at)}
                  </span>
                </span>
                {!session?.platform && (isOwner || !['owner', 'admin'].includes(i.role)) && <>
                  <Button size="sm" onClick={() => reissue.mutate(i)} loading={reissue.isPending}>New link</Button>
                  <Button size="sm" variant="ghost" onClick={() => act.mutate(q => q(A.REVOKE, [i.id]))}>Withdraw</Button>
                </>}
              </li>
            ))}
          </ul>
          {link && <InviteLink link={link} />}
        </div>
      )}

      {inviting && studioId && <InviteSheet studioId={studioId} isOwner={isOwner} onClose={() => setInviting(false)} />}
      {removing && (
        <RecordSheet title={`Remove ${removing.full_name}’s access?`}
          subtitle={removing.role === 'guardian'
            ? 'They will no longer be able to sign in. Their family, children and history stay exactly as they are.'
            : removing.role === 'teacher'
              ? 'They will no longer be able to sign in. Their classes and the registers they took stay as they are.'
              : 'They will no longer be able to sign in to this school.'}
          onClose={() => setRemoving(null)} saveLabel="Remove access" saving={act.isPending} error={act.error}
          onSave={() => act.mutate(q => q(A.REMOVE, [removing.id]), { onSuccess: () => setRemoving(null) })}>
          <p className="text-sm text-ink-2">You can invite them again at any time.</p>
        </RecordSheet>
      )}
    </Card>
  );
}

function InviteSheet({ studioId, isOwner, onClose }: { studioId: string; isOwner: boolean; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const families = useRows<{ id: string; name: string }>(['invite-families'], A.FAMILIES);
  const students = useRows<{ id: string; name: string; family_name: string }>(['invite-students'], A.STUDENTS);
  const roles: Role[] = isOwner ? ['owner', 'admin', 'teacher', 'guardian', 'student'] : ['teacher', 'guardian', 'student'];
  const [role, setRole] = React.useState<Role>('teacher');
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [family, setFamily] = React.useState('');
  const [student, setStudent] = React.useState('');
  const [link, setLink] = React.useState<string | null>(null);

  const send = useMutation({
    mutationFn: () => runAs(session, q => q<{ token: string }>(A.INVITE, [studioId, email.trim(), role, name.trim() || null,
      role === 'guardian' ? family : null, role === 'student' ? student : null])),
    onSuccess: rows => { setLink(inviteLink(rows[0]!.token)); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  if (link) {
    return (
      <RecordSheet title="Invitation ready" onClose={onClose} onSave={onClose} saveLabel="Done">
        <div className="flex items-start gap-2 text-sm text-ink-2">
          <CheckCircle2 className="mt-0.5 size-4 text-positive" aria-hidden />
          {name || email} joins as {ROLE[role]!.label.toLowerCase()} when they open this link.
          {role === 'student' && ' Their login stays off until a parent approves it.'}
        </div>
        <InviteLink link={link} />
      </RecordSheet>
    );
  }

  const valid = /^\S+@\S+\.\S+$/.test(email.trim())
    && (role !== 'guardian' || !!family) && (role !== 'student' || !!student);

  return (
    <RecordSheet title="Invite someone" onClose={onClose} onSave={() => send.mutate()} saving={send.isPending}
      error={send.error} canSave={valid} saveLabel="Create invitation">
      <fieldset>
        <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-2">Role</legend>
        <div className="space-y-1.5">
          {roles.map(r => (
            <label key={r} className={cn('flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-2.5',
              role === r ? 'border-accent-line bg-accent-soft/50' : 'border-line hover:bg-surface-2')}>
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="mt-1 accent-[var(--color-accent)]" />
              <span>
                <span className="block text-sm font-medium">{ROLE[r]!.label}</span>
                <span className="block text-[0.7812rem] text-ink-2">{ROLE[r]!.does}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {role === 'guardian' && (
        <Field label="Family" htmlFor="in-f" required hint="They will see this family’s children and nobody else’s.">
          <Select id="in-f" value={family} onChange={e => setFamily(e.target.value)}>
            <option value="">Choose a family…</option>
            {families.data?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </Field>
      )}
      {role === 'student' && (
        <Field label="Student" htmlFor="in-s" required hint="A parent must approve before the login works.">
          <Select id="in-s" value={student} onChange={e => setStudent(e.target.value)}>
            <option value="">Choose a student…</option>
            {students.data?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.family_name})</option>)}
          </Select>
        </Field>
      )}
      <Field label="Name" htmlFor="in-n"><Input id="in-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Email" htmlFor="in-e" required>
        <Input id="in-e" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

// ── Swayvo support ────────────────────────────────────────────────────────
function SupportCard({ studioId }: { studioId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const grants = useRows<A.Grant>(['grants'], A.GRANTS);
  const visits = useRows<{ at: string; summary: string }>(['support-visits'], A.SUPPORT_VISITS);
  const [hours, setHours] = React.useState('24');
  const [reason, setReason] = React.useState('');
  const live = grants.data?.find(g => g.live);
  const grant = useMutation({
    mutationFn: () => runAs(session, q => q(A.GRANT, [studioId, Number(hours), reason.trim()])),
    onSuccess: () => { setReason(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const revoke = useMutation({
    mutationFn: () => runAs(session, q => q(A.REVOKE_GRANT, [studioId])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  return (
    <Card>
      <CardHeader title="Swayvo support" subtitle="Let Swayvo’s team see your account when you need help" />
      <div className="space-y-4 pt-3">
        <p className="text-[0.9062rem] text-ink-2">
          Swayvo cannot see your families, children or money unless you allow it here. Access is read-only, ends when
          you say, and never includes health records. Every time support opens your account it is listed below.
        </p>
        {live ? (
          <div className="border-l-2 border-positive py-1 pl-3">
            <p className="text-[0.9062rem] font-semibold">
              <span className="text-positive">Support can look</span> until {dateShort(live.expires_at)} {time(live.expires_at)}
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-ink-2">{live.reason}</p>
            <Button size="sm" className="mt-2.5" loading={revoke.isPending} onClick={() => revoke.mutate()}>
              <ShieldOff className="size-4" aria-hidden /> End access now
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto] sm:items-end">
            <Field label="What do you need help with?" htmlFor="sp-r">
              <Input id="sp-r" value={reason} onChange={e => setReason(e.target.value)} placeholder="Setting up term invoices" maxLength={200} />
            </Field>
            <Field label="For" htmlFor="sp-h">
              <Select id="sp-h" value={hours} onChange={e => setHours(e.target.value)}>
                <option value="1">1 hour</option><option value="24">24 hours</option>
                <option value="72">3 days</option><option value="168">7 days</option>
              </Select>
            </Field>
            <Button loading={grant.isPending} disabled={reason.trim().length < 3} onClick={() => grant.mutate()}>
              Allow access
            </Button>
          </div>
        )}
        {(grant.error ?? revoke.error) != null && <ErrorState error={grant.error ?? revoke.error} />}
        {!!visits.data?.length && (
          <div>
            <h3 className="border-b border-line pb-1.5 text-[0.875rem] font-semibold">When support looked</h3>
            <ul className="divide-y divide-line text-[0.875rem] text-ink-2">
              {visits.data.map((v, n) => <li key={n} className="py-2">{relativeDay(v.at)} {time(v.at)} — {v.summary}</li>)}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Taking your data away ────────────────────────────────────────────────
function ExportCard({ name }: { name?: string }) {
  const { session } = useSession();
  const [state, setState] = React.useState<'idle' | 'working' | 'done' | Error>('idle');
  const run = async () => {
    setState('working');
    try {
      const out: Record<string, unknown[]> = {};
      for (const t of A.EXPORT_TABLES) out[t] = await readAs(session, `select * from ${t}`);
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), school: name, tables: out }, null, 2)],
        { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(name ?? 'barre').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setState('done');
    } catch (e) { setState(e as Error); }
  };
  return (
    <Card>
      <CardHeader title="Your data" subtitle="Everything your school holds in Swayvo, in one file" />
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <p className="min-w-0 flex-1 text-[0.9062rem] text-ink-2">
          Families, children, health and consent records, classes, registers, invoices, payments and messages — as JSON.
          It contains personal data about children: store it securely.
        </p>
        <Button loading={state === 'working'} onClick={run}><Download className="size-4" aria-hidden /> Export everything</Button>
        {state === 'done' && <p role="status" className="w-full text-[0.8125rem] text-positive">Downloaded.</p>}
        {state instanceof Error && <div className="w-full"><ErrorState error={state} /></div>}
      </div>
    </Card>
  );
}
