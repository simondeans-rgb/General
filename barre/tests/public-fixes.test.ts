import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, uid, NS, USERS, CLASS, STUDIO_ID, FAMILY } from './helpers';
import { trapTarget, isCloseControl } from '../src/lib/focus';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const AMIR = uid(NS.user, 40);
const slugOf = async (svc: any) => (await svc(`select slug from studio where id = $1`, [STUDIO_ID]))[0].slug as string;
const termNow = async (svc: any) => (await svc(`select id from term where studio_id = $1 and current_date between starts_on and ends_on limit 1`, [STUDIO_ID]))[0].id as string;
const form = (o: Record<string, unknown> = {}) => ({ contact_name: 'Sam Patel', contact_email: 'sam.patel@example.com', contact_phone: '07700 900111',
  child_name: 'Lila Patel', child_dob: '2019-05-01', privacy_ack: true, ...o });

describe('public page: suitability, price and confirmation (UR-20)', () => {
  it('every class on /join has a description, a level in plain words and its ongoing price', async () => {
    await asUser(null, async (q, svc) => {
      const slug = await slugOf(svc);
      const slots = await q(`select distinct class_name from app.public_trial_sessions($1)`, [slug]);
      const info = await q(`select * from app.public_class_info($1)`, [slug]);
      expect(slots.length).toBeGreaterThan(0);
      for (const s of slots) {
        const c = info.find((x: any) => x.class_name === s.class_name);
        expect(c, s.class_name).toBeTruthy();
        expect(c.description, s.class_name).toBeTruthy();
        expect(c.level_note ?? c.prerequisites, s.class_name).toBeTruthy();
        expect(c.price_minor, s.class_name).toBeGreaterThan(0);
        expect(['term', 'monthly', 'one_off', 'drop_in']).toContain(c.pricing);
        expect(c.address, s.class_name).toBeTruthy();
      }
      const [school] = await q(`select * from app.public_school_info($1)`, [slug]);
      expect(school.arrival_note).toMatch(/arrive/i);
      expect(school.cancellation_note).toMatch(/let the school know/i);
    });
  });

  it('a class can say what to bring, and the office can set it', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      await q(`update class set what_to_bring = 'Tap shoes, or trainers for the first week', level_note = 'No experience needed' where id = $1`, [CLASS.juniorTap]);
      const slug = await slugOf(svc);
      const [c] = await svc(`select * from app.public_class_info($1) where class_name = (select name from class where id = $2)`, [slug, CLASS.juniorTap]);
      expect(c.what_to_bring).toMatch(/Tap shoes/);
      expect(c.level_note).toBe('No experience needed');
    });
  });
});

