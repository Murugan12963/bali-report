/**
 * Social Insights Page - BRICS Section
 * Real-time social media insights from X.com API v2
 * Mobile-first design with Tailwind CSS
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import SocialInsightsContent from '@/components/social-insights/SocialInsightsContent';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Social Insights',
  description: 'Real-time social media insights on BRICS, multipolarity, and sustainable development from verified sources. Enhanced news aggregation with X.com integration.',
  keywords: 'BRICS social media, Twitter insights, multipolarity discussion, sustainable development tweets, Indonesia social insights, verified news sources',
  openGraph: {
    title: 'BRICS Social Insights | Bali Report',
    description: 'Real-time social media perspectives on BRICS partnerships and sustainable development',
    type: 'website',
    images: [
      {
        url: '/og-social-insights.jpg',
        width: 1200,
        height: 630,
        alt: 'BRICS Social Insights Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BRICS Social Insights | Bali Report',
    description: 'Real-time social media perspectives on BRICS partnerships and sustainable development'
  }
};

export default function SocialInsightsPage() {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'BRICS', href: '/brics' },
    { name: 'Social Insights', href: '/brics/social-insights', current: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Page Header */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
            Social Insights
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Real-time social media perspectives on BRICS partnerships, multipolarity, and sustainable development
          </p>
          
          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-500 dark:text-zinc-400">
              Live social media monitoring active
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <Suspense 
          fallback={
            <div className="space-y-6">
              {/* Loading State */}
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-zinc-600 dark:text-zinc-300 animate-pulse">
                    Loading social insights...
                  </p>
                </div>
              </div>
              
              {/* Skeleton Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-zinc-800 rounded-xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                        <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      <div className="w-1/2 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                    <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                        <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      </div>
                      <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <SocialInsightsContent />
        </Suspense>
      </main>

      {/* Footer Info */}
      <footer className="container mx-auto px-4 pb-8">
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
              About Social Insights
            </h3>
            <p className="text-teal-700 dark:text-teal-300 max-w-4xl mx-auto text-sm leading-relaxed">
              Our Social Insights feature aggregates verified social media content related to BRICS partnerships, 
              multipolarity, and sustainable development. We filter for high-engagement posts from credible sources, 
              providing real-time perspectives that complement our traditional RSS news feeds. Content is updated 
              hourly and cached for optimal performance while respecting rate limits.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                ✅ Verified Sources Only
              </span>
              <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                🔄 Hourly Updates  
              </span>
              <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                🛡️ Content Moderation
              </span>
              <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                📊 GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}