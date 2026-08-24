/**
 * Demo data for Northstar Dance Academy.
 *
 * Two deliberate choices:
 *  - identifiers are deterministic, so tests can reference a known family and
 *    the browser demo reseeds to an identical state;
 *  - dates are generated relative to "today", so the studio is always
 *    mid-term. A demo seeded with fixed dates looks abandoned within a month.
 */

/** Deterministic, valid v4-shaped uuid: one stable namespace per entity type.
 *  The namespace occupies the first group and the ordinal the last, so a
 *  student id can never collide with a studio id — they did when both groups
 *  were derived from the same zero-padded number. */
export const uid = (ns: number, n: number) =>
  `${String(ns).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const NS = {
  studio: 1, user: 2, membership: 3, location: 4, room: 5, staff: 6,
  family: 7, guardian: 8, student: 9, medical: 10, emergency: 11, consent: 12,
  term: 13, break: 14, style: 15, level: 16, class: 17,
  enrolment: 18, trial: 19, waitlist: 20, enquiry: 21,
  invoice: 22, item: 23, payment: 24, comm: 25, notification: 26,
} as const;

export const STUDIO_ID = uid(NS.studio, 1);

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${String(v).replace(/'/g, "''")}'`;
};
const row = (vals: unknown[]) => `(${vals.map(q).join(',')})`;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x;
};

export type SeedOptions = { today?: Date };

