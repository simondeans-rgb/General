(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},28887,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(78894),n=e.i(61911),r=e.i(77326),i=e.i(13927),l=e.i(17658),d=e.i(94512),o=e.i(75379);e.s(["default",0,function(){let[e,c]=a.useState(""),u=(0,i.useRows)(["my-students"],d.MY_STUDENTS),m=(u.data??[]).filter(t=>!e||`${t.first_name} ${t.last_name}`.toLowerCase().includes(e.toLowerCase()));return(0,t.jsx)(r.Shell,{title:"My students",subtitle:u.data?`${u.data.length} across your classes`:void 0,allow:["owner","admin","teacher"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[(0,t.jsx)(l.Input,{type:"search",value:e,onChange:e=>c(e.target.value),placeholder:"Search your students","aria-label":"Search your students"}),u.isLoading&&(0,t.jsx)(l.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(l.Skeleton,{className:"h-12"},e))}),u.error&&(0,t.jsx)(l.ErrorState,{error:u.error}),0===m.length&&!u.isLoading&&(0,t.jsx)(l.Card,{children:(0,t.jsx)(l.EmptyState,{icon:(0,t.jsx)(n.Users,{className:"size-5"}),title:"No students found",body:"You only see children in classes you teach."})}),m.length>0&&(0,t.jsx)(l.Card,{children:(0,t.jsx)("ul",{className:"divide-y divide-line",children:m.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-3 px-4 py-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2",children:(0,o.initials)(e.first_name,e.last_name)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,t.jsxs)("span",{className:"truncate font-medium",children:[e.first_name," ",e.last_name]}),e.requires_alert&&(0,t.jsx)(s.AlertTriangle,{className:"size-3.5 shrink-0 text-critical","aria-label":"Medical alert"})]}),(0,t.jsxs)("span",{className:"block truncate text-[12.5px] text-ink-2",children:[(0,o.ageFrom)(e.date_of_birth)," · ",e.class_names??"—"]})]}),null!=e.attendance_pct&&(0,t.jsxs)(l.Badge,{tone:e.attendance_pct>=85?"positive":e.attendance_pct>=70?"caution":"critical",children:[e.attendance_pct,"%"]})]},e.id))})})]})})}])},75379,e=>{"use strict";let t="Europe/London",a=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(a(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(a(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=a(e),s=new Date,n=s.getFullYear()-t.getFullYear(),r=s.getMonth()-t.getMonth();return(r<0||0===r&&s.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(a(e)),"dateShort",0,n,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,a=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(a);return s.setDate(s.getDate()+1),[a.toISOString(),s.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let s=a(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),r=e=>n.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=a(e),r=new Date,i=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===i?"Today":1===i?"Tomorrow":-1===i?"Yesterday":i>1&&i<7?s(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(a(e)),"weekRange",0,function(e){let t=new Date(e),a=(t.getDay()+6)%7;t.setDate(t.getDate()-a),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},94512,e=>{"use strict";let t=`
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