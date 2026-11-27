'use client';

import * as React from 'react';
import { AlertTriangle, HeartPulse, Phone } from 'lucide-react';
import type { Brief } from '@/lib/repos/teaching';
import { cn } from '@/lib/cn';
import { BriefConsentLines } from './consents';

/** The child a brief is about: register rows carry student_id, student lists id. */
function briefStudentId(b: Brief): string | undefined {
  const r = b as Brief & { student_id?: string; id?: string };
  return r.student_id ?? r.id;
}

/**
 * The marker beside a child's name. Two levels, each with its own shape and
 * words as well as colour, so neither is colour-only:
 *   red triangle — urgent: there is something to do in an emergency
 *   amber heart  — a medical need is recorded; open the profile to read it
 */
export function MedicalMarker({ brief, className }: { brief: Pick<Brief, 'requires_alert' | 'has_medical_need'>; className?: string }) {
  if (brief.requires_alert) {
    return <AlertTriangle className={cn('size-4 shrink-0 text-critical', className)} role="img" aria-label="Urgent medical alert" />;
  }
  if (brief.has_medical_need) {
    return <HeartPulse className={cn('size-4 shrink-0 text-caution', className)} role="img" aria-label="Medical information recorded" />;
  }
  return null;
}

/**
 * A child's medical need in a few words, for a register line or the next
 * class: "Nut allergy · urgent". Empty when nothing is recorded.
 */
export function medicalLine(b: Pick<Brief, 'requires_alert' | 'has_medical_need' | 'allergies' | 'conditions' | 'medications'>): string {
  if (!b.requires_alert && !b.has_medical_need) return '';
  const allergy = b.allergies?.trim() ? `Allergy: ${b.allergies.trim()}` : null;
  const what = [allergy, b.conditions, b.medications].map(v => v?.trim()).filter(Boolean) as string[];
  const first = what[0] ? what[0].charAt(0).toUpperCase() + what[0].slice(1) : 'Medical information recorded';
  const text = what.length > 1 ? `${first}; ${what.slice(1).join('; ')}` : first;
  return b.requires_alert ? `${text} · urgent` : text;
}

/**
 * What a teacher needs in the room: the medical need and who to ring, side
 * by side on a wide screen, stacked on a phone. Set as rules and type: the
 * urgency is a word and a coloured rule, never a tinted box alone.
 */
export function MedicalBrief({ brief, layout = 'side' }: { brief: Brief; layout?: 'side' | 'stack' }) {
  const lines: [string, string | null][] = [
    ['Allergies', brief.allergies], ['Conditions', brief.conditions], ['Medication', brief.medications],
  ];
  const recorded = lines.filter(([, v]) => v && v.trim());
  const contacts = brief.emergency_contacts?.length
    ? brief.emergency_contacts
    : brief.emergency_contact_phone ? [{ name: brief.emergency_contact_name ?? 'Emergency contact', relationship: null, phone: brief.emergency_contact_phone }] : [];
  const tone = brief.requires_alert ? 'critical' : brief.has_medical_need ? 'caution' : 'none';

  return (
    <div className={cn('grid gap-x-8 gap-y-5', layout === 'side' && 'sm:grid-cols-2')}>
      <section aria-label="Medical" className={cn('border-l-4 pl-3',
        tone === 'critical' ? 'border-critical' : tone === 'caution' ? 'border-caution' : 'border-line')}>
        <h3 className={cn('text-[0.875rem] font-semibold',
          tone === 'critical' ? 'text-critical' : tone === 'caution' ? 'text-caution' : 'text-ink-2')}>
          {tone === 'critical' ? 'Urgent medical alert' : tone === 'caution' ? 'Medical information' : 'Medical'}
        </h3>
        {!brief.has_medical_need && <p className="mt-0.5 text-[0.875rem] text-ink-2">Nothing recorded.</p>}
        {recorded.length > 0 && (
          <dl className="mt-1.5 space-y-1.5 text-[0.9062rem]">
            {recorded.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.8125rem] text-ink-3">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {brief.action_plan && (
          <div className="mt-2">
            <p className="text-[0.8125rem] text-ink-3">In an emergency</p>
            <p className="text-[0.9062rem] font-semibold text-ink">{brief.action_plan}</p>
          </div>
        )}
      </section>

      <section aria-label="Emergency contacts">
        <h3 className="text-[0.875rem] font-semibold text-ink-2">Emergency contacts</h3>
        {contacts.length === 0 && (
          <p className="mt-0.5 text-[0.875rem] font-semibold text-caution">None recorded. Tell the office.</p>
        )}
        <ul className="divide-y divide-line">
          {contacts.map((c, n) => (
            <li key={n}>
              {c.phone ? (
                <a href={`tel:${c.phone.replace(/\s+/g, '')}`}
                   className="-mx-2 flex min-h-[48px] items-center gap-3 rounded-[var(--radius-md)] px-2 hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9062rem] font-medium">{c.name}{c.relationship ? <span className="font-normal text-ink-3"> · {c.relationship}</span> : null}</span>
                    <span className="tnum block text-[0.8438rem] text-ink-2">{c.phone}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.8438rem] font-semibold text-accent-text">
                    <Phone className="size-3.5" aria-hidden />Call</span>
                </a>
              ) : (
                <span className="block py-2 text-[0.9062rem]">{c.name}</span>
              )}
            </li>
          ))}
        </ul>
        {/* Who may collect, and who may not (UR-17). Guardians may collect unless listed. */}
        {brief.collection && brief.collection.length > 0 && (
          <div className="mt-3">
            <h3 className="text-[0.875rem] font-semibold text-ink-2">Collection</h3>
            <ul className="mt-0.5 space-y-0.5 text-[0.875rem]">
              {brief.collection.map((c, n) => (
                <li key={n} className={cn(!c.allowed && 'font-semibold text-critical')}>
                  {c.allowed ? 'May collect: ' : 'May not collect: '}{c.name}
                  {c.relationship ? <span className="font-normal text-ink-3"> · {c.relationship}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Consent is always stated; "not recorded" is never hidden (UR-08). */}
        <BriefConsentLines studentId={briefStudentId(brief)} photo={brief.photo_consent} />
      </section>
    </div>
  );
}