export function buildSeedSql({ today = new Date() }: SeedOptions = {}): string {
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const termStart = addDays(base, -42);
  const termEnd = addDays(base, 56);
  const breakStart = addDays(base, 21);
  const out: string[] = [];
  const push = (s: string) => out.push(s);

  // ── Studio, locations, rooms ─────────────────────────────────────────────
  push(`insert into studio (id,name,slug,timezone,currency,brand_hue,contact_email,contact_phone,onboarding_step,onboarded_at) values
    ${row([STUDIO_ID, 'Northstar Dance Academy', 'northstar', 'Europe/London', 'GBP', 265,
           'hello@northstardance.co.uk', '020 8555 0142', 10, new Date().toISOString()])};`);

  const LOC = { greenwich: uid(NS.location, 1), blackheath: uid(NS.location, 2) };
  push(`insert into location (id,studio_id,name,address_line1,city,postcode) values
    ${row([LOC.greenwich, STUDIO_ID, 'Greenwich Studio', '14 Creek Road', 'London', 'SE8 3BU'])},
    ${row([LOC.blackheath, STUDIO_ID, 'Blackheath Studio', '3 Tranquil Vale', 'London', 'SE3 0AX'])};`);

  const ROOM = { g1: uid(NS.room, 1), g2: uid(NS.room, 2), b1: uid(NS.room, 3) };
  push(`insert into room (id,studio_id,location_id,name,capacity) values
    ${row([ROOM.g1, STUDIO_ID, LOC.greenwich, 'Studio One', 24])},
    ${row([ROOM.g2, STUDIO_ID, LOC.greenwich, 'Studio Two', 16])},
    ${row([ROOM.b1, STUDIO_ID, LOC.blackheath, 'Main Hall', 20])};`);

  // ── People behind the accounts ───────────────────────────────────────────
  const users: [string, string, string][] = [
    [uid(NS.user, 1), 'freya.lindqvist@northstardance.co.uk', 'Freya Lindqvist'],
    [uid(NS.user, 2), 'marcus.bell@northstardance.co.uk', 'Marcus Bell'],
    [uid(NS.user, 3), 'priya.raman@northstardance.co.uk', 'Priya Raman'],
    [uid(NS.user, 4), 'tomasz.wojcik@northstardance.co.uk', 'Tomasz Wójcik'],
    [uid(NS.user, 5), 'nadia.okafor@northstardance.co.uk', 'Nadia Okafor'],
  ];
  const guardianUsers: [string, string, string][] = [
    [uid(NS.user, 11), 'hannah.wright@example.com', 'Hannah Wright'],
    [uid(NS.user, 12), 'joseph.adeyemi@example.com', 'Joseph Adeyemi'],
    [uid(NS.user, 13), 'clare.doherty@example.com', 'Clare Doherty'],
  ];
  push(`insert into user_account (id,email,full_name) values
    ${[...users, ...guardianUsers].map(u => row(u)).join(',\n    ')};`);

  // Freya owns the studio; Nadia administers it; three teachers teach.
  push(`insert into membership (id,user_id,studio_id,role) values
    ${row([uid(NS.membership, 1), users[0]![0], STUDIO_ID, 'owner'])},
    ${row([uid(NS.membership, 2), users[4]![0], STUDIO_ID, 'admin'])},
    ${row([uid(NS.membership, 3), users[1]![0], STUDIO_ID, 'teacher'])},
    ${row([uid(NS.membership, 4), users[2]![0], STUDIO_ID, 'teacher'])},
    ${row([uid(NS.membership, 5), users[3]![0], STUDIO_ID, 'teacher'])},
    ${guardianUsers.map((g, i) =>
        row([uid(NS.membership, 10 + i), g[0], STUDIO_ID, 'guardian'])).join(',\n    ')};`);

  const STAFF = { freya: uid(NS.staff, 1), marcus: uid(NS.staff, 2),
                  priya: uid(NS.staff, 3), tomasz: uid(NS.staff, 4) };
  push(`insert into staff_member (id,studio_id,user_id,display_name,email,colour,status,bio) values
    ${row([STAFF.freya, STUDIO_ID, users[0]![0], 'Freya Lindqvist', users[0]![1], 'violet', 'active', 'Founder. RAD-trained, 18 years teaching ballet.'])},
    ${row([STAFF.marcus, STUDIO_ID, users[1]![0], 'Marcus Bell', users[1]![1], 'amber', 'active', 'Tap and musical theatre. West End credits.'])},
    ${row([STAFF.priya, STUDIO_ID, users[2]![0], 'Priya Raman', users[2]![1], 'teal', 'active', 'Contemporary and modern. MA Dance, Roehampton.'])},
    ${row([STAFF.tomasz, STUDIO_ID, users[3]![0], 'Tomasz Wójcik', users[3]![1], 'rose', 'active', 'Street and commercial. Choreographs the summer show.'])};`);

  // ── Curriculum ───────────────────────────────────────────────────────────
  const TERM = uid(NS.term, 1);
  push(`insert into term (id,studio_id,name,starts_on,ends_on,status) values
    ${row([TERM, STUDIO_ID, 'Current Term', iso(termStart), iso(termEnd), 'published'])};`);
  push(`insert into term_break (id,studio_id,term_id,name,starts_on,ends_on) values
    ${row([uid(NS.break, 1), STUDIO_ID, TERM, 'Half term', iso(breakStart), iso(addDays(breakStart, 6))])};`);

  const STYLE = { ballet: uid(NS.style, 1), tap: uid(NS.style, 2), modern: uid(NS.style, 3),
                  jazz: uid(NS.style, 4), contemporary: uid(NS.style, 5), street: uid(NS.style, 6) };
  push(`insert into dance_style (id,studio_id,name,colour,sort_order) values
    ${row([STYLE.ballet, STUDIO_ID, 'Ballet', 'violet', 1])},
    ${row([STYLE.tap, STUDIO_ID, 'Tap', 'amber', 2])},
    ${row([STYLE.modern, STUDIO_ID, 'Modern', 'teal', 3])},
    ${row([STYLE.jazz, STUDIO_ID, 'Jazz', 'rose', 4])},
    ${row([STYLE.contemporary, STUDIO_ID, 'Contemporary', 'indigo', 5])},
    ${row([STYLE.street, STUDIO_ID, 'Street', 'lime', 6])};`);

  const LEVEL = { preschool: uid(NS.level, 1), primary: uid(NS.level, 2), g1: uid(NS.level, 3),
                  g2: uid(NS.level, 4), g3: uid(NS.level, 5), inter: uid(NS.level, 6) };
  push(`insert into level (id,studio_id,name,sort_order) values
    ${row([LEVEL.preschool, STUDIO_ID, 'Pre-School', 1])},
    ${row([LEVEL.primary, STUDIO_ID, 'Primary', 2])},
    ${row([LEVEL.g1, STUDIO_ID, 'Grade 1', 3])},
    ${row([LEVEL.g2, STUDIO_ID, 'Grade 2', 4])},
    ${row([LEVEL.g3, STUDIO_ID, 'Grade 3', 5])},
    ${row([LEVEL.inter, STUDIO_ID, 'Intermediate', 6])};`);

  return out.join('\n') + '\n' + buildClassesAndPeople({
    termId: TERM, base, LOC, ROOM, STAFF, STYLE, LEVEL, guardianUsers,
  });
}

