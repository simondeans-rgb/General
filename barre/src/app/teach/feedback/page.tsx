'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronDown, Plus, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { LastFeedback } from '@/components/app/last-feedback';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Beats, Button, EmptyState, ErrorState, Input, Notice, Skeleton, Choice, StatusLine } from '@/components/ui';
import * as P from '@/lib/repos/progress';
import * as H from '@/lib/repos/hub';
import { time, dateLong, dateShort } from '@/lib/format';
import { cn } from '@/lib/cn';

type Kind = 'going_well' | 'work_on';
type Draft = { going_well: string[]; work_on: string[]; note: string; work_on_note: string;
  resource: string | null; skills: Record<string, P.Level> };

/** What was saved, as a draft to edit: reopening shows it, so nothing is lost (UR-25). */
const saved = (k: P.FeedbackKid): Draft => ({
  going_well: k.going_well_chips ?? [], work_on: k.work_on_chips ?? [], note: k.note ?? '', work_on_note: k.work_on_note ?? '',
  resource: k.work_on_resource_id ?? null, skills: {},
});
const same = (a: Draft, b: Draft) => a.going_well.join('|') === b.going_well.join('|') && a.work_on.join('|') === b.work_on.join('|')
  && a.note.trim() === b.note.trim() && a.work_on_note.trim() === b.work_on_note.trim() && a.resource === b.resource
  && Object.keys(a.skills).length === 0 && Object.keys(b.skills).length === 0;

export default function ClassFeedbackPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><ClassFeedback /></Suspense>;
}

/**
 * Feedback for a whole class in a few taps (R-021, UR-44): select everyone,
 * tap the phrases that fit, share. Or tap a child for their own words.
 * Nothing reaches a family until "Share with families".
 */
