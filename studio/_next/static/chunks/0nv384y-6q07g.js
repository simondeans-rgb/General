(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,46897,e=>{"use strict";let s=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,s],46897)},81418,e=>{"use strict";let s=(0,e.i(75254).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["ShieldCheck",0,s],81418)},13515,e=>{"use strict";var s=e.i(43476),a=e.i(71645),t=e.i(46897),i=e.i(75254);let l=(0,i.default)("calendar-range",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M17 14h-6",key:"bkmgh3"}],["path",{d:"M13 18H7",key:"bb0bb7"}],["path",{d:"M7 14h.01",key:"1qa3f1"}],["path",{d:"M17 18h.01",key:"1bdyru"}]]),d=(0,i.default)("rotate-ccw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]),n=(0,i.default)("database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);var r=e.i(81418),c=e.i(77326),o=e.i(13927),m=e.i(30224),h=e.i(17658),u=e.i(29074),_=e.i(75379);let x=["violet","amber","teal","rose","indigo","lime"];function p(){let[e,t]=a.useState("idle"),i=async()=>{t("working"),await (0,m.resetDemo)(),location.reload()};return"confirm"===e?(0,s.jsxs)("div",{className:"rounded-[var(--radius-md)] border border-caution/30 bg-caution-soft p-3",children:[(0,s.jsx)("p",{className:"text-sm font-medium",children:"Rebuild the demo studio?"}),(0,s.jsx)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:"Registers you have marked and absences you have reported will be discarded."}),(0,s.jsxs)("div",{className:"mt-3 flex gap-2",children:[(0,s.jsx)(h.Button,{size:"sm",onClick:()=>t("idle"),children:"Cancel"}),(0,s.jsx)(h.Button,{size:"sm",variant:"danger",onClick:i,children:"Yes, start again"})]})]}):(0,s.jsxs)(h.Button,{size:"sm",loading:"working"===e,onClick:()=>t("confirm"),children:[(0,s.jsx)(d,{className:"size-4","aria-hidden":!0})," Reset demo data"]})}e.s(["default",0,function(){let e=(0,o.useRows)(["locations"],u.LOCATIONS),a=(0,o.useRows)(["terms"],u.TERMS),i=(0,o.useRows)(["styles"],"select id, name, colour from dance_style where deleted_at is null order by sort_order"),d=(0,o.useRows)(["levels"],"select id, name from level where deleted_at is null order by sort_order");return(0,s.jsx)(c.Shell,{title:"Studio",subtitle:"Northstar Dance Academy",allow:["owner","admin"],children:(0,s.jsxs)("div",{className:"mx-auto max-w-3xl space-y-5",children:[(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"Locations",subtitle:"Where classes happen"}),e.isLoading&&(0,s.jsx)("div",{className:"p-4",children:(0,s.jsx)(h.Skeleton,{className:"h-16"})}),e.error&&(0,s.jsx)("div",{className:"p-4",children:(0,s.jsx)(h.ErrorState,{error:e.error})}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:e.data?.map(e=>(0,s.jsxs)("li",{className:"flex items-start gap-3 px-4 py-3",children:[(0,s.jsx)(t.MapPin,{className:"mt-0.5 size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsx)("p",{className:"font-medium",children:e.name}),(0,s.jsx)("p",{className:"text-[13px] text-ink-2",children:[e.address_line1,e.city,e.postcode].filter(Boolean).join(", ")})]}),(0,s.jsxs)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:[e.rooms," room",1===e.rooms?"":"s"," · ",e.classes," classes"]})]},e.id))})]}),(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"Terms",subtitle:"Class sessions are generated from these dates"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,s.jsxs)("li",{className:"flex items-center gap-3 px-4 py-3",children:[(0,s.jsx)(l,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsx)("p",{className:"font-medium",children:e.name}),(0,s.jsxs)("p",{className:"text-[13px] text-ink-2",children:[(0,_.dateShort)(e.starts_on)," – ",(0,_.dateShort)(e.ends_on)]})]}),(0,s.jsx)(h.Badge,{tone:"published"===e.status?"positive":"neutral",children:e.status}),(0,s.jsxs)("span",{className:"shrink-0 text-[12.5px] text-ink-3",children:[e.classes," classes"]})]},e.id))})]}),(0,s.jsxs)("div",{className:"grid gap-5 sm:grid-cols-2",children:[(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"Dance styles"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2 p-4",children:i.data?.map(e=>(0,s.jsx)(h.Badge,{tone:x.includes(e.colour)?e.colour:"neutral",children:e.name},e.id))})]}),(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"Levels"}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2 p-4",children:d.data?.map(e=>(0,s.jsx)(h.Badge,{children:e.name},e.id))})]})]}),(0,s.jsxs)(h.Card,{children:[(0,s.jsx)(h.CardHeader,{title:"About this demo"}),(0,s.jsxs)("div",{className:"space-y-4 p-4",children:[(0,s.jsxs)("div",{className:"flex items-start gap-3",children:[(0,s.jsx)(n,{className:"mt-0.5 size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,s.jsx)("p",{className:"text-[13px] leading-relaxed text-ink-2",children:"Everything here lives in a Postgres database running inside this browser tab, built from the same migrations the production app uses. Nothing is sent anywhere."})]}),(0,s.jsxs)("div",{className:"flex items-start gap-3",children:[(0,s.jsx)(r.ShieldCheck,{className:"mt-0.5 size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,s.jsx)("p",{className:"text-[13px] leading-relaxed text-ink-2",children:"Row level security is on and forced. Signed in as Marcus, the medical table returns no rows at all; signed in as Hannah, you get exactly one family. That is the database refusing, not this interface hiding."})]}),(0,s.jsx)(p,{})]})]})]})})}],13515)},29074,e=>{"use strict";let s=`
select c.id, c.name, ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, l.name as location, r.name as room,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity,0))::int as pct,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null
           and cs.starts_at > now() and cs.status = 'scheduled') as sessions_left
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join location l on l.id = c.location_id
  left join room r on r.id = c.room_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,a=`
select s.id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
       f.name as family_name,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar
          join class_session cs on cs.id = ar.session_id and cs.class_id = e.class_id
         where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from enrolment e
  join student s on s.id = e.student_id
  join family f on f.id = s.family_id
 where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
 order by s.last_name, s.first_name`,t=`
select w.id, w.position, w.status, s.first_name, s.last_name, f.name as family_name
  from waitlist_entry w
  join student s on s.id = w.student_id
  join family f on f.id = s.family_id
 where w.class_id = $1 and w.status in ('waiting','offered') and w.deleted_at is null
 order by w.position`,i=`
select
  count(*)::int as total,
  count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int as booked,
  count(*) filter (where stage in ('trial_attended','enrolled'))::int as attended,
  count(*) filter (where stage = 'enrolled')::int as converted,
  count(*) filter (where stage = 'closed_lost')::int as lost
from enquiry where deleted_at is null`,l=`
select e.id, e.stage, e.contact_name, e.contact_email, e.contact_phone,
       e.child_name, e.child_dob, e.source, e.next_action_on, e.created_at,
       c.name as class_name, ds.colour
  from enquiry e
  left join class c on c.id = e.interest_class_id
  left join dance_style ds on ds.id = c.dance_style_id
 where e.deleted_at is null
 order by
   array_position(array['trial_attended','follow_up','trial_booked','trial_requested',
                        'enquiry','trial_missed','enrolled','closed_lost']::text[], e.stage::text),
   e.next_action_on nulls last`,d=`
select t.id, t.name, t.starts_on, t.ends_on, t.status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null order by t.starts_on desc`,n=`
select l.id, l.name, l.address_line1, l.city, l.postcode,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`;e.s(["CLASSES",0,s,"CLASS_ROSTER",0,a,"CLASS_WAITLIST",0,t,"ENQUIRIES",0,l,"FUNNEL",0,i,"LOCATIONS",0,n,"TERMS",0,d])}]);