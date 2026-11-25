/**
 * Email and text delivery (R-003). One small interface, three providers and a
 * log-only stand-in. Which one runs is configuration:
 *
 *   DELIVERY_EMAIL = postmark | resend | log      (POSTMARK_TOKEN / RESEND_API_KEY)
 *   DELIVERY_SMS   = twilio | log                  (TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM)
 *   DELIVERY_FROM  = "Northstar Dance <hello@northstar.example>"
 *
 * Keys live in the server's environment only — never in the browser build.
 */
export type Outbound = { id: string; channel: 'email' | 'sms' | 'push'; to_name: string | null; to_address: string;
  subject: string | null; body: string; studio_name?: string | null };
export type Sent = { ok: true; ref: string } | { ok: false; error: string; permanent?: boolean };
export type Provider = { name: string; send(m: Outbound): Promise<Sent> };
type Fetch = typeof fetch;

const fail = async (r: Response): Promise<Sent> => ({ ok: false, error: `${r.status} ${(await r.text()).slice(0, 200)}`,
  permanent: r.status >= 400 && r.status < 500 && r.status !== 429 });

export function postmark(token: string, from: string, f: Fetch = fetch): Provider {
  return { name: 'postmark', async send(m) {
    const r = await f('https://api.postmarkapp.com/email', { method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': token },
      body: JSON.stringify({ From: from, To: m.to_name ? `${m.to_name} <${m.to_address}>` : m.to_address,
        Subject: m.subject ?? 'A message from your dance school', TextBody: m.body, MessageStream: 'outbound' }) });
    if (!r.ok) return fail(r);
    return { ok: true, ref: (await r.json()).MessageID };
  } };
}

export function resend(key: string, from: string, f: Fetch = fetch): Provider {
  return { name: 'resend', async send(m) {
    const r = await f('https://api.resend.com/emails', { method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [m.to_address], subject: m.subject ?? 'A message from your dance school', text: m.body }) });
    if (!r.ok) return fail(r);
    return { ok: true, ref: (await r.json()).id };
  } };
}

export function twilio(sid: string, token: string, from: string, f: Fetch = fetch): Provider {
  return { name: 'twilio', async send(m) {
    const body = new URLSearchParams({ To: m.to_address, From: from, Body: (m.subject ? `${m.subject}: ` : '') + m.body });
    const r = await f(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body });
    if (!r.ok) return fail(r);
    return { ok: true, ref: (await r.json()).sid };
  } };
}

export function logOnly(print: (s: string) => void = console.log): Provider {
  return { name: 'log', async send(m) { print(`[${m.channel}] to ${m.to_address}: ${m.subject ?? ''} — ${m.body.slice(0, 80)}`); return { ok: true, ref: `log-${m.id}` }; } };
}

/** Web push (R-017). `send` is web-push's sendNotification, injected so tests need no network. */
export type PushSend = (sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<{ statusCode: number }>;
export function webPush(send: PushSend, keys: (endpoint: string) => Promise<{ p256dh: string; auth: string } | null>): Provider {
  return { name: 'webpush', async send(m) {
    const k = await keys(m.to_address);
    if (!k) return { ok: false, error: 'subscription gone', permanent: true };
    try {
      const r = await send({ endpoint: m.to_address, keys: k }, m.body);
      return { ok: true, ref: String(r.statusCode) };
    } catch (e: any) {
      const code = e?.statusCode as number | undefined;
      return { ok: false, error: `${code ?? ''} ${String(e?.body ?? e).slice(0, 160)}`, permanent: code === 404 || code === 410 };
    }
  } };
}

export function fromEnv(env: Record<string, string | undefined>, f: Fetch = fetch): { email: Provider; sms: Provider; push?: Provider } {
  const from = env.DELIVERY_FROM ?? 'Sanaa <no-reply@sanaa.example>';
  const email = env.DELIVERY_EMAIL === 'postmark' && env.POSTMARK_TOKEN ? postmark(env.POSTMARK_TOKEN, from, f)
    : env.DELIVERY_EMAIL === 'resend' && env.RESEND_API_KEY ? resend(env.RESEND_API_KEY, from, f) : logOnly();
  const sms = env.DELIVERY_SMS === 'twilio' && env.TWILIO_SID && env.TWILIO_TOKEN && env.TWILIO_FROM
    ? twilio(env.TWILIO_SID, env.TWILIO_TOKEN, env.TWILIO_FROM, f) : logOnly();
  return { email, sms };
}

/** One pass of the worker: claim, send, record. Pure apart from `q` and the providers. */
export async function deliverBatch(q: (sql: string, p?: unknown[]) => Promise<any[]>, p: { email: Provider; sms: Provider; push?: Provider }, limit = 50) {
  const batch = await q(`select * from app.claim_outbound($1)`, [limit]);
  let sent = 0, failed = 0;
  for (const m of batch as Outbound[]) {
    let res: Sent;
    const via = m.channel === 'sms' ? p.sms : m.channel === 'push' ? (p.push ?? logOnly()) : p.email;
    try { res = await via.send(m); }
    catch (e) { res = { ok: false, error: String(e).slice(0, 200) }; }
    if (res.ok) { sent++; await q(`select app.outbound_result($1, true, $2, null)`, [m.id, res.ref]); }
    else {
      failed++;
      // A permanent refusal (bad address) is not retried.
      if (res.permanent) await q(`update outbound_message set attempts = 5 where id = $1`, [m.id]);
      // A phone that has unsubscribed is forgotten, so it is not tried again.
      if (res.permanent && m.channel === 'push') await q(`delete from push_subscription where endpoint = $1`, [m.to_address]);
      await q(`select app.outbound_result($1, false, null, $2)`, [m.id, res.error]);
    }
  }
  return { claimed: batch.length, sent, failed };
}
