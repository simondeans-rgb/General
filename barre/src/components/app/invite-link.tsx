'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';

/** A freshly made invitation link. Shown once: the database keeps only its hash. */
export function InviteLink({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-accent-line/30 bg-accent-soft/50 p-3">
      <p className="text-[13px] font-medium">Invitation link — works once, for 14 days</p>
      <div className="mt-2 flex gap-2">
        <Input readOnly value={link} aria-label="Invitation link" onFocus={e => e.currentTarget.select()} className="text-[12.5px]" />
        <Button size="sm" onClick={async () => {
          try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
        }}>{copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{copied ? 'Copied' : 'Copy'}</Button>
      </div>
      <p className="mt-2 text-[12px] text-ink-3">Email delivery is not connected yet — send this link yourself. It is shown only now.</p>
    </div>
  );
}
