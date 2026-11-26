(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,76057,e=>{"use strict";let t=(0,e.i(75254).default)("camera-off",[["path",{d:"M14.564 14.558a3 3 0 1 1-4.122-4.121",key:"1rnrzw"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175",key:"1x3arw"}],["path",{d:"M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344",key:"1i84u0"}]]);e.s(["CameraOff",0,t],76057)},68553,e=>{"use strict";let t=(0,e.i(75254).default)("camera",[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);e.s(["Camera",0,t],68553)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},40160,e=>{"use strict";let t=(0,e.i(75254).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],40160)},63488,e=>{"use strict";let t=(0,e.i(75254).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",0,t],63488)},88699,e=>{"use strict";let t=(0,e.i(75254).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],88699)},43432,e=>{"use strict";let t=(0,e.i(75254).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);e.s(["Phone",0,t],43432)},55436,e=>{"use strict";let t=(0,e.i(75254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,t],55436)},69074,e=>{"use strict";let t=(0,e.i(75254).default)("upload",[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]]);e.s(["Upload",0,t],69074)},23426,e=>{"use strict";let t=(0,e.i(75254).default)("user-round",[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]]);e.s(["UserRound",0,t],23426)},48848,e=>{e.v(t=>Promise.all(["static/chunks/0ms3pkvh1aqqo.js"].map(t=>e.l(t))).then(()=>t(39726)))},52547,e=>{"use strict";var t=e.i(43476),i=e.i(78894),a=e.i(61574),s=e.i(43432),n=e.i(68553),r=e.i(76057),l=e.i(23426),d=e.i(45060);e.s(["MedicalBrief",0,function({brief:e,layout:c="side"}){let o=[["Allergies",e.allergies],["Conditions",e.conditions],["Medication",e.medications]].filter(([,e])=>e&&e.trim()),m=e.emergency_contacts?.length?e.emergency_contacts:e.emergency_contact_phone?[{name:e.emergency_contact_name??"Emergency contact",relationship:null,phone:e.emergency_contact_phone}]:[];return(0,t.jsxs)("div",{className:(0,d.cn)("grid gap-3","side"===c&&"sm:grid-cols-2"),children:[(0,t.jsxs)("section",{"aria-label":"Medical",className:(0,d.cn)("rounded-[var(--radius-md)] border p-3",e.requires_alert?"border-critical/30 bg-critical-soft":e.has_medical_need?"border-caution/30 bg-caution-soft":"border-line bg-surface-2"),children:[(0,t.jsxs)("h3",{className:(0,d.cn)("flex items-center gap-1.5 text-[13px] font-semibold",e.requires_alert?"text-critical":e.has_medical_need?"text-caution":"text-ink-2"),children:[e.requires_alert?(0,t.jsx)(i.AlertTriangle,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(a.HeartPulse,{className:"size-4","aria-hidden":!0}),e.requires_alert?"Urgent medical alert":e.has_medical_need?"Medical information":"Medical"]}),!e.has_medical_need&&(0,t.jsx)("p",{className:"mt-1 text-[13px] text-ink-2",children:"Nothing recorded."}),o.length>0&&(0,t.jsx)("dl",{className:"mt-2 space-y-1.5 text-[13.5px]",children:o.map(([e,i])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3",children:e}),(0,t.jsx)("dd",{children:i})]},e))}),e.action_plan&&(0,t.jsxs)("div",{className:"mt-2 rounded-[var(--radius-sm,6px)] bg-surface/70 p-2.5",children:[(0,t.jsx)("p",{className:"text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3",children:"In an emergency"}),(0,t.jsx)("p",{className:"mt-0.5 text-[13.5px] font-medium",children:e.action_plan})]})]}),(0,t.jsxs)("section",{"aria-label":"Emergency contacts",className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsxs)("h3",{className:"flex items-center gap-1.5 text-[13px] font-semibold text-ink-2",children:[(0,t.jsx)(s.Phone,{className:"size-4","aria-hidden":!0})," Emergency contacts"]}),0===m.length&&(0,t.jsxs)("p",{className:"mt-1 flex items-center gap-1.5 text-[13px] text-caution",children:[(0,t.jsx)(i.AlertTriangle,{className:"size-3.5","aria-hidden":!0})," None recorded — tell the office."]}),(0,t.jsx)("ul",{className:"mt-1.5 space-y-1",children:m.map((e,i)=>(0,t.jsx)("li",{children:e.phone?(0,t.jsxs)("a",{href:`tel:${e.phone.replace(/\s+/g,"")}`,className:"flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-md)] px-2 -mx-2 hover:bg-surface-2",children:[(0,t.jsx)(l.UserRound,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block text-[13.5px] font-medium",children:[e.name,e.relationship?(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:[" · ",e.relationship]}):null]}),(0,t.jsx)("span",{className:"tnum block text-[13px] text-accent-text",children:e.phone})]}),(0,t.jsx)("span",{className:"text-[12px] font-medium text-accent-text",children:"Call"})]}):(0,t.jsx)("span",{className:"block py-2 text-[13.5px]",children:e.name})},i))}),null!==e.photo_consent&&void 0!==e.photo_consent&&(0,t.jsxs)("p",{className:(0,d.cn)("mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12.5px]",e.photo_consent?"text-ink-2":"font-medium text-caution"),children:[e.photo_consent?(0,t.jsx)(n.Camera,{className:"size-3.5","aria-hidden":!0}):(0,t.jsx)(r.CameraOff,{className:"size-3.5","aria-hidden":!0}),e.photo_consent?"Photos allowed":"No photos"]})]})]})},"MedicalMarker",0,function({brief:e,className:s}){return e.requires_alert?(0,t.jsx)(i.AlertTriangle,{className:(0,d.cn)("size-4 shrink-0 text-critical",s),role:"img","aria-label":"Urgent medical alert"}):e.has_medical_need?(0,t.jsx)(a.HeartPulse,{className:(0,d.cn)("size-4 shrink-0 text-caution",s),role:"img","aria-label":"Medical information recorded"}):null}])},56166,e=>{e.v(t=>Promise.all(["static/chunks/07646-1w_v3wj.js"].map(t=>e.l(t))).then(()=>t(52715)))},37253,e=>{"use strict";var t=e.i(43476),i=e.i(71645),a=e.i(54616),s=e.i(12598),n=e.i(51737),r=e.i(65712),l=e.i(17658),d=e.i(13927),c=e.i(30224),o=e.i(31502),m=e.i(18086),u=e.i(75379);e.s(["RaiseConcernSheet",0,function({student:e,onClose:s}){let{session:d}=(0,o.useSession)(),[u,h]=i.useState("wellbeing"),[_,f]=i.useState(""),[p,x]=i.useState(!1),[g,y]=i.useState(!1),b=(0,a.useMutation)({mutationFn:()=>(0,c.runAs)(d,t=>t(m.RAISE,[e.id,u,_,p])),onSuccess:()=>y(!0)});return g?(0,t.jsx)(r.RecordSheet,{title:"Concern recorded",onClose:s,onSave:s,saveLabel:"Done",children:(0,t.jsx)("p",{className:"text-sm text-ink-2",children:"The safeguarding lead and the owner have been told. You will not see it in the app again — that is deliberate. If a child is in immediate danger, call 999."})}):(0,t.jsxs)(r.RecordSheet,{title:"Raise a safeguarding concern",subtitle:`About ${e.first_name}`,onClose:s,saving:b.isPending,error:b.error,canSave:_.trim().length>=10,saveLabel:"Send to the safeguarding lead",onSave:()=>b.mutate(),children:[(0,t.jsxs)("p",{className:"flex gap-2 rounded-[var(--radius-md)] bg-critical-soft p-3 text-[13px]",children:[(0,t.jsx)(n.ShieldAlert,{className:"mt-0.5 size-4 shrink-0 text-critical","aria-hidden":!0}),"If a child is in immediate danger, call 999 first. Write what you saw or were told, in their words where you can. Do not investigate."]}),(0,t.jsx)(l.Field,{label:"What kind of concern",htmlFor:"rc-c",children:(0,t.jsx)(l.Select,{id:"rc-c",value:u,onChange:e=>h(e.target.value),children:m.CATEGORIES.map(([e,i])=>(0,t.jsx)("option",{value:e,children:i},e))})}),(0,t.jsx)(l.Field,{label:"What happened",htmlFor:"rc-s",required:!0,hint:"Facts, dates and times. Only the lead and the owner will read this.",children:(0,t.jsx)("textarea",{id:"rc-s",rows:6,value:_,onChange:e=>f(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm"})}),(0,t.jsxs)("label",{className:"flex items-center gap-2 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",className:"size-4 accent-[var(--accent)]",checked:p,onChange:e=>x(e.target.checked)}),"The child may be at risk today"]})]})},"RetentionCard",0,function({studioId:e}){let{session:n}=(0,o.useSession)(),r=(0,s.useQueryClient)(),h=(0,d.useRows)(["retention"],m.RETENTION).data?.[0],_=(0,d.useRows)(["retention-preview"],m.PREVIEW_RETENTION,[e]),[f,p]=i.useState({}),x={...h,...f},[g,y]=i.useState(null),b=(0,a.useMutation)({mutationFn:()=>(0,c.runAs)(n,e=>e(m.SET_RETENTION,[x.medical_months,x.personal_months,x.financial_months,x.prospect_days,x.concern_months||null])),onSuccess:()=>{p({}),r.invalidateQueries({queryKey:["db"]})}}),j=(0,a.useMutation)({mutationFn:async()=>(await (0,c.runAs)(n,t=>t(m.RUN_RETENTION,[e])))[0].n,onSuccess:e=>{y(`${e} change${1===e?"":"s"} made and recorded in the audit log.`),r.invalidateQueries({queryKey:["db"]})}});if(!h)return(0,t.jsx)(l.Card,{className:"p-4",children:(0,t.jsx)(l.Skeleton,{className:"h-24"})});let $=e=>(_.data??[]).filter(t=>t.step===e).length,k=$("medical"),v=$("anonymise"),w=$("prospect"),N=$("financial"),E=$("concern");return(0,t.jsxs)(l.Card,{children:[(0,t.jsx)(l.CardHeader,{title:"Keeping data",subtitle:"How long details are kept after a child stops coming, and for enquiries that went nowhere. Check these with your own adviser."}),(0,t.jsxs)("div",{className:"space-y-3 px-4 pb-4",children:[(0,t.jsxs)("div",{className:"grid gap-3 sm:grid-cols-3",children:[[["medical_months","Delete medical records after"],["personal_months","Anonymise the child after"],["financial_months","Keep invoices for"]].map(([e,i])=>(0,t.jsx)(l.Field,{label:i,htmlFor:`rt-${e}`,hint:"months",children:(0,t.jsx)(l.Input,{id:`rt-${e}`,type:"number",min:1,max:240,value:x[e],onChange:t=>p(i=>({...i,[e]:Number(t.target.value)}))})},e)),(0,t.jsx)(l.Field,{label:"Remove enquiries with no activity after",htmlFor:"rt-pd",hint:"days",children:(0,t.jsx)(l.Input,{id:"rt-pd",type:"number",min:30,max:730,value:x.prospect_days,onChange:e=>p(t=>({...t,prospect_days:Number(e.target.value)}))})}),(0,t.jsx)(l.Field,{label:"Delete closed safeguarding concerns after",htmlFor:"rt-cm",hint:"months — empty keeps them. Set from your safeguarding policy (often until the child is 25).",children:(0,t.jsx)(l.Input,{id:"rt-cm",type:"number",min:12,max:600,value:x.concern_months??"",placeholder:"Keep",onChange:e=>p(t=>({...t,concern_months:e.target.value?Number(e.target.value):null}))})})]}),Object.keys(f).length>0&&(0,t.jsx)(l.Button,{size:"sm",loading:b.isPending,onClick:()=>b.mutate(),children:"Save periods"}),null!=b.error&&(0,t.jsx)(l.ErrorState,{error:b.error}),(0,t.jsxs)("p",{className:"text-sm",children:["Due now: ",(0,t.jsx)("b",{children:k})," medical record",1===k?"":"s"," to delete, ",(0,t.jsx)("b",{children:v})," child",1===v?"":"ren"," to anonymise,"," ",(0,t.jsx)("b",{children:w})," old enquir",1===w?"y":"ies"," to remove, ",(0,t.jsx)("b",{children:N})," famil",1===N?"y":"ies"," to anonymise on invoices",h.concern_months?(0,t.jsxs)(t.Fragment,{children:[", ",(0,t.jsx)("b",{children:E})," closed concern",1===E?"":"s"," to delete"]}):"",".",h.last_run_at?` Last run ${(0,u.dateShort)(h.last_run_at)}.`:""]}),g&&(0,t.jsx)("p",{role:"status",className:"text-sm text-positive",children:g}),null!=j.error&&(0,t.jsx)(l.ErrorState,{error:j.error}),(0,t.jsx)(l.Button,{size:"sm",variant:"primary",disabled:!k&&!v&&!w&&!N&&!E,loading:j.isPending,onClick:()=>j.mutate(),children:"Apply now"})]})]})},"StaffChecks",0,function({staffId:e}){let{session:n}=(0,o.useSession)(),r=(0,s.useQueryClient)(),h=(0,d.useRows)(["staff-checks",e],m.CHECKS,[e]),[_,f]=i.useState({kind:"dbs",reference:"",checked:"",expires:""}),p=(0,a.useMutation)({mutationFn:()=>(0,c.runAs)(n,t=>t(m.ADD_CHECK,[e,_.kind,_.reference,_.checked,_.expires||null])),onSuccess:()=>{f({kind:"dbs",reference:"",checked:"",expires:""}),r.invalidateQueries({queryKey:["db"]})}});return(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("ul",{className:"space-y-1",children:[h.data?.map(e=>{let i;return(0,t.jsxs)("li",{className:"flex items-center justify-between gap-2 text-sm",children:[(0,t.jsxs)("span",{children:[m.CHECK_LABEL[e.kind],e.reference?` \xb7 ${e.reference}`:""," · ",(0,u.dateShort)(e.checked_on)]}),e.expires_on&&(0,t.jsxs)(l.Badge,{tone:(i=e.expires_on)&&new Date(i).getTime()<Date.now()+2592e6?"critical":"neutral",children:[new Date(e.expires_on)<new Date?"Expired":"Expires"," ",(0,u.dateShort)(e.expires_on)]})]},e.id)}),h.data?.length===0&&(0,t.jsx)("li",{className:"text-[13px] text-ink-3",children:"No checks recorded."})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsx)(l.Select,{"aria-label":"Kind of check",value:_.kind,onChange:e=>f({..._,kind:e.target.value}),children:Object.entries(m.CHECK_LABEL).map(([e,i])=>(0,t.jsx)("option",{value:e,children:i},e))}),(0,t.jsx)(l.Input,{"aria-label":"Certificate number",placeholder:"Certificate no.",value:_.reference,onChange:e=>f({..._,reference:e.target.value})}),(0,t.jsx)(l.Field,{label:"Checked on",htmlFor:`ck-d-${e}`,children:(0,t.jsx)(l.Input,{id:`ck-d-${e}`,type:"date",value:_.checked,onChange:e=>f({..._,checked:e.target.value})})}),(0,t.jsx)(l.Field,{label:"Expires",htmlFor:`ck-e-${e}`,children:(0,t.jsx)(l.Input,{id:`ck-e-${e}`,type:"date",value:_.expires,onChange:e=>f({..._,expires:e.target.value})})})]}),null!=p.error&&(0,t.jsx)(l.ErrorState,{error:p.error}),(0,t.jsx)(l.Button,{size:"sm",disabled:!_.checked,loading:p.isPending,onClick:()=>p.mutate(),children:"Add check"}),(0,t.jsx)("p",{className:"text-[12px] text-ink-3",children:"Only owners see these. You are told 30 days before anything expires."})]})}])},80505,e=>{"use strict";let t=/^-?\d+(\.\d+)?$/;function i(e){if(null==e)return"";let i=e instanceof Date?e.toISOString().slice(0,10):String(e);return/^[=+\-@\t\r]/.test(i)&&!t.test(i)&&(i=`'${i}`),/[",\n\r]/.test(i)?`"${i.replace(/"/g,'""')}"`:i}e.s(["downloadCsv",0,function(e,t,a){let s,n=new Blob(["\uFEFF"+([(s=a??(t[0]?Object.keys(t[0]):[])).map(e=>i(e.replace(/_/g," "))).join(","),...t.map(e=>s.map(t=>i(e[t])).join(","))].join("\r\n")+"\r\n")],{type:"text/csv;charset=utf-8"}),r=URL.createObjectURL(n),l=Object.assign(document.createElement("a"),{href:r,download:e});document.body.appendChild(l),l.click(),l.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3)},"parseCsv",0,function(e){let t=[],i=[],a="",s=!1,n=e.replace(/^﻿/,"");for(let e=0;e<n.length;e++){let r=n[e];s?'"'===r?'"'===n[e+1]?(a+='"',e++):s=!1:a+=r:'"'===r&&""===a?s=!0:","===r?(i.push(a),a=""):"\n"===r||"\r"===r?("\r"===r&&"\n"===n[e+1]&&e++,i.push(a),a="",i.some(e=>""!==e.trim())&&t.push(i),i=[]):a+=r}return i.push(a),i.some(e=>""!==e.trim())&&t.push(i),t}])},42268,e=>{"use strict";let t=`
select f.id, f.name, f.balance_minor,
       (select count(*)::int from student s where s.family_id = f.id and s.deleted_at is null) as children,
       (select count(*)::int from guardian g where g.family_id = f.id and g.deleted_at is null) as guardians,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_guardian,
       (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_email,
       (select g.phone from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as primary_phone,
       (select count(*)::int from payment p where p.family_id = f.id and p.deleted_at is null
         and p.failure_code is not null and p.succeeded_at is null) as failed_payments,
       (select string_agg(s.first_name, ', ' order by s.date_of_birth)
          from student s where s.family_id = f.id and s.deleted_at is null) as child_names
  from family f
 where f.deleted_at is null
 order by f.name`,i=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       s.family_id, f.name as family_name,
       (select count(*)::int from enrolment e
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as classes,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*), 0))::int
          from attendance_record ar where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       coalesce((select b.has_medical_need from student_safety_brief b where b.student_id = s.id), false) as has_need,
       (select cr.granted from consent_record cr
         where cr.student_id = s.id and cr.kind = 'photography' and cr.deleted_at is null) as photo_consent
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null
 order by s.last_name, s.first_name`,a=`
select f.id, f.name, f.address_line1, f.city, f.postcode, f.balance_minor, f.notes
  from family f where f.id = $1 and f.deleted_at is null`,s=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.is_primary, g.receives_billing,
       g.user_id is not null as has_login
  from guardian g where g.family_id = $1 and g.deleted_at is null
 order by g.is_primary desc, g.full_name`,n=`
select s.id, s.first_name, s.last_name, s.date_of_birth, s.joined_on,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names
  from student s where s.family_id = $1 and s.deleted_at is null
 order by s.date_of_birth`,r=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor
  from invoice i where i.family_id = $1 and i.deleted_at is null
 order by i.issued_on desc nulls last limit 10`,l=`
select cm.id, cm.subject, cm.body, cm.sent_at, cm.kind
  from communication cm where cm.family_id = $1 and cm.deleted_at is null
 order by cm.sent_at desc limit 10`,d=`
select student_id, allergies, conditions, medications, action_plan, requires_alert, has_medical_need,
       emergency_contact_name, emergency_contact_phone, emergency_contacts, photo_consent
  from student_safety_brief where student_id = $1`,c=`
insert into family (studio_id, name, address_line1, city, postcode, notes, created_by)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), auth.uid()
  from studio where deleted_at is null limit 1
returning id`,o=`
update family set name = $2, address_line1 = nullif(btrim($3),''),
       city = nullif(btrim($4),''), postcode = nullif(btrim($5),''),
       notes = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`,m=`
insert into guardian (studio_id, family_id, full_name, email, phone, relationship,
                      is_primary, receives_billing)
select f.studio_id, f.id, $2, nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, $7
  from family f where f.id = $1
returning id`,u=`
update guardian set full_name = $2, email = nullif(btrim($3),''),
       phone = nullif(btrim($4),''), relationship = nullif(btrim($5),''),
       is_primary = $6, receives_billing = $7, updated_at = now()
 where id = $1 returning id`,h=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, s.pronouns,
       s.school, s.joined_on, s.left_on, s.notes, s.family_id, f.name as family_name
  from student s join family f on f.id = s.family_id
 where s.id = $1 and s.deleted_at is null`,_=`
insert into student (studio_id, family_id, first_name, last_name, preferred_name,
                     date_of_birth, pronouns, school, joined_on, notes, created_by)
select f.studio_id, f.id, $2, $3, nullif(btrim($4),''), $5::date, nullif(btrim($6),''),
       nullif(btrim($7),''), coalesce($8::date, current_date), nullif(btrim($9),''), auth.uid()
  from family f where f.id = $1
returning id`,f=`
update student set first_name = $2, last_name = $3, preferred_name = nullif(btrim($4),''),
       date_of_birth = $5::date, pronouns = nullif(btrim($6),''),
       school = nullif(btrim($7),''), notes = nullif(btrim($8),''),
       left_on = $9::date, updated_at = now()
 where id = $1 returning id`,p=`
select m.id, m.allergies, m.conditions, m.medications, m.action_plan, m.requires_alert,
       m.doctor_name, m.doctor_phone, m.updated_at, u.full_name as updated_by_name
  from medical_record m
  left join user_account u on u.id = m.updated_by
 where m.student_id = $1 and m.deleted_at is null`,x=`
insert into medical_record (studio_id, student_id, allergies, conditions, medications,
                            action_plan, requires_alert, doctor_name, doctor_phone, updated_by)
select s.studio_id, s.id, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, nullif(btrim($7),''), nullif(btrim($8),''), auth.uid()
  from student s where s.id = $1
on conflict (student_id) do update
  set allergies = excluded.allergies, conditions = excluded.conditions,
      medications = excluded.medications, action_plan = excluded.action_plan,
      requires_alert = excluded.requires_alert, doctor_name = excluded.doctor_name,
      doctor_phone = excluded.doctor_phone, updated_by = excluded.updated_by,
      updated_at = now(), deleted_at = null
returning id`,g=`
select id, full_name, relationship, phone, priority
  from emergency_contact
 where student_id = $1 and deleted_at is null
 order by priority, full_name`,y=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif(btrim($3),''), $4,
       coalesce((select max(priority) + 1 from emergency_contact
                  where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1
returning id`,b=`
select sm.id, sm.display_name, sm.email, sm.colour, sm.status::text as status, sm.bio, sm.user_id,
       (select count(*)::int from class c
         where (c.teacher_id = sm.id or c.assistant_id = sm.id) and c.deleted_at is null) as classes
  from staff_member sm where sm.deleted_at is null
 order by sm.status, sm.display_name`,j=`
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`,$=`
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["CREATE_EMERGENCY",0,y,"CREATE_FAMILY",0,c,"CREATE_GUARDIAN",0,m,"CREATE_STAFF",0,j,"CREATE_STUDENT",0,_,"EMERGENCY_CONTACTS",0,g,"FAMILIES",0,t,"FAMILY_DETAIL",0,a,"FAMILY_GUARDIANS",0,s,"FAMILY_INVOICES",0,r,"FAMILY_MESSAGES",0,l,"FAMILY_STUDENTS",0,n,"MEDICAL",0,p,"REMOVE_EMERGENCY",0,"select app.soft_delete('emergency_contact', $1) as ok","REMOVE_GUARDIAN",0,"select app.soft_delete('guardian', $1) as ok","REMOVE_STAFF",0,"select app.soft_delete('staff_member', $1) as ok","SAVE_MEDICAL",0,x,"STAFF_FULL",0,b,"STUDENTS",0,i,"STUDENT_DETAIL",0,h,"STUDENT_SAFETY",0,d,"UPDATE_FAMILY",0,o,"UPDATE_GUARDIAN",0,u,"UPDATE_STAFF",0,$,"UPDATE_STUDENT",0,f])}]);