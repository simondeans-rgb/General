'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, MailPlus, ShieldOff, UserMinus, CheckCircle2 } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RetentionCard } from '@/components/app/safeguarding';
import { HistoryCard } from '@/components/app/history-card';
import { RecordSheet } from '@/components/app/record-sheet';
import { InviteLink } from '@/components/app/invite-link';
import { useRoleScopes, ScopeButton, effectiveAccess } from '@/components/app/role-scope';
import { BrandSettings, ImagerySettings } from '@/components/app/brand-settings';
import { useSection } from '@/components/app/section-hash';
import { useRows } from '@/lib/query';
import { runAs, readAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import {
  Beats, Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone, FilterTabs, Choice
} from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import * as A from '@/lib/repos/account';
import { inviteLink } from '@/lib/repos/platform';
import { money, dateShort, relativeDay, time } from '@/lib/format';
import { cn } from '@/lib/cn';
import { pickerLabels } from '@/lib/office-words';

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

const SECTIONS = ['brand', 'plan', 'people', 'data', 'history'] as const;
type Section = typeof SECTIONS[number];
const TITLES: Record<Section, string> = {
  brand: 'Brand', plan: 'Plan', people: 'People and access', data: 'Data and privacy', history: 'History',
};

/**
 * The school's own account, one section at a time, chosen from the settings
 * tab row (U4): its brand, its plan, who can get in, its data (Swayvo
 * support, keeping data, export) and its history. Owners and administrators;
 * data and history are the owner's.
 */
export default function AccountPage() {
  const { session } = useSession();
  const acct = useRows<A.AccountRow>(['account'], A.ACCOUNT).data?.[0];
  const isOwner = session?.role === 'owner';
  const ownerHere = isOwner && !session?.platform;
  const section = useSection<Section>(ownerHere ? SECTIONS : ['brand', 'plan', 'people']);

  return (
    <Shell title="Account" subtitle={acct ? `${TITLES[section]} · ${acct.name} · ${STATUS[acct.status] ?? acct.status}` : TITLES[section]}
      allow={['owner', 'admin']}>
      <div className="mx-auto max-w-[1240px]"><div className="max-w-3xl space-y-12">
        {section === 'brand' && <>
          <BrandSettings canEdit={ownerHere} />
          <ImagerySettings canEdit={ownerHere} />
        </>}
        {section === 'plan' && <PlanCard acct={acct} canChange={ownerHere} />}
        {section === 'people' && <Team isOwner={isOwner} studioId={acct?.id} />}
        {section === 'data' && ownerHere && acct && <>
          <SupportCard studioId={acct.id} />
          <RetentionCard studioId={acct.id} />
          <ExportCard name={acct.name} />
        </>}
        {section === 'history' && !session?.platform && <HistoryCard isOwner={isOwner} />}
      </div></div>
    </Shell>
  );
}

type PlanRow = { code: string; name: string; price_minor: number; max_students: number | null;
  max_locations: number | null; max_staff: number | null; is_trial: boolean };
const PLANS = `select code, name, price_minor, max_students, max_locations, max_staff, is_trial
  from plan where active order by sort, price_minor`;
const CHANGE_PLAN = `select app.change_plan($1) as name`;
const capText = (n: number | null, what: string) => (n == null ? `any number of ${what}`
  : `up to ${n.toLocaleString('en-GB')} ${n === 1 ? ({ students: 'student', locations: 'location' } as Record<string, string>)[what] ?? what : what}`);

function PlanCard({ acct, canChange }: { acct?: A.AccountRow; canChange: boolean }) {
  const plans = useRows<PlanRow>(['plans-on-offer'], PLANS);
  const [moving, setMoving] = React.useState<PlanRow | null>(null);
  if (!acct) return <Card><Skeleton className="h-24" /></Card>;
  const rows: [string, number, number | null][] = [
    ['Students', acct.students, acct.max_students],
    ['Locations', acct.locations, acct.max_locations],
    ['Staff', acct.staff, acct.max_staff],
  ];
  const fits = (p: PlanRow) => (p.max_students == null || acct.students <= p.max_students)
    && (p.max_locations == null || acct.locations <= p.max_locations) && (p.max_staff == null || acct.staff <= p.max_staff);
  const offered = (plans.data ?? []).filter(p => !p.is_trial);
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
        <p className="text-[0.8125rem] text-ink-3">
          Students on the plan are children in a class, on a trial or on a waiting list, and new records not placed yet.
          Children who have left are kept and do not count{acct.leavers > 0 ? ` (${acct.leavers} now)` : ''}.
          Nothing is ever deleted for being over a limit — you just cannot add more.
        </p>
      </div>

      {offered.length > 0 && (
        <section aria-labelledby="plan-choose" className="pt-8">
          <h3 id="plan-choose" className="border-b border-line pb-1.5 text-[0.9062rem] font-semibold">Plans</h3>
          <ul className="divide-y divide-line">
            {offered.map(p => {
              const current = p.name === acct.plan_name;
              return (
                <li key={p.code} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{p.name}{current && <span className="font-normal text-ink-3"> · your plan</span>}</span>
                    <span className="block text-[0.8125rem] text-ink-2">
                      {capText(p.max_students, 'students')}, {capText(p.max_locations, 'locations')}, {capText(p.max_staff, 'staff')}
                    </span>
                  </span>
                  <span className="stat-number text-[1.125rem]">{money(p.price_minor)}<span className="font-sans text-[0.8125rem] font-normal text-ink-3"> a month</span></span>
                  {canChange && !current && (fits(p)
                    ? <Button size="sm" onClick={() => setMoving(p)}>Move to {p.name}</Button>
                    : <span className="text-[0.8125rem] text-ink-3">Too small for your school now</span>)}
                </li>
              );
            })}
          </ul>
          <p className="pt-2 text-[0.8125rem] text-ink-3">
            {canChange
              ? 'Card payment for plans is not connected yet: Swayvo sends the school an invoice for the new price.'
              : 'Only an owner can change the plan.'}
          </p>
        </section>
      )}
      {moving && <MovePlanSheet plan={moving} acct={acct} onClose={() => setMoving(null)} />}
    </Card>
  );
}

