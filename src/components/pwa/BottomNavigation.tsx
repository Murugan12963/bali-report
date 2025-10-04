"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavItem[];
  className?: string;
}

export default function BottomNavigation({ items, className = '' }: BottomNavigationProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = React.useState(true); // Default to true to avoid flash

  // Check if mobile after hydration
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-gray-200 dark:border-zinc-700 md:hidden ${className}`}>
        <div className="flex items-center justify-around px-2 py-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 relative
                  ${isActive 
                    ? 'text-teal-600 dark:text-teal-400 scale-110' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                  }
                `}
                style={{
                  minWidth: '60px',
                  minHeight: '52px',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
                )}
                
                {/* Icon */}
                <div className={`transition-all duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </div>
                
                {/* Label */}
                <span className={`text-xs mt-1 font-medium transition-all duration-200 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Default navigation items for Bali Report
export const defaultNavItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: '/brics',
    label: 'BRICS',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    href: '/indonesia',
    label: 'Indonesia',
    icon: (
      <span className="text-sm font-bold">🇮🇩</span>
    ),
  },
  {
    href: '/saved',
    label: 'Saved',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v16l7-3.5L18 20V4a2 2 0 00-2-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];