type Ctx = {
  termId: string; base: Date;
  LOC: Record<string, string>; ROOM: Record<string, string>;
  STAFF: Record<string, string>; STYLE: Record<string, string>; LEVEL: Record<string, string>;
  guardianUsers: [string, string, string][];
};

/** Class definition: name, style, level, location, room, teacher, dow,
 *  start, minutes, capacity, ageMin, ageMax, price, target occupancy. */
const CLASS_PLAN = [
  ['Pre-School Ballet',       'ballet',       'preschool', 'greenwich', 'g2', 'freya',  1, '16:00', 45, 12, 3,  5,  4200, 0.83],
  ['Primary Ballet',          'ballet',       'primary',   'greenwich', 'g1', 'freya',  1, '17:00', 60, 18, 5,  7,  5400, 0.78],
  ['Grade 2 Ballet',          'ballet',       'g2',        'greenwich', 'g1', 'freya',  2, '17:30', 60, 16, 7,  9,  5400, 0.81],
  ['Grade 3 Ballet',          'ballet',       'g3',        'greenwich', 'g1', 'freya',  3, '17:30', 75, 14, 9,  12, 6300, 1.00],
  ['Junior Tap',              'tap',          'primary',   'greenwich', 'g2', 'marcus', 2, '16:30', 45, 16, 5,  8,  4600, 0.69],
  ['Senior Tap',              'tap',          'inter',     'blackheath','b1', 'marcus', 4, '18:30', 60, 18, 11, 16, 5600, 0.61],
  ['Modern Juniors',          'modern',       'g1',        'blackheath','b1', 'priya',  2, '16:00', 45, 16, 6,  9,  4600, 0.75],
  ['Contemporary Seniors',    'contemporary', 'inter',     'greenwich', 'g1', 'priya',  4, '19:00', 75, 14, 13, 18, 6300, 0.50],
  ['Street Juniors',          'street',       'primary',   'blackheath','b1', 'tomasz', 3, '16:30', 45, 20, 6,  9,  4600, 0.80],
  ['Street Seniors',          'street',       'inter',     'blackheath','b1', 'tomasz', 5, '17:30', 60, 20, 11, 17, 5600, 0.95],
  ['Jazz Intermediate',       'jazz',         'g3',        'greenwich', 'g1', 'tomasz', 6, '10:30', 60, 16, 9,  13, 5400, 0.75],
  ['Saturday Ballet Grade 1', 'ballet',       'g1',        'greenwich', 'g2', 'freya',  6, '09:15', 60, 14, 6,  8,  5400, 0.86],
] as const;

