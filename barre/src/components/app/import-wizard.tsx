'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { Notice, Button, ErrorState, Input, Select, ViewTabs } from '@/components/ui';
import { useRows } from '@/lib/query';
import { money, dateShort } from '@/lib/format';
import { inviteLink } from '@/lib/repos/platform';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadCsv, parseCsv } from '@/lib/csv';

/** Our fields, and the column headings schools tend to use for each. */
const FIELDS: { key: string; label: string; required?: boolean; match: RegExp }[] = [
  { key: 'parent_name', label: 'Parent name', required: true, match: /^(parent|guardian|carer|contact|mother|father)( ?1)?( full)? ?name$|^parent$|^guardian$/i },
  { key: 'parent_email', label: 'Parent email', match: /^(parent|guardian|contact)?( ?1)? ?e-?mail/i },
  { key: 'parent_phone', label: 'Parent phone', match: /^(parent|guardian|contact)?( ?1)? ?(phone|mobile|tel)/i },
  { key: 'second_parent_name', label: 'Second parent name', match: /(parent|guardian|contact) ?2 ?name|second (parent|guardian)/i },
  { key: 'second_parent_email', label: 'Second parent email', match: /(parent|guardian|contact) ?2 ?e-?mail/i },
  { key: 'second_parent_phone', label: 'Second parent phone', match: /(parent|guardian|contact) ?2 ?(phone|mobile)/i },
  { key: 'child_first_name', label: 'Child first name', required: true, match: /^(child|student|dancer|pupil)?( ?first| ?fore)( ?name)?$|^first ?name$/i },
  { key: 'child_last_name', label: 'Child last name', match: /^(child|student|dancer|pupil)?( ?last| ?sur)( ?name)?$|^surname$/i },
  { key: 'child_dob', label: 'Date of birth', required: true, match: /d\.?o\.?b|date of birth|birth ?date|birthday/i },
  { key: 'emergency_name', label: 'Emergency contact name', match: /emergency.*name|^emergency contact$/i },
  { key: 'emergency_phone', label: 'Emergency contact phone', match: /emergency.*(phone|number|tel|mobile)/i },
  { key: 'allergies', label: 'Allergies', match: /allerg/i },
  { key: 'medical_notes', label: 'Medical notes', match: /medical|health|condition/i },
  { key: 'photo_consent', label: 'Photo consent', match: /photo/i },
  { key: 'classes', label: 'Classes', match: /class|course/i },
];

const CLASS_FIELDS: typeof FIELDS = [
  { key: 'name', label: 'Class name', required: true, match: /^(class|course)?( ?name)?$|^class$|^title$/i },
  { key: 'style', label: 'Dance style', required: true, match: /style|genre|discipline/i },
  { key: 'level', label: 'Level', match: /level|grade/i },
  { key: 'day', label: 'Day', required: true, match: /^day|weekday/i },
  { key: 'time', label: 'Start time', required: true, match: /time|start/i },
  { key: 'duration', label: 'Minutes', match: /duration|minutes|length|mins/i },
  { key: 'location', label: 'Location', match: /location|venue|site|studio$/i },
  { key: 'room', label: 'Room', match: /room|hall/i },
  { key: 'teacher', label: 'Teacher', match: /teacher|instructor|tutor/i },
  { key: 'capacity', label: 'Places', required: true, match: /capacity|places|max|size/i },
  { key: 'age_min', label: 'Youngest age', match: /age ?(min|from)|min(imum)? ?age|youngest/i },
  { key: 'age_max', label: 'Oldest age', match: /age ?(max|to)|max(imum)? ?age|oldest/i },
  { key: 'price', label: 'Price (£)', match: /price|fee|cost/i },
  { key: 'pricing', label: 'Charged per', match: /pricing|per|billing/i },
  { key: 'term', label: 'Term', match: /^term$/i },
];
const BALANCE_FIELDS: typeof FIELDS = [
  { key: 'parent_email', label: 'Parent email', match: /e-?mail/i },
  { key: 'family', label: 'Family name', match: /family|account|surname|name/i },
  { key: 'balance', label: 'Balance owed (£)', required: true, match: /balance|owed|owing|outstanding|due/i },
  { key: 'credit', label: 'Credit held (£)', match: /credit/i },
];