describe('trial safety capture (UR-42)', () => {
  it('a trial booked with an allergy shows it, the second contact and the photo choice on the teacher’s register', async () => {
    await asUser(null, async (q, svc) => {
      const slug = await slugOf(svc);
      const [slot] = await q(`select * from app.public_trial_sessions($1) order by starts_at limit 1`, [slug]);
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, slot.session_id, JSON.stringify(form({
        allergies: 'Peanuts (carries an EpiPen)', medical: 'Mild asthma', emergency_name: 'Asha Patel', emergency_phone: '07700 900222',
        emergency_relationship: 'Grandmother', photo_consent: 'false' }))]);
      const [kid] = await svc(`select t.student_id from trial t join enquiry e on e.id = t.enquiry_id where e.contact_email = 'sam.patel@example.com'`);
      const [teacher] = await svc(`select coalesce(cs.teacher_id, c.teacher_id) id from class_session cs join class c on c.id = cs.class_id where cs.id = $1`, [slot.session_id]);
      const [{ user_id }] = await svc(`select user_id from staff_member where id = $1`, [teacher.id]);
      const T = await import('../src/lib/repos/teaching');
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user_id, role: 'authenticated' })]);
      const reg = await q(T.REGISTER, [slot.session_id]);
      const me = reg.find((r: any) => r.student_id === kid.student_id);
      expect(me.is_trial).toBe(true);
      expect(me.allergies).toMatch(/Peanuts/);
      expect(me.conditions).toMatch(/asthma/);
      expect(me.has_medical_need).toBe(true);
      expect(me.photo_consent).toBe(false);
      expect(me.emergency_contacts.map((c: any) => c.name)).toEqual(['Sam Patel', 'Asha Patel']);
      const [consent] = await svc(`select kind, granted from consent_record where student_id = $1`, [kid.student_id]);
      expect(consent).toEqual({ kind: 'photography', granted: false });
    });
  });

  it('half an emergency contact is refused; no details is fine', async () => {
    await asUser(null, async (q, svc) => {
      const slug = await slugOf(svc);
      const [slot] = await q(`select * from app.public_trial_sessions($1) order by starts_at limit 1`, [slug]);
      expect(await expectRejected(() => q(`select app.public_book_trial($1, $2, $3::jsonb)`,
        [slug, slot.session_id, JSON.stringify(form({ contact_email: 'x1@example.com', emergency_name: 'Someone' }))]))).toMatch(/both a name and a phone/);
      await q(`select app.public_book_trial($1, $2, $3::jsonb)`, [slug, slot.session_id, JSON.stringify(form({ contact_email: 'x2@example.com' }))]);
      const [kid] = await svc(`select t.student_id from trial t join enquiry e on e.id = t.enquiry_id where e.contact_email = 'x2@example.com'`);
      expect(await svc(`select 1 from medical_record where student_id = $1`, [kid.student_id])).toHaveLength(0);
      expect(await svc(`select 1 from consent_record where student_id = $1`, [kid.student_id])).toHaveLength(0);
    });
  });
});

