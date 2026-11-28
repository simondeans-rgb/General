'use client';

import * as React from 'react';
import { Shell } from '@/components/app/shell';
import { ResourceRow } from '@/components/app/resource-row';
import { useRows } from '@/lib/query';
import { EmptyState, Input, Skeleton, ErrorState, FilterTabs } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'video' | 'audio' | 'document';

/** Shared by the student hub and the parent hub — same library, same rules. */
export function LibraryView({ allow, title }: { allow: any; title: string }) {
  const [tab, setTab] = React.useState<Tab>('all');
  const [q, setQ] = React.useState('');
  const rows = useRows<H.Resource>(['resources'], H.RESOURCES);

  const list = (rows.data ?? []).filter(r =>
    (tab === 'all' || r.kind === tab || (tab === 'document' && r.kind === 'link')) &&
    (!q || `${r.title} ${r.category ?? ''}`.toLowerCase().includes(q.toLowerCase())));

  const counts = {
    all: rows.data?.length ?? 0,
    video: rows.data?.filter(r => r.kind === 'video').length ?? 0,
    audio: rows.data?.filter(r => r.kind === 'audio').length ?? 0,
    document: rows.data?.filter(r => r.kind === 'document' || r.kind === 'link').length ?? 0,
  };

  return (
    <Shell title={title} subtitle="Everything your teachers have shared with you" allow={allow}>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input type="search" value={q} onChange={e => setQ(e.target.value)}
                 className="h-11 w-full" placeholder="Search videos, tracks and handouts" aria-label="Search the library" />
          <FilterTabs label="Kind" value={tab} onChange={setTab} className="mx-0 w-full border-b border-line"
            options={([['all', 'All'], ['video', 'Videos'], ['audio', 'Tracks'], ['document', 'Resources']] as [Tab, string][]).map(([k, l]) => [k, l, counts[k]])} />
        </div>

        {rows.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {list.length === 0 && !rows.isLoading && (
          <EmptyState
            title={q ? 'Nothing matches that search' : 'Nothing here yet'}
            body={q ? 'Try a class name or a step.' : 'Videos, music and handouts your teachers share show here.'} />
        )}

        {list.length > 0 && (
          <ul className="-mx-4 divide-y divide-line">
            {list.map(r => <ResourceRow key={r.id} r={r} />)}
          </ul>
        )}

        <p className="text-[0.8125rem] text-ink-3">
          Uploaded files play here. Links open in a new tab.
        </p>
      </div>
    </Shell>
  );
}

export default function StudentLibrary() {
  return <LibraryView allow={['student']} title="Library" />;
}
