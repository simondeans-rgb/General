import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS } from './helpers';
import * as C from '../src/lib/repos/classes';
import * as D from '../src/lib/repos/dashboard';
import * as H from '../src/lib/repos/office';
import * as B from '../src/lib/repos/billing';
import { SEARCH } from '../src/lib/repos/search';
import { invoiceState } from '../src/lib/payments/invoice-status';
import {
  plural, dateWithYear, officeAgeFit, pickerLabels, groupAttention, reminderReach, paidAndCredited, pastTense,
} from '../src/lib/office-words';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const anEnquiry = async (svc: any) =>
  (await svc(`select id from enquiry where deleted_at is null and stage not in ('enrolled','closed_lost') order by created_at limit 1`))[0].id as string;

/* ── F10 · enquiry notes and follow-ups ─────────────────────────────────── */
describe('enquiry notes and follow-ups (F10)', () => {
  it('the office adds a note with a follow-up date; it is listed newest first and dated', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const id = await anEnquiry(svc);
      await q(C.ADD_ENQUIRY_NOTE, [id, 'Called back, wants Saturdays', null]);
      const soon = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
      await q(C.ADD_ENQUIRY_NOTE, [id, 'Left a voicemail', soon]);
      const notes = await q(C.ENQUIRY_NOTES, [id]);
      expect(notes.map((n: any) => n.body)).toEqual(['Left a voicemail', 'Called back, wants Saturdays']);
      expect(notes[0].author).toBe('Nadia Okafor');
      const [e] = await svc(`select next_action_on::text d from enquiry where id = $1`, [id]);
      expect(e.d).toBe(soon);
    });
  });

  it('a follow-up date can be set or cleared on its own, and an empty note is refused', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const id = await anEnquiry(svc);
      await q(C.SET_ENQUIRY_FOLLOW_UP, [id, null]);
      expect((await svc(`select next_action_on from enquiry where id = $1`, [id]))[0].next_action_on).toBeNull();
      expect(await expectRejected(() => q(C.ADD_ENQUIRY_NOTE, [id, '   ', null]))).toMatch(/note or choose a follow-up/);
    });
  });

  it('teachers and families cannot add or read enquiry notes', async () => {
    let id = '';
    await asUser(USERS.admin, async (_q, svc) => { id = await anEnquiry(svc); });
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(C.ADD_ENQUIRY_NOTE, [id, 'hello', null]))).toMatch(/FORBIDDEN/);
      expect(await q(`select * from enquiry_note`)).toHaveLength(0);
    });
    await asUser(USERS.guardianA, async q => {
      expect(await q(`select * from enquiry_note`)).toHaveLength(0);
    });
  });

  it('Today lists follow-ups due today or overdue under Today, and the rest of the week separately', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [a, b] = (await svc(`select id from enquiry where deleted_at is null and stage not in ('enrolled','closed_lost')
                                   order by created_at limit 2`)).map((r: any) => r.id);
      const today = new Date().toISOString().slice(0, 10);
      const later = new Date(Date.now() + 4 * 86400_000).toISOString().slice(0, 10);
      await q(C.SET_ENQUIRY_FOLLOW_UP, [a, today]);
      await q(C.SET_ENQUIRY_FOLLOW_UP, [b, later]);
      const rows = await q(D.ATTENTION_FOLLOW_UPS);
      expect(rows.find((r: any) => r.id === a)?.due_now).toBe(true);
      expect(rows.find((r: any) => r.id === b)?.due_now).toBe(false);
      expect(rows.every((r: any) => !['enrolled', 'closed_lost'].includes(r.stage))).toBe(true);
    });
  });
});

