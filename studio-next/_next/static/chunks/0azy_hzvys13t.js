(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,e=>{"use strict";let s=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,s],17068)},63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},84614,e=>{"use strict";let s=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,s],84614)},81903,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),i=e.i(17068),n=e.i(63059),d=e.i(46897),l=e.i(84614),c=e.i(20934),r=e.i(30224),o=e.i(31502),_=e.i(76855),m=e.i(87089),u=e.i(77326),p=e.i(13927),h=e.i(17658),f=e.i(8199),y=e.i(75379),g=e.i(45060);let j={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};function x(){let{session:e}=(0,o.useSession)(),t=async()=>{let s=new Date;s.setHours(0,0,0,0);let t=new Date(s.getTime()+96768e5),a=await (0,r.readAs)(e,f.MY_SCHEDULE,[s.toISOString(),t.toISOString()]),i=new Map;a.forEach(e=>{let s=i.get(e.id);s?s.kids.push(e.child):i.set(e.id,{s:e,kids:[e.child]})}),(0,_.downloadIcs)("dance-classes.ics","Dance classes",[...i.values()].map(({s:e,kids:s})=>({id:e.id,title:`${e.name} (${s.join(" & ")})`,starts_at:e.starts_at,ends_at:e.ends_at,location:[e.room,e.location].filter(Boolean).join(", "),cancelled:"cancelled"===e.status,description:e.teacher?`With ${e.teacher}`:null})))};return(0,s.jsx)(c.CalendarSubscribe,{onDownload:t})}e.s(["default",0,function(){let[e]=t.useMemo(()=>(0,y.dayRange)(0),[]),c=t.useMemo(()=>{let s=new Date(e);return s.setDate(s.getDate()+28),s.toISOString()},[e]),r=(0,p.useRows)(["family-schedule",e],f.MY_SCHEDULE,[e,c]),o=t.useMemo(()=>{let e=new Map;return(r.data??[]).forEach(s=>{let t=(0,y.isoDate)(s.starts_at);e.set(t,[...e.get(t)??[],s])}),[...e.entries()].sort()},[r.data]);return(0,s.jsx)(u.Shell,{title:"Schedule",subtitle:"The next four weeks",allow:["guardian"],actions:(0,s.jsx)(x,{}),children:(0,s.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[(0,s.jsx)(m.RehearsalList,{}),r.isLoading&&(0,s.jsx)(h.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,s.jsx)(h.Skeleton,{className:"h-14"},e))}),r.error&&(0,s.jsx)(h.ErrorState,{error:r.error,onRetry:()=>r.refetch()}),0===o.length&&!r.isLoading&&(0,s.jsx)(h.Card,{children:(0,s.jsx)(h.EmptyState,{icon:(0,s.jsx)(i.CalendarX2,{className:"size-5"}),title:"Nothing scheduled",body:"Classes appear here once your child is enrolled."})}),o.map(([e,t])=>(0,s.jsxs)(h.Card,{children:[(0,s.jsxs)("div",{className:"flex items-baseline gap-2 border-b border-line px-4 py-2.5",children:[(0,s.jsx)("h2",{className:"font-semibold",children:(0,y.relativeDay)(t[0].starts_at)}),(0,s.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,y.dateLong)(t[0].starts_at)})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:t.map(e=>{let t="cancelled"===e.status;return(0,s.jsx)("li",{className:(0,g.cn)(t&&"opacity-60"),children:(0,s.jsxs)(a.default,{href:`/class/?id=${e.class_id}`,"aria-label":`${e.name}, open class`,className:"flex items-start gap-3 px-4 py-3 hover:bg-surface-2",children:[(0,s.jsx)("span",{className:(0,g.cn)("tnum w-14 shrink-0 font-semibold",t&&"line-through"),children:(0,y.time)(e.starts_at)}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,s.jsx)("span",{className:(0,g.cn)("font-medium",t&&"line-through"),children:e.name}),e.style&&(0,s.jsx)(h.Badge,{tone:j[e.colour??""]??"neutral",children:e.style}),t&&(0,s.jsx)(h.Badge,{tone:"critical",children:"Cancelled"})]}),(0,s.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[(0,s.jsx)("span",{children:e.child}),e.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(l.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(d.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]})]})]}),(0,s.jsx)(n.ChevronRight,{className:"size-4 shrink-0 self-center text-ink-3","aria-hidden":!0})]})},`${e.id}-${e.student_id}`)})})]},e))]})})}])},48848,e=>{e.v(s=>Promise.all(["static/chunks/2blm52yuz__z1.js"].map(s=>e.l(s))).then(()=>s(39726)))},56166,e=>{e.v(s=>Promise.all(["static/chunks/3m1m02179ltut.js"].map(s=>e.l(s))).then(()=>s(52715)))},8199,e=>{"use strict";let s=`
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
returning id`,l=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.user_id = auth.uid() as is_me
  from guardian g where g.deleted_at is null and g.family_id in (select app.guardian_family_ids())
 order by (g.user_id = auth.uid()) desc nulls last, g.is_primary desc, g.full_name`,c=`
update guardian set full_name = $2, email = nullif($3, ''), phone = nullif($4, ''), updated_at = now() where id = $1`,r=`
select ec.id, ec.student_id, ec.full_name, ec.relationship, ec.phone from emergency_contact ec
 where ec.deleted_at is null and ec.student_id in (select app.guardian_student_ids())
 order by ec.priority, ec.created_at`,o=`
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
 where p.remaining > 0 and p.expires_on >= current_date order by p.expires_on`;e.s(["ADD_CONTACT",0,o,"BOOK_DROP_IN",0,"select app.book_drop_in($1, $2) as r","BOOK_TRIAL",0,"select app.parent_book_trial($1, $2) as result","BUY_PACK",0,"select app.buy_pack($1, $2) as id","CANCEL_DROP_IN",0,"select app.cancel_drop_in($1) as r","CLASS_OPTIONS",0,"select * from app.class_options_for_child($1)","DROP_IN_SESSIONS",0,"select d.* from studio s, app.drop_in_sessions(s.id) d where s.id in (select app.studio_ids()) order by d.starts_at","JOIN_WAITLIST",0,"select app.parent_join_waitlist($1, $2) as position","MY_BALANCE",0,a,"MY_CHILDREN",0,t,"MY_CONTACTS",0,r,"MY_DROP_INS",0,m,"MY_GUARDIANS",0,l,"MY_INVOICES",0,i,"MY_MESSAGES",0,n,"MY_PACKS",0,u,"MY_SCHEDULE",0,s,"PACKS",0,"select id, name, classes, price_minor, valid_days from class_pack where active order by classes","REMOVE_CONTACT",0,"select app.remove_emergency_contact($1)","REPORT_ABSENCE",0,d,"REQUEST_CHILD",0,"select app.request_new_child($1::jsonb) as id","REQUEST_PLACE",0,"select app.request_class_place($1, $2, $3) as id","UPDATE_CONTACT",0,_,"UPDATE_GUARDIAN",0,c])}]);