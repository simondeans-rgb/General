(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let a=i.createContext(!1);a.Provider,e.i(43476);let n=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),d=e.i(40143),o=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),_=e.i(86491),m=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#i=void 0;#a;#n;#r;#d;#o;#l;#c;#u;#_;#m=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#h())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return h(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return h(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let i=this.hasListeners();i&&p(this.#t,s,this.options,t)&&this.#f(),this.updateResult(),i&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let a=this.#v();i&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#_)&&this.#w(a)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(i,e);return t=this,s=a,(0,r.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#i=a,this.#n=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#i}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#m.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),a=()=>{},n=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(a(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{a()}),n])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#i))}#f(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#p();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#i.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#i.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#i.isStale||this.updateResult()},t)}#v(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#_=e,!l.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#_)&&0!==this.#_&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#f()},this.#_))}#h(){this.#g(),this.#w(this.#v())}#p(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,i=this.#t,a=this.options,n=this.#i,d=this.#a,o=this.#n,l=e!==i?e.state:this.#s,{state:c}=e,u={...c},m=!1;if(t._optimisticResults){let s=this.hasListeners(),n=!s&&f(e,t),r=s&&p(e,i,t,a);(n||r)&&(u={...u,...(0,_.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:h,errorUpdatedAt:b,status:g}=u;s=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===g){let e;n?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=n.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(g="success",s=(0,r.replaceData)(n?.data,e,t),m=!0)}if(t.select&&void 0!==s&&!v)if(n&&s===d?.data&&t.select===this.#d)s=this.#o;else try{this.#d=t.select,s=t.select(s),s=(0,r.replaceData)(n?.data,s,t),this.#o=s,this.#r=null}catch(e){this.#r=e}else void 0===s&&(this.#r=null);this.#r&&(h=this.#r,s=this.#o,b=Date.now(),g="error",m=!1);let w="fetching"===u.fetchStatus,S="pending"===g,E="error"===g,$=S&&w,R=void 0!==s;return{status:g,fetchStatus:u.fetchStatus,isPending:S,isSuccess:"success"===g,isError:E,isInitialLoading:$,isLoading:$,data:s,dataUpdatedAt:u.dataUpdatedAt,error:h,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:w,isRefetching:w&&!S,isLoadingError:E&&!R,isPaused:"paused"===u.fetchStatus,isPlaceholderData:m,isRefetchError:E&&R,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#i,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#n=this.options,void 0!==this.#a.data&&(this.#l=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#i=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#m.size)return!0;let i=new Set(s??this.#m);return this.options.throwOnError&&i.add("error"),Object.keys(this.#i).some(t=>this.#i[t]!==e[t]&&i.has(t))};this.#S({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#h()}#S(e){d.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#i)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&h(e,t,t.refetchOnMount)}function h(e,t,s){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function p(e,t,s,i){return(e!==t||!1===(0,r.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let l,c=i.useContext(a),u=i.useContext(n),_=(0,s.useQueryClient)(o),m=_.defaultQueryOptions(e),f=_.getQueryCache().get(m.queryHash),h=!1!==e.subscribed;if(m._optimisticResults=c?"isRestoring":h?"optimistic":void 0,m.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=m.staleTime;m.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof m.gcTime&&(m.gcTime=Math.max(m.gcTime,1e3))}l=f?.state.error&&"function"==typeof m.throwOnError?(0,r.shouldThrowError)(m.throwOnError,[f.state.error,f]):m.throwOnError,(m.suspense||l)&&!u.isReset()&&(m.retryOnMount=!1),i.useEffect(()=>{u.clearReset()},[u]);let[p]=i.useState(()=>new t(_,m)),y=p.getOptimisticResult(m),b=!c&&h;if(i.useSyncExternalStore(i.useCallback(e=>{let t=b?p.subscribe(d.notifyManager.batchCalls(e)):r.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),i.useEffect(()=>{p.setOptions(m)},[m,p]),m?.suspense&&y.isPending)throw p.fetchOptimistic(m).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(a&&void 0===e.data||(0,r.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:u,throwOnError:m.throwOnError,query:f,suspense:m.suspense}))throw y.error;return m.notifyOnChangeProps?y:p.trackResult(y)}(e,m,t)}],66027)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},64659,e=>{"use strict";let t=(0,e.i(75254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",0,t],64659)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(87338);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let n=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),r=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function d(e){let[t,s,i]=n(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*i}function o(e,t){let[s,i]=[d(e),d(t)].sort((e,t)=>t-e);return(s+.05)/(i+.05)}function l([e,t,s]){let i=Math.max(e/=255,t/=255,s/=255),a=Math.min(e,t,s),n=(i+a)/2;if(i===a)return[0,0,n];let r=i-a;return[(i===e?(t-s)/r+6*(t<s):i===t?(s-e)/r+2:(e-t)/r+4)/6,n>.5?r/(2-i-a):r/(i+a),n]}function c([e,t,s]){if(0===t)return r([255*s,255*s,255*s]);let i=s<.5?s*(1+t):s+t-s*t,a=2*s-i,n=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(i-a)*6*e:e<.5?i:e<2/3?a+(i-a)*(2/3-e)*6:a;return r([255*n(e+1/3),255*n(e),255*n(e-1/3)])}function u(e,t="#ffffff"){var s;let i,_,m=a(e)??"#2638f0",f=.18>d(a(t)??"#ffffff"),h=4.5>o(m,"#ffffff"),[p,y,b]=l(n(m)),g=c([p,y,h?Math.min(1,b+.08):Math.max(0,b-.07)]),v=(s=f?.82:.9,i=n(m),_=n(t),r([0,1,2].map(e=>i[e]*(1-s)+_[e]*s))),w=(e,t,s)=>f?function(e,t,s){let[i,a,r]=l(n(e)),d=e;for(;o(d,t)<s&&r<1;)d=c([i,a,r=Math.min(1,r+.01)]);return d}(e,t,s):function(e,t,s){let[i,a,r]=l(n(e)),d=e;for(;o(d,t)<s&&r>0;)d=c([i,a,r=Math.max(0,r-.01)]);return d}(e,t,s),S=w(m,v,4.5),E=w(m,t,4.5),$=w(m,t,3);return{accent:m,onAccent:h?"#000000":"#ffffff",hover:g,soft:v,ink:S,text:E,line:$,darkText:h,textDeepened:E!==m}}let _=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),m=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,_,"monogram",0,m,"normaliseHex",0,a,"paletteFor",0,u],54626);let f={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},h=e=>f["urban"===e?"urban":"classic"];function p(e,t,s){let i=h(e);return{theme:i,accent:a(t)??i.accent,secondary:a(s)??i.secondary}}e.s(["THEMES",0,f,"schoolColours",0,p,"themeOf",0,h],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-3",e),children:["powered by",(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:i}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),i&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:i})]}):null},"SchoolMark",0,function({name:e,logo:s,className:i}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",i)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[0.8125rem] font-semibold text-on-accent",i),children:m(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,i=e?.brand_colour??null,a=e?.brand_secondary??null,n=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(_(u(null))),"--color-secondary"];if(!n){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let r=p(t,i,a);e.dataset.theme=r.theme.id,Object.entries(_(u(r.accent,r.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",r.secondary);let d=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});d.setAttribute("content",r.theme.dark?r.theme.canvas:r.theme.surface),d.parentNode||document.head.appendChild(d)},[n,t,i,a])}],33405)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),i=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),i=new Date,a=i.getFullYear()-t.getFullYear(),n=i.getMonth()-t.getMonth();return(n<0||0===n&&i.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,a,"dayName",0,i,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),i=new Date(s);return i.setDate(i.getDate()+1),[s.toISOString(),i.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let i=s(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(i),n=e=>a.find(t=>t.type===e)?.value??"";return`${n("year")}-${n("month")}-${n("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),n=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?i(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toDateInput",0,function(e){if(null==e||""===e)return"";if(e instanceof Date){if(Number.isNaN(e.getTime()))return"";let t=0===e.getUTCHours()&&0===e.getUTCMinutes()&&0===e.getUTCSeconds()&&0===e.getUTCMilliseconds(),s=t?e.getUTCFullYear():e.getFullYear(),i=(t?e.getUTCMonth():e.getMonth())+1,a=t?e.getUTCDate():e.getDate();return`${String(s).padStart(4,"0")}-${String(i).padStart(2,"0")}-${String(a).padStart(2,"0")}`}let t=String(e);return/^\d{4}-\d{2}-\d{2}/.test(t)?t.slice(0,10):""},"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let i=new Date(t);return i.setDate(i.getDate()+7),[t.toISOString(),i.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),i=e.i(31502);function a(e,n,r=[],d){let{session:o}=(0,i.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,s.readAs)(o,n,r),staleTime:15e3,...d})}e.s(["useRow",0,function(e,t,s=[]){let i=a(e,t,s);return{...i,data:i.data?.[0]}},"useRows",0,a])},27389,e=>{"use strict";let t=`
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
select f.id, f.headline, f.going_well, f.work_on, f.created_at, f.shared_at, f.edited_at,
       c.name as class_name, sm.display_name as author, ds.name as style, f.class_id,
       r.title as resource_title, r.url as resource_url,
       s.first_name || ' ' || s.last_name as student_name, s.id as student_id
  from feedback_note f
  join student s on s.id = f.student_id
  left join class c on c.id = f.class_id
  left join dance_style ds on ds.id = c.dance_style_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
  left join staff_member sm on sm.id = f.author_id
 where f.deleted_at is null and f.shared_at is not null
 order by f.shared_at desc`,i=`
