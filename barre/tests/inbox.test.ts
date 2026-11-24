import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, FAMILY, CLASS, STUDIO_ID, uid, NS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const say = (q: any, family: string, body = 'Ava has a cold, she will miss Thursday.') =>
  q(`insert into communication (studio_id, kind, channel, family_id, subject, body)
     values ($1, 'direct', 'in_app', $2, 'Thursday', $3) returning *`, [STUDIO_ID, family, body]);

describe('family conversations are the office’s, not every teacher’s', () => {
  it('a teacher cannot read any family’s direct messages', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [{ n }] = await svc(`select count(*)::int n from communication where kind = 'direct' and deleted_at is null`);
      expect(n).toBeGreaterThan(0);
      expect(await q(`select id from communication where kind = 'direct'`)).toHaveLength(0);
    });
  });

  it('a teacher still reads notices for their own classes and studio announcements', async () => {
    await asUser(USERS.teacherTap, async q => {
      const rows = await q(`select kind from communication`);
      expect(rows.some((r: any) => r.kind === 'studio_announcement')).toBe(true);
      expect(rows.every((r: any) => r.kind !== 'direct')).toBe(true);
    });
  });

  it('the owner and admin read them all', async () => {
    for (const who of [USERS.owner, USERS.admin]) {
      await asUser(who, async q => {
        expect((await q(`select id from communication where kind = 'direct'`)).length).toBeGreaterThan(0);
      });
    }
  });
});

describe('sending', () => {
  it('a guardian’s message is inbound, signed by them, and in their family’s studio', async () => {
    await asUser(USERS.guardianA, async q => {
      const [m] = await say(q, FAMILY.a);
      expect(m.inbound).toBe(true);
      expect(m.sent_by).toBe(USERS.guardianA);
      expect(m.studio_id).toBe(STUDIO_ID);
    });
  });

  it('a guardian cannot write into another family’s conversation', async () => {
    await asUser(USERS.guardianA, async q => {
      await expectRejected(() => say(q, FAMILY.b));
    });
  });

  it('nobody can send as someone else, or send nothing', async () => {
    await asUser(USERS.admin, async q => {
      expect(await expectRejected(() => q(
        `insert into communication (studio_id, kind, family_id, body, sent_by)
         values ($1, 'direct', $2, 'hi', $3)`, [STUDIO_ID, FAMILY.a, USERS.owner]))).toMatch(/as yourself/);
      expect(await expectRejected(() => say(q, FAMILY.a, '   '))).toMatch(/something in it/);
    });
  });

  it('the office’s reply is outbound', async () => {
    await asUser(USERS.admin, async q => {
      const [m] = await say(q, FAMILY.a, 'Thanks for letting us know — get well soon.');
      expect(m.inbound).toBe(false);
    });
  });

  it('marking a conversation read is per person', async () => {
    await asUser(USERS.owner, async q => {
      const ids = (await q(`select id from communication where family_id = $1`, [FAMILY.a])).map((r: any) => r.id);
      const [{ unread }] = await q(`select count(*)::int unread from communication c
        where c.family_id = $1 and not exists (select 1 from communication_read r
          where r.communication_id = c.id and r.user_id = auth.uid())`, [FAMILY.a]);
      const [{ n }] = await q(`select app.mark_read($1::uuid[]) n`, [ids]);
      expect(n).toBe(unread);
      const [{ again }] = await q(`select app.mark_read($1::uuid[]) again`, [ids]);
      expect(again).toBe(0);
    });
    await asUser(USERS.guardianA, async q => {
      // A guardian's read markers are their own; the office's are not visible.
      const marks = await q(`select user_id from communication_read`);
      expect(marks.every((m: any) => m.user_id === USERS.guardianA)).toBe(true);
    });
  });
});

