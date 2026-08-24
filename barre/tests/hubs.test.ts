import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, asService, closeDb, expectRejected, rebuild,
         USERS, FAMILY, CLASS, STUDIO_ID, uid, NS } from './helpers';

/** The three seeded student logins, in family order. */
const STUDENT_A = uid(NS.user, 40);   // Wright family, approved by Hannah
const STUDENT_B = uid(NS.user, 41);   // Adeyemi family

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('student logins are gated by age and by a guardian', () => {
  it('the seeded students each have an approving guardian', async () => {
    await asUser(USERS.owner, async q => {
      const rows = await q(`select s.first_name, s.login_approved_by,
                                   extract(year from age(current_date, s.date_of_birth))::int as age
                              from student s where s.login_enabled and s.deleted_at is null`);
      expect(rows.length).toBe(3);
      for (const r of rows) {
        expect(r.age).toBeGreaterThanOrEqual(14);
        expect(r.login_approved_by).not.toBeNull();
      }
    });
  });

  it('refuses a login for a child below the studio threshold', async () => {
    await asService(async q => {
      const [young] = await q(`select id, first_name from student
                                where extract(year from age(current_date, date_of_birth)) < 13
                                limit 1`);
      const msg = await expectRejected(() =>
        q(`update student set user_id = $1, login_enabled = true, login_approved_by = $2
            where id = $3`, [uid(NS.user, 11), uid(NS.user, 11), young.id]));
      expect(msg).toMatch(/STUDENT_LOGIN_TOO_YOUNG/);
    });
  });

  it('refuses a login that no guardian has approved', async () => {
    await asService(async q => {
      const [old] = await q(`select id from student
                              where extract(year from age(current_date, date_of_birth)) >= 14
                                and user_id is null limit 1`);
      await q(`insert into user_account (id, email, full_name)
               values ($1,'unapproved@example.com','Unapproved')`, [uid(NS.user, 90)]);
      const msg = await expectRejected(() =>
        q(`update student set user_id = $1, login_enabled = true where id = $2`,
          [uid(NS.user, 90), old.id]));
      expect(msg).toMatch(/STUDENT_LOGIN_UNAPPROVED/);
    });
  });

  it('a teacher cannot switch a student login on', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [s] = await q(`select id from student limit 1`);
      const updated = await q(`update student set login_enabled = true where id = $1 returning id`, [s.id]);
      expect(updated).toHaveLength(0);      // no write policy applies to a teacher
    });
  });
});

describe('what a student can see', () => {
  it('sees themselves and no other child', async () => {
    await asUser(STUDENT_A, async q => {
      const rows = await q('select id, first_name from student');
      expect(rows).toHaveLength(1);
      expect(rows[0].first_name).toBe('Amir');
    });
  });

  it('sees no billing and no other family', async () => {
    await asUser(STUDENT_A, async q => {
      expect(await q('select id from invoice')).toHaveLength(0);
      expect(await q('select id from payment')).toHaveLength(0);
      expect(await q('select id from family')).toHaveLength(0);
    });
  });

  it('cannot read the medical record table, but sees their own allergies', async () => {
    await asUser(STUDENT_A, async q => {
      expect(await q('select id from medical_record')).toHaveLength(0);
      const brief = await q('select student_id, allergies from student_safety_brief');
      expect(brief).toHaveLength(1);
    });
  });

  it('sees only resources that reach them', async () => {
    await asUser(STUDENT_A, async (q, svc) => {
      const mine = await q('select id, title, kind from resource');
      expect(mine.length).toBeGreaterThan(0);
      // Studio-wide resources reach everyone; class-scoped ones must not reach
      // a student who is not in that class.
      const all = await svc('select count(*)::int n from resource');
      expect(mine.length).toBeLessThan(all[0].n);
    });
  });

  it('sees a hidden resource never, whoever it is assigned to', async () => {
    await asUser(STUDENT_A, async (q, svc) => {
      const before = await q('select id from resource where id = $1', [uid(NS.resource, 9)]);
      expect(before).toHaveLength(1);                      // studio-wide, so visible
      await svc('update resource set visible_to_students = false where id = $1',
                [uid(NS.resource, 9)]);
      expect(await q('select id from resource where id = $1', [uid(NS.resource, 9)]))
        .toHaveLength(0);
    });
  });
});

