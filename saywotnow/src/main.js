import { html, render, useState, useEffect } from './vendor/preact-htm.js';
import { loadContent } from './content.js';
import { getPrefs, setPref, subscribePrefs } from './prefs.js';
import { S } from './strings.js';
import { Icon, Mark } from './ui/icons.js';
import { setContent, routeStore, useStore, navigate, DialogHost, ToastHost, toast } from './ui/core.js';
import { Home, Search, Meetings, Conversations, Reactions, Toolkit } from './ui/lists.js';
import { TemplateForm } from './ui/form.js';
import { Preview } from './ui/preview.js';
import { Guide } from './ui/guide.js';
import { Tool } from './ui/tools.js';
import { Settings, StaticPage, Onboarding } from './ui/settings.js';
import { PrepList, PrepCard } from './ui/prep.js';
import { InterviewBuilder, InterviewLibrary, InterviewRun } from './ui/interview.js';

const TABS = [
  ['home', '/', 'home', S.tabs.home],
  ['meetings', '/meetings', 'meetings', S.tabs.meetings],
  ['conversations', '/conversations', 'conversations', S.tabs.conversations],
  ['toolkit', '/toolkit', 'toolkit', S.tabs.toolkit],
];

function tabFor(parts) {
  const p = parts[0];
  if (!p || p === 'search' || p === 'settings' || p === 'page' || p === 'prep') return 'home';
  if (p === 'template') return parts[1] === 'T08' ? 'conversations' : 'meetings';
  if (p === 'guide' || p === 'reactions' || p === 'conversations') return 'conversations';
  if (p === 'tool' || p === 'toolkit' || p === 'interview') return 'toolkit';
  return p;
}

function usePrefs() {
  const [prefs, setP] = useState(getPrefs());
  useEffect(() => subscribePrefs(setP), []);
  return prefs;
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1A1024' : '#4B1F7A');
}

function Screen({ route, prefs }) {
  const [a, b, c] = route.parts;
  switch (a) {
    case undefined: return html`<${Home} prefs=${prefs} />`;
    case 'search': return html`<${Search} />`;
    case 'meetings': return html`<${Meetings} prefs=${prefs} />`;
    case 'template': return c === 'preview' ? html`<${Preview} key=${'p' + b} id=${b} prefs=${prefs} />` : html`<${TemplateForm} key=${'t' + b} id=${b} prefs=${prefs} />`;
    case 'conversations': return html`<${Conversations} prefs=${prefs} />`;
    case 'guide': return html`<${Guide} key=${b} id=${b} prefs=${prefs} />`;
    case 'reactions': return html`<${Reactions} />`;
    case 'toolkit': return html`<${Toolkit} prefs=${prefs} />`;
    case 'tool': return html`<${Tool} key=${b} id=${b} prefs=${prefs} />`;
    case 'prep': return b ? html`<${PrepCard} key=${b} id=${b} prefs=${prefs} />` : html`<${PrepList} prefs=${prefs} />`;
    case 'interview':
      if (b === 'new') return html`<${InterviewBuilder} key="new" />`;
      if (b === 'edit') return html`<${InterviewBuilder} key=${'e' + c} id=${c} />`;
      if (b === 'library') return html`<${InterviewLibrary} key=${'l' + (c || '')} id=${c} />`;
      if (b === 'run') return html`<${InterviewRun} key=${'r' + c} id=${c} />`;
      return html`<${Tool} key="interview" id="interview" prefs=${prefs} />`;
    case 'settings': return html`<${Settings} prefs=${prefs} />`;
    case 'page': return html`<${StaticPage} id=${b} />`;
    default: return html`<${Home} prefs=${prefs} />`;
  }
}

function PrivacyCover() {
  // P3: cover the window when the app goes to the background, so the
  // app-switcher snapshot doesn't show what's on screen.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const cover = () => setHidden(true);
    const uncover = () => setTimeout(() => { if (document.visibilityState === 'visible') setHidden(false); }, 120);
    const onVis = () => (document.visibilityState === 'hidden' ? cover() : uncover());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', cover);
    window.addEventListener('pageshow', uncover);
    if (coarse) { window.addEventListener('blur', cover); window.addEventListener('focus', uncover); }
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', cover);
      window.removeEventListener('pageshow', uncover);
      window.removeEventListener('blur', cover);
      window.removeEventListener('focus', uncover);
    };
  }, []);
  return hidden ? html`<div class="privacy-cover" aria-hidden="true"><${Mark} size=${96} /><p>${S.privacyCover}</p></div>` : null;
}

function App({ disclaimerVersion }) {
  const route = useStore(routeStore);
  const prefs = usePrefs();
  useEffect(() => applyTheme(prefs.theme), [prefs.theme]);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const fn = () => applyTheme(getPrefs().theme);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  // Move focus to the new screen's heading for screen readers, and scroll to top.
  useEffect(() => {
    window.scrollTo(0, 0);
    const h = document.querySelector('#main h1');
    if (h && document.activeElement === document.body) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }, [route.path]);

  const needsOnboarding = !prefs.onboardingComplete || prefs.disclaimerAcceptedVersion !== disclaimerVersion;
  const replay = route.parts[0] === 'onboarding';
  if (needsOnboarding || replay) {
    return html`<div id="app-shell" class="app"><main id="main" class="main"><${Onboarding} replay=${replay && !needsOnboarding}
      onDone=${(accepted) => {
        if (accepted) { setPref('disclaimerAcceptedVersion', disclaimerVersion); setPref('onboardingComplete', true); }
        if (replay) navigate('/settings', { replace: true }); else navigate('/', { replace: true });
      }} /></main></div>
      <${DialogHost} /><${ToastHost} /><${PrivacyCover} />`;
  }

  const active = tabFor(route.parts);
  const hideTabs = route.parts[0] === 'template' || (route.parts[0] === 'interview' && ['new', 'edit', 'run'].includes(route.parts[1]));
  return html`<div id="app-shell" class=${`app ${hideTabs ? 'no-tabs' : ''}`}>
      <a class="skip-link" href="#main" onClick=${(e) => { e.preventDefault(); document.querySelector('#main h1')?.focus(); }}>Skip to content</a>
      <main id="main" class="main"><${Screen} route=${route} prefs=${prefs} /></main>
      ${hideTabs ? null : html`<nav class="tabbar" aria-label="Main">
        ${TABS.map(([key, href, icon, label]) => html`<a href=${'#' + href} class=${`tab ${active === key ? 'on' : ''}`} aria-current=${active === key ? 'page' : undefined}
          onClick=${(e) => { e.preventDefault(); navigate(href); }}>
          <${Icon} name=${icon} /><span>${label}</span></a>`)}
      </nav>`}
    </div>
    <${DialogHost} /><${ToastHost} /><${PrivacyCover} />`;
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) toast(S.updateReady);
      });
    });
  }).catch(() => { /* offline support unavailable, the app still works while open */ });
}

async function start() {
  const root = document.getElementById('root');
  applyTheme(getPrefs().theme);
  try {
    const content = await loadContent();
    setContent(content);
    if (getPrefs().contentVersionSeen !== content.contentVersion) setPref('contentVersionSeen', content.contentVersion);
    root.textContent = '';
    render(html`<${App} disclaimerVersion=${content.pages.disclaimer.version} />`, root);
  } catch (e) {
    root.innerHTML = '<div class="boot-error"><h1>SayWotNow couldn’t start</h1><p>Please close the app and open it again.</p></div>';
    return;
  }
  registerServiceWorker();
}

start();