/* ── F10 · history the administrators can read ─────────────────────────── */
describe('admin-readable history (F10)', () => {
  it('an administrator reads the school history, without medical, safeguarding or access rows', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [kid] = await svc(`select id from student where deleted_at is null limit 1`);
      await q(H.LOG_MEDICAL_VIEW, [kid.id]);
      const rows = await q(H.OFFICE_HISTORY, [null, null, null, null, null, 1000, false]);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.some((r: any) => r.action === 'view_medical')).toBe(false);
      expect(rows.some((r: any) => /^(medical_record|safeguarding|staff_check|membership)/.test(r.entity))).toBe(false);
    });
    await asUser(USERS.owner, async (q, svc) => {
      const [kid] = await svc(`select id from student where deleted_at is null limit 1`);
      await q(H.LOG_MEDICAL_VIEW, [kid.id]);
      const rows = await q(H.OFFICE_HISTORY, [null, null, null, null, null, 1000, false]);
      expect(rows.some((r: any) => r.action === 'view_medical')).toBe(true);
    });
  });

  it('automatic rows are marked, and people-only leaves them out', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      await q(C.ADD_ENQUIRY_NOTE, [await anEnquiry(svc), 'Rang twice', null]);
      const all = await q(H.OFFICE_HISTORY, [null, null, null, null, null, 1000, false]);
      const people = await q(H.OFFICE_HISTORY, [null, null, null, null, null, 1000, true]);
      expect(all.some((r: any) => r.automatic)).toBe(true);
      expect(people.length).toBeGreaterThan(0);
      expect(people.every((r: any) => !r.automatic)).toBe(true);
      expect((await q(H.OFFICE_HISTORY_ACTORS)).length).toBeGreaterThan(0);
    });
  });

  it('teachers and families read no history at all', async () => {
    for (const u of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(u, async q => {
        expect(await q(H.OFFICE_HISTORY, [null, null, null, null, null, 100, false])).toHaveLength(0);
      });
    }
  });
});

/* ── U8 · search ranks exact matches first ─────────────────────────────── */
describe('⌘K ranking (U8)', () => {
  it('an exact invoice number comes first, with the status word Billing uses', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [inv] = await svc(`select number from invoice where deleted_at is null and status in ('issued','part_paid')
                                 and due_on < current_date order by number limit 1`);
      const hits = await q(SEARCH, [inv.number]);
      expect(hits[0].kind).toBe('invoice');
      expect(hits[0].title).toBe(inv.number);
      expect(hits[0].detail).toMatch(/Overdue/);
      // Digits inside an invoice number are not read as a phone number.
      expect(hits.some((h: any) => h.kind === 'family')).toBe(false);
    });
  });

  it('an exact name comes before names that merely contain it', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [s] = await svc(`select first_name || ' ' || last_name n from student where deleted_at is null order by created_at limit 1`);
      const hits = await q(SEARCH, [s.n.toLowerCase()]);
      expect(hits[0].title).toBe(s.n);
    });
  });
});

/* ── U8 · billing totals follow the location ───────────────────────────── */
describe('billing summary by location (U8)', () => {
  it('each location is a part of the whole-school summary', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [all] = await q(B.SUMMARY);
      // With no location the page uses the whole-school summary (SUMMARY_AT takes a location, 0062).
      const locs = await svc(`select name from location where deleted_at is null order by name`);
      let sum = 0;
      for (const l of locs) {
        const [at] = await q(B.SUMMARY_AT, [l.name]);
        expect(Number(at.overdue_minor)).toBeLessThanOrEqual(Number(all.overdue_minor));
        sum += Number(at.owing_families);
      }
      // A family with children at two sites counts at both, so the parts are at least the whole.
      expect(sum).toBeGreaterThanOrEqual(all.owing_families);
    });
  });
});

/* ── U3 · a credit note is shown as credit ─────────────────────────────── */
describe('credit notes are not payments (U3)', () => {
  it('the invoice carries what was credited, and its status is not "Part paid"', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const [inv] = await svc(`select id from invoice where status = 'issued' and deleted_at is null
                                 and not exists (select 1 from payment p where p.invoice_id = invoice.id) limit 1`);
      await q(B.ISSUE_CREDIT_NOTE, [inv.id, 1000, 'Class cancelled', 'account']);
      const [i] = await q(B.INVOICE, [inv.id]);
      expect(Number(i.credited_minor)).toBe(1000);
      const p = paidAndCredited(i);
      expect(p.paid).toBe(0);
      expect(p.credited).toBe(1000);
      expect(invoiceState(i).label).not.toMatch(/part paid/i);
      const listed = (await q(B.INVOICES)).find((r: any) => r.id === inv.id);
      expect(Number(listed.credited_minor)).toBe(1000);
      expect(invoiceState(listed).label).not.toMatch(/part paid/i);
    });
  });
});

