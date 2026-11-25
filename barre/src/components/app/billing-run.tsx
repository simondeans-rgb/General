'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, HeartHandshake, Percent, Plus, Send, Trash2, X } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { money, dateShort, isoDate } from '@/lib/format';

const RULE_TEXT = {
  sibling: (n: number) => `${n === 2 ? 'Second' : n === 3 ? 'Third' : `${n}th`} child and after`,
  multi_class: (n: number) => `A child’s ${n === 2 ? 'second' : n === 3 ? 'third' : `${n}th`} class and after`,
};

/**
 * Term billing (R-010, R-011): preview every family's invoice for the term,
 * raise them all as drafts, check, then send them together. Discounts come
 * from the two rules above the preview, never from hand edits.
 */
export function BillingRunPanel({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const terms = useRows<{ id: string; name: string; starts_on: string; ends_on: string }>(['billing-terms'], B.BILLING_TERMS);
  const [termId, setTermId] = React.useState('');
  const term = termId || terms.data?.[0]?.id || '';
  const t = terms.data?.find(x => x.id === term);
  const months = React.useMemo(() => monthsOf(t?.starts_on, t?.ends_on), [t?.starts_on, t?.ends_on]);
  // '' is the whole term (term- and course-priced classes); a month bills monthly classes.
  const [period, setPeriod] = React.useState('');
  const month = months.includes(period) ? period : '';
  const lines = useRows<B.BillingLine>(['billing-lines', term, month], B.BILLING_LINES, [term, month || null], { enabled: !!term });
  const runs = useRows<B.BillingRun>(['billing-runs'], B.BILLING_RUNS);
  const rules = useRows<B.DiscountRule>(['discount-rules'], B.DISCOUNT_RULES);
  const [due, setDue] = React.useState(() => isoDate(new Date(Date.now() + 14 * 86400_000)));
  const [done, setDone] = React.useState<string | null>(null);

  const families = React.useMemo(() => {
    const m = new Map<string, { name: string; lines: B.BillingLine[]; gross: number; discount: number }>();
    for (const l of lines.data ?? []) {
      const f = m.get(l.family_id) ?? { name: l.family_name, lines: [], gross: 0, discount: 0 };
      f.lines.push(l);
      f.gross += Math.round(Number(l.quantity) * l.unit_minor);
      f.discount += l.discount_minor;
      m.set(l.family_id, f);
    }
    return [...m.values()];
  }, [lines.data]);
  const total = families.reduce((n, f) => n + f.gross - f.discount, 0);
  const discounts = families.reduce((n, f) => n + f.discount, 0);
  const draft = runs.data?.find(r => r.status === 'draft');
  const periodName = month ? monthName(month) : t?.name ?? 'this term';

  const act = useMutation({
    mutationFn: (v: { sql: string; params: unknown[]; msg: string }) => runAs(session, q => q(v.sql, v.params)).then(() => v.msg),
    onSuccess: msg => { setDone(msg); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const setRule = useMutation({
    mutationFn: (r: B.DiscountRule) => runAs(session, q => q(B.SET_DISCOUNT_RULE, [r.id, r.enabled, r.percent, r.from_nth])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="run-t" onClick={e => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface-2 p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="run-t" className="text-lg font-semibold tracking-tight">Billing runs</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-3">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {done && (
          <p role="status" className="mb-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]">
            <CheckCircle2 className="size-4 text-positive" aria-hidden /> {done}
          </p>
        )}
        {act.error != null && <div className="mb-3"><ErrorState error={act.error} /></div>}

        <div className="space-y-4">
          {draft && (
            <Card className="border-caution/40">
              <CardHeader title={`Drafts waiting: ${draft.period_month ? monthName(draft.period_month) : draft.term_name}`}
                subtitle={`${draft.invoice_count} invoices, ${money(draft.total_minor)} in all, due ${dateShort(draft.due_on)}. Check them in the Drafts tab, then send.`} />
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <Button variant="primary" loading={act.isPending}
                  onClick={() => act.mutate({ sql: B.ISSUE_BILLING_RUN, params: [draft.id], msg: `${draft.invoice_count} invoices sent to families.` })}>
                  <Send className="size-4" aria-hidden /> Send all {draft.invoice_count}
                </Button>
                <Button variant="ghost" loading={act.isPending}
                  onClick={() => act.mutate({ sql: B.DISCARD_BILLING_RUN, params: [draft.id], msg: 'Drafts discarded. Nothing was sent.' })}>
                  <Trash2 className="size-4" aria-hidden /> Discard drafts
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Discounts" subtitle="Applied automatically. Where both apply, the larger one is used." />
            <ul className="divide-y divide-line">
              {rules.data?.map(r => <RuleRow key={r.id} r={r} onChange={x => setRule.mutate(x)} />)}
            </ul>
            {setRule.error != null && <div className="p-3"><ErrorState error={setRule.error} /></div>}
          </Card>

          <FamilyDiscounts />

          <Card>
            <CardHeader title="Preview" subtitle={month
              ? 'Monthly classes for this month only. Children already invoiced for the month are left out.'
              : 'Term and course fees. Monthly classes are billed month by month instead.'} />
            <div className="grid grid-cols-2 gap-3 px-4 pb-3 sm:grid-cols-3">
              <Field label="Term" htmlFor="run-term">
                <Select id="run-term" value={term} onChange={e => setTermId(e.target.value)}>
                  {terms.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </Field>
              <Field label="Period" htmlFor="run-period">
                <Select id="run-period" value={month} onChange={e => setPeriod(e.target.value)}>
                  <option value="">Whole term</option>
                  {months.map(m => <option key={m} value={m}>{monthName(m)} (monthly classes)</option>)}
                </Select>
              </Field>
              <Field label="Due on" htmlFor="run-due">
                <Input id="run-due" type="date" value={due} onChange={e => setDue(e.target.value)} />
              </Field>
            </div>
            {lines.isLoading && <div className="p-4"><Skeleton className="h-24" /></div>}
            {lines.error && <div className="p-4"><ErrorState error={lines.error} /></div>}
            {lines.data?.length === 0 && (
              <EmptyState title="Everyone is invoiced" body={`Every child has an invoice for ${periodName}, or no class is billed this way.`} />
            )}
            {families.length > 0 && (
              <>
                <p className="border-y border-line bg-surface-2 px-4 py-2 text-[13px] text-ink-2">
                  {families.length} families · <span className="tnum font-medium text-ink">{money(total)}</span>
                  {discounts > 0 && <> after <span className="tnum">{money(discounts)}</span> of discounts</>}
                </p>
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {families.map(f => (
                    <li key={f.name} className="px-4 py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{f.name}</span>
                        <span className="tnum font-medium">{money(f.gross - f.discount)}</span>
                      </div>
                      <ul className="mt-0.5 space-y-0.5 text-[12.5px] text-ink-2">
                        {f.lines.map(l => (
                          <li key={l.student_id + l.class_id} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">{l.student_name.split(' ')[0]} · {l.description}</span>
                            <span className="tnum shrink-0">
                              {l.discount_minor > 0 && <Badge tone="positive">{l.discount_reason}</Badge>}{' '}
                              {money(Math.round(Number(l.quantity) * l.unit_minor) - l.discount_minor)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="p-4">
                  <Button variant="primary" className="w-full" disabled={!!draft} loading={act.isPending}
                    onClick={() => act.mutate({ sql: B.CREATE_BILLING_RUN, params: [term, due, month || null],
                      msg: `${families.length} draft invoices raised for ${periodName}. Nothing has been sent yet.` })}>
                    Raise {families.length} draft invoices
                  </Button>
                  {draft && <p className="mt-2 text-center text-[12.5px] text-ink-3">Send or discard the drafts above first.</p>}
                </div>
              </>
            )}
          </Card>

          {runs.data && runs.data.some(r => r.status === 'issued') && (
            <Card>
              <CardHeader title="Earlier runs" />
              <ul className="divide-y divide-line text-sm">
                {runs.data.filter(r => r.status === 'issued').map(r => (
                  <li key={r.id} className="flex justify-between px-4 py-2.5">
                    <span>{r.period_month ? monthName(r.period_month) : r.term_name} · sent {dateShort(r.issued_at!)}</span>
                    <span className="tnum">{r.invoice_count} · {money(r.total_minor)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function RuleRow({ r, onChange }: { r: B.DiscountRule; onChange: (r: B.DiscountRule) => void }) {
  const [pct, setPct] = React.useState(String(r.percent));
  const [nth, setNth] = React.useState(String(r.from_nth));
  React.useEffect(() => { setPct(String(r.percent)); setNth(String(r.from_nth)); }, [r.percent, r.from_nth]);
  const commit = () => {
    const p = Math.min(100, Math.max(1, Number(pct) || r.percent));
    const n = Math.min(10, Math.max(2, Number(nth) || r.from_nth));
    if (p !== r.percent || n !== r.from_nth) onChange({ ...r, percent: p, from_nth: n });
  };
  const label = r.kind === 'sibling' ? 'Sibling discount' : 'Multi-class discount';
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
        <input type="checkbox" checked={r.enabled} className="size-4 accent-[var(--accent)]"
               onChange={e => onChange({ ...r, enabled: e.target.checked })} />
        <span>
          <span className="block font-medium">{label}</span>
          <span className="block text-[12.5px] text-ink-2">{RULE_TEXT[r.kind](r.from_nth)}</span>
        </span>
      </label>
      <span className="flex items-center gap-1.5 text-sm">
        from no.
        <Input aria-label={`${label}: from which one`} className="w-14" type="number" min={2} max={10}
               value={nth} onChange={e => setNth(e.target.value)} onBlur={commit} />
        <Input aria-label={`${label}: percent`} className="w-16" type="number" min={1} max={100}
               value={pct} onChange={e => setPct(e.target.value)} onBlur={commit} />
        <Percent className="size-3.5 text-ink-3" aria-hidden />
      </span>
    </li>
  );
}

/** First day of each month a term touches, as yyyy-mm-01. */
const day = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v)).slice(0, 10);
function monthsOf(from?: unknown, to?: unknown): string[] {
  if (!from || !to) return [];
  const out: string[] = [];
  const end = day(to);
  const d = new Date(day(from).slice(0, 7) + '-01T12:00:00Z');
  while (d.toISOString().slice(0, 10) <= end) { out.push(d.toISOString().slice(0, 10)); d.setUTCMonth(d.getUTCMonth() + 1); }
  return out;
}
const monthName = (m: unknown) => new Date(day(m) + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const REASONS = { bursary: 'Bursary', staff: 'Staff family', loyalty: 'Loyalty', other: 'Other' } as const;

/**
 * Per-family discounts (R-056): a percentage after the school rules, or a
 * fixed amount off each invoice. Families see "Discount", never the reason.
 */
function FamilyDiscounts() {
  const { session } = useSession();
  const qc = useQueryClient();
  const rows = useRows<B.FamilyDiscount>(['family-discounts'], B.FAMILY_DISCOUNTS);
  const fams = useRows<{ id: string; name: string }>(['family-pick'], B.FAMILY_PICK);
  const [adding, setAdding] = React.useState(false);
  const [f, setF] = React.useState({ family: '', kind: 'percent', amount: '', reason: 'bursary', note: '', ends: '' });
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(B.ADD_FAMILY_DISCOUNT, [f.family, f.kind,
      f.kind === 'percent' ? Math.round(Number(f.amount)) : Math.round(Number(f.amount) * 100), f.reason, f.note, null, f.ends || null])),
    onSuccess: () => { setAdding(false); setF(x => ({ ...x, family: '', amount: '', note: '', ends: '' })); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const end = useMutation({
    mutationFn: (id: string) => runAs(session, q => q(B.END_FAMILY_DISCOUNT, [id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const ok = f.family && Number(f.amount) > 0 && (f.kind !== 'percent' || Number(f.amount) <= 100);
  return (
    <Card>
      <CardHeader title="Family discounts" subtitle="Bursaries, staff rates and other agreements. Families only see the word “Discount”."
        action={!adding && <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden /> Add</Button>} />
      {rows.data?.length === 0 && !adding && <p className="px-4 pb-4 text-[13px] text-ink-3">None yet.</p>}
      {!!rows.data?.length && (
        <ul className="divide-y divide-line border-t border-line">
          {rows.data.map(d => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <HeartHandshake className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{d.family_name}</span>
                <span className="block text-[12.5px] text-ink-2">
                  {REASONS[d.reason]}{d.note ? ` · ${d.note}` : ''}{d.ends_on ? ` · until ${dateShort(d.ends_on)}` : ''}
                </span>
              </span>
              <span className="tnum font-medium">{d.kind === 'percent' ? `${d.amount}%` : `${money(d.amount)} off`}</span>
              <button className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-surface-2" aria-label={`End discount for ${d.family_name}`}
                onClick={() => end.mutate(d.id)}><Trash2 className="size-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      {adding && (
        <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
          <Field label="Family" htmlFor="fd-f" required>
            <Select id="fd-f" value={f.family} onChange={e => setF({ ...f, family: e.target.value })}>
              <option value="">Choose…</option>
              {fams.data?.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </Select>
          </Field>
          <Field label="Reason" htmlFor="fd-r">
            <Select id="fd-r" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })}>
              {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Type" htmlFor="fd-k">
            <Select id="fd-k" value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>
              <option value="percent">Percentage of each class</option>
              <option value="fixed">Fixed amount off each invoice</option>
            </Select>
          </Field>
          <Field label={f.kind === 'percent' ? 'Percent' : 'Amount (£)'} htmlFor="fd-a" required>
            <Input id="fd-a" type="number" min={1} max={f.kind === 'percent' ? 100 : undefined} step={f.kind === 'percent' ? 1 : 0.01}
                   value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
          </Field>
          <Field label="Note (office only)" htmlFor="fd-n"><Input id="fd-n" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></Field>
          <Field label="Ends on" htmlFor="fd-e" hint="Leave empty to keep going."><Input id="fd-e" type="date" value={f.ends} onChange={e => setF({ ...f, ends: e.target.value })} /></Field>
          {save.error != null && <div className="sm:col-span-2"><ErrorState error={save.error} /></div>}
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="primary" disabled={!ok} loading={save.isPending} onClick={() => save.mutate()}>Save discount</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