function buildClassesAndPeople(ctx: Ctx): string {
  const { termId, base, LOC, ROOM, STAFF, STYLE, LEVEL, guardianUsers } = ctx;
  const out: string[] = [];
  const push = (s: string) => out.push(s);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

  let s = 42;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;

  const classIds: string[] = [];
  const classRows = CLASS_PLAN.map((c, i) => {
    const id = uid(NS.class, i + 1); classIds.push(id);
    return row([id, STUDIO_ID, termId, STYLE[c[1]], LEVEL[c[2]], LOC[c[3]], ROOM[c[4]],
                STAFF[c[5]], c[0], c[6], c[7], c[8], c[9], c[10], c[11], c[12],
                'term', 0, true, true, 'public']);
  });
  push(`insert into class (id,studio_id,term_id,dance_style_id,level_id,location_id,room_id,teacher_id,name,day_of_week,start_time,duration_min,capacity,age_min,age_max,price_minor,pricing,trial_price_minor,trials_enabled,waitlist_enabled,visibility) values
    ${classRows.join(',\n    ')};`);
  classIds.forEach(id => push(`select app.generate_class_sessions('${id}');`));

  // ── Families and children ────────────────────────────────────────────────
  // Ages are dealt from a fixed histogram rather than drawn at random, so
  // every class has a plausible pool to fill from and the senior classes are
  // not accidentally empty.
  // Interleaved rather than sorted, so any prefix of the list still covers
  // every class's age band. A sorted pool starves the senior classes.
  const AGE_POOL = [
    5,9,7,11,6,10,8,12,4,9,7,11,5,10,6,12,8,9,3,10,
    7,11,13,9,5,12,6,10,14,11,4,9,8,12,7,10,15,11,6,9,
    5,13,16,12,8,10,7,11,17,9,4,12,6,10,14,13,5,9,7,11,
    3,8,15,12,6,10,16,9,7,11,5,12,9,10,8,13];
  const surnames = ['Wright','Adeyemi','Doherty','Kaminski','Osei','Bennett','Hussain','Ferreira',
                    'Novak','Whitfield','Mbeki','Grant','Sullivan','Ellery','Nakamura','Byrne',
                    'Ackah','Salvatore','Petrov','Lindgren','Haddad','Moreau','Quinn','Ibrahim',
                    'Fenwick','Oyelaran','Mackenzie','Rossi','Dlamini','Torres'];
  const girls = ['Ava','Isla','Maya','Freya','Nia','Sofia','Amara','Elsie','Lily','Zara','Rosa','Iris',
                 'Willow','Esme','Bea','Anaya','Clara','Nell','Sena','Ottilie'];
  const boys  = ['Noah','Kai','Elias','Theo','Jonah','Amir','Luca','Reuben','Idris','Milo','Arlo','Rafe'];
  const parents = ['Hannah','Joseph','Clare','Marta','Abena','Rachel','Sana','Inês','Petra','Emma',
                   'Thandi','Alex','Grace','Duncan','Yuki','Aoife','Kwabena','Giulia','Nikolai',
                   'Elin','Rana','Camille','Sinead','Fatima','Robert','Bunmi','Iona','Chiara','Zanele','Paula'];

  const famRows: string[] = [], guardRows: string[] = [], studRows: string[] = [];
  const students: { id: string; famIdx: number; age: number; name: string }[] = [];
  let studentN = 0, ageCursor = 0, guardN = 0;

  surnames.forEach((surname, f) => {
    const famId = uid(NS.family, f + 1);
    famRows.push(row([famId, STUDIO_ID, `${surname} family`,
      `${4 + f * 3} ${pick(['Ashburnham Grove','Egerton Drive','Royal Hill','Tranquil Vale','Blackheath Road','Creek Road','Deptford High Street','Lewisham Way'])}`,
      'London', pick(['SE8 4AA','SE10 8QY','SE3 0BU','SE13 7LN','SE8 3BU'])]));

    const linkedUser = f < 3 ? guardianUsers[f]![0] : null;
    guardN += 1;
    guardRows.push(row([uid(NS.guardian, guardN), STUDIO_ID, famId, linkedUser,
      `${parents[f]} ${surname}`,
      linkedUser ? guardianUsers[f]![1] : `${parents[f]!.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'')}.${surname.toLowerCase()}@example.com`,
      `07${700 + f}${String(100000 + f * 7919).slice(0, 6)}`,
      pick(['Mother','Father','Guardian']), true, true]));
    if (f % 2 === 0) {
      guardN += 1;
      guardRows.push(row([uid(NS.guardian, guardN), STUDIO_ID, famId, null,
        `${parents[(f + 7) % parents.length]} ${surname}`, `second.${surname.toLowerCase()}@example.com`,
        `07${800 + f}${String(200000 + f * 5417).slice(0, 6)}`, 'Parent', false, false]));
    }

    const childCount = f % 6 === 0 ? 3 : f % 2 === 0 ? 2 : 1;
    for (let c = 0; c < childCount; c++) {
      studentN += 1;
      const id = uid(NS.student, studentN);
      const age = AGE_POOL[ageCursor++ % AGE_POOL.length]!;
      const useGirl = rnd() > 0.26;
      const first = useGirl
        ? girls[(studentN * 7 + c) % girls.length]!
        : boys[(studentN * 5 + c) % boys.length]!;
      students.push({ id, famIdx: f, age, name: `${first} ${surname}` });
      studRows.push(row([id, STUDIO_ID, famId, first, surname, null,
        iso(addDays(base, -(age * 365 + Math.floor(rnd() * 320)))), null,
        iso(addDays(base, -Math.floor(rnd() * 900) - 30))]));
    }
  });

  push(`insert into family (id,studio_id,name,address_line1,city,postcode) values\n    ${famRows.join(',\n    ')};`);
  push(`insert into guardian (id,studio_id,family_id,user_id,full_name,email,phone,relationship,is_primary,receives_billing) values\n    ${guardRows.join(',\n    ')};`);
  push(`insert into student (id,studio_id,family_id,first_name,last_name,preferred_name,date_of_birth,pronouns,joined_on) values\n    ${studRows.join(',\n    ')};`);

  return out.join('\n') + '\n' + buildEnrolmentsAndActivity({ ...ctx, classIds, students, rnd, pick });
}

