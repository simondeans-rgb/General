/* Performance budget for the main screens (docs/ARCHITECTURE.md, "Performance
   budget").

   Each entry is a query a screen issues when it opens, exactly as the screen
   issues it: the exported SQL from src/lib/repos, the parameters the screen
   passes, run by the kind of person who uses that screen, in a read-only
   transaction under row-level security. The list was taken from the queries
   the demo actually ran while each screen was opened (every tab) as each role.

   Every query must finish within BUDGET_MS on the test database. The budget
   is generous so a busy machine does not fail it, while still catching the
   kind of regression this file was written for: before migration 0068 the
   teacher's My students took ~0.9 s here (8 s in the in-browser demo), the
   student list 0.7-5 s, the reports headline 0.7-1.9 s.

   The timings are printed, slowest first, so a regression is easy to see. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asReader, closeDb, db, rebuild, uid, NS, USERS, STUDIO_ID } from './helpers';
import * as Dash from '../src/lib/repos/dashboard';
import * as B from '../src/lib/repos/billing';
import * as P from '../src/lib/repos/people';
import * as O from '../src/lib/repos/office';
import * as C from '../src/lib/repos/classes';
import * as R from '../src/lib/repos/reports';
import * as I from '../src/lib/repos/inbox';
import * as H from '../src/lib/repos/hub';
import * as E from '../src/lib/repos/events';
import * as T from '../src/lib/repos/teaching';
import * as G from '../src/lib/repos/progress';
import * as F from '../src/lib/repos/family';
import * as A from '../src/lib/repos/account';
import * as S from '../src/lib/repos/safeguarding';
import * as Ag from '../src/lib/repos/agenda';
import * as Se from '../src/lib/repos/seasons';
import * as Cn from '../src/lib/repos/consent';

export const BUDGET_MS = 500;

const LOC = { greenwich: uid(NS.location, 1), blackheath: uid(NS.location, 2) };
const TERM = uid(NS.term, 1);
const STUDENT = { amir: uid(NS.student, 1) };
const AMIR_USER = uid(NS.user, 40);

type Ctx = { now: Date; registerMarcus: string; registerPriya: string; tapClass: string; event: string };
type Who = 'owner' | 'admin' | 'limited admin' | 'teacher' | 'cover teacher' | 'guardian' | 'student';
type Entry = { who: Who; screen: string; name: string; sql: string; params?: (c: Ctx) => unknown[] };

const USER: Record<Who, string> = {
  owner: USERS.owner, admin: USERS.admin, 'limited admin': USERS.admin,
  teacher: USERS.teacherTap, 'cover teacher': USERS.teacherModern, guardian: USERS.guardianA, student: AMIR_USER,
};

const day = (d: Date, n = 0) => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() + n); return x.toISOString(); };
const weekStart = (d: Date) => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x; };
const nextDays = (n: number) => (c: Ctx) => [day(c.now), day(c.now, n)];
const thisWeek = (c: Ctx) => { const w = weekStart(c.now); return [w.toISOString(), day(w, 7)]; };

const office = (who: Who): Entry[] => [
  // Today
  { who, screen: '/today', name: 'dashboard.ATTENTION_LAPSED', sql: Dash.ATTENTION_LAPSED },
  { who, screen: '/today', name: 'dashboard.RECENT_ENROLMENTS', sql: Dash.RECENT_ENROLMENTS },
  { who, screen: '/today', name: 'dashboard.ATTENTION_PAYMENTS', sql: Dash.ATTENTION_PAYMENTS },
  { who, screen: '/today', name: 'dashboard.ATTENTION_REQUESTS', sql: Dash.ATTENTION_REQUESTS },
  { who, screen: '/today', name: 'dashboard.ATTENTION_MESSAGES', sql: Dash.ATTENTION_MESSAGES },
  { who, screen: '/today', name: 'dashboard.ATTENTION_TRIALS', sql: Dash.ATTENTION_TRIALS },
  { who, screen: '/today', name: 'dashboard.ATTENTION_CAPACITY', sql: Dash.ATTENTION_CAPACITY },
  { who, screen: '/today', name: 'dashboard.RECENT_MESSAGES', sql: Dash.RECENT_MESSAGES },
  { who, screen: '/today', name: 'dashboard.UPCOMING_TRIALS', sql: Dash.UPCOMING_TRIALS },
  { who, screen: '/today', name: 'dashboard.SESSIONS_BETWEEN (today)', sql: Dash.SESSIONS_BETWEEN, params: c => [day(c.now), day(c.now, 1)] },
  { who, screen: '/today', name: 'billing.SUMMARY', sql: B.SUMMARY },
  { who, screen: '/today', name: 'safeguarding.SAFEGUARDING_TODAY', sql: S.SAFEGUARDING_TODAY },
  // People
  { who, screen: '/people', name: 'people.FAMILIES', sql: P.FAMILIES },
  { who, screen: '/people', name: 'people.STUDENTS', sql: P.STUDENTS },
  { who, screen: '/people', name: 'office.FAMILY_FACTS', sql: O.FAMILY_FACTS },
  { who, screen: '/people', name: 'office.FAMILY_DUPLICATES', sql: O.FAMILY_DUPLICATES },
  { who, screen: '/people', name: 'people.STAFF_FULL', sql: P.STAFF_FULL },
  // Classes, enrolment, timetable
  { who, screen: '/classes', name: 'classes.CLASSES', sql: C.CLASSES },
  { who, screen: '/enrolment', name: 'classes.TRIALS', sql: C.TRIALS },
  { who, screen: '/enrolment', name: 'classes.ENQUIRIES', sql: C.ENQUIRIES },
  { who, screen: '/enrolment', name: 'classes.FUNNEL', sql: C.FUNNEL },
  { who, screen: '/schedule', name: 'dashboard.SESSIONS_BETWEEN (week)', sql: Dash.SESSIONS_BETWEEN, params: thisWeek },
  // Billing
  { who, screen: '/billing', name: 'billing.INVOICES', sql: B.INVOICES },
  { who, screen: '/billing', name: 'billing.OVERDUE_FAMILIES', sql: B.OVERDUE_FAMILIES },
  { who, screen: '/billing', name: 'billing.AGED_DEBT', sql: B.AGED_DEBT },
  // Messages, events, requests, account
  { who, screen: '/inbox', name: 'inbox.THREADS', sql: I.THREADS },
  { who, screen: '/inbox', name: 'inbox.BROADCASTS', sql: I.BROADCASTS },
  { who, screen: '/inbox', name: 'hub.PENDING_REQUESTS', sql: H.PENDING_REQUESTS },
  { who, screen: '/events', name: 'events.EVENTS', sql: E.EVENTS },
  { who, screen: '/requests', name: 'hub.PENDING_ENTRIES', sql: H.PENDING_ENTRIES },
  { who, screen: '/account', name: 'account.ACCOUNT', sql: A.ACCOUNT },
  { who, screen: '/reenrolment', name: 'seasons.ROUNDS', sql: Se.ROUNDS },
  // Reports, every tab
  { who, screen: '/reports', name: 'reports.HEADLINE', sql: R.HEADLINE },
  { who, screen: '/reports', name: 'reports.HEADLINE_AT (all)', sql: R.HEADLINE_AT, params: () => [null] },
  { who, screen: '/reports', name: 'reports.HEADLINE_AT (Greenwich)', sql: R.HEADLINE_AT, params: () => [LOC.greenwich] },
  { who, screen: '/reports', name: 'reports.WEEKLY_ATTENDANCE_AT', sql: R.WEEKLY_ATTENDANCE_AT, params: () => [null] },
  { who, screen: '/reports', name: 'reports.CLASS_STATS_AT', sql: R.CLASS_STATS_AT, params: () => [null] },
  { who, screen: '/reports', name: 'reports.MONTHS', sql: R.MONTHS },
  { who, screen: '/reports', name: 'reports.BY_LOCATION', sql: R.BY_LOCATION },
  { who, screen: '/reports', name: 'reports.UNPLACED_MONEY', sql: R.UNPLACED_MONEY },
  { who, screen: '/reports', name: 'reports.RETENTION_SUMMARY', sql: R.RETENTION_SUMMARY, params: () => [TERM] },
  { who, screen: '/reports', name: 'reports.RETENTION_BY', sql: R.RETENTION_BY, params: () => [TERM, 'class'] },
  { who, screen: '/reports', name: 'reports.LAPSED', sql: R.LAPSED, params: () => [TERM] },
  { who, screen: '/reports', name: 'reports.RETENTION_SUMMARY_AT', sql: R.RETENTION_SUMMARY_AT, params: () => [TERM, LOC.blackheath] },
];

const teacher = (who: Who, register: (c: Ctx) => string): Entry[] => [
  { who, screen: '/teach', name: 'teaching.MY_SESSIONS', sql: T.MY_SESSIONS, params: nextDays(28) },
  { who, screen: '/teach', name: 'teaching.MY_CLASHES', sql: T.MY_CLASHES, params: nextDays(14) },
  { who, screen: '/teach', name: 'agenda.MY_AGENDA', sql: Ag.MY_AGENDA, params: nextDays(14) },
  { who, screen: '/teach/register', name: 'teaching.REGISTER', sql: T.REGISTER, params: c => [register(c)] },
  { who, screen: '/teach/students', name: 'teaching.MY_STUDENTS', sql: T.MY_STUDENTS },
  { who, screen: '/teach/students', name: 'progress.SUPPORT_NEEDS', sql: G.SUPPORT_NEEDS },
  { who, screen: '/teach/students', name: 'progress.MY_PROGRESS_CLASSES', sql: G.MY_PROGRESS_CLASSES },
  { who, screen: '/teach/students', name: 'progress.CLASS_PROGRESS', sql: G.CLASS_PROGRESS, params: c => [c.tapClass] },
  { who, screen: '/teach/material', name: 'hub.MY_TEACHING_CLASSES', sql: H.MY_TEACHING_CLASSES },
  { who, screen: '/teach/messages', name: 'inbox.MY_THREADS', sql: I.MY_THREADS },
  { who, screen: '/schedule', name: 'dashboard.SESSIONS_BETWEEN (week)', sql: Dash.SESSIONS_BETWEEN, params: thisWeek },
];

export const SCREENS: Entry[] = [
  ...office('owner'),
  ...office('admin'),
  ...office('limited admin'),
  // The register as the school's administrator sees it (any session).
  { who: 'admin', screen: '/teach/register', name: 'teaching.REGISTER', sql: T.REGISTER, params: c => [c.registerMarcus] },
  ...teacher('teacher', c => c.registerMarcus),
  ...teacher('cover teacher', c => c.registerPriya),
  // Family home and the family's screens
  { who: 'guardian', screen: '/family', name: 'family.MY_SCHEDULE', sql: F.MY_SCHEDULE, params: nextDays(14) },
  { who: 'guardian', screen: '/family', name: 'family.MY_CHILDREN', sql: F.MY_CHILDREN },
  { who: 'guardian', screen: '/family', name: 'family.MY_MESSAGES', sql: F.MY_MESSAGES },
  { who: 'guardian', screen: '/family', name: 'inbox.BROADCASTS', sql: I.BROADCASTS },
  { who: 'guardian', screen: '/family', name: 'hub.STUDENT_FEEDBACK', sql: H.STUDENT_FEEDBACK },
  { who: 'guardian', screen: '/family', name: 'family.MY_BALANCE', sql: F.MY_BALANCE },
  { who: 'guardian', screen: '/family', name: 'family.MY_INVOICES', sql: F.MY_INVOICES },
  { who: 'guardian', screen: '/family', name: 'family.MY_COMING_UP', sql: F.MY_COMING_UP },
  { who: 'guardian', screen: '/family', name: 'family.MY_CLASHES', sql: F.MY_CLASHES, params: nextDays(14) },
  { who: 'guardian', screen: '/family/children', name: 'family.MY_CONTACTS', sql: F.MY_CONTACTS },
  { who: 'guardian', screen: '/family/children', name: 'family.MY_GUARDIANS', sql: F.MY_GUARDIANS },
  { who: 'guardian', screen: '/family/children', name: 'consent.CONSENTS', sql: Cn.CONSENTS, params: () => [STUDENT.amir] },
  { who: 'guardian', screen: '/family/payments', name: 'family.MY_PAYMENTS', sql: F.MY_PAYMENTS },
  { who: 'guardian', screen: '/family/payments', name: 'billing.MY_PAYMENT_INFO', sql: B.MY_PAYMENT_INFO },
  { who: 'guardian', screen: '/family/payments', name: 'billing.UPCOMING_COSTS', sql: B.UPCOMING_COSTS, params: () => [null] },
  { who: 'guardian', screen: '/family/messages', name: 'inbox.MY_CONVERSATION', sql: I.MY_CONVERSATION },
  { who: 'guardian', screen: '/family/enquiries', name: 'hub.MY_REQUESTS', sql: H.MY_REQUESTS },
  { who: 'guardian', screen: '/family/events', name: 'hub.EVENTS', sql: H.EVENTS },
  { who: 'guardian', screen: '/family/events', name: 'events.MY_COSTUMES', sql: E.MY_COSTUMES, params: c => [c.event] },
  { who: 'guardian', screen: '/family/feedback', name: 'progress.MY_REPORTS', sql: G.MY_REPORTS },
  // Student
  { who: 'student', screen: '/learn', name: 'hub.EVENTS', sql: H.EVENTS },
  { who: 'student', screen: '/learn', name: 'hub.MY_TIMETABLE', sql: H.MY_TIMETABLE, params: nextDays(14) },
  { who: 'student', screen: '/learn', name: 'hub.STUDENT_FEEDBACK', sql: H.STUDENT_FEEDBACK },
  { who: 'student', screen: '/learn', name: 'hub.RESOURCES', sql: H.RESOURCES },
  { who: 'student', screen: '/learn/feedback', name: 'progress.MY_RECENT_CLASSES', sql: G.MY_RECENT_CLASSES },
  { who: 'student', screen: '/learn/feedback', name: 'progress.SKILL_HISTORY', sql: G.SKILL_HISTORY, params: () => [STUDENT.amir] },
];

let ctx: Ctx;

beforeAll(async () => {
  await rebuild();
  // A fresh connection, so database-level settings from the migrations apply
  // exactly as they would to the app's connections.
  await closeDb();
  const c = await db();
  const past = async (teacherUser: string) => (await c.query(`
    select cs.id from class_session cs join class c on c.id = cs.class_id
      join staff_member sm on sm.id = coalesce(cs.teacher_id, c.teacher_id)
     where sm.user_id = $1 and cs.deleted_at is null and cs.starts_at < now() and cs.status = 'scheduled'
       and exists (select 1 from attendance_record a where a.session_id = cs.id)
     order by cs.starts_at desc limit 1`, [teacherUser])).rows[0].id as string;
  // Priya covers one of Marcus's registers today (cover access lasts the day):
  // his second most recent session with marks, moved to earlier today.
  const cover = (await c.query(`
    update class_session set teacher_id = (select id from staff_member where user_id = $1 and studio_id = $2),
           starts_at = now() - interval '2 minutes', ends_at = now() + interval '43 minutes'
     where id = (select cs.id from class_session cs join class c on c.id = cs.class_id
                   join staff_member sm on sm.id = c.teacher_id
                  where sm.user_id = $3 and cs.deleted_at is null and cs.starts_at < now() - interval '1 day'
                    and exists (select 1 from attendance_record a where a.session_id = cs.id)
                  order by cs.starts_at desc offset 1 limit 1)
    returning id`, [USERS.teacherModern, STUDIO_ID, USERS.teacherTap])).rows[0].id as string;
  ctx = {
    now: new Date(),
    registerMarcus: await past(USERS.teacherTap),
    registerPriya: cover,
    tapClass: (await c.query(`select c.id from class c join staff_member sm on sm.id = c.teacher_id
                               where sm.user_id = $1 order by c.name limit 1`, [USERS.teacherTap])).rows[0].id,
    event: (await c.query(`select id from studio_event where studio_id = $1 order by starts_at limit 1`, [STUDIO_ID])).rows[0].id,
  };
}, 120_000);
afterAll(async () => { await closeDb(); });

/** Runs one screen query as its person; returns the best of two timings and the rows. */
async function time(e: Entry): Promise<{ ms: number; rows: number }> {
  const params = e.params?.(ctx) ?? [];
  let best = Infinity, rows = 0;
  for (let i = 0; i < 2; i++) {
    await asReader(USER[e.who], async q => {
      const t = performance.now();
      try {
        rows = (await q(e.sql, params)).length;
      } catch (err) {
        // A screen a person may not use is refused by the database (a
        // location-limited administrator and aged debt, say): that is quick too.
        if (!/FORBIDDEN/.test((err as Error).message)) throw err;
        rows = -1;
      }
      best = Math.min(best, performance.now() - t);
    });
  }
  return { ms: best, rows };
}

