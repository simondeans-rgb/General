(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,23622,e=>{"use strict";let s=(0,e.i(75254).default)("ban",[["path",{d:"M4.929 4.929 19.07 19.071",key:"196cmz"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Ban",0,s],23622)},63939,e=>{"use strict";let s=(0,e.i(75254).default)("corner-down-left",[["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}],["path",{d:"m9 10-5 5 5 5",key:"1kshq7"}]]);e.s(["CornerDownLeft",0,s],63939)},21840,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(43531),r=e.i(37727),l=e.i(86311),d=e.i(75254);let o=(0,d.default)("clipboard-plus",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M9 14h6",key:"159ibu"}],["path",{d:"M12 17v-6",key:"1y8rbf"}]]);var c=e.i(63939);let m=(0,d.default)("user-round-check",[["path",{d:"M2 21a8 8 0 0 1 13.292-6",key:"bjp14o"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["path",{d:"m16 19 2 2 4-4",key:"1b14m6"}]]);var _=e.i(45060),u=e.i(65712),h=e.i(42268),f=e.i(77326),p=e.i(13927),y=e.i(30224),g=e.i(31502),x=e.i(17658);e.i(14979);var b=e.i(27389),v=e.i(21011),j=e.i(7725),w=e.i(75379);let $={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",data_request:"Data request",other:"Other"};function E({request:e,onClose:n}){let{session:r}=(0,g.useSession)(),l=(0,i.useQueryClient)(),[d,o]=t.useState(""),[c,m]=t.useState(!1),_=(0,a.useMutation)({mutationFn:async()=>(0,y.runAs)(r,s=>s(b.ANSWER_REQUEST,[e.id,d.trim()])),onSuccess:()=>{m(!0),l.invalidateQueries({queryKey:["db"]})}});return(0,s.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:n,children:(0,s.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ans-t",onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]",children:c?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"px-5 py-6",children:[(0,s.jsx)("h2",{id:"ans-t",className:"sr-only",children:"Replied"}),(0,s.jsx)(x.StatusLine,{title:e.subject,detail:"The family sees your answer in their hub."})]}),(0,s.jsx)("div",{className:"flex border-t border-line px-5 py-3 pb-safe sm:justify-end",children:(0,s.jsx)(x.Button,{className:"w-full sm:w-auto",variant:"primary",onClick:n,children:"Done"})})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"border-b border-line px-5 pb-3 pt-4",children:[(0,s.jsx)("h2",{id:"ans-t",className:"font-display text-[1.25rem] leading-tight",children:"Reply"}),(0,s.jsx)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:e.subject})]}),(0,s.jsxs)("div",{className:"min-h-0 flex-1 overflow-y-auto px-5 py-4",children:[(0,s.jsx)("blockquote",{className:"border-l-2 border-line-strong pl-3 text-[0.9062rem] text-ink-2",children:e.body}),(0,s.jsx)("label",{htmlFor:"ans-body",className:"mt-4 block text-[0.8125rem] font-medium text-ink-2",children:"Your reply"}),(0,s.jsx)("textarea",{id:"ans-body",value:d,onChange:e=>o(e.target.value),rows:4,placeholder:"Write your reply…",className:"mt-1.5 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),_.isError&&(0,s.jsx)("div",{className:"mt-3",children:(0,s.jsx)(x.ErrorState,{error:_.error})})]}),(0,s.jsxs)("div",{className:"flex gap-2 border-t border-line px-5 py-3 pb-safe sm:justify-end",children:[(0,s.jsx)(x.Button,{className:"flex-1 sm:flex-none",variant:"ghost",onClick:n,children:"Cancel"}),(0,s.jsx)(x.Button,{className:"flex-[2] sm:flex-none",variant:"primary",loading:_.isPending,disabled:d.trim().length<2,onClick:()=>_.mutate(),children:"Send reply"})]})]})})})}function S({request:e,onClose:n,onDone:r}){let{session:l}=(0,g.useSession)(),d=(0,i.useQueryClient)(),[o,m]=t.useState(e.student_id??(1===e.children.length?e.children[0].id:"")),_=e.children.find(e=>e.id===o),f=(0,p.useRows)(["medical",o],h.MEDICAL,[o],{enabled:!!o}),v=f.data?.[0],[j,w]=t.useState({}),[$,E]=t.useState(!1),[N,k]=t.useState(null);t.useEffect(()=>{o&&!f.isPending&&N!==o&&(w({allergies:v?.allergies??"",conditions:v?.conditions??"",medications:v?.medications??"",action_plan:v?.action_plan??""}),E(v?.requires_alert??!1),k(o))},[o,f.isPending,v,N]);let C=(_?.name??e.student_name??"").split(" ")[0]||"your child",A=(e.guardian_name??"").split(" ")[0],[T,R]=t.useState("");t.useEffect(()=>{R(`Thank you${A?`, ${A}`:""} — we have updated ${C}'s medical record, and their teachers can now see it.`)},[C,A]);let I=(0,a.useMutation)({mutationFn:()=>(0,y.runAs)(l,s=>s(b.ACK_MEDICAL,[e.id,JSON.stringify({...j,requires_alert:$}),T,e.student_id?null:o])),onSuccess:()=>{d.invalidateQueries({queryKey:["db"]}),r(`${C}’s record is updated, ${e.guardian_name??"the family"} has been told, and teachers can see it.`)}}),O=!!o&&N===o,M=O&&($!==(v?.requires_alert??!1)||["allergies","conditions","medications","action_plan"].some(e=>(j[e]??"").trim()!==(v?.[e]??"").trim()));return(0,s.jsxs)(u.RecordSheet,{title:"Add to the medical record",subtitle:`${e.guardian_name??e.family_name}${_?` \xb7 ${_.name}`:""}`,onClose:n,onSave:()=>I.mutate(),saving:I.isPending,error:I.error,canSave:M&&T.trim().length>3,saveLabel:"Update record and tell the parent",children:[(0,s.jsxs)("figure",{className:"border-l-2 border-critical pl-3",children:[(0,s.jsxs)("figcaption",{className:"text-[0.8125rem] text-ink-3",children:[e.guardian_name??"The parent"," wrote · ",e.subject]}),(0,s.jsx)("blockquote",{className:"mt-1 text-[0.9375rem] font-medium",children:e.body})]}),!e.student_id&&e.children.length>1&&(0,s.jsx)(x.Field,{label:"Which child",htmlFor:"ru-child",required:!0,children:(0,s.jsxs)(x.Select,{id:"ru-child",value:o,onChange:e=>m(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Choose…"}),e.children.map(e=>(0,s.jsx)("option",{value:e.id,children:e.name},e.id))]})}),o&&!O&&(0,s.jsx)(x.Skeleton,{className:"h-40"}),O&&(0,s.jsxs)(s.Fragment,{children:[[["allergies","Allergies","Peanuts — carries an EpiPen"],["conditions","Conditions","Asthma"],["medications","Medication","Blue inhaler, front pocket of her bag"],["action_plan","What to do in an emergency","Two puffs of the inhaler, sit her down, call home"]].map(([t,a,i])=>(0,s.jsxs)(x.Field,{label:a,htmlFor:`ru-${t}`,children:[(0,s.jsx)("textarea",{id:`ru-${t}`,rows:2,value:j[t]??"",placeholder:i,onChange:e=>w(s=>({...s,[t]:e.target.value})),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),(0,s.jsxs)("button",{type:"button",onClick:()=>w(s=>({...s,[t]:s[t]?.trim()?`${s[t].trim()}
${e.body}`:e.body})),className:"mt-1 inline-flex min-h-[36px] items-center gap-1 text-[0.8125rem] font-semibold text-accent-text hover:underline",children:[(0,s.jsx)(c.CornerDownLeft,{className:"size-3.5","aria-hidden":!0})," Add the parent’s words here"]})]},t)),(0,s.jsxs)("label",{className:"flex min-h-[44px] items-start gap-3 text-[0.875rem]",children:[(0,s.jsx)("input",{type:"checkbox",checked:$,onChange:e=>E(e.target.checked),className:"mt-0.5 size-[18px] accent-[var(--color-accent)]"}),(0,s.jsxs)("span",{children:[(0,s.jsx)("span",{className:"font-semibold",children:"Urgent — show a red alert"}),(0,s.jsx)("span",{className:"mt-0.5 block text-[0.8125rem] text-ink-3",children:"Teachers see every detail above either way."})]})]}),(0,s.jsx)(x.Field,{label:"Message to the parent",htmlFor:"ru-msg",required:!0,children:(0,s.jsx)("textarea",{id:"ru-msg",rows:3,value:T,onChange:e=>R(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),!M&&(0,s.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"Change the record above to save — or use Acknowledge if nothing needs changing."})]})]})}e.s(["default",0,function(){let{session:e}=(0,g.useSession)(),d=(0,i.useQueryClient)(),c=(0,p.useRows)(["pending-requests"],b.PENDING_REQUESTS),u=(0,p.useRows)(["pending-entries"],b.PENDING_ENTRIES),[h,N]=t.useState(null),[k,C]=t.useState(null),[A,T]=t.useState(null),[R,I]=t.useState(null),O=(0,a.useMutation)({mutationFn:async s=>(await (0,y.readAs)(e,v.SESSION_BY_ID,[s]))[0],onSuccess:e=>e&&I(e)}),M=(0,a.useMutation)({mutationFn:async s=>(0,y.runAs)(e,e=>e(b.ACK_MEDICAL,[s.id,null,null,null])),onSuccess:(e,s)=>{T(`${s.guardian_name??s.family_name} has been told you received it. It is still to be added to ${s.student_name??"the child"}’s record.`),d.invalidateQueries({queryKey:["db"]})}}),L=(0,a.useMutation)({mutationFn:async s=>{let t="join_class"===s.action?b.APPROVE_PLACE:"add_child"===s.action?b.APPROVE_CHILD:b.APPROVE_TRIAL,a=await (0,y.runAs)(e,e=>e(t,"join_class"===s.action?[s.id,null]:[s.id]));return{r:s,outcome:a[0]?.outcome}},onSuccess:({r:e,outcome:s})=>{T("join_class"===e.action?"enrolled"===s?`Done — enrolled in ${e.class_name}, and the family has been told.`:`${e.class_name} is full, so they are on the waiting list. The family has been told.`:"add_child"===e.action?"Added to the family, with the parent as emergency contact. They have been told.":"Trial booked and the family told."),d.invalidateQueries({queryKey:["db"]})}}),F=(0,a.useMutation)({mutationFn:async s=>(0,y.runAs)(e,e=>e(b.DECIDE_ENTRY,[s.id,s.status])),onSuccess:()=>d.invalidateQueries({queryKey:["db"]})}),q=(c.data?.length??0)+(u.data?.length??0);return(0,s.jsxs)(f.Shell,{title:"Requests",allow:["owner","admin"],subtitle:q?`${q} waiting on you`:"Nothing waiting",children:[(0,s.jsxs)("div",{className:"mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",children:[(0,s.jsxs)("section",{className:"min-w-0",children:[(0,s.jsx)(x.SectionHead,{title:"From families",meta:c.data?.length?`${c.data.length} \xb7 medical updates first`:void 0}),c.isLoading&&(0,s.jsx)("div",{className:"space-y-2 pt-3",children:[0,1].map(e=>(0,s.jsx)(x.Skeleton,{className:"h-20"},e))}),c.data?.length===0&&!c.isLoading&&(0,s.jsx)(x.EmptyState,{title:"Nothing unanswered",body:"Questions and updates from parents and students land here."}),A&&(0,s.jsx)("div",{role:"status",className:"border-b border-line py-3",children:(0,s.jsx)(x.StatusLine,{title:A})}),null!=M.error&&(0,s.jsx)("div",{className:"pt-3",children:(0,s.jsx)(x.ErrorState,{error:M.error})}),null!=L.error&&(0,s.jsx)("div",{className:"pt-3",children:(0,s.jsx)(x.ErrorState,{error:L.error})}),(0,s.jsx)("ul",{className:"divide-y divide-line",children:c.data?.map((e,t)=>{let a="medical_update"===e.kind,i=0===t?"primary":"secondary";return(0,s.jsxs)("li",{className:(0,_.cn)("px-1 py-4",a&&"border-l-2 border-critical pl-3"),children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-baseline gap-x-2 gap-y-1",children:[(0,s.jsx)(x.Word,{tone:a?"critical":"ink",children:$[e.kind]??e.kind}),(0,s.jsxs)("span",{className:"text-[0.8125rem] text-ink-3",children:[e.guardian_name??e.family_name,e.student_name?` \xb7 about ${e.student_name}`:""]}),(0,s.jsx)("span",{className:"ml-auto text-[0.7812rem] text-ink-3",children:(0,w.relativeDay)(e.created_at)})]}),(0,s.jsx)("p",{className:"mt-1.5 font-semibold",children:e.subject}),(0,s.jsx)("p",{className:"mt-0.5 text-[0.9062rem] text-ink-2",children:e.body}),(0,s.jsx)("div",{className:"mt-3 flex flex-wrap gap-2",children:a?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(x.Button,{size:"sm",variant:i,onClick:()=>C(e),children:[(0,s.jsx)(o,{className:"size-4","aria-hidden":!0})," Acknowledge & add to record"]}),(0,s.jsxs)(x.Button,{size:"sm",loading:M.isPending&&M.variables?.id===e.id,onClick:()=>M.mutate(e),children:[(0,s.jsx)(n.Check,{className:"size-4","aria-hidden":!0})," Acknowledge"]}),(0,s.jsxs)(x.Button,{size:"sm",variant:"ghost",onClick:()=>N(e),children:[(0,s.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):e.action?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(x.Button,{size:"sm",variant:i,loading:L.isPending&&L.variables?.id===e.id,onClick:()=>L.mutate(e),children:[(0,s.jsx)(n.Check,{className:"size-4","aria-hidden":!0}),"join_class"===e.action?"Give them a place":"add_child"===e.action?"Add to the family":"Book the trial"]}),(0,s.jsxs)(x.Button,{size:"sm",variant:"ghost",onClick:()=>N(e),children:[(0,s.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply instead"]})]}):e.session_id?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(x.Button,{size:"sm",variant:i,loading:O.isPending&&O.variables===e.session_id,onClick:()=>O.mutate(e.session_id),children:[(0,s.jsx)(m,{className:"size-4","aria-hidden":!0})," Arrange cover"]}),(0,s.jsxs)(x.Button,{size:"sm",variant:"ghost",onClick:()=>N(e),children:[(0,s.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):(0,s.jsxs)(x.Button,{size:"sm",onClick:()=>N(e),children:[(0,s.jsx)(l.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})})]},e.id)})})]}),(0,s.jsxs)("section",{className:"min-w-0",children:[(0,s.jsx)(x.SectionHead,{title:"Event and competition entries",meta:u.data?.length?`${u.data.length}`:void 0}),(0,s.jsx)("p",{className:"py-2 text-[0.8125rem] text-ink-3",children:"Nothing is in the diary until you confirm it."}),u.isLoading&&(0,s.jsx)("div",{className:"space-y-2",children:[0,1].map(e=>(0,s.jsx)(x.Skeleton,{className:"h-14"},e))}),u.error&&(0,s.jsx)(x.ErrorState,{error:u.error}),u.data?.length===0&&!u.isLoading&&(0,s.jsx)("p",{className:"border-t border-line py-3 text-[0.875rem] text-ink-3",children:"No entries waiting."}),(0,s.jsx)("ul",{className:"divide-y divide-line border-t border-line",children:u.data?.map(e=>(0,s.jsxs)("li",{className:"flex flex-wrap items-center gap-x-3 gap-y-2 px-1 py-3",children:[(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:"block truncate font-semibold",children:e.student_name}),(0,s.jsxs)("span",{className:"block text-[0.8125rem] text-ink-3",children:[e.event_title," · ",(0,w.dateLong)(e.starts_at),", ",(0,w.time)(e.starts_at)]})]}),(0,s.jsxs)("span",{className:"flex shrink-0 gap-2",children:[(0,s.jsxs)(x.Button,{size:"sm",variant:"ghost",loading:F.isPending,onClick:()=>F.mutate({id:e.id,status:"declined"}),children:[(0,s.jsx)(r.X,{className:"size-4","aria-hidden":!0})," Decline"]}),(0,s.jsxs)(x.Button,{size:"sm",loading:F.isPending,onClick:()=>F.mutate({id:e.id,status:"confirmed"}),children:[(0,s.jsx)(n.Check,{className:"size-4","aria-hidden":!0})," Confirm"]})]})]},e.id))})]})]}),R&&(0,s.jsx)(j.SessionSheet,{session:R,initial:"cover",onClose:()=>I(null)}),h&&(0,s.jsx)(E,{request:h,onClose:()=>N(null)}),k&&(0,s.jsx)(S,{request:k,onClose:()=>C(null),onDone:e=>{C(null),T(e)}})]})}],21840)},14979,e=>{"use strict";var s=e.i(43476),t=e.i(22016),a=e.i(17658),i=e.i(75379),n=e.i(45060);e.s(["SessionRow",0,function({session:e,href:r,onSelect:l}){let d="cancelled"===e.status,o=!d&&e.enrolled>=e.capacity,c=(0,s.jsxs)("span",{className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.75rem]",children:[(0,s.jsxs)("span",{className:"self-start pt-0.5",children:[(0,s.jsx)("span",{className:(0,n.cn)("block font-display text-[1.1875rem] leading-none tnum",d&&"text-ink-3 line-through"),children:(0,i.time)(e.starts_at)}),(0,s.jsx)("span",{className:"mt-1 block text-[0.7812rem] text-ink-3 tnum",children:(0,i.time)(e.ends_at)})]}),(0,s.jsxs)("span",{className:"min-w-0",children:[(0,s.jsxs)("span",{className:"flex min-w-0 flex-wrap items-baseline gap-x-2",children:[(0,s.jsx)("span",{className:(0,n.cn)("truncate font-semibold",d&&"text-ink-3 line-through"),children:e.name}),e.style&&(0,s.jsx)(a.StyleMark,{colour:e.colour,name:e.style,className:"text-[0.8125rem] text-ink-3"})]}),(0,s.jsx)("span",{className:"mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-[0.8125rem] text-ink-3",children:d?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(a.Word,{tone:"critical",children:"Cancelled"}),e.cancel_reason&&(0,s.jsx)("span",{className:"text-ink-2",children:e.cancel_reason})]}):(0,s.jsxs)(s.Fragment,{children:[e.moved&&(0,s.jsx)(a.Word,{children:"Moved"}),e.covered&&(0,s.jsx)(a.Word,{tone:"caution",children:"Cover"}),(0,s.jsxs)("span",{className:"truncate",children:[[e.teacher,e.room].filter(Boolean).join(" · "),e.trials>0?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]})})]}),!d&&(0,s.jsx)(a.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,tone:o?"caution":"accent",className:"hidden sm:inline-flex"}),(0,s.jsx)("span",{className:(0,n.cn)("text-right text-[0.8438rem] tnum",o?"font-semibold text-caution":"text-ink-2",d&&"sm:col-span-2"),children:d?"":(0,s.jsxs)(s.Fragment,{children:[e.enrolled,"/",e.capacity,o&&(0,s.jsx)("span",{className:"block text-[0.75rem]",children:"Full"})]})})]}),m="block w-full text-left transition-colors hover:bg-surface-2/60";return l?(0,s.jsx)("button",{onClick:l,className:m,children:c}):r?(0,s.jsx)(t.default,{href:r,className:m,children:c}):c}])},7725,e=>{"use strict";var s=e.i(43476),t=e.i(71645),a=e.i(22016),i=e.i(54616),n=e.i(12598),r=e.i(23622),l=e.i(75254);let d=(0,l.default)("calendar-clock",[["path",{d:"M16 14v2.2l1.6 1",key:"fo4ql5"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]]),o=(0,l.default)("user-round-cog",[["path",{d:"m14.305 19.53.923-.382",key:"3m78fa"}],["path",{d:"m15.228 16.852-.923-.383",key:"npixar"}],["path",{d:"m16.852 15.228-.383-.923",key:"5xggr7"}],["path",{d:"m16.852 20.772-.383.924",key:"dpfhf9"}],["path",{d:"m19.148 15.228.383-.923",key:"1reyyz"}],["path",{d:"m19.53 21.696-.382-.924",key:"1goivc"}],["path",{d:"M2 21a8 8 0 0 1 10.434-7.62",key:"1yezr2"}],["path",{d:"m20.772 16.852.924-.383",key:"htqkph"}],["path",{d:"m20.772 19.148.924.383",key:"9w9pjp"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}]]);var c=e.i(54385),m=e.i(65712),_=e.i(13927),u=e.i(30224),h=e.i(31502),f=e.i(17658),p=e.i(21011),y=e.i(75379),g=e.i(45060);e.s(["SessionSheet",0,function({session:e,onClose:l,initial:x="menu"}){let{session:b}=(0,h.useSession)(),v=(0,n.useQueryClient)(),[j,w]=t.useState(x),[$,E]=t.useState(null),S=(0,_.useRows)(["session-families",e.id],p.SESSION_FAMILIES,[e.id]).data?.[0]?.n??0,N=(0,_.useRows)(["staff-options"],p.STAFF_OPTIONS,[],{enabled:"cover"===j}),k=(0,_.useRows)(["room-options"],p.ROOM_OPTIONS,[],{enabled:"move"===j}),C=`${e.name} on ${(0,y.dateLong)(e.starts_at)} at ${(0,y.time)(e.starts_at)}`,[A,T]=t.useState(""),[R,I]=t.useState(""),[O,M]=t.useState(!0),[L,F]=t.useState((0,y.isoDate)(e.starts_at)),[q,D]=t.useState((0,y.time)(e.starts_at)),[P,U]=t.useState(e.room_id??""),[z,B]=t.useState(""),[V,Q]=t.useState(""),[Y,G]=t.useState(!1),W=(0,_.useRows)(["cover-clashes",e.id,z],p.COVER_CLASHES,[e.id,z],{enabled:"cover"===j&&!!z}),H=W.data??[];t.useEffect(()=>{G(!1)},[z]);let K=(0,_.useRows)(["session-handover",e.id],p.SESSION_HANDOVER,[e.id],{enabled:"cover"===j}).data?.[0]?.handover_note;t.useEffect(()=>{K&&Q(e=>e||K)},[K]);let X=e.trials??0;t.useEffect(()=>{"cancel"===j&&I(`Sorry — ${C} is cancelled${A?` (${A.trim()})`:""}. We will see you next week.`)},[j,A,C]),t.useEffect(()=>{"move"===j&&I(`${C} is moving to ${L?(0,y.dateLong)(L):"…"} at ${q}${k.data?.find(e=>e.id===P)?`, ${k.data.find(e=>e.id===P).name}`:""}.`)},[j,L,q,P,k.data,C]),t.useEffect(()=>{let e=N.data?.find(e=>e.id===z)?.display_name;"cover"===j&&I(e?`${e} will be teaching ${C}.`:"")},[j,z,N.data,C]);let J=(0,i.useMutation)({mutationFn:async()=>(0,u.runAs)(b,s=>{if("cancel"===j)return s(p.CANCEL_SESSION,[e.id,A.trim(),R,O]);if("move"===j){let t=new Date(`${L}T${q}:00`);return s(p.MOVE_SESSION,[e.id,t.toISOString(),P||null,R,O])}return s(p.COVER_SESSION,[e.id,z||null,R,O,V.trim()||null,Y])}),onSuccess:()=>{v.invalidateQueries({queryKey:["db"]}),E("cancel"===j?`Cancelled.${O?` ${S} famil${1===S?"y has":"ies have"} been told, and the teacher.`:""}${X?` ${X} trial${1===X?" needs":"s need"} a new date — see Enrolment.`:""}`:"move"===j?`Moved.${O?` ${S} famil${1===S?"y has":"ies have"} been told.`:""}`:"Cover arranged. The teacher has the register, safety notes and handover on their Today screen on the day.")}});if($)return(0,s.jsx)(m.RecordSheet,{title:e.name,onClose:l,onSave:l,saveLabel:"Close",children:(0,s.jsx)(f.StatusLine,{title:$})});if("menu"===j){let t="cancelled"===e.status;return(0,s.jsxs)(m.RecordSheet,{title:e.name,subtitle:`${(0,y.dateLong)(e.starts_at)} \xb7 ${(0,y.time)(e.starts_at)}–${(0,y.time)(e.ends_at)}${e.room?` \xb7 ${e.room}`:""}`,onClose:l,onSave:l,saveLabel:"Close",children:[t&&(0,s.jsx)(f.Notice,{word:"Cancelled",tone:"critical",title:e.cancel_reason||"This session will not run"}),(0,s.jsxs)("dl",{className:"grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 text-[0.875rem]",children:[e.teacher&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("dt",{className:"text-ink-3",children:"Teacher"}),(0,s.jsxs)("dd",{children:[e.teacher,e.covered?(0,s.jsxs)("span",{className:"text-ink-3",children:[" · covering for ",e.usual_teacher]}):""]})]}),(0,s.jsx)("dt",{className:"text-ink-3",children:"Booked"}),(0,s.jsxs)("dd",{className:"flex items-center gap-2",children:[(0,s.jsx)(f.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`}),(0,s.jsxs)("span",{className:"tnum",children:[e.enrolled," of ",e.capacity,e.trials?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]})]}),(0,s.jsx)("ul",{className:"divide-y divide-line border-y border-line",children:[["register",c.ClipboardCheck,"Open the register","Mark attendance for this session"],["cancel",r.Ban,"Cancel this session","Just this one — the rest of the term is unchanged"],["move",d,"Move this session","Another day, time or room"],["cover",o,e.covered?"Change cover":"Arrange cover","Another teacher for this session only"]].map(([i,n,r,l])=>{let d=t?"register"!==i:e.register_closed&&"register"!==i,o=(0,s.jsxs)("span",{className:(0,g.cn)("flex min-h-[56px] items-center gap-3 px-1 py-2.5 text-left",d&&"opacity-50"),children:[(0,s.jsx)(n,{className:(0,g.cn)("size-4 shrink-0","cancel"===i?"text-critical":"text-ink-3"),"aria-hidden":!0}),(0,s.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,s.jsx)("span",{className:(0,g.cn)("block text-[0.9375rem] font-semibold","cancel"===i&&"text-critical"),children:r}),(0,s.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:l})]})]});return(0,s.jsx)("li",{children:"register"===i?(0,s.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,className:"block hover:bg-surface-2",children:o}):(0,s.jsx)("button",{disabled:d,onClick:()=>w(i),className:"block w-full hover:bg-surface-2 disabled:pointer-events-none",children:o})},i)})}),e.register_closed&&!t&&(0,s.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"This session has been taught, so it can no longer be changed."})]})}let Z="cancel"===j?"Cancel this session":"move"===j?"Move this session":"Arrange cover",ee="cancel"===j?A.trim().length>=3:"move"!==j||!!L&&/^\d{2}:\d{2}$/.test(q);return(0,s.jsxs)(m.RecordSheet,{title:Z,subtitle:C,onClose:l,onSave:()=>J.mutate(),saving:J.isPending,error:J.error,canSave:(ee&&R.trim().length>3||"cover"===j&&!z&&e.covered)&&!("cover"===j&&z&&(W.isLoading||H.length>0&&!Y)),saveLabel:"cancel"===j?O?`Cancel and tell ${S} famil${1===S?"y":"ies"}`:"Cancel session":"move"===j?O?`Move and tell ${S} famil${1===S?"y":"ies"}`:"Move session":z||!e.covered?"Arrange cover":"Back to the usual teacher",children:["cancel"===j&&(0,s.jsx)(f.Field,{label:"Reason",htmlFor:"ss-reason",required:!0,hint:"Families see this.",children:(0,s.jsx)(f.Input,{id:"ss-reason",value:A,onChange:e=>T(e.target.value),placeholder:"Teacher unwell",maxLength:120})}),"move"===j&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,s.jsx)(f.Field,{label:"Date",htmlFor:"ss-date",required:!0,children:(0,s.jsx)(f.Input,{id:"ss-date",type:"date",value:L,onChange:e=>F(e.target.value)})}),(0,s.jsx)(f.Field,{label:"Starts",htmlFor:"ss-time",required:!0,children:(0,s.jsx)(f.Input,{id:"ss-time",type:"time",value:q,onChange:e=>D(e.target.value)})})]}),(0,s.jsx)(f.Field,{label:"Room",htmlFor:"ss-room",children:(0,s.jsxs)(f.Select,{id:"ss-room",value:P,onChange:e=>U(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Same room"}),k.data?.map(e=>(0,s.jsx)("option",{value:e.id,children:e.name},e.id))]})}),(0,s.jsx)("p",{className:"text-[0.7812rem] text-ink-3",children:"The session keeps its length. Only this session moves."})]}),"cover"===j&&(0,s.jsx)(f.Field,{label:"Who will teach it",htmlFor:"ss-teacher",hint:"They get the register and the safety notes for this session's children.",children:(0,s.jsxs)(f.Select,{id:"ss-teacher",value:z,onChange:e=>B(e.target.value),children:[(0,s.jsx)("option",{value:"",children:e.covered?`Back to ${e.usual_teacher??"the usual teacher"}`:"Choose a teacher…"}),N.data?.map(e=>(0,s.jsx)("option",{value:e.id,children:e.display_name},e.id))]})}),"cover"===j&&z&&H.length>0&&(0,s.jsxs)("div",{className:"space-y-2",children:[(0,s.jsx)(f.Notice,{word:"Clash",tone:"critical",title:`${N.data?.find(e=>e.id===z)?.display_name??"This teacher"} is teaching then`,detail:H.map(e=>`${e.class_name} ${(0,y.time)(e.starts_at)}–${(0,y.time)(e.ends_at)}${e.location?` at ${e.location}`:""}${e.needs_travel?" (another site: no time to travel)":""}`).join(" · ")}),(0,s.jsxs)("label",{className:"flex min-h-[44px] items-start gap-3 text-[0.875rem]",children:[(0,s.jsx)("input",{type:"checkbox",checked:Y,onChange:e=>G(e.target.checked),className:"mt-0.5 size-[18px] accent-[var(--color-accent)]"}),(0,s.jsxs)("span",{children:["Assign anyway",(0,s.jsx)("span",{className:"block text-[0.7812rem] text-ink-3",children:"Only if this is planned, for example a shared class."})]})]})]}),"cover"===j&&z&&(0,s.jsx)(f.Field,{label:"Handover for the cover teacher",htmlFor:"ss-handover",hint:"The plan, music, children to watch. Shown on their register.",children:(0,s.jsx)("textarea",{id:"ss-handover",rows:3,value:V,onChange:e=>Q(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,s.jsxs)("label",{className:"flex min-h-[44px] items-start gap-3 text-[0.875rem]",children:[(0,s.jsx)("input",{type:"checkbox",checked:O,onChange:e=>M(e.target.checked),className:"mt-0.5 size-[18px] accent-[var(--color-accent)]"}),(0,s.jsxs)("span",{children:["cover"===j?"Tell the families too":`Tell the ${S} famil${1===S?"y":"ies"} and the teacher`,(0,s.jsx)("span",{className:"block text-[0.7812rem] text-ink-3",children:"cover"===j?"The covering teacher is always told.":"A class notice, plus a notification each."})]})]}),(O||"cover"===j)&&(0,s.jsx)(f.Field,{label:"Message",htmlFor:"ss-msg",children:(0,s.jsx)("textarea",{id:"ss-msg",rows:3,value:R,onChange:e=>I(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,s.jsx)(f.Button,{variant:"ghost",size:"sm",onClick:()=>w("menu"),children:"← Other options"})]})}],7725)},21011,e=>{"use strict";let s=`
select
  (select count(*)::int from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed,
  -- What the declined cards were for, as Billing shows it (UR-54, admins D11).
  (select coalesce(sum(p.amount_minor), 0)::bigint from payment p
    where p.deleted_at is null and p.failure_code is not null and p.succeeded_at is null
      and exists (select 1 from invoice i where i.id = p.invoice_id and i.status in ('issued','part_paid'))) as failed_minor,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,t=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,a=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,i=`
with marks as (
  select ar.student_id, cs.class_id, ar.status,
         row_number() over (partition by ar.student_id, cs.class_id order by cs.starts_at desc) as rn
    from attendance_record ar
    join class_session cs on cs.id = ar.session_id and cs.deleted_at is null
   where ar.deleted_at is null and cs.starts_at < now()
),
runs as (
  select student_id, class_id
    from marks where rn <= 3
   group by student_id, class_id
  having count(*) = 3 and bool_and(status in ('absent'))
)
select s.id, s.first_name, s.last_name,
       min(c.name) as class_name,
       count(*)::int as classes_affected
  from runs r
  join student s on s.id = r.student_id
  join class c on c.id = r.class_id
 group by s.id, s.first_name, s.last_name
 order by s.last_name, s.first_name`,n=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id as covered,
       cs.cancel_reason, cs.original_starts_at is not null as moved, st.display_name as usual_teacher,
       coalesce(cs.room_id, c.room_id) as room_id, cs.register_closed_at is not null as register_closed
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join staff_member cover on cover.id = cs.teacher_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at, c.name`,r=n.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),l=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,d=`
select t.id, t.status, cs.starts_at, c.name as class_name,
       coalesce(eq.child_name, s.first_name || ' ' || s.last_name) as who,
       eq.contact_name
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join enquiry eq on eq.id = t.enquiry_id
  left join student s on s.id = t.student_id
 where t.deleted_at is null and t.status in ('requested','booked')
 order by cs.starts_at nulls last
 limit 6`,o=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,c=`
select count(*)::int as awaiting,
       string_agg(name, ', ' order by last_at) filter (where rn <= 3) as names
  from (select f.name, last.sent_at as last_at, row_number() over (order by last.sent_at) rn
          from family f
          join lateral (select inbound, sent_at from communication c
                         where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                         order by c.sent_at desc limit 1) last on last.inbound
         where f.deleted_at is null) t`,m=`
select
  (select count(*)::int from studio_request
    where deleted_at is null and status in ('open','in_progress')) as open_requests,
  (select count(*)::int from event_participant
    where deleted_at is null and status = 'requested') as pending_entries,
  (select count(*)::int from studio_request
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`,_=`select r.id, l.name || ' \xb7 ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`,u=`
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`,h=`
select t.name, (current_date - t.starts_on) / 7 + 1 as week, (t.ends_on - t.starts_on) / 7 + 1 as weeks
  from term t where t.deleted_at is null and current_date between t.starts_on and t.ends_on
 order by t.starts_on desc limit 1`,f=`
select e.id, e.stage::text as stage, e.contact_name, e.child_name, e.next_action_on,
       e.next_action_on <= current_date as due_now
  from enquiry e
 where e.deleted_at is null and e.stage not in ('enrolled', 'closed_lost')
   and e.next_action_on is not null and e.next_action_on < current_date + 7
 order by e.next_action_on, e.created_at`,p=`
select cs.starts_at, t.name as term_name,
       not exists (select 1 from class_session e join class ec on ec.id = e.class_id
                    where ec.term_id = c.term_id and e.deleted_at is null and e.starts_at < cs.starts_at) as term_start
  from class_session cs join class c on c.id = cs.class_id
  left join term t on t.id = c.term_id
 where cs.deleted_at is null and c.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at >= $1::timestamptz
 order by cs.starts_at limit 1`,y=`select r.* from app.overdue_registers(
  (select id from studio where id in (select app.studio_ids()) limit 1)) r`,g=`select * from app.trials_to_decide(
  (select id from studio where id in (select app.studio_ids()) limit 1))`,x=`select * from app.exam_fees_unpaid(
  (select id from studio where id in (select app.studio_ids()) limit 1))`;e.s(["ATTENTION_CAPACITY",0,t,"ATTENTION_EXAM_FEES",0,x,"ATTENTION_FOLLOW_UPS",0,f,"ATTENTION_LAPSED",0,i,"ATTENTION_MESSAGES",0,c,"ATTENTION_PAYMENTS",0,s,"ATTENTION_REGISTERS",0,y,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,a,"ATTENTION_TRIAL_FEEDBACK",0,g,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_CLASHES",0,"select session_id, class_name, starts_at, ends_at, location, needs_travel from app.cover_clashes($1, $2)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4, $5, $6)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","NEXT_CLASS_WEEK",0,p,"RECENT_ENROLMENTS",0,l,"RECENT_MESSAGES",0,o,"ROOM_OPTIONS",0,_,"SESSIONS_BETWEEN",0,n,"SESSION_BY_ID",0,r,"SESSION_FAMILIES",0,u,"SESSION_HANDOVER",0,"select handover_note from class_session where id = $1","STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TERM_NOW",0,h,"UPCOMING_TRIALS",0,d])},27389,e=>{"use strict";let s=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
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
returning id`,m=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,_=`
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
returning id, status`,h=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,f=`
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
 where c.id = $1 and c.deleted_at is null`,p=`
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
 order by (a.id is null), r.kind, r.created_at desc`,y=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by,
                      shows_children, for_all_staff)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid(),
       coalesce($10::boolean, false), coalesce($11::boolean, false)
  from class c where c.id = $1
returning id, studio_id`,g=`
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
 order by s.first_name, s.last_name`,x=`
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,b=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,v=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,j=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,w=`
select app.retire_resource($1) as ok`,$=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,b,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,j,"CLASS_CHILDREN_CONSENT",0,g,"CLASS_DETAIL",0,f,"CLASS_RESOURCES",0,p,"CLEAR_RESOURCE_CHILDREN",0,x,"CREATE_RESOURCE",0,y,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,w,"EVENTS",0,n,"MY_REQUESTS",0,l,"MY_TEACHING_CLASSES",0,$,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,_,"PENDING_REQUESTS",0,m,"RAISE_REQUEST",0,d,"REQUEST_MEDIA_CONSENT",0,"select * from app.request_media_consent($1)","REQUEST_PLACE",0,r,"RESOURCES",0,a,"RESOURCE_CHILD_STATUS",0,"select * from app.resource_child_status($1)","STUDENT_FEEDBACK",0,i,"UPDATE_RESOURCE_MEDIA",0,v,"WRITE_FEEDBACK",0,c])},42268,e=>{"use strict";let s=`
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
 order by f.name`,t=`
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
       app.consent_now(s.id, 'photography') as photo_consent   -- latest settled choice, one row (UR-08)
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null
 order by s.last_name, s.first_name`,a=`
select f.id, f.name, f.address_line1, f.city, f.postcode, f.balance_minor, f.notes
  from family f where f.id = $1 and f.deleted_at is null`,i=`
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
  from student_safety_brief where student_id = $1`,o=`
insert into family (studio_id, name, address_line1, city, postcode, notes, created_by)
select id, $1, nullif(btrim($2),''), nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), auth.uid()
  from studio where deleted_at is null limit 1
returning id`,c=`
update family set name = $2, address_line1 = nullif(btrim($3),''),
       city = nullif(btrim($4),''), postcode = nullif(btrim($5),''),
       notes = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`,m=`
insert into guardian (studio_id, family_id, full_name, email, phone, relationship,
                      is_primary, receives_billing)
select f.studio_id, f.id, $2, nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, $7
  from family f where f.id = $1
returning id`,_=`
update guardian set full_name = $2, email = nullif(btrim($3),''),
       phone = nullif(btrim($4),''), relationship = nullif(btrim($5),''),
       is_primary = $6, receives_billing = $7, updated_at = now()
 where id = $1 returning id`,u=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, s.pronouns,
       s.school, s.joined_on, s.left_on, s.notes, s.family_id, f.name as family_name
  from student s join family f on f.id = s.family_id
 where s.id = $1 and s.deleted_at is null`,h=`
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
 where m.student_id = $1 and m.deleted_at is null`,y=`
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
 order by priority, full_name`,x=`
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
 order by sm.status, sm.display_name`,v=`
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`,j=`
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["CREATE_EMERGENCY",0,x,"CREATE_FAMILY",0,o,"CREATE_GUARDIAN",0,m,"CREATE_STAFF",0,v,"CREATE_STUDENT",0,h,"EMERGENCY_CONTACTS",0,g,"FAMILIES",0,s,"FAMILY_DETAIL",0,a,"FAMILY_GUARDIANS",0,i,"FAMILY_INVOICES",0,r,"FAMILY_MESSAGES",0,l,"FAMILY_STUDENTS",0,n,"MEDICAL",0,p,"REMOVE_EMERGENCY",0,"select app.soft_delete('emergency_contact', $1) as ok","REMOVE_GUARDIAN",0,"select app.soft_delete('guardian', $1) as ok","REMOVE_STAFF",0,"select app.soft_delete('staff_member', $1) as ok","SAVE_MEDICAL",0,y,"STAFF_FULL",0,b,"STUDENTS",0,t,"STUDENT_DETAIL",0,u,"STUDENT_SAFETY",0,d,"UPDATE_FAMILY",0,c,"UPDATE_GUARDIAN",0,_,"UPDATE_STAFF",0,j,"UPDATE_STUDENT",0,f])}]);