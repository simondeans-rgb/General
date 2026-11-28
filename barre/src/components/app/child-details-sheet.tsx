'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, Field, Input, Select, ErrorState } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as F from '@/lib/repos/family';
import * as H from '@/lib/repos/hub';

type ChildLike = {
  id: string; first_name: string; last_name: string; is_me?: boolean;
  preferred_name?: string | null; pronouns?: string | null; school?: string | null;
};

/**
 * A parent keeps their child's details current from one place:
 *  · the name they go by, pronouns and school — changed straight away (0056);
 *  · photo and video consent stays in one place, on the child's page (U4);
 *  · legal name, date of birth and medical details — asked of the office,
 *    because classes, exams, billing and the teacher's safety brief rely on them.
 */
export function ChildDetailsSheet({ child, onClose }: { child: ChildLike; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [preferred, setPreferred] = React.useState(child.preferred_name ?? '');
  const [pronouns, setPronouns] = React.useState(child.pronouns ?? '');
  const [school, setSchool] = React.useState(child.school ?? '');

  const save = useMutation({
    mutationFn: () => runAs(session, q => q(F.UPDATE_CHILD_DETAILS, [child.id, preferred, pronouns, school])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });

  return (
    <RecordSheet title={child.is_me ? 'Update your details' : `Update ${child.first_name}’s details`}
      subtitle="The studio is told about any change."
      onClose={onClose} onSave={() => save.mutate()} saving={save.isPending} error={save.error}
      saveLabel="Save details">
      <div className="space-y-4">
        <Field label={child.is_me ? 'Name you go by' : 'Name they go by'} htmlFor="cd-preferred"
               hint={`If it’s not ${child.first_name}. Teachers see it on the register.`}>
          <Input id="cd-preferred" value={preferred} maxLength={60} onChange={e => setPreferred(e.target.value)} />
        </Field>
        <Field label="Pronouns" htmlFor="cd-pronouns" hint="Optional.">
          <Input id="cd-pronouns" value={pronouns} maxLength={40} placeholder="she/her, he/him, they/them"
                 onChange={e => setPronouns(e.target.value)} />
        </Field>
        {!child.is_me && (
          <Field label="School" htmlFor="cd-school" hint="Optional. Helps the studio plan around term dates.">
            <Input id="cd-school" value={school} maxLength={120} onChange={e => setSchool(e.target.value)} />
          </Field>
        )}
      </div>

      <p className="mt-6 text-[0.8125rem] text-ink-3">
        Photo and video consent {child.is_me ? 'for you' : `for ${child.first_name}`} is under Consent on {child.is_me ? 'your' : 'their'} page. Changes there apply straight away.
      </p>

      <AskOffice child={child} />
    </RecordSheet>
  );
}

/** Legal name, date of birth or medical details: sent to the office as a request. */
function AskOffice({ child }: { child: ChildLike }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [what, setWhat] = React.useState<'identity' | 'medical'>('medical');
  const [body, setBody] = React.useState('');
  const name = child.is_me ? 'me' : `${child.first_name} ${child.last_name}`;
  const send = useMutation({
    mutationFn: () => runAs(session, q => q(H.RAISE_REQUEST, [
      child.id,
      what === 'medical' ? 'medical_update' : 'other',
      what === 'medical' ? `Medical or allergy update for ${name}` : `Correct the name or date of birth for ${name}`,
      body.trim(),
    ])),
    onSuccess: () => { setBody(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <section aria-labelledby="cd-ask-h" className="mt-8">
      <h3 id="cd-ask-h" className="section-title border-b-2 border-ink pb-2">Ask the studio to change</h3>
      <p className="pt-2 text-[0.8125rem] text-ink-3">
        The studio updates these itself, so there is a record of who changed what. You’ll see their reply under Requests.
      </p>
      {send.isSuccess ? (
        <p role="status" className="mt-3 font-semibold">Sent. The studio will make the change and let you know.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <Field label="What needs changing" htmlFor="cd-what">
            <Select id="cd-what" value={what} onChange={e => setWhat(e.target.value as 'identity' | 'medical')}>
              <option value="medical">Medical details or allergies</option>
              <option value="identity">Legal name or date of birth</option>
            </Select>
          </Field>
          <Field label="What should it say" htmlFor="cd-body">
            <textarea id="cd-body" value={body} rows={3} onChange={e => setBody(e.target.value)}
              placeholder={what === 'medical' ? 'For example: now allergic to nuts, carries an EpiPen.' : 'For example: date of birth should be 4 May 2016.'}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.875rem]
                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
          {send.isError && <ErrorState error={send.error} />}
          <Button onClick={() => send.mutate()} loading={send.isPending} disabled={body.trim().length < 5}>
            Send to the studio
          </Button>
        </div>
      )}
    </section>
  );
}
