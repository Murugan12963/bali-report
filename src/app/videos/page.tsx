import React from 'react';
import { Metadata } from 'next';
import VideosPageClient from './VideosPageClient';

// Static metadata for the videos page
export const metadata: Metadata = {
  title: 'Videos | Bali Report - BRICS & Indonesia Video Content',
  description: 'Watch exclusive videos from BRICS sources, Indonesian news outlets, and Balinese media. Alternative perspectives on global events, infrastructure, and cultural stories.',
  keywords: 'BRICS videos, Indonesia videos, Bali videos, RT News, CGTN, Press TV, documentary, news videos',
  openGraph: {
    title: 'Videos | Bali Report - BRICS & Indonesia Video Content',
    description: 'Watch exclusive videos from BRICS sources, Indonesian news outlets, and Balinese media.',
    type: 'website',
    url: 'https://bali.report/videos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Videos | Bali Report - BRICS & Indonesia Video Content',
    description: 'Watch exclusive videos from BRICS sources, Indonesian news outlets, and Balinese media.',
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