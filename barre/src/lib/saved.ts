/**
 * The "Saved" status line (U5): one short sentence after a save lands, read
 * out politely by screen readers and gone after a few seconds. A store rather
 * than context, so a sheet that has already closed can still announce.
 */
export type SavedNote = { id: number; text: string };

const SHOW_MS = 4_000;
let notes: SavedNote[] = [];
let next = 1;
const subs = new Set<() => void>();
const emit = () => { notes = [...notes]; subs.forEach(f => f()); };

export function announceSaved(text: string) {
  const id = next++;
  // One line at a time: a newer save replaces the older note.
  notes = [{ id, text }];
  emit();
  setTimeout(() => { notes = notes.filter(n => n.id !== id); emit(); }, SHOW_MS);
}

export function subscribeSaved(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }
export function savedNotes() { return notes; }
