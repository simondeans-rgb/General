/**
 * Registers taken where the signal is not.
 *
 * A studio basement is a poor place for wifi, and a teacher cannot wait for a
 * spinner with twelve five-year-olds at the barre. Every register write —
 * marks, "Mark the rest here", reasons and closing — is kept on the device
 * the moment it is made and sent when the connection allows (UR-04).
 *
 * The rules that keep a late sync safe, here and on the server
 * (MARK_ATTENDANCE in lib/repos/teaching.ts):
 *  1. Each mark carries the moment it was tapped (`clientMarkedAt`) and its
 *     kind: `explicit` (a tap on this child) or `rest` ("Mark the rest").
 *  2. An explicit mark always beats a "rest" mark, whatever the clocks say.
 *     Between two marks of the same kind, the later device time wins.
 *  3. The queue holds one mark per child per session — re-tapping replaces,
 *     it does not append — so a sync sends the teacher's final intent.
 *  4. "Mark the rest" lists the children it applies to when it is tapped:
 *     only those with no mark at all, counting queued marks. It never
 *     re-evaluates later.
 *  5. Closing a register is queued too, and sent only after that register's
 *     marks have gone.
 *
 * Storage is injected so this runs in tests, in the browser (localStorage)
 * and, later, in a React Native app (AsyncStorage) unchanged.
 */
export type MarkKind = 'explicit' | 'rest';

export type PendingMark = {
  sessionId: string; studentId: string; status: string; reason: string | null; clientMarkedAt: string;
  /** Missing means explicit (marks queued before kinds existed). */
  kind?: MarkKind;
  /** Who made it, so it is only ever sent as that person. */
  userId?: string;
};
export type PendingReason = { sessionId: string; studentId: string; reason: string; at: string; userId?: string };
export type PendingClose = { sessionId: string; at: string; userId?: string };

export interface QueueStorage { get(): string | null; set(v: string): void }

export const QUEUE_KEY = 'barre.pending-marks.v1';

export const localQueueStorage = (key = QUEUE_KEY): QueueStorage => ({
  get: () => { try { return localStorage.getItem(key); } catch { return null; } },
  set: v => { try { localStorage.setItem(key, v); } catch { /* full or blocked: marks stay in memory */ } },
});

const rank = (k: string | null | undefined) => (k === 'rest' ? 0 : k === 'reported' ? 1 : 2);

/** Whether `incoming` should replace `held` for the same child (rule 2). */
export function supersedes(incoming: Pick<PendingMark, 'kind' | 'clientMarkedAt'>, held: Pick<PendingMark, 'kind' | 'clientMarkedAt'>): boolean {
  const a = rank(incoming.kind ?? 'explicit'), b = rank(held.kind ?? 'explicit');
  if (a !== b) return a > b;
  return incoming.clientMarkedAt >= held.clientMarkedAt;
}

/** A register row as the server has it. */
export type RosterRow = { student_id: string; status: string | null; is_trial?: boolean };

/**
 * Who "Mark the rest here" applies to, decided at the moment of the tap:
 * children with no mark on the server and none waiting on this device.
 */
export function restTargets(rows: readonly RosterRow[], queued: readonly PendingMark[]): { studentId: string; status: string }[] {
  const held = new Set(queued.map(m => m.studentId));
  return rows.filter(r => !r.status && !held.has(r.student_id))
    .map(r => ({ studentId: r.student_id, status: r.is_trial ? 'trial' : 'present' }));
}

/** The register as the teacher should see it: what is waiting on this phone shows at once. */
export function mergeView<R extends RosterRow & { reason?: string | null }>(rows: readonly R[], queued: readonly PendingMark[], reasons: readonly PendingReason[] = []): (R & { waiting: boolean })[] {
  const byChild = new Map(queued.map(m => [m.studentId, m]));
  const why = new Map(reasons.map(r => [r.studentId, r.reason]));
  return rows.map(r => {
    const m = byChild.get(r.student_id);
    const reason = why.has(r.student_id) ? why.get(r.student_id)! : m ? m.reason : r.reason ?? null;
    return m ? { ...r, status: m.status, reason, waiting: true } : { ...r, reason, waiting: why.has(r.student_id) };
  });
}

