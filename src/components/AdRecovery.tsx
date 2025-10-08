"use client";

import { useEffect } from "react";

const AdRecovery: React.FC = () => {
  useEffect(() => {
    // Global ad recovery functions
    const initAdRecovery = () => {
      // Override common adblocker detection
      (window as any).canRunAds = true;
      
      // Define ad recovery methods
      const adRecoveryMethods = {
        // Method 1: Reinject blocked scripts
        reinjectScripts: () => {
          const blockedScripts = document.querySelectorAll('script[data-blocked="true"]');
          blockedScripts.forEach((script: Element) => {
            const newScript = document.createElement('script');
            const scriptEl = script as HTMLScriptElement;
            if (scriptEl.src) newScript.src = scriptEl.src;
            if (scriptEl.innerHTML) newScript.innerHTML = scriptEl.innerHTML;
            newScript.async = true;
            document.head.appendChild(newScript);
          });
        },

        // Method 2: Alternative domain loading
        loadAlternativeDomains: () => {
          const alternativeDomains = [
            'displaycontentnetwork.com',
            'highperformanceformats.com',
            'adnxs.com',
            'adsystem.com'
          ];
          
          alternativeDomains.forEach(domain => {
            const testScript = document.createElement('script');
            testScript.src = `https://www.${domain}/test.js`;
            testScript.onerror = () => {
              // Try next domain if current fails
            };
            document.head.appendChild(testScript);
          });
        },

        // Method 3: Dynamic content insertion
        insertDynamicAds: () => {
          const adContainers = document.querySelectorAll('.adsterra-ads');
          adContainers.forEach((container: Element) => {
            if (!container.children.length) {
              const adContent = document.createElement('div');
              adContent.innerHTML = `
                <ins class="adsbygoogle" 
                     style="display:block" 
                     data-ad-client="ca-pub-placeholder"
                     data-ad-slot="placeholder"
                     data-ad-format="auto"></ins>
              `;
              container.appendChild(adContent);
            }
          });
        }
      };

      // Execute recovery methods
      Object.values(adRecoveryMethods).forEach(method => {
        try {
          method();
        } catch (e) {
          console.log('Ad recovery method failed:', e);
        }
      });
    };

    // Anti-adblock bypass techniques
    const bypassAdBlockers = () => {
      // Override common adblock detection variables
      (window as any).adblockDetector = false;
      (window as any).adBlockDetected = false;
      (window as any).AdBlockDetected = false;
      
      // Mock common ad variables
      (window as any).google_ad_client = "active";
      (window as any).googletag = (window as any).googletag || { cmd: [] };
      
      // Override console methods to hide ad-related warnings
      const originalWarn = console.warn;
      console.warn = function(...args) {
        const message = args.join(' ');
        if (!message.includes('adblock') && !message.includes('ad block')) {
          originalWarn.apply(console, args);
        }
      };
    };

    // Initialize recovery systems
    initAdRecovery();
    bypassAdBlockers();

    // Retry failed ads every 5 seconds
    const retryInterval = setInterval(() => {
      const emptyAdContainers = document.querySelectorAll('.adsterra-ads:empty');
      if (emptyAdContainers.length > 0) {
        initAdRecovery();
      }
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(retryInterval);
    };
  }, []);

  return null; // This is a utility component with no UI
};

export default AdRecovery;
