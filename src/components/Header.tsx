'use client';

import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';

/**
 * Header component with Grok-inspired modern navigation and branding.
 */
const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl theme-transition sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Modern Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-75 transition-all duration-200 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <span className="text-white font-bold text-sm">BR</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Bali Report</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Multi-polar News</p>
              </div>
            </Link>
          </div>

          {/* Modern Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Home
              </Link>
              <Link href="/brics" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                BRICS
              </Link>
              <Link href="/indonesia" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Indonesia
              </Link>
              <Link href="/bali" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Bali
              </Link>
              <Link href="/saved" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Saved
              </Link>
            </nav>
            
            {/* Search Bar */}
            <div className="w-80">
              <SearchBar placeholder="Search..." />
            </div>
            
            {/* Theme Switcher */}
            <ThemeSwitcher className="ml-2" />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeSwitcher />
            <button
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;