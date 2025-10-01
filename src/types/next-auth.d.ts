import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      preferences?: {
        darkMode: boolean;
        language: string;
        contentPreferences: string[];
        emailNotifications: boolean;
        pushNotifications: boolean;
        articleDisplay: string;
        autoplayVideos: boolean;
        readingHistory: string[];
        favoriteTopics: string[];
      };
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    preferences?: {
      darkMode: boolean;
      language: string;
      contentPreferences: string[];
      emailNotifications: boolean;
      pushNotifications: boolean;
      articleDisplay: string;
      autoplayVideos: boolean;
      readingHistory: string[];
      favoriteTopics: string[];
    };
  }
}
