'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Field, Input, Notice, Select, StatusLine } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as C from '@/lib/repos/classes';

/** The office writes down a phone call or a walk-in (R-014). */
export function NewEnquirySheet({ onClose, onBook }: { onClose: () => void; onBook?: (id: string) => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const classes = useRows<{ id: string; name: string }>(['class-options'], C.CLASS_OPTIONS);
  const [f, setF] = React.useState({ name: '', phone: '', email: '', child: '', dob: '', cls: '', source: 'phone', next: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const [saved, setSaved] = React.useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(C.CREATE_ENQUIRY, [f.name, f.phone, f.email, f.child, f.dob || null, f.cls || null, f.source, f.next || null])),
    onSuccess: rows => { setSaved((rows as { id: string }[])[0]?.id ?? ''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (saved != null) return <RecordSheet title="New enquiry" onClose={onClose}
      onSave={saved && onBook ? () => onBook(saved) : onClose} saveLabel={saved && onBook ? 'Book a trial now' : 'Done'}>
    <StatusLine title={`${f.name} is in the pipeline`}
      detail={onBook ? 'Book their trial now and the details come with it, or later from the enquiry card.' : 'Book their trial from the enquiry card when you’re ready.'} /></RecordSheet>;
  return (
    <RecordSheet title="New enquiry" subtitle="A phone call, an email or someone at the door" onClose={onClose}
      saving={save.isPending} error={save.error} canSave={f.name.trim().length > 1 && (f.phone.trim() !== '' || f.email.includes('@'))}
      onSave={() => save.mutate()}>
      <Field label="Who" htmlFor="en-n" required><Input id="en-n" value={f.name} onChange={set('name')} placeholder="Parent or carer" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" htmlFor="en-p"><Input id="en-p" type="tel" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Email" htmlFor="en-e"><Input id="en-e" type="email" value={f.email} onChange={set('email')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Child" htmlFor="en-c"><Input id="en-c" value={f.child} onChange={set('child')} /></Field>
        <Field label="Date of birth" htmlFor="en-d"><Input id="en-d" type="date" value={f.dob} onChange={set('dob')} /></Field>
      </div>
      <Field label="Interested in" htmlFor="en-cls">
        <Select id="en-cls" value={f.cls} onChange={set('cls')}>
          <option value="">Not sure yet</option>
          {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="How they got in touch" htmlFor="en-s">
          <Select id="en-s" value={f.source} onChange={set('source')}>
            <option value="phone">Phone</option><option value="walk_in">Walk-in</option>
            <option value="email">Email</option><option value="social">Social media</option><option value="referral">Friend</option>
          </Select>
        </Field>
        <Field label="Follow up by" htmlFor="en-f" hint="Defaults to two days."><Input id="en-f" type="date" value={f.next} onChange={set('next')} /></Field>
      </div>
    </RecordSheet>
  );
}
