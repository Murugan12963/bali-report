"use client";

import React, { useState, useMemo, useEffect } from 'react';
import VideoCard from '@/components/VideoCard';
import { VideoService, VideoContent } from '@/lib/video-service';
import { VideoCrawler } from '@/lib/video-crawler';
import { videoCache } from '@/lib/video-cache';

type CategoryFilter = 'all' | 'BRICS' | 'Indonesia' | 'Bali';
type SortOption = 'newest' | 'popular' | 'duration';

/**
 * Videos Page Client Component
 * 
 * Client component with real Rumble video fetching functionality
 */
const VideosPageClient: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = videoCache.get();
        if (cached && cached.length > 0) {
          console.log('📹 Using cached videos');
          setVideos(cached);
          setLoading(false);
          return;
        }

        // Fetch from Rumble
        console.log('📹 Fetching videos from Rumble...');
        const crawler = new VideoCrawler();
        const fetchedVideos = await crawler.fetchAllVideos();

        if (fetchedVideos.length > 0) {
          setVideos(fetchedVideos);
          videoCache.set(fetchedVideos);
          console.log(`✅ Loaded ${fetchedVideos.length} videos from Rumble`);
        } else {
          // Fallback to mock data if no videos fetched
          console.log('⚠️ No videos fetched, using mock data as fallback');
          const mockVideos = VideoService.getAllVideos();
          setVideos(mockVideos);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Showing cached content.');
        
        // Fallback to mock data on error
        const mockVideos = VideoService.getAllVideos();
        setVideos(mockVideos);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Get filtered and sorted videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(video => video.category === categoryFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case 'popular':
        result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'duration':
        result = result.sort((a, b) => {
          const parseDuration = (duration: string) => {
            if (duration === 'N/A') return 0;
            const parts = duration.split(':').map(Number);
            return parts.reduce((acc, time) => (60 * acc) + time, 0);
          };
          return parseDuration(b.duration) - parseDuration(a.duration);
        });
        break;
      case 'newest':
      default:
        result = result.sort((a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
    }

    return result;
  }, [videos, searchQuery, categoryFilter, sortOption]);

  const videoStats = useMemo(() => {
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
    
    const categoryCounts = videos.reduce((counts, video) => {
      counts[video.category] = (counts[video.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const sourceCounts = videos.reduce((counts, video) => {
      counts[video.source] = (counts[video.source] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalVideos,
      totalViews,
      averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
      categoryCounts,
      sourceCounts
    };
  }, [videos]);

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'BRICS': return '🌍';
      case 'Indonesia': return '🇮🇩';
      case 'Bali': return '🏝️';
      default: return '📺';
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    videoCache.clear();
    setLoading(true);
    
    try {
      const crawler = new VideoCrawler();
      const fetchedVideos = await crawler.fetchAllVideos();
      
      if (fetchedVideos.length > 0) {
        setVideos(fetchedVideos);
        videoCache.set(fetchedVideos);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing videos:', err);
      setError('Failed to refresh videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">📺</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Video Library
              </h1>
            </div>
            <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl">
              Watch exclusive video content from Rumble channels including RT News, CGTN, Press TV, 
              and independent analysts. Alternative perspectives on global events and BRICS cooperation.
            </p>
            
            {/* Video Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 4h6V3H9v1zm7 7v6H8v-6h8z" />
                </svg>
                <span className="font-medium">{videoStats.totalVideos} Videos</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">{Object.keys(videoStats.sourceCounts).length} Sources</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Category Filter */}
              <div className="flex bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-1">
                {(['all', 'BRICS', 'Indonesia', 'Bali'] as CategoryFilter[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {category === 'all' ? '📺 All' : `${getCategoryEmoji(category)} ${category}`}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">🕒 Newest</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="duration">⏱️ Longest</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || categoryFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Active filters:</span>
              {searchQuery && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm">
                  Category: {categoryFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-zinc-600 dark:text-zinc-400">Loading videos from Rumble...</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && filteredVideos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  size="medium"
                  showDescription={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No videos found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPageClient;
