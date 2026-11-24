(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),a=e.i(19273),i=e.i(15823),n=e.i(40143),l=e.i(14272),r=class extends i.Subscribable{#e;#t=void 0;#s;#a;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#i()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,a.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,a.hashKey)(t.mutationKey)!==(0,a.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#i())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#i(),this.#n(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#i(),this.#n()}mutate(e,t){return this.#a=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#i(){let e=this.#s?.state??(0,l.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#n(e){n.notifyManager.batch(()=>{if(this.#a&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,a={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#a.onSuccess?.(e.data,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(e.data,null,t,s,a)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#a.onError?.(e.error,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(void 0,e.error,t,s,a)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,i){let l=(0,t.useQueryClient)(i),[d]=s.useState(()=>new r(l,e));s.useEffect(()=>{d.setOptions(e)},[d,e]);let c=s.useSyncExternalStore(s.useCallback(e=>d.subscribe(n.notifyManager.batchCalls(e)),[d]),()=>d.getCurrentResult(),()=>d.getCurrentResult()),o=s.useCallback((...e)=>{d.mutate(e[0],e[1]).catch(a.noop)},[d]);if(c.error&&(0,a.shouldThrowError)(d.options.throwOnError,[c.error]))throw c.error;return{...c,mutate:o,mutateAsync:c.mutate}}],54616)},59208,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-clock",[["path",{d:"M16 14v2.2l1.6 1",key:"fo4ql5"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]]);e.s(["CalendarClock",0,t],59208)},17068,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,t],17068)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},10629,e=>{"use strict";var t=e.i(43476),s=e.i(71645);let a=(0,e.i(75254).default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);var i=e.i(63059),n=e.i(17068),l=e.i(7233),r=e.i(77326),d=e.i(47741),c=e.i(78215),o=e.i(13927),m=e.i(17658),u=e.i(21011),_=e.i(75379),h=e.i(45060);function p({sessions:e,view:a}){let i=s.useMemo(()=>{let t=new Map,s=e=>"teacher"===a?e.teacher??"Unassigned":"room"===a?[e.location,e.room].filter(Boolean).join(" · ")||"No room set":`${(0,_.isoDate)(e.starts_at)}|${(0,_.dayName)(e.starts_at)}`;for(let i of e){if("day"===a&&(0,_.isoDate)(i.starts_at)!==(0,_.isoDate)(new Date))continue;let e=s(i);t.set(e,[...t.get(e)??[],i])}return[...t.entries()].sort((e,t)=>e[0].localeCompare(t[0]))},[e,a]);return 0===i.length?(0,t.jsx)(m.Card,{children:(0,t.jsx)(m.EmptyState,{icon:(0,t.jsx)(n.CalendarX2,{className:"size-5"}),title:"Nothing today",body:"Switch to the week view to see the rest of the timetable."})}):(0,t.jsx)("div",{className:"space-y-4",children:i.map(([e,s])=>{let a=e.includes("|")?e.split("|")[1]:e,i=e.includes("|")?e.split("|")[0]:null,n=s.reduce((e,t)=>e+("cancelled"===t.status?0:t.enrolled),0);return(0,t.jsxs)(m.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2.5 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:a}),i&&(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,_.dateLong)(i)}),(0,t.jsxs)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:[s.length," class",1===s.length?"":"es"," · ",n," places"]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.map(e=>(0,t.jsx)("li",{children:(0,t.jsx)(d.SessionRow,{session:e})},e.id))})]},e)})})}e.s(["default",0,function(){let[e,d]=s.useState(()=>new Date),[f,x]=s.useState(!1),[y,g]=s.useState("week"),[b,v]=s.useMemo(()=>(0,_.weekRange)(e),[e]),w=(0,o.useRows)(["week",b],u.SESSIONS_BETWEEN,[b,v]),j=t=>{let s=new Date(e);s.setDate(s.getDate()+7*t),d(s)},S=new Date(b).toDateString()===new Date((0,_.weekRange)(new Date)[0]).toDateString();return(0,t.jsxs)(r.Shell,{title:"Schedule",subtitle:`${(0,_.dateLong)(b)} – ${(0,_.dateLong)(new Date(new Date(v).getTime()-864e5))}`,allow:["owner","admin"],actions:(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(m.Button,{size:"sm",variant:"ghost",onClick:()=>j(-1),"aria-label":"Previous week",children:(0,t.jsx)(a,{className:"size-4","aria-hidden":!0})}),(0,t.jsx)(m.Button,{size:"sm",variant:"secondary",onClick:()=>d(new Date),disabled:S,children:S?"This week":"Back to today"}),(0,t.jsx)(m.Button,{size:"sm",variant:"ghost",onClick:()=>j(1),"aria-label":"Next week",children:(0,t.jsx)(i.ChevronRight,{className:"size-4","aria-hidden":!0})}),(0,t.jsxs)(m.Button,{size:"sm",variant:"primary",onClick:()=>x(!0),children:[(0,t.jsx)(l.Plus,{className:"size-4","aria-hidden":!0})," New class"]})]}),children:[(0,t.jsxs)("div",{className:"mx-auto max-w-6xl space-y-4",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Schedule view",className:"inline-flex rounded-[var(--radius-md)] border border-line bg-surface p-0.5",children:["week","day","teacher","room"].map(e=>(0,t.jsx)("button",{role:"tab","aria-selected":y===e,onClick:()=>g(e),className:(0,h.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium capitalize transition-colors",y===e?"bg-accent-soft text-accent-ink":"text-ink-2 hover:text-ink"),children:"room"===e?"Room":e},e))}),w.isLoading&&(0,t.jsx)(m.Card,{className:"space-y-3 p-4",children:[0,1,2,3].map(e=>(0,t.jsx)(m.Skeleton,{className:"h-14"},e))}),w.error&&(0,t.jsx)(m.ErrorState,{error:w.error,onRetry:()=>w.refetch()}),w.data&&0===w.data.length&&(0,t.jsx)(m.Card,{children:(0,t.jsx)(m.EmptyState,{icon:(0,t.jsx)(n.CalendarX2,{className:"size-5"}),title:"No classes this week",body:"Either the term has not started or this week falls in a break."})}),w.data&&w.data.length>0&&(0,t.jsx)(p,{sessions:w.data,view:y})]}),f&&(0,t.jsx)(c.ClassForm,{onClose:()=>x(!1)})]})}],10629)},78215,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(37727),l=e.i(43531),r=e.i(59208),d=e.i(78894),c=e.i(13927),o=e.i(30224),m=e.i(31502),u=e.i(17658),_=e.i(29074),h=e.i(45060);let p=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],f={name:"",term_id:"",dance_style_id:"",level_id:null,location_id:"",room_id:null,teacher_id:null,day_of_week:1,start_time:"17:00",duration_min:60,capacity:16,age_min:null,age_max:null,price_minor:5400,trials_enabled:!0,waitlist_enabled:!0,visibility:"public"};e.s(["ClassForm",0,function({classId:e,onClose:x}){let{session:y}=(0,m.useSession)(),g=(0,i.useQueryClient)(),b=!!e,v=(0,c.useRows)(["styles"],_.STYLES),w=(0,c.useRows)(["levels"],_.LEVELS),j=(0,c.useRows)(["rooms"],_.ROOMS),S=(0,c.useRows)(["teachers"],_.TEACHERS),N=(0,c.useRows)(["open-terms"],_.OPEN_TERMS),k=(0,c.useRows)(["class-edit",e??""],_.CLASS_FOR_EDIT,[e],{enabled:b}),[E,C]=s.useState(f),[T,$]=s.useState(!1),[M,R]=s.useState(null),A=(e,t)=>C(s=>({...s,[e]:t}));s.useEffect(()=>{if(!T)if(b){let e=k.data?.[0];if(!e)return;C({...e,start_time:String(e.start_time).slice(0,5)}),$(!0)}else N.data?.[0]&&v.data?.[0]&&j.data?.[0]&&(C(e=>({...e,term_id:N.data[0].id,dance_style_id:v.data[0].id,location_id:j.data[0].location_id})),$(!0))},[b,k.data,N.data,v.data,j.data,T]);let O=!!(v.data&&w.data&&j.data&&S.data&&N.data)&&T&&(!b||!!k.data?.[0]),L=v.error??j.error??N.error??k.error,F=(j.data??[]).filter(e=>e.location_id===E.location_id),I=[...new Map((j.data??[]).map(e=>[e.location_id,{id:e.location_id,name:e.location}])).values()],q=k.data?.[0],D=b&&!!q&&(q.day_of_week!==E.day_of_week||String(q.start_time).slice(0,5)!==E.start_time||q.duration_min!==E.duration_min),P=(0,a.useMutation)({mutationFn:async()=>{let t=[E.dance_style_id,E.level_id,E.location_id,E.room_id,E.teacher_id,E.name.trim(),E.day_of_week,E.start_time,E.duration_min,E.capacity,E.age_min,E.age_max,E.price_minor,E.trials_enabled,E.waitlist_enabled,E.visibility];return(0,o.runAs)(y,async s=>{if(b){let[a]=await s(_.UPDATE_CLASS,[e,...t]);if(!a)throw Error("That class could not be saved.");if(D){let[t]=await s(_.RESCHEDULE_CLASS,[e]);return`Saved. The timetable was rebuilt from the new time${t?.net?"":" — sessions with a register taken were left alone"}.`}return"Saved."}let[a]=await s(_.CREATE_CLASS,[E.term_id,...t]);if(!a)throw Error("You cannot add a class to that term.");let[i]=await s(_.GENERATE_SESSIONS,[a.id]);return`Added, with ${i?.made??0} session${i?.made===1?"":"s"} in the term.`})},onSuccess:e=>{R(e),g.invalidateQueries({queryKey:["db"]})}}),z=E.name.trim().length>=2&&E.term_id&&E.dance_style_id&&E.location_id&&E.capacity>0&&E.duration_min>0&&/^\d{2}:\d{2}$/.test(E.start_time)&&(null==E.age_min||null==E.age_max||E.age_max>=E.age_min);return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:x,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"class-form-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:M?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(l.Check,{className:"size-5"})}),(0,t.jsx)("p",{id:"class-form-t",className:"font-medium",children:E.name}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:M}),(0,t.jsx)(u.Button,{className:"mt-4 w-full",variant:"primary",onClick:x,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"class-form-t",className:"text-[17px] font-semibold tracking-tight",children:b?"Edit class":"New class"}),(0,t.jsx)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:b?"Changes apply from here on.":"The term’s sessions are created for you."})]}),(0,t.jsx)(u.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:x,children:(0,t.jsx)(n.X,{className:"size-4","aria-hidden":!0})})]}),!O&&!L&&(0,t.jsxs)("div",{className:"mt-4 space-y-3","aria-busy":"true",children:[(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"Loading the studio’s styles, rooms and terms…"}),[0,1,2,3].map(e=>(0,t.jsx)(u.Skeleton,{className:"h-16"},e))]}),L&&(0,t.jsx)("div",{className:"mt-4",children:(0,t.jsx)(u.ErrorState,{error:L})}),(0,t.jsxs)("div",{className:(0,h.cn)("mt-4 space-y-3",!O&&"hidden"),children:[(0,t.jsx)(u.Field,{label:"Name",htmlFor:"cf-name",required:!0,children:(0,t.jsx)(u.Input,{id:"cf-name",value:E.name,onChange:e=>A("name",e.target.value),placeholder:"Grade 4 Ballet"})}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,t.jsx)(u.Field,{label:"Style",htmlFor:"cf-style",required:!0,children:(0,t.jsx)(u.Select,{id:"cf-style",value:E.dance_style_id,onChange:e=>A("dance_style_id",e.target.value),children:v.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))})}),(0,t.jsx)(u.Field,{label:"Level",htmlFor:"cf-level",children:(0,t.jsxs)(u.Select,{id:"cf-level",value:E.level_id??"",onChange:e=>A("level_id",e.target.value||null),children:[(0,t.jsx)("option",{value:"",children:"No level"}),w.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})})]}),!b&&(0,t.jsx)(u.Field,{label:"Term",htmlFor:"cf-term",required:!0,hint:"Sessions are generated between this term’s dates, skipping its breaks.",children:(0,t.jsx)(u.Select,{id:"cf-term",value:E.term_id,onChange:e=>A("term_id",e.target.value),children:N.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))})}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,t.jsx)(u.Field,{label:"Studio",htmlFor:"cf-loc",required:!0,children:(0,t.jsx)(u.Select,{id:"cf-loc",value:E.location_id,onChange:e=>{A("location_id",e.target.value),A("room_id",null)},children:I.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))})}),(0,t.jsx)(u.Field,{label:"Room",htmlFor:"cf-room",children:(0,t.jsxs)(u.Select,{id:"cf-room",value:E.room_id??"",onChange:e=>A("room_id",e.target.value||null),children:[(0,t.jsx)("option",{value:"",children:"Any room"}),F.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})})]}),(0,t.jsx)(u.Field,{label:"Teacher",htmlFor:"cf-teacher",hint:"They will see this class on their own Today screen and can take its register.",children:(0,t.jsxs)(u.Select,{id:"cf-teacher",value:E.teacher_id??"",onChange:e=>A("teacher_id",e.target.value||null),children:[(0,t.jsx)("option",{value:"",children:"Not assigned yet"}),S.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.display_name},e.id))]})}),(0,t.jsxs)("div",{className:"grid grid-cols-3 gap-3",children:[(0,t.jsx)(u.Field,{label:"Day",htmlFor:"cf-day",required:!0,children:(0,t.jsx)(u.Select,{id:"cf-day",value:String(E.day_of_week),onChange:e=>A("day_of_week",Number(e.target.value)),children:p.map((e,s)=>(0,t.jsx)("option",{value:s,children:e},e))})}),(0,t.jsx)(u.Field,{label:"Starts",htmlFor:"cf-time",required:!0,children:(0,t.jsx)(u.Input,{id:"cf-time",type:"time",value:E.start_time,onChange:e=>A("start_time",e.target.value)})}),(0,t.jsx)(u.Field,{label:"Minutes",htmlFor:"cf-mins",required:!0,children:(0,t.jsx)(u.Input,{id:"cf-mins",type:"number",inputMode:"numeric",min:15,max:240,step:5,value:E.duration_min,onChange:e=>A("duration_min",Number(e.target.value))})})]}),D&&(0,t.jsxs)("p",{className:"flex gap-2 rounded-[var(--radius-md)] bg-caution-soft p-3 text-[13px] text-ink-2",children:[(0,t.jsx)(r.CalendarClock,{className:"mt-0.5 size-4 shrink-0 text-caution","aria-hidden":!0}),(0,t.jsx)("span",{children:"This moves the class. Future sessions will be rebuilt at the new time. Any session whose register has already been taken stays where it is."})]}),(0,t.jsxs)("div",{className:"grid grid-cols-3 gap-3",children:[(0,t.jsx)(u.Field,{label:"Places",htmlFor:"cf-cap",required:!0,children:(0,t.jsx)(u.Input,{id:"cf-cap",type:"number",inputMode:"numeric",min:1,max:100,value:E.capacity,onChange:e=>A("capacity",Number(e.target.value))})}),(0,t.jsx)(u.Field,{label:"Youngest",htmlFor:"cf-agemin",children:(0,t.jsx)(u.Input,{id:"cf-agemin",type:"number",inputMode:"numeric",min:2,max:99,value:E.age_min??"",onChange:e=>A("age_min",""===e.target.value?null:Number(e.target.value))})}),(0,t.jsx)(u.Field,{label:"Oldest",htmlFor:"cf-agemax",children:(0,t.jsx)(u.Input,{id:"cf-agemax",type:"number",inputMode:"numeric",min:2,max:99,value:E.age_max??"",onChange:e=>A("age_max",""===e.target.value?null:Number(e.target.value))})})]}),(0,t.jsx)(u.Field,{label:"Price per term",htmlFor:"cf-price",hint:"In pounds.",children:(0,t.jsx)(u.Input,{id:"cf-price",type:"number",inputMode:"decimal",min:0,step:.5,value:(E.price_minor/100).toFixed(2),onChange:e=>A("price_minor",Math.round(100*Number(e.target.value)))})}),(0,t.jsxs)("fieldset",{className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsx)("legend",{className:"px-1 text-[13px] font-medium text-ink-2",children:"How families find it"}),[["trials_enabled","Taking trial bookings"],["waitlist_enabled","Keep a waiting list when it is full"]].map(([e,s])=>(0,t.jsxs)("label",{className:"flex min-h-[36px] items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:E[e],className:"size-4 accent-[var(--accent)]",onChange:t=>A(e,t.target.checked)}),s]},e)),(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsxs)(u.Select,{"aria-label":"Who can see this class",value:E.visibility,onChange:e=>A("visibility",e.target.value),children:[(0,t.jsx)("option",{value:"public",children:"Listed publicly"}),(0,t.jsx)("option",{value:"unlisted",children:"Unlisted — only by direct link"}),(0,t.jsx)("option",{value:"private",children:"Private — staff and enrolled families only"})]})})]}),null!=E.age_min&&null!=E.age_max&&E.age_max<E.age_min&&(0,t.jsxs)("p",{role:"alert",className:"flex items-center gap-1.5 text-[12.5px] text-critical",children:[(0,t.jsx)(d.AlertTriangle,{className:"size-3.5","aria-hidden":!0})," The oldest age cannot be below the youngest."]})]}),P.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(u.ErrorState,{error:P.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(u.Button,{className:"flex-1",onClick:x,children:"Cancel"}),(0,t.jsx)(u.Button,{className:"flex-1",variant:"primary",disabled:!O||!z,loading:P.isPending,onClick:()=>P.mutate(),children:b?"Save changes":"Create class"})]})]})})})}])},47741,e=>{"use strict";var t=e.i(43476),s=e.i(22016),a=e.i(46897),i=e.i(84614),n=e.i(61911),l=e.i(17658),r=e.i(75379),d=e.i(45060);let c={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},o={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};e.s(["SessionRow",0,function({session:e,href:m}){let u="cancelled"===e.status,_=e.enrolled>=e.capacity,h=(0,t.jsxs)("div",{className:(0,d.cn)("flex items-stretch gap-3 px-4 py-3",u&&"opacity-60"),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,d.cn)("w-1 shrink-0 rounded-full",o[e.colour??""]??"bg-surface-3")}),(0,t.jsxs)("span",{className:"w-[52px] shrink-0 pt-0.5",children:[(0,t.jsx)("span",{className:(0,d.cn)("tnum block text-sm font-semibold",u&&"line-through"),children:(0,r.time)(e.starts_at)}),(0,t.jsx)("span",{className:"tnum block text-[12px] text-ink-3",children:(0,r.time)(e.ends_at)})]}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-x-2 gap-y-1",children:[(0,t.jsx)("span",{className:(0,d.cn)("font-medium",u&&"line-through"),children:e.name}),e.style&&(0,t.jsx)(l.Badge,{tone:c[e.colour??""]??"neutral",children:e.style}),u&&(0,t.jsx)(l.Badge,{tone:"critical",children:"Cancelled"}),!u&&e.trials>0&&(0,t.jsxs)(l.Badge,{tone:"info",children:[e.trials," trial",1===e.trials?"":"s"]})]}),(0,t.jsxs)("span",{className:"mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-ink-2",children:[e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(i.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),e.room&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(a.MapPin,{className:"size-3.5","aria-hidden":!0}),e.room]}),(0,t.jsxs)("span",{className:(0,d.cn)("inline-flex items-center gap-1",_&&"font-medium text-caution"),children:[(0,t.jsx)(n.Users,{className:"size-3.5","aria-hidden":!0}),e.enrolled,"/",e.capacity,_?" · full":""]})]})]})]});return m?(0,t.jsx)(s.default,{href:m,className:"block transition-colors hover:bg-surface-2",children:h}):h}])},29074,e=>{"use strict";let t=`
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
 order by c.day_of_week, c.start_time`,s=`
select s.id, e.id as enrolment_id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
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
 order by s.last_name, s.first_name`,a=`
select w.id, w.position, w.status, s.first_name, s.last_name, f.name as family_name
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
   e.next_action_on nulls last`,l=`select r.id, r.name, r.location_id, r.capacity, l.name as location
                            from room r join location l on l.id = r.location_id
                           where r.deleted_at is null order by l.name, r.name`,r=`select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`,d=`select id, name, starts_on, ends_on from term
                            where deleted_at is null and status <> 'archived'
                            order by starts_on desc`,c=`
insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id,
                   teacher_id, name, day_of_week, start_time, duration_min, capacity,
                   age_min, age_max, price_minor, pricing, trials_enabled, waitlist_enabled,
                   visibility)
