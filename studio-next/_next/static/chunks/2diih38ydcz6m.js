(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72520,e=>{"use strict";let s=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,s],72520)},42009,e=>{"use strict";let s=(0,e.i(75254).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);e.s(["Award",0,s],42009)},64659,e=>{"use strict";let s=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,s],64659)},83086,e=>{"use strict";let s=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,s],83086)},12004,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(13927),r=e.i(30224),l=e.i(31502),d=e.i(17658),o=e.i(75379),c=e.i(45060);let u=`
select coalesce(sum(amount_minor), 0)::int as credit_minor from absence_credit
 where student_id = $1 and session_id = any($2::uuid[]) and status = 'active'`;function m({studentId:e,firstName:h,self:_=!1,onDone:p}){let{session:f}=(0,l.useSession)(),x=(0,i.useQueryClient)(),b=(0,n.useRows)(["absence-options",e],"select * from app.absence_options($1, 42)",[e]),[v,y]=t.useState(new Set),[j,g]=t.useState(""),[w,N]=t.useState(null),k=(0,a.useMutation)({mutationFn:async()=>(0,r.runAs)(f,async s=>{let t=await s("select app.report_absence($1, $2::uuid[], $3) as n",[e,[...v],j.trim()||null]),a=await s(u,[e,[...v]]);return{n:t[0]?.n??v.size,credit:Number(a[0]?.credit_minor??0)}}),onSuccess:e=>{N(e),x.invalidateQueries({queryKey:["db"]})}}),S=(0,a.useMutation)({mutationFn:async e=>(0,r.runAs)(f,s=>s("select app.withdraw_absence($1)",[e])),onSuccess:()=>x.invalidateQueries({queryKey:["db"]})});if(null!=w)return(0,s.jsxs)("div",{className:"py-2",children:[(0,s.jsx)(d.Notice,{word:"Done",tone:"positive",title:_?"Your teacher will see this on the register.":`${h}’s teacher will see this on the register.`,detail:`${1===w.n?"The class is":`${w.n} classes are`} marked “reported absent”. ${_?"Your family and the office have":"The office has"} a copy too. You can withdraw it here until the class starts.`}),w.credit>0&&(0,s.jsxs)("p",{className:"mt-3 text-[0.9062rem]",children:[(0,s.jsxs)("span",{className:"font-semibold",children:[(0,o.money)(w.credit)," credit added"]})," to ",_?"your family’s":"your"," account. It comes off the next invoice. Withdrawing the report takes it back."]}),(0,s.jsx)(d.Button,{className:"mt-4 w-full",variant:"primary",onClick:p,children:"Close"})]});let $=b.data??[],E=new Map;for(let e of $){let s=(0,o.dateLong)(e.starts_at);E.set(s,[...E.get(s)??[],e])}return(0,s.jsxs)("div",{className:"space-y-4",children:[b.isLoading&&(0,s.jsx)(d.Skeleton,{className:"h-32"}),null!=b.error&&(0,s.jsx)(d.ErrorState,{error:b.error}),b.data&&0===$.length&&(0,s.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:[_?"You have":`${h} has`," no classes in the next six weeks. For anything else, send the studio a message."]}),$.length>0&&(0,s.jsxs)("fieldset",{children:[(0,s.jsxs)("legend",{className:"text-[0.875rem] font-semibold",children:["Which classes",_?" can’t you make":` will ${h} miss`,"?"]}),(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Tick each class. For several days in a row, tick each one."}),(0,s.jsx)("ul",{className:"mt-2 max-h-[40dvh] divide-y divide-line overflow-y-auto border-y border-line",children:[...E.entries()].map(([e,t])=>(0,s.jsxs)("li",{className:"py-2",children:[(0,s.jsx)("p",{className:"text-[0.8125rem] font-semibold text-ink-3",children:e}),t.map(e=>e.report_id?(0,s.jsxs)("div",{className:"flex min-h-11 items-center gap-3",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1 text-[0.9062rem]",children:[(0,s.jsx)("span",{className:"tnum",children:(0,o.time)(e.starts_at)})," ",e.class_name,(0,s.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:["Reported absent",e.note?` — ${e.note}`:"",e.credit_minor?` \xb7 ${(0,o.money)(e.credit_minor)} credit added`:""]})]}),e.withdrawable&&(0,s.jsx)(d.Button,{size:"sm",variant:"ghost",loading:S.isPending&&S.variables===e.report_id,onClick:()=>S.mutate(e.report_id),children:"Withdraw"})]},e.session_id):(0,s.jsxs)("label",{className:"flex min-h-11 items-center gap-3 text-[0.9062rem]",children:[(0,s.jsx)("input",{type:"checkbox",checked:v.has(e.session_id),onChange:()=>{let s;return s=e.session_id,y(e=>{let t=new Set(e);return t.has(s)?t.delete(s):t.add(s),t})},className:"size-[18px] shrink-0 accent-[var(--color-accent)]"}),(0,s.jsxs)("span",{className:(0,c.cn)("min-w-0 flex-1"),children:[(0,s.jsx)("span",{className:"tnum",children:(0,o.time)(e.starts_at)})," ",e.class_name]})]},e.session_id))]},e))})]}),$.length>0&&(0,s.jsx)(d.Field,{label:"Anything the teacher should know",htmlFor:"absence-reason",hint:"Optional. The teacher and the office see this.",children:(0,s.jsx)(d.Input,{id:"absence-reason",value:j,onChange:e=>g(e.target.value),placeholder:"School trip, unwell, family holiday…"})}),k.isError&&(0,s.jsx)(d.ErrorState,{error:k.error}),S.isError&&(0,s.jsx)(d.ErrorState,{error:S.error}),(0,s.jsxs)("div",{className:"flex gap-2",children:[(0,s.jsx)(d.Button,{className:"flex-1",onClick:p,children:"Cancel"}),(0,s.jsx)(d.Button,{className:"flex-1",variant:"primary",loading:k.isPending,disabled:0===v.size,onClick:()=>k.mutate(),children:"Send"})]})]})}let h=`
select o.id, o.student_id, s.first_name, o.reason, o.expires_on,
       c.name || ', ' || to_char(cs.starts_at at time zone 'Europe/London', 'FMDy FMDD Mon') as from_label
  from makeup_offer o join student s on s.id = o.student_id
  join class_session cs on cs.id = o.from_session_id join class c on c.id = cs.class_id
 where o.status = 'open' and o.expires_on >= current_date
 order by o.created_at`;function _({o:e}){let{session:c}=(0,l.useSession)(),u=(0,i.useQueryClient)(),[m,h]=t.useState(!1),p=(0,n.useRows)(["makeup-options",e.id],"select * from app.makeup_options($1)",[e.id],{enabled:m}),f=(0,a.useMutation)({mutationFn:async s=>(0,r.runAs)(c,t=>t("select app.book_makeup($1, $2)",[e.id,s])),onSuccess:()=>u.invalidateQueries({queryKey:["db"]})}),x=(0,a.useMutation)({mutationFn:async()=>(0,r.runAs)(c,s=>s("select app.decline_makeup($1)",[e.id])),onSuccess:()=>u.invalidateQueries({queryKey:["db"]})});return(0,s.jsxs)("div",{className:"py-3",children:[(0,s.jsxs)("p",{className:"font-semibold",children:[e.first_name,": instead of ",e.from_label]}),(0,s.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:["cancelled"===e.reason?"The studio cancelled it.":"Reported absent."," Choose a class with space by ",(0,o.dateLong)(e.expires_on),"."]}),m?(0,s.jsxs)("div",{className:"mt-2",children:[p.isLoading&&(0,s.jsx)(d.Skeleton,{className:"h-16"}),p.data?.length===0&&(0,s.jsx)("p",{className:"text-[0.875rem] text-ink-2",children:"No suitable class has space before then. The office can help — send them a message."}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:p.data?.map(e=>(0,s.jsxs)("li",{className:"flex min-h-12 items-center gap-3 py-2",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1 text-[0.9062rem]",children:[(0,s.jsx)("span",{className:"block font-semibold",children:e.class_name}),(0,s.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[(0,o.dateLong)(e.starts_at)," · ",(0,o.time)(e.starts_at),e.location?` \xb7 ${e.location}`:""," · ",e.spaces," space",1===e.spaces?"":"s"]})]}),(0,s.jsx)(d.Button,{size:"sm",loading:f.isPending&&f.variables===e.session_id,onClick:()=>f.mutate(e.session_id),children:"Book"})]},e.session_id))}),f.isError&&(0,s.jsx)(d.ErrorState,{error:f.error})]}):(0,s.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,s.jsx)(d.Button,{size:"sm",variant:"primary",onClick:()=>h(!0),children:"See classes"}),(0,s.jsx)(d.Button,{size:"sm",variant:"ghost",loading:x.isPending,onClick:()=>x.mutate(),children:"No thanks"})]})]})}e.s(["AbsenceDialog",0,function({studentId:e,firstName:a,self:i,onClose:n}){return t.useEffect(()=>{let e=e=>{"Escape"===e.key&&n()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[n]),(0,s.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,s.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"absence-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,s.jsx)("h2",{id:"absence-title",className:"text-[1.0625rem] font-semibold tracking-tight",children:i?"I can’t make it":"Report an absence"}),!i&&(0,s.jsxs)("p",{className:"mb-3 mt-0.5 text-sm text-ink-2",children:["For ",a]}),i&&(0,s.jsx)("p",{className:"mb-3 mt-0.5 text-sm text-ink-2",children:"Your teacher, your family and the office are told."}),(0,s.jsx)(m,{studentId:e,firstName:a,self:i,onDone:n})]})})},"MakeUpOffers",0,function(){let e=(0,n.useRows)(["makeup-offers"],h);return e.data?.length?(0,s.jsxs)("section",{"aria-labelledby":"makeup-h",className:"space-y-3",children:[(0,s.jsx)("div",{className:"border-b-2 border-ink pb-2",children:(0,s.jsx)("h2",{id:"makeup-h",className:"section-title",children:"Make-up classes"})}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,s.jsx)("li",{children:(0,s.jsx)(_,{o:e})},e.id))})]}):null}])},40576,90676,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(65712),r=e.i(17658),l=e.i(13927),d=e.i(30224),o=e.i(31502),c=e.i(45060);let u=["photography","video","social_media"],m={photography:"Photos",video:"Video",social_media:"Social media and public use"},h={photography:"Photos taken in class or at shows, used by the school (noticeboards, records, programmes).",video:"Video recorded in class or at shows, for teaching and for families of the class.",social_media:"Photos or video on the school’s website, social media, posters or in the press."},_="select kind, granted, disputed, changed_at from app.consents($1)",p="select * from app.consent_history($1)",f="select app.set_consent($1, $2, $3, $4, coalesce($5::boolean, false))",x="select app.consent_now($1, 'video') as video_consent, app.consent_now($1, 'social_media') as social_consent";function b(e){return!0===e?"Given":!1===e?"Not given":"Not recorded"}let v="select * from app.consent_labels($1::uuid, $2::uuid)",y="select app.set_consent_label($1, $2, $3, $4)",j="select * from app.my_consents()";e.s(["BRIEF_CONSENTS",0,x,"CONSENTS",0,_,"CONSENT_EXPLAIN",0,h,"CONSENT_HISTORY",0,p,"CONSENT_KINDS",0,u,"CONSENT_LABEL",0,m,"CONSENT_LABELS",0,v,"MY_CONSENTS",0,j,"SET_CONSENT",0,f,"SET_CONSENT_LABEL",0,y,"consentWord",0,b],90676);var g=e.i(75379);function w(e){let s=(0,l.useRows)(["consent-labels",e??"mine"],v,[null,e??null],{staleTime:6e4}),a=t.useMemo(()=>new Map((s.data??[]).map(e=>[e.kind,e])),[s.data]);return{label:e=>a.get(e)?.label??m[e]??e,explain:e=>a.get(e)?.description??h[e]??""}}function N(e,s){let{session:t}=(0,o.useSession)(),n=(0,i.useQueryClient)();return(0,a.useMutation)({mutationFn:s=>(0,d.runAs)(t,t=>t(f,[e,s.kind,s.granted,s.note??null,s.paper??!1])),onSuccess:()=>{n.invalidateQueries({queryKey:["db"]}),s?.()}})}function k({studentId:e}){let t=(0,l.useRows)(["consent-history",e],p,[e]),a=w(e);return t.isLoading?(0,s.jsx)(r.Skeleton,{className:"h-10"}):t.data?.length?(0,s.jsx)("ol",{className:"divide-y divide-line text-[0.8438rem]",children:t.data.map((e,t)=>(0,s.jsxs)("li",{className:"py-1.5",children:[(0,s.jsxs)("span",{className:"font-medium",children:[a.label(e.kind),": ",e.granted?"given":"not given"]}),(0,s.jsxs)("span",{className:"text-ink-3",children:[" · ",(0,g.dateShort)(e.at)," ",(0,g.time)(e.at)," · ",e.by_name,"paper"===e.source?" (on paper)":""]}),e.note&&(0,s.jsx)("span",{className:"block text-ink-3",children:e.note})]},t))}):(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"No changes recorded yet."})}function S({studentId:e,name:a,onClose:i}){let[l,d]=t.useState("photography"),[o,c]=t.useState(""),[m,h]=t.useState(!0),[_,p]=t.useState(""),f=N(e,i),x=w(e);return(0,s.jsxs)(n.RecordSheet,{title:"Record consent",subtitle:`For ${a}`,onClose:i,saving:f.isPending,error:f.error,canSave:""!==o,saveLabel:"Record",onSave:()=>f.mutate({kind:l,granted:"yes"===o,note:_,paper:m}),children:[(0,s.jsx)("p",{className:"text-[0.8438rem] text-ink-2",children:"Recorded by the office, this becomes the family’s settled choice and replaces earlier ones. It is kept in the history with your name."}),(0,s.jsx)(r.Field,{label:"Consent for",htmlFor:"rc-kind",children:(0,s.jsx)(r.Select,{id:"rc-kind",value:l,onChange:e=>d(e.target.value),children:u.map(e=>(0,s.jsx)("option",{value:e,children:x.label(e)},e))})}),(0,s.jsx)(r.Field,{label:"The family’s choice",htmlFor:"rc-choice",required:!0,children:(0,s.jsxs)(r.Select,{id:"rc-choice",value:o,onChange:e=>c(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Choose"}),(0,s.jsx)("option",{value:"yes",children:"Given"}),(0,s.jsx)("option",{value:"no",children:"Not given"})]})}),(0,s.jsxs)("label",{className:"flex min-h-11 items-center gap-2.5 text-sm",children:[(0,s.jsx)("input",{type:"checkbox",className:"size-5 accent-[var(--color-accent)]",checked:m,onChange:e=>h(e.target.checked)}),"Given on a signed paper form"]}),(0,s.jsx)(r.Field,{label:"Note",htmlFor:"rc-note",hint:"For example, who signed and when.",children:(0,s.jsx)(r.Input,{id:"rc-note",value:_,onChange:e=>p(e.target.value)})})]})}let $={photography:"photo",video:"video",social_media:"social media and public use"};function E({studioId:e,row:l,onClose:c}){let{session:u}=(0,o.useSession)(),m=(0,i.useQueryClient)(),[_,p]=t.useState(l.label),[f,x]=t.useState(l.description),b=(0,a.useMutation)({mutationFn:s=>(0,d.runAs)(u,t=>t(y,[e,l.kind,s.label,s.desc])),onSuccess:()=>{m.invalidateQueries({queryKey:["db"]}),c()}});return(0,s.jsxs)(n.RecordSheet,{title:"Consent wording",subtitle:`Recorded as ${$[l.kind]} consent`,onClose:c,saving:b.isPending,error:b.error,canSave:_.trim().length>0,saveLabel:"Save",onSave:()=>b.mutate({label:_,desc:f.trim()===h[l.kind]?null:f}),children:[(0,s.jsx)(r.Field,{label:"Name",htmlFor:"cw-label",hint:"Short, as families would say it.",children:(0,s.jsx)(r.Input,{id:"cw-label",value:_,maxLength:60,onChange:e=>p(e.target.value)})}),(0,s.jsx)(r.Field,{label:"What it means",htmlFor:"cw-desc",hint:"One or two plain sentences.",children:(0,s.jsx)(r.Input,{id:"cw-desc",value:f,maxLength:400,onChange:e=>x(e.target.value)})}),l.renamed&&(0,s.jsx)(r.Button,{size:"sm",variant:"ghost",disabled:b.isPending,onClick:()=>b.mutate({label:"",desc:null}),children:"Use the standard wording"})]})}e.s(["BriefConsentLines",0,function({studentId:e,photo:t}){let a=(0,l.useRows)(["brief-consents",e],x,[e],{enabled:!!e}).data?.[0],i=w(e),n=e=>`No ${i.label(e).toLowerCase()}`,r=(e,t,a)=>(0,s.jsx)("li",{className:(0,c.cn)(!1===t?"font-semibold text-caution":null==t?"text-ink-2":"text-ink-3"),children:!0===t?`${e} allowed`:!1===t?a:`${e}: not recorded, so don’t`});return(0,s.jsxs)("ul",{"aria-label":"Consent",className:"mt-2 space-y-0.5 text-[0.8438rem]",children:[r(i.label("photography"),t,n("photography")),e&&a&&r(i.label("video"),a.video_consent,n("video")),e&&a&&r(i.label("social_media"),a.social_consent,n("social_media"))]})},"ConsentWording",0,function(){let e=(0,l.useRows)(["consent-studio"],"select id from studio where id in (select app.studio_ids()) limit 1").data?.[0],a=(0,l.useRows)(["consent-labels","studio",e?.id],v,[e?.id??null,null],{enabled:!!e}),[i,n]=t.useState(null);return(0,s.jsxs)("section",{className:"min-w-0",children:[(0,s.jsxs)("div",{className:"border-b-2 border-ink pb-2",children:[(0,s.jsx)("div",{className:"flex min-h-9 items-center gap-3",children:(0,s.jsx)("h2",{className:"section-title min-w-0 flex-1",children:"Consent wording"})}),(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"What families, students and teachers see for each consent. Only the words change."})]}),a.isLoading&&(0,s.jsx)(r.Skeleton,{className:"mt-3 h-24"}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,s.jsxs)("li",{className:"flex items-start gap-3 py-3",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"block font-semibold",children:[e.label,e.renamed&&(0,s.jsx)("span",{className:"font-normal text-ink-3",children:" · renamed"})]}),(0,s.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:e.description})]}),(0,s.jsx)(r.Button,{size:"sm",variant:"ghost",onClick:()=>n(e),"aria-label":`Change wording for ${e.label}`,children:"Change"})]},e.kind))}),i&&e&&(0,s.jsx)(E,{studioId:e.id,row:i,onClose:()=>n(null)})]})},"FamilyConsents",0,function({studentId:e,name:a}){let i=(0,l.useRows)(["consents",e],_,[e]),[n,d]=t.useState(null),[o,u]=t.useState(!1),m=N(e),h=w(e);return(0,s.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,s.jsx)("dt",{className:"text-ink-3",children:"Consent"}),(0,s.jsxs)("dd",{className:"min-w-0",children:[i.isLoading&&(0,s.jsx)(r.Skeleton,{className:"h-16"}),(0,s.jsx)("ul",{className:"space-y-3",children:i.data?.map(e=>(0,s.jsxs)("li",{children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1",children:[(0,s.jsx)("span",{className:"font-medium",children:h.label(e.kind)}),(0,s.jsx)("span",{className:(0,c.cn)("text-[0.8438rem]",!1===e.granted?"font-semibold":e.granted?"":"text-ink-3"),children:!0===e.granted?"Allowed":!1===e.granted?"Not allowed":"Not recorded"})]}),(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:h.explain(e.kind)}),e.disputed&&(0,s.jsx)("p",{className:"mt-1 text-[0.8125rem] font-semibold text-caution",children:"Another parent or carer has said no, so the school treats this as not allowed until you agree."}),(0,s.jsxs)("div",{role:"group","aria-label":`${h.label(e.kind)} for ${a}`,className:"mt-1.5 flex gap-2",children:[(0,s.jsx)(r.Button,{size:"sm","aria-pressed":!0===e.granted,variant:!0===e.granted?"primary":void 0,disabled:m.isPending,onClick:()=>m.mutate({kind:e.kind,granted:!0},{onSuccess:()=>d(`${h.label(e.kind)}: allowed.`)}),children:"Allow"}),(0,s.jsx)(r.Button,{size:"sm","aria-pressed":!1===e.granted,variant:!1===e.granted?"primary":void 0,disabled:m.isPending,onClick:()=>m.mutate({kind:e.kind,granted:!1},{onSuccess:()=>d(`${h.label(e.kind)}: not allowed. This applies straight away.`)}),children:"Don’t allow"})]})]},e.kind))}),n&&(0,s.jsxs)("p",{role:"status",className:"mt-2 text-[0.8125rem] text-positive",children:[n," Teachers see the change next time they open ","you"===a?"your":`${a}’s`," details."]}),null!=m.error&&(0,s.jsx)(r.ErrorState,{error:m.error}),(0,s.jsx)("button",{className:"mt-2 text-[0.8125rem] font-semibold text-accent-text underline","aria-expanded":o,onClick:()=>u(e=>!e),children:o?"Hide changes":"See changes"}),o&&(0,s.jsx)("div",{className:"mt-1",children:(0,s.jsx)(k,{studentId:e})})]})]})},"InitialConsents",0,function({value:e,onChange:t}){let a=w();return(0,s.jsxs)("fieldset",{className:"space-y-2",children:[(0,s.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"Consent"}),(0,s.jsx)("div",{className:"grid gap-3 sm:grid-cols-3",children:u.map(i=>(0,s.jsx)(r.Field,{label:a.label(i),htmlFor:`ic-${i}`,children:(0,s.jsxs)(r.Select,{id:`ic-${i}`,value:void 0===e[i]?"":e[i]?"yes":"no",onChange:s=>{let a={...e};""===s.target.value?delete a[i]:a[i]="yes"===s.target.value,t(a)},children:[(0,s.jsx)("option",{value:"",children:"Not recorded"}),(0,s.jsx)("option",{value:"yes",children:"Given"}),(0,s.jsx)("option",{value:"no",children:"Not given"})]})},i))}),(0,s.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"Not recorded is treated as no consent. Families can change these in their app."})]})},"OfficeConsents",0,function({studentId:e,name:a}){let i=(0,l.useRows)(["consents",e],_,[e]),[n,d]=t.useState(!1),[o,u]=t.useState(!1),m=w(e);return(0,s.jsxs)("div",{className:"space-y-2",children:[i.isLoading&&(0,s.jsx)(r.Skeleton,{className:"h-12"}),(0,s.jsx)("dl",{className:"divide-y divide-line text-[0.875rem]",children:i.data?.map(e=>(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3 py-1.5",children:[(0,s.jsx)("dt",{className:"text-ink-2",children:m.label(e.kind)}),(0,s.jsxs)("dd",{className:(0,c.cn)("text-right",!1===e.granted&&"font-medium text-critical",null==e.granted&&"text-ink-3"),children:[!1===e.granted?"Not given":b(e.granted),e.disputed&&(0,s.jsx)("span",{className:"block text-[0.7812rem] font-semibold text-caution",children:"Guardians disagree — treated as not given"})]})]},e.kind))}),(0,s.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,s.jsx)(r.Button,{size:"sm",onClick:()=>d(!0),children:"Record consent"}),(0,s.jsx)(r.Button,{size:"sm",variant:"ghost","aria-expanded":o,onClick:()=>u(e=>!e),children:o?"Hide history":"History"})]}),o&&(0,s.jsx)(k,{studentId:e}),n&&(0,s.jsx)(S,{studentId:e,name:a,onClose:()=>d(!1)})]})},"StudentConsents",0,function(){let e=(0,l.useRows)(["my-consents"],j);if(!e.data?.length)return null;let t=e.data[0].ask;return(0,s.jsxs)("section",{"aria-labelledby":"consent-h",children:[(0,s.jsxs)("div",{className:"mb-1 border-b-2 border-ink pb-2",children:[(0,s.jsx)("h2",{id:"consent-h",className:"section-title",children:"Photos and filming"}),(0,s.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:["What the school may do. To change any of these, ask ",t,"."]})]}),(0,s.jsx)("dl",{className:"divide-y divide-line",children:e.data.map(e=>(0,s.jsxs)("div",{className:"py-2.5",children:[(0,s.jsxs)("div",{className:"flex items-baseline justify-between gap-3",children:[(0,s.jsx)("dt",{className:"font-medium",children:e.label}),(0,s.jsx)("dd",{className:(0,c.cn)("text-right text-[0.875rem]",!1===e.granted?"font-semibold":null==e.granted&&"text-ink-3"),children:!0===e.granted?"Allowed":!1===e.granted?"Not allowed":"Not recorded, so not allowed"})]}),(0,s.jsx)("dd",{className:"text-[0.8125rem] text-ink-3",children:e.description})]},e.kind))})]})}],40576)},95043,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598);let n=(0,e.i(75254).default)("timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);var r=e.i(13927),l=e.i(30224),d=e.i(31502),o=e.i(17658),c=e.i(45060),u=e.i(84315),m=e.i(75379);let h=(e,s)=>{let t=new Date;return t.setHours(0,0,0,0),t.setDate(t.getDate()-(t.getDay()+6)%7),(e??[]).find(e=>e.student_id===s&&new Date(e.week_start).getTime()>=t.getTime()-864e5)};e.s(["PracticeLog",0,function({studentId:e,who:_="you",bare:p}){let{session:f}=(0,d.useSession)(),x=(0,i.useQueryClient)(),b=(0,r.useRows)(["practice",e],u.MY_PRACTICE,[e]),v=(0,r.useRows)(["practice-weekly"],u.PRACTICE_WEEKLY,[1]),[y,j]=t.useState("15"),[g,w]=t.useState(""),[N,k]=t.useState(null),[S,$]=t.useState(null),E=(0,a.useMutation)({mutationFn:s=>(0,l.runAs)(f,t=>t(u.LOG_PRACTICE,[e,s.mins,s.what])),onMutate:()=>$(null),onSuccess:(s,t)=>{w(""),k((h(v.data,e)?.minutes??0)+t.mins),$(`Saved: ${t.mins} min${t.what.trim()?` of ${t.what.trim()}`:""}.`),x.invalidateQueries({queryKey:["db"]}).then(()=>k(null))}}),C=h(v.data,e),R=Math.max(C?.minutes??0,N??0);return(0,s.jsxs)("section",{"aria-label":p?`Practice, ${_}`:void 0,children:[(0,s.jsxs)("div",{className:(0,c.cn)("flex items-baseline gap-3",p?"pb-1":"mb-1 border-b-2 border-ink pb-2"),children:[(0,s.jsx)(p?"h3":"h2",{className:"section-title min-w-0 flex-1",children:"Practice"}),(0,s.jsx)("span",{className:"text-[0.8125rem] text-ink-3",children:"you"===_?"Your teacher sees the weekly total":"The teacher sees the weekly total"})]}),(0,s.jsxs)("p",{className:"flex items-baseline gap-2 pt-2",children:[(0,s.jsx)("span",{className:"stat-number text-[1.75rem] leading-none tnum",children:R}),(0,s.jsxs)("span",{className:"text-[0.875rem] text-ink-2",children:["min this week",R>0?"you"===_?". Well done.":`. Nice work, ${_}.`:""]})]}),(0,s.jsxs)("form",{className:"flex flex-wrap items-center gap-2 py-3",onSubmit:e=>{e.preventDefault(),E.mutate({mins:Number(y),what:g})},children:[(0,s.jsxs)("label",{className:"flex items-center gap-1.5 text-sm",children:[(0,s.jsx)(n,{className:"size-4 text-ink-3","aria-hidden":!0}),(0,s.jsx)(o.Input,{"aria-label":"Minutes",type:"number",min:1,max:600,className:"h-11 w-20",value:y,onChange:e=>j(e.target.value)})," min"]}),(0,s.jsx)(o.Input,{"aria-label":"What was practised",className:"h-11 min-w-0 flex-1 basis-40",placeholder:"e.g. shuffles, splits",maxLength:200,value:g,onChange:e=>w(e.target.value)}),(0,s.jsx)(o.Button,{type:"submit",variant:p?"secondary":"primary",className:"h-11",disabled:!(Number(y)>0),loading:E.isPending,children:"Log"})]}),(0,s.jsx)("p",{role:"status",className:"min-h-[1.25rem] pb-2 text-[0.8438rem] font-semibold text-positive",children:E.isPending?(0,s.jsx)("span",{className:"font-normal text-ink-3",children:"Saving…"}):S}),null!=E.error&&(0,s.jsx)("div",{className:"pb-3",children:(0,s.jsx)(o.ErrorState,{error:E.error})}),!!b.data?.length&&(0,s.jsx)("ul",{className:"divide-y divide-line border-t border-line text-[0.875rem]",children:b.data.slice(0,4).map(e=>(0,s.jsxs)("li",{className:"flex gap-3 py-2",children:[(0,s.jsx)("span",{className:"w-16 shrink-0 text-ink-3 tnum",children:(0,m.dateShort)(e.practised_on)}),(0,s.jsx)("span",{className:"min-w-0 flex-1 truncate",children:e.what??"Practice"}),(0,s.jsxs)("span",{className:"tnum",children:[e.minutes," min"]})]},e.id))})]})},"PracticeSummary",0,function({studentId:e}){let t=((0,r.useRows)(["practice-weekly-4"],u.PRACTICE_WEEKLY,[4]).data??[]).filter(s=>s.student_id===e);return t.length?(0,s.jsx)("ul",{className:"space-y-1 text-sm",children:t.map(e=>(0,s.jsxs)("li",{className:"flex justify-between",children:[(0,s.jsxs)("span",{children:["Week of ",(0,m.dateShort)(e.week_start)]}),(0,s.jsxs)("span",{className:"tnum",children:[e.minutes," min · ",e.sessions,"×"]})]},e.week_start))}):(0,s.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"No practice logged in the last four weeks."})}],95043)},27389,e=>{"use strict";let s=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,t="left join lateral app.resource_child_status(r.id) cs on r.shows_children",a=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${s},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${t}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,i=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at, f.edited_at,
       c.name as class_name, sm.display_name as author, ds.name as style, f.class_id,
       r.title as resource_title, r.url as resource_url,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,n=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       app.event_places(ev.id) as going,
       -- Each of my children on this event, with their own status (UR-50).
       -- RLS keeps event_participant to my own children.
       coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'student_id', s.id, 'first_name', s.first_name, 'status', p.status::text)
                                  order by s.date_of_birth)
                   from event_participant p join student s on s.id = p.student_id
                  where p.event_id = ev.id and p.deleted_at is null), '[]') as mine,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null
         order by array_position(array['confirmed','invited','requested','waitlisted','declined','withdrawn'], p.status::text) limit 1) as my_status,
       (select string_agg(s.first_name, ' & ' order by s.date_of_birth) from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null and p.status not in ('declined', 'withdrawn')) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('subject', cm.subject, 'body', cm.body, 'sent_at', cm.sent_at) order by cm.sent_at desc)
                   from communication cm where cm.event_id = ev.id and cm.deleted_at is null), '[]') as notices,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,r=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,l=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,d=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,o=`
select cs.id, c.id as class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, coalesce(sr.name, r.name) as room, l.name as location,
       coalesce(cover.display_name, st.display_name) as teacher,
       'class' as entry_kind
  from class_session cs
  join class c on c.id = cs.class_id
  join enrolment e on e.class_id = c.id and e.status = 'active' and e.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
union all
select ev.id, null::uuid, ev.title, ev.starts_at, ev.ends_at, 'scheduled',
       ev.kind::text, 'indigo', null, ev.venue, sm.display_name, 'event'
  from studio_event ev
  join event_participant p on p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at >= $1::timestamptz and ev.starts_at < $2::timestamptz
 order by starts_at`,c=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,u=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at, r.session_id, r.action,
       (select name from class where id = r.class_id) as class_name,
       r.student_id, s.first_name || ' ' || s.last_name as student_name,
       r.family_id, f.name as family_name,
       coalesce(u.full_name, (select g.full_name from guardian g where g.family_id = r.family_id
                                and g.deleted_at is null order by g.is_primary desc limit 1)) as guardian_name,
       coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.first_name || ' ' || c.last_name)
                                  order by c.date_of_birth)
                   from student c where c.family_id = r.family_id and c.deleted_at is null), '[]'::jsonb) as children
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
  left join user_account u on u.id = r.raised_by
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by (r.kind = 'medical_update') desc, r.created_at`,m=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,h=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,_=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,p=`
select c.id, c.name, c.description,
       ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, asst.display_name as assistant,
       r.name as room, l.name as location,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       t.name as term_name,
       (c.id in (select app.teacher_class_ids())) as i_teach
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member asst on asst.id = c.assistant_id
  left join room r on r.id = c.room_id
  left join location l on l.id = c.location_id
  left join term t on t.id = c.term_id
 where c.id = $1 and c.deleted_at is null`,f=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url,
       r.duration_sec, r.storage_path, r.created_at,
       f.file_name, f.mime_type, f.size_bytes, ${s},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${t}
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,x=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by,
                      shows_children, for_all_staff)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid(),
       coalesce($10::boolean, false), coalesce($11::boolean, false)
  from class c where c.id = $1
returning id, studio_id`,b=`
with kids as (
  select e.student_id as id, true as in_class from enrolment e
   where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
  union
  select rc.student_id, false from resource_child rc where rc.resource_id = $2::uuid
)
select s.id, s.first_name || ' ' || s.last_name as name,
       bool_or(k.in_class) as in_class,
       exists (select 1 from resource_child rc where rc.resource_id = $2::uuid and rc.student_id = s.id) as named,
       app.consent_now(s.id, 'video') as video, app.consent_now(s.id, 'photography') as photo
  from kids k join student s on s.id = k.id and s.deleted_at is null
 group by s.id, s.first_name, s.last_name
 order by s.first_name, s.last_name`,v=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,y=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,j=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,g=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,w=`
select app.retire_resource($1) as ok`,N=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,y,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,_,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,g,"CLASS_CHILDREN_CONSENT",0,b,"CLASS_DETAIL",0,p,"CLASS_RESOURCES",0,f,"CLEAR_RESOURCE_CHILDREN",0,v,"CREATE_RESOURCE",0,x,"DECIDE_ENTRY",0,h,"DELETE_RESOURCE",0,w,"EVENTS",0,n,"MY_REQUESTS",0,l,"MY_TEACHING_CLASSES",0,N,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,m,"PENDING_REQUESTS",0,u,"RAISE_REQUEST",0,d,"REQUEST_PLACE",0,r,"RESOURCES",0,a,"STUDENT_FEEDBACK",0,i,"UPDATE_RESOURCE_MEDIA",0,j,"WRITE_FEEDBACK",0,c])}]);