(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let r=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),l=e.i(40143),d=e.i(80166),o=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#r;#n;#l;#d;#o;#c;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#p())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return p(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return p(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#f(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&f(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#x();let i=this.#g();a&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#m)&&this.#v(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#r=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},r=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),r])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#x(){this.#f();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#p(){this.#x(),this.#v(this.#g())}#f(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,r=this.#a,l=this.#i,d=this.#r,o=e!==a?e.state:this.#s,{state:c}=e,u={...c},h=!1;if(t._optimisticResults){let s=this.hasListeners(),r=!s&&_(e,t),n=s&&f(e,a,t,i);(r||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:p,errorUpdatedAt:b,status:x}=u;s=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===x){let e;r?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=r.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(x="success",s=(0,n.replaceData)(r?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!g)if(r&&s===l?.data&&t.select===this.#l)s=this.#d;else try{this.#l=t.select,s=t.select(s),s=(0,n.replaceData)(r?.data,s,t),this.#d=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(p=this.#n,s=this.#d,b=Date.now(),x="error",h=!1);let v="fetching"===u.fetchStatus,w="pending"===x,k="error"===x,j=w&&v,E=void 0!==s;return{status:x,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===x,isError:k,isInitialLoading:j,isLoading:j,data:s,dataUpdatedAt:u.dataUpdatedAt,error:p,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:v,isRefetching:v&&!w,isLoadingError:k&&!E,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:k&&E,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#r=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let a=new Set(s??this.#h);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#w({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#p()}#w(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&p(e,t,t.refetchOnMount)}function p(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function f(e,t,s,a){return(e!==t||!1===(0,n.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let o,c=a.useContext(i),u=a.useContext(r),m=(0,s.useQueryClient)(d),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),p=!1!==e.subscribed;if(h._optimisticResults=c?"isRestoring":p?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}o=_?.state.error&&"function"==typeof h.throwOnError?(0,n.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||o)&&!u.isReset()&&(h.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[f]=a.useState(()=>new t(m,h)),y=f.getOptimisticResult(h),b=!c&&p;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?f.subscribe(l.notifyManager.batchCalls(e)):n.noop;return f.updateResult(),t},[f,b]),()=>f.getCurrentResult(),()=>f.getCurrentResult()),a.useEffect(()=>{f.setOptions(h)},[h,f]),h?.suspense&&y.isPending)throw f.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:f.trackResult(y)}(e,h,t)}],66027)},42009,e=>{"use strict";let t=(0,e.i(75254).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);e.s(["Award",0,t],42009)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},64659,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],64659)},95468,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",0,t],95468)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},83086,e=>{"use strict";let t=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],83086)},25652,e=>{"use strict";let t=(0,e.i(75254).default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",0,t],25652)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(87338);function i(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,s,a]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function d(e,t){let[s,a]=[l(e),l(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function o([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),i=Math.min(e,t,s),r=(a+i)/2;if(a===i)return[0,0,r];let n=a-i;return[(a===e?(t-s)/n+6*(t<s):a===t?(s-e)/n+2:(e-t)/n+4)/6,r>.5?n/(2-a-i):n/(a+i),r]}function c([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,i=2*s-a,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?i+(a-i)*6*e:e<.5?a:e<2/3?i+(a-i)*(2/3-e)*6:i;return n([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var s;let a,m,h=i(e)??"#2638f0",_=.18>l(i(t)??"#ffffff"),p=4.5>d(h,"#ffffff"),[f,y,b]=o(r(h)),x=c([f,y,p?Math.min(1,b+.08):Math.max(0,b-.07)]),g=(s=_?.82:.9,a=r(h),m=r(t),n([0,1,2].map(e=>a[e]*(1-s)+m[e]*s))),v=(e,t,s)=>_?function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n<1;)l=c([a,i,n=Math.min(1,n+.01)]);return l}(e,t,s):function(e,t,s){let[a,i,n]=o(r(e)),l=e;for(;d(l,t)<s&&n>0;)l=c([a,i,n=Math.max(0,n-.01)]);return l}(e,t,s),w=v(h,g,4.5),k=v(h,t,4.5),j=v(h,t,3);return{accent:h,onAccent:p?"#000000":"#ffffff",hover:x,soft:g,ink:w,text:k,line:j,darkText:p,textDeepened:k!==h}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),h=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,h,"normaliseHex",0,i,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},p=e=>_["urban"===e?"urban":"classic"];function f(e,t,s){let a=p(e);return{theme:a,accent:i(t)??a.accent,secondary:i(s)??a.secondary}}e.s(["THEMES",0,_,"schoolColours",0,f,"themeOf",0,p],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:a}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),a&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:a})]}):null},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:h(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,i=e?.brand_secondary??null,r=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!r){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=f(t,a,i);e.dataset.theme=n.theme.id,Object.entries(m(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),l.parentNode||document.head.appendChild(l)},[r,t,a,i])}],33405)},84524,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(54616),i=e.i(12598),r=e.i(42009),n=e.i(95468),l=e.i(64659),d=e.i(78583),o=e.i(75254);let c=(0,o.default)("flag",[["path",{d:"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",key:"1jaruq"}]]),u=(0,o.default)("message-square-heart",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5",key:"1faxuh"}]]);var m=e.i(17697),h=e.i(83086),_=e.i(25652),p=e.i(17658),f=e.i(13927),y=e.i(30224),b=e.i(31502),x=e.i(36261),g=e.i(75379),v=e.i(45060);let w=e=>x.LEVELS.find(t=>t.key===e)?.label??"Not yet assessed";function k(){let{session:e}=(0,b.useSession)(),t=(0,i.useQueryClient)();return(0,a.useMutation)({mutationFn:t=>(0,y.runAs)(e,e=>e(t.sql,t.params)),onSuccess:()=>t.invalidateQueries({queryKey:["db"]})})}let j={not_started:0,developing:3,secure:6,mastered:8};function E({groups:e,demos:s,headingLevel:a}){let i=3===a?"h3":"h4",r=e.reduce((e,[,t])=>e+t.filter(e=>e.level&&"not_started"!==e.level).length,0),n=e.reduce((e,[,t])=>e+t.length,0);return(0,t.jsxs)("div",{className:"space-y-6 pt-2",children:[0===r&&(0,t.jsx)("p",{className:"text-[14.5px] text-ink-2",children:"No skills marked yet. As the teacher assesses each one it shows here as a count of eight: developing, secure, then mastered."}),e.map(([e,a])=>{let r=a.filter(e=>e.level&&"not_started"!==e.level),n=a.filter(e=>!e.level||"not_started"===e.level);return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-baseline gap-3 border-b border-line pb-1.5",children:[(0,t.jsx)(i,{className:"min-w-0 flex-1 font-semibold",children:e.replace(/ skills$/i,"")}),(0,t.jsxs)("span",{className:"text-[13px] text-ink-3 tnum",children:[r.length," of ",a.length," assessed"]})]}),r.length>0&&(0,t.jsx)("ul",{className:"divide-y divide-line",children:r.map(e=>{let a=e.previous&&e.previous!==e.level&&"not_started"!==e.previous;return(0,t.jsxs)("li",{className:"flex min-h-[52px] items-center gap-3 py-2.5",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsx)("span",{className:"block font-medium leading-snug",children:e.skill}),(0,t.jsxs)("span",{className:"block text-[13px] text-ink-3",children:[(0,t.jsx)("span",{className:"font-semibold text-ink-2",children:w(e.level)}),a&&(0,t.jsxs)("span",{className:"text-positive",children:[" · up from ",w(e.previous).toLowerCase()]}),s.get(e.skill_id)&&(0,t.jsxs)(t.Fragment,{children:[" · ",(0,t.jsx)("a",{href:s.get(e.skill_id),target:"_blank",rel:"noreferrer",className:"font-semibold text-accent-text underline",children:"Watch"})]})]})]}),(0,t.jsx)(p.Beats,{value:j[e.level],max:8,label:`${e.skill}: ${w(e.level)}`,tone:"mastered"===e.level?"accent":"ink"})]},e.skill_id)})}),n.length>0&&(0,t.jsxs)("details",{className:"group py-2.5",children:[(0,t.jsxs)("summary",{className:"flex min-h-[44px] cursor-pointer list-none items-center gap-3 text-[14px] text-ink-2 [&::-webkit-details-marker]:hidden",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"font-medium text-ink",children:["Not yet · ",n.length," skill",1===n.length?"":"s"]}),(0,t.jsx)("span",{className:"block truncate text-[13px] text-ink-3",children:n.map(e=>e.skill).join(", ")})]}),(0,t.jsx)(p.Beats,{value:0,max:8,label:"Not yet assessed"}),(0,t.jsx)(l.ChevronDown,{className:"size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180","aria-hidden":!0})]}),(0,t.jsx)("ul",{className:"mt-1 grid gap-x-6 gap-y-1 pl-0 text-[14px] text-ink-2 sm:grid-cols-2",children:n.map(e=>(0,t.jsxs)("li",{className:"flex items-baseline gap-2",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1",children:e.skill}),s.get(e.skill_id)&&(0,t.jsx)("a",{href:s.get(e.skill_id),target:"_blank",rel:"noreferrer",className:"text-[13px] font-semibold text-accent-text underline",children:"Watch"})]},e.skill_id))})]})]},e)}),r>0&&r<n&&(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"“Not yet” means the teacher hasn’t assessed it — not that it’s gone badly."})]})}let S={skill:_.TrendingUp,feedback:u,milestone:r.Award,goal:c,report:d.FileText};e.s(["Goals",0,function({studentId:e,mode:a}){let i=(0,f.useRows)(["goals",e],x.GOALS,[e]),r=k(),[l,d]=s.useState(""),o=(i.data??[]).filter(e=>"proposed"===e.status||"agreed"===e.status),u=(i.data??[]).filter(e=>"achieved"===e.status);return(0,t.jsxs)("div",{className:"space-y-2",children:[null!=r.error&&(0,t.jsx)(p.ErrorState,{error:r.error}),0===o.length&&0===u.length&&(0,t.jsxs)("p",{className:"py-2 text-[14px] text-ink-3",children:["No goals this term","student"===a?" yet. Pick one thing to get better at.":"."]}),(0,t.jsxs)("ul",{className:(0,v.cn)("teacher"===a?"space-y-1.5":"divide-y divide-line"),children:[o.map(e=>(0,t.jsxs)("li",{className:(0,v.cn)("flex flex-wrap items-center gap-2","teacher"===a?"text-sm":"min-h-[44px] py-2.5"),children:["teacher"===a&&(0,t.jsx)(c,{className:"size-3.5 text-accent-text","aria-hidden":!0}),(0,t.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"proposed"===e.status&&("teacher"===a?(0,t.jsx)(p.Badge,{tone:"caution",children:"Waiting for your teacher"}):(0,t.jsx)("span",{className:"text-[13px] font-semibold text-caution",children:"student"===a?"Waiting for your teacher":"Waiting for the teacher"})),"agreed"===e.status&&"teacher"!==a&&(0,t.jsx)("span",{className:"text-[13px] font-semibold text-ink-2",children:"Agreed"}),"teacher"===a&&"proposed"===e.status&&(0,t.jsx)(p.Button,{size:"sm",onClick:()=>r.mutate({sql:x.SET_GOAL,params:[e.id,"agreed",null]}),children:"Agree"}),"teacher"===a&&"agreed"===e.status&&(0,t.jsxs)(p.Button,{size:"sm",variant:"primary",onClick:()=>r.mutate({sql:x.SET_GOAL,params:[e.id,"achieved",null]}),children:[(0,t.jsx)(n.CheckCircle2,{className:"size-4","aria-hidden":!0})," Achieved"]}),"teacher"===a&&(0,t.jsx)(p.Button,{size:"sm",variant:"ghost",onClick:()=>r.mutate({sql:x.SET_GOAL,params:[e.id,"dropped",null]}),children:"Drop"})]},e.id)),u.slice(0,3).map(e=>(0,t.jsxs)("li",{className:(0,v.cn)("flex items-center gap-2 text-ink-2","teacher"===a?"text-sm":"min-h-[44px] py-2.5"),children:["teacher"===a?(0,t.jsx)(n.CheckCircle2,{className:"size-3.5 text-positive","aria-hidden":!0}):null,(0,t.jsx)("span",{className:"min-w-0 flex-1",children:e.text}),"teacher"!==a&&(0,t.jsx)("span",{className:"text-[13px] font-semibold text-positive",children:"Achieved"})]},e.id))]}),"family"!==a&&o.length<2&&(0,t.jsxs)("form",{className:"flex gap-2 pt-2",onSubmit:t=>{t.preventDefault(),l.trim().length>=3&&(r.mutate({sql:x.PROPOSE_GOAL,params:[e,l,"teacher"===a?"agreed":"proposed"]}),d(""))},children:[(0,t.jsx)(p.Input,{"aria-label":"A goal for this term",value:l,onChange:e=>d(e.target.value),maxLength:200,placeholder:"student"===a?"Something you want to get better at":"A goal for this term"}),(0,t.jsx)(p.Button,{type:"submit",disabled:l.trim().length<3,children:"Add"})]})]})},"Milestones",0,function({studentId:e,celebrate:s}){let a=(0,f.useRows)(["milestones",e],x.MILESTONES,[e]);if(!a.data?.length)return null;let i=a.data.length;return s?(0,t.jsxs)("div",{children:[(0,t.jsxs)("p",{className:"flex items-baseline gap-3",children:[(0,t.jsx)("span",{className:"display-xl text-[56px] leading-none",children:i}),(0,t.jsxs)("span",{className:"text-[15px] font-semibold leading-snug",children:["milestone",1===i?"":"s"," reached.",(0,t.jsx)("span",{className:"block font-normal text-ink-3",children:i>=8?"That’s a full count. Keep moving.":`${8-i} more to a full count.`})]})]}),(0,t.jsx)(p.Beats,{value:Math.min(i,8),max:8,size:"lg",label:`${i} milestone${1===i?"":"s"}`,className:"mt-3"}),(0,t.jsx)("ul",{className:"mt-3 divide-y divide-line","aria-label":"Milestones",children:a.data.map(e=>(0,t.jsxs)("li",{className:"flex items-baseline gap-3 py-2.5",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1 font-medium",children:e.title}),(0,t.jsx)("span",{className:"shrink-0 text-[13px] text-ink-3 tnum",children:(0,g.dateShort)(e.reached_on)})]},e.id))})]}):(0,t.jsx)("ul",{className:"flex flex-wrap gap-2","aria-label":"Milestones",children:a.data.map(e=>(0,t.jsxs)("li",{className:"inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent-ink",children:[(0,t.jsx)(r.Award,{className:"size-3.5","aria-hidden":!0})," ",e.title," ",(0,t.jsx)("span",{className:"text-[11.5px] opacity-70",children:(0,g.dateShort)(e.reached_on)})]},e.id))})},"Reflections",0,function({studentId:e}){let s=(0,f.useRows)(["reflections",e],x.REFLECTIONS,[e]);return s.data?.length?(0,t.jsx)("ul",{className:"space-y-1.5",children:s.data.map(e=>(0,t.jsxs)("li",{className:"flex gap-2 text-sm",children:[(0,t.jsx)("span",{"aria-label":`Mood ${e.mood} of 5`,className:"text-base leading-5",children:x.MOODS[e.mood-1]}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[e.text??(0,t.jsx)("span",{className:"text-ink-3",children:"No words"}),(0,t.jsxs)("span",{className:"block text-[12px] text-ink-3",children:[e.class_name??""," · ",(0,g.relativeDay)(e.created_at)]})]})]},e.id))}):(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"No reflections."})},"ReportCard",0,function({r:e}){let s=e.summary;return(0,t.jsxs)("article",{className:"space-y-2 text-sm print:break-inside-avoid",children:[(0,t.jsxs)("header",{children:[(0,t.jsxs)("h3",{className:"font-semibold",children:[e.student_name," — ",e.class_name]}),(0,t.jsxs)("p",{className:"text-[12.5px] text-ink-3",children:[e.term_name,e.shared_at?` \xb7 shared ${(0,g.dateShort)(e.shared_at)}`:""]})]}),s.attendance&&s.attendance.of>0&&(0,t.jsxs)("p",{children:["Came to ",s.attendance.present," of ",s.attendance.of," classes."]}),!!s.skills?.length&&(0,t.jsx)("ul",{className:"grid gap-1 sm:grid-cols-2",children:s.skills.map(e=>(0,t.jsxs)("li",{className:"flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1",children:[(0,t.jsx)("span",{children:e.skill}),(0,t.jsxs)("span",{className:"text-[12.5px]",children:[e.from&&e.from!==e.level?`${w(e.from)} → `:"",(0,t.jsx)("b",{children:w(e.level)})]})]},e.skill))}),!!s.going_well?.length&&(0,t.jsxs)("p",{children:[(0,t.jsx)("b",{children:"Going well:"})," ",s.going_well.join(", "),"."]}),!!s.work_on?.length&&(0,t.jsxs)("p",{children:[(0,t.jsx)("b",{children:"To work on:"})," ",s.work_on.join(", "),"."]}),e.comment&&(0,t.jsx)("p",{className:"whitespace-pre-wrap rounded-[var(--radius-md)] border border-line p-2.5 italic",children:e.comment})]})},"SkillsPanel",0,function({studentId:e,editable:a,headingLevel:i=3}){let r=(0,f.useRows)(["skills",e],x.STUDENT_SKILLS,[e]),n=new Map(((0,f.useRows)(["skill-demos"],x.SKILL_DEMOS).data??[]).map(e=>[e.id,e.demo_url])),l=k(),d=s.useMemo(()=>{let e=new Map;return(r.data??[]).forEach(t=>e.set(t.framework,[...e.get(t.framework)??[],t])),[...e.entries()]},[r.data]);return r.isLoading?(0,t.jsx)(p.Skeleton,{className:"h-24"}):d.length?a?(0,t.jsxs)("div",{className:"space-y-3",children:[null!=l.error&&(0,t.jsx)(p.ErrorState,{error:l.error}),d.map(([s,a])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3",children:s}),(0,t.jsx)("ul",{className:"space-y-1.5",children:a.map(s=>(0,t.jsxs)("li",{className:"flex flex-wrap items-center gap-2 text-sm",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[s.skill,s.previous&&s.level&&s.previous!==s.level&&(0,t.jsx)(_.TrendingUp,{className:"ml-1 inline size-3.5 text-positive","aria-label":"Improved"}),n.get(s.skill_id)&&(0,t.jsxs)("a",{href:n.get(s.skill_id),target:"_blank",rel:"noreferrer",className:"ml-2 inline-flex items-center gap-0.5 text-[12px] font-medium text-accent-text underline",children:[(0,t.jsx)(m.PlayCircle,{className:"size-3.5","aria-hidden":!0})," Watch"]}),(0,t.jsx)("button",{className:"ml-2 text-[11.5px] text-ink-3 underline","aria-label":`Demonstration link for ${s.skill}`,onClick:()=>{let e=window.prompt(`A secure link (https://) to a demonstration of ${s.skill}. Leave empty to remove.`,n.get(s.skill_id)??"");null!==e&&l.mutate({sql:x.SET_SKILL_DEMO,params:[s.skill_id,e]})},children:n.get(s.skill_id)?"change link":"add demo"})]}),(0,t.jsx)("span",{role:"radiogroup","aria-label":`${s.skill} level`,className:"inline-flex rounded-[var(--radius-md)] border border-line p-0.5",children:x.LEVELS.slice(1).map(a=>(0,t.jsx)("button",{role:"radio","aria-checked":s.level===a.key,title:a.label,onClick:()=>l.mutate({sql:x.RECORD_SKILL,params:[e,s.skill_id,a.key,null]}),className:(0,v.cn)("h-7 min-w-[2rem] rounded-[calc(var(--radius-md)-2px)] px-1.5 text-[12px]",s.level===a.key?"bg-accent font-semibold text-on-accent":"text-ink-2 hover:bg-surface-2"),children:a.short},a.key))})]},s.skill_id))})]},s)),(0,t.jsx)("p",{className:"text-[12px] text-ink-3",children:"D developing · S secure · M mastered. Families see levels straight away."})]}):(0,t.jsx)(E,{groups:d,demos:n,headingLevel:i}):(0,t.jsx)("p",{className:"py-3 text-[14px] text-ink-3",children:"No skills yet. They appear once the class starts."})},"Timeline",0,function({studentId:e,limit:a=30}){let i=(0,f.useRows)(["timeline",e],x.TIMELINE,[e]),[r,n]=s.useState(!1),l=s.useMemo(()=>{let e=Date.now()-7776e6;return(i.data??[]).filter(t=>"skill"===t.kind&&new Date(t.at).getTime()>e&&t.previous&&t.level!==t.previous).length},[i.data]);if(i.isLoading)return(0,t.jsx)(p.Skeleton,{className:"h-24"});if(!i.data?.length)return(0,t.jsx)(p.EmptyState,{title:"Nothing yet",body:"Skills, feedback and milestones appear here as they happen."});let d=r?i.data:i.data.slice(0,a);return(0,t.jsxs)("div",{children:[l>0&&(0,t.jsxs)("p",{className:"mb-3 text-[14px]",children:[(0,t.jsxs)("span",{className:"font-semibold text-positive",children:[l," skill",1===l?"":"s"," moved up"]})," in the last three months."]}),(0,t.jsx)("ol",{className:"relative space-y-3 border-l border-line pl-4",children:d.map((e,s)=>{let a=S[e.kind]??h.Sparkles;return(0,t.jsxs)("li",{className:"relative",children:[(0,t.jsx)("span",{className:"absolute -left-[25px] top-0.5 grid size-[18px] place-items-center rounded-full bg-surface ring-1 ring-line",children:(0,t.jsx)(a,{className:"size-3 text-accent-text","aria-hidden":!0})}),(0,t.jsx)("p",{className:"text-[12px] text-ink-3",children:(0,g.relativeDay)(e.at)}),(0,t.jsxs)("p",{className:"text-sm font-medium",children:[e.title,"skill"===e.kind&&(0,t.jsxs)(t.Fragment,{children:[" — ",e.previous?`${w(e.previous)} → `:"",w(e.level)]}),"goal"===e.kind&&e.detail&&(0,t.jsx)(p.Badge,{tone:"achieved"===e.detail?"positive":"neutral",className:"ml-2",children:e.detail})]}),"goal"!==e.kind&&e.detail&&(0,t.jsx)("p",{className:"text-[13px] text-ink-2",children:e.detail})]},s)})}),!r&&i.data.length>a&&(0,t.jsx)(p.Button,{size:"sm",variant:"ghost",className:"mt-2",onClick:()=>n(!0),children:"Show everything"})]})}],84524)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),i=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,i=a.getFullYear()-t.getFullYear(),r=a.getMonth()-t.getMonth();return(r<0||0===r&&a.getDate()<t.getDate())&&(i-=1),i},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,i,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let a=s(e),i=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),r=e=>i.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),r=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?a(t):i(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),a=e.i(31502);function i(e,r,n=[],l){let{session:d}=(0,a.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,s.readAs)(d,r,n),staleTime:15e3,...l})}e.s(["useRow",0,function(e,t,s=[]){let a=i(e,t,s);return{...a,data:a.data?.[0]}},"useRows",0,i])},27389,e=>{"use strict";let t=`
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
 order by (a.id is null), r.kind, r.created_at desc`,p=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,f=`
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
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,f,"CLASS_DETAIL",0,h,"CLASS_RESOURCES",0,_,"CREATE_RESOURCE",0,p,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,a,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,l,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,o,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,i,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])},33204,e=>{"use strict";let t=`
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
 limit 1 returning id`,p=`
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`,f=`
insert into communication (studio_id, kind, channel, family_id, subject, body, reply_to)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2), $3::uuid
  from guardian where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id)
 limit 1 returning id`,y=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,b=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,x=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,g=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,v=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,i,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,l,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,a,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,v,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,p,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,x,"RUN_AUTOMATIONS",0,g,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,o,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,_,"SEND_TO_STUDIO",0,f,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])},36261,e=>{"use strict";let t=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,s=`
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
 order by (a.status in ('present', 'late')) desc nulls last, s.first_name`,r=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,n=`
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
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,t,"ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,a,"CHIPS",0,"select id, kind, label, position from feedback_chip order by kind, position, label","CLASS_REPORTS",0,r,"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,s,"GOALS",0,l,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,o,"MY_REPORTS",0,n,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,d,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,i,"SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","STUDENT_SKILLS",0,"select * from app.student_skills($1)","TIMELINE",0,"select * from app.student_timeline($1) limit 200"])}]);