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

/** The parents on the account. Changes reach the office straight away. */
export function YourDetails() {
  const g = useRows<F.Guardian>(['my-guardians'], F.MY_GUARDIANS);
  const [editing, setEditing] = React.useState<F.Guardian | null>(null);
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
            <Button size="sm" variant="ghost" onClick={() => setEditing(p)} aria-label={`Edit ${p.full_name}`}>
              <Pencil className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      {editing && <GuardianSheet g={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

function GuardianSheet({ g, onClose }: { g: F.Guardian; onClose: () => void }) {
  const [name, setName] = React.useState(g.full_name);
  const [email, setEmail] = React.useState(g.email ?? '');
  const [phone, setPhone] = React.useState(g.phone ?? '');
  const save = useSave(onClose);
  return (
    <RecordSheet title="Edit details" onClose={onClose} saving={save.isPending} error={save.error}
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
