import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Analytics from "@/components/Analytics";
import PersonalizationProvider from "@/components/PersonalizationProvider";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
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

        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
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
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased theme-transition`}
      >
        <ThemeProvider>
          <Analytics />
          {/* Adsterra Script */}
          {process.env.NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if (typeof window !== 'undefined' && window.atag === undefined) {
                    const script = document.createElement('script');
                    script.src = '//www.highperformancedformats.com/atTag.js';
                    script.async = true;
                    document.head.appendChild(script);
                  }
                `,
              }}
            />
          )}
          <PersonalizationProvider>
            <Header />
            {children}
          </PersonalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
