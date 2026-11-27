'use client';

import * as React from 'react';
import { useRows } from '@/lib/query';
import { Select } from '@/components/ui';

// Someone limited to some locations (UR-33) chooses among theirs only.
const LOCATIONS = `select id, name from location where deleted_at is null
  and (studio_id not in (select studio_id from app.my_location_scope())
       or id in (select location_id from app.my_location_scope())) order by name`;
const KEY = 'swayvo.location.v1';

/**
 * Which site a list shows (UR-33). Only schools with more than one location
 * see a choice; with one there is nothing to choose and nothing changes.
 * Remembered per browser, so the office need not pick it on every screen.
 */
export function useLocationFilter() {
  const locations = useRows<{ id: string; name: string }>(['locations-filter'], LOCATIONS);
  const [name, setName] = React.useState('');
  React.useEffect(() => { try { setName(localStorage.getItem(KEY) ?? ''); } catch { /* storage unavailable */ } }, []);
  const list = locations.data ?? [];
  const multi = list.length > 1;
  const current = multi && list.some(l => l.name === name) ? name : '';
  const choose = (v: string) => { setName(v); try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* ignore */ } };
  const keep = React.useCallback((loc: string | null | undefined) => !current || loc === current, [current]);
  const control = multi ? (
    <label className="inline-flex items-center gap-2 text-[0.875rem]">
      <span className="font-semibold">Location</span>
      <Select aria-label="Location" value={current} onChange={e => choose(e.target.value)} className="w-auto">
        <option value="">All locations</option>
        {list.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
      </Select>
    </label>
  ) : null;
  return { current, keep, control };
}
