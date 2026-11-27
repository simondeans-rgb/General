'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as B from '@/lib/repos/billing';

let asked = '';

/**
 * Invoices due within three days are mentioned in the bell once (UR-23).
 * A server deployment runs this on its schedule as well; here it runs when a
 * family opens the app, once per sign-in, and never blocks the screen.
 */
export function useDueReminders() {
  const { session } = useSession();
  const qc = useQueryClient();
  React.useEffect(() => {
    if (!session || session.role !== 'guardian' || asked === session.userId) return;
    asked = session.userId;
    runAs(session, q => q<{ n: number }>(B.NOTIFY_DUE))
      .then(r => { if (r[0]?.n) qc.invalidateQueries({ queryKey: ['db'] }); })
      .catch(() => undefined);
  }, [session, qc]);
}
