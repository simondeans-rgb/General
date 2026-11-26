import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Installable on a phone's home screen (R-017). A school's own name and
 *  colour replace these at run time once it is branded (see PwaSetup). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Swayvo',
    short_name: 'Swayvo',
    description: 'Your dance school, on the count: classes, registers, payments, messages and progress.',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#f4f5f8',
    theme_color: '#2638f0',
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
