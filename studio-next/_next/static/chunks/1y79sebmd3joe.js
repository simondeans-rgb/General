(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var i=e.i(12598),n=e.i(71645);let a=n.createContext(!1);a.Provider,e.i(43476);let r=n.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var s=e.i(19273),d=e.i(40143),o=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#i=void 0;#n=void 0;#a;#r;#s;#d;#o;#l;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#s=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),f(this.#t,this.options)?this.#f():this.updateResult(),this.#h())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return h(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return h(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,i=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,s.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,s.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let n=this.hasListeners();n&&p(this.#t,i,this.options,t)&&this.#f(),this.updateResult(),n&&(this.#t!==i||(0,s.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,s.resolveQueryBoolean)(t.enabled,this.#t)||(0,s.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,s.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let a=this.#v();n&&(this.#t!==i||(0,s.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,s.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#m)&&this.#E(a)}getOptimisticResult(e){var t,i;let n=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(n,e);return t=this,i=a,(0,s.shallowEqualObjects)(t.getCurrentResult(),i)||(this.#n=a,this.#r=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#n}trackResult(e,t){return new Proxy(e,{get:(e,i)=>(this.trackProp(i),t?.(i),Reflect.get(e,i))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,i=this.#e.defaultQueryOptions(e),n=this.#e.getQueryCache().build(this.#e,i),a=()=>{},r=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===n.queryHash&&void 0!==n.state.data&&(a(),e(this.createResult(n,i)))})});return Promise.race([n.fetch().then(()=>{let e=this.createResult(n,i);return t?.(e),e}).finally(()=>{a()}),r])}fetch(e){return this.#f({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#n))}#f(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(s.noop)),t}#g(){this.#p();let e=(0,s.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#n.isStale||!(0,s.isValidTimeout)(e))return;let t=(0,s.timeUntilStale)(this.#n.dataUpdatedAt,e)+1;this.#c=o.timeoutManager.setTimeout(()=>{this.#n.isStale||this.updateResult()},t)}#v(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#E(e){this.#y(),this.#m=e,!l.environmentManager.isServer()&&!1!==(0,s.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,s.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#f()},this.#m))}#h(){this.#g(),this.#E(this.#v())}#p(){void 0!==this.#c&&(o.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let i,n=this.#t,a=this.options,r=this.#n,d=this.#a,o=this.#r,l=e!==n?e.state:this.#i,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let i=this.hasListeners(),r=!i&&f(e,t),s=i&&p(e,n,t,a);(r||s)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:h,errorUpdatedAt:b,status:g}=u;i=u.data;let v=!1;if(void 0!==t.placeholderData&&void 0===i&&"pending"===g){let e;r?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=r.data,v=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(g="success",i=(0,s.replaceData)(r?.data,e,t),_=!0)}if(t.select&&void 0!==i&&!v)if(r&&i===d?.data&&t.select===this.#d)i=this.#o;else try{this.#d=t.select,i=t.select(i),i=(0,s.replaceData)(r?.data,i,t),this.#o=i,this.#s=null}catch(e){this.#s=e}else void 0===i&&(this.#s=null);this.#s&&(h=this.#s,i=this.#o,b=Date.now(),g="error",_=!1);let E="fetching"===u.fetchStatus,w="pending"===g,I="error"===g,R=w&&E,S=void 0!==i;return{status:g,fetchStatus:u.fetchStatus,isPending:w,isSuccess:"success"===g,isError:I,isInitialLoading:R,isLoading:R,data:i,dataUpdatedAt:u.dataUpdatedAt,error:h,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:E,isRefetching:E&&!w,isLoadingError:I&&!S,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:I&&S,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,s.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#n,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#r=this.options,void 0!==this.#a.data&&(this.#l=this.#t),(0,s.shallowEqualObjects)(t,e))return;this.#n=t;let i=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,i="function"==typeof t?t():t;if("all"===i||!i&&!this.#_.size)return!0;let n=new Set(i??this.#_);return this.options.throwOnError&&n.add("error"),Object.keys(this.#n).some(t=>this.#n[t]!==e[t]&&n.has(t))};this.#w({listeners:i()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#i=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#h()}#w(e){d.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#n)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function f(e,t){return!1!==(0,s.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,s.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&h(e,t,t.refetchOnMount)}function h(e,t,i){if(!1!==(0,s.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,s.resolveStaleTime)(t.staleTime,e)){let n="function"==typeof i?i(e):i;return"always"===n||!1!==n&&y(e,t)}return!1}function p(e,t,i,n){return(e!==t||!1===(0,s.resolveQueryBoolean)(n.enabled,e))&&(!i.suspense||"error"!==e.state.status)&&y(e,i)}function y(e,t){return!1!==(0,s.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,s.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let l,c=n.useContext(a),u=n.useContext(r),m=(0,i.useQueryClient)(o),_=m.defaultQueryOptions(e),f=m.getQueryCache().get(_.queryHash),h=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":h?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...i)=>e(t(...i)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}l=f?.state.error&&"function"==typeof _.throwOnError?(0,s.shouldThrowError)(_.throwOnError,[f.state.error,f]):_.throwOnError,(_.suspense||l)&&!u.isReset()&&(_.retryOnMount=!1),n.useEffect(()=>{u.clearReset()},[u]);let[p]=n.useState(()=>new t(m,_)),y=p.getOptimisticResult(_),b=!c&&h;if(n.useSyncExternalStore(n.useCallback(e=>{let t=b?p.subscribe(d.notifyManager.batchCalls(e)):s.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),n.useEffect(()=>{p.setOptions(_)},[_,p]),_?.suspense&&y.isPending)throw p.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:i,query:n,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&n&&(a&&void 0===e.data||(0,s.shouldThrowError)(i,[e.error,n])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:f,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:p.trackResult(y)}(e,_,t)}],66027)},72520,e=>{"use strict";let t=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],72520)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),i=e.i(71645),n=e.i(87338);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let r=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),s=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function d(e){let[t,i,n]=r(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*i+.0722*n}function o(e,t){let[i,n]=[d(e),d(t)].sort((e,t)=>t-e);return(i+.05)/(n+.05)}function l([e,t,i]){let n=Math.max(e/=255,t/=255,i/=255),a=Math.min(e,t,i),r=(n+a)/2;if(n===a)return[0,0,r];let s=n-a;return[(n===e?(t-i)/s+6*(t<i):n===t?(i-e)/s+2:(e-t)/s+4)/6,r>.5?s/(2-n-a):s/(n+a),r]}function c([e,t,i]){if(0===t)return s([255*i,255*i,255*i]);let n=i<.5?i*(1+t):i+t-i*t,a=2*i-n,r=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(n-a)*6*e:e<.5?n:e<2/3?a+(n-a)*(2/3-e)*6:a;return s([255*r(e+1/3),255*r(e),255*r(e-1/3)])}function u(e,t="#ffffff"){var i;let n,m,_=a(e)??"#2638f0",f=.18>d(a(t)??"#ffffff"),h=4.5>o(_,"#ffffff"),[p,y,b]=l(r(_)),g=c([p,y,h?Math.min(1,b+.08):Math.max(0,b-.07)]),v=(i=f?.82:.9,n=r(_),m=r(t),s([0,1,2].map(e=>n[e]*(1-i)+m[e]*i))),E=(e,t,i)=>f?function(e,t,i){let[n,a,s]=l(r(e)),d=e;for(;o(d,t)<i&&s<1;)d=c([n,a,s=Math.min(1,s+.01)]);return d}(e,t,i):function(e,t,i){let[n,a,s]=l(r(e)),d=e;for(;o(d,t)<i&&s>0;)d=c([n,a,s=Math.max(0,s-.01)]);return d}(e,t,i),w=E(_,v,4.5),I=E(_,t,4.5),R=E(_,t,3);return{accent:_,onAccent:h?"#000000":"#ffffff",hover:g,soft:v,ink:w,text:I,line:R,darkText:h,textDeepened:I!==_}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),_=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,_,"normaliseHex",0,a,"paletteFor",0,u],54626);let f={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},h=e=>f["urban"===e?"urban":"classic"];function p(e,t,i){let n=h(e);return{theme:n,accent:a(t)??n.accent,secondary:a(i)??n.secondary}}e.s(["THEMES",0,f,"schoolColours",0,p,"themeOf",0,h],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-3",e),children:["powered by",(0,t.jsx)(n.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(n.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:i,children:n}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${i}`,className:"aspect-[16/7] w-full object-cover"}),n&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:n})]}):null},"SchoolMark",0,function({name:e,logo:i,className:n}){return i?(0,t.jsx)("img",{src:i,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",n)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[0.8125rem] font-semibold text-on-accent",n),children:_(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,n=e?.brand_colour??null,a=e?.brand_secondary??null,r=!!e;i.useEffect(()=>{let e=document.documentElement,i=[...Object.keys(m(u(null))),"--color-secondary"];if(!r){i.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let s=p(t,n,a);e.dataset.theme=s.theme.id,Object.entries(m(u(s.accent,s.theme.surface))).forEach(([t,i])=>e.style.setProperty(t,i)),e.style.setProperty("--color-secondary",s.secondary);let d=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});d.setAttribute("content",s.theme.dark?s.theme.canvas:s.theme.surface),d.parentNode||document.head.appendChild(d)},[r,t,n,a])}],33405)},75379,e=>{"use strict";let t="Europe/London",i=e=>e instanceof Date?e:new Date(e),n=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(i(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(i(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=i(e),n=new Date,a=n.getFullYear()-t.getFullYear(),r=n.getMonth()-t.getMonth();return(r<0||0===r&&n.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(i(e)),"dateShort",0,a,"dayName",0,n,"dayRange",0,function(e=0){let t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),n=new Date(i);return n.setDate(n.getDate()+1),[i.toISOString(),n.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let n=i(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(n),r=e=>a.find(t=>t.type===e)?.value??"";return`${r("year")}-${r("month")}-${r("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=i(e),r=new Date,s=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(r.getFullYear(),r.getMonth(),r.getDate()))/864e5);return 0===s?"Today":1===s?"Tomorrow":-1===s?"Yesterday":s>1&&s<7?n(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(i(e)),"toDateInput",0,function(e){if(null==e||""===e)return"";if(e instanceof Date){if(Number.isNaN(e.getTime()))return"";let t=0===e.getUTCHours()&&0===e.getUTCMinutes()&&0===e.getUTCSeconds()&&0===e.getUTCMilliseconds(),i=t?e.getUTCFullYear():e.getFullYear(),n=(t?e.getUTCMonth():e.getMonth())+1,a=t?e.getUTCDate():e.getDate();return`${String(i).padStart(4,"0")}-${String(n).padStart(2,"0")}-${String(a).padStart(2,"0")}`}let t=String(e);return/^\d{4}-\d{2}-\d{2}/.test(t)?t.slice(0,10):""},"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),i=(t.getDay()+6)%7;t.setDate(t.getDate()-i),t.setHours(0,0,0,0);let n=new Date(t);return n.setDate(n.getDate()+7),[t.toISOString(),n.toISOString()]}])},90514,e=>{"use strict";var t=e.i(47167);e.s(["cardPaymentsEnabled",0,()=>"stripe"===t.default.env.NEXT_PUBLIC_PAYMENTS_PROVIDER])},13927,e=>{"use strict";var t=e.i(66027),i=e.i(30224),n=e.i(31502);function a(e,r,s=[],d){let{session:o}=(0,n.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,i.readAs)(o,r,s),staleTime:15e3,...d})}e.s(["useRow",0,function(e,t,i=[]){let n=a(e,t,i);return{...n,data:n.data?.[0]}},"useRows",0,a])},50293,e=>{"use strict";let t=`
select
  coalesce((select sum(balance_minor) from family where deleted_at is null and balance_minor > 0), 0)::bigint as outstanding_minor,
  (select count(*)::int from family where deleted_at is null and balance_minor > 0) as owing_families,
  coalesce((select sum(total_minor - paid_minor) from invoice where deleted_at is null
             and status in ('issued','part_paid','refunded') and due_on < current_date), 0)::bigint as overdue_minor,
  (select count(*)::int from invoice where deleted_at is null
     and status in ('issued','part_paid','refunded') and due_on < current_date) as overdue_invoices,
  (select count(*)::int from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))) as failed_payments,
  coalesce((select sum(p.amount_minor) from payment p where p.deleted_at is null and p.failure_code is not null
     and p.succeeded_at is null and exists (select 1 from invoice i where i.id = p.invoice_id
       and i.status in ('issued','part_paid'))), 0)::bigint as failed_minor,
  coalesce((select sum(amount_minor - refunded_minor) from payment where deleted_at is null
     and succeeded_at >= now() - interval '30 days' and method not in ('account','credit')), 0)::bigint
     as collected_30d_minor,
  coalesce((select -sum(balance_minor) from family where deleted_at is null and balance_minor < 0), 0)::bigint as credit_minor`,i=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       f.id as family_id, f.name as family_name,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue,
       exists (select 1 from payment p where p.invoice_id = i.id and p.deleted_at is null
                and p.failure_code is not null and p.succeeded_at is null)
         and i.status in ('issued','part_paid') as failed,
       (select string_agg(description, ', ' order by created_at) from invoice_item it
         where it.invoice_id = i.id and it.deleted_at is null) as lines
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null
 order by (i.status = 'draft') desc,
          (i.status in ('issued','part_paid','refunded')) desc,
          i.due_on desc nulls last, i.number desc`,n=`
select i.id, i.number, i.status, i.issued_on, i.due_on, i.total_minor, i.paid_minor,
       i.subtotal_minor, i.discount_minor, i.note, i.void_reason,
       f.id as family_id, f.name as family_name, f.balance_minor as family_balance_minor,
       app.family_available_credit(f.id) as available_credit_minor,
       (i.status in ('issued','part_paid','refunded') and i.due_on < current_date) as overdue
  from invoice i join family f on f.id = i.family_id
 where i.id = $1`,a=`
select it.id, it.kind, it.description, it.quantity, it.unit_minor, it.discount_minor, it.total_minor,
       s.first_name as student_name
  from invoice_item it left join student s on s.id = it.student_id
 where it.invoice_id = $1 and it.deleted_at is null
 order by it.created_at`,r=`
select id, amount_minor, refunded_minor, method, provider, failure_code, succeeded_at, created_at, note, credit_note_id
  from payment where invoice_id = $1 and deleted_at is null
 order by created_at`,s=`
select f.id, f.name, f.balance_minor,
       (select g.full_name from guardian g
         where g.family_id = f.id and g.deleted_at is null order by g.is_primary desc limit 1) as guardian
  from family f where f.deleted_at is null order by f.name`,d=`
select s.id as student_id, s.first_name as student_name, c.id as class_id, c.name as class_name,
       coalesce(e.price_minor, c.price_minor) as price_minor, c.pricing
  from enrolment e
  join student s on s.id = e.student_id
  join class c on c.id = e.class_id
 where s.family_id = $1 and e.status = 'active' and e.deleted_at is null and c.deleted_at is null
 order by s.first_name, c.name`,o=`
select id, number, amount_minor, reason, applied_minor, refunded_minor, account_minor, created_at
  from credit_note where invoice_id = $1 order by created_at`,l=`
select f.id, f.name, f.balance_minor, app.family_available_credit(f.id) as credit_minor,
       coalesce((select sum(total_minor - paid_minor) from invoice i where i.family_id = f.id and i.deleted_at is null
                  and i.status in ('issued','part_paid','refunded')), 0)::bigint as open_minor,
       app.payment_reference(f.name, f.id) as reference
  from family f where f.id = $1 and f.deleted_at is null`,c=`
with l as (
  select i.created_at as at, coalesce(i.issued_on, i.created_at::date) as on_date, 'invoice' as kind, i.number as ref,
         (select string_agg(it.description, ', ' order by it.created_at) from invoice_item it
           where it.invoice_id = i.id and it.deleted_at is null) as detail,
         i.total_minor as amount_minor
    from invoice i where i.family_id = $1 and i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'payment', i.number, p.method, -p.amount_minor
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method in ('card', 'direct_debit', 'bank_transfer', 'cash')
  union all
  select p.succeeded_at, p.succeeded_at::date, 'credit', null, p.note, -p.amount_minor
    from payment p where p.family_id = $1 and p.deleted_at is null and p.succeeded_at is not null
     and p.method = 'credit' and p.credit_note_id is null
  union all
  select cn.created_at, cn.created_at::date, 'credit_note', cn.number, i.number || ' \xb7 ' || cn.reason, -cn.amount_minor
    from credit_note cn join invoice i on i.id = cn.invoice_id where cn.family_id = $1
  union all
  select r.created_at, r.created_at::date, 'refund', i.number, r.reason, r.amount_minor
    from refund r join payment p on p.id = r.payment_id left join invoice i on i.id = p.invoice_id
   where r.family_id = $1
  union all
  -- Refunds from before they were itemised, and card refunds from the provider.
  select p.updated_at, p.updated_at::date, 'refund', i.number, null,
         p.refunded_minor - coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
    from payment p left join invoice i on i.id = p.invoice_id
   where p.family_id = $1 and p.deleted_at is null
     and p.refunded_minor > coalesce((select sum(r.amount_minor) from refund r where r.payment_id = p.id), 0)
)
select on_date, kind, ref, detail, amount_minor,
       sum(amount_minor) over (order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)
                               rows unbounded preceding) as balance_minor
  from l order by at, array_position(array['invoice','payment','credit','credit_note','refund'], kind)`,u=`
select f.id as family_id, f.name as family_name, sum(i.total_minor - i.paid_minor)::bigint as overdue_minor,
       string_agg(i.number, ', ' order by i.due_on, i.number) as invoices, min(i.due_on) as oldest_due,
       app.last_payment_reminder(f.id) as last_reminded,
       exists (select 1 from guardian g where g.family_id = f.id and g.user_id is not null and g.deleted_at is null) as uses_app
  from invoice i join family f on f.id = i.family_id
 where i.deleted_at is null and i.status in ('issued','part_paid','refunded')
   and i.total_minor > i.paid_minor and i.due_on < current_date
 group by f.id, f.name order by min(i.due_on), f.name`,m=`
select app.fill_payment_reminder($1, $2) as subject, app.fill_payment_reminder($1, $3) as body`,_=`
select b.studio_id, b.payee_name, b.sort_code, b.account_number, b.iban, b.updated_at
  from studio_bank_details b where b.studio_id = $1`,f=`
select f.id as family_id, app.payment_reference(f.name, f.id) as reference,
       b.payee_name, b.sort_code, b.account_number, b.iban
  from family f left join studio_bank_details b on b.studio_id = f.studio_id
 where f.deleted_at is null and f.id in (select app.guardian_family_ids())
 order by f.created_at limit 1`,h=`
select subject, body from communication_template
 where name = 'Payment reminder' and deleted_at is null limit 1`,p=`
select split_part(full_name, ' ', 1) as first_name from guardian
 where family_id = $1 and deleted_at is null order by is_primary desc limit 1`,y=`
insert into communication (studio_id, kind, channel, family_id, subject, body, sent_by)
select studio_id, 'direct', 'in_app', id, $2, $3, auth.uid() from family where id = $1
returning id`,b=`
select r.id, t.name as term_name, r.period_month, r.status, r.due_on, r.invoice_count, r.total_minor, r.created_at, r.issued_at
  from billing_run r join term t on t.id = r.term_id
 where r.status <> 'discarded' order by r.created_at desc limit 10`,g=`
select d.id, d.family_id, f.name as family_name, d.kind, d.amount, d.reason, d.note, d.starts_on, d.ends_on
  from family_discount d join family f on f.id = d.family_id
 where d.deleted_at is null and d.ended_at is null and (d.ends_on is null or d.ends_on >= current_date)
 order by f.name`,v=`
insert into family_discount (family_id, kind, amount, reason, note, starts_on, ends_on)
values ($1, $2, $3, $4, nullif($5, ''), coalesce($6::date, current_date), $7::date) returning id`,E=`
with lines as (
  select i.id, i.number, f.name as contact, (select g.email from guardian g where g.family_id = f.id and g.deleted_at is null
            order by g.is_primary desc, g.created_at limit 1) as email,
         coalesce(i.issued_on, i.created_at::date) as inv_date, i.due_on, t.name as term,
         ii.description, ii.quantity, ii.total_minor, ii.created_at, 0 as ord
    from invoice i join family f on f.id = i.family_id join invoice_item ii on ii.invoice_id = i.id and ii.deleted_at is null
    left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void')
  union all
  select i.id, i.number, f.name, null, coalesce(i.issued_on, i.created_at::date), i.due_on, t.name,
         'Discount', 1, -i.discount_minor, i.created_at, 1
    from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
   where i.deleted_at is null and i.status not in ('draft', 'void') and i.discount_minor > 0
  union all
  -- Credit notes: a negative sales invoice, which Xero imports as a credit note.
  select cn.id, cn.number, f.name, null, cn.created_at::date, cn.created_at::date, i.number,
         'Credit note for ' || i.number || ': ' || cn.reason, 1, -cn.amount_minor, cn.created_at, 2
    from credit_note cn join invoice i on i.id = cn.invoice_id join family f on f.id = cn.family_id
)
select contact as "*ContactName", coalesce(email, '') as "EmailAddress", number as "*InvoiceNumber", coalesce(term, '') as "Reference",
       to_char(inv_date, 'DD/MM/YYYY') as "*InvoiceDate", to_char(due_on, 'DD/MM/YYYY') as "*DueDate",
       description as "*Description", quantity as "*Quantity", round(total_minor / quantity / 100.0, 2) as "*UnitAmount",
       '200' as "*AccountCode", 'No VAT' as "*TaxType", 'GBP' as "Currency"
  from lines order by number, ord, created_at`,w=`
select family_name as family, round(current_minor / 100.0, 2) as "0-30 days", round(d31_60 / 100.0, 2) as "31-60 days",
       round(d61_90 / 100.0, 2) as "61-90 days", round(d90_plus / 100.0, 2) as "90+ days", round(total / 100.0, 2) as total
  from app.aged_debt((select id from studio where app.is_admin(id) order by name limit 1))`,I=`
select i.number, f.name as family, i.status::text as status, i.issued_on, i.due_on,
       round(i.subtotal_minor / 100.0, 2) as subtotal, round(i.discount_minor / 100.0, 2) as discount,
       round(i.total_minor / 100.0, 2) as total, round(i.paid_minor / 100.0, 2) as paid,
       round((i.total_minor - i.paid_minor) / 100.0, 2) as outstanding, t.name as term
  from invoice i join family f on f.id = i.family_id left join term t on t.id = i.term_id
 where i.deleted_at is null order by i.number`,R=`
select p.succeeded_at::date as date, f.name as family, i.number as invoice, p.method,
       round(p.amount_minor / 100.0, 2) as amount,
       case when p.failure_code is not null then 'failed' when p.succeeded_at is null then 'pending' else 'succeeded' end as status,
       p.provider_ref as reference
  from payment p join family f on f.id = p.family_id left join invoice i on i.id = p.invoice_id
 where p.deleted_at is null order by p.created_at`;e.s(["ADD_FAMILY_CREDIT",0,"select app.add_family_credit($1, $2, $3) as id","ADD_FAMILY_DISCOUNT",0,v,"AGED_DEBT_EXPORT",0,w,"BANK_DETAILS",0,_,"BILLING_LINES",0,"select * from app.billing_lines($1, $2::date, $3::uuid[])","BILLING_RUNS",0,b,"BILLING_SKIPPED",0,"select * from app.billing_skipped($1, $2::date)","BILLING_TERMS",0,"select id, name, starts_on, ends_on from term where deleted_at is null order by starts_on desc","CREATE_BILLING_RUN",0,"select app.create_billing_run($1, $2::date, $3::date, $4::uuid[], $5) as id","CREATE_INVOICE",0,"select app.create_invoice($1, $2::jsonb, $3::date, $4, $5, $6) as id","DISCARD_BILLING_RUN",0,"select app.discard_billing_run($1)","DISCOUNT_RULES",0,"select id, kind, from_nth, percent, enabled from discount_rule order by kind desc","END_FAMILY_DISCOUNT",0,"select app.end_family_discount($1)","FAMILY_ACCOUNT",0,l,"FAMILY_BILLABLE",0,d,"FAMILY_DISCOUNTS",0,g,"FAMILY_OPTIONS",0,s,"FAMILY_PICK",0,"select id, name from family where deleted_at is null and not is_prospect order by name","FAMILY_STATEMENT",0,c,"INVOICE",0,n,"INVOICES",0,i,"INVOICES_EXPORT",0,I,"INVOICE_CREDIT_NOTES",0,o,"INVOICE_ITEMS",0,a,"INVOICE_PAYMENTS",0,r,"ISSUE_BILLING_RUN",0,"select app.issue_billing_run($1) as n","ISSUE_CREDIT_NOTE",0,"select app.issue_credit_note($1, $2, $3, $4) as id","ISSUE_INVOICE",0,"select app.issue_invoice($1)","MY_PAYMENT_INFO",0,f,"NOTIFY_DUE",0,"select app.notify_invoices_due() as n","OVERDUE_FAMILIES",0,u,"PAYMENTS_EXPORT",0,R,"PRIMARY_GUARDIAN",0,p,"RECORD_PAYMENT",0,"select app.record_payment($1, $2, $3, $4, $5) as id","REFUND_PAYMENT",0,"select app.refund_payment($1, $2, $3, $4)","REMINDER_PREVIEW",0,m,"REMINDER_TEMPLATE",0,h,"SEND_DIRECT",0,y,"SEND_REMINDERS",0,"select app.send_payment_reminders($1::uuid[], $2, $3) as sent","SET_BANK_DETAILS",0,"select app.set_bank_details($1, $2, $3, $4, $5)","SET_DISCOUNT_RULE",0,"update discount_rule set enabled = $2, percent = $3, from_nth = $4 where id = $1 returning id","SUMMARY",0,t,"UPCOMING_COSTS",0,"select * from app.upcoming_costs($1::uuid)","VOID_INVOICE",0,"select app.void_invoice($1, $2)","XERO_EXPORT",0,E])},33204,e=>{"use strict";let t=`
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
       c.private_to is not null as private, app.sender_name(c.private_to, c.studio_id) as private_name,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.family_id = $1 and c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,n=`
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
 limit 60`,r=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,s=`
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
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3) from class where id = $1
returning id`,_=`
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
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,E=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,w=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,r,"CONVERSATION",0,i,"CREATE_TEMPLATE",0,d,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,n,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,b,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,p,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,E,"SEND_CLASS",0,m,"SEND_CLASS_AT",0,_,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,u,"SEND_REPLY",0,c,"SEND_STUDIO",0,f,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,y,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,s,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,g,"UPDATE_TEMPLATE",0,o])}]);