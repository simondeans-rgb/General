'use client';

import * as React from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useRows } from '@/lib/query';
import { Badge, Card, EmptyState, Input, Skeleton, ErrorState } from '@/components/ui';
import * as T from '@/lib/repos/teaching';
import { ageFrom, initials } from '@/lib/format';

export default function MyStudents() {
  const [q, setQ] = React.useState('');
  const rows = useRows<{ id: string; first_name: string; last_name: string; date_of_birth: string;
                         requires_alert: boolean; allergies: string | null;
                         class_names: string | null; attendance_pct: number | null }>(
    ['my-students'], T.MY_STUDENTS);
  const list = (rows.data ?? []).filter(s =>
    !q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell title="My students"
      subtitle={rows.data ? `${rows.data.length} across your classes` : undefined}
      allow={['owner','admin','teacher']}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Input type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Search your students" aria-label="Search your students" />
        {rows.isLoading && <Card className="space-y-3 p-4">{[0,1,2].map(i => <Skeleton key={i} className="h-12" />)}</Card>}
        {rows.error && <ErrorState error={rows.error} />}
        {list.length === 0 && !rows.isLoading && (
          <Card><EmptyState icon={<Users className="size-5" />} title="No students found"
            body="You only see children in classes you teach." /></Card>
        )}
        {list.length > 0 && (
          <Card>
            <ul className="divide-y divide-line">
              {list.map(s => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2">
                    {initials(s.first_name, s.last_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{s.first_name} {s.last_name}</span>
                      {s.requires_alert && <AlertTriangle className="size-3.5 shrink-0 text-critical" aria-label="Medical alert" />}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-2">
                      {ageFrom(s.date_of_birth)} · {s.class_names ?? '—'}
                    </span>
                  </span>
                  {s.attendance_pct != null && (
                    <Badge tone={s.attendance_pct >= 85 ? 'positive' : s.attendance_pct >= 70 ? 'caution' : 'critical'}>
                      {s.attendance_pct}%
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Shell>
  );
}
