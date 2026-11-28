'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, PenSquare, Send, Plus } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { Automations } from '@/components/app/automations';
import { removeWithUndo, useRemoving } from '@/components/app/undo';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import { useSearchParams } from 'next/navigation';
import {
  Button, EmptyState, ErrorState, Field, Input, Notice, Select, Skeleton, Choice, StatusLine
} from '@/components/ui';
import { SectionHead, ViewTabs, Word } from '@/components/app/session-row';
import * as I from '@/lib/repos/inbox';
import * as H from '@/lib/repos/hub';
import { relativeDay, time, dayDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'families' | 'broadcasts' | 'templates' | 'automations';

export default function InboxPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Inbox /></Suspense>;
}

function Inbox() {
  const { selected: family, select } = useSelection('family');
  const [tab, setTab] = React.useState<Tab>('families');
  // ?compose=class opens the composer — the assistant's "message a class" lands here.
  const [composing, setComposing] = React.useState(false);
  const compose = useSearchParams().get('compose');
  React.useEffect(() => { if (compose) setComposing(true); }, [compose]);
  const threads = useRows<I.Thread>(['threads'], I.THREADS);
  const requests = useRows<{ id: string }>(['pending-requests'], H.PENDING_REQUESTS);
  const unread = threads.data?.reduce((n, t) => n + t.unread, 0) ?? 0;

  return (
    <Shell title="Inbox" allow={['owner', 'admin']}
      subtitle={threads.data ? (unread ? `${unread} unread from families` : 'All caught up') : undefined}
      actions={<Button size="sm" variant="primary" onClick={() => setComposing(true)}>
        <PenSquare className="size-4" aria-hidden /> <span className="hidden sm:inline">New message</span>
        <span className="sm:hidden">New</span>
      </Button>}>
      <div className="mx-auto max-w-[1240px]">
        {/* Structured requests have their own queue; say so rather than
            splitting the office's attention across two unexplained places. */}
        {!!requests.data?.length && (
          <Link href="/requests"
            className="group mb-6 grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 border-y border-line py-3">
            <span className="font-display text-[1.75rem] leading-none tnum">{requests.data.length}</span>
            <span className="font-semibold">Request{requests.data.length === 1 ? '' : 's'} from families waiting for an answer</span>
            <span className="flex items-center gap-1 text-[0.8125rem] font-semibold text-accent-text group-hover:underline">Open requests<ArrowRight className="size-3.5" aria-hidden /></span>
          </Link>
        )}

        <ViewTabs label="Inbox sections" value={tab} onChange={setTab} className={cn('mb-5 border-b border-line', family && tab === 'families' && 'hidden lg:flex')}
          options={[['families', unread > 0 ? `Families · ${unread}` : 'Families'], ['broadcasts', 'Groups'], ['templates', 'Templates'], ['automations', 'Automations']]} />

        <div className={cn(tab === 'families' && 'lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8')}>
          {/* On a phone the list and the conversation are separate screens. */}
          <div className={cn('min-w-0', family && tab === 'families' && 'hidden lg:block', tab !== 'families' && 'max-w-3xl')}>
            {tab === 'families' && <ThreadList threads={threads} selected={family} onSelect={select} />}
            {tab === 'broadcasts' && <BroadcastList />}
            {tab === 'templates' && <TemplateList />}
            {tab === 'automations' && <Automations />}
          </div>

          {tab === 'families' && (
            <div className={cn('min-w-0', !family && 'hidden lg:block')}>
              {family
                ? <Conversation familyId={family} onBack={() => select(null)} />
                : <div className="hidden h-full min-h-[420px] border-l border-line pl-8 lg:block">
                    <EmptyState title="Choose a conversation"
                      body="Every message to or from a family is kept here and in their record." />
                  </div>}
            </div>
          )}
        </div>
      </div>
      {composing && <Composer onClose={() => setComposing(false)}
                              onSentDirect={id => { setComposing(false); setTab('families'); select(id); }} />}
    </Shell>
  );
}

