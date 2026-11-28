/**
 * Hosted file storage: Supabase Storage, private bucket, short-lived signed URLs.
 *
 * Not used by the demo (which keeps bytes in the in-browser database), and it
 * cannot run here: there is no Supabase project behind this build. It is the
 * real adapter a hosted deployment switches on, written against the Storage
 * REST API so it needs no extra dependency, and the parts that matter for
 * safety are covered by tests with a stubbed fetch (tests/video-access.test.ts).
 *
 * The rules it keeps (docs/SECURITY.md, "Media of children"):
 *   - the bucket is private; this file never builds an `/object/public/` URL
 *   - every read is a signed URL that expires in MEDIA_URL_TTL_SECONDS
 *   - a URL is only signed for a caller the database says may read the file
 *     (app.can_read_media, the same check the bucket's own policy calls),
 *     so withdrawing consent stops new URLs at once and old ones lapse in
 *     about a minute
 *   - nothing stores the signed URL; it is minted on each Play
 */

/** How long a signed media URL lives. Long enough to start playback. */
export const MEDIA_URL_TTL_SECONDS = 60;
/** Never sign for longer than this, whatever the caller asks. */
export const MEDIA_URL_TTL_MAX = 300;

export type HostedStorageConfig = {
  /** https://<project>.supabase.co */
  url: string;
  /** The project's anon key (public by design; RLS does the work). */
  anonKey: string;
  /** A PRIVATE bucket. Public buckets are refused. */
  bucket: string;
  /** The signed-in person's access token (Supabase Auth). */
  accessToken: () => Promise<string | null>;
  /** Asks the database, as the caller, whether they may read this object. */
  canRead: (objectKey: string, viewer?: unknown) => Promise<boolean>;
  ttlSeconds?: number;
  maxBytes?: number;
  fetch?: typeof fetch;
};

export const OBJECT_PREFIX = 'object:';

/** `<studio>/<resource>/<random>.<ext>`: the first folder is the school, which
 *  the bucket's insert policy checks against the uploader's staff role. */
export function objectKeyFor(studioId: string, resourceId: string, fileName: string, rand: string): string {
  const ext = (fileName.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  return `${studioId}/${resourceId}/${rand}${ext ? '.' + ext : ''}`;
}

export function objectKeyFromPath(path: string): string | null {
  return path.startsWith(OBJECT_PREFIX) ? path.slice(OBJECT_PREFIX.length) : null;
}

const encodeKey = (key: string) => key.split('/').map(encodeURIComponent).join('/');

export function createHostedMedia(config: HostedStorageConfig) {
  const f = config.fetch ?? fetch;
  const base = config.url.replace(/\/+$/, '');
  const ttl = Math.max(1, Math.min(config.ttlSeconds ?? MEDIA_URL_TTL_SECONDS, MEDIA_URL_TTL_MAX));

  async function headers(extra: Record<string, string> = {}) {
    const token = await config.accessToken();
    if (!token) throw new Error('Sign in again to open this file.');
    return { apikey: config.anonKey, Authorization: `Bearer ${token}`, ...extra };
  }

  return {
    ttl,
    /** Put the bytes in the private bucket. Never upserts over another file. */
    async put(key: string, body: Blob, mime: string): Promise<void> {
      const res = await f(`${base}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeKey(key)}`, {
        method: 'POST', body, headers: await headers({ 'Content-Type': mime, 'x-upsert': 'false', 'cache-control': 'private, max-age=0' }),
      });
      if (!res.ok) throw new Error('The file store refused the upload.');
    },

    /** A short-lived URL for one object, or null if this person may not have it. */
    async sign(key: string, viewer?: unknown): Promise<string | null> {
      if (!(await config.canRead(key, viewer))) return null;
      const res = await f(`${base}/storage/v1/object/sign/${encodeURIComponent(config.bucket)}/${encodeKey(key)}`, {
        method: 'POST', body: JSON.stringify({ expiresIn: ttl }),
        headers: await headers({ 'Content-Type': 'application/json' }),
      });
      if (!res.ok) return null;
      const json = await res.json() as { signedURL?: string; signedUrl?: string };
      const rel = json.signedURL ?? json.signedUrl;
      if (!rel || !/[?&]token=/.test(rel) || rel.includes('/object/public/')) return null;
      return rel.startsWith('http') ? rel : `${base}/storage/v1${rel.startsWith('/') ? '' : '/'}${rel}`;
    },

    async remove(key: string): Promise<void> {
      await f(`${base}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeKey(key)}`, {
        method: 'DELETE', headers: await headers(),
      });
    },
  };
}
