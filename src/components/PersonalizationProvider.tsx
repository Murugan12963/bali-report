'use client';

import { useState, useEffect } from 'react';
import TopicSelector from './TopicSelector';
import { userPreferencesManager } from '@/lib/user-preferences';

interface PersonalizationProviderProps {
  children: React.ReactNode;
}

/**
 * Personalization Provider that manages first-visit modal and user preferences.
 */
export default function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkFirstVisit = () => {
      try {
        const preferences = userPreferencesManager.loadPreferences();
        
        // Show topic selector if:
        // 1. It's the user's first visit, AND
        // 2. They haven't completed setup, AND
        // 3. We're not in a server-side rendering context
        if (preferences.isFirstVisit && !preferences.hasCompletedSetup) {
          console.log('🌺 First-time visitor detected - showing personalization modal');
          setShowTopicSelector(true);
        } else {
          console.log('🏝️ Returning user - personalization already set up');
        }
      } catch (error) {
        console.error('❌ Error checking user preferences:', error);
      }
      
      setIsLoaded(true);
    };

    // Small delay to ensure the page has loaded properly
    const timer = setTimeout(checkFirstVisit, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTopicSelectorComplete = () => {
    console.log('🎉 Topic selector completed');
    setShowTopicSelector(false);
    
    // Optional: trigger a page refresh to apply personalization
    // Or emit an event that components can listen to
    window.dispatchEvent(new CustomEvent('personalizationComplete'));
  };

  // Don't render children until we've checked preferences to prevent flash
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-emerald-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-teal-700 dark:text-teal-300">🌊 Loading tropical paradise...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <TopicSelector 
        isVisible={showTopicSelector} 
        onComplete={handleTopicSelectorComplete}
      />
    </>
  );
}