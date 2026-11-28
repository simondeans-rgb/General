import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS, STUDIO_ID } from './helpers';

beforeAll(rebuild);
afterAll(closeDb);

/** A child made to look as if they left `months` ago (no place, no waiting list, no trial). */
async function leaver(svc: any, months: number) {
  const [s] = await svc(`select s.id from student s join family f on f.id = s.family_id
                          where s.studio_id = $1 and not s.is_adult and s.deleted_at is null and not f.is_prospect
                          order by s.date_of_birth desc limit 1`, [STUDIO_ID]);
  await svc(`update enrolment set status = 'left', ended_on = current_date - make_interval(months => $2::int) where student_id = $1`, [s.id, months]);
  await svc(`update waitlist_entry set status = 'withdrawn' where student_id = $1 and status in ('waiting','offered')`, [s.id]).catch(() => null);
  await svc(`update trial set status = 'cancelled' where student_id = $1 and status in ('booked','requested')`, [s.id]).catch(() => null);
  return s.id as string;
}
async function video(svc: any, children: string[], key = 'media/test.mp4') {
  const [r] = await svc(`insert into resource (studio_id, kind, title, shows_children) values ($1, 'video', 'Show rehearsal', true) returning id`, [STUDIO_ID]);
  await svc(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, object_key)
             values ($1, $2, 'show.mp4', 'video/mp4', 1000, $3)`, [STUDIO_ID, r.id, key]);
  for (const c of children) await svc(`insert into resource_child (studio_id, resource_id, student_id) values ($1, $2, $3)`, [STUDIO_ID, r.id, c]);
  return r.id as string;
}
const preview = (q: any) => q(`select * from app.apply_retention($1, false)`, [STUDIO_ID]);

describe('videos and photos of children are kept only as long as needed (0059)', () => {
  it('is due once the last child shown left more than the period ago, and deleting queues the stored file', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 30);
      const id = await video(svc, [kid]);
      const due = (await preview(q)).filter((r: any) => r.step === 'media' && r.entity_id === id);
      expect(due).toHaveLength(1);
      await q(`select count(*) from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from resource where id = $1`, [id])).toHaveLength(0);
      expect(await svc(`select 1 from resource_child where resource_id = $1`, [id])).toHaveLength(0);
      expect(await svc(`select object_key from media_deletion where object_key = 'media/test.mp4' and done_at is null`)).toHaveLength(1);
      expect(await svc(`select 1 from audit_log where entity = 'resource' and entity_id = $1 and action = 'retention'`, [id])).toHaveLength(1);
    });
  });

  it('is kept while any child shown is still at the school, or left recently', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const gone = await leaver(svc, 30);
      const [still] = await svc(`select e.student_id as id from enrolment e where e.status = 'active' and e.deleted_at is null and e.student_id <> $1 limit 1`, [gone]);
      const both = await video(svc, [gone, still.id], 'media/both.mp4');
      const recent = await video(svc, [await leaver(svc, 2)], 'media/recent.mp4');
      const steps = (await preview(q)).filter((r: any) => r.step === 'media').map((r: any) => r.entity_id);
      expect(steps).not.toContain(both);
      expect(steps).not.toContain(recent);
    });
  });

  it('a safeguarding hold on any child shown keeps it', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const kid = await leaver(svc, 30);
      await svc(`insert into safeguarding_hold (student_id, studio_id, reason) values ($1, $2, 'Police enquiry')`, [kid, STUDIO_ID]);
      const id = await video(svc, [kid], 'media/held.mp4');
      const rows = (await preview(q)).filter((r: any) => r.entity_id === id);
      expect(rows.map((r: any) => r.step)).toEqual(['held']);
      await q(`select count(*) from app.apply_retention($1, true)`, [STUDIO_ID]);
      expect(await svc(`select 1 from resource where id = $1`, [id])).toHaveLength(1);
    });
  });

  it('material marked as showing children but naming nobody goes the same period after it was added', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const id = await video(svc, [], 'media/unnamed.mp4');
      expect((await preview(q)).some((r: any) => r.entity_id === id)).toBe(false);
      await svc(`update resource set created_at = now() - interval '13 months' where id = $1`, [id]);
      expect((await preview(q)).some((r: any) => r.step === 'media' && r.entity_id === id)).toBe(true);
    });
  });

  it('only the owner can see or run it', async () => {
    await asUser(USERS.admin, async (q) => {
      await expect(preview(q)).rejects.toThrow(/FORBIDDEN/);
    });
  });
});
