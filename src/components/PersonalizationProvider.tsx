"use client";

import { useState, useEffect } from "react";
import TopicSelector from "./TopicSelector";
import { userPreferencesManager } from "@/lib/user-preferences";

interface PersonalizationProviderProps {
  children: React.ReactNode;
}

/**
 * Personalization Provider that manages first-visit modal and user preferences.
 * Fixed hydration issue by ensuring consistent server/client rendering.
 */
export default function PersonalizationProvider({
  children,
}: PersonalizationProviderProps) {
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Only run after component is fully mounted to avoid hydration mismatch
    const checkFirstVisit = () => {
      try {
        const preferences = userPreferencesManager.loadPreferences();

        // Show topic selector if:
        // 1. It's the user's first visit, AND
        // 2. They haven't completed setup
        if (preferences.isFirstVisit && !preferences.hasCompletedSetup) {
          console.log(
            "🌺 First-time visitor detected - showing personalization modal",
          );
          setShowTopicSelector(true);
        } else {
          console.log("🏝️ Returning user - personalization already set up");
        }
      } catch (error) {
        console.error("❌ Error checking user preferences:", error);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkFirstVisit, 100);
    
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  const handleTopicSelectorComplete = () => {
    console.log("🎉 Topic selector completed");
    setShowTopicSelector(false);

    // Optional: trigger a page refresh to apply personalization
    // Or emit an event that components can listen to
    window.dispatchEvent(new CustomEvent("personalizationComplete"));
  };

  // Render children immediately, only show topic selector after full mount
  // This prevents hydration mismatch by ensuring server and client render the same initially
  return (
    <>
      {children}
      {mounted && isClient && showTopicSelector && (
        <TopicSelector
          isVisible={showTopicSelector}
          onComplete={handleTopicSelectorComplete}
        />
      )}
    </>
  );
}
