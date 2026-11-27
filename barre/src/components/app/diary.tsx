'use client';

import * as React from 'react';
import { useRows } from '@/lib/query';
import { EmptyState, Skeleton, ErrorState, ViewTabs, Word } from '@/components/ui';
import { SectionHead, SessionRow, useSessionChanges } from '@/app/family/_parts/ui';
import type { CalEvent } from '@/lib/ics';
import { time, relativeDay, dateLong, isoDate, dayRange } from '@/lib/format';

/** One line in a family's or a student's diary (app.my_diary, UR-26). */
export type DiaryItem = {
  uid: string; item_kind: string; title: string; starts_at: string; ends_at: string | null;
  location: string | null; status: string; student_id: string; child: string; class_id: string | null;
  ref_id: string; style: string | null; colour: string | null; teacher: string | null; detail: string | null;
};
export const MY_DIARY = `select * from app.my_diary($1, $2)`;

export const DIARY_KIND: Record<string, string> = {
  class: 'Class', rehearsal: 'Rehearsal', show: 'Performance', competition: 'Competition', exam: 'Exam',
  workshop: 'Workshop', private_lesson: 'Private lesson', social: 'Social',
};

/** The diary's items as calendar events, one per item even with two children in it. */
export function diaryToCalendar(rows: DiaryItem[]): CalEvent[] {
  const byId = new Map<string, { r: DiaryItem; kids: string[] }>();
  rows.forEach(r => { const e = byId.get(r.uid); if (e) { if (!e.kids.includes(r.child)) e.kids.push(r.child); } else byId.set(r.uid, { r, kids: [r.child] }); });
  return [...byId.values()].map(({ r, kids }) => ({
    id: r.uid, starts_at: r.starts_at, ends_at: r.ends_at ?? r.starts_at, location: r.location,
    cancelled: r.status === 'cancelled',
    title: `${r.item_kind === 'class' ? '' : `${DIARY_KIND[r.item_kind] ?? 'Event'}: `}${r.title} (${kids.join(' & ')})`,
    description: [r.detail, r.teacher ? `With ${r.teacher}` : null].filter(Boolean).join('. ') || null,
  }));
}

/**
 * Everything someone is down for, by day: classes, rehearsals, performances,
 * competitions, exams and private lessons, each labelled by what it is. A
 * family with more than one child can show one child at a time.
 */
export function Diary({ days = 28, family = false, empty }: { days?: number; family?: boolean; empty: string }) {
  const [from] = React.useMemo(() => dayRange(0), []);
  const to = React.useMemo(() => { const d = new Date(from); d.setDate(d.getDate() + days); return d.toISOString(); }, [from, days]);
  const rows = useRows<DiaryItem>(['my-diary', from, days], MY_DIARY, [from, to]);
  const [child, setChild] = React.useState<string>('all');

  const children = React.useMemo(() => {
    const m = new Map<string, string>();
    (rows.data ?? []).forEach(r => m.set(r.student_id, r.child));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows.data]);
  const several = family && children.length > 1;
  const shown = (rows.data ?? []).filter(r => child === 'all' || r.student_id === child);

  const byDay = React.useMemo(() => {
    const map = new Map<string, DiaryItem[]>();
    shown.forEach(s => { const k = isoDate(s.starts_at); map.set(k, [...(map.get(k) ?? []), s]); });
    return [...map.entries()].sort();
  }, [shown]);
  const changes = useSessionChanges((rows.data ?? []).filter(r => r.item_kind === 'class').map(r => r.ref_id));
  const named = several && child === 'all';

  return (
    <div className="space-y-10">
      {several && (
        <ViewTabs label="Whose diary" value={child} onChange={setChild}
          options={[['all', 'Everyone'], ...children.map(([id, name]) => [id, name] as [string, string])]} />
      )}
      {rows.isLoading && <div className="space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>}
      {rows.error != null && <ErrorState error={rows.error} onRetry={() => rows.refetch()} />}
      {byDay.length === 0 && !rows.isLoading && <EmptyState title="Nothing scheduled" body={empty} />}
      {byDay.map(([day, list]) => {
        const rel = relativeDay(list[0]!.starts_at);
        const long = dateLong(list[0]!.starts_at);
        return (
          <section key={day} aria-label={long}>
            <SectionHead title={rel === 'Today' || rel === 'Tomorrow' ? rel : long} meta={rel === 'Today' || rel === 'Tomorrow' ? long : undefined} />
            <ul className="divide-y divide-line">
              {list.map((s, i) => {
                const isClass = s.item_kind === 'class';
                const c = isClass ? changes.get(s.ref_id) : undefined;
                const kind = isClass ? (s.detail === 'Drop-in' ? 'Drop-in' : null) : DIARY_KIND[s.item_kind] ?? 'Event';
                return (
                  <SessionRow key={`${s.uid}-${s.student_id}-${i}`}
                    time={s.item_kind === 'exam' ? 'All day' : time(s.starts_at)}
                    name={named ? `${s.child} · ${s.title}` : s.title}
                    href={s.class_id ? `/class/?id=${s.class_id}` : undefined}
                    cancelled={s.status === 'cancelled'} reason={c?.cancel_reason}
                    moved={!!c && (!!c.original_starts_at || c.room_moved)}
                    style={isClass ? s.style : null} colour={s.colour}
                    meta={[family && !named && several ? s.child : null,
                      c?.covered && s.teacher ? `${s.teacher} (cover)` : s.teacher, s.location,
                      isClass ? null : s.detail]}
                    extra={kind ? <Word tone="ink">{kind}</Word> : undefined} />
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
