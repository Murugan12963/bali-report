"use client";

import { useEffect, useState } from "react";
import GoogleAds from "./GoogleAds";

interface ContentBasedAdsProps {
  type: "banner" | "leaderboard" | "sidebar" | "native" | "responsive";
  className?: string;
  adSlot?: string;
  minContentWords?: number;
}

/**
 * ContentBasedAds component that only shows ads on pages with sufficient content.
 * This helps prevent "Google-served ads on screens without publisher-content" issues.
 */
const ContentBasedAds: React.FC<ContentBasedAdsProps> = ({
  type,
  className = "",
  adSlot,
  minContentWords = 250,
}) => {
  const [hasEnoughContent, setHasEnoughContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkContentSufficiency = () => {
      try {
        // Get all text content from the page
        const textContent = document.body.innerText || document.body.textContent || "";
        
        // Remove extra whitespace and count words
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        console.log(`Page word count: ${wordCount}, minimum required: ${minContentWords}`);
        
        // Check if page has enough content
        const sufficient = wordCount >= minContentWords;
        setHasEnoughContent(sufficient);
        
        if (!sufficient) {
          console.warn(`AdSense blocked: Page has ${wordCount} words, needs at least ${minContentWords}`);
        }
      } catch (error) {
        console.error("Error checking content sufficiency:", error);
        setHasEnoughContent(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check content after a short delay to ensure page is fully loaded
    const timer = setTimeout(checkContentSufficiency, 1000);
    
    return () => clearTimeout(timer);
  }, [minContentWords]);

  // Don't show ads while checking content or if insufficient content
  if (isLoading || !hasEnoughContent) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex flex-col items-center justify-center text-yellow-600 dark:text-yellow-400 text-sm p-4 theme-transition ${className}`}
        >
          <div className="text-center">
            <div className="font-medium mb-1">
              {isLoading ? "⏳ Checking Content" : "📝 Content Check"}
            </div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400">
              {isLoading 
                ? "Verifying page content..." 
                : `Page needs more content for ads (${minContentWords}+ words)`
              }
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // Show ads only if content is sufficient
  return <GoogleAds type={type} className={className} adSlot={adSlot} />;
};

export default ContentBasedAds;
