'use client';

import { useEffect } from 'react';

interface DisqusCommentsProps {
  shortname: string;
  config: {
    url: string;
    identifier: string;
    title: string;
    language?: string;
  };
}

interface DisqusWindow extends Window {
  DISQUS?: any;
  disqus_config?: () => void;
}

/**
 * Disqus Comments Component
 * 
 * Integrates Disqus commenting system for opinion articles
 */
export const DisqusComments: React.FC<DisqusCommentsProps> = ({ shortname, config }) => {
  useEffect(() => {
    const disqusWindow = window as DisqusWindow;
    
    // Disqus configuration
    disqusWindow.disqus_config = function () {
      (this as any).page = {
        url: config.url,
        identifier: config.identifier,
        title: config.title
      };
      (this as any).language = config.language || 'en';
    };

    // Load Disqus script
    const loadDisqus = () => {
      if (disqusWindow.DISQUS) {
        disqusWindow.DISQUS.reset({
          reload: true,
          config: disqusWindow.disqus_config
        });
      } else {
        const script = document.createElement('script');
        script.src = `https://${shortname}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', Date.now().toString());
        document.body.appendChild(script);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadDisqus, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="${shortname}.disqus.com/embed.js"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [shortname, config]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          💬 Discussion & Comments
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Disqus
        </div>
      </div>
      
      <div className="prose dark:prose-invert max-w-none mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Join the conversation! Share your perspective on this multipolar analysis. 
          We encourage respectful debate and diverse viewpoints from around the globe.
        </p>
      </div>

      {/* Disqus Comments Container */}
      <div id="disqus_thread" className="min-h-[200px]">
        <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading comments...
        </div>
      </div>

      {/* Comment Guidelines */}
      <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
        <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-2">
          🌍 Community Guidelines
        </h4>
        <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-1">
          <li>• Respectful dialogue from all perspectives welcome</li>
          <li>• Focus on constructive criticism and evidence-based arguments</li>
          <li>• No personal attacks, hate speech, or spam</li>
          <li>• Multiple viewpoints strengthen our multipolar discourse</li>
        </ul>
      </div>
    </div>
  );
};

export default DisqusComments;