select t.studio_id, t.id, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11,
       $12, $13, $14, 'term', $15, $16, $17::class_visibility
  from term t where t.id = $1
returning id`,o=`
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, updated_at = now()
 where id = $1
returning id`,m=`
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`,u=`
insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
select c.studio_id, c.id, $2, 'active', coalesce($3::date, current_date),
       nullif(btrim($4),''), auth.uid()
  from class c where c.id = $1
returning id`,_=`
insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
select c.studio_id, c.id, $2, 'waiting', 0, nullif(btrim($3),'')
  from class c where c.id = $1
returning id, position`,h=`
insert into trial (studio_id, class_id, session_id, student_id, status, price_minor, created_by)
select cs.studio_id, cs.class_id, cs.id, $2, 'booked', c.trial_price_minor, auth.uid()
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = $1
returning id`,p=`
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
 order by (t.status in ('requested','booked')) desc, cs.starts_at nulls last`,f=`
select cs.id, cs.starts_at
  from class_session cs
 where cs.class_id = $1 and cs.deleted_at is null
   and cs.starts_at > now() and cs.status = 'scheduled'
 order by cs.starts_at limit 8`,x=`
select s.id, s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null and s.left_on is null
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.class_id = $1
                      and e.status = 'active' and e.deleted_at is null)
 order by s.last_name, s.first_name`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","BOOK_TRIAL",0,h,"CLASSES",0,t,"CLASS_FOR_EDIT",0,m,"CLASS_ROSTER",0,s,"CLASS_SESSIONS_AHEAD",0,f,"CLASS_WAITLIST",0,a,"CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","CREATE_CLASS",0,c,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,n,"ENROL",0,u,"ENROLLABLE_STUDENTS",0,x,"FUNNEL",0,i,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,_,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,d,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,l,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,r,"TRIALS",0,p,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,o,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])},21011,e=>{"use strict";let t=`
