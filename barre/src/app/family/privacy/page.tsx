'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Shell } from '@/components/app/shell';
import { useFamilyVoice } from '@/components/app/adult-self';
import { readAs, runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, SectionHead } from '@/components/ui';
import * as V from '@/lib/repos/privacy';

/**
 * Privacy and your data (UR-38): who sees what about a child, in plain words
 * taken from the database rules; a download of the family's own records; and
 * a way to ask the school to delete them.
 */
export default function FamilyPrivacy() {
  const voice = useFamilyVoice();
  const { session } = useSession();
  const qc = useQueryClient();
  const download = useMutation({
    mutationFn: async () => {
      const out: Record<string, unknown> = { downloaded_at: new Date().toISOString() };
      // Each query runs as you, so the database returns your family's records and nothing else.
      for (const [name, sql] of V.FAMILY_EXPORT) out[name] = await readAs(session, sql);
      return out;
    },
    onSuccess: data => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = `our-family-data-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  });
  const [note, setNote] = React.useState('');
  const [asked, setAsked] = React.useState(false);
  const ask = useMutation({
    mutationFn: () => runAs(session, q => q(V.ASK_TO_DELETE, [note || null])),
    onSuccess: () => { setAsked(true); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  return (
    <Shell title="Privacy and your data" allow={['guardian']}>
      <div className="mx-auto max-w-2xl space-y-12">
        <section aria-labelledby="who-h">
          <SectionHead id="who-h" title={voice.solo ? 'Who sees what about you' : 'Who sees what about your child'} />
          <dl className="divide-y divide-line">
            {V.WHO_SEES.map(r => (
              <div key={r.who} className="py-3.5">
                <dt className="font-semibold">{r.who}</dt>
                <dd className="mt-1 text-[0.9062rem] text-ink-2">{r.sees}</dd>
                <dd className="mt-0.5 text-[0.8438rem] text-ink-3">Not: {r.not}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.8438rem] text-ink-3">
            These rules are enforced by the database itself, not just by the screens. Changes to medical details and consent are recorded with who made them and when.
          </p>
        </section>

        <section aria-labelledby="fix-h">
          <SectionHead id="fix-h" title="Putting something right" />
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.9062rem] text-ink-2">
            <li>Emergency contacts and photo, video and social media consent: change them yourself on <Link href="/family/children" className="font-semibold text-accent-text underline">{voice.solo ? 'Your details' : 'Your family'}</Link>.</li>
            <li>Medical details, or {voice.solo ? 'your' : 'a child’s'} name or date of birth: <Link href="/family/enquiries" className="font-semibold text-accent-text underline">tell the studio</Link>, so there is a record of who changed what.</li>
          </ul>
        </section>

        <section aria-labelledby="dl-h">
          <SectionHead id="dl-h" title={voice.solo ? 'Download your data' : 'Download your family’s data'} />
          <p className="mt-2 text-[0.9062rem] text-ink-2">
            One file with {voice.solo ? 'your details, your' : 'your family, children,'} medical details, emergency contacts, consents, classes, attendance, invoices, payments, messages, requests and the feedback shared with you.
            The office’s own notes and teachers’ private notes are not included; ask the studio if you want a complete copy, which they must give you within one month.
          </p>
          {download.error != null && <ErrorState error={download.error} />}
          <Button className="mt-3" loading={download.isPending} onClick={() => download.mutate()}>
            <Download className="size-4" aria-hidden /> Download (JSON)
          </Button>
        </section>

        <section aria-labelledby="del-h">
          <SectionHead id="del-h" title="Ask the school to delete your data" />
          {asked ? (
            <p role="status" className="mt-2 text-[0.9062rem]">
              <span className="font-semibold text-positive">Sent.</span> The office has your request and should reply within one month. You can follow it under <Link href="/family/enquiries" className="font-semibold text-accent-text underline">Requests</Link>.
            </p>
          ) : (
            <>
              <p className="mt-2 text-[0.9062rem] text-ink-2">
                The office will delete or anonymise what it no longer needs. Some records must be kept for a set time: invoices and payments for six years, and any safeguarding record for as long as the school’s safeguarding policy requires.
                {voice.solo ? 'If you are still booked into classes, the school will talk to you first.' : 'If your children are still in classes, the school will talk to you first.'}
              </p>
              <Field label="Anything the office should know" htmlFor="del-note" hint="Optional.">
                <textarea id="del-note" rows={2} value={note} onChange={e => setNote(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12" />
              </Field>
              {ask.error != null && <ErrorState error={ask.error} />}
              <Button className="mt-1" loading={ask.isPending} onClick={() => ask.mutate()}>Ask to delete</Button>
            </>
          )}
        </section>
      </div>
    </Shell>
  );
}
