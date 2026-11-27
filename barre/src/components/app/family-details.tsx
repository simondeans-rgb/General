'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, Field, Input, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as F from '@/lib/repos/family';
import { removeWithUndo, useRemoving } from '@/components/app/undo';

function useSave(after: () => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); after(); },
  });
}

/**
 * The parents on the account. Each guardian edits only their own details;
 * anyone else's are read-only here, and a change goes to the office as a
 * request (UR-05). Changes reach the office straight away.
 */
export function YourDetails() {
  const g = useRows<F.Guardian>(['my-guardians'], F.MY_GUARDIANS);
  const [editing, setEditing] = React.useState<F.Guardian | null>(null);
  const [asking, setAsking] = React.useState<F.Guardian | null>(null);
  const others = (g.data ?? []).some(p => !p.is_me);
  return (
    <section aria-labelledby="your-details-h">
      <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
        <h2 id="your-details-h" className="section-title min-w-0 flex-1">Your details</h2>
        <span className="text-[13px] text-ink-3">The studio is told when you change them</span>
      </div>
      {g.isLoading && <Skeleton className="mt-3 h-12" />}
      <ul className="divide-y divide-line">
        {g.data?.map(p => (
          <li key={p.id} className="flex min-h-[56px] items-center gap-3 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{p.full_name}{p.is_me ? ' (you)' : ''}</span>
              <span className="block truncate text-[13px] text-ink-3">
                {[p.phone, p.email].filter(Boolean).join(' · ') || 'No phone or email yet'}</span>
            </span>
            {p.is_me ? (
              <Button size="sm" variant="ghost" onClick={() => setEditing(p)} aria-label={`Edit ${p.full_name}`}>
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setAsking(p)} aria-label={`Ask the office to change ${p.full_name}’s details`}>
                Ask the office to change
              </Button>
            )}
          </li>
        ))}
      </ul>
      {others && (
        <p className="mt-1 text-[13px] text-ink-3">
          You can change your own details. Only the office changes anyone else’s.
        </p>
      )}
      {editing && <GuardianSheet g={editing} onClose={() => setEditing(null)} />}
      {asking && <AskOfficeSheet g={asking} onClose={() => setAsking(null)} />}
    </section>
  );
}

function AskOfficeSheet({ g, onClose }: { g: F.Guardian; onClose: () => void }) {
  const [body, setBody] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const { session } = useSession();
  const qc = useQueryClient();
  const send = useMutation({
    mutationFn: () => runAs(session, q => q(F.ASK_TO_CHANGE_GUARDIAN, [g.id, body.trim()])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); setSent(true); },
  });
  if (sent) {
    return (
      <RecordSheet title="Sent to the office" onClose={onClose} onSave={onClose} saveLabel="Done">
        <p className="text-[14.5px] text-ink-2">
          The office has your request and will check it before changing {g.full_name}’s details.
          You can follow it in Requests.
        </p>
      </RecordSheet>
    );
  }
  return (
    <RecordSheet title="Ask the office to change" subtitle={g.full_name} onClose={onClose}
      saving={send.isPending} error={send.error} saveLabel="Send to the office"
      canSave={body.trim().length > 3} onSave={() => send.mutate()}>
      <Field label="What should change" htmlFor="ask-b" required
             hint="For example a new mobile number. The office checks with them before changing it.">
        <Input id="ask-b" value={body} onChange={e => setBody(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

function GuardianSheet({ g, onClose }: { g: F.Guardian; onClose: () => void }) {
  const [name, setName] = React.useState(g.full_name);
  const [email, setEmail] = React.useState(g.email ?? '');
  const [phone, setPhone] = React.useState(g.phone ?? '');
  const save = useSave(onClose);
  return (
    <RecordSheet title="Edit your details" onClose={onClose} saving={save.isPending} error={save.error}
      canSave={name.trim().length > 1} onSave={() => save.mutate({ sql: F.UPDATE_GUARDIAN, params: [g.id, name.trim(), email.trim(), phone.trim()] })}>
      <Field label="Name" htmlFor="gd-n" required><Input id="gd-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Mobile" htmlFor="gd-p"><Input id="gd-p" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
      <Field label="Email" htmlFor="gd-e"><Input id="gd-e" type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
    </RecordSheet>
  );
}

/** Emergency contacts for one child — who to ring if you can't be reached. */
export function EmergencyContacts({ studentId, name }: { studentId: string; name: string }) {
  const all = useRows<F.Contact>(['my-contacts'], F.MY_CONTACTS);
  const removing = useRemoving();
  const list = (all.data ?? []).filter(c => c.student_id === studentId && !removing(c.id));
  const [editing, setEditing] = React.useState<F.Contact | 'new' | null>(null);
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Emergency contacts</dt>
      <dd className="min-w-0">
      {list.length === 0 && !all.isLoading && (
        <p className="font-semibold text-critical">None yet. Add someone the studio can ring.</p>
      )}
      <ul className="space-y-0.5">
        {list.map(c => (
          <li key={c.id} className="flex items-center gap-2">
            <span className="min-w-0 flex-1"><span className="font-medium">{c.full_name}</span>{c.relationship ? <span className="text-ink-3"> ({c.relationship})</span> : ''}
              <span className="block tnum text-[13.5px] text-ink-2">{c.phone}</span></span>
            <Button size="sm" variant="ghost" onClick={() => setEditing(c)} aria-label={`Edit ${c.full_name}`}>
              <Pencil className="size-3.5" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <Button size="sm" variant="ghost" className="-ml-3 mt-1" onClick={() => setEditing('new')}>
        <Plus className="size-4" aria-hidden /> Add a contact
      </Button>
      </dd>
      {editing && <ContactSheet studentId={studentId} childName={name} c={editing === 'new' ? null : editing}
                                canRemove={list.length > 1} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ContactSheet({ studentId, childName, c, canRemove, onClose }: {
  studentId: string; childName: string; c: F.Contact | null; canRemove: boolean; onClose: () => void;
}) {
  const [name, setName] = React.useState(c?.full_name ?? '');
  const [rel, setRel] = React.useState(c?.relationship ?? '');
  const [phone, setPhone] = React.useState(c?.phone ?? '');
  const { session } = useSession();
  const qc = useQueryClient();
  const save = useSave(onClose);
  const remove = () => {
    removeWithUndo(c!.id, c!.full_name, async () => {
      await runAs(session, q => q(F.REMOVE_CONTACT, [c!.id]));
      qc.invalidateQueries({ queryKey: ['db'] });
    });
    onClose();
  };
  return (
    <RecordSheet title={c ? 'Edit contact' : 'Add a contact'} subtitle={`For ${childName}`} onClose={onClose}
      saving={save.isPending} error={save.error}
      canSave={name.trim().length > 1 && phone.replace(/\D/g, '').length >= 6}
      onSave={() => save.mutate(c
        ? { sql: F.UPDATE_CONTACT, params: [c.id, name.trim(), rel.trim(), phone.trim()] }
        : { sql: F.ADD_CONTACT, params: [studentId, name.trim(), rel.trim(), phone.trim()] })}>
      <Field label="Name" htmlFor="ec-n" required><Input id="ec-n" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Relationship" htmlFor="ec-r"><Input id="ec-r" value={rel} onChange={e => setRel(e.target.value)} placeholder="Grandmother" /></Field>
      <Field label="Phone" htmlFor="ec-p" required><Input id="ec-p" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
      {c && canRemove && (
        <Button size="sm" variant="ghost" onClick={remove}>
          <Trash2 className="size-4" aria-hidden /> Remove this contact
        </Button>
      )}
    </RecordSheet>
  );
}
