'use client';

/**
 * Social Insights Filters Component
 * Filtering controls for engagement level and media content
 */

interface SocialInsightsFiltersProps {
  includeImages: boolean;
  minEngagement: number;
  onFiltersChange: (filters: { includeImages: boolean; minEngagement: number }) => void;
  disabled?: boolean;
}

const engagementLevels = [
  { value: 0, label: 'All Posts', description: 'No minimum engagement' },
  { value: 3, label: 'Some Interest', description: '3+ likes/retweets' },
  { value: 5, label: 'Popular', description: '5+ likes/retweets' },
  { value: 10, label: 'Trending', description: '10+ likes/retweets' },
  { value: 25, label: 'Viral', description: '25+ likes/retweets' },
  { value: 50, label: 'Highly Viral', description: '50+ likes/retweets' }
];

export default function SocialInsightsFilters({ 
  includeImages, 
  minEngagement, 
  onFiltersChange, 
  disabled = false 
}: SocialInsightsFiltersProps) {
  
  const handleEngagementChange = (value: number) => {
    onFiltersChange({ includeImages, minEngagement: value });
  };

  const handleImageFilterChange = (checked: boolean) => {
    onFiltersChange({ includeImages: checked, minEngagement });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Engagement Level Filter */}
      <div className="flex items-center gap-3">
        <label 
          htmlFor="engagement-filter" 
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
        >
          Min Engagement:
        </label>
        <select
          id="engagement-filter"
          value={minEngagement}
          onChange={(e) => handleEngagementChange(parseInt(e.target.value))}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg
            bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
            focus:border-teal-500 focus:ring-1 focus:ring-teal-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {engagementLevels.map((level) => (
            <option key={level.value} value={level.value} title={level.description}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Image Filter Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeImages}
            onChange={(e) => handleImageFilterChange(e.target.checked)}
            disabled={disabled}
            className={`
              w-4 h-4 text-teal-600 bg-white border-zinc-300 rounded
              focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-zinc-800 
              focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300 select-none">
            Media posts only
          </span>
          <div className="group relative">
            <svg 
              className="w-4 h-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              Filter for posts containing images, videos, or other media
            </div>
          </div>
        </label>
      </div>

      {/* Active Filters Indicator */}
      {(minEngagement > 0 || includeImages) && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {[
              minEngagement > 0 && `${minEngagement}+ engagement`,
              includeImages && 'media only'
            ].filter(Boolean).join(', ')} active
          </span>
        </div>
      )}
    </div>
  );
}