(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,s],63059)},95468,e=>{"use strict";let s=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,s],95468)},46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},80643,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016);let i=(0,e.i(75254).default)("calendar-check-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"bce9hv"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m16 20 2 2 4-4",key:"13tcca"}]]);var n=e.i(63059),l=e.i(95468),r=e.i(46897),d=e.i(61911),c=e.i(77326),o=e.i(13927),_=e.i(31502),m=e.i(17658),u=e.i(94512),h=e.i(75379),f=e.i(45060);function p({s:e,showDay:t}){let i="cancelled"===e.status,c=e.enrolled+e.trials,o=e.marked>=c&&c>0,_=new Date(e.starts_at)<=new Date,u=(0,s.jsxs)("div",{className:(0,f.cn)("flex items-center gap-3 px-4 py-3.5",i&&"opacity-60"),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,f.cn)("w-1 self-stretch rounded-full",{violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"}[e.colour??""]??"bg-surface-3")}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,s.jsxs)("span",{className:"tnum font-semibold",children:[t?`${(0,h.relativeDay)(e.starts_at)} `:"",(0,h.time)(e.starts_at)]}),(0,s.jsx)("span",{className:"font-medium",children:e.name}),i&&(0,s.jsx)(m.Badge,{tone:"critical",children:"Cancelled"}),!i&&o&&(0,s.jsx)(m.Badge,{tone:"positive",icon:(0,s.jsx)(l.CheckCircle2,{className:"size-3"}),children:"Register done"}),!i&&!o&&_&&(0,s.jsx)(m.Badge,{tone:"caution",children:"Register due"}),!i&&e.trials>0&&(0,s.jsxs)(m.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,s.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(d.Users,{className:"size-3.5","aria-hidden":!0}),c," expected"]}),e.room&&(0,s.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,s.jsx)(r.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]})]})]}),!i&&(0,s.jsx)(n.ChevronRight,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]});return i?u:(0,s.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,className:"block hover:bg-surface-2",children:u})}e.s(["default",0,function(){let{session:e}=(0,_.useSession)(),[a]=t.useMemo(()=>(0,h.dayRange)(0),[]),n=t.useMemo(()=>{let e=new Date(a);return e.setDate(e.getDate()+7),e.toISOString()},[a]),l=(0,o.useRows)(["my-sessions",a],u.MY_SESSIONS,[a,n]),r=(l.data??[]).filter(e=>new Date(e.starts_at).toDateString()===new Date().toDateString()),d=(l.data??[]).filter(e=>new Date(e.starts_at).toDateString()!==new Date().toDateString());return(0,s.jsx)(c.Shell,{title:`${(0,h.greeting)()}, ${e?.name.split(" ")[0]??""}`,subtitle:(0,h.dateLong)(new Date),allow:["owner","admin","teacher"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-2xl space-y-5",children:[l.isLoading&&(0,s.jsx)(m.Card,{className:"space-y-3 p-4",children:[0,1].map(e=>(0,s.jsx)(m.Skeleton,{className:"h-20"},e))}),l.error&&(0,s.jsx)(m.ErrorState,{error:l.error,onRetry:()=>l.refetch()}),l.data&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(m.Card,{children:[(0,s.jsx)(m.CardHeader,{title:"Today",subtitle:r.length?`${r.length} class${1===r.length?"":"es"}`:void 0}),0===r.length?(0,s.jsx)(m.EmptyState,{icon:(0,s.jsx)(i,{className:"size-5"}),title:"No classes today",body:"Your next class is further down."}):(0,s.jsx)("ul",{className:"divide-y divide-line",children:r.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(p,{s:e})},e.id))})]}),d.length>0&&(0,s.jsxs)(m.Card,{children:[(0,s.jsx)(m.CardHeader,{title:"Coming up"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:d.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(p,{s:e,showDay:!0})},e.id))})]})]})]})})}],80643)},94512,e=>{"use strict";let s=`
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
 order by cs.starts_at`,t=`
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
 order by roll.last_name, roll.first_name`,a=`
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), now()
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at
returning id, status`,i=`
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
 order by s.last_name, s.first_name`;e.s(["MARK_ATTENDANCE",0,a,"MY_SESSIONS",0,s,"MY_STUDENTS",0,i,"REGISTER",0,t])}]);