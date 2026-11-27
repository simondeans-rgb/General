import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, CLASS, FAMILY, STUDIO_ID, uid, NS } from './helpers';
import * as C from '../src/lib/repos/classes';
import * as P from '../src/lib/repos/people';
import * as H from '../src/lib/repos/office';
import { SEARCH } from '../src/lib/repos/search';
import { HEADLINE } from '../src/lib/repos/reports';
import { toDateInput } from '../src/lib/format';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

/* ── UR-01 class creation ───────────────────────────────────────────────── */
describe('creating a class (UR-01)', () => {
  /** The exact argument list ClassForm sends, in the same order. */
  const args = (over: Partial<C.ClassDraft> & { style: string; location: string }) => {
    const d = {
      level_id: null, room_id: null, teacher_id: null, name: 'Grade 4 Ballet', day_of_week: 2,
      start_time: '17:30', duration_min: 60, capacity: 12, age_min: 9, age_max: 12,
      price_minor: 5400, trials_enabled: true, waitlist_enabled: true, visibility: 'public',
      pricing: 'term', trial_price_minor: null, assistant_id: null, prerequisites: '', description: '',
      trial_needs_approval: false, ...over,
    } as any;
    return [over.style, d.level_id, over.location, d.room_id, d.teacher_id, d.name, d.day_of_week,
      d.start_time, d.duration_min, d.capacity, d.age_min, d.age_max, d.price_minor, d.trials_enabled,
      d.waitlist_enabled, d.visibility, d.pricing, d.trial_price_minor, d.assistant_id,
      d.prerequisites, d.description, d.trial_needs_approval];
  };

  const refs = async (svc: any) => {
    const [term] = await svc(`select id from term where deleted_at is null and status <> 'archived'
                               and ends_on > current_date order by starts_on limit 1`);
    const [style] = await svc(`select id from dance_style where deleted_at is null limit 1`);
    const [loc] = await svc(`select id from location where deleted_at is null limit 1`);
    return { term: term.id, style: style.id, location: loc.id };
  };

  for (const role of ['owner', 'admin'] as const) {
    it(`the form's SQL creates a class and its sessions, as ${role}`, async () => {
      await asUser(USERS[role], async (q, svc) => {
        const r = await refs(svc);
        const [row] = await q(C.CREATE_CLASS, [r.term, ...args({ style: r.style, location: r.location })]);
        expect(row.id).toBeTruthy();
        const [made] = await q(C.GENERATE_SESSIONS, [row.id]);
        expect(made.made).toBeGreaterThan(0);
        const listed = await q(C.CLASSES);
        expect(listed.some((c: any) => c.id === row.id && c.sessions_left > 0)).toBe(true);
        const [saved] = await q(C.CLASS_FOR_EDIT, [row.id]);
        expect(saved).toMatchObject({ pricing: 'term', visibility: 'public', capacity: 12 });
      });
    });
  }

  it('handles no room, trials off and pay-as-you-go with no price', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const r = await refs(svc);
      const [row] = await q(C.CREATE_CLASS, [r.term, ...args({ style: r.style, location: r.location,
        trials_enabled: false, pricing: 'drop_in', price_minor: 0, visibility: 'unlisted' })]);
      const [saved] = await q(C.CLASS_FOR_EDIT, [row.id]);
      expect(saved).toMatchObject({ pricing: 'drop_in', trials_enabled: false, room_id: null, visibility: 'unlisted' });
    });
  });
});

/* ── UR-02 dates into date inputs ───────────────────────────────────────── */
describe('date inputs (UR-02)', () => {
  it('toDateInput takes a Date, a string or nothing', () => {
    expect(toDateInput(null)).toBe('');
    expect(toDateInput(undefined)).toBe('');
    expect(toDateInput('')).toBe('');
    expect(toDateInput('2015-06-30')).toBe('2015-06-30');
    expect(toDateInput('2015-06-30T00:00:00.000Z')).toBe('2015-06-30');
    // PGlite: UTC midnight
    expect(toDateInput(new Date('2015-06-30'))).toBe('2015-06-30');
    // node-postgres: local midnight, in summer time
    expect(toDateInput(new Date(2015, 5, 30))).toBe('2015-06-30');
    expect(toDateInput(new Date(2015, 0, 1))).toBe('2015-01-01');
    expect(toDateInput(new Date('nonsense'))).toBe('');
  });

  it('a student’s details come back as a Date and round-trip through the edit form', async () => {
    await asUser(USERS.admin, async q => {
      const [s] = await q(`select id from student where deleted_at is null order by last_name limit 1`);
      const [row] = await q(P.STUDENT_DETAIL, [s.id]);
      expect(row.date_of_birth).toBeInstanceOf(Date);
      const dob = toDateInput(row.date_of_birth);
      expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await q(P.UPDATE_STUDENT, [s.id, 'Renamed', row.last_name, '', '2016-07-14', '', '', '', toDateInput(row.left_on) || null]);
      const [after] = await q(P.STUDENT_DETAIL, [s.id]);
      expect(after.first_name).toBe('Renamed');
      expect(toDateInput(after.date_of_birth)).toBe('2016-07-14');
    });
  });
});

