'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, ErrorState, Notice, Skeleton, Word, StatusLine } from '@/components/ui';
import { useRows } from '@/lib/query';
import { runAs, type Query } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import * as H from '@/lib/repos/hub';

/**
 * Media that shows children (0057).
 *
 * The rule lives in the database: families and students see a resource that
 * shows named children only while every one of them has the matching consent.
 * These pieces only ask the question, name the children, and tell staff why
 * something is hidden.
 */

export type ConsentKind = 'video' | 'photography';

/** Video and audio need video consent; photos and documents need photography. */
export const consentKindFor = (kind: H.Resource['kind']): ConsentKind =>
  kind === 'video' || kind === 'audio' ? 'video' : 'photography';

const CONSENT_NAME: Record<ConsentKind, string> = { video: 'video', photography: 'photo' };

function ConsentWord({ value, kind }: { value: boolean | null; kind: ConsentKind }) {
  const label = `${CONSENT_NAME[kind]} consent: `;
  if (value === true) return <Word tone="positive"><span className="sr-only">{label}</span>Given</Word>;
  if (value === false) return <Word tone="critical"><span className="sr-only">{label}</span>Withdrawn</Word>;
  return <Word tone="caution"><span className="sr-only">{label}</span>Not recorded</Word>;
}

/** "Does this show children?" and, if so, who. Limited to the class's children. */
export function ChildrenQuestion({
  classId, resourceId, consentKind, shows, onShows, picked, onPicked,
  isOffice, noneIdentifiable, onNoneIdentifiable, lockedYes, required,
}: {
  classId: string; resourceId: string | null; consentKind: ConsentKind;
  shows: boolean | null; onShows: (v: boolean) => void;
  picked: string[]; onPicked: (ids: string[]) => void;
  isOffice: boolean; noneIdentifiable: boolean; onNoneIdentifiable: (v: boolean) => void;
  /** A teacher cannot take back "shows children" once it is set. */
  lockedYes?: boolean; required?: boolean;
}) {
  const kids = useRows<H.ChildConsent>(['class-children-consent', classId, resourceId ?? ''],
    H.CLASS_CHILDREN_CONSENT, [classId, resourceId], { enabled: shows === true });
  const toggle = (id: string, on: boolean) =>
    onPicked(on ? [...new Set([...picked, id])] : picked.filter(x => x !== id));
  const list = kids.data ?? [];
  const missing = list.filter(k => picked.includes(k.id) && (consentKind === 'video' ? k.video : k.photo) !== true).length;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-[0.8125rem] font-medium text-ink-2">
        Does this show children?{required && <span className="text-critical"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-x-6">
        <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
          <input type="radio" name="shows-children" checked={shows === true} onChange={() => onShows(true)}
                 className="size-[18px] accent-[var(--color-accent)]" />
          Yes, children can be seen
        </label>
        <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
          <input type="radio" name="shows-children" checked={shows === false} disabled={lockedYes}
                 onChange={() => onShows(false)} className="size-[18px] accent-[var(--color-accent)]" />
          No children in it
        </label>
      </div>
      {lockedYes && (
        <p className="text-[0.7812rem] text-ink-3">Only the office can change this back once it is set.</p>
      )}

      {shows === true && (
        <div className="space-y-2 border-l-2 border-line pl-3">
          <p className="text-[0.8125rem] text-ink-2">
            Who is in it? Families see it only while every child named has {CONSENT_NAME[consentKind]} consent.
          </p>
          {kids.isLoading && <Skeleton className="h-20" />}
          {kids.error != null && <ErrorState error={kids.error} />}
          {kids.isSuccess && list.length === 0 && (
            <p className="text-[0.8125rem] text-ink-3">No children in this class yet.</p>
          )}
          {list.length > 0 && (
            <ul className="divide-y divide-line" aria-label="Children in this class">
              {list.map(k => (
                <li key={k.id}>
                  <label className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-[0.875rem]">
                    <input type="checkbox" checked={picked.includes(k.id)}
                           onChange={e => toggle(k.id, e.target.checked)}
                           className="size-[18px] accent-[var(--color-accent)]" />
                    <span className="min-w-0 flex-1 font-medium">
                      {k.name}{!k.in_class && <span className="font-normal text-ink-3"> · not in this class now</span>}
                    </span>
                    <ConsentWord value={consentKind === 'video' ? k.video : k.photo} kind={consentKind} />
                  </label>
                </li>
              ))}
            </ul>
          )}
          {picked.length === 0 && (
            isOffice ? (
              <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
                <input type="checkbox" checked={noneIdentifiable} onChange={e => onNoneIdentifiable(e.target.checked)}
                       className="size-[18px] accent-[var(--color-accent)]" />
                No child can be identified in it (backs, silhouettes, far away)
              </label>
            ) : (
              <p className="text-[0.7812rem] text-ink-3">
                With nobody named it stays with staff until you name the children, or the office confirms none can be identified.
              </p>
            )
          )}
          {missing > 0 && (
            <p className="text-[0.8125rem] font-semibold text-caution">
              Staff only for now: {missing} {missing === 1 ? 'child has' : 'children have'} no {CONSENT_NAME[consentKind]} consent yet.
              You can ask their families once it is saved.
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}

/** Save who is named, inside the caller's transaction. */
export async function saveChildren(q: Query, resourceId: string, ids: string[]) {
  await q(H.CLEAR_RESOURCE_CHILDREN, [resourceId, ids]);
  if (ids.length) await q(H.ADD_RESOURCE_CHILDREN, [resourceId, ids]);
}

/** For staff: why families cannot see this, in one line. */
export function HiddenFromFamilies({ r }: { r: H.Resource }) {
  if (!r.shows_children || r.family_visible !== false) return null;
  const n = r.without_consent ?? 0;
  const title = r.needs_names
    ? 'Hidden from families: nobody named yet'
    : `Hidden from families: no consent yet for ${n} ${n === 1 ? 'child' : 'children'}`;
  const detail = r.needs_names
    ? 'Name the children in it, or the office can confirm none can be identified.'
    : 'It shows again on its own once every named child has consent.';
  return <Notice className="mt-2" word="Limited" tone="caution" title={title} detail={detail} />;
}

/** Edit the children in a piece of material already shared. */
export function EditChildren({ r, classId, isOffice, onClose }: {
  r: H.Resource & { mine?: boolean }; classId: string; isOffice: boolean; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const kind = consentKindFor(r.kind);
  const named = useRows<H.ChildConsent>(['class-children-consent', classId, r.id], H.CLASS_CHILDREN_CONSENT, [classId, r.id]);
  const [shows, setShows] = React.useState<boolean | null>(r.shows_children ?? false);
  const [picked, setPicked] = React.useState<string[] | null>(null);
  const [none, setNone] = React.useState(!!r.no_identifiable_children);
  const [allStaff, setAllStaff] = React.useState(!!r.for_all_staff);
  const current = picked ?? (named.data ?? []).filter(k => k.named).map(k => k.id);

  const save = useMutation({
    mutationFn: () => runAs(session, async q => {
      const [ok] = await q(H.UPDATE_RESOURCE_MEDIA, [r.id, !!shows, none && current.length === 0, allStaff]);
      if (!ok) throw new Error('You cannot change this material.');
      await saveChildren(q, r.id, shows ? current : []);
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="edit-children-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 id="edit-children-t" className="font-display text-[1.25rem] leading-tight">Who can see it</h2>
            <p className="mt-1 truncate text-[0.8438rem] text-ink-3">{r.title}</p>
          </div>
          <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1">
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          {named.isLoading ? <Skeleton className="h-24" /> : (
            <ChildrenQuestion classId={classId} resourceId={r.id} consentKind={kind}
              shows={shows} onShows={setShows} picked={current} onPicked={setPicked}
              isOffice={isOffice} noneIdentifiable={none} onNoneIdentifiable={setNone}
              lockedYes={!isOffice && !!r.shows_children} />
          )}
          {isOffice && (
            <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
              <input type="checkbox" checked={allStaff} onChange={e => setAllStaff(e.target.checked)}
                     className="size-[18px] accent-[var(--color-accent)]" />
              For all staff, not only this class’s teachers
            </label>
          )}
          {save.isError && <ErrorState error={save.error} />}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end">
          <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="flex-[2] sm:flex-none" variant="primary" loading={save.isPending}
                  disabled={named.isLoading} onClick={() => save.mutate()}>Save</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * After saving material: say what actually happened (round 2 panel, U14).
 * Shared with the class, or kept for staff until consent, with a way to ask
 * the families of the children named, in the app.
 */
export function SavedConfirmation({ resourceId, status, className, titleId }: {
  resourceId: string; status: H.ChildStatus | null; className: string; titleId: string;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const ask = useMutation({
    mutationFn: () => runAs(session, async q => (await q<H.ConsentAsk>(H.REQUEST_MEDIA_CONSENT, [resourceId]))[0]!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!status || status.family_visible) {
    return (
      <>
        <h2 id={titleId} className="sr-only">Shared with {className}</h2>
        <StatusLine title={`Shared with ${className}`}
          detail="Everyone in the class finds it when they open this class from their timetable." />
      </>
    );
  }
  const kind = status.consent_kind === 'video' ? 'video' : 'photo';
  const n = status.without_consent;
  const kids = (k: number) => `${k} ${k === 1 ? 'child' : 'children'}`;
  const title = status.needs_names ? 'Saved for staff only' : `Staff only — consent needed for ${kids(n)}`;
  const detail = status.needs_names
    ? 'Families see it once you name the children in it, or the office confirms none can be identified.'
    : `Families in ${className} see it once every child named has ${kind} consent. It shows on its own then.`;
  const r = ask.data;
  const fam = (k: number) => `${k} ${k === 1 ? 'family' : 'families'}`;
  return (
    <div className="space-y-4">
      <h2 id={titleId} className="sr-only">{title}</h2>
      <Notice word="Limited" tone="caution" title={title} detail={detail} />
      {!status.needs_names && n > 0 && !r && (
        <div className="space-y-1.5">
          <Button loading={ask.isPending} onClick={() => ask.mutate()}>Ask families for consent</Button>
          <p className="text-[0.8125rem] text-ink-3">
            Sends one message in the app to the families of the children with nothing recorded. Families who said no are not asked.
          </p>
        </div>
      )}
      {ask.error != null && <ErrorState error={ask.error} />}
      {r && (
        <p role="status" className="text-[0.875rem] text-ink-2">
          {r.asked > 0 ? `Asked ${fam(r.families)} in the app. ` : 'Nobody new to ask. '}
          {r.already_asked > 0 && `${kids(r.already_asked)} already asked in the last two weeks. `}
          {r.declined > 0 && `${kids(r.declined)}: the family said no, so they are not asked again. `}
          {r.unreachable > 0 && `${kids(r.unreachable)} with no one signed in to the app; the office can ask them.`}
        </p>
      )}
    </div>
  );
}
