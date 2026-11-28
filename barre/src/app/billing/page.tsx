'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, AlertTriangle, ArrowRight, Search, Send, Banknote, Ban, Undo2, Trash2, Wallet, CalendarRange, Download, FileMinus, Mail,
} from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { DetailPanel, DetailSection } from '@/components/app/detail-panel';
import { RecordSheet } from '@/components/app/record-sheet';
import { useRows, useRow } from '@/lib/query';
import { runAs, readAs } from '@/lib/db/client';
import { downloadCsv } from '@/lib/csv';
import { BillingRunPanel } from '@/components/app/billing-run';
import { FamilyAccount } from '@/components/app/family-account';
import { AbsenceCredits } from '@/components/app/absence-credit';
import { PaymentRemindersSheet } from '@/components/app/payment-reminders';
import { useLocationFilter } from '@/components/app/location-filter';
import { cardPaymentsEnabled, invoiceState } from '@/lib/payments/invoice-status';
import { paidAndCredited } from '@/lib/office-words';
import { refreshAfterWrite } from '@/lib/write';
import { announceSaved } from '@/lib/saved';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import {
  Button, EmptyState, ErrorState, Field, Input, Select, Skeleton, type Tone,
} from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { money, dateShort, isoDate, toMinor } from '@/lib/format';
import { cn } from '@/lib/cn';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  draft:     { label: 'Draft',     tone: 'neutral' },
  issued:    { label: 'Due',       tone: 'caution' },
  part_paid: { label: 'Part paid', tone: 'caution' },
  paid:      { label: 'Paid',      tone: 'positive' },
  void:      { label: 'Void',      tone: 'neutral' },
  refunded:  { label: 'Refunded',  tone: 'info' },
};

const KIND_LABEL: Record<string, string> = {
  tuition: 'Tuition', term_fee: 'Term fee', membership: 'Membership', exam_fee: 'Exam fee',
  show_fee: 'Show fee', costume: 'Costume', workshop: 'Workshop', private_lesson: 'Private lesson',
  merchandise: 'Merchandise', other: 'Other',
};

const METHOD_LABEL: Record<string, string> = {
  card: 'Card', direct_debit: 'Direct debit', bank_transfer: 'Bank transfer', cash: 'Cash',
  credit: 'Credit', account: 'From credit on account',
};

type Filter = 'attention' | 'open' | 'paid' | 'draft' | 'all';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'attention', label: 'Needs action' },
  { key: 'open', label: 'Open' },
  { key: 'draft', label: 'Drafts' },
  { key: 'paid', label: 'Paid' },
  { key: 'all', label: 'All' },
];

const isOpen = (s: string) => s === 'issued' || s === 'part_paid' || s === 'refunded';
const outstanding = (i: { total_minor: string; paid_minor: string }) =>
  Number(i.total_minor) - Number(i.paid_minor);

export default function BillingPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Billing /></Suspense>;
}

