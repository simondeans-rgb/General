'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import { Button, ErrorState } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { installIdentity, iconLayout, manifestFor, type InstallIdentity, type InstallSchool } from '@/lib/install-identity';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/** Registers the service worker once (R-017). */
export function PwaSetup() {
  React.useEffect(() => {
    // Off in development (it would cache stale chunks), unless a test of the
    // offline register asks for it with NEXT_PUBLIC_SW_IN_DEV=1.
    if (!('serviceWorker' in navigator) || (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SW_IN_DEV !== '1')) return;
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => undefined);
    // Hand the worker what this page loaded, so the app (and the database in
    // the browser) opens with no signal next time (UR-04).
    try { performance.setResourceTimingBufferSize(2000); } catch { /* older browsers */ }
    const warm = () => navigator.serviceWorker.ready.then(reg => {
      const urls = performance.getEntriesByType('resource').map(e => e.name)
        .filter(u => /\/(_next\/static|pglite|icons)\//.test(u));
      reg.active?.postMessage({ type: 'warm', urls: [...new Set(urls)] });
    }).catch(() => undefined);
    const t = setTimeout(warm, 4000);
    const i = setInterval(warm, 30_000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);
  return null;
}

/* ── The school's own home-screen identity (round-2 review, F4) ──────────
   This demo is a static export, so app/manifest.ts is written once, as
   Swayvo's. Signed in to a school, the browser makes that school's version:
   icons drawn on a canvas (its logo on a white plate on its colour, or its
   initials), a manifest as a blob: URL with those icons as data: URLs, and the
   iOS pieces (apple-touch-icon, apple-mobile-web-app-title), which Safari
   reads from the page at the moment "Add to Home Screen" is tapped. Signing
   out, or opening Swayvo's console, puts Swayvo's back. A hosted deployment
   can serve the same thing from a per-school route instead (lib/install-identity). */

const iconCache = new Map<string, Promise<string>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode();
  return img;
}

/** A square PNG icon as a data: URL. Falls back to initials if the logo can't be drawn (e.g. no CORS). */
export function drawSchoolIcon(id: InstallIdentity, size: number, maskable = false): Promise<string> {
  const key = [id.name, id.icon.ground, id.icon.ink, id.icon.logo?.length ?? 0, id.icon.logo?.slice(-48), size, maskable].join('|');
  let p = iconCache.get(key);
  if (!p) { p = paint(id, size, maskable); iconCache.set(key, p); }
  return p;
}

async function paint(id: InstallIdentity, size: number, maskable: boolean): Promise<string> {
  const L = iconLayout(size, maskable);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return '';
  const ground = () => { g.clearRect(0, 0, size, size); g.fillStyle = id.icon.ground; g.fillRect(0, 0, size, size); };
  if (id.icon.logo) {
    try {
      const img = await loadImage(id.icon.logo);
      ground();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.roundRect(L.plate.x, L.plate.y, L.plate.size, L.plate.size, L.plate.radius); g.fill();
      const w = img.naturalWidth || 1, h = img.naturalHeight || 1, k = Math.min(L.logo.size / w, L.logo.size / h);
      g.drawImage(img, L.logo.x + (L.logo.size - w * k) / 2, L.logo.y + (L.logo.size - h * k) / 2, w * k, h * k);
      return canvas.toDataURL('image/png');   // throws on a tainted canvas
    } catch { /* initials below */ }
  }
  ground();
  const font = `800 ${L.initials.fontSize}px "Archivo Variable", Archivo, "Arial Black", sans-serif`;
  try { await document.fonts?.load(font); } catch { /* system font */ }
  g.fillStyle = id.icon.ink;
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(id.icon.initials || id.shortName.slice(0, 2).toUpperCase(), L.initials.x, L.initials.y + L.initials.fontSize * 0.04);
  return canvas.toDataURL('image/png');
}

/** Points a <link> or <meta> at a value for as long as the school applies, then puts it back. */
function swap(selector: string, make: () => HTMLElement, attr: 'href' | 'content', value: string): () => void {
  let el = document.head.querySelector<HTMLElement>(selector);
  const created = !el;
  if (!el) { el = make(); document.head.appendChild(el); }
  const before = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => { if (created) el!.remove(); else if (before != null) el!.setAttribute(attr, before); };
}

/** When a school is chosen, "Add to Home Screen" installs that school: its name, colours and icon. */
export function useBrandedInstall(school: InstallSchool | null | undefined) {
  const id = installIdentity(school);
  const key = id.school ? JSON.stringify([id.name, id.themeColor, id.icon.ground, id.icon.logo?.length ?? 0, id.icon.logo?.slice(-48)]) : '';
  const ref = React.useRef(id);
  ref.current = id;
  React.useEffect(() => {
    if (!key) return;
    const me = ref.current;
    let off = false;
    const undo: (() => void)[] = [];
    (async () => {
      const [i192, i512, m512, apple] = await Promise.all([
        drawSchoolIcon(me, 192), drawSchoolIcon(me, 512), drawSchoolIcon(me, 512, true), drawSchoolIcon(me, 180)]);
      if (off || !i192) return;
      const manifest = manifestFor(me, location.origin, base, [
        { src: i192, sizes: '192x192', type: 'image/png' },
        { src: i512, sizes: '512x512', type: 'image/png' },
        { src: m512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]);
      const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
      undo.push(() => URL.revokeObjectURL(url));
      undo.push(swap('link[rel="manifest"]', () => Object.assign(document.createElement('link'), { rel: 'manifest' }), 'href', url));
      undo.push(swap('link[rel="apple-touch-icon"]', () => Object.assign(document.createElement('link'), { rel: 'apple-touch-icon' }), 'href', apple));
      undo.push(swap('meta[name="apple-mobile-web-app-title"]',
        () => Object.assign(document.createElement('meta'), { name: 'apple-mobile-web-app-title' }), 'content', me.shortName));
      undo.push(swap('meta[name="application-name"]',
        () => Object.assign(document.createElement('meta'), { name: 'application-name' }), 'content', me.shortName));
    })();
    return () => { off = true; undo.reverse().forEach(f => f()); };
  }, [key]);
}

/* The browser's own install prompt (Chrome, Edge, Android). It fires once,
   early, so it is caught here at load and kept for the install guide. */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let deferredPrompt: InstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e as InstallPromptEvent; promptListeners.forEach(f => f()); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; promptListeners.forEach(f => f()); });
}