function MovePlanSheet({ plan, acct, onClose }: { plan: PlanRow; acct: A.AccountRow; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const move = useMutation({
    mutationFn: () => runAs(session, q => q(CHANGE_PLAN, [plan.code])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  const up = plan.price_minor >= (acct.price_minor ?? 0);
  return (
    <RecordSheet title={`Move to ${plan.name}?`} subtitle={`${money(plan.price_minor)} a month, from today`}
      onClose={onClose} onSave={() => move.mutate()} saving={move.isPending} error={move.error} saveLabel={`Move to ${plan.name}`}>
      <p className="text-[0.9062rem] text-ink-2">
        {capText(plan.max_students, 'students')}, {capText(plan.max_locations, 'locations')} and {capText(plan.max_staff, 'staff')}.
        The new limits apply straight away{acct.status === 'trialling' ? ', and your free trial carries on until it ends' : ''}.
      </p>
      <p className="text-[0.9062rem] text-ink-2">
        Card payment for plans is not connected yet, so nothing is charged here. Swayvo sends the school an invoice
        {up ? ' for the new price' : ' at the new price from the next month'}.
      </p>
    </RecordSheet>
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
  // Several locations: who covers which, and what that lets them do (UR-33).
  const scopes = useRoleScopes();

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
      <FilterTabs label="People with access" value={tab} onChange={setTab} className="mx-0 border-b border-line"
        options={[['staff', 'Staff', count(staffRoles)], ['families', 'Parents and students', count(['guardian', 'student'])]]} />
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
                  {scopes.multi && staffRoles.includes(m.role) && (
                    <span className="mt-0.5 block text-[0.8125rem] text-ink-2">{effectiveAccess(m.role, scopes.names(scopes.scopeOf(m.id)))}</span>
                  )}
                </span>
                {scopes.multi && isOwner && !session?.platform && (m.role === 'admin' || m.role === 'teacher') && (
                  <ScopeButton membershipId={m.id} name={m.full_name} role={m.role} scope={scopes.scopeOf(m.id)} locations={scopes.locations} />
                )}
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
  const families = useRows<{ id: string; name: string; guardian: string | null; children: string | null; postcode: string | null }>(['invite-families'], A.FAMILIES);
  const famLabels = React.useMemo(() => pickerLabels(families.data ?? []), [families.data]);
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
      <div>
        <p aria-hidden className="mb-1.5 text-[0.8125rem] font-medium text-ink-2">Role</p>
        <Choice label="Role" layout="stack" value={role} onChange={setRole}
          options={roles.map(r => ({ value: r, label: ROLE[r]!.label, hint: ROLE[r]!.does }))} />
      </div>
      {role === 'guardian' && (
        <Field label="Family" htmlFor="in-f" required hint="They will see this family’s children and nobody else’s.">
          <Select id="in-f" value={family} onChange={e => setFamily(e.target.value)}>
            <option value="">Choose a family…</option>
            {families.data?.map(f => <option key={f.id} value={f.id}>{famLabels.get(f.id) ?? f.name}</option>)}
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