with todays as (
  select cs.* from class_session cs
   where cs.deleted_at is null
     and (cs.starts_at at time zone 'Europe/London')::date = (now() at time zone 'Europe/London')::date
)
select
  count(*) filter (where status <> 'cancelled')::int as classes,
  coalesce((select count(*) from enrolment e
             where e.status = 'active' and e.deleted_at is null
               and e.class_id in (select class_id from todays where status <> 'cancelled')), 0)::int
    as students_expected,
  coalesce((select count(*) from trial t
             where t.deleted_at is null and t.status = 'booked'
               and t.session_id in (select id from todays)), 0)::int as trials,
  count(*) filter (where status = 'cancelled')::int as cancelled,
  count(*) filter (where teacher_id is not null)::int as covered
from todays`,s=`
select
  (select count(*)::int from payment
    where deleted_at is null and failure_code is not null and succeeded_at is null) as failed,
  (select coalesce(sum(total_minor - paid_minor), 0)::bigint from invoice
    where deleted_at is null and status in ('issued','part_paid')) as outstanding_minor,
  (select count(*)::int from invoice
    where deleted_at is null and status in ('issued','part_paid')) as unpaid_invoices`,a=`
select c.id, c.name,
       c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity, 0))::int as pct
  from class c
 where c.deleted_at is null
   and app.class_enrolled_count(c.id) >= greatest(c.capacity - 1, 1)
 order by waiting desc, pct desc`,i=`
