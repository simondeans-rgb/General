'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { cn } from '@/lib/cn';
import * as C from '@/lib/repos/consent';
import { dateShort, time } from '@/lib/format';

/*
 * Consent (UR-08). Each change is a new row; the database works out the
 * current state (latest settled choice; when two guardians differ, the most
 * restrictive applies). "Not recorded" is always said, never hidden, and is
 * treated as no consent.
 */

function useSetConsent(studentId: string, onDone?: () => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { kind: C.ConsentKind; granted: boolean; note?: string | null; paper?: boolean }) =>
      runAs(session, q => q(C.SET_CONSENT, [studentId, v.kind, v.granted, v.note ?? null, v.paper ?? false])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onDone?.(); },
  });
}

function History({ studentId }: { studentId: string }) {
  const rows = useRows<C.ConsentChange>(['consent-history', studentId], C.CONSENT_HISTORY, [studentId]);
  if (rows.isLoading) return <Skeleton className="h-10" />;
  if (!rows.data?.length) return <p className="text-[0.8125rem] text-ink-3">No changes recorded yet.</p>;
  return (
    <ol className="divide-y divide-line text-[0.8438rem]">
      {rows.data.map((h, i) => (
        <li key={i} className="py-1.5">
          <span className="font-medium">{C.CONSENT_LABEL[h.kind] ?? h.kind}: {h.granted ? 'given' : 'not given'}</span>
          <span className="text-ink-3"> · {dateShort(h.at)} {time(h.at)} · {h.by_name}{h.source === 'paper' ? ' (on paper)' : ''}</span>
          {h.note && <span className="block text-ink-3">{h.note}</span>}
        </li>
      ))}
    </ol>
  );
}

