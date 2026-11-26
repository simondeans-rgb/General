(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,28345,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),i=e.i(13927),n=e.i(45060);e.i(17658);let d={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};function o({style:e,colour:t,className:a}){return e?(0,s.jsxs)("span",{className:(0,n.cn)("inline-flex items-center gap-1.5 whitespace-nowrap",a),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,n.cn)("inline-block size-2 rounded-[2px]",d[t??""]??"bg-ink-3")}),e]}):null}let l=`
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;function c({word:e,tone:t="ink"}){return(0,s.jsx)("span",{className:(0,n.cn)("font-display text-[15px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]","critical"===t?"text-critical":"text-ink"),children:e})}e.s(["SessionRow",0,function({time:e,name:t,meta:i,href:d,cancelled:l,reason:r,moved:_,style:m,colour:u,extra:p}){let h=(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{className:(0,n.cn)("font-display text-[19px] leading-tight tnum",l&&"text-ink-3 line-through"),children:e}),(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsx)("span",{className:(0,n.cn)("block font-semibold leading-snug",l&&"text-ink-3"),children:t}),(0,s.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3",children:[l&&(0,s.jsx)(c,{word:"Cancelled",tone:"critical"}),!l&&_&&(0,s.jsx)(c,{word:"Moved"}),l&&r?(0,s.jsx)("span",{children:r}):(0,s.jsx)("span",{className:"min-w-0",children:i.filter(Boolean).join(" · ")}),!l&&(0,s.jsx)(o,{style:m??null,colour:u}),p]})]})]}),f="grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3";return(0,s.jsx)("li",{children:d?(0,s.jsx)(a.default,{href:d,"aria-label":`${t}, ${e}${l?", cancelled":""}${_?", moved":""}`,className:(0,n.cn)(f,"hover:bg-surface-2/60"),children:h}):(0,s.jsx)("div",{className:f,children:h})})},"StyleMark",0,o,"dayDate",0,function(e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"dueWord",0,function(e){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"useSessionChanges",0,function(e){let s=[...new Set(e)].sort(),a=(0,i.useRows)(["session-changes",s.join(",")],l,[s],{enabled:s.length>0});return t.useMemo(()=>new Map((a.data??[]).map(e=>[e.id,e])),[a.data])}])},81903,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(20934),i=e.i(30224),n=e.i(31502),d=e.i(76855),o=e.i(87089),l=e.i(77326),c=e.i(13927),r=e.i(17658),_=e.i(28345),m=e.i(8199),u=e.i(75379);function p(){let{session:e}=(0,n.useSession)(),t=async()=>{let s=new Date;s.setHours(0,0,0,0);let t=new Date(s.getTime()+96768e5),a=await (0,i.readAs)(e,m.MY_SCHEDULE,[s.toISOString(),t.toISOString()]),n=new Map;a.forEach(e=>{let s=n.get(e.id);s?s.kids.push(e.child):n.set(e.id,{s:e,kids:[e.child]})}),(0,d.downloadIcs)("dance-classes.ics","Dance classes",[...n.values()].map(({s:e,kids:s})=>({id:e.id,title:`${e.name} (${s.join(" & ")})`,starts_at:e.starts_at,ends_at:e.ends_at,location:[e.room,e.location].filter(Boolean).join(", "),cancelled:"cancelled"===e.status,description:e.teacher?`With ${e.teacher}`:null})))};return(0,s.jsx)(a.CalendarSubscribe,{onDownload:t})}e.s(["default",0,function(){let[e]=t.useMemo(()=>(0,u.dayRange)(0),[]),a=t.useMemo(()=>{let s=new Date(e);return s.setDate(s.getDate()+28),s.toISOString()},[e]),i=(0,c.useRows)(["family-schedule",e],m.MY_SCHEDULE,[e,a]),n=t.useMemo(()=>{let e=new Map;return(i.data??[]).forEach(s=>{let t=(0,u.isoDate)(s.starts_at);e.set(t,[...e.get(t)??[],s])}),[...e.entries()].sort()},[i.data]),d=(0,_.useSessionChanges)((i.data??[]).map(e=>e.id)),h=new Set((i.data??[]).map(e=>e.student_id)).size>1;return(0,s.jsx)(l.Shell,{title:"Schedule",subtitle:"The next four weeks",allow:["guardian"],actionsInline:!0,actions:(0,s.jsx)(p,{}),children:(0,s.jsxs)("div",{className:"mx-auto max-w-2xl space-y-10",children:[(0,s.jsx)(o.RehearsalList,{}),i.isLoading&&(0,s.jsx)("div",{className:"space-y-3",children:[0,1,2].map(e=>(0,s.jsx)(r.Skeleton,{className:"h-14"},e))}),null!=i.error&&(0,s.jsx)(r.ErrorState,{error:i.error,onRetry:()=>i.refetch()}),0===n.length&&!i.isLoading&&(0,s.jsx)(r.EmptyState,{title:"Nothing scheduled",body:"Classes show here once your child is enrolled."}),n.map(([e,t])=>{let a=(0,u.relativeDay)(t[0].starts_at),i=(0,u.dateLong)(t[0].starts_at);return(0,s.jsxs)("section",{"aria-label":i,children:[(0,s.jsx)(r.SectionHead,{title:"Today"===a||"Tomorrow"===a?a:i,meta:"Today"===a||"Tomorrow"===a?i:void 0}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:t.map(e=>{let t=d.get(e.id);return(0,s.jsx)(_.SessionRow,{time:(0,u.time)(e.starts_at),name:h?`${e.child} \xb7 ${e.name}`:e.name,href:`/class/?id=${e.class_id}`,cancelled:"cancelled"===e.status,reason:t?.cancel_reason,moved:!!t&&(!!t.original_starts_at||t.room_moved),style:e.style,colour:e.colour,meta:[h?null:e.child,t?.covered&&e.teacher?`${e.teacher} (cover)`:e.teacher,e.room]},`${e.id}-${e.student_id}`)})})]},e)})]})})}])},48848,e=>{e.v(s=>Promise.all(["static/chunks/0js7v7n93sgyq.js"].map(s=>e.l(s))).then(()=>s(39726)))},56166,e=>{e.v(s=>Promise.all(["static/chunks/0p91d8hqe9-t7.js"].map(s=>e.l(s))).then(()=>s(52715)))},8199,e=>{"use strict";let s=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       s.first_name as child, s.id as student_id
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  join student s on s.id = e.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name, ds.colour, coalesce(sr.name, r.name), l.name, coalesce(cover.display_name, st.display_name),
       s.first_name, s.id
  from drop_in_booking d
  join class_session cs on cs.id = d.session_id
  join class c on c.id = cs.class_id
  join student s on s.id = d.student_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where d.status = 'booked' and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by 4`,t=`
select s.id, s.first_name, s.last_name, s.date_of_birth,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select m.allergies from medical_record m
         where m.student_id = s.id and m.deleted_at is null) as allergies,
       (select cr.granted from consent_record cr
         where cr.student_id = s.id and cr.kind = 'photography' and cr.deleted_at is null) as photo_consent
  from student s
 where s.deleted_at is null
 order by s.date_of_birth`,a=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,i=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.deleted_at is null
 order by i.issued_on desc nulls last limit 8`,n=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
   and not cm.inbound          -- only what the studio sent, never the family's own messages (R-047)
 order by cm.sent_at desc limit 8`,d=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select s.studio_id, 'direct', 'in_app', s.family_id,
       'Absence: ' || s.first_name || ' — ' || to_char($2::timestamptz, 'FMDay DD Mon'),
       $3, auth.uid()
  from student s where s.id = $1