select ev.id, ev.kind, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.venue,
       ev.cost_minor, ev.capacity, ev.entries_close_on, ev.requests_open,
       sm.display_name as teacher, ev.student_id,
       app.event_places(ev.id) as going,
       -- Each of my children on this event, with their own status (UR-50).
       -- RLS keeps event_participant to my own children.
       coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'student_id', s.id, 'first_name', s.first_name, 'status', p.status::text)
                                  order by s.date_of_birth)
                   from event_participant p join student s on s.id = p.student_id
                  where p.event_id = ev.id and p.deleted_at is null), '[]') as mine,
       (select p.status::text from event_participant p
         where p.event_id = ev.id and p.deleted_at is null
         order by array_position(array['confirmed','invited','requested','waitlisted','declined','withdrawn'], p.status::text) limit 1) as my_status,
       (select string_agg(s.first_name, ' & ' order by s.date_of_birth) from event_participant p join student s on s.id = p.student_id
         where p.event_id = ev.id and p.deleted_at is null and p.status not in ('declined', 'withdrawn')) as my_student,
       (select p.id from event_participant p where p.event_id = ev.id and p.deleted_at is null
           and p.status = 'invited' limit 1) as my_invite,
       coalesce((select jsonb_agg(jsonb_build_object('subject', cm.subject, 'body', cm.body, 'sent_at', cm.sent_at) order by cm.sent_at desc)
                   from communication cm where cm.event_id = ev.id and cm.deleted_at is null), '[]') as notices,
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
 order by (a.id is null), r.kind, r.created_at desc`,h=`
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
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,_,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,m,"CLASS_RESOURCES",0,f,"CREATE_RESOURCE",0,h,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_REQUESTS",0,n,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,d,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,l,"RAISE_REQUEST",0,r,"REQUEST_PLACE",0,a,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,o])},33204,e=>{"use strict";let t=`
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
       c.private_to is not null as private, app.sender_name(c.private_to, c.studio_id) as private_name,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,i=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,a=`
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`,n=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,r=`
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
insert into communication (studio_id, kind, channel, family_id, body, reply_to)
select studio_id, 'direct', 'in_app', id, btrim($2), $3::uuid from family where id = $1
returning id`,u=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_at)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from family where id = $1
returning id`,_=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,f=`
insert into communication (studio_id, kind, channel, subject, body)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2) from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,h=`
insert into communication (studio_id, kind, channel, subject, body, sent_at)
select studio_id, 'studio_announcement', 'in_app', nullif(btrim($1), ''), btrim($2), $3::timestamptz from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,p=`
select app.release_scheduled(m.studio_id) as n from membership m
 where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, reply_to)
