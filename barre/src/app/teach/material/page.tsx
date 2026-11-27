'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { cn } from '@/lib/cn';

const HUE: Record<string, string> = {
  violet: 'bg-violet', amber: 'bg-amber', teal: 'bg-teal', rose: 'bg-rose', indigo: 'bg-indigo', lime: 'bg-lime' };

type Row = { id: string; name: string; style: string | null; colour: string | null; resources: number };

/** A teacher's way in to every class they take, not only today's. */
export default function TeachMaterial() {
  const rows = useRows<Row>(['my-teaching-classes'], H.MY_TEACHING_CLASSES);

  return (
    <Shell title="Material" subtitle="Videos, music and notes, class by class"
           allow={['owner', 'admin', 'teacher']}>
      <div className="mx-auto max-w-2xl">
        {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
        <section aria-labelledby="mat-h">
          <div className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-2">
            <h2 id="mat-h" className="section-title flex-1">Your classes</h2>
            {!!rows.data?.length && <span className="text-[0.8125rem] text-ink-3">{rows.data.length}</span>}
          </div>
          {rows.isLoading && <div className="space-y-3 pt-3">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>}
          {rows.data?.length === 0 && (
            <EmptyState title="No classes yet"
              body="When the office puts you down as teacher or assistant on a class, it appears here." />
          )}
          <ul className="divide-y divide-line">
            {rows.data?.map(c => (
              <li key={c.id}>
                <Link href={`/class/?id=${c.id}`}
                      className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 py-3 hover:bg-surface-2/60">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.name}</span>
                    {c.style && (
                      <span className="flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                        <span aria-hidden className={cn('size-2 rounded-[2px]', HUE[c.colour ?? ''] ?? 'bg-surface-3')} />{c.style}
                      </span>
                    )}
                  </span>
                  <span className={cn('tnum text-right text-[0.8438rem]', c.resources ? 'text-ink-2' : 'text-ink-3')}>
                    {c.resources === 0 ? 'Nothing shared' : `${c.resources} item${c.resources === 1 ? '' : 's'}`}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
