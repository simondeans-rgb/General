'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ResourceRow } from '@/components/app/resource-row';
import { ClassNotices } from '@/components/app/class-notices';
import { useRow, useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Beats, Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton, Spinner,
} from '@/components/ui';
import { SectionHead, StyleMark, ViewTabs } from '@/components/app/session-row';
import * as H from '@/lib/repos/hub';
import { storage, formatBytes, kindForFile, probeDuration } from '@/lib/storage';
import { cn } from '@/lib/cn';
import { ChildrenQuestion, consentKindFor, saveChildren } from '@/components/app/media-children';


const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** `time` columns come back as 'HH:MM:SS'. */
const clock = (t: string | null) => (t ? t.slice(0, 5) : '');

export default function ClassPage() {
  // useSearchParams needs a boundary in a statically exported app.
  return <Suspense fallback={<div className="min-h-dvh" />}><ClassView /></Suspense>;
}

function ClassView() {
  const id = useSearchParams().get('id') ?? '';
  const { session } = useSession();
  const detail = useRow<H.ClassDetail>(['class', id], H.CLASS_DETAIL, [id]);
  const [adding, setAdding] = React.useState(false);

  const c = detail.data;
  // Who may add material: the teacher taking the class, and the office. The
  // database says the same thing — this only decides whether to show the
  // button, and a wrong answer here is refused a statement later.
  const isOffice = session?.role === 'owner' || session?.role === 'admin';
  const canAdd = !!c && (c.i_teach || isOffice);

  return (
    <Shell
      title={c?.name ?? 'Class'}
      subtitle={c ? [c.level, c.term_name].filter(Boolean).join(' · ') || undefined : undefined}
      allow={['owner', 'admin', 'teacher', 'guardian', 'student']}
      actions={canAdd
        ? <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
            <Upload className="size-4" aria-hidden /> Add material
          </Button>
        : undefined}
    >
      <div className="mx-auto max-w-2xl space-y-10">
        {detail.isLoading && <Skeleton className="h-32" />}
        {detail.error && <ErrorState error={detail.error} onRetry={() => detail.refetch()} />}

        {!detail.isLoading && !c && !detail.error && (
          <EmptyState title="Class not found"
            body="It has been removed, or it isn’t one of yours." />
        )}

        {c && <Summary c={c} />}
        {c && <ClassNotices classId={id} className={c.name} canPost={canAdd} />}
        {c && <Material classId={id} canAdd={canAdd} isOffice={isOffice} />}
      </div>

      {adding && c && (
        <AddMaterial classId={id} className={c.name} isOffice={isOffice} onClose={() => setAdding(false)} />
      )}
    </Shell>
  );
}

/* ── The class itself ──────────────────────────────────────────────────── */
function Summary({ c }: { c: H.ClassDetail }) {
  const where = [c.location, c.room].filter(Boolean).join(' · ');
  return (
    <section aria-labelledby="class-when">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8438rem] text-ink-3">
        {c.style && <StyleMark colour={c.colour} name={c.style} />}
        {c.level && <span>{c.level}</span>}
        {c.i_teach && <span className="font-semibold text-ink">You teach this</span>}
      </p>
      <p id="class-when" className="mt-2 flex flex-wrap items-baseline gap-x-3">
        <span className="font-display text-[2.5rem] leading-none tnum">{clock(c.start_time)}</span>
        <span className="text-[0.9375rem] font-semibold">{DAYS[c.day_of_week] ?? ''}s · {c.duration_min} min</span>
      </p>
      {c.description && <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-2">{c.description}</p>}

      <dl className="mt-5 divide-y divide-line border-y border-line text-[0.875rem]">
        {where && <Fact label="Where" value={where} />}
        {c.teacher && <Fact label="Taught by"
              value={[c.teacher, c.assistant && `with ${c.assistant}`].filter(Boolean).join(' ')} />}
        <Fact label="Dancers" value={<span className="flex items-center gap-2">
          <Beats value={c.enrolled} max={c.capacity} label={`${c.enrolled} of ${c.capacity} places`} />
          <span className="tnum">{c.enrolled} of {c.capacity}</span></span>} />
      </dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2.5">
      <dt className="w-24 shrink-0 text-ink-3">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{value}</dd>
    </div>
  );
}

