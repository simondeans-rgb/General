(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},66606,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(22016),i=e.i(43531),l=e.i(63059),n=e.i(77326),r=e.i(13927),d=e.i(17658),o=e.i(45060),c=e.i(54616),m=e.i(12598),u=e.i(74886),_=e.i(7233),h=e.i(37727),p=e.i(30224),f=e.i(31502),y=e.i(19654),b=e.i(5866),x=e.i(29074),g=e.i(35632),w=e.i(75379);let k=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],v=[1,2,3,4,5,6,0],j=1,$=(e="",t=1)=>({key:j++,name:"",style:e,day:t,start:"17:00",minutes:"60",places:"16",price:""});function S({onDone:e}){let a,{session:i}=(0,f.useSession)(),l=(0,m.useQueryClient)(),n=(0,r.useRows)(["ft-locations"],x.LOCATIONS),o=(0,r.useRows)(["open-terms"],x.OPEN_TERMS),N=(0,r.useRows)(["styles"],x.STYLES),[E,C]=s.useState(""),[A,T]=s.useState(""),[R,L]=s.useState(""),[I,F]=s.useState(""),[O,q]=s.useState(""),[P,B]=s.useState(""),[D,M]=s.useState(()=>[$()]),[U,z]=s.useState(null),Y=!!(n.data&&o.data&&N.data),W=Y&&0===n.data.length,Q=Y&&0===o.data.length,H=Y&&0===N.data.length;s.useEffect(()=>{!P&&o.data?.[0]&&B(o.data[0].id)},[o.data,P]),s.useEffect(()=>{let e=N.data?.[0]?.id;e&&M(t=>t.map(t=>t.style?t:{...t,style:e}))},[N.data]);let K=(e,t)=>M(s=>s.map(s=>s.key===e?{...s,...t}:s)),V=D.filter(e=>e.name.trim()),G=e=>e.name.trim().length<2?"a name":/^\d{2}:\d{2}$/.test(e.start)?Number(e.minutes)>0?Number(e.places)>0?e.price.trim()&&null==(0,w.toMinor)(e.price)?"a price like 54 or 54.50":null:"the number of places":"its length in minutes":"a start time",X=Y?W&&E.trim().length<2?"Say where you teach.":Q&&(A.trim().length<2||!R||!I||I<R)?"Add the term’s name, first day and last day.":H&&O.trim().length<2?"Name a dance style.":0===V.length?"Type at least one class.":(a=V.find(G))?`“${a.name||"A class"}” needs ${G(a)}.`:null:null,J=(0,c.useMutation)({mutationFn:()=>(0,p.runAs)(i,async e=>{let t=W?(await e(g.CREATE_LOCATION,[E.trim(),"","","","",""]))[0].id:n.data[0].id,s=Q?(await e(g.CREATE_TERM,[A.trim(),R,I,"published"]))[0].id:P,a=H?(await e(g.CREATE_STYLE,[O.trim(),"violet"]))[0].id:null,i=0;for(let l of V){let[n]=await e(x.CREATE_CLASS,[s,a??l.style,null,t,null,null,l.name.trim(),l.day,l.start,Number(l.minutes),Number(l.places),null,null,(0,w.toMinor)(l.price||"0")??0,!0,!0,"public","term",null,null,"","",!1]);if(!n)throw Error("A class could not be added to that term.");let[r]=await e(x.GENERATE_SESSIONS,[n.id]);i+=r?.made??0}return{classes:V.length,sessions:i}}),onSuccess:t=>{z(t),l.invalidateQueries({queryKey:["db"]}),e?.()}}),Z=s.useRef(null);return((0,y.useFirstErrorInView)(Z,J.error),Y)?U?(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)(d.Notice,{word:"Added",tone:"positive",title:`${U.classes} class${1===U.classes?"":"es"} on your timetable`,detail:`${U.sessions} sessions were made for the term. Assign teachers, ages and descriptions from Classes when you are ready.`}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,t.jsx)(d.Button,{size:"sm",onClick:()=>{z(null),M([$(N.data?.[0]?.id??"")])},children:"Add more"}),(0,t.jsx)("a",{href:"/schedule",className:"inline-flex min-h-9 items-center text-[0.8438rem] font-semibold text-accent-text hover:underline",children:"See the week"})]})]}):(0,t.jsxs)("div",{ref:Z,className:"space-y-5",children:[(W||Q||H)&&(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)("p",{className:"text-[0.875rem] text-ink-2",children:"First, the few things every class needs. You can add rooms, more places and breaks later in School settings."}),W&&(0,t.jsx)(d.Field,{label:"Where do you teach?",htmlFor:"ft-place",required:!0,hint:"The hall or studio’s name.",children:(0,t.jsx)(d.Input,{id:"ft-place",value:E,onChange:e=>C(e.target.value),placeholder:"St Mary’s Hall"})}),Q&&(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3",children:[(0,t.jsx)(d.Field,{label:"Term",htmlFor:"ft-term",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-term",value:A,onChange:e=>T(e.target.value),placeholder:"Spring term"})}),(0,t.jsx)(d.Field,{label:"First day",htmlFor:"ft-from",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-from",type:"date",value:R,onChange:e=>L(e.target.value)})}),(0,t.jsx)(d.Field,{label:"Last day",htmlFor:"ft-to",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-to",type:"date",value:I,onChange:e=>F(e.target.value)})})]}),Q&&(0,t.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"The term is published straight away, so families see its classes. Add half-term breaks later; sessions in a break can be regenerated from the class."}),H&&(0,t.jsx)(d.Field,{label:"Dance style",htmlFor:"ft-style",required:!0,hint:"Add more styles later.",children:(0,t.jsx)(d.Input,{id:"ft-style",value:O,onChange:e=>q(e.target.value),placeholder:"Ballet"})})]}),!Q&&(o.data?.length??0)>1&&(0,t.jsx)(d.Field,{label:"Term",htmlFor:"ft-term-pick",children:(0,t.jsx)(d.Select,{id:"ft-term-pick",value:P,onChange:e=>B(e.target.value),children:o.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))})}),(0,t.jsx)("ol",{className:"space-y-3",children:D.map((e,s)=>(0,t.jsxs)("li",{className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_6rem_5rem_5rem_6rem]",children:[(0,t.jsx)(d.Field,{label:"Class",htmlFor:`ft-n-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-n-${e.key}`,value:e.name,placeholder:0===s?"Baby Ballet":"","aria-invalid":!!(J.isError&&e.name&&G(e))||void 0,onChange:t=>K(e.key,{name:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Day",htmlFor:`ft-d-${e.key}`,children:(0,t.jsx)(d.Select,{id:`ft-d-${e.key}`,value:String(e.day),onChange:t=>K(e.key,{day:Number(t.target.value)}),children:v.map(e=>(0,t.jsx)("option",{value:e,children:k[e]},e))})}),(0,t.jsx)(d.Field,{label:"Starts",htmlFor:`ft-s-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-s-${e.key}`,type:"time",value:e.start,onChange:t=>K(e.key,{start:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Minutes",htmlFor:`ft-m-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-m-${e.key}`,type:"number",inputMode:"numeric",min:15,step:5,value:e.minutes,onChange:t=>K(e.key,{minutes:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Places",htmlFor:`ft-p-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-p-${e.key}`,type:"number",inputMode:"numeric",min:1,value:e.places,onChange:t=>K(e.key,{places:t.target.value})})}),(0,t.jsx)(d.Field,{label:"£ a term",htmlFor:`ft-c-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-c-${e.key}`,inputMode:"decimal",value:e.price,placeholder:"54",onChange:t=>K(e.key,{price:t.target.value})})})]}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap items-center gap-2",children:[(N.data?.length??0)>1&&(0,t.jsx)(d.Select,{"aria-label":`Style of ${e.name||"this class"}`,value:e.style,className:"h-9 w-auto text-[0.8438rem]",onChange:t=>K(e.key,{style:t.target.value}),children:N.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))}),(0,t.jsxs)("label",{className:"flex items-center gap-1.5 text-[0.8125rem] text-ink-2",children:[(0,t.jsx)(u.Copy,{className:"size-3.5","aria-hidden":!0}),(0,t.jsxs)("select",{"aria-label":`Copy ${e.name||"this class"} to another day`,value:"",onChange:t=>{let s;""!==t.target.value&&(s=Number(t.target.value),M(t=>[...t,{...e,key:j++,day:s}]))},className:"h-9 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[0.8438rem] text-ink",children:[(0,t.jsx)("option",{value:"",children:"Copy to…"}),v.filter(t=>t!==e.day).map(e=>(0,t.jsx)("option",{value:e,children:k[e]},e))]})]}),D.length>1&&(0,t.jsxs)(d.Button,{size:"sm",variant:"ghost",className:"ml-auto","aria-label":`Remove ${e.name||"this row"}`,onClick:()=>M(t=>t.filter(t=>t.key!==e.key)),children:[(0,t.jsx)(h.X,{className:"size-4","aria-hidden":!0})," Remove"]})]})]},e.key))}),(0,t.jsxs)(d.Button,{size:"sm",onClick:()=>M(e=>[...e,$(e[e.length-1]?.style??N.data?.[0]?.id??"",e[e.length-1]?.day??1)]),children:[(0,t.jsx)(_.Plus,{className:"size-4","aria-hidden":!0})," Add a class"]}),null!=J.error&&((0,b.isPlanLimit)(J.error)?(0,t.jsx)(b.PlanLimitNotice,{error:J.error}):(0,t.jsx)(d.ErrorState,{error:J.error})),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-3 border-t border-line pt-3",children:[(0,t.jsx)(y.SaveErrorSummary,{error:J.error??void 0,reason:X}),(0,t.jsxs)(d.Button,{variant:"primary",disabled:!!X,loading:J.isPending,onClick:()=>J.mutate(),children:["Add ",V.length||""," class",1===V.length?"":"es"," to the timetable"]})]})]}):(0,t.jsx)(d.Skeleton,{className:"h-40"})}let N=[{key:"studio",title:"Studio details",blurb:"Name, timezone and how families reach you.",count:"select count(*)::int n from studio where contact_email is not null and deleted_at is null",href:"/studio",cta:"Studio settings"},{key:"brand",title:"Your style and brand",blurb:"Choose Classic or Urban, then add your logo and colours, so the app looks like yours to every family.",count:"select (brand_colour is not null or logo_url is not null)::int n from studio",href:"/account#brand",cta:"Choose a style"},{key:"privacy",title:"Privacy notice",blurb:"A link to your privacy notice, shown wherever families give their details.",count:"select (privacy_notice_url is not null)::int n from studio",href:"/studio",cta:"Add the link"},{key:"dsl",title:"Safeguarding lead",blurb:"Name who reads safeguarding concerns with you, and record staff DBS checks.",count:"select (dsl_user_id is not null)::int n from studio",href:"/safeguarding",cta:"Name your lead"},{key:"locations",title:"Locations and rooms",blurb:"Where classes happen, and which room each uses.",count:"select count(*)::int n from location where deleted_at is null",href:"/studio#places",cta:"Add a location"},{key:"styles",title:"Dance styles and levels",blurb:"Ballet, tap, grades — how you group your teaching.",count:"select count(*)::int n from dance_style where deleted_at is null",href:"/studio#teaching",cta:"Add styles"},{key:"frameworks",title:"Skills and feedback phrases",blurb:"The skills you track for each style, and the quick phrases teachers use after class.",count:"select count(*)::int n from framework_skill where deleted_at is null",href:"/studio#teaching",cta:"Review skills"},{key:"terms",title:"Terms",blurb:"Term dates and half-term breaks, so sessions generate correctly.",count:"select count(*)::int n from term where deleted_at is null",href:"/studio#terms",cta:"Add a term"},{key:"staff",title:"Teachers",blurb:"Who teaches what. They get their own simplified app.",count:"select count(*)::int n from staff_member where deleted_at is null",href:"/people",cta:"Add teachers"},{key:"classes",title:"Classes",blurb:"Day, time, capacity and price. Sessions are generated for you.",count:"select count(*)::int n from class where deleted_at is null",href:"/onboarding#ob-timetable",cta:"Create classes"},{key:"families",title:"Families",blurb:"Import a spreadsheet you already keep, or add families one by one. Then invite them to the app.",count:"select count(*)::int n from family where deleted_at is null",href:"/people?import=1",cta:"Import or add families"},{key:"discounts",title:"Prices and discounts",blurb:"Sibling and multi-class discounts, bursaries, class packs for drop-ins, and whether families pay before they book.",count:"select count(*)::int n from discount_rule where enabled and deleted_at is null",href:"/studio#money",cta:"Set discounts"},{key:"payments",title:"Term billing",blurb:"Raise every family’s invoice for the term (or month) in one run, check them, then send. Card payments start once Stripe is connected on a hosted deployment.",count:"select count(*)::int n from billing_run",href:"/billing",cta:"Run term billing"}];e.s(["default",0,function(){let e=(0,r.useRows)(["onboarding"],N.map(e=>`select '${e.key}' as key, n from (${e.count}) x`).join("\nunion all\n")),c=new Set((e.data??[]).filter(e=>e.n>0).map(e=>e.key)),m=(0,r.useRow)(["sample-data"],"select sample_data from studio where deleted_at is null limit 1"),[u,_]=s.useState(!1),h=N.filter(e=>c.has(e.key)).length,p=N.find(e=>!c.has(e.key));return(0,t.jsx)(n.Shell,{title:"Set up your school",subtitle:"Pick up wherever you left off",allow:["owner","admin"],children:(0,t.jsx)("div",{className:"mx-auto max-w-[1240px]",children:(0,t.jsxs)("div",{className:"max-w-2xl space-y-10",children:[(0,t.jsxs)("section",{"aria-labelledby":"ob-progress",className:"flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:items-end",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"label",children:"Progress"}),(0,t.jsxs)("p",{id:"ob-progress",className:"mt-1 flex items-baseline gap-2",children:[(0,t.jsx)("span",{className:"display-xl text-[length:min(4rem,22vw)]",children:e.data?h:"–"}),(0,t.jsxs)("span",{className:"text-[0.9375rem] text-ink-2",children:["of ",N.length," steps done"]})]}),(0,t.jsx)(d.Beats,{value:h,max:N.length,size:"lg",label:`${h} of ${N.length} steps done`,className:"mt-3"})]}),(0,t.jsx)("div",{className:"min-w-0 flex-1 sm:pb-1",children:p?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("p",{className:"label text-accent-text",children:"Next"}),(0,t.jsx)("p",{className:"mt-1 font-display text-[1.375rem] font-[800] leading-tight [font-stretch:112%]",children:p.title}),(0,t.jsx)("p",{className:"mt-1 text-[0.875rem] text-ink-3",children:p.blurb}),(0,t.jsx)(a.default,{href:p.href,className:"mt-3 inline-block",children:(0,t.jsx)(d.Button,{variant:"primary",tabIndex:-1,children:p.cta})})]}):(0,t.jsx)("p",{className:"font-display text-[1.375rem] font-[800] leading-tight text-positive [font-stretch:112%]",children:"Everything is set up. You are live."})})]}),e.data&&(!c.has("classes")||u)&&(0,t.jsxs)("section",{"aria-labelledby":"ob-timetable",children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"ob-timetable",className:"section-title flex-1",children:"Your first timetable"}),(0,t.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:"Sessions are made for you"})]}),(0,t.jsx)("p",{className:"pb-4 pt-2 text-[0.875rem] text-ink-2",children:"Type your weekly classes here, all on one page. Use Copy to for a class that runs on more than one day."}),(0,t.jsx)(S,{})]}),e.data&&c.has("classes")&&!u&&(0,t.jsxs)("p",{className:"text-[0.875rem] text-ink-2",children:["Classes are on your timetable."," ",(0,t.jsx)("button",{className:"font-semibold text-accent-text hover:underline",onClick:()=>_(!0),children:"Add several more here"})," ","or one at a time from ",(0,t.jsx)(a.default,{href:"/classes",className:"font-semibold text-accent-text hover:underline",children:"Classes"}),"."]}),e.isLoading&&(0,t.jsx)(d.Skeleton,{className:"h-40"}),e.error&&(0,t.jsx)(d.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data&&(0,t.jsxs)("section",{"aria-labelledby":"ob-steps",children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"ob-steps",className:"section-title flex-1",children:"Every step"}),(0,t.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:"In order, but any order works"})]}),(0,t.jsx)("ol",{className:"divide-y divide-line",children:N.map((s,n)=>{let r=c.has(s.key),d=e.data.find(e=>e.key===s.key)?.n??0;return(0,t.jsxs)("li",{className:"grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 py-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,o.cn)("font-display text-[1.375rem] leading-none tnum",r?"text-ink-3":"text-ink"),children:r?(0,t.jsx)(i.Check,{className:"mt-0.5 size-5 text-positive",strokeWidth:2.4}):n+1}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[s.title,(0,t.jsx)("span",{className:"sr-only",children:r?" (done)":" (to do)"})]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[0.875rem] text-ink-3",children:s.blurb}),(r||"payments"===s.key)&&(0,t.jsxs)("span",{className:"mt-1 block text-[0.8125rem]",children:[r&&(0,t.jsxs)("span",{className:"font-semibold text-positive",children:["Done",d>1?` \xb7 ${d} added`:""]}),r&&"payments"===s.key&&(0,t.jsx)("span",{className:"text-ink-3",children:" · "}),"payments"===s.key&&(0,t.jsx)("span",{className:"text-ink-3",children:"Card payments need Stripe"})]})]}),(0,t.jsxs)(a.default,{href:s.href,className:"col-start-2 inline-flex min-h-10 shrink-0 items-center gap-0.5 justify-self-start sm:col-start-auto sm:justify-self-auto text-[0.8438rem] font-semibold text-accent-text hover:underline [@media(pointer:fine)]:min-h-0 [@media(pointer:fine)]:pt-0.5",children:[r?"Review":s.cta,(0,t.jsx)(l.ChevronRight,{className:"size-3.5","aria-hidden":!0})]})]},s.key)})})]}),m.data?.sample_data&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"This school was created with sample data so you can see how everything fits together. Starting fresh, every step would be empty and this page would walk you through them in order."})]})})})}],66606)},48848,e=>{e.v(t=>Promise.all(["static/chunks/3e350uomau313.js"].map(t=>e.l(t))).then(()=>t(39726)))},56166,e=>{e.v(t=>Promise.all(["static/chunks/19j66g2zifw2h.js"].map(t=>e.l(t))).then(()=>t(52715)))},29074,e=>{"use strict";let t=`
select c.id, c.name, ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, l.name as location, r.name as room,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity,0))::int as pct,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.term_id, c.pricing::text as pricing,
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
 order by c.day_of_week, c.start_time`,s=`
select s.id, e.id as enrolment_id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
       f.name as family_name, f.id as family_id,
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
 order by s.last_name, s.first_name`,a=`
select w.id, (row_number() over (order by w.position))::int as position, w.status, w.offer_expires_at,
       s.first_name, s.last_name, s.date_of_birth, f.name as family_name
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
       c.name as class_name, ds.colour, e.interest_class_id, e.student_id, e.closed_reason,
       exists (select 1 from trial t where t.enquiry_id = e.id and t.deleted_at is null
                 and t.status in ('requested','booked')) as live_trial,
       (select cs.starts_at from trial t join class_session cs on cs.id = t.session_id
         where t.enquiry_id = e.id and t.deleted_at is null and t.status in ('requested','booked')
         order by cs.starts_at limit 1) as trial_starts_at
  from enquiry e
  left join class c on c.id = e.interest_class_id
  left join dance_style ds on ds.id = c.dance_style_id
 where e.deleted_at is null
 order by
   array_position(array['trial_attended','follow_up','trial_booked','trial_requested',
                        'enquiry','trial_missed','enrolled','closed_lost']::text[], e.stage::text),
   e.next_action_on nulls last`,n=`
select l.id, l.name, l.address_line1, l.city, l.postcode,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,r=`select r.id, r.name, r.location_id, r.capacity, l.name as location
                            from room r join location l on l.id = r.location_id
                           where r.deleted_at is null order by l.name, r.name`,d=`select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`,o=`select id, name, starts_on, ends_on from term
                            where deleted_at is null and status <> 'archived'
                            order by starts_on desc`,c=`
insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id,
                   teacher_id, name, day_of_week, start_time, duration_min, capacity,
                   age_min, age_max, price_minor, pricing, trials_enabled, waitlist_enabled,
                   visibility, trial_price_minor, assistant_id, prerequisites,
                   description, trial_needs_approval)
