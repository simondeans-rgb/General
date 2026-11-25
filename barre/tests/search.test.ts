import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { asUser, closeDb, rebuild, USERS } from './helpers';
import { SEARCH } from '../src/lib/repos/search';

beforeAll(async () => { await rebuild(); }, 60_000);
afterAll(async () => { await closeDb(); });

describe('global search (R-044)', () => {
  it('finds a family, its children and its invoices by surname', async () => {
    await asUser(USERS.owner, async q => {
      const hits = await q(SEARCH, ['wright']);
      const kinds = new Set(hits.map((h: any) => h.kind));
      expect(kinds).toEqual(new Set(['family', 'student', 'invoice']));
      expect(hits.filter((h: any) => h.kind === 'student').length).toBeGreaterThanOrEqual(3);
    });
  });
  it('finds a family by a parent’s phone number, however it is typed', async () => {
    await asUser(USERS.owner, async (q, svc) => {
      const [g] = await svc(`select phone, family_id from guardian where phone is not null limit 1`);
      const digits = g.phone.replace(/\D/g, '');
      const typed = digits.slice(-6).replace(/(\d{3})(\d{3})/, '$1 $2');
      const hits = await q(SEARCH, [typed]);
      expect(hits.some((h: any) => h.kind === 'family' && h.id === g.family_id)).toBe(true);
    });
  });
  it('shows a parent only their own family', async () => {
    await asUser(USERS.guardianB, async q => {
      expect(await q(SEARCH, ['wright'])).toHaveLength(0);
    });
  });
});
