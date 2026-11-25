(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),s=e.i(71645);let n=s.createContext(!1);n.Provider,e.i(43476);let r=s.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var a=e.i(19273),d=e.i(40143),o=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),_=e.i(86491),m=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#s=void 0;#n;#r;#a;#d;#o;#l;#c;#u;#_;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#a=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,a.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,a.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let s=this.hasListeners();s&&p(this.#t,i,this.options,t)&&this.#h(),this.updateResult(),s&&(this.#t!==i||(0,a.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,a.resolveQueryBoolean)(t.enabled,this.#t)||(0,a.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,a.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let n=this.#E();s&&(this.#t!==i||(0,a.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,a.resolveQueryBoolean)(t.enabled,this.#t)||n!==this.#_)&&this.#g(n)}getOptimisticResult(e){var t,i;let s=this.#e.getQueryCache().build(this.#e,e),n=this.createResult(s,e);return t=this,i=n,(0,a.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#s=n,this.#r=this.options,this.#n=this.#t.state),n}getCurrentResult(){return this.#s}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),s=this.#e.getQueryCache().build(this.#e,i),n=()=>{},r=new Promise(e=>{t=e,n=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===s.queryHash&&void 0!==s.state.data&&(n(),e(this.createResult(s,i)))})});return Promise.race([s.fetch().then(()=>{let e=this.createResult(s,i);return t?.(e),e}).finally(()=>{n()}),r])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#s))}#h(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(a.noop)),t}#v(){this.#p();let e=(0,a.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#s.isStale||!(0,a.isValidTimeout)(e))return;let t=(0,a.timeUntilStale)(this.#s.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#s.isStale||this.updateResult()},t)}#E(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#g(e){this.#y(),this.#_=e,!l.environmentManager.isServer()&&!1!==(0,a.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,a.isValidTimeout)(this.#_)&&0!==this.#_&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#_))}#f(){this.#v(),this.#g(this.#E())}#p(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,s=this.#t,n=this.options,r=this.#s,d=this.#n,o=this.#r,l=e!==s?e.state:this.#i,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let i=this.hasListeners(),r=!i&&h(e,t),a=i&&p(e,s,t,n);(r||a)&&(u={...u,...(0,_.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:v}=u;i=u.data;let E=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===v){let e;r?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=r.data,E=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(v="success",i=(0,a.replaceData)(r?.data,e,t),m=!0)}if(t.select&&void 0!==i&&!E)if(r&&i===d?.data&&t.select===this.#d)i=this.#o;else try{this.#d=t.select,i=t.select(i),i=(0,a.replaceData)(r?.data,i,t),this.#o=i,this.#a=null}catch(e){this.#a=e}else void 0===i&&(this.#a=null);this.#a&&(f=this.#a,i=this.#o,b=Date.now(),v="error",m=!1);let g="fetching"===u.fetchStatus,w="pending"===v,$="error"===v,S=w&&g,R=void 0!==i;return{status:v,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===v,isError:$,isInitialLoading:S,isLoading:S,data:i,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:g,isRefetching:g&&!w,isLoadingError:$&&!R,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:$&&R,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,a.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#s,t=this.createResult(this.#t,this.options);if(this.#n=this.#t.state,this.#r=this.options,void 0!==this.#n.data&&(this.#l=this.#t),(0,a.shallowEqualObjects)(t,e))return;this.#s=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#m.size)return!0;let s=new Set(i??this.#m);return this.options.throwOnError&&s.add("error"),Object.keys(this.#s).some(t=>this.#s[t]!==e[t]&&s.has(t))};this.#w({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#w(e){d.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#s)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,a.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,i){if(!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,a.resolveStaleTime)(t.staleTime,e)){let s="function"==typeof i?i(e):i;return"always"===s||!1!==s&&y(e,t)}return!1}function p(e,t,i,s){return(e!==t||!1===(0,a.resolveQueryBoolean)(s.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,a.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let l,c=s.useContext(n),u=s.useContext(r),_=(0,i.useQueryClient)(o),m=_.defaultQueryOptions(e),h=_.getQueryCache().get(m.queryHash),f=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":f?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}l=h?.state.error&&"function"==typeof m.throwOnError?(0,a.shouldThrowError)(m.throwOnError,[h.state.error,h]):m.throwOnError,(m.suspense||l)&&!u.isReset()&&(m.retryOnMount=!1),s.useEffect(()=>{u.clearReset()},[u]);let[p]=s.useState(()=>new t(_,m)),y=p.getOptimisticResult(m),b=!c&&f;if(s.useSyncExternalStore(s.useCallback(e=>{let t=b?p.subscribe(d.notifyManager.batchCalls(e)):a.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),s.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:s,suspense:n})=>e.isError&&!t.isReset()&&!e.isFetching&&s&&(n&&void 0===e.data||(0,a.shouldThrowError)(i,[e.error,s])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:h,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},32095,e=>{"use strict";let t=(0,e.i(75254).default)("graduation-cap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);e.s(["GraduationCap",0,t],32095)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},50627,e=>{"use strict";let t=(0,e.i(75254).default)("receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);e.s(["Receipt",0,t],50627)},83086,e=>{"use strict";let t=(0,e.i(75254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],83086)},61911,e=>{"use strict";let t=(0,e.i(75254).default)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);e.s(["Users",0,t],61911)},18566,(e,t,i)=>{t.exports=e.r(76562)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(25757);function n(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),a=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function d(e){let[t,i,s]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*i+.0722*s}function o(e,t){let[i,s]=[d(e),d(t)].sort((e,t)=>t-e);return(i+.05)/(s+.05)}function l([e,t,i]){let s=Math.max(e/=255,t/=255,i/=255),n=Math.min(e,t,i),r=(s+n)/2;if(s===n)return[0,0,r];let a=s-n;return[(s===e?(t-i)/a+6*(t<i):s===t?(i-e)/a+2:(e-t)/a+4)/6,r>.5?a/(2-s-n):a/(s+n),r]}function c([e,t,i]){if(0===t)return a([255*i,255*i,255*i]);let s=i<.5?i*(1+t):i+t-i*t,n=2*i-s,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?n+(s-n)*6*e:e<.5?s:e<2/3?n+(s-n)*(2/3-e)*6:n;return a([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var i;let s,_,m=n(e)??"#0b3b34",h=.18>d(n(t)??"#ffffff"),f=4.5>o(m,"#ffffff"),[p,y,b]=l(r(m)),v=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),E=(i=h?.82:.9,s=r(m),_=r(t),a([0,1,2].map(e=>s[e]*(1-i)+_[e]*i))),g=(e,t,i)=>h?function(e,t,i){let[s,n,a]=l(r(e)),d=e;for(;o(d,t)<i&&a<1;)d=c([s,n,a=Math.min(1,a+.01)]);return d}(e,t,i):function(e,t,i){let[s,n,a]=l(r(e)),d=e;for(;o(d,t)<i&&a>0;)d=c([s,n,a=Math.max(0,a-.01)]);return d}(e,t,i),w=g(m,E,4.5),$=g(m,t,4.5),S=g(m,t,3);return{accent:m,onAccent:f?"#000000":"#ffffff",hover:v,soft:E,ink:w,text:$,line:S,darkText:f,textDeepened:$!==m}}let _=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),m=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,_,"monogram",0,m,"normaliseHex",0,n,"paletteFor",0,u],54626);let h={classic:{id:"classic",name:"Classic",tagline:"Elegant and calm — ivory, serif headings, soft edges",surface:"#fffdf8",canvas:"#f6f2ea",ink:"#14211e",dark:!1,accent:"#0b3b34",secondary:"#c86a4f",presets:[{name:"Sanaa",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Terracotta",accent:"#c86a4f",secondary:"#0b3b34"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and electric — dark mode, wide type, neon accents",surface:"#18122f",canvas:"#0d0a1c",ink:"#f6f4ff",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>h["urban"===e?"urban":"classic"];function p(e,t,i){let s=f(e);return{theme:s,accent:n(t)??s.accent,secondary:n(i)??s.secondary}}e.s(["THEMES",0,h,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(s.SanaaLogo,{className:"sanaa-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Sanaa"}),(0,t.jsx)(s.SanaaLogo,{className:"sanaa-on-dark h-[0.95em] translate-y-[0.06em]",tone:"ivory",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:s}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),s&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:s})]}):null},"SchoolMark",0,function({name:e,logo:i,className:s}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",s)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",s),children:m(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,s=e?.brand_colour??null,n=e?.brand_secondary??null,r=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys(_(u(null))),"--color-secondary"];if(!r){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let a=p(t,s,n);e.dataset.theme=a.theme.id,Object.entries(_(u(a.accent,a.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",a.secondary);let d=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});d.setAttribute("content",a.theme.dark?a.theme.canvas:a.theme.surface),d.parentNode||document.head.appendChild(d)},[r,t,s,n])}],33405)},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),s=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),n=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),s=new Date,n=s.getFullYear()-t.getFullYear(),r=s.getMonth()-t.getMonth();return(r<0||0===r&&s.getDate()<t.getDate())&&(n-=1),n},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,n,"dayName",0,s,"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),s=new Date(i);return s.setDate(s.getDate()+1),[i.toISOString(),s.toISOString()]},"greeting",0,()=>{let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let s=i(e),n=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(s),r=e=>n.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=i(e),r=new Date,a=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===a?"Today":1===a?"Tomorrow":-1===a?"Yesterday":a>1&&a<7?s(t):n(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let s=new Date(t);return s.setDate(s.getDate()+7),[t.toISOString(),s.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),s=e.i(31502);function n(e,r,a=[],d){let{session:o}=(0,s.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,i.readAs)(o,r,a),staleTime:15e3,...d})}e.s(["useRow",0,function(e,t,i=[]){let s=n(e,t,i);return{...s,data:s.data?.[0]}},"useRows",0,n])},84315,e=>{"use strict";let t=`
select e.id, e.kind::text as kind, e.status::text as status, e.title, e.description, e.starts_at, e.ends_at, e.venue,
       e.cost_minor, e.capacity, e.entries_close_on, e.requests_open,
       count(p.*) filter (where p.status = 'invited')::int as invited,
       count(p.*) filter (where p.status = 'confirmed')::int as confirmed,
       count(p.*) filter (where p.status = 'requested')::int as requested,
       count(p.*) filter (where p.status = 'declined')::int as declined,
       (select count(distinct ii.student_id)::int from invoice_item ii where ii.event_id = e.id and ii.deleted_at is null) as billed
  from studio_event e left join event_participant p on p.event_id = e.id and p.deleted_at is null
 where e.deleted_at is null and e.parent_event_id is null and e.kind <> 'private_lesson'
 group by e.id order by (e.starts_at < now()), e.starts_at`,i=`
