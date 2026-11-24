# Email, text and the scheduler

Barre queues every email and text in `outbound_message`. Nothing leaves the
database until a worker sends it, so the app works the same with or without a
provider connected.

## The worker

`scripts/deliver.mts` runs on the server, as the service role:

1. `app.tick()` — runs automations, releases scheduled messages, reminds the
   owner about expiring staff checks and awards show/exam milestones, for every
   school.
2. Drains the queue: claims up to 50 due messages at a time (two workers can
   never send the same one), sends them, and records the result.

Run it every minute (cron, a Supabase scheduled function, or a small worker):

```sh
DATABASE_URL=postgres://… DELIVERY_EMAIL=postmark POSTMARK_TOKEN=… \
DELIVERY_FROM="Northstar Dance <hello@northstar.example>" npx tsx scripts/deliver.mts
```

| Variable | Values |
|---|---|
| `DELIVERY_EMAIL` | `postmark`, `resend`, or unset for log-only |
| `POSTMARK_TOKEN` / `RESEND_API_KEY` | the provider key |
| `DELIVERY_SMS` | `twilio`, or unset for log-only |
| `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` | Twilio account and sending number |
| `DELIVERY_FROM` | the From line |

Without keys the worker only prints what it would send.

## Rules the queue keeps

- **Retries:** a failure is retried after 1, 4, 9 and 16 minutes; after five
  attempts the message is marked `failed` and shows in the office's outbox.
  A 4xx from the provider (bad address) is not retried.
- **Preferences:** a notification is also emailed only if the person wants
  email for that category (Notification settings). Class changes and safety
  notices cannot be switched off.
- **Quiet hours:** email waits until a person's quiet hours end — except a
  cancellation for today, which goes at once.
- **No secrets in the browser:** provider keys live only in the worker's
  environment.

The demo build has no server, so its office "Run automations" button and the
office's open app stand in for the scheduler.
