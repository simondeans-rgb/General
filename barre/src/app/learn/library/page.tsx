'use client';

import * as React from 'react';
import { PlayCircle, Music2, FileText, Link2, ExternalLink, Clock } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, EmptyState, Input, Skeleton, ErrorState } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'video' | 'audio' | 'document';

const ICON = {
  video: PlayCircle, audio: Music2, document: FileText, link: Link2,
} as const;

const mmss = (s: number | null) => {
  if (!s) return null;
  const m = Math.floor(s / 60), r = s % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(r).padStart(2, '0')}`;
};

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
              {list.map(r => {
                const Icon = ICON[r.kind];
                const length = mmss(r.duration_sec);
                return (
                  <li key={r.id}>
                    <a href={r.url ?? '#'} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
                      <span aria-hidden className={cn('grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]',
                        r.kind === 'video' ? 'bg-violet-soft text-violet'
                        : r.kind === 'audio' ? 'bg-amber-soft text-amber'
                        : 'bg-surface-2 text-ink-2')}>
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-2">
                          {r.category && <span>{r.category}</span>}
                          {r.scope_label && <span className="text-ink-3">{r.scope_label}</span>}
                          {length && <span className="tnum inline-flex items-center gap-1 text-ink-3">
                            <Clock className="size-3" aria-hidden />{length}</span>}
                        </span>
                      </span>
                      <ExternalLink className="size-4 shrink-0 text-ink-3" aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        <p className="px-1 text-[12.5px] text-ink-3">
          Links open in a new tab. Uploaded files are coming — the studio shares links for now.
        </p>
      </div>
    </Shell>
  );
}

export default function StudentLibrary() {
  return <LibraryView allow={['student']} title="Library" />;
}
