(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48241,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-off",[["path",{d:"M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18",key:"16swn3"}],["path",{d:"M21 15.5V6a2 2 0 0 0-2-2H9.5",key:"yhw86o"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M3 10h7",key:"1wap6i"}],["path",{d:"M21 10h-5.5",key:"quycpq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);e.s(["CalendarOff",0,t],48241)},74886,e=>{"use strict";let t=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,t],74886)},88699,e=>{"use strict";let t=(0,e.i(75254).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],88699)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},67240,e=>{"use strict";let t=(0,e.i(75254).default)("rotate-ccw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);e.s(["RotateCcw",0,t],67240)},63238,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(17658),l=e.i(85351),d=e.i(13927),r=e.i(30224),o=e.i(31502),c=e.i(50293),m=e.i(45060),_=e.i(75379);e.s(["AbsenceCreditSettings",0,function(){let{session:e}=(0,o.useSession)(),m=(0,a.useQueryClient)(),_=(0,d.useRows)(["absence-credit-setting"],c.ABSENCE_CREDIT_SETTING).data?.[0],u=e?.role==="owner",[p,h]=i.useState(null),[f,x]=i.useState(null),b=(0,s.useMutation)({mutationFn:t=>(0,r.runAs)(e,e=>e(c.SET_ABSENCE_CREDIT,[_.id,t.mode,t.fixed])),onSuccess:()=>{m.invalidateQueries({queryKey:["db"]}),h(null),x(null)}});if(!_)return null;let g=p??_.absence_credit,y=f??String(_.absence_credit_fixed_minor/100),v=Math.max(0,Math.round(100*Number(y))),N=g!==_.absence_credit||"fixed"===g&&v!==_.absence_credit_fixed_minor,S="cancelled_and_absence"===_.makeup_policy;return(0,t.jsxs)(l.SettingsSection,{children:[(0,t.jsx)(l.SettingsHead,{title:"Credit for reported absences",subtitle:"When a family tells you in advance that a child will miss a class"}),(0,t.jsxs)("div",{className:"space-y-3 pt-3 text-[0.9062rem]",children:[(0,t.jsxs)("label",{className:"grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center",children:[(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"font-semibold",children:"Credit on their account"}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:"Once per child per class, for term and monthly classes. It is taken back if they withdraw the report before the class."})]}),(0,t.jsxs)(n.Select,{"aria-label":"Credit for reported absences",value:g,disabled:!u,onChange:e=>h(e.target.value),children:[(0,t.jsx)("option",{value:"off",children:"No credit"}),(0,t.jsx)("option",{value:"session",children:"The class’s per-session price"}),(0,t.jsx)("option",{value:"fixed",children:"A fixed amount"})]})]}),"fixed"===g&&(0,t.jsxs)("label",{className:"flex flex-wrap items-center gap-2 text-[0.8125rem]",children:["Amount £",(0,t.jsx)(n.Input,{"aria-label":"Fixed credit in pounds",className:"w-24",type:"number",min:0,step:.5,value:y,disabled:!u,onChange:e=>x(e.target.value)}),(0,t.jsx)("span",{className:"text-ink-3",children:"never more than the class’s own price"})]}),S&&g===_.absence_credit&&"off"===g&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Make-ups are offered for reported absences (Registers settings). Choosing credit here replaces them: families get one or the other."}),S&&"off"!==g&&g!==_.absence_credit&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-caution",children:"Saving switches make-ups for reported absences off. Make-ups after a cancellation stay as they are."}),null!=b.error&&(0,t.jsx)(n.ErrorState,{error:b.error}),u?(0,t.jsx)(n.Button,{size:"sm",variant:"primary",disabled:!N,loading:b.isPending,onClick:()=>b.mutate({mode:g,fixed:"fixed"===g?v:_.absence_credit_fixed_minor}),children:"Save"}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the owner can change this."})]})]})},"AbsenceCredits",0,function(){let e=(0,d.useRows)(["absence-credits"],c.ABSENCE_CREDITS);if(!e.data?.length)return null;let i=e.data.filter(e=>"active"===e.status).reduce((e,t)=>e+Number(t.amount_minor),0);return(0,t.jsxs)("section",{"aria-labelledby":"absence-credit-h",className:"mt-10 min-w-0",children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"absence-credit-h",className:"section-title flex-1",children:"Credit for reported absences"}),(0,t.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-3",children:[(0,_.money)(i)," given, latest 50"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,t.jsxs)("li",{className:"grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2.5 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"block truncate font-semibold",children:[e.family_name," · ",e.child]}),(0,t.jsxs)("span",{className:"block truncate text-[0.8125rem] text-ink-3",children:[e.session_label," · reported ",(0,_.dateShort)(e.created_at)]})]}),(0,t.jsxs)("span",{className:"text-right",children:[(0,t.jsx)("span",{className:(0,m.cn)("tnum block","reversed"===e.status&&"text-ink-3 line-through"),children:(0,_.money)(e.amount_minor)}),"reversed"===e.status&&(0,t.jsx)("span",{className:"block text-[0.75rem] text-ink-3",children:"Taken back"})]})]},e.id))})]})}])},40576,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(65712),l=e.i(17658),d=e.i(13927),r=e.i(30224),o=e.i(31502),c=e.i(45060),m=e.i(90676),_=e.i(75379);function u(e){let t=(0,d.useRows)(["consent-labels",e??"mine"],m.CONSENT_LABELS,[null,e??null],{staleTime:6e4}),s=i.useMemo(()=>new Map((t.data??[]).map(e=>[e.kind,e])),[t.data]);return{label:e=>s.get(e)?.label??m.CONSENT_LABEL[e]??e,explain:e=>s.get(e)?.description??m.CONSENT_EXPLAIN[e]??""}}function p(e,t){let{session:i}=(0,o.useSession)(),n=(0,a.useQueryClient)();return(0,s.useMutation)({mutationFn:t=>(0,r.runAs)(i,i=>i(m.SET_CONSENT,[e,t.kind,t.granted,t.note??null,t.paper??!1])),onSuccess:()=>{n.invalidateQueries({queryKey:["db"]}),t?.()}})}function h({studentId:e}){let i=(0,d.useRows)(["consent-history",e],m.CONSENT_HISTORY,[e]),s=u(e);return i.isLoading?(0,t.jsx)(l.Skeleton,{className:"h-10"}):i.data?.length?(0,t.jsx)("ol",{className:"divide-y divide-line text-[0.8438rem]",children:i.data.map((e,i)=>(0,t.jsxs)("li",{className:"py-1.5",children:[(0,t.jsxs)("span",{className:"font-medium",children:[s.label(e.kind),": ",e.granted?"given":"not given"]}),(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",(0,_.dateShort)(e.at)," ",(0,_.time)(e.at)," · ",e.by_name,"paper"===e.source?" (on paper)":""]}),e.note&&(0,t.jsx)("span",{className:"block text-ink-3",children:e.note})]},i))}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"No changes recorded yet."})}function f({studentId:e,name:s,onClose:a}){let[d,r]=i.useState("photography"),[o,c]=i.useState(""),[_,h]=i.useState(!0),[x,b]=i.useState(""),g=p(e,a),y=u(e);return(0,t.jsxs)(n.RecordSheet,{title:"Record consent",subtitle:`For ${s}`,onClose:a,saving:g.isPending,error:g.error,canSave:""!==o,saveLabel:"Record",onSave:()=>g.mutate({kind:d,granted:"yes"===o,note:x,paper:_}),children:[(0,t.jsx)("p",{className:"text-[0.8438rem] text-ink-2",children:"Recorded by the office, this becomes the family’s settled choice and replaces earlier ones. It is kept in the history with your name."}),(0,t.jsx)(l.Field,{label:"Consent for",htmlFor:"rc-kind",children:(0,t.jsx)(l.Select,{id:"rc-kind",value:d,onChange:e=>r(e.target.value),children:m.CONSENT_KINDS.map(e=>(0,t.jsx)("option",{value:e,children:y.label(e)},e))})}),(0,t.jsx)(l.Field,{label:"The family’s choice",htmlFor:"rc-choice",required:!0,children:(0,t.jsxs)(l.Select,{id:"rc-choice",value:o,onChange:e=>c(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Choose"}),(0,t.jsx)("option",{value:"yes",children:"Given"}),(0,t.jsx)("option",{value:"no",children:"Not given"})]})}),(0,t.jsxs)("label",{className:"flex min-h-11 items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",className:"size-5 accent-[var(--color-accent)]",checked:_,onChange:e=>h(e.target.checked)}),"Given on a signed paper form"]}),(0,t.jsx)(l.Field,{label:"Note",htmlFor:"rc-note",hint:"For example, who signed and when.",children:(0,t.jsx)(l.Input,{id:"rc-note",value:x,onChange:e=>b(e.target.value)})})]})}let x={photography:"photo",video:"video",social_media:"social media and public use"};function b({studioId:e,row:d,onClose:c}){let{session:_}=(0,o.useSession)(),u=(0,a.useQueryClient)(),[p,h]=i.useState(d.label),[f,g]=i.useState(d.description),y=(0,s.useMutation)({mutationFn:t=>(0,r.runAs)(_,i=>i(m.SET_CONSENT_LABEL,[e,d.kind,t.label,t.desc])),onSuccess:()=>{u.invalidateQueries({queryKey:["db"]}),c()}});return(0,t.jsxs)(n.RecordSheet,{title:"Consent wording",subtitle:`Recorded as ${x[d.kind]} consent`,onClose:c,saving:y.isPending,error:y.error,canSave:p.trim().length>0,saveLabel:"Save",onSave:()=>y.mutate({label:p,desc:f.trim()===m.CONSENT_EXPLAIN[d.kind]?null:f}),children:[(0,t.jsx)(l.Field,{label:"Name",htmlFor:"cw-label",hint:"Short, as families would say it.",children:(0,t.jsx)(l.Input,{id:"cw-label",value:p,maxLength:60,onChange:e=>h(e.target.value)})}),(0,t.jsx)(l.Field,{label:"What it means",htmlFor:"cw-desc",hint:"One or two plain sentences.",children:(0,t.jsx)(l.Input,{id:"cw-desc",value:f,maxLength:400,onChange:e=>g(e.target.value)})}),d.renamed&&(0,t.jsx)(l.Button,{size:"sm",variant:"ghost",disabled:y.isPending,onClick:()=>y.mutate({label:"",desc:null}),children:"Use the standard wording"})]})}e.s(["BriefConsentLines",0,function({studentId:e,photo:i}){let s=(0,d.useRows)(["brief-consents",e],m.BRIEF_CONSENTS,[e],{enabled:!!e}).data?.[0],a=u(e),n=e=>`No ${a.label(e).toLowerCase()}`,l=(e,i,s)=>(0,t.jsx)("li",{className:(0,c.cn)(!1===i?"font-semibold text-caution":null==i?"text-ink-2":"text-ink-3"),children:!0===i?`${e} allowed`:!1===i?s:`${e}: not recorded, so don’t`});return(0,t.jsxs)("ul",{"aria-label":"Consent",className:"mt-2 space-y-0.5 text-[0.8438rem]",children:[l(a.label("photography"),i,n("photography")),e&&s&&l(a.label("video"),s.video_consent,n("video")),e&&s&&l(a.label("social_media"),s.social_consent,n("social_media"))]})},"ConsentWording",0,function(){let e=(0,d.useRows)(["consent-studio"],"select id from studio where id in (select app.studio_ids()) limit 1").data?.[0],s=(0,d.useRows)(["consent-labels","studio",e?.id],m.CONSENT_LABELS,[e?.id??null,null],{enabled:!!e}),[a,n]=i.useState(null);return(0,t.jsxs)("section",{className:"min-w-0",children:[(0,t.jsxs)("div",{className:"border-b-2 border-ink pb-2",children:[(0,t.jsx)("div",{className:"flex min-h-9 items-center gap-3",children:(0,t.jsx)("h2",{className:"section-title min-w-0 flex-1",children:"Consent wording"})}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"What families, students and teachers see for each consent. Only the words change."})]}),s.isLoading&&(0,t.jsx)(l.Skeleton,{className:"mt-3 h-24"}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.data?.map(e=>(0,t.jsxs)("li",{className:"flex items-start gap-3 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[e.label,e.renamed&&(0,t.jsx)("span",{className:"font-normal text-ink-3",children:" · renamed"})]}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:e.description})]}),(0,t.jsx)(l.Button,{size:"sm",variant:"ghost",onClick:()=>n(e),"aria-label":`Change wording for ${e.label}`,children:"Change"})]},e.kind))}),a&&e&&(0,t.jsx)(b,{studioId:e.id,row:a,onClose:()=>n(null)})]})},"FamilyConsents",0,function({studentId:e,name:s,summary:a=!1}){let n=(0,d.useRows)(["consents",e],m.CONSENTS,[e]),[r,o]=i.useState(null),[_,f]=i.useState(!1),[x,b]=i.useState(!a),g=p(e),y=u(e),v=i.useId();return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Consent"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[n.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-16"}),a&&n.data&&(0,t.jsxs)("p",{className:"flex flex-wrap items-baseline gap-x-3 gap-y-1",children:[(0,t.jsx)("span",{className:"min-w-0",children:n.data.map(e=>{let t;return`${y.label(e.kind)}: ${!0===(t=e.granted)?"allowed":!1===t?"not allowed":"not recorded"}`}).join(" · ")}),(0,t.jsx)("button",{type:"button","aria-expanded":x,"aria-controls":v,onClick:()=>b(e=>!e),className:"min-h-[32px] text-[0.8125rem] font-semibold text-accent-text underline",children:x?"Done":"Change"})]}),x&&(0,t.jsxs)("div",{id:v,children:[(0,t.jsx)("ul",{className:(0,c.cn)("space-y-3",a&&"mt-3 border-l-2 border-line pl-3"),children:n.data?.map(e=>(0,t.jsxs)("li",{children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1",children:[(0,t.jsx)("span",{className:"font-medium",children:y.label(e.kind)}),(0,t.jsx)("span",{className:(0,c.cn)("text-[0.8438rem]",!1===e.granted?"font-semibold":e.granted?"":"text-ink-3"),children:!0===e.granted?"Allowed":!1===e.granted?"Not allowed":"Not recorded"})]}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:y.explain(e.kind)}),e.disputed&&(0,t.jsx)("p",{className:"mt-1 text-[0.8125rem] font-semibold text-caution",children:"Another parent or carer has said no, so the school treats this as not allowed until you agree."}),(0,t.jsx)(l.Choice,{label:`${y.label(e.kind)} for ${s}`,size:"sm",className:"mt-1.5",disabled:g.isPending,value:!0===e.granted?"yes":!1===e.granted?"no":null,onChange:t=>"yes"===t?g.mutate({kind:e.kind,granted:!0},{onSuccess:()=>o(`${y.label(e.kind)}: allowed.`)}):g.mutate({kind:e.kind,granted:!1},{onSuccess:()=>o(`${y.label(e.kind)}: not allowed. This applies straight away.`)}),options:[{value:"yes",label:"Allow"},{value:"no",label:"Don’t allow"}]})]},e.kind))}),r&&(0,t.jsxs)("p",{role:"status",className:"mt-2 text-[0.8125rem] text-positive",children:[r," Teachers see the change next time they open ","you"===s?"your":`${s}’s`," details."]}),null!=g.error&&(0,t.jsx)(l.ErrorState,{error:g.error}),(0,t.jsx)("button",{className:"mt-2 text-[0.8125rem] font-semibold text-accent-text underline","aria-expanded":_,onClick:()=>f(e=>!e),children:_?"Hide changes":"See changes"}),_&&(0,t.jsx)("div",{className:"mt-1",children:(0,t.jsx)(h,{studentId:e})})]}),!x&&r&&(0,t.jsx)("p",{role:"status",className:"mt-1 text-[0.8125rem] text-positive",children:r})]})]})},"InitialConsents",0,function({value:e,onChange:i}){let s=u();return(0,t.jsxs)("fieldset",{className:"space-y-2",children:[(0,t.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"Consent"}),(0,t.jsx)("div",{className:"grid gap-3 sm:grid-cols-3",children:m.CONSENT_KINDS.map(a=>(0,t.jsx)(l.Field,{label:s.label(a),htmlFor:`ic-${a}`,children:(0,t.jsxs)(l.Select,{id:`ic-${a}`,value:void 0===e[a]?"":e[a]?"yes":"no",onChange:t=>{let s={...e};""===t.target.value?delete s[a]:s[a]="yes"===t.target.value,i(s)},children:[(0,t.jsx)("option",{value:"",children:"Not recorded"}),(0,t.jsx)("option",{value:"yes",children:"Given"}),(0,t.jsx)("option",{value:"no",children:"Not given"})]})},a))}),(0,t.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"Not recorded is treated as no consent. Families can change these in their app."})]})},"OfficeConsents",0,function({studentId:e,name:s}){let a=(0,d.useRows)(["consents",e],m.CONSENTS,[e]),[n,r]=i.useState(!1),[o,_]=i.useState(!1),p=u(e);return(0,t.jsxs)("div",{className:"space-y-2",children:[a.isLoading&&(0,t.jsx)(l.Skeleton,{className:"h-12"}),(0,t.jsx)("dl",{className:"divide-y divide-line text-[0.875rem]",children:a.data?.map(e=>(0,t.jsxs)("div",{className:"flex items-baseline justify-between gap-3 py-1.5",children:[(0,t.jsx)("dt",{className:"text-ink-2",children:p.label(e.kind)}),(0,t.jsxs)("dd",{className:(0,c.cn)("text-right",!1===e.granted&&"font-medium text-critical",null==e.granted&&"text-ink-3"),children:[!1===e.granted?"Not given":m.consentWord(e.granted),e.disputed&&(0,t.jsx)("span",{className:"block text-[0.7812rem] font-semibold text-caution",children:"Guardians disagree — treated as not given"})]})]},e.kind))}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-2",children:[(0,t.jsx)(l.Button,{size:"sm",onClick:()=>r(!0),children:"Record consent"}),(0,t.jsx)(l.Button,{size:"sm",variant:"ghost","aria-expanded":o,onClick:()=>_(e=>!e),children:o?"Hide history":"History"})]}),o&&(0,t.jsx)(h,{studentId:e}),n&&(0,t.jsx)(f,{studentId:e,name:s,onClose:()=>r(!1)})]})},"StudentConsents",0,function(){let e=(0,d.useRows)(["my-consents"],m.MY_CONSENTS);if(!e.data?.length)return null;let i=e.data[0].ask;return(0,t.jsxs)("section",{"aria-labelledby":"consent-h",children:[(0,t.jsxs)("div",{className:"mb-1 border-b-2 border-ink pb-2",children:[(0,t.jsx)("h2",{id:"consent-h",className:"section-title",children:"Photos and filming"}),(0,t.jsxs)("p",{className:"text-[0.8125rem] text-ink-3",children:["What the school may do. To change any of these, ask ",i,"."]})]}),(0,t.jsx)("dl",{className:"divide-y divide-line",children:e.data.map(e=>(0,t.jsxs)("div",{className:"grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 py-2.5",children:[(0,t.jsx)("dt",{className:"font-medium",children:e.label}),(0,t.jsx)("dd",{className:(0,c.cn)("text-right text-[0.875rem]",!1===e.granted?"font-semibold":null==e.granted&&"text-ink-3"),children:!0===e.granted?"Allowed":!1===e.granted?"Not allowed":"Not recorded, so not allowed"}),(0,t.jsx)("dd",{className:"col-span-2 text-[0.8125rem] text-ink-3",children:e.description})]},e.kind))})]})}])},10033,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(22016),a=e.i(54616),n=e.i(12598),l=e.i(7233),d=e.i(27612),r=e.i(65712),o=e.i(399),c=e.i(17658),m=e.i(13927),_=e.i(30224),u=e.i(31502),p=e.i(27830),h=e.i(8199);function f(e,t){let{session:i}=(0,u.useSession)(),s=(0,n.useQueryClient)();return(0,a.useMutation)({mutationFn:async t=>{let s=e(t);return(await (0,_.runAs)(i,e=>e(s.sql,s.params)))[0]},onSuccess:e=>{s.invalidateQueries({queryKey:["db"]}),t?.(e)}})}function x({studentId:e,name:s,onClose:a}){let[n,l]=i.useState(""),[d,m]=i.useState(null),_=f(t=>({sql:h.INVITE_STUDENT,params:[e,t]}),e=>m((0,p.inviteLink)(e.token)));return d?(0,t.jsxs)(r.RecordSheet,{title:`Invitation for ${s}`,onClose:a,onSave:a,saveLabel:"Done",children:[(0,t.jsxs)("p",{className:"text-[0.9062rem] text-ink-2",children:["Because you sent it, ",s,"’s login works as soon as they accept."]}),(0,t.jsx)(o.InviteLink,{link:d})]}):(0,t.jsx)(r.RecordSheet,{title:`Invite ${s}`,subtitle:"Their own login",onClose:a,saving:_.isPending,error:_.error,saveLabel:"Make the invitation",canSave:/@.+\./.test(n),onSave:()=>_.mutate(n.trim()),children:(0,t.jsx)(c.Field,{label:`${s}’s email`,htmlFor:"ci-e",required:!0,hint:"They accept the invitation to make their login.",children:(0,t.jsx)(c.Input,{id:"ci-e",type:"email",value:n,onChange:e=>l(e.target.value)})})})}function b({studentId:e,name:s,onClose:a,office:n}){let[l,d]=i.useState(""),[o,m]=i.useState(""),[_,u]=i.useState(""),[p,x]=i.useState("yes"),g=f(()=>n?{sql:y,params:[e,l,o,_,"yes"===p]}:{sql:h.ADD_COLLECTOR,params:[e,l,o,_]},a);return(0,t.jsxs)(r.RecordSheet,{title:n?"Add to the collection list":"Someone who may collect",subtitle:`For ${s}`,onClose:a,saving:g.isPending,error:g.error,canSave:l.trim().length>1,onSave:()=>g.mutate(void 0),children:[(0,t.jsx)(c.Field,{label:"Name",htmlFor:"col-n",required:!0,children:(0,t.jsx)(c.Input,{id:"col-n",value:l,onChange:e=>d(e.target.value)})}),(0,t.jsx)(c.Field,{label:"Relationship",htmlFor:"col-r",children:(0,t.jsx)(c.Input,{id:"col-r",value:o,onChange:e=>m(e.target.value),placeholder:"Grandmother, childminder…"})}),(0,t.jsx)(c.Field,{label:"Phone",htmlFor:"col-p",children:(0,t.jsx)(c.Input,{id:"col-p",type:"tel",value:_,onChange:e=>u(e.target.value)})}),n&&(0,t.jsx)(c.Field,{label:"May they collect?",htmlFor:"col-a",hint:"“May not collect” is shown to the teacher. Families do not see it.",children:(0,t.jsxs)(c.Select,{id:"col-a",value:p,onChange:e=>x(e.target.value),children:[(0,t.jsx)("option",{value:"yes",children:"May collect"}),(0,t.jsx)("option",{value:"no",children:"May not collect"})]})})]})}let g=`
select id, full_name, relationship, phone, allowed from collection_permission
 where student_id = $1 and deleted_at is null order by allowed desc, full_name`,y=`
insert into collection_permission (student_id, full_name, relationship, phone, allowed)
values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id`,v=[["see_schedule","Sees the schedule"],["see_payments","Sees invoices and payments"],["see_feedback","Sees teacher feedback"],["see_medical","Sees medical details"],["may_contact","May be contacted by the studio"],["may_collect","May collect the children"]];e.s(["ChildLogin",0,function({studentId:e,name:s}){let a=(0,m.useRows)(["my-children-logins"],h.MY_CHILDREN_LOGINS),n=a.data?.find(t=>t.student_id===e),[l,d]=i.useState(!1),r=f(t=>({sql:h.SET_STUDENT_LOGIN,params:[e,t]}));if(!n||"too_young"===n.state)return null;let o={too_young:null,none:(0,t.jsxs)("span",{className:"text-ink-3",children:["No login. ",s," uses the app through you."]}),invited:(0,t.jsxs)("span",{className:"[overflow-wrap:anywhere]",children:["Invited",n.email?` at ${n.email}`:"",". Once ",s," accepts, you approve it here."]}),pending:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"caution",children:"Waiting for you"})," ",(0,t.jsxs)("span",{className:"ml-1",children:[s," has accepted the school’s invitation. The login stays off until a parent or carer approves it."]})]}),on:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"positive",children:"On"})," ",(0,t.jsxs)("span",{className:"ml-1 [overflow-wrap:anywhere]",children:[s," signs in",n.email?` as ${n.email}`:"",". Either parent can switch it off at any time."]})]}),off:(0,t.jsxs)("span",{children:[(0,t.jsx)(c.Word,{tone:"muted",children:"Off"})," ",(0,t.jsxs)("span",{className:"ml-1",children:["A parent or carer switched it off. ",s," cannot sign in."]})]})};return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Own login"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.9062rem]",children:o[n.state]}),null!=r.error&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(c.ErrorState,{error:r.error})}),(0,t.jsxs)("div",{className:"mt-2 flex flex-wrap gap-2",children:[("pending"===n.state||"off"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",variant:"primary",loading:r.isPending&&!0===r.variables,onClick:()=>r.mutate(!0),children:"pending"===n.state?"Approve":"Switch back on"}),("on"===n.state||"pending"===n.state||"invited"===n.state)&&(0,t.jsx)(c.Button,{size:"sm",loading:r.isPending&&!1===r.variables,onClick:()=>r.mutate(!1),children:"on"===n.state?"Switch off":"pending"===n.state?"Not now":"Withdraw the invitation"}),"none"===n.state&&(0,t.jsxs)(c.Button,{size:"sm",onClick:()=>d(!0),children:["Invite ",s]})]}),(0,t.jsxs)("p",{className:"mt-1.5 text-[0.7812rem] text-ink-3",children:["The school gives students their own login from age ",n.min_age,". They see their classes, feedback and practice, never payments."]})]}),l&&(0,t.jsx)(x,{studentId:e,name:s,onClose:()=>d(!1)})]})},"CollectionList",0,function({studentId:e,name:a}){let n=((0,m.useRows)(["my-collectors"],h.MY_COLLECTORS).data??[]).filter(t=>t.student_id===e),[r,o]=i.useState(!1),_=f(e=>({sql:h.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{className:"grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3",children:[(0,t.jsx)("dt",{className:"text-ink-3",children:"Who may collect"}),(0,t.jsxs)("dd",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"You, and anyone listed here. The teacher sees this list at the register."}),(0,t.jsx)("ul",{className:"mt-1 space-y-0.5",children:n.map(e=>(0,t.jsxs)("li",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null,e.phone?(0,t.jsx)("span",{className:"block tnum text-[0.8438rem] text-ink-2",children:e.phone}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:_.isPending&&_.variables===e.id,onClick:()=>_.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(d.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",className:"-ml-3 mt-1",onClick:()=>o(!0),children:[(0,t.jsx)(l.Plus,{className:"size-4","aria-hidden":!0})," Add someone"]}),(0,t.jsxs)("p",{className:"mt-1 text-[0.7812rem] text-ink-3",children:["If someone must not collect ",a,", ",(0,t.jsx)(s.default,{href:"/family/enquiries",className:"font-semibold text-accent-text underline",children:"tell the office"}),"."]})]}),r&&(0,t.jsx)(b,{studentId:e,name:a,onClose:()=>o(!1)})]})},"GuardianAccessFields",0,function({guardianId:e}){let s=(0,m.useRows)(["guardian-access",e],"select * from app.guardian_access_for($1)",[e]),a=s.data?.[0],[n,l]=i.useState(null),d=f(t=>({sql:"select app.set_guardian_access($1, $2::jsonb, $3)",params:[e,JSON.stringify(t.flags),t.note??null]}));return a?(0,t.jsxs)("fieldset",{children:[(0,t.jsx)("legend",{className:"mb-1 text-[0.8125rem] font-medium text-ink-2",children:"Shared care"}),(0,t.jsx)("p",{className:"mb-1 text-[0.7812rem] text-ink-3",children:"Everything is on unless the office restricts it, for example under a court order. Changes apply at once."}),v.map(([e,i])=>(0,t.jsxs)("label",{className:"flex min-h-[44px] items-center gap-3 text-[0.875rem]",children:[(0,t.jsx)("input",{type:"checkbox",checked:!!a[e],className:"size-[18px] accent-[var(--color-accent)]",onChange:t=>d.mutate({flags:{[e]:t.target.checked}})}),i]},e)),a.can_note?(0,t.jsx)(c.Field,{label:"Safeguarding note",htmlFor:"ga-note",hint:"Only the safeguarding lead sees this.",children:(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(c.Input,{id:"ga-note",value:n??a.dsl_note??"",onChange:e=>l(e.target.value)}),(0,t.jsx)(c.Button,{size:"sm",disabled:null===n,loading:d.isPending,onClick:()=>{d.mutate({flags:{},note:n??""}),l(null)},children:"Save note"})]})}):a.has_note?(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"The safeguarding lead holds a note about this."}):null,null!=d.error&&(0,t.jsx)(c.ErrorState,{error:d.error})]}):s.isLoading?(0,t.jsx)(c.Skeleton,{className:"h-24"}):null},"OfficeCollection",0,function({studentId:e,name:s}){let a=(0,m.useRows)(["office-collection",e],g,[e]),[n,r]=i.useState(!1),o=f(e=>({sql:h.REMOVE_COLLECTOR,params:[e]}));return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 border-b border-ink pb-1",children:[(0,t.jsx)("h3",{className:"min-w-0 flex-1 text-[0.875rem] font-semibold",children:"Who may collect"}),(0,t.jsxs)(c.Button,{size:"sm",variant:"ghost",onClick:()=>r(!0),children:[(0,t.jsx)(l.Plus,{className:"size-4","aria-hidden":!0})," Add"]})]}),a.isLoading&&(0,t.jsx)(c.Skeleton,{className:"mt-2 h-8"}),a.data?.length===0&&(0,t.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:"Only the family’s guardians."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:a.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[44px] items-center gap-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[!e.allowed&&(0,t.jsx)(c.Word,{tone:"critical",className:"mr-1.5",children:"May not collect"}),(0,t.jsx)("span",{className:"font-medium",children:e.full_name}),e.relationship?(0,t.jsxs)("span",{className:"text-ink-3",children:[" (",e.relationship,")"]}):null]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>o.mutate(e.id),"aria-label":`Remove ${e.full_name}`,children:(0,t.jsx)(d.Trash2,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),n&&(0,t.jsx)(b,{office:!0,studentId:e,name:s,onClose:()=>r(!1)})]})},"PendingLogins",0,function(){let e=((0,m.useRows)(["my-children-logins"],h.MY_CHILDREN_LOGINS).data??[]).filter(e=>"pending"===e.state);return e.length?(0,t.jsx)(t.Fragment,{children:e.map(e=>(0,t.jsx)("li",{className:"py-3.5",children:(0,t.jsx)(s.default,{href:"/family/children",className:"block rounded-[var(--radius-sm)] hover:bg-surface-2/60",children:(0,t.jsx)(c.Notice,{tone:"accent",word:"New",title:`${e.first_name} has been invited to their own login`,detail:"It stays off until a parent or carer approves it. Open Your family to approve or say not now."})})},e.student_id))}):null},"StudentLoginAge",0,function(){let{session:e}=(0,u.useSession)(),i=(0,m.useRows)(["student-login-age"],"select id, student_login_min_age from studio where id in (select app.studio_ids()) limit 1"),s=i.data?.[0],a=f(e=>({sql:"select app.set_student_login_min_age($1, $2)",params:[s.id,e]}));if(!s)return null;let n=e?.role==="owner";return(0,t.jsxs)(c.Card,{children:[(0,t.jsx)(c.CardHeader,{title:"Students’ own logins",subtitle:`From age ${s.student_login_min_age}`}),(0,t.jsxs)("div",{className:"pt-3",children:[n?(0,t.jsx)(c.Field,{label:"Students may have their own login from age",htmlFor:"sl-age",hint:"A student’s login works only once a parent or carer approves it, and either parent can switch it off. Many schools choose 13; choose higher if your safeguarding policy asks for it.",children:(0,t.jsx)(c.Select,{id:"sl-age",value:String(s.student_login_min_age),onChange:e=>a.mutate(Number(e.target.value)),className:"max-w-[8rem]",children:Array.from({length:6},(e,t)=>13+t).map(e=>(0,t.jsx)("option",{value:e,children:e},e))})}):(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Only the studio owner can change this."}),null!=a.error&&(0,t.jsx)(c.ErrorState,{error:a.error})]})]})}])},399,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(74886),a=e.i(43531),n=e.i(17658);e.s(["InviteLink",0,function({link:e}){let[l,d]=i.useState(!1);return(0,t.jsxs)("div",{className:"mt-3 border-l-2 border-ink pl-3",children:[(0,t.jsxs)("p",{className:"text-[0.875rem] font-semibold",children:["Invitation link ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· works once, for 14 days"})]}),(0,t.jsxs)("div",{className:"mt-2 flex gap-2",children:[(0,t.jsx)(n.Input,{readOnly:!0,value:e,"aria-label":"Invitation link",onFocus:e=>e.currentTarget.select(),className:"text-[0.7812rem]"}),(0,t.jsxs)(n.Button,{size:"sm",onClick:async()=>{try{await navigator.clipboard.writeText(e),d(!0),setTimeout(()=>d(!1),1800)}catch{}},children:[l?(0,t.jsx)(a.Check,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(s.Copy,{className:"size-4","aria-hidden":!0}),l?"Copied":"Copy"]})]}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Email delivery isn’t connected yet, so send this link yourself. It’s shown only now."})]})}])},85351,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(54616),a=e.i(12598),n=e.i(7233),l=e.i(37727),d=e.i(17658),r=e.i(45060),o=e.i(13927),c=e.i(30224),m=e.i(31502),_=e.i(36261);function u({className:e,children:i,...s}){return(0,t.jsx)("section",{...s,className:(0,r.cn)("min-w-0",e),children:i})}function p({title:e,subtitle:i,action:s,className:a}){return(0,t.jsxs)("div",{className:(0,r.cn)("border-b-2 border-ink pb-2",a),children:[(0,t.jsxs)("div",{className:"flex min-h-9 items-center gap-3",children:[(0,t.jsx)("h2",{className:"section-title min-w-0 flex-1",children:e}),s]}),i&&(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:i})]})}function h(){let{session:e}=(0,m.useSession)(),t=(0,a.useQueryClient)();return(0,s.useMutation)({mutationFn:t=>(0,c.runAs)(e,e=>e(t.sql,t.params)),onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}function f(){let e=(0,o.useRows)(["skill-publish"],_.SKILL_PUBLISH),i=h(),s=e.data?.[0];return s?(0,t.jsxs)("fieldset",{className:"pt-4",children:[(0,t.jsx)("legend",{className:"text-[0.875rem] font-semibold",children:"When families see a new level"}),null!=i.error&&(0,t.jsx)("div",{className:"pt-2",children:(0,t.jsx)(d.ErrorState,{error:i.error})}),[["with_share","When the teacher shares it","Levels wait with the class feedback until the teacher taps Share. A mistake can be put right first."],["immediate","Straight away","Each level is visible to the family as soon as it is set."]].map(([e,a,n])=>(0,t.jsxs)("label",{className:"flex min-h-11 cursor-pointer items-start gap-3 py-1",children:[(0,t.jsx)("input",{type:"radio",name:"skill-publish",className:"mt-1 size-4 accent-[var(--color-accent)]",checked:s.skill_publish===e,onChange:()=>i.mutate({sql:_.SET_SKILL_PUBLISH,params:[s.id,e]})}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"block text-[0.9375rem] font-medium",children:a}),(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:n})]})]},e))]}):null}e.s(["ChipSettings",0,function(){let e=(0,o.useRows)(["chips"],_.CHIPS),s=h(),[a,r]=i.useState({});return(0,t.jsxs)(u,{children:[(0,t.jsx)(p,{title:"Feedback phrases",subtitle:"What teachers tap after class. Keep them short and kind. Teachers can keep their own set for a class."}),null!=s.error&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(d.ErrorState,{error:s.error})}),["standard","under_8"].map(i=>(0,t.jsxs)("div",{className:"pt-4",children:["under_8"===i&&(0,t.jsxs)("p",{className:"mb-1 text-[0.875rem] font-semibold",children:["For classes up to age 8 ",(0,t.jsx)("span",{className:"font-normal text-ink-3",children:"· simple words, a sticker each"})]}),(0,t.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-2 sm:grid-cols-2",children:["going_well","work_on"].map(o=>{let c=`${i}-${o}`;return(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"mb-2 font-semibold",children:"going_well"===o?"Going well":"To work on"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5",children:e.data?.filter(e=>e.kind===o&&(e.band??"standard")===i).map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line-strong bg-surface py-0.5 pl-2.5 pr-0.5 text-[0.875rem]",children:[e.sticker&&(0,t.jsx)("span",{"aria-hidden":!0,className:"mr-1",children:e.sticker}),e.label,(0,t.jsx)("button",{"aria-label":`Remove ${e.label}`,onClick:()=>s.mutate({sql:_.REMOVE_CHIP,params:[e.id]}),className:"grid size-8 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,t.jsx)(l.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:e=>{e.preventDefault();let t=(a[c]??"").trim();t&&(s.mutate("standard"===i?{sql:_.ADD_CHIP,params:[o,t]}:{sql:_.ADD_YOUNG_CHIP,params:[o,t,""]}),r(e=>({...e,[c]:""})))},children:[(0,t.jsx)(d.Input,{"aria-label":`Add a ${"going_well"===o?"going well":"to work on"} phrase${"under_8"===i?" for young classes":""}`,placeholder:"Add a phrase",maxLength:40,value:a[c]??"",onChange:e=>r(t=>({...t,[c]:e.target.value})),className:"h-9 text-[0.875rem]"}),(0,t.jsx)(d.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,t.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},o)})})]},i))]})},"FrameworkSettings",0,function(){let e=(0,o.useRows)(["frameworks"],_.FRAMEWORKS),s=h(),[a,r]=i.useState({});return(0,t.jsxs)(u,{children:[(0,t.jsx)(p,{title:"Skills teachers assess",subtitle:"One list per style. Teachers set each child’s level; families and students see it."}),(0,t.jsx)(f,{}),e.isLoading&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(d.Skeleton,{className:"h-24"})}),null!=s.error&&(0,t.jsx)("div",{className:"pt-3",children:(0,t.jsx)(d.ErrorState,{error:s.error})}),(0,t.jsx)("div",{className:"grid gap-x-10 gap-y-6 pt-4 sm:grid-cols-2",children:e.data?.map(e=>(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"border-b border-line pb-1.5 font-semibold",children:e.style??e.name}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.skills.map(e=>(0,t.jsxs)("li",{className:"group flex min-h-10 items-center gap-1 text-[0.875rem]",children:[(0,t.jsx)("input",{"aria-label":`Rename ${e.name}`,defaultValue:e.name,onBlur:t=>t.target.value.trim()&&t.target.value.trim()!==e.name&&s.mutate({sql:_.RENAME_SKILL,params:[e.id,t.target.value]}),className:"min-w-0 flex-1 rounded-[var(--radius-sm)] bg-transparent px-1 py-1.5 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"}),(0,t.jsx)("button",{"aria-label":`Remove ${e.name}`,onClick:()=>s.mutate({sql:_.REMOVE_SKILL,params:[e.id]}),className:"grid size-9 place-items-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-critical",children:(0,t.jsx)(l.X,{className:"size-3.5","aria-hidden":!0})})]},e.id))}),(0,t.jsxs)("form",{className:"mt-2 flex gap-1.5",onSubmit:t=>{t.preventDefault();let i=(a[e.id]??"").trim();i&&(s.mutate({sql:_.ADD_SKILL,params:[e.id,i]}),r(t=>({...t,[e.id]:""})))},children:[(0,t.jsx)(d.Input,{"aria-label":`Add a skill to ${e.style}`,placeholder:"Add a skill",value:a[e.id]??"",onChange:t=>r(i=>({...i,[e.id]:t.target.value})),className:"h-9 text-[0.875rem]"}),(0,t.jsx)(d.Button,{size:"sm",type:"submit","aria-label":"Add",children:(0,t.jsx)(n.Plus,{className:"size-4","aria-hidden":!0})})]})]},e.id))})]})},"SettingsHead",0,p,"SettingsSection",0,u])},26138,e=>{"use strict";let t=`select studio_id, name, roles from app.my_schools()
  where roles && array['owner','admin','teacher']`,i=`select id, staff_timetable_sharing as sharing from studio
  where id in (select app.studio_ids()) and app.in_scope(id) order by name limit 1`;e.s(["MY_AGENDA",0,"select * from app.my_agenda($1::timestamptz, $2::timestamptz)","MY_STAFF_SCHOOLS",0,t,"MY_TRAVEL",0,"select app.my_agenda_travel() as minutes","SET_SHARING",0,"select app.set_timetable_sharing($1, $2)","SET_TRAVEL",0,"select app.set_agenda_travel($1::int)","SHARING",0,i])},50293,e=>{"use strict";let t=`
select
  coalesce((select sum(balance_minor) from family where deleted_at is null and balance_minor > 0), 0)::bigint as outstanding_minor,
  (select count(*)::int from family where deleted_at is null and balance_minor > 0) as owing_families,
  coalesce((select sum(total_minor - paid_minor) from invoice where deleted_at is null
             and status in ('issued','part_paid','refunded') and due_on < current_date), 0)::bigint as overdue_minor,
  (select count(*)::int from invoice where deleted_at is null
     and status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(amount_minor - refunded_minor) from payment where deleted_at is null
     and succeeded_at >= now() - interval '30 days' and method not in ('account','credit')), 0)::bigint
     as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,i=`
with loc as (select id from location where name = $1 and deleted_at is null),
m as (select lm.* from location_money lm where lm.location_id in (select id from loc)),
fam_here as (select distinct s.family_id from enrolment e join student s on s.id = e.student_id join class c on c.id = e.class_id
              where e.status = 'active' and e.deleted_at is null and c.location_id in (select id from loc)),
inv_here as (select i.* from invoice i where i.deleted_at is null and (
               exists (select 1 from invoice_item ii join class c on c.id = ii.class_id
                        where ii.invoice_id = i.id and ii.deleted_at is null and c.location_id in (select id from loc))
               or (not exists (select 1 from invoice_item ii where ii.invoice_id = i.id and ii.deleted_at is null and ii.class_id is not null)
                   and i.family_id in (select family_id from fam_here))))
select
  coalesce((select sum(outstanding_minor) from m), 0)::bigint as outstanding_minor,
  (select count(distinct family_id)::int from inv_here where status in ('issued','part_paid')) as owing_families,
  coalesce((select sum(overdue_minor) from m), 0)::bigint as overdue_minor,
  (select count(*)::int from inv_here where status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and p.invoice_id in (select id from inv_here where status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(collected_30d_minor) from m), 0)::bigint as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0
     and id in (select family_id from fam_here)), 0)::bigint as credit_minor`,s=e=>`array(select distinct l.name from student s
   join enrolment e on e.student_id = s.id and e.status = 'active' and e.deleted_at is null
   join class c on c.id = e.class_id join location l on l.id = c.location_id
  where s.family_id = ${e} and s.deleted_at is null order by l.name)`,a=`coalesce(nullif(array(select distinct l.name from invoice_item it
   join class c on c.id = it.class_id join location l on l.id = c.location_id
  where it.invoice_id = i.id and it.deleted_at is null order by l.name), '{}'), ${s("f.id")})`,n=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines,
       ${a} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,l=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       (select g.full_name from guardian g where g.id = i.billed_guardian_id) as billed_to,
       app.family_available_credit(f.id) as available_credit_minor,
       (select coalesce(sum(p.amount_minor - p.refunded_minor), 0) from payment p
         where p.invoice_id = i.id and p.deleted_at is null and p.credit_note_id is not null)::bigint as credited_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,d=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,r=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,o=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null order by f.name`,c=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,m=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,_=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,u=`
with l as (
  select i.created_at as at, coalesce(i.issued_on, i.created_at::date) as on_date, 'invoice' as kind, i.number as ref,
         (select string_agg(it.description, ', ' order by it.created_at) from invoice_item it
           where it.invoice_id = i.id and it.deleted_at is null) as detail,
         i.total_minor as amount_minor
    from invoice i where i.family_id = $1 and i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'payment', i.number, p.method, -p.amount_minor
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method in ('card', 'direct_debit', 'bank_transfer', 'cash')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'credit', null, p.note, -p.amount_minor
    from payment p where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method = 'credit' and p.credit_note_id is null
  union all
  select cn.created_at, cn.created_at::date, 'credit_note', cn.number, i.number || ' \xb7 ' || cn.reason, -cn.amount_minor
    from credit_note cn join invoice i on i.id = cn.invoice_id where cn.family_id = $1
  union all
  select r.created_at, r.created_at::date, 'refund', i.number, r.reason, r.amount_minor
    from refund r join payment p on p.id = r.payment_id left join invoice i on i.id = p.invoice_id
   where r.family_id = $1
  union all
  -- Refunds from before they were itemised, and card refunds from the provider.
  select p.updated_at, p.updated_at::date, 'refund', i.number, null,
         p.refunded_minor - coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null
     and p.refunded_minor > coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
)
select on_date, kind, ref, detail, amount_minor,
       sum(amount_minor) over (order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)
                               rows unbounded preceding) as balance_minor
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,p=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app,
       ${s("f.id")} as locations
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,h=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,f=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,x=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,b=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,g=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,v=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,N=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,S=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,j=`
select f.id, f.name,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc, g.created_at limit 1) as guardian,
       (select string_agg(s.first_name, ', ' order by s.first_name) from student s
         where s.family_id = f.id and s.deleted_at is null) as children,
       f.postcode
  from family f where f.deleted_at is null and not f.is_prospect order by f.name`,w=`
with lines as (
  select i.id, i.number, f.name as contact, (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
            order by g.is_primary desc, g.created_at limit 1) as email,
         coalesce(i.issued_on, i.created_at::date) as inv_date, i.due_on, t.name as term,
         ii.description, ii.quantity, ii.total_minor, ii.created_at, 0 as ord
    from invoice i join family f on f.id = i.family_id join invoice_item ii on ii.invoice_id = i.id and ii.deleted_at is null
    left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select i.id, i.number, f.name, null, coalesce(i.issued_on, i.created_at::date), i.due_on, t.name,
         'Discount', 1, -i.discount_minor, i.created_at, 1
    from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void') and i.discount_minor > 0
  union all
  -- Credit notes: a negative sales invoice, which Xero imports as a credit note.
  select cn.id, cn.number, f.name, null, cn.created_at::date, cn.created_at::date, i.number,
         'Credit note for ' || i.number || ': ' || cn.reason, 1, -cn.amount_minor, cn.created_at, 2
    from credit_note cn join invoice i on i.id = cn.invoice_id join family f on f.id = cn.family_id
)
select contact as "*ContactName", coalesce(email, '') as "EmailAddress", number as "*InvoiceNumber", coalesce(term, '') as "Reference",
       to_char(inv_date, 'DD/MM/YYYY') as "*InvoiceDate", to_char(due_on, 'DD/MM/YYYY') as "*DueDate",
       description as "*Description", quantity as "*Quantity", round(total_minor / quantity / 100.0, 2) as "*UnitAmount",
       '200' as "*AccountCode", 'No VAT' as "*TaxType", 'GBP' as "Currency"
  from lines order by number, ord, created_at`,$=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1)) a
 where $1::text is null or $1::text = any(${s("a.family_id")})`,k=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,E=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`,C=`
select coalesce(b.mode, 'family') as mode, b.guardian_a, b.guardian_b, b.percent_a
  from family f left join family_billing b on b.family_id = f.id
 where f.id = $1`,I=`
select id, full_name from guardian where family_id = $1 and deleted_at is null order by is_primary desc, full_name`,T=`
select s.id, s.first_name, x.guardian_id
  from student s left join family_billing_child x on x.student_id = s.id
 where s.family_id = $1 and s.deleted_at is null order by s.date_of_birth`,L=`
select ac.id, ac.created_at, ac.family_id, f.name as family_name, s.first_name as child,
       app.session_label(ac.session_id) as session_label, ac.amount_minor, ac.status
  from absence_credit ac join family f on f.id = ac.family_id join student s on s.id = ac.student_id
 order by ac.created_at desc limit 50`,A=`
select id, absence_credit, absence_credit_fixed_minor, makeup_policy from studio where id in (select app.studio_ids()) limit 1`,R=`
update studio set absence_credit = $2, absence_credit_fixed_minor = $3 where id = $1 returning id`;e.s(["ABSENCE_CREDITS",0,L,"ABSENCE_CREDIT_SETTING",0,A,"ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,S,"AGED_DEBT_EXPORT",0,$,"BANK_DETAILS",0,f,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,v,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CLASS_LOCATIONS",0,"select c.id, l.name as location from class c join location l on l.id = c.location_id where c.deleted_at is null","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,_,"FAMILY_BILLABLE",0,c,"FAMILY_BILLING",0,C,"FAMILY_BILLING_CHILDREN",0,T,"FAMILY_DISCOUNTS",0,N,"FAMILY_GUARDIANS",0,I,"FAMILY_OPTIONS",0,o,"FAMILY_PICK",0,j,"FAMILY_STATEMENT",0,u,"INVOICE",0,l,"INVOICES",0,n,"INVOICES_EXPORT",0,k,"INVOICE_CREDIT_NOTES",0,m,"INVOICE_ITEMS",0,d,"INVOICE_PAYMENTS",0,r,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,x,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,p,"PAYMENTS_EXPORT",0,E,"PRIMARY_GUARDIAN",0,g,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,h,"REMINDER_TEMPLATE",0,b,"SEND_DIRECT",0,y,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_ABSENCE_CREDIT",0,R,"SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SET_FAMILY_BILLING",0,"select app.set_family_billing($1, $2, $3, $4, $5, $6::jsonb)","SUMMARY",0,t,"SUMMARY_AT",0,i,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,w])},90676,e=>{"use strict";e.s(["BRIEF_CONSENTS",0,"select app.consent_now($1, 'video') as video_consent, app.consent_now($1, 'social_media') as social_consent","CONSENTS",0,"select kind, granted, disputed, changed_at from app.consents($1)","CONSENT_EXPLAIN",0,{photography:"Photos taken in class or at shows, used by the school (noticeboards, records, programmes).",video:"Video recorded in class or at shows, for teaching and for families of the class.",social_media:"Photos or video on the school’s website, social media, posters or in the press."},"CONSENT_HISTORY",0,"select * from app.consent_history($1)","CONSENT_KINDS",0,["photography","video","social_media"],"CONSENT_LABEL",0,{photography:"Photos",video:"Video",social_media:"Social media and public use"},"CONSENT_LABELS",0,"select * from app.consent_labels($1::uuid, $2::uuid)","CONSENT_SNAPSHOT",0,"select * from app.event_consent_snapshot($1, $2::timestamptz)","MY_CONSENTS",0,"select * from app.my_consents()","SET_CONSENT",0,"select app.set_consent($1, $2, $3, $4, coalesce($5::boolean, false))","SET_CONSENT_LABEL",0,"select app.set_consent_label($1, $2, $3, $4)","consentWord",0,function(e){return!0===e?"Given":!1===e?"Not given":"Not recorded"}])},27830,e=>{"use strict";e.i(47167);let t=`select id, code, name, price_minor, max_students, max_locations, max_staff, is_trial, active
  from plan order by sort`;e.s(["AM_SUPER",0,"select app.is_platform_super() as yes","CREATE_SCHOOL",0,"select * from app.platform_create_studio($1, $2, $3, $4, $5)","EVENTS",0,"select * from app.platform_events($1)","EXTEND_TRIAL",0,"select app.platform_extend_trial($1, $2)","INVITE",0,"select app.create_invitation($1, $2, $3::app_role, $4) as token","INVITES",0,"select * from app.platform_invitations($1)","PLANS",0,t,"PURGE",0,"select app.platform_purge_studio($1, $2)","REVOKE_INVITE",0,"select app.revoke_invitation($1)","SCHOOLS",0,"select * from app.platform_studios()","SET_PLAN",0,"select app.platform_set_plan($1, $2)","SET_PLAN_LIMITS",0,"select app.platform_set_plan_limits($1, $2, $3, $4, $5, $6)","SET_STATUS",0,"select app.platform_set_status($1, $2, $3)","START_SUPPORT",0,"select app.start_support_session($1) as until","inviteLink",0,e=>`${window.location.origin}/General/studio-next/invite/?token=${e}`])},36261,e=>{"use strict";let t=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,i=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,s=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,n=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,l=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,d=`
with cs as (select * from class_session where id = $1),
kids as (
  select e.student_id, null::text as visiting, 0 as pri from cs
    join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
         and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  union all
  select t.student_id, 'trial', 1 from cs join trial t on t.session_id = cs.id and t.student_id is not null
         and t.deleted_at is null and t.status in ('booked', 'attended', 'converted')
  union all
  select d.student_id, 'drop_in', 2 from cs join drop_in_booking d on d.session_id = cs.id and d.status = 'booked'
),
one as (select distinct on (student_id) student_id, visiting from kids order by student_id, pri)
select s.id as student_id, s.first_name, s.last_name, a.status::text as status, one.visiting,
       f.going_well, f.work_on, f.shared_at is not null as shared, f.edited_at,
       f.going_well_chips, f.work_on_chips, f.note, f.work_on_note, f.work_on_resource_id
  from one
  join cs on true
  join student s on s.id = one.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
-- One order everywhere, the register's: by last name. It must not move
 -- between saves (round 2 panel), so nothing that changes is in it.
 order by s.last_name, s.first_name, s.id`,r=`
select f.student_id, f.going_well_chips, f.work_on_chips, p.starts_at
  from class_session me
  join lateral (select cs.id, cs.starts_at from class_session cs
                 where cs.class_id = me.class_id and cs.starts_at < me.starts_at and cs.deleted_at is null
                   and exists (select 1 from feedback_note f2 where f2.session_id = cs.id and f2.deleted_at is null)
                 order by cs.starts_at desc limit 1) p on true
  join feedback_note f on f.session_id = p.id and f.deleted_at is null
 where me.id = $1`,o=`
select f.id, f.going_well, f.work_on, coalesce(cs.starts_at, f.shared_at, f.created_at) as at, c.name as class_name,
       f.shared_at is not null as shared, r.title as resource_title
  from feedback_note f
  left join class_session cs on cs.id = f.session_id
  left join class c on c.id = f.class_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
 where f.student_id = $1 and f.deleted_at is null and (f.going_well is not null or f.work_on is not null)
   and f.session_id is distinct from $2::uuid
 order by coalesce(cs.starts_at, f.created_at) desc limit 1`,c=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,m=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,_=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,u=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,p=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`,h=`
select c.id, c.name, ds.name as style, app.class_depth(c.id) as depth,
       exists (select 1 from skill_framework f join framework_skill fs on fs.framework_id = f.id and fs.deleted_at is null
                where f.deleted_at is null and f.dance_style_id = c.dance_style_id)
       and exists (select 1 from enrolment e where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as has_skills
  from class c left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by ds.name nulls last, c.name`;e.s(["ADD_CHIP",0,i,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,l,"ADD_YOUNG_CHIP",0,s,"CHIPS",0,t,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,a,"CLASS_PROGRESS",0,"select * from app.class_progress($1)","CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,n,"GOALS",0,_,"LAST_FEEDBACK",0,o,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_PROGRESS_CLASSES",0,h,"MY_RECENT_CLASSES",0,p,"MY_REPORTS",0,m,"PREVIOUS_SESSION_CHIPS",0,r,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,u,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,d,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])},35632,e=>{"use strict";let t=`
select l.id, l.name, l.address_line1, l.address_line2, l.city, l.postcode, l.notes,
       (select count(*)::int from room r where r.location_id = l.id and r.deleted_at is null) as rooms,
       (select count(*)::int from class c where c.location_id = l.id and c.deleted_at is null) as classes
  from location l where l.deleted_at is null order by l.name`,i=`
insert into location (studio_id, name, address_line1, address_line2, city, postcode, notes)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), nullif(btrim($6),'')
  from studio where deleted_at is null limit 1
returning id`,s=`
update location set name = $2, address_line1 = nullif(btrim($3),''),
       address_line2 = nullif(btrim($4),''), city = nullif(btrim($5),''),
       postcode = nullif(btrim($6),''), notes = nullif(btrim($7),''), updated_at = now()
 where id = $1 returning id`,a=`
select r.id, r.name, r.location_id, r.capacity, l.name as location,
       (select count(*)::int from class c where c.room_id = r.id and c.deleted_at is null) as classes
  from room r join location l on l.id = r.location_id
 where r.deleted_at is null order by l.name, r.name`,n=`
insert into room (studio_id, location_id, name, capacity)
select l.studio_id, l.id, $2, $3 from location l where l.id = $1
returning id`,l=`
update room set name = $2, capacity = $3, updated_at = now() where id = $1 returning id`,d=`
select t.id, t.name, t.starts_on, t.ends_on, t.status::text as status,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes,
       (select count(*)::int from term_break b where b.term_id = t.id and b.deleted_at is null) as breaks
  from term t where t.deleted_at is null order by t.starts_on desc`,r=`
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
returning id`,_=`
select s.id, s.name, s.colour, s.sort_order,
       (select count(*)::int from class c where c.dance_style_id = s.id and c.deleted_at is null) as classes
  from dance_style s where s.deleted_at is null order by s.sort_order, s.name`,u=`
insert into dance_style (studio_id, name, colour, sort_order)
select id, $1, $2, coalesce((select max(sort_order) + 1 from dance_style where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,p=`
update dance_style set name = $2, colour = $3, updated_at = now() where id = $1 returning id`,h=`
select lv.id, lv.name, lv.sort_order,
       (select count(*)::int from class c where c.level_id = lv.id and c.deleted_at is null) as classes
  from level lv where lv.deleted_at is null order by lv.sort_order, lv.name`,f=`
insert into level (studio_id, name, sort_order)
select id, $1, coalesce((select max(sort_order) + 1 from level where deleted_at is null), 0)
  from studio where deleted_at is null limit 1
returning id`,x=`
update level set name = $2, updated_at = now() where id = $1 returning id`,b=`
select id, name, timezone, currency, contact_email, contact_phone, onboarded_at, privacy_notice_url
  from studio where deleted_at is null limit 1`,g=`
update studio set name = $2, timezone = $3, contact_email = nullif(btrim($4),''),
       contact_phone = nullif(btrim($5),''), privacy_notice_url = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["BREAKS",0,c,"CREATE_BREAK",0,m,"CREATE_LEVEL",0,f,"CREATE_LOCATION",0,i,"CREATE_ROOM",0,n,"CREATE_STYLE",0,u,"CREATE_TERM",0,r,"LEVELS_FULL",0,h,"LOCATIONS_FULL",0,t,"RETIRE_SETUP",0,"select app.retire_setup($1, $2) as ok","ROOMS_FULL",0,a,"SET_WAITLIST_DAYS",0,"update studio set waitlist_offer_days = $2, updated_at = now() where id = $1 returning id","STUDIO",0,b,"STYLES_FULL",0,_,"TERMS_FULL",0,d,"UPDATE_LEVEL",0,x,"UPDATE_LOCATION",0,s,"UPDATE_ROOM",0,l,"UPDATE_STUDIO",0,g,"UPDATE_STYLE",0,p,"UPDATE_TERM",0,o,"WAITLIST_SETTING",0,"select id, waitlist_offer_days from studio where deleted_at is null limit 1"])}]);