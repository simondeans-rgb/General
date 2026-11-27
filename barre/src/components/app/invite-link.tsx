'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';

/** A freshly made invitation link. Shown once: the database keeps only its hash. */
export function InviteLink({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="mt-3 border-l-2 border-ink pl-3">
      <p className="text-[0.875rem] font-semibold">Invitation link <span className="font-normal text-ink-3">· works once, for 14 days</span></p>
      <div className="mt-2 flex gap-2">
        <Input readOnly value={link} aria-label="Invitation link" onFocus={e => e.currentTarget.select()} className="text-[0.7812rem]" />
        <Button size="sm" onClick={async () => {
          try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
        }}>{copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{copied ? 'Copied' : 'Copy'}</Button>
      </div>
      <p className="mt-2 text-[0.8125rem] text-ink-3">Email delivery isn’t connected yet, so send this link yourself. It’s shown only now.</p>
    </div>
  );
}
