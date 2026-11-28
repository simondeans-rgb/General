'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, ChevronDown, Plus, Receipt } from 'lucide-react';
import { useRows, useRow } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, ErrorState, Field, Input, Select } from '@/components/ui';
import { SectionHead, Word } from './session-row';
import * as E from '@/lib/repos/events';
import * as S from '@/lib/repos/seasons';
import { dateShort, money, time } from '@/lib/format';
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
const localInput = (iso?: string | null) => iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
const STAGE_TONE: Record<S.ExamStage, 'ink' | 'positive' | 'caution' | 'muted'> = {
  withdrawn: 'muted', entered: 'caution', confirmed: 'ink', sat: 'ink', result: 'positive',
};

/**
 * Where an entry has got to, in words a family reads: "Entered — waiting to
 * be confirmed", "Confirmed · Thu 17 Dec, 10:40", "Sat · result to come",
 * "Merit · 78%". The same words on the child card, the student's timetable
 * and the office's list (round 2 F2).
 */
export function examStatusText(e: E.ExamEntry): string {
  const stage = S.examStage(e);
  if (stage === 'result') return `${resultLabel(e.result)}${e.mark != null ? ` · ${e.mark}%` : ''}`;
  if (stage === 'withdrawn') return 'Withdrawn';
  const today = new Date(new Date().toDateString());
  if (stage === 'sat' || new Date(e.exam_on) < today) return 'Sat · result to come';
  if (stage === 'confirmed') return `Confirmed · ${e.sits_at ? `${dateShort(e.sits_at)}, ${time(e.sits_at)}` : dateShort(e.exam_on)}`;
  return 'Entered · waiting to be confirmed';
}

/**
 * Exam sessions and entries, from the office (R-058, round 2 F2). A session
 * is the exam; it shows in families' diaries as an Exam event, and an Exam
 * event made on the Events screen is a session too. Grades and examining
 * bodies are typed by the school; no syllabus content is held.
 */