insert into studio_event (studio_id, kind, status, title, description, starts_at, ends_at, venue, cost_minor, capacity, entries_close_on, requests_open, created_by)
select m.studio_id, $1::event_kind, $2::event_status, btrim($3), nullif(btrim($4), ''), $5::timestamptz, $6::timestamptz, nullif(btrim($7), ''),
       $8, $9, $10::date, $11, auth.uid()
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null limit 1 returning id`,s=`
update studio_event set kind = $2::event_kind, status = $3::event_status, title = btrim($4), description = nullif(btrim($5), ''),
       starts_at = $6::timestamptz, ends_at = $7::timestamptz, venue = nullif(btrim($8), ''), cost_minor = $9, capacity = $10,
       entries_close_on = $11::date, requests_open = $12, updated_at = now() where id = $1 returning id`,n=`
select p.id, p.status::text as status, s.first_name || ' ' || s.last_name as student, c.name as class_name
  from event_participant p join student s on s.id = p.student_id left join class c on c.id = p.invited_class_id
 where p.event_id = $1 and p.deleted_at is null order by p.status, s.first_name`,r=`select r.id, r.title, r.position, r.costume, r.music, c.name as class_name, r.class_id
  from event_routine r left join class c on c.id = r.class_id where r.event_id = $1 and r.deleted_at is null order by r.position, r.title`,a=`insert into event_routine (event_id, class_id, title, costume, position)
  select $1, $2, btrim($3), nullif(btrim($4), ''), coalesce((select max(position) + 1 from event_routine where event_id = $1 and deleted_at is null), 1) returning id`,d=`
