'use client';

import Link from 'next/link';
import { ChevronRight, FolderOpen, GraduationCap } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, CardHeader, EmptyState, ErrorState, Skeleton, type Tone } from '@/components/ui';
import * as H from '@/lib/repos/hub';

const TONES: Record<string, Tone> = {
  violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

type Row = { id: string; name: string; style: string | null; colour: string | null; resources: number };

/** A teacher's way in to every class they take, not only today's. */
export default function TeachMaterial() {
  const rows = useRows<Row>(['my-teaching-classes'], H.MY_TEACHING_CLASSES);

  return (
    <Shell title="Material" subtitle="Videos, music and notes, class by class"
           allow={['owner', 'admin', 'teacher']}>
      <div className="mx-auto max-w-2xl space-y-4">
        {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</Card>}
        {rows.error && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}

        {rows.data?.length === 0 && !rows.isLoading && (
          <Card><EmptyState icon={<GraduationCap className="size-5" />} title="No classes assigned to you"
            body="Once you are down as the teacher or assistant on a class, it will appear here." /></Card>
        )}

        {(rows.data?.length ?? 0) > 0 && (
          <Card>
            <CardHeader title="Your classes"
              subtitle="Open one to share a routine video, the term's music or a handout." />
            <ul className="divide-y divide-line">
              {rows.data!.map(c => (
                <li key={c.id}>
                  <Link href={`/class/?id=${c.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-surface-2 text-ink-2">
                      <FolderOpen className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.style && <Badge tone={TONES[c.colour ?? ''] ?? 'neutral'}>{c.style}</Badge>}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-ink-2">
                        {c.resources === 0 ? 'Nothing shared yet'
                          : `${c.resources} item${c.resources === 1 ? '' : 's'} shared`}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Shell>
  );
}
