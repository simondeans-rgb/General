'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/lib/auth/session';
import { DatabaseGate } from '@/components/app/database-gate';
import { UndoToaster } from '@/components/app/undo';
import { PwaSetup } from '@/components/app/pwa';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
    },
  }));
  // The marketing page needs no database: show it at once, not behind the demo loader.
  const marketing = usePathname()?.replace(/\/$/, '') === '/welcome';
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        {marketing ? children : <DatabaseGate>{children}<UndoToaster /><PwaSetup /></DatabaseGate>}
      </SessionProvider>
    </QueryClientProvider>
  );
}