with me as (select id, event_id, position from event_routine where id = $1),
     other as (select r.id, r.position from event_routine r, me where r.event_id = me.event_id and r.deleted_at is null and r.id <> me.id
                 and case when $2 < 0 then r.position < me.position else r.position > me.position end
               order by case when $2 < 0 then -r.position else r.position end limit 1)
update event_routine r set position = case when r.id = (select id from me) then (select position from other) else (select position from me) end
 where r.id in ((select id from me), (select id from other)) returning r.id`,o=`insert into studio_event (studio_id, kind, title, starts_at, ends_at, venue, parent_event_id, requests_open, created_by)
  select studio_id, 'rehearsal', btrim($2), $3::timestamptz, $4::timestamptz, nullif(btrim($5), ''), id, false, auth.uid() from studio_event where id = $1 returning id`,l=`
insert into costume_order (item_id, student_id, status) values ($1, $2, $3)
on conflict (item_id, student_id) do update set status = excluded.status, updated_at = now() returning item_id`,c=`
select t.id, t.name, t.price_minor, t.capacity, t.per_family_max, app.tickets_left(t.id) as left,
       coalesce((select sum(quantity) from ticket_booking b where b.ticket_type_id = t.id and b.status = 'booked'), 0)::int as sold
  from ticket_type t where t.event_id = $1 and t.deleted_at is null order by t.price_minor desc, t.name`,u=`