describe('one diary (UR-26)', () => {
  it('Amir’s timetable shows his exam entry and the show rehearsals; Hannah’s schedule shows Nia’s competition; the feed has the same', async () => {
    await asUser(AMIR, async (q, svc) => {
      const [amir] = await svc(`select id, family_id from student where user_id = $1`, [AMIR]);
      const [nia] = await svc(`select id from student where family_id = $1 and id <> $2 order by date_of_birth desc offset 1 limit 1`, [amir.family_id, amir.id]);
      const ex = (await svc(`insert into exam_session (studio_id, board, title, exam_on) values ($1, 'RAD', 'Spring exams', current_date + 10) returning id`, [STUDIO_ID]))[0].id;
      await svc(`insert into exam_entry (studio_id, session_id, student_id, grade) values ($1, $2, $3, 'Grade 5')`, [STUDIO_ID, ex, amir.id]);
      const show = uid(NS.event, 2), comp = uid(NS.event, 1);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed') on conflict (event_id, student_id) do update set status = 'confirmed'`, [STUDIO_ID, show, amir.id]);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed') on conflict (event_id, student_id) do update set status = 'confirmed'`, [STUDIO_ID, comp, nia.id]);
      await svc(`insert into studio_event (studio_id, kind, title, starts_at, parent_event_id, requests_open) select studio_id, 'rehearsal', 'Stage rehearsal', starts_at - interval '3 days', id, false from studio_event where id = $1`, [show]);
      const from = new Date().toISOString(), to = new Date(Date.now() + 70 * 86400_000).toISOString();

      const mine = await q(`select * from app.my_diary($1, $2)`, [from, to]);
      const kinds = new Set(mine.map((r: any) => r.item_kind));
      expect(kinds.has('class')).toBe(true);
      expect(mine.find((r: any) => r.item_kind === 'exam')?.title).toMatch(/Grade 5/);
      expect(mine.some((r: any) => r.item_kind === 'rehearsal' && r.title === 'Stage rehearsal')).toBe(true);
      expect(mine.some((r: any) => r.item_kind === 'show')).toBe(true);
      expect(mine.every((r: any) => r.student_id === amir.id)).toBe(true);   // only his own
      // Students see their own exam entries and results.
      expect((await q(`select grade from exam_entry`)).map((r: any) => r.grade)).toEqual(['Grade 5']);

      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianA, role: 'authenticated' })]);
      const fam = await q(`select * from app.my_diary($1, $2)`, [from, to]);
      expect(fam.some((r: any) => r.item_kind === 'competition' && r.student_id === nia.id)).toBe(true);
      expect(fam.some((r: any) => r.item_kind === 'exam' && r.student_id === amir.id)).toBe(true);
      const privates = fam.filter((r: any) => r.item_kind === 'private_lesson');
      const [{ n }] = await svc(`select count(*)::int n from studio_event ev join student s on s.id = ev.student_id where ev.kind = 'private_lesson' and s.family_id = $1 and ev.starts_at > now()`, [FAMILY.a]);
      expect(privates.length).toBe(n);

      const [{ t }] = await q(`select app.issue_calendar_token($1) t`, [STUDIO_ID]);
      const feed = await svc(`select * from app.calendar_feed($1)`, [t]);
      expect(feed.some((f: any) => f.title.startsWith('Exam: ') && f.title.includes('Grade 5'))).toBe(true);
      expect(feed.some((f: any) => f.title.startsWith('Competition: '))).toBe(true);
      expect(feed.some((f: any) => f.title.startsWith('Rehearsal: Stage rehearsal'))).toBe(true);
      // No other family's private lessons leak in.
      expect(feed.filter((f: any) => /Private lesson/.test(f.title)).length).toBe(n);
    });
  });

  it('a stranger’s diary is empty', async () => {
    await asUser(USERS.stranger, async q => {
      expect(await q(`select * from app.my_diary(now(), now() + interval '60 days')`)).toHaveLength(0);
    });
  });
});

describe('events (UR-50)', () => {
  it('a parent sees the true places count, each child’s own status, and named entries', async () => {
    await asUser(USERS.guardianA, async (q, svc) => {
      const H = await import('../src/lib/repos/hub');
      const kids = await svc(`select id, first_name from student where family_id = $1 order by date_of_birth`, [FAMILY.a]);
      const ev = uid(NS.event, 3);
      await svc(`insert into event_participant (studio_id, event_id, student_id, status) values ($1, $2, $3, 'confirmed'), ($1, $2, $4, 'requested') on conflict (event_id, student_id) do update set status = excluded.status`, [STUDIO_ID, ev, kids[0].id, kids[1].id]);
      const [{ n }] = await svc(`select count(*)::int n from event_participant where event_id = $1 and status = 'confirmed' and deleted_at is null`, [ev]);
      const row = (await q(H.EVENTS)).find((e: any) => e.id === ev);
      expect(row.going).toBe(n);
      expect(n).toBeGreaterThan(1);
      const mine = row.mine.sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));
      expect(mine).toHaveLength(2);
      expect(Object.fromEntries(mine.map((m: any) => [m.first_name, m.status]))).toEqual({ [kids[0].first_name]: 'confirmed', [kids[1].first_name]: 'requested' });
    });
  });

  it('a notice about an event reaches the families on it, linked to the event', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const ev = uid(NS.event, 1);
      const [{ n }] = await q(`select app.send_event_notice($1, 'Festival timings', 'Arrive by 8.30, troupe call at 9.') n`, [ev]);
      const [{ fams }] = await svc(`select count(distinct s.family_id)::int fams from event_participant p join student s on s.id = p.student_id where p.event_id = $1 and p.status in ('invited','confirmed','requested') and p.deleted_at is null`, [ev]);
      expect(n).toBe(fams);
      expect((await svc(`select count(*)::int c from communication where event_id = $1`, [ev]))[0].c).toBe(fams);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await expectRejected(() => q(`select app.send_event_notice($1, 'x', 'y')`, [uid(NS.event, 1)]))).toMatch(/office/);
    });
  });

  it('helpers sign up to rota slots; full slots refuse; the office sees names', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const show = uid(NS.event, 2);
      const [slot] = await q(`insert into event_helper_slot (studio_id, event_id, role, needed) values ($1, $2, 'Front of house', 1) returning id`, [STUDIO_ID, show]);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianA, role: 'authenticated' })]);
      expect(await expectRejected(() => q(`insert into event_helper_slot (studio_id, event_id, role) values ($1, $2, 'Sneaky')`, [STUDIO_ID, show]))).toBeTruthy();
      expect((await q(`select app.volunteer($1, true) n`, [slot.id]))[0].n).toBe(1);
      const [mine] = await q(`select * from app.helper_slots($1)`, [show]);
      expect(mine).toMatchObject({ filled: 1, mine: true, helpers: null });
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianB, role: 'authenticated' })]);
      expect(await expectRejected(() => q(`select app.volunteer($1, true)`, [slot.id]))).toMatch(/already filled/);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.owner, role: 'authenticated' })]);
      const [office] = await q(`select * from app.helper_slots($1)`, [show]);
      expect(office.helpers).toMatch(/Hannah/);
      await svc(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: USERS.guardianA, role: 'authenticated' })]);
      expect((await q(`select app.volunteer($1, false) n`, [slot.id]))[0].n).toBe(0);
    });
  });
});

describe('owner reports (UR-33, UR-34, UR-51)', () => {
  it('location figures sum to the whole school and the selector has something to choose', async () => {
    const R = await import('../src/lib/repos/reports');
    await asUser(USERS.owner, async q => {
      const locs = await q(R.LOCATIONS);
      expect(locs.length).toBeGreaterThan(1);
      const all = await q(R.CLASS_STATS_AT, [null]);
      let sum = 0;
      for (const l of locs) {
        const rows = await q(R.CLASS_STATS_AT, [l.id]);
        expect(rows.every((r: any) => r.location_id === l.id)).toBe(true);
        sum += rows.length;
      }
      expect(sum).toBe(all.length);
      const cmp = await q(R.BY_LOCATION);
      expect(cmp.reduce((a: number, r: any) => a + r.enrolled, 0)).toBe(all.reduce((a: number, r: any) => a + r.enrolled, 0));
      expect(cmp.reduce((a: number, r: any) => a + r.capacity, 0)).toBe(all.reduce((a: number, r: any) => a + r.capacity, 0));
      const [h] = await q(R.HEADLINE_AT, [locs[0].id]);
      const [hAll] = await q(R.HEADLINE_AT, [null]);
      expect(h.active_students).toBeLessThanOrEqual(hAll.active_students);
      expect(hAll.active_students).toBe((await q(`select count(distinct student_id)::int n from enrolment where status = 'active'`))[0].n);
    });
  });

  it('term-on-term retention reconciles with the enrolment records', async () => {
    const R = await import('../src/lib/repos/reports');
    await asUser(USERS.owner, async (q, svc) => {
      const cur = await termNow(svc);
      // A previous term with one class: three children, two of whom carried on.
      const [prev] = await svc(`insert into term (studio_id, name, starts_on, ends_on, status) select studio_id, 'Summer', starts_on - 120, starts_on - 30, 'published' from term where id = $1 returning id`, [cur]);
      const [old] = await svc(`insert into class (studio_id, term_id, dance_style_id, location_id, name, day_of_week, start_time, duration_min, capacity)
                               select studio_id, $1, dance_style_id, location_id, 'Old Tap', 2, '17:00', 45, 12 from class where id = $2 returning id`, [prev.id, CLASS.juniorTap]);
      const stayers = (await svc(`select student_id from enrolment where class_id = $1 and status = 'active' order by student_id limit 2`, [CLASS.juniorTap])).map((r: any) => r.student_id);
      const [leaver] = await svc(`select s.id from student s where s.studio_id = $1 and s.deleted_at is null
        and not exists (select 1 from enrolment e join class c on c.id = e.class_id where e.student_id = s.id and c.term_id = $2) limit 1`, [STUDIO_ID, cur]);
      for (const sid of [...stayers, leaver.id]) {
        await svc(`insert into enrolment (studio_id, class_id, student_id, status, started_on, ended_on) values ($1, $2, $3, 'left', current_date - 120, current_date - 30)`, [STUDIO_ID, old.id, sid]);
      }
      const [sum] = await q(R.RETENTION_SUMMARY, [cur]);
      expect(sum.previous_term).toBe('Summer');
      expect(sum.previous).toBe(3);
      expect(sum.continuing).toBe(2);
      expect(sum.lapsed).toBe(1);
      const [{ n: nowN }] = await svc(`select count(distinct e.student_id)::int n from enrolment e join class c on c.id = e.class_id where c.term_id = $1 and e.deleted_at is null and e.status in ('active','left')`, [cur]);
      expect(sum.current).toBe(nowN);
      expect(sum.new).toBe(nowN - 2);
      const lapsed = await q(R.LAPSED, [cur]);
      expect(lapsed).toHaveLength(1);
      expect(lapsed[0]).toMatchObject({ student_id: leaver.id, last_class: 'Old Tap' });
      const byClass = await q(R.RETENTION_BY, [cur, 'class']);
      expect(byClass.find((r: any) => r.label === 'Old Tap')).toMatchObject({ previous: 3, continuing: 2 });
      expect((await q(R.RETENTION_BY, [cur, 'age'])).reduce((a: number, r: any) => a + r.previous, 0)).toBe(3);
    });
  });

  it('under-filled classes: below a threshold, with the waiting list', async () => {
    const R = await import('../src/lib/repos/reports');
    await asUser(USERS.owner, async q => {
      const all = await q(R.CLASS_STATS_AT, [null]);
      const under = all.filter((c: any) => R.underFilled(c, 60));
      expect(under.every((c: any) => c.enrolled / c.capacity < 0.6)).toBe(true);
      expect(all.filter((c: any) => !R.underFilled(c, 60) && c.pricing !== 'drop_in').every((c: any) => c.enrolled / c.capacity >= 0.6)).toBe(true);
      expect(under.some((c: any) => c.pricing === 'drop_in')).toBe(false);
      expect(all.every((c: any) => typeof c.waiting === 'number' && typeof c.enrolled_4w_ago === 'number')).toBe(true);
    });
  });
});

describe('migration toolkit (UR-32)', () => {
  const cls = (o: Record<string, string> = {}) => ({ name: 'Imported Jazz', style: 'Bollywood', day: 'Wednesday', time: '18:15', duration: '60',
    location: 'Greenwich Studio', room: 'Studio 9', teacher: 'Nobody Here', capacity: '14', age_min: '8', age_max: '11', price: '£96.00', ...o });

  it('a timetable CSV is checked row by row, then imported once with sessions', async () => {
    await asUser(USERS.owner, async q => {
      const bad = [cls(), cls({ name: '', day: 'Funday', time: 'teatime', capacity: '0' })];
      const [{ r }] = await q(`select app.import_classes($1::jsonb, false) r`, [JSON.stringify(bad)]);
      expect(r.ok).toBe(false);
      expect(r.errors.filter((e: any) => e.row === 2).map((e: any) => e.message).join(' | ')).toMatch(/No class name.*Funday.*teatime.*Places/);
      expect(await expectRejected(() => q(`select app.import_classes($1::jsonb, true)`, [JSON.stringify(bad)]))).toMatch(/need fixing/);

      const good = [cls(), cls({ name: 'Imported Ballet', style: 'ballet', day: 'sat', time: '09:30', teacher: '', room: '' })];
      const [{ r: check }] = await q(`select app.import_classes($1::jsonb, false) r`, [JSON.stringify(good)]);
      expect(check.ok).toBe(true);
      expect(check.warnings.map((w: any) => w.message).join(' | ')).toMatch(/Bollywood.*Studio 9.*Nobody Here/);
      const [{ r: done }] = await q(`select app.import_classes($1::jsonb, true) r`, [JSON.stringify(good)]);
      expect(done).toMatchObject({ classes: 2, skipped: 0 });
      expect(done.sessions).toBeGreaterThan(0);
      const [c] = await q(`select c.day_of_week, c.price_minor, c.capacity, c.teacher_id, r.name room from class c left join room r on r.id = c.room_id where c.name = 'Imported Jazz'`);
      expect(c).toMatchObject({ day_of_week: 3, price_minor: 9600, capacity: 14, teacher_id: null, room: 'Studio 9' });
      const [{ r: again }] = await q(`select app.import_classes($1::jsonb, true) r`, [JSON.stringify(good)]);
      expect(again).toMatchObject({ classes: 0, skipped: 2 });
    });
  });

  it('opening balances: owed becomes a labelled invoice, credit a labelled credit; once per family; the term run skips the term already billed', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await termNow(svc);
      const emails = (await svc(`select distinct on (g.family_id) g.family_id, g.email from guardian g where g.email is not null and g.studio_id = $1
                                    and exists (select 1 from student s join enrolment e on e.student_id = s.id and e.status = 'active' join class c on c.id = e.class_id
                                                 where s.family_id = g.family_id and c.term_id = $2 and c.pricing = 'term' and c.price_minor > 0)
                                    and not exists (select 1 from invoice i where i.family_id = g.family_id and i.term_id = $2)
                                  order by g.family_id limit 2`, [STUDIO_ID, t]));
      expect(emails).toHaveLength(2);
      const rows = [{ parent_email: emails[0].email, balance: '45.50' }, { parent_email: emails[1].email, balance: '-20' }, { family: 'Nobody', balance: '1' }];
      const [{ r }] = await q(`select app.import_opening_balances($1::jsonb, current_date - 1, false, $2) r`, [JSON.stringify(rows), t]);
      expect(r.ok).toBe(false);
      expect(r.errors[0]).toMatchObject({ row: 3 });
      const before = await q(`select * from app.billing_lines($1)`, [t]);
      expect(before.some((l: any) => l.family_id === emails[0].family_id)).toBe(true);

      const [{ r: done }] = await q(`select app.import_opening_balances($1::jsonb, current_date - 1, true, $2) r`, [JSON.stringify(rows.slice(0, 2)), t]);
      expect(done).toMatchObject({ invoices: 2, credits: 1, owed_minor: 4550, credit_minor: 2000 });
      const [inv] = await q(`select i.note, i.total_minor, i.status from invoice i where i.family_id = $1 and i.note like 'Opening balance%'`, [emails[0].family_id]);
      expect({ ...inv, total_minor: Number(inv.total_minor) }).toMatchObject({ total_minor: 4550, status: 'issued' });
      const [pay] = await q(`select amount_minor, note from payment where family_id = $1 and method = 'credit' and note like 'Opening credit%'`, [emails[1].family_id]);
      expect(Number(pay.amount_minor)).toBe(2000);
      const bal = Object.fromEntries((await q(`select id, balance_minor from family where id = any($1)`, [emails.map((e: any) => e.family_id)])).map((f: any) => [f.id, Number(f.balance_minor)]));
      expect(bal[emails[0].family_id]).toBe(4550);
      expect(bal[emails[1].family_id]).toBe(-2000);
      // The term these balances cover is not billed again.
      const after = await q(`select * from app.billing_lines($1)`, [t]);
      expect(after.some((l: any) => emails.some((e: any) => e.family_id === l.family_id))).toBe(false);
      // Running the file again changes nothing.
      const [{ r: again }] = await q(`select app.import_opening_balances($1::jsonb, current_date - 1, true, $2) r`, [JSON.stringify(rows.slice(0, 2)), t]);
      expect(again).toMatchObject({ invoices: 0, credits: 0, skipped: 2 });
      expect(await expectRejected(() => q(`select app.import_opening_balances($1::jsonb, current_date + 1, false)`, [JSON.stringify(rows)]))).toMatch(/as at/);
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(`select app.import_opening_balances('[{"family":"x","balance":"1"}]'::jsonb, current_date, false)`))).toMatch(/FORBIDDEN|office/);
    });
  });
});

describe('sheet focus rules (UR-31)', () => {
  it('Tab wraps inside the sheet and a stray focus is pulled back in', () => {
    expect(trapTarget(3, 2, false)).toBe(0);
    expect(trapTarget(3, 0, true)).toBe(2);
    expect(trapTarget(3, 1, false)).toBeNull();
    expect(trapTarget(3, -1, false)).toBe(0);
    expect(trapTarget(3, -1, true)).toBe(2);
    expect(trapTarget(0, -1, false)).toBeNull();
  });
  it('finds the sheet’s own close control for Escape', () => {
    expect(isCloseControl('Close', '')).toBe(true);
    expect(isCloseControl('Close details', '')).toBe(true);
    expect(isCloseControl(null, 'Cancel')).toBe(true);
    expect(isCloseControl(null, 'Save')).toBe(false);
    expect(isCloseControl('Remove Ada', '')).toBe(false);
  });
});
