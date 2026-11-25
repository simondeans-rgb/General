(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let r=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#r;#n;#l;#d;#o;#c;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let i=this.#g();a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#m)&&this.#w(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#r=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},r=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),r])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#v(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#f(){this.#v(),this.#w(this.#g())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,r=this.#a,l=this.#i,d=this.#r,o=e!==a?e.state:this.#s,{state:c}=e,u={...c},h=!1;if(t._optimisticResults){let s=this.hasListeners(),r=!s&&_(e,t),n=s&&p(e,a,t,i);(r||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:v}=u;s=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===v){let e;r?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=r.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(v="success",s=(0,n.replaceData)(r?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!g)if(r&&s===l?.data&&t.select===this.#l)s=this.#d;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(r?.data,s,t),this.#d=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(f=this.#n,s=this.#d,b=Date.now(),v="error",h=!1);let w="fetching"===u.fetchStatus,E="pending"===v,R="error"===v,S=E&&w,j=void 0!==s;return{status:v,fetchStatus:u.fetchStatus,isPending:E,isSuccess:"success"===v,isError:R,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:w,isRefetching:w&&!E,isLoadingError:R&&!j,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:R&&j,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#r=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let a=new Set(s??this.#h);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#E({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#E(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=a.useContext(i),u=a.useContext(r),m=(0,s.useQueryClient)(d),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),f=!1!==e.subscribed;if(h._optimisticResults=c?"isRestoring":f?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}o=_?.state.error&&"function"==typeof h.throwOnError?(0,n.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||o)&&!u.isReset()&&(h.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(m,h)),y=p.getOptimisticResult(h),b=!c&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(h)},[h,p]),h?.suspense&&y.isPending)throw p.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:p.trackResult(y)}(e,h,t)}],66027)},17068,e=>{"use strict";let t=(0,e.i(75254).default)("calendar-x-2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]]);e.s(["CalendarX2",0,t],17068)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},32095,e=>{"use strict";let t=(0,e.i(75254).default)("graduation-cap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);e.s(["GraduationCap",0,t],32095)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},46897,e=>{"use strict";let t=(0,e.i(75254).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],46897)},50627,e=>{"use strict";let t=(0,e.i(75254).default)("receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);e.s(["Receipt",0,t],50627)},83086,e=>{"use strict";let t=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],83086)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],84614)},61911,e=>{"use strict";let t=(0,e.i(75254).default)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);e.s(["Users",0,t],61911)},18566,(e,t,s)=>{t.exports=e.r(76562)},52112,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(22016),i=e.i(17068),r=e.i(63059),n=e.i(46897),l=e.i(84614),d=e.i(77326),o=e.i(13927),c=e.i(17658),u=e.i(27389),m=e.i(75379),h=e.i(45060);let _={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};e.s(["default",0,function(){let[e]=s.useMemo(()=>(0,m.dayRange)(0),[]),f=s.useMemo(()=>{let t=new Date(e);return t.setDate(t.getDate()+28),t.toISOString()},[e]),p=(0,o.useRows)(["student-timetable",e],u.MY_TIMETABLE,[e,f]),y=s.useMemo(()=>{let e=new Map;return(p.data??[]).forEach(t=>{let s=(0,m.isoDate)(t.starts_at);e.set(s,[...e.get(s)??[],t])}),[...e.entries()].sort()},[p.data]);return(0,t.jsx)(d.Shell,{title:"Timetable",subtitle:"Your classes and anything you're down for",allow:["student"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-lg space-y-4",children:[p.isLoading&&(0,t.jsx)(c.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(c.Skeleton,{className:"h-14"},e))}),p.error&&(0,t.jsx)(c.ErrorState,{error:p.error,onRetry:()=>p.refetch()}),0===y.length&&!p.isLoading&&(0,t.jsx)(c.Card,{children:(0,t.jsx)(c.EmptyState,{icon:(0,t.jsx)(i.CalendarX2,{className:"size-5"}),title:"Nothing scheduled",body:"Your classes will show here once you're enrolled."})}),y.map(([e,s])=>(0,t.jsxs)(c.Card,{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-2 border-b border-line px-4 py-2.5",children:[(0,t.jsx)("h2",{className:"font-semibold",children:(0,m.relativeDay)(s[0].starts_at)}),(0,t.jsx)("span",{className:"text-[13px] text-ink-3",children:(0,m.dateLong)(s[0].starts_at)})]}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:s.map((e,s)=>{let i="cancelled"===e.status,d="event"===e.entry_kind,o=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:(0,h.cn)("tnum w-14 shrink-0 font-semibold",i&&"line-through"),children:(0,m.time)(e.starts_at)}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("span",{className:(0,h.cn)("font-medium",i&&"line-through"),children:e.name}),d?(0,t.jsx)(c.Badge,{tone:"indigo",children:"Event"}):e.style&&(0,t.jsx)(c.Badge,{tone:_[e.colour]??"neutral",children:e.style}),i&&(0,t.jsx)(c.Badge,{tone:"critical",children:"Cancelled"})]}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-2",children:[e.teacher&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(l.User,{className:"size-3.5","aria-hidden":!0}),e.teacher]}),(e.room||e.location)&&(0,t.jsxs)("span",{className:"inline-flex items-center gap-1",children:[(0,t.jsx)(n.MapPin,{className:"size-3.5","aria-hidden":!0}),[e.location,e.room].filter(Boolean).join(" · ")]})]})]}),e.class_id&&(0,t.jsx)(r.ChevronRight,{className:"size-4 shrink-0 self-center text-ink-3","aria-hidden":!0})]}),u="flex items-start gap-3 px-4 py-3";return(0,t.jsx)("li",{className:(0,h.cn)(i&&"opacity-60"),children:e.class_id?(0,t.jsx)(a.default,{href:`/class/?id=${e.class_id}`,className:(0,h.cn)(u,"hover:bg-surface-2"),"aria-label":`${e.name}, open class`,children:o}):(0,t.jsx)("div",{className:u,children:o})},`${e.id}-${s}`)})})]},e))]})})}])},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(25757);function i(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,s,a]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function d(e,t){let[s,a]=[l(e),l(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function o([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),i=Math.min(e,t,s),r=(a+i)/2;if(a===i)return[0,0,r];let n=a-i;return[(a===e?(t-s)/n+6*(t<s):a===t?(s-e)/n+2:(e-t)/n+4)/6,r>.5?n/(2-a-i):n/(a+i),r]}function c([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,i=2*s-a,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?i+(a-i)*6*e:e<.5?a:e<2/3?i+(a-i)*(2/3-e)*6:i;return n([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var s;let a,m,h=i(e)??"#0b3b34",_=.18>l(i(t)??"#ffffff"),f=4.5>d(h,"#ffffff"),[p,y,b]=o(r(h)),v=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),g=(s=_?.82:.9,a=r(h),m=r(t),n([0,1,2].map(e=>a[e]*(1-s)+m[e]*s))),w=(e,t,s)=>_?function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n<1;)l=c([a,i,n=Math.min(1,n+.01)]);return l}(e,t,s):function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n>0;)l=c([a,i,n=Math.max(0,n-.01)]);return l}(e,t,s),E=w(h,g,4.5),R=w(h,t,4.5),S=w(h,t,3);return{accent:h,onAccent:f?"#000000":"#ffffff",hover:v,soft:g,ink:E,text:R,line:S,darkText:f,textDeepened:R!==h}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),h=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,h,"normaliseHex",0,i,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Elegant and calm — ivory, serif headings, soft edges",surface:"#fffdf8",canvas:"#f6f2ea",ink:"#14211e",dark:!1,accent:"#0b3b34",secondary:"#c86a4f",presets:[{name:"Sanaa",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Terracotta",accent:"#c86a4f",secondary:"#0b3b34"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and electric — dark mode, wide type, neon accents",surface:"#18122f",canvas:"#0d0a1c",ink:"#f6f4ff",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>_["urban"===e?"urban":"classic"];function p(e,t,s){let a=f(e);return{theme:a,accent:i(t)??a.accent,secondary:i(s)??a.secondary}}e.s(["THEMES",0,_,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(a.SanaaLogo,{className:"sanaa-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Sanaa"}),(0,t.jsx)(a.SanaaLogo,{className:"sanaa-on-dark h-[0.95em] translate-y-[0.06em]",tone:"ivory",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:a}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),a&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:a})]}):null},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:h(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,i=e?.brand_secondary??null,r=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!r){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,a,i);e.dataset.theme=n.theme.id,Object.entries(m(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),l.parentNode||document.head.appendChild(l)},[r,t,a,i])}],33405)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),i=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,i=a.getFullYear()-t.getFullYear(),r=a.getMonth()-t.getMonth();return(r<0||0===r&&a.getDate()<t.getDate())&&(i-=1),i},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,i,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let a=s(e),i=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),r=e=>i.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),r=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?a(t):i(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),a=e.i(31502);function i(e,r,n=[],l){let{session:d}=(0,a.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,s.readAs)(d,r,n),staleTime:15e3,...l})}e.s(["useRow",0,function(e,t,s=[]){let a=i(e,t,s);return{...a,data:a.data?.[0]}},"useRows",0,i])},27389,e=>{"use strict";let t=`
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
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,w=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,i,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,l,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,a,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,g,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,o,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,_,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])}]);