/**
 * A teacher's own week across schools (UR-47, migration 0055). Everything here
 * goes through app.* functions: no table outside the chosen school is read.
 */
import type { Stamp } from '@/lib/format';

export type AgendaRow = {
  session_id: string; studio_id: string; school_name: string;
  starts_at: Stamp; ends_at: Stamp;
  /** Null when the school shares busy times only. */
  class_name: string | null; location: string | null; room: string | null;
  status: 'scheduled' | 'moved' | 'cancelled' | 'covered';
  covering: boolean; has_handover: boolean;
  detail: 'full' | 'busy';
  clash: boolean; clash_with: string | null;
};

export const MY_AGENDA = `select * from app.my_agenda($1::timestamptz, $2::timestamptz)`;
export const MY_TRAVEL = `select app.my_agenda_travel() as minutes`;
export const SET_TRAVEL = `select app.set_agenda_travel($1::int)`;

/** Schools where this person is staff: the agenda tab shows only with two or more. */
export const MY_STAFF_SCHOOLS = `select studio_id, name, roles from app.my_schools()
  where roles && array['owner','admin','teacher']`;

/** The school's choice, read by its staff, changed by its owner. */
export const SHARING = `select id, staff_timetable_sharing as sharing from studio
  where id in (select app.studio_ids()) and app.in_scope(id) order by name limit 1`;
export const SET_SHARING = `select app.set_timetable_sharing($1, $2)`;
