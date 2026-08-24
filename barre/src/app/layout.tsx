import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Barre — studio operations',
  description: 'The operating system for running a dance studio.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        {/* First stop for a keyboard or screen-reader user on every page. */}
        <a href="#main"
           className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:left-3 focus:top-3
                      focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
