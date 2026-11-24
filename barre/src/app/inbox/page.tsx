'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Megaphone, MessageSquare, PenSquare, Send, Users, FileText, Plus, Inbox as InboxIcon,
  CheckCircle2, Mail,
} from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { RecordSheet } from '@/components/app/record-sheet';
import { Automations } from '@/components/app/automations';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { useSelection } from '@/lib/use-selection';
import { useSearchParams } from 'next/navigation';
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, Select, Skeleton,
} from '@/components/ui';
import * as I from '@/lib/repos/inbox';
import * as H from '@/lib/repos/hub';
import { relativeDay, time, initials } from '@/lib/format';
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
      <div className="mx-auto max-w-6xl">
        {/* Structured requests have their own queue; say so rather than
            splitting the office's attention across two unexplained places. */}
        {!!requests.data?.length && (
          <Link href="/requests"
            className="mb-4 flex items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface px-4 py-3 text-sm hover:bg-surface-2">
            <InboxIcon className="size-4 text-accent-text" aria-hidden />
            <span className="flex-1">{requests.data.length} request{requests.data.length === 1 ? '' : 's'} from families waiting for an answer</span>
            <span className="text-accent-text">Open</span>
          </Link>
        )}

        <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-5">
          {/* On a phone the list and the conversation are separate screens. */}
          <div className={cn('min-w-0', family && tab === 'families' && 'hidden lg:block')}>
            <div role="tablist" aria-label="Inbox sections" className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1">
              {([['families', 'Families'], ['broadcasts', 'Groups'], ['templates', 'Templates'], ['automations', 'Automations']] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={cn('h-9 shrink-0 rounded-full px-3 text-[13px]',
                    tab === k ? 'bg-ink font-medium text-surface' : 'text-ink-2 hover:bg-surface-2')}>
                  {l}{k === 'families' && unread > 0 && <span className="tnum ml-1.5 opacity-70">{unread}</span>}
                </button>
              ))}
            </div>
            {tab === 'families' && <ThreadList threads={threads} selected={family} onSelect={select} />}
            {tab === 'broadcasts' && <BroadcastList />}
            {tab === 'templates' && <TemplateList />}
            {tab === 'automations' && <Automations />}
          </div>

          {tab === 'families' && (
            <div className={cn('min-w-0', !family && 'hidden lg:block')}>
              {family
                ? <Conversation familyId={family} onBack={() => select(null)} />
                : <Card className="hidden h-full min-h-[420px] place-items-center lg:grid">
                    <EmptyState icon={<MessageSquare className="size-5" />} title="Choose a conversation"
                      body="Every message to or from a family is kept here and in their record." />
                  </Card>}
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
    <Card className="overflow-hidden">
      {threads.isLoading && <div className="space-y-2 p-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>}
      {threads.error && <div className="p-4"><ErrorState error={threads.error} onRetry={() => threads.refetch()} /></div>}
      {threads.data?.length === 0 && <EmptyState icon={<MessageSquare className="size-5" />}
        title="No conversations yet" body="Messages from families arrive here." />}
      <ul className="divide-y divide-line">
        {threads.data?.map(t => (
          <li key={t.family_id}>
            <button onClick={() => onSelect(t.family_id)} aria-current={selected === t.family_id || undefined}
              className={cn('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2',
                selected === t.family_id && 'bg-accent-soft/50')}>
              <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink-2">
                {initials(t.family_name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={cn('truncate', t.unread ? 'font-semibold' : 'font-medium')}>{t.family_name}</span>
                  <span className="ml-auto shrink-0 text-[12px] text-ink-3">{relativeDay(t.last_at)}</span>
                </span>
                <span className={cn('mt-0.5 line-clamp-2 text-[13px]', t.unread ? 'text-ink' : 'text-ink-2')}>
                  {!t.last_inbound && <span className="text-ink-3">You: </span>}
                  {t.last_subject ? `${t.last_subject} — ` : ''}{t.last_body}
                </span>
                {/* Status in words as well as weight: "unread" is not colour-only. */}
                <span className="mt-1 flex gap-1.5">
                  {t.unread > 0 && <Badge tone="accent">{t.unread} new</Badge>}
                  {t.last_inbound && t.unread === 0 && <Badge tone="caution">Awaiting reply</Badge>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
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

  const send = useMutation({
    mutationFn: () => runAs(session, q => q(I.SEND_DIRECT, [familyId, '', draft])),
    onSuccess: () => { setDraft(''); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const useTemplate = (id: string) => {
    const t = templates.data?.find(x => x.id === id);
    if (!t) return;
    const first = thread?.guardian?.split(' ')[0] ?? 'there';
    setDraft(t.body.replaceAll('{{guardian_name}}', first));
  };
  const unfilled = /\{\{\w+\}\}/.test(draft);

  return (
    <Card className="flex min-h-[60dvh] flex-col overflow-hidden lg:h-[calc(100dvh-180px)]">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <Button size="sm" variant="ghost" className="lg:hidden" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{thread?.family_name ?? 'Conversation'}</p>
          {thread?.guardian && <p className="truncate text-[12.5px] text-ink-3">{thread.guardian}</p>}
        </div>
        <Link href={`/people?id=${familyId}`} className="rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] text-accent-text hover:bg-surface-2">
          Family record
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-2/40 p-4" aria-live="polite">
        {messages.isLoading && <Skeleton className="h-24" />}
        {messages.error && <ErrorState error={messages.error} />}
        {messages.data?.map((m, n) => {
          const prev = messages.data![n - 1];
          const newDay = !prev || relativeDay(prev.sent_at) !== relativeDay(m.sent_at);
          return (
            <React.Fragment key={m.id}>
              {newDay && <p className="pt-2 text-center text-[11.5px] font-medium uppercase tracking-[0.06em] text-ink-3">{relativeDay(m.sent_at)}</p>}
              <div className={cn('flex', m.inbound ? 'justify-start' : 'justify-end')}>
                <div className={cn('max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm shadow-xs',
                  m.inbound ? 'rounded-bl-sm border border-line bg-surface' : 'rounded-br-sm bg-accent text-on-accent')}>
                  {m.subject && <p className="mb-1 font-medium">{m.subject}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn('mt-1.5 text-[11.5px]', m.inbound ? 'text-ink-3' : 'text-on-accent opacity-80')}>
                    {m.sender ?? (m.inbound ? thread?.family_name : 'Studio')} · {time(m.sent_at)}
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
        {unfilled && <p role="alert" className="mb-2 text-[12.5px] text-caution">Fill in the {'{{…}}'} gaps before sending.</p>}
        <label htmlFor="reply" className="sr-only">Reply to {thread?.family_name}</label>
        <textarea id="reply" value={draft} onChange={e => setDraft(e.target.value)} rows={3}
          placeholder="Write a reply…"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && draft.trim() && !unfilled) send.mutate(); }}
          className="w-full resize-none rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm
                     focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
        <div className="mt-2 flex items-center gap-2">
          <Select aria-label="Start from a template" value="" onChange={e => useTemplate(e.target.value)} className="h-9 max-w-[200px] text-[13px]">
            <option value="">Use a template…</option>
            {templates.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <span className="ml-auto hidden text-[12px] text-ink-3 sm:inline">In the app · ⌘↵ to send</span>
          <Button type="submit" variant="primary" size="sm" loading={send.isPending}
                  disabled={!draft.trim() || unfilled}>
            <Send className="size-4" aria-hidden /> Send
          </Button>
        </div>
      </form>
    </Card>
  );
}

function BroadcastList() {
  const rows = useRows<I.Broadcast>(['broadcasts'], I.BROADCASTS);
  return (
    <Card className="overflow-hidden">
      {rows.isLoading && <div className="space-y-2 p-3">{[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
      {rows.data?.length === 0 && <EmptyState icon={<Megaphone className="size-5" />} title="Nothing sent to groups yet" />}
      <ul className="divide-y divide-line">
        {rows.data?.map(b => (
          <li key={b.id} className="px-4 py-3">
            <div className="flex items-center gap-2">
              {b.kind === 'studio_announcement'
                ? <Badge tone="violet" icon={<Megaphone className="size-3" aria-hidden />}>Whole studio</Badge>
                : <Badge tone="info" icon={<Users className="size-3" aria-hidden />}>{b.class_name}</Badge>}
              <span className="ml-auto text-[12px] text-ink-3">{relativeDay(b.sent_at)}</span>
            </div>
            {b.subject && <p className="mt-1.5 font-medium">{b.subject}</p>}
            <p className="mt-0.5 line-clamp-3 text-sm text-ink-2">{b.body}</p>
            {b.sender && <p className="mt-1 text-[12px] text-ink-3">From {b.sender}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TemplateList() {
  const rows = useRows<I.Template>(['templates'], I.TEMPLATES);
  const [editing, setEditing] = React.useState<I.Template | 'new' | null>(null);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <p className="flex-1 text-[13px] text-ink-2">Reusable wording. {'{{guardian_name}}'} fills in when you use one.</p>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> New</Button>
      </div>
      {rows.isLoading && <Skeleton className="m-3 h-16" />}
      {rows.data?.length === 0 && <EmptyState icon={<FileText className="size-5" />} title="No templates yet" />}
      <ul className="divide-y divide-line">
        {rows.data?.map(t => (
          <li key={t.id}>
            <button onClick={() => setEditing(t)} className="w-full px-4 py-3 text-left hover:bg-surface-2">
              <span className="block font-medium">{t.name}</span>
              <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink-2">{t.body}</span>
            </button>
          </li>
        ))}
      </ul>
      {editing && <TemplateSheet template={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}

function TemplateSheet({ template, onClose }: { template: I.Template | null; onClose: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [name, setName] = React.useState(template?.name ?? '');
  const [subject, setSubject] = React.useState(template?.subject ?? '');
  const [body, setBody] = React.useState(template?.body ?? '');
  const [confirm, setConfirm] = React.useState(false);
  const done = () => { qc.invalidateQueries({ queryKey: ['db'] }); onClose(); };
  const save = useMutation({
    mutationFn: () => runAs(session, q => template
      ? q(I.UPDATE_TEMPLATE, [template.id, name.trim(), subject, body.trim()])
      : q(I.CREATE_TEMPLATE, [name.trim(), subject, body.trim()])),
    onSuccess: done,
  });
  const remove = useMutation({
    mutationFn: () => runAs(session, q => q(I.REMOVE_TEMPLATE, [template!.id])), onSuccess: done,
  });
  return (
    <RecordSheet title={template ? 'Edit template' : 'New template'} onClose={onClose}
      onSave={() => save.mutate()} saving={save.isPending} error={save.error ?? remove.error}
      canSave={name.trim().length >= 2 && body.trim().length >= 5}
      onRemove={template ? () => (confirm ? remove.mutate() : setConfirm(true)) : undefined}
      removing={remove.isPending} removeLabel={confirm ? 'Tap again to remove' : 'Remove template'}>
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
      audience === 'family' ? q(I.SEND_DIRECT, [familyId, subject, body])
      : audience === 'class' ? q(I.SEND_CLASS, [classId, subject, body])
      : q(I.SEND_STUDIO, [subject, body])),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db'] });
      if (audience === 'family') onSentDirect(familyId);
      else setSent(audience === 'class' ? `${cls?.name} — ${reach} famil${reach === 1 ? 'y' : 'ies'}` : `the whole studio — ${reach} families`);
    },
  });

  if (sent) {
    return (
      <RecordSheet title="Sent" onClose={onClose} onSave={onClose} saveLabel="Done">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-positive" aria-hidden />
          <p className="text-sm text-ink-2">Delivered in the app to {sent}, and kept in each family’s history.</p>
        </div>
      </RecordSheet>
    );
  }

  return (
    <RecordSheet title="New message" onClose={onClose} onSave={() => send.mutate()} saving={send.isPending}
      error={send.error} canSave={valid}
      saveLabel={reach > 1 ? `Send to ${reach} families` : 'Send'}>
      <div role="radiogroup" aria-label="Who to" className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
        {([['family', 'A family'], ['class', 'A class'], ['studio', 'Everyone']] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={audience === k} onClick={() => setAudience(k)}
            className={cn('h-9 rounded-[calc(var(--radius-md)-2px)] text-[13px]',
              audience === k ? 'bg-surface font-medium shadow-xs' : 'text-ink-2')}>{l}</button>
        ))}
      </div>

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
        <p className="rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink">
          Goes to every family{familyCount ? ` (${familyCount})` : ''} and every teacher. Save it for things everyone needs.
        </p>
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
      <p className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        <Mail className="size-3.5" aria-hidden /> Delivered in the app. Email and text delivery are not connected yet.
      </p>
    </RecordSheet>
  );
}
