'use client';

import * as React from 'react';
import { PlayCircle } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ResourceRow } from '@/components/app/resource-row';
import { useRows } from '@/lib/query';
import { Card, EmptyState, Input, Skeleton, ErrorState } from '@/components/ui';
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
          <div role="tablist" aria-label="Kind"
               className="inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5">
            {([['all','All'],['video','Videos'],['audio','Tracks'],['document','Resources']] as [Tab,string][]).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={cn('min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium',
                  tab === k ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:text-ink')}>
                {label} <span className="tnum text-ink-3">{counts[k]}</span>
              </button>
            ))}
          </div>
          <Input type="search" value={q} onChange={e => setQ(e.target.value)}
                 className="min-w-[180px] flex-1" placeholder="Search" aria-label="Search the library" />
        </div>

        {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}</Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        {list.length === 0 && !rows.isLoading && (
          <Card><EmptyState icon={<PlayCircle className="size-5" />}
            title={q ? 'Nothing matches that search' : 'Nothing here yet'}
            body={q ? undefined : 'Your teachers can share videos, music and handouts with your classes.'} /></Card>
        )}

        {list.length > 0 && (
          <Card>
            <ul className="divide-y divide-line">
              {list.map(r => <ResourceRow key={r.id} r={r} />)}
            </ul>
          </Card>
        )}

        <p className="px-1 text-[12.5px] text-ink-3">
          Uploaded files play here. Links open in a new tab.
        </p>
      </div>
    </Shell>
  );
}

export default function StudentLibrary() {
  return <LibraryView allow={['student']} title="Library" />;
}