/* ── UR-18 enquiry → trial → enrolment ─────────────────────────────────── */
describe('an enquiry follows its trial (UR-18)', () => {
  it('book from the enquiry, record the outcome, convert: the card ends in Enrolled and the funnel counts it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [funnel0] = await q(C.FUNNEL);
      const [{ id: enq }] = await q(C.CREATE_ENQUIRY, ['Grace Mensah', '07700 900222', 'grace@example.com',
        'Efua Mensah', '2019-03-04', CLASS.juniorTap, 'phone', null]);
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now()
                              and status = 'scheduled' order by starts_at limit 1`, [CLASS.juniorTap]);
      const child = { first_name: 'Efua', last_name: 'Mensah', date_of_birth: '2019-03-04', contact_name: 'Grace Mensah',
                      contact_phone: '07700 900222', contact_email: 'grace@example.com', enquiry_id: enq };
      const [{ id: trial }] = await q(C.BOOK_TRIAL, [s.id, null, JSON.stringify(child)]);
      let [e] = await q(`select stage::text, student_id, family_id from enquiry where id = $1`, [enq]);
      expect(e.stage).toBe('trial_booked');
      expect(e.student_id).toBeTruthy();
      const [t] = await q(`select enquiry_id from trial where id = $1`, [trial]);
      expect(t.enquiry_id).toBe(enq);

      // A second trial for the same enquiry is refused.
      expect(await expectRejected(() => q(C.BOOK_TRIAL, [s.id, null, JSON.stringify(child)]))).toMatch(/ALREADY_BOOKED/);

      // Before the class, no outcome can be recorded (UR-54, D9).
      expect(await expectRejected(() => q(C.TRIAL_OUTCOME, [trial, 'attended', null]))).toMatch(/TOO_EARLY/);
      expect(await expectRejected(() => q(C.CONVERT_TRIAL, [trial, null]))).toMatch(/TOO_EARLY/);

      // After it, Came then Joining move the card on.
      await svc(`update class_session set starts_at = now() - interval '2 hours', ends_at = now() - interval '1 hour' where id = $1`, [s.id]);
      await q(C.TRIAL_OUTCOME, [trial, 'attended', null]);
      [e] = await q(`select stage::text from enquiry where id = $1`, [enq]);
      expect(e.stage).toBe('trial_attended');
      await q(C.CONVERT_TRIAL, [trial, null]);
      [e] = await q(`select stage::text from enquiry where id = $1`, [enq]);
      expect(e.stage).toBe('enrolled');

      const [funnel1] = await q(C.FUNNEL);
      expect(funnel1.total).toBe(funnel0.total + 1);
      expect(funnel1.booked).toBe(funnel0.booked + 1);
      expect(funnel1.attended).toBe(funnel0.attended + 1);
      expect(funnel1.converted).toBe(funnel0.converted + 1);
    });
  });

  it('booking an existing child from an enquiry links and advances it too', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [{ id: enq }] = await q(C.CREATE_ENQUIRY, ['Hannah Wright', '', 'hannah@example.com', 'Sibling', null, null, 'email', null]);
      const [kid] = await svc(`select s.id from student s where exists (select 1 from emergency_contact ec where ec.student_id = s.id and ec.deleted_at is null)
                                and not exists (select 1 from enrolment e where e.student_id = s.id and e.class_id = $1 and e.status = 'active') limit 1`, [CLASS.juniorTap]);
      const [s] = await svc(`select id from class_session where class_id = $1 and starts_at > now() and status = 'scheduled' order by starts_at limit 1`, [CLASS.juniorTap]);
      await q(C.BOOK_TRIAL, [s.id, kid.id, JSON.stringify({ enquiry_id: enq })]);
      const [e] = await q(`select stage::text, student_id, interest_class_id from enquiry where id = $1`, [enq]);
      expect(e).toEqual({ stage: 'trial_booked', student_id: kid.id, interest_class_id: CLASS.juniorTap });
    });
  });

  it('a closed enquiry keeps its reason; enquiries are found by search', async () => {
    await asUser(USERS.admin, async q => {
      const [{ id: enq }] = await q(C.CREATE_ENQUIRY, ['Zelda Quorn', '07700 900333', '', 'Pip Quorn', null, null, 'phone', null]);
      await q(C.CLOSE_ENQUIRY, [enq, 'Chose a school nearer home']);
      const [e] = await q(`select stage::text, closed_reason from enquiry where id = $1`, [enq]);
      expect(e).toEqual({ stage: 'closed_lost', closed_reason: 'Chose a school nearer home' });
      const hits = await q(SEARCH, ['quorn']);
      expect(hits.some((h: any) => h.kind === 'enquiry' && h.id === enq)).toBe(true);
      expect((await q(SEARCH, ['900333'])).some((h: any) => h.id === enq)).toBe(true);
    });
  });
});

/* ── UR-19 waiting-list offers ──────────────────────────────────────────── */
describe('waiting-list offers respect capacity (UR-19)', () => {
  const live = (q: any) => q(`select id, status, offer_expires_at from waitlist_entry
                               where class_id = $1 and status = 'offered' and deleted_at is null`, [CLASS.grade3Ballet]);

  it('the admins-08 repro can no longer make two offers for one place', async () => {
    await asUser(USERS.admin, async q => {
      const [top] = await q(C.CLASS_WAITLIST, [CLASS.grade3Ballet]);
      // Offer #1 on a full class: refused.
      expect(await expectRejected(() => q(C.OFFER_PLACE, [top.id, null]))).toMatch(/NO_FREE_PLACE/);
      // Withdraw someone: exactly one offer goes out.
      const [place] = await q(`select id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.grade3Ballet]);
      const [{ offered }] = await q(C.WITHDRAW, [place.id, null]);
      expect(offered).toBeTruthy();
      expect(await live(q)).toHaveLength(1);
      // A manual second offer is refused while that one is out.
      const second = (await q(C.CLASS_WAITLIST, [CLASS.grade3Ballet])).find((w: any) => w.status === 'waiting');
      expect(await expectRejected(() => q(C.OFFER_PLACE, [second.id, null]))).toMatch(/1 offer is already out/);
      // "Took it" for someone without an offer cannot take the held place…
      expect(await expectRejected(() => q(C.ACCEPT_PLACE, [second.id]))).toMatch(/NO_FREE_PLACE/);
      // …nor can a direct enrolment.
      const [outsider] = await q(`select id from student where id not in (select student_id from enrolment where class_id = $1 and status = 'active')
                                   and id not in (select student_id from waitlist_entry where class_id = $1) limit 1`, [CLASS.grade3Ballet]);
      expect(await expectRejected(() => q(C.ENROL, [CLASS.grade3Ballet, outsider.id, null, '']))).toMatch(/CLASS_FULL/);
      // The offered family always fits.
      const [{ enrolment_id }] = await q(C.ACCEPT_PLACE, [offered]);
      expect(enrolment_id).toBeTruthy();
      expect(await live(q)).toHaveLength(0);
    });
  });

  it('offers last the school’s chosen number of days, and a lapsed one passes to the next family', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(`update studio set waitlist_offer_days = 5 where id = $1`, [STUDIO_ID]);
      const [place] = await q(`select id from enrolment where class_id = $1 and status = 'active' limit 1`, [CLASS.grade3Ballet]);
      const [{ offered }] = await q(C.WITHDRAW, [place.id, null]);
      const [w] = await q(`select extract(day from offer_expires_at - offered_at)::int d from waitlist_entry where id = $1`, [offered]);
      expect(w.d).toBe(5);
      await svc(`update waitlist_entry set offer_expires_at = now() - interval '1 minute' where id = $1`, [offered]);
      await q(`select app.run_automations($1)`, [STUDIO_ID]);
      const now = await live(q);
      expect(now).toHaveLength(1);
      expect(now[0].id).not.toBe(offered);
    });
  });

  it('the picker lists only children who can join, with their age', async () => {
    await asUser(USERS.admin, async q => {
      const rows = await q(C.CLASS_CANDIDATES, [CLASS.grade3Ballet]);
      expect(rows.length).toBeGreaterThan(0);
      const waiting = await q(`select student_id from waitlist_entry where class_id = $1 and status in ('waiting','offered')`, [CLASS.grade3Ballet]);
      const enrolled = await q(`select student_id from enrolment where class_id = $1 and status = 'active'`, [CLASS.grade3Ballet]);
      const ids = new Set(rows.map((r: any) => r.id));
      for (const w of [...waiting, ...enrolled]) expect(ids.has(w.student_id)).toBe(false);
      const [c] = await q(`select age_min, age_max from class where id = $1`, [CLASS.grade3Ballet]);
      for (const r of rows) {
        expect(typeof r.age).toBe('number');
        expect(r.in_range).toBe((c.age_min == null || r.age >= c.age_min) && (c.age_max == null || r.age <= c.age_max));
      }
    });
    await asUser(USERS.guardianA, async q => {
      expect(await q(C.CLASS_CANDIDATES, [CLASS.grade3Ballet])).toHaveLength(0);
    });
  });
});

