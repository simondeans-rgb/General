'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, GraduationCap, Plus, Receipt } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, CardHeader, ErrorState, Field, Input, Select } from '@/components/ui';
import * as E from '@/lib/repos/events';
import { dateLong, dateShort, money } from '@/lib/format';
import { cn } from '@/lib/cn';

function useWrite(after?: (r: any) => void) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { sql: string; params: unknown[] }) => (await runAs(session, q => q(v.sql, v.params)))[0],
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['db'] }); after?.(r); },
  });
}
const resultLabel = (r: string | null) => E.RESULTS.find(x => x[0] === r)?.[1] ?? r;

/**
 * Exam sessions and entries, from the office (R-058). Grades are typed by the
 * school; no syllabus content is held. A pass becomes a milestone.
 */
export function ExamsCard() {
  const rows = useRows<E.ExamSession>(['exam-sessions'], E.EXAM_SESSIONS);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [f, setF] = React.useState({ board: 'RAD', title: '', on: '', venue: '', close: '' });
  const write = useWrite(() => setAdding(false));
  return (
    <Card className="mt-5">
      <CardHeader title="Exams" subtitle="Sessions, entries and results. Results become milestones families can see."
        action={!adding && <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden /> Exam session</Button>} />
      {adding && (
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2">
          <Field label="Board" htmlFor="ex-b" hint="RAD, ISTD, IDTA, BTDA or your own"><Input id="ex-b" value={f.board} onChange={e => setF({ ...f, board: e.target.value })} /></Field>
          <Field label="Name" htmlFor="ex-t" required><Input id="ex-t" value={f.title} placeholder="Summer ballet exams" onChange={e => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Exam day" htmlFor="ex-d" required><Input id="ex-d" type="date" value={f.on} onChange={e => setF({ ...f, on: e.target.value })} /></Field>
          <Field label="Entries close" htmlFor="ex-c"><Input id="ex-c" type="date" value={f.close} onChange={e => setF({ ...f, close: e.target.value })} /></Field>
          <Field label="Venue" htmlFor="ex-v"><Input id="ex-v" value={f.venue} onChange={e => setF({ ...f, venue: e.target.value })} /></Field>
          {write.error != null && <div className="sm:col-span-2"><ErrorState error={write.error} /></div>}
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="primary" disabled={!f.board.trim() || !f.title.trim() || !f.on} loading={write.isPending}
              onClick={() => write.mutate({ sql: E.ADD_EXAM_SESSION, params: [f.board, f.title, f.on, f.venue, f.close || null] })}>Save</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {rows.data?.length === 0 && !adding && <p className="p-4 text-[13px] text-ink-3">No exam sessions yet.</p>}
      <ul className="divide-y divide-line">
        {rows.data?.map(x => (
          <li key={x.id}>
            <button onClick={() => setOpen(o => o === x.id ? null : x.id)} aria-expanded={open === x.id}
              className={cn('flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left hover:bg-surface-2', new Date(x.exam_on) < new Date() && 'opacity-70')}>
              <GraduationCap className="size-4 text-ink-3" aria-hidden />
              <span className="font-medium">{x.board} · {x.title}</span>
              <span className="ml-auto text-[12.5px] text-ink-3">{dateLong(x.exam_on)}</span>
              <span className="w-full pl-6 text-[13px] text-ink-2">{x.entries} entered · {x.results} results{x.unbilled ? ` · ${x.unbilled} fees to bill` : ''}</span>
            </button>
            {open === x.id && <Entries session={x} />}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Entries({ session: x }: { session: E.ExamSession }) {
  const rows = useRows<E.ExamEntry>(['exam-entries', x.id], E.EXAM_ENTRIES, [x.id]);
  const students = useRows<{ id: string; name: string }>(['student-pick'], E.STUDENT_PICK);
  const [done, setDone] = React.useState<string | null>(null);
  const write = useWrite();
  const [f, setF] = React.useState({ student: '', grade: '', fee: '' });
  return (
    <div className="space-y-3 border-t border-line bg-surface-2/40 p-4">
      {done && <p role="status" className="text-[13px] text-positive">{done}</p>}
      {write.error != null && <ErrorState error={write.error} />}
      <ul className="divide-y divide-line rounded-[var(--radius-md)] border border-line bg-surface text-sm">
        {rows.data?.map(e => (
          <li key={e.id} className={cn('flex flex-wrap items-center gap-2 px-3 py-2', e.status === 'withdrawn' && 'opacity-50')}>
            <span className="min-w-0 flex-1"><b>{e.student}</b> · {e.grade}{e.fee_minor ? <span className="text-ink-3"> · {money(e.fee_minor)}</span> : ''}</span>
            {e.status === 'withdrawn' ? <Badge tone="neutral">Withdrawn</Badge> : (
              <ResultPicker entry={e} onSet={(r, m) => write.mutate({ sql: E.EXAM_RESULT, params: [e.id, r, m] })} />
            )}
          </li>
        ))}
        {rows.data?.length === 0 && <li className="px-3 py-2 text-ink-3">Nobody entered yet.</li>}
      </ul>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Select aria-label="Student" className="col-span-2" value={f.student} onChange={e => setF({ ...f, student: e.target.value })}>
          <option value="">Enter a student…</option>
          {students.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input aria-label="Grade" placeholder="Grade 3" value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })} />
        <Input aria-label="Fee in pounds" type="number" min={0} step={0.5} placeholder="Fee £" value={f.fee} onChange={e => setF({ ...f, fee: e.target.value })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!f.student || !f.grade.trim()}
          onClick={() => { write.mutate({ sql: E.ENTER_EXAM, params: [x.id, f.student, f.grade, Math.round(Number(f.fee || 0) * 100)] }); setF({ ...f, student: '' }); }}>
          Enter
        </Button>
        {x.unbilled > 0 && (
          <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: E.BILL_EXAM, params: [x.id] }, { onSuccess: r => setDone(`${r?.n ?? 0} invoice${r?.n === 1 ? '' : 's'} sent for exam fees.`) })}>
            <Receipt className="size-4" aria-hidden /> Bill {x.unbilled} fee{x.unbilled === 1 ? '' : 's'}
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultPicker({ entry, onSet }: { entry: E.ExamEntry; onSet: (r: string | null, mark: number | null) => void }) {
  const [mark, setMark] = React.useState(entry.mark != null ? String(entry.mark) : '');
  return (
    <span className="flex items-center gap-1.5">
      <Select aria-label={`Result for ${entry.student}`} className="h-8 w-36 text-[12.5px]" value={entry.result ?? ''}
        onChange={e => onSet(e.target.value || null, mark ? Number(mark) : null)}>
        <option value="">No result yet</option>
        {E.RESULTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
      <Input aria-label={`Mark for ${entry.student}`} className="h-8 w-14 text-[12.5px]" type="number" min={0} max={100} placeholder="%"
        value={mark} onChange={e => setMark(e.target.value)} onBlur={() => entry.result && onSet(entry.result, mark ? Number(mark) : null)} />
    </span>
  );
}

/** A student's exams, for a teacher's student panel or a family's child (R-058). */
export function StudentExams({ studentId, canEnter }: { studentId: string; canEnter?: boolean }) {
  const rows = useRows<E.ExamEntry>(['student-exams', studentId], E.STUDENT_EXAMS, [studentId]);
  const upcoming = useRows<{ id: string; board: string; title: string; exam_on: string }>(['upcoming-exams'], E.UPCOMING_EXAMS, [], { enabled: !!canEnter });
  const write = useWrite();
  const [f, setF] = React.useState({ session: '', grade: '' });
  if (!rows.data?.length && !(canEnter && upcoming.data?.length)) return <p className="text-[13px] text-ink-3">No exams yet.</p>;
  return (
    <div className="space-y-2">
      <ul className="space-y-1.5 text-sm">
        {rows.data?.map(e => (
          <li key={e.id} className="flex items-center gap-2">
            <Award className={cn('size-4 shrink-0', e.result && e.result !== 'not_yet' ? 'text-positive' : 'text-ink-3')} aria-hidden />
            <span className="min-w-0 flex-1">{e.board} {e.grade} <span className="text-ink-3">· {dateShort(e.exam_on)}</span></span>
            {e.result ? <Badge tone={e.result === 'not_yet' ? 'neutral' : 'positive'}>{resultLabel(e.result)}{e.mark != null ? ` · ${e.mark}%` : ''}</Badge>
              : canEnter ? <Select aria-label={`Result, ${e.board} ${e.grade}`} className="h-8 w-32 text-[12.5px]" value=""
                  onChange={x => x.target.value && write.mutate({ sql: E.EXAM_RESULT, params: [e.id, x.target.value, null] })}>
                  <option value="">Result…</option>{E.RESULTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
              : <Badge tone="info">Entered</Badge>}
          </li>
        ))}
      </ul>
      {canEnter && !!upcoming.data?.length && (
        <div className="flex gap-1.5">
          <Select aria-label="Exam session" className="h-9 min-w-0 flex-1 text-[13px]" value={f.session} onChange={e => setF({ ...f, session: e.target.value })}>
            <option value="">Enter for an exam…</option>
            {upcoming.data.map(x => <option key={x.id} value={x.id}>{x.board} · {x.title} ({dateShort(x.exam_on)})</option>)}
          </Select>
          <Input aria-label="Grade" className="h-9 w-24" placeholder="Grade" value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })} />
          <Button size="sm" disabled={!f.session || !f.grade.trim()}
            onClick={() => { write.mutate({ sql: E.ENTER_EXAM, params: [f.session, studentId, f.grade, 0] }); setF({ session: '', grade: '' }); }}>Enter</Button>
        </div>
      )}
      {write.error != null && <ErrorState error={write.error} />}
    </div>
  );
}
