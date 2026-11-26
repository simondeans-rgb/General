(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let r=i.createContext(!1);r.Provider,e.i(43476);let a=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var n=e.i(19273),o=e.i(40143),d=e.i(80166),l=e.i(73911),c=e.i(15823),u=e.i(75555),m=e.i(86491),_=class extends c.Subscribable{#e;#t=void 0;#s=void 0;#i=void 0;#r;#a;#n;#o;#d;#l;#c;#u;#m;#_=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#n=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),h(this.#t,this.options)?this.#h():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,n.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let i=this.hasListeners();i&&p(this.#t,s,this.options,t)&&this.#h(),this.updateResult(),i&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||(0,n.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,n.resolveStaleTime)(t.staleTime,this.#t))&&this.#v();let r=this.#g();i&&(this.#t!==s||(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,n.resolveQueryBoolean)(t.enabled,this.#t)||r!==this.#m)&&this.#w(r)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),r=this.createResult(i,e);return t=this,s=r,(0,n.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#i=r,this.#a=this.options,this.#r=this.#t.state),r}getCurrentResult(){return this.#i}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#_.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),r=()=>{},a=new Promise(e=>{t=e,r=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(r(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{r()}),a])}fetch(e){return this.#h({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#i))}#h(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(n.noop)),t}#v(){this.#p();let e=(0,n.resolveStaleTime)(this.options.staleTime,this.#t);if(l.environmentManager.isServer()||this.#i.isStale||!(0,n.isValidTimeout)(e))return;let t=(0,n.timeUntilStale)(this.#i.dataUpdatedAt,e)+1;this.#c=d.timeoutManager.setTimeout(()=>{this.#i.isStale||this.updateResult()},t)}#g(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#w(e){this.#y(),this.#m=e,!l.environmentManager.isServer()&&!1!==(0,n.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,n.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=d.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#h()},this.#m))}#f(){this.#v(),this.#w(this.#g())}#p(){void 0!==this.#c&&(d.timeoutManager.clearTimeout(this.#c),this.#c=void 0)}#y(){void 0!==this.#u&&(d.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,i=this.#t,r=this.options,a=this.#i,o=this.#r,d=this.#a,l=e!==i?e.state:this.#s,{state:c}=e,u={...c},_=!1;if(t._optimisticResults){let s=this.hasListeners(),a=!s&&h(e,t),n=s&&p(e,i,t,r);(a||n)&&(u={...u,...(0,m.fetchState)(c.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:v}=u;s=u.data;let g=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===v){let e;a?.isPlaceholderData&&t.placeholderData===d?.placeholderData?(e=a.data,g=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#l?.state.data,this.#l):t.placeholderData,void 0!==e&&(v="success",s=(0,n.replaceData)(a?.data,e,t),_=!0)}if(t.select&&void 0!==s&&!g)if(a&&s===o?.data&&t.select===this.#o)s=this.#d;else try{this.#o=t.select,s=t.select(s),s=(0,n.replaceData)(a?.data,s,t),this.#d=s,this.#n=null}catch(e){this.#n=e}else void 0===s&&(this.#n=null);this.#n&&(f=this.#n,s=this.#d,b=Date.now(),v="error",_=!1);let w="fetching"===u.fetchStatus,E="pending"===v,R="error"===v,S=E&&w,T=void 0!==s;return{status:v,fetchStatus:u.fetchStatus,isPending:E,isSuccess:"success"===v,isError:R,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>l.dataUpdateCount||u.errorUpdateCount>l.errorUpdateCount,isFetching:w,isRefetching:w&&!E,isLoadingError:R&&!T,isPaused:"paused"===u.fetchStatus,isPlaceholderData:_,isRefetchError:R&&T,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,n.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#i,t=this.createResult(this.#t,this.options);if(this.#r=this.#t.state,this.#a=this.options,void 0!==this.#r.data&&(this.#l=this.#t),(0,n.shallowEqualObjects)(t,e))return;this.#i=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#_.size)return!0;let i=new Set(s??this.#_);return this.options.throwOnError&&i.add("error"),Object.keys(this.#i).some(t=>this.#i[t]!==e[t]&&i.has(t))};this.#E({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#E(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#i)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function h(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,n.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,n.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function p(e,t,s,i){return(e!==t||!1===(0,n.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,n.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,n.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,d){let l,c=i.useContext(r),u=i.useContext(a),m=(0,s.useQueryClient)(d),_=m.defaultQueryOptions(e),h=m.getQueryCache().get(_.queryHash),f=!1!==e.subscribed;if(_._optimisticResults=c?"isRestoring":f?"optimistic":void 0,_.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=_.staleTime;_.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof _.gcTime&&(_.gcTime=Math.max(_.gcTime,1e3))}l=h?.state.error&&"function"==typeof _.throwOnError?(0,n.shouldThrowError)(_.throwOnError,[h.state.error,h]):_.throwOnError,(_.suspense||l)&&!u.isReset()&&(_.retryOnMount=!1),i.useEffect(()=>{u.clearReset()},[u]);let[p]=i.useState(()=>new t(m,_)),y=p.getOptimisticResult(_),b=!c&&f;if(i.useSyncExternalStore(i.useCallback(e=>{let t=b?p.subscribe(o.notifyManager.batchCalls(e)):n.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),i.useEffect(()=>{p.setOptions(_)},[_,p]),_?.suspense&&y.isPending)throw p.fetchOptimistic(_).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:r})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(r&&void 0===e.data||(0,n.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:u,throwOnError:_.throwOnError,query:h,suspense:_.suspense}))throw y.error;return _.notifyOnChangeProps?y:p.trackResult(y)}(e,_,t)}],66027)},72520,e=>{"use strict";let t=(0,e.i(75254).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",0,t],72520)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},18566,(e,t,s)=>{t.exports=e.r(76562)},28345,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016),r=e.i(13927),a=e.i(45060);e.i(17658);let n={violet:"bg-violet",amber:"bg-amber",teal:"bg-teal",rose:"bg-rose",indigo:"bg-indigo",lime:"bg-lime"};function o({style:e,colour:s,className:i}){return e?(0,t.jsxs)("span",{className:(0,a.cn)("inline-flex items-center gap-1.5 whitespace-nowrap",i),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:(0,a.cn)("inline-block size-2 rounded-[2px]",n[s??""]??"bg-ink-3")}),e]}):null}let d=`
select cs.id, cs.original_starts_at, cs.cancel_reason, cs.changed_at,
       (cs.room_id is not null and cs.room_id is distinct from c.room_id) as room_moved,
       (cs.teacher_id is not null and cs.teacher_id is distinct from c.teacher_id) as covered
  from class_session cs join class c on c.id = cs.class_id
 where cs.id = any($1::uuid[])`;function l({word:e,tone:s="ink"}){return(0,t.jsx)("span",{className:(0,a.cn)("font-display text-[15px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]","critical"===s?"text-critical":"text-ink"),children:e})}e.s(["SessionRow",0,function({time:e,name:s,meta:r,href:n,cancelled:d,reason:c,moved:u,style:m,colour:_,extra:h}){let f=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:(0,a.cn)("font-display text-[19px] leading-tight tnum",d&&"text-ink-3 line-through"),children:e}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsx)("span",{className:(0,a.cn)("block font-semibold leading-snug",d&&"text-ink-3"),children:s}),(0,t.jsxs)("span",{className:"mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3",children:[d&&(0,t.jsx)(l,{word:"Cancelled",tone:"critical"}),!d&&u&&(0,t.jsx)(l,{word:"Moved"}),d&&c?(0,t.jsx)("span",{children:c}):(0,t.jsx)("span",{className:"min-w-0",children:r.filter(Boolean).join(" · ")}),!d&&(0,t.jsx)(o,{style:m??null,colour:_}),h]})]})]}),p="grid min-h-[56px] grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-x-4 py-3";return(0,t.jsx)("li",{children:n?(0,t.jsx)(i.default,{href:n,"aria-label":`${s}, ${e}${d?", cancelled":""}${u?", moved":""}`,className:(0,a.cn)(p,"hover:bg-surface-2/60"),children:f}):(0,t.jsx)("div",{className:p,children:f})})},"StyleMark",0,o,"dayDate",0,function(e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"dueWord",0,function(e){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:"Europe/London"}).format(new Date(e))},"useSessionChanges",0,function(e){let t=[...new Set(e)].sort(),i=(0,r.useRows)(["session-changes",t.join(",")],d,[t],{enabled:t.length>0});return s.useMemo(()=>new Map((i.data??[]).map(e=>[e.id,e])),[i.data])}])},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(87338);function r(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let a=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function o(e){let[t,s,i]=a(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*i}function d(e,t){let[s,i]=[o(e),o(t)].sort((e,t)=>t-e);return(s+.05)/(i+.05)}function l([e,t,s]){let i=Math.max(e/=255,t/=255,s/=255),r=Math.min(e,t,s),a=(i+r)/2;if(i===r)return[0,0,a];let n=i-r;return[(i===e?(t-s)/n+6*(t<s):i===t?(s-e)/n+2:(e-t)/n+4)/6,a>.5?n/(2-i-r):n/(i+r),a]}function c([e,t,s]){if(0===t)return n([255*s,255*s,255*s]);let i=s<.5?s*(1+t):s+t-s*t,r=2*s-i,a=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?r+(i-r)*6*e:e<.5?i:e<2/3?r+(i-r)*(2/3-e)*6:r;return n([255*a(e+1/3),255*a(e),255*a(e-1/3)])}function u(e,t="#ffffff"){var s;let i,m,_=r(e)??"#2638f0",h=.18>o(r(t)??"#ffffff"),f=4.5>d(_,"#ffffff"),[p,y,b]=l(a(_)),v=c([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),g=(s=h?.82:.9,i=a(_),m=a(t),n([0,1,2].map(e=>i[e]*(1-s)+m[e]*s))),w=(e,t,s)=>h?function(e,t,s){let[i,r,n]=l(a(e)),o=e;for(;d(o,t)<s&&n<1;)o=c([i,r,n=Math.min(1,n+.01)]);return o}(e,t,s):function(e,t,s){let[i,r,n]=l(a(e)),o=e;for(;d(o,t)<s&&n>0;)o=c([i,r,n=Math.max(0,n-.01)]);return o}(e,t,s),E=w(_,g,4.5),R=w(_,t,4.5),S=w(_,t,3);return{accent:_,onAccent:f?"#000000":"#ffffff",hover:v,soft:g,ink:E,text:R,line:S,darkText:f,textDeepened:R!==_}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),_=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,_,"normaliseHex",0,r,"paletteFor",0,u],54626);let h={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>h["urban"===e?"urban":"classic"];function p(e,t,s){let i=f(e);return{theme:i,accent:r(t)??i.accent,secondary:r(s)??i.secondary}}e.s(["THEMES",0,h,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:i}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),i&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:i})]}):null},"SchoolMark",0,function({name:e,logo:s,className:i}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",i)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",i),children:_(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,i=e?.brand_colour??null,r=e?.brand_secondary??null,a=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!a){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let n=p(t,i,r);e.dataset.theme=n.theme.id,Object.entries(m(u(n.accent,n.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",n.secondary);let o=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});o.setAttribute("content",n.theme.dark?n.theme.canvas:n.theme.surface),o.parentNode||document.head.appendChild(o)},[a,t,i,r])}],33405)},40284,e=>{"use strict";var t=e.i(43476),s=e.i(13927),i=e.i(33405);e.s(["MySchoolHero",0,function(){let e=(0,s.useRows)(["school-hero"],"select name, hero_url from studio where app.in_scope(id) order by created_at limit 1",[],{staleTime:6e4}).data?.[0];return e?(0,t.jsx)(i.SchoolHero,{src:e.hero_url,name:e.name}):null}])},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),i=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),r=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),i=new Date,r=i.getFullYear()-t.getFullYear(),a=i.getMonth()-t.getMonth();return(a<0||0===a&&i.getDate()<t.getDate())&&(r-=1),r},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,r,"dayName",0,i,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),i=new Date(s);return i.setDate(i.getDate()+1),[s.toISOString(),i.toISOString()]},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let i=s(e),r=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(i),a=e=>r.find(t=>t.type===e)?.value??"";return`${a("year")}-${a("month")}-${a("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),a=new Date,n=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>1&&n<7?i(t):r(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let i=new Date(t);return i.setDate(i.getDate()+7),[t.toISOString(),i.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),i=e.i(31502);function r(e,a,n=[],o){let{session:d}=(0,i.useSession)();return(0,t.useQuery)({queryKey:["db",d?.userId??"anon",d?.studio??"",...e],queryFn:()=>(0,s.readAs)(d,a,n),staleTime:15e3,...o})}e.s(["useRow",0,function(e,t,s=[]){let i=r(e,t,s);return{...i,data:i.data?.[0]}},"useRows",0,r])},27389,e=>{"use strict";let t=`
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
 order by ev.starts_at`,r=`
insert into event_participant (studio_id, event_id, student_id, status, requested_by, note)
select s.studio_id, $1, s.id, 'requested', auth.uid(), $3
  from student s where s.id = $2
returning id, status`,a=`
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
 order by starts_at`,d=`
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
 order by c.day_of_week, c.start_time`;e.s(["ACK_MEDICAL",0,"select app.acknowledge_medical_update($1, $2::jsonb, $3, $4)","ANSWER_INVITE",0,"select app.answer_invitation($1, $2) as r","ANSWER_REQUEST",0,m,"APPROVE_CHILD",0,"select app.approve_new_child($1) as id","APPROVE_PLACE",0,"select app.approve_class_request($1, $2) as outcome","APPROVE_TRIAL",0,"select app.approve_trial_request($1) as id","ASSIGN_RESOURCE_TO_CLASS",0,p,"CLASS_DETAIL",0,_,"CLASS_RESOURCES",0,h,"CREATE_RESOURCE",0,f,"DECIDE_ENTRY",0,u,"DELETE_RESOURCE",0,y,"EVENTS",0,i,"MY_REQUESTS",0,a,"MY_TEACHING_CLASSES",0,b,"MY_TIMETABLE",0,o,"PENDING_ENTRIES",0,c,"PENDING_REQUESTS",0,l,"RAISE_REQUEST",0,n,"REQUEST_PLACE",0,r,"RESOURCES",0,t,"STUDENT_FEEDBACK",0,s,"WRITE_FEEDBACK",0,d])},33204,e=>{"use strict";let t=`
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
 order by c.sent_at`,i=`
select c.id, c.subject, c.body, c.sent_at, c.inbound, c.reply_to, c.request_id is not null as is_request,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c
 where c.kind = 'direct' and c.deleted_at is null
 order by c.sent_at`,r=`
select c.id, c.kind, c.subject, c.body, c.sent_at, c.class_id, cl.name as class_name, c.sent_at > now() as scheduled,
       app.sender_name(c.sent_by, c.studio_id) as sender,
       exists (select 1 from communication_read r where r.communication_id = c.id
                and r.user_id = auth.uid()) as read_by_me
  from communication c left join class cl on cl.id = c.class_id
 where c.kind in ('class_broadcast', 'studio_announcement') and c.deleted_at is null
 order by c.sent_at desc
 limit 60`,a=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,n=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,o=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,d=`
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
returning id`,m=`
insert into communication (studio_id, kind, channel, class_id, subject, body, sent_at)
select studio_id, 'class_broadcast', 'in_app', id, nullif(btrim($2), ''), btrim($3), $4::timestamptz from class where id = $1
returning id`,_=`
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
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,g=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,w=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,r,"CLASS_AUDIENCES",0,a,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,o,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,i,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,w,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,v,"RUN_AUTOMATIONS",0,g,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,l,"SEND_DIRECT_AT",0,c,"SEND_STUDIO",0,_,"SEND_STUDIO_AT",0,h,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,n,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,d])}]);