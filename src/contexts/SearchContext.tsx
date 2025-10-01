"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ContentCategory, UserLanguage, SearchFilters } from "@/types/user";

interface SearchContextType {
  currentFilters: SearchFilters;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string, filters?: SearchFilters) => Promise<void>;
  isSearching: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const defaultFilters: SearchFilters = {
  categories: [],
  dateRange: {},
  sources: [],
  sortOrder: "newest",
  excludeKeywords: [],
  includeKeywords: [],
  languages: [],
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [currentFilters, setCurrentFilters] =
    useState<SearchFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setCurrentFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const clearFilters = () => {
    setCurrentFilters(defaultFilters);
    setSearchQuery("");
  };

  const performSearch = async (query: string, filters?: SearchFilters) => {
    setIsSearching(true);
    setSearchQuery(query);

    if (filters) {
      updateFilters(filters);
    }

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider
      value={{
        currentFilters,
        updateFilters,
        clearFilters,
        searchQuery,
        setSearchQuery,
        performSearch,
        isSearching,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
