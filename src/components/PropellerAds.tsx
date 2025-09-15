'use client';

import { useEffect } from 'react';

/**
 * PropellerAds component for displaying ads.
 * This is a placeholder implementation for testing.
 */
interface PropellerAdsProps {
  type: 'banner' | 'leaderboard' | 'sidebar' | 'native';
  className?: string;
}

const PropellerAds: React.FC<PropellerAdsProps> = ({ type, className = "" }) => {
  useEffect(() => {
    // In production, this would load the PropellerAds script
    // For now, we'll just show a placeholder
    console.log(`PropellerAds ${type} ad would load here`);
  }, [type]);

  // Development placeholder
  const getAdContent = () => {
    switch (type) {
      case 'banner':
        return {
          dimensions: '728x90',
          position: 'Banner Advertisement'
        };
      case 'leaderboard':
        return {
          dimensions: '728x90',
          position: 'Leaderboard Advertisement'
        };
      case 'sidebar':
        return {
          dimensions: '300x250',
          position: 'Sidebar Advertisement'
        };
      case 'native':
        return {
          dimensions: 'Responsive',
          position: 'Native Advertisement'
        };
      default:
        return {
          dimensions: '300x250',
          position: 'Advertisement'
        };
    }
  };

  const adContent = getAdContent();

  // Show placeholder in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm ${className}`} 
           style={{ 
             minHeight: type === 'banner' || type === 'leaderboard' ? '90px' : '250px',
             width: type === 'sidebar' ? '300px' : '100%'
           }}>
        <div className="text-center p-4">
          <div className="font-medium mb-1">📢 {adContent.position}</div>
          <div className="text-xs text-gray-400">{adContent.dimensions}</div>
          <div className="text-xs text-gray-400 mt-1">PropellerAds Placeholder</div>
        </div>
      </div>
    );
  }

  // Production ad container
  return (
    <div className={`propeller-ads-container ${className}`} data-ad-type={type}>
      {/* PropellerAds script will be injected here in production */}
    </div>
  );
};

export default PropellerAds;