function ThreadList({ threads, selected, onSelect }: {
  threads: ReturnType<typeof useRows<I.Thread>>; selected: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div>
      {threads.isLoading && <div className="space-y-2">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
      {threads.error && <ErrorState error={threads.error} onRetry={() => threads.refetch()} />}
      {threads.data?.length === 0 && <EmptyState
        title="No conversations yet" body="Messages from families arrive here." />}
      <ul className="divide-y divide-line border-y border-line">
        {threads.data?.map(t => (
          <li key={t.family_id}>
            <button onClick={() => onSelect(t.family_id)} aria-current={selected === t.family_id || undefined}
              className={cn('block w-full px-2 py-3 text-left hover:bg-surface-2/60',
                selected === t.family_id && 'bg-surface-2 shadow-[inset_3px_0_0_var(--color-accent)]')}>
              <span className="flex items-baseline gap-2">
                <span className={cn('truncate', t.unread ? 'font-bold' : 'font-semibold')}>{t.family_name}</span>
                {/* Status in words as well as weight: "unread" is not colour-only. */}
                {t.unread > 0 && <Word>{t.unread} new</Word>}
                {t.last_inbound && t.unread === 0 && <Word tone="caution">Awaiting reply</Word>}
                <span className="ml-auto shrink-0 text-[0.7812rem] text-ink-3">{relativeDay(t.last_at)}</span>
              </span>
              <span className={cn('mt-0.5 line-clamp-2 text-[0.8438rem]', t.unread ? 'text-ink' : 'text-ink-3')}>
                {!t.last_inbound && <span className="text-ink-3">You: </span>}
                {t.last_subject ? `${t.last_subject} — ` : ''}{t.last_body}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Conversation({ familyId, onBack }: { familyId: string; onBack: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const messages = useRows<I.Message>(['conversation', familyId], I.CONVERSATION, [familyId]);
  const thread = useRows<I.Thread>(['threads'], I.THREADS).data?.find(t => t.family_id === familyId);
  const templates = useRows<I.Template>(['templates'], I.TEMPLATES);
  const [draft, setDraft] = React.useState('');
  const end = React.useRef<HTMLDivElement>(null);

  // Opening a conversation reads it.
  const unreadIds = messages.data?.filter(m => m.inbound && !m.read_by_me).map(m => m.id) ?? [];
  const key = unreadIds.join(',');
  React.useEffect(() => {
    if (!key) return;
    runAs(session, q => q(I.MARK_READ, [key.split(',')]))
      .then(() => qc.invalidateQueries({ queryKey: ['db'] }));
  }, [key, session, qc]);

  React.useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages.data?.length]);

  // A guardian's own messages are between them and the office (UR-17), so a
  // reply to one goes to that guardian only, unless the office chooses the
  // whole family.
  const lastPrivate = [...(messages.data ?? [])].reverse().find(m => m.inbound && m.private);
  const [toFamily, setToFamily] = React.useState(false);
  const send = useMutation({
    mutationFn: () => runAs(session, q => lastPrivate && !toFamily
      ? q(I.SEND_REPLY, [familyId, draft, lastPrivate.id])
      : q(I.SEND_DIRECT, [familyId, '', draft])),
    onSuccess: () => { setDraft(''); setToFamily(false); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const useTemplate = (id: string) => {
    const t = templates.data?.find(x => x.id === id);
    if (!t) return;
    const first = thread?.guardian?.split(' ')[0] ?? 'there';
    setDraft(t.body.replaceAll('{{guardian_name}}', first));
  };
  const unfilled = /\{\{\w+\}\}/.test(draft);

  return (
    <div className="card flex min-h-[60dvh] flex-col overflow-hidden lg:h-[calc(100dvh-220px)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Button size="sm" variant="ghost" className="lg:hidden" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-[1.1875rem] leading-tight">{thread?.family_name ?? 'Conversation'}</h2>
          {thread?.guardian && <p className="truncate text-[0.8125rem] text-ink-3">{thread.guardian}</p>}
        </div>
        <Link href={`/people?id=${familyId}`} className="rounded-[var(--radius-md)] px-2.5 py-2 text-[0.8125rem] font-semibold text-accent-text hover:underline">
          Family record
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-canvas p-4" aria-live="polite">
        {messages.isLoading && <Skeleton className="h-24" />}
        {messages.error && <ErrorState error={messages.error} />}
        {messages.data?.map((m, n) => {
          const prev = messages.data![n - 1];
          const newDay = !prev || relativeDay(prev.sent_at) !== relativeDay(m.sent_at);
          return (
            <React.Fragment key={m.id}>
              {newDay && <p className="pt-2 text-center text-[0.7812rem] font-semibold text-ink-3">{relativeDay(m.sent_at)}</p>}
              <div className={cn('flex', m.inbound ? 'justify-start' : 'justify-end')}>
                <div className={cn('max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-[0.9062rem]',
                  m.inbound ? 'rounded-bl-sm border border-line bg-surface' : 'rounded-br-sm bg-ink text-ink-invert')}>
                  {m.is_request && (
                    <Link href="/requests" className={cn('mb-1 inline-flex items-center gap-1 text-[0.75rem] font-semibold underline-offset-2 hover:underline',
                      m.inbound ? 'text-accent-text' : 'text-ink-invert')}>
                      Request{m.inbound ? ' · handle in Requests' : ''}
                    </Link>
                  )}
                  {m.subject && <p className="mb-1 font-semibold">{m.subject}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn('mt-1.5 text-[0.75rem]', m.inbound ? 'text-ink-3' : 'text-ink-invert opacity-75')}>
                    {m.sender ?? (m.inbound ? thread?.family_name : 'Studio')} · {time(m.sent_at)}
                    {m.private && ` · only ${m.private_name ?? 'one guardian'} and the office`}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={end} />
      </div>

      <form className="border-t border-line p-3" onSubmit={e => { e.preventDefault(); if (draft.trim() && !unfilled) send.mutate(); }}>
        {send.error && <div className="mb-2"><ErrorState error={send.error} /></div>}
        {unfilled && <p role="alert" className="mb-2 text-[0.7812rem] text-caution">Fill in the {'{{…}}'} gaps before sending.</p>}
        {lastPrivate && (
          <Select aria-label="Who the reply goes to" value={toFamily ? 'family' : 'one'} onChange={e => setToFamily(e.target.value === 'family')}
                  className="mb-2 h-9 max-w-full text-[0.8125rem] sm:max-w-[320px]">
            <option value="one">Reply to {lastPrivate.private_name ?? lastPrivate.sender ?? 'them'} only</option>
            <option value="family">Send to everyone in the family</option>
          </Select>
        )}
        <label htmlFor="reply" className="sr-only">Reply to {thread?.family_name}</label>
        <textarea id="reply" value={draft} onChange={e => setDraft(e.target.value)} rows={3}
          placeholder="Write a reply…"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && draft.trim() && !unfilled) send.mutate(); }}
          className="w-full resize-none rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                     focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
        <div className="mt-2 flex items-center gap-2">
          <Select aria-label="Start from a template" value="" onChange={e => useTemplate(e.target.value)} className="h-9 max-w-[200px] text-[0.8125rem]">
            <option value="">Use a template…</option>
            {templates.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <span className="ml-auto hidden text-[0.75rem] text-ink-3 sm:inline">In the app · ⌘↵ to send</span>
          <Button type="submit" variant="primary" size="sm" loading={send.isPending}
                  disabled={!draft.trim() || unfilled}>
            <Send className="size-4" aria-hidden /> Send
          </Button>
        </div>
      </form>
    </div>
  );
}

function BroadcastList() {
  const rows = useRows<I.Broadcast>(['broadcasts'], I.BROADCASTS);
  const [open, setOpen] = React.useState<I.Broadcast | null>(null);
  return (
    <section>
      <SectionHead title="Sent to groups" meta="Open one to see who has read it" />
      {rows.isLoading && <div className="space-y-2 pt-3">{[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
      {rows.data?.length === 0 && <EmptyState title="Nothing sent to groups yet" body="Message a class or the whole studio from New message." />}
      <ul className="divide-y divide-line">
        {rows.data?.map(b => (
          <li key={b.id}>
           <button className="block w-full px-1 py-3 text-left hover:bg-surface-2/60" onClick={() => setOpen(b)}>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[0.8125rem] font-semibold text-ink-2">{b.kind === 'studio_announcement' ? 'Whole studio' : b.class_name}</span>
              {b.scheduled && <><Word tone="caution">Scheduled</Word><span className="text-[0.8125rem] text-caution">{dayDateTime(b.sent_at)}</span></>}
              <span className="ml-auto text-[0.7812rem] text-ink-3">{relativeDay(b.sent_at)}</span>
            </div>
            {b.subject && <p className="mt-1 font-semibold">{b.subject}</p>}
            <p className="mt-0.5 line-clamp-2 text-[0.875rem] text-ink-2">{b.body}</p>
            {b.sender && <p className="mt-1 text-[0.7812rem] text-ink-3">From {b.sender}</p>}
           </button>
          </li>
        ))}
      </ul>
      {open && <ReachSheet message={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/** Who has seen a message, and a nudge for those who have not (R-018). */
export function ReachSheet({ message, onClose }: { message: { id: string; subject: string | null; scheduled?: boolean }; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const reach = useRows<I.Reach>(['reach', message.id], I.REACH, [message.id]);
  const [done, setDone] = React.useState<string | null>(null);
  const remind = useMutation({
    mutationFn: async () => (await runAs(session, q => q<{ n: number }>(I.REMIND_UNREAD, [message.id])))[0]!.n,
    onSuccess: n => { setDone(`Reminded ${n} famil${n === 1 ? 'y' : 'ies'}.`); qc.invalidateQueries({ queryKey: ['db'] }); },
  });
  const rows = reach.data ?? [];
  const seen = rows.filter(r => r.seen).length;
  const waiting = rows.filter(r => !r.seen && r.has_login).length;
  const noLogin = rows.filter(r => !r.has_login).length;
  return (
    <RecordSheet title={message.subject ?? 'Message'} subtitle={message.scheduled ? 'Scheduled — not sent yet'
        : reach.data ? `${seen} of ${rows.length} famil${rows.length === 1 ? 'y has' : 'ies have'} seen this` : undefined}
      onClose={onClose} onSave={() => remind.mutate()} saving={remind.isPending} error={remind.error}
      canSave={!message.scheduled && waiting > 0 && !done} saveLabel={waiting ? `Remind the ${waiting} who haven’t` : 'Everyone has seen it'}>
      {done && <div role="status"><StatusLine live={false} title={done} /></div>}
      {reach.isLoading && <Skeleton className="h-24" />}
      {noLogin > 0 && <p className="text-[0.8125rem] text-ink-3">{noLogin} famil{noLogin === 1 ? 'y has' : 'ies have'} not signed up to the app, so cannot see messages yet.</p>}
      <ul className="max-h-72 divide-y divide-line overflow-y-auto border-y border-line">
        {rows.map(r => (
          <li key={r.family_id} className="flex min-h-[40px] items-center justify-between gap-3 py-2 text-[0.875rem]">
            <span>{r.family_name}</span>
            {r.seen ? <span className="text-[0.8125rem] text-positive">Seen {r.seen_at ? relativeDay(r.seen_at) : ''}</span>
              : r.has_login ? <span className="text-[0.8125rem] font-semibold text-caution">Not yet</span> : <span className="text-[0.8125rem] text-ink-3">No app login</span>}
          </li>
        ))}
      </ul>
    </RecordSheet>
  );
}

function TemplateList() {
  const rows = useRows<I.Template>(['templates'], I.TEMPLATES);
  const removing = useRemoving();
  const [editing, setEditing] = React.useState<I.Template | 'new' | null>(null);
  return (
    <section>
      <SectionHead title="Templates" meta={<>{'{{guardian_name}}'} fills in when you use one</>}
        action={<Button size="sm" variant="ghost" onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> New template</Button>} />
      {rows.isLoading && <Skeleton className="mt-3 h-16" />}
      {rows.data?.length === 0 && <EmptyState title="No templates yet" body="Save wording you send often, like a trial follow-up." />}
      <ul className="divide-y divide-line">
        {rows.data?.filter(t => !removing(t.id)).map(t => (
          <li key={t.id}>
            <button onClick={() => setEditing(t)} className="w-full px-1 py-3 text-left hover:bg-surface-2/60">
              <span className="block font-semibold">{t.name}</span>
              <span className="mt-0.5 line-clamp-2 block text-[0.8438rem] text-ink-3">{t.body}</span>
            </button>
          </li>
        ))}
      </ul>
      {editing && <TemplateSheet template={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

function TemplateSheet({ template, onClose }: { template: I.Template | null; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [name, setName] = React.useState(template?.name ?? '');
  const [subject, setSubject] = React.useState(template?.subject ?? '');
  const [body, setBody] = React.useState(template?.body ?? '');
  const done = () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); };
  const save = useMutation({
    mutationFn: () => runAs(session, q => template
      ? q(I.UPDATE_TEMPLATE, [template.id, name.trim(), subject, body.trim()])
      : q(I.CREATE_TEMPLATE, [name.trim(), subject, body.trim()])),
    onSuccess: done,
  });
  const remove = () => {
    removeWithUndo(template!.id, `“${template!.name}”`, async () => {
      await runAs(session, q => q(I.REMOVE_TEMPLATE, [template!.id]));
      qc.invalidateQueries({ queryKey: ['db'] });
    });
    onClose();
  };
  return (
    <RecordSheet title={template ? 'Edit template' : 'New template'} onClose={onClose}
      onSave={() => save.mutate()} saving={save.isPending} error={save.error}
      canSave={name.trim().length >= 2 && body.trim().length >= 5}
      onRemove={template ? remove : undefined} removeLabel="Remove template">
      <Field label="Name" htmlFor="tp-n" required>
        <Input id="tp-n" value={name} onChange={e => setName(e.target.value)} maxLength={80} />
      </Field>
      <Field label="Subject" htmlFor="tp-s">
        <Input id="tp-s" value={subject} onChange={e => setSubject(e.target.value)} maxLength={140} />
      </Field>
      <Field label="Message" htmlFor="tp-b" required hint="Placeholders: {{guardian_name}}, {{child_name}}, {{class_name}}">
        <textarea id="tp-b" value={body} onChange={e => setBody(e.target.value)} rows={8}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                     focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
    </RecordSheet>
  );
}

// ── Composing to a family, a class, or everyone ──────────────────────────
type Audience = 'family' | 'class' | 'studio';

function Composer({ onClose, onSentDirect }: { onClose: () => void; onSentDirect: (familyId: string) => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [audience, setAudience] = React.useState<Audience>('class');
  const [familyId, setFamilyId] = React.useState('');
  const [classId, setClassId] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [sent, setSent] = React.useState<string | null>(null);
  const [later, setLater] = React.useState('');
  const at = later ? new Date(later).toISOString() : null;
  const families = useRows<{ id: string; name: string; guardian: string | null }>(
    ['family-options'], `select f.id, f.name, (select g.full_name from guardian g where g.family_id = f.id
      and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
      from family f where f.deleted_at is null order by f.name`);
  const classes = useRows<I.Audience>(['class-audiences'], I.CLASS_AUDIENCES);
  const familyCount = useRows<{ n: number }>(['family-count'], I.FAMILY_COUNT).data?.[0]?.n;
  const templates = useRows<I.Template>(['templates'], I.TEMPLATES);

  const cls = classes.data?.find(c => c.id === classId);
  const fam = families.data?.find(f => f.id === familyId);
  const reach = audience === 'family' ? (fam ? 1 : 0) : audience === 'class' ? (cls?.families ?? 0) : (familyCount ?? 0);

  const fill = (s: string) => s
    .replaceAll('{{class_name}}', cls?.name ?? '{{class_name}}')
    .replaceAll('{{guardian_name}}', audience === 'family' ? (fam?.guardian?.split(' ')[0] ?? '{{guardian_name}}') : 'everyone');
  const unfilled = /\{\{\w+\}\}/.test(subject + body);
  const valid = body.trim().length >= 5 && !unfilled
    && (audience === 'family' ? !!familyId : audience === 'class' ? !!classId : true);

  const send = useMutation({
    mutationFn: () => runAs(session, q =>
      at ? (audience === 'family' ? q(I.SEND_DIRECT_AT, [familyId, subject, body, at])
            : audience === 'class' ? q(I.SEND_CLASS_AT, [classId, subject, body, at])
            : q(I.SEND_STUDIO_AT, [subject, body, at]))
      : audience === 'family' ? q(I.SEND_DIRECT, [familyId, subject, body])
      : audience === 'class' ? q(I.SEND_CLASS, [classId, subject, body])
      : q(I.SEND_STUDIO, [subject, body])),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db'] });
      if (at) { setSent(`scheduled for ${relativeDay(at)} at ${time(at)}. Families see it then`); return; }
      if (audience === 'family') onSentDirect(familyId);
      else setSent(audience === 'class' ? `${cls?.name} — ${reach} famil${reach === 1 ? 'y' : 'ies'}` : `the whole studio — ${reach} families`);
    },
  });

  if (sent) {
    return (
      <RecordSheet title="New message" onClose={onClose} onSave={onClose} saveLabel="Done">
        <StatusLine
          title={sent.startsWith('scheduled') ? `Message ${sent}.` : `Delivered in the app to ${sent}`}
          detail={sent.startsWith('scheduled') ? undefined : 'Kept in each family’s history.'} />
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title="New message" onClose={onClose} onSave={() => send.mutate()} saving={send.isPending}
      error={send.error} canSave={valid}
      saveLabel={at ? 'Schedule' : reach > 1 ? `Send to ${reach} families` : 'Send'}>
      <Choice label="Who to" layout="grid" className="grid-cols-3" value={audience} onChange={setAudience}
        options={[{ value: 'family', label: 'A family' }, { value: 'class', label: 'A class' }, { value: 'studio', label: 'Everyone' }]} />

      {audience === 'family' && (
        <Field label="Family" htmlFor="cm-f" required>
          <Select id="cm-f" value={familyId} onChange={e => setFamilyId(e.target.value)}>
            <option value="">Choose…</option>
            {families.data?.map(f => <option key={f.id} value={f.id}>{f.name}{f.guardian ? ` — ${f.guardian}` : ''}</option>)}
          </Select>
        </Field>
      )}
      {audience === 'class' && (
        <Field label="Class" htmlFor="cm-c" required hint={cls ? `Reaches ${cls.families} famil${cls.families === 1 ? 'y' : 'ies'} with a child enrolled` : undefined}>
          <Select id="cm-c" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">Choose…</option>
            {classes.data?.map(c => <option key={c.id} value={c.id}>{c.name}{c.teacher ? ` · ${c.teacher}` : ''}</option>)}
          </Select>
        </Field>
      )}
      {audience === 'studio' && (
        <Notice word="Check" tone="caution" title={`Every family${familyCount ? ` (${familyCount})` : ''} and every teacher`}
          detail="Save it for things everyone needs." />
      )}

      <Select aria-label="Start from a template" value=""
        onChange={e => { const t = templates.data?.find(x => x.id === e.target.value); if (t) { setSubject(fill(t.subject ?? '')); setBody(fill(t.body)); } }}>
        <option value="">Start from a template…</option>
        {templates.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </Select>
      <Field label="Subject" htmlFor="cm-s">
        <Input id="cm-s" value={subject} onChange={e => setSubject(e.target.value)} maxLength={140} />
      </Field>
      <Field label="Message" htmlFor="cm-b" required
             error={unfilled ? 'Replace the {{…}} placeholders before sending.' : undefined}>
        <textarea id="cm-b" value={body} onChange={e => setBody(e.target.value)} rows={7}
          className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                     focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
      </Field>
      <Field label="Send later" htmlFor="cm-at" hint="Leave empty to send now. Up to 60 days ahead.">
        <Input id="cm-at" type="datetime-local" value={later} onChange={e => setLater(e.target.value)}
               min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} />
      </Field>
      <p className="text-[0.8125rem] text-ink-3">
        Delivered in the app. Email and text delivery aren’t connected yet.
      </p>
    </RecordSheet>
  );
}