select studio_id, 'direct', 'in_app', family_id, nullif(btrim($1), ''), btrim($2), $3::uuid
  from guardian where user_id = auth.uid() and deleted_at is null and app.in_scope(studio_id)
 limit 1 returning id`,b=`
select id, kind, title, body, href, read_at, created_at from notification
 where deleted_at is null order by created_at desc limit 40`,g=`
select count(*)::int as n from notification where deleted_at is null and read_at is null`,v=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,w=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,S=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,n,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,d,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,i,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,b,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,S,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,p,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,w,"SEND_CLASS",0,_,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,u,"SEND_REPLY",0,c,"SEND_STUDIO",0,f,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,y,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,r,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,g,"UPDATE_TEMPLATE",0,o])},36261,e=>{"use strict";let t=`select id, kind, label, position, band, sticker from feedback_chip where class_id is null
                       order by band, kind, position, label`,s=`
insert into feedback_chip (studio_id, kind, label, position)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'standard'), 1)
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,i=`
insert into feedback_chip (studio_id, kind, label, position, band, sticker)
select m.studio_id, $1, btrim($2), coalesce((select max(position) + 1 from feedback_chip where kind = $1 and class_id is null and band = 'under_8'), 1),
       'under_8', nullif(btrim($3), '')
  from membership m where m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.deleted_at is null limit 1 returning id`,a=`select c.id, c.tracking_depth, app.class_depth(c.id) as depth, c.age_min, c.age_max,
       app.age_band_depth(c.age_max) as default_depth from class c where c.id = $1`,n=`
select f.id, f.name, ds.name as style,
       coalesce((select jsonb_agg(jsonb_build_object('id', fs.id, 'name', fs.name, 'position', fs.position) order by fs.position)
                   from framework_skill fs where fs.framework_id = f.id and fs.deleted_at is null), '[]') as skills
  from skill_framework f left join dance_style ds on ds.id = f.dance_style_id
 where f.deleted_at is null order by ds.name`,r=`
insert into framework_skill (studio_id, framework_id, name, position)
select f.studio_id, f.id, btrim($2), coalesce((select max(position) + 1 from framework_skill where framework_id = f.id), 1)
  from skill_framework f where f.id = $1 returning id`,d=`
with cs as (select * from class_session where id = $1),
kids as (
  select e.student_id, null::text as visiting, 0 as pri from cs
    join enrolment e on e.class_id = cs.class_id and e.deleted_at is null
         and (e.status = 'active' or e.ended_on >= cs.starts_at::date)
  union all
  select t.student_id, 'trial', 1 from cs join trial t on t.session_id = cs.id and t.student_id is not null
         and t.deleted_at is null and t.status in ('booked', 'attended', 'converted')
  union all
  select d.student_id, 'drop_in', 2 from cs join drop_in_booking d on d.session_id = cs.id and d.status = 'booked'
),
one as (select distinct on (student_id) student_id, visiting from kids order by student_id, pri)
select s.id as student_id, s.first_name, s.last_name, a.status::text as status, one.visiting,
       f.going_well, f.work_on, f.shared_at is not null as shared, f.edited_at,
       f.going_well_chips, f.work_on_chips, f.note, f.work_on_note, f.work_on_resource_id
  from one
  join cs on true
  join student s on s.id = one.student_id and s.deleted_at is null
  left join attendance_record a on a.session_id = cs.id and a.student_id = s.id and a.deleted_at is null
  left join feedback_note f on f.session_id = cs.id and f.student_id = s.id and f.deleted_at is null
 order by (a.status in ('present', 'late', 'trial')) desc nulls last, s.first_name`,o=`
select f.student_id, f.going_well_chips, f.work_on_chips, p.starts_at
  from class_session me
  join lateral (select cs.id, cs.starts_at from class_session cs
                 where cs.class_id = me.class_id and cs.starts_at < me.starts_at and cs.deleted_at is null
                   and exists (select 1 from feedback_note f2 where f2.session_id = cs.id and f2.deleted_at is null)
                 order by cs.starts_at desc limit 1) p on true
  join feedback_note f on f.session_id = p.id and f.deleted_at is null
 where me.id = $1`,l=`
select f.id, f.going_well, f.work_on, coalesce(cs.starts_at, f.shared_at, f.created_at) as at, c.name as class_name,
       f.shared_at is not null as shared, r.title as resource_title
  from feedback_note f
  left join class_session cs on cs.id = f.session_id
  left join class c on c.id = f.class_id
  left join resource r on r.id = f.work_on_resource_id and r.deleted_at is null
 where f.student_id = $1 and f.deleted_at is null and (f.going_well is not null or f.work_on is not null)
   and f.session_id is distinct from $2::uuid
 order by coalesce(cs.starts_at, f.created_at) desc limit 1`,c=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.class_id = $1 and r.deleted_at is null order by s.first_name`,u=`
