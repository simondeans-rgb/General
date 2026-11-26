'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { Notice, Button, ErrorState, Select } from '@/components/ui';
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

type Check = { ok: boolean; rows: number; families?: number; children?: number; enrolled?: number; skipped?: number;
  medical?: number; errors: { row: number; message: string }[]; warnings: { message: string }[] };

/**
 * Bring a school's families in from a spreadsheet (R-013): choose a CSV, match
 * its columns, see every problem before anything is written, then import it all
 * in one go — or nothing at all.
 */
export function ImportWizard({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
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

  const read = async (f: File) => {
    const t = parseCsv(await f.text());
    setFile(f.name); setTable(t); setCheck(null); setDone(null);
    const used = new Set<number>();
    const guess: Record<string, number> = {};
    for (const fld of FIELDS) {
      const i = (t[0] ?? []).findIndex((h, n) => !used.has(n) && fld.match.test(h.trim()));
      guess[fld.key] = i; if (i >= 0) used.add(i);
    }
    setMap(guess);
  };

  const call = useMutation({
    mutationFn: async (commit: boolean) =>
      (await runAs(session, q => q<{ r: Check }>(`select app.import_families($1::jsonb, $2) r`, [JSON.stringify(rows), commit])))[0]!.r,
    onSuccess: (r, commit) => { if (commit) { setDone(r); qc.invalidateQueries({ queryKey: ['db'] }); } else setCheck(r); },
  });

  const template = () => downloadCsv('barre-import-template.csv', [{
    'Parent name': 'Ruth Okafor', 'Parent email': 'ruth@example.com', 'Parent phone': '07700 900400',
    'Second parent name': '', 'Second parent email': '', 'Second parent phone': '',
    'Child first name': 'Ada', 'Child last name': 'Okafor', 'Date of birth': '14/03/2018',
    'Emergency contact name': 'Grace Okafor', 'Emergency contact phone': '07700 900401',
    'Allergies': 'Peanuts', 'Medical notes': '', 'Photo consent': 'Yes', 'Classes': 'Pre-School Ballet; Junior Tap',
  }]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="imp-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 id="imp-t" className="font-display text-[20px] leading-tight">Import families</h2>
            <p className="mt-1 text-[13.5px] text-ink-3">One row per child, from a CSV file.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1">
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {done ? (
          <div className="space-y-3 text-[14px]">
            <Notice word="Imported" tone="positive" title={`${done.families} new families and ${done.children} children`}
              detail={`${done.enrolled} class places taken${done.medical ? `; ${done.medical} medical notes added to records` : ''}.${done.skipped ? ` ${done.skipped} children were already here and were left alone.` : ''}`} />
            {done.warnings.map((w, i) => <p key={i} className="text-caution">{w.message}.</p>)}
            <p className="text-ink-2">Next: invite the parents from People so they can sign in.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <p className="text-[14px] text-ink-2">Export from your current system or spreadsheet as CSV.
                Brothers and sisters go into one family by their parent’s email or phone number.</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-surface-2 focus-within:ring-4 focus-within:ring-accent-line/12">
                  <FileSpreadsheet className="size-4" aria-hidden /> {file ? 'Choose another file' : 'Choose a CSV file'}
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => e.target.files?.[0] && read(e.target.files[0])} />
                </label>
                <Button size="sm" variant="ghost" onClick={template}><Download className="size-4" aria-hidden /> Template</Button>
                {file && <span className="text-[13px] text-ink-3">{file} · {body.length} rows</span>}
              </div>
            </section>

            {head.length > 0 && (
              <section>
                <h3 className="mb-2 border-b border-ink pb-1.5 text-[14px] font-semibold">Match your columns</h3>
                <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {FIELDS.map(f => (
                    <label key={f.key} className="flex items-center gap-2 text-[14px]">
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

            {check && (
              <section className="space-y-2" aria-live="polite">
                {check.ok
                  ? <Notice word="Ready" tone="positive" title={`All ${check.rows} rows are fine`} detail={`About ${check.families} families.`} />
                  : <Notice word="Fix first" tone="critical" title={`${check.errors.length} problem${check.errors.length === 1 ? '' : 's'} to fix in the file`} detail="Nothing has been imported." />}
                {check.errors.length > 0 && (
                  <ul className="max-h-48 divide-y divide-line overflow-y-auto border-y border-line text-[13.5px]">
                    {check.errors.map((e, i) => (
                      <li key={i} className="flex gap-3 py-1.5">
                        <span className="w-14 shrink-0 font-semibold text-critical tnum">Row {e.row + 1}</span> {e.message}
                      </li>
                    ))}
                  </ul>
                )}
                {check.warnings.map((w, i) => <p key={i} className="text-[13px] text-caution">{w.message}.</p>)}
              </section>
            )}
            {call.error != null && <ErrorState error={call.error} />}
          </div>
        )}
        </div>

        {(done || head.length > 0) && (
          <div className="flex gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end">
            {done ? <Button className="w-full sm:w-auto" variant="primary" onClick={onClose}>Done</Button> : <>
              <Button className="flex-1 sm:flex-none" disabled={missing.length > 0 || body.length === 0} loading={call.isPending && call.variables === false}
                onClick={() => call.mutate(false)}>
                {missing.length ? `Match ${missing.map(m => m.label.toLowerCase()).join(', ')}` : 'Check the file'}
              </Button>
              <Button className="flex-1 sm:flex-none" variant="primary" disabled={!check?.ok} loading={call.isPending && call.variables === true}
                onClick={() => call.mutate(true)}>
                Import {body.length} children
              </Button>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}
