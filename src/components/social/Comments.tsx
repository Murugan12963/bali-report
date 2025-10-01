"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    DISQUS?: any;
    disqus_config?: any;
    page?: {
      url?: string;
      identifier?: string;
      title?: string;
    };
    language?: string;
  }
}

interface CommentsProps {
  url: string;
  identifier: string;
  title: string;
  language?: string;
  className?: string;
}

export function Comments({
  url,
  identifier,
  title,
  language = "en",
  className = "",
}: CommentsProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Load Disqus
    const loadDisqus = () => {
      if (window.DISQUS) {
        // If Disqus is already loaded, just reset it
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = identifier;
            this.page.url = url;
            this.page.title = title;
            this.language = language;
          },
        });
      } else {
        // First time loading Disqus
        window.disqus_config = function () {
          if (this.page) {
            this.page.url = url;
            this.page.identifier = identifier;
            this.page.title = title;
          }
          this.language = language;
        };

        // Inject Disqus script
        const script = document.createElement("script");
        script.src = "https://bali-report.disqus.com/embed.js"; // Replace with your Disqus shortname
        script.setAttribute("data-timestamp", Date.now().toString());
        document.head.appendChild(script);
      }
    };

    loadDisqus();
  }, [url, identifier, title, language]);

  // Update Disqus theme when site theme changes
  useEffect(() => {
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function () {
          if (this.page) {
            this.page.identifier = identifier;
            this.page.url = url;
            this.page.title = title;
          }
          this.language = language;
        },
      });
    }
  }, [theme]);

  return (
    <div className={className}>
      {/* Loading placeholder */}
      <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
        Loading comments...
      </div>

      {/* Disqus thread container */}
      <div id="disqus_thread"></div>

      {/* Fallback for users without JavaScript */}
      <noscript>Please enable JavaScript to view the comments.</noscript>
    </div>
  );
}
