import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asReader, commitAs, commitService, closeDb, expectRejected, rebuild,
         USERS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import { PLATFORM_ADMIN, OTHER_STUDIOS } from '../src/lib/db/seed/data';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const ELENA = uid(NS.user, 191);   // owner of Kestrel
const TOM = uid(NS.user, 192);     // owner of Pointe & Flex (suspended)

describe('Barre staff are not studio members', () => {
  it('see every school’s account in the console, and no child in any of them', async () => {
    await asReader(PLATFORM_ADMIN, async q => {
      const schools = await q(`select * from app.platform_studios()`);
      expect(schools).toHaveLength(4);
      const north = schools.find((s: any) => s.id === STUDIO_ID);
      expect(north).toMatchObject({ plan_code: 'studio', status: 'active', students: 50, owners: 1 });
      expect(north.owner_emails).toMatch(/@/);
      for (const t of ['family', 'student', 'guardian', 'invoice', 'communication', 'medical_record', 'attendance_record']) {
        expect(await q(`select 1 from ${t}`), t).toHaveLength(0);
      }
    });
  });

  it('nobody else can call the console functions', async () => {
    await asReader(USERS.owner, async q => {
      expect(await q(`select * from app.platform_studios()`)).toHaveLength(0);
      expect(await q(`select * from app.platform_events($1)`, [STUDIO_ID])).toHaveLength(0);
    });
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.platform_set_status($1, 'suspended', 'nope')`, [OTHER_STUDIOS.kestrel])))
        .toMatch(/FORBIDDEN/);
      expect(await expectRejected(() => q(`select * from app.platform_create_studio('X School', 'A B', 'a@b.co', 'trial')`)))
        .toMatch(/FORBIDDEN/);
    });
  });

  it('a school sees only its own account row', async () => {
    await asReader(USERS.owner, async q => {
      expect((await q(`select id from studio`)).map((r: any) => r.id)).toEqual([STUDIO_ID]);
    });
  });
});

describe('support access', () => {
  it('needs the owner’s grant before a session can start', async () => {
    await expect(commitAs(PLATFORM_ADMIN, `select app.start_support_session($1)`, [OTHER_STUDIOS.kestrel]))
      .rejects.toThrow(/not granted/);
  });

  it('once granted and opened, is read-only and never shows health records', async () => {
    await commitAs(PLATFORM_ADMIN, `select app.start_support_session($1)`, [STUDIO_ID]);
    await asReader(PLATFORM_ADMIN, async q => {
      expect((await q(`select id from family`)).length).toBe(30);
      expect((await q(`select id from invoice`)).length).toBeGreaterThan(0);
      expect(await q(`select id from medical_record`)).toHaveLength(0);
      // Nothing from any other school leaks into the view.
      expect(await q(`select id from student where studio_id = $1`, [OTHER_STUDIOS.kestrel])).toHaveLength(0);
      expect(await expectRejected(() => q(`update family set notes = 'x'`))).toMatch(/read-only transaction/);
    });
    // And in a read-write transaction the support view does not exist at all.
    await asUser(PLATFORM_ADMIN, async q => {
      expect(await q(`select id from family`)).toHaveLength(0);
      expect(await q(`update family set notes = 'x' returning id`)).toHaveLength(0);
      expect(await expectRejected(() => q(`select app.record_payment($1, 100, 'cash')`, [FAMILY.a]))).toMatch(/FORBIDDEN/);
    });
  });

  it('opening the view is on the school’s own record', async () => {
    await asReader(USERS.owner, async q => {
      const log = await q(`select summary from audit_log where entity = 'support_session'`);
      expect(log.some((l: any) => /read-only view/.test(l.summary))).toBe(true);
    });
  });

  it('ends the moment the owner revokes it', async () => {
    await commitAs(USERS.owner, `select app.revoke_support_access($1)`, [STUDIO_ID]);
    await asReader(PLATFORM_ADMIN, async q => {
      expect(await q(`select id from family`)).toHaveLength(0);
    });
  });

  it('ends when it expires', async () => {
    await commitAs(USERS.owner, `select app.grant_support_access($1, 2, 'Check registers')`, [STUDIO_ID]);
    await commitAs(PLATFORM_ADMIN, `select app.start_support_session($1)`, [STUDIO_ID]);
    await commitService(`update support_access_grant set created_at = now() - interval '3 hours',
                                                     expires_at = now() - interval '1 hour'
                          where revoked_at is null and studio_id = $1`, [STUDIO_ID]);
    await asReader(PLATFORM_ADMIN, async q => { expect(await q(`select id from family`)).toHaveLength(0); });
  });

  it('only the owner may grant it, and for at most a week', async () => {
    for (const who of [USERS.admin, USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => {
        expect(await expectRejected(() => q(`select app.grant_support_access($1, 24, 'help')`, [STUDIO_ID])))
          .toMatch(/FORBIDDEN/);
      });
    }
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.grant_support_access($1, 200, 'help')`, [STUDIO_ID])))
        .toMatch(/7 days/);
    });
  });
});