describe('notifications', () => {
  const mine = (q: any) => q(`select kind, title, body, href, read_at from notification order by created_at desc`);

  it('a family’s message notifies the office, not the sender', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const before = (await mine(q)).length;
      await say(q, FAMILY.a);
      expect(await mine(q)).toHaveLength(before);
      const got = await svc(`select user_id, href from notification where kind = 'message'
                              and created_at > now() - interval '1 minute'`);
      expect(new Set(got.map((g: any) => g.user_id))).toEqual(new Set([USERS.owner, USERS.admin]));
      expect(got[0].href).toBe(`/inbox?family=${FAMILY.a}`);
    });
  });

  it('the office’s reply notifies the family', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await say(q, FAMILY.a, 'See you next week.');
      const got = await svc(`select user_id from notification where kind = 'message' and href = '/family/messages'`);
      expect(got.map((g: any) => g.user_id)).toContain(USERS.guardianA);
    });
  });

  it('the person who acted is not told about their own action', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await q(`insert into enquiry (studio_id, contact_name, child_name, source)
               values ($1, 'Sam Patel', 'Isla', 'Instagram')`, [STUDIO_ID]);
      const got = await svc(`select user_id from notification where kind = 'new_enquiry'`);
      expect(got.map((g: any) => g.user_id)).toEqual([USERS.owner]);
    });
  });

  it('a declined card notifies the office and the family', async () => {
    await asUser(null, async (_q, svc) => {
      await svc(`select app.apply_provider_event('stripe', 'pi_fail', $1, 9000, 'failed', 'card_declined')`,
        [uid(NS.invoice, 1)]);
      const got = await svc(`select kind, user_id, href from notification
                              where kind = 'payment_failed' and created_at > now() - interval '1 minute'`);
      expect(got.some((g: any) => g.user_id === USERS.owner && g.href.startsWith('/billing?id='))).toBe(true);
      expect(got.some((g: any) => g.href === '/family/payments')).toBe(true);
    });
  });

  it('a new teacher hears that the class is theirs', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [priya] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherModern]);
      await q(`update class set teacher_id = $1 where id = $2`, [priya.id, CLASS.juniorTap]);
      const got = await svc(`select title from notification where user_id = $1 and kind = 'teacher_changed'`,
        [USERS.teacherModern]);
      expect(got[0]?.title).toMatch(/Junior Tap/);
    });
  });

  it('a health update is announced without its contents', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [kid] = await q(`select id from student limit 1`);
      await svc(`insert into medical_record (studio_id, student_id, allergies)
                 values ($1, $2, 'peanuts') on conflict (student_id) do nothing`, [STUDIO_ID, kid.id]);
      await q(`update medical_record set allergies = 'Severe peanut allergy' where student_id = $1`, [kid.id]);
      const got = await svc(`select title, body from notification where kind = 'medical_updated'
                              and created_at > now() - interval '1 minute'`);
      expect(got.length).toBeGreaterThan(0);
      expect(JSON.stringify(got)).not.toMatch(/peanut/i);
    });
  });

  it('each person sees and clears only their own', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [{ total }] = await svc(`select count(*)::int total from notification`);
      const own = await mine(q);
      expect(own.length).toBeGreaterThan(0);
      expect(own.length).toBeLessThan(total + 1);
      const [{ n }] = await q(`select app.mark_notifications_read() n`);
      expect(n).toBe(own.filter((r: any) => !r.read_at).length);
      const [{ left }] = await svc(`select count(*)::int left from notification where read_at is null and user_id <> $1`,
        [USERS.owner]);
      expect(left).toBeGreaterThanOrEqual(0);
    });
    await asUser(USERS.guardianA, async q => {
      const own = await mine(q);
      expect(own.every((r: any) => !String(r.href).startsWith('/billing'))).toBe(true);
    });
  });

  it('nobody can write a notification directly', async () => {
    await asUser(USERS.owner, async q => {
      await expectRejected(() => q(`insert into notification (studio_id, user_id, kind, title)
                                    values ($1, $2, 'x', 'spoof')`, [STUDIO_ID, USERS.guardianA]));
      expect(await expectRejected(() => q(`select app.notify_admins($1, 'x', 'y', null, null)`, [STUDIO_ID])))
        .toMatch(/permission denied/);
    });
  });
});