// History from the previous system (UR-32): a record, never money owed.
const CHILD_FIELDS: typeof FIELDS = [
  { key: 'child_first_name', label: 'Child first name', required: true, match: /^(child|student|dancer|pupil)?( ?first| ?fore)( ?name)?$|^first ?name$/i },
  { key: 'child_last_name', label: 'Child last name', match: /^(child|student|dancer|pupil)?( ?last| ?sur)( ?name)?$|^surname$/i },
  { key: 'child_dob', label: 'Date of birth', match: /d\.?o\.?b|date of birth|birth ?date|birthday/i },
  { key: 'parent_email', label: 'Parent email', match: /e-?mail/i },
];
const INVOICE_FIELDS: typeof FIELDS = [
  { key: 'parent_email', label: 'Parent email', match: /e-?mail/i },
  { key: 'family', label: 'Family name', match: /family|account|customer|contact|surname/i },
  { key: 'number', label: 'Invoice number', required: true, match: /^(invoice )?(number|no\.?|#|ref(erence)?)$|invoice ?(no|number|#)/i },
  { key: 'issued_on', label: 'Invoice date', required: true, match: /^(invoice )?date$|issued|raised/i },
  { key: 'due_on', label: 'Due date', match: /due/i },
  { key: 'description', label: 'Description', match: /desc|detail|item|memo/i },
  { key: 'total', label: 'Total (£)', required: true, match: /total|amount|gross/i },
  { key: 'paid', label: 'Paid (£)', match: /paid|received/i },
];
const ATTENDANCE_FIELDS: typeof FIELDS = [...CHILD_FIELDS,
  { key: 'period', label: 'Term', required: true, match: /term|period|season/i },
  { key: 'class', label: 'Class', match: /class|course/i },
  { key: 'attended', label: 'Attended', required: true, match: /attend|present/i },
  { key: 'absent', label: 'Absent', match: /absen|missed/i },
];
const EXAM_FIELDS: typeof FIELDS = [...CHILD_FIELDS,
  { key: 'board', label: 'Exam board', required: true, match: /board|society|syllabus/i },
  { key: 'grade', label: 'Grade', required: true, match: /grade|level|exam$/i },
  { key: 'exam_date', label: 'Exam date', required: true, match: /date|taken|sat/i },
  { key: 'result', label: 'Result', match: /result|outcome|award/i },
  { key: 'mark', label: 'Mark', match: /mark|score/i },
  { key: 'title', label: 'Exam session', match: /session|title/i },
];

type Kind = 'families' | 'classes' | 'balances' | 'invoices' | 'attendance' | 'exams';
type Tab = 'classes' | 'families' | 'balances' | 'history' | 'invites';
const HISTORY: Kind[] = ['invoices', 'attendance', 'exams'];
const FN: Record<Exclude<Kind, 'balances'>, string> = {
  families: 'import_families', classes: 'import_classes', invoices: 'import_invoice_history',
  attendance: 'import_attendance_history', exams: 'import_exam_results',
};
const KINDS: Record<Kind, { title: string; sub: string; fields: typeof FIELDS; unit: string; template: Record<string, string> }> = {
  families: { title: 'Import families', sub: 'One row per child, from a CSV file.', fields: FIELDS, unit: 'children', template: {
    'Parent name': 'Ruth Okafor', 'Parent email': 'ruth@example.com', 'Parent phone': '07700 900400',
    'Second parent name': '', 'Second parent email': '', 'Second parent phone': '',
    'Child first name': 'Ada', 'Child last name': 'Okafor', 'Date of birth': '14/03/2018',
    'Emergency contact name': 'Grace Okafor', 'Emergency contact phone': '07700 900401',
    'Allergies': 'Peanuts', 'Medical notes': '', 'Photo consent': 'Yes', 'Classes': 'Pre-School Ballet; Junior Tap' } },
  classes: { title: 'Import your timetable', sub: 'One row per weekly class. Each class gets its sessions for the term.', fields: CLASS_FIELDS, unit: 'classes', template: {
    'Class name': 'Junior Jazz', 'Style': 'Jazz', 'Level': 'Grade 1', 'Day': 'Wednesday', 'Time': '17:30', 'Minutes': '45',
    'Location': '', 'Room': 'Studio 1', 'Teacher': '', 'Places': '16', 'Age min': '7', 'Age max': '10', 'Price': '54.00', 'Pricing': 'term', 'Term': '' } },
  balances: { title: 'Import opening balances', sub: 'One row per family: what they owe, or credit they hold, on a date.', fields: BALANCE_FIELDS, unit: 'families', template: {
    'Parent email': 'ruth@example.com', 'Family': 'Okafor', 'Balance': '45.00', 'Credit': '' } },
  invoices: { title: 'Import past invoices', sub: 'One row per invoice from your previous system, kept as history.', fields: INVOICE_FIELDS, unit: 'invoices', template: {
    'Parent email': 'ruth@example.com', 'Family': 'Okafor', 'Invoice number': 'INV-1042', 'Invoice date': '01/09/2025', 'Due date': '15/09/2025',
    'Description': 'Autumn term fees', 'Total': '120.00', 'Paid': '120.00' } },
  attendance: { title: 'Import attendance history', sub: 'One row per child, term and class: how many classes they came to.', fields: ATTENDANCE_FIELDS, unit: 'rows', template: {
    'Child first name': 'Ada', 'Child last name': 'Okafor', 'Date of birth': '14/03/2018', 'Parent email': 'ruth@example.com',
    'Term': 'Autumn 2025', 'Class': 'Pre-School Ballet', 'Attended': '11', 'Absent': '1' } },
  exams: { title: 'Import exam results', sub: 'One row per child and exam already taken.', fields: EXAM_FIELDS, unit: 'results', template: {
    'Child first name': 'Ada', 'Child last name': 'Okafor', 'Date of birth': '14/03/2018', 'Parent email': 'ruth@example.com',
    'Exam board': 'RAD', 'Grade': 'Primary', 'Exam date': '20/06/2025', 'Result': 'Merit', 'Mark': '72', 'Exam session': 'RAD summer exams' } },
};

type Check = { ok: boolean; rows: number; families?: number; children?: number; enrolled?: number; skipped?: number;
  medical?: number; classes?: number; sessions?: number; invoices?: number; credits?: number; owed_minor?: number; credit_minor?: number;
  records?: number; results?: number;
  errors: { row: number; message: string }[]; warnings: { message: string }[] };

/**
 * Bring a school's families in from a spreadsheet (R-013): choose a CSV, match
 * its columns, see every problem before anything is written, then import it all
 * in one go — or nothing at all.
 */
export function ImportWizard({ onClose, initial = 'families' }: { onClose: () => void; initial?: Kind | 'invites' }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [kind, setKind] = React.useState<Kind>(initial === 'invites' ? 'families' : initial);
  const [tab, setTab] = React.useState<Tab>(initial === 'invites' ? 'invites' : HISTORY.includes(initial) ? 'history' : initial as Tab);
  const K = KINDS[kind];
  const FIELDS = K.fields;
  // Columns nothing is matched to are not imported: say so, and ask (UR-32).
  const [ackUnmapped, setAckUnmapped] = React.useState(false);
  const [asAt, setAsAt] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [termBilled, setTermBilled] = React.useState(false);
  const terms = useRows<{ id: string; name: string; current: boolean }>(['import-terms'],
    `select id, name, current_date between starts_on and ends_on as current from term where deleted_at is null order by starts_on desc`);
  const currentTerm = terms.data?.find(t => t.current) ?? null;
  const [file, setFile] = React.useState<string | null>(null);
  const [table, setTable] = React.useState<string[][]>([]);
  const [map, setMap] = React.useState<Record<string, number | -1>>({});
  const [check, setCheck] = React.useState<Check | null>(null);
  const [done, setDone] = React.useState<Check | null>(null);

  const head = table[0] ?? [];
  const body = table.slice(1);
  const rows = React.useMemo(() => body.map(r => Object.fromEntries(
    FIELDS.filter(f => (map[f.key] ?? -1) >= 0).map(f => [f.key, (r[map[f.key] as number] ?? '').trim()]))), [body, map]);
  const missing = FIELDS.filter(f => f.required && (map[f.key] ?? -1) < 0);
  const mapped = new Set(Object.values(map).filter(i => i >= 0));
  const unmapped = head.map((h, i) => ({ h: h.trim() || `Column ${i + 1}`, i })).filter(c => !mapped.has(c.i)
    && body.some(r => (r[c.i] ?? '').trim() !== ''));
  const switchKind = (k: Kind) => { setKind(k); setFile(null); setTable([]); setMap({}); setCheck(null); setDone(null); setAckUnmapped(false); };
  const switchTab = (t: Tab) => { setTab(t); if (t !== 'invites') switchKind(t === 'history' ? 'invoices' : t); };

  const read = async (f: File) => {
    const t = parseCsv(await f.text());
    setFile(f.name); setTable(t); setCheck(null); setDone(null); setAckUnmapped(false);
    const used = new Set<number>();
    const guess: Record<string, number> = {};
    for (const fld of FIELDS) {
      const i = (t[0] ?? []).findIndex((h, n) => !used.has(n) && fld.match.test(h.trim()));
      guess[fld.key] = i; if (i >= 0) used.add(i);
    }
    setMap(guess);
  };

  const call = useMutation({
    mutationFn: async (commit: boolean) => (await runAs(session, q => kind !== 'balances'
      ? q<{ r: Check }>(`select app.${FN[kind]}($1::jsonb, $2) r`, [JSON.stringify(rows), commit])
      : q<{ r: Check }>(`select app.import_opening_balances($1::jsonb, $2::date, $3, $4) r`,
          [JSON.stringify(rows), asAt, commit, termBilled ? currentTerm?.id ?? null : null])))[0]!.r,
    onSuccess: (r, commit) => { if (commit) { setDone(r); qc.invalidateQueries({ queryKey: ['db'] }); } else setCheck(r); },
  });

  const template = () => downloadCsv(`swayvo-${kind === 'classes' ? 'timetable' : kind}-template.csv`, [K.template]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="imp-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 id="imp-t" className="font-display text-[1.25rem] leading-tight">{tab === 'invites' ? 'Invitation links' : K.title}</h2>
            <p className="mt-1 text-[0.8438rem] text-ink-3">{tab === 'invites' ? 'A link for everyone who cannot sign in yet, to send from your own email.' : K.sub}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1">
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {done ? (
          <div className="space-y-3 text-[0.875rem]">
            {kind === 'families' && <Notice word="Imported" tone="positive" title={`${done.families} new families and ${done.children} children`}
              detail={`${done.enrolled} class places taken${done.medical ? `; ${done.medical} medical notes added to records` : ''}.${done.skipped ? ` ${done.skipped} children were already here and were left alone.` : ''}`} />}
            {kind === 'classes' && <Notice word="Imported" tone="positive" title={`${done.classes} classes with ${done.sessions} sessions`}
              detail={done.skipped ? `${done.skipped} classes were already here and were left alone.` : 'They are on Classes and the Schedule now.'} />}
            {kind === 'balances' && <Notice word="Imported" tone="positive"
              title={`${done.invoices} opening-balance invoices (${money(done.owed_minor ?? 0)}) and ${done.credits} credits (${money(done.credit_minor ?? 0)})`}
              detail={`Each is labelled “Opening balance as at …” on the family’s account.${done.skipped ? ` ${done.skipped} families already had an opening balance and were left alone.` : ''}`} />}
            {HISTORY.includes(kind) && <Notice word="Imported" tone="positive"
              title={kind === 'invoices' ? `${done.invoices} past invoices` : kind === 'attendance' ? `${done.records} attendance records` : `${done.results} exam results`}
              detail={`${kind === 'invoices' ? 'They are on each family’s record, marked “Imported”. They are history only: balances, aged debt and billing runs do not use them.'
                : kind === 'attendance' ? 'They are on each child’s record, under earlier attendance.' : 'They are with each child’s exams and on their timetable.'}${done.skipped ? ` ${done.skipped} were already here and were left alone.` : ''}`} />}
            {done.warnings.map((w, i) => <p key={i} className="text-caution">{w.message}.</p>)}
            <p className="text-ink-2">{kind === 'families' ? 'Next: import opening balances, then make invitation links so parents can sign in.'
              : kind === 'classes' ? 'Next: import your families, then their opening balances.' : 'Next: make invitation links so parents can sign in.'}</p>
            {kind !== 'classes' && <Button size="sm" onClick={() => { setDone(null); setTab('invites'); }}>Make invitation links</Button>}
          </div>
        ) : (
          <div className="space-y-6">
            <ViewTabs label="What to import" value={tab} onChange={switchTab}
              options={[['classes', '1. Timetable'], ['families', '2. Families'], ['balances', '3. Balances'], ['history', '4. History'], ['invites', '5. Invitations']]} />
            {tab === 'invites' ? <BulkInvites /> : <>
            {tab === 'history' && (
              <label className="grid gap-1 text-[0.875rem]"><span className="font-semibold">Which history</span>
                <Select value={kind} onChange={e => switchKind(e.target.value as Kind)} className="w-full sm:w-64">
                  <option value="invoices">Past invoices</option>
                  <option value="attendance">Attendance, per term</option>
                  <option value="exams">Exam results</option>
                </Select>
              </label>
            )}
            <section className="space-y-3">
              <p className="text-[0.875rem] text-ink-2">Export from your current system or spreadsheet as CSV.{' '}
                {kind === 'families' && 'Brothers and sisters go into one family by their parent’s email or phone number.'}
                {kind === 'classes' && 'New dance styles and rooms are added for you; a teacher not on your staff list is left blank to fill in later.'}
                {kind === 'balances' && 'Families are matched by parent email, else family name, so import families first. A negative balance is credit.'}
                {kind === 'invoices' && 'Families are matched by parent email, else family name. Past invoices are kept as a record only — what is still owed comes in as an opening balance.'}
                {(kind === 'attendance' || kind === 'exams') && 'Children are matched by name, with date of birth or a parent email when two share a name, so import families first.'}</p>
              {kind === 'balances' && (
                <div className="flex flex-wrap items-end gap-4">
                  <label className="grid gap-1 text-[0.875rem]"><span className="font-semibold">Balances as at</span>
                    <Input type="date" value={asAt} max={new Date().toISOString().slice(0, 10)} onChange={e => { setAsAt(e.target.value); setCheck(null); }} className="w-44" /></label>
                  {currentTerm && (
                    <label className="flex min-h-[44px] items-center gap-2 text-[0.875rem]">
                      <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={termBilled} onChange={e => { setTermBilled(e.target.checked); setCheck(null); }} />
                      These balances already include {currentTerm.name} fees (so the next billing run skips them)
                    </label>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-surface-2 focus-within:ring-4 focus-within:ring-accent-line/12">
                  <FileSpreadsheet className="size-4" aria-hidden /> {file ? 'Choose another file' : 'Choose a CSV file'}
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => e.target.files?.[0] && read(e.target.files[0])} />
                </label>
                <Button size="sm" variant="ghost" onClick={template}><Download className="size-4" aria-hidden /> Template</Button>
                {file && <span className="text-[0.8125rem] text-ink-3">{file} · {body.length} rows</span>}
              </div>
            </section>

            {head.length > 0 && (
              <section>
                <h3 className="mb-2 border-b border-ink pb-1.5 text-[0.875rem] font-semibold">Match your columns</h3>
                <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {FIELDS.map(f => (
                    <label key={f.key} className="flex items-center gap-2 text-[0.875rem]">
                      <span className="w-36 shrink-0">{f.label}{f.required && <span className="text-critical" aria-hidden> *</span>}</span>
                      <Select aria-label={f.label} value={String(map[f.key] ?? -1)}
                        onChange={e => { setMap(m => ({ ...m, [f.key]: Number(e.target.value) })); setCheck(null); }}>
                        <option value="-1">—</option>
                        {head.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                      </Select>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {head.length > 0 && unmapped.length > 0 && (
              <section className="space-y-2 border-l-2 border-caution pl-3">
                <p className="text-[0.875rem] font-semibold">{unmapped.length} column{unmapped.length === 1 ? '' : 's'} will not be imported</p>
                <p className="text-[0.8438rem] text-ink-2">{unmapped.map(c => `“${c.h}”`).join(', ')}. Match them above if they belong somewhere; otherwise keep a copy of the file.</p>
                <label className="flex min-h-[44px] items-center gap-2 text-[0.875rem]">
                  <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={ackUnmapped} onChange={e => setAckUnmapped(e.target.checked)} />
                  I understand these columns will not be imported
                </label>
              </section>
            )}
            {check && (
              <section className="space-y-2" aria-live="polite">
                {check.ok
                  ? <Notice word="Ready" tone="positive" title={`All ${check.rows} rows are fine`} detail={kind === 'families' ? `About ${check.families} families.` : undefined} />
                  : <Notice word="Fix first" tone="critical" title={`${check.errors.length} problem${check.errors.length === 1 ? '' : 's'} to fix in the file`} detail="Nothing has been imported." />}
                {check.errors.length > 0 && (
                  <ul className="max-h-48 divide-y divide-line overflow-y-auto border-y border-line text-[0.8438rem]">
                    {check.errors.map((e, i) => (
                      <li key={i} className="flex gap-3 py-1.5">
                        <span className="w-14 shrink-0 font-semibold text-critical tnum">Row {e.row + 1}</span> {e.message}
                      </li>
                    ))}
                  </ul>
                )}
                {check.warnings.map((w, i) => <p key={i} className="text-[0.8125rem] text-caution">{w.message}.</p>)}
              </section>
            )}
            {call.error != null && <ErrorState error={call.error} />}
            </>}
          </div>
        )}
        </div>

        {tab !== 'invites' && (done || head.length > 0) && (
          <div className="flex gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end">
            {done ? <Button className="w-full sm:w-auto" variant="primary" onClick={onClose}>Done</Button> : <>
              <Button className="flex-1 sm:flex-none" disabled={missing.length > 0 || body.length === 0} loading={call.isPending && call.variables === false}
                onClick={() => call.mutate(false)}>
                {missing.length ? `Match ${missing.map(m => m.label.toLowerCase()).join(', ')}` : 'Check the file'}
              </Button>
              <Button className="flex-1 sm:flex-none" variant="primary" disabled={!check?.ok || (unmapped.length > 0 && !ackUnmapped)} loading={call.isPending && call.variables === true}
                onClick={() => call.mutate(true)}>
                Import {body.length} {K.unit}
              </Button>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}

type Invite = { role: 'teacher' | 'guardian'; full_name: string; email: string | null; family_name: string | null;
  token: string | null; expires_at: string | null; note: string | null };

/**
 * Invitation links for everyone imported who cannot sign in yet (UR-32), as a
 * spreadsheet the school sends from its own email: Swayvo does not send email
 * yet (UR-14). Each link is an ordinary invitation — one use, 14 days — and is
 * shown only now: the database keeps a fingerprint of it, never the link.
 */
function BulkInvites() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [reissue, setReissue] = React.useState(false);
  const make = useMutation({
    mutationFn: () => runAs(session, q => q<Invite>(`select * from app.bulk_invitations($1)`, [reissue])),
    onSuccess: rows => {
      const linked = rows.filter(r => r.token);
      if (linked.length) downloadCsv(`swayvo-invitation-links-${new Date().toISOString().slice(0, 10)}.csv`, linked.map(r => ({
        name: r.full_name, email: r.email, role: r.role === 'teacher' ? 'Teacher' : 'Parent', family: r.family_name ?? '',
        link: inviteLink(r.token!), expires: r.expires_at ? dateShort(r.expires_at) : '',
      })));
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  const rows = make.data ?? [];
  const linked = rows.filter(r => r.token);
  const missing = rows.filter(r => !r.token && /No email/.test(r.note ?? ''));
  const others = rows.filter(r => !r.token && !/No email/.test(r.note ?? ''));
  return (
    <section className="space-y-4 text-[0.875rem]">
      <p className="text-ink-2">Every parent and teacher with an email address and no login gets their own invitation link,
        in a spreadsheet with their name and email. Send each person their link from your own email or mailing tool.
        Each link works once and lasts 14 days, like any invitation.</p>
      <label className="flex min-h-[44px] items-center gap-2">
        <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={reissue} onChange={e => setReissue(e.target.checked)} />
        Also make new links for people already invited (their earlier link stops working)
      </label>
      <Button variant="primary" loading={make.isPending} onClick={() => make.mutate()}>
        <Download className="size-4" aria-hidden /> Make links and download
      </Button>
      {make.error != null && <ErrorState error={make.error} />}
      {make.data && (
        <div className="space-y-3" aria-live="polite">
          <Notice word={linked.length ? 'Downloaded' : 'Nothing new'} tone={linked.length ? 'positive' : 'ink'}
            title={linked.length ? `${linked.length} invitation link${linked.length === 1 ? '' : 's'}` : 'Everyone with an email already has a link or a login'}
            detail={linked.length ? 'The spreadsheet is in your downloads. The links are not shown again — keep the file until you have sent them.' : undefined} />
          {missing.length > 0 && (
            <div className="border-l-2 border-caution pl-3">
              <p className="font-semibold">{missing.length} without an email address</p>
              <p className="text-[0.8438rem] text-ink-2">{missing.map(m => m.full_name + (m.family_name ? ` (${m.family_name})` : '')).join(', ')}.
                Add their email on People, then make the links again.</p>
            </div>
          )}
          {others.length > 0 && (
            <p className="text-[0.8438rem] text-ink-3">{others.length} left alone: {others.map(o => `${o.full_name} — ${o.note?.toLowerCase()}`).join('; ')}.</p>
          )}
        </div>
      )}
    </section>
  );
}
