(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17068,84614,e=>{"use strict";var s=e.i(75254);let t=(0,s.default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,t],17068);let a=(0,s.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,a],84614)},63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},10629,e=>{"use strict";var s=e.i(43476),t=e.i(71645);let a=(0,e.i(75254).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);var i=e.i(63059),n=e.i(17068),l=e.i(77326),c=e.i(47741),d=e.i(13927),r=e.i(17658),o=e.i(21011),m=e.i(75379),u=e.i(45060);function _({sessions:e,view:a}){let i=t.useMemo(()=>{let s=new Map,t=e=>"teacher"===a?e.teacher??"Unassigned":"room"===a?[e.location,e.room].filter(Boolean).join(" · ")||"No room set":`${(0,m.isoDate)(e.starts_at)}|${(0,m.dayName)(e.starts_at)}`;for(let i of e){if("day"===a&&(0,m.isoDate)(i.starts_at)!==(0,m.isoDate)(new Date))continue;let e=t(i);s.set(e,[...s.get(e)??[],i])}return[...s.entries()].sort((e,s)=>e[0].localeCompare(s[0]))},[e,a]);return 0===i.length?(0,s.jsx)(r.Card,{children:(0,s.jsx)(r.EmptyState,{icon:(0,s.jsx)(n.CalendarX2,{className:"size-5"}),title:"Nothing today",body:"Switch to the week view to see the rest of the timetable."})}):(0,s.jsx)("div",{className:"space-y-4",children:i.map(([e,t])=>{let a=e.includes("|")?e.split("|")[1]:e,i=e.includes("|")?e.split("|")[0]:null,n=t.reduce((e,s)=>e+("cancelled"===s.status?0:s.enrolled),0);return(0,s.jsxs)(r.Card,{children:[(0,s.jsxs)("div",{className:"flex items-baseline gap-2.5 border-b border-line px-4 py-2.5",children:[(0,s.jsx)("h2",{className:"font-semibold",children:a}),i&&(0,s.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,m.dateLong)(i)}),(0,s.jsxs)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:[t.length," class",1===t.length?"":"es"," · ",n," places"]})]}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:t.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(c.SessionRow,{session:e})},e.id))})]},e)})})}e.s(["default",0,function(){let[e,c]=t.useState(()=>new Date),[h,p]=t.useState("week"),[f,x]=t.useMemo(()=>(0,m.weekRange)(e),[e]),y=(0,d.useRows)(["week",f],o.SESSIONS_BETWEEN,[f,x]),j=s=>{let t=new Date(e);t.setDate(t.getDate()+7*s),c(t)},w=new Date(f).toDateString()===new Date((0,m.weekRange)(new Date)[0]).toDateString();return(0,s.jsx)(l.Shell,{title:"Schedule",subtitle:`${(0,m.dateLong)(f)} – ${(0,m.dateLong)(new Date(new Date(x).getTime()-864e5))}`,allow:["owner","admin"],actions:(0,s.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,s.jsx)(r.Button,{size:"sm",variant:"ghost",onClick:()=>j(-1),"aria-label":"Previous week",children:(0,s.jsx)(a,{className:"size-4","aria-hidden":!0})}),(0,s.jsx)(r.Button,{size:"sm",variant:w?"secondary":"primary",onClick:()=>c(new Date),children:w?"This week":"Back to today"}),(0,s.jsx)(r.Button,{size:"sm",variant:"ghost",onClick:()=>j(1),"aria-label":"Next week",children:(0,s.jsx)(i.ChevronRight,{className:"size-4","aria-hidden":!0})})]}),children:(0,s.jsxs)("div",{className:"mx-auto max-w-6xl space-y-4",children:[(0,s.jsx)("div",{role:"tablist","aria-label":"Schedule view",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:["week","day","teacher","room"].map(e=>(0,s.jsx)("button",{role:"tab","aria-selected":h===e,onClick:()=>p(e),className:(0,u.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors",h===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:"room"===e?"Room":e},e))}),y.isLoading&&(0,s.jsx)(r.Card,{className:"space-y-3 p-4",children:[0,1,2,3].map(e=>(0,s.jsx)(r.Skeleton,{className:"h-14"},e))}),y.error&&(0,s.jsx)(r.ErrorState,{error:y.error,onRetry:()=>y.refetch()}),y.data&&0===y.data.length&&(0,s.jsx)(r.Card,{children:(0,s.jsx)(r.EmptyState,{icon:(0,s.jsx)(n.CalendarX2,{className:"size-5"}),title:"No classes this week",body:"Either the term has not started or this week falls in a break."})}),y.data&&y.data.length>0&&(0,s.jsx)(_,{sessions:y.data,view:h})]})})}],10629)},47741,e=>{"use strict";var s=e.i(43476),t=e.i(22016),a=e.i(46897),i=e.i(84614),n=e.i(61911),l=e.i(17658),c=e.i(75379),d=e.i(45060);let r={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},o={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:m}){let u="cancelled"===e.status,_=e.enrolled>=e.capacity,h=(0,s.jsxs)("div",{className:(0,d.cn)("flex items-stretch gap-3 px-4 py-3",u&&"opacity-60"),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,d.cn)("w-1 shrink-0 rounded-full",o[e.colour??""]??"bg-surface-3")}),(0,s.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,s.jsx)("span",{className:(0,d.cn)("tnum block text-sm font-semibold",u&&"line-through"),children:(0,c.time)(e.starts_at)}),(0,s.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,c.time)(e.ends_at)})]}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,s.jsx)("span",{className:(0,d.cn)("font-medium",u&&"line-through"),children:e.name}),e.style&&(0,s.jsx)(l.Badge,{tone:r[e.colour??""]??"neutral",children:e.style}),u&&(0,s.jsx)(l.Badge,{tone:"critical",children:"Cancelled"}),!u&&e.trials>0&&(0,s.jsxs)(l.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,s.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(i.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(a.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,s.jsxs)("span",{className:(0,d.cn)("inline-flex items-center gap-1",_&&"font-medium text-caution"),children:[(0,s.jsx)(n.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,_?" · full":""]})]})]})]});return m?(0,s.jsx)(t.default,{href:m,className:"block transition-colors hover:bg-surface-2",children:h}):h}])},21011,e=>{"use strict";let s=`
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
from todays`,t=`
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
 order by waiting desc, pct desc`,i=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,n=`
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
 order by cs.starts_at, c.name`,c=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,d=`
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
 limit 6`,r=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,n,"ATTENTION_PAYMENTS",0,t,"ATTENTION_TRIALS",0,i,"RECENT_ENROLMENTS",0,c,"RECENT_MESSAGES",0,r,"SESSIONS_BETWEEN",0,l,"TODAY_COUNTS",0,s,"UPCOMING_TRIALS",0,d])}]);