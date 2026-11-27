/* A family's own data (UR-38). Every query runs as the guardian, so row level
   security limits it to their family; nothing here filters by family itself.
   Office notes and teachers' private notes are left out of the download, and
   the page says so: the office can provide a complete copy on request. */
export const FAMILY_EXPORT: [string, string][] = [
  ['family', `select id, name, address_line1, address_line2, city, postcode, balance_minor, created_at from family where deleted_at is null`],
  ['guardians', `select id, family_id, full_name, email, phone, relationship, is_primary, receives_billing, marketing_consent from guardian`],
  ['children', `select id, family_id, first_name, last_name, preferred_name, date_of_birth, pronouns, school, joined_on, left_on, login_enabled from student`],
  ['medical', `select id, student_id, allergies, conditions, medications, action_plan, requires_alert, doctor_name, doctor_phone, updated_at from medical_record`],
  ['emergency_contacts', `select id, student_id, full_name, relationship, phone, priority from emergency_contact`],
  ['consents', `select id, student_id, kind, granted, granted_at, expires_at, source, note from consent_record order by granted_at`],
  ['enrolments', `select e.id, e.student_id, c.name as class, e.status, e.started_on, e.ended_on, e.price_minor from enrolment e left join class c on c.id = e.class_id`],
  ['trials', `select id, student_id, class_id, status, attended_at, created_at from trial`],
  ['waiting_list', `select id, student_id, class_id, status, position, created_at from waitlist_entry`],
  ['attendance', `select a.id, a.student_id, cs.starts_at, a.status, a.reason from attendance_record a join class_session cs on cs.id = a.session_id order by cs.starts_at`],
  ['invoices', `select id, family_id, number, status, issued_on, due_on, total_minor, paid_minor, note from invoice`],
  ['invoice_lines', `select i.id, i.invoice_id, i.student_id, i.description, i.quantity, i.unit_minor, i.total_minor from invoice_item i`],
  ['payments', `select id, family_id, invoice_id, amount_minor, method, succeeded_at, refunded_minor, created_at from payment`],
  ['messages', `select id, family_id, kind, subject, body, sent_at, inbound from communication where family_id is not null order by sent_at`],
  ['requests', `select id, family_id, student_id, kind, status, subject, body, answer, created_at from studio_request`],
  ['feedback', `select id, student_id, headline, going_well, work_on, shared_at from feedback_note`],
];

export const ASK_TO_DELETE = `select app.request_family_erasure($1) as id`;

/** Who sees what about a child. Written from the database rules (RLS and the
 *  safety-brief view, migrations 0006, 0019, 0020, 0030, 0047); change it when
 *  they change. */
export const WHO_SEES: { who: string; sees: string; not: string }[] = [
  { who: 'You, and any other parent or carer on your family account',
    sees: 'Everything on these pages: your children, their classes, attendance, medical details, consents, invoices, payments, messages and requests.',
    not: 'Other families’ details.' },
  { who: 'Your child’s teachers',
    sees: 'Only for children in classes they teach or cover, or take to an event: the child’s student record (name, date of birth, school, pronouns and any notes on it), attendance in their classes, allergies, conditions, medication, the emergency plan, emergency contacts, and photo, video and social media consent. Feedback they write.',
    not: 'Your address, the family doctor, invoices, payments, or your messages to the office.' },
  { who: 'The office (the owner and administrators)',
    sees: 'Everything the school holds about your family, including the full medical record and family doctor, the history of consent changes, invoices and payments.',
    not: 'Safeguarding concerns, unless they are the safeguarding lead or the owner.' },
  { who: 'The safeguarding lead and the owner',
    sees: 'Any safeguarding concern a member of staff records about a child. Every time one is opened, it is logged.',
    not: 'Concerns are not shown in the family app.' },
  { who: 'Your child, if they have their own login',
    sees: 'Their own classes, feedback shared with them, and their own medical and emergency details as their teachers see them.',
    not: 'Invoices, payments or your messages.' },
  { who: 'Swayvo support',
    sees: 'Only if the school’s owner grants it, for at most seven days, read-only, and recorded in the school’s audit log.',
    not: 'Medical records, ever.' },
  { who: 'Audiences at shows',
    sees: 'Printed programmes name your child only if photography consent is given.',
    not: 'Anything else.' },
];