select t.studio_id, t.id, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11,
       $12, $13, $14, $18::pricing_model, $15, $16, $17::class_visibility,
       $19, $20, nullif(btrim($21), ''), nullif(btrim($22), ''), $23
  from term t where t.id = $1
returning id`,m=`
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, pricing = $18::pricing_model,
                 trial_price_minor = $19, assistant_id = $20, prerequisites = nullif(btrim($21), ''),
                 description = nullif(btrim($22), ''), trial_needs_approval = $23, updated_at = now()
 where id = $1
returning id`,u=`
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility, c.pricing::text as pricing, c.trial_price_minor,
       c.assistant_id, c.prerequisites, c.description, c.trial_needs_approval,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`,_=`
insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
select c.studio_id, c.id, $2, 'active', coalesce($3::date, current_date),
       nullif(btrim($4),''), auth.uid()
  from class c where c.id = $1
returning id`,h=`
insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
select c.studio_id, c.id, $2, 'waiting', 0, nullif(btrim($3),'')
  from class c where c.id = $1
returning id, position`,p=`
select c.id, c.name, app.class_enrolled_count(c.id) as enrolled, c.capacity
  from class c where c.deleted_at is null order by c.day_of_week, c.start_time`,f=`
select c.id, c.name, c.day_of_week, c.start_time, c.age_min, c.age_max, c.price_minor, c.pricing::text as pricing,
       c.capacity, app.class_free_places(c.id) as free
  from class c
 where c.deleted_at is null and c.id <> $1
   and c.term_id in (select t.id from term t where t.deleted_at is null and t.status <> 'archived')
 order by c.day_of_week, c.start_time`,y=`
