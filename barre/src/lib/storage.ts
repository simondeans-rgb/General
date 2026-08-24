'use client';

import { runAs, type Query, type Session } from '@/lib/db/client';

/**
 * File storage.
 *
 * Uploading a routine video should be the same code whichever backend the
 * studio runs on, so it goes through this interface. `resource.storage_path`
 * holds the handle, and the adapter knows how to turn it back into something
 * playable.
 *
 *   demo      bytes in Postgres (compiled to WASM, so "the server" is the tab)
 *   hosted    Supabase Storage, path into a private bucket, signed on read
 *
 * Nothing above this file knows which one is in use.
 */

export type StoredFile = { path: string; size: number; mime: string; name: string };

export interface StorageAdapter {
  readonly label: string;
  readonly maxBytes: number;
  /**
   * Runs inside the caller's transaction. Creating the resource row, storing
   * the bytes and pinning it to a class is one unit of work: if the upload
   * fails, the half-made resource must go with it rather than linger in the
   * library pointing at nothing.
   */
  upload(file: File, ctx: { q: Query; resourceId: string; studioId: string }): Promise<StoredFile>;
  /** A URL the browser can play or download. Revoke it with `release`. */
  resolve(path: string, session: Session): Promise<string | null>;
  release(url: string): void;
}

/* -------------------------------------------------------------------------
   Demo adapter: the bytes go in the database.
   Postgres is running in the tab, so this is genuinely the same round trip a
   server would do — insert, then read back and hand the browser a blob.
   ------------------------------------------------------------------------- */
const DEMO_MAX = 20 * 1024 * 1024;

export const localStorageAdapter: StorageAdapter = {
  label: 'this browser',
  maxBytes: DEMO_MAX,

  async upload(file, { q, resourceId, studioId }) {
    if (file.size > DEMO_MAX) {
      throw new Error(`That file is ${formatBytes(file.size)}. The demo stores files in the browser, so it caps them at ${formatBytes(DEMO_MAX)}.`);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = file.type || guessMime(file.name);

    const [row] = await q<{ id: string }>(
      `insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,
      [studioId, resourceId, file.name, mime, file.size, bytes]);
    if (!row) throw new Error('The database refused the upload.');

    const path = `local:${row.id}`;
    await q(`update resource set storage_path = $2, url = null where id = $1`, [resourceId, path]);
    return { path, size: file.size, mime, name: file.name };
  },

  async resolve(path, session) {
    const id = path.startsWith('local:') ? path.slice(6) : null;
    if (!id) return null;
    const rows = await runAs(session, q => q<{ bytes: unknown; mime_type: string }>(
      `select bytes, mime_type from resource_file where id = $1 and deleted_at is null`, [id]));
    const row = rows[0];
    if (!row) return null;                     // no row, or RLS said no
    return URL.createObjectURL(new Blob([toBytes(row.bytes)], { type: row.mime_type }));
  },

  release(url) {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  },
};

/** Drivers hand bytea back in more than one shape depending on the runtime. */
function toBytes(value: unknown): Uint8Array<ArrayBuffer> {
  // Copy into a plain ArrayBuffer: a view over a SharedArrayBuffer is not a
  // valid BlobPart, and the driver does not promise which it hands back.
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === 'string') {
    // Postgres hex format: \x48656c6c6f
    const hex = value.startsWith('\\x') ? value.slice(2) : value;
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  throw new Error('Unrecognised binary value from the database');
}

export const storage: StorageAdapter = localStorageAdapter;

/* -------------------------------------------------------------------------
   Helpers shared by the upload UI
   ------------------------------------------------------------------------- */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

const MIME_BY_EXT: Record<string, string> = {
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', m4v: 'video/x-m4v',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', aac: 'audio/aac',
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function guessMime(name: string): string {
  return MIME_BY_EXT[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';
}

/** Which of our four kinds a file is, from its type. */
export function kindForFile(file: File): 'video' | 'audio' | 'document' {
  const mime = file.type || guessMime(file.name);
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
}

/** Read an <audio>/<video> duration without keeping the element around. */
export function probeDuration(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const kind = kindForFile(file);
    if (kind === 'document') return resolve(null);
    const url = URL.createObjectURL(file);
    const el = document.createElement(kind === 'video' ? 'video' : 'audio');
    const done = (value: number | null) => { URL.revokeObjectURL(url); resolve(value); };
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      // Anything under half a second rounds to zero, and the column insists on
      // a positive duration — "no length worth showing" is null, not 0.
      const secs = Number.isFinite(el.duration) ? Math.round(el.duration) : 0;
      done(secs > 0 ? secs : null);
    };
    el.onerror = () => done(null);
    setTimeout(() => done(null), 5000);            // never hang the upload on a codec
    el.src = url;
  });
}
