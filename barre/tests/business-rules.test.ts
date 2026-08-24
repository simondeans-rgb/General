import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asService, closeDb, expectRejected, rebuild,
         USERS, CLASS, STUDIO_ID, uid, NS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('class capacity', () => {
  it('refuses an enrolment past capacity', async () => {
    await asUser(USERS.owner, async q => {
      const [c] = await q(`select capacity, app.class_enrolled_count(id) enrolled
                             from class where id = $1`, [CLASS.grade3Ballet]);
      expect(c.enrolled).toBe(c.capacity);          // seeded full on purpose

      const [spare] = await q(`select id from student
                                where id not in (select student_id from enrolment
                                                  where class_id = $1 and status='active')
                                limit 1`, [CLASS.grade3Ballet]);
      const msg = await expectRejected(() =>
        q(`insert into enrolment (studio_id, class_id, student_id) values ($1,$2,$3)`,
          [STUDIO_ID, CLASS.grade3Ballet, spare.id]));
      expect(msg).toMatch(/CLASS_FULL/);
    });
  });

  it('allows an enrolment once someone leaves', async () => {
    await asUser(USERS.owner, async q => {
      const [leaver] = await q(`select id from enrolment
                                 where class_id = $1 and status='active' limit 1`,
                               [CLASS.grade3Ballet]);
      await q(`update enrolment set status='left', ended_on = current_date where id = $1`, [leaver.id]);
      const [spare] = await q(`select id from student
                                where id not in (select student_id from enrolment
                                                  where class_id = $1 and status='active')
                                limit 1`, [CLASS.grade3Ballet]);
      const r = await q(`insert into enrolment (studio_id, class_id, student_id)
                         values ($1,$2,$3) returning id`,
                        [STUDIO_ID, CLASS.grade3Ballet, spare.id]);
      expect(r).toHaveLength(1);
    });
  });

  it('counts capacity across the whole class, not the caller’s visible slice', async () => {
    // The count function is SECURITY DEFINER precisely so a reader who cannot
    // see every enrolment still cannot squeeze a child into a full class.
    await asUser(USERS.teacherTap, async q => {
      const [n] = await q(`select app.class_enrolled_count($1) c`, [CLASS.grade3Ballet]);
      expect(n.c).toBeGreaterThan(0);           // he cannot see the rows themselves
      const visible = await q(`select id from enrolment where class_id = $1`, [CLASS.grade3Ballet]);
      expect(visible).toHaveLength(0);
    });
  });

  it('a student cannot hold two active places in the same class', async () => {
    await asUser(USERS.owner, async q => {
      const [e] = await q(`select class_id, student_id from enrolment
                            where status='active' and class_id <> $1 limit 1`, [CLASS.grade3Ballet]);
      const msg = await expectRejected(() =>
        q(`insert into enrolment (studio_id, class_id, student_id) values ($1,$2,$3)`,
          [STUDIO_ID, e.class_id, e.student_id]));
      expect(msg).toMatch(/enrolment_one_active_place|duplicate key/i);
    });
  });
});

describe('waiting lists', () => {
  it('assigns positions in order without a gap or a clash', async () => {
    await asUser(USERS.owner, async q => {
      const before = await q(`select position from waitlist_entry
                               where class_id = $1 and status='waiting' order by position`,
                             [CLASS.grade3Ballet]);
      expect(before.map((r: any) => r.position)).toEqual([1,2,3,4,5,6,7,8]);

      const [spare] = await q(`select id from student
                                where id not in (select student_id from waitlist_entry where class_id=$1)
                                  and id not in (select student_id from enrolment
                                                  where class_id=$1 and status='active')
                                limit 1`, [CLASS.grade3Ballet]);
      const [added] = await q(`insert into waitlist_entry (studio_id, class_id, student_id)
                               values ($1,$2,$3) returning position`,
                              [STUDIO_ID, CLASS.grade3Ballet, spare.id]);
      expect(added.position).toBe(9);
    });
  });

  it('refuses a second live entry for the same child', async () => {
    await asUser(USERS.owner, async q => {
      const [w] = await q(`select class_id, student_id from waitlist_entry
                            where status='waiting' limit 1`);
      const msg = await expectRejected(() =>
        q(`insert into waitlist_entry (studio_id, class_id, student_id) values ($1,$2,$3)`,
          [STUDIO_ID, w.class_id, w.student_id]));
      expect(msg).toMatch(/waitlist_one_live_entry|duplicate key/i);
    });
  });
});

