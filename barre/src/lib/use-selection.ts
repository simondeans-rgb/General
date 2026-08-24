'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Keeps the selected record in the URL, so it survives reload and can be shared. */
export function useSelection(key = 'id') {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = params.get(key);

  const select = React.useCallback((id: string | null) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (id) next.set(key, id); else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router, key]);

  return { selected, select };
}
