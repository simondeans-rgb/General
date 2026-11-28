(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,61574,e=>{"use strict";let t=(0,e.i(75254).default)("heart-pulse",[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}],["path",{d:"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"auskq0"}]]);e.s(["HeartPulse",0,t],61574)},3281,e=>{"use strict";let t=(0,e.i(75254).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["Printer",0,t],3281)},57850,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(37727),a=e.i(45060);e.s(["DetailPanel",0,function({open:e,onClose:n,title:r,subtitle:l,children:d,actions:o}){return(s.useEffect(()=>{if(!e)return;let t=e=>{"Escape"===e.key&&n()};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[e,n]),e)?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"fixed inset-0 z-40 bg-ink/25 lg:hidden",onClick:n,"aria-hidden":!0}),(0,t.jsxs)("aside",{role:"dialog","aria-modal":"true","aria-label":"string"==typeof r?r:"Details",className:(0,a.cn)("fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)]","border-t border-line bg-surface shadow-lg pb-safe","lg:sticky lg:top-4 lg:z-auto lg:max-h-[calc(100dvh-2rem)] lg:rounded-[var(--radius-lg)] lg:border lg:shadow-md"),children:[(0,t.jsxs)("div",{className:"sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{className:"truncate font-display text-[1.25rem] leading-tight",children:r}),l&&(0,t.jsx)("div",{className:"mt-1 truncate text-[0.8438rem] text-ink-3",children:l})]}),o,(0,t.jsx)("button",{onClick:n,"aria-label":"Close details",className:"grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink",children:(0,t.jsx)(i.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{className:"px-5 py-4",children:d})]})]}):null},"DetailSection",0,function({title:e,children:s,action:i}){return(0,t.jsxs)("section",{className:"mb-7 last:mb-0",children:[(0,t.jsxs)("div",{className:"mb-2 flex min-h-[28px] items-center gap-2 border-b border-ink pb-1.5",children:[(0,t.jsx)("h3",{className:"section-title text-[0.875rem]",children:e}),i&&(0,t.jsx)("div",{className:"ml-auto",children:i})]}),s]})},"KeyValue",0,function({rows:e}){return(0,t.jsx)("dl",{className:"divide-y divide-line",children:e.map(([e,s])=>(0,t.jsxs)("div",{className:"flex gap-3 py-2 text-[0.875rem]",children:[(0,t.jsx)("dt",{className:"w-28 shrink-0 text-ink-3",children:e}),(0,t.jsx)("dd",{className:"min-w-0 flex-1 break-words",children:s??(0,t.jsx)("span",{className:"text-ink-3",children:"—"})})]},e))})}])},72769,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),a=e.i(12598),n=e.i(45060),r=e.i(77326),l=e.i(13927),d=e.i(30224),o=e.i(31502),c=e.i(17658),m=e.i(27389),u=e.i(24098),_=e.i(75379);let p={competition:"Competition",show:"Show",exam:"Exam",workshop:"Workshop",private_lesson:"Private lesson",rehearsal:"Rehearsal",social:"Social"},h={requested:{label:"Requested — waiting on the studio",tone:"caution"},confirmed:{label:"Confirmed",tone:"positive"},invited:{label:"Invited",tone:"info"},declined:{label:"Not this time",tone:"neutral"},waitlisted:{label:"Waiting list",tone:"caution"},withdrawn:{label:"Withdrawn",tone:"neutral"}},f={caution:"text-caution",positive:"text-positive",info:"text-info",neutral:"text-ink-2"};function x({event:e,children:a,onClose:n,onDone:r}){let{session:l}=(0,o.useSession)(),[u,p]=s.useState(a[0]?.id??""),[h,f]=s.useState(""),[b,v]=s.useState(!1),g=(0,i.useMutation)({mutationFn:async()=>(0,d.runAs)(l,t=>t(m.REQUEST_PLACE,[e.id,u,h.trim()||null])),onSuccess:()=>v(!0)});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ask-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:b?(0,t.jsxs)("div",{className:"py-2",children:[(0,t.jsx)("p",{className:"font-display text-[1.375rem] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]",children:"Sent"}),(0,t.jsx)("p",{id:"ask-title",className:"mt-1.5 font-semibold",children:"Request sent"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The studio will confirm. Nothing is booked until they do."}),(0,t.jsx)(c.Button,{className:"mt-4 w-full",variant:"primary",onClick:r,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ask-title",className:"text-[1.0625rem] font-semibold tracking-tight",children:"Ask to take part"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.title}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[a.length>1&&(0,t.jsx)(c.Field,{label:"Who for",htmlFor:"ask-student",children:(0,t.jsx)(c.Select,{id:"ask-student",value:u,onChange:e=>p(e.target.value),children:a.map(e=>(0,t.jsxs)("option",{value:e.id,children:[e.first_name," ",e.last_name]},e.id))})}),(0,t.jsx)(c.Field,{label:"Anything the studio should know",htmlFor:"ask-note",hint:"Optional. Availability, which piece, that sort of thing.",children:(0,t.jsx)(c.Input,{id:"ask-note",value:h,onChange:e=>f(e.target.value),placeholder:"Free most evenings except Thursday"})}),null!=e.cost_minor&&(0,t.jsxs)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[0.8125rem] text-ink-2",children:["This costs ",(0,_.money)(e.cost_minor),". You will be invoiced only once the studio confirms."]})]}),g.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(c.ErrorState,{error:g.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(c.Button,{className:"flex-1",onClick:n,children:"Cancel"}),(0,t.jsx)(c.Button,{className:"flex-1",variant:"primary",loading:g.isPending,disabled:!u,onClick:()=>g.mutate(),children:"Send request"})]})]})})})}function b({eventId:e}){let{session:s}=(0,o.useSession)(),n=(0,a.useQueryClient)(),r=(0,l.useRows)(["helper-slots",e],"select * from app.helper_slots($1)",[e]),m=(0,i.useMutation)({mutationFn:e=>(0,d.runAs)(s,t=>t("select app.volunteer($1, $2)",[e.id,e.on])),onSuccess:()=>n.invalidateQueries({queryKey:["db"]})});return r.data?.length?(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("h3",{className:"text-[0.8125rem] font-semibold text-ink-2",children:"Helpers needed"}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:r.data.map(e=>{let s=e.needed-e.filled;return(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-x-3 gap-y-1 py-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-semibold",children:e.role}),(0,t.jsxs)("span",{className:"text-ink-3",children:[e.starts_at?` \xb7 ${(0,_.time)(e.starts_at)}${e.ends_at?`–${(0,_.time)(e.ends_at)}`:""}`:""," · ",s>0?`${s} more needed`:"filled"]}),e.note&&(0,t.jsx)("span",{className:"block text-[0.8125rem] text-ink-3",children:e.note})]}),e.mine?(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",loading:m.isPending,onClick:()=>m.mutate({id:e.id,on:!1}),children:"You’re helping · drop out"}):s>0&&(0,t.jsx)(c.Button,{size:"sm",loading:m.isPending,onClick:()=>m.mutate({id:e.id,on:!0}),children:"I can help"})]},e.id)})}),null!=m.error&&(0,t.jsx)(c.ErrorState,{error:m.error})]}):null}e.s(["EventsView",0,function({allow:e,title:v}){let{session:g}=(0,o.useSession)(),y=(0,a.useQueryClient)(),w=(0,l.useRows)(["events"],m.EVENTS),$=(0,l.useRows)(["event-children"],"select id, first_name, last_name from student where deleted_at is null order by date_of_birth"),[j,E]=s.useState(null),k=(0,i.useMutation)({mutationFn:e=>(0,d.runAs)(g,t=>t(m.ANSWER_INVITE,[e.id,e.yes])),onSuccess:()=>y.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)(r.Shell,{title:v,subtitle:"Competitions, shows, exams and private lessons",allow:e,children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl",children:[w.isLoading&&(0,t.jsx)("div",{className:"space-y-3",children:[0,1,2].map(e=>(0,t.jsx)(c.Skeleton,{className:"h-24"},e))}),null!=w.error&&(0,t.jsx)(c.ErrorState,{error:w.error,onRetry:()=>w.refetch()}),w.data?.length===0&&!w.isLoading&&(0,t.jsx)(c.EmptyState,{title:"Nothing in the diary",body:"Competitions, shows and workshops show here when the studio adds them."}),(0,t.jsx)("ul",{className:"divide-y divide-line border-t-2 border-ink",children:w.data?.map(s=>{let i=s.mine??[],a=($.data??[]).filter(e=>!i.some(t=>t.student_id===e.id)),r=s.entries_close_on&&new Date(s.entries_close_on)<new Date,l=null!=s.capacity&&s.going>=s.capacity,d=new Date(s.starts_at);return(0,t.jsxs)("li",{className:"grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 py-5",children:[(0,t.jsxs)("p",{"aria-hidden":!0,className:"text-center leading-none",children:[(0,t.jsx)("span",{className:"block font-display text-[1.875rem] tnum",children:new Intl.DateTimeFormat("en-GB",{day:"numeric",timeZone:"Europe/London"}).format(d)}),(0,t.jsx)("span",{className:"mt-1 block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3",children:new Intl.DateTimeFormat("en-GB",{month:"short",timeZone:"Europe/London"}).format(d)})]}),(0,t.jsxs)("article",{className:"min-w-0 space-y-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:(0,t.jsx)("span",{className:"font-semibold text-ink-2",children:p[s.kind]??s.kind})}),(0,t.jsx)("h2",{className:"mt-0.5 font-display text-[1.1875rem] leading-tight",children:s.title}),(0,t.jsxs)("p",{className:"mt-1 text-[0.875rem] text-ink-2",children:[["Today","Tomorrow"].includes((0,_.relativeDay)(s.starts_at))?`${(0,_.relativeDay)(s.starts_at)}, `:"",(0,_.dateLong)(s.starts_at)," · ",(0,_.time)(s.starts_at),s.venue?` \xb7 ${s.venue}`:""]}),s.description&&(0,t.jsx)("p",{className:"mt-2 text-[0.9062rem] leading-relaxed text-ink-2",children:s.description}),(0,t.jsxs)("dl",{className:"mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.8438rem]",children:[null!=s.cost_minor&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Cost "}),(0,t.jsx)("dd",{className:"inline font-semibold tnum",children:(0,_.money)(s.cost_minor)})]}),null!=s.capacity&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Places "}),(0,t.jsxs)("dd",{className:"inline font-semibold tnum",children:[Math.max(0,s.capacity-s.going)," left of ",s.capacity,l?" · full":""]})]}),s.entries_close_on&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"Entries close "}),(0,t.jsx)("dd",{className:"inline font-semibold",children:(0,_.dateShort)(s.entries_close_on)})]}),s.teacher&&(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"inline text-ink-3",children:"With "}),(0,t.jsx)("dd",{className:"inline font-semibold",children:s.teacher})]})]})]}),i.length>0&&(0,t.jsx)("ul",{className:"space-y-2 border-t border-line pt-3","aria-label":"Your entries",children:i.map(s=>{let i=h[s.status];return(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.875rem]",children:[(0,t.jsx)("span",{className:"font-semibold",children:s.first_name}),(0,t.jsx)("span",{className:(0,n.cn)("font-semibold",f[i?.tone??"neutral"]),children:i?.label??s.status}),"invited"===s.status&&e.includes("guardian")&&(0,t.jsxs)("span",{className:"flex gap-2",children:[(0,t.jsxs)(c.Button,{size:"sm",variant:"primary",onClick:()=>k.mutate({id:s.id,yes:!0}),children:[s.first_name," will be there"]}),(0,t.jsx)(c.Button,{size:"sm",variant:"ghost",onClick:()=>k.mutate({id:s.id,yes:!1}),children:"Not this time"})]})]},s.id)})}),null!=k.error&&(0,t.jsx)(c.ErrorState,{error:k.error}),"private_lesson"!==s.kind&&a.length>0&&(!s.requests_open||r||l?0===i.length&&(0,t.jsxs)("p",{className:"text-[0.8438rem] text-ink-3",children:[l?"This one is full.":r?"Entries have closed.":"Not taking requests."," ","Message the studio if you’d still like to be considered."]}):(0,t.jsx)(c.Button,{onClick:()=>E(s),children:i.length?`Ask for ${1===a.length?a[0].first_name:"another child"} too`:"Ask to take part"})),!!s.notices?.length&&(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("h3",{className:"text-[0.8125rem] font-semibold text-ink-2",children:"Notices about this"}),s.notices.map((e,s)=>(0,t.jsxs)("div",{className:"border-l-2 border-ink pl-3 text-[0.875rem]",children:[(0,t.jsxs)("p",{className:"font-semibold",children:[e.subject," ",(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:["· ",(0,_.dateShort)(e.sent_at)]})]}),(0,t.jsx)("p",{className:"whitespace-pre-line text-ink-2",children:e.body})]},s))]}),s.rehearsals?.length||"confirmed"===s.my_status&&s.routines?.length?(0,t.jsxs)("ul",{className:"space-y-1 border-t border-line pt-3 text-[0.875rem]",children:[s.rehearsals?.map((e,s)=>(0,t.jsxs)("li",{children:[(0,t.jsx)("span",{className:"font-semibold",children:e.title})," ",(0,t.jsxs)("span",{className:"text-ink-3",children:["· ",(0,_.dateLong)(e.starts_at),", ",(0,_.time)(e.starts_at)]})]},s)),"confirmed"===s.my_status&&s.routines?.map((e,s)=>(0,t.jsxs)("li",{children:["Dance ",e.position,": ",(0,t.jsx)("span",{className:"font-semibold",children:e.title}),e.costume?(0,t.jsxs)("span",{className:"text-ink-3",children:[" · costume: ",e.costume]}):""]},s))]}):null,e.includes("guardian")&&"confirmed"===s.my_status&&(0,t.jsx)(u.MyCostumes,{eventId:s.id}),e.includes("guardian")&&new Date(s.starts_at)>new Date&&(0,t.jsx)(b,{eventId:s.id}),e.includes("guardian")&&("show"===s.kind||"competition"===s.kind)&&new Date(s.starts_at)>new Date&&(0,t.jsx)(u.BuyTickets,{eventId:s.id})]})]},s.id)})})]}),j&&(0,t.jsx)(x,{event:j,children:($.data??[]).filter(e=>!(j.mine??[]).some(t=>t.student_id===e.id)),onClose:()=>E(null),onDone:()=>{E(null),y.invalidateQueries({queryKey:["db"]})}})]})}])},24098,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(74080),a=e.i(54616),n=e.i(12598),r=e.i(54385),l=e.i(61574),d=e.i(3281),o=e.i(37727),c=e.i(13927),m=e.i(30224),u=e.i(31502),_=e.i(57850),p=e.i(17658),h=e.i(84315),f=e.i(75379),x=e.i(45060),b=e.i(70448);function v(){let{session:e}=(0,u.useSession)(),t=(0,n.useQueryClient)();return(0,a.useMutation)({mutationFn:async t=>(await (0,m.runAs)(e,e=>e(t.sql,t.params)))[0],onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}let g=[["needed","Needed","caution"],["ordered","Ordered","info"],["arrived","Arrived","info"],["given","With dancer","positive"],["returned","Returned","neutral"]],y=[["present","Here"],["late","Late"],["absent","Absent"]];function w({rehearsal:e,onClose:s}){let i=(0,c.useRows)(["rehearsal-register",e.id],h.REHEARSAL_REGISTER,[e.id]),a=v(),n=i.data?.filter(e=>e.status).length??0;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:s,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"rr-t",onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"rr-t",className:"font-display text-[1.25rem] leading-tight",children:e.title}),(0,t.jsxs)("p",{className:"mt-1 text-[0.8438rem] text-ink-3",children:[(0,f.dateLong)(e.starts_at),", ",(0,f.time)(e.starts_at)," · ",(0,t.jsxs)("span",{className:"tnum",children:[n," of ",i.data?.length??0]})," marked"]})]}),(0,t.jsx)(p.Button,{size:"sm",variant:"ghost",onClick:s,"aria-label":"Close",className:"-mr-2 -mt-1",children:(0,t.jsx)(o.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 pb-safe",children:[null!=a.error&&(0,t.jsx)(p.ErrorState,{error:a.error}),i.error&&(0,t.jsx)(p.ErrorState,{error:i.error}),i.data?.length===0&&(0,t.jsx)("p",{className:"py-4 text-[0.875rem] text-ink-2",children:"No confirmed dancers yet."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:i.data?.map(s=>(0,t.jsxs)("li",{className:"flex items-center gap-3 py-2.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block font-semibold",children:[s.first_name," ",s.last_name]}),s.has_medical&&(0,t.jsxs)("span",{className:(0,x.cn)("block text-[0.7812rem] font-semibold",s.requires_alert?"text-critical":"text-caution"),children:[(0,t.jsx)(l.HeartPulse,{className:"mr-1 inline size-3.5 align-[-2px]","aria-hidden":!0}),s.requires_alert?"Medical alert":"Medical information"]}),s.routines&&(0,t.jsx)("span",{className:"block truncate text-[0.7812rem] text-ink-3",children:s.routines})]}),(0,t.jsx)("div",{role:"group","aria-label":`Mark ${s.first_name}`,className:"flex gap-1",children:y.map(([i,n])=>(0,t.jsx)("button",{"aria-pressed":s.status===i,onClick:()=>a.mutate({sql:h.MARK_REHEARSAL,params:[e.id,s.student_id,i]}),className:(0,x.cn)("h-11 min-w-[3.25rem] rounded-[var(--radius-md)] border px-2.5 text-[0.8125rem] font-semibold",s.status===i?"absent"===i?"border-critical bg-critical text-surface":"late"===i?"border-caution bg-caution text-surface":"border-positive bg-positive text-surface":"border-line-strong text-ink-2 hover:border-ink-3"),children:n},i))})]},s.student_id))})]})]})})}e.s(["BuyTickets",0,function({eventId:e}){let i=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),a=(0,c.useRows)(["my-tickets"],h.MY_TICKETS),n=v(),[r,l]=s.useState({});if(!i.data?.length)return null;let d=(a.data??[]).filter(t=>t.event_id===e);return(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Tickets for family and friends"}),d.length>0&&(0,t.jsxs)("p",{className:"text-[0.875rem]",children:[(0,t.jsx)("span",{className:"font-semibold text-positive",children:"Booked:"})," ",d.map(e=>`${e.quantity} \xd7 ${e.name}`).join(", "),"."]}),i.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2 text-[0.9062rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.name," ",(0,t.jsx)("span",{className:"tnum font-semibold",children:(0,f.money)(e.price_minor)}),null!=e.left&&e.left<20?(0,t.jsx)("span",{className:"block text-[0.8125rem] font-semibold text-caution",children:0===e.left?"Sold out":`${e.left} left`}):null]}),(0,t.jsx)(p.Input,{"aria-label":`How many ${e.name} tickets`,type:"number",min:1,max:e.per_family_max,className:"h-10 w-16",value:r[e.id]??1,onChange:t=>l({...r,[e.id]:Number(t.target.value)})}),(0,t.jsx)(p.Button,{size:"sm",disabled:0===e.left,loading:n.isPending,onClick:()=>n.mutate({sql:h.BOOK_TICKETS,params:[e.id,r[e.id]??1]}),children:"Book"})]},e.id)),null!=n.error&&(0,t.jsx)(p.ErrorState,{error:n.error}),(0,t.jsx)("p",{className:"text-[0.8125rem] text-ink-3",children:"Added to your account, to pay with your next invoice."})]})},"CostumeSection",0,function({eventId:e,routines:i,hideAdd:a}){let n=(0,c.useRows)(["costumes",e],h.COSTUME_LIST,[e]),r=v(),[l,d]=s.useState({name:"",routine:"",price:""}),o=s.useMemo(()=>{let e=new Map;for(let t of n.data??[])e.set(t.item_id,{name:t.item,routine:t.routine,lines:[...e.get(t.item_id)?.lines??[],t]});return[...e.entries()]},[n.data]);return(0,t.jsxs)(_.DetailSection,{title:"Costumes",children:[null!=r.error&&(0,t.jsx)(p.ErrorState,{error:r.error}),o.map(([e,s])=>{let i=s.lines.filter(e=>e.size).length;return(0,t.jsxs)("details",{className:"border-b border-line",children:[(0,t.jsxs)("summary",{className:"flex min-h-[44px] cursor-pointer items-center gap-2 py-2 text-[0.875rem]",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("b",{className:"font-semibold",children:s.name}),s.routine?(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",s.routine]}):""]}),(0,t.jsxs)("span",{className:(0,x.cn)("text-[0.8125rem] tnum",i<s.lines.length?"font-semibold text-caution":"text-ink-3"),children:[i," of ",s.lines.length," sizes"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line border-t border-line pb-2 pl-3 text-[0.8438rem]",children:s.lines.map(i=>(0,t.jsxs)("li",{className:"flex items-center gap-2 py-1.5",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate",children:i.dancer}),(0,t.jsx)("span",{className:(0,x.cn)("w-20 shrink-0",!i.size&&"text-ink-3"),children:i.size??"No size"}),(0,t.jsx)(p.Select,{"aria-label":`${s.name} for ${i.dancer}`,className:"h-8 w-32 text-[0.7812rem]",value:i.status,onChange:t=>r.mutate({sql:h.SET_COSTUME_STATUS,params:[e,i.student_id,t.target.value]}),children:g.map(([e,s])=>(0,t.jsx)("option",{value:e,children:s},e))})]},i.student_id))})]},e)}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families give sizes from their app. Status here is for the office."}),!a&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-2 gap-2",children:[(0,t.jsx)(p.Input,{"aria-label":"Costume item",placeholder:"Item, e.g. Red waistcoat",value:l.name,onChange:e=>d({...l,name:e.target.value})}),(0,t.jsxs)(p.Select,{"aria-label":"For routine",value:l.routine,onChange:e=>d({...l,routine:e.target.value}),children:[(0,t.jsx)("option",{value:"",children:"Everyone in the show"}),i.map(e=>(0,t.jsx)("option",{value:e.id,children:e.title},e.id))]})]}),(0,t.jsx)(p.Button,{size:"sm",className:"mt-2",disabled:!l.name.trim(),onClick:()=>{r.mutate({sql:h.ADD_COSTUME,params:[e,l.routine||null,l.name,Math.round(100*Number(l.price||0))]}),d({name:"",routine:"",price:""})},children:"Add costume item"})]})]})},"MyCostumes",0,function({eventId:e}){let s=(0,c.useRows)(["my-costumes",e],h.MY_COSTUMES,[e]),i=v();return s.data?.length?(0,t.jsxs)("div",{className:"space-y-2 border-t border-line pt-3 text-[0.9062rem]",children:[(0,t.jsx)("p",{className:"font-semibold",children:"Costume sizes"}),s.data.map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.first_name," · ",e.name,e.status&&"needed"!==e.status&&(0,t.jsxs)("span",{className:"text-ink-3",children:[" · ",g.find(t=>t[0]===e.status)?.[1]]})]}),(0,t.jsxs)(p.Select,{"aria-label":`${e.name} size for ${e.first_name}`,className:"h-10 w-36",value:e.size??"",onChange:t=>i.mutate({sql:h.SET_COSTUME_SIZE,params:[e.id,e.student_id,t.target.value||null]}),children:[(0,t.jsx)("option",{value:"",children:"Choose size…"}),e.sizes.map(e=>(0,t.jsx)("option",{value:e,children:e},e))]})]},e.id+e.student_id)),null!=i.error&&(0,t.jsx)(p.ErrorState,{error:i.error})]}):null},"ProgrammeButton",0,function({event:e}){let{session:s}=(0,u.useSession)(),i=async()=>{let t,i,a=window.open("","_blank");if(a){try{[t,i]=await Promise.all([(0,m.readAs)(s,h.PROGRAMME,[e.id]),(0,m.readAs)(s,"select name, brand_colour, logo_url from studio order by created_at limit 1")])}catch{a.document.write('<!doctype html><meta charset="utf-8"><title>Programme</title><p style="font:16px sans-serif;padding:24px">The programme could not be loaded. Close this window and try again.</p>'),a.document.close();return}a.document.write((0,b.programmeHtml)({school:i[0]??{name:"Programme"},event:{title:e.title,when:`${(0,f.dateLong)(e.starts_at)} \xb7 ${(0,f.time)(e.starts_at)}`,venue:e.venue},rows:t,fontFaces:(0,b.documentFontFaces)()})),a.document.close()}};return(0,t.jsxs)(p.Button,{size:"sm",variant:"ghost",onClick:i,children:[(0,t.jsx)(d.Printer,{className:"size-4","aria-hidden":!0})," Print programme"]})},"RehearsalRegisterButton",0,function({rehearsal:e}){let[a,n]=s.useState(!1);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(p.Button,{size:"sm",variant:"ghost",onClick:()=>n(!0),"aria-label":`Register for ${e.title}`,children:[(0,t.jsx)(r.ClipboardCheck,{className:"size-4","aria-hidden":!0})," Register"]}),a&&(0,i.createPortal)((0,t.jsx)(w,{rehearsal:e,onClose:()=>n(!1)}),document.body)]})},"TicketSection",0,function({eventId:e}){let i=(0,c.useRows)(["ticket-types",e],h.TICKET_TYPES,[e]),a=v(),[n,r]=s.useState({name:"Adult",price:"",cap:"",max:"6"});return(0,t.jsxs)(_.DetailSection,{title:"Tickets",children:[null!=a.error&&(0,t.jsx)(p.ErrorState,{error:a.error}),(0,t.jsx)("ul",{className:"divide-y divide-line text-[0.875rem]",children:i.data?.map(e=>(0,t.jsxs)("li",{className:"flex min-h-[40px] items-center gap-2 py-1.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"font-semibold",children:e.name})," ",(0,t.jsx)("span",{className:"text-ink-3 tnum",children:(0,f.money)(e.price_minor)})]}),(0,t.jsxs)("span",{className:"tnum text-[0.8125rem] text-ink-2",children:[e.sold," sold",null!=e.left?` \xb7 ${e.left} left`:""]})]},e.id))}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-4 gap-2",children:[(0,t.jsx)(p.Input,{"aria-label":"Ticket name",className:"col-span-2",value:n.name,onChange:e=>r({...n,name:e.target.value})}),(0,t.jsx)(p.Input,{"aria-label":"Price in pounds",type:"number",min:0,step:.5,placeholder:"£",value:n.price,onChange:e=>r({...n,price:e.target.value})}),(0,t.jsx)(p.Input,{"aria-label":"Seats",type:"number",min:1,placeholder:"Seats",value:n.cap,onChange:e=>r({...n,cap:e.target.value})})]}),(0,t.jsx)(p.Button,{size:"sm",className:"mt-2",disabled:!n.name.trim()||""===n.price,onClick:()=>{a.mutate({sql:h.ADD_TICKET_TYPE,params:[e,n.name,Math.round(100*Number(n.price)),n.cap?Number(n.cap):null,Number(n.max)||6]}),r({name:"Child",price:"",cap:"",max:"6"})},children:"Add ticket type"}),(0,t.jsx)("p",{className:"mt-2 text-[0.8125rem] text-ink-3",children:"Families book from their Events page; tickets go on their account until card payment is switched on."})]})}])},70448,e=>{"use strict";var t=e.i(54626),s=e.i(7989);let i=e=>String(e??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);function a(e){let i=(0,t.paletteFor)((0,t.normaliseHex)(e.brand_colour));return{accent:i.accent,onAccent:i.onAccent,text:i.text,line:i.line,ink:s.SWAYVO.ink,muted:"#5b6070",hair:"#dfe1e8"}}let n=e=>[e.dancers??"",e.unnamed?`${e.dancers?"and ":""}${e.unnamed} dancer${1===e.unnamed?"":"s"}`:""].filter(Boolean).join(" "),r={class_moved:{word:"Moved",tone:"ink"},class_cancelled:{word:"Cancelled",tone:"critical"},cover:{word:"Changed",tone:"ink"},fee_due:{word:"Due",tone:"caution"},invitation:{word:"Invited",tone:"accent"},absence_received:{word:"Received",tone:"ink"}};e.s(["TEMPLATE_LABELS",0,{class_moved:"A class moves",class_cancelled:"A class is cancelled",cover:"A cover teacher",fee_due:"A fee is due",invitation:"An invitation to the app",absence_received:"An absence report received"},"documentFontFaces",0,function(){if("u"<typeof document)return"";let e=[];for(let t of Array.from(document.styleSheets)){let s;try{s=t.cssRules}catch{continue}for(let t of Array.from(s))"CSSFontFaceRule"===t.constructor.name&&/Archivo|Inter/.test(t.cssText)&&e.push(t.cssText)}return e.join("\n")},"programmeHtml",0,function({school:e,event:r,rows:l,fontFaces:d="",autoPrint:o=!0}){let c,m,u,_=a(e),p=l.map((e,t)=>`
  <li>
    <span class="n">${t+1}</span>
    <div class="body">
      <p class="routine">${i(e.routine)}</p>
      ${e.class_name?`<p class="class">${i(e.class_name)}</p>`:""}
      ${n(e)?`<p class="dancers">${i(n(e))}</p>`:""}
    </div>
  </li>`).join("");return`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>${i(r.title)} \xb7 ${i(e.name)} \xb7 programme</title>
<style>
${d}
:root{--display:"Archivo Variable",Archivo,"Arial Black","Helvetica Neue",Arial,sans-serif;--text:"Inter Variable",Inter,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--accent:${_.accent};--accent-text:${_.text};--ink:${_.ink};--muted:${_.muted};--hair:${_.hair}}
@page{size:A4;margin:16mm 16mm 18mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0 auto;max-width:680px;padding:40px 20px;background:#fff;color:var(--ink);font:400 15px/1.5 var(--text)}
header{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:4px solid var(--accent)}
.school{font:800 13px/1.2 var(--display);font-stretch:112%;letter-spacing:.04em;text-transform:uppercase;color:var(--accent-text);margin:0}
h1{font:850 44px/0.95 var(--display);font-stretch:118%;letter-spacing:-0.025em;margin:22px 0 0}
.when{margin:10px 0 0;color:var(--muted);font-size:16px}
h2{font:800 20px/1.1 var(--display);font-stretch:112%;margin:34px 0 0;padding-bottom:8px;border-bottom:2px solid var(--ink)}
ol{list-style:none;margin:0;padding:0}
li{display:grid;grid-template-columns:3rem minmax(0,1fr);gap:12px;padding:14px 0;border-bottom:1px solid var(--hair);break-inside:avoid}
.n{font:850 28px/1 var(--display);font-stretch:118%;color:var(--accent-text);font-variant-numeric:tabular-nums lining-nums}
.routine{margin:0;font:800 18px/1.2 var(--display);font-stretch:112%}
.class{margin:2px 0 0;font-weight:600}
.dancers{margin:4px 0 0;color:var(--muted);font-size:14px}
.empty{color:var(--muted);padding:14px 0}
footer{margin-top:32px;display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--muted);font-size:12px}
@media print{body{padding:0;max-width:none}}
</style></head>
<body>
<header>${c=a(e),(u=(m=e.logo_url)&&(/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(m)||/^https?:\/\//i.test(m))?m:null)?`<img src="${i(u)}" alt="${i(e.name)} logo" style="height:56px;width:auto;max-width:168px;object-fit:contain;display:block">`:`<span aria-hidden="true" style="display:inline-grid;place-items:center;width:56px;height:56px;border-radius:${Math.round(12.32)}px;background:${c.accent};color:${c.onAccent};font:800 ${Math.round(.4*56)}px/1 var(--display);letter-spacing:-0.01em">${i((0,t.monogram)(e.name))}</span>`}<p class="school">${i(e.name)}</p></header>
<h1>${i(r.title)}</h1>
<p class="when">${i([r.when,r.venue].filter(Boolean).join(" · "))}</p>
<h2>Running order</h2>
${l.length?`<ol>${p}</ol>`:'<p class="empty">The running order is still being set.</p>'}
<footer><span>${i(e.name)}</span><span>powered by ${function(e=12){let t=Math.round(e*s.LOCKUP.width/s.LOCKUP.height),i=s.MARK_BARS.map(e=>`<rect x="${e.x}" y="${e.y}" width="${s.BAR_W}" height="${e.h}" rx="1" fill="${e.downbeat?s.SWAYVO.blue:s.SWAYVO.ink}"/>`).join(""),a=s.WORD_PATHS.map(e=>`<path d="${e.d}"${e.transform?` transform="${e.transform}"`:""}/>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.LOCKUP.width} ${s.LOCKUP.height}" width="${t}" height="${e}" role="img" aria-label="Swayvo" style="vertical-align:-2px"><g transform="translate(${s.LOCKUP.markX} ${s.LOCKUP.markY}) scale(${s.LOCKUP.markScale})">${i}</g><g transform="translate(${s.LOCKUP.wordX} ${s.LOCKUP.wordY})"><g transform="${s.WORD_TRANSFORM}" fill="none" stroke="${s.SWAYVO.ink}" stroke-width="${s.WORD_STROKE}" stroke-linejoin="bevel">${a}</g></g></svg>`}(12)}</span></footer>
${o?"<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(function(){ window.print() }, 50) })</script>":""}
</body></html>`},"renderMessage",0,function(e){let t,s=a(e.school),n=(t=r[e.kind].word,"fee_due"===e.kind&&e.due?`${t} ${e.due}`:t),l=`${n.toUpperCase()}: ${e.title}`.slice(0,140),d=r[e.kind].tone,o="critical"===d?"#b42318":"caution"===d?"#9a5b00":"accent"===d?s.text:s.ink,c=`${e.school.name}${e.school.contact_email?` \xb7 ${e.school.contact_email}`:""}`,m=[e.school.name,"",`${n.toUpperCase()}`,e.title,"",`Hi ${e.to},`,"",e.detail,"",...e.action?[`${e.action.label}: ${e.action.url}`,""]:[],c,"Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app."].join("\n"),u=e.action?`<tr><td style="padding:8px 0 4px"><a href="${i(e.action.url)}" style="display:inline-block;background:${s.accent};color:${s.onAccent};font:600 15px/1 Inter,Arial,sans-serif;text-decoration:none;padding:14px 20px;border-radius:10px">${i(e.action.label)}</a></td></tr>`:"",_=`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${i(l)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;color:${s.ink}">
<span style="display:none;max-height:0;overflow:hidden">${i(e.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font:15px/1.5 Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${s.ink}">
<tr><td style="padding-bottom:14px;border-bottom:4px solid ${s.accent}">
  <p style="margin:0;font:800 14px/1.2 Archivo,'Arial Black',Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${s.text}">${i(e.school.name)}</p>
</td></tr>
<tr><td style="padding-top:22px">
  <p style="margin:0;font:800 26px/1 Archivo,'Arial Narrow','Arial Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em;color:${o}">${i(n)}</p>
  <p style="margin:8px 0 0;font-weight:600;font-size:17px;line-height:1.35">${i(e.title)}</p>
</td></tr>
<tr><td style="padding-top:18px">
  <p style="margin:0">Hi ${i(e.to)},</p>
  <p style="margin:10px 0 0">${i(e.detail)}</p>
</td></tr>
${u}
<tr><td style="padding-top:28px;border-bottom:1px solid #dfe1e8"></td></tr>
<tr><td style="padding-top:14px;font-size:13px;color:#5b6070">
  <p style="margin:0">${i(c)}</p>
  <p style="margin:6px 0 0">Sent with Swayvo. You get this because your family is at the school; change what you get under Settings in the app.</p>
</td></tr>
</table></td></tr></table></body></html>`;return{subject:l,text:m,html:_}},"sampleMessage",0,function(e,t,s="https://app.example/family/"){let i={kind:e,school:t,to:"Hannah"};switch(e){case"class_moved":return{...i,title:"Grade 2 Ballet on Tue 8 Dec moves to Studio Two",detail:"Same time, same teacher. Nia’s class is in Studio Two this week only, while the main hall floor is repaired.",action:{label:"See Nia’s week",url:s}};case"class_cancelled":return{...i,title:"Street Seniors, Friday 11 December",detail:"The class is cancelled this week because the teacher is unwell. Amir’s other classes go ahead as usual.",action:{label:"See Amir’s week",url:s}};case"cover":return{...i,title:"Priya Raman teaches Senior Tap on Thu 10 Dec",detail:"Marcus is away, so Priya covers. Same time and room.",action:{label:"See Amir’s week",url:s}};case"fee_due":return{...i,due:"4 Dec",title:"Spring term fees · £162.00",detail:"Invoice NDA-0142 for Amir, Clara and Nia. Pay by bank transfer; the details are on your Payments page.",action:{label:"See how to pay",url:s+"payments/"}};case"invitation":return{...i,title:`Join ${t.name} on the app`,detail:"Your children’s classes, changes and notices in one place. The link works once and lasts 14 days.",action:{label:"Accept the invitation",url:s.replace(/family\/$/,"invite/")}};case"absence_received":return{...i,title:"Nia won’t be at Grade 2 Ballet on Tue 8 Dec",detail:"Thanks for telling us. Her teacher sees it on the register. If a make-up place comes up, it will show on your home screen."}}}])},84315,e=>{"use strict";let t=`
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       (select xs.board from exam_session xs where xs.event_id = e.id and xs.deleted_at is null) as exam_board,
       (select xs.bill_on_entry from exam_session xs where xs.event_id = e.id and xs.deleted_at is null) as exam_bill_on_entry,
       count(p.*) filter (where p.status = 'invited')::int as invited,
       count(p.*) filter (where p.status = 'confirmed')::int as confirmed,
       count(p.*) filter (where p.status = 'requested')::int as requested,
       count(p.*) filter (where p.status = 'declined')::int as declined,
       (select count(distinct ii.student_id)::int from invoice_item ii where ii.event_id = e.id and ii.deleted_at is null) as billed
  from studio_event e left join event_participant p on p.event_id = e.id and p.deleted_at is null
 where e.deleted_at is null and e.parent_event_id is null and e.kind <> 'private_lesson'
 group by e.id order by (e.starts_at < now()), e.starts_at`,s=`
insert into studio_event (studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, capacity, entries_close_on, requests_open, created_by)
select m.studio_id, $1::event_kind, $2::event_status, btrim($3), nullif(btrim($4), ''), $5::timestamptz, $6::timestamptz, nullif(btrim($7), ''),
       $8, $9, $10::date, $11, auth.uid()
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`,i=`
update studio_event set kind = $2::event_kind, status = $3::event_status, title = btrim($4), description = nullif(btrim($5), ''),
       starts_at = $6::timestamptz, ends_at = $7::timestamptz, venue = nullif(btrim($8), ''), cost_minor = $9, capacity = $10,
       entries_close_on = $11::date, requests_open = $12, updated_at = now() where id = $1 returning id`,a=`
select p.id, p.status::text as status, s.first_name || ' ' || s.last_name as student, c.name as class_name
  from event_participant p join student s on s.id = p.student_id left join class c on c.id = p.invited_class_id
 where p.event_id = $1 and p.deleted_at is null order by p.status, s.first_name`,n=`select r.id, r.title, r.position, r.costume, r.music, c.name as class_name, r.class_id
  from event_routine r left join class c on c.id = r.class_id where r.event_id = $1 and r.deleted_at is null order by r.position, r.title`,r=`
with me as (select id, event_id, position from event_routine where id = $1),
     other as (select r.id, r.position from event_routine r, me where r.event_id = me.event_id and r.deleted_at is null and r.id <> me.id
                 and case when $2 < 0 then r.position < me.position else r.position > me.position end
               order by case when $2 < 0 then -r.position else r.position end limit 1)
update event_routine r set position = case when r.id = (select id from me) then (select position from other) else (select position from me) end
 where r.id in ((select id from me), (select id from other)) returning r.id`,l=`insert into studio_event (studio_id, kind, title, starts_at, ends_at, venue, parent_event_id, requests_open, created_by)
  select studio_id, 'rehearsal', btrim($2), $3::timestamptz, $4::timestamptz, nullif(btrim($5), ''), id, false, auth.uid() from studio_event where id = $1 returning id`,d=`
insert into costume_order (item_id, student_id, status) values ($1, $2, $3)
on conflict (item_id, student_id) do update set status = excluded.status, updated_at = now() returning item_id`,o=`
select t.id, t.name, t.price_minor, t.capacity, t.per_family_max, app.tickets_left(t.id) as left,
       coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0)::int as sold
  from ticket_type t where t.event_id = $1 and t.deleted_at is null order by t.price_minor desc, t.name`,c=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on, x.fee_minor, x.event_id, x.bill_on_entry,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.deleted_at is null group by x.id order by (x.exam_on < current_date), x.exam_on`,m=`
insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on, fee_minor, bill_on_entry)
select m.studio_id, btrim($1), btrim($2), $3::date, nullif(btrim($4), ''), $5::date, coalesce($6::int, 0), coalesce($7::boolean, false)
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null and app.in_scope(m.studio_id) limit 1 returning id`,u=`e.id, e.session_id, e.student_id, s.first_name || ' ' || s.last_name as student, e.grade, e.fee_minor, e.status, e.result, e.mark,
       x.board, x.title as exam_title, x.exam_on, e.confirmed_at, e.sits_at, e.certificate_received, e.invoice_id, x.venue`,_=`
select ${u} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.session_id = $1 order by e.sits_at nulls last, e.grade, s.first_name`,p=`
select ${u} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.student_id = $1 and e.status <> 'withdrawn' order by x.exam_on desc`,h=`
select ${u} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.status <> 'withdrawn' order by x.exam_on desc`,f=`
select i.id, i.name, i.sizes, s.id as student_id, s.first_name, o.size, o.status
  from costume_item i
  join student s on s.id in (select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
                             union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
                                     and p.status = 'confirmed' and p.deleted_at is null)
  left join costume_order o on o.item_id = i.id and o.student_id = s.id
 where i.event_id = $1 and i.deleted_at is null and s.deleted_at is null
 order by i.name, s.first_name`,x=`insert into event_helper_slot (studio_id, event_id, role, starts_at, needed)
  select studio_id, id, btrim($2), $3::timestamptz, $4 from studio_event where id = $1 returning id`;e.s(["ADD_CHAPERONE",0,"insert into event_chaperone (event_id, name, phone, role, checked) values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id","ADD_COSTUME",0,"insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, btrim($3), $4) returning id","ADD_EXAM_SESSION",0,m,"ADD_HELPER_SLOT",0,x,"ADD_REHEARSAL",0,l,"ADD_TICKET_TYPE",0,"insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, btrim($2), $3, $4, $5) returning id","BILL_EVENT",0,"select app.bill_event($1) as n","BILL_EXAM",0,"select app.bill_exam($1) as n","BOOK_TICKETS",0,"select app.book_tickets($1, $2) as id","CHAPERONES",0,"select id, name, phone, role, checked from event_chaperone where event_id = $1 and deleted_at is null order by name","COSTUME_LIST",0,"select * from app.costume_list($1)","CREATE_EVENT",0,s,"ENTER_EXAM",0,"select app.enter_exam($1, $2, $3, $4::int) as id","EVENTS",0,t,"EXAM_ENTRIES",0,_,"EXAM_REGISTER",0,"select * from app.exam_register($1)","EXAM_RESULT",0,"select app.exam_result($1, $2, $3)","EXAM_SESSIONS",0,c,"EXAM_SESSION_ONE",0,"select id, board, title, exam_on, venue, fee_minor, bill_on_entry from exam_session where id = $1 and deleted_at is null","FEE_TONE",0,{none:"muted",unbilled:"caution",unpaid:"critical",part_paid:"caution",paid:"positive"},"FEE_WORD",0,{none:"No fee",unbilled:"Not billed",unpaid:"Unpaid",part_paid:"Part paid",paid:"Paid"},"HELPER_SLOTS",0,"select * from app.helper_slots($1)","INVITE_CLASSES",0,"select app.invite_classes($1, $2::uuid[]) as n","LOG_PRACTICE",0,"select app.log_practice($1, $2, $3) as id","MARK_EXAM_ATTENDANCE",0,"select app.mark_exam_attendance($1, $2)","MARK_REHEARSAL",0,"select app.mark_rehearsal($1, $2, $3::attendance_status)","MOVE_ROUTINE",0,r,"MY_COSTUMES",0,f,"MY_EXAMS",0,h,"MY_EXAM_DAYS",0,"select * from app.my_exam_days(current_date, current_date + 7)","MY_PRACTICE",0,"select id, practised_on, minutes, what from practice_log where student_id = $1 order by practised_on desc, created_at desc limit 10","MY_TICKETS",0,"select b.id, t.event_id, t.name, b.quantity from ticket_booking b join ticket_type t on t.id = b.ticket_type_id where b.status = 'booked'","PARTICIPANTS",0,a,"PRACTICE_WEEKLY",0,"select * from app.practice_weekly($1)","PROGRAMME",0,"select * from app.event_programme($1)","REHEARSALS",0,"select id, title, starts_at, ends_at, venue from studio_event where parent_event_id = $1 and deleted_at is null order by starts_at","REHEARSAL_REGISTER",0,"select * from app.rehearsal_register($1)","REMOVE_CHAPERONE",0,"delete from event_chaperone where id = $1","REMOVE_HELPER_SLOT",0,"update event_helper_slot set deleted_at = now() where id = $1 returning id","REMOVE_ROUTINE",0,"delete from event_routine where id = $1","RESULTS",0,[["distinction","Distinction"],["merit","Merit"],["pass","Pass"],["highly_commended","Highly commended"],["commended","Commended"],["not_yet","Not yet"]],"ROUTINES",0,n,"SEND_EVENT_NOTICE",0,"select app.send_event_notice($1, $2, $3) as n","SET_COSTUME_SIZE",0,"select app.set_costume_size($1, $2, $3)","SET_COSTUME_STATUS",0,d,"SET_EXAM_BILLING",0,"select app.set_exam_billing($1, $2)","SET_EXAM_DETAILS",0,"select app.set_exam_details($1, $2, $3)","SET_PARTICIPANT",0,"update event_participant set status = $2::participant_status, decided_by = auth.uid(), decided_at = now() where id = $1 returning id","STUDENT_EXAMS",0,p,"STUDENT_PICK",0,"select id, first_name || ' ' || last_name as name from student where deleted_at is null order by first_name, last_name","TICKET_TYPES",0,o,"UPCOMING_EXAMS",0,"select id, board, title, exam_on from exam_session where deleted_at is null and exam_on >= current_date order by exam_on","UPDATE_EVENT",0,i,"WITHDRAW_EXAM",0,"select app.withdraw_exam($1)"])},27389,e=>{"use strict";let t=`r.shows_children, r.for_all_staff, r.no_identifiable_children,
       cs.named, cs.without_consent, cs.family_visible, cs.needs_names`,s="left join lateral app.resource_child_status(r.id) cs on r.shows_children",i=`
select r.id, r.kind, r.title, r.description, r.category, r.url, r.poster_url, r.duration_sec,
       r.storage_path, f.file_name, f.mime_type, f.size_bytes, ${t},
       (select string_agg(distinct coalesce(c.name, lv.name, 'Everyone'), ', ')
          from resource_assignment a
          left join class c on c.id = a.class_id
          left join level lv on lv.id = a.level_id
         where a.resource_id = r.id and a.deleted_at is null) as scope_label
  from resource r
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  ${s}
 where r.deleted_at is null
 order by r.kind, r.category nulls last, r.title`,a=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,u=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,_=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,p=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,h=`
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
       f.file_name, f.mime_type, f.size_bytes, ${t},
       u.full_name as added_by,
       (r.created_by = auth.uid()) as mine,
       case when a.class_id is null then 'Everyone' else null end as scope_label
  from resource r
  left join resource_assignment a
         on a.resource_id = r.id and a.deleted_at is null and a.class_id = $1
  left join resource_file f on f.resource_id = r.id and f.deleted_at is null
  left join user_account u on u.id = r.created_by
  ${s}
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
delete from resource_child where resource_id = $1 and not (student_id = any($2::uuid[]))`,g=`
insert into resource_child (studio_id, resource_id, student_id)
select r.studio_id, r.id, x from resource r, unnest($2::uuid[]) x where r.id = $1
on conflict (resource_id, student_id) do nothing`,y=`
update resource set shows_children = $2, no_identifiable_children = $3 and $2,
                    for_all_staff = $4, updated_at = now()
 where id = $1 returning id`,w=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,$=`
select app.retire_resource($1) as ok`,j=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ADD_RESOURCE_CHILDREN",0,g,"ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,p,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,w,"CLASS_CHILDREN_CONSENT",0,b,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,f,"CLEAR_RESOURCE_CHILDREN",0,v,"CREATE_RESOURCE",0,x,"DECIDE_ENTRY",0,_,"DELETE_RESOURCE",0,$,"EVENTS",0,n,"MY_REQUESTS",0,l,"MY_TEACHING_CLASSES",0,j,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,m,"RAISE_REQUEST",0,d,"REQUEST_MEDIA_CONSENT",0,"select * from app.request_media_consent($1)","REQUEST_PLACE",0,r,"RESOURCES",0,i,"RESOURCE_CHILD_STATUS",0,"select * from app.resource_child_status($1)","STUDENT_FEEDBACK",0,a,"UPDATE_RESOURCE_MEDIA",0,y,"WRITE_FEEDBACK",0,c])}]);