describe('a suspended school is read-only for everyone in it', () => {
  it('its owner can read, but not write', async () => {
    await asReader(TOM, async q => {
      expect(await q(`select id from location`)).toHaveLength(1);
      expect((await q(`select status, status_reason from studio`))[0].status).toBe('suspended');
    });
    await asUser(TOM, async q => {
      await expectRejected(() => q(`insert into location (studio_id, name) values ($1, 'Annex')`, [OTHER_STUDIOS.pointe]));
    });
  });

  it('suspending a working school stops parents and staff writing, and reinstating restores it', async () => {
    await commitAs(PLATFORM_ADMIN, `select app.platform_set_status($1, 'suspended', 'Unpaid since March')`, [STUDIO_ID]);
    await asReader(USERS.guardianA, async q => { expect((await q(`select id from student`)).length).toBe(3); });
    await asUser(USERS.guardianA, async q => {
      await expectRejected(() => q(`insert into communication (studio_id, kind, family_id, body)
                                     values ($1, 'direct', $2, 'hello')`, [STUDIO_ID, FAMILY.a]));
    });
    await asUser(USERS.owner, async q => {
      expect(await q(`update family set notes = 'x' returning id`)).toHaveLength(0);
    });
    await commitAs(PLATFORM_ADMIN, `select app.platform_set_status($1, 'active')`, [STUDIO_ID]);
    await asUser(USERS.owner, async q => {
      expect((await q(`update family set notes = 'x' returning id`)).length).toBe(30);
    });
  });

  it('a suspension needs a reason the owner will see', async () => {
    await asUser(PLATFORM_ADMIN, async q => {
      expect(await expectRejected(() => q(`select app.platform_set_status($1, 'suspended', '')`, [OTHER_STUDIOS.kestrel])))
        .toMatch(/say why/);
    });
  });
});

describe('plans set limits', () => {
  it('refuses the student past the plan’s limit, with a reason a person can act on', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`update studio set plan_id = (select id from plan where code = 'trial') where id = $1`, [STUDIO_ID]);
      const msg = await expectRejected(() => q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
                                                 values ($1, $2, 'One', 'More', '2018-01-01')`, [STUDIO_ID, FAMILY.a]));
      expect(msg).toMatch(/PLAN_LIMIT: The Trial plan includes up to 50 students/);
    });
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`update studio set plan_id = (select id from plan where code = 'academy') where id = $1`, [STUDIO_ID]);
      expect(await q(`insert into student (studio_id, family_id, first_name, last_name, date_of_birth)
                      values ($1, $2, 'One', 'More', '2018-01-01') returning id`, [STUDIO_ID, FAMILY.a])).toHaveLength(1);
    });
  });

  it('limits locations and staff too', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await svc(`update studio set plan_id = (select id from plan where code = 'starter') where id = $1`, [STUDIO_ID]);
      expect(await expectRejected(() => q(`insert into location (studio_id, name) values ($1, 'Third site')`, [STUDIO_ID])))
        .toMatch(/up to 1 locations/);
    });
  });

  it('only a super admin edits plans', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.platform_set_plan_limits('starter','Starter',0,1000,5,50)`)))
        .toMatch(/FORBIDDEN/);
    });
    await asUser(PLATFORM_ADMIN, async q => {
      await q(`select app.platform_set_plan_limits('starter','Starter',5900,120,1,6)`);
      expect((await q(`select price_minor, max_students from plan where code = 'starter'`))[0])
        .toEqual({ price_minor: 5900, max_students: 120 });
    });
  });
});

