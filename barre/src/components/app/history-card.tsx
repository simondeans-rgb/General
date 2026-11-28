'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { useRows } from '@/lib/query';
import { Button, EmptyState, ErrorState, Field, Input, Select, Skeleton } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from '@/components/app/progress-settings';
import { HistoryList } from '@/components/app/record-history';
import * as H from '@/lib/repos/office';
import { PEOPLE_HISTORY } from '@/lib/repos/account';
import { downloadCsv } from '@/lib/csv';
import { isoDate } from '@/lib/format';

/**
 * The school's history, for the owner (UR-35): every recorded change to
 * families, students, health records, places, payments, roles and settings,
 * and every time the office opened a child's medical record. Filter by who,
 * by kind of record, by name and by date; export what is shown.
 */
export function HistoryCard() {
  const [actor, setActor] = React.useState('');
  const [entity, setEntity] = React.useState('');
  const [text, setText] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [typed, setTyped] = React.useState('');
  const [limit, setLimit] = React.useState(50);
  const [automatic, setAutomatic] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setTyped(text.trim()), 250); return () => clearTimeout(t); }, [text]);

  const actors = useRows<{ id: string; name: string }>(['audit-actors'], H.AUDIT_ACTORS);
  const params = [actor || null, entity || null, typed || null, from || null, to || null, limit, automatic];
  const rows = useRows<H.HistoryRow>(['audit-history', ...params], PEOPLE_HISTORY, params);

  const exportCsv = () => downloadCsv(`history-${isoDate(new Date())}.csv`, (rows.data ?? []).map(r => ({
    when: new Date(r.at).toISOString(), who: r.actor, did: H.ACTION_WORD[r.action] ?? r.action,
    record_type: H.ENTITY_WORD[r.entity] ?? r.entity, record: r.record_label ?? '', detail: H.readableSummary(r.summary),
  })));

  return (
    <Card id="history">
      <CardHeader title="History" subtitle="Who changed or opened what, and when. Only owners see this."
        action={rows.data?.length ? <Button size="sm" onClick={exportCsv}><Download className="size-4" aria-hidden /> Export</Button> : undefined} />
      <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
        <Field label="Person" htmlFor="h-actor">
          <Select id="h-actor" value={actor} onChange={e => setActor(e.target.value)}>
            <option value="">Anyone</option>
            {actors.data?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </Field>
        <Field label="Record" htmlFor="h-entity">
          <Select id="h-entity" value={entity} onChange={e => setEntity(e.target.value)}>
            <option value="">All kinds</option>
            {Object.entries(H.ENTITY_WORD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Name contains" htmlFor="h-text">
          <Input id="h-text" type="search" value={text} onChange={e => setText(e.target.value)} placeholder="Wright, Grade 3…" />
        </Field>
        <Field label="From" htmlFor="h-from"><Input id="h-from" type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label="To" htmlFor="h-to"><Input id="h-to" type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
        <label className="col-span-2 flex min-h-11 items-center gap-2.5 text-[0.875rem] sm:col-span-3">
          <input type="checkbox" className="size-[18px] accent-[var(--color-accent)]" checked={automatic} onChange={e => setAutomatic(e.target.checked)} />
          Include automatic changes <span className="text-ink-3">(imports, reminders and scheduled jobs)</span>
        </label>
      </div>
      <div className="pt-4">
        {rows.isPending && <Skeleton className="h-24" />}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {rows.data?.length === 0 && <EmptyState title="Nothing matches" body="Try fewer filters or a wider date range." />}
        {!!rows.data?.length && <HistoryList rows={rows.data} showRecord />}
        {rows.data?.length === limit && (limit < 1000
          ? <Button size="sm" variant="ghost" className="-ml-2 mt-2" onClick={() => setLimit(l => Math.min(1000, l * 4))}>Show more</Button>
          : <p className="pt-2 text-[0.7812rem] text-ink-3">Showing the latest 1,000. Narrow the filters to see further back.</p>)}
      </div>
    </Card>
  );
}
