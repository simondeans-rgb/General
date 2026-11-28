import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, commitAs, commitService, expectRejected, rebuild,
         USERS, STUDIO_ID, uid, NS } from './helpers';
import * as H from '../src/lib/repos/hub';
import { createHostedMedia, objectKeyFor, MEDIA_URL_TTL_SECONDS, MEDIA_URL_TTL_MAX } from '../src/lib/storage-hosted';

/* Seeded people: Amir (Wright family, Hannah), Idris (Adeyemi, Joseph) and
   Kai (Doherty, Clare) are all in Senior Tap; Nia Wright is in Grade 3 Ballet,
   which no Adeyemi child attends. */
const AMIR = uid(NS.student, 1), NIA_W = uid(NS.student, 3), IDRIS = uid(NS.student, 4);
const AMIR_LOGIN = uid(NS.user, 40), IDRIS_LOGIN = uid(NS.user, 41);
const SENIOR_TAP = uid(NS.class, 6), GRADE3 = uid(NS.class, 4), JUNIOR_TAP = uid(NS.class, 5);
const R = {
  grade3Barre: uid(NS.resource, 1), tapDrills: uid(NS.resource, 4),
  uniform: uid(NS.resource, 9), termPlan: uid(NS.resource, 15),
};

let VIDEO = '';      // Senior Tap routine, shows Amir
let PHOTO = '';      // Senior Tap photo, shows Amir
let NIA_VIDEO = '';  // Grade 3 Ballet, shows Nia
let WIDE = '';       // studio-wide, shows Amir
let UNNAMED = '';    // Senior Tap, shows children, nobody named

async function media(kind: string, title: string, scope: 'class' | 'studio', classId: string | null,
                     children: string[], mime = 'video/mp4') {
  const [r] = await commitService(
    `insert into resource (studio_id, kind, title, storage_path, created_by, shows_children)
     values ($1, $2::resource_kind, $3, 'local:pending', $4, true) returning id`,
    [STUDIO_ID, kind, title, USERS.teacherTap]);
  await commitService(`insert into resource_assignment (studio_id, resource_id, scope, class_id) values ($1, $2, $3::resource_scope, $4)`,
    [STUDIO_ID, r.id, scope, classId]);
  await commitService(
    `insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, object_key)
     values ($1, $2, 'clip', $3, 2, '\\x0102'::bytea, $4)`, [STUDIO_ID, r.id, mime, `${STUDIO_ID}/${r.id}/clip`]);
  for (const s of children) {
    await commitService(`insert into resource_child (studio_id, resource_id, student_id) values ($1, $2, $3)`, [STUDIO_ID, r.id, s]);
  }
  return r.id as string;
}

const sees = async (user: string, id: string) =>
  asUser(user, async q => (await q(`select id from resource where id = $1`, [id])).length === 1);
const seesFile = async (user: string, id: string) =>
  asUser(user, async q => (await q(`select id from resource_file where resource_id = $1`, [id])).length === 1);
const consent = (student: string, kind: string, granted: boolean) =>
  commitAs(USERS.guardianA, `select app.set_consent($1, $2, $3)`, [student, kind, granted]);

beforeAll(async () => {
  await rebuild();
  VIDEO = await media('video', 'Senior Tap routine', 'class', SENIOR_TAP, [AMIR]);
  PHOTO = await media('document', 'Senior Tap photo', 'class', SENIOR_TAP, [AMIR], 'image/jpeg');
  NIA_VIDEO = await media('video', 'Grade 3 centre work', 'class', GRADE3, [NIA_W]);
  WIDE = await media('video', 'Whole-school show', 'studio', null, [AMIR]);
  UNNAMED = await media('video', 'Senior Tap from the back', 'class', SENIOR_TAP, []);
}, 60_000);
afterAll(async () => { await closeDb(); });

/* ==========================================================================
   1. Teachers read the material for their own classes
   ========================================================================== */
