import { useState, useEffect } from 'react';
import { useSavedSearches } from '@/contexts/UserProfileContext';
import { SavedSearch } from '@/types/user';

interface SearchSuggestion {
  type: 'recent' | 'saved' | 'trending' | 'topic';
  text: string;
  source?: SavedSearch;
  score?: number;
}

const TRENDING_TOPICS = [
  'BRICS Development Bank',
  'BRICS Expansion',
  'BRICS Currency',
  'Indonesia BRICS Membership',
  'BRICS Trade Agreement'
];

export function useSearchSuggestions(query: string) {
  const { searches } = useSavedSearches();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      // Return trending and recent searches when no query
      const trendingSuggestions: SearchSuggestion[] = TRENDING_TOPICS
        .slice(0, 3)
        .map(topic => ({
          type: 'trending',
          text: topic
        }));

      const recentSearches: SearchSuggestion[] = searches
        .slice(0, 3)
        .map(search => ({
          type: 'recent',
          text: search.query,
          source: search
        }));

      setSuggestions([...trendingSuggestions, ...recentSearches]);
      return;
    }

    const getSuggestions = async () => {
      setIsLoading(true);
      try {
        // Filter saved searches
        const savedMatches = searches
          .filter(search => 
            search.query.toLowerCase().includes(query.toLowerCase()) ||
            search.name.toLowerCase().includes(query.toLowerCase())
          )
          .map(search => ({
            type: 'saved' as const,
            text: search.query,
            source: search
          }));

        // Filter trending topics
        const trendingMatches = TRENDING_TOPICS
          .filter(topic => 
            topic.toLowerCase().includes(query.toLowerCase())
          )
          .map(topic => ({
            type: 'trending' as const,
            text: topic
          }));

        // TODO: Add API call for dynamic topic suggestions
        const topicSuggestions: SearchSuggestion[] = [];

        // Combine and sort suggestions
        const allSuggestions = [
          ...savedMatches,
          ...trendingMatches,
          ...topicSuggestions
        ];

        // Sort by relevance - saved searches first, then trending, then topics
        const sortedSuggestions = allSuggestions.sort((a, b) => {
          // Prioritize exact matches
          const aExact = a.text.toLowerCase() === query.toLowerCase();
          const bExact = b.text.toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Then by type
          const typeOrder = { saved: 0, trending: 1, topic: 2, recent: 3 };
          return typeOrder[a.type] - typeOrder[b.type];
        });

        setSuggestions(sortedSuggestions.slice(0, 8)); // Limit to 8 suggestions
      } catch (error) {
        console.error('Error getting search suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      getSuggestions();
    }, 150); // Debounce suggestions to prevent too many updates

    return () => clearTimeout(debounceTimer);
  }, [query, searches]);

  return {
    suggestions,
    isLoading
  };
}