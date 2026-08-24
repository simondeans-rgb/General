(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,84614,e=>{"use strict";var s=e.i(75254);let a=(0,s.default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,a],17068);let t=(0,s.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},81903,e=>{"use strict";var s=e.i(43476),a=e.i(71645),t=e.i(17068),i=e.i(46897),n=e.i(84614),l=e.i(77326),d=e.i(13927),r=e.i(17658),c=e.i(8199),o=e.i(75379),m=e.i(45060);let u={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};e.s(["default",0,function(){let[e]=a.useMemo(()=>(0,o.dayRange)(0),[]),_=a.useMemo(()=>{let s=new Date(e);return s.setDate(s.getDate()+28),s.toISOString()},[e]),h=(0,d.useRows)(["family-schedule",e],c.MY_SCHEDULE,[e,_]),p=a.useMemo(()=>{let e=new Map;return(h.data??[]).forEach(s=>{let a=(0,o.isoDate)(s.starts_at);e.set(a,[...e.get(a)??[],s])}),[...e.entries()].sort()},[h.data]);return(0,s.jsx)(l.Shell,{title:"Schedule",subtitle:"The next four weeks",allow:["guardian"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[h.isLoading&&(0,s.jsx)(r.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,s.jsx)(r.Skeleton,{className:"h-14"},e))}),h.error&&(0,s.jsx)(r.ErrorState,{error:h.error,onRetry:()=>h.refetch()}),0===p.length&&!h.isLoading&&(0,s.jsx)(r.Card,{children:(0,s.jsx)(r.EmptyState,{icon:(0,s.jsx)(t.CalendarX2,{className:"size-5"}),title:"Nothing scheduled",body:"Classes appear here once your child is enrolled."})}),p.map(([e,a])=>(0,s.jsxs)(r.Card,{children:[(0,s.jsxs)("div",{className:"flex items-baseline gap-2 border-b border-line px-4 py-2.5",children:[(0,s.jsx)("h2",{className:"font-semibold",children:(0,o.relativeDay)(a[0].starts_at)}),(0,s.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,o.dateLong)(a[0].starts_at)})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:a.map(e=>{let a="cancelled"===e.status;return(0,s.jsxs)("li",{className:(0,m.cn)("flex items-start gap-3 px-4 py-3",a&&"opacity-60"),children:[(0,s.jsx)("span",{className:(0,m.cn)("tnum w-14 shrink-0 font-semibold",a&&"line-through"),children:(0,o.time)(e.starts_at)}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,s.jsx)("span",{className:(0,m.cn)("font-medium",a&&"line-through"),children:e.name}),e.style&&(0,s.jsx)(r.Badge,{tone:u[e.colour??""]??"neutral",children:e.style}),a&&(0,s.jsx)(r.Badge,{tone:"critical",children:"Cancelled"})]}),(0,s.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[(0,s.jsx)("span",{children:e.child}),e.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(n.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(i.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]})]})]})]},`${e.id}-${e.student_id}`)})})]},e))]})})}])},8199,e=>{"use strict";let s=`
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
 order by cs.starts_at`,a=`
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
 order by s.date_of_birth`,t=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,i=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc limit 8`,n=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select s.studio_id, 'direct', 'in_app', s.family_id,
       'Absence: ' || s.first_name || ' — ' || to_char($2::timestamptz, 'FMDay DD Mon'),
       $3, auth.uid()
  from student s where s.id = $1
returning id`;e.s(["MY_BALANCE",0,t,"MY_CHILDREN",0,a,"MY_MESSAGES",0,i,"MY_SCHEDULE",0,s,"REPORT_ABSENCE",0,n])}]);