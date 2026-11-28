'use client';

import * as React from 'react';
import { Shell } from '@/components/app/shell';
import { CalendarSubscribe } from '@/components/app/calendar-subscribe';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { downloadIcs } from '@/lib/ics';
import { useRows } from '@/lib/query';
import { SectionHead } from '@/components/ui';
import { Diary, MY_DIARY, diaryToCalendar, type DiaryItem } from '@/components/app/diary';
import * as E from '@/lib/repos/events';
import { examStatusText } from '@/components/app/exams';
import { dateLong } from '@/lib/format';

/** A student's own diary (UR-26), with their exam entries and results. */
export default function StudentTimetable() {
  return (
    <Shell title="Timetable" subtitle="Your classes, rehearsals, shows and exams" allow={['student']}
      actionsInline actions={<CalendarButton />}>
      <div className="mx-auto max-w-2xl space-y-10">
        <Diary empty="Your classes show here once you’re enrolled." />
        <MyExams />
      </div>
    </Shell>
  );
}

function MyExams() {
  const rows = useRows<E.ExamEntry>(['my-exams'], E.MY_EXAMS);
  if (!rows.data?.length) return null;
  return (
    <section aria-labelledby="my-exams">
      <SectionHead id="my-exams" title="Exams" meta="Entries and results" />
      <ul className="divide-y divide-line">
        {rows.data.map(e => (
          <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{e.grade} · {e.board}</span>
              <span className="block text-[0.8125rem] text-ink-3">{e.exam_title} · {dateLong(e.exam_on)}{e.venue ? ` · ${e.venue}` : ''}</span>
            </span>
            {/* The same words as the family's child card (round 2 F2). */}
            <span className="text-[0.875rem] font-semibold">{examStatusText(e)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CalendarButton() {
  const { session } = useSession();
  const go = async () => {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 16 * 7 * 86400_000);
    const rows = await readAs<DiaryItem>(session, MY_DIARY, [from.toISOString(), to.toISOString()]);
    downloadIcs('my-dance-diary.ics', 'Dance diary', diaryToCalendar(rows));
  };
  return <CalendarSubscribe onDownload={go} label="Add all to my calendar" />;
}