select e.id, e.contact_name, e.child_name, e.next_action_on,
       c.name as class_name
  from enquiry e
  left join class c on c.id = e.interest_class_id
 where e.deleted_at is null and e.stage in ('trial_attended','follow_up')
 order by e.next_action_on nulls last`,n=`
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
 order by s.last_name, s.first_name`,l=`
select cs.id, cs.class_id, c.name, cs.starts_at, cs.ends_at, cs.status,
       ds.name as style, ds.colour, lv.name as level,
       coalesce(cover.display_name, st.display_name) as teacher,
       coalesce(sr.name, r.name) as room, l.name as location,
       app.class_enrolled_count(c.id) as enrolled, c.capacity,
       (select count(*)::int from trial t
         where t.session_id = cs.id and t.status = 'booked' and t.deleted_at is null) as trials
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
 order by cs.starts_at, c.name`,r=`
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
 limit 6`,c=`
select cm.id, cm.kind, cm.subject, cm.body, cm.sent_at,
       f.name as family_name, c.name as class_name
  from communication cm
  left join family f on f.id = cm.family_id
  left join class c on c.id = cm.class_id
 where cm.deleted_at is null
 order by cm.sent_at desc
 limit 5`,o=`
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
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,n,"ATTENTION_MESSAGES",0,o,"ATTENTION_PAYMENTS",0,s,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,i,"RECENT_ENROLMENTS",0,r,"RECENT_MESSAGES",0,c,"SESSIONS_BETWEEN",0,l,"TODAY_COUNTS",0,t,"UPCOMING_TRIALS",0,d])}]);