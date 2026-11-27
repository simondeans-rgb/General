'use client';

import * as React from 'react';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadIcs } from '@/lib/ics';
import { Shell } from '@/components/app/shell';
import { useFamilyVoice } from '@/components/app/adult-self';
import { Diary, MY_DIARY, diaryToCalendar, type DiaryItem } from '@/components/app/diary';

/**
 * The family's diary (UR-26): classes, rehearsals, performances,
 * competitions, exams and private lessons for every child, in one list.
 */
export default function FamilySchedule() {
  const voice = useFamilyVoice();
  return (
    <Shell title="Schedule" subtitle="Classes, rehearsals, shows and exams · next four weeks" allow={['guardian']}
      actionsInline actions={<CalendarButton />}>
      <div className="mx-auto max-w-2xl">
        <Diary family empty={voice.solo ? 'Your classes and events show here once you’re booked in.' : 'Classes, rehearsals and events show here once your child is enrolled or entered.'} />
      </div>
    </Shell>
  );
}

/** Everything in the diary as a calendar file, cancellations included (R-036). */
function CalendarButton() {
  const { session } = useSession();
  const go = async () => {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 16 * 7 * 86400_000);
    const rows = await readAs<DiaryItem>(session, MY_DIARY, [from.toISOString(), to.toISOString()]);
    downloadIcs('dance-diary.ics', 'Dance diary', diaryToCalendar(rows));
  };
  return <CalendarSubscribe onDownload={go} label="Add all to my calendar" />;
}