type ActivityCtx = Ctx & {
  classIds: string[];
  students: { id: string; famIdx: number; age: number; name: string }[];
  rnd: () => number;
  pick: <T>(a: readonly T[]) => T;
};

function buildEnrolmentsAndActivity(ctx: ActivityCtx): string {
  const { base, classIds, students, rnd, STAFF } = ctx;
  const out: string[] = [];
  const push = (s: string) => out.push(s);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

  // Fill class by class to a target occupancy, rather than letting students
  // pick at random. Random picking leaves a twelve-class timetable looking
  // three-quarters empty, which is not what a working studio looks like.
  const enrolRows: string[] = [];
  const waitRows: string[] = [];
  let n = 0, w = 0;
  const placed = new Map<string, Set<string>>();   // classId -> studentIds

  CLASS_PLAN.forEach((plan, i) => {
    const classId = classIds[i]!;
    const capacity = plan[9] as number;
    const ageMin = plan[10] as number, ageMax = plan[11] as number;
    const target = Math.round(capacity * (plan[13] as number));

    const eligible = students
      .filter(st => st.age >= ageMin && st.age <= ageMax)
      .sort((a, b) => (a.id + classId < b.id + classId ? -1 : 1));   // stable, class-specific order

    const taken = new Set<string>();
    for (const st of eligible) {
      if (taken.size >= target) break;
      taken.add(st.id);
      n += 1;
      enrolRows.push(row([uid(NS.enrolment, n), STUDIO_ID, classId, st.id, 'active',
                          iso(addDays(base, -Math.floor(rnd() * 45) - 5))]));
    }
    placed.set(classId, taken);

    // Grade 3 Ballet is the class under pressure: full, with a real queue.
    if (i === 3) {
      eligible.filter(st => !taken.has(st.id)).slice(0, 8).forEach((st, k) => {
        w += 1;
        waitRows.push(row([uid(NS.waitlist, w), STUDIO_ID, classId, st.id, 'waiting', k + 1]));
      });
    }
  });

  push(`insert into enrolment (id,studio_id,class_id,student_id,status,started_on) values\n    ${enrolRows.join(',\n    ')};`);
  push(`insert into waitlist_entry (id,studio_id,class_id,student_id,status,position) values\n    ${waitRows.join(',\n    ')};`);

  // A few students who left mid-term, so retention reporting has something real.
  students.slice(-4).forEach((st, i) => {
    push(`update enrolment set status = 'left', ended_on = ${q(iso(addDays(base, -(i * 5 + 6))))}
            where student_id = ${q(st.id)} and status = 'active';`);
  });

  // ── Attendance for every session already past ────────────────────────────
  push(`
insert into attendance_record (studio_id, session_id, student_id, status, marked_by, marked_at)
select e.studio_id, cs.id, e.student_id,
       case
         when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 8))::bit(32)::int % 100) < 6  then 'absent'::attendance_status
         when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 8))::bit(32)::int % 100) < 11 then 'late'::attendance_status
         when (('x' || substr(md5(cs.id::text || e.student_id::text), 1, 8))::bit(32)::int % 100) < 14 then 'excused'::attendance_status
         else 'present'::attendance_status end,
       null, cs.starts_at + interval '10 minutes'
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.status = 'active' and e.deleted_at is null
 where cs.starts_at < now() and cs.status = 'scheduled'
on conflict do nothing;`);

  // Eleven children who have quietly stopped attending — the exact signal the
  // owner dashboard is supposed to surface before a family drifts away.
  push(`
with lapsing as (
  select distinct e.student_id from enrolment e
   where e.status = 'active' and e.deleted_at is null
   order by e.student_id limit 11)
update attendance_record ar set status = 'absent'
  from class_session cs
 where cs.id = ar.session_id
   and cs.starts_at > now() - interval '24 days'
   and ar.student_id in (select student_id from lapsing);`);

  // ── Enquiry funnel ───────────────────────────────────────────────────────
  const prospects = [
    ['Rebecca Miles',   'rebecca.miles@example.com',   'Orla Miles',      6,  1],
    ['Daniel Osei',     'daniel.osei@example.com',     'Kofi Osei',       8,  8],
    ['Yasmin Patel',    'yasmin.patel@example.com',    'Anya Patel',      10, 3],
    ['Grace Sullivan',  'grace.sullivan@example.com',  'Erin Sullivan',   7,  4],
    ['Michael Chen',    'michael.chen@example.com',    'Lucy Chen',       11, 10],
    ['Aisha Rahman',    'aisha.rahman@example.com',    'Zainab Rahman',   5,  0],
    ['Tom Bradshaw',    'tom.bradshaw@example.com',    'Sam Bradshaw',    9,  3],
    ['Lena Fischer',    'lena.fischer@example.com',    'Mika Fischer',    12, 10],
    ['Owen Pritchard',  'owen.pritchard@example.com',  'Bryn Pritchard',  6,  8],
    ['Nadia Haddad',    'nadia.haddad@example.com',    'Layla Haddad',    9,  6],
    ['Sam Okonkwo',     'sam.okonkwo@example.com',     'Ada Okonkwo',     14, 9],
    ['Ruth Kelleher',   'ruth.kelleher@example.com',   'Fionn Kelleher',  7,  4],
    ['Priti Shah',      'priti.shah@example.com',      'Diya Shah',       10, 3],
    ['James Attwood',   'james.attwood@example.com',   'Ivy Attwood',     5,  0],
    ['Marie Lefevre',   'marie.lefevre@example.com',   'Colette Lefevre', 8,  6],
    ['Bola Adenuga',    'bola.adenuga@example.com',    'Tayo Adenuga',    11, 9],
    ['Heather Ross',    'heather.ross@example.com',    'Skye Ross',       6,  1],
    ['Vikram Nair',     'vikram.nair@example.com',     'Meera Nair',      13, 7],
  ] as const;
  // 18 enquiries → 14 trials booked → 11 attended → 7 converted.
  // 18 enquiries -> 14 booked a trial -> 11 attended -> 7 enrolled.
  const stages = ['enrolled','enrolled','enrolled','enrolled','enrolled','enrolled','enrolled',
                  'trial_attended','trial_attended','trial_attended','trial_attended',
                  'trial_booked','trial_booked',
                  'trial_missed',
                  'follow_up','enquiry','enquiry','enquiry'] as const;
  const tStatus = ['converted','converted','converted','converted','converted','converted','converted',
                   'attended','attended','attended','attended',
                   'booked','booked',
                   'missed',
                   null, null, null, null] as const;

  const enquiryRows: string[] = [], trialRows: string[] = [];
  prospects.forEach((p, i) => {
    const eqId = uid(NS.enquiry, i + 1);
    const cid = classIds[p[4]]!;
    enquiryRows.push(row([eqId, STUDIO_ID, stages[i], p[0], p[1],
      `079${String(10000000 + i * 131071).slice(0, 8)}`, p[2], iso(addDays(base, -p[3] * 365)),
      cid, ['Website','Instagram','Word of mouth','Walk-in'][i % 4], iso(addDays(base, (i % 9) + 1))]));
    if (tStatus[i]) {
      trialRows.push(row([uid(NS.trial, i + 1), STUDIO_ID, cid, null, null, eqId, tStatus[i], 0,
        (tStatus[i] === 'attended' || tStatus[i] === 'converted')
          ? addDays(base, -((i % 9) + 2)).toISOString() : null]));
    }
  });
  push(`insert into enquiry (id,studio_id,stage,contact_name,contact_email,contact_phone,child_name,child_dob,interest_class_id,source,next_action_on) values\n    ${enquiryRows.join(',\n    ')};`);
  push(`insert into trial (id,studio_id,class_id,session_id,student_id,enquiry_id,status,price_minor,attended_at) values\n    ${trialRows.join(',\n    ')};`);
  push(`
update trial t set session_id = (
  select cs.id from class_session cs
   where cs.class_id = t.class_id and cs.starts_at > now() and cs.status = 'scheduled'
   order by cs.starts_at limit 1)
 where t.session_id is null and t.status = 'booked';`);

  // ── Timetable texture: one cancellation, one covered class ───────────────
  push(`
update class_session set status = 'cancelled',
       cancel_reason = 'Teacher unwell — this week only'
 where id = (select id from class_session
              where starts_at between now() + interval '1 day' and now() + interval '6 days'
              order by starts_at limit 1);`);
  push(`
update class_session set teacher_id = '${STAFF.priya}'
 where id = (select cs.id from class_session cs join class c on c.id = cs.class_id
              where c.teacher_id = '${STAFF.marcus}' and cs.starts_at > now()
              order by cs.starts_at limit 1);`);

  return out.join('\n') + '\n' + buildMedicalBillingComms(ctx);
}

