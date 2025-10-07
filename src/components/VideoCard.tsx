"use client";

import React, { useState } from 'react';
import { VideoContent, VideoService } from '@/lib/video-service';

interface VideoCardProps {
  video: VideoContent;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  className?: string;
}

/**
 * VideoCard Component
 * 
 * Displays video content with thumbnail, metadata, and embedded player.
 * Supports different sizes and layouts for various use cases.
 */
const VideoCard: React.FC<VideoCardProps> = ({
  video,
  size = 'medium',
  showDescription = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'max-w-sm',
      thumbnail: 'h-32',
      title: 'text-sm font-medium',
      description: 'text-xs',
      metadata: 'text-xs'
    },
    medium: {
      container: 'max-w-md',
      thumbnail: 'h-48',
      title: 'text-base font-semibold',
      description: 'text-sm',
      metadata: 'text-xs'
    },
    large: {
      container: 'max-w-2xl',
      thumbnail: 'h-64 md:h-80',
      title: 'text-lg md:text-xl font-bold',
      description: 'text-base',
      metadata: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BRICS':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600';
      case 'Indonesia':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600';
      case 'Bali':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-600';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-600';
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    return `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop&crop=center`;
  };

  return (
    <article className={`${config.container} bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Video Player / Thumbnail */}
      <div className={`relative ${config.thumbnail} bg-zinc-100 dark:bg-zinc-800 overflow-hidden group`}>
        {!isPlaying ? (
          <>
            <img
              src={imageError ? getFallbackImage() : video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handlePlayClick}
                className="bg-white/90 hover:bg-white text-zinc-900 rounded-full p-3 md:p-4 shadow-lg transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Play ${video.title}`}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>

            {/* Category Badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(video.category)}`}>
              {video.category}
            </div>
          </>
        ) : (
          <div className="w-full h-full">
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className={`${config.title} text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
          <a 
            href={video.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {video.title}
          </a>
        </h3>

        {/* Description */}
        {showDescription && (
          <p className={`${config.description} text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-3`}>
            {video.description}
          </p>
        )}

        {/* Metadata */}
        <div className={`${config.metadata} text-zinc-500 dark:text-zinc-500 space-y-2`}>
          {/* Source and Date */}
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">{video.source}</span>
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(video.publishDate)}
            </span>
          </div>

          {/* Views and Tags */}
          <div className="flex items-center justify-between">
            {video.views && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {VideoService.formatViews(video.views)} views
              </span>
            )}
            
            {/* Top Tags */}
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handlePlayClick}
            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch
          </button>

          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <button 
              className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Share video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>

            {/* Bookmark Button */}
            <button 
              className="p-2 text-zinc-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
              title="Save for later"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;