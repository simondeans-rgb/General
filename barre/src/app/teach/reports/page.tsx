'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ReportCard } from '@/components/app/progress';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Notice, Select, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import * as H from '@/lib/repos/hub';

/**
 * Term reports (R-022). Swayvo drafts one per child from the term's feedback,
 * attendance and skill changes; the teacher adds a sentence where they want
 * to, ticks, and shares the lot. Families can print or save them as PDF.
 */
export default function ReportsPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const classes = useRows<{ id: string; name: string }>(['teaching-classes'], H.MY_TEACHING_CLASSES);
  const [pick, setPick] = React.useState('');
  const cls = pick || classes.data?.[0]?.id || '';
  const reports = useRows<P.Report>(['class-reports', cls], P.CLASS_REPORTS, [cls], { enabled: !!cls });
  const [chosen, setChosen] = React.useState<Set<string>>(new Set());
  const [done, setDone] = React.useState<string | null>(null);
  const write = useMutation({
    mutationFn: (v: { sql: string; params: unknown[]; msg?: string }) => runAs(session, q => q(v.sql, v.params)).then(() => v.msg),
    onSuccess: msg => { if (msg) setDone(msg); setChosen(new Set()); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const drafts = (reports.data ?? []).filter(r => r.status === 'draft');
  const allChosen = drafts.length > 0 && drafts.every(r => chosen.has(r.id));

  return (
    <Shell title="Term reports" allow={['owner', 'admin', 'teacher']}
      actions={reports.data?.length ? <Button size="sm" onClick={() => window.print()}><Printer className="size-4" aria-hidden /> <span className="hidden sm:inline">Print</span></Button> : undefined}>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-end gap-3 print:hidden">
          <label className="min-w-0 flex-1 basis-56">
            <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2">Class</span>
            <Select value={cls} onChange={e => { setPick(e.target.value); setChosen(new Set()); setDone(null); }}>
              {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <Button variant={reports.data?.length ? 'secondary' : 'primary'} loading={write.isPending && write.variables?.sql === P.DRAFT_REPORTS} disabled={!cls}
                  onClick={() => write.mutate({ sql: P.DRAFT_REPORTS, params: [cls], msg: 'Drafts written from this term’s feedback and skills. Shared reports were left as they were.' })}>
            {reports.data?.length ? 'Refresh drafts' : 'Draft reports'}
          </Button>
        </div>
        {done && <div role="status" className="print:hidden"><Notice word="Done" tone="positive" title={done} /></div>}
        {write.error != null && <ErrorState error={write.error} />}
        {reports.isLoading && <Skeleton className="h-40" />}
        {reports.data?.length === 0 && <EmptyState title="No reports yet"
          body="Draft them when the term is nearly over. Each one is built from the feedback and skill levels you have recorded." />}

        {!!reports.data?.length && (
          <section aria-labelledby="reports-h">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink pb-2 print:hidden">
              <h2 id="reports-h" className="section-title w-full sm:w-auto sm:flex-1">
                {reports.data.length} report{reports.data.length === 1 ? '' : 's'}
                <span className="font-normal text-ink-3"> · {reports.data.length - drafts.length} shared. Families only see shared ones.</span>
              </h2>
              {drafts.length > 0 && (
                <>
                  <label className="mr-auto flex min-h-11 items-center gap-2 text-[0.875rem] sm:mr-0">
                    <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={allChosen}
                           onChange={e => setChosen(e.target.checked ? new Set(drafts.map(r => r.id)) : new Set())} /> All drafts
                  </label>
                  <Button variant="primary" disabled={!chosen.size} loading={write.isPending && write.variables?.sql === P.SHARE_REPORTS}
                          onClick={() => write.mutate({ sql: P.SHARE_REPORTS, params: [[...chosen]], msg: `${chosen.size} report${chosen.size === 1 ? '' : 's'} shared with families.` })}>
                    Share {chosen.size || ''} with families
                  </Button>
                </>
              )}
            </div>
            <ul className="divide-y divide-line">
              {reports.data.map(r => (
                <li key={r.id} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-1 py-5 print:block">
                  <div className="pt-0.5 print:hidden">
                    {r.status === 'draft' && <input type="checkbox" aria-label={`Choose ${r.student_name}`} className="size-5 accent-[var(--color-accent)]"
                      checked={chosen.has(r.id)} onChange={e => setChosen(c => { const n = new Set(c); if (e.target.checked) n.add(r.id); else n.delete(r.id); return n; })} />}
                  </div>
                  <div className="min-w-0 space-y-3">
                    <p className={r.status === 'shared' ? 'text-[0.8125rem] font-semibold text-positive print:hidden' : 'text-[0.8125rem] font-semibold text-ink-3 print:hidden'}>
                      {r.status === 'shared' ? 'Shared' : 'Draft'}
                    </p>
                    <ReportCard r={r} />
                    {r.status === 'draft' && <Comment r={r} onSave={c => write.mutate({ sql: P.SET_REPORT_COMMENT, params: [r.id, c] })} />}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Shell>
  );
}

function Comment({ r, onSave }: { r: P.Report; onSave: (c: string) => void }) {
  const [text, setText] = React.useState(r.comment ?? '');
  return (
    <textarea aria-label={`Your comment for ${r.student_name}`} rows={2} value={text} onChange={e => setText(e.target.value)}
      onBlur={() => text !== (r.comment ?? '') && onSave(text)} placeholder="A sentence in your own words (optional)"
      className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-[0.9375rem] print:hidden" />
  );
}
