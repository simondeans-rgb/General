'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { RecordSheet } from '@/components/app/record-sheet';
import { Button, ErrorState, Field, Input, Notice, Select, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as G from '@/lib/repos/safeguarding';
import { dateShort, time } from '@/lib/format';

/** The school's route outside the app, and the national line, in plain words (F1). */
export function OutsideRoute({ route, className }: { route: string | null | undefined; className?: string }) {
  return (
    <div className={cn('text-[0.875rem]', className)}>
      {route
        ? <p className="whitespace-pre-wrap"><span className="font-semibold">Outside the school: </span>{route}</p>
        : <p><span className="font-semibold">Outside the school: </span>your local authority designated officer (LADO). Search your council’s website for “LADO”. The school has not recorded the contact yet.</p>}
      <p className="mt-1 text-[0.8125rem] text-ink-3">{G.NATIONAL_ROUTE}</p>
    </div>
  );
}

const PART: Record<string, string> = { lead: 'safeguarding lead', deputy: 'deputy safeguarding lead', owner: 'owner' };

/** The receipt says exactly who was told, from what the database did (N-01, N-03). */
function ConcernReceipt({ r, at, onClose }: { r: G.Receipt; at: Date; onClose: () => void }) {
  return (
    <RecordSheet title="Concern recorded" onClose={onClose} onSave={onClose} saveLabel="Done">
      {r.nobody ? (
        <Notice word="Act today" tone="critical" title="Nobody in the school has been told"
          detail="It is about the only person who could read it here, and no other safeguarding lead is named. It is saved, and a lead named later will be told. Report it outside the app today." />
      ) : (
        <p className="text-sm">
          <span className="font-semibold">Told: </span>{r.told.map(t => `${t.name} (${PART[t.part] ?? t.part})`).join(', ')}.
          {r.no_lead && ' Your school has not named a safeguarding lead, so it went to the owner.'}
        </p>
      )}
      {r.not_told.length > 0 && (
        <p className="text-sm"><span className="font-semibold">Not told, because it is about them: </span>{r.not_told.map(t => `${t.name} (${PART[t.part] ?? t.part})`).join(', ')}.</p>
      )}
      <p className="text-[0.875rem] text-ink-2">You will not see it in the app again. That is deliberate. If you are worried it has not been acted on, contact the LADO directly.</p>
      <OutsideRoute route={r.outside_route} className="border-l-2 border-ink py-1 pl-3" />
      <p className="text-[0.8438rem] text-ink-3">Reference {r.id.slice(0, 8).toUpperCase()} · {dateShort(at)} {time(at)}</p>
    </RecordSheet>
  );
}

/**
 * Any member of staff raises a concern (R-033), from the teacher's student
 * list, the office student sheet, the staff record or /safeguarding (UR-09).
 * The subject can be fixed by the caller (a child or a member of staff) or
 * chosen here: a child, another adult, or anyone on the staff (N-02). The
 * form says before sending who will read it, and the outside route (F1).
 */
export function RaiseConcernSheet({ student, staff, onClose }: {
  student?: { id: string; first_name: string }; staff?: { id: string; name: string }; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const fixed = student ? 'child' : staff ? 'staff' : null;
  const [kind, setKind] = React.useState<'child' | 'adult' | 'staff'>(fixed ?? 'child');
  const [childId, setChildId] = React.useState(student?.id ?? '');
  // A staff record id, or "u:" + a login for office staff and owners with no record.
  const [staffKey, setStaffKey] = React.useState(staff?.id ?? '');
  const [who, setWho] = React.useState('');
  const [category, setCategory] = React.useState(staff ? 'allegation' : 'wellbeing');
  const [summary, setSummary] = React.useState('');
  const [urgent, setUrgent] = React.useState(false);
  const [involved, setInvolved] = React.useState<string[]>([]);
  const [sent, setSent] = React.useState<{ r: G.Receipt; at: Date } | null>(null);
  const me = useRows<G.MyStudio>(['sg-me'], G.MY_STUDIO).data?.[0];
  const routing = useRows<{ r: G.Routing | null }>(['sg-routing', me?.id], G.ROUTING, [me?.id], { enabled: !!me }).data?.[0]?.r ?? null;
  const children = useRows<{ id: string; name: string }>(['sg-child-pick'], G.CHILD_PICK, [], { enabled: kind !== 'child' || !fixed });
  const staffList = useRows<G.StaffPerson>(['sg-staff-pick', me?.id], G.STAFF_PICK, [me?.id], { enabled: !!me && (kind === 'staff') });
  const keyOf = (p: G.StaffPerson) => p.staff_id ?? `u:${p.user_id}`;
  const subject = staffList.data?.find(p => keyOf(p) === staffKey) ?? null;
  const raise = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ r: G.Receipt }>(G.RECORD,
      [me?.id ?? null, kind, kind === 'child' ? childId : null,
       kind === 'staff' && !staffKey.startsWith('u:') ? staffKey : null,
       kind === 'staff' && staffKey.startsWith('u:') ? staffKey.slice(2) : null,
       kind === 'adult' ? who : null, category, summary, urgent, kind === 'child' ? null : involved])))[0]!.r,
    // A reader raising from the log sees it there (same opening: not a new look).
    onSuccess: r => { setSent({ r, at: new Date() }); qc.invalidateQueries({ queryKey: ['sg-log'] }); },
  });
  if (sent) return <ConcernReceipt r={sent.r} at={sent.at} onClose={onClose} />;

  // Who will read it, worked out the same way the database does.
  const subjectUser = kind === 'staff' ? subject?.user_id ?? null : null;
  const readers = routing ? [routing.lead, routing.deputy, ...routing.owners].filter((p): p is G.Person => !!p && p.user_id !== subjectUser) : [];
  const readerNames = [...new Map(readers.map(p => [p.user_id, p.name])).values()];
  const noLead = !!routing && !routing.lead && !routing.deputy;
  const nobody = !!routing && readerNames.length === 0;
  const subjectOk = kind === 'child' ? !!childId : kind === 'staff' ? !!staffKey : who.trim().length >= 2;
  const about = student ? `About ${student.first_name}` : staff ? `About ${staff.name}` : undefined;
  return (
    <RecordSheet title="Raise a safeguarding concern" subtitle={about} onClose={onClose}
      saving={raise.isPending} error={raise.error} canSave={!!me && subjectOk && summary.trim().length >= 10}
      saveLabel={nobody ? 'Save the record' : noLead ? 'Send to the owner' : 'Send to the safeguarding lead'}
      onSave={() => raise.mutate()}>
      <p className="border-l-2 border-critical py-1 pl-3 text-[0.875rem]">
        <strong className="font-semibold text-critical">If a child is in immediate danger, call 999 first.</strong> Write what you saw or were told, in their words where you can. Do not investigate.
      </p>
      {noLead && !nobody && (
        <Notice word="No lead" tone="caution" title="Your school has not named a safeguarding lead"
          detail={<>This goes to {readerNames.join(' and ')} (owner). If it is about them, or you are worried it will not be acted on, report it outside the school as well.</>} />
      )}
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
        <Field label="Member of staff" htmlFor="rc-staff" required hint="Anyone on the staff: teachers, the office and the owner.">
          <Select id="rc-staff" value={staffKey} onChange={e => setStaffKey(e.target.value)}>
            <option value="">Choose</option>
            {staffList.data?.map(p => <option key={keyOf(p)} value={keyOf(p)}>{p.name}{p.role === 'owner' ? ' (owner)' : p.role === 'admin' ? ' (office)' : ''}</option>)}
          </Select>
        </Field>
      )}
      {kind === 'adult' && (
        <Field label="Who" htmlFor="rc-who" required hint="A name, or a description if you do not know it.">
          <Input id="rc-who" value={who} onChange={e => setWho(e.target.value)} />
        </Field>
      )}
      {kind === 'staff' && !nobody && (
        <p className="text-[0.8438rem] text-ink-2">
          This is an allegation. {readerNames.length ? `${readerNames.join(', ')} will read it` : 'The safeguarding lead and the owner read it'}, never the person it is about.
          The lead follows the local authority designated officer (LADO) process.
        </p>
      )}
      {nobody && (
        <div className="space-y-2">
          <Notice word="Act today" tone="critical" title="Nobody in the school can be told about this"
            detail="It is about the only person who reads concerns here. It will be saved, and a lead named later will be told, but you must report it outside the school today." />
          <OutsideRoute route={routing?.outside_route} className="border-l-2 border-critical py-1 pl-3" />
        </div>
      )}
      {noLead && !nobody && <OutsideRoute route={routing?.outside_route} className="border-l-2 border-line-strong py-1 pl-3" />}
      {kind !== 'child' && (
        <ChildrenInvolved options={children.data ?? []} value={involved} onChange={setInvolved} />
      )}
      <Field label="What kind of concern" htmlFor="rc-c">
        <Select id="rc-c" value={category} onChange={e => setCategory(e.target.value)}>
          {G.CATEGORIES.filter(([k]) => kind === 'staff' || k !== 'allegation').map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
      </Field>
      <Field label="What happened" htmlFor="rc-s" required hint={`Facts, dates and times. Only ${readerNames.length ? readerNames.join(', ') : 'the lead and the owner'} will read this.`}>
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

/** Children involved in a concern about an adult or a member of staff (N-04). */
function ChildrenInvolved({ options, value, onChange }: { options: { id: string; name: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Field label="Children involved" htmlFor="rc-kids" hint="Optional. Only the lead and the owner see the link, on each child’s record.">
        <Select id="rc-kids" value="" onChange={e => { if (e.target.value && !value.includes(e.target.value)) onChange([...value, e.target.value]); }}>
          <option value="">Add a child</option>
          {options.filter(o => !value.includes(o.id)).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
      </Field>
      {value.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.875rem]">
          {value.map(id => (
            <li key={id} className="flex items-center gap-1">
              {options.find(o => o.id === id)?.name ?? 'Child'}
              <Button size="sm" variant="ghost" aria-label={`Remove ${options.find(o => o.id === id)?.name ?? 'child'}`} onClick={() => onChange(value.filter(v => v !== id))}>
                <X className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** On a child's record: the concerns they are part of, for the lead and the owner only (N-04).
 *  Renders nothing for anyone else; each look is logged. */
export function ChildConcernLinks({ studentId }: { studentId: string }) {
  const { session } = useSession();
  const me = useRows<G.MyStudio>(['sg-me'], G.MY_STUDIO).data?.[0];
  const rows = useQuery({ queryKey: ['sg-child-concerns', studentId], enabled: !!me?.can_read, staleTime: Infinity,
    queryFn: () => runAs(session, q => q<G.ChildConcern>(G.CHILD_CONCERNS, [studentId])) });
  if (!me?.can_read || !rows.data?.length) return null;
  return (
    <div className="border-l-2 border-critical py-1 pl-3 text-[0.875rem]">
      <p className="font-semibold">Safeguarding: {rows.data.length} concern{rows.data.length === 1 ? '' : 's'}</p>
      <ul className="mt-0.5 text-[0.8125rem] text-ink-2">
        {rows.data.map(c => (
          <li key={c.concern_id}>
            {dateShort(c.created_at)} · {c.linked ? `named in a concern about ${c.subject_name}` : 'about this child'} · {c.status}
          </li>
        ))}
      </ul>
      <p className="mt-0.5 text-[0.75rem] text-ink-3">Only you and the {me.dsl_user_id ? 'lead or owner' : 'owner'} see this. <Link href="/safeguarding" className="font-semibold text-accent-text hover:underline">Open the log</Link></p>
    </div>
  );
}

/** Open a self-contained page for printing (chronology, consent list). */
export function printPage(title: string, body: string) {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font:14px/1.5 Inter,Arial,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;color:#111}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:24px 0 6px;border-bottom:2px solid #111;padding-bottom:4px}
.mark{border:2px solid #b00020;color:#b00020;font-weight:700;padding:6px 10px;margin:0 0 16px;text-transform:uppercase;letter-spacing:.02em}
.sub{color:#555}table{border-collapse:collapse;width:100%}td,th{border-top:1px solid #ccc;padding:6px 4px;text-align:left;vertical-align:top}
th{font-size:12px;color:#555}.no{font-weight:700}ol{padding-left:20px}li{margin:0 0 10px}@page{margin:16mm}</style>
${body}<script>window.print()</script>`);
  w.document.close();
  return true;
}
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** The chronology of one concern as printable HTML (F13). */
export function chronologyHtml(c: G.Chronology, purpose: 'print' | 'export') {
  const when = (v: string) => `${dateShort(v)} ${time(v)}`;
  return `<p class="mark">Confidential · safeguarding record · ${purpose === 'print' ? 'printed' : 'exported'} by ${esc(c.prepared_by)} on ${esc(when(c.prepared_at))} · logged</p>
<h1>Chronology: ${esc(c.subject)}</h1>
<p class="sub">${esc(c.school)} · Reference ${esc(c.reference)} · Status: ${esc(c.status)}${c.allegation ? ' · Allegation about a member of staff (LADO)' : ''}</p>
<table><tr><th>Raised</th><td>${esc(when(c.created_at))} by ${esc(c.raised_by ?? 'Unknown')}</td></tr>
<tr><th>Kind</th><td>${esc(G.CATEGORIES.find(x => x[0] === c.category)?.[1] ?? c.category)}${c.immediate_risk ? ' · at risk that day' : ''}</td></tr>
${c.children.length ? `<tr><th>Children involved</th><td>${c.children.map(esc).join(', ')}</td></tr>` : ''}
${c.routing_note ? `<tr><th>Who was told</th><td>${esc(c.routing_note)}</td></tr>` : ''}
${c.hold ? `<tr><th>Legal hold</th><td>${esc(c.hold.reason)} · review by ${esc(dateShort(c.hold.review_on))}</td></tr>` : ''}</table>
<h2>What was reported</h2><p style="white-space:pre-wrap">${esc(c.summary)}</p>
<h2>What was done</h2>${c.actions.length ? `<ol>${c.actions.map(a => `<li><b>${esc(when(a.at))}</b> · ${esc(a.by ?? 'Unknown')}${a.status_to ? ` · now ${esc(a.status_to)}` : ''}
<div style="white-space:pre-wrap">${esc(a.note)}</div>
${a.referred_to ? `<div>Referred to ${esc(a.referred_to)}${a.referred_on ? ` on ${esc(dateShort(a.referred_on))}` : ''}${a.referral_ref ? ` · their reference ${esc(a.referral_ref)}` : ''}</div>` : ''}
${a.outcome ? `<div>Outcome: ${esc(a.outcome)}</div>` : ''}</li>`).join('')}</ol>` : '<p>No actions recorded yet.</p>'}
<p class="sub">Keep this copy locked away and destroy it when it is no longer needed. The safeguarding log is the record.</p>`;
}

/** Staff checks (R-035). The owner records them; the office and the lead read them (UR-41).
 *  For a teacher, by their staff record; for office staff and owners with none, by their login (N-02). */
export function StaffChecks({ staffId, userId = null, studioId = null, readOnly = false }: {
  staffId: string | null; userId?: string | null; studioId?: string | null; readOnly?: boolean;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const key = staffId ?? userId ?? '';
  const rows = useRows<G.Check>(['staff-checks', key], G.CHECKS, [staffId, userId]);
  const [f, setF] = React.useState({ kind: 'dbs', reference: '', checked: '', expires: '' });
  const add = useMutation({
    mutationFn: () => runAs(session, q => q(G.ADD_CHECK, [staffId, userId, studioId, f.kind, f.reference, f.checked, f.expires || null])),
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
        <Field label="Checked on" htmlFor={`ck-d-${key}`}><Input id={`ck-d-${key}`} type="date" value={f.checked} onChange={e => setF({ ...f, checked: e.target.value })} /></Field>
        <Field label="Expires" htmlFor={`ck-e-${key}`}><Input id={`ck-e-${key}`} type="date" value={f.expires} onChange={e => setF({ ...f, expires: e.target.value })} /></Field>
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
  ['media', 'video or photo of children to delete', 'videos or photos of children to delete'],
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
      v.message_months, v.attendance_months, v.support_months, v.staff_months, v.staff_check_months, v.audit_months, v.dsl_note_months, v.auto_apply, v.media_months])),
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
      hint={`${f.unit}, ${f.min} to ${f.max}`}>
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
