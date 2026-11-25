import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, STUDIO_ID } from './helpers';
import { OTHER_STUDIOS } from '../src/lib/db/seed/data';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const claims = (svc: any, user: string, studio?: string) =>
  svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user, role: 'authenticated', ...(studio ? { studio } : {}) })]);

describe('teacher threads (R-054)', () => {
  it('a family’s reply reaches the teacher who wrote, and the office; other teachers see nothing', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [kid] = await svc(`select s.id, s.family_id, g.user_id guardian from enrolment e join student s on s.id = e.student_id
                                 join guardian g on g.family_id = s.family_id and g.user_id is not null
                                where e.class_id = $1 and e.status = 'active' limit 1`, [CLASS.juniorTap]);
      const [{ id: msg }] = await q(`select app.teacher_message_family($1, 'Shoes', 'Please bring tap shoes on Tuesday.') id`, [kid.id]);
      await claims(svc, kid.guardian);
      const [{ id: reply }] = await q(`insert into communication (studio_id, kind, channel, family_id, body, reply_to)
                                       values ($1, 'direct', 'in_app', $2, 'Will do, thank you!', $3) returning id`, [STUDIO_ID, kid.family_id, msg]);
      expect((await svc(`select inbound from communication where id = $1`, [reply]))[0].inbound).toBe(true);
      // The teacher sees it, is told, and answers in the thread.
      await claims(svc, USERS.teacherTap);
      expect((await q(`select id from communication where id = $1`, [reply]))).toHaveLength(1);
      expect((await q(`select 1 from notification where kind = 'message' and title like 'Reply from%'`)).length).toBeGreaterThan(0);
      const threads = await q(`select * from app.my_threads()`);
      expect(threads.map((t: any) => t.id)).toEqual(expect.arrayContaining([msg, reply]));
      expect(threads[0].family_name).toBeTruthy();
      const [{ id: answer }] = await q(`select app.teacher_reply($1, 'Great — see you then.') id`, [reply]);
      expect((await svc(`select reply_to, family_id from communication where id = $1`, [answer]))[0]).toMatchObject({ reply_to: reply, family_id: kid.family_id });
      // The office reads the whole thread.
      await claims(svc, USERS.admin);
      expect(await q(`select 1 from communication where id = any($1)`, [[msg, reply, answer]])).toHaveLength(3);
      // Another teacher does not.
      await claims(svc, USERS.teacherStreet);
      expect(await q(`select 1 from communication where id = any($1)`, [[msg, reply, answer]])).toHaveLength(0);
      expect(await expectRejected(() => q(`select app.teacher_reply($1, 'Hi')`, [reply]))).toMatch(/FORBIDDEN/);
    });
  });

  it('a family cannot attach a reply to someone else’s conversation', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [other] = await svc(`select id from communication where kind = 'direct' and family_id <> (select family_id from guardian where user_id = $1 limit 1) limit 1`, [USERS.guardianA]);
      const [fam] = await svc(`select family_id from guardian where user_id = $1 limit 1`, [USERS.guardianA]);
      expect(await expectRejected(() => q(`insert into communication (studio_id, kind, channel, family_id, body, reply_to)
        values ($1, 'direct', 'in_app', $2, 'x', $3)`, [STUDIO_ID, fam.family_id, other.id]))).toMatch(/does not belong/);
    });
  });
});

describe('notifications per school (R-051)', () => {
  it('only the chosen school’s notifications are listed; the other school shows as a count', async () => {
    await asUser(USERS.teacherModern, async (q, svc) => {
      await svc(`insert into notification (studio_id, user_id, kind, title) values ($1, $2, 'message', 'Kestrel news'), ($3, $2, 'message', 'Northstar news')`,
        [OTHER_STUDIOS.kestrel, USERS.teacherModern, STUDIO_ID]);
      await claims(svc, USERS.teacherModern, STUDIO_ID);
      const titles = (await q(`select title from notification`)).map((r: any) => r.title);
      expect(titles).toContain('Northstar news');
      expect(titles).not.toContain('Kestrel news');
      const other = await q(`select * from app.other_school_notifications()`);
      expect(other).toEqual([expect.objectContaining({ studio_id: OTHER_STUDIOS.kestrel, unread: expect.any(Number) })]);
      // Marking all read leaves the other school's alone.
      await q(`select app.mark_notifications_read(null)`);
      expect((await svc(`select read_at from notification where title = 'Kestrel news'`))[0].read_at).toBeNull();
    });
  });
});

describe('daily digest (R-037)', () => {
  it('holds routine emails back and sends one summary', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(`select app.set_email_digest(true)`);
      await svc(`update user_account set last_digest_at = now() - interval '2 days', email = coalesce(email, 'hannah@example.com') where id = $1`, [USERS.guardianA]);
      const before = (await svc(`select count(*)::int n from outbound_message where user_id = $1`, [USERS.guardianA]))[0].n;
      await svc(`insert into notification (studio_id, user_id, kind, title, body) values ($1, $2, 'request_answered', 'Your question was answered', 'Yes, shoes are fine.')`, [STUDIO_ID, USERS.guardianA]);
      expect((await svc(`select count(*)::int n from outbound_message where user_id = $1`, [USERS.guardianA]))[0].n).toBe(before);
      // Pretend it is evening in the school.
      await svc(`update studio set timezone = (select name from pg_timezone_names
                  where extract(hour from now() at time zone name) between 18 and 22 limit 1) where id = $1`, [STUDIO_ID]);
      const [{ n }] = await svc(`select app.send_digests() n`);
      expect(n).toBeGreaterThan(0);
      const [mail] = await svc(`select subject, body from outbound_message where user_id = $1 order by created_at desc limit 1`, [USERS.guardianA]);
      expect(mail.body).toMatch(/Your question was answered/);
      expect((await svc(`select app.send_digests() n`))[0].n).toBe(0);   // once a day
    });
  });
});

describe('calendar subscription (R-036)', () => {
  it('a private link shows that person’s classes, cancellations included, until replaced', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [{ t }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      expect(t).toMatch(/^[0-9a-f]{64}$/);
      const feed = await svc(`select * from app.calendar_feed($1)`, [t]);
      expect(feed.length).toBeGreaterThan(0);
      const [{ id }] = await svc(`select cs.id from class_session cs where cs.id::text || '@sanaa' = $1`, [feed.find((f: any) => new Date(f.starts_at) > new Date()).uid]);
      await svc(`update class_session set status = 'cancelled' where id = $1`, [id]);
      expect((await svc(`select status from app.calendar_feed($1) where uid = $2`, [t, id + '@sanaa']))[0].status).toBe('CANCELLED');
      const [{ t: t2 }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      expect(await expectRejected(() => svc(`select * from app.calendar_feed($1)`, [t]))).toMatch(/replaced or turned off/);
      expect((await svc(`select * from app.calendar_feed($1)`, [t2])).length).toBe(feed.length);
    });
  });
  it('anyone holding the link sees only that family’s classes', async () => {
    await asUser(USERS.guardianB, async (q, svc) => {
      const [{ t }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      const titles = (await svc(`select title from app.calendar_feed($1)`, [t])).map((r: any) => r.title as string);
      const kids = (await svc(`select first_name from student s join guardian g on g.family_id = s.family_id where g.user_id = $1`, [USERS.guardianB])).map((r: any) => r.first_name);
      expect(titles.every(x => kids.some((k: string) => x.includes(k)))).toBe(true);
    });
  });
});