select e.id as enrolment_id, c.id as class_id, c.name, c.day_of_week, c.start_time, c.price_minor, c.pricing::text as pricing
  from enrolment e join class c on c.id = e.class_id
 where e.student_id = $1 and e.status = 'active' and e.deleted_at is null
 order by c.day_of_week, c.start_time`,b=`
select t.id, t.status::text as status, cs.starts_at, c.name as class_name,
       case when s.id is null then null
            else s.first_name || ' ' || s.last_name end as student_name,
       s.id as student_id, e.contact_name, t.enquiry_id
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join student s on s.id = t.student_id
  left join enquiry e on e.id = t.enquiry_id
 where t.deleted_at is null
 order by (t.status in ('requested','booked')) desc, cs.starts_at nulls last`,x=`
select cs.id, cs.starts_at
  from class_session cs
 where cs.class_id = $1 and cs.deleted_at is null
   and cs.starts_at > now() and cs.status = 'scheduled'
 order by cs.starts_at limit 8`,g=`
select s.id, s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null and s.left_on is null
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.class_id = $1
                      and e.status = 'active' and e.deleted_at is null)
 order by s.last_name, s.first_name`,w=`
select app.class_free_places($1) as free, app.class_live_offers($1) as offers,
       (select waitlist_offer_days from studio s join class c on c.studio_id = s.id where c.id = $1) as offer_days`,k=`