function Billing() {
  // The totals follow the location filter (U8; location_money, 0062).
  const loc = useLocationFilter();
  const summary = useRow<B.BillingSummary>(['billing-summary', loc.current], loc.current ? B.SUMMARY_AT : B.SUMMARY, loc.current ? [loc.current] : []);
  const invoices = useRows<B.InvoiceRow>(['invoices'], B.INVOICES);
  const { selected, select } = useSelection();
  const [filter, setFilter] = React.useState<Filter>('attention');
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [reminding, setReminding] = React.useState(false);
  // Schools with more than one location can narrow every list to one (UR-33).
  const atLoc = React.useMemo(() => (invoices.data ?? []).filter(i => !loc.current || (i.locations ?? []).includes(loc.current)),
    [invoices.data, loc.current]);

  const counts = React.useMemo(() => {
    const d = atLoc;
    return {
      attention: d.filter(i => i.failed || i.overdue || i.status === 'draft').length,
      open: d.filter(i => isOpen(i.status)).length,
      draft: d.filter(i => i.status === 'draft').length,
      paid: d.filter(i => i.status === 'paid').length,
      all: d.length,
    } satisfies Record<Filter, number>;
  }, [atLoc]);

  // Land somewhere useful: if nothing needs action, show what is open.
  const landed = React.useRef(false);
  React.useEffect(() => {
    if (landed.current || !invoices.data) return;
    landed.current = true;
    if (counts.attention === 0) setFilter('open');
  }, [invoices.data, counts.attention]);

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return atLoc.filter(i => {
      if (filter === 'attention' && !(i.failed || i.overdue || i.status === 'draft')) return false;
      if (filter === 'open' && !isOpen(i.status)) return false;
      if (filter === 'draft' && i.status !== 'draft') return false;
      if (filter === 'paid' && i.status !== 'paid') return false;
      if (q && !`${i.number} ${i.family_name} ${i.lines ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [atLoc, filter, query]);

  const s = summary.data;

  return (
    <Shell title="Billing" help={<>Invoices for every family. Use <b>Billing runs</b> to raise a whole term’s (or month’s) invoices at once: check the drafts, then send them together. Discounts — sibling, multi-class and per-family bursaries — are applied automatically. <b>Export</b> gives your accountant spreadsheets, aged debt and a Xero import file.</>} allow={['owner', 'admin']}
      subtitle={s ? `${money(s.outstanding_minor)} outstanding across ${s.owing_families} famil${s.owing_families === 1 ? 'y' : 'ies'}${loc.current ? ` at ${loc.current}` : ''}` : undefined}
      actions={<div className="flex gap-2">
        <ExportButton location={loc.current || null} />
        <Button size="sm" aria-label="Billing runs" onClick={() => setRunning(true)}>
          <CalendarRange className="size-4" aria-hidden /> <span className="hidden sm:inline">Billing runs</span>
        </Button>
        <Button size="sm" variant="primary" aria-label="New invoice" onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden /> <span className="hidden sm:inline">New invoice</span>
        </Button>
      </div>}>
      <div className="mx-auto max-w-[1240px] space-y-10">
        {/* The ledger's four figures. Two of them lead to the invoices that need action. */}
        <section aria-label={loc.current ? `Money at ${loc.current}` : 'Money at a glance'}>
          {loc.current && <p className="label mb-3">{loc.current} only</p>}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-line pb-6 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-line">
            <Stat label="Outstanding" loading={summary.isLoading}
              value={s && money(s.outstanding_minor)}
              note={s && `Owed by ${s.owing_families} famil${s.owing_families === 1 ? 'y' : 'ies'}`} />
            <Stat label="Overdue" loading={summary.isLoading} tone={s && Number(s.overdue_minor) > 0 ? 'caution' : undefined}
              value={s && money(s.overdue_minor)}
              note={s && (s.overdue_invoices ? `${s.overdue_invoices} invoice${s.overdue_invoices === 1 ? '' : 's'} past due` : 'Nothing past due')}
              action={s && s.overdue_invoices > 0 ? 'Chase' : undefined}
              onClick={() => setFilter('attention')} />
            {/* Card payments are not connected in this build, so a failed card
                cannot happen for real: the demo's sample failures are labelled
                as such rather than shown as live work (round 2, U3). */}
            {cardPaymentsEnabled() ? (
              <Stat label="Failed payments" loading={summary.isLoading} tone={s && s.failed_payments > 0 ? 'critical' : undefined}
                value={s && String(s.failed_payments)}
                note={s && (s.failed_payments ? `${money(s.failed_minor)} declined` : 'None outstanding')}
                action={s && s.failed_payments > 0 ? 'Retry' : undefined}
                onClick={() => setFilter('attention')} />
            ) : (
              <Stat label="Card payments" loading={summary.isLoading} value="Not connected"
                note={s && (s.failed_payments > 0
                  ? `Demo: cards not connected. ${s.failed_payments} sample declined card${s.failed_payments === 1 ? '' : 's'} in the demo data.`
                  : 'Families pay by bank transfer or cash for now.')} />
            )}
            <Stat label="Collected, 30 days" loading={summary.isLoading}
              value={s && money(s.collected_30d_minor)}
              note={s && (Number(s.credit_minor) > 0 ? `${money(s.credit_minor)} held as credit` : 'Card, transfer and cash')} />
          </dl>
        </section>

        <div className={cn('gap-x-10 gap-y-8', selected ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start' : 'block')}>
          <section aria-labelledby="inv-h" className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink pb-2">
              <h2 id="inv-h" className="section-title flex-1">Invoices</h2>
              {loc.control}
              {s && s.overdue_invoices > 0 && (
                <Button size="sm" onClick={() => setReminding(true)}>
                  <Mail className="size-4" aria-hidden /> Remind overdue
                </Button>
              )}
              <label className="relative w-full sm:w-64">
                <span className="sr-only">Search invoices</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <Input value={query} onChange={e => setQuery(e.target.value)}
                       placeholder="Family or invoice number" className="pl-9" />
              </label>
            </div>
            <div role="tablist" aria-label="Show invoices" className="-mx-1 flex gap-0.5 overflow-x-auto border-b border-line px-1 py-1.5">
              {FILTERS.map(f => (
                <button key={f.key} role="tab" aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn('flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 text-[0.875rem]',
                    filter === f.key ? 'bg-ink font-semibold text-ink-invert' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}>
                  {f.label}
                  {invoices.data && <span className={cn('tnum text-[0.75rem]',
                    filter === f.key ? 'opacity-75' : 'text-ink-3')}>{counts[f.key]}</span>}
                </button>
              ))}
            </div>

            {invoices.isLoading && <div className="space-y-3 pt-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>}
            {invoices.error && <div className="pt-4"><ErrorState error={invoices.error} onRetry={() => invoices.refetch()} /></div>}
            {invoices.data && shown.length === 0 && (
              filter === 'attention' && !query
                ? <EmptyState title="Nothing needs chasing"
                    body="No failed payments, nothing overdue and no drafts waiting to go out." />
                : <EmptyState title="No invoices here"
                    body={query ? 'Nothing matches that search.' : 'Invoices you raise will appear here.'}
                    action={!query && <Button size="sm" onClick={() => setCreating(true)}>
                      <Plus className="size-4" aria-hidden /> New invoice</Button>} />
            )}

            {/* Desktop: an aligned ledger, because the office compares rows. */}
            {shown.length > 0 && (
              <table className="hidden w-full text-[0.9062rem] md:table">
                <thead className="border-b border-line text-left">
                  <tr>
                    <th scope="col" className="label py-2.5 pr-3 font-semibold">Invoice</th>
                    <th scope="col" className="label px-3 py-2.5 font-semibold">Family</th>
                    <th scope="col" className="label px-3 py-2.5 font-semibold">Due</th>
                    <th scope="col" className="label px-3 py-2.5 font-semibold">Status</th>
                    <th scope="col" className="label py-2.5 pl-3 text-right font-semibold">{filter === 'paid' ? 'Total' : 'Outstanding'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map(i => (
                    <tr key={i.id} onClick={() => select(i.id)}
                        className={cn('cursor-pointer hover:bg-surface-2/60', selected === i.id && 'bg-accent-soft/60 hover:bg-accent-soft/60')}>
                      <td className="py-2.5 pr-3 align-top">
                        {/* The row is clickable for the mouse; this button is
                            the keyboard and screen-reader route to it. */}
                        <button className="tnum font-semibold hover:underline" onClick={e => { e.stopPropagation(); select(i.id); }}
                          aria-current={selected === i.id || undefined}>
                          {i.number}
                        </button>
                        <span className="block max-w-[240px] truncate text-[0.8125rem] text-ink-3">{i.lines}</span>
                      </td>
                      <td className="px-3 py-2.5 align-top">{i.family_name}
                        {i.billed_to && <span className="block text-[0.8125rem] text-ink-3">To {i.billed_to}</span>}</td>
                      <td className="tnum whitespace-nowrap px-3 py-2.5 align-top text-ink-2">{dateShort(i.due_on)}</td>
                      <td className="px-3 py-2.5 align-top"><InvoiceStatus i={i} /></td>
                      <td className="tnum py-2.5 pl-3 text-right align-top font-semibold">
                        {isOpen(i.status) ? money(outstanding(i)) : <span className="font-normal text-ink-3">{money(i.total_minor)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Phone: one row per invoice, the amount where a thumb expects it. */}
            <ul className="divide-y divide-line md:hidden">
              {shown.map(i => (
                <li key={i.id}>
                  <button onClick={() => select(i.id)} aria-current={selected === i.id || undefined}
                    className={cn('grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-3 text-left', selected === i.id && 'bg-accent-soft/60')}>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{i.family_name}{i.billed_to && <span className="font-normal text-ink-3"> · to {i.billed_to}</span>}</span>
                      <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">
                        <span className="tnum">{i.number}</span> · due {dateShort(i.due_on)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className={cn('tnum block font-semibold', !isOpen(i.status) && 'font-normal text-ink-3')}>
                        {money(isOpen(i.status) ? outstanding(i) : i.total_minor)}
                      </span>
                      <span className="block text-[0.8125rem]"><InvoiceStatus i={i} /></span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {selected && <InvoicePanel id={selected} onClose={() => select(null)} />}
        </div>

        <AbsenceCredits />
      </div>

      {running && <BillingRunPanel onClose={() => setRunning(false)} />}
      {reminding && <PaymentRemindersSheet onClose={() => setReminding(false)} />}
      {creating && <NewInvoiceSheet onClose={() => setCreating(false)}
                                    onCreated={id => { setCreating(false); select(id); }} />}
    </Shell>
  );
}

/** Invoices and payments as spreadsheets, for the accountant (R-012). */
function ExportButton({ location }: { location: string | null }) {
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const go = async (what: 'invoices' | 'payments' | 'xero' | 'aged-debt') => {
    setOpen(false);
    const sql = { invoices: B.INVOICES_EXPORT, payments: B.PAYMENTS_EXPORT, xero: B.XERO_EXPORT, 'aged-debt': B.AGED_DEBT_EXPORT }[what];
    const rows = await readAs<Record<string, string>>(session, sql, what === 'aged-debt' ? [location] : []);
    downloadCsv(`${what === 'xero' ? 'xero-sales-invoices' : what}-${isoDate(new Date())}.csv`, rows);
  };
  return (
    <div className="relative">
      <Button size="sm" aria-label="Export" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
        <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">Export</span>
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-lg">
          <button role="menuitem" className="block w-full px-3 py-2.5 text-left text-sm hover:bg-surface-2" onClick={() => go('invoices')}>Invoices (CSV)</button>
          <button role="menuitem" className="block w-full px-3 py-2.5 text-left text-sm hover:bg-surface-2" onClick={() => go('payments')}>Payments (CSV)</button>
          <button role="menuitem" className="block w-full px-3 py-2.5 text-left text-sm hover:bg-surface-2" onClick={() => go('aged-debt')}>
            Aged debt (CSV){location && <span className="block text-[0.75rem] text-ink-3">{location} only</span>}
          </button>
          <button role="menuitem" className="block w-full border-t border-line px-3 py-2.5 text-left text-sm hover:bg-surface-2" onClick={() => go('xero')}>
            Xero sales invoices
            <span className="block text-[0.75rem] text-ink-3">Import in Xero: Sales › Import</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, note, tone, loading, onClick, action }: {
  label: string; value?: string | null | false; note?: string | null | false;
  tone?: 'caution' | 'critical'; loading?: boolean; onClick?: () => void; action?: string;
}) {
  return (
    <div className="min-w-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <dt className="label">{label}</dt>
      {loading ? <dd><Skeleton className="mt-2 h-8 w-28" /></dd> : (
        <dd className={cn('stat-number mt-1.5 text-[1.75rem] leading-none lg:text-[2rem]',
          tone === 'caution' && 'text-caution', tone === 'critical' && 'text-critical')}>{value}</dd>
      )}
      {note && <dd className="mt-1.5 text-[0.8125rem] text-ink-3">{note}</dd>}
      {onClick && action && (
        <dd><button type="button" onClick={onClick} aria-label={`${action}: show the invoices that need action`}
          className="-ml-1 mt-0.5 inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] px-1 text-[0.8125rem] font-semibold text-accent-text hover:underline [@media(pointer:coarse)]:min-h-11">
          {action}<ArrowRight className="size-3.5" aria-hidden /></button></dd>
      )}
    </div>
  );
}

/** Status as a word. Colour backs it up; it never carries it alone. */
function InvoiceStatus({ i }: { i: B.InvoiceRow }) {
  const s = invoiceState(i);
  if (i.failed) return <span className="inline-flex items-center gap-1 font-semibold text-critical"><AlertTriangle className="size-3.5" aria-hidden />{s.label}
    {!cardPaymentsEnabled() && <span className="font-normal text-ink-3">(demo)</span>}</span>;
  if (i.overdue) return <span className="font-semibold text-caution">{s.label}</span>;
  return <span className={cn(s.tone === 'positive' ? 'text-positive' : s.tone === 'caution' ? 'text-ink' : 'text-ink-3', 'font-medium')}>{s.label}</span>;
}

// ── Invoice detail ───────────────────────────────────────────────────────
function InvoicePanel({ id, onClose }: { id: string; onClose: () => void }) {
  const inv = useRow<B.InvoiceDetail>(['invoice', id], B.INVOICE, [id]);
  const items = useRows<B.ItemRow>(['invoice-items', id], B.INVOICE_ITEMS, [id]);
  const payments = useRows<B.PaymentRow>(['invoice-payments', id], B.INVOICE_PAYMENTS, [id]);
  const credits = useRows<B.CreditNoteRow>(['invoice-credit-notes', id], B.INVOICE_CREDIT_NOTES, [id]);
  const { session } = useSession();
  const qc = useQueryClient();
  const [sheet, setSheet] = React.useState<null | 'pay' | 'void' | 'remind' | 'credit' | { refund: B.PaymentRow }>(null);

  const issue = useMutation({
    mutationFn: () => runAs(session, q => q(B.ISSUE_INVOICE, [id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  const i = inv.data;
  const owed = i ? outstanding(i) : 0;
  const failed = payments.data?.some(p => p.failure_code && !p.succeeded_at);

  return (
    <DetailPanel open onClose={onClose}
      title={i ? `${i.number}` : 'Invoice'}
      subtitle={i ? (i.billed_to ? `${i.family_name} · to ${i.billed_to}` : i.family_name) : undefined}>
      {inv.isLoading && <Skeleton className="h-40" />}
      {inv.error && <ErrorState error={inv.error} />}
      {inv.data === undefined && !inv.isLoading && !inv.error && (
        <EmptyState title="Invoice not found" body="It may have been removed." />
      )}
      {i && (
        <>
          <div className="mb-5">
            <p className="text-[0.8125rem] text-ink-3">
              <span className={cn('font-semibold', i.overdue ? 'text-caution' : (STATUS[i.status] ?? STATUS.draft!).tone === 'positive' ? 'text-positive' : 'text-ink')}>
                {invoiceState(i).label}
              </span>
              {' · '}{i.issued_on ? `Issued ${dateShort(i.issued_on)}, ` : ''}due {dateShort(i.due_on)}
            </p>
            <p className="label mt-4">{isOpen(i.status) ? 'Still to pay' : 'Total'}</p>
            <p className="stat-number mt-1 text-[2.25rem] leading-none">
              {money(isOpen(i.status) ? owed : i.total_minor)}
            </p>
            {/* A credit note lowers the bill; it is not money received (U3). */}
            {(() => {
              const m = paidAndCredited(i);
              if (!isOpen(i.status) || (m.paid === 0 && m.credited === 0)) return null;
              return (
                <p className="tnum mt-1.5 text-[0.8125rem] text-ink-2">
                  {[money(m.total), m.credited > 0 && `credited ${money(m.credited)}`, m.paid > 0 && `${money(m.paid)} paid`,
                    `${money(m.toPay)} to pay`].filter(Boolean).join(' · ')}
                </p>
              );
            })()}
            {i.status === 'void' && i.void_reason && <p className="mt-1.5 text-[0.8125rem] text-ink-2">Voided: {i.void_reason}</p>}
          </div>

          {/* The next sensible action first, the rest beside it. */}
          <div className="mb-5 flex flex-wrap gap-2">
            {i.status === 'draft' && (
              <Button variant="primary" loading={issue.isPending} onClick={() => issue.mutate()}>
                <Send className="size-4" aria-hidden /> Issue to family
              </Button>
            )}
            {isOpen(i.status) && owed > 0 && (
              <Button variant="primary" onClick={() => setSheet('pay')}>
                <Banknote className="size-4" aria-hidden /> Record payment
              </Button>
            )}
            {isOpen(i.status) && owed > 0 && (
              <Button onClick={() => setSheet('remind')}>
                <Send className="size-4" aria-hidden /> {failed ? 'Ask for a new card' : 'Send reminder'}
              </Button>
            )}
            {i.status !== 'void' && i.status !== 'draft' && (
              <Button variant="ghost" onClick={() => setSheet('credit')}>
                <FileMinus className="size-4" aria-hidden /> Credit note
              </Button>
            )}
            {i.status !== 'void' && Number(i.paid_minor) === 0 && (
              <Button variant="ghost" onClick={() => setSheet('void')}>
                <Ban className="size-4" aria-hidden /> Void
              </Button>
            )}
          </div>
          {issue.error && <div className="mb-4"><ErrorState error={issue.error} /></div>}

          <DetailSection title="Lines">
            {items.isLoading && <Skeleton className="h-12" />}
            <ul className="divide-y divide-line border-y border-line">
              {items.data?.map(it => (
                <li key={it.id} className="flex items-start gap-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block">{it.description}</span>
                    <span className="block text-[0.75rem] text-ink-3">
                      {KIND_LABEL[it.kind] ?? it.kind}
                      {it.student_name ? ` · ${it.student_name}` : ''}
                      {Number(it.quantity) !== 1 ? ` · ${Number(it.quantity)} × ${money(it.unit_minor)}` : ''}
                      {it.discount_minor > 0 ? ` · ${money(it.discount_minor)} off` : ''}
                    </span>
                  </span>
                  <span className="tnum shrink-0">{money(it.total_minor)}</span>
                </li>
              ))}
              {Number(i.discount_minor) > 0 && (
                <li className="flex gap-3 py-2.5 text-sm text-ink-2">
                  <span className="flex-1">Invoice discount</span>
                  <span className="tnum">−{money(i.discount_minor)}</span>
                </li>
              )}
              <li className="flex gap-3 border-t-2 border-ink py-2.5 text-sm font-semibold">
                <span className="flex-1">Total</span><span className="tnum">{money(i.total_minor)}</span>
              </li>
            </ul>
            {i.note && <p className="mt-2 text-[0.8125rem] text-ink-2">{i.note}</p>}
          </DetailSection>

          <DetailSection title="Payments">
            {payments.data?.length === 0 && <p className="text-sm text-ink-3">Nothing received yet.</p>}
            <ul className="divide-y divide-line border-y border-line">
              {/* A credit note's own credit is shown as the credit note below. */}
              {payments.data?.filter(p => !p.credit_note_id).map(p => {
                const ok = !!p.succeeded_at;
                const refunded = Number(p.refunded_minor);
                const canRefund = ok && ['bank_transfer', 'cash'].includes(p.method)
                                  && refunded < Number(p.amount_minor);
                return (
                  <li key={p.id} className="flex items-start gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {METHOD_LABEL[p.method] ?? p.method}
                        {!ok && p.failure_code && <span className="text-[0.8125rem] font-semibold text-critical">Failed · {p.failure_code.replace(/_/g, ' ')}{!cardPaymentsEnabled() && ' (demo: cards not connected)'}</span>}
                        {refunded > 0 && <span className="text-[0.8125rem] font-medium text-info">{money(refunded)} refunded</span>}
                      </span>
                      <span className="block text-[0.75rem] text-ink-3">
                        {dateShort(p.succeeded_at ?? p.created_at)}{p.note ? ` · ${p.note}` : ''}
                      </span>
                    </span>
                    <span className={cn('tnum shrink-0', !ok && 'text-ink-3 line-through')}>{money(p.amount_minor)}</span>
                    {canRefund && (
                      <Button size="sm" variant="ghost" aria-label={`Refund ${money(p.amount_minor)} payment`}
                              onClick={() => setSheet({ refund: p })}>
                        <Undo2 className="size-4" aria-hidden />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            {!!credits.data?.length && (
              <ul className="mt-3 divide-y divide-line border-y border-line" aria-label="Credit notes">
                {credits.data.map(c => (
                  <li key={c.id} className="flex items-start gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block">Credit note <span className="tnum">{c.number}</span></span>
                      <span className="block text-[0.75rem] text-ink-3">
                        {dateShort(c.created_at)} · {c.reason} · {creditNoteWhere(c)}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-positive">−{money(c.amount_minor)}</span>
                  </li>
                ))}
              </ul>
            )}
            {payments.data?.some(p => p.method === 'card' && p.succeeded_at) && (
              <p className="mt-2 text-[0.7812rem] text-ink-3">
                Card payments are refunded from the payment provider; the refund appears here once it confirms.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Family account">
            <FamilyAccount familyId={i.family_id} />
          </DetailSection>
        </>
      )}

      {i && sheet === 'pay' && <RecordPaymentSheet invoice={i} onClose={() => setSheet(null)} />}
      {i && sheet === 'void' && <VoidSheet invoice={i} onClose={() => setSheet(null)} />}
      {i && sheet === 'remind' && <ReminderSheet invoice={i} failed={!!failed} onClose={() => setSheet(null)} />}
      {i && sheet === 'credit' && <CreditNoteSheet invoice={i} credited={(credits.data ?? []).reduce((n, c) => n + Number(c.amount_minor), 0)}
                                                     cashPaid={(payments.data ?? []).filter(p => p.succeeded_at && ['bank_transfer', 'cash'].includes(p.method))
                                                       .reduce((n, p) => n + Number(p.amount_minor) - Number(p.refunded_minor), 0)}
                                                     onClose={() => setSheet(null)} />}
      {i && sheet && typeof sheet === 'object' && <RefundSheet payment={sheet.refund} invoice={i} onClose={() => setSheet(null)} />}
    </DetailPanel>
  );
}

/** The office's save model (U5): the panel behind shows the new figures
 *  before the sheet closes, then a one-line "Saved" status says what happened. */
function useLedgerMutation<T>(fn: (v: T) => (q: any) => Promise<unknown>, onDone: () => void, saved?: () => string) {
  const { session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: T) => { const r = await runAs(session, fn(v)); await refreshAfterWrite(qc); return r; },
    onSuccess: () => { const m = saved?.(); if (m) announceSaved(m); onDone(); },
  });
}

function RecordPaymentSheet({ invoice, onClose }: { invoice: B.InvoiceDetail; onClose: () => void }) {
  const owed = outstanding(invoice);
  const [amount, setAmount] = React.useState((owed / 100).toFixed(2));
  const [method, setMethod] = React.useState('bank_transfer');
  const [note, setNote] = React.useState('');
  const minor = toMinor(amount);
  const tooMuch = minor != null && minor > owed;
  const save = useLedgerMutation(() => (q: any) =>
    q(B.RECORD_PAYMENT, [invoice.family_id, minor, method, invoice.id, note || null]), onClose,
    () => `Recorded ${money(minor)} against ${invoice.number}`);

  return (
    <RecordSheet title="Record a payment" subtitle={`${invoice.number} · ${money(owed)} still to pay`}
      onClose={onClose} onSave={() => save.mutate(undefined)} saving={save.isPending} error={save.error}
      canSave={minor != null && minor > 0 && !tooMuch} saveLabel="Record payment">
      <Field label="Amount" htmlFor="pay-amt" required
        error={minor == null && amount ? 'Enter an amount like 45.00' : tooMuch ? `That is more than the ${money(owed)} owed. Take the extra as a credit from the family record.` : undefined}>
        <Input id="pay-amt" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
               aria-invalid={minor == null || tooMuch} className="tnum" />
      </Field>
      <Field label="How it was paid" htmlFor="pay-m">
        <Select id="pay-m" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
        </Select>
      </Field>
      <Field label="Note" htmlFor="pay-n" hint="A bank reference helps at reconciliation.">
        <Input id="pay-n" value={note} onChange={e => setNote(e.target.value)} maxLength={200} />
      </Field>
    </RecordSheet>
  );
}

function VoidSheet({ invoice, onClose }: { invoice: B.InvoiceDetail; onClose: () => void }) {
  const [reason, setReason] = React.useState('');
  const save = useLedgerMutation(() => (q: any) => q(B.VOID_INVOICE, [invoice.id, reason]), onClose, () => `${invoice.number} is void`);
  return (
    <RecordSheet title={`Void ${invoice.number}?`}
      subtitle="The family stops owing it. The invoice stays on record, marked void, and the reason is logged."
      onClose={onClose} onSave={() => save.mutate(undefined)} saving={save.isPending} error={save.error}
      canSave={reason.trim().length >= 3} saveLabel="Void invoice">
      <Field label="Why" htmlFor="void-r" required>
        <Input id="void-r" value={reason} onChange={e => setReason(e.target.value)}
               placeholder="Raised twice, wrong family…" maxLength={200} />
      </Field>
    </RecordSheet>
  );
}

/** How a credit note was settled, in words. */
function creditNoteWhere(c: B.CreditNoteRow) {
  const parts = [
    Number(c.applied_minor) > 0 && `${money(c.applied_minor)} off what was owed`,
    Number(c.refunded_minor) > 0 && `${money(c.refunded_minor)} refunded`,
    Number(c.account_minor) > 0 && `${money(c.account_minor)} held as credit`,
  ].filter(Boolean);
  return parts.join(', ');
}

/**
 * Handing money back. Usually the family was charged less (a lesson cancelled):
 * that is a credit note, and the invoice stays settled (UR-10, admins D6).
 * Reversing a payment recorded by mistake reopens the invoice instead.
 */
function RefundSheet({ payment, invoice, onClose }: { payment: B.PaymentRow; invoice: B.InvoiceDetail; onClose: () => void }) {
  const left = Number(payment.amount_minor) - Number(payment.refunded_minor);
  const [amount, setAmount] = React.useState((left / 100).toFixed(2));
  const [reason, setReason] = React.useState('');
  const [mode, setMode] = React.useState<'credit_note' | 'mistake'>('credit_note');
  const minor = toMinor(amount);
  const save = useLedgerMutation(() => (q: any) => q(B.REFUND_PAYMENT, [payment.id, minor, reason, mode]), onClose,
    () => `Refund of ${money(minor)} recorded on ${invoice.number}`);
  return (
    <RecordSheet title="Refund"
      subtitle={`${METHOD_LABEL[payment.method]} of ${money(payment.amount_minor)} on ${invoice.number}. Hand the money back first — this records that you have.`}
      onClose={onClose} onSave={() => save.mutate(undefined)} saving={save.isPending} error={save.error}
      canSave={minor != null && minor > 0 && minor <= left && reason.trim().length >= 3} saveLabel="Record refund">
      <fieldset className="space-y-2">
        <legend className="mb-1 text-[0.8125rem] font-medium text-ink-2">What is this refund for?</legend>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="radio" name="ref-mode" className="mt-0.5 size-5 accent-[var(--color-accent)]"
                 checked={mode === 'credit_note'} onChange={() => setMode('credit_note')} />
          <span><span className="block font-medium">They were charged too much</span>
            <span className="block text-[0.8125rem] text-ink-3">A class cancelled, a fee waived. Issues a credit note; {invoice.number} stays settled.</span></span>
        </label>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="radio" name="ref-mode" className="mt-0.5 size-5 accent-[var(--color-accent)]"
                 checked={mode === 'mistake'} onChange={() => setMode('mistake')} />
          <span><span className="block font-medium">The payment was recorded by mistake</span>
            <span className="block text-[0.8125rem] text-ink-3">The payment is reversed and {invoice.number} is owed again.</span></span>
        </label>
      </fieldset>
      <Field label="Amount" htmlFor="ref-a" required
             error={minor != null && minor > left ? `At most ${money(left)}` : undefined}>
        <Input id="ref-a" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className="tnum" />
      </Field>
      <Field label="Why" htmlFor="ref-r" required>
        <Input id="ref-r" value={reason} onChange={e => setReason(e.target.value)} maxLength={200}
               placeholder="Class cancelled 1 Dec – teacher unwell" />
      </Field>
    </RecordSheet>
  );
}

/** A credit note: lowers what an invoice charges, with a reason. */
function CreditNoteSheet({ invoice, credited, cashPaid, onClose }: {
  invoice: B.InvoiceDetail; credited: number; cashPaid: number; onClose: () => void;
}) {
  const max = Number(invoice.total_minor) - credited;
  const owed = Math.max(Number(invoice.total_minor) - Number(invoice.paid_minor), 0);
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [settle, setSettle] = React.useState<'account' | 'refund'>('account');
  const minor = toMinor(amount);
  const save = useLedgerMutation(() => (q: any) => q(B.ISSUE_CREDIT_NOTE, [invoice.id, minor, reason.trim(), settle]), onClose,
    () => `Credit note issued: ${money(minor)} off ${invoice.number}`);
  const tooMuch = minor != null && minor > max;
  const noCash = settle === 'refund' && minor != null && minor > cashPaid;
  return (
    <RecordSheet title="Credit note" subtitle={`${invoice.number} · ${invoice.family_name}. Up to ${money(max)} can be credited.`}
      onClose={onClose} onSave={() => save.mutate(undefined)} saving={save.isPending} error={save.error}
      canSave={minor != null && minor > 0 && !tooMuch && !noCash && reason.trim().length >= 3} saveLabel="Issue credit note">
      <Field label="Amount" htmlFor="cn-a" required
             error={tooMuch ? `At most ${money(max)}` : noCash ? `Only ${money(cashPaid)} was paid by transfer or cash. Card refunds are made with the payment provider.` : undefined}>
        <Input id="cn-a" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="tnum" />
      </Field>
      <Field label="Why" htmlFor="cn-r" required>
        <Input id="cn-r" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} placeholder="Class cancelled 1 Dec" />
      </Field>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-[0.8125rem] font-medium text-ink-2">Where the money goes</legend>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="radio" name="cn-s" className="mt-0.5 size-5 accent-[var(--color-accent)]"
                 checked={settle === 'account'} onChange={() => setSettle('account')} />
          <span><span className="block font-medium">Keep it as credit</span>
            <span className="block text-[0.8125rem] text-ink-3">
              {owed > 0 ? `Comes off the ${money(owed)} still owed on this invoice; anything over goes off their next invoice.`
                        : 'Held on their account and taken off their next invoice.'}
            </span></span>
        </label>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="radio" name="cn-s" className="mt-0.5 size-5 accent-[var(--color-accent)]"
                 checked={settle === 'refund'} onChange={() => setSettle('refund')} />
          <span><span className="block font-medium">Give the money back</span>
            <span className="block text-[0.8125rem] text-ink-3">Hand it back first, by transfer or cash. It is recorded as a refund.</span></span>
        </label>
      </fieldset>
    </RecordSheet>
  );
}

/** A reminder is a message in the family's history, drafted from the studio's
 *  own template and editable before it goes. */
function ReminderSheet({ invoice, failed, onClose }: {
  invoice: B.InvoiceDetail; failed: boolean; onClose: () => void;
}) {
  const tpl = useRow<{ subject: string; body: string }>(['tpl-reminder'], B.REMINDER_TEMPLATE);
  const guardian = useRow<{ first_name: string }>(['primary-guardian', invoice.family_id],
    B.PRIMARY_GUARDIAN, [invoice.family_id]);
  const [subject, setSubject] = React.useState<string | null>(null);
  const [body, setBody] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  // Messages land in the app: say so when nobody in the family uses it (U3).
  const reach = useRow<{ uses_app: boolean }>(['family-uses-app', invoice.family_id],
    `select exists (select 1 from guardian g where g.family_id = $1 and g.user_id is not null and g.deleted_at is null) as uses_app`,
    [invoice.family_id]);
  const offApp = reach.data?.uses_app === false;

  const fill = React.useCallback((s: string) => s
    .replaceAll('{{guardian_name}}', guardian.data?.first_name ?? 'there')
    .replaceAll('{{invoice_number}}', invoice.number)
    .replaceAll('{{amount}}', money(outstanding(invoice)))
    .replaceAll('{{due_date}}', dateShort(invoice.due_on)), [guardian.data, invoice]);

  React.useEffect(() => {
    if (!tpl.data || !guardian.data || subject !== null) return;
    setSubject(fill(tpl.data.subject));
    let b = fill(tpl.data.body);
    if (failed) b = b.replace('If something has gone wrong with the payment',
      'Your card was declined when we tried to take this payment. If something has changed with your card');
    setBody(b);
  }, [tpl.data, guardian.data, fill, failed, subject]);

  const send = useLedgerMutation(() => (q: any) =>
    q(B.SEND_DIRECT, [invoice.family_id, subject, body]), () => setSent(true));

  if (sent) {
    return (
      <RecordSheet title={offApp ? 'Reminder kept, not seen yet' : 'Reminder sent'} onClose={onClose} onSave={onClose} saveLabel="Done">
        <p className="text-sm text-ink-2">{offApp
          ? `Nobody in ${invoice.family_name} uses the app yet, so they can’t be reached until email is connected. The reminder is kept in their communication history; contact them another way for now.`
          : `It is in ${invoice.family_name}’s messages in the app and their communication history.`}</p>
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title={failed ? 'Ask for a new card' : 'Send a reminder'}
      subtitle={offApp ? `To ${invoice.family_name}, in the app. Nobody there uses it yet, so they won’t see it until email is connected.` : `To ${invoice.family_name}, in the app`}
      onClose={onClose} onSave={() => send.mutate(undefined)} saving={send.isPending} error={send.error}
      canSave={!!subject?.trim() && (body?.trim().length ?? 0) > 10} saveLabel="Send">
      {body === null ? <Skeleton className="h-40" /> : (
        <>
          <Field label="Subject" htmlFor="rem-s">
            <Input id="rem-s" value={subject ?? ''} onChange={e => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" htmlFor="rem-b">
            <textarea id="rem-b" value={body} onChange={e => setBody(e.target.value)} rows={8}
              className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
          </Field>
        </>
      )}
    </RecordSheet>
  );
}

// ── New invoice ──────────────────────────────────────────────────────────
type Line = { key: number; kind: string; description: string; amount: string;
              student_id: string | null; class_id: string | null };

function NewInvoiceSheet({ onClose, onCreated, familyId }: {
  onClose: () => void; onCreated: (id: string) => void; familyId?: string;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const families = useRows<B.FamilyOption>(['family-options'], B.FAMILY_OPTIONS);
  // Two families of one name also show their children (U8).
  const dupes = React.useMemo(() => { const seen = new Set<string>(), twice = new Set<string>();
    for (const f of families.data ?? []) { const k = f.name.trim().toLowerCase(); if (seen.has(k)) twice.add(k); seen.add(k); }
    return twice; }, [families.data]);
  const [family, setFamily] = React.useState(familyId ?? '');
  const billable = useRows<B.BillableRow>(['billable', family], B.FAMILY_BILLABLE, [family],
    { enabled: !!family });
  const nextKey = React.useRef(1);
  const blank = (): Line => ({ key: nextKey.current++, kind: 'tuition', description: '', amount: '',
                               student_id: null, class_id: null });
  const [lines, setLines] = React.useState<Line[]>(() => [blank()]);
  const [due, setDue] = React.useState(() => isoDate(new Date(Date.now() + 14 * 86_400_000)));
  const [discount, setDiscount] = React.useState('');
  const [note, setNote] = React.useState('');

  const parsed = lines.map(l => ({ ...l, minor: toMinor(l.amount) }));
  const filled = parsed.filter(l => l.description.trim() || l.amount);
  const discountMinor = discount ? toMinor(discount) : 0;
  const subtotal = filled.reduce((n, l) => n + (l.minor ?? 0), 0);
  const total = Math.max(subtotal - (discountMinor ?? 0), 0);
  const valid = !!family && filled.length > 0 && discountMinor != null
    && filled.every(l => l.description.trim() && l.minor != null && l.minor > 0)
    && (discountMinor ?? 0) <= subtotal && !!due;

  const update = (key: number, patch: Partial<Line>) =>
    setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));

  /** One tap to bill a family's enrolled classes for the term. */
  const addTermFees = () => {
    const termLines = (billable.data ?? []).filter(b => b.pricing === 'term').map(b => ({
      key: nextKey.current++, kind: 'tuition', description: `${b.class_name} — ${b.student_name}, term fee`,
      amount: (b.price_minor / 100).toFixed(2), student_id: b.student_id, class_id: b.class_id }));
    setLines(ls => [...ls.filter(l => l.description.trim() || l.amount), ...termLines]);
  };

  const save = useMutation({
    mutationFn: async (issue: boolean) => {
      const items = filled.map(l => ({ kind: l.kind, description: l.description.trim(), unit_minor: l.minor,
        quantity: 1, student_id: l.student_id, class_id: l.class_id }));
      const rows = await runAs(session, q => q<{ id: string }>(B.CREATE_INVOICE,
        [family, JSON.stringify(items), due, note || null, discountMinor ?? 0, issue]));
      return rows[0]!.id;
    },
    onSuccess: id => { qc.invalidateQueries({ queryKey: ['db'] }); onCreated(id); },
  });

  const fam = families.data?.find(f => f.id === family);
  const termCount = billable.data?.filter(b => b.pricing === 'term').length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ni-t" onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="border-b border-line p-4">
          <h2 id="ni-t" className="font-display text-[1.25rem] font-[800] leading-tight [font-stretch:112%]">New invoice</h2>
          <p className="text-[0.8125rem] text-ink-2">Lines are itemised for the family exactly as you write them.</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          <Field label="Family" htmlFor="ni-f" required>
            <Select id="ni-f" value={family} onChange={e => setFamily(e.target.value)} autoFocus>
              <option value="">Choose a family…</option>
              {families.data?.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.guardian ? ` — ${f.guardian}` : ''}{dupes.has(f.name.trim().toLowerCase()) && f.children ? `; ${f.children}` : ''}{Number(f.balance_minor) > 0 ? ` (owes ${money(f.balance_minor)})` : ''}
                </option>
              ))}
            </Select>
          </Field>

          {family && termCount > 0 && (
            <button onClick={addTermFees}
              className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] border border-line-strong px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-2">
              <Wallet className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="flex-1">Add term fees for {termCount} enrolled class{termCount === 1 ? '' : 'es'}</span>
            </button>
          )}

          <fieldset>
            <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-2">Lines</legend>
            {lines.map((l, n) => {
              const minor = toMinor(l.amount);
              return (
                <div key={l.key} className="border-b border-line py-3 first:pt-0">
                  <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[140px_1fr_110px_auto]">
                    <Select aria-label={`Line ${n + 1} type`} value={l.kind}
                            onChange={e => update(l.key, { kind: e.target.value })}
                            className="col-span-2 sm:col-span-1">
                      {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                    <Input aria-label={`Line ${n + 1} description`} placeholder="Description"
                           value={l.description} onChange={e => update(l.key, { description: e.target.value })}
                           className="col-span-2 sm:col-span-1" maxLength={200} />
                    <Input aria-label={`Line ${n + 1} amount in pounds`} placeholder="0.00" inputMode="decimal"
                           value={l.amount} onChange={e => update(l.key, { amount: e.target.value })}
                           aria-invalid={!!l.amount && minor == null} className="tnum" />
                    <Button variant="ghost" aria-label={`Remove line ${n + 1}`} disabled={lines.length === 1}
                            onClick={() => setLines(ls => ls.filter(x => x.key !== l.key))}>
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                  {!!l.amount && minor == null && <p role="alert" className="mt-1 text-[0.7812rem] text-critical">Enter an amount like 45.00</p>}
                </div>
              );
            })}
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => setLines(ls => [...ls, blank()])}>
              <Plus className="size-4" aria-hidden /> Add a line
            </Button>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Due" htmlFor="ni-d" required>
              <Input id="ni-d" type="date" value={due} onChange={e => setDue(e.target.value)} />
            </Field>
            <Field label="Discount (£)" htmlFor="ni-x"
                   error={discountMinor == null ? 'Enter an amount like 10.00'
                     : discountMinor > subtotal ? 'More than the invoice' : undefined}>
              <Input id="ni-x" inputMode="decimal" placeholder="0.00" value={discount}
                     onChange={e => setDiscount(e.target.value)} className="tnum" />
            </Field>
          </div>
          <Field label="Note to family" htmlFor="ni-n">
            <Input id="ni-n" value={note} onChange={e => setNote(e.target.value)} maxLength={300}
                   placeholder="Sibling discount applied" />
          </Field>
          {save.error && <ErrorState error={save.error} />}
        </div>

        <div className="border-t border-line p-4 pb-safe">
          <div className="mb-3 flex items-baseline justify-between text-sm">
            <span className="text-ink-2">{fam ? fam.name : 'Total'}</span>
            <span className="stat-number text-[1.5rem]">{money(total)}</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={!valid} loading={save.isPending && save.variables === false}
                    onClick={() => save.mutate(false)}>Save draft</Button>
            <Button className="flex-1" variant="primary" disabled={!valid}
                    loading={save.isPending && save.variables === true} onClick={() => save.mutate(true)}>
              Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
