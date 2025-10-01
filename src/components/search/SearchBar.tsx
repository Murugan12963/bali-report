'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useSavedSearches } from '@/contexts/UserProfileContext';
import { SearchFilters } from '@/types/user';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  Search as SearchIcon,
  Save as SaveIcon,
  Clock as HistoryIcon,
  X as ClearIcon,
  Filter as FilterIcon
} from 'lucide-react';

interface SearchBarProps {
  onFilterClick?: () => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onFilterClick,
  initialQuery = '',
  initialFilters,
  placeholder = 'Search articles...',
  className = '',
  autoFocus = false
}: SearchBarProps) {
  const { performSearch, isSearching } = useSearch();
  const { searches, saveSearch } = useSavedSearches();
  
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    await performSearch(query, initialFilters);
    setShowSuggestions(false);
  }, [query, initialFilters, performSearch]);

  // Search on debounced query change
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    }
  }, [debouncedQuery, handleSearch]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSaveSearch = () => {
    if (!query.trim()) return;
    saveSearch({
      name: query,
      query,
      filters: initialFilters || {}
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <SearchIcon className="h-5 w-5 text-gray-400 ml-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-black dark:text-white placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ClearIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center ml-2 space-x-2">
          {query && (
            <button
              onClick={handleSaveSearch}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              title="Save search"
            >
              <SaveIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}
          <button
            onClick={onFilterClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Filter results"
          >
            <FilterIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && searches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-10">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Recent Searches
            </h3>
            <ul>
              {searches.slice(0, 5).map((search) => (
                <li key={search.id}>
                  <button
                    onClick={() => {
                      setQuery(search.query);
                      handleSearch();
                    }}
                    className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <HistoryIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {search.query}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div className="absolute top-1/2 right-12 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}