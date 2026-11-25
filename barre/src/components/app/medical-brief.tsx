'use client';

import * as React from 'react';
import { AlertTriangle, HeartPulse, Phone, Camera, CameraOff, UserRound } from 'lucide-react';
import type { Brief } from '@/lib/repos/teaching';
import { cn } from '@/lib/cn';

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
 * What a teacher needs in the room: the medical need and who to ring, side
 * by side on a wide screen, stacked on a phone.
 */
export function MedicalBrief({ brief, layout = 'side' }: { brief: Brief; layout?: 'side' | 'stack' }) {
  const lines: [string, string | null][] = [
    ['Allergies', brief.allergies], ['Conditions', brief.conditions], ['Medication', brief.medications],
  ];
  const recorded = lines.filter(([, v]) => v && v.trim());
  const contacts = brief.emergency_contacts?.length
    ? brief.emergency_contacts
    : brief.emergency_contact_phone ? [{ name: brief.emergency_contact_name ?? 'Emergency contact', relationship: null, phone: brief.emergency_contact_phone }] : [];

  return (
    <div className={cn('grid gap-3', layout === 'side' && 'sm:grid-cols-2')}>
      <section aria-label="Medical" className={cn('rounded-[var(--radius-md)] border p-3',
        brief.requires_alert ? 'border-critical/30 bg-critical-soft'
          : brief.has_medical_need ? 'border-caution/30 bg-caution-soft' : 'border-line bg-surface-2')}>
        <h3 className={cn('flex items-center gap-1.5 text-[13px] font-semibold',
          brief.requires_alert ? 'text-critical' : brief.has_medical_need ? 'text-caution' : 'text-ink-2')}>
          {brief.requires_alert ? <AlertTriangle className="size-4" aria-hidden />
            : <HeartPulse className="size-4" aria-hidden />}
          {brief.requires_alert ? 'Urgent medical alert' : brief.has_medical_need ? 'Medical information' : 'Medical'}
        </h3>
        {!brief.has_medical_need && <p className="mt-1 text-[13px] text-ink-2">Nothing recorded.</p>}
        {recorded.length > 0 && (
          <dl className="mt-2 space-y-1.5 text-[13.5px]">
            {recorded.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {brief.action_plan && (
          <div className="mt-2 rounded-[var(--radius-sm,6px)] bg-surface/70 p-2.5">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3">In an emergency</p>
            <p className="mt-0.5 text-[13.5px] font-medium">{brief.action_plan}</p>
          </div>
        )}
      </section>

      <section aria-label="Emergency contacts" className="rounded-[var(--radius-md)] border border-line p-3">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-2">
          <Phone className="size-4" aria-hidden /> Emergency contacts
        </h3>
        {contacts.length === 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-caution">
            <AlertTriangle className="size-3.5" aria-hidden /> None recorded — tell the office.
          </p>
        )}
        <ul className="mt-1.5 space-y-1">
          {contacts.map((c, n) => (
            <li key={n}>
              {c.phone ? (
                <a href={`tel:${c.phone.replace(/\s+/g, '')}`}
                   className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-md)] px-2 -mx-2 hover:bg-surface-2">
                  <UserRound className="size-4 shrink-0 text-ink-3" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">{c.name}{c.relationship ? <span className="font-normal text-ink-3"> · {c.relationship}</span> : null}</span>
                    <span className="tnum block text-[13px] text-accent-text">{c.phone}</span>
                  </span>
                  <span className="text-[12px] font-medium text-accent-text">Call</span>
                </a>
              ) : (
                <span className="block py-2 text-[13.5px]">{c.name}</span>
              )}
            </li>
          ))}
        </ul>
        {brief.photo_consent !== null && brief.photo_consent !== undefined && (
          <p className={cn('mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12.5px]',
            brief.photo_consent ? 'text-ink-2' : 'font-medium text-caution')}>
            {brief.photo_consent ? <Camera className="size-3.5" aria-hidden /> : <CameraOff className="size-3.5" aria-hidden />}
            {brief.photo_consent ? 'Photos allowed' : 'No photos'}
          </p>
        )}
      </section>
    </div>
  );
}
