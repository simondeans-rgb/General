import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Installable on a phone's home screen (R-017). A school's own name and
 *  colour replace these at run time once it is branded (see PwaSetup). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Barre',
    short_name: 'Barre',
    description: 'Your dance school: classes, messages, payments and progress.',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5b46d9',
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
