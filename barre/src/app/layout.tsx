import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { THEME_COLOR } from '@/lib/swayvo-logo';

export const metadata: Metadata = {
  title: 'Swayvo',
  description: 'More time for dance. Classes, registers, payments, messages and progress for dance schools.',
  appleWebApp: { capable: true, title: 'Swayvo', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/brand/swayvo-favicon.svg`, type: 'image/svg+xml' },
           { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/brand/swayvo-favicon-32.png`, sizes: '32x32', type: 'image/png' }],
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_COLOR,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        {/* First stop for a keyboard or screen-reader user on every page. */}
        <a href="#main"
           className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:left-3 focus:top-3
                      focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
