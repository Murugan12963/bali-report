"use client";

import React, { useState, useEffect } from 'react';
import { pushNotificationService, isPushSupported, getNotificationPermission } from '@/lib/push-notifications';

interface PushNotificationManagerProps {
  className?: string;
  showButton?: boolean;
}

export default function PushNotificationManager({ 
  className = '', 
  showButton = true 
}: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize on component mount
  useEffect(() => {
    setIsClient(true);
    
    const initialize = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      
      if (supported) {
        setPermission(getNotificationPermission());
        
        // Initialize the service
        const initialized = await pushNotificationService.initialize();
        if (initialized) {
          // Check subscription status
          const subscription = await pushNotificationService.getSubscription();
          setIsSubscribed(!!subscription);
        }
      }
    };

    initialize();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const subscription = await pushNotificationService.subscribe();
      setIsSubscribed(!!subscription);
      setPermission(getNotificationPermission());
      
      if (subscription) {
        // Show success notification
        await pushNotificationService.sendTestNotification();
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!isSupported) {
      return '🚫 Push notifications not supported in your browser';
    }
    
    switch (permission) {
      case 'denied':
        return '🔕 Notifications blocked. Enable in browser settings.';
      case 'granted':
        return isSubscribed 
          ? '🔔 Notifications enabled! You\'ll get updates on breaking BRICS news.'
          : '🔔 Ready to enable notifications';
      default:
        return '🔔 Get notified about breaking BRICS news and important updates';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isSubscribed) return 'Disable Notifications';
    return 'Enable Notifications';
  };

  const canSubscribe = isSupported && permission !== 'denied';
  const shouldShowButton = showButton && canSubscribe;

  return (
    <div className={`flex flex-col items-center space-y-4 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm ${className}`}>
      {/* Status Icon */}
      <div className="text-4xl">
        {!isSupported && '🚫'}
        {isSupported && permission === 'denied' && '🔕'}
        {isSupported && permission === 'granted' && isSubscribed && '🔔'}
        {isSupported && permission !== 'denied' && !isSubscribed && '🔔'}
      </div>

      {/* Status Message */}
      <p className="text-sm text-center text-gray-600 dark:text-gray-300 max-w-sm">
        {getStatusMessage()}
      </p>

      {/* Action Button */}
      {shouldShowButton && (
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200
            ${isSubscribed
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-teal-500 hover:bg-teal-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl transform hover:scale-105
          `}
        >
          {getButtonText()}
        </button>
      )}

      {/* Permission Denied Help */}
      {permission === 'denied' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
          <p>To enable notifications:</p>
          <p>• Click the 🔒 lock icon in your browser</p>
          <p>• Change notifications to "Allow"</p>
          <p>• Refresh this page</p>
        </div>
      )}
    </div>
  );
}

// Compact version for header/footer
export function PushNotificationButton({ className = '' }: { className?: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const initialize = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      
      if (supported && getNotificationPermission() === 'granted') {
        await pushNotificationService.initialize();
        const subscription = await pushNotificationService.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    initialize();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      if (isSubscribed) {
        await pushNotificationService.unsubscribe();
        setIsSubscribed(false);
      } else {
        const subscription = await pushNotificationService.subscribe();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  if (!isSupported || getNotificationPermission() === 'denied') {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isSubscribed
          ? 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30'
          : 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
        }
        hover:bg-teal-100 dark:hover:bg-teal-900/30
        disabled:opacity-50
        ${className}
      `}
      title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : isSubscribed ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
    </button>
  );
}