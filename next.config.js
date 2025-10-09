/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Image optimization for RSS feed images
  images: {
    remotePatterns: [
      // Allow images from known news sources
      { protocol: "https", hostname: "www.rt.com" },
      { protocol: "https", hostname: "tass.com" },
      { protocol: "https", hostname: "www.xinhuanet.com" },
      { protocol: "https", hostname: "www.aljazeera.com" },
      { protocol: "https", hostname: "www.cgtn.com" },
      { protocol: "https", hostname: "www.chinadaily.com.cn" },
      { protocol: "https", hostname: "sputnikglobe.com" },
      { protocol: "https", hostname: "www.antaranews.com" },
      { protocol: "https", hostname: "feeds.bbci.co.uk" },
      { protocol: "https", hostname: "cdn.ndtv.com" },
      { protocol: "https", hostname: "www.presstv.ir" },
      { protocol: "https", hostname: "www.scmp.com" },
      { protocol: "https", hostname: "jakartaglobe.id" },
      { protocol: "https", hostname: "www.thejakartapost.com" },
      { protocol: "https", hostname: "www.balipost.com" },
      { protocol: "https", hostname: "indonesiabusinesspost.com" },
      { protocol: "https", hostname: "www.tempo.co" },
      // Allow CDN and image hosting services
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      // Allow all HTTPS for flexibility with RSS feed images
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // PWA Configuration
  experimental: {
    webpackBuildWorker: true,
  },
  // Headers for PWA, caching, and security
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script sources - specified domains only
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.highperformanceformats.com https://displaycontentnetwork.com https://adsterra.com https://js.stripe.com data: blob:",
              "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.highperformanceformats.com https://displaycontentnetwork.com https://adsterra.com https://js.stripe.com data:",
              // Image sources - allow HTTPS images from news sources
              "img-src 'self' data: https: blob:",
              // Connect sources - API and analytics
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.highperformanceformats.com https://displaycontentnetwork.com https://adsterra.com https://api.stripe.com wss: blob:",
              // Frame sources - embeds and payments
              "frame-src 'self' https://www.google.com https://www.highperformanceformats.com https://displaycontentnetwork.com https://adsterra.com https://js.stripe.com https://hooks.stripe.com blob:",
              // Style sources
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
              // Font sources
              "font-src 'self' https://fonts.gstatic.com data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
