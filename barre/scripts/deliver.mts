/**
 * The hosted worker (R-002, R-003). Run it every minute from a scheduler
 * (cron, a Supabase scheduled function, or a small always-on process):
 *
 *   DATABASE_URL=… DELIVERY_EMAIL=postmark POSTMARK_TOKEN=… npx tsx scripts/deliver.mts
 *
 * Each run calls app.tick() (automations, scheduled messages, staff-check
 * reminders, milestones) and then drains the email/SMS queue. It connects as
 * the service role; nothing here is shipped to browsers.
 */
import pg from 'pg';
import webpush from 'web-push';
import { deliverBatch, fromEnv, webPush } from '../src/lib/delivery/providers';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const q = async (sql: string, p?: unknown[]) => (await client.query(sql, p as any[])).rows;
try {
  await q(`set role service_role`);
  const [{ tick }] = await q(`select app.tick() as tick`);
  const providers = fromEnv(process.env);
  // Phone notifications, once VAPID keys are set (npx web-push generate-vapid-keys).
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:support@sanaa.example', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    providers.push = webPush((sub, payload) => webpush.sendNotification(sub, payload, { TTL: 3600 }),
      async e => (await q(`select * from app.push_keys($1)`, [e]))[0] ?? null);
  }
  let total = { claimed: 0, sent: 0, failed: 0 };
  for (let i = 0; i < 20; i++) {
    const r = await deliverBatch(q, providers);
    total = { claimed: total.claimed + r.claimed, sent: total.sent + r.sent, failed: total.failed + r.failed };
    if (r.claimed === 0) break;
  }
  console.log(JSON.stringify({ tick, delivery: { ...total, email: providers.email.name, sms: providers.sms.name } }));
} finally {
  await client.end();
}