describe('session generation', () => {
  it('creates one session per week on the right weekday', async () => {
    await asUser(USERS.owner, async q => {
      const rows = await q(`select extract(dow from cs.starts_at at time zone 'Europe/London')::int dow,
                                   count(*)::int n
                              from class_session cs where cs.class_id = $1
                             group by 1`, [CLASS.juniorTap]);
      expect(rows).toHaveLength(1);
      expect(rows[0].dow).toBe(2);                     // Junior Tap is on a Tuesday
      expect(rows[0].n).toBeGreaterThan(8);
    });
  });

  it('skips the half-term break', async () => {
    await asUser(USERS.owner, async q => {
      const [b] = await q(`select starts_on, ends_on from term_break limit 1`);
      const [clash] = await q(`select count(*)::int n from class_session cs
                                where (cs.starts_at at time zone 'Europe/London')::date
                                      between $1 and $2`, [b.starts_on, b.ends_on]);
      expect(clash.n).toBe(0);
    });
  });

  it('keeps the local start time across a daylight-saving change', async () => {
    await asUser(USERS.owner, async q => {
      const rows = await q(`select distinct
               to_char(cs.starts_at at time zone 'Europe/London', 'HH24:MI') t
          from class_session cs where cs.class_id = $1`, [CLASS.juniorTap]);
      expect(rows).toHaveLength(1);
      expect(rows[0].t).toBe('16:30');
    });
  });
});

describe('soft deletion and the audit trail', () => {
  it('a soft-deleted student disappears from every read', async () => {
    await asUser(USERS.owner, async q => {
      const [s] = await q('select id from student limit 1');
      const [r] = await q(`select app.soft_delete('student', $1) ok`, [s.id]);
      expect(r.ok).toBe(true);
      expect(await q('select id from student where id = $1', [s.id])).toHaveLength(0);
    });
  });

  it('a guardian cannot delete records', async () => {
    await asUser(USERS.guardianA, async q => {
      const [s] = await q('select id from student limit 1');
      expect(await expectRejected(() => q(`select app.soft_delete('student', $1)`, [s.id])))
        .toMatch(/FORBIDDEN/);
    });
  });

  it('deletion is refused for tables not on the allow-list', async () => {
    await asUser(USERS.owner, async q => {
      expect(await expectRejected(() => q(`select app.soft_delete('audit_log', gen_random_uuid())`)))
        .toMatch(/SOFT_DELETE_UNSUPPORTED/);
    });
  });

  it('records the deletion in the audit trail', async () => {
    await asUser(USERS.owner, async q => {
      const [s] = await q('select id from student limit 1');
      await q(`select app.soft_delete('student', $1)`, [s.id]);
      const [a] = await q(`select action, actor_id from audit_log
                            where entity = 'student' and entity_id = $1
                            order by at desc limit 1`, [s.id]);
      expect(a.action).toBe('soft_delete');
      expect(a.actor_id).toBe(USERS.owner);
    });
  });

  it('records who changed a medical record', async () => {
    await asUser(USERS.owner, async q => {
      const [m] = await q('select id, student_id from medical_record limit 1');
      await q(`update medical_record set allergies = 'Updated in test' where id = $1`, [m.id]);
      const audit = await q(`select action, entity, actor_id from audit_log
                              where entity = 'medical_record' and entity_id = $1
                              order by at desc limit 1`, [m.id]);
      expect(audit[0].action).toBe('update');
      expect(audit[0].actor_id).toBe(USERS.owner);
    });
  });

  it('nobody can rewrite the audit trail', async () => {
    await asUser(USERS.owner, async q => {
      // Stronger than a policy filter: the privilege itself was revoked, so
      // the statement is refused before any row is considered.
      expect(await expectRejected(() =>
        q(`update audit_log set summary = 'nothing to see'`))).toMatch(/permission denied/i);
      expect(await expectRejected(() =>
        q(`delete from audit_log`))).toMatch(/permission denied/i);
    });
  });
});

describe('the funnel adds up', () => {
  it('reports a conversion rate from real records', async () => {
    await asUser(USERS.owner, async q => {
      const [f] = await q(`select
          count(*)::int total,
          count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int booked,
          count(*) filter (where stage in ('trial_attended','enrolled'))::int attended,
          count(*) filter (where stage = 'enrolled')::int converted
        from enquiry where deleted_at is null`);
      expect(f.total).toBe(18);
      expect(f.booked).toBe(14);
      expect(f.attended).toBe(11);
      expect(f.converted).toBe(7);
      expect(Math.round((f.converted / f.total) * 1000) / 10).toBeCloseTo(38.9, 1);
    });
  });
});
