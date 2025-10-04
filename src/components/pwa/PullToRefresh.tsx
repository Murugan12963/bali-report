"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  resistance?: number;
  className?: string;
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  resistance = 2.5,
  className = '',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Check if we can pull (at top of page)
  const checkCanPull = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop || window.scrollY;
      setCanPull(scrollTop <= 0);
    }
  }, []);

  useEffect(() => {
    checkCanPull();
    window.addEventListener('scroll', checkCanPull);
    return () => window.removeEventListener('scroll', checkCanPull);
  }, [checkCanPull]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canPull || isRefreshing) return;
    
    touchStartY.current = e.touches[0].clientY;
    currentY.current = touchStartY.current;
    isDragging.current = true;
  }, [canPull, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !canPull || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - touchStartY.current;
    
    if (deltaY > 0) {
      // Apply resistance to make pulling feel natural
      const pull = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(pull);
      
      // Prevent default scroll when pulling
      if (pull > 10) {
        e.preventDefault();
      }
    }
  }, [canPull, isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || !canPull) return;
    
    isDragging.current = false;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [pullDistance, threshold, canPull, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowRefreshIcon = pullDistance > 20;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isRefreshing ? 'translateY(60px)' : `translateY(${Math.min(pullDistance / 2, 30)}px)`,
        transition: isDragging.current ? 'none' : 'transform 0.3s ease',
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-teal-500/90 to-transparent backdrop-blur-sm"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          opacity: shouldShowRefreshIcon ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div className="flex flex-col items-center justify-center text-white">
          <div
            className={`transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          >
            {isRefreshing ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </div>
          <span className="text-sm mt-1">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= threshold
              ? 'Release to refresh'
              : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}