(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},66606,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(22016),i=e.i(43531),l=e.i(63059),n=e.i(77326),r=e.i(13927),d=e.i(17658),o=e.i(45060),c=e.i(54616),m=e.i(12598),u=e.i(74886),_=e.i(7233),h=e.i(37727),f=e.i(30224),p=e.i(31502),y=e.i(19654),b=e.i(5866),x=e.i(29074),g=e.i(35632),w=e.i(75379);let $=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],v=[1,2,3,4,5,6,0],k=1,j=(e="",t=1)=>({key:k++,name:"",style:e,day:t,start:"17:00",minutes:"60",places:"16",price:""});function S({onDone:e}){let a,{session:i}=(0,p.useSession)(),l=(0,m.useQueryClient)(),n=(0,r.useRows)(["ft-locations"],x.LOCATIONS),o=(0,r.useRows)(["open-terms"],x.OPEN_TERMS),E=(0,r.useRows)(["styles"],x.STYLES),[N,T]=s.useState(""),[A,C]=s.useState(""),[L,R]=s.useState(""),[I,O]=s.useState(""),[F,U]=s.useState(""),[P,q]=s.useState(""),[D,M]=s.useState(()=>[j()]),[Y,B]=s.useState(null),W=!!(n.data&&o.data&&E.data),z=W&&0===n.data.length,V=W&&0===o.data.length,Q=W&&0===E.data.length;s.useEffect(()=>{!P&&o.data?.[0]&&q(o.data[0].id)},[o.data,P]),s.useEffect(()=>{let e=E.data?.[0]?.id;e&&M(t=>t.map(t=>t.style?t:{...t,style:e}))},[E.data]);let K=(e,t)=>M(s=>s.map(s=>s.key===e?{...s,...t}:s)),H=D.filter(e=>e.name.trim()),G=e=>e.name.trim().length<2?"a name":/^\d{2}:\d{2}$/.test(e.start)?Number(e.minutes)>0?Number(e.places)>0?e.price.trim()&&null==(0,w.toMinor)(e.price)?"a price like 54 or 54.50":null:"the number of places":"its length in minutes":"a start time",X=W?z&&N.trim().length<2?"Say where you teach.":V&&(A.trim().length<2||!L||!I||I<L)?"Add the term’s name, first day and last day.":Q&&F.trim().length<2?"Name a dance style.":0===H.length?"Type at least one class.":(a=H.find(G))?`“${a.name||"A class"}” needs ${G(a)}.`:null:null,J=(0,c.useMutation)({mutationFn:()=>(0,f.runAs)(i,async e=>{let t=z?(await e(g.CREATE_LOCATION,[N.trim(),"","","","",""]))[0].id:n.data[0].id,s=V?(await e(g.CREATE_TERM,[A.trim(),L,I,"published"]))[0].id:P,a=Q?(await e(g.CREATE_STYLE,[F.trim(),"violet"]))[0].id:null,i=0;for(let l of H){let[n]=await e(x.CREATE_CLASS,[s,a??l.style,null,t,null,null,l.name.trim(),l.day,l.start,Number(l.minutes),Number(l.places),null,null,(0,w.toMinor)(l.price||"0")??0,!0,!0,"public","term",null,null,"","",!1]);if(!n)throw Error("A class could not be added to that term.");let[r]=await e(x.GENERATE_SESSIONS,[n.id]);i+=r?.made??0}return{classes:H.length,sessions:i}}),onSuccess:t=>{B(t),l.invalidateQueries({queryKey:["db"]}),e?.()}}),Z=s.useRef(null);return((0,y.useFirstErrorInView)(Z,J.error),W)?Y?(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)(d.StatusLine,{title:`${Y.classes} class${1===Y.classes?"":"es"} on your timetable`,detail:`${Y.sessions} sessions were made for the term. Assign teachers, ages and descriptions from Classes when you are ready.`}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,t.jsx)(d.Button,{size:"sm",onClick:()=>{B(null),M([j(E.data?.[0]?.id??"")])},children:"Add more"}),(0,t.jsx)("a",{href:"/schedule",className:"inline-flex min-h-9 items-center text-[0.8438rem] font-semibold text-accent-text hover:underline",children:"See the week"})]})]}):(0,t.jsxs)("div",{ref:Z,className:"space-y-5",children:[(z||V||Q)&&(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)("p",{className:"text-[0.875rem] text-ink-2",children:"First, the few things every class needs. You can add rooms, more places and breaks later in School settings."}),z&&(0,t.jsx)(d.Field,{label:"Where do you teach?",htmlFor:"ft-place",required:!0,hint:"The hall or studio’s name.",children:(0,t.jsx)(d.Input,{id:"ft-place",value:N,onChange:e=>T(e.target.value),placeholder:"St Mary’s Hall"})}),V&&(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3",children:[(0,t.jsx)(d.Field,{label:"Term",htmlFor:"ft-term",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-term",value:A,onChange:e=>C(e.target.value),placeholder:"Spring term"})}),(0,t.jsx)(d.Field,{label:"First day",htmlFor:"ft-from",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-from",type:"date",value:L,onChange:e=>R(e.target.value)})}),(0,t.jsx)(d.Field,{label:"Last day",htmlFor:"ft-to",required:!0,children:(0,t.jsx)(d.Input,{id:"ft-to",type:"date",value:I,onChange:e=>O(e.target.value)})})]}),V&&(0,t.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"The term is published straight away, so families see its classes. Add half-term breaks later; sessions in a break can be regenerated from the class."}),Q&&(0,t.jsx)(d.Field,{label:"Dance style",htmlFor:"ft-style",required:!0,hint:"Add more styles later.",children:(0,t.jsx)(d.Input,{id:"ft-style",value:F,onChange:e=>U(e.target.value),placeholder:"Ballet"})})]}),!V&&(o.data?.length??0)>1&&(0,t.jsx)(d.Field,{label:"Term",htmlFor:"ft-term-pick",children:(0,t.jsx)(d.Select,{id:"ft-term-pick",value:P,onChange:e=>q(e.target.value),children:o.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))})}),(0,t.jsx)("ol",{className:"space-y-3",children:D.map((e,s)=>(0,t.jsxs)("li",{className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_6rem_5rem_5rem_6rem]",children:[(0,t.jsx)(d.Field,{label:"Class",htmlFor:`ft-n-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-n-${e.key}`,value:e.name,placeholder:0===s?"Baby Ballet":"","aria-invalid":!!(J.isError&&e.name&&G(e))||void 0,onChange:t=>K(e.key,{name:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Day",htmlFor:`ft-d-${e.key}`,children:(0,t.jsx)(d.Select,{id:`ft-d-${e.key}`,value:String(e.day),onChange:t=>K(e.key,{day:Number(t.target.value)}),children:v.map(e=>(0,t.jsx)("option",{value:e,children:$[e]},e))})}),(0,t.jsx)(d.Field,{label:"Starts",htmlFor:`ft-s-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-s-${e.key}`,type:"time",value:e.start,onChange:t=>K(e.key,{start:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Minutes",htmlFor:`ft-m-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-m-${e.key}`,type:"number",inputMode:"numeric",min:15,step:5,value:e.minutes,onChange:t=>K(e.key,{minutes:t.target.value})})}),(0,t.jsx)(d.Field,{label:"Places",htmlFor:`ft-p-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-p-${e.key}`,type:"number",inputMode:"numeric",min:1,value:e.places,onChange:t=>K(e.key,{places:t.target.value})})}),(0,t.jsx)(d.Field,{label:"£ a term",htmlFor:`ft-c-${e.key}`,children:(0,t.jsx)(d.Input,{id:`ft-c-${e.key}`,inputMode:"decimal",value:e.price,placeholder:"54",onChange:t=>K(e.key,{price:t.target.value})})})]}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap items-center gap-2",children:[(E.data?.length??0)>1&&(0,t.jsx)(d.Select,{"aria-label":`Style of ${e.name||"this class"}`,value:e.style,className:"h-9 w-auto text-[0.8438rem]",onChange:t=>K(e.key,{style:t.target.value}),children:E.data.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))}),(0,t.jsxs)("label",{className:"flex items-center gap-1.5 text-[0.8125rem] text-ink-2",children:[(0,t.jsx)(u.Copy,{className:"size-3.5","aria-hidden":!0}),(0,t.jsxs)("select",{"aria-label":`Copy ${e.name||"this class"} to another day`,value:"",onChange:t=>{let s;""!==t.target.value&&(s=Number(t.target.value),M(t=>[...t,{...e,key:k++,day:s}]))},className:"h-9 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[0.8438rem] text-ink",children:[(0,t.jsx)("option",{value:"",children:"Copy to…"}),v.filter(t=>t!==e.day).map(e=>(0,t.jsx)("option",{value:e,children:$[e]},e))]})]}),D.length>1&&(0,t.jsxs)(d.Button,{size:"sm",variant:"ghost",className:"ml-auto","aria-label":`Remove ${e.name||"this row"}`,onClick:()=>M(t=>t.filter(t=>t.key!==e.key)),children:[(0,t.jsx)(h.X,{className:"size-4","aria-hidden":!0})," Remove"]})]})]},e.key))}),(0,t.jsxs)(d.Button,{size:"sm",onClick:()=>M(e=>[...e,j(e[e.length-1]?.style??E.data?.[0]?.id??"",e[e.length-1]?.day??1)]),children:[(0,t.jsx)(_.Plus,{className:"size-4","aria-hidden":!0})," Add a class"]}),null!=J.error&&((0,b.isPlanLimit)(J.error)?(0,t.jsx)(b.PlanLimitNotice,{error:J.error}):(0,t.jsx)(d.ErrorState,{error:J.error})),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-3 border-t border-line pt-3",children:[(0,t.jsx)(y.SaveErrorSummary,{error:J.error??void 0,reason:X}),(0,t.jsxs)(d.Button,{variant:"primary",disabled:!!X,loading:J.isPending,onClick:()=>J.mutate(),children:["Add ",H.length||""," class",1===H.length?"":"es"," to the timetable"]})]})]}):(0,t.jsx)(d.Skeleton,{className:"h-40"})}let E=[{beat:1,label:"Your school",steps:["studio","privacy"]},{beat:2,label:"Your brand",steps:["brand"]},{beat:3,label:"Safeguarding",steps:["dsl"]},{beat:4,label:"Places",steps:["locations"]},{beat:5,label:"Teaching",steps:["styles","frameworks","terms"]},{beat:6,label:"Teachers",steps:["staff"]},{beat:7,label:"Classes",steps:["classes"]},{beat:8,label:"Families and fees",steps:["families","discounts","payments"]}],N=[{key:"studio",title:"Studio details",blurb:"Name, timezone and how families reach you.",count:"select count(*)::int n from studio where contact_email is not null and deleted_at is null",href:"/studio",cta:"Studio settings"},{key:"brand",title:"Your style and brand",blurb:"Choose Classic or Urban, then add your logo and colours, so the app looks like yours to every family.",count:"select (brand_colour is not null or logo_url is not null)::int n from studio",href:"/account#brand",cta:"Choose a style"},{key:"privacy",title:"Privacy notice",blurb:"A link to your privacy notice, shown wherever families give their details.",count:"select (privacy_notice_url is not null)::int n from studio",href:"/studio",cta:"Add the link"},{key:"dsl",title:"Safeguarding lead",blurb:"Name your Designated Safeguarding Lead (and a deputy if you can), record the contact outside the school (your LADO), and record staff DBS checks. Until a lead is named, concerns come only to you.",count:"select (dsl_user_id is not null)::int n from studio",href:"/safeguarding",cta:"Name your lead"},{key:"locations",title:"Locations and rooms",blurb:"Where classes happen, and which room each uses.",count:"select count(*)::int n from location where deleted_at is null",href:"/studio#places",cta:"Add a location"},{key:"styles",title:"Dance styles and levels",blurb:"Ballet, tap, grades — how you group your teaching.",count:"select count(*)::int n from dance_style where deleted_at is null",href:"/studio#teaching",cta:"Add styles"},{key:"frameworks",title:"Skills and feedback phrases",blurb:"The skills you track for each style, and the quick phrases teachers use after class.",count:"select count(*)::int n from framework_skill where deleted_at is null",href:"/studio#teaching",cta:"Review skills"},{key:"terms",title:"Terms",blurb:"Term dates and half-term breaks, so sessions generate correctly.",count:"select count(*)::int n from term where deleted_at is null",href:"/studio#terms",cta:"Add a term"},{key:"staff",title:"Teachers",blurb:"Who teaches what. They get their own simplified app.",count:"select count(*)::int n from staff_member where deleted_at is null",href:"/people",cta:"Add teachers"},{key:"classes",title:"Classes",blurb:"Day, time, capacity and price. Sessions are generated for you.",count:"select count(*)::int n from class where deleted_at is null",href:"/onboarding#ob-timetable",cta:"Create classes"},{key:"families",title:"Families",blurb:"Import a spreadsheet you already keep, or add families one by one. Then invite them to the app.",count:"select count(*)::int n from family where deleted_at is null",href:"/people?import=1",cta:"Import or add families"},{key:"discounts",title:"Prices and discounts",blurb:"Sibling and multi-class discounts, bursaries, class packs for drop-ins, and whether families pay before they book.",count:"select count(*)::int n from discount_rule where enabled and deleted_at is null",href:"/studio#money",cta:"Set discounts"},{key:"payments",title:"Term billing",blurb:"Raise every family’s invoice for the term (or month) in one run, check them, then send. Card payments start once Stripe is connected on a hosted deployment.",count:"select count(*)::int n from billing_run",href:"/billing",cta:"Run term billing"}],T=[100,44,44,44,75,44,44,44];function A({beats:e}){let a,i,[l,n]=s.useState(!1);s.useEffect(()=>{let e=requestAnimationFrame(()=>n(!0));return()=>cancelAnimationFrame(e)},[]);let r=(a=e.filter(e=>e.complete).length,(i=e.find(e=>!e.complete))?`${a} of 8 counts full \xb7 ${i.label} next`:"A full count: everything is set up");return(0,t.jsxs)("div",{className:"mt-4",children:[(0,t.jsx)("ol",{"aria-label":`Setup count: ${r}`,className:"flex h-16 items-end gap-1.5",children:e.map((e,s)=>(0,t.jsxs)("li",{className:"flex h-full flex-col justify-end",style:{marginLeft:10*(4===s)},children:[(0,t.jsx)("span",{className:"sr-only",children:`Count ${e.beat}, ${e.label}: ${e.complete?"done":`${e.done} of ${e.total} done`}.`}),(0,t.jsx)("span",{"aria-hidden":!0,title:`${e.label} \xb7 ${e.done} of ${e.total}`,className:"relative block w-3 overflow-hidden rounded-[2px] bg-surface-3",style:{height:`${T[s]}%`},children:(0,t.jsx)("span",{className:"absolute inset-x-0 bottom-0 block bg-accent transition-[height] ease-[var(--ease-out)]",style:{height:l?`${100*e.fill}%`:0,transitionDuration:"calc(var(--beat) * 2)",transitionDelay:`${60*s}ms`,background:0===s&&e.complete?"var(--color-secondary, var(--color-accent))":void 0}})})]},e.beat))}),(0,t.jsx)("p",{"aria-hidden":!0,className:"mt-2 text-[0.8125rem] text-ink-3",children:r})]})}e.s(["default",0,function(){let e=(0,r.useRows)(["onboarding"],N.map(e=>`select '${e.key}' as key, n from (${e.count}) x`).join("\nunion all\n")),c=new Set((e.data??[]).filter(e=>e.n>0).map(e=>e.key)),m=(0,r.useRow)(["sample-data"],"select sample_data from studio where deleted_at is null limit 1"),[u,_]=s.useState(!1),h=N.filter(e=>c.has(e.key)).length,f=N.find(e=>!c.has(e.key));return(0,t.jsx)(n.Shell,{title:"Set up your school",subtitle:"Pick up wherever you left off",allow:["owner","admin"],children:(0,t.jsx)("div",{className:"mx-auto max-w-[1240px]",children:(0,t.jsxs)("div",{className:"max-w-2xl space-y-10",children:[(0,t.jsxs)("section",{"aria-labelledby":"ob-progress",className:"flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:items-end",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"label",children:"Progress"}),(0,t.jsxs)("p",{id:"ob-progress",className:"mt-1 flex items-baseline gap-2",children:[(0,t.jsx)("span",{className:"display-xl text-[length:min(4rem,22vw)]",children:e.data?h:"–"}),(0,t.jsxs)("span",{className:"text-[0.9375rem] text-ink-2",children:["of ",N.length," steps done"]})]}),e.data&&(0,t.jsx)(A,{beats:E.map(e=>{let t=e.steps.filter(e=>c.has(e)).length;return{beat:e.beat,label:e.label,done:t,total:e.steps.length,complete:t===e.steps.length,fill:t/e.steps.length}})})]}),(0,t.jsx)("div",{className:"min-w-0 flex-1 sm:pb-1",children:f?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("p",{className:"label text-accent-text",children:"Next"}),(0,t.jsx)("p",{className:"mt-1 font-display text-[1.375rem] font-[800] leading-tight [font-stretch:112%]",children:f.title}),(0,t.jsx)("p",{className:"mt-1 text-[0.875rem] text-ink-3",children:f.blurb}),(0,t.jsx)(a.default,{href:f.href,className:"mt-3 inline-block",children:(0,t.jsx)(d.Button,{variant:"primary",tabIndex:-1,children:f.cta})})]}):(0,t.jsx)("p",{className:"font-display text-[1.375rem] font-[800] leading-tight text-positive [font-stretch:112%]",children:"Everything is set up. You are live."})})]}),e.data&&(!c.has("classes")||u)&&(0,t.jsxs)("section",{"aria-labelledby":"ob-timetable",children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"ob-timetable",className:"section-title flex-1",children:"Your first timetable"}),(0,t.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:"Sessions are made for you"})]}),(0,t.jsx)("p",{className:"pb-4 pt-2 text-[0.875rem] text-ink-2",children:"Type your weekly classes here, all on one page. Use Copy to for a class that runs on more than one day."}),(0,t.jsx)(S,{})]}),e.data&&c.has("classes")&&!u&&(0,t.jsxs)("p",{className:"text-[0.875rem] text-ink-2",children:["Classes are on your timetable."," ",(0,t.jsx)("button",{className:"font-semibold text-accent-text hover:underline",onClick:()=>_(!0),children:"Add several more here"})," ","or one at a time from ",(0,t.jsx)(a.default,{href:"/classes",className:"font-semibold text-accent-text hover:underline",children:"Classes"}),"."]}),e.isLoading&&(0,t.jsx)(d.Skeleton,{className:"h-40"}),e.error&&(0,t.jsx)(d.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data&&(0,t.jsxs)("section",{"aria-labelledby":"ob-steps",children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"ob-steps",className:"section-title flex-1",children:"Every step"}),(0,t.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:"In order, but any order works"})]}),(0,t.jsx)("ol",{className:"divide-y divide-line",children:N.map((s,n)=>{let r=c.has(s.key),d=e.data.find(e=>e.key===s.key)?.n??0;return(0,t.jsxs)("li",{className:"grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 py-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,o.cn)("font-display text-[1.375rem] leading-none tnum",r?"text-ink-3":"text-ink"),children:r?(0,t.jsx)(i.Check,{className:"mt-0.5 size-5 text-positive",strokeWidth:2.4}):n+1}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[s.title,(0,t.jsx)("span",{className:"sr-only",children:r?" (done)":" (to do)"})]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[0.875rem] text-ink-3",children:s.blurb}),(r||"payments"===s.key)&&(0,t.jsxs)("span",{className:"mt-1 block text-[0.8125rem]",children:[r&&(0,t.jsxs)("span",{className:"font-semibold text-positive",children:["Done",d>1?` \xb7 ${d} added`:""]}),r&&"payments"===s.key&&(0,t.jsx)("span",{className:"text-ink-3",children:" · "}),"payments"===s.key&&(0,t.jsx)("span",{className:"text-ink-3",children:"Card payments need Stripe"})]})]}),(0,t.jsxs)(a.default,{href:s.href,className:"col-start-2 inline-flex min-h-10 shrink-0 items-center gap-0.5 justify-self-start sm:col-start-auto sm:justify-self-auto text-[0.8438rem] font-semibold text-accent-text hover:underline [@media(pointer:fine)]:min-h-0 [@media(pointer:fine)]:pt-0.5",children:[r?"Review":s.cta,(0,t.jsx)(l.ChevronRight,{className:"size-3.5","aria-hidden":!0})]})]},s.key)})})]}),m.data?.sample_data&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"This school was created with sample data so you can see how everything fits together. Starting fresh, every step would be empty and this page would walk you through them in order."})]})})})}],66606)},29074,e=>{"use strict";let t=`
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
       -- A planned move (UR-52): leaving on ended_on, or joining on started_on.
       case when e.moved_to is not null then e.ended_on end as leaving_on,
       (select c2.name from enrolment e2 join class c2 on c2.id = e2.class_id where e2.id = e.moved_to) as leaving_to,
       case when e.moved_from is not null and e.started_on > current_date then e.started_on end as joining_on,
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
returning id, position`,f=`
select c.id, c.name, app.class_enrolled_count(c.id) as enrolled, c.capacity
  from class c where c.deleted_at is null order by c.day_of_week, c.start_time`,p=`
select c.id, c.name, c.day_of_week, c.start_time, c.age_min, c.age_max, c.price_minor, c.pricing::text as pricing,
       c.capacity, app.class_free_places(c.id) as free
  from class c
 where c.deleted_at is null and c.id <> $1
   and c.term_id in (select t.id from term t where t.deleted_at is null and t.status <> 'archived')
 order by c.day_of_week, c.start_time`,y=`
select e.id as enrolment_id, c.id as class_id, c.name, c.day_of_week, c.start_time, c.price_minor, c.pricing::text as pricing,
       case when e.moved_to is not null then e.ended_on end as leaving_on,
       case when e.moved_from is not null and e.started_on > current_date then e.started_on end as joining_on
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
       (select waitlist_offer_days from studio s join class c on c.studio_id = s.id where c.id = $1) as offer_days`,$=`
select n.id, n.body, n.created_at, u.full_name as author
  from enquiry_note n left join user_account u on u.id = n.created_by
 where n.enquiry_id = $1 and n.deleted_at is null
 order by n.created_at desc, n.id`,v=`
update enquiry set stage = $2::enquiry_stage, updated_at = now(),
       next_action_on = $3::date
 where id = $1
returning id`,k=`
select t.id, t.name, t.starts_on, t.ends_on, current_date between t.starts_on and t.ends_on as current,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null and t.status <> 'archived' order by t.starts_on desc`,j=`
insert into enquiry (studio_id, contact_name, contact_phone, contact_email, child_name, child_dob,
                     interest_class_id, source, next_action_on, created_by)
select s.id, btrim($1), nullif(btrim($2), ''), nullif(lower(btrim($3)), ''), nullif(btrim($4), ''), $5::date,
       $6::uuid, $7, coalesce($8::date, current_date + 2), auth.uid()
  from studio s where s.deleted_at is null and app.is_admin(s.id) limit 1
returning id`,S=`
update class set level_note = nullif(btrim($2), ''), what_to_bring = nullif(btrim($3), ''), updated_at = now()
 where id = $1 returning id`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","ADD_ENQUIRY_NOTE",0,"select app.add_enquiry_note($1, $2, $3::date) as id","BOOK_TRIAL",0,"select app.book_trial($1, $2, $3::jsonb) as id","CANCEL_MOVE",0,"select app.cancel_class_move($1)","CLASSES",0,t,"CLASS_CANDIDATES",0,"select * from app.class_candidates($1) where not enrolled and not waiting","CLASS_FOR_EDIT",0,u,"CLASS_FREE",0,w,"CLASS_OPTIONS",0,f,"CLASS_PUBLIC_EXTRA",0,"select level_note, what_to_bring from class where id = $1","CLASS_ROSTER",0,s,"CLASS_SESSIONS_AHEAD",0,x,"CLASS_WAITLIST",0,a,"CLOSE_ENQUIRY",0,"select app.close_enquiry($1, $2) as ok","CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","COPY_CLASSES",0,"select app.copy_classes($1::uuid[], $2, $3) as r","CREATE_CLASS",0,c,"CREATE_ENQUIRY",0,j,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,l,"ENQUIRY_NOTES",0,$,"ENROL",0,_,"ENROLLABLE_STUDENTS",0,g,"FUNNEL",0,i,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,h,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","LOCATIONS",0,n,"MOVE_OPTIONS",0,p,"MOVE_PREVIEW",0,"select * from app.move_preview($1, $2, $3::date)","OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,o,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,r,"SET_CLASS_PUBLIC_EXTRA",0,S,"SET_ENQUIRY_FOLLOW_UP",0,"select app.set_enquiry_follow_up($1, $2::date) as ok","SET_ENQUIRY_STAGE",0,v,"STUDENT_PLACES",0,y,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,d,"TERM_TABS",0,k,"TRANSFER",0,"select app.transfer_enrolment($1, $2, $3, $4::date) as id","TRIALS",0,b,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,m,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])},35632,e=>{"use strict";let t=`
select l.id, l.name, l.address_line1, l.address_line2, l.city, l.postcode, l.notes,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,s=`
insert into location (studio_id, name, address_line1, address_line2, city, postcode, notes)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), nullif(btrim($6),'')
  from studio where deleted_at is null limit 1
returning id`,a=`
update location set name = $2, address_line1 = nullif(btrim($3),''),
       address_line2 = nullif(btrim($4),''), city = nullif(btrim($5),''),
       postcode = nullif(btrim($6),''), notes = nullif(btrim($7),''), updated_at = now()
 where id = $1 returning id`,i=`
select r.id, r.name, r.location_id, r.capacity, l.name as location,
       (select count(*)::int from class c where c.room_id = r.id and c.deleted_at is null) as classes
  from room r join location l on l.id = r.location_id
 where r.deleted_at is null order by l.name, r.name`,l=`
insert into room (studio_id, location_id, name, capacity)
select l.studio_id, l.id, $2, $3 from location l where l.id = $1
returning id`,n=`
update room set name = $2, capacity = $3, updated_at = now() where id = $1 returning id`,r=`
select t.id, t.name, t.starts_on, t.ends_on, t.status::text as status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes,
       (select count(*)::int from term_break b where b.term_id = t.id and b.deleted_at is null) as breaks
  from term t where t.deleted_at is null order by t.starts_on desc`,d=`
insert into term (studio_id, name, starts_on, ends_on, status)
select id, $1, $2::date, $3::date, $4::term_status
  from studio where deleted_at is null limit 1
returning id`,o=`
update term set name = $2, starts_on = $3::date, ends_on = $4::date,
       status = $5::term_status, updated_at = now()
 where id = $1 returning id`,c=`
select b.id, b.term_id, b.name, b.starts_on, b.ends_on
  from term_break b where b.deleted_at is null and b.term_id = $1
 order by b.starts_on`,m=`
insert into term_break (studio_id, term_id, name, starts_on, ends_on)
select t.studio_id, t.id, $2, $3::date, $4::date from term t where t.id = $1
returning id`,u=`
select s.id, s.name, s.colour, s.sort_order,
       (select count(*)::int from class c where c.dance_style_id = s.id and c.deleted_at is null) as classes
  from dance_style s where s.deleted_at is null order by s.sort_order, s.name`,_=`
insert into dance_style (studio_id, name, colour, sort_order)
select id, $1, $2, coalesce((select max(sort_order) + 1 from dance_style where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,h=`
update dance_style set name = $2, colour = $3, updated_at = now() where id = $1 returning id`,f=`
select lv.id, lv.name, lv.sort_order,
       (select count(*)::int from class c where c.level_id = lv.id and c.deleted_at is null) as classes
  from level lv where lv.deleted_at is null order by lv.sort_order, lv.name`,p=`
insert into level (studio_id, name, sort_order)
select id, $1, coalesce((select max(sort_order) + 1 from level where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,y=`
update level set name = $2, updated_at = now() where id = $1 returning id`,b=`
select id, name, timezone, currency, contact_email, contact_phone, onboarded_at, privacy_notice_url
  from studio where deleted_at is null limit 1`,x=`
update studio set name = $2, timezone = $3, contact_email = nullif(btrim($4),''),
       contact_phone = nullif(btrim($5),''), privacy_notice_url = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["BREAKS",0,c,"CREATE_BREAK",0,m,"CREATE_LEVEL",0,p,"CREATE_LOCATION",0,s,"CREATE_ROOM",0,l,"CREATE_STYLE",0,_,"CREATE_TERM",0,d,"LEVELS_FULL",0,f,"LOCATIONS_FULL",0,t,"RETIRE_SETUP",0,"select app.retire_setup($1, $2) as ok","ROOMS_FULL",0,i,"SET_WAITLIST_DAYS",0,"update studio set waitlist_offer_days = $2, updated_at = now() where id = $1 returning id","STUDIO",0,b,"STYLES_FULL",0,u,"TERMS_FULL",0,r,"UPDATE_LEVEL",0,y,"UPDATE_LOCATION",0,a,"UPDATE_ROOM",0,n,"UPDATE_STUDIO",0,x,"UPDATE_STYLE",0,h,"UPDATE_TERM",0,o,"WAITLIST_SETTING",0,"select id, waitlist_offer_days from studio where deleted_at is null limit 1"])}]);