type Stored = { v: 2; marks: PendingMark[]; reasons: PendingReason[]; closes: PendingClose[] };

export type Rejection = { what: 'mark' | 'reason' | 'close'; sessionId: string; studentId?: string; error: string };

export type Senders = {
  mark: (m: PendingMark) => Promise<void>;
  reason?: (r: PendingReason) => Promise<void>;
  close?: (c: PendingClose) => Promise<void>;
};

export class AttendanceQueue {
  private marks: PendingMark[] = [];
  private reasons: PendingReason[] = [];
  private closes: PendingClose[] = [];
  private listeners = new Set<() => void>();
  /** Writes the server refused in the last flush (not connection failures). */
  lastRejected: Rejection[] = [];
  /** Marks sent in the last minute, kept in memory until the screen has
   *  re-read the register, so a fast "Mark the rest" never counts them as
   *  unmarked. */
  private sent: { mark: PendingMark; at: number }[] = [];

  /** Marks sent recently for this register. */
  recent(sessionId: string): PendingMark[] {
    const cutoff = Date.now() - 60_000;
    this.sent = this.sent.filter(x => x.at > cutoff);
    return this.sent.filter(x => x.mark.sessionId === sessionId).map(x => x.mark);
  }

  constructor(private store: QueueStorage) { this.reload(); }

