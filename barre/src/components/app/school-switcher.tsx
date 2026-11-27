'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { readAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import { SchoolMark } from '@/components/app/brand';

type School = { studio_id: string; name: string; logo_url: string | null; brand_colour: string | null; roles: Role[] };
const ORDER: Role[] = ['owner', 'admin', 'teacher', 'guardian', 'student'];
const HOME: Partial<Record<Role, string>> = { owner: '/today', admin: '/today', teacher: '/teach', guardian: '/family', student: '/learn' };
const best = (s: School, prefer?: Role) => (prefer && s.roles.includes(prefer) ? prefer : ORDER.find(r => s.roles.includes(r))) as Role;

/**
 * For people in more than one school (R-031). One school is always chosen, so
 * no screen ever mixes two schools' data; switching reloads every query.
 */
export function SchoolSwitcher({ className }: { className?: string }) {
  const { session, chooseSchool } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const schools = useQuery({
    queryKey: ['my-schools', session?.userId],
    enabled: !!session && !session.platform,
    queryFn: () => readAs<School>(session ? { ...session, studio: undefined } : null, `select * from app.my_schools()`),
  });
  const list = schools.data ?? [];
  const current = list.find(s => s.studio_id === session?.studio);

  // Several schools and none chosen yet: choose the first that fits the role.
  React.useEffect(() => {
    if (list.length > 1 && !current) {
      const first = list.find(s => s.roles.includes(session!.role)) ?? list[0]!;
      chooseSchool(first.studio_id, best(first, session!.role));
      qc.invalidateQueries();
    }
  }, [list, current, session, chooseSchool, qc]);

  if (list.length < 2 || !current) return null;
  return (
    <label className={`flex items-center gap-2 px-3 py-2 text-[0.8125rem] ${className ?? ''}`}>
      <SchoolMark name={current.name} logo={current.logo_url} className="size-6" />
      <span className="sr-only">School</span>
      <select value={current.studio_id} aria-label="Switch school"
        onChange={e => {
          const s = list.find(x => x.studio_id === e.target.value)!;
          const role = best(s, session!.role);
          chooseSchool(s.studio_id, role);
          qc.invalidateQueries();
          router.push(HOME[role] ?? '/');
        }}
        className="h-9 min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-line-strong bg-surface px-2 text-[0.875rem] font-medium focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12">
        {list.map(s => <option key={s.studio_id} value={s.studio_id}>{s.name}</option>)}
      </select>
    </label>
  );
}
