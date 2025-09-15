'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * PropellerAds component for displaying ads.
 * Supports development placeholders and production PropellerAds integration.
 */
interface PropellerAdsProps {
  type: 'banner' | 'leaderboard' | 'sidebar' | 'native' | 'pop-under';
  className?: string;
  zoneId?: string; // PropellerAds zone ID for production
}

const PropellerAds: React.FC<PropellerAdsProps> = ({ 
  type, 
  className = "", 
  zoneId 
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Production PropellerAds integration
    if (process.env.NODE_ENV === 'production' && zoneId) {
      loadPropellerAd();
    } else {
      // Development logging
      console.log(`PropellerAds ${type} ad would load here with zone ID: ${zoneId || 'NOT_SET'}`);
      setIsLoaded(true);
    }
  }, [type, zoneId]);

  /**
   * Load PropellerAds script and initialize ad.
   * 
   * Returns:
   *   void: Initializes PropellerAds in production.
   */
  const loadPropellerAd = async () => {
    try {
      // Check if PropellerAds script is already loaded
      if (!(window as any).PropellerAds) {
        // Load PropellerAds script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/platform.js'; // Replace with actual PropellerAds script URL
        script.async = true;
        script.onload = () => initializeAd();
        script.onerror = () => setHasError(true);
        document.head.appendChild(script);
      } else {
        initializeAd();
      }
    } catch (error) {
      console.error('Failed to load PropellerAds:', error);
      setHasError(true);
    }
  };

  /**
   * Initialize PropellerAds ad unit.
   * 
   * Returns:
   *   void: Creates ad unit in the container.
   */
  const initializeAd = () => {
    try {
      if (adRef.current && zoneId) {
        // PropellerAds initialization code would go here
        // Example: (window as any).PropellerAds.createAd(zoneId, adRef.current);
        console.log(`Initializing PropellerAds ${type} with zone ${zoneId}`);
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to initialize PropellerAds:', error);
      setHasError(true);
    }
  };

  // Get ad configuration based on type
  const getAdConfig = () => {
    switch (type) {
      case 'banner':
        return {
          dimensions: '728x90',
          position: 'Banner Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_BANNER_ZONE
        };
      case 'leaderboard':
        return {
          dimensions: '728x90',
          position: 'Leaderboard Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_LEADERBOARD_ZONE
        };
      case 'sidebar':
        return {
          dimensions: '300x250',
          position: 'Sidebar Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_SIDEBAR_ZONE
        };
      case 'native':
        return {
          dimensions: 'Responsive',
          position: 'Native Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_NATIVE_ZONE
        };
      case 'pop-under':
        return {
          dimensions: 'Full Page',
          position: 'Pop-under Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_POPUNDER_ZONE
        };
      default:
        return {
          dimensions: '300x250',
          position: 'Advertisement',
          defaultZone: process.env.NEXT_PUBLIC_PROPELLER_DEFAULT_ZONE
        };
    }
  };

  const adConfig = getAdConfig();
  const effectiveZoneId = zoneId || adConfig.defaultZone;

  // Error state
  if (hasError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-red-600 text-sm p-4 ${className}`}>
        <div className="text-center">
          <div className="font-medium mb-1">⚠️ Ad Load Error</div>
          <div className="text-xs text-red-500">PropellerAds failed to load</div>
        </div>
      </div>
    );
  }

  // Development placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm ${className}`} 
        style={{ 
          minHeight: type === 'banner' || type === 'leaderboard' ? '90px' : 
                    type === 'pop-under' ? '50px' : '250px',
          width: type === 'sidebar' ? '300px' : '100%'
        }}
        onClick={() => console.log(`Clicked on ${type} ad placeholder`)}
      >
        <div className="text-center p-4 cursor-pointer hover:bg-gray-200 rounded transition-colors">
          <div className="font-medium mb-1">📢 {adConfig.position}</div>
          <div className="text-xs text-gray-400">{adConfig.dimensions}</div>
          <div className="text-xs text-gray-400 mt-1">
            Zone: {effectiveZoneId ? effectiveZoneId.slice(0, 8) + '...' : 'Not Set'}
          </div>
          <div className="text-xs text-green-600 mt-1">✅ PropellerAds Ready</div>
        </div>
      </div>
    );
  }

  // Production ad container
  return (
    <div 
      ref={adRef}
      className={`propeller-ads-container ${className} ${!isLoaded ? 'animate-pulse bg-gray-100' : ''}`} 
      data-ad-type={type}
      data-zone-id={effectiveZoneId}
      style={{
        minHeight: type === 'banner' || type === 'leaderboard' ? '90px' : 
                  type === 'pop-under' ? '0px' : '250px',
        width: type === 'sidebar' ? '300px' : '100%'
      }}
    >
      {!isLoaded && (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          Loading ad...
        </div>
      )}
    </div>
  );
};

export default PropellerAds;