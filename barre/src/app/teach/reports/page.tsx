'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Printer, Send, Wand2 } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ReportCard } from '@/components/app/progress';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, EmptyState, ErrorState, Select, Skeleton } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import * as H from '@/lib/repos/hub';

/**
 * Term reports (R-022). Sanaa drafts one per child from the term's feedback,
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
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="flex flex-wrap items-end gap-3 p-4 print:hidden">
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1 block text-[13px] text-ink-2">Class</span>
            <Select value={cls} onChange={e => { setPick(e.target.value); setChosen(new Set()); setDone(null); }}>
              {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <Button loading={write.isPending && write.variables?.sql === P.DRAFT_REPORTS} disabled={!cls}
                  onClick={() => write.mutate({ sql: P.DRAFT_REPORTS, params: [cls], msg: 'Drafts written from this term’s feedback and skills. Shared reports were left as they were.' })}>
            <Wand2 className="size-4" aria-hidden /> {reports.data?.length ? 'Refresh drafts' : 'Draft reports'}
          </Button>
        </Card>
        {done && <p role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px] print:hidden">
          <CheckCircle2 className="size-4 text-positive" aria-hidden /> {done}</p>}
        {write.error != null && <ErrorState error={write.error} />}
        {reports.isLoading && <Skeleton className="h-40" />}
        {reports.data?.length === 0 && <Card><EmptyState icon={<FileText className="size-5" />} title="No reports yet"
          body="Draft them when the term is nearly over. Each is built from the feedback and skill levels you have recorded." /></Card>}

        {drafts.length > 0 && (
          <div className="flex items-center gap-3 print:hidden">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={allChosen}
                     onChange={e => setChosen(e.target.checked ? new Set(drafts.map(r => r.id)) : new Set())} /> Select all drafts
            </label>
            <Button className="ml-auto" variant="primary" disabled={!chosen.size} loading={write.isPending && write.variables?.sql === P.SHARE_REPORTS}
                    onClick={() => write.mutate({ sql: P.SHARE_REPORTS, params: [[...chosen]], msg: `${chosen.size} report${chosen.size === 1 ? '' : 's'} shared with families.` })}>
              <Send className="size-4" aria-hidden /> Share {chosen.size || ''}
            </Button>
          </div>
        )}

        {reports.data?.map(r => (
          <Card key={r.id} className="space-y-3 p-4">
            <div className="flex items-center gap-2 print:hidden">
              {r.status === 'draft' && <input type="checkbox" aria-label={`Choose ${r.student_name}`} className="size-4 accent-[var(--accent)]"
                checked={chosen.has(r.id)} onChange={e => setChosen(c => { const n = new Set(c); e.target.checked ? n.add(r.id) : n.delete(r.id); return n; })} />}
              <Badge tone={r.status === 'shared' ? 'positive' : 'neutral'}>{r.status === 'shared' ? 'Shared' : 'Draft'}</Badge>
            </div>
            <ReportCard r={r} />
            {r.status === 'draft' && <Comment r={r} onSave={c => write.mutate({ sql: P.SET_REPORT_COMMENT, params: [r.id, c] })} />}
          </Card>
        ))}
      </div>
    </Shell>
  );
}

function Comment({ r, onSave }: { r: P.Report; onSave: (c: string) => void }) {
  const [text, setText] = React.useState(r.comment ?? '');
  return (
    <textarea aria-label={`Your comment for ${r.student_name}`} rows={2} value={text} onChange={e => setText(e.target.value)}
      onBlur={() => text !== (r.comment ?? '') && onSave(text)} placeholder="A sentence in your own words (optional)"
      className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-2.5 text-sm print:hidden" />
  );
}
