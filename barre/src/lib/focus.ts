/**
 * Keyboard focus for sheets and dialogs (UR-31).
 *
 * Every modal in the app is a `role="dialog" aria-modal="true"` element inside
 * a fixed overlay. Rather than each of twenty dialogs carrying its own trap,
 * one manager (components/app/focus-manager.tsx) watches for them and:
 *   · moves focus inside when one opens,
 *   · keeps Tab and Shift+Tab within the topmost one,
 *   · closes it on Escape (through its own close control),
 *   · returns focus to whatever opened it once it has gone.
 * The decisions are plain functions here so they can be tested without a DOM.
 */

export const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'summary',
  '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]',
].join(',');

/**
 * Where Tab should go next, or null to let the browser carry on.
 * `index` is the position of the focused element among the dialog's focusable
 * elements, or -1 when focus is outside the dialog altogether.
 */
export function trapTarget(count: number, index: number, backwards: boolean): number | null {
  if (count === 0) return null;
  if (index < 0) return backwards ? count - 1 : 0;
  if (backwards && index === 0) return count - 1;
  if (!backwards && index === count - 1) return 0;
  return null;
}

/** The labels a dialog's own close control goes by, in order of preference. */
export const CLOSE_LABEL = /^(close|close details|cancel|done|not now)$/i;

export function isCloseControl(label: string | null | undefined, text: string | null | undefined): boolean {
  const l = (label ?? '').trim();
  if (l) return /^close\b/i.test(l) || CLOSE_LABEL.test(l);
  return CLOSE_LABEL.test((text ?? '').trim());
}
