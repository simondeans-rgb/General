'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort, time } from '@/lib/format';

/**
 * Any member of staff raises a concern (R-033), from the teacher's student
 * list, the office student sheet, the staff record or /safeguarding (UR-09).
 * The subject can be fixed by the caller (a child or a member of staff) or
 * chosen here: a child, another adult, or a member of staff.
 */
export function RaiseConcernSheet({ student, staff, onClose }: {
  student?: { id: string; first_name: string }; staff?: { id: string; name: string }; onClose: () => void;
}) {
  const { session } = useSession();
  const fixed = student ? 'child' : staff ? 'staff' : null;
  const [kind, setKind] = React.useState<'child' | 'adult' | 'staff'>(fixed ?? 'child');
  const [childId, setChildId] = React.useState(student?.id ?? '');
  const [staffId, setStaffId] = React.useState(staff?.id ?? '');
  const [who, setWho] = React.useState('');
  const [category, setCategory] = React.useState(staff ? 'allegation' : 'wellbeing');
  const [summary, setSummary] = React.useState('');
  const [urgent, setUrgent] = React.useState(false);
  const [sent, setSent] = React.useState<{ id: string; at: Date } | null>(null);
  const me = useRows<{ id: string }>(['sg-me'], G.MY_STUDIO).data?.[0];
  const children = useRows<{ id: string; name: string }>(['sg-child-pick'], G.CHILD_PICK, [], { enabled: !fixed && kind === 'child' });
  const staffList = useRows<{ id: string; display_name: string }>(['sg-staff-pick'], G.STAFF_PICK, [], { enabled: !fixed && kind === 'staff' });
  const raise = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ id: string }>(G.RAISE_ABOUT,
      [me?.id ?? null, kind, kind === 'child' ? childId : null, kind === 'staff' ? staffId : null, kind === 'adult' ? who : null,
       category, summary, urgent])))[0]!.id,
    onSuccess: id => setSent({ id, at: new Date() }),
  });
  if (sent) return <RecordSheet title="Concern recorded" onClose={onClose} onSave={onClose} saveLabel="Done">
    <p className="text-sm text-ink-2">The safeguarding lead and the owner have been told. You will not see it in the app again — that is deliberate. If a child is in immediate danger, call 999.</p>
    <p className="text-[0.8438rem] text-ink-3">Reference {sent.id.slice(0, 8).toUpperCase()} · {dateShort(sent.at)} {time(sent.at)}</p>
  </RecordSheet>;
  const subjectOk = kind === 'child' ? !!childId : kind === 'staff' ? !!staffId : who.trim().length >= 2;
  const about = student ? `About ${student.first_name}` : staff ? `About ${staff.name}` : undefined;
  return (
    <RecordSheet title="Raise a safeguarding concern" subtitle={about} onClose={onClose}
      saving={raise.isPending} error={raise.error} canSave={subjectOk && summary.trim().length >= 10} saveLabel="Send to the safeguarding lead"
      onSave={() => raise.mutate()}>
      <p className="border-l-2 border-critical py-1 pl-3 text-[0.875rem]">
        <strong className="font-semibold text-critical">If a child is in immediate danger, call 999 first.</strong> Write what you saw or were told, in their words where you can. Do not investigate.
      </p>
      {!fixed && (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Who is it about</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {([['child', 'A child'], ['adult', 'Another adult'], ['staff', 'A member of staff']] as const).map(([k, l]) => (
              <label key={k} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="radio" name="rc-kind" className="size-5 accent-[var(--color-accent)]" checked={kind === k}
                  onChange={() => { setKind(k); if (k === 'staff') setCategory('allegation'); else if (category === 'allegation') setCategory('wellbeing'); }} />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!fixed && kind === 'child' && (
        <Field label="Child" htmlFor="rc-child" required>
          <Select id="rc-child" value={childId} onChange={e => setChildId(e.target.value)}>
            <option value="">Choose a child</option>
            {children.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
      )}
      {!fixed && kind === 'staff' && (
        <Field label="Member of staff" htmlFor="rc-staff" required>
          <Select id="rc-staff" value={staffId} onChange={e => setStaffId(e.target.value)}>
            <option value="">Choose</option>
            {staffList.data?.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
          </Select>
        </Field>
      )}
      {kind === 'adult' && (
        <Field label="Who" htmlFor="rc-who" required hint="A name, or a description if you do not know it.">
          <Input id="rc-who" value={who} onChange={e => setWho(e.target.value)} />
        </Field>
      )}
      {kind === 'staff' && (
        <p className="text-[0.8438rem] text-ink-2">
          This is an allegation. Only the safeguarding lead and the owner see it, never the person it is about. The lead follows the
          local authority designated officer (LADO) process.
        </p>
      )}
      <Field label="What kind of concern" htmlFor="rc-c">
        <Select id="rc-c" value={category} onChange={e => setCategory(e.target.value)}>
          {G.CATEGORIES.filter(([k]) => kind === 'staff' || k !== 'allegation').map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </Field>
      <Field label="What happened" htmlFor="rc-s" required hint="Facts, dates and times. Only the lead and the owner will read this.">
        <textarea id="rc-s" rows={6} value={summary} onChange={e => setSummary(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={urgent} onChange={e => setUrgent(e.target.checked)} />
        {kind === 'child' ? 'The child may be at risk today' : 'A child may be at risk today'}
      </label>
    </RecordSheet>
  );
}

/** Staff checks (R-035). The owner records them; the office and the lead read them (UR-41). */
export function StaffChecks({ staffId, readOnly = false }: { staffId: string; readOnly?: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const rows = useRows<G.Check>(['staff-checks', staffId], G.CHECKS, [staffId]);
  const [f, setF] = React.useState({ kind: 'dbs', reference: '', checked: '', expires: '' });
  const add = useMutation({
    mutationFn: () => runAs(session, q => q(G.ADD_CHECK, [staffId, f.kind, f.reference, f.checked, f.expires || null])),
    onSuccess: () => { setF({ kind: 'dbs', reference: '', checked: '', expires: '' }); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const soon = (d: string | null) => d && new Date(d).getTime() < Date.now() + 30 * 86400_000;
  return (
    <div className="space-y-2">
      <ul className="divide-y divide-line">
        {rows.data?.map(c => (
          <li key={c.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span>{G.CHECK_LABEL[c.kind]}{c.reference ? ` · ${c.reference}` : ''} · {dateShort(c.checked_on)}</span>
            {c.expires_on && <span className={soon(c.expires_on) ? 'shrink-0 text-[0.8125rem] font-semibold text-critical' : 'shrink-0 text-[0.8125rem] text-ink-3'}>{new Date(c.expires_on) < new Date() ? 'Expired' : 'Expires'} {dateShort(c.expires_on)}</span>}
          </li>
        ))}
        {rows.data?.length === 0 && <li className="text-[0.8125rem] text-ink-3">No checks recorded.</li>}
      </ul>
      {!readOnly && <>
      <div className="grid grid-cols-2 gap-2">
        <Select aria-label="Kind of check" value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>
          {Object.entries(G.CHECK_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
        <Input aria-label="Certificate number" placeholder="Certificate no." value={f.reference} onChange={e => setF({ ...f, reference: e.target.value })} />
        <Field label="Checked on" htmlFor={`ck-d-${staffId}`}><Input id={`ck-d-${staffId}`} type="date" value={f.checked} onChange={e => setF({ ...f, checked: e.target.value })} /></Field>
        <Field label="Expires" htmlFor={`ck-e-${staffId}`}><Input id={`ck-e-${staffId}`} type="date" value={f.expires} onChange={e => setF({ ...f, expires: e.target.value })} /></Field>
      </div>
      {add.error != null && <ErrorState error={add.error} />}
      <Button size="sm" disabled={!f.checked} loading={add.isPending} onClick={() => add.mutate()}>Add check</Button>
      </>}
      <p className="text-[0.75rem] text-ink-3">{readOnly ? 'Only the owner records checks.' : 'The office and the safeguarding lead can see these.'} The owner and the lead are told 30 days before anything expires.</p>
    </div>
  );
}

/** What each retention step does, for the "Due now" line. */
const STEP_TEXT: [string, string, string][] = [
  ['medical', 'medical record to delete', 'medical records to delete'],
  ['anonymise', 'child to anonymise', 'children to anonymise'],
  ['purge', 'child with long-deleted records to remove', 'children with long-deleted records to remove'],
  ['support', 'support note to delete', 'support notes to delete'],
  ['attendance', 'leaver’s attendance to delete', 'leavers’ attendance to delete'],
  ['prospect', 'old enquiry to remove', 'old enquiries to remove'],
  ['financial', 'family to anonymise on invoices', 'families to anonymise on invoices'],
  ['dsl_note', 'shared-care note to clear', 'shared-care notes to clear'],
  ['messages', 'conversation with old messages to delete', 'conversations with old messages to delete'],
  ['staff_check', 'former staff member’s certificate numbers to clear', 'former staff members’ certificate numbers to clear'],
  ['staff', 'former staff record to anonymise', 'former staff records to anonymise'],
  ['concern', 'closed concern to delete', 'closed concerns to delete'],
  ['audit', 'batch of old audit log entries to delete', 'batches of old audit log entries to delete'],
  ['access_log', 'batch of old access log entries to delete', 'batches of old access log entries to delete'],
];

/** Data retention, owner only (R-041, 0058). */
export function RetentionCard({ studioId }: { studioId: string }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const pol = useRows<G.Retention>(['retention'], G.RETENTION).data?.[0];
  const preview = useRows<{ step: string; student_id: string | null; who: string; left_on: string; reason: string | null; entity_id: string | null }>(['retention-preview'], G.PREVIEW_RETENTION, [studioId]);
  const [m, setM] = React.useState<Partial<G.Retention>>({});
  const v = { ...pol, ...m } as G.Retention;
  const [done, setDone] = React.useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(G.SET_RETENTION, [v.medical_months, v.personal_months, v.financial_months, v.prospect_days, v.concern_months || null,
      v.message_months, v.attendance_months, v.support_months, v.staff_months, v.staff_check_months, v.audit_months, v.dsl_note_months, v.auto_apply])),
    onSuccess: () => { setM({}); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const run = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ n: number }>(G.RUN_RETENTION, [studioId])))[0]!.n,
    onSuccess: n => { setDone(`${n} change${n === 1 ? '' : 's'} made and recorded in the audit log.`); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  if (!pol) return <Card><Skeleton className="h-24" /></Card>;
  const rows = preview.data ?? [];
  const held = rows.filter(p => p.step === 'held');
  const due = STEP_TEXT.map(([k, one, many]) => [rows.filter(p => p.step === k).length, one, many] as const).filter(([n]) => n > 0);
  const total = rows.length - held.length;
  const applyOn = pol.auto_preview_at ? new Date(new Date(pol.auto_preview_at).getTime() + 14 * 86_400_000) : null;
  const field = (f: typeof G.RETENTION_FIELDS[number]) => (
    <Field key={f.key} label={f.label} htmlFor={`rt-${f.key}`}
      hint={`${f.unit}, ${f.min} to ${f.max}${f.adviser ? '. Check with your data protection adviser.' : ''}`}>
      <Input id={`rt-${f.key}`} type="number" min={f.min} max={f.max} value={v[f.key] as number}
        onChange={e => setM(x => ({ ...x, [f.key]: Number(e.target.value) }))} />
    </Field>
  );
  return (
    <Card>
      <CardHeader title="Keeping data" subtitle="How long details are kept after a child or a member of staff leaves, and for enquiries that went nowhere. These are starting points: check every period with your data protection adviser." />
      <div className="space-y-4 pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {G.RETENTION_FIELDS.filter(f => !f.adviser).map(field)}
          <Field label="Delete closed safeguarding concerns after" htmlFor="rt-cm" hint="months — empty keeps them. Set from your safeguarding policy (often until the child is 25).">
            <Input id="rt-cm" type="number" min={12} max={600} value={v.concern_months ?? ''} placeholder="Keep"
                   onChange={e => setM(x => ({ ...x, concern_months: e.target.value ? Number(e.target.value) : null }))} />
          </Field>
        </div>
        <div>
          <h3 className="text-[0.9062rem] font-semibold">Other records</h3>
          <p className="text-[0.8125rem] text-ink-3">Kept long by default. A legal hold or a safeguarding record keeps everything about that child or member of staff.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{G.RETENTION_FIELDS.filter(f => f.adviser).map(field)}</div>
        </div>
        <label className="flex items-start gap-3 border-t border-line pt-3 text-[0.9062rem]">
          <input type="checkbox" className="mt-0.5 size-5 accent-[var(--color-accent)]" checked={v.auto_apply}
                 onChange={e => setM(x => ({ ...x, auto_apply: e.target.checked }))} />
          <span><span className="font-medium">Apply automatically each month</span>
            <span className="block text-[0.8125rem] text-ink-3">Each month you are told what is due. With this on, it is applied 14 days later unless you apply it first; anything that became due since waits for the next month. Off by default.</span></span>
        </label>
        {Object.keys(m).length > 0 && <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Save settings</Button>}
        {save.error != null && <ErrorState error={save.error} />}
        <div className="border-t border-line pt-3 text-[0.9062rem]">
          {due.length === 0
            ? <p>Nothing is due now.</p>
            : <><p>Due now:</p>
              <ul className="mt-1 text-[0.875rem]">{due.map(([n, one, many]) => <li key={one}><b>{n}</b> {n === 1 ? one : many}</li>)}</ul></>}
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            {pol.last_run_at ? `Last applied ${dateShort(pol.last_run_at)}. ` : ''}
            {pol.auto_preview_at ? `Monthly check ${dateShort(pol.auto_preview_at)}: ${pol.auto_preview_count ?? 0} due.` : 'The first monthly check has not run yet.'}
            {pol.auto_apply && pol.auto_preview_at && !pol.auto_applied_at && (pol.auto_preview_count ?? 0) > 0 && applyOn ? ` Applies automatically on ${dateShort(applyOn.toISOString())}.` : ''}
            {pol.auto_applied_at ? ` Applied automatically ${dateShort(pol.auto_applied_at)}.` : ''}
          </p>
        </div>
        {held.length > 0 && (
          <div>
            <p className="text-[0.9062rem]"><b>{held.length}</b> record{held.length === 1 ? '' : 's'} held back because of a legal hold or a safeguarding record:</p>
            <ul className="mt-1 divide-y divide-line text-[0.875rem]">
              {held.map(h => <li key={h.entity_id ?? h.who} className="flex flex-wrap justify-between gap-x-3 py-1.5"><span>{h.who}</span><span className="text-ink-3">{h.reason}</span></li>)}
            </ul>
            <p className="mt-1 text-[0.7812rem] text-ink-3">The safeguarding lead reviews holds on the Safeguarding page.</p>
          </div>
        )}
        {done && <p role="status" className="text-sm text-positive">{done}</p>}
        {run.error != null && <ErrorState error={run.error} />}
        <Button size="sm" disabled={total === 0} loading={run.isPending} onClick={() => run.mutate()}>Apply now</Button>
      </div>
    </Card>
  );
}
