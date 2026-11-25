'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';

/**
 * Every read goes through here, which means every read is scoped to the signed
 * in user by the database. There is no code path that queries without a
 * session attached.
 */
export function useRows<T>(
  key: unknown[],
  sql: string,
  params: unknown[] = [],
  options?: Omit<UseQueryOptions<T[]>, 'queryKey' | 'queryFn'>,
) {
  const { session } = useSession();
  return useQuery<T[]>({
    // The chosen school is part of the key: switching school can never show the last one's rows.
    queryKey: ['db', session?.userId ?? 'anon', session?.studio ?? '', ...key],
    queryFn: () => readAs<T>(session, sql, params),
    staleTime: 15_000,
    ...options,
  });
}

export function useRow<T>(key: unknown[], sql: string, params: unknown[] = []) {
  const q = useRows<T>(key, sql, params);
  return { ...q, data: q.data?.[0] };
}
