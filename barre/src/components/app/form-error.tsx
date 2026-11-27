'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { errorText } from '@/components/ui';

/**
 * Form errors where the person is looking (UR-40).
 *
 * A sheet's body scrolls, and its save error used to render at the bottom of
 * that body — below the fold, so pressing Save appeared to do nothing. After a
 * failed save, `useFirstErrorInView` scrolls the first error (a field marked
 * invalid, or any alert) into view and moves focus to it; `SaveErrorSummary`
 * repeats the gist beside the primary button, which is where the eye already is.
 */
export function useFirstErrorInView(container: React.RefObject<HTMLElement | null>, trigger: unknown) {
  React.useEffect(() => {
    if (!trigger) return;
    // After paint, so the error the failure produced is in the DOM.
    const t = window.setTimeout(() => {
      const el = container.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
      if (!el) return;
      el.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      if (!el.matches('input, select, textarea, button') && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(t);
  }, [container, trigger]);
}

/** One line beside the footer buttons: why the save did not happen. */
export function SaveErrorSummary({ error, reason }: { error?: unknown; reason?: string | null }) {
  const text = error != null ? `Not saved. ${firstSentence(errorText(error))}` : reason;
  if (!text) return null;
  return (
    <p className={'flex w-full items-start gap-1.5 text-[12.5px] sm:w-auto sm:flex-1 sm:self-center ' +
                  (error != null ? 'text-critical' : 'text-ink-3')}>
      {error != null && <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
      <span>{text}</span>
    </p>
  );
}

function firstSentence(s: string) {
  const m = s.match(/^.{1,140}?[.!?](\s|$)/);
  return (m ? m[0] : s.length > 140 ? s.slice(0, 139) + '…' : s).trim();
}
