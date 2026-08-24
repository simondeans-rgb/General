-- ============================================================================
-- 0009 · Indexes
-- ----------------------------------------------------------------------------
-- Every RLS policy filters on studio_id, so it leads most composite indexes.
-- Partial indexes exclude soft-deleted rows, which is what every query wants.
-- ============================================================================
create index membership_user       on membership (user_id) where deleted_at is null;
create index membership_studio     on membership (studio_id, role) where deleted_at is null;
create index location_studio       on location (studio_id) where deleted_at is null;
create index room_location         on room (location_id) where deleted_at is null;
create index staff_studio          on staff_member (studio_id, status) where deleted_at is null;
create index staff_user            on staff_member (user_id) where deleted_at is null;

create index family_studio         on family (studio_id) where deleted_at is null;
create index guardian_family       on guardian (family_id) where deleted_at is null;
create index guardian_user         on guardian (user_id) where deleted_at is null;
create index student_studio        on student (studio_id) where deleted_at is null;
create index student_family        on student (family_id) where deleted_at is null;
create index student_name          on student (studio_id, last_name, first_name) where deleted_at is null;
create index emergency_student     on emergency_contact (student_id) where deleted_at is null;
create index consent_student       on consent_record (student_id) where deleted_at is null;

create index term_studio           on term (studio_id, starts_on) where deleted_at is null;
create index class_studio          on class (studio_id, day_of_week, start_time) where deleted_at is null;
create index class_term            on class (term_id) where deleted_at is null;
create index class_teacher         on class (teacher_id) where deleted_at is null;
create index class_assistant       on class (assistant_id) where deleted_at is null;
create index session_class_time    on class_session (class_id, starts_at) where deleted_at is null;
-- Drives "today" for owner and teacher, the single hottest query in the app.
create index session_studio_time   on class_session (studio_id, starts_at) where deleted_at is null;

create index enrolment_class       on enrolment (class_id, status) where deleted_at is null;
create index enrolment_student     on enrolment (student_id, status) where deleted_at is null;
create index trial_class           on trial (class_id, status) where deleted_at is null;
create index trial_session         on trial (session_id) where deleted_at is null;
create index trial_student         on trial (student_id) where deleted_at is null;
create index waitlist_class        on waitlist_entry (class_id, status, position) where deleted_at is null;
create index enquiry_studio_stage  on enquiry (studio_id, stage) where deleted_at is null;

create index attendance_session    on attendance_record (session_id) where deleted_at is null;
create index attendance_student    on attendance_record (student_id, marked_at desc) where deleted_at is null;

create index invoice_family        on invoice (family_id, status) where deleted_at is null;
create index invoice_studio_status on invoice (studio_id, status, due_on) where deleted_at is null;
create index invoice_item_invoice  on invoice_item (invoice_id) where deleted_at is null;
create index payment_family        on payment (family_id) where deleted_at is null;

create index comm_studio_sent      on communication (studio_id, sent_at desc) where deleted_at is null;
create index comm_family           on communication (family_id, sent_at desc) where deleted_at is null;
create index notification_user     on notification (user_id, created_at desc) where deleted_at is null and read_at is null;
create index audit_studio_at       on audit_log (studio_id, at desc);

-- Email is matched case-insensitively; a functional unique index does the job
-- that citext would, without depending on an extension being installed.
create unique index user_account_email_unique on user_account (lower(email));
create index guardian_email on guardian (lower(email)) where deleted_at is null;
create index staff_email on staff_member (lower(email)) where deleted_at is null;
