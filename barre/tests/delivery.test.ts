import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, STUDIO_ID, FAMILY } from './helpers';
import { postmark, resend, twilio, deliverBatch, fromEnv, type Provider } from '../src/lib/delivery/providers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const fake = (status: number, json: unknown) => {
  const calls: any[] = [];
  const f = (async (url: string, init: any) => { calls.push({ url, init }); return new Response(JSON.stringify(json), { status }); }) as any;
  return { f, calls };
};
const m = { id: 'm1', channel: 'email' as const, to_name: 'Hannah', to_address: 'h@example.com', subject: 'Hi', body: 'Hello' };

describe('providers', () => {
  it('Postmark, Resend and Twilio are called the way their APIs expect', async () => {
    const p = fake(200, { MessageID: 'pm-1' });
    expect(await postmark('tok', 'School <s@x.io>', p.f).send(m)).toEqual({ ok: true, ref: 'pm-1' });
    expect(p.calls[0].init.headers['X-Postmark-Server-Token']).toBe('tok');
    expect(JSON.parse(p.calls[0].init.body).To).toBe('Hannah <h@example.com>');
    const r = fake(200, { id: 're-1' });
    expect(await resend('key', 's@x.io', r.f).send(m)).toEqual({ ok: true, ref: 're-1' });
    expect(r.calls[0].init.headers.Authorization).toBe('Bearer key');
    const t = fake(201, { sid: 'SM1' });
    expect(await twilio('AC1', 'tk', '+4470000', t.f).send({ ...m, channel: 'sms', to_address: '+447700900111' })).toEqual({ ok: true, ref: 'SM1' });
    expect(t.calls[0].url).toContain('/Accounts/AC1/Messages.json');
  });
  it('a 4xx is permanent, a 5xx or 429 is retried', async () => {
    expect(await postmark('t', 'f', fake(422, {}).f).send(m)).toMatchObject({ ok: false, permanent: true });
    expect(await postmark('t', 'f', fake(503, {}).f).send(m)).toMatchObject({ ok: false, permanent: false });
    expect(await postmark('t', 'f', fake(429, {}).f).send(m)).toMatchObject({ ok: false, permanent: false });
  });
  it('without keys, nothing is sent — it is only logged', () => {
    expect(fromEnv({ DELIVERY_EMAIL: 'postmark' }).email.name).toBe('log');
    expect(fromEnv({ DELIVERY_EMAIL: 'resend', RESEND_API_KEY: 'k' }).email.name).toBe('resend');
  });
});

describe('the queue', () => {
  it('claims each message once, records sends, retries failures, and gives up after five', async () => {
    await asUser(USERS.admin, async (_q, svc) => {
      await svc(`delete from outbound_message`);
      for (const a of ['a@x.io', 'b@x.io']) await svc(`insert into outbound_message (studio_id, channel, to_address, body) values ($1, 'email', $2, 'hi')`, [STUDIO_ID, a]);
      const ok: Provider = { name: 'ok', send: async x => x.to_address.startsWith('a') ? { ok: true, ref: 'r' } : { ok: false, error: 'busy' } };
      const r1 = await deliverBatch(svc, { email: ok, sms: ok });
      expect(r1).toEqual({ claimed: 2, sent: 1, failed: 1 });
      expect(await deliverBatch(svc, { email: ok, sms: ok })).toMatchObject({ claimed: 0 });   // b waits for its retry
      const [b] = await svc(`select status, attempts, not_before > now() later from outbound_message where to_address = 'b@x.io'`);
      expect(b).toEqual({ status: 'queued', attempts: 1, later: true });
      await svc(`update outbound_message set attempts = 5, not_before = now() - interval '1 second' where to_address = 'b@x.io'`);
      await svc(`select app.outbound_result(id, false, null, 'busy') from outbound_message where to_address = 'b@x.io'`);
      expect((await svc(`select status from outbound_message where to_address = 'b@x.io'`))[0].status).toBe('failed');
    });
  });

  it('notifications are emailed to people who want email, and wait for quiet hours to end', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await svc(`delete from outbound_message`);
      await q(`select app.set_quiet_hours('00:00', '23:59')`);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      await q(`insert into communication (studio_id, kind, family_id, subject, body) values ($1, 'direct', $2, 'Costumes', 'Please bring the red one')`, [STUDIO_ID, FAMILY.a]);
      const [e] = await svc(`select o.to_address, o.subject, o.not_before > now() waits from outbound_message o where o.user_id = $1`, [USERS.guardianA]);
      expect(e).toMatchObject({ subject: 'Costumes', waits: true });
      expect(e.to_address).toMatch(/@/);
      // Turning email off for messages stops the copies.
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianA, role: 'authenticated' })]);
      await q(`select app.set_notification_preference('messages', true, false)`);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.admin, role: 'authenticated' })]);
      await q(`insert into communication (studio_id, kind, family_id, subject, body) values ($1, 'direct', $2, 'Again', 'x')`, [STUDIO_ID, FAMILY.a]);
      expect(await svc(`select 1 from outbound_message where user_id = $1 and subject = 'Again'`, [USERS.guardianA])).toHaveLength(0);
    });
  });

  it('the scheduler tick runs for every school', async () => {
    await asUser(USERS.admin, async (_q, svc) => {
      const [{ t }] = await svc(`select app.tick() t`);
      expect(t).toHaveProperty('automations');
      expect(t).toHaveProperty('released');
    });
  });
});
