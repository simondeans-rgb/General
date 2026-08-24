(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},80643,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(22016);let n=(0,e.i(75254).default)("calendar-check-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"bce9hv"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m16 20 2 2 4-4",key:"13tcca"}]]);var i=e.i(63059),r=e.i(95468),l=e.i(46897),d=e.i(61911),o=e.i(77326),c=e.i(13927),m=e.i(31502),u=e.i(17658),_=e.i(94512),h=e.i(75379),g=e.i(45060);function f({s:e,showDay:a}){let n="cancelled"===e.status,o=e.enrolled+e.trials,c=e.marked>=o&&o>0,m=new Date(e.starts_at)<=new Date,_=(0,t.jsxs)("div",{className:(0,g.cn)("flex items-center gap-3 px-4 py-3.5",n&&"opacity-60"),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,g.cn)("w-1 self-stretch rounded-full",{violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"}[e.colour??""]??"bg-surface-3")}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,t.jsxs)("span",{className:"tnum font-semibold",children:[a?`${(0,h.relativeDay)(e.starts_at)} `:"",(0,h.time)(e.starts_at)]}),(0,t.jsx)("span",{className:"font-medium",children:e.name}),n&&(0,t.jsx)(u.Badge,{tone:"critical",children:"Cancelled"}),!n&&c&&(0,t.jsx)(u.Badge,{tone:"positive",icon:(0,t.jsx)(r.CheckCircle2,{className:"size-3"}),children:"Register done"}),!n&&!c&&m&&(0,t.jsx)(u.Badge,{tone:"caution",children:"Register due"}),!n&&e.trials>0&&(0,t.jsxs)(u.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,t.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(d.Users,{className:"size-3.5","aria-hidden":!0}),o," expected"]}),e.room&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(l.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]})]})]}),!n&&(0,t.jsx)(i.ChevronRight,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]});return n?_:(0,t.jsx)(s.default,{href:`/teach/register/?session=${e.id}`,className:"block hover:bg-surface-2",children:_})}e.s(["default",0,function(){let{session:e}=(0,m.useSession)(),[s]=a.useMemo(()=>(0,h.dayRange)(0),[]),i=a.useMemo(()=>{let e=new Date(s);return e.setDate(e.getDate()+7),e.toISOString()},[s]),r=(0,c.useRows)(["my-sessions",s],_.MY_SESSIONS,[s,i]),l=(r.data??[]).filter(e=>new Date(e.starts_at).toDateString()===new Date().toDateString()),d=(r.data??[]).filter(e=>new Date(e.starts_at).toDateString()!==new Date().toDateString());return(0,t.jsx)(o.Shell,{title:`${(0,h.greeting)()}, ${e?.name.split(" ")[0]??""}`,subtitle:(0,h.dateLong)(new Date),allow:["owner","admin","teacher"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-5",children:[r.isLoading&&(0,t.jsx)(u.Card,{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(u.Skeleton,{className:"h-20"},e))}),r.error&&(0,t.jsx)(u.ErrorState,{error:r.error,onRetry:()=>r.refetch()}),r.data&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(u.Card,{children:[(0,t.jsx)(u.CardHeader,{title:"Today",subtitle:l.length?`${l.length} class${1===l.length?"":"es"}`:void 0}),0===l.length?(0,t.jsx)(u.EmptyState,{icon:(0,t.jsx)(n,{className:"size-5"}),title:"No classes today",body:"Your next class is further down."}):(0,t.jsx)("ul",{className:"divide-y divide-line",children:l.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(f,{s:e})},e.id))})]}),d.length>0&&(0,t.jsxs)(u.Card,{children:[(0,t.jsx)(u.CardHeader,{title:"Coming up"}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:d.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(f,{s:e,showDay:!0})},e.id))})]})]})]})})}],80643)},75379,e=>{"use strict";let t="Europe/London",a=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(a(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(a(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=a(e),s=new Date,n=s.getFullYear()-t.getFullYear(),i=s.getMonth()-t.getMonth();return(i<0||0===i&&s.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(a(e)),"dateShort",0,n,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,a=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(a);return s.setDate(s.getDate()+1),[a.toISOString(),s.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let s=a(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),i=e=>n.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=a(e),i=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(i.getFullYear(),i.getMonth(),i.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?s(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(a(e)),"weekRange",0,function(e){let t=new Date(e),a=(t.getDay()+6)%7;t.setDate(t.getDate()-a),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},94512,e=>{"use strict";let t=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at`,a=`
with roll as (
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, false as is_trial
    from enrolment e
    join student s on s.id = e.student_id
   where e.class_id = (select class_id from class_session where id = $1)
     and e.status = 'active' and e.deleted_at is null
  union all
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, true
    from trial t
    join student s on s.id = t.student_id
   where t.session_id = $1 and t.status in ('booked','attended') and t.deleted_at is null
)
select roll.id as student_id, roll.first_name, roll.last_name, roll.preferred_name,
       roll.date_of_birth, roll.is_trial,
       ar.status, ar.reason,
       coalesce(b.requires_alert, false) as requires_alert,
       b.allergies, b.action_plan, b.emergency_contact_name, b.emergency_contact_phone,
       (select round(100.0 * count(*) filter (where a2.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record a2 where a2.student_id = roll.id and a2.deleted_at is null) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`,s=`
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), now()
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at
returning id, status`,n=`
select s.id, s.first_name, s.last_name, s.date_of_birth,
       coalesce(b.requires_alert, false) as requires_alert, b.allergies,
       (select string_agg(distinct c.name, ', ') from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null
           and c.id in (select app.teacher_class_ids())) as class_names,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from student s
  left join student_safety_brief b on b.student_id = s.id
 where s.deleted_at is null
 order by s.last_name, s.first_name`;e.s(["MARK_ATTENDANCE",0,s,"MY_SESSIONS",0,t,"MY_STUDENTS",0,n,"REGISTER",0,a])}]);