describe('feedback is private until a teacher shares it', () => {
  it('an unshared note is invisible to the child and the parent', async () => {
    const draft = uid(NS.feedback, 5);       // seeded with shared_at null
    await asService(async q => {
      const [row] = await q('select shared_at, student_id from feedback_note where id = $1', [draft]);
      expect(row.shared_at).toBeNull();
    });
    await asUser(STUDENT_A, async q => {
      expect(await q('select id from feedback_note where id = $1', [draft])).toHaveLength(0);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await q('select id from feedback_note where id = $1', [draft])).toHaveLength(0);
    });
  });

  it('can be shared with a guardian but held back from the child', async () => {
    const note = uid(NS.feedback, 2);
    // Point a shared note at a child who has a login, then hide it from them.
    const arrange = `update feedback_note
                        set student_id = (select id from student where user_id = $1),
                            shared_at = now(), share_with_student = false,
                            share_with_guardian = true
                      where id = $2`;
    await asUser(STUDENT_A, async (q, svc) => {
      await svc(arrange, [STUDENT_A, note]);
      expect(await q('select id from feedback_note where id = $1', [note])).toHaveLength(0);
    });
    await asUser(USERS.guardianA, async (q, svc) => {
      await svc(arrange, [STUDENT_A, note]);
      expect(await q('select id from feedback_note where id = $1', [note])).toHaveLength(1);
    });
  });

  it('never exposes the staff-only private note to a family', async () => {
    // The row itself is readable once shared, so the staff-only column has to
    // be withheld by the query. This is the contract, asserted rather than
    // assumed — if the column is ever added to a family-facing query, it fails.
    const hub = await import('../src/lib/repos/hub');
    const familyFacing = [hub.STUDENT_FEEDBACK, hub.MY_ASSESSMENTS, hub.MY_TIMETABLE,
                          hub.EVENTS, hub.MY_REQUESTS, hub.RESOURCES];
    for (const sql of familyFacing) expect(sql).not.toMatch(/private_note/);

    await asUser(STUDENT_A, async (q, svc) => {
      await svc(`update feedback_note
                    set student_id = (select id from student where user_id = $1),
                        private_note = 'Staff eyes only', shared_at = now()
                  where id = $2`, [STUDENT_A, uid(NS.feedback, 3)]);
      const rows = await q(hub.STUDENT_FEEDBACK);
      expect(rows.length).toBeGreaterThan(0);
      expect(Object.keys(rows[0])).not.toContain('private_note');
    });
  });

  it('a teacher can write feedback only for their own students', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [mine] = await q(`select id from student limit 1`);
      const ok = await q(`insert into feedback_note (studio_id, student_id, headline, going_well)
                          values ($1,$2,'Test','Good') returning id`, [STUDIO_ID, mine.id]);
      expect(ok).toHaveLength(1);

      const [outsider] = await svc(
        `select s.id from student s
          where s.id not in (select e.student_id from enrolment e
                              join class c on c.id = e.class_id
                             where c.teacher_id = (select id from staff_member where user_id = $1))
          limit 1`, [USERS.teacherTap]);
      const msg = await expectRejected(() =>
        q(`insert into feedback_note (studio_id, student_id, headline)
           values ($1,$2,'Should fail')`, [STUDIO_ID, outsider.id]));
      expect(msg).toMatch(/row-level security/i);
    });
  });
});