/* ── New school timetable: the first week of term ──────────────────────── */
describe('empty timetable (owners U7)', () => {
  it('finds the first week with classes after an empty one', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [far] = await svc(`select max(starts_at) m from class_session where deleted_at is null`);
      const [none] = await q(D.NEXT_CLASS_WEEK, [new Date(new Date(far.m).getTime() + 86400_000).toISOString()]);
      expect(none?.starts_at ?? null).toBeNull();
      const [next] = await q(D.NEXT_CLASS_WEEK, [new Date(Date.now() - 365 * 86400_000).toISOString()]);
      expect(next.starts_at).toBeTruthy();
      expect(next.term_name).toBeTruthy();
    });
  });
});

/* ── Pure rules ────────────────────────────────────────────────────────── */
describe('office wording rules', () => {
  it('plurals and tense (U8)', () => {
    expect(plural(1, 'family', 'families')).toBe('1 family');
    expect(plural(2, 'family', 'families')).toBe('2 families');
    expect(plural(1, 'invoice')).toBe('1 invoice');
    expect(plural(0, 'row')).toBe('0 rows');
    expect(pastTense('New dance styles will be added: Jazz')).toBe('New dance styles were added: Jazz');
  });

  it('dates of birth carry the year (U8)', () => {
    expect(dateWithYear('2021-02-11')).toBe('11 Feb 2021');
    expect(dateWithYear(new Date('2021-02-11T00:00:00Z'))).toBe('11 Feb 2021');
    expect(dateWithYear(null)).toBe('—');
  });

  it('the move picker follows the database age rule (U3)', () => {
    const adult = { age_min: 18, age_max: null };
    const juniors = { age_min: 7, age_max: 10 };
    expect(officeAgeFit(5, adult)).toBe('never');
    expect(officeAgeFit(30, juniors)).toBe('never');
    expect(officeAgeFit(11, juniors)).toBe('teacher');
    expect(officeAgeFit(8, juniors)).toBe('fits');
    expect(officeAgeFit(null, adult)).toBe('fits');
  });

  it('pickers tell apart families with the same name (U8)', () => {
    const l = pickerLabels([
      { id: 'a', name: 'Haddad family', guardian: 'Rana Haddad', children: 'Omar' },
      { id: 'b', name: 'Haddad family', guardian: 'Sami Haddad', children: 'Lina', postcode: 'SE3 7AA' },
      { id: 'c', name: 'Wright family', guardian: 'Hannah Wright' },
    ]);
    expect(l.get('a')).toBe('Haddad family (Rana Haddad; Omar)');
    expect(l.get('b')).toBe('Haddad family (Sami Haddad; Lina; SE3 7AA)');
    expect(l.get('c')).toBe('Wright family');
  });

  it('Needs attention groups Today first and shows the top five (U13)', () => {
    const items = [
      { key: '1', when: 'week' as const }, { key: '2', when: 'today' as const }, { key: '3', when: 'week' as const },
      { key: '4', when: 'today' as const }, { key: '5', when: 'week' as const }, { key: '6', when: 'week' as const },
      { key: '7', when: 'week' as const },
    ];
    const g = groupAttention(items);
    expect(g.today.map(i => i.key)).toEqual(['2', '4']);
    expect(g.week.map(i => i.key)).toEqual(['1', '3', '5']);
    expect(g.hidden).toBe(2);
    expect(groupAttention(items, 5, true).hidden).toBe(0);
  });

  it('a reminder says who it reaches (U3)', () => {
    const r = reminderReach([{ uses_app: true, family_name: 'A' }, { uses_app: false, family_name: 'B' }]);
    expect(r.reached.map(f => f.family_name)).toEqual(['A']);
    expect(r.unreached.map(f => f.family_name)).toEqual(['B']);
  });
});
