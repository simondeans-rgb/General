(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63488,e=>{"use strict";let t=(0,e.i(75254).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",0,t],63488)},43432,e=>{"use strict";let t=(0,e.i(75254).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);e.s(["Phone",0,t],43432)},63564,e=>{"use strict";var t=e.i(43476),a=e.i(34098),s=e.i(43432),l=e.i(63488);let n=(0,e.i(75254).default)("calendar-clock",[["path",{d:"M16 14v2.2l1.6 1",key:"fo4ql5"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]]);var i=e.i(77326),d=e.i(13927),r=e.i(17658),o=e.i(29074),c=e.i(75379),m=e.i(45060);let _={enquiry:{label:"Enquiry",tone:"neutral"},trial_requested:{label:"Trial requested",tone:"info"},trial_booked:{label:"Trial booked",tone:"info"},trial_attended:{label:"Trial attended",tone:"accent"},trial_missed:{label:"Trial missed",tone:"caution"},follow_up:{label:"Follow up",tone:"caution"},enrolled:{label:"Enrolled",tone:"positive"},closed_lost:{label:"Closed",tone:"neutral"}};function u({steps:e}){let a=Math.max(...e.map(e=>e[1]),1);return(0,t.jsx)("ol",{className:"space-y-2.5",children:e.map(([s,l],n)=>{let i=n>0?e[n-1][1]:null,d=null!=i&&i>0?Math.round((i-l)/i*100):null;return(0,t.jsxs)("li",{className:"flex items-center gap-3",children:[(0,t.jsx)("span",{className:"w-28 shrink-0 text-[13px] text-ink-2",children:s}),(0,t.jsx)("span",{"aria-hidden":!0,className:"h-7 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2",children:(0,t.jsx)("span",{className:"block h-full rounded-[var(--radius-sm)] bg-accent/85",style:{width:`${Math.max(3,l/a*100)}%`}})}),(0,t.jsx)("span",{className:"tnum w-8 shrink-0 text-right font-semibold",children:l}),(0,t.jsx)("span",{className:"tnum w-16 shrink-0 text-right text-[12.5px] text-ink-3",children:null!=d&&d>0?`−${d}%`:""})]},s)})})}e.s(["default",0,function(){let e=(0,d.useRow)(["funnel"],o.FUNNEL),h=(0,d.useRows)(["enquiries"],o.ENQUIRIES),x=e.data,f=x&&x.total>0?Math.round(x.converted/x.total*1e3)/10:null;return(0,t.jsx)(i.Shell,{title:"Enrolment",subtitle:"From first enquiry to a place in a class",allow:["owner","admin"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-5xl space-y-5",children:[(0,t.jsxs)(r.Card,{children:[(0,t.jsx)(r.CardHeader,{title:"Funnel",subtitle:null!=f?`${f}% of enquiries became enrolments`:void 0}),(0,t.jsxs)("div",{className:"p-4",children:[e.isLoading&&(0,t.jsx)(r.Skeleton,{className:"h-24"}),x&&(0,t.jsx)(u,{steps:[["Enquiries",x.total],["Trials booked",x.booked],["Attended",x.attended],["Enrolled",x.converted]]})]})]}),(0,t.jsxs)(r.Card,{children:[(0,t.jsx)(r.CardHeader,{title:"Pipeline",subtitle:"Ordered by what needs doing next, not by when it arrived"}),h.isLoading&&(0,t.jsx)("div",{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(r.Skeleton,{className:"h-16"},e))}),h.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(r.ErrorState,{error:h.error})}),h.data?.length===0&&(0,t.jsx)(r.EmptyState,{icon:(0,t.jsx)(a.Route,{className:"size-5"}),title:"No enquiries yet",body:"New enquiries from your website or walk-ins will appear here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:h.data?.map(e=>{let a=_[e.stage]??_.enquiry,i=e.next_action_on&&new Date(e.next_action_on)<new Date;return(0,t.jsx)("li",{className:"px-4 py-3",children:(0,t.jsxs)("div",{className:"flex flex-wrap items-start gap-x-3 gap-y-1.5",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("p",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("span",{className:"font-medium",children:e.child_name}),e.child_dob&&(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,c.ageFrom)(e.child_dob)}),(0,t.jsx)(r.Badge,{tone:a.tone,children:a.label})]}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:[e.class_name??"No class chosen yet"," · via ",e.source]}),(0,t.jsxs)("p",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-3",children:[(0,t.jsx)("span",{children:e.contact_name}),e.contact_email&&(0,t.jsxs)("a",{href:`mailto:${e.contact_email}`,className:"inline-flex items-center gap-1 hover:text-ink",children:[(0,t.jsx)(l.Mail,{className:"size-3","aria-hidden":!0}),e.contact_email]}),e.contact_phone&&(0,t.jsxs)("a",{href:`tel:${e.contact_phone}`,className:"inline-flex items-center gap-1 hover:text-ink",children:[(0,t.jsx)(s.Phone,{className:"size-3","aria-hidden":!0}),e.contact_phone]})]})]}),e.next_action_on&&!["enrolled","closed_lost"].includes(e.stage)&&(0,t.jsxs)("span",{className:(0,m.cn)("inline-flex shrink-0 items-center gap-1 text-[12.5px]",i?"font-medium text-critical":"text-ink-3"),children:[(0,t.jsx)(n,{className:"size-3.5","aria-hidden":!0}),i?"Overdue":"Next"," ",(0,c.dateShort)(e.next_action_on)]})]})},e.id)})})]})]})})}],63564)},29074,e=>{"use strict";let t=`
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
 order by s.last_name, s.first_name`,s=`
select w.id, w.position, w.status, s.first_name, s.last_name, f.name as family_name
  from waitlist_entry w
  join student s on s.id = w.student_id
  join family f on f.id = s.family_id
 where w.class_id = $1 and w.status in ('waiting','offered') and w.deleted_at is null
 order by w.position`,l=`
select
  count(*)::int as total,
  count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int as booked,
  count(*) filter (where stage in ('trial_attended','enrolled'))::int as attended,
  count(*) filter (where stage = 'enrolled')::int as converted,
  count(*) filter (where stage = 'closed_lost')::int as lost
from enquiry where deleted_at is null`,n=`
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
   e.next_action_on nulls last`,i=`
select t.id, t.name, t.starts_on, t.ends_on, t.status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null order by t.starts_on desc`,d=`
select l.id, l.name, l.address_line1, l.city, l.postcode,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`;e.s(["CLASSES",0,t,"CLASS_ROSTER",0,a,"CLASS_WAITLIST",0,s,"ENQUIRIES",0,n,"FUNNEL",0,l,"LOCATIONS",0,d,"TERMS",0,i])}]);