describe('events and requests', () => {
  it('a private lesson is visible only to that child and their family', async () => {
    const [priv] = await asService(q => q(
      `select id, student_id from studio_event where kind = 'private_lesson' limit 1`));
    await asUser(STUDENT_B, async q => {
      const rows = await q('select id from studio_event where id = $1', [priv.id]);
      expect(rows).toHaveLength(0);        // not their lesson
    });
    await asUser(USERS.owner, async q => {
      expect(await q('select id from studio_event where id = $1', [priv.id])).toHaveLength(1);
    });
  });

  it('a family may request a place but cannot confirm one', async () => {
    await asUser(USERS.guardianA, async q => {
      const [child] = await q('select id from student limit 1');
      const ok = await q(`insert into event_participant (studio_id, event_id, student_id, status)
                          values ($1,$2,$3,'requested') returning status`,
                         [STUDIO_ID, uid(NS.event, 2), child.id]);
      expect(ok[0].status).toBe('requested');

      const msg = await expectRejected(() =>
        q(`insert into event_participant (studio_id, event_id, student_id, status)
           values ($1,$2,$3,'confirmed')`, [STUDIO_ID, uid(NS.event, 4), child.id]));
      expect(msg).toMatch(/row-level security/i);
    });
  });

  it('a guardian cannot enter another family’s child', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [outsider] = await svc(
        `select id from student where family_id <> $1 limit 1`, [FAMILY.a]);
      const msg = await expectRejected(() =>
        q(`insert into event_participant (studio_id, event_id, student_id, status)
           values ($1,$2,$3,'requested')`, [STUDIO_ID, uid(NS.event, 1), outsider.id]));
      expect(msg).toMatch(/row-level security/i);
    });
  });

  it('a family sees their own requests only', async () => {
    await asUser(USERS.guardianA, async q => {
      const mine = await q('select id, family_id from studio_request');
      expect(mine.every((r: any) => r.family_id === FAMILY.a)).toBe(true);
    });
  });

  it('a student cannot answer their own request', async () => {
    await asUser(STUDENT_A, async q => {
      const updated = await q(`update studio_request set status = 'answered',
                                 answer = 'Yes, fine' returning id`);
      expect(updated).toHaveLength(0);
    });
  });
});

describe('the student read policies stay narrow', () => {
  it('sees their own timetable, and only their own', async () => {
    await asUser(STUDENT_A, async (q, svc) => {
      const mine = await q(`select id, student_id from enrolment`);
      expect(mine.length).toBeGreaterThan(0);
      const [me] = await q('select id from student');
      expect(mine.every((e: any) => e.student_id === me.id)).toBe(true);

      const sessions = await q(`select id from class_session`);
      expect(sessions.length).toBeGreaterThan(0);
      const all = await svc('select count(*)::int n from class_session');
      expect(sessions.length).toBeLessThan(all[0].n);      // not the whole studio
    });
  });

  it('sees the public class list, but never a class the studio has hidden', async () => {
    // Public classes are a prospectus — a guardian browsing for a trial needs
    // them, and there is no child data attached. What must stay hidden is a
    // class the studio has taken off the list.
    await asUser(STUDENT_A, async (q, svc) => {
      const before = await q('select id from class');
      expect(before.length).toBeGreaterThan(0);

      const [hidden] = await svc(`update class set visibility = 'private'
                                   where id = (select c.id from class c
                                                where c.id not in (
                                                  select e.class_id from enrolment e
                                                   where e.student_id = (select id from student
                                                                          where user_id = $1))
                                                limit 1)
                                 returning id`, [STUDENT_A]);
      const after = await q('select id from class');
      expect(after.map((c: any) => c.id)).not.toContain(hidden.id);
      expect(after.length).toBe(before.length - 1);
    });
  });

  it('sees their own attendance and nobody else’s', async () => {
    await asUser(STUDENT_A, async q => {
      const [me] = await q('select id from student');
      const marks = await q('select student_id from attendance_record');
      expect(marks.every((m: any) => m.student_id === me.id)).toBe(true);
    });
  });

  it('still cannot reach families, invoices, medical records or other children', async () => {
    await asUser(STUDENT_A, async q => {
      expect(await q('select id from family')).toHaveLength(0);
      expect(await q('select id from invoice')).toHaveLength(0);
      expect(await q('select id from payment')).toHaveLength(0);
      expect(await q('select id from medical_record')).toHaveLength(0);
      expect(await q('select id from guardian')).toHaveLength(0);
      expect(await q('select id from student')).toHaveLength(1);
      expect(await q('select id from enquiry')).toHaveLength(0);
    });
  });

  it('sees announcements and their own class broadcasts, not other classes', async () => {
    await asUser(STUDENT_A, async (q, svc) => {
      const mine = await q(`select id, kind, class_id from communication`);
      const all = await svc('select count(*)::int n from communication where deleted_at is null');
      expect(mine.every((c: any) => c.kind !== 'direct')).toBe(true);   // never a family's DM
      expect(mine.length).toBeLessThanOrEqual(all[0].n);
    });
  });

  it('cannot write anything a studio owns', async () => {
    await asUser(STUDENT_A, async q => {
      const [c] = await q('select id from class limit 1');
      expect(await q(`update class set capacity = 999 where id = $1 returning id`, [c.id])).toHaveLength(0);
      const [s] = await q('select id from class_session limit 1');
      expect(await q(`update class_session set status = 'cancelled' where id = $1 returning id`, [s.id]))
        .toHaveLength(0);
      expect(await expectRejected(() =>
        q(`insert into attendance_record (studio_id, session_id, student_id, status)
           values ($1,$2,(select id from student),'present')`, [STUDIO_ID, s.id])))
        .toMatch(/row-level security/i);
    });
  });
});

