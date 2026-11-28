'use client';

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { announceSaved } from '@/lib/saved';

/**
 * Refresh everything on screen after a write, and wait for it (U5). Every read
 * goes through useRows under the 'db' key, so this one call covers the panel
 * behind a sheet as well as the list behind the panel. Awaiting it is what
 * stops a sheet closing onto the old values.
 */
export async function refreshAfterWrite(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: ['db'] });
}

export type WriteOptions<R> = {
  /** Called once the new values are on screen. */
  onDone?: (rows: R[]) => void;
  /** The one-line status shown when the save lands, e.g. "Saved Clara’s details". */
  saved?: string | ((rows: R[]) => string | null | undefined);
};

/**
 * The one save model for office sheets (U5). Runs one statement as the signed
 * in user, then refetches what is on screen before reporting success, so the
 * sheet stays on "Saving…" until the panel behind it already shows the new
 * values, and only then closes with a "Saved" status line.
 *
 * `useWrite(sql, onDone)` keeps the shape of the hooks it replaces.
 */
export function useWrite<R = any>(sql: string, opts?: WriteOptions<R> | ((rows: R[]) => void)) {
  const { session } = useSession();
  const qc = useQueryClient();
  const o: WriteOptions<R> = typeof opts === 'function' ? { onDone: opts } : opts ?? {};
  return useMutation({
    mutationFn: async (params: unknown[]) => {
      const rows = await runAs(session, q => q<R>(sql, params));
      await refreshAfterWrite(qc);
      return rows as R[];
    },
    onSuccess: rows => {
      const msg = typeof o.saved === 'function' ? o.saved(rows) : o.saved;
      if (msg) announceSaved(msg);
      o.onDone?.(rows);
    },
  });
}
