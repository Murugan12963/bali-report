'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserPreferences, SearchFilters, SavedSearch, DEFAULT_USER_PREFERENCES } from '@/types/user';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  saveSearch: (search: Omit<SavedSearch, 'id' | 'dateCreated' | 'lastUsed'>) => void;
  removeSearch: (searchId: string) => void;
  addToReadingHistory: (articleId: string) => void;
  clearReadingHistory: () => void;
  toggleFavoriteTopic: (topic: string) => void;
  logout: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'user_profile';

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (err) {
        setError('Failed to save user profile');
        console.error('Error saving user profile:', err);
      }
    }
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: { ...prev.preferences, ...updates }
      };
    });
  };

  const saveSearch = (search: Omit<SavedSearch, 'id' | 'dateCreated' | 'lastUsed'>) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newSearch: SavedSearch = {
        ...search,
        id: crypto.randomUUID(),
        dateCreated: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          savedSearches: [...(prev.preferences.savedSearches || []), newSearch]
        }
      };
    });
  };

  const removeSearch = (searchId: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          savedSearches: (prev.preferences.savedSearches || []).filter(s => s.id !== searchId)
        }
      };
    });
  };

  const addToReadingHistory = (articleId: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      const history = [articleId, ...prev.preferences.readingHistory];
      // Keep only last 100 articles
      const trimmedHistory = history.slice(0, 100);
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          readingHistory: trimmedHistory
        },
        stats: {
          ...prev.stats,
          articlesRead: prev.stats.articlesRead + 1,
          lastActive: new Date().toISOString()
        }
      };
    });
  };

  const clearReadingHistory = () => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          readingHistory: []
        }
      };
    });
  };

  const toggleFavoriteTopic = (topic: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      const topics = prev.preferences.favoriteTopics;
      const newTopics = topics.includes(topic)
        ? topics.filter(t => t !== topic)
        : [...topics, topic];
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          favoriteTopics: newTopics
        }
      };
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  };

  const value = {
    profile,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    saveSearch,
    removeSearch,
    addToReadingHistory,
    clearReadingHistory,
    toggleFavoriteTopic,
    logout
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

// Hook for user preferences with type safety
export function useUserPreferences() {
  const { profile, updatePreferences } = useUserProfile();
  return {
    preferences: profile?.preferences ?? DEFAULT_USER_PREFERENCES,
    updatePreferences
  };
}

// Hook for saved searches
export function useSavedSearches() {
  const { profile, saveSearch, removeSearch } = useUserProfile();
  return {
    searches: profile?.preferences.savedSearches ?? [],
    saveSearch,
    removeSearch
  };
}

// Hook for reading history
export function useReadingHistory() {
  const { profile, addToReadingHistory, clearReadingHistory } = useUserProfile();
  return {
    history: profile?.preferences.readingHistory ?? [],
    addToReadingHistory,
    clearReadingHistory
  };
}