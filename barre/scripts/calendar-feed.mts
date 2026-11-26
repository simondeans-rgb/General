/**
 * Calendar subscription feed (R-036), for the hosted service.
 *
 *   DATABASE_URL=… PORT=8787 npx tsx scripts/calendar-feed.mts
 *
 * Serves GET /calendar/<token>.ics. The token is the only credential: it is
 * random, made by app.issue_calendar_token(), and stops working when the
 * person makes a new link or turns it off. Calendar apps poll it, so a
 * cancellation shows up on their next refresh. Put it behind the same
 * HTTPS front door as the app; webcal:// links resolve to https://.
 */
import http from 'node:http';
import pg from 'pg';
import { toIcs } from '../src/lib/ics';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });

export async function feed(token: string): Promise<string | null> {
  const c = await pool.connect();
  try {
    await c.query('begin read only');
    await c.query('set local role service_role');
    const { rows } = await c.query(`select * from app.calendar_feed($1)`, [token]);
    await c.query('commit');
    return toIcs(rows[0]?.calendar_name ?? 'Dance classes', rows.map(r => ({
      id: r.uid.replace(/@sanaa$/, ''), title: r.title, starts_at: r.starts_at, ends_at: r.ends_at,
      location: r.location || null, description: r.description, cancelled: r.status === 'CANCELLED',
    })));
  } catch (e) {
    await c.query('rollback').catch(() => undefined);
    if (/NOT_FOUND/.test(String(e))) return null;
    throw e;
  } finally {
    c.release();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  http.createServer(async (req, res) => {
    const m = /^\/calendar\/([0-9a-f]{64})\.ics$/.exec(req.url ?? '');
    if (req.method !== 'GET' || !m) { res.writeHead(404).end(); return; }
    try {
      const body = await feed(m[1]!);
      if (body == null) { res.writeHead(410, { 'content-type': 'text/plain' }).end('This calendar link has been replaced or turned off.'); return; }
      res.writeHead(200, { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'private, max-age=900' }).end(body);
    } catch {
      res.writeHead(500).end();
    }
  }).listen(Number(process.env.PORT ?? 8787));
}