describe('teachers read library material for the classes they teach or cover', () => {
  it('a teacher sees their own class material and the all-staff pages, not another teacher’s class', async () => {
    expect(await sees(USERS.teacherTap, R.tapDrills)).toBe(true);
    expect(await sees(USERS.teacherTap, R.uniform)).toBe(true);        // studio-wide, for all staff
    expect(await sees(USERS.teacherTap, R.grade3Barre)).toBe(false);   // Freya's Grade 3 class
    expect(await sees(USERS.teacherStreet, R.tapDrills)).toBe(false);
    expect(await sees(USERS.owner, R.tapDrills)).toBe(true);
    expect(await sees(USERS.admin, R.grade3Barre)).toBe(true);
  });

  it('files and assignments follow the same rule', async () => {
    expect(await seesFile(USERS.teacherTap, R.termPlan)).toBe(true);
    expect(await seesFile(USERS.teacherStreet, R.termPlan)).toBe(false);
    await asUser(USERS.teacherStreet, async q => {
      expect(await q(`select id from resource_assignment where resource_id = $1`, [R.termPlan])).toHaveLength(0);
    });
    await asUser(USERS.teacherTap, async q => {
      expect((await q(`select id from resource_assignment where resource_id = $1`, [R.termPlan])).length).toBeGreaterThan(0);
    });
  });

  it('a teacher covering a class in the next fortnight reads its material', async () => {
    await asUser(USERS.teacherStreet, async (q, svc) => {
      expect(await q(`select id from resource where id = $1`, [R.termPlan])).toHaveLength(0);
      const [tomasz] = await svc(`select id from staff_member where user_id = $1`, [USERS.teacherStreet]);
      await svc(`update class_session set teacher_id = $1
                  where id = (select id from class_session where class_id = $2 and starts_at > now() + interval '1 day'
                                and starts_at < now() + interval '10 days' and status <> 'cancelled' order by starts_at limit 1)`,
                [tomasz.id, JUNIOR_TAP]);
      expect(await q(`select id from resource where id = $1`, [R.termPlan])).toHaveLength(1);
    });
  });

  it('a teacher can read and pin what they just added, but cannot share it with all staff', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [r] = await q(H.CREATE_RESOURCE, [SENIOR_TAP, 'video', 'New drill', null, null, 'https://example.com/v', null, true, true, false, false]);
      expect(r.id).toBeTruthy();
      expect(await q(H.ASSIGN_RESOURCE_TO_CLASS, [SENIOR_TAP, r.id])).toHaveLength(1);
      expect(await expectRejected(() => q(`update resource set for_all_staff = true where id = $1`, [r.id])))
        .toMatch(/only the office shares material with all staff/);
    });
  });

  it('the office marks material for all staff, and every teacher then reads it', async () => {
    await asUser(USERS.admin, async q => {
      expect(await q(`update resource set for_all_staff = true where id = $1 returning id`, [R.grade3Barre])).toHaveLength(1);
    });
    expect(await sees(USERS.teacherTap, R.grade3Barre)).toBe(false);
    await commitAs(USERS.admin, `update resource set for_all_staff = true where id = $1`, [R.grade3Barre]);
    expect(await sees(USERS.teacherTap, R.grade3Barre)).toBe(true);
    expect(await sees(USERS.teacherStreet, R.grade3Barre)).toBe(true);
    await commitService(`update resource set for_all_staff = false where id = $1`, [R.grade3Barre]);
  });
});

/* ==========================================================================
   2. Media that shows children follows their consent
   ========================================================================== */
