(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let n=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#n;#r;#l;#d;#o;#c;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#g(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let i=this.#b();a&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#m)&&this.#x(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,r.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#n=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},n=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),n])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#g();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#v(){this.#p();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#b(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#x(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#f(){this.#v(),this.#x(this.#b())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,n=this.#a,l=this.#i,d=this.#n,o=e!==a?e.state:this.#s,{state:c}=e,u={...c},h=!1;if(t._optimisticResults){let s=this.hasListeners(),n=!s&&_(e,t),r=s&&p(e,a,t,i);(n||r)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:g,status:v}=u;s=u.data;let b=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===v){let e;n?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=n.data,b=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(v="success",s=(0,r.replaceData)(n?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!b)if(n&&s===l?.data&&t.select===this.#l)s=this.#d;else try{this.#l=t.select,s=t.select(s),s=(0,r.replaceData)(n?.data,s,t),this.#d=s,this.#r=null}catch(e){this.#r=e}else void 0===s&&(this.#r=null);this.#r&&(f=this.#r,s=this.#d,g=Date.now(),v="error",h=!1);let x="fetching"===u.fetchStatus,j="pending"===v,w="error"===v,S=j&&x,E=void 0!==s;return{status:v,fetchStatus:u.fetchStatus,isPending:j,isSuccess:"success"===v,isError:w,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:g,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:x,isRefetching:x&&!j,isLoadingError:w&&!E,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:w&&E,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#n=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let a=new Set(s??this.#h);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#j({listeners:s()})}#g(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#j(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,r.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=a.useContext(i),u=a.useContext(n),m=(0,s.useQueryClient)(d),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),f=!1!==e.subscribed;if(h._optimisticResults=c?"isRestoring":f?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}o=_?.state.error&&"function"==typeof h.throwOnError?(0,r.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||o)&&!u.isReset()&&(h.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(m,h)),y=p.getOptimisticResult(h),g=!c&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=g?p.subscribe(l.notifyManager.batchCalls(e)):r.noop;return p.updateResult(),t},[p,g]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(h)},[h,p]),h?.suspense&&y.isPending)throw p.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,r.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:p.trackResult(y)}(e,h,t)}],66027)},23622,e=>{"use strict";let t=(0,e.i(75254).default)("ban",[["path",{d:"M4.929 4.929 19.07 19.071",key:"196cmz"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Ban",0,t],23622)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},18566,(e,t,s)=>{t.exports=e.r(76562)},21840,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),n=e.i(32102),r=e.i(43531),l=e.i(37727),d=e.i(86311),o=e.i(64030),c=e.i(95468),u=e.i(61574);let m=(0,e.i(75254).default)("clipboard-plus",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M9 14h6",key:"159ibu"}],["path",{d:"M12 17v-6",key:"1y8rbf"}]]);var h=e.i(63939),_=e.i(86866),f=e.i(45060),p=e.i(65712),y=e.i(42268),g=e.i(77326),v=e.i(13927),b=e.i(30224),x=e.i(31502),j=e.i(17658),w=e.i(27389),S=e.i(21011),E=e.i(7725),$=e.i(75379);let N={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",other:"Other"};function R({request:e,onClose:n}){let{session:r}=(0,x.useSession)(),l=(0,i.useQueryClient)(),[d,o]=s.useState(""),[u,m]=s.useState(!1),h=(0,a.useMutation)({mutationFn:async()=>(0,b.runAs)(r,t=>t(w.ANSWER_REQUEST,[e.id,d.trim()])),onSuccess:()=>{m(!0),l.invalidateQueries({queryKey:["db"]})}});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ans-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:u?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(c.CheckCircle2,{className:"size-5"})}),(0,t.jsx)("p",{id:"ans-t",className:"font-medium",children:"Replied"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The family sees your answer in their hub."}),(0,t.jsx)(j.Button,{className:"mt-4 w-full",variant:"primary",onClick:n,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ans-t",className:"text-[17px] font-semibold tracking-tight",children:"Reply"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.subject}),(0,t.jsx)("p",{className:"mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2",children:e.body}),(0,t.jsx)("textarea",{value:d,onChange:e=>o(e.target.value),rows:4,"aria-label":"Your reply",placeholder:"Write your reply…",className:"mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),h.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(j.ErrorState,{error:h.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(j.Button,{className:"flex-1",onClick:n,children:"Cancel"}),(0,t.jsx)(j.Button,{className:"flex-1",variant:"primary",loading:h.isPending,disabled:d.trim().length<2,onClick:()=>h.mutate(),children:"Send reply"})]})]})})})}function C({request:e,onClose:n,onDone:r}){let{session:l}=(0,x.useSession)(),d=(0,i.useQueryClient)(),[o,c]=s.useState(e.student_id??(1===e.children.length?e.children[0].id:"")),u=e.children.find(e=>e.id===o),m=(0,v.useRows)(["medical",o],y.MEDICAL,[o],{enabled:!!o}),_=m.data?.[0],[f,g]=s.useState({}),[S,E]=s.useState(!1),[$,N]=s.useState(null);s.useEffect(()=>{o&&!m.isPending&&$!==o&&(g({allergies:_?.allergies??"",conditions:_?.conditions??"",medications:_?.medications??"",action_plan:_?.action_plan??""}),E(_?.requires_alert??!1),N(o))},[o,m.isPending,_,$]);let R=(u?.name??e.student_name??"").split(" ")[0]||"your child",k=(e.guardian_name??"").split(" ")[0],[T,I]=s.useState("");s.useEffect(()=>{I(`Thank you${k?`, ${k}`:""} — we have updated ${R}'s medical record, and their teachers can now see it.`)},[R,k]);let A=(0,a.useMutation)({mutationFn:()=>(0,b.runAs)(l,t=>t(w.ACK_MEDICAL,[e.id,JSON.stringify({...f,requires_alert:S}),T,e.student_id?null:o])),onSuccess:()=>{d.invalidateQueries({queryKey:["db"]}),r(`${R}’s record is updated, ${e.guardian_name??"the family"} has been told, and teachers can see it.`)}}),O=!!o&&$===o,D=O&&(S!==(_?.requires_alert??!1)||["allergies","conditions","medications","action_plan"].some(e=>(f[e]??"").trim()!==(_?.[e]??"").trim()));return(0,t.jsxs)(p.RecordSheet,{title:"Add to the medical record",subtitle:`${e.guardian_name??e.family_name}${u?` \xb7 ${u.name}`:""}`,onClose:n,onSave:()=>A.mutate(),saving:A.isPending,error:A.error,canSave:D&&T.trim().length>3,saveLabel:"Update record and tell the parent",children:[(0,t.jsxs)("figure",{className:"rounded-[var(--radius-md)] border-l-4 border-caution bg-caution-soft p-3",children:[(0,t.jsxs)("figcaption",{className:"text-[12px] font-medium text-ink-3",children:[e.guardian_name??"The parent"," wrote · ",e.subject]}),(0,t.jsx)("blockquote",{className:"mt-1 text-sm",children:e.body})]}),!e.student_id&&e.children.length>1&&(0,t.jsx)(j.Field,{label:"Which child",htmlFor:"ru-child",required:!0,children:(0,t.jsxs)(j.Select,{id:"ru-child",value:o,onChange:e=>c(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Choose…"}),e.children.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})}),o&&!O&&(0,t.jsx)(j.Skeleton,{className:"h-40"}),O&&(0,t.jsxs)(t.Fragment,{children:[[["allergies","Allergies","Peanuts — carries an EpiPen"],["conditions","Conditions","Asthma"],["medications","Medication","Blue inhaler, front pocket of her bag"],["action_plan","What to do in an emergency","Two puffs of the inhaler, sit her down, call home"]].map(([s,a,i])=>(0,t.jsxs)(j.Field,{label:a,htmlFor:`ru-${s}`,children:[(0,t.jsx)("textarea",{id:`ru-${s}`,rows:2,value:f[s]??"",placeholder:i,onChange:e=>g(t=>({...t,[s]:e.target.value})),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),(0,t.jsxs)("button",{type:"button",onClick:()=>g(t=>({...t,[s]:t[s]?.trim()?`${t[s].trim()}
${e.body}`:e.body})),className:"mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-[12.5px] font-medium text-accent-text hover:bg-accent-soft",children:[(0,t.jsx)(h.CornerDownLeft,{className:"size-3.5","aria-hidden":!0})," Add the parent’s words here"]})]},s)),(0,t.jsxs)("label",{className:"flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line p-3 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:S,onChange:e=>E(e.target.checked),className:"mt-0.5 size-4"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"font-medium",children:"Urgent — show a red alert"}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:"Teachers see every detail above either way."})]})]}),(0,t.jsx)(j.Field,{label:"Message to the parent",htmlFor:"ru-msg",required:!0,children:(0,t.jsx)("textarea",{id:"ru-msg",rows:3,value:T,onChange:e=>I(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),!D&&(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"Change the record above to save — or use Acknowledge if nothing needs changing."})]})]})}e.s(["default",0,function(){let{session:e}=(0,x.useSession)(),h=(0,i.useQueryClient)(),p=(0,v.useRows)(["pending-requests"],w.PENDING_REQUESTS),y=(0,v.useRows)(["pending-entries"],w.PENDING_ENTRIES),[k,T]=s.useState(null),[I,A]=s.useState(null),[O,D]=s.useState(null),[M,F]=s.useState(null),Q=(0,a.useMutation)({mutationFn:async t=>(await (0,b.readAs)(e,S.SESSION_BY_ID,[t]))[0],onSuccess:e=>e&&F(e)}),P=(0,a.useMutation)({mutationFn:async t=>(0,b.runAs)(e,e=>e(w.ACK_MEDICAL,[t.id,null,null,null])),onSuccess:(e,t)=>{D(`${t.guardian_name??t.family_name} has been told you received it. It is still to be added to ${t.student_name??"the child"}’s record.`),h.invalidateQueries({queryKey:["db"]})}}),q=(0,a.useMutation)({mutationFn:async t=>{let s="join_class"===t.action?w.APPROVE_PLACE:"add_child"===t.action?w.APPROVE_CHILD:w.APPROVE_TRIAL,a=await (0,b.runAs)(e,e=>e(s,"join_class"===t.action?[t.id,null]:[t.id]));return{r:t,outcome:a[0]?.outcome}},onSuccess:({r:e,outcome:t})=>{D("join_class"===e.action?"enrolled"===t?`Done — enrolled in ${e.class_name}, and the family has been told.`:`${e.class_name} is full, so they are on the waiting list. The family has been told.`:"add_child"===e.action?"Added to the family, with the parent as emergency contact. They have been told.":"Trial booked and the family told."),h.invalidateQueries({queryKey:["db"]})}}),L=(0,a.useMutation)({mutationFn:async t=>(0,b.runAs)(e,e=>e(w.DECIDE_ENTRY,[t.id,t.status])),onSuccess:()=>h.invalidateQueries({queryKey:["db"]})}),B=(p.data?.length??0)+(y.data?.length??0);return(0,t.jsxs)(g.Shell,{title:"Requests",allow:["owner","admin"],subtitle:B?`${B} waiting on you`:"Nothing waiting",children:[(0,t.jsxs)("div",{className:"mx-auto max-w-3xl space-y-5",children:[(0,t.jsxs)(j.Card,{children:[(0,t.jsx)(j.CardHeader,{title:"From families",subtitle:"Medical updates first — they are what a teacher needs before the next class"}),p.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(j.Skeleton,{className:"h-20"},e))}),p.data?.length===0&&!p.isLoading&&(0,t.jsx)(j.EmptyState,{icon:(0,t.jsx)(n.Inbox,{className:"size-5"}),title:"Nothing unanswered",body:"Questions from parents and students land here."}),O&&(0,t.jsxs)("p",{role:"status",className:"flex items-center gap-2 border-b border-line bg-positive-soft px-4 py-2.5 text-[13px]",children:[(0,t.jsx)(c.CheckCircle2,{className:"size-4 shrink-0 text-positive","aria-hidden":!0})," ",O]}),null!=P.error&&(0,t.jsx)("div",{className:"p-3",children:(0,t.jsx)(j.ErrorState,{error:P.error})}),null!=q.error&&(0,t.jsx)("div",{className:"p-3",children:(0,t.jsx)(j.ErrorState,{error:q.error})}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:p.data?.map(e=>{let s="medical_update"===e.kind;return(0,t.jsxs)("li",{className:(0,f.cn)("px-4 py-3",s&&"bg-caution-soft/40"),children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(j.Badge,{tone:s?"critical":"neutral",icon:s?(0,t.jsx)(u.HeartPulse,{className:"size-3","aria-hidden":!0}):void 0,children:N[e.kind]??e.kind}),(0,t.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:[e.guardian_name??e.family_name,e.student_name?` \xb7 about ${e.student_name}`:""]}),(0,t.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,$.relativeDay)(e.created_at)})]}),(0,t.jsx)("p",{className:"mt-1.5 font-medium",children:e.subject}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.body}),(0,t.jsx)("div",{className:"mt-2.5 flex flex-wrap gap-2",children:s?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",onClick:()=>A(e),children:[(0,t.jsx)(m,{className:"size-4","aria-hidden":!0})," Acknowledge & add to record"]}),(0,t.jsxs)(j.Button,{size:"sm",loading:P.isPending&&P.variables?.id===e.id,onClick:()=>P.mutate(e),children:[(0,t.jsx)(r.Check,{className:"size-4","aria-hidden":!0})," Acknowledge"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):e.action?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:q.isPending&&q.variables?.id===e.id,onClick:()=>q.mutate(e),children:[(0,t.jsx)(r.Check,{className:"size-4","aria-hidden":!0}),"join_class"===e.action?"Give them a place":"add_child"===e.action?"Add to the family":"Book the trial"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply instead"]})]}):e.session_id?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:Q.isPending&&Q.variables===e.session_id,onClick:()=>Q.mutate(e.session_id),children:[(0,t.jsx)(_.UserRoundCheck,{className:"size-4","aria-hidden":!0})," Arrange cover"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"ghost",onClick:()=>T(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):(0,t.jsxs)(j.Button,{size:"sm",onClick:()=>T(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})})]},e.id)})})]}),(0,t.jsxs)(j.Card,{children:[(0,t.jsx)(j.CardHeader,{title:"Event and competition entries",subtitle:"Nothing is in the diary until you confirm it"}),y.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(j.Skeleton,{className:"h-14"},e))}),y.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(j.ErrorState,{error:y.error})}),y.data?.length===0&&!y.isLoading&&(0,t.jsx)(j.EmptyState,{icon:(0,t.jsx)(o.Trophy,{className:"size-5"}),title:"No entries waiting",body:"Requests from families appear here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:y.data?.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-3 px-4 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block truncate font-medium",children:e.student_name}),(0,t.jsxs)("span",{className:"block truncate text-[13px] text-ink-2",children:[e.event_title," · ",(0,$.dateLong)(e.starts_at),", ",(0,$.time)(e.starts_at)]})]}),(0,t.jsxs)("span",{className:"flex shrink-0 gap-2",children:[(0,t.jsxs)(j.Button,{size:"sm",variant:"secondary",loading:L.isPending,onClick:()=>L.mutate({id:e.id,status:"declined"}),children:[(0,t.jsx)(l.X,{className:"size-4","aria-hidden":!0})," Decline"]}),(0,t.jsxs)(j.Button,{size:"sm",variant:"primary",loading:L.isPending,onClick:()=>L.mutate({id:e.id,status:"confirmed"}),children:[(0,t.jsx)(r.Check,{className:"size-4","aria-hidden":!0})," Confirm"]})]})]},e.id))})]})]}),M&&(0,t.jsx)(E.SessionSheet,{session:M,initial:"cover",onClose:()=>F(null)}),k&&(0,t.jsx)(R,{request:k,onClose:()=>T(null)}),I&&(0,t.jsx)(C,{request:I,onClose:()=>A(null),onDone:e=>{A(null),D(e)}})]})}],21840)},33405,54626,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(45974);let i="#5b46d9";function n(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),l=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function d(e){let[t,s,a]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function o(e,t){let[s,a]=[d(e),d(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function c([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),i=Math.min(e,t,s),n=(a+i)/2;if(a===i)return[0,0,n];let r=a-i;return[(a===e?(t-s)/r+6*(t<s):a===t?(s-e)/r+2:(e-t)/r+4)/6,n>.5?r/(2-a-i):r/(a+i),n]}function u([e,t,s]){if(0===t)return l([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,i=2*s-a,n=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?i+(a-i)*6*e:e<.5?a:e<2/3?i+(a-i)*(2/3-e)*6:i;return l([255*n(e+1/3),255*n(e),255*n(e-1/3)])}function m(e,t,s){let[a,i,n]=c(r(e)),l=e;for(;o(l,t)<s&&n>0;)l=u([a,i,n=Math.max(0,n-.01)]);return l}function h(e){let t,s,a=n(e)??i,d=4.5>o(a,"#ffffff"),[h,_,f]=c(r(a)),p=u([h,_,d?Math.min(1,f+.08):Math.max(0,f-.07)]),y=(t=r(a),s=r("#ffffff"),l([0,1,2].map(e=>t[e]*(1-.9)+.9*s[e]))),g=m(a,y,4.5),v=m(a,"#ffffff",4.5),b=m(a,"#ffffff",3);return{accent:a,onAccent:d?"#000000":"#ffffff",hover:p,soft:y,ink:g,text:v,line:b,darkText:d,textDeepened:v!==a}}let _=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),f=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["DEFAULT_BRAND",0,i,"PRESETS",0,[{name:"Violet",hex:"#5b46d9"},{name:"Navy",hex:"#1e3a8a"},{name:"Teal",hex:"#0f766e"},{name:"Forest",hex:"#166534"},{name:"Plum",hex:"#86198f"},{name:"Rose",hex:"#be123c"},{name:"Burnt orange",hex:"#c2410c"},{name:"Charcoal",hex:"#334155"}],"cssVars",0,_,"monogram",0,f,"normaliseHex",0,n,"paletteFor",0,h],54626);var p=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,p.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by ",(0,t.jsx)(a.BarreMark,{className:"size-3","aria-hidden":!0})," ",(0,t.jsx)("span",{className:"font-medium",children:"Barre"})]})},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,p.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,p.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:f(e)})},"useBrandTheme",0,function(e){s.useEffect(()=>{let t=document.documentElement,s=_(h(e));if(!e)return void Object.keys(s).forEach(e=>t.style.removeProperty(e));Object.entries(s).forEach(([e,s])=>t.style.setProperty(e,s));let a=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});a.setAttribute("content",s["--color-accent"]),a.parentNode||document.head.appendChild(a)},[e])}],33405)},7725,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(22016),i=e.i(54616),n=e.i(12598),r=e.i(23622),l=e.i(59208);let d=(0,e.i(75254).default)("user-round-cog",[["path",{d:"m14.305 19.53.923-.382",key:"3m78fa"}],["path",{d:"m15.228 16.852-.923-.383",key:"npixar"}],["path",{d:"m16.852 15.228-.383-.923",key:"5xggr7"}],["path",{d:"m16.852 20.772-.383.924",key:"dpfhf9"}],["path",{d:"m19.148 15.228.383-.923",key:"1reyyz"}],["path",{d:"m19.53 21.696-.382-.924",key:"1goivc"}],["path",{d:"M2 21a8 8 0 0 1 10.434-7.62",key:"1yezr2"}],["path",{d:"m20.772 16.852.924-.383",key:"htqkph"}],["path",{d:"m20.772 19.148.924.383",key:"9w9pjp"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}]]);var o=e.i(54385),c=e.i(95468),u=e.i(65712),m=e.i(13927),h=e.i(30224),_=e.i(31502),f=e.i(17658),p=e.i(21011),y=e.i(75379),g=e.i(45060);e.s(["SessionSheet",0,function({session:e,onClose:v,initial:b="menu"}){let{session:x}=(0,_.useSession)(),j=(0,n.useQueryClient)(),[w,S]=s.useState(b),[E,$]=s.useState(null),N=(0,m.useRows)(["session-families",e.id],p.SESSION_FAMILIES,[e.id]).data?.[0]?.n??0,R=(0,m.useRows)(["staff-options"],p.STAFF_OPTIONS,[],{enabled:"cover"===w}),C=(0,m.useRows)(["room-options"],p.ROOM_OPTIONS,[],{enabled:"move"===w}),k=`${e.name} on ${(0,y.dateLong)(e.starts_at)} at ${(0,y.time)(e.starts_at)}`,[T,I]=s.useState(""),[A,O]=s.useState(""),[D,M]=s.useState(!0),[F,Q]=s.useState((0,y.isoDate)(e.starts_at)),[P,q]=s.useState((0,y.time)(e.starts_at)),[L,B]=s.useState(e.room_id??""),[U,z]=s.useState("");s.useEffect(()=>{"cancel"===w&&O(`Sorry — ${k} is cancelled${T?` (${T.trim()})`:""}. We will see you next week.`)},[w,T,k]),s.useEffect(()=>{"move"===w&&O(`${k} is moving to ${F?(0,y.dateLong)(F):"…"} at ${P}${C.data?.find(e=>e.id===L)?`, ${C.data.find(e=>e.id===L).name}`:""}.`)},[w,F,P,L,C.data,k]),s.useEffect(()=>{let e=R.data?.find(e=>e.id===U)?.display_name;"cover"===w&&O(e?`${e} will be teaching ${k}.`:"")},[w,U,R.data,k]);let Y=(0,i.useMutation)({mutationFn:async()=>(0,h.runAs)(x,t=>{if("cancel"===w)return t(p.CANCEL_SESSION,[e.id,T.trim(),A,D]);if("move"===w){let s=new Date(`${F}T${P}:00`);return t(p.MOVE_SESSION,[e.id,s.toISOString(),L||null,A,D])}return t(p.COVER_SESSION,[e.id,U||null,A,D])}),onSuccess:()=>{j.invalidateQueries({queryKey:["db"]}),$("cancel"===w?`Cancelled.${D?` ${N} famil${1===N?"y has":"ies have"} been told, and the teacher.`:""}`:"move"===w?`Moved.${D?` ${N} famil${1===N?"y has":"ies have"} been told.`:""}`:"Cover arranged. The teacher has the register and safety notes on their Today screen.")}});if(E)return(0,t.jsx)(u.RecordSheet,{title:"Done",onClose:v,onSave:v,saveLabel:"Close",children:(0,t.jsxs)("p",{className:"flex items-start gap-2 text-sm",children:[(0,t.jsx)(c.CheckCircle2,{className:"mt-0.5 size-4 text-positive","aria-hidden":!0}),E]})});if("menu"===w){let s="cancelled"===e.status;return(0,t.jsxs)(u.RecordSheet,{title:e.name,subtitle:`${(0,y.dateLong)(e.starts_at)} \xb7 ${(0,y.time)(e.starts_at)}–${(0,y.time)(e.ends_at)}${e.room?` \xb7 ${e.room}`:""}`,onClose:v,onSave:v,saveLabel:"Close",children:[(0,t.jsxs)("div",{className:"flex flex-wrap gap-1.5",children:[e.teacher&&(0,t.jsxs)(f.Badge,{children:[e.teacher,e.covered?` (covering for ${e.usual_teacher})`:""]}),(0,t.jsxs)(f.Badge,{children:[e.enrolled,"/",e.capacity," booked",e.trials?` \xb7 ${e.trials} trial`:""]}),s&&(0,t.jsxs)(f.Badge,{tone:"critical",children:["Cancelled",e.cancel_reason?`: ${e.cancel_reason}`:""]})]}),(0,t.jsx)("ul",{className:"divide-y divide-line rounded-[var(--radius-md)] border border-line",children:[["register",o.ClipboardCheck,"Open the register","Mark attendance for this session"],["cancel",r.Ban,"Cancel this session","Just this one — the rest of the term is unchanged"],["move",l.CalendarClock,"Move this session","Another day, time or room"],["cover",d,e.covered?"Change cover":"Arrange cover","Another teacher for this session only"]].map(([i,n,r,l])=>{let d=s?"register"!==i:e.register_closed&&"register"!==i,o=(0,t.jsxs)("span",{className:(0,g.cn)("flex min-h-[52px] items-center gap-3 px-3 py-2.5 text-left",d&&"opacity-50"),children:[(0,t.jsx)(n,{className:(0,g.cn)("size-4 shrink-0","cancel"===i?"text-critical":"text-ink-3"),"aria-hidden":!0}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block text-sm font-medium",children:r}),(0,t.jsx)("span",{className:"block text-[12.5px] text-ink-3",children:l})]})]});return(0,t.jsx)("li",{children:"register"===i?(0,t.jsx)(a.default,{href:`/teach/register/?session=${e.id}`,className:"block hover:bg-surface-2",children:o}):(0,t.jsx)("button",{disabled:d,onClick:()=>S(i),className:"block w-full hover:bg-surface-2 disabled:pointer-events-none",children:o})},i)})}),e.register_closed&&!s&&(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"This session has been taught, so it can no longer be changed."})]})}let G="cancel"===w?"Cancel this session":"move"===w?"Move this session":"Arrange cover",V="cancel"===w?T.trim().length>=3:"move"!==w||!!F&&/^\d{2}:\d{2}$/.test(P);return(0,t.jsxs)(u.RecordSheet,{title:G,subtitle:k,onClose:v,onSave:()=>Y.mutate(),saving:Y.isPending,error:Y.error,canSave:V&&A.trim().length>3||"cover"===w&&!U&&e.covered,saveLabel:"cancel"===w?D?`Cancel and tell ${N} famil${1===N?"y":"ies"}`:"Cancel session":"move"===w?D?`Move and tell ${N} famil${1===N?"y":"ies"}`:"Move session":U||!e.covered?"Arrange cover":"Back to the usual teacher",children:["cancel"===w&&(0,t.jsx)(f.Field,{label:"Reason",htmlFor:"ss-reason",required:!0,hint:"Families see this.",children:(0,t.jsx)(f.Input,{id:"ss-reason",value:T,onChange:e=>I(e.target.value),placeholder:"Teacher unwell",maxLength:120})}),"move"===w&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,t.jsx)(f.Field,{label:"Date",htmlFor:"ss-date",required:!0,children:(0,t.jsx)(f.Input,{id:"ss-date",type:"date",value:F,onChange:e=>Q(e.target.value)})}),(0,t.jsx)(f.Field,{label:"Starts",htmlFor:"ss-time",required:!0,children:(0,t.jsx)(f.Input,{id:"ss-time",type:"time",value:P,onChange:e=>q(e.target.value)})})]}),(0,t.jsx)(f.Field,{label:"Room",htmlFor:"ss-room",children:(0,t.jsxs)(f.Select,{id:"ss-room",value:L,onChange:e=>B(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Same room"}),C.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})}),(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"The session keeps its length. Only this session moves."})]}),"cover"===w&&(0,t.jsx)(f.Field,{label:"Who will teach it",htmlFor:"ss-teacher",hint:"They get the register and the safety notes for this session's children.",children:(0,t.jsxs)(f.Select,{id:"ss-teacher",value:U,onChange:e=>z(e.target.value),children:[(0,t.jsx)("option",{value:"",children:e.covered?`Back to ${e.usual_teacher??"the usual teacher"}`:"Choose a teacher…"}),R.data?.map(e=>(0,t.jsx)("option",{value:e.id,children:e.display_name},e.id))]})}),(0,t.jsxs)("label",{className:"flex items-start gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:D,onChange:e=>M(e.target.checked),className:"mt-0.5 size-4"}),(0,t.jsxs)("span",{children:["cover"===w?"Tell the families too":`Tell the ${N} famil${1===N?"y":"ies"} and the teacher`,(0,t.jsx)("span",{className:"block text-[12.5px] text-ink-3",children:"cover"===w?"The covering teacher is always told.":"A class notice, plus a notification each."})]})]}),(D||"cover"===w)&&(0,t.jsx)(f.Field,{label:"Message",htmlFor:"ss-msg",children:(0,t.jsx)("textarea",{id:"ss-msg",rows:3,value:A,onChange:e=>O(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)(f.Button,{variant:"ghost",size:"sm",onClick:()=>S("menu"),children:"← Other options"})]})}],7725)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),i=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,i=a.getFullYear()-t.getFullYear(),n=a.getMonth()-t.getMonth();return(n<0||0===n&&a.getDate()<t.getDate())&&(i-=1),i},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,i,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let a=s(e),i=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),n=e=>i.find(t=>t.type===e)?.value??"";return`${n("year")}-${n("month")}-${n("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),n=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?a(t):i(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},21011,e=>{"use strict";let t=`
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
 order by s.last_name, s.first_name`,r=`
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
 order by cs.starts_at, c.name`,l=r.replace("and cs.starts_at >= $1::timestamptz and cs.starts_at < $2::timestamptz","and cs.id = $1"),d=`
select e.id, e.started_on, s.first_name, s.last_name, c.name as class_name
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where e.deleted_at is null and e.status = 'active'
 order by e.started_on desc, e.created_at desc
 limit 6`,o=`
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
 limit 5`,u=`
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
    where deleted_at is null and status = 'open' and kind = 'medical_update') as medical_updates`,h=`select r.id, l.name || ' \xb7 ' || r.name as name from room r join location l on l.id = r.location_id
  where r.deleted_at is null order by l.name, r.name`,_=`
select count(distinct st.family_id)::int as n from enrolment e join student st on st.id = e.student_id
 where e.class_id = (select class_id from class_session where id = $1) and e.status = 'active' and e.deleted_at is null`;e.s(["ATTENTION_CAPACITY",0,a,"ATTENTION_LAPSED",0,n,"ATTENTION_MESSAGES",0,u,"ATTENTION_PAYMENTS",0,s,"ATTENTION_REQUESTS",0,m,"ATTENTION_TRIALS",0,i,"CANCEL_SESSION",0,"select app.cancel_session($1, $2, $3, $4)","COVER_SESSION",0,"select app.cover_session($1, $2, $3, $4)","MOVE_SESSION",0,"select app.move_session($1, $2::timestamptz, $3, $4, $5)","RECENT_ENROLMENTS",0,d,"RECENT_MESSAGES",0,c,"ROOM_OPTIONS",0,h,"SESSIONS_BETWEEN",0,r,"SESSION_BY_ID",0,l,"SESSION_FAMILIES",0,_,"STAFF_OPTIONS",0,"select id, display_name from staff_member where status = 'active' and deleted_at is null order by display_name","TODAY_COUNTS",0,t,"UPCOMING_TRIALS",0,o])},27389,e=>{"use strict";let t=`
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
returning id, status`,m=`
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
 where c.id = $1 and c.deleted_at is null`,_=`
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
returning id, studio_id`,p=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,y=`
select app.retire_resource($1) as ok`,g=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,_,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,g,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,i,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])},42268,e=>{"use strict";let t=`
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
 order by f.name`,s=`
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
 where id = $1 returning id`,u=`
insert into guardian (studio_id, family_id, full_name, email, phone, relationship,
                      is_primary, receives_billing)
select f.studio_id, f.id, $2, nullif(btrim($3),''), nullif(btrim($4),''),
       nullif(btrim($5),''), $6, $7
  from family f where f.id = $1
returning id`,m=`
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
 order by priority, full_name`,v=`
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
 order by sm.status, sm.display_name`,x=`
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`,j=`
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["CREATE_EMERGENCY",0,v,"CREATE_FAMILY",0,o,"CREATE_GUARDIAN",0,u,"CREATE_STAFF",0,x,"CREATE_STUDENT",0,_,"EMERGENCY_CONTACTS",0,g,"FAMILIES",0,t,"FAMILY_DETAIL",0,a,"FAMILY_GUARDIANS",0,i,"FAMILY_INVOICES",0,r,"FAMILY_MESSAGES",0,l,"FAMILY_STUDENTS",0,n,"MEDICAL",0,p,"REMOVE_EMERGENCY",0,"select app.soft_delete('emergency_contact', $1) as ok","REMOVE_GUARDIAN",0,"select app.soft_delete('guardian', $1) as ok","REMOVE_STAFF",0,"select app.soft_delete('staff_member', $1) as ok","SAVE_MEDICAL",0,y,"STAFF_FULL",0,b,"STUDENTS",0,s,"STUDENT_DETAIL",0,h,"STUDENT_SAFETY",0,d,"UPDATE_FAMILY",0,c,"UPDATE_GUARDIAN",0,m,"UPDATE_STAFF",0,j,"UPDATE_STUDENT",0,f])}]);