/* ── Material attached to the class ────────────────────────────────────── */
function Material({ classId, canAdd, isOffice }: {
  classId: string; canAdd: boolean; isOffice: boolean;
}) {
  const rows = useRows<H.ClassResource>(['class-resources', classId], H.CLASS_RESOURCES, [classId]);
  const pinned = (rows.data ?? []).filter(r => !r.scope_label);
  const studioWide = (rows.data ?? []).filter(r => !!r.scope_label);

  return (
    <>
      <section>
        <SectionHead title="For this class"
          meta={pinned.length === 0 ? undefined : `${pinned.length} item${pinned.length === 1 ? '' : 's'}`} />
        {rows.isPending && <div className="space-y-3 pt-3">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error && <div className="pt-3"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
        {!rows.isPending && pinned.length === 0 && (
          <EmptyState title="Nothing shared yet"
            body={canAdd
              ? 'Add a routine video, the music for this term, or a handout — everyone in this class will see it.'
              : 'Your teacher has not shared anything for this class yet.'} />
        )}
        {pinned.length > 0 && (
          <ul className="divide-y divide-line">
            {pinned.map(r => (
              <ResourceRow key={r.id} r={r} canManage={isOffice || (canAdd && r.mine)}
                           classId={classId} isOffice={isOffice} />
            ))}
          </ul>
        )}
      </section>

      {studioWide.length > 0 && (
        <section>
          <SectionHead title="From the studio" meta="Shared with everyone" />
          <ul className="divide-y divide-line">
            {studioWide.map(r => <ResourceRow key={r.id} r={r} canManage={isOffice} classId={classId} isOffice={isOffice} />)}
          </ul>
        </section>
      )}
    </>
  );
}

/* ── Teacher: add material ─────────────────────────────────────────────── */
type Mode = 'file' | 'link';

function AddMaterial({ classId, className, isOffice, onClose }: {
  classId: string; className: string; isOffice: boolean; onClose: () => void;
}) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [mode, setMode] = React.useState<Mode>('file');
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [linkKind, setLinkKind] = React.useState<'video' | 'audio' | 'link'>('video');
  const [url, setUrl] = React.useState('');
  const [forStudents, setForStudents] = React.useState(true);
  const [forGuardians, setForGuardians] = React.useState(true);
  const [done, setDone] = React.useState(false);
  // Media of children (0057): asked for every video or photo upload.
  const [shows, setShows] = React.useState<boolean | null>(null);
  const [children, setChildren] = React.useState<string[]>([]);
  const [noneIdentifiable, setNoneIdentifiable] = React.useState(false);
  const [allStaff, setAllStaff] = React.useState(false);

  const fileKind = file ? kindForFile(file) : null;
  const isPhoto = !!file && (file.type || '').startsWith('image/');
  const isMedia = mode === 'file' ? fileKind === 'video' || isPhoto : linkKind === 'video';
  const kind = mode === 'file' ? (fileKind ?? 'document') : linkKind;
  // A link defaults to "no children"; an upload has to answer.
  const showsAnswer = isMedia ? (mode === 'link' ? (shows ?? false) : shows) : false;

  const pick = (f: File | null) => {
    setFile(f);
    if (f && !title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const save = useMutation({
    mutationFn: async () => {
      const kind = mode === 'file' ? kindForFile(file!) : linkKind;
      const duration = mode === 'file' ? await probeDuration(file!) : null;

      // One transaction: the resource, its bytes and its place in this class
      // either all land or none of them do.
      return runAs(session, async q => {
        const [created] = await q<{ id: string; studio_id: string }>(H.CREATE_RESOURCE, [
          classId, kind, title.trim(), description.trim() || null, category.trim() || null,
          mode === 'link' ? url.trim() : null, duration, forStudents, forGuardians,
          !!showsAnswer, isOffice && allStaff,
        ]);
        if (!created) throw new Error('You cannot add material to this class.');
        if (showsAnswer) {
          await saveChildren(q, created.id, children);
          if (isOffice && noneIdentifiable && children.length === 0) {
            await q(H.UPDATE_RESOURCE_MEDIA, [created.id, true, true, allStaff]);
          }
        }

        if (mode === 'file') {
          await storage.upload(file!, { q, resourceId: created.id, studioId: created.studio_id });
        }
        await q(H.ASSIGN_RESOURCE_TO_CLASS, [classId, created.id]);
        return created.id;
      });
    },
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const tooBig = !!file && file.size > storage.maxBytes;
  const valid = title.trim().length >= 2 && (!isMedia || showsAnswer !== null) && (
    mode === 'file' ? !!file && !tooBig : /^https?:\/\/\S+$/.test(url.trim()));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="add-material-t" onClick={e => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)]
                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <>
            <div className="px-5 py-6">
              <h2 id="add-material-t" className="sr-only">Shared with {className}</h2>
              <Notice word="Shared" tone="positive" title={`Shared with ${className}`}
                detail="Everyone in the class finds it when they open this class from their timetable." />
            </div>
            <div className="flex border-t border-line px-5 py-3 pb-safe sm:justify-end">
              <Button className="w-full sm:w-auto" variant="primary" onClick={onClose}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
              <div className="min-w-0 flex-1">
                <h2 id="add-material-t" className="font-display text-[1.25rem] leading-tight">Add material</h2>
                <p className="mt-1 text-[0.8438rem] text-ink-3">Goes to everyone in {className}.</p>
              </div>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1">
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
              <ViewTabs label="Kind of material" value={mode} onChange={setMode}
                options={[['file', 'Upload a file'], ['link', 'Add a link']]} />
              {mode === 'file' ? (
                <Field label="File" htmlFor="material-file" required
                       error={tooBig ? `That file is ${formatBytes(file!.size)} — the limit is ${formatBytes(storage.maxBytes)}.` : undefined}
                       hint={`Video, music or a document. Stored in ${storage.label}, up to ${formatBytes(storage.maxBytes)}.`}>
                  <input id="material-file" type="file"
                         accept="video/*,audio/*,.pdf,.doc,.docx,image/*"
                         onChange={e => pick(e.target.files?.[0] ?? null)}
                         className="block w-full text-sm text-ink-2 file:mr-3 file:h-10 file:rounded-[var(--radius-md)]
                                    file:border file:border-line-strong file:bg-surface file:px-3.5
                                    file:text-sm file:font-medium file:text-ink hover:file:bg-surface-2" />
                </Field>
              ) : (
                <>
                  <Field label="What kind of thing is it" htmlFor="material-kind">
                    <Select id="material-kind" value={linkKind} onChange={e => setLinkKind(e.target.value as any)}>
                      <option value="video">A video</option>
                      <option value="audio">Music or a track</option>
                      <option value="link">A page or document</option>
                    </Select>
                  </Field>
                  <Field label="Link" htmlFor="material-url" required hint="Starts with https://">
                    <Input id="material-url" type="url" inputMode="url" value={url}
                           onChange={e => setUrl(e.target.value)} placeholder="https://" />
                  </Field>
                </>
              )}

              <Field label="Title" htmlFor="material-title" required>
                <Input id="material-title" value={title} onChange={e => setTitle(e.target.value)}
                       placeholder="Group routine — counts 1 to 32" />
              </Field>
              <Field label="Category" htmlFor="material-category" hint="Optional. Groups it in the library.">
                <Input id="material-category" value={category} onChange={e => setCategory(e.target.value)}
                       placeholder="Exam music, Technique, Uniform…" />
              </Field>
              <Field label="Note" htmlFor="material-note" hint="Optional. What should they do with it?">
                <textarea id="material-note" rows={2} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Practise the first eight before Thursday."
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>

              {isMedia && (
                <ChildrenQuestion classId={classId} resourceId={null} consentKind={consentKindFor(kind)}
                  shows={showsAnswer} onShows={setShows} picked={children} onPicked={setChildren}
                  isOffice={isOffice} noneIdentifiable={noneIdentifiable} onNoneIdentifiable={setNoneIdentifiable}
                  required={mode === 'file'} />
              )}
              {isMedia && mode === 'link' && showsAnswer && (
                <p className="text-[0.8125rem] text-caution">
                  A link is only as private as the site it points to. For a video of children, upload the file instead.
                </p>
              )}

              <fieldset>
                <legend className="mb-1 text-[0.8125rem] font-medium text-ink-2">Who can see it</legend>
                <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
                  <input type="checkbox" checked={forStudents} className="size-[18px] accent-[var(--color-accent)]"
                         onChange={e => setForStudents(e.target.checked)} />
                  Students in this class
                </label>
                <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
                  <input type="checkbox" checked={forGuardians} className="size-[18px] accent-[var(--color-accent)]"
                         onChange={e => setForGuardians(e.target.checked)} />
                  Their parents
                </label>
                {isOffice && (
                  <label className="flex min-h-[44px] items-center gap-3 text-[0.875rem]">
                    <input type="checkbox" checked={allStaff} className="size-[18px] accent-[var(--color-accent)]"
                           onChange={e => setAllStaff(e.target.checked)} />
                    All staff, not only this class’s teachers
                  </label>
                )}
                <p className="mt-1 text-[0.7812rem] text-ink-3">
                  Untick both and it stays visible to staff only.
                </p>
              </fieldset>

              {save.isError && <ErrorState error={save.error} />}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end">
              {save.isPending && mode === 'file' && (
                <p className="flex w-full items-center gap-2 text-[0.7812rem] text-ink-3 sm:mr-auto sm:w-auto">
                  <Spinner className="size-3" /> Storing the file…
                </p>
              )}
              <Button className="flex-1 sm:flex-none" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button className="flex-[2] sm:flex-none" variant="primary" disabled={!valid}
                      loading={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? 'Sharing' : 'Share'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
