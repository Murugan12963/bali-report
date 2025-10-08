import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import ClientBackground from "@/components/ClientBackground";
import Analytics from "@/components/Analytics";
import MatomoAnalytics from "@/components/MatomoAnalytics";
import AdRecovery from "@/components/AdRecovery";
import PersonalizationProvider from "@/components/PersonalizationProvider";
import BottomNavigation, { defaultNavItems } from "@/components/pwa/BottomNavigation";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport = "width=device-width, initial-scale=1";

export const metadata: Metadata = {
  metadataBase: new URL("https://bali.report"),
  title: {
    template: "%s | Bali Report",
    default: "Bali Report - Multi-polar News Perspectives",
  },
  description:
    "Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights. Breaking free from Western media monopoly with real-time RSS feeds from 400+ articles daily.",
  keywords:
    "BRICS news, Indonesia news, alternative media, multipolar, Russia, China, India, Brazil, South Africa, Southeast Asia, Bali local news",
  authors: [{ name: "Bali Report" }],
  creator: "Bali Report",
  publisher: "Bali Report",
  // PWA metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bali Report",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bali.report",
    siteName: "Bali Report",
    title: "Bali Report - Multi-polar News Perspectives",
    description:
      "Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights. Breaking free from Western media monopoly.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Bali Report - Multi-polar News Perspectives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bali Report - Multi-polar News Perspectives",
    description:
      "Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights.",
    images: ["/og-image.svg"],
  },
  robots: "index, follow",
  category: "news",
  // Additional PWA meta
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Bali Report",
    "application-name": "Bali Report",
    "msapplication-TileColor": "#0d9488",
    "theme-color": "#0d9488",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Adsterra Verification */}
        <meta
          name="adsterra-verification"
          content="your-adsterra-verification-code"
        />

        {/* PWA icons */}
        <link
          rel="icon"
          href="/icons/icon-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="mask-icon" href="/icons/icon-base.svg" color="#0d9488" />
	\t<link rel="stylesheet" href="/anti-adblock.css" />
      </head>
      <body
        className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} font-body antialiased theme-transition min-h-screen`}
      >
        {/* Service worker registration */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('🌺 SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('❌ SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
          <Analytics />
	\t\t<AdRecovery />
          <Suspense fallback={null}>
            <MatomoAnalytics />
          </Suspense>
          {/* Adsterra Script */}
          {process.env.NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID && (
            <Script
              id="adsterra-script"
              strategy="lazyOnload"
              src="//www.highperformancedformats.com/atTag.js"
            />
          )}
          <PersonalizationProvider>
            <ErrorBoundary>
              {/* Futuristic Background Effects (dark mode only) - Temporarily disabled for debugging */}
              {/* <ClientBackground /> */}

              <div className="contents relative z-10">
                <Header />
                <main className="relative">{children}</main>
                {/* PWA Bottom Navigation */}
                <BottomNavigation items={defaultNavItems} />
              </div>
            </ErrorBoundary>
          </PersonalizationProvider>
      </body>
    </html>
  );
}
