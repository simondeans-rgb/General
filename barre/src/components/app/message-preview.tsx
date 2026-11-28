'use client';

import * as React from 'react';
import { Field, Select, ViewTabs } from '@/components/ui';
import {
  TEMPLATE_LABELS, documentFontFaces, programmeHtml, renderMessage, sampleMessage, type BrandSchool, type TemplateKind,
} from '@/lib/branded-print';

const KINDS = Object.keys(TEMPLATE_LABELS) as TemplateKind[];

/**
 * How a school's emails and notices will look once delivery is connected
 * (round-2 review, F15). Rendered by the same function the delivery worker
 * will call (lib/branded-print), with sample content.
 */
export function MessagePreview({ school, idPrefix = 'mp' }: { school: BrandSchool & { contact_email?: string | null }; idPrefix?: string }) {
  const [kind, setKind] = React.useState<TemplateKind>('class_moved');
  const [view, setView] = React.useState<'email' | 'text'>('email');
  const msg = React.useMemo(() => renderMessage(sampleMessage(kind, school)), [kind, school]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="min-w-[14rem]">
          <Field label="Message" htmlFor={`${idPrefix}-kind`}>
            <Select id={`${idPrefix}-kind`} value={kind} onChange={e => setKind(e.target.value as TemplateKind)}>
              {KINDS.map(k => <option key={k} value={k}>{TEMPLATE_LABELS[k]}</option>)}
            </Select>
          </Field>
        </div>
        <ViewTabs label="Preview as" value={view} onChange={setView} options={[['email', 'Email'], ['text', 'Plain text and SMS']]} />
      </div>
      <p className="text-[0.875rem]"><span className="text-ink-3">Subject </span><span className="font-semibold">{msg.subject}</span></p>
      {view === 'email'
        ? <iframe title={`Email preview: ${TEMPLATE_LABELS[kind]}`} srcDoc={msg.html} sandbox=""
            className="h-[34rem] w-full rounded-[var(--radius-lg)] border border-line bg-white" />
        : <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-[var(--radius-lg)] border border-line bg-surface p-4 font-sans text-[0.875rem]">{msg.text}</pre>}
      <p className="text-[0.8125rem] text-ink-3">
        Nothing is sent from this preview. Emails go out once the school connects delivery.
      </p>
    </div>
  );
}

/** The printed show programme with sample running order (F7). */
export function ProgrammePreview({ school }: { school: BrandSchool }) {
  const [fonts, setFonts] = React.useState('');
  React.useEffect(() => setFonts(documentFontFaces()), []);
  const html = React.useMemo(() => programmeHtml({
    school, autoPrint: false, fontFaces: fonts,
    event: { title: 'Summer Showcase', when: 'Saturday 11 July · 14:00', venue: 'Blackheath Halls' },
    rows: [
      { routine: 'Opening: Five, Six, Seven, Eight', class_name: 'Whole school', dancers: null, unnamed: 0 },
      { routine: 'Teddy Bears’ Picnic', class_name: 'Pre-school Ballet', dancers: 'Nell Ackah, Ivy Chen', unnamed: 3 },
      { routine: 'Shim Sham', class_name: 'Junior Tap', dancers: 'Elias Bennett, Nia Doherty, Zara Ellery', unnamed: 1 },
      { routine: 'Spirals', class_name: 'Contemporary Seniors', dancers: 'Amir Wright, Sofia Haddad', unnamed: 0 },
    ],
  }), [school, fonts]);
  // Same origin (no scripts), so the frame can load the app's fonts.
  return <iframe title="Printed programme preview" srcDoc={html} sandbox="allow-same-origin"
    className="h-[40rem] w-full rounded-[var(--radius-lg)] border border-line bg-white" />;
}