/* ── UR-35 history ──────────────────────────────────────────────────────── */
describe('history of changes and of medical reads (UR-35)', () => {
  it('a changed date of birth appears in History with who and when', async () => {
    await asUser(USERS.admin, async q => {
      const [s] = await q(`select id, first_name, last_name from student where deleted_at is null order by last_name offset 3 limit 1`);
      await q(`update student set date_of_birth = '2014-02-02' where id = $1`, [s.id]);
      const rec = await q(H.RECORD_HISTORY, ['student', s.id]);
      expect(rec[0]).toMatchObject({ actor: 'Nadia Okafor', action: 'update', summary: 'changed date_of_birth' });
      expect(rec[0].at).toBeTruthy();
      // The admin cannot open the school-wide history.
      expect(await q(H.AUDIT_HISTORY, [null, null, null, null, null, 50])).toHaveLength(0);
    });
  });

  it('opening a medical record as an admin is logged, once an hour, and the owner sees it', async () => {
    const [s] = await asUser(USERS.admin, async q => q(`select id from student where deleted_at is null order by last_name limit 1`));
    // Committed, so the owner's later transaction can read it.
    const { commitAs } = await import('./helpers');
    const [{ ok }] = await commitAs(USERS.admin, `select app.log_medical_view($1) as ok`, [s.id]);
    expect(ok).toBe(true);
    const [{ ok: again }] = await commitAs(USERS.admin, `select app.log_medical_view($1) as ok`, [s.id]);
    expect(again).toBe(false);
    await asUser(USERS.owner, async q => {
      const all = await q(H.AUDIT_HISTORY, [USERS.admin, 'student', null, null, null, 50]);
      expect(all.some((r: any) => r.action === 'view_medical' && r.entity_id === s.id)).toBe(true);
      const rec = await q(H.RECORD_HISTORY, ['student', s.id]);
      expect(rec.some((r: any) => r.action === 'view_medical')).toBe(true);
    });
    await asUser(USERS.admin, async q => {
      const rec = await q(H.RECORD_HISTORY, ['student', s.id]);
      expect(rec.some((r: any) => r.action === 'view_medical')).toBe(false);
    });
    // A teacher's look leaves nothing, and a teacher cannot read history.
    await asUser(USERS.teacherTap, async q => {
      const [{ ok: t }] = await q(`select app.log_medical_view($1) as ok`, [s.id]);
      expect(t).toBe(false);
      expect(await q(H.RECORD_HISTORY, ['student', s.id])).toHaveLength(0);
    });
  });

  it('the owner can filter by person, record and date', async () => {
    await asUser(USERS.owner, async q => {
      const [f] = await q(`select id, name from family where deleted_at is null order by name limit 1`);
      await q(`update family set notes = 'Prefers email' where id = $1`, [f.id]);
      const hit = await q(H.AUDIT_HISTORY, [USERS.owner, 'family', f.name.split(' ')[0], new Date().toISOString().slice(0, 10), null, 50]);
      expect(hit[0]).toMatchObject({ entity_id: f.id, summary: 'changed notes', actor: 'Freya Lindqvist' });
      expect(await q(H.AUDIT_HISTORY, [USERS.owner, 'family', f.name, '2001-01-01', '2001-01-02', 50])).toHaveLength(0);
      const fam = await q(H.RECORD_HISTORY, ['family', f.id]);
      expect(fam.some((r: any) => r.summary === 'changed notes')).toBe(true);
    });
  });
});

