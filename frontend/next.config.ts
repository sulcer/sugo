import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  poweredByHeader: false,
  agentRules: false,
  experimental: {
    // 4 MB of drawings plus multipart overhead, under Vercel's 4.5 MB cap on request bodies.
    serverActions: { bodySizeLimit: '4.5mb' },
    // Slovenian sheets live at the root through a proxy rewrite (/kontakt → /sl/kontakt). Having
    // learned /[locale] from /de and /en, the router would predict /kontakt to be a locale and
    // prefetch a page that does not exist; asking the server for each route tree avoids that.
    optimisticRouting: false,
    // Unknown URLs the proxy skips (with a dot) render app/global-not-found.tsx, not Next's bare 404.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
