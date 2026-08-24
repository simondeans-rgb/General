'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlayCircle, Music2, FileText, Link2, ExternalLink, Download, Trash2,
} from 'lucide-react';
import { Button, ErrorState } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as H from '@/lib/repos/hub';
import { storage, formatBytes } from '@/lib/storage';
import { cn } from '@/lib/cn';

const ICON = { video: PlayCircle, audio: Music2, document: FileText, link: Link2 } as const;
const KIND_LABEL = { video: 'Video', audio: 'Track', document: 'Document', link: 'Link' } as const;

export const mmss = (s: number | null) => {
  if (!s) return null;
  const m = Math.floor(s / 60), r = s % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(r).padStart(2, '0')}`;
};

type Extra = { added_by?: string | null };

/**
 * One piece of material, wherever it is listed.
 *
 * A link opens in a tab. An uploaded file is fetched through the storage
 * adapter — which reads it back under the viewer's own row level security, so
 * a blob URL is only ever minted for someone allowed to have it — and then
 * played or downloaded in place. The URL is revoked when the row unmounts.
 */
export function ResourceRow({ r, canManage }: {
  r: H.Resource & Extra; canManage?: boolean;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const Icon = ICON[r.kind] ?? FileText;
  const length = mmss(r.duration_sec);
  const isFile = !!r.storage_path;

  const [url, setUrl] = React.useState<string | null>(null);
  const [opening, setOpening] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);

  React.useEffect(() => () => { if (url) storage.release(url); }, [url]);

  const open = async () => {
    if (!r.storage_path || url) return;
    setOpening(true); setFailed(null);
    try {
      const got = await storage.resolve(r.storage_path, session);
      if (!got) throw new Error('That file is no longer available.');
      setUrl(got);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : 'Could not open that file.');
    } finally {
      setOpening(false);
    }
  };

  const remove = useMutation({
    mutationFn: async () => runAs(session, q => q(H.DELETE_RESOURCE, [r.id])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });

  return (
    <li className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span aria-hidden className={cn('grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]',
          r.kind === 'video' ? 'bg-violet-soft text-violet'
          : r.kind === 'audio' ? 'bg-amber-soft text-amber'
          : 'bg-surface-2 text-ink-2')}>
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{r.title}</p>
          {r.description && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{r.description}</p>}
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-3">
            <span>{KIND_LABEL[r.kind] ?? r.kind}</span>
            {r.category && <span>{r.category}</span>}
            {r.scope_label && <span>{r.scope_label}</span>}
            {length && <span className="tnum">{length}</span>}
            {r.size_bytes != null && <span className="tnum">{formatBytes(r.size_bytes)}</span>}
            {r.added_by && <span>added by {r.added_by}</span>}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isFile && !url && (
            <Button size="sm" onClick={open} loading={opening}>
              {r.kind === 'video' || r.kind === 'audio' ? 'Play' : 'Open'}
            </Button>
          )}
          {!isFile && r.url && (
            <Button size="sm" onClick={() => window.open(r.url!, '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="size-3.5" aria-hidden /> Open
            </Button>
          )}
          {canManage && (
            <Button size="sm" variant="ghost" aria-label={`Remove ${r.title}`}
                    loading={remove.isPending} onClick={() => remove.mutate()}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {failed && <p role="alert" className="mt-2 text-[12.5px] text-critical">{failed}</p>}
      {remove.isError && <div className="mt-2"><ErrorState error={remove.error} /></div>}

      {url && (
        <div className="mt-3">
          {r.kind === 'video' && (
            <video src={url} controls playsInline preload="metadata"
                   className="w-full rounded-[var(--radius-md)] bg-ink" />
          )}
          {r.kind === 'audio' && <audio src={url} controls className="w-full" />}
          {r.kind !== 'video' && r.kind !== 'audio' && (
            <a href={url} download={r.file_name ?? r.title} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline">
              <Download className="size-4" aria-hidden />
              {r.file_name ?? 'Download'}
            </a>
          )}
        </div>
      )}
    </li>
  );
}