/* ── UR-39 asking to upgrade ────────────────────────────────────────────── */
describe('plan limits ask for an upgrade (UR-39)', () => {
  it('records one request a day, which the platform console can see', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [first] = await q(H.REQUEST_UPGRADE, ['locations limit reached']);
      expect(first.ok).toBe(true);
      const [second] = await q(H.REQUEST_UPGRADE, ['locations limit reached']);
      expect(second.ok).toBe(false);
      const [row] = await svc(`select action, entity, summary from audit_log where action = 'upgrade_request' and studio_id = $1`, [STUDIO_ID]);
      expect(row).toMatchObject({ entity: 'studio', summary: 'Asked for a larger plan: locations limit reached' });
    });
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(H.REQUEST_UPGRADE, ['x']))).toMatch(/only the office/);
    });
  });
});

/* ── UR-57 duplicate families ───────────────────────────────────────────── */
describe('duplicate families (UR-57)', () => {
  it('finds the Sullivan duplicate, previews, merges with a trail, and undoes it', async () => {
    await asUser(USERS.admin, async q => {
      const dups = await q(H.FAMILY_DUPLICATES);
      const pair = dups.find((d: any) => /sullivan/i.test(d.keep_name) && /email/i.test(d.reason));
      expect(pair).toBeTruthy();
      const preview = await q(H.MERGE_PREVIEW, [pair.keep_id, pair.other_id]);
      const moving = Object.fromEntries(preview.map((p: any) => [p.tbl, p.n]));
      expect(moving.student ?? 0).toBeGreaterThanOrEqual(0);
      const before = await q(`select count(*)::int n from student where family_id = $1`, [pair.other_id]);

      const [{ id: mergeId }] = await q(H.MERGE_FAMILIES, [pair.keep_id, pair.other_id]);
      const [gone] = await q(`select count(*)::int n from family where id = $1`, [pair.other_id]);
      expect(gone.n).toBe(0);  // hidden once merged
      const [kids] = await q(`select count(*)::int n from student where family_id = $1`, [pair.keep_id]);
      expect(kids.n).toBeGreaterThanOrEqual(before[0].n);
      const [primaries] = await q(`select count(*)::int n from guardian where family_id = $1 and is_primary and deleted_at is null`, [pair.keep_id]);
      expect(primaries.n).toBe(1);
      const hist = await q(H.RECORD_HISTORY, ['family', pair.keep_id]);
      expect(hist.some((r: any) => r.action === 'merge')).toBe(true);

      const [{ ok }] = await q(H.UNDO_MERGE, [mergeId]);
      expect(ok).toBe(true);
      const [back] = await q(`select count(*)::int n from student where family_id = $1`, [pair.other_id]);
      expect(back.n).toBe(before[0].n);
    });
  });

  it('only the office can merge, and only within its own school', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(H.MERGE_FAMILIES, [FAMILY.a, FAMILY.b]))).toMatch(/NOT_FOUND|FORBIDDEN/);
    });
    await asUser(USERS.admin, async q => {
      expect(await expectRejected(() => q(H.MERGE_FAMILIES, [FAMILY.a, FAMILY.a]))).toMatch(/INVALID/);
      expect(await expectRejected(() => q(H.MERGE_FAMILIES, [FAMILY.a, uid(NS.family, 190)]))).toMatch(/NOT_FOUND|FORBIDDEN/);
    });
  });
});

/* ── UR-54 (admins D13) funnel numbers agree ────────────────────────────── */
describe('the funnel and Reports count trials the same way (UR-54)', () => {
  it('Reports’ trialled equals the Enrolment funnel’s attended, and enrolled matches', async () => {
    await asUser(USERS.owner, async q => {
      const [f] = await q(C.FUNNEL);
      const [h] = await q(HEADLINE);
      expect(h.trials_attended).toBe(f.attended);
      expect(h.converted).toBe(f.converted);
      expect(h.enquiries).toBe(f.total);
    });
  });
});