describe('media showing named children reaches families only with consent', () => {
  it('without video consent the family, the child and classmates’ families cannot read it; staff can, with a reason', async () => {
    for (const u of [USERS.guardianA, AMIR_LOGIN, USERS.guardianB, IDRIS_LOGIN]) {
      expect(await sees(u, VIDEO)).toBe(false);
      expect(await seesFile(u, VIDEO)).toBe(false);
    }
    expect(await sees(USERS.teacherTap, VIDEO)).toBe(true);
    await asUser(USERS.teacherTap, async q => {
      const [s] = await q(`select * from app.resource_child_status($1)`, [VIDEO]);
      expect(s).toMatchObject({ named: 1, without_consent: 1, family_visible: false, consent_kind: 'video', needs_names: false });
      const row = (await q(H.CLASS_RESOURCES, [SENIOR_TAP])).find((x: any) => x.id === VIDEO);
      expect(row).toMatchObject({ shows_children: true, without_consent: 1, family_visible: false });
    });
    // A family learns nothing from the status function.
    await asUser(USERS.guardianA, async q => {
      expect(await q(`select * from app.resource_child_status($1)`, [VIDEO])).toHaveLength(0);
    });
  });

  it('granting consent shows it at once to the family, the child and the class; withdrawing hides it at once', async () => {
    await consent(AMIR, 'video', true);
    for (const u of [USERS.guardianA, AMIR_LOGIN, USERS.guardianB, IDRIS_LOGIN]) {
      expect(await sees(u, VIDEO)).toBe(true);
      expect(await seesFile(u, VIDEO)).toBe(true);
    }
    await asUser(USERS.guardianA, async q => {
      expect((await q(H.RESOURCES)).map((r: any) => r.id)).toContain(VIDEO);
    });

    await consent(AMIR, 'video', false);
    for (const u of [USERS.guardianA, AMIR_LOGIN, USERS.guardianB, IDRIS_LOGIN]) {
      expect(await sees(u, VIDEO)).toBe(false);
      expect(await seesFile(u, VIDEO)).toBe(false);
    }
    await consent(AMIR, 'video', true);
    expect(await sees(AMIR_LOGIN, VIDEO)).toBe(true);
  });

  it('a photo needs photography consent; video consent is not enough', async () => {
    await consent(AMIR, 'video', true);
    await consent(AMIR, 'photography', false);
    expect(await sees(USERS.guardianA, PHOTO)).toBe(false);
    await consent(AMIR, 'photography', true);
    expect(await sees(USERS.guardianA, PHOTO)).toBe(true);
  });

  it('another family never sees a child’s video from a class theirs is not in, even with consent', async () => {
    await consent(NIA_W, 'video', true);
    expect(await sees(USERS.guardianA, NIA_VIDEO)).toBe(true);
    expect(await sees(USERS.guardianB, NIA_VIDEO)).toBe(false);
    expect(await sees(IDRIS_LOGIN, NIA_VIDEO)).toBe(false);
  });

  it('media showing children is never studio-wide for families, even with consent', async () => {
    await consent(AMIR, 'video', true);
    expect(await sees(USERS.guardianA, WIDE)).toBe(false);
    expect(await sees(USERS.guardianB, WIDE)).toBe(false);
    expect(await sees(USERS.owner, WIDE)).toBe(true);
  });

  it('shows children with nobody named stays with staff until the office confirms none can be identified', async () => {
    expect(await sees(USERS.guardianA, UNNAMED)).toBe(false);
    await asUser(USERS.teacherTap, async q => {
      const [s] = await q(`select * from app.resource_child_status($1)`, [UNNAMED]);
      expect(s.needs_names).toBe(true);
      expect(await expectRejected(() => q(`update resource set no_identifiable_children = true where id = $1`, [UNNAMED])))
        .toMatch(/only the office can confirm/);
    });
    await asUser(USERS.admin, async (q, svc) => {
      const [ok] = await q(H.UPDATE_RESOURCE_MEDIA, [UNNAMED, true, true, false]);
      expect(ok.id).toBe(UNNAMED);
      const [r] = await svc(`select children_checked_by from resource where id = $1`, [UNNAMED]);
      expect(r.children_checked_by).toBe(USERS.admin);
    });
    await commitService(`update resource set no_identifiable_children = true where id = $1`, [UNNAMED]);
    expect(await sees(USERS.guardianA, UNNAMED)).toBe(true);
    expect(await sees(AMIR_LOGIN, UNNAMED)).toBe(true);
  });

  it('a teacher names only children they teach, on their own material, and cannot take back "shows children"', async () => {
    await asUser(USERS.teacherTap, async q => {
      const [r] = await q(H.CREATE_RESOURCE, [SENIOR_TAP, 'video', 'Pairs', null, null, null, null, true, true, true, false]);
      await q(H.ASSIGN_RESOURCE_TO_CLASS, [SENIOR_TAP, r.id]);
      await q(H.ADD_RESOURCE_CHILDREN, [r.id, [IDRIS]]);
      expect(await q(`select student_id from resource_child where resource_id = $1`, [r.id])).toEqual([{ student_id: IDRIS }]);
      // Nia Wright is not one of Marcus's pupils.
      expect(await expectRejected(() => q(H.ADD_RESOURCE_CHILDREN, [r.id, [NIA_W]]))).toMatch(/row-level security/i);
      expect(await expectRejected(() => q(H.UPDATE_RESOURCE_MEDIA, [r.id, false, false, false])))
        .toMatch(/only the office can say this no longer shows children/);
      // Consent shown next to each name in the picker.
      const kids = await q(H.CLASS_CHILDREN_CONSENT, [SENIOR_TAP, r.id]);
      const idris = kids.find((k: any) => k.id === IDRIS);
      expect(idris).toMatchObject({ named: true, in_class: true, video: null });
      expect(kids.find((k: any) => k.id === AMIR)).toMatchObject({ named: false, video: true });
    });
  });

  it('a teacher cannot name children on someone else’s material', async () => {
    await asUser(USERS.teacherTap, async q => {
      expect(await expectRejected(() => q(H.ADD_RESOURCE_CHILDREN, [R.uniform, [AMIR]]))).toMatch(/row-level security/i);
    });
  });

  it('families cannot read who is named', async () => {
    await asUser(USERS.guardianA, async q => {
      expect(await q(`select * from resource_child`)).toHaveLength(0);
    });
  });

  it('the private bucket check follows the same rules', async () => {
    await consent(AMIR, 'video', false);
    const key = `${STUDIO_ID}/${VIDEO}/clip`;
    await asUser(USERS.guardianA, async q => {
      expect((await q(`select app.can_read_media($1) as ok`, [key]))[0].ok).toBe(false);
    });
    await asUser(USERS.teacherTap, async q => {
      expect((await q(`select app.can_read_media($1) as ok`, [key]))[0].ok).toBe(true);
    });
    await asUser(USERS.teacherModern, async q => {
      expect((await q(`select app.can_read_media($1) as ok`, [key]))[0].ok).toBe(false);
    });
    await consent(AMIR, 'video', true);
    await asUser(USERS.guardianA, async q => {
      expect((await q(`select app.can_read_media($1) as ok`, [key]))[0].ok).toBe(true);
    });
  });
});