function buildMedicalBillingComms(ctx: ActivityCtx): string {
  const { base, students, classIds } = ctx;
  const out: string[] = [];
  const push = (s: string) => out.push(s);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

  // ── Medical, emergency contacts, consent ────────────────────────────────
  // Only a handful of children have anything recorded. That is realistic, and
  // it is what makes an alert mean something when a teacher does see one.
  const med = [
    [2,  'Peanuts, tree nuts', 'Asthma', 'Blue inhaler', 'EpiPen is in the red pouch in her bag. Use it, then call 999 and the studio phone.', true],
    [11, null, 'Type 1 diabetes', 'Insulin pump', 'Check the pump before class. Juice carton in her bag if she seems shaky or pale.', true],
    [19, 'Plasters (latex)', null, null, 'Non-latex plasters only.', false],
    [27, null, 'Mild eczema', 'Emollient cream', 'Apply cream if skin flares after class.', false],
    [34, 'Dairy', null, null, 'No milk-based snacks at the studio.', false],
  ] as const;
  const medRows = med
    .filter(([i]) => students[i as number])
    .map(([i, allergies, conditions, medications, plan, alert], k) =>
      row([uid(NS.medical, k + 1), STUDIO_ID, students[i as number]!.id,
           allergies, conditions, medications, plan, alert]));
  push(`insert into medical_record (id,studio_id,student_id,allergies,conditions,medications,action_plan,requires_alert) values\n    ${medRows.join(',\n    ')};`);

  const ecRows = students.slice(0, 40).map((st, i) =>
    row([uid(NS.emergency, i + 1), STUDIO_ID, st.id,
         ['Grandma Pat','Uncle Dave','Aunt Sarah','Neighbour Ruth','Grandad Bill'][i % 5],
         ['Grandmother','Uncle','Aunt','Family friend','Grandfather'][i % 5],
         `07${900 + (i % 90)}${String(300000 + i * 3571).slice(0, 6)}`, 1]));
  push(`insert into emergency_contact (id,studio_id,student_id,full_name,relationship,phone,priority) values\n    ${ecRows.join(',\n    ')};`);

  // Photo consent deliberately mixed — the studio must know who not to photograph.
  const consentRows = students.map((st, i) =>
    row([uid(NS.consent, i + 1), STUDIO_ID, st.id, 'photography', i % 6 !== 0]));
  push(`insert into consent_record (id,studio_id,student_id,kind,granted) values\n    ${consentRows.join(',\n    ')};`);

  // ── Invoices ─────────────────────────────────────────────────────────────
  // Billing is deferred this iteration, but the ledger is seeded so the money
  // figures on the dashboard are real sums over real rows, not decoration.
  const invRows: string[] = [], itemRows: string[] = [], payRows: string[] = [];
  const famCount = 30;
  for (let f = 0; f < famCount; f++) {
    const famId = uid(NS.family, f + 1);
    const invId = uid(NS.invoice, f + 1);
    const amount = 5400 + (f % 5) * 1800;
    const state = f < 22 ? 'paid' : f < 27 ? 'issued' : 'part_paid';
    const paid = state === 'paid' ? amount : state === 'part_paid' ? Math.round(amount / 2) : 0;
    invRows.push(row([invId, STUDIO_ID, famId, `INV-${String(1041 + f)}`, state,
      iso(addDays(base, -21)), iso(addDays(base, -7)), amount, 0, amount, paid]));
    itemRows.push(row([uid(NS.item, f + 1), STUDIO_ID, invId, 'tuition', 'Termly tuition', 1, amount, 0]));
    if (paid > 0) {
      payRows.push(row([uid(NS.payment, f + 1), STUDIO_ID, famId, invId, paid, 'card',
        'stripe', null, null, addDays(base, -20).toISOString()]));
    }
    // Three families whose card was declined — the "needs attention" case.
    if (f >= 27) {
      payRows.push(row([uid(NS.payment, 100 + f), STUDIO_ID, famId, invId, amount - paid, 'card',
        'stripe', null, 'card_declined', null]));
    }
  }
  push(`insert into invoice (id,studio_id,family_id,number,status,issued_on,due_on,subtotal_minor,discount_minor,total_minor,paid_minor) values\n    ${invRows.join(',\n    ')};`);
  push(`insert into invoice_item (id,studio_id,invoice_id,kind,description,quantity,unit_minor,discount_minor) values\n    ${itemRows.join(',\n    ')};`);
  push(`insert into payment (id,studio_id,family_id,invoice_id,amount_minor,method,provider,provider_ref,failure_code,succeeded_at) values\n    ${payRows.join(',\n    ')};`);
  push(`update family f set balance_minor = coalesce((
          select sum(i.total_minor - i.paid_minor) from invoice i
           where i.family_id = f.id and i.status in ('issued','part_paid')), 0);`);

  // ── Communications ──────────────────────────────────────────────────────
  push(`insert into communication (id,studio_id,kind,channel,family_id,class_id,subject,body,sent_at) values
    ${row([uid(NS.comm, 1), STUDIO_ID, 'studio_announcement', 'in_app', null, null,
      'Summer show — save the date',
      'Our summer show is on Saturday 11 July at the Greenwich Theatre. Tickets go on sale to families two weeks before general release. Costume measurements will be taken in class over the next fortnight.',
      addDays(base, -3).toISOString()])},
    ${row([uid(NS.comm, 2), STUDIO_ID, 'class_broadcast', 'in_app', null, classIds[3],
      'Grade 3 Ballet — exam preparation',
      'We are into the exam preparation weeks now. Please make sure hair is in a secure bun, and check that ballet shoes still fit — several have got tight since the start of term.',
      addDays(base, -2).toISOString()])},
    ${row([uid(NS.comm, 3), STUDIO_ID, 'direct', 'in_app', uid(NS.family, 1), null,
      'Absence on Monday',
      "Just to let you know Ava will miss Monday's class — she is on a school trip. Back the following week.",
      addDays(base, -1).toISOString()])},
    ${row([uid(NS.comm, 4), STUDIO_ID, 'direct', 'in_app', uid(NS.family, 3), null,
      'Re: moving up a grade',
      'Thank you for the chat after class. I agree she is ready for the next grade in January — I will hold a place.',
      addDays(base, -5).toISOString()])},
    ${row([uid(NS.comm, 5), STUDIO_ID, 'class_broadcast', 'in_app', null, classIds[9],
      'Street Seniors — new routine',
      'We start the new routine this week. Bring trainers with a clean sole, and a water bottle. It is a fast one.',
      addDays(base, -4).toISOString()])};`);

  push(`insert into communication_template (id,studio_id,name,subject,body) values
    ${row([uid(NS.comm, 20), STUDIO_ID, 'Trial confirmation', 'Your trial class is booked',
      'Hello {{guardian_name}},\n\nWe have booked {{child_name}} into {{class_name}} on {{session_date}} at {{session_time}}.\n\nPlease arrive five minutes early. Comfortable clothes and bare feet or socks are perfectly fine for a first class.\n\nSee you then,\nNorthstar Dance Academy'])},
    ${row([uid(NS.comm, 21), STUDIO_ID, 'Trial follow-up', 'How did {{child_name}} get on?',
      'Hello {{guardian_name}},\n\nWe loved having {{child_name}} in {{class_name}}. If they would like to carry on, we can hold their place for a week.\n\nJust reply here and we will sort it out.\n\nNorthstar Dance Academy'])},
    ${row([uid(NS.comm, 22), STUDIO_ID, 'Payment reminder', 'Invoice {{invoice_number}} is due',
      'Hello {{guardian_name}},\n\nInvoice {{invoice_number}} for {{amount}} was due on {{due_date}}. You can pay from the Payments tab.\n\nIf something has gone wrong with the payment, tell us and we will help.\n\nNorthstar Dance Academy'])},
    ${row([uid(NS.comm, 23), STUDIO_ID, 'Waiting list offer', 'A place has come up in {{class_name}}',
      'Hello {{guardian_name}},\n\nA place has become available in {{class_name}}. We can hold it for {{child_name}} until {{expires_at}}.\n\nLet us know either way and we will pass it on if it is not right for you.\n\nNorthstar Dance Academy'])};`);

  push(`insert into notification (id,studio_id,user_id,kind,title,body,href) values
    ${row([uid(NS.notification, 1), STUDIO_ID, uid(NS.user, 1), 'payment_failed',
      '3 card payments failed', 'Three families were invoiced but the card was declined.', '/billing'])},
    ${row([uid(NS.notification, 2), STUDIO_ID, uid(NS.user, 1), 'waitlist',
      'Grade 3 Ballet is full', '8 students are waiting for a place.', '/classes'])},
    ${row([uid(NS.notification, 3), STUDIO_ID, uid(NS.user, 1), 'medical_updated',
      'Medical details updated', 'A guardian updated an allergy record this week.', '/people'])};`);

  return out.join('\n');
}