update enquiry set stage = $2::enquiry_stage, updated_at = now(),
       next_action_on = $3::date
 where id = $1
returning id`,v=`
select t.id, t.name, t.starts_on, t.ends_on, current_date between t.starts_on and t.ends_on as current,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null and t.status <> 'archived' order by t.starts_on desc`,j=`
insert into enquiry (studio_id, contact_name, contact_phone, contact_email, child_name, child_dob,
                     interest_class_id, source, next_action_on, created_by)
select s.id, btrim($1), nullif(btrim($2), ''), nullif(lower(btrim($3)), ''), nullif(btrim($4), ''), $5::date,
       $6::uuid, $7, coalesce($8::date, current_date + 2), auth.uid()
  from studio s where s.deleted_at is null and app.is_admin(s.id) limit 1
returning id`,$=`
update class set level_note = nullif(btrim($2), ''), what_to_bring = nullif(btrim($3), ''), updated_at = now()
 where id = $1 returning id`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","BOOK_TRIAL",0,"select app.book_trial($1, $2, $3::jsonb) as id","CLASSES",0,t,"CLASS_CANDIDATES",0,"select * from app.class_candidates($1) where not enrolled and not waiting","CLASS_FOR_EDIT",0,u,"CLASS_FREE",0,w,"CLASS_OPTIONS",0,p,"CLASS_PUBLIC_EXTRA",0,"select level_note, what_to_bring from class where id = $1","CLASS_ROSTER",0,s,"CLASS_SESSIONS_AHEAD",0,x,"CLASS_WAITLIST",0,a,"CLOSE_ENQUIRY",0,"select app.close_enquiry($1, $2) as ok","CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","COPY_CLASSES",0,"select app.copy_classes($1::uuid[], $2, $3) as r","CREATE_CLASS",0,c,"CREATE_ENQUIRY",0,j,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,l,"ENROL",0,_,"ENROLLABLE_STUDENTS",0,g,"FUNNEL",0,i,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,h,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","LOCATIONS",0,n,"MOVE_OPTIONS",0,f,"OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,o,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,r,"SET_CLASS_PUBLIC_EXTRA",0,$,"SET_ENQUIRY_STAGE",0,k,"STUDENT_PLACES",0,y,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,d,"TERM_TABS",0,v,"TRANSFER",0,"select app.transfer_enrolment($1, $2, $3) as id","TRIALS",0,b,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,m,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])}]);