/** Parent: a row in the child's details with a choice per kind. Changes save at once. */
export function FamilyConsents({ studentId, name }: { studentId: string; name: string }) {
  const rows = useRows<C.ConsentState>(['consents', studentId], C.CONSENTS, [studentId]);
  const [saved, setSaved] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState(false);
  const set = useSetConsent(studentId);
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Consent</dt>
      <dd className="min-w-0">
        {rows.isLoading && <Skeleton className="h-16" />}
        <ul className="space-y-3">
          {rows.data?.map(c => (
            <li key={c.kind}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">{C.CONSENT_LABEL[c.kind]}</span>
                <span className={cn('text-[0.8438rem]', c.granted === false ? 'font-semibold' : c.granted ? '' : 'text-ink-3')}>
                  {c.granted === true ? 'Allowed' : c.granted === false ? 'Not allowed' : 'Not recorded'}
                </span>
              </div>
              <p className="text-[0.8125rem] text-ink-3">{C.CONSENT_EXPLAIN[c.kind]}</p>
              {c.disputed && (
                <p className="mt-1 text-[0.8125rem] font-semibold text-caution">
                  Another parent or carer has said no, so the school treats this as not allowed until you agree.
                </p>
              )}
              <div role="group" aria-label={`${C.CONSENT_LABEL[c.kind]} for ${name}`} className="mt-1.5 flex gap-2">
                <Button size="sm" aria-pressed={c.granted === true} variant={c.granted === true ? 'primary' : undefined}
                  disabled={set.isPending}
                  onClick={() => set.mutate({ kind: c.kind, granted: true }, { onSuccess: () => setSaved(`${C.CONSENT_LABEL[c.kind]}: allowed.`) })}>
                  Allow
                </Button>
                <Button size="sm" aria-pressed={c.granted === false} variant={c.granted === false ? 'primary' : undefined}
                  disabled={set.isPending}
                  onClick={() => set.mutate({ kind: c.kind, granted: false }, { onSuccess: () => setSaved(`${C.CONSENT_LABEL[c.kind]}: not allowed. This applies straight away.`) })}>
                  Don’t allow
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {saved && <p role="status" className="mt-2 text-[0.8125rem] text-positive">{saved} Teachers see the change next time they open {name}’s details.</p>}
        {set.error != null && <ErrorState error={set.error} />}
        <button className="mt-2 text-[0.8125rem] font-semibold text-accent-text underline" aria-expanded={history} onClick={() => setHistory(h => !h)}>
          {history ? 'Hide changes' : 'See changes'}
        </button>
        {history && <div className="mt-1"><History studentId={studentId} /></div>}
      </dd>
    </div>
  );
}

/** Office: current state, history, and recording a consent given in person or on paper. */
export function OfficeConsents({ studentId, name }: { studentId: string; name: string }) {
  const rows = useRows<C.ConsentState>(['consents', studentId], C.CONSENTS, [studentId]);
  const [recording, setRecording] = React.useState(false);
  const [history, setHistory] = React.useState(false);
  return (
    <div className="space-y-2">
      {rows.isLoading && <Skeleton className="h-12" />}
      <dl className="divide-y divide-line text-[0.875rem]">
        {rows.data?.map(c => (
          <div key={c.kind} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-ink-2">{C.CONSENT_LABEL[c.kind]}</dt>
            <dd className={cn('text-right', c.granted === false && 'font-medium text-critical', c.granted == null && 'text-ink-3')}>
              {c.granted === false ? 'Not given' : C.consentWord(c.granted)}
              {c.disputed && <span className="block text-[0.7812rem] font-semibold text-caution">Guardians disagree — treated as not given</span>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setRecording(true)}>Record consent</Button>
        <Button size="sm" variant="ghost" aria-expanded={history} onClick={() => setHistory(h => !h)}>{history ? 'Hide history' : 'History'}</Button>
      </div>
      {history && <History studentId={studentId} />}
      {recording && <RecordConsentSheet studentId={studentId} name={name} onClose={() => setRecording(false)} />}
    </div>
  );
}

function RecordConsentSheet({ studentId, name, onClose }: { studentId: string; name: string; onClose: () => void }) {
  const [kind, setKind] = React.useState<C.ConsentKind>('photography');
  const [granted, setGranted] = React.useState('');
  const [paper, setPaper] = React.useState(true);
  const [note, setNote] = React.useState('');
  const set = useSetConsent(studentId, onClose);
  return (
    <RecordSheet title="Record consent" subtitle={`For ${name}`} onClose={onClose} saving={set.isPending} error={set.error}
      canSave={granted !== ''} saveLabel="Record"
      onSave={() => set.mutate({ kind, granted: granted === 'yes', note, paper })}>
      <p className="text-[0.8438rem] text-ink-2">Recorded by the office, this becomes the family’s settled choice and replaces earlier ones. It is kept in the history with your name.</p>
      <Field label="Consent for" htmlFor="rc-kind">
        <Select id="rc-kind" value={kind} onChange={e => setKind(e.target.value as C.ConsentKind)}>
          {C.CONSENT_KINDS.map(k => <option key={k} value={k}>{C.CONSENT_LABEL[k]}</option>)}
        </Select>
      </Field>
      <Field label="The family’s choice" htmlFor="rc-choice" required>
        <Select id="rc-choice" value={granted} onChange={e => setGranted(e.target.value)}>
          <option value="">Choose</option>
          <option value="yes">Given</option>
          <option value="no">Not given</option>
        </Select>
      </Field>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={paper} onChange={e => setPaper(e.target.checked)} />
        Given on a signed paper form
      </label>
      <Field label="Note" htmlFor="rc-note" hint="For example, who signed and when.">
        <Input id="rc-note" value={note} onChange={e => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}

/** Office, adding a child: the starting state for each kind (blank = not recorded). */
export function InitialConsents({ value, onChange }: {
  value: Partial<Record<C.ConsentKind, boolean>>; onChange: (v: Partial<Record<C.ConsentKind, boolean>>) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[0.875rem] font-semibold">Consent</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {C.CONSENT_KINDS.map(k => (
          <Field key={k} label={C.CONSENT_LABEL[k]} htmlFor={`ic-${k}`}>
            <Select id={`ic-${k}`} value={value[k] === undefined ? '' : value[k] ? 'yes' : 'no'}
              onChange={e => { const v = { ...value }; if (e.target.value === '') delete v[k]; else v[k] = e.target.value === 'yes'; onChange(v); }}>
              <option value="">Not recorded</option>
              <option value="yes">Given</option>
              <option value="no">Not given</option>
            </Select>
          </Field>
        ))}
      </div>
      <p className="text-[0.7812rem] text-ink-3">Not recorded is treated as no consent. Families can change these in their app.</p>
    </fieldset>
  );
}

/** Teacher's brief: every kind stated, "Not recorded" included (UR-08). */
export function BriefConsentLines({ studentId, photo }: { studentId?: string; photo: boolean | null | undefined }) {
  const extra = useRows<{ video_consent: boolean | null; social_consent: boolean | null }>(
    ['brief-consents', studentId], C.BRIEF_CONSENTS, [studentId], { enabled: !!studentId }).data?.[0];
  const line = (label: string, v: boolean | null | undefined, no: string) => (
    <li className={cn(v === false ? 'font-semibold text-caution' : v == null ? 'text-ink-2' : 'text-ink-3')}>
      {v === true ? `${label} allowed` : v === false ? no : `${label}: not recorded, so don’t`}
    </li>
  );
  return (
    <ul aria-label="Consent" className="mt-2 space-y-0.5 text-[0.8438rem]">
      {line('Photos', photo, 'No photos')}
      {studentId && extra && line('Video', extra.video_consent, 'No video')}
      {studentId && extra && line('Social media', extra.social_consent, 'Not on social media')}
    </ul>
  );
}
