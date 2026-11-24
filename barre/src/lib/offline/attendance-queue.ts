/**
 * Registers taken where the signal is not.
 *
 * A studio basement is a poor place for wifi, and a teacher cannot wait for a
 * spinner with twelve five-year-olds at the barre. Marks that fail to reach
 * the server are kept on the device and sent when the connection returns.
 *
 * Two rules make this safe:
 *  1. Each mark carries the moment it was tapped (`clientMarkedAt`). The
 *     server keeps the newest tap, not the latest arrival (see
 *     MARK_ATTENDANCE), so a late sync cannot undo a correction.
 *  2. The queue holds one entry per child per session — re-tapping replaces,
 *     it does not append — so a sync sends the teacher's final intent.
 *
 * Storage is injected so this runs in tests, in the browser (localStorage)
 * and, later, in a React Native app (AsyncStorage) unchanged.
 */
export type PendingMark = {
  sessionId: string; studentId: string; status: string; reason: string | null; clientMarkedAt: string;
};

export interface QueueStorage { get(): string | null; set(v: string): void }

export const localQueueStorage = (key = 'barre.pending-marks.v1'): QueueStorage => ({
  get: () => { try { return localStorage.getItem(key); } catch { return null; } },
  set: v => { try { localStorage.setItem(key, v); } catch { /* full or blocked: marks stay in memory */ } },
});

export class AttendanceQueue {
  private items: PendingMark[];
  constructor(private store: QueueStorage) {
    try { this.items = JSON.parse(store.get() ?? '[]'); } catch { this.items = []; }
    if (!Array.isArray(this.items)) this.items = [];
  }

  get pending(): readonly PendingMark[] { return this.items; }
  forSession(sessionId: string) { return this.items.filter(i => i.sessionId === sessionId); }

  add(mark: PendingMark) {
    const i = this.items.findIndex(x => x.sessionId === mark.sessionId && x.studentId === mark.studentId);
    if (i >= 0 && this.items[i]!.clientMarkedAt > mark.clientMarkedAt) return;   // an older tap
    if (i >= 0) this.items.splice(i, 1);
    this.items.push(mark);
    this.save();
  }

  /** Send everything, oldest tap first. Anything that fails stays queued. */
  async flush(send: (m: PendingMark) => Promise<void>): Promise<{ sent: number; failed: number }> {
    let sent = 0, failed = 0;
    const batch = [...this.items].sort((a, b) => a.clientMarkedAt.localeCompare(b.clientMarkedAt));
    for (const m of batch) {
      try {
        await send(m);
        this.items = this.items.filter(x => x !== m);
        sent++;
      } catch { failed++; }
    }
    this.save();
    return { sent, failed };
  }

  private save() { this.store.set(JSON.stringify(this.items)); }
}

/** Errors that mean "could not reach the server", as opposed to "refused". */
export function isOfflineError(e: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /Failed to fetch|NetworkError|Load failed|network request failed|ECONNREFUSED|ETIMEDOUT/i.test(msg);
}
