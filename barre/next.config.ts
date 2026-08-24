import type { NextConfig } from 'next';

/* The demo is published as a static export under a sub-path on GitHub Pages.
   Everything else about the app is written so it can move to a server
   deployment (Vercel, self-hosted) without restructuring — see
   docs/ARCHITECTURE.md, "Two runtimes, one codebase". */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  typedRoutes: false,
};

export default config;
