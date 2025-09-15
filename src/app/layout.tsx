import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Bali Report',
    default: 'Bali Report - Multi-polar News Perspectives'
  },
  description: 'Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights. Breaking free from Western media monopoly with real-time RSS feeds from 400+ articles daily.',
  keywords: 'BRICS news, Indonesia news, alternative media, multipolar, Russia, China, India, Brazil, South Africa, Southeast Asia, Bali local news',
  authors: [{ name: 'Bali Report' }],
  creator: 'Bali Report',
  publisher: 'Bali Report',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bali.report',
    siteName: 'Bali Report',
    title: 'Bali Report - Multi-polar News Perspectives',
    description: 'Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights. Breaking free from Western media monopoly.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bali Report - Multi-polar News Perspectives'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bali Report - Multi-polar News Perspectives',
    description: 'Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights.',
    images: ['/og-image.jpg']
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  category: 'news'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
