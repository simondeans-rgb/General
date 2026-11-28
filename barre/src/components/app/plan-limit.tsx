'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Notice, errorText } from '@/components/ui';
import { REQUEST_UPGRADE } from '@/lib/repos/office';
import Link from 'next/link';

/** A plan limit is not a failure: the school has grown. */
export const isPlanLimit = (error: unknown) => error != null && /PLAN_LIMIT/.test(String((error as Error)?.message ?? error));

/**
 * Shown instead of the error state when a plan limit is reached (UR-39): calm
 * words, and one button that asks Swayvo for a larger plan. The request is
 * recorded on the school's account history, which the platform console reads.
 */
export function PlanLimitNotice({ error }: { error: unknown }) {
  const { session } = useSession();
  const ask = useMutation({
    mutationFn: () => runAs(session, q => q<{ ok: boolean }>(REQUEST_UPGRADE, [errorText(error)])),
  });
  const asked = ask.isSuccess;
  return (
    <div role="status" data-form-error className="border-l-2 border-accent-line py-1 pl-3">
      <Notice word="Limit" tone="accent" title="Your plan is full here"
        detail={`${errorText(error).replace(/\s*Ask Swayvo to move you to a larger plan\.?$/, '')} Nothing is lost: you can add more once the plan is larger.`}
        action={undefined} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* An owner changes plan themselves (F11); an administrator asks. */}
        {session?.role === 'owner' && !session.platform
          ? <Link href="/account#plan" className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] border border-line-strong px-3 text-[0.8438rem] font-semibold hover:bg-surface-2">Choose a larger plan</Link>
          : asked
          ? <p className="text-[0.8438rem] font-semibold text-positive">Asked. Swayvo will be in touch about a larger plan.</p>
          : <Button size="sm" loading={ask.isPending} onClick={() => ask.mutate()}>Ask to upgrade</Button>}
        {ask.error != null && <p className="text-[0.8125rem] text-ink-3">That request could not be sent. Try again, or contact Swayvo.</p>}
      </div>
    </div>
  );
}