/* ==========================================================================
   3. Hosted storage signs short-lived URLs and never a public one
   ========================================================================== */
describe('hosted storage hands out short-lived signed URLs only', () => {
  const calls: { url: string; body?: string }[] = [];
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, body: typeof init?.body === 'string' ? init.body : undefined });
    return new Response(JSON.stringify({ signedURL: '/object/sign/media/s/r/x.mp4?token=abc' }), { status: 200 });
  }) as unknown as typeof fetch;
  const make = (canRead: boolean, ttlSeconds?: number) => createHostedMedia({
    url: 'https://project.example.co', anonKey: 'anon', bucket: 'media',
    accessToken: async () => 'token', canRead: async () => canRead, ttlSeconds, fetch: fakeFetch,
  });

  it('signs for a minute by default, and never longer than five', async () => {
    calls.length = 0;
    const url = await make(true).sign('s/r/x.mp4');
    expect(url).toBe('https://project.example.co/storage/v1/object/sign/media/s/r/x.mp4?token=abc');
    expect(calls[0]!.url).toContain('/storage/v1/object/sign/media/');
    expect(JSON.parse(calls[0]!.body!).expiresIn).toBe(MEDIA_URL_TTL_SECONDS);
    expect(make(true, 86_400).ttl).toBe(MEDIA_URL_TTL_MAX);
    expect(MEDIA_URL_TTL_SECONDS).toBeLessThanOrEqual(60);
  });

  it('does not sign when the database says no, and refuses a public URL', async () => {
    calls.length = 0;
    expect(await make(false).sign('s/r/x.mp4')).toBeNull();
    expect(calls).toHaveLength(0);
    const publicFetch = (async () => new Response(JSON.stringify({ signedURL: '/object/public/media/s/r/x.mp4' }))) as unknown as typeof fetch;
    const m = createHostedMedia({ url: 'https://p.example.co', anonKey: 'a', bucket: 'media',
      accessToken: async () => 't', canRead: async () => true, fetch: publicFetch });
    expect(await m.sign('s/r/x.mp4')).toBeNull();
  });

  it('keys objects under the school, so the bucket policy can check the uploader', () => {
    expect(objectKeyFor('studio', 'res', 'Show night.MP4', 'abc')).toBe('studio/res/abc.mp4');
  });
});
