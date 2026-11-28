'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Percent, Plus, Send, Trash2, X } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton } from '@/components/ui';
import * as B from '@/lib/repos/billing';
import { useLocationFilter } from '@/components/app/location-filter';
import { money, dateShort, isoDate } from '@/lib/format';
import { useWrite } from '@/lib/write';
import { pickerLabels } from '@/lib/office-words';

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
  // Families already billed for the period by an invoice that does not name
  // the class are skipped; the office may include one, with a reason (UR-10).
  const skipped = useRows<B.SkippedFamily>(['billing-skipped', term, month], B.BILLING_SKIPPED, [term, month || null], { enabled: !!term });
  const [include, setInclude] = React.useState<string[]>([]);
  const [reason, setReason] = React.useState('');
  React.useEffect(() => { setInclude([]); setReason(''); }, [term, month]);
  const lines = useRows<B.BillingLine>(['billing-lines', term, month, include], B.BILLING_LINES,
    [term, month || null, include.length ? include : null], { enabled: !!term });
  const runs = useRows<B.BillingRun>(['billing-runs'], B.BILLING_RUNS);
  const rules = useRows<B.DiscountRule>(['discount-rules'], B.DISCOUNT_RULES);
  const [due, setDue] = React.useState(() => isoDate(new Date(Date.now() + 14 * 86400_000)));
  const [done, setDone] = React.useState<string | null>(null);

  // The preview can be narrowed to one location (UR-33); the run still covers every location.
  const loc = useLocationFilter();
  const classLoc = useRows<{ id: string; location: string }>(['class-locations'], B.CLASS_LOCATIONS, [], { enabled: !!loc.control });
  const families = React.useMemo(() => {
    const where = new Map((classLoc.data ?? []).map(c => [c.id, c.location]));
    const m = new Map<string, { name: string; lines: B.BillingLine[]; gross: number; discount: number }>();
    for (const l of lines.data ?? []) {
      if (loc.current && where.get(l.class_id) !== loc.current) continue;
      const f = m.get(l.family_id) ?? { name: l.family_name, lines: [], gross: 0, discount: 0 };
      f.lines.push(l);
      f.gross += Math.round(Number(l.quantity) * l.unit_minor);
      f.discount += l.discount_minor;
      m.set(l.family_id, f);
    }
    return [...m.values()];
  }, [lines.data, loc.current, classLoc.data]);
  const runCount = React.useMemo(() => new Set((lines.data ?? []).map(l => l.family_id)).size, [lines.data]);
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
        onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface px-5 pb-safe pt-4 shadow-lg sm:rounded-[var(--radius-xl)] sm:px-6">
        <div className="sticky top-0 z-10 -mx-5 mb-2 flex items-center justify-between bg-surface px-5 py-2 sm:-mx-6 sm:px-6">
          <h2 id="run-t" className="font-display text-[1.375rem] font-[800] leading-tight [font-stretch:112%]">Billing runs</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {done && (
          <p role="status" className="mb-4 flex items-center gap-2 border-l-2 border-positive py-1 pl-3 text-[0.875rem] text-ink">
            <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden /> {done}
          </p>
        )}
        {act.error != null && <div className="mb-4"><ErrorState error={act.error} /></div>}

        <div className="space-y-9 pb-6">
          {draft && (
            <Notice word="Check" tone="caution"
              title={`${draft.invoice_count} invoices for ${draft.period_month ? monthName(draft.period_month) : draft.term_name} · ${money(draft.total_minor)}`}
              detail={`Due ${dateShort(draft.due_on)}. Check them in the Drafts tab, then send them together.`}
              className="border-b border-line pb-5"
            />
          )}
          {draft && (
            <div className="-mt-6 flex flex-wrap gap-2">
              <Button variant="primary" loading={act.isPending}
                onClick={() => act.mutate({ sql: B.ISSUE_BILLING_RUN, params: [draft.id], msg: `${draft.invoice_count} invoices sent to families.` })}>
                <Send className="size-4" aria-hidden /> Send all {draft.invoice_count}
              </Button>
              <Button variant="ghost" loading={act.isPending}
                onClick={() => act.mutate({ sql: B.DISCARD_BILLING_RUN, params: [draft.id], msg: 'Drafts discarded. Nothing was sent.' })}>
                <Trash2 className="size-4" aria-hidden /> Discard drafts
              </Button>
            </div>
          )}

          <section aria-labelledby="run-prev">
            <Head id="run-prev" title="New run" meta={month ? 'Monthly classes' : 'Term and course fees'} />
            <p className="mt-2 text-[0.8125rem] text-ink-3">{month
              ? 'Monthly classes for this month only. Children already invoiced for the month are left out.'
              : 'Monthly classes are billed month by month instead.'}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            {loc.control && (
              <div className="mt-3 space-y-1">
                {loc.control}
                {loc.current && <p className="text-[0.8125rem] text-ink-3">Showing {loc.current} only. The run itself raises invoices for every location.</p>}
              </div>
            )}
            {lines.isLoading && <div className="pt-4"><Skeleton className="h-24" /></div>}
            {lines.error && <div className="pt-4"><ErrorState error={lines.error} /></div>}
            {lines.data?.length === 0 && (
              <EmptyState title="Everyone is invoiced" body={`Every child has an invoice for ${periodName}, or no class is billed this way.`} />
            )}
            {!!skipped.data?.length && (
              <div className="mt-5">
                <p className="label">Already billed for this period — skipped ({skipped.data.length})</p>
                <p className="mt-1 text-[0.8125rem] text-ink-3">
                  These families already have a tuition invoice for {periodName} that does not name its classes, so the run leaves them out.
                  Include one only if that invoice was for something else.
                </p>
                <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto border-y border-line">
                  {skipped.data.map(f => (
                    <li key={f.family_id} className="flex items-center gap-3 py-2 text-[0.875rem]">
                      <input type="checkbox" id={`skip-${f.family_id}`} className="size-5 accent-[var(--color-accent)]"
                        checked={include.includes(f.family_id)}
                        onChange={e => setInclude(x => e.target.checked ? [...x, f.family_id] : x.filter(y => y !== f.family_id))} />
                      <label htmlFor={`skip-${f.family_id}`} className="min-w-0 flex-1">
                        <span className="block font-medium">{f.family_name}</span>
                        <span className="block truncate text-[0.7812rem] text-ink-3">
                          Already billed <span className="tnum">{money(f.billed_minor)}</span> on {f.invoices}
                        </span>
                        {/* Two amounts side by side, each said for what it is (U8). */}
                        <span className="block text-[0.7812rem] text-ink-3">
                          This run would charge <span className="tnum text-ink-2">{money(f.would_raise_minor)}</span>
                          {Number(f.would_raise_minor) !== Number(f.billed_minor) && '. The two differ when classes were added since, for part terms, or with discounts.'}
                        </span>
                      </label>
                      <span className="shrink-0 text-right text-[0.7812rem] text-ink-3">
                        {include.includes(f.family_id) ? 'Included' : 'Include anyway'}
                      </span>
                    </li>
                  ))}
                </ul>
                {include.length > 0 && (
                  <div className="mt-3">
                    <Field label={`Why bill ${include.length === 1 ? 'this family' : 'these families'} again?`} htmlFor="run-why" required
                           hint="Kept in the audit trail against each family.">
                      <Input id="run-why" value={reason} onChange={e => setReason(e.target.value)} maxLength={200}
                             placeholder="Their earlier invoice was for last term" />
                    </Field>
                  </div>
                )}
              </div>
            )}
            {runCount > 0 && (
              <>
                {families.length === 0 && <p className="mt-5 text-[0.875rem] text-ink-2">No family at {loc.current} is in this run.</p>}
                <div className="mt-5 flex items-end justify-between gap-4 border-b border-line pb-3">
                  <div>
                    <p className="label">To invoice{loc.current ? ` at ${loc.current}` : ''}</p>
                    <p className="stat-number mt-1 text-[1.75rem] leading-none">{money(total)}</p>
                  </div>
                  <p className="text-right text-[0.8125rem] text-ink-3">
                    {families.length} families
                    {discounts > 0 && <><br /><span className="tnum">{money(discounts)}</span> of discounts</>}
                  </p>
                </div>
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {families.map(f => (
                    <li key={f.name} className="py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{f.name}</span>
                        <span className="tnum font-semibold">{money(f.gross - f.discount)}</span>
                      </div>
                      <ul className="mt-0.5 space-y-0.5 text-[0.8125rem] text-ink-2">
                        {f.lines.map(l => (
                          <li key={l.student_id + l.class_id} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">{l.student_name.split(' ')[0]} · {l.description}
                              {l.discount_minor > 0 && <span className="text-positive"> · {l.discount_reason}</span>}</span>
                            <span className="tnum shrink-0">
                              {money(Math.round(Number(l.quantity) * l.unit_minor) - l.discount_minor)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line pt-4">
                  <Button variant={draft ? 'secondary' : 'primary'} className="w-full"
                    disabled={!!draft || (include.length > 0 && reason.trim().length < 3)} loading={act.isPending}
                    onClick={() => act.mutate({ sql: B.CREATE_BILLING_RUN,
                      params: [term, due, month || null, include.length ? include : null, include.length ? reason.trim() : null],
                      msg: `${runCount} draft invoices raised for ${periodName}. Nothing has been sent yet.` })}>
                    Raise {runCount} draft invoices{loc.current ? ' (every location)' : ''}
                  </Button>
                  <p className="mt-2 text-center text-[0.8125rem] text-ink-3">
                    {draft ? 'Send or discard the drafts above first.'
                      : include.length > 0 && reason.trim().length < 3 ? 'Say why the included families are billed again.'
                      : 'Drafts first. Nothing reaches families until you send.'}
                  </p>
                </div>
              </>
            )}
          </section>

          <section aria-labelledby="run-disc">
            <Head id="run-disc" title="Discounts" meta="Applied automatically" />
            <p className="mt-2 text-[0.8125rem] text-ink-3">Where both apply, the larger one is used.</p>
            <ul className="divide-y divide-line">
              {rules.data?.map(r => <RuleRow key={r.id} r={r} onChange={x => setRule.mutate(x)} />)}
            </ul>
            {setRule.error != null && <div className="pt-3"><ErrorState error={setRule.error} /></div>}
          </section>

          <FamilyDiscounts />

          {runs.data && runs.data.some(r => r.status === 'issued') && (
            <section aria-labelledby="run-old">
              <Head id="run-old" title="Earlier runs" />
              <ul className="divide-y divide-line text-[0.875rem]">
                {runs.data.filter(r => r.status === 'issued').map(r => (
                  <li key={r.id} className="flex justify-between gap-3 py-2.5">
                    <span>{r.period_month ? monthName(r.period_month) : r.term_name} <span className="text-ink-3">· sent {dateShort(r.issued_at!)}</span></span>
                    <span className="tnum text-ink-2">{r.invoice_count} invoices · <span className="font-semibold text-ink">{money(r.total_minor)}</span></span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Head({ id, title, meta, action }: { id?: string; title: string; meta?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-ink pb-2">
      <h3 id={id} className="section-title flex-1">{title}</h3>
      {meta && <span className="text-[0.8125rem] text-ink-3">{meta}</span>}
      {action}
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
    <li className="flex flex-wrap items-center gap-3 py-3">
      <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
        <input type="checkbox" checked={r.enabled} className="size-5 accent-[var(--color-accent)]"
               onChange={e => onChange({ ...r, enabled: e.target.checked })} />
        <span>
          <span className="block font-medium">{label}</span>
          <span className="block text-[0.8125rem] text-ink-3">{RULE_TEXT[r.kind](r.from_nth)}</span>
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
  const rows = useRows<B.FamilyDiscount>(['family-discounts'], B.FAMILY_DISCOUNTS);
  const fams = useRows<B.FamilyPick>(['family-pick'], B.FAMILY_PICK);
  const labels = React.useMemo(() => pickerLabels(fams.data ?? []), [fams.data]);
  const [adding, setAdding] = React.useState(false);
  const [f, setF] = React.useState({ family: '', kind: 'percent', amount: '', reason: 'bursary', note: '', ends: '' });
  // One save model (U5): the list shows the new discount before the form closes.
  const save = useWrite(B.ADD_FAMILY_DISCOUNT, {
    saved: () => `Discount added for ${labels.get(f.family) ?? 'the family'}`,
    onDone: () => { setAdding(false); setF(x => ({ ...x, family: '', amount: '', note: '', ends: '' })); },
  });
  const addIt = () => save.mutate([f.family, f.kind,
    f.kind === 'percent' ? Math.round(Number(f.amount)) : Math.round(Number(f.amount) * 100), f.reason, f.note, null, f.ends || null]);
  const endSql = useWrite(B.END_FAMILY_DISCOUNT);
  const end = { ...endSql, mutate: (id: string, o?: { onSuccess?: () => void }) => endSql.mutate([id], o) };
  const [ended, setEnded] = React.useState<string | null>(null);
  const ok = f.family && Number(f.amount) > 0 && (f.kind !== 'percent' || Number(f.amount) <= 100);
  return (
    <section aria-labelledby="run-fam">
      <Head id="run-fam" title="Family discounts"
        action={!adding && <Button size="sm" variant="ghost" onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden /> Add</Button>} />
      <p className="mt-2 text-[0.8125rem] text-ink-3">Bursaries, staff rates and other agreements. Families only see the word “Discount”.</p>
      {rows.data?.length === 0 && !adding && <p className="py-3 text-[0.875rem] text-ink-3">None yet.</p>}
      {!!rows.data?.length && (
        <ul className="divide-y divide-line">
          {rows.data.map(d => (
            <li key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{d.family_name}</span>
                <span className="block text-[0.7812rem] text-ink-2">
                  {REASONS[d.reason]}{d.note ? ` · ${d.note}` : ''}{d.ends_on ? ` · until ${dateShort(d.ends_on)}` : ''}
                </span>
              </span>
              <span className="tnum font-medium">{d.kind === 'percent' ? `${d.amount}%` : `${money(d.amount)} off`}</span>
              <button className="grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-critical" aria-label={`End discount for ${d.family_name}`}
                disabled={end.isPending}
                onClick={() => end.mutate(d.id, { onSuccess: () => setEnded(`${d.family_name}’s discount has ended. The next run charges the full price.`) })}>
                <Trash2 className="size-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      {ended && !end.error && <p role="status" className="mt-2 text-[0.8125rem] text-ink-2">{ended}</p>}
      {end.error != null && <div className="mt-2"><ErrorState error={end.error} /></div>}
      {adding && (
        <div className="mt-2 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <Field label="Family" htmlFor="fd-f" required>
            <Select id="fd-f" value={f.family} onChange={e => setF({ ...f, family: e.target.value })}>
              <option value="">Choose…</option>
              {fams.data?.map(x => <option key={x.id} value={x.id}>{labels.get(x.id) ?? x.name}</option>)}
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
            <Button variant="primary" disabled={!ok} loading={save.isPending} onClick={addIt}>Save discount</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </section>
  );
}
