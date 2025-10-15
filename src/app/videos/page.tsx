import React from 'react';
import { Metadata } from 'next';
import VideosPageClient from './VideosPageClient';

// Static metadata for the multimedia page
export const metadata: Metadata = {
  title: 'Bali Reports | Multipolar Multimedia & Contrarian Opinions',
  description: 'Explore contrarian perspectives through podcasts, videos, and multimedia content. Independent analysis challenging mainstream narratives from a multipolar lens.',
  keywords: 'multipolar podcasts, contrarian opinion, independent media, BRICS multimedia, alternative perspectives, bali reports',
  openGraph: {
    title: 'Bali Reports | Multipolar Multimedia & Contrarian Opinions',
    description: 'Explore contrarian perspectives through podcasts, videos, and multimedia content.',
    type: 'website',
    url: 'https://bali.report/videos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bali Reports | Multipolar Multimedia & Contrarian Opinions',
    description: 'Explore contrarian perspectives through podcasts, videos, and multimedia content.',
  }
};

/**
 * Videos Page Server Component
 * 
 * Server component that handles metadata and renders the client component
 */
const VideosPage: React.FC = () => {
  return <VideosPageClient />;
};

export default VideosPage;