describe(`every main screen query is within ${BUDGET_MS} ms`, () => {
  const results: { e: Entry; ms: number; rows: number }[] = [];

  for (const who of ['owner', 'admin', 'limited admin', 'teacher', 'cover teacher', 'guardian', 'student'] as Who[]) {
    it(`${who}`, async () => {
      const c = await db();
      // The limit is committed for the duration (reads run read-only), then removed.
      if (who === 'limited admin') {
        await c.query(`insert into membership_location (membership_id, location_id, studio_id)
                       select id, $2, studio_id from membership where user_id = $1 and studio_id = $3 and role = 'admin'
                       on conflict do nothing`, [USERS.admin, LOC.greenwich, STUDIO_ID]);
      }
      try {
        for (const e of SCREENS.filter(x => x.who === who)) {
          const r = await time(e);
          results.push({ e, ...r });
        }
      } finally {
        if (who === 'limited admin') {
          await c.query(`delete from membership_location where membership_id in
                           (select id from membership where user_id = $1 and studio_id = $2 and role = 'admin')`, [USERS.admin, STUDIO_ID]);
        }
      }
      const mine = results.filter(r => r.e.who === who);
      const over = mine.filter(r => r.ms > BUDGET_MS).map(r => `${r.e.screen} ${r.e.name}: ${r.ms.toFixed(0)} ms`);
      expect(over).toEqual([]);
      // The fixtures are real: people see what their screens are for.
      if (who === 'owner') expect(mine.find(r => r.e.name === 'people.STUDENTS')!.rows).toBeGreaterThan(40);
      if (who === 'teacher') expect(mine.find(r => r.e.name === 'teaching.MY_STUDENTS')!.rows).toBeGreaterThan(5);
      if (who === 'teacher' || who === 'cover teacher') expect(mine.find(r => r.e.name === 'teaching.REGISTER')!.rows).toBeGreaterThan(0);
      if (who === 'guardian') expect(mine.find(r => r.e.name === 'family.MY_CHILDREN')!.rows).toBeGreaterThan(0);
    }, 120_000);
  }

  it('prints the timings, slowest first', () => {
    const lines = [...results].sort((a, b) => b.ms - a.ms)
      .map(r => `${r.ms.toFixed(0).padStart(5)} ms  ${String(r.rows).padStart(4)} rows  ${r.e.who.padEnd(14)} ${r.e.screen.padEnd(17)} ${r.e.name}`);
    console.log(`Screen queries (budget ${BUDGET_MS} ms), slowest first:\n` + lines.slice(0, process.env.PERF_PRINT_ALL ? undefined : 25).join('\n'));
    expect(results.length).toBe(SCREENS.length);
  });
});
