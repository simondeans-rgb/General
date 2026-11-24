(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),i=e.i(19273),r=e.i(15823),a=e.i(40143),n=e.i(14272),l=class extends r.Subscribable{#e;#t=void 0;#s;#i;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#r()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,i.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,i.hashKey)(t.mutationKey)!==(0,i.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#r())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#r(),this.#a(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#r(),this.#a()}mutate(e,t){return this.#i=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#r(){let e=this.#s?.state??(0,n.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#a(e){a.notifyManager.batch(()=>{if(this.#i&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,i={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#i.onSuccess?.(e.data,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(e.data,null,t,s,i)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#i.onError?.(e.error,t,s,i)}catch(e){Promise.reject(e)}try{this.#i.onSettled?.(void 0,e.error,t,s,i)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,r){let n=(0,t.useQueryClient)(r),[d]=s.useState(()=>new l(n,e));s.useEffect(()=>{d.setOptions(e)},[d,e]);let o=s.useSyncExternalStore(s.useCallback(e=>d.subscribe(a.notifyManager.batchCalls(e)),[d]),()=>d.getCurrentResult(),()=>d.getCurrentResult()),c=s.useCallback((...e)=>{d.mutate(e[0],e[1]).catch(i.noop)},[d]);if(o.error&&(0,i.shouldThrowError)(d.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},66027,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let r=i.createContext(!1);r.Provider,e.i(43476);let a=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),h=e.i(86491),m=class extends c.Subscribable{#e;#n=void 0;#l=void 0;#t=void 0;#d;#o;#c;#u;#h;#m;#_;#f;#p;#y=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#c=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#n.addObserver(this),_(this.#n,this.options)?this.#b():this.updateResult(),this.#g())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#n,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#n,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#v(),this.#x(),this.#n.removeObserver(this)}setOptions(e){let t=this.options,s=this.#n;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#n))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#w(),this.#n.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#n,observer:this});let i=this.hasListeners();i&&p(this.#n,s,this.options,t)&&this.#b(),this.updateResult(),i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||(0,n.resolveStaleTime)(this.options.staleTime,this.#n)!==(0,n.resolveStaleTime)(t.staleTime,this.#n))&&this.#j();let r=this.#E();i&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||r!==this.#p)&&this.#R(r)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),r=this.createResult(i,e);return t=this,s=r,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#t=r,this.#o=this.options,this.#d=this.#n.state),r}getCurrentResult(){return this.#t}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#y.add(e)}getCurrentQuery(){return this.#n}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),r=()=>{},a=new Promise(e=>{t=e,r=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(r(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{r()}),a])}fetch(e){return this.#b({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#t))}#b(e){this.#w();let t=this.#n.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#j(){this.#v();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#n);if(o.environmentManager.isServer()||this.#t.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#t.dataUpdatedAt,e)+1;this.#_=d.timeoutManager.setTimeout(()=>{this.#t.isStale||this.updateResult()},t)}#E(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#n):this.options.refetchInterval)??!1}#R(e){this.#x(),this.#p=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)&&(0,n.isValidTimeout)(this.#p)&&0!==this.#p&&(this.#f=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#b()},this.#p))}#g(){this.#j(),this.#R(this.#E())}#v(){void 0!==this.#_&&(d.timeoutManager.clearTimeout(this.#_),this.#_=void 0)}#x(){void 0!==this.#f&&(d.timeoutManager.clearInterval(this.#f),this.#f=void 0)}createResult(e,t){let s,i=this.#n,r=this.options,a=this.#t,l=this.#d,d=this.#o,o=e!==i?e.state:this.#l,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&_(e,t),n=s&&p(e,i,t,r);(a||n)&&(u={...u,...(0,h.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:g}=u;s=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===g){let e;a?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=a.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#m?.state.data,this.#m):t.placeholderData,void 0!==e&&(g="success",s=(0,n.replaceData)(a?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!v)if(a&&s===l?.data&&t.select===this.#u)s=this.#h;else try{this.#u=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#h=s,this.#c=null}catch(e){this.#c=e}else void 0===s&&(this.#c=null);this.#c&&(f=this.#c,s=this.#h,b=Date.now(),g="error",m=!1);let x="fetching"===u.fetchStatus,w="pending"===g,j="error"===g,E=w&&x,R=void 0!==s;return{status:g,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===g,isError:j,isInitialLoading:E,isLoading:E,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:x,isRefetching:x&&!w,isLoadingError:j&&!R,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:j&&R,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#t,t=this.createResult(this.#n,this.options);if(this.#d=this.#n.state,this.#o=this.options,void 0!==this.#d.data&&(this.#m=this.#n),(0,n.shallowEqualObjects)(t,e))return;this.#t=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#y.size)return!0;let i=new Set(s??this.#y);return this.options.throwOnError&&i.add("error"),Object.keys(this.#t).some(t=>this.#t[t]!==e[t]&&i.has(t))};this.#a({listeners:s()})}#w(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#n)return;let t=this.#n;this.#n=e,this.#l=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#g()}#a(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#t)}),this.#e.getQueryCache().notify({query:this.#n,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function p(e,t,s,i){return(e!==t||!1===(0,n.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=i.useContext(r),u=i.useContext(a),h=(0,s.useQueryClient)(d),m=h.defaultQueryOptions(e),_=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}o=_?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[_.state.error,_]):m.throwOnError,(m.suspense||o)&&!u.isReset()&&(m.retryOnMount=!1),i.useEffect(()=>{u.clearReset()},[u]);let[p]=i.useState(()=>new t(h,m)),y=p.getOptimisticResult(m),b=!c&&f;if(i.useSyncExternalStore(i.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),i.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:r})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(r&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:_,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},75254,e=>{"use strict";var t=e.i(71645);let s=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,s)=>s?s.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)},i=(...e)=>e.filter((e,t,s)=>!!e&&""!==e.trim()&&s.indexOf(e)===t).join(" ").trim();var r={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let a=(0,t.forwardRef)(({color:e="currentColor",size:s=24,strokeWidth:a=2,absoluteStrokeWidth:n,className:l="",children:d,iconNode:o,...c},u)=>(0,t.createElement)("svg",{ref:u,...r,width:s,height:s,stroke:e,strokeWidth:n?24*Number(a)/Number(s):a,className:i("lucide",l),...!d&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0})(c)&&{"aria-hidden":"true"},...c},[...o.map(([e,s])=>(0,t.createElement)(e,s)),...Array.isArray(d)?d:[d]]));e.s(["default",0,(e,r)=>{let n=(0,t.forwardRef)(({className:n,...l},d)=>(0,t.createElement)(a,{ref:d,iconNode:r,className:i(`lucide-${s(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,n),...l}));return n.displayName=s(e),n}],75254)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},18566,(e,t,s)=>{t.exports=e.r(76562)},21840,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(54616),r=e.i(12598),a=e.i(32102),n=e.i(43531),l=e.i(37727),d=e.i(86311),o=e.i(64030),c=e.i(95468),u=e.i(61574);let h=(0,e.i(75254).default)("clipboard-plus",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M9 14h6",key:"159ibu"}],["path",{d:"M12 17v-6",key:"1y8rbf"}]]);var m=e.i(63939),_=e.i(45060),f=e.i(65712),p=e.i(42268),y=e.i(77326),b=e.i(13927),g=e.i(30224),v=e.i(31502),x=e.i(17658),w=e.i(27389),j=e.i(75379);let E={question:"Question",private_lesson:"Private lesson",medical_update:"Medical update",event_interest:"Event",absence:"Absence",other:"Other"};function R({request:e,onClose:a}){let{session:n}=(0,v.useSession)(),l=(0,r.useQueryClient)(),[d,o]=s.useState(""),[u,h]=s.useState(!1),m=(0,i.useMutation)({mutationFn:async()=>(0,g.runAs)(n,t=>t(w.ANSWER_REQUEST,[e.id,d.trim()])),onSuccess:()=>{h(!0),l.invalidateQueries({queryKey:["db"]})}});return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:a,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"ans-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:u?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(c.CheckCircle2,{className:"size-5"})}),(0,t.jsx)("p",{id:"ans-t",className:"font-medium",children:"Replied"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"The family sees your answer in their hub."}),(0,t.jsx)(x.Button,{className:"mt-4 w-full",variant:"primary",onClick:a,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h2",{id:"ans-t",className:"text-[17px] font-semibold tracking-tight",children:"Reply"}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.subject}),(0,t.jsx)("p",{className:"mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm text-ink-2",children:e.body}),(0,t.jsx)("textarea",{value:d,onChange:e=>o(e.target.value),rows:4,"aria-label":"Your reply",placeholder:"Write your reply…",className:"mt-3 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),m.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(x.ErrorState,{error:m.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(x.Button,{className:"flex-1",onClick:a,children:"Cancel"}),(0,t.jsx)(x.Button,{className:"flex-1",variant:"primary",loading:m.isPending,disabled:d.trim().length<2,onClick:()=>m.mutate(),children:"Send reply"})]})]})})})}function S({request:e,onClose:a,onDone:n}){let{session:l}=(0,v.useSession)(),d=(0,r.useQueryClient)(),[o,c]=s.useState(e.student_id??(1===e.children.length?e.children[0].id:"")),u=e.children.find(e=>e.id===o),h=(0,b.useRows)(["medical",o],p.MEDICAL,[o],{enabled:!!o}),_=h.data?.[0],[y,j]=s.useState({}),[E,R]=s.useState(!1),[$,C]=s.useState(null);s.useEffect(()=>{o&&!h.isPending&&$!==o&&(j({allergies:_?.allergies??"",conditions:_?.conditions??"",medications:_?.medications??"",action_plan:_?.action_plan??""}),R(_?.requires_alert??!1),C(o))},[o,h.isPending,_,$]);let k=(u?.name??e.student_name??"").split(" ")[0]||"your child",N=(e.guardian_name??"").split(" ")[0],[T,M]=s.useState("");s.useEffect(()=>{M(`Thank you${N?`, ${N}`:""} — we have updated ${k}'s medical record, and their teachers can now see it.`)},[k,N]);let Q=(0,i.useMutation)({mutationFn:()=>(0,g.runAs)(l,t=>t(w.ACK_MEDICAL,[e.id,JSON.stringify({...y,requires_alert:E}),T,e.student_id?null:o])),onSuccess:()=>{d.invalidateQueries({queryKey:["db"]}),n(`${k}’s record is updated, ${e.guardian_name??"the family"} has been told, and teachers can see it.`)}}),A=!!o&&$===o,I=A&&(E!==(_?.requires_alert??!1)||["allergies","conditions","medications","action_plan"].some(e=>(y[e]??"").trim()!==(_?.[e]??"").trim()));return(0,t.jsxs)(f.RecordSheet,{title:"Add to the medical record",subtitle:`${e.guardian_name??e.family_name}${u?` \xb7 ${u.name}`:""}`,onClose:a,onSave:()=>Q.mutate(),saving:Q.isPending,error:Q.error,canSave:I&&T.trim().length>3,saveLabel:"Update record and tell the parent",children:[(0,t.jsxs)("figure",{className:"rounded-[var(--radius-md)] border-l-4 border-caution bg-caution-soft p-3",children:[(0,t.jsxs)("figcaption",{className:"text-[12px] font-medium text-ink-3",children:[e.guardian_name??"The parent"," wrote · ",e.subject]}),(0,t.jsx)("blockquote",{className:"mt-1 text-sm",children:e.body})]}),!e.student_id&&e.children.length>1&&(0,t.jsx)(x.Field,{label:"Which child",htmlFor:"ru-child",required:!0,children:(0,t.jsxs)(x.Select,{id:"ru-child",value:o,onChange:e=>c(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Choose…"}),e.children.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})}),o&&!A&&(0,t.jsx)(x.Skeleton,{className:"h-40"}),A&&(0,t.jsxs)(t.Fragment,{children:[[["allergies","Allergies","Peanuts — carries an EpiPen"],["conditions","Conditions","Asthma"],["medications","Medication","Blue inhaler, front pocket of her bag"],["action_plan","What to do in an emergency","Two puffs of the inhaler, sit her down, call home"]].map(([s,i,r])=>(0,t.jsxs)(x.Field,{label:i,htmlFor:`ru-${s}`,children:[(0,t.jsx)("textarea",{id:`ru-${s}`,rows:2,value:y[s]??"",placeholder:r,onChange:e=>j(t=>({...t,[s]:e.target.value})),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                           focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"}),(0,t.jsxs)("button",{type:"button",onClick:()=>j(t=>({...t,[s]:t[s]?.trim()?`${t[s].trim()}
${e.body}`:e.body})),className:"mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-[12.5px] font-medium text-accent-text hover:bg-accent-soft",children:[(0,t.jsx)(m.CornerDownLeft,{className:"size-3.5","aria-hidden":!0})," Add the parent’s words here"]})]},s)),(0,t.jsxs)("label",{className:"flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line p-3 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:E,onChange:e=>R(e.target.checked),className:"mt-0.5 size-4"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"font-medium",children:"Urgent — show a red alert"}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:"Teachers see every detail above either way."})]})]}),(0,t.jsx)(x.Field,{label:"Message to the parent",htmlFor:"ru-msg",required:!0,children:(0,t.jsx)("textarea",{id:"ru-msg",rows:3,value:T,onChange:e=>M(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),!I&&(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:"Change the record above to save — or use Acknowledge if nothing needs changing."})]})]})}e.s(["default",0,function(){let{session:e}=(0,v.useSession)(),m=(0,r.useQueryClient)(),f=(0,b.useRows)(["pending-requests"],w.PENDING_REQUESTS),p=(0,b.useRows)(["pending-entries"],w.PENDING_ENTRIES),[$,C]=s.useState(null),[k,N]=s.useState(null),[T,M]=s.useState(null),Q=(0,i.useMutation)({mutationFn:async t=>(0,g.runAs)(e,e=>e(w.ACK_MEDICAL,[t.id,null,null,null])),onSuccess:(e,t)=>{M(`${t.guardian_name??t.family_name} has been told you received it. It is still to be added to ${t.student_name??"the child"}’s record.`),m.invalidateQueries({queryKey:["db"]})}}),A=(0,i.useMutation)({mutationFn:async t=>(0,g.runAs)(e,e=>e(w.DECIDE_ENTRY,[t.id,t.status])),onSuccess:()=>m.invalidateQueries({queryKey:["db"]})}),I=(f.data?.length??0)+(p.data?.length??0);return(0,t.jsxs)(y.Shell,{title:"Requests",allow:["owner","admin"],subtitle:I?`${I} waiting on you`:"Nothing waiting",children:[(0,t.jsxs)("div",{className:"mx-auto max-w-3xl space-y-5",children:[(0,t.jsxs)(x.Card,{children:[(0,t.jsx)(x.CardHeader,{title:"From families",subtitle:"Medical updates first — they are what a teacher needs before the next class"}),f.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(x.Skeleton,{className:"h-20"},e))}),f.data?.length===0&&!f.isLoading&&(0,t.jsx)(x.EmptyState,{icon:(0,t.jsx)(a.Inbox,{className:"size-5"}),title:"Nothing unanswered",body:"Questions from parents and students land here."}),T&&(0,t.jsxs)("p",{role:"status",className:"flex items-center gap-2 border-b border-line bg-positive-soft px-4 py-2.5 text-[13px]",children:[(0,t.jsx)(c.CheckCircle2,{className:"size-4 shrink-0 text-positive","aria-hidden":!0})," ",T]}),null!=Q.error&&(0,t.jsx)("div",{className:"p-3",children:(0,t.jsx)(x.ErrorState,{error:Q.error})}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:f.data?.map(e=>{let s="medical_update"===e.kind;return(0,t.jsxs)("li",{className:(0,_.cn)("px-4 py-3",s&&"bg-caution-soft/40"),children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)(x.Badge,{tone:s?"critical":"neutral",icon:s?(0,t.jsx)(u.HeartPulse,{className:"size-3","aria-hidden":!0}):void 0,children:E[e.kind]??e.kind}),(0,t.jsxs)("span",{className:"text-[12.5px] text-ink-3",children:[e.guardian_name??e.family_name,e.student_name?` \xb7 about ${e.student_name}`:""]}),(0,t.jsx)("span",{className:"ml-auto text-[12.5px] text-ink-3",children:(0,j.relativeDay)(e.created_at)})]}),(0,t.jsx)("p",{className:"mt-1.5 font-medium",children:e.subject}),(0,t.jsx)("p",{className:"mt-0.5 text-sm text-ink-2",children:e.body}),(0,t.jsx)("div",{className:"mt-2.5 flex flex-wrap gap-2",children:s?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(x.Button,{size:"sm",variant:"primary",onClick:()=>N(e),children:[(0,t.jsx)(h,{className:"size-4","aria-hidden":!0})," Acknowledge & add to record"]}),(0,t.jsxs)(x.Button,{size:"sm",loading:Q.isPending&&Q.variables?.id===e.id,onClick:()=>Q.mutate(e),children:[(0,t.jsx)(n.Check,{className:"size-4","aria-hidden":!0})," Acknowledge"]}),(0,t.jsxs)(x.Button,{size:"sm",variant:"ghost",onClick:()=>C(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})]}):(0,t.jsxs)(x.Button,{size:"sm",onClick:()=>C(e),children:[(0,t.jsx)(d.MessageSquare,{className:"size-4","aria-hidden":!0})," Reply"]})})]},e.id)})})]}),(0,t.jsxs)(x.Card,{children:[(0,t.jsx)(x.CardHeader,{title:"Event and competition entries",subtitle:"Nothing is in the diary until you confirm it"}),p.isLoading&&(0,t.jsx)("div",{className:"space-y-2 p-4",children:[0,1].map(e=>(0,t.jsx)(x.Skeleton,{className:"h-14"},e))}),p.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(x.ErrorState,{error:p.error})}),p.data?.length===0&&!p.isLoading&&(0,t.jsx)(x.EmptyState,{icon:(0,t.jsx)(o.Trophy,{className:"size-5"}),title:"No entries waiting",body:"Requests from families appear here."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:p.data?.map(e=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-3 px-4 py-3",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block truncate font-medium",children:e.student_name}),(0,t.jsxs)("span",{className:"block truncate text-[13px] text-ink-2",children:[e.event_title," · ",(0,j.dateLong)(e.starts_at),", ",(0,j.time)(e.starts_at)]})]}),(0,t.jsxs)("span",{className:"flex shrink-0 gap-2",children:[(0,t.jsxs)(x.Button,{size:"sm",variant:"secondary",loading:A.isPending,onClick:()=>A.mutate({id:e.id,status:"declined"}),children:[(0,t.jsx)(l.X,{className:"size-4","aria-hidden":!0})," Decline"]}),(0,t.jsxs)(x.Button,{size:"sm",variant:"primary",loading:A.isPending,onClick:()=>A.mutate({id:e.id,status:"confirmed"}),children:[(0,t.jsx)(n.Check,{className:"size-4","aria-hidden":!0})," Confirm"]})]})]},e.id))})]})]}),$&&(0,t.jsx)(R,{request:$,onClose:()=>C(null)}),k&&(0,t.jsx)(S,{request:k,onClose:()=>N(null),onDone:e=>{N(null),M(e)}})]})}],21840)},65712,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(37727),r=e.i(27612),a=e.i(17658);e.s(["RecordSheet",0,function({title:e,subtitle:n,onClose:l,onSave:d,saving:o,error:c,canSave:u=!0,saveLabel:h="Save",onRemove:m,removing:_,removeLabel:f="Remove",removeHint:p,children:y}){let b=s.useId(),g=s.useRef(null),v=s.useRef(l);return v.current=l,s.useEffect(()=>{let e=e=>{"Escape"===e.key&&v.current()};return document.addEventListener("keydown",e),g.current?.querySelector('input, select, textarea, button:not([aria-label="Close"])')?.focus(),()=>document.removeEventListener("keydown",e)},[]),(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:l,children:(0,t.jsxs)("div",{ref:g,role:"dialog","aria-modal":"true","aria-labelledby":b,onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain\n                   rounded-t-[var(--radius-xl)] border border-line bg-surface p-4 pb-safe shadow-lg\n                   sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:b,className:"text-[17px] font-semibold tracking-tight",children:e}),n&&(0,t.jsx)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:n})]}),(0,t.jsx)(a.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:l,children:(0,t.jsx)(i.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{className:"mt-4 space-y-3",children:y}),null!=c&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(a.ErrorState,{error:c})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(a.Button,{className:"flex-1",onClick:l,children:"Cancel"}),(0,t.jsx)(a.Button,{className:"flex-1",variant:"primary",disabled:!u,loading:o,onClick:d,children:h})]}),m&&(0,t.jsx)("div",{className:"mt-3 border-t border-line pt-3",children:p?(0,t.jsx)("p",{className:"text-[12.5px] text-ink-3",children:p}):(0,t.jsxs)(a.Button,{variant:"danger",className:"w-full",loading:_,onClick:m,children:[(0,t.jsx)(r.Trash2,{className:"size-4","aria-hidden":!0})," ",f]})})]})})}])},27389,e=>{"use strict";let t=`
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
 order by f.shared_at desc`,i=`
select a.id, a.skill, a.level, a.assessed_on, a.note,
       ds.name as style, s.first_name as student_name
  from skill_assessment a
  join student s on s.id = a.student_id
  left join dance_style ds on ds.id = a.dance_style_id
 where a.deleted_at is null
 order by s.first_name, a.skill`,r=`
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
 order by ev.starts_at`,a=`
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
 order by ev.starts_at`,h=`
update event_participant
   set status = $2::participant_status, decided_by = auth.uid(), decided_at = now()
 where id = $1
returning id, status`,m=`
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
 order by (a.id is null), r.kind, r.created_at desc`,p=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,y=`
insert into resource_assignment (studio_id, resource_id, scope, class_id)
select c.studio_id, $2, 'class', c.id from class c where c.id = $1
returning id`,b=`
select app.retire_resource($1) as ok`,g=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,y,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,p,"DECIDE_ENTRY",0,h,"DELETE_RESOURCE",0,b,"EVENTS",0,r,"MY_ASSESSMENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,g,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},42268,e=>{"use strict";let t=`
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
 order by s.last_name, s.first_name`,i=`
select f.id, f.name, f.address_line1, f.city, f.postcode, f.balance_minor, f.notes
  from family f where f.id = $1 and f.deleted_at is null`,r=`
select g.id, g.full_name, g.email, g.phone, g.relationship, g.is_primary, g.receives_billing,
       g.user_id is not null as has_login
  from guardian g where g.family_id = $1 and g.deleted_at is null
 order by g.is_primary desc, g.full_name`,a=`
select s.id, s.first_name, s.last_name, s.date_of_birth, s.joined_on,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select string_agg(c.name, ', ' order by c.name) from enrolment e
          join class c on c.id = e.class_id
         where e.student_id = s.id and e.status = 'active' and e.deleted_at is null) as class_names
  from student s where s.family_id = $1 and s.deleted_at is null
 order by s.date_of_birth`,n=`
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
returning id`,h=`
update guardian set full_name = $2, email = nullif(btrim($3),''),
       phone = nullif(btrim($4),''), relationship = nullif(btrim($5),''),
       is_primary = $6, receives_billing = $7, updated_at = now()
 where id = $1 returning id`,m=`
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
returning id`,b=`
select id, full_name, relationship, phone, priority
  from emergency_contact
 where student_id = $1 and deleted_at is null
 order by priority, full_name`,g=`
