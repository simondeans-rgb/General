'use client';

import * as React from 'react';
import { useRows } from '@/lib/query';
import { Button } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import * as H from '@/lib/repos/hub';
import { relativeDay } from '@/lib/format';

const KID_WORDS: Record<P.Level, string> = {
  not_started: 'Starting out', developing: 'Learning it', secure: 'Getting really good', mastered: 'You’ve got it',
};

/**
 * "Share with my child" (UR-55): for children under 13, who have no login of
 * their own. A parent opens it on their own phone and shows it to the child:
 * big type, simple words, only good news and one thing to try. Nothing here
 * that the parent's own view does not already show.
 */
export function ChildView({ student, notes, onClose }: {
  student: { id: string; first_name: string; skill_tracking_opt_out?: boolean };
  notes: H.Feedback[]; onClose: () => void;
}) {
  const skills = useRows<P.SkillRow>(['skills', student.id], P.STUDENT_SKILLS, [student.id], { enabled: !student.skill_tracking_opt_out });
  const milestones = useRows<P.Milestone>(['milestones', student.id], P.MILESTONES, [student.id]);
  const stickers = useRows<{ label: string; sticker: string }>(['chip-stickers'],
    `select distinct label, sticker from feedback_chip where sticker is not null and deleted_at is null`);
  const sticker = new Map((stickers.data ?? []).map(s => [s.label, s.sticker]));
  const done = (skills.data ?? []).filter(s => s.level && s.level !== 'not_started');
  React.useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  const decorate = (text: string) => {
    const s = text.split(/,\s*|\.\s+/).map(t => sticker.get(t.trim())).filter(Boolean);
    return s.length ? `${[...new Set(s)].join(' ')} ` : '';
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="child-view-h"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-canvas px-4 pb-safe pt-6">
      <div className="mx-auto max-w-lg space-y-8 pb-10">
        <div className="flex items-start gap-3">
          <h2 id="child-view-h" className="min-w-0 flex-1 font-display text-[2.125rem] leading-tight">Well done, {student.first_name}</h2>
          <Button autoFocus onClick={onClose}>Done</Button>
        </div>
        {notes.slice(0, 3).map(n => (
          <section key={n.id} className="space-y-3 border-t-2 border-ink pt-4">
            <p className="text-[0.875rem] text-ink-3">{n.class_name ?? 'Class'} · {relativeDay(n.shared_at!)}</p>
            {n.going_well && <p className="text-[1.5rem] font-semibold leading-snug">{decorate(n.going_well)}{n.going_well}</p>}
            {n.work_on && <p className="text-[1.25rem] leading-snug"><span className="font-semibold">Next time, try: </span>{n.work_on}</p>}
          </section>
        ))}
        {!!milestones.data?.length && (
          <section className="border-t-2 border-ink pt-4">
            <h3 className="text-[1.25rem] font-semibold">Things you have done</h3>
            <ul className="mt-2 space-y-1 text-[1.25rem]">{milestones.data.slice(0, 5).map(m => <li key={m.id}>{m.title}</li>)}</ul>
          </section>
        )}
        {done.length > 0 && (
          <section className="border-t-2 border-ink pt-4">
            <h3 className="text-[1.25rem] font-semibold">Your dance skills</h3>
            <ul className="mt-2 space-y-2 text-[1.1875rem]">
              {done.map(s => <li key={s.skill_id} className="flex flex-wrap gap-x-3"><span className="font-medium">{s.skill}</span><span className="text-ink-2">{KID_WORDS[s.level!]}</span></li>)}
            </ul>
          </section>
        )}
        <p className="text-[0.875rem] text-ink-3">This is the view to show {student.first_name}. Children under 13 don’t have their own login; you choose what to share.</p>
      </div>
    </div>
  );
}
