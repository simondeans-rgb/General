import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const row = (o: Record<string, string>) => ({ parent_name: 'Ruth Okafor', parent_email: 'ruth@example.com', parent_phone: '07700 900400',
  child_first_name: 'Ada', child_last_name: 'Okafor', child_dob: '14/03/2018', ...o });

describe('importing families (R-013)', () => {
  it('a dry run reports every problem by row and writes nothing', async () => {
    await asUser(USERS.owner, async q => {
      const rows = [row({}), row({ child_first_name: '', child_dob: '31/02/2018' }), row({ parent_email: 'nope', classes: 'Underwater Ballet' })];
      const [{ r }] = await q(`select app.import_families($1::jsonb, false) r`, [JSON.stringify(rows)]);
      expect(r.ok).toBe(false);
      const byRow = (n: number) => r.errors.filter((e: any) => e.row === n).map((e: any) => e.message).join(' | ');
      expect(byRow(1)).toBe('');
      expect(byRow(2)).toMatch(/No child first name.*Cannot read the date/);
      expect(byRow(3)).toMatch(/not valid.*Underwater Ballet/);
      expect(await q(`select 1 from guardian where email = 'ruth@example.com'`)).toHaveLength(0);
      expect(await expectRejected(() => q(`select app.import_families($1::jsonb, true)`, [JSON.stringify(rows)]))).toMatch(/need fixing/);
    });
  });

  it('groups siblings into one family, enrols, records medical notes, and is safe to run twice', async () => {
    await asUser(USERS.owner, async q => {
      const rows = [
        row({ classes: 'Junior Tap', allergies: 'Peanuts', photo_consent: 'No', second_parent_name: 'Tunde Okafor' }),
        row({ child_first_name: 'Femi', child_dob: '2016-07-01', classes: 'Junior Tap; Street Seniors' }),
        row({ parent_name: 'Leo Grant', parent_email: '', parent_phone: '07700 900401', child_first_name: 'Max', child_dob: '1.9.15' }),
      ];
      const [{ r }] = await q(`select app.import_families($1::jsonb, true) r`, [JSON.stringify(rows)]);
      expect(r).toMatchObject({ ok: true, families: 2, children: 3, medical: 1, skipped: 0 });
      const [fam] = await q(`select f.id, (select count(*)::int from guardian g where g.family_id = f.id) parents,
                                     (select count(*)::int from student s where s.family_id = f.id) kids
                               from family f join guardian g on g.family_id = f.id where g.email = 'ruth@example.com'`);
      expect(fam).toMatchObject({ parents: 2, kids: 2 });
      const [ada] = await q(`select s.id, m.requires_alert, (select granted from consent_record c where c.student_id = s.id) photo
                               from student s left join medical_record m on m.student_id = s.id where s.first_name = 'Ada'`);
      expect(ada).toMatchObject({ requires_alert: true, photo: false });
      expect((await q(`select date_of_birth::text d from student where first_name = 'Max'`))[0].d).toBe('2015-09-01');
      const [{ r: again }] = await q(`select app.import_families($1::jsonb, true) r`, [JSON.stringify(rows)]);
      expect(again).toMatchObject({ families: 0, children: 0, skipped: 3 });
      expect((await q(`select summary from audit_log where action = 'import' order by id desc limit 1`))[0].summary).toMatch(/Imported/);
    });
  });

  it('a child for a full class goes on its waiting list, with a warning first', async () => {
    await asUser(USERS.owner, async q => {
      const rows = [row({ classes: 'Grade 3 Ballet' })];
      const [{ r }] = await q(`select app.import_families($1::jsonb, false) r`, [JSON.stringify(rows)]);
      expect(r.warnings[0].message).toMatch(/waiting list/);
      await q(`select app.import_families($1::jsonb, true)`, [JSON.stringify(rows)]);
      expect(await q(`select 1 from waitlist_entry w join student s on s.id = w.student_id where s.first_name = 'Ada' and w.note like 'Imported%'`)).toHaveLength(1);
    });
  });

  it('teachers and parents cannot import', async () => {
    for (const who of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async q => {
        expect(await expectRejected(() => q(`select app.import_families($1::jsonb, false)`, [JSON.stringify([row({})])]))).toMatch(/FORBIDDEN/);
      });
    }
  });
});