select x.id, x.board, x.title, x.exam_on, x.venue, x.entries_close_on,
       count(e.*) filter (where e.status <> 'withdrawn')::int as entries,
       count(e.*) filter (where e.result is not null)::int as results,
       count(e.*) filter (where e.status <> 'withdrawn' and e.invoice_id is null and e.fee_minor > 0)::int as unbilled
  from exam_session x left join exam_entry e on e.session_id = x.id
 where x.deleted_at is null group by x.id order by (x.exam_on < current_date), x.exam_on`,_=`
insert into exam_session (studio_id, board, title, exam_on, venue, entries_close_on)
select m.studio_id, btrim($1), btrim($2), $3::date, nullif(btrim($4), ''), $5::date
  from membership m where m.user_id = auth.uid() and m.role in ('owner','admin') and m.deleted_at is null and app.in_scope(m.studio_id) limit 1 returning id`,m=`e.id, e.session_id, e.student_id, s.first_name || ' ' || s.last_name as student, e.grade, e.fee_minor, e.status, e.result, e.mark,
       x.board, x.title as exam_title, x.exam_on`,h=`
select ${m} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.session_id = $1 order by e.grade, s.first_name`,f=`
select ${m} from exam_entry e join exam_session x on x.id = e.session_id join student s on s.id = e.student_id
 where e.student_id = $1 and e.status <> 'withdrawn' order by x.exam_on desc`,p=`
