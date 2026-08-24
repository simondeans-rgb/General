(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,84614,e=>{"use strict";var t=e.i(75254);let a=(0,t.default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,a],17068);let s=(0,t.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,s],84614)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},81903,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(17068),n=e.i(46897),i=e.i(84614),r=e.i(77326),l=e.i(13927),d=e.i(17658),o=e.i(8199),c=e.i(75379),m=e.i(45060);let u={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};e.s(["default",0,function(){let[e]=a.useMemo(()=>(0,c.dayRange)(0),[]),h=a.useMemo(()=>{let t=new Date(e);return t.setDate(t.getDate()+28),t.toISOString()},[e]),_=(0,l.useRows)(["family-schedule",e],o.MY_SCHEDULE,[e,h]),f=a.useMemo(()=>{let e=new Map;return(_.data??[]).forEach(t=>{let a=(0,c.isoDate)(t.starts_at);e.set(a,[...e.get(a)??[],t])}),[...e.entries()].sort()},[_.data]);return(0,t.jsx)(r.Shell,{title:"Schedule",subtitle:"The next four weeks",allow:["guardian"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[_.isLoading&&(0,t.jsx)(d.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(d.Skeleton,{className:"h-14"},e))}),_.error&&(0,t.jsx)(d.ErrorState,{error:_.error,onRetry:()=>_.refetch()}),0===f.length&&!_.isLoading&&(0,t.jsx)(d.Card,{children:(0,t.jsx)(d.EmptyState,{icon:(0,t.jsx)(s.CalendarX2,{className:"size-5"}),title:"Nothing scheduled",body:"Classes appear here once your child is enrolled."})}),f.map(([e,a])=>(0,t.jsxs)(d.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:(0,c.relativeDay)(a[0].starts_at)}),(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,c.dateLong)(a[0].starts_at)})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:a.map(e=>{let a="cancelled"===e.status;return(0,t.jsxs)("li",{className:(0,m.cn)("flex items-start gap-3 px-4 py-3",a&&"opacity-60"),children:[(0,t.jsx)("span",{className:(0,m.cn)("tnum w-14 shrink-0 font-semibold",a&&"line-through"),children:(0,c.time)(e.starts_at)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("span",{className:(0,m.cn)("font-medium",a&&"line-through"),children:e.name}),e.style&&(0,t.jsx)(d.Badge,{tone:u[e.colour??""]??"neutral",children:e.style}),a&&(0,t.jsx)(d.Badge,{tone:"critical",children:"Cancelled"})]}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[(0,t.jsx)("span",{children:e.child}),e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(i.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(n.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]})]})]})]},`${e.id}-${e.student_id}`)})})]},e))]})})}])},75379,e=>{"use strict";let t="Europe/London",a=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(a(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(a(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=a(e),s=new Date,n=s.getFullYear()-t.getFullYear(),i=s.getMonth()-t.getMonth();return(i<0||0===i&&s.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(a(e)),"dateShort",0,n,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,a=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(a);return s.setDate(s.getDate()+1),[a.toISOString(),s.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let s=a(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),i=e=>n.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=a(e),i=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(i.getFullYear(),i.getMonth(),i.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?s(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(a(e)),"weekRange",0,function(e){let t=new Date(e),a=(t.getDay()+6)%7;t.setDate(t.getDate()-a),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},8199,e=>{"use strict";let t=`
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
 order by s.date_of_birth`,s=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from invoice i
         where i.family_id = f.id and i.deleted_at is null and i.status in ('issued','part_paid')) as unpaid,
       (select count(*)::int from payment p
         where p.family_id = f.id and p.deleted_at is null
           and p.failure_code is not null and p.succeeded_at is null) as failed
  from family f where f.deleted_at is null`,n=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at, c.name as class_name
  from communication cm
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc limit 8`,i=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select s.studio_id, 'direct', 'in_app', s.family_id,
       'Absence: ' || s.first_name || ' — ' || to_char($2::timestamptz, 'FMDay DD Mon'),
       $3, auth.uid()
  from student s where s.id = $1
returning id`;e.s(["MY_BALANCE",0,s,"MY_CHILDREN",0,a,"MY_MESSAGES",0,n,"MY_SCHEDULE",0,t,"REPORT_ABSENCE",0,i])}]);