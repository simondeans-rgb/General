'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/lib/auth/session';
import { DatabaseGate } from '@/components/app/database-gate';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
    },
  }));
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <DatabaseGate>{children}</DatabaseGate>
      </SessionProvider>
    </QueryClientProvider>
  );
}
