'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { Button, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { useRows } from '@/lib/query';
import { readAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { CONSENT_SNAPSHOT, type SnapshotRow } from '@/lib/repos/consent';
import { dateLong, dateShort, time } from '@/lib/format';
import { esc, printPage } from './safeguarding';

/**
 * Who may be photographed or filmed at a show or event: everyone invited or
 * going, with photo, video and social media consent as at a chosen time
 * (migration 0065, app.event_consent_snapshot). Not answered counts as not
 * allowed. For the show production pack and the event page.
 *
 * - <ConsentSnapshotTable eventId asOf /> shows it on screen.
 * - consentSnapshotHtml(rows, event) is the printable page.
 * - <ConsentSnapshotButton event /> is the small control on an event.
 */
export type SnapshotEvent = { id: string; title: string; starts_at: string; venue?: string | null };

export const consentWord = (v: boolean | null) => v === true ? 'Allowed' : v === false ? 'Not allowed' : 'Not answered';

export function consentSnapshotHtml(rows: SnapshotRow[], event: SnapshotEvent): string {
  const asOf = rows[0]?.as_of ?? new Date().toISOString();
  const cell = (v: boolean | null) => `<td class="${v === true ? '' : 'no'}">${consentWord(v)}</td>`;
  return `<p class="mark">Who may be photographed or filmed · consent as at ${esc(dateShort(asOf))} ${esc(time(asOf))}</p>
<h1>${esc(event.title)}</h1>
<p class="sub">${esc(dateLong(event.starts_at))} · ${esc(time(event.starts_at))}${event.venue ? ' · ' + esc(event.venue) : ''} · ${rows.length} dancer${rows.length === 1 ? '' : 's'}</p>
<table><tr><th>Dancer</th><th>Class</th><th>Photos</th><th>Video</th><th>Social media</th></tr>
${rows.map(r => `<tr><td>${esc(r.name)}${r.participation !== 'confirmed' ? ` <span class="sub">(${esc(r.participation)})</span>` : ''}${r.disputed ? ' <span class="no">· parents disagree</span>' : ''}</td>
<td>${esc(r.class_name ?? '')}</td>${cell(r.photography)}${cell(r.video)}${cell(r.social_media)}</tr>`).join('')}</table>
<p class="sub">"Not answered" means not allowed. Consent can change: check the app on the day. Destroy paper copies after the event.</p>`;
}

export function ConsentSnapshotTable({ eventId, asOf = null }: { eventId: string; asOf?: string | null }) {
  const rows = useRows<SnapshotRow>(['consent-snapshot', eventId, asOf], CONSENT_SNAPSHOT, [eventId, asOf]);
  if (rows.isLoading) return <Skeleton className="h-24" />;
  if (rows.error) return <ErrorState error={rows.error} />;
  if (!rows.data?.length) return <p className="text-[0.875rem] text-ink-3">Nobody is invited or going yet.</p>;
  const word = (v: boolean | null) => <span className={v === true ? '' : 'font-semibold text-critical'}>{consentWord(v)}</span>;
  return (
    <ul className="divide-y divide-line text-[0.875rem]">
      {rows.data.map(r => (
        <li key={r.student_id} className="py-2">
          <p className="font-medium">{r.name}{r.class_name ? <span className="font-normal text-ink-3"> · {r.class_name}</span> : null}
            {r.disputed && <span className="font-semibold text-caution"> · parents disagree</span>}</p>
          <p className="text-[0.8125rem]">Photos: {word(r.photography)} · Video: {word(r.video)} · Social media: {word(r.social_media)}</p>
        </li>
      ))}
    </ul>
  );
}

export function ConsentSnapshotButton({ event }: { event: SnapshotEvent }) {
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [asOf, setAsOf] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
  const [busy, setBusy] = React.useState(false);
  const print = async () => {
    setBusy(true); setError(null);
    try {
      const rows = await readAs<SnapshotRow>(session, CONSENT_SNAPSHOT, [event.id, asOf ? new Date(asOf).toISOString() : null]);
      printPage(`${event.title}: consent list`, consentSnapshotHtml(rows, event));
    } catch (e) { setError(e); } finally { setBusy(false); }
  };
  if (!open) return <Button size="sm" variant="ghost" onClick={() => setOpen(true)}><Printer className="size-4" aria-hidden /> Consent list</Button>;
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <Field label="Consent as at" htmlFor={`cs-at-${event.id}`} hint="Empty for now. Who may be photographed or filmed; not answered counts as not allowed.">
        <Input id={`cs-at-${event.id}`} type="datetime-local" value={asOf} onChange={e => setAsOf(e.target.value)} />
      </Field>
      <Button size="sm" loading={busy} onClick={print}><Printer className="size-4" aria-hidden /> Print consent list</Button>
      {error != null && <div className="sm:col-span-2"><ErrorState error={error} /></div>}
    </div>
  );
}
