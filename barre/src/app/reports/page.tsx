'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, ArrowDownRight, ArrowUpRight, Minus, Info } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows, useRow } from '@/lib/query';
import { Beats, Button, ErrorState, Select, Skeleton, SectionHead, ViewTabs } from '@/components/ui';
import * as R from '@/lib/repos/reports';
import { pulseComponents, pulseScore, MIN_HISTORY_DAYS } from '@/lib/pulse/score';
import { money, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadCsv } from '@/lib/csv';
import { isoDate } from '@/lib/format';

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : null);

/**
 * The few numbers a studio owner actually steers by, each with the rows it
 * comes from one click away. Charts only where a shape says more than a
 * number: attendance over weeks, money over months.
 */
export default function ReportsPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Reports /></Suspense>;
}

function Reports() {
  // The location lives in the URL, so a filtered report can be shared (UR-33).
  const params = useSearchParams();
  const router = useRouter();
  const locations = useRows<R.Location>(['report-locations'], R.LOCATIONS);
  const multi = (locations.data?.length ?? 0) > 1;
  const loc = multi ? params.get('loc') || null : null;
  const locName = locations.data?.find(l => l.id === loc)?.name;
  const setLoc = (v: string) => {
    const q = new URLSearchParams(params.toString());
    if (v) q.set('loc', v); else q.delete('loc');
    router.replace(`/reports${q.size ? `?${q}` : ''}`, { scroll: false });
  };

  const h = useRow<R.Headline>(['report-headline', loc], R.HEADLINE_AT, [loc]);
  const weeks = useRows<R.WeekRow>(['report-weeks', loc], R.WEEKLY_ATTENDANCE_AT, [loc]);
  const classes = useRows<R.ClassStatAt>(['report-classes', loc], R.CLASS_STATS_AT, [loc]);
  const months = useRows<R.MonthRow>(['report-months'], R.MONTHS);
  const d = h.data;
  const [under, setUnder] = React.useState<number | null>(null);
  const shownClasses = (classes.data ?? []).filter(c => under == null || R.underFilled(c, under))
    .sort((a, b) => under == null ? 0 : a.enrolled / a.capacity - b.enrolled / b.capacity);

  return (
    <Shell title="Reports" allow={['owner', 'admin']} subtitle={locName ? `${locName} · live from registers and enrolments` : 'Live from registers, enrolments and the ledger'}
      actions={<ReportExports />}>
      <div className="mx-auto max-w-[1240px] space-y-10">
        {multi && (
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="r-loc" className="text-[14px] font-semibold">Location</label>
            <Select id="r-loc" value={loc ?? ''} onChange={e => setLoc(e.target.value)} className="w-auto min-w-48">
              <option value="">All locations</option>
              {locations.data!.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </div>
        )}
        {h.error && <ErrorState error={h.error} onRetry={() => h.refetch()} />}

        {/* Four numbers the school steers by; four more beneath, quieter. */}
        <section aria-label="Headline figures">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-line">
            <Kpi label="Active students" loading={h.isLoading} value={d?.active_students}
                 change={d && d.active_30d_ago ? d.active_students - d.active_30d_ago : null}
                 note="in a class now · vs 30 days ago" href="/people?tab=students" />
            <Kpi label="Attendance, 4 weeks" loading={h.isLoading}
                 value={d && (pct(d.attended_28d, d.marked_28d) ?? '—') + (d.marked_28d ? '%' : '')}
                 note={d && `${d.attended_28d} of ${d.marked_28d} marks`} />
            <Kpi label="Places filled" loading={h.isLoading}
                 value={d && `${pct(d.enrolled, d.capacity) ?? 0}%`}
                 note={d && `${d.enrolled} of ${d.capacity}${d.waiting ? ` · ${d.waiting} waiting` : ''}`} href="/classes" />
            <Kpi label="Trial conversion" loading={h.isLoading}
                 value={d && (d.trials_attended ? `${pct(d.converted, d.trials_attended)}%` : '—')}
                 note={d && `${d.converted} enrolled of ${d.trials_attended} trialled${loc ? ' · whole school' : ''}`} href="/enrolment" />
          </dl>
          <dl className="mt-6 grid grid-cols-2 border-y border-line sm:grid-cols-4 sm:divide-x sm:divide-line">
            <Small label="New students, 30 days" loading={h.isLoading} value={d?.new_30d} href="/people?tab=students" />
            <Small label="Leavers, 30 days" loading={h.isLoading} value={d?.leavers_30d} />
            <Small label={loc ? 'Outstanding, whole school' : 'Outstanding'} loading={h.isLoading} value={d && money(d.outstanding_minor)} href="/billing" />
            <Small label={loc ? 'Collected, 30 days, whole school' : 'Collected, 30 days'} loading={h.isLoading} value={d && money(d.collected_30d_minor)} href="/billing" />
          </dl>
          <p className="mt-2 text-[13px] text-ink-3">Active students are children in at least one class today, each counted once. Your plan’s student count on Account also includes trial children and those who have left.</p>
        </section>

        {multi && !loc && <LocationCompare />}

        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          <section aria-labelledby="r-weeks">
            <SectionHead id="r-weeks" title="Attendance by week" meta="Present or late, of everyone marked" />
            <div className="pt-4">
              {weeks.isLoading && <Skeleton className="h-36" />}
              {weeks.data && <WeekBars rows={weeks.data} />}
              <p className="mt-3 text-[13px] text-ink-3">Excused absences are left out. Weeks under 75% show in amber.</p>
            </div>
          </section>

          <section aria-labelledby="r-months">
            <SectionHead id="r-months" title="Six months" meta={loc ? 'Whole school · collected, joined and left' : 'Collected, joined and left'} />
            <div className="pt-2">
              {months.isLoading && <Skeleton className="h-36" />}
              {months.data && <MonthTable rows={months.data} />}
            </div>
          </section>
        </div>

        <section aria-labelledby="r-classes">
          <SectionHead id="r-classes" title="Classes"
            meta={under == null ? 'Fullest first · attendance over four weeks' : `Under ${under}% full, emptiest first · places now and four weeks ago`}
            action={
              <Select aria-label="Show classes" value={under == null ? '' : String(under)} onChange={e => setUnder(e.target.value ? Number(e.target.value) : null)} className="w-auto">
                <option value="">All classes</option>
                {[50, 60, 75].map(n => <option key={n} value={n}>Under {n}% full</option>)}
              </Select>
            } />
          {classes.isLoading && <div className="space-y-3 pt-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10" />)}</div>}
          {classes.data && shownClasses.length === 0 && <p className="py-4 text-[14px] text-ink-3">No class is under {under}% full.</p>}
          {!!shownClasses.length && (
            <div className="hidden grid-cols-[minmax(0,1fr)_220px_110px] gap-x-6 border-b border-line py-2 sm:grid" aria-hidden>
              <span className="label">Class</span><span className="label">Places</span><span className="label text-right">Attendance</span>
            </div>
          )}
          <ul className="divide-y divide-line">
            {shownClasses.map(c => {
              const att = pct(c.attended, c.marked);
              const full = c.enrolled >= c.capacity;
              const dropIn = c.pricing === 'drop_in';
              const trend = c.enrolled - c.enrolled_4w_ago;
              return (
                <li key={c.id}>
                  <Link href={`/classes?id=${c.id}`} className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-2.5 hover:bg-surface-2/60 sm:grid-cols-[minmax(0,1fr)_220px_110px]">
                    <span className="col-start-1 row-start-1 min-w-0 sm:col-start-auto sm:row-start-auto">
                      <span className="block truncate font-semibold">{c.name}</span>
                      <span className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-ink-3">
                        {c.style && <><span aria-hidden className={cn('size-2 shrink-0 rounded-[2px]', STYLE_BG[c.colour ?? ''] ?? 'bg-ink-3')} />{c.style}</>}
                        {multi && !loc && c.location && <span>· {c.location}</span>}
                        {c.waiting > 0 && <span className="font-semibold text-caution">· {c.waiting} waiting</span>}
                        {under != null && !dropIn && <span>· {trend > 0 ? `up ${trend}` : trend < 0 ? `down ${-trend}` : 'no change'} in 4 weeks</span>}
                        {under != null && c.price_minor > 0 && <span>· {money((c.capacity - c.enrolled) * c.price_minor)} in empty places</span>}
                      </span>
                    </span>
                    <span className="col-span-2 row-start-2 flex items-center gap-2.5 sm:col-span-1 sm:row-start-auto">
                      {dropIn ? <span className="text-[13.5px] text-ink-2">Drop-in: booked by the class</span> : <>
                        <Beats value={c.enrolled} max={c.capacity} tone={full ? 'caution' : 'accent'} label={`${c.enrolled} of ${c.capacity} places`} />
                        <span className="tnum text-[13.5px] text-ink-2">{c.enrolled} of {c.capacity}{full && <span className="font-semibold text-caution"> · full</span>}</span>
                      </>}
                    </span>
                    <span className="tnum col-start-2 row-start-1 text-right text-[14px] sm:col-start-auto sm:row-start-auto">
                      {att == null ? <span className="text-[13px] text-ink-3">No registers</span>
                        : <span className={cn(att < 75 ? 'font-semibold text-caution' : 'text-ink')}>{att}%<span className="sr-only"> attendance</span>{att < 75 && <span className="text-[12.5px]"> low</span>}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <Retention />

        {d && !loc && <Pulse d={d} />}
      </div>
    </Shell>
  );
}

/** One row per location: the same figures side by side (UR-33). */
function LocationCompare() {
  const rows = useRows<R.LocationRow>(['report-by-location'], R.BY_LOCATION);
  return (
    <section aria-labelledby="r-locs">
      <SectionHead id="r-locs" title="By location" meta="Students counted once per location · term fees from current enrolments" />
      {rows.isLoading && <Skeleton className="mt-3 h-24" />}
      {rows.data && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line text-left">
              <tr>{['Location', 'Classes', 'Students', 'Places filled', 'Attendance, 4 weeks', 'Billed, 30 days', 'Term fees, enrolled'].map((t, i) =>
                <th key={t} scope="col" className={cn('label py-2 font-semibold', i > 0 && 'text-right')}>{t}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.data.map(l => (
                <tr key={l.id}>
                  <th scope="row" className="py-2 text-left font-semibold"><Link href={`/reports?loc=${l.id}`} className="hover:underline">{l.name}</Link></th>
                  <td className="tnum py-2 text-right">{l.classes}</td>
                  <td className="tnum py-2 text-right">{l.students}</td>
                  <td className="tnum py-2 text-right">{pct(l.enrolled, l.capacity) ?? 0}% <span className="text-ink-3">({l.enrolled} of {l.capacity})</span></td>
                  <td className="tnum py-2 text-right">{pct(l.attended, l.marked) == null ? <span className="text-ink-3">No registers</span> : `${pct(l.attended, l.marked)}%`}</td>
                  <td className="tnum py-2 text-right">{money(l.billed_30d_minor)}</td>
                  <td className="tnum py-2 text-right">{money(l.fees_term_minor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Term on term: who carried on, who is new, who did not come back (UR-34). */
function Retention() {
  const terms = useRows<{ id: string; name: string; starts_on: string }>(['report-terms'], R.TERMS_LIST);
  const today = isoDate(new Date());
  const [termId, setTermId] = React.useState<string>('');
  const current = termId || terms.data?.find(t => String(t.starts_on).slice(0, 10) <= today)?.id || terms.data?.[0]?.id || '';
  const [by, setBy] = React.useState<'class' | 'style' | 'age'>('class');
  const sum = useRow<R.RetentionSummary>(['retention', current], R.RETENTION_SUMMARY, [current]);
  const rows = useRows<R.RetentionRow>(['retention-by', current, by], R.RETENTION_BY, [current, by], { enabled: !!current });
  const lapsed = useRows<R.LapsedRow>(['lapsed', current], R.LAPSED, [current], { enabled: !!current });
  const s = sum.data;
  if (!current) return null;
  return (
    <section aria-labelledby="r-ret">
      <SectionHead id="r-ret" title="Retention" meta={s?.previous_term ? `${s.previous_term} to ${s.current_term}` : undefined}
        action={terms.data && terms.data.length > 1 ? (
          <Select aria-label="Term" value={current} onChange={e => setTermId(e.target.value)} className="w-auto">
            {terms.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>) : undefined} />
      {sum.isLoading && <Skeleton className="mt-3 h-20" />}
      {s && !s.previous_term && <p className="py-4 text-[14px] text-ink-3">This is the first term in Swayvo, so there is nothing to compare with yet. Retention appears once a second term starts.</p>}
      {s?.previous_term && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 sm:grid-cols-4">
            <div><dt className="label">Carried on</dt><dd className="stat-number mt-1 text-[30px] leading-none">{pct(s.continuing, s.previous) ?? 0}%</dd>
              <dd className="mt-1 text-[13px] text-ink-3">{s.continuing} of {s.previous} from {s.previous_term}</dd></div>
            <div><dt className="label">Did not come back</dt><dd className="stat-number mt-1 text-[30px] leading-none">{s.lapsed}</dd></div>
            <div><dt className="label">New this term</dt><dd className="stat-number mt-1 text-[30px] leading-none">{s.new}</dd></div>
            <div><dt className="label">In {s.current_term}</dt><dd className="stat-number mt-1 text-[30px] leading-none">{s.current}</dd></div>
          </dl>
          <p className="mt-2 text-[13px] text-ink-3">A student counts in a term if they were in any of its classes. Moving class is not leaving.</p>
          <ViewTabs className="mt-5" label="Retention by" value={by} onChange={setBy} options={[['class', 'By class'], ['style', 'By style'], ['age', 'By age']]} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-line text-left">
                <tr>{[by === 'class' ? 'Class last term' : by === 'style' ? 'Style' : 'Age band', 'Last term', 'Carried on', 'Did not come back', 'New'].map((t, i) =>
                  <th key={t} scope="col" className={cn('label py-2 font-semibold', i > 0 && 'text-right')}>{t}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.data?.map(r => (
                  <tr key={r.label}>
                    <th scope="row" className="py-2 text-left font-medium">{r.label}</th>
                    <td className="tnum py-2 text-right">{r.previous}</td>
                    <td className="tnum py-2 text-right">{r.previous ? `${r.continuing} (${pct(r.continuing, r.previous)}%)` : '—'}</td>
                    <td className={cn('tnum py-2 text-right', r.lapsed && 'font-semibold text-caution')}>{r.lapsed}</td>
                    <td className="tnum py-2 text-right">{r.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!!lapsed.data?.length && (
            <div className="mt-6">
              <div className="flex flex-wrap items-baseline gap-3 border-b border-ink pb-1.5">
                <h3 className="flex-1 text-[14px] font-semibold">To contact: {lapsed.data.length} who did not come back</h3>
                <Button size="sm" variant="ghost" onClick={() => downloadCsv(`lapsed-${isoDate(new Date())}.csv`, lapsed.data!.map(l => ({
                  student: l.student, family: l.family, last_class: l.last_class, contact: l.contact ?? '', phone: l.phone ?? '', email: l.email ?? '' })))}>
                  <Download className="size-4" aria-hidden /> CSV
                </Button>
              </div>
              <ul className="divide-y divide-line text-[14px]">
                {lapsed.data.map(l => (
                  <li key={l.student_id} className="flex flex-wrap items-baseline gap-x-3 py-2">
                    <Link href={`/people?id=${l.family_id}`} className="min-w-0 flex-1 font-semibold hover:underline">{l.student}</Link>
                    <span className="text-ink-3">Last: {l.last_class}</span>
                    <span className="text-ink-2">{[l.contact, l.phone].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const STYLE_BG: Record<string, string> = { violet: 'bg-violet', amber: 'bg-amber', teal: 'bg-teal', rose: 'bg-rose', indigo: 'bg-indigo', lime: 'bg-lime' };


function Kpi({ label, value, note, change, loading, href }: {
  label: string; value?: React.ReactNode; note?: React.ReactNode | false | null;
  change?: number | null | false; loading?: boolean; href?: string;
}) {
  return (
    <div className="min-w-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <dt className="label">{href ? <Link href={href} className="hover:text-ink hover:underline">{label}</Link> : label}</dt>
      {loading ? <dd><Skeleton className="mt-2 h-8 w-20" /></dd> : (
        <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="stat-number text-[30px] leading-none lg:text-[34px]">{value ?? '—'}</span>
          {typeof change === 'number' && (
            <span className={cn('inline-flex items-center gap-0.5 text-[13px] font-semibold tnum',
              change > 0 ? 'text-positive' : change < 0 ? 'text-critical' : 'text-ink-3')}>
              {change > 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : change < 0 ? <ArrowDownRight className="size-3.5" aria-hidden /> : <Minus className="size-3.5" aria-hidden />}
              {change > 0 ? `up ${change}` : change < 0 ? `down ${-change}` : 'no change'}
            </span>
          )}
        </dd>
      )}
      {note && <dd className="mt-1.5 text-[13px] text-ink-3">{note}</dd>}
    </div>
  );
}

function Small({ label, value, loading, href }: { label: string; value?: React.ReactNode; loading?: boolean; href?: string }) {
  return (
    <div className="min-w-0 py-3 sm:px-4 sm:first:pl-0">
      <dt className="text-[13px] text-ink-3">{href ? <Link href={href} className="hover:text-ink hover:underline">{label}</Link> : label}</dt>
      <dd className="tnum mt-0.5 text-[17px] font-semibold">{loading ? <Skeleton className="h-5 w-14" /> : value ?? '—'}</dd>
    </div>
  );
}

function WeekBars({ rows }: { rows: R.WeekRow[] }) {
  const last = rows[rows.length - 1]?.week;
  return (
    <figure>
      <div className="flex h-36 items-end gap-2" aria-hidden>
        {rows.map(w => {
          const p = pct(w.attended, w.marked);
          return (
            <div key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className={cn('tnum text-[12px]', p != null && p < 75 ? 'font-semibold text-caution' : 'text-ink-2')}>{p == null ? '' : `${p}%`}</span>
              <span className={cn('w-full max-w-9 rounded-t-[2px]', p == null ? 'bg-surface-3' : p < 75 ? 'bg-caution' : last === w.week ? 'bg-accent' : 'bg-ink-2')}
                    style={{ height: p == null ? '4px' : `${Math.max(6, p)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2 border-t border-line pt-1.5" aria-hidden>
        {rows.map((w, n) => <span key={w.week} className="flex-1 text-center text-[12px] text-ink-3">
          {n === rows.length - 1 ? 'This week' : dateShort(w.week)}</span>)}
      </div>
      {/* The same figures as a table, for anyone not reading bars. */}
      <table className="sr-only">
        <caption>Attendance by week</caption>
        <thead><tr><th>Week of</th><th>Attendance</th><th>Marks</th></tr></thead>
        <tbody>{rows.map(w => <tr key={w.week}><td>{dateShort(w.week)}</td><td>{pct(w.attended, w.marked) == null ? 'No registers' : `${pct(w.attended, w.marked)}%`}</td><td>{w.marked}</td></tr>)}</tbody>
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
      <thead className="border-b border-line text-left">
        <tr><th scope="col" className="label py-2 font-semibold">Month</th><th scope="col" className="label py-2 font-semibold">Collected</th>
            <th scope="col" className="label py-2 text-right font-semibold">Joined</th><th scope="col" className="label py-2 text-right font-semibold">Left</th></tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map(r => (
          <tr key={r.month}>
            <td className="w-14 py-2 text-ink-2">{name(r.month)}</td>
            <td className="py-2 pr-3">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2 rounded-[2px] bg-ink-2" style={{ width: `${(Number(r.collected_minor) / max) * 100}%`, minWidth: Number(r.collected_minor) ? 4 : 0 }} />
                <span className="tnum shrink-0 text-[13.5px] font-medium">{money(r.collected_minor)}</span>
              </span>
            </td>
            <td className="tnum py-2 text-right">{r.joined}</td>
            <td className="tnum py-2 text-right">{r.left}</td>
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
    <section aria-labelledby="r-pulse">
      <SectionHead id="r-pulse" title="Studio Pulse" meta="Preview" />
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-4">
        <p className="max-w-xl text-[14.5px] text-ink-2">One health score from five rates you already have.</p>
        {result.score != null
          ? <p className="stat-number text-[40px] leading-none">{result.score}<span className="text-[16px] text-ink-3"> / 100</span></p>
          : <p className="max-w-[280px] text-[13px] text-ink-3"><Info className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />{result.reason}</p>}
      </div>
      <ul className="mt-5 grid divide-y divide-line border-y border-line sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {components.map(c => (
          <li key={c.key} className="py-4 sm:px-4 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[13px] font-semibold text-ink">{c.label}</p>
            <p className="stat-number mt-1 text-[24px] leading-none">
              {c.value == null ? <span className="font-sans text-[14px] font-normal text-ink-3">Not enough data</span> : `${Math.round(c.value * 100)}%`}
            </p>
            <p className="mt-2 text-[13px] text-ink-3" title={`${c.definition} ${c.basis}.`}>Counts {Math.round(c.weight * 100)}%</p>
          </li>
        ))}
      </ul>
      <details className="mt-3 text-[13px] text-ink-3">
        <summary className="cursor-pointer font-semibold text-ink-2">How the score works</summary>
        <ul className="mt-2 space-y-1">{components.map(c => <li key={c.key}><b className="text-ink-2">{c.label}:</b> {c.definition} ({c.basis})</li>)}
          <li>The score appears after {MIN_HISTORY_DAYS} days of history and once every rate has at least 20 in its sample.</li></ul>
      </details>
    </section>
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
