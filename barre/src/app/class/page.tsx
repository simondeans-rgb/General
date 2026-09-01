'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Upload, MapPin, User, Users, FolderOpen, X, Check } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { ResourceRow } from '@/components/app/resource-row';
import { ClassNotices } from '@/components/app/class-notices';
import { useRow, useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, Select,
  Skeleton, Spinner, type Tone,
} from '@/components/ui';
import * as H from '@/lib/repos/hub';
import { storage, formatBytes, kindForFile, probeDuration } from '@/lib/storage';
import { cn } from '@/lib/cn';

const TONES: Record<string, Tone> = {
  violet:'violet', amber:'amber', teal:'teal', rose:'rose', indigo:'indigo', lime:'lime' };

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
      <div className="mx-auto max-w-2xl space-y-4">
        {detail.isLoading && <Card className="p-4"><Skeleton className="h-24" /></Card>}
        {detail.error && <ErrorState error={detail.error} onRetry={() => detail.refetch()} />}

        {!detail.isLoading && !c && !detail.error && (
          <Card><EmptyState icon={<Users className="size-5" />} title="Class not found"
            body="Either it has been removed, or it is not one of yours." /></Card>
        )}

        {c && <Summary c={c} />}
        {c && <ClassNotices classId={id} className={c.name} canPost={canAdd} />}
        {c && <Material classId={id} canAdd={canAdd} isOffice={isOffice} />}
      </div>

      {adding && c && (
        <AddMaterial classId={id} className={c.name} onClose={() => setAdding(false)} />
      )}
    </Shell>
  );
}

/* ── The class itself ──────────────────────────────────────────────────── */
function Summary({ c }: { c: H.ClassDetail }) {
  const where = [c.location, c.room].filter(Boolean).join(' · ');
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        {c.style && <Badge tone={TONES[c.colour ?? ''] ?? 'neutral'}>{c.style}</Badge>}
        {c.level && <Badge tone="neutral">{c.level}</Badge>}
        {c.i_teach && <Badge tone="accent">You teach this</Badge>}
      </div>
      <h2 className="mt-2 text-[19px] font-semibold tracking-tight">{c.name}</h2>
      {c.description && <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.description}</p>}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <Fact icon={<Clock className="size-3.5" />} label="When"
              value={`${DAYS[c.day_of_week] ?? ''} ${clock(c.start_time)} · ${c.duration_min} min`} />
        {where && <Fact icon={<MapPin className="size-3.5" />} label="Where" value={where} />}
        {c.teacher && <Fact icon={<User className="size-3.5" />} label="Taught by"
              value={[c.teacher, c.assistant && `with ${c.assistant}`].filter(Boolean).join(' ')} />}
        <Fact icon={<Users className="size-3.5" />} label="Dancers"
              value={`${c.enrolled} of ${c.capacity}`} />
      </dl>
    </Card>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-ink-3">{icon}{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
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
      <Card>
        <CardHeader title="For this class"
          subtitle={pinned.length === 0 ? undefined : `${pinned.length} item${pinned.length === 1 ? '' : 's'}`} />
        {rows.isPending && <div className="space-y-3 p-4">{[0,1].map(i => <Skeleton key={i} className="h-14" />)}</div>}
        {rows.error && <div className="p-4"><ErrorState error={rows.error} onRetry={() => rows.refetch()} /></div>}
        {!rows.isPending && pinned.length === 0 && (
          <EmptyState icon={<FolderOpen className="size-5" />} title="Nothing shared yet"
            body={canAdd
              ? 'Add a routine video, the music for this term, or a handout — everyone in this class will see it.'
              : 'Your teacher has not shared anything for this class yet.'} />
        )}
        {pinned.length > 0 && (
          <ul className="divide-y divide-line">
            {pinned.map(r => (
              <ResourceRow key={r.id} r={r} canManage={isOffice || (canAdd && r.mine)} />
            ))}
          </ul>
        )}
      </Card>

      {studioWide.length > 0 && (
        <Card>
          <CardHeader title="From the studio" subtitle="Shared with everyone" />
          <ul className="divide-y divide-line">
            {studioWide.map(r => <ResourceRow key={r.id} r={r} />)}
          </ul>
        </Card>
      )}
    </>
  );
}

/* ── Teacher: add material ─────────────────────────────────────────────── */
type Mode = 'file' | 'link';

function AddMaterial({ classId, className, onClose }: {
  classId: string; className: string; onClose: () => void;
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
        ]);
        if (!created) throw new Error('You cannot add material to this class.');

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
  const valid = title.trim().length >= 2 && (
    mode === 'file' ? !!file && !tooBig : /^https?:\/\/\S+$/.test(url.trim()));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="add-material-t" onClick={e => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]
                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]">
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive" aria-hidden>
              <Check className="size-5" />
            </span>
            <p id="add-material-t" className="font-medium">Shared with {className}</p>
            <p className="mt-1 text-sm text-ink-2">
              Everyone in the class will find it when they open this class from their timetable.
            </p>
            <Button className="mt-4 w-full" variant="primary" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 id="add-material-t" className="text-[17px] font-semibold tracking-tight">Add material</h2>
                <p className="mt-0.5 text-[13px] text-ink-2">Goes to everyone in {className}.</p>
              </div>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={onClose}>
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div role="tablist" aria-label="Kind of material"
                 className="mt-3 inline-flex rounded-[var(--radius-md)] border border-line bg-surface-2 p-0.5">
              {([['file','Upload a file'],['link','Add a link']] as [Mode, string][]).map(([m, label]) => (
                <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                  className={cn('min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium',
                    mode === m ? 'bg-surface text-ink shadow-xs' : 'text-ink-2 hover:text-ink')}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
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
                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12" />
              </Field>

              <fieldset className="rounded-[var(--radius-md)] border border-line p-3">
                <legend className="px-1 text-[13px] font-medium text-ink-2">Who can see it</legend>
                <label className="flex min-h-[36px] items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={forStudents} className="size-4 accent-[var(--accent)]"
                         onChange={e => setForStudents(e.target.checked)} />
                  Students in this class
                </label>
                <label className="flex min-h-[36px] items-center gap-2.5 text-sm">
                  <input type="checkbox" checked={forGuardians} className="size-4 accent-[var(--accent)]"
                         onChange={e => setForGuardians(e.target.checked)} />
                  Their parents
                </label>
                <p className="mt-1 text-[12.5px] text-ink-3">
                  Untick both and it stays visible to staff only.
                </p>
              </fieldset>
            </div>

            {save.isError && <div className="mt-3"><ErrorState error={save.error} /></div>}

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" variant="primary" disabled={!valid}
                      loading={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? 'Sharing' : 'Share'}
              </Button>
            </div>
            {save.isPending && mode === 'file' && (
              <p className="mt-2 flex items-center justify-center gap-2 text-[12.5px] text-ink-3">
                <Spinner className="size-3" /> Storing the file…
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
