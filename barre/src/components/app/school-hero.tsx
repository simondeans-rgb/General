'use client';

import { useRows } from '@/lib/query';
import { SchoolHero } from './brand';

/** The selected school's hero photo, if it has one. */
export function MySchoolHero() {
  const s = useRows<{ name: string; hero_url: string | null }>(['school-hero'],
    `select name, hero_url from studio where app.in_scope(id) order by created_at limit 1`, [], { staleTime: 60_000 }).data?.[0];
  return s ? <SchoolHero src={s.hero_url} name={s.name} /> : null;
}
