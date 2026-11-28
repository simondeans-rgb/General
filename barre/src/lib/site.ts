/**
 * Settings for Swayvo's own public pages (/welcome, store listing).
 *
 * DECISION (owner): the real contact address. Until it is chosen the page
 * shows a labelled placeholder instead of a made-up address, so nobody emails
 * an inbox that does not exist. Set NEXT_PUBLIC_CONTACT_EMAIL at build time.
 */
export const CONTACT_EMAIL: string | null = validEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

export function validEmail(v: string | null | undefined): string | null {
  const s = v?.trim();
  // A placeholder domain (.example, .test, .invalid) is not a real address either.
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || /\.(example|test|invalid|localhost)$/i.test(s)) return null;
  return s;
}

/**
 * The plans as this demo sets them up (migration 0019, the platform's Plans
 * page). Shown on /welcome as demo pricing; tests/public-round4.test.ts fails
 * if the two drift apart. When real prices are decided, change both.
 */
export const DEMO_PLANS: { code: string; name: string; price_minor: number; max_students: number | null;
  max_locations: number | null; max_staff: number | null }[] = [
  { code: 'starter', name: 'Starter', price_minor: 4900,  max_students: 100,  max_locations: 1,    max_staff: 5 },
  { code: 'studio',  name: 'Studio',  price_minor: 9900,  max_students: 300,  max_locations: 3,    max_staff: 20 },
  { code: 'academy', name: 'Academy', price_minor: 17900, max_students: null, max_locations: null, max_staff: null },
];
