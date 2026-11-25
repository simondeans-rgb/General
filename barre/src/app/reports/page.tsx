'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, Activity, ArrowDownRight, ArrowUpRight, Minus, HeartPulse, Info } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { Badge, Button, Card, CardHeader, ErrorState, Skeleton, type Tone } from '@/components/ui';
import * as R from '@/lib/repos/reports';
import { pulseComponents, pulseScore, MIN_HISTORY_DAYS } from '@/lib/pulse/score';
import { money, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadCsv } from '@/lib/csv';
import { isoDate } from '@/lib/format';

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : null);
const TONES: Record<string, Tone> = { violet: 'violet', amber: 'amber', teal: 'teal', rose: 'rose', indigo: 'indigo', lime: 'lime' };

/**
 * The few numbers a studio owner actually steers by, each with the rows it
 * comes from one click away. Charts only where a shape says more than a
 * number: attendance over weeks, money over months.
 */
export default function ReportsPage() {
  const h = useRow<R.Headline>(['report-headline'], R.HEADLINE);
  const weeks = useRows<R.WeekRow>(['report-weeks'], R.WEEKLY_ATTENDANCE);
  const classes = useRows<R.ClassStat>(['report-classes'], R.CLASS_STATS);
  const months = useRows<R.MonthRow>(['report-months'], R.MONTHS);
  const d = h.data;

  return (
    <Shell title="Reports" allow={['owner', 'admin']} subtitle="Live from registers, enrolments and the ledger"
      actions={<ReportExports />}>
      <div className="mx-auto max-w-6xl space-y-5">
        {h.error && <ErrorState error={h.error} onRetry={() => h.refetch()} />}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Active students" loading={h.isLoading} value={d?.active_students}
               change={d && d.active_30d_ago ? d.active_students - d.active_30d_ago : null}
               note="vs 30 days ago" href="/people?tab=students" />
          <Kpi label="Attendance, 4 weeks" loading={h.isLoading}
               value={d && (pct(d.attended_28d, d.marked_28d) ?? '—') + (d.marked_28d ? '%' : '')}
               note={d && `${d.attended_28d} of ${d.marked_28d} marks`} />
          <Kpi label="Places filled" loading={h.isLoading}
               value={d && `${pct(d.enrolled, d.capacity) ?? 0}%`}
               note={d && `${d.enrolled}/${d.capacity}${d.waiting ? ` · ${d.waiting} waiting` : ''}`} href="/classes" />
          <Kpi label="Trial conversion" loading={h.isLoading}
               value={d && (d.trials_attended ? `${pct(d.converted, d.trials_attended)}%` : '—')}
               note={d && `${d.converted} enrolled of ${d.trials_attended} trialled`} href="/enrolment" />
          <Kpi label="New students, 30 days" loading={h.isLoading} value={d?.new_30d} href="/people?tab=students" />
          <Kpi label="Leavers, 30 days" loading={h.isLoading} value={d?.leavers_30d} />
          <Kpi label="Outstanding" loading={h.isLoading} value={d && money(d.outstanding_minor)} href="/billing" />
          <Kpi label="Collected, 30 days" loading={h.isLoading} value={d && money(d.collected_30d_minor)} href="/billing" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Attendance by week" subtitle="Present or late, of everyone marked. Excused absences are left out." />
            <div className="p-4">
              {weeks.isLoading && <Skeleton className="h-36" />}
              {weeks.data && <WeekBars rows={weeks.data} />}
            </div>
          </Card>

          <Card>
            <CardHeader title="Six months" subtitle="Money collected, and students joining and leaving" />
            <div className="p-4">
              {months.isLoading && <Skeleton className="h-36" />}
              {months.data && <MonthTable rows={months.data} />}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader title="Classes" subtitle="Fullest first. Attendance is the last four weeks." />
          {classes.isLoading && <div className="space-y-2 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-10" />)}</div>}
          <ul className="divide-y divide-line">
            {classes.data?.map(c => {
              const fill = pct(c.enrolled, c.capacity) ?? 0;
              const att = pct(c.attended, c.marked);
              return (
                <li key={c.id}>
                  <Link href={`/classes?id=${c.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_200px_90px]">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{c.name}</span>
                        {c.style && <Badge tone={TONES[c.colour ?? ''] ?? 'neutral'}>{c.style}</Badge>}
                        {c.waiting > 0 && <Badge tone="caution">{c.waiting} waiting</Badge>}
                      </span>
                    </span>
                    <span className="col-span-2 row-start-2 flex items-center gap-2 sm:col-span-1 sm:row-start-auto">
                      <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                        <span className={cn('block h-full rounded-full', fill >= 100 ? 'bg-caution' : 'bg-accent')} style={{ width: `${Math.min(100, fill)}%` }} />
                      </span>
                      <span className="tnum w-14 text-right text-[13px] text-ink-2">{c.enrolled}/{c.capacity}</span>
                    </span>
                    <span className="tnum text-right text-[13px]">
                      {att == null ? <span className="text-ink-3">—</span>
                        : <span className={cn(att < 75 && 'font-medium text-caution')}>{att}%<span className="sr-only"> attendance</span></span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        {d && <Pulse d={d} />}
      </div>
    </Shell>
  );
}

function Kpi({ label, value, note, change, loading, href }: {
  label: string; value?: React.ReactNode; note?: React.ReactNode | false | null;
  change?: number | null | false; loading?: boolean; href?: string;
}) {
  const body = (
    <>
      <p className="text-[12.5px] text-ink-3">{label}</p>
      {loading ? <Skeleton className="mt-2 h-7 w-20" /> : (
        <p className="stat-number tnum mt-1 flex items-baseline gap-2 text-[22px] font-semibold leading-tight tracking-[-0.02em]">
          {value ?? '—'}
          {typeof change === 'number' && (
            <span className={cn('inline-flex items-center gap-0.5 text-[13px] font-medium',
              change > 0 ? 'text-positive' : change < 0 ? 'text-critical' : 'text-ink-3')}>
              {change > 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : change < 0 ? <ArrowDownRight className="size-3.5" aria-hidden /> : <Minus className="size-3.5" aria-hidden />}
              {change > 0 ? `+${change}` : change}
            </span>
          )}
        </p>
      )}
      {note && <p className="mt-0.5 truncate text-[12.5px] text-ink-2">{note}</p>}
    </>
  );
  return (
    <Card className="p-0">
      {href ? <Link href={href} className="block rounded-[inherit] p-4 hover:bg-surface-2">{body}</Link>
            : <div className="p-4">{body}</div>}
    </Card>
  );
}

function WeekBars({ rows }: { rows: R.WeekRow[] }) {
  return (
    <figure>
      <div className="flex h-36 items-end gap-2" aria-hidden>
        {rows.map(w => {
          const p = pct(w.attended, w.marked);
          return (
            <div key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="tnum text-[11.5px] text-ink-2">{p == null ? '' : `${p}%`}</span>
              <span className={cn('w-full max-w-10 rounded-t-[4px]', p == null ? 'bg-surface-3' : p < 75 ? 'bg-caution/70' : 'bg-accent/80')}
                    style={{ height: p == null ? '4px' : `${Math.max(6, p)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2 border-t border-line pt-1.5" aria-hidden>
        {rows.map((w, n) => <span key={w.week} className="flex-1 text-center text-[11px] text-ink-3">
          {n === rows.length - 1 ? 'This week' : dateShort(w.week)}</span>)}
      </div>
      {/* The same figures as a table, for anyone not reading bars. */}
      <table className="sr-only">
        <caption>Attendance by week</caption>
        <thead><tr><th>Week of</th><th>Attendance</th><th>Marks</th></tr></thead>
        <tbody>{rows.map(w => <tr key={w.week}><td>{dateShort(w.week)}</td><td>{pct(w.attended, w.marked) ?? 'no registers'}%</td><td>{w.marked}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

function MonthTable({ rows }: { rows: R.MonthRow[] }) {
  // Months before the studio's records began are not "£0 months"; leave them out.
  const first = rows.findIndex(r => Number(r.collected_minor) || r.joined || r.left);
  rows = first < 0 ? rows.slice(-1) : rows.slice(first);
  const max = Math.max(1, ...rows.map(r => Number(r.collected_minor)));
  const name = (m: string) => new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(`${m}-01T12:00:00Z`));
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-[12px] text-ink-3">
        <tr><th scope="col" className="pb-2 font-medium">Month</th><th scope="col" className="pb-2 font-medium">Collected</th>
            <th scope="col" className="pb-2 text-right font-medium">Joined</th><th scope="col" className="pb-2 text-right font-medium">Left</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.month}>
            <td className="w-12 py-1.5 text-ink-2">{name(r.month)}</td>
            <td className="py-1.5 pr-3">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2 rounded-full bg-accent/80" style={{ width: `${(Number(r.collected_minor) / max) * 100}%`, minWidth: Number(r.collected_minor) ? 4 : 0 }} />
                <span className="tnum shrink-0 text-[13px]">{money(r.collected_minor)}</span>
              </span>
            </td>
            <td className="tnum py-1.5 text-right">{r.joined}</td>
            <td className="tnum py-1.5 text-right">{r.left}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Studio Pulse: the components are live; the composite waits for history. */
function Pulse({ d }: { d: R.Headline }) {
  const components = pulseComponents({ ...d,
    issued_90d_minor: Number(d.issued_90d_minor), overdue_90d_minor: Number(d.overdue_90d_minor) });
  const result = pulseScore(components, d.history_days);
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-4 border-b border-line p-4">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent-text">
          <HeartPulse className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-semibold">Studio Pulse <Badge tone="neutral">Preview</Badge></h2>
          <p className="mt-0.5 max-w-xl text-sm text-ink-2">
            One 0–100 health score built from five rates the studio already produces. The parts are live below;
            the score itself is only shown once there is enough history to trust it.
          </p>
        </div>
        <div className="text-right">
          {result.score != null
            ? <p className="tnum text-[34px] font-semibold leading-none">{result.score}<span className="text-base text-ink-3">/100</span></p>
            : <p className="max-w-[240px] text-[13px] text-ink-2"><Info className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />{result.reason}</p>}
        </div>
      </div>
      <ul className="grid divide-y divide-line sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {components.map(c => (
          <li key={c.key} className="p-4">
            <p className="text-[12.5px] text-ink-3">{c.label} · counts {Math.round(c.weight * 100)}%</p>
            <p className="tnum mt-1 text-[20px] font-semibold">
              {c.value == null ? <span className="text-[14px] font-normal text-ink-3">Not enough data</span> : `${Math.round(c.value * 100)}%`}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-2">{c.definition}</p>
            <p className="mt-1 text-[12px] text-ink-3">{c.basis}</p>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 border-t border-line bg-surface-2 px-4 py-2.5 text-[12.5px] text-ink-3">
        <Activity className="size-3.5" aria-hidden />
        The score appears after {MIN_HISTORY_DAYS} days of history and once every rate has a sample of at least 20.
      </p>
    </Card>
  );
}

/** Download any of the office's standard lists as a spreadsheet (R-012). */
function ReportExports() {
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const go = async (k: keyof typeof R.EXPORTS) => {
    setOpen(false);
    const e = R.EXPORTS[k];
    downloadCsv(`${e.file}-${isoDate(new Date())}.csv`, await readAs<Record<string, string>>(session, e.sql));
  };
  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
        <Download className="size-4" aria-hidden /> Export
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-lg">
          {(Object.keys(R.EXPORTS) as (keyof typeof R.EXPORTS)[]).map(k => (
            <button key={k} role="menuitem" onClick={() => go(k)}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-surface-2">{R.EXPORTS[k].label} (CSV)</button>
          ))}
        </div>
      )}
    </div>
  );
}
