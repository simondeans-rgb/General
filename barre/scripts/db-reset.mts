import { connect, resetSchema, seed } from './db.mjs';

const client = await connect();
console.time('reset');
await resetSchema(client);
console.timeEnd('reset');
console.time('seed');
await seed(client);
console.timeEnd('seed');

const counts = await client.query(`
  select 'studios' k, count(*) v from studio
  union all select 'families', count(*) from family
  union all select 'students', count(*) from student
  union all select 'staff', count(*) from staff_member
  union all select 'classes', count(*) from class
  union all select 'sessions', count(*) from class_session
  union all select 'enrolments', count(*) from enrolment
  union all select 'attendance', count(*) from attendance_record
  union all select 'trials', count(*) from trial
  union all select 'waitlist', count(*) from waitlist_entry
  union all select 'invoices', count(*) from invoice
  union all select 'messages', count(*) from communication
  order by 1`);
console.table(counts.rows);
await client.end();