export function ExamsCard() {
  const rows = useRows<E.ExamSession>(['exam-sessions'], E.EXAM_SESSIONS);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [f, setF] = React.useState({ board: '', title: '', on: '', venue: '', close: '', fee: '' });
  const write = useWrite(() => setAdding(false));
  return (
    <section>
      <SectionHead title="Exam entries" meta={rows.data?.length ? `${rows.data.length} session${rows.data.length === 1 ? '' : 's'}` : undefined}
        action={!adding && <Button size="sm" variant="ghost" onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden /> Exam session</Button>} />
      <p className="py-2 text-[0.8125rem] text-ink-3">Each session is also in families’ diaries as an Exam event. Entries go from entered to confirmed, sat and result; results become milestones families can see.</p>
      {adding && (
        <div className="card mb-3 grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Examining body" htmlFor="ex-b" hint="Free text, for example RAD, ISTD or IDTA, or your own"><Input id="ex-b" value={f.board} onChange={e => setF({ ...f, board: e.target.value })} /></Field>
          <Field label="Name" htmlFor="ex-t" required><Input id="ex-t" value={f.title} placeholder="Summer ballet exams" onChange={e => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Exam day" htmlFor="ex-d" required><Input id="ex-d" type="date" value={f.on} onChange={e => setF({ ...f, on: e.target.value })} /></Field>
          <Field label="Entries close" htmlFor="ex-c"><Input id="ex-c" type="date" value={f.close} onChange={e => setF({ ...f, close: e.target.value })} /></Field>
          <Field label="Venue" htmlFor="ex-v"><Input id="ex-v" value={f.venue} onChange={e => setF({ ...f, venue: e.target.value })} /></Field>
          <Field label="Fee per entry (£)" htmlFor="ex-f" hint="You can change it for each child"><Input id="ex-f" type="number" min={0} step={0.5} value={f.fee} onChange={e => setF({ ...f, fee: e.target.value })} /></Field>
          {write.error != null && <div className="sm:col-span-2"><ErrorState error={write.error} /></div>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" disabled={!f.board.trim() || !f.title.trim() || !f.on} loading={write.isPending}
              onClick={() => write.mutate({ sql: E.ADD_EXAM_SESSION, params: [f.board, f.title, f.on, f.venue, f.close || null, f.fee ? Math.round(Number(f.fee) * 100) : 0] })}>Save session</Button>
          </div>
        </div>
      )}
      {rows.data?.length === 0 && !adding && <p className="py-3 text-[0.875rem] text-ink-3">No exam sessions yet. A session holds an examiner’s visit: each child’s grade, fee, time and result.</p>}
      <ul className="divide-y divide-line border-t border-line">
        {rows.data?.map(x => {
          const d = new Date(x.exam_on);
          const past = d < new Date();
          return (
            <li key={x.id}>
              <button onClick={() => setOpen(o => o === x.id ? null : x.id)} aria-expanded={open === x.id}
                className="grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-3 px-1 py-3 text-left hover:bg-surface-2/60">
                <span className={cn('leading-none', past && 'text-ink-3')}>
                  <span className="block font-display text-[1.375rem] tnum">{d.getDate()}</span>
                  <span className="mt-1 block text-[0.75rem] text-ink-3">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                </span>
                <span className="min-w-0">
                  <span className={cn('block font-semibold', past && 'text-ink-2')}>{x.title.toLowerCase().includes(x.board.toLowerCase()) ? x.title : `${x.board} · ${x.title}`}</span>
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-3">{x.entries} entered · {x.results} results{x.unbilled ? <> · <span className="font-semibold text-caution">{x.unbilled} fees to bill</span></> : ''}</span>
                </span>
                <ChevronDown className={cn('mt-1 size-4 text-ink-3 transition-transform', open === x.id && 'rotate-180')} aria-hidden />
              </button>
              {open === x.id && <div className="mb-3 ml-[3.25rem] border-l-2 border-line pb-2 pl-4"><Entries session={x} /></div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The exam behind an "Exam" event, for the event page (round 2 F2): the same
 * entries, fees and results as the Exam entries list. Slots into the event
 * page's Participants tab in place of the plain dancer list.
 */
export function ExamEventPanel({ eventId }: { eventId: string }) {
  const x = useRow<E.ExamSession>(['exam-for-event', eventId], S.SESSION_FOR_EVENT, [eventId]);
  if (x.isLoading) return null;
  if (!x.data) return <p className="text-[0.875rem] text-ink-3">This exam has no session yet.</p>;
  return (
    <section aria-label="Exam entries">
      <p className="mb-2 text-[0.8125rem] text-ink-3">{x.data.board} · {x.data.entries} entered · {x.data.results} results
        {x.data.fee_minor ? ` · ${money(x.data.fee_minor)} per entry` : ''}. Inviting classes enters their children; families accept to confirm.</p>
      <Entries session={x.data} />
    </section>
  );
}

function Entries({ session: x }: { session: E.ExamSession }) {
  const rows = useRows<E.ExamEntry>(['exam-entries', x.id], E.EXAM_ENTRIES, [x.id]);
  const students = useRows<{ id: string; name: string }>(['student-pick'], E.STUDENT_PICK);
  const [done, setDone] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const write = useWrite();
  const [f, setF] = React.useState({ student: '', grade: '', fee: '' });
  return (
    <div className="space-y-3">
      {done && <p role="status" className="text-[0.8125rem] font-semibold text-positive">{done}</p>}
      {write.error != null && <ErrorState error={write.error} />}
      <ul className="divide-y divide-line text-[0.875rem]">
        {rows.data?.map(e => {
          const stage = S.examStage(e);
          return (
            <li key={e.id} className={cn('py-2', stage === 'withdrawn' && 'text-ink-3')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1">
                  <b className="font-semibold">{e.student}</b> · {e.grade}
                  <span className="text-ink-3">{e.sits_at ? ` · ${time(e.sits_at)}` : ''}{e.fee_minor ? ` · ${money(e.fee_minor)}${e.invoice_id ? ' billed' : ''}` : ''}</span>
                </span>
                <Word tone={STAGE_TONE[stage]}>{stage === 'result' ? resultLabel(e.result) : S.STAGE_WORD[stage]}</Word>
                {stage === 'entered' && <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: S.CONFIRM_EXAM_ENTRY, params: [e.id, true] })}>Confirm</Button>}
                {stage !== 'withdrawn' && <Button size="sm" variant="ghost" aria-expanded={editing === e.id} onClick={() => setEditing(v => v === e.id ? null : e.id)}>Details</Button>}
              </div>
              {editing === e.id && <EntryDetails e={e} onWrite={(sql, params) => write.mutate({ sql, params })} />}
            </li>
          );
        })}
        {rows.data?.length === 0 && <li className="py-2 text-ink-3">Nobody entered yet.</li>}
      </ul>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select aria-label="Student" className="col-span-2" value={f.student} onChange={e => setF({ ...f, student: e.target.value })}>
          <option value="">Enter a student…</option>
          {students.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input aria-label="Grade" placeholder="Grade 3" value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })} />
        <Input aria-label="Fee in pounds" type="number" min={0} step={0.5} placeholder={x.fee_minor ? `Fee £${(x.fee_minor / 100).toFixed(2)}` : 'Fee £'} value={f.fee} onChange={e => setF({ ...f, fee: e.target.value })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!f.student || !f.grade.trim()}
          onClick={() => { write.mutate({ sql: E.ENTER_EXAM, params: [x.id, f.student, f.grade, f.fee ? Math.round(Number(f.fee) * 100) : null] }); setF({ ...f, student: '' }); }}>
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

function EntryDetails({ e, onWrite }: { e: E.ExamEntry; onWrite: (sql: string, params: unknown[]) => void }) {
  const [f, setF] = React.useState({ grade: e.grade, fee: e.fee_minor ? String(e.fee_minor / 100) : '', at: localInput(e.sits_at) });
  const [mark, setMark] = React.useState(e.mark != null ? String(e.mark) : '');
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 border-l-2 border-line pl-3 [&>*]:min-w-0">
      <Field label="Grade" htmlFor={`eg-${e.id}`}><Input id={`eg-${e.id}`} value={f.grade} onChange={x => setF({ ...f, grade: x.target.value })} /></Field>
      <Field label="Candidate time" htmlFor={`et-${e.id}`} hint="The examiner’s timetable"><Input id={`et-${e.id}`} type="datetime-local" value={f.at} onChange={x => setF({ ...f, at: x.target.value })} /></Field>
      <Field label="Fee (£)" htmlFor={`ef-${e.id}`} hint={e.invoice_id ? 'Already billed' : undefined}>
        <Input id={`ef-${e.id}`} type="number" min={0} step={0.5} disabled={!!e.invoice_id} value={f.fee} onChange={x => setF({ ...f, fee: x.target.value })} />
      </Field>
      <div className="flex items-end">
        <Button size="sm" disabled={!f.grade.trim()} onClick={() => onWrite(S.UPDATE_EXAM_ENTRY,
          [e.id, f.grade, f.fee ? Math.round(Number(f.fee) * 100) : 0, f.at ? new Date(f.at).toISOString() : null])}>Save details</Button>
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-1.5">
        <Select aria-label={`Result for ${e.student}`} className="h-9 w-40 text-[0.8125rem]" value={e.result ?? ''}
          onChange={x => onWrite(E.EXAM_RESULT, [e.id, x.target.value || null, mark ? Number(mark) : null])}>
          <option value="">{e.status === 'sat' ? 'Sat, no result yet' : 'No result yet'}</option>
          {E.RESULTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input aria-label={`Mark for ${e.student}`} className="h-9 w-16 text-[0.8125rem]" type="number" min={0} max={100} placeholder="%"
          value={mark} onChange={x => setMark(x.target.value)} onBlur={() => e.result && onWrite(E.EXAM_RESULT, [e.id, e.result, mark ? Number(mark) : null])} />
        <label className="flex min-h-[36px] items-center gap-2 text-[0.8125rem]">
          <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={e.certificate_received}
            onChange={x => onWrite(S.EXAM_CERTIFICATE, [e.id, x.target.checked])} /> Certificate received
        </label>
        {e.confirmed_at && e.status === 'entered' && <Button size="sm" variant="ghost" onClick={() => onWrite(S.CONFIRM_EXAM_ENTRY, [e.id, false])}>Undo confirm</Button>}
        {e.status === 'entered' && <Button size="sm" variant="ghost" onClick={() => onWrite(E.WITHDRAW_EXAM, [e.id])}>Withdraw</Button>}
      </div>
    </div>
  );
}

/** A student's exams, for a teacher's student panel or a family's child (R-058, round 2 F2). */
export function StudentExams({ studentId, canEnter }: { studentId: string; canEnter?: boolean }) {
  const rows = useRows<E.ExamEntry>(['student-exams', studentId], E.STUDENT_EXAMS, [studentId]);
  const upcoming = useRows<{ id: string; board: string; title: string; exam_on: string }>(['upcoming-exams'], E.UPCOMING_EXAMS, [], { enabled: !!canEnter });
  const write = useWrite();
  const [f, setF] = React.useState({ session: '', grade: '' });
  if (!rows.data?.length && !(canEnter && upcoming.data?.length)) return <p className={cn(canEnter ? 'text-[0.8125rem]' : '', 'text-ink-3')}>No exams yet.</p>;
  return (
    <div className="space-y-2">
      <ul className="space-y-1.5 text-sm">
        {rows.data?.map(e => {
          const stage = S.examStage(e);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {canEnter && <Award className={cn('size-4 shrink-0', e.result && e.result !== 'not_yet' ? 'text-positive' : 'text-ink-3')} aria-hidden />}
              <span className="min-w-0 flex-1">{e.board} {e.grade} <span className="text-ink-3">· {dateShort(e.exam_on)}{e.venue && !canEnter ? ` · ${e.venue}` : ''}</span></span>
              {canEnter && stage === 'result'
                ? <Badge tone={e.result === 'not_yet' ? 'neutral' : 'positive'}>{examStatusText(e)}</Badge>
                : canEnter && (stage === 'sat' || (stage === 'confirmed' && new Date(e.exam_on) < new Date()))
                ? <Select aria-label={`Result, ${e.board} ${e.grade}`} className="h-8 w-32 text-[0.7812rem]" value=""
                    onChange={x => x.target.value && write.mutate({ sql: E.EXAM_RESULT, params: [e.id, x.target.value, null] })}>
                    <option value="">Result…</option>{E.RESULTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
                : <span className={cn('text-[0.8438rem] font-semibold', stage === 'result' && e.result !== 'not_yet' ? 'text-positive' : stage === 'entered' ? 'text-caution' : 'text-ink-2')}>{examStatusText(e)}</span>}
              {canEnter && stage === 'entered' && <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: S.CONFIRM_EXAM_ENTRY, params: [e.id, true] })}>Confirm</Button>}
            </li>
          );
        })}
      </ul>
      {canEnter && !!upcoming.data?.length && (
        <div className="flex gap-1.5">
          <Select aria-label="Exam session" className="h-9 min-w-0 flex-1 text-[0.8125rem]" value={f.session} onChange={e => setF({ ...f, session: e.target.value })}>
            <option value="">Enter for an exam…</option>
            {upcoming.data.map(x => <option key={x.id} value={x.id}>{x.board} · {x.title} ({dateShort(x.exam_on)})</option>)}
          </Select>
          <Input aria-label="Grade" className="h-9 w-24" placeholder="Grade" value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })} />
          <Button size="sm" disabled={!f.session || !f.grade.trim()}
            onClick={() => { write.mutate({ sql: E.ENTER_EXAM, params: [f.session, studentId, f.grade, null] }); setF({ session: '', grade: '' }); }}>Enter</Button>
        </div>
      )}
      {write.error != null && <ErrorState error={write.error} />}
    </div>
  );
}
