import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asService, closeDb, expectRejected, rebuild,
         USERS, CLASS, FAMILY, STUDIO_ID, uid, NS } from './helpers';

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

/* ==========================================================================
   Building the timetable, and running the room.
   ========================================================================== */
describe('the office builds the timetable', () => {
  const insert = async (q: any, name: string, dow = 3, at = '18:00') => {
    const [term] = await q(`select id from term where deleted_at is null order by starts_on desc limit 1`);
    const [style] = await q(`select id from dance_style limit 1`);
    const [room] = await q(`select id, location_id from room limit 1`);
    const [row] = await q(
      `insert into class (studio_id, term_id, dance_style_id, location_id, room_id, name,
                          day_of_week, start_time, duration_min, capacity, price_minor, pricing)
       select t.studio_id, t.id, $1, $2, $3, $4, $5, $6::time, 60, 12, 5000, 'term'
         from term t where t.id = $7
       returning id`,
      [style.id, room.location_id, room.id, name, dow, at, term.id]);
    return row?.id as string;
  };

  it('an admin can add a class and generate its sessions', async () => {
    await asUser(USERS.admin, async q => {
      const id = await insert(q, 'Grade 4 Ballet');
      expect(id).toBeTruthy();
      const [made] = await q(`select app.generate_class_sessions($1) as made`, [id]);
      expect(made.made).toBeGreaterThan(0);
      const [n] = await q(`select count(*)::int as n from class_session
                            where class_id = $1 and deleted_at is null`, [id]);
      expect(n.n).toBe(made.made);
      // Every session lands on the day the class says it runs.
      const days = await q(`select distinct extract(dow from starts_at at time zone 'Europe/London')::int as d
                              from class_session where class_id = $1`, [id]);
      expect(days.map((x: any) => x.d)).toEqual([3]);
    });
  });

  it('generating twice does not double the timetable', async () => {
    await asUser(USERS.admin, async q => {
      const id = await insert(q, 'Grade 5 Ballet');
      const [first] = await q(`select app.generate_class_sessions($1) as made`, [id]);
      await q(`select app.generate_class_sessions($1)`, [id]);
      const [n] = await q(`select count(*)::int as n from class_session where class_id = $1`, [id]);
      expect(n.n).toBe(first.made);
    });
  });

  it('rescheduling moves untouched sessions and leaves taken registers alone', async () => {
    await asUser(USERS.admin, async q => {
      const id = await insert(q, 'Moving Class', 3, '18:00');
      await q(`select app.generate_class_sessions($1)`, [id]);

      // Take one register in the future, so that session is now a record.
      const [keep] = await q(`select id, studio_id from class_session
                               where class_id = $1 and starts_at > now()
                               order by starts_at limit 1`, [id]);
      const [student] = await q(`select id from student limit 1`);
      await q(`insert into attendance_record (studio_id, session_id, student_id, status)
               values ($1,$2,$3,'present')`, [keep.studio_id, keep.id, student.id]);

      await q(`update class set day_of_week = 5, start_time = '19:30' where id = $1`, [id]);
      await q(`select app.reschedule_class($1)`, [id]);

      const still = await q(`select id from class_session
                              where id = $1 and deleted_at is null`, [keep.id]);
      expect(still).toHaveLength(1);          // the marked one survived

      // Only the future moves. Sessions already in the past are a record of
      // what ran, and rewriting them would be a lie about the term.
      const days = await q(`select distinct extract(dow from cs.starts_at at time zone 'Europe/London')::int as d
                              from class_session cs
                             where cs.class_id = $1 and cs.deleted_at is null
                               and cs.starts_at > now() and cs.id <> $2`, [id, keep.id]);
      expect(days.map((x: any) => x.d)).toEqual([5]);
    });
  });

  it('a teacher cannot create a class or reschedule one', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => insert(q, 'Tap For Everyone')))
        .toMatch(/row-level security/i);
      const [c] = await q(`select id from class limit 1`);
      expect(await expectRejected(() => q(`select app.reschedule_class($1)`, [c.id])))
        .toMatch(/only the office/i);
    });
  });
});