select i.id, i.name, i.sizes, s.id as student_id, s.first_name, o.size, o.status
  from costume_item i
  join student s on s.id in (select rd.student_id from routine_dancer rd where rd.routine_id = i.routine_id
                             union select p.student_id from event_participant p where i.routine_id is null and p.event_id = i.event_id
                                     and p.status = 'confirmed' and p.deleted_at is null)
  left join costume_order o on o.item_id = i.id and o.student_id = s.id
 where i.event_id = $1 and i.deleted_at is null and s.deleted_at is null
 order by i.name, s.first_name`;e.s(["ADD_CHAPERONE",0,"insert into event_chaperone (event_id, name, phone, role, checked) values ($1, btrim($2), nullif(btrim($3), ''), nullif(btrim($4), ''), $5) returning id","ADD_COSTUME",0,"insert into costume_item (event_id, routine_id, name, price_minor) values ($1, $2, btrim($3), $4) returning id","ADD_EXAM_SESSION",0,_,"ADD_REHEARSAL",0,o,"ADD_ROUTINE",0,a,"ADD_TICKET_TYPE",0,"insert into ticket_type (event_id, name, price_minor, capacity, per_family_max) values ($1, btrim($2), $3, $4, $5) returning id","BILL_EVENT",0,"select app.bill_event($1) as n","BILL_EXAM",0,"select app.bill_exam($1) as n","BOOK_TICKETS",0,"select app.book_tickets($1, $2) as id","CHAPERONES",0,"select id, name, phone, role, checked from event_chaperone where event_id = $1 and deleted_at is null order by name","COSTUME_LIST",0,"select * from app.costume_list($1)","CREATE_EVENT",0,i,"ENTER_EXAM",0,"select app.enter_exam($1, $2, $3, $4) as id","EVENTS",0,t,"EXAM_ENTRIES",0,h,"EXAM_RESULT",0,"select app.exam_result($1, $2, $3)","EXAM_SESSIONS",0,u,"INVITE_CLASSES",0,"select app.invite_classes($1, $2::uuid[]) as n","LOG_PRACTICE",0,"select app.log_practice($1, $2, $3) as id","MARK_REHEARSAL",0,"select app.mark_rehearsal($1, $2, $3::attendance_status)","MOVE_ROUTINE",0,d,"MY_COSTUMES",0,p,"MY_PRACTICE",0,"select id, practised_on, minutes, what from practice_log where student_id = $1 order by practised_on desc, created_at desc limit 10","MY_TICKETS",0,"select b.id, t.event_id, t.name, b.quantity from ticket_booking b join ticket_type t on t.id = b.ticket_type_id where b.status = 'booked'","PARTICIPANTS",0,n,"PRACTICE_WEEKLY",0,"select * from app.practice_weekly($1)","PROGRAMME",0,"select * from app.event_programme($1)","REHEARSALS",0,"select id, title, starts_at, ends_at, venue from studio_event where parent_event_id = $1 and deleted_at is null order by starts_at","REHEARSAL_REGISTER",0,"select * from app.rehearsal_register($1)","REMOVE_CHAPERONE",0,"delete from event_chaperone where id = $1","REMOVE_ROUTINE",0,"delete from event_routine where id = $1","RESULTS",0,[["distinction","Distinction"],["merit","Merit"],["pass","Pass"],["highly_commended","Highly commended"],["commended","Commended"],["not_yet","Not yet"]],"ROUTINES",0,r,"SET_COSTUME_SIZE",0,"select app.set_costume_size($1, $2, $3)","SET_COSTUME_STATUS",0,l,"SET_PARTICIPANT",0,"update event_participant set status = $2::participant_status, decided_by = auth.uid(), decided_at = now() where id = $1 returning id","STUDENT_EXAMS",0,f,"STUDENT_PICK",0,"select id, first_name || ' ' || last_name as name from student where deleted_at is null order by first_name, last_name","TICKET_TYPES",0,c,"UPCOMING_EXAMS",0,"select id, board, title, exam_on from exam_session where deleted_at is null and exam_on >= current_date order by exam_on","UPDATE_EVENT",0,s])},27389,e=>{"use strict";let t=`
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
 order by r.kind, r.category nulls last, r.title`,i=`
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at,
       c.name as class_name, sm.display_name as author,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,s=`
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
 order by r.created_at desc`,a=`
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
returning id`,l=`
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
returning id, status`,_=`
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
 where c.id = $1 and c.deleted_at is null`,h=`
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
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,_,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,h,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,s,"MY_REQUESTS",0,r,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,l,"RAISE_REQUEST",0,a,"REQUEST_PLACE",0,n,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,i,"WRITE_FEEDBACK",0,o])},33204,e=>{"use strict";let t=`
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
 order by last.sent_at desc`,i=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,s=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,n=`
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
 order by c.day_of_week, c.start_time`,a=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,d=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,o=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,l=`
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`,c=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`,u=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,_=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,m=`
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,h=`
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
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,E=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,g=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,n,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,d,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,s,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,g,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,E,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,_,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,m,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,a,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,o])}]);