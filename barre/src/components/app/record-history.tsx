'use client';

import * as React from 'react';
import { History } from 'lucide-react';
import { useRows } from '@/lib/query';
import { Button, ErrorState, Skeleton } from '@/components/ui';
import * as H from '@/lib/repos/office';
import { dateShort, time } from '@/lib/format';

/**
 * A family's or a child's history (UR-35): who changed what, and when. Loaded
 * only when asked for, because most visits to a record are not about its past.
 * Values are never shown — only which details changed — so the history can be
 * read without exposing health data a second time.
 */
export function RecordHistory({ entity, id }: { entity: 'family' | 'student'; id: string }) {
  const [open, setOpen] = React.useState(false);
  const rows = useRows<H.HistoryRow>(['record-history', entity, id], H.RECORD_HISTORY, [entity, id], { enabled: open });

  if (!open) {
    return (
      <Button size="sm" variant="ghost" className="-ml-2" onClick={() => setOpen(true)}>
        <History className="size-4" aria-hidden /> Show history
      </Button>
    );
  }
  if (rows.isPending) return <Skeleton className="h-16" />;
  if (rows.error) return <ErrorState error={rows.error} />;
  if (!rows.data?.length) return <p className="text-[0.875rem] text-ink-3">Nothing recorded yet.</p>;
  return <FoldedHistory rows={rows.data} />;
}

/** Rows written by Swayvo itself (starting data, imports, scheduled jobs). */
export const isAutomatic = (r: H.HistoryRow) => r.automatic ?? r.actor === AUTOMATIC;
const AUTOMATIC = 'Swayvo (automatic)';

/** People's changes first; automatic rows folded away behind a toggle (F10). */
function FoldedHistory({ rows }: { rows: H.HistoryRow[] }) {
  const [all, setAll] = React.useState(false);
  const auto = rows.filter(isAutomatic).length;
  const shown = all ? rows : rows.filter(r => !isAutomatic(r));
  return (
    <div>
      {shown.length > 0 ? <HistoryList rows={shown} showRecord />
        : <p className="text-[0.875rem] text-ink-3">No changes by people yet.</p>}
      {auto > 0 && (
        <Button size="sm" variant="ghost" className="-ml-2 mt-1" aria-pressed={all} onClick={() => setAll(a => !a)}>
          {all ? 'Hide automatic changes' : `Show ${auto} automatic change${auto === 1 ? '' : 's'}`}
        </Button>
      )}
    </div>
  );
}

export function HistoryList({ rows, showRecord }: { rows: H.HistoryRow[]; showRecord?: boolean }) {
  return (
    <ol className="divide-y divide-line">
      {rows.map(r => (
        <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2 text-[0.8438rem]">
          <span className="min-w-0">
            <span className="font-semibold">{r.actor}</span>{' '}
            <span className="text-ink-2">{(H.ACTION_WORD[r.action] ?? r.action).toLowerCase()}</span>{' '}
            {showRecord && <span className="text-ink-2">{r.record_label ?? H.ENTITY_WORD[r.entity] ?? r.entity}</span>}
            {r.summary && r.action !== 'view_medical' && (
              <span className="block truncate text-[0.7812rem] text-ink-3">{H.readableSummary(r.summary)}</span>
            )}
            {r.action === 'view_medical' && <span className="block text-[0.7812rem] text-ink-3">Opened the medical record</span>}
          </span>
          <span className="tnum text-right text-[0.7812rem] text-ink-3">{dateShort(r.at)}<span className="block">{time(r.at)}</span></span>
        </li>
      ))}
    </ol>
  );
}
