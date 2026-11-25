'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, X } from 'lucide-react';
import { Badge, Button, ErrorState, Select } from '@/components/ui';
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="imp-t" onClick={e => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="imp-t" className="text-lg font-semibold tracking-tight">Import families</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {done ? (
          <div className="space-y-3 py-2 text-sm">
            <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="size-5 text-positive" aria-hidden /> Imported</p>
            <p>{done.families} new families and {done.children} children. {done.enrolled} class places taken
              {done.medical ? `; ${done.medical} medical notes added to records` : ''}.
              {done.skipped ? ` ${done.skipped} children were already here and were left alone.` : ''}</p>
            {done.warnings.map((w, i) => <p key={i} className="text-ink-2">{w.message}.</p>)}
            <p className="text-ink-2">Next: invite the parents from People so they can sign in.</p>
            <Button variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="space-y-2">
              <p className="text-sm text-ink-2">One row per child. Export from your current system or spreadsheet as CSV.
                Brothers and sisters are put in one family by their parent’s email or phone number.</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-2 text-sm hover:bg-surface-2">
                  <FileSpreadsheet className="size-4" aria-hidden /> {file ? 'Choose another file' : 'Choose a CSV file'}
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => e.target.files?.[0] && read(e.target.files[0])} />
                </label>
                <Button size="sm" variant="ghost" onClick={template}><Download className="size-4" aria-hidden /> Template</Button>
                {file && <span className="text-[13px] text-ink-3">{file} · {body.length} rows</span>}
              </div>
            </section>

            {head.length > 0 && (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold">Match your columns</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FIELDS.map(f => (
                    <label key={f.key} className="flex items-center gap-2 text-sm">
                      <span className="w-40 shrink-0">{f.label}{f.required && <span className="text-critical"> *</span>}</span>
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
                  ? <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-positive" aria-hidden />
                      All {check.rows} rows are fine — about {check.families} families.</p>
                  : <p className="flex items-center gap-2 text-sm font-medium text-critical"><AlertTriangle className="size-4" aria-hidden />
                      {check.errors.length} problem{check.errors.length === 1 ? '' : 's'} to fix in the file. Nothing has been imported.</p>}
                {check.errors.length > 0 && (
                  <ul className="max-h-48 overflow-y-auto rounded-[var(--radius-md)] border border-line text-[13px]">
                    {check.errors.map((e, i) => (
                      <li key={i} className="flex gap-2 border-b border-line px-3 py-1.5 last:border-0">
                        <Badge tone="critical">Row {e.row + 1}</Badge> {e.message}
                      </li>
                    ))}
                  </ul>
                )}
                {check.warnings.map((w, i) => <p key={i} className="text-[13px] text-caution">{w.message}.</p>)}
              </section>
            )}
            {call.error != null && <ErrorState error={call.error} />}

            {head.length > 0 && (
              <div className="flex gap-2">
                <Button className="flex-1" disabled={missing.length > 0 || body.length === 0} loading={call.isPending && call.variables === false}
                  onClick={() => call.mutate(false)}>
                  {missing.length ? `Match ${missing.map(m => m.label.toLowerCase()).join(', ')}` : 'Check the file'}
                </Button>
                <Button className="flex-1" variant="primary" disabled={!check?.ok} loading={call.isPending && call.variables === true}
                  onClick={() => call.mutate(true)}>
                  Import {body.length} children
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
