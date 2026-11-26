(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66027,e=>{"use strict";let t;var s=e.i(12598),a=e.i(71645);let i=a.createContext(!1);i.Provider,e.i(43476);let n=a.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}));var r=e.i(19273),c=e.i(40143),l=e.i(80166),o=e.i(73911),d=e.i(15823),u=e.i(75555),m=e.i(86491),h=class extends d.Subscribable{#e;#t=void 0;#s=void 0;#a=void 0;#i;#n;#r;#c;#l;#o;#d;#u;#m;#h=new Set;constructor(e,t){super(),this.options=t,this.#e=e,this.#r=null,this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#t.addObserver(this),_(this.#t,this.options)?this.#_():this.updateResult(),this.#f())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return f(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return f(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#p(),this.#y(),this.#t.removeObserver(this)}setOptions(e){let t=this.options,s=this.#t;if(this.options=this.#e.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,r.resolveQueryBoolean)(this.options.enabled,this.#t))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#b(),this.#t.setOptions(this.options),t._defaulted&&!(0,r.shallowEqualObjects)(this.options,t)&&this.#e.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#t,observer:this});let a=this.hasListeners();a&&p(this.#t,s,this.options,t)&&this.#_(),this.updateResult(),a&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||(0,r.resolveStaleTime)(this.options.staleTime,this.#t)!==(0,r.resolveStaleTime)(t.staleTime,this.#t))&&this.#g();let i=this.#w();a&&(this.#t!==s||(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)!==(0,r.resolveQueryBoolean)(t.enabled,this.#t)||i!==this.#m)&&this.#v(i)}getOptimisticResult(e){var t,s;let a=this.#e.getQueryCache().build(this.#e,e),i=this.createResult(a,e);return t=this,s=i,(0,r.shallowEqualObjects)(t.getCurrentResult(),s)||(this.#a=i,this.#n=this.options,this.#i=this.#t.state),i}getCurrentResult(){return this.#a}trackResult(e,t){return new Proxy(e,{get:(e,s)=>(this.trackProp(s),t?.(s),Reflect.get(e,s))})}trackProp(e){this.#h.add(e)}getCurrentQuery(){return this.#t}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t,s=this.#e.defaultQueryOptions(e),a=this.#e.getQueryCache().build(this.#e,s),i=()=>{},n=new Promise(e=>{t=e,i=this.#e.getQueryCache().subscribe(t=>{"updated"===t.type&&t.query.queryHash===a.queryHash&&void 0!==a.state.data&&(i(),e(this.createResult(a,s)))})});return Promise.race([a.fetch().then(()=>{let e=this.createResult(a,s);return t?.(e),e}).finally(()=>{i()}),n])}fetch(e){return this.#_({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#_(e){this.#b();let t=this.#t.fetch(this.options,e);return e?.throwOnError||(t=t.catch(r.noop)),t}#g(){this.#p();let e=(0,r.resolveStaleTime)(this.options.staleTime,this.#t);if(o.environmentManager.isServer()||this.#a.isStale||!(0,r.isValidTimeout)(e))return;let t=(0,r.timeUntilStale)(this.#a.dataUpdatedAt,e)+1;this.#d=l.timeoutManager.setTimeout(()=>{this.#a.isStale||this.updateResult()},t)}#w(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#y(),this.#m=e,!o.environmentManager.isServer()&&!1!==(0,r.resolveQueryBoolean)(this.options.enabled,this.#t)&&(0,r.isValidTimeout)(this.#m)&&0!==this.#m&&(this.#u=l.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||u.focusManager.isFocused())&&this.#_()},this.#m))}#f(){this.#g(),this.#v(this.#w())}#p(){void 0!==this.#d&&(l.timeoutManager.clearTimeout(this.#d),this.#d=void 0)}#y(){void 0!==this.#u&&(l.timeoutManager.clearInterval(this.#u),this.#u=void 0)}createResult(e,t){let s,a=this.#t,i=this.options,n=this.#a,c=this.#i,l=this.#n,o=e!==a?e.state:this.#s,{state:d}=e,u={...d},h=!1;if(t._optimisticResults){let s=this.hasListeners(),n=!s&&_(e,t),r=s&&p(e,a,t,i);(n||r)&&(u={...u,...(0,m.fetchState)(d.data,e.options)}),"isRestoring"===t._optimisticResults&&(u.fetchStatus="idle")}let{error:f,errorUpdatedAt:b,status:g}=u;s=u.data;let w=!1;if(void 0!==t.placeholderData&&void 0===s&&"pending"===g){let e;n?.isPlaceholderData&&t.placeholderData===l?.placeholderData?(e=n.data,w=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#o?.state.data,this.#o):t.placeholderData,void 0!==e&&(g="success",s=(0,r.replaceData)(n?.data,e,t),h=!0)}if(t.select&&void 0!==s&&!w)if(n&&s===c?.data&&t.select===this.#c)s=this.#l;else try{this.#c=t.select,s=t.select(s),s=(0,r.replaceData)(n?.data,s,t),this.#l=s,this.#r=null}catch(e){this.#r=e}else void 0===s&&(this.#r=null);this.#r&&(f=this.#r,s=this.#l,b=Date.now(),g="error",h=!1);let v="fetching"===u.fetchStatus,x="pending"===g,E="error"===g,S=x&&v,R=void 0!==s;return{status:g,fetchStatus:u.fetchStatus,isPending:x,isSuccess:"success"===g,isError:E,isInitialLoading:S,isLoading:S,data:s,dataUpdatedAt:u.dataUpdatedAt,error:f,errorUpdatedAt:b,failureCount:u.fetchFailureCount,failureReason:u.fetchFailureReason,errorUpdateCount:u.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:u.dataUpdateCount>o.dataUpdateCount||u.errorUpdateCount>o.errorUpdateCount,isFetching:v,isRefetching:v&&!x,isLoadingError:E&&!R,isPaused:"paused"===u.fetchStatus,isPlaceholderData:h,isRefetchError:E&&R,isStale:y(e,t),refetch:this.refetch,isEnabled:!1!==(0,r.resolveQueryBoolean)(t.enabled,e)}}updateResult(){let e=this.#a,t=this.createResult(this.#t,this.options);if(this.#i=this.#t.state,this.#n=this.options,void 0!==this.#i.data&&(this.#o=this.#t),(0,r.shallowEqualObjects)(t,e))return;this.#a=t;let s=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,s="function"==typeof t?t():t;if("all"===s||!s&&!this.#h.size)return!0;let a=new Set(s??this.#h);return this.options.throwOnError&&a.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&a.has(t))};this.#x({listeners:s()})}#b(){let e=this.#e.getQueryCache().build(this.#e,this.options);if(e===this.#t)return;let t=this.#t;this.#t=e,this.#s=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#f()}#x(e){c.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#a)}),this.#e.getQueryCache().notify({query:this.#t,type:"observerResultsUpdated"})})}};function _(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,r.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&f(e,t,t.refetchOnMount)}function f(e,t,s){if(!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,r.resolveStaleTime)(t.staleTime,e)){let a="function"==typeof s?s(e):s;return"always"===a||!1!==a&&y(e,t)}return!1}function p(e,t,s,a){return(e!==t||!1===(0,r.resolveQueryBoolean)(a.enabled,e))&&(!s.suspense||"error"!==e.state.status)&&y(e,s)}function y(e,t){return!1!==(0,r.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,r.resolveStaleTime)(t.staleTime,e))}e.s(["useQuery",0,function(e,t){return function(e,t,l){let o,d=a.useContext(i),u=a.useContext(n),m=(0,s.useQueryClient)(l),h=m.defaultQueryOptions(e),_=m.getQueryCache().get(h.queryHash),f=!1!==e.subscribed;if(h._optimisticResults=d?"isRestoring":f?"optimistic":void 0,h.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=h.staleTime;h.staleTime="function"==typeof t?(...s)=>e(t(...s)):e(t),"number"==typeof h.gcTime&&(h.gcTime=Math.max(h.gcTime,1e3))}o=_?.state.error&&"function"==typeof h.throwOnError?(0,r.shouldThrowError)(h.throwOnError,[_.state.error,_]):h.throwOnError,(h.suspense||o)&&!u.isReset()&&(h.retryOnMount=!1),a.useEffect(()=>{u.clearReset()},[u]);let[p]=a.useState(()=>new t(m,h)),y=p.getOptimisticResult(h),b=!d&&f;if(a.useSyncExternalStore(a.useCallback(e=>{let t=b?p.subscribe(c.notifyManager.batchCalls(e)):r.noop;return p.updateResult(),t},[p,b]),()=>p.getCurrentResult(),()=>p.getCurrentResult()),a.useEffect(()=>{p.setOptions(h)},[h,p]),h?.suspense&&y.isPending)throw p.fetchOptimistic(h).catch(()=>{u.clearReset()});if((({result:e,errorResetBoundary:t,throwOnError:s,query:a,suspense:i})=>e.isError&&!t.isReset()&&!e.isFetching&&a&&(i&&void 0===e.data||(0,r.shouldThrowError)(s,[e.error,a])))({result:y,errorResetBoundary:u,throwOnError:h.throwOnError,query:_,suspense:h.suspense}))throw y.error;return h.notifyOnChangeProps?y:p.trackResult(y)}(e,h,t)}],66027)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,t],43531)},61574,e=>{"use strict";let t=(0,e.i(75254).default)("heart-pulse",[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}],["path",{d:"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"auskq0"}]]);e.s(["HeartPulse",0,t],61574)},94351,e=>{"use strict";let t=(0,e.i(75254).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);e.s(["Home",0,t],94351)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",0,t],78894)},37727,e=>{"use strict";let t=(0,e.i(75254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],37727)},33405,54626,1844,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(87338);function i(e){if(!e)return null;let t=e.trim().toLowerCase();return t.startsWith("#")||(t=`#${t}`),/^#[0-9a-f]{3}$/.test(t)&&(t=`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`),/^#[0-9a-f]{6}$/.test(t)?t:null}let n=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),r=e=>`#${e.map(e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")).join("")}`;function c(e){let[t,s,a]=n(e).map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*t+.7152*s+.0722*a}function l(e,t){let[s,a]=[c(e),c(t)].sort((e,t)=>t-e);return(s+.05)/(a+.05)}function o([e,t,s]){let a=Math.max(e/=255,t/=255,s/=255),i=Math.min(e,t,s),n=(a+i)/2;if(a===i)return[0,0,n];let r=a-i;return[(a===e?(t-s)/r+6*(t<s):a===t?(s-e)/r+2:(e-t)/r+4)/6,n>.5?r/(2-a-i):r/(a+i),n]}function d([e,t,s]){if(0===t)return r([255*s,255*s,255*s]);let a=s<.5?s*(1+t):s+t-s*t,i=2*s-a,n=e=>(e<0&&(e+=1),e>1&&(e-=1),e<1/6)?i+(a-i)*6*e:e<.5?a:e<2/3?i+(a-i)*(2/3-e)*6:i;return r([255*n(e+1/3),255*n(e),255*n(e-1/3)])}function u(e,t="#ffffff"){var s;let a,m,h=i(e)??"#2638f0",_=.18>c(i(t)??"#ffffff"),f=4.5>l(h,"#ffffff"),[p,y,b]=o(n(h)),g=d([p,y,f?Math.min(1,b+.08):Math.max(0,b-.07)]),w=(s=_?.82:.9,a=n(h),m=n(t),r([0,1,2].map(e=>a[e]*(1-s)+m[e]*s))),v=(e,t,s)=>_?function(e,t,s){let[a,i,r]=o(n(e)),c=e;for(;l(c,t)<s&&r<1;)c=d([a,i,r=Math.min(1,r+.01)]);return c}(e,t,s):function(e,t,s){let[a,i,r]=o(n(e)),c=e;for(;l(c,t)<s&&r>0;)c=d([a,i,r=Math.max(0,r-.01)]);return c}(e,t,s),x=v(h,w,4.5),E=v(h,t,4.5),S=v(h,t,3);return{accent:h,onAccent:f?"#000000":"#ffffff",hover:g,soft:w,ink:x,text:E,line:S,darkText:f,textDeepened:E!==h}}let m=e=>({"--color-accent":e.accent,"--color-accent-hover":e.hover,"--color-on-accent":e.onAccent,"--color-accent-soft":e.soft,"--color-accent-ink":e.ink,"--color-accent-text":e.text,"--color-accent-line":e.line}),h=e=>e.replace(/\b(the|of|and|&|school|academy|studio|dance|co)\b/gi," ").trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join("")||e.trim().split(/\s+/).slice(0,2).map(e=>e[0].toUpperCase()).join("");e.s(["cssVars",0,m,"monogram",0,h,"normaliseHex",0,i,"paletteFor",0,u],54626);let _={classic:{id:"classic",name:"Classic",tagline:"Light and clear — white studio, ink type, your colour for actions",surface:"#ffffff",canvas:"#f4f5f8",ink:"#121521",dark:!1,accent:"#2638f0",secondary:"#ffb089",presets:[{name:"Swayvo",accent:"#2638f0",secondary:"#ffb089"},{name:"Eucalyptus",accent:"#0b3b34",secondary:"#c86a4f"},{name:"Charcoal & blush",accent:"#2b2b2b",secondary:"#d9a89a"},{name:"Midnight",accent:"#1e3a8a",secondary:"#c9a227"},{name:"Plum",accent:"#6b2155",secondary:"#e3a1b9"},{name:"Rose",accent:"#b0304f",secondary:"#f2b5a7"}]},urban:{id:"urban",name:"Urban",tagline:"Bold and after-dark — night grounds, wide type, vivid accents",surface:"#141826",canvas:"#0b0d16",ink:"#f3f4f8",dark:!0,accent:"#c6f432",secondary:"#8b5cf6",presets:[{name:"Volt & violet",accent:"#c6f432",secondary:"#8b5cf6"},{name:"Cyan & magenta",accent:"#22d3ee",secondary:"#d946ef"},{name:"Hot pink",accent:"#ff3d8b",secondary:"#7c3aed"},{name:"Blaze",accent:"#ff7a1a",secondary:"#e11d48"},{name:"Electric blue",accent:"#3b82f6",secondary:"#22d3ee"},{name:"Gold",accent:"#fbbf24",secondary:"#f97316"}]}},f=e=>_["urban"===e?"urban":"classic"];function p(e,t,s){let a=f(e);return{theme:a,accent:i(t)??a.accent,secondary:i(s)??a.secondary}}e.s(["THEMES",0,_,"schoolColours",0,p,"themeOf",0,f],1844);var y=e.i(45060);e.s(["PoweredBy",0,function({className:e}){return(0,t.jsxs)("span",{className:(0,y.cn)("mt-0.5 flex items-center gap-1 text-[11px] text-ink-3",e),children:["powered by",(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-light h-[0.95em] translate-y-[0.06em]",tone:"ink",title:"Swayvo"}),(0,t.jsx)(a.SwayvoLogo,{className:"swayvo-on-dark h-[0.95em] translate-y-[0.06em]",tone:"white",title:null})]})},"SchoolHero",0,function({src:e,name:s,children:a}){return e?(0,t.jsxs)("div",{className:"relative overflow-hidden rounded-[var(--radius-xl)] bg-surface-3",children:[(0,t.jsx)("img",{src:e,alt:`${s}`,className:"aspect-[16/7] w-full object-cover"}),a&&(0,t.jsx)("div",{className:"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white",children:a})]}):null},"SchoolMark",0,function({name:e,logo:s,className:a}){return s?(0,t.jsx)("img",{src:s,alt:`${e} logo`,className:(0,y.cn)("shrink-0 rounded-lg object-contain",a)}):(0,t.jsx)("span",{"aria-hidden":!0,className:(0,y.cn)("grid shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-on-accent",a),children:h(e)})},"logoFor",0,e=>"urban"===e.theme&&e.logo_light_url?e.logo_light_url:e.logo_url,"useSchoolTheme",0,function(e){let t=e?.theme??null,a=e?.brand_colour??null,i=e?.brand_secondary??null,n=!!e;s.useEffect(()=>{let e=document.documentElement,s=[...Object.keys(m(u(null))),"--color-secondary"];if(!n){s.forEach(t=>e.style.removeProperty(t)),delete e.dataset.theme;return}let r=p(t,a,i);e.dataset.theme=r.theme.id,Object.entries(m(u(r.accent,r.theme.surface))).forEach(([t,s])=>e.style.setProperty(t,s)),e.style.setProperty("--color-secondary",r.secondary);let c=document.querySelector('meta[name="theme-color"]')??Object.assign(document.createElement("meta"),{name:"theme-color"});c.setAttribute("content",r.theme.dark?r.theme.canvas:r.theme.surface),c.parentNode||document.head.appendChild(c)},[n,t,a,i])}],33405)},52547,e=>{"use strict";var t=e.i(43476),s=e.i(78894),a=e.i(61574);let i=(0,e.i(75254).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);var n=e.i(45060);e.s(["MedicalBrief",0,function({brief:e,layout:s="side"}){let a=[["Allergies",e.allergies],["Conditions",e.conditions],["Medication",e.medications]].filter(([,e])=>e&&e.trim()),r=e.emergency_contacts?.length?e.emergency_contacts:e.emergency_contact_phone?[{name:e.emergency_contact_name??"Emergency contact",relationship:null,phone:e.emergency_contact_phone}]:[],c=e.requires_alert?"critical":e.has_medical_need?"caution":"none";return(0,t.jsxs)("div",{className:(0,n.cn)("grid gap-x-8 gap-y-5","side"===s&&"sm:grid-cols-2"),children:[(0,t.jsxs)("section",{"aria-label":"Medical",className:(0,n.cn)("border-l-4 pl-3","critical"===c?"border-critical":"caution"===c?"border-caution":"border-line"),children:[(0,t.jsx)("h3",{className:(0,n.cn)("text-[14px] font-semibold","critical"===c?"text-critical":"caution"===c?"text-caution":"text-ink-2"),children:"critical"===c?"Urgent medical alert":"caution"===c?"Medical information":"Medical"}),!e.has_medical_need&&(0,t.jsx)("p",{className:"mt-0.5 text-[14px] text-ink-2",children:"Nothing recorded."}),a.length>0&&(0,t.jsx)("dl",{className:"mt-1.5 space-y-1.5 text-[14.5px]",children:a.map(([e,s])=>(0,t.jsxs)("div",{children:[(0,t.jsx)("dt",{className:"text-[13px] text-ink-3",children:e}),(0,t.jsx)("dd",{className:"text-ink",children:s})]},e))}),e.action_plan&&(0,t.jsxs)("div",{className:"mt-2",children:[(0,t.jsx)("p",{className:"text-[13px] text-ink-3",children:"In an emergency"}),(0,t.jsx)("p",{className:"text-[14.5px] font-semibold text-ink",children:e.action_plan})]})]}),(0,t.jsxs)("section",{"aria-label":"Emergency contacts",children:[(0,t.jsx)("h3",{className:"text-[14px] font-semibold text-ink-2",children:"Emergency contacts"}),0===r.length&&(0,t.jsx)("p",{className:"mt-0.5 text-[14px] font-semibold text-caution",children:"None recorded. Tell the office."}),(0,t.jsx)("ul",{className:"divide-y divide-line",children:r.map((e,s)=>(0,t.jsx)("li",{children:e.phone?(0,t.jsxs)("a",{href:`tel:${e.phone.replace(/\s+/g,"")}`,className:"-mx-2 flex min-h-[48px] items-center gap-3 rounded-[var(--radius-md)] px-2 hover:bg-surface-2",children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1",children:[(0,t.jsxs)("span",{className:"block text-[14.5px] font-medium",children:[e.name,e.relationship?(0,t.jsxs)("span",{className:"font-normal text-ink-3",children:[" · ",e.relationship]}):null]}),(0,t.jsx)("span",{className:"tnum block text-[13.5px] text-ink-2",children:e.phone})]}),(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 text-[13.5px] font-semibold text-accent-text",children:[(0,t.jsx)(i,{className:"size-3.5","aria-hidden":!0}),"Call"]})]}):(0,t.jsx)("span",{className:"block py-2 text-[14.5px]",children:e.name})},s))}),null!==e.photo_consent&&void 0!==e.photo_consent&&(0,t.jsx)("p",{className:(0,n.cn)("mt-2 text-[13.5px]",e.photo_consent?"text-ink-3":"font-semibold text-caution"),children:e.photo_consent?"Photos allowed":"No photos"})]})]})},"MedicalMarker",0,function({brief:e,className:i}){return e.requires_alert?(0,t.jsx)(s.AlertTriangle,{className:(0,n.cn)("size-4 shrink-0 text-critical",i),role:"img","aria-label":"Urgent medical alert"}):e.has_medical_need?(0,t.jsx)(a.HeartPulse,{className:(0,n.cn)("size-4 shrink-0 text-caution",i),role:"img","aria-label":"Medical information recorded"}):null},"medicalLine",0,function(e){if(!e.requires_alert&&!e.has_medical_need)return"";let t=[e.allergies?.trim()?`Allergy: ${e.allergies.trim()}`:null,e.conditions,e.medications].map(e=>e?.trim()).filter(Boolean),s=t[0]?t[0].charAt(0).toUpperCase()+t[0].slice(1):"Medical information recorded",a=t.length>1?`${s}; ${t.slice(1).join("; ")}`:s;return e.requires_alert?`${a} \xb7 urgent`:a}],52547)},75379,e=>{"use strict";let t="Europe/London",s=e=>e instanceof Date?e:new Date(e),a=e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:t}).format(s(e)),i=e=>e?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",timeZone:t}).format(s(e)):"—";e.s(["ageFrom",0,function(e){if(!e)return null;let t=s(e),a=new Date,i=a.getFullYear()-t.getFullYear(),n=a.getMonth()-t.getMonth();return(n<0||0===n&&a.getDate()<t.getDate())&&(i-=1),i},"dateLong",0,e=>new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:t}).format(s(e)),"dateShort",0,i,"dayName",0,a,"dayRange",0,function(e=0){let t=new Date,s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+e),a=new Date(s);return a.setDate(a.getDate()+1),[s.toISOString(),a.toISOString()]},"initials",0,(...e)=>{let t=e.filter(Boolean).flatMap(e=>e.trim().split(/\s+/)).filter(Boolean);return(t.length>1?[t[0],t[t.length-1]]:t).map(e=>e[0]?.toUpperCase()??"").join("")},"isoDate",0,e=>{let a=s(e),i=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:t}).formatToParts(a),n=e=>i.find(t=>t.type===e)?.value??"";return`${n("year")}-${n("month")}-${n("day")}`},"money",0,e=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(e??0)/100),"relativeDay",0,function(e){let t=s(e),n=new Date,r=Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return 0===r?"Today":1===r?"Tomorrow":-1===r?"Yesterday":r>1&&r<7?a(t):i(t)},"time",0,e=>new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:t}).format(s(e)),"toMinor",0,function(e){let t=e.trim().replace(/^£/,"").replace(/,/g,"");return/^\d+(\.\d{1,2})?$/.test(t)?Math.round(100*Number(t)):null},"weekRange",0,function(e){let t=new Date(e),s=(t.getDay()+6)%7;t.setDate(t.getDate()-s),t.setHours(0,0,0,0);let a=new Date(t);return a.setDate(a.getDate()+7),[t.toISOString(),a.toISOString()]}])},13927,e=>{"use strict";var t=e.i(66027),s=e.i(30224),a=e.i(31502);function i(e,n,r=[],c){let{session:l}=(0,a.useSession)();return(0,t.useQuery)({queryKey:["db",l?.userId??"anon",l?.studio??"",...e],queryFn:()=>(0,s.readAs)(l,n,r),staleTime:15e3,...c})}e.s(["useRow",0,function(e,t,s=[]){let a=i(e,t,s);return{...a,data:a.data?.[0]}},"useRows",0,i])},33204,e=>{"use strict";let t=`
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
 limit 60`,n=`
select c.id, c.name, sm.display_name as teacher,
       (select count(distinct s.family_id)::int from enrolment e join student s on s.id = e.student_id
         where e.class_id = c.id and e.status = 'active' and e.deleted_at is null) as families
  from class c left join staff_member sm on sm.id = c.teacher_id
 where c.deleted_at is null
 order by c.day_of_week, c.start_time`,r=`
select id, name, subject, body from communication_template
 where deleted_at is null order by name`,c=`
insert into communication_template (studio_id, name, subject, body)
select studio_id, $1, nullif(btrim($2), ''), $3 from membership
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null
 limit 1 returning id`,l=`
update communication_template set name = $2, subject = nullif(btrim($3), ''), body = $4, updated_at = now()
 where id = $1 returning id`,o=`
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
 where user_id = auth.uid() and role in ('owner','admin') and deleted_at is null limit 1`,v=`
select id, to_name, to_address, subject, status, created_at from outbound_message
 order by created_at desc limit 20`;e.s(["BROADCASTS",0,i,"CLASS_AUDIENCES",0,n,"CONVERSATION",0,s,"CREATE_TEMPLATE",0,c,"FAMILY_COUNT",0,"select count(*)::int as n from family where deleted_at is null","MARK_NOTIFICATIONS",0,"select app.mark_notifications_read($1::uuid[])","MARK_READ",0,"select app.mark_read($1::uuid[])","MY_CONVERSATION",0,a,"MY_PREFS",0,"select category, in_app, email from notification_preference where user_id = auth.uid()","MY_QUIET",0,"select to_char(quiet_from, 'HH24:MI') as quiet_from, to_char(quiet_to, 'HH24:MI') as quiet_to, email_digest from user_account where id = auth.uid()","MY_THREADS",0,"select * from app.my_threads()","NOTIFICATIONS",0,y,"OTHER_SCHOOL_NOTES",0,"select * from app.other_school_notifications()","OUTBOX",0,v,"REACH",0,"select * from app.message_reach($1)","RELEASE_SCHEDULED",0,f,"REMIND_UNREAD",0,"select app.remind_unread($1) as n","REMOVE_TEMPLATE",0,"select app.soft_delete('communication_template', $1)","RULES",0,g,"RUN_AUTOMATIONS",0,w,"SEND_CLASS",0,u,"SEND_CLASS_AT",0,m,"SEND_DIRECT",0,o,"SEND_DIRECT_AT",0,d,"SEND_STUDIO",0,h,"SEND_STUDIO_AT",0,_,"SEND_TO_STUDIO",0,p,"SET_DIGEST",0,"select app.set_email_digest($1)","SET_PREF",0,"select app.set_notification_preference($1, $2, $3)","SET_QUIET",0,"select app.set_quiet_hours($1::time, $2::time)","SET_RULE",0,"update automation_rule set enabled = $2, template_id = $3 where id = $1 returning id","TEACHER_MESSAGE",0,"select app.teacher_message_family($1, $2, $3) as id","TEACHER_REPLY",0,"select app.teacher_reply($1, $2) as id","TEMPLATES",0,r,"THREADS",0,t,"UNREAD_NOTIFICATIONS",0,b,"UPDATE_TEMPLATE",0,l])},94512,e=>{"use strict";let t=`
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
returning id, status`,n=`
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
 order by s.last_name, s.first_name`,r=`
update class_session set notes = nullif(btrim($2), ''), updated_at = now()
 where id = $1
returning id, notes`,c=`
update attendance_record set reason = nullif(btrim($3), ''), updated_at = now()
 where session_id = $1 and student_id = $2 and deleted_at is null
returning id, reason`,l=`
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
 order by cm.sent_at desc`,d=`
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
 order by cs.starts_at limit 1`;e.s(["CLASS_NOTICES",0,o,"CLOSE_REGISTER",0,"select app.close_register($1) as ok","EDIT_NOTICE",0,u,"MARK_ATTENDANCE",0,i,"MY_SESSIONS",0,t,"MY_STUDENTS",0,n,"NEXT_SESSION",0,m,"POST_NOTICE",0,d,"REGISTER",0,a,"REOPEN_REGISTER",0,l,"REQUEST_COVER",0,"select app.request_cover($1, $2) as id","SAVE_SESSION_NOTES",0,r,"SET_REASON",0,c,"WITHDRAW_NOTICE",0,"select app.withdraw_notice($1) as ok"])}]);