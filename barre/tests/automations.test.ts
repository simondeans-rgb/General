import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, CLASS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const run = (q: any, at = 'now()') => q(`select app.run_automations($1, ${at}) n`, [STUDIO_ID]);

describe('automations', () => {
  it('the office can see what is due', async () => {
    await asUser(USERS.owner, async q => {
      const due = await q(`select * from app.automation_due($1)`, [STUDIO_ID]);
      expect(due.reduce((n: number, d: any) => n + d.due, 0)).toBeGreaterThan(0);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await q(`select * from app.automation_due($1)`, [STUDIO_ID])).toHaveLength(0);
    });
  });

  it('sends each message once, as the studio, with every placeholder filled', async () => {
    await asUser(USERS.owner, async q => {
      const [{ n }] = await run(q);
      expect(n).toBeGreaterThan(0);
      const [{ again }] = await q(`select app.run_automations($1) again`, [STUDIO_ID]);
      expect(again).toBe(0);
      // Families with an account hear in the app, as the studio…
      const inApp = await q(`select c.sent_by, c.inbound, c.subject, c.body from automation_run r
                              join communication c on c.id = r.communication_id`);
      for (const m of inApp) {
        expect(m.sent_by).toBeNull();
        expect(m.inbound).toBe(false);
        expect(m.subject + m.body).not.toMatch(/\{\{/);
      }
      // …prospects known only by an enquiry are queued for email, not sent.
      const queued = await q(`select o.status, o.channel, o.to_address, o.subject, o.body from automation_run r
                               join outbound_message o on o.id = r.outbound_id`);
      for (const m of queued) {
        expect(m).toMatchObject({ status: 'queued', channel: 'email' });
        expect(m.to_address).toMatch(/@/);
        expect(m.subject + m.body).not.toMatch(/\{\{/);
      }
      expect(inApp.length + queued.length).toBe(n);
      expect(queued.length).toBeGreaterThan(0);
    });
  });

  it('a switched-off rule sends nothing', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`update automation_rule set enabled = false where event = 'trial_booked'`);
      await run(q);
      const [{ n }] = await q(`select count(*)::int n from automation_run r join automation_rule a on a.id = r.rule_id
                                where a.event = 'trial_booked'`);
      expect(n).toBe(0);
    });
  });

  it('reminds 48 hours ahead, but not for a booking made inside that window', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [t] = await svc(`select t.id, cs.starts_at from trial t join class_session cs on cs.id = t.session_id
                              where t.status = 'booked' limit 1`);
      const at = `($2::timestamptz - interval '30 hours')`;
      await svc(`update trial set created_at = now() - interval '30 days' where id = $1`, [t.id]);
      await q(`select app.run_automations($1, ${at})`, [STUDIO_ID, t.starts_at]);
      const [{ n }] = await q(`select count(*)::int n from automation_run r join automation_rule a on a.id = r.rule_id
                                where a.event = 'trial_reminder_48h' and r.subject_id = $1`, [t.id]);
      expect(n).toBe(1);
    });
    await asUser(USERS.owner, async (q, svc) => {
      const [t] = await svc(`select t.id, cs.starts_at from trial t join class_session cs on cs.id = t.session_id
                              where t.status = 'booked' limit 1`);
      await svc(`update trial set created_at = $2::timestamptz - interval '40 hours' where id = $1`, [t.id, t.starts_at]);
      await q(`select app.run_automations($1, $2::timestamptz - interval '30 hours')`, [STUDIO_ID, t.starts_at]);
      const [{ n }] = await q(`select count(*)::int n from automation_run r join automation_rule a on a.id = r.rule_id
                                where a.event = 'trial_reminder_48h' and r.subject_id = $1`, [t.id]);
      expect(n).toBe(0);
    });
  });

  it('a lapsed waiting-list offer expires and the place goes to the next child', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [leaver] = await q(`select id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.grade3Ballet]);
      const [{ offered }] = await q(`select app.withdraw_enrolment($1, 'moving away') offered`, [leaver.id]);
      expect(offered).toBeTruthy();
      await svc(`update waitlist_entry set offer_expires_at = now() - interval '1 hour' where id = $1`, [offered]);
      await run(q);
      const [first] = await q(`select status from waitlist_entry where id = $1`, [offered]);
      expect(first.status).toBe('expired');
      const next = await q(`select id from waitlist_entry where class_id = $1 and status = 'offered'`, [CLASS.grade3Ballet]);
      expect(next).toHaveLength(1);
      expect(next[0].id).not.toBe(offered);
      // …and the next family is told, by the waiting-list rule.
      const told = await q(`select 1 from automation_run where subject_id = $1`, [next[0].id]);
      expect(told).toHaveLength(1);
    });
  });

  it('only the office may run them', async () => {
    for (const who of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => {
        expect(await expectRejected(() => run(q))).toMatch(/FORBIDDEN|permission denied/);
      });
    }
  });

  it('rules cannot be created or deleted from the app, only switched and pointed at a template', async () => {
    await asUser(USERS.owner, async q => {
      await expectRejected(() => q(`insert into automation_rule (studio_id, event) values ($1, 'trial_booked')`, [STUDIO_ID]));
      const r = await q(`update automation_rule set enabled = false where event = 'trial_attended' returning id`);
      expect(r).toHaveLength(1);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await q(`update automation_rule set enabled = false returning id`)).toHaveLength(0);
    });
  });
});

describe('the automations screen’s queries', () => {
  it('list rules with what is due, switch them, and run', async () => {
    const I = await import('../src/lib/repos/inbox');
    await asUser(USERS.owner, async q => {
      const rules = await q(I.RULES);
      expect(rules).toHaveLength(6);
      expect(rules.some((r: any) => r.due > 0)).toBe(true);
      await q(I.SET_RULE, [rules[0].id, false, rules[0].template_id]);
      const [{ sent }] = await q(I.RUN_AUTOMATIONS);
      expect(sent).toBeGreaterThanOrEqual(0);
      expect((await q(I.OUTBOX)).length).toBe(
        (await q(`select count(*)::int n from outbound_message`))[0].n);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await q(I.OUTBOX)).toHaveLength(0);
      expect(await q(I.RULES)).toHaveLength(0);
    });
  });
});
