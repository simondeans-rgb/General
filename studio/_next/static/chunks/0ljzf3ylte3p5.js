(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,84614,e=>{"use strict";var t=e.i(75254);let s=(0,t.default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,s],17068);let a=(0,t.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,a],84614)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},10629,e=>{"use strict";var t=e.i(43476),s=e.i(71645);let a=(0,e.i(75254).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);var n=e.i(63059),i=e.i(17068),l=e.i(77326),r=e.i(47741),o=e.i(13927),c=e.i(17658),d=e.i(21011),m=e.i(75379),u=e.i(45060);function h({sessions:e,view:a}){let n=s.useMemo(()=>{let t=new Map,s=e=>"teacher"===a?e.teacher??"Unassigned":"room"===a?[e.location,e.room].filter(Boolean).join(" · ")||"No room set":`${(0,m.isoDate)(e.starts_at)}|${(0,m.dayName)(e.starts_at)}`;for(let n of e){if("day"===a&&(0,m.isoDate)(n.starts_at)!==(0,m.isoDate)(new Date))continue;let e=s(n);t.set(e,[...t.get(e)??[],n])}return[...t.entries()].sort((e,t)=>e[0].localeCompare(t[0]))},[e,a]);return 0===n.length?(0,t.jsx)(c.Card,{children:(0,t.jsx)(c.EmptyState,{icon:(0,t.jsx)(i.CalendarX2,{className:"size-5"}),title:"Nothing today",body:"Switch to the week view to see the rest of the timetable."})}):(0,t.jsx)("div",{className:"space-y-4",children:n.map(([e,s])=>{let a=e.includes("|")?e.split("|")[1]:e,n=e.includes("|")?e.split("|")[0]:null,i=s.reduce((e,t)=>e+("cancelled"===t.status?0:t.enrolled),0);return(0,t.jsxs)(c.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2.5 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:a}),n&&(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,m.dateLong)(n)}),(0,t.jsxs)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:[s.length," class",1===s.length?"":"es"," · ",i," places"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(r.SessionRow,{session:e})},e.id))})]},e)})})}e.s(["default",0,function(){let[e,r]=s.useState(()=>new Date),[_,p]=s.useState("week"),[f,g]=s.useMemo(()=>(0,m.weekRange)(e),[e]),x=(0,o.useRows)(["week",f],d.SESSIONS_BETWEEN,[f,g]),y=t=>{let s=new Date(e);s.setDate(s.getDate()+7*t),r(s)},w=new Date(f).toDateString()===new Date((0,m.weekRange)(new Date)[0]).toDateString();return(0,t.jsx)(l.Shell,{title:"Schedule",subtitle:`${(0,m.dateLong)(f)} – ${(0,m.dateLong)(new Date(new Date(g).getTime()-864e5))}`,allow:["owner","admin"],actions:(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>y(-1),"aria-label":"Previous week",children:(0,t.jsx)(a,{className:"size-4","aria-hidden":!0})}),(0,t.jsx)(c.Button,{size:"sm",variant:w?"secondary":"primary",onClick:()=>r(new Date),children:w?"This week":"Back to today"}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>y(1),"aria-label":"Next week",children:(0,t.jsx)(n.ChevronRight,{className:"size-4","aria-hidden":!0})})]}),children:(0,t.jsxs)("div",{className:"mx-auto max-w-6xl space-y-4",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Schedule view",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:["week","day","teacher","room"].map(e=>(0,t.jsx)("button",{role:"tab","aria-selected":_===e,onClick:()=>p(e),className:(0,u.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors",_===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:"room"===e?"Room":e},e))}),x.isLoading&&(0,t.jsx)(c.Card,{className:"space-y-3 p-4",children:[0,1,2,3].map(e=>(0,t.jsx)(c.Skeleton,{className:"h-14"},e))}),x.error&&(0,t.jsx)(c.ErrorState,{error:x.error,onRetry:()=>x.refetch()}),x.data&&0===x.data.length&&(0,t.jsx)(c.Card,{children:(0,t.jsx)(c.EmptyState,{icon:(0,t.jsx)(i.CalendarX2,{className:"size-5"}),title:"No classes this week",body:"Either the term has not started or this week falls in a break."})}),x.data&&x.data.length>0&&(0,t.jsx)(h,{sessions:x.data,view:_})]})})}],10629)},47741,e=>{"use strict";var t=e.i(43476),s=e.i(22016),a=e.i(46897),n=e.i(84614),i=e.i(61911),l=e.i(17658),r=e.i(75379),o=e.i(45060);let c={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},d={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:m}){let u="cancelled"===e.status,h=e.enrolled>=e.capacity,_=(0,t.jsxs)("div",{className:(0,o.cn)("flex items-stretch gap-3 px-4 py-3",u&&"opacity-60"),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,o.cn)("w-1 shrink-0 rounded-full",d[e.colour??""]??"bg-surface-3")}),(0,t.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,t.jsx)("span",{className:(0,o.cn)("tnum block text-sm font-semibold",u&&"line-through"),children:(0,r.time)(e.starts_at)}),(0,t.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,r.time)(e.ends_at)})]}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,t.jsx)("span",{className:(0,o.cn)("font-medium",u&&"line-through"),children:e.name}),e.style&&(0,t.jsx)(l.Badge,{tone:c[e.colour??""]??"neutral",children:e.style}),u&&(0,t.jsx)(l.Badge,{tone:"critical",children:"Cancelled"}),!u&&e.trials>0&&(0,t.jsxs)(l.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,t.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(n.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(a.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,t.jsxs)("span",{className:(0,o.cn)("inline-flex items-center gap-1",h&&"font-medium text-caution"),children:[(0,t.jsx)(i.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,h?" · full":""]})]})]})]});return m?(0,t.jsx)(s.default,{href:m,className:"block transition-colors hover:bg-surface-2",children:_}):_}])},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,n=a.getFullYear()-t.getFullYear(),i=a.getMonth()-t.getMonth();return(i<0||0===i&&a.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,n,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let a=s(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),i=e=>n.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),i=new Date,l=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(i.getFullYear(),i.getMonth(),i.getDate()))/864e5);return 0===l?"Today":1===l?"Tomorrow":-1===l?"Yesterday":l>1&&l<7?a(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},21011,e=>{"use strict";let t=`
with todays as (
  select cs.* from class_session cs
   where cs.deleted_at is null
     and (cs.starts_at at time zone 'Europe/London')::date = (now() at time zone 'Europe/London')::date
)
select
  count(*) filter (where status <> 'cancelled')::int as classes,
  coalesce((select count(*) from enrolment e
             where e.status = 'active' and e.deleted_at is null
               and e.class_id in (select class_id from todays where status <> 'cancelled')), 0)::int
    as students_expected,
  coalesce((select count(*) from trial t
             where t.deleted_at is null and t.status = 'booked'
               and t.session_id in (select id from todays)), 0)::int as trials,
  count(*) filter (where status = 'cancelled')::int as cancelled,
  count(*) filter (where teacher_id is not null)::int as covered
from todays`,s=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,a=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,n=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,i=`
with marks as (
  select ar.student_id, cs.class_id, ar.status,
         row_number() over (partition by ar.student_id, cs.class_id order by cs.starts_at desc) as rn
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
   where ar.deleted_at is null and cs.starts_at < now()
),
runs as (
  select student_id, class_id
    from marks where rn <= 3
   group by student_id, class_id
  having count(*) = 3 and bool_and(status in ('absent'))
)
select s.id, s.first_name, s.last_name,
       min(c.name) as class_name,
       count(*)::int as classes_affected
  from runs r
  join student s on s.id = r.student_id
  join class c on c.id = r.class_id
 group by s.id, s.first_name, s.last_name
 order by s.last_name, s.first_name`,l=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at, c.name`,r=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,o=`
select t.id, t.status, cs.starts_at, c.name as class_name,
       coalesce(eq.child_name, s.first_name || ' ' || s.last_name) as who,
       eq.contact_name
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join enquiry eq on eq.id = t.enquiry_id
  left join student s on s.id = t.student_id
 where t.deleted_at is null and t.status in ('requested','booked')
 order by cs.starts_at nulls last
 limit 6`,c=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,i,"ATTENTION_PAYMENTS",0,s,"ATTENTION_TRIALS",0,n,"RECENT_ENROLMENTS",0,r,"RECENT_MESSAGES",0,c,"SESSIONS_BETWEEN",0,l,"TODAY_COUNTS",0,t,"UPCOMING_TRIALS",0,o])}]);