(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,52112,e=>{"use strict";var t=e.i(43476),i=e.i(77326),s=e.i(20934),n=e.i(30224),d=e.i(31502),a=e.i(76855),r=e.i(13927),o=e.i(17658),l=e.i(27080),_=e.i(84315),m=e.i(75379);let u=Object.fromEntries(_.RESULTS);function c(){let e=(0,r.useRows)(["my-exams"],_.MY_EXAMS);return e.data?.length?(0,t.jsxs)("section",{"aria-labelledby":"my-exams",children:[(0,t.jsx)(o.SectionHead,{id:"my-exams",title:"Exams",meta:"Entries and results"}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-baseline gap-x-3 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[e.grade," · ",e.board]}),(0,t.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[e.exam_title," · ",(0,m.dateLong)(e.exam_on)]})]}),(0,t.jsx)("span",{className:"text-[0.875rem] font-semibold",children:e.result?`${u[e.result]??e.result}${null!=e.mark?` \xb7 ${e.mark}`:""}`:new Date(e.exam_on)>=new Date(new Date().toDateString())?"Entered":"Result to come"})]},e.id))})]}):null}function p(){let{session:e}=(0,d.useSession)(),i=async()=>{let t=new Date;t.setHours(0,0,0,0);let i=new Date(t.getTime()+96768e5),s=await (0,n.readAs)(e,l.MY_DIARY,[t.toISOString(),i.toISOString()]);(0,a.downloadIcs)("my-dance-diary.ics","Dance diary",(0,l.diaryToCalendar)(s))};return(0,t.jsx)(s.CalendarSubscribe,{onDownload:i,label:"Add all to my calendar"})}e.s(["default",0,function(){return(0,t.jsx)(i.Shell,{title:"Timetable",subtitle:"Your classes, rehearsals, shows and exams",allow:["student"],actionsInline:!0,actions:(0,t.jsx)(p,{}),children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-10",children:[(0,t.jsx)(l.Diary,{empty:"Your classes show here once you’re enrolled."}),(0,t.jsx)(c,{})]})})}])},48848,e=>{e.v(t=>Promise.all(["static/chunks/3e350uomau313.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/2ee35hgewvtri.js"].map(t=>e.l(t))).then(()=>t(52715)))},84315,e=>{"use strict";let t=`
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       count(p.*) filter (where p.status = 'invited')::int as invited,
       count(p.*) filter (where p.status = 'confirmed')::int as confirmed,
       count(p.*) filter (where p.status = 'requested')::int as requested,
       count(p.*) filter (where p.status = 'declined')::int as declined,
       (select count(distinct ii.student_id)::int from invoice_item ii where ii.event_id = e.id and ii.deleted_at is null) as billed
  from studio_event e left join event_participant p on p.event_id = e.id and p.deleted_at is null
 where e.deleted_at is null and e.parent_event_id is null and e.kind <> 'private_lesson'
 group by e.id order by (e.starts_at < now()), e.starts_at`,i=`
insert into studio_event (studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, capacity, entries_close_on, requests_open, created_by)
select m.studio_id, $1::event_kind, $2::event_status, btrim($3), nullif(btrim($4), ''), $5::timestamptz, $6::timestamptz, nullif(btrim($7), ''),
       $8, $9, $10::date, $11, auth.uid()
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`,s=`
update studio_event set kind = $2::event_kind, status = $3::event_status, title = btrim($4), description = nullif(btrim($5), ''),
       starts_at = $6::timestamptz, ends_at = $7::timestamptz, venue = nullif(btrim($8), ''), cost_minor = $9, capacity = $10,
       entries_close_on = $11::date, requests_open = $12, updated_at = now() where id = $1 returning id`,n=`
select p.id, p.status::text as status, s.first_name || ' ' || s.last_name as student, c.name as class_name
  from event_participant p join student s on s.id = p.student_id left join class c on c.id = p.invited_class_id
 where p.event_id = $1 and p.deleted_at is null order by p.status, s.first_name`,d=`select r.id, r.title, r.position, r.costume, r.music, c.name as class_name, r.class_id
  from event_routine r left join class c on c.id = r.class_id where r.event_id = $1 and r.deleted_at is null order by r.position, r.title`,a=`insert into event_routine (event_id, class_id, title, costume, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`,r=`
with me as (select id, event_id, position from event_routine where id = $1),
     other as (select r.id, r.position from event_routine r, me where r.event_id = me.event_id and r.deleted_at is null and r.id <> me.id
                 and case when $2 < 0 then r.position < me.position else r.position > me.position end
               order by case when $2 < 0 then -r.position else r.position end limit 1)
update event_routine r set position = case when r.id = (select id from me) then (select position from other) else (select position from me) end
 where r.id in ((select id from me), (select id from other)) returning r.id`,o=`insert into studio_event (studio_id, kind, title, starts_at, ends_at, venue, parent_event_id, requests_open, created_by)
  select studio_id, 'rehearsal', btrim($2), $3::timestamptz, $4::timestamptz, nullif(btrim($5), ''), id, false, auth.uid() from studio_event where id = $1 returning id`,l=`
insert into costume_order (item_id, student_id, status) values ($1, $2, $3)
on conflict (item_id, student_id) do update set status = excluded.status, updated_at = now() returning item_id`,_=`
select t.id, t.name, t.price_minor, t.capacity, t.per_family_max, app.tickets_left(t.id) as left,
       coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0)::int as sold
  from ticket_type t where t.event_id = $1 and t.deleted_at is null order by t.price_minor desc, t.name`,m=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.deleted_at is null group by x.id order by (x.exam_on < current_date), x.exam_on`,u=`
insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on)
select m.studio_id, btrim($1), btrim($2), $3::date, nullif(btrim($4), ''), $5::date
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null and app.in_scope(m.studio_id) limit 1 returning id`,c=`e.id, e.session_id, e.student_id, s.first_name || ' ' || s.last_name as student, e.grade, e.fee_minor, e.status, e.result, e.mark,
       x.board, x.title as exam_title, x.exam_on`,p=`
select ${c} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.session_id = $1 order by e.grade, s.first_name`,$=`
select ${c} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.student_id = $1 and e.status <> 'withdrawn' order by x.exam_on desc`,h=`
select ${c} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.status <> 'withdrawn' order by x.exam_on desc`,E=`
select i.id, i.name, i.sizes, s.id as student_id, s.first_name, o.size, o.status
  from costume_item i
  join student s on s.id in (select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
                             union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
                                     and p.status = 'confirmed' and p.deleted_at is null)
  left join costume_order o on o.item_id = i.id and o.student_id = s.id
 where i.event_id = $1 and i.deleted_at is null and s.deleted_at is null
 order by i.name, s.first_name`,f=`insert into event_helper_slot (studio_id, event_id, role, starts_at, needed)
  select studio_id, id, btrim($2), $3::timestamptz, $4 from studio_event where id = $1 returning id`;e.s(["ADD_CHAPERONE",0,"insert into event_chaperone (event_id, name, phone, role, checked) values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id","ADD_COSTUME",0,"insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, btrim($3), $4) returning id","ADD_EXAM_SESSION",0,u,"ADD_HELPER_SLOT",0,f,"ADD_REHEARSAL",0,o,"ADD_ROUTINE",0,a,"ADD_TICKET_TYPE",0,"insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, btrim($2), $3, $4, $5) returning id","BILL_EVENT",0,"select app.bill_event($1) as n","BILL_EXAM",0,"select app.bill_exam($1) as n","BOOK_TICKETS",0,"select app.book_tickets($1, $2) as id","CHAPERONES",0,"select id, name, phone, role, checked from event_chaperone where event_id = $1 and deleted_at is null order by name","COSTUME_LIST",0,"select * from app.costume_list($1)","CREATE_EVENT",0,i,"ENTER_EXAM",0,"select app.enter_exam($1, $2, $3, $4) as id","EVENTS",0,t,"EXAM_ENTRIES",0,p,"EXAM_RESULT",0,"select app.exam_result($1, $2, $3)","EXAM_SESSIONS",0,m,"HELPER_SLOTS",0,"select * from app.helper_slots($1)","INVITE_CLASSES",0,"select app.invite_classes($1, $2::uuid[]) as n","LOG_PRACTICE",0,"select app.log_practice($1, $2, $3) as id","MARK_REHEARSAL",0,"select app.mark_rehearsal($1, $2, $3::attendance_status)","MOVE_ROUTINE",0,r,"MY_COSTUMES",0,E,"MY_EXAMS",0,h,"MY_PRACTICE",0,"select id, practised_on, minutes, what from practice_log where student_id = $1 order by practised_on desc, created_at desc limit 10","MY_TICKETS",0,"select b.id, t.event_id, t.name, b.quantity from ticket_booking b join ticket_type t on t.id = b.ticket_type_id where b.status = 'booked'","PARTICIPANTS",0,n,"PRACTICE_WEEKLY",0,"select * from app.practice_weekly($1)","PROGRAMME",0,"select * from app.event_programme($1)","REHEARSALS",0,"select id, title, starts_at, ends_at, venue from studio_event where parent_event_id = $1 and deleted_at is null order by starts_at","REHEARSAL_REGISTER",0,"select * from app.rehearsal_register($1)","REMOVE_CHAPERONE",0,"delete from event_chaperone where id = $1","REMOVE_HELPER_SLOT",0,"update event_helper_slot set deleted_at = now() where id = $1 returning id","REMOVE_ROUTINE",0,"delete from event_routine where id = $1","RESULTS",0,[["distinction","Distinction"],["merit","Merit"],["pass","Pass"],["highly_commended","Highly commended"],["commended","Commended"],["not_yet","Not yet"]],"ROUTINES",0,d,"SEND_EVENT_NOTICE",0,"select app.send_event_notice($1, $2, $3) as n","SET_COSTUME_SIZE",0,"select app.set_costume_size($1, $2, $3)","SET_COSTUME_STATUS",0,l,"SET_PARTICIPANT",0,"update event_participant set status = $2::participant_status, decided_by = auth.uid(), decided_at = now() where id = $1 returning id","STUDENT_EXAMS",0,$,"STUDENT_PICK",0,"select id, first_name || ' ' || last_name as name from student where deleted_at is null order by first_name, last_name","TICKET_TYPES",0,_,"UPCOMING_EXAMS",0,"select id, board, title, exam_on from exam_session where deleted_at is null and exam_on >= current_date order by exam_on","UPDATE_EVENT",0,s])}]);