/** The waiting install prompt, if the browser offered one, and a way to show it. */
export function useInstallPrompt() {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => { promptListeners.add(rerender); return () => { promptListeners.delete(rerender); }; }, []);
  return {
    available: !!deferredPrompt,
    async prompt() {
      const e = deferredPrompt;
      if (!e) return false;
      await e.prompt();
      const { outcome } = await e.userChoice;
      deferredPrompt = null;
      promptListeners.forEach(f => f());
      return outcome === 'accepted';
    },
  };
}

/** True when the app is already running from the home screen. */
export function runningInstalled() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

const b64 = (s: string) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const raw = atob((s + p).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); };

/** Phone alerts on this device. Needs the hosted app's public key. */
export function PushToggle() {
  const { session } = useSession();
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const [state, setState] = React.useState<'off' | 'on' | 'blocked'>(() =>
    typeof Notification !== 'undefined' && Notification.permission === 'denied' ? 'blocked' : 'off');
  React.useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.getRegistration(`${base}/`).then(r => r?.pushManager.getSubscription()).then(s => s && setState('on')).catch(() => undefined);
  }, [supported]);
  const on = useMutation({
    mutationFn: async () => {
      if ((await Notification.requestPermission()) !== 'granted') { setState('blocked'); throw new Error('Notifications are blocked for this site in your browser settings.'); }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await runAs(session, q => q(`select app.save_push_subscription($1, $2, $3, $4)`, [j.endpoint, j.keys.p256dh, j.keys.auth, navigator.userAgent]));
      setState('on');
    },
  });
  if (!supported || !VAPID) {
    return <p className="text-[0.8125rem] text-ink-3">Phone alerts start once your school’s app is hosted. On an iPhone, add the app to your Home Screen first.</p>;
  }
  return (
    <div className="space-y-1.5">
      {state === 'on' ? <p className="text-sm"><span className="font-semibold text-positive">On.</span> Phone alerts reach this device.</p>
        : <Button size="sm" loading={on.isPending} disabled={state === 'blocked'} onClick={() => on.mutate()}><BellRing className="size-4" aria-hidden /> Turn on phone alerts</Button>}
      {state === 'blocked' && <p className="text-[0.8125rem] text-ink-3">Notifications are blocked for this site — allow them in your browser’s settings.</p>}
      {on.error != null && <ErrorState error={on.error} />}
    </div>
  );
}