  /** Re-read storage (another tab may have written). */
  reload() {
    let raw: unknown = null;
    try { raw = JSON.parse(this.store.get() ?? 'null'); } catch { raw = null; }
    if (Array.isArray(raw)) { this.marks = raw as PendingMark[]; this.reasons = []; this.closes = []; }   // version 1
    else if (raw && typeof raw === 'object' && (raw as Stored).v === 2) {
      const s = raw as Stored;
      this.marks = Array.isArray(s.marks) ? s.marks : [];
      this.reasons = Array.isArray(s.reasons) ? s.reasons : [];
      this.closes = Array.isArray(s.closes) ? s.closes : [];
    } else { this.marks = []; this.reasons = []; this.closes = []; }
  }

  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }

  /** Marks waiting to be sent. */
  get pending(): readonly PendingMark[] { return this.marks; }
  get pendingReasons(): readonly PendingReason[] { return this.reasons; }
  get pendingCloses(): readonly PendingClose[] { return this.closes; }
  /** Everything waiting: marks, reasons and closes. */
  get size() { return this.marks.length + this.reasons.length + this.closes.length; }

  forSession(sessionId: string) { return this.marks.filter(i => i.sessionId === sessionId); }
  reasonsFor(sessionId: string) { return this.reasons.filter(i => i.sessionId === sessionId); }
  closing(sessionId: string) { return this.closes.some(c => c.sessionId === sessionId); }

  /** Keep a mark. Returns false if a mark already held wins over it. */
  add(mark: PendingMark): boolean {
    const m = { ...mark, kind: mark.kind ?? 'explicit' };
    const i = this.marks.findIndex(x => x.sessionId === m.sessionId && x.studentId === m.studentId);
    if (i >= 0 && !supersedes(m, this.marks[i]!)) return false;
    if (i >= 0) this.marks.splice(i, 1);
    this.marks.push(m);
    // A new mark carries its own reason; an older one waiting for this child is replaced.
    this.reasons = this.reasons.filter(r => !(r.sessionId === m.sessionId && r.studentId === m.studentId));
    this.save();
    return true;
  }

  /** "Mark the rest here": the list is fixed now, never re-evaluated at sync. */
  markRest(sessionId: string, targets: { studentId: string; status: string }[], at: string, userId?: string): number {
    let n = 0;
    for (const t of targets) {
      if (this.marks.some(x => x.sessionId === sessionId && x.studentId === t.studentId)) continue;
      this.marks.push({ sessionId, studentId: t.studentId, status: t.status, reason: null, clientMarkedAt: at, kind: 'rest', userId });
      n++;
    }
    if (n) this.save();
    return n;
  }

  /** A reason against an absence. Folded into a waiting mark when there is one. */
  setReason(r: PendingReason) {
    const m = this.marks.find(x => x.sessionId === r.sessionId && x.studentId === r.studentId);
    if (m) { m.reason = r.reason || null; this.save(); return; }
    this.reasons = this.reasons.filter(x => !(x.sessionId === r.sessionId && x.studentId === r.studentId));
    this.reasons.push(r);
    this.save();
  }

  close(c: PendingClose) {
    if (this.closing(c.sessionId)) return;
    this.closes.push(c);
    this.save();
  }

  /**
   * Send everything, oldest tap first, then reasons, then closes. Anything
   * that cannot reach the server stays queued; anything the server refuses
   * is dropped and listed in `lastRejected`, so it is said, not retried for
   * ever. `only` limits the flush to one person's writes.
   */
  async flush(send: Senders | Senders['mark'], only?: (userId: string | undefined) => boolean): Promise<{ sent: number; failed: number }> {
    const s: Senders = typeof send === 'function' ? { mark: send } : send;
    const mine = (u: string | undefined) => !only || only(u);
    let sent = 0, failed = 0;
    this.lastRejected = [];
    const blocked = new Set<string>();   // sessions with something still waiting

    const batch = this.marks.filter(m => mine(m.userId)).sort((a, b) => a.clientMarkedAt.localeCompare(b.clientMarkedAt));
    for (const m of batch) {
      try {
        await s.mark(m);
        this.marks = this.marks.filter(x => x !== m);
        this.sent.push({ mark: m, at: Date.now() });
        this.save();          // progress is kept even if the app closes mid-send
        sent++;
      } catch (e) {
        if (isOfflineError(e)) { failed++; blocked.add(m.sessionId); continue; }
        this.marks = this.marks.filter(x => x !== m);
        this.lastRejected.push({ what: 'mark', sessionId: m.sessionId, studentId: m.studentId, error: message(e) });
      }
    }
    if (s.reason) {
      for (const r of this.reasons.filter(x => mine(x.userId))) {
        try { await s.reason(r); this.reasons = this.reasons.filter(x => x !== r); this.save(); sent++; }
        catch (e) {
          if (isOfflineError(e)) { failed++; blocked.add(r.sessionId); continue; }
          this.reasons = this.reasons.filter(x => x !== r);
          this.lastRejected.push({ what: 'reason', sessionId: r.sessionId, studentId: r.studentId, error: message(e) });
        }
      }
    }
    if (s.close) {
      for (const c of this.closes.filter(x => mine(x.userId))) {
        if (blocked.has(c.sessionId) || this.marks.some(m => m.sessionId === c.sessionId)) { failed++; continue; }
        try { await s.close(c); this.closes = this.closes.filter(x => x !== c); this.save(); sent++; }
        catch (e) {
          if (isOfflineError(e)) { failed++; continue; }
          this.closes = this.closes.filter(x => x !== c);
          this.lastRejected.push({ what: 'close', sessionId: c.sessionId, error: message(e) });
        }
      }
    }
    this.save();
    return { sent, failed };
  }

  private save() {
    const v: Stored = { v: 2, marks: this.marks, reasons: this.reasons, closes: this.closes };
    this.store.set(JSON.stringify(v));
    this.listeners.forEach(f => f());
  }
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Errors that mean "could not reach the server", as opposed to "refused". */
export function isOfflineError(e: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const msg = message(e);
  return /Failed to fetch|NetworkError|Load failed|network request failed|ECONNREFUSED|ETIMEDOUT|OFFLINE/i.test(msg);
}
