'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Receipt, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { Button, EmptyState, ErrorState, Notice, Skeleton, Word } from '@/components/ui';
import { useRow, useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as E from '@/lib/repos/events';
import { dateLong, dateShort, money, time } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * The exam-day register (0072): every candidate in the examiner's time order,
 * whether their fee is paid, and Here / Absent on the day. The office and the
 * children's teachers use it; a teacher sees only the children they teach.
 */
export default function ExamRegisterPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><ExamRegister /></Suspense>;
}

type Session = { id: string; board: string; title: string; exam_on: string; venue: string | null; fee_minor: number; bill_on_entry: boolean };

function ExamRegister() {
  const id = useSearchParams().get('session');
  const { session } = useSession();
  const qc = useQueryClient();
  const office = session?.role === 'owner' || session?.role === 'admin';
  const x = useRow<Session>(['exam-session', id ?? ''], E.EXAM_SESSION_ONE, [id]);
  const rows = useRows<E.ExamRegisterRow>(['exam-register', id ?? ''], E.EXAM_REGISTER, [id], { enabled: !!id });
  const write = useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const list = rows.data ?? [];
  const owing = list.filter(r => r.fee_state === 'unpaid' || r.fee_state === 'part_paid' || r.fee_state === 'unbilled');
  const unbilled = list.filter(r => r.fee_state === 'unbilled').length;
  const here = list.filter(r => r.attendance === 'here').length;
  const title = x.data ? (x.data.title.toLowerCase().includes(x.data.board.toLowerCase()) ? x.data.title : `${x.data.board} · ${x.data.title}`) : 'Exam register';

  return (
    <Shell title={title} allow={['owner', 'admin', 'teacher']}
      subtitle={x.data ? `${dateLong(x.data.exam_on)}${x.data.venue ? ` · ${x.data.venue}` : ''}` : undefined}>
      <div className="mx-auto max-w-2xl space-y-4 pb-10">
        {!id && <EmptyState title="Which exam?" body="Open the register from an exam session in Events." />}
        {(rows.error ?? x.error) != null && <ErrorState error={rows.error ?? x.error} onRetry={() => rows.refetch()} />}
        {write.error != null && <ErrorState error={write.error} />}

        {rows.data && list.length > 0 && (
          owing.length > 0
            ? <Notice word="Fees" tone="critical"
                title={`${owing.length} of ${list.length} exam fee${list.length === 1 ? '' : 's'} not paid`}
                detail={office
                  ? `${unbilled ? `${unbilled} not billed yet. ` : ''}Families are reminded 24 hours before their child’s exam, and you are told who is still unpaid.`
                  : 'The office follows up fees. Marked here so you know on the day.'}
                action={office && unbilled > 0 ? (
                  <Button size="sm" loading={write.isPending} onClick={() => write.mutate({ sql: E.BILL_EXAM, params: [id] })}>
                    <Receipt className="size-4" aria-hidden /> Bill {unbilled}
                  </Button>) : undefined} />
            : <Notice word="Fees" tone="positive" title="Every exam fee is paid" />
        )}

        <section aria-labelledby="cands-h">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
            <h2 id="cands-h" className="section-title">Candidates</h2>
            {list.length > 0 && <span className="text-[0.8125rem] text-ink-3">{here} of {list.length} here</span>}
          </div>
          {rows.isPending && id && <Skeleton className="mt-3 h-40" />}
          {rows.data && list.length === 0 && <EmptyState title="Nobody entered" body={office ? 'Enter children from the exam session in Events.' : 'None of your students is entered for this exam.'} />}
          <ul className="divide-y divide-line">
            {list.map(r => (
              <li key={r.entry_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3">
                <div className="min-w-0">
                  <p className="text-[1.0625rem] font-semibold leading-tight">
                    {r.sits_at && <span className="mr-2 tnum text-ink-2">{time(r.sits_at)}</span>}{r.student}
                  </p>
                  <p className="mt-0.5 text-[0.8438rem] text-ink-3">
                    {r.grade}{r.fee_state !== 'none' && ` · ${money(r.fee_minor)}`} · <Word tone={E.FEE_TONE[r.fee_state]}>{E.FEE_WORD[r.fee_state]}</Word>
                    {office && r.fee_state === 'unpaid' && r.due_on && <span> · due {dateShort(r.due_on)}</span>}
                  </p>
                </div>
                <div role="group" aria-label={`Mark ${r.student}`}
                  className={cn('grid h-12 w-[9.5rem] grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border-[1.5px] sm:w-44',
                    r.attendance === 'here' ? 'border-positive' : r.attendance === 'absent' ? 'border-critical' : 'border-line-strong')}>
                  <button aria-pressed={r.attendance === 'here'} aria-label={`Here — ${r.student}`}
                    onClick={() => write.mutate({ sql: E.MARK_EXAM_ATTENDANCE, params: [r.entry_id, r.attendance === 'here' ? null : 'here'] })}
                    className={cn('flex items-center justify-center gap-1 text-[0.9375rem] font-semibold',
                      r.attendance === 'here' ? 'bg-positive-soft text-positive' : 'text-ink-2 hover:bg-surface-2')}>
                    {r.attendance === 'here' && <Check className="size-4" strokeWidth={2.5} aria-hidden />}Here
                  </button>
                  <button aria-pressed={r.attendance === 'absent'} aria-label={`Absent — ${r.student}`}
                    onClick={() => write.mutate({ sql: E.MARK_EXAM_ATTENDANCE, params: [r.entry_id, r.attendance === 'absent' ? null : 'absent'] })}
                    className={cn('flex items-center justify-center gap-1 border-l-[1.5px] text-[0.9375rem] font-semibold',
                      r.attendance === 'here' ? 'border-positive' : r.attendance === 'absent' ? 'border-critical' : 'border-line-strong',
                      r.attendance === 'absent' ? 'bg-critical-soft text-critical' : 'text-ink-2 hover:bg-surface-2')}>
                    {r.attendance === 'absent' && <X className="size-4" strokeWidth={2.5} aria-hidden />}Absent
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {office && <p className="text-[0.8125rem] text-ink-3">Grades, times, fees and results are in <Link href="/events/" className="font-semibold text-accent-text hover:underline">Events → Exam entries</Link>.</p>}
      </div>
    </Shell>
  );
}
