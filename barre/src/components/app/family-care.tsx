'use client';

/**
 * Family care controls (UR-16, UR-17):
 *   · a teenager's own login: invite, approve, switch off — for parents
 *   · who may collect each child — parents keep "may collect"; the office
 *     also records "may not collect"; the teacher sees both on the register
 *   · what one guardian's account shows — set by the office
 *   · the school's minimum age for a student login — set by an owner
 * Every rule here is enforced by the database (migration 0046); these are
 * the screens on top.
 */
import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { InviteLink } from '@/components/app/invite-link';
import { Button, Card, CardHeader, ErrorState, Field, Input, Notice, Select, Skeleton, Word } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { inviteLink } from '@/lib/repos/platform';
import * as F from '@/lib/repos/family';

function useRun<V>(fn: (v: V) => { sql: string; params: unknown[] }, after?: (r: any) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: V) => { const c = fn(v); return (await runAs(session, q => q(c.sql, c.params)))[0]; },
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); after?.(r); },
  });
}

/* ── A teenager's own login ─────────────────────────────────────────────── */

/** One row in a child's details: off, invited, waiting for approval, on. */
export function ChildLogin({ studentId, name }: { studentId: string; name: string }) {
  const all = useRows<F.ChildLogin>(['my-children-logins'], F.MY_CHILDREN_LOGINS);
  const l = all.data?.find(x => x.student_id === studentId);
  const [inviting, setInviting] = React.useState(false);
  const set = useRun((on: boolean) => ({ sql: F.SET_STUDENT_LOGIN, params: [studentId, on] }));
  if (!l || l.state === 'too_young') return null;

  const line: Record<F.ChildLogin['state'], React.ReactNode> = {
    too_young: null,
    none: <span className="text-ink-3">No login. {name} uses the app through you.</span>,
    invited: <span className="[overflow-wrap:anywhere]">Invited{l.email ? ` at ${l.email}` : ''}. Once {name} accepts, you approve it here.</span>,
    pending: <span><Word tone="caution">Waiting for you</Word> <span className="ml-1">{name} has accepted the school’s invitation. The login stays off until a parent or carer approves it.</span></span>,
    on: <span><Word tone="positive">On</Word> <span className="ml-1 [overflow-wrap:anywhere]">{name} signs in{l.email ? ` as ${l.email}` : ''}. Either parent can switch it off at any time.</span></span>,
    off: <span><Word tone="muted">Off</Word> <span className="ml-1">A parent or carer switched it off. {name} cannot sign in.</span></span>,
  };

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Own login</dt>
      <dd className="min-w-0">
        <p className="text-[0.9062rem]">{line[l.state]}</p>
        {set.error != null && <div className="mt-2"><ErrorState error={set.error} /></div>}
        <div className="mt-2 flex flex-wrap gap-2">
          {(l.state === 'pending' || l.state === 'off') && (
            <Button size="sm" variant="primary" loading={set.isPending && set.variables === true} onClick={() => set.mutate(true)}>
              {l.state === 'pending' ? 'Approve' : 'Switch back on'}
            </Button>
          )}
          {(l.state === 'on' || l.state === 'pending' || l.state === 'invited') && (
            <Button size="sm" loading={set.isPending && set.variables === false} onClick={() => set.mutate(false)}>
              {l.state === 'on' ? 'Switch off' : l.state === 'pending' ? 'Not now' : 'Withdraw the invitation'}
            </Button>
          )}
          {l.state === 'none' && (
            <Button size="sm" onClick={() => setInviting(true)}>Invite {name}</Button>
          )}
        </div>
        <p className="mt-1.5 text-[0.7812rem] text-ink-3">
          The school gives students their own login from age {l.min_age}. They see their classes, feedback and practice, never payments.
        </p>
      </dd>
      {inviting && <InviteChildSheet studentId={studentId} name={name} onClose={() => setInviting(false)} />}
    </div>
  );
}

