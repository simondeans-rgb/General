(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),i=e.i(71645);let a=i.createContext(!1);a.Provider,e.i(43476);let n=i.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),l=e.i(40143),o=e.i(80166),c=e.i(73911),d=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends d.Subscribable{#e;#t=void 0;#s=void 0;#i=void 0;#a;#n;#r;#l;#o;#c;#d;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let i=this.hasListeners();i&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),i&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let a=this.#w();i&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||a!==this.#m)&&this.#x(a)}getOptimisticResult(e){var t,s;let i=this.#e.getQueryCache().build(this.#e,e),a=this.createResult(i,e);return t=this,s=a,(0,r.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#i=a,this.#n=this.options,this.#a=this.#t.state),a}getCurrentResult(){return this.#i}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),i=this.#e.getQueryCache().build(this.#e,s),a=()=>{},n=new Promise(e=>{t=e,a=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===i.queryHash&&void 0!==i.state.data&&(a(),e(this.createResult(i,s)))})});return Promise.race([i.fetch().then(()=>{let e=this.createResult(i,s);return t?.(e),e}).finally(()=>{a()}),n])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#i))}#_(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#p();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(c.environmentManager.isServer()||this.#i.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#i.dataUpdatedAt,e)+1;this.#d=o.timeoutManager.setTimeout(()=>{this.#i.isStale||this.updateResult()},t)}#w(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#x(e){this.#y(),this.#m=e,!c.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=o.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#f(){this.#g(),this.#x(this.#w())}#p(){void 0!==this.#d&&(o.timeoutManager.clearTimeout(this.#d),this.#d=void 0)}#y(){void 0!==this.#u&&(o.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,i=this.#t,a=this.options,n=this.#i,l=this.#a,o=this.#n,c=e!==i?e.state:this.#s,{state:d}=e,u={...d},h=!1;if(t._optimisticResults){let s=this.hasListeners(),n=!s&&_(e,t),r=s&&p(e,i,t,a);(n||r)&&(u={...u,...(0,m.fetchState)(d.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:g}=u;s=u.data;let w=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===g){let e;n?.isPlaceholderData&&t.placeholderData===o?.placeholderData?(e=n.data,w=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#c?.state.data,this.#c):t.placeholderData,void 0!==e&&(g="success",s=(0,r.replaceData)(n?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!w)if(n&&s===l?.data&&t.select===this.#l)s=this.#o;else try{this.#l=t.select,s=t.select(s),s=(0,r.replaceData)(n?.data,s,t),this.#o=s,this.#r=null}catch(e){this.#r=e}else void 0===s&&(this.#r=null);this.#r&&(f=this.#r,s=this.#o,b=Date.now(),g="error",h=!1);let x="fetching"===u.fetchStatus,v="pending"===g,$="error"===g,S=v&&x,E=void 0!==s;return{status:g,fetchStatus:u.fetchStatus,isPending:v,isSuccess:"success"===g,isError:$,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>c.dataUpdateCount||u.errorUpdateCount>c.errorUpdateCount,isFetching:x,isRefetching:x&&!v,isLoadingError:$&&!E,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:$&&E,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#i,t=this.createResult(this.#t,this.options);if(this.#a=this.#t.state,this.#n=this.options,void 0!==this.#a.data&&(this.#c=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#i=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let i=new Set(s??this.#h);return this.options.throwOnError&&i.add("error"),Object.keys(this.#i).some(t=>this.#i[t]!==e[t]&&i.has(t))};this.#v({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#v(e){l.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#i)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let i="function"==typeof s?s(e):s;return"always"===i||!1!==i&&y(e,t)}return!1}function p(e,t,s,i){return(e!==t||!1===(0,r.resolveQueryBoolean)(i.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,o){let c,d=i.useContext(a),u=i.useContext(n),m=(0,s.useQueryClient)(o),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),f=!1!==e.subscribed;if(h._optimisticResults=d?"isRestoring":f?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}c=_?.state.error&&"function"==typeof h.throwOnError?(0,r.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||c)&&!u.isReset()&&(h.retryOnMount=!1),i.useEffect(()=>{u.clearReset()},[u]);let[p]=i.useState(()=>new t(m,h)),y=p.getOptimisticResult(h),b=!d&&f;if(i.useSyncExternalStore(i.useCallback(e=>{let t=b?p.subscribe(l.notifyManager.batchCalls(e)):r.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),i.useEffect(()=>{p.setOptions(h)},[h,p]),h?.suspense&&y.isPending)throw p.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:i,suspense:a})=>e.isError&&!t.isReset()&&!e.isFetching&&i&&(a&&void 0===e.data||(0,r.shouldThrowError)(s,[e.error,i])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:p.trackResult(y)}(e,h,t)}],66027)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],7233)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",0,t],27612)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},18566,(e,t,s)=>{t.exports=e.r(76562)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(87338);function a(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let n=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),r=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function l(e){let[t,s,i]=n(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*i}function o(e,t){let[s,i]=[l(e),l(t)].sort((e,t)=>t-e);return(s+.05)/(i+.05)}function c([e,t,s]){let i=Math.max(e/=255,t/=255,s/=255),a=Math.min(e,t,s),n=(i+a)/2;if(i===a)return[0,0,n];let r=i-a;return[(i===e?(t-s)/r+6*(t<s):i===t?(s-e)/r+2:(e-t)/r+4)/6,n>.5?r/(2-i-a):r/(i+a),n]}function d([e,t,s]){if(0===t)return r([255*s,255*s,255*s]);let i=s<.5?s*(1+t):s+t-s*t,a=2*s-i,n=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?a+(i-a)*6*e:e<.5?i:e<2/3?a+(i-a)*(2/3-e)*6:a;return r([255*n(e+1/3),255*n(e),255*n(e-1/3)])}function u(e,t="#ffffff"){var s;let i,m,h=a(e)??"#2638f0",_=.18>l(a(t)??"#ffffff"),f=4.5>o(h,"#ffffff"),[p,y,b]=c(n(h)),g=d([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),w=(s=_?.82:.9,i=n(h),m=n(t),r([0,1,2].map(e=>i[e]*(1-s)+m[e]*s))),x=(e,t,s)=>_?function(e,t,s){let[i,a,r]=c(n(e)),l=e;for(;o(l,t)<s&&r<1;)l=d([i,a,r=Math.min(1,r+.01)]);return l}(e,t,s):function(e,t,s){let[i,a,r]=c(n(e)),l=e;for(;o(l,t)<s&&r>0;)l=d([i,a,r=Math.max(0,r-.01)]);return l}(e,t,s),v=x(h,w,4.5),$=x(h,t,4.5),S=x(h,t,3);return{accent:h,onAccent:f?"#000000":"#ffffff",hover:g,soft:w,ink:v,text:$,line:S,darkText:f,textDeepened:$!==h}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),h=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,h,"normaliseHex",0,a,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>_["urban"===e?"urban":"classic"];function p(e,t,s){let i=f(e);return{theme:i,accent:a(t)??i.accent,secondary:a(s)??i.secondary}}e.s(["THEMES",0,_,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(i.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:i}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),i&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:i})]}):null},"SchoolMark",0,function({name:e,logo:s,className:i}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",i)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",i),children:h(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,i=e?.brand_colour??null,a=e?.brand_secondary??null,n=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!n){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let r=p(t,i,a);e.dataset.theme=r.theme.id,Object.entries(m(u(r.accent,r.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",r.secondary);let l=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});l.setAttribute("content",r.theme.dark?r.theme.canvas:r.theme.surface),l.parentNode||document.head.appendChild(l)},[n,t,i,a])}],33405)},65712,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(37727),a=e.i(27612),n=e.i(17658);e.s(["RecordSheet",0,function({title:e,subtitle:r,onClose:l,onSave:o,saving:c,error:d,canSave:u=!0,saveLabel:m="Save",onRemove:h,removing:_,removeLabel:f="Remove",removeHint:p,children:y}){let b=s.useId(),g=s.useRef(null),w=s.useRef(l);return w.current=l,s.useEffect(()=>{let e=e=>{"Escape"===e.key&&w.current()};return document.addEventListener("keydown",e),g.current?.querySelector('input, select, textarea, button:not([aria-label="Close"])')?.focus(),()=>document.removeEventListener("keydown",e)},[]),(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6",onClick:l,children:(0,t.jsxs)("div",{ref:g,role:"dialog","aria-modal":"true","aria-labelledby":b,onClick:e=>e.stopPropagation(),className:"flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden\n                   rounded-t-[var(--radius-xl)] border border-line bg-surface shadow-lg\n                   sm:rounded-[var(--radius-xl)]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3 border-b border-line px-5 pb-3 pt-4",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{id:b,className:"font-display text-[20px] leading-tight",children:e}),r&&(0,t.jsx)("p",{className:"mt-1 text-[13.5px] text-ink-3",children:r})]}),(0,t.jsx)(n.Button,{size:"sm",variant:"ghost","aria-label":"Close",onClick:l,className:"-mr-2 -mt-1",children:(0,t.jsx)(i.X,{className:"size-4","aria-hidden":!0})})]}),(0,t.jsxs)("div",{className:"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",children:[(0,t.jsx)("div",{className:"space-y-4",children:y}),null!=d&&(0,t.jsx)("div",{className:"mt-4",children:(0,t.jsx)(n.ErrorState,{error:d})}),h&&(0,t.jsx)("div",{className:"mt-6 border-t border-line pt-4",children:p?(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:p}):(0,t.jsxs)(n.Button,{variant:"danger",size:"sm",loading:_,onClick:h,children:[(0,t.jsx)(a.Trash2,{className:"size-4","aria-hidden":!0})," ",f]})})]}),(0,t.jsxs)("div",{className:"flex gap-2 border-t border-line bg-surface px-5 py-3 pb-safe sm:justify-end",children:[o!==l&&(0,t.jsx)(n.Button,{className:"flex-1 sm:flex-none",variant:"ghost",onClick:l,children:"Cancel"}),(0,t.jsx)(n.Button,{className:"flex-[2] sm:flex-none",variant:"primary",disabled:!u,loading:c,onClick:o,children:m})]})]})})}])},14979,e=>{"use strict";var t=e.i(43476),s=e.i(22016),i=e.i(17658),a=e.i(75379),n=e.i(45060);let r=["violet","amber","teal","rose","indigo","lime"];function l(e){return e&&r.includes(e)?`var(--color-${e})`:"var(--color-line-strong)"}function o({colour:e,name:s,className:i}){return(0,t.jsxs)("span",{className:(0,n.cn)("inline-flex min-w-0 items-center gap-1.5",i),children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"size-2 shrink-0 rounded-[2px]",style:{background:l(e)}}),s&&(0,t.jsx)("span",{className:"truncate",children:s})]})}function c({children:e,tone:s="ink",className:i}){return(0,t.jsx)("span",{className:(0,n.cn)("font-display text-[12px] uppercase leading-none tracking-[0.02em] [font-stretch:85%]",{ink:"text-ink",critical:"text-critical",caution:"text-caution",positive:"text-positive",muted:"text-ink-3"}[s],i),children:e})}e.s(["SessionRow",0,function({session:e,href:r,onSelect:l}){let d="cancelled"===e.status,u=!d&&e.enrolled>=e.capacity,m=(0,t.jsxs)("span",{className:"grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto_3.75rem]",children:[(0,t.jsxs)("span",{className:"self-start pt-0.5",children:[(0,t.jsx)("span",{className:(0,n.cn)("block font-display text-[19px] leading-none tnum",d&&"text-ink-3 line-through"),children:(0,a.time)(e.starts_at)}),(0,t.jsx)("span",{className:"mt-1 block text-[12.5px] text-ink-3 tnum",children:(0,a.time)(e.ends_at)})]}),(0,t.jsxs)("span",{className:"min-w-0",children:[(0,t.jsxs)("span",{className:"flex min-w-0 flex-wrap items-baseline gap-x-2",children:[(0,t.jsx)("span",{className:(0,n.cn)("truncate font-semibold",d&&"text-ink-3 line-through"),children:e.name}),e.style&&(0,t.jsx)(o,{colour:e.colour,name:e.style,className:"text-[13px] text-ink-3"})]}),(0,t.jsx)("span",{className:"mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-[13px] text-ink-3",children:d?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c,{tone:"critical",children:"Cancelled"}),e.cancel_reason&&(0,t.jsx)("span",{className:"text-ink-2",children:e.cancel_reason})]}):(0,t.jsxs)(t.Fragment,{children:[e.moved&&(0,t.jsx)(c,{children:"Moved"}),e.covered&&(0,t.jsx)(c,{tone:"caution",children:"Cover"}),(0,t.jsxs)("span",{className:"truncate",children:[[e.teacher,e.room].filter(Boolean).join(" · "),e.trials>0?` \xb7 ${e.trials} trial${1===e.trials?"":"s"}`:""]})]})})]}),!d&&(0,t.jsx)(i.Beats,{value:e.enrolled,max:e.capacity,label:`${e.enrolled} of ${e.capacity} places`,tone:u?"caution":"accent",className:"hidden sm:inline-flex"}),(0,t.jsx)("span",{className:(0,n.cn)("text-right text-[13.5px] tnum",u?"font-semibold text-caution":"text-ink-2",d&&"sm:col-span-2"),children:d?"":(0,t.jsxs)(t.Fragment,{children:[e.enrolled,"/",e.capacity,u&&(0,t.jsx)("span",{className:"block text-[12px]",children:"Full"})]})})]}),h="block w-full text-left transition-colors hover:bg-surface-2/60";return l?(0,t.jsx)("button",{onClick:l,className:h,children:m}):r?(0,t.jsx)(s.default,{href:r,className:h,children:m}):m},"StyleMark",0,o,"ViewTabs",0,function({value:e,onChange:s,options:i,label:a,className:r}){return(0,t.jsx)("div",{role:"tablist","aria-label":a,className:(0,n.cn)("-mx-1 flex max-w-full gap-1 overflow-x-auto",r),children:i.map(([i,a])=>(0,t.jsx)("button",{role:"tab","aria-selected":e===i,onClick:()=>s(i),className:(0,n.cn)("min-h-[40px] shrink-0 border-b-2 px-2 text-[14px] transition-colors",e===i?"border-ink font-semibold text-ink":"border-transparent text-ink-3 hover:text-ink"),children:a},i))})},"Word",0,c,"styleColour",0,l])},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),i=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),a=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),i=new Date,a=i.getFullYear()-t.getFullYear(),n=i.getMonth()-t.getMonth();return(n<0||0===n&&i.getDate()<t.getDate())&&(a-=1),a},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,a,"dayName",0,i,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),i=new Date(s);return i.setDate(i.getDate()+1),[s.toISOString(),i.toISOString()]},"initials",0,(...e)=>e.filter(Boolean).map(e=>e.trim()[0]?.toUpperCase()??"").join("").slice(0,2),"isoDate",0,e=>{let i=s(e),a=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(i),n=e=>a.find(t=>t.type===e)?.value??"";return`${n("year")}-${n("month")}-${n("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),n=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?i(t):a(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let i=new Date(t);return i.setDate(i.getDate()+7),[t.toISOString(),i.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),i=e.i(31502);function a(e,n,r=[],l){let{session:o}=(0,i.useSession)();return(0,t.useQuery)({queryKey:["db",o?.userId??"anon",o?.studio??"",...e],queryFn:()=>(0,s.readAs)(o,n,r),staleTime:15e3,...l})}e.s(["useRow",0,function(e,t,s=[]){let i=a(e,t,s);return{...i,data:i.data?.[0]}},"useRows",0,a])},29074,e=>{"use strict";let t=`
select c.id, c.name, ds.name as style, ds.colour, lv.name as level,
       st.display_name as teacher, l.name as location, r.name as room,
       c.day_of_week, c.start_time, c.duration_min, c.capacity,
       app.class_enrolled_count(c.id) as enrolled,
       app.class_waitlist_count(c.id) as waiting,
       round(100.0 * app.class_enrolled_count(c.id) / nullif(c.capacity,0))::int as pct,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.term_id,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null
           and cs.starts_at > now() and cs.status = 'scheduled') as sessions_left
  from class c
  left join dance_style ds on ds.id = c.dance_style_id
  left join level lv on lv.id = c.level_id
  left join staff_member st on st.id = c.teacher_id
  left join location l on l.id = c.location_id
  left join room r on r.id = c.room_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,s=`
select s.id, e.id as enrolment_id, s.first_name, s.last_name, s.date_of_birth, e.started_on,
       f.name as family_name,
       coalesce((select m.requires_alert from medical_record m
                  where m.student_id = s.id and m.deleted_at is null), false) as has_alert,
       (select round(100.0 * count(*) filter (where ar.status in ('present','late'))
                     / nullif(count(*),0))::int
          from attendance_record ar
          join class_session cs on cs.id = ar.session_id and cs.class_id = e.class_id
         where ar.student_id = s.id and ar.deleted_at is null) as attendance_pct
  from enrolment e
  join student s on s.id = e.student_id
  join family f on f.id = s.family_id
 where e.class_id = $1 and e.status = 'active' and e.deleted_at is null
 order by s.last_name, s.first_name`,i=`
select w.id, w.position, w.status, s.first_name, s.last_name, f.name as family_name
  from waitlist_entry w
  join student s on s.id = w.student_id
  join family f on f.id = s.family_id
 where w.class_id = $1 and w.status in ('waiting','offered') and w.deleted_at is null
 order by w.position`,a=`
select
  count(*)::int as total,
  count(*) filter (where stage in ('trial_booked','trial_attended','trial_missed','enrolled'))::int as booked,
  count(*) filter (where stage in ('trial_attended','enrolled'))::int as attended,
  count(*) filter (where stage = 'enrolled')::int as converted,
  count(*) filter (where stage = 'closed_lost')::int as lost
from enquiry where deleted_at is null`,n=`
select e.id, e.stage, e.contact_name, e.contact_email, e.contact_phone,
       e.child_name, e.child_dob, e.source, e.next_action_on, e.created_at,
       c.name as class_name, ds.colour
  from enquiry e
  left join class c on c.id = e.interest_class_id
  left join dance_style ds on ds.id = c.dance_style_id
 where e.deleted_at is null
 order by
   array_position(array['trial_attended','follow_up','trial_booked','trial_requested',
                        'enquiry','trial_missed','enrolled','closed_lost']::text[], e.stage::text),
   e.next_action_on nulls last`,r=`select r.id, r.name, r.location_id, r.capacity, l.name as location
                            from room r join location l on l.id = r.location_id
                           where r.deleted_at is null order by l.name, r.name`,l=`select id, display_name from staff_member
                           where deleted_at is null and status = 'active' order by display_name`,o=`select id, name, starts_on, ends_on from term
                            where deleted_at is null and status <> 'archived'
                            order by starts_on desc`,c=`
insert into class (studio_id, term_id, dance_style_id, level_id, location_id, room_id,
                   teacher_id, name, day_of_week, start_time, duration_min, capacity,
                   age_min, age_max, price_minor, pricing, trials_enabled, waitlist_enabled,
                   visibility, pricing, trial_price_minor, assistant_id, prerequisites,
                   description, trial_needs_approval)
select t.studio_id, t.id, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11,
       $12, $13, $14, $18::pricing_model, $15, $16, $17::class_visibility,
       $19, $20, nullif(btrim($21), ''), nullif(btrim($22), ''), $23
  from term t where t.id = $1
returning id`,d=`
update class set dance_style_id = $2, level_id = $3, location_id = $4, room_id = $5,
                 teacher_id = $6, name = $7, day_of_week = $8, start_time = $9::time,
                 duration_min = $10, capacity = $11, age_min = $12, age_max = $13,
                 price_minor = $14, trials_enabled = $15, waitlist_enabled = $16,
                 visibility = $17::class_visibility, pricing = $18::pricing_model,
                 trial_price_minor = $19, assistant_id = $20, prerequisites = nullif(btrim($21), ''),
                 description = nullif(btrim($22), ''), trial_needs_approval = $23, updated_at = now()
 where id = $1
returning id`,u=`
select c.id, c.name, c.term_id, c.dance_style_id, c.level_id, c.location_id, c.room_id,
       c.teacher_id, c.day_of_week, c.start_time, c.duration_min, c.capacity,
       c.age_min, c.age_max, c.price_minor, c.trials_enabled, c.waitlist_enabled,
       c.visibility::text as visibility, c.pricing::text as pricing, c.trial_price_minor,
       c.assistant_id, c.prerequisites, c.description, c.trial_needs_approval,
       (select count(*)::int from class_session cs
         where cs.class_id = c.id and cs.deleted_at is null and cs.starts_at > now()) as future_sessions
  from class c where c.id = $1 and c.deleted_at is null`,m=`
insert into enrolment (studio_id, class_id, student_id, status, started_on, note, created_by)
select c.studio_id, c.id, $2, 'active', coalesce($3::date, current_date),
       nullif(btrim($4),''), auth.uid()
  from class c where c.id = $1
returning id`,h=`
insert into waitlist_entry (studio_id, class_id, student_id, status, position, note)
select c.studio_id, c.id, $2, 'waiting', 0, nullif(btrim($3),'')
  from class c where c.id = $1
returning id, position`,_=`
select c.id, c.name, app.class_enrolled_count(c.id) as enrolled, c.capacity
  from class c where c.deleted_at is null order by c.day_of_week, c.start_time`,f=`
select t.id, t.status::text as status, cs.starts_at, c.name as class_name,
       case when s.id is null then null
            else s.first_name || ' ' || s.last_name end as student_name,
       s.id as student_id, e.contact_name, t.enquiry_id
  from trial t
  join class c on c.id = t.class_id
  left join class_session cs on cs.id = t.session_id
  left join student s on s.id = t.student_id
  left join enquiry e on e.id = t.enquiry_id
 where t.deleted_at is null
 order by (t.status in ('requested','booked')) desc, cs.starts_at nulls last`,p=`
select cs.id, cs.starts_at
  from class_session cs
 where cs.class_id = $1 and cs.deleted_at is null
   and cs.starts_at > now() and cs.status = 'scheduled'
 order by cs.starts_at limit 8`,y=`
select s.id, s.first_name, s.last_name, s.date_of_birth, f.name as family_name
  from student s
  join family f on f.id = s.family_id
 where s.deleted_at is null and s.left_on is null
   and not exists (select 1 from enrolment e
                    where e.student_id = s.id and e.class_id = $1
                      and e.status = 'active' and e.deleted_at is null)
 order by s.last_name, s.first_name`,b=`
update enquiry set stage = $2::enquiry_stage, updated_at = now(),
       next_action_on = $3::date
 where id = $1
returning id`,g=`
select t.id, t.name, t.starts_on, t.ends_on, current_date between t.starts_on and t.ends_on as current,
       (select count(*)::int from class c where c.term_id = t.id and c.deleted_at is null) as classes
  from term t where t.deleted_at is null and t.status <> 'archived' order by t.starts_on desc`,w=`
insert into enquiry (studio_id, contact_name, contact_phone, contact_email, child_name, child_dob,
                     interest_class_id, source, next_action_on, created_by)
select s.id, btrim($1), nullif(btrim($2), ''), nullif(lower(btrim($3)), ''), nullif(btrim($4), ''), $5::date,
       $6::uuid, $7, coalesce($8::date, current_date + 2), auth.uid()
  from studio s where s.deleted_at is null and app.is_admin(s.id) limit 1
returning id`;e.s(["ACCEPT_PLACE",0,"select app.accept_waitlist_place($1) as enrolment_id","BOOK_TRIAL",0,"select app.book_trial($1, $2, $3::jsonb) as id","CLASSES",0,t,"CLASS_FOR_EDIT",0,u,"CLASS_OPTIONS",0,_,"CLASS_ROSTER",0,s,"CLASS_SESSIONS_AHEAD",0,p,"CLASS_WAITLIST",0,i,"CONVERT_TRIAL",0,"select app.convert_trial($1, $2) as enrolment_id","COPY_CLASSES",0,"select app.copy_classes($1::uuid[], $2, $3) as r","CREATE_CLASS",0,c,"CREATE_ENQUIRY",0,w,"DECLINE_PLACE",0,"select app.decline_waitlist_place($1, $2) as ok","ENQUIRIES",0,n,"ENROL",0,m,"ENROLLABLE_STUDENTS",0,y,"FUNNEL",0,a,"GENERATE_SESSIONS",0,"select app.generate_class_sessions($1) as made","JOIN_WAITLIST",0,h,"LEVELS",0,"select id, name from level where deleted_at is null order by sort_order, name","OFFER_PLACE",0,"select app.offer_waitlist_place($1, $2) as ok","OPEN_TERMS",0,o,"RESCHEDULE_CLASS",0,"select app.reschedule_class($1) as net","ROOMS",0,r,"SET_ENQUIRY_STAGE",0,b,"STYLES",0,"select id, name, colour from dance_style where deleted_at is null order by name","TEACHERS",0,l,"TERM_TABS",0,g,"TRANSFER",0,"select app.transfer_enrolment($1, $2, $3) as id","TRIALS",0,f,"TRIAL_OUTCOME",0,"select app.record_trial_outcome($1, $2, $3) as ok","UPDATE_CLASS",0,d,"WITHDRAW",0,"select app.withdraw_enrolment($1, $2) as offered"])},33204,e=>{"use strict";let t=`
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
 where deleted_at is null order by name`,l=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,o=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,c=`
insert into communication (studio_id, kind, channel, family_id, subject, body)
select studio_id, 'direct', 'in_app', id, nullif(btrim($2), ''), btrim($3) from family where id = $1
returning id`,d=`
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
select count(*)::int as n from notification where deleted_at is null and read_at is null`,g=`
select r.id, r.event, r.enabled, r.template_id, t.name as template_name,
       (select count(*)::int from automation_run x where x.rule_id = r.id) as sent,
       (select max(ran_at) from automation_run x where x.rule_id = r.id) as last_sent,
       coalesce((select d.due from app.automation_due(r.studio_id) d where d.rule_id = r.id), 0) as due
  from automation_rule r
  left join communication_template t on t.id = r.template_id and t.deleted_at is null
 order by array_position(array['trial_booked','trial_reminder_48h','trial_reminder_same_day',
                               'trial_attended','trial_missed','waitlist_offer'], r.event)`,w=`
select app.run_automations(studio_id) as sent from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,x=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,a,"CLASS_AUDIENCES",0,n,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,l,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,i,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,x,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,g,"RUN_AUTOMATIONS",0,w,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,c,"SEND_DIRECT_AT",0,d,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,_,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,r,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,o])}]);