'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ErrorState, Input, Select } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';

type Row = { id: string; register_opens_before_min: number; register_edit_days: number; cover_travel_min: number;
             makeup_policy: 'off' | 'cancelled' | 'cancelled_and_absence'; makeup_window_days: number; credit_cancelled_classes: boolean };
const READ = `select id, register_opens_before_min, register_edit_days, cover_travel_min, makeup_policy, makeup_window_days, credit_cancelled_classes
  from studio where id in (select app.studio_ids()) limit 1`;
const SAVE = `update studio set register_opens_before_min = $2, register_edit_days = $3, cover_travel_min = $4,
  makeup_policy = $5, makeup_window_days = $6 where id = $1 returning id`;

/** Registers, cover and make-ups (migration 0048: UR-37, UR-27, UR-56). Owner edits; the office reads. */
export function RegisterSettings() {
  const { session } = useSession();
  const qc = useQueryClient();
  const row = useRows<Row>(['register-settings'], READ).data?.[0];
  const owner = session?.role === 'owner';
  const [f, setF] = React.useState<Record<string, string> | null>(null);
  React.useEffect(() => {
    if (row && !f) setF({ before: String(row.register_opens_before_min), days: String(row.register_edit_days),
      travel: String(row.cover_travel_min), policy: row.makeup_policy, window: String(row.makeup_window_days) });
  }, [row, f]);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(SAVE, [row!.id, Number(f!.before), Number(f!.days), Number(f!.travel), f!.policy, Number(f!.window)])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!row || !f) return null;
  const dirty = f.before !== String(row.register_opens_before_min) || f.days !== String(row.register_edit_days)
    || f.travel !== String(row.cover_travel_min) || f.policy !== row.makeup_policy || f.window !== String(row.makeup_window_days);
  const num = (k: string, label: string, hint: string, max: number) => (
    <label className="grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-3 py-2 text-[14.5px]">
      <span><span className="font-semibold">{label}</span><span className="block text-[13px] text-ink-3">{hint}</span></span>
      <Input aria-label={label} type="number" min={0} max={max} value={f[k]} disabled={!owner} onChange={e => setF({ ...f, [k]: e.target.value })} />
    </label>
  );
  return (
    <Card>
      <CardHeader title="Registers, cover and make-ups" subtitle="When registers can be marked, and what families are offered when a class is missed" />
      <div className="divide-y divide-line pt-1">
        {num('before', 'Registers open, minutes before the class', 'Before that, a register is read-only, so marks cannot land on the wrong day.', 720)}
        {num('days', 'Registers can be changed for, days after', 'After that, only the office can amend a register, giving a reason.', 60)}
        {num('travel', 'Travel time between sites, minutes', 'Arranging cover warns when a teacher could not get from one class to the other.', 240)}
        <label className="grid gap-2 py-2 text-[14.5px] sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
          <span><span className="font-semibold">Make-up classes</span>
            <span className="block text-[13px] text-ink-3">Families are offered a free place in a class of the same style with space.
              {row.credit_cancelled_classes ? ' Cancellations are credited instead (Money tab), so make-ups are only offered for reported absences.' : ''}</span></span>
          <Select aria-label="Make-up classes" value={f.policy} disabled={!owner} onChange={e => setF({ ...f, policy: e.target.value })}>
            <option value="off">Not offered</option>
            <option value="cancelled">When we cancel a class</option>
            <option value="cancelled_and_absence">When we cancel, or a family reports an absence</option>
          </Select>
        </label>
        {f.policy !== 'off' && num('window', 'Make-up must be used within, days', 'After that the offer lapses.', 120)}
      </div>
      {save.error != null && <ErrorState error={save.error} />}
      {owner && <div className="pt-3"><Button size="sm" variant="primary" disabled={!dirty} loading={save.isPending} onClick={() => save.mutate()}>Save</Button></div>}
      {!owner && <p className="pt-2 text-[13px] text-ink-3">Only the owner can change these.</p>}
    </Card>
  );
}
