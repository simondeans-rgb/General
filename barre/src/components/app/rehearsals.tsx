'use client';

import { Drama } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { useRows } from '@/lib/query';
import { dateLong, time } from '@/lib/format';

type R = { id: string; title: string; show_title: string; starts_at: string; venue: string | null; child: string | null };

/** Rehearsals for shows a family's child (or a teacher's class) is in (R-015). */
export function RehearsalList({ days = 42 }: { days?: number }) {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + days * 86400_000);
  const rows = useRows<R>(['my-rehearsals', from.toISOString()], `select * from app.my_rehearsals($1, $2)`, [from.toISOString(), to.toISOString()]);
  if (!rows.data?.length) return null;
  return (
    <Card>
      <CardHeader title="Rehearsals" subtitle="For the shows coming up" />
      <ul className="divide-y divide-line">
        {rows.data.map(r => (
          <li key={r.id} className="flex items-start gap-3 px-4 py-3">
            <Drama className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-medium">{r.title} — {r.show_title}{r.child ? ` (${r.child})` : ''}</span>
              <span className="block text-[13px] text-ink-2">{dateLong(r.starts_at)} · {time(r.starts_at)}{r.venue ? ` · ${r.venue}` : ''}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