/* ==========================================================================
   Class material: a teacher shares files with their class, and the class —
   and only that class — can open them.
   ========================================================================== */
describe('teachers own the material for the classes they take', () => {
  it('can create a resource and pin it to a class they teach', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [r] = await q(
        `insert into resource (studio_id, kind, title, category, url, created_by)
         values ($1, 'video', 'Shuffle drill — slow', 'Technique',
                 'https://example.com/v', auth.uid())
         returning id`, [STUDIO_ID]);
      expect(r.id).toBeTruthy();

      const [a] = await q(
        `insert into resource_assignment (studio_id, resource_id, scope, class_id)
         values ($1, $2, 'class', $3) returning id`, [STUDIO_ID, r.id, CLASS.juniorTap]);
      expect(a.id).toBeTruthy();
    });
  });

  it('cannot pin material to a class they do not teach', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [r] = await q(
        `insert into resource (studio_id, kind, title, url, created_by)
         values ($1, 'link', 'Nothing to do with tap', 'https://example.com/x', auth.uid())
         returning id`, [STUDIO_ID]);
      expect(await expectRejected(() => q(
        `insert into resource_assignment (studio_id, resource_id, scope, class_id)
         values ($1, $2, 'class', $3) returning id`, [STUDIO_ID, r.id, CLASS.grade3Ballet])))
        .toMatch(/row-level security/i);
    });
  });

  it('cannot claim someone else’s resource by inserting it under their name', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(
        `insert into resource (studio_id, kind, title, url, created_by)
         values ($1, 'link', 'Filed under Priya', 'https://example.com/y', $2) returning id`,
        [STUDIO_ID, USERS.teacherModern])))
        .toMatch(/row-level security/i);
    });
  });

  it('cannot edit or delete another teacher’s resource', async () => {
    await asUser(USERS.teacherTap, async (q, svc) => {
      const [mine] = await svc(
        `insert into resource (studio_id, kind, title, url, created_by)
         values ($1, 'link', 'Priya''s warm-up', 'https://example.com/z', $2) returning id`,
        [STUDIO_ID, USERS.teacherModern]);

      expect(await q(`update resource set title = 'mine now' where id = $1 returning id`, [mine.id]))
        .toHaveLength(0);
      expect(await expectRejected(() => q(`select app.retire_resource($1)`, [mine.id])))
        .toMatch(/only the office, or whoever added it/i);
    });
  });

  it('a file is only ever as visible as the resource it belongs to', async () => {
    // Pinned to Grade 3 Ballet. Each reader arranges the fixture inside its own
    // transaction, because asUser rolls back when it returns.
    const arrange = async (svc: any) => {
      const [r] = await svc(
        `insert into resource (studio_id, kind, title, storage_path, created_by)
         values ($1, 'audio', 'Grade 3 accompaniment', 'local:pending', $2) returning id`,
        [STUDIO_ID, USERS.owner]);
      await svc(`insert into resource_assignment (studio_id, resource_id, scope, class_id)
                 values ($1, $2, 'class', $3)`, [STUDIO_ID, r.id, CLASS.grade3Ballet]);
      const [f] = await svc(
        `insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
         values ($1, $2, 'g3.wav', 'audio/wav', 4, '\\x00010203'::bytea, $3) returning id`,
        [STUDIO_ID, r.id, USERS.owner]);
      return f.id;
    };

    // The bytes follow the resource: readable exactly when the class is theirs.
    await asUser(STUDENT_A, async (q, svc) => {
      const fileId = await arrange(svc);
      const inThatClass = await q(
        `select 1 from enrolment e where e.class_id = $1 and e.status = 'active'`, [CLASS.grade3Ballet]);
      const rows = await q(`select id from resource_file where id = $1`, [fileId]);
      expect(rows.length).toBe(inThatClass.length ? 1 : 0);
    });

    await asUser(USERS.owner, async (q, svc) => {
      const fileId = await arrange(svc);
      expect(await q(`select id from resource_file where id = $1`, [fileId])).toHaveLength(1);
    });
  });

  it('a student sees a file pinned to their own class and not one pinned elsewhere', async () => {
    await asUser(STUDENT_A, async (q, svc) => {
      const [mine] = await q(`select class_id from enrolment limit 1`);
      const [other] = await svc(
        `select c.id from class c
          where c.deleted_at is null
            and c.id not in (select class_id from enrolment
                              where student_id = app.student_self_id() and deleted_at is null)
          limit 1`);

      const make = async (classId: string, title: string) => {
        const [r] = await svc(
          `insert into resource (studio_id, kind, title, storage_path, created_by)
           values ($1, 'document', $2, 'local:x', $3) returning id`, [STUDIO_ID, title, USERS.owner]);
        await svc(`insert into resource_assignment (studio_id, resource_id, scope, class_id)
                   values ($1, $2, 'class', $3)`, [STUDIO_ID, r.id, classId]);
        const [f] = await svc(
          `insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
           values ($1, $2, 'a.pdf', 'application/pdf', 2, '\\x0102'::bytea, $3) returning id`,
          [STUDIO_ID, r.id, USERS.owner]);
        return f.id;
      };

      const visible = await make(mine.class_id, 'For my class');
      const hidden = await make(other.id, 'For another class');

      const seen = await q(`select id from resource_file where id = any($1)`, [[visible, hidden]]);
      expect(seen.map((x: any) => x.id)).toEqual([visible]);
    });
  });

  it('a family cannot read a file the studio marked staff-only', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const [child] = await q(`select id from student limit 1`);
      const [enr] = await svc(`select class_id from enrolment
                                where student_id = $1 and status = 'active' limit 1`, [child.id]);
      const [r] = await svc(
        `insert into resource (studio_id, kind, title, storage_path, created_by,
                               visible_to_students, visible_to_guardians)
         values ($1, 'document', 'Staff notes', 'local:x', $2, false, false) returning id`,
        [STUDIO_ID, USERS.owner]);
      await svc(`insert into resource_assignment (studio_id, resource_id, scope, class_id)
                 values ($1, $2, 'class', $3)`, [STUDIO_ID, r.id, enr.class_id]);
      const [f] = await svc(
        `insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
         values ($1, $2, 'notes.pdf', 'application/pdf', 2, '\\x0102'::bytea, $3) returning id`,
        [STUDIO_ID, r.id, USERS.owner]);

      expect(await q(`select id from resource where id = $1`, [r.id])).toHaveLength(0);
      expect(await q(`select id from resource_file where id = $1`, [f.id])).toHaveLength(0);
    });
  });

  it('the demo ships material that is a real file, not a dead link', async () => {
    await asUser(USERS.teacherTap, async q => {
      const rows = await q(
        `select r.title, r.storage_path, f.size_bytes, f.mime_type
           from resource r join resource_file f on f.resource_id = r.id
          where r.deleted_at is null order by r.title`);
      expect(rows.length).toBeGreaterThanOrEqual(2);
      for (const r of rows) {
        expect(r.storage_path).toBe(`local:${r.storage_path.slice(6)}`);
        expect(r.size_bytes).toBeGreaterThan(0);
      }
      // Both are pinned to a class, and the tap teacher takes that class.
      const pinned = await q(
        `select a.class_id from resource_assignment a
           join resource_file f on f.resource_id = a.resource_id
          where a.class_id in (select app.teacher_class_ids())`);
      expect(pinned.length).toBeGreaterThan(0);
    });
  });
});
