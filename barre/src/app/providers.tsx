'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/lib/auth/session';
import { DatabaseGate } from '@/components/app/database-gate';
import { UndoToaster } from '@/components/app/undo';
import { SavedStatus } from '@/components/app/saved-status';
import { PwaSetup } from '@/components/app/pwa';
import { FocusManager } from '@/components/app/focus-manager';
import { RegisterSync } from '@/lib/offline/register-sync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    // The data is read from and written to a database on this device, so a
    // lost signal must not pause reads or writes (UR-04): TanStack's default
    // 'online' mode would leave a register spinning with no signal.
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000, networkMode: 'offlineFirst' },
      mutations: { networkMode: 'offlineFirst' },
    },
  }));
  // The marketing page needs no database: show it at once, not behind the demo loader.
  const marketing = usePathname()?.replace(/\/$/, '') === '/welcome';
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <FocusManager />
        {marketing ? children : <DatabaseGate>{children}<UndoToaster /><SavedStatus /><PwaSetup /><RegisterSync /></DatabaseGate>}
      </SessionProvider>
    </QueryClientProvider>
  );
}