returning id`,o=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,l=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,c=`
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`,r=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif($3, ''), $4,
       coalesce((select max(priority) + 1 from emergency_contact where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1`,_=`
update emergency_contact set full_name = $2, relationship = nullif($3, ''), phone = $4, updated_at = now() where id = $1`,m=`
select d.id, d.student_id, s.first_name, c.name as class_name, cs.starts_at,
       case when d.pack_purchase_id is not null then 'pack' when d.invoice_id is not null then 'invoice' else 'free' end as paid_with
  from drop_in_booking d join student s on s.id = d.student_id join class_session cs on cs.id = d.session_id join class c on c.id = cs.class_id
 where d.status = 'booked' and cs.starts_at > now() order by cs.starts_at`,u=`select p.id, s.first_name, k.name, p.remaining, p.expires_on from pack_purchase p
  join student s on s.id = p.student_id join class_pack k on k.id = p.pack_id
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;e.s(["ADD_CONTACT",0,r,"BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_BALANCE",0,a,"MY_CHILDREN",0,t,"MY_CONTACTS",0,c,"MY_DROP_INS",0,m,"MY_GUARDIANS",0,o,"MY_INVOICES",0,i,"MY_MESSAGES",0,n,"MY_PACKS",0,u,"MY_SCHEDULE",0,s,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REPORT_ABSENCE",0,d,"REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","UPDATE_CONTACT",0,_,"UPDATE_GUARDIAN",0,l])}]);