'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, ErrorState, Field, Input, Select, Skeleton, Choice } from '@/components/ui';
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

/** The school's own names and explanations for each kind (UR-08). For a
 *  child's consents pass the student, so the child's school's words are used. */
export function useConsentLabels(studentId?: string | null) {
  const rows = useRows<C.ConsentLabel>(['consent-labels', studentId ?? 'mine'], C.CONSENT_LABELS, [null, studentId ?? null],
    { staleTime: 60_000 });
  const map = React.useMemo(() => new Map((rows.data ?? []).map(l => [l.kind, l])), [rows.data]);
  return {
    label: (k: C.ConsentKind) => map.get(k)?.label ?? C.CONSENT_LABEL[k] ?? k,
    explain: (k: C.ConsentKind) => map.get(k)?.description ?? C.CONSENT_EXPLAIN[k] ?? '',
  };
}

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
  const L = useConsentLabels(studentId);
  if (rows.isLoading) return <Skeleton className="h-10" />;
  if (!rows.data?.length) return <p className="text-[0.8125rem] text-ink-3">No changes recorded yet.</p>;
  return (
    <ol className="divide-y divide-line text-[0.8438rem]">
      {rows.data.map((h, i) => (
        <li key={i} className="py-1.5">
          <span className="font-medium">{L.label(h.kind)}: {h.granted ? 'given' : 'not given'}</span>
          <span className="text-ink-3"> · {dateShort(h.at)} {time(h.at)} · {h.by_name}{h.source === 'paper' ? ' (on paper)' : ''}</span>
          {h.note && <span className="block text-ink-3">{h.note}</span>}
        </li>
      ))}
    </ol>
  );
}

/** Parent: a row in the child's details with a choice per kind. Changes save at once.
 *  `summary`: one line ("Photos: allowed · Video: not recorded") that opens
 *  to the choices, so a page with several children is not a wall of buttons. */
export function FamilyConsents({ studentId, name, summary = false }: { studentId: string; name: string; summary?: boolean }) {
  const rows = useRows<C.ConsentState>(['consents', studentId], C.CONSENTS, [studentId]);
  const [saved, setSaved] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState(false);
  const [open, setOpen] = React.useState(!summary);
  const set = useSetConsent(studentId);
  const L = useConsentLabels(studentId);
  const word = (g: boolean | null) => (g === true ? 'allowed' : g === false ? 'not allowed' : 'not recorded');
  const panel = React.useId();
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3">
      <dt className="text-ink-3">Consent</dt>
      <dd className="min-w-0">
        {rows.isLoading && <Skeleton className="h-16" />}
        {summary && rows.data && (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="min-w-0">{rows.data.map(c => `${L.label(c.kind)}: ${word(c.granted)}`).join(' · ')}</span>
            <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(o => !o)}
              className="min-h-[32px] text-[0.8125rem] font-semibold text-accent-text underline">
              {open ? 'Done' : 'Change'}
            </button>
          </p>
        )}
        {open && <div id={panel}>
        <ul className={cn('space-y-3', summary && 'mt-3 border-l-2 border-line pl-3')}>
          {rows.data?.map(c => (
            <li key={c.kind}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">{L.label(c.kind)}</span>
                <span className={cn('text-[0.8438rem]', c.granted === false ? 'font-semibold' : c.granted ? '' : 'text-ink-3')}>
                  {c.granted === true ? 'Allowed' : c.granted === false ? 'Not allowed' : 'Not recorded'}
                </span>
              </div>
              <p className="text-[0.8125rem] text-ink-3">{L.explain(c.kind)}</p>
              {c.disputed && (
                <p className="mt-1 text-[0.8125rem] font-semibold text-caution">
                  Another parent or carer has said no, so the school treats this as not allowed until you agree.
                </p>
              )}
              <Choice label={`${L.label(c.kind)} for ${name}`} size="sm" className="mt-1.5" disabled={set.isPending}
                value={c.granted === true ? 'yes' : c.granted === false ? 'no' : null}
                onChange={v => v === 'yes'
                  ? set.mutate({ kind: c.kind, granted: true }, { onSuccess: () => setSaved(`${L.label(c.kind)}: allowed.`) })
                  : set.mutate({ kind: c.kind, granted: false }, { onSuccess: () => setSaved(`${L.label(c.kind)}: not allowed. This applies straight away.`) })}
                options={[{ value: 'yes', label: 'Allow' }, { value: 'no', label: 'Don’t allow' }]} />
            </li>
          ))}
        </ul>
        {saved && <p role="status" className="mt-2 text-[0.8125rem] text-positive">{saved} Teachers see the change next time they open {name === 'you' ? 'your' : `${name}’s`} details.</p>}
        {set.error != null && <ErrorState error={set.error} />}
        <button className="mt-2 text-[0.8125rem] font-semibold text-accent-text underline" aria-expanded={history} onClick={() => setHistory(h => !h)}>
          {history ? 'Hide changes' : 'See changes'}
        </button>
        {history && <div className="mt-1"><History studentId={studentId} /></div>}
        </div>}
        {!open && saved && <p role="status" className="mt-1 text-[0.8125rem] text-positive">{saved}</p>}
      </dd>
    </div>
  );
}

