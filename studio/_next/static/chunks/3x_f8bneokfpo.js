(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let r=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#r;#n;#l;#d;#o;#c;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let i=this.#g();a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#m)&&this.#x(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#r=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},r=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),r])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#v(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#x(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#f(){this.#v(),this.#x(this.#g())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,r=this.#a,l=this.#i,d=this.#r,o=e!==a?e.state:this.#s,{state:c}=e,u={...c},h=!1;if(t._optimisticResults){let s=this.hasListeners(),r=!s&&_(e,t),n=s&&p(e,a,t,i);(r||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:v}=u;s=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===v){let e;r?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=r.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(v="success",s=(0,n.replaceData)(r?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!g)if(r&&s===l?.data&&t.select===this.#l)s=this.#d;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(r?.data,s,t),this.#d=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(f=this.#n,s=this.#d,b=Date.now(),v="error",h=!1);let x="fetching"===u.fetchStatus,j="pending"===v,w="error"===v,k=j&&x,S=void 0!==s;return{status:v,fetchStatus:u.fetchStatus,isPending:j,isSuccess:"success"===v,isError:w,isInitialLoading:k,isLoading:k,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:x,isRefetching:x&&!j,isLoadingError:w&&!S,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:w&&S,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#r=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let a=new Set(s??this.#h);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#j({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#j(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=a.useContext(i),u=a.useContext(r),m=(0,s.useQueryClient)(d),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),f=!1!==e.subscribed;if(h._optimisticResults=c?"isRestoring":f?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}o=_?.state.error&&"function"==typeof h.throwOnError?(0,n.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||o)&&!u.isReset()&&(h.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(m,h)),y=p.getOptimisticResult(h),b=!c&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(h)},[h,p]),h?.suspense&&y.isPending)throw p.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:p.trackResult(y)}(e,h,t)}],66027)},3116,e=>{"use strict";let t=(0,e.i(75254).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Clock",0,t],3116)},40160,e=>{"use strict";let t=(0,e.i(75254).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],40160)},32095,e=>{"use strict";let t=(0,e.i(75254).default)("graduation-cap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);e.s(["GraduationCap",0,t],32095)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},31091,e=>{"use strict";let t=(0,e.i(75254).default)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]);e.s(["Megaphone",0,t],31091)},88699,e=>{"use strict";let t=(0,e.i(75254).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],88699)},50627,e=>{"use strict";let t=(0,e.i(75254).default)("receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);e.s(["Receipt",0,t],50627)},14764,e=>{"use strict";let t=(0,e.i(75254).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",0,t],14764)},83086,e=>{"use strict";let t=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],83086)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},69074,e=>{"use strict";let t=(0,e.i(75254).default)("upload",[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]]);e.s(["Upload",0,t],69074)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},61911,e=>{"use strict";let t=(0,e.i(75254).default)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);e.s(["Users",0,t],61911)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},18566,(e,t,s)=>{t.exports=e.r(76562)},6851,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(18566),i=e.i(54616),r=e.i(12598),n=e.i(3116),l=e.i(69074),d=e.i(46897),o=e.i(84614),c=e.i(61911),u=e.i(75505),m=e.i(37727),h=e.i(43531),_=e.i(77326),f=e.i(15790),p=e.i(61966),y=e.i(31091),b=e.i(14764),v=e.i(27612),g=e.i(88699),x=e.i(13927),j=e.i(30224),w=e.i(31502),k=e.i(17658),S=e.i(94512),E=e.i(75379);function N({classId:e,className:a,canPost:i}){let r=(0,x.useRows)(["class-notices",e],S.CLASS_NOTICES,[e]),[n,l]=s.useState(!1),[d,o]=s.useState(null);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(k.Card,{id:"notices",children:[(0,t.jsx)(k.CardHeader,{title:"Notices",subtitle:i?"Homework, kit, reminders — everyone in the class sees these.":void 0,action:i?(0,t.jsxs)(k.Button,{size:"sm",variant:"primary",onClick:()=>l(!0),children:[(0,t.jsx)(y.Megaphone,{className:"size-4","aria-hidden":!0})," Post"]}):void 0}),r.isPending&&(0,t.jsx)("div",{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(k.Skeleton,{className:"h-14"},e))}),r.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(k.ErrorState,{error:r.error,onRetry:()=>r.refetch()})}),!r.isPending&&r.data?.length===0&&(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(y.Megaphone,{className:"size-5"}),title:"No notices",body:i?"Set homework, or tell the class what to bring next week.":"Anything your teacher sends the class will appear here."}),(r.data?.length??0)>0&&(0,t.jsx)("ul",{className:"divide-y divide-line",children:r.data.map(e=>(0,t.jsx)(R,{n:e,canManage:i&&e.mine,onEdit:()=>o(e)},e.id))})]}),(n||d)&&(0,t.jsx)($,{classId:e,className:a,notice:d,onClose:()=>{l(!1),o(null)}})]})}function R({n:e,canManage:s,onEdit:a}){let{session:i}=(0,w.useSession)(),n=(0,r.useQueryClient)();return(0,p.useRemoving)()(e.id)?null:(0,t.jsx)("li",{className:"px-4 py-3.5",children:(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]\n                                     bg-accent-soft text-accent-ink",children:(0,t.jsx)(y.Megaphone,{className:"size-4"})}),(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[e.subject&&(0,t.jsx)("p",{className:"font-medium",children:e.subject}),(0,t.jsx)("p",{className:"whitespace-pre-line text-sm leading-relaxed text-ink-2",children:e.body}),(0,t.jsxs)("p",{className:"mt-1 text-[12px] text-ink-3",children:[e.sent_by_name??"The studio"," · ",(0,E.relativeDay)(e.sent_at)," at ",(0,E.time)(e.sent_at)]})]}),s&&(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":`Edit ${e.subject??"notice"}`,onClick:a,children:(0,t.jsx)(g.Pencil,{className:"size-4","aria-hidden":!0})}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":`Withdraw ${e.subject??"notice"}`,onClick:()=>(0,p.removeWithUndo)(e.id,e.subject?`“${e.subject}”`:"Notice",async()=>{await (0,j.runAs)(i,t=>t(S.WITHDRAW_NOTICE,[e.id])),n.invalidateQueries({queryKey:["db"]})}),children:(0,t.jsx)(v.Trash2,{className:"size-4","aria-hidden":!0})})]})]})})}function $({classId:e,className:a,notice:n,onClose:l}){let{session:d}=(0,w.useSession)(),o=(0,r.useQueryClient)(),[c,u]=s.useState(n?.subject??""),[h,_]=s.useState(n?.body??""),f=(0,i.useMutation)({mutationFn:async()=>(0,j.runAs)(d,t=>n?t(S.EDIT_NOTICE,[n.id,c,h]):t(S.POST_NOTICE,[e,c,h])),onSuccess:()=>{o.invalidateQueries({queryKey:["db"]}),l()}}),p=h.trim().length>=3;return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:l,children:(0,t.jsxs)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"notice-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"notice-t",className:"text-[17px] font-semibold tracking-tight",children:n?"Edit notice":"Post a notice"}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:["Goes to everyone in ",a," and their parents."]})]}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:l,children:(0,t.jsx)(m.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:[(0,t.jsx)(k.Field,{label:"Subject",htmlFor:"notice-subject",hint:"Optional, but it helps them spot it.",children:(0,t.jsx)(k.Input,{id:"notice-subject",value:c,onChange:e=>u(e.target.value),placeholder:"Homework for Thursday"})}),(0,t.jsx)(k.Field,{label:"Message",htmlFor:"notice-body",required:!0,children:(0,t.jsx)("textarea",{id:"notice-body",rows:5,value:h,onChange:e=>_(e.target.value),placeholder:"Practise the first eight counts every day this week. Bring tap shoes and a water bottle.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                         focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,t.jsx)("p",{className:"rounded-[var(--radius-md)] bg-surface-2 p-3 text-[12.5px] text-ink-2",children:"Notices go one way. If a parent needs to reply they contact the studio, so the conversation stays on record."})]}),f.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(k.ErrorState,{error:f.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(k.Button,{className:"flex-1",onClick:l,children:"Cancel"}),(0,t.jsxs)(k.Button,{className:"flex-1",variant:"primary",disabled:!p,loading:f.isPending,onClick:()=>f.mutate(),children:[(0,t.jsx)(b.Send,{className:"size-4","aria-hidden":!0})," ",n?"Save":"Send"]})]})]})})}var T=e.i(27389),C=e.i(3053),I=e.i(45060);let M={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"},O=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function A(){let e=(0,a.useSearchParams)().get("id")??"",{session:i}=(0,w.useSession)(),r=(0,x.useRow)(["class",e],T.CLASS_DETAIL,[e]),[n,d]=s.useState(!1),o=r.data,u=i?.role==="owner"||i?.role==="admin",m=!!o&&(o.i_teach||u);return(0,t.jsxs)(_.Shell,{title:o?.name??"Class",subtitle:o&&[o.level,o.term_name].filter(Boolean).join(" · ")||void 0,allow:["owner","admin","teacher","guardian","student"],actions:m?(0,t.jsxs)(k.Button,{size:"sm",variant:"primary",onClick:()=>d(!0),children:[(0,t.jsx)(l.Upload,{className:"size-4","aria-hidden":!0})," Add material"]}):void 0,children:[(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[r.isLoading&&(0,t.jsx)(k.Card,{className:"p-4",children:(0,t.jsx)(k.Skeleton,{className:"h-24"})}),r.error&&(0,t.jsx)(k.ErrorState,{error:r.error,onRetry:()=>r.refetch()}),!r.isLoading&&!o&&!r.error&&(0,t.jsx)(k.Card,{children:(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(c.Users,{className:"size-5"}),title:"Class not found",body:"Either it has been removed, or it is not one of yours."})}),o&&(0,t.jsx)(D,{c:o}),o&&(0,t.jsx)(N,{classId:e,className:o.name,canPost:m}),o&&(0,t.jsx)(U,{classId:e,canAdd:m,isOffice:u})]}),n&&o&&(0,t.jsx)(F,{classId:e,className:o.name,onClose:()=>d(!1)})]})}function D({c:e}){let s,a=[e.location,e.room].filter(Boolean).join(" · ");return(0,t.jsxs)(k.Card,{className:"p-4",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[e.style&&(0,t.jsx)(k.Badge,{tone:M[e.colour??""]??"neutral",children:e.style}),e.level&&(0,t.jsx)(k.Badge,{tone:"neutral",children:e.level}),e.i_teach&&(0,t.jsx)(k.Badge,{tone:"accent",children:"You teach this"})]}),(0,t.jsx)("h2",{className:"mt-2 text-[19px] font-semibold tracking-tight",children:e.name}),e.description&&(0,t.jsx)("p",{className:"mt-1 text-sm leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("dl",{className:"mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]",children:[(0,t.jsx)(Q,{icon:(0,t.jsx)(n.Clock,{className:"size-3.5"}),label:"When",value:`${O[e.day_of_week]??""} ${(s=e.start_time)?s.slice(0,5):""} \xb7 ${e.duration_min} min`}),a&&(0,t.jsx)(Q,{icon:(0,t.jsx)(d.MapPin,{className:"size-3.5"}),label:"Where",value:a}),e.teacher&&(0,t.jsx)(Q,{icon:(0,t.jsx)(o.User,{className:"size-3.5"}),label:"Taught by",value:[e.teacher,e.assistant&&`with ${e.assistant}`].filter(Boolean).join(" ")}),(0,t.jsx)(Q,{icon:(0,t.jsx)(c.Users,{className:"size-3.5"}),label:"Dancers",value:`${e.enrolled} of ${e.capacity}`})]})]})}function Q({icon:e,label:s,value:a}){return(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsxs)("dt",{className:"flex items-center gap-1.5 text-ink-3",children:[e,s]}),(0,t.jsx)("dd",{className:"mt-0.5 font-medium",children:a})]})}function U({classId:e,canAdd:s,isOffice:a}){let i=(0,x.useRows)(["class-resources",e],T.CLASS_RESOURCES,[e]),r=(i.data??[]).filter(e=>!e.scope_label),n=(i.data??[]).filter(e=>!!e.scope_label);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(k.Card,{children:[(0,t.jsx)(k.CardHeader,{title:"For this class",subtitle:0===r.length?void 0:`${r.length} item${1===r.length?"":"s"}`}),i.isPending&&(0,t.jsx)("div",{className:"space-y-3 p-4",children:[0,1].map(e=>(0,t.jsx)(k.Skeleton,{className:"h-14"},e))}),i.error&&(0,t.jsx)("div",{className:"p-4",children:(0,t.jsx)(k.ErrorState,{error:i.error,onRetry:()=>i.refetch()})}),!i.isPending&&0===r.length&&(0,t.jsx)(k.EmptyState,{icon:(0,t.jsx)(u.FolderOpen,{className:"size-5"}),title:"Nothing shared yet",body:s?"Add a routine video, the music for this term, or a handout — everyone in this class will see it.":"Your teacher has not shared anything for this class yet."}),r.length>0&&(0,t.jsx)("ul",{className:"divide-y divide-line",children:r.map(e=>(0,t.jsx)(f.ResourceRow,{r:e,canManage:a||s&&e.mine},e.id))})]}),n.length>0&&(0,t.jsxs)(k.Card,{children:[(0,t.jsx)(k.CardHeader,{title:"From the studio",subtitle:"Shared with everyone"}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:n.map(e=>(0,t.jsx)(f.ResourceRow,{r:e},e.id))})]})]})}function F({classId:e,className:a,onClose:n}){let{session:l}=(0,w.useSession)(),d=(0,r.useQueryClient)(),[o,c]=s.useState("file"),[u,_]=s.useState(null),[f,p]=s.useState(""),[y,b]=s.useState(""),[v,g]=s.useState(""),[x,S]=s.useState("video"),[E,N]=s.useState(""),[R,$]=s.useState(!0),[M,O]=s.useState(!0),[A,D]=s.useState(!1),Q=(0,i.useMutation)({mutationFn:async()=>{let t="file"===o?(0,C.kindForFile)(u):x,s="file"===o?await (0,C.probeDuration)(u):null;return(0,j.runAs)(l,async a=>{let[i]=await a(T.CREATE_RESOURCE,[e,t,f.trim(),y.trim()||null,v.trim()||null,"link"===o?E.trim():null,s,R,M]);if(!i)throw Error("You cannot add material to this class.");return"file"===o&&await C.storage.upload(u,{q:a,resourceId:i.id,studioId:i.studio_id}),await a(T.ASSIGN_RESOURCE_TO_CLASS,[e,i.id]),i.id})},onSuccess:()=>{D(!0),d.invalidateQueries({queryKey:["db"]})}}),U=!!u&&u.size>C.storage.maxBytes,z=f.trim().length>=2&&("file"===o?!!u&&!U:/^https?:\/\/\S+$/.test(E.trim()));return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center",onClick:n,children:(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-labelledby":"add-material-t",onClick:e=>e.stopPropagation(),className:"max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[var(--radius-xl)]\n                   border border-line bg-surface p-4 pb-safe shadow-lg sm:rounded-[var(--radius-xl)]",children:A?(0,t.jsxs)("div",{className:"py-4 text-center",children:[(0,t.jsx)("span",{className:"mx-auto mb-3 grid size-11 place-items-center rounded-full bg-positive-soft text-positive","aria-hidden":!0,children:(0,t.jsx)(h.Check,{className:"size-5"})}),(0,t.jsxs)("p",{id:"add-material-t",className:"font-medium",children:["Shared with ",a]}),(0,t.jsx)("p",{className:"mt-1 text-sm text-ink-2",children:"Everyone in the class will find it when they open this class from their timetable."}),(0,t.jsx)(k.Button,{className:"mt-4 w-full",variant:"primary",onClick:n,children:"Done"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:"add-material-t",className:"text-[17px] font-semibold tracking-tight",children:"Add material"}),(0,t.jsxs)("p",{className:"mt-0.5 text-[13px] text-ink-2",children:["Goes to everyone in ",a,"."]})]}),(0,t.jsx)(k.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:n,children:(0,t.jsx)(m.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsx)("div",{role:"tablist","aria-label":"Kind of material",className:"mt-3 inline-flex rounded-[var(--radius-md)] border border-line bg-surface-2 p-0.5",children:[["file","Upload a file"],["link","Add a link"]].map(([e,s])=>(0,t.jsx)("button",{role:"tab","aria-selected":o===e,onClick:()=>c(e),className:(0,I.cn)("min-h-[34px] rounded-[7px] px-3 text-[13px] font-medium",o===e?"bg-surface text-ink shadow-xs":"text-ink-2 hover:text-ink"),children:s},e))}),(0,t.jsxs)("div",{className:"mt-4 space-y-3",children:["file"===o?(0,t.jsx)(k.Field,{label:"File",htmlFor:"material-file",required:!0,error:U?`That file is ${(0,C.formatBytes)(u.size)} — the limit is ${(0,C.formatBytes)(C.storage.maxBytes)}.`:void 0,hint:`Video, music or a document. Stored in ${C.storage.label}, up to ${(0,C.formatBytes)(C.storage.maxBytes)}.`,children:(0,t.jsx)("input",{id:"material-file",type:"file",accept:"video/*,audio/*,.pdf,.doc,.docx,image/*",onChange:e=>{var t;_(t=e.target.files?.[0]??null),t&&!f.trim()&&p(t.name.replace(/\.[^.]+$/,""))},className:"block w-full text-sm text-ink-2 file:mr-3 file:h-10 file:rounded-[var(--radius-md)]\n                                    file:border file:border-line-strong file:bg-surface file:px-3.5\n                                    file:text-sm file:font-medium file:text-ink hover:file:bg-surface-2"})}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(k.Field,{label:"What kind of thing is it",htmlFor:"material-kind",children:(0,t.jsxs)(k.Select,{id:"material-kind",value:x,onChange:e=>S(e.target.value),children:[(0,t.jsx)("option",{value:"video",children:"A video"}),(0,t.jsx)("option",{value:"audio",children:"Music or a track"}),(0,t.jsx)("option",{value:"link",children:"A page or document"})]})}),(0,t.jsx)(k.Field,{label:"Link",htmlFor:"material-url",required:!0,hint:"Starts with https://",children:(0,t.jsx)(k.Input,{id:"material-url",type:"url",inputMode:"url",value:E,onChange:e=>N(e.target.value),placeholder:"https://"})})]}),(0,t.jsx)(k.Field,{label:"Title",htmlFor:"material-title",required:!0,children:(0,t.jsx)(k.Input,{id:"material-title",value:f,onChange:e=>p(e.target.value),placeholder:"Group routine — counts 1 to 32"})}),(0,t.jsx)(k.Field,{label:"Category",htmlFor:"material-category",hint:"Optional. Groups it in the library.",children:(0,t.jsx)(k.Input,{id:"material-category",value:v,onChange:e=>g(e.target.value),placeholder:"Exam music, Technique, Uniform…"})}),(0,t.jsx)(k.Field,{label:"Note",htmlFor:"material-note",hint:"Optional. What should they do with it?",children:(0,t.jsx)("textarea",{id:"material-note",rows:2,value:y,onChange:e=>b(e.target.value),placeholder:"Practise the first eight before Thursday.",className:"w-full rounded-[var(--radius-md)] border border-line-strong bg-surface p-3 text-sm\n                             focus:border-accent-line focus:outline-none focus:ring-4 focus:ring-accent-line/12"})}),(0,t.jsxs)("fieldset",{className:"rounded-[var(--radius-md)] border border-line p-3",children:[(0,t.jsx)("legend",{className:"px-1 text-[13px] font-medium text-ink-2",children:"Who can see it"}),(0,t.jsxs)("label",{className:"flex min-h-[36px] items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:R,className:"size-4 accent-[var(--accent)]",onChange:e=>$(e.target.checked)}),"Students in this class"]}),(0,t.jsxs)("label",{className:"flex min-h-[36px] items-center gap-2.5 text-sm",children:[(0,t.jsx)("input",{type:"checkbox",checked:M,className:"size-4 accent-[var(--accent)]",onChange:e=>O(e.target.checked)}),"Their parents"]}),(0,t.jsx)("p",{className:"mt-1 text-[12.5px] text-ink-3",children:"Untick both and it stays visible to staff only."})]})]}),Q.isError&&(0,t.jsx)("div",{className:"mt-3",children:(0,t.jsx)(k.ErrorState,{error:Q.error})}),(0,t.jsxs)("div",{className:"mt-4 flex gap-2",children:[(0,t.jsx)(k.Button,{className:"flex-1",onClick:n,children:"Cancel"}),(0,t.jsx)(k.Button,{className:"flex-1",variant:"primary",disabled:!z,loading:Q.isPending,onClick:()=>Q.mutate(),children:Q.isPending?"Sharing":"Share"})]}),Q.isPending&&"file"===o&&(0,t.jsxs)("p",{className:"mt-2 flex items-center justify-center gap-2 text-[12.5px] text-ink-3",children:[(0,t.jsx)(k.Spinner,{className:"size-3"})," Storing the file…"]})]})})})}e.s(["default",0,function(){return(0,t.jsx)(s.Suspense,{fallback:(0,t.jsx)("div",{className:"min-h-dvh"}),children:(0,t.jsx)(A,{})})}],6851)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(25757);function i(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,s,a]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function d(e,t){let[s,a]=[l(e),l(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function o([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),i=Math.min(e,t,s),r=(a+i)/2;if(a===i)return[0,0,r];let n=a-i;return[(a===e?(t-s)/n+6*(t<s):a===t?(s-e)/n+2:(e-t)/n+4)/6,r>.5?n/(2-a-i):n/(a+i),r]}function c([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,i=2*s-a,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?i+(a-i)*6*e:e<.5?a:e<2/3?i+(a-i)*(2/3-e)*6:i;return n([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var s;let a,m,h=i(e)??"#0b3b34",_=.18>l(i(t)??"#ffffff"),f=4.5>d(h,"#ffffff"),[p,y,b]=o(r(h)),v=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),g=(s=_?.82:.9,a=r(h),m=r(t),n([0,1,2].map(e=>a[e]*(1-s)+m[e]*s))),x=(e,t,s)=>_?function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n<1;)l=c([a,i,n=Math.min(1,n+.01)]);return l}(e,t,s):function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n>0;)l=c([a,i,n=Math.max(0,n-.01)]);return l}(e,t,s),j=x(h,g,4.5),w=x(h,t,4.5),k=x(h,t,3);return{accent:h,onAccent:f?"#000000":"#ffffff",hover:v,soft:g,ink:j,text:w,line:k,darkText:f,textDeepened:w!==h}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),h=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,h,"normaliseHex",0,i,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Elegant and calm — ivory, serif headings, soft edges",surface:"#fffdf8",canvas:"#f6f2ea",ink:"#14211e",dark:!1,accent:"#0b3b34",secondary:"#c86a4f",presets:[{name:"Sanaa",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Terracotta",accent:"#c86a4f",secondary:"#0b3b34"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and electric — dark mode, wide type, neon accents",surface:"#18122f",canvas:"#0d0a1c",ink:"#f6f4ff",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>_["urban"===e?"urban":"classic"];function p(e,t,s){let a=f(e);return{theme:a,accent:i(t)??a.accent,secondary:i(s)??a.secondary}}e.s(["THEMES",0,_,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(a.SanaaLogo,{className:"sanaa-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Sanaa"}),(0,t.jsx)(a.SanaaLogo,{className:"sanaa-on-dark h-[0.95em] translate-y-[0.06em]",tone:"ivory",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:a}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),a&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:a})]}):null},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:h(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,i=e?.brand_secondary??null,r=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!r){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,a,i);e.dataset.theme=n.theme.id,Object.entries(m(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),l.parentNode||document.head.appendChild(l)},[r,t,a,i])}],33405)},15790,3053,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),r=e.i(17697),n=e.i(75254);let l=(0,n.default)("music-2",[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]]);var d=e.i(78583);let o=(0,n.default)("link-2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]),c=(0,n.default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var u=e.i(40160),m=e.i(27612),h=e.i(17658),_=e.i(30224),f=e.i(31502),p=e.i(27389);let y={label:"this browser",maxBytes:0x1400000,async upload(e,{q:t,resourceId:s,studioId:a}){if(e.size>0x1400000)throw Error(`That file is ${b(e.size)}. The demo stores files in the browser, so it caps them at ${b(0x1400000)}.`);let i=new Uint8Array(await e.arrayBuffer()),r=e.type||g(e.name),[n]=await t(`insert into resource_file (studio_id, resource_id, file_name, mime_type, size_bytes, bytes, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, auth.uid())
       on conflict (resource_id) do update
         set file_name = excluded.file_name, mime_type = excluded.mime_type,
             size_bytes = excluded.size_bytes, bytes = excluded.bytes, updated_at = now()
       returning id`,[a,s,e.name,r,e.size,i]);if(!n)throw Error("The database refused the upload.");let l=`local:${n.id}`;return await t("update resource set storage_path = $2, url = null where id = $1",[s,l]),{path:l,size:e.size,mime:r,name:e.name}},async resolve(e,t){let s=e.startsWith("local:")?e.slice(6):null;if(!s)return null;let a=(await (0,_.runAs)(t,e=>e("select bytes, mime_type from resource_file where id = $1 and deleted_at is null",[s])))[0];return a?URL.createObjectURL(new Blob([function(e){if(e instanceof Uint8Array||e instanceof ArrayBuffer)return new Uint8Array(e);if("string"==typeof e){let t=e.startsWith("\\x")?e.slice(2):e,s=new Uint8Array(t.length/2);for(let e=0;e<s.length;e++)s[e]=parseInt(t.substr(2*e,2),16);return s}throw Error("Unrecognised binary value from the database")}(a.bytes)],{type:a.mime_type})):null},release(e){e.startsWith("blob:")&&URL.revokeObjectURL(e)}};function b(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(+(e<0xa00000))} MB`}let v={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",m4v:"video/x-m4v",mp3:"audio/mpeg",m4a:"audio/mp4",wav:"audio/wav",aac:"audio/aac",pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};function g(e){return v[e.split(".").pop()?.toLowerCase()??""]??"application/octet-stream"}function x(e){let t=e.type||g(e.name);return t.startsWith("video/")?"video":t.startsWith("audio/")?"audio":"document"}e.s(["formatBytes",0,b,"kindForFile",0,x,"probeDuration",0,function(e){return new Promise(t=>{let s=x(e);if("document"===s)return t(null);let a=URL.createObjectURL(e),i=document.createElement("video"===s?"video":"audio"),r=e=>{URL.revokeObjectURL(a),t(e)};i.preload="metadata",i.onloadedmetadata=()=>{let e=Number.isFinite(i.duration)?Math.round(i.duration):0;r(e>0?e:null)},i.onerror=()=>r(null),setTimeout(()=>r(null),5e3),i.src=a})},"storage",0,y],3053);var j=e.i(45060);let w={video:r.PlayCircle,audio:l,document:d.FileText,link:o},k={video:"Video",audio:"Track",document:"Document",link:"Link"};e.s(["ResourceRow",0,function({r:e,canManage:r}){let{session:n}=(0,f.useSession)(),l=(0,i.useQueryClient)(),o=w[e.kind]??d.FileText,v=(e=>{if(!e)return null;let t=Math.floor(e/60);return t>=60?`${Math.floor(t/60)}h ${t%60}m`:`${t}:${String(e%60).padStart(2,"0")}`})(e.duration_sec),g=!!e.storage_path,[x,S]=s.useState(null),[E,N]=s.useState(!1),[R,$]=s.useState(null);s.useEffect(()=>()=>{x&&y.release(x)},[x]);let T=async()=>{if(e.storage_path&&!x){N(!0),$(null);try{let t=await y.resolve(e.storage_path,n);if(!t)throw Error("That file is no longer available.");S(t)}catch(e){$(e instanceof Error?e.message:"Could not open that file.")}finally{N(!1)}}},C=(0,a.useMutation)({mutationFn:async()=>(0,_.runAs)(n,t=>t(p.DELETE_RESOURCE,[e.id])),onSuccess:()=>l.invalidateQueries({queryKey:["db"]})});return(0,t.jsxs)("li",{className:"px-4 py-3.5",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,j.cn)("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]","video"===e.kind?"bg-violet-soft text-violet":"audio"===e.kind?"bg-amber-soft text-amber":"bg-surface-2 text-ink-2"),children:(0,t.jsx)(o,{className:"size-5"})}),(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("p",{className:"font-medium",children:e.title}),e.description&&(0,t.jsx)("p",{className:"mt-0.5 text-[13px] leading-relaxed text-ink-2",children:e.description}),(0,t.jsxs)("p",{className:"mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-ink-3",children:[(0,t.jsx)("span",{children:k[e.kind]??e.kind}),e.category&&(0,t.jsx)("span",{children:e.category}),e.scope_label&&(0,t.jsx)("span",{children:e.scope_label}),v&&(0,t.jsx)("span",{className:"tnum",children:v}),null!=e.size_bytes&&(0,t.jsx)("span",{className:"tnum",children:b(e.size_bytes)}),e.added_by&&(0,t.jsxs)("span",{children:["added by ",e.added_by]})]})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-1",children:[g&&!x&&(0,t.jsx)(h.Button,{size:"sm",onClick:T,loading:E,children:"video"===e.kind||"audio"===e.kind?"Play":"Open"}),!g&&e.url&&(0,t.jsxs)(h.Button,{size:"sm",onClick:()=>window.open(e.url,"_blank","noopener,noreferrer"),children:[(0,t.jsx)(c,{className:"size-3.5","aria-hidden":!0})," Open"]}),r&&(0,t.jsx)(h.Button,{size:"sm",variant:"ghost","aria-label":`Remove ${e.title}`,loading:C.isPending,onClick:()=>C.mutate(),children:(0,t.jsx)(m.Trash2,{className:"size-4","aria-hidden":!0})})]})]}),R&&(0,t.jsx)("p",{role:"alert",className:"mt-2 text-[12.5px] text-critical",children:R}),C.isError&&(0,t.jsx)("div",{className:"mt-2",children:(0,t.jsx)(h.ErrorState,{error:C.error})}),x&&(0,t.jsxs)("div",{className:"mt-3",children:["video"===e.kind&&(0,t.jsx)("video",{src:x,controls:!0,playsInline:!0,preload:"metadata",className:"w-full rounded-[var(--radius-md)] bg-ink"}),"audio"===e.kind&&(0,t.jsx)("audio",{src:x,controls:!0,className:"w-full"}),"video"!==e.kind&&"audio"!==e.kind&&(0,t.jsxs)("a",{href:x,download:e.file_name??e.title,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-sm font-medium text-accent-ink hover:underline",children:[(0,t.jsx)(u.Download,{className:"size-4","aria-hidden":!0}),e.file_name??"Download"]})]})]})}],15790)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),i=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,i=a.getFullYear()-t.getFullYear(),r=a.getMonth()-t.getMonth();return(r<0||0===r&&a.getDate()<t.getDate())&&(i-=1),i},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,i,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let a=s(e),i=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),r=e=>i.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),r=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?a(t):i(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),a=e.i(31502);function i(e,r,n=[],l){let{session:d}=(0,a.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,s.readAs)(d,r,n),staleTime:15e3,...l})}e.s(["useRow",0,function(e,t,s=[]){let a=i(e,t,s);return{...a,data:a.data?.[0]}},"useRows",0,i])},27389,e=>{"use strict";let t=`
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
returning id, status`,r=`
select r.id, r.kind, r.status, r.subject, r.body, r.answer, r.created_at, r.answered_at,
       s.first_name as student_name, f.name as family_name
  from studio_request r
  left join student s on s.id = r.student_id
  left join family f on f.id = r.family_id
 where r.deleted_at is null
 order by r.created_at desc`,n=`
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
select app.retire_resource($1) as ok`,b=`
select c.id, c.name, ds.name as style, ds.colour,
       (select count(*)::int from resource_assignment a
         where a.class_id = c.id and a.deleted_at is null) as resources
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
 where c.deleted_at is null and c.id in (select app.teacher_class_ids())
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,_,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,i,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])},33204,e=>{"use strict";let t=`
select f.id as family_id, f.name as family_name,
       (select g.full_name from guardian g where g.family_id = f.id and g.deleted_at is null
         order by g.is_primary desc limit 1) as guardian,
       last.body as last_body, last.subject as last_subject, last.sent_at as last_at,
       last.inbound as last_inbound,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null and c.inbound and c.request_id is null and not exists (
            select 1 from communication_read r where r.communication_id = c.id and r.user_id = auth.uid())) as unread,
       (select count(*)::int from communication c where c.family_id = f.id and c.kind = 'direct'
          and c.deleted_at is null) as messages
  from family f
  join lateral (select body, subject, sent_at, inbound from communication c
                 where c.family_id = f.id and c.kind = 'direct' and c.deleted_at is null
                 order by c.sent_at desc limit 1) last on true
 where f.deleted_at is null
 order by last.sent_at desc`,s=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,a=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,i=`
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`,r=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,n=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,l=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,d=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,o=`
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`,c=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`,u=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,h=`
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,_=`
insert into communication (studio_id, kind, channel, subject, body, sent_at)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2), $3::timestamptz from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,f=`
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`,p=`
insert into communication (studio_id, kind, channel, family_id, subject, body, reply_to)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2), $3::uuid
  from guardian where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id)
 limit 1 returning id`,y=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,b=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,v=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,g=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,x=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,i,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,l,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,a,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,x,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,g,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,o,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,_,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])},94512,e=>{"use strict";let t=`
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
  union all
  -- Drop-ins (migration 0033) are marked like anyone in the class.
  select s.id, s.first_name, s.last_name, s.preferred_name, s.date_of_birth, false
    from drop_in_booking d
    join student s on s.id = d.student_id
   where d.session_id = $1 and d.status = 'booked'
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
returning id`,m=`
with me as (select id from staff_member where user_id = auth.uid() and deleted_at is null),
     this as (select starts_at from class_session where id = $1)
select cs.id, c.name, cs.starts_at from class_session cs join class c on c.id = cs.class_id
 where cs.deleted_at is null and cs.status <> 'cancelled' and cs.starts_at > (select starts_at from this)
   and cs.starts_at < date_trunc('day', (select starts_at from this)) + interval '1 day'
   and (c.teacher_id in (select id from me) or c.assistant_id in (select id from me) or cs.teacher_id in (select id from me))
 order by cs.starts_at limit 1`;e.s(["CLASS_NOTICES",0,o,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,u,"MARK_ATTENDANCE",0,i,"MY_SESSIONS",0,t,"MY_STUDENTS",0,r,"NEXT_SESSION",0,m,"POST_NOTICE",0,c,"REGISTER",0,a,"REOPEN_REGISTER",0,d,"REQUEST_COVER",0,"select app.request_cover($1, $2) as id","SAVE_SESSION_NOTES",0,n,"SET_REASON",0,l,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])}]);