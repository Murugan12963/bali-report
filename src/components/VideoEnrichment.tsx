'use client';

/**
 * Video Enrichment Component
 * Uses Grok AI to analyze YouTube videos and generate enhanced descriptions
 * Focuses on sustainable development and Bali cultural connections
 */

import React, { useState, useEffect } from 'react';
import { VideoEnrichment } from '@/lib/grok-enhanced-service';

interface VideoEnrichmentProps {
  videoTitle: string;
  videoDescription: string;
  thumbnailUrl?: string;
  className?: string;
}

interface EnrichmentData {
  enrichment: VideoEnrichment | null;
  fallback: boolean;
  disclaimer?: string;
  error?: string;
  timestamp?: string;
}

export default function VideoEnrichmentComponent({ 
  videoTitle,
  videoDescription,
  thumbnailUrl,
  className = '' 
}: VideoEnrichmentProps) {
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData>({
    enrichment: null,
    fallback: true
  });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (videoTitle && videoDescription) {
      enrichVideo();
    }
  }, [videoTitle, videoDescription, thumbnailUrl]);

  const enrichVideo = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/grok-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'enrich-video',
          data: {
            title: videoTitle,
            description: videoDescription,
            thumbnailUrl
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: EnrichmentData = await response.json();
      setEnrichmentData(data);
      
      // Track analytics event
      if (typeof window !== 'undefined' && (window as any)._paq) {
        (window as any)._paq.push([
          'trackEvent', 
          'Video Enrichment', 
          'AI Analysis', 
          data.fallback ? 'Fallback' : 'Grok AI',
          data.enrichment?.sustainabilityTags.length || 0
        ]);
      }
    } catch (err) {
      console.error('Failed to enrich video:', err);
      setEnrichmentData({
        enrichment: {
          title: videoTitle,
          description: 'Enhanced video content promoting sustainable development and multicultural understanding.',
          altText: `Video: ${videoTitle}`,
          sustainabilityTags: ['sustainability', 'development'],
          baliConnection: 'Promotes sustainable development values aligned with Bali\'s environmental commitments.',
          accessibilityDescription: `Video content: ${videoTitle}`,
          keyMoments: []
        },
        fallback: true,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        disclaimer: 'Menggunakan deskripsi standar karena AI tidak tersedia.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    enrichVideo();
  };

  if (!videoTitle || !videoDescription) {
    return null;
  }

  if (loading && !enrichmentData.enrichment) {
    return (
      <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            🎬 AI Video Enhancement
          </h4>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
        </div>
        
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-zinc-600 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-zinc-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!enrichmentData.enrichment) {
    return null;
  }

  const { enrichment } = enrichmentData;

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 border-l-4 border-teal-500 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          🎬 AI Video Enhancement
          {enrichmentData.fallback && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
              {enrichmentData.error ? 'Error Mode' : 'Fallback Mode'}
            </span>
          )}
        </h4>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            title={expanded ? 'Collapse details' : 'Expand details'}
          >
            <svg className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors disabled:opacity-50"
            title="Refresh enhancement"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error State */}
      {enrichmentData.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-red-800 dark:text-red-200">AI Enhancement Unavailable</span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300">{enrichmentData.error}</p>
        </div>
      )}

      {/* Enhanced Description */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium text-zinc-900 dark:text-white flex items-center">
            <span className="mr-1">📝</span>
            Enhanced Description
          </h5>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {enrichment.description}
        </p>
      </div>

      {/* Sustainability Tags */}
      {enrichment.sustainabilityTags.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
            <span className="mr-1">🌱</span>
            Sustainability Focus
          </h5>
          <div className="flex flex-wrap gap-2">
            {enrichment.sustainabilityTags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bali Connection */}
      {enrichment.baliConnection && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded border border-orange-200 dark:border-orange-700">
          <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
            <span className="mr-1">🏝️</span>
            Bali Connection
          </h5>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {enrichment.baliConnection}
          </p>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-4">
          {/* Accessibility Description */}
          <div>
            <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
              <span className="mr-1">♿</span>
              Accessibility Description
            </h5>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 p-3 rounded">
              {enrichment.accessibilityDescription}
            </p>
          </div>

          {/* Alt Text for Screen Readers */}
          <div>
            <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
              <span className="mr-1">🔊</span>
              Screen Reader Alt Text
            </h5>
            <code className="text-xs text-zinc-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 p-2 rounded block">
              alt="{enrichment.altText}"
            </code>
          </div>

          {/* Key Moments */}
          {enrichment.keyMoments.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
                <span className="mr-1">⏰</span>
                Key Moments
              </h5>
              <div className="space-y-2">
                {enrichment.keyMoments.map((moment, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-zinc-800 rounded">
                    <span className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded">
                      {moment.timestamp}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 flex-1">
                      {moment.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {enrichmentData.timestamp && (
              <span>Enhanced: {new Date(enrichmentData.timestamp).toLocaleString('id-ID')}</span>
            )}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${enrichmentData.fallback ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span>{enrichmentData.fallback ? 'Fallback Mode' : 'AI Enhanced'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Powered by</span>
            <span className="font-medium text-teal-600 dark:text-teal-400">Grok Vision</span>
          </div>
        </div>
        
        {enrichmentData.disclaimer && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
            <p>{enrichmentData.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}