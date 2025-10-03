'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side wrapper for FuturisticBackground
 * Prevents SSR issues by dynamically importing with ssr: false
 */
const FuturisticBackground = dynamic(
  () => import('./FuturisticBackground'),
  { ssr: false }
);

export default function ClientBackground() {
  return <FuturisticBackground />;
}
