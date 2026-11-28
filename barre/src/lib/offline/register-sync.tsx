'use client';

/**
 * The device's register queue, shared by every screen, and the one thing
 * that sends it (UR-04). Register writes never go through the data-fetching
 * library's mutations: those pause silently while the browser says it is
 * offline. Here a write is on the device the moment it is made, and a sender
 * runs whenever the connection allows — on any screen, not only the register.
 */
import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AttendanceQueue, localQueueStorage, QUEUE_KEY, type Rejection } from './attendance-queue';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Notice } from '@/components/ui';
import * as T from '@/lib/repos/teaching';

let queue: AttendanceQueue | null = null;
export function registerQueue(): AttendanceQueue {
  queue ??= new AttendanceQueue(localQueueStorage());
  return queue;
}

/** Re-renders when the queue changes, in this tab or another. */
export function useRegisterQueue(): AttendanceQueue {
  const q = registerQueue();
  const [, bump] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const off = q.subscribe(bump);
    const onStorage = (e: StorageEvent) => { if (e.key === QUEUE_KEY) { q.reload(); bump(); } };
    window.addEventListener('storage', onStorage);
    return () => { off(); window.removeEventListener('storage', onStorage); };
  }, [q]);
  return q;
}

/** navigator.onLine, live. */
export function useOnline(): boolean {
  return React.useSyncExternalStore(
    cb => { window.addEventListener('online', cb); window.addEventListener('offline', cb); return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); }; },
    () => navigator.onLine,
    () => true,
  );
}

/** What the last send did, for "All marks sent" and refusals. */
type SyncState = { sentAt: number | null; rejected: Rejection[] };
const syncListeners = new Set<() => void>();
let syncState: SyncState = { sentAt: null, rejected: [] };
const setSync = (s: Partial<SyncState>) => { syncState = { ...syncState, ...s }; syncListeners.forEach(f => f()); };
export function useSyncState(): SyncState {
  return React.useSyncExternalStore(cb => { syncListeners.add(cb); return () => { syncListeners.delete(cb); }; }, () => syncState, () => syncState);
}
export const clearRejected = () => setSync({ rejected: [] });

const offline = () => new TypeError('Failed to fetch');
let flushing: Promise<void> | null = null;
let again = false;

/** Send what is waiting, as the signed-in person. Safe to call often: a
 *  call made while a send is running queues one more pass after it, so a
 *  mark tapped mid-send is not left waiting for the next timer. */
export function flushRegisterQueue(session: Parameters<typeof runAs>[0], onSent?: () => void): Promise<void> {
  if (!session) return Promise.resolve();
  if (flushing) { again = true; return flushing; }
  again = false;
  flushing = (async () => {
    const q = registerQueue();
    // The demo's database is in the tab, so it would accept writes with no
    // signal; the hosted one cannot. Treat "offline" the way hosting will.
    const guard = () => { if (typeof navigator !== 'undefined' && navigator.onLine === false) throw offline(); };
    const r = await q.flush({
      mark: async m => { guard(); await runAs(session, x => x(T.MARK_ATTENDANCE, [m.sessionId, m.studentId, m.status, m.reason, m.clientMarkedAt, m.kind ?? 'explicit'])); },
      reason: async r => { guard(); await runAs(session, x => x(T.SET_REASON, [r.sessionId, r.studentId, r.reason])); },
      close: async c => { guard(); await runAs(session, x => x(T.CLOSE_REGISTER, [c.sessionId])); },
    }, u => !u || u === session.userId);
    if (r.sent > 0 || q.lastRejected.length) {
      setSync({ sentAt: r.sent > 0 && q.size === 0 ? Date.now() : syncState.sentAt, rejected: [...syncState.rejected, ...q.lastRejected] });
      onSent?.();
    }
  })().finally(() => {
    flushing = null;
    if (again && registerQueue().size > 0 && navigator.onLine !== false) flushRegisterQueue(session, onSent).catch(() => undefined);
  });
  return flushing;
}

/** How many register writes are waiting on this device. */
export const pendingRegisterWrites = () => registerQueue().size;

/**
 * Mounted once for the whole app: sends the queue when the connection
 * returns, now and then while anything waits, and stops a sign-out that
 * would strand unsent marks.
 */
export function RegisterSync() {
  const { session } = useSession();
  const qc = useQueryClient();
  const q = useRegisterQueue();
  const online = useOnline();
  const [blocked, setBlocked] = React.useState(false);

  const send = React.useCallback(() => {
    if (!session || !navigator.onLine || registerQueue().size === 0) return;
    flushRegisterQueue(session, () => qc.invalidateQueries({ queryKey: ['db'] })).catch(() => undefined);
  }, [session, qc]);

  React.useEffect(() => { if (online) send(); }, [online, send]);
  React.useEffect(() => {
    if (!q.size) return;
    const t = setInterval(send, 15_000);
    return () => clearInterval(t);
  }, [q.size, send]);
  React.useEffect(() => {
    const onBlocked = () => setBlocked(true);
    window.addEventListener('barre:signout-blocked', onBlocked);
    return () => window.removeEventListener('barre:signout-blocked', onBlocked);
  }, []);

  if (!blocked) return null;
  const n = q.pending.length;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 p-4 sm:items-center" onClick={() => setBlocked(false)}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="so-h" aria-describedby="so-d" onClick={e => e.stopPropagation()}
           className="w-full max-w-md rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-lg">
        <Notice word="Not sent" tone="caution" title={<span id="so-h">Register marks have not been sent yet</span>}
          detail={<span id="so-d">{n > 0 ? `${n} mark${n === 1 ? ' is' : 's are'}` : 'A register is'} saved on this phone and will be lost if you sign out now.
            {online ? ' They are sending now — try again in a moment.' : ' Connect to the internet so they can send, then sign out.'}</span>} />
        <Button className="mt-4 w-full" variant="primary" autoFocus onClick={() => setBlocked(false)}>Stay signed in</Button>
      </div>
    </div>
  );
}
