(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,37345,e=>{"use strict";let s=(0,e.i(75254).default)("message-square-plus",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M12 8v6",key:"1ib9pf"}],["path",{d:"M9 11h6",key:"1fldmi"}]]);e.s(["MessageSquarePlus",0,s],37345)},28887,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(61911),i=e.i(37345),n=e.i(61574),r=e.i(63488),l=e.i(51737),d=e.i(37253),o=e.i(54616),c=e.i(12598),u=e.i(65712),_=e.i(17658),m=e.i(30224),f=e.i(31502),h=e.i(33204);function p({student:e,onClose:a}){let{session:i}=(0,f.useSession)(),n=(0,c.useQueryClient)(),[r,l]=t.useState(""),[d,x]=t.useState(""),[b,j]=t.useState(!1),g=(0,o.useMutation)({mutationFn:()=>(0,m.runAs)(i,s=>s(h.TEACHER_MESSAGE,[e.id,r,d])),onSuccess:()=>{j(!0),n.invalidateQueries({queryKey:["db"]})}});return b?(0,s.jsx)(u.RecordSheet,{title:"Sent",onClose:a,onSave:a,saveLabel:"Done",children:(0,s.jsx)("p",{className:"text-sm text-ink-2",children:"It is in the family’s conversation with the studio. Their reply comes to the office, who will pass it on."})}):(0,s.jsxs)(u.RecordSheet,{title:`Message ${e.first_name}’s family`,onClose:a,saving:g.isPending,error:g.error,canSave:d.trim().length>=3,saveLabel:"Send",onSave:()=>g.mutate(),children:[(0,s.jsx)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px] text-ink-2",children:"The office can see this message and any reply — there are no private channels between staff and families."}),(0,s.jsx)(_.Field,{label:"Subject",htmlFor:"tm-s",children:(0,s.jsx)(_.Input,{id:"tm-s",value:r,onChange:e=>l(e.target.value),placeholder:`About ${e.first_name}`})}),(0,s.jsx)(_.Field,{label:"Message",htmlFor:"tm-b",required:!0,children:(0,s.jsx)("textarea",{id:"tm-b",rows:5,value:d,onChange:e=>x(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm"})})]})}var x=e.i(84524),b=e.i(77326),j=e.i(57850),g=e.i(52547),v=e.i(13927),y=e.i(55831),w=e.i(43531),S=e.i(75254);let k=(0,S.default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),E=(0,S.default)("eye-off",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var N=e.i(27389);function $({student:e,classId:a,onClose:i}){let{session:n}=(0,f.useSession)(),r=(0,c.useQueryClient)(),[l,d]=t.useState(""),[u,h]=t.useState(""),[p,x]=t.useState(""),[b,j]=t.useState(""),[g,v]=t.useState(!0),[y,S]=t.useState(!1),C=(0,o.useMutation)({mutationFn:async()=>(0,m.runAs)(n,s=>s(N.WRITE_FEEDBACK,[e.id,a??null,l.trim(),u.trim()||null,p.trim()||null,b.trim()||null,g])),onSuccess:()=>{S(!0),r.invalidateQueries({queryKey:["db"]})}}),R=l.trim().length>=3&&(u.trim()||p.trim());return(0,s.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:i,children:(0,s.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"fb-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:y?(0,s.jsxs)("div",{className:"py-4 text-center",children:[(0,s.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,s.jsx)(w.Check,{className:"size-5"})}),(0,s.jsx)("p",{id:"fb-title",className:"font-medium",children:g?"Shared with the family":"Saved as a draft"}),(0,s.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:g?`${e.first_name} and their guardians can see this now.`:"Only studio staff can see this until you share it."}),(0,s.jsx)(_.Button,{className:"mt-4 w-full",variant:"primary",onClick:i,children:"Done"})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("h2",{id:"fb-title",className:"text-[17px] font-semibold tracking-tight",children:["Feedback for ",e.first_name]}),(0,s.jsxs)("div",{className:"mt-4 space-y-3",children:[(0,s.jsx)(_.Field,{label:"Headline",htmlFor:"fb-head",required:!0,hint:"What this week was about, in a few words.",children:(0,s.jsx)(_.Input,{id:"fb-head",value:l,onChange:e=>d(e.target.value),placeholder:"Lovely week",maxLength:80})}),(0,s.jsx)(_.Field,{label:"Going well",htmlFor:"fb-well",children:(0,s.jsx)("textarea",{id:"fb-well",rows:3,value:u,onChange:e=>h(e.target.value),placeholder:"Be specific — it means more than 'good work'.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,s.jsx)(_.Field,{label:"To work on",htmlFor:"fb-work",children:(0,s.jsx)("textarea",{id:"fb-work",rows:3,value:p,onChange:e=>x(e.target.value),placeholder:"One thing to practise before next week.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,s.jsx)(_.Field,{label:"Private note",htmlFor:"fb-priv",hint:"Studio staff only. Never shown to the family, whatever you choose below.",children:(0,s.jsx)("textarea",{id:"fb-priv",rows:2,value:b,onChange:e=>j(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface-2 p-3 text-sm\n                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,s.jsxs)("label",{className:"flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-line p-3",children:[(0,s.jsx)("input",{type:"checkbox",checked:g,onChange:e=>v(e.target.checked),className:"mt-0.5 size-4 accent-[var(--color-accent)]"}),(0,s.jsxs)("span",{children:[(0,s.jsxs)("span",{className:"flex items-center gap-1.5 text-sm font-medium",children:[g?(0,s.jsx)(k,{className:"size-3.5","aria-hidden":!0}):(0,s.jsx)(E,{className:"size-3.5","aria-hidden":!0}),"Share with ",e.first_name," and their guardians"]}),(0,s.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:g?"They will see it as soon as you save.":"Saved as a draft. Nothing reaches the family until you share it."})]})]})]}),C.isError&&(0,s.jsx)("div",{className:"mt-3",children:(0,s.jsx)(_.ErrorState,{error:C.error})}),(0,s.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,s.jsx)(_.Button,{className:"flex-1",onClick:i,children:"Cancel"}),(0,s.jsx)(_.Button,{className:"flex-1",variant:"primary",loading:C.isPending,disabled:!R,onClick:()=>C.mutate(),children:g?"Save and share":"Save draft"})]})]})})})}var C=e.i(94512),R=e.i(75379),T=e.i(45060);function A(){let[e,o]=t.useState(""),[c,u]=t.useState(!1),[m,f]=t.useState(null),[h,w]=t.useState(null),[S,k]=t.useState(null),{selected:E,select:N}=(0,y.useSelection)(),A=(0,v.useRows)(["my-students"],C.MY_STUDENTS),L=A.data?.filter(e=>e.has_medical_need).length??0,I=(A.data??[]).filter(s=>(!e||`${s.preferred_name??s.first_name} ${s.first_name} ${s.last_name}`.toLowerCase().includes(e.toLowerCase()))&&(!c||s.has_medical_need)),O=A.data?.find(e=>e.id===E);return(0,s.jsxs)(b.Shell,{title:"My students",subtitle:A.data?`${A.data.length} across your classes${L?` \xb7 ${L} with medical information`:""}`:void 0,allow:["owner","admin","teacher"],children:[(0,s.jsx)("div",{className:"mx-auto max-w-5xl",children:(0,s.jsxs)("div",{className:(0,T.cn)("gap-5",E?"lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]":"block"),children:[(0,s.jsxs)("div",{className:"min-w-0 space-y-3",children:[(0,s.jsxs)("div",{className:"flex gap-2",children:[(0,s.jsx)(_.Input,{type:"search",value:e,onChange:e=>o(e.target.value),placeholder:"Search your students","aria-label":"Search your students"}),L>0&&(0,s.jsxs)(_.Button,{"aria-pressed":c,onClick:()=>u(e=>!e),className:(0,T.cn)("shrink-0",c&&"border-caution bg-caution-soft"),children:[(0,s.jsx)(n.HeartPulse,{className:"size-4 text-caution","aria-hidden":!0})," Medical ",(0,s.jsx)("span",{className:"tnum",children:L})]})]}),A.isLoading&&(0,s.jsx)(_.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,s.jsx)(_.Skeleton,{className:"h-12"},e))}),A.error&&(0,s.jsx)(_.ErrorState,{error:A.error}),0===I.length&&!A.isLoading&&(0,s.jsx)(_.Card,{children:(0,s.jsx)(_.EmptyState,{icon:(0,s.jsx)(a.Users,{className:"size-5"}),title:"No students found",body:c?"Nobody matching has medical information recorded.":"You only see children in classes you teach."})}),I.length>0&&(0,s.jsx)(_.Card,{children:(0,s.jsx)("ul",{className:"divide-y divide-line",children:I.map(e=>(0,s.jsx)("li",{children:(0,s.jsxs)("button",{onClick:()=>N(e.id),"aria-current":E===e.id||void 0,className:(0,T.cn)("flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2",E===e.id&&"bg-accent-soft/50"),children:[(0,s.jsx)("span",{"aria-hidden":!0,className:(0,T.cn)("grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold",e.requires_alert?"bg-critical-soft text-critical":e.has_medical_need?"bg-caution-soft text-caution":"bg-surface-2 text-ink-2"),children:(0,R.initials)(e.first_name,e.last_name)}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,s.jsxs)("span",{className:"truncate font-medium",children:[e.preferred_name??e.first_name," ",e.last_name]}),(0,s.jsx)(g.MedicalMarker,{brief:e})]}),(0,s.jsxs)("span",{className:"block truncate text-[12.5px] text-ink-2",children:[(0,R.ageFrom)(e.date_of_birth)," · ",e.class_names??"—"]})]}),null!=e.attendance_pct&&(0,s.jsxs)(_.Badge,{tone:e.attendance_pct>=85?"positive":e.attendance_pct>=70?"caution":"critical",children:[e.attendance_pct,"%"]})]})},e.id))})})]}),E&&(0,s.jsxs)(j.DetailPanel,{open:!0,onClose:()=>N(null),title:O?`${O.preferred_name??O.first_name} ${O.last_name}`:"Student",subtitle:O?`${(0,R.ageFrom)(O.date_of_birth)} years old`:void 0,children:[!O&&A.isLoading&&(0,s.jsx)(_.Skeleton,{className:"h-40"}),!O&&!A.isLoading&&(0,s.jsx)(_.EmptyState,{title:"Not one of your students",body:"You see children in classes you teach."}),O&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(j.DetailSection,{title:"Safety",children:[(0,s.jsx)(g.MedicalBrief,{brief:O,layout:"stack"}),(0,s.jsx)("p",{className:"mt-2 text-[12px] text-ink-3",children:"Kept up to date by the office. GP details stay with them."})]}),(0,s.jsx)(j.DetailSection,{title:"With you",children:(0,s.jsx)(j.KeyValue,{rows:[["Classes",O.class_names],["Attendance",null!=O.attendance_pct?`${O.attendance_pct}%`:null]]})}),(0,s.jsx)(j.DetailSection,{title:"Skills",children:(0,s.jsx)(x.SkillsPanel,{studentId:O.id,editable:!0})}),(0,s.jsx)(j.DetailSection,{title:"Goals this term",children:(0,s.jsx)(x.Goals,{studentId:O.id,mode:"teacher"})}),((0,R.ageFrom)(O.date_of_birth)??0)>=13&&(0,s.jsxs)(j.DetailSection,{title:"Their reflections",children:[(0,s.jsx)(x.Reflections,{studentId:O.id}),(0,s.jsx)("p",{className:"mt-1.5 text-[12px] text-ink-3",children:"Only you, their other teachers and the student see these. If one worries you, follow your safeguarding procedure."})]}),(0,s.jsx)(j.DetailSection,{title:"Milestones",children:(0,s.jsx)(x.Milestones,{studentId:O.id})}),(0,s.jsx)(j.DetailSection,{title:"Timeline",children:(0,s.jsx)(x.Timeline,{studentId:O.id,limit:8})}),(0,s.jsxs)(_.Button,{className:"w-full",onClick:()=>f(O),children:[(0,s.jsx)(i.MessageSquarePlus,{className:"size-4","aria-hidden":!0})," Write feedback"]}),(0,s.jsxs)(_.Button,{className:"mt-2 w-full",variant:"ghost",onClick:()=>w(O),children:[(0,s.jsx)(r.Mail,{className:"size-4","aria-hidden":!0})," Message the family"]}),(0,s.jsxs)(_.Button,{className:"mt-2 w-full",variant:"ghost",onClick:()=>k(O),children:[(0,s.jsx)(l.ShieldAlert,{className:"size-4","aria-hidden":!0})," Raise a safeguarding concern"]})]})]})]})}),S&&(0,s.jsx)(d.RaiseConcernSheet,{student:S,onClose:()=>k(null)}),h&&(0,s.jsx)(p,{student:h,onClose:()=>w(null)}),m&&(0,s.jsx)($,{student:m,onClose:()=>f(null)})]})}e.s(["default",0,function(){return(0,s.jsx)(t.Suspense,{fallback:(0,s.jsx)("div",{className:"min-h-dvh"}),children:(0,s.jsx)(A,{})})}],28887)},84524,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(42009),r=e.i(95468),l=e.i(78583),d=e.i(75254);let o=(0,d.default)("flag",[["path",{d:"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",key:"1jaruq"}]]);var c=e.i(15030),u=e.i(83086);let _=(0,d.default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);var m=e.i(17658),f=e.i(13927),h=e.i(30224),p=e.i(31502),x=e.i(36261),b=e.i(75379),j=e.i(45060);let g={not_started:"neutral",developing:"caution",secure:"info",mastered:"positive"},v=e=>x.LEVELS.find(s=>s.key===e)?.label??"Not yet assessed";function y(){let{session:e}=(0,p.useSession)(),s=(0,i.useQueryClient)();return(0,a.useMutation)({mutationFn:s=>(0,h.runAs)(e,e=>e(s.sql,s.params)),onSuccess:()=>s.invalidateQueries({queryKey:["db"]})})}let w={skill:_,feedback:c.MessageSquareHeart,milestone:n.Award,goal:o,report:l.FileText};e.s(["Goals",0,function({studentId:e,mode:a}){let i=(0,f.useRows)(["goals",e],x.GOALS,[e]),n=y(),[l,d]=t.useState(""),c=(i.data??[]).filter(e=>"proposed"===e.status||"agreed"===e.status),u=(i.data??[]).filter(e=>"achieved"===e.status);return(0,s.jsxs)("div",{className:"space-y-2",children:[null!=n.error&&(0,s.jsx)(m.ErrorState,{error:n.error}),0===c.length&&0===u.length&&(0,s.jsx)("p",{className:"text-[13px] text-ink-3",children:"No goals this term."}),(0,s.jsxs)("ul",{className:"space-y-1.5",children:[c.map(e=>(0,s.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,s.jsx)(o,{className:"size-3.5 text-accent-text","aria-hidden":!0}),(0,s.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"proposed"===e.status&&(0,s.jsx)(m.Badge,{tone:"caution",children:"Waiting for your teacher"}),"teacher"===a&&"proposed"===e.status&&(0,s.jsx)(m.Button,{size:"sm",onClick:()=>n.mutate({sql:x.SET_GOAL,params:[e.id,"agreed",null]}),children:"Agree"}),"teacher"===a&&"agreed"===e.status&&(0,s.jsxs)(m.Button,{size:"sm",variant:"primary",onClick:()=>n.mutate({sql:x.SET_GOAL,params:[e.id,"achieved",null]}),children:[(0,s.jsx)(r.CheckCircle2,{className:"size-4","aria-hidden":!0})," Achieved"]}),"teacher"===a&&(0,s.jsx)(m.Button,{size:"sm",variant:"ghost",onClick:()=>n.mutate({sql:x.SET_GOAL,params:[e.id,"dropped",null]}),children:"Drop"})]},e.id)),u.slice(0,3).map(e=>(0,s.jsxs)("li",{className:"flex items-center gap-2 text-sm text-ink-2",children:[(0,s.jsx)(r.CheckCircle2,{className:"size-3.5 text-positive","aria-hidden":!0})," ",e.text]},e.id))]}),"family"!==a&&c.length<2&&(0,s.jsxs)("form",{className:"flex gap-2",onSubmit:s=>{s.preventDefault(),l.trim().length>=3&&(n.mutate({sql:x.PROPOSE_GOAL,params:[e,l,"teacher"===a?"agreed":"proposed"]}),d(""))},children:[(0,s.jsx)(m.Input,{"aria-label":"A goal for this term",value:l,onChange:e=>d(e.target.value),maxLength:200,placeholder:"student"===a?"Something you want to get better at":"A goal for this term"}),(0,s.jsx)(m.Button,{type:"submit",disabled:l.trim().length<3,children:"Add"})]})]})},"Milestones",0,function({studentId:e}){let t=(0,f.useRows)(["milestones",e],x.MILESTONES,[e]);return t.data?.length?(0,s.jsx)("ul",{className:"flex flex-wrap gap-2","aria-label":"Milestones",children:t.data.map(e=>(0,s.jsxs)("li",{className:"inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent-ink",children:[(0,s.jsx)(n.Award,{className:"size-3.5","aria-hidden":!0})," ",e.title," ",(0,s.jsx)("span",{className:"text-[11.5px] opacity-70",children:(0,b.dateShort)(e.reached_on)})]},e.id))}):null},"Reflections",0,function({studentId:e}){let t=(0,f.useRows)(["reflections",e],x.REFLECTIONS,[e]);return t.data?.length?(0,s.jsx)("ul",{className:"space-y-1.5",children:t.data.map(e=>(0,s.jsxs)("li",{className:"flex gap-2 text-sm",children:[(0,s.jsx)("span",{"aria-label":`Mood ${e.mood} of 5`,className:"text-base leading-5",children:x.MOODS[e.mood-1]}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[e.text??(0,s.jsx)("span",{className:"text-ink-3",children:"No words"}),(0,s.jsxs)("span",{className:"block text-[12px] text-ink-3",children:[e.class_name??""," · ",(0,b.relativeDay)(e.created_at)]})]})]},e.id))}):(0,s.jsx)("p",{className:"text-[13px] text-ink-3",children:"No reflections."})},"ReportCard",0,function({r:e}){let t=e.summary;return(0,s.jsxs)("article",{className:"space-y-2 text-sm print:break-inside-avoid",children:[(0,s.jsxs)("header",{children:[(0,s.jsxs)("h3",{className:"font-semibold",children:[e.student_name," — ",e.class_name]}),(0,s.jsxs)("p",{className:"text-[12.5px] text-ink-3",children:[e.term_name,e.shared_at?` \xb7 shared ${(0,b.dateShort)(e.shared_at)}`:""]})]}),t.attendance&&t.attendance.of>0&&(0,s.jsxs)("p",{children:["Came to ",t.attendance.present," of ",t.attendance.of," classes."]}),!!t.skills?.length&&(0,s.jsx)("ul",{className:"grid gap-1 sm:grid-cols-2",children:t.skills.map(e=>(0,s.jsxs)("li",{className:"flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1",children:[(0,s.jsx)("span",{children:e.skill}),(0,s.jsxs)("span",{className:"text-[12.5px]",children:[e.from&&e.from!==e.level?`${v(e.from)} → `:"",(0,s.jsx)("b",{children:v(e.level)})]})]},e.skill))}),!!t.going_well?.length&&(0,s.jsxs)("p",{children:[(0,s.jsx)("b",{children:"Going well:"})," ",t.going_well.join(", "),"."]}),!!t.work_on?.length&&(0,s.jsxs)("p",{children:[(0,s.jsx)("b",{children:"To work on:"})," ",t.work_on.join(", "),"."]}),e.comment&&(0,s.jsx)("p",{className:"whitespace-pre-wrap rounded-[var(--radius-md)] border border-line p-2.5 italic",children:e.comment})]})},"SkillsPanel",0,function({studentId:e,editable:a}){let i=(0,f.useRows)(["skills",e],x.STUDENT_SKILLS,[e]),n=y(),r=t.useMemo(()=>{let e=new Map;return(i.data??[]).forEach(s=>e.set(s.framework,[...e.get(s.framework)??[],s])),[...e.entries()]},[i.data]);return i.isLoading?(0,s.jsx)(m.Skeleton,{className:"h-24"}):r.length?(0,s.jsxs)("div",{className:"space-y-3",children:[null!=n.error&&(0,s.jsx)(m.ErrorState,{error:n.error}),r.map(([t,i])=>(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3",children:t}),(0,s.jsx)("ul",{className:"space-y-1.5",children:i.map(t=>(0,s.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[t.skill,t.previous&&t.level&&t.previous!==t.level&&(0,s.jsx)(_,{className:"ml-1 inline size-3.5 text-positive","aria-label":"Improved"})]}),a?(0,s.jsx)("span",{role:"radiogroup","aria-label":`${t.skill} level`,className:"inline-flex rounded-[var(--radius-md)] border border-line p-0.5",children:x.LEVELS.slice(1).map(a=>(0,s.jsx)("button",{role:"radio","aria-checked":t.level===a.key,title:a.label,onClick:()=>n.mutate({sql:x.RECORD_SKILL,params:[e,t.skill_id,a.key,null]}),className:(0,j.cn)("h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[12px]",t.level===a.key?"bg-accent font-semibold text-on-accent":"text-ink-2 hover:bg-surface-2"),children:a.short},a.key))}):(0,s.jsx)(m.Badge,{tone:t.level?g[t.level]:"neutral",children:v(t.level)})]},t.skill_id))})]},t)),a&&(0,s.jsx)("p",{className:"text-[12px] text-ink-3",children:"D developing · S secure · M mastered. Families see levels straight away."})]}):(0,s.jsx)("p",{className:"text-[13px] text-ink-3",children:"No skills yet — they appear once the child is in a class."})},"Timeline",0,function({studentId:e,limit:a=30}){let i=(0,f.useRows)(["timeline",e],x.TIMELINE,[e]),[n,r]=t.useState(!1),l=t.useMemo(()=>{let e=Date.now()-7776e6;return(i.data??[]).filter(s=>"skill"===s.kind&&new Date(s.at).getTime()>e&&s.previous&&s.level!==s.previous).length},[i.data]);if(i.isLoading)return(0,s.jsx)(m.Skeleton,{className:"h-24"});if(!i.data?.length)return(0,s.jsx)(m.EmptyState,{title:"Nothing yet",body:"Skills, feedback and milestones appear here as they happen."});let d=n?i.data:i.data.slice(0,a);return(0,s.jsxs)("div",{children:[l>0&&(0,s.jsxs)("p",{className:"mb-2 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-positive-soft px-3 py-2 text-[13px]",children:[(0,s.jsx)(_,{className:"size-4 text-positive","aria-hidden":!0})," ",l," skill",1===l?"":"s"," moved up in the last three months."]}),(0,s.jsx)("ol",{className:"relative space-y-3 border-l border-line pl-4",children:d.map((e,t)=>{let a=w[e.kind]??u.Sparkles;return(0,s.jsxs)("li",{className:"relative",children:[(0,s.jsx)("span",{className:"absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line",children:(0,s.jsx)(a,{className:"size-3 text-accent-text","aria-hidden":!0})}),(0,s.jsx)("p",{className:"text-[12px] text-ink-3",children:(0,b.relativeDay)(e.at)}),(0,s.jsxs)("p",{className:"text-sm font-medium",children:[e.title,"skill"===e.kind&&(0,s.jsxs)(s.Fragment,{children:[" — ",e.previous?`${v(e.previous)} → `:"",v(e.level)]}),"goal"===e.kind&&e.detail&&(0,s.jsx)(m.Badge,{tone:"achieved"===e.detail?"positive":"neutral",className:"ml-2",children:e.detail})]}),"goal"!==e.kind&&e.detail&&(0,s.jsx)("p",{className:"text-[13px] text-ink-2",children:e.detail})]},t)})}),!n&&i.data.length>a&&(0,s.jsx)(m.Button,{size:"sm",variant:"ghost",className:"mt-2",onClick:()=>r(!0),children:"Show everything"})]})}],84524)},27389,e=>{"use strict";let s=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes,
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,t=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,a=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('title', r.title, 'starts_at', r.starts_at) order by r.starts_at)
                   from studio_event r where r.parent_event_id = ev.id and r.deleted_at is null and r.status = 'published'), '[]') as rehearsals,
       coalesce((select jsonb_agg(jsonb_build_object('title', rt.title, 'costume', rt.costume, 'position', rt.position) order by rt.position)
                   from event_routine rt where rt.event_id = ev.id and rt.deleted_at is null
                    and (exists (select 1 from routine_dancer d where d.routine_id = rt.id)
                         or rt.class_id in (select e.class_id from enrolment e where e.status = 'active' and e.deleted_at is null))), '[]') as routines
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day' and ev.parent_event_id is null
 order by ev.starts_at`,i=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,n=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,r=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,l=`
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
 order by starts_at`,d=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,o=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,c=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,u=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,_=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,m=`
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
       f.file_name, f.mime_type, f.size_bytes,
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
 where r.deleted_at is null
   and (a.id is not null
        or not exists (select 1 from resource_assignment a2
                        where a2.resource_id = r.id and a2.deleted_at is null))
 order by (a.id is null), r.kind, r.created_at desc`,h=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,p=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,x=`
select app.retire_resource($1) as ok`,b=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,_,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,x,"EVENTS",0,a,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,i,"RESOURCES",0,s,"STUDENT_FEEDBACK",0,t,"WRITE_FEEDBACK",0,d])},36261,e=>{"use strict";let s=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,t=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,a=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,i=`
select s.id as student_id, s.first_name, s.last_name, a.status::text as status,
       f.going_well, f.work_on, f.shared_at is not null as shared
  from class_session cs
  join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
       and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  join student s on s.id = e.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
 where cs.id = $1
 order by (a.status in ('present', 'late')) desc nulls last, s.first_name`,n=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,r=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,l=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,d=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,o=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,s,"ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,a,"CHIPS",0,"select id, kind, label, position from feedback_chip order by kind, position, label","CLASS_REPORTS",0,n,"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,t,"GOALS",0,l,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,o,"MY_REPORTS",0,r,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,d,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,i,"SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","STUDENT_SKILLS",0,"select * from app.student_skills($1)","TIMELINE",0,"select * from app.student_timeline($1) limit 200"])},94512,e=>{"use strict";let s=`
with me as (select id from staff_member where user_id = auth.uid() and deleted_at is null)
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at, cs.cancel_reason,
       (cs.teacher_id in (select id from me) and c.teacher_id not in (select id from me)) as covering,
       case when cs.teacher_id is not null and cs.teacher_id not in (select id from me)
            then (select display_name from staff_member where id = cs.teacher_id) end as covered_by,
       exists (select 1 from studio_request q where q.session_id = cs.id and q.status in ('open','in_progress')
                and q.deleted_at is null) as cover_requested
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
   -- Mine: classes I teach or assist, and sessions I am covering.
   and (c.teacher_id in (select id from me) or c.assistant_id in (select id from me) or cs.teacher_id in (select id from me))
 order by cs.starts_at`,t=`coalesce(b.requires_alert, false) as requires_alert,
       coalesce(b.has_medical_need, false) as has_medical_need,
       b.allergies, b.conditions, b.medications, b.action_plan,
       b.emergency_contact_name, b.emergency_contact_phone,
       coalesce(b.emergency_contacts, '[]'::jsonb) as emergency_contacts, b.photo_consent`,a=`
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
       ${t},
       (select round(100.0 * count(*) filter (where a2.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record a2 where a2.student_id = roll.id and a2.deleted_at is null) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`,i=`
insert into attendance_record (studio_id, session_id, student_id, status, reason, marked_by, client_marked_at)
select c.studio_id, $1, $2, $3::attendance_status, $4, auth.uid(), coalesce($5::timestamptz, now())
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
on conflict (session_id, student_id) do update
  set status = excluded.status, reason = excluded.reason,
      marked_by = excluded.marked_by, marked_at = now(),
      client_marked_at = excluded.client_marked_at
  where attendance_record.client_marked_at is null
     or excluded.client_marked_at >= attendance_record.client_marked_at
returning id, status`,n=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       ${t},
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
 order by s.last_name, s.first_name`,r=`
update class_session set notes = nullif(btrim($2), ''), updated_at = now()
 where id = $1
returning id, notes`,l=`
update attendance_record set reason = nullif(btrim($3), ''), updated_at = now()
 where session_id = $1 and student_id = $2 and deleted_at is null
returning id, reason`,d=`
update class_session set register_closed_at = null, updated_at = now()
 where id = $1
returning id`,o=`
select cm.id, cm.subject, cm.body, cm.sent_at,
       coalesce(sm.display_name, u.full_name) as sent_by_name,
       c.name as class_name,
       (cm.sent_by = auth.uid()) as mine
  from communication cm
  left join class c on c.id = cm.class_id
  left join user_account u on u.id = cm.sent_by
  left join staff_member sm on sm.user_id = cm.sent_by and sm.deleted_at is null
 where cm.deleted_at is null and cm.kind = 'class_broadcast' and cm.class_id = $1
 order by cm.sent_at desc`,c=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_by)
select c.studio_id, 'class_broadcast', 'in_app', c.id, nullif(btrim($2), ''), btrim($3), auth.uid()
  from class c where c.id = $1
returning id`,u=`
update communication set subject = nullif(btrim($2), ''), body = btrim($3), updated_at = now()
 where id = $1
returning id`,_=`
with me as (select id from staff_member where user_id = auth.uid() and deleted_at is null),
     this as (select starts_at from class_session where id = $1)
select cs.id, c.name, cs.starts_at from class_session cs join class c on c.id = cs.class_id
 where cs.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at > (select starts_at from this)
   and cs.starts_at < date_trunc('day', (select starts_at from this)) + interval '1 day'
   and (c.teacher_id in (select id from me) or c.assistant_id in (select id from me) or cs.teacher_id in (select id from me))
 order by cs.starts_at limit 1`;e.s(["CLASS_NOTICES",0,o,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,u,"MARK_ATTENDANCE",0,i,"MY_SESSIONS",0,s,"MY_STUDENTS",0,n,"NEXT_SESSION",0,_,"POST_NOTICE",0,c,"REGISTER",0,a,"REOPEN_REGISTER",0,d,"REQUEST_COVER",0,"select app.request_cover($1, $2) as id","SAVE_SESSION_NOTES",0,r,"SET_REASON",0,l,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])}]);