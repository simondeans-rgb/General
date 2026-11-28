'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ErrorState, Input, Select } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';

type Row = { id: string; register_opens_before_min: number; register_edit_days: number; cover_travel_min: number;
             makeup_policy: 'off' | 'cancelled' | 'cancelled_and_absence'; makeup_window_days: number; credit_cancelled_classes: boolean;
             absence_credit: 'off' | 'session' | 'fixed';
             register_reminders: boolean; register_reminder_hour: number; register_escalate_hours: number };
const READ = `select id, register_opens_before_min, register_edit_days, cover_travel_min, makeup_policy, makeup_window_days, credit_cancelled_classes,
  absence_credit, register_reminders, register_reminder_hour, register_escalate_hours
  from studio where id in (select app.studio_ids()) limit 1`;
const SAVE = `update studio set register_opens_before_min = $2, register_edit_days = $3, cover_travel_min = $4,
  makeup_policy = $5, makeup_window_days = $6,
  register_reminders = $7, register_reminder_hour = $8, register_escalate_hours = $9 where id = $1 returning id`;

/** Registers, cover and make-ups (migration 0048: UR-37, UR-27, UR-56). Owner edits; the office reads. */
export function RegisterSettings() {
  const { session } = useSession();
  const qc = useQueryClient();
  const row = useRows<Row>(['register-settings'], READ).data?.[0];
  const owner = session?.role === 'owner';
  const [f, setF] = React.useState<Record<string, string> | null>(null);
  React.useEffect(() => {
    if (row && !f) setF({ before: String(row.register_opens_before_min), days: String(row.register_edit_days),
      travel: String(row.cover_travel_min), policy: row.makeup_policy, window: String(row.makeup_window_days),
      remind: row.register_reminders ? 'on' : 'off', hour: String(row.register_reminder_hour), escalate: String(row.register_escalate_hours) });
  }, [row, f]);
  const save = useMutation({
    mutationFn: () => runAs(session, q => q(SAVE, [row!.id, Number(f!.before), Number(f!.days), Number(f!.travel), f!.policy, Number(f!.window),
      f!.remind === 'on', Number(f!.hour), Number(f!.escalate)])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!row || !f) return null;
  const dirty = f.before !== String(row.register_opens_before_min) || f.days !== String(row.register_edit_days)
    || f.travel !== String(row.cover_travel_min) || f.policy !== row.makeup_policy || f.window !== String(row.makeup_window_days)
    || f.remind !== (row.register_reminders ? 'on' : 'off') || f.hour !== String(row.register_reminder_hour)
    || f.escalate !== String(row.register_escalate_hours);
  const num = (k: string, label: string, hint: string, max: number) => (
    <label className="grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-3 py-2 text-[0.9062rem]">
      <span><span className="font-semibold">{label}</span><span className="block text-[0.8125rem] text-ink-3">{hint}</span></span>
      <Input aria-label={label} type="number" min={0} max={max} value={f[k]} disabled={!owner} onChange={e => setF({ ...f, [k]: e.target.value })} />
    </label>
  );
  return (
    <Card>
      <CardHeader title="Registers, cover and make-ups" subtitle="When registers can be marked, reminders when one is left open, and what families are offered when a class is missed" />
      <div className="divide-y divide-line pt-1">
        {num('before', 'Registers open, minutes before the class', 'Before that, a register is read-only, so marks cannot land on the wrong day.', 720)}
        {num('days', 'Registers can be changed for, days after', 'After that, only the office can amend a register, giving a reason.', 60)}
        <label className="grid gap-2 py-2 text-[0.9062rem] sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
          <span><span className="font-semibold">Remind about unfinished registers</span>
            <span className="block text-[0.8125rem] text-ink-3">The morning after a class, the teacher is reminded if the register is not closed.
              If it is still open after that, the owner and administrators are told.</span></span>
          <Select aria-label="Remind about unfinished registers" value={f.remind} disabled={!owner} onChange={e => setF({ ...f, remind: e.target.value })}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </Select>
        </label>
        {f.remind === 'on' && num('hour', 'Remind the teacher at, hour of the morning after', '24-hour clock, school time. 8 means 08:00.', 23)}
        {f.remind === 'on' && num('escalate', 'Then tell the office after, hours', 'Counted from the teacher’s reminder. 24 means the next morning.', 96)}
        {num('travel', 'Travel time between sites, minutes', 'Arranging cover warns when a teacher could not get from one class to the other.', 240)}
        <label className="grid gap-2 py-2 text-[0.9062rem] sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
          <span><span className="font-semibold">Make-up classes</span>
            <span className="block text-[0.8125rem] text-ink-3">Families are offered a free place in a class of the same style with space.
              {row.credit_cancelled_classes ? ' Cancellations are credited instead (Money tab), so make-ups are only offered for reported absences.' : ''}
              {row.absence_credit !== 'off' ? ' Reported absences are credited instead (Money tab); offering make-ups for them switches that credit off.' : ''}</span></span>
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
      {!owner && <p className="pt-2 text-[0.8125rem] text-ink-3">Only the owner can change these.</p>}
    </Card>
  );
}
