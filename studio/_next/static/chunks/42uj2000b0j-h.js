(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),r=e.i(71645);let a=r.createContext(!1);a.Provider,e.i(43476);let i=r.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),o=e.i(40143),l=e.i(80166),c=e.i(73911),d=e.i(15823),u=e.i(75555),h=e.i(86491),m=class extends d.Subscribable{#e;#t=void 0;#s=void 0;#r=void 0;#a;#i;#n;#o;#l;#c;#d;#u;#h;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#_())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return _(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return _(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#v(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let r=this.hasListeners();r&&p(this.#t,s,this.options,t)&&this.#f(),this.updateResult(),r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#b();let a=this.#g();r&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#h)&&this.#R(a)}getOptimisticResult(e){var t,s;let r=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(r,e);return t=this,s=a,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#r=a,this.#i=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#r}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),r=this.#e.getQueryCache().build(this.#e,s),a=()=>{},i=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===r.queryHash&&void 0!==r.state.data&&(a(),e(this.createResult(r,s)))})});return Promise.race([r.fetch().then(()=>{let e=this.createResult(r,s);return t?.(e),e}).finally(()=>{a()}),i])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#r))}#f(e){this.#v();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#b(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(c.environmentManager.isServer()||this.#r.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#r.dataUpdatedAt,e)+1;this.#d=l.timeoutManager.setTimeout(()=>{this.#r.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#R(e){this.#y(),this.#h=e,!c.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#h)&&0!==this.#h&&(this.#u=l.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#f()},this.#h))}#_(){this.#b(),this.#R(this.#g())}#p(){void 0!==this.#d&&(l.timeoutManager.clearTimeout(this.#d),this.#d=void 0)}#y(){void 0!==this.#u&&(l.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,r=this.#t,a=this.options,i=this.#r,o=this.#a,l=this.#i,c=e!==r?e.state:this.#s,{state:d}=e,u={...d},m=!1;if(t._optimisticResults){let s=this.hasListeners(),i=!s&&f(e,t),n=s&&p(e,r,t,a);(i||n)&&(u={...u,...(0,h.fetchState)(d.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:_,errorUpdatedAt:v,status:b}=u;s=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===b){let e;i?.isPlaceholderData&&t.placeholderData===l?.placeholderData?(e=i.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#c?.state.data,this.#c):t.placeholderData,void 0!==e&&(b="success",s=(0,n.replaceData)(i?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!g)if(i&&s===o?.data&&t.select===this.#o)s=this.#l;else try{this.#o=t.select,s=t.select(s),s=(0,n.replaceData)(i?.data,s,t),this.#l=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(_=this.#n,s=this.#l,v=Date.now(),b="error",m=!1);let R="fetching"===u.fetchStatus,w="pending"===b,E="error"===b,S=w&&R,j=void 0!==s;return{status:b,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===b,isError:E,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:_,errorUpdatedAt:v,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>c.dataUpdateCount||u.errorUpdateCount>c.errorUpdateCount,isFetching:R,isRefetching:R&&!w,isLoadingError:E&&!j,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:E&&j,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#r,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#i=this.options,void 0!==this.#a.data&&(this.#c=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#r=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#m.size)return!0;let r=new Set(s??this.#m);return this.options.throwOnError&&r.add("error"),Object.keys(this.#r).some(t=>this.#r[t]!==e[t]&&r.has(t))};this.#w({listeners:s()})}#v(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#_()}#w(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#r)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&_(e,t,t.refetchOnMount)}function _(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let r="function"==typeof s?s(e):s;return"always"===r||!1!==r&&y(e,t)}return!1}function p(e,t,s,r){return(e!==t||!1===(0,n.resolveQueryBoolean)(r.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,l){let c,d=r.useContext(a),u=r.useContext(i),h=(0,s.useQueryClient)(l),m=h.defaultQueryOptions(e),f=h.getQueryCache().get(m.queryHash),_=!1!==e.subscribed;if(m._optimisticResults=d?"isRestoring":_?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}c=f?.state.error&&"function"==typeof m.throwOnError?(0,n.shouldThrowError)(m.throwOnError,[f.state.error,f]):m.throwOnError,(m.suspense||c)&&!u.isReset()&&(m.retryOnMount=!1),r.useEffect(()=>{u.clearReset()},[u]);let[p]=r.useState(()=>new t(h,m)),y=p.getOptimisticResult(m),v=!d&&_;if(r.useSyncExternalStore(r.useCallback(e=>{let t=v?p.subscribe(o.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,v]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),r.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:r,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&r&&(a&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,r])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:f,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},63059,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["ChevronRight",0,t],63059)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},18566,(e,t,s)=>{t.exports=e.r(76562)},2607,e=>{"use strict";var t=e.i(43476),s=e.i(22016),r=e.i(63059),a=e.i(75505),i=e.i(32095),n=e.i(77326),o=e.i(13927),l=e.i(17658),c=e.i(27389);let d={violet:"violet",amber:"amber",teal:"teal",rose:"rose",indigo:"indigo",lime:"lime"};e.s(["default",0,function(){let e=(0,o.useRows)(["my-teaching-classes"],c.MY_TEACHING_CLASSES);return(0,t.jsx)(n.Shell,{title:"Material",subtitle:"Videos, music and notes, class by class",allow:["owner","admin","teacher"],children:(0,t.jsxs)("div",{className:"mx-auto max-w-2xl space-y-4",children:[e.isLoading&&(0,t.jsx)(l.Card,{className:"space-y-3 p-4",children:[0,1,2].map(e=>(0,t.jsx)(l.Skeleton,{className:"h-12"},e))}),e.error&&(0,t.jsx)(l.ErrorState,{error:e.error,onRetry:()=>e.refetch()}),e.data?.length===0&&!e.isLoading&&(0,t.jsx)(l.Card,{children:(0,t.jsx)(l.EmptyState,{icon:(0,t.jsx)(i.GraduationCap,{className:"size-5"}),title:"No classes assigned to you",body:"Once you are down as the teacher or assistant on a class, it will appear here."})}),(e.data?.length??0)>0&&(0,t.jsxs)(l.Card,{children:[(0,t.jsx)(l.CardHeader,{title:"Your classes",subtitle:"Open one to share a routine video, the term's music or a handout."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:e.data.map(e=>(0,t.jsx)("li",{children:(0,t.jsxs)(s.default,{href:`/class/?id=${e.id}`,className:"flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2",children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-surface-2 text-ink-2",children:(0,t.jsx)(a.FolderOpen,{className:"size-4.5"})}),(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("span",{className:"font-medium",children:e.name}),e.style&&(0,t.jsx)(l.Badge,{tone:d[e.colour??""]??"neutral",children:e.style})]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[12.5px] text-ink-2",children:0===e.resources?"Nothing shared yet":`${e.resources} item${1===e.resources?"":"s"} shared`})]}),(0,t.jsx)(r.ChevronRight,{className:"size-4 shrink-0 text-ink-3","aria-hidden":!0})]})},e.id))})]})]})})}])},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),r=e.i(45974);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let i=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function o(e){let[t,s,r]=i(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*r}function l(e,t){let[s,r]=[o(e),o(t)].sort((e,t)=>t-e);return(s+.05)/(r+.05)}function c([e,t,s]){let r=Math.max(e/=255,t/=255,s/=255),a=Math.min(e,t,s),i=(r+a)/2;if(r===a)return[0,0,i];let n=r-a;return[(r===e?(t-s)/n+6*(t<s):r===t?(s-e)/n+2:(e-t)/n+4)/6,i>.5?n/(2-r-a):n/(r+a),i]}function d([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let r=s<.5?s*(1+t):s+t-s*t,a=2*s-r,i=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(r-a)*6*e:e<.5?r:e<2/3?a+(r-a)*(2/3-e)*6:a;return n([255*i(e+1/3),255*i(e),255*i(e-1/3)])}function u(e,t="#ffffff"){var s;let r,h,m=a(e)??"#5b46d9",f=.18>o(a(t)??"#ffffff"),_=4.5>l(m,"#ffffff"),[p,y,v]=c(i(m)),b=d([p,y,_?Math.min(1,v+.08):Math.max(0,v-.07)]),g=(s=f?.82:.9,r=i(m),h=i(t),n([0,1,2].map(e=>r[e]*(1-s)+h[e]*s))),R=(e,t,s)=>f?function(e,t,s){let[r,a,n]=c(i(e)),o=e;for(;l(o,t)<s&&n<1;)o=d([r,a,n=Math.min(1,n+.01)]);return o}(e,t,s):function(e,t,s){let[r,a,n]=c(i(e)),o=e;for(;l(o,t)<s&&n>0;)o=d([r,a,n=Math.max(0,n-.01)]);return o}(e,t,s),w=R(m,g,4.5),E=R(m,t,4.5),S=R(m,t,3);return{accent:m,onAccent:_?"#000000":"#ffffff",hover:b,soft:g,ink:w,text:E,line:S,darkText:_,textDeepened:E!==m}}let h=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),m=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,h,"monogram",0,m,"normaliseHex",0,a,"paletteFor",0,u],54626);let f={classic:{id:"classic",name:"Classic",tagline:"Elegant and warm — ivory, serif headings, soft edges",surface:"#fffdf9",canvas:"#faf6ee",ink:"#1f1f1f",dark:!1,accent:"#c2563c",secondary:"#ff7a5c",presets:[{name:"Terracotta",accent:"#c2563c",secondary:"#ff7a5c"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Sage",accent:"#4d6b4a",secondary:"#c8a97e"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and electric — dark mode, wide type, neon accents",surface:"#18122f",canvas:"#0d0a1c",ink:"#f6f4ff",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},_=e=>f["urban"===e?"urban":"classic"];function p(e,t,s){let r=_(e);return{theme:r,accent:a(t)??r.accent,secondary:a(s)??r.secondary}}e.s(["THEMES",0,f,"schoolColours",0,p,"themeOf",0,_],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by ",(0,t.jsx)(r.BarreMark,{className:"size-3","aria-hidden":!0})," ",(0,t.jsx)("span",{className:"font-medium",children:"Barre"})]})},"SchoolMark",0,function({name:e,logo:s,className:r}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",r)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",r),children:m(e)})},"useSchoolTheme",0,function(e){let t=e?.theme??null,r=e?.brand_colour??null,a=e?.brand_secondary??null,i=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(h(u(null))),"--color-secondary"];if(!i){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,r,a);e.dataset.theme=n.theme.id,Object.entries(h(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let o=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});o.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),o.parentNode||document.head.appendChild(o)},[i,t,r,a])}],33405)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),r=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),r=new Date,a=r.getFullYear()-t.getFullYear(),i=r.getMonth()-t.getMonth();return(i<0||0===i&&r.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,a,"dayName",0,r,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),r=new Date(s);return r.setDate(r.getDate()+1),[s.toISOString(),r.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let r=s(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(r),i=e=>a.find(t=>t.type===e)?.value??"";return`${i("year")}-${i("month")}-${i("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),i=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(i.getFullYear(),i.getMonth(),i.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?r(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let r=new Date(t);return r.setDate(r.getDate()+7),[t.toISOString(),r.toISOString()]}])},27389,e=>{"use strict";let t=`
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
 order by f.shared_at desc`,r=`
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
 order by ev.starts_at`,a=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,i=`
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
 order by starts_at`,l=`
insert into feedback_note (studio_id, student_id, class_id, author_id, headline, going_well,
                           work_on, private_note, shared_at, share_with_student, share_with_guardian)
select s.studio_id, s.id, $2,
       (select id from staff_member where user_id = auth.uid() and deleted_at is null limit 1),
       $3, $4, $5, $6,
       case when $7::boolean then now() else null end, true, true
  from student s where s.id = $1
returning id`,c=`
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
 order by (r.kind = 'medical_update') desc, r.created_at`,d=`
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
returning id`,m=`
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
 order by (a.id is null), r.kind, r.created_at desc`,_=`
insert into resource (studio_id, kind, title, description, category, url,
                      duration_sec, visible_to_students, visible_to_guardians, created_by)
select c.studio_id, $2::resource_kind, $3, $4, $5, $6, $7, $8, $9, auth.uid()
  from class c where c.id = $1
returning id, studio_id`,p=`
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
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,h,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,_,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,r,"MY_REQUESTS",0,i,"MY_TEACHING_CLASSES",0,v,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,d,"PENDING_REQUESTS",0,c,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,l])}]);