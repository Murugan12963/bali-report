'use client';

import { useState } from 'react';
import { YouTubeVideo } from '@/lib/youtube-service';

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  showChannel?: boolean;
}

export default function YouTubeVideoCard({ 
  video, 
  size = 'medium', 
  showDescription = true,
  showChannel = true 
}: YouTubeVideoCardProps) {
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md', 
    large: 'max-w-lg'
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'podcasts': return '🎧';
      case 'videos': return '📺';
      case 'analysis': return '🔍';
      case 'interviews': return '🎤';
      default: return '🎬';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'podcasts': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'videos': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'analysis': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interviews': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${sizeClasses[size]} group`}>
      {/* Thumbnail with Play Overlay */}
      <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
        {!imageError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
            <span className="text-4xl text-zinc-400 dark:text-zinc-500">🎬</span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <button
            onClick={() => setIsEmbedOpen(!isEmbedOpen)}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 hover:scale-100 shadow-lg"
            title="Play Video"
          >
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
          {video.duration}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
            <span>{getCategoryIcon(video.category)}</span>
            {video.category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Video Embed (when expanded) */}
      {isEmbedOpen && (
        <div className="aspect-video bg-black">
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight">
          {video.title}
        </h3>

        {/* Channel Info */}
        {showChannel && (
          <div className="flex items-center gap-2 mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">{video.channelTitle}</span>
            <span>•</span>
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        )}

        {/* Description */}
        {showDescription && video.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
            {truncateDescription(video.description)}
          </p>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{video.viewCount}</span>
            </div>
            {video.likeCount && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{video.likeCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* YouTube Link */}
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Watch on YouTube"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: video.title,
                    text: `Check out this ${video.category} from ${video.channelTitle}`,
                    url: video.videoUrl,
                  });
                } else {
                  navigator.clipboard.writeText(video.videoUrl);
                }
              }}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              title="Share video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  +{video.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}