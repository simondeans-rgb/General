(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),a=e.i(19273),i=e.i(15823),n=e.i(40143),r=e.i(14272),l=class extends i.Subscribable{#e;#t=void 0;#s;#a;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#i()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,a.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,a.hashKey)(t.mutationKey)!==(0,a.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#i())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#i(),this.#n(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#i(),this.#n()}mutate(e,t){return this.#a=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#i(){let e=this.#s?.state??(0,r.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#n(e){n.notifyManager.batch(()=>{if(this.#a&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,a={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#a.onSuccess?.(e.data,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(e.data,null,t,s,a)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#a.onError?.(e.error,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(void 0,e.error,t,s,a)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,i){let r=(0,t.useQueryClient)(i),[d]=s.useState(()=>new l(r,e));s.useEffect(()=>{d.setOptions(e)},[d,e]);let o=s.useSyncExternalStore(s.useCallback(e=>d.subscribe(n.notifyManager.batchCalls(e)),[d]),()=>d.getCurrentResult(),()=>d.getCurrentResult()),c=s.useCallback((...e)=>{d.mutate(e[0],e[1]).catch(a.noop)},[d]);if(o.error&&(0,a.shouldThrowError)(d.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},3116,e=>{"use strict";let t=(0,e.i(75254).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Clock",0,t],3116)},78583,e=>{"use strict";let t=(0,e.i(75254).default)("file-text",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",0,t],78583)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},31091,e=>{"use strict";let t=(0,e.i(75254).default)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]);e.s(["Megaphone",0,t],31091)},88699,e=>{"use strict";let t=(0,e.i(75254).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],88699)},14764,e=>{"use strict";let t=(0,e.i(75254).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",0,t],14764)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},6851,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(18566),i=e.i(54616),n=e.i(12598),r=e.i(3116);let l=(0,e.i(75254).default)("upload",[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]]);var d=e.i(46897),o=e.i(84614),c=e.i(61911),u=e.i(75505),m=e.i(37727),h=e.i(43531),_=e.i(77326),p=e.i(15790),f=e.i(31091),x=e.i(14764),y=e.i(27612),v=e.i(88699),b=e.i(13927),j=e.i(30224),g=e.i(31502),k=e.i(17658),w=e.i(94512),S=e.i(75379);function N({classId:e,className:a,canPost:i}){let n=(0,b.useRows)(["class-notices",e],w.CLASS_NOTICES,[e]),[r,l]=s.useState(!1),[d,o]=s.useState(null);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(k.Card,{id:"notices",children:[(0,t.jsx)(k.CardHeader,{title:"Notices",subtitle:i?"Homework, kit, reminders — everyone in the class sees these.":void 0,action:i?(0,t.jsxs)(k.Button,{size:"sm",variant:"primary",onClick:()=>l(!0),children:[(0,t.jsx)(f.Megaphone,{className:"size-4","aria-hidden":!0})," Post"]}):void 0}),n.isPending&&(0,t.jsx)("div",{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(k.Skeleton,{className:"h-14"},e))}),n.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(k.ErrorState,{error:n.error,onRetry:()=>n.refetch()})}),!n.isPending&&n.data?.length===0&&(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(f.Megaphone,{className:"size-5"}),title:"No notices",body:i?"Set homework, or tell the class what to bring next week.":"Anything your teacher sends the class will appear here."}),(n.data?.length??0)>0&&(0,t.jsx)("ul",{className:"divide-y divide-line",children:n.data.map(e=>(0,t.jsx)(E,{n:e,canManage:i&&e.mine,onEdit:()=>o(e)},e.id))})]}),(r||d)&&(0,t.jsx)(C,{classId:e,className:a,notice:d,onClose:()=>{l(!1),o(null)}})]})}function E({n:e,canManage:s,onEdit:a}){let{session:r}=(0,g.useSession)(),l=(0,n.useQueryClient)(),d=(0,i.useMutation)({mutationFn:async()=>(0,j.runAs)(r,t=>t(w.WITHDRAW_NOTICE,[e.id])),onSuccess:()=>l.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]\n                                     bg-accent-soft text-accent-ink",children:(0,t.jsx)(f.Megaphone,{className:"size-4"})}),(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[e.subject&&(0,t.jsx)("p",{className:"font-medium",children:e.subject}),(0,t.jsx)("p",{className:"whitespace-pre-line text-sm leading-relaxed text-ink-2",children:e.body}),(0,t.jsxs)("p",{className:"mt-1 text-[12px] text-ink-3",children:[e.sent_by_name??"The studio"," · ",(0,S.relativeDay)(e.sent_at)," at ",(0,S.time)(e.sent_at)]})]}),s&&(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":`Edit ${e.subject??"notice"}`,onClick:a,children:(0,t.jsx)(v.Pencil,{className:"size-4","aria-hidden":!0})}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":`Withdraw ${e.subject??"notice"}`,loading:d.isPending,onClick:()=>d.mutate(),children:(0,t.jsx)(y.Trash2,{className:"size-4","aria-hidden":!0})})]})]}),d.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(k.ErrorState,{error:d.error})})]})}function C({classId:e,className:a,notice:r,onClose:l}){let{session:d}=(0,g.useSession)(),o=(0,n.useQueryClient)(),[c,u]=s.useState(r?.subject??""),[h,_]=s.useState(r?.body??""),p=(0,i.useMutation)({mutationFn:async()=>(0,j.runAs)(d,t=>r?t(w.EDIT_NOTICE,[r.id,c,h]):t(w.POST_NOTICE,[e,c,h])),onSuccess:()=>{o.invalidateQueries({queryKey:["db"]}),l()}}),f=h.trim().length>=3;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:l,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"notice-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"notice-t",className:"text-[17px] font-semibold tracking-tight",children:r?"Edit notice":"Post a notice"}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:["Goes to everyone in ",a," and their parents."]})]}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:l,children:(0,t.jsx)(m.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(0,t.jsx)(k.Field,{label:"Subject",htmlFor:"notice-subject",hint:"Optional, but it helps them spot it.",children:(0,t.jsx)(k.Input,{id:"notice-subject",value:c,onChange:e=>u(e.target.value),placeholder:"Homework for Thursday"})}),(0,t.jsx)(k.Field,{label:"Message",htmlFor:"notice-body",required:!0,children:(0,t.jsx)("textarea",{id:"notice-body",rows:5,value:h,onChange:e=>_(e.target.value),placeholder:"Practise the first eight counts every day this week. Bring tap shoes and a water bottle.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[12.5px] text-ink-2",children:"Notices go one way. If a parent needs to reply they contact the studio, so the conversation stays on record."})]}),p.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(k.ErrorState,{error:p.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(k.Button,{className:"flex-1",onClick:l,children:"Cancel"}),(0,t.jsxs)(k.Button,{className:"flex-1",variant:"primary",disabled:!f,loading:p.isPending,onClick:()=>p.mutate(),children:[(0,t.jsx)(x.Send,{className:"size-4","aria-hidden":!0})," ",r?"Save":"Send"]})]})]})})}var $=e.i(27389),M=e.i(3053),R=e.i(45060);let T={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},z=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function O(){let e=(0,a.useSearchParams)().get("id")??"",{session:i}=(0,g.useSession)(),n=(0,b.useRow)(["class",e],$.CLASS_DETAIL,[e]),[r,d]=s.useState(!1),o=n.data,u=i?.role==="owner"||i?.role==="admin",m=!!o&&(o.i_teach||u);return(0,t.jsxs)(_.Shell,{title:o?.name??"Class",subtitle:o&&[o.level,o.term_name].filter(Boolean).join(" · ")||void 0,allow:["owner","admin","teacher","guardian","student"],actions:m?(0,t.jsxs)(k.Button,{size:"sm",variant:"primary",onClick:()=>d(!0),children:[(0,t.jsx)(l,{className:"size-4","aria-hidden":!0})," Add material"]}):void 0,children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[n.isLoading&&(0,t.jsx)(k.Card,{className:"p-4",children:(0,t.jsx)(k.Skeleton,{className:"h-24"})}),n.error&&(0,t.jsx)(k.ErrorState,{error:n.error,onRetry:()=>n.refetch()}),!n.isLoading&&!o&&!n.error&&(0,t.jsx)(k.Card,{children:(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(c.Users,{className:"size-5"}),title:"Class not found",body:"Either it has been removed, or it is not one of yours."})}),o&&(0,t.jsx)(A,{c:o}),o&&(0,t.jsx)(N,{classId:e,className:o.name,canPost:m}),o&&(0,t.jsx)(U,{classId:e,canAdd:m,isOffice:u})]}),r&&o&&(0,t.jsx)(B,{classId:e,className:o.name,onClose:()=>d(!1)})]})}function A({c:e}){let s,a=[e.location,e.room].filter(Boolean).join(" · ");return(0,t.jsxs)(k.Card,{className:"p-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[e.style&&(0,t.jsx)(k.Badge,{tone:T[e.colour??""]??"neutral",children:e.style}),e.level&&(0,t.jsx)(k.Badge,{tone:"neutral",children:e.level}),e.i_teach&&(0,t.jsx)(k.Badge,{tone:"accent",children:"You teach this"})]}),(0,t.jsx)("h2",{className:"mt-2 text-[19px] font-semibold tracking-tight",children:e.name}),e.description&&(0,t.jsx)("p",{className:"mt-1 text-sm leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("dl",{className:"mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]",children:[(0,t.jsx)(I,{icon:(0,t.jsx)(r.Clock,{className:"size-3.5"}),label:"When",value:`${z[e.day_of_week]??""} ${(s=e.start_time)?s.slice(0,5):""} \xb7 ${e.duration_min} min`}),a&&(0,t.jsx)(I,{icon:(0,t.jsx)(d.MapPin,{className:"size-3.5"}),label:"Where",value:a}),e.teacher&&(0,t.jsx)(I,{icon:(0,t.jsx)(o.User,{className:"size-3.5"}),label:"Taught by",value:[e.teacher,e.assistant&&`with ${e.assistant}`].filter(Boolean).join(" ")}),(0,t.jsx)(I,{icon:(0,t.jsx)(c.Users,{className:"size-3.5"}),label:"Dancers",value:`${e.enrolled} of ${e.capacity}`})]})]})}function I({icon:e,label:s,value:a}){return(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsxs)("dt",{className:"flex items-center gap-1.5 text-ink-3",children:[e,s]}),(0,t.jsx)("dd",{className:"mt-0.5 font-medium",children:a})]})}function U({classId:e,canAdd:s,isOffice:a}){let i=(0,b.useRows)(["class-resources",e],$.CLASS_RESOURCES,[e]),n=(i.data??[]).filter(e=>!e.scope_label),r=(i.data??[]).filter(e=>!!e.scope_label);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(k.Card,{children:[(0,t.jsx)(k.CardHeader,{title:"For this class",subtitle:0===n.length?void 0:`${n.length} item${1===n.length?"":"s"}`}),i.isPending&&(0,t.jsx)("div",{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(k.Skeleton,{className:"h-14"},e))}),i.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(k.ErrorState,{error:i.error,onRetry:()=>i.refetch()})}),!i.isPending&&0===n.length&&(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(u.FolderOpen,{className:"size-5"}),title:"Nothing shared yet",body:s?"Add a routine video, the music for this term, or a handout — everyone in this class will see it.":"Your teacher has not shared anything for this class yet."}),n.length>0&&(0,t.jsx)("ul",{className:"divide-y divide-line",children:n.map(e=>(0,t.jsx)(p.ResourceRow,{r:e,canManage:a||s&&e.mine},e.id))})]}),r.length>0&&(0,t.jsxs)(k.Card,{children:[(0,t.jsx)(k.CardHeader,{title:"From the studio",subtitle:"Shared with everyone"}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:r.map(e=>(0,t.jsx)(p.ResourceRow,{r:e},e.id))})]})]})}function B({classId:e,className:a,onClose:r}){let{session:l}=(0,g.useSession)(),d=(0,n.useQueryClient)(),[o,c]=s.useState("file"),[u,_]=s.useState(null),[p,f]=s.useState(""),[x,y]=s.useState(""),[v,b]=s.useState(""),[w,S]=s.useState("video"),[N,E]=s.useState(""),[C,T]=s.useState(!0),[z,O]=s.useState(!0),[A,I]=s.useState(!1),U=(0,i.useMutation)({mutationFn:async()=>{let t="file"===o?(0,M.kindForFile)(u):w,s="file"===o?await (0,M.probeDuration)(u):null;return(0,j.runAs)(l,async a=>{let[i]=await a($.CREATE_RESOURCE,[e,t,p.trim(),x.trim()||null,v.trim()||null,"link"===o?N.trim():null,s,C,z]);if(!i)throw Error("You cannot add material to this class.");return"file"===o&&await M.storage.upload(u,{q:a,resourceId:i.id,studioId:i.studio_id}),await a($.ASSIGN_RESOURCE_TO_CLASS,[e,i.id]),i.id})},onSuccess:()=>{I(!0),d.invalidateQueries({queryKey:["db"]})}}),F=!!u&&u.size>M.storage.maxBytes,P=p.trim().length>=2&&("file"===o?!!u&&!F:/^https?:\/\/\S+$/.test(N.trim()));return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:r,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"add-material-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:A?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(h.Check,{className:"size-5"})}),(0,t.jsxs)("p",{id:"add-material-t",className:"font-medium",children:["Shared with ",a]}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"Everyone in the class will find it when they open this class from their timetable."}),(0,t.jsx)(k.Button,{className:"mt-4 w-full",variant:"primary",onClick:r,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"add-material-t",className:"text-[17px] font-semibold tracking-tight",children:"Add material"}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:["Goes to everyone in ",a,"."]})]}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:r,children:(0,t.jsx)(m.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{role:"tablist","aria-label":"Kind of material",className:"mt-3 inline-flex rounded-[var(--radius-md)] border border-line bg-surface-2 p-0.5",children:[["file","Upload a file"],["link","Add a link"]].map(([e,s])=>(0,t.jsx)("button",{role:"tab","aria-selected":o===e,onClick:()=>c(e),className:(0,R.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium",o===e?"bg-surface text-ink shadow-xs":"text-ink-2 hover:text-ink"),children:s},e))}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:["file"===o?(0,t.jsx)(k.Field,{label:"File",htmlFor:"material-file",required:!0,error:F?`That file is ${(0,M.formatBytes)(u.size)} — the limit is ${(0,M.formatBytes)(M.storage.maxBytes)}.`:void 0,hint:`Video, music or a document. Stored in ${M.storage.label}, up to ${(0,M.formatBytes)(M.storage.maxBytes)}.`,children:(0,t.jsx)("input",{id:"material-file",type:"file",accept:"video/*,audio/*,.pdf,.doc,.docx,image/*",onChange:e=>{var t;_(t=e.target.files?.[0]??null),t&&!p.trim()&&f(t.name.replace(/\.[^.]+$/,""))},className:"block w-full text-sm text-ink-2 file:mr-3 file:h-10 file:rounded-[var(--radius-md)]\n                                    file:border file:border-line-strong file:bg-surface file:px-3.5\n                                    file:text-sm file:font-medium file:text-ink hover:file:bg-surface-2"})}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(k.Field,{label:"What kind of thing is it",htmlFor:"material-kind",children:(0,t.jsxs)(k.Select,{id:"material-kind",value:w,onChange:e=>S(e.target.value),children:[(0,t.jsx)("option",{value:"video",children:"A video"}),(0,t.jsx)("option",{value:"audio",children:"Music or a track"}),(0,t.jsx)("option",{value:"link",children:"A page or document"})]})}),(0,t.jsx)(k.Field,{label:"Link",htmlFor:"material-url",required:!0,hint:"Starts with https://",children:(0,t.jsx)(k.Input,{id:"material-url",type:"url",inputMode:"url",value:N,onChange:e=>E(e.target.value),placeholder:"https://"})})]}),(0,t.jsx)(k.Field,{label:"Title",htmlFor:"material-title",required:!0,children:(0,t.jsx)(k.Input,{id:"material-title",value:p,onChange:e=>f(e.target.value),placeholder:"Group routine — counts 1 to 32"})}),(0,t.jsx)(k.Field,{label:"Category",htmlFor:"material-category",hint:"Optional. Groups it in the library.",children:(0,t.jsx)(k.Input,{id:"material-category",value:v,onChange:e=>b(e.target.value),placeholder:"Exam music, Technique, Uniform…"})}),(0,t.jsx)(k.Field,{label:"Note",htmlFor:"material-note",hint:"Optional. What should they do with it?",children:(0,t.jsx)("textarea",{id:"material-note",rows:2,value:x,onChange:e=>y(e.target.value),placeholder:"Practise the first eight before Thursday.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsxs)("fieldset",{className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsx)("legend",{className:"px-1 text-[13px] font-medium text-ink-2",children:"Who can see it"}),(0,t.jsxs)("label",{className:"flex min-h-[36px] items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:C,className:"size-4 accent-[var(--accent)]",onChange:e=>T(e.target.checked)}),"Students in this class"]}),(0,t.jsxs)("label",{className:"flex min-h-[36px] items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:z,className:"size-4 accent-[var(--accent)]",onChange:e=>O(e.target.checked)}),"Their parents"]}),(0,t.jsx)("p",{className:"mt-1 text-[12.5px] text-ink-3",children:"Untick both and it stays visible to staff only."})]})]}),U.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(k.ErrorState,{error:U.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(k.Button,{className:"flex-1",onClick:r,children:"Cancel"}),(0,t.jsx)(k.Button,{className:"flex-1",variant:"primary",disabled:!P,loading:U.isPending,onClick:()=>U.mutate(),children:U.isPending?"Sharing":"Share"})]}),U.isPending&&"file"===o&&(0,t.jsxs)("p",{className:"mt-2 flex items-center justify-center gap-2 text-[12.5px] text-ink-3",children:[(0,t.jsx)(k.Spinner,{className:"size-3"})," Storing the file…"]})]})})})}e.s(["default",0,function(){return(0,t.jsx)(s.Suspense,{fallback:(0,t.jsx)("div",{className:"min-h-dvh"}),children:(0,t.jsx)(O,{})})}],6851)},15790,3053,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(17697),r=e.i(75254);let l=(0,r.default)("music-2",[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]]);var d=e.i(78583);let o=(0,r.default)("link-2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]),c=(0,r.default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),u=(0,r.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);var m=e.i(27612),h=e.i(17658),_=e.i(30224),p=e.i(31502),f=e.i(27389);let x={label:"this browser",maxBytes:0x1400000,async upload(e,{q:t,resourceId:s,studioId:a}){if(e.size>0x1400000)throw Error(`That file is ${y(e.size)}. The demo stores files in the browser, so it caps them at ${y(0x1400000)}.`);let i=new Uint8Array(await e.arrayBuffer()),n=e.type||b(e.name),[r]=await t(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,[a,s,e.name,n,e.size,i]);if(!r)throw Error("The database refused the upload.");let l=`local:${r.id}`;return await t("update resource set storage_path = $2, url = null where id = $1",[s,l]),{path:l,size:e.size,mime:n,name:e.name}},async resolve(e,t){let s=e.startsWith("local:")?e.slice(6):null;if(!s)return null;let a=(await (0,_.runAs)(t,e=>e("select bytes, mime_type from resource_file where id = $1 and deleted_at is null",[s])))[0];return a?URL.createObjectURL(new Blob([function(e){if(e instanceof Uint8Array||e instanceof ArrayBuffer)return new Uint8Array(e);if("string"==typeof e){let t=e.startsWith("\\x")?e.slice(2):e,s=new Uint8Array(t.length/2);for(let e=0;e<s.length;e++)s[e]=parseInt(t.substr(2*e,2),16);return s}throw Error("Unrecognised binary value from the database")}(a.bytes)],{type:a.mime_type})):null},release(e){e.startsWith("blob:")&&URL.revokeObjectURL(e)}};function y(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(+(e<0xa00000))} MB`}let v={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",m4v:"video/x-m4v",mp3:"audio/mpeg",m4a:"audio/mp4",wav:"audio/wav",aac:"audio/aac",pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};function b(e){return v[e.split(".").pop()?.toLowerCase()??""]??"application/octet-stream"}function j(e){let t=e.type||b(e.name);return t.startsWith("video/")?"video":t.startsWith("audio/")?"audio":"document"}e.s(["formatBytes",0,y,"kindForFile",0,j,"probeDuration",0,function(e){return new Promise(t=>{let s=j(e);if("document"===s)return t(null);let a=URL.createObjectURL(e),i=document.createElement("video"===s?"video":"audio"),n=e=>{URL.revokeObjectURL(a),t(e)};i.preload="metadata",i.onloadedmetadata=()=>{let e=Number.isFinite(i.duration)?Math.round(i.duration):0;n(e>0?e:null)},i.onerror=()=>n(null),setTimeout(()=>n(null),5e3),i.src=a})},"storage",0,x],3053);var g=e.i(45060);let k={video:n.PlayCircle,audio:l,document:d.FileText,link:o},w={video:"Video",audio:"Track",document:"Document",link:"Link"};e.s(["ResourceRow",0,function({r:e,canManage:n}){let{session:r}=(0,p.useSession)(),l=(0,i.useQueryClient)(),o=k[e.kind]??d.FileText,v=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec),b=!!e.storage_path,[j,S]=s.useState(null),[N,E]=s.useState(!1),[C,$]=s.useState(null);s.useEffect(()=>()=>{j&&x.release(j)},[j]);let M=async()=>{if(e.storage_path&&!j){E(!0),$(null);try{let t=await x.resolve(e.storage_path,r);if(!t)throw Error("That file is no longer available.");S(t)}catch(e){$(e instanceof Error?e.message:"Could not open that file.")}finally{E(!1)}}},R=(0,a.useMutation)({mutationFn:async()=>(0,_.runAs)(r,t=>t(f.DELETE_RESOURCE,[e.id])),onSuccess:()=>l.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,g.cn)("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]","video"===e.kind?"bg-violet-soft text-violet":"audio"===e.kind?"bg-amber-soft text-amber":"bg-surface-2 text-ink-2"),children:(0,t.jsx)(o,{className:"size-5"})}),(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"font-medium",children:e.title}),e.description&&(0,t.jsx)("p",{className:"mt-0.5 text-[13px] leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("p",{className:"mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-3",children:[(0,t.jsx)("span",{children:w[e.kind]??e.kind}),e.category&&(0,t.jsx)("span",{children:e.category}),e.scope_label&&(0,t.jsx)("span",{children:e.scope_label}),v&&(0,t.jsx)("span",{className:"tnum",children:v}),null!=e.size_bytes&&(0,t.jsx)("span",{className:"tnum",children:y(e.size_bytes)}),e.added_by&&(0,t.jsxs)("span",{children:["added by ",e.added_by]})]})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[b&&!j&&(0,t.jsx)(h.Button,{size:"sm",onClick:M,loading:N,children:"video"===e.kind||"audio"===e.kind?"Play":"Open"}),!b&&e.url&&(0,t.jsxs)(h.Button,{size:"sm",onClick:()=>window.open(e.url,"_blank","noopener,noreferrer"),children:[(0,t.jsx)(c,{className:"size-3.5","aria-hidden":!0})," Open"]}),n&&(0,t.jsx)(h.Button,{size:"sm",variant:"ghost","aria-label":`Remove ${e.title}`,loading:R.isPending,onClick:()=>R.mutate(),children:(0,t.jsx)(m.Trash2,{className:"size-4","aria-hidden":!0})})]})]}),C&&(0,t.jsx)("p",{role:"alert",className:"mt-2 text-[12.5px] text-critical",children:C}),R.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(h.ErrorState,{error:R.error})}),j&&(0,t.jsxs)("div",{className:"mt-3",children:["video"===e.kind&&(0,t.jsx)("video",{src:j,controls:!0,playsInline:!0,preload:"metadata",className:"w-full rounded-[var(--radius-md)] bg-ink"}),"audio"===e.kind&&(0,t.jsx)("audio",{src:j,controls:!0,className:"w-full"}),"video"!==e.kind&&"audio"!==e.kind&&(0,t.jsxs)("a",{href:j,download:e.file_name??e.title,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline",children:[(0,t.jsx)(u,{className:"size-4","aria-hidden":!0}),e.file_name??"Download"]})]})]})}],15790)},27389,e=>{"use strict";let t=`
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
 order by r.kind, r.category nulls last, r.title`,s=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,a=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,i=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       (select count(*)::int from event_participant p
         where p.event_id = ev.id and p.status = 'confirmed' and p.deleted_at is null) as going,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_status,
       (select s.first_name from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null limit 1) as my_student
  from studio_event ev
  left join staff_member sm on sm.id = ev.teacher_id
 where ev.deleted_at is null and ev.starts_at > now() - interval '1 day'
 order by ev.starts_at`,n=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,r=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,l=`
insert into studio_request (studio_id, family_id, student_id, kind, subject, body, raised_by)
select s.studio_id, s.family_id, s.id, $2::request_kind, $3, $4, auth.uid()
  from student s where s.id = $1
returning id`,d=`
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
 order by starts_at`,o=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,c=`
select r.id, r.kind, r.status, r.subject, r.body, r.created_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null and r.status in ('open','in_progress')
 order by r.created_at`,u=`
select p.id, p.status, ev.title as event_title, ev.starts_at,
       s.first_name || ' ' || s.last_name as student_name
  from event_participant p
  join studio_event ev on ev.id = p.event_id
  join student s on s.id = p.student_id
 where p.deleted_at is null and p.status = 'requested'
 order by ev.starts_at`,m=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,h=`
update studio_request
   set status = 'answered', answer = $2, answered_by = auth.uid(), answered_at = now()
 where id = $1
returning id`,_=`
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
 order by (a.id is null), r.kind, r.created_at desc`,f=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,x=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,v=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ANSWER_REQUEST",0,h,"ASSIGN_RESOURCE_TO_CLASS",0,x,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,p,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,m,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_ASSESSMENTS",0,a,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,v,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},94512,e=>{"use strict";let t=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials,
       (select count(*)::int from attendance_record ar
         where ar.session_id = cs.id and ar.deleted_at is null) as marked,
       cs.register_closed_at
  from class_session cs
  join class c on c.id = cs.class_id and c.deleted_at is null
  left join dance_style ds on ds.id = c.dance_style_id
  left join room r on r.id = c.room_id
  left join room sr on sr.id = cs.room_id
  left join location l on l.id = c.location_id
 where cs.deleted_at is null
   and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz
 order by cs.starts_at`,s=`
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
       coalesce(b.requires_alert, false) as requires_alert,
       b.allergies, b.action_plan, b.emergency_contact_name, b.emergency_contact_phone,
       (select round(100.0 * count(*) filter (where a2.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record a2 where a2.student_id = roll.id and a2.deleted_at is null) as attendance_pct
  from roll
  left join attendance_record ar on ar.student_id = roll.id and ar.session_id = $1 and ar.deleted_at is null
  left join student_safety_brief b on b.student_id = roll.id
 order by roll.last_name, roll.first_name`,a=`
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
returning id, status`,i=`
select s.id, s.first_name, s.last_name, s.date_of_birth,
       coalesce(b.requires_alert, false) as requires_alert, b.allergies,
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
 order by s.last_name, s.first_name`,n=`
update class_session set notes = nullif(btrim($2), ''), updated_at = now()
 where id = $1
returning id, notes`,r=`
update attendance_record set reason = nullif(btrim($3), ''), updated_at = now()
 where session_id = $1 and student_id = $2 and deleted_at is null
returning id, reason`,l=`
update class_session set register_closed_at = null, updated_at = now()
 where id = $1
returning id`,d=`
select cm.id, cm.subject, cm.body, cm.sent_at,
       coalesce(sm.display_name, u.full_name) as sent_by_name,
       c.name as class_name,
       (cm.sent_by = auth.uid()) as mine
  from communication cm
  left join class c on c.id = cm.class_id
  left join user_account u on u.id = cm.sent_by
  left join staff_member sm on sm.user_id = cm.sent_by and sm.deleted_at is null
 where cm.deleted_at is null and cm.kind = 'class_broadcast' and cm.class_id = $1
 order by cm.sent_at desc`,o=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_by)
select c.studio_id, 'class_broadcast', 'in_app', c.id, nullif(btrim($2), ''), btrim($3), auth.uid()
  from class c where c.id = $1
returning id`,c=`
update communication set subject = nullif(btrim($2), ''), body = btrim($3), updated_at = now()
 where id = $1
returning id`;e.s(["CLASS_NOTICES",0,d,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,c,"MARK_ATTENDANCE",0,a,"MY_SESSIONS",0,t,"MY_STUDENTS",0,i,"POST_NOTICE",0,o,"REGISTER",0,s,"REOPEN_REGISTER",0,l,"SAVE_SESSION_NOTES",0,n,"SET_REASON",0,r,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])}]);