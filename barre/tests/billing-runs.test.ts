import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, expectRejected, rebuild, USERS, STUDIO_ID, FAMILY } from './helpers';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

const term = async (svc: any) => (await svc(`select id from term where studio_id = $1 limit 1`, [STUDIO_ID]))[0].id;

describe('term billing runs (R-010)', () => {
  it('previews one line per child per paid class, and writes nothing', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await term(svc);
      const before = (await svc(`select count(*)::int n from invoice`))[0].n;
      const lines = await q(`select * from app.billing_lines($1)`, [t]);
      expect(lines.length).toBeGreaterThan(50);
      for (const l of lines) { expect(l.unit_minor).toBeGreaterThan(0); expect(l.discount_minor).toBe(0); }
      expect((await svc(`select count(*)::int n from invoice`))[0].n).toBe(before);
    });
  });

  it('raises drafts, issues them, and a second run only bills new joiners', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await term(svc);
      const families = new Set((await q(`select family_id from app.billing_lines($1)`, [t])).map((r: any) => r.family_id));
      const [{ run }] = await q(`select app.create_billing_run($1, current_date + 21) run`, [t]);
      const invs = await q(`select status, total_minor, due_on from invoice where billing_run_id = $1`, [run]);
      expect(invs).toHaveLength(families.size);
      expect(invs.every((i: any) => i.status === 'draft')).toBe(true);
      expect(await expectRejected(() => q(`select app.create_billing_run($1)`, [t]))).toMatch(/already a draft run/);
      const [{ n }] = await q(`select app.issue_billing_run($1) n`, [run]);
      expect(n).toBe(families.size);
      expect((await q(`select count(*)::int c from invoice where billing_run_id = $1 and status = 'draft'`, [run]))[0].c).toBe(0);
      // Everyone is billed: nothing more to raise.
      expect(await q(`select * from app.billing_lines($1)`, [t])).toHaveLength(0);
      expect(await expectRejected(() => q(`select app.create_billing_run($1)`, [t]))).toMatch(/already been invoiced/);
      // A child joins a class mid-term: only they are billed next time, pro rata.
      const [e] = await svc(`select e.id, e.class_id, e.student_id from enrolment e join class c on c.id = e.class_id
                              where e.status = 'active' and c.pricing = 'term' limit 1`);
      await svc(`update enrolment set status = 'left' where id = $1`, [e.id]);
      await svc(`update invoice_item set deleted_at = now() where student_id = $1 and class_id = $2`, [e.student_id, e.class_id]);
      await svc(`update enrolment set status = 'active', started_on = current_date + 7 where id = $1`, [e.id]);
      const again = await q(`select * from app.billing_lines($1)`, [t]);
      expect(again).toHaveLength(1);
      expect(again[0].description).toMatch(/of \d+ classes from/);
    });
  });

  it('a discarded run leaves nothing behind', async () => {
    await asUser(USERS.admin, async (q, svc) => {
      const t = await term(svc);
      const [{ run }] = await q(`select app.create_billing_run($1) run`, [t]);
      await q(`select app.discard_billing_run($1)`, [run]);
      expect(await q(`select 1 from invoice where billing_run_id = $1`, [run])).toHaveLength(0);
      expect((await q(`select * from app.billing_lines($1)`, [t])).length).toBeGreaterThan(0);
    });
  });

  it('teachers and parents cannot preview or run billing', async () => {
    for (const who of [USERS.teacherTap, USERS.guardianA]) {
      await asUser(who, async (q, svc) => {
        const t = await term(svc);
        expect(await expectRejected(() => q(`select * from app.billing_lines($1)`, [t]))).toMatch(/FORBIDDEN|permission/);
        expect(await expectRejected(() => q(`select app.create_billing_run($1)`, [t]))).toMatch(/FORBIDDEN|permission/);
      });
    }
  });
});

describe('discount rules (R-011)', () => {
  it('start switched off; switched on, siblings and extra classes are discounted, the larger one wins', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const t = await term(svc);
      const rules = await q(`select kind, enabled from discount_rule order by kind`);
      expect(rules).toEqual([{ kind: 'multi_class', enabled: false }, { kind: 'sibling', enabled: false }]);
      await q(`update discount_rule set enabled = true, percent = 10, from_nth = 2 where kind = 'sibling'`);
      await q(`update discount_rule set enabled = true, percent = 20, from_nth = 3 where kind = 'multi_class'`);
      const lines = await q(`select * from app.billing_lines($1) where family_id = $2`, [t, FAMILY.a]);
      const kids = [...new Set(lines.map((l: any) => l.student_id))];
      expect(kids.length).toBeGreaterThan(1);                   // the Wrights have several children
      const sib = lines.filter((l: any) => /sibling/.test(l.discount_reason ?? ''));
      expect(sib.length).toBeGreaterThan(0);
      for (const l of sib) expect(l.discount_minor).toBe(Math.round(l.unit_minor * Number(l.quantity) * 0.10));
      const mc = lines.filter((l: any) => /multi-class/.test(l.discount_reason ?? ''));
      for (const l of mc) expect(l.discount_minor).toBe(Math.round(l.unit_minor * Number(l.quantity) * 0.20));
      // The child paying the most is the first child: none of their lines carry a sibling discount.
      const totals = new Map<string, number>();
      for (const l of lines) totals.set(l.student_id, (totals.get(l.student_id) ?? 0) + l.unit_minor * Number(l.quantity));
      const first = [...totals.entries()].sort((a, b) => b[1] - a[1])[0]![0];
      expect(lines.filter((l: any) => l.student_id === first && /sibling/.test(l.discount_reason ?? ''))).toHaveLength(0);
    });
  });

  it('only the office edits rules, and only their numbers', async () => {
    await asUser(USERS.owner, async q => {
      await expectRejected(() => q(`update discount_rule set kind = 'sibling' where kind = 'multi_class'`));
      await expectRejected(() => q(`update discount_rule set percent = 0`));
    });
    await asUser(USERS.teacherTap, async q => {
      expect(await q(`update discount_rule set percent = 50 returning id`)).toHaveLength(0);
    });
  });
});

describe('exports (R-012)', () => {
  it('every export runs for the office, carries no medical data, and is empty for teachers and parents', async () => {
    const R = await import('../src/lib/repos/reports');
    const B = await import('../src/lib/repos/billing');
    const all = [...Object.values(R.EXPORTS).map(e => e.sql), B.INVOICES_EXPORT, B.PAYMENTS_EXPORT];
    await asUser(USERS.owner, async q => {
      for (const sql of all) {
        const rows = await q(sql);
        expect(rows.length).toBeGreaterThan(0);
        expect(Object.keys(rows[0]).join(',')).not.toMatch(/medical|allerg|condition|medication/);
      }
    });
    await asUser(USERS.teacherTap, async q => {
      for (const sql of [B.INVOICES_EXPORT, B.PAYMENTS_EXPORT, R.EXPORTS.contacts.sql]) expect(await q(sql)).toHaveLength(0);
    });
  });
});
