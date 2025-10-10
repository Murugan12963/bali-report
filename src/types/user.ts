export type UserRole = 'user' | 'premium' | 'admin';

export type ContentPreference = 'brics' | 'indonesia' | 'bali' | 'economy' | 'politics' | 'culture';

export type UserLanguage = 'en' | 'id';

export type ContentCategory = 'brics' | 'indonesia' | 'bali';

export type SortOrder = 'newest' | 'oldest' | 'relevance';

export interface UserPreferences {
  darkMode: boolean;
  language: UserLanguage;
  contentPreferences: ContentPreference[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  articleDisplay: 'compact' | 'comfortable';
  autoplayVideos: boolean;
  savedSearches?: SavedSearch[];
  readingHistory: string[]; // Article IDs
  favoriteTopics: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  dateCreated: string;
  lastUsed: string;
}

export interface SearchFilters {
  categories?: ContentCategory[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sources?: string[];
  sortOrder?: SortOrder;
  excludeKeywords?: string[];
  includeKeywords?: string[];
  languages?: UserLanguage[];
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  preferences: UserPreferences;
  subscription?: {
    tier: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt: string;
  };
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  stats: {
    articlesRead: number;
    searchesPerformed: number;
    lastActive: string;
    joinDate: string;
  };
}

// Initial preferences when creating a new user profile
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  darkMode: false,
  language: 'en',
  contentPreferences: ['brics', 'indonesia', 'bali'],
  emailNotifications: true,
  pushNotifications: false,
  articleDisplay: 'comfortable',
  autoplayVideos: false,
  savedSearches: [],
  readingHistory: [],
  favoriteTopics: []
};

// Helper function to create a new user profile
export function createUserProfile(
  id: string,
  email: string,
  name?: string
): UserProfile {
  return {
    id,
    email,
    name,
    role: 'user',
    preferences: DEFAULT_USER_PREFERENCES,
    stats: {
      articlesRead: 0,
      searchesPerformed: 0,
      lastActive: new Date().toISOString(),
      joinDate: new Date().toISOString()
    }
  };
}