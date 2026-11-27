'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorState, Select } from '@/components/ui';
import { SettingsSection, SettingsHead } from './progress-settings';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as A from '@/lib/repos/agenda';

type Sharing = 'details' | 'times' | 'none';

/**
 * What a teacher who also works at other schools sees of this school's
 * classes when looking at another school (UR-47, migration 0055). Owner edits.
 */
export function TimetableSharing() {
  const { session } = useSession();
  const qc = useQueryClient();
  const row = useRows<{ id: string; sharing: Sharing }>(['timetable-sharing'], A.SHARING).data?.[0];
  const owner = session?.role === 'owner';
  const save = useMutation({
    mutationFn: (v: Sharing) => runAs(session, q => q(A.SET_SHARING, [row!.id, v])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!row) return null;
  return (
    <SettingsSection>
      <SettingsHead title="Teachers who work at other schools"
        subtitle="Some teachers also teach elsewhere. Their own personal week, which only they see, can include their classes here." />
      <label className="grid gap-2 py-3 text-[0.9062rem] sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
        <span><span className="font-semibold">Show their classes here, when they are looking at another school</span>
          <span className="block text-[0.8125rem] text-ink-3">Never children, families or other staff. Other schools arranging cover only ever see that the teacher is busy.</span></span>
        <Select aria-label="Show their classes here, when they are looking at another school" value={row.sharing} disabled={!owner || save.isPending}
          onChange={e => save.mutate(e.target.value as Sharing)}>
          <option value="details">Class, time and place</option>
          <option value="times">Busy times only</option>
          <option value="none">Nothing</option>
        </Select>
      </label>
      {save.error != null && <ErrorState error={save.error} />}
      {!owner && <p className="text-[0.8125rem] text-ink-3">Only the owner can change this.</p>}
    </SettingsSection>
  );
}