describe('a teacher runs their own register', () => {
  const session = async (q: any, classId: string) => {
    const [s] = await q(`select id from class_session
                          where class_id = $1 and deleted_at is null order by starts_at limit 1`, [classId]);
    return s.id as string;
  };

  it('can write session notes on their class but not on another', async () => {
    await asUser(USERS.teacherTap, async q => {
      const mine = await session(q, CLASS.juniorTap);
      expect(await q(`update class_session set notes = 'Covered the first eight'
                       where id = $1 returning id`, [mine])).toHaveLength(1);

      const [other] = await q(`select cs.id from class_session cs
                                where cs.class_id = $1 and cs.deleted_at is null limit 1`,
                              [CLASS.grade3Ballet]);
      if (other) {
        expect(await q(`update class_session set notes = 'not mine' where id = $1 returning id`,
                       [other.id])).toHaveLength(0);
      }
    });
  });

  it('closing a register refuses while anyone is unmarked', async () => {
    await asUser(USERS.teacherTap, async q => {
      const s = await session(q, CLASS.juniorTap);
      await q(`delete from attendance_record where session_id = $1`, [s]);
      expect(await expectRejected(() => q(`select app.close_register($1)`, [s])))
        .toMatch(/REGISTER_INCOMPLETE/);
    });
  });

  it('closing succeeds once everyone is accounted for, and is audited', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const s = await session(q, CLASS.juniorTap);
      await q(`insert into attendance_record (studio_id, session_id, student_id, status)
               select cs.studio_id, cs.id, e.student_id, 'present'
                 from class_session cs
                 join enrolment e on e.class_id = cs.class_id
                                 and e.status = 'active' and e.deleted_at is null
                where cs.id = $1
               on conflict (session_id, student_id) do nothing`, [s]);
      const [ok] = await q(`select app.close_register($1) as ok`, [s]);
      expect(ok.ok).toBe(true);
      const [row] = await q(`select register_closed_at from class_session where id = $1`, [s]);
      expect(row.register_closed_at).toBeTruthy();
      // Read the trail with RLS bypassed: a teacher writes to the audit log
      // through the function but has no policy to read it back, which is the
      // point of an audit log.
      expect(await q(`select id from audit_log limit 1`)).toHaveLength(0);
      const [audit] = await svc(`select count(*)::int as n from audit_log
                                  where entity = 'class_session' and entity_id = $1
                                    and action = 'close_register'`, [s]);
      expect(audit.n).toBe(1);
    });
  });

  it('cannot close a register for a class they do not teach', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [other] = await svc(`select id from class_session
                                  where class_id = $1 and deleted_at is null limit 1`, [CLASS.grade3Ballet]);
      expect(await expectRejected(() => q(`select app.close_register($1)`, [other.id])))
        .toMatch(/not your class/i);
    });
  });
});

describe('class notices go one way, and only to a teacher’s own classes', () => {
  const post = (q: any, classId: string, body = 'Practise the first eight.') =>
    q(`insert into communication (studio_id, kind, channel, class_id, body, sent_by)
       select c.studio_id, 'class_broadcast', 'in_app', c.id, $2, auth.uid()
         from class c where c.id = $1
       returning id`, [classId, body]);

  it('a teacher can post to a class they teach', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [row] = await post(q, CLASS.juniorTap);
      expect(row.id).toBeTruthy();
    });
  });

  it('a teacher cannot post to a class they do not teach', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => post(q, CLASS.grade3Ballet)))
        .toMatch(/row-level security/i);
    });
  });

  it('a teacher cannot direct-message a family or announce to the studio', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(
        `insert into communication (studio_id, kind, channel, family_id, body, sent_by)
         values ($1,'direct','in_app',$2,'a private word', auth.uid()) returning id`,
        [STUDIO_ID, FAMILY.a]))).toMatch(/row-level security/i);

      expect(await expectRejected(() => q(
        `insert into communication (studio_id, kind, channel, body, sent_by)
         values ($1,'studio_announcement','in_app','closed all week', auth.uid()) returning id`,
        [STUDIO_ID]))).toMatch(/row-level security/i);
    });
  });

  it('a teacher cannot sign a notice with someone else’s name', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(
        `insert into communication (studio_id, kind, channel, class_id, body, sent_by)
         values ($1,'class_broadcast','in_app',$2,'from Priya, apparently', $3) returning id`,
        [STUDIO_ID, CLASS.juniorTap, USERS.teacherModern]))).toMatch(/row-level security/i);
    });
  });

  it('a teacher can withdraw their own notice but not another’s', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [mine] = await post(q, CLASS.juniorTap);
      const [ok] = await q(`select app.withdraw_notice($1) as ok`, [mine.id]);
      expect(ok.ok).toBe(true);

      const [theirs] = await svc(
        `insert into communication (studio_id, kind, channel, class_id, body, sent_by)
         values ($1,'class_broadcast','in_app',$2,'Priya''s notice',$3) returning id`,
        [STUDIO_ID, CLASS.juniorTap, USERS.teacherModern]);
      expect(await expectRejected(() => q(`select app.withdraw_notice($1)`, [theirs.id])))
        .toMatch(/only the office, or whoever sent it/i);
    });
  });

  it('the class reads it; another class does not', async () => {
    // A guardian whose child is in the class sees it. Arrange inside each
    // reader's own transaction, because asUser rolls back on the way out.
    const arrange = async (svc: any, classId: string) => {
      const [row] = await svc(
        `insert into communication (studio_id, kind, channel, class_id, body, sent_by)
         values ($1,'class_broadcast','in_app',$2,'Bring tap shoes',$3) returning id`,
        [STUDIO_ID, classId, USERS.teacherTap]);
      return row.id as string;
    };

    await asUser(USERS.guardianA, async (q, svc) => {
      const [mine] = await q(`select e.class_id from enrolment e limit 1`);
      const visible = await arrange(svc, mine.class_id);
      const [outside] = await svc(
        `select id from class where deleted_at is null
          and id not in (select class_id from enrolment
                          where student_id in (select app.guardian_student_ids())
                            and deleted_at is null) limit 1`);
      const hidden = await arrange(svc, outside.id);

      const seen = await q(`select id from communication where id = any($1)`, [[visible, hidden]]);
      expect(seen.map((x: any) => x.id)).toEqual([visible]);
    });
  });

  it('families cannot post a notice of their own', async () => {
    await asUser(USERS.guardianA, async q => {
      const [c] = await q(`select class_id from enrolment limit 1`);
      expect(await expectRejected(() => post(q, c.class_id)))
        .toMatch(/row-level security/i);
    });
  });
});
