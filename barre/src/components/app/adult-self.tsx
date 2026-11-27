'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, Field, Input } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as F from '@/lib/repos/family';

/*
 * Adults on the family screens (UR-21). The same screens serve a parent, an
 * adult student on their own, and a parent who also dances. They speak to the
 * person: "Your classes", "Your payments", never "your child" to an adult who
 * has none.
 */

type Person = { id: string; first_name: string; is_me?: boolean; is_adult?: boolean };

export type FamilyVoice = {
  /** The signed-in adult's own record, if they dance. */
  self: Person | null;
  /** An adult student with no children on the account: speak only to them. */
  solo: boolean;
  /** "you" for the signed-in adult's own record, otherwise the first name. */
  name: (id: string, first: string) => string;
};

export function useFamilyVoice(): FamilyVoice {
  const rows = useRows<Person>(['my-children'], F.MY_CHILDREN);
  return React.useMemo(() => {
    const list = rows.data ?? [];
    const self = list.find(c => c.is_me) ?? null;
    return {
      self,
      solo: !!self && list.every(c => c.is_me),
      name: (id: string, first: string) => (self && id === self.id ? 'you' : first),
    };
  }, [rows.data]);
}

/** "Book for myself": a parent adds their own adult record, then books as anyone else would. */
export function BookForMyself() {
  const voice = useFamilyVoice();
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  if (voice.self && !done) return null;
  return (
    <section id="for-me" aria-labelledby="for-me-h">
      <div className="mb-1 border-b-2 border-ink pb-2">
        <h2 id="for-me-h" className="section-title">Classes for you</h2>
        <p className="text-[0.8125rem] text-ink-3">Adult classes and drop-ins, booked in your own name.</p>
      </div>
      {done ? (
        <p role="status" className="pt-3 text-[0.9062rem]">
          <span className="font-semibold text-positive">Done.</span> You’re on the account as an adult student. Choose a class under your name, or book a drop-in.
        </p>
      ) : (
        <div className="pt-3">
          <p className="text-[0.9062rem] text-ink-2">Your children’s details stay as they are. Your bookings and payments show alongside theirs.</p>
          <Button className="mt-3" onClick={() => setOpen(true)}>Book for myself</Button>
        </div>
      )}
      {open && <BookForMyselfSheet onClose={() => setOpen(false)} onDone={() => { setOpen(false); setDone(true); }} />}
    </section>
  );
}

function BookForMyselfSheet({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [dob, setDob] = React.useState('');
  const [adult, setAdult] = React.useState(false);
  const [ecName, setEcName] = React.useState('');
  const [ecPhone, setEcPhone] = React.useState('');
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(F.BOOK_FOR_MYSELF, [dob || null, adult, ecName || null, ecPhone || null])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onDone(); },
  });
  return (
    <RecordSheet title="Book for myself" subtitle="For adult classes and drop-ins" onClose={onClose}
      saving={save.isPending} error={save.error} canSave={(!!dob || adult) && ecPhone.trim().length > 0}
      saveLabel="Add me" onSave={() => save.mutate()}>
      <p className="text-[0.8438rem] text-ink-2">The school keeps a short record for you as a dancer, with someone to ring in an emergency. Nothing about your children changes.</p>
      <Field label="Date of birth" htmlFor="me-dob" hint="Optional. Or tick the box below.">
        <Input id="me-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
      </Field>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={adult} onChange={e => setAdult(e.target.checked)} />
        I am 18 or over
      </label>
      <Field label="Emergency contact" htmlFor="me-ec-name" hint="Someone other than you.">
        <Input id="me-ec-name" value={ecName} onChange={e => setEcName(e.target.value)} autoComplete="off" />
      </Field>
      <Field label="Their phone" htmlFor="me-ec-phone" required>
        <Input id="me-ec-phone" type="tel" value={ecPhone} onChange={e => setEcPhone(e.target.value)} autoComplete="off" />
      </Field>
    </RecordSheet>
  );
}
