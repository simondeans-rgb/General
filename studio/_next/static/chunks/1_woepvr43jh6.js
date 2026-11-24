(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54616,e=>{"use strict";var t=e.i(12598),s=e.i(71645),a=e.i(19273),i=e.i(15823),r=e.i(40143),n=e.i(14272),l=class extends i.Subscribable{#e;#t=void 0;#s;#a;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#i()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,a.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#s,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,a.hashKey)(t.mutationKey)!==(0,a.hashKey)(this.options.mutationKey)?this.reset():this.#s?.state.status==="pending"&&this.#s.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#s&&(this.#s.addObserver(this),this.#i())}onUnsubscribe(){this.hasListeners()||this.#s?.removeObserver(this)}onMutationUpdate(e){this.#i(),this.#r(e)}getCurrentResult(){return this.#t}reset(){this.#s?.removeObserver(this),this.#s=void 0,this.#i(),this.#r()}mutate(e,t){return this.#a=t,this.#s?.removeObserver(this),this.#s=this.#e.getMutationCache().build(this.#e,this.options),this.#s.addObserver(this),this.#s.execute(e)}#i(){let e=this.#s?.state??(0,n.getDefaultState)();this.#t={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#r(e){r.notifyManager.batch(()=>{if(this.#a&&this.hasListeners()){let t=this.#t.variables,s=this.#t.context,a={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#a.onSuccess?.(e.data,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(e.data,null,t,s,a)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#a.onError?.(e.error,t,s,a)}catch(e){Promise.reject(e)}try{this.#a.onSettled?.(void 0,e.error,t,s,a)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#t)})})}};e.s(["useMutation",0,function(e,i){let n=(0,t.useQueryClient)(i),[d]=s.useState(()=>new l(n,e));s.useEffect(()=>{d.setOptions(e)},[d,e]);let o=s.useSyncExternalStore(s.useCallback(e=>d.subscribe(r.notifyManager.batchCalls(e)),[d]),()=>d.getCurrentResult(),()=>d.getCurrentResult()),c=s.useCallback((...e)=>{d.mutate(e[0],e[1]).catch(a.noop)},[d]);if(o.error&&(0,a.shouldThrowError)(d.options.throwOnError,[o.error]))throw o.error;return{...o,mutate:c,mutateAsync:o.mutate}}],54616)},66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let r=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),h=e.i(86491),m=class extends c.Subscribable{#e;#n=void 0;#l=void 0;#t=void 0;#d;#o;#c;#u;#h;#m;#_;#f;#p;#y=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#c=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#n.addObserver(this),_(this.#n,this.options)?this.#b():this.updateResult(),this.#x())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#n,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#n,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#v(),this.#g(),this.#n.removeObserver(this)}setOptions(e){let t=this.options,s=this.#n;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#n))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#j(),this.#n.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#n,observer:this});let a=this.hasListeners();a&&p(this.#n,s,this.options,t)&&this.#b(),this.updateResult(),a&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||(0,n.resolveStaleTime)(this.options.staleTime,this.#n)!==(0,n.resolveStaleTime)(t.staleTime,this.#n))&&this.#w();let i=this.#k();a&&(this.#n!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)!==(0,n.resolveQueryBoolean)(t.enabled,this.#n)||i!==this.#p)&&this.#S(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#t=i,this.#o=this.options,this.#d=this.#n.state),i}getCurrentResult(){return this.#t}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#y.add(e)}getCurrentQuery(){return this.#n}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},r=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),r])}fetch(e){return this.#b({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#t))}#b(e){this.#j();let t=this.#n.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#w(){this.#v();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#n);if(o.environmentManager.isServer()||this.#t.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#t.dataUpdatedAt,e)+1;this.#_=d.timeoutManager.setTimeout(()=>{this.#t.isStale||this.updateResult()},t)}#k(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#n):this.options.refetchInterval)??!1}#S(e){this.#g(),this.#p=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#n)&&(0,n.isValidTimeout)(this.#p)&&0!==this.#p&&(this.#f=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#b()},this.#p))}#x(){this.#w(),this.#S(this.#k())}#v(){void 0!==this.#_&&(d.timeoutManager.clearTimeout(this.#_),this.#_=void 0)}#g(){void 0!==this.#f&&(d.timeoutManager.clearInterval(this.#f),this.#f=void 0)}createResult(e,t){let s,a=this.#n,i=this.options,r=this.#t,l=this.#d,d=this.#o,o=e!==a?e.state:this.#l,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let s=this.hasListeners(),r=!s&&_(e,t),n=s&&p(e,a,t,i);(r||n)&&(u={...u,...(0,h.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:x}=u;s=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===x){let e;r?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=r.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#m?.state.data,this.#m):t.placeholderData,void 0!==e&&(x="success",s=(0,n.replaceData)(r?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!v)if(r&&s===l?.data&&t.select===this.#u)s=this.#h;else try{this.#u=t.select,s=t.select(s),s=(0,n.replaceData)(r?.data,s,t),this.#h=s,this.#c=null}catch(e){this.#c=e}else void 0===s&&(this.#c=null);this.#c&&(f=this.#c,s=this.#h,b=Date.now(),x="error",m=!1);let g="fetching"===u.fetchStatus,j="pending"===x,w="error"===x,k=j&&g,S=void 0!==s;return{status:x,fetchStatus:u.fetchStatus,isPending:j,isSuccess:"success"===x,isError:w,isInitialLoading:k,isLoading:k,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:g,isRefetching:g&&!j,isLoadingError:w&&!S,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:w&&S,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#t,t=this.createResult(this.#n,this.options);if(this.#d=this.#n.state,this.#o=this.options,void 0!==this.#d.data&&(this.#m=this.#n),(0,n.shallowEqualObjects)(t,e))return;this.#t=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#y.size)return!0;let a=new Set(s??this.#y);return this.options.throwOnError&&a.add("error"),Object.keys(this.#t).some(t=>this.#t[t]!==e[t]&&a.has(t))};this.#r({listeners:s()})}#j(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#n)return;let t=this.#n;this.#n=e,this.#l=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#x()}#r(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#t)}),this.#e.getQueryCache().notify({query:this.#n,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=a.useContext(i),u=a.useContext(r),h=(0,s.useQueryClient)(d),m=h.defaultQueryOptions(e),_=h.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}o=_?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[_.state.error,_]):m.throwOnError,(m.suspense||o)&&!u.isReset()&&(m.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(h,m)),y=p.getOptimisticResult(m),b=!c&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:_,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},75254,e=>{"use strict";var t=e.i(71645);let s=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,s)=>s?s.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)},a=(...e)=>e.filter((e,t,s)=>!!e&&""!==e.trim()&&s.indexOf(e)===t).join(" ").trim();var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let r=(0,t.forwardRef)(({color:e="currentColor",size:s=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:l="",children:d,iconNode:o,...c},u)=>(0,t.createElement)("svg",{ref:u,...i,width:s,height:s,stroke:e,strokeWidth:n?24*Number(r)/Number(s):r,className:a("lucide",l),...!d&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0})(c)&&{"aria-hidden":"true"},...c},[...o.map(([e,s])=>(0,t.createElement)(e,s)),...Array.isArray(d)?d:[d]]));e.s(["default",0,(e,i)=>{let n=(0,t.forwardRef)(({className:n,...l},d)=>(0,t.createElement)(r,{ref:d,iconNode:i,className:a(`lucide-${s(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,n),...l}));return n.displayName=s(e),n}],75254)},76057,e=>{"use strict";let t=(0,e.i(75254).default)("camera-off",[["path",{d:"M14.564 14.558a3 3 0 1 1-4.122-4.121",key:"1rnrzw"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175",key:"1x3arw"}],["path",{d:"M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344",key:"1i84u0"}]]);e.s(["CameraOff",0,t],76057)},68553,e=>{"use strict";let t=(0,e.i(75254).default)("camera",[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);e.s(["Camera",0,t],68553)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},37345,e=>{"use strict";let t=(0,e.i(75254).default)("message-square-plus",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M12 8v6",key:"1ib9pf"}],["path",{d:"M9 11h6",key:"1fldmi"}]]);e.s(["MessageSquarePlus",0,t],37345)},43432,e=>{"use strict";let t=(0,e.i(75254).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);e.s(["Phone",0,t],43432)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},18566,(e,t,s)=>{t.exports=e.r(76562)},28887,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(61911),i=e.i(37345),r=e.i(61574),n=e.i(77326),l=e.i(57850),d=e.i(52547),o=e.i(13927),c=e.i(55831),u=e.i(17658),h=e.i(54616),m=e.i(12598),_=e.i(43531),f=e.i(75254);let p=(0,f.default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),y=(0,f.default)("eye-off",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var b=e.i(30224),x=e.i(31502),v=e.i(27389);function g({student:e,classId:a,onClose:i}){let{session:r}=(0,x.useSession)(),n=(0,m.useQueryClient)(),[l,d]=s.useState(""),[o,c]=s.useState(""),[f,j]=s.useState(""),[w,k]=s.useState(""),[S,R]=s.useState(!0),[E,N]=s.useState(!1),C=(0,h.useMutation)({mutationFn:async()=>(0,b.runAs)(r,t=>t(v.WRITE_FEEDBACK,[e.id,a??null,l.trim(),o.trim()||null,f.trim()||null,w.trim()||null,S])),onSuccess:()=>{N(!0),n.invalidateQueries({queryKey:["db"]})}}),$=l.trim().length>=3&&(o.trim()||f.trim());return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:i,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"fb-title",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:E?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(_.Check,{className:"size-5"})}),(0,t.jsx)("p",{id:"fb-title",className:"font-medium",children:S?"Shared with the family":"Saved as a draft"}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:S?`${e.first_name} and their guardians can see this now.`:"Only studio staff can see this until you share it."}),(0,t.jsx)(u.Button,{className:"mt-4 w-full",variant:"primary",onClick:i,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("h2",{id:"fb-title",className:"text-[17px] font-semibold tracking-tight",children:["Feedback for ",e.first_name]}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(0,t.jsx)(u.Field,{label:"Headline",htmlFor:"fb-head",required:!0,hint:"What this week was about, in a few words.",children:(0,t.jsx)(u.Input,{id:"fb-head",value:l,onChange:e=>d(e.target.value),placeholder:"Lovely week",maxLength:80})}),(0,t.jsx)(u.Field,{label:"Going well",htmlFor:"fb-well",children:(0,t.jsx)("textarea",{id:"fb-well",rows:3,value:o,onChange:e=>c(e.target.value),placeholder:"Be specific — it means more than 'good work'.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)(u.Field,{label:"To work on",htmlFor:"fb-work",children:(0,t.jsx)("textarea",{id:"fb-work",rows:3,value:f,onChange:e=>j(e.target.value),placeholder:"One thing to practise before next week.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsx)(u.Field,{label:"Private note",htmlFor:"fb-priv",hint:"Studio staff only. Never shown to the family, whatever you choose below.",children:(0,t.jsx)("textarea",{id:"fb-priv",rows:2,value:w,onChange:e=>k(e.target.value),className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface-2 p-3 text-sm\n                             focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12"})}),(0,t.jsxs)("label",{className:"flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsx)("input",{type:"checkbox",checked:S,onChange:e=>R(e.target.checked),className:"mt-0.5 size-4 accent-[var(--color-accent)]"}),(0,t.jsxs)("span",{children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5 text-sm font-medium",children:[S?(0,t.jsx)(p,{className:"size-3.5","aria-hidden":!0}):(0,t.jsx)(y,{className:"size-3.5","aria-hidden":!0}),"Share with ",e.first_name," and their guardians"]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:S?"They will see it as soon as you save.":"Saved as a draft. Nothing reaches the family until you share it."})]})]})]}),C.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(u.ErrorState,{error:C.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(u.Button,{className:"flex-1",onClick:i,children:"Cancel"}),(0,t.jsx)(u.Button,{className:"flex-1",variant:"primary",loading:C.isPending,disabled:!$,onClick:()=>C.mutate(),children:S?"Save and share":"Save draft"})]})]})})})}var j=e.i(94512),w=e.i(75379),k=e.i(45060);function S(){let[e,h]=s.useState(""),[m,_]=s.useState(!1),[f,p]=s.useState(null),{selected:y,select:b}=(0,c.useSelection)(),x=(0,o.useRows)(["my-students"],j.MY_STUDENTS),v=x.data?.filter(e=>e.has_medical_need).length??0,S=(x.data??[]).filter(t=>(!e||`${t.preferred_name??t.first_name} ${t.first_name} ${t.last_name}`.toLowerCase().includes(e.toLowerCase()))&&(!m||t.has_medical_need)),R=x.data?.find(e=>e.id===y);return(0,t.jsxs)(n.Shell,{title:"My students",subtitle:x.data?`${x.data.length} across your classes${v?` \xb7 ${v} with medical information`:""}`:void 0,allow:["owner","admin","teacher"],children:[(0,t.jsx)("div",{className:"mx-auto max-w-5xl",children:(0,t.jsxs)("div",{className:(0,k.cn)("gap-5",y?"lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]":"block"),children:[(0,t.jsxs)("div",{className:"min-w-0 space-y-3",children:[(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(u.Input,{type:"search",value:e,onChange:e=>h(e.target.value),placeholder:"Search your students","aria-label":"Search your students"}),v>0&&(0,t.jsxs)(u.Button,{"aria-pressed":m,onClick:()=>_(e=>!e),className:(0,k.cn)("shrink-0",m&&"border-caution bg-caution-soft"),children:[(0,t.jsx)(r.HeartPulse,{className:"size-4 text-caution","aria-hidden":!0})," Medical ",(0,t.jsx)("span",{className:"tnum",children:v})]})]}),x.isLoading&&(0,t.jsx)(u.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(u.Skeleton,{className:"h-12"},e))}),x.error&&(0,t.jsx)(u.ErrorState,{error:x.error}),0===S.length&&!x.isLoading&&(0,t.jsx)(u.Card,{children:(0,t.jsx)(u.EmptyState,{icon:(0,t.jsx)(a.Users,{className:"size-5"}),title:"No students found",body:m?"Nobody matching has medical information recorded.":"You only see children in classes you teach."})}),S.length>0&&(0,t.jsx)(u.Card,{children:(0,t.jsx)("ul",{className:"divide-y divide-line",children:S.map(e=>(0,t.jsx)("li",{children:(0,t.jsxs)("button",{onClick:()=>b(e.id),"aria-current":y===e.id||void 0,className:(0,k.cn)("flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2",y===e.id&&"bg-accent-soft/50"),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,k.cn)("grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold",e.requires_alert?"bg-critical-soft text-critical":e.has_medical_need?"bg-caution-soft text-caution":"bg-surface-2 text-ink-2"),children:(0,w.initials)(e.first_name,e.last_name)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5",children:[(0,t.jsxs)("span",{className:"truncate font-medium",children:[e.preferred_name??e.first_name," ",e.last_name]}),(0,t.jsx)(d.MedicalMarker,{brief:e})]}),(0,t.jsxs)("span",{className:"block truncate text-[12.5px] text-ink-2",children:[(0,w.ageFrom)(e.date_of_birth)," · ",e.class_names??"—"]})]}),null!=e.attendance_pct&&(0,t.jsxs)(u.Badge,{tone:e.attendance_pct>=85?"positive":e.attendance_pct>=70?"caution":"critical",children:[e.attendance_pct,"%"]})]})},e.id))})})]}),y&&(0,t.jsxs)(l.DetailPanel,{open:!0,onClose:()=>b(null),title:R?`${R.preferred_name??R.first_name} ${R.last_name}`:"Student",subtitle:R?`${(0,w.ageFrom)(R.date_of_birth)} years old`:void 0,children:[!R&&x.isLoading&&(0,t.jsx)(u.Skeleton,{className:"h-40"}),!R&&!x.isLoading&&(0,t.jsx)(u.EmptyState,{title:"Not one of your students",body:"You see children in classes you teach."}),R&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(l.DetailSection,{title:"Safety",children:[(0,t.jsx)(d.MedicalBrief,{brief:R,layout:"stack"}),(0,t.jsx)("p",{className:"mt-2 text-[12px] text-ink-3",children:"Kept up to date by the office. GP details stay with them."})]}),(0,t.jsx)(l.DetailSection,{title:"With you",children:(0,t.jsx)(l.KeyValue,{rows:[["Classes",R.class_names],["Attendance",null!=R.attendance_pct?`${R.attendance_pct}%`:null]]})}),(0,t.jsxs)(u.Button,{className:"w-full",onClick:()=>p(R),children:[(0,t.jsx)(i.MessageSquarePlus,{className:"size-4","aria-hidden":!0})," Write feedback"]})]})]})]})}),f&&(0,t.jsx)(g,{student:f,onClose:()=>p(null)})]})}e.s(["default",0,function(){return(0,t.jsx)(s.Suspense,{fallback:(0,t.jsx)("div",{className:"min-h-dvh"}),children:(0,t.jsx)(S,{})})}],28887)},57850,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(37727),i=e.i(45060);e.s(["DetailPanel",0,function({open:e,onClose:r,title:n,subtitle:l,children:d,actions:o}){return(s.useEffect(()=>{if(!e)return;let t=e=>{"Escape"===e.key&&r()};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[e,r]),e)?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"fixed inset-0 z-40 bg-ink/25 lg:hidden",onClick:r,"aria-hidden":!0}),(0,t.jsxs)("aside",{role:"dialog","aria-modal":"true","aria-label":"string"==typeof n?n:"Details",className:(0,i.cn)("fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-xl)]","border-t border-line bg-surface shadow-lg pb-safe","lg:static lg:z-auto lg:max-h-none lg:rounded-[var(--radius-lg)] lg:border lg:shadow-none"),children:[(0,t.jsxs)("div",{className:"sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{className:"truncate text-[17px] font-semibold tracking-tight",children:n}),l&&(0,t.jsx)("div",{className:"truncate text-[13px] text-ink-2",children:l})]}),o,(0,t.jsx)("button",{onClick:r,"aria-label":"Close details",className:"grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink",children:(0,t.jsx)(a.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{className:"p-4",children:d})]})]}):null},"DetailSection",0,function({title:e,children:s,action:a}){return(0,t.jsxs)("section",{className:"mb-5 last:mb-0",children:[(0,t.jsxs)("div",{className:"mb-2 flex items-center gap-2",children:[(0,t.jsx)("h3",{className:"text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3",children:e}),a&&(0,t.jsx)("div",{className:"ml-auto",children:a})]}),s]})},"KeyValue",0,function({rows:e}){return(0,t.jsx)("dl",{className:"space-y-1.5",children:e.map(([e,s])=>(0,t.jsxs)("div",{className:"flex gap-3 text-sm",children:[(0,t.jsx)("dt",{className:"w-28 shrink-0 text-ink-3",children:e}),(0,t.jsx)("dd",{className:"min-w-0 flex-1 break-words",children:s??(0,t.jsx)("span",{className:"text-ink-3",children:"—"})})]},e))})}])},52547,e=>{"use strict";var t=e.i(43476),s=e.i(78894),a=e.i(61574),i=e.i(43432),r=e.i(68553),n=e.i(76057);let l=(0,e.i(75254).default)("user-round",[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]]);var d=e.i(45060);e.s(["MedicalBrief",0,function({brief:e,layout:o="side"}){let c=[["Allergies",e.allergies],["Conditions",e.conditions],["Medication",e.medications]].filter(([,e])=>e&&e.trim()),u=e.emergency_contacts?.length?e.emergency_contacts:e.emergency_contact_phone?[{name:e.emergency_contact_name??"Emergency contact",relationship:null,phone:e.emergency_contact_phone}]:[];return(0,t.jsxs)("div",{className:(0,d.cn)("grid gap-3","side"===o&&"sm:grid-cols-2"),children:[(0,t.jsxs)("section",{"aria-label":"Medical",className:(0,d.cn)("rounded-[var(--radius-md)] border p-3",e.requires_alert?"border-critical/30 bg-critical-soft":e.has_medical_need?"border-caution/30 bg-caution-soft":"border-line bg-surface-2"),children:[(0,t.jsxs)("h3",{className:(0,d.cn)("flex items-center gap-1.5 text-[13px] font-semibold",e.requires_alert?"text-critical":e.has_medical_need?"text-caution":"text-ink-2"),children:[e.requires_alert?(0,t.jsx)(s.AlertTriangle,{className:"size-4","aria-hidden":!0}):(0,t.jsx)(a.HeartPulse,{className:"size-4","aria-hidden":!0}),e.requires_alert?"Urgent medical alert":e.has_medical_need?"Medical information":"Medical"]}),!e.has_medical_need&&(0,t.jsx)("p",{className:"mt-1 text-[13px] text-ink-2",children:"Nothing recorded."}),c.length>0&&(0,t.jsx)("dl",{className:"mt-2 space-y-1.5 text-[13.5px]",children:c.map(([e,s])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3",children:e}),(0,t.jsx)("dd",{children:s})]},e))}),e.action_plan&&(0,t.jsxs)("div",{className:"mt-2 rounded-[var(--radius-sm,6px)] bg-surface/70 p-2.5",children:[(0,t.jsx)("p",{className:"text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-3",children:"In an emergency"}),(0,t.jsx)("p",{className:"mt-0.5 text-[13.5px] font-medium",children:e.action_plan})]})]}),(0,t.jsxs)("section",{"aria-label":"Emergency contacts",className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsxs)("h3",{className:"flex items-center gap-1.5 text-[13px] font-semibold text-ink-2",children:[(0,t.jsx)(i.Phone,{className:"size-4","aria-hidden":!0})," Emergency contacts"]}),0===u.length&&(0,t.jsxs)("p",{className:"mt-1 flex items-center gap-1.5 text-[13px] text-caution",children:[(0,t.jsx)(s.AlertTriangle,{className:"size-3.5","aria-hidden":!0})," None recorded — tell the office."]}),(0,t.jsx)("ul",{className:"mt-1.5 space-y-1",children:u.map((e,s)=>(0,t.jsx)("li",{children:e.phone?(0,t.jsxs)("a",{href:`tel:${e.phone.replace(/\s+/g,"")}`,className:"flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-md)] px-2 -mx-2 hover:bg-surface-2",children:[(0,t.jsx)(l,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block text-[13.5px] font-medium",children:[e.name,e.relationship?(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:[" · ",e.relationship]}):null]}),(0,t.jsx)("span",{className:"tnum block text-[13px] text-accent",children:e.phone})]}),(0,t.jsx)("span",{className:"text-[12px] font-medium text-accent",children:"Call"})]}):(0,t.jsx)("span",{className:"block py-2 text-[13.5px]",children:e.name})},s))}),null!==e.photo_consent&&void 0!==e.photo_consent&&(0,t.jsxs)("p",{className:(0,d.cn)("mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12.5px]",e.photo_consent?"text-ink-2":"font-medium text-caution"),children:[e.photo_consent?(0,t.jsx)(r.Camera,{className:"size-3.5","aria-hidden":!0}):(0,t.jsx)(n.CameraOff,{className:"size-3.5","aria-hidden":!0}),e.photo_consent?"Photos allowed":"No photos"]})]})]})},"MedicalMarker",0,function({brief:e,className:i}){return e.requires_alert?(0,t.jsx)(s.AlertTriangle,{className:(0,d.cn)("size-4 shrink-0 text-critical",i),role:"img","aria-label":"Urgent medical alert"}):e.has_medical_need?(0,t.jsx)(a.HeartPulse,{className:(0,d.cn)("size-4 shrink-0 text-caution",i),role:"img","aria-label":"Medical information recorded"}):null}],52547)},27389,e=>{"use strict";let t=`
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
 order by ev.starts_at`,r=`
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
select app.retire_resource($1) as ok`,x=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_REQUEST",0,m,"ASSIGN_RESOURCE_TO_CLASS",0,y,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,p,"DECIDE_ENTRY",0,h,"DELETE_RESOURCE",0,b,"EVENTS",0,i,"MY_ASSESSMENTS",0,a,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,x,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,u,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,l,"REQUEST_PLACE",0,r,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},94512,e=>{"use strict";let t=`
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
 order by cs.starts_at`,s=`coalesce(b.requires_alert, false) as requires_alert,
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
       ${s},
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
returning id, status`,r=`
select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth,
       ${s},
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
returning id`;e.s(["CLASS_NOTICES",0,o,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,u,"MARK_ATTENDANCE",0,i,"MY_SESSIONS",0,t,"MY_STUDENTS",0,r,"POST_NOTICE",0,c,"REGISTER",0,a,"REOPEN_REGISTER",0,d,"SAVE_SESSION_NOTES",0,n,"SET_REASON",0,l,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])},55831,e=>{"use strict";var t=e.i(71645),s=e.i(18566);e.s(["useSelection",0,function(e="id"){let a=(0,s.useRouter)(),i=(0,s.usePathname)(),r=(0,s.useSearchParams)();return{selected:r.get(e),select:t.useCallback(t=>{let s=new URLSearchParams(Array.from(r.entries()));t?s.set(e,t):s.delete(e);let n=s.toString();a.replace(n?`${i}?${n}`:i,{scroll:!1})},[r,i,a,e])}}])}]);