function ClassFeedback() {
  const sessionId = useSearchParams().get('session') ?? '';
  const { session } = useSession();
  const qc = useQueryClient();
  const meta = useRows<{ id: string; class_id: string; name: string; starts_at: string }>(['session-meta', sessionId],
    `select cs.id, cs.class_id, c.name, cs.starts_at from class_session cs join class c on c.id = cs.class_id where cs.id = $1`,
    [sessionId], { enabled: !!sessionId });
  const m = meta.data?.[0];
  const classId = m?.class_id ?? '';
  const kids = useRows<P.FeedbackKid>(['session-feedback', sessionId], P.SESSION_FEEDBACK, [sessionId], { enabled: !!sessionId });
  const chips = useRows<P.ClassChip>(['class-chips', classId], P.CLASS_CHIPS, [classId], { enabled: !!classId });
  const depthRow = useRows<{ depth: P.Depth; tracking_depth: P.Depth | null; default_depth: P.Depth; age_min: number | null; age_max: number | null }>(
    ['class-depth', classId], P.CLASS_DEPTH, [classId], { enabled: !!classId });
  const previous = useRows<P.PreviousChips>(['previous-chips', sessionId], P.PREVIOUS_SESSION_CHIPS, [sessionId], { enabled: !!sessionId });
  const resources = useRows<{ id: string; title: string; kind: string }>(['class-resources', classId], H.CLASS_RESOURCES, [classId], { enabled: !!classId });
  const depth = depthRow.data?.[0]?.depth ?? 'full';

  const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});
  const [open, setOpen] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [done, setDone] = React.useState<string | null>(null);

  const list = (kids.data ?? []).filter(k => k.status !== 'absent' && k.status !== 'excused');
  const byId = new Map(list.map(k => [k.student_id, k]));
  const draftOf = (id: string): Draft => drafts[id] ?? (byId.get(id) ? saved(byId.get(id)!) : saved({} as P.FeedbackKid));
  const changed = Object.entries(drafts).filter(([id, d]) => byId.get(id) && !same(d, saved(byId.get(id)!)));
  // While a save or share is on its way, children's feedback is locked.
  const busy = React.useRef(false);
  const upd = (id: string, f: (d: Draft) => Draft) => { if (!busy.current) setDrafts(x => ({ ...x, [id]: f(x[id] ?? draftOf(id)) })); };
  const toggle = (id: string, kind: Kind, label: string) =>
    upd(id, d => ({ ...d, [kind]: d[kind].includes(label) ? d[kind].filter(l => l !== label) : [...d[kind], label] }));

  // "Apply to selected children": a phrase goes on everyone picked, or comes
  // off everyone if they all have it already.
  const applyToPicked = (kind: Kind, label: string) => {
    if (busy.current) return;
    const ids = [...picked];
    const all = ids.every(id => draftOf(id)[kind].includes(label));
    setDrafts(x => {
      const next = { ...x };
      ids.forEach(id => {
        const d = next[id] ?? draftOf(id);
        next[id] = { ...d, [kind]: all ? d[kind].filter(l => l !== label) : d[kind].includes(label) ? d[kind] : [...d[kind], label] };
      });
      return next;
    });
  };
  const lastWeek = (previous.data ?? []).filter(p => byId.has(p.student_id) && ((p.going_well_chips?.length ?? 0) + (p.work_on_chips?.length ?? 0)) > 0);
  const sameAsLastWeek = () => !busy.current && setDrafts(x => {
    const next = { ...x };
    lastWeek.forEach(p => {
      const d = next[p.student_id] ?? draftOf(p.student_id);
      next[p.student_id] = { ...d,
        going_well: [...d.going_well, ...(p.going_well_chips ?? []).filter(l => !d.going_well.includes(l))],
        work_on: [...d.work_on, ...(p.work_on_chips ?? []).filter(l => !d.work_on.includes(l))] };
    });
    return next;
  });

  const save = useMutation({
    mutationFn: async (share: boolean) => {
      // The screen started from what was saved, so each item is the whole new state.
      const items = changed.map(([student_id, d]) => ({ student_id, going_well: d.going_well, work_on: d.work_on, note: d.note,
        work_on_note: d.work_on_note, work_on_resource_id: d.resource, replace: true,
        skills: Object.entries(d.skills).map(([skill_id, level]) => ({ skill_id, level })) }));
      const edits = changed.filter(([id]) => byId.get(id)?.shared).length;
      // Exactly what is being sent: anything typed after this stays a draft (round 2: an edit was lost once).
      const sent: Record<string, Draft> = Object.fromEntries(changed);
      return runAs(session, async q => {
        const [r] = await q<{ n: number }>(P.SAVE_CLASS_FEEDBACK, [sessionId, JSON.stringify(items), false]);
        if (share) await q(P.SHARE_SESSION_FEEDBACK, [sessionId]);
        return { n: r?.n ?? 0, share, edits, sent };
      });
    },
    onSuccess: async ({ n, share, edits, sent }) => {
      const drafts = sent;
      // Show the new state at once rather than "0 of 12" until a refetch lands (teachers D9).
      qc.setQueriesData<P.FeedbackKid[]>({ predicate: q => q.queryKey.includes('session-feedback') && q.queryKey.includes(sessionId) },
        old => old?.map(k => {
          const d = drafts[k.student_id];
          const has = d ? (d.going_well.length || d.work_on.length || d.note.trim() || d.work_on_note.trim()) : (k.going_well || k.work_on);
          const nk = d ? { ...k, going_well_chips: d.going_well, work_on_chips: d.work_on, note: d.note, work_on_note: d.work_on_note,
            work_on_resource_id: d.resource, going_well: has ? (k.going_well ?? '…') : null, work_on: d.work_on.length || d.work_on_note ? (k.work_on ?? '…') : null } : k;
          return share && has ? { ...nk, shared: true } : nk;
        }));
      // Clear only the drafts that went; a change made meanwhile is kept.
      setDrafts(x => Object.fromEntries(Object.entries(x).filter(([id, d]) => sent[id] !== d)));
      setOpen(null); setPicked(new Set());
      setDone(share ? 'Families can see it now, and have been told.'
        : edits && edits === n ? `Saved. Families see the change, marked as edited.`
        : `${n - edits} draft${n - edits === 1 ? '' : 's'} saved. Nothing new is shared yet.${edits ? ` ${edits} shared note${edits === 1 ? '' : 's'} updated, marked as edited.` : ''}`);
      await qc.invalidateQueries({ queryKey: ['db'] });
    },
  });
  busy.current = save.isPending;
  const drafted = (kids.data ?? []).filter(k => byId.has(k.student_id) && (k.going_well || k.work_on)).length;
  const shared = (kids.data ?? []).filter(k => byId.has(k.student_id) && k.shared).length;
  const unshared = (kids.data ?? []).filter(k => (k.going_well || k.work_on) && !k.shared).length;
  const allPicked = list.length > 0 && list.every(k => picked.has(k.student_id));
  const chipList = (kind: Kind) => (chips.data ?? []).filter(c => c.kind === kind);

  return (
    <Shell title={m ? m.name : 'Class feedback'} subtitle={m ? `Feedback · ${dateLong(m.starts_at)} · ${time(m.starts_at)}` : undefined}
      allow={['owner', 'admin', 'teacher']}
      actions={<Link href={`/teach/register/?session=${sessionId}`} aria-label="Back to the register"
        className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><ArrowLeft className="size-5" aria-hidden /></Link>}>
      <div className="mx-auto max-w-2xl space-y-6">
        {done && <div role="status"><StatusLine live={false} title={done} /></div>}
        {save.error != null && <ErrorState error={save.error} />}
        {kids.isLoading && <Skeleton className="h-40" />}
        {kids.data && list.length === 0 && <EmptyState title="Nobody to give feedback to" body="Take the register first. Feedback is for the children who were there."
          action={<Link href={`/teach/register/?session=${sessionId}`}><Button tabIndex={-1}>Open register</Button></Link>} />}

        {list.length > 0 && (
          <section aria-labelledby="fb-h">
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id="fb-h" className="section-title flex-1">Tap a child, or select several</h2>
              <span className="tnum text-[0.8125rem] text-ink-3">{drafted} of {list.length} done{shared ? ` · ${shared} shared` : ''}</span>
              <Beats value={drafted} max={list.length} label={`${drafted} of ${list.length} have feedback`} />
            </div>

            <fieldset disabled={save.isPending} className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">Feedback for each child</legend>
            {save.isPending && (
              <p role="status" className="pt-3 text-[0.8125rem] font-semibold text-ink-2">
                {save.variables ? 'Sharing with families…' : 'Saving…'} Editing waits until it has gone.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 py-3">
              <Button size="sm" aria-pressed={allPicked} onClick={() => setPicked(allPicked ? new Set() : new Set(list.map(k => k.student_id)))}>
                {allPicked ? <><X className="size-4" aria-hidden /> Clear selection</> : <><Check className="size-4" aria-hidden /> Select all {list.length}</>}
              </Button>
              {lastWeek.length > 0 && (
                <Button size="sm" onClick={sameAsLastWeek}>Same as last week</Button>
              )}
              {lastWeek.length > 0 && <span className="text-[0.8125rem] text-ink-3">{lastWeek.length} had phrases on {dateShort(previous.data![0]!.starts_at)}</span>}
            </div>

            {picked.size > 0 && (
              <div className="space-y-3 border-y border-line bg-surface-2/50 px-3 py-3" role="region" aria-label="Phrases for the selected children">
                <p className="text-[0.875rem] font-semibold">For {picked.size === list.length ? `all ${picked.size}` : `${picked.size} selected`}</p>
                {(['going_well', 'work_on'] as const).map(kind => (
                  <ChipRow key={kind} kind={kind} chips={chipList(kind)}
                    on={label => [...picked].every(id => draftOf(id)[kind].includes(label))}
                    onTap={label => applyToPicked(kind, label)} />
                ))}
              </div>
            )}

            <ul className="divide-y divide-line">
              {list.map(k => {
                const d = draftOf(k.student_id);
                const isOpen = open === k.student_id;
                const dirty = !!drafts[k.student_id] && !same(drafts[k.student_id]!, saved(k));
                const state = dirty ? ['Not saved yet', 'text-accent-text font-semibold'] : k.shared ? [k.edited_at ? 'Shared · edited' : 'Shared', 'text-positive font-semibold']
                  : (k.going_well || k.work_on) ? ['Draft', 'text-ink-2'] : null;
                const summary = [...d.going_well, ...d.work_on].join(', ');
                return (
                  <li key={k.student_id} className="flex items-start gap-1">
                    <label className="grid min-h-14 w-11 shrink-0 cursor-pointer place-items-center">
                      <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={picked.has(k.student_id)}
                        aria-label={`Select ${k.first_name} ${k.last_name}`}
                        onChange={() => setPicked(p => { const n = new Set(p); if (n.has(k.student_id)) n.delete(k.student_id); else n.add(k.student_id); return n; })} />
                    </label>
                    <div className="min-w-0 flex-1">
                      <button className="flex min-h-14 w-full items-center gap-3 py-3 text-left hover:bg-surface-2/60"
                              aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k.student_id)}>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[1rem] font-semibold">{k.first_name} {k.last_name}
                            {k.visiting && <span className="ml-2 rounded-[var(--radius-sm)] bg-peach-soft px-1.5 py-px text-[0.75rem] font-semibold text-ink">{k.visiting === 'trial' ? 'Trial' : 'Drop-in'}</span>}
                          </span>
                          {summary && !isOpen && <span className="block truncate text-[0.8125rem] text-ink-3">{summary}</span>}
                        </span>
                        {state && <span className={cn('text-[0.8125rem]', state[1])}>{state[0]}</span>}
                        <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                      </button>
                      {isOpen && (
                        <div className="space-y-4 pb-5 pr-1">
                          <LastFeedback studentId={k.student_id} exceptSession={sessionId} name={k.first_name} />
                          {(['going_well', 'work_on'] as const).map(kind => (
                            <ChipRow key={kind} kind={kind} chips={chipList(kind)} on={label => d[kind].includes(label)}
                              onTap={label => toggle(k.student_id, kind, label)} />
                          ))}
                          <Input aria-label={`Going well, in your words, for ${k.first_name}`} placeholder="Going well, in your words (optional)" value={d.note}
                                 onChange={e => upd(k.student_id, x => ({ ...x, note: e.target.value }))} />
                          <Input aria-label={`To work on, in your words, for ${k.first_name}`} placeholder="To work on, in your words (optional)" value={d.work_on_note}
                                 onChange={e => upd(k.student_id, x => ({ ...x, work_on_note: e.target.value }))} />
                          {!!resources.data?.length && (
                            <select aria-label={`Class material for ${k.first_name} to practise with`} value={d.resource ?? ''}
                              onChange={e => upd(k.student_id, x => ({ ...x, resource: e.target.value || null }))}
                              className="h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.875rem]">
                              <option value="">Link “to work on” to class material (optional)</option>
                              {resources.data.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                          )}
                          {depth !== 'notes' && (
                            <SkillPicker studentId={k.student_id} value={d.skills}
                                         onChange={sk => upd(k.student_id, x => ({ ...x, skills: sk }))} />
                          )}
                          {k.shared && <p className="text-[0.8125rem] text-ink-3">Already shared. If you change it, the family sees it marked as edited.</p>}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            </fieldset>
          </section>
        )}

        {list.length > 0 && (
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button className="sm:flex-1" size="lg" disabled={!changed.length} loading={save.isPending && save.variables === false} onClick={() => save.mutate(false)}>
                Save {changed.length || ''} draft{changed.length === 1 ? '' : 's'}
              </Button>
              <Button className="sm:flex-1" size="lg" variant="primary" disabled={!changed.length && !unshared} loading={save.isPending && save.variables === true}
                      onClick={() => save.mutate(true)}>
                Share with families
              </Button>
            </div>
            <p className="text-[0.8125rem] text-ink-3">Nothing reaches a family until you share.{unshared ? ` ${unshared} saved draft${unshared === 1 ? '' : 's'} waiting.` : ''}</p>
          </div>
        )}

        {classId && <ClassSettings classId={classId} chips={chips.data ?? []} depthRow={depthRow.data?.[0]} />}
      </div>
    </Shell>
  );
}

function ChipRow({ kind, chips, on, onTap }: { kind: Kind; chips: P.ClassChip[]; on: (label: string) => boolean; onTap: (label: string) => void }) {
  return (
    <div>
      <p aria-hidden className="mb-1.5 text-[0.8125rem] font-semibold text-ink-2">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
      <Choice multiple label={kind === 'going_well' ? 'Going well' : 'To work on'} value={chips.filter(c => on(c.label)).map(c => c.label)}
        onChange={next => { const t = chips.find(c => next.includes(c.label) !== on(c.label)); if (t) onTap(t.label); }}
        options={chips.map(c => ({ value: c.label, label: <>{c.sticker && <span aria-hidden className="mr-1.5">{c.sticker}</span>}{c.label}</> }))} />
    </div>
  );
}

/** One optional skill change per child, in two taps. Only the styles this teacher teaches the child (D11). */
function SkillPicker({ studentId, value, onChange }: { studentId: string; value: Record<string, P.Level>; onChange: (v: Record<string, P.Level>) => void }) {
  const skills = useRows<P.SkillRow>(['skills', studentId], P.STUDENT_SKILLS, [studentId]);
  const [skill, setSkill] = React.useState('');
  if (!skills.data?.length) return null;
  const cur = skills.data.find(s => s.skill_id === skill);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select aria-label="Skill" value={skill} onChange={e => setSkill(e.target.value)}
        className="h-10 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[0.875rem]">
        <option value="">Move a skill on…</option>
        {skills.data.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill}{s.level ? ` (${P.LEVELS.find(l => l.key === s.level)?.label})` : ''}</option>)}
      </select>
      {cur && <Choice label={`${cur.skill}: new level`} value={value[cur.skill_id] ?? null}
        onChange={v => onChange({ ...value, [cur.skill_id]: v })}
        options={P.LEVELS.slice(1).map(l => ({ value: l.key, label: l.label }))} />}
    </div>
  );
}

/** The class's own phrases (UR-44) and how deeply it tracks progress (UR-55). */
function ClassSettings({ classId, chips, depthRow }: { classId: string; chips: P.ClassChip[];
  depthRow?: { depth: P.Depth; tracking_depth: P.Depth | null; default_depth: P.Depth; age_min: number | null; age_max: number | null } }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const write = useMutation({
    mutationFn: (v: { sql: string; params: unknown[] }) => runAs(session, q => q(v.sql, v.params)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  const [adding, setAdding] = React.useState<Record<Kind, string>>({ going_well: '', work_on: '' });
  const own = chips.some(c => c.own);
  const ages = depthRow && (depthRow.age_min != null || depthRow.age_max != null) ? `ages ${depthRow.age_min ?? ''}–${depthRow.age_max ?? ''}` : 'this class';
  return (
    <details className="group border-t border-line pt-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span className="section-title flex-1">Phrases and tracking for this class</span>
        <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-6 pb-4 pt-2">
        {write.error != null && <ErrorState error={write.error} />}
        <fieldset>
          <legend className="mb-1 text-[0.875rem] font-semibold">How much to track</legend>
          <p className="mb-2 text-[0.8125rem] text-ink-3">The default for {ages} is {P.DEPTHS.find(d => d.key === depthRow?.default_depth)?.label.toLowerCase()}.</p>
          <div className="space-y-1">
            {P.DEPTHS.map(d => (
              <label key={d.key} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
                <input type="radio" name="depth" className="mt-1 size-4 accent-[var(--color-accent)]" checked={depthRow?.depth === d.key}
                  onChange={() => write.mutate({ sql: P.SET_CLASS_DEPTH, params: [classId, d.key === depthRow?.default_depth ? null : d.key] })} />
                <span><span className="block text-[0.9375rem] font-medium">{d.label}</span><span className="block text-[0.8125rem] text-ink-3">{d.hint}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="text-[0.875rem] font-semibold">Phrases</p>
          <p className="mb-2 text-[0.8125rem] text-ink-3">{own ? 'Your own set for this class.' : 'The school’s set for this age. Change one and the class gets its own copy.'}</p>
          {(['going_well', 'work_on'] as const).map(kind => (
            <div key={kind} className="mb-3">
              <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink-2">{kind === 'going_well' ? 'Going well' : 'To work on'}</p>
              <div className="flex flex-wrap gap-1.5">
                {chips.filter(c => c.kind === kind).map(c => (
                  <span key={c.id} className="inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]">
                    {c.sticker && <span aria-hidden className="mr-1">{c.sticker}</span>}{c.label}
                    <button aria-label={`Remove ${c.label}`} onClick={() => write.mutate({ sql: P.REMOVE_CLASS_CHIP, params: [classId, kind, c.label] })}
                      className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical"><X className="size-3.5" aria-hidden /></button>
                  </span>
                ))}
              </div>
              <form className="mt-2 flex gap-1.5" onSubmit={e => { e.preventDefault(); const v = adding[kind].trim();
                if (v.length >= 2) { write.mutate({ sql: P.ADD_CLASS_CHIP, params: [classId, kind, v, null] }); setAdding(a => ({ ...a, [kind]: '' })); } }}>
                <Input aria-label={`Add a ${kind === 'going_well' ? 'going well' : 'to work on'} phrase for this class`} placeholder="Add a phrase" maxLength={40}
                       value={adding[kind]} onChange={e => setAdding(a => ({ ...a, [kind]: e.target.value }))} className="h-10 text-[0.875rem]" />
                <Button type="submit" aria-label="Add"><Plus className="size-4" aria-hidden /></Button>
              </form>
            </div>
          ))}
          {own && <Button size="sm" variant="ghost" onClick={() => write.mutate({ sql: P.RESET_CLASS_CHIPS, params: [classId] })}>Go back to the school’s phrases</Button>}
        </div>
      </div>
    </details>
  );
}