function InviteChildSheet({ studentId, name, onClose }: { studentId: string; name: string; onClose: () => void }) {
  const [email, setEmail] = React.useState('');
  const [link, setLink] = React.useState<string | null>(null);
  const send = useRun((e: string) => ({ sql: F.INVITE_STUDENT, params: [studentId, e] }), r => setLink(inviteLink(r.token)));
  if (link) {
    return (
      <RecordSheet title={`Invitation for ${name}`} onClose={onClose} onSave={onClose} saveLabel="Done">
        <p className="text-[0.9062rem] text-ink-2">Because you sent it, {name}’s login works as soon as they accept.</p>
        <InviteLink link={link} />
      </RecordSheet>
    );
  }
  return (
    <RecordSheet title={`Invite ${name}`} subtitle="Their own login" onClose={onClose}
      saving={send.isPending} error={send.error} saveLabel="Make the invitation"
      canSave={/@.+\./.test(email)} onSave={() => send.mutate(email.trim())}>
      <Field label={`${name}’s email`} htmlFor="ci-e" required hint="They accept the invitation to make their login.">
        <Input id="ci-e" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

/** On the family's week: a login waiting for a parent's approval. */
export function PendingLogins() {
  const all = useRows<F.ChildLogin>(['my-children-logins'], F.MY_CHILDREN_LOGINS);
  const waiting = (all.data ?? []).filter(l => l.state === 'pending');
  if (!waiting.length) return null;
  return (
    <>
      {waiting.map(l => (
        <li key={l.student_id} className="py-3.5">
          <Link href="/family/children" className="block rounded-[var(--radius-sm)] hover:bg-surface-2/60">
            <Notice tone="accent" word="New" title={`${l.first_name} has been invited to their own login`}
              detail="It stays off until a parent or carer approves it. Open Your family to approve or say not now." />
          </Link>
        </li>
      ))}
    </>
  );
}

/* ── Who may collect ────────────────────────────────────────────────────── */

/** A parent's list of who may collect one child. */
export function CollectionList({ studentId, name }: { studentId: string; name: string }) {
  const all = useRows<F.Collector>(['my-collectors'], F.MY_COLLECTORS);
  const list = (all.data ?? []).filter(c => c.student_id === studentId);
  const [adding, setAdding] = React.useState(false);
  const remove = useRun((id: string) => ({ sql: F.REMOVE_COLLECTOR, params: [id] }));
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Who may collect</dt>
      <dd className="min-w-0">
        <p className="text-[0.8125rem] text-ink-3">You, and anyone listed here. The teacher sees this list at the register.</p>
        <ul className="mt-1 space-y-0.5">
          {list.map(c => (
            <li key={c.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1"><span className="font-medium">{c.full_name}</span>
                {c.relationship ? <span className="text-ink-3"> ({c.relationship})</span> : null}
                {c.phone ? <span className="block tnum text-[0.8438rem] text-ink-2">{c.phone}</span> : null}</span>
              <Button size="sm" variant="ghost" loading={remove.isPending && remove.variables === c.id}
                      onClick={() => remove.mutate(c.id)} aria-label={`Remove ${c.full_name}`}>
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="ghost" className="-ml-3 mt-1" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden /> Add someone
        </Button>
        <p className="mt-1 text-[0.7812rem] text-ink-3">
          If someone must not collect {name}, <Link href="/family/enquiries" className="font-semibold text-accent-text underline">tell the office</Link>.
        </p>
      </dd>
      {adding && <CollectorSheet studentId={studentId} name={name} onClose={() => setAdding(false)} />}
    </div>
  );
}

function CollectorSheet({ studentId, name, onClose, office }: { studentId: string; name: string; onClose: () => void; office?: boolean }) {
  const [who, setWho] = React.useState('');
  const [rel, setRel] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [allowed, setAllowed] = React.useState('yes');
  const save = useRun(() => office
    ? { sql: OFFICE_ADD_COLLECTOR, params: [studentId, who, rel, phone, allowed === 'yes'] }
    : { sql: F.ADD_COLLECTOR, params: [studentId, who, rel, phone] }, onClose);
  return (
    <RecordSheet title={office ? 'Add to the collection list' : 'Someone who may collect'} subtitle={`For ${name}`} onClose={onClose}
      saving={save.isPending} error={save.error} canSave={who.trim().length > 1} onSave={() => save.mutate(undefined)}>
      <Field label="Name" htmlFor="col-n" required><Input id="col-n" value={who} onChange={e => setWho(e.target.value)} /></Field>
      <Field label="Relationship" htmlFor="col-r"><Input id="col-r" value={rel} onChange={e => setRel(e.target.value)} placeholder="Grandmother, childminder…" /></Field>
      <Field label="Phone" htmlFor="col-p"><Input id="col-p" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
      {office && (
        <Field label="May they collect?" htmlFor="col-a" hint="“May not collect” is shown to the teacher. Families do not see it.">
          <Select id="col-a" value={allowed} onChange={e => setAllowed(e.target.value)}>
            <option value="yes">May collect</option>
            <option value="no">May not collect</option>
          </Select>
        </Field>
      )}
    </RecordSheet>
  );
}

const OFFICE_COLLECTION = `
select id, full_name, relationship, phone, allowed from collection_permission
 where student_id = $1 and deleted_at is null order by allowed desc, full_name`;
const OFFICE_ADD_COLLECTOR = `
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`;

/** The office's view of one child's collection list, both kinds. */
export function OfficeCollection({ studentId, name }: { studentId: string; name: string }) {
  const rows = useRows<F.Collector & { allowed: boolean }>(['office-collection', studentId], OFFICE_COLLECTION, [studentId]);
  const [adding, setAdding] = React.useState(false);
  const remove = useRun((id: string) => ({ sql: F.REMOVE_COLLECTOR, params: [id] }));
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-ink pb-1">
        <h3 className="min-w-0 flex-1 text-[0.875rem] font-semibold">Who may collect</h3>
        <Button size="sm" variant="ghost" onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden /> Add</Button>
      </div>
      {rows.isLoading && <Skeleton className="mt-2 h-8" />}
      {rows.data?.length === 0 && <p className="mt-1 text-[0.8438rem] text-ink-3">Only the family’s guardians.</p>}
      <ul className="divide-y divide-line">
        {rows.data?.map(c => (
          <li key={c.id} className="flex min-h-[44px] items-center gap-2 text-[0.875rem]">
            <span className="min-w-0 flex-1">
              {!c.allowed && <Word tone="critical" className="mr-1.5">May not collect</Word>}
              <span className="font-medium">{c.full_name}</span>
              {c.relationship ? <span className="text-ink-3"> ({c.relationship})</span> : null}
            </span>
            <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)} aria-label={`Remove ${c.full_name}`}>
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      {adding && <CollectorSheet office studentId={studentId} name={name} onClose={() => setAdding(false)} />}
    </div>
  );
}

/* ── What one guardian's account shows (office) ─────────────────────────── */

type Access = { see_schedule: boolean; see_payments: boolean; see_feedback: boolean; see_medical: boolean;
  may_contact: boolean; may_collect: boolean; has_note: boolean; dsl_note: string | null; can_note: boolean };
const ACCESS_FOR = `select * from app.guardian_access_for($1)`;
const SET_ACCESS = `select app.set_guardian_access($1, $2::jsonb, $3)`;
const FLAGS: [keyof Access, string][] = [
  ['see_schedule', 'Sees the schedule'], ['see_payments', 'Sees invoices and payments'],
  ['see_feedback', 'Sees teacher feedback'], ['see_medical', 'Sees medical details'],
  ['may_contact', 'May be contacted by the studio'], ['may_collect', 'May collect the children'],
];

/** Office toggles for one guardian. Saved as each box changes. */
export function GuardianAccessFields({ guardianId }: { guardianId: string }) {
  const rows = useRows<Access>(['guardian-access', guardianId], ACCESS_FOR, [guardianId]);
  const a = rows.data?.[0];
  const [note, setNote] = React.useState<string | null>(null);
  const set = useRun((v: { flags: Partial<Access>; note?: string | null }) =>
    ({ sql: SET_ACCESS, params: [guardianId, JSON.stringify(v.flags), v.note ?? null] }));
  if (!a) return rows.isLoading ? <Skeleton className="h-24" /> : null;
  return (
    <fieldset>
      <legend className="mb-1 text-[0.8125rem] font-medium text-ink-2">Shared care</legend>
      <p className="mb-1 text-[0.7812rem] text-ink-3">Everything is on unless the office restricts it, for example under a court order. Changes apply at once.</p>
      {FLAGS.map(([k, label]) => (
        <label key={k} className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
          <input type="checkbox" checked={!!a[k]} className="size-[18px] accent-[var(--color-accent)]"
                 onChange={e => set.mutate({ flags: { [k]: e.target.checked } })} />
          {label}
        </label>
      ))}
      {a.can_note ? (
        <Field label="Safeguarding note" htmlFor="ga-note" hint="Only the safeguarding lead sees this.">
          <div className="flex gap-2">
            <Input id="ga-note" value={note ?? a.dsl_note ?? ''} onChange={e => setNote(e.target.value)} />
            <Button size="sm" disabled={note === null} loading={set.isPending}
                    onClick={() => { set.mutate({ flags: {}, note: note ?? '' }); setNote(null); }}>Save note</Button>
          </div>
        </Field>
      ) : a.has_note ? (
        <p className="text-[0.8125rem] text-ink-3">The safeguarding lead holds a note about this.</p>
      ) : null}
      {set.error != null && <ErrorState error={set.error} />}
    </fieldset>
  );
}

/* ── The school's minimum age for a student login (owner) ───────────────── */
const MIN_AGE = `select id, student_login_min_age from studio where id in (select app.studio_ids()) limit 1`;
const SET_MIN_AGE = `select app.set_student_login_min_age($1, $2)`;

export function StudentLoginAge() {
  const { session } = useSession();
  const rows = useRows<{ id: string; student_login_min_age: number }>(['student-login-age'], MIN_AGE);
  const s = rows.data?.[0];
  const set = useRun((age: number) => ({ sql: SET_MIN_AGE, params: [s!.id, age] }));
  if (!s) return null;
  const owner = session?.role === 'owner';
  return (
    <Card>
      <CardHeader title="Students’ own logins" subtitle={`From age ${s.student_login_min_age}`} />
      <div className="pt-3">
        {owner ? (
          <Field label="Students may have their own login from age" htmlFor="sl-age"
                 hint="A student’s login works only once a parent or carer approves it, and either parent can switch it off. Many schools choose 13; choose higher if your safeguarding policy asks for it.">
            <Select id="sl-age" value={String(s.student_login_min_age)} onChange={e => set.mutate(Number(e.target.value))}
                    className="max-w-[8rem]">
              {Array.from({ length: 6 }, (_, i) => 13 + i).map(n => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
        ) : (
          <p className="text-[0.8125rem] text-ink-3">Only the studio owner can change this.</p>
        )}
        {set.error != null && <ErrorState error={set.error} />}
      </div>
    </Card>
  );
}