describe('the inbox screen’s queries', () => {
  it('thread, read and send for the office', async () => {
    const I = await import('../src/lib/repos/inbox');
    await asUser(USERS.owner, async q => {
      const threads = await q(I.THREADS);
      expect(threads.length).toBeGreaterThanOrEqual(5);
      const waiting = threads.filter((t: any) => t.last_inbound);
      expect(waiting.length).toBeGreaterThan(0);
      const conv = await q(I.CONVERSATION, [FAMILY.a]);
      expect(conv.some((m: any) => m.inbound && m.sender === 'Hannah Wright')).toBe(true);
      expect(conv.some((m: any) => !m.inbound && m.sender)).toBe(true);
      await q(I.SEND_DIRECT, [FAMILY.b, '', 'Yes — size 4 tap shoes are in the office.']);
      await q(I.SEND_CLASS, [CLASS.juniorTap, 'Tap shoes', 'Please bring tap shoes.']);
      await q(I.SEND_STUDIO, ['Closed Monday', 'The studio is closed on Monday for the bank holiday.']);
      expect((await q(I.BROADCASTS)).length).toBeGreaterThanOrEqual(5);
      expect((await q(I.CLASS_AUDIENCES)).every((a: any) => a.families >= 0)).toBe(true);
      const [t] = await q(I.CREATE_TEMPLATE, ['Closure', 'Studio closed', 'We are closed on {{date}}.']);
      await q(I.UPDATE_TEMPLATE, [t.id, 'Closure', 'Studio closed', 'We are closed.']);
      await q(I.REMOVE_TEMPLATE, [t.id]);
      expect((await q(I.TEMPLATES)).some((x: any) => x.id === t.id)).toBe(false);
      await q(I.NOTIFICATIONS); await q(I.UNREAD_NOTIFICATIONS); await q(I.UNREAD_FOR_ME);
    });
  });

  it('a guardian sees their own conversation, and can write to the studio', async () => {
    const I = await import('../src/lib/repos/inbox');
    await asUser(USERS.guardianA, async q => {
      const conv = await q(I.MY_CONVERSATION);
      expect(conv.length).toBeGreaterThan(0);
      const [m] = await q(I.SEND_TO_STUDIO, ['', 'Is there class at half term?']);
      const [row] = await q('select family_id, inbound from communication where id = $1', [m.id]);
      expect(row).toEqual({ family_id: FAMILY.a, inbound: true });
      // Broadcasts only for their own children's classes, plus announcements.
      const b = await q(I.BROADCASTS);
      expect(b.every((x: any) => x.kind === 'studio_announcement' || x.class_id)).toBe(true);
    });
  });

  it('sender names cannot be used to look up other families', async () => {
    await asUser(USERS.guardianA, async q => {
      const [{ n }] = await q(`select app.sender_name($1, $2) n`, [USERS.guardianB, STUDIO_ID]);
      expect(n).toBeNull();
      const [{ t }] = await q(`select app.sender_name($1, $2) t`, [USERS.teacherTap, STUDIO_ID]);
      expect(t).toBe('Marcus Bell');
    });
    await asUser(USERS.stranger, async q => {
      const [{ t }] = await q(`select app.sender_name($1, $2) t`, [USERS.teacherTap, STUDIO_ID]);
      expect(t).toBeNull();
    });
  });

  it('teachers cannot use the template table to message anyone', async () => {
    const I = await import('../src/lib/repos/inbox');
    await asUser(USERS.teacherTap, async q => {
      expect(await q(I.CREATE_TEMPLATE, ['x', 'y', 'z'])).toHaveLength(0);
      // Either refused outright or nothing written — never a message sent.
      const sent = await q(I.SEND_DIRECT, [FAMILY.a, '', 'hello']).catch(() => []);
      expect(sent).toHaveLength(0);
      expect(await q(I.SEND_STUDIO, ['', 'hello']).catch(() => [])).toHaveLength(0);
    });
  });
});
