'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import { Button, ErrorState } from '@/components/ui';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/** Registers the service worker once (R-017). */
export function PwaSetup() {
  React.useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => undefined);
  }, []);
  return null;
}

/** When a school is branded, "Add to Home Screen" uses its name and colour. */
export function useBrandedManifest(name: string | null | undefined, colour: string | null | undefined) {
  React.useEffect(() => {
    if (!name) return;
    const origin = location.origin;
    const manifest = {
      name, short_name: name.length > 12 ? name.split(' ')[0] : name, start_url: `${origin}${base}/`, scope: `${origin}${base}/`,
      display: 'standalone', background_color: '#ffffff', theme_color: colour ?? '#5b46d9',
      icons: [192, 512].map(s => ({ src: `${origin}${base}/icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png' })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const before = link?.href;
    if (!link) { link = Object.assign(document.createElement('link'), { rel: 'manifest' }); document.head.appendChild(link); }
    link.href = url;
    return () => { if (link && before) link.href = before; URL.revokeObjectURL(url); };
  }, [name, colour]);
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
    return <p className="text-[12.5px] text-ink-3">Phone alerts start once your school’s app is hosted. On an iPhone, add the app to your Home Screen first.</p>;
  }
  return (
    <div className="space-y-1.5">
      {state === 'on' ? <p className="flex items-center gap-1.5 text-sm"><BellRing className="size-4 text-positive" aria-hidden /> Phone alerts are on for this device.</p>
        : <Button size="sm" loading={on.isPending} disabled={state === 'blocked'} onClick={() => on.mutate()}><BellRing className="size-4" aria-hidden /> Turn on phone alerts</Button>}
      {state === 'blocked' && <p className="text-[12.5px] text-ink-3">Notifications are blocked for this site — allow them in your browser’s settings.</p>}
      {on.error != null && <ErrorState error={on.error} />}
    </div>
  );
}
