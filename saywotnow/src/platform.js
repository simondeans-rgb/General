// Hand-offs to the device: mail, phone, share sheet and clipboard.
import { mailtoUrl, emailAsText } from './lib/email.js';

export function openMail(email) {
  const url = mailtoUrl(email);
  // A temporary anchor works in standalone PWAs where location changes can be blocked.
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function callNumber(phone) {
  const a = document.createElement('a');
  a.href = `tel:${String(phone).replace(/[^\d+]/g, '')}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function canShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function shareEmail(email) {
  await navigator.share({ title: email.subject, text: emailAsText(email) });
}

let clearTimer = null;
let lastCopied = null;

/**
 * Copies text, then tries to clear it from the clipboard after 2 minutes (P6).
 * Browsers only allow clipboard writes while the page is open and focused, so
 * the clear is best effort.
 */
export async function copySensitive(text, { clearAfterMs = 120000 } = {}) {
  await navigator.clipboard.writeText(text);
  lastCopied = text;
  clearTimeout(clearTimer);
  clearTimer = setTimeout(async () => {
    // Best effort: browsers only allow the write while the page has focus, and
    // reading the clipboard back first would trigger a permission prompt.
    try {
      if (document.hasFocus() && lastCopied) await navigator.clipboard.writeText('');
    } catch { /* not focused or not allowed */ }
    lastCopied = null;
  }, clearAfterMs);
}

/** Plain copy for non-sensitive text (e.g. a guide's opening line). */
export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}