/** Office: current state, history, and recording a consent given in person or on paper. */
export function OfficeConsents({ studentId, name }: { studentId: string; name: string }) {
  const rows = useRows<C.ConsentState>(['consents', studentId], C.CONSENTS, [studentId]);
  const [recording, setRecording] = React.useState(false);
  const [history, setHistory] = React.useState(false);
  const L = useConsentLabels(studentId);
  return (
    <div className="space-y-2">
      {rows.isLoading && <Skeleton className="h-12" />}
      <dl className="divide-y divide-line text-[0.875rem]">
        {rows.data?.map(c => (
          <div key={c.kind} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-ink-2">{L.label(c.kind)}</dt>
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
  const L = useConsentLabels(studentId);
  return (
    <RecordSheet title="Record consent" subtitle={`For ${name}`} onClose={onClose} saving={set.isPending} error={set.error}
      canSave={granted !== ''} saveLabel="Record"
      onSave={() => set.mutate({ kind, granted: granted === 'yes', note, paper })}>
      <p className="text-[0.8438rem] text-ink-2">Recorded by the office, this becomes the family’s settled choice and replaces earlier ones. It is kept in the history with your name.</p>
      <Field label="Consent for" htmlFor="rc-kind">
        <Select id="rc-kind" value={kind} onChange={e => setKind(e.target.value as C.ConsentKind)}>
          {C.CONSENT_KINDS.map(k => <option key={k} value={k}>{L.label(k)}</option>)}
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
  const L = useConsentLabels();
  return (
    <fieldset className="space-y-2">
      <legend className="text-[0.875rem] font-semibold">Consent</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {C.CONSENT_KINDS.map(k => (
          <Field key={k} label={L.label(k)} htmlFor={`ic-${k}`}>
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
  const L = useConsentLabels(studentId);
  const not = (k: C.ConsentKind) => `No ${L.label(k).toLowerCase()}`;
  const line = (label: string, v: boolean | null | undefined, no: string) => (
    <li className={cn(v === false ? 'font-semibold text-caution' : v == null ? 'text-ink-2' : 'text-ink-3')}>
      {v === true ? `${label} allowed` : v === false ? no : `${label}: not recorded, so don’t`}
    </li>
  );
  return (
    <ul aria-label="Consent" className="mt-2 space-y-0.5 text-[0.8438rem]">
      {line(L.label('photography'), photo, not('photography'))}
      {studentId && extra && line(L.label('video'), extra.video_consent, not('video'))}
      {studentId && extra && line(L.label('social_media'), extra.social_consent, not('social_media'))}
    </ul>
  );
}

/** Student (13+): their own consents, read-only, and who can change them (UR-08). */
export function StudentConsents() {
  const rows = useRows<C.MyConsent>(['my-consents'], C.MY_CONSENTS);
  if (!rows.data?.length) return null;
  const ask = rows.data[0]!.ask;
  return (
    <section aria-labelledby="consent-h">
      <div className="mb-1 border-b-2 border-ink pb-2">
        <h2 id="consent-h" className="section-title">Photos and filming</h2>
        <p className="text-[0.8125rem] text-ink-3">What the school may do. To change any of these, ask {ask}.</p>
      </div>
      <dl className="divide-y divide-line">
        {rows.data.map(c => (
          <div key={c.kind} className="py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-medium">{c.label}</dt>
              <dd className={cn('text-right text-[0.875rem]', c.granted === false ? 'font-semibold' : c.granted == null && 'text-ink-3')}>
                {c.granted === true ? 'Allowed' : c.granted === false ? 'Not allowed' : 'Not recorded, so not allowed'}
              </dd>
            </div>
            <dd className="text-[0.8125rem] text-ink-3">{c.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Office: the school's own names for each consent and what they mean (UR-08).
 *  Only the words change; what is recorded stays photography, video and social media. */
export function ConsentWording() {
  const studio = useRows<{ id: string }>(['consent-studio'], `select id from studio where id in (select app.studio_ids()) limit 1`).data?.[0];
  const rows = useRows<C.ConsentLabel>(['consent-labels', 'studio', studio?.id], C.CONSENT_LABELS, [studio?.id ?? null, null],
    { enabled: !!studio });
  const [editing, setEditing] = React.useState<C.ConsentLabel | null>(null);
  return (
    <section className="min-w-0">
      <div className="border-b-2 border-ink pb-2">
        <div className="flex min-h-9 items-center gap-3"><h2 className="section-title min-w-0 flex-1">Consent wording</h2></div>
        <p className="text-[0.8125rem] text-ink-3">What families, students and teachers see for each consent. Only the words change.</p>
      </div>
      {rows.isLoading && <Skeleton className="mt-3 h-24" />}
      <ul className="divide-y divide-line">
        {rows.data?.map(l => (
          <li key={l.kind} className="flex items-start gap-3 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{l.label}{l.renamed && <span className="font-normal text-ink-3"> · renamed</span>}</span>
              <span className="block text-[0.8125rem] text-ink-3">{l.description}</span>
            </span>
            <Button size="sm" variant="ghost" onClick={() => setEditing(l)} aria-label={`Change wording for ${l.label}`}>Change</Button>
          </li>
        ))}
      </ul>
      {editing && studio && <ConsentWordingSheet studioId={studio.id} row={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

const STANDARD: Record<C.ConsentKind, string> = { photography: 'photo', video: 'video', social_media: 'social media and public use' };

function ConsentWordingSheet({ studioId, row, onClose }: { studioId: string; row: C.ConsentLabel; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [label, setLabel] = React.useState(row.label);
  const [desc, setDesc] = React.useState(row.description);
  const save = useMutation({
    mutationFn: (v: { label: string; desc: string | null }) => runAs(session, q => q(C.SET_CONSENT_LABEL, [studioId, row.kind, v.label, v.desc])),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });
  return (
    <RecordSheet title="Consent wording" subtitle={`Recorded as ${STANDARD[row.kind]} consent`} onClose={onClose}
      saving={save.isPending} error={save.error} canSave={label.trim().length > 0} saveLabel="Save"
      onSave={() => save.mutate({ label, desc: desc.trim() === C.CONSENT_EXPLAIN[row.kind] ? null : desc })}>
      <Field label="Name" htmlFor="cw-label" hint="Short, as families would say it.">
        <Input id="cw-label" value={label} maxLength={60} onChange={e => setLabel(e.target.value)} />
      </Field>
      <Field label="What it means" htmlFor="cw-desc" hint="One or two plain sentences.">
        <Input id="cw-desc" value={desc} maxLength={400} onChange={e => setDesc(e.target.value)} />
      </Field>
      {row.renamed && (
        <Button size="sm" variant="ghost" disabled={save.isPending} onClick={() => save.mutate({ label: '', desc: null })}>
          Use the standard wording
        </Button>
      )}
    </RecordSheet>
  );
}