insert into emergency_contact (studio_id, student_id, full_name, relationship, phone, priority)
select s.studio_id, s.id, $2, nullif(btrim($3),''), $4,
       coalesce((select max(priority) + 1 from emergency_contact
                  where student_id = s.id and deleted_at is null), 1)
  from student s where s.id = $1
returning id`,v=`
select sm.id, sm.display_name, sm.email, sm.colour, sm.status::text as status, sm.bio, sm.user_id,
       (select count(*)::int from class c
         where (c.teacher_id = sm.id or c.assistant_id = sm.id) and c.deleted_at is null) as classes
  from staff_member sm where sm.deleted_at is null
 order by sm.status, sm.display_name`,x=`
insert into staff_member (studio_id, display_name, email, colour, status, bio)
select id, $1, nullif(btrim($2),''), $3, $4::staff_status, nullif(btrim($5),'')
  from studio where deleted_at is null limit 1
returning id`,w=`
update staff_member set display_name = $2, email = nullif(btrim($3),''), colour = $4,
       status = $5::staff_status, bio = nullif(btrim($6),''), updated_at = now()
 where id = $1 returning id`;e.s(["CREATE_EMERGENCY",0,g,"CREATE_FAMILY",0,o,"CREATE_GUARDIAN",0,u,"CREATE_STAFF",0,x,"CREATE_STUDENT",0,_,"EMERGENCY_CONTACTS",0,b,"FAMILIES",0,t,"FAMILY_DETAIL",0,i,"FAMILY_GUARDIANS",0,r,"FAMILY_INVOICES",0,n,"FAMILY_MESSAGES",0,l,"FAMILY_STUDENTS",0,a,"MEDICAL",0,p,"REMOVE_EMERGENCY",0,"select app.soft_delete('emergency_contact', $1) as ok","REMOVE_GUARDIAN",0,"select app.soft_delete('guardian', $1) as ok","REMOVE_STAFF",0,"select app.soft_delete('staff_member', $1) as ok","SAVE_MEDICAL",0,y,"STAFF_FULL",0,v,"STUDENTS",0,s,"STUDENT_DETAIL",0,m,"STUDENT_SAFETY",0,d,"UPDATE_FAMILY",0,c,"UPDATE_GUARDIAN",0,h,"UPDATE_STAFF",0,w,"UPDATE_STUDENT",0,f])}]);