select r.id, r.student_id, s.first_name || ' ' || s.last_name as student_name, c.name as class_name, t.name as term_name,
       r.summary, r.comment, r.status, r.shared_at
  from progress_report r join student s on s.id = r.student_id join term t on t.id = r.term_id
  left join class c on c.id = r.class_id
 where r.deleted_at is null and r.status = 'shared' order by r.shared_at desc`,_=`select id, student_id, text, status, review_note, created_at from student_goal
                       where student_id = $1 and deleted_at is null order by created_at desc`,m=`
select r.id, r.mood, r.text, r.created_at, c.name as class_name from student_reflection r
  left join class_session cs on cs.id = r.session_id left join class c on c.id = cs.class_id
 where r.student_id = $1 and r.deleted_at is null order by r.created_at desc limit 20`,f=`
select cs.id, c.name, cs.starts_at from attendance_record a join class_session cs on cs.id = a.session_id
  join class c on c.id = cs.class_id
 where a.student_id = app.student_self_id() and a.status in ('present', 'late') and a.deleted_at is null
   and cs.starts_at > now() - interval '14 days'
   and not exists (select 1 from student_reflection r where r.session_id = cs.id and r.deleted_at is null)
 order by cs.starts_at desc limit 5`;e.s(["ADD_CHIP",0,s,"ADD_CLASS_CHIP",0,"select app.add_class_chip($1, $2, $3, $4) as id","ADD_REFLECTION",0,"select app.add_reflection($1, $2, $3) as id","ADD_SKILL",0,r,"ADD_YOUNG_CHIP",0,i,"CHIPS",0,t,"CLASS_CHIPS",0,"select * from app.class_chips($1)","CLASS_DEPTH",0,a,"CLASS_REPORTS",0,c,"DEPTHS",0,[{key:"notes",label:"Notes",hint:"Feedback notes only. No skill levels."},{key:"notes_skills",label:"Notes and skills",hint:"Notes and current skill levels."},{key:"full",label:"Full",hint:"Notes, skill levels and their history over time."}],"DRAFT_REPORTS",0,"select app.draft_class_reports($1) as n","FRAMEWORKS",0,n,"GOALS",0,_,"LAST_FEEDBACK",0,l,"LEVELS",0,[{key:"not_started",label:"Not started",short:"–"},{key:"developing",label:"Developing",short:"D"},{key:"secure",label:"Secure",short:"S"},{key:"mastered",label:"Mastered",short:"M"}],"MILESTONES",0,"select id, kind, title, reached_on from milestone where student_id = $1 order by reached_on desc","MOODS",0,["😣","😕","😐","🙂","🤩"],"MY_RECENT_CLASSES",0,f,"MY_REPORTS",0,u,"PREVIOUS_SESSION_CHIPS",0,o,"PROPOSE_GOAL",0,"insert into student_goal (student_id, text, status, proposed_by) values ($1, btrim($2), $3, auth.uid()) returning id","RECORD_SKILL",0,"select app.record_skill($1, $2, $3::assessment_level, $4) as id","REFLECTIONS",0,m,"REMOVE_CHIP",0,"select app.soft_delete('feedback_chip', $1)","REMOVE_CLASS_CHIP",0,"select app.remove_class_chip($1, $2, $3) as ok","REMOVE_SKILL",0,"select app.soft_delete('framework_skill', $1)","RENAME_SKILL",0,"update framework_skill set name = btrim($2), updated_at = now() where id = $1 returning id","RESET_CLASS_CHIPS",0,"select app.reset_class_chips($1) as n","SAVE_CLASS_FEEDBACK",0,"select app.save_class_feedback($1, $2::jsonb, $3) as n","SESSION_FEEDBACK",0,d,"SET_CLASS_DEPTH",0,"select app.set_class_depth($1, $2) as depth","SET_GOAL",0,"update student_goal set status = $2, review_note = coalesce(nullif(btrim($3), ''), review_note), updated_at = now() where id = $1 returning id","SET_REPORT_COMMENT",0,"update progress_report set comment = nullif(btrim($2), ''), updated_at = now() where id = $1 returning id","SET_SKILL_DEMO",0,"select app.set_skill_demo($1, nullif(btrim($2), ''))","SET_SKILL_PUBLISH",0,"select app.set_skill_publish($1, $2) as mode","SET_SKILL_TRACKING",0,"select app.set_skill_tracking($1, $2) as tracked","SET_SUPPORT_NOTE",0,"select app.set_support_note($1, $2) as ok","SHARE_REPORTS",0,"select app.share_reports($1::uuid[]) as n","SHARE_SESSION_FEEDBACK",0,"select app.share_session_feedback($1) as n","SHARE_SKILLS",0,"select app.share_skills($1) as n","SKILL_DEMOS",0,"select id, demo_url from framework_skill where demo_url is not null and deleted_at is null","SKILL_HISTORY",0,"select * from app.skill_history($1)","SKILL_PUBLISH",0,"select id, skill_publish from studio where id in (select app.studio_ids()) limit 1","STUDENT_SKILLS",0,"select * from app.student_skills($1)","SUPPORT_NEEDS",0,"select * from app.support_needs()","TIMELINE",0,"select * from app.student_timeline($1) limit 200","UNSHARED_SKILLS",0,"select count(*)::int as n from skill_assessment where student_id = $1 and published_at is null and deleted_at is null"])}]);