describe('invitations', () => {
  it('a new school: Barre creates it, the owner accepts, and runs it', async () => {
    const [{ studio_id, invitation_token: tok }] = await commitAs(PLATFORM_ADMIN,
      `select * from app.platform_create_studio('Harbour Dance', 'Sasha Reid', 'Sasha@Harbour.example', 'trial', 30)`);
    await asReader(null, async q => {
      const [p] = await q(`select * from app.invitation_preview($1)`, [tok]);
      expect(p).toMatchObject({ studio_name: 'Harbour Dance', role: 'owner', email: 'sasha@harbour.example', state: 'valid' });
      expect(await q(`select * from app.invitation_preview('not-a-token')`)).toHaveLength(0);
    });
    const sasha = randomUUID();
    const [joined] = await commitAs(sasha, `select * from app.accept_invitation($1, 'Sasha Reid')`, [tok],
      { email: 'sasha@harbour.example' });
    expect(joined).toEqual({ studio_id, role: 'owner' });
    await asReader(sasha, async q => {
      expect((await q(`select name, status from studio`))[0]).toEqual({ name: 'Harbour Dance', status: 'trialling' });
    });
    // Single use.
    await expect(commitAs(randomUUID(), `select * from app.accept_invitation($1, 'Someone')`, [tok]))
      .rejects.toThrow(/already been used/);
    // The new owner can build their team.
    await asUser(sasha, async q => {
      await q(`select app.create_invitation($1, 'admin@harbour.example', 'admin')`, [studio_id]);
      await q(`select app.create_invitation($1, 'teach@harbour.example', 'teacher', 'Kit Jones')`, [studio_id]);
    });
  });

  it('a link sent to one address cannot be used by someone signed in as another', async () => {
    const [{ t }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'new.teacher@example.com', 'teacher') t`, [STUDIO_ID]);
    await expect(commitAs(randomUUID(), `select * from app.accept_invitation($1, 'Mallory')`, [t], { email: 'mallory@example.com' }))
      .rejects.toThrow(/was sent to new.teacher@example.com/);
  });

  it('a teacher who accepts gets a staff record and their own classes, nothing else', async () => {
    const [{ t }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'ruby@example.com', 'teacher', 'Ruby Lane') t`, [STUDIO_ID]);
    const ruby = randomUUID();
    await commitAs(ruby, `select * from app.accept_invitation($1, 'Ruby Lane')`, [t]);
    await asReader(ruby, async q => {
      expect(await q(`select display_name from staff_member where user_id = $1`, [ruby])).toHaveLength(1);
      expect(await q(`select id from invoice`)).toHaveLength(0);
      expect(await q(`select id from student`)).toHaveLength(0);   // no classes yet
    });
  });

  it('a parent is invited into a family, and sees only that family', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.create_invitation($1, 'p@example.com', 'guardian')`, [STUDIO_ID])))
        .toMatch(/choose the family/);
    });
    const [{ t }] = await commitAs(USERS.owner,
      `select app.create_invitation($1, 'second.parent@example.com', 'guardian', 'Sam Wright', $2) t`, [STUDIO_ID, FAMILY.a]);
    const sam = randomUUID();
    await commitAs(sam, `select * from app.accept_invitation($1, 'Sam Wright')`, [t]);
    await asReader(sam, async q => {
      expect((await q(`select distinct family_id from student`)).map((r: any) => r.family_id)).toEqual([FAMILY.a]);
    });
  });

  it('a student login waits for a guardian unless the guardian sent it', async () => {
    const [kid] = await commitService(`select id from student where family_id = $1 and user_id is null
                                        order by date_of_birth limit 1`, [FAMILY.a]);
    const [{ t }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'kid@example.com', 'student', null, null, $2) t`,
      [STUDIO_ID, kid.id]);
    const k = randomUUID();
    await commitAs(k, `select * from app.accept_invitation($1, 'Kid')`, [t]);
    const [row] = await commitService(`select user_id, login_enabled from student where id = $1`, [kid.id]);
    expect(row).toEqual({ user_id: k, login_enabled: false });
  });

  it('who may invite whom', async () => {
    await asUser(USERS.admin, async q => {
      expect(await expectRejected(() => q(`select app.create_invitation($1, 'x@example.com', 'admin')`, [STUDIO_ID])))
        .toMatch(/only an owner/);
      await q(`select app.create_invitation($1, 'y@example.com', 'teacher')`, [STUDIO_ID]);
    });
    for (const who of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => {
        expect(await expectRejected(() => q(`select app.create_invitation($1, 'z@example.com', 'teacher')`, [STUDIO_ID])))
          .toMatch(/FORBIDDEN/);
      });
    }
    // Not into another school.
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.create_invitation($1, 'z@example.com', 'teacher')`, [OTHER_STUDIOS.kestrel])))
        .toMatch(/FORBIDDEN/);
    });
  });

  it('withdrawn and expired links do not work', async () => {
    const [{ t }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'w@example.com', 'teacher') t`, [STUDIO_ID]);
    const [inv] = await commitService(`select id from studio_invitation where email = 'w@example.com'`);
    await commitAs(USERS.owner, `select app.revoke_invitation($1)`, [inv.id]);
    await expect(commitAs(randomUUID(), `select * from app.accept_invitation($1, 'W')`, [t])).rejects.toThrow(/withdrawn/);

    const [{ t: t2 }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'e@example.com', 'teacher') t`, [STUDIO_ID]);
    await commitService(`update studio_invitation set expires_at = now() - interval '1 minute' where email = 'e@example.com'`);
    await expect(commitAs(randomUUID(), `select * from app.accept_invitation($1, 'E')`, [t2])).rejects.toThrow(/expired/);
  });

  it('the database keeps only a hash of the token', async () => {
    const [{ t }] = await commitAs(USERS.owner, `select app.create_invitation($1, 'h@example.com', 'teacher') t`, [STUDIO_ID]);
    const rows = await commitService(`select token_hash from studio_invitation where email = 'h@example.com'`);
    expect(rows[0].token_hash).not.toContain(t);
    expect(rows[0].token_hash).toHaveLength(64);
  });
});

describe('roles within a school', () => {
  it('the owner changes a teacher into an admin; an admin cannot', async () => {
    await asUser(USERS.admin, async q => {
      const [m] = await q(`select id from membership where user_id = $1 and role = 'teacher'`, [USERS.teacherTap]);
      expect(await expectRejected(() => q(`select app.set_member_role($1, 'admin')`, [m.id]))).toMatch(/only an owner/);
    });
    await asUser(USERS.owner, async q => {
      const [m] = await q(`select id from membership where user_id = $1 and role = 'teacher'`, [USERS.teacherTap]);
      await q(`select app.set_member_role($1, 'admin')`, [m.id]);
      expect((await q(`select role from membership where id = $1`, [m.id]))[0].role).toBe('admin');
    });
  });

  it('a school always keeps an owner', async () => {
    await asUser(ELENA, async q => {
      const [m] = await q(`select id from membership where user_id = $1`, [ELENA]);
      expect(await expectRejected(() => q(`select app.set_member_role($1, 'admin')`, [m.id]))).toMatch(/at least one owner/);
      expect(await expectRejected(() => q(`select app.remove_member($1)`, [m.id]))).toMatch(/at least one owner/);
    });
  });

  it('removing a parent’s access leaves the family record and closes the door', async () => {
    await asUser(USERS.owner, async q => {
      const [m] = await q(`select id from membership where user_id = $1 and role = 'guardian'`, [USERS.guardianB]);
      await q(`select app.remove_member($1)`, [m.id]);
      const [g] = await q(`select user_id from guardian where family_id = $1 and full_name = 'Joseph Adeyemi'`, [FAMILY.b]);
      expect(g.user_id).toBeNull();
    });
  });
});

describe('leaving Barre', () => {
  it('a cancelled school is kept for its notice period, then only a super admin can erase it', async () => {
    await commitAs(PLATFORM_ADMIN, `select app.platform_set_status($1, 'cancelled', 'Closing the school')`, [OTHER_STUDIOS.kestrel]);
    await expect(commitAs(PLATFORM_ADMIN, `select app.platform_purge_studio($1, 'Kestrel Ballet School')`, [OTHER_STUDIOS.kestrel]))
      .rejects.toThrow(/notice period/);
    // Elena can still read — and so export — during the notice period.
    await asReader(ELENA, async q => { expect((await q(`select id from student`)).length).toBe(3); });

    await commitService(`update studio set data_deletion_due_on = current_date - 1 where id = $1`, [OTHER_STUDIOS.kestrel]);
    await expect(commitAs(PLATFORM_ADMIN, `select app.platform_purge_studio($1, 'Kestrel')`, [OTHER_STUDIOS.kestrel]))
      .rejects.toThrow(/exactly/);
    await commitAs(PLATFORM_ADMIN, `select app.platform_purge_studio($1, 'Kestrel Ballet School')`, [OTHER_STUDIOS.kestrel]);
    const left = await commitService(`select (select count(*)::int from studio where id = $1) s,
                                             (select count(*)::int from student where studio_id = $1) st`, [OTHER_STUDIOS.kestrel]);
    expect(left[0]).toEqual({ s: 0, st: 0 });
  });
});

describe('session settings are not a way around the rules', () => {
  it('a user cannot silence notifications or the audit trail by setting flags', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      await q(`select set_config('app.quiet', 'on', true), set_config('app.purging', 'on', true),
                      set_config('app.sending_as_studio', 'on', true)`);
      const [kid] = await q(`select id from student limit 1`);
      await svc(`insert into medical_record (studio_id, student_id) values ($1, $2) on conflict (student_id) do nothing`,
        [STUDIO_ID, kid.id]);
      await q(`update medical_record set allergies = 'kiwi' where student_id = $1`, [kid.id]);
      const audit = await svc(`select 1 from audit_log where entity = 'medical_record' and actor_id = $1`, [USERS.guardianA]);
      expect(audit.length).toBeGreaterThan(0);
      const told = await svc(`select 1 from notification where kind = 'medical_updated' and created_at >= now()`);
      expect(told.length).toBeGreaterThan(0);
      const [m] = await q(`insert into communication (studio_id, kind, family_id, body) values ($1,'direct',$2,'hi')
                           returning sent_by, inbound`, [STUDIO_ID, FAMILY.a]);
      expect(m).toEqual({ sent_by: USERS.guardianA, inbound: true });
    });
  });
});
